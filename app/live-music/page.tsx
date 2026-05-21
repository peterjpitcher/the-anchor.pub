
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
    SectionHeader,
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
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
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BookTableButton } from '@/components/BookTableButton'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { liveMusicEventSeries } from '@/lib/schema'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Live Music Pub Near Heathrow | Bands & Acoustic Nights',
    description:
        'The best live music pub near Heathrow, bands, acoustic sessions and tribute acts in Stanwell Moor. Free entry, free parking, 7 mins from T5. See upcoming gigs.',
    openGraph: {
        title: 'Live Music Pub Near Heathrow | The Anchor, Stanwell Moor',
        description: 'The best live music pub near Heathrow, bands, acoustic sessions and tribute acts. Free entry, free parking, 7 mins from T5.',
        images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
    },
    twitter: getTwitterMetadata({
        title: 'Live Music Pub Near Heathrow | The Anchor, Stanwell Moor',
        description: 'The best live music pub near Heathrow, bands, acoustic sessions and tribute acts. Free entry, free parking, 7 mins from T5.',
        images: [DEFAULT_EVENT_IMAGE]
    }),
    alternates: {
        canonical: '/live-music'
    }
}

const LIVE_MUSIC_CATEGORY = {
    name: 'Live Music',
    slug: 'live-music'
}

const normalizeCategoryValue = (value?: string | null) =>
    value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdByLabel(categories: EventCategory[], label: typeof LIVE_MUSIC_CATEGORY) {
    const targetName = normalizeCategoryValue(label.name)
    const targetSlug = normalizeCategoryValue(label.slug)

    return categories.find(category => {
        const categoryName = normalizeCategoryValue(category.name)
        const categorySlug = normalizeCategoryValue(category.slug)
        return categoryName === targetName || categorySlug === targetSlug
    })?.id
}

async function getLiveMusicEvents() {
    const categories = await getEventCategories()
    const liveMusicCategoryId = getCategoryIdByLabel(categories, LIVE_MUSIC_CATEGORY)
    if (!liveMusicCategoryId) return []

    const events = await getUpcomingEventsByCategory(liveMusicCategoryId, 60, 365)
    return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const WHY_LOVE_IT = [
    {
        icon: '',
        title: 'Top Local Talent',
        body: 'From high-energy party bands to soulful acoustic soloists, we hand-pick the best local performers to get the pub jumping.'
    },
    {
        icon: '',
        title: 'Always Free Entry',
        body: 'No tickets, no cover charge. Just turn up, grab a pint, and enjoy the show. We believe live music should be accessible to everyone.'
    },
    {
        icon: '',
        title: 'Proper Pub Atmosphere',
        body: "Great acoustics, friendly crowds, and plenty of space to dance or chill. It's exactly how a pub gig should feel."
    },
    {
        icon: '',
        title: 'Fuel for the Show',
        body: 'Kitchen open until midnight for burgers, pizzas and sharers. Perfect for lining the stomach before the band starts.'
    }
]

const FAQS = [
    {
        question: 'When is live music on?',
        answer:
            "We host live music regularly, typically on weekends or special events. Check our upcoming dates list below or the What's On page for the latest schedule."
    },
    {
        question: 'Is there an entry fee?',
        answer:
            'Nope! Live music at The Anchor is always free entry. Just bring money for drinks and food.'
    },
    {
        question: 'What kind of music do you have?',
        answer:
            "We offer a mix of genres, from classic rock and pop covers to acoustic sessions and tribute acts. There's something for everyone."
    },
    {
        question: 'Do I need to book a table?',
        answer:
            "Booking is recommended if you want to guarantee a seat, especially for popular bands. However, there's usually plenty of standing room at the bar."
    },
    {
        question: 'Can kids come to live music?',
        answer:
            "Yes, until 9pm. After that, due to licensing, it's 18+ only."
    },
    {
        question: 'Is there live music near Heathrow Airport?',
        answer:
            'Yes, Live at The Anchor hosts bands, acoustic nights and tribute acts, just 7 minutes from Heathrow Terminal 5. Free entry, free parking.'
    },
    {
        question: 'How can I perform at The Anchor?',
        answer:
            'Contact us about performing as part of the Live at The Anchor programme. Send a short bio, music links and available dates to manager@the-anchor.pub.'
    },
    {
        question: 'Do you charge for live music events?',
        answer:
            'No, all Live at The Anchor gigs are free entry. Just turn up, grab a drink, and enjoy the music.'
    }
]

function MusicEventCards({ events }: { events: Event[] }) {
    if (!events.length) {
        return (
            <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-xl p-6 text-center">
                <p className="text-lg font-semibold text-anchor-gold-vivid mb-2">Next date to be confirmed</p>
                <p className="text-anchor-cream-text/70">
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
                                    <p className="text-xs uppercase tracking-wide text-white/70">
                                        Live Music Event
                                    </p>
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
                                    <p className="text-anchor-cream-text/70 leading-relaxed">{event.description}</p>
                                )}
                                <p className="text-sm text-anchor-cream-text/55">
                                    Join us for a fantastic night of live music. Great beer, great atmosphere, and no cover charge.
                                </p>
                            </div>

                            <div className="w-full lg:w-64 space-y-3">
                                <EventBookingButton
                                    event={event}
                                    className="w-full"
                                    source="live_music_event_card"
                                    label="Reserve event table"
                                />
                            </div>
                        </CardBody>
                    </Card>
                )
            })}
        </div>
    )
}

export default async function LiveMusicPage() {
    const events = await getLiveMusicEvents()
    const nextEvent = events[0]
    const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Next date to be confirmed'
    const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '8:30pm approx'

    const heroDescription = nextEvent
        ? `Next gig: ${nextEvent.name} on ${nextEventDate} at ${nextEventTime}. Free entry!`
        : 'Local bands, acoustic sets and tribute acts. Free entry and great atmosphere.'

    return (
        <>
            {/* EventSeries JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(liveMusicEventSeries) }}
            />
            <HeroWrapper
                route="/live-music"
                title="Live Music at The Anchor"
                description="Experience the best live music pub near Heathrow. From acoustic sessions to full bands, enjoy great tunes and free entry in Stanwell Moor."
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <Section spacing="sm" background="white">
                <Container>
                    <PageTitle as="h2" className="text-center mb-6" seo={{ structured: true, speakable: true }}>
                        Live Music Pub Near Heathrow, Live at The Anchor
                    </PageTitle>
                    <p className="text-lg text-anchor-cream-text/70 text-center max-w-3xl mx-auto">
                        Looking for a live music pub near you? The Anchor brings you the best local talent, from foot-tapping acoustic sets to high-energy party bands. Located in Stanwell Moor, just minutes from the airport, we’re the perfect live music pub near Heathrow for music lovers to unwind with a pint and a gig. {heroDescription}
                    </p>
                </Container>
            </Section>

            <Section spacing="md" background="gray">
                <Container>
                    <SectionHeader title="Live at The Anchor" subtitle="New bands, singer-songwriters and tribute acts" />
                    <div className="prose prose-invert max-w-3xl mx-auto">
                        <p><strong>Live at The Anchor</strong> is our monthly live music programme showcasing local and touring musicians in an intimate pub setting. From acoustic singer-songwriters to full bands, every gig is free entry with a brilliant atmosphere. We have been building this programme to give Stanwell Moor, Staines and the wider Heathrow area a proper live music pub where the sound is great, the beer is cold, and you are close enough to the stage to make eye contact with the guitarist.</p>
                        <p>Expect a rotating mix of acoustic sets, cover bands, tribute acts and local performers. The programme changes through the year, so check the gig list below for the latest confirmed dates.</p>
                    </div>
                </Container>
            </Section>

            <Section spacing="md" background="white">
                <Container>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-5">
                            <h2 className="text-3xl font-bold text-anchor-cream-text">Bands and Acoustic Nights</h2>
                            <p className="text-anchor-cream-text/70">
                                Our live music nights bring local performers into a proper pub room where the crowd is close, the sound is warm and the atmosphere feels personal. Some nights are stripped-back acoustic sets, others are full-band evenings with familiar covers and a dancefloor feel.
                            </p>
                            <div className="space-y-4">
                                <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-card p-5">
                                    <h3 className="text-lg font-semibold text-anchor-cream-text mb-2">What we book</h3>
                                    <p className="text-sm text-anchor-cream-text/70">We book acoustic soloists, duos, bands and tribute acts that fit a village pub crowd. Covers, classics, soul, funk, rock and upbeat singalong sets all work well here.</p>
                                </div>
                                <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-card p-5">
                                    <h3 className="text-lg font-semibold text-anchor-cream-text mb-2">What to expect</h3>
                                    <p className="text-sm text-anchor-cream-text/70">The room is intimate, the gigs are free entry, and tables are available to book if you want a guaranteed seat. Most live music nights start around 8:30pm.</p>
                                </div>
                                <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-card p-5">
                                    <h3 className="text-lg font-semibold text-anchor-cream-text mb-2">For the audience</h3>
                                    <p className="text-sm text-anchor-cream-text/70">Grab a table, order some food, and enjoy the show. No cover charge, ever.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <h2 className="text-3xl font-bold text-anchor-cream-text">Live Music Near Staines</h2>
                            <p className="text-anchor-cream-text/70">
                                Good live music pubs near Staines are harder to find than you would think. Most of the bigger venues focus on DJs or tribute acts, and the smaller places often lack the space or sound setup to do live music properly. The Anchor fills that gap. We are just eight minutes from Staines-upon-Thames centre, tucked away in Stanwell Moor village, with a dedicated performance area, quality acoustics and room for around 100 people to enjoy the show.
                            </p>
                            <p className="text-anchor-cream-text/70">
                                If you have been searching for live music near Staines or live music pubs near Heathrow, you have found the right place. We bring in acts from across Surrey, West London and beyond, everything from acoustic solo artists to four-piece bands playing classic rock, soul, funk and pop covers.
                            </p>
                            <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-card p-5 space-y-3">
                                <h3 className="text-lg font-semibold text-anchor-cream-text">Getting here for a gig</h3>
                                <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                                    <li><strong>From Staines:</strong> 8 minutes by car or taxi. Follow the B378 towards Stanwell Moor.</li>
                                    <li><strong>From Heathrow:</strong> 7 minutes from Terminal 5, 11 minutes from Terminals 2 and 3.</li>
                                    <li><strong>Parking:</strong> Around 20 free spaces on-site. No charges, no meters.</li>
                                    <li><strong>By bus:</strong> Routes 441 and 442 stop nearby.</li>
                                    <li><strong>Taxi home:</strong> Stanwell Moor is well served by local cabs and rideshares. Typical fare to Staines centre is around £10-12.</li>
                                </ul>
                            </div>
                            <p className="text-sm text-anchor-cream-text/70">
                                We are outside the ULEZ zone, so there is no extra charge for driving here. With free parking and free entry to every gig, a night of live music at The Anchor is one of the most affordable evenings out near Heathrow.
                            </p>
                        </div>
                    </div>
                </Container>
            </Section>

            <Section spacing="sm" background="gray">
                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <h2 className="text-2xl font-bold text-anchor-cream-text">Want to play at The Anchor?</h2>
                        <p className="text-anchor-cream-text/70 max-w-2xl mx-auto">
                            We are always looking for talented musicians and bands to join the <strong>Live at The Anchor</strong> lineup. If you play original music or covers and want a great pub gig in the Heathrow and Staines area, get in touch. We pay our performers fairly and treat every act with respect.
                        </p>
                        <p className="text-sm text-anchor-cream-text/55">
                            Send a short bio, links to your music and your available dates to <a href="mailto:manager@the-anchor.pub" className="text-anchor-gold hover:text-anchor-gold-light font-semibold">manager@the-anchor.pub</a> or call 01753 682707.
                        </p>
                    </div>
                </Container>
            </Section>

            <Section spacing="md" background="gray">
                <Container>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-stretch">
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody className="space-y-4">
                                <p className="text-sm uppercase tracking-wide text-anchor-gold font-semibold">Next live gig</p>
                                <h2 className="text-3xl font-bold text-anchor-cream-text">{nextEvent ? nextEvent.name : 'Next date to be confirmed'}</h2>
                                <p className="text-anchor-gold-vivid font-semibold">{nextEvent ? `${nextEventDate} · ${nextEventTime}` : 'Check back for the next date'}</p>
                                <p className="text-anchor-cream-text/70 whitespace-pre-line">
                                    {nextEvent?.description || 'From acoustic sessions to full rock bands, our live music nights are always free entry and full of energy.'}
                                </p>
                <div className="space-y-3">
                  {nextEvent ? (
                    <EventBookingButton event={nextEvent} className="w-full" source="live_music_next_event" />
                  ) : (
                    <PhoneButton phone={CONTACT.phone} source="live-music_fallback" size="lg" className="w-full bg-anchor-green text-white hover:bg-anchor-green-dark">
                                            Call {CONTACT.phone}
                                        </PhoneButton>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody className="space-y-4">
                                <h3 className="text-2xl font-bold text-anchor-cream-text">Gig Guide</h3>
                                <ul className="space-y-3 text-anchor-cream-text/70">
                                    <li><strong>Start time:</strong> Bands usually kick off around 8:30 pm.</li>
                                    <li><strong>Cost:</strong> Always free entry. Support local music by buying a pint!</li>
                                    <li><strong>Food:</strong> Kitchen open until midnight for gig fuel.</li>
                                    <li><strong>Atmosphere:</strong> Up-close, personal and friendly. Standing room at the bar, tables available to book.</li>
                                </ul>
                                <p className="text-sm text-anchor-cream-text/55">
                                    Families welcome until 9pm. After that, it's an 18+ venue.
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </Section>

            <Section spacing="md" background="white" id="music-dates">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-anchor-cream-text text-center mb-6">Upcoming Gigs</h2>
                        <p className="text-anchor-cream-text/70 text-center mb-8">
                            Looking for live music tonight or this week? Here&apos;s who&apos;s playing next. For the most up-to-date info, check <Link href="/whats-on" className="text-anchor-gold hover:text-anchor-gold-light font-semibold">What&apos;s On this week</Link> or our <Link href="https://facebook.com/theanchorstanwellmoor" className="text-anchor-gold hover:text-anchor-gold-light font-semibold">Facebook page</Link>.
                        </p>
                        <MusicEventCards events={events} />
                    </div>
                </Container>
            </Section>

            <Section spacing="sm" background="white">
                <Container>
                    <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Pre-Gig Dinner</h3>
                                <p className="text-sm text-anchor-cream-text/70 mb-4">
                                    Kitchen open until midnight. Grab a burger or pizza before the music starts.
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
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Sunday Sessions</h3>
                                <p className="text-sm text-anchor-cream-text/70 mb-4">
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
                                    <Link href="/sunday-roast" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                                        Sunday Menu →
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Drinks & Cocktails</h3>
                                <p className="text-sm text-anchor-cream-text/70 mb-4">
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
                        <h2 className="text-3xl md:text-4xl font-bold text-anchor-cream-text mb-8 text-center">
                            Why catch a gig at The Anchor?
                        </h2>
                        <Grid cols={WHY_LOVE_IT.length > 3 ? 4 : 3} gap="md">
                            {WHY_LOVE_IT.map(feature => (
                                <GridItem key={feature.title}>
                                    <Card className="h-full card-dark rounded-none border border-anchor-gold/15">
                                        <CardBody className="space-y-3">
                                            <div className="text-4xl">{feature.icon}</div>
                                            <h3 className="text-xl font-semibold text-anchor-cream-text">{feature.title}</h3>
                                            <p className="text-anchor-cream-text/70 text-sm leading-relaxed">{feature.body}</p>
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            ))}
                        </Grid>
                    </div>
                </Container>
            </Section>

            <Section spacing="sm" background="white">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-anchor-cream-text mb-3">More Things to Do at The Anchor</h2>
                        <p className="text-anchor-cream-text/70">
                            Love a night out near Heathrow? Try our <Link href="/karaoke" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">Friday karaoke nights</Link> with 50,000+ songs, or test your knowledge at our monthly <Link href="/quiz-night" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">pub quiz night</Link> with cash prizes.
                        </p>
                    </div>
                </Container>
            </Section>

            <FAQAccordionWithSchema faqs={FAQS} />

            <Section spacing="md" background="gray">
                <Container>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-anchor-cream-text mb-3">Find us</h2>
                            <p className="text-anchor-cream-text/70 mb-4">
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
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-anchor-gold px-4 py-2 text-anchor-gold font-semibold hover:bg-anchor-gold hover:text-anchor-green transition"
                                >
                                    WhatsApp us
                                </Link>
                            </div>
                        </div>
                        <div className="h-full">
                            <GoogleMapEmbed
                                query="The Anchor, Stanwell Moor"
                                className="h-full min-h-[300px] border border-anchor-gold/15 rounded-xl overflow-hidden shadow-sm"
                            />
                        </div>
                    </div>
                </Container>
            </Section>

            {events.map(event => (
                <EventSchema key={`event-schema-${event.id}`} event={event} />
            ))}
        </>
    )
}
