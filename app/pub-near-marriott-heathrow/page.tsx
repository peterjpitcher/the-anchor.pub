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
  title: 'Pub Near Marriott Heathrow | 12 Mins | Free Parking',
  description: 'Traditional British pub 12 minutes from Marriott London Heathrow. Draught beers, home-cooked food & free parking. Perfect for business dinners and team meals.',
  openGraph: {
    title: 'Pub Near Marriott Heathrow | 12 Mins | Free Parking | The Anchor',
    description: '12 minutes from Marriott London Heathrow. Traditional British pub with home-cooked food, draught beers & free parking. Ideal for business dinners.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Marriott London Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Marriott Heathrow | 12 Mins | Free Parking | The Anchor',
    description: '12 minutes from Marriott London Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-marriott-heathrow'
  }
}

export default function PubNearMarriottHeathrowPage() {
  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Marriott"
        title="Pub Near Marriott Heathrow"
        lead="12 minutes away, authentic British pub for business guests and leisure travellers"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Marriott London Heathrow
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at the Marriott Heathrow? The Anchor is just 12 minutes away, a proper British pub with home-cooked food, draught beers, and free parking. As one of the top-rated pubs near Heathrow Airport, we&apos;re a genuine escape from hotel restaurant prices.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '12 Minutes', description: 'By taxi from Marriott Heathrow' },
              { title: '~£15–18', description: 'Typical taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces, no hotel charges' },
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

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="The Business Traveller's Local Near Marriott Heathrow"
              lead="Marriott guests are often here on business. The Anchor offers the perfect setting for client dinners, team meals, or simply unwinding after a long day, at a fraction of hotel restaurant prices."
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
                      'Group bookings and private hire available',
                      'Relaxed atmosphere, no dress code',
                      'Honest pub pricing with current menu prices',
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
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Getting Here from Marriott Heathrow</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">By Taxi or Uber</p>
                      <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). The journey takes approximately 12 minutes and costs around £15–18 each way.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">By Car (Rental)</p>
                      <p className="text-sm">Head south from Bath Road via the A3044. Follow signs for Stanwell/Stanwell Moor. Turn right onto Horton Road, the pub is on your left.</p>
                    </div>
                    <div className="pt-2 border-t border-line">
                      <p className="text-sm font-medium text-ink">Postcode: <strong>TW19 6AQ</strong></p>
                      <p className="text-sm text-ink-muted">20 free parking spaces on arrival</p>
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
            <SectionHeading title="Food & Drink at The Anchor" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {[
                { title: 'Classic Mains', description: 'Current menu prices for steaks, fish & chips, burgers and British classics cooked fresh daily' },
                { title: 'Draught Beers', description: 'Wide selection of beers, wines and spirits, a proper British pint from the drinks menu' },
                { title: 'Stone-Baked Pizza', description: 'Authentic stone-baked pizzas from the live menu, great for groups and families' },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
            <Card accent>
              <CardBody className="p-6 text-center">
                <h3 className="font-display text-h4 text-ink-strong mb-3">Client Dinner? We&apos;ve Got You Covered</h3>
                <p className="text-ink-muted mb-4">Relaxed but professional atmosphere ideal for building relationships over a proper meal. Book in advance for groups of 6 or more.</p>
                <Link href="/food-menu">
                  <Button variant="outline" size="lg">View Full Menu</Button>
                </Link>
              </CardBody>
            </Card>
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
                <h3 className="font-display text-h4 text-ink-strong mb-2">Group bookings welcome</h3>
                <p className="text-ink-muted">For groups of 6 or more, call ahead so we can prepare a table. Private room hire available for larger events.</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Marriott London Heathrow?',
            answer: 'The Anchor is approximately 12 minutes by taxi from Marriott London Heathrow. The taxi fare is typically £15–18 each way. If you have a rental car, we offer 20 free parking spaces, enter postcode TW19 6AQ.'
          },
          {
            question: 'Is there a pub near Marriott Heathrow for business dinners?',
            answer: 'The Anchor is well suited to business dinners. We provide full VAT receipts, have a quieter dining room away from the main bar, offer free WiFi, and can arrange group bookings.'
          },
          {
            question: 'What restaurants are near Marriott Heathrow?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub-restaurant to the Marriott London Heathrow, approximately 12 minutes away. We serve traditional British food including fish & chips, steaks, burgers, and Sunday roasts.'
          },
          {
            question: 'Can I get a taxi from Marriott Heathrow to The Anchor?',
            answer: 'Yes, ask the Marriott concierge to arrange a taxi, or use Uber. The journey is approximately 12 minutes. We have 20 free parking spaces if you prefer to drive a rental car (postcode TW19 6AQ).'
          },
          {
            question: 'Do you provide receipts for business expenses near Marriott Heathrow?',
            answer: 'Yes, we provide full itemised VAT receipts for all meals and drinks, making The Anchor an excellent choice for expense-friendly business entertaining.'
          },
        ]}
        className="bg-surface"
      />

      <CtaBand
        title="12 Minutes from Marriott Heathrow"
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
