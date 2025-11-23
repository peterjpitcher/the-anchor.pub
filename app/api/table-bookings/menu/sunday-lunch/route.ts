import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

export const dynamic = 'force-dynamic'

let menuCache: { data: any; timestamp: number } | null = null
const CACHE_DURATION = 60 * 1000 // 1 minute

export async function GET() {
  try {
    if (menuCache && Date.now() - menuCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(menuCache.data)
    }

    const menu = await anchorAPI.getSundayLunchMenu()

    menuCache = {
      data: menu,
      timestamp: Date.now()
    }

    return NextResponse.json(menu)
  } catch (error) {
    logError('api/table-bookings/menu/sunday-lunch', error)

    if (menuCache) {
      console.warn('Returning cached Sunday lunch menu due to error')
      return NextResponse.json(menuCache.data)
    }

    return createApiErrorResponse(
      'We could not load the Sunday lunch menu. Please call us at 01753 682707 for menu information.',
      503
    )
  }
}
