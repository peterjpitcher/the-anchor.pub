import Link from 'next/link'
import { Button, Card, CardBody, Container, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'

export const metadata: Metadata = {
  title: 'Sustainability | BII Sustainability Champion',
  description: 'Award-winning sustainability practices at The Anchor, Stanwell Moor. BII Sustainability Champion. What we do, why it matters, and what we\'re still working on.',
  openGraph: {
    title: 'Sustainability | The Anchor - BII Sustainability Champion',
    description: 'Award-winning sustainability practices at The Anchor, Stanwell Moor. BII Sustainability Champion. What we do, why it matters, and what we\'re still working on.',
    images: [
      {
        url: '/images/page-headers/home/page-headers-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'The Anchor in Stanwell Moor',
      },
    ],
  },
  twitter: getTwitterMetadata({
    title: 'Sustainability | The Anchor - BII Sustainability Champion',
    description: 'Award-winning sustainability practices at The Anchor. What we do, why it matters, and what we\'re still working on.',
  }),
  alternates: {
    canonical: '/sustainability'
  }
}

export default function SustainabilityPage() {
  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Sustainability"
        title="Sustainability"
        lead="What we do, why it matters, and what we're still working on"
      />

      {/* Intro */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-ink-muted leading-relaxed">
              We take our environmental responsibilities seriously, not because it&rsquo;s a marketing opportunity,
              but because it&rsquo;s the right thing to do. Here&rsquo;s what we&rsquo;re doing, what it means in practice,
              and what we&rsquo;re not claiming.
            </p>
          </div>
        </Container>
      </section>

      {/* BII Sustainability Champion */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="BII Sustainability Champion"
              align="left"
            />
            <Card accent>
              <CardBody className="p-8">
              <p className="text-ink-muted mb-4">
                The British Institute of Innkeeping (BII) is the UK&rsquo;s leading professional body for the licensed
                hospitality industry. They recognised The Anchor as a Sustainability Champion, an award that
                reflects an independent evaluation of our environmental practices and investments.
              </p>
              <p className="text-ink-muted">
                This isn&rsquo;t a badge we bought. It&rsquo;s recognition that the steps we&rsquo;ve taken, from
                how we cool our cellar to how we clean our beer lines, meet a genuine standard. We&rsquo;re proud
                of it, and we intend to keep earning it.
              </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* What We Do */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="What we do"
              lead="Three technologies that make a practical difference"
              align="left"
            />

            <div className="space-y-6">
              {/* FlowMaster */}
              <Card>
                <CardBody className="p-8">
                <h3 className="text-xl text-ink-strong mb-3">FlowMaster</h3>
                <p className="text-ink-muted mb-4">
                  A system that reduces how often our beer lines need cleaning, and uses less water and fewer chemicals
                  when they are cleaned.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-surface-sunk rounded-md p-4 border border-line">
                    <p className="text-sm font-semibold text-accent-text mb-1">For the environment</p>
                    <p className="text-sm text-ink-muted">Less water waste, fewer chemicals going down the drain.</p>
                  </div>
                  <div className="bg-surface-sunk rounded-md p-4 border border-line">
                    <p className="text-sm font-semibold text-accent-text mb-1">For you</p>
                    <p className="text-sm text-ink-muted">
                      Fresher, consistently well-kept draught beer. Cleaner lines mean better pints.
                    </p>
                  </div>
                </div>
                </CardBody>
              </Card>

              {/* SmartCellar */}
              <Card>
                <CardBody className="p-8">
                <h3 className="text-xl text-ink-strong mb-3">SmartCellar</h3>
                <p className="text-ink-muted mb-4">
                  A smarter cellar cooling system that adjusts to what&rsquo;s actually needed, rather than running at
                  full power all the time.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-surface-sunk rounded-md p-4 border border-line">
                    <p className="text-sm font-semibold text-accent-text mb-1">For the environment</p>
                    <p className="text-sm text-ink-muted">Approximately 35% reduction in cellar cooling energy use.</p>
                  </div>
                  <div className="bg-surface-sunk rounded-md p-4 border border-line">
                    <p className="text-sm font-semibold text-accent-text mb-1">For you</p>
                    <p className="text-sm text-ink-muted">Consistently well-chilled beer, served at the right temperature.</p>
                  </div>
                </div>
                </CardBody>
              </Card>

              {/* SmartRemote */}
              <Card>
                <CardBody className="p-8">
                <h3 className="text-xl text-ink-strong mb-3">SmartRemote</h3>
                <p className="text-ink-muted mb-4">
                  Remote cooler technology for bar equipment that works more efficiently than conventional units.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-surface-sunk rounded-md p-4 border border-line">
                    <p className="text-sm font-semibold text-accent-text mb-1">For the environment</p>
                    <p className="text-sm text-ink-muted">Approximately 33% reduction in energy use for remote cooling units.</p>
                  </div>
                  <div className="bg-surface-sunk rounded-md p-4 border border-line">
                    <p className="text-sm font-semibold text-accent-text mb-1">For you</p>
                    <p className="text-sm text-ink-muted">Cold drinks served consistently, every time.</p>
                  </div>
                </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* In the Community */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="In the community"
              align="left"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <Card accent hover>
                <CardBody className="text-center">
                  <h3 className="text-lg text-ink-strong mb-2">Earth Day Clean-ups</h3>
                  <p className="text-ink-muted">We take part in Earth Day community clean-ups with the Stanwell Moor Residents Association, helping keep the local area tidy.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody className="text-center">
                  <h3 className="text-lg text-ink-strong mb-2">Honey Bee Mine</h3>
                  <p className="text-ink-muted">A bee-friendly initiative supporting pollinators in the local area, as part of our wider commitment to the community and environment.</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* What We're Not Claiming */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading
              title="What we're not claiming"
              align="left"
            />
            <Card accent>
              <CardBody className="p-8">
              <p className="text-ink-muted leading-relaxed">
                We&rsquo;re not a zero-carbon pub. We&rsquo;re not done. We&rsquo;re a busy community pub and
                we&rsquo;re taking the steps we can, while running a business that serves our local community.
                We&rsquo;ll keep making progress.
              </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* What You'll Notice */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="What you'll notice as a guest"
              align="left"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <Card accent hover>
                <CardBody className="text-center">
                  <h3 className="text-lg text-ink-strong mb-2">Consistently Good Draught Beer</h3>
                  <p className="text-ink-muted">Cleaner, more efficient systems make for better-kept beer. You can taste the difference.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody className="text-center">
                  <h3 className="text-lg text-ink-strong mb-2">A Pub That Thinks Long-Term</h3>
                  <p className="text-ink-muted">We think about more than just today. The choices we make now are about building something that lasts.</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'Has The Anchor won a sustainability award?',
            answer: 'Yes, we\'re a BII Sustainability Champion. The BII (British Institute of Innkeeping) is the UK\'s leading professional body for the licensed hospitality sector, and this recognition reflects our investment in environmental technology and practice.'
          },
          {
            question: 'What is FlowMaster?',
            answer: 'FlowMaster reduces how frequently we need to clean beer lines and uses less water and chemicals when we do. The result is less environmental impact, and consistently fresher draught beer for our guests.'
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
      />

      {/* CTA */}
      <CtaBand
        title="Come and See for Yourself"
        copy="Good beer, honest food, and a pub that's trying to do the right thing."
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <BookTableButton source="sustainability_cta" size="lg" variant="primary" />
            <Button asChild size="lg" variant="outline">
              <Link href="/near-heathrow">How to Find Us</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/beer-garden">Our Beer Garden</Link>
            </Button>
          </div>
          <p className="text-sm text-anchor-cream-text/70">
            BII Sustainability Champion &bull; Stanwell Moor, near Heathrow &bull; Free parking
          </p>
        </div>
      </CtaBand>
    </>
  )
}
