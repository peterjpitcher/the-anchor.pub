
import { Metadata } from 'next'
import { Button, Container, Card, CardBody, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { HeroBadge } from '@/components/HeroBadge'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
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

export const metadata: Metadata = {
    title: 'Karaoke Near Heathrow | Free Entry When Listed',
    description:
        'Karaoke nights at The Anchor, Stanwell Moor when listed or confirmed. Free entry, free parking and around 7 mins from Heathrow T5, traffic dependent.',
    openGraph: {
        title: 'Karaoke Pub Near Heathrow | The Anchor',
        description: 'Karaoke nights when listed or confirmed. Free entry. Sing your heart out in Stanwell Moor.',
        images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
    },
    twitter: getTwitterMetadata({
        title: 'Karaoke Pub Near Heathrow | The Anchor',
        description: 'Karaoke nights when listed or confirmed. Free entry. Sing your heart out in Stanwell Moor.',
        images: [DEFAULT_EVENT_IMAGE]
    }),
    alternates: {
        canonical: '/karaoke'
    }
}

// Category lookup, fetching, de-duplication and sorting all live in
// lib/game-nights/events.ts, shared by the four game pages. Karaoke's two
// categories (including the legacy one) are declared in lib/game-nights/karaoke.ts.

const WHY_LOVE_IT = [
    {
        icon: '',
        title: '50,000+ Songs',
        body: 'From 80s power ballads to today\'s chart-toppers, our library of over 50,000 tracks means if you can hum it, you can probably sing it.'
    },
    {
        icon: '',
        title: 'Free to Sing',
        body: 'No entry fee, no cost to sing. Just grab a drink, pick your track, and claim the spotlight. It\'s all about having fun.'
    },
    {
        icon: '',
        title: 'Liquid Courage',
        body: 'Need a confidence boost? Our bar is fully stocked with craft beers, cocktails, and shots to help you hit those high notes.'
    },
    {
        icon: '',
        title: 'A proper host on the night',
        body: 'Whoever is hosting keeps the energy high, the queue moving and the crowd singing along. Check the event listing to see who is on.'
    },
    {
        icon: '',
        title: 'Supportive Crowd',
        body: 'Whether you\'re a pro vocalist or just having a laugh, the Stanwell Moor crowd is always behind you. Good vibes only!'
    }
]

const FAQS = [
    {
        question: 'When is karaoke night?',
        answer:
            'Karaoke runs occasionally rather than to a fixed weekly slot, so there is no standing Friday night. Check the upcoming dates below or our What\'s On page for the next confirmed session.'
    },
    {
        question: 'Do I have to pay to sing?',
        answer:
            'Not a penny! Entry is free and singing is free. Just buy a drink and enjoy the night.'
    },
    {
        question: 'Do I need to book a table?',
        answer:
            'It\'s first come, first served for tables, but there\'s plenty of room. If you\'re bringing a big group, give us a call on 01753 682707 and we\'ll try to save you a spot.'
    },
    {
        question: 'Can I request a specific song?',
        answer:
            'Absolutely! Our karaoke host has a huge digital library. Just ask them on the night and they\'ll get you queued up.'
    },
    {
        question: 'Is it suitable for children?',
        answer:
            'Karaoke is great fun for families in the early evening. However, after 9pm, it\'s strictly 18+ as the pub gets busier.'
    }
]

function KaraokeEventCards({ events }: { events: Event[] }) {
    return (
        <EventDateCards
            events={events}
            eyebrow="Karaoke Night"
            bookingSource="karaoke_event_card"
            imageAltSuffix="at The Anchor"
            renderMeta={() => <p className="text-xs text-ink-muted">Free Entry</p>}
            renderDetails={() => (
                <p className="text-sm text-ink-muted">
                    Grab the mic and show us what you've got. Check the event listing for host, timings and song details.
                </p>
            )}
            emptyState={
                <>
                    <p className="text-lg font-semibold text-accent-text mb-2">Next karaoke dates coming soon</p>
                    <p className="text-ink-muted">
                        We're tuning the mics and scheduling the next night. Call 01753 682707 or check back shortly.
                    </p>
                </>
            }
        />
    )
}

export default async function KaraokePage() {
    const events = await getGameNightEvents(karaoke)
    const nextEvent = events[0]
    const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Next date to be confirmed'
    const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '8:00pm approx'

    const heroDescription = nextEvent
        ? `Next karaoke night: ${nextEvent.name} on ${nextEventDate} at ${nextEventTime}. Free entry, endless tunes!`
        : 'Sing your heart out at The Anchor. Thousands of songs, cold drinks and a room that always joins in. Free entry.'

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
                        Karaoke Pub Near Heathrow, Sing Your Way to Stardom
                    </PageTitle>
                    <p className="text-lg text-ink-muted text-center mx-auto">
                        Ready to unleash your inner rock star? Whether you&rsquo;re belting out ballads or rapping 90s classics, we provide the stage, the mic, and the enthusiastic crowd. Karaoke runs occasionally rather than every week, so check the dates below before you set off. {heroDescription}
                    </p>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
        <Container>
                    <div className="mx-auto grid md:grid-cols-2 gap-6 items-start">
                        <SectionViewTracker sectionId="karaoke_booking">
                            <GameNightBooking
                                events={events}
                                gameName={karaoke.name}
                                gameSlug={karaoke.slug}
                                bookingNote={karaoke.bookingNote}
                            />
                        </SectionViewTracker>
                        {/* Right column stacks the "how it works" card and the
                            objections, so it is not left mostly empty beside the
                            much taller booking form. */}
                        <div className="space-y-6">
                        <Card accent>
                            <CardBody className="space-y-4">
                                <h3 className="text-h4 text-ink-strong">How it works</h3>
                                <ul className="space-y-3 text-ink-muted">
                                    <li><strong>Dates vary:</strong> Karaoke is occasional, so check the latest listing before you travel.</li>
                                    <li><strong>Choose your track:</strong> Browse the available song list on the night.</li>
                                    <li><strong>Eat & Drink:</strong> Check live kitchen hours before you travel. Bar times come from the live listing.</li>
                                    <li><strong>Free Entry:</strong> Always free entry, always good vibes.</li>
                                </ul>
                                <p className="text-sm text-ink-muted">
                                    Solo singers, duets and group ensembles all welcome. We'll even provide backing vocals if you need a hand!
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
                        <h2 className="text-h3 text-ink-strong text-center mb-6">Upcoming Karaoke Nights</h2>
                        <p className="text-ink-muted text-center mb-8">
                            Mic check, one two! Here's when you can next take the stage. For updates, check <Link href="/whats-on" className="text-accent-text hover:text-accent-text font-semibold">What&apos;s On this week</Link> or our <Link href="https://facebook.com/theanchorstanwellmoor" className="text-accent-text hover:text-accent-text font-semibold">Facebook page</Link>.
                        </p>
                        <SectionViewTracker sectionId="karaoke_dates">
                            <KaraokeEventCards events={events} />
                        </SectionViewTracker>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
        <Container>
                    <div className="mx-auto grid gap-6 md:grid-cols-3">
                        <Card accent>
                            <CardBody>
                                <h3 className="text-xl font-semibold text-accent-text mb-2">Pre-Show Fuel</h3>
                                <p className="text-sm text-ink-muted mb-4">
                                    Calm the nerves with a burger or pizza before you hit the stage. Kitchen open late.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <BookTableButton
                                        source="karaoke_food_cta"
                                        variant="primary"
                                        size="sm"
                                        className="w-full"
                                    >
                                        Book a Table
                                    </BookTableButton>
                                    <Link href="/food-menu" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                                        View Food Menu →
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                        <Card accent>
                            <CardBody>
                                <h3 className="text-xl font-semibold text-accent-text mb-2">Group Bookings</h3>
                                <p className="text-sm text-ink-muted mb-4">
                                    Planning a birthday or office party? Reserve a specialized area for your team.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <BookTableButton
                                        source="karaoke_group_cta"
                                        variant="primary"
                                        size="sm"
                                        className="w-full"
                                    >
                                        Book for Groups
                                    </BookTableButton>
                                    <Link href="/contact" className="text-sm text-accent-text font-semibold hover:text-anchor-green transition">
                                        Contact Us →
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                        <Card accent>
                            <CardBody>
                                <h3 className="text-xl font-semibold text-accent-text mb-2">Cocktails & Shots</h3>
                                <p className="text-sm text-ink-muted mb-4">
                                    From courage-boosting shots to celebratory cocktails, the bar is stocked for the occasion.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Link href="/food-menu#drinks" className="w-full">
                                        <Button variant="outline" size="sm" fullWidth>View Drinks List</Button>
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
        <Container>
                    <div className="mx-auto">
                        <h2 className="text-h2 text-ink-strong mb-8 text-center">
                            Why our karaoke nights hit the high notes
                        </h2>
                        <Grid cols={WHY_LOVE_IT.length > 3 ? 4 : 3} gap="md">
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

            <section className="py-section-y bg-surface">
        <Container>
                    <div className="mx-auto text-center">
                        <h2 className="text-h4 text-ink-strong mb-3">More Things to Do at The Anchor</h2>
                        <p className="text-ink-muted">
                            Looking for more entertainment near Heathrow? Rally your team for our monthly <Link href="/quiz-night" className="text-accent-text font-semibold hover:text-accent-text transition">pub quiz night</Link> with a £25 bar tab up for grabs, or play along at <Link href="/music-bingo" className="text-accent-text font-semibold hover:text-accent-text transition">Music Bingo</Link> with Nikki Manfadge.
                        </p>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema faqs={FAQS} />

            <section className="py-section-y bg-surface-sunk">
        <Container>
                    <div className="mx-auto grid md:grid-cols-2 gap-6 items-start">
                        <div>
                            <h2 className="text-h4 text-ink-strong mb-3">Find us</h2>
                            <p className="text-ink-muted mb-4">
                                The Anchor · Horton Road, Stanwell Moor, TW19 6AQ · Free on-site parking · 7 minutes from Heathrow T5 · 8 minutes from Staines.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                <Link
                                    href="https://maps.app.goo.gl/YNbjTDF9g7uCcbYF6"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-green px-4 py-2 text-anchor-green font-semibold hover:bg-anchor-green hover:text-white transition"
                                >
                                    Get directions
                                </Link>
                                <Link
                                    href="https://wa.me/441753682707"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-gold-dark px-4 py-2 text-accent-text font-semibold hover:bg-anchor-gold-dark hover:text-anchor-green transition"
                                >
                                    WhatsApp us
                                </Link>
                            </div>
                        </div>
                        <div className="h-full">
                            <GoogleMapEmbed
                                query="The Anchor, Stanwell Moor"
                                className="h-full min-h-[300px] border border-line rounded-xl overflow-hidden shadow-sm"
                            />
                        </div>
                    </div>
                </Container>
            </section>

            <CtaBand
                title="Ready to take the stage?"
                copy="Entry is free. Booking just means there is a table waiting when you get here."
            >
                <GameNightCtaActions
                    gameSlug={karaoke.slug}
                    label={buildGameNightCtaLabel(karaoke, nextEvent)}
                    hasBookableDate={Boolean(nextEvent)}
                    location="closing_band"
                />
            </CtaBand>

            {events.map(event => (
                <EventSchema key={`event-schema-${event.id}`} event={event} />
            ))}
        </>
    )
}
