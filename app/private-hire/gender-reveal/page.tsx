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
    title: 'Gender Reveal Party Venue | The Anchor',
    description: `Hosting a gender reveal? The Anchor offers the perfect garden space for smoke cannons and confetti. Celebrate your baby news with family and friends.`,
    keywords: 'gender reveal venue, gender reveal party heathrow, baby shower venue, private garden hire',
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

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Private Hire', url: '/private-hire' },
        { name: 'Gender Reveal', url: '/private-hire/gender-reveal' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([eventVenueSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/private-hire/gender-reveal"
                variant="promo"
                title="Gender Reveal Parties"
                description="The perfect setting to share your exciting news"
               
                image={{ src: DEFAULT_CORPORATE_IMAGE, alt: "Gender reveal party" }}
                primaryCta={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            👶 Enquire Now
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="reveal_hero" variant="secondary">
                        Call {CONTACT.phone}
                    </PhoneButton>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Boy or Girl? The Big Moment Awaits.
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            Gender reveals are all about the moment—and the photos! The Anchor offers extensive outdoor space ideal for smoke cannons, balloon pops, or confetti showers, followed by a relaxed celebration with your loved ones.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="A Venue Designed for Celebrations"
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🌳",
                                    title: "Garden Space",
                                    description: "Our large beer garden is the safest and best place for smoke cannons and outdoor reveals.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍰",
                                    title: "Afternoon Tea",
                                    description: "Ask about our buffet or afternoon tea style packages for a classy touch.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "👨‍👩‍👧‍👦",
                                    title: "Family Friendly",
                                    description: "Plenty of space for kids to run around while the adults celebrate.",
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
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-pink-600">The "It's a Girl" Package</h3>
                            <p className="mb-4 text-gray-700">Thinking pink? We can help you set up the area with pink napkins, allow space for pink balloon arches, and assist with the coordination of the reveal.</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-blue-600">The "It's a Boy" Package</h3>
                            <p className="mb-4 text-gray-700">Team Blue? We offer the same flexibility. Our staff are experts at keeping secrets if you want to hand us the envelope beforehand!</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300">
                        <h4 className="text-xl font-bold mb-2">Need a "Keeper of the Gender"?</h4>
                        <p className="text-gray-600">
                            If you want to be surprised too, you can give the sealed results to our manager, and we will arrange the correct coloured looking cannons or cake cutting for you!
                        </p>
                    </div>
                </Container>
            </section>

            <PrivateBookingSection eventType="Christening / Baby Shower" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Are smoke cannons allowed?",
                        answer: "Yes, absolutely! We just ask that you do this in the garden area for safety and best visibility. Please let us know in advance."
                    },
                    {
                        question: "What happens if it rains?",
                        answer: "We always have an indoor backup plan. While smoke cannons might be tricky indoors, we can switch to a balloon pop or cake revealing inside our function area."
                    },
                    {
                        question: "Is there a hire fee?",
                        answer: "We generally don't charge a venue hire fee if you are ordering food/buffet for a minimum number of guests. Contact us for specifics."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Ready to Pop the Question?"
                description="(The gender question, that is!) Book your reveal today."
                buttons={[
                    {
                        text: "👶 Enquire Now",
                        href: "/private-hire#enquiry",
                        variant: "primary"
                    },
                    {
                        text: "📞 Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "reveal_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
