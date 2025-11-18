import { NextResponse } from 'next/server'

const API_KEY = process.env.ANCHOR_API_KEY
const API_BASE_URL = 'https://management.orangejelly.co.uk/api'

export async function POST(request: Request) {
  const verboseLogging = process.env.API_DEBUG_LOGS === 'true'
  const logDebug = (...args: unknown[]) => {
    if (verboseLogging) console.log(...args)
  }

  logDebug('Booking initiate request received')
  logDebug('API_KEY exists:', !!API_KEY)
  
  if (!API_KEY) {
    console.error('ANCHOR_API_KEY is not set in environment variables')
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    logDebug('Booking request body:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.event_id || !body.mobile_number) {
      return NextResponse.json(
        { error: 'Missing required fields: event_id and mobile_number' },
        { status: 400 }
      )
    }
    
    const response = await fetch(
      `${API_BASE_URL}/bookings/initiate`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )

    logDebug(`Booking API response status: ${response.status}`)

    if (!response.ok) {
      let errorData;
      let errorMessage = `API error: ${response.status}`;
      
      try {
        errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
        console.error('Booking API error response:', errorData)
      } catch (e) {
        const textError = await response.text()
        console.error('Booking API error text:', textError)
        errorMessage = textError || errorMessage
      }
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check API key validity and permissions.' },
          { status: 401 }
        )
      }
      
      // Handle specific API error responses
      if (errorData?.error?.code === 'SYSTEM_ERROR') {
        return NextResponse.json(
          { 
            error: 'The booking system is temporarily unavailable. Please try again later or call us at 01753 682707.',
            code: errorData.error.code,
            originalMessage: errorData.error.message
          },
          { status: 503 } // Service Unavailable
        )
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorData },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    logDebug('Booking initiation successful:', data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to initiate booking:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initiate booking',
        message: error.message,
        details: error.stack
      },
      { status: 500 }
    )
  }
}
