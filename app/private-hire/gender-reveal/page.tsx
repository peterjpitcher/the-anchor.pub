import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { TestimonialSection } from '@/components/TestimonialSection'
import { getReviewsByTopic } from '@/lib/google-reviews'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BrochureDownload } from '@/components/features/PrivateHire/BrochureDownload'
import { CateringPackagesCard } from '@/app/private-hire/_components/CateringPackagesCard'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { DECORATING_WORDING, ROOM_HIRE_WORDING } from '@/lib/approved-wording'

export const metadata: Metadata = {
    title: 'Gender Reveal Party Venue Near Heathrow',
    description: `Hosting a gender reveal? The Anchor has a garden for an outdoor reveal, with smoke cannons outside only. Celebrate your baby news with family and friends.`,
    openGraph: {
        title: 'Gender Reveal Parties at The Anchor',
        description: 'Boy or girl? Host your big reveal in our beer garden, with smoke cannons outside only. Food, drinks and free parking for the family.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Gender Reveal Parties at The Anchor',
        description: 'Boy or girl? Host your big reveal in our beer garden, with smoke cannons outside only. Food, drinks and free parking for the family.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/gender-reveal'
    }
}

export default function GenderRevealPage() {
    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/gender-reveal#venue",
        "name": `${BRAND.name} Garden Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/gender-reveal",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "A spacious venue with outdoor garden perfect for gender reveal parties and baby showers.",
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
                crumb="Gender Reveal"
                title="Gender Reveal Parties"
                lead="The perfect setting to share your exciting news"
                actions={
                    <>
                        <Button asChild variant="primary" size="lg" fullWidth>
                            <Link href="/private-hire#enquiry">
                                Enquire Now
                            </Link>
                        </Button>
                        <PhoneButton phone={CONTACT.phone} source="reveal_hero" variant="outline" size="lg">
                            Call {CONTACT.phone}
                        </PhoneButton>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4" as="h2" seo={{ structured: true, speakable: true }}>
                            Gender Reveal Party Venue Near Heathrow
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Gender reveals are all about the moment, and the photos! The Anchor offers extensive outdoor space ideal for smoke cannons and balloon pops, followed by a relaxed celebration with your loved ones.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="A Venue Designed for Celebrations"
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { title: "Garden Space", description: "Our large beer garden is the place for an outdoor reveal. Smoke cannons are for outside only, well away from buildings and fencing." },
                                { title: "Afternoon Tea", description: "Ask about our buffet or afternoon tea style packages for a classy touch." },
                                { title: "Family Friendly", description: "Children are welcome. The garden is next to the car park, so keep little ones with you." },
                            ].map(feature => (
                                <Card key={feature.title} accent className="h-full text-center">
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
                    <SectionHeading title="Venue Layout Options" />
                    <div className="mx-auto grid md:grid-cols-2 gap-8 mb-8">
                        <Card><CardBody>
                            <h3 className="font-display text-h4 mb-3 text-ink-strong">Garden Reveal</h3>
                            <p className="text-ink-muted mb-4">
                                Our beer garden is the ideal setting for an outdoor reveal. There is ample open space for smoke cannons, used well away from buildings and fencing, or a balloon pop. Guests can gather in a semicircle, creating a natural amphitheatre for the big moment and your photos.
                            </p>
                            <ul className="text-sm text-ink-muted space-y-1">
                                <li>Smoke cannons outside only, away from buildings and fencing</li>
                                <li>Natural light for great photographs</li>
                                <li>Space for guests to form a viewing circle</li>
                            </ul>
                        </CardBody></Card>
                        <Card><CardBody>
                            <h3 className="font-display text-h4 mb-3 text-ink-strong">Indoor Reveal</h3>
                            <p className="text-ink-muted mb-4">
                                Prefer to keep things inside? Our function area can be arranged for an indoor reveal. Balloon pops and cake cuts work well indoors. Confetti cannons and confetti balloons aren&apos;t allowed, and smoke cannons are for outside only. We can clear space and arrange seating to give you a clear reveal zone.
                            </p>
                            <ul className="text-sm text-ink-muted space-y-1">
                                <li>Ideal for cake cuts and balloon pops</li>
                                <li>Comfortable regardless of weather</li>
                                <li>Flexible furniture layout</li>
                            </ul>
                        </CardBody></Card>
                    </div>

                    <Card accent className="mx-auto"><CardBody>
                        <h3 className="font-display text-h4 text-ink-strong mb-3">Weather Contingency</h3>
                        <p className="text-ink-muted">
                            Plan for the British weather. If conditions are poor on the day, the reveal can move indoors. Smoke cannons can&apos;t come inside, so pick an indoor option too, such as a cake cut or a balloon pop, and tell us both when you book.
                        </p>
                    </CardBody></Card>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading title="Photo and Video Setup" />
                    <div className="mx-auto">
                        <p className="text-ink-muted text-center mb-6">
                            The reveal moment deserves to be captured perfectly. Here is what we provide and what you should plan to bring.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card><CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-3">What we provide</h3>
                                <ul className="text-sm text-ink-muted space-y-2">
                                    <li>A reserved and cleared reveal space</li>
                                    <li>Help positioning guests for the best angle</li>
                                    <li>Assistance from our team to coordinate timing</li>
                                </ul>
                            </CardBody></Card>
                            <Card><CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-3">What to bring</h3>
                                <ul className="text-sm text-ink-muted space-y-2">
                                    <li>Your smoke cannons (for the garden) or other reveal prop</li>
                                    <li>A photographer or nominated family member with a phone</li>
                                    <li>Any backdrop, banners, or balloon arrangements</li>
                                </ul>
                            </CardBody></Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Gender Reveal Party Packages"
                        lead="Food, drinks, and the big moment, all taken care of"
                    />
                    <div className="mx-auto space-y-8">
                        <CateringPackagesCard/>

                        <Card><CardBody className="text-center">
                            <p className="text-ink-muted text-sm">
                                All gender reveal venue packages include help from our team with setup and coordination, and parking is free. {ROOM_HIRE_WORDING} Call us on <strong className="text-accent-text">01753 682707</strong> for a quote.
                            </p>
                        </CardBody></Card>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="Reveal Ideas & Inspiration"
                        lead="Creative ways to share the big news"
                    />
                    <div className="mx-auto">
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <Card><CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-3">Outdoor Reveal Ideas</h3>
                                <p className="text-ink-muted mb-3">Our beer garden is the perfect stage for dramatic outdoor reveals. Popular choices include:</p>
                                <ul className="text-sm text-ink-muted space-y-2">
                                    <li><strong className="text-accent-text">Smoke cannons</strong>, the most popular choice. Vivid pink or blue smoke against the open sky makes for spectacular photos. Outside only, well away from buildings and fencing.</li>
                                    <li><strong className="text-accent-text">Balloon pop</strong>, pop a balloon together for the big reveal. No confetti-filled balloons, please.</li>
                                </ul>
                            </CardBody></Card>
                            <Card><CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-3">Indoor Reveal Ideas</h3>
                                <p className="text-ink-muted mb-3">If you prefer an indoor gender reveal party, or the weather is not cooperating, these options work brilliantly inside:</p>
                                <ul className="text-sm text-ink-muted space-y-2">
                                    <li><strong className="text-accent-text">Cake cutting</strong>, a white-iced cake with pink or blue sponge inside. The classic reveal moment that everyone loves.</li>
                                    <li><strong className="text-accent-text">Box opening</strong>, a large box filled with pink or blue balloons that float out when the lid is lifted.</li>
                                    <li><strong className="text-accent-text">Scratch cards</strong>, hand out custom scratch cards to guests and let everyone reveal at the same time.</li>
                                    <li><strong className="text-accent-text">Piñata</strong>, fill a piñata with pink or blue sweets. The parents-to-be take turns until the big reveal spills out.</li>
                                </ul>
                            </CardBody></Card>
                        </div>
                        <Card accent><CardBody className="text-center">
                            <p className="text-ink-muted">
                                Not sure which reveal to choose? Ask when you enquire and we&apos;ll help you pick one that suits your group and the space.
                            </p>
                        </CardBody></Card>
                    </div>
                </Container>
            </section>

            {/* Real Google reviews from lib/google-reviews.ts. Replaced two
                fabricated quotes on 15 August 2026. */}
            <TestimonialSection
                variant="compact"
                className="py-section-y bg-surface px-4"
                reviews={getReviewsByTopic('gender-reveal', 2)}
            />

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="mx-auto text-center">
                        <h2 className="font-display text-h3 text-ink-strong mb-4">Also Considering a Baby Shower?</h2>
                        <p className="text-ink-muted mb-6">
                            Many families combine their gender reveal with a baby shower celebration. Take a look at our baby shower page for afternoon tea packages and games inspiration.
                        </p>
                        <Link
                            href="/private-hire/baby-showers"
                            className="inline-block rounded-md border border-line bg-surface px-6 py-3 font-semibold text-accent-text transition-colors hover:border-accent"
                        >
                            Baby Shower Venue
                        </Link>
                    </div>
                </Container>
            </section>

            <BrochureDownload brochure="gender_reveal" source="gender_reveal" />

            <PrivateBookingSection eventType="Christening / Baby Shower" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Are smoke cannons allowed?",
                        answer: "Yes, in the garden only, and well away from buildings and fencing. Confetti cannons and confetti balloons aren't allowed. Please let us know in advance what reveal method you are planning so we can prepare the space."
                    },
                    {
                        question: "What happens if it rains?",
                        answer: "The reveal can move indoors. Smoke cannons are for outside only, so pick an indoor option too, such as a balloon pop or a cake cut, and tell us both when you book."
                    },
                    {
                        question: "Can I use the garden or indoors, or both?",
                        answer: "You can choose either setting, or use both: start the celebration inside with food and drinks, then head to the garden for the reveal moment. We will help you plan the flow of the event when you enquire."
                    },
                    {
                        question: "Can we set up a photo backdrop?",
                        answer: `Yes. You are welcome to bring your own backdrop, balloon arch, or banner. ${DECORATING_WORDING}`
                    },
                    {
                        question: "Is there a hire fee?",
                        answer: `Yes. ${ROOM_HIRE_WORDING} The hourly rates are on our private hire page. Call us on ${CONTACT.phone} for a quote based on your guest count and plans.`
                    },
                    {
                        question: "Can we combine a gender reveal with a baby shower?",
                        answer: "Absolutely. Many families host both on the same afternoon. We can structure the event so the shower activities and food come first, building up to the reveal moment at the right time."
                    }
                ]}
                className="bg-canvas"
            />

            <CtaBand
                title="Ready to Pop the Question?"
                copy="(The gender question, that is!) Book your reveal today."
                primary={
                    <Button asChild variant="primary" size="lg">
                        <Link href="/private-hire#enquiry">
                            Enquire Now
                        </Link>
                    </Button>
                }
                secondary={
                    <PhoneButton phone={CONTACT.phone} source="reveal_cta" variant="outline" size="lg">
                        Call Us
                    </PhoneButton>
                }
            />
        </>
    )
}
