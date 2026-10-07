import { TournamentLinkInWindow } from '@/components/features/nations-championship/TournamentLinkInWindow'
import { isNationsChampionshipPromoOpen } from '@/lib/nations-championship/promo-window'
import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { ACCESS_WORDING } from '@/lib/approved-wording'

// This page is year-neutral on purpose (7 October 2026). It used to advertise
// the 2026 tournament: a dated title and hero, the 2026 fixture list, and Event
// structured data that ended on 14 March 2026. SSOT §10 (owner decision,
// 7 October 2026) confirms we show Six Nations games that are on terrestrial TV,
// on 4 TVs, with the commentary on. It names no fixture, date, year or channel
// for a given game, so nothing here does either. Every line rests on an SSOT
// section; the Six Nations, sport, parking, dogs, families, access and deposit
// lines are the approved wording from SSOT §16, pasted as it stands.
//
// This page has no pop-up. The Six Nations 2026 one was switched off on
// 6 October 2026 and deleted on 7 October 2026, both owner decisions.
// tests/unit/six-nations-page-no-lightbox.test.tsx holds this.

const PAGE_TITLE = 'Six Nations Rugby | The Anchor Stanwell Moor'
const SOCIAL_DESCRIPTION = `We show Six Nations games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call ${CONTACT.phone} to check a game.`

export const metadata: Metadata = {
    // Absolute, so the root layout's "| The Anchor" template is not added on top.
    title: { absolute: PAGE_TITLE },
    description: `Watch the Six Nations near Heathrow. We show games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call ${CONTACT.phone} to check a game.`,
    openGraph: {
        title: PAGE_TITLE,
        description: SOCIAL_DESCRIPTION,
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: PAGE_TITLE,
        description: SOCIAL_DESCRIPTION,
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: './'
    }
}

// SSOT §16, approved wording, pasted as it stands.
const SIX_NATIONS_WORDING = `We show Six Nations games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call us on ${CONTACT.phone} to check a particular game.`
const SPORT_WORDING = "We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports."
const PARKING_WORDING = "We've 20 free spaces right outside. There's no time limit while you're with us, and nothing to register."
const DOGS_WORDING = "Dogs are welcome throughout the pub, on a lead. We'll have water bowls and biscuits waiting."
const FAMILIES_WORDING = "High chairs, buggy space and bottle warming on request are all here, and breastfeeding is welcome. We don't have baby changing facilities."
const GROUP_DEPOSIT_WORDING = 'Groups of 15 or more: a £10 per person deposit, fully deducted from your bill.'

const features = [
    { title: 'Free parking', description: PARKING_WORDING },
    { title: 'Bring the dog', description: DOGS_WORDING },
    { title: 'Bring the family', description: `Children are welcome at all hours. ${FAMILIES_WORDING}` }
]

const faqs = [
    {
        question: 'Do you show the Six Nations?',
        answer: `Yes. ${SIX_NATIONS_WORDING} We don't have Sky Sports or TNT Sports.`
    },
    {
        question: 'Can I book a table?',
        answer: `Yes. Book online, or call us on ${CONTACT.phone}. ${GROUP_DEPOSIT_WORDING} For more than 20 people, call us.`
    },
    {
        question: 'Can I get food while I watch?',
        answer: `That depends on the day and the time. Check the kitchen times on this page, or call us on ${CONTACT.phone}.`
    },
    {
        question: 'Is there parking?',
        answer: PARKING_WORDING
    },
    {
        question: 'Can I bring my dog?',
        answer: DOGS_WORDING
    },
    {
        question: 'Are children welcome?',
        answer: `Yes, at all hours. ${FAMILIES_WORDING}`
    },
    {
        question: 'Is it step free?',
        answer: ACCESS_WORDING
    },
    {
        question: 'How far are you from Heathrow?',
        answer: "We're in Stanwell Moor. By car it's 7 minutes from Terminal 5, 11 minutes from Terminals 2 and 3, and 12 minutes from Terminal 4."
    }
]

export default function SixNationsPage() {
    return (
        <>
            <InteriorHero
                image="/images/page-headers/home/page-headers-homepage.jpg"
                crumb="Six Nations"
                title="Six Nations rugby at The Anchor"
                lead="We show Six Nations games that are on BBC, ITV or Channel 4. Four TVs, commentary on."
            />
            <TournamentLinkInWindow initiallyOpen={isNationsChampionshipPromoOpen()} />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center mb-12">
                        <PageTitle className="text-accent-text mb-4">
                            Got a game in mind?
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            {SIX_NATIONS_WORDING}
                        </p>
                        <p className="mt-4 text-lg text-ink-muted">
                            {SPORT_WORDING}
                        </p>
                    </div>

                    <Grid cols={3} gap="md" className="mb-8">
                        {features.map((feature) => (
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
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <SectionHeading
                                title="Food and drink"
                                align="left"
                                className="mb-6"
                            />
                            <div className="prose text-ink-muted mb-6 max-w-none prose-strong:text-ink-strong">
                                <p>
                                    Hungry? Our kitchen times change by day, so check them here before you set off.
                                </p>
                                <div className="mt-4">
                                    <strong className="text-ink-strong">Opening and kitchen times</strong>
                                    <BusinessHours/>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <Button asChild variant="primary"><Link href="/food-menu">See the food menu</Link></Button>
                                <Button asChild variant="outline"><Link href="/drinks">See the drinks</Link></Button>
                            </div>
                        </div>
                        <Card accent>
                          <CardBody className="p-8">
                            <h3 className="text-xl text-accent-text mb-4">Find us</h3>
                            <ul className="space-y-3 text-sm text-ink-muted mb-6">
                                <li className="flex gap-2"><span>{CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}</span></li>
                                <li className="flex gap-2"><span>2 minutes from Junction 14 of the M25</span></li>
                                <li className="flex gap-2"><span>Buses 441, 442 and 555 from Heathrow Central Bus Station</span></li>
                            </ul>
                            <Link href="/find-us" className="text-accent-text font-semibold hover:underline">
                                Get directions
                            </Link>
                          </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                title="Your questions"
                faqs={faqs}
                className="bg-surface"
            />

            <CtaBand
                title="Come and watch with us"
                copy={`Call us on ${CONTACT.phone} to check a particular game, or book a table.`}
            >
                <BookTableButton source="six_nations_cta" variant="primary" size="lg" className="w-full sm:w-auto">
                    Book a table
                </BookTableButton>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/find-us">Get directions</Link>
                </Button>
            </CtaBand>
        </>
    )
}
