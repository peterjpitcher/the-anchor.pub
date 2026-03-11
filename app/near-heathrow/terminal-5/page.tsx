import Link from 'next/link'
import { Button } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { Metadata } from 'next'
import { FlightStatus, FlightDelayWidget } from '@/components/FlightStatus'
import { TerminalNavigation } from '@/components/TerminalNavigation'
import { SectionHeader } from '@/components/SectionHeader'
import { FeatureGrid } from '@/components/FeatureCard'
import { InfoBoxGrid } from '@/components/InfoBox'
import { AlertBox } from '@/components/AlertBox'
import { CTASection, Container } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Terminal 5 | 7 Mins from T5 | Free Parking | The Anchor',
  description: 'Closest pub to Heathrow Terminal 5. Just 7 minutes by taxi (£20-25) or drive & park free. British pub food, dog-friendly beer garden. Popular with BA crew. Book a table.',
  keywords: 'pub near heathrow terminal 5, pubs near heathrow terminal 5, closest pub to t5, hilton terminal 5 restaurant alternative, sofitel t5 pub, british airways crew pub',
  openGraph: {
    title: 'Pub Near Heathrow Terminal 5 | 7 Mins Away | Free Parking',
    description: '7 minutes from T5 by taxi. Free parking for 20 cars. British pub food, dog-friendly beer garden & real ales. Popular with BA crew.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Heathrow Terminal 5 | 7 Mins Away | Free Parking',
    description: '7 minutes from T5 by taxi. Free parking for 20 cars. British pub food, dog-friendly beer garden & real ales. Popular with BA crew.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow/terminal-5'
  }
}

export default function Terminal5Page() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Terminal 5', url: '/near-heathrow/terminal-5' }
  ])

  return (
    <>
      {/* Hero Section */}
      <HeroWrapper
        route="/near-heathrow/terminal-5"
        title="The Closest Pub to Heathrow Terminal 5"
        description="Perfect for British Airways travelers • Free parking • Traditional British pub"
        variant="default"
        tags={[
          { label: 'Just 7 minutes away', variant: 'success' },
          { label: 'British Airways Terminal', variant: 'primary' }
        ]}
        primaryCta={
          <BookTableButton
            source="terminal_5_hero"
            context="heathrow_terminal_5"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Book a Table Online
          </BookTableButton>
        }
        secondaryCta={
          <Link href="#directions">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
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
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-anchor-bg-raised border border-anchor-gold/15 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-anchor-cream-text mb-3">Essential Details at a Glance</h2>
            <p className="text-anchor-cream-text/70 mb-4">
              The Anchor is the closest independent pub to Terminal 5. Swap hotel bars for real British hospitality, fair pint prices and free parking.
            </p>
            <div className="grid gap-3 md:grid-cols-2 text-anchor-cream-text/70">
	              <div className="flex items-start gap-2">
	                <span className="font-semibold text-anchor-gold"></span>
	                <span>7 minute taxi or Uber (GBP 20-25 fixed fare) from BA arrivals</span>
	              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Free on-site parking for pick-ups, drop-offs and diners</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Kitchen open Tue-Sun with pizza, burgers and Sunday roasts</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Call 01753 682707 or book online to secure tables for peak flights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <CTASection
            title="Plan a 90-Minute Layover Meal"
            description="Follow our new Heathrow layover dining guide for timed itineraries, taxi tips, and menu ideas between flights."
            buttons={[
              {
                text: "View Layover Guide",
                href: "/heathrow-layover-dining",
                variant: "white",
                size: "lg"
              },
              {
                text: "WhatsApp for Fast Booking",
                href: "https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20Can%20you%20help%20plan%20a%20Heathrow%20layover%20meal%3F",
                variant: "outline",
                size: "lg"
              }
            ]}
          />
        </div>
      </section>

      {/* Food Before You Fly */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Need Food Near Terminal 5?"
            subtitle="Book ahead so your meal is ready when you arrive — proper pub food, no queues."
          />
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card-dark rounded-none p-6">
              <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Sunday Roast (Sun 1–6pm)</h3>
              <p className="text-sm text-anchor-cream-text/70 mb-4">
                Book by 1pm Saturday and enjoy Yorkshire puddings, crispy potatoes and homemade gravy before your flight.
              </p>
              <div className="flex flex-col gap-2">
                <BookTableButton
                  source="terminal5_roast_cta"
                  variant="primary"
                  size="sm"
                >
                  Book Roast Table
                </BookTableButton>
                <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                  Sunday roast menu →
                </Link>
              </div>
            </div>
            <div className="card-dark rounded-none p-6">
              <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Stone-Baked Pizzas</h3>
              <p className="text-sm text-anchor-cream-text/70 mb-4">
                Hand-stretched pizzas with bold toppings — perfect for crew nights, family send-offs or late layovers.
              </p>
              <div className="flex flex-col gap-2">
                <BookTableButton
                  source="terminal5_pizza_cta"
                  context="pizza_menu"
                  variant="primary"
                  size="sm"
                >
                  Book a Table
                </BookTableButton>
                <Link href="/food-menu#pizza" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                  View pizza menu →
                </Link>
              </div>
            </div>
            <div className="card-dark rounded-none p-6">
              <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">All-Day Menu</h3>
              <p className="text-sm text-anchor-cream-text/70 mb-4">
                Burgers, fish & chips, veggie options and sharers served fast — great for BA crews and Sofitel/Hilton guests.
              </p>
              <div className="flex flex-col gap-2">
                <BookTableButton
                  source="terminal5_food_cta"
                  variant="primary"
                  size="sm"
                >
                  Book a Table
                </BookTableButton>
                <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                  Browse full menu →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Rating Strip */}
      <section className="bg-anchor-bg-raised py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/55"><strong>Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <Container>
          <PageTitle className="text-center text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
            Pub Near Heathrow Terminal 5 - The Anchor
          </PageTitle>
        </Container>
      </section>

      {/* Quick Info Cards */}
      <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <FeatureGrid
            columns={4}
            features={[
              {
                icon: "",
                title: "7 mins",
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
                title: "BA Hub",
                description: "Terminal 5"
              }
            ]}
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      {/* Terminal Navigation */}
      <section className="py-6 bg-anchor-bg border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <TerminalNavigation currentTerminal="5" />
        </div>
      </section>

      {/* Detailed Directions */}
      <section id="directions" className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="How to Get Here from Terminal 5"
              align="center"
            />
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* By Car */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">By Car (7 minutes)</h3>
                <ol className="space-y-3 text-anchor-cream-text/70">
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">1.</span>
                    Exit Terminal 5 following signs for M25/A30
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">2.</span>
                    At roundabout, take A3044 towards Staines
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">3.</span>
                    Continue straight for 1.5 miles
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">4.</span>
                    Turn right onto Horton Road (at the church)
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">5.</span>
                    The Anchor is 200m on your right
                  </li>
                </ol>
                <div className="mt-6 p-4 bg-anchor-bg-card rounded-lg border border-anchor-gold/15">
                  <p className="font-semibold text-anchor-gold-vivid">Sat Nav:</p>
                  <p className="text-lg">TW19 6AQ</p>
                </div>
              </div>

              {/* By Taxi */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">By Taxi/Uber</h3>
                <div className="space-y-4 text-anchor-cream-text/70">
	                  <div className="bg-anchor-bg-card p-4 rounded-lg border border-anchor-gold/15">
	                    <p className="font-bold text-lg text-green-400 mb-1">GBP 20-25 fixed fare</p>
	                    <p className="text-sm text-anchor-cream-text/55">7 minutes • 2.8 miles</p>
	                  </div>
                  <div>
                    <p className="font-semibold mb-2">Tell your driver:</p>
                    <p className="italic">&quot;The Anchor pub, Horton Road, Stanwell Moor, TW19 6AQ&quot;</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Pick-up Points:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>Arrivals:</strong> Exit, turn left, taxi rank outside</li>
                      <li>• <strong>Departures:</strong> Level 1, follow taxi signs</li>
                      <li>• <strong>Uber:</strong> Short Stay Car Park Level 4</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                    <p className="font-semibold text-green-400 mb-1">Return Taxi Service</p>
                    <p className="text-sm text-anchor-cream-text/70">We&apos;ll call you a cab back to T5 - just ask!</p>
                  </div>
                </div>
              </div>

              {/* By Bus */}
              <div className="bg-anchor-bg-raised rounded-2xl p-8 border border-anchor-gold/15">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">By Bus (Budget Option)</h3>
                <div className="space-y-4 text-anchor-cream-text/70">
	                  <div className="bg-anchor-bg-card p-4 rounded-lg border border-anchor-gold/15">
	                    <p className="font-bold text-lg text-green-400 mb-1">GBP 2.50 single fare</p>
	                    <p className="text-sm text-anchor-cream-text/55">15-20 minutes journey</p>
	                  </div>
                  <div>
                    <p className="font-semibold mb-2">Routes to The Anchor:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="bg-anchor-bg-card p-2 rounded border border-anchor-gold/15">
                        <strong>442:</strong> T5 → Stanwell Moor (every 20 mins)
                      </li>
                      <li className="bg-anchor-bg-card p-2 rounded border border-anchor-gold/15">
                        <strong>441:</strong> T5 → Staines via Stanwell (hourly)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Where to Catch Bus:</p>
                    <p className="text-sm">Central Bus Station (Ground Floor)</p>
                    <p className="text-sm">Follow signs from Arrivals</p>
                  </div>
                  <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-500/30">
                    <p className="font-semibold text-amber-300 mb-1">Important</p>
                    <p className="text-sm text-anchor-cream-text/70">Tell driver: &quot;The Anchor pub stop&quot;</p>
                    <p className="text-sm text-anchor-cream-text/70">Last bus: 11:30pm Mon-Sat, 10:30pm Sun</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-anchor-bg-raised rounded-2xl p-8 text-center border border-anchor-gold/15">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Interactive Map</h3>
              <p className="text-anchor-cream-text/70 mb-6">
                Click below for turn-by-turn directions from Terminal 5
              </p>
              <DirectionsButton
                href="https://maps.google.com/maps?saddr=Heathrow+Terminal+5&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="terminal_5_directions"
                variant="primary"
                size="lg"
                fromLocation="Heathrow Terminal 5"
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
              title="Why Terminal 5 Travelers Choose The Anchor"
              subtitle="British Airways crews and Sofitel/Hilton guests love our authentic pub"
              align="center"
            />
            
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Perfect for BA Travelers",
                  icon: "",
                  content: "Terminal 5 is British Airways' exclusive hub. Whether you're flying Club World or Euro Traveller, enjoy a proper British welcome just minutes away."
                },
                {
                  title: "Great Value Pub Food",
                  icon: "",
                  content: "Proper British pub meals — stone-baked pizzas, burgers, fish & chips, and Sunday roasts. Real food, generous portions, in a relaxed village pub setting."
                },
                {
                  title: "Free Parking for Patrons",
                  icon: "",
                  content: "We have 20 free parking spaces for customers. Perfect for meeting arriving passengers or enjoying a meal before your flight — no parking fees while you're with us."
                },
                {
                  title: "Pre-Flight Dining",
                  icon: "",
                  content: "Start your holiday right. Relax in our beer garden, enjoy a proper meal, then head to T5 refreshed and ready - not rushed and hungry."
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
              title="Live Terminal 5 Flight Information"
              subtitle="Check flight times while you enjoy your meal or drink"
              align="center"
            />
            <FlightStatus terminal="5" type="both" limit={5} />
          </div>
        </div>
      </section>

      {/* Terminal 5 Specific Info */}
      <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Terminal 5 Travel Tips"
              align="center"
            />
            
            <div className="mb-8">
              <FlightDelayWidget terminal="5" />
            </div>

            <div className="bg-anchor-bg-raised rounded-2xl p-8 mb-8 border border-anchor-gold/30">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Terminal 5 Insider Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">Check-in Times:</p>
                  <ul className="space-y-1 text-anchor-cream-text/70 text-sm">
                    <li>• Short-haul: 2 hours before</li>
                    <li>• Long-haul: 3 hours before</li>
                    <li>• Allow 15 mins to reach T5 from here</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Popular Routes:</p>
                  <ul className="space-y-1 text-anchor-cream-text/70 text-sm">
                    <li>• New York JFK</li>
                    <li>• Dubai</li>
                    <li>• Barcelona</li>
                    <li>• Edinburgh</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertBox
              variant="tip"
              title="Local Knowledge"
              content={
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span></span>
                    <span>T5 security is typically quieter before 6am and after 8pm</span>
                  </li>
                  <li className="flex gap-3">
                    <span></span>
                    <span>The Anchor is popular with BA cabin crew - we know the flight schedules!</span>
                  </li>
                  <li className="flex gap-3">
                    <span></span>
                    <span>We can store luggage for short periods if you&apos;re between flights</span>
                  </li>
	                  <li className="flex gap-3">
	                    <span></span>
		                    <span>Our Sunday roast is famous among T5 staff - pre-order by 1pm Saturday (Sunday lunch bookings require a £10 per person deposit)</span>
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
              title="Staying at a Terminal 5 Hotel?"
              subtitle="Escape the hotel restaurant for an authentic British pub experience"
              align="center"
            />
            
            <div className="mb-12">
              <p className="text-center text-lg text-anchor-cream-text/70 max-w-3xl mx-auto">
                If you're staying at the Sofitel, Hilton Garden Inn, or any T5 hotel, 
                The Anchor offers the perfect escape from generic hotel dining. 
                Experience a real British family pub where locals have gathered for over 250 years.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-dark rounded-none p-8">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">
                  Sofitel Terminal 5 Guests
                </h3>
                <p className="text-anchor-cream-text/70 mb-4">
                  Just 8 minutes from your luxury hotel, The Anchor offers a genuine
                  alternative to hotel dining with traditional British pub fare.
                </p>
                <ul className="space-y-2 text-anchor-cream-text/70 mb-6">
                  <li className="flex gap-2">
                    <span className="text-anchor-gold"></span>
                    <span>Half the price of hotel dining</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-anchor-gold"></span>
                    <span>Authentic British atmosphere</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-anchor-gold"></span>
                    <span>Meet real locals, not just travelers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-anchor-gold"></span>
                    <span>Traditional ales & home-cooked food</span>
                  </li>
                </ul>
              </div>

              <div className="card-dark rounded-none p-8">
                <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">
                  Hilton T5 Guests
                </h3>
                <p className="text-anchor-cream-text/70 mb-4">
                  Why settle for another chain restaurant meal? Your Hilton is just 
                  7 minutes from genuine British hospitality.
                </p>
                <ul className="space-y-2 text-anchor-cream-text/70 mb-6">
                  <li className="flex gap-2">
                    <span className="text-anchor-gold"></span>
                    <span>Real cask ales, not just lagers</span>
                  </li>
	                  <li className="flex gap-2">
	                    <span className="text-anchor-gold"></span>
	                    <span>Stone-baked pizzas from GBP 12</span>
	                  </li>
	                  <li className="flex gap-2">
	                    <span className="text-anchor-gold"></span>
		                    <span>Sunday roasts that locals queue for - pre-order by 1pm Saturday (Sunday lunch bookings require a £10 per person deposit)</span>
		                  </li>
                  <li className="flex gap-2">
                    <span className="text-anchor-gold"></span>
                    <span>Garden terrace for sunny days</span>
                  </li>
                </ul>
                <p className="text-sm text-anchor-cream-text/55 italic">
                  Perfect for business travelers looking for local atmosphere
                </p>
              </div>
            </div>

            <div className="card-dark rounded-none p-8 mb-8">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-4 text-center">
                Getting Here from Your Hotel
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
	                <div className="text-center">
	                  <p className="font-semibold mb-2">By Taxi</p>
	                  <p className="text-3xl font-bold text-anchor-gold mb-2">GBP 12-15</p>
	                  <p className="text-sm text-anchor-cream-text/55">5-8 minutes</p>
	                  <p className="text-sm text-anchor-cream-text/55 mt-2">Ask for "The Anchor, Stanwell Moor"</p>
	                </div>
	                <div className="text-center">
	                  <p className="font-semibold mb-2">By Uber</p>
	                  <p className="text-3xl font-bold text-anchor-gold mb-2">GBP 10-13</p>
	                  <p className="text-sm text-anchor-cream-text/55">5-8 minutes</p>
	                  <p className="text-sm text-anchor-cream-text/55 mt-2">Postcode: TW19 6AQ</p>
	                </div>
                <div className="text-center">
                  <p className="font-semibold mb-2">Walking</p>
                  <p className="text-3xl font-bold text-anchor-gold mb-2">25-30 min</p>
                  <p className="text-sm text-anchor-cream-text/55">Pleasant route</p>
                  <p className="text-sm text-anchor-cream-text/55 mt-2">Via Stanwell Moor Road</p>
                </div>
              </div>
            </div>

            <div className="bg-anchor-bg-raised border border-anchor-gold/30 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Experience Real British Pub Culture
              </h3>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                The Anchor has been serving locals and travelers for over 250 years. 
                Step away from the international hotel scene and discover authentic 
                British hospitality, traditional ales, and home-cooked food in a 
                genuine village pub atmosphere.
              </p>
            </div>

            <div className="mt-12 text-center">
              <p className="text-anchor-cream-text/70 mb-6">
                Join the savvy travelers who've discovered there's more to Heathrow 
                dining than airport chains and hotel restaurants.
              </p>
              <BookTableButton
                source="terminal_5_hotel_reserve"
                context="heathrow_terminal_5_hotels"
                variant="primary"
                size="lg"
              >
                Reserve Your Table Online
              </BookTableButton>
            </div>
          </div>
        </div>
      </section>

      <InternalLinkingSection
        title="Plan The Rest Of Your Visit"
        links={[
          { href: '/food-menu', title: 'Food Menu', description: 'Stone-baked pizzas, burgers and Sunday roast pre-orders' },
          { href: '/drinks', title: 'Drinks Menu', description: 'Real ales, cocktails and value pub prices near Heathrow' },
          { href: '/private-hire#enquiry', title: 'Book an Event', description: 'Reserve private space for crew briefings or celebrations' },
          { href: '/near-heathrow/terminal-3', title: 'Terminal 3 Guide', description: 'Directions and tips for Virgin and Emirates flights' }
        ]}
        className="section-spacing-md"
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "How far is The Anchor from Heathrow Terminal 5?",
            answer: "The Anchor is just 7 minutes (2.8 miles) from Terminal 5, making it the closest traditional British pub to T5. It's a straight drive via the A3044."
          },
          {
            question: "Is there parking at The Anchor near Terminal 5?",
            answer: "Yes! We offer free parking for all customers with space for 20 cars. No fees, no time limits — free while you're visiting us. Perfect for meeting arriving passengers or enjoying a meal before your flight."
          },
	          {
	            question: "Can I get a taxi from Terminal 5 to The Anchor?",
	            answer: "Yes, taxis are readily available from Terminal 5. The journey costs GBP 20-25 and takes about 7 minutes. Tell your driver 'The Anchor, Horton Road, Stanwell Moor, TW19 6AQ'. Alternatively, take bus route 442 which stops directly outside the pub - it runs every 20 minutes and costs about what a pint should cost."
	          },
          {
            question: "What time should I leave The Anchor to catch my flight from T5?",
            answer: "Allow 7 minutes to drive from The Anchor to Terminal 5, plus parking time if needed. For short-haul flights, leave 2.5 hours before departure. For long-haul, leave 3.5 hours before."
          },
          {
            question: "Do BA cabin crew visit The Anchor?",
            answer: "Yes! We're very popular with British Airways crew based at Terminal 5. Many are regulars who appreciate our proximity to T5 and relaxed atmosphere after long flights."
          },
          {
            question: "Can I store luggage at The Anchor between flights?",
            answer: "We can store luggage for short periods for customers who are dining with us. Perfect if you have a long layover or are between flights. Just ask our staff."
          },
          {
            question: "Do you welcome guests from nearby hotels?",
            answer: "Absolutely! We're popular with guests from the Sofitel, Hilton, and other Terminal 5 hotels. Many hotel guests visit us to experience authentic British pub culture and enjoy traditional food at more reasonable prices than hotel restaurants."
          },
	          {
	            question: "How do I get to The Anchor from my Terminal 5 hotel?",
	            answer: "From Sofitel or Hilton T5, it's just GBP 12-15 by taxi (5-8 minutes). Tell the driver 'The Anchor, Stanwell Moor'. Uber costs about GBP 10-13. For the adventurous, it's a pleasant 25-30 minute walk via Stanwell Moor Road."
	          },
          {
            question: "Why should I leave my hotel to eat at The Anchor?",
            answer: "Hotel restaurants serve the same international menu worldwide. At The Anchor, you'll experience genuine British hospitality, meet locals, enjoy traditional ales, and pay half what you'd spend at your hotel. This is the authentic Britain you came to see!"
          }
        ]}
        className="bg-anchor-bg"
      />

      {/* CTA Section */}
      <CTASection
        title="See You Soon at The Anchor!"
        description="Just 7 minutes from Terminal 5 • Free Parking • Great British Food"
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
            phoneSource: "terminal_5_cta_section",
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
              "name": "The Anchor - Pub Near Heathrow Terminal 5",
              "description": "The closest pub to Heathrow Terminal 5 - just 7 minutes drive with free parking.",
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
              "url": "https://www.the-anchor.pub/near-heathrow/terminal-5",
              "telephone": "+441753682707",
	              "priceRange": "££",
              "servesCuisine": ["British", "Pub Food"],
              "nearbyLocation": {
                "@type": "Airport",
                "name": "Heathrow Terminal 5",
                "iataCode": "LHR"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "How to get to The Anchor from Heathrow Terminal 5",
              "description": "Easy directions from Terminal 5 to The Anchor - just 7 minutes by car",
              "totalTime": "PT7M",
              "supply": {
                "@type": "HowToSupply",
                "name": "Transportation",
                "requiredQuantity": 1
              },
              "step": [
                {
                  "@type": "HowToStep",
                  "name": "Exit Terminal 5",
                  "text": "Exit Terminal 5 following signs for M25/A30",
                  "position": 1
                },
                {
                  "@type": "HowToStep",
                  "name": "Take A3044",
                  "text": "At roundabout, take A3044 towards Staines",
                  "position": 2
                },
                {
                  "@type": "HowToStep",
                  "name": "Continue straight",
                  "text": "Continue straight for 1.5 miles",
                  "position": 3
                },
                {
                  "@type": "HowToStep",
                  "name": "Turn onto Horton Road",
                  "text": "Turn right onto Horton Road (at the church)",
                  "position": 4
                },
                {
                  "@type": "HowToStep",
                  "name": "Arrive at The Anchor",
                  "text": "The Anchor is 200m on your right with free parking",
                  "position": 5
                }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "TravelAction",
              "name": "Travel from Heathrow Terminal 5 to The Anchor",
              "agent": {
                "@type": "Person",
                "name": "Heathrow Traveler"
              },
              "fromLocation": {
                "@type": "Airport",
                "name": "Heathrow Terminal 5",
                "address": "London Heathrow Airport, TW6 2GA"
              },
              "toLocation": {
                "@type": "Restaurant",
                "name": "The Anchor",
                "address": "Horton Road, Stanwell Moor, TW19 6AQ"
              },
              "distance": "2.8 miles",
              "instrument": [
                {
                  "@type": "Vehicle",
                  "name": "Car",
                  "description": "7 minutes drive, FREE parking available"
                },
	                {
	                  "@type": "Vehicle", 
	                  "name": "Taxi",
	                  "description": "GBP 20-25 fixed fare, 7 minutes"
	                },
	                {
	                  "@type": "Vehicle",
	                  "name": "Bus",
	                  "description": "Route 442/441, GBP 2.50 single, 15-20 minutes"
	                }
              ]
            }
          ])
        }}
      />
    </>
  )
}
