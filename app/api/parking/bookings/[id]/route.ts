import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { toPublicParkingBooking } from '@/lib/api/parking'
import { logError } from '@/lib/error-handling'
import { PRIVATE_NO_STORE_HEADERS } from '@/lib/api-cache-policy'
import { RATE_LIMITS, RATE_LIMIT_MESSAGE, limitByAddress, tooManyRequests } from '@/lib/rate-limit'

type RouteContext = {
  params: {
    id: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  // Spends the management app's shared key, so one address gets 20 a minute.
  // Per server (lib/rate-limit.ts).
  const rateLimit = limitByAddress(request, 'parking-booking-read', RATE_LIMITS.publicRead)
  if (rateLimit.limited) {
    return tooManyRequests(rateLimit, { success: false, error: { code: 'RATE_LIMITED', message: RATE_LIMIT_MESSAGE } })
  }

  const bookingId = context?.params?.id

  if (!bookingId) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'MISSING_ID',
        message: 'Booking ID is required.'
      }
    }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS })
  }

  try {
    // Reference, times, vehicle, amount and status only. The client already
    // drops the name, mobile and email; this is the same cut made a second
    // time, because this answer goes to whoever holds the booking id.
    const booking = toPublicParkingBooking(await anchorAPI.getParkingBooking(bookingId))

    return NextResponse.json({
      success: true,
      data: booking
    }, { headers: PRIVATE_NO_STORE_HEADERS })
  } catch (error: unknown) {
    logError('api/parking/bookings/[id]', error, { bookingId })

    const err = error as { status?: number; code?: string; details?: unknown }
    const status = err?.status || 500
    const code = err?.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR')

    const message =
      status === 404
        ? 'We could not find that parking booking. Please check the reference or contact us.'
        : 'We could not retrieve the parking booking details right now. Please try again shortly.'

    return NextResponse.json({
      success: false,
      error: {
        code,
        message,
        details: status >= 500 ? undefined : err?.details
      }
    }, { status, headers: PRIVATE_NO_STORE_HEADERS })
  }
}
