
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
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Karaoke Fridays Near Heathrow | Free Entry',
    description:
        'Karaoke every Friday 8–11pm at The Anchor, Stanwell Moor. 50,000+ songs, hosted nights, free entry & free parking. 7 mins from Heathrow T5. Grab the mic tonight.',
    openGraph: {
        title: 'Karaoke Pub Near Heathrow | The Anchor',
        description: '50,000+ songs, hosted by Nikki Manfadge, Fridays 8-11pm. Free entry. Sing your heart out in Stanwell Moor.',
        images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
    },
    twitter: getTwitterMetadata({
        title: 'Karaoke Pub Near Heathrow | The Anchor',
        description: '50,000+ songs, hosted by Nikki Manfadge, Fridays 8-11pm. Free entry. Sing your heart out in Stanwell Moor.',
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
        title: 'Hosted by Nikki Manfadge',
        body: 'Nikki keeps the energy high, the queue moving, and the crowd singing along. Duets with Nikki, lip sync battles, props and costumes provided.'
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
            'Karaoke is on Fridays from 8pm to 11pm, hosted by Nikki Manfadge. Check the upcoming dates below or our What\'s On page to confirm the next session.'
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
            <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-xl p-6 text-center">
                <p className="text-lg font-semibold text-anchor-gold-vivid mb-2">Next karaoke dates coming soon</p>
                <p className="text-anchor-cream-text/70">
                    We're tuning the mics and scheduling the next night. Call 01753 682707 or check back shortly.
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
                                    <p className="text-xs uppercase tracking-wide text-white/70">Karaoke Night</p>
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
                                    Grab the mic and show us what you've got! 50,000+ songs, hosted by Nikki Manfadge, and free entry all night.
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify({
                    "@context": "https://schema.org",
                    "@type": "EventSeries",
                    "@id": "https://www.the-anchor.pub/#karaoke-series",
                    "name": "Karaoke Nights with Nikki Manfadge at The Anchor",
                    "description": "Friday karaoke nights hosted by Nikki Manfadge with 50,000+ songs. Free entry, free parking, 7 mins from Heathrow T5.",
                    "startDate": "2024-01-01",
                    "endDate": "2026-12-31",
                    "eventSchedule": {
                        "@type": "Schedule",
                        "repeatFrequency": "P1W",
                        "byDay": "https://schema.org/Friday",
                        "startTime": "20:00:00",
                        "endTime": "23:00:00",
                        "scheduleTimezone": "Europe/London"
                    },
                    "location": {
                        "@type": "Place",
                        "name": "The Anchor",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Horton Road",
                            "addressLocality": "Stanwell Moor",
                            "addressRegion": "Surrey",
                            "postalCode": "TW19 6AQ",
                            "addressCountry": "GB"
                        }
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "GBP",
                        "availability": "https://schema.org/InStock",
                        "description": "Free entry"
                    },
                    "performer": {
                        "@type": "Person",
                        "name": "Nikki Manfadge",
                        "jobTitle": "Entertainment Host",
                        "worksFor": { "@id": "https://www.the-anchor.pub/#organization" }
                    },
                    "organizer": {
                        "@id": "https://www.the-anchor.pub/#organization"
                    }
                }) }}
            />
            <HeroWrapper
                route="/karaoke"
                title="Karaoke Nights at The Anchor"
                description="The stage is yours! Join us near Heathrow for the ultimate karaoke night. 50,000+ songs, hosted by Nikki Manfadge, Fridays 8-11pm. Free entry."
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="bg-anchor-bg section-spacing-tight">
                <Container>
                    <HeroBadge className="text-sm" />
                </Container>
            </section>

            <Section spacing="sm" background="white">
                <Container>
                    <PageTitle className="text-center text-anchor-gold-vivid" seo={{ structured: true, speakable: true }}>
                        Karaoke Pub Near Heathrow, Sing Your Way to Stardom
                    </PageTitle>
                    <p className="text-lg text-anchor-cream-text/70 text-center max-w-3xl mx-auto">
                        Ready to unleash your inner rock star? The Anchor&rsquo;s karaoke nights are legendary in Stanwell Moor. Whether you&rsquo;re belting out ballads or rapping 90s classics, we provide the stage, the mic, and the enthusiastic crowd. One of the best things to do near Heathrow on a Friday night, it&rsquo;s the perfect place to let loose. {heroDescription}
                    </p>
                </Container>
            </Section>

            <Section spacing="md" background="gray">
                <Container>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-stretch">
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody className="space-y-4">
                                <p className="text-sm uppercase tracking-wide text-anchor-gold font-semibold">Next karaoke night</p>
                                <h2 className="text-3xl font-bold text-anchor-cream-text">{nextEvent ? nextEvent.name : 'Next date to be confirmed'}</h2>
                                <p className="text-anchor-gold-vivid font-semibold">{nextEvent ? `${nextEventDate} · ${nextEventTime}` : 'Check back for the next date'}</p>
                                <p className="text-anchor-cream-text/70 whitespace-pre-line">
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
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody className="space-y-4">
                                <h3 className="text-2xl font-bold text-anchor-cream-text">How it works</h3>
                                <ul className="space-y-3 text-anchor-cream-text/70">
                                    <li><strong>Every Friday, 8-11pm:</strong> Hosted by Nikki Manfadge with 50,000+ songs to choose from.</li>
                                    <li><strong>Choose your track:</strong> Browse the digital library or ask Nikki. Everything from Abba to ZZ Top.</li>
                                    <li><strong>Eat & Drink:</strong> Kitchen open until 9 pm for pre-show burgers. Bar open late.</li>
                                    <li><strong>Free Entry:</strong> Always free entry, always good vibes.</li>
                                </ul>
                                <p className="text-sm text-anchor-cream-text/55">
                                    Solo singers, duets and group ensembles all welcome. We'll even provide backing vocals if you need a hand!
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </Section>

            <Section spacing="md" background="white" id="karaoke-dates">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-anchor-cream-text text-center mb-6">Upcoming Karaoke Nights</h2>
                        <p className="text-anchor-cream-text/70 text-center mb-8">
                            Mic check, one two! Here's when you can next take the stage. For updates, check <Link href="/whats-on" className="text-anchor-gold hover:text-anchor-gold-light font-semibold">What&apos;s On this week</Link> or our <Link href="https://facebook.com/theanchorstanwellmoor" className="text-anchor-gold hover:text-anchor-gold-light font-semibold">Facebook page</Link>.
                        </p>
                        <KaraokeEventCards events={events} />
                    </div>
                </Container>
            </Section>

            <Section spacing="sm" background="white">
                <Container>
                    <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Pre-Show Fuel</h3>
                                <p className="text-sm text-anchor-cream-text/70 mb-4">
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
                                    <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                                        View Food Menu →
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Group Bookings</h3>
                                <p className="text-sm text-anchor-cream-text/70 mb-4">
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
                                    <Link href="/contact" className="text-sm text-anchor-gold font-semibold hover:text-anchor-green transition">
                                        Contact Us →
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="card-dark rounded-none border border-anchor-gold/15">
                            <CardBody>
                                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Cocktails & Shots</h3>
                                <p className="text-sm text-anchor-cream-text/70 mb-4">
                                    From courage-boosting shots to celebratory cocktails, the bar is stocked for the occasion.
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
                            Why our karaoke nights hit the high notes
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
                            Looking for more entertainment near Heathrow? Catch a gig at our <Link href="/live-music" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">live music nights</Link> featuring local bands and acoustic sessions, or rally your team for our monthly <Link href="/quiz-night" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">pub quiz night</Link> with a £25 bar tab up for grabs.
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

            <Section spacing="md" background="white">
                <Container>
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-anchor-green to-anchor-green/80 rounded-2xl p-8 text-white text-center shadow-lg">
                        <h2 className="text-3xl font-bold mb-4 text-white">Ready to take the stage?</h2>
                        <p className="text-lg mb-6">
                            Reserve your spot or call the bar team, we'll make sure your table is ready.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <BookTableButton
                                source="karaoke_cta_bottom"
                                variant="secondary"
                                size="lg"
                                className="w-full sm:w-auto bg-anchor-gold text-anchor-green hover:bg-anchor-gold-light"
                            >
                                Book Your Table
                            </BookTableButton>
                            <PhoneButton
                                phone="01753 682707"
                                source="karaoke_cta_bottom"
                                variant="secondary"
                                size="lg"
                                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20"
                            >
                                Call: 01753 682707
                            </PhoneButton>
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
