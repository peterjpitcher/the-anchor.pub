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
import { JsonLd } from '@/components/JsonLd'
import { bingoEventSeries } from '@/lib/schema'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Music Bingo Near Heathrow | Win Every Round',
  description:
    'Singalong Music Bingo at The Anchor, Stanwell Moor, song snippets replace numbers, prizes every round. Book early, it sells out. 7 mins from Heathrow T5.',
  openGraph: {
    title: 'Music Bingo Near Heathrow | The Anchor',
    description: 'Song snippets replace numbers, prizes every round. Book for this singalong bingo night in Stanwell Moor.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Music Bingo Near Heathrow | The Anchor',
    description: 'Song snippets replace numbers, prizes every round. Book for this singalong bingo night in Stanwell Moor.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: '/music-bingo'
  }
}

// Category lookup, fetching and sorting all live in lib/game-nights/events.ts,
// shared by the four game pages.

const WHY_LOVE_IT = [
  {
    icon: '',
    title: 'Songs replace numbers',
    body: 'We play short clips from chart hits, throwbacks, and guilty pleasures. Mark the track on your card and you are closer to a line.'
  },
  {
    icon: '',
    title: 'Hosted by Nikki Manfadge',
    body: 'Expect big singalong energy, cheeky shout-outs, and bonus moments that keep the room buzzing between rounds.'
  },
  {
    icon: '',
    title: 'Prizes every round',
    body: 'Line wins, full house prizes, and surprise treats mean there is always something to play for.'
  },
  {
    icon: '',
    title: 'Food and cocktails ready',
    body: 'Order from the full menu before the first round or during breaks. The kitchen keeps your table fuelled.'
  },
  {
    icon: '',
    title: 'Friendly, all-ages vibe',
    body: 'Bring mates, family, or coworkers. We keep it welcoming, inclusive, and easy for first timers.'
  }
]

const FAQS = [
  {
    question: 'When does Music Bingo start and finish?',
    answer:
      'It typically starts at 8pm unless the event listing says otherwise. We play two games, with interactive music games and quizzes too.'
  },
  {
    question: 'How much is entry?',
    answer:
      'Entry is £3 per person.'
  },
  {
    question: 'Do we need to book in advance?',
    answer:
      'Booking is strongly recommended if you want a great seat, but walk-ins are welcome.'
  },
  {
    question: 'What is the format?',
    answer:
      'We play two games where you listen to the songs, then guess the song and artist on your card. It is a great excuse to sing along and dance between tracks.'
  },
  {
    question: 'Is Music Bingo suitable for families?',
    answer:
      'Absolutely. We play music from the 1950s to today, so bring a mix of ages to cover all the songs and artists.'
  },
  {
    question: 'Can we eat and drink during the games?',
    answer:
      'Absolutely. Check the live kitchen hours for the night, then order before the first game or during breaks.'
  },
  {
    question: 'Can you run a private Music Bingo night?',
    answer:
      'Yes, we can host private Music Bingo nights by request.'
  },
  {
    question: 'Where can I see the latest dates?',
    answer:
      'All of our dates for all upcoming events are available at https://www.the-anchor.pub/whats-on.'
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
        <p className="text-xs text-ink-muted">Doors {doorTime ?? '6:30pm'} - {getEntryLabel(event)}</p>
      )}
      renderDetails={() => (
        <p className="text-sm text-ink-muted">
Two games of song snippets with interactive music rounds and quizzes between them. Grab your card,
          spot the track, and celebrate every line win.
        </p>
      )}
      emptyState={
        <>
          <p className="mb-2 text-lg font-semibold text-accent-text">New Music Bingo dates are loading soon</p>
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
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '8pm'
  const doorTime = nextEvent ? formatDoorClockTime(nextEvent.doorTime) ?? '6:30pm' : '6:30pm'
  const entryLabel = nextEvent ? getEntryLabel(nextEvent) : '£3 entry'

  const heroDescription = nextEvent
    ? `Doors ${doorTime}. Music Bingo starts at ${nextEventTime}. ${entryLabel}. Booking is recommended.`
    : 'Doors 6:30pm. Music Bingo starts at 8pm. £3 entry. Booking is recommended.'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify({
          "@context": "https://schema.org",
          "@type": "EventSeries",
          "@id": "https://www.the-anchor.pub/#music-bingo-series",
          "name": "Music Bingo with Nikki Manfadge at The Anchor",
          "description": "Song snippets replace numbers, prizes land every round, and Nikki Manfadge keeps the singalong energy high. A fun bingo night near Heathrow.",
          "startDate": "2024-01-01",
          "endDate": "2026-12-31",
          "eventSchedule": {
            "@type": "Schedule",
            "repeatFrequency": "P1M",
            "startTime": "20:00:00",
            "endTime": "22:00:00",
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
            "price": "3",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "description": "£3 per person entry"
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
            Music Bingo Near Heathrow - Stanwell Moor, Staines and Surrey
          </PageTitle>
          <p className="mx-auto text-center text-lg text-ink-muted">
            Looking for a music bingo night near Heathrow that feels like a proper local? It's one of the best things to do near Heathrow for a fun evening out. We swap bingo numbers for
            song clips, hand out prizes every round, and keep the atmosphere warm and welcoming. {heroDescription}
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
            <Card accent>
              <CardBody className="space-y-4">
                <h3 className="text-h4 text-ink-strong">How Music Bingo runs</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong>Doors {doorTime}</strong> - arrive early, grab drinks, and collect your bingo card.</li>
<li><strong>{nextEventTime}</strong> - first game begins with chart favourites and classics.</li>
                  {/* Two games, not five rounds: docs/SSOT.md §10 says "Two games
                      with interactive music games and quizzes too". The page used
                      to claim five rounds, which the SSOT does not support. Main
                      independently softened this to "The games"; this is the same
                      fix, stated specifically. */}
                  <li><strong>Two games</strong> - song clips instead of numbers, with interactive music games and quizzes between them.</li>
                  <li><strong>Breaks between games</strong> - order food, top up drinks, and compare answers.</li>
                  <li><strong>Finale</strong> - last card of the night with the headline prize.</li>
                </ul>
                <p className="text-sm text-ink-muted">
                  Song clips are short, so keep ears open and phones away during the rounds.
                </p>
              </CardBody>
            </Card>
          </div>

          <SectionViewTracker sectionId="music_bingo_objections" className="mt-10">
            <GameNightObjections objections={musicBingo.objections} gameName={musicBingo.name} />
          </SectionViewTracker>
        </Container>
      </section>

      <section id="music-bingo-dates" className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-6 text-center text-h3 text-ink-strong">Upcoming Music Bingo dates</h2>
            <p className="mb-8 text-center text-ink-muted">
              We list confirmed Music Bingo dates below. For the very latest schedule, check the{' '}
              <Link href="/whats-on" className="font-semibold text-accent-text hover:text-accent-text">
                What's On page
              </Link>{' '}
              or call 01753 682707.
            </p>
            <SectionViewTracker sectionId="music_bingo_dates">
              <MusicBingoEventCards events={events} />
            </SectionViewTracker>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-3">
            <Card accent>
              <CardBody>
                <h3 className="mb-2 text-xl font-semibold text-accent-text">Sunday Roast Music Bingo Warm-Up</h3>
                <p className="mb-4 text-sm text-ink-muted">
                  Walk in for a Sunday roast (served 1pm-6pm) or book ahead, then bring the crew for Music Bingo.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="music_bingo_roast_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book Sunday Roast
                  </BookTableButton>
                  <Link href="/sunday-roast" className="text-sm font-semibold text-accent-text transition hover:text-anchor-green">
                    Sunday roast menu {'>'}
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="mb-2 text-xl font-semibold text-accent-text">Stone-Baked Pizza Warm-Up</h3>
                <p className="mb-4 text-sm text-ink-muted">
                  Hand-stretched pizzas and sharers keep your table fuelled between rounds.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="music_bingo_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm font-semibold text-accent-text transition hover:text-anchor-green">
                    View pizza menu {'>'}
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="mb-2 text-xl font-semibold text-accent-text">All-Day Menu and Cocktails</h3>
                <p className="mb-4 text-sm text-ink-muted">
                  Burgers, sharers, and themed cocktails delivered to your table all night.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="music_bingo_food_menu_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm font-semibold text-accent-text transition hover:text-anchor-green">
                    Browse food and drinks {'>'}
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-8 text-center text-h2 text-ink-strong">
              Why everyone loves Music Bingo at The Anchor
            </h2>
            <Grid cols={WHY_LOVE_IT.length > 3 ? 3 : 2} gap="md">
              {WHY_LOVE_IT.map(feature => (
                <GridItem key={feature.title}>
                  <Card accent className="h-full">
                    <CardBody className="space-y-3">
                      <div className="text-4xl">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-ink-strong">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-ink-muted">{feature.body}</p>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-2 md:items-start">
            <Card accent>
              <CardBody className="space-y-4">
                <h3 className="text-h4 text-ink-strong">How to play Music Bingo</h3>
                <ol className="space-y-3 text-ink-muted">
                  <li>1. Grab your card and listen for the song clip.</li>
                  <li>2. Mark the track on your card as soon as you spot it.</li>
                  <li>3. Shout when you hit the pattern for that round.</li>
                  <li>4. Keep playing for the full house finale prize.</li>
                </ol>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody className="space-y-4">
                <h3 className="text-h4 text-ink-strong">Music Bingo house rules</h3>
                <ul className="space-y-3 text-sm text-ink">
                  <li>Phones away during rounds so everyone gets a fair listen.</li>
                  <li>Singing along is encouraged, but keep shouting to a cheer.</li>
                  <li>Caller's decision is final on line and full house wins.</li>
                  <li>Dogs are welcome and water bowls are ready at the bar.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-6 text-center text-h3 text-ink-strong">Tips for a winning card</h2>
            <p className="mx-auto mb-6 text-center text-ink-muted">
              Whether you are new to music bingo or a seasoned singalong legend, these tips keep your ears sharp.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Card accent className="h-full">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-ink-strong">Bring a mixed crew</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Team up with friends who love different eras of music so you can nail the classics, throwbacks, and current hits.
                  </p>
                </CardBody>
              </Card>
              <Card accent className="h-full">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-ink-strong">Arrive early</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Doors open at {doorTime}. Grab your drinks, settle the table, and you will not miss the opening clips.
                  </p>
                </CardBody>
              </Card>
              <Card accent className="h-full">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-ink-strong">Keep your card visible</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Clear the table and keep your card in sight so you can mark the track before the next clip drops.
                  </p>
                </CardBody>
              </Card>
              <Card accent className="h-full">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-ink-strong">Stay for the finale</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    The last round brings the biggest prize, so stick around and keep the energy high.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema faqs={FAQS} />

      <CtaBand
        title="Ready to sing for the prizes?"
        copy="Music bingo sells out, so book your table rather than turning up on the night."
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
                The Anchor - Horton Road, Stanwell Moor, TW19 6AQ - Free on-site parking - 7 minutes from Heathrow T5 - 8 minutes from Staines.
              </p>
              <ul className="space-y-3 text-sm text-ink-muted">
                <li><strong>Driving:</strong> Use postcode TW19 6AQ. Plenty of free parking right outside.</li>
                <li><strong>Public transport:</strong> 441 and 555 buses stop on Horton Road. Uber and Bolt know us well.</li>
                <li><strong>Accessibility:</strong> Step-free bar and dining areas, flexible seating, and no accessible toilet.</li>
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

      <JsonLd data={bingoEventSeries} />
      {events.map(event => (
        <EventSchema key={`event-schema-${event.id}`} event={event} />
      ))}
    </>
  )
}
