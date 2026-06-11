import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { getCateringData } from '@/lib/api/catering-packages'
import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'

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

export default async function MilestoneBirthdaysPage() {
    const { foodPackages } = await getCateringData()
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

            <HeroWrapper
                showContextStrip={true}
                route="/private-hire/milestone-birthdays"
                variant="feature"
                title="Birthday Party Venue Near Heathrow — 21st to 50th Celebrations"
                description="A pub birthday party venue with private rooms, DJ space, and catering. Celebrate the big numbers in style near Staines and Heathrow Airport."
               
                image={{ src: DEFAULT_CORPORATE_IMAGE, alt: "Milestone birthday party" }}
                primaryCta={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            Plan My Party
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="birthday_hero" variant="outline">
                        Call {CONTACT.phone}
                    </PhoneButton>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10-50 room bookings</span>
                    </div>
                }
            />

            <section className="section-spacing-sm bg-anchor-green-card border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4" as="h2" seo={{ structured: true, speakable: true }}>
                            Birthday Party Venue Near Heathrow &amp; Staines &mdash; 21st, 30th, 40th, 50th
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            You only turn 30 (or 40, or 50) once. Make it count. The Anchor is a birthday party pub in Stanwell Moor with birthday party room hire for 10&ndash;50 guests, buffets from &pound;9.95pp, and free parking. No minimum spend &mdash; you only pay for what you order on top of the room hire. Whether you want a DJ and a dance floor or a quiet dinner with your closest friends, we&apos;ll set it up.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-deep border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Everything You Need for a Great Bash"
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Entertainment Ready",
                                    description: "Space for DJs or live singers to get the party started.",
                                    variant: "colored",
                                    color: "bg-anchor-green-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Hearty Buffets",
                                    description: "Keep your guests fuelled with finger food, sliders, or pizza buffets.",
                                    variant: "colored",
                                    color: "bg-anchor-green-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Easy Access",
                                    description: "Free parking for drivers and tons of Uber availability for the drinkers.",
                                    variant: "colored",
                                    color: "bg-anchor-green-raised",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12 text-anchor-cream-text">Choose Your Party Style</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border border-anchor-gold-dark/15 rounded-xl p-6 hover:shadow-lg transition-shadow bg-anchor-green-raised">
                                <h3 className="text-xl font-bold mb-2 text-anchor-cream-text">The Garden Party</h3>
                                <p className="text-anchor-cream-text/70 mb-4">Perfect for summer birthdays. Reserve an area of our beer garden, order a BBQ buffet, and enjoy the sunshine.</p>
                                <span className="text-sm font-semibold text-anchor-gold-bright">Great for 21sts & 30ths</span>
                            </div>

                            <div className="border border-anchor-gold-dark/15 rounded-xl p-6 hover:shadow-lg transition-shadow bg-anchor-green-raised">
                                <h3 className="text-xl font-bold mb-2 text-anchor-cream-text">The Big Bash</h3>
                                <p className="text-anchor-cream-text/70 mb-4">Hire our main function area. Clear the tables for a dance floor, set up a DJ, and party until late(ish).</p>
                                <span className="text-sm font-semibold text-anchor-gold-bright">Best for 40ths & 50ths</span>
                            </div>

                            <div className="border border-anchor-gold-dark/15 rounded-xl p-6 hover:shadow-lg transition-shadow bg-anchor-green-raised">
                                <h3 className="text-xl font-bold mb-2 text-anchor-cream-text">The Dinner Party</h3>
                                <p className="text-anchor-cream-text/70 mb-4">Sit-down meal with 10-20 of your closest friends. Pre-order from our main menu or set menus available.</p>
                                <span className="text-sm font-semibold text-anchor-gold-bright">Perfect for 60ths+</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-deep border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8 text-anchor-cream-text">Birthday Party Venue by Age</h2>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-anchor-gold-bright">21st Birthday Venue</h3>
                                <p className="text-anchor-cream-text/70">
                                    A 21st is the first big one worth celebrating properly. Our beer garden works brilliantly for summer 21sts — reserve an area, order a buffet, and let the evening unfold naturally. Strict ID policies apply, but the vibe is relaxed. Most 21sts here run 15&ndash;30 guests with a finger buffet and a bar tab.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-anchor-gold-bright">30th Birthday Party Venue Near Heathrow</h3>
                                <p className="text-anchor-cream-text/70">
                                    Turning 30 deserves more than drinks at a chain bar. Our dining room seats 26 for a sit-down meal, or clear the space for a dance floor with a DJ and a burger buffet. No minimum spend means your budget goes on exactly what you want — food, drinks, and entertainment. Read our <Link href="/blog/30th-birthday-party-ideas-venues" className="text-anchor-gold-dark hover:text-anchor-gold font-semibold">30th birthday party ideas</Link> for inspiration.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-anchor-gold-bright">40th Birthday Party Venue</h3>
                                <p className="text-anchor-cream-text/70">
                                    The big four-oh is when parties get good — people know what they like, and the crowd is always up for it. Most 40th birthday parties here are 30&ndash;50 guests with a premium buffet, welcome drinks, and a DJ. Free parking means nobody needs a designated driver. See our <Link href="/blog/40th-birthday-party-ideas-venues" className="text-anchor-gold-dark hover:text-anchor-gold font-semibold">40th birthday party ideas</Link> guide.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-anchor-gold-bright">50th Birthday Party Venue Near Staines</h3>
                                <p className="text-anchor-cream-text/70">
                                    Half a century calls for a proper celebration. Our 50th birthday parties often start with afternoon tea or a sit-down dinner, then transition to an evening party with music and drinks. The dining room works well for a more elegant feel, with French doors opening onto the garden in warmer months. Browse our <Link href="/blog/50th-birthday-party-ideas-venues" className="text-anchor-gold-dark hover:text-anchor-gold font-semibold">50th birthday party ideas</Link> for more.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-anchor-gold-bright">60th &amp; Beyond</h3>
                                <p className="text-anchor-cream-text/70">
                                    60th, 70th, and 80th birthdays tend to be more intimate — a long table, a great meal, and the people who matter most. We can set a private dining area for 10&ndash;20 guests with a set menu or à la carte service. The atmosphere is warm without being fussy, and there&apos;s no pressure to rush. See our <Link href="/blog/60th-birthday-party-ideas-venues" className="text-anchor-gold-dark hover:text-anchor-gold font-semibold">60th birthday party ideas</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <CateringPackagesTable
                            packages={foodPackages}
                            title="Catering Packages"
                            subtitle="Prices per person, minimum guest numbers may apply"
                            showDescription={true}
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-deep border-t border-anchor-gold-dark/15">
                <Container>
                    <div className="card-dark rounded-none p-8 max-w-3xl mx-auto text-center">
                        <h3 className="text-2xl font-bold mb-4 text-anchor-cream-text">Planning a Surprise Party?</h3>
                        <p className="text-anchor-cream-text/70 mb-6">
                            We love being in on the secret! Let us know when you book, and we can help coordinate the arrival, hiding spots, and the big "SURPRISE!" moment.
                        </p>
                        <PhoneButton phone={CONTACT.phone} source="birthday_surprise" variant="primary">shhh! Call to Plan</PhoneButton>
                    </div>
                </Container>
            </section>

            <section className="section-spacing-sm bg-anchor-green-deep border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-anchor-cream-text/70">
                            Use our calculator below for an instant estimate, or call us for a bespoke quote.
                        </p>
                    </div>
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
                className="bg-anchor-green-card"
            />
        </>
    )
}
