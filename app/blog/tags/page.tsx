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
  })
}

// Tag display names and descriptions
const tagInfo: Record<string, { name: string; description: string; category: string }> = {
  // Food & Dining
  'food': { name: 'Food & Dining', description: 'Delicious pub food and dining experiences', category: 'Primary' },
  'sunday-roast': { name: 'Sunday Roast', description: 'Traditional Sunday lunches', category: 'Food' },
  'pizza': { name: 'Pizza', description: 'Stone-baked pizzas', category: 'Food' },
  'fish-and-chips': { name: 'Fish & Chips', description: 'Traditional British classic', category: 'Food' },
  'british-cuisine': { name: 'British Cuisine', description: 'Classic British pub food', category: 'Food' },
  'burgers': { name: 'Burgers', description: 'Gourmet burger selection', category: 'Food' },
  'seasonal-menu': { name: 'Seasonal Menu', description: 'Seasonal specials', category: 'Food' },
  
  // Drinks
  'drinks': { name: 'Drinks & Bar', description: 'Craft beers, spirits, and wines', category: 'Primary' },
  'beer': { name: 'Beer', description: 'Craft and traditional beers', category: 'Drinks' },
  'cocktails': { name: 'Cocktails', description: 'Signature cocktails', category: 'Drinks' },
  'wine': { name: 'Wine', description: 'Wine selection', category: 'Drinks' },
  'spirits': { name: 'Spirits', description: 'Premium spirits', category: 'Drinks' },
  'tasting-events': { name: 'Tasting Events', description: 'Spirit and wine tastings', category: 'Drinks' },
  
  // Events
  'events': { name: 'Events', description: 'Live entertainment and special events', category: 'Primary' },
  'quiz-night': { name: 'Quiz Nights', description: 'Test your knowledge', category: 'Events' },
  'drag-shows': { name: 'Drag Shows', description: 'Fabulous drag entertainment', category: 'Events' },
  'bingo': { name: 'Bingo', description: 'Fun-filled bingo nights', category: 'Events' },
  'karaoke': { name: 'Karaoke', description: 'Sing your heart out', category: 'Events' },
  
  // Community & Sports
  'community': { name: 'Community', description: 'Local news and initiatives', category: 'Primary' },
  'sports': { name: 'Sports', description: 'Terrestrial sports and fixtures', category: 'Primary' },
  'football': { name: 'Football', description: 'Live football screenings', category: 'Sports' },
  'rugby': { name: 'Rugby', description: 'Rugby matches', category: 'Sports' },
  
  // Special Offers & Seasonal
  'special-offers': { name: 'Special Offers', description: 'Deals and promotions', category: 'Primary' },
  'christmas': { name: 'Christmas', description: 'Festive celebrations', category: 'Seasonal' },
  'easter': { name: 'Easter', description: 'Easter celebrations', category: 'Seasonal' },
  'halloween': { name: 'Halloween', description: 'Spooky celebrations', category: 'Seasonal' },
  'valentines': { name: "Valentine's Day", description: 'Romantic celebrations', category: 'Seasonal' },
  'new-year': { name: 'New Year', description: 'New Year celebrations', category: 'Seasonal' },
  
  // Location & Features
  'heathrow-area': { name: 'Near Heathrow', description: 'Perfect for airport workers', category: 'Location' },
  'stanwell-moor': { name: 'Stanwell Moor', description: 'Your local village pub', category: 'Location' },
  'dog-friendly': { name: 'Dog Friendly', description: 'Welcoming for dogs', category: 'Features' },
  'family-friendly': { name: 'Family Friendly', description: 'Perfect for families', category: 'Features' },
  'outdoor-seating': { name: 'Beer Garden', description: 'Outdoor dining', category: 'Features' },
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
    'Primary': [],
    'Food': [],
    'Drinks': [],
    'Events': [],
    'Sports': [],
    'Seasonal': [],
    'Location': [],
    'Features': [],
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
      <Section spacing="lg" container containerSize="lg">
        {Object.entries(categorizedTags).map(([category, tags]) => {
          if (tags.length === 0) return null
          
          return (
            <div key={category} className="mb-12 last:mb-0">
              <h2 className="text-2xl font-bold text-anchor-green mb-6">
                {category === 'Primary' ? 'Main Categories' : category}
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
                      className="group bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all hover:scale-105"
                    >
                      <h3 className="font-semibold text-anchor-green group-hover:text-anchor-gold transition-colours mb-1">
                        {info.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {info.description}
                      </p>
                      <span className="text-sm sm:text-xs bg-white px-2 py-1 rounded-full text-gray-700">
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
