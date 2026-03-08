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
    title: 'Pub Garden Parties & BBQ Hire Heathrow | The Anchor',
    description: `Host your summer event in our large pub garden. BBQ packages, outdoor bar options, and plenty of sunshine. Perfect for birthdays and team socials near Heathrow.`,
    keywords: 'pub garden hire heathrow, bbq party venue staines, outdoor party venue, pub with large garden',
    openGraph: {
        title: 'Summer Garden Parties at The Anchor',
        description: 'Sun, Cider, and BBQ. The perfect ingredients for a summer bash.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Summer Garden Parties at The Anchor',
        description: 'Sun, Cider, and BBQ. The perfect ingredients for a summer bash.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/summer-garden-parties'
    }
}

export default function SummerGardenPartiesPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Summer Parties', url: '/summer-garden-parties' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/summer-garden-parties"
                title="Summer Garden Parties"
                description="Exclusive areas, BBQ packages, and festival vibes."
                variant="default"
                primaryCta={
                    <Link href="/contact">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            ☀️ Enquire for Summer
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🍔 See BBQ Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            The Best Beer Garden Around
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            When the British summer finally arrives, there's no better place to be than The Anchor's garden. With a large grassy area, plenty of picnic benches, and dedicated space for private events, it's the ultimate spot for soaking up the sun.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Summer Party Packages"
                            subtitle="More than just a few sausages on the grill."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🔥",
                                    title: "Chef's BBQ",
                                    description: "We man the grill so you don't have to. Gourmet burgers, marinated chicken, and fresh salads.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍺",
                                    title: "Outdoor Service",
                                    description: "For large events, we can set up an outdoor bottle bar so drinks are never far away.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🎸",
                                    title: "Live Music",
                                    description: "Subject to license conditions, acoustic music can be the perfect backdrop to your afternoon.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="info"
                            title="Weather Policy"
                            className="max-w-2xl mx-auto mt-8"
                            content="We can't control the British weather! If it rains, we will do our absolute best to move your party indoors or under our covered patio areas."
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader title="Perfect for..." />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 border border-anchor-gold/15 rounded-xl bg-anchor-bg-raised">
                                <span className="text-3xl block mb-2">🎂</span>
                                <span className="font-bold">Birthdays</span>
                            </div>
                            <div className="p-4 border border-anchor-gold/15 rounded-xl bg-anchor-bg-raised">
                                <span className="text-3xl block mb-2">🏢</span>
                                <span className="font-bold">Team Socials</span>
                            </div>
                            <div className="p-4 border border-anchor-gold/15 rounded-xl bg-anchor-bg-raised">
                                <span className="text-3xl block mb-2">👶</span>
                                <span className="font-bold">Christenings</span>
                            </div>
                            <div className="p-4 border border-anchor-gold/15 rounded-xl bg-anchor-bg-raised">
                                <span className="text-3xl block mb-2">💍</span>
                                <span className="font-bold">Receptions</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Is there a minimum number for a BBQ?",
                        answer: "For a private BBQ buffet, we usually require a minimum of 20 guests. For smaller groups, our main menu is always available."
                    },
                    {
                        question: "Can we hire the whole garden?",
                        answer: "We can section off a large private area for you, but we generally keep part of the garden open for our regular customers unless it is a very large exclusive hire."
                    },
                    {
                        question: "Is it dog friendly?",
                        answer: "Yes! Our garden is completely dog friendly. We have water bowls and treats available."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Book Your Spot in the Sun"
                description="Dates fill up fast when the forecast is good."
                buttons={[
                    {
                        text: "☀️ Enquire Now",
                        href: "mailto:info@the-anchor.pub?subject=Summer%20Party%20Enquiry",
                        variant: "primary"
                    },
                    {
                        text: "📞 Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "summer_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
