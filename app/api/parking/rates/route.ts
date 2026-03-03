import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { logError } from '@/lib/error-handling'

export async function GET() {
  try {
    const rates = await anchorAPI.getParkingRates()
    return NextResponse.json({
      success: true,
      data: rates
    })
  } catch (error: unknown) {
    logError('api/parking/rates', error)

    const err = error as { status?: number; code?: string }
    const status = err?.status || 500
    const code = err?.code || 'INTERNAL_ERROR'
    const message =
      code === 'FORBIDDEN'
        ? 'Parking rates are unavailable right now. Please try again later.'
        : 'We could not load parking rates. Please refresh the page or contact us.'

    return NextResponse.json({
      success: false,
      error: {
        code,
        message
      }
    }, { status })
  }
}
