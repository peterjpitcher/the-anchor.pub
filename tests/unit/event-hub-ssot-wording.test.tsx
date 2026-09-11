/**
 * Words on the event hubs that docs/SSOT.md does not support.
 *
 * Each of these was live on 11 September 2026:
 *
 *  - "Free entry nights" on /whats-on, beside a list of three paid nights.
 *    Only karaoke is free (§10).
 *  - "The next hosted events and weekly nights" in the navigation, on every
 *    page. Nothing at The Anchor runs weekly (§10).
 *  - Music Bingo labelled "Monthly", under "Three that come round every
 *    month". Music Bingo dates vary (§10).
 *  - "Themed nights fill up faster than the monthly quiz": a scarcity claim
 *    with no source (§1, Rule 5).
 *  - A venue capacity of 100, and stage, sound system and lighting features, in
 *    the /whats-on JSON-LD. None is in §8, which says a capacity not in its
 *    table is wrong.
 *  - "The kitchen runs to 9pm" and "The full menu runs until 9pm" on three hubs.
 *    Kitchen hours come from the live hours and vary by date (§3).
 *
 * The checks read what each page actually hands to the renderer (element props,
 * including JSON-LD strings), never the raw source, so a comment recording the
 * old wording cannot trip them.
 */
import { isValidElement } from 'react'
import { render, screen } from '@testing-library/react'
import { anchorAPI } from '@/lib/api/client'

jest.mock('@/lib/game-nights', () => ({
  ...jest.requireActual('@/lib/game-nights'),
  readGameNightEvents: async () => ({ status: 'ok', events: [] })
}))
jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackNavigationClick: jest.fn()
}))
jest.mock('@/hooks/useFocusTrap', () => ({ useFocusTrap: () => ({ current: null }) }))

import WhatsOnPage from '@/app/whats-on/page'
import ThemedQuizNightsPage from '@/app/quiz-night/themed/page'
import QuizNightPage from '@/app/quiz-night/page'
import MusicBingoPage from '@/app/music-bingo/page'
import CashBingoPage from '@/app/cash-bingo/page'
import { quizNight } from '@/lib/game-nights'
import { Navigation } from '@/components/layout/Navigation'

function serialise(node: unknown): string {
  return JSON.stringify(node, (_key, value) => (isValidElement(value) ? value.props : value)) ?? ''
}

/** A kitchen closing time written into copy, e.g. "kitchen runs to 9pm". */
const KITCHEN_TIME = /kitchen[^."]{0,60}?\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b/i
const MENU_UNTIL = /menu runs until/i

describe('/whats-on', () => {
  const getEventsSpy = jest.spyOn(anchorAPI, 'getEvents')
  const getBusinessHoursSpy = jest.spyOn(anchorAPI, 'getBusinessHours')

  beforeEach(() => {
    // An unmocked call would reach the live management API.
    getEventsSpy.mockResolvedValue({ events: [], pagination: { total: 0, limit: 100, offset: 0 } })
    getBusinessHoursSpy.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof anchorAPI.getBusinessHours>>)
  })

  afterAll(() => {
    getEventsSpy.mockRestore()
    getBusinessHoursSpy.mockRestore()
  })

  it('does not call the hosted nights free', async () => {
    expect(serialise(await WhatsOnPage())).not.toMatch(/free entry nights/i)
  })

  // docs/SSOT.md §10, mirrored from the management app on 11 September 2026:
  // Music Bingo is monthly on a Friday for the rest of 2026, and cash bingo
  // runs on set Wednesdays, not every month.
  it('labels each night with the cadence the SSOT gives it', async () => {
    const output = serialise(await WhatsOnPage())

    expect(output).not.toMatch(/three that come round every month/i)
    expect(output).toMatch(/"cadence":"Monthly","title":"Music Bingo with Nikki Manfadge"/)
    expect(output).toMatch(/"cadence":"Set Wednesdays","title":"Cash Prize Bingo"/)
    expect(output).not.toMatch(/cash bingo (?:is|are|runs?) (?:every month|monthly)/i)
  })

  it('publishes no venue capacity or stage, sound or lighting features', async () => {
    const output = serialise(await WhatsOnPage())

    expect(output).not.toMatch(/maximumAttendeeCapacity/)
    expect(output).not.toMatch(/Stage Area|Sound System|\\"Lighting\\"/)
  })
})

describe('the navigation', () => {
  // Passed explicitly, as app/layout.tsx does. Left to its default, the prop is
  // a new array on every render and the promo effect re-renders forever.
  const NO_PROMOS: NonNullable<Parameters<typeof Navigation>[0]['promoCtaButtons']> = []

  it('describes the upcoming events without a weekly cadence', () => {
    const { container } = render(<Navigation promoCtaButtons={NO_PROMOS} />)

    const [upcoming] = screen.getAllByRole('menuitem', { name: /Upcoming Events/, hidden: true })
    expect(upcoming).toHaveTextContent('Every upcoming hosted night, by date')
    expect(container.textContent).not.toMatch(/weekly/i)
  })
})

describe('/quiz-night/themed', () => {
  it('makes no scarcity claim about themed nights', () => {
    expect(serialise(ThemedQuizNightsPage())).not.toMatch(/fill up faster/i)
  })
})

describe('kitchen times on the hubs', () => {
  it.each([
    ['/quiz-night', QuizNightPage],
    ['/music-bingo', MusicBingoPage],
    ['/cash-bingo', CashBingoPage]
  ])('%s writes no kitchen closing time', async (_path, Page) => {
    const output = serialise(await Page())

    expect(output).not.toMatch(KITCHEN_TIME)
    expect(output).not.toMatch(MENU_UNTIL)
    expect(output).toMatch(/Kitchen times vary by date/)
  })

  it('the quiz night answers and captions carry none either', () => {
    const copy = serialise({ objections: quizNight.objections, photos: quizNight.photos })

    expect(copy).not.toMatch(KITCHEN_TIME)
  })
})
