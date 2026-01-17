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
    title: 'Gourmet Burger Menu Near Heathrow | Best Pub Burgers',
    description: `Craving a proper burger? Try our double-stacked gourmet burgers at ${BRAND.name}. 100% beef, brioche buns, and chips. Just minutes from Heathrow.`,
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
    }),
    alternates: {
        canonical: '/burger-menu'
    }
}

export default async function BurgerMenuPage() {
    const menuData = await parseMenuMarkdown('food')
    const burgerCategory = menuData?.categories.find(c => c.id === 'burgers')

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Food', url: '/food-menu' },
        { name: 'Burger Menu', url: '/burger-menu' }
    ])

    // Generate dynamic schema based on fetched data
    const menuItems = burgerCategory?.sections.flatMap(section =>
	        section.items.map(item => ({
	            "@type": "MenuItem",
	            "name": item.name,
	            "description": item.description,
	            "offers": {
	                "@type": "Offer",
	                "price": item.price?.replace(/\u00A3/g, ''),
	                "priceCurrency": "GBP"
	            }
	        }))
	    ) || []

	    const menuSchema = {
	        "@context": "https://schema.org",
	        "@type": "Menu",
	        "name": "Burger Menu",
	        "description": "Gourmet burgers served with chips.",
	        "hasMenuSection": [
	            {
	                "@type": "MenuSection",
	                "name": "Burgers",
                "hasMenuItem": menuItems
            }
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([menuSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/burger-menu"
                title="Gourmet Pub Burgers"
                description="Juicy. Stacked. Delicious. Served in a brioche bun with chips."
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
                            subtitle={burgerCategory?.description || "Classic combos or fully loaded."}
                        />

                        {/* Dynamic Menu Rendering */}
                        {burgerCategory ? (
                            <div className="space-y-12 mb-12">
                                {burgerCategory.sections.map((section, idx) => (
                                    <div key={idx} className="text-left max-w-3xl mx-auto">
                                        {section.title && (
                                            <h3 className="text-2xl font-bold text-anchor-green mb-6 text-center">{section.title}</h3>
                                        )}
                                        {section.description && (
                                            <p className="text-gray-600 mb-6 text-center -mt-4">{section.description}</p>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {section.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-xl text-anchor-green">{item.name}</h4>
                                                        {item.price && <span className="font-bold text-anchor-gold bg-anchor-cream/50 px-2 py-1 rounded text-sm">{item.price}</span>}
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.vegetarian && (
                                                            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">Vegetarian</span>
                                                        )}
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
                                ))}
                            </div>
                        ) : (
                            <AlertBox
                                variant="info"
                                title="Menu Update"
                                content="Our burger menu is currently being updated. Please check back soon or call us for today's specials."
                                className="mb-8"
                            />
                        )}

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
                                    title: "Chips Included",
                                    description: "Every burger comes with chips as standard.",
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
                        answer: "Yes — try our Vegetable Burger or Veggie Stack."
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
