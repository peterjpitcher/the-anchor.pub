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
    title: 'Watch Boxing Near Heathrow & Staines | Live Fight Nights',
    description: `Watch the biggest boxing matches live at ${BRAND.name}. Anthony Joshua, Tyson Fury, and title fights on big screens. Great atmosphere near Heathrow.`,
    keywords: 'boxing pub heathrow, watch boxing staines, fury fight pub, joshua fight pub, boxing pay per view pub',
    openGraph: {
        title: 'Fight Night at The Anchor',
        description: 'Big screens, big atmosphere. Watch the heavyweights comfortably.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Fight Night at The Anchor',
        description: 'Big screens, big atmosphere. Watch the heavyweights comfortably.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport/boxing'
    }
}

export default function BoxingPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport-pub' },
        { name: 'Boxing', url: '/live-sport/boxing' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/live-sport/boxing"
                title="Big Fight Nights"
                description="Anthony Joshua. Tyson Fury. Usyk. When the heavyweights collide, we're the place to be."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="boxing_hero"
                        context="sport"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🥊 Book Ringside
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/drinks">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🍺 Drinks Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Ringside Seats
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            Boxing needs an atmosphere. Sitting at home doesn't cut it. Join us for the build-up, the undercard, and the main event on our HD screens with full commentary.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Fight Night Ready"
                            subtitle="No need to pay the PPV fee yourself."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "📺",
                                    title: "PPV Events",
                                    description: "We pay the Box Office fees so you don't have to. Watch the big Sky Sports and TNT Sports Box Office fights here.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🔉",
                                    title: "Loud & Live",
                                    description: "Experience the ring walks and the knockouts with full venue sound.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍻",
                                    title: "No Dry Nights",
                                    description: "Our bar stays well-stocked with draught beers, spirits, and mixers all night.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="warning"
                            title="Ticketed Events"
                            className="max-w-2xl mx-auto mt-8"
                            content="For massive world title fights, we sometimes operate a ticket-only policy to control numbers and ensure everyone gets served. Check our social media for specific event details."
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do you show the undercard?",
                        answer: "Yes, we usually transform into 'fight mode' from around 8pm on big fight nights to show the main undercard fights."
                    },
                    {
                        question: "Is there an entry fee?",
                        answer: "Generally no, but for huge global events we may ticket the door to manage capacity. We always announce this on Facebook first."
                    },
                    {
                        question: "How late do you stay open?",
                        answer: "We are licensed until late on weekends, but for fights that go into the early hours (like Vegas fights), please check with us directly as it depends on our license extension for that specific night."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Don't Miss The Knockout"
                description="These nights are popular. Booking guarantees entry."
                buttons={[
                    {
                        text: "🥊 Book Now",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "boxing_cta",
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
