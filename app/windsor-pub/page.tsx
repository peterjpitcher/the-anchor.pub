import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: `Windsor Pub Alternative - Free Parking & Sunday Roast | ${BRAND.name}`,
  description: `${BRAND.name} is 15 minutes from Windsor Castle with free parking, Sunday roasts, stone-baked pizzas and countryside atmosphere outside the ULEZ zone.`,
  keywords: 'windsor pub alternative, sunday roast near windsor, free parking pub windsor, pub near windsor castle with parking, surrey village pub near windsor',
  openGraph: {
    title: 'Windsor Pub Alternative - The Anchor Stanwell Moor',
    description: '15 minutes from Windsor with free parking, Sunday roast, stone-baked pizzas and countryside atmosphere.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Windsor Pub Alternative - The Anchor Stanwell Moor',
    description: '15 minutes from Windsor with free parking, Sunday roast, stone-baked pizzas and countryside atmosphere.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/windsor-pub'
  }
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "BarOrPub"],
  "@id": "https://www.the-anchor.pub/windsor-pub#business",
  "name": `${BRAND.name} - Near Windsor`,
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
      "@type": "City",
      "name": "Windsor"
    },
    {
      "@type": "City",
      "name": "Old Windsor"
    },
    {
      "@type": "City",
      "name": "Datchet"
    },
    {
      "@type": "City",
      "name": "Eton"
    }
  ],
  "priceRange": "moderate",
  "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
  "telephone": CONTACT.phoneIntl,
  "url": "https://www.the-anchor.pub/windsor-pub"
}

export default function WindsorPubPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: 'Windsor Pub', url: '/windsor-pub' }
  ])

  const directionsSchema = generateHowToDirectionsSchema(
    'Windsor Town Centre',
    'The Anchor - Heathrow Pub & Dining',
    [
      'From Windsor town centre, head east on High Street/A308',
      'Continue onto Datchet Road/B376',
      'Turn left onto Horton Road/B376',
      'Continue for about 4 miles through Wraysbury',
      'After passing Wraysbury Station, continue on Horton Road',
      'The Anchor will be on your left with free parking'
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
        route="/windsor-pub"
        title="Traditional British Pub Near Windsor"
        description="Just 15 minutes from Windsor Castle with free parking"
        variant="default"
        primaryCta={
          <Link href={CONTACT.phoneHref} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              📞 Call to Book
            </Button>
          </Link>
        }
        secondaryCta={
          <Link href="/food-menu" className="w-full sm:w-auto">
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
              Windsor Pub - Traditional British Pub Near Windsor
            </PageTitle>
            <p className="text-lg text-gray-700">
              Your local traditional pub just 15 minutes from Windsor Castle with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Windsor's Favourite Traditional Pub Experience"
              subtitle="Just a 15-minute drive from Windsor Castle, The Anchor offers authentic British hospitality without the tourist prices. Enjoy traditional pub atmosphere, fantastic food, and a warm welcome in our historic Stanwell Moor location."
            />
            
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "🏰",
                  title: "Near Windsor",
                  description: "15 minutes from Windsor Castle via M4 or B376",
                  variant: "colored",
                  color: "bg-anchor-cream",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "💷",
                  title: "Better Value",
                  description: "Avoid Windsor tourist prices - proper pub rates",
                  variant: "colored",
                  color: "bg-anchor-cream",
                  className: "rounded-xl p-6 text-center"
                },
                {
	                  icon: "🚫",
	                  title: "ULEZ Free",
	                  description: "Save GBP 12.50 - we're outside the zone!",
	                  variant: "colored",
	                  color: "bg-anchor-cream",
	                  className: "rounded-xl p-6 text-center"
	                }
              ]}
              className="mb-8"
            />
          </div>
        </Container>
      </section>

      {/* Why Windsor Residents Choose Us */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Why Windsor Residents Love The Anchor"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-anchor-green mb-4">Worth the Journey</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Escape Windsor's tourist crowds</strong> - Peaceful village pub atmosphere
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Half the price of Windsor pubs</strong> - Genuine local pricing
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Free parking always available</strong> - No expensive Windsor parking fees
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">✓</span>
                    <div>
                      <strong>Real locals pub</strong> - Where Windsor residents go for a proper pint
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-anchor-green mb-4">Special Events & Offers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🍕</span>
                    <div>
                      <strong>Stone-baked pizzas</strong> - Hand-stretched bases with generous toppings
                    </div>
                  </li>
	                  <li className="flex items-start gap-3">
	                    <span className="text-anchor-gold text-xl">🥘</span>
	                    <div>
	                      <strong>Famous Sunday Roasts</strong> - Pre-order by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.
	                    </div>
	                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold text-xl">🎭</span>
                    <div>
                      <strong>Hosted Nights</strong> - Music Bingo with Nikki Manfadge and one-off events (see /whats-on)
                    </div>
                  </li>
	                  <li className="flex items-start gap-3">
	                    <span className="text-anchor-gold text-xl">🧠</span>
	                    <div>
	                      <strong>Quiz Nights</strong> - GBP 3 entry, great prizes, monthly events
	                    </div>
	                  </li>
                </ul>
              </div>
            </div>
            
            <AlertBox
              variant="info"
              title="Royal Connection"
              className="mt-8 text-center"
              content={
                <p className="text-lg">
                  Many castle staff and Windsor locals are regulars - discover where the real community meets!
                </p>
              }
            />
          </div>
        </Container>
      </section>

      {/* Popular with Windsor Groups */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Popular with Windsor Groups"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-800 mb-4">Regular Visitors</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Windsor Rugby Club socials</li>
                  <li>• Eton College staff gatherings</li>
                  <li>• Windsor & Eton FC supporters</li>
                  <li>• Local business networking</li>
                  <li>• Theatre Royal Windsor groups</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Perfect For</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Pre-race meals (Windsor Racecourse)</li>
                  <li>• Post-castle visit dinners</li>
                  <li>• Birthday celebrations</li>
                  <li>• Christmas parties</li>
                  <li>• Retirement gatherings</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-6">
                Private function room available for Windsor groups - from 20 to 250 guests
              </p>
              <Link href="/private-hire#enquiry">
                <Button variant="primary" size="lg">
                  Enquire About Group Bookings
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Getting Here from Windsor */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Getting to The Anchor from Windsor"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">🚗 Driving Routes</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Via M4 (Fastest)</p>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• M4 westbound to Junction 5</li>
                      <li>• A4 towards Slough</li>
                      <li>• Follow signs to Stanwell Moor</li>
                      <li>• 15 minutes in normal traffic</li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="font-semibold mb-2">Via B376 (Scenic)</p>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Through Datchet and Wraysbury</li>
                      <li>• Beautiful countryside route</li>
                      <li>• 20 minutes, avoiding motorway</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">📍 Local Landmarks</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>From Windsor Castle:</strong> 6.5 miles (15 mins)
                  </p>
                  <p className="text-gray-700">
                    <strong>From Windsor Racecourse:</strong> 5.5 miles (12 mins)
                  </p>
                  <p className="text-gray-700">
                    <strong>From Legoland:</strong> 7 miles (16 mins)
                  </p>
                  <p className="text-gray-700">
                    <strong>Near M25 Junction 14:</strong> Perfect stopover
                  </p>
                  <div className="pt-4 border-t">
                    <p className="font-semibold text-green-700">💚 Parking</p>
                    <p className="text-gray-700">20 free spaces - no time limits!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <DirectionsButton
                href="https://maps.google.com/maps?saddr=Windsor+Castle&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="windsor_directions"
                variant="secondary"
                size="md"
                fromLocation="Windsor Castle"
              >
                📍 Get Directions from Windsor
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Windsor Connection */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Windsor to The Anchor - Why We're Worth the Trip"
            />
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3">Better Than Tourist Pubs</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Authentic atmosphere</li>
                  <li>• Local prices</li>
                  <li>• Real community feel</li>
                  <li>• No tourist crowds</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3">Easy Access</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• 15 mins from Windsor</li>
                  <li>• Free parking</li>
                  <li>• Near M4 & M25</li>
                  <li>• Avoid town traffic</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3">Unique Features</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Plane spotting garden</li>
                  <li>• Monthly entertainment</li>
                  <li>• Dog friendly throughout</li>
                  <li>• Traditional games</li>
                </ul>
              </div>
            </div>
            
            <p className="text-lg text-gray-700">
              Join the many Windsor residents who've discovered their new favourite pub - 
              where you're treated like a local, not a tourist!
            </p>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader
              title="Opening Hours"
            />
            <BusinessHours />
            <p className="mt-4 text-gray-600">
              Kitchen closes earlier - check times for food service
            </p>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "How far is The Anchor from Windsor Castle?",
            answer: "The Anchor is approximately 6.5 miles from Windsor Castle, which is about a 15-minute drive via the M4 or a scenic 20-minute route through Datchet and Wraysbury via the B376."
          },
          {
            question: "Why do Windsor residents come to The Anchor instead of Windsor pubs?",
            answer: "Many Windsor locals prefer The Anchor for the authentic village pub atmosphere, significantly lower prices than tourist-focused Windsor pubs, free parking, and the chance to enjoy a proper local without the crowds. Plus, we're outside the ULEZ zone!"
          },
	          {
	            question: "Is there parking at The Anchor for Windsor visitors?",
	            answer: "Yes! We have 20 free parking spaces with no time restrictions. This is a huge advantage over Windsor where parking can cost GBP 3-4 per hour. You can relax and enjoy your visit without watching the clock."
	          },
          {
            question: "What's the best route from Windsor to avoid traffic?",
            answer: "The quickest route is via the M4 (Junction 5) which takes about 15 minutes. For a more scenic route avoiding motorways, take the B376 through Datchet and Wraysbury. Avoid rush hours (8-9am and 5-6pm) for the smoothest journey."
          },
          {
            question: "Do you get many customers from Windsor and Eton?",
            answer: "Absolutely! We have many regulars from Windsor, Old Windsor, Datchet, and Eton. Castle staff, local business people, and sports clubs often choose us for meals and events away from the tourist areas."
          },
          {
            question: "Can you accommodate large Windsor groups?",
            answer: "Yes! We regularly host groups from Windsor for birthdays, work events, and celebrations. We can accommodate groups from 20 to 250 people. Many prefer us to Windsor venues for better value and a more relaxed atmosphere."
          }
        ]}
        className="bg-white"
      />

      {/* CTA Section */}
      <CTASection
        title="Discover Windsor's Favourite Local"
        description="Just 15 minutes from the castle - where Windsor locals escape the tourists"
        buttons={[
          {
            text: "📞 Book a Table",
            href: `${CONTACT.phoneHref}`,
            variant: "secondary"
          },
          {
            text: "🎉 Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: "🎉 View Offers",
            href: "/special-offers",
            variant: "white"
          }
        ]}
        variant="green"
        footer="Just 15 minutes from Windsor • Free Parking • Outside ULEZ Zone"
      />
    </>
  )
}
