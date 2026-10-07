import { render, screen, fireEvent } from '@testing-library/react'
import { GameNightCtaActions } from '@/components/features/GameNight/GameNightCtaActions'
import { GameNightFacts } from '@/components/features/GameNight/GameNightFacts'
import { trackCtaClick, trackPhoneCallClick } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackCtaClick: jest.fn(),
  trackPhoneCallClick: jest.fn(),
}))

// The classes the Button and Badge `wrap` variants add. Below 640px they let a
// label wrap; from 640px up they do nothing.
const BUTTON_WRAPS = ['max-sm:whitespace-normal', 'max-sm:px-4']
const BADGE_WRAPS = ['max-sm:whitespace-normal', 'max-sm:leading-tight']

describe('game night buttons and chips on a phone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lets the dated booking button wrap, because its label comes from data', () => {
    // 'Reserve your places for Wed 18 Nov' was 33px past the edge of a 320px
    // screen in the closing band of /cash-bingo.
    render(
      <GameNightCtaActions
        gameSlug="cash-bingo"
        label="Reserve your places for Wed 18 Nov"
        hasBookableDate
        location="closing_band"
      />
    )

    expect(screen.getByRole('link', { name: 'Reserve your places for Wed 18 Nov' })).toHaveClass(...BUTTON_WRAPS)
    // The short call button beside it fits, and stays one line.
    expect(screen.getByRole('link', { name: /^Call 01753/ })).not.toHaveClass('max-sm:whitespace-normal')
  })

  it('lets the call button wrap when there is no date to book', () => {
    // 'Call about the next music bingo' was 16px past the edge at 320px.
    render(
      <GameNightCtaActions
        gameSlug="music-bingo"
        label="Call about the next music bingo"
        hasBookableDate={false}
        location="hero"
      />
    )

    expect(screen.getByRole('link', { name: 'Call about the next music bingo' })).toHaveClass(...BUTTON_WRAPS)
  })

  it('still tracks both clicks with the same payloads', () => {
    render(
      <GameNightCtaActions
        gameSlug="quiz-night"
        label="Book your team in for Wed 7 Oct"
        hasBookableDate
        location="hero"
      />
    )

    fireEvent.click(screen.getByRole('link', { name: 'Book your team in for Wed 7 Oct' }))
    expect(trackCtaClick).toHaveBeenCalledWith({
      id: 'quiz-night_book',
      label: 'Book your team in for Wed 7 Oct',
      location: 'hero',
      destination: '#book',
      context: 'quiz-night',
    })

    fireEvent.click(screen.getByRole('link', { name: /^Call 01753/ }))
    expect(trackPhoneCallClick).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'quiz-night_hero_call' })
    )
  })

  it('lets a fact chip wrap, because its words come from the game config', () => {
    // 'House rule Phones away, except the interactive round' was 4px wider
    // than a 320px screen on /quiz-night.
    render(
      <GameNightFacts
        facts={[{ label: 'House rule', value: 'Phones away, except the interactive round' }]}
      />
    )

    const chip = screen.getByText('House rule').parentElement
    expect(chip).toHaveClass(...BADGE_WRAPS)
    // One line from 640px up, as before.
    expect(chip).toHaveClass('whitespace-nowrap')
  })
})
