import { anchorAPI, type BusinessHours, type TableAvailabilityResponse } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import {
  buildSlotsFromRanges,
  isValidIsoDate,
  isValidTime,
  londonNowParts,
  normalizeTime,
  resolveServiceRanges,
  type BookingPurpose,
  type BookingType
} from '@/lib/table-booking-service-windows'

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function isSundayIso(isoDate: string): boolean {
  const [year, month, day] = isoDate.split('-').map((p) => Number.parseInt(p, 10))
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0
}

function buildFallbackAvailability(
  businessHours: BusinessHours,
  options: {
    date: string
    partySize: number
    time: string
    bookingType: BookingType
    purpose: BookingPurpose
  }
): TableAvailabilityResponse & { sunday_lunch_available?: boolean } {
  const { ranges, message } = resolveServiceRanges(businessHours, options.date, {
    bookingType: options.bookingType,
    purpose: options.purpose
  })

  const londonNow = londonNowParts()
  const minMinutesForToday =
    londonNow.isoDate === options.date
      ? Math.ceil((londonNow.minutes + 60) / 30) * 30
      : undefined

  const timeSlots = buildSlotsFromRanges(ranges, options.partySize, 30, minMinutesForToday)
  const available = timeSlots.some(
    (slot) => slot.available === true || (slot.available_capacity || 0) >= options.partySize
  )

  const fallbackMessage =
    message ||
    (available
      ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
      : options.purpose === 'food'
      ? 'No online food times are currently available for this request. You can try drinks-only times or call us.'
      : 'No online times are currently available for this request. Please choose an alternative or join the waitlist.')

  return {
    date: options.date,
    time: options.time,
    party_size: options.partySize,
    available,
    time_slots: timeSlots,
    message: fallbackMessage,
    special_notes:
      options.purpose === 'food'
        ? 'Food bookings follow kitchen service hours. For later slots, switch to drinks-only or call 01753 682707.'
        : 'If your preferred time is unavailable, choose a nearby slot or call 01753 682707 to join the waitlist.'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySizeRaw = searchParams.get('party_size')
  const requestedTime = searchParams.get('time') || '19:00'
  const bookingType: BookingType =
    searchParams.get('booking_type') === 'sunday_lunch' ? 'sunday_lunch' : 'regular'

  const requestedPurpose: BookingPurpose =
    searchParams.get('purpose') === 'drinks' ? 'drinks' : 'food'
  const purpose: BookingPurpose = bookingType === 'sunday_lunch' ? 'food' : requestedPurpose

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
    const businessHours = await anchorAPI.getBusinessHours()
    const fallback = buildFallbackAvailability(businessHours, {
      date,
      partySize,
      time: normalizedTime,
      bookingType,
      purpose
    })

    // When this is a food request on a Sunday, also resolve sunday_lunch ranges so
    // the client knows whether to show the "Sunday plans" toggle. The management app
    // signals "Sunday Lunch Closed" via schedule_config: [] — resolveServiceRanges
    // already handles this and returns empty ranges in that case.
    if (bookingType !== 'sunday_lunch' && purpose === 'food' && isSundayIso(date)) {
      const sundayLunchResolution = resolveServiceRanges(businessHours, date, {
        bookingType: 'sunday_lunch',
        purpose: 'food'
      })
      ;(fallback as { sunday_lunch_available?: boolean }).sunday_lunch_available =
        sundayLunchResolution.ranges.length > 0
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: fallback,
        meta: {
          source: 'schedule_fallback',
          purpose
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
      bookingType,
      purpose
    })

    return createApiErrorResponse(
      'We couldn\'t check table availability right now. Please try again or call us at 01753 682707.',
      503
    )
  }
}
