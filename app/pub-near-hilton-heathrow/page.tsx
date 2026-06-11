import Link from 'next/link'
import { Button, Badge, Card, CardBody, SectionHeading, Container } from '@/components/ui'
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
  title: 'Pub Near Hilton Heathrow | 10 Mins | Free Parking',
  description: 'Traditional British pub 10 minutes from Hilton London Heathrow Airport. Draught beers, home-cooked food & free parking. Ideal for business travellers. Book a table.',
  openGraph: {
    title: 'Pub Near Hilton Heathrow | 10 Mins | Free Parking | The Anchor',
    description: '10 minutes from Hilton London Heathrow. Traditional British pub with home-cooked food, draught beers & free parking. Perfect for business travellers.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Hilton London Heathrow Airport' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Hilton Heathrow | 10 Mins | Free Parking | The Anchor',
    description: '10 minutes from Hilton Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-hilton-heathrow'
  }
}

export default function PubNearHiltonHeathrowPage() {
  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Hilton"
        title="Pub Near Hilton Heathrow"
        lead="10 minutes away, a proper British pub for business travellers and leisure guests alike"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Hilton London Heathrow Airport
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at the Hilton Heathrow? The Anchor is just 10 minutes away, a traditional British pub with home-cooked food, draught beers, and free parking. Popular with business travellers looking to escape hotel prices, we&apos;re one of the top-rated restaurants near Heathrow for guests who want something better than the hotel bar.
            </p>
          </div>
        </Container>
      </section>

      {/* Key facts */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '10 Minutes', description: 'By taxi from Hilton Heathrow' },
              { title: '~£12–15', description: 'Taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces, no charges' },
              { title: 'VAT Receipts', description: 'Full receipts for expenses' },
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

      {/* Business traveller section */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="The Business Traveller's Favourite Near Hilton Heathrow"
              lead="Many Hilton guests are here on business. The Anchor is the local choice for client dinners, team meals, and unwinding after a long day of meetings."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Business-Friendly Features</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Full VAT receipts for all purchases',
                      'Free WiFi throughout the pub',
                      'Quieter dining room for business meals',
                      'Group bookings for team dinners',
                      'Private hire options available',
                      'Flexible timing for early or late dining',
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
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Directions from Hilton Heathrow</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">From Hilton T4 (Terminal 4)</p>
                      <p className="text-sm">Head north on Stanwell Moor Road, continue to Horton Road. 10–12 mins.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">From Hilton Garden Inn T2/T3</p>
                      <p className="text-sm">Head west on Bath Road, right onto Stanwell Moor Road. 12–14 mins.</p>
                    </div>
                    <div className="pt-2 border-t border-line">
                      <p className="text-sm font-medium text-ink">Postcode: <strong>TW19 6AQ</strong></p>
                      <p className="text-sm text-ink-muted">Uber and local taxis readily available from Hilton reception</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Food for business */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading title="Food & Drink at The Anchor" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {[
                { title: 'Classic Mains', description: 'From £8.99, steaks, fish & chips, burgers and British classics cooked fresh daily' },
                { title: 'Draught Beers', description: 'Wide selection of beers, wines and spirits, a proper British pint from £4.80' },
                { title: 'Wine & Spirits', description: 'Quality wines, premium spirits and cocktails, all at pub prices' },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
            <Card variant="dark" accent className="theme-dark">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-anchor-gold-bright mb-3 text-center">Client Dinner at The Anchor</h3>
                <div className="grid md:grid-cols-3 gap-4 text-center text-sm text-anchor-cream-text/80">
                  <div>
                    <p className="font-semibold mb-1 text-anchor-cream-text">Atmosphere</p>
                    <p>Relaxed but professional, great for building relationships</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1 text-anchor-cream-text">Cost</p>
                    <p>Honest pub pricing with mains from £8.99</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1 text-anchor-cream-text">Booking</p>
                    <p>Recommended for groups of 6+, call us to arrange</p>
                  </div>
                </div>
              </CardBody>
            </Card>
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
                <h3 className="font-display text-h4 text-ink-strong mb-2">Group &amp; private dining</h3>
                <p className="text-ink-muted">
                  For groups of 6 or more, call us in advance so we can prepare a table.
                  Private room hire is also available for larger events.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Hilton London Heathrow Airport?',
            answer: 'The Anchor is approximately 10–12 minutes by taxi from Hilton London Heathrow Airport Terminal 4. The taxi fare is typically £12–15 each way. If you have a rental car, we offer 20 free parking spaces.'
          },
          {
            question: 'Is there a good pub near Hilton Heathrow for business dinners?',
            answer: 'The Anchor is well-suited to business dinners. We provide full VAT receipts, have a quieter dining room away from the main bar, offer free WiFi, and can arrange group bookings. Many Hilton guests use us for client meals and team dinners.'
          },
          {
            question: 'What restaurants are near Hilton Heathrow?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub-restaurant to the Hilton Heathrow hotels, just 10–12 minutes away. We serve traditional British food including fish & chips, steaks, burgers, and Sunday roasts.'
          },
          {
            question: 'Can I get a taxi from Hilton Heathrow to The Anchor?',
            answer: 'Yes, ask the Hilton concierge to arrange a taxi, or use Uber. The journey takes about 10–12 minutes. Alternatively, if you\'ve got a rental car, you can drive and park free at the pub (postcode TW19 6AQ).'
          },
          {
            question: 'Do you provide receipts for business expenses?',
            answer: 'Yes, we provide full itemised VAT receipts for all meals and drinks. The Anchor is an expense-friendly alternative for business travellers.'
          },
        ]}
        className="bg-surface"
      />

      <CtaBand
        title="10 Minutes from Hilton Heathrow"
        copy="Traditional British pub with home-cooked food, draught beers and free parking. Perfect for business or leisure."
      >
        <Link href="/book-table">
          <Button variant="primary" size="lg">Book a Table</Button>
        </Link>
        <Link href={CONTACT.phoneHref}>
          <Button variant="outline" size="lg">Call Us</Button>
        </Link>
        <Link href="/private-hire">
          <Button variant="outline" size="lg">Private Hire</Button>
        </Link>
      </CtaBand>
    </>
  )
}
