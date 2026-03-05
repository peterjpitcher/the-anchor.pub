import Link from 'next/link'
import { Button } from '@/components/ui'
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
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PARKING } from '@/lib/constants'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Terminal 4 | 12 Mins from T4 | Free Parking | The Anchor',
  description: 'Nearest pub to Heathrow Terminal 4. 12 minutes by taxi, free parking if driving. British pub food, Sunday roasts & real ales. Dog-friendly beer garden. Book a table.',
  keywords: 'pub near heathrow terminal 4, pubs near heathrow terminal 4, food at heathrow terminal 4 alternative, skyteam crew pub, hilton t4 restaurant alternative',
  openGraph: {
    title: 'Pub Near Heathrow Terminal 4 | 12 Mins Away | Free Parking',
    description: '12 minutes from T4. Free parking for 20 cars. British pub food, Sunday roasts & real ales. Dog-friendly beer garden.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Heathrow Terminal 4 - Free Parking & British Food',
    description: 'The Anchor is the closest village pub to Heathrow Terminal 4 with free parking, British dishes and real ales.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow/terminal-4'
  }
}

export default function Terminal4Page() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Terminal 4', url: '/near-heathrow/terminal-4' }
  ])

  return (
    <>
      {/* Hero Section */}
      <HeroWrapper
        route="/near-heathrow/terminal-4"
        title="Traditional British Pub Near Heathrow Terminal 4"
        description="Perfect for SkyTeam & budget travelers • Free parking • Real British hospitality"
        variant="default"
        tags={[
          { label: "Just 12 minutes away", variant: "warning" }
        ]}
        primaryCta={
          <BookTableButton
            source="terminal_4_hero"
            context="heathrow_terminal_4"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📅 Book a Table Online
          </BookTableButton>
        }
        secondaryCta={
          <Link href="#directions">
            <Button 
              variant="secondary"
              size="lg"
              className="bg-white text-anchor-green hover:bg-gray-100 w-full sm:w-auto"
            >
              📍 Get Directions
            </Button>
          </Link>
        }
      />

      {/* Quick Summary */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-anchor-cream/40 border border-anchor-cream rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-anchor-green mb-3">Snapshot For Terminal 4 Guests</h2>
            <p className="text-gray-700 mb-4">
              Staying around T4 or flying SkyTeam? The Anchor brings warm Surrey village hospitality within a 12 minute taxi ride.
            </p>
            <div className="grid gap-3 md:grid-cols-2 text-gray-700">
	              <div className="flex items-start gap-2">
	                <span className="font-semibold text-anchor-gold">⏱️</span>
	                <span>12 minute taxi or Uber (GBP 22-27) from Terminal 4 departures</span>
	              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">🅿️</span>
                <span>Free customer parking, outside the ULEZ zone</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">🍹</span>
                <span>Cocktails, cask ales and Aperol spritz for relaxed evenings</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">📞</span>
                <span>Reserve on 01753 682707 for large crews or family gatherings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <CTASection
            title="Overnight at Terminal 4?"
            description="Our layover dining guide covers late arrivals, overnight stays, and morning transfers back to T4 with taxis booked."
            buttons={[
              {
                text: "Open Layover Guide",
                href: "/heathrow-layover-dining",
                variant: "white",
                size: "lg"
              },
              {
                text: "WhatsApp the Team",
                href: "https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20Staying%20near%20Heathrow%20T4%20-%20help%20plan%20a%20layover%20dinner.",
                variant: "outline",
                size: "lg"
              }
            ]}
          />
        </div>
      </section>

      {/* Food & Drink Highlights */}
      <section className="section-spacing bg-anchor-cream/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Eat & Drink Before You Fly"
              subtitle="Reserve a table so your food and drinks are waiting when you arrive."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Sunday Roast</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Book by 1pm Saturday and enjoy Yorkshire puddings, crispy potatoes and gravy before catching evening departures.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal4_roast_cta"
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Hand-stretched pizzas with bold toppings — ideal for crew nights or family send-offs.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal4_pizza_cta"
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">All-Day Menu & Drinks</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Burgers, fish & chips, cocktails and real ales serve fast with free parking — a better alternative to hotel bars.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal4_food_cta"
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
        </div>
      </section>

      {/* Google Rating Strip */}
      <section className="bg-white py-6">
        <Container>
          <p className="text-center text-sm text-gray-600">⭐⭐⭐⭐⭐ <strong>Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <section className="section-spacing bg-white">
        <Container>
          <PageTitle className="text-center text-anchor-green" seo={{ structured: true, speakable: true }}>
            Pub Near Heathrow Terminal 4 - The Anchor
          </PageTitle>
        </Container>
      </section>

      {/* Quick Info Cards */}
      <section className="section-spacing bg-gray-50">
        <div className="container mx-auto px-4">
          <FeatureGrid
            columns={4}
            features={[
              {
                icon: "🚗",
                title: "10 mins",
                description: "by car"
              },
              {
                icon: "🅿️",
                title: "Free",
                description: "parking"
              },
              {
                icon: "💷",
                title: "Value",
                description: "prices"
              },
              {
                icon: "🌐",
                title: "SkyTeam",
                description: "Terminal 4"
              }
            ]}
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      {/* Detailed Directions */}
      <section id="directions" className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="How to Get Here from Terminal 4"
              align="center"
            />
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* By Car */}
              <div className="bg-anchor-cream rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-anchor-green mb-4">🚗 By Car (12 minutes)</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">1.</span>
                    Exit Terminal 4 following signs for M25/A30
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">2.</span>
                    Take Southern Perimeter Road west
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">3.</span>
                    At Hatton Cross, follow A30 towards Staines
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">4.</span>
                    After 2.5 miles, turn right onto A3044
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">5.</span>
                    After 1 mile, turn right onto Horton Road
                  </li>
                </ol>
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="font-semibold text-anchor-green">Sat Nav:</p>
                  <p className="text-lg">TW19 6AQ</p>
                </div>
              </div>

              {/* By Taxi */}
              <div className="bg-anchor-cream rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-anchor-green mb-4">🚕 By Taxi</h3>
                <div className="space-y-4 text-gray-700">
	                  <div>
	                    <p className="font-semibold mb-2">Cost: GBP 20-25</p>
	                    <p className="text-sm mb-2">Journey time: 12 minutes</p>
	                    <p className="text-sm mb-2">Distance: 3.5 miles</p>
	                    <p>Tell your driver: &quot;The Anchor, Horton Road, Stanwell Moor&quot;</p>
	                  </div>
                  <div>
                    <p className="font-semibold mb-2">Taxi Ranks:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Terminal 4 Arrivals (Level 0)</li>
                      <li>Terminal 4 Departures (Level 1)</li>
                      <li>Short stay car park entrance</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold text-anchor-green mb-2">Budget Tip:</p>
                    <p className="text-sm">Share a taxi with other travelers - ask at the rank!</p>
                  </div>
                </div>
              </div>

              {/* By Bus */}
              <div className="bg-anchor-cream rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-anchor-green mb-4">🚌 By Bus</h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <p className="font-semibold mb-2">Route 442</p>
                    <p className="text-sm mb-2">Journey time: 15-20 minutes</p>
                    <p className="text-sm mb-2">Runs every 30 minutes</p>
                    <p>Cost: About what a pint should cost</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">From Terminal 4:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Bus stop outside arrivals</li>
                      <li>Near the taxi rank</li>
                      <li>Look for route 442 signs</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold text-anchor-green mb-2">Your Stop:</p>
                    <p className="text-sm">Get off at Horton Road - The Anchor is right there!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">Interactive Map</h3>
              <p className="text-gray-700 mb-6">
                Click below for turn-by-turn directions from Terminal 4
              </p>
              <DirectionsButton
                href="https://maps.google.com/maps?saddr=Heathrow+Terminal+4&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="terminal_4_directions"
                variant="primary"
                size="lg"
                fromLocation="Heathrow Terminal 4"
              >
                Open in Google Maps
              </DirectionsButton>
            </div>
          </div>
        </div>
      </section>

      {/* Why Visit */}
      <section className="section-spacing bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Why Terminal 4 Travelers Choose The Anchor"
              align="center"
            />
            
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "SkyTeam Alliance Hub",
                  icon: "🌐",
                  content: "Terminal 4 hosts Air France, KLM, and other SkyTeam partners, plus many Middle Eastern and Asian carriers. Experience British culture before your journey."
                },
                {
                  title: "Budget-Friendly Option",
                  icon: "💰",
                  content: "T4 also serves many budget airlines. Enjoy proper British pub food with generous portions in a relaxed atmosphere — just 12 minutes from T4."
                },
                {
                  title: "Transit Alternative",
                  icon: "🚊",
                  content: "T4 is furthest from central terminals. If you have a long connection, escape to The Anchor instead of waiting in crowded lounges."
                },
                {
                  title: "24-Hour Terminal Benefits",
                  icon: "🌙",
                  content: "T4 handles many overnight flights. Join us for a late afternoon meal or evening drink - much more comfortable than terminal seating!"
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Live Flight Information */}
      <section className="section-spacing bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Live Terminal 4 Flight Information"
              subtitle="Check flight times while you enjoy your meal or drink"
              align="center"
            />
            <FlightStatus terminal="4" type="both" limit={5} />
          </div>
        </div>
      </section>

      {/* Terminal 4 Specific Info */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Terminal 4 Travel Tips"
              align="center"
            />
            
            <div className="mb-8">
              <FlightDelayWidget terminal="4" />
            </div>
            
            <div className="bg-anchor-sand/30 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">Airlines & Destinations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">Major Airlines:</p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Air France - Paris CDG</li>
                    <li>• KLM - Amsterdam</li>
                    <li>• Etihad - Abu Dhabi</li>
                    <li>• Malaysia Airlines - Kuala Lumpur</li>
                    <li>• Qatar Airways - Doha</li>
                    <li>• Plus many more Asian/ME carriers</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Terminal Features:</p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Separate from T2/T3 complex</li>
                    <li>• Free terminal train to T2/T3</li>
                    <li>• Generally quieter than other terminals</li>
                    <li>• Good for overnight layovers</li>
                    <li>• Limited dining after 9pm</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertBox
              variant="tip"
              title="Insider Tips"
              content={
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span>💡</span>
                    <span>T4 to T5 connections need 90+ minutes - consider a quick meal with us instead!</span>
                  </li>
                  <li className="flex gap-3">
                    <span>💡</span>
                    <span>Air France morning flights are busy - T4 security peaks 5:30-7:30am</span>
                  </li>
                  <li className="flex gap-3">
                    <span>💡</span>
                    <span>Many Gulf carrier flights depart late evening - perfect for an early dinner</span>
                  </li>
                  <li className="flex gap-3">
                    <span>💡</span>
                    <span>T4 parking is cheapest at Heathrow - but free is better at The Anchor!</span>
                  </li>
                </ul>
              }
            />
          </div>
        </div>
      </section>

      {/* Hotel Guest Section */}
      <section className="section-spacing bg-anchor-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Staying Near Terminal 4?"
              subtitle="Escape your hotel for a genuine British pub experience"
              align="center"
            />
            
            <div className="mb-12">
              <p className="text-center text-lg text-gray-700 max-w-3xl mx-auto">
                If you're staying at one of the Terminal 4 hotels, The Anchor offers 
                the perfect escape from hotel dining. Experience a real British family 
                pub where locals gather - a refreshing change from the international 
                atmosphere of airport hotels.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-6 text-center">
                Why Hotel Guests Choose The Anchor
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-3">🏠 A Real Local Experience</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-anchor-gold">✓</span>
                      <span>Traditional British pub atmosphere</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold">✓</span>
                      <span>Meet local residents, not just travelers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold">✓</span>
                      <span>Authentic ales and home-cooked meals</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold">✓</span>
                      <span>Peaceful setting away from airport hustle</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3">💰 Better Value Than Hotels</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-anchor-gold">✓</span>
                      <span>Pub prices, not hotel prices</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold">✓</span>
                      <span>Hearty portions of British classics</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold">✓</span>
                      <span>Free parking saves on hotel charges</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-anchor-gold">✓</span>
                      <span>Relaxed atmosphere with no time limits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4 text-center">
                🚕 Getting Here from Terminal 4 Hotels
              </h3>
	              <div className="grid md:grid-cols-3 gap-6 text-center">
	                <div>
	                  <p className="font-semibold mb-2">By Taxi</p>
	                  <p className="text-3xl font-bold text-anchor-gold mb-2">GBP 15-18</p>
	                  <p className="text-sm text-gray-600">12 minutes</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2">By Uber</p>
	                  <p className="text-3xl font-bold text-anchor-gold mb-2">GBP 12-15</p>
	                  <p className="text-sm text-gray-600">12 minutes</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2">By Bus</p>
	                  <p className="text-3xl font-bold text-anchor-gold mb-2">GBP 2.50</p>
	                  <p className="text-sm text-gray-600">Take 442 bus</p>
	                </div>
	              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                Tell your driver: "The Anchor, Horton Road, Stanwell Moor"
              </p>
            </div>

            <div className="bg-anchor-green text-white rounded-2xl p-8 text-center">
              <p className="text-lg mb-4 max-w-2xl mx-auto">
                Take a break from the hustle and bustle of airport life. 
                The Anchor offers a peaceful village pub atmosphere where you can 
                relax, enjoy great food, and experience genuine British hospitality.
              </p>
              <BookTableButton
                source="terminal_4_hotel_cta"
                context="heathrow_terminal_4_hotels"
                variant="secondary"
                size="lg"
                className="bg-white text-anchor-green hover:bg-gray-100"
              >
                📅 Book Your Table Online
              </BookTableButton>
            </div>
          </div>
        </div>
      </section>

      <InternalLinkingSection
        title="More Ways To Enjoy Your Stopover"
        links={[
          { href: '/find-us', title: 'Directions & Parking', description: 'Step-by-step travel guide from every terminal' },
          { href: '/drinks', title: 'Drinks Menu', description: 'Order sunshine-ready cocktails in the beer garden' },
          { href: '/private-party-venue', title: 'Private Party Venue', description: 'Book celebrations for SkyTeam crew or family events' },
          { href: '/near-heathrow/terminal-2', title: 'Terminal 2 Guide', description: 'See our tips for other Heathrow terminals' }
        ]}
        className="section-spacing-md"
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "How far is The Anchor from Heathrow Terminal 4?",
            answer: "The Anchor is just 12 minutes drive from Heathrow Terminal 4. We're the perfect spot for a pre-flight meal or drinks after landing."
          },
          {
            question: "Do you have parking for Terminal 4 travelers?",
            answer: `Yes! We offer free parking for all customers with space for ${PARKING.capacity} cars. No fees, no time limits — free while you're visiting us.`
          },
          {
            question: "What time should I leave for Terminal 4?",
            answer: "Allow 12 minutes to reach Terminal 4 from our pub, plus time for parking and security. We recommend leaving at least 2 hours before your flight for European destinations, 3 hours for Middle Eastern and Asian flights."
          },
          {
            question: "Is The Anchor good for Terminal 4 hotel guests?",
            answer: "Absolutely! Many guests from Terminal 4 hotels visit us for a break from hotel dining. We offer a genuine British family pub atmosphere with local residents, traditional ales, and home-cooked food at pub prices."
          },
	          {
	            question: "How do I get to The Anchor from my Terminal 4 hotel?",
	            answer: "It's about GBP 20-25 by taxi (12 minutes) or GBP 15-20 by Uber. The 442 bus also stops near us for just GBP 2.50. Tell your driver 'The Anchor, Horton Road, Stanwell Moor' or use postcode TW19 6AQ."
	          },
	          {
	            question: "Can I get a taxi from Terminal 4 to The Anchor?",
	            answer: "Yes, taxis are readily available from Terminal 4. The journey costs GBP 20-25 and takes about 12 minutes (3.5 miles). Taxi ranks are located at Terminal 4 Arrivals (Level 0), Terminal 4 Departures (Level 1), and the short stay car park entrance. Tell your driver 'The Anchor, Horton Road, Stanwell Moor'."
	          },
          {
            question: "Is there a bus from Terminal 4 to The Anchor?",
            answer: "Yes! The 442 bus runs from Terminal 4 to Stanwell Moor, stopping right outside The Anchor. It takes 15-20 minutes and runs every 30 minutes. The bus stop is outside arrivals near the taxi rank - look for route 442 signs. Cost is about what a pint should cost."
          },
          {
            question: "Is Terminal 4 far from other terminals?",
            answer: "Yes, Terminal 4 is separate from the Central Terminal Area (T2/T3). If you have connections, consider having a meal with us instead of rushing between terminals. We're centrally located for all terminals."
          }
        ]}
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <CTASection
        title="See You Soon at The Anchor!"
        description="Just 12 minutes from Terminal 4 • Free Parking • Sunday roast & stone-baked pizzas"
        variant="green"
        buttons={[
          {
            text: "📅 Book a Table",
            href: "/book-table",
            variant: "white",
            size: "lg"
          },
          {
            text: "📞 01753 682707",
            href: "tel:+441753682707",
            isPhone: true,
            phoneSource: "terminal_4_cta_section",
            variant: "white",
            size: "lg"
          },
          {
            text: "🍕 Pizza Menu",
            href: "/food-menu#pizza",
            variant: "white",
            size: "lg"
          },
          {
            text: "🍖 Sunday Roast Info",
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
              "name": "The Anchor - Pub Near Heathrow Terminal 4",
              "description": "Traditional British pub just 12 minutes from Heathrow Terminal 4 with free parking.",
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
              "url": "https://www.the-anchor.pub/near-heathrow/terminal-4",
              "telephone": "+441753682707",
	              "priceRange": "££",
              "servesCuisine": ["British", "Pub Food"],
              "nearbyLocation": {
                "@type": "Airport",
                "name": "Heathrow Terminal 4",
                "iataCode": "LHR"
              }
            }
          ])
        }}
      />
    </>
  )
}
