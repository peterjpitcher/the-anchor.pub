/**
 * Sitemap event-fetch resilience tests.
 *
 * The sitemap fetches page 0 first, then fetches remaining management API pages
 * in parallel only if page 0 is full. Each page fetch has its own timeout, and
 * any failure (timeout, network, 5xx) must return whatever has been collected
 * so far rather than crashing the entire sitemap. Without this, a slow API call
 * could surface as a "Temporary processing error" in GSC for `sitemap.xml`.
 *
 * See tasks/gsc-indexing-fix/FINAL-SPEC.md §P1 sitemap event fetching.
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

  it('returns an empty array (not a 500) when the first page fails', async () => {
    // The previous behaviour (try/catch around the whole loop) returned [].
    // The hardened version must preserve that fallback so the sitemap still
    // renders with static + blog + tag entries even if the management API is
    // unavailable.
    mockGetEvents.mockRejectedValueOnce(new Error('management-api-down'))

    const events = await getSitemapEvents()
    expect(events).toEqual([])
  })

  it('returns the partial set already collected when a later page fails', async () => {
    // Page 0 succeeds with a full batch (length === EVENT_PAGE_SIZE), so the
    // function requests remaining pages. Page 1 throws — the function must
    // return page 0 rather than discarding the already collected events.
    const fullBatch = Array.from({ length: 100 }, (_, i) => ({
      id: `page0-${i}`,
      slug: `page0-${i}`,
      startDate: '2026-06-01T18:00:00Z',
      event_status: 'scheduled',
    }))
    mockGetEvents.mockResolvedValueOnce({ events: fullBatch })
    mockGetEvents.mockRejectedValueOnce(new Error('page-1-timeout'))

    const events = await getSitemapEvents()
    expect(events.length).toBe(100)
    expect(events[0].id).toBe('page0-0')
  })

  it('stops cleanly when a page returns an empty array', async () => {
    mockGetEvents.mockResolvedValueOnce({ events: [] })

    const events = await getSitemapEvents()
    expect(events).toEqual([])
    // Should NOT call again — empty page is the natural break condition.
    expect(mockGetEvents).toHaveBeenCalledTimes(1)
  })
})
