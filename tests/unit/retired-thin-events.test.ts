import {
  RETIRED_THIN_EVENT_SLUGS,
  isRetiredThinEvent,
  getEventSeoStrategy,
} from '@/lib/event-seo-strategy'
import redirects from '@/config/redirects/additional-redirects.json'

const HUBS = ['/quiz-night', '/cash-bingo', '/karaoke', '/music-bingo', '/whats-on']

function pastEvent(slug: string) {
  return {
    slug,
    startDate: '2025-10-01T19:00:00',
    event_status: 'scheduled',
    eventStatus: 'scheduled',
    category: { slug: 'quiz-night-stanwell-moor', name: 'Quiz Night' },
  } as Parameters<typeof getEventSeoStrategy>[0]
}

describe('retired thin event pages', () => {
  it('every retired slug has a 301 in the redirect config', () => {
    const sources = new Set(
      (redirects as Array<{ source: string; destination: string; permanent?: boolean }>).map(
        (r) => r.source,
      ),
    )
    const missing = [...RETIRED_THIN_EVENT_SLUGS].filter(
      (slug) => !sources.has(`/events/${slug}`),
    )
    expect(missing).toEqual([])
  })

  it('every retired slug redirects permanently to a real hub page', () => {
    const bySource = new Map(
      (redirects as Array<{ source: string; destination: string; permanent?: boolean }>).map(
        (r) => [r.source, r],
      ),
    )
    for (const slug of RETIRED_THIN_EVENT_SLUGS) {
      const rule = bySource.get(`/events/${slug}`)
      expect(rule).toBeDefined()
      expect(rule?.permanent).toBe(true)
      expect(HUBS).toContain(rule?.destination)
    }
  })

  it('is kept out of the index, so the sitemap never lists a redirect', () => {
    for (const slug of RETIRED_THIN_EVENT_SLUGS) {
      expect(getEventSeoStrategy(pastEvent(slug)).index).toBe(false)
    }
  })

  it('leaves events that were not retired alone', () => {
    expect(isRetiredThinEvent({ slug: 'quiz-night-2026-10-07' })).toBe(false)
    expect(getEventSeoStrategy(pastEvent('quiz-night-2026-03-04')).index).toBe(true)
  })
})
