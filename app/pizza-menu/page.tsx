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
    title: 'Stone Baked Pizza Menu Near Heathrow | Fresh Dough Pizzas',
    description: `Authentic stone-baked pizzas at ${BRAND.name}. Hand-stretched fresh dough, San Marzano tomato sauce, and premium toppings. Eat in or takeaway near Heathrow.`,
    keywords: 'pizza menu heathrow, stone baked pizza staines, pizza takeaway stamwell, best pizza near heathrow',
    openGraph: {
        title: 'Authentic Stone Baked Pizzas',
        description: 'Hand-stretched dough, stone-baked for a perfect crisp crust.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Authentic Stone Baked Pizzas',
        description: 'Hand-stretched dough, stone-baked for a perfect crisp crust.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    })
}

export default function PizzaMenuPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Food', url: '/food-menu' },
        { name: 'Pizza Menu', url: '/pizza-menu' }
    ])

    const menuSchema = {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Pizza Menu",
        "description": "Stone-baked pizzas available for dine-in or takeaway.",
        "hasMenuSection": [
            {
                "@type": "MenuSection",
                "name": "Stone Baked Pizzas",
                "hasMenuItem": [
                    {
                        "@type": "MenuItem",
                        "name": "Margherita",
                        "description": "San Marzano tomato sauce, fior di latte mozzarella, fresh basil."
                    },
                    {
                        "@type": "MenuItem",
                        "name": "Pepperoni",
                        "description": "Double pepperoni, mozzarella, tomato sauce."
                    },
                    {
                        "@type": "MenuItem",
                        "name": "The Spicy One",
                        "description": "Nduja sausage, fresh chillies, pepperoni, mozzarella."
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
                route="/pizza-menu"
                title="Stone Baked Pizza"
                description="Fresh dough made daily. Hand-stretched and baked on stone for that authentic cristpy base."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="pizza_hero"
                        context="pizza_menu"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🍕 Book Table
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/contact">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🥡 Order Takeaway
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Not Your Average Pub Pizza
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            We don't do frozen bases. Our pizza dough is made fresh in-house every day, proofed for 24 hours for flavour, and hand-stretched to order. Baked at high heat on stone, they come out with a perfect charred crust and melting cheese.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Our Pizza Process"
                            subtitle="Fresh ingredients, no shortcuts."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🍅",
                                    title: "San Marzano Sauce",
                                    description: "We use only the best tomatoes for our rich, sweet base sauce.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🧀",
                                    title: "Fior di Latte",
                                    description: "Creamy, fresh mozzarella that melts perfectly without becoming oily.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🔥",
                                    title: "Stone Baked",
                                    description: "Cooked fast on hot stone to lock in freshness and crisp up the base.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-xl text-anchor-green mb-2">Margherita</h3>
                                <p className="text-gray-600 mb-2">The classic. Tomato, mozzarella, fresh basil.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-xl text-anchor-green mb-2">Meat Feast</h3>
                                <p className="text-gray-600 mb-2">Pepperoni, ham, chicken, spicy beef.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-xl text-anchor-green mb-2">Garden Club (V)</h3>
                                <p className="text-gray-600 mb-2">Peppers, red onion, mushrooms, sweetcorn.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-xl text-anchor-green mb-2">The Hot One</h3>
                                <p className="text-gray-600 mb-2">Nduja, jalapeños, pepperoni, chilli oil.</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Link href="/food-menu#pizza">
                                <span className="text-anchor-green font-semibold hover:underline">View Full Pizza Menu on Main Menu Page &rarr;</span>
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do you do gluten-free bases?",
                        answer: "Yes, we have gluten-free bases available. Please ask when ordering, though please note they are cooked in the same kitchen as flour."
                    },
                    {
                        question: "Is takeaway available?",
                        answer: "Absolutely. You can order pizzas for collection. Give us a call on 01753 682707."
                    },
                    {
                        question: "Do you do vegan cheese?",
                        answer: "We can do a cheeseless marinara loaded with veggies, or you can bring your own vegan cheese and we'll happily add it for you!"
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Pizza Night?"
                description="Book a table or order to go."
                buttons={[
                    {
                        text: "🍕 Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "pizza_cta",
                        variant: "primary"
                    },
                    {
                        text: "🥡 Order Takeaway",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "pizza_takeaway_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
