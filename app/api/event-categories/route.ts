import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { NO_STORE_HEADERS } from '@/lib/api-cache-policy'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await anchorAPI.getEventCategories()
    return NextResponse.json(data)
  } catch (error) {
    console.warn('event-categories route fallback triggered', {
      message: error instanceof Error ? error.message : error
    })

    return NextResponse.json(
      {
        categories: [],
        meta: {
          total: 0,
          lastUpdated: new Date().toISOString()
        }
      },
      // An empty list standing in for a failed read. Storing it would show
      // every visitor no categories for minutes after the read recovered.
      { status: 200, headers: NO_STORE_HEADERS }
    )
  }
}
