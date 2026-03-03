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
    
    let availability;

    try {
        availability = await anchorAPI.checkEventAvailability(params.id, seats)
    } catch (error: unknown) {
        // Fallback: if the availability endpoint fails (e.g. 404 or not implemented),
        // try fetching the event details and calculating availability manually.
        // This matches the previous route's resilience logic.
        const err = error as { status?: number }
        if (err.status === 404 || err.status === 405 || err.status === 500) {
             try {
                 const event = await anchorAPI.getEvent(params.id)
                 if (event) {
                    const maxCapacity = event.maximumAttendeeCapacity || 100
                    const remaining = event.remainingAttendeeCapacity ?? 0
                    const booked = maxCapacity - remaining
                    
                    availability = {
                        available: remaining >= seats,
                        event_id: event.id,
                        capacity: maxCapacity,
                        booked: booked,
                        remaining: remaining,
                        percentage_full: maxCapacity ? Math.round((booked / maxCapacity) * 100) : 0
                    }
                 } else {
                     throw error // Re-throw original error if event not found
                 }
             } catch (innerError) {
                 throw error // Throw original error if fallback fails
             }
        } else {
            throw error
        }
    }

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
