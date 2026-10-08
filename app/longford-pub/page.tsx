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
import { LUGGAGE_WORDING, PARKING_WORDING } from '@/lib/approved-wording'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Pubs in Longford | A Village Local Nearby',
    description: `Staying in Longford or a Bath Road hotel? Come to ${BRAND.name} for British pub food cooked to order. Just a short taxi ride away.`,
    openGraph: {
        title: 'Pubs in Longford, The Anchor, Stanwell Moor',
        description: 'British pub food and drinks at a village pub, a short drive from Longford.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Longford, The Anchor, Stanwell Moor',
        description: 'British pub food and drinks at a village pub, a short drive from Longford.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/longford-pub'
    }
}

export default function LongfordPubPage() {
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["Restaurant", "BarOrPub"],
        "@id": "https://www.the-anchor.pub/longford-pub#business",
        "name": BRAND.name,
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
                "name": "Longford"
            },
            {
                "@type": "Place",
                "name": "Heathrow Bath Road"
            }
        ],
        "priceRange": PRICE_RANGE,
        "servesCuisine": ["British", "Traditional English", "Fish and Chips", "Burger"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/longford-pub"
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
            />

            <InteriorHero
        image="/images/page-headers/longford-pub/find-us.jpg"
        crumb="Longford"
        title="Authentic British Pub Near Longford"
        lead="Pub food cooked to order, draught beer and fair village prices"
        actions={
          <BookTableButton source="longford_pub_hero"
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
                            Pubs in Longford, Minutes from Hotels & Bath Road
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            The Anchor is a traditional village pub, a short drive from Longford.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading
                            title="Why Travellers Choose The Anchor"
                            lead="Staying at a Longford hotel? We're a short drive away."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { title: "Fair Village Prices", description: "Food cooked to order, with prices on the live menu" },
                                { title: "Real Atmosphere", description: "A proper British village pub, where everyone's welcome" },
                                { title: "Beer Garden", description: "Relax outside with a drink - perfect for summer evenings" },
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
                            title="Getting Here is Easy"
                        />

                        <div className="grid md:grid-cols-2 gap-5 mb-8">
                            <Card accent>
                                <CardBody className="p-6">
                                    <h3 className="font-display text-h4 text-ink-strong mb-4">By Car</h3>
                                    <p className="text-ink-muted">
                                        We're a short drive from Longford. {PARKING_WORDING}
                                    </p>
                                </CardBody>
                            </Card>
                            <Card accent>
                                <CardBody className="p-6">
                                    <h3 className="font-display text-h4 text-ink-strong mb-4">Taxi / Uber</h3>
                                    <p className="text-ink-muted">
                                        A short ride. Ask your hotel reception to book one for {BRAND.name}, {CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}.
                                    </p>
                                </CardBody>
                            </Card>
                        </div>

                        <div className="text-center">
                            <DirectionsButton
                                href={DIRECTIONS_URL}
                                source="longford_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Longford"
                                wrap
                            >
                                Get Directions
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
                            title="Longford Neighbours, You Know the Planes, Now Enjoy Them with a Pint"
                        />
                        <div className="prose max-w-none space-y-4 text-ink-muted">
                            <p>
                                If you live in Longford, you don&rsquo;t need anyone to explain the Heathrow flight path to you, it&rsquo;s the soundtrack to your life. Over here in Stanwell Moor, we&rsquo;ve turned it into a feature. Our beer garden sits under Heathrow&rsquo;s southern runway approach path, and there&rsquo;s something oddly relaxing about watching an A380 glide overhead while you nurse a cold pint.
                            </p>
                            <p>
                                Getting here from Longford is a short drive or taxi ride, whether you&rsquo;re in the village or at the Bath Road end near the hotels.
                            </p>
                            <p>
                                We&rsquo;re a proper village pub with real character, an honest local where you can get a decent meal, a cold pint and a genuine welcome.
                            </p>
                            <p>
                                Whether you live in Longford, you&rsquo;ve just finished a shift at one of the hotels, or you&rsquo;re travelling through, we&rsquo;re a short drive away. Come and see us.
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
                        <p className="mt-4 text-ink-muted">
                            Kitchen closes earlier - check times for food service
                        </p>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How far is The Anchor from Longford hotels?",
                        answer: "We are very close, a short drive or taxi ride. We are the neighbouring village to Longford."
                    },
                    {
                        question: "What food do you serve?",
                        answer: "Pub classics like fish and chips, burgers and pies, cooked to order. Our prices are on the live menu. The kitchen is closed on Mondays."
                    },
                    {
                        question: "Do you have WiFi?",
                        answer: "Yes, free WiFi is available throughout the pub, so you can check emails or your flight status."
                    },
                    {
                        question: "Can I bring my luggage?",
                        answer: `Yes. ${LUGGAGE_WORDING}`
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Come Over from Longford"
                copy="Pub food cooked to order and draught beer, a short drive away."
            >
                <Button asChild variant="primary" size="lg">
                    <Link href={CONTACT.phoneHref}>Book a Table</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/private-hire#enquiry">Book an Event</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/food-menu">View Menu</Link>
                </Button>
            </CtaBand>
        </>
    )
}
