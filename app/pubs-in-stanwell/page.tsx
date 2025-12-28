import Link from 'next/link'
import { Metadata } from 'next'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { GoogleReviews } from '@/components/reviews'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_FOOD_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Pubs in Stanwell & Stanwell Moor | Traditional Local Pub | The Anchor',
  description: 'The Anchor is Stanwell Moor\'s traditional local pub. Family-friendly village pub with beer garden, free parking, and great food. Your perfect local near Heathrow.',
  keywords: 'pubs in stanwell, pubs in stanwell moor, local pub stanwell, traditional pub near heathrow, village pub surrey, family pub stanwell moor, beer garden pub stanwell',
  openGraph: {
    title: 'The Anchor - Heathrow Pub & Dining - Your Local Pub in Stanwell Moor',
    description: 'Traditional village pub serving Stanwell Moor since 1995. Great food, beer garden, free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'The Anchor - Heathrow Pub & Dining - Your Local Pub in Stanwell Moor',
    description: 'Traditional village pub serving Stanwell Moor since 1995. Great food, beer garden, free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pubs-in-stanwell'
  }
}

const localPubSchema = {
  "@context": "https://schema.org",
  "@type": "BarOrPub",
  "@id": "https://www.the-anchor.pub/pubs-in-stanwell",
  "name": "The Anchor - Traditional Pub in Stanwell Moor",
  "description": "Family-friendly local pub serving Stanwell Moor and Stanwell since 1995. Traditional British pub with great food, beer garden, and free parking.",
  "url": "https://www.the-anchor.pub",
  "image": [
    `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
    'https://www.the-anchor.pub/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg',
    `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`
  ],
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
    "latitude": 51.4592,
    "longitude": -0.5147
  },
  "telephone": "+441753682707",
  "priceRange": "££",
  "servesCuisine": ["British", "Pub Food"],
  "hasMenu": "https://www.the-anchor.pub/food-menu",
  "acceptsReservations": true,
  "publicAccess": true,
  "smokingAllowed": false,
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday"],
      "opens": "12:00",
      "closes": "23:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Tuesday", "Wednesday", "Thursday"],
      "opens": "12:00",
      "closes": "23:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Friday", "Saturday"],
      "opens": "12:00",
      "closes": "00:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday"],
      "opens": "12:00",
      "closes": "22:30"
    }
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Family Friendly", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Dog Friendly (Garden)", "value": true }
  ]
}

export default function PubsInStanwellPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localPubSchema) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/pubs-in-stanwell"
        title="Your Local Pub in Stanwell Moor"
        description="Traditional British pub serving our community since 1995"
        variant="default"
        tags={[
          { label: "🍺 Traditional Local", variant: "success" },
          { label: "👨‍👩‍👧‍👦 Family Friendly", variant: "default" },
          { label: "🌳 Beer Garden", variant: "primary" },
          { label: "🚗 Free Parking", variant: "warning" }
        ]}
        primaryCta={
          <BookTableButton
            variant="primary"
            size="lg"
            source="stanwell_pubs_hero"
            className="w-full sm:w-auto"
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
        secondaryInfo={
          <div className="bg-anchor-green/90 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-white font-bold text-lg text-center">
              ⭐ "The Heart of Stanwell Moor Village" - Serving Locals & Visitors Since 1995
            </p>
          </div>
        }
      />

      {/* Page Title for SEO */}
      <section className="bg-white py-8">
        <Container>
          <PageTitle 
            className="text-center text-anchor-green"
            seo={{ structured: true, speakable: true }}
          >
            Pubs in Stanwell & Stanwell Moor - The Anchor Traditional British Pub
          </PageTitle>
        </Container>
      </section>

      {/* Why We're Stanwell's Favourite Local */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Why The Anchor is Stanwell Moor's Favourite Local"
              subtitle="A proper British pub at the heart of our village community"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <InfoBoxGrid
                columns={1}
                boxes={[
                  {
                    title: "🏘️ A True Village Pub",
                    content: (
                      <div className="space-y-3">
                        <p className="text-gray-700">
                          Located on Horton Road in the heart of Stanwell Moor, we've been 
                          the village's gathering place for nearly 30 years. Unlike chain pubs, 
                          we're independently run with genuine local character.
                        </p>
                        <ul className="space-y-2 text-gray-700">
                          <li>✓ Family-owned and operated</li>
                          <li>✓ Know our regulars by name</li>
                          <li>✓ Support local events and causes</li>
                          <li>✓ Traditional pub atmosphere</li>
                          <li>✓ Community hub since 1995</li>
                        </ul>
                      </div>
                    ),
                    variant: "colored",
                    color: "bg-green-50 rounded-xl p-6"
                  }
                ]}
              />
              
              <InfoBoxGrid
                columns={1}
                boxes={[
                  {
                    title: "🍺 What Makes Us Special",
                    content: (
                      <div className="space-y-3">
                        <p className="text-gray-700">
                          We're not just another pub - we're your local. From our famous 
                          Sunday roasts to stone-baked pizzas, we offer something for everyone 
                          in a warm, welcoming environment.
                        </p>
                        <ul className="space-y-2 text-gray-700">
                          <li>✓ Home-cooked British food</li>
                          <li>✓ Real ales and chilled lagers</li>
                          <li>✓ Large beer garden</li>
                          <li>✓ Live entertainment</li>
                          <li>✓ Free parking always</li>
                        </ul>
                      </div>
                    ),
                    variant: "colored",
                    color: "bg-amber-50 rounded-xl p-6"
                  }
                ]}
              />
            </div>

            {/* Location Benefits */}
            <AlertBox
              variant="info"
              title="📍 Perfectly Located in Stanwell Moor"
              className="max-w-4xl mx-auto"
              content={
                <div className="mt-2">
                  <p className="text-gray-700 mb-3">
                    Easily accessible from all surrounding areas:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <ul className="space-y-1 text-sm">
                      <li>• Stanwell Village: 5 mins</li>
                      <li>• Staines: 8 mins</li>
                      <li>• Ashford: 10 mins</li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li>• Heathrow T5: 7 mins</li>
                      <li>• Feltham: 10 mins</li>
                      <li>• Sunbury: 12 mins</li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li>• M25 Junction 14: 3 mins</li>
                      <li>• Outside ULEZ zone</li>
                      <li>• 20 free parking spaces</li>
                    </ul>
                  </div>
                </div>
              }
            />
          </div>
        </Container>
      </section>

      {/* What We Offer */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Everything You Want from Your Local Pub"
              subtitle="Great food, drinks, atmosphere and more"
            />
            
            <FeatureGrid
              columns={4}
              features={[
                {
                  icon: "🍺",
                  title: "Great Drinks Selection",
                  description: "Cask ales, lagers, wines, spirits and soft drinks",
                  className: "text-center"
                },
                {
                  icon: "🍽️",
                  title: "Home-Cooked Food",
                  description: "Traditional British pub food cooked fresh daily",
                  className: "text-center"
                },
                {
                  icon: "🌳",
                  title: "Beautiful Beer Garden",
                  description: "Spacious outdoor area perfect for sunny days",
                  className: "text-center"
                },
                {
                  icon: "🎉",
                  title: "Live Entertainment",
                  description: "Drag shows, quizzes, and special events",
                  className: "text-center"
                },
                {
                  icon: "👨‍👩‍👧‍👦",
                  title: "Family Friendly",
                  description: "Children welcome with kids menu available",
                  className: "text-center"
                },
                {
                  icon: "🏆",
                  title: "Sports Coverage",
                  description: "Major sporting events on our screens",
                  className: "text-center"
                },
                {
                  icon: "🎂",
                  title: "Private Functions",
                  description: "Host your special occasions with us",
                  className: "text-center"
                },
                {
                  icon: "🚗",
                  title: "Free Parking",
                  description: "20 spaces - no parking stress",
                  className: "text-center"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Compare to Other Pubs */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="How We Compare to Other Local Pubs"
              subtitle="Why locals choose The Anchor"
            />
            
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-anchor-green mb-4">The Anchor Advantages</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <strong>Free Parking:</strong> 20 spaces always available
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <strong>Kitchen Hours:</strong> Food served lunch & dinner most days
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <strong>Outdoor Space:</strong> Large beer garden with covered area
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <strong>Value:</strong> Proper pub prices, not tourist rates
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <strong>Entertainment:</strong> Regular events and live shows
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-700 mb-4">Nearby Alternatives</h3>
                  <div className="space-y-4 text-gray-600">
                    <div>
                      <p className="font-semibold">The George (Stanwell)</p>
                      <p className="text-sm">Good pub but limited parking</p>
                    </div>
                    <div>
                      <p className="font-semibold">The Bells (Staines)</p>
                      <p className="text-sm">Town center location, paid parking</p>
                    </div>
                    <div>
                      <p className="font-semibold">Airport Pubs</p>
                      <p className="text-sm">Convenient but 3x the price</p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="font-bold text-anchor-green">
                        The Anchor offers the best combination of location, 
                        parking, food, and atmosphere
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Weekly Schedule */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Something Special Every Day"
              subtitle="Our weekly lineup of food and events"
            />
            
            <div className="grid gap-4">
              <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                <div className="text-3xl">📅</div>
                <div className="flex-1">
                  <h3 className="font-bold">Monday</h3>
                  <p className="text-gray-600">Bar open all day • Kitchen closed • Perfect for drinks</p>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 flex items-center gap-4">
                <div className="text-3xl">🍕</div>
                <div className="flex-1">
                  <h3 className="font-bold">Tuesday - Pizza Night</h3>
                  <p className="text-gray-600">Stone-baked pizzas • Kitchen 6pm-9pm</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                <div className="text-3xl">🍽️</div>
                <div className="flex-1">
                  <h3 className="font-bold">Wednesday-Thursday</h3>
                  <p className="text-gray-600">Full menu available • Kitchen 6pm-9pm</p>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4">
                <div className="text-3xl">🐟</div>
                <div className="flex-1">
                  <h3 className="font-bold">Friday - Fish & Chips</h3>
                  <p className="text-gray-600">Fish & chips served • Kitchen 6pm-9pm</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-4">
                <div className="text-3xl">🎭</div>
                <div className="flex-1">
                  <h3 className="font-bold">Saturday - Entertainment Night</h3>
                  <p className="text-gray-600">Drag shows & events • Kitchen 1pm-7pm</p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 flex items-center gap-4">
                <div className="text-3xl">🍖</div>
                <div className="flex-1">
                  <h3 className="font-bold">Sunday - Roast Day</h3>
                  <p className="text-gray-600">Traditional Sunday lunch • Kitchen 12pm-5pm</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Reviews */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="What Stanwell Locals Say About Us"
            />
            <GoogleReviews 
              layout="grid"
              showTitle={false}
            />
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "What makes The Anchor the best pub in Stanwell Moor?",
            answer: "We're the only traditional pub in Stanwell Moor village, serving our community since 1995. We offer free parking, a large beer garden, home-cooked food, regular entertainment, and a genuine local atmosphere. Our combination of location, facilities, and friendly service makes us the preferred choice for locals."
          },
          {
            question: "Do you have parking at the pub?",
            answer: "Yes! We have 20 free parking spaces, which is rare for pubs in this area. You'll never have to worry about parking meters or finding a space. This is especially valuable compared to Staines town center pubs where parking can cost £3-5."
          },
          {
            question: "Are families welcome at The Anchor?",
            answer: "Absolutely! We're a family-friendly pub with a children's menu available. Kids are welcome throughout the pub and in our beer garden. We provide a relaxed atmosphere where families can enjoy meals together."
          },
          {
            question: "What food do you serve?",
            answer: "We serve traditional British pub food including our famous Sunday roasts, fish & chips, stone-baked pizzas, burgers, steaks, and vegetarian options. Kitchen hours vary by day - closed Mondays, dinner service Tuesday-Friday, lunch and dinner on weekends."
          },
          {
            question: "How far is The Anchor from Stanwell village?",
            answer: "We're just 5 minutes from Stanwell village center, located on Horton Road in Stanwell Moor. We're also only 8 minutes from Staines, 7 minutes from Heathrow Terminal 5, and 3 minutes from M25 Junction 14."
          },
          {
            question: "Do you show sports at the pub?",
            answer: "Yes, we show major sporting events that air on BBC, ITV, Channel 4, and Channel 5. We're a great place to enjoy the big free-to-air football, rugby, and tournament fixtures with fellow fans in a proper pub atmosphere."
          },
          {
            question: "Can I book The Anchor for a private event?",
            answer: "Yes! We offer flexible function room hire for parties, celebrations, wakes, and corporate events. We can accommodate groups from 10-200 people with various catering options. Contact us on 01753 682707 to discuss your requirements."
          }
        ]}
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <CTASection
        title="Visit Your Local Pub Today"
        description="Great food, free parking, and a warm welcome await"
        buttons={[
          {
            text: "📅 Book a Table",
            href: "/book-table",
            variant: "primary"
          },
          {
            text: "🎉 Book an Event",
            href: "/book-event",
            variant: "white"
          },
          {
            text: "📍 Get Directions",
            href: "https://maps.google.com/?q=The+Anchor+Stanwell+Moor",
            variant: "secondary"
          }
        ]}
        variant="green"
        footer="The Anchor • Horton Road, Stanwell Moor • Your Local Since 1995"
      />
    </>
  )
}
