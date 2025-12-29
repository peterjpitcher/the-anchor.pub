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
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import EventBooking from '@/components/EventBooking'
import {
  getUpcomingEvents,
  formatEventDate,
  formatEventTime,
  formatDoorTime,
  type Event
} from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { staticEvents } from '@/lib/static-events'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BookTableButton } from '@/components/BookTableButton'

export const metadata: Metadata = {
  title: 'Cash Bingo Near Heathrow | Bingo Games & Jackpots | The Anchor',
  description:
    'Play cash bingo and bingo games near Heathrow at The Anchor. £10 bingo tickets, bingo calls, cash prizes, snowball bonus, and jackpot bingo in Stanwell Moor.',
  keywords:
    'cash bingo, bingo night, bingo games, play bingo for cash, bingo hall, bingo tickets, bingo books, jackpot bingo, cash prizes, bingo calls, bingo numbers, bingo number caller, bingo near heathrow'
}

function getBingoEvents(events: Event[]) {
  return events
    .filter(event => (event.name || '').toLowerCase().includes('bingo'))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const WHY_LOVE_IT = [
  {
    icon: '💷',
    title: 'Cash-first bingo night',
    body: 'Ten lively bingo games for money with £10 bingo books (tickets), instant cash prizes, a snowball bingo bonus that climbs by £20 each month and a jackpot bingo pot that rolls to £300+ when the room sells out.'
  },
  {
    icon: '🎙️',
    title: 'Classic calls with Anchor humour',
    body: 'Traditional bingo calls and bingo numbers delivered by our bingo number caller, mixed with Anchor in-jokes – Two Little Ducks gets a crowd quack, 59 earns a toast. Friendly hosts keep the pace spot on.'
  },
  {
    icon: '🍽️',
    title: 'Freshly-cooked fuel',
    body: 'Our full, delicious menu is served 6 pm–9 pm on bingo nights, so you can order burgers, sharers and puddings straight to your table between games.'
  },
  {
    icon: '📣',
    title: 'Perfect night out',
    body: 'Doors & book sales from 6 pm, eyes down at 7 pm, finale by 9:30 pm. Ideal for Heathrow crews, locals, work mates and birthday nights.'
  },
  {
    icon: '🔁',
    title: 'Snowball loyalty perks',
    body: 'Attend three in a row to unlock the rolling snowball on Game 9. We track regulars on the Snowball Register so loyalty really does pay.'
  }
]

const FAQS = [
  {
    question: 'When does cash bingo start and finish?',
    answer:
      'Book sales and seating open at 6 pm. Bingo starts at 7 pm and runs to around 9:30 pm with two 10-minute breaks for food, drinks and extra book sales.'
  },
  {
    question: 'How much is it to play and how do I pay?',
    answer:
      'Each bingo book (your bingo tickets for the night) is £10 and payment is cash-only (same for £1 daubers). Prizes are paid out in cash on the night, so bring notes or hit the ATM before you arrive.'
  },
  {
    question: 'Do I need to book in advance?',
    answer:
      'Yes—tickets sell fast. Pop your mobile number into the booking form above or call 01753 682707 and we’ll reserve a table. Walk-ins are welcome while capacity lasts.'
  },
  {
    question: 'Is there an age limit for bingo night?',
    answer:
      'Cash bingo is primarily an over-18 event but supervised children are welcome. Keep phones on silent and little ones seated with their grown-ups during games.'
  },
  {
    question: 'What are the prizes and how does the snowball work?',
    answer:
      'Expect a lively combination of free drinks, chocolate, quiz tickets, food vouchers, £10 cash boosts, a snowball bonus and a jackpot pot that grows with every £10 book sold. The snowball headline increases by £20 each month it rolls over, and we add two extra calls every time to make it easier to win.'
  },
  {
    question: 'Do you serve food and drinks?',
    answer:
      'Absolutely. Our full menu and bar service run 6 pm–9 pm on bingo nights. Order before the first game or during the breaks and we’ll deliver everything straight to your table.'
  },
  {
    question: 'Can we host a private cash bingo fundraiser?',
    answer:
      'Yes. From corporate socials to charity nights we can supply callers, books and prize structure. Email manager@the-anchor.pub or call 01753 682707 to build a bespoke package.'
  },
  {
    question: 'Where can I see the latest dates?',
    answer:
      'Check the Upcoming Bingo Dates below or visit our What’s On page. Bonus specials are announced there first, so it’s the best place to keep tabs on the next cash bingo night.'
  }
]

function BingoEventCards({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-anchor-green mb-2">New cash bingo dates are loading soon</p>
        <p className="text-gray-600">
          We’re finalising the next jackpot night. Call 01753 682707 and we’ll text you as soon as books go on sale.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const doorTime = formatDoorTime(event.doorTime)
        const startTime = formatEventTime(event.startDate)
        const isTentative = new Date(event.startDate).getTime() > new Date().getTime() + 30 * 24 * 60 * 60 * 1000 || (event.eventStatus || '').toLowerCase().includes('draft')
        const eventUrl = getEventWebsiteUrl(event)
        const imageSrc = event.heroImageUrl || event.image?.[0] || null

        return (
          <Card key={event.id} className="overflow-hidden border border-anchor-sand shadow-lg">
            <div className="bg-anchor-green text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs uppercase tracking-wide text-white/70">Monthly cash bingo</p>
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
                <p className="text-xs text-white/70">Doors {doorTime ?? '6:00pm'} • £10 cash book</p>
              </div>
            </div>
            <CardBody className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
              {imageSrc && (
                <Link href={eventUrl} className="w-full lg:w-48">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={imageSrc}
                      alt={`${event.name} cash bingo night at The Anchor`}
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
                <p className="text-sm text-gray-600">
                  £10 cash-only books cover all ten games. The jackpot pot grows with every ticket sold, and the snowball bonus increases by £20—and two extra calls—each time it rolls over. Stay loyal, sign the Snowball Register and the prize gets easier to win.
                </p>
              </div>

              <div className="w-full lg:w-64 space-y-3">
                <EventBooking event={event} className="w-full" isTentative={isTentative} />
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}

export default async function CashBingoPage() {
  const events = getBingoEvents(await getUpcomingEvents(60, 365))
  const nextEvent = events[0]
  const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Next date announced soon'
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '7:00 pm start'
  const doorTime = nextEvent ? formatDoorTime(nextEvent.doorTime) ?? '6:00 pm' : '6:00 pm'

  const heroDescription = nextEvent
    ? `Doors ${doorTime}. Bingo starts at ${nextEventTime} with £10 cash-only bingo tickets (books). Reserve online or call 01753 682707 to lock in your table.`
    : 'Doors 6:00 pm. Bingo starts at 7:00 pm with £10 cash-only bingo tickets (books). Reserve online or call 01753 682707 to lock in your table.'

  return (
    <>
      <HeroWrapper
        route="/cash-bingo"
        title="Cash Bingo Nights & Bingo Games at The Anchor"
        description="Play bingo for cash and classic bingo games near Heathrow with £10 bingo tickets and books, bingo calls and numbers, a snowball bonus and jackpot bingo prizes."
        variant="promo"
        tags={[
          { label: '🎟️ £10 bingo tickets & books', variant: 'default' },
          { label: '🎯 Snowball bingo bonus grows monthly', variant: 'primary' },
          { label: '🍽️ Full menu 6 pm–9 pm', variant: 'default' }
        ]}
        primaryCta={
          <a
            href="#bingo-dates"
            className={cn(
              'inline-flex items-center justify-center font-semibold text-center transition-all duration-200 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 bg-white text-anchor-green border-2 border-anchor-green hover:bg-anchor-green hover:text-white px-8 py-3.5 text-lg min-h-[48px] w-full sm:w-auto'
            )}
          >
            📅 See upcoming bingo dates
          </a>
        }
        secondaryCta={
          <PhoneButton
            phone="01753 682707"
            source="cash_bingo_hero"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📞 Call to reserve: 01753 682707
          </PhoneButton>
        }
      />

      <Section spacing="sm" background="white">
        <Container>
          <PageTitle className="text-center text-anchor-green" seo={{ structured: true, speakable: true }}>
            Cash Bingo Night & Bingo Games – Stanwell Moor & Heathrow
          </PageTitle>
          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
            Searching for cash bingo games near Heathrow? Every few weeks we turn The Anchor into a buzzing bingo hall and bingo room with bingo games for money, cash prizes, hot food from the kitchen and a friendly crowd of locals, cabin crew and Stanwell Moor neighbours. {heroDescription}
          </p>
        </Container>
      </Section>

      <Section spacing="sm" background="white">
        <Container>
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
            <Card className="bg-anchor-cream/50 shadow-sm">
              <CardBody>
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Sunday Roast Bingo Weekends</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Book Sunday roast by 1pm Saturday and tuck in before doors open at 6 pm. Perfect for family bingo nights.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="bingo_roast_cta"
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
                <h3 className="text-xl font-semibold text-anchor-green mb-2">Stone-Baked Pizza Warm-Up</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Hand-stretched pizzas with bold toppings. Share slices between games without leaving your table.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="bingo_pizza_cta"
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
                  Burgers, wings, puddings and themed cocktails delivered direct to your bingo table throughout the night.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="bingo_food_menu_cta"
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

      <Section spacing="md" background="gray">
        <Container>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-stretch">
            <Card className="bg-white shadow-lg border border-anchor-sand">
              <CardBody className="space-y-4">
                <p className="text-sm uppercase tracking-wide text-anchor-gold font-semibold">Next cash bingo night</p>
                <h2 className="text-3xl font-bold text-anchor-charcoal">{nextEvent ? nextEvent.name : 'Next cash bingo announced soon'}</h2>
                <p className="text-anchor-green font-semibold">{nextEvent ? `${nextEventDate} · ${nextEventTime}` : 'Check back for the next date'}</p>
                <p className="text-gray-700 whitespace-pre-line">
                  £10 cash book includes all ten bingo games, two breaks and eligibility for instant cash prizes, the rolling snowball bingo bonus (we add £20 and two extra calls every time it rolls over) and the jackpot bingo pot.
                </p>
                <div className="space-y-3">
                  {nextEvent ? (
                    <EventBooking event={nextEvent} className="w-full" />
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
                <h3 className="text-2xl font-bold text-anchor-charcoal">How the night feels</h3>
                <p className="text-gray-700">
                  We keep things punchy in the bingo room: ten quick-fire games with two planned pauses so you can top up drinks, grab fresh cards and order from the kitchen without missing a call.
                </p>
                <p className="text-gray-700">
                  Expect classic bingo banter, cheeky spot prizes and a snowball countdown that gets louder as the numbers close in. When you shout bingo, our host will check the board and make sure the pot lands in the right hands.
                </p>
                <p className="text-sm text-gray-600">
                  Caller’s decision is final, mobiles stay on silent and tied games split the winnings evenly.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>
      <Section spacing="md" background="white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-anchor-charcoal mb-8 text-center">
              Why everyone loves cash bingo at The Anchor
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
          <div className="max-w-4xl mx-auto text-gray-700 space-y-4">
            <h2 className="text-3xl font-bold text-anchor-charcoal text-center">What’s up for grabs?</h2>
            <p>
              We keep prizes fresh so every cash bingo night feels different. Expect a lively mix of bingo prizes and cash prizes: free drinks, chocolate bars, quiz night tickets, food vouchers, £10 cash boosts, cheeky spot prizes and a jackpot bingo pot that grows with every £10 book sold. The snowball bonus carries over an extra £20—and two additional calls—each month it survives, so loyal dabbers see the prize get juicier and easier to win.
            </p>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-anchor-charcoal text-center mb-6">Tips for playing bingo for cash</h2>
            <p className="text-gray-700 text-center max-w-3xl mx-auto mb-6">
              Looking to “play bingo for cash” like a pro? These quick-fire tips from our regulars help you stay sharp and give the snowball your best shot.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="h-full bg-white border border-gray-100 shadow-sm">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-charcoal">Bring the right kit</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Cash-only entry, so bring notes and coins for bingo tickets, £10 bingo books and £1 daubers. Pack spare daubers or lucky charms—confidence helps when the jackpot numbers fall.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full bg-white border border-gray-100 shadow-sm">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-charcoal">Arrive early for the best spots</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Doors open at 6 pm. Bingo start time is 7 pm. Turn up early, claim a clear sightline to the caller, order dinner and review the snowball rules before Game 1.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full bg-white border border-gray-100 shadow-sm">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-charcoal">Keep your focus between calls</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Use the breaks to stretch, order drinks and catch up. During games keep conversations low, phones away and eyes on the card so you never miss the bingo calls or numbers.
                  </p>
                </CardBody>
              </Card>
              <Card className="h-full bg-white border border-gray-100 shadow-sm">
                <CardBody className="space-y-3">
                  <h3 className="text-xl font-semibold text-anchor-charcoal">Build your snowball streak</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Attend each cash bingo night and we tick you off on the Snowball Register. Every consecutive month boosts your eligibility when the snowball finally lands.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white" id="bingo-dates">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-anchor-charcoal text-center mb-6">Upcoming cash bingo dates</h2>
            <p className="text-gray-700 text-center mb-8">
              We’ve listed confirmed bingo nights below. For the very latest schedule—including bonus specials—visit our <Link href="/whats-on" className="text-anchor-gold hover:text-anchor-gold-light font-semibold">What’s On page</Link> or call 01753 682707.
            </p>
            <BingoEventCards events={events} />
          </div>
        </Container>
      </Section>

      <FAQAccordionWithSchema faqs={FAQS} className="bg-white" />

      <Section spacing="md" background="white">
        <Container>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-anchor-green to-anchor-green/80 rounded-2xl p-8 text-white text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to shout “Bingo”?</h2>
            <p className="text-lg mb-6">
              Book your £10 cash book today or call the bar team and we’ll hold tickets for your crew.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PhoneButton
                phone="01753 682707"
                source="cash_bingo_cta_bottom"
                size="lg"
                className="w-full sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
              >
                📞 Call us on 01753 682707
              </PhoneButton>
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="#bingo-dates">📅 Upcoming bingo dates</Link>
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
                The Anchor · Horton Road, Stanwell Moor, TW19 6AQ · Free on-site parking · 7 minutes from Heathrow T5 · 10 minutes from Staines.
              </p>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li><strong>Driving:</strong> Use postcode TW19 6AQ. Plenty of free parking right outside.</li>
                <li><strong>Public transport:</strong> 441 & 555 buses stop on Horton Road. Uber and Bolt know us well.</li>
                <li><strong>Accessibility:</strong> Step-free entrance, accessible loos and flexible seating for players.</li>
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

      <EventSchema event={staticEvents.bingoNight} />
      {events.map(event => (
        <EventSchema key={`event-schema-${event.id}`} event={event} />
      ))}
    </>
  )
}
