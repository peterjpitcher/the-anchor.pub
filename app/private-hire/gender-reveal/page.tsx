import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

export const metadata: Metadata = {
    title: 'Gender Reveal Party Venue | The Anchor',
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
                variant="feature"
                title="Gender Reveal Parties"
                description="The perfect setting to share your exciting news"

                image={{ src: DEFAULT_CORPORATE_IMAGE, alt: "Gender reveal party" }}
                primaryCta={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            Enquire Now
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="reveal_hero" variant="secondary">
                        Call {CONTACT.phone}
                    </PhoneButton>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10–200 guests</span>
                    </div>
                }
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4" as="h1" seo={{ structured: true, speakable: true }}>
                            Gender Reveal Party Venue Near Heathrow
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Gender reveals are all about the moment — and the photos! The Anchor offers extensive outdoor space ideal for smoke cannons, balloon pops, or confetti showers, followed by a relaxed celebration with your loved ones.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="A Venue Designed for Celebrations"
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Garden Space",
                                    description: "Our large beer garden is the safest and best place for smoke cannons and outdoor reveals.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Afternoon Tea",
                                    description: "Ask about our buffet or afternoon tea style packages for a classy touch.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Family Friendly",
                                    description: "Plenty of space for kids to run around while the adults celebrate.",
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
                    <SectionHeader title="Venue Layout Options" />
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-3 text-anchor-cream-text">Garden Reveal</h3>
                            <p className="text-anchor-cream-text/70 mb-4">
                                Our enclosed beer garden is the ideal setting for an outdoor reveal. There is ample open space for smoke cannons, confetti poppers, or balloon drops. Guests can gather in a semicircle, creating a natural amphitheatre for the big moment and your photos.
                            </p>
                            <ul className="text-sm text-anchor-cream-text/70 space-y-1">
                                <li>Best for smoke cannons and outdoor confetti</li>
                                <li>Natural light for great photographs</li>
                                <li>Space for guests to form a viewing circle</li>
                            </ul>
                        </div>
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-3 text-anchor-cream-text">Indoor Reveal</h3>
                            <p className="text-anchor-cream-text/70 mb-4">
                                Prefer to keep things inside? Our function area can be arranged for an indoor reveal. Balloon pops, cake cuts, or confetti cannons all work well indoors. We can clear space and arrange seating to give you a clear reveal zone.
                            </p>
                            <ul className="text-sm text-anchor-cream-text/70 space-y-1">
                                <li>Ideal for cake cuts and balloon pops</li>
                                <li>Comfortable regardless of weather</li>
                                <li>Flexible furniture layout</li>
                            </ul>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto bg-anchor-bg border border-anchor-gold/20 rounded-xl p-6">
                        <h3 className="font-bold text-anchor-cream-text mb-3">Weather Contingency</h3>
                        <p className="text-anchor-cream-text/70">
                            We always plan for the British weather. If you are hoping for a garden reveal but conditions are poor on the day, we will switch seamlessly to our indoor backup plan. We discuss your preferred reveal method and backup option at the time of booking so that nothing is left to chance.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader title="Photo and Video Setup" />
                    <div className="max-w-3xl mx-auto">
                        <p className="text-anchor-cream-text/70 text-center mb-6">
                            The reveal moment deserves to be captured perfectly. Here is what we provide and what you should plan to bring.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                                <h4 className="font-semibold text-anchor-gold-vivid mb-3">What we provide</h4>
                                <ul className="text-sm text-anchor-cream-text/70 space-y-2">
                                    <li>A reserved and cleared reveal space</li>
                                    <li>Help positioning guests for the best angle</li>
                                    <li>Assistance from our team to coordinate timing</li>
                                    <li>A &quot;keeper of the gender&quot; if you want to be surprised too</li>
                                </ul>
                            </div>
                            <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                                <h4 className="font-semibold text-anchor-gold-vivid mb-3">What to bring</h4>
                                <ul className="text-sm text-anchor-cream-text/70 space-y-2">
                                    <li>Your smoke cannons, confetti poppers, or reveal prop</li>
                                    <li>A photographer or nominated family member with a phone</li>
                                    <li>Any backdrop, banners, or balloon arrangements</li>
                                    <li>The sealed gender envelope (if using our keeper service)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-pink-400">The "It's a Girl" Package</h3>
                            <p className="mb-4 text-anchor-cream-text/70">Thinking pink? We can help you set up the area with pink napkins, allow space for pink balloon arches, and assist with the coordination of the reveal.</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-blue-400">The "It's a Boy" Package</h3>
                            <p className="mb-4 text-anchor-cream-text/70">Team Blue? We offer the same flexibility. Our staff are experts at keeping secrets if you want to hand us the envelope beforehand!</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center bg-anchor-bg-raised p-8 rounded-xl border border-dashed border-anchor-gold/30">
                        <h4 className="text-xl font-bold mb-2 text-anchor-cream-text">Need a "Keeper of the Gender"?</h4>
                        <p className="text-anchor-cream-text/70">
                            If you want to be surprised too, you can give the sealed results to our manager, and we will arrange the correct coloured looking cannons or cake cutting for you!
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-anchor-cream-text mb-4">Also Considering a Baby Shower?</h2>
                        <p className="text-anchor-cream-text/70 mb-6">
                            Many families combine their gender reveal with a baby shower celebration. Take a look at our baby shower page for afternoon tea packages, mocktail ideas, and games inspiration.
                        </p>
                        <Link
                            href="/private-hire/baby-showers"
                            className="inline-block bg-anchor-bg-raised border border-anchor-gold/30 rounded-lg px-6 py-3 text-anchor-gold-vivid font-semibold hover:bg-anchor-gold/10 transition-colors"
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
                        question: "Can I use the garden or indoors — or both?",
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
                        answer: "We generally do not charge a venue hire fee if you are ordering food or a buffet for a minimum number of guests. Contact us on 01753 682707 for specifics based on your guest count and plans."
                    },
                    {
                        question: "Can we combine a gender reveal with a baby shower?",
                        answer: "Absolutely. Many families host both on the same afternoon. We can structure the event so the shower activities and food come first, building up to the reveal moment at the right time."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Ready to Pop the Question?"
                description="(The gender question, that is!) Book your reveal today."
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
                        phoneSource: "reveal_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
