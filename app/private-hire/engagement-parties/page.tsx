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
    title: 'Engagement Party Venue Near Heathrow',
    description: `Engagement party venue near Heathrow and Staines. Buffets from £9.95pp, prosecco packages, and free parking at ${BRAND.name}. 10–50 guests.`,
    openGraph: {
        title: 'Engagement Party Venue | The Anchor Stanwell Moor',
        description: 'She said yes! Now let\'s celebrate. Discover our engagement party packages with prosecco, buffets, and private areas.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Engagement Party Venue | The Anchor Stanwell Moor',
        description: 'She said yes! Now let\'s celebrate. Discover our engagement party packages with prosecco, buffets, and private areas.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/engagement-parties'
    }
}

export default async function EngagementPartiesPage() {
    const { foodPackages } = await getCateringData()
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
        "description": "Engagement party venue near Heathrow Airport with buffets from £9.95pp, prosecco packages, and free parking. Private dining room for 10–50 guests in Stanwell Moor, Surrey.",
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
                route="/private-hire/engagement-parties"
                variant="feature"
                title="Engagement Party Venue Near Heathrow — celebrate at The Anchor"
                description="Buffets from £9.95pp, prosecco packages, free parking, and space for up to 50 guests"
               
                image={{ src: DEFAULT_CORPORATE_IMAGE, alt: "Engagement party setup" }}
                primaryCta={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            Enquire Now
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <PhoneButton phone={CONTACT.phone} source="engagement_hero" variant="secondary">
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
                            Engagement Party Venue Near Heathrow & Staines
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Congratulations on your engagement! Whether you want a quiet family dinner to share the news or a big bash with all your friends, The Anchor is an engagement party venue near Heathrow with free parking and space for 10 to 50 guests. Seven minutes from Terminal 5 in Stanwell Moor, we handle the catering, the drinks, and the space — you just turn up and celebrate.
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
                                    icon: "",
                                    title: "Prosecco Packages",
                                    description: "Pre-order welcome drinks for your guests to start the night right.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Flexible Buffets",
                                    description: "From finger food to hearty spreads, we cater to all budgets.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Music & Atmosphere",
                                    description: "Bring your own playlist or book our function area with space for a DJ.",
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
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="What's Included"
                            subtitle="Everything you need for your engagement party, nothing you don't."
                        />
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-anchor-cream-text">The Venue</h3>
                                <ul className="space-y-2 text-anchor-cream-text/70">
                                    <li><strong>Room hire:</strong> a simple hire fee covers your space (varies by day and party size). No minimum spend on top — you only pay for what you order.</li>
                                    <li><strong>Dining room:</strong> 26 seated with standing room for more. French doors open straight onto the beer garden in summer.</li>
                                    <li><strong>Capacity:</strong> 10 to 50 guests. Smaller groups get a reserved area; larger parties get the dining room to yourselves.</li>
                                    <li><strong>Decorations welcome:</strong> Balloons, banners, table decorations, engagement signs — go for it. We just ask for no confetti or glitter.</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-anchor-cream-text">The Practical Bits</h3>
                                <ul className="space-y-2 text-anchor-cream-text/70">
                                    <li><strong>Free parking:</strong> 20 spaces right outside the door. No meters, no time limits.</li>
                                    <li><strong>7 minutes from Heathrow T5</strong> — handy if guests are flying in for the celebration.</li>
                                    <li><strong>AV equipment:</strong> Projector, screen, and sound system available for slideshows or speeches.</li>
                                    <li><strong>Deposit:</strong> &pound;250 to secure your date, deducted from the final bill.</li>
                                    <li><strong>Dedicated events coordinator</strong> to help with planning and on-the-day logistics.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Why a Pub Engagement Party?"
                            subtitle="More atmosphere, less hassle, and you'll actually enjoy it."
                        />
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center space-y-2">
                                <p className="text-3xl font-bold text-anchor-gold-vivid">No min spend</p>
                                <p className="text-sm text-anchor-cream-text/70">Pay for what you order</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-3xl font-bold text-anchor-gold-vivid">From &pound;9.95pp</p>
                                <p className="text-sm text-anchor-cream-text/70">Buffet catering</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-3xl font-bold text-anchor-gold-vivid">20 free</p>
                                <p className="text-sm text-anchor-cream-text/70">Parking spaces</p>
                            </div>
                        </div>
                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
                            <p>
                                Hotel function rooms are expensive. Home parties mean you&apos;re cleaning up at midnight. A pub engagement party gives you the atmosphere, the catering, and the bar — without the aftermath.
                            </p>
                            <p>
                                At The Anchor, your engagement party feels like a celebration, not a corporate event. Your guests can spread between the dining room and the beer garden, order from the bar at their own pace, and stay as late as the evening takes them. There&apos;s no ticking clock and no room turnover pressure.
                            </p>
                            <p>
                                We&apos;re a proper village pub in Stanwell Moor, not a chain venue. Our events coordinator works with you to get the details right — from the welcome prosecco to the food service timing — so you can focus on enjoying the night.
                            </p>
                        </div>
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
                                    <li>Buffet packages to suit all budgets</li>
                                    <li>Space for entertainment</li>
                                </ul>
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
                            subtitle="Prices per person, minimum guest numbers may apply"
                            showDescription={true}
                            filterNames={['Sandwich Buffet', 'Finger Buffet', 'Premium Buffet', 'Burger Buffet', 'Afternoon Tea', 'Prosecco Afternoon Tea']}
                        />
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

            <section className="py-8 bg-anchor-bg border-b border-anchor-gold/15">
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
                        question: "How much does an engagement party at The Anchor cost?",
                        answer: "A room hire fee applies and varies by day and party size — there's no minimum spend on top, so you only pay for what you order. Buffets start at £9.95 per person, welcome prosecco is £7.99 per person, and the deposit is £250 (deducted from your final bill). Use our pricing calculator on this page for an instant estimate, or call 01753 682707 for a personalised quote."
                    },
                    {
                        question: "How many guests can you fit for an engagement party?",
                        answer: "Our private dining room seats 26 with standing room for more. For larger engagement parties, we can accommodate up to 50 guests across the dining room and beer garden. Groups of 10 to 50 are our sweet spot."
                    },
                    {
                        question: "Can we decorate the area?",
                        answer: "Absolutely. Bring balloons, banners, table decorations, engagement signs — whatever makes it feel like yours. We just ask for no confetti or glitter as it's tricky to clean up."
                    },
                    {
                        question: "Do you require a deposit?",
                        answer: "Yes, we ask for a £250 deposit to secure your date. This is fully deducted from the final bill, so it's not an extra cost — just a commitment to the booking."
                    },
                    {
                        question: "Can we bring a cake?",
                        answer: "Please do! We'll store it in our kitchen until you're ready. We can provide plates, napkins, and a knife for cutting. Let us know when you want it brought out and we'll time it perfectly."
                    },
                    {
                        question: "Is there parking for engagement party guests?",
                        answer: "Yes. We have 20 free parking spaces right outside the pub — no meters, no time limits. It's one of the biggest advantages of choosing a pub venue over a town-centre hotel."
                    },
                    {
                        question: "How far in advance should we book?",
                        answer: "We recommend booking at least 4 weeks ahead for Friday and Saturday evenings. Midweek and Sunday dates are usually easier to get at shorter notice. Popular months like December and summer fill up faster."
                    },
                    {
                        question: "Can we have music or a DJ?",
                        answer: "Yes. Our function area has space for a DJ setup and we have a sound system available. You can also bring your own playlist — just let our events coordinator know what you need and we'll set it up."
                    },
                    {
                        question: "What food options are there?",
                        answer: "We offer buffets from £9.95 per person (sandwich, finger, burger, premium, and pizza options), or you can let guests order from the à la carte menu. For drinks, welcome prosecco packages start at £7.99 per person, or we can set up a bar tab."
                    },
                    {
                        question: "Where is The Anchor?",
                        answer: "We're in Stanwell Moor, Surrey — 7 minutes from Heathrow Terminal 5 and about 8 minutes from Staines. Postcode for sat nav: TW19 6AQ. We're just off the M25 at Junction 14."
                    }
                ]}
                className="bg-anchor-bg-card"
            />
        </>
    )
}
