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

  const timeSlots = buildSlotsWithKitchenState(
    ranges,
    kitchenRanges,
    options.partySize,
    30,
    minMinutesForToday,
    busynessOptions
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

  // booking_type and purpose query params are accepted for backwards compatibility
  // with stale links/clients but are intentionally ignored: the public availability
  // contract is now a single combined slot list with per-slot kitchen_open.
  void searchParams.get('booking_type')
  void searchParams.get('purpose')
  const bookingType: BookingType = 'regular'

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
      anchorAPI.getTableBookingLoadFailOpen(date)
    ])
    const fallback = buildCombinedAvailability(businessHours, {
      date,
      partySize,
      time: normalizedTime,
      bookingType,
      bookingLoad
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: fallback,
        meta: {
          source: 'schedule_fallback',
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
