/**
 * Sitemap event-fetch resilience tests.
 *
 * The sitemap fetches page 0 first, then fetches remaining management API pages
 * in parallel only if page 0 is full. Each page fetch has its own timeout, and
 * REVISED 26 August 2026 (W3). Failure now THROWS rather than returning a
 * partial or empty list. The original goal, avoiding a GSC "Temporary
 * processing error", was reasonable, but returning [] fails silently: a fresh,
 * wrong sitemap is cached and served for the whole revalidate hour with nothing
 * reporting that the feed was down, and an empty list is indistinguishable from
 * "this pub genuinely has no events".
 *
 * To be accurate about the harm: dropping URLs from a sitemap does NOT deindex
 * them; they stay linked from /whats-on and the hubs. The cost is a lost
 * freshness signal and no alert.
 *
 * Throwing is what preserves the last good sitemap. Next fails regeneration and
 * keeps serving the cached response; only a cold start with nothing cached
 * yields a 500, which Google retries.
 *
 * See tasks/gsc-indexing-fix/FINAL-SPEC.md §P1 for the original decision and
 * tasks/site-growth-plan-2026-08-26.md W3 for this one.
 */

const mockGetEvents = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getEvents: (...args: unknown[]) => mockGetEvents(...args),
  },
}))

// `@/lib/markdown` is transitively required by `@/app/sitemap`, and its
// dependency on `remark` (ESM-only) breaks Jest's CommonJS transformer.
// Replace it with an empty stub — these tests do not exercise blog content.
jest.mock('@/lib/markdown', () => ({
  getAllBlogPosts: () => [],
}))

import { getSitemapEvents } from '@/app/sitemap'

beforeEach(() => {
  mockGetEvents.mockReset()
})

describe('getSitemapEvents', () => {
  it('returns events when the API resolves cleanly', async () => {
    mockGetEvents.mockResolvedValueOnce({
      events: [
        { id: 'a', slug: 'event-a', startDate: '2026-06-01T18:00:00Z', event_status: 'scheduled' },
        { id: 'b', slug: 'event-b', startDate: '2026-06-02T18:00:00Z', event_status: 'scheduled' },
      ],
    })

    const events = await getSitemapEvents()
    expect(events.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('skips draft events', async () => {
    mockGetEvents.mockResolvedValueOnce({
      events: [
        { id: 'a', slug: 'a', startDate: '2026-06-01T18:00:00Z', event_status: 'scheduled' },
        { id: 'b', slug: 'b', startDate: '2026-06-02T18:00:00Z', event_status: 'draft' },
      ],
    })

    const events = await getSitemapEvents()
    expect(events.map((e) => e.id)).toEqual(['a'])
  })

  it('throws when the first page fails, rather than publishing a sitemap with no events', async () => {
    // Was: returned [] so static and blog URLs still published. That hid the
    // outage and cached the wrong answer for an hour. Throwing keeps the last
    // good sitemap in place instead.
    mockGetEvents.mockRejectedValueOnce(new Error('management-api-down'))

    await expect(getSitemapEvents()).rejects.toThrow(/Event feed unavailable/)
  })

  it('still returns an empty array when the feed genuinely HAS no events', async () => {
    // Succeeding with nothing is legitimate and must publish normally. This is
    // the case the old behaviour could not tell apart from a failure.
    mockGetEvents.mockResolvedValueOnce({ events: [] })

    await expect(getSitemapEvents()).resolves.toEqual([])
  })

  it('throws rather than silently truncating when a later page fails', async () => {
    // Page 0 succeeds with a full batch (length === EVENT_PAGE_SIZE), so the
    // function requests remaining pages. Page 1 throws. Returning page 0 alone
    // would publish a truncated sitemap that looks complete, with no signal
    // that anything was dropped.
    const fullBatch = Array.from({ length: 100 }, (_, i) => ({
      id: `page0-${i}`,
      slug: `page0-${i}`,
      startDate: '2026-06-01T18:00:00Z',
      event_status: 'scheduled',
    }))
    mockGetEvents.mockResolvedValueOnce({ events: fullBatch })
    mockGetEvents.mockRejectedValue(new Error('page-1-timeout'))

    await expect(getSitemapEvents()).rejects.toThrow(/Event feed unavailable/)
  })

  it('stops cleanly when a page returns an empty array', async () => {
    mockGetEvents.mockResolvedValueOnce({ events: [] })

    const events = await getSitemapEvents()
    expect(events).toEqual([])
    // Should NOT call again — empty page is the natural break condition.
    expect(mockGetEvents).toHaveBeenCalledTimes(1)
  })
})
