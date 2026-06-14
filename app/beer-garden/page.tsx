import Link from 'next/link'
import { Button, Container, Card, CardBody, SectionHeading } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { GoogleReviews } from '@/components/reviews'
import { BookTableButton } from '@/components/BookTableButton'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { getBusinessHours } from '@/lib/api'
import { generateOpeningHoursSpecification } from '@/lib/schema-utils'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { PhoneButton } from '@/components/PhoneButton'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'
import { HeroBadge } from '@/components/HeroBadge'
import { PlaneSpottingScheduleNote } from '@/components/plane-spotting/PlaneSpottingScheduleNote'
import { PlaneSpottingBookingPrompt } from '@/components/plane-spotting/PlaneSpottingBookingPrompt'

export const revalidate = 86400 // Revalidate every 24 hours

export const metadata: Metadata = {
  title: 'Beer Garden Near Heathrow | Plane Spotting Pub Garden',
  description: 'Outdoor pub garden near Heathrow with plane spotting views, food, dog-friendly tables, heated areas and free customer parking in Stanwell Moor.',
  openGraph: {
    title: 'Beer Garden Near Heathrow | Plane Spotting Pub Garden | The Anchor',
    description: 'Outdoor pub garden near Heathrow with plane spotting views, food, dog-friendly tables, heated areas and free customer parking.',
    images: ['/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Beer Garden Near Heathrow | Plane Spotting Pub Garden | The Anchor',
    description: 'Outdoor pub garden near Heathrow with plane spotting views, food, dog-friendly tables and free customer parking.',
    images: ['/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg']
  }),
  alternates: {
    canonical: '/beer-garden'
  }
}

export default async function BeerGardenPage() {
  const businessHours = await getBusinessHours()
  const openingHoursSpecification = generateOpeningHoursSpecification(businessHours)
  const planeSpottingSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": "The Anchor Beer Garden - Heathrow Plane Spotting",
    "description": "Beer garden under Heathrow's expected 27R flight path with food, drinks and plane spotting opportunities",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.462509,
      "longitude": -0.502067
    },
    ...(openingHoursSpecification.length ? { "openingHoursSpecification": openingHoursSpecification } : {}),
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Outdoor Seating",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Dog Friendly",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Plane Spotting Views",
        "value": true
      }
    ]
  }
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Beer Garden', url: '/beer-garden' }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([planeSpottingSchema, parkingFacilitySchema]) }}
      />
      <PlaneSpottingBookingPrompt source="beer_garden_plane_spotting_prompt" />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/beer-garden/beer-garden.jpg"
        crumb="Beer Garden"
        title="Beer Garden Near Heathrow"
        lead="Plan a plane spotting visit with a pint, food from £10, dogs welcome"
      />

      <AmenityStrip />

      {/* Definitive answer for featured snippets */}
      <section className="py-section-y bg-canvas">
        <Container>
          <p className="text-center text-lg md:text-xl text-ink max-w-4xl mx-auto leading-relaxed">
            The Anchor&apos;s beer garden in Stanwell Moor sits under Heathrow&apos;s expected 27R arrivals path, offering a unique plane spotting base with your pint. Dog-friendly with outdoor seating and free parking.
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <PlaneSpottingScheduleNote
            variant="panel"
            showCta
            ctaSource="beer_garden_today_panel"
          />
        </Container>
      </section>

      {/* Grab Food & Deals */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
            <Card accent hover>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Sunday Roast (Sundays 1–6pm)</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Walk in 1pm-6pm or book ahead - Yorkshire puddings, crispy potatoes and proper gravy after your plane-spotting session.
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <BookTableButton source="beer_garden_roast_cta" variant="primary" size="sm">Book Sunday Roast</BookTableButton>
                  <Link href="/sunday-roast" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">View roast menu →</Link>
                </div>
              </CardBody>
            </Card>
            <Card accent hover>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Hand-stretched pizzas with bold toppings, ideal for aviation meet-ups or crew nights.
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <BookTableButton source="beer_garden_pizza_cta" context="pizza_menu" variant="primary" size="sm">Book a Table</BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">View pizza menu →</Link>
                </div>
              </CardBody>
            </Card>
            <Card accent hover>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">All-Day Food & Drinks</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Burgers, fish & chips, sharers and a full drinks list served directly to the beer garden during kitchen hours.
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <BookTableButton source="beer_garden_food_menu_cta" variant="primary" size="sm">Book a Table</BookTableButton>
                  <Link href="/food-menu" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">Browse full menu →</Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Google Rating */}
      <section className="py-section-y bg-surface">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Beer Garden Near Heathrow, Outdoor Pub Dining Under the Flight Path
          </h2>
          <p className="text-center text-lg text-ink-muted mt-4 max-w-4xl mx-auto">
            The Anchor&apos;s beer garden sits under Heathrow&apos;s southern runway arrivals path when 27R is in use. Aircraft overhead is expected during the active window, but plane spotting is weather and Heathrow operations dependent. The 64-seat garden features heated areas and is fully dog-friendly with water bowls provided.
          </p>
        </Container>
      </section>

      {/* Plane Spotting Paradise */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Outdoor Pub Garden Near Heathrow Airport"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Why Aviation Enthusiasts Love Us</h3>
                  <ul className="space-y-3 text-ink-muted">
                    <li><strong className="text-ink-strong">Perfect Position</strong>: Under the expected Heathrow 27R approach path</li>
                    <li><strong className="text-ink-strong">Low & Loud</strong>: When operating, aircraft pass at approximately 500-800 feet</li>
                    <li><strong className="text-ink-strong">Photo Friendly</strong>: Unobstructed views perfect for photography</li>
                    <li><strong className="text-ink-strong">Refreshments</strong>: Full bar service delivered to your table</li>
                    <li><strong className="text-ink-strong">Free WiFi</strong>: Free high-speed guest WiFi throughout the venue</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">What You&apos;ll See</h3>
                  <div className="space-y-2 mb-6 text-ink-muted">
                    <p className="font-semibold text-ink-strong">Common Aircraft Types:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Airbus A380 &quot;Superjumbo&quot;</li>
                      <li>Boeing 777 & 787 Dreamliner</li>
                      <li>Airbus A350 & A330</li>
                      <li>Boeing 747 (increasingly rare!)</li>
                      <li>Various narrow-body aircraft</li>
                    </ul>
                  </div>
                  <div className="bg-surface-sunk rounded-sm p-4 border border-line">
                    <p className="text-sm text-ink-muted">
                      <strong className="text-ink-strong">Schedule:</strong> Planes operate on a rotating weekly schedule, one week landings are expected overhead until 3pm, the next week from 3pm<br />
                      <strong className="text-ink-strong">Caveat:</strong> Weather and Heathrow operations dependent, not guaranteed<br />
                      <strong className="text-ink-strong">Overhead Operations:</strong> ~50% of the year (alternating weekly schedule)
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Reviews */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-h2 text-ink-strong text-center mb-8">
              What Visitors Say About Our Beer Garden
            </h2>
            <GoogleReviews
              layout="carousel"
              showTitle={false}
            />
          </div>
        </Container>
      </section>

      {/* Beer Garden Features */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Our Unique Beer Garden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Spacious Seating', description: 'Multiple tables with umbrellas for sunny days' },
                { title: 'Dog Friendly', description: 'Water bowls provided, treats available at the bar' },
                { title: 'Food Service', description: 'Full menu available in the garden during kitchen hours' },
                { title: 'Heated Areas', description: 'Heaters for cooler evenings' },
                { title: 'Family Friendly', description: 'Safe enclosed space, children always welcome' }
              ].map(feature => (
                <Card key={feature.title} accent hover>
                  <CardBody>
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                    <p className="text-ink-muted">{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Accessibility */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-h2 text-ink-strong mb-4">Accessibility</h2>
            <p className="text-ink-muted mb-3">
              Step-free access to the bar and dining area. The beer garden has steps, but a ramp is available on request.
            </p>
            <p className="text-ink-muted mb-4">
              We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
              <PhoneLink phone={CONTACT.phone} source="beer-garden_accessibility" className="text-accent-text font-semibold hover:text-anchor-green" showIcon={false} /> and we&apos;ll help.
            </p>
            <Link href="/accessibility" className="text-accent-text font-semibold hover:text-anchor-green hover:underline">
              Full accessibility information &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* Plane Spotting Tips */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Plane Spotting Tips for Visitors"
            />

            <div className="grid grid-cols-1 gap-6">
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Essential Apps</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>• <strong className="text-ink-strong">Flightradar24:</strong> Track incoming flights in real-time</li>
                    <li>• <strong className="text-ink-strong">Plane Finder:</strong> Identify aircraft types and airlines</li>
                    <li>• <strong className="text-ink-strong">LiveATC:</strong> Listen to air traffic control (bring headphones!)</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Photography Tips</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>• Best light: Golden hour (1 hour before sunset)</li>
                    <li>• Recommended lens: 70-300mm for close-ups</li>
                    <li>• Fast shutter speed: 1/500s or faster</li>
                    <li>• Look for special liveries and rare aircraft</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Make a Day of It</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>• Arrive early to secure the best spotting tables</li>
                    <li>• Try our aviation-themed cocktails</li>
                    <li>• Join other enthusiasts - great community feel</li>
                    <li>• Food available during kitchen hours</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>


      {/* FAQ Section */}
      <FAQAccordionWithSchema
        className="bg-canvas"
        faqs={[
          {
            question: "What planes can I see from The Anchor beer garden?",
            answer: "When runway 27R arrivals are operating, you may see A380s, Boeing 777s, 787 Dreamliners, A350s and other Heathrow traffic. Plane spotting is weather and Heathrow operations dependent, so aircraft overhead cannot be guaranteed."
          },
          {
            question: "When is the best time for plane spotting at The Anchor?",
            answer: "Planes operate on a rotating weekly schedule, one week landings are expected overhead until 3pm, the next week from 3pm. The schedule alternates weekly, but aircraft overhead cannot be guaranteed because runway use is weather and Heathrow operations dependent."
          },
          {
            question: "Is the beer garden dog friendly?",
            answer: "Yes! Dogs are very welcome in our beer garden. We provide water bowls and it's a great spot for your furry friend to relax while you enjoy plane spotting."
          },
          {
            question: "Can I take photos of planes from the beer garden?",
            answer: "Absolutely. Our beer garden is a popular spot for aviation photographers when 27R arrivals are operating. Bring a camera, check runway use before travelling, and remember aircraft overhead cannot be guaranteed."
          }
        ]}
      />

      <OrganicSearchClusterLinks
        cluster="beerGarden"
        currentPath="/beer-garden"
        title="Plan your garden visit"
        intro="Compare plane spotting, food and dog-friendly options before you book a table."
      />

      <InternalLinkingSection
        title="Eat, drink and celebrate near Heathrow"
        links={[
          { href: '/restaurants-near-heathrow', title: 'Restaurants Near Heathrow', description: 'Proper pub food 7 minutes from Terminal 5, with free parking' },
          { href: '/sunday-roast', title: 'Sunday Roast Near Heathrow', description: 'Walk in for a freshly plated roast, served Sundays 1pm to 6pm' },
          { href: '/private-hire', title: 'Function Room Hire', description: 'Private hire for 10+ to 150 guests, free parking' },
        ]}
      />

      {/* CTA Section */}
      <CtaBand
        title="Ready for Planes, Pints & Proper Food?"
        copy="Join fellow aviation enthusiasts, enjoy stone-baked pizzas or book ahead for Sunday roast before wheels-up."
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <BookTableButton source="beer_garden_cta" size="lg" variant="primary" />
            <PhoneButton phone={CONTACT.phone} source="beer-garden_cta" size="lg" variant="outline">
              Call {CONTACT.phone}
            </PhoneButton>
            <Button asChild size="lg" variant="outline">
              <Link href="/our-pub">See Inside The Pub</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor" target="_blank" rel="noopener noreferrer">Get Directions</Link>
            </Button>
          </div>
          <p className="text-anchor-cream-text/80 text-sm">
            Just 7 minutes from Heathrow Terminal 5 • Free parking • Dogs welcome
          </p>
        </div>
      </CtaBand>
    </>
  )
}
