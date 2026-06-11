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
  title: 'Pub Near Crowne Plaza Heathrow | 12 Mins | Free Parking',
  description: 'Traditional British pub 12 minutes from Crowne Plaza London Heathrow. Draught beers, home-cooked food & free parking. The ideal local for corporate guests.',
  openGraph: {
    title: 'Pub Near Crowne Plaza Heathrow | 12 Mins | Free Parking',
    description: '12 minutes from Crowne Plaza London Heathrow. Traditional British pub with home-cooked food, draught beers & free parking. Great for corporate dining.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Crowne Plaza Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Crowne Plaza Heathrow | 12 Mins | Free Parking',
    description: '12 minutes from Crowne Plaza Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-crowne-plaza-heathrow'
  }
}

export default function PubNearCrownePlazaHeathrowPage() {
  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Crowne Plaza"
        title="Pub Near Crowne Plaza Heathrow"
        lead="12 minutes away, a proper British pub for corporate guests and team dinners"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Crowne Plaza London Heathrow
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at the Crowne Plaza Heathrow? The Anchor is just 12 minutes away, a traditional British pub with home-cooked food, draught beers, and free parking. Rated one of the best pubs near Heathrow Airport, we offer a proper alternative to hotel dining that corporate guests keep coming back to.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '12 Minutes', description: 'By taxi from Crowne Plaza Heathrow' },
              { title: '~£15–18', description: 'Typical taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces, no charges' },
              { title: 'Group Bookings', description: 'Private dining for teams of any size' },
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

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Corporate Dining Near Crowne Plaza Heathrow"
              lead="The Crowne Plaza is a favourite for international business travellers. When you need a proper dinner that isn't a hotel restaurant, The Anchor offers the perfect alternative, relaxed, professional, and genuinely British."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Why Corporate Guests Choose Us</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Full VAT receipts for all purchases',
                      'Private dining room for team events',
                      'Free WiFi, work while you eat',
                      'Group bookings taken in advance',
                      'Quieter than the hotel bar',
                      'Honest pub pricing with mains from £8.99',
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
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Getting Here from Crowne Plaza</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">By Taxi or Uber</p>
                      <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Journey takes approximately 12 minutes, £15–18 each way.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">By Car</p>
                      <p className="text-sm">Join the A3044 heading south toward Stanwell. Continue through Stanwell village, turn right onto Horton Road. The Anchor is on your left.</p>
                    </div>
                    <div className="pt-2 border-t border-line">
                      <p className="text-sm font-medium text-ink">Sat-nav postcode: <strong>TW19 6AQ</strong></p>
                      <p className="text-sm text-ink-muted">Free parking for all pub guests</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading title="Menu Highlights" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {[
                { title: 'British Classics', description: 'Steaks, fish & chips, burgers and daily specials, all cooked fresh from £8.99' },
                { title: 'Great Drinks', description: 'Draught lagers, bottled ales and craft beers, proper pub drinking from £4.80 a pint' },
                { title: 'Sunday Roast', description: 'Traditional British roast from £16, walk in or book ahead' },
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
                <Button variant="outline" size="lg">View Full Menu &amp; Prices</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading title="Opening Hours" />
            <BusinessHours />
            <Card accent className="mt-6 text-left">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Planning a team dinner?</h3>
                <p className="text-ink-muted">Call ahead for groups of 6 or more and we&apos;ll reserve the best table. Private room hire available for larger gatherings.</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Crowne Plaza London Heathrow?',
            answer: 'The Anchor is approximately 12 minutes by taxi from Crowne Plaza London Heathrow. Taxi fare is typically £15–18 each way. If driving a rental car, we have 20 free parking spaces, postcode TW19 6AQ.'
          },
          {
            question: 'Is there a good pub near Crowne Plaza Heathrow for corporate dining?',
            answer: 'The Anchor is an excellent choice for corporate dining. We offer full VAT receipts, a private dining room, free WiFi, and can handle group bookings.'
          },
          {
            question: 'What is the nearest pub to Crowne Plaza Heathrow?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub-restaurant to Crowne Plaza London Heathrow, approximately 12 minutes away. We serve traditional British food and have free parking.'
          },
          {
            question: 'Can I book a private dining room near Crowne Plaza Heathrow?',
            answer: 'Yes, The Anchor has a private dining room suitable for team dinners and corporate events. Call us to discuss availability and arrange a bespoke menu for your group. Private hire is also available for larger events.'
          },
          {
            question: 'Do you provide VAT receipts for business expenses near Crowne Plaza?',
            answer: 'Yes, we provide full itemised VAT receipts for all food and drink, making us a smart choice for business expense management.'
          },
        ]}
        className="bg-surface"
      />

      <CtaBand
        title="12 Minutes from Crowne Plaza Heathrow"
        copy="Traditional British pub with home-cooked food, draught beers and free parking. Perfect for corporate dining."
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
