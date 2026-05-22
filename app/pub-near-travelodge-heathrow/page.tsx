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

      <HeroWrapper
        route="/pub-near-travelodge-heathrow"
        title="Pub Near Travelodge Heathrow"
        description="10 minutes away, proper British pub, proper food, proper prices"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="section-spacing-sm bg-anchor-bg">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="text-anchor-cream-text mb-4">
              Pub Near Travelodge London Heathrow
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at a Travelodge near Heathrow? You&apos;ve made a smart choice saving on your room, now reward yourself with a proper evening at The Anchor, just 10 minutes away. One of the best places to eat near Heathrow, we serve real food, draught beers, and offer a real pub atmosphere you won&apos;t find at the airport.
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
                { icon: '', title: '10 Mins', description: 'By taxi from Travelodge Heathrow Central', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£12–15', description: 'Short taxi fare each way', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces, drive and park for free', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'From £8.99', description: 'Mains at proper pub prices', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
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
              title="The Smart Traveller's Dinner Near Travelodge Heathrow"
              subtitle="You saved on accommodation, The Anchor lets you eat brilliantly without blowing the budget. Independent, home-cooked, and genuinely welcoming."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">What You Get</h3>
                <ul className="space-y-3">
                  {[
                    'Home-cooked food from £8.99 a main',
                    'Real draught ales from £4.80 a pint',
                    'Large beer garden for warm evenings',
                    'Stone-baked pizzas from £12',
                    'Dog-friendly throughout',
                    'No booking required for small groups',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Getting Here from Travelodge</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">From Travelodge Heathrow Central</p>
                    <p className="text-sm">Approximately 10 minutes by taxi. Ask for The Anchor, Stanwell Moor (TW19 6AQ). Fare around £12–15.</p>
                  </div>
                  <div>
                    <p className="font-semibold">From other Travelodge locations</p>
                    <p className="text-sm">Most Heathrow Travelodge properties are within 12–15 minutes. Use Uber or ask reception for a local taxi.</p>
                  </div>
                  <div className="pt-2 border-t border-anchor-gold/15">
                    <p className="text-sm font-medium">Postcode: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-anchor-cream-text/70">Free parking if you&apos;re driving a rental car</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader title="Best Nights to Visit" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-dark rounded-none p-6 text-center">
                <p className="text-4xl mb-2"></p>
                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">Stone-Baked Pizzas</h3>
                <p className="text-2xl font-bold text-anchor-gold mb-2">From £12</p>
                <p className="text-anchor-cream-text/70">Authentic stone-baked pizzas, available Tuesday to Saturday</p>
                <p className="text-sm text-anchor-cream-text/55 mt-2">Great value dining near Heathrow</p>
              </div>
              <div className="card-dark rounded-none p-6 text-center">
                <p className="text-4xl mb-2"></p>
                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">Quiz Night</h3>
                <p className="text-2xl font-bold text-anchor-cream-text/70 mb-2">Monthly</p>
                <p className="text-anchor-cream-text/70">Join in with the locals for our pub quiz</p>
                <p className="text-sm text-anchor-cream-text/55 mt-2">Check <Link href="/whats-on" className="underline">what&apos;s on</Link> for dates</p>
              </div>
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
              variant="success"
              title="No need to book for small groups"
              className="mt-6"
              content={<p>Walk-ins always welcome. For groups of 6 or more, give us a call so we can prepare the best table for you.</p>}
            />
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
        className="bg-anchor-bg"
      />

      <CTASection
        title="10 Minutes from Travelodge Heathrow"
        description="Real British pub with home-cooked food, draught beers and free parking. Smart travellers love it."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'travelodge_heathrow_cta', variant: 'white' },
          { text: 'View Menu', href: '/food-menu', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 10 mins from Travelodge Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
