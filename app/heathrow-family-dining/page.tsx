import Link from 'next/link'
import { SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { Button } from '@/components/ui/primitives/Button'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Family Friendly Pub Near Heathrow | Kids Menu & Garden',
    description: `${BRAND.name} is the perfect family stop near Heathrow. Kids menu, large beer garden for running around, and high chairs available. Stress-free dining for parents.`,
    openGraph: {
        title: 'Family Friendly Dining Near Heathrow',
        description: 'Let the kids burn off some energy in our garden before the flight. Great food for them, cold drinks for you.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Family Friendly Dining Near Heathrow',
        description: 'Let the kids burn off some energy in our garden before the flight. Great food for them, cold drinks for you.',
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
                        "streetAddress": "The Anchor, Horton Road",
                        "addressLocality": "Stanwell Moor",
                        "addressRegion": "Surrey",
                        "postalCode": "TW19 6AQ",
                        "addressCountry": "GB"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": 51.462509,
                        "longitude": -0.502067
                    },
                    "amenityFeature": [
                        { "@type": "LocationFeatureSpecification", "name": "High Chairs", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Children's Menu", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Baby Changing Facilities", "value": false },
                        { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Dog Friendly", "value": true },
                        { "@type": "LocationFeatureSpecification", "name": "Step-free access", "value": true }
                    ],
                    "servesCuisine": ["British", "Pub Food", "Pizza"],
                    "acceptsReservations": true,
                    "priceRange": "££"
                }) }}
            />

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Family Dining"
        title="Family Friendly Dining Near Heathrow"
        lead="Fresh air, good food, and plenty of space for the kids to run around"
      />

            <AmenityStrip />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Family-Friendly Pub & Restaurant Near Heathrow Airport"
                            lead="Traveling with children can be exhausting. The Anchor offers an oasis of calm (and space!) just minutes from the airport. Escape the crowded terminal and let the little ones stretch their legs in our secure environment."
                        />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            kicker="Everything for an easier layover"
                            title="Why Families Love Us"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Large Beer Garden', description: 'A safe, enclosed grassy area where kids can play freely while you watch from your table.' },
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
                    <Card accent className="max-w-3xl mx-auto">
                        <CardBody className="p-8">
                            <h2 className="font-display text-h3 text-center text-ink-strong mb-6">Facilities for Little Ones</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold text-ink-strong">High Chairs</p>
                                    <p className="text-sm text-ink-muted">Plenty available, just ask when booking.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-ink-strong">Changing Facilities</p>
                                    <p className="text-sm text-ink-muted">Please ask staff for assistance.</p>
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
                        answer: "Our garden is enclosed by fencing, making it safer for children. However, as it is a car park adjoining, we always ask parents to supervise their children."
                    },
                    {
                        question: "Can we bring a pushchair inside?",
                        answer: "Yes, we have ramp access and plenty of space between tables for buggies and pushchairs."
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
                copy="A warm welcome awaits you and your little travelers."
                primary={<PhoneButton phone={CONTACT.phone} source="family_cta" variant="primary" size="lg">Book a table</PhoneButton>}
                secondary={
                    <Button asChild variant="outline" size="lg">
                        <Link href="https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ">Get directions</Link>
                    </Button>
                }
            />
        </>
    )
}
