import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/markdown'
import { landmarks } from '@/lib/local-seo-data'
import { anchorAPI, type Event } from '@/lib/api'
import { getEventWebsitePath } from '@/lib/event-url'
import tagRedirects from '@/config/redirects/tag-redirects.json'
import { PAST_EVENT_REDIRECT_DAYS, CANCELLED_INDEX_DAYS } from '@/lib/event-seo-strategy'

export const revalidate = 60 * 60 // 1 hour

const EVENT_PAGE_SIZE = 100
const EVENT_MAX_PAGES = 20
const EVENT_SITEMAP_STATUS_FILTER = 'scheduled,rescheduled,postponed,sold_out,cancelled'
const EVENT_SITEMAP_FROM_DATE = '2000-01-01'

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

async function getSitemapEvents(): Promise<Event[]> {
  const uniqueEvents = new Map<string, Event>()

  try {
    for (let page = 0; page < EVENT_MAX_PAGES; page += 1) {
      const offset = page * EVENT_PAGE_SIZE
      const response = await anchorAPI.getEvents({
        from_date: EVENT_SITEMAP_FROM_DATE,
        status: EVENT_SITEMAP_STATUS_FILTER,
        limit: EVENT_PAGE_SIZE,
        offset
      })

      const batch = Array.isArray(response.events) ? response.events : []
      if (batch.length === 0) break

      for (const event of batch) {
        if (isDraftEvent(event)) continue
        const key = `${event.id || event.slug || ''}`.trim()
        if (!key) continue
        uniqueEvents.set(key, event)
      }

      if (batch.length < EVENT_PAGE_SIZE) break
    }
  } catch {
    return []
  }

  return Array.from(uniqueEvents.values())
}

// Group dates by when pages were added/updated for more meaningful lastModified
const DATES = {
  launch: new Date('2025-06-01'),       // Original site launch pages
  seoOverhaul: new Date('2026-03-22'),  // SEO overhaul batch
  apr2026: new Date('2026-04-21'),      // April 2026 additions
} as const

type StaticRoute = { path: string; lastModified: Date }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.the-anchor.pub'

  // Define all static routes with meaningful lastModified dates
  const staticRoutes: StaticRoute[] = [
    // Core pages — original launch
    { path: '', lastModified: DATES.apr2026 },
    { path: '/about', lastModified: DATES.launch },
    { path: '/blog', lastModified: DATES.apr2026 },
    { path: '/blog/tags', lastModified: DATES.seoOverhaul },
    { path: '/food-menu', lastModified: DATES.apr2026 },
    { path: '/food-menu/vegetarian', lastModified: DATES.seoOverhaul },
    { path: '/food-menu/vegan', lastModified: DATES.seoOverhaul },
    { path: '/food-menu/gluten-free', lastModified: DATES.seoOverhaul },
    { path: '/mothers-day', lastModified: DATES.seoOverhaul },
    { path: '/valentines-day', lastModified: DATES.seoOverhaul },
    { path: '/st-patricks-day', lastModified: DATES.seoOverhaul },
    { path: '/new-years-eve', lastModified: DATES.seoOverhaul },
    { path: '/easter', lastModified: DATES.seoOverhaul },
    { path: '/fathers-day', lastModified: DATES.seoOverhaul },
    { path: '/halloween', lastModified: DATES.seoOverhaul },
    { path: '/boxing-day', lastModified: DATES.seoOverhaul },
    { path: '/bonfire-night', lastModified: DATES.seoOverhaul },
    { path: '/bank-holiday-weekends', lastModified: DATES.seoOverhaul },
    { path: '/sunday-lunch', lastModified: DATES.apr2026 },
    { path: '/pizza-menu', lastModified: DATES.seoOverhaul },
    { path: '/burger-menu', lastModified: DATES.seoOverhaul },
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
    { path: '/live-music', lastModified: DATES.launch },
    { path: '/open-mic', lastModified: DATES.launch },
    { path: '/live-sport', lastModified: DATES.apr2026 },
    { path: '/live-sport/six-nations', lastModified: DATES.seoOverhaul },
    { path: '/live-sport/f1', lastModified: DATES.seoOverhaul },
    { path: '/live-sport/boxing', lastModified: DATES.seoOverhaul },
    { path: '/live-sport/world-cup', lastModified: DATES.seoOverhaul },
    { path: '/pool-darts-pub', lastModified: DATES.seoOverhaul },
    { path: '/summer-garden-parties', lastModified: DATES.seoOverhaul },

    // Booking & private hire
    { path: '/book-table', lastModified: DATES.apr2026 },
    { path: '/private-hire', lastModified: DATES.launch },
    { path: '/private-party-venue', lastModified: DATES.seoOverhaul },
    { path: '/function-room-hire', lastModified: DATES.seoOverhaul },
    { path: '/corporate-events', lastModified: DATES.seoOverhaul },
    { path: '/corporate-christmas-parties', lastModified: DATES.seoOverhaul },
    { path: '/christmas-parties', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/wakes', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/christenings', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/baby-showers', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/engagement-parties', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/gender-reveal', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/milestone-birthdays', lastModified: DATES.seoOverhaul },
    { path: '/private-hire/retirement-parties', lastModified: DATES.seoOverhaul },

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

    // Hotel proximity pages
    { path: '/heathrow-hotels-pub', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-sofitel-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-premier-inn-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-hilton-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-marriott-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-crowne-plaza-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-ibis-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-travelodge-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-renaissance-heathrow', lastModified: DATES.seoOverhaul },
    { path: '/pub-near-holiday-inn-heathrow', lastModified: DATES.apr2026 },
    { path: '/pub-near-novotel-heathrow', lastModified: DATES.apr2026 },
    { path: '/pub-near-radisson-blu-heathrow', lastModified: DATES.apr2026 },

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
    // Cannibalises /sunday-lunch — 301 redirected via additional-redirects.json.
    'sunday-lunch-at-the-anchor-is-back-pre-order-now'
  ])
  const indexableBlogPosts = blogPosts.filter((post) => !excludedBlogSlugs.has(post.slug) && !post.noindex)

  // Get all unique tags
  const allTags = new Set<string>()
  indexableBlogPosts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag))
  })

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

  // Build set of tag slugs that are redirect sources (to exclude from sitemap)
  const redirectSourceTags = new Set(
    tagRedirects
      .filter((r) => r.source.startsWith('/blog/tag/'))
      .map((r) => r.source.replace('/blog/tag/', ''))
  )

  // Map tag pages — exclude any tag that redirects to avoid "page with redirect" in GSC
  const tagSitemap = Array.from(allTags)
    .filter((tag) => !redirectSourceTags.has(tag))
    .map((tag) => ({
      url: `${baseUrl}/blog/tag/${tag}`,
      lastModified: DATES.apr2026,
    }))

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

      // Exclude stale past events (30+ days old)
      if (daysSince > PAST_EVENT_REDIRECT_DAYS) return false

      // Exclude cancelled events older than 7 days
      const status = event.event_status || event.eventStatus || ''
      const isCancelled = status.toLowerCase().includes('cancelled')
      if (isCancelled && daysSince > CANCELLED_INDEX_DAYS) return false

      return true
    })
    .map((event) => ({
      url: `${baseUrl}${getEventWebsitePath(event)}`,
      lastModified: getSafeDate(event._meta?.lastUpdated ?? event.startDate),
    }))

  return [...staticSitemap, ...blogSitemap, ...tagSitemap, ...landmarkSitemap, ...eventSitemap]
}
