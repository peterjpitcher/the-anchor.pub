import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Watch Six Nations Rugby Near Heathrow | The Anchor',
    description: `The best pub to watch the Six Nations near Heathrow & Staines. Multiple screens, fresh Guinness, and a proper rugby atmosphere. Book your table now.`,
    keywords: 'six nations pub heathrow, watch rugby staines, rugby pub near me, six nations venue',
    openGraph: {
        title: 'Watch the Six Nations at The Anchor',
        description: 'Every tackle, try, and conversion. The best atmosphere for the rugby.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch the Six Nations at The Anchor',
        description: 'Every tackle, try, and conversion. The best atmosphere for the rugby.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    })
}

export default function SixNationsPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport-pub' },
        { name: 'Six Nations', url: '/live-sport/six-nations' }
    ])

    const eventSchema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "Six Nations Rugby Screening",
        "location": {
            "@type": "SportsActivityLocation",
            "name": BRAND.name,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": CONTACT.address.street,
                "addressLocality": CONTACT.address.town,
                "postalCode": CONTACT.address.postcode,
                "addressCountry": "UK"
            }
        },
        "description": "Watch every Six Nations match live on big screens.",
        "image": DEFAULT_PAGE_HEADER_IMAGE,
        "organizer": {
            "@type": "Organization",
            "name": BRAND.name,
            "url": "https://www.the-anchor.pub"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([eventSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/live-sport/six-nations"
                title="Watch The Six Nations Live"
                description="The roar of the crowd, perfect pints of Guinness, and every match live on our screens."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="six_nations_hero"
                        context="sport"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🏉 Book Best Seat
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🍔 View Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            The Home of Rugby in Staines
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            The Six Nations is more than just a tournament; it's a tradition. At The Anchor, we treat it with the respect it deserves. That means the commentary is on, the Guinness is flowing, and the atmosphere is electric.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Match Day Experience"
                            subtitle="Everything you need for the perfect rugby day."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🍺",
                                    title: "Perfect Guinness",
                                    description: "We pride ourselves on our pour. Essential for any rugby match.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "📺",
                                    title: "Big Screens",
                                    description: "Multiple HD screens ensure you catch every line break and contentious TMO decision.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🥧",
                                    title: "Halftime Feeds",
                                    description: "Hearty pub classics and sharing platters to keep you fuelled through 80 minutes.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="warning"
                            title="Book Early for England Games"
                            className="max-w-2xl mx-auto mt-8"
                            content="England matches and 'Super Saturday' are our busiest times. We strongly recommend booking your table at least a week in advance."
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do you show all Six Nations games?",
                        answer: "Yes, we show every single match of the tournament, not just the England games."
                    },
                    {
                        question: "Is the commentary on?",
                        answer: "Absolutely. For Six Nations matches, the sound is always on so you can hear the ref and the commentary."
                    },
                    {
                        question: "Do I need to pay an entry fee?",
                        answer: "No, entry is free. We just recommend booking a table if you want to guarantee a seat."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Secure Your Spot for the Rugby"
                description="Tables fill up fast for the big games."
                buttons={[
                    {
                        text: "🏉 Book Now",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "six_nations_cta",
                        variant: "primary"
                    },
                    {
                        text: "📍 Find Us",
                        href: "/find-us",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
