import { Metadata } from 'next'
import { Container, Card, CardBody, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import {
  GameNightBooking,
  GameNightBreadcrumb,
  GameNightCtaActions,
  GameNightDateCards,
  GameNightFacts,
  GameNightGallery,
  GameNightObjections,
  GameNightSocialProof,
  buildGameNightCtaLabel
} from '@/components/features/GameNight'
import { cashBingo, getGameNightEvents, buildGameNightMetadata } from '@/lib/game-nights'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SectionViewTracker } from '@/components/tracking/SectionViewTracker'
import { formatEventTime, formatDoorClockTime, type Event } from '@/lib/api'
import Link from 'next/link'
import { BookTableButton } from '@/components/BookTableButton'
import { PsychBadge } from '@/components/psychology'
import { JsonLd } from '@/components/JsonLd'
import { bingoEventSeries } from '@/lib/schema'

/**
 * The title stays pub-qualified on purpose. GKP measures "bingo night near me"
 * and "pub bingo near me" at 500 UK searches a month each, while every town-level
 * bingo term ("bingo staines", "bingo night surrey", "bingo ashford middlesex")
 * returned no data at all. The unqualified "bingo" SERP belongs to Buzz Bingo
 * Feltham and the online operators, so chasing it would be spending relevance on
 * a fight we lose. See tasks/keyword-plan-game-nights-2026-08-17.md.
 */
export const metadata: Metadata = buildGameNightMetadata(cashBingo, {
  title: 'Pub Bingo Near Me | Cash Bingo in Stanwell Moor',
  // Both halves of the age rule (docs/SSOT.md §10), never one without the other.
  // This description previously ended "18+ to play." on its own, which is the
  // half that turns a family away, published without the half that invites them.
  description:
    'Traditional cash bingo at The Anchor, Stanwell Moor. £10 a book, cash only, ten games and a rolling snowball jackpot. 18+ to play, supervised under 18s welcome.',
  shareTitle: 'Cash Bingo at The Anchor, Stanwell Moor',
  shareDescription:
    'Ten games, £10 a book, cash only, winnings paid out on the night and a rolling snowball jackpot.'
})

// Category lookup, fetching and sorting all live in lib/game-nights/events.ts,
// shared by the four game pages.

/**
 * Three cards, replacing a five-card block that read as though it had been
 * written for a keyword tool rather than a customer: "bingo games for money",
 * "bingo hall", "bingo room", "bingo number caller", "play bingo for cash". The
 * repetition is what a newcomer notices, and it made the page feel machine
 * written rather than like the local pub it is describing.
 */
const WHAT_IT_IS = [
  {
    title: 'One book, ten games',
    body: 'A book costs £10 in cash and covers every game of the night. Half of all book sales go into the final cash jackpot, so the fuller the room, the bigger that last prize gets.'
  },
  {
    title: 'Winnings paid on the night',
    body: 'Cash prizes are handed over there and then, alongside spot prizes and the odd bit of chocolate. Prizes vary from month to month.'
  },
  {
    title: 'The rolling snowball',
    body: 'Every month nobody claims it, the snowball grows by £20 and gains two extra calls, which makes it easier to win the longer it survives. The current target is on the event listing.'
  }
]

const FAQS = [
  {
    question: 'What time does cash bingo start and finish?',
    answer:
      'Please arrive by 6:30pm so you have time for a drink, to order food and to buy your books. The first game is at 7pm and we finish around 9:30pm, with breaks along the way. The pub itself is open from 12pm, so you are welcome much earlier.'
  },
  {
    question: 'How much is it to play and how do I pay?',
    answer:
      'Each book is £10 and covers all ten games. Books and £1 daubers are cash only, and winnings are paid out in cash on the night, so bring notes. The bar itself takes card as normal.'
  },
  {
    question: 'Is there an age limit for bingo night?',
    answer:
      'You need to be 18 or over to buy a book and play for the cash prizes. Supervised under-18s are welcome to come along with you, they just cannot play.'
  },
  {
    question: 'How does the snowball jackpot work?',
    answer:
      'It is a full house within a set number of calls. Each month it goes unclaimed it grows by £20 and gains two extra calls, so it gets easier to win over time. The current target and who is eligible are on the event listing below, because those change every month.'
  },
  {
    question: 'Do I need to book in advance?',
    answer:
      'Yes, we would recommend it. Seating is communal, so booking everyone in one go is how we make sure your group sits together. If booking is not open yet, call 01753 682707.'
  },
  {
    question: 'Can we host a private cash bingo fundraiser?',
    answer:
      'Yes. From corporate socials to charity nights we can supply callers, books and a prize structure. Email manager@the-anchor.pub or call 01753 682707.'
  }
]

function BingoEventCards({ events }: { events: Event[] }) {
  return (
    <GameNightDateCards
      events={events}
      eyebrow="Monthly cash bingo"
      bookingSource="cash_bingo_event_card"
      calendarSource="cash_bingo_date_card"
      imageAltSuffix="cash bingo night at The Anchor"
      renderMeta={(_event, doorTime) => (
        <p className="text-xs text-ink-muted">Arrive by {doorTime ?? '6:30pm'} • £10 cash book</p>
      )}
      renderDetails={() => (
        <p className="text-sm text-ink-muted">
          One £10 cash-only book covers all ten games, and half of every book sold goes into the
          final jackpot. The snowball grows by £20, and two extra calls, each time it rolls over.
        </p>
      )}
      emptyState={
        <>
          <p className="mb-2 text-lg font-semibold text-accent-text">New cash bingo dates are loading soon</p>
          <p className="text-ink-muted">
            We&rsquo;re finalising the next jackpot night. Call 01753 682707 and we&rsquo;ll text you as soon as books go on sale.
          </p>
        </>
      }
    />
  )
}

export default async function CashBingoPage() {
  const events = await getGameNightEvents(cashBingo)
  const nextEvent = events[0]
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '7pm'
  // 6:30pm, owner-confirmed 17 August 2026: "I want people in for 6:30pm so they
  // have time to get a drink, order some food, get their books and get comfortable
  // for a 7pm start." The page previously gave three different arrival times.
  const doorTime = nextEvent ? formatDoorClockTime(nextEvent.doorTime) ?? '6:30pm' : '6:30pm'

  const heroDescription = nextEvent
    ? `Arrive by ${doorTime} and the first game is at ${nextEventTime}. Books are £10 each, cash only, bought when you get here.`
    : 'Arrive by 6:30pm and the first game is at 7pm. Books are £10 each, cash only, bought when you get here.'

  return (
    <>
      <GameNightBreadcrumb config={cashBingo} />
      <ScrollDepthTracker />

      <InteriorHero
        image={cashBingo.hero.image}
        focal={cashBingo.hero.focal}
        crumb={cashBingo.hero.crumb}
        title={cashBingo.hero.title}
        lead={cashBingo.hero.lead}
        badges={<GameNightFacts facts={cashBingo.facts} />}
        actions={
          <GameNightCtaActions
            gameSlug={cashBingo.slug}
            label={buildGameNightCtaLabel(cashBingo, nextEvent)}
            hasBookableDate={Boolean(nextEvent)}
            location="hero"
          />
        }
      />

      <section className="py-section-y bg-surface">
        <Container>
          <PageTitle className="text-center text-accent-text" seo={{ structured: true, speakable: true }}>
            Cash Bingo in Stanwell Moor
          </PageTitle>
          <p className="mx-auto text-center text-lg text-ink-muted">
            Traditional bingo in a village pub rather than a bingo hall: ten games, a friendly caller,
            numbers on the pub screens, and hot food from the kitchen while you play. Everyone aged 18
            or over can play and win, and supervised under-18s are welcome to come along.{' '}
            {heroDescription}
          </p>
          <div className="mt-4 flex justify-center">
            <PsychBadge variant="prize" label="Cash prizes every game" />
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-2 md:items-start">
            <div className="space-y-4">
              <SectionViewTracker sectionId="cash_bingo_booking">
                <GameNightBooking
                  events={events}
                  gameName={cashBingo.name}
                  gameSlug={cashBingo.slug}
                  bookingNote={cashBingo.bookingNote}
                />
              </SectionViewTracker>
              <GameNightSocialProof gameName={cashBingo.name} />
            </div>
            {/* Right column stacks the "what £10 buys" card and the objections. The
                booking form opposite is roughly three times the height of that
                card on its own, which left most of this column empty. */}
            <div className="space-y-6">
              <Card accent>
                <CardBody className="space-y-4">
                  <h3 className="text-h4 text-ink-strong">What your £10 buys</h3>
                  <p className="text-ink-muted">
                    One book, covering all ten games of the night. Half of every book sold goes into
                    the final cash jackpot, so it grows with the size of the room.
                  </p>
                  <p className="text-ink-muted">
                    Ten quick games with two planned pauses, so you can top up drinks and order from
                    the kitchen without missing a call. Expect classic bingo banter, spot prizes and a
                    snowball countdown that gets louder as the numbers close in.
                  </p>
                  <p className="text-sm text-ink-muted">
                    Caller&rsquo;s decision is final, mobiles stay on silent, and tied games split the
                    winnings evenly.
                  </p>
                </CardBody>
              </Card>

              <SectionViewTracker sectionId="cash_bingo_objections">
                <GameNightObjections
                  objections={cashBingo.objections}
                  gameName={cashBingo.name}
                  stack
                />
              </SectionViewTracker>
            </div>
          </div>
        </Container>
      </section>

      <GameNightGallery
        photos={cashBingo.photos}
        gameName={cashBingo.name}
        gameSlug={cashBingo.slug}
        title="What a cash bingo night looks like"
        intro="Real photos from recent nights. Ten games, winnings paid out on the night, and a snowball that grows every month nobody claims it."
      />

      <section id="bingo-dates" className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-6 text-center text-h3 text-ink-strong">Upcoming cash bingo dates</h2>
            <p className="mb-8 text-center text-ink-muted">
              Confirmed nights are below, each with its own snowball target. For everything else we
              have on, see{' '}
              <Link href="/whats-on" className="font-semibold text-accent-text hover:text-accent-text">
                What&rsquo;s On
              </Link>{' '}
              or call 01753 682707.
            </p>
            <SectionViewTracker sectionId="cash_bingo_dates">
              <BingoEventCards events={events} />
            </SectionViewTracker>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-8 text-center text-h3 text-ink-strong">How the night works</h2>
            <Grid cols={3} gap="md">
              {WHAT_IT_IS.map(item => (
                <GridItem key={item.title}>
                  <Card accent className="h-full">
                    <CardBody className="space-y-3">
                      <h3 className="text-xl font-semibold text-ink-strong">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
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
          every listed cash bingo date is a Wednesday, and it also sat oddly beside
          an 18-plus-to-play night. */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <h2 className="mb-3 text-h4 text-ink-strong">Eat before the first game</h2>
            <p className="mb-5 text-ink-muted">
              The full menu runs until 9pm, so order at your table when you arrive or during one of
              the breaks. You do not need a separate dining booking, because your bingo booking is
              your seat for the night.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BookTableButton source="bingo_food_cta" variant="outline" size="sm">
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
              Prefer songs to numbers? We also run{' '}
              <Link href="/music-bingo" className="font-semibold text-accent-text hover:text-accent-text">
                music bingo
              </Link>
              , where you mark off tracks instead. There is also a{' '}
              <Link href="/quiz-night" className="font-semibold text-accent-text hover:text-accent-text">
                Wednesday pub quiz
              </Link>{' '}
              and{' '}
              <Link href="/karaoke" className="font-semibold text-accent-text hover:text-accent-text">
                karaoke
              </Link>{' '}
              when a night is listed.
            </p>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Ready to shout bingo?"
        copy="Reserve your places now and bring £10 cash per book for when you arrive."
      >
        <GameNightCtaActions
          gameSlug={cashBingo.slug}
          label={buildGameNightCtaLabel(cashBingo, nextEvent)}
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
                <li><strong>Accessibility:</strong> step-free bar and dining areas, flexible seating for players, and no accessible toilet.</li>
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
      {/* No per-event Event schema here on purpose.
        Google: "The event experience on Google only supports pages that focus
        on a single event. We recommend focusing on adding markup to your event
        posting pages instead of pages that list schedules or multiple events."
        https://developers.google.com/search/docs/appearance/structured-data/event
        Each event already carries its own Event markup on /events/[id]. */}
    </>
  )
}
