import Link from 'next/link'
import { getIndexableBlogPosts } from '@/lib/markdown'
import { Button, Card, Container } from '@/components/ui'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BLOG_FALLBACK_IMAGE } from '@/lib/blog-image'
import { InteriorHero } from '@/components/hero'
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
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Blog"
        title="All Blog Topics"
        lead={`Explore all ${tagCounts.size} topics from our blog`}
      />

      {/* Tags Grid */}
      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-h3 text-ink-strong mb-6">
            Browse by Topic
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sortedTags.map(([tag, count]) => {
              const seoContent = getTagSEOContent(tag)

              return (
                <Link key={tag} href={`/blog/tag/${tag}`} className="group">
                  <Card hover accent className="h-full p-4">
                    <h3 className="font-display text-h4 text-ink-strong group-hover:text-accent-text transition-colors mb-1">
                      {seoContent.name}
                    </h3>
                    <p className="text-sm text-ink-muted mb-2 line-clamp-2">
                      {seoContent.description}
                    </p>
                    <span className="text-xs bg-surface-sunk px-2 py-1 rounded-full text-ink-muted">
                      {count} {count === 1 ? 'post' : 'posts'}
                    </span>
                  </Card>
                </Link>
              )
            })}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="theme-dark bg-anchor-green [.theme-dark_&]:bg-anchor-green-raised py-section-y">
        <Container className="text-center text-anchor-cream-text">
          <h2 className="text-h2 text-anchor-cream-text mb-8">
            Stay Updated
          </h2>
          <p className="text-xl mb-8 mx-auto text-anchor-cream-text/85">
            Don&apos;t miss our latest stories, events, and special offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <Button variant="primary" size="lg">
                Back to Blog
              </Button>
            </Link>
            <Link href="/whats-on">
              <Button variant="outline" size="lg">
                Upcoming Events
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}
