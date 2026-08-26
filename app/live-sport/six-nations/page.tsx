import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button, SectionHeading, Card, CardBody, Alert, Container, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { SixNationsFixtures } from '@/components/features/six-nations/SixNationsFixtures'
import { jsonLdSafeStringify } from '@/lib/jsonld'

const SixNationsLightbox = dynamic(
    () => import('@/components/features/six-nations/SixNationsLightbox').then(mod => mod.SixNationsLightbox),
    { ssr: false }
)

export const metadata: Metadata = {
    title: 'Six Nations Pub Near Me | Watch 2026 Live',
    description: `Watch every Six Nations 2026 match live with sound near Heathrow. Four screens, and food through the match when the kitchen is open.`,
    openGraph: {
        title: 'Watch Six Nations 2026 at The Anchor',
        description: 'Every match live on big screens with sound. 7 mins from Heathrow.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch Six Nations 2026 at The Anchor',
        description: 'Every match live on big screens with sound.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport/six-nations'
    }
}

export default function SixNationsPage() {
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
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([eventSchema]) }}
            />

            <SixNationsLightbox/>

                        <InteriorHero
              image="/images/page-headers/home/page-headers-homepage.jpg"
              crumb="Six Nations"
              title="Watch Six Nations 2026 Live"
              lead="Every match live on BBC & ITV • Sound on • 4 Screens • Food through the match"
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center mb-12">
                        <PageTitle className="text-accent-text mb-4">
                            Six Nations Pub Near Me, Live Rugby in Stanwell Moor
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            We're just 7 minutes from Heathrow Terminal 5 and miles away from the generic sports bar vibe.
                            Settle in for a proper pub atmosphere with fresh Guinness, hearty food, and every tackle on our 4 HD screens.
                        </p>
                    </div>

                    <div className="relative h-[300px] mb-12 rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="/images/six-nations/hero-pub.jpg"
                            alt="Atmosphere at The Anchor during Six Nations"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                            <h3 className="text-white text-2xl font-display">Live Every Match. Loud & Proud.</h3>
                        </div>
                    </div>

                    <Grid cols={4} gap="md" className="mb-8">
                        {[
                            { title: "Sound On", description: "Commentary on for every match." },
                            { title: "4 Screens", description: "Visible from the bar and dining areas." },
                            { title: "Food On", description: "Kitchen serving through the match, check hours for your fixture." },
                            { title: "Free Parking", description: "20 spaces + easy M25 access." }
                        ].map((feature) => (
                            <GridItem key={feature.title}>
                                <Card accent className="h-full">
                                    <CardBody className="text-center space-y-2">
                                        <h3 className="text-lg font-semibold text-ink-strong">{feature.title}</h3>
                                        <p className="text-sm text-ink-muted leading-relaxed">{feature.description}</p>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        ))}
                    </Grid>
                </Container>
            </section>

            <section className="py-section-y bg-surface" id="fixtures">
                <Container>
                    <SectionHeading
                        title="Six Nations 2026 Fixtures"
                        subtitle="All times GMT. Matches shown live on BBC or ITV."
                    />

                    <div className="mx-auto">
                        <SixNationsFixtures/>
                    </div>

                    <div className="mt-12">
                        <Alert variant="warning" title="Book Early for Big Games" className="mx-auto">
                            <p>England matches and 'Super Saturday' (14th March) fill up fast. We strongly recommend booking your table at least a week in advance to guarantee a spot.</p>
                        </Alert>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <SectionHeading
                                title="Food & Drink"
                                subtitle="Fuel for the match"
                                className="text-left mb-6"
                            />
                            <div className="prose text-ink-muted mb-6 max-w-none">
                                <p>
                                    Whether you're after a half-time burger or a celebratory post-match meal, the kitchen is serving through the match. Kitchen hours vary by fixture, so check before you travel.
                                </p>
                                <p>
                                    <strong>Match Day Food:</strong> We aim to have the kitchen serving for live Six Nations fixtures. Give us a ring to confirm food times for your match.
                                </p>
                                <div className="mt-4">
                                    <strong className="text-ink-strong">Current Opening Hours:</strong>
                                    <BusinessHours/>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Link href="/food-menu"><Button variant="primary">View Food Menu</Button></Link>
                                <Link href="/drinks"><Button variant="outline">Drinks List</Button></Link>
                            </div>
                        </div>
                        <Card accent>
                          <CardBody className="p-8">
                            <h3 className="text-xl text-accent-text mb-4">Find Us Near Heathrow</h3>
                            <ul className="space-y-3 text-sm text-ink-muted mb-6">
                                <li className="flex gap-2"><span>{CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}</span></li>
                                <li className="flex gap-2"><span>7 mins from Terminal 5</span></li>
                                <li className="flex gap-2"><span>Free parking ({PARKING.capacity} spaces)</span></li>
                                <li className="flex gap-2"><span>Bus routes from Staines & Heathrow</span></li>
                            </ul>
                            <Link href="/find-us" className="text-accent-text font-semibold hover:underline">
                                Get Directions →
                            </Link>
                          </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading title="Frequently Asked Questions" />
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
                                answer: "We aim to be serving food through the Six Nations matches, but kitchen hours vary by fixture and by day. Ring us on 01753 682707 before you set off and we will confirm food times for your match."
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
                        className="mx-auto"
                    />
                </Container>
            </section>

            <CtaBand
                title="Secure Your Spot for the Rugby"
                copy="Tables fill up fast for the big games. Don't leave it to chance."
            >
                <BookTableButton source="six_nations_cta" variant="primary" size="lg" className="w-full sm:w-auto">
                    Book a Table
                </BookTableButton>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/find-us">Get Directions</Link>
                </Button>
            </CtaBand>
        </>
    )
}
