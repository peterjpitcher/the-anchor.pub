import Link from 'next/link'
import { Metadata } from 'next'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { GoogleReviews } from '@/components/reviews'
import { CONTACT } from '@/lib/constants'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessHours } from '@/lib/api'
import { generateKitchenHoursSpecification } from '@/lib/schema-utils'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { HeathrowFoodBestFor } from '@/components/food/HeathrowFoodBestFor'

export const metadata: Metadata = {
  title: 'Restaurants Near Heathrow Airport | The Anchor, Stanwell Moor',
  description: 'Looking for restaurants near Heathrow Airport? The Anchor serves pub food with current menu prices, 7 mins from T5 with free parking. Book a table or walk in.',
  openGraph: {
    title: 'Best Restaurants Near Heathrow Airport | The Anchor',
    description: 'Proper pub food 7 minutes from Heathrow Terminal 5. Free parking, honest prices, and a calmer meal than anything inside the airport.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor restaurant near Heathrow Airport — pub food with free parking' }],
  },
  twitter: getTwitterMetadata({
    title: 'Best Restaurants Near Heathrow Airport | The Anchor',
    description: 'Proper pub food 7 minutes from Heathrow Terminal 5. Free parking, honest prices, and a calmer meal than anything inside the airport.',
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
    "description": "Restaurant near Heathrow Airport serving traditional British pub food with free parking, 7 minutes from Terminal 5",
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
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Restaurants Near Heathrow"
        title="Restaurants Near Heathrow Airport"
        lead="Proper pub food, free parking, and a 7-minute drive from Terminal 5. A better meal than anything inside the airport."
      />

      <AmenityStrip />

      {/* Page Title for SEO */}
      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Restaurants Near Heathrow Airport &mdash; The Best Place to Eat Before You Fly
          </h2>
        </Container>
      </section>

      {/* Definitive Answer Paragraph */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg leading-relaxed text-ink-muted">
              The Anchor is one of the best restaurants near Heathrow Airport &mdash; a proper pub restaurant in Stanwell Moor, just 7 minutes from Terminal 5 and 11 to 12 minutes from the other terminals. If you&apos;re looking for places to eat near Heathrow before a flight, after landing or during a layover, we serve freshly cooked British food with free parking and a calmer setting than anything inside the terminal.
            </p>
          </div>
        </Container>
      </section>
      <HeathrowFoodBestFor
        title="Best For Food Near Heathrow"
        items={[
          ['Pre-flight meal', 'Book a table before departure and avoid terminal queues.'],
          ['Post-flight meal', 'Meet arrivals somewhere calmer with free customer parking.'],
          ['Layover dining', 'A proper pub meal when you have time to leave the airport.'],
          ['Plane spotting day', 'Food and drinks in the beer garden under the flight path.'],
          ['Sunday roast', 'A proper British roast near Heathrow, served Sundays 1pm to 6pm.'],
        ]}
      />

      {/* Price Comparison Table */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="How Dining Options Near Heathrow Compare"
              subtitle="Typical prices, parking costs and travel times at a glance"
            />
            <div className="overflow-x-auto rounded-md border border-line bg-surface shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Option</th>
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Typical Main Course</th>
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Parking</th>
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Distance from T5</th>
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Atmosphere</th>
                  </tr>
                </thead>
                <tbody className="text-ink-muted">
                  <tr className="border-b border-line">
                    <th scope="row" className="py-3 px-4 text-left font-medium text-ink">Heathrow Terminal Restaurants</th>
                    <td className="py-3 px-4">&pound;15&ndash;30</td>
                    <td className="py-3 px-4">N/A (airside)</td>
                    <td className="py-3 px-4">Inside terminal</td>
                    <td className="py-3 px-4">Airport</td>
                  </tr>
                  <tr className="border-b border-line">
                    <th scope="row" className="py-3 px-4 text-left font-medium text-ink">Hotel Restaurants (Sofitel, Hilton)</th>
                    <td className="py-3 px-4">&pound;18&ndash;30 + service</td>
                    <td className="py-3 px-4">&pound;15&ndash;25/day</td>
                    <td className="py-3 px-4">5&ndash;15 mins</td>
                    <td className="py-3 px-4">Corporate</td>
                  </tr>
                  <tr className="border-b border-line bg-surface-sunk">
                    <th scope="row" className="py-3 px-4 text-left font-semibold text-accent-text">The Anchor</th>
                    <td className="py-3 px-4 font-semibold text-accent-text">&pound;10&ndash;20</td>
                    <td className="py-3 px-4 font-semibold text-anchor-success">Free</td>
                    <td className="py-3 px-4 font-semibold text-accent-text">7 mins</td>
                    <td className="py-3 px-4 font-semibold text-accent-text">Traditional pub</td>
                  </tr>
                  <tr className="border-b border-line">
                    <th scope="row" className="py-3 px-4 text-left font-medium text-ink">Toby Carvery</th>
                    <td className="py-3 px-4">&pound;10&ndash;14</td>
                    <td className="py-3 px-4">Free</td>
                    <td className="py-3 px-4">10 mins</td>
                    <td className="py-3 px-4">Family carvery</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 px-4 text-left font-medium text-ink">The Three Magpies</th>
                    <td className="py-3 px-4">&pound;10&ndash;18</td>
                    <td className="py-3 px-4">Free</td>
                    <td className="py-3 px-4">5 mins</td>
                    <td className="py-3 px-4">Chain pub</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-ink-muted mt-4 text-center">
              Prices are approximate and based on publicly available menus. Last updated March 2026.
            </p>
          </div>
        </Container>
      </section>

      {/* Outside vs Inside the Airport */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Should You Stay Inside the Airport or Leave?"
              subtitle="A quick guide to help you decide"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Stay inside the airport if&hellip;</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>&bull; You have under 2 hours before your flight</li>
                    <li>&bull; You are already through security</li>
                    <li>&bull; You are on expenses and price is not a concern</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Leave the airport if&hellip;</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>&bull; You have 3 or more hours to spare</li>
                    <li>&bull; You want real food at real prices</li>
                    <li>&bull; You are meeting someone local</li>
                    <li>&bull; You want free parking while you eat</li>
                    <li>&bull; You have a dog with you</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

          </div>
        </Container>
      </section>

      {/* Transport from Each Terminal */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="How to Get to The Anchor from Each Terminal"
              subtitle="Quick directions and estimated taxi fares"
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-bold text-lg text-accent-text mb-3">From Terminal 5</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li><strong>Drive:</strong> 7 minutes via A3044</li>
                  <li><strong>Taxi:</strong> approx. &pound;10&ndash;12</li>
                  <li><strong>Route:</strong> Head south on the A3044 towards Stanwell Moor, we are on Horton Road</li>
                </ul>
              </div>
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-bold text-lg text-accent-text mb-3">From Terminals 2 &amp; 3</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li><strong>Drive:</strong> 10&ndash;12 minutes via A30</li>
                  <li><strong>Taxi:</strong> approx. &pound;12&ndash;15</li>
                  <li><strong>Route:</strong> Take the A30 south then follow signs for Stanwell Moor village</li>
                </ul>
              </div>
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-bold text-lg text-accent-text mb-3">From Terminal 4</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li><strong>Drive:</strong> 8 minutes via A30</li>
                  <li><strong>Taxi:</strong> approx. &pound;10&ndash;12</li>
                  <li><strong>Route:</strong> Head west on the A30 towards Staines, turn off at Stanwell Moor</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-ink-muted">
                All taxi fares are estimates based on standard metered rates. Uber and Bolt are also available from all terminals.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Restaurants at Heathrow Terminal 2, 3, 4 & 5 - Try a Local Alternative"
            subtitle="If you are searching for terminal restaurants, we are a short ride away with free parking and better prices."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Terminal 5 restaurant alternative</h3>
                <p className="text-ink-muted">Guests looking for restaurants at Heathrow Terminal 5 or food at Terminal 5 Heathrow reach us in 7 minutes. Pre-book and skip airport queues.</p>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Terminal 3 food alternative</h3>
                <p className="text-ink-muted">Searching for restaurants at Heathrow Terminal 3 or food in Terminal 3 Heathrow? We are 11 minutes away with traditional pub dining and quick service.</p>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Terminal 2 dining alternative</h3>
                <p className="text-ink-muted">Instead of restaurants at Heathrow Terminal 2, ride to Stanwell Moor for British classics, Sunday roasts, and free parking before you return to the airport.</p>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Terminal 4 dining alternative</h3>
                <p className="text-ink-muted">If Terminal 4 food feels overpriced, our restaurant is about 12 minutes away with proper meals, a full bar, and space for luggage.</p>
              </CardBody>
            </Card>
          </div>

        </Container>
      </section>

      {/* Why Choose Us Over Airport Dining */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Why Smart Travellers Choose The Anchor Over Airport Restaurants"
              subtitle="Better food, better prices, better atmosphere - just minutes from all terminals"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Save Money on Every Meal</h3>
                  <div className="space-y-3">
                    <div className="bg-surface-sunk rounded-sm border border-line p-4">
                      <h4 className="font-semibold text-accent-text mb-2">Price Comparison:</h4>
                      <ul className="space-y-2 text-ink-muted">
                        <li><strong>Airport Burger &amp; Chips:</strong> £18-22</li>
                        <li><strong>Our Burger &amp; Chips:</strong> Under £12</li>
                        <li className="text-anchor-success font-semibold">You Save: £6-10 per meal</li>
                      </ul>
                    </div>
                    <div className="bg-anchor-success/10 rounded-sm border border-anchor-success/30 p-3">
                      <p className="text-sm font-semibold text-anchor-success">Plus: FREE parking saves another £20-40!</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Free Parking Worth £20-40</h3>
                  <div className="space-y-3">
                    <p className="font-semibold text-ink-strong">Airport Parking Costs:</p>
                    <ul className="space-y-1 text-ink-muted">
                      <li>&bull; Terminal 5: £39/day</li>
                      <li>&bull; Terminals 2/3: £42/day</li>
                      <li>&bull; Short stay: £8.50/hour</li>
                    </ul>
                    <div className="bg-surface-sunk rounded-sm p-4 mt-4 border border-line">
                      <p className="font-semibold text-anchor-success">The Anchor: Always FREE</p>
                      <p className="text-sm text-anchor-success mt-1">20 spaces for our guests</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Distance to Terminals */}
            <Card accent className="max-w-4xl mx-auto">
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3 text-center">Quick Drive from All Terminals</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="font-semibold text-lg text-ink-strong">Terminal 5</p>
                    <p className="font-display text-h3 text-accent-text">7 mins</p>
                    <p className="text-sm text-ink-muted">2.8 miles</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-ink-strong">Terminal 4</p>
                    <p className="font-display text-h3 text-accent-text">12 mins</p>
                    <p className="text-sm text-ink-muted">4.2 miles</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-ink-strong">Terminal 2</p>
                    <p className="font-display text-h3 text-accent-text">11 mins</p>
                    <p className="text-sm text-ink-muted">5.8 miles</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-ink-strong">Terminal 3</p>
                    <p className="font-display text-h3 text-accent-text">11 mins</p>
                    <p className="text-sm text-ink-muted">5.8 miles</p>
                  </div>
                </div>
              </CardBody>
            </Card>

          </div>
        </Container>
      </section>

      {/* Menu Highlights */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Traditional British Restaurant Menu"
              subtitle="Proper pub food cooked fresh to order - no heat lamps, no microwaves"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Famous Sunday Roasts</h3>
                  <p className="text-ink-muted">Traditional roast dinners with Yorkshire puddings, roast potatoes & homemade gravy. Current menu, served Sundays 1pm-6pm.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Fish & Chips</h3>
                  <p className="text-ink-muted">Beer-battered cod with triple-cooked chips, mushy peas & tartare sauce.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Stone-Baked Pizzas</h3>
                  <p className="text-ink-muted">Hand-stretched bases, rich tomato sauce and generous toppings made to order.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Burgers & Classics</h3>
                  <p className="text-ink-muted">Proper pub burgers, pies, and British classics. All cooked fresh within 15 minutes.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Dietary Options</h3>
                  <p className="text-ink-muted">Vegetarian options available. Small kitchen means we can't guarantee no cross-contamination.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Full Bar Service</h3>
                  <p className="text-ink-muted">9 draught beers, premium spirits, wines, and cocktails. A pint costs what a pint should cost!</p>
                </CardBody>
              </Card>
            </div>
            
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
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Perfect Restaurant for Every Occasion"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Pre-Flight Dining</h3>
                <ul className="space-y-2 text-ink-muted">
                      <li>• Eat proper food before your flight</li>
                      <li>• Park free while you dine</li>
                      <li>• Quick 7-minute drive to Terminal 5</li>
                      <li>• Avoid airport queues and prices</li>
                      <li>• Luggage storage available</li>
                    </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Post-Flight Recovery</h3>
                <ul className="space-y-2 text-ink-muted">
                      <li>• Traditional British welcome home</li>
                      <li>• Proper meal after airline food</li>
                      <li>• Relax before the drive home</li>
                      <li>• Hearty pub meals after a long flight</li>
                      <li>• Free WiFi to catch up</li>
                    </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Business Meetings</h3>
                <ul className="space-y-2 text-ink-muted">
                      <li>• Quiet environment for discussions</li>
                      <li>• Free parking for all attendees</li>
                      <li>• Private dining room available</li>
                      <li>• Power points in dining room</li>
                      <li>• Much cheaper than hotel restaurants</li>
                    </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">‍Crew & Airport Workers</h3>
                <ul className="space-y-2 text-ink-muted">
                      <li>• Regular stop for flight crews</li>
                      <li>• Popular with Heathrow workers</li>
                      <li>• Quick service for tight schedules</li>
                      <li>• Takeaway available (20-25 mins)</li>
                      <li>• Staff who remember your name</li>
                    </ul>
              </CardBody>
            </Card>
          </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Restaurant Opening Hours"
              subtitle="Kitchen hours for fresh-cooked meals"
            />
            
            <div className="bg-surface border border-line rounded-md shadow-sm p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-ink-strong">Kitchen Hours</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="font-medium">Monday:</span>
                      <span className="text-red-600 font-semibold">CLOSED</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Tuesday-Friday:</span>
                      <span>4pm - 9pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Saturday:</span>
                      <span>12pm - 7pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Sunday:</span>
                      <span>1pm - 6pm</span>
                    </li>
                  </ul>
                  <p className="text-sm text-ink-muted mt-4">
                    Sunday: Regular menu available without pre-order
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-4 text-ink-strong">Bar Hours</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="font-medium">Monday:</span>
                      <span className="text-red-600 font-semibold">CLOSED</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Tue-Thu:</span>
                      <span>4pm - 11pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Friday:</span>
                      <span>4pm - 10pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Saturday:</span>
                      <span>12pm - 10pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">Sunday:</span>
                      <span>1pm - 6pm</span>
                    </li>
                  </ul>
                  <p className="text-sm text-ink-muted mt-4">
                    Full bar service during all opening hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Reviews */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading
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
            answer: "We serve traditional British pub food including famous Sunday roasts from the current menu, fish & chips, burgers, pies, and stone-baked pizzas. Everything is cooked fresh to order within 15 minutes."
          },
	          {
	            question: "Are you cheaper than airport restaurants?",
	            answer: "Yes, we offer honest pub pricing with current menu prices and freshly cooked food. Plus, parking is completely free for guests."
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
        className="bg-canvas"
      />

      <OrganicSearchClusterLinks
        cluster="heathrowDining"
        currentPath="/restaurants-near-heathrow"
        title="Compare Heathrow dining options"
        intro="Use the live menu, layover guide and Sunday roast page to choose the right meal before you book."
      />

      {/* CTA Section */}
      <CtaBand
        title="Skip the Airport Restaurants"
        copy="Better food, better prices, free parking - just minutes from all terminals"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <BookTableButton source="restaurants_near_heathrow_cta" variant="primary" size="lg">Book a Table</BookTableButton>
            <PhoneButton phone={CONTACT.phone} source="restaurants_near_heathrow_cta" variant="outline" size="lg">Call: 01753 682707</PhoneButton>
          </div>
          <p className="text-anchor-cream-text/80 text-sm">Open Tuesday-Sunday • Kitchen closes 9pm weekdays • Free parking always available</p>
        </div>
      </CtaBand>
    </>
  )
}
