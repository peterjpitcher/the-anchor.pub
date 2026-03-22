import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
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
    title: 'Dining Near Heathrow T5 | Best Pre-Flight Meal',
    description: `Avoid the airline food! Enjoy a proper British meal at ${BRAND.name} before you fly. Authentic Fish & Chips, Burgers, and Real Ale - we're just 7 mins from T5.`,
    openGraph: {
        title: 'The Last Proper Meal Before You Fly',
        description: 'Don\'t settle for an expensive airport sandwich. Enjoy authentic British pub food just minutes from your terminal.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Last Proper Meal Before You Fly',
        description: 'Don\'t settle for an expensive airport sandwich. Enjoy authentic British pub food just minutes from your terminal.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/pre-flight-meal'
    }
}

export default function PreFlightDiningPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Dining', url: '/pre-flight-meal' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/pre-flight-meal"
                title="Your Last Proper Meal Before Flying"
                description="Authentic British food. Real Ale. 5 Minutes from Terminal 5."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="preflight_hero"
                        context="dining_preflight"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Book Your Table
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            View Menu
                        </Button>
                    </Link>
                }
                secondaryInfo={
                  <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
                  </div>
                }
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Plane Food Can Wait
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            You're about to spend hours on a plane. Why start that journey hungry or disappointed by an overpriced terminal sandwich? Stop at The Anchor for a hearty, cooked-to-order meal that will keep you satisfied halfway across the Atlantic.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="British Classics Done Right"
                            subtitle="Visitors from all over the world stop here for a taste of Britain before they leave."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Fish & Chips",
                                    description: "Freshly battered cod, chunky chips, and mushy peas. The ultimate British goodbye.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Gourmet Burgers",
                                    description: "Stacked high and served with chips. Perfect comfort food for travel.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Beef & Ale Pie",
                                    description: "Proper pastry, tender meat, and rich gravy. It beats a foil tray meal any day.",
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

            <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold mb-4 text-anchor-cream-text">Timing is Everything</h3>
                            <p className="mb-4 text-anchor-cream-text/70">
                                We know you have a flight to catch. Our service is friendly but efficient. Let us know your timeline when you arrive, and we'll make sure you're fed and watered with plenty of time to get to the gate.
                            </p>
                            <div className="bg-anchor-bg-raised border border-anchor-gold/15 p-4 rounded-lg">
                                <p className="font-bold">Estimated Taxi Times:</p>
                                <ul className="mt-2 space-y-1 text-sm text-anchor-cream-text/55">
                                    <li>Terminal 5: 5-7 mins</li>
                                    <li>Terminal 4: 10-12 mins</li>
                                    <li>Terminal 2 & 3: 10-12 mins</li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-anchor-green text-white p-8 rounded-xl text-center">
                            <h3 className="text-2xl font-bold mb-4">Taxi Service</h3>
                            <p className="mb-6">
                                Need a ride to the terminal? We have direct numbers for reliable local taxi firms who know exactly where we are and which drop-off zone you need.
                            </p>
                            <PhoneButton phone={CONTACT.phone} source="preflight_taxi_info" variant="secondary">
                                Check Taxi Availability
                            </PhoneButton>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do I need to book?",
                        answer: "We highly recommend booking, especially for dinner or Sunday Lunch. We hate turning hungry travellers away!"
                    },
                    {
                        question: "Is there a kids menu?",
                        answer: "Yes — we have smaller portions and family favourites (sausages and fish fingers) to keep the little ones happy."
                    },
                    {
                        question: "Can I bring my luggage inside?",
                        answer: "Yes! We are very luggage friendly. We have ample space to stow suitcases safely while you eat."
                    }
                ]}
                className="bg-anchor-bg"
            />

            <CTASection
                title="Fuel Up Before You Fly"
                description="Book a table and start your holiday early."
                buttons={[
                    {
                        text: "Book Now",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "preflight_cta",
                        variant: "primary"
                    },
                    {
                        text: "See the Menu",
                        href: "/food-menu",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
