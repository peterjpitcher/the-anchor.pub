import Image from 'next/image'
import { Metadata } from 'next'
import {
  Button,
  Section,
  Container,
  Card,
  CardBody,
  Grid,
  GridItem
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
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
import { staticEvents } from '@/lib/static-events'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { JsonLd } from '@/components/JsonLd'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { bingoEventSeries } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Music Bingo Near Heathrow | Singalong Bingo Night | The Anchor',
  description:
    'Play Music Bingo near Heathrow at The Anchor. Song snippets replace numbers, prizes land every round, and booking is recommended for this singalong bingo night in Stanwell Moor.',
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

const MUSIC_BINGO_CATEGORY = {
  name: 'Music Bingo',
  slug: 'music-bingo'
}

const normalizeCategoryValue = (value?: string | null) =>
  value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdByLabel(categories: EventCategory[], label: typeof MUSIC_BINGO_CATEGORY) {
  const targetName = normalizeCategoryValue(label.name)
  const targetSlug = normalizeCategoryValue(label.slug)

  return categories.find(category => {
    const categoryName = normalizeCategoryValue(category.name)
    const categorySlug = normalizeCategoryValue(category.slug)
    return categoryName === targetName || categorySlug === targetSlug
  })?.id
}

async function getMusicBingoEvents() {
  const categories = await getEventCategories()
  const categoryId = getCategoryIdByLabel(categories, MUSIC_BINGO_CATEGORY)
  if (!categoryId) return []

  const events = await getUpcomingEventsByCategory(categoryId, 60, 365)
  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

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
      'It typically starts at 7pm, but with Nikki hosting the show can run a little late. We play two games, so it finishes after those rounds.'
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
      'Absolutely. Our kitchen is normally open from 4pm to 9pm, so you can order throughout and enjoy it while you play.'
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
  if (!events.length) {
    return (
      <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-card p-6 text-center">
        <p className="mb-2 text-lg font-semibold text-anchor-gold-vivid">New Music Bingo dates are loading soon</p>
        <p className="text-anchor-cream-text/70">
          We are lining up the next singalong sessions. Call 01753 682707 and we will share the next date as soon as booking opens.
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
        const entryLabel = getEntryLabel(event)

        return (
          <Card key={event.id} className="overflow-hidden border border-anchor-sand shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-anchor-green px-5 py-4 text-white">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-xs uppercase tracking-wide text-white/70">Music bingo night</p>
                  {isTentative && (
                    <span className="rounded border border-blue-400 bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      TENTATIVE
                    </span>
                  )}
                </div>
                <Link href={eventUrl} className="block text-xl font-bold text-white transition hover:text-anchor-gold">
                  {event.name}
                </Link>
                <p className="text-sm text-white/80 line-clamp-1">{formatEventDate(event.startDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-white">{startTime}</p>
                <p className="text-xs text-white/70">Doors {doorTime ?? '6:30pm'} - {entryLabel}</p>
              </div>
            </div>

            <CardBody className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
              {imageSrc && (
                <Link href={eventUrl} className="w-full lg:w-48">
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-sm">
                    <Image
                      src={imageSrc}
                      alt={`${event.name} music bingo night at The Anchor`}
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
                  <p className="text-anchor-cream-text/70 leading-relaxed">{event.description}</p>
                )}
                <p className="text-sm text-anchor-cream-text/55">
                  Five rounds of song snippets, singalong prompts, and shout-outs. Grab your card, spot the track, and
                  celebrate every line win.
                </p>
              </div>

              <div className="w-full space-y-3 lg:w-64">
                <EventBookingButton event={event} className="w-full" source="music_bingo_event_card" />
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}

export default async function MusicBingoPage() {
  const events = await getMusicBingoEvents()
  const nextEvent = events[0]
  const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Next date announced soon'
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '7:30pm'
  const doorTime = nextEvent ? formatDoorTime(nextEvent.doorTime) ?? '6:30pm' : '6:30pm'
  const entryLabel = nextEvent ? getEntryLabel(nextEvent) : '£3 entry'

  const heroDescription = nextEvent
    ? `Doors ${doorTime}. Music Bingo starts at ${nextEventTime}. ${entryLabel}. Booking is recommended.`
    : 'Doors 6:30pm. Music Bingo starts at 7:30pm. £3 entry. Booking is recommended.'

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: "What's On", url: '/whats-on' },
          { name: 'Music Bingo', url: '/music-bingo' }
        ]}
      />
      <HeroWrapper
        route="/music-bingo"
        title="Music Bingo Nights at The Anchor"
        description="Song snippets replace numbers, prizes land every round, and Nikki Manfadge keeps the singalong energy high."
       
        tags={[
          { label: 'Songs instead of numbers', variant: 'primary' },
          { label: 'Prizes every round', variant: 'default' },
          { label: 'Full menu from 6pm', variant: 'default' }
        ]}
        primaryCta={
          <BookTableButton
            source="music_bingo_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Book a Music Bingo Table
          </BookTableButton>
        }
        secondaryCta={
          <>
            <Link
              href="#music-bingo-dates"
              className={cn(
                'inline-flex items-center justify-center rounded-full border-2 border-anchor-green px-8 py-3.5 text-center text-lg font-semibold text-anchor-green transition-all duration-200 min-h-[48px] w-full whitespace-nowrap hover:bg-anchor-green hover:text-white focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 sm:w-auto'
              )}
            >
              See upcoming Music Bingo dates
            </Link>
            <PhoneButton
              phone="01753 682707"
              source="music_bingo_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Call to reserve: 01753 682707
            </PhoneButton>
          </>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">£3 per person</span>
          </div>
        }
      />

      <Section spacing="sm" background="white">
        <Container>
          <PageTitle className="text-center text-anchor-gold-vivid" seo={{ structured: true, speakable: true }}>
            Music Bingo Near Heathrow - Stanwell Moor, Staines and Surrey
          </PageTitle>
          <p className="mx-auto max-w-3xl text-center text-lg text-anchor-cream-text/70">
            Looking for a music bingo night near Heathrow that feels like a proper local? It's one of the best things to do near Heathrow for a fun evening out. We swap bingo numbers for
            song clips, hand out prizes every round, and keep the atmosphere warm and welcoming. {heroDescription}
          </p>
        </Container>
      </Section>

      <Section spacing="md" background="gray">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-stretch">
            <Card className="card-dark rounded-none border border-anchor-gold/15">
              <CardBody className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-anchor-gold">Next Music Bingo</p>
                <h2 className="text-3xl font-bold text-anchor-cream-text">
                  {nextEvent ? nextEvent.name : 'Next Music Bingo announced soon'}
                </h2>
                <p className="font-semibold text-anchor-gold-vivid">
                  {nextEvent ? `${nextEventDate} - ${nextEventTime}` : 'Check back for the next date'}
                </p>
                {nextEvent?.longDescription && (
                  <p className="whitespace-pre-line text-anchor-cream-text/70">{nextEvent.longDescription}</p>
                )}
                <p className="text-sm text-anchor-cream-text/55">
                  Hosted by Nikki Manfadge with singalong prompts, themed rounds, and prizes for quick ears and bold
                  voices.
                </p>
                <div className="space-y-3">
                  {nextEvent && (
                    <RegretReduction variant="booking" className="mb-4" />
                  )}
                  {nextEvent ? (
                    <EventBookingButton event={nextEvent} className="w-full" source="music_bingo_next_event" />
                  ) : (
                    <Button size="lg" asChild className="w-full bg-anchor-green text-white hover:bg-anchor-green-dark">
                      <Link href="tel:+441753682707">Call 01753 682707</Link>
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none border border-anchor-gold/15">
              <CardBody className="space-y-4">
                <h3 className="text-2xl font-bold text-anchor-cream-text">How Music Bingo runs</h3>
                <ul className="space-y-3 text-anchor-cream-text/70">
                  <li><strong>Doors {doorTime}</strong> - arrive early, grab drinks, and collect your bingo card.</li>
                  <li><strong>{nextEventTime}</strong> - warm-up round begins with chart favourites and classics.</li>
                  <li><strong>Five rounds</strong> - quick-fire clips, theme rounds, and bonus singalong moments.</li>
                  <li><strong>Breaks between rounds</strong> - order food, top up drinks, and compare answers.</li>
                  <li><strong>Finale</strong> - last card of the night with the headline prize.</li>
                </ul>
                <p className="text-sm text-anchor-cream-text/55">
                  Song clips are short, so keep ears open and phones away during the rounds.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white" id="music-bingo-dates">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-center text-3xl font-bold text-anchor-cream-text">Upcoming Music Bingo dates</h2>
            <p className="mb-8 text-center text-anchor-cream-text/70">
              We list confirmed Music Bingo dates below. For the very latest schedule, check the{' '}
              <Link href="/whats-on" className="font-semibold text-anchor-gold hover:text-anchor-gold-light">
                What's On page
              </Link>{' '}
              or call 01753 682707.
            </p>
            <MusicBingoEventCards events={events} />
          </div>
        </Container>
      </Section>

      <Section spacing="sm" background="white">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <Card className="card-dark rounded-none border border-anchor-gold/15">
              <CardBody>
                <h3 className="mb-2 text-xl font-semibold text-anchor-gold-vivid">Sunday Roast Music Bingo Warm-Up</h3>
                <p className="mb-4 text-sm text-anchor-cream-text/70">
                  Book Sunday roast by 1pm Saturday and bring the crew for a proper pub lunch before Music Bingo.
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
                  <Link href="/sunday-lunch" className="text-sm font-semibold text-anchor-gold transition hover:text-anchor-green">
                    Sunday roast menu {'>'}
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none border border-anchor-gold/15">
              <CardBody>
                <h3 className="mb-2 text-xl font-semibold text-anchor-gold-vivid">Stone-Baked Pizza Warm-Up</h3>
                <p className="mb-4 text-sm text-anchor-cream-text/70">
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
                  <Link href="/food-menu#pizza" className="text-sm font-semibold text-anchor-gold transition hover:text-anchor-green">
                    View pizza menu {'>'}
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none border border-anchor-gold/15">
              <CardBody>
                <h3 className="mb-2 text-xl font-semibold text-anchor-gold-vivid">All-Day Menu and Cocktails</h3>
                <p className="mb-4 text-sm text-anchor-cream-text/70">
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
                  <Link href="/food-menu" className="text-sm font-semibold text-anchor-gold transition hover:text-anchor-green">
                    Browse food and drinks {'>'}
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-anchor-cream-text md:text-4xl">
              Why everyone loves Music Bingo at The Anchor
            </h2>
            <Grid cols={WHY_LOVE_IT.length > 3 ? 3 : 2} gap="md">
              {WHY_LOVE_IT.map(feature => (
                <GridItem key={feature.title}>
                  <Card className="h-full card-dark rounded-none border border-anchor-gold/15">
                    <CardBody className="space-y-3">
                      <div className="text-4xl">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-anchor-cream-text">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-anchor-cream-text/70">{feature.body}</p>
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
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-start">
            <Card className="card-dark rounded-none border border-anchor-gold/15">
              <CardBody className="space-y-4">
                <h3 className="text-2xl font-bold text-anchor-cream-text">How to play Music Bingo</h3>
                <ol className="space-y-3 text-anchor-cream-text/70">
                  <li>1. Grab your card and listen for the song clip.</li>
                  <li>2. Mark the track on your card as soon as you spot it.</li>
                  <li>3. Shout when you hit the pattern for that round.</li>
                  <li>4. Keep playing for the full house finale prize.</li>
                </ol>
              </CardBody>
            </Card>
            <Card className="border border-anchor-green-dark bg-anchor-green text-white shadow-sm">
              <CardBody className="space-y-4">
                <h3 className="text-2xl font-bold">Music Bingo house rules</h3>
                <ul className="space-y-3 text-sm text-white/90">
                  <li>Phones away during rounds so everyone gets a fair listen.</li>
                  <li>Singing along is encouraged, but keep shouting to a cheer.</li>
                  <li>Caller's decision is final on line and full house wins.</li>
                  <li>Dogs are welcome and water bowls are ready at the bar.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-center text-3xl font-bold text-anchor-cream-text">Tips for a winning card</h2>
            <p className="mx-auto mb-6 max-w-3xl text-center text-anchor-cream-text/70">
              Whether you are new to music bingo or a seasoned singalong legend, these tips keep your ears sharp.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="h-full card-dark rounded-none border border-anchor-gold/15">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-cream-text">Bring a mixed crew</h3>
                  <p className="text-sm leading-relaxed text-anchor-cream-text/70">
                    Team up with friends who love different eras of music so you can nail the classics, throwbacks, and current hits.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full card-dark rounded-none border border-anchor-gold/15">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-cream-text">Arrive early</h3>
                  <p className="text-sm leading-relaxed text-anchor-cream-text/70">
                    Doors open at {doorTime}. Grab your drinks, settle the table, and you will not miss the opening clips.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full card-dark rounded-none border border-anchor-gold/15">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-cream-text">Keep your card visible</h3>
                  <p className="text-sm leading-relaxed text-anchor-cream-text/70">
                    Clear the table and keep your card in sight so you can mark the track before the next clip drops.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full card-dark rounded-none border border-anchor-gold/15">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-cream-text">Stay for the finale</h3>
                  <p className="text-sm leading-relaxed text-anchor-cream-text/70">
                    The last round brings the biggest prize, so stick around and keep the energy high.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <FAQAccordionWithSchema faqs={FAQS} className="bg-anchor-bg" />

      <Section spacing="md" background="white">
        <Container>
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-anchor-green to-anchor-green/80 p-8 text-center text-white shadow-lg">
            <h2 className="mb-4 text-3xl font-bold text-white">Ready to sing for the prizes?</h2>
            <p className="mb-6 text-lg">
              Book your table or call the bar team and we will make sure your seats are ready.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <BookTableButton
                source="music_bingo_cta_bottom"
                variant="secondary"
                size="lg"
                className="w-full bg-white text-anchor-green hover:bg-gray-100 sm:w-auto"
              >
                Book Music Bingo
              </BookTableButton>
              <Button
                size="lg"
                asChild
                className="w-full bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              >
                <Link href="#music-bingo-dates">Upcoming dates</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="gray">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="mb-3 text-2xl font-bold text-anchor-cream-text">Find us</h2>
              <p className="mb-4 text-anchor-cream-text/70">
                The Anchor - Horton Road, Stanwell Moor, TW19 6AQ - Free on-site parking - 7 minutes from Heathrow T5 - 8 minutes from Staines.
              </p>
              <ul className="space-y-3 text-sm text-anchor-cream-text/70">
                <li><strong>Driving:</strong> Use postcode TW19 6AQ. Plenty of free parking right outside.</li>
                <li><strong>Public transport:</strong> 441 and 555 buses stop on Horton Road. Uber and Bolt know us well.</li>
                <li><strong>Accessibility:</strong> Step-free entrance, accessible loos, and flexible seating.</li>
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
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-gold px-4 py-2 font-semibold text-anchor-gold transition hover:bg-anchor-gold hover:text-anchor-green"
                >
                  WhatsApp the team
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-anchor-gold/15 bg-anchor-bg-card shadow-sm">
              <GoogleMapEmbed
                query="The Anchor, Stanwell Moor"
                className="h-full min-h-[300px] overflow-hidden rounded-xl border border-anchor-gold/15 shadow-sm"
              />
            </div>
          </div>
        </Container>
      </Section>

      <JsonLd data={bingoEventSeries} />
      <EventSchema event={staticEvents.musicBingo} />
      {events.map(event => (
        <EventSchema key={`event-schema-${event.id}`} event={event} />
      ))}
    </>
  )
}
