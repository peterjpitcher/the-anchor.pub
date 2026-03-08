import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, FeatureCard, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Corporate Christmas Party Venue Near Heathrow | The Anchor',
    description: `Book your office Christmas party at ${BRAND.name}. Festive menus, private areas, and easy access for Poyle, Colnbrook, and Heathrow businesses. Enquire now.`,
    keywords: 'christmas party venue heathrow, corporate christmas party staines, office party venue poyle, christmas lunch heathrow',
    openGraph: {
        title: 'The Perfect Venue for Your Office Christmas Party',
        description: 'Festive menus, great drinks packages, and a warm atmosphere. Book your team celebration today.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'The Perfect Venue for Your Office Christmas Party',
        description: 'Festive menus, great drinks packages, and a warm atmosphere. Book your team celebration today.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/corporate-christmas-parties'
    }
}

export default function ChristmasPartiesPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Christmas Parties', url: '/corporate-christmas-parties' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/corporate-christmas-parties"
                title="Christmas Parties at The Anchor"
                description="The trusted choice for Poyle and Heathrow businesses. Festive food, zero stress."
                variant="default"
                primaryCta={
                    <Link href="/contact">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                             Enquire Now
                        </Button>
                    </Link>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                             View Sample Menu
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Celebrate the Season
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            It's the one time of year the whole team gets together. Don't risk it on a soulless hotel conference room. Come to The Anchor for a proper Christmas celebration with roaring fires, traditional turkey dinners, and enough cheer to last until January.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Why Book With Us?"
                            subtitle="We host hundreds of happy festive diners every year."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Festive Menu",
                                    description: "2 or 3 course set menus featuring all the classics (and some modern twists).",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Drinks Packages",
                                    description: "Pre-order wine and buckets of beer for the table to avoid the bar queue.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Private Areas",
                                    description: "We can section off areas for larger groups so you have your own space.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />

                        <AlertBox
                            variant="warning"
                            title="Key Dates Sell Fast"
                            className="max-w-2xl mx-auto mt-8"
                            content="Fridays and Saturdays in December get booked up by October. If you have a specific date in mind, we recommend enquiring as early as possible."
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div>
                            <SectionHeader
                                title="For The Organiser"
                                subtitle="We make your job easy."
                                className="text-left"
                            />
                            <p className="text-anchor-cream-text/70 mb-4">
                                We know organising the office party is a thankless task. We're here to help you look like a hero.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <span className="text-anchor-gold-vivid mr-2 text-xl"></span>
                                    <div>
                                        <strong className="block text-anchor-cream-text">Easy Pre-order System</strong>
                                        <span className="text-anchor-cream-text/70 text-sm">No more spreadsheets. We provide a simple form for your team.</span>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-anchor-gold-vivid mr-2 text-xl"></span>
                                    <div>
                                        <strong className="block text-anchor-cream-text">VAT Invoices</strong>
                                        <span className="text-anchor-cream-text/70 text-sm">Proper VAT receipts provided for the accounts department.</span>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-anchor-gold-vivid mr-2 text-xl"></span>
                                    <div>
                                        <strong className="block text-anchor-cream-text">The Organiser Perk</strong>
                                        <span className="text-anchor-cream-text/70 text-sm">Book a group of 20+ and receive a GBP 40 voucher for yourself in January.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 p-8 rounded-xl text-center">
                            <h3 className="text-2xl font-bold mb-4">Early Bird Offer</h3>
                            <p className="mb-6">
                                Confirm your booking with a deposit before <strong>October 31st</strong> and receive a complimentary glass of Prosecco for every guest on arrival.
                            </p>
                            <Link href="/contact">
                                <Button variant="secondary" size="lg">
                                    Claim Early Bird Offer
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
	                    {
	                        question: "Do you require a deposit?",
	                        answer: "Yes, we require a GBP 10 per person deposit to secure the booking. This is deducted from the final bill."
	                    },
                    {
                        question: "Can you cater for dietary requirements?",
                        answer: "Absolutely. Our Christmas menu always includes Vegan, Vegetarian, and Gluten-Free options. Just let us know in advance."
                    },
                    {
                        question: "Is there a service charge?",
                        answer: "For groups of 10 or more, a discretionary 10% service charge is added to the bill, which goes directly to the staff served you."
                    }
                ]}
                className="bg-anchor-bg-card"
            />

            <CTASection
                title="Ready to Book?"
                description="Secure your date before it's gone."
                buttons={[
                    {
                        text: " Enquire Now",
                        href: "mailto:info@the-anchor.pub?subject=Christmas%20Party%20Enquiry",
                        variant: "primary"
                    },
                    {
                        text: " Call Us",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "christmas_cta",
                        variant: "secondary"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
