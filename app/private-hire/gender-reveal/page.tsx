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
import { CateringPackagesCard } from '@/app/private-hire/_components/CateringPackagesCard'

export const metadata: Metadata = {
    title: 'Gender Reveal Party Venue Near Heathrow',
    description: `Hosting a gender reveal? The Anchor offers the perfect garden space for smoke cannons and confetti. Celebrate your baby news with family and friends.`,
    openGraph: {
        title: 'Gender Reveal Parties at The Anchor',
        description: 'Boy or Girl? Host your big reveal in our spacious beer garden. Perfect for photos, smoke cannons, and family celebrations.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Gender Reveal Parties at The Anchor',
        description: 'Boy or Girl? Host your big reveal in our spacious beer garden. Perfect for photos, smoke cannons, and family celebrations.',
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify([eventVenueSchema]) }}
            />

            <InteriorHero
                image={DEFAULT_CORPORATE_IMAGE}
                crumb="Gender Reveal"
                title="Gender Reveal Parties"
                lead="The perfect setting to share your exciting news"
                actions={
                    <>
                        <Link href="/private-hire#enquiry">
                            <Button variant="primary" size="lg" fullWidth>
                                Enquire Now
                            </Button>
                        </Link>
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
                            Gender reveals are all about the moment, and the photos! The Anchor offers extensive outdoor space ideal for smoke cannons, balloon pops, or confetti showers, followed by a relaxed celebration with your loved ones.
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
                                { title: "Garden Space", description: "Our large beer garden is the safest and best place for smoke cannons and outdoor reveals." },
                                { title: "Afternoon Tea", description: "Ask about our buffet or afternoon tea style packages for a classy touch." },
                                { title: "Family Friendly", description: "Plenty of space for kids to run around while the adults celebrate." },
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
                                Our enclosed beer garden is the ideal setting for an outdoor reveal. There is ample open space for smoke cannons, confetti poppers, or balloon drops. Guests can gather in a semicircle, creating a natural amphitheatre for the big moment and your photos.
                            </p>
                            <ul className="text-sm text-ink-muted space-y-1">
                                <li>Best for smoke cannons and outdoor confetti</li>
                                <li>Natural light for great photographs</li>
                                <li>Space for guests to form a viewing circle</li>
                            </ul>
                        </CardBody></Card>
                        <Card><CardBody>
                            <h3 className="font-display text-h4 mb-3 text-ink-strong">Indoor Reveal</h3>
                            <p className="text-ink-muted mb-4">
                                Prefer to keep things inside? Our function area can be arranged for an indoor reveal. Balloon pops, cake cuts, or confetti cannons all work well indoors. We can clear space and arrange seating to give you a clear reveal zone.
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
                            We always plan for the British weather. If you are hoping for a garden reveal but conditions are poor on the day, we will switch seamlessly to our indoor backup plan. We discuss your preferred reveal method and backup option at the time of booking so that nothing is left to chance.
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
                                <h4 className="font-display text-h4 text-ink-strong mb-3">What we provide</h4>
                                <ul className="text-sm text-ink-muted space-y-2">
                                    <li>A reserved and cleared reveal space</li>
                                    <li>Help positioning guests for the best angle</li>
                                    <li>Assistance from our team to coordinate timing</li>
                                    <li>A &quot;keeper of the gender&quot; if you want to be surprised too</li>
                                </ul>
                            </CardBody></Card>
                            <Card><CardBody>
                                <h4 className="font-display text-h4 text-ink-strong mb-3">What to bring</h4>
                                <ul className="text-sm text-ink-muted space-y-2">
                                    <li>Your smoke cannons, confetti poppers, or reveal prop</li>
                                    <li>A photographer or nominated family member with a phone</li>
                                    <li>Any backdrop, banners, or balloon arrangements</li>
                                    <li>The sealed gender envelope (if using our keeper service)</li>
                                </ul>
                            </CardBody></Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="font-display text-h3 mb-4 text-pink-600">The "It's a Girl" Package</h3>
                            <p className="mb-4 text-ink-muted">Thinking pink? We can help you set up the area with pink napkins, allow space for pink balloon arches, and assist with the coordination of the reveal.</p>
                        </div>
                        <div>
                            <h3 className="font-display text-h3 mb-4 text-blue-600">The "It's a Boy" Package</h3>
                            <p className="mb-4 text-ink-muted">Team Blue? We offer the same flexibility. Our staff are experts at keeping secrets if you want to hand us the envelope beforehand!</p>
                        </div>
                    </div>

                    <Card accent className="mt-12 text-center"><CardBody>
                        <h4 className="font-display text-h4 mb-2 text-ink-strong">Need a "Keeper of the Gender"?</h4>
                        <p className="text-ink-muted">
                            If you want to be surprised too, you can give the sealed results to our manager, and we will arrange the correct coloured looking cannons or cake cutting for you!
                        </p>
                    </CardBody></Card>
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
                                All gender reveal venue packages include use of a reserved area, free parking, and help from our team with setup and coordination. Call us on <strong className="text-accent-text">01753 682707</strong> for a quote.
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
                                    <li><strong className="text-accent-text">Smoke cannons</strong>, the most popular choice. Vivid pink or blue smoke against the open sky makes for spectacular photos.</li>
                                    <li><strong className="text-accent-text">Confetti poppers</strong>, handheld confetti cannons that shower pink or blue tissue paper. Best on a calm day.</li>
                                    <li><strong className="text-accent-text">Balloon pop</strong>, fill a large black balloon with pink or blue confetti. Pop it together for the big reveal.</li>
                                    <li><strong className="text-accent-text">Paint throw</strong>, wearing white, throw coloured powder paint at each other for an unforgettable reveal (and unforgettable photos).</li>
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
                                Not sure which reveal method to choose? Our team has seen them all and can help you decide what will work best for your group size, the time of year, and your photography plans. Just ask when you enquire.
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
                            Many families combine their gender reveal with a baby shower celebration. Take a look at our baby shower page for afternoon tea packages, mocktail ideas, and games inspiration.
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

            <PrivateBookingSection eventType="Christening / Baby Shower" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Are smoke cannons allowed?",
                        answer: "Yes, absolutely! We just ask that you use them in the garden area for safety and best visibility. Please let us know in advance what reveal method you are planning so we can prepare the space."
                    },
                    {
                        question: "What happens if it rains?",
                        answer: "We always have an indoor backup plan ready. While smoke cannons work best outdoors, we can switch to a balloon pop or cake cut inside our function area. We will agree your indoor backup option at the time of booking."
                    },
                    {
                        question: "Can I use the garden or indoors, or both?",
                        answer: "You can choose either setting, or use both: start the celebration inside with food and drinks, then head to the garden for the reveal moment. We will help you plan the flow of the event when you enquire."
                    },
                    {
                        question: "Can we set up a photo backdrop?",
                        answer: "Yes. You are welcome to bring your own backdrop, balloon arch, or banner. We will make sure your reserved area has the space and access needed to set it up before guests arrive."
                    },
                    {
                        question: "Can you keep the gender secret for us?",
                        answer: "Yes! If you want to be surprised too, give the sealed gender envelope to our manager beforehand. We will coordinate the reveal prop or cake so that you find out at the same time as your guests."
                    },
                    {
                        question: "Is there a hire fee?",
                        answer: "Yes, a venue hire fee applies and varies depending on the day, time, and group size. There is pricing discussed on enquiry. Contact us on 01753 682707 for specifics based on your guest count and plans."
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
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg">
                            Enquire Now
                        </Button>
                    </Link>
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
