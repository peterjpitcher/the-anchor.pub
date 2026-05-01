import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, AlertBox, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Family Friendly Pub Near Heathrow | Kids Menu',
    description: `A welcoming family pub near Heathrow. Kids menu, high chairs, and a large garden. Relaxed dining for the whole family at ${BRAND.name}.`,
    openGraph: {
        title: 'Family Dining at The Anchor',
        description: 'Relaxed atmosphere, great food for little ones, and space to unwind.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Family Dining at The Anchor',
        description: 'Relaxed atmosphere, great food for little ones, and space to unwind.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/family-friendly-pub-heathrow'
    }
}

export default function FamilyFriendlyPage() {
    return (
        <>

            <HeroWrapper
                route="/family-friendly-pub-heathrow"
                title="Family Friendly Dining"
                description="Good food that kids actually eat. Relaxed atmosphere for parents. The perfect family pit stop."
                variant="default"
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Family-Friendly Pub Near Heathrow
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            We know eating out with kids can sometimes be stressful. At The Anchor, we aim to make it easy. We have plenty of space, staff who are great with little ones, and a menu that keeps everyone happy.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="For The Little Ones"
                            subtitle="Happy kids mean happy parents."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Kids Menu",
                                    description: "Proper food in smaller portions. Fish fingers, chicken goujons, and mini roasts on Sundays.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Colouring Books & Crayons",
                                    description: "Communal colouring books and crayons available to keep boredom at bay while you wait for food.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "High Chairs",
                                    description: "Sturdy high chairs available for our smallest guests. Just request one when booking.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <div className="bg-anchor-bg-raised p-6 rounded-xl border border-anchor-gold/15 max-w-2xl mx-auto text-left">
                            <h3 className="text-xl font-bold text-anchor-cream-text mb-4 text-center">Baby Facilities</h3>
                            <ul className="grid sm:grid-cols-2 gap-4">
                                <li className="flex items-center gap-2">
                                    <span className="text-anchor-gold-vivid"></span> Bottle warming on request
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-anchor-gold-vivid"></span> Space for buggies
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-anchor-gold-vivid"></span> Breastfeeding welcome
                                </li>
                            </ul>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do you have a kids menu?",
                        answer: "Yes, we have a dedicated menu for children with favourites like sausage and mash, fish fingers, and tomato pasta."
                    },
                    {
                        question: "Are children allowed in the evening?",
                        answer: "Children are always welcome at The Anchor, there's no age cut-off or time restriction. In the summer, families often enjoy the garden until sunset."
                    },
                    {
                        question: "Do you do kids Sunday roasts?",
                        answer: "We certainly do! A smaller portion of our famous roast with all the trimmings."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Table for... Everyone?"
                description="Book a family sized table today."
                buttons={[
                    {
                        text: "‍‍‍ Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "family_cta",
                        variant: "primary"
                    },
                    {
                        text: " Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "family_call_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
