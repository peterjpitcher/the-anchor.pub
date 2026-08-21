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

export const metadata: Metadata = {
    title: 'Anniversary Party Venue Near Heathrow',
    description: `Anniversary party venue near Heathrow and Staines. A private dining room for 10 to 150 guests, buffet catering and free parking at ${BRAND.name}.`,
    openGraph: {
        title: 'Anniversary Party Venue | The Anchor Stanwell Moor',
        description: 'Celebrate a milestone anniversary at The Anchor. Private dining room, catering handled, free parking, and a dog-friendly garden seven minutes from Heathrow.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Anniversary Party Venue | The Anchor Stanwell Moor',
        description: 'Celebrate a milestone anniversary at The Anchor. Private dining room, catering handled, free parking, and a dog-friendly garden seven minutes from Heathrow.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: './'
    }
}

export default function AnniversaryPartiesPage() {
    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/anniversary-parties#venue",
        "name": `${BRAND.name} Anniversary Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/anniversary-parties",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "Anniversary party venue near Heathrow Airport with a private dining room for 10+ to 150 guests, buffets and drinks at live prices, and free parking. Room hire and terms quoted on enquiry. Stanwell Moor, Surrey.",
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify([eventVenueSchema]) }}
            />

            <InteriorHero
                image={DEFAULT_CORPORATE_IMAGE}
                crumb="Anniversary Parties"
                title="Anniversary Party Venue Near Heathrow, celebrate at The Anchor"
                lead="A private dining room for 10+ to 150 guests, catering and drinks handled, and free parking, seven minutes from Heathrow"
                actions={
                    <>
                        <Link href="/private-hire#enquiry">
                            <Button variant="primary" size="lg" fullWidth>
                                Enquire Now
                            </Button>
                        </Link>
                        <PhoneButton phone={CONTACT.phone} source="anniversary_hero" variant="outline" size="lg">
                            Call {CONTACT.phone}
                        </PhoneButton>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4" as="h2" seo={{ structured: true, speakable: true }}>
                            Anniversary Party Venue Near Heathrow &amp; Staines
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Whether you are marking a wedding anniversary, a ruby or golden milestone, or simply another year together, The Anchor is an anniversary party venue near Heathrow with free parking and room for 10+ to 150 guests. Seven minutes from Terminal 5 in Stanwell Moor, we handle the catering, the drinks, and the space, so you can spend the day with the people who matter rather than running the event.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Why Celebrate Your Anniversary Here"
                            lead="We take the planning off your plate so the day feels like a celebration, not a project."
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { title: "Intimate or Large", description: "An anniversary dinner for close family, or a bigger party with friends, the room flexes to suit." },
                                { title: "Catering Handled", description: "From a relaxed buffet to a sit-down meal, we cater to all tastes and budgets." },
                                { title: "Garden & Atmosphere", description: "French doors open onto a dog-friendly beer garden, lovely for summer toasts and photos." },
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
                            lead="Everything you need for your anniversary celebration, nothing you don't."
                        />
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card><CardBody className="space-y-3">
                                <h3 className="font-display text-h4 text-ink-strong">The Venue</h3>
                                <ul className="space-y-2 text-ink-muted">
                                    <li><strong className="text-ink-strong">Room hire:</strong> a hire fee covers your space and varies by day and party size. We confirm the fee and full terms when you enquire.</li>
                                    <li><strong className="text-ink-strong">Dining room:</strong> 26 seated, or up to 50 standing. French doors open straight onto the beer garden in summer.</li>
                                    <li><strong className="text-ink-strong">Capacity:</strong> 10+ to 150 guests. Smaller groups get a reserved area; larger parties get the dining room to yourselves.</li>
                                    <li><strong className="text-ink-strong">Decorations welcome:</strong> Balloons, banners, table photos, anniversary signs, bring them along. We just ask for no confetti or glitter.</li>
                                </ul>
                            </CardBody></Card>
                            <Card><CardBody className="space-y-3">
                                <h3 className="font-display text-h4 text-ink-strong">The Practical Bits</h3>
                                <ul className="space-y-2 text-ink-muted">
                                    <li><strong className="text-ink-strong">Free parking:</strong> 20 spaces right outside the door. No meters, no time limits.</li>
                                    <li><strong className="text-ink-strong">7 minutes from Heathrow T5</strong>, handy if family are flying in for the occasion.</li>
                                    <li><strong className="text-ink-strong">AV equipment:</strong> TVs and a sound system for slideshows of the years gone by, or a few words and a toast.</li>
                                    <li><strong className="text-ink-strong">Deposit:</strong> &pound;250 to secure your date, deducted from the final bill.</li>
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
                            title="Why a Pub Anniversary Party?"
                            lead="More warmth, less hassle, and a day you will actually enjoy."
                        />
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center space-y-2">
                                <p className="font-display text-h3 text-accent-text">Quote on enquiry</p>
                                <p className="text-sm text-ink-muted">We confirm hire and terms before you book</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-display text-h3 text-accent-text">10+ to 150</p>
                                <p className="text-sm text-ink-muted">Guests, intimate dinner to full party</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-display text-h3 text-accent-text">20 free</p>
                                <p className="text-sm text-ink-muted">Parking spaces outside the door</p>
                            </div>
                        </div>
                        <div className="max-w-none text-ink-muted space-y-4">
                            <p>
                                Hotel function rooms feel formal and the bill adds up quickly. A party at home means you are cooking, hosting, and clearing up well past midnight on your own anniversary. A pub gives you the atmosphere, the catering, and the bar, without the aftermath.
                            </p>
                            <p>
                                At The Anchor, an anniversary feels like a proper celebration rather than a corporate booking. Guests can spread between the dining room and the beer garden, order from the bar at their own pace, and stay as late as the evening takes them. There is no ticking clock and no room turnover pressure.
                            </p>
                            <p>
                                We are a genuine village pub in Stanwell Moor, not a chain venue. Our events coordinator works with you on the details, from the welcome drinks to the timing of the food, so you can relax and enjoy the day you are marking.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Tailored to Your Anniversary"
                        />

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card accent><CardBody className="space-y-4">
                                <h3 className="font-display text-h4 text-ink-strong">An Intimate Anniversary Dinner</h3>
                                <p className="text-ink-muted">
                                    If you would rather keep it small, book a large table in our dining room. Enjoy the menu, a good bottle of wine, and the warm, unhurried feel of a traditional pub. Perfect for the two of you with close family and best friends.
                                </p>
                                <ul className="list-disc pl-5 text-ink-muted space-y-2">
                                    <li>Reserved area for your group</li>
                                    <li>Full table service</li>
                                    <li>Decorations allowed (balloons and banners)</li>
                                </ul>
                            </CardBody></Card>
                            <Card accent><CardBody className="space-y-4">
                                <h3 className="font-display text-h4 text-ink-strong">A Larger Celebration</h3>
                                <p className="text-ink-muted">
                                    Want to gather everyone for a big milestone? Our dining room hosts larger anniversary parties, with the bar on hand and the garden open in summer. We can arrange buffet stations and space for a few words and a toast.
                                </p>
                                <ul className="list-disc pl-5 text-ink-muted space-y-2">
                                    <li>Room for 10+ to 150 guests</li>
                                    <li>Buffet packages to suit all budgets</li>
                                    <li>Space for music, speeches, and a slideshow</li>
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
                            Get in touch with our team to check availability and talk through your ideas. We recommend booking at least 4 weeks in advance for Friday and Saturday dates.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/private-hire#enquiry">
                                <Button size="lg" variant="primary">Enquire for Party</Button>
                            </Link>
                            <Link href="/book-table">
                                <Button size="lg" variant="outline">Book Table (Small Groups)</Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            <BrochureDownload brochure="anniversaries" source="anniversary_parties" />

            <PrivateBookingSection eventType="Other" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How much does an anniversary party at The Anchor cost?",
                        answer: "A room hire fee applies and varies by day and party size, and food and drink are charged at live prices, so you only pay for what you order. We confirm the hire fee and full terms when you enquire. The deposit is £250, fully deducted from your final bill. Call 01753 682707 or use the cost estimator on this page for a personalised quote."
                    },
                    {
                        question: "How many guests can you fit for an anniversary party?",
                        answer: "Our private dining room seats 26, or holds up to 50 standing. For larger anniversary celebrations we can accommodate 10+ to 150 guests across the dining room and beer garden. Smaller groups get a reserved area; larger parties take the dining room to themselves."
                    },
                    {
                        question: "Can we decorate the room?",
                        answer: "Absolutely. Bring balloons, banners, table photos, anniversary signs, whatever makes it feel like yours. We just ask for no confetti or glitter as it is tricky to clean up."
                    },
                    {
                        question: "Do you require a deposit?",
                        answer: "Yes, we ask for a £250 deposit to secure your date. It is fully deducted from the final bill, so it is not an extra cost, just a commitment to the booking. Groups of 15 or more pay a £10 per person deposit, also deducted from the bill."
                    },
                    {
                        question: "Can we bring an anniversary cake?",
                        answer: "Please do. We will store it in our kitchen until you are ready, and we can provide plates, napkins, and a knife for cutting. Let us know when you would like it brought out and we will time it perfectly."
                    },
                    {
                        question: "Can we show a slideshow or play music?",
                        answer: "Yes. We have TVs and a sound system available, ideal for a slideshow of the years gone by, a few words, or a playlist for the evening. Let our events coordinator know what you need and we will set it up."
                    },
                    {
                        question: "Is there parking for anniversary party guests?",
                        answer: "Yes. We have 20 free parking spaces right outside the pub, with no meters and no time limits. It is one of the biggest advantages of choosing a pub over a town-centre hotel."
                    },
                    {
                        question: "How far in advance should we book?",
                        answer: "We recommend booking at least 4 weeks ahead for Friday and Saturday evenings. Midweek and Sunday dates are usually easier to secure at shorter notice. Popular months like December and summer fill up faster."
                    },
                    {
                        question: "What food options are there?",
                        answer: "We offer buffet packages at live prices, or your guests can order from the menu. Pricing is confirmed when you enquire so it reflects the current menu, and we can talk through options to suit your group and budget. Drinks can be a welcome toast on arrival or a bar tab through the evening."
                    },
                    {
                        question: "Where is The Anchor?",
                        answer: "We are in Stanwell Moor, Surrey, 7 minutes from Heathrow Terminal 5 and about 8 minutes from Staines, and we sit outside the ULEZ zone. Postcode for sat nav: TW19 6AQ. We are just off the M25 at Junction 14."
                    }
                ]}
                className="bg-canvas"
            />
        </>
    )
}
