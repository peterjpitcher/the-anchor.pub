import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
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
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { BookTableButton } from '@/components/BookTableButton'

export const metadata: Metadata = {
  title: `M25 Junction 14 Pub (5 Mins) - Free Parking & Food | ${BRAND.name}`,
  description: `Pull off Junction 14 M25 for The Anchor: free parking, proper British pub food, real ales and a relaxed Surrey village break minutes from Heathrow.`,
  keywords: 'junction 14 m25 pub stop, m25 junction 14 pub, motorway pub with parking, british food near m25, pub near heathrow junction 14',
  openGraph: {
    title: 'M25 Junction 14 Pub Stop - The Anchor Stanwell Moor',
    description: '5 minutes from M25 J14 with free parking, British pub food and real ales.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'M25 Junction 14 Pub Stop - The Anchor Stanwell Moor',
    description: '5 minutes from M25 J14 with free parking, British pub food and real ales.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/m25-junction-14-pub'
  }
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "BarOrPub"],
  "@id": "https://www.the-anchor.pub/m25-junction-14-pub#business",
  "name": `${BRAND.name} - Near M25 Junction 14`,
  "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": CONTACT.address.street,
    "addressLocality": CONTACT.address.town,
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
      "@type": "Place",
      "name": "M25 Junction 14"
    },
    {
      "@type": "Place",
      "name": "M25 Motorway"
    },
    {
      "@type": "Place",
      "name": "A3113"
    }
  ],
  "priceRange": "££",
  "servesCuisine": ["British", "Traditional English", "Motorway Food Alternative"],
  "telephone": CONTACT.phoneIntl,
  "url": "https://www.the-anchor.pub/m25-junction-14-pub"
}

export default function M25Junction14PubPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: 'M25 Junction 14 Pub', url: '/m25-junction-14-pub' }
  ])

  const directionsSchema = generateHowToDirectionsSchema(
    'M25 Junction 14',
    'The Anchor - Heathrow Pub & Dining',
    [
      'Exit M25 at Junction 14',
      'At roundabout, take A3113 exit (Airport Way/Stanwell Moor)',
      'Continue on A3113 for 1 mile',
      'Turn right onto Horton Road',
      'The Anchor is 0.5 miles on your left',
      'Free parking available on site'
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
        route="/m25-junction-14-pub"
        title="Your M25 Junction 14 Pit Stop"
        description="Just 5 minutes from the motorway - real food, real prices"
        variant="default"
        primaryCta={
          <BookTableButton
            source="m25_j14_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="m25_stopover"
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

      {/* Quick Summary */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-anchor-cream/40 border border-anchor-cream rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-anchor-cream-text mb-3">Why Stop Off At The Anchor</h2>
            <p className="text-anchor-cream-text/70 mb-4">
              Swap service-station sandwiches for hearty pub food, real ales and a breather before rejoining the M25 from Junction 14.
            </p>
            <div className="grid gap-3 md:grid-cols-2 text-anchor-cream-text/70">
              <div className="flex items-start gap-2">
                <span>5 minute diversion from Junction 14 via A3113 and Horton Road</span>
              </div>
              <div className="flex items-start gap-2">
                <span>Free parking for cars, vans and minibuses while you dine</span>
              </div>
              <div className="flex items-start gap-2">
                <span>Burgers, pizzas and pub classics served Tuesday to Sunday</span>
              </div>
              <div className="flex items-start gap-2">
                <span>Dog friendly bar area and beer garden for four-legged passengers</span>
              </div>
            </div>
          </div>
        </div>
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
              className="text-anchor-green mb-4"
            >
              Junction 14 M25 Pub - Traditional British Pub Near M25
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              The smart alternative to motorway services - just 5 minutes from Junction 14
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="The Smart Alternative to Service Stations"
              subtitle="Why settle for overpriced motorway services when a proper British pub is just 5 minutes from Junction 14? Fresh food, fair prices, and a chance to stretch your legs in our beer garden."
            />
            
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "5 Minutes",
                  description: "Quick detour from M25 Junction 14",
                  variant: "colored",
                  color: "bg-green-50",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "",
                  title: "Half Price",
                  description: "Compared to motorway services",
                  variant: "colored",
                  color: "bg-red-50",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "",
                  title: "Free Parking",
                  description: "20 spaces, easy access",
                  variant: "colored",
                  color: "bg-blue-50",
                  className: "rounded-xl p-6 text-center"
                }
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Why Choose Us Over Services */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Why M25 Drivers Choose The Anchor"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Beat Service Station Blues</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl"></span>
                    <div>
                      <strong>Service stations:</strong> 15+ for a basic sandwich meal
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl"></span>
                    <div>
                      <strong>The Anchor:</strong> Full meals from 9.99
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl"></span>
                    <div>
                      <strong>Service stations:</strong> Packaged, reheated food
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl"></span>
                    <div>
                      <strong>The Anchor:</strong> Freshly cooked to order
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl"></span>
                    <div>
                      <strong>Service stations:</strong> Crowded, noisy, stressful
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl"></span>
                    <div>
                      <strong>The Anchor:</strong> Relaxed pub atmosphere
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Perfect Journey Break</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div>
                      <strong>Proper refreshment</strong> - Real ales, wines, soft drinks
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div>
                      <strong>Beer garden break</strong> - Stretch legs in fresh air
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div>
                      <strong>Dog friendly</strong> - Perfect for traveling with pets
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div>
                      <strong>Clean facilities</strong> - Better than service stations
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl"></span>
                    <div>
                      <strong>Free WiFi</strong> - Check routes, emails, or relax
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <AlertBox
              variant="info"
              title="M25 Tip"
              className="mt-8 text-center"
              content={
                <p className="text-lg">
                  Avoid peak times (7-9am, 5-7pm) for the quickest detour. We're much quieter than services during rush hours!
                </p>
              }
            />
          </div>
        </Container>
      </section>

      {/* Quick Stops Menu */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Quick Stops & Hearty Meals"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="text-xl font-bold text-amber-800 mb-4">20-Minute Lunch Stops</h3>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li>• Chicken Goujon Wrap with Chips - 9.99</li>
                  <li>• Beef Burger - 9.99</li>
                  <li>• Fish & Chips - 14.99</li>
                  <li>• Jumbo Sausage & Chips - 12.99</li>
                  <li>• Beef & Ale Pie - 14.99</li>
                </ul>
                <p className="mt-3 text-sm text-amber-700">All served quickly for motorway travelers</p>
              </div>
              
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Take a Proper Break</h3>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li>• Beef & Ale Pie - 14.99</li>
                  <li>• Chicken Katsu Curry - 13.99</li>
                  <li>• Stone-baked pizzas</li>
                  <li>• Daily Specials Board</li>
                </ul>
                <p className="mt-3 text-sm text-blue-700">Relax and enjoy - you deserve it!</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-anchor-cream-text/70 mb-4">
                Kitchen serves quick meals perfect for motorway breaks
              </p>
              <Link href="/food-menu">
                <Button variant="primary" size="lg">
                  View Full Menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Journey Planner */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Easy Access from M25 Junction 14"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="text-xl font-bold mb-4">From M25 Clockwise</h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">1.</span>
                    <span>Exit at Junction 14 (signed Heathrow T4, T5)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">2.</span>
                    <span>At roundabout, take 3rd exit (A3113)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">3.</span>
                    <span>After 1 mile, turn right onto Horton Road</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">4.</span>
                    <span>The Anchor is 0.5 miles on your left</span>
                  </li>
                </ol>
                <p className="mt-4 text-sm text-anchor-cream-text/55">
                  <strong>Total time:</strong> 5 minutes from motorway
                </p>
              </div>
              
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="text-xl font-bold mb-4">Rejoining M25</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Back to M25 (any direction)</p>
                    <p className="text-anchor-cream-text/70">Simply reverse the route - well signed back to Junction 14</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Alternative Routes</p>
                    <ul className="space-y-1 text-anchor-cream-text/70 text-sm">
                      <li>• To Heathrow: Continue on local roads</li>
                      <li>• To M4: Via Stanwell and M25 J15</li>
                      <li>• To A30: Direct from Stanwell Moor</li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-green-700 font-semibold">Time Saver</p>
                    <p className="text-sm text-anchor-cream-text/70">Often quicker than service station queues!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <DirectionsButton
                href="https://maps.google.com/maps?saddr=M25+Junction+14&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="m25_junction_14_directions"
                variant="secondary"
                size="md"
                fromLocation="M25 Junction 14"
              >
                Get Sat Nav Directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Regular M25 Users */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Popular with M25 Regulars"
            />
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="font-bold text-lg mb-3">Business Drivers</h3>
                <ul className="space-y-2 text-anchor-cream-text/70 text-sm">
                  <li>• Quieter than services</li>
                  <li>• Proper meals</li>
                  <li>• VAT receipts</li>
                  <li>• Free WiFi</li>
                </ul>
              </div>
              
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="font-bold text-lg mb-3">Long Distance</h3>
                <ul className="space-y-2 text-anchor-cream-text/70 text-sm">
                  <li>• Halfway point M25</li>
                  <li>• Dog walking area</li>
                  <li>• Proper break spot</li>
                  <li>• Avoid M25 stress</li>
                </ul>
              </div>
              
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="font-bold text-lg mb-3">Local Traffic</h3>
                <ul className="space-y-2 text-anchor-cream-text/70 text-sm">
                  <li>• Known by locals</li>
                  <li>• Traffic updates</li>
                  <li>• Alternative routes</li>
                  <li>• Regular stop</li>
                </ul>
              </div>
            </div>
            
            <p className="text-lg text-anchor-cream-text/70">
              Join the smart M25 drivers who've discovered the better alternative to services!
            </p>
          </div>
        </Container>
      </section>

      {/* Additional Benefits */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="More Than Just a Motorway Stop"
            />
            
            <div className="bg-white rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-anchor-cream-text mb-4">Perfect For</h3>
                  <ul className="space-y-2 text-anchor-cream-text/70">
                    <li>Meeting point from different M25 directions</li>
                    <li>Break before Heathrow drop-offs</li>
                    <li>Avoiding accident delays with local knowledge</li>
                    <li>Weekend leisure trips around M25</li>
                    <li>Commercial drivers' regular stop</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-anchor-cream-text mb-4">Remember</h3>
                  <ul className="space-y-2 text-anchor-cream-text/70">
                    <li>Postcode: TW19 6AQ</li>
                    <li>Free parking for all</li>
                    <li>Quick service available</li>
                    <li>All cards accepted</li>
                    <li>Outside ULEZ zone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader
              title="Opening Hours for M25 Travelers"
            />
            <BusinessHours />
            <p className="mt-4 text-anchor-cream-text/55">
              Kitchen times perfect for lunch and dinner breaks
            </p>
          </div>
        </Container>
      </section>

      <InternalLinkingSection
        title="Helpful Links Before You Rejoin The Motorway"
        links={[
          { href: '/food-menu', title: 'Food Menu', description: 'Hot meals and quick bites for motorway drivers' },
          { href: '/drinks', title: 'Drinks Menu', description: 'Real ales, low alcohol options and takeaway coffee' },
          { href: '/private-party-venue', title: 'Private Hire', description: 'Book meeting space for team briefings or reunions' },
          { href: '/near-heathrow', title: 'Near Heathrow Hub', description: 'Travel tips for every airport terminal' }
        ]}
        className="section-spacing-md"
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "How far is The Anchor from M25 Junction 14?",
            answer: "We're just 2.1 miles (5 minutes) from M25 Junction 14. Exit at J14, follow A3113 for 1 mile, turn right onto Horton Road, and we're 0.5 miles on your left. Much quicker than queuing at motorway services!"
          },
          {
            question: "Is it worth leaving the M25 for food at The Anchor?",
            answer: "Absolutely! You'll get freshly cooked food instead of reheated meals and enjoy a proper break in relaxed surroundings. The 5-minute detour often takes less time than service station queues."
          },
          {
            question: "Can I park easily if I'm towing or in a large vehicle?",
            answer: "Yes, we have 20 free parking spaces with easy access and turning space. While we can accommodate most vehicles, extremely large lorries might find local laybys more suitable. Cars with caravans and vans fit comfortably."
          },
          {
            question: "What's the quickest meal option for M25 travelers?",
            answer: "Our kitchen can serve sandwiches, burgers, and jacket potatoes within 15-20 minutes. If you're in a real hurry, call ahead on 01753 682707 and we can have your order ready for collection."
          },
          {
            question: "Are you open early/late for M25 traffic?",
            answer: "We open at 4pm Tuesday-Friday and noon on weekends. While we're not open for breakfast, we're perfect for lunch (weekends), afternoon breaks, and dinner. Many M25 regulars time their journeys to stop with us."
          },
          {
            question: "Do you get updates on M25 traffic conditions?",
            answer: "Yes! Our locals often share real-time traffic updates, and we have WiFi if you need to check routes. When there are major delays, we see lots of M25 drivers taking a break with us until traffic clears."
          }
        ]}
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <CTASection
        title="Make The Smart M25 Stop"
        description="Real food, real prices, real break - just 5 minutes from Junction 14"
        buttons={[
          {
            text: "Call Ahead",
            href: `${CONTACT.phoneHref}`,
            variant: "secondary"
          },
          {
            text: "Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: "Get Directions",
            href: "/find-us",
            variant: "white"
          }
        ]}
        variant="green"
        footer="Free Parking • Quick Service • Dog Friendly • Outside ULEZ"
      />
    </>
  )
}
