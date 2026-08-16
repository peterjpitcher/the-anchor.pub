import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { WeekHours } from '@/components/WeekHours'
import { getBusinessHoursSnapshot } from '@/lib/api'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Hotels | Food, Beer & Free Parking',
  description: `Traditional Surrey pub minutes from Heathrow hotels. Free parking, British pub food, draught beer, WiFi and an easy taxi from Terminal 5 hotels.`,
  openGraph: {
    title: 'The Anchor - Traditional Pub Near Heathrow Hotels',
    description: 'Escape expensive hotel restaurants! Authentic British pub with free parking, just minutes from all Heathrow hotels.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'The Anchor - Traditional Pub Near Heathrow Hotels',
    description: 'Escape expensive hotel restaurants! Authentic British pub with free parking, just minutes from all Heathrow hotels.',
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
  "name": `${BRAND.name} - Near Heathrow Hotels`,
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
  "priceRange": "££",
  "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
  "telephone": CONTACT.phoneIntl,
  "url": "https://www.the-anchor.pub/heathrow-hotels-pub"
}

export default async function HeathrowHotelsPubPage() {
  // Server-fetched so the seven-day table is in the initial HTML, not a loading
  // placeholder. Cached snapshot, so this page stays static.
  const businessHours = await getBusinessHoursSnapshot()

  const directionsSchema = generateHowToDirectionsSchema(
    'Heathrow Hotels',
    'The Anchor - Heathrow Pub & Dining',
    [
      'From Terminal 5 hotels (Premier Inn, Sofitel), take A3044',
      'Head east on Northern Perimeter Road',
      'Turn left onto Horton Road',
      'Continue for 1.5 miles',
      'The Anchor is on your right with free parking',
      'Alternative: From Bath Road hotels, take A4 to Horton Road'
    ]
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
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
        title="Escape Heathrow Hotel Prices"
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
              Escape hotel prices and enjoy authentic British pub dining just minutes away
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
              subtitle="Tired of overpriced hotel restaurants and room service? The Anchor offers authentic British pub atmosphere, honest prices, and proper portions - just a short taxi or drive from any Heathrow hotel."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { title: 'Great Value', description: 'Honest pub pricing with current menu prices' },
                { title: 'Free Parking', description: '20 spaces - no hourly charges like hotel car parks' },
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

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Terminal 5 Area Hotels</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-sofitel-heathrow" className="font-medium hover:text-accent-text transition-colors">Sofitel London Heathrow</Link>
                    <span className="text-accent-text font-bold">7 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-premier-inn-heathrow" className="font-medium hover:text-accent-text transition-colors">Premier Inn T5</Link>
                    <span className="text-accent-text font-bold">8 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-travelodge-heathrow" className="font-medium hover:text-accent-text transition-colors">Travelodge Heathrow</Link>
                    <span className="text-accent-text font-bold">10 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-hilton-heathrow" className="font-medium hover:text-accent-text transition-colors">Hilton London Heathrow</Link>
                    <span className="text-accent-text font-bold">10 mins</span>
                  </li>
                </ul>
	                <p className="mt-4 text-sm text-ink-muted">
	                  £10-15 taxi fare or easy drive with free parking
	                </p>
              </div>

              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Bath Road & T4 Area Hotels</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-marriott-heathrow" className="font-medium hover:text-accent-text transition-colors">Marriott London Heathrow</Link>
                    <span className="text-accent-text font-bold">12 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-crowne-plaza-heathrow" className="font-medium hover:text-accent-text transition-colors">Crowne Plaza Heathrow</Link>
                    <span className="text-accent-text font-bold">12 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-radisson-blu-heathrow" className="font-medium hover:text-accent-text transition-colors">Radisson Blu Heathrow</Link>
                    <span className="text-accent-text font-bold">12 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-holiday-inn-heathrow" className="font-medium hover:text-accent-text transition-colors">Holiday Inn Heathrow</Link>
                    <span className="text-accent-text font-bold">12 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-ibis-heathrow" className="font-medium hover:text-accent-text transition-colors">ibis London Heathrow</Link>
                    <span className="text-accent-text font-bold">12 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-novotel-heathrow" className="font-medium hover:text-accent-text transition-colors">Novotel London Heathrow</Link>
                    <span className="text-accent-text font-bold">15 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <Link href="/pub-near-renaissance-heathrow" className="font-medium hover:text-accent-text transition-colors">Renaissance London Heathrow</Link>
                    <span className="text-accent-text font-bold">12 mins</span>
                  </li>
                </ul>
	                <p className="mt-4 text-sm text-ink-muted">
	                  £12-18 taxi fare - worth every penny for the savings!
	                </p>
              </div>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Hotel Shuttle Tip</h3>
                <p className="text-lg text-ink-muted">
                  Some hotels offer area shuttles - ask reception if they go near Stanwell Moor!
                </p>
              </CardBody>
            </Card>
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
                      <strong>Proper portions</strong> - Not tiny hotel plates at huge prices
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>Entertainment</strong> - Quiz nights, hosted nights like Music Bingo with Nikki Manfadge, live atmosphere (see /whats-on)
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
                      <strong>Layover dining</strong> - Better than airport or hotel food
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
                      <strong>Luggage storage</strong> - We'll keep bags safe while you eat
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl"></span>
                    <div>
                      <strong>All currencies</strong> - Cards welcome, including Amex
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <Card accent className="text-center">
              <CardBody>
                <h3 className="font-display text-h4 text-ink-strong mb-2">Outside ULEZ Zone</h3>
                <p className="text-lg text-ink-muted">
                  No extra charges - perfect if you&apos;re renting a car from the airport!
                </p>
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
                  <p className="text-ink-muted">Try proper British beer - not just hotel lagers. From the drinks menu</p>
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
                      <li>• Honest pub pricing, current menu prices</li>
                      <li>• Proper business atmosphere</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-ink-strong mb-2">Work-Friendly</p>
                    <ul className="space-y-1 text-ink-muted text-sm">
                      <li>• Free WiFi throughout</li>
                      <li>• Quiet corners available</li>
                      <li>• Power outlets in dining room</li>
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
	                  <li>• £10-15 from most hotels</li>
	                  <li>• 7-12 minute journey</li>
	                  <li>• Ask for "The Anchor - Heathrow Pub & Dining"</li>
	                  <li>• Return taxi easily arranged</li>
	                </ul>
	              </div>

              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3"> Rental Car</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>• Free parking at pub</li>
                  <li>• Easy route from all hotels</li>
                  <li>• Postcode: TW19 6AQ</li>
                  <li>• Outside ULEZ zone</li>
                </ul>
              </div>

              <div className="bg-surface border border-line rounded-md shadow-sm p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3"> Public Transport</h3>
                <ul className="space-y-2 text-ink-muted">
                  <li>• Bus 442 from some hotels</li>
                  <li>• Ask hotel concierge</li>
                  <li>• Or combine with short taxi</li>
                  <li>• Worth it for the savings!</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg text-ink-muted mb-4">
                Most hotel guests say the short journey is absolutely worth it for the authentic
                experience and massive savings compared to hotel dining!
              </p>
              <Link href="/find-us">
                <Button variant="outline" size="lg">
                  Get Detailed Directions
                </Button>
              </Link>
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
                <p className="text-2xl font-bold text-accent-text mb-2">Kitchen from 6pm</p>
                <p className="text-ink-muted">Beat the hotel dinner rush</p>
                <p className="text-sm mt-2">Quieter atmosphere for jet-lagged guests</p>
              </div>
            </div>

            <p className="text-lg text-ink-muted">
              Kitchen closes at 9pm Tuesday-Friday, 7pm Saturday, 5pm Sunday
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
                    <span><strong>7 minutes from terminals</strong> - Quick access for international teams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text"></span>
                    <span><strong>Airline crew events</strong> - Regular venue for BA, Virgin, Emirates teams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text"></span>
                    <span><strong>No hotel markups</strong> - Corporate rates, not inflated airport prices</span>
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
                  We understand the unique needs of airport businesses.
                  Flexible timing for shift patterns and crew requirements.
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
                    <Link href="https://wa.me/441753682707?text=Hi,%20we" target="_blank" rel="noopener noreferrer">WhatsApp</Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-surface">
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
	            answer: "We're just 7-12 minutes by car from most Heathrow hotels. Terminal 5 hotels like Premier Inn and Sofitel are closest (7-8 mins), while Bath Road hotels take about 10-12 minutes. A taxi costs £10-15 each way."
	          },
          {
            question: "Is it worth leaving my hotel to eat at The Anchor?",
            answer: "Absolutely! Hotel guests consistently tell us they love the genuine British pub experience. The short journey is worth it for better food and an authentic atmosphere you won't find in a hotel restaurant."
          },
          {
            question: "Do you accommodate flight crews and business travellers?",
            answer: "Yes! We regularly serve flight crews and business travellers. We provide full VAT receipts for expenses, have free WiFi for working, and understand the needs of travellers including flexible dining times and quick service when needed."
          },
          {
            question: "Can I store luggage while dining?",
            answer: "Yes, we offer secure luggage storage for diners. This is perfect if you're between hotel checkout and flight time, or if you've just arrived and your room isn't ready yet."
          },
	          {
	            question: "What's the best way to get to The Anchor from my hotel?",
	            answer: "Most guests take a taxi (£10-15, 7-12 minutes). If you have a rental car, we have free parking. Some hotels are on the 442 bus route which stops near us. The hotel concierge can arrange transport - just ask for 'The Anchor in Stanwell Moor, TW19 6AQ'."
	          },
          {
            question: "Are you open early/late for travellers?",
            answer: "We are not open for breakfast, but we are ideal for lunch at weekends, dinner or evening drinks. Our current opening and kitchen hours are shown live on this page. Many guests visit us the night before early flights or after afternoon hotel check-in."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Escape Hotel Prices Tonight"
        copy="Real food, real prices, real British pub - just minutes from your hotel"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <PhoneButton phone={CONTACT.phone} source="heathrow_hotels_pub_cta" variant="primary" size="lg">Book a Table</PhoneButton>
            <Button asChild variant="outline" size="lg"><Link href="/private-hire#enquiry">Book an Event</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/food-menu">View Menu</Link></Button>
          </div>
          <p className="text-anchor-cream-text/80 text-sm">Free Parking • 7-12 mins from all major hotels • Outside ULEZ Zone</p>
        </div>
      </CtaBand>
    </>
  )
}
