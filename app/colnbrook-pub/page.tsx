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
    title: 'Colnbrook & Poyle Pub | The Anchor - Food & Drinks',
    description: `${BRAND.name} is the perfect spot for Poyle Industrial Estate workers and Colnbrook residents. Great food, cold pints, and free parking just 2 miles away.`,
    keywords: 'pubs in colnbrook, pub near poyle industrial estate, lunch near colnbrook, after work drinks poyle, the anchor stanwell moor',
    openGraph: {
        title: 'The Anchor - Pub Near Colnbrook & Poyle',
        description: 'Perfect for after-work drinks or a team lunch. Just minutes from Poyle Industrial Estate and Colnbrook.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Anchor - Pub Near Colnbrook & Poyle',
        description: 'Perfect for after-work drinks or a team lunch. Just minutes from Poyle Industrial Estate and Colnbrook.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    })
}

export default async function ColnbrookPubPage() {
    const { rating, reviewCount } = await getBusinessStats()

    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["Restaurant", "BarOrPub"],
        "@id": "https://www.the-anchor.pub/colnbrook-pub#business",
        "name": `${BRAND.name} - Near Colnbrook`,
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
                "name": "Colnbrook"
            },
            {
                "@type": "City",
                "name": "Poyle"
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
        "servesCuisine": ["British", "Traditional English", "Sunday Roast", "Pizza", "Lunch"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/colnbrook-pub"
    }

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Locations', url: '/locations' },
        { name: 'Colnbrook & Poyle', url: '/colnbrook-pub' }
    ])

    const directionsSchema = generateHowToDirectionsSchema(
        'Colnbrook',
        'The Anchor - Heathrow Pub & Dining',
        [
            'From Colnbrook/Poyle, create the Horthon Road bridge',
            'Head towards Stanwell Moor',
            'The Anchor is in the centre of the village on your left'
        ]
    )

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
            />

            <HeroWrapper
                route="/colnbrook-pub"
                title="Pub & Dining Near Colnbrook & Poyle"
                description="The ideal local for Poyle Industrial Estate and Colnbrook residents"
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="colnbrook_pub_hero"
                        context="location_colnbrook"
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
                            Minutes from Poyle Industrial Estate & Colnbrook
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            Finish your shift and relax. We are the go-to pub for businesses in Poyle and residents of Colnbrook looking for quality food and a great atmosphere.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Perfect for After-Work Drinks & Team Lunches"
                            subtitle="Avoid the airport traffic and unwind in a proper pub."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "🍺",
                                    title: "After Work",
                                    description: "Cold biers, real ales, and a great wine list for the end of the day",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍔",
                                    title: "Great Food",
                                    description: "Hearty meals, burgers, and stone-baked pizzas to fuel your team",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🅿️",
                                    title: "Easy Parking",
                                    description: "Large free car park for vans and cars - no hassle",
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
                            title="Corporate & Team Events"
                        />

                        <div className="bg-blue-50 rounded-xl p-8 mb-8 text-center">
                            <h3 className="text-2xl font-bold text-blue-800 mb-4">Poyle Business Specials</h3>
                            <p className="text-gray-700 mb-6">
                                We regularly host team meetings, leaving dos, and Christmas parties for companies based in the Poyle Industrial Estate. We can offer buffet packages and private areas.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/corporate-events">
                                    <Button variant="primary">Corporate Info</Button>
                                </Link>
                                <PhoneButton phone={CONTACT.phone} source="colnbrook_corporate" variant="secondary">Call to Discuss</PhoneButton>
                            </div>
                        </div>

                        <div className="text-center">
                            <DirectionsButton
                                href="https://maps.google.com/maps?saddr=Colnbrook&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                                source="colnbrook_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Colnbrook"
                            >
                                📍 Get Directions from Colnbrook (5 mins)
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
                        question: "How far is The Anchor from Poyle Industrial Estate?",
                        answer: "We are less than 2 miles away, a very quick drive down Horton Road. Many workers join us for lunch or after their shift."
                    },
                    {
                        question: "Can you accommodate large work groups?",
                        answer: "Yes, we have plenty of space including a private function room. For large groups (8+), we recommend booking in advance so we can prepare tables for you."
                    },
                    {
                        question: "Is there parking for vans?",
                        answer: "Yes, our car park is spacious and can accommodate work vans easily (though unfortunately not HGVs)."
                    },
                    {
                        question: "Do you offer takeaway?",
                        answer: "We don't currently offer delivery, but you are welcome to order food to eat in or call ahead for collection if time is tight."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Your Local After-Work Spot"
                description="Great food and drink just minutes from the office."
                buttons={[
                    {
                        text: "📞 Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "colnbrook_pub_cta",
                        variant: "secondary"
                    },
                    {
                        text: "🎉 Book an Event",
                        href: "/book-event",
                        variant: "white"
                    },
                    {
                        text: "📍 Get Directions",
                        href: "https://maps.google.com/maps?saddr=Colnbrook&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ",
                        variant: "white"
                    }
                ]}
                variant="green"
                footer="Free Parking • Near Poyle Industrial Estate • Great Value"
            />
        </>
    )
}
