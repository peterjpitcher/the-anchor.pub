import { render, screen } from '@testing-library/react'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewsBadge } from '@/components/reviews/ReviewsBadge'
import type { GoogleReview } from '@/lib/google/types'

// The star glyphs were once stripped out of these two components, which left five empty
// spans that drew nothing on every Google review card on the live site.
const STAR = '★'

const review: GoogleReview = {
  author_name: 'Test Reviewer',
  language: 'en',
  rating: 4,
  relative_time_description: 'a month ago',
  text: 'Fixture text for the star rating test.',
  time: 1767225600,
}

function starGlyphs(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="img"] > span[aria-hidden="true"]'))
}

describe('review star ratings', () => {
  it.each(['vertical', 'horizontal'] as const)('ReviewCard (%s) draws five stars and names the rating', (variant) => {
    const { container } = render(<ReviewCard review={review} variant={variant} />)

    expect(screen.getByRole('img', { name: '4 out of 5 stars' })).toBeInTheDocument()
    const stars = starGlyphs(container)
    expect(stars).toHaveLength(5)
    stars.forEach((star) => expect(star.textContent).toBe(STAR))
    expect(stars.filter((star) => star.classList.contains('text-anchor-gold'))).toHaveLength(4)
  })

  it('ReviewsBadge draws five stars for the overall rating', () => {
    const { container } = render(<ReviewsBadge rating={4.6} totalReviews={null} />)

    expect(screen.getByRole('img', { name: '4.6 out of 5 stars' })).toBeInTheDocument()
    const stars = starGlyphs(container)
    expect(stars).toHaveLength(5)
    stars.forEach((star) => expect(star.textContent).toBe(STAR))
    expect(stars.filter((star) => star.classList.contains('text-anchor-gold'))).toHaveLength(5)
  })
})
