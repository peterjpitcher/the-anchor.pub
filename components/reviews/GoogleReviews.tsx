'use client'

import { useEffect, useState } from 'react'
import { GoogleReview } from '@/lib/google/types'
import { ReviewCard } from './ReviewCard'
import { ReviewsCarousel } from './ReviewsCarousel'
import { ReviewsBadge } from './ReviewsBadge'
import { logError } from '@/lib/error-handling'

interface GoogleReviewsProps {
  layout?: 'grid' | 'carousel' | 'badge' | 'list'
  filter?: {
    minRating?: number
    keywords?: string[]
    limit?: number
  }
  showTitle?: boolean
  title?: string
  className?: string
}

export function GoogleReviews({
  layout = 'carousel',
  filter,
  showTitle = true,
  title = "What Our Customers Say",
  className = ""
}: GoogleReviewsProps) {
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [rating, setRating] = useState<number>(0)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const fetchReviews = async () => {
    const params = new URLSearchParams()
    
    try {
      setLoading(true)
      
      if (filter?.minRating) params.append('minRating', filter.minRating.toString())
      if (filter?.keywords) params.append('keywords', filter.keywords.join(','))
      if (filter?.limit) params.append('limit', filter.limit.toString())
      params.append('sortBy', 'newest')

      const response = await fetch(`/api/reviews?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews')
      }

      setReviews(data.reviews)
      setRating(data.rating)
      setTotalReviews(data.totalReviews)
    } catch (err) {
      logError('google-reviews-fetch', err, { 
        filter,
        params: params.toString() 
      })
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`google-reviews-wrapper ${className}`}>
        {showTitle && (
          <h2 className="text-3xl font-bold text-anchor-cream-text text-center mb-8">{title}</h2>
        )}
        <div className="animate-pulse">
          <div className="bg-anchor-green-raised border border-anchor-gold-dark/15 h-48"></div>
        </div>
      </div>
    )
  }

  if (error || reviews.length === 0) {
    return null
  }

  return (
    <div className={`google-reviews-wrapper ${className}`}>
      {showTitle && (
        <h2 className="text-3xl font-bold text-anchor-cream-text text-center mb-8">{title}</h2>
      )}
      
      {layout === 'badge' && (
        <ReviewsBadge rating={rating} totalReviews={totalReviews} />
      )}
      
      {layout === 'carousel' && (
        <ReviewsCarousel reviews={reviews} />
      )}
      
      {layout === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} index={index} />
          ))}
        </div>
      )}
      
      {layout === 'list' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} variant="horizontal" index={index} />
          ))}
        </div>
      )}
      
      <div className="text-center mt-8">
        <a 
          href="https://g.page/theanchorpubsm?share"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-anchor-gold-dark hover:text-anchor-gold transition-colors"
        >
          <span>Read all {totalReviews} reviews on Google</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
