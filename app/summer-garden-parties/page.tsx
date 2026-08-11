import { SectionHeading, AlertBox, Container, Card, CardBody, Button } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Summer Garden Party Venue Near Heathrow | BBQ Hire',
    description: `Host your summer event in our large pub garden. BBQ packages, outdoor bar options, and plenty of sunshine. Perfect for birthdays and team socials near Heathrow.`,
    openGraph: {
        title: 'Summer Garden Parties at The Anchor',
        description: 'Sun, Cider, and BBQ. The perfect ingredients for a summer bash.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Summer Garden Parties at The Anchor',
        description: 'Sun, Cider, and BBQ. The perfect ingredients for a summer bash.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/summer-garden-parties'
    }
}

export default function SummerGardenPartiesPage() {
    return (
        <>

                        <InteriorHero
              image="/images/page-headers/home/page-headers-homepage.jpg"
              crumb="Summer Garden Parties"
              title="Summer Garden Party Venue"
              lead="Exclusive areas, BBQ packages, and festival vibes."
            />

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4">
                            The Best Beer Garden Around
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            When the British summer finally arrives, there's no better place to be than The Anchor's garden. With a large grassy area, plenty of picnic benches, and dedicated space for private events, it's the ultimate spot for soaking up the sun.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Summer Party Packages"
                            lead="More than just a few sausages on the grill."
                        />

                        <div className="grid gap-5 sm:grid-cols-2 mb-8">
                            <Card accent hover>
                                <CardBody>
                                    <h3 className="text-lg font-semibold text-ink-strong mb-2">Chef&apos;s BBQ</h3>
                                    <p className="text-ink-muted">We man the grill so you don&apos;t have to. Gourmet burgers, marinated chicken, and fresh salads.</p>
                                </CardBody>
                            </Card>
                            <Card accent hover>
                                <CardBody>
                                    <h3 className="text-lg font-semibold text-ink-strong mb-2">Outdoor Service</h3>
                                    <p className="text-ink-muted">For large events, we can set up an outdoor bottle bar so drinks are never far away.</p>
                                </CardBody>
                            </Card>
                        </div>

                        <Card accent className="max-w-2xl mx-auto mt-8">
                            <CardBody>
                                <h3 className="text-lg font-semibold text-ink-strong mb-2">Weather Policy</h3>
                                <p className="text-ink-muted">We can&apos;t control the British weather! If it rains, we will do our absolute best to move your party indoors or under our covered patio areas.</p>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeading title="Perfect for..." />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardBody className="p-4 text-center">
                                    <span className="font-semibold text-ink-strong">Birthdays</span>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="p-4 text-center">
                                    <span className="font-semibold text-ink-strong">Team Socials</span>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="p-4 text-center">
                                    <span className="font-semibold text-ink-strong">Christenings</span>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="p-4 text-center">
                                    <span className="font-semibold text-ink-strong">Receptions</span>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Is there a minimum number for a BBQ?",
                        answer: "For a private BBQ buffet, we usually require a minimum of 20 guests. For smaller groups, our main menu is always available."
                    },
                    {
                        question: "Can we hire the whole garden?",
                        answer: "We can section off a large private area for you, but we generally keep part of the garden open for our regular customers unless it is a very large exclusive hire."
                    },
                    {
                        question: "Is it dog friendly?",
                        answer: "Yes! Our garden is completely dog friendly. We have water bowls and treats available."
                    }
                ]}
            />

            <CtaBand
                title="Book Your Spot in the Sun"
                copy="Dates fill up fast when the forecast is good."
                primary={
                    <Button asChild variant="primary" size="lg">
                        <a href="mailto:manager@the-anchor.pub?subject=Summer%20Party%20Enquiry">Enquire Now</a>
                    </Button>
                }
                secondary={
                    <PhoneButton
                        phone={CONTACT.phone}
                        source="summer_cta"
                        variant="outline"
                        size="lg"
                    >
                        Call Us
                    </PhoneButton>
                }
            />
        </>
    )
}
