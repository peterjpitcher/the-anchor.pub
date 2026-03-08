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
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { getBusinessHours } from '@/lib/api'
import { generateOpeningHoursSpecification } from '@/lib/schema-utils'

export const revalidate = 86400 // Revalidate every 24 hours

export const metadata: Metadata = {
  title: 'Dog-Friendly Beer Garden Near Heathrow | Watch Planes Every 90 Secs | The Anchor',
  description: '64-seat outdoor beer garden 7 mins from Heathrow Airport. Watch planes land directly overhead every 90 seconds. Dog-friendly, heated areas, full food & drinks service. Free parking.',
  keywords: 'dog friendly beer garden near heathrow, beer garden near heathrow airport, plane spotting pub heathrow, pub beer garden stanwell moor, outdoor dining near heathrow',
  openGraph: {
    title: 'Dog-Friendly Beer Garden Near Heathrow | Watch Planes Every 90 Secs | The Anchor',
    description: '64-seat outdoor beer garden 7 mins from Heathrow. Watch planes overhead every 90 seconds. Dog-friendly, heated areas. Free parking.',
    images: ['/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Beer Garden Under Heathrow Flight Path | The Anchor',
    description: 'Watch planes overhead every 90 seconds. Perfect for aviation photographers.',
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
    "description": "Unique beer garden directly under Heathrow flight path offering spectacular plane spotting opportunities",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.4764,
      "longitude": -0.4735
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

      {/* Hero Section */}
      <HeroWrapper
        route="/beer-garden"
        title="Beer Garden & Plane Spotting"
        description="Watch aircraft every 90 seconds while enjoying a pint — food from £10, dogs welcome"
        variant="default"
        tags={[
          { label: ' Every 90 Seconds', variant: 'success' },
          { label: ' Photo Opportunities', variant: 'primary' },
          { label: ' Dog Friendly', variant: 'default' },
          { label: ' Full Bar Service', variant: 'default' }
        ]}
        primaryCta={
          <BookTableButton
            source="beer_garden_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          />
        }
        secondaryCta={
          <>
            <Link href="/plane-spotting-heathrow">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                 Plane Spotting Guide
              </Button>
            </Link>
            <Link href="/drinks">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                 View Drinks Menu
              </Button>
            </Link>
          </>
        }
      >
        <div className="bg-anchor-bg-card/90 backdrop-blur-sm text-anchor-gold-vivid font-bold text-lg md:text-xl px-6 py-3 rounded-full inline-block mt-4 border border-anchor-gold/30">
           DIRECTLY UNDER THE FLIGHT PATH 
        </div>
      </HeroWrapper>

      {/* Grab Food & Deals */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
            <Card className="card-dark rounded-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Sunday Roast (Sundays 1–6pm)</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Book by 1pm Saturday and enjoy Yorkshire puddings, crispy potatoes and proper gravy after your plane-spotting session.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="beer_garden_roast_cta"
                    variant="primary"
                    size="sm"
                  >
                    Book Sunday Roast
                  </BookTableButton>
                  <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
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
      <section className="bg-anchor-bg py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/55"> <strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="bg-anchor-bg-raised py-8 border-b border-anchor-gold/15">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            Beer Garden - Outdoor Dining & Plane Spotting
          </PageTitle>
        </Container>
      </section>

      {/* Plane Spotting Paradise */}
      <section className="section-spacing bg-anchor-bg">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Heathrow's Best Kept Secret for Plane Spotting"
            />

            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Why Aviation Enthusiasts Love Us",
                  content: (
                    <AmenityList
                      items={[
                        { icon: "", title: "Perfect Position", description: "Directly under the Heathrow approach path" },
                        { icon: "", title: "Low & Loud", description: "Aircraft pass at approximately 500-800 feet" },
                        { icon: "", title: "Photo Friendly", description: "Unobstructed views perfect for photography" },
                        { icon: "", title: "Refreshments", description: "Full bar service delivered to your table" },
                        { icon: "", title: "FlightRadar24", description: "Free WiFi to track incoming flights" }
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
                          <strong>Peak Times:</strong> 6am-9am & 4pm-8pm<br />
                          <strong>Frequency:</strong> Every 90 seconds (peak)<br />
                          <strong>Wind Direction:</strong> Westerly operations (70% of year)
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
                  description: "Covered sections with heaters for cooler evenings",
                  className: "text-center"
                },
                {
                  icon: "‍‍‍",
                  title: "Family Friendly",
                  description: "Safe enclosed space, children welcome until 8pm",
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
              Step-free access to the bar, dining area and beer garden.
            </p>
            <p className="text-anchor-cream-text/70 mb-4">
              We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
              <a href="tel:+441753682707" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid">+44 1753 682707</a> and we&apos;ll help.
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
            answer: "You'll see all types of aircraft using Heathrow including A380s, Boeing 777s, 787 Dreamliners, and A350s. Planes pass directly overhead approximately every 90 seconds during peak times."
          },
          {
            question: "When is the best time for plane spotting at The Anchor?",
            answer: "Early morning (6am-9am) and late afternoon (4pm-8pm) offer the most frequent flights. Summer evenings are particularly popular as you can enjoy drinks while watching the constant stream of aircraft."
          },
          {
            question: "Is the beer garden dog friendly?",
            answer: "Yes! Dogs are very welcome in our beer garden. We provide water bowls and it's a great spot for your furry friend to relax while you enjoy plane spotting."
          },
          {
            question: "Can I take photos of planes from the beer garden?",
            answer: "Absolutely! Our beer garden is a popular spot for aviation photographers. The planes pass low overhead providing excellent photo opportunities."
          }
        ]}
      />

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready for Planes, Pints & Proper Food?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join fellow aviation enthusiasts, enjoy stone-baked pizzas or pre-order Sunday roast before wheels-up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="beer_garden_cta"
                size="lg"
                variant="secondary"
                className="bg-white text-anchor-green hover:bg-gray-100"
              />
              <Link href="tel:+441753682707">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                   Call 01753 682707
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
