/**
 * `/live-sport/world-cup` is year-neutral and answers to the feed (7 October 2026).
 *
 * In October 2026 the page still advertised a tournament that ended on 19 July:
 * a dated title and hero, all 104 fixtures from the CheersAI feed with "Showing"
 * labels and "Book Table" buttons, and Event structured data that ended in July.
 * The owner approved the treatment /live-sport/six-nations got, with one hard
 * rule: the CheersAI integration is where tournaments are managed, so it stays.
 *
 * So the page lists only games that have not finished, shows no fixtures block
 * when there are none, and says only what docs/SSOT.md supports: terrestrial
 * channels (section 6), 4 TVs (section 8), the approved wording in section 16,
 * and the commentary on, which the owner confirmed on 7 October 2026 for big
 * games and tournaments.
 *
 * This reads the page source as well as the rendered page, because metadata and
 * JSON-LD are not in the rendered tree. Every instant is written in UTC, so the
 * tests mean the same thing under `npm test` (Europe/London) and
 * `npm run test:utc`.
 */

import fs from 'fs'
import path from 'path'
import { render, screen, cleanup } from '@testing-library/react'
import WorldCupPage, { metadata } from '@/app/live-sport/world-cup/page'
import { getUpcomingFixtures } from '@/components/features/world-cup/upcoming-fixtures'
import { getWorldCup2026Matches, type WorldCup2026Match } from '@/lib/world-cup-2026'

jest.mock('next/navigation', () => ({
  usePathname: () => '/live-sport/world-cup'
}))

jest.mock('@/lib/world-cup-2026', () => ({
  getWorldCup2026Matches: jest.fn()
}))

const mockFeed = getWorldCup2026Matches as jest.MockedFunction<typeof getWorldCup2026Matches>

const ROOT = process.cwd()
const EM_DASH = String.fromCharCode(8212)
const source = fs.readFileSync(path.join(ROOT, 'app', 'live-sport', 'world-cup', 'page.tsx'), 'utf8')
/** The page's code without its comments, which explain the history and so name the year. */
const code = source.replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

/** The day this was written: the feed's last game kicked off on 19 July. */
const TODAY = '2026-10-07T12:00:00Z'

function match(matchNumber: number, utcDateTime: string, teams: [string, string], showing = true): WorldCup2026Match {
  return {
    matchNumber,
    stage: 'First Stage',
    utcDateTime,
    placeholderA: teams[0],
    placeholderB: teams[1],
    showing,
    teamsConfirmed: true
  }
}

/** The shape the feed had on 7 October 2026: every game long finished. */
const FINISHED_TOURNAMENT = [
  match(1, '2026-06-11T19:00:00+00:00', ['Mexico', 'South Africa']),
  match(2, '2026-06-12T02:00:00+00:00', ['Korea Republic', 'Czechia'], false),
  match(104, '2026-07-19T19:00:00+00:00', ['W101', 'W102'])
]

async function pageText(): Promise<string> {
  const { container } = render(await WorldCupPage())
  return container.textContent ?? ''
}

function setClock(instant: string): void {
  // Only the clock is faked: the page awaits real promises.
  jest.useFakeTimers({ now: new Date(instant), doNotFake: ['setTimeout', 'setImmediate', 'nextTick', 'queueMicrotask'] })
}

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  mockFeed.mockResolvedValue(FINISHED_TOURNAMENT)
  setClock(TODAY)
})

afterEach(() => {
  cleanup()
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('which games count as coming up', () => {
  const KICK_OFF = '2026-07-19T19:00:00Z'
  const final = [match(104, KICK_OFF, ['W101', 'W102'])]

  it.each([
    ['2026-07-19T18:59:00Z', 1], // a minute before kick-off
    ['2026-07-19T19:00:00Z', 1], // kick-off
    ['2026-07-19T21:59:00Z', 1], // still on: extra time and penalties are covered
    ['2026-07-19T22:00:00Z', 0], // three hours after kick-off
    [TODAY, 0]
  ])('at %s the final is listed %i time(s)', (instant, count) => {
    expect(getUpcomingFixtures(final, new Date(instant))).toHaveLength(count)
  })

  it('reads a kick-off written with an offset as the same instant', () => {
    // 20:00 in London on 19 July is 19:00 UTC.
    const london = [match(104, '2026-07-19T20:00:00+01:00', ['W101', 'W102'])]
    expect(getUpcomingFixtures(london, new Date('2026-07-19T21:59:00Z'))).toHaveLength(1)
    expect(getUpcomingFixtures(london, new Date('2026-07-19T22:00:00Z'))).toHaveLength(0)
  })

  it('leaves out a game whose kick-off cannot be read, rather than guessing', () => {
    expect(getUpcomingFixtures([match(1, 'not a date', ['A', 'B'])], new Date(TODAY))).toEqual([])
  })

  it('keeps only the games still to come, in the order the feed gave them', () => {
    const feed = [
      match(1, '2026-10-06T19:00:00Z', ['A', 'B']),
      match(2, '2026-10-08T19:00:00Z', ['C', 'D']),
      match(3, '2026-10-09T19:00:00Z', ['E', 'F'])
    ]
    expect(getUpcomingFixtures(feed, new Date(TODAY)).map((game) => game.matchNumber)).toEqual([2, 3])
  })
})

describe('/live-sport/world-cup after the tournament', () => {
  it('names no year in its metadata', () => {
    expect(JSON.stringify(metadata)).not.toMatch(/\b20\d{2}\b/)
  })

  it('keeps the title pattern, without the brand twice, and the relative canonical', () => {
    expect(metadata.title).toEqual({ absolute: 'World Cup Football | The Anchor Stanwell Moor' })
    expect(metadata.alternates?.canonical).toBe('./')
  })

  it('still asks the CheersAI feed for fixtures', async () => {
    await pageText()
    expect(mockFeed).toHaveBeenCalledTimes(1)
    expect(fs.existsSync(path.join(ROOT, 'lib', 'world-cup-2026.ts'))).toBe(true)
    expect(fs.existsSync(path.join(ROOT, 'lib', 'cheersai.ts'))).toBe(true)
    expect(code).toContain('getWorldCup2026Matches')
    expect(code).toContain('WorldCup2026Fixtures')
  })

  it('lists none of the finished games, and offers no booking against one', async () => {
    const text = await pageText()
    expect(text).not.toMatch(/Mexico|South Africa|Korea Republic|W101/)
    expect(text).not.toMatch(/Not showing|Showing Only|All Fixtures|Book Table/)
    expect(screen.queryByRole('heading', { name: 'Games coming up' })).toBeNull()
    expect(document.querySelector('[id^="match-"]')).toBeNull()
    expect(document.querySelector('a[href*="/book-table?date="]')).toBeNull()
  })

  it('names no year, fixture list or match day', async () => {
    const text = await pageText()
    expect(text).not.toMatch(/\b20\d{2}\b/)
    expect(text).not.toMatch(/fixtures?|kick[- ]?off|knockouts?|group stage|final weekend/i)
  })

  it('carries no Event structured data', () => {
    expect(code).not.toMatch(/["']?@type["']?\s*:\s*["'](?:Sports)?Event["']/)
    expect(code).not.toMatch(/startDate|endDate|eventStatus/)
  })

  it('promises nothing the SSOT does not confirm', async () => {
    const text = `${await pageText()} ${JSON.stringify(metadata)}`
    expect(text).not.toMatch(/every (?:world cup )?(?:match|game)|all (?:the )?(?:matches|games)|big screens?|\bHD\b|sound on|projector|midnight|stay open/i)
    expect(text).not.toMatch(/england|group [a-l]\b|free entry|subscription/i)
    const counts = [...text.matchAll(/\b(\d+|two|three|five|six|multiple|several)\s+(?:TVs|screens)\b/gi)].map((m) => m[1])
    expect(counts.filter((count) => count !== '4')).toEqual([])
  })

  it('names the three terrestrial channels together, never one channel on its own', async () => {
    const text = `${await pageText()} ${JSON.stringify(metadata)}`
    const mentions = text.match(/[^.]*\b(?:BBC|ITV|Channel 4)\b[^.]*\./g) ?? []
    expect(mentions.length).toBeGreaterThan(0)
    for (const sentence of mentions) {
      expect(sentence).toMatch(/BBC, ITV (?:or|and) Channel 4/)
    }
  })

  it('uses the approved sport wording from SSOT section 16, and the World Cup line built on it', async () => {
    const text = await pageText()
    expect(text).toContain("We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports.")
    expect(text).toContain(
      "We show World Cup games that are on BBC, ITV or Channel 4, on 4 TVs. The commentary's on for big games and tournaments. Call us on 01753 682707 to check a particular game."
    )
  })

  it('pastes the section 16 wording exactly as docs/SSOT.md has it', async () => {
    const ssot = fs.readFileSync(path.join(ROOT, 'docs', 'SSOT.md'), 'utf8')
    const text = await pageText()
    const approved = [
      "We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports.",
      "We've 20 free spaces right outside. There's no time limit while you're with us, and nothing to register.",
      "Dogs are welcome throughout the pub, on a lead. We'll have water bowls and biscuits waiting.",
      "High chairs, buggy space and bottle warming on request are all here, and breastfeeding is welcome. We don't have baby changing facilities.",
      'Groups of 15 or more: a £10 per person deposit, fully deducted from your bill.',
      "Getting in from the car park is step free, and so are the bar and the dining area. The beer garden is step free straight from the car park. From inside, there's one step between the bar and the garden, and we'll put our ramp out for it if you ask. We don't have an accessible toilet. If you'd like to check what will work best for you, give us a call on 01753 682707 and we'll help."
    ]
    for (const wording of approved) {
      expect(ssot).toContain(`> ${wording}`)
      expect(text).toContain(wording)
    }
  })

  it('has at most one exclamation mark, no em dash, and never says "guests" or "cheeky"', async () => {
    const text = `${await pageText()} ${JSON.stringify(metadata)}`
    expect((text.match(/!/g) ?? []).length).toBeLessThanOrEqual(1)
    expect(text).not.toContain(EM_DASH)
    expect(text).not.toMatch(/\bguests?\b|\bcheeky\b/i)
  })

  it('keeps the way to the sweepstake results and to the rest of live sport', async () => {
    await pageText()
    expect(screen.getByRole('link', { name: 'World Cup sweepstake results' })).toHaveAttribute('href', '/live-sport/world-cup/sweepstake')
    expect(screen.getByRole('link', { name: 'See all live sport' })).toHaveAttribute('href', '/live-sport')
  })
})

describe('/live-sport/world-cup when the feed cannot be reached', () => {
  it('is the same standing page, with the phone number and no error box', async () => {
    mockFeed.mockRejectedValue(new Error('CHEERSAI_BASE_URL environment variable is not set'))
    const text = await pageText()
    expect(screen.getByRole('heading', { level: 1, name: 'World Cup football at The Anchor' })).toBeInTheDocument()
    expect(text).toContain('Call us on 01753 682707 to check a particular game.')
    expect(text).not.toMatch(/temporarily unavailable|trouble loading/i)
    expect(screen.queryByRole('heading', { name: 'Games coming up' })).toBeNull()
  })
})

describe('/live-sport/world-cup when CheersAI supplies games again', () => {
  const NEXT = [
    match(1, '2026-10-06T19:00:00Z', ['Yesterday United', 'Gone Rovers']),
    match(2, '2026-10-08T19:00:00Z', ['Tomorrow Town', 'Soon City']),
    match(3, '2026-10-09T02:00:00Z', ['Late Kick', 'Night Owls'], false)
  ]

  beforeEach(() => {
    mockFeed.mockResolvedValue(NEXT)
  })

  it('lists the games still to come, and leaves out the one already played', async () => {
    const text = await pageText()
    expect(screen.getByRole('heading', { name: 'Games coming up' })).toBeInTheDocument()
    expect(text).toContain('Tomorrow Town vs Soon City')
    expect(text).not.toContain('Yesterday United')
    expect(document.querySelector('#match-2')).not.toBeNull()
    expect(document.querySelector('#match-1')).toBeNull()
  })

  it('offers a table only for a game the feed marks as showing', async () => {
    await pageText()
    const bookings = [...document.querySelectorAll('#match-2 a, #match-2 button')].map((el) => el.textContent)
    expect(bookings).toContain('Book Table')
    expect(document.querySelector('#match-3')).not.toBeNull()
    expect(document.querySelectorAll('#match-3 a, #match-3 button')).toHaveLength(0)
  })

  it('still carries no Event structured data', async () => {
    await pageText()
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => el.textContent ?? '')
    expect(jsonLd.join(' ')).not.toMatch(/"@type":"(?:Sports)?Event"/)
  })
})
