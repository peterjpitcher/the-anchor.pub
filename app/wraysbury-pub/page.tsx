import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Pubs in Wraysbury | Dining & Free Parking',
    description: `${BRAND.name} is a top-rated pub just 5 mins from Wraysbury. Famous Sunday Roasts, stone-baked pizzas, and live entertainment. Free parking & family friendly.`,
    openGraph: {
        title: 'Pubs in Wraysbury | Dining, Entertainment & Free Parking | The Anchor',
        description: 'Looking for a change from the local? We are just 5 minutes from Wraysbury with great food and entertainment.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Wraysbury | Dining, Entertainment & Free Parking | The Anchor',
        description: 'Looking for a change from the local? We are just 5 minutes from Wraysbury with great food and entertainment.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/wraysbury-pub'
    }
}

export default function WraysburyPubPage() {
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["Restaurant", "BarOrPub"],
        "@id": "https://www.the-anchor.pub/wraysbury-pub#business",
        "name": `${BRAND.name} - Near Wraysbury`,
        "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": CONTACT.coordinates.lat,
            "longitude": CONTACT.coordinates.lng
        },
        "areaServed": [
            {
                "@type": "City",
                "name": "Wraysbury"
            },
            {
                "@type": "City",
                "name": "Horton"
            }
        ],
        "priceRange": "££",
        "servesCuisine": ["British", "Traditional English", "Sunday Roast", "Pizza"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/wraysbury-pub"
    }

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Locations', url: '/locations' },
        { name: 'Wraysbury Pub', url: '/wraysbury-pub' }
    ])

    const directionsSchema = generateHowToDirectionsSchema(
        'Wraysbury',
        'The Anchor - Heathrow Pub & Dining',
        [
            'From Wraysbury, head towards Horton',
            'Continue on Horton Road past the village',
            'Cross the M25 bridge into Stanwell Moor',
            'The Anchor is on your left with a large free car park'
        ]
    )

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
            />

            <HeroWrapper
                route="/wraysbury-pub"
                title="The Perfect Alternative to Your Wraysbury Local"
                description="Just a short 5-minute drive from Wraysbury Village"
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="wraysbury_pub_hero"
                        context="location_wraysbury"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Book a Table
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            View Menu
                        </Button>
                    </Link>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
                    </div>
                }
            />

            <section className="py-8 bg-anchor-bg">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle
                            seo={{
                                structured: true,
                                speakable: true
                            }}
                            className="text-anchor-cream-text mb-4"
                        >
                            Wraysbury Pub & Dining - Worth the Short Drive
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Love Wraysbury living but fancy a change of scenery? The Anchor offers a vibrant atmosphere, unique entertainment, and fantastic food just minutes away.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Why Wraysbury Residents Visit The Anchor"
                            subtitle="We're a popular choice for Wraysbury locals looking for great value and something different."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Stone-Baked Pizza",
                                    description: "Authentic stone-baked pizzas served Tuesday-Saturday from £12",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Live Entertainment",
                                    description: "Music Bingo with Nikki Manfadge, quiz nights, and bingo - lively events you won't find everywhere (see /whats-on)",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Sunday Roast",
                                    description: "A proper home-cooked roast with all the trimmings",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
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
                            title="Events & Private Hire near Wraysbury"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="card-dark rounded-none p-6">
                                <h3 className="text-xl font-bold text-blue-800 mb-4">Celebrations</h3>
                                <p className="text-anchor-cream-text/70 mb-4">
                                    Planning a party? We frequently host birthdays and celebrations for Wraysbury residents. Our private hire options are flexible and affordable.
                                </p>
                                <Link href="/private-hire" className="text-blue-600 font-bold hover:underline">
                                    View Private Hire Options →
                                </Link>
                            </div>

                            <div className="card-dark rounded-none p-6">
                                <h3 className="text-xl font-bold text-purple-800 mb-4">What's On</h3>
                                <p className="text-anchor-cream-text/70 mb-4">
                                    Join us for Music Bingo hosted by Nikki Manfadge or test your knowledge at our quiz nights. See /whats-on for the latest listings.
                                </p>
                                <Link href="/whats-on" className="text-purple-600 font-bold hover:underline">
                                    Check Event Calendar →
                                </Link>
                            </div>
                        </div>

                        <div className="text-center">
                            <DirectionsButton
                                href="https://maps.google.com/maps?saddr=Wraysbury&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                                source="wraysbury_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Wraysbury"
                            >
                                Get Directions from Wraysbury (5 mins)
                            </DirectionsButton>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Local Knowledge Section */}
            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Your Local Beyond the Village"
                        />
                        <div className="prose prose-invert max-w-none space-y-4 text-anchor-cream-text/80">
                            <p>
                                Wraysbury is a lovely village, but let&rsquo;s be honest &mdash; pubs in Wraysbury are limited. When you fancy a change of scene without a major expedition, The Anchor is right there. Head along the B376 through Hythe End, past the sailing club, and keep going on Horton Road. You&rsquo;ll cross the M25 bridge and we&rsquo;re immediately on your left. Five minutes, tops. If you&rsquo;re coming from the other end of the village near the station, you can also cut across via the M25 at Junction 13 &mdash; it&rsquo;s just as quick.
                            </p>
                            <p>
                                We think of ourselves as Wraysbury&rsquo;s second local. Plenty of your neighbours are already regulars here &mdash; some walk over on sunny evenings along Horton Road, others drive across after a day at the reservoir. If you&rsquo;re into the Wraysbury reservoir walks or you&rsquo;ve been birdwatching around the gravel pits, we&rsquo;re the natural finishing point: a cold pint, a stone-baked pizza, and a seat in the garden watching the planes come in low overhead.
                            </p>
                            <p>
                                The Wraysbury Dive Centre crowd know us well too. After a few hours in cold water, there&rsquo;s nothing better than warming up with a proper meal in a proper pub. We&rsquo;re dog-friendly throughout, so if the Labrador came along for the reservoir walk, bring them in &mdash; water bowls are always out.
                            </p>
                            <p>
                                Non-drivers aren&rsquo;t left out either. Wraysbury station is on the Windsor &amp; Eton line, and a taxi from there to us is barely five pounds. A few of our regulars do exactly that on quiz nights &mdash; taxi over, have a couple of drinks, taxi home. Easy.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-2xl mx-auto text-center">
                        <SectionHeader
                            title="Opening Hours"
                        />
                        <BusinessHours />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How far is The Anchor from Wraysbury?",
                        answer: "We are approximately 2 miles away, which is a quick 5-minute drive via Horton Road. It's an easy journey with no major traffic lights."
                    },
                    {
                        question: "Do you have parking?",
                        answer: "Yes, we have 20 free parking spaces on-site. It's stress-free parking, unlike some village centres."
                    },
                    {
                        question: "Is the pub family friendly?",
                        answer: "Absolutely. We welcome families from Wraysbury for lunch and dinner. We have a children's menu and a large beer garden for the warmer months."
                    },
                    {
                        question: "Do you serve food all day?",
                        answer: "Our kitchen times vary slightly by day (generally open for dinner Tue-Fri and all day Sat-Sun). Please check our opening hours section for the latest service times."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Worth the 5 Minute Drive"
                description="Experience the best hospitality in the area at The Anchor."
                buttons={[
                    {
                        text: "Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "wraysbury_pub_cta",
                        variant: "secondary"
                    },
                    {
                        text: "Book an Event",
                        href: "/private-hire#enquiry",
                        variant: "white"
                    },
                    {
                        text: "Get Directions",
                        href: "https://maps.google.com/maps?saddr=Wraysbury&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ",
                        variant: "white"
                    }
                ]}
                variant="green"
                footer="Free Parking • 5 Minutes from Wraysbury • Great Food"
            />
        </>
    )
}
