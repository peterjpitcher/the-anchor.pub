import Link from 'next/link'
import Image from 'next/image'
import { getIndexableBlogPosts } from '@/lib/markdown'
import { Button, Section } from '@/components/ui'
import { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { getTagSEOContent } from '@/lib/tag-seo-content'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
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
      <HeroWrapper
        showContextStrip={true}
        route={`/blog/tag/${tag}`}
        title={displayName}
        description={seoContent.heroContent}
        variant="feature"
        breadcrumbs={[
          { name: 'Blog', href: '/blog' },
          { name: displayName }
        ]}
        secondaryInfo={
          <p className="text-white/80">
            {taggedPosts.length} {taggedPosts.length === 1 ? 'post' : 'posts'}
          </p>
        }
      />

      {/* SEO Content Section */}
      <Section spacing="md" container containerSize="md" className="bg-anchor-green-deep border-b border-anchor-gold-dark/15">
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-anchor-cream-text/70 leading-relaxed mb-6">
            {seoContent.introContent}
          </p>
          <div className="bg-anchor-green-card rounded-none border border-anchor-gold-dark/15 p-6 my-8">
            <p className="text-anchor-cream-text font-medium">
              {seoContent.valueProposition}
            </p>
          </div>
        </div>
      </Section>

      {/* Posts Grid */}
      <Section background="gray" spacing="md" container containerSize="lg" className="bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {taggedPosts.map(post => (
            <article key={post.slug} className="bg-anchor-green-card rounded-none border border-anchor-gold-dark/15 overflow-hidden hover:border-anchor-gold-dark/40 transition-shadow">
              <Link href={`/blog/${post.slug}`}>
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
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((t) => {
                      const normalizedTag = normalizeTagSlug(t)
                      return (
                      <span
                        key={t}
                        className={`text-sm sm:text-xs px-2 py-1 rounded ${
                          normalizedTag === tag
                            ? 'bg-anchor-gold-dark text-white'
                            : 'bg-anchor-green-deep text-anchor-cream-text/55'
                        }`}
                      >
                        {t}
                      </span>
                      )
                    })}
                  </div>
                  <h3 className="text-lg font-bold text-anchor-gold-bright mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-anchor-cream-text/70 text-sm mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="text-sm text-anchor-cream-text/55">
                    <time>{new Date(post.date).toLocaleDateString('en-GB')}</time>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* Tag Cloud */}
      <Section spacing="md" container containerSize="md" className="text-center bg-anchor-green-deep border-b border-anchor-gold-dark/15">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-gold-bright mb-8">
          Explore More Topics
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {Array.from(allTags).filter(t => !redirectSourceTags.has(t)).sort().map(t => (
            <Link
              key={t}
              href={`/blog/tag/${encodeURIComponent(normalizeTagSlug(t))}`}
              className={`px-4 py-2 rounded-none border text-sm font-medium transition-all ${
                normalizeTagSlug(t) === tag
                  ? 'bg-anchor-gold-dark border-anchor-gold-dark text-white'
                  : 'bg-anchor-green-card border-anchor-gold-dark/15 text-anchor-cream-text/70 hover:bg-anchor-gold-dark hover:border-anchor-gold-dark hover:text-white'
              }`}
            >
              {getTagSEOContent(normalizeTagSlug(t)).name}
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="dark" spacing="md" container containerSize="md" className="text-center">
        <h2 className="text-3xl font-bold mb-8">
          Visit The Anchor Today
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Experience everything we write about firsthand. Join us for great food, drinks, and atmosphere!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/find-us">
            <Button variant="outline" size="lg" className="!text-anchor-gold-dark !border-anchor-gold-dark hover:!bg-anchor-gold-dark hover:!text-anchor-green">
              Get Directions
            </Button>
          </Link>
          <Link href="/whats-on">
            <Button variant="outline" size="lg" className="!text-anchor-gold-dark !border-anchor-gold-dark hover:!bg-anchor-gold-dark hover:!text-anchor-green">
              See What's On
            </Button>
          </Link>
        </div>
      </Section>

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
