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
    description: `${BRAND.name} welcomes coach groups of up to 20 near Heathrow. Large car park, group menus, and a free driver meal for groups over 15.`,
    openGraph: {
        title: 'Coach Parties Welcome at The Anchor',
        description: 'Looking for a tour stop? We welcome coach groups of up to 20, offer group menus, and give the driver a free meal for groups over 15.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Coach Parties Welcome at The Anchor',
        description: 'Looking for a tour stop? We welcome coach groups of up to 20, offer group menus, and give the driver a free meal for groups over 15.',
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
        lead="Coach groups up to 20, group food, and a free driver meal for groups over 15."
      />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4">
                            The Perfect Stop for Tour Groups
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Need a pub near Heathrow for a coach group? The Anchor has a large, accessible car park, space for groups of up to 20 to sit together, and menus that can be planned around your schedule. Parking is dependent on availability, and we cannot reserve spaces, so we recommend arriving early. Our private dining room can fit up to 26 people. Larger groups of around 50 can be hosted across the pub, but they would be spread between areas rather than seated all together.
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
                            <Card className="p-6 shadow-lg">
                                <h3 className="text-2xl font-bold mb-2 text-ink-strong"> The Driver Deal</h3>
                                <p className="mb-4 text-ink">Bring a group of more than 15 people for a main meal, and the driver gets:</p>
                                <ul className="space-y-2 font-medium text-ink">
                                    <li> A free main meal</li>
                                    <li> Free soft drinks or coffee</li>
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
                                        <p className="mt-2 text-sm text-ink-muted">Parking is dependent on availability, and we cannot reserve spaces. Please arrive early, especially at busy times.</p>
                                    </CardBody>
                                </Card>
                                <Card accent>
                                    <CardBody className="p-5">
                                        <h3 className="text-lg font-semibold text-ink-strong">Quick Turnaround</h3>
                                        <p className="mt-2 text-sm text-ink-muted">Pre-orders are needed 7 days before your visit to help us keep your group on schedule.</p>
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
                        answer: "For coaches, yes, absolutely. We need advance notice so we can prepare staff and tables for your group. Parking is dependent on availability, and we cannot reserve spaces, so we recommend arriving early."
                    },
                    {
                        question: "Is there a maximum group size?",
                        answer: "Coach groups of up to 20 can sit together. Our private dining room can fit up to 26 people. Groups of around 50 can be hosted, but they would be spread across the pub rather than seated all together."
                    },
                    {
                        question: "How do we pre-order?",
                        answer: "Email us your numbers and requirements 7 days before your visit, and we will have everything ready to go when you pull in."
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Plan Your Stop"
                copy="Call us today to plan your coach stop and table."
            >
                <PhoneButton phone={CONTACT.phone} source="coach_cta" variant="primary" size="lg">
                    Call Us
                </PhoneButton>
                <Link href="mailto:manager@the-anchor.pub">
                    <Button variant="outline" size="lg">Email Us</Button>
                </Link>
            </CtaBand>
        </>
    )
}
