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
    title: 'Watch F1 In Staines & Heathrow | Live Grand Prix Pub',
    description: `Watch Formula 1 races live at ${BRAND.name}. Channel 4 F1 coverage on HD screens with commentary. The perfect pit stop near Heathrow.`,
    openGraph: {
        title: 'Watch F1 Live at The Anchor',
        description: 'Lights out and away we go! Watch every Grand Prix with us.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch F1 Live at The Anchor',
        description: 'Lights out and away we go! Watch every Grand Prix with us.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport/f1'
    }
}

export default function F1Page() {
    return (
        <>

                        <InteriorHero
              image="/images/page-headers/home/page-headers-homepage.jpg"
              crumb="F1"
              title="Watch F1™ Live Here"
              lead="From lights out to the chequered flag. We show every Qualifying session and Race live."
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-accent-text mb-4">
                            The Fast Lane
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Formula 1 is better with a crowd. Feel the tension of the start, cheer every overtake, and debate the strategy with fellow fans. We're the closest pub to Heathrow for a pre-flight race watch!
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Race Day Essentials"
                            subtitle="We've got the setup to match the speed."
                        />

                        <Grid cols={3} gap="md" className="mb-8">
                            {[
                                {
                                    title: "Commentary On",
                                    description: "For the race itself, we turn the music off and the commentary up so you don't miss a beat."
                                },
                                {
                                    title: "Live F1 Coverage",
                                    description: "We show F1 on free-to-air channels (Channel 4), including build-up, race highlights, and podium analysis."
                                },
                                {
                                    title: "Sunday Roast",
                                    description: "Most races happen on Sundays. Combine the Grand Prix with our legendary Sunday Roast."
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

                        <Alert variant="info" title="Global Timings" className="max-w-2xl mx-auto mt-8">
                            <p>We show all races that fall within our opening hours. For early morning races (Australia/Japan), please check our social media to see if we're opening early.</p>
                        </Alert>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do you show Qualifying?",
                        answer: "Yes, we show Qualifying sessions on Saturdays as well as the main race on Sundays."
                    },
                    {
                        question: "Do you show Sprint Races?",
                        answer: "Yes, if there's a Sprint weekend, we'll have the Sprint action on the screens."
                    },
                    {
                        question: "Can I eat while watching?",
                        answer: "Absolutely. Our full food menu is available, or grab a Sunday Roast during European race times."
                    }
                ]}
            />

            <CtaBand
                title="Book Your Pole Position"
                copy="Reserve a table with a screen view."
            >
                <PhoneButton phone={CONTACT.phone} source="f1_cta" variant="primary" size="lg" className="w-full sm:w-auto">
                    Book Now
                </PhoneButton>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/find-us">Directions</Link>
                </Button>
            </CtaBand>
        </>
    )
}
