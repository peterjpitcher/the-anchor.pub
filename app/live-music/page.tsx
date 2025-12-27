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
    title: 'Live Music Pub Near Heathrow | Live Bands & Local Gigs | The Anchor',
    description:
        'Enjoy live music near Heathrow at The Anchor. Featuring local bands, acoustic sets, and tribute acts in Stanwell Moor. Free entry, great atmosphere, and cold pints.',
    keywords:
        'live music pub, live bands, pub gigs, music production, stanwell moor live music, heathrow live music, pub music staines, acoustic night, pub rock bands'
}

function getMusicEvents(events: Event[]) {
    return events
        .filter(event => (event.category?.slug === 'live-music' || (event.name || '').toLowerCase().includes('music') || (event.name || '').toLowerCase().includes('band')))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const WHY_LOVE_IT = [
    {
        icon: '🎸',
        title: 'Top Local Talent',
        body: 'From high-energy party bands to soulful acoustic soloists, we hand-pick the best local performers to get the pub jumping.'
    },
    {
        icon: '💸',
        title: 'Always Free Entry',
        body: 'No tickets, no cover charge. Just turn up, grab a pint, and enjoy the show. We believe live music should be accessible to everyone.'
    },
    {
        icon: '🍻',
        title: 'Proper Pub Atmosphere',
        body: 'Great acoustics, friendly crowds, and plenty of space to dance or chill. It’s exactly how a pub gig should feel.'
    },
    {
        icon: '🍔',
        title: 'Fuel for the Show',
        body: 'Kitchen open until 9pm for burgers, pizzas and sharers. Perfect for lining the stomach before the band starts.'
    }
]

const FAQS = [
    {
        question: 'When is live music on?',
        answer:
            'We host live music regularly, typically on weekends or special events. Check our upcoming dates list below or the What’s On page for the latest schedule.'
    },
    {
        question: 'Is there an entry fee?',
        answer:
            'Nope! Live music at The Anchor is always free entry. Just bring money for drinks and food.'
    },
    {
        question: 'What kind of music do you have?',
        answer:
            'We offer a mix of genres, from classic rock and pop covers to acoustic sessions and tribute acts. There’s something for everyone.'
    },
    {
        question: 'Do I need to book a table?',
        answer:
            'Booking is recommended if you want to guarantee a seat, especially for popular bands. However, there’s usually plenty of standing room at the bar.'
    },
    {
        question: 'Can kids come to live music?',
        answer:
            'Yes, until 9pm. After that, due to licensing, it’s 18+ only.'
    }
]

function MusicEventCards({ events }: { events: Event[] }) {
    if (!events.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-lg font-semibold text-anchor-green mb-2">New gigs announced soon</p>
                <p className="text-gray-600">
                    We’re booking our next acts right now. Call 01753 682707 or check back soon for the latest lineup.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {events.map((event, index) => {
                const doorTime = formatDoorTime(event.doorTime)
                const startTime = formatEventTime(event.startDate)
                const eventUrl = getEventWebsiteUrl(event)
                const imageSrc = event.heroImageUrl || event.image?.[0] || null

                return (
                    <Card key={event.id} className="overflow-hidden border border-anchor-sand shadow-lg">
                        <div className="bg-anchor-green text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wide text-white/70">Live Music Event</p>
                                <Link href={eventUrl} className="block text-xl font-bold text-white hover:text-anchor-gold transition">
                                    {event.name}
                                </Link>
                                <p className="text-sm text-white/80 line-clamp-1">{formatEventDate(event.startDate)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-white">{startTime}</p>
                                <p className="text-xs text-white/70">Free Entry</p>
                            </div>
                        </div>

                        <CardBody className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
                            {imageSrc && (
                                <Link href={eventUrl} className="w-full lg:w-48">
                                    <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                                        <Image
                                            src={imageSrc}
                                            alt={`${event.name} at The Anchor`}
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
                                    Join us for a fantastic night of live music. Great beer, great atmosphere, and no cover charge.
                                </p>
                            </div>

                            <div className="w-full lg:w-64 space-y-3">
                                <EventBooking event={event} className="w-full" />
                            </div>
                        </CardBody>
                    </Card>
                )
            })}
        </div>
    )
}

export default async function LiveMusicPage() {
    const events = getMusicEvents(await getUpcomingEvents(20))
    const nextEvent = events[0]
    const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Check our socials'
    const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '8:30pm approx'

    const heroDescription = nextEvent
        ? `Next gig: ${nextEvent.name} on ${nextEventDate} at ${nextEventTime}. Free entry!`
        : 'Local bands, acoustic sets and tribute acts. Free entry and great atmosphere.'

    return (
        <>
            <HeroWrapper
                route="/live-music"
                title="Live Music at The Anchor"
                description="Experience the best live music pub near Heathrow. From acoustic sessions to full bands, enjoy great tunes and free entry in Stanwell Moor."
                variant="promo"
                tags={[
                    { label: '🎸 Live Local Talent', variant: 'primary' },
                    { label: '💸 Always Free Entry', variant: 'default' },
                    { label: '🍻 Cold Pints & Hot Food', variant: 'default' }
                ]}
                primaryCta={
                    <a
                        href="#music-dates"
                        className={cn(
                            'inline-flex items-center justify-center font-semibold text-center transition-all duration-200 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 bg-white text-anchor-green border-2 border-anchor-green hover:bg-anchor-green hover:text-white px-8 py-3.5 text-lg min-h-[48px] w-full sm:w-auto'
                        )}
                    >
                        📅 See upcoming gigs
                    </a>
                }
                secondaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="live_music_hero"
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
                        Live Music Pub Near Heathrow – Bands, Gigs & Good Times
                    </PageTitle>
                    <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
                        Looking for live music near Heathrow? The Anchor brings you the best local talent, from foot-tapping acoustic sets to high-energy party bands. Located in Stanwell Moor, just minutes from the airport, we’re the perfect spot for music lovers to unwind with a pint and a gig. {heroDescription}
                    </p>
                </Container>
            </Section>

            <Section spacing="sm" background="white">
                <Container>
                    <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
                        <Card className="bg-anchor-cream/50 shadow-sm">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-green mb-2">Pre-Gig Dinner</h3>
                                <p className="text-sm text-gray-700 mb-4">
                                    Kitchen open until 9pm. Grab a burger or pizza before the music starts.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <BookTableButton
                                        source="live_music_food_cta"
                                        variant="primary"
                                        size="sm"
                                        className="w-full"
                                    >
                                        Book a Table
                                    </BookTableButton>
                                    <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                                        View Food Menu →
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="bg-white shadow-sm">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-green mb-2">Sunday Sessions</h3>
                                <p className="text-sm text-gray-700 mb-4">
                                    Relaxed acoustic vibes to go with your Sunday Roast. The perfect end to the week.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <BookTableButton
                                        source="live_music_roast_cta"
                                        variant="primary"
                                        size="sm"
                                        className="w-full"
                                    >
                                        Book Sunday Roast
                                    </BookTableButton>
                                    <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                                        Sunday Menu →
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="bg-anchor-cream/50 shadow-sm">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-green mb-2">Drinks & Cocktails</h3>
                                <p className="text-sm text-gray-700 mb-4">
                                    Full bar service with craft beers, ales, wines and cocktails to enjoy while you listen.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Link href="/food-menu#drinks" className="w-full">
                                        <Button variant="secondary" size="sm" fullWidth>View Drinks List</Button>
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </Section>

            <Section spacing="md" background="gray">
                <Container>
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-anchor-charcoal mb-8 text-center">
                            Why catch a gig at The Anchor?
                        </h2>
                        <Grid cols={WHY_LOVE_IT.length > 3 ? 4 : 3} gap="md">
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

            <Section spacing="md" background="white" id="music-dates">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-anchor-charcoal text-center mb-6">Upcoming Gigs</h2>
                        <p className="text-gray-700 text-center mb-8">
                            Here’s who’s playing next. For the most up-to-date info, keep an eye on our <Link href="https://facebook.com/theanchorstanwellmoor" className="text-anchor-gold hover:text-anchor-gold-light font-semibold">Facebook page</Link>.
                        </p>
                        <MusicEventCards events={events} />
                    </div>
                </Container>
            </Section>

            <FAQAccordionWithSchema faqs={FAQS} className="bg-white" />

            <Section spacing="md" background="gray">
                <Container>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-anchor-charcoal mb-3">Find us</h2>
                            <p className="text-gray-700 mb-4">
                                The Anchor · Horton Road, Stanwell Moor, TW19 6AQ · Free on-site parking · 7 minutes from Heathrow T5 · 10 minutes from Staines.
                            </p>
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
                                    💬 WhatsApp us
                                </Link>
                            </div>
                        </div>
                        <div className="h-full">
                            <GoogleMapEmbed
                                query="The Anchor, Stanwell Moor"
                                className="h-full min-h-[300px] border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                            />
                        </div>
                    </div>
                </Container>
            </Section>

            <EventSchema event={staticEvents.liveMusic} />
            {events.map(event => (
                <EventSchema key={`event-schema-${event.id}`} event={event} />
            ))}
        </>
    )
}
