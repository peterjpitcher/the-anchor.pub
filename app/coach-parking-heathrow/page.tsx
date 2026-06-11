import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, FeatureCard, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Pub With Coach Parking Near Heathrow | Group Bookings',
    description: `${BRAND.name} welcomes coach parties! Large car park with easy turning, group menus available, and the driver eats FREE. We're just 7 mins from T5.`,
    openGraph: {
        title: 'Coach Parties Welcome at The Anchor',
        description: 'Looking for a tour stop? We have coach parking, group menus, and a special offer for drivers.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Coach Parties Welcome at The Anchor',
        description: 'Looking for a tour stop? We have coach parking, group menus, and a special offer for drivers.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/coach-parking-heathrow'
    }
}

export default function CoachParkingPage() {
    return (
        <>

            <HeroWrapper
                route="/coach-parking-heathrow"
                title="Coach Parties Welcome"
                description="Ample parking, great group food, and the driver eats on us."
                variant="default"
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="section-spacing-sm bg-anchor-green-card border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            The Perfect Stop for Tour Groups
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Finding a pub near Heathrow that can handle a 50-seater coach is rare. finding one with great food is even rarer! The Anchor has a large, accessible car park and the capacity to feed hungry tour groups quickly and deliciously.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-deep border-t border-anchor-gold-dark/15">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="order-2 md:order-1">
                            <SectionHeader
                                title="Driver Perks"
                                subtitle="We know the driver works the hardest."
                                className="text-left"
                            />
                            <div className="bg-anchor-green text-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-2xl font-bold mb-2"> The Driver Deal</h3>
                                <p className="mb-4">Bring a group of 15+ passengers for a main meal, and the driver gets:</p>
                                <ul className="space-y-2 font-medium">
                                    <li> A Free Main Meal</li>
                                    <li> Free Soft Drinks / Coffee</li>
                                    <li> A quiet spot to rest if needed</li>
                                </ul>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <SectionHeader
                                title="Logistics"
                                subtitle="Easy access just off the M25."
                                className="text-left"
                            />
                            <div className="flex flex-col gap-4">
                                <FeatureCard
                                    icon=""
                                    title="Large Car Park"
                                    description="No tight squeezes. Our open lot allows for easy entry and exit for large vehicles."
                                    variant="colored"
                                    color="bg-anchor-green-raised"
                                    className="rounded-xl p-4"
                                />
                                <FeatureCard
                                    icon=""
                                    title="Quick Turnaround"
                                    description="Pre-order available for groups to ensure you stay on schedule."
                                    variant="colored"
                                    color="bg-anchor-green-raised"
                                    className="rounded-xl p-4"
                                />
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-card border-t border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader title="Group Dining Options" />
                        <p className="text-anchor-cream-text/70 mb-8">
                            We can tailor a menu to suit your budget and time constraints.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border p-6 rounded-xl">
                                <h4 className="font-bold text-lg mb-2">Quick & Easy</h4>
                                <p className="text-anchor-cream-text/55 text-sm">Fish & Chips or Burger & Drink deals. Served fast.</p>
                            </div>
                            <div className="border p-6 rounded-xl">
                                <h4 className="font-bold text-lg mb-2">Buffet Spread</h4>
                                <p className="text-anchor-cream-text/55 text-sm">Self-service hot and cold buffet for casual dining.</p>
                            </div>
                            <div className="border p-6 rounded-xl">
                                <h4 className="font-bold text-lg mb-2">Cream Tea</h4>
                                <p className="text-anchor-cream-text/55 text-sm">Scones, tea, and sandwiches for afternoon stops.</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do we need to book in advance?",
                        answer: "For coaches, yes absoluteley. We need to reserve the parking bays and ensure we have staff ready to serve a large group efficiently."
                    },
                    {
                        question: "Is there a maximum group size?",
                        answer: "We can comfortably seat 50-60 people in one area. For larger double-decker groups, please call us to discuss."
                    },
                    {
                        question: "How do we pre-order?",
                        answer: "Email us your numbers and requirements 24 hours in advance, and we will have everything ready to go when you pull in."
                    }
                ]}
                className="bg-anchor-green-card"
            />

            <CTASection
                title="Plan Your Stop"
                description="Call us today to book your coach parking and table."
                buttons={[
                    {
                        text: " Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "coach_cta",
                        variant: "outline"
                    },
                    {
                        text: " Email Us",
                        href: "mailto:info@the-anchor.pub",
                        variant: "white"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
