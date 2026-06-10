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

            <HeroWrapper
                route="/colnbrook-pub"
                title="Pub & Dining Near Colnbrook & Poyle"
                description="The ideal local for Poyle Industrial Estate and Colnbrook residents"
                variant="default"
                primaryCta={
                    <BookTableButton source="colnbrook_pub_hero" context="local_pub" variant="primary" size="lg">
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
                            Minutes from Poyle Industrial Estate & Colnbrook
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Finish your shift and relax. If you are looking for pubs in Colnbrook, we are the go-to spot for businesses in Poyle and residents alike, quality food and a great atmosphere guaranteed.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
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
                                    icon: "",
                                    title: "After Work",
                                    description: "Cold beers, draught lagers, and a great wine list for the end of the day",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Great Food",
                                    description: "Hearty meals, burgers, and stone-baked pizzas to fuel your team",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Easy Parking",
                                    description: "Large free car park for vans and cars - no hassle",
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
                            title="Corporate & Team Events"
                        />

                        <div className="card-dark rounded-none p-8 mb-8 text-center">
                            <h3 className="text-2xl font-bold text-anchor-gold-bright mb-4">Poyle Business Specials</h3>
                            <p className="text-anchor-cream-text/70 mb-6">
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
                                 Get Directions from Colnbrook (5 mins)
                            </DirectionsButton>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Colnbrook & Poyle Local Knowledge */}
            <section className="section-spacing bg-anchor-green-deep border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="The Closest Proper Pub to Poyle & Colnbrook"
                            className="text-center mb-8"
                        />
                        <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
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
                className="bg-anchor-green-card"
            />

            <CTASection
                title="Your Local After-Work Spot"
                description="Great food and drink just minutes from the office."
                buttons={[
                    {
                        text: " Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "colnbrook_pub_cta",
                        variant: "white"
                    },
                    {
                        text: " Book an Event",
                        href: "/private-hire#enquiry",
                        variant: "white"
                    },
                    {
                        text: " Get Directions",
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
