import { SectionHeading, Badge, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { Button } from '@/components/ui/primitives/Button'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Beer Garden Near Heathrow | Outdoor Dining & Drinks',
    description: `Enjoy a pint in the sun at ${BRAND.name}. Large grassy beer garden, outdoor dining tables, and plenty of space. Just minutes from Heathrow Airport.`,
    openGraph: {
        title: 'The Anchor Beer Garden',
        description: 'Sun, cider, and space to relax. The best garden in Stanwell Moor.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Anchor Beer Garden',
        description: 'Sun, cider, and space to relax. The best garden in Stanwell Moor.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/beer-garden'
    }
}

export default function PubGardenPage() {
    return (
        <>

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Pub Garden"
        title="The Best Garden Around"
        lead="When the sun is shining, there's no better place. Cold drinks, fresh air, and real grass between your toes."
      />

            <AmenityStrip/>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Al Fresco Living"
                            lead="We're lucky to have one of the largest pub gardens in the area. Far enough from the main road to be peaceful, but close enough to the bar for a quick refill. It's the perfect spot for a lazy Sunday afternoon or a post-work pint."
                        />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            kicker="More than just a few benches"
                            title="Garden Features"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Real Grass', description: 'A proper lawn, perfect for kids to play on or for sprawling out on a picnic blanket.' },
                                { title: 'Outdoor Dining', description: 'We serve our full menu outside. Just grab a table number and order at the bar.' },
                                { title: 'Smoking Area', description: 'Designated sheltered smoking areas for when the British weather does its thing.' }
                            ].map(feature => (
                                <Card key={feature.title} accent hover>
                                    <CardBody>
                                        <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                                        <p className="text-ink-muted">{feature.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        <Card accent className="mx-auto mt-8">
                            <CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-2">Dog Friendly</h3>
                                <p className="text-ink-muted">Our garden is a paradise for pooches. Water bowls are always available.</p>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can I book a table outside?",
                        answer: "Yes, we take bookings for outdoor tables. However, we can't guarantee the weather!"
                    },
                    {
                        question: "Is there cover if it rains?",
                        answer: "We have large parasols and some sheltered areas, but in severe weather, we'll try our best to find you a spot inside."
                    },
                    {
                        question: "Is there lighting at night?",
                        answer: "Yes, the garden is beautifully lit with festoon lighting in the evenings."
                    }
                ]}
                className="bg-canvas"
            />

            <CtaBand
                title="Save Me A Seat"
                copy="Book a spot in the sun."
                primary={<PhoneButton phone={CONTACT.phone} source="garden_cta" variant="primary" size="lg">Book a table</PhoneButton>}
                secondary={
                    <Button asChild variant="outline" size="lg">
                        <Link href="/find-us">Find us</Link>
                    </Button>
                }
            />
        </>
    )
}
