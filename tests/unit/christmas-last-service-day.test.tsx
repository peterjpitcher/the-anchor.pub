/**
 * The last trading day of the Christmas season.
 *
 * Until 6 September 2026 one flag carried two different facts. The 24 hour
 * notice rule closes NEW bookings on 19 December, but the kitchen still serves
 * on the 20th, which the SSOT states explicitly ("The 20th is inclusive. A
 * 20 December sitting is bookable."). Because `seasonEnded` was derived as
 * `state === 'ended' || !isBookable`, the whole page collapsed into a
 * "Christmas bookings are closed for this season" stub on 20 December, dropping
 * the menu, the prices, the Menu JSON-LD and the commercial title with it, and
 * then stayed a stub for roughly seven months until a human edited SSOT.json.
 *
 * These tests pin the two facts apart.
 */
import { render } from '@testing-library/react'
import ssot from '@/SSOT.json'
import {
  ChristmasPartiesPageClient,
  type ChristmasFactsView,
  type ChristmasMenuView,
  type ChristmasSeasonView
} from '@/app/christmas-parties/client-components'
import { christmasPartiesSchema } from '@/lib/christmas-parties-schema'
import {
  CHRISTMAS_DEPOSIT_PER_PERSON,
  CHRISTMAS_LAST_BOOKABLE_DATE,
  CHRISTMAS_MINIMUM_NOTICE_HOURS,
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  CHRISTMAS_WINDOW_END,
  CHRISTMAS_WINDOW_START,
  getChristmasSeasonStatus
} from '@/lib/christmas-season'

const BUFFET_MINIMUM_GUESTS =
  (ssot as unknown as { christmas_2026: { buffets: { min_guests: number } } }).christmas_2026.buffets.min_guests

const FACTS: ChristmasFactsView = {
  minPartySize: CHRISTMAS_MINIMUM_PARTY_SIZE,
  christmasDay: { opens: '12pm', closes: '3pm', foodService: false },
  minNoticeHours: CHRISTMAS_MINIMUM_NOTICE_HOURS,
  depositPerPerson: CHRISTMAS_DEPOSIT_PER_PERSON,
  buffetMinimumGuests: BUFFET_MINIMUM_GUESTS,
  maxSeated: 60,
  maxStanding: 100,
  privateHireThreshold: 20,
  preOrderDeadlineDays: 7
}

const EMPTY_MENU: ChristmasMenuView = {
  tiers: [],
  extraSections: [],
  hasLiveDishes: false,
  isUnavailable: false
}

/** Mirrors `buildSeasonView()` in app/christmas-parties/page.tsx. */
function seasonViewFor(isoDate: string): ChristmasSeasonView {
  const status = getChristmasSeasonStatus(isoDate)
  return {
    state: status.state,
    windowLabel: '10 November to 20 December 2026',
    minEnquiryDate: CHRISTMAS_WINDOW_START,
    maxEnquiryDate: CHRISTMAS_WINDOW_END,
    isBookable: status.isBookable,
    bookingClosed: status.state !== 'ended' && !status.isBookable
  }
}

function renderOn(isoDate: string): string {
  const { container } = render(
    <ChristmasPartiesPageClient
      structuredData={christmasPartiesSchema}
      menu={EMPTY_MENU}
      season={seasonViewFor(isoDate)}
      facts={FACTS}
    />
  )
  return container.textContent || ''
}

const SEASON_OVER_COPY = 'has now finished'

describe('the season window boundary', () => {
  it('closes new bookings a day before the last sitting, which is the whole reason the two flags differ', () => {
    expect(CHRISTMAS_WINDOW_END).toBe('2026-12-20')
    expect(CHRISTMAS_LAST_BOOKABLE_DATE).toBe('2026-12-19')
  })

  it('still counts 20 December as inside the service window', () => {
    const status = getChristmasSeasonStatus('2026-12-20')
    expect(status.state).toBe('active')
    expect(status.isBookable).toBe(false)
  })

  it('only counts the season as ended once the window has actually passed', () => {
    expect(getChristmasSeasonStatus('2026-12-20').state).toBe('active')
    expect(getChristmasSeasonStatus('2026-12-21').state).toBe('ended')
  })

  it('marks 20 December as booking-closed but not season-ended', () => {
    const lastDay = seasonViewFor('2026-12-20')
    expect(lastDay.bookingClosed).toBe(true)
    expect(lastDay.state).not.toBe('ended')

    const afterwards = seasonViewFor('2026-12-21')
    expect(afterwards.state).toBe('ended')
  })
})

describe('what the page says on its last trading day', () => {
  it('does not tell customers the season has finished while the kitchen is still serving it', () => {
    expect(renderOn('2026-12-20')).not.toContain(SEASON_OVER_COPY)
  })

  it('keeps selling the offer on 20 December instead of collapsing to a stub', () => {
    const text = renderOn('2026-12-20')
    // The substantive page, not the two-paragraph closure notice.
    expect(text).toContain('Christmas at The Anchor, in short')
    expect(text).toContain('Christmas party and Christmas dinner FAQs')
  })

  it('routes the visitor to a phone call rather than a form that cannot be filled in', () => {
    const text = renderOn('2026-12-20')
    expect(text).toContain('Online enquiries have closed')
  })

  it('shows the ordinary in-season page while bookings are still open', () => {
    const text = renderOn('2026-12-19')
    expect(text).not.toContain('Online enquiries have closed')
    expect(text).not.toContain(SEASON_OVER_COPY)
  })

  it('does show the season-ended view once the window has passed', () => {
    expect(renderOn('2026-12-21')).toContain(SEASON_OVER_COPY)
  })
})
