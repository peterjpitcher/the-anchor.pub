import { SectionHeading, AlertBox, Container, Card, CardBody, Button } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { BrochureDownload } from '@/components/features/PrivateHire/BrochureDownload'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { DOGS_WORDING } from '@/lib/approved-wording'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import Link from 'next/link'
import { getCateringData } from '@/lib/api/catering-packages'

export const metadata: Metadata = {
    title: 'Summer Garden Party Venue Near Heathrow',
    description: `Host your summer event in our pub garden near Heathrow. Garden hire and buffet catering, including our Indoor BBQ package, for birthdays and team socials.`,
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

// What this page offers is what SSOT section 11 holds: the garden as a hire
// space, and the catering list, which includes the Indoor BBQ package. It used
// to sell a chef's outdoor BBQ ("we man the grill"), an outdoor bottle bar and
// a part-garden hire, none of which is on file (site review C3-030). The BBQ
// minimum is read from the live catering data, never typed.
async function getIndoorBbqMinimum(): Promise<number | null> {
    try {
        const { foodPackages } = await getCateringData()
        const bbq = foodPackages.find((pkg) => pkg.name.trim().toLowerCase() === 'indoor bbq')
        return bbq && bbq.minimumGuests > 0 ? bbq.minimumGuests : null
    } catch {
        return null
    }
}

export default async function SummerGardenPartiesPage() {
    const bbqMinimum = await getIndoorBbqMinimum()
    const bbqMinimumLine = bbqMinimum ? ` It's for ${bbqMinimum} guests or more.` : ''

    return (
        <>

                        <InteriorHero
              image="/images/page-headers/home/page-headers-homepage.jpg"
              crumb="Summer Garden Parties"
              title="Summer Garden Party Venue"
              lead="Garden hire and buffet catering for your summer get-together."
            />

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4">
                            A Beer Garden Under the Flight Path
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            When the British summer finally arrives, The Anchor's garden is a lovely place to be. You can hire the garden for a private event, and it's a great spot for soaking up the sun.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Summer Party Packages"
                            lead="Food for your garden party comes from our catering list."
                        />

                        <div className="grid gap-5 sm:grid-cols-2 mb-8">
                            <Card accent hover>
                                <CardBody>
                                    <h3 className="text-lg font-semibold text-ink-strong mb-2">Indoor BBQ package</h3>
                                    <p className="text-ink-muted">Our Indoor BBQ package is on the catering list.{bbqMinimumLine} Ask us for what&apos;s in it and the price.</p>
                                </CardBody>
                            </Card>
                            <Card accent hover>
                                <CardBody>
                                    <h3 className="text-lg font-semibold text-ink-strong mb-2">More buffets</h3>
                                    <p className="text-ink-muted">There are more buffets on the list too. See them, with prices, on our <Link href="/private-hire" className="text-accent-text underline">private hire page</Link>.</p>
                                </CardBody>
                            </Card>
                        </div>

                        <Card accent className="mx-auto mt-8">
                            <CardBody>
                                <h3 className="text-lg font-semibold text-ink-strong mb-2">Weather Policy</h3>
                                <p className="text-ink-muted">We can&apos;t control the British weather! If it rains, we will do our absolute best to move your party indoors.</p>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading title="Perfect for..." />
                        {/* Three cards. "Receptions" was removed on 8 October 2026: on its
                            own it reads as wedding receptions, which we do not market
                            (docs/SSOT.md section 14). */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        </div>
                    </div>
                </Container>
            </section>

            <BrochureDownload brochure="general" source="summer_garden_parties" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Is there a minimum number for a BBQ?",
                        answer: `Our Indoor BBQ package is a buffet from our catering list.${bbqMinimumLine} Call us on ${CONTACT.phone} and we'll talk through the food for your group.`
                    },
                    {
                        question: "Can we hire the whole garden?",
                        answer: `The garden is one of our hire spaces. Call us on ${CONTACT.phone} and we'll talk through what you need.`
                    },
                    {
                        question: "Is it dog friendly?",
                        answer: DOGS_WORDING
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
