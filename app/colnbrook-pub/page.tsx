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
    title: 'Pubs in Colnbrook & Poyle | Food, Drinks & Free Parking',
    description: `${BRAND.name} is the perfect spot for Poyle Industrial Estate workers and Colnbrook residents. Great food, cold pints, and free parking just 2 miles away.`,
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
        "priceRange": "££",
        "servesCuisine": ["British", "Traditional English", "Sunday Roast", "Pizza", "Lunch"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/colnbrook-pub"
    }

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
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
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
                    <div className="max-w-4xl mx-auto text-center">
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
                            Finish your shift and relax. If you are looking for pubs in Colnbrook, we are the go-to spot for businesses in Poyle and residents alike, quality food and a great atmosphere guaranteed.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeading
                            title="Perfect for After-Work Drinks & Team Lunches"
                            lead="Avoid the airport traffic and unwind in a proper pub."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { title: "After Work", description: "Cold beers, draught lagers, and a great wine list for the end of the day" },
                                { title: "Great Food", description: "Hearty meals, burgers, and stone-baked pizzas to fuel your team" },
                                { title: "Easy Parking", description: "Large free car park for vans and cars - no hassle" },
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
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Corporate & Team Events"
                        />

                        <Card accent className="mb-8">
                            <CardBody className="p-8 text-center">
                                <h3 className="font-display text-h3 text-ink-strong mb-4">Poyle Business Specials</h3>
                                <p className="text-ink-muted mb-6">
                                    We regularly host team meetings, leaving dos, and Christmas parties for companies based in the Poyle Industrial Estate. We can offer buffet packages and private areas.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Link href="/corporate-events">
                                        <Button variant="primary">Corporate Info</Button>
                                    </Link>
                                    <PhoneButton phone={CONTACT.phone} source="colnbrook_corporate" variant="outline">Call to Discuss</PhoneButton>
                                </div>
                            </CardBody>
                        </Card>

                        <div className="text-center">
                            <DirectionsButton
                                href="https://maps.google.com/maps?saddr=Colnbrook&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                                source="colnbrook_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Colnbrook"
                            >
                                 Get Directions from Colnbrook (5 mins)
                            </DirectionsButton>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Colnbrook & Poyle Local Knowledge */}
            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="The Closest Proper Pub to Poyle & Colnbrook"
                            className="text-center mb-8"
                        />
                        <div className="prose max-w-none text-ink-muted space-y-4">
                            <p>
                                The Poyle and Colnbrook industrial estates employ thousands of people in logistics, air
                                cargo, and aviation services, from DHL and FedEx warehouses to smaller freight
                                forwarders lining the Colnbrook bypass. When the shift ends, options are slim. A few
                                takeaways on Colnbrook High Street, the odd cafe that closes at four, and not much else.
                                The Anchor is straight down the bypass and along Horton Road, five to seven minutes,
                                no motorway required, and it is the closest proper pub with a full kitchen and real
                                ales on tap.
                            </p>
                            <p>
                                Colnbrook itself has a proud history. The Ostrich Inn on the High Street claims to be
                                one of the oldest pubs in England, and it is a lovely spot for a quiet pint. But if you
                                are looking for a bigger beer garden, free parking for the whole team, regular events
                                like quiz nights and Music Bingo, and a kitchen turning out stone-baked pizzas and
                                Sunday roasts, The Anchor fills a different niche. We are two village pubs serving the
                                same community in our own ways.
                            </p>
                            <p>
                                We also welcome families visiting the Colnbrook area who need somewhere warm and
                                friendly to sit down for a proper meal. Our pub is dog-friendly, child-friendly, and
                                has the kind of relaxed atmosphere where people linger over a second coffee or an extra
                                round. Whether you are a warehouse supervisor winding down after a twelve-hour shift or
                                a family looking for a Sunday roast spot away from the airport chaos, you will find a
                                genuine welcome at The Anchor.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-2xl mx-auto text-center">
                        <SectionHeading
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
                        answer: "We don't offer delivery, but you are welcome to order food to eat in or call ahead for collection if time is tight."
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Your Local After-Work Spot"
                copy="Great food and drink just minutes from the office."
            >
                <Link href={CONTACT.phoneHref}>
                    <Button variant="primary" size="lg">Book a Table</Button>
                </Link>
                <Link href="/private-hire#enquiry">
                    <Button variant="outline" size="lg">Book an Event</Button>
                </Link>
                <Link href="https://maps.google.com/maps?saddr=Colnbrook&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ">
                    <Button variant="outline" size="lg">Get Directions</Button>
                </Link>
            </CtaBand>
        </>
    )
}
