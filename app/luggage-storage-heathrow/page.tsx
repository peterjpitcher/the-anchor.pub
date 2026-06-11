import Link from 'next/link'
import { Button, CTASection, SectionHeading, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Luggage Friendly Pub Near Heathrow | Bring Your Bags',
    description: `Visiting near Heathrow with luggage? You're welcome to bring your bags to ${BRAND.name}, we have plenty of space. Enjoy a meal just 7 mins from T5 with free parking.`,
    openGraph: {
        title: 'Luggage Friendly Pub Near Heathrow, Bring Your Bags to The Anchor',
        description: 'Visiting near Heathrow with luggage? Bring your bags with you and enjoy a proper British meal, 7 minutes from Terminal 5.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Luggage Friendly Pub Near Heathrow, Bring Your Bags to The Anchor',
        description: 'Visiting near Heathrow with luggage? Bring your bags with you and enjoy a proper British meal, 7 minutes from Terminal 5.',
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
        "name": "How to Visit The Anchor with Luggage",
        "description": "Enjoy a meal at The Anchor near Heathrow, you're welcome to bring your luggage with you.",
        "step": [
            {
                "@type": "HowToStep",
                "name": "Book a Table",
                "text": "Reserve a table for lunch or dinner. No need to mention luggage, just bring it along."
            },
            {
                "@type": "HowToStep",
                "name": "Arrive with Your Bags",
                "text": "Bring your luggage inside, we have plenty of space and you're welcome to keep it beside you."
            },
            {
                "@type": "HowToStep",
                "name": "Relax & Enjoy",
                "text": "Enjoy a proper meal without worrying about your bags. Much better than sitting on the airport floor."
            }
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([howToSchema]) }}
            />

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Luggage Storage"
        title="Luggage Friendly Pub Near Heathrow"
        lead="Visiting before or after a flight? Bring your luggage with you, we have plenty of space."
      />

            <section className="section-spacing-sm bg-anchor-green-card border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Hours to Kill Before Your Flight? Bring Your Bags to The Anchor
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Checking out of your hotel at 11am but your flight isn't until 8pm? Don't spend 9 hours sitting on a hard plastic chair at Terminal 5. Come to The Anchor and bring your luggage with you, we have plenty of space, and you're very welcome. Enjoy a few hours of proper British hospitality before you fly.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-deep border-t border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeading
                            title="How It Works"
                            subtitle="Simple, just bring your bags along."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "1. Book a Table",
                                    description: "Book a table for a meal, no need to mention luggage, just turn up with it.",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "2. Bring Your Bags",
                                    description: "Wheel your luggage right in, we have plenty of room and you can keep it beside you.",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "3. Eat & Relax",
                                    description: "Enjoy a Sunday Roast, Fish & Chips, or a cold pint in the garden.",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="info"
                            title="Good to Know"
                            className="max-w-2xl mx-auto mt-8"
                            content={`We can easily accommodate standard suitcases and cabin bags. If you have oversized items, please call us first on ${CONTACT.phone} and we'll do our best to help.`}
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-card border-t border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Why Wait at the Airport?"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-anchor-green-raised p-6 rounded-xl border border-anchor-gold-dark/15">
                                <h3 className="text-xl font-bold text-anchor-cream-text mb-2">The Anchor</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center">Luggage welcome, plenty of space</li>
                                    <li className="flex items-center">Comfortable seating & WiFi</li>
                                    <li className="flex items-center">Great food & beer</li>
                                    <li className="flex items-center">Fresh air in the garden</li>
                                </ul>
                            </div>
                            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-red-400 mb-2">Waiting at the Airport</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center">Hard plastic chairs</li>
                                    <li className="flex items-center">Overpriced food & drink</li>
                                    <li className="flex items-center">Crowded and noisy</li>
                                    <li className="flex items-center">Hours of boredom</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can I bring my luggage to the pub?",
                        answer: "Absolutely! You are very welcome to bring your luggage with you when visiting The Anchor. We have plenty of space, so just wheel your bags in and enjoy your meal."
                    },
                    {
                        question: "Is there enough room for suitcases?",
                        answer: "Yes, we are a spacious venue with lots of room. Standard suitcases and cabin bags are no problem at all. If you have particularly large or unusual items, give us a call and we will do our best to accommodate you."
                    },
                    {
                        question: "How far are you from Terminal 5?",
                        answer: "We are about 5-7 minutes drive. It is a very quick taxi ride to the drop-off point."
                    }
                ]}
                className="bg-anchor-green-card"
            />

            <CTASection
                title="Bring Your Bags, Grab a Bite"
                description="Book your table now, luggage is always welcome."
                buttons={[
                    {
                        text: "Book a Table",
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
