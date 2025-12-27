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
    title: 'Live Sport Pub Near Heathrow | Sky Sports & TNT | The Anchor',
    description: `Watch live football, rugby, and F1 at ${BRAND.name}. Multiple HD screens, Sky Sports, TNT Sports, and a great atmosphere. Just 5 mins from Heathrow T5.`,
    keywords: 'pub showing football heathrow, sky sports pub staines, where to watch football heathrow, live sport pub stanwell',
    openGraph: {
        title: 'Live Sport at The Anchor Pub',
        description: 'Every goal, every try, every lap. Watch it live on our big screens with a cold pint in hand.',
        images: [DEFAULT_PAGE_HEADER_IMAGE],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Live Sport at The Anchor Pub',
        description: 'Every goal, every try, every lap. Watch it live on our big screens with a cold pint in hand.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    })
}

export default function LiveSportPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport-pub' }
    ])

    // Using SportsActivityLocation schema if possible, or generic LocalBusiness with specific description
    const sportsSchema = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": `${BRAND.name} Sports Bar`,
        "description": "A premier destination for watching live sports events including Premier League Football, Six Nations Rugby, and Formula 1.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "UK"
        },
        "telephone": CONTACT.phone,
        "image": DEFAULT_PAGE_HEADER_IMAGE
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([sportsSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/live-sport-pub"
                title="Live Sport at The Anchor"
                description="Sky Sports. TNT Sports. Multiple Screens. The best atmosphere outside the stadium."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="sport_hero"
                        context="dining_sport"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        📞 Book Best Seat
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="#schedule">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            📺 See What's On
                        </Button>
                    </Link>
                }
            />

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Never Miss a Moment
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            Whether it's the Premier League title decider, the Six Nations crunch match, or the F1 season finale, we show it all. With multiple HD screens positioned throughout the pub, you won't have to crane your neck to see the action.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="The Viewing Experience"
                            subtitle="We take sport seriously."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "📺",
                                    title: "Sky & TNT Sports",
                                    description: "We have the full commercial packages, so if it's televised, we can show it.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🔉",
                                    title: "Full Match Audio",
                                    description: "For big games, we turn the commentary up so you get the full stadium atmosphere.",
                                    variant: "colored",
                                    color: "bg-anchor-cream",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "🍺",
                                    title: "Table Service",
                                    description: "During major events, we offer table service so you don't miss a goal while queuing at the bar.",
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

            <section className="section-spacing bg-white" id="schedule">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader title="What We Show" />
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-anchor-green mb-4 border-b pb-2">⚽ Football</h3>
                                <ul className="space-y-2">
                                    <li>• Premier League</li>
                                    <li>• Champions League</li>
                                    <li>• FA Cup & Carabao Cup</li>
                                    <li>• International Tournaments (Euros / World Cup)</li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-anchor-green mb-4 border-b pb-2">🏉 Rugby</h3>
                                <ul className="space-y-2">
                                    <li>• Six Nations</li>
                                    <li>• Autumn Internationals</li>
                                    <li>• Premiership Rugby</li>
                                    <li>• World Cups</li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-anchor-green mb-4 border-b pb-2">🏎️ Formula 1</h3>
                                <ul className="space-y-2">
                                    <li>• Live Race Weekends</li>
                                    <li>• Qualifying Sessions</li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-anchor-green mb-4 border-b pb-2">🥊 Boxing & More</h3>
                                <ul className="space-y-2">
                                    <li>• Major Title Fights</li>
                                    <li>• Cricket (The Ashes / T20)</li>
                                    <li>• Golf Majors</li>
                                    <li>• Horse Racing (Cheltenham / Grand National)</li>
                                </ul>
                            </div>
                        </div>

                        <AlertBox
                            variant="info"
                            title="Specific Requests?"
                            className="max-w-2xl mx-auto mt-8"
                            content={`Want to watch a specific game that might not be the 'main event'? Just ask the bar staff! If we have a screen free, we'll happily put it on for you.`}
                        />
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Do I need to book a table for football matches?",
                        answer: "For big games (like England matches or Cup Finals), booking is essential as we get very full. For standard league games, walk-ins are usually fine, but booking guarantees a good view."
                    },
                    {
                        question: "Do you show 3pm kick-offs?",
                        answer: "We adhere to UK broadcasting laws, so we cannot show live 3pm Saturday Premier League kick-offs. We show all televised matches available on Sky and TNT."
                    },
                    {
                        question: "Are children allowed during matches?",
                        answer: "Yes, until 8pm. However, please be aware that the pub can get loud and busy during major sporting events."
                    }
                ]}
                className="bg-white"
            />

            <CTASection
                title="Secure Your Spot for the Big Game"
                description="Don't leave it to chance. Book a table with a view of the screen."
                buttons={[
                    {
                        text: "📞 Book Screen View",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "sport_cta",
                        variant: "primary"
                    },
                    {
                        text: "📍 Get Directions",
                        href: "https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ",
                        variant: "white"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
