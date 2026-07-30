import {
  anchorAPI,
  type BusinessHours,
  type TableAvailability,
  type TableAvailabilityPublicReason,
  type TableAvailabilityResponse,
  type TableAvailabilitySlotState,
  type TableBookingLoadResponse
} from '@/lib/api'

// What this route serves the browser: the long-standing website shape plus the
// two contract fields the form now reads. `calculation_state: 'unknown'` means
// nothing is bookable and the form must offer a retry (review F04).
type WebsiteAvailabilityResponse = TableAvailabilityResponse & {
  calculation_state?: 'complete' | 'unknown'
  public_reason?: TableAvailabilityPublicReason
  max_party_size_online?: number
}
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import {
  buildSlotsWithKitchenState,
  isValidIsoDate,
  isValidTime,
  londonNowParts,
  normalizeTime,
  resolveCombinedServiceRanges,
  type BookingType,
  type SlotBusynessOptions
} from '@/lib/table-booking-service-windows'

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

// Builds a HH:mm -> high_chairs_remaining lookup from the AMS load read-out.
// Defensive: only entries with a valid non-negative integer are kept, so a
// missing/garbled figure leaves the slot's high_chairs_remaining absent.
function buildHighChairsByTime(
  bookingLoad: TableBookingLoadResponse | null | undefined
): Map<string, number> | undefined {
  const slots = bookingLoad?.slots
  if (!Array.isArray(slots) || slots.length === 0) return undefined

  const map = new Map<string, number>()
  for (const slot of slots) {
    const time = normalizeTime(String(slot?.time ?? ''))
    const remaining = slot?.high_chairs_remaining
    if (!isValidTime(time) || typeof remaining !== 'number' || !Number.isFinite(remaining) || remaining < 0) {
      continue
    }
    map.set(time, Math.floor(remaining))
  }

  return map.size > 0 ? map : undefined
}

function buildCombinedAvailability(
  businessHours: BusinessHours,
  options: {
    date: string
    partySize: number
    time: string
    bookingType: BookingType
    bookingLoad?: TableBookingLoadResponse | null
  }
): TableAvailabilityResponse {
  const { ranges, kitchenRanges, message } = resolveCombinedServiceRanges(
    businessHours,
    options.date,
    { bookingType: options.bookingType }
  )

  const londonNow = londonNowParts()
  const minMinutesForToday =
    londonNow.isoDate === options.date
      ? Math.ceil((londonNow.minutes + 60) / 30) * 30
      : undefined

  const busynessOptions: SlotBusynessOptions | undefined = options.bookingLoad
    ? {
        load: options.bookingLoad.bookings,
        thresholds: {
          windowMinutes: options.bookingLoad.window_minutes,
          filling: options.bookingLoad.filling_threshold_covers,
          busy: options.bookingLoad.busy_threshold_covers
        }
      }
    : undefined

  const highChairsByTime = buildHighChairsByTime(options.bookingLoad)

  const timeSlots = buildSlotsWithKitchenState(
    ranges,
    kitchenRanges,
    options.partySize,
    30,
    minMinutesForToday,
    busynessOptions,
    highChairsByTime
  )

  const available = timeSlots.some(
    (slot) => slot.available === true || (slot.available_capacity || 0) >= options.partySize
  )

  const fallbackMessage =
    message ||
    (available
      ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
      : 'No online times are currently available for this request. Please choose another date or call 01753 682707.')

  return {
    date: options.date,
    time: options.time,
    party_size: options.partySize,
    available,
    time_slots: timeSlots,
    message: fallbackMessage,
    special_notes:
      'If your preferred time is unavailable, choose a nearby slot or call 01753 682707.'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySizeRaw = searchParams.get('party_size')
  const requestedTime = searchParams.get('time') || '19:00'

  void searchParams.get('booking_type')
  const bookingType: BookingType = 'regular'

  // purpose was previously read and thrown away. That was harmless while every booking was
  // allocated the same way; it stopped being harmless the moment food and drinks started
  // filling opposite ends of the pub. Food goes to the dining room first, drinks to the bar,
  // so the same slot can genuinely differ between them.
  //
  // This is the guest's stated intent, NOT the question we ask the picker. See
  // the two-call model below: asking only about food would let a food-scoped
  // answer speak for the whole venue.
  const guestWantsDrinksOnly = searchParams.get('purpose') === 'drinks'
  const outside = searchParams.get('outside') === 'true'
  const requiresAccessibleTable = searchParams.get('requires_accessible_table') === 'true'
  const highChairCount = Number.parseInt(searchParams.get('high_chair_count') || '0', 10) || 0

  if (!date || !partySizeRaw) {
    return createApiErrorResponse(
      'Missing required parameters: date and party_size are required',
      400
    )
  }

  if (!isValidIsoDate(date)) {
    return createApiErrorResponse('Date must use YYYY-MM-DD format', 400)
  }

  const normalizedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedTime)) {
    return createApiErrorResponse('Time must use HH:mm or HH:mm:ss format', 400)
  }

  const partySize = parsePositiveInt(partySizeRaw, 2)

  try {
    // Two bounded questions, asked in parallel, because a food-scoped answer is
    // not the truth about the venue.
    //
    // The pub is open for drinks whenever it is open at all, so the DRINKS
    // answer is the superset and decides which times exist. The FOOD answer is
    // a subset of it and only refines the "Drinks & food" versus "Drinks only"
    // label, which is what the form and deriveSubmitPurpose already read.
    //
    // Asking only about food (the default intent) made the food answer speak
    // for the venue. In production that is not a rounding error: on a Monday
    // the kitchen is closed all day, so the food answer is zero slots with
    // reason `closed` while the drinks answer is 23 available slots between
    // 16:00 and 21:30. Every Monday would have shown "we are closed" on a day
    // the pub is open and serving. Every other night the food answer also
    // stops one to three hours before the bar does, which would have removed
    // the late drinks slots.
    //
    // When the guest has ticked "Just drinks" there is no food question worth
    // asking, so only one call is made.
    const availabilityQuery = { partySize, outside, requiresAccessibleTable, highChairCount }

    const [businessHours, drinksLoad, foodLoad] = await Promise.all([
      anchorAPI.getBusinessHours(),
      anchorAPI.getTableBookingLoadSafe(date, { ...availabilityQuery, purpose: 'drinks' }),
      guestWantsDrinksOnly
        ? Promise.resolve(null)
        : anchorAPI.getTableBookingLoadSafe(date, { ...availabilityQuery, purpose: 'food' })
    ])

    const bookingLoad = drinksLoad

    // If the management API answered with real table availability, it decides. The local slot
    // maths below never looks at tables, joins, private bookings or communal events, which is
    // why the site could advertise a time when the pub was physically full.
    const tableAvailability: TableAvailability | null = drinksLoad?.table_availability ?? null

    // Only a COMPLETE food answer may drive the label. Missing, unknown, or not
    // asked for all fall back to the local kitchen window, which is what the
    // grid used before any of this and is never worse than it.
    const foodAvailability: TableAvailability | null = foodLoad?.table_availability ?? null
    const foodByTime =
      foodAvailability?.calculation_state === 'complete' && Array.isArray(foodAvailability.slots)
        ? new Map<string, TableAvailabilitySlotState>(
            foodAvailability.slots.map((slot) => [String(slot.time).slice(0, 5), slot])
          )
        : null

    if (!tableAvailability || tableAvailability.calculation_state === 'unknown') {
      // Never fail open. Whether the load timed out, failed, answered without a
      // table read-out, or answered "unknown": we could not check, so we do not
      // guess. The customer is offered a retry and the phone number rather than
      // a locally calculated slot nobody can stand behind (review F04).
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            date,
            party_size: partySize,
            calculation_state: 'unknown',
            available: false,
            time_slots: [],
            message:
              tableAvailability?.message ||
              'We could not check live availability just now. Please try again, or give us a ring on 01753 682707.'
          },
          meta: {
            source: tableAvailability ? 'management_api' : 'availability_unknown',
            service_model: 'combined_food_drinks'
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const fallback: WebsiteAvailabilityResponse = buildCombinedAvailability(businessHours, {
      date,
      partySize,
      time: normalizedTime,
      bookingType,
      bookingLoad
    })

    fallback.calculation_state = 'complete'
    if (typeof tableAvailability.max_party_size_online === 'number') {
      fallback.max_party_size_online = tableAvailability.max_party_size_online
    }

    const authoritativeSlots = Array.isArray(tableAvailability.slots) ? tableAvailability.slots : []

    if (authoritativeSlots.length === 0) {
      // A COMPLETE calculation with no slots is an answer, not a gap: the picker
      // ran and has nothing to offer (closed, too large, or genuinely nothing
      // free). Falling back to the local grid here would advertise times the
      // management API has explicitly declined to offer, which is the same
      // fail-open F04 killed. Show the no-availability state; only `unknown`
      // shows the try-again message.
      //
      // This is the DRINKS answer, so an empty list really does mean the venue
      // has nothing, not merely that the kitchen is shut.
      fallback.time_slots = []
      if (tableAvailability.public_reason) {
        fallback.public_reason = tableAvailability.public_reason
      }
      if (tableAvailability.message) {
        fallback.message = tableAvailability.message
      }
    } else {
      // Overlay the authoritative answer onto the existing shape, so the form keeps rendering the
      // same structure and only the truthfulness changes.
      const byTime = new Map<string, TableAvailabilitySlotState>(
        authoritativeSlots.map((slot) => [String(slot.time).slice(0, 5), slot])
      )

      fallback.time_slots = (fallback.time_slots || []).map((slot) => {
        const real = byTime.get(String(slot.time).slice(0, 5))

        // A COMPLETE answer is exhaustive: a time the picker did not speak
        // about is a time it cannot honour. Leaving such a slot bookable on
        // local schedule maths alone was the last remnant of the fail-open,
        // because that maths knows nothing about tables (review F04).
        if (!real) {
          return {
            ...slot,
            available: false,
            available_capacity: 0,
            unavailable_reason: 'unknown',
            unavailable_message: null
          }
        }

        // Does the kitchen serve this time too? The food answer knows things
        // the local kitchen window cannot: a slot inside kitchen hours can
        // still be at its pacing ceiling. Without a usable food answer, keep
        // the locally derived flag.
        const kitchenOpen = foodByTime
          ? foodByTime.get(String(slot.time).slice(0, 5))?.state === 'available'
          : slot.kitchen_open

        return {
          ...slot,
          available: real.state === 'available',
          // The form filters on available_capacity, so it has to agree with the state or a
          // slot could read unavailable and still be selectable.
          available_capacity: real.state === 'available' ? Math.max(slot.available_capacity ?? 0, partySize) : 0,
          unavailable_reason: real.public_reason ?? null,
          unavailable_message: real.message ?? null,
          high_chairs_remaining: real.high_chairs_remaining ?? slot.high_chairs_remaining,
          kitchen_open: kitchenOpen
        }
      })
    }

    // `available` was computed from the local grid before the overlay replaced
    // it. Recompute so the summary flag cannot claim availability the slots
    // themselves deny.
    fallback.available = fallback.time_slots.some(
      (slot) => slot.available === true || (slot.available_capacity || 0) >= partySize
    )

    return new Response(
      JSON.stringify({
        success: true,
        data: fallback,
        meta: {
          // Reaching here requires table_availability, so the answer is always
          // the management API's; the local grid only shapes the response.
          source: 'management_api',
          service_model: 'combined_food_drinks'
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (fallbackError: any) {
    logError('api/table-bookings/availability-fallback', fallbackError, {
      date,
      time: normalizedTime,
      partySize,
      bookingType
    })

    return createApiErrorResponse(
      'We couldn\'t check table availability right now. Please try again or call us at 01753 682707.',
      503
    )
  }
}
