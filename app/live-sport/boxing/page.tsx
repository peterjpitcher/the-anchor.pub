import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Alert, Container, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Watch Boxing Near Heathrow & Staines | Big Screen Fight Nights',
    description: `Boxing on BBC, ITV and Channel 4, live on the big screens at ${BRAND.name} in Stanwell Moor. Sound up, proper pub crowd, food and free parking near Heathrow.`,
    openGraph: {
        title: 'Fight Night at The Anchor',
        description: 'Terrestrial boxing on the big screens, sound turned up, free parking. 7 minutes from Heathrow T5.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Fight Night at The Anchor',
        description: 'Terrestrial boxing on the big screens, sound turned up, free parking. 7 minutes from Heathrow T5.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport/boxing'
    }
}

export default function BoxingPage() {
    return (
        <>

                        <InteriorHero
              image="/images/page-headers/home/page-headers-homepage.jpg"
              crumb="Boxing"
              title="Big Fight Nights"
              lead="When boxing lands on BBC, ITV or Channel 4, it goes on our big screens with the sound up and the room filling."
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-accent-text mb-4">
                            Ringside Seats
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Boxing at home is a quiet night in. Here you get the build-up, the undercard and the main event on our HD screens with full commentary, a room that reacts to every round, food from the kitchen and free parking right outside.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Fight Night Ready"
                            subtitle="Free-to-air boxing, big screens, nothing to pay at the door."
                        />

                        <Grid cols={3} gap="md" className="mb-8">
                            {[
                                {
                                    title: "Fights On The Box",
                                    description: "Boxing on BBC, ITV and Channel 4 goes on the big screens, the whole broadcast, undercard included."
                                },
                                {
                                    title: "Loud & Live",
                                    description: "Experience the ring walks and the knockouts with full venue sound."
                                },
                                {
                                    title: "No Dry Nights",
                                    description: "Our bar stays well-stocked with draught beers, spirits, and mixers all night."
                                }
                            ].map((feature) => (
                                <GridItem key={feature.title}>
                                    <Card accent className="h-full">
                                        <CardBody className="text-center space-y-2">
                                            <h3 className="text-lg font-semibold text-ink-strong">{feature.title}</h3>
                                            <p className="text-sm text-ink-muted leading-relaxed">{feature.description}</p>
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            ))}
                        </Grid>

                        <Alert variant="info" title="What we can show" className="mx-auto mt-8">
                            <p>We show boxing broadcast on BBC, ITV and Channel 4. We do not have Sky Sports, TNT Sports or Box Office, so pay-per-view and subscription-only fights are not something we can put on. Call us on {CONTACT.phone} before you set off and we will tell you straight whether a fight is on our screens.</p>
                        </Alert>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Which boxing can you show?",
                        answer: "Any fight broadcast on BBC, ITV or Channel 4. We do not have Sky Sports, TNT Sports or Box Office, so pay-per-view and subscription-only fights cannot be shown here. Ring us on 01753 682707 if you are not sure where a fight is being broadcast."
                    },
                    {
                        question: "Do you show the undercard?",
                        answer: "Yes. When a fight is on a terrestrial channel we put the whole broadcast on, so you get the build-up and the undercard as well as the main event."
                    },
                    {
                        question: "Is there an entry fee?",
                        answer: "No. Terrestrial boxing is free to watch here, so just come in, find a spot and order a drink."
                    },
                    {
                        question: "Can I eat while I watch?",
                        answer: "Yes, our kitchen menu is available whenever the kitchen is open. Book a table if you want to eat and watch without hunting for a seat."
                    },
                    {
                        question: "Is there parking?",
                        answer: "Yes, free parking for every guest with no fees and no time limit while you are with us."
                    }
                ]}
            />

            <CtaBand
                title="Get In Before The Ring Walks"
                copy="Fight nights fill up. Book a table and you will have a clear view of the screen when the first bell goes."
            >
                <PhoneButton phone={CONTACT.phone} source="boxing_cta" variant="primary" size="lg" className="w-full sm:w-auto">
                    Book Now
                </PhoneButton>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/find-us">Find Us</Link>
                </Button>
            </CtaBand>
        </>
    )
}
