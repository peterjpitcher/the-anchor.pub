import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await anchorAPI.getEvent(params.id)

    if (!event) {
      return createApiErrorResponse('Event not found', 404)
    }
    
    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: event
    })
  } catch (error: unknown) {
    logError('api/events/[id]', error, { id: params.id })

    const err = error as { status?: number; message?: string }

    if (err.status === 404 || err.message === 'Event not found') {
        return createApiErrorResponse('Event not found', 404)
    }

    if (err.status === 401) {
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    return createApiErrorResponse(
      'We couldn\'t load this event. Please try again later.',
      503
    )
  }
}
