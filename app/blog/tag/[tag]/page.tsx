import Link from 'next/link'
import Image from 'next/image'
import { getIndexableBlogPosts } from '@/lib/markdown'
import { Badge, Button, Card, Container } from '@/components/ui'
import { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { getTagSEOContent } from '@/lib/tag-seo-content'
import { InteriorHero } from '@/components/hero'
import { getBlogHeroUrl, BLOG_FALLBACK_IMAGE } from '@/lib/blog-image'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import tagRedirects from '@/config/redirects/tag-redirects.json'
import { isNoindexBlogTag, normalizeBlogTag } from '@/lib/blog-tag-policy'

export const revalidate = 3600

const redirectSourceTags = new Set(
  tagRedirects
    .filter((r: { source: string }) => r.source.startsWith('/blog/tag/'))
    .map((r: { source: string }) => r.source.replace('/blog/tag/', ''))
)

function normalizeTagSlug(tag: string): string {
  return normalizeBlogTag(tag)
}

export async function generateStaticParams() {
  const posts = await getIndexableBlogPosts()
  const allTags = new Set<string>()
  
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag))
  })
  
  return Array.from(allTags)
    .filter(tag => !redirectSourceTags.has(tag))
    .map(tag => ({
      tag: tag
    }))
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const tag = normalizeTagSlug(params.tag)
  const seoContent = getTagSEOContent(tag)
  
  return {
    title: seoContent.metaTitle,
    description: seoContent.metaDescription,
    alternates: {
      canonical: `/blog/tag/${tag}`,
    },
    openGraph: {
      title: seoContent.metaTitle,
      description: seoContent.metaDescription,
      images: [{ url: BLOG_FALLBACK_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub blog - news and events near Heathrow' }],
    },
    twitter: getTwitterMetadata({
      title: seoContent.metaTitle,
      description: seoContent.metaDescription,
      images: [BLOG_FALLBACK_IMAGE]
    }),
    ...(isNoindexBlogTag(tag) ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = normalizeTagSlug(params.tag)
  const allPosts = await getIndexableBlogPosts()
  const taggedPosts = allPosts.filter(post => 
    post.tags.map(t => normalizeTagSlug(t)).includes(tag)
  )
  
  if (taggedPosts.length === 0) {
    permanentRedirect('/blog/tags')
  }
  
  const seoContent = getTagSEOContent(tag)
  const displayName = seoContent.name
  const description = seoContent.description
  
  // Get all unique tags for the tag cloud
  const allTags = new Set<string>()
  allPosts.forEach(post => {
    post.tags.forEach(t => allTags.add(t))
  })
  
  return (
    <>
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Blog"
        title={displayName}
        lead={seoContent.heroContent}
      />

      {/* SEO Content Section */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container size="md">
          <p className="text-lg text-ink leading-relaxed mb-6">
            {seoContent.introContent}
          </p>
          <Card accent className="p-6">
            <p className="text-ink-strong font-medium">
              {seoContent.valueProposition}
            </p>
          </Card>
        </Container>
      </section>

      {/* Posts Grid */}
      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {taggedPosts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <Card hover accent className="h-full flex flex-col">
                  <div className="relative h-48">
                    <Image
                      src={getBlogHeroUrl(post.slug, post.hero)}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((t) => {
                        const normalizedTag = normalizeTagSlug(t)
                        return (
                          <Badge key={t} variant={normalizedTag === tag ? 'gold' : 'sand'}>
                            {t}
                          </Badge>
                        )
                      })}
                    </div>
                    <h3 className="font-display text-h4 text-ink-strong mb-2 line-clamp-2 group-hover:text-accent-text transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-ink-muted text-sm mb-4 line-clamp-2 flex-1">
                      {post.description}
                    </p>
                    <div className="text-sm text-ink-muted">
                      <time>{new Date(post.date).toLocaleDateString('en-GB')}</time>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Tag Cloud */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container size="md" className="text-center">
          <h2 className="text-h2 text-ink-strong mb-8">
            Explore More Topics
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {Array.from(allTags).filter(t => !redirectSourceTags.has(t)).sort().map(t => (
              <Link
                key={t}
                href={`/blog/tag/${encodeURIComponent(normalizeTagSlug(t))}`}
                className={`inline-flex items-center px-4 py-2 rounded-pill border text-sm font-medium transition-all ${
                  normalizeTagSlug(t) === tag
                    ? 'bg-anchor-gold border-anchor-gold text-white'
                    : 'bg-surface border-line text-ink hover:border-line-strong hover:text-accent-text'
                }`}
              >
                {getTagSEOContent(normalizeTagSlug(t)).name}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="theme-dark bg-anchor-green py-section-y">
        <Container size="md" className="text-center text-anchor-cream-text">
          <h2 className="text-h2 text-anchor-cream-text mb-8">
            Visit The Anchor Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-anchor-cream-text/85">
            Experience everything we write about firsthand. Join us for great food, drinks, and atmosphere!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/find-us">
              <Button variant="primary" size="lg">
                Get Directions
              </Button>
            </Link>
            <Link href="/whats-on">
              <Button variant="outline" size="lg">
                See What&apos;s On
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${displayName} at The Anchor`,
            "description": seoContent.metaDescription,
            "url": `https://www.the-anchor.pub/blog/tag/${tag}`,
            "isPartOf": {
              "@type": "Blog",
              "name": "The Anchor Blog",
              "url": "https://www.the-anchor.pub/blog"
            },
            "about": {
              "@type": "Thing",
              "name": displayName
            },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": taggedPosts.length,
              "itemListElement": taggedPosts.map((post, index) => ({
                "@type": "BlogPosting",
                "@id": `https://www.the-anchor.pub/blog/${post.slug}`,
                "position": index + 1,
                "headline": post.title,
                "description": post.description,
                "datePublished": post.date,
                "author": {
                  "@type": "Person",
                  "name": post.author
                }
              }))
            },
            "publisher": {
              "@type": "Organization",
              "name": "The Anchor - Heathrow Pub & Dining",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.the-anchor.pub/images/branding/the-anchor-pub-logo-black-transparent.png"
              }
            }
          })
        }}
      />
    </>
  )
}
