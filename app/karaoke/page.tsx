import { Metadata } from 'next'
import { Container, Card, CardBody, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { HeroBadge } from '@/components/HeroBadge'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventDateCards } from '@/components/features/EventDateCards'
import {
  GameNightBooking,
  GameNightCtaActions,
  GameNightFacts,
  GameNightObjections,
  buildGameNightCtaLabel
} from '@/components/features/GameNight'
import { karaoke, getGameNightEvents } from '@/lib/game-nights'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SectionViewTracker } from '@/components/tracking/SectionViewTracker'
import { formatEventDate, formatEventTime, type Event } from '@/lib/api'
import Link from 'next/link'
import { BookTableButton } from '@/components/BookTableButton'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

/**
 * Karaoke is the largest organic opportunity across the four game pages: GKP puts
 * "karaoke near me" at 50,000 UK searches a month and "karaoke bar near me" at
 * another 5,000, against 5,000 for the quiz head terms and 500 for cash bingo.
 * See tasks/keyword-plan-game-nights-2026-08-17.md.
 *
 * That does not license claiming a cadence. docs/SSOT.md §10 is explicit that
 * karaoke is occasional, has no fixed host and gets no recurring EventSeries
 * schema. The page therefore targets the query while telling the truth about how
 * often it runs, and leans on the two things that are always true: it is free,
 * and nobody has to sing.
 */
export const metadata: Metadata = {
  title: 'Karaoke Near Me | Free Entry, Stanwell Moor',
  description:
    'Free entry karaoke at The Anchor in Stanwell Moor. Sing, share a duet or just watch. All ages welcome, communal seating, free parking. See the next confirmed night.',
  openGraph: {
    title: 'Karaoke at The Anchor, Stanwell Moor',
    description: 'Free entry karaoke when a night is listed. Sing, duet or just cheer along. All ages welcome.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub in Stanwell Moor' }]
  },
  twitter: getTwitterMetadata({
    title: 'Karaoke at The Anchor, Stanwell Moor',
    description: 'Free entry karaoke when a night is listed. Sing, duet or just cheer along. All ages welcome.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: './'
  }
}

// Category lookup, fetching, de-duplication and sorting all live in
// lib/game-nights/events.ts, shared by the four game pages. Karaoke's two
// categories (including the legacy one) are declared in lib/game-nights/karaoke.ts.

/**
 * Three steps, written for someone who has never done it and is quietly worried
 * about being made to perform.
 *
 * This replaced a five-card "why our karaoke nights hit the high notes" block
 * that claimed a 50,000-song library (docs/SSOT.md says take song-count detail
 * from the event listing, not from the page) and sold "Liquid Courage" and
 * "courage-boosting shots". Suggesting people need a drink before they can sing
 * excludes anyone not drinking and makes the night sound alcohol-dependent
 * rather than welcoming.
 */
const HOW_IT_WORKS = [
  {
    title: 'Turn up and get comfortable',
    body: 'The pub is open from 12pm, so come early, eat, and settle in. Seating is communal, which means we lay the room out for the number of people booked in.'
  },
  {
    title: 'Ask the host for a song',
    body: 'Tell whoever is hosting what you fancy singing and they will add you to the queue. Solo, a duet with a mate, or the whole table in on the chorus.'
  },
  {
    title: 'Or do not sing at all',
    body: 'Genuinely. A good karaoke night needs a room that claps, and most people come to be the audience. Nobody gets dragged up.'
  }
]

const FAQS = [
  {
    question: 'Where is your karaoke night?',
    answer:
      'At The Anchor on Horton Road, Stanwell Moor, TW19 6AQ. It is a few minutes from Staines, Ashford, Bedfont and Egham, with 20 free parking spaces on site and the 441 and 555 buses stopping on Horton Road.'
  },
  {
    question: 'How much does karaoke cost?',
    answer:
      'Nothing. Entry is free and singing is free. We do ask you to book a free place for each person, because seating is communal and we need to know how many seats to lay out.'
  },
  {
    question: 'What songs can I sing?',
    answer:
      'The song list spans several decades, so most people find something they know. Ask the host on the night and they will get you queued up, with availability depending on the library and how much of the night is left.'
  },
  {
    question: 'Do we get our own table?',
    answer:
      'No. Karaoke uses communal seating, so there are no reserved tables. Book everyone in your group in one booking and we will seat you together, though on a busy night a long table may be shared with other guests.'
  },
  {
    question: 'Is karaoke suitable for families?',
    answer:
      'Yes. All ages are welcome at any point in the evening, with under-18s accompanied by a supervising adult.'
  }
]

function KaraokeEventCards({ events }: { events: Event[] }) {
  return (
    <EventDateCards
      events={events}
      eyebrow="Karaoke night"
      bookingSource="karaoke_event_card"
      imageAltSuffix="karaoke night at The Anchor"
      renderMeta={() => <p className="text-xs text-ink-muted">Free entry</p>}
      renderDetails={() => (
        <p className="text-sm text-ink-muted">
          Free entry, communal seating and a song list spanning several decades. Sing, share a duet,
          or just come and cheer everyone else on.
        </p>
      )}
      emptyState={
        <>
          <p className="mb-2 text-lg font-semibold text-accent-text">No karaoke night in the diary right now</p>
          <p className="text-ink-muted">
            Karaoke runs occasionally rather than to a fixed schedule, so there is not always a date
            listed. Call 01753 682707 and we will tell you when the next one goes in, or see{' '}
            <Link href="/whats-on" className="font-semibold text-accent-text hover:text-accent-text">
              what else is on
            </Link>{' '}
            in the meantime.
          </p>
        </>
      }
    />
  )
}

export default async function KaraokePage() {
  const events = await getGameNightEvents(karaoke)
  const nextEvent = events[0]
  const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : null
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : null

  const heroDescription = nextEvent
    ? `The next one is ${nextEvent.name} on ${nextEventDate} at ${nextEventTime}. Free entry, and you can book your places below.`
    : 'There is no karaoke night in the diary at the moment. Call 01753 682707 and we will let you know when the next one is confirmed.'

  return (
    <>
      {/*
        * No EventSeries schema here on purpose. Owner-confirmed 11 August 2026:
        * karaoke is not a regular feature this year and has no fixed host. The
        * schema previously declared a monthly series ("repeatFrequency": "P1M")
        * running to 2026-12-31 with Nikki Manfadge as the performer, none of
        * which is true. Nikki hosts Music Bingo, not karaoke.
        *
        * Individual karaoke nights still get their own Event schema from the
        * events system whenever one is actually listed, which is the honest
        * place for it. Do not reinstate a recurring series here.
        */}
      <ScrollDepthTracker />

      <InteriorHero
        image={karaoke.hero.image}
        focal={karaoke.hero.focal}
        crumb={karaoke.hero.crumb}
        title={karaoke.hero.title}
        lead={karaoke.hero.lead}
        badges={<GameNightFacts facts={karaoke.facts} />}
        actions={
          <GameNightCtaActions
            gameSlug={karaoke.slug}
            label={buildGameNightCtaLabel(karaoke, nextEvent)}
            hasBookableDate={Boolean(nextEvent)}
            location="hero"
          />
        }
      />

      <section className="bg-surface-sunk py-section-y">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <PageTitle className="text-center text-accent-text" seo={{ structured: true, speakable: true }}>
            Karaoke at The Anchor, Stanwell Moor
          </PageTitle>
          <p className="mx-auto text-center text-lg text-ink-muted">
            A village pub karaoke night rather than a karaoke bar: free to get in, free to sing, and
            nobody minds whether you are note perfect. We run it occasionally rather than every week,
            so check the date before you set off. {heroDescription}
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-2 md:items-start">
            <SectionViewTracker sectionId="karaoke_booking">
              <GameNightBooking
                events={events}
                gameName={karaoke.name}
                gameSlug={karaoke.slug}
                bookingNote={karaoke.bookingNote}
              />
            </SectionViewTracker>
            {/* Right column stacks the "how it works" card and the objections, so
                it is not left mostly empty beside the much taller booking form. */}
            <div className="space-y-6">
              <Card accent>
                <CardBody className="space-y-4">
                  <h3 className="text-h4 text-ink-strong">How the night works</h3>
                  <ul className="space-y-3 text-ink-muted">
                    <li><strong>Free entry.</strong> No charge to come in and no charge to sing.</li>
                    <li><strong>Book a free place each.</strong> Seating is communal, so the booking tells us how many seats to lay out.</li>
                    <li><strong>All ages welcome.</strong> Under-18s need a supervising adult with them.</li>
                    <li><strong>Dates vary.</strong> Karaoke is occasional, so check the listing before you travel.</li>
                  </ul>
                  <p className="text-sm text-ink-muted">
                    Solo singers, duets and whole-table singalongs all welcome. So is sitting there
                    with a drink and never touching the microphone.
                  </p>
                </CardBody>
              </Card>

              <SectionViewTracker sectionId="karaoke_objections">
                <GameNightObjections
                  objections={karaoke.objections}
                  gameName={karaoke.name}
                  stack
                />
              </SectionViewTracker>
            </div>
          </div>
        </Container>
      </section>

      <section id="karaoke-dates" className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-6 text-center text-h3 text-ink-strong">Upcoming karaoke nights</h2>
            <p className="mb-8 text-center text-ink-muted">
              Any confirmed night is listed here. For everything else we have on, see{' '}
              <Link href="/whats-on" className="font-semibold text-accent-text hover:text-accent-text">
                What&apos;s On
              </Link>{' '}
              or call 01753 682707.
            </p>
            <SectionViewTracker sectionId="karaoke_dates">
              <KaraokeEventCards events={events} />
            </SectionViewTracker>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-8 text-center text-h3 text-ink-strong">What actually happens</h2>
            <Grid cols={3} gap="md">
              {HOW_IT_WORKS.map(step => (
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

      {/* One food and drink section, not a three-card row of near-identical
          "Book a Table" buttons. Those competed with the event booking above and
          made a visitor wonder whether they needed two bookings. They do not. */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <h2 className="mb-3 text-h4 text-ink-strong">Eat before you sing</h2>
            <p className="mb-5 text-ink-muted">
              The kitchen is open on karaoke nights, with times varying by date, so order at your seat
              before things get going. You do not need a separate table booking to eat: your karaoke
              booking is your seat for the evening.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BookTableButton source="karaoke_food_cta" variant="outline" size="sm">
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
                <li><strong>Public transport:</strong> 441 and 555 buses stop on Horton Road.</li>
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
                  WhatsApp us
                </Link>
              </div>
            </div>
            <div className="h-full">
              <GoogleMapEmbed
                query="The Anchor, Stanwell Moor"
                className="h-full min-h-[300px] overflow-hidden rounded-xl border border-line shadow-sm"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <h2 className="mb-3 text-h4 text-ink-strong">More nights at The Anchor</h2>
            <p className="text-ink-muted">
              Karaoke not on this month? There is a{' '}
              <Link href="/quiz-night" className="font-semibold text-accent-text transition hover:text-accent-text">
                Wednesday pub quiz
              </Link>{' '}
              with a £25 bar tab for the winners,{' '}
              <Link href="/music-bingo" className="font-semibold text-accent-text transition hover:text-accent-text">
                music bingo
              </Link>{' '}
              with Nikki Manfadge, and{' '}
              <Link href="/cash-bingo" className="font-semibold text-accent-text transition hover:text-accent-text">
                cash bingo
              </Link>{' '}
              with a rolling snowball jackpot.
            </p>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Sing, duet, or just come and watch"
        copy="Entry is free. Book a free place per person so we know how many seats to lay out."
      >
        <GameNightCtaActions
          gameSlug={karaoke.slug}
          label={buildGameNightCtaLabel(karaoke, nextEvent)}
          hasBookableDate={Boolean(nextEvent)}
          location="closing_band"
        />
      </CtaBand>

      {/* No per-event Event schema here on purpose.
        Google: "The event experience on Google only supports pages that focus
        on a single event. We recommend focusing on adding markup to your event
        posting pages instead of pages that list schedules or multiple events."
        https://developers.google.com/search/docs/appearance/structured-data/event
        Each event already carries its own Event markup on /events/[id]. */}
    </>
  )
}
