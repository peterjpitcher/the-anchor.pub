import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, DirectionsCard, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessStats } from '@/lib/schema-with-reviews'
import { BookTableButton } from '@/components/BookTableButton'

export const metadata: Metadata = {
  title: `Stanwell Village Pub | Sunday Roasts, Pizza & Free Parking | ${BRAND.name}`,
  description: `${BRAND.name} is Stanwell's village pub with Sunday roasts, stone-baked pizzas, quiz nights and free parking just minutes from Heathrow.`,
  keywords: 'stanwell village pub, sunday roast stanwell moor, quiz night stanwell, stone-baked pizza stanwell, local pub near heathrow',
  openGraph: {
    title: 'Stanwell Village Pub - The Anchor Stanwell Moor',
    description: 'Enjoy Sunday roasts, stone-baked pizzas and local events at The Anchor, Stanwell Moor\'s village pub near Heathrow.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Stanwell Village Pub - The Anchor Stanwell Moor',
    description: 'Enjoy Sunday roasts, stone-baked pizzas and local events at The Anchor, Stanwell Moor\'s village pub near Heathrow.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/stanwell-pub'
  }
}

export default async function StanwellPubPage() {
  const { rating, reviewCount } = await getBusinessStats()

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    "@id": "https://www.the-anchor.pub/stanwell-pub#business",
    "name": `${BRAND.name} - Stanwell Village Pub`,
    "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": "Stanwell Moor, Stanwell",
      "addressRegion": "Surrey",
      "postalCode": CONTACT.address.postcode,
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT.coordinates.lat,
      "longitude": CONTACT.coordinates.lng
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Stanwell"
      },
      {
        "@type": "Place",
        "name": "Stanwell Moor"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    },
	    "priceRange": "££",
    "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub/stanwell-pub"
  }
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: 'Stanwell Pub', url: '/stanwell-pub' }
  ])

  const directionsSchema = generateHowToDirectionsSchema(
    'Stanwell Village',
    'The Anchor - Heathrow Pub & Dining',
    [
      'From Stanwell Village, head north on Oaks Road',
      'Turn left onto Stanwell Moor Road',
      'Continue for about 0.5 miles',
      'Turn right onto Horton Road',
      'The Anchor will be on your right with free parking'
    ]
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
      />

      {/* Hero Section */}
      <HeroWrapper
        route="/stanwell-pub"
        title="Stanwell's Traditional Village Pub"
        description="The heart of the Stanwell community since generations"
        variant="default"
        primaryCta={
          <BookTableButton
            source="stanwell_pub_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="stanwell_local"
          >
            📅 Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              🍽️ View Menu
            </Button>
          </Link>
        }
      />

      <section className="bg-white py-6">
        <Container>
          <p className="text-center text-sm text-gray-600">⭐⭐⭐⭐⭐ <strong>Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-8 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-green mb-4"
            >
              Stanwell Pub - Traditional British Pub in Stanwell Moor
            </PageTitle>
            <p className="text-lg text-gray-700">
              Your local village pub serving the Stanwell community for generations
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Welcome to Your Local Stanwell Pub"
              subtitle="Located in the heart of Stanwell Moor, The Anchor has been serving the Stanwell community for generations. We're more than just a pub - we're where neighbours become friends and visitors become regulars."
            />

            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "🏘️",
                  title: "Village Heart",
                  description: "The social hub of Stanwell Moor, where locals gather daily",
                  variant: "colored",
                  color: "bg-anchor-cream",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "🍺",
                  title: "Traditional Values",
                  description: "Proper British pub with real ales and honest food",
                  variant: "colored",
                  color: "bg-anchor-cream",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "👨‍👩‍👧‍👦",
                  title: "Family Friendly",
                  description: "Children and dogs always welcome in our community pub",
                  variant: "colored",
                  color: "bg-anchor-cream",
                  className: "rounded-xl p-6 text-center"
                }
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Why Stanwell Residents Choose Us */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Why Stanwell Residents Choose The Anchor"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-anchor-green mb-4">Your Nearest Traditional Pub</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Walking distance from Stanwell Village</strong> - Just a pleasant stroll through Stanwell Moor
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Free parking for 20 cars</strong> - Never worry about parking charges
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Dog-friendly throughout</strong> - Bring your four-legged friends
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Large beer garden</strong> - Perfect for Stanwell's sunny days
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-anchor-green mb-4">Community Events & Activities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">📅</span>
                    <div>
                      <strong>Monthly Quiz Nights</strong> - Test your knowledge with fellow Stanwell residents
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🎭</span>
                    <div>
                      <strong>Hosted Nights</strong> - Music Bingo with Nikki Manfadge and one-off events (see /whats-on)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🎱</span>
                    <div>
                      <strong>Pool & Darts</strong> - Join our local leagues or play casually
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🍕</span>
                    <div>
                      <strong>Stone-baked pizzas</strong> - Stanwell's favourite midweek treat
                    </div>
                  </li>
                </ul>
              </div>
            </div>

	            <div className="mt-8 bg-green-50 rounded-xl p-6 text-center">
	              <p className="text-lg text-green-800">
	                <span className="font-bold">Outside ULEZ Zone</span> - Perfect for visitors from
	                London without the GBP 12.50 daily charge
	              </p>
	            </div>
          </div>
        </Container>
      </section>

      {/* Local Favourites */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Stanwell's Favourite Pub Food"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-800 mb-4">Famous Sunday Roasts</h3>
                <p className="mb-3">The talk of Stanwell! Our traditional Sunday roasts must be ordered by 1pm Saturday.</p>
	                <ul className="space-y-2 text-gray-700">
	                  <li>• Roasted Chicken - GBP 19.99</li>
	                  <li>• Slow-Cooked Lamb Shank - GBP 23.99</li>
	                  <li>• Crispy Pork Belly - GBP 21.99</li>
	                  <li>• Beetroot &amp; Butternut Squash Wellington (V) - GBP 19.99</li>
	                  <li>• Kids Roasted Chicken - GBP 13.99</li>
	                </ul>
                <p className="mt-3 text-sm text-amber-700">Book early - Stanwell locals fill tables fast!</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Weekday Favourites</h3>
                <p className="mb-3">Classic British pub fare loved by Stanwell residents</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Fish & Chips Fridays</li>
                  <li>• Beef & Ale Pie</li>
                  <li>• Chicken Katsu Curry</li>
                  <li>• Stone-baked Pizzas</li>
                </ul>
                <p className="mt-3 text-sm text-blue-700">Kitchen: Tue-Fri 6-9pm, Sat 1-7pm, Sun 1-6pm</p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/food-menu">
                <Button variant="primary" size="lg">
                  View Full Menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Location & Directions */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Getting to The Anchor from Stanwell"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">📍 From Stanwell Village</h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">1.</span>
                    <span>Head north on Oaks Road from the village centre</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">2.</span>
                    <span>Turn left onto Stanwell Moor Road</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">3.</span>
                    <span>Continue for about half a mile</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">4.</span>
                    <span>Turn right onto Horton Road</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">5.</span>
                    <span>The Anchor is on your right with free parking</span>
                  </li>
                </ol>
                <p className="mt-4 text-sm text-gray-700">
                  <strong>Journey time:</strong> 5 minutes by car, 20 minutes walking
                </p>
              </div>

              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">🚌 Public Transport</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Bus Route 442</p>
                    <p className="text-gray-700">Stops directly outside The Anchor. Connects Stanwell, Stanwell Moor, and Heathrow.</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Walking from Stanwell</p>
                    <p className="text-gray-700">Pleasant 20-minute walk through residential areas. Popular route for dog walkers!</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="font-semibold text-green-700">💚 Eco-Friendly Route</p>
                    <p className="text-gray-700">Outside ULEZ zone - no charges for any vehicles</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <DirectionsButton
                href="https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="stanwell_directions"
                variant="secondary"
                size="md"
              >
                📍 Get Directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Stanwell Community */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Part of the Stanwell Community"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="text-left">
                <h3 className="text-xl font-bold mb-4">Local Connections</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>• Regular meetup spot for Stanwell clubs</li>
                  <li>• Supporters of local charities</li>
                  <li>• Venue for Stanwell celebrations</li>
                  <li>• Home to local darts and pool teams</li>
                  <li>• Dog walkers' favourite refreshment stop</li>
                </ul>
              </div>

              <div className="text-left">
                <h3 className="text-xl font-bold mb-4">Near Stanwell Landmarks</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>• 5 minutes from Stanwell Village</li>
                  <li>• 10 minutes from King George VI Reservoir</li>
                  <li>• 15 minutes from Staines-upon-Thames</li>
                  <li>• 7 minutes from Heathrow Terminal 5</li>
                  <li>• Next to St Mary's Church, Stanwell Moor</li>
                </ul>
              </div>
            </div>

            <p className="text-lg text-gray-700">
              Whether you're a lifelong Stanwell resident or new to the area,
              The Anchor welcomes you with warm hospitality and cold pints!
            </p>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader
              title="Stanwell Pub Opening Hours"
            />
            <BusinessHours />
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Stanwell Village?",
            answer: "The Anchor is approximately 1.2 miles from Stanwell Village centre, about a 5-minute drive or a pleasant 20-minute walk. We're located in Stanwell Moor, which is part of greater Stanwell."
          },
          {
            question: "Is The Anchor the closest pub to Stanwell?",
            answer: "Yes! The Anchor is the nearest traditional British pub to Stanwell Village. We're just a short journey away in Stanwell Moor, with free parking and a warm welcome for all Stanwell residents."
          },
          {
            question: "Do you host events for Stanwell community groups?",
            answer: "Absolutely! We regularly host Stanwell community groups, clubs, and private events. Our spaces can accommodate from small meetings to large celebrations. Contact us to discuss your requirements."
          },
          {
            question: "What's the best way to get to The Anchor from Stanwell without a car?",
            answer: "The 442 bus runs from Stanwell to our doorstep, or it's a pleasant 20-minute walk through Stanwell Moor. Many Stanwell residents enjoy the walk, especially with their dogs who are welcome in our pub!"
          },
          {
            question: "Do Stanwell residents get any special offers?",
            answer: "All our regular offers are available to everyone! This includes our famous Sunday roasts and stone-baked pizzas. We're Stanwell's local, so all locals are treated like family!"
          }
        ]}
        className="bg-white"
      />

      {/* CTA Section */}
      <CTASection
        title="Visit Stanwell's Favourite Local Pub"
        description="Join your neighbours at The Anchor - where Stanwell comes together"
        buttons={[
          {
            text: "📅 Book a Table",
            href: "/book-table",
            variant: "secondary"
          },
          {
            text: "📞 Call Us",
            href: `${CONTACT.phoneHref}`,
            isPhone: true,
            phoneSource: "stanwell_pub_cta",
            variant: "white"
          },
          {
            text: "🎉 Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: "📅 What's On",
            href: "/whats-on",
            variant: "white"
          }
        ]}
        variant="green"
        footer={`${CONTACT.address.street}, Stanwell Moor • Free Parking • Dog Friendly`}
      />
    </>
  )
}
