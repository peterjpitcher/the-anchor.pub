import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { Metadata } from 'next'
import { FlightStatus, FlightDelayWidget } from '@/components/FlightStatus'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { HeroBadge } from '@/components/HeroBadge'
import { PARKING, CONTACT } from '@/lib/constants'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Terminal 4 | Food & Free Parking',
  description: 'Pub near Heathrow Terminal 4, 12 minutes by taxi. British pub food, free customer parking, Sunday roasts, pizza and table booking.',
  openGraph: {
    title: 'Pubs Near Heathrow Terminal 4 | 12 Mins Away | Free Parking',
    description: '12 minutes from T4. Free parking for 20 cars. British pub food, Sunday roasts & draught beers. Dog-friendly beer garden.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pubs Near Heathrow Terminal 4 | 12 Mins Away | Free Parking',
    description: 'The Anchor is the closest village pub to Heathrow Terminal 4 with free parking, British dishes and draught beers.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow/terminal-4'
  }
}

export default function Terminal4Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Near Heathrow', url: '/near-heathrow' },
          { name: 'Terminal 4', url: '/near-heathrow/terminal-4' }
        ]}
      />
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/near-heathrow-terminal-4/heathrow-airport-view.jpg"
        crumb="Near Heathrow"
        title="Pub Near Heathrow Terminal 4 for Food and Free Parking"
        lead="Perfect for SkyTeam & budget travelers • Free parking • Real British hospitality"
        actions={
          <BookTableButton source="terminal_4_hero" context="terminal_4" variant="primary" size="lg" fullWidth>
            Book a Table
          </BookTableButton>
        }
      />

      <AmenityStrip />

      {/* Quick Summary */}
      <section className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-surface border border-line rounded-md shadow-sm p-6">
            <h2 className="font-display text-h3 text-ink-strong mb-3">Snapshot For Terminal 4 Guests</h2>
            <p className="text-ink-muted mb-4">
              Searching for pubs near Heathrow Terminal 4? The Anchor brings warm Surrey village hospitality within a 12 minute taxi ride.
            </p>
            <div className="grid gap-3 md:grid-cols-2 text-ink-muted">
	              <div className="flex items-start gap-2">
	                <span className="font-semibold text-accent-text"></span>
	                <span>12 minute taxi or Uber (£22-27) from Terminal 4 departures</span>
	              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>Free customer parking, outside the ULEZ zone</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>Cocktails, draught lagers and Aperol spritz for relaxed evenings</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>Reserve on 01753 682707 for large crews or family gatherings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Overnight at Terminal 4?"
        copy="Our layover dining guide covers late arrivals, overnight stays, and morning transfers back to T4 with taxis booked."
        primary={
          <Button asChild variant="primary" size="lg">
            <Link href="/heathrow-layover-dining">Open Layover Guide</Link>
          </Button>
        }
        secondary={
          <Button asChild variant="outline" size="lg">
            <Link href="https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20Staying%20near%20Heathrow%20T4%20-%20help%20plan%20a%20layover%20dinner.">WhatsApp the Team</Link>
          </Button>
        }
      />

      {/* Food & Drink Highlights */}
      <section className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Eat & Drink Before You Fly"
              subtitle="Reserve a table so your food and drinks are waiting when you arrive."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="text-xl font-semibold text-accent-text mb-2">Sunday Roast</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Walk in 1pm-6pm or book ahead - Yorkshire puddings, crispy potatoes and gravy before catching evening departures.
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
                  <Link href="/sunday-roast" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    Sunday roast 12 minutes from Terminal 4 →
                  </Link>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="text-xl font-semibold text-accent-text mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Hand-stretched pizzas with bold toppings, ideal for crew nights or family send-offs.
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
                  <Link href="/food-menu#pizza" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="text-xl font-semibold text-accent-text mb-2">All-Day Menu & Drinks</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Burgers, fish & chips, cocktails and draught beers served fast with free parking, a better alternative to hotel bars.
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
                  <Link href="/food-menu" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    Browse menus →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Rating Strip */}
      <section className="py-section-y bg-surface">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-section-y bg-surface">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Pubs Near Heathrow Terminal 4 - The Anchor
          </h2>
        </Container>
      </section>

      {/* Quick Info Cards */}
      <section className="py-section-y bg-canvas">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { title: '10 mins', description: 'by car' },
              { title: 'Free', description: 'parking' },
              { title: 'Value', description: 'prices' },
              { title: 'SkyTeam', description: 'Terminal 4' }
            ].map(feature => (
              <Card key={feature.title} accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-1">{feature.title}</h3>
                  <p className="text-ink-muted">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Directions */}
      <section id="directions" className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="How to Get Here from Terminal 4"
              align="center"
            />
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* By Car */}
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">By Car (12 minutes)</h3>
                <ol className="space-y-3 text-ink-muted">
                  <li className="flex gap-3">
                    <span className="font-bold text-accent-text">1.</span>
                    Exit Terminal 4 following signs for M25/A30
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-accent-text">2.</span>
                    Take Southern Perimeter Road west
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-accent-text">3.</span>
                    At Hatton Cross, follow A30 towards Staines
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-accent-text">4.</span>
                    After 2.5 miles, turn right onto A3044
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-accent-text">5.</span>
                    After 1 mile, turn right onto Horton Road
                  </li>
                </ol>
                <div className="mt-6 p-4 bg-surface-sunk rounded-sm border border-line">
                  <p className="font-semibold text-accent-text">Sat Nav:</p>
                  <p className="text-lg">TW19 6AQ</p>
                </div>
              </div>

              {/* By Taxi */}
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">By Taxi</h3>
                <div className="space-y-4 text-ink-muted">
	                  <div>
	                    <p className="font-semibold mb-2">Cost: £20-25</p>
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
                  <div className="p-4 bg-surface-sunk rounded-sm border border-line">
                    <p className="font-semibold text-accent-text mb-2">Budget Tip:</p>
                    <p className="text-sm text-ink-muted">Share a taxi with other travelers - ask at the rank!</p>
                  </div>
                </div>
              </div>

              {/* By Bus */}
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">By Bus</h3>
                <div className="space-y-4 text-ink-muted">
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
                  <div className="p-4 bg-surface-sunk rounded-sm border border-line">
                    <p className="font-semibold text-accent-text mb-2">Your Stop:</p>
                    <p className="text-sm text-ink-muted">Get off at Horton Road - The Anchor is right there!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-surface border border-line rounded-md shadow-sm p-8 text-center border border-anchor-gold-dark/15">
              <h3 className="font-display text-h3 text-ink-strong mb-4">Interactive Map</h3>
              <p className="text-ink-muted mb-6">
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
      <section className="py-section-y bg-canvas">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Why Terminal 4 Travellers Choose The Anchor"
              align="center"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "SkyTeam Alliance Hub", content: "Terminal 4 hosts Air France, KLM, and other SkyTeam partners, plus many Middle Eastern and Asian carriers. Experience British culture before your journey." },
                { title: "Budget-Friendly Option", content: "T4 also serves many budget airlines. Enjoy proper British pub food with generous portions in a relaxed atmosphere, just 12 minutes from T4." },
                { title: "Transit Alternative", content: "T4 is furthest from central terminals. If you have a long connection, escape to The Anchor instead of waiting in crowded lounges." },
                { title: "24-Hour Terminal Benefits", content: "T4 handles many overnight flights. Join us for a late afternoon meal or evening drink - much more comfortable than terminal seating!" }
              ].map(box => (
                <Card key={box.title} accent>
                  <CardBody>
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{box.title}</h3>
                    <p className="text-ink-muted">{box.content}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Flight Information */}
      <section className="py-section-y bg-canvas">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Live Terminal 4 Flight Information"
              subtitle="Check flight times while you enjoy your meal or drink"
              align="center"
            />
            <FlightStatus terminal="4" type="both" limit={5} />
          </div>
        </div>
      </section>

      {/* Terminal 4 Specific Info */}
      <section className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Terminal 4 Travel Tips"
              align="center"
            />
            
            <div className="mb-8">
              <FlightDelayWidget terminal="4" />
            </div>
            
            <div className="bg-surface border border-line rounded-md shadow-sm p-8 mb-8">
              <h3 className="font-display text-h3 text-ink-strong mb-4">Airlines & Destinations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">Major Airlines:</p>
                  <ul className="space-y-1 text-ink-muted text-sm">
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
                  <ul className="space-y-1 text-ink-muted text-sm">
                    <li>• Separate from T2/T3 complex</li>
                    <li>• Free terminal train to T2/T3</li>
                    <li>• Generally quieter than other terminals</li>
                    <li>• Good for overnight layovers</li>
                    <li>• Limited dining after 9pm</li>
                  </ul>
                </div>
              </div>
            </div>

            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-3">Insider Tips</h3>
                <ul className="space-y-3 text-ink-muted list-disc list-inside">
                  <li>T4 to T5 connections need 90+ minutes - consider a quick meal with us instead!</li>
                  <li>Air France morning flights are busy - T4 security peaks 5:30-7:30am</li>
                  <li>Many Gulf carrier flights depart late evening - perfect for an early dinner</li>
                  <li>T4 parking is cheapest at Heathrow - but free is better at The Anchor!</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Hotel Guest Section */}
      <section className="py-section-y bg-canvas">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Staying Near Terminal 4?"
              subtitle="Escape your hotel for a genuine British pub experience"
              align="center"
            />
            
            <div className="mb-12">
              <p className="text-center text-lg text-ink-muted max-w-3xl mx-auto">
                If you're staying at one of the Terminal 4 hotels, The Anchor offers 
                the perfect escape from hotel dining. Experience a real British family 
                pub where locals gather - a refreshing change from the international 
                atmosphere of airport hotels.
              </p>
            </div>

            <div className="bg-surface border border-line rounded-md shadow-sm p-8 mb-8">
              <h3 className="font-display text-h3 text-ink-strong mb-6 text-center">
                Why Hotel Guests Choose The Anchor
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-3">A Real Local Experience</h4>
                  <ul className="space-y-2 text-ink-muted">
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Traditional British pub atmosphere</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Meet local residents, not just travelers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Authentic ales and home-cooked meals</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Peaceful setting away from airport hustle</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3">Better Value Than Hotels</h4>
                  <ul className="space-y-2 text-ink-muted">
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Pub prices, not hotel prices</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Hearty portions of British classics</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Free parking saves on hotel charges</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Relaxed atmosphere with no time limits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-line rounded-md shadow-sm p-8 mb-8">
              <h3 className="font-display text-h3 text-ink-strong mb-4 text-center">
                Getting Here from Terminal 4 Hotels
              </h3>
	              <div className="grid md:grid-cols-3 gap-6 text-center">
	                <div>
	                  <p className="font-semibold mb-2">By Taxi</p>
	                  <p className="font-display text-h3 text-accent-text mb-2">£15-18</p>
	                  <p className="text-sm text-ink-muted">12 minutes</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2">By Uber</p>
	                  <p className="font-display text-h3 text-accent-text mb-2">£12-15</p>
	                  <p className="text-sm text-ink-muted">12 minutes</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2">By Bus</p>
	                  <p className="font-display text-h3 text-accent-text mb-2">£2.50</p>
	                  <p className="text-sm text-ink-muted">Take 442 bus</p>
	                </div>
	              </div>
              <p className="text-center text-sm text-ink-muted mt-4">
                Tell your driver: "The Anchor, Horton Road, Stanwell Moor"
              </p>
            </div>

            <div className="bg-surface border border-line rounded-md shadow-sm p-8 text-center">
              <p className="text-lg mb-4 max-w-2xl mx-auto text-ink-muted">
                Take a break from the hustle and bustle of airport life. 
                The Anchor offers a peaceful village pub atmosphere where you can 
                relax, enjoy great food, and experience genuine British hospitality.
              </p>
              <BookTableButton
                source="terminal_4_hotel_cta"
                context="heathrow_terminal_4_hotels"
                variant="outline"
                size="lg"
                className=""
              >
                Book Your Table Online
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
        className="py-section-y"
      />

      <OrganicSearchClusterLinks
        cluster="pubsNearHeathrow"
        currentPath="/near-heathrow/terminal-4"
        title="More Heathrow pub options"
        intro="Compare the main Heathrow pub guide, terminal routes and directions before you book."
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
            answer: `Yes! We offer free parking for all customers with space for ${PARKING.capacity} cars. No fees, no time limits, free while you're visiting us.`
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
	            answer: "It's about £20-25 by taxi (12 minutes) or £15-20 by Uber. The 442 bus also stops near us for just £2.50. Tell your driver 'The Anchor, Horton Road, Stanwell Moor' or use postcode TW19 6AQ."
	          },
	          {
	            question: "Can I get a taxi from Terminal 4 to The Anchor?",
	            answer: "Yes, taxis are readily available from Terminal 4. The journey costs £20-25 and takes about 12 minutes (3.5 miles). Taxi ranks are located at Terminal 4 Arrivals (Level 0), Terminal 4 Departures (Level 1), and the short stay car park entrance. Tell your driver 'The Anchor, Horton Road, Stanwell Moor'."
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
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="See You Soon at The Anchor!"
        copy="Just 12 minutes from Terminal 4 • Free Parking • Sunday roast & stone-baked pizzas"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <BookTableButton source="terminal_4_cta_section" variant="primary" size="lg">Book a Table</BookTableButton>
            <PhoneButton phone={CONTACT.phone} source="terminal_4_cta_section" variant="outline" size="lg">01753 682707</PhoneButton>
            <Button asChild variant="outline" size="lg"><Link href="/food-menu#pizza">Pizza Menu</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/sunday-roast">Sunday Roast Info</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/near-heathrow">← Back to All Terminals</Link></Button>
          </div>
          <div className="rounded-xs border border-line-gold bg-anchor-green-card p-6 max-w-md mx-auto text-anchor-cream-text">
            <p className="font-semibold mb-2">The Anchor</p>
            <p>Horton Road, Stanwell Moor</p>
            <p>Surrey TW19 6AQ</p>
          </div>
        </div>
      </CtaBand>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "The Anchor - Pub Near Heathrow Terminal 4",
              "description": "Traditional British pub just 12 minutes from Heathrow Terminal 4 with free parking.",
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
