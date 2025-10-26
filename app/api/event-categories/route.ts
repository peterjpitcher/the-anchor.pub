import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'

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
      { status: 200 }
    )
  }
}
