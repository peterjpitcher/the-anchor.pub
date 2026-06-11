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
import { SUNDAY_ROAST, getSundayRoastContent } from '@/lib/sunday-roast'

export const metadata: Metadata = {
  title: 'Pub Near Travelodge Heathrow | 10 Mins | Free Parking',
  description: 'Great pub just 10 minutes from Travelodge London Heathrow. Real British food, proper ales & free parking. The smart traveller\'s dinner upgrade near Heathrow.',
  openGraph: {
    title: 'Pub Near Travelodge Heathrow | 10 Mins | Free Parking | The Anchor',
    description: '10 minutes from Travelodge London Heathrow. Real British pub with home-cooked food, draught beers & free parking.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Travelodge Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Travelodge Heathrow | 10 Mins | Free Parking | The Anchor',
    description: '10 minutes from Travelodge Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-travelodge-heathrow'
  }
}

export default function PubNearTravelodgeHeathrowPage() {
  const sunday = getSundayRoastContent()

  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Travelodge"
        title="Pub Near Travelodge Heathrow"
        lead="10 minutes away, proper British pub, proper food, proper prices"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Travelodge London Heathrow
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at a Travelodge near Heathrow? You&apos;ve made a smart choice saving on your room, now reward yourself with a proper evening at The Anchor, just 10 minutes away. One of the best places to eat near Heathrow, we serve real food, draught beers, and offer a real pub atmosphere you won&apos;t find at the airport.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '10 Mins', description: 'By taxi from Travelodge Heathrow Central' },
              { title: '~£12–15', description: 'Short taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces, drive and park for free' },
              { title: 'From £8.99', description: 'Mains at proper pub prices' },
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
              title="The Smart Traveller's Dinner Near Travelodge Heathrow"
              lead="You saved on accommodation, The Anchor lets you eat brilliantly without blowing the budget. Independent, home-cooked, and genuinely welcoming."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">What You Get</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Home-cooked food from £8.99 a main',
                      'Real draught ales from £4.80 a pint',
                      'Large beer garden for warm evenings',
                      'Stone-baked pizzas from £12',
                      'Dog-friendly throughout',
                      'No booking required for small groups',
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
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Getting Here from Travelodge</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">From Travelodge Heathrow Central</p>
                      <p className="text-sm">Approximately 10 minutes by taxi. Ask for The Anchor, Stanwell Moor (TW19 6AQ). Fare around £12–15.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">From other Travelodge locations</p>
                      <p className="text-sm">Most Heathrow Travelodge properties are within 12–15 minutes. Use Uber or ask reception for a local taxi.</p>
                    </div>
                    <div className="pt-2 border-t border-line">
                      <p className="text-sm font-medium text-ink">Postcode: <strong>TW19 6AQ</strong></p>
                      <p className="text-sm text-ink-muted">Free parking if you&apos;re driving a rental car</p>
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
          <div className="max-w-4xl mx-auto">
            <SectionHeading title="Best Nights to Visit" />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6 text-center">
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Stone-Baked Pizzas</h3>
                  <p className="font-display text-h3 text-accent-text mb-2">From £12</p>
                  <p className="text-ink-muted">Authentic stone-baked pizzas, available Tuesday to Saturday</p>
                  <p className="text-sm text-ink-muted mt-2">Great value dining near Heathrow</p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6 text-center">
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Quiz Night</h3>
                  <p className="font-display text-h3 text-ink-strong mb-2">Monthly</p>
                  <p className="text-ink-muted">Join in with the locals for our pub quiz</p>
                  <p className="text-sm text-ink-muted mt-2">Check <Link href="/whats-on" className="text-accent-text underline">what&apos;s on</Link> for dates</p>
                </CardBody>
              </Card>
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
                <h3 className="font-display text-h4 text-ink-strong mb-2">No need to book for small groups</h3>
                <p className="text-ink-muted">Walk-ins always welcome. For groups of 6 or more, give us a call so we can prepare the best table for you.</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'Is there a pub near Travelodge London Heathrow?',
            answer: 'Yes, The Anchor in Stanwell Moor is 10–15 minutes from most Travelodge Heathrow properties. It\'s an independent British pub with home-cooked food, draught beers, and 20 free parking spaces. A short taxi or Uber ride costs around £12–15.'
          },
          {
            question: 'What\'s the nearest pub to Travelodge Heathrow Central?',
            answer: 'The Anchor in Stanwell Moor is approximately 10 minutes from Travelodge Heathrow Central (Bath Road). The taxi fare is around £12–15 each way, or you can drive and use our free car park.'
          },
          {
            question: 'Is food near Travelodge Heathrow affordable?',
            answer: 'Yes, The Anchor serves home-cooked British pub food with mains from £8.99. Stone-baked pizzas from £12 and classic pub dishes are available throughout the week. It\'s significantly cheaper than hotel or airport dining.'
          },
          {
            question: 'Can I walk from Travelodge Heathrow to The Anchor?',
            answer: 'The walking route between most Travelodge Heathrow locations and The Anchor is not pedestrian-friendly due to road layouts. A short taxi (10–15 mins, £12–15) is the easiest option. Free parking is available if you\'re driving.'
          },
          {
            question: 'Are there any food deals near Travelodge Heathrow?',
            answer: sunday.isLive
              ? 'Yes, The Anchor serves stone-baked pizzas from £12 and classic British pub food with mains from £8.99. We also have a Sunday roast from £16 at weekends. Check our menu for other specials and seasonal deals.'
              : `Yes, The Anchor serves stone-baked pizzas from £12 and classic British pub food with mains from £8.99. Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}. Check our menu for other specials and seasonal deals.`
          },
        ]}
        className="bg-canvas"
      />

      <CtaBand
        title="10 Minutes from Travelodge Heathrow"
        copy="Real British pub with home-cooked food, draught beers and free parking. Smart travellers love it."
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
