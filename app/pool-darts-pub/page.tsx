import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, FeatureCard, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Pool Table Pub Near Heathrow | Darts & Pints',
    description: `Pool table pub near Heathrow. ${BRAND.name} has a tournament-quality table, darts board and great beer. 7 mins from T5 with free parking.`,
    openGraph: {
        title: 'Pool Table Pub & Darts Near Heathrow | The Anchor',
        description: 'Looking for a pool table pub near you? Challenge a mate to a frame of pool or a round of darts at The Anchor, Stanwell Moor.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pool Table Pub & Darts Near Heathrow | The Anchor',
        description: 'Looking for a pool table pub near you? Challenge a mate to a frame of pool or a round of darts at The Anchor, Stanwell Moor.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/pool-darts-pub'
    }
}

export default function PoolAndDartsPage() {
    return (
        <>

            <HeroWrapper
                route="/pool-darts-pub"
                title="Pool & Darts"
                description="Tournament quality facilities for the serious player or casual chancer."
                variant="default"
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="py-8 bg-anchor-bg">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-gold-vivid mb-4">
                            Your Pool Table Pub Near Heathrow
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Looking for a pool table pub near you? There's nothing quite like a traditional pub game. Whether you're settling a score with a colleague, practising your aim at the dartboard, or just killing time with a pint, our games area is the perfect spot. The Anchor is the darts pub near Heathrow where a frame and a pint go hand in hand.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Our Facilities"
                            subtitle="Well maintained equipment for a better game."
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-anchor-bg-card p-6 rounded-xl shadow-sm border border-anchor-gold/15">
                                <h3 className="text-2xl font-bold text-anchor-cream-text mb-2">Pool Table</h3>
                                <p className="text-anchor-cream-text/70 mb-4">
                                    A supreme winner pool table, kept level and re-covered regularly.
                                </p>
                                <ul className="text-left space-y-2 text-sm bg-anchor-bg-raised p-4 rounded-lg">
                                    <li className="flex items-center">Full set of Spots & Stripes</li>
                                    <li className="flex items-center">Quality cues provided</li>
	                                    <li className="flex items-center">£1 per game</li>
                                </ul>
                            </div>

                            <div className="bg-anchor-bg-card p-6 rounded-xl shadow-sm border border-anchor-gold/15">
                                <h3 className="text-2xl font-bold text-anchor-cream-text mb-2">Darts</h3>
                                <p className="text-anchor-cream-text/70 mb-4">
                                    Professional standard dartboard with raised oche and electronic scorer.
                                </p>
                                <ul className="text-left space-y-2 text-sm bg-anchor-bg-raised p-4 rounded-lg">
                                    <li className="flex items-center">Unicorn Eclipse Board</li>
                                    <li className="flex items-center">Good lighting</li>
                                    <li className="flex items-center">Free to play</li>
                                </ul>
                            </div>
                        </div>

                        <AlertBox
                            variant="tip"
                            title="Join a Team?"
                            className="max-w-xl mx-auto"
                            content="We are always looking for new players for our local league teams. Ask at the bar if you're interested in playing competitively!"
                        />

                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can we reserve the pool table?",
                        answer: "Generally the pool table works on a winner-stays-on or chalkboard system during busy times. However, for private events, it can be reserved."
                    },
                    {
                        question: "Is it cash only for the pool table?",
	                        answer: "The table is coin-operated (£1), but we can provide change at the bar if you only have a card."
                    },
                    {
                        question: "Can children play?",
                        answer: "Children are welcome to play under adult supervision, provided they are tall enough to play safely and respectfully with the equipment."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Rack 'em Up"
                description="Come down for a frame and a pint."
                buttons={[
                    {
                        text: "Call Us",
                        href: `${CONTACT.phoneHref}`, // Using phone as generic call
                        isPhone: true,
                        phoneSource: "pool_cta",
                        variant: "primary"
                    },
                    {
                        text: "See Inside The Pub",
                        href: "/our-pub",
                        variant: "white"
                    },
                    {
                        text: "Get Directions",
                        href: "https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ",
                        variant: "white"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
