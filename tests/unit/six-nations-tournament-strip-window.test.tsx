/**
 * The Nations Championship strip on /live-sport/six-nations ends by itself
 * after 29 November 2026, London date (owner decision, 7 October 2026).
 *
 * The instants below are written in UTC so the test means the same thing under
 * `npm test` (Europe/London) and `npm run test:utc`. 4 and 5 September are in
 * British Summer Time, so London midnight is 23:00 UTC the day before. 29 and
 * 30 November are in GMT, so London midnight is 00:00 UTC.
 */

import { render, screen, cleanup } from '@testing-library/react'
import { TournamentLinkInWindow } from '@/components/features/nations-championship/TournamentLinkInWindow'
import { isNationsChampionshipPromoOpen } from '@/lib/nations-championship/promo-window'
import { NATIONS_CHAMPIONSHIP_PATH, NATIONS_CHAMPIONSHIP_PROMO_WINDOW } from '@/lib/nations-championship/config'
import { getHeaderPromoCtas } from '@/lib/header-promos'
import SixNationsPage from '@/app/live-sport/six-nations/page'

jest.mock('next/navigation', () => ({
  usePathname: () => '/live-sport/six-nations'
}))

const BEFORE_START = '2026-09-04T22:59:00Z' // 23:59 on 4 September in London
const AT_START = '2026-09-04T23:00:00Z' // 00:00 on 5 September in London
const MID_WINDOW = '2026-11-28T12:00:00Z' // the day before the last day
const LAST_MINUTE = '2026-11-29T23:59:00Z' // 23:59 on 29 November in London
const JUST_AFTER = '2026-11-30T00:00:00Z' // 00:00 on 30 November in London
const NEXT_YEAR = '2027-10-01T12:00:00Z'

const strip = (): HTMLElement | null => screen.queryByRole('link', { name: 'Choose a game and book' })

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('the Nations Championship promo window', () => {
  it.each([
    [BEFORE_START, false],
    [AT_START, true],
    [MID_WINDOW, true],
    [LAST_MINUTE, true],
    [JUST_AFTER, false],
    [NEXT_YEAR, false]
  ])('at %s is open: %s', (instant, open) => {
    expect(isNationsChampionshipPromoOpen(new Date(instant))).toBe(open)
  })

  it('is the same window the header link uses, so the two end together', () => {
    const headerLink = getHeaderPromoCtas(new Date(MID_WINDOW)).find(
      (promo) => promo.href === NATIONS_CHAMPIONSHIP_PATH
    )
    expect(headerLink).toMatchObject(NATIONS_CHAMPIONSHIP_PROMO_WINDOW)
  })
})

describe('the strip on /live-sport/six-nations', () => {
  it.each([
    [BEFORE_START, false],
    [AT_START, true],
    [MID_WINDOW, true],
    [LAST_MINUTE, true],
    [JUST_AFTER, false]
  ])('on a page rendered at %s is shown: %s', (instant, shown) => {
    jest.useFakeTimers().setSystemTime(new Date(instant))
    render(<SixNationsPage />)
    expect(strip() !== null).toBe(shown)
  })

  it('comes off a page that was built inside the window and opened after it', () => {
    jest.useFakeTimers().setSystemTime(new Date(JUST_AFTER))
    render(<TournamentLinkInWindow initiallyOpen />)
    expect(strip()).toBeNull()
  })

  it('stays on a page that was built inside the window and opened on its last day', () => {
    jest.useFakeTimers().setSystemTime(new Date(LAST_MINUTE))
    render(<TournamentLinkInWindow initiallyOpen />)
    expect(strip()).not.toBeNull()
  })

  it('still renders the rest of the page once the strip has gone', () => {
    jest.useFakeTimers().setSystemTime(new Date(JUST_AFTER))
    render(<SixNationsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Got a game in mind?' })).toBeInTheDocument()
  })
})
