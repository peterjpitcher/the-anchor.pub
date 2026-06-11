import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Pub Near Sofitel Heathrow | 7 Mins from T5',
  description: 'Traditional British pub just 7 minutes from Sofitel London Heathrow Terminal 5. Escape hotel prices, draught beers, home-cooked food & free parking. Book a table.',
  openGraph: {
    title: 'Pub Near Sofitel Heathrow T5 | 7 Mins Away | The Anchor',
    description: 'Just 7 minutes from Sofitel London Heathrow. Real British pub with home-cooked food, draught beers & free parking. Honest pub pricing.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Sofitel Heathrow Terminal 5' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Sofitel Heathrow T5 | 7 Mins Away | The Anchor',
    description: 'Just 7 minutes from Sofitel London Heathrow. Real British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-sofitel-heathrow'
  }
}

const nearbyHotelSchema = {
  '@context': 'https://schema.org',
  '@type': 'Place',
  '@id': 'https://www.the-anchor.pub/pub-near-sofitel-heathrow#nearby',
  name: 'The Anchor, near Sofitel Heathrow',
  isPartOf: { '@id': 'https://www.the-anchor.pub/#business' },
  nearbyAttractions: [
    { '@type': 'Hotel', name: 'Sofitel London Heathrow', description: '7 minutes away' }
  ]
}

export default function PubNearSofitelHeathrowPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([nearbyHotelSchema]) }}
      />

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Sofitel"
        title="Pub Near Sofitel Heathrow"
        lead="Just 7 minutes from Terminal 5, authentic British pub at half the hotel price"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Sofitel London Heathrow Terminal 5
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at the Sofitel? The Anchor is just 7 minutes away, real British pub food, proper pints, and free parking at a fraction of hotel prices. We&apos;re one of the best pubs near Heathrow Airport for guests who want a proper local experience over hotel dining.
            </p>
          </div>
        </Container>
      </section>

      {/* Key facts */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '7 Minutes', description: 'By taxi from Sofitel Heathrow T5' },
              { title: '~£12–15', description: 'Taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces if you\'re driving' },
              { title: 'Half Price', description: 'vs Sofitel restaurant mains' },
            ].map((fact) => (
              <Card key={fact.title} accent>
                <CardBody className="p-6 text-center">
                  <p className="font-display text-h4 text-ink-strong">{fact.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{fact.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Why The Anchor over Sofitel dining */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Real Pub Experience Near Sofitel Heathrow"
              lead="The Sofitel is one of the finest airport hotels in the world, but for a proper British pub night, The Anchor is your answer."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">What You Get at The Anchor</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Home-cooked British food from £8.99',
                      'Draught beers and lagers',
                      'Warm, unpretentious pub atmosphere',
                      'Dog-friendly beer garden',
                      'No dress code, no pressure',
                      'Full VAT receipts for business expenses',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-accent-text font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Directions from Sofitel T5</h3>
                  <ol className="space-y-2 text-ink-muted list-decimal list-inside">
                    <li>Exit Sofitel, head north on Northern Perimeter Rd</li>
                    <li>Turn left at Stanwell Moor Road</li>
                    <li>Continue to Horton Road</li>
                    <li>The Anchor is on your right</li>
                  </ol>
                  <p className="mt-4 text-sm text-ink font-medium">Postcode for sat-nav: TW19 6AQ</p>
                  <p className="mt-2 text-sm text-ink-muted">Or tell your taxi driver: &quot;The Anchor pub, Stanwell Moor&quot;</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Food highlights */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading title="What Sofitel Guests Order at The Anchor" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {[
                { title: 'Fish & Chips', description: 'Classic British dish, fresh battered cod with chips and mushy peas' },
                { title: 'Sunday Roast', description: 'Traditional roast from £16, a British institution worth experiencing' },
                { title: 'Stone-Baked Pizza', description: 'Authentic stone-baked pizzas from £12, great for sharing' },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Link href="/food-menu">
                <Button variant="outline" size="lg">View Full Menu</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening hours */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading title="Opening Hours" />
            <BusinessHours />
            <Card accent className="mt-6 text-left">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Planning an early flight?</h3>
                <p className="text-ink-muted">We open from noon on weekends and 4pm weekdays. Perfect for a pre-flight dinner the evening before.</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Sofitel London Heathrow?',
            answer: 'The Anchor is approximately 7 minutes by taxi from the Sofitel London Heathrow Terminal 5. The fare is typically £12–15 each way. If you\'re driving a rental car, we have 20 free parking spaces.'
          },
          {
            question: 'Is there a pub walking distance from Sofitel Heathrow?',
            answer: 'The Anchor is not within easy walking distance of the Sofitel (the route is not pedestrian-friendly). However, it\'s just 7 minutes by taxi or Uber. Most guests say the short journey is absolutely worth it.'
          },
          {
            question: 'What food is available near Sofitel Heathrow Terminal 5?',
            answer: 'The Anchor offers a full British pub menu including fish & chips, stone-baked pizza, burgers, Sunday roasts (weekends), and daily specials. Kitchen hours are typically 6–9pm Tuesday–Friday and from noon on weekends.'
          },
          {
            question: 'Do you cater for business travellers from Sofitel?',
            answer: 'Absolutely. We provide full VAT receipts, have free WiFi, and offer a quiet dining room for business meals. Many Heathrow business travellers choose us to escape hotel prices while still having a professional environment.'
          },
          {
            question: 'Can I get a taxi back to Sofitel from The Anchor?',
            answer: 'Yes, our staff can help you call a taxi, or you can use Uber from the pub. The return journey to Sofitel Heathrow Terminal 5 typically takes 7–10 minutes and costs £12–15.'
          },
        ]}
        className="bg-surface"
      />

      <CtaBand
        title="7 Minutes from Sofitel, Worth Every Second"
        copy="Authentic British pub food and draught beers at honest prices. Book a table or just walk in."
      >
        <Link href="/book-table">
          <Button variant="primary" size="lg">Book a Table</Button>
        </Link>
        <Link href={CONTACT.phoneHref}>
          <Button variant="outline" size="lg">Call Us</Button>
        </Link>
        <Link href="/food-menu">
          <Button variant="outline" size="lg">View Menu</Button>
        </Link>
      </CtaBand>
    </>
  )
}
