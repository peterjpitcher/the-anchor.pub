/**
 * /live-sport/nations-championship turns year-neutral by itself after Finals
 * Weekend (site review P13, DT-003; owner decision 18, 7 October 2026).
 *
 * Before this the page had no after state: on 30 November it would still have
 * said "Pick your game and book your table" under a "Nations Championship 2026"
 * title, with the November fixtures and Finals Weekend dates in the copy.
 *
 * Instants are in UTC so they mean the same under `npm test` (Europe/London)
 * and `npm run test:utc`. 29 and 30 November are in GMT.
 */

import fs from 'fs'
import path from 'path'
import { render, cleanup } from '@testing-library/react'
import NationsChampionshipPage, { generateMetadata } from '@/app/live-sport/nations-championship/page'
import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'

jest.mock('@/lib/nations-championship/feed', () => ({
  getNationsChampionshipFeed: jest.fn()
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/live-sport/nations-championship'
}))

const LAST_MINUTE = '2026-11-29T23:59:00Z' // 23:59 on 29 November in London
const JUST_AFTER = '2026-11-30T00:00:00Z' // 00:00 on 30 November in London

const feedSpy = getNationsChampionshipFeed as jest.Mock

async function at(instant: string): Promise<{ text: string; html: string; meta: string }> {
  jest.useFakeTimers().setSystemTime(new Date(instant))
  const { container } = render(await NationsChampionshipPage())
  const result = {
    text: container.textContent ?? '',
    html: container.innerHTML,
    meta: JSON.stringify(generateMetadata())
  }
  cleanup()
  return result
}

beforeEach(() => {
  // The tournament state shows its honest "unavailable" block without a feed.
  feedSpy.mockRejectedValue(new Error('no feed in tests'))
})

afterEach(() => {
  jest.useRealTimers()
  feedSpy.mockReset()
})

describe('/live-sport/nations-championship during the tournament', () => {
  it('is still the tournament page at 23:59 on 29 November', async () => {
    const { text, meta } = await at(LAST_MINUTE)
    expect(meta).toContain('Nations Championship 2026')
    expect(text).toContain('Pick your game and book your table')
    expect(feedSpy).toHaveBeenCalled()
  })
})

describe('/live-sport/nations-championship after the final', () => {
  it.each([JUST_AFTER, '2027-07-01T12:00:00Z'])('names no year and no fixture at %s', async (instant) => {
    const { text, meta } = await at(instant)
    expect(text).not.toMatch(/\b20\d{2}\b/)
    expect(meta).not.toMatch(/\b20\d{2}\b/)
    expect(text).not.toMatch(/Finals Weekend|27 to 29 November|England v|Twickenham|kick[- ]?off|fixture/i)
  })

  it('has no "book for this game" call to action', async () => {
    const { text, html } = await at(JUST_AFTER)
    expect(text).not.toMatch(/pick your game|choose a (?:game|match)|find your game|book your table/i)
    expect(html).not.toContain('#fixtures')
    expect(feedSpy).not.toHaveBeenCalled()
  })

  it('keeps the title pattern and the relative canonical', async () => {
    jest.useFakeTimers().setSystemTime(new Date(JUST_AFTER))
    const metadata = generateMetadata()
    expect(metadata.title).toEqual({ absolute: 'Nations Championship Rugby | The Anchor Stanwell Moor' })
    expect(metadata.alternates?.canonical).toBe('./')
  })

  it('says only what SSOT sections 10 and 16 confirm', async () => {
    const { text } = await at(JUST_AFTER)
    expect(text).toContain('We show Nations Championship games that are on BBC, ITV or Channel 4, during our usual opening hours.')
    expect(text).toContain("We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports.")
    expect(text).toContain("The commentary's on for big games and tournaments.")
    expect(text).not.toMatch(/every (?:match|game)|big screens?|\bHD\b|sound on/i)
    expect((text.match(/!/g) ?? []).length).toBeLessThanOrEqual(1)
    expect(text).not.toMatch(/\bguests?\b|\bcheeky\b/i)
  })

  it('carries the same sport and commentary wording as docs/SSOT.md', () => {
    const ssot = fs.readFileSync(path.join(process.cwd(), 'docs', 'SSOT.md'), 'utf8')
    expect(ssot).toContain("> We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports.")
    expect(ssot).toContain("> The commentary's on for big games and tournaments.")
    expect(ssot).toContain('We show Nations Championship games broadcast on terrestrial TV during our existing opening hours.')
  })
})
