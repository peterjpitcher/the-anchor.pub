import Link from 'next/link'
import { Button, Container, Card, CardBody, SectionHeading } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { WeekHours } from '@/components/WeekHours'
import { InteriorHero } from '@/components/hero'
import { Metadata } from 'next'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { findUsPlaceSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneLink } from '@/components/PhoneLink'
import { EmailLink } from '@/components/EmailLink'
import { PhoneButton } from '@/components/PhoneButton'
import { DirectionsLink, DirectionsButton } from '@/components/DirectionsButton'
import { CONTACT } from '@/lib/constants'

import { WhatsAppLink } from '@/components/WhatsAppLink'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'The Anchor Directions | TW19 6AQ, Near Heathrow T5',
  description: 'Directions to The Anchor, Horton Road, Stanwell Moor TW19 6AQ. Seven minutes from Heathrow T5 with free customer parking, taxi and bus details.',
  openGraph: {
    title: 'Directions to The Anchor (TW19 6AQ)',
    description: 'Driving and public transport directions from Heathrow terminals to The Anchor on Horton Road with free parking.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Directions to The Anchor (TW19 6AQ)',
    description: 'See directions from Heathrow terminals plus free parking info for The Anchor in Stanwell Moor.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/find-us'
  }
}

export default function FindUsPage() {
  const howToFromHeathrowSchema = generateHowToDirectionsSchema(
    "Heathrow Terminal 5",
    "The Anchor",
    [
      "Exit Terminal 5 following signs for M25/A30",
      "At roundabout, take A3044 towards Staines",
      "Continue straight for 1.5 miles through Stanwell",
      "Turn left onto Horton Road",
      "The Anchor is 200 yards on your right",
      "Free parking available on site"
    ]
  )


  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Find Us', url: '/find-us' }
        ]}
      />
      <SpeakableSchema />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([findUsPlaceSchema, howToFromHeathrowSchema, parkingFacilitySchema, {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Find The Anchor, Directions & Contact",
          "description": "Get directions to The Anchor on Horton Road, Stanwell Moor TW19 6AQ. Seven minutes from Heathrow Terminal 5 with free parking.",
          "url": "https://www.the-anchor.pub/find-us",
          "mainEntity": { "@id": "https://www.the-anchor.pub/#business" }
        }]) }}
      />
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/find-us/find-us.jpg"
        crumb="Find Us"
        title="Find The Anchor"
        lead="Easy to find, hard to leave!"
      />

      <AmenityStrip />

      {/* Page Title for SEO */}
      <section className="py-section-y bg-canvas">
        <Container>
          <h2 className="text-center font-display text-h2 text-ink-strong">
            Find The Anchor - FREE Parking & Easy Directions from Heathrow
          </h2>
        </Container>
      </section>

      {/* Quick Info */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { title: 'Stanwell Moor', sub: 'Surrey TW19 6AQ' },
              { title: 'Bus Routes', sub: '441, 442, 555' },
              { title: 'Pool & Darts', sub: 'Games available' },
              { title: 'Entertainment', sub: 'Jukebox & more' },
              { title: 'Payment', sub: 'Cash & all cards inc. Amex' }
            ].map(item => (
              <Card key={item.title} accent className="text-center">
                <CardBody className="p-4">
                  <p className="font-semibold text-ink-strong">{item.title}</p>
                  <p className="text-sm text-ink-muted">{item.sub}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Heathrow Terminal Directions */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Heathrow Terminal to Pub in Under 12 Minutes"
              lead="Plan your route from any Heathrow terminal with taxi times, parking tips and public transport options."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Terminal 5 to The Anchor (7 mins)</h3>
                  <ul className="list-disc list-inside text-ink-muted space-y-2">
                    <li>Follow signs to exit via A3044 (Stanwell Moor Road)</li>
                    <li>Turn left onto Horton Road; pub is 200 yards on right</li>
                    <li>Taxi fare ~£18, free parking on arrival saves £20+</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Terminals 2 & 3 (11 mins)</h3>
                  <ul className="list-disc list-inside text-ink-muted space-y-2">
                    <li>Head north on Tunnel Road W to M4 Spur to A4 to A3044</li>
                    <li>Avoid multi-storey car parks; follow sat nav to TW19 6AQ</li>
                    <li>Ideal for pre-flight meals before security queues</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Terminal 4 (12 mins)</h3>
                  <ul className="list-disc list-inside text-ink-muted space-y-2">
                    <li>Take Southern Perimeter Rd to Stanwell Moor Rd</li>
                    <li>Taxis and rideshares average £22 each way</li>
                    <li>Plenty of time for a meal before evening departures</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-3">442 Bus & Hotel Shuttles</h3>
                  <ul className="list-disc list-inside text-ink-muted space-y-2">
                    <li>442 stops outside the pub connecting Staines to Heathrow</li>
                    <li>Premier Inn T5 guests can walk in 15 minutes or take local taxi</li>
                    <li>Ask your driver for The Anchor, Horton Road, Stanwell Moor</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Find Us block (spec §7.1): address card + map + WeekHours */}
      <section id="visit-us" className="py-section-y bg-surface-sunk">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Address card */}
              <Card accent>
                <CardBody>
                  <SpeakableContent selector="contact-info" priority="high">
                  <h2 className="font-display text-h3 text-ink-strong mb-4">Our Address</h2>
                  <address className="not-italic space-y-1 text-ink mb-4">
                    <p className="font-semibold text-ink-strong">The Anchor</p>
                    <p>Horton Road</p>
                    <p>Stanwell Moor</p>
                    <p className="font-semibold text-ink-strong">TW19 6AQ</p>
                  </address>

                  <div className="mt-4 pt-4 border-t border-line">
                    <p className="font-semibold text-ink-strong mb-3">Contact</p>
                    <p className="mb-2">
                      <PhoneLink
                        phone="01753682707"
                        source="find_us_contact"
                        className="text-accent-text hover:text-anchor-green"
                      />
                    </p>
                    <p className="mb-2">
                      <WhatsAppLink
                        phone="01753682707"
                        source="find_us_page"
                        className="text-accent-text hover:text-anchor-green"
                        showIcon={false}
                      >
                        WhatsApp: 01753 682707
                      </WhatsAppLink>
                    </p>
                    <p className="mb-4">
                      <EmailLink
                        email="manager@the-anchor.pub"
                        source="find_us_contact"
                        className="text-accent-text hover:text-anchor-green"
                        showIcon={true}
                      />
                    </p>
                    <DirectionsLink
                      href={`https://www.google.com/maps/dir/?api=1&destination=${CONTACT.coordinates.lat},${CONTACT.coordinates.lng}`}
                      source="find_us_section"
                    >
                      Get directions on Google Maps
                    </DirectionsLink>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line">
                    <p className="font-semibold text-ink-strong mb-3">Look out for these landmarks:</p>
                    <ul className="space-y-2 text-ink-muted">
                      <li>Centre of Stanwell Moor village</li>
                      <li>Under the Heathrow flight path</li>
                      <li>Free parking for patrons (20 spaces)</li>
                      <li>Traditional pub building with garden</li>
                    </ul>
                    <p className="mt-4 text-sm text-ink-muted italic">
                      &quot;If you can hear the planes, you&apos;re close!&quot;
                    </p>
                  </div>
                  </SpeakableContent>
                </CardBody>
              </Card>

              {/* Map */}
              <div className="overflow-hidden rounded-md shadow-lg">
                <GoogleMapEmbed query="The Anchor, Stanwell Moor" height="100%" className="min-h-[360px] h-full" />
              </div>
            </div>

            {/* Opening hours & flight path */}
            <Card accent className="mt-8">
              <CardBody>
                <h2 className="font-display text-h3 text-ink-strong mb-4">Opening hours &amp; flight path</h2>
                <SpeakableContent selector="opening-hours" priority="high">
                  <WeekHours />
                </SpeakableContent>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Directions */}
      <section className="py-section-y bg-canvas">
        <Container>
          <SectionHeading
            title="Directions from Popular Locations"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From M25</h3>
                <ol className="space-y-2 text-ink-muted list-decimal list-inside">
                  <li>Exit Junction 14</li>
                  <li>Take A3113 towards Stanwell Moor</li>
                  <li>At roundabout, continue straight</li>
                  <li>Turn left at Horton Road</li>
                  <li>The Anchor is on your right</li>
                </ol>
                <p className="mt-4 text-sm text-ink-muted">Journey time: 5 minutes from M25</p>
              </CardBody>
            </Card>

            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From Staines</h3>
                <ol className="space-y-2 text-ink-muted list-decimal list-inside">
                  <li>Head south on A30</li>
                  <li>Turn right onto A3044</li>
                  <li>Continue to Stanwell Moor</li>
                  <li>Turn right onto Horton Road</li>
                  <li>The Anchor is on your right</li>
                </ol>
                <p className="mt-4 text-sm text-ink-muted">Journey time: 10 minutes</p>
              </CardBody>
            </Card>

            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From Windsor</h3>
                <ol className="space-y-2 text-ink-muted list-decimal list-inside">
                  <li>Take A308 towards Staines</li>
                  <li>Join M25 at Junction 13</li>
                  <li>Exit at Junction 14</li>
                  <li>Follow signs to Stanwell Moor</li>
                  <li>Turn left at Horton Road</li>
                </ol>
                <p className="mt-4 text-sm text-ink-muted">Journey time: 20 minutes</p>
              </CardBody>
            </Card>

            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From Ashford</h3>
                <ol className="space-y-2 text-ink-muted list-decimal list-inside">
                  <li>Head north on A30</li>
                  <li>Turn left onto A3044</li>
                  <li>Continue through Stanwell</li>
                  <li>Turn left onto Horton Road</li>
                  <li>The Anchor is on your right</li>
                </ol>
                <p className="mt-4 text-sm text-ink-muted">Journey time: 10 minutes</p>
              </CardBody>
            </Card>

            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From Heathrow</h3>
                <p className="text-ink-muted mb-3">See our detailed terminal guides:</p>
                <ul className="space-y-2">
                  <li><Link href="/near-heathrow/terminal-2" className="text-accent-text hover:text-anchor-green">From Terminal 2</Link></li>
                  <li><Link href="/near-heathrow/terminal-3" className="text-accent-text hover:text-anchor-green">From Terminal 3</Link></li>
                  <li><Link href="/near-heathrow/terminal-4" className="text-accent-text hover:text-anchor-green">From Terminal 4</Link></li>
                  <li><Link href="/near-heathrow/terminal-5" className="text-accent-text hover:text-anchor-green">From Terminal 5</Link></li>
                </ul>
              </CardBody>
            </Card>

            <Card accent>
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-4">By Bus</h3>
                <div className="space-y-3 text-ink-muted">
                  <p><strong className="text-ink-strong">Route 442:</strong> Staines - Stanwell Moor - Heathrow</p>
                  <p className="text-sm">Ask driver for The Anchor stop</p>
                  <p className="text-sm text-accent-text font-semibold">ULEZ Free Route</p>
                </div>
                <p className="mt-4 text-sm text-ink-muted">Regular service throughout the day</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Parking Information */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeading
              title="FREE Parking for Patrons - 20 Spaces Available!"
              lead="Complimentary parking while you're enjoying our food and drinks"
            />
            <Card accent>
              <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-display text-h4 text-ink-strong mb-2">ALWAYS FREE</h3>
                    <p className="text-ink-muted">Unlike Heathrow (£7.50/hour!)</p>
                  </div>
                  <div>
                    <h3 className="font-display text-h4 text-ink-strong mb-2">NO TIME LIMITS</h3>
                    <p className="text-ink-muted">Stay as long as you like!</p>
                  </div>
                  <div>
                    <h3 className="font-display text-h4 text-ink-strong mb-2">20 SPACES</h3>
                    <p className="text-ink-muted">Well-lit with CCTV coverage</p>
                  </div>
                </div>
                <div className="mt-6 bg-surface-sunk rounded-sm border border-line p-4">
                  <p className="text-ink-strong font-semibold text-lg">
                    Compare: Heathrow T5 Short Stay = £7.50/hour | The Anchor = FREE!
                  </p>
                  <p className="text-sm text-ink-muted mt-2">
                    Perfect for picking up/dropping off at Heathrow without the parking fees!
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Book Your Visit Section */}
      <section className="theme-dark bg-anchor-green py-section-y">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-h2 text-anchor-cream-text mb-2">Found us? Book your visit</h2>
            <p className="text-anchor-cream-text/85 text-lg mb-8">Reserve your table now and enjoy The Anchor experience</p>

            <Card variant="dark" accent>
              <CardBody className="p-8">
                <h3 className="font-display text-h3 text-anchor-cream-text mb-4">Ready to Book?</h3>
                <p className="text-anchor-cream-text/85 mb-8 text-lg">
                  Book your table online through our booking system or give us a call.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button asChild variant="primary" size="lg">
                    <Link href="/book-table">Book a Table Online</Link>
                  </Button>
                  <PhoneButton
                    phone="01753682707"
                    source="find_us_booking_alternative"
                    variant="outline"
                    size="lg"
                  >
                    Call: 01753 682707
                  </PhoneButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/join-our-team">Join Our Team</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-line-gold text-left">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-anchor-cream-text mb-3">Good to Know</h4>
                    <p className="text-anchor-cream-text/85 text-sm">Free parking for patrons</p>
                    <p className="text-anchor-cream-text/85 text-sm">Kitchen closed Mondays</p>
                    <p className="text-anchor-cream-text/85 text-sm">Children always welcome</p>
                    <p className="text-anchor-cream-text/85 text-sm">Dogs welcome in bar & garden</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-anchor-cream-text mb-3">Opening Hours</h4>
                    <WeekHours showKitchen={false} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Facilities */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Our Facilities"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h3 text-ink-strong mb-6">Entertainment & Games</h3>
                  <ul className="space-y-3 text-ink-muted">
                    <li><strong className="text-ink-strong">Pool Table</strong> - Challenge your friends</li>
                    <li><strong className="text-ink-strong">Darts Board</strong> - Professional setup with oche</li>
                    <li><strong className="text-ink-strong">Jukebox</strong> - Wide selection of music</li>
                    <li><strong className="text-ink-strong">Fruit Machine</strong> - Try your luck (18+)</li>
                    <li><strong className="text-ink-strong">4 TVs</strong> - Terrestrial channels for sports & news</li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h3 text-ink-strong mb-6">Work & Connectivity</h3>
                  <ul className="space-y-3 text-ink-muted">
                    <li><strong className="text-ink-strong">Free WiFi</strong> - Fast, reliable, no time limits</li>
                    <li><strong className="text-ink-strong">Power Points</strong> - Tables with plugs in dining room</li>
                    <li><strong className="text-ink-strong">Quiet Weekdays</strong> - Perfect for remote work</li>
                    <li><strong className="text-ink-strong">Free Parking for Patrons</strong> - While you visit</li>
                    <li><strong className="text-ink-strong">Luggage Storage</strong> - Safe storage for travelers</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <Card accent className="mt-8">
              <CardBody className="p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-6 text-center">Guest Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-ink-muted">
                  <div>
                    <strong className="text-ink-strong">Dog Friendly</strong>
                    <p className="text-sm">Water bowls available</p>
                  </div>
                  <div>
                    <strong className="text-ink-strong">Accessible Entry</strong>
                    <p className="text-sm">Ramp available at back door</p>
                  </div>
                  <div>
                    <strong className="text-ink-strong">All Cards Accepted</strong>
                    <p className="text-sm">Including American Express</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card accent className="mt-8">
              <CardBody className="text-center">
                <p className="text-ink-muted">
                  <strong className="text-accent-text">Digital Nomad Friendly:</strong> Our dining room is equipped with tables
                  featuring power points, making it perfect for remote workers and digital nomads. Combined with free WiFi
                  and a quiet weekday atmosphere, it&apos;s an ideal workspace near Heathrow.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <OrganicSearchClusterLinks
        cluster="workspace"
        currentPath="/find-us"
        title="Plan your route and visit"
        intro="Use these related pages for workspace, food and booking decisions once you know how to reach us."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "Is there parking at The Anchor?",
            answer: "Yes, The Anchor offers free parking for patrons while they're visiting the pub. Our car park has 20 spaces available."
          },
          {
            question: "How far is The Anchor from Heathrow Airport?",
            answer: "The Anchor is just 7 minutes from Terminal 5, 11 minutes from Terminals 2 & 3, and 12 minutes from Terminal 4. We're the closest traditional British pub to Heathrow Airport."
          },
          {
            question: "What areas does The Anchor serve?",
            answer: "We serve Stanwell Moor, Staines, Ashford, Feltham, Bedfont, and surrounding Surrey areas. We're also convenient for all Heathrow terminals and nearby hotels."
          },
          {
            question: "Is The Anchor accessible by public transport?",
            answer: "Yes! The 442 bus runs between Staines, Stanwell Moor and Heathrow, stopping nearby. This is a ULEZ-free route, making it an environmentally friendly option."
          },
	          {
	            question: "Can I walk to The Anchor from nearby hotels?",
	            answer: "If you're staying at the Premier Inn Heathrow Terminal 5, we're about a 15-minute walk. From other Heathrow hotels, we recommend a taxi (around £25) or take the 442 bus which stops directly outside the pub."
	          },
          {
            question: "What's the best way to find The Anchor?",
            answer: "If using sat nav, our postcode is TW19 6AQ. From the A3044, turn onto Horton Road and we're on your right with free parking available."
          },
          {
            question: "Is The Anchor wheelchair accessible?",
            answer: "The Anchor has a wheelchair ramp available at the back door for step-free access to the main areas. Please note that we do not currently have accessible toilet facilities."
          },
          {
            question: "What payment methods does The Anchor accept?",
            answer: "We accept cash and all major credit and debit cards, including American Express. Whether you're enjoying a meal, drinks, or booking an event, we make payment convenient with multiple options available."
          }
        ]}
        className="bg-surface"
      />

      {/* Map CTA */}
      <CtaBand
        title="Get Directions"
        copy="Use your preferred map service to navigate directly to The Anchor"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <DirectionsButton href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ" source="find_us_cta_google" variant="primary" size="lg">Google Maps</DirectionsButton>
            <DirectionsButton href="https://maps.apple.com/?q=The+Anchor+Stanwell+Moor+TW19+6AQ" source="find_us_cta_apple" variant="outline" size="lg">Apple Maps</DirectionsButton>
            <DirectionsButton href="https://www.waze.com/ul?q=The+Anchor+Stanwell+Moor+TW19+6AQ" source="find_us_cta_waze" variant="outline" size="lg">Waze</DirectionsButton>
          </div>
          <div className="rounded-xs border border-line-gold bg-anchor-green-card p-6 max-w-md mx-auto">
            <p className="font-semibold text-anchor-cream-text mb-2">Sat Nav Postcode</p>
            <p className="font-display text-h3 text-anchor-cream-text">TW19 6AQ</p>
          </div>
        </div>
      </CtaBand>
    </>
  )
}
