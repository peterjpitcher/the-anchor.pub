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
    title: 'Luggage Storage Near Heathrow | Free with Dining | The Anchor',
    description: `Need to store luggage near Heathrow? Don't pay airport prices. Store your bags for FREE at ${BRAND.name} when you stop for a meal. We're just 7 mins from T5.`,
    keywords: 'luggage storage heathrow, baggage storage heathrow, pub with luggage storage, eat and park heathrow',
    openGraph: {
        title: 'Free Luggage Storage Near Heathrow (With Dining)',
        description: 'Checked out early? Flight delayed? Store your bags with us while you enjoy a proper British meal.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Free Luggage Storage Near Heathrow (With Dining)',
        description: 'Checked out early? Flight delayed? Store your bags with us while you enjoy a proper British meal.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/luggage-storage-heathrow'
    }
}

export default function LuggageStoragePage() {
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Store Luggage at The Anchor",
        "description": "Store your luggage securely while enjoying a meal near Heathrow Airport.",
        "step": [
            {
                "@type": "HowToStep",
                "name": "Book a Table",
                "text": "Reserve a table for lunch or dinner and mention 'Luggage Storage' in the booking notes."
            },
            {
                "@type": "HowToStep",
                "name": "Arrive & Drop Off",
                "text": "Bring your bags inside. Our staff will tag them and store them in a secure area."
            },
            {
                "@type": "HowToStep",
                "name": "Relax",
                "text": "Enjoy your meal without worrying about dragging heavy suitcases around."
            }
        ]
    }

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/luggage-storage-heathrow' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([howToSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/luggage-storage-heathrow"
                title="Luggage Storage Near Heathrow"
                description="Don't sit on the airport floor. Store your bags for FREE when you dine with us."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="luggage_hero"
                        context="service_luggage"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Book & Store
                    </BookTableButton>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="luggage_hero" variant="secondary">
                        Call to Check Space
                    </PhoneButton>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free luggage storage for diners</span>
                    </div>
                }
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Hours to Kill Before Your Flight?
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Checking out of your hotel at 11am but your flight isn't until 8pm? Don't spend 9 hours sitting on a hard plastic chair at Terminal 5. Come to The Anchor, store your bags safely, and enjoy a few hours of proper British hospitality.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="How It Works"
                            subtitle="It's simple, secure, and much better than a locker."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "1. Book Your Spot",
                                    description: "Book a table for a meal and add 'Luggage' to the notes so we know you're coming.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "2. Safe & Secure",
                                    description: "We store your bags in a non-public area behind the bar or in our function room.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "3. Eat & Relax",
                                    description: "Enjoy a Sunday Roast, Fish & Chips, or a cold pint in the garden.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="info"
                            title="Capacity Note"
                            className="max-w-2xl mx-auto mt-8"
                            content={`We can accommodate most standard suitcases. If you have oversized items (surfboards, cycles etc), please call us first on ${CONTACT.phone} to check we have space.`}
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Why Choose Us Over Airport Lockers?"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-anchor-bg-raised p-6 rounded-xl border border-anchor-gold/15">
                                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">The Anchor</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center">Free storage for diners</li>
                                    <li className="flex items-center">Comfortable seating & WiFi</li>
                                    <li className="flex items-center">Great food & beer</li>
                                    <li className="flex items-center">Fresh air in the garden</li>
                                </ul>
                            </div>
                            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-red-400 mb-2">Airport Left Luggage</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center">Expensive per item fees</li>
                                    <li className="flex items-center">Busy queues</li>
                                    <li className="flex items-center">Nowhere to sit</li>
                                    <li className="flex items-center">Only fast food nearby</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Is it really free?",
                        answer: "Yes! If you are eating a main meal with us, we are happy to look after your bags for the duration of your stay plus a reasonable buffer time."
                    },
                    {
                        question: "Can I leave bags all day?",
                        answer: "We focus on storage while you are on the premises. If you need to leave bags and go into London, please contact us - we may charge a small fee for this service."
                    },
                    {
                        question: "How far are you from Terminal 5?",
                        answer: "We are about 5-7 minutes drive. It is a very quick taxi ride to the drop-off point."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Drop Your Bags, Pick Up a Pint"
                description="Book your table now and travel stress-free."
                buttons={[
                    {
                        text: "Book & Store",
                        href: `${CONTACT.phoneHref}`, // Using phone as booking link for now or the book widget
                        isPhone: true,
                        phoneSource: "luggage_cta",
                        variant: "primary"
                    },
                    {
                        text: "Get Directions",
                        href: "https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ",
                        variant: "white"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
