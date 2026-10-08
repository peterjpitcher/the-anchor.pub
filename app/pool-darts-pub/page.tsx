import Link from 'next/link'
import { SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { Button } from '@/components/ui/primitives/Button'
import { CtaBand } from '@/components/CtaBand'
import { DirectionsButton } from '@/components/DirectionsButton'
import { PhoneButton } from '@/components/PhoneButton'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BusinessHours } from '@/components/BusinessHours'
import { Metadata } from 'next'
import { CONTACT, BRAND, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PARKING_WORDING } from '@/lib/approved-wording'

import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Pub with Pool Table & Darts',
    description: `Play pool and darts at The Anchor in Stanwell Moor. Pool table (£1 a game) and a dartboard, proper pub games with a pint. ${HEATHROW_TIMES.terminal5} mins from Heathrow T5, free parking.`,
    openGraph: {
        title: 'Pub with Pool Table & Darts Near You | The Anchor',
        description: `Pool table, dartboard, and a proper pint. Play pool or throw darts at The Anchor in Stanwell Moor, ${HEATHROW_TIMES.terminal5} mins from Heathrow T5 with free parking.`,
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'Pool table and darts at The Anchor pub in Stanwell Moor' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pub with Pool Table & Darts Near You | The Anchor',
        description: `Pool table, dartboard, and a proper pint. Play pool or throw darts at The Anchor in Stanwell Moor, ${HEATHROW_TIMES.terminal5} mins from Heathrow T5 with free parking.`,
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/pool-darts-pub'
    }
}

export default function PoolAndDartsPage() {
    return (
        <>

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Pool & Darts"
        title="Pub with Pool Table and Darts Near Heathrow"
        lead="A proper pub with a pool table and a dartboard. Rack up a frame for £1, throw some arrows, and settle it all over a cold pint. Check current opening hours before visiting."
      />

            <AmenityStrip/>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <h2 className="font-display text-h2 text-ink-strong mb-4">
                            A Pub with Pool Table, Darts & Great Beer
                        </h2>
                        <p className="text-lg text-ink-muted mb-4">
                            The Anchor has a pool table and a dartboard. Pool is £1 a game, played with yellow and red balls. The dartboard is a standard board.
                        </p>
                        <p className="text-lg text-ink-muted">
                            Whether you&apos;re killing time before a flight, settling a long-running grudge match with a mate, or just fancy a frame and a pint on a Tuesday evening, this is a pub where you can play a game and the beer is cold. We&apos;re {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 with free parking, so there&apos;s no excuse not to drop in.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            kicker="£1 a game"
                            title="Play Pool at The Anchor"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card accent>
                                <CardBody>
                                    <h3 className="font-display text-h3 text-ink-strong mb-2">Pool Table</h3>
                                    <p className="text-ink-muted mb-4">
                                        One pool table, played with yellow and red balls.
                                    </p>
                                    <ul className="space-y-2 text-sm text-ink bg-surface-sunk p-4 rounded-sm">
                                        <li>Yellow and red balls</li>
                                        <li>£1 per game</li>
                                    </ul>
                                </CardBody>
                            </Card>

                            <Card accent>
                                <CardBody>
                                    <h3 className="font-display text-h3 text-ink-strong mb-2">Darts</h3>
                                    <p className="text-ink-muted mb-4">
                                        A standard dartboard, with no electronic scorer.
                                    </p>
                                    <ul className="space-y-2 text-sm text-ink bg-surface-sunk p-4 rounded-sm">
                                        <li>Standard dartboard</li>
                                        <li>No electronic scorer</li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            kicker="A frame, a pint, somewhere to enjoy both"
                            title="More Than Just Pub Games"
                        />

                        <div className="max-w-none text-ink-muted space-y-4">
                            <p>
                                The Anchor isn&apos;t a pool hall, it&apos;s a pub with a pool table and a dartboard. That means you get the full pub experience alongside your game: beer on tap, food from the kitchen (kitchen times vary by date, so check before you come or call {CONTACT.phone}), and a beer garden under the Heathrow flight path, with a plane about every 90 seconds at busy times, if you fancy watching the show between frames.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                                <Card accent>
                                    <CardBody>
                                        <h3 className="font-display text-h4 text-ink-strong mb-3">Getting Here</h3>
                                        <ul className="space-y-2 text-sm text-ink-muted">
                                            <li>{HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5</li>
                                            <li>{PARKING.capacity} free parking spaces on site</li>
                                            <li>Stanwell Moor, TW19 6AQ</li>
                                        </ul>
                                    </CardBody>
                                </Card>

                                <Card accent>
                                    <CardBody>
                                        <h3 className="font-display text-h4 text-ink-strong mb-3">When to Visit</h3>
                                        {/* Live, not hardcoded. These times had
                                            drifted (Tue-Thu was listed to 11pm, Sunday
                                            as 1pm-6pm) and the dated schedule change
                                            would have made them wrong again. */}
                                        <BusinessHours showKitchen={false} />
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading
                            kicker="We'd love to put a team together"
                            title="Fancy Playing Competitively?"
                        />
                        <p className="text-ink-muted mb-4">
                            We don&apos;t have a pool team or a darts team at the moment, but we&apos;re always looking for a great captain to pull one together. If that sounds like you, we want to hear from you.
                        </p>
                        <Card accent className="max-w-xl mx-auto">
                            <CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-2">Could You Captain a Team?</h3>
                                <p className="text-ink-muted">Know your way around a pool table or a dartboard? We&apos;re looking for someone to start a team. Pop in or call us on {CONTACT.phone}.</p>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How much does it cost to play pool?",
                        answer: "£1 per game."
                    },
                    {
                        question: "Do you have parking?",
                        answer: `Yes. ${PARKING_WORDING}`
                    },
                    {
                        question: "What other pub games do you have?",
                        answer: "Alongside pool and darts, we have a jukebox and board games. We also run a monthly quiz night and music bingo, and cash bingo on set dates. Check what's on for the current dates."
                    },
                    {
                        question: "Do you have a darts or pool team I can join?",
                        answer: `Not at the moment. We're always looking for a great captain to pull a team together for pool or for darts. If that's you, ask at the bar or call us on ${CONTACT.phone}.`
                    }
                ]}
                className="bg-canvas"
            />

            <CtaBand
                title="Rack 'em Up"
                copy="A frame, a pint, and free parking. What more do you need?"
            >
                <PhoneButton phone={CONTACT.phone} source="pool_cta" variant="primary" size="lg">Call us</PhoneButton>
                <Button asChild variant="outline" size="lg">
                    <Link href="/whats-on">What&apos;s on</Link>
                </Button>
                <DirectionsButton href="https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ" source="pool_darts_directions" variant="outline" size="lg">
                    Get directions
                </DirectionsButton>
            </CtaBand>
        </>
    )
}
