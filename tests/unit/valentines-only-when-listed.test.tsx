/**
 * Valentine's is promoted only when an event is in the diary (site review
 * C1-018 and DT-007).
 *
 * With nothing listed, /valentines-day used to invite bookings "for
 * 14 February 2027" for "an easy evening" of "good food", and the header grew
 * a Valentine's Day link on 20 December. 14 February 2027 is a Sunday, when
 * the kitchen shuts at 6pm, and nothing was confirmed.
 *
 * Instants are in UTC; December to February is GMT, so they mean the same
 * under `npm test` (Europe/London) and `npm run test:utc`.
 */

import { render, cleanup } from '@testing-library/react'
import ValentinesDayPage, { generateMetadata } from '@/app/valentines-day/page'
import { anchorAPI } from '@/lib/api'
import { getHeaderPromoCtas } from '@/lib/header-promos'
import { getActiveHeaderPromos } from '@/lib/header-promo-window'
import { getNextValentinesYear, isValentinesInDiary, isValentinesPromoSeason } from '@/lib/seasonal/valentines'

jest.mock('next/navigation', () => ({
  usePathname: () => '/valentines-day'
}))

jest.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn
}))

// React's cache() memoises per request on the server. In a test it would hand
// the first answer to every later render.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: unknown) => fn
}))

const getEvents = jest.spyOn(anchorAPI, 'getEvents')

const labelsAt = (instant: string, valentinesListed: boolean): string[] => {
  const at = new Date(instant)
  return getActiveHeaderPromos(getHeaderPromoCtas(at, { valentinesListed }), at).map((promo) => promo.label)
}

afterEach(() => {
  jest.useRealTimers()
  getEvents.mockReset()
  cleanup()
})

describe('/valentines-day with nothing in the diary', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-12-21T12:00:00Z'))
    getEvents.mockResolvedValue({ events: [] } as never)
  })

  it('is a holding page with no date, time or promise', async () => {
    const { container } = render(await ValentinesDayPage())
    const html = container.innerHTML
    expect(html).toContain("We haven't announced our Valentine's plans yet.")
    expect(html).not.toMatch(/Evening|evening|Book for 14 February|14 February|event poster|good food/)
    // Text only: the hero image's srcset carries widths such as 2048.
    expect(container.textContent).not.toMatch(/\b20\d{2}\b/)
    expect(html).not.toContain('application/ld+json')
  })

  it('has a neutral search description', async () => {
    const meta = JSON.stringify(await generateMetadata())
    expect(meta).toContain("We haven't announced our plans yet.")
    expect(meta).not.toMatch(/Book for|14 February|\b20\d{2}\b|Good food/)
  })

  it('is the same holding page when the events feed is down', async () => {
    getEvents.mockRejectedValue(new Error('down'))
    const { container } = render(await ValentinesDayPage())
    expect(container.textContent).toContain("We haven't announced our Valentine's plans yet.")
  })
})

describe('the Valentine’s header link', () => {
  it('does not show in Christmas week, or at all, with nothing in the diary', () => {
    expect(labelsAt('2026-12-21T12:00:00Z', false)).not.toContain("Valentine's Day")
    expect(labelsAt('2027-01-20T12:00:00Z', false)).not.toContain("Valentine's Day")
    expect(labelsAt('2027-02-14T12:00:00Z', false)).not.toContain("Valentine's Day")
  })

  it('shows inside its window once an event is listed, and stops after the day', () => {
    expect(labelsAt('2026-12-19T23:59:00Z', true)).not.toContain("Valentine's Day")
    expect(labelsAt('2026-12-20T00:00:00Z', true)).toContain("Valentine's Day")
    expect(labelsAt('2027-02-14T23:59:00Z', true)).toContain("Valentine's Day")
    expect(labelsAt('2027-02-15T00:00:00Z', true)).not.toContain("Valentine's Day")
  })

  it('leaves the other links alone', () => {
    expect(labelsAt('2027-01-20T12:00:00Z', false)).toContain("Mother's Day")
  })
})

describe('the diary check behind the link', () => {
  it('works out the coming Valentine’s year in London', () => {
    expect(getNextValentinesYear(new Date('2026-10-08T12:00:00Z'))).toBe(2027)
    expect(getNextValentinesYear(new Date('2027-02-14T23:59:00Z'))).toBe(2027)
    expect(getNextValentinesYear(new Date('2027-02-15T00:00:00Z'))).toBe(2028)
  })

  it('makes no request outside the weeks the link could show', async () => {
    expect(isValentinesPromoSeason(new Date('2026-10-08T12:00:00Z'))).toBe(false)
    await expect(isValentinesInDiary(new Date('2026-10-08T12:00:00Z'))).resolves.toBe(false)
    expect(getEvents).not.toHaveBeenCalled()
  })

  it('answers from the diary inside those weeks', async () => {
    getEvents.mockResolvedValue({ events: [{ name: "Valentine's Night", startDate: '2027-02-13T19:00:00Z' }] } as never)
    await expect(isValentinesInDiary(new Date('2027-01-10T12:00:00Z'))).resolves.toBe(true)
    getEvents.mockResolvedValue({ events: [{ name: 'Quiz Night', startDate: '2027-02-03T19:00:00Z' }] } as never)
    await expect(isValentinesInDiary(new Date('2027-01-10T12:00:00Z'))).resolves.toBe(false)
  })

  it('answers no, and does not throw, when the feed is down', async () => {
    getEvents.mockRejectedValue(new Error('down'))
    await expect(isValentinesInDiary(new Date('2027-01-10T12:00:00Z'))).resolves.toBe(false)
  })
})
