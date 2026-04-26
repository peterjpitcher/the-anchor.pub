import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Beer Garden Near Heathrow | Outdoor Dining & Drinks',
    description: `Enjoy a pint in the sun at ${BRAND.name}. Large grassy beer garden, outdoor dining tables, and plenty of space. Just minutes from Heathrow Airport.`,
    openGraph: {
        title: 'The Anchor Beer Garden',
        description: 'Sun, cider, and space to relax. The best garden in Stanwell Moor.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Anchor Beer Garden',
        description: 'Sun, cider, and space to relax. The best garden in Stanwell Moor.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/beer-garden'
    }
}

export default function PubGardenPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Beer Garden', url: '/pub-garden-heathrow' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/pub-garden-heathrow"
                title="The Best Garden Around"
                description="When the sun is shining, there's no better place. Cold drinks, fresh air, and real grass between your toes."
                variant="default"
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Al Fresco Living
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            We're lucky to have one of the largest pub gardens in the area. Far enough from the main road to be peaceful, but close enough to the bar for a quick refill. It's the perfect spot for a lazy Sunday afternoon or a post-work pint.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Garden Features"
                            subtitle="More than just a few benches."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Real Grass",
                                    description: "A proper lawn, perfect for kids to play on or for sprawling out on a picnic blanket.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Outdoor Dining",
                                    description: "We serve our full menu outside. Just grab a table number and order at the bar.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Smoking Area",
                                    description: "Designated sheltered smoking areas for when the British weather does its thing.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="success"
                            title="Dog Friendly"
                            className="max-w-2xl mx-auto mt-8"
                            content="Our garden is a paradise for pooches. Water bowls are always available."
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can I book a table outside?",
                        answer: "Yes, we take bookings for outdoor tables. However, we can't guarantee the weather!"
                    },
                    {
                        question: "Is there cover if it rains?",
                        answer: "We have large parasols and some sheltered areas, but in severe weather, we'll try our best to find you a spot inside."
                    },
                    {
                        question: "Is there lighting at night?",
                        answer: "Yes, the garden is beautifully lit with festoon lighting in the evenings."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Save Me A Seat"
                description="Book a spot in the sun."
                buttons={[
                    {
                        text: "Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "garden_cta",
                        variant: "primary"
                    },
                    {
                        text: "Find Us",
                        href: "/find-us",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
