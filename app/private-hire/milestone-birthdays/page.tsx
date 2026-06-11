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
import { CateringPackagesCard } from '@/app/private-hire/_components/CateringPackagesCard'

export const metadata: Metadata = {
    title: 'Birthday Party Venue Near Heathrow | 30th, 40th, 50th Parties',
    description: 'Birthday party venue near Heathrow for 21st, 30th, 40th & 50th celebrations. A pub with private room hire, DJ space, buffets, and free parking in Surrey.',
    openGraph: {
        title: 'Birthday Party Venue Near Heathrow | The Anchor',
        description: 'Birthday party pub near Heathrow with private room hire for 30th, 40th & 50th celebrations. Free parking, DJ space, and catering packages.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Birthday Party Venue Near Heathrow | The Anchor',
        description: 'Birthday party pub near Heathrow with private room hire for 30th, 40th & 50th celebrations. Free parking, DJ space, and catering packages.',
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
        "description": "Birthday party venue near Heathrow Airport for milestone celebrations. Private room hire for 21st, 30th, 40th, and 50th birthday parties with catering and entertainment.",
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
                crumb="Milestone Birthdays"
                title="Birthday Party Venue Near Heathrow — 21st to 50th Celebrations"
                lead="A pub birthday party venue with private rooms, DJ space, and catering. Celebrate the big numbers in style near Staines and Heathrow Airport."
                actions={
                    <>
                        <Link href="/private-hire#enquiry">
                            <Button variant="primary" size="lg" fullWidth>
                                Plan My Party
                            </Button>
                        </Link>
                        <PhoneButton phone={CONTACT.phone} source="birthday_hero" variant="outline" size="lg">
                            Call {CONTACT.phone}
                        </PhoneButton>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4" as="h2" seo={{ structured: true, speakable: true }}>
                            Birthday Party Venue Near Heathrow &amp; Staines &mdash; 21st, 30th, 40th, 50th
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            You only turn 30 (or 40, or 50) once. Make it count. The Anchor is a birthday party pub in Stanwell Moor with birthday party room hire for 10&ndash;50 guests, buffets from &pound;9.95pp, and free parking. No minimum spend &mdash; you only pay for what you order on top of the room hire. Whether you want a DJ and a dance floor or a quiet dinner with your closest friends, we&apos;ll set it up.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Everything You Need for a Great Bash"
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { title: "Entertainment Ready", description: "Space for DJs or live singers to get the party started." },
                                { title: "Hearty Buffets", description: "Keep your guests fuelled with finger food, sliders, or pizza buffets." },
                                { title: "Easy Access", description: "Free parking for drivers and tons of Uber availability for the drinkers." },
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
                    <div className="max-w-5xl mx-auto">
                        <h2 className="font-display text-h2 text-center mb-12 text-ink-strong">Choose Your Party Style</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Card hover className="h-full">
                                <CardBody>
                                    <h3 className="font-display text-h4 mb-2 text-ink-strong">The Garden Party</h3>
                                    <p className="text-ink-muted mb-4">Perfect for summer birthdays. Reserve an area of our beer garden, order a BBQ buffet, and enjoy the sunshine.</p>
                                    <span className="text-sm font-semibold text-accent-text">Great for 21sts & 30ths</span>
                                </CardBody>
                            </Card>

                            <Card hover className="h-full">
                                <CardBody>
                                    <h3 className="font-display text-h4 mb-2 text-ink-strong">The Big Bash</h3>
                                    <p className="text-ink-muted mb-4">Hire our main function area. Clear the tables for a dance floor, set up a DJ, and party until late(ish).</p>
                                    <span className="text-sm font-semibold text-accent-text">Best for 40ths & 50ths</span>
                                </CardBody>
                            </Card>

                            <Card hover className="h-full">
                                <CardBody>
                                    <h3 className="font-display text-h4 mb-2 text-ink-strong">The Dinner Party</h3>
                                    <p className="text-ink-muted mb-4">Sit-down meal with 10-20 of your closest friends. Pre-order from our main menu or set menus available.</p>
                                    <span className="text-sm font-semibold text-accent-text">Perfect for 60ths+</span>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-display text-h2 text-center mb-8 text-ink-strong">Birthday Party Venue by Age</h2>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">21st Birthday Venue</h3>
                                <p className="text-ink-muted">
                                    A 21st is the first big one worth celebrating properly. Our beer garden works brilliantly for summer 21sts — reserve an area, order a buffet, and let the evening unfold naturally. Strict ID policies apply, but the vibe is relaxed. Most 21sts here run 15&ndash;30 guests with a finger buffet and a bar tab.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">30th Birthday Party Venue Near Heathrow</h3>
                                <p className="text-ink-muted">
                                    Turning 30 deserves more than drinks at a chain bar. Our dining room seats 26 for a sit-down meal, or clear the space for a dance floor with a DJ and a burger buffet. No minimum spend means your budget goes on exactly what you want — food, drinks, and entertainment. Read our <Link href="/blog/30th-birthday-party-ideas-venues" className="text-accent-text hover:underline font-semibold">30th birthday party ideas</Link> for inspiration.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">40th Birthday Party Venue</h3>
                                <p className="text-ink-muted">
                                    The big four-oh is when parties get good — people know what they like, and the crowd is always up for it. Most 40th birthday parties here are 30&ndash;50 guests with a premium buffet, welcome drinks, and a DJ. Free parking means nobody needs a designated driver. See our <Link href="/blog/40th-birthday-party-ideas-venues" className="text-accent-text hover:underline font-semibold">40th birthday party ideas</Link> guide.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">50th Birthday Party Venue Near Staines</h3>
                                <p className="text-ink-muted">
                                    Half a century calls for a proper celebration. Our 50th birthday parties often start with afternoon tea or a sit-down dinner, then transition to an evening party with music and drinks. The dining room works well for a more elegant feel, with French doors opening onto the garden in warmer months. Browse our <Link href="/blog/50th-birthday-party-ideas-venues" className="text-accent-text hover:underline font-semibold">50th birthday party ideas</Link> for more.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-display text-h3 text-ink-strong">60th &amp; Beyond</h3>
                                <p className="text-ink-muted">
                                    60th, 70th, and 80th birthdays tend to be more intimate — a long table, a great meal, and the people who matter most. We can set a private dining area for 10&ndash;20 guests with a set menu or à la carte service. The atmosphere is warm without being fussy, and there&apos;s no pressure to rush. See our <Link href="/blog/60th-birthday-party-ideas-venues" className="text-accent-text hover:underline font-semibold">60th birthday party ideas</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="max-w-2xl mx-auto">
                        <CateringPackagesCard />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <Card accent className="max-w-3xl mx-auto text-center">
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

            <PrivateBookingSection eventType="Birthday Party" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How much does a milestone birthday party at The Anchor cost?",
                        answer: "It depends on your guest count, catering choices, and any extras like DJ or decorations. Use our pricing calculator on this page for an instant estimate, or call us on 01753 682707 for a personalised quote. There are no hidden charges."
                    },
                    {
                        question: "Do you host 18th birthday parties?",
                        answer: "We generally focus on 21st birthdays and above. For 18th parties, please call us to discuss your requirements as strict ID policies will apply."
                    },
                    {
                        question: "What time can the party go on until?",
                        answer: "Our standard license allows for music and alcohol service until late (please check specific day times). We can advise on specific finishing times when you book."
                    },
                    {
                        question: "Can we set up early?",
                        answer: "Yes, you are usually welcome to arrive 30-60 minutes before your guests to set up balloons, cakes, and decorations."
                    }
                ]}
                className="bg-canvas"
            />
        </>
    )
}
