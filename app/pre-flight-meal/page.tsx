import Link from 'next/link'
import { SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { Button } from '@/components/ui/primitives/Button'
import { CtaBand } from '@/components/CtaBand'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, HEATHROW_TIMES } from '@/lib/constants'
import { LUGGAGE_WORDING, TAXI_WORDING } from '@/lib/approved-wording'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PhoneButton } from '@/components/PhoneButton'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Dining Near Heathrow T5 | Pre-Flight Meals',
    description: `Avoid the airline food! Enjoy a proper British meal at ${BRAND.name} before you fly. Authentic Fish & Chips, Burgers, and Draught Beer - we're just ${HEATHROW_TIMES.terminal5} mins from T5.`,
    openGraph: {
        title: 'The Last Proper Meal Before You Fly',
        description: 'Skip the airport sandwich. Enjoy authentic British pub food just minutes from your terminal.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Last Proper Meal Before You Fly',
        description: 'Skip the airport sandwich. Enjoy authentic British pub food just minutes from your terminal.',
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
        lead={`Authentic British food. Draught Beer. ${HEATHROW_TIMES.terminal5} Minutes from Terminal 5.`}
      />

            <AmenityStrip/>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Plane Food Can Wait"
                            lead="You're about to spend hours on a plane. Why start that journey hungry or with a terminal sandwich? Stop at The Anchor for a hearty, cooked-to-order meal that will keep you satisfied halfway across the Atlantic."
                        />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            kicker="A taste of Britain before you leave"
                            title="British Classics Done Right"
                            lead="Visitors from all over the world stop here for a taste of Britain before they leave."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Fish & Chips', description: 'Freshly battered cod, chunky chips, and mushy peas. A classic British goodbye.' },
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
                    <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-h3 mb-4 text-ink-strong">Timing is Everything</h2>
                            <p className="mb-4 text-ink-muted">
                                We know you have a flight to catch. Check your airline&apos;s advice on when to be at the terminal, and leave yourself time for traffic and security.
                            </p>
                            <Card accent>
                                <CardBody className="p-4">
                                    <p className="font-semibold text-ink-strong">Journey times by car:</p>
                                    <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                                        <li>Terminal 5: {HEATHROW_TIMES.terminal5} mins</li>
                                        <li>Terminal 4: {HEATHROW_TIMES.terminal4} mins</li>
                                        <li>Terminal 2 & 3: {HEATHROW_TIMES.terminal2} mins</li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </div>
                        <Card accent>
                            <CardBody className="text-center">
                                <h2 className="font-display text-h3 mb-4 text-ink-strong">Taxis</h2>
                                <p className="mb-6 text-ink">
                                    Need a ride to the terminal? {TAXI_WORDING}
                                </p>
                                <PhoneButton phone={CONTACT.phone} source="preflight_taxi_info" variant="outline" wrap>
                                    Call the Pub
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
                        answer: `Yes. ${LUGGAGE_WORDING}`
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
