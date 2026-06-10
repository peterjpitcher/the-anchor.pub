import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BookTableButton } from '@/components/BookTableButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Pubs in Sunbury | Sunday Roasts & Free Parking',
    description: `Looking for pubs in Sunbury? ${BRAND.name} is a favourite for Sunbury residents. Exceptional Sunday roasts, stone-baked pizzas, family-friendly atmosphere, and free parking.`,
    openGraph: {
        title: 'Pubs in Sunbury | The Anchor Stanwell Moor',
        description: 'Worth the short drive from Sunbury for the best Sunday Roast in the area. Free parking and great value.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Sunbury | The Anchor Stanwell Moor',
        description: 'Worth the short drive from Sunbury for the best Sunday Roast in the area. Free parking and great value.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/sunbury-pub'
    }
}

export default function SunburyPubPage() {
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
        "priceRange": "££",
        "servesCuisine": ["British", "Traditional English", "Sunday Roast", "Pizza"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/sunbury-pub"
    }

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
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
            />

            <HeroWrapper
                route="/sunbury-pub"
                title="Destination Dining Near Sunbury"
                description="Escape the town centre for a traditional village experience"
                variant="default"
                primaryCta={
                    <BookTableButton source="sunbury_pub_hero" context="local_pub" variant="primary" size="lg">
                        Book a Table
                    </BookTableButton>
                }
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="section-spacing-sm bg-anchor-green-deep">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle
                            seo={{
                                structured: true,
                                speakable: true
                            }}
                            className="text-anchor-cream-text mb-4"
                        >
                            Pubs in Sunbury, The Best Sunday Roast Near You
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Many Sunbury residents make the short drive to The Anchor for our famous Sunday roasts. If you&rsquo;re looking for pubs near Sunbury with quality food, better value, and easy parking, we tick every box.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
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
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Stress-Free Parking",
                                    description: "Park right outside for free - no fighting for spaces",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "‍‍‍",
                                    title: "Family Friendly",
                                    description: "Relaxed atmosphere where kids are welcome",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
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

            {/* Local Knowledge Section */}
            <section className="section-spacing bg-anchor-green-deep border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Why Sunbury Residents Make the Trip"
                        />
                        <div className="prose prose-invert max-w-none space-y-4 text-anchor-cream-text/80">
                            <p>
                                Sunbury&rsquo;s got a decent high street, but if you&rsquo;re after a proper independent pub rather than another chain, the options thin out quickly. That&rsquo;s why a growing number of Sunbury residents have made The Anchor their regular. The drive is dead simple: head up the A308 past Sunbury Cross, through Ashford, and pick up the A30 towards Stanwell Moor. You&rsquo;ll be with us in about 15 minutes, even on a busy day.
                            </p>
                            <p>
                                Kempton Park regulars are some of our biggest fans. After a day at the races, the last thing you want is to fight through Sunbury traffic for an overpriced drink. Nip across to The Anchor instead, we&rsquo;re just off the A308, there&rsquo;s always parking, and you can settle into a proper pub with a pint to dissect the day&rsquo;s results. Race day Saturdays have become a bit of a tradition for a few Sunbury groups.
                            </p>
                            <p>
                                If you&rsquo;re a Thames Path walker or you spend your weekends around Sunbury Lock, you&rsquo;ll know that the riverside pub options can be heaving in summer. We offer the same relaxed, outdoor-drinking atmosphere in our beer garden, minus the crowds, with the added entertainment of watching 747s float overhead on their way into Heathrow. It&rsquo;s quite the backdrop for a Sunday roast.
                            </p>
                            <p>
                                We&rsquo;re also outside the ULEZ zone, which saves Sunbury drivers a few quid if they&rsquo;re coming from the London side. Free parking, no congestion charge worries, and proper pub prices that don&rsquo;t make you wince when you get to the bar. That&rsquo;s the deal.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
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
                        question: "Do I need to book for Sunday Roast?",
                        answer: "Yes, Sunday is our busiest day and we are often fully booked with regulars from Sunbury and surrounding areas. We recommend booking by Wednesday/Thursday for the coming Sunday."
                    }
                ]}
                className="bg-anchor-green-card"
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
