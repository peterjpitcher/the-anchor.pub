import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, Section, SectionHeading, FeatureGrid, InfoBoxGrid, CTASection, Button, Card, CardBody } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessHours } from '@/lib/api'
import { generateOpeningHoursSpecification } from '@/lib/schema-utils'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { HeathrowFoodBestFor } from '@/components/food/HeathrowFoodBestFor'
import { PlaneSpottingScheduleNote } from '@/components/plane-spotting/PlaneSpottingScheduleNote'
import { PlaneSpottingBookingPrompt } from '@/components/plane-spotting/PlaneSpottingBookingPrompt'

export const metadata: Metadata = {
  title: 'Heathrow Plane Spotting Pub | Beer Garden Views',
  description: 'Watch planes at Heathrow from The Anchor beer garden in Stanwell Moor. Free customer parking, food, WiFi and aircraft overhead near Terminal 5.',
  openGraph: {
    title: 'Heathrow Plane Spotting Pub and Beer Garden | The Anchor',
    description: 'Watch Heathrow aircraft from a proper pub beer garden with food, drinks, WiFi and free customer parking near Terminal 5.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }]
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Plane Spotting Pub and Beer Garden | The Anchor',
    description: 'Watch aircraft from our Stanwell Moor beer garden with food, drinks, WiFi and free customer parking.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/plane-spotting-heathrow'
  }
}

export default async function PlaneSpottingHeathrowPage() {
  const businessHours = await getBusinessHours()
  const openingHoursSpecification = generateOpeningHoursSpecification(businessHours)
  const planeSpottingSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    '@id': 'https://www.the-anchor.pub/plane-spotting-heathrow',
    name: 'The Anchor - Heathrow Plane Spotting Pub',
    description: 'Heathrow plane spotting venue with a beer garden under the expected 27R flight path, offering food, drinks and shelter year-round.',
    url: 'https://www.the-anchor.pub/plane-spotting-heathrow',
    image: DEFAULT_NEAR_HEATHROW_IMAGE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Horton Road',
      addressLocality: 'Stanwell Moor',
      postalCode: 'TW19 6AQ',
      addressRegion: 'Surrey',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.462509,
      longitude: -0.502067
    },
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free Parking', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Outdoor Seating', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'WiFi Access', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Food & Drink Service', value: true }
    ],
    isAccessibleForFree: true,
    publicAccess: true
  }
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Plane Spotting Heathrow', url: '/plane-spotting-heathrow' }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(planeSpottingSchema) }}
      />
      <FoodStickyCtaBar
        ctaContext="heathrow_layover"
        label="Book a Table for Food"
      />
      <PlaneSpottingBookingPrompt source="plane_spotting_page_prompt" />

      <HeroWrapper
        route="/plane-spotting-heathrow"
        title="Heathrow Plane Spotting Pub and Beer Garden"
        description="Plan a spotting visit from a proper pub table in Stanwell Moor. Food, drinks, WiFi and free customer parking minutes from Terminal 5."
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <Section background="dark" spacing="sm" className="bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <PlaneSpottingScheduleNote
            variant="panel"
            showCta
            ctaSource="plane_spotting_today_panel"
          />
        </Container>
      </Section>

      <Section background="dark" spacing="sm">
        <Container>
          <p className="mx-auto max-w-4xl text-center text-lg text-anchor-cream-text/80">
            Looking for a Heathrow viewing area with food and shelter? The Anchor is the commercial landing page for visiting our beer garden. For a full comparison of every spotting location, use our dedicated Heathrow plane spotting locations guide.
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/blog/heathrow-plane-spotting-locations">
              <Button variant="outline" size="md">
                Compare all Heathrow viewing areas
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
      <HeathrowFoodBestFor
        title="Best For Plane Spotters"
        items={[
          ['Plane spotting day', 'Use the beer garden as a comfortable base when overhead arrivals are operating.'],
          ['Lunch between arrivals', 'Book a table and keep your group settled between busy approach windows.'],
          ['Family meal', 'Pub classics, pizzas and a garden that keeps the visit relaxed.'],
          ['Sunday roast', 'Served Sundays from 1pm to 6pm, ideal after a morning in the garden.'],
          ['Aviation meet-up', 'Food, WiFi, free parking and a clear meeting point near Terminal 5.'],
        ]}
      />

      <Section background="dark" spacing="sm">
        <Container>
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
            <Card className="card-dark">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-bright mb-2">Sunday Roast Before/After Spotting</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Walk in 1pm-6pm or book ahead - Yorkshire puddings, crispy potatoes and real gravy after a spotting morning.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="plane_spotting_roast_cta"
                    variant="primary"
                    size="sm"
                  >
                    Book Sunday Roast
                  </BookTableButton>
                  <Link href="/sunday-roast" className="text-sm text-anchor-gold-dark font-semibold hover:text-anchor-green transition">
                    Sunday roast menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-bright mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Hand-stretched pizzas with bold toppings, a favourite with aviation meet-ups and crew nights.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="plane_spotting_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-anchor-gold-dark font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-bright mb-2">Hot Food & Drinks All Day</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Burgers, fish & chips, sharers and a full bar served to the beer garden. Free parking and WiFi keep you comfortable between arrivals.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="plane_spotting_food_cta"
                    variant="primary"
                    size="sm"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-anchor-gold-dark font-semibold hover:text-anchor-green transition">
                    Browse food menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="sm">
        <Container>
          <PageTitle className="text-center text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
            Heathrow Plane Spotting Pub, Food and Free Customer Parking
          </PageTitle>
        </Container>
      </Section>

      <Section background="dark" spacing="md">
        <Container>
          <SectionHeading
            title="Best Heathrow Plane Spotting Locations"
            subtitle="Front-row views, hot food and shelter when the weather turns – everything you need for an aviation day out."
          />
          <FeatureGrid
            columns={3}
            features={[
              {
                icon: '',
                title: 'Under the Flight Path',
                description: 'On westerly operations with 27R arrivals, you are aligned with the landing path. Aircraft overhead is expected, not guaranteed.',
                variant: 'default',
                className: 'bg-anchor-green-raised rounded-2xl p-6 border border-anchor-gold-dark/15 text-left'
              },
              {
                icon: '',
                title: 'Photo-Friendly Garden',
                description: 'Low perimeter fencing, open sky and WiFi for FlightRadar24. Tripods welcome and heaters keep winter sessions comfortable.',
                variant: 'default',
                className: 'bg-anchor-green-raised rounded-2xl p-6 border border-anchor-gold-dark/15 text-left'
              },
              {
                icon: '',
                title: 'Proper Refreshments',
                description: 'Stone-baked pizzas, Sunday roasts and full drinks menu available. Toilets, power sockets and indoor seating if the rain hits.',
                variant: 'default',
                className: 'bg-anchor-green-raised rounded-2xl p-6 border border-anchor-gold-dark/15 text-left'
              }
            ]}
          />
        </Container>
      </Section>

      <Section background="dark" spacing="md" className="bg-anchor-green-raised border-y border-anchor-gold-dark/15">
        <Container>
          <SectionHeading
            title="Plan Your Heathrow Plane Watching Trip"
            subtitle="Make the most of every arrival with timings, transport and kit tips."
          />
          <InfoBoxGrid
            columns={3}
            className="max-w-5xl mx-auto"
            boxes={[
              {
                title: 'Best Times to Visit',
                content: (
                  <ul className="list-disc list-inside text-anchor-cream-text/70 space-y-2 text-left">
                    <li>06:00-09:00 for sunrise arrivals and cargo</li>
                    <li>16:00-20:00 evening long-haul waves</li>
                    <li>Check METAR: westerly winds bring aircraft overhead</li>
                  </ul>
                ),
                variant: 'colored',
                color: 'bg-anchor-green-raised rounded-2xl p-6 border border-anchor-gold-dark/15'
              },
              {
                title: 'Getting Here',
                content: (
                  <ul className="list-disc list-inside text-anchor-cream-text/70 space-y-2 text-left">
                    <li>7 minutes from Heathrow Terminal 5 via A3044</li>
                    <li>Free on-site parking for patrons</li>
                    <li>442 bus stops outside – perfect for spotters without a car</li>
                  </ul>
                ),
                variant: 'colored',
                color: 'bg-anchor-green-raised rounded-2xl p-6 border border-anchor-gold-dark/15'
              },
              {
                title: 'What to Bring',
                content: (
                  <ul className="list-disc list-inside text-anchor-cream-text/70 space-y-2 text-left">
                    <li>Camera with 70-200mm lens covers most arrivals</li>
                    <li>Radio scanner or FR24 app (free WiFi provided)</li>
                    <li>Layers – the beer garden is sheltered but breezy</li>
                  </ul>
                ),
                variant: 'colored',
                color: 'bg-anchor-green-raised rounded-2xl p-6 border border-anchor-gold-dark/15'
              }
            ]}
          />
        </Container>
      </Section>

      <Section background="dark" spacing="md">
        <Container>
          <SectionHeading
            title="Other Heathrow Viewing Areas & Spotting Spots"
            subtitle="Make a full day of it by pairing The Anchor with these classic viewing spots."
          />
          <FeatureGrid
            columns={2}
            features={[
              {
                icon: '',
                title: 'Myrtle Avenue',
                description: 'Legendary runway 27L arrivals spot in Hatton Cross. Pair with The Anchor for food, drinks and runway 27R coverage.',
                variant: 'default',
                className: 'bg-anchor-green-raised rounded-2xl p-6 border border-anchor-gold-dark/15 text-left'
              },
              {
                icon: '',
                title: 'Visitors Centre / Renaissance Hotel',
                description: 'Great for departures on easterly operations. Wrap up the day with a pint at The Anchor before heading home.',
                variant: 'default',
                className: 'bg-anchor-green-raised rounded-2xl p-6 border border-anchor-gold-dark/15 text-left'
              }
            ]}
          />
        </Container>
      </Section>

      <FAQAccordionWithSchema
        className="bg-anchor-green-raised"
        faqs={[
          {
            question: 'Do I need to book a table for plane spotting?',
            answer: 'Booking is recommended at busy times (sunny weekends, major aviation events). Walk-ins are welcome subject to garden capacity and weather.'
          },
          {
            question: 'Is there shelter if it rains?',
            answer: 'Yes. Our heated, covered areas and indoor seating mean you can keep spotting even in showers. Staff are happy to update you on runway usage.'
          },
          {
            question: 'What aircraft will I see from The Anchor?',
            answer: 'When runway 27R arrivals are operating, you may see British Airways, Virgin Atlantic, Emirates A380s, Qatar Airways, American Airlines and cargo airlines. Plane spotting is weather and Heathrow operations dependent, so aircraft overhead cannot be guaranteed.'
          },
          {
            question: 'Can I charge batteries or use WiFi?',
            answer: 'Yes. We provide free WiFi for flight tracking and have indoor sockets for charging devices while you grab a drink or meal.'
          },
          {
            question: 'Are families and dogs welcome?',
            answer: 'Absolutely. The beer garden is dog friendly and we have children’s meals plus soft drinks, mocktails and hot drinks for family visits.'
          }
        ]}
      />

      <OrganicSearchClusterLinks
        cluster="planeSpotting"
        currentPath="/plane-spotting-heathrow"
        title="Plan the full spotting day"
        intro="Compare locations, check our beer garden details and choose food before you visit."
      />

      <CTASection
        title="Ready for Heathrow Plane Spotting?"
        description="Book a table, grab stone-baked pizzas or Sunday roasts, and plan your route to our beer garden."
        buttons={[
          {
            text: "Book a Table",
            href: "/book-table",
            variant: "white"
          },
          {
            text: "Pizza Menu",
            href: "/food-menu#pizza",
            variant: "white"
          },
          {
            text: "View Food & Drinks",
            href: "/food-menu",
            variant: "white"
          }
        ]}
        variant="green"
      />
    </>
  )
}
