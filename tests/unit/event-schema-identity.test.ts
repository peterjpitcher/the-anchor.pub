import { buildEventSchema } from '@/lib/structured-data/event-schema'
import type { Event } from '@/lib/api'

/**
 * Two defects verified live on 6 September 2026, both in the Event JSON-LD.
 *
 * 1. `organizer.url` published `https://management.orangejelly.co.uk`, the
 *    internal booking back office, passed straight through from the API. The
 *    guard that already covered the booking URL, the reserve action and
 *    mainEntityOfPage did not cover the organiser.
 * 2. An event with no artwork emitted `["/images/page-headers/whats-on/..."]`
 *    as its image. A crawler has no page context, so a relative path there
 *    resolves against nothing.
 *
 * `doorTime` is deliberately absent, not null. Adding it needs a source for
 * the doors time, which is a separate piece of work.
 */

const SITE = 'https://www.the-anchor.pub'
const MANAGEMENT = 'https://management.orangejelly.co.uk'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Offers, the reserve action and remaining capacity are only emitted while the
// event is still bookable, so the fixture has to stay in the future.
const futureStart = new Date(Date.now() + 30 * ONE_DAY_MS)

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'test-identity-1',
    name: 'Test Event',
    startDate: futureStart.toISOString(),
    offers: { price: '5', priceCurrency: 'GBP' },
    category: { id: 'quiz', name: 'Quiz Night', slug: 'quiz-night-stanwell-moor', color: '#000' },
    ...overrides,
  } as Event
}

/**
 * Every URL-bearing value in the graph, wherever it is nested. Keyed lookups
 * would miss a URL that moves into a new property later, which is precisely the
 * regression this is here to catch.
 */
const URL_KEYS = new Set(['url', '@id', 'urlTemplate', 'thumbnailUrl', 'image', 'contentUrl'])

function collectUrls(node: unknown, key?: string): string[] {
  if (typeof node === 'string') return key && URL_KEYS.has(key) ? [node] : []
  if (Array.isArray(node)) return node.flatMap((entry) => collectUrls(entry, key))
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([childKey, value]) => collectUrls(value, childKey))
  }
  return []
}

describe('Event JSON-LD organiser identity', () => {
  it('never publishes the management app as the organiser', () => {
    const schema = buildEventSchema(
      makeEvent({
        organizer: { '@type': 'Organization', name: 'The Anchor', url: MANAGEMENT },
      })
    ) as any

    expect(schema.organizer.url).toBe(SITE)
    expect(schema.organizer.name).toBe('The Anchor')
  })

  it('keeps a genuine external organiser URL', () => {
    const schema = buildEventSchema(
      makeEvent({
        organizer: { '@type': 'Organization', name: 'Stanwell Moor Events', url: 'https://partner.example.com/about' },
      })
    ) as any

    expect(schema.organizer.url).toBe('https://partner.example.com/about')
    expect(schema.organizer.name).toBe('Stanwell Moor Events')
  })

  it('falls back to The Anchor when the API sends no organiser', () => {
    const schema = buildEventSchema(makeEvent()) as any

    expect(schema.organizer).toEqual({
      '@type': 'Organization',
      name: 'The Anchor',
      url: SITE,
    })
  })

  it('omits the URL rather than inventing one for a named organiser', () => {
    const schema = buildEventSchema(
      makeEvent({ organizer: { '@type': 'Organization', name: 'Stanwell Moor Events' } })
    ) as any

    expect(schema.organizer.name).toBe('Stanwell Moor Events')
    expect(schema.organizer).not.toHaveProperty('url')
  })

  it('leaves no management URL anywhere in the emitted graph', () => {
    const schema = buildEventSchema(
      makeEvent({
        organizer: { '@type': 'Organization', name: 'The Anchor', url: MANAGEMENT },
        bookingUrl: `${MANAGEMENT}/table-bookings/new`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${MANAGEMENT}/events/test-identity-1` },
        potentialAction: {
          '@type': 'ReserveAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${MANAGEMENT}/bookings/events/123`,
            inLanguage: 'en-GB',
          },
          result: { '@type': 'Reservation', name: 'Reservation' },
        },
      } as Partial<Event>)
    )

    expect(JSON.stringify(schema)).not.toContain('management.orangejelly.co.uk')
    expect(JSON.stringify(schema)).not.toContain('orangejelly')
  })
})

describe('Event JSON-LD performer', () => {
  // The schema used to assert an Organization called "The Anchor Entertainment"
  // whenever the record carried no performer. That entity appears in no record
  // and in no line of docs/SSOT.md. Populating an optional property with an
  // invented one is the same class of error as inventing a price.
  it('omits the performer entirely when the record has none', () => {
    const schema = buildEventSchema(makeEvent()) as any
    expect('performer' in schema).toBe(false)
    expect(JSON.stringify(schema)).not.toContain('The Anchor Entertainment')
  })

  it('omits the performer when the record carries one with no name', () => {
    const schema = buildEventSchema(
      makeEvent({ performer: { '@type': 'Person' } as Event['performer'] })
    ) as any
    expect('performer' in schema).toBe(false)
  })

  it('publishes a real performer unchanged', () => {
    const schema = buildEventSchema(
      makeEvent({ performer: { '@type': 'Person', name: 'Nikki Manfadge' } as Event['performer'] })
    ) as any
    expect(schema.performer).toEqual({ '@type': 'Person', name: 'Nikki Manfadge' })
  })

  // Deliberately no heuristic for a performer that is present but wrong. Live
  // quiz records name the owner rather than Question One Quiz Masters, but quiz
  // nights do take guest hosts and karaoke has no fixed host, so "looks like a
  // staff name" would overwrite legitimate values. That is corrected at source.
  it('does not second-guess a performer that is present', () => {
    const schema = buildEventSchema(
      makeEvent({ performer: { '@type': 'Person', name: 'Peter Pitcher' } as Event['performer'] })
    ) as any
    expect(schema.performer.name).toBe('Peter Pitcher')
  })
})

describe('Event JSON-LD URLs are absolute', () => {
  it('absolutises the image on an event with no artwork', () => {
    const schema = buildEventSchema(makeEvent()) as any

    expect(Array.isArray(schema.image)).toBe(true)
    expect(schema.image).toHaveLength(1)
    expect(schema.image[0]).toBe(`${SITE}/images/events/quiz-night/quiz-night-team-writing.jpg`)
  })

  it('publishes the event own artwork when it has some', () => {
    const artwork = 'https://cdn.example.com/events/test/square.jpg'
    const schema = buildEventSchema(
      makeEvent({ image: [artwork], squareImageUrl: artwork })
    ) as any

    expect(schema.image).toEqual([artwork])
  })

  it('absolutises a relative thumbnail, and drops one that cannot be parsed', () => {
    const relative = buildEventSchema(
      makeEvent({ thumbnailImageUrl: '/images/events/quiz-night/quiz-night-winners.jpg' })
    ) as any
    expect(relative.thumbnailUrl).toBe(
      `${SITE}/images/events/quiz-night/quiz-night-winners.jpg`
    )

    const unusable = buildEventSchema(makeEvent({ thumbnailImageUrl: '   ' })) as any
    expect(unusable).not.toHaveProperty('thumbnailUrl')
  })

  it('absolutises relative video URLs', () => {
    const schema = buildEventSchema(
      makeEvent({ video: ['/videos/quiz-night.mp4'] })
    ) as any

    expect(schema.video[0].url).toBe(`${SITE}/videos/quiz-night.mp4`)
  })

  it.each([
    ['no artwork, no category', makeEvent({ category: undefined } as Partial<Event>)],
    ['no artwork, known category', makeEvent()],
    ['relative artwork from the API', makeEvent({ image: ['/images/events/music-bingo/music-bingo-big-group.jpg'] })],
    [
      'a full graph',
      makeEvent({
        image: ['/images/events/cash-bingo/cash-bingo-big-win.jpg'],
        thumbnailImageUrl: '/images/events/cash-bingo/cash-bingo-big-win.jpg',
        video: ['/videos/cash-bingo.mp4'],
        organizer: { '@type': 'Organization', name: 'The Anchor', url: '/about' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': '/events/test-identity-1' },
        performer: { '@type': 'Organization', name: 'The Anchor Entertainment' },
      } as Partial<Event>),
    ],
  ])('emits only absolute URLs for %s', (_label, event) => {
    const urls = collectUrls(buildEventSchema(event))

    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect(url).toMatch(/^https?:\/\//)
    }
  })
})

describe('Event JSON-LD omits what it has no source for', () => {
  it('does not emit doorTime', () => {
    // The property is absent, not null. Publishing a doors time needs a doors
    // time, and the API does not reliably send one.
    const schema = buildEventSchema(makeEvent({ doorTime: null })) as any
    expect(schema).not.toHaveProperty('doorTime')
  })

  it('carries no self-asserted rating or review markup', () => {
    const serialised = JSON.stringify(buildEventSchema(makeEvent()))
    expect(serialised).not.toContain('aggregateRating')
    expect(serialised).not.toContain('"review"')
  })
})
