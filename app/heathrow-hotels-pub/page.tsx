import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { WeekHours } from '@/components/WeekHours'
import { getBusinessHoursSnapshot } from '@/lib/api'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES, HEATHROW_TIMES_WORDING, BUS_WORDING, PRICE_RANGE, DIRECTIONS_URL } from '@/lib/constants'
import { CHARGING_WORDING, LUGGAGE_WORDING, PARKING_WORDING, ROOM_HIRE_WORDING, TAXI_WORDING, ULEZ_WORDING } from '@/lib/approved-wording'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { DirectionsButton } from '@/components/DirectionsButton'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Hotels | Food, Beer & Free Parking',
  description: `Traditional Surrey pub minutes from Heathrow hotels. Free parking, British pub food, draught beer, WiFi and an easy taxi from Terminal 5 hotels.`,
  openGraph: {
    title: 'The Anchor - Traditional Pub Near Heathrow Hotels',
    description: 'Swap the hotel restaurant for an authentic British pub with free parking, just minutes from Heathrow hotels.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'The Anchor - Traditional Pub Near Heathrow Hotels',
    description: 'Swap the hotel restaurant for an authentic British pub with free parking, just minutes from Heathrow hotels.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/heathrow-hotels-pub'
  }
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "BarOrPub"],
  "@id": "https://www.the-anchor.pub/heathrow-hotels-pub#business",
  "name": BRAND.name,
  "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": CONTACT.address.street,
    "addressLocality": CONTACT.address.town,
    "addressRegion": "Surrey",
    "postalCode": CONTACT.address.postcode,
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": CONTACT.coordinates.lat,
    "longitude": CONTACT.coordinates.lng
  },
  "areaServed": [
    {
      "@type": "Place",
      "name": "Heathrow Airport Hotels"
    },
    {
      "@type": "Place",
      "name": "Terminal 5 Hotels"
    },
    {
      "@type": "Place",
      "name": "Terminal 4 Hotels"
    },
    {
      "@type": "Place",
      "name": "Bath Road Hotels"
    }
  ],
  "priceRange": PRICE_RANGE,
  "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
  "telephone": CONTACT.phoneIntl,
  "url": "https://www.the-anchor.pub/heathrow-hotels-pub"
}

export default async function HeathrowHotelsPubPage() {
  // Server-fetched so the seven-day table is in the initial HTML, not a loading
  // placeholder. Cached snapshot, so this page stays static.
  const businessHours = await getBusinessHoursSnapshot()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Near Heathrow', url: '/near-heathrow' },
          { name: 'Pub Near Heathrow Hotels', url: '/heathrow-hotels-pub' }
        ]}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/hotel-near-heathrow/find-us.jpg"
        crumb="Hotels"
        title="A Proper Pub Near Your Heathrow Hotel"
        lead="Traditional British pub just minutes from your hotel"
        actions={
          <BookTableButton source="heathrow_hotels_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

      <AmenityStrip/>

      {/* Page Title */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <h2 className="font-display text-h2 text-ink-strong mb-4">
              Heathrow Hotels Pub - Traditional Pub Near Heathrow Hotels
            </h2>
            <p className="text-lg text-ink-muted">
              Swap the hotel restaurant for authentic British pub dining just minutes away
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="The Perfect Escape from Hotel Dining"
              subtitle="Had enough of hotel restaurants and room service? The Anchor offers authentic British pub atmosphere, fair village prices and proper portions - just a short taxi or drive from any Heathrow hotel."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { title: 'Fair Village Prices', description: 'Every price is on our live menu' },
                { title: 'Free Parking', description: `${PARKING.capacity} free spaces right outside` },
                { title: 'Real Experience', description: 'Authentic British pub, not a chain hotel restaurant' }
              ].map(feature => (
                <Card key={feature.title} accent hover>
                  <CardBody>
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                    <p className="text-ink-muted">{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Hotel Distances */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Minutes from Major Heathrow Hotels"
            />

            <div className="bg-surface border border-line rounded-md shadow-sm p-6">
              <h3 className="font-display text-h4 text-ink-strong mb-4">Heathrow Hotels Near Us</h3>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <li className="font-medium">Sofitel</li>
                <li className="font-medium">Premier Inn</li>
                <li className="font-medium">Travelodge</li>
                <li className="font-medium">Hilton</li>
                <li className="font-medium">Marriott</li>
                <li className="font-medium">Crowne Plaza</li>
                <li className="font-medium">ibis</li>
                <li className="font-medium">Renaissance</li>
              </ul>
              <p className="mt-4 text-sm text-ink-muted">
                A short taxi ride or an easy drive, with free parking. We&apos;re {HEATHROW_TIMES.rangeWords} from the terminals by car.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Hotel Guests Choose Us */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Why Heathrow Hotel Guests Love The Anchor"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Escape Hotel Life</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>Real pub atmosphere</strong> - Not another sterile hotel bar
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>Meet locals</strong> - Experience genuine British hospitality
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>Proper portions</strong> - Cooked to order at fair village prices
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>Entertainment</strong> - Quiz nights, hosted nights like Music Bingo with Nikki Manfadge.{' '}
                      <Link href="/whats-on" className="font-semibold text-accent-text underline underline-offset-2">See what&apos;s on</Link>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Perfect for Travellers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>Layover dining</strong> - A proper pub meal between flights
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>Pre-flight meals</strong> - Proper dinner before early flights
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>Luggage storage</strong> - Ask the bar team when you arrive
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>All major cards</strong> - Including American Express
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <Card accent className="text-center">
              <CardBody>
                <p className="text-lg text-ink-muted">{ULEZ_WORDING}</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Hotel Guest Favourites */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Hotel Guest Favourites"
            />

	            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Draught Beers</h3>
                  <p className="text-ink-muted">Draught lagers, with bottled ales behind the bar. See the drinks menu</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Fish & Chips</h3>
                  <p className="text-ink-muted">Classic British meal hotel guests always request, a proper pub classic</p>
                </CardBody>
              </Card>
              <Card accent hover>
                <CardBody>
                  <h3 className="font-display text-h4 text-ink-strong mb-2">Sunday Roast</h3>
                  <p className="text-ink-muted">Must-try British tradition for Sunday visitors, from the current menu</p>
                </CardBody>
              </Card>
            </div>

            <Card accent>
              <CardBody className="p-8">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Business Travellers Love Us</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold text-ink-strong mb-2">Expense-Friendly</p>
                    <ul className="space-y-1 text-ink-muted text-sm">
                      <li>• Full VAT receipts provided</li>
                      <li>• Honest pub pricing</li>
                      <li>• Proper business atmosphere</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-ink-strong mb-2">Work-Friendly</p>
                    <ul className="space-y-1 text-ink-muted text-sm">
                      <li>• Free WiFi throughout</li>
                      <li>• Quiet corners available</li>
                      <li>• {CHARGING_WORDING}</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Transport Options */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Getting Here from Your Hotel"
            />

            <div className="grid md:grid-cols-3 gap-6">
	              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
	                <h3 className="font-display text-h4 text-ink-strong mb-3"> By Taxi</h3>
	                <ul className="space-y-2 text-ink-muted">
	                  <li>• A short ride from most hotels</li>
	                  <li>• Ask for {BRAND.name}, {CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}</li>
	                  <li>• {TAXI_WORDING}</li>
	                </ul>
	              </div>

              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3"> Rental Car</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>• {PARKING.capacity} free spaces</li>
                  <li>• Postcode: {CONTACT.address.postcode}</li>
                  <li>• Outside the ULEZ zone</li>
                </ul>
              </div>

              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3"> Public Transport</h3>
                <p className="text-ink-muted">{BUS_WORDING}</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg text-ink-muted mb-4">
                It&apos;s a short journey for a proper pub meal. Our prices are on the live menu, and parking is free.
              </p>
              <DirectionsButton href={DIRECTIONS_URL} source="heathrow_hotels_directions" variant="outline" size="lg">
                Get directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Special Times */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Special Times at The Anchor"
            />

            <div className="max-w-md mx-auto mb-8">
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3">Early Evening Dining</h3>
                <p className="text-2xl font-bold text-accent-text mb-2">Beat the hotel dinner rush</p>
                <p className="text-sm mt-2">Quieter atmosphere for jet-lagged guests</p>
              </div>
            </div>

            {/* No typed times: they are live in the opening hours below, and a
                typed "Kitchen from 6pm" outlived the switch to lunch and dinner. */}
            <p className="text-lg text-ink-muted">
              Kitchen times vary by day.{' '}
              <Link href="#opening-hours" className="font-semibold text-accent-text underline underline-offset-2">
                See this week&apos;s kitchen hours
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      {/* Corporate Events for Airport Hotels */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Corporate Venue for Heathrow Business"
              subtitle="Perfect for airline crews, airport staff events, and international teams"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Ideal for Airport Companies</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text"></span>
                    <span><strong>{HEATHROW_TIMES.range} from the terminals</strong> - Quick access for international teams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text"></span>
                    <span><strong>Hired by the hour</strong> - {ROOM_HIRE_WORDING} Prices and menus are on the <Link href="/private-hire" className="font-semibold text-accent-text underline underline-offset-2">private hire page</Link>.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text"></span>
                    <span><strong>Free parking</strong> - Essential for staff without hotel shuttles</span>
                  </li>
                </ul>
              </div>

              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Popular Airport Events</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-accent-text mb-1"> Crew Celebrations</h4>
                    <p className="text-sm text-ink-muted">End of season parties, retirement send-offs</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-accent-text mb-1"> Airport Staff Events</h4>
                    <p className="text-sm text-ink-muted">Team meetings, training days, Christmas parties</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-accent-text mb-1"> International Teams</h4>
                    <p className="text-sm text-ink-muted">Perfect when colleagues fly in for meetings</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-accent-text mb-1"> Hotel Overflow</h4>
                    <p className="text-sm text-ink-muted">When hotel venues are fully booked</p>
                  </div>
                </div>
              </div>
            </div>

            <Card accent>
              <CardBody className="text-center">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Perfect for Airport Companies</h3>
                <p className="mb-4 text-ink-muted">
                  The dining room, the garden or the whole pub can be hired by the hour.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild variant="primary" size="md">
                    <Link href="/corporate-events">Corporate Events Info</Link>
                  </Button>
                  <PhoneButton
                    phone="01753 682707"
                    source="heathrow_hotels_corporate_quote"
                    variant="outline"
                    size="md"
                  >
                    Quick Quote
                  </PhoneButton>
                  <Button asChild variant="outline" size="md">
                    <Link href="https://wa.me/441753682707" target="_blank" rel="noopener noreferrer">WhatsApp</Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section id="opening-hours" className="scroll-mt-24 py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Opening Hours"
            />
            <Card accent>
              <CardBody>
                <WeekHours initialHours={businessHours} />
              </CardBody>
            </Card>
            <p className="mt-4 text-ink-muted text-center">
              Perfect for evening meals after hotel check-in
            </p>
          </div>
        </Container>
      </section>

      <OrganicSearchClusterLinks
        cluster="pubsNearHeathrow"
        currentPath="/heathrow-hotels-pub"
        title="More pub options near Heathrow"
        intro="Compare hotel guest, terminal and directions pages before you leave the airport or hotel."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
	          {
	            question: "How far is The Anchor from Heathrow hotels?",
	            answer: `We're a short taxi ride or drive from most Heathrow hotels. We're ${HEATHROW_TIMES_WORDING}.`
	          },
          {
            question: "Is it worth leaving my hotel to eat at The Anchor?",
            answer: "Absolutely! Hotel guests consistently tell us they love the genuine British pub experience. It's a short journey for home-cooked pub food and a village pub atmosphere."
          },
          {
            question: "Do you accommodate flight crews and business travellers?",
            answer: "Yes! We regularly serve flight crews and business travellers. We provide full VAT receipts for expenses, and have free WiFi for working."
          },
          {
            question: "Can I store luggage while dining?",
            answer: `${LUGGAGE_WORDING} It's handy if you're between hotel checkout and flight time, or if you've just arrived and your room isn't ready yet.`
          },
	          {
	            question: "What's the best way to get to The Anchor from my hotel?",
	            answer: `Most people take a taxi. Your hotel can arrange one: ask for ${BRAND.name}, ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}. If you have a rental car: ${PARKING_WORDING}`
	          },
          {
            question: "Are you open early/late for travellers?",
            answer: "We are not open for breakfast, but we are ideal for lunch, dinner or evening drinks. Our current opening and kitchen hours are shown live on this page. Many guests visit us the night before early flights or after afternoon hotel check-in."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Escape the hotel for the evening"
        copy="Real food, fair village prices, real British pub - just minutes from your hotel"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <PhoneButton phone={CONTACT.phone} source="heathrow_hotels_pub_cta" variant="primary" size="lg">Book a Table</PhoneButton>
            <Button asChild variant="outline" size="lg"><Link href="/private-hire#enquiry">Book an Event</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/food-menu">View Menu</Link></Button>
          </div>
          <p className="text-ink-muted text-sm">Free Parking • A short drive from Heathrow hotels • Outside the ULEZ zone</p>
        </div>
      </CtaBand>
    </>
  )
}
