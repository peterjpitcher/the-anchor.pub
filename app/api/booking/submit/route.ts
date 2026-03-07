import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { getSundayLunchDepositAmount } from '@/lib/constants'
import { normaliseUKPhone } from '@/lib/hours-utils'
import {
  isTimeWithinRanges,
  normalizeTime,
  resolveServiceRanges,
  type BookingPurpose,
  type BookingType
} from '@/lib/table-booking-service-windows'

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * Booking submission endpoint for the wizard
 * Handles both JavaScript and non-JavaScript submissions
 */
export async function POST(request: Request) {
  try {
    let bookingData: any
    
    // Check content type to handle both JSON and form data
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      // JavaScript submission
      const jsonData = await request.json()
      // Map camelCase from frontend to snake_case for API
      bookingData = {
        date: jsonData.date,
        time: jsonData.time,
        partySize: jsonData.partySize,
        bookingType: jsonData.bookingType || 'regular',
        purpose: jsonData.purpose,
        firstName: jsonData.firstName,
        lastName: jsonData.lastName,
        phone: jsonData.phone,
        email: jsonData.email,
        specialRequirements: jsonData.specialRequirements,
        marketingOptIn: jsonData.marketingOptIn,
        menuSelections: jsonData.menuSelections // THIS WAS MISSING!
      }
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      // Non-JavaScript form submission
      const formData = await request.formData()
      bookingData = {
        date: formData.get('date'),
        time: formData.get('time'),
        partySize: parseInt(formData.get('party_size') as string || '2'),
        bookingType: formData.get('booking_type') || 'regular',
        purpose: formData.get('purpose'),
        firstName: formData.get('first_name'),
        lastName: formData.get('last_name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        dietaryRequirements: formData.getAll('dietary_requirements'),
        allergies: formData.get('allergies'),
        occasion: formData.get('occasion'),
        specialRequirements: formData.get('special_requirements')
      }
    } else {
      return jsonResponse({
        success: false,
        error: 'Invalid content type'
      }, 400)
    }
    
    // Validate required fields
    if (!bookingData.date || !bookingData.time || !bookingData.firstName || 
        !bookingData.lastName || !bookingData.phone) {
      // For non-JS submissions, redirect back with error
      if (!contentType?.includes('application/json')) {
        return NextResponse.redirect(
          new URL(`/book-table?error=missing_fields`, request.url)
        )
      }
      
      return jsonResponse({
        success: false,
        error: 'Missing required fields'
      }, 400)
    }
    
    const hasSundayLunchSelections =
      bookingData.bookingType === 'sunday_lunch' &&
      Array.isArray(bookingData.menuSelections) &&
      bookingData.menuSelections.length > 0
    const resolvedBookingType: BookingType = hasSundayLunchSelections ? 'sunday_lunch' : 'regular'
    const requestedPurpose: BookingPurpose = bookingData.purpose === 'drinks' ? 'drinks' : 'food'
    const purpose: BookingPurpose = resolvedBookingType === 'sunday_lunch' ? 'food' : requestedPurpose
    const normalizedBookingTime = normalizeTime(String(bookingData.time))

    // Enforce service windows for legacy wizard path as a defense-in-depth guard.
    try {
      const businessHours = await anchorAPI.getBusinessHours()

      const serviceWindow = resolveServiceRanges(businessHours, String(bookingData.date), {
        bookingType: resolvedBookingType,
        purpose
      })

      const canBookTime =
        !serviceWindow.closed &&
        serviceWindow.ranges.length > 0 &&
        isTimeWithinRanges(normalizedBookingTime, serviceWindow.ranges)

      if (!canBookTime) {
        const message =
          serviceWindow.message ||
          (purpose === 'food'
            ? 'Food bookings are only available during kitchen service hours. Please choose a different time or call us for drinks-only reservations.'
            : 'That time is outside our drinks booking window. Please choose another time or call 01753 682707.')

        return jsonResponse({
          success: false,
          error: {
            code: 'OUTSIDE_SERVICE_WINDOW',
            message
          }
        }, 400)
      }
    } catch (error) {
      console.error('Failed to check service windows:', error)
      return jsonResponse({
        success: false,
        error: {
          code: 'SERVICE_WINDOW_CHECK_FAILED',
          message: 'We could not verify service hours right now. Please try again or call 01753 682707.'
        }
      }, 503)
    }
    
    const menuSelections = hasSundayLunchSelections ? bookingData.menuSelections : undefined
    
    // Create booking request
    const bookingRequest: any = {
      booking_type: resolvedBookingType,
      date: bookingData.date,
      time: bookingData.time,
      party_size: bookingData.partySize,
      purpose,
      customer: {
        first_name: bookingData.firstName,
        last_name: bookingData.lastName,
        mobile_number: normaliseUKPhone(bookingData.phone),
        email: bookingData.email || undefined,
        sms_opt_in: bookingData.marketingOptIn || false
      },
      duration_minutes: 120,
      special_requirements: bookingData.specialRequirements || '',
      dietary_requirements: bookingData.dietaryRequirements || [],
      allergies: bookingData.allergies || [],
      celebration_type: bookingData.occasion || undefined,
      source: 'website'
    }
    
    // Add menu selections if available
    if (menuSelections) {
      bookingRequest.menu_selections = menuSelections
    }
    
    // Generate idempotency key to prevent duplicate bookings
    const idempotencyKey = crypto.randomUUID()
    
    // Submit to API
    const booking = await anchorAPI.createTableBooking(bookingRequest, idempotencyKey)
    
    const bookingState = typeof booking.state === 'string' ? booking.state : null
    const pendingPaymentFlow =
      booking.payment_required === true
      || booking.status === 'pending_payment'
      || bookingState === 'pending_payment'
    const paymentUrl = booking.payment_details?.payment_url || booking.next_step_url || null
    const partySize = Number(bookingData.partySize || 1)
    // Deposit is £10/person for Sunday lunch and groups of 7+ — same rate for both
    const requiresDeposit = resolvedBookingType === 'sunday_lunch' || partySize >= 7
    const fallbackDepositAmount = requiresDeposit ? getSundayLunchDepositAmount(partySize) : 0

    // Check if payment is required (Sunday lunch bookings should return this from API)
    if (pendingPaymentFlow && !paymentUrl) {
      return jsonResponse({
        success: false,
        error: {
          code: 'PAYMENT_LINK_UNAVAILABLE',
          message: 'Your booking is awaiting payment, but we could not generate the payment link. Please call 01753 682707 so we can secure your table.'
        }
      }, 502)
    }

    if (pendingPaymentFlow && paymentUrl) {
      const depositAmount = Number(
        booking.payment_details?.deposit_amount ?? booking.payment_details?.amount ?? fallbackDepositAmount
      )
      const normalizedDepositAmount = Number.isFinite(depositAmount) ? depositAmount : fallbackDepositAmount
      const paymentExpiresAt =
        booking.payment_details?.expires_at ||
        booking.hold_expires_at ||
        new Date(Date.now() + 15 * 60 * 1000).toISOString()

      // Return payment details for redirect
      return jsonResponse({
        success: true,
        reference: booking.booking_reference || booking.booking_id,
        payment_required: true,
        payment_details: {
          ...(booking.payment_details || {}),
          amount: normalizedDepositAmount,
          deposit_amount: normalizedDepositAmount,
          total_amount: Number.isFinite(booking.payment_details?.total_amount as number)
            ? Number(booking.payment_details?.total_amount)
            : normalizedDepositAmount,
          outstanding_amount: Number.isFinite(booking.payment_details?.outstanding_amount as number)
            ? Number(booking.payment_details?.outstanding_amount)
            : normalizedDepositAmount,
          currency: booking.payment_details?.currency || 'GBP',
          payment_url: paymentUrl,
          expires_at: paymentExpiresAt
        },
        booking: {
          reference: booking.booking_reference || booking.booking_id,
          status: booking.status || 'pending_payment',
          date: booking.confirmation_details?.date || bookingData.date,
          time: booking.confirmation_details?.time || bookingData.time,
          party_size: booking.confirmation_details?.party_size || bookingData.partySize,
          customer_name: `${bookingData.firstName} ${bookingData.lastName}`
        }
      })
    }
    
    // Log warning if Sunday lunch booking didn't require payment
    if (resolvedBookingType === 'sunday_lunch' && !pendingPaymentFlow) {
      console.warn('WARNING: Sunday lunch booking did not return payment_required from API')
      console.warn('This suggests the API is not configured correctly for Sunday lunch payments')
    }
    
    // Handle response based on request type
    if (!contentType?.includes('application/json')) {
      // Non-JS: Redirect back to booking page
      return NextResponse.redirect(
        new URL('/book-table', request.url)
      )
    }
    
    // JS: Return JSON response (regular booking confirmed)
    return jsonResponse({
      success: true,
      reference: booking.booking_reference,
      booking: {
        reference: booking.booking_reference,
        status: booking.status,
        date: booking.confirmation_details?.date || bookingData.date,
        time: booking.confirmation_details?.time || bookingData.time,
        party_size: booking.confirmation_details?.party_size || bookingData.partySize,
        customer_name: `${bookingData.firstName} ${bookingData.lastName}`
      }
    })
    
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: { message?: string; correlation_id?: string; details?: unknown }; [key: string]: unknown }; status?: number }; message?: string }
    console.error('Booking submission error:', error)
    console.error('Error details:', err.response?.data || error)

    // Check if it's a non-JS submission
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.redirect(
        new URL(`/book-table?error=submission_failed`, request.url)
      )
    }

    // Handle API v2 error format with correlation_id
    const errorResponse = err.response?.data?.error || err.response?.data || {}
    const errorMessage = (errorResponse as { message?: string }).message || err.message || 'Failed to create booking'
    const correlationId = (errorResponse as { correlation_id?: string }).correlation_id

    // Log correlation ID for debugging
    if (correlationId) {
      console.error('Error Correlation ID:', correlationId)
    }

    return jsonResponse({
      success: false,
      error: errorMessage,
      correlation_id: correlationId,
      details: (errorResponse as { details?: unknown }).details || err.response?.data
    }, err.response?.status || 500)
  }
}
