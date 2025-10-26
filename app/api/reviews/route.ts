import { NextResponse } from 'next/server'
import { getAnchorPlacesClient } from '@/lib/google/places-client'
import { filterReviews, mockReviews } from '@/lib/google/review-utils'
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

    // Try to get reviews from Google Places API
    const client = getAnchorPlacesClient()
    let reviews: any[] = []
    let rating = 0
    let totalReviews = 0
    let source: 'places' | 'mock' = 'places'

    if (client) {
      const [apiReviews, ratingInfo] = await Promise.all([
        client.getReviews(),
        client.getRatingInfo()
      ])
      
      if (apiReviews.length > 0) {
        reviews = apiReviews
        rating = ratingInfo?.rating || 0
        totalReviews = ratingInfo?.totalReviews || 0
      }
    }

    // Use mock data if API is not configured or returns no reviews
    if (reviews.length === 0) {
      console.warn('reviews-api-fallback: using mock reviews', {
        hasClient: !!client,
        filter
      })
      reviews = mockReviews
      source = 'mock'
      rating = 4.6
      totalReviews = 312
    }

    // Apply filters
    const filteredReviews = filterReviews(reviews, filter)

    // Set cache headers (cache for 1 hour, revalidate in background)
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }

    return NextResponse.json({
      reviews: filteredReviews,
      rating,
      totalReviews,
      source,
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
