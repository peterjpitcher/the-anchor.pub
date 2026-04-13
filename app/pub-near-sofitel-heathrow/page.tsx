import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Pub Near Sofitel Heathrow | 7 Mins from T5 | The Anchor',
  description: 'Traditional British pub just 7 minutes from Sofitel London Heathrow Terminal 5. Escape hotel prices — draught beers, home-cooked food & free parking. Book a table.',
  openGraph: {
    title: 'Pub Near Sofitel Heathrow T5 | 7 Mins Away | The Anchor',
    description: 'Just 7 minutes from Sofitel London Heathrow. Real British pub with home-cooked food, draught beers & free parking. Honest pub pricing.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Sofitel Heathrow Terminal 5' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Sofitel Heathrow T5 | 7 Mins Away | The Anchor',
    description: 'Just 7 minutes from Sofitel London Heathrow. Real British pub with home-cooked food, draught beers & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-sofitel-heathrow'
  }
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'BarOrPub'],
  '@id': 'https://www.the-anchor.pub/pub-near-sofitel-heathrow#business',
  name: `${BRAND.name} - Near Sofitel Heathrow`,
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
  url: 'https://www.the-anchor.pub/pub-near-sofitel-heathrow',
  priceRange: '££',
  servesCuisine: ['British', 'Traditional English', 'Sunday Roast'],
  nearbyAttractions: [
    { '@type': 'Hotel', name: 'Sofitel London Heathrow', description: '7 minutes away' }
  ]
}

export default function PubNearSofitelHeathrowPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Pub Near Sofitel Heathrow', url: '/pub-near-sofitel-heathrow' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema]) }}
      />

      <HeroWrapper
        route="/pub-near-sofitel-heathrow"
        title="Pub Near Sofitel Heathrow"
        description="Just 7 minutes from Terminal 5 — authentic British pub at half the hotel price"
        variant="default"
        primaryCta={
          <BookTableButton
            source="sofitel_heathrow_hero"
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
              Pub Near Sofitel London Heathrow Terminal 5
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at the Sofitel? The Anchor is just 7 minutes away — real British pub food, proper pints, and free parking at a fraction of hotel prices. We&apos;re one of the best pubs near Heathrow Airport for guests who want a proper local experience over hotel dining.
            </p>
          </div>
        </Container>
      </section>

      {/* Key facts */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <FeatureGrid
              columns={4}
              features={[
                { icon: '', title: '7 Minutes', description: 'By taxi from Sofitel Heathrow T5', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£12–15', description: 'Taxi fare each way', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces if you\'re driving', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Half Price', description: 'vs Sofitel restaurant mains', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Why The Anchor over Sofitel dining */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Real Pub Experience Near Sofitel Heathrow"
              subtitle="The Sofitel is one of the finest airport hotels in the world — but for a proper British pub night, The Anchor is your answer."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">What You Get at The Anchor</h3>
                <ul className="space-y-3">
                  {[
                    'Home-cooked British food from £8.99',
                    'Draught beers and lagers',
                    'Warm, unpretentious pub atmosphere',
                    'Dog-friendly beer garden',
                    'No dress code, no pressure',
                    'Full VAT receipts for business expenses',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Directions from Sofitel T5</h3>
                <ol className="space-y-2 text-anchor-cream-text/70 list-decimal list-inside">
                  <li>Exit Sofitel, head north on Northern Perimeter Rd</li>
                  <li>Turn left at Stanwell Moor Road</li>
                  <li>Continue to Horton Road</li>
                  <li>The Anchor is on your right</li>
                </ol>
                <p className="mt-4 text-sm text-anchor-cream-text/70 font-medium">Postcode for sat-nav: TW19 6AQ</p>
                <p className="mt-2 text-sm text-anchor-cream-text/70">Or tell your taxi driver: "The Anchor pub, Stanwell Moor"</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Food highlights */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="What Sofitel Guests Order at The Anchor" />
            <FeatureGrid
              columns={3}
              features={[
                { icon: '', title: 'Fish & Chips', description: 'Classic British dish — fresh battered cod with chips and mushy peas', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Sunday Roast', description: 'Traditional roast from £19 — a British institution worth experiencing', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
                { icon: '', title: 'Stone-Baked Pizza', description: 'Authentic stone-baked pizzas from £12 — great for sharing', variant: 'default', className: 'bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center' },
              ]}
              className="mb-8"
            />
            <div className="text-center">
              <Link href="/food-menu">
                <Button variant="secondary" size="lg">View Full Menu</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening hours */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader title="Opening Hours" />
            <BusinessHours />
            <AlertBox
              variant="info"
              title="Planning an early flight?"
              className="mt-6"
              content={<p>We open from noon on weekends and 4pm weekdays. Perfect for a pre-flight dinner the evening before.</p>}
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Sofitel London Heathrow?',
            answer: 'The Anchor is approximately 7 minutes by taxi from the Sofitel London Heathrow Terminal 5. The fare is typically £12–15 each way. If you\'re driving a rental car, we have 20 free parking spaces.'
          },
          {
            question: 'Is there a pub walking distance from Sofitel Heathrow?',
            answer: 'The Anchor is not within easy walking distance of the Sofitel (the route is not pedestrian-friendly). However, it\'s just 7 minutes by taxi or Uber. Most guests say the short journey is absolutely worth it.'
          },
          {
            question: 'What food is available near Sofitel Heathrow Terminal 5?',
            answer: 'The Anchor offers a full British pub menu including fish & chips, stone-baked pizza, burgers, Sunday roasts (weekends), and daily specials. Kitchen hours are typically 6–9pm Tuesday–Friday and from noon on weekends.'
          },
          {
            question: 'Do you cater for business travellers from Sofitel?',
            answer: 'Absolutely. We provide full VAT receipts, have free WiFi, and offer a quiet dining room for business meals. Many Heathrow business travellers choose us to escape hotel prices while still having a professional environment.'
          },
          {
            question: 'Can I get a taxi back to Sofitel from The Anchor?',
            answer: 'Yes — our staff can help you call a taxi, or you can use Uber from the pub. The return journey to Sofitel Heathrow Terminal 5 typically takes 7–10 minutes and costs £12–15.'
          },
        ]}
        className="bg-anchor-bg"
      />

      <CTASection
        title="7 Minutes from Sofitel — Worth Every Second"
        description="Authentic British pub food and draught beers at honest prices. Book a table or just walk in."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'sofitel_heathrow_cta', variant: 'secondary' },
          { text: 'View Menu', href: '/food-menu', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 7 mins from Sofitel Heathrow T5 · TW19 6AQ"
      />
    </>
  )
}
