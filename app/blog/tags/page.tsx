import Link from 'next/link'
import { getIndexableBlogPosts } from '@/lib/markdown'
import { Button, Section } from '@/components/ui'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BLOG_FALLBACK_IMAGE } from '@/lib/blog-image'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { getTagSEOContent } from '@/lib/tag-seo-content'
import tagRedirects from '@/config/redirects/tag-redirects.json'

export const metadata: Metadata = {
  title: 'All Blog Topics',
  description: 'Browse all blog topics from The Anchor near Heathrow. Find posts about pub food, Sunday roasts, beer garden events, quiz nights and local community stories.',
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

const redirectSourceTags = new Set(
  tagRedirects
    .filter((r: { source: string }) => r.source.startsWith('/blog/tag/'))
    .map((r: { source: string }) => r.source.replace('/blog/tag/', ''))
)

export default async function AllTagsPage() {
  const allPosts = await getIndexableBlogPosts()

  // Get all unique tags with counts, excluding redirected tags
  const tagCounts = new Map<string, number>()
  allPosts.forEach(post => {
    post.tags.forEach(tag => {
      if (!redirectSourceTags.has(tag)) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    })
  })

  // Sort by count descending
  const sortedTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])

  return (
    <>
      {/* Hero Section */}
      <HeroWrapper
        showContextStrip={true}
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

      {/* Tags Grid */}
      <Section spacing="lg" container containerSize="lg" className="bg-anchor-bg">
        <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-6">
          Browse by Topic
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedTags.map(([tag, count]) => {
            const seoContent = getTagSEOContent(tag)

            return (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="group bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-4 hover:border-anchor-gold/40 transition-all"
              >
                <h3 className="font-semibold text-anchor-gold-vivid group-hover:text-anchor-gold transition-colours mb-1">
                  {seoContent.name}
                </h3>
                <p className="text-sm text-anchor-cream-text/70 mb-2 line-clamp-2">
                  {seoContent.description}
                </p>
                <span className="text-sm sm:text-xs bg-anchor-bg px-2 py-1 rounded-full text-anchor-cream-text/55">
                  {count} {count === 1 ? 'post' : 'posts'}
                </span>
              </Link>
            )
          })}
        </div>
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
