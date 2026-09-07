/**
 * The rating shown beside a game night booking form is a rating of The Anchor,
 * not of that night.
 *
 * Presenting a venue-wide score next to an event booking form with no qualifier
 * reads as "this night is rated 4.6", which nothing supports. The caption is
 * therefore load-bearing copy, not decoration, and these tests treat it that way.
 *
 * The second guarantee is that no `aggregateRating` or `review` markup travels
 * with it. Google restricts those to a site reviewing another business, not a
 * business publishing its own score, and this site is currently clean of both.
 */

import { render, screen } from '@testing-library/react'
import { GameNightSocialProof } from '@/components/features/GameNight'
import ssot from '@/SSOT.json'

describe('GameNightSocialProof', () => {
  it('shows the rating from the SSOT rather than a hardcoded figure', () => {
    render(<GameNightSocialProof gameName="quiz night" />)
    expect(screen.getByText(`Rated ${ssot.ratings.google.rating} on Google`)).toBeInTheDocument()
  })

  it('says the ratings are venue-wide and names what they are not a rating of', () => {
    render(<GameNightSocialProof gameName="quiz night" />)
    const caption = screen.getByText(/venue-wide ratings for The Anchor/i)
    expect(caption).toHaveTextContent(/not ratings of quiz night/i)
  })

  it('names Google as the source of the star score', () => {
    render(<GameNightSocialProof gameName="cash bingo" />)
    expect(screen.getByText(/overall Google rating/i)).toBeInTheDocument()
  })

  it('emits no rating or review structured data', () => {
    const { container } = render(<GameNightSocialProof gameName="music bingo" />)
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull()
    expect(container.innerHTML).not.toMatch(/aggregateRating/i)
  })
})
