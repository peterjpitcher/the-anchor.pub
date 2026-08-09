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
  title: 'Restaurants Near Heathrow Airport, 7 Min T5',
  description: 'Looking for restaurants near Heathrow? The Anchor is a proper British pub 7 minutes from Terminal 5, with free parking, home-cooked food and Sunday roasts. Walk in or book.',
  openGraph: {
    title: 'Restaurants Near Heathrow Airport | The Anchor',
    description: 'A proper sit-down British pub minutes from Heathrow. Free parking, home-cooked food, a beer garden, and Sunday roasts served 1pm to 6pm with no booking needed.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor restaurant near Heathrow Airport with pub food and free parking' }],
  },
  twitter: getTwitterMetadata({
    title: 'Restaurants Near Heathrow Airport | The Anchor',
    description: 'A proper sit-down British pub minutes from Heathrow. Free parking, home-cooked food, a beer garden, and Sunday roasts served 1pm to 6pm with no booking needed.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: './'
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
        lead="A proper sit-down British pub minutes from Heathrow. Home-cooked food, free parking, a beer garden under the flight path, and Sunday roasts you can walk straight into."
      />

      <AmenityStrip />

      {/* Page Title for SEO */}
      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Heathrow Restaurants: A Proper Pub to Eat Near the Airport
          </h2>
        </Container>
      </section>

      {/* Definitive Answer Paragraph */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-lg leading-relaxed text-ink-muted">
              The Anchor is a traditional British pub and restaurant in Stanwell Moor, near Heathrow Airport. We are 7 minutes from Terminal 5 and 11 to 12 minutes from the other terminals, so if you are searching for restaurants near Heathrow before a flight, after landing or during a layover, you can be sitting down to a home-cooked meal in minutes. There is free parking on site, a beer garden under the flight path, and a calmer setting than anything you will find inside the terminal.
            </p>
            <p className="text-lg leading-relaxed text-ink-muted">
              We cook proper British pub food: Sunday roasts, fish and chips, stone-baked pizzas, burgers and pies, all made fresh to order rather than reheated. We are not a chain or a fast-food counter, just a village pub where you can take your time, bring the dog, and eat well without airport prices.
            </p>
          </div>
        </Container>
      </section>
      <HeathrowFoodBestFor
        title="Best For Food Near Heathrow"
        items={[
          ['Pre-flight meal', 'Eat a proper meal before you fly and skip the terminal queues.'],
          ['Post-flight meal', 'Meet arrivals somewhere calmer, with free parking for guests.'],
          ['Layover dining', 'A relaxed pub meal when you have a few hours to leave the airport.'],
          ['Plane spotting day', 'Food and drink in the beer garden, right under the flight path.'],
          ['Sunday roast', 'A proper British roast near Heathrow, served 1pm to 6pm, walk-ins welcome.'],
        ]}
      />

      {/* Comparison Table */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="How Eating Near Heathrow Compares"
              subtitle="Parking, travel time and atmosphere at a glance"
            />
            <div className="overflow-x-auto rounded-md border border-line bg-surface shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Where to eat</th>
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Food</th>
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Parking</th>
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">From Terminal 5</th>
                    <th scope="col" className="py-3 px-4 text-accent-text font-semibold text-sm">Atmosphere</th>
                  </tr>
                </thead>
                <tbody className="text-ink-muted">
                  <tr className="border-b border-line">
                    <th scope="row" className="py-3 px-4 text-left font-medium text-ink">Heathrow terminal restaurants</th>
                    <td className="py-3 px-4">Airport menus</td>
                    <td className="py-3 px-4">Airside, none</td>
                    <td className="py-3 px-4">Inside terminal</td>
                    <td className="py-3 px-4">Busy and rushed</td>
                  </tr>
                  <tr className="border-b border-line">
                    <th scope="row" className="py-3 px-4 text-left font-medium text-ink">Airport hotel restaurants</th>
                    <td className="py-3 px-4">Hotel dining, service charge</td>
                    <td className="py-3 px-4">Paid hotel parking</td>
                    <td className="py-3 px-4">Short drive</td>
                    <td className="py-3 px-4">Corporate</td>
                  </tr>
                  <tr className="border-b border-line bg-surface-sunk">
                    <th scope="row" className="py-3 px-4 text-left font-semibold text-accent-text">The Anchor</th>
                    <td className="py-3 px-4 font-semibold text-accent-text">Home-cooked pub food</td>
                    <td className="py-3 px-4 font-semibold text-anchor-success">Free, no time limit</td>
                    <td className="py-3 px-4 font-semibold text-accent-text">7 minutes</td>
                    <td className="py-3 px-4 font-semibold text-accent-text">Relaxed village pub</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 px-4 text-left font-medium text-ink">Chain pubs and carveries nearby</th>
                    <td className="py-3 px-4">Standard chain menu</td>
                    <td className="py-3 px-4">Usually free</td>
                    <td className="py-3 px-4">Short drive</td>
                    <td className="py-3 px-4">Chain feel</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-ink-muted mt-4 text-center">
              Our food and drink prices are always live on the <Link href="/food-menu" className="underline hover:text-accent-text">food menu</Link>. Other venues shown for comparison only.
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
                    <li>&bull; You would rather not leave and come back</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Leave the airport if&hellip;</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>&bull; You have a few hours to spare</li>
                    <li>&bull; You want a proper home-cooked meal</li>
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
              subtitle="Quick directions by car, taxi or rideshare"
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-bold text-lg text-accent-text mb-3">From Terminal 5</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li><strong>Drive:</strong> 7 minutes, about 3.8 miles via the A3044</li>
                  <li><strong>Route:</strong> Head south on the A3044 towards Stanwell Moor. We are on Horton Road, with free parking on site</li>
                </ul>
              </div>
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-bold text-lg text-accent-text mb-3">From Terminals 2 &amp; 3</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li><strong>Drive:</strong> 11 minutes via the A30</li>
                  <li><strong>Route:</strong> Take the A30 south, then follow signs for Stanwell Moor village</li>
                </ul>
              </div>
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-bold text-lg text-accent-text mb-3">From Terminal 4</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li><strong>Drive:</strong> 12 minutes via the A30</li>
                  <li><strong>Route:</strong> Head west on the A30 towards Staines, then turn off at Stanwell Moor</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-ink-muted">
                Taxis, Uber and Bolt all run from every terminal, and the 441, 442 and 555 buses serve Stanwell Moor from Heathrow Central.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <SectionHeading
            title="Restaurants Near Heathrow Terminals 2, 3, 4 and 5"
            subtitle="Searching for a terminal restaurant? We are a short ride from every terminal, with free parking and a proper sit-down meal."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Restaurants near Heathrow Terminal 5</h3>
                <p className="text-ink-muted">If you are looking for restaurants near Heathrow Terminal 5, we are only 7 minutes away. Book a table or simply walk in, then return to the airport in plenty of time.</p>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Restaurants near Heathrow Terminal 3</h3>
                <p className="text-ink-muted">Looking for food near Heathrow Terminal 3? We are about 11 minutes away, with home-cooked pub classics and a calmer place to sit than the terminal.</p>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Restaurants near Heathrow Terminal 2</h3>
                <p className="text-ink-muted">From Terminal 2, it is around 11 minutes to Stanwell Moor for British classics, Sunday roasts and free parking before you head back to the airport.</p>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Restaurants near Heathrow Terminal 4</h3>
                <p className="text-ink-muted">Terminal 4 is about 12 minutes from us. Swap an airport food court for a proper meal, a full bar and somewhere to keep your luggage while you eat.</p>
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
              title="Why Travellers Choose The Anchor Over Airport Restaurants"
              subtitle="Home-cooked food, free parking and a calmer table, just minutes from every terminal"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">A Proper Meal, Honest Prices</h3>
                  <p className="text-ink-muted mb-3">
                    Airport food courts charge a premium for a rushed meal. We are an independent village pub, so you get home-cooked British food at sensible pub prices, cooked fresh to order rather than kept under a heat lamp.
                  </p>
                  <p className="text-ink-muted">
                    Every food and drink price is live on our <Link href="/food-menu" className="underline hover:text-accent-text">food menu</Link>, so there are no surprises when the bill arrives.
                  </p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Free Parking While You Eat</h3>
                  <p className="text-ink-muted mb-3">
                    Parking at the airport adds up fast. We have 20 free spaces on site for our guests, with no time limit while you are dining and no parking ticket to think about.
                  </p>
                  <div className="bg-surface-sunk rounded-sm p-4 border border-line">
                    <p className="font-semibold text-anchor-success">The Anchor: parking is always free</p>
                    <p className="text-sm text-anchor-success mt-1">Level surface, close to the door, floodlit with CCTV</p>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Distance to Terminals */}
            <Card accent className="max-w-4xl mx-auto">
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3 text-center">A Quick Drive from Every Terminal</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="font-semibold text-lg text-ink-strong">Terminal 5</p>
                    <p className="font-display text-h3 text-accent-text">7 mins</p>
                    <p className="text-sm text-ink-muted">3.8 miles</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-ink-strong">Terminal 2</p>
                    <p className="font-display text-h3 text-accent-text">11 mins</p>
                    <p className="text-sm text-ink-muted">via the A30</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-ink-strong">Terminal 3</p>
                    <p className="font-display text-h3 text-accent-text">11 mins</p>
                    <p className="text-sm text-ink-muted">5.3 miles</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-ink-strong">Terminal 4</p>
                    <p className="font-display text-h3 text-accent-text">12 mins</p>
                    <p className="text-sm text-ink-muted">via the A30</p>
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
              title="Traditional British Pub Menu"
              subtitle="Home-cooked food made fresh to order, never reheated under a heat lamp"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Famous Sunday Roasts</h3>
                  <p className="text-ink-muted">Roast dinners with triple-cooked, herb-and-garlic crusted potatoes, seasonal veg, Yorkshire puddings and our signature gravy. Served Sundays 1pm to 6pm, walk-ins welcome with no pre-order needed.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Fish and Chips</h3>
                  <p className="text-ink-muted">Beer-battered cod with chips, mushy peas and tartare sauce. Check the live menu for current prices and availability.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Stone-Baked Pizzas</h3>
                  <p className="text-ink-muted">Hand-stretched 12-inch bases, rich tomato sauce and generous toppings, made to order. NGCI bases available.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Burgers, Pies and Classics</h3>
                  <p className="text-ink-muted">Proper pub burgers, hearty pies and British classics, all cooked fresh to order.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Vegetarian and Vegan</h3>
                  <p className="text-ink-muted">Vegetarian dishes plus a fully vegan Sunday wellington. Ours is a small kitchen, so we cannot guarantee against cross-contamination.</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Full Bar Service</h3>
                  <p className="text-ink-muted">A good range of draught lagers and beers, premium spirits, wines and cocktails, at proper pub prices.</p>
                </CardBody>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Link href="/food-menu">
                <Button variant="primary" size="lg">
                  View the Full Menu
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
                      <li>• Skip the terminal queues</li>
                      <li>• Luggage storage available</li>
                    </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Post-Flight Recovery</h3>
                <ul className="space-y-2 text-ink-muted">
                      <li>• A warm British welcome home</li>
                      <li>• A proper meal after airline food</li>
                      <li>• Relax before the drive home</li>
                      <li>• Hearty pub meals after a long flight</li>
                      <li>• Free WiFi to catch up</li>
                    </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Meetings and Get-Togethers</h3>
                <ul className="space-y-2 text-ink-muted">
                      <li>• A relaxed space to talk</li>
                      <li>• Free parking for everyone</li>
                      <li>• A private dining room you can book</li>
                      <li>• Free WiFi throughout</li>
                      <li>• A calmer alternative to a hotel restaurant</li>
                    </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Crew and Airport Workers</h3>
                <ul className="space-y-2 text-ink-muted">
                      <li>• A regular stop for flight crews</li>
                      <li>• Popular with Heathrow workers</li>
                      <li>• Friendly, unhurried service</li>
                      <li>• Takeaway by phone for collection</li>
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
            question: "What is the best restaurant near Heathrow Airport?",
            answer: "The Anchor is a traditional British pub and restaurant in Stanwell Moor, 7 minutes from Terminal 5 and 11 to 12 minutes from the other terminals. We cook home-made British food, including Sunday roasts, fish and chips, pizzas and pies, with free parking on site and a beer garden under the flight path. It is a calmer, better-value choice than eating inside the airport."
          },
          {
            question: "How far is The Anchor from Heathrow Airport?",
            answer: "We are 7 minutes from Terminal 5, 11 minutes from Terminals 2 and 3, and 12 minutes from Terminal 4. Taxis, Uber, Bolt and the 441, 442 and 555 buses all run from the airport."
          },
          {
            question: "Can I leave Heathrow during a layover to eat?",
            answer: "Yes, if you have enough time. Arriving international passengers need to clear immigration, leave, eat, return and pass security again, so allow at least 2.5 to 3 hours. If you are already landside or connecting domestically, around 90 minutes is enough to reach us, have a proper meal and get back."
          },
          {
            question: "Is it worth leaving the airport to eat?",
            answer: "Usually, yes. Airport and hotel dining tends to cost more, and hotel car parks often charge non-guests. A local pub meal 7 minutes away, with free parking and room to relax, is better value and a calmer way to spend the time."
          },
          {
            question: "Are you a good alternative to restaurants near Heathrow Terminal 5?",
            answer: "Yes. If you are searching for restaurants near Heathrow Terminal 5, we are only 7 minutes away with free parking, a proper sit-down meal and room to relax. You can book a table or simply walk in."
          },
          {
            question: "Is there food near Heathrow Terminal 3 if I want to leave the airport?",
            answer: "The Anchor is about 11 minutes from Terminal 3. Guests looking for food near Heathrow Terminal 3 often come to us for a calmer, home-cooked meal, then head back by taxi or bus."
          },
          {
            question: "Do you serve Sunday roast, and do I need to book?",
            answer: "Yes. We serve Sunday roast every Sunday from 1pm to 6pm, and walk-ins are welcome with no pre-order required. Booking is recommended for larger groups and busy times, but it is not required. The current roasts and their prices are live on the food menu."
          },
          {
            question: "Is parking really free?",
            answer: "Yes. We have 20 free parking spaces for our guests, with no time limit while you are dining with us. The car park is level, floodlit and covered by CCTV."
          },
          {
            question: "What type of food do you serve?",
            answer: "We serve traditional British pub food: Sunday roasts, fish and chips, burgers, pies and stone-baked pizzas, all cooked fresh to order. There are vegetarian dishes and a fully vegan Sunday wellington too. All prices are live on the food menu."
          },
          {
            question: "Do you take reservations?",
            answer: "Yes, we take both reservations and walk-ins. You can book online or call 01753 682707. Groups of 15 or more can book any day with a £10 per person deposit, which comes straight off your final bill."
          },
          {
            question: "Can I get a takeaway if I am in a hurry?",
            answer: "Yes. Our menu is available as a takeaway to collect, ordered by phone on 01753 682707. We do not deliver, so it is collection only."
          }
        ]}
        className="bg-canvas"
      />

      <OrganicSearchClusterLinks
        cluster="heathrowDining"
        currentPath="/restaurants-near-heathrow"
        title="More ways to eat near Heathrow"
        intro="Browse the live menu, plan a layover meal, or read up on our Sunday roast before you head over."
      />

      {/* CTA Section */}
      <CtaBand
        title="Skip the Airport Restaurants"
        copy="Home-cooked food, free parking and a proper sit-down meal, just minutes from every terminal"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <BookTableButton source="restaurants_near_heathrow_cta" variant="primary" size="lg">Book a Table</BookTableButton>
            <PhoneButton phone={CONTACT.phone} source="restaurants_near_heathrow_cta" variant="outline" size="lg">Call: 01753 682707</PhoneButton>
          </div>
          <p className="text-anchor-cream-text/80 text-sm">Walk in or book ahead • Sunday roast served 1pm to 6pm • Free parking always</p>
        </div>
      </CtaBand>
    </>
  )
}
