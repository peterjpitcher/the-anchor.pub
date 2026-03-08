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
  title: 'Pub Near Radisson Blu Heathrow | 12 Mins | The Anchor',
  description: 'Authentic British pub 12 minutes from Radisson Blu Edwardian Heathrow. Real ales, home-cooked food & free parking. A genuine local alternative to hotel dining.',
  keywords: 'pub near radisson blu heathrow, restaurant near radisson blu heathrow, radisson blu heathrow pub, dining near radisson edwardian heathrow, heathrow radisson bar',
  openGraph: {
    title: 'Pub Near Radisson Blu Heathrow | 12 Mins | The Anchor',
    description: '12 minutes from Radisson Blu Edwardian Heathrow. Authentic British pub with home-cooked food, real ales & free parking.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Radisson Blu Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Radisson Blu Heathrow | 12 Mins | The Anchor',
    description: '12 minutes from Radisson Blu Heathrow. British pub with home-cooked food, real ales & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-radisson-blu-heathrow'
  }
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'BarOrPub'],
  '@id': 'https://www.the-anchor.pub/pub-near-radisson-blu-heathrow#business',
  name: `${BRAND.name} - Near Radisson Blu Heathrow`,
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
  url: 'https://www.the-anchor.pub/pub-near-radisson-blu-heathrow',
  priceRange: '££',
  servesCuisine: ['British', 'Traditional English', 'Sunday Roast'],
}

export default function PubNearRadissonBluHeathrowPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Pub Near Radisson Blu Heathrow', url: '/pub-near-radisson-blu-heathrow' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema]) }}
      />

      <HeroWrapper
        route="/pub-near-radisson-blu-heathrow"
        title="Pub Near Radisson Blu Heathrow"
        description="12 minutes away — authentic British local for Radisson guests seeking a genuine experience"
        variant="default"
        primaryCta={
          <BookTableButton
            source="radisson_blu_heathrow_hero"
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
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      <section className="py-8 bg-anchor-bg">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="text-anchor-cream-text mb-4">
              Pub Near Radisson Blu Edwardian Heathrow
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at the Radisson Blu Heathrow? The Anchor is just 12 minutes away — a genuine British community pub with home-cooked food, real ales, and free parking. The authentic local experience your hotel can&apos;t offer.
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
                { icon: '', title: '12 Minutes', description: 'By taxi from Radisson Blu Heathrow', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£15–18', description: 'Typical taxi fare each way', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces — no charges at all', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Authentically Local', description: 'A real community pub since the 1800s', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
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
              title="Authentic British Pub Near Radisson Blu Heathrow"
              subtitle="The Radisson Blu is an outstanding hotel — but for a genuinely British pub night, The Anchor is where Radisson guests go when they want to experience real local life rather than another hotel bar."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">What You Get at The Anchor</h3>
                <ul className="space-y-3">
                  {[
                    'Home-cooked British food — from £8.99',
                    'Rotating cask ales and craft beers',
                    'Warm, unpretentious community atmosphere',
                    'Dog-friendly beer garden',
                    'Full VAT receipts for business expenses',
                    'Regular events — quiz, music bingo, karaoke',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Directions from Radisson Blu</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">By Taxi or Uber</p>
                    <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Approximately 12 minutes, £15–18 each way. Ask the hotel concierge to arrange.</p>
                  </div>
                  <div>
                    <p className="font-semibold">By Car</p>
                    <p className="text-sm">Take the A3044 south toward Stanwell. Continue through the village and turn right onto Horton Road. Free parking on arrival.</p>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
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
            <SectionHeader title="Popular with Radisson Guests" />
            <FeatureGrid
              columns={3}
              features={[
                { icon: '', title: 'Fish & Chips', description: 'The quintessential British dish — fresh battered cod with chips and mushy peas.', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Sunday Roast', description: 'Traditional roast from £19.99 — pre-booking recommended for weekends.', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Real Ale Selection', description: 'Rotating cask ales — ask what\'s on. Proper British beer culture.', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
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
              title="Planning ahead?"
              className="mt-6"
              content={<p>Book a table in advance for weekend visits, especially for Sunday roast. We open from 4pm weekdays and noon at weekends.</p>}
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Radisson Blu Edwardian Heathrow?',
            answer: 'The Anchor is approximately 12 minutes by taxi from Radisson Blu Edwardian Heathrow. Taxi fare is typically £15–18 each way. Free parking is available if you are driving — postcode TW19 6AQ.'
          },
          {
            question: 'Is there a pub near Radisson Blu Heathrow?',
            answer: 'Yes — The Anchor in Stanwell Moor is the closest independent pub to Radisson Blu Edwardian Heathrow, approximately 12 minutes away. It\'s an authentic British pub with home-cooked food, real ales, and a genuine community atmosphere.'
          },
          {
            question: 'What restaurants are near Radisson Blu Heathrow?',
            answer: 'The Anchor serves traditional British pub food including fish & chips, Sunday roasts, burgers, steaks and daily specials. It\'s approximately 12 minutes from Radisson Blu Heathrow, with mains from £8.99.'
          },
          {
            question: 'Does The Anchor near Radisson Blu cater for business expenses?',
            answer: 'Yes — full itemised VAT receipts are provided for all purchases. We also have free WiFi and a quieter dining room suitable for business meals.'
          },
          {
            question: 'Can I get a return taxi from The Anchor to Radisson Blu Heathrow?',
            answer: 'Yes — our staff are happy to help arrange a taxi, or you can use Uber from the pub. The return journey to Radisson Blu Heathrow takes approximately 12 minutes and costs around £15–18.'
          },
        ]}
        className="bg-anchor-bg"
      />

      <CTASection
        title="12 Minutes from Radisson Blu Heathrow"
        description="Authentic British pub with home-cooked food, real ales and free parking. A genuine local experience."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'radisson_blu_heathrow_cta', variant: 'secondary' },
          { text: 'View Menu', href: '/food-menu', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 12 mins from Radisson Blu Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
