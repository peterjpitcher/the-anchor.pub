import { TournamentLink } from '@/components/features/nations-championship/TournamentLink'
import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Alert, Container, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { HeroBadge } from '@/components/HeroBadge'

export const metadata: Metadata = {
    title: 'Live Sport Pub Near Heathrow | Big Screens',
    description: `Watch free-to-air sport, Six Nations, F1 and major tournaments on pub screens at The Anchor, Stanwell Moor. Food, drinks and free parking.`,
    openGraph: {
        title: 'Watch Live Sport Near Heathrow, Major Tournaments on Big Screens',
        description: 'Six Nations, World Cup, Euros and F1 on big screens with a cold pint and free parking. 7 mins from Heathrow T5.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch Live Sport Near Heathrow, Major Tournaments on Big Screens',
        description: 'Six Nations, World Cup, Euros and F1 on big screens with free parking and great food. 7 mins from Heathrow T5.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport'
    }
}

export default async function LiveSportPage() {
    // Using SportsActivityLocation schema if possible, or generic LocalBusiness with specific description
    const sportsSchema = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": `${BRAND.name} - Live Sport`,
        "description": "Watch major sporting events on big screens, Six Nations, World Cup, Euros, F1 and more. Free parking and great food near Heathrow.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "postalCode": CONTACT.address.postcode,
            "addressCountry": CONTACT.address.country
        },
        "telephone": CONTACT.phoneIntl,
        "image": DEFAULT_PAGE_HEADER_IMAGE
    }

    const screeningEventSchema = {
        "@context": "https://schema.org",
        "@type": "ScreeningEvent",
        "name": "Live Sport Screenings at The Anchor",
        "description": "Watch Six Nations, World Cup 2026, Euros and F1 on big screens at The Anchor. Terrestrial channels only (BBC, ITV, Channel 4).",
        "location": {
            "@type": "Place",
            "name": "The Anchor",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": CONTACT.address.street,
                "addressLocality": CONTACT.address.town,
                "addressRegion": "Surrey",
                "postalCode": CONTACT.address.postcode,
                "addressCountry": "GB"
            }
        },
        "organizer": {
            "@id": "https://www.the-anchor.pub/#organization"
        },
        "isAccessibleForFree": true,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "description": "Free entry, just turn up and enjoy"
        }
    }

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Live Sport', url: '/live-sport' }
                ]}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([sportsSchema, screeningEventSchema]) }}
            />

                        <InteriorHero
              image="/images/page-headers/home/page-headers-homepage.jpg"
              crumb="Live Sport"
              title="Live Sport at The Anchor"
              lead="Terrestrial Channels Only (BBC/ITV/Channel 4). Multiple Screens. Great Food. The best atmosphere outside the stadium."
            />
      <TournamentLink />

            <Container className="py-8">
                <PageTitle as="h2" className="text-center mb-6" seo={{ structured: true }}>
                    Live Sport Pub Near Heathrow, Big Screens And Sound Up
                </PageTitle>
            </Container>

            <section className="bg-surface-sunk py-section-y">
                <Container>
                    <HeroBadge className="text-sm" />
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-accent-text mb-4">
                            Never Miss a Moment
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Whether it's the Six Nations crunch match, the F1 season finale, or major tournaments, we show it all. With multiple HD screens positioned throughout the pub, you won't have to crane your neck to see the action.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="The Viewing Experience"
                            subtitle="We take sport seriously."
                        />

                        <Grid cols={3} gap="md" className="mb-8">
                            {[
                                {
                                    title: "Terrestrial Sport Only",
                                    description: "We show major events on free-to-air channels (BBC, ITV, Channel 4). Please note we do NOT have Sky Sports or TNT Sports."
                                },
                                {
                                    title: "Full Match Audio",
                                    description: "For big games, we turn the commentary up so you get the full stadium atmosphere."
                                },
                                {
                                    title: "A Room That Reacts",
                                    description: "Enjoy a cold pint and great food in a proper pub atmosphere. No booking required, just turn up and enjoy."
                                }
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
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk" id="schedule">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading title="What We Show" />
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card accent className="h-full">
                                <CardBody>
                                    <h3 className="text-xl text-accent-text mb-4 border-b border-line pb-2">Football</h3>
                                    <ul className="space-y-2 text-ink-muted">
                                        <li>• International Tournaments (Euros / World Cup)</li>
                                        <li>• FA Cup (Select Games)</li>
                                        <li>• Women's Super League (BBC games)</li>
                                    </ul>
                                </CardBody>
                            </Card>
                            <Card accent className="h-full">
                                <CardBody>
                                    <h3 className="text-xl text-accent-text mb-4 border-b border-line pb-2">Rugby</h3>
                                    <ul className="space-y-2 text-ink-muted">
                                        <li>• Six Nations</li>
                                        <li>• Autumn Internationals</li>
                                        <li>• Premiership Rugby</li>
                                        <li>• World Cups</li>
                                    </ul>
                                </CardBody>
                            </Card>
                            <Card accent className="h-full">
                                <CardBody>
                                    <h3 className="text-xl text-accent-text mb-4 border-b border-line pb-2">Formula 1</h3>
                                    <ul className="space-y-2 text-ink-muted">
                                        <li>• Live Race Weekends</li>
                                        <li>• Qualifying Sessions</li>
                                    </ul>
                                </CardBody>
                            </Card>
                            <Card accent className="h-full">
                                <CardBody>
                                    <h3 className="text-xl text-accent-text mb-4 border-b border-line pb-2">Other Sport</h3>
                                    <ul className="space-y-2 text-ink-muted">
                                        <li>• Cricket (Terrestrial Only)</li>
                                        <li>• Golf Majors (Highlights/BBC)</li>
                                        <li>• Horse Racing (ITV Racing)</li>
                                        <li>• Athletics & Olympics</li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </div>

                        <Alert variant="info" title="Specific Requests?" className="mx-auto mt-8">
                            <p>Want to watch a specific game shown on BBC, ITV, or Channel 4? Just ask the bar staff! If we have a screen free, we'll happily put it on for you. Please remember we cannot show games exclusive to Sky or TNT.</p>
                        </Alert>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <Card accent className="mx-auto">
                        <CardBody className="p-8 text-center">
                            <h2 className="text-xl text-accent-text">World Cup 2026</h2>
                            <p className="mt-3 text-sm text-ink-muted">
                                Full fixtures with UK kick-off times, showing status, table bookings, and all pub sweep winners.
                            </p>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button asChild variant="primary">
                                    <Link href="/live-sport/world-cup">World Cup 2026 Fixtures &amp; Bookings →</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/live-sport/world-cup/sweepstake">Sweep Winners</Link>
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <Card accent className="mx-auto">
                        <CardBody className="p-8 text-center">
                            <h2 className="text-xl text-accent-text">Boxing</h2>
                            <p className="mt-3 text-sm text-ink-muted">
                                When a fight lands on BBC, ITV or Channel 4, it goes on the big screens with the sound up. Find out what we can show and what we cannot.
                            </p>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button asChild variant="primary">
                                    <Link href="/live-sport/boxing">Boxing At The Anchor &rarr;</Link>
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do I need to book a table for football matches?",
                        answer: "For big games (like England matches or Cup Finals), booking is essential as we get very full. For standard league games, walk-ins are usually fine, but booking guarantees a good view."
                    },
                    {
                        question: "Do you show Premier League games?",
                        answer: "We only show Premier League games that are broadcast on terrestrial television (e.g. Amazon Prime fixtures shown on BBC/ITV, or highlights). We do not have Sky Sports or TNT Sports packages."
                    },
                    {
                        question: "Are children allowed during matches?",
                        answer: "Yes, until 8pm. However, please be aware that the pub can get loud and busy during major sporting events."
                    },
                    {
                        question: "Do you show Six Nations rugby?",
                        answer: "Yes, every Six Nations match is shown live on our big screens with full audio. Book early for England and Wales matches as we fill up quickly."
                    },
                    {
                        question: "Can I watch Formula 1 at The Anchor?",
                        answer: "Yes, we show all F1 qualifying sessions and races live on our big screens."
                    },
                    {
                        question: "Do you have Sky Sports or TNT?",
                        answer: "No, we show terrestrial channels only (BBC, ITV, Channel 4). This covers Six Nations, F1, international football, cricket, golf, and horse racing."
                    },
                    {
                        question: "Can I request a specific match or event?",
                        answer: "If it is on a terrestrial channel, yes. Let us know in advance and we will make sure it is on with full audio."
                    },
                    {
                        question: "Is there food available during live sport?",
                        answer: "Yes, our full kitchen menu is available including stone-baked pizza, burgers, fish and chips, and pub classics. Book a table to guarantee your spot for big matches."
                    }
                ]}
            />

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading title="What We're Showing" subtitle="Terrestrial sport on our big screens" />
                    <div className="prose mx-auto max-w-none">
                        <p>We show every major sporting event available on BBC, ITV, and Channel 4. Current highlights include Six Nations rugby, Formula 1, international football qualifiers, and cricket. All matches are shown with full audio on multiple HD screens.</p>
                        <p>Want to watch something specific? Let us know and we will make sure it is on. We can also reserve seating for big matches, just call ahead or book online.</p>
                    </div>
                </Container>
            </section>

            <OrganicSearchClusterLinks
                cluster="events"
                currentPath="/live-sport"
                title="More events and sport at The Anchor"
                intro="Check the full events calendar, quiz night and Music Bingo pages before you book."
            />

            <CtaBand
                title="Secure Your Spot for the Big Game"
                copy="Don't leave it to chance. Book a table with a view of the screen."
            >
                <BookTableButton source="sport_cta" variant="primary" size="lg" className="w-full sm:w-auto">
                    Book a Table
                </BookTableButton>
                <PhoneButton phone={CONTACT.phone} source="sport_cta" variant="outline" size="lg" className="w-full sm:w-auto">
                    Call: 01753 682707
                </PhoneButton>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ">Get Directions</Link>
                </Button>
            </CtaBand>
        </>
    )
}
