import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { SixNationsFixtures } from '@/components/features/six-nations/SixNationsFixtures'

const SixNationsLightbox = dynamic(
    () => import('@/components/features/six-nations/SixNationsLightbox').then(mod => mod.SixNationsLightbox),
    { ssr: false }
)

export const metadata: Metadata = {
    title: 'Watch Six Nations 2026 Near Heathrow | The Anchor Stanwell Moor',
    description: `Watch every Six Nations 2026 match live with sound at The Anchor, Stanwell Moor near Heathrow. 4 screens, kitchen open for every game. Book now.`,
    keywords: 'six nations 2026, watch rugby heathrow, six nations pub staines, rugby near terminal 5, six nations fixtures',
    openGraph: {
        title: 'Watch Six Nations 2026 at The Anchor',
        description: 'Every match live on big screens with sound. 7 mins from Heathrow.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch Six Nations 2026 at The Anchor',
        description: 'Every match live on big screens with sound.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    })
}

export default function SixNationsPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport-pub' },
        { name: 'Six Nations 2026', url: '/live-sport/six-nations' }
    ])

    const eventSchema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "Six Nations 2026 Live Screenings",
        "startDate": "2026-02-05",
        "endDate": "2026-03-14",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
            "@type": "Place",
            "name": BRAND.name,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": CONTACT.address.street,
                "addressLocality": CONTACT.address.town,
                "postalCode": CONTACT.address.postcode,
                "addressCountry": "UK"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": CONTACT.coordinates.lat,
                "longitude": CONTACT.coordinates.lng
            },
            "telephone": CONTACT.phone,
            "url": "https://www.the-anchor.pub"
        },
        "description": "Watch every Six Nations 2026 match live on big screens with sound at The Anchor. Just 7 minutes from Heathrow Terminal 5.",
        "image": DEFAULT_PAGE_HEADER_IMAGE,
        "organizer": {
            "@type": "Organization",
            "name": BRAND.name,
            "url": "https://www.the-anchor.pub"
        },
        "performer": {
            "@type": "Organization",
            "name": "Six Nations Rugby"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "url": "https://www.the-anchor.pub/book-table",
            "validFrom": "2025-01-01",
            "description": "Free entry, table booking recommended"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([eventSchema, breadcrumbSchema]) }}
            />

            <SixNationsLightbox />

            <HeroWrapper
                route="/live-sport/six-nations"
                title="Watch Six Nations 2026 Live"
                description="Every match live on BBC & ITV • Sound on • 4 Screens • Kitchen open for every game."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="six_nations_hero"
                        context="sport"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🏉 Book Best Seat
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🍔 View Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-12 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <PageTitle className="text-anchor-green mb-4">
                            The Home of Rugby in Stanwell Moor
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            We're just 7 minutes from Heathrow Terminal 5 and miles away from the generic sports bar vibe.
                            Settle in for a proper pub atmosphere with fresh Guinness, hearty food, and every tackle on our 4 HD screens.
                        </p>
                    </div>

                    <div className="relative h-[300px] mb-12 rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="/images/six-nations/hero-pub.png"
                            alt="Atmosphere at The Anchor during Six Nations"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                            <h3 className="text-white text-2xl font-bold font-serif">Live Every Match. Loud & Proud.</h3>
                        </div>
                    </div>

                    <FeatureGrid
                        columns={4}
                        features={[
                            {
                                icon: "🔊",
                                title: "Sound On",
                                description: "Commentary on for every match.",
                                variant: "default",
                                className: "text-center border border-gray-200"
                            },
                            {
                                icon: "📺",
                                title: "4 Screens",
                                description: "Visible from the bar and dining areas.",
                                variant: "default",
                                className: "text-center border border-gray-200"
                            },
                            {
                                icon: "🍔",
                                title: "Kitchen Open",
                                description: "Food served during all games.",
                                variant: "default",
                                className: "text-center border border-gray-200"
                            },
                            {
                                icon: "🅿️",
                                title: "Free Parking",
                                description: "20 spaces + easy M25 access.",
                                variant: "default",
                                className: "text-center border border-gray-200"
                            }
                        ]}
                        className="mb-8"
                    />
                </Container>
            </section>

            <section className="section-spacing bg-gray-50" id="fixtures">
                <Container>
                    <SectionHeader
                        title="Six Nations 2026 Fixtures"
                        subtitle="All times GMT. Matches shown live on BBC or ITV."
                    />

                    <div className="max-w-5xl mx-auto">
                        <SixNationsFixtures />
                    </div>

                    <div className="mt-12 text-center">
                        <AlertBox
                            variant="warning"
                            title="Book Early for Big Games"
                            className="max-w-2xl mx-auto"
                            content={
                                <p>England matches and 'Super Saturday' (14th March) fill up fast. We strongly recommend booking your table at least a week in advance to guarantee a spot.</p>
                            }
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-white">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <SectionHeader
                                title="Food & Drink"
                                subtitle="Fuel for the match"
                                className="text-left mb-6"
                            />
                            <div className="prose text-gray-600 mb-6">
                                <p>
                                    Whether you're after a half-time burger or a celebratory post-match meal, our kitchen is open throughout every Six Nations game.
                                </p>
                                <p>
                                    <strong>Normal Hours:</strong> Tue–Fri 6–9pm, Sat 1–7pm, Sun 12–5pm<br />
                                    <strong>Match Day Promise:</strong> Kitchen remains open for all live Six Nations fixtures, even outside standout hours.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Link href="/food-menu"><Button variant="primary">View Food Menu</Button></Link>
                                <Link href="/drinks"><Button variant="outline">Drinks List</Button></Link>
                            </div>
                        </div>
                        <div className="bg-anchor-cream rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-anchor-green mb-4">Find Us Near Heathrow</h3>
                            <ul className="space-y-3 text-sm text-gray-700 mb-6">
                                <li className="flex gap-2"><span>📍</span> <span>{CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}</span></li>
                                <li className="flex gap-2"><span>🚗</span> <span>7 mins from Terminal 5</span></li>
                                <li className="flex gap-2"><span>🅿️</span> <span>Free parking ({PARKING.capacity} spaces)</span></li>
                                <li className="flex gap-2"><span>🚌</span> <span>Bus routes from Staines & Heathrow</span></li>
                            </ul>
                            <Link href="/find-us" className="text-anchor-green font-bold hover:underline">
                                Get Directions →
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <SectionHeader title="Frequently Asked Questions" />
                    <FAQAccordionWithSchema
                        faqs={[
                            {
                                question: "Do you show every Six Nations match?",
                                answer: "Yes, we show every match that is broadcast on BBC or ITV (which is all of them in the UK). We won't miss a scrum."
                            },
                            {
                                question: "Is the sound on?",
                                answer: "Yes! For the Six Nations, we turn the commentary on so you can soak up the full atmosphere."
                            },
                            {
                                question: "Do I need to book?",
                                answer: "Walk-ins are welcome, but we highly recommend booking for England games and Super Saturday as we get very busy."
                            },
                            {
                                question: "Is the kitchen open during the games?",
                                answer: "Yes, the kitchen will be open throughout all Six Nations matches, so you can order food while you watch."
                            },
                            {
                                question: "Is there parking?",
                                answer: "Yes, we have a free car park with around 20 spaces for our guests."
                            },
                            {
                                question: "Are children and dogs welcome?",
                                answer: "Yes, we are a family-friendly and dog-friendly pub. Everyone is welcome to enjoy the rugby."
                            },
                            {
                                question: "How far are you from Heathrow?",
                                answer: "We are located in Stanwell Moor, just a 7-minute drive from Terminal 5, making us the perfect stopover for rugby fans travelling through the airport."
                            }
                        ]}
                        className="bg-white max-w-3xl mx-auto"
                    />
                </Container>
            </section>

            <CTASection
                title="Secure Your Spot for the Rugby"
                description="Tables fill up fast for the big games. Don't leave it to chance."
                buttons={[
                    {
                        text: "🏉 Book a Table",
                        href: "/book-table",
                        variant: "primary"
                    },
                    {
                        text: "📍 Get Directions",
                        href: "/find-us",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
