import { anchorAPI, type BusinessHours, type TableAvailabilityResponse, type TableBookingLoadResponse } from '@/lib/api'
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
  const purpose = searchParams.get('purpose') === 'drinks' ? 'drinks' : 'food'
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
    const [businessHours, bookingLoad] = await Promise.all([
      anchorAPI.getBusinessHours(),
      // Now carries `table_availability`, computed by the same picker that creates bookings.
      anchorAPI.getTableBookingLoadFailOpen(date, {
        partySize,
        purpose,
        outside,
        requiresAccessibleTable,
        highChairCount
      })
    ])

    // If the management API answered with real table availability, it decides. The local slot
    // maths below never looks at tables, joins, private bookings or communal events, which is
    // why the site could advertise a time when the pub was physically full.
    const tableAvailability = (bookingLoad as any)?.table_availability

    if (tableAvailability?.calculation_state === 'unknown') {
      // Never fail open. We could not check, so we do not guess: the customer is told to ring
      // rather than shown a slot nobody can stand behind.
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            date,
            party_size: partySize,
            calculation_state: 'unknown',
            time_slots: [],
            message:
              tableAvailability.message ||
              'We cannot check availability right now. Please give us a ring on 01753 682707.'
          },
          meta: { source: 'management_api', service_model: 'combined_food_drinks' }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const fallback = buildCombinedAvailability(businessHours, {
      date,
      partySize,
      time: normalizedTime,
      bookingType,
      bookingLoad
    })

    // Overlay the authoritative answer onto the existing shape, so the form keeps rendering the
    // same structure and only the truthfulness changes. A slot the management API has not
    // spoken about is left exactly as it was.
    if (Array.isArray(tableAvailability?.slots) && tableAvailability.slots.length > 0) {
      const byTime = new Map<string, any>(
        tableAvailability.slots.map((s: any) => [String(s.time).slice(0, 5), s])
      )

      fallback.time_slots = (fallback.time_slots || []).map((slot: any) => {
        const real = byTime.get(String(slot.time).slice(0, 5))
        if (!real) return slot
        return {
          ...slot,
          available: real.state === 'available',
          // The form filters on available_capacity, so it has to agree with the state or a
          // slot could read unavailable and still be selectable.
          available_capacity: real.state === 'available' ? Math.max(slot.available_capacity ?? 0, partySize) : 0,
          unavailable_reason: real.public_reason ?? null,
          unavailable_message: real.message ?? null,
          high_chairs_remaining: real.high_chairs_remaining ?? slot.high_chairs_remaining
        }
      })

      ;(fallback as any).calculation_state = 'complete'
      ;(fallback as any).max_party_size_online = tableAvailability.max_party_size_online
    }

    // Above the online limit there is nothing to show; it is a private booking.
    if (tableAvailability?.public_reason === 'too_large') {
      fallback.time_slots = []
      ;(fallback as any).public_reason = 'too_large'
      ;(fallback as any).message = tableAvailability.message
      ;(fallback as any).max_party_size_online = tableAvailability.max_party_size_online
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: fallback,
        meta: {
          source: tableAvailability ? 'management_api' : 'schedule_fallback',
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
