import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

export async function GET(
  request: Request,
  { params }: { params: { reference: string } }
) {
  const customerEmail =
    request.headers.get('x-customer-email') ||
    new URL(request.url).searchParams.get('customer_email') ||
    ''
  
  const { reference } = params
  
  if (!reference) {
    return createApiErrorResponse('Booking reference is required', 400)
  }

  if (!customerEmail) {
    return createApiErrorResponse('Customer email required to verify booking', 400)
  }

  try {
    const bookingData = await anchorAPI.getTableBooking(reference, customerEmail)
    
    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: bookingData
    })
  } catch (error: any) {
    logError('api/table-bookings/[reference]', error, { reference })
    
    if (error.status === 404 || error.code === 'NOT_FOUND') {
         return createApiErrorResponse('Booking not found. Please check your reference number.', 404)
    }
    if (error.status === 401 || error.code === 'UNAUTHORIZED') {
         return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    return createApiErrorResponse(
      'We couldn\'t retrieve your booking details. Please try again or call us at 01753 682707.',
      503
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { reference: string } }
) {
  const { reference } = params
  
  if (!reference) {
    return createApiErrorResponse('Booking reference is required', 400)
  }

  try {
    // Get cancellation reason from request body if provided
    let reason: string | undefined
    try {
      const body = await request.json()
      reason = body.reason
    } catch {
      // Body parsing failed, continue without reason
    }

    const response = await anchorAPI.cancelTableBooking(reference, reason)

    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error: any) {
    logError('api/table-bookings/[reference]/cancel', error, { reference })
    
    if (error.status === 404 || error.code === 'NOT_FOUND') {
        return createApiErrorResponse(
          'Booking not found. It may have already been cancelled.',
          404
        )
    }
    
    if (error.status === 400 || error.code === 'VALIDATION_ERROR') {
        return createApiErrorResponse(
          error.message || 'Cannot cancel this booking. Please call us at 01753 682707 for assistance.',
          400
        )
    }

    if (error.status === 401 || error.code === 'UNAUTHORIZED') {
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    return createApiErrorResponse(
      'We couldn\'t cancel your booking online. Please call us at 01753 682707 and we\'ll help you right away.',
      503
    )
  }
}
