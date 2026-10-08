import { SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { DirectionsButton } from '@/components/DirectionsButton'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND, PRICE_RANGE } from '@/lib/constants'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { ACCESS_AMENITY_FEATURES, FAMILIES_WORDING } from '@/lib/approved-wording'

export const metadata: Metadata = {
    title: 'Family Friendly Pub Near Heathrow | Kids Menu & Garden',
    description: `${BRAND.name} is the perfect family stop near Heathrow. Kids menu, a big beer garden to sit out in, and high chairs available. Stress-free dining for parents.`,
    openGraph: {
        title: 'Family Friendly Dining Near Heathrow',
        description: 'Sit out in our big garden before the flight. Great food for the kids, cold drinks for you.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Family Friendly Dining Near Heathrow',
        description: 'Sit out in our big garden before the flight. Great food for the kids, cold drinks for you.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/heathrow-family-dining'
    }
}

export default function FamilyDiningPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify({
                    "@context": "https://schema.org",
                    "@type": "Restaurant",
                    "name": "The Anchor, Family Dining Near Heathrow",
                    "description": "Family-friendly pub restaurant near Heathrow Airport with kids menu, high chairs, large beer garden, and free parking.",
                    "url": "https://www.the-anchor.pub/heathrow-family-dining",
                    "telephone": "+441753682707",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": CONTACT.address.street,
                        "addressLocality": CONTACT.address.town,
                        "addressRegion": "Surrey",
                        "postalCode": "TW19 6AQ",
                        "addressCountry": "GB"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": CONTACT.coordinates.lat,
                        "longitude": CONTACT.coordinates.lng
                    },
                    "amenityFeature": [
                        { "@type": "LocationFeatureSpecification", "name": "High Chairs", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Children's Menu", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Baby Changing Facilities", "value": false },
                        { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Dog Friendly", "value": true },
                        ...ACCESS_AMENITY_FEATURES,
                    ],
                    "servesCuisine": ["British", "Pub Food", "Pizza"],
                    "acceptsReservations": true,
                    "priceRange": PRICE_RANGE
                }) }}
            />

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Family Dining"
        title="Family Friendly Dining Near Heathrow"
        lead="Fresh air, good food, and a big garden to sit out in"
      />

            <AmenityStrip/>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Family-Friendly Pub & Restaurant Near Heathrow Airport"
                            lead="Traveling with children can be exhausting. The Anchor offers an oasis of calm (and space!) just minutes from the airport. Escape the crowded terminal for a while."
                        />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            kicker="Everything for an easier layover"
                            title="Why Families Love Us"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Large Beer Garden', description: `Seating for ${PRIVATE_HIRE_CAPACITY.spaces.gardenTerrace.seated}, right under the Heathrow flight path. It adjoins the car park, so please keep little ones supervised.` },
                                { title: 'Kids Menu', description: 'Proper portions of favourites like fish fingers and sausages - nothing too fancy!' },
                                { title: 'Plane Spotting', description: 'We are under the flight path! Kids love watching the giant planes land nearby.' }
                            ].map(feature => (
                                <Card key={feature.title} accent hover>
                                    <CardBody>
                                        <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                                        <p className="text-ink-muted">{feature.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <Card accent className="mx-auto">
                        <CardBody className="p-8">
                            <h2 className="font-display text-h3 text-center text-ink-strong mb-6">Facilities for Little Ones</h2>
                            <p className="mb-6 text-center text-ink-muted">{FAMILIES_WORDING}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold text-ink-strong">High Chairs</p>
                                    <p className="text-sm text-ink-muted">Plenty available, just ask when booking.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-ink-strong">Kid-Friendly Drinks</p>
                                    <p className="text-sm text-ink-muted">Fruit shoots, juices, and milk available.</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Is the garden secure?",
                        answer: `We can't promise that it is. The garden adjoins the car park, so please keep children with you and supervised at all times. If you'd like to check the layout before you come, call us on ${CONTACT.phone}.`
                    },
                    {
                        question: "Can we bring a pushchair inside?",
                        answer: `Yes. The bar and dining area are step free from the car park, and there is plenty of space between tables for buggies and pushchairs. ${FAMILIES_WORDING}`
                    },
                    {
                        question: "Is the food fast?",
                        answer: "We cook to order, but if you are in a rush for a flight, let us know! Kids meals are usually very quick to prepare."
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Bring the Whole Family"
                copy="A warm welcome awaits you and your little travellers."
                primary={<PhoneButton phone={CONTACT.phone} source="family_cta" variant="primary" size="lg">Book a table</PhoneButton>}
                secondary={
                    <DirectionsButton href="https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ" source="family_dining_directions" variant="outline" size="lg">
                        Get directions
                    </DirectionsButton>
                }
            />
        </>
    )
}
