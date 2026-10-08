import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { logError } from '@/lib/error-handling'
import { PRIVATE_NO_STORE_HEADERS } from '@/lib/api-cache-policy'
import { RATE_LIMITS, RATE_LIMIT_MESSAGE, limitByAddress, tooManyRequests } from '@/lib/rate-limit'

export async function GET(request: Request) {
  // Spends the management app's shared key, so one address gets 20 a minute.
  // Per server (lib/rate-limit.ts).
  const rateLimit = limitByAddress(request, 'parking-availability', RATE_LIMITS.publicRead)
  if (rateLimit.limited) {
    return tooManyRequests(rateLimit, { success: false, error: { code: 'RATE_LIMITED', message: RATE_LIMIT_MESSAGE } })
  }

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start') || undefined
  const end = searchParams.get('end') || undefined
  const granularityParam = searchParams.get('granularity') || undefined
  const granularity = granularityParam === 'hour' ? 'hour' : granularityParam === 'day' ? 'day' : undefined

  try {
    const availability = await anchorAPI.getParkingAvailability({
      start,
      end,
      granularity
    })

    return NextResponse.json({
      success: true,
      data: availability
    }, { headers: PRIVATE_NO_STORE_HEADERS })
  } catch (error: unknown) {
    logError('api/parking/availability', error, { start, end, granularity })

    const err = error as { status?: number; code?: string; details?: unknown }
    const status = err?.status || 500
    const code = err?.code || 'INTERNAL_ERROR'
    const message =
      code === 'FORBIDDEN'
        ? 'Parking availability is currently restricted. Please try again shortly.'
        : 'We could not load parking availability. Please refresh or try again later.'

    return NextResponse.json({
      success: false,
      error: {
        code,
        message,
        details: status >= 500 ? undefined : err?.details
      }
    }, { status, headers: PRIVATE_NO_STORE_HEADERS })
  }
}
