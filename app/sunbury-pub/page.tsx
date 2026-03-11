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
    title: 'Pub Near Sunbury-on-Thames | The Anchor - Sunday Roasts',
    description: `${BRAND.name} is a favourite destination for Sunbury residents. Known for exceptional Sunday Roasts, stone-baked pizzas, and a family-friendly atmosphere. Easy parking.`,
    keywords: 'pub near sunbury on thames, sunbury pubs, sunday lunch sunbury, best roast near sunbury, the anchor stanwell moor',
    openGraph: {
        title: 'The Anchor - Destination Dining Near Sunbury',
        description: 'Worth the short drive from Sunbury for the best Sunday Roast in the area. Free parking and great value.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Anchor - Destination Dining Near Sunbury',
        description: 'Worth the short drive from Sunbury for the best Sunday Roast in the area. Free parking and great value.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/sunbury-pub'
    }
}

export default async function SunburyPubPage() {
    const { rating, reviewCount } = await getBusinessStats()

    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["Restaurant", "BarOrPub"],
        "@id": "https://www.the-anchor.pub/sunbury-pub#business",
        "name": `${BRAND.name} - Near Sunbury`,
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
                "name": "Sunbury-on-Thames"
            },
            {
                "@type": "City",
                "name": "Upper Halliford"
            }
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": reviewCount,
            "bestRating": "5",
            "worstRating": "1"
        },
        "priceRange": "££",
        "servesCuisine": ["British", "Traditional English", "Sunday Roast", "Pizza"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/sunbury-pub"
    }

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Locations', url: '/locations' },
        { name: 'Sunbury Pub', url: '/sunbury-pub' }
    ])

    const directionsSchema = generateHowToDirectionsSchema(
        'Sunbury-on-Thames',
        'The Anchor - Heathrow Pub & Dining',
        [
            'From Sunbury, take the A308 towards Staines',
            'Join the A30 towards Heathrow',
            'Turn off at the Stanwell Moor junction',
            'The Anchor is in the village centre with free parking'
        ]
    )

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
            />

            <HeroWrapper
                route="/sunbury-pub"
                title="Destination Dining Near Sunbury"
                description="Escape the town centre for a traditional village experience"
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="sunbury_pub_hero"
                        context="location_sunbury"
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
                            The Best Sunday Roast Near Sunbury
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Many Sunbury residents make the short drive to The Anchor for our famous Sunday lunches. We offer the perfect mix of quality food, better value, and easy parking that's hard to find in Sunbury itself.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Worth the Trip from Sunbury-on-Thames"
                            subtitle="Discover why we are a favourite destination for Sunbury families and foodies."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Famous Roasts",
                                    description: "Generous portions of high-quality meat and fresh veg - booking essential!",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Stress-Free Parking",
                                    description: "Park right outside for free - no fighting for spaces",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "‍‍‍",
                                    title: "Family Friendly",
                                    description: "Relaxed atmosphere where kids are welcome",
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
                            title="A Great Venue for Sunbury Celebrations"
                        />

                        <div className="card-dark rounded-none p-8 mb-8 text-center">
                            <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">Milestone Birthdays & Events</h3>
                            <p className="text-anchor-cream-text/70 mb-6">
                                Struggling to find a venue in Sunbury that ticks all the boxes? We offer private rooms, flexible catering, and plenty of parking for your guests coming from all over.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/private-hire">
                                    <Button variant="primary">Use Our Venue Finder</Button>
                                </Link>
                                <PhoneButton phone={CONTACT.phone} source="sunbury_events" variant="secondary">Call for a Quote</PhoneButton>
                            </div>
                        </div>

                        <div className="text-center">
                            <DirectionsButton
                                href="https://maps.google.com/maps?saddr=Sunbury-on-Thames&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                                source="sunbury_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Sunbury"
                            >
                                Get Directions from Sunbury (15 mins)
                            </DirectionsButton>
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
                        question: "How long is the drive from Sunbury?",
                        answer: "It generally takes about 10-15 minutes depending on traffic. It's a straightforward drive down the A308/A30."
                    },
                    {
                        question: "Why should I drive to The Anchor instead of staying in Sunbury?",
                        answer: "We offer better value for money, guaranteed free parking, and a more relaxed village atmosphere. Plus, many say our Sunday Roast is superior!"
                    },
                    {
                        question: "Do I need to book for Sunday Lunch?",
                        answer: "Yes, Sunday is our busiest day and we are often fully booked with regulars from Sunbury and surrounding areas. We recommend booking by Wednesday/Thursday for the coming Sunday."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Experience The Anchor"
                description="Just a short drive for great food and hospitality."
                buttons={[
                    {
                        text: "Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "sunbury_pub_cta",
                        variant: "secondary"
                    },
                    {
                        text: "Book an Event",
                        href: "/private-hire#enquiry",
                        variant: "white"
                    },
                    {
                        text: "Get Directions",
                        href: "https://maps.google.com/maps?saddr=Sunbury-on-Thames&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ",
                        variant: "white"
                    }
                ]}
                variant="green"
                footer="Free Parking • Authentic Sunday Roast • Private Hire"
            />
        </>
    )
}
