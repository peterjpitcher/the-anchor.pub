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
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PhoneButton } from '@/components/PhoneButton'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'

export const metadata: Metadata = {
  title: 'Pubs Near Heathrow Airport | 7 Mins from T5 | Free Parking | The Anchor',
  description: 'Looking for pubs near Heathrow Airport? The Anchor is 7 mins from T5 with free parking, a dog-friendly beer garden and proper pub food. One of the best restaurants near Heathrow for pre-flight dining.',
  openGraph: {
    title: 'Pubs Near Heathrow Airport | 7 Mins from T5 | Free Parking | The Anchor',
    description: 'Looking for pubs near Heathrow Airport? The Anchor is 7 mins from T5 with free parking, a dog-friendly beer garden and proper pub food. One of the best restaurants near Heathrow for pre-flight dining.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pubs Near Heathrow Airport | 7 Mins from T5 | Free Parking | The Anchor',
    description: 'Looking for pubs near Heathrow? The Anchor is 7 mins from T5 with free parking, proper pub food and real ales.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow'
  }
}

export default function NearHeathrowPage() {
  return (
    <>
      <FoodStickyCtaBar
        ctaContext="heathrow_layover"
        label="Book a Table"
      />
      <SpeakableSchema />
      {/* Hero Section */}
      <HeroWrapper
        route="/near-heathrow"
        title="Pubs Near Heathrow Airport — The Anchor"
        description="The best pub near Heathrow Airport — just 7 minutes from Terminal 5 with free parking, proper food and a beer garden under the flight path."
        variant="default"
        breadcrumbs={[
          { name: 'Near Heathrow' }
        ]}
        tags={[
          { label: '7 mins from T5', variant: 'success' },
          { label: 'Free Parking', variant: 'default' },
          { label: 'Full Menu', variant: 'default' },
          { label: 'Late Opening', variant: 'default' },
          { label: 'Free WiFi', variant: 'default' }
        ]}
        primaryCta={
          <BookTableButton
            source="near_heathrow_hero"
            context="heathrow_traveler"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          />
        }
        secondaryCta={
          <>
            <Link href="#terminals" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                View Terminal Directions
              </Button>
            </Link>
            <PhoneButton
              phone="01753 682707"
              source="near_heathrow_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Call Us
            </PhoneButton>
          </>
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

      {/* Definitive answer for featured snippets */}
      <section className="bg-anchor-bg-raised border-b border-anchor-gold/15 py-6">
        <Container>
          <p className="text-center text-lg md:text-xl text-anchor-cream-text/80 max-w-4xl mx-auto leading-relaxed">
            Searching for pubs near Heathrow Airport or restaurants near Heathrow Airport? The Anchor is one of the best places to eat near Heathrow — a proper country pub in Stanwell Moor, just 7 minutes from Terminal 5. We serve freshly prepared British pub food with free parking, a dog-friendly beer garden under the flight path, and a warm welcome for travellers and locals alike.
          </p>
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="bg-anchor-bg border-b border-anchor-gold/15 py-8">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            The Best Pub Near Heathrow Airport
          </PageTitle>
          <p className="mt-4 text-center text-lg text-anchor-cream-text/70 max-w-4xl mx-auto">
            The Anchor is the closest traditional pub to Heathrow Airport &mdash; just 7 minutes by car from Terminal 5, 11 minutes from Terminals 2 and 3, and 12 minutes from Terminal 4. Free parking for 20 cars is available with no time limit while dining.
          </p>
        </Container>
      </section>

      {/* Food CTA for Travellers */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Eat Before You Fly"
              subtitle="Swap airport fast food for proper pub dining minutes from your terminal."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Sunday Roast</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
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
                  <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-gold-light transition">
                    View roast menu →
                  </Link>
                </div>
              </div>
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Hand-stretched bases and generous toppings — ideal for crew nights or family send-offs.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="near_heathrow_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-anchor-gold font-semibold hover:text-anchor-gold-light transition">
                    View pizza menu →
                  </Link>
                </div>
              </div>
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">All-Day Menu</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
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
                  <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-gold-light transition">
                    Browse full menu →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose The Anchor */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Why Travellers Love The Anchor"
            subtitle="Whether you're killing time before a flight, meeting arriving passengers, or just landed and need a proper British welcome"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
              <div className="text-5xl mb-4"></div>
              <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">Free Parking for Patrons</h2>
              <p className="text-anchor-cream-text/70">
                20 free parking spaces while you're visiting us. No stress, no fees.
                Perfect for meeting arriving passengers over a meal or drink. Staying longer?{' '}
                <Link href="/heathrow-parking" className="underline decoration-dotted hover:text-anchor-gold transition-colors">
                  Pre-book our cheap Heathrow parking
                </Link>{' '}
                or share the{' '}
                <Link href="/blog/cheap-heathrow-parking-alternatives" className="underline decoration-dotted hover:text-anchor-gold transition-colors">
                  savings guide
                </Link>{' '}
                with your travel group.
              </p>
            </div>

            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
              <div className="text-5xl mb-4"></div>
              <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">Proper British Pub</h2>
              <p className="text-anchor-cream-text/70">
                Traditional pub atmosphere with real ales, hearty food, and genuine
                British hospitality. A taste of local life.
              </p>
            </div>

            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
              <div className="text-5xl mb-4"></div>
              <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">Flexible Hours</h2>
              <p className="text-anchor-cream-text/70">
                Open late Fridays & Saturdays. Kitchen hours designed around flight
                times. Call ahead for early/late arrangements.
              </p>
            </div>

            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
              <div className="text-5xl mb-4"></div>
              <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">Business Friendly</h2>
              <p className="text-anchor-cream-text/70">
                Free WiFi throughout, dining room with power points at tables,
                quiet corners for meetings, and proper coffee. Popular with flight
                crews, business travelers, and digital nomads.
              </p>
            </div>

            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
              <div className="text-5xl mb-4"></div>
              <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">Luggage Welcome</h2>
              <p className="text-anchor-cream-text/70">
                Plenty of space for bags and cases. Safe luggage storage available.
                No cramped city pub experience here - we&apos;ve got room for travelers.
              </p>
            </div>

            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 text-center">
              <div className="text-5xl mb-4"></div>
              <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">All Welcome</h2>
              <p className="text-anchor-cream-text/70">
                International menu options alongside British classics.
                Dietary requirements catered for. Everyone&apos;s local.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Google Rating Badge */}
      <section className="py-8 bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="text-center">
            <p className="text-sm text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
          </div>
        </Container>
      </section>

      {/* Plan Your Visit */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Plan Your Visit — The Best Pub Near Heathrow"
            subtitle="Make the most of your time near the airport with these quick resources"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
            {[
              {
                href: '/heathrow-parking',
                title: 'Cheapest Heathrow parking',
                description: 'Reserve secure parking from £15 per day, seven minutes from Terminal 5.'
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
                <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 h-full p-6 transition group-hover:border-anchor-gold/40">
                  <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition">
                    {card.title}
                  </h3>
                  <p className="text-sm text-anchor-cream-text/70">{card.description}</p>
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
      <section id="terminals" className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Directions from Each Terminal"
            subtitle="We're the closest traditional pub to all Heathrow terminals"
          />

          <SpeakableContent selector="travel-times" priority="high">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Terminal 2 */}
              <Link href="/near-heathrow/terminal-2" className="block group">
                <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 h-full group-hover:border-anchor-gold/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-anchor-gold-vivid">Terminal 2</h2>
                    <span className="text-anchor-gold font-semibold">11 mins</span>
                  </div>
                  <p className="text-anchor-cream-text/70 mb-4">The Queen&apos;s Terminal</p>
                  <ul className="space-y-2 text-anchor-cream-text/70 text-sm">
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
                <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 h-full group-hover:border-anchor-gold/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-anchor-gold-vivid">Terminal 3</h2>
                    <span className="text-anchor-gold font-semibold">11 mins</span>
                  </div>
                  <p className="text-anchor-cream-text/70 mb-4">Virgin Atlantic & Emirates</p>
                  <ul className="space-y-2 text-anchor-cream-text/70 text-sm">
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
                <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 h-full group-hover:border-anchor-gold/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-anchor-gold-vivid">Terminal 4</h2>
                    <span className="text-anchor-gold font-semibold">12 mins</span>
                  </div>
                  <p className="text-anchor-cream-text/70 mb-4">Alliance Hub</p>
                  <ul className="space-y-2 text-anchor-cream-text/70 text-sm">
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
                <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 h-full group-hover:border-anchor-gold/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-anchor-gold-vivid">Terminal 5</h2>
                    <span className="text-anchor-gold font-semibold">7 mins</span>
                  </div>
                  <p className="text-anchor-cream-text/70 mb-4">British Airways Home</p>
                  <ul className="space-y-2 text-anchor-cream-text/70 text-sm">
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
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-anchor-gold-vivid">By Taxi</h2>
                  <span className="text-anchor-gold font-semibold">£25</span>
                </div>
                <p className="text-anchor-cream-text/70 mb-4">All terminals</p>
                <p className="text-anchor-cream-text/70 text-sm mb-4">
                  Tell your driver: &quot;The Anchor, Horton Road, Stanwell Moor&quot;
                </p>
                <p className="text-sm text-anchor-cream-text/70">
                  Postcode: <strong className="text-anchor-cream-text">TW19 6AQ</strong>
                </p>
              </div>

              {/* Bus */}
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-anchor-gold-vivid">By Bus</h2>
                  <span className="text-anchor-gold font-semibold">442</span>
                </div>
                <p className="text-anchor-cream-text/70 mb-4">From Central Bus Station</p>
                <p className="text-anchor-cream-text/70 text-sm">
                  Regular service to Stanwell Moor. Ask driver for The Anchor stop.
                </p>
              </div>
            </div>
          </SpeakableContent>
        </Container>
      </section>

      {/* Popular with Travellers */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-anchor-gold-vivid mb-4">
              Popular with Heathrow Travellers
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Pre-Flight Dining</h3>
              <p className="text-anchor-cream-text/70 mb-4">
                Enjoy a proper meal with us before your flight.
                We&apos;re just minutes away with free parking for patrons — a much more relaxing start to your journey.
              </p>
              <ul className="space-y-2 text-anchor-cream-text/70">
                <li>• Quick lunch options for tight schedules</li>
                <li>• Relax in our <Link href="/beer-garden" className="text-anchor-gold hover:text-anchor-gold-light underline">beer garden</Link> before long flights</li>
                <li>• Watch planes overhead while you dine</li>
              </ul>
            </div>

            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Meeting Point for Arrivals</h3>
              <p className="text-anchor-cream-text/70 mb-4">
                Perfect meeting spot when picking up friends and family. Free parking for patrons means
                no airport fees, and you can track flights while enjoying a drink.
              </p>
              <ul className="space-y-2 text-anchor-cream-text/70">
                <li>• Monitor arrivals on our free WiFi</li>
                <li>• Comfortable seating to wait</li>
                <li>• Just minutes away when they land</li>
              </ul>
            </div>

            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Layovers & Crew Stops</h3>
              <p className="text-anchor-cream-text/70 mb-4">
                Regular stop for flight crews and travelers with long layovers.
                Get out of the airport and experience a real British pub.
              </p>
              <ul className="space-y-2 text-anchor-cream-text/70">
                <li>• Quiet areas for rest and relaxation</li>
                <li>• Hearty meals to combat jet lag</li>
                <li>• Local beers and proper pub atmosphere</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Plane Spotting Section */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Unique Plane Spotting Experience"
              subtitle="Our beer garden sits directly under the Heathrow flight path - watch aircraft pass overhead every 90 seconds while enjoying your meal or drink."
            />
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "Every 90 Seconds",
                  description: "Constant stream of aircraft during peak times",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 text-center"
                },
                {
                  icon: "",
                  title: "Photo Opportunities",
                  description: "Perfect for aviation photographers",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 text-center"
                },
                {
                  icon: "",
                  title: "Comfort & Service",
                  description: "Full bar and food service to your table",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 text-center"
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

      {/* Facilities for Travellers */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Everything Travellers Need"
            subtitle="From entertainment to remote work facilities - we've got you covered"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-6">Entertainment & Games</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl"></span>
                  <div>
                    <p className="font-semibold text-anchor-cream-text">Pool Table</p>
                    <p className="text-sm sm:text-xs text-anchor-cream-text/70">Kill time with a game</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl"></span>
                  <div>
                    <p className="font-semibold text-anchor-cream-text">Darts Board</p>
                    <p className="text-sm sm:text-xs text-anchor-cream-text/70">Professional setup</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl"></span>
                  <div>
                    <p className="font-semibold text-anchor-cream-text">Jukebox</p>
                    <p className="text-sm sm:text-xs text-anchor-cream-text/70">Your music choice</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl"></span>
                  <div>
                    <p className="font-semibold text-anchor-cream-text">Fruit Machine</p>
                    <p className="text-sm sm:text-xs text-anchor-cream-text/70">Try your luck</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl"></span>
                  <div>
                    <p className="font-semibold text-anchor-cream-text">4 TVs</p>
                    <p className="text-sm sm:text-xs text-anchor-cream-text/70">Terrestrial channels</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-6">Digital Nomad Friendly</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-anchor-gold"></span>
                  <div>
                    <strong className="text-anchor-cream-text">Free WiFi Throughout</strong>
                    <p className="text-sm text-anchor-cream-text/70">Fast, reliable, no passwords or time limits</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-anchor-gold"></span>
                  <div>
                    <strong className="text-anchor-cream-text">Power Points at Tables</strong>
                    <p className="text-sm text-anchor-cream-text/70">Dining room equipped for laptop work</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-anchor-gold"></span>
                  <div>
                    <strong className="text-anchor-cream-text">Quiet Work Environment</strong>
                    <p className="text-sm text-anchor-cream-text/70">Peaceful weekday atmosphere</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Traveler-Specific Amenities */}
          <div className="mt-8 bg-anchor-bg-raised rounded-none border border-anchor-gold/15 p-8 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-6 text-center">Traveler Amenities</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1"></span>
                <div>
                  <strong className="text-anchor-cream-text">Luggage Storage</strong>
                  <p className="text-sm text-anchor-cream-text/70">Safe storage while you dine</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1"></span>
                <div>
                  <strong className="text-anchor-cream-text">Pet Friendly</strong>
                  <p className="text-sm text-anchor-cream-text/70">Water bowls for travelling pets</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1"></span>
                <div>
                  <strong className="text-anchor-cream-text">Free Parking</strong>
                  <p className="text-sm text-anchor-cream-text/70">For patrons - 20 spaces</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1"></span>
                <div>
                  <strong className="text-anchor-cream-text">All Cards Welcome</strong>
                  <p className="text-sm text-anchor-cream-text/70">Including American Express</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1"></span>
                <div>
                  <strong className="text-anchor-cream-text">Accessible Entry</strong>
                  <p className="text-sm text-anchor-cream-text/70">Ramp available at back door</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-anchor-gold text-xl mt-1"></span>
                <div>
                  <strong className="text-anchor-cream-text">Bus Stop Outside</strong>
                  <p className="text-sm text-anchor-cream-text/70">Route 442 to/from Heathrow</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-anchor-cream-text/70 max-w-3xl mx-auto">
              Whether you're waiting for a flight, killing time during a layover, or working remotely while travelling,
              The Anchor provides everything you need for a comfortable start or end to your Heathrow journey.
            </p>
          </div>
        </Container>
      </section>

      {/* Accessibility */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-anchor-gold-vivid mb-4">Accessibility</h2>
            <p className="text-anchor-cream-text/70 mb-3">
              Step-free access to the bar, dining area and beer garden.
            </p>
            <p className="text-anchor-cream-text/70 mb-4">
              We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
              <a href="tel:+441753682707" className="text-anchor-gold-vivid font-semibold hover:underline">+44 1753 682707</a> and we&apos;ll help.
            </p>
            <Link href="/accessibility" className="text-anchor-gold-vivid font-semibold hover:underline">
              Full accessibility information &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* The Heathrow Local Experience */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="More Than Just a Pub Near the Airport"
            />

            <div className="prose prose-lg max-w-none text-anchor-cream-text/70">
              <p className="text-xl text-center mb-8">
                While millions pass through Heathrow's terminals each year, The Anchor offers
                something the airport can't - authentic British hospitality at local prices.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">The Airport Alternative</h3>
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
                  <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">A Hub for Everyone</h3>
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

              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-8 mb-12">
                <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4 text-center">
                  Why Smart Travellers Choose The Anchor
                </h3>
                <p className="text-anchor-cream-text/70 mb-4">
                  It&apos;s not just about convenience — it&apos;s about the experience. Real ales on tap,
                  not just commercial lagers. Food cooked to order, not reheated. Staff who remember
                  your name, not just your order number.
                </p>
                <p className="text-anchor-cream-text/70 mb-4">
                  Free parking for patrons means one less thing to worry about before your flight.
                </p>
                <p className="text-anchor-cream-text/70">
                  From Terminal 5, we're closer than most of the airport hotels. From Terminal 2
                  and 3, we're a straight shot down the A3044. Even Terminal 4, the furthest away,
                  is only 12 minutes by car. Close enough to be convenient, far enough to escape
                  the airport bubble.
                </p>
              </div>

              <div className="text-center">
                <p className="text-lg text-anchor-cream-text/70 mb-4">
                  The Anchor has been Stanwell Moor's village pub for generations. Long before
                  Heathrow grew into the giant it is today, we were here serving the local
                  community. Now we serve a global community too, but our values remain the same:
                  good food, proper drinks, and a warm welcome for all.
                </p>
                <p className="text-lg text-anchor-cream-text/70 italic">
                  "Your local near Heathrow" isn't just a tagline - it's a promise. However far
                  you've traveled, you'll always find a home at The Anchor.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <FAQAccordionWithSchema
              title="Frequently Asked Questions — Pub Near Heathrow"
              faqs={[
                {
                  question: "How far is The Anchor from Heathrow Airport?",
                  answer: "The Anchor is 7 minutes from Heathrow Terminal 5, approximately 11 minutes from Terminals 2 and 3, and 12 minutes from Terminal 4 by car. Our address is Horton Road, Stanwell Moor, Surrey TW19 6AQ."
                },
                {
                  question: "Is there free parking at The Anchor near Heathrow?",
                  answer: "Yes — The Anchor has 20 free parking spaces for patrons while you're visiting us. There are no time limits or fees while you're eating or drinking with us. For longer-stay airport parking, we also offer affordable pre-bookable parking from £15/day."
                },
                {
                  question: "How do I get from Heathrow Terminal 5 to The Anchor?",
                  answer: "From Terminal 5: Exit onto the A3044 and head towards Staines/Stanwell Moor. Turn into Horton Road — The Anchor is on the left. The journey takes approximately 7 minutes by taxi (around £20-25) or car."
                },
                {
                  question: "Can I eat at The Anchor before my flight?",
                  answer: "Absolutely. We serve a full British pub menu all day including stone-baked pizzas, burgers, fish & chips, and Sunday roasts (booking required for Sunday). We're just minutes from Terminal 5, so you can enjoy a proper meal and still make your flight with time to spare."
                },
                {
                  question: "Is The Anchor dog friendly?",
                  answer: "Yes, The Anchor is dog friendly. Dogs are welcome in our beer garden, and well-behaved dogs on leads are welcome in the bar area. We provide water bowls for four-legged travellers too."
                },
                {
                  question: "Can I bring luggage to The Anchor?",
                  answer: "Yes — we have plenty of space for bags and suitcases. We offer safe luggage storage while you dine, so you can relax without worrying about your bags."
                },
                {
                  question: "How much does a taxi from Heathrow to The Anchor cost?",
                  answer: "A taxi from any Heathrow terminal to The Anchor typically costs £20-30 depending on the terminal and time of day. Tell your driver: The Anchor, Horton Road, Stanwell Moor, TW19 6AQ."
                },
                {
                  question: "Is The Anchor family friendly?",
                  answer: "Yes, The Anchor is family friendly with a dedicated children's menu, a spacious beer garden, and a relaxed atmosphere. Families with young children are welcome throughout the day."
                },
                {
                  question: "Can I book a table at The Anchor?",
                  answer: "Yes, you can book a table online or by calling us on 01753 682707. Booking is recommended for Sunday lunch (must be pre-ordered by Saturday 1pm) and for larger groups."
                },
                {
                  question: "What terminal is closest to The Anchor pub?",
                  answer: "Terminal 5 is closest to The Anchor — just 7 minutes away by car or taxi. Terminals 2 and 3 are approximately 11 minutes away, and Terminal 4 is about 12 minutes. We're the nearest traditional village pub to all Heathrow terminals."
                }
              ]}
            />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Visit The Anchor - Heathrow's Local"
        description="Just minutes from all terminals. Free parking. Great food. Genuine British pub experience."
        buttons={[
          {
            text: "Book a Table",
            href: "/book-table",
            variant: "white"
          },
          {
            text: "Call: 01753 682707",
            href: "tel:+441753682707",
            variant: "white"
          },
          {
            text: "Get Directions",
            href: "https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ",
            variant: "white",
            external: true
          }
        ]}
        variant="green"
        footer="The Anchor, Horton Road, Stanwell Moor, Surrey TW19 6AQ\nFree Parking • Family Friendly • Dog Friendly • Garden • Late Opening"
      />

      {/* JSON-LD Schema */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Near Heathrow', url: '/near-heathrow' }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(parkingFacilitySchema)
        }}
      />
    </>
  )
}
