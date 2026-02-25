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
    title: 'Family Friendly Pub Near Heathrow | Kids Menu | The Anchor',
    description: `A welcoming family pub near Heathrow. Kids menu, high chairs, baby changing, and a large garden. Relaxed dining for the whole family at ${BRAND.name}.`,
    keywords: 'family friendly pub heathrow, pubs with kids menu staines, child friendly restaurants heathrow, family pub lunch',
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
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Family Friendly Pub', url: '/family-friendly-pub-heathrow' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/family-friendly-pub-heathrow"
                title="Family Friendly Dining"
                description="Good food that kids actually eat. Relaxed atmosphere for parents. The perfect family pit stop."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="family_hero"
                        context="general"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        👨‍👩‍👧‍👦 Book Family Table
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            🍔 View Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Relax, You're Welcome Here
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            We know eating out with kids can sometimes be stressful. At The Anchor, we aim to make it easy. We have plenty of space, staff who are great with little ones, and a menu that keeps everyone happy.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
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
                                    icon: "🍟",
                                    title: "Kids Menu",
                                    description: "Proper food in smaller portions. Fish fingers, chicken goujons, and mini roasts on Sundays.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🖍️",
                                    title: "Activity Packs",
                                    description: "Colouring sheets and crayons available to keep boredom at bay while you wait for food.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🪑",
                                    title: "High Chairs",
                                    description: "Sturdy high chairs available for our smallest guests. Just request one when booking.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <div className="bg-white p-6 rounded-xl shadow-sm max-w-2xl mx-auto text-left">
                            <h3 className="text-xl font-bold text-anchor-green mb-4 text-center">Baby Facilities</h3>
                            <ul className="grid sm:grid-cols-2 gap-4">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Baby changing facilities
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Bottle warming on request
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Space for buggies
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Breastfeeding welcome
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
                        answer: "Children are welcome in the pub until 8pm. In the summer, families often enjoy the garden until sunset."
                    },
                    {
                        question: "Do you do kids Sunday roasts?",
                        answer: "We certainly do! A smaller portion of our famous roast with all the trimmings."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Table for... Everyone?"
                description="Book a family sized table today."
                buttons={[
                    {
                        text: "👨‍👩‍👧‍👦 Book Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "family_cta",
                        variant: "primary"
                    },
                    {
                        text: "📞 Call Us",
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
