import { NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getEffectiveDayHours, isKitchenClosed } from '@/lib/hours-utils'

const API_BASE_URL = 'https://management.orangejelly.co.uk/api'

export async function GET(request: Request) {
  const apiKey = process.env.ANCHOR_API_KEY

  if (!apiKey) {
    console.error('ANCHOR_API_KEY is not set in environment variables')
    return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySize = searchParams.get('party_size')
  const time = searchParams.get('time') // Optional for specific time check
  const duration = searchParams.get('duration')
  const bookingType = searchParams.get('booking_type') // 'regular' or 'sunday_lunch' (not sunday_roast)

  // Validate required parameters
  if (!date || !partySize) {
    return createApiErrorResponse(
      'Missing required parameters: date and party_size are required',
      400
    )
  }

  try {
    // Fetch business hours to check kitchen status
    const businessHoursResponse = await fetch(
      `${API_BASE_URL}/business/hours`,
      {
        headers: {
          'X-API-Key': apiKey
        }
      }
    )
    
    if (businessHoursResponse.ok) {
      const hoursData = await businessHoursResponse.json()
      const businessHours = hoursData.data || hoursData
      
      // Get effective hours for this date (handles special hours)
      const effectiveHours = getEffectiveDayHours(
        date,
        businessHours.regularHours,
        businessHours.specialHours
      )
      
      // Check if kitchen is closed using unified logic
      if (isKitchenClosed(effectiveHours)) {
        return NextResponse.json({
          success: false,
          available: false,
          reason: 'kitchen_closed',
          message: 'Kitchen is closed on this date. Bar service only - please call 01753 682707 for drinks-only reservations.',
          kitchen_hours: null,
          time_slots: []
        })
      }
    }
    
    // Build query parameters
    const query = new URLSearchParams({
      date,
      party_size: partySize
    })
    
    if (time) {
      query.append('time', time)
    }
    
    if (duration) {
      query.append('duration', duration)
    }
    
    if (bookingType) {
      query.append('booking_type', bookingType)
    }

    const response = await fetch(
      `${API_BASE_URL}/table-bookings/availability?${query.toString()}`,
      {
        headers: {
          'X-API-Key': apiKey
        }
      }
    )

    if (!response.ok) {
      console.error(`Table availability API error: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        console.error('Authentication failed - API key may be invalid or lack permissions')
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
      }
      
      // Handle specific status codes
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null)
        return createApiErrorResponse(
          errorData?.error || 'Invalid request parameters',
          400,
          errorData
        )
      }
      
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Check if the response has the expected format
    if (data.success === false) {
      console.error('API returned error:', data.error)
      return createApiErrorResponse(
        data.error?.message || 'Unable to check availability',
        400,
        data.error
      )
    }
    
    // Extract data from success response
    const availabilityData = data.data || data
    
    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: availabilityData
    })
  } catch (error) {
    logError('api/table-bookings/availability', error, {
      date,
      time,
      partySize,
      duration
    })
    return createApiErrorResponse(
      'We couldn\'t check table availability right now. Please try again or call us at 01753 682707.',
      503
    )
  }
}
