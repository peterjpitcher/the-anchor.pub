import Link from 'next/link'
import { SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { Button } from '@/components/ui/primitives/Button'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PhoneButton } from '@/components/PhoneButton'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Dining Near Heathrow T5 | Best Pre-Flight Meal',
    description: `Avoid the airline food! Enjoy a proper British meal at ${BRAND.name} before you fly. Authentic Fish & Chips, Burgers, and Draught Beer - we're just 7 mins from T5.`,
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
    return (
        <>

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Pre-Flight Meal"
        title="Your Last Proper Meal Before Flying"
        lead="Authentic British food. Draught Beer. 5 Minutes from Terminal 5."
      />

            <AmenityStrip />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Plane Food Can Wait"
                            lead="You're about to spend hours on a plane. Why start that journey hungry or disappointed by an overpriced terminal sandwich? Stop at The Anchor for a hearty, cooked-to-order meal that will keep you satisfied halfway across the Atlantic."
                        />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            kicker="A taste of Britain before you leave"
                            title="British Classics Done Right"
                            lead="Visitors from all over the world stop here for a taste of Britain before they leave."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Fish & Chips', description: 'Freshly battered cod, chunky chips, and mushy peas. The ultimate British goodbye.' },
                                { title: 'Gourmet Burgers', description: 'Stacked high and served with chips. Perfect comfort food for travel.' },
                                { title: 'Beef & Ale Pie', description: 'Proper pastry, tender meat, and rich gravy. It beats a foil tray meal any day.' }
                            ].map(feature => (
                                <Card key={feature.title} accent hover>
                                    <CardBody>
                                        <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                                        <p className="text-ink-muted">{feature.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-h3 mb-4 text-ink-strong">Timing is Everything</h2>
                            <p className="mb-4 text-ink-muted">
                                We know you have a flight to catch. Our service is friendly but efficient. Let us know your timeline when you arrive, and we'll make sure you're fed and watered with plenty of time to get to the gate.
                            </p>
                            <Card accent>
                                <CardBody className="p-4">
                                    <p className="font-semibold text-ink-strong">Estimated Taxi Times:</p>
                                    <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                                        <li>Terminal 5: 5-7 mins</li>
                                        <li>Terminal 4: 10-12 mins</li>
                                        <li>Terminal 2 & 3: 10-12 mins</li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </div>
                        <Card accent>
                            <CardBody className="text-center">
                                <h2 className="font-display text-h3 mb-4 text-ink-strong">Taxi Service</h2>
                                <p className="mb-6 text-ink">
                                    Need a ride to the terminal? We have direct numbers for reliable local taxi firms who know exactly where we are and which drop-off zone you need.
                                </p>
                                <PhoneButton phone={CONTACT.phone} source="preflight_taxi_info" variant="outline">
                                    Check Taxi Availability
                                </PhoneButton>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do I need to book?",
                        answer: "We highly recommend booking, especially for dinner or Sunday Roast. We hate turning hungry travellers away!"
                    },
                    {
                        question: "Is there a kids menu?",
                        answer: "Yes, we have smaller portions and family favourites (sausages and fish fingers) to keep the little ones happy."
                    },
                    {
                        question: "Can I bring my luggage inside?",
                        answer: "Yes! We are very luggage friendly. We have ample space to stow suitcases safely while you eat."
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Fuel Up Before You Fly"
                copy="Book a table and start your holiday early."
                primary={<PhoneButton phone={CONTACT.phone} source="preflight_cta" variant="primary" size="lg">Book now</PhoneButton>}
                secondary={
                    <Button asChild variant="outline" size="lg">
                        <Link href="/food-menu">See the menu</Link>
                    </Button>
                }
            />
        </>
    )
}
