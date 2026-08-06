/**
 * Event lifecycle SEO strategy tests.
 *
 * Locks in the behaviour documented in
 * tasks/gsc-indexing-fix/url-lifecycle-policy.md §1 (events). Without these
 * tests, the lifecycle thresholds (`PAST_EVENT_REDIRECT_DAYS`,
 * `CANCELLED_INDEX_DAYS`) and the redirect-vs-render-vs-noindex decisions can
 * silently drift, breaking GSC indexability for legitimate events or letting
 * stale events compete in search.
 *
 * Stale events redirect to their permanent category page, never to the next
 * dated event. See the rationale on `getEventSeoStrategy`.
 */

import {
  getEventSeoStrategy,
  PAST_EVENT_REDIRECT_DAYS,
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
const UNMAPPED_CATEGORY = { id: 'cat-9', slug: 'something-unmapped', name: 'Other', color: '#1a1a2e' }

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
      expect(result.redirect).toBeUndefined()
    })

    it('marks an upcoming sold_out event as active and indexable', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysFromNow(7),
        event_status: 'sold_out',
        eventStatus: 'sold_out',
      })
      expect(result.stage).toBe('active')
      expect(result.index).toBe(true)
      expect(result.redirect).toBeUndefined()
    })
  })

  describe('recent past events (≤ 30 days, not cancelled)', () => {
    it('keeps an event that ended yesterday indexable with the ended banner', () => {
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
      expect(result.redirect).toBeUndefined()
    })

    it('keeps an event at exactly the 30-day boundary indexable (recent)', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(PAST_EVENT_REDIRECT_DAYS),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        category: MUSIC_BINGO,
      })
      expect(result.stage).toBe('recent')
      expect(result.index).toBe(true)
      expect(result.redirect).toBeUndefined()
    })
  })

  describe('stale past events (> 30 days)', () => {
    it('redirects to the permanent category page, not to another dated event', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(PAST_EVENT_REDIRECT_DAYS + 1),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        category: MUSIC_BINGO,
      })
      expect(result).toEqual({
        index: false,
        redirect: '/music-bingo',
        showEndedBanner: true,
        stage: 'stale',
      })
    })

    it('never redirects to another /events/ URL, whose own target would keep moving', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(90),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        category: MUSIC_BINGO,
      })
      expect(result.redirect).not.toMatch(/^\/events\//)
    })

    it('sends an uncategorised stale event to /whats-on', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(60),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
      })
      expect(result).toEqual({
        index: false,
        redirect: '/whats-on',
        showEndedBanner: true,
        stage: 'stale',
      })
    })

    it('sends a category with no dedicated page to /whats-on', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(45),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        category: UNMAPPED_CATEGORY,
      })
      expect(result.redirect).toBe('/whats-on')
    })

    it('is deterministic: the same stale event always resolves to the same target', () => {
      const event = {
        startDate: isoDaysAgo(120),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        category: MUSIC_BINGO,
      }
      expect(getEventSeoStrategy(event).redirect).toBe(getEventSeoStrategy(event).redirect)
    })
  })

  describe('cancelled events', () => {
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
        stage: 'stale',
      })
      // Cancelled events never redirect, they render with the cancelled banner.
      expect(result.redirect).toBeUndefined()
    })

    it('marks an old cancelled event as noindex but does not redirect', () => {
      const result = getEventSeoStrategy({
        startDate: isoDaysAgo(CANCELLED_INDEX_DAYS + 1),
        event_status: 'cancelled',
        eventStatus: 'cancelled',
        category: MUSIC_BINGO,
      })
      expect(result.index).toBe(false)
      expect(result.showEndedBanner).toBe(true)
      expect(result.stage).toBe('stale')
      expect(result.redirect).toBeUndefined()
    })

    it('treats a future cancelled event as still cancelled (no redirect)', () => {
      // A cancelled event with a future date (cancelled in advance) should
      // still be indexable for the 7-day window from event date, never
      // redirected.
      const result = getEventSeoStrategy({
        startDate: isoDaysFromNow(2),
        event_status: 'cancelled',
        eventStatus: 'cancelled',
        category: MUSIC_BINGO,
      })
      expect(result.index).toBe(true)
      expect(result.redirect).toBeUndefined()
    })
  })
})
