import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPost, getAllBlogPosts, getIndexableBlogPosts, distributeImages } from '@/lib/markdown'
import { Button, Section } from '@/components/ui'
import { Metadata } from 'next'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { BlogShareButtons } from '@/components/BlogShareButtons'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { getBlogHeroUrl } from '@/lib/blog-image'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { OrganicSearchClusterKey } from '@/lib/seo/organic-search-map'

export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

function stripMarkdownFormatting(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFaqEntries(markdown: string): Array<{ question: string; answer: string }> {
  const lines = markdown.split(/\r?\n/)
  const entries: Array<{ question: string; answer: string }> = []

  let inFaqSection = false
  let activeQuestion: string | null = null
  let answerBuffer: string[] = []

  const flushEntry = () => {
    if (!activeQuestion) return
    const answer = stripMarkdownFormatting(answerBuffer.join(' ').trim())
    if (answer) {
      entries.push({
        question: stripMarkdownFormatting(activeQuestion),
        answer
      })
    }
    activeQuestion = null
    answerBuffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!inFaqSection) {
      if (/^##\s+FAQs\s*$/i.test(line)) {
        inFaqSection = true
      }
      continue
    }

    if (/^##\s+/.test(line) && !/^##\s+FAQs\s*$/i.test(line)) {
      flushEntry()
      break
    }

    const questionMatch = line.match(/^###\s+(.+)$/)
    if (questionMatch) {
      flushEntry()
      activeQuestion = questionMatch[1]
      continue
    }

    if (!activeQuestion || !line || line === '---') {
      continue
    }

    answerBuffer.push(line)
  }

  flushEntry()

  return entries
}

/**
 * Tags that indicate a Heathrow/plane-spotting/travel post where a booking CTA is relevant.
 * Also catches posts by slug pattern (e.g. "plane-spotting-heathrow-guide" which uses generic tags).
 */
const HEATHROW_CTA_TAGS = new Set([
  'heathrow',
  'plane-spotting',
  'parking',
  'travel',
])

const HEATHROW_SLUG_KEYWORDS = ['heathrow', 'plane', 'parking', 'aviation', 'airport', 'layover']

function shouldShowHeathrowBookingCta(slug: string, tags: string[]): boolean {
  if (tags.some((tag) => HEATHROW_CTA_TAGS.has(tag.toLowerCase().trim()))) return true
  return HEATHROW_SLUG_KEYWORDS.some((kw) => slug.toLowerCase().includes(kw))
}

function getBlogOrganicSearchCluster(slug: string, tags: string[]): OrganicSearchClusterKey | null {
  const tagSet = new Set(tags.map((tag) => tag.toLowerCase().trim()))
  const lowerSlug = slug.toLowerCase()

  if (lowerSlug.includes('plane') || tagSet.has('plane-spotting')) return 'planeSpotting'
  if (lowerSlug.includes('parking') || tagSet.has('parking')) return 'heathrowParking'
  if (lowerSlug.includes('beer-garden')) return 'beerGarden'
  if (
    lowerSlug.includes('restaurant') ||
    lowerSlug.includes('where-to-eat') ||
    lowerSlug.includes('eating-near-heathrow') ||
    lowerSlug.includes('layover') ||
    lowerSlug.includes('pub-food') ||
    lowerSlug.includes('fish-chips') ||
    lowerSlug.includes('sunday-roast') ||
    tagSet.has('food-and-drink')
  ) {
    return 'heathrowDining'
  }
  if (
    lowerSlug.includes('live-sport') ||
    lowerSlug.includes('quiz') ||
    lowerSlug.includes('bingo') ||
    lowerSlug.includes('karaoke') ||
    lowerSlug.includes('music')
  ) {
    return 'events'
  }
  if (
    lowerSlug.includes('private') ||
    lowerSlug.includes('function-room') ||
    lowerSlug.includes('party') ||
    lowerSlug.includes('christening') ||
    lowerSlug.includes('wake')
  ) {
    return 'privateRooms'
  }
  if (lowerSlug.includes('digital-nomad') || lowerSlug.includes('business-travellers')) return 'workspace'

  return null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const ogImageUrl = getBlogHeroUrl(post.slug, post.ogImage || post.hero)
  const ogImageAlt = post.ogImageAlt || post.title

  return {
    title: `${post.title} | Blog`,
    description: post.description,
    alternates: {
      canonical: `/blog/${params.slug}`
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${params.slug}`,
      images: [
        {
          url: ogImageUrl,
          alt: ogImageAlt
        }
      ],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags
    },
    ...(post.noindex ? { robots: { index: false, follow: true } } : {}),
    twitter: getTwitterMetadata({
      title: post.title,
      description: post.description,
      images: [ogImageUrl]
    }),
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  // Block direct access to future-dated (unpublished) posts
  if (post?.publishDate && new Date(post.publishDate) > new Date()) {
    notFound()
  }

  // Keep indexable posts from linking through previous/next navigation to
  // intentionally noindexed archive posts.
  const navigationPosts = post.noindex
    ? await getAllBlogPosts()
    : await getIndexableBlogPosts()
  const currentIndex = navigationPosts.findIndex(p => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? navigationPosts[currentIndex - 1] : null
  const nextPost = currentIndex < navigationPosts.length - 1 ? navigationPosts[currentIndex + 1] : null

  // Distribute images throughout content only if images array has items
  const contentWithImages = post.images && post.images.length > 0 
    ? distributeImages(post.htmlContent || '', post.images, post.slug, post.imageAlts)
    : post.htmlContent || ''

  const heroUrl = getBlogHeroUrl(post.slug, post.hero)
  const heroAlt = post.heroAlt || post.title
  const ogImageUrl = getBlogHeroUrl(post.slug, post.ogImage || post.hero)
  const ogImageAlt = post.ogImageAlt || post.title
  const ogAbsoluteUrl = ogImageUrl.startsWith('http')
    ? ogImageUrl
    : `https://www.the-anchor.pub${ogImageUrl}`

  const faqEntries = extractFaqEntries(post.content)

  const showHeathrowCta = shouldShowHeathrowBookingCta(post.slug, post.tags)
  const organicSearchCluster = getBlogOrganicSearchCluster(post.slug, post.tags)

  // BlogPosting structured data for better SEO
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "alternativeHeadline": post.description,
    "description": post.description,
    "author": {
      "@type": "Person",
      "name": post.author,
      "url": "https://www.the-anchor.pub/blog"
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "publisher": {
      "@type": "Organization",
      "name": "The Anchor",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.the-anchor.pub/images/branding/the-anchor-pub-logo-white-transparent.png",
        "width": 320,
        "height": 320
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Horton Road",
        "addressLocality": "Stanwell Moor",
        "addressRegion": "Surrey",
        "postalCode": "TW19 6AQ",
        "addressCountry": "GB"
      }
    },
    "image": {
      "@type": "ImageObject",
      "url": ogAbsoluteUrl,
      "caption": ogImageAlt,
      "width": 1200,
      "height": 630
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.the-anchor.pub/blog/${post.slug}`
    },
    "keywords": post.keywords.join(", "),
    "articleSection": post.tags[0] || "Pub News",
    "articleBody": post.htmlContent?.replace(/<[^>]*>/g, '') || post.description,
    "wordCount": post.htmlContent ? post.htmlContent.split(' ').length : 500,
    "inLanguage": "en-GB",
    "url": `https://www.the-anchor.pub/blog/${post.slug}`,
    "isAccessibleForFree": true,
    "genre": post.tags[0] || "Blog",
    "about": {
      "@type": "LocalBusiness",
      "name": "The Anchor",
      "@id": "https://www.the-anchor.pub/#organization"
    }
  }

  const faqSchema = faqEntries.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqEntries.map((entry) => ({
          "@type": "Question",
          "name": entry.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": entry.answer
          }
        }))
      }
    : null

  // Blog schema to establish blog context
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "The Anchor Blog",
    "description": "News, events, and updates from The Anchor in Stanwell Moor",
    "url": "https://www.the-anchor.pub/blog",
    "publisher": {
      "@type": "Organization",
      "name": "The Anchor",
      "@id": "https://www.the-anchor.pub/#organization"
    },
    "blogPost": {
      "@type": "BlogPosting",
      "@id": `https://www.the-anchor.pub/blog/${post.slug}#blogposting`
    }
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify(
            [blogPostingSchema, blogSchema, faqSchema].filter(Boolean)
          )
        }}
      />
      <ScrollDepthTracker />
      {/* Hero Section */}
      <HeroWrapper
        showContextStrip={true}
        route={`/blog/${params.slug}`}
        title={post.title}
        description={
          <div className="text-left sm:text-center">
            <p className="text-white/90 mb-2">
              By {post.author} • {new Date(post.date).toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-lg text-white/80">
              {post.description}
            </p>
          </div>
        }
        variant="feature"
        image={{
          src: heroUrl,
          alt: heroAlt
        }}
        tags={post.tags.map(tag => ({
          label: tag,
          variant: 'default' as const,
          href: `/blog/tag/${tag}`
        }))}
        secondaryCta={
          <BlogShareButtons 
            postSlug={post.slug}
            postTitle={post.title}
          />
        }
      />

      {/* Breadcrumb */}
      <Section background="gray" spacing="xs" container className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-anchor-cream-text/55">
          <Link href="/" className="hover:text-anchor-gold">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-anchor-gold">Blog</Link>
          <span>/</span>
          <span className="text-anchor-cream-text font-semibold">{post.title}</span>
        </nav>
      </Section>

      {/* Content */}
      <Section as="article" spacing="lg" container containerSize="md" className="bg-anchor-bg">
        <div className="prose prose-lg lg:prose-xl max-w-none
                prose-headings:font-serif prose-headings:text-anchor-gold-vivid
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3
                prose-p:text-anchor-cream-text/70 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-anchor-gold prose-a:font-semibold prose-a:no-underline
                hover:prose-a:underline prose-a:transition-colours hover:prose-a:text-anchor-gold-light
                prose-strong:text-anchor-cream-text prose-strong:font-bold
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-anchor-cream-text/70 prose-li:mb-2
                prose-img:rounded-none prose-img:shadow-sm prose-img:ring-1 prose-img:ring-anchor-gold/15
                prose-img:my-8 prose-img:w-full prose-img:max-w-full prose-img:mx-auto
                sm:prose-img:max-w-xl lg:prose-img:max-w-[420px] xl:prose-img:max-w-[460px]
                prose-figure:my-8 prose-figure:mx-auto prose-figure:max-w-full
                sm:prose-figure:max-w-xl lg:prose-figure:max-w-[420px] xl:prose-figure:max-w-[460px]
                prose-blockquote:border-l-4 prose-blockquote:border-anchor-gold prose-blockquote:pl-6
                prose-blockquote:italic prose-blockquote:text-anchor-cream-text/55 prose-blockquote:my-8
                prose-code:bg-anchor-bg-raised prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-pre:bg-anchor-bg-card prose-pre:text-anchor-cream-text
                prose-table:my-8 prose-th:bg-anchor-bg-card prose-th:text-anchor-gold-vivid
                prose-th:font-semibold prose-th:px-6 prose-th:py-3
                prose-td:border prose-td:border-anchor-gold/15 prose-td:px-6 prose-td:py-3 prose-td:text-anchor-cream-text
                prose-hr:border-anchor-gold/15 prose-hr:my-12">
          <div dangerouslySetInnerHTML={{ __html: contentWithImages }} />
        </div>
      </Section>

      {/* Heathrow / Plane-Spotting Booking CTA, only shown for relevant posts */}
      {showHeathrowCta && (
        <Section spacing="md" container containerSize="md" className="bg-anchor-bg-card border-y border-anchor-gold/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-anchor-gold-vivid mb-2">
                Visiting Heathrow? The Anchor is 5 minutes away
              </h2>
              <p className="text-anchor-cream-text/70">
                Book a table for lunch in our beer garden, great food, cold drinks, and a proper base for a day of spotting.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <BookTableButton source="blog_heathrow_cta" context="heathrow_visitor" size="md">
                Book a Table
              </BookTableButton>
              <Link href="/food-menu">
                <Button variant="secondary" size="md">
                  View Food Menu
                </Button>
              </Link>
            </div>
          </div>
        </Section>
      )}

      {/* Share Section */}
      <Section background="gray" spacing="sm" container containerSize="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <div className="text-center">
          <p className="text-anchor-cream-text/70 mb-4">Enjoyed this article? Share it with your friends!</p>
          <BlogShareButtons postTitle={post.title} postSlug={post.slug} />
        </div>
      </Section>

      {/* Navigation */}
      <Section spacing="md" container containerSize="lg" className="bg-anchor-bg border-b border-anchor-gold/15">
        <div className="grid md:grid-cols-2 gap-6">
          {prevPost && (
            <Link href={`/blog/${prevPost.slug}`} className="group">
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 hover:border-anchor-gold/40 transition-shadow">
                <p className="text-sm text-anchor-cream-text/55 mb-2">← Previous Post</p>
                <h3 className="text-lg font-bold text-anchor-gold-vivid group-hover:text-anchor-gold transition-colours">
                  {prevPost.title}
                </h3>
              </div>
            </Link>
          )}
          {nextPost && (
            <Link href={`/blog/${nextPost.slug}`} className="group md:text-right">
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 hover:border-anchor-gold/40 transition-shadow">
                <p className="text-sm text-anchor-cream-text/55 mb-2">Next Post →</p>
                <h3 className="text-lg font-bold text-anchor-gold-vivid group-hover:text-anchor-gold transition-colours">
                  {nextPost.title}
                </h3>
              </div>
            </Link>
          )}
        </div>
      </Section>

      {/* Internal Linking for Better SEO */}
      {organicSearchCluster && (
        <OrganicSearchClusterLinks
          cluster={organicSearchCluster}
          currentPath={`/blog/${post.slug}`}
          title="Continue planning your visit"
          intro="Use these related pages to move from research to booking, directions, menu choices or parking."
        />
      )}
      <InternalLinkingSection 
        links={commonLinkGroups.events}
        className="section-spacing-md"
      />

      {/* CTA Section */}
      <Section background="dark" spacing="md" container containerSize="md" className="text-center">
        <h2 className="text-3xl font-bold mb-8">
          Visit The Anchor Today
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Experience everything we write about firsthand. Join us for great food, drinks, and atmosphere!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showHeathrowCta ? (
            <>
              <BookTableButton
                source="blog_footer_cta"
                context="heathrow_visitor"
                size="lg"
                className="!bg-anchor-gold !text-anchor-dark hover:!bg-anchor-gold-light"
              >
                Book a Table
              </BookTableButton>
              <Link href="/food-menu">
                <Button variant="outline" size="lg" className="!text-anchor-gold !border-anchor-gold hover:!bg-anchor-gold hover:!text-anchor-green">
                  View Food Menu
                </Button>
              </Link>
              <Link href="/find-us">
                <Button variant="outline" size="lg" className="!text-anchor-gold !border-anchor-gold hover:!bg-anchor-gold hover:!text-anchor-green">
                  Get Directions
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/find-us">
                <Button variant="outline" size="lg" className="!text-anchor-gold !border-anchor-gold hover:!bg-anchor-gold hover:!text-anchor-green">
                  Get Directions
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline" size="lg" className="!text-anchor-gold !border-anchor-gold hover:!bg-anchor-gold hover:!text-anchor-green">
                  More Stories
                </Button>
              </Link>
            </>
          )}
        </div>
      </Section>
    </>
  )
}
