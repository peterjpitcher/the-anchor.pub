import { NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import type { Event } from '@/lib/api'

const API_KEY = process.env.ANCHOR_API_KEY
const API_BASE_URL = 'https://management.orangejelly.co.uk/api'

function buildSearchWindows(): string[] {
  const offsets = [0, 90, 365]
  return offsets.map(offset => {
    const date = new Date()
    if (offset > 0) {
      date.setDate(date.getDate() - offset)
    }
    return date.toISOString().split('T')[0]
  })
}

async function findEventFromList(idOrSlug: string): Promise<Event | null> {
  if (!API_KEY) {
    return null
  }

  const searchTargets = idOrSlug.trim().toLowerCase()
  const headers = {
    'X-API-Key': API_KEY
  }

  for (const fromDate of buildSearchWindows()) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/events?from_date=${fromDate}&limit=200`,
        { headers }
      )

      if (!response.ok) {
        continue
      }

      const payload = await response.json()
      const data = payload.success && payload.data ? payload.data : payload
      const events: Event[] = data.events || data

      const match = events.find(event => {
        const candidates = [
          event.id,
          event.slug,
          event.identifier
        ].filter(Boolean).map(value => `${value}`.trim().toLowerCase())

        return candidates.some(candidate => candidate === searchTargets)
      })

      if (match) {
        return match
      }
    } catch (error) {
      logError('api/events/[id]-fallback-list', error, {
        idOrSlug,
        fromDate
      })
    }
  }

  return null
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!API_KEY) {
    console.error('ANCHOR_API_KEY is not set in environment variables')
    return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${encodeURIComponent(params.id)}`,
      {
        headers: {
          'X-API-Key': API_KEY
        }
      }
    )

    if (!response.ok) {
      console.error(`Event API error: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        console.error('Authentication failed - API key may be invalid or lack permissions')
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
      }
      
      if (response.status === 404) {
        const fallbackEvent = await findEventFromList(params.id)
        if (fallbackEvent) {
          return NextResponse.json({
            success: true,
            data: fallbackEvent
          })
        }

        return createApiErrorResponse('Event not found', 404)
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
        data.error?.message || 'Unable to retrieve event',
        400,
        data.error
      )
    }
    
    // Extract data from success response
    const eventData = data.data || data
    
    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: eventData
    })
  } catch (error) {
    // If the direct request failed, try to recover by searching the events list
    try {
      const fallbackEvent = await findEventFromList(params.id)

      if (fallbackEvent) {
        return NextResponse.json({
          success: true,
          data: fallbackEvent
        })
      }
    } catch (fallbackError) {
      logError('api/events/[id]-fallback', fallbackError, { id: params.id })
    }

    logError('api/events/[id]', error, { id: params.id })
    return createApiErrorResponse(
      'We couldn\'t load this event. Please try again later.',
      503
    )
  }
}
