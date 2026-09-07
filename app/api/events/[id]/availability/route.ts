import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Parse request body to get seats parameter
    const body = await request.json()
    const seats = body.seats || 1
    
    // First, check if this event has bookings disabled
    try {
      const event = await anchorAPI.getEvent(params.id)
      if (event && event.bookings_enabled === false) {
        return NextResponse.json({
          success: true,
          data: {
            available: false,
            reason: 'bookings_disabled',
            message: 'Bookings are not available for this event'
          }
        })
      }
    } catch {
      // If we can't fetch the event, continue with the availability check
    }

    // Availability comes from the management app or it does not come at all.
    //
    // This used to fall back to calculating availability here whenever the
    // upstream returned 404, 405 or 500, which is precisely during an outage,
    // when local arithmetic is least trustworthy. It was wrong three ways.
    //
    // It invented a capacity: `maximumAttendeeCapacity || 100`. Every real
    // capacity is 60, so an event whose capacity did not load was published as
    // holding 100. It then read `remainingAttendeeCapacity ?? 0`, so an event
    // whose remaining count did not load was reported as sold out, and the two
    // together produced "100 booked of 100, 100% full" for an event nobody had
    // booked. It also read only the schema.org spelling, the single-spelling
    // bug that `getEventRemainingCapacity` records as having silenced every
    // scarcity readout on the site when the list response stopped carrying it.
    //
    // Most importantly, local slot maths cannot see tables, joins or private
    // bookings. That is why availability fails closed here and everywhere else:
    // the site once advertised times when the pub was physically full. The
    // catch below already returns a 503 with a phone number, which is the
    // correct answer to "we do not know".
    const availability = await anchorAPI.checkEventAvailability(params.id, seats)

    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: availability
    })
  } catch (error: unknown) {
    logError('api/events/[id]/availability', error, { id: params.id })

    const err = error as { code?: string; status?: number }
    if (err.code === 'UNAUTHORIZED' || err.status === 401) {
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    return createApiErrorResponse(
      'We couldn\'t check availability for this event. Please try again later.',
      503
    )
  }
}
