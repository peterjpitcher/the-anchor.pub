import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Pub Near Crowne Plaza Heathrow | 12 Mins | Free Parking | The Anchor',
  description: 'Traditional British pub 12 minutes from Crowne Plaza London Heathrow. Real ales, home-cooked food & free parking. The ideal local for corporate guests.',
  keywords: 'pub near crowne plaza heathrow, restaurant near crowne plaza heathrow, crowne plaza heathrow pub, dining near crowne plaza heathrow t4, heathrow crowne plaza bar',
  openGraph: {
    title: 'Pub Near Crowne Plaza Heathrow | 12 Mins | Free Parking',
    description: '12 minutes from Crowne Plaza London Heathrow. Traditional British pub with home-cooked food, real ales & free parking. Great for corporate dining.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Crowne Plaza Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Crowne Plaza Heathrow | 12 Mins | Free Parking',
    description: '12 minutes from Crowne Plaza Heathrow. British pub with home-cooked food, real ales & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-crowne-plaza-heathrow'
  }
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'BarOrPub'],
  '@id': 'https://www.the-anchor.pub/pub-near-crowne-plaza-heathrow#business',
  name: `${BRAND.name} - Near Crowne Plaza Heathrow`,
  image: `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT.address.street,
    addressLocality: CONTACT.address.town,
    addressRegion: 'Surrey',
    postalCode: CONTACT.address.postcode,
    addressCountry: 'GB'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: CONTACT.coordinates.lat,
    longitude: CONTACT.coordinates.lng
  },
  telephone: CONTACT.phoneIntl,
  url: 'https://www.the-anchor.pub/pub-near-crowne-plaza-heathrow',
  priceRange: '££',
  servesCuisine: ['British', 'Traditional English', 'Sunday Roast'],
}

export default function PubNearCrownePlazaHeathrowPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Pub Near Crowne Plaza Heathrow', url: '/pub-near-crowne-plaza-heathrow' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema]) }}
      />

      <HeroWrapper
        route="/pub-near-crowne-plaza-heathrow"
        title="Pub Near Crowne Plaza Heathrow"
        description="12 minutes away — a proper British pub for corporate guests and team dinners"
        variant="default"
        primaryCta={
          <BookTableButton
            source="crowne_plaza_heathrow_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View Menu
            </Button>
          </Link>
        }
      />

      <section className="py-8 bg-anchor-bg">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="text-anchor-cream-text mb-4">
              Pub Near Crowne Plaza London Heathrow
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at the Crowne Plaza Heathrow? The Anchor is just 12 minutes away — a traditional British pub with home-cooked food, real ales, and free parking. Popular with corporate guests looking for a genuine local experience.
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
                { icon: '🕐', title: '12 Minutes', description: 'By taxi from Crowne Plaza Heathrow', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '🚖', title: '~£15–18', description: 'Typical taxi fare each way', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '🅿️', title: 'Free Parking', description: '20 spaces — no charges', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '🍽️', title: 'Group Bookings', description: 'Private dining for teams of any size', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
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
              title="Corporate Dining Near Crowne Plaza Heathrow"
              subtitle="The Crowne Plaza is a favourite for international business travellers. When you need a proper dinner that isn't a hotel restaurant, The Anchor offers the perfect alternative — relaxed, professional, and genuinely British."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Why Corporate Guests Choose Us</h3>
                <ul className="space-y-3">
                  {[
                    'Full VAT receipts for all purchases',
                    'Private dining room for team events',
                    'Free WiFi — work while you eat',
                    'Group bookings taken in advance',
                    'Quieter than the hotel bar',
                    'Honest pub pricing with mains from £8.99',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Getting Here from Crowne Plaza</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">By Taxi or Uber</p>
                    <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Journey takes approximately 12 minutes, £15–18 each way.</p>
                  </div>
                  <div>
                    <p className="font-semibold">By Car</p>
                    <p className="text-sm">Join the A3044 heading south toward Stanwell. Continue through Stanwell village, turn right onto Horton Road. The Anchor is on your left.</p>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium">Sat-nav postcode: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-anchor-cream-text/70">Free parking for all pub guests</p>
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
            <SectionHeader title="Menu Highlights" />
            <FeatureGrid
              columns={3}
              features={[
                { icon: '🥩', title: 'British Classics', description: 'Steaks, fish & chips, burgers and daily specials — all cooked fresh from £8.99', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
                { icon: '🍺', title: 'Real Ales', description: 'Rotating cask ales and craft beers — proper pub drinking from £4.80 a pint', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
                { icon: '🥗', title: 'Sunday Roast', description: 'Traditional British roast from £19.99 — pre-booking recommended for weekends', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
              ]}
              className="mb-6"
            />
            <div className="text-center">
              <Link href="/food-menu">
                <Button variant="secondary" size="lg">View Full Menu & Prices</Button>
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
              title="Planning a team dinner?"
              className="mt-6"
              content={<p>Call ahead for groups of 6 or more and we&apos;ll reserve the best table. Private room hire available for larger gatherings.</p>}
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Crowne Plaza London Heathrow?',
            answer: 'The Anchor is approximately 12 minutes by taxi from Crowne Plaza London Heathrow. Taxi fare is typically £15–18 each way. If driving a rental car, we have 20 free parking spaces — postcode TW19 6AQ.'
          },
          {
            question: 'Is there a good pub near Crowne Plaza Heathrow for corporate dining?',
            answer: 'The Anchor is an excellent choice for corporate dining. We offer full VAT receipts, a private dining room, free WiFi, and can handle group bookings.'
          },
          {
            question: 'What is the nearest pub to Crowne Plaza Heathrow?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub-restaurant to Crowne Plaza London Heathrow, approximately 12 minutes away. We serve traditional British food and have free parking.'
          },
          {
            question: 'Can I book a private dining room near Crowne Plaza Heathrow?',
            answer: 'Yes — The Anchor has a private dining room suitable for team dinners and corporate events. Call us to discuss availability and arrange a bespoke menu for your group. Private hire is also available for larger events.'
          },
          {
            question: 'Do you provide VAT receipts for business expenses near Crowne Plaza?',
            answer: 'Yes, we provide full itemised VAT receipts for all food and drink, making us a smart choice for business expense management.'
          },
        ]}
        className="bg-anchor-bg"
      />

      <CTASection
        title="12 Minutes from Crowne Plaza Heathrow"
        description="Traditional British pub with home-cooked food, real ales and free parking. Perfect for corporate dining."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'crowne_plaza_heathrow_cta', variant: 'secondary' },
          { text: 'Private Hire', href: '/private-hire', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 12 mins from Crowne Plaza Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
