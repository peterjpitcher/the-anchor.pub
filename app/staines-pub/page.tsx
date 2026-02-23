import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { getBusinessStats } from '@/lib/schema-with-reviews'

export const metadata: Metadata = {
  title: 'Staines Pub | Sunday Roasts, Private Rooms & Free Parking',
  description: 'Visit The Anchor near Staines-upon-Thames for Sunday roasts, stone-baked pizzas, hosted nights like Music Bingo with Nikki Manfadge, quiz nights, and private rooms for celebrations. Free parking and real ales just 8 minutes from town. See /whats-on for the latest.',
  keywords: 'staines pub near heathrow, sunday roasts staines, traditional english pubs staines, private rooms staines pub, wedding receptions staines',
  openGraph: {
    title: 'Staines Pub Near Heathrow - The Anchor Stanwell Moor',
    description: 'Traditional pub 8 minutes from Staines with Sunday roast, stone-baked pizzas, hosted nights and free parking. See /whats-on for the latest.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'Staines Pub Near Heathrow - The Anchor Stanwell Moor',
    description: 'Traditional pub 8 minutes from Staines with Sunday roast, stone-baked pizzas, hosted nights and free parking. See /whats-on for the latest.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/staines-pub'
  }
}

export default async function StainesPubPage() {
  const { rating, reviewCount } = await getBusinessStats()

  // Schema for local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "@id": "https://www.the-anchor.pub/staines-pub#business",
    "name": BRAND.name,
    "description": "Traditional Surrey pub serving Staines-upon-Thames and surrounding areas",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": CONTACT.address.town,
      "addressRegion": CONTACT.address.county,
      "postalCode": CONTACT.address.postcode,
      "addressCountry": CONTACT.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT.coordinates.lat,
      "longitude": CONTACT.coordinates.lng
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Staines-upon-Thames"
      },
      {
        "@type": "City",
        "name": "Stanwell Moor"
      },
      {
        "@type": "City",
        "name": "Stanwell"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    },
	    "priceRange": "moderate",
    "servesCuisine": ["British", "Pizza", "Sunday Roast"],
    "hasMenu": "https://www.the-anchor.pub/food-menu",
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub"
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Near Heathrow', url: '/near-heathrow' },
    { name: 'Staines Pub', url: '/staines-pub' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, localBusinessSchema]) }}
      />

      {/* Hero Section */}
      <HeroWrapper
        route="/staines-pub"
        title="Your Local Staines Pub"
        description="Traditional British pub serving the Staines community with great food, entertainment, and a warm welcome"
        variant="default"
        tags={[
          { label: "📍 Just 8 Minutes from Staines", variant: "warning" }
        ]}
        primaryCta={
          <PhoneButton
            phone={CONTACT.phone}
            source="staines_pub_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📞 Call {CONTACT.phone}
          </PhoneButton>
        }
        secondaryCta={
          <Link href="/food-menu">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View Our Menu
            </Button>
          </Link>
        }
      />

      {/* Quick Summary */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-5xl mx-auto bg-anchor-cream/40 border border-anchor-cream rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-anchor-green mb-3">Staines Locals Love Us For</h2>
            <div className="grid gap-3 md:grid-cols-2 text-gray-700">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">🚗</span>
                <span>8 minute drive from Staines High Street with free parking</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">🍽️</span>
                <span>Sunday roasts, stone-baked pizzas and seasonal specials</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">🎉</span>
                <span>Hosted nights like Music Bingo with Nikki Manfadge, quiz nights and charity bingo</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">👨‍👩‍👧‍👦</span>
                <span>Family-friendly seating with kids menu and space for buggies</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="bg-white py-8">
        <Container>
          <PageTitle
            className="text-center text-anchor-green"
            seo={{ structured: true, speakable: true }}
          >
            Surrey Pub Near Staines - The Anchor - Heathrow Pub & Dining
          </PageTitle>
        </Container>
      </section>

      {/* Why Choose The Anchor */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Why Staines Locals Love The Anchor"
              subtitle="Just a short drive from Staines-upon-Thames, discover Surrey's best kept secret - a proper British pub experience"
              className="text-center mb-12"
            />

            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "🚗",
                  title: "Easy Access from Staines",
                  description: `8 minutes via A30\nFree parking for ${PARKING.capacity} cars\nRegular bus service`,
                  className: "text-center"
                },
	                {
	                  icon: "🍽️",
	                  title: "Famous Sunday Roasts",
	                  description: "Our renowned roasts\nPre-order by 1pm Saturday\nSunday lunch bookings require a £10 per person deposit\nRegular menu also available",
	                  className: "text-center"
	                },
                {
                  icon: "🎭",
                  title: "Unique Entertainment",
                  description: "Hosted nights like Music Bingo with Nikki Manfadge\nQuiz nights and bingo\nSee /whats-on for the latest",
                  className: "text-center"
                },
                {
                  icon: "🍕",
                  title: "Stone-Baked Pizzas",
                  description: "Hand-stretched bases\nRich tomato sauce\nGenerous toppings",
                  className: "text-center"
                },
                {
                  icon: "🌳",
                  title: "Beer Garden Paradise",
                  description: "Dog-friendly outdoor space\nHeathrow plane spotting\nCovered seating available",
                  className: "text-center"
                },
                {
                  icon: "👥",
                  title: "Community Hub",
                  description: "Private function room\nBirthday parties welcome\nCorporate events catered",
                  className: "text-center"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-white">
        <Container>
          <SectionHeader
            title="Private Rooms & Wedding Receptions Near Staines"
            subtitle="Flexible spaces for celebrations, receptions and family gatherings."
          />
          <InfoBoxGrid
            columns={2}
            boxes={[
              {
                title: "Private rooms near Staines",
                content: (
                  <>
                    <p className="mb-4">
                      Planning a birthday, wake or team night? Our private dining room is a popular option for
                      groups searching for pubs with private rooms in Staines, with free parking and tailored menus.
                    </p>
                    <Link href="/function-room-hire" className="text-anchor-gold font-semibold hover:text-anchor-green transition">
                      Explore function room hire →
                    </Link>
                  </>
                ),
                variant: "colored",
                color: "bg-amber-50"
              },
              {
                title: "Wedding receptions in the Staines area",
                content: (
                  <>
                    <p className="mb-4">
                      We host wedding receptions near Staines with flexible layouts, buffet or three-course menus,
                      and dedicated support for speeches and playlists.
                    </p>
                    <Link href="/private-party-venue" className="text-anchor-gold font-semibold hover:text-anchor-green transition">
                      View private party options →
                    </Link>
                  </>
                ),
                variant: "colored",
                color: "bg-rose-50"
              }
            ]}
          />
        </Container>
      </section>

      {/* Journey from Staines */}
      <section className="section-spacing bg-anchor-sand/20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Getting Here from Staines"
              className="text-center mb-12"
            />

            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "🚗 By Car (8 minutes)",
                  content: (
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>Head west on the A30 from Staines town centre</li>
                      <li>Continue through Stanwell village</li>
                      <li>Turn left onto Horton Road</li>
                      <li>The Anchor is on your right with free parking</li>
                    </ol>
                  ),
                  variant: "colored",
                  color: "bg-amber-50"
                },
                {
                  title: "🚌 By Public Transport",
                  content: (
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Bus routes from Staines Bus Station
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Regular services throughout the day
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Stop: Horton Road/The Anchor
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Journey time: 15-20 minutes
                      </li>
                    </ul>
                  ),
                  variant: "colored",
                  color: "bg-blue-50"
                }
              ]}
            />

            <AlertBox
              variant="success"
              title="Also conveniently located near:"
              className="mt-8 text-center"
              content={
                <div className="flex flex-wrap justify-center gap-4">
                  <span>• Heathrow T5: {HEATHROW_TIMES.terminal5} mins</span>
                  <span>• Ashford: 10 mins</span>
                  <span>• Sunbury: 15 mins</span>
                  <span>• Feltham: 12 mins</span>
                </div>
              }
            />
          </div>
        </Container>
      </section>

      {/* What's On This Week */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="What's On at Your Staines Local"
              className="text-center mb-12"
            />

            <div className="space-y-6">
              <div className="border-l-4 border-anchor-gold bg-anchor-cream/50 p-6 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-anchor-green">Thursday</h3>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">QUIZ</span>
                </div>
                <p className="text-gray-700">Quiz Night - Win bar tabs and prizes! See /whats-on for details.</p>
              </div>

              <div className="border-l-4 border-anchor-gold bg-anchor-cream/50 p-6 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-anchor-green">Sunday</h3>
                  <span className="bg-anchor-green text-white px-3 py-1 rounded-full text-sm font-semibold">ROASTS</span>
                </div>
		                <p className="text-gray-700">
		                  Famous Sunday roasts served 1pm-6pm. Pre-order by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.
		                </p>
              </div>

              <div className="border-l-4 border-anchor-gold bg-anchor-cream/50 p-6 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-anchor-green">Monthly</h3>
                  <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">HOSTED</span>
                </div>
                <p className="text-gray-700">Hosted nights with Nikki Manfadge (including Music Bingo) and one-off events. See /whats-on for details.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Event Venue Section */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Popular Venue for Staines Events"
              subtitle="Host your special occasion at The Anchor - just 8 minutes from Staines"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">Perfect for Staines Residents</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <span><strong>Quick journey</strong> - Just 8 minutes from Staines town centre</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <span><strong>Free parking</strong> - No expensive town centre rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <span><strong>Competitive prices</strong> - Better value than Staines venues</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <span><strong>Flexible spaces</strong> - From intimate gatherings to large parties</span>
                  </li>
                </ul>
              </div>

              <div className="bg-anchor-cream rounded-xl p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">Popular Events from Staines</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">🎉 Birthday Parties</h4>
                    <p className="text-sm text-gray-700">Celebrate milestones with custom packages</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">💼 Corporate Events</h4>
                    <p className="text-sm text-gray-700">Team meetings and Christmas parties</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">💑 Wedding Receptions</h4>
                    <p className="text-sm text-gray-700">Beautiful venue for your special day</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">🕊️ Memorial Services</h4>
                    <p className="text-sm text-gray-700">Respectful space for celebrations of life</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <p className="text-lg text-gray-800 mb-4">
                <strong>Flexible venue hire pricing!</strong> Tailored to your event.
                We're always willing to discuss your needs and budget.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/private-hire">
                  <Button variant="primary" size="md">
                    View Event Options
                  </Button>
                </Link>
                <PhoneButton
                  phone="01753 682707"
                  source="staines_pub_event_enquiry"
                  variant="secondary"
                  size="md"
                >
                  📞 Quick Enquiry
                </PhoneButton>
                <Link href="https://wa.me/441753682707?text=Hi,%20I" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="md">
                    💬 WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-anchor-sand/20">
        <Container>
          <div className="max-w-2xl mx-auto">
            <SectionHeader
              title="Opening Hours"
              className="text-center mb-8"
            />
            <BusinessHours />
          </div>
        </Container>
      </section>

      <InternalLinkingSection
        title="More To Explore Near Staines"
        links={[
          { href: '/food-menu', title: 'Food Menu', description: 'See Sunday roasts, burgers and stone-baked pizzas' },
          { href: '/whats-on', title: "What's On", description: 'Check Music Bingo, quiz nights and live sport' },
          { href: '/private-hire', title: 'Book a Celebration', description: 'Host birthdays, wakes and anniversaries' },
          { href: '/drinks', title: 'Drinks Menu', description: 'Perfect garden cocktail before strolling along the Thames' }
        ]}
        className="section-spacing-md"
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Staines?",
            answer: "The Anchor is just 8 minutes drive from Staines town centre via the A30. We're located on Horton Road in Stanwell Moor, with free parking available."
          },
          {
            question: "What makes The Anchor different from other Staines pubs?",
            answer: "We offer unique entertainment including hosted nights like Music Bingo with Nikki Manfadge, quiz nights, famous Sunday roasts, stone-baked pizzas, plus a dog-friendly beer garden with plane spotting views of Heathrow. See /whats-on for the latest events."
          },
          {
            question: "Do you have parking at your Staines area pub?",
            answer: `Yes! We have ${PARKING.description} with space for ${PARKING.capacity} cars, plus extended parking nearby if needed.`
          },
          {
            question: "Do you have private rooms near Staines?",
            answer: "Yes. We offer private rooms and flexible layouts for birthdays, wakes and group celebrations. See the function room hire page or call 01753 682707 to plan your event."
          },
          {
            question: "Can we book wedding receptions in the Staines area?",
            answer: "We host wedding receptions near Staines with buffet or seated menu options, a dedicated event team, and free on-site parking. Contact us to check dates."
          }
        ]}
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <CTASection
        title="Visit Staines' Favourite Local Pub"
        description="Just 8 minutes from Staines town centre with free parking"
        buttons={[
          {
            text: "📞 Book Your Table",
            href: CONTACT.phoneHref,
            isPhone: true,
            phoneSource: "staines_pub_cta",
            variant: "secondary"
          },
          {
            text: "🎉 Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: "📍 Get Directions from Staines",
            href: "https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor",
            variant: "outline",
            className: "!text-white !border-white hover:!bg-white hover:!text-anchor-green"
          }
        ]}
        variant="green"
      >
        <div className="mt-6 text-white/90">
          <p className="font-semibold mb-2">Find us at:</p>
          <address className="not-italic">
            {CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.county} {CONTACT.address.postcode}
          </address>
        </div>
      </CTASection>
    </>
  )
}
