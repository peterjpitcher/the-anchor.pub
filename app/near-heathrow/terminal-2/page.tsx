import Link from 'next/link'
import { Button, SectionHeading, CTASection, Container } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { InteriorHero } from '@/components/hero'
import { Metadata } from 'next'
import { FlightStatus, FlightDelayWidget } from '@/components/FlightStatus'
import { FeatureGrid } from '@/components/FeatureCard'
import { InfoBoxGrid } from '@/components/InfoBox'
import { AlertBox } from '@/components/AlertBox'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { HeroBadge } from '@/components/HeroBadge'
import { PARKING } from '@/lib/constants'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Terminal 2 | Food & Free Parking',
  description: "Pub near Heathrow Terminal 2, 11 minutes by taxi. British pub food, free customer parking, Sunday roasts, pizza and table booking.",
  openGraph: {
    title: "Pubs Near Heathrow Terminal 2 | 11 Mins Away | Free Parking",
    description: "11 minutes from T2 (Queen's Terminal). Free parking for 20 cars. Home-cooked British food & dog-friendly beer garden.",
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: "Pubs Near Heathrow Terminal 2 | 11 Mins Away | Free Parking",
    description: "11 minutes from T2 (Queen's Terminal). Free parking for 20 cars. Home-cooked British food & dog-friendly beer garden.",
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow/terminal-2'
  }
}

export default function Terminal2Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Near Heathrow', url: '/near-heathrow' },
          { name: 'Terminal 2', url: '/near-heathrow/terminal-2' }
        ]}
      />
      <FoodStickyCtaBar
        ctaContext="heathrow_layover"
        label="Book a Table for Food"
      />
      
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/near-heathrow-terminal-2/heathrow-airport-view.jpg"
        crumb="Near Heathrow"
        title="Pub Near Heathrow Terminal 2 for Food and Free Parking"
        lead="Perfect for Star Alliance travelers • Free parking • Traditional British hospitality"
        actions={
          <BookTableButton source="terminal_2_hero" context="terminal_2" variant="primary" size="lg" fullWidth>
            Book a Table
          </BookTableButton>
        }
      />

      {/* Google Rating Strip */}
      <section className="section-spacing-tight bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Page Title */}
      <section className="section-spacing bg-anchor-green-card">
        <Container>
          <PageTitle className="text-center text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
            Pubs Near Heathrow Terminal 2 - The Anchor
          </PageTitle>
        </Container>
      </section>

      <section className="section-spacing-sm bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <div className="container mx-auto px-4">
          <CTASection
            title="Got a Layover at Terminal 2?"
            description="Use our Heathrow layover dining guide to time taxis, meals, and returns to security without stress."
            buttons={[
              {
                text: "Explore Layover Guide",
                href: "/heathrow-layover-dining",
                variant: "white",
                size: "lg"
              },
              {
                text: "WhatsApp for Planning",
                href: "https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20We%27re%20connecting%20through%20Heathrow%20T2%20-%20can%20you%20book%20a%20layover%20meal%3F",
                variant: "outline",
                size: "lg"
              }
            ]}
          />
        </div>
      </section>

      {/* Food & Drink Highlights */}
      <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Eat & Drink Before or After Terminal 2"
              subtitle="Pre-book so your table, roast or pizza order is ready when you arrive."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-bright mb-2">Sunday Roast</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Walk in 1pm-6pm or book ahead - Yorkshire puddings, crispy potatoes and gravy before Star Alliance departures.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal2_roast_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book Roast Table
                  </BookTableButton>
                  <Link href="/sunday-roast" className="text-sm text-anchor-gold-dark font-semibold hover:text-anchor-green transition">
                    Sunday roast 11 minutes from Terminal 2 →
                  </Link>
                </div>
              </div>
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-bright mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Hand-stretched pizzas with bold toppings, ideal for crew meetups or family send-offs.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal2_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-anchor-gold-dark font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </div>
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-bright mb-2">All-Day Menu & Drinks</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Burgers, fish & chips, cocktails and draught beers served fast. Free parking and WiFi while you track arrivals.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal2_food_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-anchor-gold-dark font-semibold hover:text-anchor-green transition">
                    Browse menus →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Info Cards */}
      <section className="section-spacing bg-anchor-green-deep">
        <Container>
          <FeatureGrid
            columns={4}
            features={[
              {
                icon: "",
                title: "15 mins",
                description: "by car"
              },
              {
                icon: "",
                title: "Free",
                description: "parking"
              },
              {
                icon: "",
                title: "Real",
                description: "British pub"
              },
              {
                icon: "",
                title: "Star Alliance",
                description: "Terminal 2"
              }
            ]}
            className="max-w-4xl mx-auto"
          />
        </Container>
      </section>

      {/* Detailed Directions */}
      <section id="directions" className="section-spacing bg-anchor-green-card border-t border-anchor-gold-dark/15">
        <Container size="md">
            <SectionHeading
              title="How to Get Here from Terminal 2"
              align="center"
            />

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* By Car */}
              <div className="bg-anchor-green-raised rounded-2xl p-8 border border-anchor-gold-dark/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">By Car (11 minutes)</h3>
                <ol className="space-y-3 text-anchor-cream-text/70">
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold-dark">1.</span>
                    Exit Terminal 2 following signs for A4/M4
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold-dark">2.</span>
                    Join the A4 Bath Road heading East
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold-dark">3.</span>
                    After 2 miles, turn left onto A3044 (Stanwell Moor Road)
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold-dark">4.</span>
                    Continue for 1 mile through Stanwell Moor village
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold-dark">5.</span>
                    Turn left onto Horton Road - The Anchor is on your right
                  </li>
                </ol>
                <div className="mt-6 p-4 bg-anchor-green-card rounded-lg border border-anchor-gold-dark/15">
                  <p className="font-semibold text-anchor-gold-bright">Sat Nav:</p>
                  <p className="text-lg text-anchor-cream-text">TW19 6AQ</p>
                </div>
              </div>

              {/* By Taxi */}
              <div className="bg-anchor-green-raised rounded-2xl p-8 border border-anchor-gold-dark/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">By Taxi</h3>
                <div className="space-y-4 text-anchor-cream-text/70">
	                  <div>
	                    <p className="font-semibold mb-2">Cost: £20-25</p>
	                    <p className="text-sm mb-2">Journey time: 11 minutes</p>
	                    <p className="text-sm mb-2">Distance: 4.5 miles</p>
	                    <p>Tell your driver: &quot;The Anchor, Horton Road, Stanwell Moor&quot;</p>
	                  </div>
                  <div>
                    <p className="font-semibold mb-2">Taxi Ranks:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Terminal 2 Arrivals (Ground floor)</li>
                      <li>Terminal 2 Departures (Level 5)</li>
                      <li>Central Bus Station (between T2 & T3)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-anchor-green-card rounded-lg border border-anchor-gold-dark/15">
                    <p className="font-semibold text-anchor-gold-bright mb-2">Pre-book Return:</p>
                    <p className="text-sm text-anchor-cream-text/70">We can arrange your return taxi - just ask at the bar!</p>
                  </div>
                </div>
              </div>

              {/* By Bus */}
              <div className="bg-anchor-green-raised rounded-2xl p-8 border border-anchor-gold-dark/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">By Bus</h3>
                <div className="space-y-4 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold mb-2">Route 442</p>
                    <p className="text-sm mb-2">Journey time: 20-25 minutes</p>
                    <p className="text-sm mb-2">Runs every 30 minutes</p>
                    <p>Cost: About what a pint should cost</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">From Terminal 2:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Bus stop at Central Bus Station</li>
                      <li>Between Terminals 2 & 3</li>
                      <li>Follow signs from arrivals</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-anchor-green-card rounded-lg border border-anchor-gold-dark/15">
                    <p className="font-semibold text-anchor-gold-bright mb-2">Your Stop:</p>
                    <p className="text-sm text-anchor-cream-text/70">Get off at Horton Road - The Anchor is right there!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-anchor-green-raised rounded-2xl p-8 text-center border border-anchor-gold-dark/15">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Interactive Map</h3>
              <p className="text-anchor-cream-text/70 mb-6">
                Click below for turn-by-turn directions from Terminal 2
              </p>
              <DirectionsButton
                href="https://maps.google.com/maps?saddr=Heathrow+Terminal+2&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="terminal_2_directions"
                variant="primary"
                size="lg"
                fromLocation="Heathrow Terminal 2"
              >
                Open in Google Maps
              </DirectionsButton>
            </div>
        </Container>
      </section>

      {/* Why Visit */}
      <section className="section-spacing bg-anchor-green-deep border-t border-anchor-gold-dark/15">
        <Container size="md">
            <SectionHeading
              title="Why Terminal 2 Travellers Choose The Anchor"
              align="center"
            />
            
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Star Alliance Hub",
                  icon: "",
                  content: "Terminal 2 hosts Star Alliance carriers including Lufthansa, United, Air Canada, and Singapore Airlines. Enjoy authentic British hospitality before your international journey."
                },
                {
                  title: "The Queen's Terminal",
                  icon: "",
                  content: "Opened by Her Majesty in 2014, T2 is Heathrow's newest terminal. Experience a piece of traditional Britain at The Anchor before entering this modern gateway."
                },
	                {
	                  title: "Smart Parking Choice",
	                  icon: "",
                  content: "Heathrow short-stay parking costs add up fast. Park free with us while dropping off or collecting passengers, no fees, no time limits."
	                },
                {
                  title: "International Meets Local",
                  icon: "",
                  content: "Flying to Munich, Toronto, or Singapore? Start with fish & chips or a Sunday roast. Our international guests love experiencing authentic British pub culture."
                },
	                {
	                  title: "Outside ULEZ Zone",
	                  icon: "",
	                  content: "Save £12.50 daily! We're outside London's ULEZ zone, perfect for travelers avoiding the charge. Direct access from M25 without entering the zone."
	                },
                {
                  title: "Direct Bus Route",
                  icon: "",
                  content: "The 442 bus stops directly outside, connecting Terminal 2 to our pub. Much cheaper than a taxi and runs regularly throughout the day."
                }
              ]}
            />
        </Container>
      </section>

      {/* Live Flight Information */}
      <section className="section-spacing bg-anchor-green-deep border-t border-anchor-gold-dark/15">
        <Container size="md">
            <SectionHeading
              title="Live Terminal 2 Flight Information"
              subtitle="Check flight times while you enjoy your meal or drink"
              align="center"
            />
            <FlightStatus terminal="2" type="both" limit={5} />
        </Container>
      </section>

      {/* Terminal 2 Specific Info */}
      <section className="section-spacing bg-anchor-green-card border-t border-anchor-gold-dark/15">
        <Container size="md">
            <SectionHeading
              title="Terminal 2 Travel Tips"
              align="center"
            />

            <div className="mb-8">
              <FlightDelayWidget terminal="2" />
            </div>

            <div className="bg-anchor-green-raised rounded-2xl p-8 mb-8 border border-anchor-gold-dark/15">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Airlines & Destinations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-anchor-cream-text mb-2">Major Airlines:</p>
                  <ul className="space-y-1 text-anchor-cream-text/70 text-sm">
                    <li>• Lufthansa - Frankfurt, Munich</li>
                    <li>• United Airlines - US destinations</li>
                    <li>• Air Canada - Toronto, Vancouver</li>
                    <li>• Singapore Airlines - Singapore</li>
                    <li>• Swiss - Zurich, Geneva</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-anchor-cream-text mb-2">Check-in Advice:</p>
                  <ul className="space-y-1 text-anchor-cream-text/70 text-sm">
                    <li>• European flights: 2 hours before</li>
                    <li>• International: 3 hours before</li>
                    <li>• US flights: 3.5 hours (extra security)</li>
                    <li>• Allow 11 minutes drive from The Anchor</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertBox
              variant="tip"
              title="Insider Knowledge"
              content={
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span></span>
                    <span>T2 is connected to T3 via pedestrian walkway - great for airline connections</span>
                  </li>
                  <li className="flex gap-3">
                    <span></span>
                    <span>The Anchor hosts many Lufthansa and United crews - we know the flight patterns!</span>
                  </li>
                  <li className="flex gap-3">
                    <span></span>
                    <span>T2 security is busiest 6-9am for European departures</span>
                  </li>
                  <li className="flex gap-3">
                    <span></span>
                    <span>Our German beers are popular with Lufthansa passengers!</span>
                  </li>
                </ul>
              }
            />
        </Container>
      </section>

      {/* Perfect for Terminal 2 Travellers */}
      <section className="section-spacing bg-anchor-green-card border-t border-anchor-gold-dark/15">
        <Container size="md">
            <SectionHeading
              title="Your Perfect Stop Near Terminal 2"
              align="center"
            />

            <div className="prose prose-lg max-w-none text-anchor-cream-text/70 mb-12">
              <p className="text-xl text-center mb-8 text-anchor-cream-text/70">
                Looking for pubs near Heathrow Terminal 2? Whether you're flying with Lufthansa, United Airlines, Air Canada, or any of the 23 airlines
                operating from T2, The Anchor provides the perfect escape from the airport bustle.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-anchor-gold-bright mb-4">Before Your Flight</h3>
                  <p className="mb-4 text-anchor-cream-text/70">
                    Instead of paying premium prices for average food at the terminal, enjoy a proper meal 
                    at The Anchor. Our traditional British menu offers everything from classic pub favourites 
                    to fish and chips, all at local pub prices during kitchen hours. With Terminal 2's 
                    recommendation to arrive 3 hours early for international flights, you'll have plenty 
                    of time to relax in our beer garden or cozy interior before heading to the gate.
                  </p>
                  <p className="text-anchor-cream-text/70">
                    Many of our regulars are business travelers who've discovered that a calm meal at
                    The Anchor beats the stress of airport dining. Park free with us, enjoy your meal,
                    then take a quick 10-minute drive to T2's drop-off zone.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-anchor-gold-bright mb-4">Meeting Arrivals</h3>
	                  <p className="mb-4 text-anchor-cream-text/70">
	                    Terminal 2's short-stay car park charges £6.90 for just 30 minutes - that's more 
	                    than a pint costs at The Anchor! When collecting passengers, wait comfortably with 
	                    us instead. Use our free WiFi to track their flight, enjoy a drink or meal, and 
	                    only head to the terminal when they've cleared customs.
	                  </p>
                  <p className="text-anchor-cream-text/70">
                    We're particularly popular with families meeting international arrivals. Kids can
                    play in our garden while adults relax, making those flight delays much more bearable
                    than sitting in expensive terminal cafes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-anchor-green-raised rounded-2xl p-8 border border-anchor-gold-dark/15">
              <h3 className="text-2xl font-bold text-anchor-gold-bright mb-4 text-center">Local Knowledge</h3>
              <p className="text-anchor-cream-text/70 mb-4">
                As Stanwell Moor's village pub, we've been serving Terminal 2 travelers since the 
                Queen opened it in 2014. Our staff know the flight patterns, the best times to 
                travel to avoid traffic, and can even recommend the quickest security lanes based 
                on the time of day. We're not just a pub - we're part of your journey.
              </p>
              <p className="text-anchor-cream-text/70">
                Regular Terminal 2 flight crews choose The Anchor as their local when staying at
                nearby hotels. If it's good enough for the professionals who fly every day, you
                know you're in good hands.
              </p>
            </div>
        </Container>
      </section>

      {/* Hotel Guest Section */}
      <section className="section-spacing bg-anchor-green-deep border-t border-anchor-gold-dark/15">
        <Container size="md">
            <SectionHeading
              title="Staying Near Terminal 2?"
              subtitle="Escape your hotel for a genuine British pub experience"
              align="center"
            />

            <div className="mb-12">
              <p className="text-center text-lg text-anchor-cream-text/70 max-w-3xl mx-auto">
                If you're staying at one of the Terminal 2 hotels, The Anchor offers 
                the perfect escape from hotel dining. Experience a real British family 
                pub where locals gather - a refreshing change from the international 
                atmosphere of airport hotels.
              </p>
            </div>

            <div className="card-dark rounded-none p-8 mb-8">
              <h3 className="text-2xl font-bold text-anchor-gold-bright mb-6 text-center">
                Why Hotel Guests Choose The Anchor
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-anchor-cream-text">A Real Local Experience</h4>
                  <ul className="space-y-2 text-anchor-cream-text/70">
                    <li className="flex gap-2">
                      <span className="text-anchor-gold-dark"></span>
                      <span>Traditional British pub atmosphere</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold-dark"></span>
                      <span>Meet local residents, not just travelers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold-dark"></span>
                      <span>Authentic ales and home-cooked meals</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold-dark"></span>
                      <span>Peaceful setting away from airport hustle</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-anchor-cream-text">Better Value Than Hotels</h4>
                  <ul className="space-y-2 text-anchor-cream-text/70">
                    <li className="flex gap-2">
                      <span className="text-anchor-gold-dark"></span>
                      <span>Pub prices, not hotel prices</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold-dark"></span>
                      <span>Hearty portions of British classics</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold-dark"></span>
                      <span>Free parking saves on hotel charges</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold-dark"></span>
                      <span>Relaxed atmosphere with no time limits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-dark rounded-none p-8 mb-8">
              <h3 className="text-2xl font-bold text-anchor-gold-bright mb-4 text-center">
                Getting Here from Terminal 2 Hotels
              </h3>
	              <div className="grid md:grid-cols-3 gap-6 text-center">
	                <div>
	                  <p className="font-semibold mb-2 text-anchor-cream-text">By Taxi</p>
	                  <p className="text-3xl font-bold text-anchor-gold-dark mb-2">£18-22</p>
	                  <p className="text-sm text-anchor-cream-text/55">11 minutes</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2 text-anchor-cream-text">By Uber</p>
	                  <p className="text-3xl font-bold text-anchor-gold-dark mb-2">£15-18</p>
	                  <p className="text-sm text-anchor-cream-text/55">11 minutes</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2 text-anchor-cream-text">By Bus</p>
	                  <p className="text-3xl font-bold text-anchor-gold-dark mb-2">£2.50</p>
	                  <p className="text-sm text-anchor-cream-text/55">Take 442 bus</p>
	                </div>
	              </div>
              <p className="text-center text-sm text-anchor-cream-text/55 mt-4">
                Tell your driver: "The Anchor, Horton Road, Stanwell Moor"
              </p>
            </div>

            <div className="bg-anchor-green-raised border border-anchor-gold-dark/30 rounded-2xl p-8 text-center">
              <p className="text-lg mb-4 max-w-2xl mx-auto text-anchor-cream-text/70">
                Take a break from the hustle and bustle of airport life.
                The Anchor offers a peaceful village pub atmosphere where you can
                relax, enjoy great food, and experience genuine British hospitality.
              </p>
              <BookTableButton
                source="terminal_2_hotel_cta"
                context="heathrow_terminal_2_hotels"
                variant="outline"
                size="lg"
                className="bg-anchor-gold-dark text-anchor-green hover:bg-anchor-gold"
              >
                Book Your Table Online
              </BookTableButton>
            </div>
        </Container>
      </section>

      <OrganicSearchClusterLinks
        cluster="pubsNearHeathrow"
        currentPath="/near-heathrow/terminal-2"
        title="More Heathrow pub options"
        intro="Compare the main Heathrow pub guide, terminal routes and directions before you book."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "How far is The Anchor from Heathrow Terminal 2?",
            answer: "The Anchor is just 11 minutes drive from Heathrow Terminal 2. We're the perfect spot for a pre-flight meal or drinks after landing."
          },
          {
            question: "Do you have parking for Terminal 2 travelers?",
            answer: `Yes! We offer free parking for all customers with space for ${PARKING.capacity} cars. No fees, no time limits, free while you're visiting us.`
          },
          {
            question: "What time should I leave for Terminal 2?",
            answer: "Allow 11 minutes to reach Terminal 2 from our pub, plus time for parking and security. We recommend leaving at least 2 hours before your flight for European destinations, 3 hours for international."
          },
          {
            question: "Is The Anchor good for Terminal 2 hotel guests?",
            answer: "Absolutely! Many guests from Terminal 2 hotels visit us for a break from hotel dining. We offer a genuine British family pub atmosphere with local residents, traditional ales, and home-cooked food at pub prices."
          },
	          {
	            question: "How do I get to The Anchor from my Terminal 2 hotel?",
	            answer: "It's about £20-25 by taxi (11 minutes) or £15-20 by Uber. The 442 bus also stops near us for just £2.50. Tell your driver 'The Anchor, Horton Road, Stanwell Moor' or use postcode TW19 6AQ."
	          },
          {
            question: "Why choose The Anchor over Terminal 2 restaurants?",
            answer: "At The Anchor, you'll enjoy authentic British pub atmosphere, meet local residents (not just travelers), eat proper home-cooked food, and relax in our peaceful village setting away from the airport hustle."
          },
	          {
	            question: "Can I get a taxi from Terminal 2 to The Anchor?",
	            answer: "Yes, taxis are readily available from Terminal 2. The journey costs £20-25 and takes about 11 minutes. Taxi ranks are located at Terminal 2 Arrivals (Ground floor), Terminal 2 Departures (Level 5), and the Central Bus Station between T2 & T3. Tell your driver 'The Anchor, Horton Road, Stanwell Moor'."
	          },
          {
            question: "Is there a bus from Terminal 2 to The Anchor?",
            answer: "Yes! The 442 bus runs from Terminal 2 to Stanwell Moor, stopping right outside The Anchor. It runs every 30 minutes and costs about what a pint should cost. The bus stop is at the Central Bus Station between Terminals 2 & 3 - just follow signs from arrivals."
          }
        ]}
        className="bg-anchor-green-deep"
      />

      {/* CTA Section */}
      <CTASection
        title="See You Soon at The Anchor!"
        description="Just 11 minutes from Terminal 2 • Free Parking • Sunday roast & stone-baked pizzas"
        variant="green"
        buttons={[
          {
            text: "Book a Table",
            href: "/book-table",
            variant: "white",
            size: "lg"
          },
          {
            text: "01753 682707",
            href: "tel:+441753682707",
            isPhone: true,
            phoneSource: "terminal_2_cta_section",
            variant: "white",
            size: "lg"
          },
          {
            text: "Pizza Menu",
            href: "/food-menu#pizza",
            variant: "white",
            size: "lg"
          },
          {
            text: "Sunday Roast Info",
            href: "/sunday-roast",
            variant: "white",
            size: "lg"
          },
          {
            text: "← Back to All Terminals",
            href: "/near-heathrow",
            variant: "white",
            size: "lg"
          }
        ]}
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto mt-8">
          <p className="font-semibold mb-2">The Anchor</p>
          <p>Horton Road, Stanwell Moor</p>
          <p>Surrey TW19 6AQ</p>
        </div>
      </CTASection>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "The Anchor - Pub Near Heathrow Terminal 2",
            "description": "Traditional British pub just 11 minutes from Heathrow Terminal 2 with free parking.",
            "image": "https://www.the-anchor.pub/images/page-headers/near-heathrow/heathrow-airport-view.jpg",
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
              "latitude": 51.4745,
              "longitude": -0.4713
            },
            "url": "https://www.the-anchor.pub/near-heathrow/terminal-2",
            "telephone": "+441753682707",
	            "priceRange": "££",
            "servesCuisine": ["British", "Pub Food"],
            "nearbyLocation": {
              "@type": "Airport",
              "name": "Heathrow Terminal 2",
              "iataCode": "LHR"
            }
          })
        }}
      />
    </>
  )
}
