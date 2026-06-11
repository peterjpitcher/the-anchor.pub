import Link from 'next/link'
import { Button, CTASection, SectionHeading, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
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
    title: 'Retirement Party Venue Near Heathrow',
    description: `Give them a proper send-off. The Anchor is the ideal venue for retirement parties. Relaxed atmosphere, buffet options, and easy access for all colleagues.`,
    openGraph: {
        title: 'Retirement Parties at The Anchor',
        description: 'A dedicated lifetime of work deserves a dedicated celebration. Book your retirement party or leaving do with us.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Retirement Parties at The Anchor',
        description: 'A dedicated lifetime of work deserves a dedicated celebration. Book your retirement party or leaving do with us.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/retirement-parties'
    }
}

export default async function RetirementPartiesPage() {
    const { foodPackages } = await getCateringData()
    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/retirement-parties#venue",
        "name": `${BRAND.name} Retirement Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/retirement-parties",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "A relaxed and accessible venue suitable for retirement celebrations and leaving parties.",
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
                route="/private-hire/retirement-parties"
                variant="feature"
                title="Retirement Parties & Leaving Dos"
                description="A proper send-off for a lifetime of hard work"
               
                image={{ src: DEFAULT_CORPORATE_IMAGE, alt: "Retirement party" }}
                primaryCta={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            Enquire Now
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="retirement_hero" variant="outline">
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
                            Retirement Party & Leaving Do Venue Near Heathrow
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Whether it's a quiet lunch with the immediate team or a big evening bash with the whole company, The Anchor provides a warm, respectful, and relaxed setting to say "Thank You" and "Good Luck".
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-deep border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeading
                            title="Stress-Free Planning for Organizers"
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Speech Friendly",
                                    description: "Quiet areas available for speeches and presentations without shouting over music.",
                                    variant: "colored",
                                    color: "bg-anchor-green-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Accessible",
                                    description: "Ground floor access and easy parking make it suitable for guests of all ages.",
                                    variant: "colored",
                                    color: "bg-anchor-green-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Catering Options",
                                    description: "Classic buffet spread, tea & coffee stations, or full 3-course meals.",
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
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Daytime or Evening?"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-anchor-green-raised p-6 rounded-xl border border-anchor-gold-dark/15">
                                <h3 className="text-2xl font-bold text-anchor-gold-bright mb-2">The Long Lunch</h3>
                                <p className="text-anchor-cream-text/70">
                                    Popular for office leaving dos. Book a long table for Friday lunch, enjoy our classics (Fish & Chips, Pies), and let the afternoon drift by. We offer tab facilities for corporate cards.
                                </p>
                            </div>
                            <div className="bg-anchor-green-raised p-6 rounded-xl border border-anchor-gold-dark/15">
                                <h3 className="text-2xl font-bold text-anchor-gold-bright mb-2">The Evening Do</h3>
                                <p className="text-anchor-cream-text/70">
                                    Invite partners and spouses for a proper celebration. Use our function area, enjoy a buffet, and perhaps a bit of music to see the retiree off in style.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-deep border-b border-anchor-gold-dark/15">
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

            <section className="section-spacing-sm bg-anchor-green-deep border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-anchor-cream-text/70">
                            Use our calculator below for an instant estimate, or call us for a bespoke quote.
                        </p>
                    </div>
                </Container>
            </section>

            <PrivateBookingSection eventType="Other" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How much does a retirement party at The Anchor cost?",
                        answer: "It depends on your guest count, catering choices, and any extras like DJ or decorations. Use our pricing calculator on this page for an instant estimate, or call us on 01753 682707 for a personalised quote. There are no hidden charges."
                    },
                    {
                        question: "Can we set up a tab?",
                        answer: "Yes, we can set up a bar tab with a limit or for specific drinks. We can provide a VAT receipt for company expenses."
                    },
                    {
                        question: "Is there space for a projector/screen?",
                        answer: "We have large screens available which can be used for photo slideshows or presentations (connection cables provided). Please test this with us in advance."
                    },
                    {
                        question: "How many people can you fit?",
                        answer: "We can comfortably host up to 100 people for a buffet/drinks reception, or up to ~50 for a sit-down meal."
                    }
                ]}
                className="bg-anchor-green-card"
            />

            <CTASection
                title="Book a Proper Send-Off"
                description="Contact us to check availability for your date."
                buttons={[
                    {
                        text: "Enquire Now",
                        href: "/private-hire#enquiry",
                        variant: "primary"
                    },
                    {
                        text: "Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "retirement_cta",
                        variant: "outline"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
