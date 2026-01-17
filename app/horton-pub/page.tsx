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
    title: 'Horton Pub & Dining | The Anchor - Your Local Village Pub',
    description: `${BRAND.name} in Stanwell Moor is your closest traditional village pub. Just 2 mins from Horton. Free parking, Sunday roasts, and real ales.`,
    keywords: 'horton pub, pub near horton, horton village pub, pubs in horton berkshire, the anchor stanwell moor',
    openGraph: {
        title: 'The Anchor - Traditional Pub Near Horton',
        description: 'Your local village pub, just a 2-minute drive from Horton. Authentic British food, real ales, and a warm welcome.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Anchor - Traditional Pub Near Horton',
        description: 'Your local village pub, just a 2-minute drive from Horton. Authentic British food, real ales, and a warm welcome.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/horton-pub'
    }
}

export default async function HortonPubPage() {
    const { rating, reviewCount } = await getBusinessStats()

    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["Restaurant", "BarOrPub"],
        "@id": "https://www.the-anchor.pub/horton-pub#business",
        "name": `${BRAND.name} - Near Horton`,
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
                "name": "Horton"
            },
            {
                "@type": "City",
                "name": "Stanwell Moor"
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
        "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/horton-pub"
    }

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Locations', url: '/locations' },
        { name: 'Horton Pub', url: '/horton-pub' }
    ])

    const directionsSchema = generateHowToDirectionsSchema(
        'Horton',
        'The Anchor - Heathrow Pub & Dining',
        [
            'Head east on Horton Road',
            'Continue straight for approximately 1 mile',
            'Cross the M25 bridge',
            'The Anchor will be on your left in Stanwell Moor village',
            'Park for free in our large car park'
        ]
    )

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
            />

            <HeroWrapper
                route="/horton-pub"
                title="Your Local Village Pub Near Horton"
                description="Just a 2-minute drive or short walk from Horton village"
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="horton_pub_hero"
                        context="location_horton"
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
                            Horton Pub - Traditional British Pub Just 1 Mile Away
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            The Anchor in Stanwell Moor is practically in Horton! We are your closest traditional pub with food, offering a warm welcome to our neighbours.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="A Proper Village Pub for Horton Residents"
                            subtitle="Whether you're walking over for a pint or driving over for Sunday lunch, we are Horton's local choice for great food and entertainment."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🚶",
                                    title: "Walking Distance",
                                    description: "A pleasant 20-minute walk or 2-minute drive from Horton village",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🥘",
                                    title: "Sunday Roasts",
                                    description: "The best roast in the area - worth the short hop over the motorway",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍻",
                                    title: "Real Ales",
                                    description: "Properly kept ales and a great wine selection",
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
                            title="Why Horton Locals Choose The Anchor"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-green-50 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-green-800 mb-4">Community Connections</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• Many Horton residents are already regulars</li>
                                    <li>• We support local events and charities</li>
                                    <li>• A true village atmosphere, just like home</li>
                                    <li>• Dog friendly - perfect for walkers</li>
                                </ul>
                            </div>

                            <div className="bg-amber-50 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-amber-800 mb-4">Entertainment Nearby</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• Monthly Quiz Nights (Short taxi ride home!)</li>
                                    <li>• Drag Shows & Live Music</li>
                                    <li>• Cash Bingo Nights</li>
                                    <li>• Sky & TNT Sports on big screens</li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-lg text-gray-700 mb-6">
                                Looking for a change of scenery without the travel? We're right on your doorstep.
                            </p>
                            <DirectionsButton
                                href="https://maps.google.com/maps?saddr=Horton+Berkshire&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                                source="horton_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Horton"
                            >
                                📍 Get Directions from Horton (2 mins)
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
                        <p className="mt-4 text-gray-700">
                            Kitchen closes earlier - check times for food service
                        </p>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How close is The Anchor to Horton?",
                        answer: "We are extremely close! It is just a 2-minute drive (approx. 1 mile) along Horton Road. Many locals also enjoy the walk between the villages in good weather."
                    },
                    {
                        question: "Is The Anchor dog friendly?",
                        answer: "Yes, we are very dog friendly! We love welcoming dogs from Horton, whether you've driven over or enjoyed a dog walk to get here. Water bowls and biscuits are usually available."
                    },
                    {
                        question: "Do you serve Sunday Roast?",
                        answer: "Yes, our Sunday Roasts are famous in the area. We serve them every Sunday from 12pm. Booking is highly recommended as we often fill up with locals from Stanwell Moor and Horton."
                    },
                    {
                        question: "Is there parking?",
                        answer: "Yes, we have a large free car park with 20 spaces, making it very easy to pop over from Horton for dinner without worrying about parking."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Your Neighbouring Village Pub"
                description="Great food, cold drinks, and good company - just 1 mile away."
                buttons={[
                    {
                        text: "📞 Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "horton_pub_cta",
                        variant: "secondary"
                    },
                    {
                        text: "🎉 Book an Event",
                        href: "/book-event",
                        variant: "white"
                    },
                    {
                        text: "🍽️ View Menu",
                        href: "/food-menu",
                        variant: "white"
                    }
                ]}
                variant="green"
                footer="Free Parking • Dog Friendly • 2 Minutes from Horton"
            />
        </>
    )
}
