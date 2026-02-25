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
import { getBusinessStats } from '@/lib/schema-with-reviews'

export const metadata: Metadata = {
    title: 'Pub Near Wraysbury | The Anchor - Dining & Entertainment',
    description: `${BRAND.name} is a top-rated pub just 5 mins from Wraysbury. Famous Sunday Roasts, stone-baked pizzas, and live entertainment. Free parking & family friendly.`,
    keywords: 'pub near wraysbury, wraysbury pubs, sunday roast wraysbury, restaurants near wraysbury, the anchor stanwell moor',
    openGraph: {
        title: 'The Anchor - Traditional Pub Near Wraysbury',
        description: 'Looking for a change from the local? We are just 5 minutes from Wraysbury with great food and entertainment.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Anchor - Traditional Pub Near Wraysbury',
        description: 'Looking for a change from the local? We are just 5 minutes from Wraysbury with great food and entertainment.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/wraysbury-pub'
    }
}

export default async function WraysburyPubPage() {
    const { rating, reviewCount } = await getBusinessStats()

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
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": reviewCount,
            "bestRating": "5",
            "worstRating": "1"
        },
        "priceRange": "moderate",
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
                        📞 Book a Table
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🍽️ View Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle
                            seo={{
                                structured: true,
                                speakable: true
                            }}
                            className="text-anchor-green mb-4"
                        >
                            Wraysbury Pub & Dining - Worth the Short Drive
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            Love Wraysbury living but fancy a change of scenery? The Anchor offers a vibrant atmosphere, unique entertainment, and fantastic food just minutes away.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
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
                                    icon: "🍕",
                                    title: "Stone-Baked Pizza",
                                    description: "Authentic pizzas served Tuesday-Saturday (and BOGOF on Tuesdays!)",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🎭",
                                    title: "Live Entertainment",
                                    description: "Music Bingo with Nikki Manfadge, quiz nights, and bingo - lively events you won't find everywhere (see /whats-on)",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🥩",
                                    title: "Sunday Roast",
                                    description: "A proper home-cooked roast with all the trimmings",
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
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Events & Private Hire near Wraysbury"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-blue-50 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-blue-800 mb-4">Celebrations</h3>
                                <p className="text-gray-700 mb-4">
                                    Planning a party? We frequently host birthdays and celebrations for Wraysbury residents. Our private hire options are flexible and affordable.
                                </p>
                                <Link href="/private-hire" className="text-blue-600 font-bold hover:underline">
                                    View Private Hire Options →
                                </Link>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-purple-800 mb-4">What's On</h3>
                                <p className="text-gray-700 mb-4">
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
                                📍 Get Directions from Wraysbury (5 mins)
                            </DirectionsButton>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
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
                className="bg-white"
            />

            <CTASection
                title="Worth the 5 Minute Drive"
                description="Experience the best hospitality in the area at The Anchor."
                buttons={[
                    {
                        text: "📞 Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "wraysbury_pub_cta",
                        variant: "secondary"
                    },
                    {
                        text: "🎉 Book an Event",
                        href: "/private-hire#enquiry",
                        variant: "white"
                    },
                    {
                        text: "📍 Get Directions",
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
