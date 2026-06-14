import Image from 'next/image'
import { Metadata } from 'next'
import {
  Badge,
  Button,
  Container,
  Card,
  CardBody,
  Grid,
  GridItem,
  SectionHeading
} from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { BookTableButton } from '@/components/BookTableButton'
import { RegretReduction } from '@/components/psychology'
import {
  getEventCategories,
  getUpcomingEventsByCategory,
  formatEventDate,
  formatEventTime,
  formatDoorTime,
  type Event,
  type EventCategory
} from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
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

const QUIZ_CATEGORY = {
  name: 'Pub Quiz Night',
  slug: 'quiz-night-stanwell-moor'
}

const normalizeCategoryValue = (value?: string | null) =>
  value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdByLabel(categories: EventCategory[], label: typeof QUIZ_CATEGORY) {
  const targetName = normalizeCategoryValue(label.name)
  const targetSlug = normalizeCategoryValue(label.slug)

  return categories.find(category => {
    const categoryName = normalizeCategoryValue(category.name)
    const categorySlug = normalizeCategoryValue(category.slug)
    return categoryName === targetName || categorySlug === targetSlug
  })?.id
}

async function getQuizEvents() {
  const categories = await getEventCategories()
  const categoryId = getCategoryIdByLabel(categories, QUIZ_CATEGORY)
  if (!categoryId) return []

  const events = await getUpcomingEventsByCategory(categoryId, 60, 365)
  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

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
  if (!events.length) {
    return (
      <Card accent>
        <CardBody className="text-center">
          <p className="text-lg font-semibold text-accent-text mb-2">New quiz dates are loading soon</p>
          <p className="text-ink-muted">
            Our next quiz night is being finalised right now. Call 01753 682707 and we’ll let you know as soon as booking opens.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const doorTime = formatDoorTime(event.doorTime)
        const startTime = formatEventTime(event.startDate)
        const isDraft = (event.eventStatus || '').toLowerCase().includes('draft')
        const isScheduled = (event.eventStatus || '').toLowerCase().includes('scheduled')
        const isTentative = isDraft || (!isScheduled && new Date(event.startDate).getTime() > new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        const eventUrl = getEventWebsiteUrl(event)
        const imageSrc = event.heroImageUrl || event.image?.[0] || null

        return (
          <Card key={event.id} hover accent className="overflow-hidden">
            <div className="border-b border-line bg-surface-sunk px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">Monthly quiz night</p>
                  {isTentative && (
                    <Badge variant="outline">Tentative</Badge>
                  )}
                </div>
                <Link href={eventUrl} className="block text-xl font-semibold text-ink-strong hover:text-accent-text transition">
                  {event.name}
                </Link>
                <p className="text-sm text-ink-muted line-clamp-1">{formatEventDate(event.startDate)}</p>
              </div>
	              <div className="text-right">
	                <p className="text-lg font-semibold text-ink-strong">{startTime}</p>
	                <p className="text-xs text-ink-muted">Doors {doorTime ?? '6:30pm'}</p>
	                <p className="text-xs text-ink-muted">£3 per player</p>
	              </div>
            </div>

            <CardBody className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
              {imageSrc && (
                <Link href={eventUrl} className="w-full lg:w-48">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={imageSrc}
                      alt={`${event.name} quiz night at The Anchor`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 192px"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                </Link>
              )}

              <div className="flex-1 space-y-4">
                {event.description && (
                  <p className="text-ink-muted leading-relaxed">{event.description}</p>
                )}
	                <div className="flex flex-wrap items-center gap-3 text-sm">
	                  <Badge variant="success">£25 bar tab for winners</Badge>
                  <Badge variant="sand">Bottle of wine for second-from-last</Badge>
                </div>
	                <p className="text-sm text-ink-muted">
	                  £3 per player · Teams up to six · Solo players welcome (we’ll match you on arrival)
	                </p>
              </div>

              <div className="w-full lg:w-64 space-y-3">
                <EventBookingButton event={event} className="w-full" source="quiz_night_event_card" />
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}

export default async function QuizNightPage() {
  const events = await getQuizEvents()
  const nextEvent = events[0]
  const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Next date to be confirmed'
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '7:30 pm start'
  const doorTime = nextEvent ? formatDoorTime(nextEvent.doorTime) ?? '6:30 pm' : '6:30 pm'

	  const heroDescription = nextEvent
	    ? `Doors ${doorTime}. Quiz starts ${nextEventTime}. It’s £3 per player, build a team of up to six or arrive solo and we’ll match you.`
	    : 'Doors 6:30 pm. Quiz starts 7:00 pm. It’s £3 per player, build a team of up to six or arrive solo and we’ll match you.'

  // Extract ISO date (YYYY-MM-DD) from startDate for booking URL prefill
  const nextEventIsoDate = nextEvent ? nextEvent.startDate.slice(0, 10) : null
  const bookingHref = nextEventIsoDate ? `/book-table?date=${nextEventIsoDate}` : '/book-table'

  return (
    <>
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Quiz Night"
        title="Pub Quiz Night at The Anchor Near Heathrow"
        lead="Monthly pub quiz near Heathrow and Staines. Trivia rounds, seasonal themes, £25 bar tab for the winners and a proper pub quiz atmosphere."
      />

      {/* Definitive answer for featured snippets */}
      <section className="bg-surface-sunk border-b border-line py-section-y">
        <Container>
          <p className="text-center text-lg md:text-xl text-ink-muted max-w-4xl mx-auto leading-relaxed">
            The Anchor hosts a popular monthly pub quiz in Stanwell Moor, near Staines and Heathrow Airport, with a &pound;25 bar tab prize, team-based rounds, and a lively atmosphere. Entry is &pound;3 per player with teams of up to six.
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-stretch">
            <Card accent>
              <CardBody className="space-y-4">
                <p className="text-sm uppercase tracking-wide text-accent-text font-semibold">Next quiz night</p>
                <h2 className="text-h3 text-ink-strong">{nextEvent ? nextEvent.name : 'Next date to be confirmed'}</h2>
                <p className="text-accent-text font-semibold">{nextEvent ? `${nextEventDate} · ${nextEventTime}` : 'Check back for the next date'}</p>
                {nextEvent?.longDescription && (
                  <p className="text-ink-muted whitespace-pre-line">{nextEvent.longDescription}</p>
                )}
                <div className="space-y-3">
                  {nextEvent && (
                    <RegretReduction variant="booking" className="mb-4" />
                  )}
                  {nextEvent ? (
                    <EventBookingButton event={nextEvent} className="w-full" source="quiz_night_next_event" />
                  ) : (
                    <PhoneButton phone={CONTACT.phone} source="quiz-night_fallback" size="lg" className="w-full bg-anchor-green text-white hover:bg-anchor-green-dark">
                      Call {CONTACT.phone}
                    </PhoneButton>
                  )}
                </div>
              </CardBody>
            </Card>
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
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <PageTitle className="text-center text-accent-text" seo={{ structured: true, speakable: true }}>
            Pub Quiz Night Near Heathrow &amp; Staines: Monthly at The Anchor
          </PageTitle>
          <p className="text-lg text-ink-muted text-center max-w-3xl mx-auto">
            Looking for a pub quiz in Staines, Stanwell Moor or near Heathrow? Once a month we turn The Anchor into a trivia night for locals, airport crews and anyone who fancies a proper pub quiz in Surrey. {heroDescription}
          </p>
        </Container>
      </section>

      <section id="quiz-dates" className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-h3 text-ink-strong text-center mb-6">Upcoming quiz night dates</h2>
            <p className="text-ink-muted text-center mb-8">
              We list confirmed quiz night dates below. For the very latest schedule, including bonus weekend quizzes, check our <Link href="/whats-on" className="text-accent-text hover:text-accent-text font-semibold">What’s On page</Link> or call 01753 682707 and we’ll give you the next available date.
            </p>
            <QuizNightEvents events={events} />
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
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
          <div className="max-w-6xl mx-auto">
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
          <div className="max-w-5xl mx-auto">
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
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
            <Card accent>
              <CardBody className="space-y-4">
                <h3 className="text-h4 text-ink-strong">Make a night of it</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li><strong>Food served until 9pm:</strong> pizzas, burger stacks, pies and seasonal specials.</li>
                  <li><strong>Drinks menu:</strong> draught lagers, bottled ales, zero-proof spritzes and themed cocktails like the Black Shuck Spritz.</li>
                  <li><strong>Stay comfy:</strong> heated areas, step-free access and plenty of parking right outside.</li>
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
          <div className="max-w-5xl mx-auto">
            <h2 className="text-h3 text-ink-strong text-center mb-6">Quiz team tips for the win</h2>
	            <p className="text-ink-muted text-center max-w-3xl mx-auto mb-6">
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
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h4 text-ink-strong mb-3">More Things to Do at The Anchor</h2>
            <p className="text-ink-muted">
              Not a quiz night? No problem. Grab the mic at our <Link href="/karaoke" className="text-accent-text font-semibold hover:text-accent-text transition">Friday karaoke nights</Link> or enjoy a free gig at our regular <Link href="/live-music" className="text-accent-text font-semibold hover:text-accent-text transition">live music evenings</Link> featuring local bands and acoustic acts.
            </p>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema faqs={FAQS} />

      <CtaBand
        title="Ready to play for the tab?"
        copy="Reserve your spot or call the bar team and we’ll make sure your table’s ready."
        primary={
          <BookTableButton source="quiz_night_cta_bottom" variant="primary" size="lg" className="w-full sm:w-auto">
            Book Your Team Table
          </BookTableButton>
        }
        secondary={
          <PhoneButton phone="01753 682707" source="quiz_night_cta_bottom" variant="outline" size="lg" className="w-full sm:w-auto">
            Call to reserve: 01753 682707
          </PhoneButton>
        }
      />

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
