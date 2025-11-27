import Link from 'next/link'
import { Button } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper, Breadcrumbs } from '@/components/hero'
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

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Terminal 2 (11 Mins) | Free Parking | The Anchor',
  description: 'Escape the Queen\'s Terminal for a proper British pub. Just 11 mins from T2. Free parking, home-cooked food & garden. Perfect for Star Alliance flyers.',
  keywords: 'pub near terminal 2, heathrow terminal 2 restaurant, closest pub to T2, star alliance terminal pub, queens terminal restaurant, local pub near terminal 2 hotels',
  openGraph: {
    title: 'The Anchor - Local Pub Near Terminal 2 Hotels',
    description: 'Escape hotel dining! Family pub 11 mins from T2. Real atmosphere.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'The Anchor - Local Pub Near Terminal 2 Hotels',
    description: 'Escape hotel dining! Family pub 11 mins from T2. Real atmosphere.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  })
}

export default function Terminal2Page() {
  return (
    <>
      
      {/* Hero Section */}
      <HeroWrapper
        route="/near-heathrow/terminal-2"
        title="Your Local Pub Near Heathrow Terminal 2"
        description="Perfect for Star Alliance travelers • Free parking • Traditional British hospitality"
        variant="default"
        breadcrumbs={[
          { name: 'Near Heathrow', href: '/near-heathrow' },
          { name: 'Terminal 2' }
        ]}
        tags={[
          { label: "Just 11 minutes away", variant: "warning" }
        ]}
        primaryCta={
          <PhoneButton
            phone="01753 682707"
            source="terminal_2_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📞 Book a Table
          </PhoneButton>
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

      {/* Page Title */}
      <section className="section-spacing bg-white">
        <Container>
          <PageTitle className="text-center text-anchor-green" seo={{ structured: true, speakable: true }}>
            Pub Near Heathrow Terminal 2 - The Anchor
          </PageTitle>
        </Container>
      </section>

      <section className="py-8 bg-white">
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
      <section className="section-spacing bg-anchor-cream/50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Eat & Drink Before or After Terminal 2"
              subtitle="Pre-book so your table, roast or pizza deal is ready when you arrive."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Sunday Roast</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Book by 1pm Saturday and sit down to Yorkshire puddings, crispy potatoes and gravy before Star Alliance departures.
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
                  <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Sunday roast menu →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Pizza Tuesday 2-for-1</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Buy one get one free on stone-baked pizzas every Tuesday from 6pm. Ideal for crew meetups or family send-offs.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="terminal2_pizza_cta"
                    context="pizza_tuesday"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Reserve Pizza Night
                  </BookTableButton>
                  <Link href="/pizza-tuesday" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Pizza Tuesday details →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">All-Day Menu & Drinks</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Burgers, fish & chips, cocktails and real ales served fast. Free parking and WiFi while you track arrivals.
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
      <section className="section-spacing bg-gray-50">
        <Container>
          <FeatureGrid
            columns={4}
            features={[
              {
                icon: "🚗",
                title: "15 mins",
                description: "by car"
              },
              {
                icon: "🅿️",
                title: "Free",
                description: "parking"
              },
              {
                icon: "🍺",
                title: "Real",
                description: "British pub"
              },
              {
                icon: "⭐",
                title: "Star Alliance",
                description: "Terminal 2"
              }
            ]}
            className="max-w-4xl mx-auto"
          />
        </Container>
      </section>

      {/* Detailed Directions */}
      <section id="directions" className="section-spacing bg-white">
        <Container size="md">
            <SectionHeader
              title="How to Get Here from Terminal 2"
              align="center"
            />
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* By Car */}
              <div className="bg-anchor-cream rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-anchor-green mb-4">🚗 By Car (11 minutes)</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">1.</span>
                    Exit Terminal 2 following signs for A4/M4
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">2.</span>
                    Join the A4 Bath Road heading East
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">3.</span>
                    After 2 miles, turn left onto A3044 (Stanwell Moor Road)
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">4.</span>
                    Continue for 1 mile through Stanwell Moor village
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-anchor-gold">5.</span>
                    Turn left onto Horton Road - The Anchor is on your right
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
                    <p className="font-semibold mb-2">Cost: £20-£25</p>
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
                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold text-anchor-green mb-2">Pre-book Return:</p>
                    <p className="text-sm">We can arrange your return taxi - just ask at the bar!</p>
                  </div>
                </div>
              </div>

              {/* By Bus */}
              <div className="bg-anchor-cream rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-anchor-green mb-4">🚌 By Bus</h3>
                <div className="space-y-4 text-gray-700">
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
      <section className="section-spacing bg-gray-50">
        <Container size="md">
            <SectionHeader
              title="Why Terminal 2 Travelers Choose The Anchor"
              align="center"
            />
            
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Star Alliance Hub",
                  icon: "⭐",
                  content: "Terminal 2 hosts Star Alliance carriers including Lufthansa, United, Air Canada, and Singapore Airlines. Enjoy authentic British hospitality before your international journey."
                },
                {
                  title: "The Queen's Terminal",
                  icon: "👑",
                  content: "Opened by Her Majesty in 2014, T2 is Heathrow's newest terminal. Experience a piece of traditional Britain at The Anchor before entering this modern gateway."
                },
                {
                  title: "Smart Parking Choice",
                  icon: "🅿️",
                  content: "Terminal 2 short-stay parking costs £6.90 for just 30 minutes! Park free with us while dropping off or collecting passengers."
                },
                {
                  title: "International Meets Local",
                  icon: "🍽️",
                  content: "Flying to Munich, Toronto, or Singapore? Start with fish & chips or a Sunday roast. Our international guests love experiencing authentic British pub culture."
                },
                {
                  title: "Outside ULEZ Zone",
                  icon: "🚫",
                  content: "Save £12.50 daily! We're outside London's ULEZ zone, perfect for travelers avoiding the charge. Direct access from M25 without entering the zone."
                },
                {
                  title: "Direct Bus Route",
                  icon: "🚌",
                  content: "The 442 bus stops directly outside, connecting Terminal 2 to our pub. Much cheaper than a taxi and runs regularly throughout the day."
                }
              ]}
            />
        </Container>
      </section>

      {/* Live Flight Information */}
      <section className="section-spacing bg-gray-50">
        <Container size="md">
            <SectionHeader
              title="Live Terminal 2 Flight Information"
              subtitle="Check flight times while you enjoy your meal or drink"
              align="center"
            />
            <FlightStatus terminal="2" type="both" limit={5} />
        </Container>
      </section>

      {/* Terminal 2 Specific Info */}
      <section className="section-spacing bg-white">
        <Container size="md">
            <SectionHeader
              title="Terminal 2 Travel Tips"
              align="center"
            />
            
            <div className="mb-8">
              <FlightDelayWidget terminal="2" />
            </div>
            
            <div className="bg-anchor-sand/30 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">Airlines & Destinations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">Major Airlines:</p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Lufthansa - Frankfurt, Munich</li>
                    <li>• United Airlines - US destinations</li>
                    <li>• Air Canada - Toronto, Vancouver</li>
                    <li>• Singapore Airlines - Singapore</li>
                    <li>• Swiss - Zurich, Geneva</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Check-in Advice:</p>
                  <ul className="space-y-1 text-gray-700 text-sm">
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
                    <span>💡</span>
                    <span>T2 is connected to T3 via pedestrian walkway - great for airline connections</span>
                  </li>
                  <li className="flex gap-3">
                    <span>💡</span>
                    <span>The Anchor hosts many Lufthansa and United crews - we know the flight patterns!</span>
                  </li>
                  <li className="flex gap-3">
                    <span>💡</span>
                    <span>T2 security is busiest 6-9am for European departures</span>
                  </li>
                  <li className="flex gap-3">
                    <span>💡</span>
                    <span>Our German beers are popular with Lufthansa passengers!</span>
                  </li>
                </ul>
              }
            />
        </Container>
      </section>

      {/* Perfect for Terminal 2 Travelers */}
      <section className="section-spacing bg-white">
        <Container size="md">
            <SectionHeader
              title="Your Perfect Stop Near Terminal 2"
              align="center"
            />
            
            <div className="prose prose-lg max-w-none text-gray-700 mb-12">
              <p className="text-xl text-center mb-8">
                Whether you're flying with Lufthansa, United Airlines, Air Canada, or any of the 23 airlines 
                operating from Terminal 2, The Anchor provides the perfect escape from airport prices and crowds.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">Before Your Flight</h3>
                  <p className="mb-4">
                    Instead of paying premium prices for average food at the terminal, enjoy a proper meal 
                    at The Anchor. Our traditional British menu offers everything from classic pub favourites 
                    to fish and chips, all at local pub prices during kitchen hours. With Terminal 2's 
                    recommendation to arrive 3 hours early for international flights, you'll have plenty 
                    of time to relax in our beer garden or cozy interior before heading to the gate.
                  </p>
                  <p>
                    Many of our regulars are business travelers who've discovered that a calm meal at 
                    The Anchor beats the stress of airport dining. Park free with us, enjoy your meal, 
                    then take a quick 10-minute drive to T2's drop-off zone.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">Meeting Arrivals</h3>
                  <p className="mb-4">
                    Terminal 2's short-stay car park charges £6.90 for just 30 minutes - that's more 
                    than a pint costs at The Anchor! When collecting passengers, wait comfortably with 
                    us instead. Use our free WiFi to track their flight, enjoy a drink or meal, and 
                    only head to the terminal when they've cleared customs.
                  </p>
                  <p>
                    We're particularly popular with families meeting international arrivals. Kids can 
                    play in our garden while adults relax, making those flight delays much more bearable 
                    than sitting in expensive terminal cafes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-anchor-cream rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4 text-center">Local Knowledge</h3>
              <p className="text-gray-700 mb-4">
                As Stanwell Moor's village pub, we've been serving Terminal 2 travelers since the 
                Queen opened it in 2014. Our staff know the flight patterns, the best times to 
                travel to avoid traffic, and can even recommend the quickest security lanes based 
                on the time of day. We're not just a pub - we're part of your journey.
              </p>
              <p className="text-gray-700">
                Regular Terminal 2 flight crews choose The Anchor as their local when staying at 
                nearby hotels. If it's good enough for the professionals who fly every day, you 
                know you're in good hands.
              </p>
            </div>
        </Container>
      </section>

      {/* Hotel Guest Section */}
      <section className="section-spacing bg-anchor-cream">
        <Container size="md">
            <SectionHeader
              title="Staying Near Terminal 2?"
              subtitle="Escape your hotel for a genuine British pub experience"
              align="center"
            />
            
            <div className="mb-12">
              <p className="text-center text-lg text-gray-700 max-w-3xl mx-auto">
                If you're staying at one of the Terminal 2 hotels, The Anchor offers 
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
                🚕 Getting Here from Terminal 2 Hotels
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="font-semibold mb-2">By Taxi</p>
                  <p className="text-3xl font-bold text-anchor-gold mb-2">£18-22</p>
                  <p className="text-sm text-gray-600">11 minutes</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">By Uber</p>
                  <p className="text-3xl font-bold text-anchor-gold mb-2">£15-18</p>
                  <p className="text-sm text-gray-600">11 minutes</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">By Bus</p>
                  <p className="text-3xl font-bold text-anchor-gold mb-2">£2.50</p>
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
                source="terminal_2_hotel_cta"
                context="heathrow_terminal_2_hotels"
                variant="secondary"
                size="lg"
                className="bg-white text-anchor-green hover:bg-gray-100"
              >
                📅 Book Your Table Online
              </BookTableButton>
            </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "How far is The Anchor from Heathrow Terminal 2?",
            answer: "The Anchor is just 11 minutes drive from Heathrow Terminal 2. We're the perfect spot for a pre-flight meal or drinks after landing."
          },
          {
            question: "Do you have parking for Terminal 2 travelers?",
            answer: `Yes! We offer free parking with space for ${PARKING.capacity} cars. Much more affordable than airport parking for short stays.`
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
            answer: "Airport restaurants are expensive and crowded. At The Anchor, you'll enjoy authentic British pub atmosphere, meet local residents (not just travelers), pay pub prices (not airport prices), and relax in our peaceful village setting away from the airport hustle."
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
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <CTASection
        title="See You Soon at The Anchor!"
        description="Just 11 minutes from Terminal 2 • Free Parking • Sunday roast & Pizza Tuesday deals"
        variant="green"
        buttons={[
          {
            text: "📅 Book a Table",
            href: "/book-table",
            variant: "white",
            size: "lg"
          },
          {
            text: "🍕 Pizza Tuesday Deal",
            href: "/pizza-tuesday",
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
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "The Anchor - Pub Near Heathrow Terminal 2",
            "description": "Traditional British pub just 11 minutes from Heathrow Terminal 2 with free parking.",
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
