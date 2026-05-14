import Link from 'next/link'
import { Metadata } from 'next'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, QuickInfoGrid, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneLink } from '@/components/PhoneLink'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { GoogleReviews } from '@/components/reviews'
import { HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessHours } from '@/lib/api'
import { generateKitchenHoursSpecification } from '@/lib/schema-utils'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Restaurants Near Heathrow | Pub Food 7 Mins from T5',
  description: 'Where to eat near Heathrow before a flight, after landing or during a layover. Pub food, free customer parking and online table booking.',
  openGraph: {
    title: 'Restaurants Near Heathrow | Pub Food 7 Mins from T5',
    description: 'Pre-flight, layover and post-landing meals near Heathrow with pub food, free customer parking and online booking.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Restaurants Near Heathrow | Pub Food 7 Mins from T5',
    description: 'Pre-flight, layover and post-landing meals near Heathrow with pub food, free customer parking and online booking.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/restaurants-near-heathrow'
  }
}

export default async function RestaurantsNearHeathrowPage() {
  const businessHours = await getBusinessHours()
  const kitchenHoursSpecification = generateKitchenHoursSpecification(businessHours)

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "https://www.the-anchor.pub/restaurants-near-heathrow",
    "name": "The Anchor",
    "description": "Traditional British restaurant near Heathrow Airport offering better value than terminal dining with free parking",
    "url": "https://www.the-anchor.pub/restaurants-near-heathrow",
    "telephone": "+441753682707",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.462509,
      "longitude": -0.502067
    },
    ...(kitchenHoursSpecification.length ? { "openingHoursSpecification": kitchenHoursSpecification } : {}),
    "servesCuisine": ["British", "Traditional British", "Pub Food"],
    "priceRange": "££",
    "acceptsReservations": true,
    "menu": "https://www.the-anchor.pub/food-menu",
    "hasMenu": {
      "@type": "Menu",
      "url": "https://www.the-anchor.pub/food-menu",
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Sunday Roast",
          "description": "Traditional British Sunday roasts served Sundays 1pm-6pm"
        },
        {
          "@type": "MenuSection",
          "name": "Pizza",
          "description": "Stone-baked pizzas with hand-stretched bases and bold toppings"
        },
        {
          "@type": "MenuSection",
          "name": "Traditional Mains",
          "description": "British pub classics including fish & chips"
        }
      ]
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Parking",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "WiFi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Outdoor Seating",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Dog Friendly",
        "value": true
      }
    ]
  }
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Restaurants Near Heathrow', url: '/restaurants-near-heathrow' }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/restaurants-near-heathrow"
        title="Where to Eat Near Heathrow Before Your Flight"
        description="Pre-flight dining, layover meals and post-landing food, just 7 minutes from Terminal 5"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      {/* Page Title for SEO */}
      <section className="section-spacing-sm bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            Where to Eat Near Heathrow - Pre-Flight Dining &amp; Layover Meals Just Minutes Away
          </PageTitle>
        </Container>
      </section>

      {/* Definitive Answer Paragraph */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg leading-relaxed text-anchor-cream-text/80">
              Wondering where to eat near Heathrow before your flight? The Anchor in Stanwell Moor is a real pub restaurant just 7 minutes from Terminal 5 and 11 to 12 minutes from the other terminals. Book a table for pre-flight dining, a layover meal or a post-landing bite, with free customer parking, freshly cooked food and a calmer setting than the terminal.
            </p>
          </div>
        </Container>
      </section>

      {/* Price Comparison Table */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="How Dining Options Near Heathrow Compare"
              subtitle="Typical prices, parking costs and travel times at a glance"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-anchor-gold/30">
                    <th className="py-3 px-4 text-anchor-gold-vivid font-bold text-sm">Option</th>
                    <th className="py-3 px-4 text-anchor-gold-vivid font-bold text-sm">Typical Main Course</th>
                    <th className="py-3 px-4 text-anchor-gold-vivid font-bold text-sm">Parking</th>
                    <th className="py-3 px-4 text-anchor-gold-vivid font-bold text-sm">Distance from T5</th>
                    <th className="py-3 px-4 text-anchor-gold-vivid font-bold text-sm">Atmosphere</th>
                  </tr>
                </thead>
                <tbody className="text-anchor-cream-text/80">
                  <tr className="border-b border-anchor-gold/10">
                    <td className="py-3 px-4 font-medium">Heathrow Terminal Restaurants</td>
                    <td className="py-3 px-4">&pound;15&ndash;30</td>
                    <td className="py-3 px-4">N/A (airside)</td>
                    <td className="py-3 px-4">Inside terminal</td>
                    <td className="py-3 px-4">Airport</td>
                  </tr>
                  <tr className="border-b border-anchor-gold/10">
                    <td className="py-3 px-4 font-medium">Hotel Restaurants (Sofitel, Hilton)</td>
                    <td className="py-3 px-4">&pound;18&ndash;30 + service</td>
                    <td className="py-3 px-4">&pound;15&ndash;25/day</td>
                    <td className="py-3 px-4">5&ndash;15 mins</td>
                    <td className="py-3 px-4">Corporate</td>
                  </tr>
                  <tr className="border-b border-anchor-gold/10 bg-anchor-gold/5">
                    <td className="py-3 px-4 font-bold text-anchor-gold-vivid">The Anchor</td>
                    <td className="py-3 px-4 font-bold text-anchor-gold-vivid">&pound;10&ndash;20</td>
                    <td className="py-3 px-4 font-bold text-green-400">Free</td>
                    <td className="py-3 px-4 font-bold text-anchor-gold-vivid">7 mins</td>
                    <td className="py-3 px-4 font-bold text-anchor-gold-vivid">Traditional pub</td>
                  </tr>
                  <tr className="border-b border-anchor-gold/10">
                    <td className="py-3 px-4 font-medium">Toby Carvery</td>
                    <td className="py-3 px-4">&pound;10&ndash;14</td>
                    <td className="py-3 px-4">Free</td>
                    <td className="py-3 px-4">10 mins</td>
                    <td className="py-3 px-4">Family carvery</td>
                  </tr>
                  <tr className="border-b border-anchor-gold/10">
                    <td className="py-3 px-4 font-medium">The Three Magpies</td>
                    <td className="py-3 px-4">&pound;10&ndash;18</td>
                    <td className="py-3 px-4">Free</td>
                    <td className="py-3 px-4">5 mins</td>
                    <td className="py-3 px-4">Chain pub</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-anchor-cream-text/55 mt-4 text-center">
              Prices are approximate and based on publicly available menus. Last updated March 2026.
            </p>
          </div>
        </Container>
      </section>

      {/* Outside vs Inside the Airport */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Should You Stay Inside the Airport or Leave?"
              subtitle="A quick guide to help you decide"
            />
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Stay inside the airport if\u2026",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• You have under 2 hours before your flight</li>
                      <li>• You are already through security</li>
                      <li>• You are on expenses and price is not a concern</li>
                    </ul>
                  ),
                  variant: "default"
                },
                {
                  title: "Leave the airport if\u2026",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• You have 3 or more hours to spare</li>
                      <li>• You want real food at real prices</li>
                      <li>• You are meeting someone local</li>
                      <li>• You want free parking while you eat</li>
                      <li>• You have a dog with you</li>
                    </ul>
                  ),
                  variant: "default"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Transport from Each Terminal */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="How to Get to The Anchor from Each Terminal"
              subtitle="Quick directions and estimated taxi fares"
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-dark rounded-none p-6">
                <h3 className="font-bold text-lg text-anchor-gold-vivid mb-3">From Terminal 5</h3>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li><strong>Drive:</strong> 7 minutes via A3044</li>
                  <li><strong>Taxi:</strong> approx. &pound;10&ndash;12</li>
                  <li><strong>Route:</strong> Head south on the A3044 towards Stanwell Moor, we are on Horton Road</li>
                </ul>
              </div>
              <div className="card-dark rounded-none p-6">
                <h3 className="font-bold text-lg text-anchor-gold-vivid mb-3">From Terminals 2 &amp; 3</h3>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li><strong>Drive:</strong> 10&ndash;12 minutes via A30</li>
                  <li><strong>Taxi:</strong> approx. &pound;12&ndash;15</li>
                  <li><strong>Route:</strong> Take the A30 south then follow signs for Stanwell Moor village</li>
                </ul>
              </div>
              <div className="card-dark rounded-none p-6">
                <h3 className="font-bold text-lg text-anchor-gold-vivid mb-3">From Terminal 4</h3>
                <ul className="space-y-2 text-anchor-cream-text/70">
                  <li><strong>Drive:</strong> 8 minutes via A30</li>
                  <li><strong>Taxi:</strong> approx. &pound;10&ndash;12</li>
                  <li><strong>Route:</strong> Head west on the A30 towards Staines, turn off at Stanwell Moor</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-anchor-cream-text/55">
                All taxi fares are estimates based on standard metered rates. Uber and Bolt are also available from all terminals.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Restaurants at Heathrow Terminal 2, 3, 4 & 5 - Try a Local Alternative"
            subtitle="If you are searching for terminal restaurants, we are a short ride away with free parking and better prices."
          />
          <InfoBoxGrid
            columns={2}
            boxes={[
              {
                title: "Terminal 5 restaurant alternative",
                content: (
                  <p>
                    Guests looking for restaurants at Heathrow Terminal 5 or food at Terminal 5 Heathrow reach us in 7 minutes.
                    Pre-book and skip airport queues.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              },
              {
                title: "Terminal 3 food alternative",
                content: (
                  <p>
                    Searching for restaurants at Heathrow Terminal 3 or food in Terminal 3 Heathrow? We are 11 minutes away
                    with traditional pub dining and quick service.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              },
              {
                title: "Terminal 2 dining alternative",
                content: (
                  <p>
                    Instead of restaurants at Heathrow Terminal 2, ride to Stanwell Moor for British classics, Sunday roasts,
                    and free parking before you return to the airport.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              },
              {
                title: "Terminal 4 dining alternative",
                content: (
                  <p>
                    If Terminal 4 food feels overpriced, our restaurant is about 12 minutes away with proper meals, a full bar,
                    and space for luggage.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-raised"
              }
            ]}
          />
        </Container>
      </section>

      {/* Why Choose Us Over Airport Dining */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Why Smart Travellers Choose The Anchor Over Airport Restaurants"
              subtitle="Better food, better prices, better atmosphere - just minutes from all terminals"
            />
            
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Save Money on Every Meal",
                  content: (
                    <div className="space-y-3">
                      <div className="bg-anchor-bg-raised rounded-lg border border-anchor-gold/15 p-4">
	                        <h4 className="font-bold text-anchor-gold-vivid mb-2">Price Comparison:</h4>
	                        <ul className="space-y-2 text-anchor-cream-text/70">
	                          <li><strong>Airport Burger & Chips:</strong> £18-22</li>
	                          <li><strong>Our Burger & Chips:</strong> Under £12</li>
	                          <li className="text-green-400 font-bold">You Save: £6-10 per meal</li>
	                        </ul>
	                      </div>
	                      <div className="bg-green-900/20 rounded-lg border border-green-500/30 p-3">
	                        <p className="text-sm font-semibold text-green-400">
	                          Plus: FREE parking saves another £20-40!
	                        </p>
	                      </div>
                    </div>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15"
                },
                {
	                  title: "Free Parking Worth £20-40",
	                  content: (
	                    <div className="space-y-3">
	                      <p className="font-semibold text-anchor-cream-text">Airport Parking Costs:</p>
	                      <ul className="space-y-1 text-anchor-cream-text/70">
	                        <li>• Terminal 5: £39/day</li>
	                        <li>• Terminals 2/3: £42/day</li>
	                        <li>• Short stay: £8.50/hour</li>
	                      </ul>
                      <div className="bg-anchor-bg-raised rounded-lg p-4 mt-4 border border-anchor-gold/15">
                        <p className="font-bold text-green-400">The Anchor: Always FREE</p>
                        <p className="text-sm text-green-400 mt-1">20 spaces for our guests</p>
                      </div>
                    </div>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15"
                }
              ]}
              className="mb-12"
            />

            {/* Distance to Terminals */}
            <AlertBox
              variant="info"
              title="Quick Drive from All Terminals"
              className="max-w-4xl mx-auto"
              content={
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <p className="font-bold text-lg">Terminal 5</p>
                    <p className="text-2xl font-bold text-anchor-gold-vivid">7 mins</p>
                    <p className="text-sm text-anchor-cream-text/55">2.8 miles</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">Terminal 4</p>
                    <p className="text-2xl font-bold text-anchor-gold-vivid">12 mins</p>
                    <p className="text-sm text-anchor-cream-text/55">4.2 miles</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">Terminal 2</p>
                    <p className="text-2xl font-bold text-anchor-gold-vivid">11 mins</p>
                    <p className="text-sm text-anchor-cream-text/55">5.8 miles</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">Terminal 3</p>
                    <p className="text-2xl font-bold text-anchor-gold-vivid">11 mins</p>
                    <p className="text-sm text-anchor-cream-text/55">5.8 miles</p>
                  </div>
                </div>
              }
            />
          </div>
        </Container>
      </section>

      {/* Menu Highlights */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Traditional British Restaurant Menu"
              subtitle="Proper pub food cooked fresh to order - no heat lamps, no microwaves"
            />
            
            <FeatureGrid
              columns={3}
              features={[
	                {
	                  icon: "",
	                  title: "Famous Sunday Roasts",
	                  description: "Traditional roast dinners with Yorkshire puddings, roast potatoes & homemade gravy. £19-£22, served Sundays 1pm-6pm.",
	                  className: "text-center"
	                },
                {
                  icon: "",
                  title: "Fish & Chips",
                  description: "Beer-battered cod with triple-cooked chips, mushy peas & tartare sauce.",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Stone-Baked Pizzas",
                  description: "Hand-stretched bases, rich tomato sauce and generous toppings made to order.",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Burgers & Classics",
                  description: "Proper pub burgers, pies, and British classics. All cooked fresh within 15 minutes.",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Dietary Options",
                  description: "Vegetarian options available. Small kitchen means we can't guarantee no cross-contamination.",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Full Bar Service",
                  description: "9 draught beers, premium spirits, wines, and cocktails. A pint costs what a pint should cost!",
                  className: "text-center"
                }
              ]}
            />
            
            <div className="text-center mt-8">
              <Link href="/food-menu">
                <Button variant="primary" size="lg">
                  View Full Menu & Prices
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Perfect For Section */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Perfect Restaurant for Every Occasion"
            />
            
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Pre-Flight Dining",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• Eat proper food before your flight</li>
                      <li>• Park free while you dine</li>
                      <li>• Quick 7-minute drive to Terminal 5</li>
                      <li>• Avoid airport queues and prices</li>
                      <li>• Luggage storage available</li>
                    </ul>
                  ),
                  variant: "default"
                },
                {
                  title: "Post-Flight Recovery",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• Traditional British welcome home</li>
                      <li>• Proper meal after airline food</li>
                      <li>• Relax before the drive home</li>
                      <li>• Hearty pub meals after a long flight</li>
                      <li>• Free WiFi to catch up</li>
                    </ul>
                  ),
                  variant: "default"
                },
                {
                  title: "Business Meetings",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• Quiet environment for discussions</li>
                      <li>• Free parking for all attendees</li>
                      <li>• Private dining room available</li>
                      <li>• Power points in dining room</li>
                      <li>• Much cheaper than hotel restaurants</li>
                    </ul>
                  ),
                  variant: "default"
                },
                {
                  title: "‍Crew & Airport Workers",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li>• Regular stop for flight crews</li>
                      <li>• Popular with Heathrow workers</li>
                      <li>• Quick service for tight schedules</li>
                      <li>• Takeaway available (20-25 mins)</li>
                      <li>• Staff who remember your name</li>
                    </ul>
                  ),
                  variant: "default"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Restaurant Opening Hours"
              subtitle="Kitchen hours for fresh-cooked meals"
            />
            
            <div className="card-dark rounded-none p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-anchor-cream-text">Kitchen Hours</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="font-medium">Monday:</span>
                      <span className="text-red-600 font-semibold">CLOSED</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Tuesday-Friday:</span>
                      <span>6pm - 9pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Saturday:</span>
                      <span>1pm - 7pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Sunday:</span>
                      <span>1pm - 6pm</span>
                    </li>
                  </ul>
                  <p className="text-sm text-anchor-cream-text/55 mt-4">
                    Sunday: Regular menu available without pre-order
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-4 text-anchor-cream-text">Bar Hours</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="font-medium">Mon-Thu:</span>
                      <span>4pm - 10pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Friday:</span>
                      <span>4pm - 12am</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Saturday:</span>
                      <span>12pm - 12am</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Sunday:</span>
                      <span>12pm - 10pm</span>
                    </li>
                  </ul>
                  <p className="text-sm text-anchor-cream-text/55 mt-4">
                    Full bar service during all opening hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Reviews */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="What Diners Say About Our Restaurant"
              subtitle="Real reviews from Google"
            />
            <GoogleReviews 
              layout="grid"
              showTitle={false}
            />
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "How far is The Anchor restaurant from Heathrow Airport?",
            answer: "We're just 7 minutes from Terminal 5, 12 minutes from Terminal 4, and 11 minutes from Terminals 2 & 3. Much quicker than navigating airport restaurants!"
          },
          {
            question: "Are you a good alternative to restaurants at Heathrow Terminal 5?",
            answer: "Yes. If you're searching for restaurants at Heathrow Terminal 5 or food at Terminal 5 Heathrow, we're 7 minutes away with free parking, larger portions, and faster service when you pre-book."
          },
          {
            question: "Is there food near Heathrow Terminal 3 if I want to leave the airport?",
            answer: "The Anchor is about 11 minutes from Terminal 3. Guests looking for food in Terminal 3 Heathrow often choose us for a calmer meal, then return by taxi."
          },
	          {
	            question: "Is parking really free at your restaurant?",
	            answer: "Yes! We have 20 free parking spaces for our guests with no time limit while you're dining with us."
	          },
          {
            question: "What type of food does your restaurant serve?",
            answer: "We serve traditional British pub food including famous Sunday roasts (£19-£22), fish & chips, burgers, pies, and stone-baked pizzas. Everything is cooked fresh to order within 15 minutes."
          },
	          {
	            question: "Are you cheaper than airport restaurants?",
	            answer: "Yes, we offer honest pub pricing with mains from £8.99 and freshly cooked food. Plus, parking is completely free for guests."
	          },
          {
            question: "Do you take reservations?",
            answer: "Yes, we take reservations and walk-ins. Sunday roast is served 1pm-6pm, no pre-order needed. Call 01753 682707 or book online."
          },
          {
            question: "Can I get takeaway if I'm in a hurry?",
            answer: "Yes! All menu items are available for takeaway with a 20-25 minute wait time. Perfect if you want to eat proper food on your journey instead of expensive airport snacks."
          }
        ]}
        className="bg-anchor-bg"
      />

      <OrganicSearchClusterLinks
        cluster="heathrowDining"
        currentPath="/restaurants-near-heathrow"
        title="Compare Heathrow dining options"
        intro="Use the live menu, layover guide and Sunday lunch page to choose the right meal before you book."
      />

      {/* CTA Section */}
      <CTASection
        title="Skip the Airport Restaurants"
        description="Better food, better prices, free parking - just minutes from all terminals"
        buttons={[
          {
            text: "Book a Table",
            href: "/book-table",
            variant: "primary"
          },
          {
            text: "Call: 01753 682707",
            href: "tel:+441753682707",
            variant: "secondary",
            isPhone: true,
            phoneSource: "restaurants_near_heathrow_cta"
          }
        ]}
        variant="green"
        footer="Open Tuesday-Sunday • Kitchen closes 9pm weekdays • Free parking always available"
      />
    </>
  )
}
