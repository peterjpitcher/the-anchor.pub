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

      <HeroWrapper
        route="/pub-near-marriott-heathrow"
        title="Pub Near Marriott Heathrow"
        description="12 minutes away, authentic British pub for business guests and leisure travellers"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="section-spacing-sm bg-anchor-green-deep">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="text-anchor-cream-text mb-4">
              Pub Near Marriott London Heathrow
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at the Marriott Heathrow? The Anchor is just 12 minutes away, a proper British pub with home-cooked food, draught beers, and free parking. As one of the top-rated pubs near Heathrow Airport, we&apos;re a genuine escape from hotel restaurant prices.
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
                { icon: '', title: '12 Minutes', description: 'By taxi from Marriott Heathrow', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£15–18', description: 'Typical taxi fare each way', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces, no hotel charges', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'VAT Receipts', description: 'Full receipts for expenses', variant: 'colored', color: 'bg-anchor-green-card', className: 'rounded-xl p-6 text-center' },
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The Business Traveller's Local Near Marriott Heathrow"
              subtitle="Marriott guests are often here on business. The Anchor offers the perfect setting for client dinners, team meals, or simply unwinding after a long day, at a fraction of hotel restaurant prices."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-bright mb-4">Business-Friendly Features</h3>
                <ul className="space-y-3">
                  {[
                    'Full VAT receipts for all purchases',
                    'Free WiFi throughout the pub',
                    'Quieter dining room for business meals',
                    'Group bookings and private hire available',
                    'Relaxed atmosphere, no dress code',
                    'Honest pub pricing with mains from £8.99',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold-dark font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-bright mb-4">Getting Here from Marriott Heathrow</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">By Taxi or Uber</p>
                    <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). The journey takes approximately 12 minutes and costs around £15–18 each way.</p>
                  </div>
                  <div>
                    <p className="font-semibold">By Car (Rental)</p>
                    <p className="text-sm">Head south from Bath Road via the A3044. Follow signs for Stanwell/Stanwell Moor. Turn right onto Horton Road, the pub is on your left.</p>
                  </div>
                  <div className="pt-2 border-t border-anchor-gold-dark/15">
                    <p className="text-sm font-medium">Postcode: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-anchor-cream-text/70">20 free parking spaces on arrival</p>
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
            <SectionHeader title="Food & Drink at The Anchor" />
            <FeatureGrid
              columns={3}
              features={[
                { icon: '', title: 'Classic Mains', description: 'From £8.99, steaks, fish & chips, burgers and British classics cooked fresh daily', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Draught Beers', description: 'Wide selection of beers, wines and spirits, a proper British pint from £4.80', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Stone-Baked Pizza', description: 'Authentic stone-baked pizzas from £12, great for groups and families', variant: 'default', className: 'bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6 text-center' },
              ]}
              className="mb-8"
            />
            <div className="card-dark rounded-none p-6 text-center">
              <h3 className="text-xl font-bold text-anchor-gold-bright mb-3">Client Dinner? We&apos;ve Got You Covered</h3>
              <p className="text-anchor-cream-text/70 mb-4">Relaxed but professional atmosphere ideal for building relationships over a proper meal. Book in advance for groups of 6 or more.</p>
              <Link href="/food-menu">
                <Button variant="outline" size="lg">View Full Menu</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader title="Opening Hours" />
            <BusinessHours />
            <AlertBox
              variant="success"
              title="Group bookings welcome"
              className="mt-6"
              content={<p>For groups of 6 or more, call ahead so we can prepare a table. Private room hire available for larger events.</p>}
            />
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
        className="bg-anchor-green-deep"
      />

      <CTASection
        title="12 Minutes from Marriott Heathrow"
        description="Traditional British pub with home-cooked food, draught beers and free parking. Perfect for business or leisure."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'marriott_heathrow_cta', variant: 'white' },
          { text: 'Private Hire', href: '/private-hire', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 12 mins from Marriott Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
