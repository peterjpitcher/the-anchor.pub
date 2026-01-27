import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/markdown'
import { landmarks } from '@/lib/local-seo-data'
import { getUpcomingEvents } from '@/lib/api'
import { getEventWebsitePath } from '@/lib/event-url'

export const revalidate = 60 * 60 // 1 hour
export const dynamic = 'force-dynamic'

function getSafeDate(value?: string): Date {
  if (!value) {
    return new Date()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.the-anchor.pub'

  // Define all static routes
  const staticRoutes = [
    '',
    '/blog',
    '/blog/tags',
    '/food-menu',
    '/mothers-day',
    '/valentines-day',
    '/sunday-lunch',
    '/pizza-menu',
    '/burger-menu',
    '/fish-and-chips-heathrow',
    '/pizza-tuesday',
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
    '/private-hire/weddings',
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
    '/coach-parking-heathrow',
    '/restaurants-near-heathrow',
    '/pubs-in-stanwell',
    '/heathrow-hotels-pub',
    '/m25-junction-14-pub',
    '/beer-garden',
    '/pub-garden-heathrow',
    '/plane-spotting-heathrow',
    '/dog-friendly-pub-heathrow',
    '/family-friendly-pub-heathrow',
    '/ashford-pub',
    '/bedfont-pub',
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
    '/sitemap-page',
    '/privacy-policy',
  ]

  // Get all blog posts
  const blogPosts = await getAllBlogPosts()
  const excludedBlogSlugs = new Set([
    'euro-2024-viewing',
    'autumn-internationals-2024-full-fixtures-highlight'
  ])
  const indexableBlogPosts = blogPosts.filter((post) => !excludedBlogSlugs.has(post.slug))

  // Get all unique tags
  const allTags = new Set<string>()
  indexableBlogPosts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag))
  })

  // Map static routes
  const staticSitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : route === '/blog' ? 'daily' : route === '/book-table' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1.0 : route === '/book-table' ? 0.95 : route.includes('near-heathrow') ? 0.9 : route === '/blog' ? 0.9 : route.includes('-pub') ? 0.85 : 0.8,
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

  // Map tag pages
  const tagSitemap = Array.from(allTags).map((tag) => ({
    url: `${baseUrl}/blog/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const landmarkSitemap = landmarks.map((landmark) => ({
    url: `${baseUrl}/private-hire/near/${landmark.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const upcomingEvents = await getUpcomingEvents(50, 180)
  const eventSitemap = upcomingEvents
    .filter((event) => event.category?.id !== 'fallback' && event.id !== 'the-anchor-showcase')
    .map((event) => ({
      url: `${baseUrl}${getEventWebsitePath(event)}`,
      lastModified: getSafeDate(event._meta?.lastUpdated ?? event.startDate),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))

  return [...staticSitemap, ...blogSitemap, ...tagSitemap, ...landmarkSitemap, ...eventSitemap]
}
