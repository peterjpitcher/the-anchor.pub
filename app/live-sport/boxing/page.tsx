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
    title: 'Watch Boxing Near Heathrow & Staines | Live Fight Nights',
    description: `Watch the biggest boxing matches live at ${BRAND.name}. Anthony Joshua, Tyson Fury, and title fights on big screens. Great atmosphere near Heathrow.`,
    openGraph: {
        title: 'Fight Night at The Anchor',
        description: 'Big screens, big atmosphere. Watch the heavyweights comfortably.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Fight Night at The Anchor',
        description: 'Big screens, big atmosphere. Watch the heavyweights comfortably.',
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
              lead="Anthony Joshua. Tyson Fury. Usyk. When the heavyweights collide, we're the place to be."
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-accent-text mb-4">
                            Ringside Seats
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Boxing needs an atmosphere. Sitting at home doesn't cut it. Join us for the build-up, the undercard, and the main event on our HD screens with full commentary.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Fight Night Ready"
                            subtitle="No need to pay the PPV fee yourself."
                        />

                        <Grid cols={3} gap="md" className="mb-8">
                            {[
                                {
                                    title: "PPV Events",
                                    description: "We pay the Box Office fees so you don't have to. Watch the big Pay-Per-View fights here on the big screen."
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

                        <Alert variant="warning" title="Ticketed Events" className="max-w-2xl mx-auto mt-8">
                            <p>For massive world title fights, we sometimes operate a ticket-only policy to control numbers and ensure everyone gets served. Check our social media for specific event details.</p>
                        </Alert>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do you show the undercard?",
                        answer: "Yes, we usually transform into 'fight mode' from around 8pm on big fight nights to show the main undercard fights."
                    },
                    {
                        question: "Is there an entry fee?",
                        answer: "Generally no, but for huge global events we may ticket the door to manage capacity. We always announce this on Facebook first."
                    },
                    {
                        question: "How late do you stay open?",
                        answer: "We are licensed until late on weekends, but for fights that go into the early hours (like Vegas fights), please check with us directly as it depends on our license extension for that specific night."
                    }
                ]}
            />

            <CtaBand
                title="Don't Miss The Knockout"
                copy="These nights are popular. Booking guarantees entry."
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
