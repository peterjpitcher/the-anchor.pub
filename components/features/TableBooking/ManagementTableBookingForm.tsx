'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Button } from '@/components/ui/primitives/Button'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import {
  pushToDataLayer,
  trackTableBookingClick,
  trackTableBookingFunnel,
} from '@/lib/gtm-events'
import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_POLICY_COPY,
  requiresDeposit,
} from '@/lib/constants'
import {
  formatTimeNoSeconds,
  getEffectiveDayHours,
  isKitchenClosed,
  isVenueClosed,
} from '@/lib/hours-utils'
import { PayPalDepositSection } from './PayPalDepositSection'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type BookingPurpose = 'food' | 'drinks'
type LookupState = 'idle' | 'loading' | 'known' | 'unknown'
type BookingStep = 'find' | 'choose' | 'details' | 'review'

type CustomerLookupResult = {
  known: boolean
  lookup_degraded?: boolean
  normalized_phone?: string
  customer?: {
    id?: string
    first_name?: string | null
    last_name?: string | null
    full_name?: string | null
    email?: string | null
    mobile_e164?: string | null
    mobile_number?: string | null
  } | null
}

type ManagementTableBookingResult = {
  state: 'confirmed' | 'pending_payment' | 'blocked'
  table_booking_id: string | null
  booking_reference: string | null
  reason: string | null
  blocked_reason:
    | 'outside_hours'
    | 'cut_off'
    | 'no_table'
    | 'private_booking_blocked'
    | 'too_large_party'
    | 'customer_conflict'
    | 'in_past'
    | 'blocked'
    | null
  next_step_url: string | null
  hold_expires_at: string | null
  table_name: string | null
  booking_id?: string
  deposit_amount?: number
  // Set by the management API when inline PayPal setup fails for a 10+ booking.
  // Surfaced to the customer as a recovery link alongside the call-us copy.
  // See spec §6 ("Failed-PayPal recovery") and §8.1 (PayPal failure recovery).
  fallback_payment_url?: string | null
  payment_required?: boolean
}

type AvailabilitySlot = {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
}

type AvailabilityData = {
  date: string
  available: boolean
  time_slots: AvailabilitySlot[]
  message?: string
  special_notes?: string
}

type AlternativeSlot = {
  date: string
  time: string
}

type SuggestedEvent = {
  id: string
  slug: string | null
  name: string
  startDate: string
  shortDescription: string | null
  seatsRemaining: number | null
  priceLabel: string | null
}

interface ManagementTableBookingFormProps {
  prefill?: {
    date?: string
    time?: string
    partySize?: number
    purpose?: BookingPurpose
  }
}

const STEP_ORDER: BookingStep[] = ['find', 'choose', 'details', 'review']

const STEP_LABELS: Record<BookingStep, string> = {
  find: 'Find table',
  choose: 'Choose time',
  details: 'Guest details',
  review: 'Review & book'
}

const BLOCKED_REASON_COPY: Record<string, string> = {
  outside_hours: 'That time is outside our booking hours. Please choose another time or call us.',
  cut_off: 'Online bookings for that slot are now closed. Please call us and we will try to help.',
  no_table: 'No tables available at that time. Try a different time or give us a call on 01753 682707.',
  private_booking_blocked: 'This slot is unavailable because of a private event.',
  too_large_party: 'For larger groups, please call us so we can arrange your booking.',
  customer_conflict: 'You already have a nearby booking. Please call us if you need help changing it.',
  in_past: 'That booking time is in the past. Please choose a future date and time.',
  blocked: 'This slot is not available for online booking right now.'
}

function toIsoDateInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function getDefaultTimeValue(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 60)
  const roundedMinutes = now.getMinutes() >= 30 ? 30 : 0
  now.setMinutes(roundedMinutes, 0, 0)
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function toTimeInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
  return ''
}

function formatHoldExpiry(value: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Europe/London'
  })
}

function formatGbpCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value)
}

function createClientIdempotencyKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function parseLookupResponse(payload: any): CustomerLookupResult {
  const data = payload?.data || payload
  return {
    known: Boolean(data?.known),
    lookup_degraded: Boolean(data?.lookup_degraded),
    normalized_phone: data?.normalized_phone,
    customer: data?.customer || null
  }
}

function normalizeAvailabilityResponse(payload: any): AvailabilityData {
  const data = payload?.data || payload
  const rawSlots: unknown[] = Array.isArray(data?.time_slots) ? data.time_slots : []

  const timeSlots: AvailabilitySlot[] = []
  for (const slot of rawSlots) {
    if (!slot || typeof slot !== 'object') continue

    const source = slot as Record<string, unknown>
    const time = toTimeInputValue(typeof source.time === 'string' ? source.time : '')
    if (!time) continue

    const rawCapacity = source.available_capacity
    const parsedCapacity =
      typeof rawCapacity === 'number'
        ? rawCapacity
        : typeof rawCapacity === 'string'
        ? Number.parseInt(rawCapacity, 10)
        : 0

    const availableCapacity = Number.isFinite(parsedCapacity) ? parsedCapacity : 0
    const available =
      typeof source.available === 'boolean' ? source.available : availableCapacity > 0

    timeSlots.push({
      time,
      available,
      available_capacity: availableCapacity,
      reason: typeof source.reason === 'string' ? source.reason : undefined
    })
  }

  return {
    date: typeof data?.date === 'string' ? data.date : '',
    available: Boolean(data?.available) || timeSlots.some((slot) => slot.available === true),
    time_slots: timeSlots,
    message: typeof data?.message === 'string' ? data.message : undefined,
    special_notes: typeof data?.special_notes === 'string' ? data.special_notes : undefined
  }
}

function isSlotAvailable(slot: AvailabilitySlot, partySize: number): boolean {
  if (typeof slot.available === 'boolean') {
    return slot.available && slot.available_capacity >= partySize
  }
  return slot.available_capacity >= partySize
}

function toMinutes(time: string): number {
  const normalized = toTimeInputValue(time)
  const [hoursRaw, minutesRaw] = normalized.split(':')
  const hours = Number.parseInt(hoursRaw || '0', 10)
  const minutes = Number.parseInt(minutesRaw || '0', 10)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
  return hours * 60 + minutes
}

function pickClosestSlot(slots: AvailabilitySlot[], requestedTime: string, partySize: number): string | null {
  const availableSlots = slots.filter((slot) => isSlotAvailable(slot, partySize))
  if (availableSlots.length === 0) return null

  const targetMinutes = toMinutes(requestedTime)
  const closest = availableSlots.reduce<{ slot: AvailabilitySlot; distance: number }>((current, slot) => {
    const distance = Math.abs(toMinutes(slot.time) - targetMinutes)
    if (!current || distance < current.distance) {
      return { slot, distance }
    }
    return current
  }, null as any)

  return closest?.slot?.time || availableSlots[0]?.time || null
}

function formatDateForDisplay(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function formatTimeForDisplay(time: string): string {
  const normalized = toTimeInputValue(time)
  if (!normalized) return time
  const [hoursRaw, minutesRaw] = normalized.split(':')
  const hours = Number.parseInt(hoursRaw || '0', 10)
  const minutes = Number.parseInt(minutesRaw || '0', 10)
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHour = hours % 12 || 12
  return minutes === 0 ? `${displayHour}${period}` : `${displayHour}:${String(minutes).padStart(2, '0')}${period}`
}

function addDays(isoDate: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

function getLondonIsoDate(dateTimeValue: string): string | null {
  const parsed = new Date(dateTimeValue)
  if (Number.isNaN(parsed.getTime())) return null

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(parsed)
}

function formatEventTimeLabel(dateTimeValue: string): string {
  const parsed = new Date(dateTimeValue)
  if (Number.isNaN(parsed.getTime())) return 'Time TBC'

  return parsed.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Europe/London'
  })
}

function formatEventPriceLabel(value: unknown, currency?: string): string | null {
  const parsedValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number.parseFloat(value)
      : Number.NaN

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) return null

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP'
  }).format(parsedValue)
}

function normalizeSuggestedEvents(payload: any, targetDate: string): SuggestedEvent[] {
  const root = payload?.data || payload
  const rawEvents: unknown[] = Array.isArray(root?.events)
    ? root.events
    : Array.isArray(root)
    ? root
    : []

  const normalized: SuggestedEvent[] = []

  for (const rawEvent of rawEvents) {
    if (!rawEvent || typeof rawEvent !== 'object') continue
    const source = rawEvent as Record<string, unknown>

    const id = typeof source.id === 'string' ? source.id.trim() : ''
    if (!id) continue

    const name = typeof source.name === 'string' ? source.name.trim() : ''
    if (!name) continue

    const startDate =
      typeof source.startDate === 'string'
        ? source.startDate
        : typeof source.start_date === 'string'
        ? source.start_date
        : ''
    if (!startDate) continue

    if (getLondonIsoDate(startDate) !== targetDate) continue

    const status =
      typeof source.eventStatus === 'string'
        ? source.eventStatus
        : typeof source.event_status === 'string'
        ? source.event_status
        : ''

    if (status.toLowerCase().includes('cancel')) continue

    const shortDescription =
      typeof source.shortDescription === 'string'
        ? source.shortDescription
        : typeof source.description === 'string'
        ? source.description
        : null
    const time =
      typeof source.time === 'string'
        ? source.time
        : typeof source.start_time === 'string'
        ? source.start_time
        : null

    const offers =
      source.offers && typeof source.offers === 'object'
        ? (source.offers as Record<string, unknown>)
        : null

    const remainingAttendeeCapacityRaw =
      typeof source.remainingAttendeeCapacity === 'number'
        ? source.remainingAttendeeCapacity
        : typeof source.remainingAttendeeCapacity === 'string'
        ? Number.parseInt(source.remainingAttendeeCapacity, 10)
        : typeof source.remaining_attendee_capacity === 'number'
        ? source.remaining_attendee_capacity
        : typeof source.remaining_attendee_capacity === 'string'
        ? Number.parseInt(source.remaining_attendee_capacity, 10)
        : Number.NaN

    normalized.push({
      id,
      slug: typeof source.slug === 'string' && source.slug.trim().length > 0 ? source.slug.trim() : null,
      name,
      startDate,
      shortDescription,
      seatsRemaining: Number.isFinite(remainingAttendeeCapacityRaw)
        ? Number(remainingAttendeeCapacityRaw)
        : null,
      priceLabel: formatEventPriceLabel(
        offers?.price,
        typeof offers?.priceCurrency === 'string' ? offers.priceCurrency : 'GBP'
      )
    })
  }

  return normalized.sort((left, right) => {
    const leftTime = Date.parse(left.startDate)
    const rightTime = Date.parse(right.startDate)
    return leftTime - rightTime
  })
}

function BookingProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const pct = Math.round((currentStep / totalSteps) * 100)
  const isAlmostDone = currentStep >= totalSteps - 1

  return (
    <div className="mb-4" aria-live="polite">
      <div className="flex justify-between text-xs text-anchor-cream-text/50 mb-1">
        <span>Step {currentStep} of {totalSteps}</span>
        {isAlmostDone && (
          <span className="text-anchor-gold-vivid font-medium">Almost there!</span>
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-anchor-bg-raised">
        <div
          className="h-1.5 rounded-full bg-anchor-green transition-all duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`Booking step ${currentStep} of ${totalSteps}`}
        />
      </div>
    </div>
  )
}

export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFormProps) {
  // Trigger re-renders so time-based cutoffs update without requiring a reload.
  // (Retained because the LaunchAnnouncement, hold-expiry and other time-derived
  // surfaces benefit from a periodic tick; the legacy Sunday-lunch / Mother's-Day
  // cutoff calculations that originally drove this have been retired in §8.1.)
  const [, setNow] = useState(() => new Date())
  useEffect(() => {
    if (typeof window === 'undefined') return
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(intervalId)
  }, [])

  // Booking source from `?source=...` query param (e.g. `sunday_lunch_hero`).
  // Defaults to `'direct'` so every funnel event always carries a source.
  const searchParams = useSearchParams()
  const bookingSource = useMemo(() => {
    const raw = searchParams?.get('source')?.trim()
    return raw && raw.length > 0 ? raw.slice(0, 80) : 'direct'
  }, [searchParams])

  // Funnel tracking lifecycle:
  //  - `view` fires once on mount
  //  - `start` fires once on the first user interaction (any field)
  //  - `submit` / `success` / `error` fire from the booking submit handler
  const hasViewedRef = useRef(false)
  const hasInteractedRef = useRef(false)
  const getDeviceType = (): 'mobile' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop'
    return window.innerWidth < 768 ? 'mobile' : 'desktop'
  }

  useEffect(() => {
    if (typeof window === 'undefined' || hasViewedRef.current) return
    hasViewedRef.current = true
    trackTableBookingFunnel({
      step: 'view',
      source: bookingSource,
      deviceType: getDeviceType(),
    })
    // bookingSource is stable for the lifetime of the form (URL doesn't change
    // between mount and unmount in our flow). Listed for lint clarity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function markFunnelStart() {
    if (hasInteractedRef.current) return
    hasInteractedRef.current = true
    trackTableBookingFunnel({
      step: 'start',
      source: bookingSource,
      deviceType: getDeviceType(),
    })
  }

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const defaultDate = toIsoDateInputValue(prefill?.date) || today
  const defaultRequestedTime = toTimeInputValue(prefill?.time) || getDefaultTimeValue()
  const defaultPartySize = Math.min(Math.max(prefill?.partySize || 2, 1), 20)

  const [step, setStep] = useState<BookingStep>('find')

  const [partySize, setPartySize] = useState(defaultPartySize)
  const [partySizeDisplay, setPartySizeDisplay] = useState(String(defaultPartySize))
  const [date, setDate] = useState(defaultDate)
  const [requestedTime, setRequestedTime] = useState(defaultRequestedTime)
  const [selectedTime, setSelectedTime] = useState<string>('')

  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [alternativeSlots, setAlternativeSlots] = useState<AlternativeSlot[]>([])
  const [alternativesLoading, setAlternativesLoading] = useState(false)
  const [drinksAlternative, setDrinksAlternative] = useState<{
    available: boolean
    slotCount: number
  } | null>(null)
  const [eventsByDate, setEventsByDate] = useState<Record<string, SuggestedEvent[]>>({})
  const [eventErrorsByDate, setEventErrorsByDate] = useState<Record<string, string>>({})
  const [eventsLoadingDate, setEventsLoadingDate] = useState<string | null>(null)
  const [dismissedEventDates, setDismissedEventDates] = useState<string[]>([])
  const [selectedSuggestedEvent, setSelectedSuggestedEvent] = useState<SuggestedEvent | null>(null)
  const previousDateRef = useRef(date)
  const availabilityControllerRef = useRef<AbortController | null>(null)

  const [phone, setPhone] = useState('')
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [knownCustomer, setKnownCustomer] = useState<CustomerLookupResult['customer']>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupDegraded, setLookupDegraded] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [purpose, setPurpose] = useState<BookingPurpose>(prefill?.purpose || 'food')
  const [notes, setNotes] = useState('')

  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [bookingIdForPayment, setBookingIdForPayment] = useState<string | null>(null)
  const [depositAmountForPayment, setDepositAmountForPayment] = useState<number>(0)
  const [paymentState, setPaymentState] = useState<'idle' | 'confirmed' | 'error'>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const [website, setWebsite] = useState('')
  const formLoadedAt = useRef(Date.now())
  const [result, setResult] = useState<ManagementTableBookingResult | null>(null)

  const holdExpiry = formatHoldExpiry(result?.hold_expires_at || null)
  // Sunday lunch as a separate booking type, the Saturday-1pm cutoff, the
  // dedicated Mother's Day mode, and the Sunday menu pre-order flow are all
  // retired with the walk-in launch (spec §6, §7.8, §8.1). Sundays are now
  // regular food bookings; deposit gating is purely group-size based (10+).
  const requiresGroupDeposit = requiresDeposit(partySize)
  const groupDepositAmount = requiresGroupDeposit ? partySize * LARGE_GROUP_DEPOSIT_PER_PERSON_GBP : 0
  const detailsUnlocked = lookupState === 'known' || lookupState === 'unknown'
  const isKnownCustomer = lookupState === 'known'
  const selectedDateEvents = eventsByDate[date] || []
  const selectedDateEventsLoading = eventsLoadingDate === date
  const selectedDateEventError = eventErrorsByDate[date] || null
  const hideDateEventSuggestions = dismissedEventDates.includes(date)
  const showDateEventSuggestions = !hideDateEventSuggestions && selectedDateEvents.length > 0

  const currentStepIndex = STEP_ORDER.indexOf(step)
  const availableSlots = useMemo(
    () =>
      (availability?.time_slots || []).filter((slot) => isSlotAvailable(slot, partySize)),
    [availability?.time_slots, partySize]
  )

  // Date-aware bar / kitchen hours summary, shown above the party-size
  // field on the Find step. Pulls from the global BusinessHoursProvider
  // so we benefit from the same caching as the header status bar; falls
  // back to null while hours are still loading or the date is invalid.
  const businessHoursContext = useBusinessHoursContext()
  const businessHours = businessHoursContext?.hours ?? null
  const hoursNote = useMemo(() => {
    if (!businessHours || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

    const effective = getEffectiveDayHours(
      date,
      businessHours.regularHours,
      businessHours.specialHours
    )

    if (isVenueClosed(effective)) {
      return {
        summary: "We're closed all day on this date.",
        footer: 'Please pick another date when we’re open.'
      }
    }

    const barRange =
      effective.opens && effective.closes
        ? `${formatTimeNoSeconds(effective.opens)}–${formatTimeNoSeconds(effective.closes)}`
        : null

    const kitchen = effective.kitchen
    const kitchenIsClosed = isKitchenClosed(effective)
    let kitchenRange: string | null = null
    if (
      !kitchenIsClosed &&
      kitchen &&
      typeof kitchen === 'object' &&
      'opens' in kitchen &&
      'closes' in kitchen
    ) {
      const k = kitchen as { opens?: string; closes?: string }
      if (k.opens && k.closes) {
        kitchenRange = `${formatTimeNoSeconds(k.opens)}–${formatTimeNoSeconds(k.closes)}`
      }
    }

    const parts: string[] = []
    if (barRange) parts.push(`Bar open ${barRange}`)
    if (kitchenIsClosed) parts.push('Kitchen closed today')
    else if (kitchenRange) parts.push(`Kitchen open ${kitchenRange}`)

    if (parts.length === 0) return null

    return {
      summary: parts.join(' · '),
      footer:
        'Tables booked here are for dining — you’re welcome to come in any time during bar hours for a drink first, no booking needed.'
    }
  }, [date, businessHours])

  useEffect(() => {
    if (previousDateRef.current === date) {
      return
    }

    previousDateRef.current = date
  }, [date])

  useEffect(() => {
    if (result?.state !== 'pending_payment' || !result.booking_id) return

    setBookingIdForPayment(result.booking_id)
    setDepositAmountForPayment(result.deposit_amount ?? 0)
    setPaypalOrderId(null)
    setPaymentState('idle')
    setPaymentError(null)

    fetch('/api/table-bookings/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: result.booking_id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.orderId) {
          setPaypalOrderId(data.orderId)
        } else {
          setPaymentError(data.error ?? 'Unable to set up payment. Please try again or call us.')
          setPaymentState('error')
        }
      })
      .catch(() => {
        setPaymentError('Unable to set up payment. Please try again or call us.')
        setPaymentState('error')
      })
  }, [result?.state, result?.booking_id, result?.deposit_amount])

  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return
    }

    if (Object.prototype.hasOwnProperty.call(eventsByDate, date)) {
      return
    }

    let cancelled = false

    async function loadDateEvents() {
      setEventsLoadingDate(date)
      setEventErrorsByDate((previous) => {
        const next = { ...previous }
        delete next[date]
        return next
      })

      try {
        const params = new URLSearchParams({
          from_date: date,
          limit: '36',
          available_only: 'true'
        })

        const response = await fetch(`/api/events?${params.toString()}`, {
          cache: 'no-store'
        })

        const body = await response.json()

        if (!response.ok || body?.success === false) {
          throw new Error(
            body?.error?.message ||
              body?.error ||
              'We could not load event suggestions right now.'
          )
        }

        const normalized = normalizeSuggestedEvents(body, date).slice(0, 6)

        if (!cancelled) {
          setEventsByDate((previous) => ({
            ...previous,
            [date]: normalized
          }))
        }
      } catch (eventError: any) {
        if (!cancelled) {
          setEventsByDate((previous) => ({
            ...previous,
            [date]: []
          }))
          setEventErrorsByDate((previous) => ({
            ...previous,
            [date]:
              eventError?.message ||
              'We could not load event suggestions right now.'
          }))
        }
      } finally {
        // Always clear this specific date's loading state, even if the effect was cleaned up.
        setEventsLoadingDate((current) => (current === date ? null : current))
      }
    }

    void loadDateEvents()

    return () => {
      cancelled = true
    }
  }, [date, eventsByDate])

  async function fetchAvailabilityForDate(
    targetDate: string,
    targetTime: string,
    targetPurpose: BookingPurpose,
    signal?: AbortSignal
  ): Promise<AvailabilityData> {
    const params = new URLSearchParams({
      date: targetDate,
      party_size: String(partySize),
      time: targetTime,
      purpose: targetPurpose
    })

    const response = await fetch(`/api/table-bookings/availability?${params.toString()}`, {
      cache: 'no-store',
      signal
    })

    const body = await response.json()

    if (!response.ok || body?.success === false) {
      const message =
        body?.error?.message ||
        body?.error ||
        'We could not check availability right now. Please try again.'
      throw new Error(message)
    }

    return normalizeAvailabilityResponse(body)
  }

  async function loadNearestAlternatives(targetDate: string, targetTime: string, targetPurpose: BookingPurpose) {
    setAlternativesLoading(true)
    setAlternativeSlots([])

    try {
      const dateCandidates = [1, 2, 3].map((offset) => addDays(targetDate, offset))
      const candidateResponses = await Promise.all(
        dateCandidates.map(async (candidateDate) => {
          try {
            return await fetchAvailabilityForDate(candidateDate, targetTime, targetPurpose)
          } catch {
            return null
          }
        })
      )

      const alternatives: AlternativeSlot[] = []
      for (const response of candidateResponses) {
        if (!response) continue

        const slots = response.time_slots
          .filter((slot) => isSlotAvailable(slot, partySize))
          .slice(0, 2)
          .map((slot) => ({ date: response.date || targetDate, time: slot.time }))

        alternatives.push(...slots)
        if (alternatives.length >= 6) {
          break
        }
      }

      setAlternativeSlots(alternatives.slice(0, 6))
    } finally {
      setAlternativesLoading(false)
    }
  }

  async function runAvailabilitySearch(input: {
    targetDate: string
    targetTime: string
    targetPurpose: BookingPurpose
    source: string
    context: string
    signal?: AbortSignal
  }) {
    if (!input.targetDate || !input.targetTime) {
      throw new Error('Please choose a date and time first.')
    }

    trackTableBookingClick({
      source: input.source,
      destination: '/api/table-bookings/availability',
      context: input.context
    })

    const availabilityData = await fetchAvailabilityForDate(
      input.targetDate,
      input.targetTime,
      input.targetPurpose,
      input.signal
    )
    const closestTime = pickClosestSlot(availabilityData.time_slots, input.targetTime, partySize)

    setDate(input.targetDate)
    setRequestedTime(input.targetTime)
    setAvailability(availabilityData)
    setSelectedTime(closestTime || '')
    setStep('choose')

    if (!closestTime) {
      void loadNearestAlternatives(input.targetDate, input.targetTime, input.targetPurpose)

      // Auto-check drinks availability when food returns no slots
      if (input.targetPurpose === 'food') {
        try {
          const drinksData = await fetchAvailabilityForDate(
            input.targetDate,
            input.targetTime,
            'drinks',
            input.signal
          )
          const drinksSlots = (drinksData.time_slots || []).filter((s) => isSlotAvailable(s, partySize))
          setDrinksAlternative({
            available: drinksSlots.length > 0,
            slotCount: drinksSlots.length
          })
        } catch {
          setDrinksAlternative(null)
        }
      }
    }
  }

  async function handleFindTable() {
    // Sync partySizeDisplay → partySize on submit in case blur hasn't fired
    const parsedSize = Number.parseInt(partySizeDisplay, 10)
    const clampedSize = (!Number.isFinite(parsedSize) || parsedSize < 1) ? 1 : Math.min(parsedSize, 20)
    setPartySize(clampedSize)
    setPartySizeDisplay(String(clampedSize))

    // Reject past dates before hitting the API.
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const todayMidnight = new Date()
      todayMidnight.setHours(0, 0, 0, 0)
      const selectedDate = new Date(date + 'T00:00:00')
      if (selectedDate < todayMidnight) {
        setDateError('Please select a future date')
        return
      }
    }

    // Cancel any in-flight availability request before starting a new one.
    availabilityControllerRef.current?.abort()
    const controller = new AbortController()
    availabilityControllerRef.current = controller

    setAvailabilityError(null)
    setError(null)
    setResult(null)
    setAvailabilityLoading(true)
    setAlternativeSlots([])
    setDrinksAlternative(null)

    try {
      await runAvailabilitySearch({
        targetDate: date,
        targetTime: requestedTime,
        targetPurpose: purpose,
        source: 'book_table_find_table',
        context: `availability_first_${purpose}`,
        signal: controller.signal
      })
    } catch (availabilityFailure: unknown) {
      if (availabilityFailure instanceof Error && availabilityFailure.name === 'AbortError') return
      setAvailability(null)
      setAvailabilityError(
        (availabilityFailure instanceof Error ? availabilityFailure.message : null) ||
          'We could not check availability right now. Please try again or call us at 01753 682707.'
      )
    } finally {
      setAvailabilityLoading(false)
    }
  }

  function handleBookSuggestedEvent(event: SuggestedEvent, context: string) {
    const eventDate = getLondonIsoDate(event.startDate) || date

    // Keep focus on the selected booking path once an event is chosen.
    dismissEventSuggestionsFor(eventDate)
    setSelectedSuggestedEvent(event)
    setAvailabilityError(null)
    setError(null)
    setResult(null)

    trackTableBookingClick({
      source: 'book_table_event_suggestion',
      destination: '/api/event-bookings',
      context
    })
  }

  function handleSlotSelect(slotTime: string) {
    setSelectedTime(slotTime)
    setRequestedTime(slotTime)
    trackTableBookingClick({
      source: 'book_table_slot_selected',
      context: 'availability_step'
    })
  }

  function handleChooseAlternative(alternative: AlternativeSlot) {
    setDate(alternative.date)
    setRequestedTime(alternative.time)
    setSelectedTime(alternative.time)
    setStep('details')
    setError(null)
  }

  function handleBackToFind() {
    setStep('find')
    setError(null)
  }

  function handleBackToChoose() {
    setStep('choose')
    setError(null)
  }

  function dismissEventSuggestionsForDate() {
    setDismissedEventDates((previous) => {
      if (previous.includes(date)) return previous
      return [...previous, date]
    })
  }

  function dismissEventSuggestionsFor(targetDate: string) {
    setDismissedEventDates((previous) => {
      if (previous.includes(targetDate)) return previous
      return [...previous, targetDate]
    })
  }

  function handleDateChange(value: string) {
    markFunnelStart()
    setDate(value)
    setAvailability(null)
    setAlternativeSlots([])
    setSelectedTime('')
    setDrinksAlternative(null)
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const todayMidnight = new Date()
      todayMidnight.setHours(0, 0, 0, 0)
      const selectedDate = new Date(value + 'T00:00:00')
      if (selectedDate < todayMidnight) {
        setDateError('Please select a future date')
      } else {
        setDateError(null)
      }
    } else {
      setDateError(null)
    }
  }

  function handlePurposeSelection(nextPurpose: BookingPurpose) {
    if (nextPurpose === purpose) return

    markFunnelStart()
    setPurpose(nextPurpose)
    setDrinksAlternative(null)

    setSelectedTime('')
    setAvailability(null)
    setAvailabilityError(null)
    setAlternativeSlots([])
    setError(null)
  }

  function renderDateEventSuggestions(options: {
    title: string
    description: string
    context: string
    highlight?: boolean
  }) {
    if (hideDateEventSuggestions) {
      return null
    }

    if (selectedDateEventsLoading) {
      return (
        <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4 text-sm text-anchor-cream-text/70">
          Checking events on {formatDateForDisplay(date)}...
        </div>
      )
    }

    // No events for this date → render nothing (avoid distracting empty
    // placeholder; user explicitly asked us to omit this when there's
    // nothing to suggest).
    if (selectedDateEvents.length === 0) {
      return null
    }

    return (
      <div
        className={`rounded-xl border p-4 ${
          options.highlight
            ? 'border-anchor-gold/30 bg-anchor-gold/10'
            : 'border-anchor-gold/15 bg-anchor-bg-raised'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-anchor-gold-vivid">{options.title}</p>
            <p className="mt-1 text-sm text-anchor-cream-text/70">{options.description}</p>
            <p className="mt-1 text-xs text-anchor-cream-text/60">Tap an event below to book it without leaving this page.</p>
          </div>
          <button
            type="button"
            onClick={dismissEventSuggestionsForDate}
            className="text-xs font-medium text-anchor-cream-text/60 underline hover:text-anchor-cream-text/80"
          >
            Hide
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {selectedDateEvents.map((event) => {
            return (
              <div
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-anchor-gold/15 bg-anchor-bg-card px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-anchor-cream-text">{event.name}</p>
                  <p className="mt-1 text-xs text-anchor-cream-text/70">
                    {formatEventTimeLabel(event.startDate)}
                    {event.priceLabel ? ` • ${event.priceLabel}` : ' • Free entry'}
                    {typeof event.seatsRemaining === 'number'
                      ? ` • ${event.seatsRemaining} seat${event.seatsRemaining === 1 ? '' : 's'} left`
                      : ''}
                  </p>
                  {event.shortDescription ? (
                    <p className="mt-1 text-xs text-anchor-cream-text/60 line-clamp-2">{event.shortDescription}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={options.highlight ? 'primary' : 'outline'}
                  className="w-full sm:w-auto"
                  onClick={() => {
                    handleBookSuggestedEvent(event, options.context)
                  }}
                >
                  Book this event
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  async function handlePhoneLookup() {
    setLookupError(null)
    setError(null)
    setLookupDegraded(false)

    if (!phone.trim()) {
      setLookupError('Please enter your mobile number first.')
      return
    }

    setLookupState('loading')

    try {
      const params = new URLSearchParams({ phone: phone.trim(), default_country_code: '44' })
      const response = await fetch(`/api/customers/lookup?${params.toString()}`, { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok || payload?.success === false) {
        const message =
          payload?.error?.message || payload?.error || 'Unable to verify this number right now. Please try again.'
        throw new Error(message)
      }

      const lookup = parseLookupResponse(payload)

      if (lookup.known) {
        setLookupState('known')
        setKnownCustomer(lookup.customer || null)
        setLookupDegraded(false)
        if (lookup.customer?.first_name) {
          setFirstName(String(lookup.customer.first_name))
        }
        if (lookup.customer?.last_name) {
          setLastName(String(lookup.customer.last_name))
        }
        if (lookup.customer?.email) {
          setEmail(String(lookup.customer.email))
        }
      } else {
        setLookupState('unknown')
        setKnownCustomer(null)
        setLookupDegraded(Boolean(lookup.lookup_degraded))
      }
    } catch (lookupFailure: any) {
      setLookupState('idle')
      setLookupError(lookupFailure?.message || 'Unable to verify this number right now.')
      setLookupDegraded(false)
    }
  }

  function resetPhoneLookup() {
    setLookupState('idle')
    setKnownCustomer(null)
    setLookupError(null)
    setLookupDegraded(false)
    setFirstName('')
    setLastName('')
    setEmail('')
    setError(null)
  }

  function validateDetailsStep(): boolean {
    if (!selectedTime) {
      setStep('choose')
      setError('Please select a time before continuing.')
      return false
    }

    if (!phone.trim()) {
      setError('Please enter your mobile number.')
      return false
    }

    if (!detailsUnlocked) {
      setError('Please verify your mobile number first.')
      return false
    }

    if (!isKnownCustomer && (!firstName.trim() || !lastName.trim())) {
      setError('Please enter your first name and last name.')
      return false
    }

    return true
  }

  function handleContinueToReview() {
    setError(null)

    if (!validateDetailsStep()) {
      return
    }

    trackTableBookingClick({
      source: 'book_table_details_complete',
      context: 'details_step'
    })

    setStep('review')
  }

  async function handleConfirmBooking() {
    setError(null)
    setResult(null)

    if (!validateDetailsStep()) {
      return
    }

    if (!policyAccepted) {
      setError('Please confirm you understand the booking and no-show policy before continuing.')
      return
    }

    const trimmedPhone = phone.trim()
    const resolvedFirstName = firstName.trim()
    const resolvedLastName = lastName.trim()
    const resolvedEmail = (isKnownCustomer ? knownCustomer?.email : email.trim()) || undefined
    const idempotencyKey = createClientIdempotencyKey('tbl_web')

    setLoading(true)

    trackTableBookingClick({
      source: 'book_table_management_form',
      context: 'regular',
      destination: '/api/table-bookings'
    })

    // Funnel: submit attempt. Fired here (not in `try`) so it lands even if
    // the request never makes it to the server (e.g. offline).
    trackTableBookingFunnel({
      step: 'submit',
      partySize,
      bookingDate: date,
      bookingTime: selectedTime,
      source: bookingSource,
      deviceType: getDeviceType(),
    })

    try {
      // Public payload no longer carries sunday_lunch / menu_selections / booking_type.
      // The proxy at /api/table-bookings strips these defensively (spec §6, §8.1)
      // and always forwards booking_type='regular' to the management API.
      const payload = {
        phone: trimmedPhone,
        default_country_code: '44',
        ...(resolvedFirstName ? { first_name: resolvedFirstName } : {}),
        ...(resolvedLastName ? { last_name: resolvedLastName } : {}),
        ...(resolvedEmail ? { email: resolvedEmail } : {}),
        date,
        time: selectedTime,
        party_size: partySize,
        purpose,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
        ...(website ? { website } : {}),
        _t: Math.floor((Date.now() - formLoadedAt.current) / 1000)
      }

      const response = await fetch('/api/table-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      })

      const body = await response.json()
      const data = body?.data || body

      if (!response.ok || body?.success === false) {
        const upstreamError =
          body?.error?.message ||
          body?.error ||
          data?.error ||
          'We could not process your booking right now.'
        throw new Error(upstreamError)
      }

      if (!data || typeof data !== 'object' || !data.state) {
        throw new Error('Booking response was incomplete. Please try again.')
      }

      const bookingResult = data as ManagementTableBookingResult
      setResult(bookingResult)

      if (bookingResult.state === 'blocked') {
        const blockedReason = bookingResult.blocked_reason || 'blocked'
        setError(BLOCKED_REASON_COPY[blockedReason] || bookingResult.reason || BLOCKED_REASON_COPY.blocked)
        setStep('choose')
        trackTableBookingFunnel({
          step: 'error',
          partySize,
          bookingDate: date,
          bookingTime: selectedTime,
          errorType: blockedReason,
          errorMessage: bookingResult.reason || BLOCKED_REASON_COPY[blockedReason] || 'blocked',
          source: bookingSource,
          deviceType: getDeviceType(),
        })
      } else if (bookingResult.state === 'confirmed') {
        // Funnel success
        trackTableBookingFunnel({
          step: 'success',
          partySize,
          bookingDate: date,
          bookingTime: selectedTime,
          bookingReference: bookingResult.booking_reference || undefined,
          source: bookingSource,
          deviceType: getDeviceType(),
        })

        // GA4 purchase event so bookings appear in the Monetisation reports.
        // Confirmed (no deposit) bookings have value 0; the `transaction_id`
        // is the booking reference so duplicates de-dupe in GA4.
        const transactionId =
          bookingResult.booking_reference || bookingResult.table_booking_id || undefined
        if (transactionId) {
          pushToDataLayer({
            event: 'purchase',
            transaction_id: transactionId,
            value: bookingResult.deposit_amount ?? 0,
            currency: 'GBP',
            booking_source: bookingSource,
          })
        }
      }
    } catch (submitError: any) {
      const errorMessage = submitError?.message || 'We could not process your booking right now.'
      setError(errorMessage)
      trackTableBookingFunnel({
        step: 'error',
        partySize,
        bookingDate: date,
        bookingTime: selectedTime,
        errorType: 'submit_failed',
        errorMessage,
        source: bookingSource,
        deviceType: getDeviceType(),
      })
    } finally {
      setLoading(false)
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    }
  }

  function resetJourney() {
    setStep('find')
    setPartySize(defaultPartySize)
    setPartySizeDisplay(String(defaultPartySize))
    setDate(defaultDate)
    setRequestedTime(defaultRequestedTime)
    setSelectedTime('')
    setAvailability(null)
    setAvailabilityError(null)
    setAlternativeSlots([])
    setAlternativesLoading(false)
    setDrinksAlternative(null)
    setDismissedEventDates([])
    setSelectedSuggestedEvent(null)
    setPhone('')
    setLookupState('idle')
    setKnownCustomer(null)
    setLookupError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPurpose(prefill?.purpose || 'food')
    setNotes('')
    setPolicyAccepted(false)
    setError(null)
    setResult(null)
    setPaypalOrderId(null)
    setBookingIdForPayment(null)
    setDepositAmountForPayment(0)
    setPaymentState('idle')
    setPaymentError(null)
    setTurnstileToken(null)
    turnstileRef.current?.reset()
    setWebsite('')
    formLoadedAt.current = Date.now()
  }

  if (selectedSuggestedEvent) {
    const selectedEventDate = getLondonIsoDate(selectedSuggestedEvent.startDate)
    const selectedEventDateLabel = selectedEventDate ? formatDateForDisplay(selectedEventDate) : 'Date TBC'
    const selectedEventTimeLabel = formatEventTimeLabel(selectedSuggestedEvent.startDate)

    return (
      <div className="space-y-4">
        <Card variant="elevated">
          <CardBody className="space-y-3 p-4">
            <h3 className="text-lg font-semibold text-anchor-gold-vivid">Event booking</h3>
            <p className="text-sm text-anchor-cream-text/70">
              You're booking <strong>{selectedSuggestedEvent.name}</strong> on{' '}
              <strong>{selectedEventDateLabel}</strong> at <strong>{selectedEventTimeLabel}</strong>.
            </p>
            <p className="text-sm text-anchor-cream-text/70">
              Complete your event booking below without leaving this page.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setSelectedSuggestedEvent(null)}
            >
              Back to table booking
            </Button>
          </CardBody>
        </Card>

        <ManagementEventBookingForm
          event={{
            id: selectedSuggestedEvent.id,
            name: selectedSuggestedEvent.name,
            startDate: selectedSuggestedEvent.startDate
          }}
          title="Book now"
          compact
        />
      </div>
    )
  }

  if (result?.state === 'confirmed') {
    return (
      <Card variant="elevated">
        <CardBody className="space-y-4">
          <Alert variant="success" title={"You're all booked in — see you soon!"}>
            <p>
              Reference: <strong>{result.booking_reference || 'Provided by SMS shortly'}</strong>
            </p>
            {result.table_name ? <p className="mt-1">Allocated table: {result.table_name}</p> : null}
            <p className="mt-2">We&apos;ve sent confirmation details by SMS.</p>
          </Alert>

          <div className="mt-4 rounded-xl bg-anchor-bg-raised border border-anchor-gold/15 p-4 text-sm text-anchor-cream-text/70 space-y-1">
            <p className="font-semibold text-anchor-gold-vivid">When you arrive:</p>
            <p>&#x2022; Free parking right outside &mdash; no ticket needed</p>
            <p>&#x2022; No need to check in &mdash; just head to the bar and we&apos;ll find your table</p>
            <p>&#x2022; If anything changes, give us a ring on 01753 682707</p>
          </div>

          <Button type="button" variant="outline" onClick={resetJourney}>
            Book another table
          </Button>
        </CardBody>
      </Card>
    )
  }


  return (
    <Card variant="elevated">
      <CardBody className="space-y-6">
        <BookingProgressBar currentStep={currentStepIndex + 1} totalSteps={STEP_ORDER.length} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEP_ORDER.map((stepKey, index) => {
            const isComplete = index < currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div
                key={stepKey}
                className={`rounded-xl border px-3 py-2 text-center text-sm ${
                  isCurrent
                    ? 'border-anchor-gold bg-anchor-gold/15 font-semibold text-anchor-gold-vivid'
                    : isComplete
                    ? 'border-anchor-green/40 bg-anchor-green/10 text-anchor-cream-text'
                    : 'border-anchor-gold/15 bg-anchor-bg-raised text-anchor-cream-text/50'
                }`}
              >
                <div className="text-xs uppercase tracking-wide">Step {index + 1}</div>
                <div>{STEP_LABELS[stepKey]}</div>
              </div>
            )
          })}
        </div>

        {error && (
          <Alert variant="error" title="Booking not completed">
            <p>{error}</p>
            <p className="mt-2">
              Call <a href="tel:+441753682707" className="font-semibold underline">01753 682707</a> if you need help.
            </p>
          </Alert>
        )}

        {step === 'find' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-anchor-gold-vivid">Find a table</h3>
              <p className="mt-1 text-sm text-anchor-cream-text/70">
                {`Start with party size, date, booking type, and time. We'll ask for contact details after you pick a slot.`}
              </p>
            </div>

            {hoursNote ? (
              <div className="rounded-lg border border-anchor-gold/15 bg-anchor-bg-raised/50 p-3 text-sm text-anchor-cream-text/80">
                <p className="font-semibold text-anchor-cream-text">
                  {formatDateForDisplay(date)}
                </p>
                <p className="mt-1">{hoursNote.summary}</p>
                <p className="mt-2 text-xs text-anchor-cream-text/60">{hoursNote.footer}</p>
              </div>
            ) : null}

            <Input
              label="Party Size"
              type="number"
              min={1}
              max={20}
              required
              value={partySizeDisplay}
              onChange={(event) => {
                markFunnelStart()
                const raw = event.target.value
                setPartySizeDisplay(raw)
                if (raw === '') return
                const parsed = Number.parseInt(raw, 10)
                if (Number.isNaN(parsed)) return
                const clamped = Math.min(Math.max(parsed, 1), 20)
                setPartySize(clamped)
                setDrinksAlternative(null)
              }}
              onBlur={() => {
                const parsed = Number.parseInt(partySizeDisplay, 10)
                const clamped = (!Number.isFinite(parsed) || parsed < 1) ? 1 : Math.min(parsed, 20)
                setPartySize(clamped)
                setPartySizeDisplay(String(clamped))
              }}
            />

            <Input
              label="Date"
              type="date"
              min={today}
              required
              value={date}
              onChange={(event) => handleDateChange(event.target.value)}
              error={dateError || undefined}
            />

            <Input
              label="Preferred Time"
              type="time"
              required
              value={requestedTime}
              onChange={(event) => {
                markFunnelStart()
                setRequestedTime(event.target.value)
              }}
            />

            <div>
              <label htmlFor="table-booking-purpose-find" className="mb-1 block text-sm font-medium text-anchor-cream-text/70">
                Booking for
              </label>
              <select
                id="table-booking-purpose-find"
                value={purpose}
                onChange={(event) => handlePurposeSelection(event.target.value === 'drinks' ? 'drinks' : 'food')}
                className="w-full rounded-lg border border-anchor-gold/30 bg-anchor-bg-card px-4 py-2 text-anchor-cream-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-anchor-gold"
              >
                <option value="food">Food (kitchen hours)</option>
                <option value="drinks">Drinks (bar hours)</option>
              </select>
              <p className="mt-2 text-xs text-anchor-cream-text/60">
                {purpose === 'food'
                  ? 'Food bookings are shown within kitchen service hours.'
                  : 'Drinks-only bookings can include later bar slots when available.'}
              </p>
            </div>

            {(showDateEventSuggestions || selectedDateEventsLoading) &&
              renderDateEventSuggestions({
                title: 'Events on this date',
                description:
                  'If you were planning a night out, you can switch to an event booking in one tap.',
                context: 'find_step'
              })}

            {selectedDateEventError && !showDateEventSuggestions && !selectedDateEventsLoading ? (
              <p className="text-xs text-anchor-cream-text/50">{selectedDateEventError}</p>
            ) : null}

            {availabilityError && (
              <Alert variant="warning">
                <p>{availabilityError}</p>
              </Alert>
            )}

            <Button type="button" fullWidth size="lg" loading={availabilityLoading} onClick={handleFindTable}>
              Find a table
            </Button>
          </div>
        )}

        {step === 'choose' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-anchor-gold-vivid">Choose your time</h3>
              <p className="mt-1 text-sm text-anchor-cream-text/70">
                {formatDateForDisplay(date)} for {partySize} {partySize === 1 ? 'guest' : 'guests'}.
              </p>
              <p className="mt-1 text-xs text-anchor-cream-text/60">
                Showing {purpose === 'drinks' ? 'drinks-only' : 'food'} slots.
              </p>
            </div>

            {availabilityLoading ? (
              <p className="text-sm text-anchor-cream-text/70">Checking available times...</p>
            ) : null}

            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => handleSlotSelect(slot.time)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                        isSelected
                          ? 'border-anchor-gold bg-anchor-gold/15 text-anchor-gold-vivid'
                          : 'border-anchor-gold/25 bg-anchor-bg-card text-anchor-cream-text hover:border-anchor-gold'
                      }`}
                    >
                      {formatTimeForDisplay(slot.time)}
                    </button>
                  )
                })}
              </div>
            ) : (
              <Alert variant="warning" title="No online times available">
                <p>
                  {availability?.message ||
                    `We couldn't find an online slot for that request. Try one of the nearest alternatives below, or join the waitlist.`}
                </p>
                {availability?.special_notes ? <p className="mt-2">{availability.special_notes}</p> : null}
              </Alert>
            )}

            {drinksAlternative?.available && purpose === 'food' && availableSlots.length === 0 && (
              <div className="rounded-xl border border-anchor-gold/30 bg-anchor-gold/10 p-4 text-center">
                <p className="text-sm font-semibold text-anchor-gold-vivid mb-2">
                  Our kitchen is closed, but the bar is open
                </p>
                <p className="text-sm text-anchor-cream-text/80 mb-3">
                  {drinksAlternative.slotCount} drinks-only {drinksAlternative.slotCount === 1 ? 'time' : 'times'} available
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDrinksAlternative(null)
                    handlePurposeSelection('drinks')
                  }}
                  className="rounded-xl border border-anchor-gold bg-anchor-gold/20 px-4 py-2 text-sm font-semibold text-anchor-gold-vivid hover:bg-anchor-gold/30 transition-colors"
                >
                  Check drinks availability
                </button>
              </div>
            )}

            {(showDateEventSuggestions || selectedDateEventsLoading) &&
              renderDateEventSuggestions({
                title:
                  availableSlots.length === 0
                    ? 'There are events on this date'
                    : 'Also happening on this date',
                description:
                  availableSlots.length === 0
                    ? 'If table times are limited, you can switch to one of these events right away.'
                    : 'You can continue with your table booking, or switch to an event if that suits your plans better.',
                context:
                  availableSlots.length === 0 ? 'choose_step_no_availability' : 'choose_step_with_availability',
                highlight: availableSlots.length === 0
              })}

            {availableSlots.length === 0 && (
              <div className="space-y-3 rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4">
                <p className="text-sm font-semibold text-anchor-cream-text/80">Nearest alternatives</p>

                {alternativesLoading ? (
                  <p className="text-sm text-anchor-cream-text/70">Finding nearby options...</p>
                ) : alternativeSlots.length > 0 ? (
                  <div className="space-y-2">
                    {alternativeSlots.map((option) => (
                      <button
                        key={`${option.date}-${option.time}`}
                        type="button"
                        onClick={() => handleChooseAlternative(option)}
                        className="flex w-full items-center justify-between rounded-lg border border-anchor-gold/25 bg-anchor-bg-card px-3 py-2 text-left text-sm hover:border-anchor-gold"
                      >
                        <span className="font-medium text-anchor-cream-text/80">{formatDateForDisplay(option.date)}</span>
                        <span className="text-anchor-gold-vivid font-semibold">{formatTimeForDisplay(option.time)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-anchor-cream-text/70">No nearby online alternatives were found.</p>
                )}

                <div className="rounded-lg border border-anchor-gold/25 bg-anchor-gold/10 p-3 text-sm text-anchor-cream-text">
                  <p className="font-semibold">Join waitlist</p>
                  <p className="mt-1">Call us and we'll add you to the waitlist for cancellations.</p>
                  <div className="mt-2">
                    <Button asChild size="sm" variant="secondary">
                      <a href="tel:+441753682707">Join waitlist by phone</a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleBackToFind}>
                Back
              </Button>

              {selectedTime ? (
                <Button
                  type="button"
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setStep('details')
                    setError(null)
                  }}
                >
                  Continue
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4 text-sm text-anchor-cream-text/70">
              <p>
                <strong>{partySize}</strong> guests on <strong>{formatDateForDisplay(date)}</strong> at{' '}
                <strong>{formatTimeForDisplay(selectedTime || requestedTime)}</strong>
              </p>
            </div>

            <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4">
              <Input
                label="Mobile Number"
                type="tel"
                required
                value={phone}
                disabled={detailsUnlocked}
                onChange={(event) => {
                  markFunnelStart()
                  setPhone(event.target.value)
                }}
                placeholder="07xxx xxxxxx"
                helperText="We only use this for booking confirmation and reminders."
              />

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!detailsUnlocked ? (
                  <Button
                    type="button"
                    size="md"
                    className="w-full sm:w-auto"
                    loading={lookupState === 'loading'}
                    onClick={handlePhoneLookup}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="md"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetPhoneLookup}
                  >
                    Use Different Number
                  </Button>
                )}
              </div>

              {lookupError ? <p className="mt-3 text-sm text-red-400">{lookupError}</p> : null}

              {isKnownCustomer ? (
                <p className="mt-3 text-sm font-medium text-anchor-gold-vivid">
                  Welcome back{knownCustomer?.full_name ? `, ${knownCustomer.full_name}` : ''}. We've skipped your personal details.
                </p>
              ) : null}

              {lookupState === 'unknown' ? (
                <p className="mt-3 text-sm font-medium text-anchor-cream-text/80">
                  {lookupDegraded
                    ? 'We could not verify this number right now. Please continue by entering your details below.'
                    : 'New customer detected. Please complete your details below.'}
                </p>
              ) : null}
            </div>

            {detailsUnlocked && !isKnownCustomer ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Smith"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Email (optional)"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            ) : null}

            {detailsUnlocked ? (
              <>
                <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4 text-sm text-anchor-cream-text/70">
                  <p className="font-semibold text-anchor-cream-text">
                    Booking for: {purpose === 'drinks' ? 'Drinks (bar hours)' : 'Food (kitchen hours)'}
                  </p>
                  <p className="mt-1 text-xs text-anchor-cream-text/60">
                    Need to switch between food and drinks? Go back to step 1 and tap Find a table again.
                  </p>
                </div>

                <Textarea
                  label="Notes (optional)"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Special requests, accessibility needs, occasion details..."
                  rows={3}
                />
              </>
            ) : null}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleBackToChoose}>
                Back
              </Button>

              {detailsUnlocked ? (
                <Button type="button" variant="primary" className="w-full sm:w-auto" onClick={handleContinueToReview}>
                  Continue to review
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-anchor-gold-vivid">Review your booking</h3>
              <p className="mt-1 text-sm text-anchor-cream-text/70">Check details, then confirm your booking.</p>
            </div>

            <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4 text-sm">
              <dl className="space-y-2 text-anchor-cream-text/80">
                <div className="flex justify-between gap-3">
                  <dt className="font-medium">Party size</dt>
                  <dd>{partySize}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium">Date</dt>
                  <dd>{formatDateForDisplay(date)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium">Time</dt>
                  <dd>{formatTimeForDisplay(selectedTime || requestedTime)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium">Booking for</dt>
                  <dd>{purpose === 'drinks' ? 'Drinks' : 'Food'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium">Mobile</dt>
                  <dd>{phone}</dd>
                </div>
                {!isKnownCustomer ? (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium">Guest</dt>
                    <dd>
                      {[firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || 'Not provided'}
                    </dd>
                  </div>
                ) : null}
                {requiresGroupDeposit ? (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium">Deposit due now</dt>
                    <dd>{formatGbpCurrency(groupDepositAmount)}</dd>
                  </div>
                ) : null}
              </dl>
              {requiresGroupDeposit ? (
                <p className="mt-3 text-xs text-anchor-cream-text/70">
                  {LARGE_GROUP_DEPOSIT_POLICY_COPY}
                </p>
              ) : null}
            </div>

            <p className="text-sm text-anchor-cream-text/70">
              Plans changed?{' '}
              <a href="tel:+441753682707" className="font-semibold underline">
                A quick call to 01753 682707
              </a>{' '}
              lets us offer your table to someone else. Thanks for letting us know.
            </p>

            {result?.state === 'pending_payment' ? (
              <>
                {paymentState === 'confirmed' ? (
                  <Alert variant="success" title="Deposit paid — booking confirmed!">
                    <p>Your deposit has been received. Your table is now secured.</p>
                    {result.booking_reference ? (
                      <p className="mt-1">Booking reference: <strong>{result.booking_reference}</strong></p>
                    ) : null}
                  </Alert>
                ) : paymentState === 'error' && !paypalOrderId ? (
                  <Alert variant="warning" title="We couldn't open the PayPal payment automatically">
                    <p>{paymentError ?? 'Please try again or call us to complete your booking.'}</p>
                    <p className="mt-2">Two ways to finish your booking:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-6">
                      <li>
                        Call us on{' '}
                        <a href="tel:+441753682707" className="font-semibold underline">
                          01753 682707
                        </a>{' '}
                        — we'll take payment over the phone.
                      </li>
                      {result?.fallback_payment_url ? (
                        <li>
                          Or open the secure payment link we've sent to your phone, or{' '}
                          <a
                            href={result.fallback_payment_url}
                            className="font-semibold underline"
                            rel="noopener noreferrer"
                          >
                            click here to complete your deposit
                          </a>
                          .
                        </li>
                      ) : (
                        <li>Or check your phone — we've sent you a secure payment link by SMS.</li>
                      )}
                    </ul>
                    <p className="mt-2 text-xs">Your table is held while you complete payment.</p>
                  </Alert>
                ) : paypalOrderId && bookingIdForPayment ? (
                  <>
                    {holdExpiry && (
                      <p className="text-sm text-amber-700 font-medium">
                        Your table is held until {holdExpiry}. Complete payment to confirm your booking.
                      </p>
                    )}
                    {paymentState === 'error' && paymentError && (
                      <Alert variant="error" title="Payment error">
                        <p>{paymentError}</p>
                      </Alert>
                    )}
                    <PayPalDepositSection
                      bookingId={bookingIdForPayment}
                      orderId={paypalOrderId}
                      depositAmount={depositAmountForPayment}
                      bookingSummary={[
                        date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : null,
                        selectedTime ? (() => { const [h, m] = selectedTime.split(':').map(Number); const ampm = h >= 12 ? 'pm' : 'am'; const hour = h % 12 || 12; return `${hour}:${String(m).padStart(2, '0')}${ampm}`; })() : null,
                        partySize ? `${partySize} guests` : null
                      ].filter(Boolean).join(' · ')}
                      onSuccess={() => setPaymentState('confirmed')}
                      onError={(msg) => {
                        setPaymentError(msg)
                        setPaymentState('error')
                      }}
                    />
                  </>
                ) : (
                  <p className="text-sm text-anchor-cream-text/50">Setting up payment…</p>
                )}

                {paymentState !== 'confirmed' && (
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={resetJourney}>
                    Start a new booking
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Honeypot — hidden from real users, filled by bots */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {TURNSTILE_SITE_KEY && (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={setTurnstileToken}
                    onError={() => setTurnstileToken(null)}
                    onExpire={() => setTurnstileToken(null)}
                    options={{ theme: 'dark', size: 'flexible' }}
                  />
                )}

                <label className="flex items-start gap-2 text-sm text-anchor-cream-text/70">
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(event) => setPolicyAccepted(event.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I understand The Anchor's booking and no-show policy, and I agree to continue.
                  </span>
                </label>

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setStep('details')}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:w-auto"
                    loading={loading}
                    disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}
                    onClick={handleConfirmBooking}
                  >
                    {requiresGroupDeposit ? 'Confirm and pay deposit' : 'Confirm booking'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
