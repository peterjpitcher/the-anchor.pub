import { NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getEffectiveDayHours, isKitchenClosed, normaliseUKPhone } from '@/lib/hours-utils'
import { anchorAPI } from '@/lib/api'

const API_KEY = process.env.ANCHOR_API_KEY
const API_BASE_URL = 'https://management.orangejelly.co.uk/api'

// This interface matches what the frontend actually sends
interface BookingRequest {
  booking_type: 'regular' | 'sunday_lunch'
  date: string
  time: string
  party_size: number
  customer: {
    first_name: string
    last_name: string
    email?: string
    mobile_number: string
    sms_opt_in?: boolean
  }
  duration_minutes?: number
  special_requirements?: string
  dietary_requirements?: string | string[]  // Frontend might send either
  allergies?: string | string[]  // Frontend might send either
  celebration_type?: string
  source?: string
  // For Sunday lunch bookings - supports both old and new format
  menu_selections?: Array<{
    guest_name: string
    menu_item_id: string
    item_type: 'starter' | 'main' | 'dessert'
    quantity: number
    price_at_booking: number
  }>
  menu_items?: Array<{
    custom_item_name: string
    item_type: string
    quantity: number
    guest_name: string
    price_at_booking: number
  }>
}

export async function POST(request: Request) {
  const verboseLogging = process.env.API_DEBUG_LOGS === 'true'
  const logDebug = (...args: unknown[]) => {
    if (verboseLogging) console.log(...args)
  }

  logDebug('Table booking create request received')
  logDebug('API_KEY exists:', !!API_KEY)
  
  if (!API_KEY) {
    console.error('ANCHOR_API_KEY is not set in environment variables')
    return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
  }

  try {
    const headerIdempotencyKey = request.headers.get('Idempotency-Key')
    const idempotencyKey = headerIdempotencyKey ||
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `web-${Date.now()}-${Math.random().toString(16).slice(2)}`)

    const body: BookingRequest = await request.json()
    logDebug('Table booking request body:', JSON.stringify(body, null, 2))
    
    // Check kitchen status using unified logic
    try {
      const businessHours = await anchorAPI.getBusinessHours()
      
      // Get effective hours for this date (handles special hours)
      const effectiveHours = getEffectiveDayHours(
        body.date,
        businessHours.regularHours,
        businessHours.specialHours
      )
      
      // Check if kitchen is closed using unified logic
      if (isKitchenClosed(effectiveHours)) {
        return createApiErrorResponse(
          'Kitchen is closed on this date. Bar service only - please call 01753 682707 for drinks-only reservations.',
          400
        )
      }
    } catch (err) {
      console.error('Failed to check kitchen status:', err)
      // Continue with booking if we can't verify kitchen status
    }
    
    // Validate required fields
    const missingFields: string[] = []
    
    if (!body.booking_type) missingFields.push('booking_type')
    if (!body.date) missingFields.push('date')
    if (!body.time) missingFields.push('time')
    if (!body.party_size) missingFields.push('party_size')
    if (!body.customer) missingFields.push('customer')
    if (body.customer) {
      if (!body.customer.first_name) missingFields.push('customer.first_name')
      if (!body.customer.last_name) missingFields.push('customer.last_name')
      if (!body.customer.mobile_number) missingFields.push('customer.mobile_number')
      if (!body.customer.email) missingFields.push('customer.email')
    }
    
    if (missingFields.length > 0) {
      return createApiErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      )
    }
    
    // Validate party size
    if (body.party_size < 1 || body.party_size > 20) {
      return createApiErrorResponse(
        'Party size must be between 1 and 20 guests',
        400
      )
    }
    
    // Validate Sunday lunch specific requirements
    if (body.booking_type === 'sunday_lunch') {
      // Check for either menu_selections or menu_items
      if ((!body.menu_selections || body.menu_selections.length === 0) && 
          (!body.menu_items || body.menu_items.length === 0)) {
        return createApiErrorResponse(
          'Menu selections are required for Sunday lunch bookings',
          400
        )
      }
      
      // Get the array to validate
      const selectionsToValidate = body.menu_selections || body.menu_items || []
      
      // Validate each selection
      for (const selection of selectionsToValidate) {
        // Check if it's new format (custom_item_name) or old format (menu_item_id)
        const hasCustomName = 'custom_item_name' in selection
        const hasMenuId = 'menu_item_id' in selection
        
        if (!hasCustomName && !hasMenuId) {
          return createApiErrorResponse(
            'Invalid menu selection. Each selection must include either custom_item_name or menu_item_id',
            400
          )
        }
        
        if (hasCustomName) {
          // New format validation
          if (!selection.custom_item_name || !selection.item_type || !selection.quantity || 
              selection.price_at_booking === undefined || !selection.guest_name) {
            return createApiErrorResponse(
              'Invalid menu selection. Each selection must include name, type, quantity, guest name, and price',
              400
            )
          }
        } else {
          // Old format validation
          if (!selection.menu_item_id || !selection.item_type || !selection.quantity || 
              selection.price_at_booking === undefined || !selection.guest_name) {
            return createApiErrorResponse(
              'Invalid menu selection. Each selection must include menu item ID, type, quantity, guest name, and price',
              400
            )
          }
        }
      }
    }
    
    // The frontend already sends the data in the correct format
    // We just need to ensure defaults and clean up empty values
    const apiPayload: any = {
      booking_type: body.booking_type,
      date: body.date,
      time: body.time,
      party_size: body.party_size,
      duration_minutes: body.duration_minutes || 120,  // Default 2 hours
      customer: {
        first_name: body.customer.first_name,
        last_name: body.customer.last_name,
        email: body.customer.email?.trim(),
        mobile_number: normaliseUKPhone(body.customer.mobile_number),
        sms_opt_in: body.customer.sms_opt_in ?? true  // Default true if not specified
      },
      source: body.source || 'website'
    }
    
    // Only add optional fields if they have values
    if (body.special_requirements && body.special_requirements.trim()) {
      apiPayload.special_requirements = body.special_requirements
    }
    
    // Handle dietary_requirements - could be string or array from frontend
    if (body.dietary_requirements) {
      if (Array.isArray(body.dietary_requirements) && body.dietary_requirements.length > 0) {
        apiPayload.dietary_requirements = body.dietary_requirements
      } else if (typeof body.dietary_requirements === 'string' && body.dietary_requirements.trim()) {
        apiPayload.dietary_requirements = [body.dietary_requirements]
      }
    }
    
    // Handle allergies - could be string or array from frontend
    if (body.allergies) {
      if (Array.isArray(body.allergies) && body.allergies.length > 0) {
        apiPayload.allergies = body.allergies
      } else if (typeof body.allergies === 'string' && body.allergies.trim()) {
        apiPayload.allergies = [body.allergies]
      }
    }
    
    if (body.celebration_type && body.celebration_type.trim()) {
      apiPayload.celebration_type = body.celebration_type
    }
    
    // Add menu selections for Sunday lunch bookings
    if (body.booking_type === 'sunday_lunch') {
      // Handle new format with custom_item_name
      if (body.menu_selections && body.menu_selections.length > 0) {
        // Check if it's the new format (has custom_item_name) or old format (has menu_item_id)
        const firstItem = body.menu_selections[0]
        if ('custom_item_name' in firstItem) {
          // New format - pass through as is
          apiPayload.menu_selections = body.menu_selections
        } else {
          // Old format - keep for backward compatibility
          apiPayload.menu_selections = body.menu_selections
        }
      } else if (body.menu_items && body.menu_items.length > 0) {
        // Support menu_items as fallback
        apiPayload.menu_selections = body.menu_items
      }
    }
    
    // ... (validation logic remains above)

    logDebug('Transformed API payload:', JSON.stringify(apiPayload, null, 2))
    
    // Make request to external API with retry logic
    let lastError: Error | null = null
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const bookingData = await anchorAPI.createTableBooking(apiPayload, idempotencyKey)
        
        logDebug('Table booking creation successful:', bookingData)
        
        // For Sunday lunch bookings, ensure payment details are included
        if (body.booking_type === 'sunday_lunch' && bookingData.status === 'pending_payment') {
          logDebug('Sunday lunch booking requires payment:', bookingData.payment_details)
        }

        return NextResponse.json(bookingData)
      } catch (error: any) {
        lastError = error as Error
        console.error(`Table booking attempt ${attempt} failed:`, error)
        
        // Handle specific errors that shouldn't be retried
        if (error.code === 'VALIDATION_ERROR' || error.status === 400) {
             return createApiErrorResponse(error.message, 400, error.details)
        }
        if (error.code === 'NO_AVAILABILITY' || error.status === 409) {
             return createApiErrorResponse(
                  error.message || 'This time slot is no longer available. Please choose a different time.',
                  409,
                  error.details
             )
        }
        if (error.code === 'UNAUTHORIZED' || error.status === 401) {
             return createApiErrorResponse(
                  'Authentication failed. Service temporarily unavailable.',
                  503
             )
        }
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
    
    // All retries failed
    throw lastError || new Error('Failed to create booking after retries')
  } catch (error: any) {
    logError('api/table-bookings/create', error, { body: request.body })
    return createApiErrorResponse(
      'We couldn\'t process your booking online. Please call us at 01753 682707 and we\'ll reserve your table right away.',
      503
    )
  }
}
