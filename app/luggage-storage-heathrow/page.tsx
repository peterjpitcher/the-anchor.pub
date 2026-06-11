import Link from 'next/link'
import { SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { Button } from '@/components/ui/primitives/Button'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

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

            <AmenityStrip />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Hours to Kill Before Your Flight? Bring Your Bags to The Anchor"
                            lead="Checking out of your hotel at 11am but your flight isn't until 8pm? Don't spend 9 hours sitting on a hard plastic chair at Terminal 5. Come to The Anchor and bring your luggage with you, we have plenty of space, and you're very welcome. Enjoy a few hours of proper British hospitality before you fly."
                        />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            kicker="Simple, just bring your bags along"
                            title="How It Works"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: '1. Book a Table', description: 'Book a table for a meal, no need to mention luggage, just turn up with it.' },
                                { title: '2. Bring Your Bags', description: 'Wheel your luggage right in, we have plenty of room and you can keep it beside you.' },
                                { title: '3. Eat & Relax', description: 'Enjoy a Sunday Roast, Fish & Chips, or a cold pint in the garden.' }
                            ].map(feature => (
                                <Card key={feature.title} accent hover>
                                    <CardBody>
                                        <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                                        <p className="text-ink-muted">{feature.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        <Card accent className="max-w-2xl mx-auto mt-8">
                            <CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-2">Good to Know</h3>
                                <p className="text-ink-muted">{`We can easily accommodate standard suitcases and cabin bags. If you have oversized items, please call us first on ${CONTACT.phone} and we'll do our best to help.`}</p>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Why Wait at the Airport?"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card accent>
                                <CardBody>
                                    <h3 className="font-display text-h4 text-ink-strong mb-2">The Anchor</h3>
                                    <ul className="space-y-3 text-ink">
                                        <li>Luggage welcome, plenty of space</li>
                                        <li>Comfortable seating & WiFi</li>
                                        <li>Great food & beer</li>
                                        <li>Fresh air in the garden</li>
                                    </ul>
                                </CardBody>
                            </Card>
                            <Card className="border-anchor-danger/30">
                                <CardBody>
                                    <h3 className="font-display text-h4 text-anchor-danger mb-2">Waiting at the Airport</h3>
                                    <ul className="space-y-3 text-ink-muted">
                                        <li>Hard plastic chairs</li>
                                        <li>Overpriced food & drink</li>
                                        <li>Crowded and noisy</li>
                                        <li>Hours of boredom</li>
                                    </ul>
                                </CardBody>
                            </Card>
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
                className="bg-surface"
            />

            <CtaBand
                title="Bring Your Bags, Grab a Bite"
                copy="Book your table now, luggage is always welcome."
                primary={<PhoneButton phone={CONTACT.phone} source="luggage_cta" variant="primary" size="lg">Book a table</PhoneButton>}
                secondary={
                    <Button asChild variant="outline" size="lg">
                        <Link href="https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ">Get directions</Link>
                    </Button>
                }
            />
        </>
    )
}
