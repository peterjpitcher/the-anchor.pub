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
  } catch (error: unknown) {
    logError('api/table-bookings/[reference]', error, { reference })

    const err = error as { status?: number; code?: string; message?: string }

    if (err.status === 501 || err.code === 'NOT_SUPPORTED') {
      return createApiErrorResponse(
        'Online booking lookup is currently unavailable. Please call us at 01753 682707 and we will help you.',
        501
      )
    }

    if (err.status === 404 || err.code === 'NOT_FOUND') {
         return createApiErrorResponse('Booking not found. Please check your reference number.', 404)
    }
    if (err.status === 401 || err.code === 'UNAUTHORIZED') {
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
    // Get cancellation reason from request body if provided
    let reason: string | undefined
    try {
      const body = await request.json()
      reason = body.reason
    } catch {
      // Body parsing failed, continue without reason
    }

    const response = await anchorAPI.cancelTableBooking(reference, {
      reason: reason || 'Cancelled via website',
      customerEmail
    })

    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error: unknown) {
    logError('api/table-bookings/[reference]/cancel', error, { reference })

    const err = error as { status?: number; code?: string; message?: string }

    if (err.status === 501 || err.code === 'NOT_SUPPORTED') {
      return createApiErrorResponse(
        'Online cancellation is currently unavailable. Please call us at 01753 682707 and we will cancel it for you.',
        501
      )
    }

    if (err.status === 404 || err.code === 'NOT_FOUND') {
        return createApiErrorResponse(
          'Booking not found. It may have already been cancelled.',
          404
        )
    }

    if (err.status === 400 || err.code === 'VALIDATION_ERROR') {
        return createApiErrorResponse(
          err.message || 'Cannot cancel this booking. Please call us at 01753 682707 for assistance.',
          400
        )
    }

    if (err.status === 401 || err.code === 'UNAUTHORIZED') {
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    return createApiErrorResponse(
      'We couldn\'t cancel your booking online. Please call us at 01753 682707 and we\'ll help you right away.',
      503
    )
  }
}
