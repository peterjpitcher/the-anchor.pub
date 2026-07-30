'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Button } from '@/components/ui/primitives/Button'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import { pickSlotWindow } from '@/lib/table-booking-slot-window'
import {
  londonIsoDate,
  londonNowParts,
  toTimeString,
} from '@/lib/table-booking-service-windows'
import {
  pushToDataLayer,
  trackBookingErrorShown,
  trackBookingStepViewed,
  trackOptionToggled,
  trackSlotFlagShown,
  trackSlotInvalidated,
  trackTableBookingClick,
  trackTableBookingFunnel,
} from '@/lib/gtm-events'
import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_POLICY_COPY,
  requiresDeposit,
} from '@/lib/constants'
import { formatEventLocalTime, getEventDateRangeUtc, getEventLocalIsoDate } from '@/lib/event-calendar'
import {
  getBookingAttributionPayload,
  getMarketingConsentSignalPayload,
  type BookingAttributionPayload,
} from '@/lib/booking-attribution'
import {
  formatTimeNoSeconds,
  getEffectiveDayHours,
  isKitchenClosed,
  isVenueClosed,
} from '@/lib/hours-utils'
import { PayPalDepositSection } from './PayPalDepositSection'
import { PhoneLink } from '@/components/PhoneLink'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { getAircraftOverheadNotePartsForDateTime } from '@/lib/heathrow-runway-alternation'
import { CommunicationConsentFields } from '@/components/CommunicationConsentFields'
import {
  DEFAULT_COMMUNICATION_CONSENT_STATE,
  buildCommunicationConsentPayload,
  type CommunicationConsentState,
} from '@/lib/communication-consent'
import { buildSubmitIntentFingerprint } from '@/lib/table-booking-idempotency'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type LookupState = 'idle' | 'loading' | 'known' | 'unknown'
type BookingStep = 'find' | 'choose' | 'details' | 'review'

// The pre-verification lookup deliberately identifies nobody (review F10):
// the route answers whether the number is known and nothing else. Known
// customers keep their skip-the-details flow; the management API resolves the
// customer record server-side from the phone number at booking time.
type CustomerLookupResult = {
  known: boolean
  lookup_degraded?: boolean
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
    | 'slot_full'
    | 'blocked'
    | null
  next_step_url: string | null
  hold_expires_at: string | null
  table_name: string | null
  notification_channel?: 'email' | 'whatsapp' | 'sms' | null
  booking_id?: string
  deposit_amount?: number
  // Set by the management API when inline PayPal setup fails for a 10+ booking.
  // Surfaced to the customer as a recovery link alongside the call-us copy.
  // See spec §6 ("Failed-PayPal recovery") and §8.1 (PayPal failure recovery).
  fallback_payment_url?: string | null
  payment_required?: boolean
  // High chairs actually reserved by the server (may be < requested), the
  // requested count echoed back, and the outside-seating flag. Used on the
  // confirmation screen to reflect the granted result (spec §10).
  high_chairs_granted?: number
  high_chair_count?: number
  is_outside_seating?: boolean
}

function confirmationDeliveryCopy(channel?: ManagementTableBookingResult['notification_channel']): string {
  if (channel === 'email') return "We've sent confirmation details by email."
  if (channel === 'whatsapp') return "We've sent confirmation details by WhatsApp."
  if (channel === 'sms') return "We've sent confirmation details by SMS."
  return "We've sent confirmation details."
}

type AvailabilitySlot = {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  kitchen_open?: boolean
  busyness?: 'quiet' | 'filling' | 'busy'
  // High chairs still free in this slot's window (advisory; the server is the
  // authoritative gate). Absent when the API does not report it — treat as
  // "unknown" and leave the chair picker enabled (fail-open, spec D7).
  high_chairs_remaining?: number
}

type AvailabilityData = {
  date: string
  available: boolean
  time_slots: AvailabilitySlot[]
  message?: string
  special_notes?: string
  // 'unknown' means the authoritative check could not run (AMS load missing or
  // timed out). The form must offer a retry and the phone number, and must
  // never present locally guessed slots as bookable (review F04).
  calculation_state?: 'complete' | 'unknown'
  // These times are drinks only because the food question could not be checked,
  // NOT because the kitchen is shut. Never set on a genuine kitchen-closed day,
  // where drinks only is simply the truth and there is nothing to explain.
  food_check_unavailable?: boolean
}

type SelectedSlotService = {
  date: string
  time: string
  kitchen_open?: boolean
}

type AlternativeSlot = SelectedSlotService

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
  }
}

const STEP_ORDER: BookingStep[] = ['find', 'choose', 'details', 'review']

// House cap on high chairs per booking. The slot's advisory remaining figure
// never clamps the guest's request (review F06); it drives the shortfall
// acknowledgement instead.
const HIGH_CHAIR_HOUSE_CAP = 2

// Upper bound on an availability request from the browser. The server side has
// its own 3s-per-attempt budget with one retry, so this only has to catch a
// connection that stalls without ever failing.
const AVAILABILITY_REQUEST_TIMEOUT_MS = 12_000

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
  // The kitchen's pacing ceiling for that arrival window, not the tables. The
  // management API has always been able to answer slot_full and the website had
  // no copy for it, so a genuine pacing refusal fell through to the generic
  // line below and told the guest nothing they could act on.
  slot_full: 'Our kitchen is fully booked around that time. Please try a slightly earlier or later slot, or give us a ring on 01753 682707.',
  blocked: 'This slot is not available for online booking right now.'
}

function toIsoDateInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return londonIsoDate(date)
}

function getDefaultTimeValue(): string {
  // Compute "now + 1 hour, rounded up to the next 30-minute slot" in
  // Europe/London. The previous implementation used the browser-local clock,
  // which is wrong for any visitor whose device is not on UK time.
  const { minutes } = londonNowParts()
  const next = Math.ceil((minutes + 60) / 30) * 30
  if (next >= 1440) {
    // Crosses midnight; clamp to last valid 30-min slot of today instead of
    // wrapping to 00:00. Wrapping with `% 1440` while the date stays today
    // confuses the customer and causes the search to submit a time that has
    // already passed earlier on the same London day. We deliberately do not
    // auto-advance the date here because that would also need to coordinate
    // with the date input default; the customer can change either field.
    // See codex AB-002 / WF-003.
    return '23:30'
  }
  return toTimeString(next)
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
    lookup_degraded: Boolean(data?.lookup_degraded)
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

    // High chairs remaining: defensive number parse. Undefined when absent or
    // unparseable so the picker stays enabled (fail-open, spec D7).
    const rawHighChairs = source.high_chairs_remaining
    let highChairsRemaining: number | undefined
    if (typeof rawHighChairs === 'number' && Number.isFinite(rawHighChairs)) {
      highChairsRemaining = Math.max(0, Math.floor(rawHighChairs))
    } else if (typeof rawHighChairs === 'string' && rawHighChairs.trim().length > 0) {
      const parsedHighChairs = Number.parseInt(rawHighChairs.trim(), 10)
      if (Number.isFinite(parsedHighChairs)) {
        highChairsRemaining = Math.max(0, parsedHighChairs)
      }
    }

    timeSlots.push({
      time,
      available,
      available_capacity: availableCapacity,
      reason: typeof source.reason === 'string' ? source.reason : undefined,
      kitchen_open:
        typeof source.kitchen_open === 'boolean' ? source.kitchen_open : undefined,
      busyness:
        source.busyness === 'quiet' || source.busyness === 'filling' || source.busyness === 'busy'
          ? source.busyness
          : undefined,
      ...(highChairsRemaining !== undefined
        ? { high_chairs_remaining: highChairsRemaining }
        : {})
    })
  }

  const calculationState =
    data?.calculation_state === 'unknown'
      ? 'unknown'
      : data?.calculation_state === 'complete'
      ? 'complete'
      : undefined

  return {
    date: typeof data?.date === 'string' ? data.date : '',
    available: Boolean(data?.available) || timeSlots.some((slot) => slot.available === true),
    time_slots: calculationState === 'unknown' ? [] : timeSlots,
    message: typeof data?.message === 'string' ? data.message : undefined,
    special_notes: typeof data?.special_notes === 'string' ? data.special_notes : undefined,
    ...(calculationState ? { calculation_state: calculationState } : {}),
    ...(data?.food_check_unavailable === true ? { food_check_unavailable: true } : {})
  }
}

// The client-side equivalent of the route's `availability_unknown` answer, for
// when the request never completed at all (network failure, 5xx). "We could not
// check" and "there is nothing free" are different answers to the guest, and
// only one of them is true here.
function unknownAvailability(targetDate: string): AvailabilityData {
  return {
    date: targetDate,
    available: false,
    time_slots: [],
    calculation_state: 'unknown'
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

function formatTimeList(times: string[]): string {
  if (times.length === 0) return ''
  if (times.length === 1) return times[0]
  return `${times.slice(0, -1).join(', ')} and ${times[times.length - 1]}`
}

function busynessCaption(busyness: AvailabilitySlot['busyness']): string | null {
  if (busyness === 'busy') return 'Busiest time'
  if (busyness === 'filling') return 'Getting busy'
  if (busyness === 'quiet') return 'Plenty of space'
  return null
}

function shouldNudgeForBusyness(busyness: AvailabilitySlot['busyness']): boolean {
  return busyness === 'filling' || busyness === 'busy'
}

function busynessAdvisory(slot: AvailabilitySlot | null): string | null {
  if (!slot || !shouldNudgeForBusyness(slot.busyness)) return null

  if (slot.busyness === 'busy') {
    return `You've chosen one of our busiest times. We'll still be happy to see you, but food and drinks may take a little longer. If you're flexible, a slightly earlier or later table may mean a smoother visit.`
  }

  return `You've chosen a busier time. If you're flexible, a slightly earlier or later table may mean a smoother visit.`
}

function isQuieterSlot(selectedBusyness: AvailabilitySlot['busyness'], candidateBusyness: AvailabilitySlot['busyness']): boolean {
  if (selectedBusyness === 'busy') return candidateBusyness === 'quiet' || candidateBusyness === 'filling'
  if (selectedBusyness === 'filling') return candidateBusyness === 'quiet'
  return false
}

function addDays(isoDate: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  // Pure UTC arithmetic, no London-format roundtrip. We never go through a
  // timezone formatter, so BST/GMT transitions cannot affect the calendar
  // date result. See codex AB-001.
  const date = new Date(Date.UTC(year, month - 1, day + days))
  const resultYear = date.getUTCFullYear()
  const resultMonth = String(date.getUTCMonth() + 1).padStart(2, '0')
  const resultDay = String(date.getUTCDate()).padStart(2, '0')
  return `${resultYear}-${resultMonth}-${resultDay}`
}

function isPastLondonDate(value: string): boolean {
  // Compare YYYY-MM-DD strings against London today. We deliberately do NOT
  // parse `value` with `new Date(...)`, that would re-introduce browser-local
  // timezone drift on the customer's device.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value < londonNowParts().isoDate
}

function getLondonIsoDate(dateTimeValue: string): string | null {
  return getEventLocalIsoDate(dateTimeValue)
}

function formatEventTimeLabel(dateTimeValue: string): string {
  return formatEventLocalTime(dateTimeValue, { includeMinutesWhenZero: true })
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
    const leftTime = getEventDateRangeUtc(left).start.getTime()
    const rightTime = getEventDateRangeUtc(right).start.getTime()
    return leftTime - rightTime
  })
}

// Numbered step indicator (spec §9): 28px circles — pending sunk/muted, active
// gold/white, done green/white check — joined by 2px hairline bars. Labels
// Outfit 600 text-sm; pending-step labels hide ≤640px (numbers always show).
function BookingProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = STEP_ORDER.map((stepKey, index) => ({
    key: stepKey,
    label: STEP_LABELS[stepKey],
    number: index + 1
  }))

  return (
    <div
      className="mb-2"
      role="progressbar"
      aria-label="Booking progress"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
      aria-valuetext={`Step ${currentStep} of ${totalSteps}: ${STEP_LABELS[STEP_ORDER[currentStep - 1]]}`}
    >
      <ol className="flex items-center" role="list">
        {steps.map((step, index) => {
          const isComplete = step.number < currentStep
          const isCurrent = step.number === currentStep
          const isPending = step.number > currentStep

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-sm font-semibold font-sans ${
                    isCurrent
                      ? 'bg-anchor-gold-dark text-white'
                      : isComplete
                      ? 'bg-anchor-green text-white'
                      : 'bg-surface-sunk text-ink-muted'
                  }`}
                >
                  {isComplete ? <Check aria-hidden="true" className="h-4 w-4" /> : step.number}
                </span>
                <span
                  className={`text-sm font-semibold font-sans leading-tight ${
                    isCurrent ? 'text-ink-strong' : 'text-ink-muted'
                  } ${isPending ? 'hidden sm:block' : ''}`}
                >
                  {step.label}
                  {isCurrent ? (
                    <span className="sr-only"> (current step, {currentStep} of {totalSteps})</span>
                  ) : null}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`mx-2 h-0.5 flex-1 ${isComplete ? 'bg-anchor-green' : 'bg-line-strong'}`}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFormProps) {
  // Trigger re-renders so time-based cutoffs update without requiring a reload.
  // (Retained because the LaunchAnnouncement, hold-expiry and other time-derived
  // surfaces benefit from a periodic tick; the legacy Sunday-lunch / Mother's-Day
  // cutoff calculations that originally drove this have been retired in §8.1.)
  //
  // Re-render tick only. Booking date/time computations must use Europe/London
  // helpers (londonIsoDate / londonNowParts), not the browser-local value below.
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
  const bookingType = useMemo(() => {
    const raw = searchParams?.get('bookingType')?.trim() || searchParams?.get('booking_type')?.trim()
    if (raw === 'sunday_roast' || raw === 'sunday_lunch') return 'sunday_roast'
    if (bookingSource.toLowerCase().includes('sunday')) return 'sunday_roast'
    return 'regular'
  }, [bookingSource, searchParams])

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
      bookingType,
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
      bookingType,
      deviceType: getDeviceType(),
    })
  }

  const today = useMemo(() => londonNowParts().isoDate, [])
  const defaultDate = toIsoDateInputValue(prefill?.date) || today
  const defaultRequestedTime = toTimeInputValue(prefill?.time) || getDefaultTimeValue()
  const defaultPartySize = Math.min(Math.max(prefill?.partySize || 2, 1), 20)

  const [step, setStep] = useState<BookingStep>('find')

  const [partySize, setPartySize] = useState(defaultPartySize)
  const [partySizeDisplay, setPartySizeDisplay] = useState(String(defaultPartySize))
  const [date, setDate] = useState(defaultDate)
  const [requestedTime, setRequestedTime] = useState(defaultRequestedTime)
  const [selectedTime, setSelectedTime] = useState<string>('')
  // Step-2 slot window. `slotWindowAnchorTime` is captured at search time so
  // selecting a slot (which mutates `requestedTime`) does not re-centre the
  // visible grid; `showAllTimes` toggles the "See more times" expander.
  const [showAllTimes, setShowAllTimes] = useState(false)
  const [slotWindowAnchorTime, setSlotWindowAnchorTime] = useState(defaultRequestedTime)
  // Captured at slot-select time so the submit step can derive `purpose`
  // ('food' | 'drinks') from the slot's `kitchen_open` flag without re-fetching
  // availability, covers the nearest-alternative path where the slot is not
  // in the current `availability.time_slots`.
  const [selectedSlotService, setSelectedSlotService] =
    useState<SelectedSlotService | null>(null)

  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [alternativeSlots, setAlternativeSlots] = useState<AlternativeSlot[]>([])
  const [alternativesLoading, setAlternativesLoading] = useState(false)
  const [eventsByDate, setEventsByDate] = useState<Record<string, SuggestedEvent[]>>({})
  const [eventErrorsByDate, setEventErrorsByDate] = useState<Record<string, string>>({})
  const [eventsLoadingDate, setEventsLoadingDate] = useState<string | null>(null)
  const [dismissedEventDates, setDismissedEventDates] = useState<string[]>([])
  const [selectedSuggestedEvent, setSelectedSuggestedEvent] = useState<SuggestedEvent | null>(null)
  const previousDateRef = useRef(date)
  const availabilityControllerRef = useRef<AbortController | null>(null)
  // Latest-wins guard for runAvailabilitySearch. Bumped by every search and by
  // any seating-options change, so a response that no longer matches what the
  // guest asked for is discarded instead of written to state.
  const availabilitySearchRef = useRef(0)
  // Stale-search guard for loadNearestAlternatives. Each call captures its own
  // monotonically-increasing id; only the latest call is allowed to write to
  // alternativeSlots. Bumped by every search-input change so an in-flight
  // request from an abandoned search context cannot repopulate the panel.
  const nearestAlternativesRequestRef = useRef(0)

  const [phone, setPhone] = useState('')
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupDegraded, setLookupDegraded] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [highChairCount, setHighChairCount] = useState(0)
  const [isOutsideSeating, setIsOutsideSeating] = useState(false)

  // "Just drinks?" rather than a food-or-drinks question. Food is the default and is right
  // 99.4% of the time; the toggle exists because 76 of 101 drinks bookings were made DURING
  // kitchen hours, so the clock cannot be used to guess. Ticking it switches the house order
  // to the bar, shortens the turn, drops out of kitchen pacing and reveals slots when the
  // kitchen is shut.
  const [drinksOnly, setDrinksOnly] = useState(false)

  // A seating requirement, never a reason or a diagnosis. Small Bay has a step and High 4 is
  // bar height, so this is a real filter, not a preference.
  const [requiresAccessibleTable, setRequiresAccessibleTable] = useState(false)

  // Any of these changes which TABLES qualify, so a reading taken before the change is stale.
  // A stale slot must never be trusted: otherwise a guest can choose a time, then say they need
  // an accessible table, and book a slot that was never valid for them.
  //
  // But clearing it on its own stranded them. High chairs and outside seating live on the DETAILS
  // step, after the time has been chosen, so ticking either wiped the slot while the summary kept
  // showing the old time. Nothing re-fetched, so Continue bounced them back to a slot list reading
  // "No online times available" and the only way out was Back and search again. So: re-read
  // availability with the new inputs and keep their time if it survives, and only interrupt them
  // when it genuinely does not.
  const availabilityInputsKey = `${drinksOnly}|${requiresAccessibleTable}|${highChairCount}|${isOutsideSeating}`
  const previousAvailabilityInputs = useRef(availabilityInputsKey)
  const [revalidatingAvailability, setRevalidatingAvailability] = useState(false)
  // Only the LATEST re-read owns the pending flag. It used to be cleared in an
  // async `finally` guarded by `if (!cancelled)`, so a re-run that superseded an
  // in-flight read skipped the clear, and if that re-run then took the early
  // return below it never cleared it either. The flag stuck true for the life of
  // the component and validateDetailsStep refused every Continue with "Just
  // checking that time is still free" forever, with nothing on screen to
  // explain it.
  const revalidateRequestRef = useRef(0)

  useEffect(() => {
    if (previousAvailabilityInputs.current === availabilityInputsKey) return
    previousAvailabilityInputs.current = availabilityInputsKey

    // Any in-flight "Find a table" search was asked about the OLD options, so
    // its answer is worthless now. Abort it and invalidate it: it was only ever
    // aborted by the NEXT search, so it used to resolve and drag the guest to
    // the choose step with a time nothing had affirmed for the new options.
    availabilityControllerRef.current?.abort()
    availabilityControllerRef.current = null
    availabilitySearchRef.current++

    // On the find step nothing is chosen yet, so drop the stale reading and let the
    // "Find a table" button fetch with the new inputs.
    if (step === 'find' || !date || !selectedTime) {
      revalidateRequestRef.current++
      setRevalidatingAvailability(false)
      setAvailabilityLoading(false)
      setAvailability(null)
      setSelectedTime('')
      setSelectedSlotService(null)
      setAlternativeSlots([])
      return
    }

    const timeAtChange = selectedTime
    const controller = new AbortController()
    let cancelled = false
    const requestId = ++revalidateRequestRef.current

    setRevalidatingAvailability(true)
    void (async () => {
      try {
        const data = await fetchAvailabilityForDate(date, timeAtChange, partySize, controller.signal)
        if (cancelled) return

        setAvailability(data)
        setAlternativeSlots([])

        if (data.calculation_state === 'unknown') {
          // The re-read could not check live availability, so neither the old
          // reading nor the chosen time can be trusted. Put them on the choose
          // step's retry state rather than claiming the time has gone.
          trackSlotInvalidated({ reason: 'availability_error' })
          setSelectedTime('')
          setSelectedSlotService(null)
          setStep('choose')
          showBookingError(
            'availability_unknown',
            'We could not check that time with those options. Please try again.'
          )
          return
        }

        const stillFree = data.time_slots.some(
          (slot) => slot.time === timeAtChange && isSlotAvailable(slot, partySize)
        )
        if (stillFree) {
          setSelectedTime(timeAtChange)
          return
        }

        // Genuinely unavailable now. Say why, and put them on the slot list, which this
        // re-read has just filled with real alternatives.
        trackSlotInvalidated({ reason: 'options_changed' })
        setSelectedTime('')
        setSelectedSlotService(null)
        setStep('choose')
        showBookingError(
          'slot_options_changed',
          `${formatTimeForDisplay(timeAtChange)} is not available with those options. Please choose another time.`
        )
      } catch (caught) {
        if (cancelled || (caught as Error)?.name === 'AbortError') return
        // Never leave a stale reading on screen, and never let the failure read
        // as "no tables" either: the re-read did not answer, so availability is
        // unknown and the guest gets the retry state, not a false full-house.
        trackSlotInvalidated({ reason: 'availability_error' })
        setAvailability(unknownAvailability(date))
        setSelectedTime('')
        setSelectedSlotService(null)
        setAlternativeSlots([])
        setStep('choose')
        setAvailabilityError(
          'We could not check that time with those options. Please try again.'
        )
      } finally {
        // Whoever is the latest re-read clears the flag, cancelled or not. A
        // superseded run must never clear it (the newer one is still working)
        // and must never leave it set (nothing else would clear it).
        if (requestId === revalidateRequestRef.current) {
          setRevalidatingAvailability(false)
        }
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
    // Deliberately keyed on the seating inputs alone. This effect SETS selectedTime and
    // availability, so listing them would re-run it mid-flight and the cleanup would abort the
    // very fetch we are waiting on. The ref guard above already limits the body to renders where
    // the seating inputs actually changed, and the values read come from that same render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityInputsKey])
  const [communicationConsent, setCommunicationConsent] = useState<CommunicationConsentState>(
    DEFAULT_COMMUNICATION_CONSENT_STATE
  )

  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [bookingIdForPayment, setBookingIdForPayment] = useState<string | null>(null)
  const [depositAmountForPayment, setDepositAmountForPayment] = useState<number>(0)
  const [paymentState, setPaymentState] = useState<'idle' | 'confirmed' | 'error'>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [submittedAttribution, setSubmittedAttribution] = useState<BookingAttributionPayload | null>(null)

  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Every guest-visible booking error also emits booking_error_shown with a
  // stable machine code (never the message, which can carry typed-in data).
  function showBookingError(code: string, message: string) {
    trackBookingErrorShown({ code })
    setError(message)
  }
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldRef>(null)
  const [website, setWebsite] = useState('')
  const formLoadedAt = useRef(Date.now())
  const [result, setResult] = useState<ManagementTableBookingResult | null>(null)
  const aircraftOverheadNote = useMemo(
    () => getAircraftOverheadNotePartsForDateTime(date, requestedTime),
    [date, requestedTime]
  )

  // Wizard root ref for scroll-to-top on step transitions. Mounted-guard ref
  // prevents the effect from firing on initial mount, only step changes
  // after first paint should scroll.
  const wizardRef = useRef<HTMLDivElement>(null)
  const wizardMountedRef = useRef(false)

  useEffect(() => {
    if (!wizardMountedRef.current) {
      wizardMountedRef.current = true
      return
    }
    wizardRef.current?.scrollIntoView({ block: 'start' })
  }, [step])

  // Analytics: each wizard step counts as viewed when it becomes the current
  // step, including the initial 'find' step on mount.
  useEffect(() => {
    trackBookingStepViewed({ step })
  }, [step])

  // Submit-intent idempotency cache. Reuse the same Idempotency-Key when the
  // customer retries a Confirm with the same booking payload, so the management
  // API's server-side dedupe recognises the retry. Generate a fresh key when
  // any meaningful payload field changes. Volatile fields (`_t`,
  // `turnstile_token`, `website`) are intentionally excluded from the
  // fingerprint, they can change between retries without changing the booking
  // intent. Stored in a ref because the value is never rendered and we need to
  // read/write it inside the submit handler without async state timing issues.
  const submitIntentKeyRef = useRef<{ fingerprint: string; key: string } | null>(null)

  const holdExpiry = formatHoldExpiry(result?.hold_expires_at || null)
  // Sunday roast as a separate booking type, the Saturday-1pm cutoff, the
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
  // The authoritative check could not run. Distinct from "checked and full":
  // the guest gets a retry and the phone number, never guessed slots (F04).
  const availabilityUnknown = availability?.calculation_state === 'unknown'
  // The grid is drinks-only because we could not check food, not because the
  // kitchen is shut. The `!drinksOnly` guard is belt and braces: the route only
  // sets the flag for a food-wanting guest, and toggling "Just drinks" refetches.
  const foodCheckUnavailable = availability?.food_check_unavailable === true && !drinksOnly
  const availableSlots = useMemo(
    () =>
      (availability?.time_slots || []).filter((slot) => isSlotAvailable(slot, partySize)),
    [availability?.time_slots, partySize]
  )
  // Visible step-2 slots: by default a 7-slot window centred on the search-time
  // anchor, expanded to the full list when the customer taps "See more times".
  const visibleSlots = useMemo(
    () =>
      showAllTimes
        ? availableSlots
        : pickSlotWindow(availableSlots, slotWindowAnchorTime),
    [availableSlots, showAllTimes, slotWindowAnchorTime]
  )
  const selectedSlot = useMemo(
    () => availableSlots.find((slot) => slot.time === selectedTime) || null,
    [availableSlots, selectedTime]
  )
  // Advisory remaining count for the chosen slot; undefined when the API does
  // not report one (treat as unknown and leave the picker enabled, spec D7).
  const slotHighChairsRemaining = useMemo(() => {
    const remaining = selectedSlot?.high_chairs_remaining
    if (typeof remaining === 'number' && Number.isFinite(remaining)) {
      return Math.max(0, Math.floor(remaining))
    }
    return undefined
  }, [selectedSlot])
  // The guest asked for more chairs than the chosen slot has free. The request
  // is never silently reduced (review F06): they must explicitly acknowledge
  // the shortfall before continuing, and the ORIGINAL request is submitted so
  // the server can grant what it truly has at create time.
  const highChairShortfall =
    slotHighChairsRemaining !== undefined && highChairCount > slotHighChairsRemaining
      ? { free: slotHighChairsRemaining, requested: highChairCount }
      : null
  const [highChairShortfallAcknowledged, setHighChairShortfallAcknowledged] = useState(false)
  // Any change to the shortfall context (slot, request, or the slot's advisory
  // figure) invalidates a previous acknowledgement.
  useEffect(() => {
    setHighChairShortfallAcknowledged(false)
  }, [selectedTime, highChairCount, slotHighChairsRemaining])
  // Analytics: the shortfall flag surfaced for this context. Primitive deps so
  // the event fires once per context change, not on every render.
  const highChairShortfallFree = highChairShortfall ? highChairShortfall.free : undefined
  const highChairShortfallRequested = highChairShortfall ? highChairShortfall.requested : undefined
  useEffect(() => {
    if (highChairShortfallFree === undefined || highChairShortfallRequested === undefined) return
    trackSlotFlagShown({
      chairsFree: highChairShortfallFree,
      chairsRequested: highChairShortfallRequested
    })
  }, [highChairShortfallFree, highChairShortfallRequested])
  // With no chairs left and none requested there is nothing to pick; the copy
  // below explains instead. A carried-over request keeps the stepper visible
  // so the guest can still reduce it.
  const hideHighChairPicker = slotHighChairsRemaining === 0 && highChairCount === 0
  const quieterSlots = useMemo(() => {
    if (!selectedSlot || !shouldNudgeForBusyness(selectedSlot.busyness)) return []
    const selectedMinutes = toMinutes(selectedSlot.time)
    return availableSlots
      .filter((slot) => slot.time !== selectedSlot.time && isQuieterSlot(selectedSlot.busyness, slot.busyness))
      .sort((a, b) => Math.abs(toMinutes(a.time) - selectedMinutes) - Math.abs(toMinutes(b.time) - selectedMinutes))
      .slice(0, 2)
  }, [availableSlots, selectedSlot])
  const quieterTimeLabel = formatTimeList(quieterSlots.map((slot) => formatTimeForDisplay(slot.time)))
  const selectedSlotAdvisory = busynessAdvisory(selectedSlot)

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
      footer: null as string | null
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
    targetPartySize: number,
    signal?: AbortSignal
  ): Promise<AvailabilityData> {
    const params = new URLSearchParams({
      date: targetDate,
      party_size: String(targetPartySize),
      time: targetTime,
      // Everything that changes which TABLES qualify. Sending only the date and party size is
      // why the site used to answer the same whether you wanted food or drinks.
      purpose: drinksOnly ? 'drinks' : 'food',
      outside: String(isOutsideSeating),
      requires_accessible_table: String(requiresAccessibleTable),
      high_chair_count: String(highChairCount)
    })

    // A stalled connection used to hold this request open for as long as the
    // socket lived, and the details step stays blocked while a re-read is in
    // flight, so "no timeout" meant "blocked indefinitely with nothing on
    // screen". Bound it, and make sure the timeout surfaces as a real error
    // rather than as the AbortError that callers deliberately swallow.
    const controller = new AbortController()
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, AVAILABILITY_REQUEST_TIMEOUT_MS)
    const forwardAbort = () => controller.abort()
    if (signal?.aborted) controller.abort()
    signal?.addEventListener('abort', forwardAbort)

    try {
      const response = await fetch(`/api/table-bookings/availability?${params.toString()}`, {
        cache: 'no-store',
        signal: controller.signal
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
    } catch (failure) {
      if (timedOut) {
        throw new Error(
          'We could not check availability in time. Please try again or call us at 01753 682707.'
        )
      }
      throw failure
    } finally {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', forwardAbort)
    }
  }

  async function loadNearestAlternatives(
    targetDate: string,
    targetTime: string,
    targetPartySize: number
  ) {
    const requestId = ++nearestAlternativesRequestRef.current
    setAlternativesLoading(true)
    setAlternativeSlots([])

    try {
      const dateCandidates = [1, 2, 3].map((offset) => addDays(targetDate, offset))
      const candidateResponses = await Promise.all(
        dateCandidates.map(async (candidateDate) => {
          try {
            return await fetchAvailabilityForDate(candidateDate, targetTime, targetPartySize)
          } catch {
            return null
          }
        })
      )

      // Stale-search guard: if a newer search has started while these candidate
      // requests were in flight, drop this response on the floor, the newer
      // call owns the alternatives panel now.
      if (requestId !== nearestAlternativesRequestRef.current) {
        return
      }

      const alternatives: AlternativeSlot[] = []
      for (const response of candidateResponses) {
        if (!response) continue

        const slots = response.time_slots
          .filter((slot) => isSlotAvailable(slot, targetPartySize))
          .slice(0, 2)
          .map((slot) => ({
            date: response.date || targetDate,
            time: slot.time,
            kitchen_open: slot.kitchen_open
          }))

        alternatives.push(...slots)
        if (alternatives.length >= 6) {
          break
        }
      }

      setAlternativeSlots(alternatives.slice(0, 6))
    } finally {
      // Only the latest request resets the loading flag. Earlier in-flight
      // requests must not flip the spinner off while a newer search is loading.
      if (requestId === nearestAlternativesRequestRef.current) {
        setAlternativesLoading(false)
      }
    }
  }

  async function runAvailabilitySearch(input: {
    targetDate: string
    targetTime: string
    targetPartySize: number
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

    // Latest search wins. Without this, a search still in flight when the guest
    // changed a seating option came back and wrote its answer to state anyway,
    // dragging them to the choose step with a time affirmed for the OLD options
    // (the accessible-table box ticked, but the slot checked without it). The
    // options effect bumps this ref, so a superseded response is dropped.
    const searchId = ++availabilitySearchRef.current

    const availabilityData = await fetchAvailabilityForDate(
      input.targetDate,
      input.targetTime,
      input.targetPartySize,
      input.signal
    )

    if (searchId !== availabilitySearchRef.current) return

    // Funnel: an availability check completed. Documented since the funnel
    // launched but never fired until now (spec W1).
    trackTableBookingFunnel({
      step: 'availability_check',
      partySize: input.targetPartySize,
      bookingDate: input.targetDate,
      bookingTime: input.targetTime,
      source: bookingSource,
      bookingType,
      deviceType: getDeviceType(),
    })

    const closestTime = pickClosestSlot(
      availabilityData.time_slots,
      input.targetTime,
      input.targetPartySize
    )

    setDate(input.targetDate)
    setRequestedTime(input.targetTime)
    // Pin the slot-window anchor at the originally-requested time. Subsequent
    // slot selections may move `requestedTime`, but the visible window stays put.
    setSlotWindowAnchorTime(input.targetTime)
    setShowAllTimes(false)
    setAvailability(availabilityData)
    setSelectedTime(closestTime || '')
    // A new availability response invalidates the previous slot selection.
    setSelectedSlotService(null)
    setStep('choose')

    if (!closestTime && availabilityData.calculation_state !== 'unknown') {
      // No point probing nearby dates while the checker itself is unavailable;
      // those probes would come back unknown too. The choose step shows the
      // retry state instead.
      void loadNearestAlternatives(input.targetDate, input.targetTime, input.targetPartySize)
    }
  }

  async function handleFindTable() {
    // Sync partySizeDisplay → partySize on submit in case blur hasn't fired.
    // The clamped value is also threaded explicitly through the availability
    // search so the network request sees the freshly-typed size, not stale state.
    const parsedSize = Number.parseInt(partySizeDisplay, 10)
    const clampedSize = (!Number.isFinite(parsedSize) || parsedSize < 1) ? 1 : Math.min(parsedSize, 20)
    setPartySize(clampedSize)
    setPartySizeDisplay(String(clampedSize))

    // Reject past dates before hitting the API. Compared as YYYY-MM-DD strings
    // against Europe/London today, the customer's browser-local clock is
    // intentionally ignored.
    if (isPastLondonDate(date)) {
      setDateError('Please select a future date')
      return
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
    nearestAlternativesRequestRef.current++
    setShowAllTimes(false)
    // A new availability search starts a new submit-intent. Drop any cached
    // idempotency key so the next Confirm cannot accidentally dedupe with a
    // pre-search booking attempt. See spec §13.2.
    clearSubmitIntentIdempotencyKey()

    try {
      await runAvailabilitySearch({
        targetDate: date,
        targetTime: requestedTime,
        targetPartySize: clampedSize,
        source: 'book_table_find_table',
        context: 'availability_first',
        signal: controller.signal
      })
    } catch (availabilityFailure: unknown) {
      if (availabilityFailure instanceof Error && availabilityFailure.name === 'AbortError') return
      trackBookingErrorShown({ code: 'availability_check_failed' })
      // A failed check means availability is UNKNOWN, never "no tables".
      // Clearing it to null used to drop the choose step out of the unknown
      // state, taking the retry button and the phone number with it and
      // falling through to "No online times available": one tap turned "we
      // could not check" into a confident, wrong "the pub is full" with no way
      // back. Hold the unknown state so the retry affordance survives.
      setAvailability(unknownAvailability(date))
      setSelectedTime('')
      setSelectedSlotService(null)
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

  function handleSlotSelect(slot: AvailabilitySlot) {
    setSelectedTime(slot.time)
    setRequestedTime(slot.time)
    setSelectedSlotService({
      date,
      time: slot.time,
      kitchen_open: slot.kitchen_open
    })
    trackTableBookingClick({
      source: 'book_table_slot_selected',
      context: 'availability_step'
    })
  }

  function handleChooseAlternative(alternative: AlternativeSlot) {
    setDate(alternative.date)
    setRequestedTime(alternative.time)
    setSelectedTime(alternative.time)
    // Carry the alternative's kitchen_open through so submit-time purpose
    // derivation can find the slot even though the current `availability`
    // belongs to the originally-requested date.
    setSelectedSlotService({
      date: alternative.date,
      time: alternative.time,
      kitchen_open: alternative.kitchen_open
    })
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

  function handleRequestedTimeChange(value: string) {
    markFunnelStart()
    setRequestedTime(value)
    // Do NOT set the slot-window anchor here, the anchor is search-time
    // state, owned exclusively by `runAvailabilitySearch` (spec §5.2).
    // Mutating it from a draft input handler couples input state to choose-
    // step rendering and can re-centre stale availability after a failed or
    // unsubmitted edit. See codex ARCH-002.
    setShowAllTimes(false)
    setSelectedSlotService(null)
    nearestAlternativesRequestRef.current++
  }

  function handleDateChange(value: string) {
    markFunnelStart()
    setDate(value)
    setAvailability(null)
    setAlternativeSlots([])
    nearestAlternativesRequestRef.current++
    setSelectedTime('')
    setSelectedSlotService(null)
    setShowAllTimes(false)
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Past-date validation runs in Europe/London. Do not parse value with
      // `new Date(...)` for booking validation, that re-introduces the
      // browser-local timezone bug on travellers outside the UK.
      setDateError(isPastLondonDate(value) ? 'Please select a future date' : null)
    } else {
      setDateError(null)
    }
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
        <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink-muted">
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
        className={`rounded-md border p-4 ${
          options.highlight
            ? 'border-anchor-gold bg-surface-raised'
            : 'border-line bg-surface-sunk'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-ink-strong">{options.title}</p>
            <p className="mt-1 text-sm text-ink-muted">{options.description}</p>
            <p className="mt-1 text-xs text-ink-muted">Tap an event below to book it without leaving this page.</p>
          </div>
          <button
            type="button"
            onClick={dismissEventSuggestionsForDate}
            className="text-xs font-medium text-ink-muted underline hover:text-ink"
          >
            Hide
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {selectedDateEvents.map((event) => {
            return (
              <div
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-sm border border-line bg-surface px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-strong">{event.name}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatEventTimeLabel(event.startDate)}
                    {event.priceLabel ? ` • ${event.priceLabel}` : ' • Free entry'}
                    {typeof event.seatsRemaining === 'number'
                      ? ` • ${event.seatsRemaining} seat${event.seatsRemaining === 1 ? '' : 's'} left`
                      : ''}
                  </p>
                  {event.shortDescription ? (
                    <p className="mt-1 text-xs text-ink-muted line-clamp-2">{event.shortDescription}</p>
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
        setLookupDegraded(false)
      } else {
        setLookupState('unknown')
        setLookupDegraded(Boolean(lookup.lookup_degraded))
      }
    } catch (lookupFailure: any) {
      trackBookingErrorShown({ code: 'lookup_failed' })
      setLookupState('idle')
      setLookupError(lookupFailure?.message || 'Unable to verify this number right now.')
      setLookupDegraded(false)
    }
  }

  function resetPhoneLookup() {
    setLookupState('idle')
    setLookupError(null)
    setLookupDegraded(false)
    setFirstName('')
    setLastName('')
    setEmail('')
    setError(null)
  }

  function validateDetailsStep(): boolean {
    // A re-read is in flight because they just changed high chairs or outside seating. Their time
    // may be about to be confirmed or replaced, so do not let them submit against it mid-flight.
    if (revalidatingAvailability) {
      showBookingError('availability_revalidating', 'Just checking that time is still free. One moment.')
      return false
    }

    if (!selectedTime) {
      setStep('choose')
      showBookingError('no_time_selected', 'Please select a time before continuing.')
      return false
    }

    if (!phone.trim()) {
      showBookingError('phone_missing', 'Please enter your mobile number.')
      return false
    }

    if (!detailsUnlocked) {
      showBookingError('phone_not_verified', 'Please verify your mobile number first.')
      return false
    }

    // Only the first name is required; the surname is optional end to end
    // (spec W2 as corrected by review F09: AMS already stores an empty
    // surname and the proxy already omits a blank one from the payload).
    if (!isKnownCustomer && !firstName.trim()) {
      showBookingError('name_missing', 'Please enter your first name.')
      return false
    }

    // A high-chair shortfall needs an explicit tap before the guest can carry
    // on (review F06): information about fewer chairs is not consent to book
    // with fewer chairs.
    if (highChairShortfall && !highChairShortfallAcknowledged) {
      showBookingError(
        'high_chair_shortfall_unacknowledged',
        highChairShortfall.free === 0
          ? 'Please confirm you are happy to book without a high chair first.'
          : `Please confirm you are happy to book with ${highChairShortfall.free} high chair${highChairShortfall.free === 1 ? '' : 's'} first.`
      )
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

    // Funnel: guest details passed validation. Documented since the funnel
    // launched but never fired until now (spec W1).
    trackTableBookingFunnel({
      step: 'details_entered',
      partySize,
      bookingDate: date,
      bookingTime: selectedTime,
      source: bookingSource,
      bookingType,
      deviceType: getDeviceType(),
    })

    setStep('review')
  }

  // Derive the management-API `purpose` field from the chosen slot's
  // `kitchen_open` flag. Strict rule (spec §8 → "Submit Purpose Derivation"):
  //   1. Prefer `selectedSlotService` if it matches the current date/time.
  //   2. Otherwise look up the slot in the current `availability.time_slots`.
  //   3. If a matching slot exists and `kitchen_open === false`, return 'drinks'.
  //   4. If a matching slot exists and `kitchen_open` is `true` or `undefined`, return 'food'.
  //   5. If no matching slot can be found, return null, the caller must block submit.
  function deriveSubmitPurpose(): 'food' | 'drinks' | null {
    // If the guest said "just drinks", that is the answer. Inferring from whether the kitchen
    // happens to be open was wrong for 76 of 101 drinks bookings in the last six months,
    // because most drinks bookings are made DURING kitchen hours. The inference below is kept
    // for everyone who did not tick the box.
    if (drinksOnly) return 'drinks'

    const matchService =
      selectedSlotService &&
      selectedSlotService.date === date &&
      selectedSlotService.time === selectedTime
        ? selectedSlotService
        : null
    if (matchService) {
      return matchService.kitchen_open === false ? 'drinks' : 'food'
    }
    const slot = availability?.time_slots.find((s) => s.time === selectedTime)
    if (!slot) return null
    return slot.kitchen_open === false ? 'drinks' : 'food'
  }

  // Reuse the cached idempotency key when the fingerprint matches the previous
  // submit intent; otherwise mint a new one and replace the cache entry.
  function getSubmitIntentIdempotencyKey(fingerprint: string): string {
    if (submitIntentKeyRef.current?.fingerprint === fingerprint) {
      return submitIntentKeyRef.current.key
    }
    const key = createClientIdempotencyKey('tbl_web')
    submitIntentKeyRef.current = { fingerprint, key }
    return key
  }

  function clearSubmitIntentIdempotencyKey() {
    submitIntentKeyRef.current = null
  }

  async function handleConfirmBooking() {
    setError(null)
    setResult(null)

    if (!validateDetailsStep()) {
      return
    }

    if (!policyAccepted) {
      showBookingError('policy_not_accepted', 'Please confirm you understand the booking and no-show policy before continuing.')
      return
    }

    const purpose = deriveSubmitPurpose()
    if (!purpose) {
      showBookingError('slot_context_lost', 'Please choose a time again before confirming.')
      setStep('choose')
      return
    }

    const trimmedPhone = phone.trim()
    const resolvedFirstName = firstName.trim()
    const resolvedLastName = lastName.trim()
    // Known customers submit no email; the management API already holds their
    // record and resolves it from the phone number.
    const resolvedEmail = (isKnownCustomer ? undefined : email.trim()) || undefined
    const trimmedNotes = notes.trim()
    // Submit the ORIGINAL request, never a value clamped to the advisory
    // remaining figure (review F06). The server re-checks atomically at create
    // and the confirmation screen shows granted-of-requested; the shortfall
    // acknowledgement above is the guest's consent to a possible shortfall.
    const resolvedHighChairCount = Math.max(0, highChairCount)
    const resolvedOutsideSeating = isOutsideSeating

    // Build the submit-intent fingerprint from non-volatile payload fields,
    // then look up (or mint) the idempotency key. This guarantees that a retry
    // of the same booking intent reuses the key, while a changed slot or guest
    // detail forces a new key. High-chair, outside and accessibility are all
    // included so a booking that differs only in those fields gets its own key.
    // See spec §13.2, §10 and review F18.
    const idempotencyFingerprint = buildSubmitIntentFingerprint({
      phone: trimmedPhone,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: resolvedEmail,
      date,
      time: selectedTime,
      partySize,
      purpose,
      notes: trimmedNotes,
      highChairCount: resolvedHighChairCount,
      isOutsideSeating: resolvedOutsideSeating,
      requiresAccessibleTable,
      communicationConsent
    })
    const idempotencyKey = getSubmitIntentIdempotencyKey(idempotencyFingerprint)

    setLoading(true)

    trackTableBookingClick({
      source: 'book_table_management_form',
      context: bookingType,
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
      bookingType,
      deviceType: getDeviceType(),
    })

    try {
      // Public payload no longer carries sunday_lunch / menu_selections / booking_type.
      // The proxy at /api/table-bookings strips these defensively (spec §6, §8.1)
      // and always forwards booking_type='regular' to the management API.
      // `purpose` is derived from the selected slot's kitchen_open flag, see
      // deriveSubmitPurpose() above.
      const storedAttribution = getBookingAttributionPayload()
      const attribution = {
        ...storedAttribution,
        ...getMarketingConsentSignalPayload(storedAttribution.fbclid),
      }
      setSubmittedAttribution(attribution)

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
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        // High-chair request (0 omitted) and outside-seating flag (false omitted).
        // Added before the idempotency key so it varies with them (spec §10).
        ...(resolvedHighChairCount > 0 ? { high_chair_count: resolvedHighChairCount } : {}),
        ...(resolvedOutsideSeating ? { is_outside_seating: true } : {}),
        ...(requiresAccessibleTable ? { requires_accessible_table: true } : {}),
        communication_consent: buildCommunicationConsentPayload(communicationConsent),
        ...attribution,
        // Volatile fields below, added after the idempotency key has already
        // been selected so they cannot influence the submit-intent fingerprint.
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
      // Preserve what the guest requested so the confirmation can show
      // granted-of-requested; fall back to the submitted outside flag if the
      // API build doesn't echo it back yet.
      if (resolvedHighChairCount > 0 && bookingResult.high_chair_count === undefined) {
        bookingResult.high_chair_count = resolvedHighChairCount
      }
      if (bookingResult.is_outside_seating === undefined && resolvedOutsideSeating) {
        bookingResult.is_outside_seating = true
      }
      setResult(bookingResult)

      if (bookingResult.state === 'blocked') {
        const blockedReason = bookingResult.blocked_reason || 'blocked'
        showBookingError(blockedReason, BLOCKED_REASON_COPY[blockedReason] || bookingResult.reason || BLOCKED_REASON_COPY.blocked)
        setStep('choose')
        trackTableBookingFunnel({
          step: 'error',
          partySize,
          bookingDate: date,
          bookingTime: selectedTime,
          errorType: blockedReason,
          errorMessage: bookingResult.reason || BLOCKED_REASON_COPY[blockedReason] || 'blocked',
          source: bookingSource,
          bookingType,
          deviceType: getDeviceType(),
        })
      } else if (bookingResult.state === 'confirmed') {
        // Defence-in-depth: drop the cached submit-intent key on a confirmed
        // terminal state so a hypothetical second Confirm with the same
        // payload would mint a new key rather than dedupe with the just-
        // succeeded booking. Pending-payment and blocked states deliberately
        // keep the cached key (the former is still in flight, the latter is
        // a retry case). See codex AB-003.
        clearSubmitIntentIdempotencyKey()

        // Funnel success
        trackTableBookingFunnel({
          step: 'success',
          partySize,
          bookingDate: date,
          bookingTime: selectedTime,
          bookingReference: bookingResult.booking_reference || undefined,
          source: bookingSource,
          bookingType,
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
      showBookingError('submit_failed', errorMessage)
      trackTableBookingFunnel({
        step: 'error',
        partySize,
        bookingDate: date,
        bookingTime: selectedTime,
        errorType: 'submit_failed',
        errorMessage,
        source: bookingSource,
        bookingType,
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
    setSlotWindowAnchorTime(defaultRequestedTime)
    setShowAllTimes(false)
    setSelectedTime('')
    setSelectedSlotService(null)
    setAvailability(null)
    setAvailabilityError(null)
    setAlternativeSlots([])
    nearestAlternativesRequestRef.current++
    setAlternativesLoading(false)
    setDismissedEventDates([])
    setSelectedSuggestedEvent(null)
    setPhone('')
    setLookupState('idle')
    setLookupError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setNotes('')
    setHighChairCount(0)
    setIsOutsideSeating(false)
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
    // Drop the cached submit-intent key so the next booking minted by the
    // wizard cannot reuse a previous booking's Idempotency-Key. See spec §13.2.
    clearSubmitIntentIdempotencyKey()
  }

  if (selectedSuggestedEvent) {
    const selectedEventDate = getLondonIsoDate(selectedSuggestedEvent.startDate)
    const selectedEventDateLabel = selectedEventDate ? formatDateForDisplay(selectedEventDate) : 'Date TBC'
    const selectedEventTimeLabel = formatEventTimeLabel(selectedSuggestedEvent.startDate)

    return (
      <div className="mx-auto max-w-[640px] space-y-4">
        <Card accent>
          <CardBody className="space-y-3 p-6">
            <h3 className="font-display text-h4 text-ink-strong">Event booking</h3>
            <p className="text-sm text-ink-muted">
              You're booking <strong className="text-ink-strong">{selectedSuggestedEvent.name}</strong> on{' '}
              <strong className="text-ink-strong">{selectedEventDateLabel}</strong> at <strong className="text-ink-strong">{selectedEventTimeLabel}</strong>.
            </p>
            <p className="text-sm text-ink-muted">
              Complete your event booking below without leaving this page.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto min-h-12"
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
            slug: selectedSuggestedEvent.slug ?? undefined,
            startDate: selectedSuggestedEvent.startDate
          }}
          title="Reserve event table"
          compact
        />
      </div>
    )
  }

  if (result?.state === 'confirmed') {
    return (
      <div className="mx-auto max-w-[640px]">
      <Card accent>
        <CardBody className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-[72px] w-[72px] items-center justify-center rounded-pill bg-anchor-green text-white"
            >
              <Check className="h-9 w-9" />
            </span>
            <div>
              <h3 className="font-display text-h3 text-ink-strong">You&apos;re all booked in, see you soon!</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Reference: <strong className="text-ink-strong">{result.booking_reference || 'Provided shortly'}</strong>. {confirmationDeliveryCopy(result.notification_channel)}
              </p>
            </div>
          </div>

          <div className="rounded-md border border-line bg-surface-sunk p-4 text-left text-sm">
            <dl className="space-y-2 text-ink">
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-ink-muted">Party</dt>
                <dd className="text-ink-strong">{partySize} {partySize === 1 ? 'guest' : 'guests'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-ink-muted">When</dt>
                <dd className="text-ink-strong">{formatDateForDisplay(date)}, {formatTimeForDisplay(selectedTime || requestedTime)}</dd>
              </div>
              {result.is_outside_seating ? (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Seating</dt>
                  <dd className="text-ink-strong">Outside (weather permitting)</dd>
                </div>
              ) : result.table_name ? (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Table</dt>
                  <dd className="text-ink-strong">{result.table_name}</dd>
                </div>
              ) : null}
              {(result.high_chair_count ?? 0) > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">High chair</dt>
                  <dd className="text-ink-strong">
                    {/* Unknown granted count (older API build) → assume reserved
                        rather than falsely reporting a failure. */}
                    {result.high_chairs_granted === undefined ||
                    result.high_chairs_granted >= (result.high_chair_count ?? 0)
                      ? 'Reserved'
                      : result.high_chairs_granted > 0
                      ? `${result.high_chairs_granted} of ${result.high_chair_count} reserved`
                      : 'Not available for this time'}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          {(result.high_chair_count ?? 0) > 0 &&
          result.high_chairs_granted !== undefined &&
          result.high_chairs_granted < (result.high_chair_count ?? 0) ? (
            <p className="text-left text-sm text-ink-muted">
              {(result.high_chairs_granted ?? 0) > 0
                ? `We could only reserve ${result.high_chairs_granted} of the ${result.high_chair_count} high chairs you asked for. `
                : `We couldn't reserve a high chair for this time. `}
              Give us a ring on 01753 682707 and we&apos;ll do our best to help.
            </p>
          ) : null}

          <div className="rounded-md border border-line bg-surface-sunk p-4 text-left text-sm text-ink space-y-1">
            <p className="font-semibold text-ink-strong">When you arrive:</p>
            <p>&#x2022; Free parking right outside, no ticket needed</p>
            <p>&#x2022; No need to check in, just head to the bar and we&apos;ll find your table</p>
            <p>&#x2022; If anything changes, give us a ring on 01753 682707</p>
          </div>

          <Button type="button" variant="outline" size="lg" onClick={resetJourney}>
            Book another table
          </Button>
        </CardBody>
      </Card>
      </div>
    )
  }


  return (
    <div ref={wizardRef} className="mx-auto max-w-[640px]">
    <Card accent>
      <CardBody className="space-y-6">
        <BookingProgressBar currentStep={currentStepIndex + 1} totalSteps={STEP_ORDER.length} />

        {error && (
          <Alert variant="error" title="Booking not completed">
            <p>{error}</p>
            <p className="mt-2">
              Call <PhoneLink phone={CONTACT.phone} source="table_booking_error" showIcon={false} className="font-semibold underline">01753 682707</PhoneLink> if you need help.
            </p>
          </Alert>
        )}

        {step === 'find' && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleFindTable()
            }}
          >
            <div>
              <h3 className="font-display text-h4 text-ink-strong">Find a table</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {`Start with party size, date, and time. We'll ask for contact details after you pick a slot.`}
              </p>
            </div>

            {hoursNote ? (
              <div className="rounded-sm border border-line bg-surface-sunk p-3 text-sm text-ink">
                <p className="font-semibold text-ink-strong">
                  {formatDateForDisplay(date)}
                </p>
                <p className="mt-1">{hoursNote.summary}</p>
                {hoursNote.footer ? (
                  <p className="mt-2 text-xs text-ink-muted">{hoursNote.footer}</p>
                ) : null}
              </div>
            ) : null}

            <Input
              label="Party Size"
              type="number"
              size="lg"
              inputMode="numeric"
              pattern="[0-9]*"
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
                setSelectedSlotService(null)
                setShowAllTimes(false)
                nearestAlternativesRequestRef.current++
              }}
              onBlur={() => {
                const parsed = Number.parseInt(partySizeDisplay, 10)
                const clamped = (!Number.isFinite(parsed) || parsed < 1) ? 1 : Math.min(parsed, 20)
                setPartySize(clamped)
                setPartySizeDisplay(String(clamped))
                setSelectedSlotService(null)
                setShowAllTimes(false)
                nearestAlternativesRequestRef.current++
              }}
            />

            {requiresGroupDeposit ? (
              <Badge variant="sand" className="block w-full whitespace-normal text-left leading-snug">
                Groups of 10 or more: a £10 per person deposit, fully deducted from your bill.
              </Badge>
            ) : null}

            {/*
              Two questions, both optional, both placed BEFORE times are shown because each
              changes which tables qualify. Asking after a time is chosen would mean the guest
              picks a slot that was never valid for them.
            */}
            <div className="space-y-3 rounded-lg border border-line bg-surface-subtle p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={drinksOnly}
                  onChange={(event) => {
                    setDrinksOnly(event.target.checked)
                    trackOptionToggled({ option: 'drinks_only', value: event.target.checked, step })
                  }}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  <span className="font-medium text-ink-strong">Just drinks</span>
                  <span className="block text-ink-muted">
                    We will seat you in the bar and show times when the kitchen is closed too.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={requiresAccessibleTable}
                  onChange={(event) => {
                    // Deliberately NOT tracked. A step-free seating request
                    // infers a mobility impairment, which is special-category
                    // data under UK GDPR Article 9, and analytics-cookie
                    // consent is not Article 9 explicit consent. See the rules
                    // at the top of lib/gtm-events.ts.
                    setRequiresAccessibleTable(event.target.checked)
                  }}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  <span className="font-medium text-ink-strong">
                    I need an accessible table
                  </span>
                  <span className="block text-ink-muted">
                    Step-free, with standard-height seating rather than bar stools.
                  </span>
                </span>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                type="date"
                size="lg"
                min={today}
                required
                value={date}
                onChange={(event) => handleDateChange(event.target.value)}
                error={dateError || undefined}
              />

              <Input
                label="Preferred Time"
                type="time"
                size="lg"
                required
                value={requestedTime}
                onChange={(event) => handleRequestedTimeChange(event.target.value)}
              />
            </div>

            <div
              className="rounded-sm border border-line bg-surface-sunk p-3 text-sm text-ink"
              aria-live="polite"
            >
              <p className="font-medium text-ink-strong">{aircraftOverheadNote.message}</p>
              <p className="mt-1 text-xs text-ink-muted">{aircraftOverheadNote.caveat}</p>
            </div>

            {(showDateEventSuggestions || selectedDateEventsLoading) &&
              renderDateEventSuggestions({
                title: 'Events on this date',
                description:
                  'If you were planning a night out, you can switch to an event booking in one tap.',
                context: 'find_step'
              })}

            {selectedDateEventError && !showDateEventSuggestions && !selectedDateEventsLoading ? (
              <p className="text-xs text-ink-muted">{selectedDateEventError}</p>
            ) : null}

            {availabilityError && (
              <Alert variant="warning">
                <p>{availabilityError}</p>
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={availabilityLoading}
              icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
              iconPosition="right"
            >
              Find a table
            </Button>
          </form>
        )}

        {step === 'choose' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-h4 text-ink-strong">Choose your time</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {formatDateForDisplay(date)} for {partySize} {partySize === 1 ? 'guest' : 'guests'}.
              </p>
            </div>

            {availabilityLoading ? (
              <p className="text-sm text-ink-muted">Checking available times...</p>
            ) : null}

            {availabilityUnknown ? (
              <div
                className="space-y-3 rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink"
                aria-live="polite"
              >
                <p className="font-semibold text-ink-strong">We could not check live availability</p>
                {/* The reason, when we have one. Without this a failed retry
                    looked identical to the first failure and the guest had no
                    idea anything had happened. */}
                {availability?.message || availabilityError ? (
                  <p>{availability?.message || availabilityError}</p>
                ) : null}
                <p>
                  Please try again in a moment. If it keeps happening, give us a ring on{' '}
                  <PhoneLink
                    phone={CONTACT.phone}
                    source="table_booking_availability_unknown"
                    showIcon={false}
                    className="font-semibold underline"
                  >
                    01753 682707
                  </PhoneLink>{' '}
                  and we will book you in.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full sm:w-auto min-h-12"
                  loading={availabilityLoading}
                  onClick={() => void handleFindTable()}
                >
                  Try again
                </Button>
              </div>
            ) : availableSlots.length > 0 ? (
              <>
                {/* Same notice treatment as the availability-unknown panel
                    above, deliberately: this is information the guest needs,
                    not an alarm. Shown only when the food question genuinely
                    went unanswered, never on a real kitchen-closed day. */}
                {foodCheckUnavailable ? (
                  <div
                    className="space-y-2 rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink"
                    aria-live="polite"
                  >
                    <p>
                      We could not check food service just now, so these times are for drinks only.
                    </p>
                    <p>
                      If you would like to eat, give us a ring on{' '}
                      <PhoneLink
                        phone={CONTACT.phone}
                        source="table_booking_food_check_unavailable"
                        showIcon={false}
                        className="font-semibold underline"
                      >
                        01753 682707
                      </PhoneLink>{' '}
                      and we will sort it.
                    </p>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {visibleSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time
                    // Combined aria-label so screen readers announce time + service
                    // as one phrase. When `kitchen_open` is undefined (legacy
                    // path) we default to "drinks and food" to match the visual
                    // default.
                    const serviceCaption = slot.kitchen_open === false ? 'drinks only' : 'drinks and food'
                    const loadCaption = busynessCaption(slot.busyness)
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        aria-label={`${formatTimeForDisplay(slot.time)}, ${serviceCaption}${loadCaption ? `, ${loadCaption}` : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => handleSlotSelect(slot)}
                        className={`min-h-16 rounded-pill border-[1.5px] px-3 py-3 text-center transition-colors ${
                          isSelected
                            ? 'border-anchor-green bg-anchor-green text-white'
                            : 'border-line-strong bg-surface text-ink hover:border-anchor-gold'
                        }`}
                      >
                        <span className="block text-base font-semibold">
                          {formatTimeForDisplay(slot.time)}
                        </span>
                        {typeof slot.kitchen_open === 'boolean' ? (
                          <span className={`mt-1 block text-xs font-normal ${isSelected ? 'text-white/80' : 'text-ink-muted'}`}>
                            {slot.kitchen_open ? 'Drinks & food' : 'Drinks only'}
                          </span>
                        ) : null}
                        {loadCaption ? (
                          <span className={`mt-1 block text-xs font-medium ${isSelected ? 'text-white' : slot.busyness === 'busy' ? 'text-anchor-gold-dark' : 'text-ink-muted'}`}>
                            {loadCaption}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>

                {!showAllTimes && availableSlots.length > visibleSlots.length ? (
                  <button
                    type="button"
                    onClick={() => setShowAllTimes(true)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-pill border-[1.5px] border-line-strong px-4 py-3 text-base font-medium text-ink transition-colors hover:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2 sm:w-auto sm:px-6"
                  >
                    See more times
                    <ChevronDown aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : null}

                {selectedSlotAdvisory ? (
                  <div className="rounded-md border border-anchor-gold bg-surface-sunk p-4 text-sm text-ink">
                    <p>{selectedSlotAdvisory}</p>
                    {quieterTimeLabel ? (
                      <p className="mt-2">
                        {quieterTimeLabel} may be a smoother option.
                      </p>
                    ) : null}
                    {quieterSlots.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quieterSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            className="rounded-pill border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:border-anchor-gold"
                          >
                            {formatTimeForDisplay(slot.time)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <Alert variant="warning" title="No online times available">
                <p>
                  {availability?.message ||
                    `We couldn't find an online slot for that request. Try one of the nearest alternatives below, or join the waitlist.`}
                </p>
                {availability?.special_notes ? <p className="mt-2">{availability.special_notes}</p> : null}
              </Alert>
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

            {availableSlots.length === 0 && !availabilityUnknown && (
              <div className="space-y-3 rounded-md border border-line bg-surface-sunk p-4">
                <p className="text-sm font-semibold text-ink-strong">Nearest alternatives</p>

                {alternativesLoading ? (
                  <p className="text-sm text-ink-muted">Finding nearby options...</p>
                ) : alternativeSlots.length > 0 ? (
                  <div className="space-y-2">
                    {alternativeSlots.map((option) => (
                      <button
                        key={`${option.date}-${option.time}`}
                        type="button"
                        onClick={() => handleChooseAlternative(option)}
                        className="flex min-h-12 w-full items-center justify-between rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-3 text-left text-base hover:border-anchor-gold"
                      >
                        <span className="font-medium text-ink">{formatDateForDisplay(option.date)}</span>
                        <span className="text-accent-text font-semibold">{formatTimeForDisplay(option.time)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">No nearby online alternatives were found.</p>
                )}

                <div className="rounded-sm border border-line bg-surface-raised p-3 text-sm text-ink">
                  <p className="font-semibold text-ink-strong">Join waitlist</p>
                  <p className="mt-1">Call us and we'll add you to the waitlist for cancellations.</p>
                  <div className="mt-2">
                    <PhoneButton phone={CONTACT.phone} source="table_booking_waitlist" size="sm" variant="outline" className="min-h-12">
                      Join waitlist by phone
                    </PhoneButton>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto min-h-12"
                icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleBackToFind}
              >
                Back
              </Button>

              {selectedTime ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={() => {
                    setStep('details')
                    setError(null)
                  }}
                >
                  {selectedSlot && shouldNudgeForBusyness(selectedSlot.busyness)
                    ? `Book ${formatTimeForDisplay(selectedSlot.time)} anyway`
                    : 'Continue'}
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink">
              <p>
                <strong className="text-ink-strong">{partySize}</strong> guests on <strong className="text-ink-strong">{formatDateForDisplay(date)}</strong> at{' '}
                <strong className="text-ink-strong">{formatTimeForDisplay(selectedTime || requestedTime)}</strong>
              </p>
              {/* Continue is refused while a re-read is in flight, so the guest
                  has to be able to see that something is actually happening.
                  Without this the refusal message appeared with no explanation
                  anywhere on screen. */}
              {revalidatingAvailability ? (
                <p className="mt-2 text-ink-muted" aria-live="polite">
                  Checking that time is still free with your new options...
                </p>
              ) : null}
            </div>

            <div className="rounded-md border border-line bg-surface-sunk p-4">
              <Input
                label="Mobile Number"
                type="tel"
                size="lg"
                inputMode="tel"
                autoComplete="tel"
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
                    className="w-full sm:w-auto min-h-12"
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
                    className="w-full sm:w-auto min-h-12"
                    onClick={resetPhoneLookup}
                  >
                    Use Different Number
                  </Button>
                )}
              </div>

              {lookupError ? <p className="mt-3 text-sm text-anchor-danger">{lookupError}</p> : null}

              {isKnownCustomer ? (
                <p className="mt-3 text-sm font-medium text-accent-text">
                  Welcome back. We recognise this number, so we've skipped your personal details.
                </p>
              ) : null}

              {lookupState === 'unknown' ? (
                <p className="mt-3 text-sm font-medium text-ink">
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
                  size="lg"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="John"
                />
                <Input
                  label="Last name (optional)"
                  type="text"
                  size="lg"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Smith"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Email (optional)"
                    type="email"
                    size="lg"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            ) : null}

            {detailsUnlocked ? (
              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Special requests, accessibility needs, occasion details..."
                rows={3}
              />
            ) : null}

            {detailsUnlocked ? (
              <div className="space-y-3 rounded-md border border-line bg-surface-sunk p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink-strong">High chair (for a baby)</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {hideHighChairPicker
                        ? "Sorry, all our high chairs are booked for this time. If you need one, please try another time slot; you're very welcome to book here without one."
                        : 'We have a limited number, reserved on a first-come basis.'}
                    </p>
                  </div>
                  {hideHighChairPicker ? null : (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-10 min-h-0 p-0"
                        aria-label="Fewer high chairs"
                        disabled={highChairCount <= 0}
                        onClick={() => {
                          const next = Math.max(0, highChairCount - 1)
                          setHighChairCount(next)
                          trackOptionToggled({ option: 'high_chair_count', value: next, step })
                        }}
                      >
                        &#8722;
                      </Button>
                      <span
                        className="w-6 text-center text-base font-semibold text-ink-strong"
                        aria-live="polite"
                      >
                        {highChairCount}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-10 min-h-0 p-0"
                        aria-label="More high chairs"
                        disabled={highChairCount >= HIGH_CHAIR_HOUSE_CAP}
                        onClick={() => {
                          const next = Math.min(HIGH_CHAIR_HOUSE_CAP, highChairCount + 1)
                          setHighChairCount(next)
                          trackOptionToggled({ option: 'high_chair_count', value: next, step })
                        }}
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>

                {highChairShortfall ? (
                  <div className="rounded-md border border-anchor-gold bg-surface-raised p-3 text-sm text-ink">
                    <p>
                      {highChairShortfall.free === 0
                        ? 'No high chairs are free at this time. Book anyway?'
                        : highChairShortfall.free === 1
                        ? 'Only 1 high chair is free at this time. Book with 1?'
                        : `Only ${highChairShortfall.free} high chairs are free at this time. Book with ${highChairShortfall.free}?`}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      We&apos;ll keep your request for {highChairShortfall.requested} on the booking and do our best on the day.
                    </p>
                    {highChairShortfallAcknowledged ? (
                      <p className="mt-2 text-xs font-medium text-accent-text">
                        Thanks, that&apos;s noted for your booking.
                      </p>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 min-h-12"
                        onClick={() => setHighChairShortfallAcknowledged(true)}
                      >
                        {highChairShortfall.free === 0
                          ? 'Yes, book anyway'
                          : `Yes, book with ${highChairShortfall.free}`}
                      </Button>
                    )}
                  </div>
                ) : null}

                <label className="flex items-start gap-2 pt-1 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={isOutsideSeating}
                    onChange={(event) => {
                      setIsOutsideSeating(event.target.checked)
                      trackOptionToggled({ option: 'outside_seating', value: event.target.checked, step })
                    }}
                    className="mt-1 accent-anchor-green"
                  />
                  <span>I&apos;d like an outside table (weather permitting)</span>
                </label>
              </div>
            ) : null}

            {detailsUnlocked ? (
              <CommunicationConsentFields
                value={communicationConsent}
                onChange={setCommunicationConsent}
              />
            ) : null}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto min-h-12"
                icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleBackToChoose}
              >
                Back
              </Button>

              {detailsUnlocked ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={handleContinueToReview}
                >
                  Continue to review
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-h4 text-ink-strong">Review your booking</h3>
              <p className="mt-1 text-sm text-ink-muted">Check details, then confirm your booking.</p>
            </div>

            <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm">
              <dl className="space-y-2 text-ink">
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Party size</dt>
                  <dd className="text-ink-strong">{partySize}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Date</dt>
                  <dd className="text-ink-strong">{formatDateForDisplay(date)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Time</dt>
                  <dd className="text-ink-strong">{formatTimeForDisplay(selectedTime || requestedTime)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Mobile</dt>
                  <dd className="text-ink-strong">{phone}</dd>
                </div>
                {!isKnownCustomer ? (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium text-ink-muted">Guest</dt>
                    <dd className="text-ink-strong">
                      {[firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || 'Not provided'}
                    </dd>
                  </div>
                ) : null}
                {requiresGroupDeposit ? (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium text-ink-muted">Deposit due now</dt>
                    <dd className="text-ink-strong">{formatGbpCurrency(groupDepositAmount)}</dd>
                  </div>
                ) : null}
              </dl>
              {requiresGroupDeposit ? (
                <p className="mt-3 text-xs text-ink-muted">
                  {LARGE_GROUP_DEPOSIT_POLICY_COPY}
                </p>
              ) : null}
            </div>

            {selectedSlotAdvisory ? (
              <div className="rounded-md border border-anchor-gold bg-surface-sunk p-4 text-sm text-ink">
                <p className="font-semibold text-ink-strong">Worth knowing before you confirm</p>
                <p className="mt-1">{selectedSlotAdvisory}</p>
              </div>
            ) : null}

            <p className="text-sm text-ink-muted">
              Plans changed?{' '}
              <PhoneLink phone={CONTACT.phone} source="table_booking_change" showIcon={false} className="font-semibold underline">
                A quick call to 01753 682707
              </PhoneLink>{' '}
              lets us offer your table to someone else. Thanks for letting us know.
            </p>

            {result?.state === 'pending_payment' ? (
              <>
                {paymentState === 'confirmed' ? (
                  <Alert variant="success" title="Deposit paid, booking confirmed!">
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
                        <PhoneLink phone={CONTACT.phone} source="table_booking_payment_error" showIcon={false} className="font-semibold underline">
                          01753 682707
                        </PhoneLink>{' '}
                        we'll take payment over the phone.
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
                        <li>Or check your phone, we've sent you a secure payment link by SMS.</li>
                      )}
                    </ul>
                    <p className="mt-2 text-xs">
                      Your {isOutsideSeating ? 'booking' : 'table'} is held while you complete payment.
                    </p>
                  </Alert>
                ) : paypalOrderId && bookingIdForPayment ? (
                  <div className="space-y-3 rounded-md border border-line bg-surface-sunk p-4">
                    {holdExpiry && (
                      <p className="text-sm text-ink font-medium">
                        Your {isOutsideSeating ? 'booking' : 'table'} is held until {holdExpiry}. Complete payment to confirm your booking.
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
	                      conversionPayload={{
	                        bookingReference: result.booking_reference,
	                        depositAmount: depositAmountForPayment,
	                        bookingDate: date,
	                        bookingTime: selectedTime,
	                        partySize,
	                        bookingType,
	                        purpose: selectedSlotService?.kitchen_open === false ? 'drinks' : 'food',
	                        bookingSource,
	                        attribution: submittedAttribution,
	                        // Consent-gated inside PayPalDepositSection; hashed server-side.
	                        email: email.trim() || null,
	                        phone: phone.trim() || null,
	                      }}
	                      bookingSummary={[
	                        date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : null,
	                        selectedTime ? (() => { const [h, m] = selectedTime.split(':').map(Number); const ampm = h >= 12 ? 'pm' : 'am'; const hour = h % 12 || 12; return `${hour}:${String(m).padStart(2, '0')}${ampm}`; })() : null,
	                        partySize ? `${partySize} guests` : null,
	                        isOutsideSeating ? 'Outside / patio' : null,
	                        highChairCount > 0 ? `${highChairCount} high chair${highChairCount === 1 ? '' : 's'}` : null
	                      ].filter(Boolean).join(' · ')}
	                      onSuccess={() => {
	                        setPaymentState('confirmed')
	                        const transactionId = result.booking_reference || bookingIdForPayment || undefined
	                        trackTableBookingFunnel({
	                          step: 'success',
	                          partySize,
	                          bookingDate: date,
	                          bookingTime: selectedTime,
	                          bookingReference: transactionId,
	                          bookingType,
	                          source: bookingSource,
	                          deviceType: getDeviceType(),
	                          value: depositAmountForPayment,
	                        })
	                        if (transactionId) {
	                          pushToDataLayer({
	                            event: 'purchase',
	                            transaction_id: transactionId,
	                            value: depositAmountForPayment,
	                            currency: 'GBP',
	                            booking_source: bookingSource,
	                          })
	                        }
	                      }}
	                      onError={(msg) => {
	                        setPaymentError(msg)
	                        setPaymentState('error')
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">Setting up payment…</p>
                )}

                {paymentState !== 'confirmed' && (
                  <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={resetJourney}>
                    Start a new booking
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Honeypot, hidden from real users, filled by bots */}
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
                  <TurnstileField
                    id="table-booking-turnstile"
                    turnstileRef={turnstileRef}
                    onTokenChange={setTurnstileToken}
                  />
                )}

                <label className="flex min-h-12 items-start gap-2 py-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(event) => setPolicyAccepted(event.target.checked)}
                    className="mt-1 accent-anchor-green"
                  />
                  <span>
                    I understand The Anchor's booking and no-show policy, and I agree to continue.
                  </span>
                </label>

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:w-auto min-h-12"
                    icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
                    iconPosition="left"
                    onClick={() => setStep('details')}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    loading={loading}
                    disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}
                    icon={<Check aria-hidden="true" className="h-4 w-4" />}
                    iconPosition="right"
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
    </div>
  )
}
