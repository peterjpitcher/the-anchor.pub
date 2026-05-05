import Link from 'next/link'
import { Button, Container, Section, Card, CardBody, Grid } from '@/components/ui'
import { StatusBar } from '@/components/layout/StatusBar'
import { FilteredUpcomingEvents } from '@/components/FilteredUpcomingEvents'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { CTASection, SectionHeader, FeatureGrid, InfoBoxGrid } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SocialLink } from '@/components/SocialLink'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { quizNightEventSeries, bingoEventSeries } from '@/lib/schema'
import { getBusinessHours, getRecentEvents, getUpcomingEvents, formatEventDate, type Event } from '@/lib/api'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { buildOpeningHoursSchema } from '@/lib/opening-hours-schema'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { seasonalOccasionLinks } from '@/lib/internal-linking-data'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: "What's On Near Heathrow | Quiz, Bingo & Pub Events",
  description: "Pub events near Heathrow: Music Bingo, quiz nights, cash bingo, karaoke and one-off events at The Anchor, Stanwell Moor. See dates and book.",
  openGraph: {
    title: "What's On Near Heathrow, Quiz, Bingo & Live Music Every Week",
    description: "Weekly pub events: Music Bingo, cash bingo, pub quiz, karaoke and live music at The Anchor, Stanwell Moor. From £3, free parking.",
    images: ["/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg"],
  },
  twitter: getTwitterMetadata({
    title: "What's On Near Heathrow, Quiz, Bingo & Live Music Every Week",
    description: "Weekly pub events: Music Bingo, cash bingo, pub quiz, karaoke and live music at The Anchor, Stanwell Moor. From £3, free parking.",
    images: ["/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg"]
  }),
  alternates: {
    canonical: '/whats-on'
  }
}

async function getOpeningHoursSpecification() {
  try {
    // Avoid blocking the page if the API is slow or unreachable
    const hours = await Promise.race([
      getBusinessHours(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
    ])

    return buildOpeningHoursSchema(hours?.regularHours)
  } catch (error) {
    console.warn('Failed to load opening hours for /whats-on schema, omitting hours', error)
    return []
  }
}

export default async function WhatsOnPage() {
  const [openingHoursSpecification, upcomingEvents, recentEvents] = await Promise.all([
    getOpeningHoursSpecification(),
    getUpcomingEvents(24).catch(() => [] as Event[]),
    getRecentEvents(12).catch(() => [] as Event[]),
  ])

  // Resolve next upcoming event for each Monthly Highlights category.
  // The /events list endpoint does not include category objects, so match
  // on event name and slug instead.
  const nextMusicBingo = upcomingEvents.find(e => {
    const slug = (e.slug ?? '').toLowerCase()
    const name = (e.name ?? '').toLowerCase()
    return slug.startsWith('music-bingo') || name.includes('music bingo')
  })
  const nextQuizNight = upcomingEvents.find(e => {
    const slug = (e.slug ?? '').toLowerCase()
    const name = (e.name ?? '').toLowerCase()
    return slug.startsWith('quiz-night') || name === 'quiz night'
  })
  const nextCashBingo = upcomingEvents.find(e => {
    const slug = (e.slug ?? '').toLowerCase()
    const name = (e.name ?? '').toLowerCase()
    // Match "Bingo" but not "Music Bingo"
    return slug.startsWith('bingo') || (name.includes('bingo') && !name.includes('music'))
  })

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: "What's On", url: '/whats-on' }
        ]}
      />
      <SpeakableSchema />
      <ScrollDepthTracker />
      {/* JSON-LD Event Series Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify([
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "What's On at The Anchor, Events & Entertainment",
              "description": "Pub quiz, karaoke, Music Bingo, cash bingo and live music at The Anchor, Stanwell Moor. See all upcoming dates.",
              "url": "https://www.the-anchor.pub/whats-on",
              "about": { "@id": "https://www.the-anchor.pub/#business" }
            },
            quizNightEventSeries,
            bingoEventSeries,
            {
              "@context": "https://schema.org",
              "@type": "EventVenue",
              "@id": "https://www.the-anchor.pub/#event-venue",
              "name": "The Anchor Event Space",
              "description": "Versatile event space hosting quiz nights, hosted events, bingo, and live entertainment",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Horton Road",
                "addressLocality": "Stanwell Moor",
                "addressRegion": "Surrey",
                "postalCode": "TW19 6AQ",
                "addressCountry": "GB"
              },
              "maximumAttendeeCapacity": 100,
              "amenityFeature": [
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Stage Area",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Sound System",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Lighting",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Bar Service",
                  "value": true
                }
              ],
              "publicAccess": true,
              "isAccessibleForFree": false,
              "currenciesAccepted": "GBP",
              "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
              "openingHoursSpecification": openingHoursSpecification
            }
          ])
        }}
      />
      {/* Hero Section */}
      <HeroWrapper
        route="/whats-on"
        title="Pub Events at The Anchor"
        description="Choose an upcoming event, check the date, price and seats, then reserve through the event-specific booking form."
        showContextStrip={true}
        primaryCta={
          <Link href="#upcoming-events" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="w-full sm:w-auto"
            >
              Choose an Event to Reserve
            </Button>
          </Link>
        }
      />

      {/* Upcoming Events from API, first thing after the hero */}
      <Section id="upcoming-events" background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Upcoming Events"
            subtitle="Live updates from our events calendar"
          />

          <SpeakableContent selector="events-list" priority="high">
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<div className="text-center py-8 text-anchor-cream-text/70">Upcoming events are loading. Call 01753 682707 if you need today&apos;s listings.</div>}>
                <FilteredUpcomingEvents events={upcomingEvents} />
              </Suspense>
            </div>
          </SpeakableContent>
        </Container>
      </Section>

      <section className="bg-anchor-bg-raised border-b border-anchor-gold/15 py-6">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <PageTitle className="text-center text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
            What's On - Events & Entertainment at The Anchor - Heathrow Pub & Dining
          </PageTitle>
        </Container>
      </Section>

      {/* Heathrow Positioning */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Seven Minutes from Heathrow Terminal 5"
            subtitle="Looking for things to do near Heathrow? Ideal for cabin crew socials, airport shift drinks and travellers looking for nightlife outside the terminal."
          />
          <InfoBoxGrid
            columns={3}
            className="max-w-5xl mx-auto"
            boxes={[
              {
                title: "Airport-Friendly Timings",
                content: (
                  <p className="text-anchor-cream-text/70">
                    Evening events start after major flight banks. Free parking and late-night snacks make us the go-to Heathrow pub before red-eye departures.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15"
              },
              {
                title: "Weekly Headliners",
                content: (
                  <ul className="list-disc list-inside text-anchor-cream-text/70 space-y-2 text-left">
                    <li>Music Bingo hosted by Nikki Manfadge</li>
                    <li>£3 quiz night (see listings for dates)</li>
                    <li>Cash bingo, karaoke & live sport rotations</li>
                  </ul>
                ),
                variant: "colored",
                color: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15"
              },
              {
                title: "Easy Transfers",
                content: (
                  <p className="text-anchor-cream-text/70">
                    £18 taxi from Terminal 5 or 15-minute walk from Premier Inn T5. We&apos;re the closest village pub to Heathrow with a proper stage and dancefloor.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15"
              }
            ]}
          />
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Local Nights Out for Staines & Heathrow"
            subtitle="Join your neighbours for a proper night out. Regular events for Staines-upon-Thames, Ashford, Feltham and the Heathrow villages."
          />
          <FeatureGrid
            columns={3}
            features={[
              {
                icon: "",
                title: "Staines-Upon-Thames",
                description: "Ten minutes from Staines High Street with free parking and late-night taxi options.",
                className: "text-center"
              },
              {
                icon: "",
                title: "Ashford & Feltham",
                description: "Easy A3044 route for groups looking for quiz nights, Music Bingo and bingo.",
                className: "text-center"
              },
              {
                icon: "",
                title: "Heathrow Crew Hangouts",
                description: "Events timed around flight banks for crews and airport teams after shifts.",
                className: "text-center"
              }
            ]}
          />
        </Container>
      </Section>

      {/* Featured Events */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Monthly Highlights - Great Value Entertainment"
            subtitle="FREE entry to most events • Small entry fees support charity & prizes"
          />

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link href={nextMusicBingo ? `/events/${nextMusicBingo.slug || nextMusicBingo.id}` : '/music-bingo'} className="group">
              <Card variant="default" className="h-full transition-all hover:border-anchor-gold/40 card-dark rounded-none">
                <CardBody className="text-center p-8">
                  <div className="text-5xl mb-4"></div>
                  <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-3">
                    Music Bingo with Nikki Manfadge
                  </h3>
                  <p className="text-anchor-cream-text/70 mb-4">
                    Song clips instead of numbers, singalong rounds, and prizes every game. Book a Music Bingo table.
                  </p>
                  <p className="text-anchor-gold font-semibold">Learn more →</p>
                </CardBody>
              </Card>
            </Link>

            <Link href={nextQuizNight ? `/events/${nextQuizNight.slug || nextQuizNight.id}` : '/quiz-night'} className="group">
              <Card variant="default" className="h-full transition-all hover:border-anchor-gold/40 card-dark rounded-none">
                <CardBody className="text-center p-8">
                  <div className="text-5xl mb-4"></div>
                  <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-3">
                    Quiz Night - Just £3 Entry!
                  </h3>
                  <p className="text-anchor-cream-text/70 mb-4">
                    Test your knowledge monthly. Only £3 entry with cash prizes for winners!
                  </p>
                  <p className="text-sm font-bold text-anchor-gold-vivid">Learn more →</p>
                </CardBody>
              </Card>
            </Link>

            <Link href={nextCashBingo ? `/events/${nextCashBingo.slug || nextCashBingo.id}` : '/cash-bingo'} className="group">
              <Card variant="default" className="h-full transition-all hover:border-anchor-gold/40 card-dark rounded-none">
                <CardBody className="text-center p-8">
                  <div className="text-5xl mb-4"></div>
                  <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-3">
                    Cash Prize Bingo
                  </h3>
                  <p className="text-anchor-cream-text/70 mb-4">
                    £10 cash-only books, £160 snowball and jackpots that roll to £300+. Reserve your tickets early!
                  </p>
                  <p className="text-sm font-bold text-anchor-gold-vivid">Play bingo for cash →</p>
                </CardBody>
              </Card>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Entertainment & Games */}
      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="FREE Daily Entertainment & Games"
            subtitle="Pool table, darts, and more - all FREE to play! No coins or booking needed"
          />

          <FeatureGrid
            columns={4}
            features={[
              {
                icon: "",
                title: "Pool Table - FREE",
                description: "FREE to play all day! No coins needed. Cues and chalk provided.",
                variant: "default",
                className: "bg-anchor-bg-card rounded-none p-6 text-center border border-anchor-gold/15"
              },
              {
                icon: "",
                title: "Darts - FREE",
                description: "FREE to play! Professional board with oche. Darts available at the bar.",
                variant: "default",
                className: "bg-anchor-bg-card rounded-none p-6 text-center border border-anchor-gold/15"
              },
              {
                icon: "",
                title: "Jukebox",
                description: "Choose your favourite tunes. Wide selection of music genres.",
                variant: "default",
                className: "bg-anchor-bg-card rounded-none p-6 text-center border border-anchor-gold/15"
              },
              {
                icon: "",
                title: "Fruit Machine",
                description: "Try your luck on our gaming machine. 18+ only.",
                variant: "default",
                className: "bg-anchor-bg-card rounded-none p-6 text-center border border-anchor-gold/15"
              }
            ]}
            className="max-w-5xl mx-auto"
          />

          <Card variant="default" className="mt-12 max-w-3xl mx-auto card-dark rounded-none">
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">
                <span className="text-3xl"></span> Free WiFi Throughout
              </h3>
              <p className="text-anchor-cream-text/70">
                Stay connected with our free, high-speed WiFi. Perfect for checking emails, social media, or even getting some work done.
                Our dining room features tables with power points - ideal for remote workers and digital nomads.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>


      {/* Special Events */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Special Events & Celebrations"
            subtitle="Throughout the year, we host special themed events and celebrations"
          />

          <SpeakableContent selector="special-events" priority="medium">
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "Christmas Parties",
                  description: "Festive menu, decorations, and party atmosphere. Book your Christmas do with us!",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Halloween Spectacular",
                  description: "Costume contests, spooky decorations, themed drinks, and DJ entertainment. Best dressed wins prizes!",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "New Year's Eve",
                  description: "Ring in the new year with DJ entertainment, champagne, and midnight celebrations.",
                  className: "text-center"
                }
              ]}
              className="max-w-5xl mx-auto"
            />
          </SpeakableContent>

          <InfoBoxGrid
            columns={1}
            boxes={[
              {
                title: "Watch Sports at The Anchor",
                content: (
                  <>
                    <p className="text-anchor-cream-text/70 text-center mb-6">
                      Catch all the major sporting events on our screens! We show all terrestrial channel sports including:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
	                      <div>
	                        <div className="text-3xl mb-2"></div>
	                        <p className="font-semibold">World Cup</p>
	                      </div>
                      <div>
                        <div className="text-3xl mb-2"></div>
                        <p className="font-semibold">Euros</p>
                      </div>
                      <div>
                        <div className="text-3xl mb-2"></div>
                        <p className="font-semibold">Wimbledon</p>
                      </div>
                      <div>
                        <div className="text-3xl mb-2"></div>
                        <p className="font-semibold">Six Nations</p>
                      </div>
                    </div>
                  </>
                ),
                variant: "default",
                className: "bg-anchor-bg-card rounded-none p-8 border border-anchor-gold/15"
              }
            ]}
            className="mt-12 max-w-3xl mx-auto"
          />
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Seasonal Events and Occasion Guides"
            subtitle="Plan ahead for the pub dates people search for throughout the year."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {seasonalOccasionLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group block h-full">
                <div className="h-full border border-anchor-gold/15 bg-anchor-bg-card p-5 transition-colors group-hover:border-anchor-gold/45">
                  <h3 className="text-lg font-bold text-anchor-gold-vivid group-hover:text-anchor-gold">
                    {link.label}
                  </h3>
                  <p className="mt-2 text-sm text-anchor-cream-text/70">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {recentEvents.length > 0 && (
        <Section id="recent-events" background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
          <Container>
            <SectionHeader
              title="Recent Event Archive"
              subtitle="Recently finished event pages stay linked while Google recrawls and the next dates are promoted."
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {recentEvents.map((event) => {
                const eventPath = `/events/${event.slug || event.id}`

                return (
                  <Link key={event.id || event.slug} href={eventPath} className="group block h-full">
                    <div className="h-full border border-anchor-gold/15 bg-anchor-bg-card p-5 transition-colors group-hover:border-anchor-gold/45">
                      <p className="text-xs font-semibold uppercase tracking-wide text-anchor-cream-text/50">
                        {formatEventDate(event.startDate)}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-anchor-gold-vivid group-hover:text-anchor-gold">
                        {event.name}
                      </h3>
                      <p className="mt-2 text-sm text-anchor-cream-text/70">
                        {event.brief || event.shortDescription || event.description || 'See details from this recent event at The Anchor.'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Container>
        </Section>
      )}

      {/* Private Events */}
      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Host Your Event at The Anchor"
              subtitle={`Transform your special occasion into an unforgettable experience. Room bookings for ${PRIVATE_HIRE_CAPACITY.recommendedRange}; larger events and full-venue hire available by enquiry.`}
            />
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "Birthday Parties",
                  description: "Celebrate in style with custom menus",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-6 text-center border border-anchor-gold/15"
                },
                {
                  icon: "",
                  title: "Corporate Events",
                  description: "Team building, meetings, or celebrations",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-6 text-center border border-anchor-gold/15"
                },
                {
                  icon: "",
                  title: "Special Occasions",
                  description: "Engagements, anniversaries, and more",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-6 text-center border border-anchor-gold/15"
                }
              ]}
              className="mb-8"
            />
            <Link href="/private-hire#enquiry">
              <Button variant="primary" size="lg">
                Enquire About Private Events
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      {/* Internal Links for SEO */}
      <Section background="white" spacing="md">
        <Container>
          <InternalLinkingSection
            title="Discover More at The Anchor"
            links={[...commonLinkGroups.dining, { href: '/blog', title: 'Latest News', description: 'Updates and announcements' }]}
          />
        </Container>
      </Section>

      <OrganicSearchClusterLinks
        cluster="events"
        currentPath="/whats-on"
        title="Find the right event page"
        intro="Use these pages for live sport, quiz night and Music Bingo searches before you reserve a table."
      />

      <FAQAccordionWithSchema
        faqs={[
          {
            question: "What hosted nights do you have at The Anchor?",
            answer: "We host occasional nights with Nikki Manfadge (including Music Bingo), plus a handful of one-off events throughout the year. See /whats-on for the latest dates and details."
          },
	          {
	            question: "What time is quiz night at The Anchor?",
	            answer: "Quiz night runs monthly (dates vary). Entry is £3 per person. Prizes include a £25 bar voucher for 1st place, and the 2nd from last team wins a bottle of wine. See /whats-on for the next quiz listing."
	          },
          {
            question: "Do I need to book for events at The Anchor?",
            answer: "For many nights, booking isn't required but arriving early is recommended as we do get busy. For special events, private parties, or large groups, please call us on 01753 682707 to reserve your space. See /whats-on for the latest event details."
          },
          {
            question: "Can I hire The Anchor for a private party?",
            answer: `Yes. We offer room bookings for ${PRIVATE_HIRE_CAPACITY.recommendedRange}, with larger events and full-venue hire available by enquiry. Perfect for birthdays, corporate events, wakes, and celebrations. Contact us on 01753 682707 for a personalised consultation.`
          },
	          {
	            question: "Is there bingo at The Anchor?",
	            answer: "Yes, we host cash prize bingo monthly. £10 per book with various prizes throughout the night, including a cash jackpot on the last game. Check our events calendar or follow us on social media for the next bingo night!"
	          },
          {
            question: "Are children allowed at The Anchor events?",
            answer: "Children are always welcome at The Anchor, but suitability can vary by event. Some special events may be adults-only (18+). Please check /whats-on for the latest guidance when booking or planning a visit."
          },
	          {
	            question: "How much are tickets for events at The Anchor?",
	            answer: "Pricing varies by event. Quiz night is £3 per person, and bingo is £10 per book. Some one-off events may be ticketed. See /whats-on for the latest pricing and details."
	          },
          {
            question: "Is there entertainment every night at The Anchor?",
            answer: "We host a mix of quiz nights, bingo, hosted nights and one-off events throughout the month. See /whats-on for upcoming listings."
          },
          {
            question: "What payment methods are accepted for events?",
            answer: "We accept cash and all major credit and debit cards, including American Express, for event entry fees, drinks, and food. Whether it's quiz night entry, bingo books, or your bar tab, we make payment easy and convenient."
          }
        ]}
        className="bg-anchor-bg"
      />

      {/* Stay Updated */}
      <Section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Never Miss an Event
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Follow us on social media for the latest updates, special events, and last-minute changes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-anchor-gold text-anchor-green hover:bg-anchor-gold-light"
              >
                <Link href="#upcoming-events">Reserve an Upcoming Event</Link>
              </Button>
            </div>
            <div className="flex justify-center gap-6 mb-8">
              <SocialLink
                platform="facebook"
                href="https://www.facebook.com/theanchorpubsm/"
                source="whats_on_page"
                className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/30 transition-colors text-white"
              >
                Facebook
              </SocialLink>
              <SocialLink
                platform="instagram"
                href="https://www.instagram.com/theanchor.pub/"
                source="whats_on_page"
                className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/30 transition-colours text-white"
              >
                Instagram
              </SocialLink>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <p className="font-semibold mb-2 text-white">Event Enquiries</p>
              <p className="text-white">01753 682707</p>
              <p className="text-white">WhatsApp: 01753 682707</p>
              <p className="text-white">manager@the-anchor.pub</p>
            </div>
          </div>
        </Container>
      </Section>

    </>
  )
}
