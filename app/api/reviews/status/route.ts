import { NextResponse } from 'next/server'
import { mockReviews } from '@/lib/google/review-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      googlePlaces: { enabled: false },
      reviews: {
        source: 'static',
        rating: null,
        totalReviews: null,
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
