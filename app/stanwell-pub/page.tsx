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
  title: `Stanwell Village Pub | Beer Garden, Sunday Roasts & Free Parking | ${BRAND.name}`,
  description: `The Anchor is Stanwell Moor's village pub — rated 4.6/5 on Google. Sunday roasts from £19.99, stone-baked pizzas, dog-friendly beer garden and free parking. 7 mins from Heathrow T5.`,
  openGraph: {
    title: 'Stanwell Village Pub — Beer Garden, Food & Free Parking',
    description: 'Rated 4.6/5 on Google. Sunday roasts, stone-baked pizzas and a dog-friendly beer garden at The Anchor, Stanwell Moor.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Stanwell Village Pub — Beer Garden, Food & Free Parking',
    description: 'Rated 4.6/5 on Google. Sunday roasts, stone-baked pizzas and a dog-friendly beer garden at The Anchor, Stanwell Moor.',
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
            Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu" className="w-full sm:w-auto">
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

      <section className="bg-anchor-bg-card py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70">⭐⭐⭐⭐⭐ <strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-cream-text mb-4"
            >
              Stanwell Pub - Traditional British Pub in Stanwell Moor
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Your local village pub serving the Stanwell community for generations
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
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
                  icon: "",
                  title: "Village Heart",
                  description: "The social hub of Stanwell Moor, where locals gather daily",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                },
                {
                  icon: "",
                  title: "Traditional Values",
                  description: "Proper British pub with real ales and honest food",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                },
                {
                  icon: "‍‍‍",
                  title: "Family Friendly",
                  description: "Children and dogs always welcome in our community pub",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                }
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Why Stanwell Residents Choose Us */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Why Stanwell Residents Choose The Anchor"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Your Nearest Traditional Pub</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Walking distance from Stanwell Village</strong> - Just a pleasant stroll through Stanwell Moor
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Free parking for 20 cars</strong> - Never worry about parking charges
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Dog-friendly throughout</strong> - Bring your four-legged friends
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Large beer garden</strong> - Perfect for Stanwell's sunny days
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Community Events & Activities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Monthly Quiz Nights</strong> - Test your knowledge with fellow Stanwell residents
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Hosted Nights</strong> - Music Bingo with Nikki Manfadge and one-off events (see /whats-on)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Pool & Darts</strong> - Join our local leagues or play casually
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div className="text-anchor-cream-text/70">
                      <strong className="text-anchor-cream-text">Stone-baked pizzas</strong> - Stanwell's favourite midweek treat
                    </div>
                  </li>
                </ul>
              </div>
            </div>

	            <div className="mt-8 bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6 text-center">
	              <p className="text-lg text-anchor-cream-text/70">
	                <span className="font-bold text-anchor-cream-text">Outside ULEZ Zone</span> - Perfect for visitors from
	                London without the £12.50 daily charge
	              </p>
	            </div>
          </div>
        </Container>
      </section>

      {/* Local Favourites */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Stanwell's Favourite Pub Food"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Famous Sunday Roasts</h3>
                <p className="text-anchor-cream-text/70 mb-3">The talk of Stanwell! Our traditional Sunday roasts must be ordered by 1pm Saturday.</p>
	                <ul className="space-y-2 text-anchor-cream-text/70">
	                  <li>• Roasted Chicken - £19.99</li>
	                  <li>• Slow-Cooked Lamb Shank - £23.99</li>
	                  <li>• Crispy Pork Belly - £21.99</li>
	                  <li>• Beetroot &amp; Butternut Squash Wellington (V) - £19.99</li>
	                  <li>• Kids Roasted Chicken - £13.99</li>
	                </ul>
                <p className="mt-3 text-sm text-anchor-gold">Book early - Stanwell locals fill tables fast!</p>
              </div>

              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Weekday Favourites</h3>
                <p className="text-anchor-cream-text/70 mb-3">Classic British pub fare loved by Stanwell residents</p>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li>• Fish & Chips Fridays</li>
                  <li>• Beef & Ale Pie</li>
                  <li>• Chicken Katsu Curry</li>
                  <li>• Stone-baked Pizzas</li>
                </ul>
                <p className="mt-3 text-sm text-anchor-gold">Kitchen: Tue-Fri 6-9pm, Sat 1-7pm, Sun 1-6pm</p>
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
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Getting to The Anchor from Stanwell"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-cream-text mb-4">From Stanwell Village</h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">1.</span>
                    <span className="text-anchor-cream-text/70">Head north on Oaks Road from the village centre</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">2.</span>
                    <span className="text-anchor-cream-text/70">Turn left onto Stanwell Moor Road</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">3.</span>
                    <span className="text-anchor-cream-text/70">Continue for about half a mile</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">4.</span>
                    <span className="text-anchor-cream-text/70">Turn right onto Horton Road</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">5.</span>
                    <span className="text-anchor-cream-text/70">The Anchor is on your right with free parking</span>
                  </li>
                </ol>
                <p className="mt-4 text-sm text-anchor-cream-text/70">
                  <strong className="text-anchor-cream-text">Journey time:</strong> 5 minutes by car, 20 minutes walking
                </p>
              </div>

              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-cream-text mb-4">Public Transport</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-anchor-cream-text mb-2">Bus Route 442</p>
                    <p className="text-anchor-cream-text/70">Stops directly outside The Anchor. Connects Stanwell, Stanwell Moor, and Heathrow.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-anchor-cream-text mb-2">Walking from Stanwell</p>
                    <p className="text-anchor-cream-text/70">Pleasant 20-minute walk through residential areas. Popular route for dog walkers!</p>
                  </div>
                  <div className="pt-4 border-t border-anchor-gold/15">
                    <p className="font-semibold text-anchor-gold-vivid">Eco-Friendly Route</p>
                    <p className="text-anchor-cream-text/70">Outside ULEZ zone - no charges for any vehicles</p>
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
                Get Directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Stanwell Community */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Part of the Stanwell Community"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="text-left">
                <h3 className="text-xl font-bold text-anchor-cream-text mb-4">Local Connections</h3>
                <ul className="space-y-3 text-anchor-cream-text/70">
                  <li>• Regular meetup spot for Stanwell clubs</li>
                  <li>• Supporters of local charities</li>
                  <li>• Venue for Stanwell celebrations</li>
                  <li>• Home to local darts and pool teams</li>
                  <li>• Dog walkers' favourite refreshment stop</li>
                </ul>
              </div>

              <div className="text-left">
                <h3 className="text-xl font-bold text-anchor-cream-text mb-4">Near Stanwell Landmarks</h3>
                <ul className="space-y-3 text-anchor-cream-text/70">
                  <li>• 5 minutes from Stanwell Village</li>
                  <li>• 10 minutes from King George VI Reservoir</li>
                  <li>• 15 minutes from Staines-upon-Thames</li>
                  <li>• 7 minutes from Heathrow Terminal 5</li>
                  <li>• Next to St Mary's Church, Stanwell Moor</li>
                </ul>
              </div>
            </div>

            <p className="text-lg text-anchor-cream-text/70">
              Whether you're a lifelong Stanwell resident or new to the area,
              The Anchor welcomes you with warm hospitality and cold pints!
            </p>
          </div>
        </Container>
      </section>

      {/* Stanwell Heritage & Walking */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Stanwell Heritage & the Village Local"
              className="text-center mb-8"
            />
            <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
              <p>
                Stanwell village and Stanwell Moor are neighbouring communities separated by a few fields and a
                pleasant stretch of Stanwell Moor Road. The Anchor sits on the Moor side, at the end of Horton Road,
                where the village meets open countryside and the reservoirs. It is a fifteen-to-twenty-minute walk
                from Stanwell village centre — a route many of our regulars take on summer evenings, often with
                a dog or two in tow.
              </p>
              <p>
                The area has deep roots. St Mary the Virgin in Stanwell dates back to the twelfth century, and
                the village has been a settled community since before the Domesday Book. The Anchor, established in
                1751, is part of that heritage — a proper local that has served generations of Stanwell families.
                We have hosted christenings, wakes, birthday parties, and retirement dos for people who grew up
                on these streets, and their children after them.
              </p>
              <p>
                For those who enjoy a walk before their pint, the Staines Reservoirs and the King George VI
                Reservoir are right on our doorstep. Birdwatchers, joggers, and weekend walkers regularly finish
                their circuit at The Anchor for a well-earned Sunday roast or a midweek pizza. The beer garden
                catches the afternoon sun and offers uninterrupted views of the Heathrow flight path — it is the
                natural pit-stop after a lap of the reservoir, and far more rewarding than heading back to the car
                park empty-handed.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
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
        className="bg-anchor-bg"
      />

      {/* CTA Section */}
      <CTASection
        title="Visit Stanwell's Favourite Local Pub"
        description="Join your neighbours at The Anchor - where Stanwell comes together"
        buttons={[
          {
            text: "Book a Table",
            href: "/book-table",
            variant: "secondary"
          },
          {
            text: "Call Us",
            href: `${CONTACT.phoneHref}`,
            isPhone: true,
            phoneSource: "stanwell_pub_cta",
            variant: "white"
          },
          {
            text: "Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: "What's On",
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
