import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
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
    title: 'Family Friendly Pub Near Heathrow | Kids Menu & Garden',
    description: `${BRAND.name} is the perfect family stop near Heathrow. Kids menu, large beer garden for running around, and high chairs available. Stress-free dining for parents.`,
    keywords: 'family friendly pub heathrow, kids menu heathrow, pub with garden heathrow, family restaurants near terminal 5',
    openGraph: {
        title: 'Family Friendly Dining Near Heathrow',
        description: 'Let the kids burn off some energy in our garden before the flight. Great food for them, cold drinks for you.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Family Friendly Dining Near Heathrow',
        description: 'Let the kids burn off some energy in our garden before the flight. Great food for them, cold drinks for you.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/heathrow-family-dining'
    }
}

export default function FamilyDiningPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Family Dining', url: '/heathrow-family-dining' }
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/heathrow-family-dining"
                title="Family Friendly Dining Near Heathrow"
                description="Fresh air, good food, and plenty of space for the kids to run around"
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="family_hero"
                        context="dining_family"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                         Book Family Table
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="/food-menu">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                             View Kids Menu
                        </Button>
                    </Link>
                }
                secondaryInfo={
                  <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
                  </div>
                }
            />

            <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-cream-text mb-4">
                            Stress-Free Stopovers for Parents
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Traveling with children can be exhausting. The Anchor offers an oasis of calm (and space!) just minutes from the airport. Escape the crowded terminal and let the little ones stretch their legs in our secure environment.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Why Families Love Us"
                            subtitle="We've thought of everything to make your layover easier."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Large Beer Garden",
                                    description: "A safe, enclosed grassy area where kids can play freely while you watch from your table.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Kids Menu",
                                    description: "Proper portions of favourites like fish fingers and sausages - nothing too fancy!",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Plane Spotting",
                                    description: "We are under the flight path! Kids love watching the giant planes land nearby.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
                <Container>
                    <div className="bg-blue-50 p-8 rounded-xl max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold text-center text-blue-900 mb-6">Facilities for Little Ones</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl"></span>
                                <div>
                                    <p className="font-bold">High Chairs</p>
                                    <p className="text-sm text-anchor-cream-text/55">Plenty available, just ask when booking.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl"></span>
                                <div>
                                    <p className="font-bold">Changing Facilities</p>
                                    <p className="text-sm text-anchor-cream-text/55">Clean baby changing area available.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl"></span>
                                <div>
                                    <p className="font-bold">Kid-Friendly Drinks</p>
                                    <p className="text-sm text-anchor-cream-text/55">Fruit shoots, juices, and milk available.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl"></span>
                                <div>
                                    <p className="font-bold">Activity Possible</p>
                                    <p className="text-sm text-anchor-cream-text/55">Feel free (and encouraged!) to bring colouring pads.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Is the garden secure?",
                        answer: "Our garden is enclosed by fencing, making it safer for children. However, as it is a car park adjoining, we always ask parents to supervise their children."
                    },
                    {
                        question: "Can we bring a pushchair inside?",
                        answer: "Yes, we have ramp access and plenty of space between tables for buggies and pushchairs."
                    },
                    {
                        question: "Is the food fast?",
                        answer: "We cook to order, but if you are in a rush for a flight, let us know! Kids meals are usually very quick to prepare."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Bring the Whole Family"
                description="A warm welcome awaits you and your little travelers."
                buttons={[
                    {
                        text: " Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "family_cta",
                        variant: "primary"
                    },
                    {
                        text: " Get Directions",
                        href: "https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ",
                        variant: "white"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
