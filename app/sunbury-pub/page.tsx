import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { Metadata } from 'next'
import { CONTACT, BRAND, PRICE_RANGE, DIRECTIONS_URL } from '@/lib/constants'
import { PARKING_WORDING, ULEZ_WORDING } from '@/lib/approved-wording'
import { bookingConfig } from '@/lib/booking-config'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Pubs in Sunbury | Sunday Roasts & Free Parking',
    description: `Looking for pubs near Sunbury? Sunday roasts, stone-baked pizzas, a family-friendly welcome and free parking, a short drive away.`,
    openGraph: {
        title: 'Pubs in Sunbury | The Anchor Stanwell Moor',
        description: 'Worth the short drive from Sunbury for our famous Sunday roast. Free parking and great value.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Sunbury | The Anchor Stanwell Moor',
        description: 'Worth the short drive from Sunbury for our famous Sunday roast. Free parking and great value.',
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
        "priceRange": PRICE_RANGE,
        "servesCuisine": ["British", "Traditional English", "Sunday Roast", "Pizza"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/sunbury-pub"
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
            />

            <InteriorHero
        image="/images/page-headers/sunbury-pub/find-us.jpg"
        crumb="Sunbury"
        title="Destination Dining Near Sunbury"
        lead="A traditional village pub, a short drive from Sunbury"
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
                            Pubs in Sunbury, a Sunday Roast Worth the Drive
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Many Sunbury residents make the short drive to The Anchor for our famous Sunday roasts. If you&rsquo;re looking for pubs near Sunbury with quality food, fair village prices and free parking, come and see us.
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
                                { title: "Stress-Free Parking", description: PARKING_WORDING },
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
                                    The dining room, the garden or the whole pub can be hired by the hour. Prices and menus are on the private hire page.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Button asChild variant="primary">
                                        <Link href="/private-hire">See Private Hire</Link>
                                    </Button>
                                    <PhoneButton phone={CONTACT.phone} source="sunbury_events" variant="outline">Call for a Quote</PhoneButton>
                                </div>
                            </CardBody>
                        </Card>

                        <div className="text-center">
                            <p className="text-lg text-ink-muted mb-6">
                                We&apos;re on {CONTACT.address.street}, {CONTACT.address.town}. Set your sat nav to {CONTACT.address.postcode}.
                            </p>
                            <DirectionsButton
                                href={DIRECTIONS_URL}
                                source="sunbury_directions"
                                variant="primary"
                                size="lg"
                                wrap
                            >
                                Get directions
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
                                After a proper independent village pub? The Anchor is a short drive from Sunbury.
                            </p>
                            <p>
                                If you&rsquo;re a Thames Path walker or you spend your weekends around Sunbury Lock, our beer garden makes a good stop afterwards. You can sit out with a drink and watch the planes come over on their way into Heathrow. It&rsquo;s quite the backdrop for a Sunday roast.
                            </p>
                            <p>
                                {ULEZ_WORDING} Parking&rsquo;s free, and our prices are on the <Link href="/food-menu" className="underline">live menu</Link>.
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
                        answer: `It's a short drive. We're on ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}.`
                    },
                    {
                        question: "Why drive to The Anchor from Sunbury?",
                        answer: `For Sunday roasts carved fresh, a relaxed village pub and a beer garden under the Heathrow flight path. ${PARKING_WORDING}`
                    },
                    {
                        question: "Do I need to book for Sunday Roast?",
                        answer: `No. We serve roasts on Sundays from 1pm to 6pm and walk-ins are welcome, with no pre-order needed. Booking is still worth it at peak times or for a bigger group, and groups of more than ${bookingConfig.maxOnlinePartySize} need to book by phone on ${CONTACT.phone}.`
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Experience The Anchor"
                copy="Just a short drive for great food and hospitality."
            >
                <Button asChild variant="primary" size="lg">
                    <Link href={CONTACT.phoneHref}>Book a Table</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/private-hire#enquiry">Book an Event</Link>
                </Button>
                <DirectionsButton
                    href={DIRECTIONS_URL}
                    source="sunbury_cta_band_directions"
                    variant="outline"
                    size="lg"
                >
                    Get Directions
                </DirectionsButton>
            </CtaBand>
        </>
    )
}
