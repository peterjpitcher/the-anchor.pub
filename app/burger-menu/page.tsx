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
    title: 'Gourmet Burger Menu Near Heathrow | Best Pub Burgers',
    description: `Craving a proper burger? Try our double-stacked gourmet burgers at ${BRAND.name}. 100% beef, brioche buns, and loaded fries. Just minutes from Heathrow.`,
    keywords: 'burger menu heathrow, best burgers staines, pub burgers near me, gourmet burgers stanwell',
    openGraph: {
        title: 'Proper Pub Burgers',
        description: 'Double stacked, juicy, and packed with flavour.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Proper Pub Burgers',
        description: 'Double stacked, juicy, and packed with flavour.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    })
}

export default function BurgerMenuPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Food', url: '/food-menu' },
        { name: 'Burger Menu', url: '/burger-menu' }
    ])

    const menuSchema = {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Burger Menu",
        "description": "Gourmet burgers served with fries.",
        "hasMenuSection": [
            {
                "@type": "MenuSection",
                "name": "Burgers",
                "hasMenuItem": [
                    {
                        "@type": "MenuItem",
                        "name": "The Classic",
                        "description": "Double beef patty, american cheese, lettuce, tomato, house sauce."
                    },
                    {
                        "@type": "MenuItem",
                        "name": "The Anchor Stack",
                        "description": "Double beef patty, bacon, onion rings, bbq sauce, cheese."
                    },
                    {
                        "@type": "MenuItem",
                        "name": "Chicken Royale",
                        "description": "Crispy buttermilk chicken breast, mayo, lettuce."
                    }
                ]
            }
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([menuSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/burger-menu"
                title="Gourmet Pub Burgers"
                description="Juicy. Stacked. Delicious. Served in a brioche bun with skin-on fries."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="burger_hero"
                        context="food"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🍔 Book Table
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            📄 Full Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Serious About Burgers
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            A pub burger should be a main event, not an afterthought. We use quality chuck steak mince for our patties, smash them on the grill for that caramelised crust, and serve them pink-free but juicy.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Build Your Perfect Burger"
                            subtitle="Classic combos or fully loaded."
                        />

                        <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-xl text-anchor-green mb-2">The Classic Cheese</h3>
                                <p className="text-gray-600 mb-2">6oz beef patty, melting American cheese, pickles, burger sauce.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-xl text-anchor-green mb-2">Smokey BBQ</h3>
                                <p className="text-gray-600 mb-2">Beef patty, crispy bacon, onion rings, BBQ drizzle.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-xl text-anchor-green mb-2">Buttermilk Chicken</h3>
                                <p className="text-gray-600 mb-2">Fried chicken breast, garlic mayo, lettuce.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-xl text-anchor-green mb-2">The Veggie Stack (V)</h3>
                                <p className="text-gray-600 mb-2">Plant-based patty, halloumi, chilli jam.</p>
                            </div>
                        </div>

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🥩",
                                    title: "100% Beef",
                                    description: "British beef, seasoned simply with salt and pepper to let the meat speak.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍟",
                                    title: "Skin-on Fries",
                                    description: "Every burger comes with a generous portion of our crispy skin-on fries.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🥬",
                                    title: "Fresh Toppings",
                                    description: "Crisp lettuce, ripe tomatoes, and tangy pickles in every toasted bun.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can I double up?",
                        answer: "Yes, you can add an extra patty to any burger if you're feeling hungry."
                    },
                    {
                        question: "Do you offer gluten-free buns?",
                        answer: "We offer gluten-free buns on request. Just let your server know."
                    },
                    {
                        question: "Are there vegetarian options?",
                        answer: "Yes, we have a delicious plant-based burger and halloumi options."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Hungry Yet?"
                description="Come and tackle one of our stacks."
                buttons={[
                    {
                        text: "🍔 Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "burger_cta",
                        variant: "primary"
                    },
                    {
                        text: "📞 Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "burger_call_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
