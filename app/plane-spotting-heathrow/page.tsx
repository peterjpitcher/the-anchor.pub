import Link from 'next/link'
import { Metadata } from 'next'
import { InteriorHero } from '@/components/hero'
import { Container, SectionHeading, Button, Card, CardBody } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessHours } from '@/lib/api'
import { generateOpeningHoursSpecification } from '@/lib/schema-utils'
import { HeathrowFoodBestFor } from '@/components/food/HeathrowFoodBestFor'
import { PlaneSpottingScheduleNote } from '@/components/plane-spotting/PlaneSpottingScheduleNote'
import { PlaneSpottingBookingPrompt } from '@/components/plane-spotting/PlaneSpottingBookingPrompt'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { HEATHROW_TIMES, CONTACT, BUS_WORDING } from '@/lib/constants'
import { CHARGING_WORDING, DOGS_WORDING } from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'

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
    description: 'Heathrow plane spotting venue with a beer garden under the southern runway approach path, offering food and drinks.',
    url: 'https://www.the-anchor.pub/plane-spotting-heathrow',
    image: DEFAULT_NEAR_HEATHROW_IMAGE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.town,
      postalCode: 'TW19 6AQ',
      addressRegion: 'Surrey',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CONTACT.coordinates.lat,
      longitude: CONTACT.coordinates.lng
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
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(planeSpottingSchema) }}
      />
      <PlaneSpottingBookingPrompt source="plane_spotting_page_prompt" />

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Plane Spotting"
        title="Heathrow Plane Spotting Pub and Beer Garden"
        lead="Plan a spotting visit from a proper pub table in Stanwell Moor. Food, drinks, WiFi and free customer parking minutes from Terminal 5."
      />

      <AmenityStrip/>

      <section className="py-section-y bg-canvas">
        <Container>
          <PlaneSpottingScheduleNote
            variant="panel"
            showCta
            ctaSource="plane_spotting_today_panel"
          />
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <p className="mx-auto text-center text-lg text-ink-muted">
            Looking for a Heathrow viewing area with food and drink? This page is about visiting our beer garden. For a full comparison of every spotting location, use our dedicated Heathrow plane spotting locations guide.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline" size="md" wrap>
              <Link href="/blog/heathrow-plane-spotting-locations">
                Compare all Heathrow viewing areas
              </Link>
            </Button>
          </div>
        </Container>
      </section>
      <HeathrowFoodBestFor
        title="Best For Plane Spotters"
        items={[
          ['Plane spotting day', 'Use the beer garden as a comfortable base when overhead arrivals are operating.'],
          ['Lunch between arrivals', 'Book a table and keep your group settled between busy approach windows.'],
          ['Family meal', 'Pub classics, pizzas and a garden that keeps the visit relaxed.'],
          ['Sunday roast', 'Served Sundays from 1pm to 6pm. Walk in, nothing to pre-order.'],
          ['Aviation meet-up', 'Food, WiFi, free parking and a clear meeting point near Terminal 5.'],
        ]}
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-3">
            <Card accent hover>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Sunday Roast Before/After Spotting</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Walk in 1pm-6pm or book ahead - Yorkshire puddings, crispy potatoes and real gravy.
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <BookTableButton
                    source="plane_spotting_roast_cta"
                    variant="primary"
                    size="sm"
                  >
                    Book Sunday Roast
                  </BookTableButton>
                  <Link href="/sunday-roast" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    Sunday roast menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card accent hover>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Hand-stretched pizzas with bold toppings, a favourite with aviation meet-ups and crew nights.
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <BookTableButton
                    source="plane_spotting_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card accent hover>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Hot Food & Drinks</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Burgers, fish & chips, pizzas and a full bar served to the beer garden during kitchen hours. Free parking and WiFi keep you comfortable between arrivals.
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <BookTableButton
                    source="plane_spotting_food_cta"
                    variant="primary"
                    size="sm"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    Browse food menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Heathrow Plane Spotting Pub, Food and Free Customer Parking
          </h2>
        </Container>
      </section>

      <section className="py-section-y bg-canvas">
        <Container>
          <SectionHeading
            title="Best Heathrow Plane Spotting Locations"
            lead="Front-row views, hot food and a full bar for an aviation day out."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Under the Flight Path', description: 'You sit directly under Heathrow\u2019s southern runway approach path. Aircraft overhead is expected during the active window, not guaranteed.' },
              { title: 'Photo-Friendly Garden', description: 'Open sky and free WiFi for FlightRadar24.' },
              { title: 'Proper Refreshments', description: 'Stone-baked pizzas, Sunday roasts and full drinks menu available. If it rains we’ll do our best to find you a spot inside.' }
            ].map(feature => (
              <Card key={feature.title} accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                  <p className="text-ink-muted">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Plan Your Heathrow Plane Watching Trip"
            lead="Make the most of every arrival with timings, transport and kit tips."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">When Planes Are Overhead</h3>
                <ul className="list-disc list-inside text-ink-muted space-y-2">
                  <li>One week planes land overhead until 3pm, the next week from 3pm</li>
                  <li>Check our opening hours before you travel</li>
                </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Getting Here</h3>
                <ul className="list-disc list-inside text-ink-muted space-y-2">
                  <li>{HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car</li>
                  <li>Free on-site parking for patrons</li>
                  <li>{BUS_WORDING}</li>
                </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">What to Bring</h3>
                <ul className="list-disc list-inside text-ink-muted space-y-2">
                  <li>Camera with 70-200mm lens covers most arrivals</li>
                  <li>Radio scanner or FR24 app (free WiFi provided)</li>
                  <li>Layers: the beer garden is uncovered and breezy</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        className="bg-surface"
        faqs={[
          {
            question: 'Do I need to book a table for plane spotting?',
            answer: 'Booking is recommended at busy times (sunny weekends, major aviation events). Walk-ins are welcome subject to garden capacity and weather.'
          },
          {
            question: 'What happens if it rains?',
            answer: 'The garden isn\'t covered. If it rains we\'ll do our best to find you a spot inside.'
          },
          {
            question: 'What aircraft will I see from The Anchor?',
            answer: 'It depends on what is landing at Heathrow that day. Plane spotting is weather and Heathrow operations dependent, so aircraft overhead cannot be guaranteed.'
          },
          {
            question: 'Can I charge batteries or use WiFi?',
            answer: `We have free WiFi for flight tracking. ${CHARGING_WORDING}`
          },
          {
            question: 'Are families and dogs welcome?',
            answer: `Absolutely. ${DOGS_WORDING} We have children’s meals plus soft drinks and hot drinks for family visits.`
          }
        ]}
      />

      <OrganicSearchClusterLinks
        cluster="planeSpotting"
        currentPath="/plane-spotting-heathrow"
        title="Plan the full spotting day"
        intro="Compare locations, check our beer garden details and choose food before you visit."
      />

      <InternalLinkingSection
        title="Eat, drink and celebrate near Heathrow"
        links={[
          { href: '/restaurants-near-heathrow', title: 'Restaurants Near Heathrow', description: `Proper pub food ${HEATHROW_TIMES.terminal5} minutes from Terminal 5, with free parking` },
          { href: '/sunday-roast', title: 'Sunday Roast Near Heathrow', description: 'Walk in for a freshly plated roast, served Sundays 1pm to 6pm' },
          { href: '/private-hire', title: 'Function Room Hire', description: `Private hire for ${PRIVATE_HIRE_CAPACITY.recommendedRange}, free parking` },
        ]}
      />

      <CtaBand
        title="Ready for Heathrow Plane Spotting?"
        copy="Book a table, grab stone-baked pizzas or Sunday roasts, and plan your route to our beer garden."
      >
        <BookTableButton source="plane_spotting_cta" variant="primary" size="lg">Book a table</BookTableButton>
        <Button asChild variant="outline" size="lg">
          <Link href="/food-menu#pizza">Pizza menu</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/food-menu">View food &amp; drinks</Link>
        </Button>
      </CtaBand>
    </>
  )
}
