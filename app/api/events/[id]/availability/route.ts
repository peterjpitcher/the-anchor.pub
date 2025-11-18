import { NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

const API_KEY = process.env.ANCHOR_API_KEY
const API_BASE_URL = 'https://management.orangejelly.co.uk/api'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const verboseLogging = process.env.API_DEBUG_LOGS === 'true'
  const logDebug = (...args: unknown[]) => {
    if (verboseLogging) console.log(...args)
  }
  
  logDebug('Availability check for event:', params.id)
  logDebug('API_KEY exists:', !!API_KEY)
  
  if (!API_KEY) {
    console.error('ANCHOR_API_KEY is not set in environment variables')
    return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
  }

  try {
    // Parse request body to get seats parameter
    const body = await request.json()
    const seats = body.seats || 1
    
    logDebug('Checking availability for seats:', seats)
    
    // Try the check-availability endpoint with POST method
    const response = await fetch(
      `${API_BASE_URL}/events/${params.id}/check-availability`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seats })
      }
    )

    logDebug('Check-availability response status:', response.status)
    
    // Handle authentication errors specifically
    if (response.status === 401) {
      console.error('Authentication failed - API key may be invalid or lack permissions')
      return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }
    
    // If check-availability doesn't exist or errors, fall back to getting the full event
    if (response.status === 404 || response.status === 405 || !response.ok) {
      logDebug('Falling back to full event endpoint')
      const eventResponse = await fetch(
        `${API_BASE_URL}/events/${params.id}`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      )

      logDebug('Event response status:', eventResponse.status)
      
      if (!eventResponse.ok) {
        // If individual event endpoint fails, try to get from events list
        logDebug('Individual event endpoint failed, trying events list')
        const eventsResponse = await fetch(
          `${API_BASE_URL}/events?limit=100`,
          {
            headers: {
              'X-API-Key': API_KEY
            }
          }
        )
        
        if (!eventsResponse.ok) {
          const errorText = await eventsResponse.text()
          console.error('Events list API error:', errorText)
          throw new Error(`API error: ${eventsResponse.status}`)
        }
        
        const eventsData = await eventsResponse.json()
        
        // Handle wrapped response format
        const eventsList = eventsData.success && eventsData.data ? eventsData.data : eventsData
        const events = eventsList.events || eventsList
        const event = events?.find((e: any) => e.id === params.id || e.slug === params.id)
        
        if (!event) {
          console.error('Event not found in events list')
          return createApiErrorResponse('Event not found', 404)
        }
        
        // Create availability response from event data
        const availability = {
          available: event.remainingAttendeeCapacity > 0,
          event_id: event.id,
          capacity: event.maximumAttendeeCapacity || 100,
          booked: event.maximumAttendeeCapacity ? (event.maximumAttendeeCapacity - event.remainingAttendeeCapacity) : 0,
          remaining: event.remainingAttendeeCapacity || 0,
          percentage_full: event.maximumAttendeeCapacity 
            ? Math.round(((event.maximumAttendeeCapacity - event.remainingAttendeeCapacity) / event.maximumAttendeeCapacity) * 100)
            : 0
        }
        
        return NextResponse.json(availability)
      }

      const eventData = await eventResponse.json()
      
      // Handle wrapped response format
      if (eventData.success === false) {
        return createApiErrorResponse(
          eventData.error?.message || 'Unable to check availability',
          400,
          eventData.error
        )
      }
      
      const event = eventData.data || eventData.event || eventData
      
      // Create availability response from event data using correct field names
      const availability = {
        available: event.remainingAttendeeCapacity > 0,
        event_id: event.id,
        capacity: event.maximumAttendeeCapacity || 100,
        booked: event.maximumAttendeeCapacity ? (event.maximumAttendeeCapacity - event.remainingAttendeeCapacity) : 0,
        remaining: event.remainingAttendeeCapacity || 0,
        percentage_full: event.maximumAttendeeCapacity 
          ? Math.round(((event.maximumAttendeeCapacity - event.remainingAttendeeCapacity) / event.maximumAttendeeCapacity) * 100)
          : 0
      }

      return NextResponse.json(availability)
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Handle wrapped response format
    if (data.success === false) {
      return createApiErrorResponse(
        data.error?.message || 'Unable to check availability',
        400,
        data.error
      )
    }
    
    const availabilityData = data.data || data
    
    // Try to get capacity info from the events list
    let maximumCapacity = 100
    
    try {
      const eventsResponse = await fetch(
        `${API_BASE_URL}/events?limit=100`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      )
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        
        // Handle wrapped response format  
        const eventsList = eventsData.success && eventsData.data ? eventsData.data : eventsData
        const events = eventsList.events || eventsList
        const event = events?.find((e: any) => e.id === params.id)
        if (event && event.maximumAttendeeCapacity) {
          maximumCapacity = event.maximumAttendeeCapacity
        }
      }
    } catch (e) {
      logDebug('Could not fetch event details for capacity')
    }
    
    // Map the API response to our expected format
    const availability = {
      available: availabilityData.available,
      event_id: availabilityData.event?.id || params.id,
      capacity: maximumCapacity,
      booked: maximumCapacity - (availabilityData.available_seats || 0),
      remaining: availabilityData.available_seats || 0,
      percentage_full: maximumCapacity ? Math.round(((maximumCapacity - (availabilityData.available_seats || 0)) / maximumCapacity) * 100) : 0
    }
    
    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: availability
    })
  } catch (error) {
    logError('api/events/[id]/availability', error, { id: params.id })
    return createApiErrorResponse(
      'We couldn\'t check availability for this event. Please try again later.',
      503
    )
  }
}
