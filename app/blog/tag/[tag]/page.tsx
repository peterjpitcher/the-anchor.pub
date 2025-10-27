import Link from 'next/link'
import Image from 'next/image'
import { getAllBlogPosts } from '@/lib/markdown'
import { Button, Section } from '@/components/ui'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTagSEOContent } from '@/lib/tag-seo-content'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { getBlogHeroUrl, BLOG_FALLBACK_IMAGE } from '@/lib/blog-image'

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  const allTags = new Set<string>()
  
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag))
  })
  
  return Array.from(allTags).map(tag => ({
    tag: tag
  }))
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const tag = params.tag
  const seoContent = getTagSEOContent(tag)
  
  return {
    title: seoContent.metaTitle,
    description: seoContent.metaDescription,
    keywords: seoContent.keywords.join(', '),
    alternates: {
      canonical: './', // Use relative canonical to strip parameters
    },
    openGraph: {
      title: seoContent.metaTitle,
      description: seoContent.metaDescription,
      images: [BLOG_FALLBACK_IMAGE],
    },
  }
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = params.tag
  const allPosts = await getAllBlogPosts()
  const taggedPosts = allPosts.filter(post => 
    post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  )
  
  if (taggedPosts.length === 0) {
    notFound()
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
        route={`/blog/tag/${params.tag}`}
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
      <Section spacing="md" container containerSize="md">
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {seoContent.introContent}
          </p>
          <div className="bg-anchor-green-light/10 rounded-lg p-6 my-8">
            <p className="text-gray-800 font-medium">
              {seoContent.valueProposition}
            </p>
          </div>
        </div>
      </Section>

      {/* Posts Grid */}
      <Section background="gray" spacing="md" container containerSize="lg">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {taggedPosts.map(post => (
            <article key={post.slug} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
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
                    {post.tags.map(t => (
                      <span 
                        key={t} 
                        className={`text-sm sm:text-xs px-2 py-1 rounded ${
                          t === tag 
                            ? 'bg-anchor-gold text-white' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-anchor-green mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="text-sm text-gray-600">
                    <time>{new Date(post.date).toLocaleDateString('en-GB')}</time>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* Tag Cloud */}
      <Section spacing="md" container containerSize="md" className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-green mb-8">
          Explore More Topics
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {Array.from(allTags).sort().map(t => (
            <Link
              key={t}
              href={`/blog/tag/${t}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                t === tag
                  ? 'bg-anchor-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-anchor-gold hover:text-white'
              }`}
            >
              {getTagSEOContent(t).name}
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
            <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
              Get Directions
            </Button>
          </Link>
          <Link href="/whats-on">
            <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
              See What's On
            </Button>
          </Link>
        </div>
      </Section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
