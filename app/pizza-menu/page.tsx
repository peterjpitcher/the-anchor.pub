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
import foodData from '@/content/menu/food.json'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Barrel & Stone Pizza at The Anchor | Stone Baked & Fresh',
    description: `Experience authentic Barrel & Stone pizza at ${BRAND.name} near Heathrow. Freshly prepared, stone-baked on site using finest Italian ingredients. Crisp, thin, and delicious.`,
    keywords: 'stone-baked pizza, fresh pizza near heathrow, Barrel & Stone pizza, Italian ingredients pizza, artisan pizza pub, pizza in Stanwell Moor, thin and crispy pizza',
    openGraph: {
        title: 'Fresh Stone Baked Pizza at The Anchor',
        description: 'Prepared and baked fresh on site. The finest Italian ingredients, stone-baked for the perfect crisp finish.',
        images: ['/images/page-headers/pizza-tuesday/pizza-tuesday.jpg'],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Fresh Stone Baked Pizza at The Anchor',
        description: 'Prepared and baked fresh on site. The finest Italian ingredients, stone-baked for the perfect crisp finish.',
        images: ['/images/page-headers/pizza-tuesday/pizza-tuesday.jpg']
    })
}

export default function PizzaMenuPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Food', url: '/food-menu' },
        { name: 'Pizza Menu', url: '/pizza-menu' }
    ])

    // Get Pizza Category
    const pizzaCategory = foodData.categories.find(c => c.id === 'pizza')

    // Generate Menu Schema dynamically from food.json
    const menuSchema = {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Pizza Menu",
        "description": "Stone-baked pizzas available for dine-in or takeaway.",
        "hasMenuSection": pizzaCategory ? pizzaCategory.sections.map(section => ({
            "@type": "MenuSection",
            "name": section.title || "Pizzas",
            "hasMenuItem": section.items.map(item => ({
                "@type": "MenuItem",
                "name": item.name,
                "description": item.description,
                "offers": {
                    "@type": "Offer",
                    "price": item.price.replace(/[^0-9.]/g, '').split('.')[0] + '.' + (item.price.replace(/[^0-9.]/g, '').split('.')[1] || '00'), // Basic extraction
                    "priceCurrency": "GBP"
                }
            }))
        })) : []
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([menuSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
              route="/pizza-menu"
              title="Pizza at The Anchor"
              description="Stone-baked, freshly prepared, and served with a smile. The perfect treat near Heathrow."
              image={{
                src: "/images/page-headers/pizza-tuesday/pizza-tuesday.jpg",
                alt: "Stone-baked pizza at The Anchor"
              }}
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

            <section className="py-12 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <PageTitle className="text-anchor-green mb-6">
                            Freshly Prepared, Stone Baked
                        </PageTitle>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            At The Anchor, our pizzas are all about proper stone-baked quality — prepared and baked here on site, on traditional pizza stones at high temperature for that thin, crispy finish.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            We work with <strong>Barrel & Stone</strong>, a UK concept built around helping local venues serve hand-crafted, freshly prepared stone-baked pizza using finest Italian ingredients and inspiration that pays homage to the pizza masters of Naples showing our own twist from modern Italian culture.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            It means you get the feel of a great local pub — near Heathrow and serving the community — with pizza that’s designed to taste like it belongs on the menu, not like an afterthought.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/images/page-headers/pizza-tuesday/pizza-tuesday.jpg"
                                alt="Freshly baked stone pizza at The Anchor"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-6 text-left">
                            <h2 className="text-3xl font-bold text-anchor-green">Why Our Pizzas Are Different</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl">🔥</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900">High-Heat Stone Baking</h3>
                                        <p className="text-gray-600">Cooked on traditional stones for that authentic, thin, and crispy crust you can't get from a standard oven.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl">🍅</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Finest Italian Ingredients</h3>
                                        <p className="text-gray-600">We use premium ingredients sourced for their quality and flavour, paying homage to original Napoli traditions.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl">👨‍🍳</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Made Fresh Here</h3>
                                        <p className="text-gray-600">Prepared and baked right here on the premises. No "heating up" elsewhere — just fresh, hot pizza.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-anchor-cream/30 rounded-2xl p-8 mb-16">
                        <h2 className="text-2xl font-bold text-center text-anchor-green mb-6">Dietary Options</h2>
                        <div className="grid md:grid-cols-2 gap-6 text-center">
                            <div>
                                <h3 className="font-bold text-lg mb-2">Gluten Free Available</h3>
                                <p className="text-gray-600">We offer 12" gluten-free bases for our pizzas. Just ask when ordering!</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Vegetarian & Vegan</h3>
                                <p className="text-gray-600">Plenty of vegetarian options, and we can customise pizzas for vegan diets (cheeseless or bring your own vegan cheese!).</p>
                            </div>
                        </div>
                    </div>

                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="The Menu"
                            subtitle="Authentic Stone Baked Pizzas"
                        />

                        {pizzaCategory && pizzaCategory.sections.map((section, idx) => (
                            <div key={idx} className="mb-12 last:mb-0">
                                {section.title && <h3 className="text-2xl font-bold text-center text-anchor-green mb-6">{section.title}</h3>}
                                <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                                    {section.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <h3 className="font-bold text-xl text-anchor-green">{item.name}</h3>
                                                <span className="font-semibold text-anchor-green bg-anchor-green/5 px-2 py-1 rounded text-sm whitespace-nowrap">{item.price}</span>
                                            </div>
                                            <p className="text-gray-600 mb-3 text-sm leading-relaxed">{item.description}</p>
                                            <div className="flex gap-2 text-xs flex-wrap">
                                                {item.vegetarian && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Vegetarian</span>}
                                                {/* @ts-ignore */}
                                                {item.glutenFreeAvailable && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">GF Available</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do you do gluten-free bases?",
                        answer: "Yes, we have gluten-free bases available. Please ask when ordering. While not a gluten-free environment, we take care to prevent cross-contamination where possible."
                    },
                    {
                        question: "Can I order takeaway?",
                        answer: "Absolutely. Our stone-baked pizzas are perfect for takeaway. Call us on 01753 682707 to place your order for collection."
                    },
                    {
                        question: "When do you serve pizza?",
                        answer: "Our kitchen serves pizza Tuesday to Friday 6pm-9pm, Saturday 1pm-7pm, and Sunday 12pm-5pm."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Ready for Real Pizza?"
                description="Book a table for the fresh experience or order to go."
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
