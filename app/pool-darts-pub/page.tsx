import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, FeatureCard, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Pub With Pool Table & Darts Near Heathrow | The Anchor',
    description: `Looking for a game of pool or darts near Heathrow? ${BRAND.name} features a tournament-quality pool table and dart board area. Perfect for a relaxed evening.`,
    keywords: 'pub with pool table staines, darts pub heathrow, pool bar stanwell, pub games heathrow',
    openGraph: {
        title: 'Pool, Darts & Pints at The Anchor',
        description: 'Challenge a mate to a frame of pool or a round of darts. Great beer and good competition.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pool, Darts & Pints at The Anchor',
        description: 'Challenge a mate to a frame of pool or a round of darts. Great beer and good competition.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/pool-darts-pub'
    }
}

export default function PoolAndDartsPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Pool & Darts', url: '/pool-darts-pub' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/pool-darts-pub"
                title="Pool & Darts"
                description="Tournament quality facilities for the serious player or casual chancer."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="pool_hero"
                        context="dining_pool"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Book a Table Nearby
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            View Bar Menu
                        </Button>
                    </Link>
                }
                secondaryInfo={
                  <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
                  </div>
                }
            />

            <section className="py-8 bg-anchor-bg">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-gold-vivid mb-4">
                            Game On
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            There's nothing quite like a traditional pub game. Whether you're settling a score with a colleague, practicing your aim, or just killing time with a pint, our games area is the perfect spot.
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
	                                    <li className="flex items-center">GBP 1 per game</li>
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
	                        answer: "The table is coin-operated (GBP 1), but we can provide change at the bar if you only have a card."
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
