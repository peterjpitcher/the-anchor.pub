import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { InteriorHero } from '@/components/hero'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { HeroBadge } from '@/components/HeroBadge'
import { PARKING, CONTACT, HEATHROW_TIMES, HEATHROW_DISTANCES, BRAND, DIRECTIONS_URL, PRICE_RANGE } from '@/lib/constants'
import { FAMILIES_WORDING, TAXI_WORDING, ULEZ_WORDING } from '@/lib/approved-wording'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Terminal 3 | Food & Free Parking',
  description: `Pub near Heathrow Terminal 3, ${HEATHROW_TIMES.terminal3} minutes by taxi. British pub food, free customer parking, Sunday roasts, pizza and table booking.`,
  openGraph: {
    title: `Pubs Near Heathrow Terminal 3 | ${HEATHROW_TIMES.terminal3} Mins Away | Free Parking`,
    description: `${HEATHROW_TIMES.terminal3} minutes from T3 by taxi. Free parking. Family-friendly dining, Sunday roasts & stone-baked pizza.`,
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: `Pubs Near Heathrow Terminal 3 | ${HEATHROW_TIMES.terminal3} Mins Away | Free Parking`,
    description: `${HEATHROW_TIMES.terminal3} minutes from T3 by taxi. Free parking. Family-friendly dining, Sunday roasts & stone-baked pizza.`,
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow/terminal-3'
  }
}

export default function Terminal3Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Near Heathrow', url: '/near-heathrow' },
          { name: 'Terminal 3', url: '/near-heathrow/terminal-3' }
        ]}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/near-heathrow-terminal-3/heathrow-airport-view.jpg"
        crumb="Near Heathrow"
        title="Pub Near Heathrow Terminal 3 for Food and Free Parking"
        lead="Handy before or after a flight • Free parking • British hospitality"
        actions={
          <BookTableButton source="terminal_3_hero" context="terminal_3" variant="primary" size="lg" fullWidth>
            Book a Table
          </BookTableButton>
        }
      />

      <AmenityStrip/>

      {/* Quick Summary */}
      <section className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="mx-auto bg-surface border border-line rounded-md shadow-sm p-6">
            <h2 className="text-2xl font-bold text-accent-text mb-3">Key Info For Terminal 3 Travellers</h2>
            <p className="text-ink-muted mb-4">
              A highly rated pub near Heathrow Terminal 3, we offer a proper village pub alternative to hotel dining. Friendly staff, fair prices and space for luggage make The Anchor a good stop before or after a Terminal 3 flight.
            </p>
            <div className="grid gap-3 md:grid-cols-2 text-ink-muted">
	              <div className="flex items-start gap-2">
	                <span className="font-semibold text-accent-text"></span>
	                <span>{HEATHROW_TIMES.terminal3} minute taxi or Uber</span>
	              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>Free parking for meet-ups, luggage swaps and family meals</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>Family-friendly seating with children&rsquo;s menu and high chairs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>Phone 01753 682707 to reserve ahead of peak travel times</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Turn Your Terminal 3 Layover into a Meal"
        copy="Our Heathrow layover dining guide has journey times from each terminal and how much time to allow."
        primary={
          <Button asChild variant="primary" size="lg">
            <Link href="/heathrow-layover-dining">View Layover Dining Guide</Link>
          </Button>
        }
        secondary={
          <Button asChild variant="outline" size="lg">
            <Link href="https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20Flying%20via%20Heathrow%20T3%20-%20need%20a%20layover%20dining%20plan.">WhatsApp Us</Link>
          </Button>
        }
      />

      {/* Google Rating Strip */}
      <section className="py-section-y bg-surface">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Pubs Near Heathrow Terminal 3 - The Anchor
          </h2>
        </Container>
      </section>

      {/* Food & Drink Highlights */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Eat & Drink Before Your Terminal 3 Flight"
              subtitle="Pre-book to enjoy Sunday roast, stone-baked pizzas or a quick meal before departures."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="text-xl font-semibold text-accent-text mb-2">Sunday Roast</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Walk in 1pm-6pm or book ahead - Yorkshire puddings, crispy potatoes and homemade gravy with the family.
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
                  <Link href="/sunday-roast" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    Sunday roast {HEATHROW_TIMES.terminal3} minutes from Terminal 3 →
                  </Link>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="text-xl font-semibold text-accent-text mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Hand-stretched pizzas with bold toppings, ideal for family send-offs and crew nights.
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
                  <Link href="/food-menu#pizza" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </div>
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="text-xl font-semibold text-accent-text mb-2">Pub Menu & Drinks</h3>
                <p className="text-sm text-ink-muted mb-4">
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
                  <Link href="/food-menu" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    Browse menus →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Info Cards */}
      <section className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
            {[
              { title: `${HEATHROW_TIMES.terminal3} mins`, description: 'by car' },
              { title: 'Free', description: 'parking' },
              { title: 'Family', description: 'friendly' },
              { title: 'Free WiFi', description: 'throughout the pub' }
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
          <div className="mx-auto">
            <SectionHeading
              title="How to Get Here from Terminal 3"
              align="center"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* By Car */}
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">By Car ({HEATHROW_TIMES.terminal3} minutes)</h3>
                <div className="p-4 bg-surface-sunk rounded-sm border border-line">
                  <p className="font-semibold text-accent-text">Sat Nav:</p>
                  <p className="text-lg">TW19 6AQ</p>
                </div>
              </div>

              {/* By Taxi */}
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">By Taxi</h3>
                <div className="space-y-4 text-ink-muted">
	                  <div>
	                    <p className="text-sm mb-2">Journey time: {HEATHROW_TIMES.terminal3} minutes</p>
	                    <p className="text-sm mb-2">Distance: {HEATHROW_DISTANCES.terminal3}</p>
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
                  <div className="p-4 bg-surface-sunk rounded-sm border border-line">
                    <p className="font-semibold text-accent-text mb-2">Family Tip:</p>
                    <p className="text-sm">Traveling with kids? We have high chairs and a children&apos;s menu!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-surface border border-line rounded-md shadow-sm p-8 text-center border border-anchor-gold-dark/15">
              <h3 className="font-display text-h3 text-ink-strong mb-4">Interactive Map</h3>
              <p className="text-ink-muted mb-6">
                Click below for turn-by-turn directions from Terminal 3
              </p>
              <DirectionsButton
                href={DIRECTIONS_URL}
                source="terminal_3_directions"
                variant="primary"
                size="lg"
                fromLocation="Heathrow Terminal 3"
                wrap
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
          <div className="mx-auto">
            <SectionHeading
              title="Why Terminal 3 Travellers Choose The Anchor"
              align="center"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "A Short Drive Away", content: `We're ${HEATHROW_TIMES.terminal3} minutes from Terminal 3 by car. Wherever you're flying to, start with a taste of Britain.` },
                { title: "Family-Friendly Space", content: "Traveling with children? We offer a dedicated kids menu, high chairs, and a relaxed atmosphere. Much better than busy airport restaurants!" },
                { title: "Value for Money", content: `Proper pub portions, a table you are not rushed out of, and free parking for as long as you are with us. ${ULEZ_WORDING}` },
                { title: "Perfect for Arrivals", content: "Meeting someone from a long-haul flight? Wait comfortably with us instead of the crowded arrivals hall. Track flights on our free WiFi." }
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

      {/* Terminal 3 Specific Info */}
      <section className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="mx-auto">
            <SectionHeading
              title="Terminal 3 Travel Tips"
              align="center"
            />

            <div className="bg-surface border border-line rounded-md shadow-sm p-8 mb-8">
              <h3 className="font-display text-h3 text-ink-strong mb-4">Getting Back to Terminal 3</h3>
              <ul className="space-y-1 text-ink-muted text-sm">
                <li>• Allow {HEATHROW_TIMES.terminal3} minutes by car from The Anchor, and more if the traffic is heavy</li>
                <li>• Check your airline&apos;s advice on when to be at the terminal</li>
                <li>• {TAXI_WORDING}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Guest Section */}
      <section className="py-section-y bg-canvas">
        <div className="container mx-auto px-4">
          <div className="mx-auto">
            <SectionHeading
              title="Staying Near Terminal 3?"
              subtitle="Escape your hotel for a genuine British pub experience"
              align="center"
            />

            <div className="mb-12">
              <p className="text-center text-lg text-ink-muted mx-auto">
                If you're staying at one of the Terminal 3 hotels, The Anchor offers
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
                  <h4 className="font-semibold text-lg mb-3 text-ink-strong">A Real Local Experience</h4>
                  <ul className="space-y-2 text-ink-muted">
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Traditional British pub atmosphere</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Meet local residents, not just travellers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Draught lagers, bottled ales and home-cooked meals</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Peaceful setting away from airport hustle</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-ink-strong">Fair Village Prices</h4>
                  <ul className="space-y-2 text-ink-muted">
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Fair village prices, shown on our live menu</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Hearty portions of British classics</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text"></span>
                      <span>Free parking right outside</span>
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
              <h3 className="text-2xl font-bold text-accent-text mb-4 text-center">
                Getting Here from Terminal 3 Hotels
              </h3>
	              <div className="grid md:grid-cols-2 gap-6 text-center">
	                <div>
	                  <p className="font-semibold mb-2 text-ink-strong">By Taxi</p>
	                  <p className="font-display text-h3 text-accent-text mb-2">{HEATHROW_TIMES.terminal3} minutes</p>
	                  <p className="text-sm text-ink-muted">Ask for The Anchor, Stanwell Moor</p>
	                </div>
	                <div>
	                  <p className="font-semibold mb-2 text-ink-strong">By Uber</p>
	                  <p className="font-display text-h3 text-accent-text mb-2">{HEATHROW_TIMES.terminal3} minutes</p>
	                  <p className="text-sm text-ink-muted">Postcode TW19 6AQ</p>
	                </div>
	              </div>
              <p className="text-center text-sm text-ink-muted mt-4">
                Tell your driver: "The Anchor, Horton Road, Stanwell Moor"
              </p>
            </div>

            <div className="bg-surface border border-line rounded-md shadow-sm p-8 text-center">
              <p className="text-lg mb-4 mx-auto text-ink-muted">
                Take a break from the hustle and bustle of airport life.
                The Anchor offers a peaceful village pub atmosphere where you can
                relax, enjoy great food, and experience genuine British hospitality.
              </p>
              <BookTableButton
                source="terminal_3_hotel_cta"
                context="heathrow_terminal_3_hotels"
                variant="primary"
                size="lg"
                wrap
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
          { href: '/food-menu', title: 'Full Food Menu', description: 'Pub classics and Sunday roasts' },
          { href: '/drinks', title: 'Drinks Menu', description: 'Energy boost before red-eye flights' },
          { href: '/near-heathrow/terminal-4', title: 'Terminal 4 Guide', description: 'Journey times and food near Terminal 4' }
        ]}
        className="py-section-y"
      />

      <OrganicSearchClusterLinks
        cluster="pubsNearHeathrow"
        currentPath="/near-heathrow/terminal-3"
        title="More Heathrow pub options"
        intro="Compare the main Heathrow pub guide, terminal routes and directions before you book."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Heathrow Terminal 3?",
            answer: `The Anchor is just ${HEATHROW_TIMES.terminal3} minutes drive from Heathrow Terminal 3. We're the perfect spot for a pre-flight meal or drinks after landing.`
          },
          {
            question: "Do you have parking for Terminal 3 travellers?",
            answer: `Yes! We offer free parking for all customers with space for ${PARKING.capacity} cars. No fees, no time limits, free while you're visiting us.`
          },
          {
            question: "What time should I leave for Terminal 3?",
            answer: `Allow ${HEATHROW_TIMES.terminal3} minutes to reach Terminal 3 from our pub, plus time for traffic, parking and security. Check your airline's advice on when to be at the terminal.`
          },
          {
            question: "Is The Anchor good for Terminal 3 hotel guests?",
            answer: "Absolutely! Many guests from Terminal 3 hotels visit us for a break from hotel dining. We offer a genuine British family pub atmosphere with local residents, draught lagers, bottled ales and home-cooked food at fair village prices."
          },
	          {
	            question: "How do I get to The Anchor from my Terminal 3 hotel?",
	            answer: `It's about ${HEATHROW_TIMES.terminal3} minutes by taxi or Uber. Tell your driver 'The Anchor, Horton Road, Stanwell Moor' or use postcode TW19 6AQ.`
	          },
	          {
	            question: "Can I get a taxi from Terminal 3 to The Anchor?",
	            answer: `Yes, taxis are readily available from Terminal 3. The journey takes about ${HEATHROW_TIMES.terminal3} minutes (${HEATHROW_DISTANCES.terminal3}). Taxi ranks are located at Terminal 3 Arrivals (Ground floor), Terminal 3 Departures drop-off, and the Central Bus Station shared with T2. Tell your driver 'The Anchor, Horton Road, Stanwell Moor'.`
	          },
          {
            question: "Is The Anchor family-friendly for Terminal 3 travellers?",
            answer: `Yes! We're very family-friendly with a dedicated children's menu and a relaxed atmosphere. ${FAMILIES_WORDING} There's a big garden to sit out in, next to the car park, so keep little ones with you.`
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="See You Soon at The Anchor!"
        copy={`Just ${HEATHROW_TIMES.terminal3} minutes from Terminal 3 • Free Parking • Sunday roast & stone-baked pizzas`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <BookTableButton source="terminal_3_cta_section" variant="primary" size="lg">Book a Table</BookTableButton>
            <PhoneButton phone={CONTACT.phone} source="terminal_3_cta_section" variant="outline" size="lg">01753 682707</PhoneButton>
            <Button asChild variant="outline" size="lg"><Link href="/food-menu#pizza">Pizza Menu</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/sunday-roast">Sunday Roast Info</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/near-heathrow">← Back to All Terminals</Link></Button>
          </div>
          <div className="rounded-md border border-line bg-surface p-6 max-w-md mx-auto text-ink shadow-sm">
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
          __html: jsonLdSafeStringify([
            {
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": BRAND.name,
              "description": `Family-friendly British pub just ${HEATHROW_TIMES.terminal3} minutes from Heathrow Terminal 3 with free parking.`,
              "image": "https://www.the-anchor.pub/images/page-headers/near-heathrow/heathrow-airport-view.jpg",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": CONTACT.address.street,
                "addressLocality": CONTACT.address.town,
                "addressRegion": "Surrey",
                "postalCode": "TW19 6AQ",
                "addressCountry": "GB"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": CONTACT.coordinates.lat,
                "longitude": CONTACT.coordinates.lng
              },
              "url": "https://www.the-anchor.pub/near-heathrow/terminal-3",
              "telephone": "+441753682707",
	              "priceRange": PRICE_RANGE,
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
