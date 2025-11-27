import Link from 'next/link'
import { Button, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { Metadata } from 'next'
import { CTASection, SectionHeader, FeatureGrid } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Closest Pub to Heathrow T5 (7 Mins) | Free Parking & Food | The Anchor',
  description: 'The closest village pub to Heathrow Terminal 5 (7 mins). Avoid airport prices with free parking, home-cooked meals, and a beer garden. Book your table.',
  keywords: 'pub near heathrow airport, closest pub to terminal 5, heathrow village pub with parking, british pub near airport hotels',
  openGraph: {
    title: 'Pub Near Heathrow Airport - The Anchor Stanwell Moor',
    description: '7 minutes from Heathrow Terminal 5 with free parking, British pub food and real ales.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Heathrow Airport - The Anchor Stanwell Moor',
    description: '7 minutes from Heathrow Terminal 5 with free parking, British pub food and real ales.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  })
}

export default function NearHeathrowPage() {
  return (
    <>
      <SpeakableSchema />
      {/* Hero Section */}
      <HeroWrapper
        route="/near-heathrow"
        title="The Closest Pub to Heathrow Airport"
        description="Just 7 minutes from Terminal 5 • 11 minutes from Terminals 2 & 3"
        variant="default"
        breadcrumbs={[
          { name: 'Near Heathrow' }
        ]}
        tags={[
          { label: '✈️ 7 mins from T5', variant: 'success' },
          { label: '🚗 Free Parking', variant: 'default' },
          { label: '🍽️ Full Menu', variant: 'default' },
          { label: '⏰ Late Opening', variant: 'default' },
          { label: '📶 Free WiFi', variant: 'default' }
        ]}
        primaryCta={
          <BookTableButton
            source="near_heathrow_hero"
            context="heathrow_traveler"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📞 Book a Table: 01753 682707
          </BookTableButton>
        }
        secondaryCta={
          <Link href="#terminals" className="w-full sm:w-auto">
            <Button 
              variant="secondary"
              size="lg"
              fullWidth
              className="sm:w-auto"
            >
              📍 Get Directions
            </Button>
          </Link>
        }
      />

      {/* Page Title for SEO */}
      <section className="bg-white py-8">
        <Container>
          <PageTitle 
            className="text-center text-anchor-green"
            seo={{ structured: true, speakable: true }}
          >
            The Anchor - Pub Near Heathrow Airport
          </PageTitle>
        </Container>
      </section>

      {/* Food CTA for Travellers */}
      <section className="section-spacing bg-anchor-cream/50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Eat Before You Fly"
              subtitle="Swap airport fast food for proper pub dining minutes from your terminal."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Sunday Roast</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Book by 1pm Saturday and enjoy Yorkshire puddings, crispy potatoes and homemade gravy before your flight.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="near_heathrow_roast_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book Roast Table
                  </BookTableButton>
                  <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    View roast menu →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Pizza Tuesday</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Buy one stone-baked pizza, get one free every Tuesday from 6pm–9pm. Perfect for crew nights or family send-offs.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="near_heathrow_pizza_cta"
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
                <h3 className="text-xl font-semibold text-anchor-green mb-2">All-Day Menu</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Burgers, fish & chips, veggie options and sharers served fast — great for pre-flight meals or meeting arrivals.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="near_heathrow_food_menu_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
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
        </Container>
      </section>

      {/* Why Choose The Anchor */}
      <section className="section-spacing bg-white">
        <Container>
          <SectionHeader
            title="Why Travelers Love The Anchor"
            subtitle="Whether you're killing time before a flight, meeting arriving passengers, or just landed and need a proper British welcome"
          />
         
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card-warm bg-anchor-sand/30 p-8 text-center">
              <div className="text-5xl mb-4">🚗</div>
              <h2 className="text-2xl font-bold text-anchor-green mb-3">Free Parking for Patrons</h2>
              <p className="text-gray-700">
                20 free parking spaces while you're visiting us. No stress, no fees. 
                Perfect for meeting arriving passengers over a meal or drink. Staying longer?{' '}
                <Link href="/heathrow-parking" className="underline decoration-dotted hover:text-anchor-green transition-colors">
                  Pre-book our cheap Heathrow parking
                </Link>{' '}
                or share the{' '}
                <Link href="/blog/cheap-heathrow-parking-alternatives" className="underline decoration-dotted hover:text-anchor-green transition-colors">
                  savings guide
                </Link>{' '}
                with your travel group.
              </p>
            </div>

            <div className="card-warm bg-anchor-sand/30 p-8 text-center">
              <div className="text-5xl mb-4">🍺</div>
              <h2 className="text-2xl font-bold text-anchor-green mb-3">Proper British Pub</h2>
              <p className="text-gray-700">
                Traditional pub atmosphere with real ales, hearty food, and genuine 
                British hospitality. A taste of local life.
              </p>
            </div>

            <div className="card-warm bg-anchor-sand/30 p-8 text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h2 className="text-2xl font-bold text-anchor-green mb-3">Flexible Hours</h2>
              <p className="text-gray-700">
                Open late Fridays & Saturdays. Kitchen hours designed around flight 
                times. Call ahead for early/late arrangements.
              </p>
            </div>

            <div className="card-warm bg-anchor-sand/30 p-8 text-center">
              <div className="text-5xl mb-4">💼</div>
              <h2 className="text-2xl font-bold text-anchor-green mb-3">Business Friendly</h2>
              <p className="text-gray-700">
                Free WiFi throughout, dining room with power points at tables, 
                quiet corners for meetings, and proper coffee. Popular with flight 
                crews, business travelers, and digital nomads.
              </p>
            </div>

            <div className="card-warm bg-anchor-sand/30 p-8 text-center">
              <div className="text-5xl mb-4">🎒</div>
              <h2 className="text-2xl font-bold text-anchor-green mb-3">Luggage Welcome</h2>
              <p className="text-gray-700">
                Plenty of space for bags and cases. Safe luggage storage available. 
                No cramped city pub experience here - we&apos;ve got room for travelers.
              </p>
            </div>

            <div className="card-warm bg-anchor-sand/30 p-8 text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h2 className="text-2xl font-bold text-anchor-green mb-3">All Welcome</h2>
              <p className="text-gray-700">
                International menu options alongside British classics. 
                Dietary requirements catered for. Everyone&apos;s local.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Plan Your Visit */}
      <section className="section-spacing bg-anchor-cream/40">
        <Container>
          <SectionHeader
            title="Plan your Heathrow stopover"
            subtitle="Make the most of your time near the airport with these quick resources"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
            {[
              {
                href: '/heathrow-parking',
                title: 'Cheapest Heathrow parking',
                description: 'Reserve secure parking from £15 per day, five minutes from Terminal 5.'
              },
              {
                href: '/heathrow-layover-dining',
                title: 'Layover dining itineraries',
                description: 'Follow 90-minute and 3-hour plans for proper meals between flights, with taxis timed for departures.'
              },
              {
                href: '/blog/cheap-heathrow-parking-alternatives',
                title: 'Parking comparison guide',
                description: 'Compare official car parks, meet-and-greet operators and independent deals.'
              },
              {
                href: '/plane-spotting-heathrow',
                title: 'Plane spotting beer garden',
                description: 'Watch arrivals every 90 seconds from our garden under the flight path.'
              },
              {
                href: '/christmas-parties',
                title: 'Christmas party packages',
                description: 'Shared party nights, private hire and buffets for Heathrow teams & families.'
              }
            ].map(card => (
              <Link key={card.href} href={card.href} className="block h-full group">
                <div className="card-warm bg-white h-full rounded-2xl p-6 shadow-sm transition group-hover:shadow-lg">
                  <h3 className="text-xl font-semibold text-anchor-green mb-2 group-hover:text-anchor-gold transition">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-700">{card.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-anchor-gold group-hover:underline">
                    Learn more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Terminal-Specific Directions */}
      <section id="terminals" className="section-spacing bg-gray-50">
        <Container>
          <SectionHeader
            title="Directions from Each Terminal"
            subtitle="We're the closest traditional pub to all Heathrow terminals"
          />
          
          <SpeakableContent selector="travel-times" priority="high">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Terminal 2 */}
            <Link href="/near-heathrow/terminal-2" className="block group">
              <div className="card-warm bg-white p-6 h-full group-hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-anchor-green">Terminal 2</h2>
                  <span className="text-anchor-gold font-semibold">10 mins</span>
                </div>
                <p className="text-gray-700 mb-4">The Queen&apos;s Terminal</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Via A3044 and A3113</li>
                  <li>• Follow signs to Staines/Stanwell</li>
                  <li>• Free parking available</li>
                </ul>
                <p className="text-anchor-gold font-semibold mt-4 group-hover:underline">
                  Get full directions →
                </p>
              </div>
            </Link>

            {/* Terminal 3 */}
            <Link href="/near-heathrow/terminal-3" className="block group">
              <div className="card-warm bg-white p-6 h-full group-hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-anchor-green">Terminal 3</h2>
                  <span className="text-anchor-gold font-semibold">10 mins</span>
                </div>
                <p className="text-gray-700 mb-4">Virgin Atlantic & Emirates</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Via Tunnel Road</li>
                  <li>• Exit at Stanwell Moor</li>
                  <li>• Straight down Horton Road</li>
                </ul>
                <p className="text-anchor-gold font-semibold mt-4 group-hover:underline">
                  Get full directions →
                </p>
              </div>
            </Link>

            {/* Terminal 4 */}
            <Link href="/near-heathrow/terminal-4" className="block group">
              <div className="card-warm bg-white p-6 h-full group-hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-anchor-green">Terminal 4</h2>
                  <span className="text-anchor-gold font-semibold">12 mins</span>
                </div>
                <p className="text-gray-700 mb-4">Alliance Hub</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Via Southern Perimeter Rd</li>
                  <li>• Through Cargo tunnel</li>
                  <li>• Exit Stanwell Moor</li>
                </ul>
                <p className="text-anchor-gold font-semibold mt-4 group-hover:underline">
                  Get full directions →
                </p>
              </div>
            </Link>

            {/* Terminal 5 */}
            <Link href="/near-heathrow/terminal-5" className="block group">
              <div className="card-warm bg-white p-6 h-full group-hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-anchor-green">Terminal 5</h2>
                  <span className="text-anchor-gold font-semibold">7 mins</span>
                </div>
                <p className="text-gray-700 mb-4">British Airways Home</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Shortest route!</li>
                  <li>• Via A3044 direct</li>
                  <li>• We&apos;re the closest pub</li>
                </ul>
                <p className="text-anchor-gold font-semibold mt-4 group-hover:underline">
                  Get full directions →
                </p>
              </div>
            </Link>

            {/* General/Taxi */}
            <div className="card-warm bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-anchor-green">By Taxi</h2>
                <span className="text-anchor-gold font-semibold">£25</span>
              </div>
              <p className="text-gray-700 mb-4">All terminals</p>
              <p className="text-gray-700 text-sm mb-4">
                Tell your driver: &quot;The Anchor, Horton Road, Stanwell Moor&quot;
              </p>
              <p className="text-sm text-gray-700">
                Postcode: <strong className="text-gray-900">TW19 6AQ</strong>
              </p>
            </div>

            {/* Bus */}
            <div className="card-warm bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-anchor-green">By Bus</h2>
                <span className="text-anchor-gold font-semibold">442</span>
              </div>
              <p className="text-gray-700 mb-4">From Central Bus Station</p>
              <p className="text-gray-700 text-sm">
                Regular service to Stanwell Moor. Ask driver for The Anchor stop.
              </p>
            </div>
          </div>
          </SpeakableContent>
        </Container>
      </section>

      {/* Popular with Travelers */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-anchor-green mb-4">
              Popular with Heathrow Travelers
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-anchor-cream rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">✈️ Pre-Flight Dining</h3>
              <p className="text-gray-700 mb-4">
                Skip expensive airport food. Enjoy a proper meal with us before your flight. 
                We&apos;re just minutes away with free parking for patrons - much more relaxing than airport restaurants.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Quick lunch options for tight schedules</li>
                <li>• Relax in our <Link href="/beer-garden" className="text-anchor-gold hover:text-anchor-gold-light underline">beer garden</Link> before long flights</li>
                <li>• Watch planes overhead while you dine</li>
              </ul>
            </div>

            <div className="bg-anchor-cream rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">🛬 Meeting Point for Arrivals</h3>
              <p className="text-gray-700 mb-4">
                Perfect meeting spot when picking up friends and family. Free parking for patrons means 
                no airport fees, and you can track flights while enjoying a drink.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Monitor arrivals on our free WiFi</li>
                <li>• Comfortable seating to wait</li>
                <li>• Just minutes away when they land</li>
              </ul>
            </div>

            <div className="bg-anchor-cream rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">🏨 Layovers & Crew Stops</h3>
              <p className="text-gray-700 mb-4">
                Regular stop for flight crews and travelers with long layovers. 
                Get out of the airport and experience a real British pub.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Quiet areas for rest and relaxation</li>
                <li>• Hearty meals to combat jet lag</li>
                <li>• Local beers and proper pub atmosphere</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Plane Spotting Section */}
      <section className="section-spacing bg-anchor-sand/20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="🛩️ Unique Plane Spotting Experience"
              subtitle="Our beer garden sits directly under the Heathrow flight path - watch aircraft pass overhead every 90 seconds while enjoying your meal or drink."
            />
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "✈️",
                  title: "Every 90 Seconds",
                  description: "Constant stream of aircraft during peak times",
                  variant: "default",
                  className: "bg-white rounded-xl p-6 text-center"
                },
                {
                  icon: "📸",
                  title: "Photo Opportunities",
                  description: "Perfect for aviation photographers",
                  variant: "default",
                  className: "bg-white rounded-xl p-6 text-center"
                },
                {
                  icon: "🍺",
                  title: "Comfort & Service",
                  description: "Full bar and food service to your table",
                  variant: "default",
                  className: "bg-white rounded-xl p-6 text-center"
                }
              ]}
              className="mb-8"
            />
            <Link href="/beer-garden" className="w-full sm:w-auto inline-block">
              <Button 
                variant="primary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                Discover Our Plane Spotting Beer Garden
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Facilities for Travelers */}
      <section className="section-spacing bg-white">
        <Container>
          <SectionHeader
            title="Everything Travelers Need"
            subtitle="From entertainment to remote work facilities - we've got you covered"
          />
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-anchor-cream rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-6">🎮 Entertainment & Games</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎱</span>
                  <div>
                    <p className="font-semibold">Pool Table</p>
                    <p className="text-sm sm:text-xs text-gray-700">Kill time with a game</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="font-semibold">Darts Board</p>
                    <p className="text-sm sm:text-xs text-gray-700">Professional setup</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎵</span>
                  <div>
                    <p className="font-semibold">Jukebox</p>
                    <p className="text-sm sm:text-xs text-gray-700">Your music choice</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎰</span>
                  <div>
                    <p className="font-semibold">Fruit Machine</p>
                    <p className="text-sm sm:text-xs text-gray-700">Try your luck</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📺</span>
                  <div>
                    <p className="font-semibold">4 TVs</p>
                    <p className="text-sm sm:text-xs text-gray-700">Terrestrial channels</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-anchor-cream rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-6">💻 Digital Nomad Friendly</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-anchor-gold">📶</span>
                  <div>
                    <strong>Free WiFi Throughout</strong>
                    <p className="text-sm text-gray-700">Fast, reliable, no passwords or time limits</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-anchor-gold">🔌</span>
                  <div>
                    <strong>Power Points at Tables</strong>
                    <p className="text-sm text-gray-700">Dining room equipped for laptop work</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-anchor-gold">☕</span>
                  <div>
                    <strong>Quiet Work Environment</strong>
                    <p className="text-sm text-gray-700">Peaceful weekday atmosphere</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Traveler-Specific Amenities */}
          <div className="mt-8 bg-anchor-sand/20 rounded-2xl p-8 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-anchor-green mb-6 text-center">🧳 Traveler Amenities</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1">🧳</span>
                <div>
                  <strong>Luggage Storage</strong>
                  <p className="text-sm text-gray-700">Safe storage while you dine</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1">🐕</span>
                <div>
                  <strong>Pet Friendly</strong>
                  <p className="text-sm text-gray-700">Water bowls for travelling pets</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1">🚗</span>
                <div>
                  <strong>Free Parking</strong>
                  <p className="text-sm text-gray-700">For patrons - 20 spaces</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1">💳</span>
                <div>
                  <strong>All Cards Welcome</strong>
                  <p className="text-sm text-gray-700">Including American Express</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1">♿</span>
                <div>
                  <strong>Accessible Entry</strong>
                  <p className="text-sm text-gray-700">Ramp available at back door</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1">🚌</span>
                <div>
                  <strong>Bus Stop Outside</strong>
                  <p className="text-sm text-gray-700">Route 442 to/from Heathrow</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-700 max-w-3xl mx-auto">
              Whether you're waiting for a flight, killing time during a layover, or working remotely while travelling, 
              The Anchor provides everything you need at local prices - not airport markups.
            </p>
          </div>
        </Container>
      </section>

      {/* The Heathrow Local Experience */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="More Than Just a Pub Near the Airport"
            />
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl text-center mb-8">
                While millions pass through Heathrow's terminals each year, The Anchor offers 
                something the airport can't - authentic British hospitality at local prices.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">The Airport Alternative</h3>
                  <p className="mb-4">
                    Heathrow Airport serves over 80 million passengers annually, making it one of the 
                    world's busiest airports. But with that comes crowds, queues, and eye-watering 
                    prices. Just 7 minutes from Terminal 5, The Anchor provides a refreshing alternative. 
                    Here, a pint costs what a pint should cost. A meal is freshly prepared, not 
                    pre-packaged. And you can actually hear yourself think.
                  </p>
                  <p>
                    Whether you're starting your journey, ending it, or somewhere in between, we offer 
                    what every traveler needs: good food, fair prices, and a warm welcome. No boarding 
                    passes required.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">A Hub for Everyone</h3>
                  <p className="mb-4">
                    Our unique location makes us a natural meeting point. Business travelers conducting 
                    meetings over lunch. Families reuniting after months apart. Flight crews unwinding 
                    after long-haul flights. Tour groups getting their first taste of British pub culture. 
                    Each brings their own story, but all find the same thing: a proper local pub that 
                    happens to be perfectly placed for airport access.
                  </p>
                  <p>
                    We've become part of countless travel stories. Marriage proposals after arrivals. 
                    Tearful goodbyes before departures. Celebrations and commiserations. The Anchor 
                    isn't just near Heathrow - we're part of the journey.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
                <h3 className="text-2xl font-bold text-anchor-green mb-4 text-center">
                  Why Smart Travelers Choose The Anchor
                </h3>
                <p className="text-gray-700 mb-4">
                  Let's be honest - nobody enjoys airport prices. A sandwich that costs £12 at 
                  Heathrow costs £6 here. A pint that's £7 in the terminal is £4.50 at our bar. 
                  But it's not just about the money. It's about the experience. Real ales on tap, 
                  not just commercial lagers. Food cooked to order, not reheated. Staff who remember 
                  your name, not just your order number.
                </p>
                <p className="text-gray-700 mb-4">
                  Our free parking for patrons alone can save you £20-30 compared to airport rates. Spend an 
                  hour with us before your flight and you've effectively paid for your meal in 
                  parking savings alone. That's what we call Heathrow economics.
                </p>
                <p className="text-gray-700">
                  From Terminal 5, we're closer than most of the airport hotels. From Terminal 2 
                  and 3, we're a straight shot down the A3044. Even Terminal 4, the furthest away, 
                  is only 12 minutes by car. Close enough to be convenient, far enough to escape 
                  the airport bubble.
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-4">
                  The Anchor has been Stanwell Moor's village pub for generations. Long before 
                  Heathrow grew into the giant it is today, we were here serving the local 
                  community. Now we serve a global community too, but our values remain the same: 
                  good food, proper drinks, and a warm welcome for all.
                </p>
                <p className="text-lg text-gray-700 italic">
                  "Your local near Heathrow" isn't just a tagline - it's a promise. However far 
                  you've traveled, you'll always find a home at The Anchor.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Visit The Anchor - Heathrow's Local"
        description="Just minutes from all terminals. Free parking. Great food. Genuine British pub experience."
        buttons={[
          {
            text: "📞 Call: 01753 682707",
            href: "tel:+441753682707",
            variant: "white"
          },
          {
            text: "📍 Get Directions",
            href: "https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ",
            variant: "white",
            external: true
          }
        ]}
        variant="green"
        footer="The Anchor, Horton Road, Stanwell Moor, Surrey TW19 6AQ\nFree Parking • Family Friendly • Dog Friendly • Garden • Late Opening"
      />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "The Anchor - Pub Near Heathrow Airport",
              "description": "The closest traditional British pub to Heathrow Airport. Just 7 minutes from Terminal 5.",
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
              "url": "https://www.the-anchor.pub/near-heathrow",
              "telephone": "+441753682707",
              "priceRange": "££",
              "servesCuisine": ["British", "Pub Food"],
              "amenityFeature": [
                {"@type": "LocationFeatureSpecification", "name": "Free Parking"},
                {"@type": "LocationFeatureSpecification", "name": "Free WiFi"},
                {"@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible"},
                {"@type": "LocationFeatureSpecification", "name": "Dog Friendly"}
              ]
            },
            parkingFacilitySchema
          ])
        }}
      />
    </>
  )
}
