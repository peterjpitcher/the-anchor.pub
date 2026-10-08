import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { Metadata } from 'next'
import { TerminalNavigation } from '@/components/TerminalNavigation'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { HeroBadge } from '@/components/HeroBadge'
import { BRAND, BUS_WORDING, CONTACT, DIRECTIONS_URL, HEATHROW_DISTANCES, HEATHROW_TIMES, PARKING, PRICE_RANGE } from '@/lib/constants'
import { LUGGAGE_WORDING, PARKING_WORDING, TAXI_WORDING } from '@/lib/approved-wording'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Terminal 5 | Food & Free Parking',
  description: `Pub near Heathrow Terminal 5, ${HEATHROW_TIMES.terminal5} minutes by taxi or car. British pub food, free customer parking, dog-friendly beer garden and table booking.`,
  openGraph: {
    title: `Pubs Near Heathrow Terminal 5 | ${HEATHROW_TIMES.terminal5} Mins Away | Free Parking`,
    description: `Looking for pubs near Heathrow Terminal 5? Just ${HEATHROW_TIMES.terminal5} minutes by taxi. Free parking for ${PARKING.capacity} cars. British pub food, dog-friendly beer garden & draught beers.`,
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: `Pubs Near Heathrow Terminal 5 | ${HEATHROW_TIMES.terminal5} Mins Away | Free Parking`,
    description: `Looking for pubs near Heathrow Terminal 5? Just ${HEATHROW_TIMES.terminal5} minutes by taxi. Free parking for ${PARKING.capacity} cars. British pub food, dog-friendly beer garden & draught beers.`,
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow/terminal-5'
  }
}

export default function Terminal5Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Near Heathrow', url: '/near-heathrow' },
          { name: 'Terminal 5', url: '/near-heathrow/terminal-5' }
        ]}
      />
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/near-heathrow-terminal-5/heathrow-airport-view.jpg"
        crumb="Near Heathrow"
        title="Pub Near Heathrow Terminal 5 for Food and Free Parking"
        lead="Handy before or after a flight • Free parking • Traditional British pub"
        actions={
          <BookTableButton source="terminal_5_hero" context="terminal_5" variant="primary" size="lg" fullWidth>
            Book a Table
          </BookTableButton>
        }
      />

      <AmenityStrip/>

      {/* Quick Summary */}
      <section className="py-section-y bg-canvas">
        <div className="container mx-auto px-4">
          <div className="mx-auto bg-surface border border-line rounded-md shadow-sm p-6">
            <h2 className="font-display text-h3 text-ink-strong mb-3">Essential Details at a Glance</h2>
            <p className="text-ink-muted mb-4">
              Searching for pubs near Heathrow Terminal 5? The Anchor is the closest proper pub to Terminal 5, just {HEATHROW_TIMES.terminal5} minutes away by car. Swap hotel bars for real British hospitality, fair pint prices and free parking.
            </p>
            <div className="grid gap-3 md:grid-cols-2 text-ink-muted">
	              <div className="flex items-start gap-2">
	                <span className="font-semibold text-accent-text"></span>
	                <span>{HEATHROW_TIMES.terminal5} minute taxi or Uber from Terminal 5</span>
	              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>{PARKING_WORDING}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>Pizza, burgers and Sunday roasts from our kitchen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-accent-text"></span>
                <span>Call 01753 682707 or book online to secure tables for peak flights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Got a Layover at Terminal 5?"
        copy="Our Heathrow layover dining guide has journey times from each terminal and how much time to allow."
        primary={
          <Button asChild variant="primary" size="lg">
            <Link href="/heathrow-layover-dining">View Layover Guide</Link>
          </Button>
        }
        secondary={
          <Button asChild variant="outline" size="lg" wrap>
            <Link href="https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20Can%20you%20help%20plan%20a%20Heathrow%20layover%20meal%3F">WhatsApp Us</Link>
          </Button>
        }
      />

      {/* Food Before You Fly */}
      <section className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Need Food Near Terminal 5?"
            subtitle="Walk in or book a table. Check our kitchen times before you travel."
          />
          <div className="grid md:grid-cols-3 gap-6 mx-auto">
            <div className="bg-surface border border-line rounded-md shadow-sm p-6">
              <h3 className="text-lg font-semibold text-accent-text mb-2">Sunday Roast (Sun 1–6pm)</h3>
              <p className="text-sm text-ink-muted mb-4">
                Walk in 1pm-6pm or book ahead - Yorkshire puddings, crispy potatoes and homemade gravy before your flight.
              </p>
              <div className="flex flex-col gap-2">
                <BookTableButton
                  source="terminal5_roast_cta"
                  variant="primary"
                  size="sm"
                >
                  Book Roast Table
                </BookTableButton>
                <Link href="/sunday-roast" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                  Sunday roast {HEATHROW_TIMES.terminal5} minutes from Terminal 5 →
                </Link>
              </div>
            </div>
            <div className="bg-surface border border-line rounded-md shadow-sm p-6">
              <h3 className="text-lg font-semibold text-accent-text mb-2">Stone-Baked Pizzas</h3>
              <p className="text-sm text-ink-muted mb-4">
                Hand-stretched pizzas with bold toppings, perfect for crew nights, family send-offs or late layovers.
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
                <Link href="/food-menu#pizza" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                  View pizza menu →
                </Link>
              </div>
            </div>
            <div className="bg-surface border border-line rounded-md shadow-sm p-6">
              <h3 className="text-lg font-semibold text-accent-text mb-2">Pub Menu</h3>
              <p className="text-sm text-ink-muted mb-4">
                Burgers, fish & chips, pizzas and veggie options, handy if you&apos;re staying at a Terminal 5 hotel.
              </p>
              <div className="flex flex-col gap-2">
                <BookTableButton
                  source="terminal5_food_cta"
                  variant="primary"
                  size="sm"
                >
                  Book a Table
                </BookTableButton>
                <Link href="/food-menu" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                  Browse full menu →
                </Link>
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
      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Pubs Near Heathrow Terminal 5, The Anchor
          </h2>
        </Container>
      </section>

      {/* Quick Info Cards */}
      <section className="py-section-y bg-canvas">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
            {[
              { title: `${HEATHROW_TIMES.terminal5} mins`, description: 'by car' },
              { title: 'Free', description: 'parking' },
              { title: 'Real', description: 'British pub' },
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

      {/* Terminal Navigation */}
      <section className="py-section-y bg-canvas">
        <div className="container mx-auto px-4">
          <TerminalNavigation currentTerminal="5" />
        </div>
      </section>

      {/* Detailed Directions */}
      <section id="directions" className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="mx-auto">
            <SectionHeading
              title="How to Get Here from Terminal 5"
              align="center"
            />

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* By Car */}
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">By Car ({HEATHROW_TIMES.terminal5} minutes)</h3>
                <div className="p-4 bg-surface-sunk rounded-sm border border-line">
                  <p className="font-semibold text-accent-text">Sat Nav:</p>
                  <p className="text-lg">TW19 6AQ</p>
                </div>
              </div>

              {/* By Taxi */}
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">By Taxi/Uber</h3>
                <div className="space-y-4 text-ink-muted">
	                  <div className="bg-surface-sunk p-4 rounded-sm border border-line">
	                    <p className="font-semibold text-lg text-anchor-success mb-1">{HEATHROW_TIMES.terminal5} minutes</p>
	                    <p className="text-sm text-ink-muted">{HEATHROW_DISTANCES.terminal5}</p>
	                  </div>
                  <div>
                    <p className="font-semibold mb-2">Tell your driver:</p>
                    <p className="italic">&quot;The Anchor pub, Horton Road, Stanwell Moor, TW19 6AQ&quot;</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Pick-up Points:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>Arrivals:</strong> Taxi rank outside</li>
                      <li>• <strong>Departures:</strong> Level 1, follow taxi signs</li>
                      <li>• <strong>Uber:</strong> Short Stay Car Park Level 4</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-anchor-success/10 rounded-sm border border-anchor-success/30">
                    <p className="font-semibold text-anchor-success mb-1">Return taxi</p>
                    <p className="text-sm text-ink-muted">{TAXI_WORDING}</p>
                  </div>
                </div>
              </div>

              {/* By Bus */}
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">By Bus</h3>
                <p className="text-ink-muted">{BUS_WORDING}</p>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-surface border border-line rounded-md shadow-sm p-8 text-center border border-anchor-gold-dark/15">
              <h3 className="font-display text-h3 text-ink-strong mb-4">Interactive Map</h3>
              <p className="text-ink-muted mb-6">
                Click below for turn-by-turn directions from Terminal 5
              </p>
              <DirectionsButton
                href={DIRECTIONS_URL}
                source="terminal_5_directions"
                variant="primary"
                size="lg"
                fromLocation="Heathrow Terminal 5"
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
              title="Why Terminal 5 Travellers Choose The Anchor"
              subtitle="Proper pub food and free parking, minutes from the terminal"
              align="center"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'A Short Drive Away', content: `We're ${HEATHROW_TIMES.terminal5} minutes from Terminal 5 by car. Wherever you're flying to, enjoy a proper British welcome first.` },
                { title: 'Great Value Pub Food', content: 'Proper British pub meals, stone-baked pizzas, burgers, fish & chips, and Sunday roasts. Real food, generous portions, in a relaxed village pub setting.' },
                { title: 'Free Parking for Patrons', content: PARKING_WORDING },
                { title: 'Pre-Flight Dining', content: 'Start your holiday right. Relax in our beer garden, enjoy a proper meal, then head to T5 refreshed and ready - not rushed and hungry.' }
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

      {/* Terminal 5 Specific Info */}
      <section className="py-section-y bg-surface">
        <div className="container mx-auto px-4">
          <div className="mx-auto">
            <SectionHeading
              title="Terminal 5 Travel Tips"
              align="center"
            />

            <div className="bg-surface border border-line rounded-md shadow-sm p-8 mb-8">
              <h3 className="font-display text-h3 text-ink-strong mb-4">Getting Back to Terminal 5</h3>
              <ul className="space-y-1 text-ink-muted text-sm">
                <li>• Allow {HEATHROW_TIMES.terminal5} minutes by car from The Anchor, and more if the traffic is heavy</li>
                <li>• Check your airline&apos;s advice on when to be at the terminal</li>
                <li>• {TAXI_WORDING}</li>
                <li>• {LUGGAGE_WORDING}</li>
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
              title="Staying at a Terminal 5 Hotel?"
              subtitle="Escape the hotel restaurant for an authentic British pub experience"
              align="center"
            />

            <div className="mb-12">
              <p className="text-center text-lg text-ink-muted mx-auto">
                If you're staying at the Sofitel, the Hilton, or any T5 hotel,
                The Anchor offers the perfect escape from generic hotel dining.
                Experience a real British family pub where locals have gathered for over 250 years.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">
                  Sofitel Terminal 5 Guests
                </h3>
                <p className="text-ink-muted mb-4">
                  A short taxi ride from your hotel, The Anchor offers a genuine
                  alternative to hotel dining with traditional British pub fare.
                </p>
                <ul className="space-y-2 text-ink-muted mb-6">
                  <li className="flex gap-2">
                    <span className="text-accent-text"></span>
                    <span>Fair village prices, shown on our live menu</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text"></span>
                    <span>Authentic British atmosphere</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text"></span>
                    <span>Meet real locals, not just travellers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text"></span>
                    <span>Draught lagers, bottled ales & home-cooked food</span>
                  </li>
                </ul>
              </div>

              <div className="bg-surface border border-line rounded-md shadow-sm p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-4">
                  Hilton T5 Guests
                </h3>
                <p className="text-ink-muted mb-4">
                  Why settle for another chain restaurant meal? Your Hilton is a
                  short taxi ride from genuine British hospitality.
                </p>
                <ul className="space-y-2 text-ink-muted mb-6">
                  <li className="flex gap-2">
                    <span className="text-accent-text"></span>
                    <span>Draught beers and ciders</span>
                  </li>
	                  <li className="flex gap-2">
	                    <span className="text-accent-text"></span>
	                    <span>Stone-baked pizzas from the live menu</span>
	                  </li>
	                  <li className="flex gap-2">
	                    <span className="text-accent-text"></span>
		                    <span>Sunday roasts that locals queue for - walk in 1pm-6pm or book ahead (groups of 15+ pay a £10 per person deposit)</span>
		                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text"></span>
                    <span>Garden terrace for sunny days</span>
                  </li>
                </ul>
                <p className="text-sm text-ink-muted italic">
                  Perfect for business travellers looking for local atmosphere
                </p>
              </div>
            </div>

            <div className="bg-surface border border-line rounded-md shadow-sm p-8 mb-8">
              <h3 className="font-display text-h3 text-ink-strong mb-4 text-center">
                Getting Here from Your Hotel
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
	                <div className="text-center">
	                  <p className="font-semibold mb-2">By Taxi</p>
	                  <p className="font-display text-h3 text-accent-text mb-2">A short drive</p>
	                  <p className="text-sm text-ink-muted mt-2">Ask for "The Anchor, Stanwell Moor"</p>
	                </div>
	                <div className="text-center">
	                  <p className="font-semibold mb-2">By Uber</p>
	                  <p className="font-display text-h3 text-accent-text mb-2">A short drive</p>
	                  <p className="text-sm text-ink-muted mt-2">Postcode: TW19 6AQ</p>
	                </div>
              </div>
            </div>

            <div className="bg-surface border border-line rounded-xs p-8 text-center">
              <h3 className="font-display text-h3 text-ink-strong mb-4">
                Experience Real British Pub Culture
              </h3>
              <p className="text-lg text-ink mb-6 mx-auto">
                The Anchor has been serving locals and travellers for over 250 years.
                Step away from the international hotel scene and discover authentic
                British hospitality, draught lagers, bottled ales and home-cooked food in a
                genuine village pub atmosphere.
              </p>
            </div>

            <div className="mt-12 text-center">
              <p className="text-ink-muted mb-6">
                Join the savvy travellers who've discovered there's more to Heathrow
                dining than airport chains and hotel restaurants.
              </p>
              <BookTableButton
                source="terminal_5_hotel_reserve"
                context="heathrow_terminal_5_hotels"
                variant="primary"
                size="lg"
                wrap
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
          { href: '/food-menu', title: 'Food Menu', description: 'Stone-baked pizzas, burgers and Sunday roasts' },
          { href: '/drinks', title: 'Drinks Menu', description: 'Draught beers, cocktails and value pub prices near Heathrow' },
          { href: '/private-hire#enquiry', title: 'Book an Event', description: 'Reserve private space for crew briefings or celebrations' },
          { href: '/near-heathrow/terminal-3', title: 'Terminal 3 Guide', description: 'Journey times and food near Terminal 3' }
        ]}
        className="py-section-y"
      />

      <OrganicSearchClusterLinks
        cluster="pubsNearHeathrow"
        currentPath="/near-heathrow/terminal-5"
        title="More Heathrow pub options"
        intro="Compare the main Heathrow pub guide, hotel routes and directions before you book."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Heathrow Terminal 5?",
            answer: `The Anchor is just ${HEATHROW_TIMES.terminal5} minutes (${HEATHROW_DISTANCES.terminal5}) from Terminal 5, making it the closest traditional British pub to T5.`
          },
          {
            question: "Is there parking at The Anchor near Terminal 5?",
            answer: `Yes. ${PARKING_WORDING}`
          },
	          {
	            question: "Can I get a taxi from Terminal 5 to The Anchor?",
	            answer: `Yes, taxis are readily available from Terminal 5. The journey takes about ${HEATHROW_TIMES.terminal5} minutes. Tell your driver 'The Anchor, Horton Road, Stanwell Moor, TW19 6AQ'. ${BUS_WORDING}`
	          },
          {
            question: "What time should I leave The Anchor to catch my flight from T5?",
            answer: `Allow ${HEATHROW_TIMES.terminal5} minutes to drive from The Anchor to Terminal 5, plus time for traffic, parking and security. Check your airline's advice on when to be at the terminal.`
          },
          {
            question: "Can I store luggage at The Anchor between flights?",
            answer: LUGGAGE_WORDING
          },
          {
            question: "Do you welcome guests from nearby hotels?",
            answer: "Absolutely! We're popular with guests from the Sofitel, Hilton, and other Terminal 5 hotels. Many hotel guests visit us to experience authentic British pub culture and enjoy traditional food at fair village prices."
          },
	          {
	            question: "How do I get to The Anchor from my Terminal 5 hotel?",
	            answer: "From Sofitel or Hilton T5, it's a short drive by taxi or Uber. Tell the driver 'The Anchor, Stanwell Moor'."
	          },
          {
            question: "Why should I leave my hotel to eat at The Anchor?",
            answer: "Hotel restaurants serve the same international menu worldwide. At The Anchor, you'll experience genuine British hospitality, meet locals, and eat home-cooked food at fair village prices. This is the authentic Britain you came to see!"
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="See You Soon at The Anchor!"
        copy={`Just ${HEATHROW_TIMES.terminal5} minutes from Terminal 5 • Free Parking • Great British Food`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <BookTableButton source="terminal_5_cta_section" variant="primary" size="lg">Book a Table</BookTableButton>
            <PhoneButton phone={CONTACT.phone} source="terminal_5_cta_section" variant="outline" size="lg">01753 682707</PhoneButton>
            <Button asChild variant="outline" size="lg">
              <Link href="/near-heathrow">← Back to All Terminals</Link>
            </Button>
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
              "description": `The closest traditional pub to Heathrow Terminal 5 - just ${HEATHROW_TIMES.terminal5} minutes drive with free parking.`,
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
              "url": "https://www.the-anchor.pub/near-heathrow/terminal-5",
              "telephone": "+441753682707",
	              "priceRange": PRICE_RANGE,
              "servesCuisine": ["British", "Pub Food"],
              "nearbyLocation": {
                "@type": "Airport",
                "name": "Heathrow Terminal 5",
                "iataCode": "LHR"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "TravelAction",
              "name": "Travel from Heathrow Terminal 5 to The Anchor",
              "agent": {
                "@type": "Person",
                "name": "Heathrow Traveller"
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
              "distance": HEATHROW_DISTANCES.terminal5,
              "instrument": [
                {
                  "@type": "Vehicle",
                  "name": "Car",
                  "description": `${HEATHROW_TIMES.terminal5} minutes drive, free parking`
                },
	                {
	                  "@type": "Vehicle",
	                  "name": "Taxi",
	                  "description": `${HEATHROW_TIMES.terminal5} minutes`
	                },
	                {
	                  "@type": "Vehicle",
	                  "name": "Bus",
	                  "description": BUS_WORDING
	                }
              ]
            }
          ])
        }}
      />
    </>
  )
}
