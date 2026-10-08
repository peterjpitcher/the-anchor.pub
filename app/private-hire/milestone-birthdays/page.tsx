import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
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
import { PARKING_WORDING, ROOM_HIRE_WORDING } from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'

export const metadata: Metadata = {
    title: 'Birthday Party Venue Near Heathrow | 30th, 40th, 50th Parties',
    description: 'Birthday party venue near Heathrow for 21st, 30th, 40th & 50th celebrations. A pub with private room hire, buffets, and free parking in Surrey.',
    openGraph: {
        title: 'Birthday Party Venue Near Heathrow | The Anchor',
        description: 'Birthday party pub near Heathrow with private room hire for 30th, 40th & 50th celebrations. Free parking and catering packages.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Birthday Party Venue Near Heathrow | The Anchor',
        description: 'Birthday party pub near Heathrow with private room hire for 30th, 40th & 50th celebrations. Free parking and catering packages.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/milestone-birthdays'
    }
}

export default function MilestoneBirthdaysPage() {
    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/milestone-birthdays#venue",
        "name": `${BRAND.name} Party Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/milestone-birthdays",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "Birthday party venue near Heathrow Airport for milestone celebrations. Private room hire for 21st, 30th, 40th, and 50th birthday parties with catering.",
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
                crumb="Milestone Birthdays"
                title="Birthday Party Venue Near Heathrow: 21st to 50th Celebrations"
                lead="A pub birthday party venue with private rooms and catering. Celebrate the big numbers in style near Staines and Heathrow Airport."
                actions={
                    <>
                        <Button asChild variant="primary" size="lg" fullWidth>
                            <Link href="/private-hire#enquiry">
                                Plan My Party
                            </Link>
                        </Button>
                        <PhoneButton phone={CONTACT.phone} source="birthday_hero" variant="outline" size="lg">
                            Call {CONTACT.phone}
                        </PhoneButton>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4" as="h2" seo={{ structured: true, speakable: true }}>
                            Birthday Party Venue Near Heathrow &amp; Staines: 21st, 30th, 40th, 50th
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            You only turn 30 (or 40, or 50) once. Make it count. The Anchor is a birthday party pub in Stanwell Moor with birthday party room hire for {PRIVATE_HIRE_CAPACITY.recommendedRange}, buffet packages, and free parking. You pay for room hire by the hour and for the food and drink you order. Whether you want to bring a DJ or have a quiet dinner with your closest friends, tell us and we&apos;ll set it up.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Everything You Need for a Great Bash"
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { title: "Bring Your Own Music", description: "Bring your own DJ or band, or play a playlist through our sound system." },
                                { title: "Hearty Buffets", description: "Keep your guests fuelled with finger, burger or pizza buffets." },
                                { title: "Easy Access", description: PARKING_WORDING },
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
                        <h2 className="font-display text-h2 text-center mb-12 text-ink-strong">Choose Your Party Style</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Card hover className="h-full">
                                <CardBody>
                                    <h3 className="font-display text-h4 mb-2 text-ink-strong">The Garden Party</h3>
                                    <p className="text-ink-muted mb-4">Perfect for summer birthdays. Reserve an area of our beer garden, order a buffet, and enjoy the sunshine.</p>
                                    <span className="text-sm font-semibold text-accent-text">Great for 21sts & 30ths</span>
                                </CardBody>
                            </Card>

                            <Card hover className="h-full">
                                <CardBody>
                                    <h3 className="font-display text-h4 mb-2 text-ink-strong">The Big Bash</h3>
                                    <p className="text-ink-muted mb-4">For a bigger party, ask about the whole pub. You can bring your own DJ or band. A finish after 10pm is by arrangement.</p>
                                    <span className="text-sm font-semibold text-accent-text">Best for 40ths & 50ths</span>
                                </CardBody>
                            </Card>

                            <Card hover className="h-full">
                                <CardBody>
                                    <h3 className="font-display text-h4 mb-2 text-ink-strong">The Dinner Party</h3>
                                    <p className="text-ink-muted mb-4">Sit-down meal with 10-20 of your closest friends. Pre-order from our main menu.</p>
                                    <span className="text-sm font-semibold text-accent-text">Perfect for 60ths+</span>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <h2 className="font-display text-h2 text-center mb-8 text-ink-strong">Birthday Party Venue by Age</h2>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">21st Birthday Venue</h3>
                                <p className="text-ink-muted">
                                    A 21st is the first big one worth celebrating properly. Our beer garden works brilliantly for summer 21sts, reserve an area, order a buffet, and let the evening unfold naturally.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">30th Birthday Party Venue Near Heathrow</h3>
                                <p className="text-ink-muted">
                                    Turning 30 deserves more than drinks at a chain bar. Our dining room seats {PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated} for a sit-down meal, or go for a burger buffet and bring your own DJ. You pay for room hire by the hour and for the food and drink you order. Read our <Link href="/blog/30th-birthday-party-ideas-venues" className="text-accent-text hover:underline font-semibold">30th birthday party ideas</Link> for inspiration.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">40th Birthday Party Venue</h3>
                                <p className="text-ink-muted">
                                    The big four-oh is when parties get good, people know what they like, and the crowd is always up for it. Think premium buffet, welcome drinks and your own DJ. See our <Link href="/blog/40th-birthday-party-ideas-venues" className="text-accent-text hover:underline font-semibold">40th birthday party ideas</Link> guide.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">50th Birthday Party Venue Near Staines</h3>
                                <p className="text-ink-muted">
                                    Half a century calls for a proper celebration. Start with afternoon tea or a sit-down dinner, then carry on into an evening party with music and drinks. The dining room works well for a more elegant feel, with French doors opening onto the garden in warmer months. Browse our <Link href="/blog/50th-birthday-party-ideas-venues" className="text-accent-text hover:underline font-semibold">50th birthday party ideas</Link> for more.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">60th &amp; Beyond</h3>
                                <p className="text-ink-muted">
                                    60th, 70th, and 80th birthdays tend to be more intimate, a long table, a great meal, and the people who matter most. We can set a private dining area for 10&ndash;20 guests with food ordered from our menu. The atmosphere is warm without being fussy, and there&apos;s no pressure to rush. See our <Link href="/blog/60th-birthday-party-ideas-venues" className="text-accent-text hover:underline font-semibold">60th birthday party ideas</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="mx-auto">
                        <CateringPackagesCard/>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <Card accent className="mx-auto text-center">
                        <CardBody>
                            <h3 className="font-display text-h3 mb-4 text-ink-strong">Planning a Surprise Party?</h3>
                            <p className="text-ink-muted mb-6">
                                We love being in on the secret! Let us know when you book, and we can help coordinate the arrival, hiding spots, and the big "SURPRISE!" moment.
                            </p>
                            <PhoneButton phone={CONTACT.phone} source="birthday_surprise" variant="primary">shhh! Call to Plan</PhoneButton>
                        </CardBody>
                    </Card>
                </Container>
            </section>

            <BrochureDownload brochure="birthdays" source="milestone_birthdays" />

            <PrivateBookingSection eventType="Birthday Party" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How much does a milestone birthday party at The Anchor cost?",
                        answer: `It depends on your guest count and catering choices. Use our pricing calculator on this page for an instant estimate, or call us on ${CONTACT.phone} for a personalised quote. ${ROOM_HIRE_WORDING}`
                    },
                    {
                        question: "Do you host 18th birthday parties?",
                        answer: `Call us first on ${CONTACT.phone} to talk it through.`
                    },
                    {
                        question: "What time can the party go on until?",
                        answer: "An evening private hire can run later than 10pm, by arrangement. Tell us the finishing time you have in mind when you book."
                    },
                    {
                        question: "Can we set up early?",
                        answer: "Tell us when you'd like to set up and we'll agree it."
                    }
                ]}
                className="bg-canvas"
            />
        </>
    )
}
