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
  title: 'Pub Near Holiday Inn Heathrow | 12 Mins | Free Parking | The Anchor',
  description: 'Great pub 12 minutes from Holiday Inn Heathrow. Family-friendly British pub with home-cooked food, real ales & free parking. A proper alternative to hotel dining.',
  keywords: 'pub near holiday inn heathrow, restaurant near holiday inn heathrow, holiday inn heathrow pub, dining near holiday inn heathrow, heathrow holiday inn bar',
  openGraph: {
    title: 'Pub Near Holiday Inn Heathrow | 12 Mins | Free Parking',
    description: '12 minutes from Holiday Inn Heathrow. Family-friendly British pub with home-cooked food, real ales & free parking.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Holiday Inn Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Holiday Inn Heathrow | 12 Mins | Free Parking',
    description: '12 minutes from Holiday Inn Heathrow. Family-friendly British pub with home-cooked food, real ales & free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pub-near-holiday-inn-heathrow'
  }
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'BarOrPub'],
  '@id': 'https://www.the-anchor.pub/pub-near-holiday-inn-heathrow#business',
  name: `${BRAND.name} - Near Holiday Inn Heathrow`,
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
  url: 'https://www.the-anchor.pub/pub-near-holiday-inn-heathrow',
  priceRange: '££',
  servesCuisine: ['British', 'Traditional English', 'Sunday Roast'],
}

export default function PubNearHolidayInnHeathrowPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Pub Near Holiday Inn Heathrow', url: '/pub-near-holiday-inn-heathrow' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema]) }}
      />

      <HeroWrapper
        route="/pub-near-holiday-inn-heathrow"
        title="Pub Near Holiday Inn Heathrow"
        description="12 minutes away — family-friendly British pub with great food and free parking"
        variant="default"
        primaryCta={
          <BookTableButton
            source="holiday_inn_heathrow_hero"
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
              Pub Near Holiday Inn Heathrow
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Staying at a Holiday Inn near Heathrow? The Anchor is just 12 minutes away — a family-friendly British pub with home-cooked food, real ales, a beer garden and free parking. Much more fun than hotel dining.
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
                { icon: '', title: '12 Minutes', description: 'By taxi from Holiday Inn Heathrow', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: '~£15–18', description: 'Typical taxi fare each way', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '', title: 'Free Parking', description: '20 spaces — no charges', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
                { icon: '‍‍', title: 'Family Friendly', description: 'Beer garden, high chairs & dog welcome', variant: 'colored', color: 'bg-anchor-bg-card', className: 'rounded-xl p-6 text-center' },
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
              title="Family Dining Near Holiday Inn Heathrow"
              subtitle="Whether you're travelling with children or looking for a relaxed group dinner, The Anchor is the family-friendly local that Holiday Inn guests return to time and time again."
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Family-Friendly Features</h3>
                <ul className="space-y-3">
                  {[
                    'Large beer garden — great for kids to run around',
                    'High chairs and children\'s menu options',
                    'Dogs welcome in bar and garden',
                    'Games and a relaxed atmosphere',
                    'Plenty of space — no cramped hotel dining',
                    'Free parking so you can come by car',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-anchor-gold font-bold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Getting Here from Holiday Inn</h3>
                <div className="space-y-3 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold">By Taxi or Uber</p>
                    <p className="text-sm">Ask for The Anchor, Stanwell Moor (TW19 6AQ). Journey approximately 12 minutes, £15–18 each way.</p>
                  </div>
                  <div>
                    <p className="font-semibold">By Car</p>
                    <p className="text-sm">Head south on the A3044 from the Heathrow area, continuing through Stanwell. Turn right onto Horton Road — free parking on arrival.</p>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium">Postcode: <strong>TW19 6AQ</strong></p>
                    <p className="text-sm text-anchor-cream-text/70">Taxis easily arranged from Holiday Inn reception</p>
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
            <SectionHeader title="Deals for Holiday Inn Guests" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-dark rounded-none p-6 text-center">
                <p className="text-4xl mb-2"></p>
                <h3 className="text-xl font-bold text-red-800 mb-2">Tuesday Pizza Deal</h3>
                <p className="text-3xl font-bold text-red-600 mb-2">Buy 1 Get 1 Free</p>
                <p className="text-anchor-cream-text/70">All stone-baked pizzas, all day Tuesday</p>
                <p className="text-sm text-anchor-cream-text/55 mt-2">Kids love it — great for families</p>
              </div>
              <div className="card-dark rounded-none p-6 text-center">
                <p className="text-4xl mb-2"></p>
                <h3 className="text-xl font-bold text-amber-800 mb-2">Sunday Roast</h3>
                <p className="text-3xl font-bold text-amber-600 mb-2">From £19.99</p>
                <p className="text-anchor-cream-text/70">Traditional British roast with all the trimmings</p>
                <p className="text-sm text-anchor-cream-text/55 mt-2">Pre-booking recommended for Sundays</p>
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
              title="Travelling with family?"
              className="mt-6"
              content={<p>Our beer garden is perfect for families. Weekends from noon, weekdays from 4pm. Book ahead for Sunday roast.</p>}
            />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'How far is The Anchor from Holiday Inn Heathrow?',
            answer: 'The Anchor is approximately 12 minutes by taxi from Holiday Inn Heathrow locations. Taxi fare is typically £15–18 each way. Free parking is available if you\'re driving a rental car — postcode TW19 6AQ.'
          },
          {
            question: 'Is The Anchor near Holiday Inn Heathrow family-friendly?',
            answer: 'Yes — The Anchor is very family-friendly. We have a large beer garden, high chairs, children\'s menu options, and dogs are welcome in the bar and garden. It\'s a much more relaxed and enjoyable experience than hotel dining for families.'
          },
          {
            question: 'What restaurants are near Holiday Inn Heathrow?',
            answer: 'The Anchor in Stanwell Moor is the closest independent pub-restaurant to the Holiday Inn Heathrow hotels, approximately 12 minutes away. We serve traditional British food including fish & chips, pizza, burgers, and Sunday roasts.'
          },
          {
            question: 'Is there a Tuesday pizza deal near Holiday Inn Heathrow?',
            answer: 'Yes! The Anchor runs a buy one get one free pizza deal every Tuesday, all day. All stone-baked pizzas are included. It\'s perfect for families or groups who want great value dining near Heathrow.'
          },
          {
            question: 'Can I walk from Holiday Inn to The Anchor?',
            answer: 'The walking route between most Holiday Inn Heathrow locations and The Anchor is not pedestrian-friendly due to road layouts. A taxi (12 mins, £15–18) is the recommended option. Free parking is available if you prefer to drive.'
          },
        ]}
        className="bg-anchor-bg"
      />

      <CTASection
        title="12 Minutes from Holiday Inn Heathrow"
        description="Family-friendly British pub with home-cooked food, real ales, beer garden and free parking."
        buttons={[
          { text: 'Book a Table', href: '/book-table', variant: 'white' },
          { text: 'Call Us', href: CONTACT.phoneHref, isPhone: true, phoneSource: 'holiday_inn_heathrow_cta', variant: 'secondary' },
          { text: 'View Menu', href: '/food-menu', variant: 'white' },
        ]}
        variant="green"
        footer="Free Parking · 12 mins from Holiday Inn Heathrow · Stanwell Moor, TW19 6AQ"
      />
    </>
  )
}
