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
  title: 'Pub Near Premier Inn Heathrow | 8 Mins | Free Parking | The Anchor',
  description: 'Great pub just 8 minutes from Premier Inn Heathrow. Independent British pub with home-cooked food, real ales & free parking. A real alternative to hotel dining.',
  openGraph: {
    title: 'Pub Near Premier Inn Heathrow | 8 Mins | Free Parking',
    description: '8 minutes from Premier Inn Heathrow. Independent British pub with home-cooked food, real ales & 20 free parking spaces.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Premier Inn Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Premier Inn Heathrow | 8 Mins | Free Parking',
    description: '8 minutes from Premier Inn Heathrow. Independent British pub with home-cooked food, real ales & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-premier-inn-heathrow'
  }
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'BarOrPub'],
  '@id': 'https://www.the-anchor.pub/pub-near-premier-inn-heathrow#business',
  name: `${BRAND.name} - Near Premier Inn Heathrow`,
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
  url: 'https://www.the-anchor.pub/pub-near-premier-inn-heathrow',
  priceRange: '££',
  servesCuisine: ['British', 'Traditional English', 'Sunday Roast'],
}

export default function PubNearPremierInnHeathrowPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Pub Near Premier Inn Heathrow', url: '/pub-near-premier-inn-heathrow' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema]) }}
      />

      <HeroWrapper
        route="/pub-near-premier-inn-heathrow"
        title="Pub Near Premier Inn Heathrow"
        description="8 minutes away — independent British pub with proper food and free parking"
        variant="default"
        primaryCta={
          <BookTableButton
            source="premier_inn_heathrow_hero"
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
              Pub Near Premier Inn Heathrow Terminal 5
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at Premier Inn Heathrow? Skip the Brewers Fayre and discover The Anchor — an independent British pub just 8 minutes away with better food, real ales, and free parking. One of the best pubs near Heathrow Airport, we offer a proper alternative to hotel dining with home-cooked meals and a genuinely local atmosphere.
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
                { icon: '', title: '8 Minutes', description: 'By taxi from Premier Inn Heathrow T5', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£10–12', description: 'Short taxi fare each way', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces — no hourly charges', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Real Ales', description: 'Proper draught beer, not just lager', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Why choose The Anchor */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="An Independent Pub Alternative Near Premier Inn Heathrow"
              subtitle="Premier Inn is great value accommodation — but for your evening out, The Anchor offers something the hotel bar simply can't: a genuine British local pub experience."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Why Guests Choose Us</h3>
                <ul className="space-y-3">
                  {[
                    'Independent pub — not a chain or franchise',
                    'Home-cooked food from scratch daily',
                    'Rotating specials and seasonal dishes',
                    'Dog-friendly beer garden (bring your pet!)',
                    'Local regulars — meet real people',
                    'Quiz nights, music bingo & live events',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Getting Here from Premier Inn</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">From Premier Inn T5 (Northern Perimeter Rd)</p>
                    <p className="text-sm">Head south on A3044, left on Stanwell Rd, right on Horton Rd. 8 mins.</p>
                  </div>
                  <div>
                    <p className="font-semibold">From Premier Inn Bath Road</p>
                    <p className="text-sm">Take A4 east, then south on Stanwell Moor Road. 10–12 mins.</p>
                  </div>
                  <div className="pt-2 border-t border-anchor-gold/15">
                    <p className="text-sm font-medium">Postcode for sat-nav or taxi: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-anchor-cream-text/70">Uber and local taxis work well from all Premier Inn locations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Tuesday deal */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader title="Deals Worth Knowing About" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-dark rounded-none p-6 text-center">
                <p className="text-4xl mb-2"></p>
                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">Tuesday Pizza Deal</h3>
                <p className="text-3xl font-bold text-red-400 mb-2">Buy 1 Get 1 Free</p>
                <p className="text-anchor-cream-text/70">All stone-baked pizzas, all day Tuesday</p>
                <p className="text-sm text-anchor-cream-text/55 mt-2">Perfect if your stay includes a Tuesday</p>
              </div>
              <div className="card-dark rounded-none p-6 text-center">
                <p className="text-4xl mb-2"></p>
                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">Sunday Roast</h3>
                <p className="text-3xl font-bold text-amber-300 mb-2">From £19.99</p>
                <p className="text-anchor-cream-text/70">Traditional British roast with all the trimmings</p>
                <p className="text-sm text-anchor-cream-text/55 mt-2">Pre-booking recommended for Sundays</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/food-menu">
                <Button variant="secondary" size="lg">View Full Menu & Prices</Button>
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
              title="Early flight tomorrow?"
              className="mt-6"
              content={<p>Come for dinner the evening before. We&apos;re open from 4pm on weekdays and noon on weekends.</p>}
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'Is there a pub near Premier Inn Heathrow Terminal 5?',
            answer: 'Yes — The Anchor in Stanwell Moor is just 8 minutes by taxi from Premier Inn Heathrow Terminal 5. It\'s an independent British pub with home-cooked food, real ales, and 20 free parking spaces. Taxi fare is typically £10–12 each way.'
          },
          {
            question: 'What\'s the nearest pub to Premier Inn Heathrow Bath Road?',
            answer: 'The Anchor is approximately 10–12 minutes from Premier Inn Heathrow Bath Road. Take a quick taxi (around £12) or drive and park free. It\'s the closest independent pub to all Heathrow hotels.'
          },
          {
            question: 'Is The Anchor better than the Premier Inn restaurant?',
            answer: 'Both are great options for different reasons. The Anchor offers an independent, locally-run British pub experience with home-cooked food, rotating specials, and a genuine community atmosphere. If you\'re looking for something beyond a chain restaurant, The Anchor is worth the short trip.'
          },
          {
            question: 'What\'s on the menu near Premier Inn Heathrow?',
            answer: 'The Anchor serves traditional British pub food including fish & chips, stone-baked pizzas, burgers, Sunday roasts (weekends, pre-booking advised), and daily specials. Mains start from around £8.99.'
          },
          {
            question: 'Can I walk from Premier Inn to The Anchor?',
            answer: 'The walking route between most Premier Inn Heathrow locations and The Anchor is not pedestrian-friendly due to road layouts. A taxi (8–12 mins, £10–15) is the recommended option. If you\'re driving, free parking is available at the pub.'
          },
        ]}
        className="bg-anchor-bg"
      />

      <CTASection
        title="8 Minutes from Premier Inn Heathrow"
        description="Independent British pub with home-cooked food, real ales and free parking. Walk-ins welcome."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'premier_inn_heathrow_cta', variant: 'secondary' },
          { text: 'View Menu', href: '/food-menu', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 8 mins from Premier Inn T5 · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
