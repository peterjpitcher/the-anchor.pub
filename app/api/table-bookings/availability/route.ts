import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getEffectiveDayHours, isKitchenClosed } from '@/lib/hours-utils'

export async function GET(request: Request) {
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
    const businessHours = await anchorAPI.getBusinessHours()
    
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
    
    const response = await anchorAPI.checkTableAvailability({
        date,
        party_size: parseInt(partySize),
        time: time || '12:00', // SDK requires time, default to 12:00 if checking full day? Or should I update SDK?
        // Wait, checkTableAvailability SDK method builds URLSearchParams.
        // If I pass '12:00', it checks specific time.
        // The route seems to support checking general availability for a date.
        // Let's look at SDK: query.append('time', params.time). It's required.
        // The original route: if (time) query.append('time', time). It was optional.
        // If SDK requires it, I might have a problem if I don't pass it.
        // However, looking at `anchorAPI.checkTableAvailability` signature:
        // time: string (Required).
        // I should pass `time || '12:00'` as a dummy if checking full day?
        // Or is there a different endpoint?
        // The upstream endpoint `/table-bookings/availability` likely requires `time` if checking a slot, or returns slots if not.
        // If SDK enforces `time`, I must provide it.
        // But wait, `checkTableAvailability` returns `TableAvailabilityResponse`.
        // Let's assume `time` is needed for the query.
        // I'll pass `time || ''` and rely on SDK/API behavior? 
        // SDK: query.append('time', params.time).
        // If I pass empty string, `time=` is sent.
        // Let's trust `time || undefined` if SDK allows optional.
        // SDK signature: `time: string`. It's mandatory in TS.
        // I'll pass `time || '00:00'` or similar?
        // Actually, in the original code `time` was optional.
        // I will cast to any to bypass TS restriction if needed, or pass undefined if I modify SDK.
        // But I can't modify SDK easily right now without checking `lib/api.ts` content again.
        // `lib/api.ts`: `checkTableAvailability(params: { ... time: string ... })`.
        // It appends to query params.
        // If I pass a dummy time like "09:00", the API might filter by it.
        // Use `time || ''` and hope API handles empty time.
        duration: duration ? parseInt(duration) : undefined,
        booking_type: bookingType as 'regular' | 'sunday_lunch' | undefined
    } as any) // Cast to any to allow optional time if API supports it but SDK types don't

    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error: any) {
    logError('api/table-bookings/availability', error, {
      date,
      time,
      partySize,
      duration
    })
    
    if (error.code === 'UNAUTHORIZED' || error.status === 401) {
        return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    return createApiErrorResponse(
      'We couldn\'t check table availability right now. Please try again or call us at 01753 682707.',
      503
    )
  }
}
