import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/markdown'
import { landmarks } from '@/lib/local-seo-data'
import { anchorAPI, type Event } from '@/lib/api'
import { getEventWebsitePath } from '@/lib/event-url'
import tagRedirects from '@/config/redirects/tag-redirects.json'
import { PAST_EVENT_REDIRECT_DAYS, CANCELLED_INDEX_DAYS } from '@/lib/event-seo-strategy'

export const revalidate = 60 * 60 // 1 hour
export const dynamic = 'force-dynamic'

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

const STATIC_LAST_MODIFIED = new Date('2026-04-21')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.the-anchor.pub'

  // Define all static routes
  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/blog/tags',
    '/food-menu',
    '/food-menu/vegetarian',
    '/food-menu/vegan',
    '/food-menu/gluten-free',
    '/mothers-day',
    '/valentines-day',
    '/st-patricks-day',
    '/new-years-eve',
    '/easter',
    '/fathers-day',
    '/halloween',
    '/boxing-day',
    '/bonfire-night',
    '/bank-holiday-weekends',
    '/sunday-lunch',
    '/pizza-menu',
    '/burger-menu',
    '/fish-and-chips-heathrow',
    '/drinks',
    '/drinks/managers-special',
    '/drinks/baby-guinness',
    '/whats-on',
    '/quiz-night',
    '/cash-bingo',
    '/music-bingo',
    '/karaoke',
    '/live-music',
    '/open-mic',
    '/live-sport',

    '/live-sport/six-nations',
    '/live-sport/f1',
    '/live-sport/boxing',
    '/live-sport/world-cup',
    '/pool-darts-pub',
    '/summer-garden-parties',
    '/book-table',
    '/private-hire',
    '/private-party-venue',
    '/function-room-hire',
    '/corporate-events',
    '/corporate-christmas-parties',
    '/christmas-parties',
    '/private-hire/wakes',
    '/private-hire/christenings',
    '/private-hire/baby-showers',
    '/private-hire/engagement-parties',
    '/private-hire/gender-reveal',
    '/private-hire/milestone-birthdays',
    '/private-hire/retirement-parties',
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
    '/heathrow-hotels-pub',
    '/pub-near-sofitel-heathrow',
    '/pub-near-premier-inn-heathrow',
    '/pub-near-hilton-heathrow',
    '/pub-near-marriott-heathrow',
    '/pub-near-crowne-plaza-heathrow',
    '/pub-near-ibis-heathrow',
    '/pub-near-travelodge-heathrow',
    '/pub-near-renaissance-heathrow',
    '/m25-junction-14-pub',
    '/beer-garden',
    '/our-pub',
    '/plane-spotting-heathrow',
    '/dog-friendly-pub-heathrow',
    '/family-friendly-pub-heathrow',
    '/ashford-pub',
    '/colnbrook-pub',
    '/feltham-pub',
    '/staines-pub',
    '/stanwell-pub',
    '/sitemap-page',
    '/privacy-policy',
    '/accessibility',
    '/safety-and-respect',
    '/sustainability',
    '/reviews',
  ]

  // Get all blog posts
  const blogPosts = await getAllBlogPosts()
  const excludedBlogSlugs = new Set([
    'euro-2024-viewing',
    'autumn-internationals-2024-full-fixtures-highlight'
  ])
  const indexableBlogPosts = blogPosts.filter((post) => !excludedBlogSlugs.has(post.slug) && !post.noindex)

  // Get all unique tags
  const allTags = new Set<string>()
  indexableBlogPosts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag))
  })

  // Map static routes
  const staticSitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: (route === '' ? 'daily' : route === '/blog' ? 'daily' : route === '/book-table' ? 'daily' : route === '/safety-and-respect' ? 'yearly' : route === '/accessibility' || route === '/sustainability' ? 'monthly' : 'weekly') as 'daily' | 'weekly' | 'monthly' | 'yearly',
    priority: route === '' ? 1.0 : route === '/book-table' ? 0.95 : route.includes('near-heathrow') ? 0.9 : route === '/blog' ? 0.9 : route.includes('-pub') ? 0.85 : route === '/accessibility' || route === '/sustainability' ? 0.7 : route === '/safety-and-respect' ? 0.6 : 0.8,
  }))

  // Map blog post routes
  const blogSitemap = indexableBlogPosts.map((post) => {
    const lastModified = getSafeDate(post.date)
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
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
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  const landmarkSitemap = landmarks.map((landmark) => ({
    url: `${baseUrl}/private-hire/near/${landmark.slug}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
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
      changeFrequency:
        Date.parse(event.startDate) > nowMs
          ? ('daily' as const)
          : ('monthly' as const),
      priority:
        Date.parse(event.startDate) > nowMs
          ? 0.85
          : 0.65,
    }))

  return [...staticSitemap, ...blogSitemap, ...tagSitemap, ...landmarkSitemap, ...eventSitemap]
}
