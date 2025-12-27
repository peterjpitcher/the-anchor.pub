import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/markdown'

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
    '/food-menu',
    '/drinks',
    '/drinks/managers-special',
    '/sunday-lunch',
    '/whats-on',
    '/whats-on/drag-shows',
    '/blog',
    '/near-heathrow',
    '/near-heathrow/terminal-2',
    '/near-heathrow/terminal-3',
    '/near-heathrow/terminal-4',
    '/near-heathrow/terminal-5',
    '/find-us',
    '/book-event',
    '/beer-garden',
    '/plane-spotting-heathrow',
    '/heathrow-layover-dining',
    '/christmas-parties',
    '/corporate-events',
    '/private-party-venue',
    '/function-room-hire',

    '/heathrow-parking',
    '/sitemap-page',
    '/ashford-pub',
    '/bedfont-pub',
    '/egham-pub',
    '/feltham-pub',
    '/heathrow-hotels-pub',
    '/m25-junction-14-pub',
    '/staines-pub',
    '/stanwell-pub',
    '/windsor-pub',
    '/book-table',
    '/horton-pub',
    '/wraysbury-pub',
    '/colnbrook-pub',
    '/longford-pub',
    '/sunbury-pub',
    '/private-hire/engagement-parties',
    '/private-hire/milestone-birthdays',
    '/private-hire/gender-reveal',
    '/private-hire/retirement-parties',
    '/luggage-storage-heathrow',
    '/pre-flight-meal',
    '/heathrow-family-dining',
    '/coach-parking-heathrow',
    '/live-sport-pub',
    '/pool-darts-pub',
    '/corporate-christmas-parties',
    '/summer-garden-parties',
    '/live-sport/six-nations',
    '/live-sport/premier-league',
    '/live-sport/f1',
    '/live-sport/boxing',
    '/fish-and-chips-heathrow',
    '/pizza-menu',
    '/burger-menu',
    '/dog-friendly-pub-heathrow',
    '/family-friendly-pub-heathrow',
    '/pub-garden-heathrow',
    '/live-music',
    '/cash-bingo',
    '/privacy-policy',
    '/quiz-night',
  ]

  // Get all blog posts
  const blogPosts = await getAllBlogPosts()

  // Get all unique tags
  const allTags = new Set<string>()
  blogPosts.forEach(post => {
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
  const blogSitemap = blogPosts.map((post) => {
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

  return [...staticSitemap, ...blogSitemap, ...tagSitemap]
}
