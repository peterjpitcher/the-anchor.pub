import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
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

      <HeroWrapper
        route="/pub-near-renaissance-heathrow"
        title="Pub Near Renaissance Heathrow"
        description="12 minutes away — an authentic British pub experience for discerning travellers"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="py-8 bg-anchor-bg">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="text-anchor-cream-text mb-4">
              Pub Near Renaissance London Heathrow Hotel
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at the Renaissance Heathrow? The Anchor is just 12 minutes away — a proper British village pub offering a genuine local experience that no hotel bar can replicate. Draught beers, home-cooked food, and warm hospitality make us one of the most popular places to eat near Heathrow for discerning Marriott guests.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <FeatureGrid
              columns={4}
              features={[
                { icon: '', title: '12 Minutes', description: 'By taxi from Renaissance Heathrow', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£15–18', description: 'Typical taxi fare each way', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces — no charges', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Village Pub', description: 'A genuine British local community pub', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="A Genuine British Local Near Renaissance Heathrow"
              subtitle="The Renaissance is renowned for its design and character. For guests who appreciate authenticity, The Anchor offers something the hotel simply can't — a real British community pub with history, warmth, and genuine local life."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">The Anchor Experience</h3>
                <ul className="space-y-3">
                  {[
                    'Home-cooked British food — from £8.99',
                    'Rotating draught beers and craft beers',
                    'Warm, character-filled village pub',
                    'Seasonal menu and daily specials',
                    'Dog-friendly beer garden',
                    'Events: quiz, karaoke, music bingo and more',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Directions from Renaissance Heathrow</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">By Taxi or Uber</p>
                    <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Journey approximately 12 minutes, £15–18 each way. The hotel concierge can arrange.</p>
                  </div>
                  <div>
                    <p className="font-semibold">By Car</p>
                    <p className="text-sm">Head south on the A3044 from the Heathrow area, continuing through Stanwell village. Turn right onto Horton Road. Free parking on arrival.</p>
                  </div>
                  <div className="pt-2 border-t border-anchor-gold/15">
                    <p className="text-sm font-medium">Postcode: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-anchor-cream-text/70">Tell the driver: &quot;The Anchor pub, Stanwell Moor&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="What Renaissance Guests Enjoy Most" />
            <FeatureGrid
              columns={3}
              features={[
                { icon: '', title: 'Sunday Roast', description: 'Traditional British roast from £19 — the definitive Sunday lunch experience.', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Great Drinks', description: 'Draught beers and familiar draught lagers. A very British ritual worth experiencing.', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Fish & Chips', description: 'Fresh battered cod with chips — the British classic every visitor should try.', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
              ]}
              className="mb-6"
            />
            <div className="text-center">
              <Link href="/food-menu">
                <Button variant="secondary" size="lg">View Full Menu</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader title="Opening Hours" />
            <BusinessHours />
            <AlertBox
              variant="info"
              title="Book ahead for weekends"
              className="mt-6"
              content={<p>Sunday roasts require advance booking. We open from noon at weekends and 4pm on weekdays. Perfect for a pre- or post-flight dinner.</p>}
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Renaissance London Heathrow Hotel?',
            answer: 'The Anchor is approximately 12 minutes by taxi from Renaissance London Heathrow Hotel. Taxi fare is typically £15–18 each way. Free parking is available if you are driving — postcode TW19 6AQ.'
          },
          {
            question: 'Is there a pub near Renaissance Heathrow?',
            answer: 'Yes — The Anchor in Stanwell Moor is the closest independent pub to Renaissance London Heathrow, approximately 12 minutes away. It\'s an authentic British village pub with home-cooked food, draught beers, and a warm community atmosphere.'
          },
          {
            question: 'What food is available near Renaissance Heathrow Hotel?',
            answer: 'The Anchor serves traditional British pub food including fish & chips, Sunday roasts (weekends, pre-booking recommended), steaks, burgers, and daily specials. Mains start from £8.99 — significantly less than Renaissance hotel dining.'
          },
          {
            question: 'Is The Anchor near Renaissance Heathrow good for groups?',
            answer: 'Yes — The Anchor can accommodate groups of all sizes. For parties of 6 or more, call ahead so we can prepare the best table. We also offer private dining and room hire for larger events.'
          },
          {
            question: 'Can I get a taxi from Renaissance Heathrow to The Anchor?',
            answer: 'Yes — ask the Renaissance concierge to arrange a taxi, or use Uber. Tell the driver "The Anchor pub, Stanwell Moor, TW19 6AQ". The journey is approximately 12 minutes and costs around £15–18.'
          },
        ]}
        className="bg-anchor-bg"
      />

      <CTASection
        title="12 Minutes from Renaissance Heathrow"
        description="Authentic British pub with home-cooked food, draught beers and free parking. A genuine local experience."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'renaissance_heathrow_cta', variant: 'secondary' },
          { text: 'View Menu', href: '/food-menu', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 12 mins from Renaissance Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
