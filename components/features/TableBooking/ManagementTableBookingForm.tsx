'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Button } from '@/components/ui/primitives/Button'
import { trackTableBookingClick } from '@/lib/gtm-events'
import { MOTHERS_DAY_DEFAULT_TIME, MOTHERS_DAY_SERVICE_DATE } from '@/lib/mothers-day-booking'

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
  state: 'confirmed' | 'pending_card_capture' | 'blocked'
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
}

type SundayLunchMenuItem = {
  id: string
  name: string
  price: number
}

type GuestOrder = {
  guestName: string
  menuItemId: string
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
    sundayLunch?: boolean
    mothersDay?: boolean
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
  no_table: 'We do not have a table available for that time and party size.',
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

function isSundayDate(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0
}

function createClientIdempotencyKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function normalizeSundayLunchMenu(input: unknown): SundayLunchMenuItem[] {
  if (!input || typeof input !== 'object') return []
  const root = input as Record<string, unknown>
  const payload = (root.data && typeof root.data === 'object' ? root.data : root) as Record<string, unknown>
  const mains = Array.isArray(payload.mains) ? payload.mains : []

  return mains
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const source = item as Record<string, unknown>
      if (source.is_available === false) return null
      const id = typeof source.id === 'string' && source.id.trim().length > 0 ? source.id.trim() : null
      const name = typeof source.name === 'string' ? source.name.trim() : ''
      if (!id || !name) return null

      const rawPrice = source.price
      const parsedPrice =
        typeof rawPrice === 'number'
          ? rawPrice
          : typeof rawPrice === 'string'
          ? Number.parseFloat(rawPrice)
          : 0

      return {
        id,
        name,
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0
      } satisfies SundayLunchMenuItem
    })
    .filter((item): item is SundayLunchMenuItem => Boolean(item))
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
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
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
      shortDescription:
        typeof source.shortDescription === 'string'
          ? source.shortDescription
          : typeof source.description === 'string'
          ? source.description
          : null,
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

function getSuggestedEventBookingHref(event: SuggestedEvent): string {
  const key = (event.slug || event.id || '').trim()
  if (!key) return '/whats-on'
  return `/events/${encodeURIComponent(key)}`
}

export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFormProps) {
  const mothersDayMode = prefill?.mothersDay === true
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const defaultDate = mothersDayMode ? MOTHERS_DAY_SERVICE_DATE : toIsoDateInputValue(prefill?.date) || today
  const defaultRequestedTime =
    toTimeInputValue(prefill?.time) || (mothersDayMode ? MOTHERS_DAY_DEFAULT_TIME : getDefaultTimeValue())
  const defaultPartySize = Math.min(Math.max(prefill?.partySize || (mothersDayMode ? 4 : 2), 1), 50)

  const [step, setStep] = useState<BookingStep>('find')

  const [partySize, setPartySize] = useState(defaultPartySize)
  const [date, setDate] = useState(defaultDate)
  const [requestedTime, setRequestedTime] = useState(defaultRequestedTime)
  const [selectedTime, setSelectedTime] = useState<string>('')

  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [alternativeSlots, setAlternativeSlots] = useState<AlternativeSlot[]>([])
  const [alternativesLoading, setAlternativesLoading] = useState(false)
  const [eventsByDate, setEventsByDate] = useState<Record<string, SuggestedEvent[]>>({})
  const [eventErrorsByDate, setEventErrorsByDate] = useState<Record<string, string>>({})
  const [eventsLoadingDate, setEventsLoadingDate] = useState<string | null>(null)
  const [dismissedEventDates, setDismissedEventDates] = useState<string[]>([])

  const [phone, setPhone] = useState('')
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [knownCustomer, setKnownCustomer] = useState<CustomerLookupResult['customer']>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupDegraded, setLookupDegraded] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [purpose, setPurpose] = useState<BookingPurpose>(mothersDayMode ? 'food' : prefill?.purpose || 'food')
  const [notes, setNotes] = useState('')

  const [sundayLunch, setSundayLunch] = useState(mothersDayMode ? true : Boolean(prefill?.sundayLunch))
  const [sundayMenuItems, setSundayMenuItems] = useState<SundayLunchMenuItem[]>([])
  const [sundayMenuLoading, setSundayMenuLoading] = useState(false)
  const [sundayMenuError, setSundayMenuError] = useState<string | null>(null)
  const [guestOrders, setGuestOrders] = useState<GuestOrder[]>([])
  const [cardRedirectInitiated, setCardRedirectInitiated] = useState(false)

  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManagementTableBookingResult | null>(null)

  const holdExpiry = formatHoldExpiry(result?.hold_expires_at || null)
  const selectedDateIsSunday = useMemo(() => isSundayDate(date), [date])
  const purposeLockedToFood = !mothersDayMode && selectedDateIsSunday && sundayLunch
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

  useEffect(() => {
    setGuestOrders((previous) =>
      Array.from({ length: partySize }, (_, index) => ({
        guestName: previous[index]?.guestName || `Guest ${index + 1}`,
        menuItemId: previous[index]?.menuItemId || ''
      }))
    )
  }, [partySize])

  useEffect(() => {
    if (!mothersDayMode) return

    if (date !== MOTHERS_DAY_SERVICE_DATE) {
      setDate(MOTHERS_DAY_SERVICE_DATE)
    }

    if (purpose !== 'food') {
      setPurpose('food')
    }

    if (!sundayLunch) {
      setSundayLunch(true)
    }
  }, [date, mothersDayMode, purpose, sundayLunch])

  useEffect(() => {
    if (result?.state !== 'pending_card_capture' || !result.next_step_url) {
      setCardRedirectInitiated(false)
      return
    }

    if (typeof window === 'undefined') return
    setCardRedirectInitiated(true)
    window.location.assign(result.next_step_url)
  }, [result?.next_step_url, result?.state])

  useEffect(() => {
    if (mothersDayMode) {
      return
    }

    if (!selectedDateIsSunday) {
      setSundayLunch(false)
    }
  }, [mothersDayMode, selectedDateIsSunday])

  useEffect(() => {
    if (mothersDayMode || !sundayLunch || !selectedDateIsSunday || !detailsUnlocked || step !== 'details') {
      return
    }

    let cancelled = false

    async function loadSundayMenu() {
      setSundayMenuLoading(true)
      setSundayMenuError(null)

      try {
        const response = await fetch(`/api/table-bookings/menu/sunday-lunch?date=${encodeURIComponent(date)}`, {
          cache: 'no-store'
        })
        const body = await response.json()
        const menuData = normalizeSundayLunchMenu(body)

        if (!response.ok || menuData.length === 0) {
          throw new Error('Sunday lunch menu is unavailable right now. Please call us to book.')
        }

        if (!cancelled) {
          setSundayMenuItems(menuData)
        }
      } catch (menuError: any) {
        if (!cancelled) {
          setSundayMenuItems([])
          setSundayMenuError(menuError?.message || 'Sunday lunch menu is unavailable right now.')
        }
      } finally {
        if (!cancelled) {
          setSundayMenuLoading(false)
        }
      }
    }

    void loadSundayMenu()

    return () => {
      cancelled = true
    }
  }, [date, detailsUnlocked, mothersDayMode, selectedDateIsSunday, step, sundayLunch])

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

  useEffect(() => {
    if (mothersDayMode) return
    if (selectedDateIsSunday && sundayLunch && purpose !== 'food') {
      setPurpose('food')
    }
  }, [mothersDayMode, selectedDateIsSunday, sundayLunch, purpose])

  function getMenuItem(menuItemId: string): SundayLunchMenuItem | null {
    return sundayMenuItems.find((item) => item.id === menuItemId) || null
  }

  async function fetchAvailabilityForDate(targetDate: string, targetTime: string): Promise<AvailabilityData> {
    const params = new URLSearchParams({
      date: targetDate,
      party_size: String(partySize),
      time: targetTime
    })

    const response = await fetch(`/api/table-bookings/availability?${params.toString()}`, {
      cache: 'no-store'
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

  async function loadNearestAlternatives(targetDate: string, targetTime: string) {
    setAlternativesLoading(true)
    setAlternativeSlots([])

    try {
      const dateCandidates = [1, 2, 3].map((offset) => addDays(targetDate, offset))
      const candidateResponses = await Promise.all(
        dateCandidates.map(async (candidateDate) => {
          try {
            return await fetchAvailabilityForDate(candidateDate, targetTime)
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

  async function handleFindTable() {
    setAvailabilityError(null)
    setError(null)
    setResult(null)
    setAvailabilityLoading(true)
    setAlternativeSlots([])

    try {
      if (!date || !requestedTime) {
        throw new Error('Please choose a date and time first.')
      }

      trackTableBookingClick({
        source: 'book_table_find_table',
        destination: '/api/table-bookings/availability',
        context: 'availability_first'
      })

      const availabilityData = await fetchAvailabilityForDate(date, requestedTime)
      const closestTime = pickClosestSlot(availabilityData.time_slots, requestedTime, partySize)

      setAvailability(availabilityData)
      setSelectedTime(closestTime || '')
      setStep('choose')

      if (!closestTime) {
        void loadNearestAlternatives(date, requestedTime)
      }
    } catch (availabilityFailure: any) {
      setAvailability(null)
      setAvailabilityError(
        availabilityFailure?.message ||
          'We could not check availability right now. Please try again or call us at 01753 682707.'
      )
    } finally {
      setAvailabilityLoading(false)
    }
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
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          Checking events on {formatDateForDisplay(date)}...
        </div>
      )
    }

    if (selectedDateEvents.length === 0) {
      return null
    }

    return (
      <div
        className={`rounded-xl border p-4 ${
          options.highlight
            ? 'border-amber-200 bg-amber-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-anchor-green">{options.title}</p>
            <p className="mt-1 text-sm text-gray-700">{options.description}</p>
          </div>
          <button
            type="button"
            onClick={dismissEventSuggestionsForDate}
            className="text-xs font-medium text-gray-600 underline hover:text-gray-800"
          >
            Hide
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {selectedDateEvents.map((event) => {
            const eventHref = getSuggestedEventBookingHref(event)
            return (
              <div
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                  <p className="mt-1 text-xs text-gray-700">
                    {formatEventTimeLabel(event.startDate)}
                    {event.priceLabel ? ` • ${event.priceLabel}` : ' • Free entry'}
                    {typeof event.seatsRemaining === 'number'
                      ? ` • ${event.seatsRemaining} seat${event.seatsRemaining === 1 ? '' : 's'} left`
                      : ''}
                  </p>
                  {event.shortDescription ? (
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">{event.shortDescription}</p>
                  ) : null}
                </div>
                <Button asChild size="sm" variant={options.highlight ? 'primary' : 'outline'}>
                  <a
                    href={eventHref}
                    onClick={() => {
                      trackTableBookingClick({
                        source: 'book_table_event_suggestion',
                        destination: eventHref,
                        context: options.context
                      })
                    }}
                  >
                    Book event
                  </a>
                </Button>
              </div>
            )
          })}
        </div>

        <div className="mt-3 text-xs">
          <a
            href="/whats-on"
            className="font-medium text-anchor-green underline hover:text-anchor-gold"
          >
            View all upcoming events
          </a>
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

  function buildSundayMenuSelections(): {
    ok: boolean
    selections?: Array<{
      guest_name: string
      custom_item_name: string
      item_type: 'main'
      quantity: number
      price_at_booking: number
    }>
    error?: string
  } {
    if (!sundayLunch) {
      return { ok: true }
    }

    if (mothersDayMode) {
      return { ok: true }
    }

    if (!selectedDateIsSunday) {
      return { ok: false, error: 'Sunday lunch can only be selected for Sundays.' }
    }

    if (sundayMenuLoading) {
      return { ok: false, error: 'Sunday lunch menu is still loading. Please wait a moment and try again.' }
    }

    if (sundayMenuItems.length === 0) {
      return {
        ok: false,
        error: sundayMenuError || 'Sunday lunch menu is unavailable right now.'
      }
    }

    const missingSelection = guestOrders.find((order) => !order.menuItemId)
    if (missingSelection) {
      return {
        ok: false,
        error: 'Please select a Sunday lunch main for each guest.'
      }
    }

    const selections = guestOrders.map((order, index) => {
      const item = getMenuItem(order.menuItemId)
      return {
        guest_name: order.guestName.trim() || `Guest ${index + 1}`,
        custom_item_name: item?.name || 'Sunday lunch main',
        item_type: 'main' as const,
        quantity: 1,
        price_at_booking: item?.price || 0
      }
    })

    return { ok: true, selections }
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

    const sundaySelections = buildSundayMenuSelections()
    if (!sundaySelections.ok) {
      setError(sundaySelections.error || 'Please complete your Sunday lunch selections.')
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

    const sundaySelections = buildSundayMenuSelections()
    if (!sundaySelections.ok) {
      setError(sundaySelections.error || 'Please complete your Sunday lunch selections.')
      return
    }

    const trimmedPhone = phone.trim()
    const resolvedFirstName = firstName.trim()
    const resolvedLastName = lastName.trim()
    const resolvedEmail = (isKnownCustomer ? knownCustomer?.email : email.trim()) || undefined
    const effectiveDate = mothersDayMode ? MOTHERS_DAY_SERVICE_DATE : date
    const effectivePurpose: BookingPurpose = mothersDayMode ? 'food' : purpose
    const effectiveSundayLunch = mothersDayMode ? true : sundayLunch
    const idempotencyKey = createClientIdempotencyKey('tbl_web')

    setLoading(true)

    trackTableBookingClick({
      source: 'book_table_management_form',
      context: sundayLunch ? 'sunday_lunch' : 'regular',
      destination: '/api/table-bookings'
    })

    try {
      const payload = {
        phone: trimmedPhone,
        default_country_code: '44',
        ...(resolvedFirstName ? { first_name: resolvedFirstName } : {}),
        ...(resolvedLastName ? { last_name: resolvedLastName } : {}),
        ...(resolvedEmail ? { email: resolvedEmail } : {}),
        date: effectiveDate,
        time: selectedTime,
        party_size: partySize,
        purpose: effectivePurpose,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(effectiveSundayLunch ? { sunday_lunch: true } : {}),
        ...(sundaySelections.selections ? { menu_selections: sundaySelections.selections } : {})
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
      }
    } catch (submitError: any) {
      setError(submitError?.message || 'We could not process your booking right now.')
    } finally {
      setLoading(false)
    }
  }

  function resetJourney() {
    setStep('find')
    setPartySize(defaultPartySize)
    setDate(defaultDate)
    setRequestedTime(defaultRequestedTime)
    setSelectedTime('')
    setAvailability(null)
    setAvailabilityError(null)
    setAlternativeSlots([])
    setAlternativesLoading(false)
    setDismissedEventDates([])
    setPhone('')
    setLookupState('idle')
    setKnownCustomer(null)
    setLookupError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPurpose(mothersDayMode ? 'food' : prefill?.purpose || 'food')
    setNotes('')
    setSundayLunch(mothersDayMode ? true : Boolean(prefill?.sundayLunch))
    setSundayMenuItems([])
    setSundayMenuError(null)
    setPolicyAccepted(false)
    setError(null)
    setResult(null)
    setCardRedirectInitiated(false)
  }

  if (result?.state === 'confirmed') {
    return (
      <Card variant="elevated">
        <CardBody className="space-y-4">
          <Alert variant="success" title="Booking confirmed">
            <p>
              Reference: <strong>{result.booking_reference || 'Provided by SMS shortly'}</strong>
            </p>
            {result.table_name ? <p className="mt-1">Allocated table: {result.table_name}</p> : null}
            <p className="mt-2">We’ve sent confirmation details by SMS.</p>
          </Alert>

          <Button type="button" variant="outline" onClick={resetJourney}>
            Book another table
          </Button>
        </CardBody>
      </Card>
    )
  }

  if (result?.state === 'pending_card_capture') {
    return (
      <Card variant="elevated">
        <CardBody className="space-y-4">
          <Alert variant="warning" title="Card details needed to secure this booking">
            <p>
              Booking reference: <strong>{result.booking_reference || 'Pending'}</strong>
            </p>
            {cardRedirectInitiated ? (
              <p className="mt-1">Redirecting you to the secure card details step…</p>
            ) : (
              <p className="mt-1">Complete card details to secure your table.</p>
            )}
            {holdExpiry ? <p className="mt-1">Complete card details by {holdExpiry}.</p> : null}
            {result.next_step_url ? (
              <div className="mt-3">
                <Button asChild variant="primary" size="sm">
                  <a href={result.next_step_url} target="_blank" rel="noopener noreferrer">
                    Continue to Card Details
                  </a>
                </Button>
              </div>
            ) : null}
          </Alert>

          <Button type="button" variant="outline" onClick={resetJourney}>
            Start a new booking
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card variant="elevated">
      <CardBody className="space-y-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEP_ORDER.map((stepKey, index) => {
            const isComplete = index < currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div
                key={stepKey}
                className={`rounded-xl border px-3 py-2 text-center text-sm ${
                  isCurrent
                    ? 'border-anchor-gold bg-amber-50 font-semibold text-anchor-green'
                    : isComplete
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
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
              <h3 className="text-lg font-semibold text-anchor-green">Find a table</h3>
              <p className="mt-1 text-sm text-gray-700">
                {mothersDayMode
                  ? 'Mother’s Day Sunday Lunch is fixed to Sunday, 15 March 2026. Choose party size and preferred time, then continue.'
                  : 'Start with party size, date, and time. We’ll ask for contact details after you pick a slot.'}
              </p>
            </div>

            <Input
              label="Party Size"
              type="number"
              min={1}
              max={50}
              required
              value={partySize}
              onChange={(event) => setPartySize(Math.min(Math.max(Number(event.target.value) || 1, 1), 50))}
            />

            {mothersDayMode ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Date: <strong>Sunday, 15 March 2026</strong>
              </div>
            ) : (
              <Input
                label="Date"
                type="date"
                min={today}
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            )}

            <Input
              label="Preferred Time"
              type="time"
              required
              value={requestedTime}
              onChange={(event) => setRequestedTime(event.target.value)}
            />

            {!mothersDayMode && (showDateEventSuggestions || selectedDateEventsLoading) &&
              renderDateEventSuggestions({
                title: 'Events on this date',
                description:
                  'If you were planning a night out, you can switch to an event booking in one tap.',
                context: 'find_step'
              })}

            {!mothersDayMode && selectedDateEventError && !showDateEventSuggestions && !selectedDateEventsLoading ? (
              <p className="text-xs text-gray-500">{selectedDateEventError}</p>
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
              <h3 className="text-lg font-semibold text-anchor-green">Choose your time</h3>
              <p className="mt-1 text-sm text-gray-700">
                {formatDateForDisplay(date)} for {partySize} {partySize === 1 ? 'guest' : 'guests'}.
              </p>
            </div>

            {availabilityLoading ? (
              <p className="text-sm text-gray-700">Checking available times...</p>
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
                          ? 'border-anchor-gold bg-amber-50 text-anchor-green'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-anchor-gold'
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
                    'We couldn’t find an online slot for that request. Try one of the nearest alternatives below, or join the waitlist.'}
                </p>
                {availability?.special_notes ? <p className="mt-2">{availability.special_notes}</p> : null}
              </Alert>
            )}

            {!mothersDayMode && (showDateEventSuggestions || selectedDateEventsLoading) &&
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

            {availableSlots.length === 0 && !mothersDayMode && (
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800">Nearest alternatives</p>

                {alternativesLoading ? (
                  <p className="text-sm text-gray-700">Finding nearby options...</p>
                ) : alternativeSlots.length > 0 ? (
                  <div className="space-y-2">
                    {alternativeSlots.map((option) => (
                      <button
                        key={`${option.date}-${option.time}`}
                        type="button"
                        onClick={() => handleChooseAlternative(option)}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm hover:border-anchor-gold"
                      >
                        <span className="font-medium text-gray-800">{formatDateForDisplay(option.date)}</span>
                        <span className="text-anchor-green font-semibold">{formatTimeForDisplay(option.time)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">No nearby online alternatives were found.</p>
                )}

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">Join waitlist</p>
                  <p className="mt-1">Call us and we’ll add you to the waitlist for cancellations.</p>
                  <div className="mt-2">
                    <Button asChild size="sm" variant="secondary">
                      <a href="tel:+441753682707">Join waitlist by phone</a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {availableSlots.length === 0 && mothersDayMode ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-semibold">Mother’s Day Sunday Lunch</p>
                <p className="mt-1">
                  Online slots may be limited. Call us and we’ll check the latest availability for Sunday 15 March.
                </p>
                <div className="mt-2">
                  <Button asChild size="sm" variant="secondary">
                    <a href="tel:+441753682707">Call to check availability</a>
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleBackToFind}>
                Back
              </Button>

              {selectedTime ? (
                <Button
                  type="button"
                  variant="primary"
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
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <p>
                <strong>{partySize}</strong> guests on <strong>{formatDateForDisplay(date)}</strong> at{' '}
                <strong>{formatTimeForDisplay(selectedTime || requestedTime)}</strong>
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <Input
                label="Mobile Number"
                type="tel"
                required
                value={phone}
                disabled={detailsUnlocked}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="07xxx xxxxxx"
                helperText="We only use this for booking confirmation and reminders."
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {!detailsUnlocked ? (
                  <Button type="button" size="sm" loading={lookupState === 'loading'} onClick={handlePhoneLookup}>
                    Continue
                  </Button>
                ) : (
                  <Button type="button" size="sm" variant="outline" onClick={resetPhoneLookup}>
                    Use Different Number
                  </Button>
                )}
              </div>

              {lookupError ? <p className="mt-3 text-sm text-red-700">{lookupError}</p> : null}

              {isKnownCustomer ? (
                <p className="mt-3 text-sm font-medium text-green-800">
                  Welcome back{knownCustomer?.full_name ? `, ${knownCustomer.full_name}` : ''}. We’ve skipped your personal details.
                </p>
              ) : null}

              {lookupState === 'unknown' ? (
                <p className="mt-3 text-sm font-medium text-amber-800">
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
                {mothersDayMode ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Mother’s Day Sunday Lunch booking</p>
                    <p className="mt-1">
                      Booking type is fixed to food + Sunday lunch for Sunday, 15 March 2026.
                    </p>
                    <p className="mt-1">
                      Card details step comes first to secure your table, then we send your Sunday lunch pre-order link.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="table-booking-purpose" className="mb-1 block text-sm font-medium text-gray-700">
                      Booking For
                    </label>
                    <select
                      id="table-booking-purpose"
                      value={purpose}
                      onChange={(event) => setPurpose(event.target.value === 'drinks' ? 'drinks' : 'food')}
                      disabled={purposeLockedToFood}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-anchor-gold"
                    >
                      <option value="food">Food</option>
                      <option value="drinks">Drinks</option>
                    </select>
                    {purposeLockedToFood ? (
                      <p className="mt-2 text-xs text-amber-800">
                        Sunday lunch bookings are served from our Sunday lunch menu.
                      </p>
                    ) : null}
                  </div>
                )}

                {!mothersDayMode && selectedDateIsSunday ? (
                  <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">Sunday plans</p>
                    <p className="text-sm text-amber-800">
                      Choose your dining style for Sunday:
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        aria-pressed={sundayLunch}
                        onClick={() => {
                          setSundayLunch(true)
                          setPurpose('food')
                        }}
                        className={`rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                          sundayLunch
                            ? 'border-anchor-gold bg-white text-anchor-green'
                            : 'border-amber-200 bg-amber-50 text-amber-900 hover:border-anchor-gold'
                        }`}
                      >
                        <p className="font-semibold">Sunday lunch experience</p>
                        <p className="mt-1 text-xs">
                          Home-cooked roast favourites with pre-order now to secure your choices.
                        </p>
                      </button>

                      <button
                        type="button"
                        aria-pressed={!sundayLunch}
                        onClick={() => setSundayLunch(false)}
                        className={`rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                          !sundayLunch
                            ? 'border-anchor-gold bg-white text-anchor-green'
                            : 'border-amber-200 bg-amber-50 text-amber-900 hover:border-anchor-gold'
                        }`}
                      >
                        <p className="font-semibold">Regular menu table</p>
                        <p className="mt-1 text-xs">
                          Keep it flexible and choose from the regular menu on the day.
                        </p>
                      </button>
                    </div>

                    {sundayLunch ? (
                      <p className="text-xs font-medium text-amber-900">
                        Great choice. We’ll collect each guest’s main now and secure your booking with card details after confirmation.
                      </p>
                    ) : (
                      <p className="text-xs text-amber-900">
                        Prefer Sunday lunch instead? Switch any time before you confirm.
                      </p>
                    )}
                  </div>
                ) : null}

                {!mothersDayMode && selectedDateIsSunday && sundayLunch ? (
                  <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">Sunday lunch pre-order (required)</p>
                    <p className="text-sm text-amber-800">
                      Choose each guest’s main now. If required for your booking, the card hold step appears immediately after confirmation.
                    </p>

                    {sundayMenuLoading ? <p className="text-sm text-amber-900">Loading Sunday lunch menu...</p> : null}

                    {sundayMenuError ? (
                      <Alert variant="warning">
                        <p>{sundayMenuError}</p>
                      </Alert>
                    ) : null}

                    {!sundayMenuLoading &&
                      !sundayMenuError &&
                      guestOrders.map((order, index) => (
                        <div key={`guest-order-${index}`} className="grid gap-3 md:grid-cols-2">
                          <Input
                            label={`Guest ${index + 1} Name`}
                            type="text"
                            required
                            value={order.guestName}
                            onChange={(event) => {
                              const value = event.target.value
                              setGuestOrders((previous) =>
                                previous.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, guestName: value } : entry
                                )
                              )
                            }}
                          />

                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Main Choice</label>
                            <select
                              required
                              value={order.menuItemId}
                              onChange={(event) => {
                                const value = event.target.value
                                setGuestOrders((previous) =>
                                  previous.map((entry, entryIndex) =>
                                    entryIndex === index ? { ...entry, menuItemId: value } : entry
                                  )
                                )
                              }}
                              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-anchor-gold"
                            >
                              <option value="">Select a main</option>
                              {sundayMenuItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                  {item.price > 0 ? ` (£${item.price.toFixed(2)})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : null}

                <Textarea
                  label="Notes (optional)"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Special requests, accessibility needs, occasion details..."
                  rows={3}
                />
              </>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleBackToChoose}>
                Back
              </Button>

              {detailsUnlocked ? (
                <Button type="button" variant="primary" onClick={handleContinueToReview}>
                  Continue to review
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-anchor-green">Review your booking</h3>
              <p className="mt-1 text-sm text-gray-700">Check details, then confirm your booking.</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
              <dl className="space-y-2 text-gray-800">
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
                  <dd>{mothersDayMode ? 'Food (Mother’s Day Sunday Lunch)' : purpose === 'drinks' ? 'Drinks' : 'Food'}</dd>
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
                {sundayLunch ? (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium">Sunday lunch</dt>
                    <dd>Pre-order completed</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(event) => setPolicyAccepted(event.target.checked)}
                className="mt-1"
              />
              <span>
                I understand The Anchor’s booking and no-show policy, and I agree to continue.
              </span>
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button type="button" variant="primary" loading={loading} onClick={handleConfirmBooking}>
                Confirm booking
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
