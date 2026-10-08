import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, DRIVE_TIMES } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import {
    COACH_PARKING_WORDING,
    GROUP_DEPOSIT_WORDING,
    PRIVATE_HIRE_DEPOSIT_WORDING,
    ROOM_HIRE_WORDING,
} from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { bookingConfig } from '@/lib/booking-config'

import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

/*
 * Everything on this page is docs/SSOT.md: coach parking is section 8 (a small
 * coach fits, a full-size coach parks on the main road), group bookings and the
 * deposit are section 7, private hire is section 11. Nothing else about coach
 * groups is on record (no perk for the driver, no group meal offer, no
 * pre-order deadline, no larger seated capacity), so nothing else is claimed.
 */
const MAX_TABLE = bookingConfig.maxOnlinePartySize
const SOCIAL_DESCRIPTION = `Bringing a group near Heathrow? Book a table for up to ${MAX_TABLE}, or ask about private hire for a bigger group.`

export const metadata: Metadata = {
    title: 'Pub With Coach Parking Near Heathrow | Group Bookings',
    description: `Coach group near Heathrow? ${COACH_PARKING_WORDING} Book a table at ${BRAND.name} for up to ${MAX_TABLE}, or hire a space for a bigger group.`,
    openGraph: {
        title: 'Coach Parties Welcome at The Anchor',
        description: SOCIAL_DESCRIPTION,
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Coach Parties Welcome at The Anchor',
        description: SOCIAL_DESCRIPTION,
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
        title="Pub with Coach Parking Near Heathrow"
        lead={`Tables for up to ${MAX_TABLE}, and private hire for bigger groups.`}
      />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4">
                            A Pub Stop for Your Coach Group
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Need a pub near Heathrow for a coach group? {COACH_PARKING_WORDING} You can book a table for up to {MAX_TABLE} online. A bigger group is a private hire: our dining room seats {PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated}, and the garden or the whole pub can be hired too.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Parking and Booking"
                            lead={`${DRIVE_TIMES.m25Junction14} minutes from M25 Junction 14.`}
                        />
                        <div className="grid md:grid-cols-2 gap-5">
                            <Card accent>
                                <CardBody className="p-5">
                                    <h3 className="text-lg font-semibold text-ink-strong">Coach Parking</h3>
                                    <p className="mt-2 text-sm text-ink-muted">{COACH_PARKING_WORDING} It depends on what&apos;s free when you arrive.</p>
                                </CardBody>
                            </Card>
                            <Card accent>
                                <CardBody className="p-5">
                                    <h3 className="text-lg font-semibold text-ink-strong">Booking Your Group</h3>
                                    <p className="mt-2 text-sm text-ink-muted">
                                        Book a table for up to {MAX_TABLE} online. {GROUP_DEPOSIT_WORDING} More than {MAX_TABLE} of you? That&apos;s a private hire, so call us on {CONTACT.phone}.
                                    </p>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading
                            title="Food for Your Group"
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card accent>
                                <CardBody className="p-6">
                                    <h3 className="font-bold text-lg mb-2 text-ink-strong">At a Table</h3>
                                    <p className="text-ink-muted text-sm">
                                        Order from our <Link href="/food-menu" className="underline">food menu</Link>, with roasts on Sundays from 1pm to 6pm. The kitchen is closed on Mondays.
                                    </p>
                                </CardBody>
                            </Card>
                            <Card accent>
                                <CardBody className="p-6">
                                    <h3 className="font-bold text-lg mb-2 text-ink-strong">Private Hire</h3>
                                    <p className="text-ink-muted text-sm">
                                        Buffet menus, their prices and their minimum numbers are on the <Link href="/private-hire" className="underline">private hire page</Link>.
                                    </p>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can a coach park at The Anchor?",
                        answer: COACH_PARKING_WORDING
                    },
                    {
                        question: "Do we need to book in advance?",
                        answer: "Yes, please. Book ahead so we can have your tables ready."
                    },
                    {
                        question: "Is there a maximum group size?",
                        answer: `You can book a table for up to ${MAX_TABLE} online. ${GROUP_DEPOSIT_WORDING} A group of more than ${MAX_TABLE} is a private hire: our dining room seats ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated}, and the garden or the whole pub can be hired too. Call us on ${CONTACT.phone}.`
                    },
                    {
                        question: "What does private hire cost?",
                        answer: `${ROOM_HIRE_WORDING} ${PRIVATE_HIRE_DEPOSIT_WORDING}`
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Plan Your Stop"
                copy="Call us to plan your coach stop and table."
            >
                <PhoneButton phone={CONTACT.phone} source="coach_cta" variant="primary" size="lg">
                    Call Us
                </PhoneButton>
                <Button asChild variant="outline" size="lg">
                    <Link href={`mailto:${CONTACT.email}`}>Email Us</Link>
                </Button>
            </CtaBand>
        </>
    )
}
