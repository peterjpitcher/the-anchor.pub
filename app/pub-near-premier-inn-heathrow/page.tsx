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
  title: 'Pub Near Premier Inn Heathrow | 8 Mins | Free Parking',
  description: 'Great pub just 8 minutes from Premier Inn Heathrow. Independent British pub with home-cooked food, draught beers & free parking. A real alternative to hotel dining.',
  openGraph: {
    title: 'Pub Near Premier Inn Heathrow | 8 Mins | Free Parking',
    description: '8 minutes from Premier Inn Heathrow. Independent British pub with home-cooked food, draught beers & 20 free parking spaces.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Premier Inn Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Premier Inn Heathrow | 8 Mins | Free Parking',
    description: '8 minutes from Premier Inn Heathrow. Independent British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-premier-inn-heathrow'
  }
}

export default function PubNearPremierInnHeathrowPage() {
  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Premier Inn"
        title="Pub Near Premier Inn Heathrow"
        lead="8 minutes away, independent British pub with proper food and free parking"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Premier Inn Heathrow Terminal 5
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at Premier Inn Heathrow? Skip the Brewers Fayre and discover The Anchor, an independent British pub just 8 minutes away with better food, draught beers, and free parking. One of the best pubs near Heathrow Airport, we offer a proper alternative to hotel dining with home-cooked meals and a genuinely local atmosphere.
            </p>
          </div>
        </Container>
      </section>

      {/* Key facts */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '8 Minutes', description: 'By taxi from Premier Inn Heathrow T5' },
              { title: '~£10–12', description: 'Short taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces, no hourly charges' },
              { title: 'Draught Beers', description: 'Proper draught beer, not just lager' },
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

      {/* Why choose The Anchor */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="An Independent Pub Alternative Near Premier Inn Heathrow"
              lead="Premier Inn is great value accommodation, but for your evening out, The Anchor offers something the hotel bar simply can't: a genuine British local pub experience."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Why Guests Choose Us</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Independent pub, not a chain or franchise',
                      'Home-cooked food from scratch daily',
                      'Rotating specials and seasonal dishes',
                      'Dog-friendly beer garden (bring your pet!)',
                      'Local regulars, meet real people',
                      'Quiz nights, music bingo & live events',
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
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Getting Here from Premier Inn</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">From Premier Inn T5 (Northern Perimeter Rd)</p>
                      <p className="text-sm">Head south on A3044, left on Stanwell Rd, right on Horton Rd. 8 mins.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">From Premier Inn Bath Road</p>
                      <p className="text-sm">Take A4 east, then south on Stanwell Moor Road. 10–12 mins.</p>
                    </div>
                    <div className="pt-2 border-t border-line">
                      <p className="text-sm font-medium text-ink">Postcode for sat-nav or taxi: <strong>TW19 6AQ</strong></p>
                      <p className="text-sm text-ink-muted">Uber and local taxis work well from all Premier Inn locations</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Tuesday deal */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading title="Deals Worth Knowing About" />
            <div className="max-w-md mx-auto">
              <Card accent>
                <CardBody className="p-6 text-center">
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Sunday Roast</h3>
                  <p className="font-display text-h3 text-accent-text mb-2">From £16</p>
                  <p className="text-ink-muted">Traditional British roast with all the trimmings</p>
                  <p className="text-sm text-ink-muted mt-2">Pre-booking recommended for Sundays</p>
                </CardBody>
              </Card>
            </div>
            <div className="mt-6 text-center">
              <Link href="/food-menu">
                <Button variant="outline" size="lg">View Full Menu &amp; Prices</Button>
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
                <h3 className="font-display text-h4 text-ink-strong mb-2">Early flight tomorrow?</h3>
                <p className="text-ink-muted">Come for dinner the evening before. We&apos;re open from 4pm on weekdays and noon on weekends.</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'Is there a pub near Premier Inn Heathrow Terminal 5?',
            answer: 'Yes, The Anchor in Stanwell Moor is just 8 minutes by taxi from Premier Inn Heathrow Terminal 5. It\'s an independent British pub with home-cooked food, draught beers, and 20 free parking spaces. Taxi fare is typically £10–12 each way.'
          },
          {
            question: 'What\'s the nearest pub to Premier Inn Heathrow Bath Road?',
            answer: 'The Anchor is approximately 10–12 minutes from Premier Inn Heathrow Bath Road. Take a quick taxi (around £12) or drive and park free. It\'s the closest independent pub to all Heathrow hotels.'
          },
          {
            question: 'Is The Anchor better than the Premier Inn restaurant?',
            answer: 'Both are great options for different reasons. The Anchor offers an independent, locally-run British pub experience with home-cooked food, rotating specials, and a genuine community atmosphere. If you\'re looking for something beyond a chain restaurant, The Anchor is worth the short trip.'
          },
          {
            question: 'What\'s on the menu near Premier Inn Heathrow?',
            answer: 'The Anchor serves traditional British pub food including fish & chips, stone-baked pizzas, burgers, Sunday roasts (weekends, pre-booking advised), and daily specials. Mains start from around £8.99.'
          },
          {
            question: 'Can I walk from Premier Inn to The Anchor?',
            answer: 'The walking route between most Premier Inn Heathrow locations and The Anchor is not pedestrian-friendly due to road layouts. A taxi (8–12 mins, £10–15) is the recommended option. If you\'re driving, free parking is available at the pub.'
          },
        ]}
        className="bg-canvas"
      />

      <CtaBand
        title="8 Minutes from Premier Inn Heathrow"
        copy="Independent British pub with home-cooked food, draught beers and free parking. Walk-ins welcome."
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
