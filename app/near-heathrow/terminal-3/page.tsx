import Link from 'next/link'
import { Button } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { Metadata } from 'next'
import { FlightStatus, FlightDelayWidget } from '@/components/FlightStatus'
import { SectionHeader } from '@/components/SectionHeader'
import { FeatureGrid } from '@/components/FeatureCard'
import { InfoBoxGrid } from '@/components/InfoBox'
import { AlertBox } from '@/components/AlertBox'
import { CTASection, Container } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PARKING } from '@/lib/constants'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Terminal 3 | 11 Mins from T3 | Free Parking | The Anchor',
  description: 'Nearest independent pub to Heathrow Terminal 3. 11 minutes by taxi, free parking if driving. Family-friendly, Sunday roasts & stone-baked pizza. Popular with Virgin & Emirates travellers.',
  openGraph: {
    title: 'Pub Near Heathrow Terminal 3 | 11 Mins Away | Free Parking',
    description: '11 minutes from T3 by taxi. Free parking. Family-friendly dining, Sunday roasts & stone-baked pizza. Popular with Virgin & Emirates travellers.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Heathrow Terminal 3 | 11 Mins Away | Free Parking',
    description: '11 minutes from T3 by taxi. Free parking. Family-friendly dining, Sunday roasts & stone-baked pizza. Popular with Virgin & Emirates travellers.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow/terminal-3'
  }
}

export default function Terminal3Page() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Terminal 3', url: '/near-heathrow/terminal-3' }
  ])

  return (
    <>
      
      {/* Hero Section */}
      <HeroWrapper
        route="/near-heathrow/terminal-3"
        title="Your Family Pub Near Heathrow Terminal 3"
        description="Perfect for Virgin Atlantic & Emirates travelers • Free parking • British hospitality"
        variant="default"
        tags={[
          { label: "Just 11 minutes away", variant: "warning" }
        ]}
        primaryCta={
          <BookTableButton
            source="terminal_3_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="heathrow_terminal_3"
          >
            Book a Table Online
          </BookTableButton>
        }
        secondaryCta={
          <Link href="#directions">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-anchor-green hover:bg-gray-100 w-full sm:w-auto"
            >
              Get Directions
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
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-anchor-bg-raised border border-anchor-gold/15 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">Key Info For Terminal 3 Travellers</h2>
            <p className="text-anchor-cream-text/70 mb-4">
              Swap Terminal 3 hotel dining for a proper village pub. Friendly staff, fair prices and space for luggage make The Anchor ideal for Virgin Atlantic and Emirates passengers.
            </p>
            <div className="grid gap-3 md:grid-cols-2 text-anchor-cream-text/70">
	              <div className="flex items-start gap-2">
	                <span className="font-semibold text-anchor-gold"></span>
	                <span>11 minute taxi or Uber (£20-25) via Tunnel Road</span>
	              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Free parking for meet-ups, luggage swaps and family meals</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Family-friendly seating with children\'s menu and high chairs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Phone 01753 682707 to reserve ahead of peak travel times</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <CTASection
            title="Turn Your Terminal 3 Layover into a Meal"
            description="Follow our Heathrow layover dining plan for 90-minute and 3-hour stopovers with taxis booked both ways."
            buttons={[
              {
                text: "View Layover Dining Guide",
                href: "/heathrow-layover-dining",
                variant: "white",
                size: "lg"
              },
              {
                text: "Chat to Plan Quickly",
                href: "https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20Flying%20via%20Heathrow%20T3%20-%20need%20a%20layover%20dining%20plan.",
                variant: "outline",
                size: "lg"
              }
            ]}
          />
        </div>
      </section>

      {/* Google Rating Strip */}
      <section className="bg-anchor-bg-raised py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <section className="section-spacing bg-anchor-bg-card">
        <Container>
          <PageTitle className="text-center text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
            Pub Near Heathrow Terminal 3 - The Anchor
          </PageTitle>
        </Container>
      </section>

      {/* Food & Drink Highlights */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Eat & Drink Before Your Terminal 3 Flight"
              subtitle="Pre-book to enjoy Sunday roast, stone-baked pizzas or a quick meal before departures."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Sunday Roast</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Book by 1pm Saturday and enjoy Yorkshire puddings, crispy potatoes and homemade gravy with the family.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal3_roast_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book Roast Table
                  </BookTableButton>
                  <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Sunday roast menu →
                  </Link>
                </div>
              </div>
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Hand-stretched pizzas with bold toppings — ideal for family send-offs and crew nights.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal3_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </div>
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">All-Day Menu & Drinks</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Burgers, fish & chips, cocktails and draught beers served fast with free parking and space for luggage.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal3_food_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Browse menus →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Info Cards */}
      <section className="section-spacing bg-anchor-bg">
        <div className="container mx-auto px-4">
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
                title: "Family",
                description: "friendly"
              },
              {
                icon: "",
                title: "Virgin & Emirates",
                description: "Terminal 3"
              }
            ]}
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      {/* Detailed Directions */}
      <section id="directions" className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="How to Get Here from Terminal 3"
              align="center"
            />
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* By Car */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">By Car (11 minutes)</h3>
                <ol className="space-y-3 text-anchor-cream-text/70">
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">1.</span>
                    Exit Terminal 3 following signs for A4/M4
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">2.</span>
                    Take the tunnel under the runways
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">3.</span>
                    Join A4 Bath Road heading East
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">4.</span>
                    After 2 miles, turn left onto A3044 (Stanwell Moor Road)
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">5.</span>
                    Continue for 1 mile, turn left at Horton Road
                  </li>
                </ol>
                <div className="mt-6 p-4 bg-anchor-bg-card rounded-lg border border-anchor-gold/15">
                  <p className="font-semibold text-anchor-gold-vivid">Sat Nav:</p>
                  <p className="text-lg">TW19 6AQ</p>
                </div>
              </div>

              {/* By Taxi */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15">
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
                      <li>Terminal 3 Arrivals (Ground floor)</li>
                      <li>Terminal 3 Departures drop-off</li>
                      <li>Central Bus Station (shared with T2)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-anchor-bg-card rounded-lg border border-anchor-gold/15">
                    <p className="font-semibold text-anchor-gold-vivid mb-2">Family Tip:</p>
                    <p className="text-sm">Traveling with kids? We have high chairs and a children&apos;s menu!</p>
                  </div>
                </div>
              </div>

              {/* By Bus */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">By Bus</h3>
                <div className="space-y-4 text-anchor-cream-text/70">
                  <div>
                    <p className="font-semibold mb-2">Route 442</p>
                    <p className="text-sm mb-2">Journey time: 20-25 minutes</p>
                    <p className="text-sm mb-2">Runs every 30 minutes</p>
                    <p>Cost: About what a pint should cost</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">From Terminal 3:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Bus stop at Central Bus Station</li>
                      <li>Between Terminals 2 & 3</li>
                      <li>Follow signs from arrivals</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-anchor-bg-card rounded-lg border border-anchor-gold/15">
                    <p className="font-semibold text-anchor-gold-vivid mb-2">Your Stop:</p>
                    <p className="text-sm">Get off at Horton Road - The Anchor is right there!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-anchor-bg-raised rounded-2xl p-8 text-center border border-anchor-gold/15">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Interactive Map</h3>
              <p className="text-anchor-cream-text/70 mb-6">
                Click below for turn-by-turn directions from Terminal 3
              </p>
              <DirectionsButton
                href="https://maps.google.com/maps?saddr=Heathrow+Terminal+3&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="terminal_3_directions"
                variant="primary"
                size="lg"
                fromLocation="Heathrow Terminal 3"
              >
                Open in Google Maps
              </DirectionsButton>
            </div>
          </div>
        </div>
      </section>

      {/* Why Visit */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Why Terminal 3 Travellers Choose The Anchor"
              align="center"
            />
            
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Global Airlines Hub",
                  icon: "",
                  content: "Terminal 3 hosts Virgin Atlantic, Emirates, Delta, and many Asian carriers. Whether flying to New York, Dubai, or Tokyo, start with a taste of Britain."
                },
                {
                  title: "Family-Friendly Space",
                  icon: "",
                  content: "Traveling with children? We offer a dedicated kids menu, high chairs, and a relaxed atmosphere. Much better than busy airport restaurants!"
                },
	                {
	                  title: "Value for Money",
	                  icon: "",
	                  content: "A family meal at T3 can cost over £60. Enjoy the same at The Anchor for half the price, with generous portions and free parking too!"
	                },
                {
                  title: "Perfect for Arrivals",
                  icon: "",
                  content: "Meeting someone from a long-haul flight? Wait comfortably with us instead of the crowded arrivals hall. Track flights on our free WiFi."
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Live Flight Information */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Live Terminal 3 Flight Information"
              subtitle="Check flight times while you enjoy your meal or drink"
              align="center"
            />
            <FlightStatus terminal="3" type="both" limit={5} />
          </div>
        </div>
      </section>

      {/* Terminal 3 Specific Info */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Terminal 3 Travel Tips"
              align="center"
            />
            
            <div className="mb-8">
              <FlightDelayWidget terminal="3" />
            </div>
            
            <div className="bg-anchor-bg-raised rounded-2xl p-8 mb-8 border border-anchor-gold/15">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Airlines & Routes</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">Major Airlines:</p>
                  <ul className="space-y-1 text-anchor-cream-text/70 text-sm">
                    <li>• Virgin Atlantic - USA, Caribbean</li>
                    <li>• Emirates - Dubai connections</li>
                    <li>• Delta - USA destinations</li>
                    <li>• Cathay Pacific - Hong Kong</li>
                    <li>• Qantas - Australia via Dubai/Singapore</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Peak Times:</p>
                  <ul className="space-y-1 text-anchor-cream-text/70 text-sm">
                    <li>• Morning: 10-11am Emirates departures</li>
                    <li>• Afternoon: 12-3pm Virgin Atlantic to USA</li>
                    <li>• Evening: 8-10pm Asian carriers</li>
                    <li>• Quietest: Early morning (6-8am)</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertBox
              variant="tip"
              title="Local Insights"
              content={
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span></span>
                    <span>Virgin Atlantic Premium check-in is worth it for families - much shorter queues</span>
                  </li>
                  <li className="flex gap-3">
                    <span></span>
                    <span>Emirates A380 flights board 45 mins early - don&apos;t cut it close!</span>
                  </li>
                  <li className="flex gap-3">
                    <span></span>
                    <span>T3 has the best shopping at Heathrow - arrive early if you want to browse</span>
                  </li>
                  <li className="flex gap-3">
                    <span></span>
                    <span>We&apos;re popular with Virgin cabin crew - great stories over Sunday lunch!</span>
                  </li>
                </ul>
              }
            />
          </div>
        </div>
      </section>

      {/* Hotel Guest Section */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Staying Near Terminal 3?"
              subtitle="Escape your hotel for a genuine British pub experience"
              align="center"
            />
            
            <div className="mb-12">
              <p className="text-center text-lg text-anchor-cream-text/70 max-w-3xl mx-auto">
                If you're staying at one of the Terminal 3 hotels, The Anchor offers 
                the perfect escape from hotel dining. Experience a real British family 
                pub where locals gather - a refreshing change from the international 
                atmosphere of airport hotels.
              </p>
            </div>

            <div className="bg-anchor-bg-raised rounded-2xl p-8 mb-8 border border-anchor-gold/15">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-6 text-center">
                Why Hotel Guests Choose The Anchor
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-anchor-cream-text">A Real Local Experience</h4>
                  <ul className="space-y-2 text-anchor-cream-text/70">
                    <li className="flex gap-2">
                      <span className="text-anchor-gold"></span>
                      <span>Traditional British pub atmosphere</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold"></span>
                      <span>Meet local residents, not just travelers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold"></span>
                      <span>Authentic ales and home-cooked meals</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold"></span>
                      <span>Peaceful setting away from airport hustle</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-anchor-cream-text">Better Value Than Hotels</h4>
                  <ul className="space-y-2 text-anchor-cream-text/70">
                    <li className="flex gap-2">
                      <span className="text-anchor-gold"></span>
                      <span>Pub prices, not hotel prices</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold"></span>
                      <span>Hearty portions of British classics</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold"></span>
                      <span>Free parking saves on hotel charges</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold"></span>
                      <span>Relaxed atmosphere with no time limits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-dark rounded-none p-8 mb-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4 text-center">
                Getting Here from Terminal 3 Hotels
              </h3>
	              <div className="grid md:grid-cols-3 gap-6 text-center">
	                <div>
	                  <p className="font-semibold mb-2 text-anchor-cream-text">By Taxi</p>
	                  <p className="text-3xl font-bold text-anchor-gold mb-2">£20-25</p>
	                  <p className="text-sm text-anchor-cream-text/55">11 minutes</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2 text-anchor-cream-text">By Uber</p>
	                  <p className="text-3xl font-bold text-anchor-gold mb-2">£16-20</p>
	                  <p className="text-sm text-anchor-cream-text/55">11 minutes</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2 text-anchor-cream-text">By Bus</p>
	                  <p className="text-3xl font-bold text-anchor-gold mb-2">£2.50</p>
	                  <p className="text-sm text-anchor-cream-text/55">Take 442 bus</p>
	                </div>
	              </div>
              <p className="text-center text-sm text-anchor-cream-text/55 mt-4">
                Tell your driver: "The Anchor, Horton Road, Stanwell Moor"
              </p>
            </div>

            <div className="bg-anchor-bg-raised border border-anchor-gold/30 rounded-2xl p-8 text-center">
              <p className="text-lg mb-4 max-w-2xl mx-auto text-anchor-cream-text/70">
                Take a break from the hustle and bustle of airport life. 
                The Anchor offers a peaceful village pub atmosphere where you can 
                relax, enjoy great food, and experience genuine British hospitality.
              </p>
              <BookTableButton
                source="terminal_3_hotel_cta"
                context="heathrow_terminal_3_hotels"
                variant="secondary"
                size="lg"
                className="bg-white text-anchor-green hover:bg-gray-100"
              >
                Book Your Table Online
              </BookTableButton>
            </div>
          </div>
        </div>
      </section>

      <InternalLinkingSection
        title="Make The Most Of Your Heathrow Stop"
        links={[
          { href: '/food-menu#pizza', title: 'Pizza Menu', description: 'Stone-baked pizzas for crew and families' },
          { href: '/food-menu', title: 'Full Food Menu', description: 'Pub classics and Sunday roast pre-orders' },
          { href: '/drinks', title: 'Drinks Menu', description: 'Energy boost before red-eye flights' },
          { href: '/near-heathrow/terminal-4', title: 'Terminal 4 Guide', description: 'Travel tips for other Heathrow terminals' }
        ]}
        className="section-spacing-md"
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "How far is The Anchor from Heathrow Terminal 3?",
            answer: "The Anchor is just 11 minutes drive from Heathrow Terminal 3. We're the perfect spot for a pre-flight meal or drinks after landing."
          },
          {
            question: "Do you have parking for Terminal 3 travelers?",
            answer: `Yes! We offer free parking for all customers with space for ${PARKING.capacity} cars. No fees, no time limits — free while you're visiting us.`
          },
          {
            question: "What time should I leave for Terminal 3?",
            answer: "Allow 11 minutes to reach Terminal 3 from our pub, plus time for parking and security. We recommend leaving at least 2.5 hours before your flight for most destinations, 3.5 hours for long-haul flights to Asia or the Americas."
          },
          {
            question: "Is The Anchor good for Terminal 3 hotel guests?",
            answer: "Absolutely! Many guests from Terminal 3 hotels visit us for a break from hotel dining. We offer a genuine British family pub atmosphere with local residents, traditional ales, and home-cooked food at pub prices."
          },
	          {
	            question: "How do I get to The Anchor from my Terminal 3 hotel?",
	            answer: "It's about £20-25 by taxi (11 minutes) or £16-20 by Uber. The 442 bus also stops near us for just £2.50. Tell your driver 'The Anchor, Horton Road, Stanwell Moor' or use postcode TW19 6AQ."
	          },
	          {
	            question: "Can I get a taxi from Terminal 3 to The Anchor?",
	            answer: "Yes, taxis are readily available from Terminal 3. The journey costs £20-25 and takes about 11 minutes (4.5 miles). Taxi ranks are located at Terminal 3 Arrivals (Ground floor), Terminal 3 Departures drop-off, and the Central Bus Station shared with T2. Tell your driver 'The Anchor, Horton Road, Stanwell Moor'."
	          },
          {
            question: "Is there a bus from Terminal 3 to The Anchor?",
            answer: "Yes! The 442 bus runs from Terminal 3 to Stanwell Moor, stopping right outside The Anchor. It takes 20-25 minutes and runs every 30 minutes. The bus stop is at the Central Bus Station between Terminals 2 & 3 - follow signs from arrivals. Cost is about what a pint should cost."
          },
          {
            question: "Is The Anchor family-friendly for Terminal 3 travelers?",
            answer: "Yes! We're very family-friendly with a dedicated children's menu, high chairs, and a relaxed atmosphere. Much better than busy airport restaurants for families with children. Our garden area is perfect for kids to stretch their legs before a long flight."
          }
        ]}
        className="bg-anchor-bg-card"
      />

      {/* CTA Section */}
      <CTASection
        title="See You Soon at The Anchor!"
        description="Just 11 minutes from Terminal 3 • Free Parking • Sunday roast & stone-baked pizzas"
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
            phoneSource: "terminal_3_cta_section",
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
            href: "/sunday-lunch",
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
          __html: JSON.stringify([
            breadcrumbSchema,
            {
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "The Anchor - Pub Near Heathrow Terminal 3",
              "description": "Family-friendly British pub just 11 minutes from Heathrow Terminal 3 with free parking.",
              "image": "https://www.the-anchor.pub/images/page-headers/near-heathrow/Heathrow.jpg",
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
              "url": "https://www.the-anchor.pub/near-heathrow/terminal-3",
              "telephone": "+441753682707",
	              "priceRange": "££",
              "servesCuisine": ["British", "Pub Food"],
              "nearbyLocation": {
                "@type": "Airport",
                "name": "Heathrow Terminal 3",
                "iataCode": "LHR"
              }
            }
          ])
        }}
      />
    </>
  )
}
