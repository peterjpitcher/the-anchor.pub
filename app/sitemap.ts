import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'
import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/markdown'
import { landmarks } from '@/lib/local-seo-data'
import { anchorAPI, type Event } from '@/lib/api'
import { getEventWebsitePath } from '@/lib/event-url'
import { getEventSeoStrategy } from '@/lib/event-seo-strategy'
import { isRetiredEvent, isFallbackEvent } from '@/lib/api/events'
import { logError } from '@/lib/error-handling'
import { PRIVACY_POLICY_LAST_UPDATED } from '@/lib/legal-pages'
import { parseLondonDate } from '@/lib/time-london'
import { getBlogLastModified, getRouteLastModified } from '@/lib/sitemap-lastmod'

// This route renders dynamically whether we ask it to or not, so say so.
//
// `fetchSitemapEventsPage` passes an AbortController signal to bound the
// management API call. Next cannot cache a fetch that carries a signal, so the
// route opts out of the Data Cache, `revalidate` never takes effect, and Next
// emits `Cache-Control: public, max-age=0, must-revalidate` with no s-maxage.
// Vercel's ISR layer then tried to derive a revalidate window from that and
// threw on every render that missed the cache:
//
//   Invariant: invalid Cache-Control duration provided: 0 < 1
//
// so /sitemap.xml returned 500 on every cache miss and 200 only on a hit.
// Declaring the route dynamic keeps Vercel out of the ISR path entirely.
// Do not reinstate `export const revalidate` here unless the signal-based
// timeout in fetchSitemapEventsPage goes away first.
export const dynamic = 'force-dynamic'

const EVENT_PAGE_SIZE = 100
const EVENT_MAX_PAGES = 20
const EVENT_SITEMAP_STATUS_FILTER = 'scheduled,rescheduled,postponed,sold_out,cancelled'
const EVENT_SITEMAP_FROM_DATE = '2000-01-01'
// Per-page timeout for the management API. We fetch page 0 first, then fetch
// remaining pages in parallel only if page 0 is full. That bounds sitemap
// regeneration to roughly two timeout windows rather than EVENT_MAX_PAGES
// sequential waits.
const EVENT_PAGE_TIMEOUT_MS = 3_000

/**
 * A date, or nothing. This used to answer with today's date when the value was
 * missing or unreadable, which would have published "changed today" for a page
 * nobody had touched.
 */
function getSafeDate(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
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
  } catch (error) {
    // Log before returning null. The caller turns null into
    // EventFeedUnavailableError, which aborts regeneration and leaves Next
    // serving the last good sitemap. That is the right fail-safe, but it used
    // to be completely silent: on 5 September 2026 the live sitemap sat stale
    // for over 15 hours with nothing in the logs to say why, and only a
    // redeploy cleared it. Record the page and whether the abort was our own
    // timeout, so the next occurrence is diagnosable.
    const timedOut = error instanceof Error && error.name === 'AbortError'
    logError('sitemap-events-page', error, {
      page,
      timedOut,
      timeoutMs: EVENT_PAGE_TIMEOUT_MS,
    })
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

/**
 * Thrown when the event feed cannot be READ, as distinct from being genuinely empty.
 *
 * This reverses a deliberate earlier decision, so the reasoning matters.
 *
 * The previous behaviour returned `[]` on any fetch failure, documented in
 * tests/sitemap-events.test.ts and tasks/gsc-indexing-fix/FINAL-SPEC.md: publish
 * a sitemap carrying static and blog URLs rather than let a slow API surface as
 * a "Temporary processing error" in Search Console. That is a fair goal.
 *
 * What it gets wrong is that the failure is SILENT. A fresh, wrong sitemap is
 * generated, cached, and served for the full `revalidate` hour, and nothing
 * anywhere reports that the feed was down.
 *
 * Being accurate about the harm: dropping URLs from a sitemap does NOT deindex
 * them. They stay linked from /whats-on and the category hubs and keep their
 * place. The real cost is a lost freshness signal, a stale hour, and no alert.
 *
 * Throwing is the mechanism that preserves the last good sitemap: Next fails
 * regeneration and keeps serving the previously cached response. Only a cold
 * start with nothing cached produces a 500, which Google retries.
 *
 * So the trade is: a visible, self-correcting error instead of a quiet, cached
 * inaccuracy. An empty array is indistinguishable from "this pub genuinely has
 * no events", and that is a claim we should never make by accident.
 */
/**
 * The build deliberately skips external fetches (lib/api/client.ts), so a
 * fabricated fallback during the build is expected, not a failure.
 */
function isBuildPhase(): boolean {
  // No `typeof window` guard: NEXT_PHASE is only ever set by a server build, so
  // the check adds nothing, and it made this untestable under Jest's jsdom
  // environment where `window` exists.
  return (
    process.env.NEXT_PHASE === 'phase-production-build' &&
    process.env.ENABLE_BUILD_TIME_EXTERNAL_API !== 'true'
  )
}

class EventFeedUnavailableError extends Error {
  constructor(reason: string) {
    super(`Event feed unavailable, refusing to publish a sitemap without events (${reason})`)
    this.name = 'EventFeedUnavailableError'
  }
}

/**
 * Aborting regeneration is correct: a sitemap missing every event URL is worse
 * than yesterday's sitemap. But Next then serves the last good copy for as long
 * as the feed stays down, with no ceiling and no signal, so this must be loud.
 */
function eventFeedUnavailable(reason: string): EventFeedUnavailableError {
  const error = new EventFeedUnavailableError(reason)
  logError('sitemap-event-feed-unavailable', error, { reason })
  return error
}

export async function getSitemapEvents(): Promise<Event[]> {
  const uniqueEvents = new Map<string, Event>()
  const firstBatch = await fetchSitemapEventsPage(0)

  // null means the fetch failed. An empty array means it succeeded and there is
  // genuinely nothing, which is legitimate and must still publish.
  if (firstBatch === null) {
    throw eventFeedUnavailable('first page fetch failed')
  }

  // A resolved promise is NOT proof the feed worked. anchorAPI serves a
  // fabricated event on network failure (lib/api/client.ts getFallbackResponse),
  // so `catch` never fires and the sitemap would happily publish
  // /events/the-anchor-showcase, a URL for an event that has never existed.
  //
  // Except during the build, where that same fallback is DELIBERATE: the client
  // skips external fetches at build time on purpose, so the fabricated event is
  // expected rather than a fault. Throwing there fails the whole export, which
  // is exactly what the first version of this check did. Emit the static and
  // blog URLs, and let the first revalidation fill in the events.
  if (firstBatch.some(isFallbackEvent)) {
    if (isBuildPhase()) return []
    throw eventFeedUnavailable('feed returned the fabricated fallback event')
  }

  if (firstBatch.length === 0) {
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
    // A failed later page would silently truncate the sitemap, dropping real
    // URLs with no signal that anything went wrong. Treat it the same as a
    // failed first page: keep the last good sitemap rather than publish a
    // partial one.
    if (batch === null) {
      throw eventFeedUnavailable('a later page fetch failed')
    }
    if (batch.length === 0) break
    addSitemapEvents(uniqueEvents, batch)
    if (batch.length < EVENT_PAGE_SIZE) break
  }

  return Array.from(uniqueEvents.values())
}

// No date is typed in this file. Each page's lastmod comes from
// config/sitemap-lastmod.json, which scripts/generate-sitemap-lastmod.js works
// out from git (the last commit to the page's own files). The dates used to be
// typed here in a dozen named batches, and by October 2026 they were older
// than the real last change for 150 of the 157 pages that had one. Google only
// uses lastmod when it is consistently accurate, so a page with no trustworthy
// date gets no lastmod at all, never today's date and never a guess.
type DatedEntry = MetadataRoute.Sitemap[number]

function datedEntry(url: string, lastModified: Date | undefined): DatedEntry {
  return lastModified ? { url, lastModified } : { url }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.the-anchor.pub'

  // Every fixed page. Order is for the reader only.
  const staticRoutes: string[] = [
    // Core pages, original launch
    '',
    '/about',
    '/about/the-anchor-facts',
    '/history',
    '/blog',
    '/blog/tags',
    '/join-our-team',
    '/join-our-team/bar-staff',
    '/join-our-team/kitchen-team',
    '/food-menu',
    '/food-menu/vegetarian',
    '/food-menu/vegan',
    '/food-menu/gluten-free',
    '/mothers-day',
    '/valentines-day',
    '/new-years-eve',
    '/easter-sunday',
    '/fathers-day',
    '/halloween',
    // /st-patricks-day, /boxing-day, /bonfire-night and /bank-holiday-weekends
    // are now 301-redirected (see config/redirects/additional-redirects.json)
    // and their route dirs deleted, so they are intentionally omitted here.
    '/sunday-roast',
    '/pizza-menu',
    '/fish-and-chips-heathrow',
    '/drinks',
    '/drinks/baby-guinness',

    // Events & entertainment
    // /whats-on is listed below without a date: it changes with the diary.
    '/quiz-night',
    '/quiz-night/themed',
    '/cash-bingo',
    '/music-bingo',
    '/karaoke',
    '/live-sport',
    '/live-sport/six-nations',
    '/live-sport/world-cup',
    '/pool-darts-pub',
    '/summer-garden-parties',

    // Booking & private hire
    '/book-table',
    '/private-hire',
    '/corporate-events',
    '/christmas-parties',
    '/private-hire/wakes',
    '/private-hire/christenings',
    '/private-hire/baby-showers',
    '/private-hire/anniversary-parties',
    '/private-hire/engagement-parties',
    '/private-hire/gender-reveal',
    '/private-hire/milestone-birthdays',
    '/private-hire/retirement-parties',
    '/private-hire/brochures',
    // Made indexable 26 Aug 2026, owner decision 4.
    '/private-hire/venue-tour',

    // Heathrow & location pages
    '/near-heathrow',
    '/near-heathrow/terminal-2',
    '/near-heathrow/terminal-3',
    '/near-heathrow/terminal-4',
    '/near-heathrow/terminal-5',
    '/find-us',
    '/heathrow-layover-dining',
    '/pre-flight-meal',
    '/heathrow-family-dining',
    '/luggage-storage-heathrow',
    '/heathrow-parking',
    '/heathrow-parking/terminal-2',
    '/heathrow-parking/terminal-3',
    '/heathrow-parking/terminal-4',
    '/heathrow-parking/terminal-5',
    '/coach-parking-heathrow',
    '/restaurants-near-heathrow',

    // Hotel hub. The 11 individual /pub-near-* pages were retired on
    // 21 Aug 2026 (83% duplicates of each other, 29 clicks in 16 months,
    // ranking only for generic pub terms other pages own). See
    // tasks/site-growth-implementation-spec-2026-08-17.md C6.
    '/heathrow-hotels-pub',

    // Venue & facilities
    '/beer-garden',
    '/our-pub',
    '/plane-spotting-heathrow',
    '/dog-friendly-pub-heathrow',
    '/family-friendly-pub-heathrow',

    // Local area pages
    '/ashford-pub',
    '/colnbrook-pub',
    '/egham-pub',
    '/feltham-pub',
    '/horton-pub',
    '/longford-pub',
    '/staines-pub',
    '/stanwell-pub',
    '/sunbury-pub',
    '/windsor-pub',
    '/wraysbury-pub',
    '/pubs-in-stanwell',

    // Footer / legal
    '/sitemap-page',
    // /privacy-policy is added below with the date the notice itself prints.
    '/accessibility',
    '/safety-and-respect',
    '/sustainability',
    '/reviews',
  ]

  // Get all blog posts
  // getAllBlogPosts already leaves out any post whose address redirects, so
  // there is no second list of retired slugs to keep in step here.
  const blogPosts = await getAllBlogPosts()
  const indexableBlogPosts = blogPosts.filter((post) => !post.noindex)

  // Map static routes
  const staticSitemap = staticRoutes.map((route) =>
    datedEntry(`${baseUrl}${route}`, getRouteLastModified(route)),
  )

  // The same constant the notice prints as "Last updated", so the page and
  // its lastmod cannot disagree. Move the date in lib/legal-pages.ts, not here.
  const privacyEntry: DatedEntry = {
    url: `${baseUrl}/privacy-policy`,
    lastModified: parseLondonDate(PRIVACY_POLICY_LAST_UPDATED),
  }

  // Map blog post routes
  const blogSitemap = indexableBlogPosts.map((post) =>
    datedEntry(`${baseUrl}/blog/${post.slug}`, getBlogLastModified(post)),
  )

  // Blog tag archive pages are now uniformly noindex (see
  // app/blog/tag/[tag]/page.tsx) because they are low-value crawl noise that
  // surfaced in the crawled-not-indexed / 404 / redirect-error GSC buckets.
  // A noindex page must never appear in the sitemap, so none are emitted.

  // One template and one data file serve every landmark page, so they share a date.
  const landmarkSitemap = landmarks.map((landmark) =>
    datedEntry(
      `${baseUrl}/private-hire/near/${landmark.slug}`,
      getRouteLastModified(`/private-hire/near/${landmark.slug}`),
    ),
  )

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

  // /whats-on changes whenever the event diary does, so a fixed date was false
  // the day after it was written: it said 21 April 2026 for months of daily
  // changes. Nothing trustworthy records when the listing last changed (the
  // events list carries no update timestamp), so no lastmod is given, the same
  // rule the event URLs and the Nations Championship hub follow.
  const whatsOnEntry: MetadataRoute.Sitemap[number] = { url: `${baseUrl}/whats-on` }

  const nationsEntry: MetadataRoute.Sitemap[number] = { url: `${baseUrl}/live-sport/nations-championship` }
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    try {
      const feed = await getNationsChampionshipFeed()
      if (feed.meta.contentUpdatedAt) nationsEntry.lastModified = new Date(feed.meta.contentUpdatedAt)
    } catch { /* Keep the stable hub URL; do not invent its modification date. */ }
  }
  return [...staticSitemap, privacyEntry, whatsOnEntry, nationsEntry, ...blogSitemap, ...landmarkSitemap, ...eventSitemap]
}
