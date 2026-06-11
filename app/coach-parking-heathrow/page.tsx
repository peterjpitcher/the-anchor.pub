import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { InteriorHero } from '@/components/hero'
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

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Coach Parking"
        title="Coach Parties Welcome"
        lead="Ample parking, great group food, and the driver eats on us."
      />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4">
                            The Perfect Stop for Tour Groups
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Finding a pub near Heathrow that can handle a 50-seater coach is rare. finding one with great food is even rarer! The Anchor has a large, accessible car park and the capacity to feed hungry tour groups quickly and deliciously.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="order-2 md:order-1">
                            <SectionHeading
                                title="Driver Perks"
                                lead="We know the driver works the hardest."
                                align="left"
                            />
                            <Card variant="dark" className="theme-dark p-6 shadow-lg">
                                <h3 className="text-2xl font-bold mb-2 text-anchor-cream-text"> The Driver Deal</h3>
                                <p className="mb-4 text-anchor-cream-text/85">Bring a group of 15+ passengers for a main meal, and the driver gets:</p>
                                <ul className="space-y-2 font-medium text-anchor-cream-text/85">
                                    <li> A Free Main Meal</li>
                                    <li> Free Soft Drinks / Coffee</li>
                                    <li> A quiet spot to rest if needed</li>
                                </ul>
                            </Card>
                        </div>
                        <div className="order-1 md:order-2">
                            <SectionHeading
                                title="Logistics"
                                lead="Easy access just off the M25."
                                align="left"
                            />
                            <div className="flex flex-col gap-4">
                                <Card accent>
                                    <CardBody className="p-5">
                                        <h3 className="text-lg font-semibold text-ink-strong">Large Car Park</h3>
                                        <p className="mt-2 text-sm text-ink-muted">No tight squeezes. Our open lot allows for easy entry and exit for large vehicles.</p>
                                    </CardBody>
                                </Card>
                                <Card accent>
                                    <CardBody className="p-5">
                                        <h3 className="text-lg font-semibold text-ink-strong">Quick Turnaround</h3>
                                        <p className="mt-2 text-sm text-ink-muted">Pre-order available for groups to ensure you stay on schedule.</p>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeading
                            title="Group Dining Options"
                            lead="We can tailor a menu to suit your budget and time constraints."
                        />

                        <div className="grid md:grid-cols-3 gap-6">
                            <Card accent>
                                <CardBody className="p-6">
                                    <h4 className="font-bold text-lg mb-2 text-ink-strong">Quick & Easy</h4>
                                    <p className="text-ink-muted text-sm">Fish & Chips or Burger & Drink deals. Served fast.</p>
                                </CardBody>
                            </Card>
                            <Card accent>
                                <CardBody className="p-6">
                                    <h4 className="font-bold text-lg mb-2 text-ink-strong">Buffet Spread</h4>
                                    <p className="text-ink-muted text-sm">Self-service hot and cold buffet for casual dining.</p>
                                </CardBody>
                            </Card>
                            <Card accent>
                                <CardBody className="p-6">
                                    <h4 className="font-bold text-lg mb-2 text-ink-strong">Cream Tea</h4>
                                    <p className="text-ink-muted text-sm">Scones, tea, and sandwiches for afternoon stops.</p>
                                </CardBody>
                            </Card>
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
                className="bg-surface"
            />

            <CtaBand
                title="Plan Your Stop"
                copy="Call us today to book your coach parking and table."
            >
                <PhoneButton phone={CONTACT.phone} source="coach_cta" variant="primary" size="lg">
                    Call Us
                </PhoneButton>
                <Link href="mailto:info@the-anchor.pub">
                    <Button variant="outline" size="lg">Email Us</Button>
                </Link>
            </CtaBand>
        </>
    )
}
