import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/markdown'
import { landmarks } from '@/lib/local-seo-data'
import { anchorAPI, type Event } from '@/lib/api'
import { getEventWebsitePath } from '@/lib/event-url'
import { getEventSeoStrategy } from '@/lib/event-seo-strategy'
import { isRetiredEvent } from '@/lib/api/events'

export const revalidate = 60 * 60 // 1 hour

const EVENT_PAGE_SIZE = 100
const EVENT_MAX_PAGES = 20
const EVENT_SITEMAP_STATUS_FILTER = 'scheduled,rescheduled,postponed,sold_out,cancelled'
const EVENT_SITEMAP_FROM_DATE = '2000-01-01'
// Per-page timeout for the management API. We fetch page 0 first, then fetch
// remaining pages in parallel only if page 0 is full. That bounds sitemap
// regeneration to roughly two timeout windows rather than EVENT_MAX_PAGES
// sequential waits.
const EVENT_PAGE_TIMEOUT_MS = 3_000

function getSafeDate(value?: string): Date {
  if (!value) {
    return new Date()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function isDraftEvent(event: Event): boolean {
  const rawStatus =
    typeof event.event_status === 'string'
      ? event.event_status.trim().toLowerCase()
      : ''
  if (rawStatus) return rawStatus === 'draft'

  const schemaStatus =
    typeof event.eventStatus === 'string'
      ? event.eventStatus.trim().toLowerCase()
      : ''
  return schemaStatus.includes('draft')
}

async function fetchSitemapEventsPage(page: number): Promise<Event[] | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), EVENT_PAGE_TIMEOUT_MS)

  try {
    const response = await anchorAPI.getEvents(
      {
        from_date: EVENT_SITEMAP_FROM_DATE,
        status: EVENT_SITEMAP_STATUS_FILTER,
        limit: EVENT_PAGE_SIZE,
        offset: page * EVENT_PAGE_SIZE,
      },
      { signal: controller.signal },
    )
    return Array.isArray(response.events) ? response.events : []
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function addSitemapEvents(uniqueEvents: Map<string, Event>, batch: Event[]): void {
  for (const event of batch) {
    if (isDraftEvent(event)) continue
    if (isRetiredEvent(event)) continue
    const key = `${event.id || event.slug || ''}`.trim()
    if (!key) continue
    uniqueEvents.set(key, event)
  }
}

export async function getSitemapEvents(): Promise<Event[]> {
  const uniqueEvents = new Map<string, Event>()
  const firstBatch = await fetchSitemapEventsPage(0)

  if (!firstBatch || firstBatch.length === 0) {
    return []
  }

  addSitemapEvents(uniqueEvents, firstBatch)

  if (firstBatch.length < EVENT_PAGE_SIZE) {
    return Array.from(uniqueEvents.values())
  }

  const remainingBatches = await Promise.all(
    Array.from({ length: EVENT_MAX_PAGES - 1 }, (_, index) =>
      fetchSitemapEventsPage(index + 1),
    ),
  )

  for (const batch of remainingBatches) {
    if (!batch || batch.length === 0) break
    addSitemapEvents(uniqueEvents, batch)
    if (batch.length < EVENT_PAGE_SIZE) break
  }

  return Array.from(uniqueEvents.values())
}

// Group dates by when pages were added/updated for more meaningful lastModified
const DATES = {
  launch: new Date('2025-06-01'),       // Original site launch pages
  seoOverhaul: new Date('2026-03-22'),  // SEO overhaul batch
  apr2026: new Date('2026-04-21'),      // April 2026 additions
  may2026: new Date('2026-05-12'),      // Recruitment pages
  may2026Late: new Date('2026-05-21'), // History page
  jul2026: new Date('2026-07-10'),      // Christmas page and booking journey refresh
  jul2026Early: new Date('2026-07-07'), // Anniversary parties content remediation
  jul2026Late: new Date('2026-07-19'),  // Dining and roast cluster consolidation
  aug2026Christmas: new Date('2026-08-15'), // Christmas menu published, new photography, conversion pass
  aug2026Brochures: new Date('2026-08-17'), // 2026 event brochures published across private hire
} as const

type StaticRoute = { path: string; lastModified: Date }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.the-anchor.pub'

  // Define all static routes with meaningful lastModified dates
  const staticRoutes: StaticRoute[] = [
    // Core pages, original launch
    { path: '', lastModified: DATES.apr2026 },
    { path: '/about', lastModified: DATES.launch },
    { path: '/about/the-anchor-facts', lastModified: DATES.may2026Late },
    { path: '/history', lastModified: DATES.may2026Late },
    { path: '/blog', lastModified: DATES.apr2026 },
    { path: '/blog/tags', lastModified: DATES.seoOverhaul },
    { path: '/join-our-team', lastModified: DATES.may2026 },
    { path: '/join-our-team/bar-staff', lastModified: DATES.may2026 },
    { path: '/join-our-team/kitchen-team', lastModified: DATES.may2026 },
    { path: '/food-menu', lastModified: DATES.apr2026 },
    { path: '/food-menu/vegetarian', lastModified: DATES.seoOverhaul },
    { path: '/food-menu/vegan', lastModified: DATES.seoOverhaul },
    { path: '/food-menu/gluten-free', lastModified: DATES.seoOverhaul },
    { path: '/mothers-day', lastModified: DATES.seoOverhaul },
    { path: '/valentines-day', lastModified: DATES.seoOverhaul },
    { path: '/new-years-eve', lastModified: DATES.seoOverhaul },
    { path: '/easter-sunday', lastModified: DATES.jul2026Late },
    { path: '/fathers-day', lastModified: DATES.seoOverhaul },
    { path: '/halloween', lastModified: DATES.seoOverhaul },
    // /st-patricks-day, /boxing-day, /bonfire-night and /bank-holiday-weekends
    // are now 301-redirected (see config/redirects/additional-redirects.json)
    // and their route dirs deleted, so they are intentionally omitted here.
    { path: '/sunday-roast', lastModified: DATES.jul2026Late },
    { path: '/pizza-menu', lastModified: DATES.seoOverhaul },
    { path: '/fish-and-chips-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/drinks', lastModified: DATES.apr2026 },
    { path: '/drinks/managers-special', lastModified: DATES.seoOverhaul },
    { path: '/drinks/baby-guinness', lastModified: DATES.seoOverhaul },

    // Events & entertainment
    { path: '/whats-on', lastModified: DATES.apr2026 },
    { path: '/quiz-night', lastModified: DATES.apr2026 },
    { path: '/cash-bingo', lastModified: DATES.apr2026 },
    { path: '/music-bingo', lastModified: DATES.apr2026 },
    { path: '/karaoke', lastModified: DATES.apr2026 },
    { path: '/live-sport', lastModified: DATES.apr2026 },
    { path: '/live-sport/six-nations', lastModified: DATES.seoOverhaul },
    { path: '/live-sport/f1', lastModified: DATES.seoOverhaul },
    { path: '/live-sport/boxing', lastModified: DATES.seoOverhaul },
    { path: '/live-sport/world-cup', lastModified: DATES.seoOverhaul },
    { path: '/pool-darts-pub', lastModified: DATES.seoOverhaul },
    { path: '/summer-garden-parties', lastModified: DATES.seoOverhaul },

    // Booking & private hire
    { path: '/book-table', lastModified: DATES.apr2026 },
    { path: '/private-hire', lastModified: DATES.jul2026 },
    { path: '/corporate-events', lastModified: DATES.seoOverhaul },
    { path: '/christmas-parties', lastModified: DATES.aug2026Christmas },
    { path: '/private-hire/wakes', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/christenings', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/baby-showers', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/anniversary-parties', lastModified: DATES.jul2026Early },
    { path: '/private-hire/engagement-parties', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/gender-reveal', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/milestone-birthdays', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/retirement-parties', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/brochures', lastModified: DATES.aug2026Brochures },

    // Heathrow & location pages
    { path: '/near-heathrow', lastModified: DATES.launch },
    { path: '/near-heathrow/terminal-2', lastModified: DATES.launch },
    { path: '/near-heathrow/terminal-3', lastModified: DATES.launch },
    { path: '/near-heathrow/terminal-4', lastModified: DATES.launch },
    { path: '/near-heathrow/terminal-5', lastModified: DATES.launch },
    { path: '/find-us', lastModified: DATES.launch },
    { path: '/heathrow-layover-dining', lastModified: DATES.seoOverhaul },
    { path: '/pre-flight-meal', lastModified: DATES.seoOverhaul },
    { path: '/heathrow-family-dining', lastModified: DATES.apr2026 },
    { path: '/luggage-storage-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/heathrow-parking', lastModified: DATES.launch },
    { path: '/heathrow-parking/terminal-2', lastModified: DATES.launch },
    { path: '/heathrow-parking/terminal-3', lastModified: DATES.launch },
    { path: '/heathrow-parking/terminal-4', lastModified: DATES.launch },
    { path: '/heathrow-parking/terminal-5', lastModified: DATES.launch },
    { path: '/coach-parking-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/restaurants-near-heathrow', lastModified: DATES.seoOverhaul },

    // Hotel hub. The 11 individual /pub-near-* pages were retired on
    // 21 Aug 2026 (83% duplicates of each other, 29 clicks in 16 months,
    // ranking only for generic pub terms other pages own). See
    // tasks/site-growth-implementation-spec-2026-08-17.md C6.
    { path: '/heathrow-hotels-pub', lastModified: DATES.seoOverhaul },

    // Venue & facilities
    { path: '/m25-junction-14-pub', lastModified: DATES.seoOverhaul },
    { path: '/beer-garden', lastModified: DATES.launch },
    { path: '/our-pub', lastModified: DATES.apr2026 },
    { path: '/plane-spotting-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/dog-friendly-pub-heathrow', lastModified: DATES.apr2026 },
    { path: '/family-friendly-pub-heathrow', lastModified: DATES.seoOverhaul },

    // Local area pages
    { path: '/ashford-pub', lastModified: DATES.apr2026 },
    { path: '/bedfont-pub', lastModified: DATES.apr2026 },
    { path: '/colnbrook-pub', lastModified: DATES.apr2026 },
    { path: '/egham-pub', lastModified: DATES.apr2026 },
    { path: '/feltham-pub', lastModified: DATES.launch },
    { path: '/horton-pub', lastModified: DATES.apr2026 },
    { path: '/longford-pub', lastModified: DATES.apr2026 },
    { path: '/staines-pub', lastModified: DATES.apr2026 },
    { path: '/stanwell-pub', lastModified: DATES.apr2026 },
    { path: '/sunbury-pub', lastModified: DATES.apr2026 },
    { path: '/windsor-pub', lastModified: DATES.apr2026 },
    { path: '/wraysbury-pub', lastModified: DATES.apr2026 },
    { path: '/pubs-in-stanwell', lastModified: DATES.apr2026 },

    // Footer / legal
    { path: '/sitemap-page', lastModified: DATES.launch },
    { path: '/privacy-policy', lastModified: DATES.launch },
    { path: '/accessibility', lastModified: DATES.launch },
    { path: '/safety-and-respect', lastModified: DATES.launch },
    { path: '/sustainability', lastModified: DATES.launch },
    { path: '/reviews', lastModified: DATES.seoOverhaul },
  ]

  // Get all blog posts
  const blogPosts = await getAllBlogPosts()
  const excludedBlogSlugs = new Set([
    'euro-2024-viewing',
    'autumn-internationals-2024-full-fixtures-highlight',
    'plane-spotting-heathrow-guide',
    'best-places-to-eat-near-heathrow',
    'best-pub-food-near-heathrow',
    // Cannibalises /sunday-roast, 301 redirected via additional-redirects.json.
    'sunday-lunch-at-the-anchor-is-back-pre-order-now',
    'pub-jobs-heathrow',
  ])
  const indexableBlogPosts = blogPosts.filter((post) => !excludedBlogSlugs.has(post.slug) && !post.noindex)

  // Map static routes
  const staticSitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: route.lastModified,
  }))

  // Map blog post routes
  const blogSitemap = indexableBlogPosts.map((post) => {
    const lastModified = getSafeDate(post.date)
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified,
    }
  })

  // Blog tag archive pages are now uniformly noindex (see
  // app/blog/tag/[tag]/page.tsx) because they are low-value crawl noise that
  // surfaced in the crawled-not-indexed / 404 / redirect-error GSC buckets.
  // A noindex page must never appear in the sitemap, so none are emitted.

  const landmarkSitemap = landmarks.map((landmark) => ({
    url: `${baseUrl}/private-hire/near/${landmark.slug}`,
    lastModified: DATES.seoOverhaul,
  }))

  const nowMs = Date.now()
  const sitemapEvents = await getSitemapEvents()
  const eventSitemap = sitemapEvents
    .filter((event) => event.category?.id !== 'fallback' && event.id !== 'the-anchor-showcase')
    .filter((event) => {
      const eventDate = Date.parse(event.startDate)
      const daysSince = (nowMs - eventDate) / (1000 * 60 * 60 * 24)

      // One rule, one place. getEventSeoStrategy decides indexability for the
      // page head and the page body; the sitemap must not carry its own copy of
      // it, or the two drift and we list pages we are telling Google to ignore.
      //
      // Caveat: this runs on the events LIST payload, which is a lighter
      // projection than the detail record. It omits long_description, so a
      // banned claim living only there is invisible here and the URL can still
      // be listed. The page itself fetches the detail record and returns
      // noindex, which is authoritative, so the URL drops out on crawl rather
      // than never being listed. Fetching 55 detail records to build a sitemap
      // is not worth that tidiness.
      //
      // Past events stay listed: they remain live and indexed, so excluding
      // them would only slow how often Google recrawls the very pages this
      // policy exists to let accumulate.
      return getEventSeoStrategy(event).index
    })
    .map((event) => ({
      url: `${baseUrl}${getEventWebsitePath(event)}`,
      // lastmod describes when the PAGE changed, not when the event happens.
      // Falling back to startDate gave future events a future lastmod, which
      // is a misleading crawl signal rather than a strong one. Omit the field
      // when there is no trustworthy update timestamp.
      lastModified: event._meta?.lastUpdated ? getSafeDate(event._meta.lastUpdated) : undefined,
    }))

  return [...staticSitemap, ...blogSitemap, ...landmarkSitemap, ...eventSitemap]
}
