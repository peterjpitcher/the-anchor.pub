import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

export const metadata: Metadata = {
    title: 'Milestone Birthday Party Venue | 30th, 40th, 50th Parties',
    description: `Celebrate your 21st, 30th, 40th or 50th birthday at ${BRAND.name}. The best party venue near Heathrow with DJ space, buffets, and late license options.`,
    keywords: '30th birthday venue heathrow, 40th birthday party staines, 50th birthday venue surrey, party venue hire',
    openGraph: {
        title: 'Milestone Birthday Parties at The Anchor',
        description: 'Planning a big birthday? Discover our party packages perfect for 30ths, 40ths, and 50ths. Great food, music, and atmosphere.',
        images: [DEFAULT_CORPORATE_IMAGE],
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
        "description": "A lively venue for milestone birthday celebrations including 21st, 30th, 40th, and 50th parties."
    }

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Private Hire', url: '/private-hire' },
        { name: 'Milestone Birthdays', url: '/private-hire/milestone-birthdays' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([eventVenueSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/private-hire/milestone-birthdays"
                title="The Ultimate Birthday Party Venue"
                description="Celebrate the big numbers in style: 21st, 30th, 40th, 50th & Beyond!"
                variant="default"
                image={{ src: DEFAULT_CORPORATE_IMAGE, alt: "Milestone birthday party" }}
                primaryCta={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            🎂 Plan My Party
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="birthday_hero" variant="secondary">
                        Call {CONTACT.phone}
                    </PhoneButton>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Your Big Night Out
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            You only turn 30 (or 40, or 50...) once! Make it a night to remember at The Anchor. We specialize in hosting lively milestone parties where the atmosphere is buzzing, the drinks are flowing, and the food keeps everyone going.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Everything You Need for a Great Bash"
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🎧",
                                    title: "Entertainment Ready",
                                    description: "Space for DJs or live singers to get the party started.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍖",
                                    title: "Hearty Buffets",
                                    description: "Keep your guests fuelled with finger food, sliders, or pizza buffets.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🚕",
                                    title: "Easy Access",
                                    description: "Free parking for drivers and tons of Uber availability for the drinkers.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-white">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Choose Your Party Style</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="text-3xl mb-4">🔥</div>
                                <h3 className="text-xl font-bold mb-2">The Garden Party</h3>
                                <p className="text-gray-600 mb-4">Perfect for summer birthdays. Reserve an area of our beer garden, order a BBQ buffet, and enjoy the sunshine.</p>
                                <span className="text-sm font-semibold text-green-600">Great for 21sts & 30ths</span>
                            </div>

                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-green-50">
                                <div className="text-3xl mb-4">🕺</div>
                                <h3 className="text-xl font-bold mb-2">The Big Bash</h3>
                                <p className="text-gray-600 mb-4">Hire our main function area. Clear the tables for a dance floor, set up a DJ, and party until late(ish).</p>
                                <span className="text-sm font-semibold text-green-600">Best for 40ths & 50ths</span>
                            </div>

                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="text-3xl mb-4">🍽️</div>
                                <h3 className="text-xl font-bold mb-2">The Dinner Party</h3>
                                <p className="text-gray-600 mb-4">Sit-down meal with 10-20 of your closest friends. Pre-order from our main menu or set menus available.</p>
                                <span className="text-sm font-semibold text-green-600">Perfect for 60ths+</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="bg-white rounded-xl shadow-sm p-8 max-w-3xl mx-auto text-center border border-gray-100">
                        <h3 className="text-2xl font-bold mb-4">Planning a Surprise Party?</h3>
                        <p className="text-gray-700 mb-6">
                            We love being in on the secret! Let us know when you book, and we can help coordinate the arrival, hiding spots, and the big "SURPRISE!" moment.
                        </p>
                        <PhoneButton phone={CONTACT.phone} source="birthday_surprise" variant="primary">shhh! Call to Plan</PhoneButton>
                    </div>
                </Container>
            </section>

            <PrivateBookingSection eventType="Birthday Party" />

            <FAQAccordionWithSchema
                faqs={[
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
                className="bg-white"
            />
        </>
    )
}
