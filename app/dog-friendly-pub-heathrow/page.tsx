import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Dog Friendly Pub Near Heathrow | Pets Welcome | The Anchor',
    description: `Looking for a dog friendly pub near Heathrow? We welcome four-legged friends with water bowls, treats, and a large garden. The perfect pit stop for a walk.`,
    keywords: 'dog friendly pub heathrow, dog friendly pub staines, pub allowing dogs, pet friendly restaurants near heathrow',
    openGraph: {
        title: 'Dogs Welcome at The Anchor',
        description: 'Water bowls, treats, and plenty of fuss for your four-legged friends.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Dogs Welcome at The Anchor',
        description: 'Water bowls, treats, and plenty of fuss for your four-legged friends.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/dog-friendly-pub-heathrow'
    }
}

export default function DogFriendlyPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Dog Friendly Pub', url: '/dog-friendly-pub-heathrow' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/dog-friendly-pub-heathrow"
                title="Paws Welcome Here"
                description="We're not just dog tolerant, we're dog friendly. Bring your best friend along for a pint."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="dog_friendly_hero"
                        context="general"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        🐾 Book Table
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/find-us">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            📍 Find Us
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Four-Legged Friends Welcome
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            A pub isn't a proper pub without a dog sleeping by the fire. We welcome well-behaved dogs in our bar area and our large beer garden. Whether you've just been for a walk or you're stopping off on a journey, your dog is as welcome as you are.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
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
                                    icon: "💧",
                                    title: "Water Bowls",
                                    description: "Fresh water always available. Just ask at the bar if you can't see a bowl.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🦴",
                                    title: "Treats on Bar",
                                    description: "We keep a jar of biscuits on the bar for our favourite customers.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🌳",
                                    title: "Large Garden",
                                    description: "Plenty of grassy space outside for a sniff and a stretch of the legs.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
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
                        answer: "Dogs are welcome in the bar area and the garden. If you're dining, we can set you up a table in the bar area so your dog can stay with you."
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
                className="bg-white"
            />

            <CTASection
                title="Bring The Whole Family"
                description="Dogs included."
                buttons={[
                    {
                        text: "🐾 Book A Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "dog_cta",
                        variant: "primary"
                    },
                    {
                        text: "📞 Call Us",
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
