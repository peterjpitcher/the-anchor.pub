import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import type { TableBookingRequest } from '@/lib/api'
import { getEffectiveDayHours, isKitchenClosed, normaliseUKPhone } from '@/lib/hours-utils'

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
      return NextResponse.json({
        success: false,
        error: 'Invalid content type'
      }, { status: 400 })
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
      
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }
    
    // Check kitchen status from API (no hardcoded day logic)
    try {
      const businessHours = await anchorAPI.getBusinessHours()
      const effectiveHours = getEffectiveDayHours(
        bookingData.date,
        businessHours.regularHours,
        businessHours.specialHours
      )
      
      if (isKitchenClosed(effectiveHours)) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'KITCHEN_CLOSED',
            message: 'Kitchen is closed on this date. Bar service only - please call 01753 682707 for drinks-only reservations.'
          }
        }, { status: 400 })
      }
    } catch (error) {
      console.error('Failed to check business hours:', error)
      // Continue with booking attempt - let API handle validation
    }
    
    // Determine booking type and handle menu selections
    let bookingType = 'regular'
    let specialRequirements = bookingData.specialRequirements || ''
    let menuSelections = undefined
    
    // Check if this is a Sunday booking
    const bookingDate = new Date(bookingData.date + 'T12:00:00')
    const isSundayBooking = bookingDate.getDay() === 0
    
    // Handle Sunday lunch bookings (renamed from sunday_roast)
    if (bookingData.bookingType === 'sunday_lunch' && bookingData.menuSelections && bookingData.menuSelections.length > 0) {
      // Use the proper API booking type for Sunday lunch with menu selections
      bookingType = 'sunday_lunch'
      menuSelections = bookingData.menuSelections
    }
    
    // Create booking request
    const bookingRequest: any = {
      booking_type: bookingType,
      date: bookingData.date,
      time: bookingData.time,
      party_size: bookingData.partySize,
      customer: {
        first_name: bookingData.firstName,
        last_name: bookingData.lastName,
        mobile_number: normaliseUKPhone(bookingData.phone),
        email: bookingData.email || undefined,
        sms_opt_in: bookingData.marketingOptIn || false
      },
      duration_minutes: 120,
      special_requirements: specialRequirements,
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
    const idempotencyKey = `${bookingData.date}-${bookingData.time}-${normaliseUKPhone(bookingData.phone)}-${Date.now()}`
    
    // Submit to API
    const booking = await anchorAPI.createTableBooking(bookingRequest, idempotencyKey)
    
    // Check if payment is required (Sunday lunch bookings should return this from API)
    if (booking.payment_required && booking.payment_details) {
      // Return payment details for redirect
      return NextResponse.json({
        success: true,
        reference: booking.booking_reference || booking.booking_id,
        payment_required: true,
        payment_details: booking.payment_details,
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
    if (bookingType === 'sunday_lunch' && !booking.payment_required) {
      console.warn('WARNING: Sunday lunch booking did not return payment_required from API')
      console.warn('This suggests the API is not configured correctly for Sunday lunch payments')
    }
    
    // Handle response based on request type
    if (!contentType?.includes('application/json')) {
      // Non-JS: Redirect to confirmation page
      return NextResponse.redirect(
        new URL(`/booking-confirmation?ref=${booking.booking_reference}`, request.url)
      )
    }
    
    // JS: Return JSON response (regular booking confirmed)
    return NextResponse.json({
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
    
  } catch (error: any) {
    console.error('Booking submission error:', error)
    console.error('Error details:', error.response?.data || error)
    
    // Check if it's a non-JS submission
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.redirect(
        new URL(`/book-table?error=submission_failed`, request.url)
      )
    }
    
    // Handle API v2 error format with correlation_id
    const errorResponse = error.response?.data?.error || error.response?.data || {}
    const errorMessage = errorResponse.message || error.message || 'Failed to create booking'
    const correlationId = errorResponse.correlation_id
    
    // Log correlation ID for debugging
    if (correlationId) {
      console.error('🔍 Error Correlation ID:', correlationId)
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      correlation_id: correlationId,
      details: errorResponse.details || error.response?.data
    }, { status: error.response?.status || 500 })
  }
}