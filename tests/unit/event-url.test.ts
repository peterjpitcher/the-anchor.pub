import { getEventWebsitePath, getEventWebsiteUrl } from '@/lib/event-url'

type EventUrlSource = { slug: string; id: string; url?: string }

function makeSource(overrides: Partial<EventUrlSource> = {}): EventUrlSource {
  return { slug: '', id: '', ...overrides }
}

describe('getEventWebsitePath', () => {
  // Existing behaviour — regression checks
  it('returns /events/{slug} when slug is present', () => {
    const result = getEventWebsitePath(makeSource({ slug: 'quiz-night-april-2026' }))
    expect(result).toBe('/events/quiz-night-april-2026')
  })

  it('returns /events/{id} when slug is empty but id is present', () => {
    const result = getEventWebsitePath(makeSource({ id: 'abc123' }))
    expect(result).toBe('/events/abc123')
  })

  it('returns /events/{slug} when slug is present even if url points to category page', () => {
    const result = getEventWebsitePath(makeSource({
      slug: 'quiz-night-april-2026',
      url: 'https://www.the-anchor.pub/quiz-night'
    }))
    expect(result).toBe('/events/quiz-night-april-2026')
  })

  // event.url fallback — valid event paths accepted
  it('accepts event.url pointing to an event detail page', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://www.the-anchor.pub/events/quiz-night-april-2026'
    }))
    expect(result).toBe('/events/quiz-night-april-2026')
  })

  // event.url fallback, non-event paths rejected.
  // The fallback is /whats-on, not /events: there is no /events index route, so
  // the old fallback pointed every unusable event at a 404.
  it('rejects event.url pointing to a category page', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://www.the-anchor.pub/quiz-night'
    }))
    expect(result).toBe('/whats-on')
  })

  it('rejects event.url pointing to /whats-on', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://www.the-anchor.pub/whats-on'
    }))
    expect(result).toBe('/whats-on')
  })

  it('rejects event.url from an external origin', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://tickets.example.com/event/123'
    }))
    expect(result).toBe('/whats-on')
  })

  it('rejects bare string event.url resolved to root-level path', () => {
    const result = getEventWebsitePath(makeSource({ url: 'summer-quiz' }))
    expect(result).toBe('/whats-on')
  })

  it('rejects category page URL with trailing slash', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://www.the-anchor.pub/quiz-night/'
    }))
    expect(result).toBe('/whats-on')
  })

  it('falls through to /whats-on when slug, id, and url are all empty', () => {
    const result = getEventWebsitePath(makeSource())
    expect(result).toBe('/whats-on')
  })

  it('treats whitespace-only slug and id as empty', () => {
    const result = getEventWebsitePath(makeSource({
      slug: '   ',
      id: '   ',
      url: 'https://www.the-anchor.pub/events/fallback-event'
    }))
    expect(result).toBe('/events/fallback-event')
  })
})

describe('getEventWebsiteUrl', () => {
  it('returns absolute URL when absolute option is true', () => {
    const result = getEventWebsiteUrl(
      makeSource({ slug: 'test-event' }),
      { absolute: true }
    )
    expect(result).toBe('https://www.the-anchor.pub/events/test-event')
  })

  it('returns relative path by default', () => {
    const result = getEventWebsiteUrl(makeSource({ slug: 'test-event' }))
    expect(result).toBe('/events/test-event')
  })
})
