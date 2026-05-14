import { CTASection, SectionHeader, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Pub with Pool Table & Darts | The Anchor, Stanwell Moor',
    description: 'Play pool and darts at The Anchor in Stanwell Moor. Pool table (£1/game), dartboard (free), proper pub games with a pint. 7 mins from Heathrow, free parking.',
    openGraph: {
        title: 'Pub with Pool Table & Darts Near You | The Anchor',
        description: 'Pool table, dartboard, and a proper pint. Play pool or throw darts at The Anchor in Stanwell Moor — 7 mins from Heathrow with free parking.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'Pool table and darts at The Anchor pub in Stanwell Moor' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pub with Pool Table & Darts Near You | The Anchor',
        description: 'Pool table, dartboard, and a proper pint. Play pool or throw darts at The Anchor in Stanwell Moor — 7 mins from Heathrow with free parking.',
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
                title="Pool & Darts at The Anchor"
                description="A proper pub with a proper pool table and a dartboard. Rack up a frame for £1, throw arrows for free, and settle it all over a cold pint. Open Tuesday to Sunday, seven minutes from Heathrow with free parking."
                variant="default"
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="section-spacing-sm bg-anchor-bg">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-gold-vivid mb-4">
                            A Pub with Pool Table, Darts & Great Beer
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70 mb-4">
                            Some pubs stick a wobbly table in a dark corner and call it a games area. Not here. The Anchor has a quality pool table kept level and re-covered regularly, a dartboard with a proper throw area, and enough space to actually play without elbowing the person behind you. We&apos;re also upgrading the darts setup in 2026 with a professional board, electronic scorer, and better lighting.
                        </p>
                        <p className="text-lg text-anchor-cream-text/70">
                            Whether you&apos;re killing time before a flight, settling a long-running grudge match with a mate, or just fancy a frame and a pint on a Tuesday evening — this is a pub where the games are taken seriously and the beer is cold. We&apos;re seven minutes from Heathrow Terminal 5 with free parking, so there&apos;s no excuse not to drop in.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Play Pool at The Anchor"
                            subtitle="Kept level and re-covered regularly so the cloth plays true."
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-anchor-bg-card p-6 rounded-xl shadow-sm border border-anchor-gold/15">
                                <h3 className="text-2xl font-bold text-anchor-cream-text mb-2">Pool Table</h3>
                                <p className="text-anchor-cream-text/70 mb-4">
                                    A quality table with a level surface, re-covered regularly so the cloth plays true. No dead spots, no dodgy cushions. Just a clean game with yellow and red balls.
                                </p>
                                <ul className="text-left space-y-2 text-sm bg-anchor-bg-raised p-4 rounded-lg">
                                    <li className="flex items-center">Full set of yellows &amp; reds</li>
                                    <li className="flex items-center">Quality cues provided</li>
                                    <li className="flex items-center">£1 per game (coin-operated)</li>
                                    <li className="flex items-center">Change available at the bar</li>
                                </ul>
                            </div>

                            <div className="bg-anchor-bg-card p-6 rounded-xl shadow-sm border border-anchor-gold/15">
                                <h3 className="text-2xl font-bold text-anchor-cream-text mb-2">Darts</h3>
                                <p className="text-anchor-cream-text/70 mb-4">
                                    A dartboard with a proper throw area — not a battered board crammed behind a fruit machine. We&apos;re upgrading to a professional-grade board with electronic scorer and better lighting in 2026.
                                </p>
                                <ul className="text-left space-y-2 text-sm bg-anchor-bg-raised p-4 rounded-lg">
                                    <li className="flex items-center">Dartboard with clear throw area</li>
                                    <li className="flex items-center">Darts provided (or bring your own)</li>
                                    <li className="flex items-center">Upgrade coming 2026: pro board, electronic scorer &amp; lighting</li>
                                    <li className="flex items-center">Completely free to play</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="More Than Just Pub Games"
                            subtitle="A frame, a pint, and somewhere to actually enjoy both."
                        />

                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70">
                            <p>
                                The Anchor isn&apos;t a pool hall — it&apos;s a pub that happens to have genuinely good games facilities. That means you get the full pub experience alongside your game: proper beer on tap, food from the kitchen (Tuesday to Sunday), and a beer garden with planes landing overhead every ninety seconds if you fancy watching the show between frames.
                            </p>
                            <p>
                                Most people who come to play pool or throw darts end up staying longer than they planned. That&apos;s not an accident — it&apos;s what happens when you combine decent equipment with a relaxed atmosphere and no pressure to rush.
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                                <div className="bg-anchor-bg-card p-6 rounded-xl shadow-sm border border-anchor-gold/15">
                                    <h3 className="text-lg font-bold text-anchor-cream-text mb-3">Getting Here</h3>
                                    <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                                        <li>7 minutes from Heathrow Terminal 5</li>
                                        <li>20 free parking spaces on site</li>
                                        <li>Stanwell Moor, TW19 6AQ</li>
                                    </ul>
                                </div>

                                <div className="bg-anchor-bg-card p-6 rounded-xl shadow-sm border border-anchor-gold/15">
                                    <h3 className="text-lg font-bold text-anchor-cream-text mb-3">When to Visit</h3>
                                    <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                                        <li>Tuesday – Thursday: 4pm – 11pm</li>
                                        <li>Friday: 4pm – late</li>
                                        <li>Saturday: 12pm – late</li>
                                        <li>Sunday: 1pm – 6pm</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Fancy Playing Competitively?"
                            subtitle="We'd love to put a team together."
                        />
                        <p className="text-anchor-cream-text/70 mb-4">
                            We don&apos;t have a pool or darts team yet, but we&apos;re always on the lookout for a great captain to pull one together and lead it to glory. If you&apos;re the kind of person who organises the WhatsApp group, picks the team name, and actually turns up on match night — we want to hear from you.
                        </p>
                        <AlertBox
                            variant="tip"
                            title="Could You Captain a Team?"
                            className="max-w-xl mx-auto"
                            content="Know your way around a pool table or a dartboard? We're looking for someone to start a team. Pop in or call us on 01753 682707."
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can I reserve the pool table?",
                        answer: "During normal pub hours it works on a winner-stays-on or chalkboard system. For private events, the table can be reserved — get in touch to arrange it."
                    },
                    {
                        question: "How much does it cost to play pool?",
                        answer: "£1 per game, coin-operated. If you only have a card, the bar can provide change. Darts is completely free."
                    },
                    {
                        question: "Can children play pool and darts?",
                        answer: "Yes, children are welcome to play under adult supervision, provided they're tall enough to reach the table safely and treat the equipment respectfully."
                    },
                    {
                        question: "Do you have parking?",
                        answer: "Yes — 20 free parking spaces on site. No fees, no time limit while you're visiting. The car park is level, CCTV-monitored, and floodlit."
                    },
                    {
                        question: "What other pub games do you have?",
                        answer: "Alongside pool and darts, we have a jukebox and board games. For organised entertainment, we run quiz nights, cash bingo, music bingo, karaoke, and live music throughout the month."
                    },
                    {
                        question: "Do you have a darts or pool league I can join?",
                        answer: "Not yet, but we'd love to start one. We're looking for a captain to pull a team together for either pool or darts. If that's you, ask at the bar or call us on 01753 682707."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Rack 'em Up"
                description="A frame, a pint, and free parking. What more do you need?"
                buttons={[
                    {
                        text: "Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "pool_cta",
                        variant: "primary"
                    },
                    {
                        text: "What's On This Week",
                        href: "/whats-on",
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
