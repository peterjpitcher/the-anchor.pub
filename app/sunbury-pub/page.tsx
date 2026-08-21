import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
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
    description: `Looking for pubs near Sunbury? Sunday roasts, stone-baked pizzas, a family-friendly welcome and free parking, a short drive away.`,
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

            <InteriorHero
        image="/images/page-headers/sunbury-pub/find-us.jpg"
        crumb="Sunbury"
        title="Destination Dining Near Sunbury"
        lead="Escape the town centre for a traditional village experience"
        actions={
          <BookTableButton source="sunbury_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle
                            seo={{
                                structured: true,
                                speakable: true
                            }}
                            className="mb-4"
                        >
                            Pubs in Sunbury, The Best Sunday Roast Near You
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Many Sunbury residents make the short drive to The Anchor for our famous Sunday roasts. If you&rsquo;re looking for pubs near Sunbury with quality food, better value, and easy parking, we tick every box.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading
                            title="Worth the Trip from Sunbury-on-Thames"
                            lead="Discover why we are a favourite destination for Sunbury families and foodies."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { title: "Famous Roasts", description: "Generous portions of high-quality meat and fresh veg, with walk-ins welcome from 1pm to 6pm" },
                                { title: "Stress-Free Parking", description: "Park right outside for free - no fighting for spaces" },
                                { title: "Family Friendly", description: "Relaxed atmosphere where kids are welcome" },
                            ].map((item) => (
                                <Card key={item.title} accent>
                                    <CardBody className="p-6 text-center">
                                        <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                                        <p className="text-sm text-ink-muted">{item.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="A Great Venue for Sunbury Celebrations"
                        />

                        <Card accent className="mb-8">
                            <CardBody className="p-8 text-center">
                                <h3 className="font-display text-h3 text-ink-strong mb-4">Milestone Birthdays & Events</h3>
                                <p className="text-ink-muted mb-6">
                                    Struggling to find a venue in Sunbury that ticks all the boxes? We offer private rooms, flexible catering, and plenty of parking for your guests coming from all over.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Link href="/private-hire">
                                        <Button variant="primary">Use Our Venue Finder</Button>
                                    </Link>
                                    <PhoneButton phone={CONTACT.phone} source="sunbury_events" variant="outline">Call for a Quote</PhoneButton>
                                </div>
                            </CardBody>
                        </Card>

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
            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Why Sunbury Residents Make the Trip"
                        />
                        <div className="prose max-w-none space-y-4 text-ink-muted">
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

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading
                            title="Opening Hours"
                        />
                        <BusinessHours/>
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
                        answer: "No. We serve roasts every Sunday from 1pm to 6pm and walk-ins are welcome, with no pre-order needed. Booking is still worth it at peak times or for a bigger group, and groups of more than 20 need to book by phone on 01753 682707."
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Experience The Anchor"
                copy="Just a short drive for great food and hospitality."
            >
                <Link href={CONTACT.phoneHref}>
                    <Button variant="primary" size="lg">Book a Table</Button>
                </Link>
                <Link href="/private-hire#enquiry">
                    <Button variant="outline" size="lg">Book an Event</Button>
                </Link>
                <Link href="https://maps.google.com/maps?saddr=Sunbury-on-Thames&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ">
                    <Button variant="outline" size="lg">Get Directions</Button>
                </Link>
            </CtaBand>
        </>
    )
}
