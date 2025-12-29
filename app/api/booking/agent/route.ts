import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import type { TableBookingRequest } from '@/lib/api'

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
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: date, time, partySize, customer'
      }, { status: 400 })
    }
    
    // Validate customer data
    if (!body.customer.firstName || !body.customer.lastName || !body.customer.phone || !body.customer.email) {
      return NextResponse.json({
        success: false,
        error: 'Missing customer fields: firstName, lastName, phone, email'
      }, { status: 400 })
    }
    
    // Parse natural language date if needed
    let bookingDate = body.date
    if (isNaN(Date.parse(bookingDate))) {
      // Try to parse natural language dates
      bookingDate = parseNaturalDate(body.date)
      if (!bookingDate) {
        return NextResponse.json({
          success: false,
          error: `Unable to parse date: ${body.date}. Please use YYYY-MM-DD format or natural language like "tomorrow" or "next Sunday"`
        }, { status: 400 })
      }
    }
    
    // Determine if it's a Sunday roast booking
    const date = new Date(bookingDate + 'T12:00:00')
    const isSunday = date.getDay() === 0
    const requestedType =
      body.type === 'sunday_lunch' || body.type === 'regular'
        ? body.type
        : undefined

    const bookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')
    
    // Create booking request
    const bookingRequest: TableBookingRequest = {
      booking_type: bookingType,
      date: bookingDate,
      time: body.time,
      party_size: body.partySize,
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
    return NextResponse.json({
      success: true,
      booking: {
        reference: booking.booking_reference,
        status: booking.status,
        date: booking.confirmation_details?.date || bookingDate,
        time: booking.confirmation_details?.time || body.time,
        partySize: booking.confirmation_details?.party_size || body.partySize,
        type: bookingType,
        customer: {
          name: `${body.customer.firstName} ${body.customer.lastName}`,
          phone: body.customer.phone
        },
        message: `Booking confirmed for ${body.partySize} people on ${formatDateForDisplay(bookingDate)} at ${formatTimeForDisplay(body.time)}`,
        specialInstructions: isSunday && bookingType === 'sunday_lunch'
          ? 'Sunday lunch bookings require a £5 per person deposit. A payment link will be sent via SMS.'
          : null
      }
    })
    
  } catch (error: any) {
    console.error('AI agent booking error:', error)
    
    // Return structured error for AI agent
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create booking',
      suggestion: 'Please verify all fields are correct or call the restaurant at 01753 682707'
    }, { status: 500 })
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
  
  if (!date) {
    return NextResponse.json({
      success: false,
      error: 'Date parameter required'
    }, { status: 400 })
  }
  
  try {
    // Parse natural language date if needed
    let checkDate = date
    if (isNaN(Date.parse(checkDate))) {
      const parsedDate = parseNaturalDate(date)
      if (!parsedDate) {
        return NextResponse.json({
          success: false,
          error: `Unable to parse date: ${date}`
        }, { status: 400 })
      }
      checkDate = parsedDate
    }
    
    // Check availability
    const isSunday = new Date(checkDate + 'T12:00:00').getDay() === 0
    const requestedType =
      typeParam === 'sunday_lunch' || typeParam === 'regular'
        ? typeParam
        : undefined
    const bookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')

    const availability = await anchorAPI.checkTableAvailability({
      date: checkDate,
      time: '12:00', // Check all times
      party_size: parseInt(partySize || '2', 10),
      booking_type: bookingType
    })
    
    return NextResponse.json({
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
      message: availability.message || availability.special_notes
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check availability'
    }, { status: 500 })
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
