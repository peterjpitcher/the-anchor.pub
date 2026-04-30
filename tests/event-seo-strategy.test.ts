/**
 * Event lifecycle SEO strategy tests.
 *
 * Locks in the behaviour documented in
 * tasks/gsc-indexing-fix/url-lifecycle-policy.md §1 (events). Without these
 * tests, the lifecycle thresholds (`PAST_EVENT_REDIRECT_DAYS`,
 * `CANCELLED_INDEX_DAYS`) and the redirect-vs-render-vs-noindex decisions can
 * silently drift, breaking GSC indexability for legitimate events or letting
 * stale events compete in search.
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

const NEXT_EVENT = { id: 'next-event-id', slug: 'next-event-slug' }

describe('getEventSeoStrategy', () => {
  describe('active events (future, not cancelled)', () => {
    it('marks an upcoming scheduled event as indexable with no banner', () => {
      const result = getEventSeoStrategy(
        { startDate: isoDaysFromNow(3), event_status: 'scheduled' },
        null,
      )
      expect(result).toEqual({
        index: true,
        showEndedBanner: false,
        stage: 'active',
      })
      expect(result.redirect).toBeUndefined()
    })

    it('marks an upcoming sold_out event as active and indexable', () => {
      const result = getEventSeoStrategy(
        { startDate: isoDaysFromNow(7), event_status: 'sold_out' },
        null,
      )
      expect(result.stage).toBe('active')
      expect(result.index).toBe(true)
      expect(result.redirect).toBeUndefined()
    })
  })

  describe('recent past events (≤ 30 days, not cancelled)', () => {
    it('keeps an event that ended yesterday indexable with the ended banner', () => {
      const result = getEventSeoStrategy(
        { startDate: isoDaysAgo(1), event_status: 'scheduled' },
        null,
      )
      expect(result).toEqual({
        index: true,
        showEndedBanner: true,
        stage: 'recent',
      })
      expect(result.redirect).toBeUndefined()
    })

    it('keeps an event at exactly the 30-day boundary indexable (recent)', () => {
      const result = getEventSeoStrategy(
        {
          startDate: isoDaysAgo(PAST_EVENT_REDIRECT_DAYS),
          event_status: 'scheduled',
        },
        NEXT_EVENT,
      )
      expect(result.stage).toBe('recent')
      expect(result.index).toBe(true)
      expect(result.redirect).toBeUndefined()
    })
  })

  describe('stale past events (> 30 days)', () => {
    it('redirects to the next event in category when one is supplied', () => {
      const result = getEventSeoStrategy(
        {
          startDate: isoDaysAgo(PAST_EVENT_REDIRECT_DAYS + 1),
          event_status: 'scheduled',
        },
        NEXT_EVENT,
      )
      expect(result).toEqual({
        index: false,
        redirect: `/events/${NEXT_EVENT.slug}`,
        showEndedBanner: true,
        stage: 'stale',
      })
    })

    it('falls back to event id when next event has no slug', () => {
      const result = getEventSeoStrategy(
        {
          startDate: isoDaysAgo(45),
          event_status: 'scheduled',
        },
        { id: 'fallback-id', slug: undefined as unknown as string },
      )
      expect(result.redirect).toBe('/events/fallback-id')
    })

    it('renders with noindex when no next event exists', () => {
      const result = getEventSeoStrategy(
        {
          startDate: isoDaysAgo(60),
          event_status: 'scheduled',
        },
        null,
      )
      expect(result).toEqual({
        index: false,
        showEndedBanner: true,
        stage: 'stale',
      })
      expect(result.redirect).toBeUndefined()
    })
  })

  describe('cancelled events', () => {
    it('keeps a recently cancelled event indexable for the 7-day window', () => {
      const result = getEventSeoStrategy(
        { startDate: isoDaysAgo(CANCELLED_INDEX_DAYS), event_status: 'cancelled' },
        NEXT_EVENT,
      )
      expect(result).toEqual({
        index: true,
        showEndedBanner: true,
        stage: 'stale',
      })
      // Cancelled events never redirect — they render with the cancelled banner.
      expect(result.redirect).toBeUndefined()
    })

    it('marks an old cancelled event as noindex but does not redirect', () => {
      const result = getEventSeoStrategy(
        { startDate: isoDaysAgo(CANCELLED_INDEX_DAYS + 1), event_status: 'cancelled' },
        NEXT_EVENT,
      )
      expect(result.index).toBe(false)
      expect(result.showEndedBanner).toBe(true)
      expect(result.stage).toBe('stale')
      expect(result.redirect).toBeUndefined()
    })

    it('treats a future cancelled event as still cancelled (no redirect)', () => {
      // A cancelled event with a future date (cancelled in advance) should
      // still be indexable for the 7-day window from event date, never
      // redirected.
      const result = getEventSeoStrategy(
        { startDate: isoDaysFromNow(2), event_status: 'cancelled' },
        NEXT_EVENT,
      )
      expect(result.index).toBe(true)
      expect(result.redirect).toBeUndefined()
    })
  })
})
