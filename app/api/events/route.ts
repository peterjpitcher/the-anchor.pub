import { NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const today = searchParams.get('today') === 'true'
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
  const fromDate = searchParams.get('from_date') || new Date().toISOString().split('T')[0]
  const categoryId = searchParams.get('category_id') || undefined
  const availableOnly = searchParams.get('available_only') === 'true'
  
  try {
    let data
    
    if (today) {
      data = await anchorAPI.getTodaysEvents()
    } else {
      data = await anchorAPI.getEvents({
        from_date: fromDate,
        limit,
        category_id: categoryId,
        available_only: availableOnly || undefined
      })
    }

    // Return with success wrapper format for consistency
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error: any) {
    logError('api/events', error)
    
    if (error.status === 401) {
      return createApiErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    return createApiErrorResponse(
      error.message || 'We couldn\'t load the events right now. Please try again in a moment.',
      error.status || 503
    )
  }
}