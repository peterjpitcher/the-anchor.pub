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
    title: 'Watch F1 In Staines & Heathrow | Pub with Sky Sports F1',
    description: `Watch every Formula 1 race live at ${BRAND.name}. Sky Sports F1 on HD screens with commentary. The perfect pit stop near Heathrow.`,
    keywords: 'f1 pub heathrow, watch f1 staines, formula 1 pub, sky sports f1 pub',
    openGraph: {
        title: 'Watch F1 Live at The Anchor',
        description: 'Lights out and away we go! Watch every Grand Prix with us.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch F1 Live at The Anchor',
        description: 'Lights out and away we go! Watch every Grand Prix with us.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport/f1'
    }
}

export default function F1Page() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport-pub' },
        { name: 'Formula 1', url: '/live-sport/f1' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/live-sport/f1"
                title="Watch F1™ Live Here"
                description="From lights out to the chequered flag. We show every Qualifying session and Race live."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="f1_hero"
                        context="sport"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🏎️ Book Pit Stop
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🍔 Refuel
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            The Fast Lane
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            Formula 1 is better with a crowd. Feel the tension of the start, cheer every overtake, and debate the strategy with fellow fans. We're the closest pub to Heathrow for a pre-flight race watch!
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Race Day Essentials"
                            subtitle="We've got the setup to match the speed."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🔊",
                                    title: "Commentary On",
                                    description: "For the race itself, we turn the music off and the commentary up so you don't miss a beat.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "📺",
                                    title: "Sky Sports F1",
                                    description: "We have the dedicated F1 channel, so we show the build-up, the race, and the podium analysis.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍔",
                                    title: "Sunday Roast",
                                    description: "Most races happen on Sundays. Combine the Grand Prix with our legendary Sunday Roast.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="info"
                            title="Global Timings"
                            className="max-w-2xl mx-auto mt-8"
                            content="We show all races that fall within our opening hours. For early morning races (Australia/Japan), please check our social media to see if we're opening early."
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do you show Qualifying?",
                        answer: "Yes, we show Qualifying sessions on Saturdays as well as the main race on Sundays."
                    },
                    {
                        question: "Do you show Sprint Races?",
                        answer: "Yes, if there's a Sprint weekend, we'll have the Sprint action on the screens."
                    },
                    {
                        question: "Can I eat while watching?",
                        answer: "Absolutely. Our full food menu is available, or grab a Sunday Roast during European race times."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Book Your Pole Position"
                description="Reserve a table with a screen view."
                buttons={[
                    {
                        text: "🏎️ Book Now",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "f1_cta",
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
