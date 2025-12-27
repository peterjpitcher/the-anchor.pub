import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Premier League Pub Near Heathrow | Watch Live Football | The Anchor',
    description: `Watch Premier League football at ${BRAND.name}. Sky Sports & TNT Sports on big screens. Great food, cold beer, and free parking near Heathrow.`,
    keywords: 'premier league pub heathrow, watch football staines, sky sports pub, tnt sports pub',
    openGraph: {
        title: 'Watch Premier League Football at The Anchor',
        description: 'The best place to watch the football. All the big games live.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch Premier League Football at The Anchor',
        description: 'The best place to watch the football. All the big games live.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    })
}

export default function PremierLeaguePage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport-pub' },
        { name: 'Premier League', url: '/live-sport/premier-league' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/live-sport/premier-league"
                title="Premier League Football"
                description="If it's on Sky or TNT, it's on at The Anchor. The ultimate matchday experience."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="premier_league_hero"
                        context="sport"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        ⚽ Book Screen View
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🍔 Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Football Done Right
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            We know what makes a good football pub. Good screens, quick service, and an atmosphere that builds from kick-off to the final whistle. Whether you're a neutral or a die-hard fan, you're welcome here.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Why Watch Here?"
                            subtitle="Better than the sofa, cheaper than the stadium."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "📺",
                                    title: "All The Channels",
                                    description: "We subscribe to both Sky Sports and TNT Sports, so you never miss a televised game.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍺",
                                    title: "Pints & Pitchers",
                                    description: "Great selection of lagers and ales, with pitchers available for the table.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🚗",
                                    title: "Easy Parking",
                                    description: "Free onsite parking, so you can drive down for the game worry-free.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="info"
                            title="A Note on 3pm Kick-offs"
                            className="max-w-2xl mx-auto mt-8"
                            content="We strictly adhere to UK broadcasting laws. We do not show 3pm Saturday games that are subject to the 'blackout'. If it's legally televised, however, we'll have it on!"
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can I book a specific table?",
                        answer: "You can request a table with a view of a specific screen when booking. We'll do our best to accommodate."
                    },
                    {
                        question: "Do you show midweek games?",
                        answer: "Yes, Champions League, Europa League, and midweek Premier League fixtures are all shown."
                    },
                    {
                        question: "Is it kid-friendly?",
                        answer: "Children are welcome until 8pm. We have a family atmosphere, but it can get lively during big derbies!"
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Don't Miss Kick Off"
                description="Book a table for you and your mates."
                buttons={[
                    {
                        text: "⚽ Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "premier_league_cta",
                        variant: "primary"
                    },
                    {
                        text: "📍 Directions",
                        href: "/find-us",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
