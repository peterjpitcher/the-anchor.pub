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
    title: 'Engagement Party Venue Near Heathrow | The Anchor',
    description: `Celebrate your engagement at ${BRAND.name}. Romantic atmosphere, flexible buffet options, and private areas. The perfect venue near Staines and Heathrow.`,
    keywords: 'engagement party venue staines, engagement party heathrow, engagement drinks venue, party venue stanwell moor',
    openGraph: {
        title: 'Celebrate Your Engagement at The Anchor',
        description: 'She said yes! Now let\'s celebrate. Discover our engagement party packages with prosecco, buffets, and private areas.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Celebrate Your Engagement at The Anchor',
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
        "description": "A romantic and flexible venue for engagement parties, intimate gatherings, and celebrations.",
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

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Private Hire', url: '/private-hire' },
        { name: 'Engagement Parties', url: '/private-hire/engagement-parties' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([eventVenueSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/private-hire/engagement-parties"
                variant="feature"
                title="Engagement Parties at The Anchor"
                description="Raise a glass to your future in a warm, traditional setting"
               
                image={{ src: DEFAULT_CORPORATE_IMAGE, alt: "Engagement party setup" }}
                primaryCta={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            🥂 Enquire Now
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="engagement_hero" variant="secondary">
                        Call {CONTACT.phone}
                    </PhoneButton>
                }
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            She Said Yes! Now Let's Party.
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Congratulations on your engagement! Whether you want a quiet family dinner to share the news or a big bash with all your friends, The Anchor provides the perfect backdrop for your first celebration as a fiancé(e).
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Why Couples Choose Us"
                            subtitle="We take the stress out of planning so you can focus on showing off the ring."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🍾",
                                    title: "Prosecco Packages",
                                    description: "Pre-order welcome drinks for your guests to start the night right.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🥨",
                                    title: "Flexible Buffets",
                                    description: "From finger food to hearty spreads, we cater to all budgets.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🎵",
                                    title: "Music & Atmosphere",
                                    description: "Bring your own playlist or book our function area with space for a DJ.",
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

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Tailored to You"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-anchor-cream-text">Intimate Gatherings</h3>
                                <p className="text-anchor-cream-text/70">
                                    If you prefer something low-key, book a large table in our dining area. Enjoy our à la carte menu, great wines, and the cosy atmosphere of a traditional pub. Perfect for close family and best friends.
                                </p>
                                <ul className="list-disc pl-5 text-anchor-cream-text/70 space-y-2">
                                    <li>Reserved area for your group</li>
                                    <li>Full table service</li>
                                    <li>Decorations allowed (balloons/banners)</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-anchor-cream-text">Full Party Mode</h3>
                                <p className="text-anchor-cream-text/70">
                                    Want to invite everyone? Our function area can host up to 100 guests. We can arrange cleared space for dancing, buffet stations, and private access to the garden area in summer.
                                </p>
                                <ul className="list-disc pl-5 text-anchor-cream-text/70 space-y-2">
                                    <li>Capacity for 30-100 guests</li>
                                    <li>Buffet prices start from GBP 12pp</li>
                                    <li>Space for entertainment</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <SectionHeader title="Ready to start planning?" />
                        <p className="text-lg text-anchor-cream-text/70 mb-8">
                            Get in touch with our team to check availability and discuss your ideas. We recommend booking at least 4 weeks in advance for Friday/Saturday slots.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/private-hire#enquiry">
                                <Button size="lg" variant="primary">Enquire for Party</Button>
                            </Link>
                            <Link href="/book-table">
                                <Button size="lg" variant="secondary">Book Table (Small Groups)</Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            <PrivateBookingSection eventType="Other" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can we decorate the area?",
                        answer: "Absolutely! You are welcome to bring balloons, banners, and table decorations. We just ask for no confetti or glitter as it's hard to clean up!"
                    },
                    {
                        question: "Do you require a deposit?",
                        answer: "For large area bookings or private hire requiring food, we typically ask for a small deposit to secure the date. This will be deducted from your final bill."
                    },
                    {
                        question: "Can we bring a cake?",
                        answer: "Yes, please do! We can store it in our kitchen until you are ready. We can also provide plates and napkins."
                    }
                ]}
                className="bg-anchor-bg-card"
            />
        </>
    )
}
