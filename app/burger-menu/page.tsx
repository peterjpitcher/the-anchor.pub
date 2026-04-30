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
import { parseMenuMarkdown } from '@/lib/menu-parser'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Gourmet Burger Menu Near Heathrow | Best Pub Burgers',
    description: `Craving a proper burger? Try our double-stacked gourmet burgers at ${BRAND.name}. 100% beef, brioche buns, and chips. Just minutes from Heathrow.`,
    openGraph: {
        title: 'Proper Pub Burgers',
        description: 'Double stacked, juicy, and packed with flavour.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
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
	        "@id": "https://www.the-anchor.pub/burger-menu#menu",
	        "name": "Burger Menu",
	        "description": "Gourmet burgers served with chips.",
	        "provider": { "@id": "https://www.the-anchor.pub/#business" },
	        "hasMenuSection": [
	            {
	                "@type": "MenuSection",
	                "name": "Burgers",
                "hasMenuItem": menuItems
            }
        ],
        "potentialAction": {
            "@type": "ReserveAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.the-anchor.pub/book-table",
                "actionPlatform": [
                    "https://schema.org/DesktopWebPlatform",
                    "https://schema.org/MobileWebPlatform"
                ]
            },
            "result": { "@type": "FoodEstablishmentReservation" }
        }
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
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="py-8 bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Serious About Burgers
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            A pub burger should be a main event, not an afterthought. If you're wondering where to eat near Heathrow, our smash burgers are a great place to start. We use quality chuck steak mince for our patties, smash them on the grill for that caramelised crust, and serve them pink-free but juicy.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
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
                                            <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-6 text-center">{section.title}</h3>
                                        )}
                                        {section.description && (
                                            <p className="text-anchor-cream-text/70 mb-6 text-center -mt-4">{section.description}</p>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {section.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6 hover:border-anchor-gold/40 transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-xl text-anchor-gold-vivid">{item.name}</h4>
                                                        {item.price && <span className="font-bold text-anchor-gold bg-anchor-bg px-2 py-1 rounded text-sm">{item.price}</span>}
                                                    </div>
                                                    <p className="text-anchor-cream-text/70 text-sm mb-3">{item.description}</p>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.vegetarian && (
                                                            <span className="text-xs font-semibold px-2 py-1 bg-green-900/30 text-anchor-gold-vivid rounded-full">Vegetarian</span>
                                                        )}
                                                        {item.allergens && item.allergens.length > 0 && (
                                                            <span className="text-xs text-anchor-cream-text/55 border border-anchor-gold/15 px-2 py-1 rounded-full">
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
                                    icon: "",
                                    title: "100% Beef",
                                    description: "British beef, seasoned simply with salt and pepper to let the meat speak.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-none border border-anchor-gold/15 p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Chips Included",
                                    description: "Every burger comes with chips as standard.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-none border border-anchor-gold/15 p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Fresh Toppings",
                                    description: "Crisp lettuce, ripe tomatoes, and tangy pickles in every toasted bun.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-none border border-anchor-gold/15 p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <SectionHeader
                            title="How We Make Our Burgers"
                            subtitle="The smash burger method — and why it matters."
                        />
                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
                            <p>
                                We use the smash burger technique because it produces a better burger — full stop. Each patty starts as a ball of 100% British chuck steak mince, hand-formed to order. When it hits the hot griddle, we press it flat with a heavy press, creating maximum contact between the meat and the cast iron surface.
                            </p>
                            <p>
                                That contact is everything. The intense heat triggers the Maillard reaction across the entire face of the patty, forming a thin, crispy, deeply caramelised crust that a thick pub burger simply cannot achieve. The result is a patty that is simultaneously crispy on the outside and juicy in the centre — no pink, but plenty of flavour.
                            </p>
                            <p>
                                We toast our brioche buns on the same griddle so they soak up that flavour and hold their structure. Every burger comes with chips included — proper, seasoned chips, not an afterthought. We keep it simple: quality chuck steak, salt, pepper, and a very hot griddle.
                            </p>
                            <p>
                                Not a meat eater? Our Garden Veg Burger and Garden Stack are proper vegetarian options — not token additions. We also accommodate vegan requests where possible. Just ask at the bar.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Sourcing Story */}
            <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <SectionHeader
                            title="Where Our Beef Comes From"
                            subtitle="Quality chuck steak, simply handled."
                        />
                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
                            <p>
                                We use 100% British chuck steak mince for every burger we serve. Chuck steak comes from the shoulder of the animal &mdash; it has the right balance of meat and fat for a juicy, flavourful patty that holds together on the grill without being greasy.
                            </p>
                            <p>
                                We don&rsquo;t add breadcrumbs, fillers, or binding agents. Each patty is hand-formed to order and seasoned with nothing more than salt and pepper. The beef does the work &mdash; we just get out of the way. That&rsquo;s what separates a proper gourmet burger near Heathrow from the mass-produced patties you&rsquo;ll find at chain restaurants and airport terminals.
                            </p>
                            <p>
                                Our brioche buns are toasted on the same griddle as the patties, soaking up flavour and giving them enough structure to hold a double-stacked burger without falling apart. It&rsquo;s a small detail, but it makes a difference.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Sides, Shakes & Accompaniments */}
            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <SectionHeader
                            title="Sides &amp; Extras"
                            subtitle="Because a burger deserves proper company."
                        />
                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
                            <p>
                                Every burger comes with chips as standard &mdash; proper seasoned chips, not an afterthought. But if you want to upgrade, we&rsquo;ve got you covered:
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 mt-6">
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                                <p className="text-sm font-semibold text-anchor-gold-vivid">Chunky Chips</p>
                                <p className="mt-1 text-sm text-anchor-cream-text/70">Thick-cut, golden, and satisfying. The classic upgrade.</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                                <p className="text-sm font-semibold text-anchor-gold-vivid">Sweet Potato Fries</p>
                                <p className="mt-1 text-sm text-anchor-cream-text/70">Crispy on the outside, soft in the middle. A lighter option.</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                                <p className="text-sm font-semibold text-anchor-gold-vivid">Cheesy Chips</p>
                                <p className="mt-1 text-sm text-anchor-cream-text/70">Melted cheese over hot chips. Indulgent and worth every calorie.</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                                <p className="text-sm font-semibold text-anchor-gold-vivid">Onion Rings</p>
                                <p className="mt-1 text-sm text-anchor-cream-text/70">Crispy battered onion rings &mdash; perfect alongside any burger.</p>
                            </div>
                        </div>
                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70 mt-6 space-y-4">
                            <p>
                                Whether you&rsquo;re after a gourmet burger near Heathrow or just the best burger restaurant near Heathrow for a pre-flight meal, the sides are half the experience. We keep it simple &mdash; quality ingredients, cooked properly.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Customisation */}
            <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <SectionHeader
                            title="Make It Your Own"
                            subtitle="Add an extra patty, swap your bun, or go all out."
                        />
                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
                            <p>
                                Every burger on our menu can be customised. Fancy an extra patty? Done. Want a gluten-free bun? Just ask your server. Prefer no salad? No problem. We&rsquo;re a pub, not a production line &mdash; we cook to order and we&rsquo;re happy to adjust.
                            </p>
                            <p>
                                Our double-stacked burgers are already generous, but if you&rsquo;re properly hungry, adding an extra patty takes it to another level. The smash technique means each patty is thin and crispy, so stacking three doesn&rsquo;t turn your burger into something you can&rsquo;t actually eat.
                            </p>
                            <p>
                                Not a meat eater? Our Garden Veg Burger and Garden Stack are proper vegetarian burgers &mdash; not token additions to tick a box. They&rsquo;re served with the same care and the same quality sides. We also accommodate vegan requests where possible &mdash; just ask at the bar.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Heathrow positioning */}
            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <SectionHeader
                            title="A Proper Burger Near Heathrow"
                            subtitle="7 minutes from Terminal 5. Free parking. No airport prices."
                        />
                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
                            <p>
                                If you&rsquo;re looking for a burger restaurant near Heathrow that isn&rsquo;t a chain and doesn&rsquo;t charge airport prices, The Anchor is your answer. We&rsquo;re in Stanwell Moor, just 7 minutes from Terminal 5 and 2 minutes from M25 Junction 14.
                            </p>
                            <p>
                                Whether you&rsquo;re killing time before a flight, refuelling after a long journey, or hosting a Heathrow layover meal with friends &mdash; a gourmet burger near Heathrow beats anything you&rsquo;ll find inside the terminal. We have 20 free parking spaces, dogs are welcome, and we even store luggage if you need us to.
                            </p>
                            <p>
                                We&rsquo;re rated 4.6 out of 5 on Google. Regulars come from Staines, Ashford, Egham, and Windsor for our burgers &mdash; but we&rsquo;re also a favourite with travellers who discover us once and keep coming back.
                            </p>
                        </div>
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
                    },
                    {
                        question: "Are your burgers good for Heathrow travellers?",
                        answer: "Absolutely. We're just 7 minutes from Terminal 5 with free parking. Many guests stop in for a burger before or after a flight — much better than airport food."
                    },
                    {
                        question: "Can I get a burger as takeaway?",
                        answer: "Yes, call us on 01753 682707 to place a takeaway order. Collection from the bar."
                    },
                    {
                        question: "What makes a smash burger different?",
                        answer: "A smash burger is pressed flat on a very hot griddle, creating a thin, crispy, caramelised patty. It's juicier and more flavourful than a thick pub burger because of the increased surface area in contact with the heat."
                    }
                ]}
                className="bg-anchor-bg"
            />

            <CTASection
                title="Hungry Yet?"
                description="Come and tackle one of our stacks."
                buttons={[
                    {
                        text: " Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "burger_cta",
                        variant: "primary"
                    },
                    {
                        text: " Call Us",
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
