import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Container, Section } from '@/components/ui/layout/Container'
import { Breadcrumb } from '@/components/ui/navigation/Breadcrumb'
import { Grid } from '@/components/ui/layout/Grid'
import { BlogShareButtons } from '@/components/BlogShareButtons'
import { getBlogHeroUrl } from '@/lib/blog-image'
import { jsonLdSafeStringify } from '@/lib/jsonld'

interface BlogPostProps {
  post: {
    title: string
    description: string
    date: string
    author: string
    hero?: string
    slug: string
    tags: string[]
    htmlContent?: string
  }
  prevPost?: { title: string; slug: string } | null
  nextPost?: { title: string; slug: string } | null
}

export function BlogPost({ post, prevPost, nextPost }: BlogPostProps) {
  const breadcrumbItems = [
    { label: 'Blog', href: '/blog' },
    { label: post.title, current: true }
  ]

  const heroUrl = getBlogHeroUrl(post.slug, post.hero)

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-end mt-20">
        <div className="absolute inset-0">
          <Image
            src={heroUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        
        <Container className="relative z-10 pb-12">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="default"
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                >
                  <Link href={`/blog/tag/${tag}`}>
                    {tag}
                  </Link>
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <span>{post.author}</span>
              <span>•</span>
              <time>{new Date(post.date).toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</time>
            </div>
          </div>
        </Container>
      </section>

      {/* Breadcrumb */}
      <Section spacing="none" className="py-4 bg-anchor-bg-raised">
        <Container>
          <Breadcrumb items={breadcrumbItems} />
        </Container>
      </Section>

      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.description,
            "datePublished": post.date,
            "dateModified": post.date,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "The Anchor",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.the-anchor.pub/images/branding/the-anchor-pub-logo-black-transparent.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://www.the-anchor.pub/blog/${post.slug}`
            },
            "image": heroUrl.startsWith('http')
              ? heroUrl
              : `https://www.the-anchor.pub${heroUrl}`,
            "keywords": post.tags.join(", ")
          })
        }}
      />

      {/* Content */}
      <article className="bg-anchor-bg">
        <Section>
          <Container size="md">
            <div 
              className="
                prose prose-lg lg:prose-xl max-w-none
                
                /* Headings */
                prose-headings:font-serif
                prose-headings:text-anchor-cream-text
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3
                
                /* Paragraphs */
                prose-p:text-anchor-cream-text/70 prose-p:leading-relaxed
                prose-p:mb-6
                
                /* Links */
                prose-a:text-anchor-gold prose-a:font-semibold
                prose-a:no-underline hover:prose-a:underline
                prose-a:transition-colours hover:prose-a:text-anchor-gold-light
                
                /* Strong/Bold */
                prose-strong:text-anchor-cream-text prose-strong:font-bold
                
                /* Lists */
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-anchor-cream-text/70 prose-li:mb-2
                
                /* Images */
                prose-img:rounded-lg prose-img:shadow-lg
                prose-img:my-8 prose-img:w-full
                prose-figure:my-8
                
                /* Blockquotes */
                prose-blockquote:border-l-4 prose-blockquote:border-anchor-gold
                prose-blockquote:pl-6 prose-blockquote:italic
                prose-blockquote:text-anchor-cream-text/70 prose-blockquote:my-8
                
                /* Code */
                prose-code:bg-anchor-bg-raised prose-code:px-2 prose-code:py-1
                prose-code:rounded prose-code:text-sm
                prose-pre:bg-gray-900 prose-pre:text-gray-100
                
                /* Tables */
                prose-table:my-8
                prose-th:bg-anchor-green prose-th:text-white
                prose-th:font-semibold prose-th:px-6 prose-th:py-3
                prose-td:border prose-td:border-anchor-gold/15
                prose-td:px-6 prose-td:py-3
                
                /* HR */
                prose-hr:border-anchor-gold/15 prose-hr:my-12
              "
              dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
            />
          </Container>
        </Section>
      </article>

      {/* Share Section */}
      <Section spacing="sm" className="bg-anchor-bg-raised">
        <Container size="md" className="text-center">
          <p className="text-anchor-cream-text/70 mb-4">Enjoyed this article? Share it with your friends!</p>
          <BlogShareButtons postTitle={post.title} postSlug={post.slug} />
        </Container>
      </Section>

      {/* Navigation */}
      <Section className="bg-anchor-bg">
        <Container size="lg">
          <Grid cols={2} gap="md">
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className="group">
                <Card variant="default" className="hover:shadow-md transition-shadow">
                  <CardBody>
                    <p className="text-sm text-anchor-cream-text/70 mb-2">← Previous Post</p>
                    <h3 className="text-lg font-bold text-anchor-cream-text group-hover:text-anchor-gold transition-colours">
                      {prevPost.title}
                    </h3>
                  </CardBody>
                </Card>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group md:text-right">
                <Card variant="default" className="hover:shadow-md transition-shadow">
                  <CardBody>
                    <p className="text-sm text-anchor-cream-text/70 mb-2">Next Post →</p>
                    <h3 className="text-lg font-bold text-anchor-cream-text group-hover:text-anchor-gold transition-colours">
                      {nextPost.title}
                    </h3>
                  </CardBody>
                </Card>
              </Link>
            )}
          </Grid>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-anchor-green text-white">
        <Container className="text-center">
          <h2 className="text-3xl font-bold mb-8">
            Visit The Anchor Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience everything we write about firsthand. Join us for great food, drinks, and atmosphere!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary"
              size="lg"
              className="bg-anchor-gold text-anchor-charcoal hover:bg-anchor-gold-light"
              onClick={() => window.location.href = '/find-us'}
            >
              Get Directions
            </Button>
            <Button 
              variant="secondary"
              size="lg"
              className="bg-anchor-gold text-anchor-charcoal hover:bg-anchor-gold-light"
              onClick={() => window.location.href = '/blog'}
            >
              More Stories
            </Button>
          </div>
        </Container>
      </Section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.description,
            "image": `https://www.the-anchor.pub/content/blog/${post.slug}/${post.hero}`,
            "datePublished": post.date,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "The Anchor",
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
