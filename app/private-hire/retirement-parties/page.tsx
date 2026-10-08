import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BrochureDownload } from '@/components/features/PrivateHire/BrochureDownload'
import { CateringPackagesCard } from '@/app/private-hire/_components/CateringPackagesCard'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { ACCESS_SHORT_WORDING, NO_ACCESSIBLE_TOILET_WORDING, ROOM_HIRE_WORDING, SLIDESHOW_WORDING } from '@/lib/approved-wording'

export const metadata: Metadata = {
    title: 'Retirement Party Venue Near Heathrow',
    description: `Give them a proper send-off. The Anchor is the ideal venue for retirement parties. Relaxed atmosphere, buffet options, and free parking.`,
    openGraph: {
        title: 'Retirement Parties at The Anchor',
        description: 'A dedicated lifetime of work deserves a dedicated celebration. Book your retirement party or leaving do with us.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Retirement Parties at The Anchor',
        description: 'A dedicated lifetime of work deserves a dedicated celebration. Book your retirement party or leaving do with us.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/retirement-parties'
    }
}

export default function RetirementPartiesPage() {
    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/retirement-parties#venue",
        "name": `${BRAND.name} Retirement Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/retirement-parties",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "A relaxed venue for retirement celebrations and leaving parties.",
        "potentialAction": {
            "@type": "CommunicateAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
                "actionPlatform": [
                    "https://schema.org/DesktopWebPlatform",
                    "https://schema.org/MobileWebPlatform"
                ]
            }
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([eventVenueSchema]) }}
            />

            <InteriorHero
                image={DEFAULT_CORPORATE_IMAGE}
                crumb="Retirement Parties"
                title="Retirement Parties & Leaving Dos"
                lead="A proper send-off for a lifetime of hard work"
                actions={
                    <>
                        <Button asChild variant="primary" size="lg" fullWidth>
                            <Link href="/private-hire#enquiry">
                                Enquire Now
                            </Link>
                        </Button>
                        <PhoneButton phone={CONTACT.phone} source="retirement_hero" variant="outline" size="lg">
                            Call {CONTACT.phone}
                        </PhoneButton>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4" as="h2" seo={{ structured: true, speakable: true }}>
                            Retirement Party & Leaving Do Venue Near Heathrow
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Whether it's a quiet lunch with the immediate team or a big evening bash with the whole company, The Anchor provides a warm, respectful, and relaxed setting to say "Thank You" and "Good Luck".
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Stress-Free Planning for Organisers"
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { title: "Speech Friendly", description: "Quiet areas available for speeches and presentations without shouting over music." },
                                { title: "Getting In and Around", description: `${ACCESS_SHORT_WORDING} ${NO_ACCESSIBLE_TOILET_WORDING}` },
                                { title: "Catering Options", description: "Buffets, unlimited tea and coffee, or a sit-down meal ordered from our menu." },
                            ].map(feature => (
                                <Card key={feature.title} accent className="h-full">
                                    <CardBody className="flex h-full flex-col gap-2">
                                        <h3 className="font-display text-h4 text-ink-strong">{feature.title}</h3>
                                        <p className="text-ink-muted">{feature.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Daytime or Evening?"
                        />

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card accent className="h-full">
                                <CardBody>
                                    <h3 className="font-display text-h4 text-ink-strong mb-2">The Long Lunch</h3>
                                    <p className="text-ink-muted">
                                        Popular for office leaving dos. Book a long table for Friday lunch, enjoy our classics (Fish & Chips, Pies), and let the afternoon drift by. We offer tab facilities for corporate cards.
                                    </p>
                                </CardBody>
                            </Card>
                            <Card accent className="h-full">
                                <CardBody>
                                    <h3 className="font-display text-h4 text-ink-strong mb-2">The Evening Do</h3>
                                    <p className="text-ink-muted">
                                        Invite partners and spouses for a proper celebration. Use our function area, enjoy a buffet, and perhaps a bit of music to see the retiree off in style.
                                    </p>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <CateringPackagesCard/>
                    </div>
                </Container>
            </section>

            <BrochureDownload brochure="retirement" source="retirement_parties" />

            <PrivateBookingSection eventType="Retirement Party" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How much does a retirement party at The Anchor cost?",
                        answer: `It depends on your guest count and catering choices. Use our pricing calculator on this page for an instant estimate, or call us on ${CONTACT.phone} for a personalised quote. ${ROOM_HIRE_WORDING}`
                    },
                    {
                        question: "Can we set up a tab?",
                        answer: "Yes, we can set up a bar tab with a limit or for specific drinks. We can provide a VAT receipt for company expenses."
                    },
                    {
                        question: "Can we show a slideshow?",
                        answer: `Yes. ${SLIDESHOW_WORDING}`
                    },
                    {
                        question: "How many people can you fit?",
                        answer: `Our dining room seats ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated}, or holds up to ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.standing} standing for a buffet and drinks. If you are expecting more, ask about the whole pub: exclusive hire covers up to ${PRIVATE_HIRE_CAPACITY.spaces.entirePub.seated} seated or ${PRIVATE_HIRE_CAPACITY.spaces.entirePub.standing} standing.`
                    }
                ]}
                className="bg-canvas"
            />

            <CtaBand
                title="Book a Proper Send-Off"
                copy="Contact us to check availability for your date."
                primary={
                    <Button asChild variant="primary" size="lg">
                        <Link href="/private-hire#enquiry">
                            Enquire Now
                        </Link>
                    </Button>
                }
                secondary={
                    <PhoneButton phone={CONTACT.phone} source="retirement_cta" variant="outline" size="lg">
                        Call Us
                    </PhoneButton>
                }
            />
        </>
    )
}
