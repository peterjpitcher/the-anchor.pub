import { NextResponse } from 'next/server'
import { DEFAULT_REVIEW_STATS, mockReviews } from '@/lib/google/review-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      googlePlaces: { enabled: false },
      reviews: {
        source: 'static',
        rating: DEFAULT_REVIEW_STATS.rating,
        totalReviews: DEFAULT_REVIEW_STATS.totalReviews,
        reviewsAvailable: mockReviews.length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
