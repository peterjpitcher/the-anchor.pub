import type { SlotBookablePurpose } from '@/lib/api'
import { toMinutes, toTimeInputValue } from '@/lib/table-booking/formatting'

/**
 * The shape of an availability reading, how a raw response becomes one, and the
 * questions the booking journey asks of it.
 *
 * The single rule this module exists to hold: nothing here ever INFERS what a
 * slot may be booked for. The availability route decides that, where both the
 * drinks and the food answers are in hand, and normalisation fails closed so a
 * response that does not say "food_or_drinks" is read as drinks only.
 */

export type AvailabilitySlot = {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  // INFORMATIONAL ONLY: the published kitchen window. Never read it to decide
  // what gets booked or how a slot is labelled, that is `bookable_purpose`.
  kitchen_open?: boolean
  // What this slot may be booked for, decided by the availability route where
  // both the drinks and food answers are in hand. Normalisation fails closed,
  // so this is always set once a response has been parsed.
  bookable_purpose: SlotBookablePurpose
  busyness?: 'quiet' | 'filling' | 'busy'
  // High chairs still free in this slot's window (advisory; the server is the
  // authoritative gate). Absent when the API does not report it, which means
  // "unknown": leave the chair picker enabled (fail-open, spec D7).
  high_chairs_remaining?: number
}

export type AvailabilityData = {
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

export type SelectedSlotService = {
  date: string
  time: string
  // Captured at slot-select time so submit can read the authoritative purpose
  // without re-fetching, including on the nearest-alternative path where the
  // slot is not in the current `availability.time_slots`.
  bookable_purpose: SlotBookablePurpose
  // Whether THIS slot's reading had a failed food check. Carried alongside the
  // purpose because on the alternative path the current `availability` belongs
  // to a different date, so it cannot answer for this slot.
  food_check_unavailable: boolean
}

export type AlternativeSlot = SelectedSlotService & {
  // Chairs free at this time when fewer than the guest asked for. Carried so
  // the panel can print the shortfall on the button rather than letting them
  // tap through to a booking with fewer chairs than they asked for and no
  // sign of it anywhere.
  highChairsFree?: number
}

/**
 * Everything that changes which TABLES qualify for a booking. Sending only the
 * date and party size is why the site used to answer the same whether you
 * wanted food or drinks.
 */
export type AvailabilityQuery = {
  date: string
  time: string
  partySize: number
  drinksOnly: boolean
  isOutsideSeating: boolean
  requiresAccessibleTable: boolean
  highChairCount: number
}

// Upper bound on an availability request from the browser. The server side has
// its own 3s-per-attempt budget with one retry, so this only has to catch a
// connection that stalls without ever failing.
export const AVAILABILITY_REQUEST_TIMEOUT_MS = 12_000

/**
 * The anchor sent as `time` when the guest was never asked for one (spec D7:
 * the Preferred Time field is deleted).
 *
 * Availability is a question about a DAY. The route validates `time` and echoes
 * it back, but never filters slots by it: the whole day's grid comes from the
 * management API's read-out for that date. So a fixed midday anchor asks the
 * same question the old flow asked, without inventing a preference the guest
 * never expressed, and without the old default's habit of drifting to 11:30pm
 * late in the evening.
 */
export const NEUTRAL_AVAILABILITY_ANCHOR_TIME = '12:00'

export function normalizeAvailabilityResponse(payload: any): AvailabilityData {
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
      // Fail closed. Only the exact string 'food_or_drinks' buys a food
      // booking: absent, misspelled, or any other value reads as drinks only.
      // An older cached response or a future rename therefore degrades to the
      // safe answer instead of quietly promising food.
      bookable_purpose:
        source.bookable_purpose === 'food_or_drinks' ? 'food_or_drinks' : 'drinks_only',
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
export function unknownAvailability(targetDate: string): AvailabilityData {
  return {
    date: targetDate,
    available: false,
    time_slots: [],
    calculation_state: 'unknown'
  }
}

export function isSlotAvailable(slot: AvailabilitySlot, partySize: number): boolean {
  if (typeof slot.available === 'boolean') {
    return slot.available && slot.available_capacity >= partySize
  }
  return slot.available_capacity >= partySize
}

export function pickClosestSlot(slots: AvailabilitySlot[], requestedTime: string, partySize: number): string | null {
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

export function busynessCaption(busyness: AvailabilitySlot['busyness']): string | null {
  if (busyness === 'busy') return 'Busiest time'
  if (busyness === 'filling') return 'Getting busy'
  if (busyness === 'quiet') return 'Plenty of space'
  return null
}

export function shouldNudgeForBusyness(busyness: AvailabilitySlot['busyness']): boolean {
  return busyness === 'filling' || busyness === 'busy'
}

export function busynessAdvisory(slot: AvailabilitySlot | null): string | null {
  if (!slot || !shouldNudgeForBusyness(slot.busyness)) return null

  if (slot.busyness === 'busy') {
    return `You've chosen one of our busiest times. We'll still be happy to see you, but food and drinks may take a little longer. If you're flexible, a slightly earlier or later table may mean a smoother visit.`
  }

  return `You've chosen a busier time. If you're flexible, a slightly earlier or later table may mean a smoother visit.`
}

export function isQuieterSlot(selectedBusyness: AvailabilitySlot['busyness'], candidateBusyness: AvailabilitySlot['busyness']): boolean {
  if (selectedBusyness === 'busy') return candidateBusyness === 'quiet' || candidateBusyness === 'filling'
  if (selectedBusyness === 'filling') return candidateBusyness === 'quiet'
  return false
}

/**
 * Ask the availability route what is free, with every input that changes which
 * tables qualify.
 *
 * The caller's `signal` supersedes the request; the internal timeout bounds it.
 * A stalled connection used to hold this request open for as long as the socket
 * lived, and the details step stays blocked while a re-read is in flight, so "no
 * timeout" meant "blocked indefinitely with nothing on screen". Bound it, and
 * make sure the timeout surfaces as a real error rather than as the AbortError
 * that callers deliberately swallow.
 */
export async function fetchAvailability(
  query: AvailabilityQuery,
  signal?: AbortSignal
): Promise<AvailabilityData> {
  const params = new URLSearchParams({
    date: query.date,
    party_size: String(query.partySize),
    time: query.time,
    // Everything that changes which TABLES qualify. Sending only the date and party size is
    // why the site used to answer the same whether you wanted food or drinks.
    purpose: query.drinksOnly ? 'drinks' : 'food',
    outside: String(query.isOutsideSeating),
    requires_accessible_table: String(query.requiresAccessibleTable),
    high_chair_count: String(query.highChairCount)
  })

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
