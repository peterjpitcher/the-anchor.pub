import { Metadata } from 'next'
import { Container, Card, CardBody, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { EventDateCards } from '@/components/features/EventDateCards'
import {
  GameNightBooking,
  GameNightCtaActions,
  GameNightFacts,
  GameNightGallery,
  GameNightObjections,
  buildGameNightCtaLabel
} from '@/components/features/GameNight'
import { musicBingo, getGameNightEvents } from '@/lib/game-nights'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SectionViewTracker } from '@/components/tracking/SectionViewTracker'
import {
  formatEventTime,
  formatDoorClockTime,
  getLowestTicketTypePrice,
  hasMultipleTicketPrices,
  type Event
} from '@/lib/api'
import Link from 'next/link'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'

/**
 * Title carries both measured clusters for this page: "music bingo near me" and
 * "drag bingo near me" each measure 500 UK searches a month in GKP at a paid
 * competition index of zero, and Music Bingo is the only drag night The Anchor
 * runs (docs/SSOT.md permits drag-host wording here and nowhere else). See
 * tasks/keyword-plan-game-nights-2026-08-17.md.
 */
export const metadata: Metadata = {
  title: 'Music Bingo Near Me | Drag Music Bingo',
  description:
    'Music bingo at The Anchor, Stanwell Moor, hosted by drag queen Nikki Manfadge. Song clips replace numbers, two themed games, £5 cash entry. It sells out, so book ahead.',
  openGraph: {
    title: 'Music Bingo at The Anchor, Stanwell Moor',
    description: 'Song clips replace numbers, hosted by drag queen Nikki Manfadge. Two themed games, £5 cash entry.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Music bingo at The Anchor pub in Stanwell Moor' }]
  },
  twitter: getTwitterMetadata({
    title: 'Music Bingo at The Anchor, Stanwell Moor',
    description: 'Song clips replace numbers, hosted by drag queen Nikki Manfadge. Two themed games, £5 cash entry.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: './'
  }
}

// Category lookup, fetching and sorting all live in lib/game-nights/events.ts,
// shared by the four game pages.

/**
 * Three steps rather than the previous four-card "tips for a winning card" block
 * plus a separate "how to play" card plus a five-card "why everyone loves it"
 * grid. All three said roughly the same thing and none of them matched a keyword
 * with measured demand.
 */
const HOW_TO_PLAY = [
  {
    title: 'Hear the clip',
    body: 'Short bursts of chart hits, throwbacks and guilty pleasures, all built around that night’s theme.'
  },
  {
    title: 'Find it on your card',
    body: 'Song titles instead of numbers. Mark it off the moment you spot it, because the next clip is not far behind.'
  },
  {
    title: 'Shout for the win',
    body: 'A line or a full house takes the prize. Two games across the night, with interactive music rounds and quizzes in between.'
  }
]

const FAQS = [
  {
    question: 'How much is entry to music bingo?',
    answer:
      'Entry is £5 per person, paid in cash on the night. There is nothing to pay when you book.'
  },
  {
    question: 'When does music bingo start and finish?',
    answer:
      'The first game is at 7pm and the room is set from 6:30pm, unless the event listing for that date says otherwise. The pub itself is open from 12pm, so come early and eat first.'
  },
  {
    question: 'What is the format?',
    answer:
      'Two games where you listen to song clips and mark the track off your card, with interactive music games and quizzes between them. It is a good excuse to sing along and dance between tracks.'
  },
  {
    question: 'Do we need to book in advance?',
    answer:
      'Yes, we would recommend it. Music bingo does sell out, and seating is communal, so booking is how we make sure your group sits together.'
  },
  {
    question: 'Is music bingo suitable for families?',
    answer:
      'Yes. The music runs from the 1950s to today, so a mix of ages tends to cover more of the card than a group of the same age.'
  },
  {
    question: 'Can you run a private music bingo night?',
    answer:
      'Yes, private music bingo nights are available on request. Call 01753 682707 and we will put one together for your group.'
  }
]

function getEntryLabel(event: Event) {
  // Multiple ticket types with differing prices → "from £X" (lowest active type).
  if (hasMultipleTicketPrices(event)) {
    const lowest = getLowestTicketTypePrice(event)
    if (lowest !== null) {
      return lowest <= 0 ? 'Free entry' : `from £${lowest} entry`
    }
  }

  const rawPrice = event.offers?.price
  const parsedPrice = rawPrice ? Number.parseFloat(rawPrice) : Number.NaN

  if (event.isAccessibleForFree || parsedPrice === 0) {
    return 'Free entry'
  }

  if (Number.isFinite(parsedPrice)) {
    return `£${parsedPrice} entry`
  }

  if (typeof rawPrice === 'string' && rawPrice.trim().length > 0) {
    return rawPrice.trim()
  }

  return 'Entry details announced'
}

function MusicBingoEventCards({ events }: { events: Event[] }) {
  return (
    <EventDateCards
      events={events}
      eyebrow="Music bingo night"
      bookingSource="music_bingo_event_card"
      imageAltSuffix="music bingo night at The Anchor"
      renderMeta={(event, doorTime) => (
        <p className="text-xs text-ink-muted">Arrive from {doorTime ?? '6:30pm'} - {getEntryLabel(event)}</p>
      )}
      renderDetails={() => (
        <p className="text-sm text-ink-muted">
          Two themed games of song clips with interactive music rounds and quizzes between them.
          Grab your card, spot the track, and celebrate every line win.
        </p>
      )}
      emptyState={
        <>
          <p className="mb-2 text-lg font-semibold text-accent-text">New music bingo dates are loading soon</p>
          <p className="text-ink-muted">
            We are lining up the next singalong sessions. Call 01753 682707 and we will share the next date as soon as booking opens.
          </p>
        </>
      }
    />
  )
}

export default async function MusicBingoPage() {
  const events = await getGameNightEvents(musicBingo)
  const nextEvent = events[0]
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '7pm'
  const doorTime = nextEvent ? formatDoorClockTime(nextEvent.doorTime) ?? '6:30pm' : '6:30pm'
  // £5, corrected from £3 on 17 August 2026. The old figure appeared here, in the
  // config chips and in the FAQ while every live event record said 5, so the page
  // gave three different prices before the booking step gave a fourth.
  const entryLabel = nextEvent ? getEntryLabel(nextEvent) : '£5 entry'

  const heroDescription = nextEvent
    ? `Arrive from ${doorTime}, first game at ${nextEventTime}. ${entryLabel}, paid in cash on the night.`
    : 'Arrive from 6:30pm, first game at 7pm. £5 entry, paid in cash on the night.'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify({
          "@context": "https://schema.org",
          "@type": "EventSeries",
          "@id": "https://www.the-anchor.pub/#music-bingo-series",
          "name": "Music Bingo with Nikki Manfadge at The Anchor",
          "description": "Song clips replace numbers, prizes land across both games, and drag host Nikki Manfadge keeps the singalong energy high. A themed music bingo night in Stanwell Moor.",
          "startDate": "2024-01-01",
          "endDate": "2026-12-31",
          "eventSchedule": {
            "@type": "Schedule",
            "repeatFrequency": "P1M",
            // 7pm start, owner-confirmed 16 August 2026. This said 20:00, which
            // is where the "starts at 8pm" copy across the page came from. End
            // time is 23:00 to match `end_time` on the scheduled events in the
            // management DB, rather than the 21:00 that was carried over from an
            // older version of this block.
            "startTime": "19:00:00",
            "endTime": "23:00:00",
            "scheduleTimezone": "Europe/London"
          },
          "location": {
            "@type": "Place",
            "name": "The Anchor",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Horton Road",
              "addressLocality": "Stanwell Moor",
              "addressRegion": "Surrey",
              "postalCode": "TW19 6AQ",
              "addressCountry": "GB"
            }
          },
          "offers": {
            "@type": "Offer",
            // £5, matching every scheduled music bingo in the management DB.
            "price": "5",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "description": "£5 per person entry, cash on the night"
          },
          "performer": {
            "@type": "Person",
            "name": "Nikki Manfadge",
            "jobTitle": "Entertainment Host",
            "worksFor": { "@id": "https://www.the-anchor.pub/#organization" }
          },
          "organizer": {
            "@id": "https://www.the-anchor.pub/#organization"
          }
        }) }}
      />
      <ScrollDepthTracker />

      <InteriorHero
        image={musicBingo.hero.image}
        focal={musicBingo.hero.focal}
        crumb={musicBingo.hero.crumb}
        title={musicBingo.hero.title}
        lead={musicBingo.hero.lead}
        badges={<GameNightFacts facts={musicBingo.facts} />}
        actions={
          <GameNightCtaActions
            gameSlug={musicBingo.slug}
            label={buildGameNightCtaLabel(musicBingo, nextEvent)}
            hasBookableDate={Boolean(nextEvent)}
            location="hero"
          />
        }
      />

      <section className="py-section-y bg-surface">
        <Container>
          <PageTitle className="text-center text-accent-text" seo={{ structured: true, speakable: true }}>
            Music Bingo in Stanwell Moor
          </PageTitle>
          <p className="mx-auto text-center text-lg text-ink-muted">
            Bingo with the numbers swapped for song clips, hosted by drag queen Nikki Manfadge. Every
            date has its own theme, there are prizes across both games, and you do not need to know
            anything about music to play. {heroDescription}
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-2 md:items-start">
            <SectionViewTracker sectionId="music_bingo_booking">
              <GameNightBooking
                events={events}
                gameName={musicBingo.name}
                gameSlug={musicBingo.slug}
                bookingNote={musicBingo.bookingNote}
              />
            </SectionViewTracker>
            {/* Right column stacks the "how it runs" card and the objections. The
                booking form opposite is roughly three times the height of that
                card on its own, which left most of this column empty. */}
            <div className="space-y-6">
              <Card accent>
                <CardBody className="space-y-4">
                  <h3 className="text-h4 text-ink-strong">How music bingo runs</h3>
                  <ul className="space-y-3 text-ink-muted">
                    <li><strong>Arrive from {doorTime}</strong> · the pub is open from 12pm, so come earlier, eat, and collect your card.</li>
                    <li><strong>{nextEventTime}</strong> · first game begins, built around that night&rsquo;s theme.</li>
                    {/* Two games, not five rounds: docs/SSOT.md §10 says "Two games
                        with interactive music games and quizzes too". The page used
                        to claim five rounds, which the SSOT does not support. */}
                    <li><strong>Two games</strong> · song clips instead of numbers, with interactive music games and quizzes between them.</li>
                    <li><strong>Breaks between games</strong> · order food, top up drinks, and compare answers.</li>
                    <li><strong>Finale</strong> · last card of the night with the headline prize.</li>
                  </ul>
                  <p className="text-sm text-ink-muted">
                    Song clips are short, so keep ears open and phones away during the rounds.
                  </p>
                </CardBody>
              </Card>

              <SectionViewTracker sectionId="music_bingo_objections">
                <GameNightObjections
                  objections={musicBingo.objections}
                  gameName={musicBingo.name}
                  stack
                />
              </SectionViewTracker>
            </div>
          </div>
        </Container>
      </section>

      <GameNightGallery
        photos={musicBingo.photos}
        gameName={musicBingo.name}
        gameSlug={musicBingo.slug}
        title="What music bingo actually looks like"
        intro="Real photos from recent nights with Nikki Manfadge. Song clips instead of numbers, two games, and it does sell out."
      />

      <section id="music-bingo-dates" className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-6 text-center text-h3 text-ink-strong">Upcoming music bingo themes</h2>
            <p className="mb-8 text-center text-ink-muted">
              Every date has its own theme. Confirmed nights are below, and everything else we have on
              is on the{' '}
              <Link href="/whats-on" className="font-semibold text-accent-text hover:text-accent-text">
                What&apos;s On page
              </Link>{' '}
              or on 01753 682707.
            </p>
            <SectionViewTracker sectionId="music_bingo_dates">
              <MusicBingoEventCards events={events} />
            </SectionViewTracker>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-8 text-center text-h3 text-ink-strong">How to play, in three steps</h2>
            <Grid cols={3} gap="md">
              {HOW_TO_PLAY.map(step => (
                <GridItem key={step.title}>
                  <Card accent className="h-full">
                    <CardBody className="space-y-3">
                      <h3 className="text-xl font-semibold text-ink-strong">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-ink-muted">{step.body}</p>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </div>
        </Container>
      </section>

      {/* One food section, not the previous three-card row. The first of those
          cards promoted a Sunday roast warm-up, which was nonsense on this page:
          every listed music bingo date is a Friday. */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <h2 className="mb-3 text-h4 text-ink-strong">Eat before the first game</h2>
            <p className="mb-5 text-ink-muted">
              The full menu runs until 9pm, so order at your table before the first game or during the
              break between them. You do not need a separate dining booking, because your music bingo
              booking is your seat for the night.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BookTableButton source="music_bingo_food_cta" variant="outline" size="sm">
                Book a table for another night
              </BookTableButton>
              <Link href="/food-menu" className="text-sm font-semibold text-accent-text transition hover:text-anchor-green">
                See the food menu {'>'}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema faqs={FAQS} />

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <h2 className="mb-3 text-h4 text-ink-strong">More nights at The Anchor</h2>
            <p className="text-ink-muted">
              Prefer numbers to songs? Try{' '}
              <Link href="/cash-bingo" className="font-semibold text-accent-text transition hover:text-accent-text">
                cash bingo
              </Link>{' '}
              with a rolling snowball jackpot. There is also a{' '}
              <Link href="/quiz-night" className="font-semibold text-accent-text transition hover:text-accent-text">
                Wednesday pub quiz
              </Link>{' '}
              and{' '}
              <Link href="/karaoke" className="font-semibold text-accent-text transition hover:text-accent-text">
                karaoke
              </Link>{' '}
              when a night is listed.
            </p>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Ready to sing for the prizes?"
        copy="Music bingo sells out, so book your places rather than turning up on the night."
      >
        <GameNightCtaActions
          gameSlug={musicBingo.slug}
          label={buildGameNightCtaLabel(musicBingo, nextEvent)}
          hasBookableDate={Boolean(nextEvent)}
          location="closing_band"
        />
      </CtaBand>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="mb-3 text-h4 text-ink-strong">Find us</h2>
              <p className="mb-4 text-ink-muted">
                The Anchor, Horton Road, Stanwell Moor, TW19 6AQ. A few minutes from Staines, Ashford,
                Bedfont and Egham, with 20 free parking spaces on site.
              </p>
              <ul className="space-y-3 text-sm text-ink-muted">
                <li><strong>Driving:</strong> use postcode TW19 6AQ. 20 free spaces, first come, first served.</li>
                <li><strong>Public transport:</strong> 441 and 555 buses stop on Horton Road. Uber and Bolt know us well.</li>
                <li><strong>Accessibility:</strong> step-free bar and dining areas, flexible seating, and no accessible toilet.</li>
              </ul>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="https://maps.app.goo.gl/YNbjTDF9g7uCcbYF6"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-green px-4 py-2 font-semibold text-anchor-green transition hover:bg-anchor-green hover:text-white"
                >
                  Get directions
                </Link>
                <Link
                  href="https://wa.me/441753682707"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-gold-dark px-4 py-2 font-semibold text-accent-text transition hover:bg-anchor-gold-dark hover:text-anchor-green"
                >
                  WhatsApp the team
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
              <GoogleMapEmbed
                query="The Anchor, Stanwell Moor"
                className="h-full min-h-[300px] overflow-hidden rounded-xl border border-line shadow-sm"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* No <JsonLd data={bingoEventSeries} /> here. That constant describes the
          CASH bingo series ("Monthly Cash Bingo Night", £10 per book, cash only)
          and this page was publishing it alongside its own music bingo series, so
          the music bingo URL declared itself to be a £10 cash bingo night as well
          as a £5 music bingo one. It belongs on /cash-bingo only. */}
      {events.map(event => (
        <EventSchema key={`event-schema-${event.id}`} event={event} />
      ))}
    </>
  )
}
