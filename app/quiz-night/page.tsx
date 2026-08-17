import { Metadata } from 'next'
import { Badge, Container, Card, CardBody, Grid, GridItem } from '@/components/ui'
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

export const metadata: Metadata = {
  title: 'Pub Quiz Night Near Heathrow | £3 Entry, Cash Prizes',
  description:
    "Monthly pub quiz night at The Anchor near Heathrow and Staines. £3 entry, £25 bar tab for the winners. Teams of up to 6. Free parking, 7 mins from T5.",
  openGraph: {
    title: 'Pub Quiz Night Near Heathrow & Staines | The Anchor',
    description: 'Monthly pub quiz night at The Anchor near Heathrow and Staines. £3 entry, £25 bar tab for the winners. Teams of up to 6. Free parking, 7 mins from T5.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Pub Quiz Night Near Heathrow & Staines | The Anchor',
    description: 'Monthly pub quiz night at The Anchor near Heathrow and Staines. £3 entry, £25 bar tab for the winners. Teams of up to 6. Free parking, 7 mins from T5.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: '/quiz-night'
  }
}

// Category lookup, fetching and sorting all live in lib/game-nights/events.ts,
// shared by the four game pages.

const WHY_LOVE_IT = [
  {
    icon: '',
    title: 'Four Curated Rounds',
    body: 'Every quiz night quiz features four curated rounds mixing legends, cult film clues, riddles and general trivia. Expect 50% easy wins, 35% brain-teasers and a tasty 15% "ooh, good one".'
  },
  {
    icon: '',
    title: 'Phone-Free, Pen & Paper Fun',
    body: 'Proper pub quiz energy with PG-13 questions so crews, families and Heathrow stopovers feel right at home. Solo players get paired on arrival.'
  },
  {
    icon: '',
    title: 'Prizes & Bragging Rights',
    body: '£25 bar tab for the champions, bottle of house wine for the second-from-last team, and seasonal props for the best team name. Bonus trivia prompts scoop extra bragging points.'
  },
  {
    icon: '',
    title: 'Atmosphere from 6:30 pm',
    body: 'Tables set from 6:30pm with themed playlists, seasonal décor and limited-edition cocktails behind the bar. Order dinner before the first round lands.'
  },
  {
    icon: '',
    title: 'Community Night Out',
    body: 'Friendly quizmasters, a welcoming Stanwell Moor crowd and plenty of laughs whether you’re local or flying in from Heathrow.'
  }
]

const FAQS = [
  {
    question: 'When does the quiz start and how long does it run?',
    answer:
      'Doors open at 6:30 pm for food and team set-up. Questions start at 7:00 pm sharp and we wrap with prizes around 9:45 pm including a comfort break halfway through.'
  },
  {
    question: 'How much is entry and do we need to book?',
    answer:
      'It’s £3 per player. If booking is open you’ll see a reserve table button above. If not, booking options are available closer to the event, check back nearer the date or call 01753 682707 and we’ll help.'
  },
  {
    question: 'How many players can we bring?',
    answer:
      'Teams are capped at six players to keep things fair. Smaller groups and solo quizzers are welcome, we happily pair you with other legends on the night.'
  },
  {
    question: 'Can kids or dogs come to quiz night?',
    answer:
      'Yes. Families are welcome all evening and well-behaved dogs can curl up under the table. Just remember it’s a phone-free quiz during rounds (there’s a –5 point penalty for sneaky scrolling).'
  },
  {
    question: 'What food and drink is available?',
    answer:
      'Order from the food menu before the quiz starts or during the break. Kitchen times come from the live hours for that date, with cocktails, mocktails and bottled ales available from the bar.'
  },
  {
    question: 'What if we want to celebrate a win or host a private quiz?',
    answer:
      'Talk to us about post-quiz celebrations or booking the function room for a bespoke trivia night. Email manager@the-anchor.pub or call 01753 682707 and we’ll build the perfect package.'
  },
  {
    question: 'Do you host private trivia parties or corporate quiz nights?',
    answer:
      'Absolutely. We run custom trivia nights for corporate teams, birthdays and fundraisers with tailored rounds and prizes. Drop us a line at manager@the-anchor.pub or call 01753 682707 and we’ll plan a private pub trivia party around your group.'
  },
  {
    question: 'Is this the closest pub quiz near Heathrow hotels?',
    answer:
      'Yes, we\'re just seven minutes from Heathrow Terminal 5 and 8 minutes from Staines. We\'re the go-to “pub quiz near me” for airport crews, local hotels and Stanwell Moor neighbours looking for a proper quiz night without London prices.'
  },
  {
    question: 'Do you run quiz nights on weekends?',
    answer:
      "Our quiz night is monthly and dates vary. Keep an eye on the What’s On page or call 01753 682707 for the next date."
  }
]

function PrizeCard({ title, reward, copy }: { title: string; reward: string; copy: string }) {
  return (
    <Card accent className="h-full">
      <CardBody>
        <h3 className="text-lg font-semibold text-ink-strong mb-2">{title}</h3>
        <p className="text-2xl text-accent-text mb-3">{reward}</p>
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
          <p className="text-xs text-ink-muted">Doors {doorTime ?? '6:30pm'}</p>
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
            £3 per player · Teams up to six · Solo players welcome (we’ll match you on arrival)
          </p>
        </>
      )}
      emptyState={
        <>
          <p className="text-lg font-semibold text-accent-text mb-2">New quiz dates are loading soon</p>
          <p className="text-ink-muted">
            Our next quiz night is being finalised right now. Call 01753 682707 and we’ll let you know as soon as booking opens.
          </p>
        </>
      }
    />
  )
}

export default async function QuizNightPage() {
  const events = await getGameNightEvents(quizNight)
  const nextEvent = events[0]
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '7:30 pm start'
  const doorTime = nextEvent ? formatDoorClockTime(nextEvent.doorTime) ?? '6:30 pm' : '6:30 pm'

	  const heroDescription = nextEvent
	    ? `Doors ${doorTime}. Quiz starts ${nextEventTime}. It’s £3 per player, build a team of up to six or arrive solo and we’ll match you.`
	    : 'Doors 6:30 pm. Quiz starts 7:00 pm. It’s £3 per player, build a team of up to six or arrive solo and we’ll match you.'

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
          <p className="text-center text-lg md:text-xl text-ink-muted mx-auto leading-relaxed">
            The Anchor hosts a popular monthly pub quiz in Stanwell Moor, near Staines and Heathrow Airport, with a &pound;25 bar tab prize, team-based rounds, and a lively atmosphere. Entry is &pound;3 per player with teams of up to six.
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid md:grid-cols-2 gap-6 items-start">
            <SectionViewTracker sectionId="quiz_night_booking">
              <GameNightBooking
                events={events}
                gameName={quizNight.name}
                gameSlug={quizNight.slug}
                bookingNote={quizNight.bookingNote}
              />
            </SectionViewTracker>
            <Card accent>
              <CardBody className="space-y-4">
                <h3 className="text-h4 text-ink-strong">How the night runs</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong>6:30 pm</strong> · Doors open, soundtrack on, grab sharers & themed cocktails.</li>
                  <li><strong>7:00 pm</strong> · Quiz night quiz kicks off. Four rounds × 10 questions with occasional bonus trivia prompts.</li>
                  <li><strong>8:15 pm</strong> · Interactive quick-fire round to get everyone on their feet.</li>
                  <li><strong>8:30 pm</strong> · Comfort break & last call for kitchen orders (kitchen closes 9pm).</li>
                  <li><strong>9:45 pm</strong> · Final scores, prize ladder and best team name shout-outs.</li>
                </ul>
                <p className="text-sm text-ink-muted">
                  Teams up to six. House rule: phones away during rounds or it’s a cheeky –5 points. We keep things welcoming, witty and PG-13.
                </p>
              </CardBody>
            </Card>
          </div>

          <SectionViewTracker sectionId="quiz_night_objections" className="mt-10">
            <GameNightObjections objections={quizNight.objections} gameName={quizNight.name} />
          </SectionViewTracker>
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
            Pub Quiz Night Near Heathrow &amp; Staines: Monthly at The Anchor
          </PageTitle>
          <p className="text-lg text-ink-muted text-center mx-auto">
            Looking for a pub quiz in Staines, Stanwell Moor or near Heathrow? Once a month we turn The Anchor into a trivia night for locals, airport crews and anyone who fancies a proper pub quiz in Surrey. {heroDescription}
          </p>
        </Container>
      </section>

      <section id="quiz-dates" className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="text-h3 text-ink-strong text-center mb-6">Upcoming quiz night dates</h2>
            <p className="text-ink-muted text-center mb-8">
              We list confirmed quiz night dates below. For the very latest schedule, including bonus weekend quizzes, check our <Link href="/whats-on" className="text-accent-text hover:text-accent-text font-semibold">What’s On page</Link> or call 01753 682707 and we’ll give you the next available date.
            </p>
            <SectionViewTracker sectionId="quiz_night_dates">
              <QuizNightEvents events={events} />
            </SectionViewTracker>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto grid gap-6 md:grid-cols-3">
            <Card accent>
              <CardBody>
                <h3 className="text-xl font-semibold text-accent-text mb-2">Eat Before You Quiz</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Kitchen open until 9pm on quiz night. Arrive early and fuel up on pizzas, burgers, or pie and mash before the first round.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="quiz_night_food_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    See the food menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="text-xl font-semibold text-accent-text mb-2">Stone-Baked Pizza Teams</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Arrive early and fuel up on stone-baked pizzas before trivia kicks off.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="quiz_night_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="text-xl font-semibold text-accent-text mb-2">All-Day Menu & Cocktails</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Order sharers, burgers or themed cocktails delivered to your table during breaks.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="quiz_night_food_menu_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                    Browse food & drinks →
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
            <h2 className="text-h2 text-ink-strong mb-8 text-center">
              Why everyone loves The Anchor quiz night
            </h2>
            <Grid cols={WHY_LOVE_IT.length > 3 ? 3 : 2} gap="md">
              {WHY_LOVE_IT.map(feature => (
                <GridItem key={feature.title}>
                  <Card accent className="h-full">
                    <CardBody className="space-y-3">
                      <div className="text-4xl">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-ink-strong">{feature.title}</h3>
                      <p className="text-ink-muted text-sm leading-relaxed">{feature.body}</p>
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
          <div className="mx-auto">
	            <h2 className="text-h3 text-ink-strong text-center mb-6">Prizes & bragging rights</h2>
	            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
	              <PrizeCard title="Champions" reward="£25 Bar Tab" copy="Spend it on celebratory pints, cocktails or post-quiz snacks." />
	              <PrizeCard title="Second from Last" reward="Bottle of Wine" copy="A cheeky consolation prize that keeps everyone in the game." />
	              <PrizeCard title="Bonus Challenges" reward="Surprise Treats" copy="Nail the bonus prompts to pick up Anchor goodies and bragging rights." />
	            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid md:grid-cols-2 gap-6 items-start">
            <Card accent>
              <CardBody className="space-y-4">
                <h3 className="text-h4 text-ink-strong">Make a night of it</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong>Food served until 9pm:</strong> pizzas, burger stacks, pies and seasonal specials.</li>
                  <li><strong>Drinks menu:</strong> draught lagers, bottled ales, zero-proof spritzes and themed cocktails like the Black Shuck Spritz.</li>
                  <li><strong>Stay comfy:</strong> plenty of parking right outside.</li>
                  <li><strong>Travelling?</strong> We’re 7 minutes from Heathrow Terminal 5 and on the 441/555 bus routes.</li>
                </ul>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody className="space-y-4">
                <h3 className="text-h4 text-ink-strong">Quiz Night House Rules</h3>
                <ul className="space-y-3 text-ink text-sm">
                  <li>Phones away during questions (–5 points if we catch a scroll).</li>
                  <li>Families welcome until 9 pm. Kids score bonus applause when they nail a question.</li>
                  <li>Dogs welcome, water bowls and treats ready behind the bar.</li>
                  <li>Charity pot when available supports local causes. We’ll shout about the beneficiary each month.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <h2 className="text-h3 text-ink-strong text-center mb-6">Quiz team tips for the win</h2>
	            <p className="text-ink-muted text-center mx-auto mb-6">
	              Whether you're searching for "pub quiz near me", "trivia night near me", a quiz night pub or a night trivia fix, these quick tips help you build a pub trivia team that can take the £25 bar tab every month.
	            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Card accent className="h-full">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-ink-strong">Balance your brain power</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    Mix general knowledge legends with niche specialists, think music, sport, film buffs and a wildcard who reads the news. Diverse teams smash the picture and music rounds every time.
                  </p>
                </CardBody>
              </Card>
              <Card accent className="h-full">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-ink-strong">Pick a memorable team name</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    Punny trivia team names earn bonus applause (and we award a seasonal prop for the best one). Keep a shortlist ready so you can rotate it for every monthly quiz night.
                  </p>
                </CardBody>
              </Card>
              <Card accent className="h-full">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-ink-strong">Nominate a scribe & rules coach</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    Agree who writes the answers and who double-checks spelling before you hand the sheet in. It keeps debates quick and protects those half-point bonuses.
                  </p>
                </CardBody>
              </Card>
              <Card accent className="h-full">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-ink-strong">Arrive early, fuel up</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    We open the doors at 6:30 pm, grab sharers, settle the team and review recent headlines before the 7:00 pm kickoff. A fed team is a focused team.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <h2 className="text-h4 text-ink-strong mb-3">More Things to Do at The Anchor</h2>
            <p className="text-ink-muted">
              Not a quiz night? No problem. Play along at our monthly <Link href="/music-bingo" className="text-accent-text font-semibold hover:text-accent-text transition">Music Bingo</Link> with Nikki Manfadge, chase the jackpot at <Link href="/cash-bingo" className="text-accent-text font-semibold hover:text-accent-text transition">cash prize bingo</Link>, or grab the mic at a <Link href="/karaoke" className="text-accent-text font-semibold hover:text-accent-text transition">karaoke night</Link> when one is listed.
            </p>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema faqs={FAQS} />

      <CtaBand
        title="Ready to play for the tab?"
        copy="Reserve your spot or call the bar team and we’ll make sure your table’s ready."
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
