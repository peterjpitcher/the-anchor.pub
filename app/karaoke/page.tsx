
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
} from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { HeroBadge } from '@/components/HeroBadge'
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
import { RegretReduction } from '@/components/psychology'
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

const KARAOKE_CATEGORIES = [
    {
        name: 'Karaoke',
        slug: 'karaoke-night'
    },
    {
        // Legacy category matcher only. Nikki Manfadge does NOT host karaoke
        // (owner-confirmed 11 August 2026), she hosts Music Bingo. This entry is
        // kept so any older event still filed under this category in the
        // management app is still found and listed, rather than silently
        // disappearing from the page. Do not use this name in new copy, and
        // retire the category in the management app when convenient.
        name: "Nikki's Karaoke Night",
        slug: 'nikkis-karaoke-night'
    }
]

const normalizeCategoryValue = (value?: string | null) =>
    value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdsByLabels(categories: EventCategory[], labels: typeof KARAOKE_CATEGORIES) {
    return labels
        .map(label => {
            const targetName = normalizeCategoryValue(label.name)
            const targetSlug = normalizeCategoryValue(label.slug)

            return categories.find(category => {
                const categoryName = normalizeCategoryValue(category.name)
                const categorySlug = normalizeCategoryValue(category.slug)
                return categoryName === targetName || categorySlug === targetSlug
            })?.id
        })
        .filter((id): id is string => Boolean(id))
}

async function getKaraokeEvents() {
    const categories = await getEventCategories()
    const categoryIds = getCategoryIdsByLabels(categories, KARAOKE_CATEGORIES)
    if (!categoryIds.length) return []

    const eventSets = await Promise.all(
        categoryIds.map(categoryId => getUpcomingEventsByCategory(categoryId, 60, 365))
    )
    const events = eventSets.flat()
    const uniqueEvents = Array.from(new Map(events.map(event => [event.id, event])).values())

    return uniqueEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

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
    if (!events.length) {
        return (
            <Card accent><CardBody className="text-center">
                <p className="text-lg font-semibold text-accent-text mb-2">Next karaoke dates coming soon</p>
                <p className="text-ink-muted">
                    We're tuning the mics and scheduling the next night. Call 01753 682707 or check back shortly.
                </p>
            </CardBody></Card>
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
                    <Card key={event.id} hover accent className="overflow-hidden">
                        <div className="border-b border-line bg-surface-sunk px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs uppercase tracking-wide text-ink-muted">Karaoke Night</p>
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
                                <p className="text-xs text-ink-muted">Free Entry</p>
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
                                    <p className="text-ink-muted leading-relaxed">{event.description}</p>
                                )}
                                <p className="text-sm text-ink-muted">
                                    Grab the mic and show us what you've got. Check the event listing for host, timings and song details.
                                </p>
                            </div>

                            <div className="w-full lg:w-64 space-y-3">
                                <EventBookingButton event={event} className="w-full" source="karaoke_event_card" />
                            </div>
                        </CardBody>
                    </Card>
                )
            })}
        </div>
    )
}

export default async function KaraokePage() {
    const events = await getKaraokeEvents()
    const nextEvent = events[0]
    const nextEventDate = nextEvent ? formatEventDate(nextEvent.startDate) : 'Next date to be confirmed'
    const nextEventTime = nextEvent ? formatEventTime(nextEvent.startDate) : '8:00pm approx'

    const heroDescription = nextEvent
        ? `Next karaoke night: ${nextEvent.name} on ${nextEventDate} at ${nextEventTime}. Free entry, endless tunes!`
        : 'Sing your heart out at The Anchor. Thousands of songs, cold drinks, and a great atmosphere. Free entry!'

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
            <InteriorHero
                image="/images/page-headers/home/page-headers-homepage.jpg"
                crumb="Karaoke"
                title="Karaoke Nights at The Anchor"
                lead="The stage is yours. Join us near Heathrow for karaoke nights when they are listed or confirmed. Free entry."
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
                    <p className="text-lg text-ink-muted text-center max-w-3xl mx-auto">
                        Ready to unleash your inner rock star? Whether you&rsquo;re belting out ballads or rapping 90s classics, we provide the stage, the mic, and the enthusiastic crowd. Karaoke runs occasionally rather than every week, so check the dates below before you set off. {heroDescription}
                    </p>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
        <Container>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-stretch">
                        <Card accent>
                            <CardBody className="space-y-4">
                                <p className="text-sm uppercase tracking-wide text-accent-text font-semibold">Next karaoke night</p>
                                <h2 className="text-h3 text-ink-strong">{nextEvent ? nextEvent.name : 'Next date to be confirmed'}</h2>
                                <p className="text-accent-text font-semibold">{nextEvent ? `${nextEventDate} · ${nextEventTime}` : 'Check back for the next date'}</p>
                                <p className="text-ink-muted whitespace-pre-line">
                                    Join us for free-entry karaoke. Thousands of songs, no cover charge, and a crowd that cheers for everyone.
                                </p>
                                <div className="space-y-3">
                                    {nextEvent && (
                                        <RegretReduction variant="booking" className="mb-4" />
                                    )}
                                    {nextEvent ? (
                                        <EventBookingButton event={nextEvent} className="w-full" source="karaoke_next_event" />
                                    ) : (
                                        <PhoneButton phone={CONTACT.phone} source="karaoke_fallback" size="lg" className="w-full bg-anchor-green text-white hover:bg-anchor-green-dark">
                                            Call {CONTACT.phone}
                                        </PhoneButton>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
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
                    </div>
                </Container>
            </section>

            <section id="karaoke-dates" className="py-section-y bg-surface">
        <Container>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-h3 text-ink-strong text-center mb-6">Upcoming Karaoke Nights</h2>
                        <p className="text-ink-muted text-center mb-8">
                            Mic check, one two! Here's when you can next take the stage. For updates, check <Link href="/whats-on" className="text-accent-text hover:text-accent-text font-semibold">What&apos;s On this week</Link> or our <Link href="https://facebook.com/theanchorstanwellmoor" className="text-accent-text hover:text-accent-text font-semibold">Facebook page</Link>.
                        </p>
                        <KaraokeEventCards events={events} />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
        <Container>
                    <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
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
                    <div className="max-w-6xl mx-auto">
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
                    <div className="max-w-3xl mx-auto text-center">
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
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
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
                copy="Reserve your spot or call the bar team, we'll make sure your table is ready."
                primary={
                    <BookTableButton source="karaoke_cta_bottom" variant="primary" size="lg" className="w-full sm:w-auto">
                        Book Your Table
                    </BookTableButton>
                }
                secondary={
                    <PhoneButton phone="01753 682707" source="karaoke_cta_bottom" variant="outline" size="lg" className="w-full sm:w-auto">
                        Call: 01753 682707
                    </PhoneButton>
                }
            />

            {events.map(event => (
                <EventSchema key={`event-schema-${event.id}`} event={event} />
            ))}
        </>
    )
}
