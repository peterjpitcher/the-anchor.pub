// Review utility functions
import { GoogleReview, ReviewsFilter } from './types'

export const DEFAULT_REVIEW_STATS = {
  rating: 4.6,
  totalReviews: 312
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

// Mock data for development/testing when API is not available
export const mockReviews: GoogleReview[] = [
  {
    author_name: "Sarah M.",
    language: "en",
    rating: 5,
    relative_time_description: "a week ago",
    text: "Best Sunday roast in the area by far. The beef is always perfectly cooked and the Yorkshires are massive! Book early though - it gets packed.",
    time: Math.floor(Date.now() / 1000) - 604800
  },
  {
    author_name: "Michael T.",
    language: "en",
    rating: 5,
    relative_time_description: "2 weeks ago",
    text: "Great local pub with a fantastic beer garden. Perfect for plane spotting while enjoying a pint. The staff are always friendly and the food is excellent value.",
    time: Math.floor(Date.now() / 1000) - 1209600
  },
  {
    author_name: "Emma R.",
    language: "en",
    rating: 4,
    relative_time_description: "a month ago",
    text: "Lovely atmosphere and the stone-baked pizzas are brilliant. Only reason for 4 stars is it can get quite busy on quiz nights, but that's a good sign really!",
    time: Math.floor(Date.now() / 1000) - 2592000
  },
  {
    author_name: "The Johnson Family",
    language: "en",
    rating: 5,
    relative_time_description: "2 months ago",
    text: "Family tradition now - Sunday lunch at The Anchor. Kids love it, great atmosphere, and the food is consistently excellent.",
    time: Math.floor(Date.now() / 1000) - 5184000
  }
]
