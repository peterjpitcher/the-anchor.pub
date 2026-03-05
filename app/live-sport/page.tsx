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
    title: 'Live Sport Pub Near Heathrow | The Anchor',
    description: `Watch live terrestrial sport, rugby, and F1 at ${BRAND.name}. Multiple HD screens and a great atmosphere. We're just 7 mins from Heathrow T5.`,
    keywords: 'pub showing football heathrow, live sport pub stanwell, rugby pub heathrow',
    openGraph: {
        title: 'Live Sport at The Anchor',
        description: 'Every goal, every try, every lap. Watch it live on our big screens with a cold pint in hand.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Live Sport at The Anchor',
        description: 'Every goal, every try, every lap. Watch it live on our big screens with a cold pint in hand.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport'
    }
}

export default function LiveSportPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport' }
    ])

    // Using SportsActivityLocation schema if possible, or generic LocalBusiness with specific description
    const sportsSchema = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": `${BRAND.name} Sports Bar`,
        "description": "A premier destination for watching live sports events including Six Nations Rugby and Formula 1.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "postalCode": CONTACT.address.postcode,
            "addressCountry": CONTACT.address.country
        },
        "telephone": CONTACT.phoneIntl,
        "image": DEFAULT_PAGE_HEADER_IMAGE
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([sportsSchema, breadcrumbSchema]) }}
            />

            <HeroWrapper
                route="/live-sport"
                title="Live Sport at The Anchor"
                description="Terrestrial Channels Only (BBC/ITV). Multiple Screens. Great Food. The best atmosphere outside the stadium."
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

            <section className="bg-white py-6">
                <Container>
                    <p className="text-center text-sm text-gray-600">⭐⭐⭐⭐⭐ <strong>Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
                </Container>
            </section>

            <section className="py-8 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-green mb-4">
                            Never Miss a Moment
                        </PageTitle>
                        <p className="text-lg text-gray-700">
                            Whether it's the Six Nations crunch match, the F1 season finale, or major tournaments, we show it all. With multiple HD screens positioned throughout the pub, you won't have to crane your neck to see the action.
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
                                    title: "Terrestrial Sport Only",
                                    description: "We show major events on free-to-air channels (BBC, ITV, Channel 4). Please note we NOT do have Sky Sports or TNT Sports.",
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
                                    title: "Great Atmosphere",
                                    description: "Enjoy a cold pint and great food in a proper pub atmosphere. No booking required, just turn up and enjoy.",
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
                                    <li>• International Tournaments (Euros / World Cup)</li>
                                    <li>• FA Cup (Select Games)</li>
                                    <li>• Women's Super League (BBC games)</li>
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
                                <h3 className="text-xl font-bold text-anchor-green mb-4 border-b pb-2">🏇 Other Sport</h3>
                                <ul className="space-y-2">
                                    <li>• Cricket (Terrestrial Only)</li>
                                    <li>• Golf Majors (Highlights/BBC)</li>
                                    <li>• Horse Racing (ITV Racing)</li>
                                    <li>• Athletics & Olympics</li>
                                </ul>
                            </div>
                        </div>

                        <AlertBox
                            variant="info"
                            title="Specific Requests?"
                            className="max-w-2xl mx-auto mt-8"
                            content={`Want to watch a specific game shown on BBC, ITV, or Channel 4? Just ask the bar staff! If we have a screen free, we'll happily put it on for you. Please remember we cannot show games exclusive to Sky or TNT.`}
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
                        question: "Do you show Premier League games?",
                        answer: "We only show Premier League games that are broadcast on terrestrial television (e.g. Amazon Prime fixtures shown on BBC/ITV, or highlights). We do not have Sky Sports or TNT Sports packages."
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
                        text: "📅 Book a Table",
                        href: "/book-table",
                        variant: "secondary"
                    },
                    {
                        text: "📞 Call: 01753 682707",
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
