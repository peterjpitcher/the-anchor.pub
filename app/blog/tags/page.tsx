import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/markdown'
import { Button, Section } from '@/components/ui'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BLOG_FALLBACK_IMAGE } from '@/lib/blog-image'
import { HeroWrapper } from '@/components/hero/HeroWrapper'

export const metadata: Metadata = {
  title: 'All Blog Topics | The Anchor - Heathrow Pub & Dining',
  description: 'Browse all blog topics and categories from The Anchor. Find posts about food, drinks, events, and more.',
  openGraph: {
    title: 'All Blog Topics - The Anchor',
    description: 'Explore all blog categories and topics',
    images: [BLOG_FALLBACK_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'All Blog Topics - The Anchor',
    description: 'Explore all blog categories and topics',
    images: [BLOG_FALLBACK_IMAGE]
  }),
  alternates: {
    canonical: '/blog/tags'
  }
}

// Tag display names and descriptions
const tagInfo: Record<string, { name: string; description: string; category: string }> = {
  // Core Categories
  'food-and-drink': { name: 'Food & Drink', description: 'Delicious pub food, dining experiences, and drink selections', category: 'Core' },
  'events': { name: 'Events', description: 'Live entertainment, quizzes, and special events', category: 'Core' },
  'community': { name: 'Community', description: 'Local news, charity initiatives, and village stories', category: 'Core' },
  'sports': { name: 'Sports', description: 'Live sports coverage and fixtures', category: 'Core' },
  'offers': { name: 'Special Offers', description: 'Latest deals, discounts, and promotions', category: 'Core' },
  'seasonal': { name: 'Seasonal', description: 'Festive celebrations and holiday updates', category: 'Core' },
  'news': { name: 'News', description: 'General updates and announcements', category: 'Core' },
}

export default async function AllTagsPage() {
  const allPosts = await getAllBlogPosts()

  // Get all unique tags with counts
  const tagCounts = new Map<string, number>()
  allPosts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  // Group tags by category
  const categorizedTags: Record<string, Array<[string, number]>> = {
    'Core': [],
    'Other': []
  }

  // Sort tags into categories
  Array.from(tagCounts.entries()).forEach(([tag, count]) => {
    const info = tagInfo[tag]
    const category = info?.category || 'Other'
    categorizedTags[category].push([tag, count])
  })

  // Sort each category by count
  Object.keys(categorizedTags).forEach(category => {
    categorizedTags[category].sort((a, b) => b[1] - a[1])
  })

  return (
    <>
      {/* Hero Section */}
      <HeroWrapper
        route="/blog/tags"
        title="All Blog Topics"
        description={`Explore all ${tagCounts.size} topics from our blog`}
        variant="feature"
        breadcrumbs={[
          { name: 'Blog', href: '/blog' },
          { name: 'All Topics' }
        ]}
        secondaryCta={
          <Link
            href="/blog"
            className="inline-flex items-center text-white/90 hover:text-white transition-colours"
          >
            ← Back to Blog
          </Link>
        }
      />

      {/* Tags by Category */}
      <Section spacing="lg" container containerSize="lg" className="bg-anchor-bg">
        {Object.entries(categorizedTags).map(([category, tags]) => {
          if (tags.length === 0) return null

          return (
            <div key={category} className="mb-12 last:mb-0">
              <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-6">
                {category === 'Core' ? 'Browse by Topic' : category}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tags.map(([tag, count]) => {
                  const info = tagInfo[tag] || {
                    name: tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    description: `Posts about ${tag}`
                  }

                  return (
                    <Link
                      key={tag}
                      href={`/blog/tag/${tag}`}
                      className="group bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-4 hover:border-anchor-gold/40 transition-all"
                    >
                      <h3 className="font-semibold text-anchor-gold-vivid group-hover:text-anchor-gold transition-colours mb-1">
                        {info.name}
                      </h3>
                      <p className="text-sm text-anchor-cream-text/70 mb-2 line-clamp-2">
                        {info.description}
                      </p>
                      <span className="text-sm sm:text-xs bg-anchor-bg px-2 py-1 rounded-full text-anchor-cream-text/55">
                        {count} {count === 1 ? 'post' : 'posts'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </Section>

      {/* CTA Section */}
      <Section background="dark" spacing="md" container containerSize="md" className="text-center">
        <h2 className="text-3xl font-bold mb-8">
          Stay Updated
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Don't miss our latest stories, events, and special offers
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/blog">
            <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
              Back to Blog
            </Button>
          </Link>
          <Link href="/whats-on">
            <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
              Upcoming Events
            </Button>
          </Link>
        </div>
      </Section>
    </>
  )
}
