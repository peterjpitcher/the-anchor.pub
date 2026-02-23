import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: `Heathrow Hotels Pub Near Me | ${BRAND.name} - Surrey Pub Escape`,
  description: `Traditional Surrey pub minutes from Heathrow hotels. Free parking in Surrey countryside, authentic British food, real ale. Escape airport hotel prices.`,
  keywords: 'heathrow hotels pub surrey, pub near heathrow hotels, surrey pub near premier inn heathrow, pub near holiday inn heathrow, surrey countryside escape',
  openGraph: {
    title: 'The Anchor - Traditional Pub Near Heathrow Hotels',
    description: 'Escape expensive hotel restaurants! Authentic British pub with free parking, just minutes from all Heathrow hotels.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
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
  "priceRange": "moderate",
  "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
  "telephone": CONTACT.phoneIntl,
  "url": "https://www.the-anchor.pub/heathrow-hotels-pub"
}

export default function HeathrowHotelsPubPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Heathrow Hotels Pub', url: '/heathrow-hotels-pub' }
  ])

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/heathrow-hotels-pub"
        title="Escape Heathrow Hotel Prices"
        description="Traditional British pub just minutes from your hotel"
        variant="default"
        primaryCta={
          <BookTableButton
            source="heathrow_hotels_pub_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="heathrow_hotels_local"
          >
            📅 Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              🍽️ View Menu
            </Button>
          </Link>
        }
      />

      {/* Page Title */}
      <section className="py-8 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-green mb-4"
            >
              Heathrow Hotels Pub - Traditional Pub Near Heathrow Hotels
            </PageTitle>
            <p className="text-lg text-gray-700">
              Escape hotel prices and enjoy authentic British pub dining just minutes away
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="The Perfect Escape from Hotel Dining"
              subtitle="Tired of overpriced hotel restaurants and room service? The Anchor offers authentic British pub atmosphere, honest prices, and proper portions - just a short taxi or drive from any Heathrow hotel."
            />
            
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "💰",
                  title: "50% Less",
                  description: "Than hotel restaurant prices for the same quality meal",
                  variant: "colored",
                  color: "bg-red-50",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "🚗",
                  title: "Free Parking",
                  description: "20 spaces - no hourly charges like hotel car parks",
                  variant: "colored",
                  color: "bg-green-50",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "🇬🇧",
                  title: "Real Experience",
                  description: "Authentic British pub, not a chain hotel restaurant",
                  variant: "colored",
                  color: "bg-blue-50",
                  className: "rounded-xl p-6 text-center"
                }
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Hotel Distances */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Minutes from Major Heathrow Hotels"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">Terminal 5 Area Hotels</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Sofitel London Heathrow</span>
                    <span className="text-anchor-gold font-bold">7 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Premier Inn T5</span>
                    <span className="text-anchor-gold font-bold">8 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Hilton Garden Inn</span>
                    <span className="text-anchor-gold font-bold">9 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Travelodge T5</span>
                    <span className="text-anchor-gold font-bold">8 mins</span>
                  </li>
                </ul>
	                <p className="mt-4 text-sm text-gray-600">
	                  GBP 10-12 taxi fare or easy drive with free parking
	                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">Bath Road & T4 Hotels</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Holiday Inn T4</span>
                    <span className="text-anchor-gold font-bold">10 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Radisson RED</span>
                    <span className="text-anchor-gold font-bold">12 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Marriott Heathrow</span>
                    <span className="text-anchor-gold font-bold">11 mins</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Renaissance Hotel</span>
                    <span className="text-anchor-gold font-bold">12 mins</span>
                  </li>
                </ul>
	                <p className="mt-4 text-sm text-gray-600">
	                  GBP 12-15 taxi fare - worth it for the savings!
	                </p>
              </div>
            </div>
            
            <AlertBox
              variant="info"
              title="Hotel Shuttle Tip"
              className="mt-8 text-center"
              content={
                <p className="text-lg">
                  Some hotels offer area shuttles - ask reception if they go near Stanwell Moor!
                </p>
              }
            />
          </div>
        </Container>
      </section>

      {/* Why Hotel Guests Choose Us */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Why Heathrow Hotel Guests Love The Anchor"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-anchor-green mb-4">Escape Hotel Life</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Real pub atmosphere</strong> - Not another sterile hotel bar
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Meet locals</strong> - Experience genuine British hospitality
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Proper portions</strong> - Not tiny hotel plates at huge prices
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Entertainment</strong> - Quiz nights, hosted nights like Music Bingo with Nikki Manfadge, live atmosphere (see /whats-on)
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-anchor-green mb-4">Perfect for Travelers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🕐</span>
                    <div>
                      <strong>Layover dining</strong> - Better than airport or hotel food
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✈️</span>
                    <div>
                      <strong>Pre-flight meals</strong> - Proper dinner before early flights
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🧳</span>
                    <div>
                      <strong>Luggage storage</strong> - We'll keep bags safe while you eat
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🌍</span>
                    <div>
                      <strong>All currencies</strong> - Cards welcome, including Amex
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <AlertBox
              variant="success"
              title="Outside ULEZ Zone"
              className="text-center"
              content={
                <p className="text-lg">
                  No extra charges - perfect if you're renting a car from the airport!
                </p>
              }
            />
          </div>
        </Container>
      </section>

      {/* Hotel Guest Favourites */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Hotel Guest Favourites"
            />
            
	            <FeatureGrid
	              columns={3}
	              features={[
	                {
	                  icon: "🍺",
	                  title: "Real Ales",
	                  description: "Try proper British beer - not just hotel lagers. From GBP 4.80/pint",
	                  variant: "default",
	                  className: "bg-white rounded-lg p-6 shadow-md text-center"
	                },
	                {
	                  icon: "🐟",
	                  title: "Fish & Chips",
	                  description: "Classic British meal hotel guests always request. GBP 12.99 (half hotel price)",
	                  variant: "default",
	                  className: "bg-white rounded-lg p-6 shadow-md text-center"
	                },
	                {
	                  icon: "🥩",
	                  title: "Sunday Roast",
	                  description: "Must-try British tradition for Sunday visitors. From GBP 19.99",
	                  variant: "default",
	                  className: "bg-white rounded-lg p-6 shadow-md text-center"
	                }
	              ]}
	              className="mb-8"
	            />
            
            <InfoBoxGrid
              columns={1}
              boxes={[
                {
                  title: "Business Travelers Love Us",
                  content: (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-semibold mb-2">Expense-Friendly</p>
                        <ul className="space-y-1 text-gray-700 text-sm">
                          <li>• Full VAT receipts provided</li>
                          <li>• 50% less than hotel dining</li>
                          <li>• Proper business atmosphere</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Work-Friendly</p>
                        <ul className="space-y-1 text-gray-700 text-sm">
                          <li>• Free WiFi throughout</li>
                          <li>• Quiet corners available</li>
                          <li>• Power outlets in dining room</li>
                        </ul>
                      </div>
                    </div>
                  ),
                  variant: "colored",
                  color: "bg-amber-50 rounded-xl p-8"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Transport Options */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Getting Here from Your Hotel"
            />
            
            <div className="grid md:grid-cols-3 gap-6">
	              <div className="bg-gray-50 rounded-xl p-6">
	                <h3 className="text-xl font-bold mb-3">🚕 By Taxi</h3>
	                <ul className="space-y-2 text-gray-700">
	                  <li>• GBP 10-15 from most hotels</li>
	                  <li>• 7-12 minute journey</li>
	                  <li>• Ask for "The Anchor - Heathrow Pub & Dining"</li>
	                  <li>• Return taxi easily arranged</li>
	                </ul>
	              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">🚗 Rental Car</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Free parking at pub</li>
                  <li>• Easy route from all hotels</li>
                  <li>• Postcode: TW19 6AQ</li>
                  <li>• Outside ULEZ zone</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">🚌 Public Transport</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Bus 442 from some hotels</li>
                  <li>• Ask hotel concierge</li>
                  <li>• Or combine with short taxi</li>
                  <li>• Worth it for the savings!</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-lg text-gray-700 mb-4">
                Most hotel guests say the short journey is absolutely worth it for the authentic 
                experience and massive savings compared to hotel dining!
              </p>
              <Link href="/find-us">
                <Button variant="secondary" size="lg">
                  Get Detailed Directions
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Special Times */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Special Times at The Anchor"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-800 mb-3">Tuesday Pizza Deal</h3>
                <p className="text-4xl font-bold text-red-600 mb-2">BUY 1 GET 1 FREE</p>
                <p className="text-gray-700">All pizzas, all day Tuesday</p>
                <p className="text-sm mt-2">Perfect for sharing with travel companions!</p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Early Evening Dining</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">Kitchen from 6pm</p>
                <p className="text-gray-700">Beat the hotel dinner rush</p>
                <p className="text-sm mt-2">Quieter atmosphere for jet-lagged guests</p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700">
              Kitchen closes at 9pm Tuesday-Friday, 7pm Saturday, 5pm Sunday
            </p>
          </div>
        </Container>
      </section>

      {/* Corporate Events for Airport Hotels */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Corporate Venue for Heathrow Business"
              subtitle="Perfect for airline crews, airport staff events, and international teams"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">Ideal for Airport Companies</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <span><strong>7 minutes from terminals</strong> - Quick access for international teams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <span><strong>Airline crew events</strong> - Regular venue for BA, Virgin, Emirates teams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <span><strong>No hotel markups</strong> - Corporate rates, not inflated airport prices</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <span><strong>Free parking</strong> - Essential for staff without hotel shuttles</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">Popular Airport Events</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">✈️ Crew Celebrations</h4>
                    <p className="text-sm text-gray-700">End of season parties, retirement send-offs</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">🏢 Airport Staff Events</h4>
                    <p className="text-sm text-gray-700">Team meetings, training days, Christmas parties</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">🌍 International Teams</h4>
                    <p className="text-sm text-gray-700">Perfect when colleagues fly in for meetings</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">🏨 Hotel Overflow</h4>
                    <p className="text-sm text-gray-700">When hotel venues are fully booked</p>
                  </div>
                </div>
              </div>
            </div>
            
            <AlertBox
              variant="info"
              title="Perfect for Airport Companies"
              content={
                <div className="text-center">
                  <p className="mb-4">
                    We understand the unique needs of airport businesses. 
                    Flexible timing for shift patterns and crew requirements.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/corporate-events">
                      <Button variant="primary" size="md">
                        Corporate Events Info
                      </Button>
                    </Link>
                    <PhoneButton
                      phone="01753 682707"
                      source="heathrow_hotels_corporate_quote"
                      variant="secondary"
                      size="md"
                    >
                      📞 Quick Quote
                    </PhoneButton>
                    <Link href="https://wa.me/441753682707?text=Hi,%20we" target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="md">
                        💬 WhatsApp
                      </Button>
                    </Link>
                  </div>
                </div>
              }
            />
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader
              title="Opening Hours"
            />
            <BusinessHours />
            <p className="mt-4 text-gray-600">
              Perfect for evening meals after hotel check-in
            </p>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
	          {
	            question: "How far is The Anchor from Heathrow hotels?",
	            answer: "We're just 7-12 minutes by car from most Heathrow hotels. Terminal 5 hotels like Premier Inn and Sofitel are closest (7-8 mins), while Bath Road hotels take about 10-12 minutes. A taxi costs GBP 10-15 each way."
	          },
          {
            question: "Is it worth leaving my hotel to eat at The Anchor?",
            answer: "Absolutely! Hotel guests consistently tell us they save 50% compared to hotel restaurant prices, plus you get a genuine British pub experience. The short journey is worth it for better food, authentic atmosphere, and significant savings."
          },
          {
            question: "Do you accommodate flight crews and business travelers?",
            answer: "Yes! We regularly serve flight crews and business travelers. We provide full VAT receipts for expenses, have free WiFi for working, and understand the needs of travelers including flexible dining times and quick service when needed."
          },
          {
            question: "Can I store luggage while dining?",
            answer: "Yes, we offer secure luggage storage for diners. This is perfect if you're between hotel checkout and flight time, or if you've just arrived and your room isn't ready yet."
          },
	          {
	            question: "What's the best way to get to The Anchor from my hotel?",
	            answer: "Most guests take a taxi (GBP 10-15, 7-12 minutes). If you have a rental car, we have free parking. Some hotels are on the 442 bus route which stops near us. The hotel concierge can arrange transport - just ask for 'The Anchor in Stanwell Moor, TW19 6AQ'."
	          },
          {
            question: "Are you open early/late for travelers?",
            answer: "We open at 4pm Tuesday-Friday, noon on weekends. While we're not open for breakfast, we're perfect for lunch (weekends), dinner, or evening drinks. Many guests visit us the night before early flights or after afternoon hotel check-in."
          }
        ]}
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <CTASection
        title="Escape Hotel Prices Tonight"
        description="Real food, real prices, real British pub - just minutes from your hotel"
        buttons={[
          {
            text: "📞 Book a Table",
            href: `${CONTACT.phoneHref}`,
            isPhone: true,
            phoneSource: "heathrow_hotels_pub_cta",
            variant: "secondary"
          },
          {
            text: "🎉 Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: "🍽️ View Menu",
            href: "/food-menu",
            variant: "white"
          }
        ]}
        variant="green"
        footer="Free Parking • 7-12 mins from all major hotels • Outside ULEZ Zone"
      />
    </>
  )
}
