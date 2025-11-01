import { NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

const API_KEY = process.env.ANCHOR_API_KEY
const API_BASE_URL = 'https://management.orangejelly.co.uk/api'

export async function GET(
  request: Request,
  { params }: { params: { reference: string } }
) {
  const customerEmail =
    request.headers.get('x-customer-email') ||
    new URL(request.url).searchParams.get('customer_email') ||
    undefined
  
  if (!API_KEY) {
    console.error('ANCHOR_API_KEY is not set in environment variables')
    return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
  }

  const { reference } = params
  
  if (!reference) {
    return createApiErrorResponse('Booking reference is required', 400)
  }

  if (!customerEmail) {
    return createApiErrorResponse('Customer email required to verify booking', 400)
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/table-bookings/${reference}`,
      {
        headers: {
          'X-API-Key': API_KEY,
          'X-Customer-Email': customerEmail
        }
      }
    )

    if (!response.ok) {
      console.error(`Table booking details API error: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        console.error('Authentication failed - API key may be invalid or lack permissions')
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
      }
      
      if (response.status === 404) {
        return createApiErrorResponse(
          'Booking not found. Please check your reference number.',
          404
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
        data.error?.message || 'Unable to retrieve booking',
        400,
        data.error
      )
    }
    
    // Extract data from success response
    const bookingData = data.data || data
    
    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: bookingData
    })
  } catch (error) {
    logError('api/table-bookings/[reference]', error, { reference })
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
    undefined

  if (!API_KEY) {
    console.error('ANCHOR_API_KEY is not set in environment variables')
    return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
  }

  const { reference } = params
  
  if (!reference) {
    return createApiErrorResponse('Booking reference is required', 400)
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

    const response = await fetch(
      `${API_BASE_URL}/table-bookings/${reference}/cancel`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
          ...(customerEmail ? { 'X-Customer-Email': customerEmail } : {})
        },
        body: JSON.stringify({ reason })
      }
    )

    if (!response.ok) {
      console.error(`Table booking cancellation API error: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        console.error('Authentication failed - API key may be invalid or lack permissions')
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
      }
      
      if (response.status === 404) {
        return createApiErrorResponse(
          'Booking not found. It may have already been cancelled.',
          404
        )
      }
      
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null)
        return createApiErrorResponse(
          errorData?.error || 'Cannot cancel this booking. Please call us at 01753 682707 for assistance.',
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
        data.error?.message || 'Unable to cancel booking',
        400,
        data.error
      )
    }
    
    // Extract data from success response
    const cancellationData = data.data || data
    
    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data: cancellationData
    })
  } catch (error) {
    logError('api/table-bookings/[reference]/cancel', error, { reference })
    return createApiErrorResponse(
      'We couldn\'t cancel your booking online. Please call us at 01753 682707 and we\'ll help you right away.',
      503
    )
  }
}
