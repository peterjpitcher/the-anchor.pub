import Link from 'next/link'
import { Button, Container, Section, SectionHeader, FeatureGrid } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { BookTableButton } from '@/components/BookTableButton'

export const metadata: Metadata = {
  title: 'Sustainability | The Anchor - BII Sustainability Champion',
  description: 'Award-winning sustainability practices at The Anchor, Stanwell Moor. BII Sustainability Champion. What we do, why it matters, and what we\'re still working on.',
  keywords: 'sustainable pub near heathrow, bii sustainability champion, eco friendly pub stanwell moor, green pub surrey, sustainable hospitality',
  openGraph: {
    title: 'Sustainability | The Anchor - BII Sustainability Champion',
    description: 'Award-winning sustainability practices at The Anchor, Stanwell Moor. BII Sustainability Champion. What we do, why it matters, and what we\'re still working on.',
  },
  twitter: getTwitterMetadata({
    title: 'Sustainability | The Anchor - BII Sustainability Champion',
    description: 'Award-winning sustainability practices at The Anchor. What we do, why it matters, and what we\'re still working on.',
  }),
  alternates: {
    canonical: './'
  }
}

export default function SustainabilityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Sustainability', url: '/sustainability' }
        ]}
      />

      <HeroWrapper
        route="/sustainability"
        title="Sustainability"
        description="What we do, why it matters, and what we're still working on"
        variant="default"
        tags={[
          { label: 'BII Sustainability Champion', variant: 'success' },
          { label: 'Energy Efficient', variant: 'primary' },
          { label: 'Community Focused', variant: 'default' }
        ]}
        primaryCta={
          <Link href="/near-heathrow">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Visit The Anchor
            </Button>
          </Link>
        }
        secondaryCta={
          <Link href="/beer-garden">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Our Beer Garden
            </Button>
          </Link>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      {/* Intro */}
      <Section background="white" spacing="lg">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-anchor-cream-text/70 leading-relaxed">
              We take our environmental responsibilities seriously &mdash; not because it&rsquo;s a marketing opportunity,
              but because it&rsquo;s the right thing to do. Here&rsquo;s what we&rsquo;re doing, what it means in practice,
              and what we&rsquo;re not claiming.
            </p>
          </div>
        </Container>
      </Section>

      {/* BII Sustainability Champion */}
      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="BII Sustainability Champion"
            />
            <div className="bg-anchor-bg-card rounded-2xl p-8 shadow-sm border border-anchor-gold/15">
              <p className="text-anchor-cream-text/70 mb-4">
                The British Institute of Innkeeping (BII) is the UK&rsquo;s leading professional body for the licensed
                hospitality industry. They recognised The Anchor as a Sustainability Champion &mdash; an award that
                reflects an independent evaluation of our environmental practices and investments.
              </p>
              <p className="text-anchor-cream-text/70">
                This isn&rsquo;t a badge we bought. It&rsquo;s recognition that the steps we&rsquo;ve taken &mdash; from
                how we cool our cellar to how we clean our beer lines &mdash; meet a genuine standard. We&rsquo;re proud
                of it, and we intend to keep earning it.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* What We Do */}
      <section className="section-spacing bg-anchor-bg">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="What we do"
              subtitle="Three technologies that make a practical difference"
            />

            <div className="space-y-6">
              {/* FlowMaster */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-3">FlowMaster</h3>
                <p className="text-anchor-cream-text/70 mb-4">
                  A system that reduces how often our beer lines need cleaning, and uses less water and fewer chemicals
                  when they are cleaned.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-anchor-bg-card rounded-xl p-4 border border-anchor-gold/15">
                    <p className="text-sm font-semibold text-anchor-gold-vivid mb-1">For the environment</p>
                    <p className="text-sm text-anchor-cream-text/70">Less water waste, fewer chemicals going down the drain.</p>
                  </div>
                  <div className="bg-anchor-bg-card rounded-xl p-4 border border-anchor-gold/15">
                    <p className="text-sm font-semibold text-anchor-gold-vivid mb-1">For you</p>
                    <p className="text-sm text-anchor-cream-text/70">
                      Fresher, consistently well-kept draught beer. Cleaner lines mean better pints.
                    </p>
                  </div>
                </div>
              </div>

              {/* SmartCellar */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-3">SmartCellar</h3>
                <p className="text-anchor-cream-text/70 mb-4">
                  A smarter cellar cooling system that adjusts to what&rsquo;s actually needed, rather than running at
                  full power all the time.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-anchor-bg-card rounded-xl p-4 border border-anchor-gold/15">
                    <p className="text-sm font-semibold text-anchor-gold-vivid mb-1">For the environment</p>
                    <p className="text-sm text-anchor-cream-text/70">Approximately 35% reduction in cellar cooling energy use.</p>
                  </div>
                  <div className="bg-anchor-bg-card rounded-xl p-4 border border-anchor-gold/15">
                    <p className="text-sm font-semibold text-anchor-gold-vivid mb-1">For you</p>
                    <p className="text-sm text-anchor-cream-text/70">Consistently well-chilled beer, served at the right temperature.</p>
                  </div>
                </div>
              </div>

              {/* SmartRemote */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-3">SmartRemote</h3>
                <p className="text-anchor-cream-text/70 mb-4">
                  Remote cooler technology for bar equipment that works more efficiently than conventional units.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-anchor-bg-card rounded-xl p-4 border border-anchor-gold/15">
                    <p className="text-sm font-semibold text-anchor-gold-vivid mb-1">For the environment</p>
                    <p className="text-sm text-anchor-cream-text/70">Approximately 33% reduction in energy use for remote cooling units.</p>
                  </div>
                  <div className="bg-anchor-bg-card rounded-xl p-4 border border-anchor-gold/15">
                    <p className="text-sm font-semibold text-anchor-gold-vivid mb-1">For you</p>
                    <p className="text-sm text-anchor-cream-text/70">Cold drinks served consistently, every time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* In the Community */}
      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="In the community"
            />

            <FeatureGrid
              columns={2}
              features={[
                {
                  icon: '',
                  title: 'Earth Day Clean-ups',
                  description: 'We take part in Earth Day community clean-ups with the Stanwell Moor Residents Association, helping keep the local area tidy.',
                  className: 'text-center'
                },
                {
                  icon: '',
                  title: 'Honey Bee Mine',
                  description: 'A bee-friendly initiative supporting pollinators in the local area, as part of our wider commitment to the community and environment.',
                  className: 'text-center'
                }
              ]}
            />
          </div>
        </Container>
      </section>

      {/* What We're Not Claiming */}
      <section className="section-spacing bg-anchor-bg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="What we're not claiming"
            />
            <div className="bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15">
              <p className="text-anchor-cream-text/70 leading-relaxed">
                We&rsquo;re not a zero-carbon pub. We&rsquo;re not done. We&rsquo;re a busy community pub and
                we&rsquo;re taking the steps we can, while running a business that serves our local community.
                We&rsquo;ll keep making progress.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* What You'll Notice */}
      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="What you'll notice as a guest"
            />

            <FeatureGrid
              columns={2}
              features={[
                {
                  icon: '',
                  title: 'Consistently Good Draught Beer',
                  description: 'Cleaner, more efficient systems make for better-kept beer. You can taste the difference.',
                  className: 'text-center'
                },
                {
                  icon: '',
                  title: 'A Pub That Thinks Long-Term',
                  description: 'We think about more than just today. The choices we make now are about building something that lasts.',
                  className: 'text-center'
                }
              ]}
            />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'Has The Anchor won a sustainability award?',
            answer: 'Yes — we\'re a BII Sustainability Champion. The BII (British Institute of Innkeeping) is the UK\'s leading professional body for the licensed hospitality sector, and this recognition reflects our investment in environmental technology and practice.'
          },
          {
            question: 'What is FlowMaster?',
            answer: 'FlowMaster reduces how frequently we need to clean beer lines and uses less water and chemicals when we do. The result is less environmental impact — and consistently fresher draught beer for our guests.'
          },
          {
            question: 'Do you have any community environmental initiatives?',
            answer: 'Yes. We take part in Earth Day community clean-ups in Stanwell Moor with the local residents association, and we support the Honey Bee Mine initiative to encourage local biodiversity.'
          },
          {
            question: 'Are you a sustainable pub?',
            answer: 'We\'ve invested in energy-efficient technology and won recognition for it. We also know we\'re not perfect and we\'re still learning. We\'re committed to making improvements where we can.'
          }
        ]}
        className="bg-anchor-bg"
      />

      {/* CTA */}
      <section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Come and See for Yourself
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Good beer, honest food, and a pub that&rsquo;s trying to do the right thing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="sustainability_cta"
                size="lg"
                variant="secondary"
                className="bg-anchor-bg-card text-anchor-gold-vivid hover:bg-anchor-bg-raised"
              />
              <Link href="/near-heathrow">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  How to Find Us
                </Button>
              </Link>
              <Link href="/beer-garden">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  Our Beer Garden
                </Button>
              </Link>
            </div>
            <p className="text-white/80 mt-8 text-sm">
              BII Sustainability Champion &bull; Stanwell Moor, near Heathrow &bull; Free parking
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
