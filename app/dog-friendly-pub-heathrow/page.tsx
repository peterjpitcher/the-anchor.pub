import { SectionHeading, Badge, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Dog Friendly Pub Near Heathrow | Beer Garden & Water Bowls',
    description: `Dog friendly pub near Heathrow with a 64-seat beer garden, water bowls and food served to your table outdoors. Free parking, 7 mins from T5. Rated 4.6/5 on Google.`,
    openGraph: {
        title: 'Dog Friendly Pub Near Heathrow, Beer Garden & Free Parking',
        description: '64-seat dog-friendly beer garden with water bowls, outdoor dining and free parking. 7 mins from Heathrow T5.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Dog Friendly Pub Near Heathrow, Beer Garden & Free Parking',
        description: '64-seat dog-friendly beer garden with water bowls, outdoor dining and free parking. 7 mins from Heathrow T5.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/dog-friendly-pub-heathrow'
    }
}

export default async function DogFriendlyPage() {
    return (
        <>

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Dog Friendly"
        title="Paws Welcome Here"
        lead="We're not just dog tolerant, we're dog friendly. Bring your best friend along for a pint."
      />

            <AmenityStrip />

            {/* Definitive answer for featured snippets */}
            <section className="py-section-y bg-canvas">
                <Container>
                    <p className="text-center text-lg md:text-xl text-ink max-w-4xl mx-auto leading-relaxed">
                        The Anchor is a dog-friendly pub near Heathrow Airport in Stanwell Moor, welcoming dogs in both our bar area and beer garden. We provide water bowls and dog treats for four-legged visitors.
                    </p>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Dog-Friendly Pub Near Heathrow, Paws Welcome"
                            lead="A pub isn't a proper pub without a dog sleeping by the fire. We welcome well-behaved dogs throughout the entire venue, bar, dining area, and beer garden. Whether you've just been for a walk or you're stopping off on a journey, your dog is as welcome as you are."
                        />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            kicker="Very Important Pups"
                            title="VIP Treatment"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Water Bowls', description: "Fresh water always available. Just ask at the bar if you can't see a bowl." },
                                { title: 'Treats Available', description: 'Dog biscuits in a jar near the door for our favourite customers.' },
                                { title: 'Large Garden', description: 'Plenty of grassy space outside for a sniff and a stretch of the legs.' }
                            ].map(feature => (
                                <Card key={feature.title} accent hover>
                                    <CardBody>
                                        <h3 className="font-display text-h4 text-ink-strong mb-2">{feature.title}</h3>
                                        <p className="text-ink-muted">{feature.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        <Card accent className="max-w-2xl mx-auto mt-8">
                            <CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-2">House Rules</h3>
                                <p className="text-ink-muted">We ask that dogs are kept on a lead at all times and are not allowed on the furniture. This keeps everyone safe and comfortable.</p>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Are dogs allowed in the restaurant?",
                        answer: "Dogs are welcome throughout the entire venue, bar, dining area, and beer garden. Your dog can stay with you wherever you choose to sit."
                    },
                    {
                        question: "Is there a limit on dog size?",
                        answer: "No, we love all dogs from Chihuahuas to Great Danes, as long as they are well-behaved!"
                    },
                    {
                        question: "Is there somewhere to walk nearby?",
                        answer: "Yes, there are some nice walking routes around Stanwell Moor and the reservoirs nearby."
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Bring The Whole Family"
                copy="Dogs included."
                primary={<PhoneButton phone={CONTACT.phone} source="dog_cta" variant="primary" size="lg">Book a table</PhoneButton>}
                secondary={<PhoneButton phone={CONTACT.phone} source="dog_call_cta" variant="outline" size="lg">Call us</PhoneButton>}
            />
        </>
    )
}
