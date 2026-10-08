import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { PRIVATE_NO_STORE_HEADERS } from '@/lib/api-cache-policy'
import { RATE_LIMITS, RATE_LIMIT_MESSAGE, limitByAddress, tooManyRequests } from '@/lib/rate-limit'

// There is no GET here. Reading a booking back by its reference was removed on
// 8 October 2026 (site review PY-009): nothing on the site called it, and the
// management app has no such read to pass it on to.

export async function DELETE(
  request: Request,
  { params }: { params: { reference: string } }
) {
  // Spends the management app's shared key, so one address gets 20 a minute.
  // Per server (lib/rate-limit.ts).
  const rateLimit = limitByAddress(request, 'table-booking-cancel', RATE_LIMITS.publicRead)
  if (rateLimit.limited) {
    return tooManyRequests(rateLimit, { success: false, error: RATE_LIMIT_MESSAGE, code: 'RATE_LIMITED' })
  }

  // From the header only. An email address in the query string would sit in
  // every request log on the way here.
  const customerEmail = request.headers.get('x-customer-email') || ''

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
    }, { headers: PRIVATE_NO_STORE_HEADERS })
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
