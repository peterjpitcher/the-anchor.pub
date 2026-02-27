import Image from 'next/image'
import { Metadata } from 'next'
import {
  Button,
  Section,
  Container,
  Card,
  CardBody,
  Grid,
  GridItem,
  SectionHeader
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { BookTableButton } from '@/components/BookTableButton'
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
import { staticEvents } from '@/lib/static-events'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

export const metadata: Metadata = {
  title: 'Quiz Night Pub Near Heathrow | The Anchor Trivia Night',
  description:
    "Join The Anchor's quiz night pub near Heathrow for a monthly trivia night with a GBP 25 bar tab prize, GBP 3 entry, and a friendly pub trivia crowd in Stanwell Moor.",
  keywords:
    'quiz night pub, quiz night, quiz night quiz, trivia, trivia night, pub trivia, night trivia, pub quiz near heathrow, pub quiz staines, stanwell moor quiz night',
  openGraph: {
    title: 'Quiz Night Near Heathrow | The Anchor',
    description: 'Monthly trivia night with a GBP 25 bar tab prize, GBP 3 entry, and a friendly pub crowd in Stanwell Moor.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Quiz Night Near Heathrow | The Anchor',
    description: 'Monthly trivia night with a GBP 25 bar tab prize, GBP 3 entry, and a friendly pub crowd in Stanwell Moor.',
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
    icon: '🧠',
    title: 'Four Curated Rounds',
    body: 'Every quiz night quiz features four curated rounds mixing legends, cult film clues, riddles and general trivia. Expect 50% easy wins, 35% brain-teasers and a tasty 15% "ooh, good one".'
  },
  {
    icon: '📝',
    title: 'Phone-Free, Pen & Paper Fun',
    body: 'Proper pub quiz energy with PG-13 questions so crews, families and Heathrow stopovers feel right at home. Solo players get paired on arrival.'
  },
  {
    icon: '🏆',
    title: 'Prizes & Bragging Rights',
    body: 'GBP 25 bar tab for the champions, bottle of house wine for the second-from-last team, and seasonal props for the best team name. Bonus trivia prompts scoop extra bragging points.'
  },
  {
    icon: '🎶',
    title: 'Atmosphere from 6:30 pm',
    body: 'Tables set from 6:30pm with themed playlists, seasonal décor and limited-edition cocktails behind the bar. Order dinner before the first round lands.'
  },
  {
    icon: '❤️',
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
      'It’s GBP 3 per player. If booking is open you’ll see a Book Now button above. If not, booking options are available closer to the event — check back nearer the date or call 01753 682707 and we’ll help.'
  },
  {
    question: 'How many players can we bring?',
    answer:
      'Teams are capped at six players to keep things fair. Smaller groups and solo quizzers are welcome—we happily pair you with other legends on the night.'
  },
  {
    question: 'Can kids or dogs come to quiz night?',
    answer:
      'Yes. Families are welcome all evening and well-behaved dogs can curl up under the table. Just remember it’s a phone-free quiz during rounds (there’s a –5 point penalty for sneaky scrolling).'
  },
  {
    question: 'What food and drink is available?',
    answer:
      'Order from the full food menu before the quiz starts or during the break. Sharing platters, pizzas and seasonal specials run until 8:30 pm, with themed cocktails, mocktails and local ales on tap all night.'
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
      'Yes—we\'re just seven minutes from Heathrow Terminal 5 and 8 minutes from Staines. We\'re the go-to “pub quiz near me” for airport crews, local hotels and Stanwell Moor neighbours looking for a proper quiz night without London prices.'
  },
  {
    question: 'Do you run quiz nights on weekends?',
    answer:
      'Dates move around with our events calendar, so keep an eye on the What’s On page or call 01753 682707. We often stick to midweek slots but add bonus Saturday or Sunday quiz specials when demand is high.'
  }
]

function PrizeCard({ title, reward, copy }: { title: string; reward: string; copy: string }) {
  return (
    <Card className="h-full bg-white/90 border border-amber-100 shadow-sm">
      <CardBody>
        <h3 className="text-lg font-semibold text-anchor-charcoal mb-2">{title}</h3>
        <p className="text-2xl font-bold text-anchor-gold mb-3">{reward}</p>
        <p className="text-sm text-gray-700">{copy}</p>
      </CardBody>
    </Card>
  )
}

function QuizNightEvents({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-anchor-green mb-2">New quiz dates are loading soon</p>
        <p className="text-gray-600">
          Our next quiz night is being finalised right now. Call 01753 682707 and we’ll let you know as soon as booking opens.
        </p>
      </div>
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
          <Card key={event.id} className="overflow-hidden border border-anchor-sand shadow-lg">
            <div className="bg-anchor-green text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs uppercase tracking-wide text-white/70">Monthly quiz night</p>
                  {isTentative && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white border border-blue-400">
                      TENTATIVE
                    </span>
                  )}
                </div>
                <Link href={eventUrl} className="block text-xl font-bold text-white hover:text-anchor-gold transition">
                  {event.name}
                </Link>
                <p className="text-sm text-white/80 line-clamp-1">{formatEventDate(event.startDate)}</p>
              </div>
	              <div className="text-right">
	                <p className="text-lg font-semibold text-white">{startTime}</p>
	                <p className="text-xs text-white/70">Doors {doorTime ?? '6:30pm'}</p>
	                <p className="text-xs text-white/70">GBP 3 per player</p>
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
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                )}
	                <div className="flex flex-wrap items-center gap-3 text-sm">
	                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-anchor-sand/40 text-anchor-green font-semibold">
	                    🏅 GBP 25 bar tab for winners
	                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                    🍷 Bottle of wine for second-from-last
                  </span>
                </div>
	                <p className="text-sm text-gray-600">
	                  GBP 3 per player · Teams up to six · Solo players welcome (we’ll match you on arrival)
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
  const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Next date announced soon'
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '7:30 pm start'
  const doorTime = nextEvent ? formatDoorTime(nextEvent.doorTime) ?? '6:30 pm' : '6:30 pm'

	  const heroDescription = nextEvent
	    ? `Doors ${doorTime}. Quiz starts ${nextEventTime}. It’s GBP 3 per player — build a team of up to six or arrive solo and we’ll match you.`
	    : 'Doors 6:30 pm. Quiz starts 7:00 pm. It’s GBP 3 per player — build a team of up to six or arrive solo and we’ll match you.'

  return (
    <>
      <HeroWrapper
        route="/quiz-night"
        title="Quiz Night Wednesdays at The Anchor"
        description="Proper quiz night pub energy with trivia rounds, seasonal themes and prizes worth bragging about. Your Heathrow pub trivia night HQ."
       
	        tags={[
	          { label: '📍 7 mins from Heathrow', variant: 'default' },
	          { label: '🧠 Fresh themes monthly', variant: 'primary' },
	          { label: '💷 GBP 3 per player · teams up to 6', variant: 'default' }
	        ]}
        primaryCta={
          <BookTableButton
            source="quiz_night_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📅 Book Your Quiz Table
          </BookTableButton>
        }
        secondaryCta={
          <>
            <Link
              href="#quiz-dates"
              className={cn(
                'inline-flex items-center justify-center font-semibold text-center transition-all duration-200 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 bg-white text-anchor-green border-2 border-anchor-green hover:bg-anchor-green hover:text-white px-8 py-3.5 text-lg min-h-[48px] w-full sm:w-auto'
              )}
            >
              📅 See upcoming quiz dates
            </Link>
            <Link href="/food-menu#pizza" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                🍕 Pizza Menu
              </Button>
            </Link>
            <Link href="/sunday-lunch" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                🍖 Sunday Roast Info
              </Button>
            </Link>
            <PhoneButton
              phone="01753 682707"
              source="quiz_night_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              📞 Call to reserve: 01753 682707
            </PhoneButton>
          </>
        }
      />

      <Section spacing="sm" background="white">
        <Container>
          <PageTitle className="text-center text-anchor-green" seo={{ structured: true, speakable: true }}>
            Heathrow Quiz Night Pub & Trivia Night - Stanwell Moor, Staines & Surrey
          </PageTitle>
          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
            Looking for a quiz night pub near Heathrow that still feels like your local? Every first Wednesday we turn The Anchor into
            a trivia night HQ and night trivia spot for Stanwell Moor, Staines, Ashford, Bedfont and stopover crews chasing smart fun. {heroDescription}
          </p>
        </Container>
      </Section>

      <Section spacing="md" background="gray">
        <Container>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-stretch">
            <Card className="bg-white shadow-lg border border-anchor-sand">
              <CardBody className="space-y-4">
                <p className="text-sm uppercase tracking-wide text-anchor-gold font-semibold">Next quiz night</p>
                <h2 className="text-3xl font-bold text-anchor-charcoal">{nextEvent ? nextEvent.name : 'Next quiz night announced soon'}</h2>
                <p className="text-anchor-green font-semibold">{nextEvent ? `${nextEventDate} · ${nextEventTime}` : 'Check back for the next date'}</p>
                {nextEvent?.longDescription && (
                  <p className="text-gray-700 whitespace-pre-line">{nextEvent.longDescription}</p>
                )}
                <div className="space-y-3">
                  {nextEvent ? (
                    <EventBookingButton event={nextEvent} className="w-full" source="quiz_night_next_event" />
                  ) : (
                    <Button
                      size="lg"
                      asChild
                      className="w-full bg-anchor-green text-white hover:bg-anchor-green-dark"
                    >
                      <Link href="tel:+441753682707">📞 Call 01753 682707</Link>
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
            <Card className="bg-anchor-cream border border-amber-100 shadow-sm">
              <CardBody className="space-y-4">
                <h3 className="text-2xl font-bold text-anchor-charcoal">How the night runs</h3>
                <ul className="space-y-3 text-gray-700">
                  <li><strong>6:30 pm</strong> · Doors open, soundtrack on, grab sharers & themed cocktails.</li>
                  <li><strong>7:00 pm</strong> · Quiz night quiz kicks off. Four rounds × 10 questions with occasional bonus trivia prompts.</li>
                  <li><strong>8:15 pm</strong> · Interactive quick-fire round to get everyone on their feet.</li>
                  <li><strong>8:30 pm</strong> · Comfort break & last call for kitchen orders.</li>
                  <li><strong>9:45 pm</strong> · Final scores, prize ladder and best team name shout-outs.</li>
                </ul>
                <p className="text-sm text-gray-600">
                  Teams up to six. House rule: phones away during rounds or it’s a cheeky –5 points. We keep things welcoming, witty and PG-13.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white" id="quiz-dates">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-anchor-charcoal text-center mb-6">Upcoming quiz night dates</h2>
            <p className="text-gray-700 text-center mb-8">
              We list confirmed quiz night dates below. For the very latest schedule—including bonus weekend quizzes—check our <Link href="/whats-on" className="text-anchor-gold hover:text-anchor-gold-light font-semibold">What’s On page</Link> or call 01753 682707 and we’ll give you the next available date.
            </p>
            <QuizNightEvents events={events} />
          </div>
        </Container>
      </Section>

      <Section spacing="sm" background="white">
        <Container>
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
            <Card className="bg-anchor-cream/50 shadow-sm">
              <CardBody>
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Sunday Roast Quiz Warm-Up</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Book Sunday roast by 1pm Saturday and bring the team for a proper pub lunch before quizzing.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="quiz_night_roast_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book Sunday Roast
                  </BookTableButton>
                  <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Sunday roast menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardBody>
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Stone-Baked Pizza Teams</h3>
                <p className="text-sm text-gray-700 mb-4">
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
                  <Link href="/food-menu#pizza" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    View pizza menu →
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-anchor-cream/50 shadow-sm">
              <CardBody>
                <h3 className="text-xl font-semibold text-anchor-green mb-2">All-Day Menu & Cocktails</h3>
                <p className="text-sm text-gray-700 mb-4">
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
                  <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                    Browse food & drinks →
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-charcoal mb-8 text-center">
              Why everyone loves The Anchor quiz night
            </h2>
            <Grid cols={WHY_LOVE_IT.length > 3 ? 3 : 2} gap="md">
              {WHY_LOVE_IT.map(feature => (
                <GridItem key={feature.title}>
                  <Card className="h-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
                    <CardBody className="space-y-3">
                      <div className="text-4xl">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-anchor-charcoal">{feature.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{feature.body}</p>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="gray">
        <Container>
          <div className="max-w-5xl mx-auto">
	            <h2 className="text-3xl font-bold text-anchor-charcoal text-center mb-6">Prizes & bragging rights</h2>
	            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
	              <PrizeCard title="Champions" reward="GBP 25 Bar Tab" copy="Spend it on celebratory pints, cocktails or post-quiz snacks." />
	              <PrizeCard title="Second from Last" reward="Bottle of Wine" copy="A cheeky consolation prize that keeps everyone in the game." />
	              <PrizeCard title="Bonus Challenges" reward="Surprise Treats" copy="Nail the bonus prompts to pick up Anchor goodies and bragging rights." />
	            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="gray">
        <Container>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardBody className="space-y-4">
                <h3 className="text-2xl font-bold text-anchor-charcoal">Make a night of it</h3>
                <ul className="space-y-3 text-gray-700">
                  <li><strong>Food served until 8:30 pm:</strong> pizzas, nacho mountains, burger stacks and seasonal specials.</li>
                  <li><strong>Drinks menu:</strong> cask ales, craft lagers, zero-proof spritzes and themed cocktails like the Black Shuck Spritz.</li>
                  <li><strong>Stay comfy:</strong> heated areas, step-free access and plenty of parking right outside.</li>
                  <li><strong>Travelling?</strong> We’re 7 minutes from Heathrow Terminal 5 and on the 441/555 bus routes.</li>
                </ul>
              </CardBody>
            </Card>
            <Card className="bg-anchor-green text-white border border-anchor-green-dark shadow-sm">
              <CardBody className="space-y-4">
                <h3 className="text-2xl font-bold">Quiz Night House Rules</h3>
                <ul className="space-y-3 text-white/90 text-sm">
                  <li>📵 Phones away during questions (–5 points if we catch a scroll).</li>
                  <li>👶 Families welcome until 9 pm. Kids score bonus applause when they nail a question.</li>
                  <li>🐕 Dogs welcome—water bowls and treats ready behind the bar.</li>
                  <li>❤️ Charity pot when available supports local causes. We’ll shout about the beneficiary each month.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-anchor-charcoal text-center mb-6">Quiz team tips for the win</h2>
	            <p className="text-gray-700 text-center max-w-3xl mx-auto mb-6">
	              Whether you're searching for "pub quiz near me", "trivia night near me", a quiz night pub or a night trivia fix, these quick tips help you build a pub trivia team that can take the GBP 25 bar tab every month.
	            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="h-full bg-white border border-gray-100 shadow-sm">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-charcoal">Balance your brain power</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Mix general knowledge legends with niche specialists—think music, sport, film buffs and a wildcard who reads the news. Diverse teams smash the picture and music rounds every time.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full bg-white border border-gray-100 shadow-sm">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-charcoal">Pick a memorable team name</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Punny trivia team names earn bonus applause (and we award a seasonal prop for the best one). Keep a shortlist ready so you can rotate it for every monthly quiz night.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full bg-white border border-gray-100 shadow-sm">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-charcoal">Nominate a scribe & rules coach</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Agree who writes the answers and who double-checks spelling before you hand the sheet in. It keeps debates quick and protects those half-point bonuses.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full bg-white border border-gray-100 shadow-sm">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-charcoal">Arrive early, fuel up</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    We open the doors at 6:30 pm—grab sharers, settle the team and review recent headlines before the 7:00 pm kickoff. A fed team is a focused team.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <FAQAccordionWithSchema faqs={FAQS} className="bg-white" />

      <Section spacing="md" background="white">
        <Container>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-anchor-green to-anchor-green/80 rounded-2xl p-8 text-white text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to play for the tab?</h2>
            <p className="text-lg mb-6">
              Reserve your spot or call the bar team and we’ll make sure your table’s ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="quiz_night_cta_bottom"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
              >
                📅 Book Your Team Table
              </BookTableButton>
              <Link href="/food-menu#pizza" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  fullWidth
                  className="sm:w-auto bg-white/10 text-white hover:bg-white/20"
                >
                  🍕 Pizza Menu
                </Button>
              </Link>
              <Link href="/sunday-lunch" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  fullWidth
                  className="sm:w-auto bg-white/10 text-white hover:bg-white/20"
                >
                  🍖 Sunday Roast Info
                </Button>
              </Link>
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="#quiz-dates">📅 Upcoming quiz dates</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="gray">
        <Container>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
            <div>
              <h2 className="text-2xl font-bold text-anchor-charcoal mb-3">Find us</h2>
              <p className="text-gray-700 mb-4">
                The Anchor · Horton Road, Stanwell Moor, TW19 6AQ · Free on-site parking · 7 minutes from Heathrow T5 · 8 minutes from Staines.
              </p>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li><strong>Driving:</strong> Use postcode TW19 6AQ. Plenty of free parking right outside.</li>
                <li><strong>Public transport:</strong> 441 & 555 buses stop on Horton Road. Uber and Bolt know us well.</li>
                <li><strong>Accessibility:</strong> Step-free entrance, accessible loos and flexible seating for teams.</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Link
                  href="https://maps.app.goo.gl/YNbjTDF9g7uCcbYF6"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-green px-4 py-2 text-anchor-green font-semibold hover:bg-anchor-green hover:text-white transition"
                >
                  📍 Get directions
                </Link>
                <Link
                  href="https://wa.me/441753682707"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-gold px-4 py-2 text-anchor-gold font-semibold hover:bg-anchor-gold hover:text-anchor-green transition"
                >
                  💬 WhatsApp the team
                </Link>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <GoogleMapEmbed
                query="The Anchor, Stanwell Moor"
                className="h-full min-h-[300px] border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              />
            </div>
          </div>
        </Container>
      </Section>

      <EventSchema event={staticEvents.quizNight} />
      {events.map(event => (
        <EventSchema key={`event-schema-${event.id}`} event={event} />
      ))}
    </>
  )
}
