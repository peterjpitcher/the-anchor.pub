import { anchorAPI } from '@/lib/api'
import type { TableBookingRequest } from '@/lib/api'
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
 * AI Agent Booking Endpoint
 * Accepts structured JSON for direct booking creation
 * Designed for GPT-5 and other AI agents
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.date || !body.time || !body.partySize || !body.customer) {
      return jsonResponse({
        success: false,
        error: 'Missing required fields: date, time, partySize, customer'
      }, 400)
    }
    
    // Validate customer data
    if (!body.customer.firstName || !body.customer.lastName || !body.customer.phone || !body.customer.email) {
      return jsonResponse({
        success: false,
        error: 'Missing customer fields: firstName, lastName, phone, email'
      }, 400)
    }
    
    // Parse natural language date if needed
    let bookingDate = body.date
    if (isNaN(Date.parse(bookingDate))) {
      // Try to parse natural language dates
      bookingDate = parseNaturalDate(body.date)
      if (!bookingDate) {
        return jsonResponse({
          success: false,
          error: `Unable to parse date: ${body.date}. Please use YYYY-MM-DD format or natural language like "tomorrow" or "next Sunday"`
        }, 400)
      }
    }
    
    // Determine if it's a Sunday roast booking
    const date = new Date(bookingDate + 'T12:00:00')
    const isSunday = date.getDay() === 0
    const requestedType =
      body.type === 'sunday_lunch' || body.type === 'regular'
        ? body.type
        : undefined

    const bookingType: BookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')
    const requestedPurpose: BookingPurpose = body.purpose === 'drinks' ? 'drinks' : 'food'
    const purpose: BookingPurpose = bookingType === 'sunday_lunch' ? 'food' : requestedPurpose
    const normalizedBookingTime = normalizeTime(String(body.time))

    try {
      const businessHours = await anchorAPI.getBusinessHours()
      const serviceWindow = resolveServiceRanges(businessHours, bookingDate, {
        bookingType,
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
            ? 'Food bookings are only available during kitchen service hours. Please choose another time or switch to drinks.'
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
      console.error('AI agent service window check failed:', error)
      return jsonResponse({
        success: false,
        error: {
          code: 'SERVICE_WINDOW_CHECK_FAILED',
          message: 'We could not verify service hours right now. Please try again or call 01753 682707.'
        }
      }, 503)
    }
    
    // Create booking request
    const bookingRequest: TableBookingRequest = {
      booking_type: bookingType,
      date: bookingDate,
      time: body.time,
      party_size: body.partySize,
      purpose,
      customer: {
        first_name: body.customer.firstName,
        last_name: body.customer.lastName,
        email: body.customer.email,
        mobile_number: body.customer.phone,
        sms_opt_in: true
      },
      duration_minutes: body.duration || 120,
      special_requirements: body.specialRequirements,
      dietary_requirements: body.dietaryRequirements,
      allergies: body.allergies,
      celebration_type: body.occasion,
      source: 'ai_agent'
    }
    
    // Create booking via API
    const booking = await anchorAPI.createTableBooking(bookingRequest)
    
    // Return structured response for AI agent
    return jsonResponse({
      success: true,
      booking: {
        reference: booking.booking_reference,
        status: booking.status,
        date: booking.confirmation_details?.date || bookingDate,
        time: booking.confirmation_details?.time || body.time,
        partySize: booking.confirmation_details?.party_size || body.partySize,
        type: bookingType,
        purpose,
        customer: {
          name: `${body.customer.firstName} ${body.customer.lastName}`,
          phone: body.customer.phone
        },
        message: `Booking confirmed for ${body.partySize} people on ${formatDateForDisplay(bookingDate)} at ${formatTimeForDisplay(body.time)}`,
        specialInstructions: isSunday && bookingType === 'sunday_lunch'
          ? (
              body.partySize >= 7
                ? 'Sunday lunch roasts must be pre-ordered by 1pm Saturday. Bookings of 7+ require a card hold to secure the booking (no charge).'
                : 'Sunday lunch roasts must be pre-ordered by 1pm Saturday.'
            )
          : null
      }
    })
    
  } catch (error: unknown) {
    console.error('AI agent booking error:', error)

    // Return structured error for AI agent
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
      suggestion: 'Please verify all fields are correct or call the restaurant at 01753 682707'
    }, 500)
  }
}

/**
 * GET endpoint for AI agents to check availability
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySize = searchParams.get('partySize')
  const typeParam = searchParams.get('type')
  const purposeParam = searchParams.get('purpose')
  
  if (!date) {
    return jsonResponse({
      success: false,
      error: 'Date parameter required'
    }, 400)
  }
  
  try {
    // Parse natural language date if needed
    let checkDate = date
    if (isNaN(Date.parse(checkDate))) {
      const parsedDate = parseNaturalDate(date)
      if (!parsedDate) {
        return jsonResponse({
          success: false,
          error: `Unable to parse date: ${date}`
        }, 400)
      }
      checkDate = parsedDate
    }
    
    // Check availability
    const isSunday = new Date(checkDate + 'T12:00:00').getDay() === 0
    const requestedType =
      typeParam === 'sunday_lunch' || typeParam === 'regular'
        ? typeParam
        : undefined
    const bookingType: BookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')
    const requestedPurpose: BookingPurpose = purposeParam === 'drinks' ? 'drinks' : 'food'
    const purpose: BookingPurpose = bookingType === 'sunday_lunch' ? 'food' : requestedPurpose
    const normalizedPartySize = Number.parseInt(partySize || '2', 10)

    const availabilityParams = new URLSearchParams({
      date: checkDate,
      time: '12:00',
      party_size: Number.isFinite(normalizedPartySize) && normalizedPartySize > 0
        ? String(normalizedPartySize)
        : '2',
      booking_type: bookingType,
      purpose
    })

    const availabilityUrl = new URL('/api/table-bookings/availability', request.url)
    availabilityUrl.search = availabilityParams.toString()

    const availabilityResponse = await fetch(availabilityUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })
    const availabilityBody = await availabilityResponse.json().catch(() => null)

    if (!availabilityResponse.ok || availabilityBody?.success === false) {
      const errorMessage =
        availabilityBody?.error?.message ||
        availabilityBody?.error ||
        `Failed to check availability (${availabilityResponse.status})`

      return jsonResponse({
        success: false,
        error: errorMessage
      }, availabilityResponse.status || 502)
    }

    const availability = availabilityBody?.data || availabilityBody
    
    return jsonResponse({
      success: true,
      date: checkDate,
      available: availability.available,
      times:
        availability.time_slots?.map((slot: any) => {
          const availableCapacity =
            typeof slot.available_capacity === 'number'
              ? slot.available_capacity
              : 0
          return {
            time: slot.time,
            available: slot.available ?? availableCapacity > 0
          }
        }) || [],
      isSunday,
      bookingType,
      purpose,
      message: availability.message || availability.special_notes
    })
    
  } catch (error: unknown) {
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check availability'
    }, 500)
  }
}

/**
 * Parse natural language dates
 */
function parseNaturalDate(input: string): string | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lowerInput = input.toLowerCase().trim()
  
  // Handle relative dates
  if (lowerInput === 'today') {
    return today.toISOString().split('T')[0]
  }
  
  if (lowerInput === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }
  
  // Handle "next [day]" format
  if (lowerInput.startsWith('next ')) {
    const dayName = lowerInput.replace('next ', '')
    const targetDay = getDayNumber(dayName)
    if (targetDay !== -1) {
      const nextDate = getNextDayOfWeek(today, targetDay)
      return nextDate.toISOString().split('T')[0]
    }
  }
  
  // Handle "this [day]" format
  if (lowerInput.startsWith('this ')) {
    const dayName = lowerInput.replace('this ', '')
    const targetDay = getDayNumber(dayName)
    if (targetDay !== -1) {
      const thisDate = getThisDayOfWeek(today, targetDay)
      return thisDate.toISOString().split('T')[0]
    }
  }
  
  // Try parsing as regular date
  const parsed = new Date(input)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }
  
  return null
}

function getDayNumber(dayName: string): number {
  const days: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  }
  return days[dayName.toLowerCase()] ?? -1
}

function getNextDayOfWeek(from: Date, dayOfWeek: number): Date {
  const date = new Date(from)
  const currentDay = date.getDay()
  const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7
  date.setDate(date.getDate() + daysUntil)
  return date
}

function getThisDayOfWeek(from: Date, dayOfWeek: number): Date {
  const date = new Date(from)
  const currentDay = date.getDay()
  const daysUntil = (dayOfWeek - currentDay + 7) % 7
  date.setDate(date.getDate() + daysUntil)
  return date
}

function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })
}

function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}
