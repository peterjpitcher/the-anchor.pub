import { NextResponse } from 'next/server'
import { filterReviews, approvedReviews } from '@/lib/google/review-utils'
import { ReviewsFilter } from '@/lib/google/types'
import { logError } from '@/lib/error-handling'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filter parameters
    const filter: ReviewsFilter = {
      minRating: searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined,
      maxRating: searchParams.get('maxRating') ? parseInt(searchParams.get('maxRating')!) : undefined,
      keywords: searchParams.get('keywords') ? searchParams.get('keywords')!.split(',') : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') as ReviewsFilter['sortBy'],
    }

    // Real Google reviews from the owner's export (lib/google-reviews.ts).
    // The Google Places integration was removed; nothing here is generated.
    const filteredReviews = filterReviews(approvedReviews, filter)

    // Set cache headers (cache for 1 hour, revalidate in background)
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }

    return NextResponse.json({
      reviews: filteredReviews,
      rating: null,
      totalReviews: null,
      source: 'google-export',
      lastUpdated: new Date().toISOString()
    }, { headers })

  } catch (error) {
    logError('reviews-api', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
