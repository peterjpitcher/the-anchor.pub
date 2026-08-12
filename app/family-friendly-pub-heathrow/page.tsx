import { SectionHeading, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { AmenityStrip } from '@/components/AmenityStrip'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

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

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Family Friendly"
        title="Family Friendly Dining"
        lead="Good food that kids actually eat. Relaxed atmosphere for parents. The perfect family pit stop."
      />

            <AmenityStrip/>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Family-Friendly Pub Near Heathrow"
                            lead="We know eating out with kids can sometimes be stressful. At The Anchor, we aim to make it easy. We have plenty of space, staff who are great with little ones, and a menu that keeps everyone happy."
                        />
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            kicker="Happy kids mean happy parents"
                            title="For The Little Ones"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Kids Menu', description: 'Proper food in smaller portions. Fish fingers, chicken goujons, and mini roasts on Sundays.' },
                                { title: 'High Chairs', description: 'Sturdy high chairs available for our smallest guests. Just request one when booking.' }
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
                                <h3 className="font-display text-h4 text-ink-strong mb-4 text-center">Baby Facilities</h3>
                                <ul className="grid sm:grid-cols-2 gap-4 text-ink">
                                    <li className="flex items-center gap-2">
                                        <span className="text-accent-text" aria-hidden>•</span> Bottle warming on request
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-accent-text" aria-hidden>•</span> Space for buggies
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-accent-text" aria-hidden>•</span> Breastfeeding welcome
                                    </li>
                                </ul>
                            </CardBody>
                        </Card>
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
                className="bg-canvas"
            />

            <CtaBand
                title="Table for... Everyone?"
                copy="Book a family sized table today."
                primary={<PhoneButton phone={CONTACT.phone} source="family_cta" variant="primary" size="lg">Book a table</PhoneButton>}
                secondary={<PhoneButton phone={CONTACT.phone} source="family_call_cta" variant="outline" size="lg">Call us</PhoneButton>}
            />
        </>
    )
}
