import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const menu = await anchorAPI.getSundayLunchMenu()

    return NextResponse.json(menu)
  } catch (error) {
    logError('api/table-bookings/menu/sunday-lunch', error)

    return createApiErrorResponse(
      'We could not load the Sunday lunch menu. Please call us at 01753 682707 for menu information.',
      503
    )
  }
}
