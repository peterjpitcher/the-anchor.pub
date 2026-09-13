// Review utility functions
import { GOOGLE_REVIEWS } from '@/lib/google-reviews'
import { GoogleReview, ReviewsFilter } from './types'

export const DEFAULT_REVIEW_STATS = {
  rating: null,
  totalReviews: null
} as const

export function filterReviews(reviews: GoogleReview[], filter?: ReviewsFilter): GoogleReview[] {
  if (!filter) return reviews

  let filtered = [...reviews]

  // Filter by rating
  if (filter.minRating !== undefined) {
    filtered = filtered.filter(r => r.rating >= filter.minRating!)
  }
  if (filter.maxRating !== undefined) {
    filtered = filtered.filter(r => r.rating <= filter.maxRating!)
  }

  // Filter by keywords
  if (filter.keywords && filter.keywords.length > 0) {
    const keywords = filter.keywords.map(k => k.toLowerCase())
    filtered = filtered.filter(review => {
      const text = review.text.toLowerCase()
      return keywords.some(keyword => text.includes(keyword))
    })
  }

  // Filter by date
  if (filter.dateFrom) {
    const fromTime = filter.dateFrom.getTime() / 1000
    filtered = filtered.filter(r => r.time >= fromTime)
  }
  if (filter.dateTo) {
    const toTime = filter.dateTo.getTime() / 1000
    filtered = filtered.filter(r => r.time <= toTime)
  }

  // Sort
  if (filter.sortBy) {
    switch (filter.sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.time - a.time)
        break
      case 'oldest':
        filtered.sort((a, b) => a.time - b.time)
        break
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating)
        break
    }
  }

  // Limit
  if (filter.limit) {
    filtered = filtered.slice(0, filter.limit)
  }

  return filtered
}

export function calculateAverageRating(reviews: GoogleReview[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function groupReviewsByRating(reviews: GoogleReview[]): Record<number, number> {
  const groups: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(review => {
    groups[review.rating] = (groups[review.rating] || 0) + 1
  })
  return groups
}

export function getReviewExcerpt(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text
  
  const trimmed = text.substring(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(' ')
  
  return lastSpace > 0 ? trimmed.substring(0, lastSpace) + '...' : trimmed + '...'
}

export function formatReviewDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  
  return `${Math.floor(diffInDays / 365)} years ago`
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * "July 2026" to epoch seconds for the first of that month.
 *
 * Date.UTC with explicit components, so the number is identical under
 * TZ=Europe/London and TZ=UTC. It only ever drives newest-first sorting and
 * the "n months ago" label, never a published date.
 */
function reviewTimestamp(date: string): number {
  const [month, year] = date.split(' ')
  const index = MONTHS.indexOf(month)
  if (index === -1 || !/^\d{4}$/.test(year ?? '')) {
    throw new Error(`Review date must be "Month YYYY", got "${date}"`)
  }
  return Math.floor(Date.UTC(Number(year), index, 1) / 1000)
}

/**
 * The reviews /api/reviews serves, derived from the owner's Google Business
 * Profile export in lib/google-reviews.ts.
 *
 * Until 13 September 2026 this was a hand-written array of four invented
 * reviewers, kept under a comment claiming it was placeholder data for
 * development. It was not: /api/reviews had no other source, so those four
 * shipped to /beer-garden, /pubs-in-stanwell, /restaurants-near-heathrow and
 * /heathrow-parking in production. Publishing a fake review is a civil offence
 * under the Digital Markets, Competition and Consumers Act 2024.
 *
 * Add reviews by adding them to the export, never here.
 */
export const approvedReviews: GoogleReview[] = GOOGLE_REVIEWS.map(review => ({
  author_name: review.author,
  language: 'en',
  rating: 5,
  relative_time_description: review.date,
  text: review.quote,
  time: reviewTimestamp(review.date)
}))
