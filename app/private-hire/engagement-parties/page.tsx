import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, HEATHROW_TIMES, DRIVE_TIMES } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BrochureDownload } from '@/components/features/PrivateHire/BrochureDownload'
import { CateringPackagesCard } from '@/app/private-hire/_components/CateringPackagesCard'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { CELEBRATION_CAKE_WORDING, DECORATING_WORDING, PARKING_WORDING, PRIVATE_HIRE_DEPOSIT_WORDING, ROOM_HIRE_WORDING } from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'

const { diningRoom, mainArea, entirePub } = PRIVATE_HIRE_CAPACITY.spaces

export const metadata: Metadata = {
    title: 'Engagement Party Venue Near Heathrow',
    description: `Engagement party venue near Heathrow and Staines. Buffets, welcome prosecco and free parking at ${BRAND.name}. ${PRIVATE_HIRE_CAPACITY.recommendedRange}.`,
    openGraph: {
        title: 'Engagement Party Venue | The Anchor Stanwell Moor',
        description: 'She said yes! Now let\'s celebrate. Discover our engagement party packages with prosecco, buffets, and private areas.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Engagement Party Venue | The Anchor Stanwell Moor',
        description: 'She said yes! Now let\'s celebrate. Discover our engagement party packages with prosecco, buffets, and private areas.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/engagement-parties'
    }
}

export default function EngagementPartiesPage() {
    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/engagement-parties#venue",
        "name": `${BRAND.name} Engagement Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/engagement-parties",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": `Engagement party venue near Heathrow Airport with buffets, welcome prosecco and free parking. A private dining room (${diningRoom.seated} seated, ${diningRoom.standing} standing) and room for up to ${mainArea.standing} guests across the pub in Stanwell Moor, Surrey.`,
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
                crumb="Engagement Parties"
                title="Engagement Party Venue Near Heathrow, celebrate at The Anchor"
                lead={`Buffets, welcome prosecco, free parking, and a private dining room for up to ${diningRoom.standing} standing`}
                actions={
                    <>
                        <Button asChild variant="primary" size="lg" fullWidth>
                            <Link href="/private-hire#enquiry">
                                Enquire Now
                            </Link>
                        </Button>
                        <PhoneButton phone={CONTACT.phone} source="engagement_hero" variant="outline" size="lg">
                            Call {CONTACT.phone}
                        </PhoneButton>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4" as="h2" seo={{ structured: true, speakable: true }}>
                            Engagement Party Venue Near Heathrow & Staines
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Congratulations on your engagement! Whether you want a quiet family dinner to share the news or a big bash with all your friends, The Anchor is an engagement party venue near Heathrow with free parking and space for {PRIVATE_HIRE_CAPACITY.recommendedRange}. We&apos;re in Stanwell Moor, {HEATHROW_TIMES.terminal5} minutes from Terminal 5, and we handle the catering, the drinks, and the space, you just turn up and celebrate.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Why Couples Choose Us"
                            lead="We take the stress out of planning so you can focus on showing off the ring."
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { title: "Prosecco Packages", description: "Pre-order welcome drinks for your guests to start the night right." },
                                { title: "Flexible Buffets", description: "From finger food to hearty spreads, we cater to all budgets." },
                                { title: "Music & Atmosphere", description: "Bring your own playlist, or your own DJ or band." },
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
                            title="What's Included"
                            lead="Everything you need for your engagement party, nothing you don't."
                        />
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card><CardBody className="space-y-3">
                                <h3 className="font-display text-h4 text-ink-strong">The Venue</h3>
                                <ul className="space-y-2 text-ink-muted">
                                    <li><strong className="text-ink-strong">Room hire:</strong> {ROOM_HIRE_WORDING} Food and drink are on top, and you only pay for what you order.</li>
                                    <li><strong className="text-ink-strong">Dining room:</strong> {diningRoom.seated} seated, or up to {diningRoom.standing} standing. French doors open straight onto the beer garden in summer.</li>
                                    <li><strong className="text-ink-strong">Capacity:</strong> {PRIVATE_HIRE_CAPACITY.recommendedRange} across the pub. Smaller groups get a reserved area, or you can have the dining room to yourselves.</li>
                                    <li><strong className="text-ink-strong">Decorations welcome:</strong> Balloons, banners, table decorations, engagement signs, go for it. {DECORATING_WORDING}</li>
                                </ul>
                            </CardBody></Card>
                            <Card><CardBody className="space-y-3">
                                <h3 className="font-display text-h4 text-ink-strong">The Practical Bits</h3>
                                <ul className="space-y-2 text-ink-muted">
                                    <li><strong className="text-ink-strong">Free parking:</strong> {PARKING.capacity} spaces right outside the door. No meters, no time limits.</li>
                                    <li><strong className="text-ink-strong">{HEATHROW_TIMES.terminal5} minutes from Heathrow T5</strong>, handy if guests are flying in for the celebration.</li>
                                    <li><strong className="text-ink-strong">TVs and sound system:</strong> TVs and sound system available for slideshows or speeches.</li>
                                    <li><strong className="text-ink-strong">Deposit:</strong> {PRIVATE_HIRE_DEPOSIT_WORDING}</li>
                                    <li><strong className="text-ink-strong">Dedicated events coordinator</strong> to help with planning and on-the-day logistics.</li>
                                </ul>
                            </CardBody></Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Why a Pub Engagement Party?"
                            lead="More atmosphere, less hassle, and you'll actually enjoy it."
                        />
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center space-y-2">
                                <p className="font-display text-h3 text-accent-text">Quote on enquiry</p>
                                <p className="text-sm text-ink-muted">We confirm terms before you book</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-display text-h3 text-accent-text">Live pricing</p>
                                <p className="text-sm text-ink-muted">Buffet catering options</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-display text-h3 text-accent-text">{PARKING.capacity} free</p>
                                <p className="text-sm text-ink-muted">Parking spaces</p>
                            </div>
                        </div>
                        <div className="max-w-none text-ink-muted space-y-4">
                            <p>
                                Hotel function rooms are expensive. Home parties mean you&apos;re cleaning up at midnight. A pub engagement party gives you the atmosphere, the catering, and the bar, without the aftermath.
                            </p>
                            <p>
                                At The Anchor, your engagement party feels like a celebration, not a corporate event. Your guests can spread between the dining room and the beer garden and order from the bar at their own pace. A finish after 10pm is by arrangement, so tell us the times you have in mind.
                            </p>
                            <p>
                                We&apos;re a proper village pub in Stanwell Moor, not a chain venue. Our events coordinator works with you to get the details right, from the welcome prosecco to the food service timing, so you can focus on enjoying the night.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Tailored to You"
                        />

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card accent><CardBody className="space-y-4">
                                <h3 className="font-display text-h4 text-ink-strong">Intimate Gatherings</h3>
                                <p className="text-ink-muted">
                                    If you prefer something low-key, book a large table in our dining area. Enjoy our à la carte menu, great wines, and the cosy atmosphere of a traditional pub. Perfect for close family and best friends.
                                </p>
                                <ul className="list-disc pl-5 text-ink-muted space-y-2">
                                    <li>Reserved area for your group</li>
                                    <li>Full table service</li>
                                    <li>Decorations allowed (balloons/banners)</li>
                                </ul>
                            </CardBody></Card>
                            <Card accent><CardBody className="space-y-4">
                                <h3 className="font-display text-h4 text-ink-strong">Full Party Mode</h3>
                                <p className="text-ink-muted">
                                    Want to invite everyone? Our dining room holds up to {diningRoom.standing} standing, and exclusive hire of the whole pub covers up to {entirePub.standing} standing. We can arrange cleared space for dancing, buffet stations, and private access to the garden area in summer.
                                </p>
                                <ul className="list-disc pl-5 text-ink-muted space-y-2">
                                    <li>From a small group up to {entirePub.standing} standing with exclusive hire</li>
                                    <li>Buffet packages to suit all budgets</li>
                                    <li>Space for entertainment</li>
                                </ul>
                            </CardBody></Card>
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

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading title="Ready to start planning?" />
                        <p className="text-lg text-ink-muted mb-8">
                            Get in touch with our team to check availability and discuss your ideas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" variant="primary">
                                <Link href="/private-hire#enquiry">Enquire for Party</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/book-table">Book Table (Small Groups)</Link>
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>

            <BrochureDownload brochure="engagement" source="engagement_parties" />

            <PrivateBookingSection eventType="Other" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How much does an engagement party at The Anchor cost?",
                        answer: `Room hire is charged by the hour for the space you use, with catering and drinks on top, so you only pay for what you order. Buffets and welcome drinks are priced per person. ${PRIVATE_HIRE_DEPOSIT_WORDING} Use our pricing calculator on this page for an instant estimate, or call 01753 682707 for a personalised quote.`
                    },
                    {
                        question: "How many guests can you fit for an engagement party?",
                        answer: `Our private dining room seats ${diningRoom.seated}, or holds up to ${diningRoom.standing} standing. For larger engagement parties, there's room for up to ${mainArea.standing} across the pub. Groups of ${PRIVATE_HIRE_CAPACITY.recommendedRange} are our sweet spot.`
                    },
                    {
                        question: "Can we decorate the area?",
                        answer: `Absolutely. Bring balloons, banners, table decorations, engagement signs, whatever makes it feel like yours. ${DECORATING_WORDING}`
                    },
                    {
                        question: "Do you require a deposit?",
                        answer: "Yes. A £250 booking and damage deposit secures your date. It's held separately from your bill and refunded after the event, less any documented deductions."
                    },
                    {
                        question: "Can we bring a cake?",
                        answer: CELEBRATION_CAKE_WORDING
                    },
                    {
                        question: "Is there parking for engagement party guests?",
                        answer: PARKING_WORDING
                    },
                    {
                        question: "How far in advance should we book?",
                        answer: "Get in touch as soon as you have a date in mind and we'll tell you if it's free."
                    },
                    {
                        question: "Can we have music or a DJ?",
                        answer: "Yes. You can bring your own DJ or band, or a playlist to play through our sound system. Tell us what you're planning when you book."
                    },
                    {
                        question: "What food options are there?",
                        answer: "We offer buffets (sandwich, finger, burger, premium, and pizza options), or you can let guests order from the à la carte menu. For drinks, we can pour a welcome prosecco as your guests arrive, or set up a bar tab."
                    },
                    {
                        question: "Where is The Anchor?",
                        answer: `We're in Stanwell Moor, Surrey, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 and about ${DRIVE_TIMES.staines} minutes from Staines. Postcode for sat nav: TW19 6AQ. We're just off the M25 at Junction 14.`
                    }
                ]}
                className="bg-canvas"
            />
        </>
    )
}
