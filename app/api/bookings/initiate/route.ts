import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.event_id || !body.mobile_number) {
      return createApiErrorResponse('Missing required fields: event_id and mobile_number', 400)
    }

    const response = await anchorAPI.initiateBooking({
      event_id: body.event_id,
      mobile_number: body.mobile_number
    })

    return NextResponse.json(response)
  } catch (error: any) {
    logError('api/bookings/initiate', error)

    if (error.code === 'UNAUTHORIZED' || error.status === 401) {
      return createApiErrorResponse('Authentication failed. Please check API key validity and permissions.', 401)
    }

    if (error.code === 'SYSTEM_ERROR' || error.status === 503) {
      return createApiErrorResponse(
        'The booking system is temporarily unavailable. Please try again later or call us at 01753 682707.',
        503,
        { originalMessage: error.message }
      )
    }

    return createApiErrorResponse(
      error.message || 'Failed to initiate booking',
      error.status || 500,
      error.details
    )
  }
}
