import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPost, getAllBlogPosts, getIndexableBlogPosts, distributeImages } from '@/lib/markdown'
import { Badge, Button, Card, Container } from '@/components/ui'
import { Metadata } from 'next'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { BlogShareButtons } from '@/components/BlogShareButtons'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { InteriorHero } from '@/components/hero'
import { getBlogHeroUrl } from '@/lib/blog-image'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { PlaneSpottingBookingPrompt } from '@/components/plane-spotting/PlaneSpottingBookingPrompt'
import { PlaneSpottingScheduleNote } from '@/components/plane-spotting/PlaneSpottingScheduleNote'
import { VisitPlannerPanel } from '@/components/conversion/VisitPlannerPanel'
import { shouldShowVisitPlannerPanel } from '@/components/conversion/visit-planner-config'
import type { OrganicSearchClusterKey } from '@/lib/seo/organic-search-map'
import { stripBrandSuffix } from '@/lib/metadata/strip-brand-suffix'
import { getRelatedPosts } from '@/lib/blog/related-posts'

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
  // Christmas has to be tested before the dining, events and party branches
  // below, because slugs like work-christmas-party-ideas-near-heathrow contain
  // "party" and would otherwise be routed to the private hire cluster.
  if (
    lowerSlug.includes('christmas') ||
    lowerSlug.includes('xmas') ||
    lowerSlug.includes('festive')
  ) {
    return 'christmas'
  }
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
    // Front matter often ends with the brand; the root template adds it too.
    title: stripBrandSuffix(post.title),
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
  // Topically related posts, scored on shared tags. Previous/next below is
  // chronological, which links a post to whatever happened to be published
  // either side of it; this is the link that is actually about the same thing.
  const relatedPosts = getRelatedPosts(post, navigationPosts, 4)

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
  // WP5: additive inline "plan your visit" conversion panel for high-intent
  // plane-spotting / Heathrow-travel posts. Allow-list lives in
  // components/conversion/visit-planner-config.ts (slug list or `visitPlanner`
  // frontmatter flag). Read the frontmatter flag leniently so it does not
  // require a BlogPost type change to opt a post in.
  const visitPlannerFrontmatterFlag = (post as { visitPlanner?: unknown }).visitPlanner
  const showVisitPlannerPanel = shouldShowVisitPlannerPanel(post.slug, visitPlannerFrontmatterFlag)
  const isPlaneSpottingPost = organicSearchCluster === 'planeSpotting'

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
      <ScrollDepthTracker/>
      {organicSearchCluster === 'planeSpotting' ? (
        <PlaneSpottingBookingPrompt source="blog_plane_spotting_prompt" />
      ) : null}
      {/* Hero Section */}
      <InteriorHero
        image={heroUrl}
        crumb="Blog"
        title={post.title}
        lead={post.description}
        badges={
          <>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="sand">{tag}</Badge>
            ))}
          </>
        }
      />

      {/* Breadcrumb */}
      <section className="py-3 bg-surface-sunk border-b border-line">
        <Container>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <Link href="/" className="hover:text-accent-text">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-accent-text">Blog</Link>
            <span>/</span>
            <span className="text-ink-strong font-semibold">{post.title}</span>
          </nav>
        </Container>
      </section>

      {/* Content */}
      <article className="py-section-y bg-canvas">
        <Container>
          <div className="prose prose-lg lg:prose-xl mx-auto prose-headings:font-display prose-headings:font-normal prose-headings:text-ink-strong prose-h2:text-h3 prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-h4 prose-h3:mt-10 prose-h3:mb-4 prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3 prose-p:text-ink prose-p:leading-relaxed prose-p:mb-6 prose-a:text-accent-text prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-colors hover:prose-a:text-link-hover prose-strong:text-ink-strong prose-strong:font-semibold prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-ink prose-li:mb-2 prose-img:rounded-md prose-img:shadow-sm prose-img:ring-1 prose-img:ring-line prose-img:my-8 prose-img:w-full prose-img:max-w-full prose-img:mx-auto sm:prose-img:max-w-xl lg:prose-img:max-w-[420px] xl:prose-img:max-w-[460px] prose-figure:my-8 prose-figure:mx-auto prose-figure:max-w-full sm:prose-figure:max-w-xl lg:prose-figure:max-w-[420px] xl:prose-figure:max-w-[460px] prose-blockquote:border-l-4 prose-blockquote:border-anchor-gold prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-ink-muted prose-blockquote:my-8 prose-code:bg-surface-sunk prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-surface-sunk prose-pre:text-ink prose-table:my-8 prose-th:bg-surface-sunk prose-th:text-ink-strong prose-th:font-semibold prose-th:px-6 prose-th:py-3 prose-td:border prose-td:border-line prose-td:px-6 prose-td:py-3 prose-td:text-ink prose-hr:border-line prose-hr:my-12 max-w-none">
            <div dangerouslySetInnerHTML={{ __html: contentWithImages }} />
          </div>
        </Container>
      </article>

      {/* WP5: Inline "plan your visit" conversion panel (additive, allow-listed) */}
      {showVisitPlannerPanel && (
        <VisitPlannerPanel
          source="blog_visit_planner_panel"
          showScheduleNote={isPlaneSpottingPost}
        />
      )}

      {/* Heathrow / Plane-Spotting Booking CTA, only shown for relevant posts */}
      {showHeathrowCta && (
        <section className="py-section-y bg-surface border-y border-line">
          <Container>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <h2 className="font-display text-h4 text-ink-strong mb-2">
                  Visiting Heathrow? The Anchor is 5 minutes away
                </h2>
                <p className="text-ink-muted">
                  Book a table for lunch in our beer garden, great food, cold drinks, and a proper base for a day of spotting.
                </p>
                {organicSearchCluster === 'planeSpotting' ? (
                  <PlaneSpottingScheduleNote variant="compact" className="mt-3" />
                ) : null}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <BookTableButton source="blog_heathrow_cta" context="heathrow_visitor" size="md">
                  Book a Table
                </BookTableButton>
                <Link href="/food-menu">
                  <Button variant="outline" size="md">
                    View Food Menu
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Share Section */}
      <section className="py-section-y bg-surface-sunk border-b border-line">
        <Container>
          <div className="text-center">
            <p className="text-ink-muted mb-4">Enjoyed this article? Share it with your friends!</p>
            <BlogShareButtons postTitle={post.title} postSlug={post.slug} />
          </div>
        </Container>
      </section>

      {/* Related reading, scored on shared tags */}
      {relatedPosts.length > 0 && (
        <section className="py-section-y bg-surface border-b border-line">
          <Container>
            <h2 className="font-display text-h3 text-ink-strong mb-6">More like this</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="group">
                  <Card hover className="h-full p-6">
                    <h3 className="font-display text-h4 text-ink-strong group-hover:text-accent-text transition-colors">
                      {related.title}
                    </h3>
                    {related.description && (
                      <p className="mt-2 text-sm text-ink-muted line-clamp-3">{related.description}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Navigation */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="grid md:grid-cols-2 gap-6">
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className="group">
                <Card hover className="h-full p-6">
                  <p className="text-sm text-ink-muted mb-2">← Previous Post</p>
                  <h3 className="font-display text-h4 text-ink-strong group-hover:text-accent-text transition-colors">
                    {prevPost.title}
                  </h3>
                </Card>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group md:text-right">
                <Card hover className="h-full p-6">
                  <p className="text-sm text-ink-muted mb-2">Next Post →</p>
                  <h3 className="font-display text-h4 text-ink-strong group-hover:text-accent-text transition-colors">
                    {nextPost.title}
                  </h3>
                </Card>
              </Link>
            )}
          </div>
        </Container>
      </section>

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
        className="py-section-y"
      />

      {/* CTA Section */}
      <section className="theme-dark bg-anchor-green [.theme-dark_&]:bg-anchor-green-raised py-section-y">
        <Container className="text-center text-anchor-cream-text">
          <h2 className="text-h2 text-anchor-cream-text mb-8">
            Visit The Anchor Today
          </h2>
          <p className="text-xl mb-8 mx-auto text-anchor-cream-text/85">
            Experience everything we write about firsthand. Join us for great food, drinks, and atmosphere!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showHeathrowCta ? (
              <>
                <BookTableButton
                  source="blog_footer_cta"
                  context="heathrow_visitor"
                  size="lg"
                >
                  Book a Table
                </BookTableButton>
                <Link href="/food-menu">
                  <Button variant="outline" size="lg">
                    View Food Menu
                  </Button>
                </Link>
                <Link href="/find-us">
                  <Button variant="outline" size="lg">
                    Get Directions
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/find-us">
                  <Button variant="outline" size="lg">
                    Get Directions
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button variant="outline" size="lg">
                    More Stories
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  )
}
