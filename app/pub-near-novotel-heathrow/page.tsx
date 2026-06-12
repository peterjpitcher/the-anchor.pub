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
  title: 'Pub Near Novotel Heathrow | 15 Mins | Free Parking',
  description: 'Traditional British pub 15 minutes from Novotel London Heathrow. Home-cooked food, draught beers & free parking. An independent alternative to hotel dining near Heathrow.',
  openGraph: {
    title: 'Pub Near Novotel Heathrow | 15 Mins | Free Parking | The Anchor',
    description: '15 minutes from Novotel London Heathrow. Traditional British pub with home-cooked food, draught beers & free parking.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Novotel Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Novotel Heathrow | 15 Mins | Free Parking | The Anchor',
    description: '15 minutes from Novotel London Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-novotel-heathrow'
  }
}

export default function PubNearNovotelHeathrowPage() {
  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Novotel"
        title="Pub Near Novotel Heathrow"
        lead="15 minutes away, independent British pub with proper food and draught beers"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Novotel London Heathrow
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at the Novotel Heathrow? The Anchor is just 15 minutes away, an independent British pub with home-cooked food from scratch, draught beers, and free parking. Among the best pubs near Heathrow Airport, we&apos;re a proper local experience with real character, well worth the short taxi ride from your hotel.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '15 Minutes', description: 'By taxi from Novotel Heathrow' },
              { title: '~£15–20', description: 'Typical taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces, arrive by car and park free' },
              { title: 'Genuinely Local', description: 'Independent pub, not a chain' },
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
              title="An Independent Pub Alternative Near Novotel Heathrow"
              lead="The Novotel is great for a comfortable stay near Heathrow, but for your evening meal, The Anchor offers something different: a genuine British community pub with food made from scratch every day."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">What Makes The Anchor Different</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Independent pub, not a chain or hotel brand',
                      'Food cooked from scratch daily',
                      'Draught lagers, bottled ales and seasonal specials',
                      'Dog-friendly beer garden',
                      'Quiz nights, music bingo & live events',
                      'Real community atmosphere',
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
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Getting Here from Novotel Heathrow</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">By Taxi or Uber</p>
                      <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Journey is approximately 15 minutes, costing around £15–20 each way.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">By Car</p>
                      <p className="text-sm">Head south on the A3044 from the Heathrow area. Continue through Stanwell village and turn right onto Horton Road. The Anchor is on your left.</p>
                    </div>
                    <div className="pt-2 border-t border-line">
                      <p className="text-sm font-medium text-ink">Postcode: <strong>TW19 6AQ</strong></p>
                      <p className="text-sm text-ink-muted">Free parking, 20 spaces available</p>
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
            <SectionHeading title="Great Value Deals Worth Knowing" />
            <div className="max-w-md mx-auto">
              <Card accent>
                <CardBody className="p-6 text-center">
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Sunday Roast</h3>
                  <p className="font-display text-h3 text-accent-text mb-2">Current menu</p>
                  <p className="text-ink-muted">Traditional British roast, pre-booking recommended</p>
                </CardBody>
              </Card>
            </div>
            <div className="mt-6 text-center">
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
                <h3 className="font-display text-h4 text-ink-strong mb-2">Early flight tomorrow?</h3>
                <p className="text-ink-muted">Come for dinner the evening before. We open from 4pm on weekdays and noon at weekends.</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="A Proper Family Night Out Near Heathrow"
              lead="Novotel is one of the most popular family hotels near Heathrow, and we completely understand why. But when the kids are bored of the hotel and everyone&rsquo;s hungry, The Anchor is exactly where you want to be."
            />
            <div className="prose max-w-none space-y-4 text-ink-muted">
              <p>
                Getting here from Novotel on Cherry Lane is easy. A taxi takes about 12 minutes and costs approximately &pound;12&ndash;15. Pop the postcode TW19 6AQ into Uber or Bolt and you&rsquo;ll be door-to-door with no fuss.
              </p>
              <p>
                Novotel is popular with families, and so are we. There&rsquo;s a children&rsquo;s menu available, high chairs for the little ones, and our beer garden has plenty of space for kids to run around while you finish your drink. Dogs are welcome too, if you&rsquo;ve brought your pet along for the trip, they&rsquo;re part of the family as far as we&rsquo;re concerned.
              </p>
              <p>
                On the value side: Novotel restaurant mains typically cost &pound;14&ndash;20. The Anchor&rsquo;s mains run &pound;10&ndash;17, and our stone-baked pizzas start from &pound;12. For a family of four, that&rsquo;s a significant saving compared to any hotel restaurant near Heathrow.
              </p>
              <p>
                What Novotel guests discover when they visit is that we&rsquo;re nothing like the generic airport pub they were expecting. The Anchor is a genuine village local that happens to sit under the Heathrow flight path. The beer garden with planes passing overhead every 90 seconds is the highlight, especially with kids, who find it endlessly entertaining. Adults tend to enjoy it too, pint in hand, watching the evening departures while the sun goes down. It&rsquo;s one of those unexpectedly brilliant experiences you only find by leaving the hotel.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Novotel London Heathrow?',
            answer: 'The Anchor is approximately 15 minutes by taxi from Novotel London Heathrow. The fare is typically £15–20 each way. If you have a rental car, we have 20 free parking spaces, postcode TW19 6AQ.'
          },
          {
            question: 'Is there a pub near Novotel Heathrow?',
            answer: 'Yes, The Anchor in Stanwell Moor is approximately 15 minutes from Novotel London Heathrow. It\'s an independent British pub with home-cooked food, draught beers, and free parking. The short journey is well worth it for the authentic local experience.'
          },
          {
            question: 'What restaurants are near Novotel Heathrow?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub-restaurant to Novotel London Heathrow, serving traditional British food including fish & chips, burgers, steaks, and Sunday roasts. Current prices are shown on the live menu.'
          },
          {
            question: 'Is The Anchor family-friendly near Novotel Heathrow?',
            answer: 'Yes, The Anchor is family-friendly with a large beer garden, high chairs available, and children\'s portions. Dogs are welcome in the bar and garden. We\'re a great option for families staying at the Novotel who want a proper meal out.'
          },
          {
            question: 'Can I get a taxi from Novotel Heathrow to The Anchor?',
            answer: 'Yes, use Uber or ask the Novotel reception to arrange a taxi. Tell the driver "The Anchor pub, Stanwell Moor, TW19 6AQ". The journey is approximately 15 minutes and costs around £15–20.'
          },
        ]}
        className="bg-canvas"
      />

      <CtaBand
        title="15 Minutes from Novotel Heathrow"
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
