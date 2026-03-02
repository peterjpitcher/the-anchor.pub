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
  title: 'Pub Near Novotel Heathrow | 15 Mins | Free Parking | The Anchor',
  description: 'Traditional British pub 15 minutes from Novotel London Heathrow. Home-cooked food, real ales & free parking. An independent alternative to hotel dining near Heathrow.',
  keywords: 'pub near novotel heathrow, restaurant near novotel heathrow airport, novotel heathrow pub, dining near novotel heathrow west drayton, heathrow novotel bar',
  openGraph: {
    title: 'Pub Near Novotel Heathrow | 15 Mins | Free Parking | The Anchor',
    description: '15 minutes from Novotel London Heathrow. Traditional British pub with home-cooked food, real ales & free parking.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Novotel Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Novotel Heathrow | 15 Mins | Free Parking | The Anchor',
    description: '15 minutes from Novotel London Heathrow. British pub with home-cooked food, real ales & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-novotel-heathrow'
  }
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'BarOrPub'],
  '@id': 'https://www.the-anchor.pub/pub-near-novotel-heathrow#business',
  name: `${BRAND.name} - Near Novotel Heathrow`,
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
  url: 'https://www.the-anchor.pub/pub-near-novotel-heathrow',
  priceRange: '££',
  servesCuisine: ['British', 'Traditional English', 'Sunday Roast'],
}

export default function PubNearNovotelHeathrowPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Pub Near Novotel Heathrow', url: '/pub-near-novotel-heathrow' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema]) }}
      />

      <HeroWrapper
        route="/pub-near-novotel-heathrow"
        title="Pub Near Novotel Heathrow"
        description="15 minutes away — independent British pub with proper food and real ales"
        variant="default"
        primaryCta={
          <BookTableButton
            source="novotel_heathrow_hero"
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

      <section className="py-8 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle seo={{ structured: true, speakable: true }} className="text-anchor-green mb-4">
              Pub Near Novotel London Heathrow
            </PageTitle>
            <p className="text-lg text-gray-700">
              Staying at the Novotel Heathrow? The Anchor is just 15 minutes away — an independent British pub with home-cooked food from scratch, real ales, and free parking. A proper local experience away from hotel prices.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <FeatureGrid
              columns={4}
              features={[
                { icon: '🕐', title: '15 Minutes', description: 'By taxi from Novotel Heathrow', variant: 'colored', color: 'bg-green-50', className: 'rounded-xl p-6 text-center' },
                { icon: '🚖', title: '~£15–20', description: 'Typical taxi fare each way', variant: 'colored', color: 'bg-blue-50', className: 'rounded-xl p-6 text-center' },
                { icon: '🅿️', title: 'Free Parking', description: '20 spaces — arrive by car and park free', variant: 'colored', color: 'bg-amber-50', className: 'rounded-xl p-6 text-center' },
                { icon: '🇬🇧', title: 'Genuinely Local', description: 'Independent pub, not a chain', variant: 'colored', color: 'bg-red-50', className: 'rounded-xl p-6 text-center' },
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="An Independent Pub Alternative Near Novotel Heathrow"
              subtitle="The Novotel is great for a comfortable stay near Heathrow — but for your evening meal, The Anchor offers something different: a genuine British community pub with food made from scratch every day."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">What Makes The Anchor Different</h3>
                <ul className="space-y-3">
                  {[
                    'Independent pub — not a chain or hotel brand',
                    'Food cooked from scratch daily',
                    'Rotating cask ales and seasonal specials',
                    'Dog-friendly beer garden',
                    'Quiz nights, music bingo & live events',
                    'Real community atmosphere',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">Getting Here from Novotel Heathrow</h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <p className="font-semibold">By Taxi or Uber</p>
                    <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Journey is approximately 15 minutes, costing around £15–20 each way.</p>
                  </div>
                  <div>
                    <p className="font-semibold">By Car</p>
                    <p className="text-sm">Head south on the A3044 from the Heathrow area. Continue through Stanwell village and turn right onto Horton Road. The Anchor is on your left.</p>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium">Postcode: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-gray-600">Free parking — 20 spaces available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader title="Great Value Deals Worth Knowing" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 rounded-xl p-6 text-center">
                <p className="text-4xl mb-2">🍕</p>
                <h3 className="text-xl font-bold text-red-800 mb-2">Tuesday Pizza Deal</h3>
                <p className="text-3xl font-bold text-red-600 mb-2">Buy 1 Get 1 Free</p>
                <p className="text-gray-700">All stone-baked pizzas every Tuesday</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-6 text-center">
                <p className="text-4xl mb-2">🍖</p>
                <h3 className="text-xl font-bold text-amber-800 mb-2">Sunday Roast</h3>
                <p className="text-3xl font-bold text-amber-600 mb-2">From £19.99</p>
                <p className="text-gray-700">Traditional British roast — pre-booking recommended</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/food-menu">
                <Button variant="secondary" size="lg">View Full Menu</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader title="Opening Hours" />
            <BusinessHours />
            <AlertBox
              variant="info"
              title="Early flight tomorrow?"
              className="mt-6"
              content={<p>Come for dinner the evening before. We open from 4pm on weekdays and noon at weekends.</p>}
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Novotel London Heathrow?',
            answer: 'The Anchor is approximately 15 minutes by taxi from Novotel London Heathrow. The fare is typically £15–20 each way. If you have a rental car, we have 20 free parking spaces — postcode TW19 6AQ.'
          },
          {
            question: 'Is there a pub near Novotel Heathrow?',
            answer: 'Yes — The Anchor in Stanwell Moor is approximately 15 minutes from Novotel London Heathrow. It\'s an independent British pub with home-cooked food, real ales, and free parking. The short journey is well worth it for the authentic local experience.'
          },
          {
            question: 'What restaurants are near Novotel Heathrow?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub-restaurant to Novotel London Heathrow, serving traditional British food including fish & chips, burgers, steaks, and Sunday roasts. Mains start from £8.99.'
          },
          {
            question: 'Is The Anchor family-friendly near Novotel Heathrow?',
            answer: 'Yes — The Anchor is family-friendly with a large beer garden, high chairs available, and children\'s portions. Dogs are welcome in the bar and garden. We\'re a great option for families staying at the Novotel who want a proper meal out.'
          },
          {
            question: 'Can I get a taxi from Novotel Heathrow to The Anchor?',
            answer: 'Yes — use Uber or ask the Novotel reception to arrange a taxi. Tell the driver "The Anchor pub, Stanwell Moor, TW19 6AQ". The journey is approximately 15 minutes and costs around £15–20.'
          },
        ]}
        className="bg-gray-50"
      />

      <CTASection
        title="15 Minutes from Novotel Heathrow"
        description="Independent British pub with home-cooked food, real ales and free parking. Walk-ins welcome."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'novotel_heathrow_cta', variant: 'secondary' },
          { text: 'View Menu', href: '/food-menu', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 15 mins from Novotel Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
