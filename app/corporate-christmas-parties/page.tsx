import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Badge, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Corporate Christmas Party Near Heathrow | The Anchor 2026',
    description: 'Book your corporate Christmas party or work Christmas do at The Anchor, a pub near Heathrow & Staines. Free parking, three-course festive menu from £36.95pp. Enquire now.',
    openGraph: {
        title: 'Corporate Christmas Party Near Heathrow 2026 | The Anchor',
        description: 'Corporate Christmas party venue near Heathrow with festive menus from £36.95pp, free parking, VAT invoices, and a simple pre-order system for office teams.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Corporate Christmas Party Near Heathrow 2026 | The Anchor',
        description: 'Corporate Christmas party venue near Heathrow with festive menus from £36.95pp, free parking, VAT invoices, and a simple pre-order system for office teams.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/corporate-christmas-parties'
    }
}

export default function ChristmasPartiesPage() {
    return (
        <>

            <InteriorHero
                image="/images/page-headers/home/page-headers-homepage.jpg"
                crumb="Corporate Christmas Parties"
                kicker="Corporate Christmas 2026"
                title="Corporate Christmas party near Heathrow — for offices, airport teams & Surrey businesses"
                lead="You've been handed the job of organising the works christmas do. Deep breath. We've hosted office parties for Heathrow crews, Poyle business parks and Surrey teams for years, so we know exactly what you need: great food, easy parking, and zero drama on the night. Three-course festive menu from £36.95 per person, with a proper pub atmosphere that actually feels like Christmas."
                actions={
                    <>
                        <Link href="/christmas-parties#christmas-enquiry">
                            <Button variant="primary" size="lg" fullWidth>
                                 Enquire about your Christmas party booking
                            </Button>
                        </Link>
                        <Link href={`${CONTACT.phoneHref}`}>
                            <Button variant="outline" size="lg" fullWidth>
                                 Call 01753 682707
                            </Button>
                        </Link>
                    </>
                }
            />

            <section className="section-spacing-sm bg-canvas py-section-y">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-ink-strong mb-4">
                            Corporate Christmas Party &mdash; Make It the Works Do They Actually Talk About
                        </PageTitle>
                        <p className="text-lg text-ink-muted mb-4">
                            Every office has that one legendary Christmas do. The food was brilliant. Nobody had to argue about parking. Someone from accounts sang karaoke. Let&apos;s make yours the one people remember this year.
                        </p>
                        <p className="text-lg text-ink-muted">
                            At The Anchor, we handle the details so you can enjoy the night. A dedicated contact for your booking, a simple online pre-order system (no chasing colleagues on spreadsheets), and a kitchen that takes festive food seriously, herb-crusted triple-cooked roast potatoes, pigs in blankets, sage &amp; onion stuffing, the lot. Whether you&apos;re after a sit-down work christmas lunch on a Tuesday or a Friday-night party with a DJ and a late bar, we&apos;ll shape it around your team.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="bg-surface py-section-y">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeading
                            title="Why your office should book their corporate Christmas party here"
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
                            {[
                                { title: "7 Minutes from Heathrow Terminal 5", description: "The closest proper pub to Heathrow Airport. Two minutes from M25 Junction 14, fifteen minutes from Terminal 2. Colleagues flying in from other offices? They'll be at the bar before their taxi receipt loads. If you're searching for a christmas party near me, we're the easy answer for anyone west of London." },
                                { title: "Free Parking, Outside the ULEZ", description: "Around 20 free spaces on-site, no meters, no charges, no £12.50 ULEZ fee. Your team can leave cars overnight and collect them the next morning. That alone makes us one of the most affordable christmas party venues near Heathrow." },
                                { title: "A Proper Village Pub, Not a Hotel Function Room", description: "No fluorescent lighting. No identikit conference suites. A genuine village local in Stanwell Moor, Surrey (TW19 6AQ) with warm hospitality, crackers on the table and food that actually tastes of Christmas. This is what your company christmas party venue should feel like." },
                            ].map(feature => (
                                <Card key={feature.title} accent className="h-full">
                                    <CardBody className="flex h-full flex-col gap-2">
                                        <h3 className="font-display text-h4 text-ink-strong">{feature.title}</h3>
                                        <p className="text-ink-muted">{feature.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        <Card accent className="max-w-2xl mx-auto mt-8"><CardBody>
                            <h3 className="font-display text-h4 text-ink-strong mb-2">Early bird offer</h3>
                            <p className="text-ink-muted">Book by 1 October and take 20% off your food bill, for every adult in parties of six or more. That's a decent saving to report back to finance.</p>
                        </CardBody></Card>
                    </div>
                </Container>
            </section>

            <section className="bg-surface-sunk py-section-y">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div>
                            <SectionHeading
                                title="For the organiser: we've thought of everything"
                                align="left"
                            />
                            <ul className="space-y-4">
                                <li>
                                    <strong className="block text-ink-strong">No Spreadsheet Required</strong>
                                    <span className="text-ink-muted text-sm">We send you a pre-order form link. Share it with the team. Everyone picks their courses. Done. Dietary requirements, allergies and children&apos;s meals all captured in one place. VAT invoices are available for accounts, just ask.</span>
                                </li>
                                <li>
                                    <strong className="block text-ink-strong">Invoices, Deposits &amp; Bar Tabs</strong>
                                    <span className="text-ink-muted text-sm">A £10 per person deposit (non-refundable) secures your date. We can invoice the deposit separately, set up a pre-paid bar tab with your budget, and send a full VAT invoice after the event. Finance will thank you.</span>
                                </li>
                                <li>
                                    <strong className="block text-ink-strong">£40 Voucher for Groups of 20+</strong>
                                    <span className="text-ink-muted text-sm">Book a staff christmas party for twenty or more guests and we&apos;ll send you a £40 voucher to spend at The Anchor in January. You organised the whole thing, you&apos;ve earned a quiet meal on us.</span>
                                </li>
                            </ul>
                        </div>
                        <Card accent className="text-center"><CardBody>
                            <h3 className="font-display text-h4 text-ink-strong mb-4">Early Bird Offer</h3>
                            <p className="mb-6 text-ink-muted">
                                <strong className="text-ink-strong">20% off your food bill</strong> when booked by 1 October (parties of 6+). Tue–Thu from £36.95pp. Fri–Sat from £39.95pp. The same generous three-course festive menu, the same crackers and candles, just a kinder number on the invoice.
                            </p>
                            <Link href="/christmas-parties#christmas-enquiry">
                                <Button variant="outline" size="lg">
                                    Claim Early Bird Offer
                                </Button>
                            </Link>
                        </CardBody></Card>
                    </div>
                </Container>
            </section>

            <section className="bg-surface py-section-y">
                <Container>
                    <div className="max-w-5xl mx-auto text-center">
                        <SectionHeading
                            title="Christmas party packages & pricing for office groups"
                            lead="Transparent per-person pricing and flexible formats to suit your team size. Pick a setup, send your enquiry, and we'll hold your date."
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
                            {[
                                { title: "Small Team Dinner (6–25)", description: "Private dining room. Three-course festive menu. Tue–Thu: £36.95 per person. Fri–Sat: £39.95 per person. Cosy private dining with crackers, candles and direct table service. The room seats up to 25, perfect for a department work christmas lunch or an intimate staff dinner. Popular with Poyle, Colnbrook and Heathrow business park teams." },
                                { title: "Department Celebration (26–60)", description: "Main bar configured for your group. Sit-down or buffet. Sit-down from £36.95pp. Buffets from £10.95pp (26+ guests). The main bar reshaped for your party with flexible layouts for sit-down dinners or buffet service. Add a quiz, Music Bingo or karaoke and turn your works christmas do into something people actually look forward to." },
                                { title: "Full Venue Hire (60–200)", description: "Exclusive use of the entire pub. Pricing on enquiry. Private use of the bar, dining room and conservatory. Bring a DJ, book a live band, or let us set up karaoke. Late bar until midnight. Up to 60 seated or 200 standing, ideal for airline crews, multi-site teams and larger corporate christmas parties." },
                            ].map(pkg => (
                                <Card key={pkg.title} accent className="h-full">
                                    <CardBody className="flex h-full flex-col gap-2">
                                        <h3 className="font-display text-h4 text-ink-strong">{pkg.title}</h3>
                                        <p className="text-ink-muted">{pkg.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        <p className="text-ink-muted text-sm mb-6 mt-6">
                            Children&apos;s pricing: Under 12, 2 courses £12.95 · 3 courses £15.95
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/christmas-parties#christmas-enquiry">
                                <Button variant="primary" size="lg">
                                    Request your Christmas party booking
                                </Button>
                            </Link>
                            <Link href={`${CONTACT.phoneHref}`}>
                                <Button variant="outline" size="lg">
                                    Call 01753 682707
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="bg-surface-sunk py-section-y">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-4 flex justify-center">
                            <Badge variant="sand">Three-course set menu</Badge>
                        </div>
                        <SectionHeading
                            title="Our festive menu, the same at lunch and dinner"
                        />
                        <p className="text-lg text-ink-muted mb-4">
                            Three generous courses that feel like Christmas at home, just with someone else doing the washing up. Whether your team books a festive lunch on a Tuesday or a Friday-night dinner, every main arrives with herb-crusted triple-cooked roast potatoes, seasonal vegetables, Yorkshire puddings, pigs in blankets, sage &amp; onion stuffing and our signature gravy.
                        </p>
                        <p className="text-sm text-ink-muted mb-6">
                            Sample menu, 2026 selection confirmed in October. Available for parties of six or more.
                        </p>

                        <Card accent className="max-w-2xl mx-auto mb-8"><CardBody>
                            <h3 className="font-display text-h4 text-ink-strong mb-2">Christmas lunch near me?</h3>
                            <p className="text-ink-muted">Our midweek lunches are the same full festive menu as the evening, no cut-down &quot;lunch version.&quot; Three courses, all the trimmings, proper coffee to finish.</p>
                        </CardBody></Card>

                        <Link href="/food-menu">
                            <Button variant="outline" size="lg">
                                View the full festive menu
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                title="Corporate Christmas Party FAQs"
                faqs={[
                    {
                        question: "How do we book an office Christmas party?",
                        answer: "Send us an enquiry with your group size, preferred date and whether you'd like lunch or dinner. We'll come back within one working day with availability and next steps. A £10 per person deposit (non-refundable) secures your christmas party booking, we can invoice this separately for your accounts team."
                    },
                    {
                        question: "Can we book a work christmas lunch instead of an evening dinner?",
                        answer: "Absolutely. We serve the same festive menu at lunchtime and in the evening, so a festive lunch here is every bit as generous as the dinner service. Lunchtime bookings are popular with office teams who want to celebrate during the day and still get home at a sensible hour."
                    },
                    {
                        question: "What's included in your christmas party packages?",
                        answer: "All christmas party packages include a three-course festive menu with crackers and candlelit tables. Tue–Thu from £36.95pp, Fri–Sat from £39.95pp. Buffets are available from £10.95pp for groups of 26 or more. The per-person price covers your meal, room hire, and table setup — drinks are additional."
                    },
                    {
                        question: "Do you provide VAT invoices and corporate billing?",
                        answer: "Yes. We provide full VAT invoices, can invoice deposits separately, and offer pre-paid bar tab management with live updates through the evening. Everything your finance team needs to process the staff christmas party without chasing receipts."
                    },
                    {
                        question: "How close are you to Heathrow and the M25?",
                        answer: "The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), seven minutes from Heathrow Terminal 5, fifteen minutes from Terminal 2, and two minutes from M25 Junction 14. We're a christmas party venue that colleagues from different offices, terminals and even countries can reach easily."
                    },
                    {
                        question: "Is there parking? Are you inside the ULEZ?",
                        answer: "Around 20 free spaces on-site, no meters, no charges. We're outside the ULEZ zone, saving your guests £12.50 per car compared to driving into London. Cars can stay overnight. We're one of the most accessible company christmas party venues near Heathrow."
                    },
                    {
                        question: "What entertainment do you offer for a works christmas do?",
                        answer: "Festive playlists through our sound system are included. Beyond that, we can arrange quiz nights, Music Bingo, karaoke, live bands or DJs. A late bar until midnight is available for larger bookings. Tell us what kind of works christmas do your team would enjoy and we'll put it together."
                    },
                    {
                        question: "What's the early bird offer?",
                        answer: "Book by 1 October for parties of six or more and take 20% off your food bill. That brings midweek office christmas party pricing down to around £29.56 per person for a full three-course festive meal with all the trimmings. Not a bad number to put in front of your manager."
                    }
                ]}
                className="bg-canvas"
            />

            <CtaBand
                title="Ready to Book Your Office Christmas Party?"
                copy="Send your enquiry and we'll come back within one working day with availability, pricing and everything you need to get sign-off. Friday and Saturday nights sell out by October, so the sooner you get in touch, the better your date options."
            >
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                    <Link href="/christmas-parties#christmas-enquiry">
                        <Button variant="primary" size="lg">
                            Enquire Now
                        </Button>
                    </Link>
                    <PhoneButton phone={CONTACT.phone} source="corporate_christmas_cta" variant="outline" size="lg">
                        Call 01753 682707
                    </PhoneButton>
                    <Link href="mailto:manager@the-anchor.pub?subject=Corporate%20Christmas%20Party%20Enquiry">
                        <Button variant="outline" size="lg">
                            Email Us
                        </Button>
                    </Link>
                </div>
            </CtaBand>
        </>
    )
}
