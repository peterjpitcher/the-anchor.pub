import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { getBusinessStats } from '@/lib/schema-with-reviews'

export const metadata: Metadata = {
  title: 'Staines Pub | Sunday Roasts, Private Rooms & Free Parking',
  description: 'Traditional pub 8 minutes from Staines-upon-Thames. Sunday roasts, stone-baked pizza, quiz nights & private rooms for celebrations. Free parking & real ales.',
  keywords: 'staines pub near heathrow, sunday roasts staines, traditional english pubs staines, private rooms staines pub, wedding receptions staines',
  openGraph: {
    title: 'Staines Pub Near Heathrow - The Anchor Stanwell Moor',
    description: 'Traditional pub 8 minutes from Staines with Sunday roast, stone-baked pizzas, hosted nights and free parking. See /whats-on for the latest.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
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
	    "priceRange": "££",
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
          { label: "Just 8 Minutes from Staines", variant: "warning" }
        ]}
        primaryCta={
          <BookTableButton
            source="staines_pub_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="staines_local"
          >
            Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View Our Menu
            </Button>
          </Link>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      <section className="bg-anchor-bg-card py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70">⭐⭐⭐⭐⭐ <strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Quick Summary */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto bg-anchor-bg-raised border border-anchor-gold/15 rounded-none p-6">
            <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">Staines Locals Love Us For</h2>
            <div className="grid gap-3 md:grid-cols-2 text-anchor-cream-text/70">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>8 minute drive from Staines High Street with free parking</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Sunday roasts, stone-baked pizzas and seasonal specials</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Hosted nights like Music Bingo with Nikki Manfadge, quiz nights and charity bingo</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">‍‍‍</span>
                <span>Family-friendly seating with kids menu and space for buggies</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="bg-anchor-bg py-8 border-b border-anchor-gold/15">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            Surrey Pub Near Staines - The Anchor - Heathrow Pub & Dining
          </PageTitle>
        </Container>
      </section>

      {/* Why Choose The Anchor */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
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
                  icon: "",
                  title: "Easy Access from Staines",
                  description: `8 minutes via A30\nFree parking for ${PARKING.capacity} cars\nRegular bus service`,
                  className: "text-center"
                },
	                {
	                  icon: "",
	                  title: "Famous Sunday Roasts",
	                  description: "Our renowned roasts\nPre-order by 1pm Saturday\nSunday lunch bookings require a £10 per person deposit\nRegular menu also available",
	                  className: "text-center"
	                },
                {
                  icon: "",
                  title: "Unique Entertainment",
                  description: "Hosted nights like Music Bingo with Nikki Manfadge\nQuiz nights and bingo\nSee /whats-on for the latest",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Stone-Baked Pizzas",
                  description: "Hand-stretched bases\nRich tomato sauce\nGenerous toppings",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Beer Garden Paradise",
                  description: "Dog-friendly outdoor space\nHeathrow plane spotting",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Community Hub",
                  description: "Private function room\nBirthday parties welcome\nCorporate events catered",
                  className: "text-center"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
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
                    <p className="mb-4 text-anchor-cream-text/70">
                      Planning a birthday, wake or team night? Our private dining room is a popular option for
                      groups searching for pubs with private rooms in Staines, with free parking and tailored menus.
                    </p>
                    <Link href="/function-room-hire" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
                      Explore function room hire →
                    </Link>
                  </>
                ),
                variant: "colored",
                color: "bg-anchor-bg-card"
              },
              {
                title: "Wedding receptions in the Staines area",
                content: (
                  <>
                    <p className="mb-4 text-anchor-cream-text/70">
                      We host wedding receptions near Staines with flexible layouts, buffet or three-course menus,
                      and dedicated support for speeches and playlists.
                    </p>
                    <Link href="/private-party-venue" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
                      View private party options →
                    </Link>
                  </>
                ),
                variant: "colored",
                color: "bg-anchor-bg-card"
              }
            ]}
          />
        </Container>
      </section>

      {/* Journey from Staines */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
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
                  title: "By Car (8 minutes)",
                  content: (
                    <ol className="space-y-2 list-decimal list-inside text-anchor-cream-text/70">
                      <li>Head west on the A30 from Staines town centre</li>
                      <li>Continue through Stanwell village</li>
                      <li>Turn left onto Horton Road</li>
                      <li>The Anchor is on your right with free parking</li>
                    </ol>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card"
                },
                {
                  title: "By Public Transport",
                  content: (
                    <ul className="space-y-2 text-anchor-cream-text/70">
                      <li className="flex items-start">
                        <span className="text-anchor-gold mr-2">•</span>
                        Bus routes from Staines Bus Station
                      </li>
                      <li className="flex items-start">
                        <span className="text-anchor-gold mr-2">•</span>
                        Regular services throughout the day
                      </li>
                      <li className="flex items-start">
                        <span className="text-anchor-gold mr-2">•</span>
                        Stop: Horton Road/The Anchor
                      </li>
                      <li className="flex items-start">
                        <span className="text-anchor-gold mr-2">•</span>
                        Journey time: 15-20 minutes
                      </li>
                    </ul>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card"
                }
              ]}
            />

            <AlertBox
              variant="success"
              title="Also conveniently located near:"
              className="mt-8 text-center"
              content={
                <div className="flex flex-wrap justify-center gap-4 text-anchor-cream-text/70">
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
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="What's On at Your Staines Local"
              className="text-center mb-12"
            />

            <div className="space-y-6">
              <div className="border-l-4 border-anchor-gold bg-anchor-bg-raised p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-anchor-cream-text">Thursday</h3>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">QUIZ</span>
                </div>
                <p className="text-anchor-cream-text/70">Quiz Night - Win bar tabs and prizes! See /whats-on for details.</p>
              </div>

              <div className="border-l-4 border-anchor-gold bg-anchor-bg-raised p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-anchor-cream-text">Sunday</h3>
                  <span className="bg-anchor-gold text-anchor-bg px-3 py-1 rounded-full text-sm font-semibold">ROASTS</span>
                </div>
		                <p className="text-anchor-cream-text/70">
		                  Famous Sunday roasts served 1pm-6pm. Pre-order by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.
		                </p>
              </div>

              <div className="border-l-4 border-anchor-gold bg-anchor-bg-raised p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-anchor-cream-text">Monthly</h3>
                  <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">HOSTED</span>
                </div>
                <p className="text-anchor-cream-text/70">Hosted nights with Nikki Manfadge (including Music Bingo) and one-off events. See /whats-on for details.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Event Venue Section */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Popular Venue for Staines Events"
              subtitle="Host your special occasion at The Anchor - just 8 minutes from Staines"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Perfect for Staines Residents</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid"></span>
                    <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Quick journey</strong> - Just 8 minutes from Staines town centre</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid"></span>
                    <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Free parking</strong> - No expensive town centre rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid"></span>
                    <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Competitive prices</strong> - Better value than Staines venues</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid"></span>
                    <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Flexible spaces</strong> - From intimate gatherings to large parties</span>
                  </li>
                </ul>
              </div>

              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Popular Events from Staines</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">Birthday Parties</h4>
                    <p className="text-sm text-anchor-cream-text/70">Celebrate milestones with custom packages</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">Corporate Events</h4>
                    <p className="text-sm text-anchor-cream-text/70">Team meetings and Christmas parties</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">Wedding Receptions</h4>
                    <p className="text-sm text-anchor-cream-text/70">Beautiful venue for your special day</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold mb-1">Memorial Services</h4>
                    <p className="text-sm text-anchor-cream-text/70">Respectful space for celebrations of life</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-dark rounded-none p-6 text-center">
              <p className="text-lg text-anchor-cream-text mb-4">
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
                  Quick Enquiry
                </PhoneButton>
                <Link href="https://wa.me/441753682707?text=Hi,%20I" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="md">
                    WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
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

      {/* Why Staines Residents Choose The Anchor Over the High Street */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="A Different Night Out from Staines High Street"
              className="text-center mb-8"
            />
            <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
              <p>
                Staines High Street has no shortage of pubs — The Swan, The Bells, the Wetherspoons on the corner — but
                anyone who has tried to get a table on a Friday night knows the drill. Packed bars, queues at the door,
                and nowhere to park without feeding a meter. The Anchor offers something genuinely different: a proper
                village pub with free parking, a spacious beer garden, and none of the weekend crush.
              </p>
              <p>
                The drive is straightforward. Cross Staines Bridge, pick up the A30 heading toward Heathrow, and take
                a left onto Stanwell Moor Road. In ten to twelve minutes you are pulling into our car park — no circling
                side streets, no pay-and-display. On a Saturday afternoon, when Staines High Street is heaving with
                shoppers and the Two Rivers car parks are rammed, The Anchor is a quieter alternative where you can
                actually hear yourself talk.
              </p>
              <p>
                Most locals still call it Staines rather than Staines-upon-Thames, whatever the council decided back
                in 2012. Either way, we are just outside the town boundary but close enough for an easy weeknight meal
                or a lazy Sunday roast without battling for a space on the one-way system. Many of our regulars
                discovered us exactly that way — looking for somewhere with decent food, real ales, and room to breathe.
                Once they tried the stone-baked pizzas and caught a sunset in the beer garden with the planes coming
                over, they stopped bothering with the High Street altogether.
              </p>
            </div>
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
        className="bg-anchor-bg-raised"
      />

      {/* CTA Section */}
      <CTASection
        title="Visit Staines' Favourite Local Pub"
        description="Just 8 minutes from Staines town centre with free parking"
        buttons={[
          {
            text: "Book a Table",
            href: "/book-table",
            variant: "secondary"
          },
          {
            text: "Call Us",
            href: CONTACT.phoneHref,
            isPhone: true,
            phoneSource: "staines_pub_cta",
            variant: "white"
          },
          {
            text: "Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: "Get Directions from Staines",
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
