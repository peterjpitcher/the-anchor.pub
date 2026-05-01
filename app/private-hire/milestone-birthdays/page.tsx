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
    title: 'Milestone Birthday Party Venue | 30th, 40th, 50th Parties',
    description: `Celebrate your 21st, 30th, 40th or 50th birthday at ${BRAND.name}. The best party venue near Heathrow with DJ space, buffets, and late license options.`,
    openGraph: {
        title: 'Milestone Birthday Parties at The Anchor',
        description: 'Planning a big birthday? Discover our party packages perfect for 30ths, 40ths, and 50ths. Great food, music, and atmosphere.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Milestone Birthday Parties at The Anchor',
        description: 'Planning a big birthday? Discover our party packages perfect for 30ths, 40ths, and 50ths. Great food, music, and atmosphere.',
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
        "description": "A lively venue for milestone birthday celebrations including 21st, 30th, 40th, and 50th parties.",
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
                title="The Ultimate Birthday Party Venue"
                description="Celebrate the big numbers in style: 21st, 30th, 40th, 50th & Beyond!"
               
                image={{ src: DEFAULT_CORPORATE_IMAGE, alt: "Milestone birthday party" }}
                primaryCta={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            Plan My Party
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="birthday_hero" variant="secondary">
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

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4" as="h2" seo={{ structured: true, speakable: true }}>
                            Milestone Birthday Party Venue — 21st, 30th, 40th, 50th
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            You only turn 30 (or 40, or 50...) once! Make it a night to remember at The Anchor. We specialize in hosting lively milestone parties where the atmosphere is buzzing, the drinks are flowing, and the food keeps everyone going.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
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
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Hearty Buffets",
                                    description: "Keep your guests fuelled with finger food, sliders, or pizza buffets.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Easy Access",
                                    description: "Free parking for drivers and tons of Uber availability for the drinkers.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12 text-anchor-cream-text">Choose Your Party Style</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border border-anchor-gold/15 rounded-xl p-6 hover:shadow-lg transition-shadow bg-anchor-bg-raised">
                                <h3 className="text-xl font-bold mb-2 text-anchor-cream-text">The Garden Party</h3>
                                <p className="text-anchor-cream-text/70 mb-4">Perfect for summer birthdays. Reserve an area of our beer garden, order a BBQ buffet, and enjoy the sunshine.</p>
                                <span className="text-sm font-semibold text-anchor-gold-vivid">Great for 21sts & 30ths</span>
                            </div>

                            <div className="border border-anchor-gold/15 rounded-xl p-6 hover:shadow-lg transition-shadow bg-anchor-bg-raised">
                                <h3 className="text-xl font-bold mb-2 text-anchor-cream-text">The Big Bash</h3>
                                <p className="text-anchor-cream-text/70 mb-4">Hire our main function area. Clear the tables for a dance floor, set up a DJ, and party until late(ish).</p>
                                <span className="text-sm font-semibold text-anchor-gold-vivid">Best for 40ths & 50ths</span>
                            </div>

                            <div className="border border-anchor-gold/15 rounded-xl p-6 hover:shadow-lg transition-shadow bg-anchor-bg-raised">
                                <h3 className="text-xl font-bold mb-2 text-anchor-cream-text">The Dinner Party</h3>
                                <p className="text-anchor-cream-text/70 mb-4">Sit-down meal with 10-20 of your closest friends. Pre-order from our main menu or set menus available.</p>
                                <span className="text-sm font-semibold text-anchor-gold-vivid">Perfect for 60ths+</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <CateringPackagesTable
                            packages={foodPackages}
                            title="Catering Packages"
                            subtitle="Prices per person — minimum guest numbers may apply"
                            showDescription={true}
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
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

            <section className="py-8 bg-anchor-bg border-b border-anchor-gold/15">
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
                className="bg-anchor-bg-card"
            />
        </>
    )
}
