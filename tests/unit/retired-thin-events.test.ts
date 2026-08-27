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

/**
 * A breadcrumb describes where the CURRENT page sits, not where each listed
 * item sits. EventSchema is rendered in a loop on six pages (the homepage,
 * /whats-on and the four game pages), so emitting a BreadcrumbList by default
 * put 17 trails on /whats-on alone.
 */
describe('EventSchema breadcrumb is opt-in', () => {
  const fs = require('fs') as typeof import('fs')
  const path = require('path') as typeof import('path')

  const listingPages = [
    'app/page.tsx',
    'app/whats-on/page.tsx',
    'app/quiz-night/page.tsx',
    'app/cash-bingo/page.tsx',
    'app/music-bingo/page.tsx',
    'app/karaoke/page.tsx',
    'app/valentines-day/page.tsx',
  ]

  it('defaults to off, so a listing page cannot emit one trail per card', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'components/seo/EventSchema.tsx'),
      'utf8',
    )
    expect(src).toMatch(/includeBreadcrumb\s*=\s*false/)
  })

  it('is not enabled on any page that renders EventSchema in a loop', () => {
    const offenders = listingPages.filter((p) => {
      const src = fs.readFileSync(path.join(process.cwd(), p), 'utf8')
      return /<EventSchema[^>]*includeBreadcrumb/.test(src)
    })
    expect(offenders).toEqual([])
  })

  it('is enabled on the event detail page, which is the event’s own page', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'app/events/[id]/page.tsx'),
      'utf8',
    )
    expect(src).toMatch(/<EventSchema[^>]*includeBreadcrumb/)
  })
})
