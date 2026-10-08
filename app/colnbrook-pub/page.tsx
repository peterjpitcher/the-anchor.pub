import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, PRICE_RANGE, DIRECTIONS_URL } from '@/lib/constants'
import { PARKING_WORDING, DOGS_WORDING, GROUP_DEPOSIT_WORDING } from '@/lib/approved-wording'
import { bookingConfig } from '@/lib/booking-config'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Pubs in Colnbrook & Poyle | Food, Drinks & Free Parking',
    description: `${BRAND.name} is the perfect spot for Poyle Industrial Estate workers and Colnbrook residents. Great food, cold pints, and free parking a short drive away.`,
    openGraph: {
        title: 'Pubs in Colnbrook & Poyle | Food, Drinks & Free Parking | The Anchor',
        description: 'Perfect for after-work drinks or a team lunch. Just minutes from Poyle Industrial Estate and Colnbrook.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Colnbrook & Poyle | Food, Drinks & Free Parking | The Anchor',
        description: 'Perfect for after-work drinks or a team lunch. Just minutes from Poyle Industrial Estate and Colnbrook.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/colnbrook-pub'
    }
}

export default function ColnbrookPubPage() {
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
        "priceRange": PRICE_RANGE,
        "servesCuisine": ["British", "Traditional English", "Sunday Roast", "Pizza", "Lunch"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/colnbrook-pub"
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
            />

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Colnbrook"
        title="Pub & Dining Near Colnbrook & Poyle"
        lead="The ideal local for Poyle Industrial Estate and Colnbrook residents"
        actions={
          <BookTableButton source="colnbrook_pub_hero"
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
                            Minutes from Poyle Industrial Estate & Colnbrook
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Finish your shift and relax. If you are looking for pubs in Colnbrook, we&apos;re a short drive away, with proper food and a warm welcome.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading
                            title="Perfect for After-Work Drinks & Team Lunches"
                            lead="Avoid the airport traffic and unwind in a proper pub."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { title: "After Work", description: "Cold beers, draught lagers, and a great wine list for the end of the day" },
                                { title: "Great Food", description: "Hearty meals, burgers, and stone-baked pizzas to fuel your team" },
                                { title: "Easy Parking", description: `${PARKING.capacity} free spaces right outside` },
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
                            title="Corporate & Team Events"
                        />

                        <Card accent className="mb-8">
                            <CardBody className="p-8 text-center">
                                <h3 className="font-display text-h3 text-ink-strong mb-4">Work Dos and Team Events</h3>
                                <p className="text-ink-muted mb-6">
                                    Team meeting, leaving do or Christmas party? The dining room, the garden or the whole pub can be hired by the hour. Prices and menus are on the <Link href="/private-hire" className="underline">private hire page</Link>.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Button asChild variant="primary">
                                        <Link href="/corporate-events">Corporate Info</Link>
                                    </Button>
                                    <PhoneButton phone={CONTACT.phone} source="colnbrook_corporate" variant="outline">Call to Discuss</PhoneButton>
                                </div>
                            </CardBody>
                        </Card>

                        <div className="text-center">
                            <p className="text-lg text-ink-muted mb-6">
                                We&apos;re on {CONTACT.address.street}, {CONTACT.address.town}. Set your sat nav to {CONTACT.address.postcode}.
                            </p>
                            <DirectionsButton
                                href={DIRECTIONS_URL}
                                source="colnbrook_directions"
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

            {/* Colnbrook & Poyle Local Knowledge */}
            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="A Proper Pub Near Poyle & Colnbrook"
                            className="text-center mb-8"
                        />
                        <div className="prose max-w-none text-ink-muted space-y-4">
                            <p>
                                The Poyle and Colnbrook industrial estates employ thousands of people in logistics, air
                                cargo, and aviation services. When the shift ends, The Anchor is a short drive away,
                                a proper pub with a full kitchen.
                            </p>
                            <p>
                                You&apos;ll find a beer garden, free parking, events
                                like quiz nights and Music Bingo, and a kitchen turning out stone-baked pizzas and
                                Sunday roasts.
                            </p>
                            <p>
                                We also welcome families visiting the Colnbrook area who need somewhere warm and
                                friendly to sit down for a proper meal. {DOGS_WORDING} Children are welcome too, and the pub
                                has the kind of relaxed atmosphere where people linger over a second coffee or an extra
                                round. Whether you are a warehouse supervisor winding down after a twelve-hour shift or
                                a family looking for a Sunday roast spot, you will find a
                                genuine welcome at The Anchor.
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
                        question: "How far is The Anchor from Poyle Industrial Estate?",
                        answer: "We're a short drive away. Many workers join us for lunch or after their shift."
                    },
                    {
                        question: "Can you accommodate large work groups?",
                        answer: `Yes. You can book a table for up to ${bookingConfig.maxOnlinePartySize} online. ${GROUP_DEPOSIT_WORDING} A bigger group is a private hire, so give us a call on ${CONTACT.phone}.`
                    },
                    {
                        question: "Is there parking?",
                        answer: `Yes. ${PARKING_WORDING}`
                    },
                    {
                        question: "Do you offer takeaway?",
                        answer: "We don't offer delivery, but you are welcome to order food to eat in or call ahead for collection if time is tight."
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Your Local After-Work Spot"
                copy="Great food and drink just minutes from the office."
            >
                <Button asChild variant="primary" size="lg">
                    <Link href={CONTACT.phoneHref}>Book a Table</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/private-hire#enquiry">Book an Event</Link>
                </Button>
                <DirectionsButton
                    href={DIRECTIONS_URL}
                    source="colnbrook_cta_band_directions"
                    variant="outline"
                    size="lg"
                >
                    Get Directions
                </DirectionsButton>
            </CtaBand>
        </>
    )
}
