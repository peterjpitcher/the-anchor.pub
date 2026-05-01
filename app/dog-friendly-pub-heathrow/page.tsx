import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'

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

            <HeroWrapper
                route="/dog-friendly-pub-heathrow"
                title="Paws Welcome Here"
                description="We're not just dog tolerant, we're dog friendly. Bring your best friend along for a pint."
                variant="default"
                enableSmartCtas={true}
                showContextStrip={true}
            />

            {/* Definitive answer for featured snippets */}
            <section className="bg-anchor-bg-raised border-b border-anchor-gold/15 py-6">
                <Container>
                    <p className="text-center text-lg md:text-xl text-anchor-cream-text/80 max-w-4xl mx-auto leading-relaxed">
                        The Anchor is a dog-friendly pub near Heathrow Airport in Stanwell Moor, welcoming dogs in both our bar area and beer garden. We provide water bowls and dog treats for four-legged visitors.
                    </p>
                </Container>
            </section>

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Dog-Friendly Pub Near Heathrow, Paws Welcome
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            A pub isn't a proper pub without a dog sleeping by the fire. We welcome well-behaved dogs throughout the entire venue, bar, dining area, and beer garden. Whether you've just been for a walk or you're stopping off on a journey, your dog is as welcome as you are.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="VIP Treatment"
                            subtitle="Very Important Pups."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Water Bowls",
                                    description: "Fresh water always available. Just ask at the bar if you can't see a bowl.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Treats Available",
                                    description: "Dog biscuits in a jar near the door for our favourite customers.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Large Garden",
                                    description: "Plenty of grassy space outside for a sniff and a stretch of the legs.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-card",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="info"
                            title="House Rules"
                            className="max-w-2xl mx-auto mt-8"
                            content="We ask that dogs are kept on a lead at all times and are not allowed on the furniture. This keeps everyone safe and comfortable."
                        />
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
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Bring The Whole Family"
                description="Dogs included."
                buttons={[
                    {
                        text: " Book A Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "dog_cta",
                        variant: "primary"
                    },
                    {
                        text: " Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "dog_call_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
