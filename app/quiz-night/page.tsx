import { Metadata } from 'next'
import { Badge, Container, Card, CardBody } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import Link from 'next/link'
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
import { quizNight, getGameNightEvents } from '@/lib/game-nights'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SectionViewTracker } from '@/components/tracking/SectionViewTracker'
import { formatEventTime, formatDoorClockTime, type Event } from '@/lib/api'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { JsonLd } from '@/components/JsonLd'
import { quizNightEventSeries } from '@/lib/schema'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'

/**
 * Title and description carry "pub quiz near me" and "Wednesday", which are the
 * two measured wins for this page: GKP puts "pub quiz near me" and "quiz night
 * near me" at 5,000 UK searches a month each, and "wednesday pub quiz" at 500 at
 * a paid competition index of zero. See
 * tasks/keyword-plan-game-nights-2026-08-17.md.
 *
 * "Cash Prizes" was removed from the title on 17 August 2026. The advertised
 * prize is a £25 bar tab, not cash, so the old title promised something the page
 * does not deliver and would have been earning clicks it then disappointed.
 */
export const metadata: Metadata = {
  title: 'Pub Quiz Near Me | Wednesday Quiz Night',
  description:
    'Monthly Wednesday pub quiz in Stanwell Moor. £3 a player, teams of up to six, 7pm to 9:30pm. Free parking, and we match up solo players.',
  openGraph: {
    title: 'Wednesday Pub Quiz at The Anchor, Stanwell Moor',
    description: 'Monthly Wednesday pub quiz. £3 a player, teams of up to six, 7pm to 9:30pm, £25 bar tab for the winners.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Quiz night at The Anchor pub in Stanwell Moor' }]
  },
  twitter: getTwitterMetadata({
    title: 'Wednesday Pub Quiz at The Anchor, Stanwell Moor',
    description: 'Monthly Wednesday pub quiz. £3 a player, teams of up to six, 7pm to 9:30pm, £25 bar tab for the winners.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: './'
  }
}

// Category lookup, fetching and sorting all live in lib/game-nights/events.ts,
// shared by the four game pages.

/**
 * Six questions, down from nine.
 *
 * The three that went were a duplicate private-quiz question, a "do you run quiz
 * nights on weekends" filler, and a "closest pub quiz near Heathrow hotels"
 * question aimed at airport guests. This page is for people who live within a few
 * miles: the keyword data shows the demand sits in "pub quiz near me", not in
 * hotel-adjacent phrasing.
 */
const FAQS = [
  {
    question: 'When does the quiz start and how long does it run?',
    answer:
      'Questions start at 7pm and we aim to finish at 9:30pm, with a comfort break halfway through. Tables are set from 6:30pm, and the pub itself is open from 12pm, so come early and eat first if you want to.'
  },
  {
    question: 'How much is entry and do we need to book?',
    answer:
      'It is £3 per player, paid in cash on the night. Booking is worth doing because it holds your team’s seats: if booking is open you will see a button above, and if not, call 01753 682707.'
  },
  {
    question: 'How many players can we bring?',
    answer:
      'Teams are capped at six to keep it fair. Smaller groups and solo players are welcome, and we pair solo quizzers up with others on arrival.'
  },
  {
    question: 'Can kids or dogs come to quiz night?',
    answer:
      'Yes to both. Families are welcome all evening and well-behaved dogs can curl up under the table. It is a phone-free quiz during the rounds, with a 5 point penalty for a sneaky scroll.'
  },
  {
    question: 'What food and drink is available?',
    answer:
      'The kitchen runs to 9pm, so order before the first round or during the comfort break. Cocktails, mocktails and bottled ales are available from the bar all evening.'
  },
  {
    question: 'Do you host private or corporate quiz nights?',
    answer:
      'Yes. We run custom trivia nights for corporate teams, birthdays and fundraisers with tailored rounds and prizes. Email manager@the-anchor.pub or call 01753 682707.'
  }
]

function PrizeCard({ title, reward, copy }: { title: string; reward: string; copy: string }) {
  return (
    <Card accent className="h-full">
      <CardBody>
        <h3 className="mb-2 text-lg font-semibold text-ink-strong">{title}</h3>
        <p className="mb-3 text-2xl text-accent-text">{reward}</p>
        <p className="text-sm text-ink-muted">{copy}</p>
      </CardBody>
    </Card>
  )
}

function QuizNightEvents({ events }: { events: Event[] }) {
  return (
    <EventDateCards
      events={events}
      eyebrow="Monthly quiz night"
      bookingSource="quiz_night_event_card"
      imageAltSuffix="quiz night at The Anchor"
      renderMeta={(_event, doorTime) => (
        <>
          <p className="text-xs text-ink-muted">Arrive from {doorTime ?? '6:30pm'}</p>
          <p className="text-xs text-ink-muted">£3 per player</p>
        </>
      )}
      renderDetails={() => (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="success">£25 bar tab for winners</Badge>
            <Badge variant="sand">Bottle of wine for second-from-last</Badge>
          </div>
          <p className="text-sm text-ink-muted">
            7pm to 9:30pm · Teams up to six · Solo players welcome, we&rsquo;ll match you on arrival
          </p>
        </>
      )}
      emptyState={
        <>
          <p className="mb-2 text-lg font-semibold text-accent-text">New quiz dates are loading soon</p>
          <p className="text-ink-muted">
            Our next quiz night is being finalised right now. Call 01753 682707 and we&rsquo;ll let you know as soon as booking opens.
          </p>
        </>
      }
    />
  )
}

export default async function QuizNightPage() {
  const events = await getGameNightEvents(quizNight)
  const nextEvent = events[0]
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '7pm'
  const doorTime = nextEvent ? formatDoorClockTime(nextEvent.doorTime) ?? '6:30pm' : '6:30pm'

  const heroDescription = nextEvent
    ? `Tables are set from ${doorTime} and the quiz starts at ${nextEventTime}, finishing around 9:30pm. It's £3 per player, so build a team of up to six or arrive solo and we'll match you.`
    : "Tables are set from 6:30pm and the quiz starts at 7pm, finishing around 9:30pm. It's £3 per player, so build a team of up to six or arrive solo and we'll match you."

  return (
    <>
      <ScrollDepthTracker />

      <InteriorHero
        image={quizNight.hero.image}
        focal={quizNight.hero.focal}
        crumb={quizNight.hero.crumb}
        title={quizNight.hero.title}
        lead={quizNight.hero.lead}
        badges={<GameNightFacts facts={quizNight.facts} />}
        actions={
          <GameNightCtaActions
            gameSlug={quizNight.slug}
            label={buildGameNightCtaLabel(quizNight, nextEvent)}
            hasBookableDate={Boolean(nextEvent)}
            location="hero"
          />
        }
      />

      {/* Definitive answer for featured snippets */}
      <section className="bg-surface-sunk border-b border-line py-section-y">
        <Container>
          <p className="mx-auto text-center text-lg leading-relaxed text-ink-muted md:text-xl">
            The Anchor runs a monthly Wednesday pub quiz in Stanwell Moor, near Staines. Entry is
            &pound;3 per player, teams are up to six, the quiz runs 7pm to 9:30pm, and the winners
            take a &pound;25 bar tab.
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-2 md:items-start">
            <SectionViewTracker sectionId="quiz_night_booking">
              <GameNightBooking
                events={events}
                gameName={quizNight.name}
                gameSlug={quizNight.slug}
                bookingNote={quizNight.bookingNote}
              />
            </SectionViewTracker>
            {/* Right column stacks the "how it runs" card and the objections. The
                booking form opposite is roughly three times the height of that
                card on its own, which left most of this column empty. */}
            <div className="space-y-6">
              <Card accent>
                <CardBody className="space-y-4">
                  <h3 className="text-h4 text-ink-strong">How the night runs</h3>
                  <ul className="space-y-3 text-ink-muted">
                    <li><strong>6:30pm</strong> · tables set, soundtrack on, order food while you settle in.</li>
                    <li><strong>7pm</strong> · first round. Four rounds of ten questions, general knowledge, no specialist subjects.</li>
                    <li><strong>8:15pm</strong> · interactive quick-fire round to get everyone on their feet.</li>
                    <li><strong>8:30pm</strong> · comfort break and last call for the kitchen, which closes at 9pm.</li>
                    {/* 9:30pm, owner-confirmed 17 August 2026 and matching end_time
                        21:30 in the management DB. This said 9:45pm while the event
                        pages said 9:30pm. */}
                    <li><strong>9:30pm</strong> · final scores, prizes and best team name.</li>
                  </ul>
                  <p className="text-sm text-ink-muted">
                    Teams up to six. House rule: phones away during the rounds, or it is a cheeky 5
                    point penalty. Friendly rather than serious, with the odd bit of adult humour.
                  </p>
                </CardBody>
              </Card>

              <SectionViewTracker sectionId="quiz_night_objections">
                <GameNightObjections
                  objections={quizNight.objections}
                  gameName={quizNight.name}
                  stack
                />
              </SectionViewTracker>
            </div>
          </div>
        </Container>
      </section>

      <GameNightGallery
        photos={quizNight.photos}
        gameName={quizNight.name}
        gameSlug={quizNight.slug}
        title="What quiz night actually looks like"
        intro="Real photos from recent quizzes. Teams of up to six, solo players matched up on arrival, and a £25 bar tab on the line."
      />

      <section className="py-section-y bg-surface">
        <Container>
          <PageTitle className="text-center text-accent-text" seo={{ structured: true, speakable: true }}>
            Wednesday Pub Quiz in Stanwell Moor
          </PageTitle>
          <p className="mx-auto text-center text-lg text-ink-muted">
            Once a month we turn The Anchor into a proper pub quiz for Stanwell Moor, Staines,
            Ashford and Bedfont. No app, no specialist rounds, no need for a full team.{' '}
            {heroDescription}
          </p>
        </Container>
      </section>

      <section id="quiz-dates" className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-6 text-center text-h3 text-ink-strong">Upcoming quiz night dates</h2>
            <p className="mb-8 text-center text-ink-muted">
              Confirmed dates are below. For everything else we have on, see{' '}
              <Link href="/whats-on" className="font-semibold text-accent-text hover:text-accent-text">
                What&rsquo;s On
              </Link>{' '}
              or call 01753 682707.
            </p>
            <SectionViewTracker sectionId="quiz_night_dates">
              <QuizNightEvents events={events} />
            </SectionViewTracker>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto">
            <h2 className="mb-6 text-center text-h3 text-ink-strong">What you are playing for</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <PrizeCard title="Champions" reward="£25 Bar Tab" copy="Spend it on celebratory pints, cocktails or post-quiz snacks." />
              <PrizeCard title="Second from last" reward="Bottle of Wine" copy="A cheeky consolation prize that keeps everyone in the game." />
              <PrizeCard title="Best team name" reward="Seasonal Prop" copy="Worth the effort. The room decides whether you earned it." />
            </div>
          </div>
        </Container>
      </section>

      {/* One food section, not the previous three-card row of near-identical
          "Book a Table" buttons. Three separate dining CTAs on a page whose
          primary action is an event booking made a visitor wonder whether they
          needed two bookings. They do not. */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <h2 className="mb-3 text-h4 text-ink-strong">Eat before you quiz</h2>
            <p className="mb-5 text-ink-muted">
              The kitchen runs to 9pm on quiz night: pizzas, burgers, pies and the full menu. Order at
              your table before the first round or during the comfort break. You do not need a
              separate dining booking, because your quiz booking is your team&rsquo;s table.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BookTableButton source="quiz_night_food_cta" variant="outline" size="sm">
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
            <p className="mb-3 text-ink-muted">
              Every so often we build the whole quiz around one show. See our{' '}
              <Link href="/quiz-night/themed" className="font-semibold text-accent-text transition hover:text-accent-text">
                themed quiz nights
              </Link>
              , including the Only Fools and Horses charity quiz on Friday 25 September.
            </p>
            <p className="text-ink-muted">
              Not a quiz night? Play along at{' '}
              <Link href="/music-bingo" className="font-semibold text-accent-text transition hover:text-accent-text">
                music bingo
              </Link>{' '}
              with Nikki Manfadge, chase the snowball at{' '}
              <Link href="/cash-bingo" className="font-semibold text-accent-text transition hover:text-accent-text">
                cash bingo
              </Link>
              , or grab the microphone at{' '}
              <Link href="/karaoke" className="font-semibold text-accent-text transition hover:text-accent-text">
                karaoke
              </Link>{' '}
              when a night is listed.
            </p>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Ready to play for the tab?"
        copy="Book your team in, or call the bar and we'll make sure your seats are ready."
      >
        <GameNightCtaActions
          gameSlug={quizNight.slug}
          label={buildGameNightCtaLabel(quizNight, nextEvent)}
          hasBookableDate={Boolean(nextEvent)}
          location="closing_band"
        />
      </CtaBand>

      <InternalLinkingSection
        title="Plan your night out"
        links={[
          { href: '/blog/what-is-race-night', title: 'What Is a Race Night?', description: 'Our guide to how race nights work' },
          { href: '/whats-on', title: "What's On", description: 'All upcoming events and entertainment' },
          { href: '/music-bingo', title: 'Music Bingo', description: 'Another hosted night at The Anchor' },
        ]}
      />

      <JsonLd data={quizNightEventSeries} />
      {events.map(event => (
        <EventSchema key={`event-schema-${event.id}`} event={event} />
      ))}
    </>
  )
}
