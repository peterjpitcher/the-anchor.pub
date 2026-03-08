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
import { parseMenuMarkdown } from '@/lib/menu-parser'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Best Fish and Chips Near Heathrow | Fresh Beer Battered Cod',
    description: `Looking for proper British Fish and Chips near Heathrow? Freshly battered cod, chunky chips, and mushy peas at ${BRAND.name}. Just 7 mins from T5.`,
    keywords: 'fish and chips heathrow, best fish and chips staines, british pub food heathrow, fish and chips near me',
    openGraph: {
        title: 'Proper British Fish & Chips',
        description: 'Crispy batter, flaky fish, and proper chips. The ultimate pre-flight meal.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Proper British Fish & Chips',
        description: 'Crispy batter, flaky fish, and proper chips. The ultimate pre-flight meal.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/fish-and-chips-heathrow'
    }
}

export default async function FishAndChipsPage() {
    const menuData = await parseMenuMarkdown('food')
    // Find the 'Mains' category, then the section with title 'Classic Chip Shop Favourites'
    const mainsCategory = menuData?.categories.find(c => c.id === 'mains')
    const fishSection = mainsCategory?.sections.find(s => s.title === 'Classic Chip Shop Favourites')

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

    // Create a Menu schema for the specific items
    const menuItems = fishSection?.items.map(item => ({
        "@type": "MenuItem",
        "name": item.name,
        "description": item.description,
        "offers": {
            "@type": "Offer",
            "price": item.price?.replace(/\u00A3/g, ''),
            "priceCurrency": "GBP"
        }
    })) || []

    const menuSchema = {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Fish & Chips Menu",
        "hasMenuSection": [
            {
                "@type": "MenuSection",
                "name": "Fish & Chips",
                "hasMenuItem": menuItems
            }
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([productSchema, menuSchema, breadcrumbSchema]) }}
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
                         Book Table
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
                         Order Takeaway
                    </BookTableButton>
                }
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            A British Institution
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Whether you're a local resident or a traveller passing through Heathrow, sometimes only Fish and Chips will do. We don't mess around with the recipe. We use fresh fish, a secret-recipe beer batter, and we cook it to order so it hits your table crispy and hot.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
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
                                    icon: "",
                                    title: "Beer Batter",
                                    description: "We make our batter fresh daily using real ale for that perfect golden crunch.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Proper Chips",
                                    description: "Big, chunky, fluffy on the inside. None of those frozen french fries here.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "The Trimmings",
                                    description: "Served with traditional mushy peas, tartare sauce, and a wedge of lemon.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        {/* Dynamic Menu Items */}
                        {fishSection && (
                            <div className="mt-12 mb-12">
                                <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-6">Our Fish Bar Menu</h3>
                                <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                                    {fishSection.items.map((item, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-xl text-anchor-cream-text">{item.name}</h4>
                                                {item.price && <span className="font-bold text-anchor-gold bg-anchor-cream/50 px-2 py-1 rounded text-sm">{item.price}</span>}
                                            </div>
                                            <p className="text-anchor-cream-text/55 text-sm mb-3">{item.description}</p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {item.allergens && item.allergens.length > 0 && (
                                                    <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-full">
                                                        Contains: {item.allergens.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                        text: " Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "fish_cta",
                        variant: "primary"
                    },
                    {
                        text: " Order Takeaway",
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
