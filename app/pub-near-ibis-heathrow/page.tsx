import Link from 'next/link'
import { Button, CTASection, SectionHeading, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Pub Near ibis Heathrow | 12 Mins | Free Parking',
  description: 'Independent pub 12 minutes from ibis London Heathrow. Real British food, draught beers & free parking. Spend less on your hotel, spend more on your evening out.',
  openGraph: {
    title: 'Pub Near ibis Heathrow | 12 Mins | Free Parking | The Anchor',
    description: '12 minutes from ibis London Heathrow. Real British pub with home-cooked food, draught beers & free parking. A proper evening out.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near ibis Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near ibis Heathrow | 12 Mins | Free Parking | The Anchor',
    description: '12 minutes from ibis Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-ibis-heathrow'
  }
}

export default function PubNearIbisHeathrowPage() {
  return (
    <>

      <HeroWrapper
        route="/pub-near-ibis-heathrow"
        title="Pub Near ibis Heathrow"
        description="12 minutes away, upgrade your evening with a proper British pub experience"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="section-spacing-sm bg-anchor-green-deep">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="text-anchor-cream-text mb-4">
              Pub Near ibis London Heathrow
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Smart travellers stay at the ibis to save on accommodation, then spend the difference on a proper evening at The Anchor. Just 12 minutes away: draught beers, home-cooked British food, and free parking. If you&apos;re searching for places to eat near Heathrow, we&apos;re the genuine local that budget-savvy guests love.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <FeatureGrid
              columns={4}
              features={[
                { icon: '', title: '12 Minutes', description: 'By taxi from ibis Heathrow', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£15', description: 'Typical taxi fare each way', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces, drive and park free', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Great Value', description: 'Mains from £8.99, pub prices', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Upgrade Your Evening Near ibis Heathrow"
              subtitle="You saved on your hotel, now treat yourself to a proper night out. The Anchor is the independent local that ibis guests discover and keep coming back to."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-bright mb-4">What Smart Travellers Love</h3>
                <ul className="space-y-3">
                  {[
                    'Home-cooked food, not microwave hotel meals',
                    'Real draught ales and craft beers',
                    'Large beer garden for warm evenings',
                    'Dog-friendly, bring your four-legged traveller',
                    'Quiz nights and live events most weeks',
                    'Cash, card, contactless, all accepted',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold-dark font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-bright mb-4">Getting Here from ibis Heathrow</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">By Taxi or Uber</p>
                    <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Journey approximately 12 minutes, around £15 each way.</p>
                  </div>
                  <div>
                    <p className="font-semibold">By Car (Rental)</p>
                    <p className="text-sm">Head south on the A3044 from the Heathrow area. Continue through Stanwell village and turn right onto Horton Road. Free parking on arrival.</p>
                  </div>
                  <div className="pt-2 border-t border-anchor-gold-dark/15">
                    <p className="text-sm font-medium">Postcode: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-anchor-cream-text/70">Uber works well from all ibis Heathrow locations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading title="Best Value Picks" />
            <FeatureGrid
              columns={3}
              features={[
                { icon: '', title: 'Fish & Chips', description: 'British classic, fresh battered cod, chips and mushy peas. Proper pub grub.', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Stone-Baked Pizza', description: 'Authentic stone-baked pizzas from £12, proper pub grub cooked fresh to order.', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Draught Beers from £4.80', description: 'Wide selection of beers, wines and spirits, proper British drinks at proper pub prices.', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
              ]}
              className="mb-6"
            />
            <div className="text-center">
              <Link href="/food-menu">
                <Button variant="outline" size="lg">View Full Menu & Prices</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading title="Opening Hours" />
            <BusinessHours />
            <AlertBox
              variant="info"
              title="Staying over before an early flight?"
              className="mt-6"
              content={<p>Come for dinner and a drink the evening before. We open from 4pm on weekdays and noon at weekends. Last orders at 9pm Tuesday–Friday.</p>}
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'Is there a pub near ibis London Heathrow?',
            answer: 'Yes, The Anchor in Stanwell Moor is approximately 12 minutes by taxi from ibis London Heathrow. It\'s an independent British pub with home-cooked food, draught beers, and 20 free parking spaces. Taxi fare is typically around £15 each way.'
          },
          {
            question: 'What\'s the nearest pub to ibis Heathrow Bath Road?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub to ibis Heathrow Bath Road, approximately 12 minutes away. We serve traditional British pub food with mains from £8.99, much better value than hotel dining.'
          },
          {
            question: 'Is food at The Anchor near ibis Heathrow good value?',
            answer: 'Yes, mains start from £8.99 and everything is freshly cooked to order. Stone-baked pizzas from £12, classic fish & chips, and a full menu of British pub favourites.'
          },
          {
            question: 'Can I get a taxi from ibis Heathrow to The Anchor?',
            answer: 'Yes, use Uber or ask the ibis reception for a local taxi. Tell the driver "The Anchor pub, Stanwell Moor, TW19 6AQ". The journey is approximately 12 minutes and costs around £15.'
          },
          {
            question: 'Is The Anchor near ibis Heathrow open in the evenings?',
            answer: 'Yes, we open at 4pm Tuesday to Friday and from noon on Saturdays and Sundays. Kitchen serves until 9pm Tuesday–Friday, 7pm Saturday, and 5pm Sunday. Perfect for an evening meal during your stay.'
          },
        ]}
        className="bg-anchor-green-deep"
      />

      <CTASection
        title="12 Minutes from ibis Heathrow"
        description="Independent British pub with home-cooked food, draught beers and free parking. Walk-ins welcome."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'ibis_heathrow_cta', variant: 'white' },
          { text: 'View Menu', href: '/food-menu', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 12 mins from ibis Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
