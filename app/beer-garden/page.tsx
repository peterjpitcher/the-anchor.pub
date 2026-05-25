import Link from 'next/link'
import { Button, Container, Section, Card, CardBody } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { SectionHeader, FeatureGrid, InfoBoxGrid, AmenityList } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { GoogleReviews } from '@/components/reviews'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { BookTableButton } from '@/components/BookTableButton'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { getBusinessHours } from '@/lib/api'
import { generateOpeningHoursSpecification } from '@/lib/schema-utils'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
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
      <HeroWrapper
        route="/beer-garden"
        title="Beer Garden Near Heathrow"
        description="Plan a plane spotting visit with a pint, food from £10, dogs welcome"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      >
        <div className="bg-anchor-bg-card/90 backdrop-blur-sm text-anchor-gold-vivid font-bold text-lg md:text-xl px-6 py-3 rounded-full inline-block mt-4 border border-anchor-gold/30">
           DIRECTLY UNDER THE FLIGHT PATH
        </div>
      </HeroWrapper>

      {/* Definitive answer for featured snippets */}
      <section className="bg-anchor-bg-raised border-b border-anchor-gold/15 section-spacing-tight">
        <Container>
          <p className="text-center text-lg md:text-xl text-anchor-cream-text/80 max-w-4xl mx-auto leading-relaxed">
            The Anchor&apos;s beer garden in Stanwell Moor sits under Heathrow&apos;s expected 27R arrivals path, offering a unique plane spotting base with your pint. Dog-friendly with outdoor seating and free parking.
          </p>
        </Container>
      </section>

      <Section background="dark" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <PlaneSpottingScheduleNote
            variant="panel"
            showCta
            ctaSource="beer_garden_today_panel"
          />
        </Container>
      </Section>

      {/* Grab Food & Deals */}
      <Section background="dark" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
            <Card className="card-dark rounded-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Sunday Roast (Sundays 1–6pm)</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Walk in 1pm-6pm or book ahead - Yorkshire puddings, crispy potatoes and proper gravy after your plane-spotting session.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="beer_garden_roast_cta"
                    variant="primary"
                    size="sm"
                  >
                    Book Sunday Roast
                  </BookTableButton>
                  <Link href="/sunday-roast" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    View roast menu 
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Hand-stretched pizzas with bold toppings, ideal for aviation meet-ups or crew nights.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="beer_garden_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    View pizza menu 
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">All-Day Food & Drinks</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Burgers, fish & chips, sharers and a full drinks list served directly to the beer garden during kitchen hours.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="beer_garden_food_menu_cta"
                    variant="primary"
                    size="sm"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Browse full menu 
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Google Rating */}
      <section className="bg-anchor-bg section-spacing-tight border-b border-anchor-gold/15">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="bg-anchor-bg-raised section-spacing-sm border-b border-anchor-gold/15">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            Beer Garden Near Heathrow, Outdoor Pub Dining Under the Flight Path
          </PageTitle>
          <p className="text-center text-lg text-anchor-cream-text/70 mt-4 max-w-4xl mx-auto">
            The Anchor&apos;s beer garden sits under Heathrow&apos;s southern runway arrivals path when 27R is in use. Aircraft overhead is expected during the active window, but plane spotting is weather and Heathrow operations dependent. The 64-seat garden features heated areas and is fully dog-friendly with water bowls provided.
          </p>
        </Container>
      </section>

      {/* Plane Spotting Paradise */}
      <section className="section-spacing bg-anchor-bg">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Outdoor Pub Garden Near Heathrow Airport"
            />

            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Why Aviation Enthusiasts Love Us",
                  content: (
                    <AmenityList
                      items={[
                        { icon: "", title: "Perfect Position", description: "Under the expected Heathrow 27R approach path" },
                        { icon: "", title: "Low & Loud", description: "When operating, aircraft pass at approximately 500-800 feet" },
                        { icon: "", title: "Photo Friendly", description: "Unobstructed views perfect for photography" },
                        { icon: "", title: "Refreshments", description: "Full bar service delivered to your table" },
                        { icon: "", title: "Free WiFi", description: "Free high-speed guest WiFi throughout the venue" }
                      ]}
                      iconColor="text-2xl"
                    />
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card rounded-none p-8 border border-anchor-gold/15"
                },
                {
                  title: "What You'll See",
                  content: (
                    <>
                      <div className="space-y-2 mb-6">
                        <p className="font-semibold">Common Aircraft Types:</p>
                        <ul className="list-disc list-inside text-anchor-cream-text/70 space-y-1">
                          <li>Airbus A380 "Superjumbo"</li>
                          <li>Boeing 777 & 787 Dreamliner</li>
                          <li>Airbus A350 & A330</li>
                          <li>Boeing 747 (increasingly rare!)</li>
                          <li>Various narrow-body aircraft</li>
                        </ul>
                      </div>
                      <div className="bg-anchor-bg rounded-lg p-4 border border-anchor-gold/15">
                        <p className="text-sm text-anchor-cream-text/55">
                          <strong>Schedule:</strong> Planes operate on a rotating weekly schedule, one week landings are expected overhead until 3pm, the next week from 3pm<br />
                          <strong>Caveat:</strong> Weather and Heathrow operations dependent, not guaranteed<br />
                          <strong>Overhead Operations:</strong> ~50% of the year (alternating weekly schedule)
                        </p>
                      </div>
                    </>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-raised rounded-none p-8 border border-anchor-gold/15"
                }
              ]}
              className="mb-12"
            />

          </div>
        </Container>
      </section>

      {/* Customer Reviews */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-anchor-cream-text text-center mb-8">
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
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Our Unique Beer Garden"
            />

            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "Spacious Seating",
                  description: "Multiple tables with umbrellas for sunny days",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Dog Friendly",
                  description: "Water bowls provided, treats available at the bar",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Food Service",
                  description: "Full menu available in the garden during kitchen hours",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Heated Areas",
                  description: "Heaters for cooler evenings",
                  className: "text-center"
                },
                {
                  icon: "‍‍‍",
                  title: "Family Friendly",
                  description: "Safe enclosed space, children always welcome",
                  className: "text-center"
                },
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Accessibility */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-anchor-cream-text mb-4">Accessibility</h2>
            <p className="text-anchor-cream-text/70 mb-3">
              Step-free access to the bar and dining area. The beer garden has steps, but a ramp is available on request.
            </p>
            <p className="text-anchor-cream-text/70 mb-4">
              We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
              <PhoneLink phone={CONTACT.phone} source="beer-garden_accessibility" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid" showIcon={false} /> and we&apos;ll help.
            </p>
            <Link href="/accessibility" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid hover:underline">
              Full accessibility information &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* Plane Spotting Tips */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Plane Spotting Tips for Visitors"
            />

            <InfoBoxGrid
              columns={1}
              boxes={[
                {
                  title: " Essential Apps",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• <strong>Flightradar24:</strong> Track incoming flights in real-time</li>
                      <li>• <strong>Plane Finder:</strong> Identify aircraft types and airlines</li>
                      <li>• <strong>LiveATC:</strong> Listen to air traffic control (bring headphones!)</li>
                    </ul>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15"
                },
                {
                  title: " Photography Tips",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• Best light: Golden hour (1 hour before sunset)</li>
                      <li>• Recommended lens: 70-300mm for close-ups</li>
                      <li>• Fast shutter speed: 1/500s or faster</li>
                      <li>• Look for special liveries and rare aircraft</li>
                    </ul>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-raised rounded-none p-6 border border-anchor-gold/15"
                },
                {
                  title: " Make a Day of It",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• Arrive early to secure the best spotting tables</li>
                      <li>• Try our aviation-themed cocktails</li>
                      <li>• Join other enthusiasts - great community feel</li>
                      <li>• Food available during kitchen hours</li>
                    </ul>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15"
                }
              ]}
            />
          </div>
        </Container>
      </section>


      {/* FAQ Section */}
      <FAQAccordionWithSchema
        className="bg-anchor-bg"
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

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 section-spacing-lg">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready for Planes, Pints & Proper Food?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join fellow aviation enthusiasts, enjoy stone-baked pizzas or book ahead for Sunday roast before wheels-up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="beer_garden_cta"
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              />
              <PhoneButton phone={CONTACT.phone} source="beer-garden_cta" size="lg" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                   Call {CONTACT.phone}
              </PhoneButton>
              <Link href="/our-pub">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                   See Inside The Pub
                </Button>
              </Link>
              <Link href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                   Get Directions
                </Button>
              </Link>
            </div>
            <p className="text-white/80 mt-8 text-sm">
              Just 7 minutes from Heathrow Terminal 5 • Free parking • Dogs welcome
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
