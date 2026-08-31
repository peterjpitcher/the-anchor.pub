import Link from 'next/link'
import { Metadata } from 'next'
import { Badge, Button, Card, Container, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { AmenityStrip } from '@/components/AmenityStrip'
import { CtaBand } from '@/components/CtaBand'
import { UpcomingEvents } from '@/components/events/UpcomingEvents'
import { RegularEventCard } from './_components/RegularEventCard'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { ChristmasCrossLink } from '@/components/features/christmas/ChristmasCrossLink'

// Daily regeneration so the seasonal Christmas cross-link appears and removes
// itself on time. The page was fully static before, which would have frozen
// the season gate at whatever the last deploy happened to see.
export const revalidate = 86400
import { quizNightEventSeries, bingoEventSeries } from '@/lib/schema'
import { getBusinessHours, getRecentEvents, getUpcomingEvents, formatEventDate, type Event } from '@/lib/api'
import { seasonalOccasionLinks } from '@/lib/internal-linking-data'
import { buildOpeningHoursSchema } from '@/lib/opening-hours-schema'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  // Short enough that the root layout's " | The Anchor" suffix still fits inside
  // Google's ~60 character cut-off.
  title: "Quiz, Music Bingo & Cash Bingo Near Heathrow",
  description: "Quiz nights, music bingo and cash bingo at The Anchor, Stanwell Moor. Quiz £3, free parking, 7 mins from Heathrow T5. See the dates.",
  openGraph: {
    title: "Quiz, Music Bingo & Cash Bingo Near Heathrow | The Anchor",
    description: "Quiz nights, music bingo and cash bingo at The Anchor, Stanwell Moor. Quiz £3, free parking, 7 mins from Heathrow T5.",
    images: ["/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg"],
  },
  twitter: getTwitterMetadata({
    title: "Quiz, Music Bingo & Cash Bingo Near Heathrow | The Anchor",
    description: "Quiz nights, music bingo and cash bingo at The Anchor, Stanwell Moor. Quiz £3, free parking, 7 mins from Heathrow T5.",
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

    return buildOpeningHoursSchema(hours?.regularHours, hours?.upcomingVersions)
  } catch (error) {
    console.warn('Failed to load opening hours for /whats-on schema, omitting hours', error)
    return []
  }
}

// "The regulars": recurring nights that run every month. O4: only verified,
// SSOT/existing-page-backed values are shown here. Quiz £3 entry and cash bingo
// £10 a book are confirmed in the page's existing JSON-LD (lib/schema.ts) and
// long-standing page copy. Exact times, song counts and similar specifics are
// deliberately omitted as unverified.
const REGULAR_NIGHTS: ReadonlyArray<{
  cadence: string
  title: string
  meta: string
  price?: string
  tag: string
  href: string
}> = [
  {
    cadence: 'Monthly',
    title: 'Music Bingo with Nikki Manfadge',
    meta: 'Song clips instead of numbers, singalong rounds and prizes every round.',
    tag: 'Hosted night',
    href: '/music-bingo'
  },
  {
    cadence: 'Monthly',
    title: 'Quiz Night',
    meta: 'Test your knowledge for a £25 bar tab, with a bottle of wine for the second-from-last team.',
    price: '£3 entry',
    tag: '£25 bar tab',
    href: '/quiz-night'
  },
  {
    cadence: 'Monthly',
    title: 'Cash Prize Bingo',
    meta: 'Cash-only books with prizes throughout the night and a jackpot to finish.',
    price: '£10 a book',
    tag: 'Cash jackpot',
    href: '/cash-bingo'
  }
]

export default async function WhatsOnPage() {
  const [openingHoursSpecification, upcomingEvents, recentEvents] = await Promise.all([
    getOpeningHoursSpecification(),
    getUpcomingEvents(24).catch(() => [] as Event[]),
    getRecentEvents(12).catch(() => [] as Event[]),
  ])

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: "What's On", url: '/whats-on' }
        ]}
      />
      <SpeakableSchema/>
      <ScrollDepthTracker/>

      {/* Per-event JSON-LD: preserved from the previous events listing, which
          emitted an EventSchema for each upcoming event. UpcomingEvents itself
          is presentational and emits none. */}
      {/* No per-event Event schema here on purpose.
        Google: "Each event MUST have a unique URL (a leaf page) and markup on
        that URL. The event experience on Google only supports pages that focus
        on a single event. We recommend focusing on adding markup to your event
        posting pages instead of pages that list schedules or multiple events."
        https://developers.google.com/search/docs/appearance/structured-data/event
        Every event already carries its own Event markup on /events/[id]. The
        33 copies across the listing pages were ineligible, and cost 58KB on
        /whats-on alone. */}

      {/* Collection / event-series / venue JSON-LD (unchanged). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify([
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "What's On at The Anchor, Events & Entertainment",
              "description": "Pub quiz, Music Bingo and cash bingo at The Anchor, Stanwell Moor. See all upcoming dates.",
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
              "description": "Versatile event space hosting quiz nights, Music Bingo, cash bingo and hosted one-off nights",
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

      {/* 1. InteriorHero (§7.3.1) */}
      <InteriorHero
        image="/images/page-headers/whats-on/whats-on.jpg"
        crumb="What's On"
        kicker="What's on"
        title="What's On at The Anchor"
        lead="Quiz nights, Music Bingo and cash bingo in Stanwell Moor, seven minutes from Heathrow Terminal 5 with free parking. Pick a night, check the date and reserve your table."
        badges={
          <>
            <Badge variant="sand">Free entry nights</Badge>
            <Badge variant="sand">Family friendly</Badge>
            <Badge variant="sand">Free parking</Badge>
          </>
        }
        actions={
          <>
            <Link href="/book-table?source=whats_on_hero" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" fullWidth>
                Reserve an event table
              </Button>
            </Link>
            <Link href="/food-menu" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth>
                See the food menu
              </Button>
            </Link>
          </>
        }
      />

      {/* 2. AmenityStrip (§7.3.2) */}
      <AmenityStrip/>

      {/* 3. Next up (§7.3.3): cream, live events from the management API. */}
      <section id="upcoming-events" className="bg-canvas py-section-y">
        <Container>
          <SectionHeading
            kicker="Next up"
            script="Don't miss it"
            title="This month's headline nights"
            lead="Choose a hosted night below, check the date, price and seats, then reserve through the event's own booking form."
          />

          <SpeakableContent selector="events-list" priority="high">
            <div id="events-list" className="mx-auto">
              <UpcomingEvents
                events={upcomingEvents}
                emptyState={
                  <div className="rounded-md border border-line bg-surface p-8 text-center">
                    <p className="text-lg text-ink-strong">No upcoming events scheduled at the moment.</p>
                    <p className="mt-2 text-ink-muted">
                      Check back soon, or call 01753 682707 for today&apos;s listings.
                    </p>
                  </div>
                }
              />
            </div>
          </SpeakableContent>
        </Container>
      </section>

      {/* 4. The regulars (§7.3.4): white, verified recurring nights only (O4). */}
      <section className="bg-surface py-section-y">
        <Container>
          <SectionHeading
            kicker="The regulars"
            title="On every month"
            lead="The nights that come round every month. See each event page for the next date and to reserve a table."
          />

          <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
            {REGULAR_NIGHTS.map((night) => (
              <RegularEventCard
                key={night.title}
                cadence={night.cadence}
                title={night.title}
                meta={night.meta}
                price={night.price}
                tag={night.tag}
                href={night.href}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Seasonal occasions (orphan-repair internal links; SEO). Keeps the
          seasonal occasion pages crawlable from this hub. */}
      <section className="bg-canvas py-section-y">
        <Container>
          <SectionHeading
            kicker="Seasonal occasions"
            title="Plan ahead for the dates people search for"
            lead="Guides for the seasonal pub dates near Heathrow, from bank holiday weekends to New Year's Eve."
          />

          <div className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {seasonalOccasionLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group block h-full">
                <Card hover accent className="h-full p-6">
                  <h3 className="text-lg font-semibold text-ink-strong transition-colors group-hover:text-anchor-gold">
                    {link.label}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    {link.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Recent events archive (orphan-repair internal links; SEO). Keeps
          recently finished event pages linked while Google recrawls. */}
      {recentEvents.length > 0 && (
        <section id="recent-events" className="bg-surface py-section-y">
          <Container>
            <SectionHeading
              kicker="Recent events"
              title="From the recent event archive"
              lead="A look back at recent nights. Every event page stays online, so you can see what one of our nights is actually like before booking the next."
            />

            <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentEvents.map((event) => (
                <Link
                  key={event.id || event.slug}
                  href={`/events/${event.slug || event.id}`}
                  className="group block h-full"
                >
                  <Card hover accent className="h-full p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {formatEventDate(event.startDate)}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-ink-strong transition-colors group-hover:text-anchor-gold">
                      {event.name}
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted">
                      {event.brief || event.shortDescription || event.description || 'See details from this recent event at The Anchor.'}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>

            {/* The strip above only reaches the last 30 days. Without this link
                the rest of the archive is orphaned: measured at 3 of 39 past
                events reachable by clicking, which is why those pages could not
                build the authority that keeping them was meant to build. */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/whats-on/archive">
                <Button variant="outline" size="md">
                  Browse all past events
                </Button>
              </Link>
              <Link href="/whats-on#upcoming-events">
                <Button variant="outline" size="md">
                  See this month&apos;s events
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      )}

      <ChristmasCrossLink hook="Alongside the regular events, Christmas dinner and festive get-togethers are open to book." />

      {/* Internal links (preserved for SEO; A4). */}
      <section className="bg-canvas py-section-y">
        <Container>
          <InternalLinkingSection
            title="Discover More at The Anchor"
            links={[
              ...commonLinkGroups.dining,
              { href: '/private-hire', title: 'Private Hire', description: 'Room bookings and full-venue hire near Heathrow' },
              { href: '/blog', title: 'Latest News', description: 'Updates and announcements' }
            ]}
          />
        </Container>
      </section>

      <OrganicSearchClusterLinks
        cluster="events"
        currentPath="/whats-on"
        title="Find the right event page"
        intro="Use these pages for live sport, quiz night and Music Bingo searches before you reserve a table."
      />

      {/* 5. CtaBand (§7.3.5) */}
      <CtaBand
        title="Bringing a group?"
        copy="Groups of 15 or more pay a £10 per person deposit, deducted from your bill. Book a table for the night, or enquire about private hire for the whole room."
        primary={
          <Link href="/book-table?source=whats_on_footer">
            <Button variant="primary" size="lg">
              Book a table
            </Button>
          </Link>
        }
        secondary={
          <Link href="/private-hire">
            <Button variant="outline" size="lg">
              Private hire
            </Button>
          </Link>
        }
      />
    </>
  )
}
