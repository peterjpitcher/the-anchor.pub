import { londonNowParts } from '@/lib/table-booking-service-windows'
import type { AvailabilityData, AvailabilitySlot } from './availability'

/**
 * The quick-book sheet: the shortest honest path from "I want a table" to a confirmed
 * booking, without a page load.
 *
 * The pure logic lives here rather than in the component so the decisions that actually
 * matter, which defaults are chosen and when the sheet must hand over to the full form,
 * can be tested without rendering anything.
 *
 * The design principle throughout: the fastest journey is not the one with the fewest
 * screens, it is the one with the fewest DECISIONS. Every default below is chosen because
 * the live booking data says it is what most people would have picked anyway, so the
 * common case is "tap a time, type a number, done".
 */

/** Live data, 90 days to 2026-08-09: 134 of 308 bookings were for exactly two people. */
export const DEFAULT_PARTY_SIZE = 2

/**
 * The largest party the sheet will take. Above this the guest needs the full form, which
 * asks about high chairs, accessible tables and outside seating, and above 15 a deposit is
 * due. Quietly booking a party of 16 with none of those questions asked would produce a
 * booking the pub cannot actually seat.
 */
export const QUICK_BOOK_MAX_PARTY = 8

export type QuickBookPurpose = 'food' | 'drinks'

export type QuickBookState = {
  partySize: number
  /** ISO yyyy-mm-dd, always resolved in Europe/London rather than the device's zone. */
  date: string
  purpose: QuickBookPurpose
}

export function defaultQuickBookState(): QuickBookState {
  return {
    partySize: DEFAULT_PARTY_SIZE,
    date: londonNowParts().isoDate,
    // Food, not drinks. A guest who wants drinks can still sit at a food-bookable slot,
    // but the reverse is not true, so defaulting to drinks would silently show times the
    // kitchen cannot serve and send people to a table with no food. Defaulting to food
    // fails safe: the worst case is a slightly shorter list of times.
    purpose: 'food',
  }
}

/** yyyy-mm-dd for "today + n" in Europe/London, without importing a date library. */
export function londonDatePlusDays(days: number): string {
  const today = londonNowParts().isoDate
  const [y, m, d] = today.split('-').map(Number)
  // Constructed as UTC midnight purely as calendar arithmetic. It is never rendered as a
  // time, so the offset cannot shift the day the way `new Date(iso)` in local time would.
  const shifted = new Date(Date.UTC(y, m - 1, d + days))
  return shifted.toISOString().slice(0, 10)
}

export type DateChoice = { value: string; label: string }

/**
 * The three dates offered as one-tap chips. Sunday is included when it is not already
 * Today or Tomorrow because it is the single busiest booking day: 113 of 308 bookings in
 * the last 90 days, more than Friday and Saturday combined.
 */
export function quickDateChoices(): DateChoice[] {
  const today = londonDatePlusDays(0)
  const tomorrow = londonDatePlusDays(1)
  const choices: DateChoice[] = [
    { value: today, label: 'Today' },
    { value: tomorrow, label: 'Tomorrow' },
  ]

  for (let ahead = 2; ahead <= 7; ahead += 1) {
    const candidate = londonDatePlusDays(ahead)
    if (new Date(`${candidate}T00:00:00Z`).getUTCDay() === 0) {
      choices.push({ value: candidate, label: 'Sunday' })
      break
    }
  }

  return choices
}

/**
 * Slots a guest may actually tap.
 *
 * `bookable_purpose` is authoritative, never `kitchen_open`, which is the published
 * window and says nothing about whether a table can be booked to eat at.
 */
export function selectableSlots(
  availability: AvailabilityData | null,
  partySize: number,
  purpose: QuickBookPurpose
): AvailabilitySlot[] {
  if (!availability) return []
  // 'unknown' means the authoritative check never ran. Showing locally guessed times as
  // bookable is how a guest ends up with a confirmation for a table that does not exist.
  if (availability.calculation_state === 'unknown') return []

  return availability.time_slots.filter((slot) => {
    if (slot.available === false) return false
    if (slot.available_capacity < partySize) return false
    // 'drinks_only' still seats a guest who only wants a drink, so a drinks request
    // accepts both values. A food request accepts only 'food_or_drinks'.
    if (purpose === 'food') return slot.bookable_purpose === 'food_or_drinks'
    return true
  })
}

/**
 * What to submit as `purpose` for a slot, which is not simply what the guest tapped.
 *
 * The slot is the authority. On a day where the food check failed the whole grid comes
 * back 'drinks_only', and submitting 'food' against it is rejected by the service-window
 * check with an error the guest can do nothing about. Narrowing to what the slot actually
 * permits turns that dead end into a booking.
 */
export function resolveSubmitPurpose(
  slotPurpose: AvailabilitySlot['bookable_purpose'],
  requested: QuickBookPurpose
): QuickBookPurpose {
  if (slotPurpose === 'drinks_only') return 'drinks'
  return requested
}

export type EmptyStateReason =
  | 'loading'
  | 'kitchen_closed_but_drinks_available'
  | 'nothing_today'
  | 'check_failed'
  | 'none'

/**
 * Why the grid is empty, so the sheet can say something useful instead of "no times".
 *
 * The distinction that earns its keep is kitchen-closed versus nothing-free. On a Monday
 * the kitchen is shut but the bar is open, and a guest told "no availability" walks away
 * from a table they could have had. That is a one-tap recovery, not a dead end.
 */
export function resolveEmptyState(
  availability: AvailabilityData | null,
  partySize: number,
  purpose: QuickBookPurpose,
  isLoading: boolean
): EmptyStateReason {
  if (isLoading) return 'loading'
  if (!availability) return 'loading'
  if (availability.calculation_state === 'unknown') return 'check_failed'
  if (selectableSlots(availability, partySize, purpose).length > 0) return 'none'

  if (purpose === 'food') {
    const drinksInstead = selectableSlots(availability, partySize, 'drinks')
    if (drinksInstead.length > 0) return 'kitchen_closed_but_drinks_available'
  }

  return 'nothing_today'
}

/**
 * Whether this booking must go to the full form instead.
 *
 * Kept as one function so there is a single place that answers it, and so the sheet can
 * hand over BEFORE the guest has typed anything rather than failing at submit.
 */
export function requiresFullForm(partySize: number): boolean {
  return partySize > QUICK_BOOK_MAX_PARTY
}

/**
 * Deep link into the full booking form carrying whatever the guest already chose, so
 * handing over never costs them the taps they have already spent.
 *
 * Only date, time and party_size are sent, because those are the only three
 * `app/book-table/page.tsx` reads. Adding `purpose` here would look like it carried the
 * food-or-drinks choice over and silently would not, which is worse than not sending it:
 * the guest re-answers a question they think they have already answered.
 */
export function fullFormHref(state: Partial<QuickBookState> & { time?: string | null }): string {
  const params = new URLSearchParams()
  if (state.partySize) params.set('party_size', String(state.partySize))
  if (state.date) params.set('date', state.date)
  if (state.time) params.set('time', state.time)
  const query = params.toString()
  return query ? `/book-table?${query}` : '/book-table'
}

export type QuickBookSubmission = {
  state: QuickBookState
  time: string
  /** The slot's authoritative purpose, captured at tap time. */
  slotPurpose: AvailabilitySlot['bookable_purpose']
  phone: string
  firstName: string
}

export type QuickBookRefusal = { field: 'phone' | 'firstName' | 'time'; message: string }

/**
 * Validation, in the order the guest filled the fields in. Reporting the last field first
 * makes a form feel like it is arguing back.
 */
export function findQuickBookRefusal(input: {
  time: string | null
  phone: string
  firstName: string
}): QuickBookRefusal | null {
  if (!input.time) {
    return { field: 'time', message: 'Please choose a time.' }
  }

  const phone = input.phone.trim()
  if (!phone) {
    return { field: 'phone', message: 'Please enter your mobile number.' }
  }
  // Loose on purpose. The management API normalises to E.164 and is the authority; this
  // only catches an obviously incomplete number before a round trip. UK mobiles are 11
  // digits, +44 forms are 12, and we accept anything in that region rather than trying to
  // out-parse libphonenumber in the browser.
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) {
    return { field: 'phone', message: 'That mobile number looks too short. Please check it.' }
  }

  if (!input.firstName.trim()) {
    return { field: 'firstName', message: 'Please enter your first name.' }
  }

  return null
}

/**
 * The create-booking request body. Fixed shape, no optional keys, which is what lets
 * buildQuickBookIntentFingerprint below treat its JSON as stable.
 */
export type QuickBookPayload = {
  phone: string
  date: string
  time: string
  party_size: number
  purpose: QuickBookPurpose
  first_name: string
  default_country_code: string
}

export function buildQuickBookPayload(submission: QuickBookSubmission): QuickBookPayload {
  return {
    phone: submission.phone.trim(),
    date: submission.state.date,
    time: submission.time,
    party_size: submission.state.partySize,
    // Narrowed by the SLOT, not taken from the chip the guest tapped. See
    // resolveSubmitPurpose for why that difference matters.
    purpose: resolveSubmitPurpose(submission.slotPurpose, submission.state.purpose),
    first_name: submission.firstName.trim(),
    // Dialling-code DIGITS, never an ISO country code. Both /api/table-bookings and the
    // management API validate this against /^\d{1,4}$/, so 'GB' was refused with a 400
    // before the request ever left the site: every booking from this sheet failed. The
    // full form in lib/table-booking/submission.ts has always sent '44'.
    default_country_code: '44',
  }
}

/**
 * The submit intent, as one stable string.
 *
 * The management API hashes every field that changes what is booked, and answers 409
 * IDEMPOTENCY_KEY_CONFLICT when a key it has already seen arrives with a different hash.
 * The key this sheet used to send named only phone, date, time and party size, so a guest
 * refused for food who switched to drinks and resubmitted at the same time sent the same
 * key with a changed hash and was shown a raw conflict error. Fingerprinting the WHOLE
 * payload keeps the two ends agreeing on what "the same booking" means, the way the full
 * form's buildSubmitIntentFingerprint already does.
 *
 * The payload has no optional keys, so JSON.stringify is stable by construction: the same
 * intent always produces the same string, and any change produces a different one.
 */
export function buildQuickBookIntentFingerprint(payload: QuickBookPayload): string {
  return JSON.stringify(payload)
}
