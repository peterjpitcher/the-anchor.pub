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
    title: 'Best Fish and Chips Near Heathrow | Fresh Beer Battered Cod',
    description: `Looking for proper British Fish and Chips near Heathrow? Freshly battered cod, chunky chips, and mushy peas at ${BRAND.name}. Just 7 mins from T5.`,
    keywords: 'fish and chips heathrow, best fish and chips staines, british pub food heathrow, fish and chips near me',
    openGraph: {
        title: 'Proper British Fish & Chips',
        description: 'Crispy batter, flaky fish, and proper chips. The ultimate pre-flight meal.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Proper British Fish & Chips',
        description: 'Crispy batter, flaky fish, and proper chips. The ultimate pre-flight meal.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    })
}

export default function FishAndChipsPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Food', url: '/food-menu' },
        { name: 'Fish & Chips', url: '/fish-and-chips-heathrow' }
    ])

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Beer Battered Fish and Chips",
        "image": DEFAULT_PAGE_HEADER_IMAGE,
        "description": "Freshly battered cod served with chunky chips, mushy peas, and tartar sauce.",
        "brand": {
            "@type": "Brand",
            "name": BRAND.name
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Restaurant",
                "name": BRAND.name
            }
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([productSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/fish-and-chips-heathrow"
                title="Proper Fish & Chips"
                description="Freshly battered. Piping hot. Served with chunky chips and mushy peas. The British classic done right."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="fish_hero"
                        context="food"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🍽️ Book Table
                    </BookTableButton>
                }
                secondaryCta={
                    <BookTableButton
                        source="fish_hero_takeaway"
                        context="food"
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🛍️ Order Takeaway
                    </BookTableButton>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            A British Institution
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            Whether you're a local resident or a traveller passing through Heathrow, sometimes only Fish and Chips will do. We don't mess around with the recipe. We use fresh fish, a secret-recipe beer batter, and we cook it to order so it hits your table crispy and hot.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Why Ours Tastes Better"
                            subtitle="It's all in the details."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🍺",
                                    title: "Beer Batter",
                                    description: "We make our batter fresh daily using real ale for that perfect golden crunch.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🥔",
                                    title: "Proper Chips",
                                    description: "Big, chunky, fluffy on the inside. None of those frozen french fries here.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🧂",
                                    title: "The Trimmings",
                                    description: "Served with traditional mushy peas, tartare sauce, and a wedge of lemon.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="success"
                            title="Senior Citizens Offer"
                            className="max-w-2xl mx-auto mt-8"
                            content="Every Friday, senior citizens (65+) can enjoy our Fish and Chips for 50% off. It's our way of looking after the locals."
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Is your fish sustainable?",
                        answer: "Yes, we only source fish from sustainable stocks."
                    },
                    {
                        question: "Do you offer gluten-free batter?",
                        answer: "We can do gluten-free grilled fish, but please call ahead to check if we have a dedicated fryer available for gluten-free batter."
                    },
                    {
                        question: "Can I get takeaway?",
                        answer: "Yes! Call us to order and you can pick up fresh fish and chips to take home."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Craving a Classic?"
                description="Book a table or order for collection."
                buttons={[
                    {
                        text: "🍽️ Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "fish_cta",
                        variant: "primary"
                    },
                    {
                        text: "🛍️ Order Takeaway",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "fish_takeaway_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
