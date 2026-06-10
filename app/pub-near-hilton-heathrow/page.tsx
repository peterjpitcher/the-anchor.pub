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
  title: 'Pub Near Hilton Heathrow | 10 Mins | Free Parking',
  description: 'Traditional British pub 10 minutes from Hilton London Heathrow Airport. Draught beers, home-cooked food & free parking. Ideal for business travellers. Book a table.',
  openGraph: {
    title: 'Pub Near Hilton Heathrow | 10 Mins | Free Parking | The Anchor',
    description: '10 minutes from Hilton London Heathrow. Traditional British pub with home-cooked food, draught beers & free parking. Perfect for business travellers.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Hilton London Heathrow Airport' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Hilton Heathrow | 10 Mins | Free Parking | The Anchor',
    description: '10 minutes from Hilton Heathrow. British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-hilton-heathrow'
  }
}

export default function PubNearHiltonHeathrowPage() {
  return (
    <>

      <HeroWrapper
        route="/pub-near-hilton-heathrow"
        title="Pub Near Hilton Heathrow"
        description="10 minutes away, a proper British pub for business travellers and leisure guests alike"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="section-spacing-sm bg-anchor-green-deep">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="text-anchor-cream-text mb-4">
              Pub Near Hilton London Heathrow Airport
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at the Hilton Heathrow? The Anchor is just 10 minutes away, a traditional British pub with home-cooked food, draught beers, and free parking. Popular with business travellers looking to escape hotel prices, we&apos;re one of the top-rated restaurants near Heathrow for guests who want something better than the hotel bar.
            </p>
          </div>
        </Container>
      </section>

      {/* Key facts */}
      <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <FeatureGrid
              columns={4}
              features={[
                { icon: '', title: '10 Minutes', description: 'By taxi from Hilton Heathrow', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£12–15', description: 'Taxi fare each way', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces, no charges', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'VAT Receipts', description: 'Full receipts for expenses', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Business traveller section */}
      <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The Business Traveller's Favourite Near Hilton Heathrow"
              subtitle="Many Hilton guests are here on business. The Anchor is the local choice for client dinners, team meals, and unwinding after a long day of meetings."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-bright mb-4">Business-Friendly Features</h3>
                <ul className="space-y-3">
                  {[
                    'Full VAT receipts for all purchases',
                    'Free WiFi throughout the pub',
                    'Quieter dining room for business meals',
                    'Group bookings for team dinners',
                    'Private hire options available',
                    'Flexible timing for early or late dining',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold-dark font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-bright mb-4">Directions from Hilton Heathrow</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">From Hilton T4 (Terminal 4)</p>
                    <p className="text-sm">Head north on Stanwell Moor Road, continue to Horton Road. 10–12 mins.</p>
                  </div>
                  <div>
                    <p className="font-semibold">From Hilton Garden Inn T2/T3</p>
                    <p className="text-sm">Head west on Bath Road, right onto Stanwell Moor Road. 12–14 mins.</p>
                  </div>
                  <div className="pt-2 border-t border-anchor-gold-dark/15">
                    <p className="text-sm font-medium">Postcode: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-anchor-cream-text/70">Uber and local taxis readily available from Hilton reception</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Food for business */}
      <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="Food & Drink at The Anchor" />
            <FeatureGrid
              columns={3}
              features={[
                { icon: '', title: 'Classic Mains', description: 'From £8.99, steaks, fish & chips, burgers and British classics cooked fresh daily', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Draught Beers', description: 'Wide selection of beers, wines and spirits, a proper British pint from £4.80', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Wine & Spirits', description: 'Quality wines, premium spirits and cocktails, all at pub prices', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
              ]}
              className="mb-8"
            />
            <div className="card-dark rounded-none p-6">
              <h3 className="text-xl font-bold text-anchor-gold-bright mb-3 text-center">Client Dinner at The Anchor</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center text-sm text-anchor-cream-text/70">
                <div>
                  <p className="font-semibold mb-1">Atmosphere</p>
                  <p>Relaxed but professional, great for building relationships</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Cost</p>
                  <p>Honest pub pricing with mains from £8.99</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Booking</p>
                  <p>Recommended for groups of 6+, call us to arrange</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening hours */}
      <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader title="Opening Hours" />
            <BusinessHours />
            <AlertBox
              variant="success"
              title="Group & private dining"
              className="mt-6"
              content={
                <p>
                  For groups of 6 or more, call us in advance so we can prepare a table.
                  Private room hire is also available for larger events.
                </p>
              }
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Hilton London Heathrow Airport?',
            answer: 'The Anchor is approximately 10–12 minutes by taxi from Hilton London Heathrow Airport Terminal 4. The taxi fare is typically £12–15 each way. If you have a rental car, we offer 20 free parking spaces.'
          },
          {
            question: 'Is there a good pub near Hilton Heathrow for business dinners?',
            answer: 'The Anchor is well-suited to business dinners. We provide full VAT receipts, have a quieter dining room away from the main bar, offer free WiFi, and can arrange group bookings. Many Hilton guests use us for client meals and team dinners.'
          },
          {
            question: 'What restaurants are near Hilton Heathrow?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub-restaurant to the Hilton Heathrow hotels, just 10–12 minutes away. We serve traditional British food including fish & chips, steaks, burgers, and Sunday roasts.'
          },
          {
            question: 'Can I get a taxi from Hilton Heathrow to The Anchor?',
            answer: 'Yes, ask the Hilton concierge to arrange a taxi, or use Uber. The journey takes about 10–12 minutes. Alternatively, if you\'ve got a rental car, you can drive and park free at the pub (postcode TW19 6AQ).'
          },
          {
            question: 'Do you provide receipts for business expenses?',
            answer: 'Yes, we provide full itemised VAT receipts for all meals and drinks. The Anchor is an expense-friendly alternative for business travellers.'
          },
        ]}
        className="bg-anchor-green-deep"
      />

      <CTASection
        title="10 Minutes from Hilton Heathrow"
        description="Traditional British pub with home-cooked food, draught beers and free parking. Perfect for business or leisure."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'hilton_heathrow_cta', variant: 'white' },
          { text: 'Private Hire', href: '/private-hire', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 10 mins from Hilton Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
