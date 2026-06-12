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
  title: 'Pub Near Renaissance Heathrow | 12 Mins',
  description: 'Authentic British pub 12 minutes from Renaissance London Heathrow Hotel. Draught beers, home-cooked food & free parking. A genuine local experience for Marriott guests.',
  openGraph: {
    title: 'Pub Near Renaissance Heathrow | 12 Mins | The Anchor',
    description: '12 minutes from Renaissance London Heathrow. Authentic British pub with home-cooked food, draught beers & free parking.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Renaissance London Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Renaissance Heathrow | 12 Mins | The Anchor',
    description: '12 minutes from Renaissance London Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-renaissance-heathrow'
  }
}

export default function PubNearRenaissanceHeathrowPage() {
  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Renaissance"
        title="Pub Near Renaissance Heathrow"
        lead="12 minutes away, an authentic British pub experience for discerning travellers"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Renaissance London Heathrow Hotel
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at the Renaissance Heathrow? The Anchor is just 12 minutes away, a proper British village pub offering a genuine local experience that no hotel bar can replicate. Draught beers, home-cooked food, and warm hospitality make us one of the most popular places to eat near Heathrow for discerning Marriott guests.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '12 Minutes', description: 'By taxi from Renaissance Heathrow' },
              { title: '~£15–18', description: 'Typical taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces, no charges' },
              { title: 'Village Pub', description: 'A genuine British local community pub' },
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
              title="A Genuine British Local Near Renaissance Heathrow"
              lead="The Renaissance is renowned for its design and character. For guests who appreciate authenticity, The Anchor offers something the hotel simply can't, a real British community pub with history, warmth, and genuine local life."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">The Anchor Experience</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Home-cooked British food, with current menu prices',
                      'Rotating draught beers and craft beers',
                      'Warm, character-filled village pub',
                      'Seasonal menu and daily specials',
                      'Dog-friendly beer garden',
                      'Events: quiz, karaoke, music bingo and more',
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
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Directions from Renaissance Heathrow</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">By Taxi or Uber</p>
                      <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Journey approximately 12 minutes, £15–18 each way. The hotel concierge can arrange.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">By Car</p>
                      <p className="text-sm">Head south on the A3044 from the Heathrow area, continuing through Stanwell village. Turn right onto Horton Road. Free parking on arrival.</p>
                    </div>
                    <div className="pt-2 border-t border-line">
                      <p className="text-sm font-medium text-ink">Postcode: <strong>TW19 6AQ</strong></p>
                      <p className="text-sm text-ink-muted">Tell the driver: &quot;The Anchor pub, Stanwell Moor&quot;</p>
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
            <SectionHeading title="What Renaissance Guests Enjoy Most" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {[
                { title: 'Sunday Roast', description: 'Traditional British roast from the current menu, the definitive Sunday roast experience.' },
                { title: 'Great Drinks', description: 'Draught beers and familiar draught lagers. A very British ritual worth experiencing.' },
                { title: 'Fish & Chips', description: 'Fresh battered cod with chips, the British classic every visitor should try.' },
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

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading title="Opening Hours" />
            <BusinessHours />
            <Card accent className="mt-6 text-left">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Book ahead for weekends</h3>
                <p className="text-ink-muted">Sunday roasts are walk-in friendly, with booking recommended for peak slots and groups. We open from noon at weekends and 4pm on weekdays. Perfect for a pre- or post-flight dinner.</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Renaissance London Heathrow Hotel?',
            answer: 'The Anchor is approximately 12 minutes by taxi from Renaissance London Heathrow Hotel. Taxi fare is typically £15–18 each way. Free parking is available if you are driving, postcode TW19 6AQ.'
          },
          {
            question: 'Is there a pub near Renaissance Heathrow?',
            answer: 'Yes, The Anchor in Stanwell Moor is the closest independent pub to Renaissance London Heathrow, approximately 12 minutes away. It\'s an authentic British village pub with home-cooked food, draught beers, and a warm community atmosphere.'
          },
          {
            question: 'What food is available near Renaissance Heathrow Hotel?',
            answer: 'The Anchor serves traditional British pub food including fish & chips, Sunday roasts (weekends, pre-booking recommended), steaks, burgers, and daily specials. Current prices are shown on the live menu, significantly less than Renaissance hotel dining.'
          },
          {
            question: 'Is The Anchor near Renaissance Heathrow good for groups?',
            answer: 'Yes, The Anchor can accommodate groups of all sizes. For parties of 6 or more, call ahead so we can prepare the best table. We also offer private dining and room hire for larger events.'
          },
          {
            question: 'Can I get a taxi from Renaissance Heathrow to The Anchor?',
            answer: 'Yes, ask the Renaissance concierge to arrange a taxi, or use Uber. Tell the driver "The Anchor pub, Stanwell Moor, TW19 6AQ". The journey is approximately 12 minutes and costs around £15–18.'
          },
        ]}
        className="bg-canvas"
      />

      <CtaBand
        title="12 Minutes from Renaissance Heathrow"
        copy="Authentic British pub with home-cooked food, draught beers and free parking. A genuine local experience."
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
