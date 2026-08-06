/**
 * Event lifecycle SEO strategy tests.
 *
 * Locks in the behaviour documented in
 * tasks/gsc-indexing-fix/url-lifecycle-policy.md §1 (events).
 *
 * The headline rule: a past event is NEVER retired. It stays live and stays
 * indexed so its content can accumulate ranking, because an event page is only
 * live for a couple of months before the night itself and that is not long
 * enough to earn anything. These tests exist to stop a future edit quietly
 * reintroducing a redirect or a noindex on past events.
 *
 * Cancelled events are the single exception: nothing happened on the night, so
 * there is no content worth ranking.
 */

import {
  getEventSeoStrategy,
  getDiscontinuedFormatReplacement,
  RECENT_EVENT_WINDOW_DAYS,
  CANCELLED_INDEX_DAYS,
} from '@/lib/event-seo-strategy'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const FIXED_NOW = Date.UTC(2026, 4, 1, 12, 0, 0) // 2026-05-01T12:00:00Z

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date(FIXED_NOW))
})

afterAll(() => {
  jest.useRealTimers()
})

function isoDaysAgo(days: number): string {
  return new Date(FIXED_NOW - days * ONE_DAY_MS).toISOString()
}

function isoDaysFromNow(days: number): string {
  return new Date(FIXED_NOW + days * ONE_DAY_MS).toISOString()
}

const MUSIC_BINGO = { id: 'cat-1', slug: 'music-bingo', name: 'Music Bingo', color: '#1a1a2e' }

describe('getEventSeoStrategy', () => {
  describe('active events (future, not cancelled)', () => {
    it('marks an upcoming scheduled event as indexable with no banner', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysFromNow(3),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
      })
      expect(result).toEqual({
        index: true,
        showEndedBanner: false,
        stage: 'active',
      })
    })

    it('marks an upcoming sold_out event as active and indexable', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysFromNow(7),
        event_status: 'sold_out',
        eventStatus: 'sold_out',
      })
      expect(result.stage).toBe('active')
      expect(result.index).toBe(true)
    })
  })

  describe('past events are kept and stay indexed', () => {
    it('keeps an event that ended yesterday indexed, with the ended banner', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(1),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
      })
      expect(result).toEqual({
        index: true,
        showEndedBanner: true,
        stage: 'recent',
      })
    })

    it.each([31, 60, 180, 365, 900])(
      'still indexes an event %i days after it happened',
      (days) => {
        const result = getEventSeoStrategy({
          startDate: isoDaysAgo(days),
          event_status: 'scheduled',
          eventStatus: 'scheduled',
          category: MUSIC_BINGO,
        })
        expect(result.index).toBe(true)
        expect(result.showEndedBanner).toBe(true)
      },
    )

    it('never returns a redirect for a past event, at any age', () => {
      for (const days of [1, 30, 31, 400]) {
        const result = getEventSeoStrategy({
          startDate: isoDaysAgo(days),
          event_status: 'scheduled',
          eventStatus: 'scheduled',
          category: MUSIC_BINGO,
        }) as unknown as Record<string, unknown>
        // A redirect would delete the content this policy exists to keep.
        expect(result.redirect).toBeUndefined()
      }
    })

    it('switches stage from recent to archived at the window boundary, without changing indexability', () => {
      const recent = getEventSeoStrategy({
        startDate: isoDaysAgo(RECENT_EVENT_WINDOW_DAYS),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
      })
      const archived = getEventSeoStrategy({
        startDate: isoDaysAgo(RECENT_EVENT_WINDOW_DAYS + 1),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
      })
      expect(recent.stage).toBe('recent')
      expect(archived.stage).toBe('archived')
      expect(recent.index).toBe(true)
      expect(archived.index).toBe(true)
    })
  })

  describe('discontinued formats (SSOT)', () => {
    // docs/SSOT.md: "Do not promote Nikki hosted/games nights as a recurring
    // format. Nikki currently hosts Music Bingo only."
    it('noindexes a past games night even though other past events are kept', () => {
      const gamesNight = getEventSeoStrategy({
        startDate: isoDaysAgo(200),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        name: "Nikki's Games Night, Blankety Blank Special",
        slug: 'nikki-s-games-night-blankety-blank-special-2025-09-24',
      })
      const musicBingo = getEventSeoStrategy({
        startDate: isoDaysAgo(200),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        name: 'Music Bingo',
        slug: 'music-bingo-2025-09-24',
      })
      expect(gamesNight.index).toBe(false)
      expect(musicBingo.index).toBe(true)
    })

    it('matches on the slug as well as the name', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(10),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        slug: 'nikki-s-games-night-school-sports-day-special-2025-07-25',
      })
      expect(result.index).toBe(false)
    })

    it('points a games night at Music Bingo, not a generic listing', () => {
      const replacement = getDiscontinuedFormatReplacement({
        name: "Nikki's Games Night, Blankety Blank Special",
      })
      expect(replacement?.href).toBe('/music-bingo')
      expect(replacement?.label).toBe('See Music Bingo dates')
      // SSOT: "Nikki currently hosts Music Bingo only."
      expect(replacement?.copy).toContain('Music Bingo')
    })

    it('returns no replacement for an event that still runs', () => {
      expect(getDiscontinuedFormatReplacement({ name: 'Music Bingo' })).toBeNull()
    })

    it('keeps the page renderable, it is noindex not a redirect', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(200),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        name: "Nikki's Games Night",
      }) as unknown as Record<string, unknown>
      expect(result.redirect).toBeUndefined()
      expect(result.showEndedBanner).toBe(true)
    })
  })

  describe('cancelled events, the one exception', () => {
    it('keeps a recently cancelled event indexable for the 7-day window', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(CANCELLED_INDEX_DAYS),
        event_status: 'cancelled',
        eventStatus: 'cancelled',
        category: MUSIC_BINGO,
      })
      expect(result).toEqual({
        index: true,
        showEndedBanner: true,
        stage: 'archived',
      })
    })

    it('noindexes an old cancelled event, because nothing happened to rank', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(CANCELLED_INDEX_DAYS + 1),
        event_status: 'cancelled',
        eventStatus: 'cancelled',
        category: MUSIC_BINGO,
      })
      expect(result.index).toBe(false)
      expect(result.showEndedBanner).toBe(true)
    })

    it('treats a future cancelled event as still cancelled', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysFromNow(2),
        event_status: 'cancelled',
        eventStatus: 'cancelled',
        category: MUSIC_BINGO,
      })
      expect(result.index).toBe(true)
    })
  })
})
