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
  title: 'Pub Near Radisson Blu Heathrow | 12 Mins',
  description: 'Authentic British pub 12 minutes from Radisson Blu Edwardian Heathrow. Draught beers, home-cooked food & free parking. A genuine local alternative to hotel dining.',
  openGraph: {
    title: 'Pub Near Radisson Blu Heathrow | 12 Mins | The Anchor',
    description: '12 minutes from Radisson Blu Edwardian Heathrow. Authentic British pub with home-cooked food, draught beers & free parking.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Radisson Blu Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Radisson Blu Heathrow | 12 Mins | The Anchor',
    description: '12 minutes from Radisson Blu Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-radisson-blu-heathrow'
  }
}

export default function PubNearRadissonBluHeathrowPage() {
  return (
    <>

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Radisson Blu"
        title="Pub Near Radisson Blu Heathrow"
        lead="12 minutes away, authentic British local for Radisson guests seeking a genuine experience"
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="mb-4">
              Pub Near Radisson Blu Edwardian Heathrow
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Staying at the Radisson Blu Heathrow? The Anchor is just 12 minutes away, a genuine British community pub with home-cooked food, draught beers, and free parking. For places to eat near Heathrow with real character, we&apos;re the authentic local experience your hotel can&apos;t offer.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: '12 Minutes', description: 'By taxi from Radisson Blu Heathrow' },
              { title: '~£15–18', description: 'Typical taxi fare each way' },
              { title: 'Free Parking', description: '20 spaces, no charges at all' },
              { title: 'Authentically Local', description: 'A real community pub since 1751' },
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
              title="Authentic British Pub Near Radisson Blu Heathrow"
              lead="The Radisson Blu is an outstanding hotel, but for a genuinely British pub night, The Anchor is where Radisson guests go when they want to experience real local life rather than another hotel bar."
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">What You Get at The Anchor</h3>
                  <ul className="space-y-3 text-ink">
                    {[
                      'Home-cooked British food, with current menu prices',
                      'Draught lagers, bottled ales and craft beers',
                      'Warm, unpretentious community atmosphere',
                      'Dog-friendly beer garden',
                      'Full VAT receipts for business expenses',
                      'Regular events, quiz, music bingo, karaoke',
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
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Directions from Radisson Blu</h3>
                  <div className="space-y-3 text-ink-muted">
                    <div>
                      <p className="font-semibold text-ink">By Taxi or Uber</p>
                      <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Approximately 12 minutes, £15–18 each way. Ask the hotel concierge to arrange.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">By Car</p>
                      <p className="text-sm">Take the A3044 south toward Stanwell. Continue through the village and turn right onto Horton Road. Free parking on arrival.</p>
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
            <SectionHeading title="Popular with Radisson Guests" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {[
                { title: 'Fish & Chips', description: 'The quintessential British dish, fresh battered cod with chips and mushy peas.' },
                { title: 'Sunday Roast', description: 'Traditional roast from the current menu, walk in or book ahead.' },
                { title: 'Great Drinks Selection', description: 'Draught beers and lagers. Proper British beer culture.' },
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
                <h3 className="font-display text-h4 text-ink-strong mb-2">Planning ahead?</h3>
                <p className="text-ink-muted">Book a table in advance for weekend visits, especially for Sunday roast. We open from 4pm weekdays and noon at weekends.</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="The Business Traveller&rsquo;s Local"
              lead="The Radisson Blu sits near Terminal 4, which puts you closer to us than most Heathrow hotels. A short taxi ride and you&rsquo;re in a completely different world."
            />
            <div className="prose max-w-none space-y-4 text-ink-muted">
              <p>
                From the Radisson Blu, a taxi takes about 15 minutes via the Southern Perimeter Road and costs approximately &pound;15&ndash;18. If you prefer public transport, the 490 bus runs toward Staines and you can get off on Stanwell Moor Road, it&rsquo;s a short walk from there. But honestly, for an evening out, Uber is the simplest option.
              </p>
              <p>
                We know business travellers need speed and efficiency. Our kitchen opens at 6pm on weekdays, you can be sitting down with a pint by 6:10, eating by 6:15, and back at the hotel by 8pm if you need to be. We provide full itemised VAT receipts for expenses, and there&rsquo;s free WiFi throughout if you need to catch up on emails between courses.
              </p>
              <p>
                Let&rsquo;s talk money. Radisson Blu restaurant mains typically run &pound;20&ndash;30. At The Anchor, the same quality British classics, fish and chips, steaks, pies, burgers, cost &pound;10&ndash;17. The money you save comfortably pays for your taxi both ways. Order a proper ale or a pint of Moretti instead of a hotel-price drink and you&rsquo;re ahead on every line of the receipt.
              </p>
              <p>
                What Radisson guests consistently tell us is that the contrast is what makes it worthwhile. You leave a polished, corporate hotel and walk into a 270-year-old village pub with low ceilings, proper beer, and locals at the bar. No background music playlist curated by a brand agency, just conversation, good food, and the occasional plane overhead. It&rsquo;s exactly the kind of evening you can&rsquo;t get from a hotel restaurant, no matter how good the hotel is.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Radisson Blu Edwardian Heathrow?',
            answer: 'The Anchor is approximately 12 minutes by taxi from Radisson Blu Edwardian Heathrow. Taxi fare is typically £15–18 each way. Free parking is available if you are driving, postcode TW19 6AQ.'
          },
          {
            question: 'Is there a pub near Radisson Blu Heathrow?',
            answer: 'Yes, The Anchor in Stanwell Moor is the closest independent pub to Radisson Blu Edwardian Heathrow, approximately 12 minutes away. It\'s an authentic British pub with home-cooked food, draught beers, and a genuine community atmosphere.'
          },
          {
            question: 'What restaurants are near Radisson Blu Heathrow?',
            answer: 'The Anchor serves traditional British pub food including fish & chips, Sunday roasts, burgers, steaks and daily specials. It\'s approximately 12 minutes from Radisson Blu Heathrow, with current menu prices.'
          },
          {
            question: 'Does The Anchor near Radisson Blu cater for business expenses?',
            answer: 'Yes, full itemised VAT receipts are provided for all purchases. We also have free WiFi and a quieter dining room suitable for business meals.'
          },
          {
            question: 'Can I get a return taxi from The Anchor to Radisson Blu Heathrow?',
            answer: 'Yes, our staff are happy to help arrange a taxi, or you can use Uber from the pub. The return journey to Radisson Blu Heathrow takes approximately 12 minutes and costs around £15–18.'
          },
        ]}
        className="bg-canvas"
      />

      <CtaBand
        title="12 Minutes from Radisson Blu Heathrow"
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
