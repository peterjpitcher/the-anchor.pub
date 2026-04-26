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
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Watch Live Sport Near Heathrow | Big Screens',
    description: `Watch Six Nations, Euros, F1 & World Cup on big screens at The Anchor, Stanwell Moor. Terrestrial sport, great atmosphere, free parking, 7 mins from Heathrow T5.`,
    openGraph: {
        title: 'Watch Live Sport Near Heathrow — Major Tournaments on Big Screens',
        description: 'Six Nations, World Cup, Euros and F1 on big screens with a cold pint and free parking. 7 mins from Heathrow T5.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch Live Sport Near Heathrow — Major Tournaments on Big Screens',
        description: 'Six Nations, World Cup, Euros and F1 on big screens with free parking and great food. 7 mins from Heathrow T5.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport'
    }
}

export default async function LiveSportPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport' }
    ])

    // Using SportsActivityLocation schema if possible, or generic LocalBusiness with specific description
    const sportsSchema = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": `${BRAND.name} - Live Sport`,
        "description": "Watch major sporting events on big screens — Six Nations, World Cup, Euros, F1 and more. Free parking and great food near Heathrow.",
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

    const screeningEventSchema = {
        "@context": "https://schema.org",
        "@type": "ScreeningEvent",
        "name": "Live Sport Screenings at The Anchor",
        "description": "Watch Six Nations, World Cup 2026, Euros and F1 on big screens at The Anchor. Terrestrial channels only (BBC, ITV, Channel 4).",
        "location": {
            "@type": "Place",
            "name": "The Anchor",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": CONTACT.address.street,
                "addressLocality": CONTACT.address.town,
                "addressRegion": "Surrey",
                "postalCode": CONTACT.address.postcode,
                "addressCountry": "GB"
            }
        },
        "organizer": {
            "@id": "https://www.the-anchor.pub/#organization"
        },
        "isAccessibleForFree": true,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "description": "Free entry — just turn up and enjoy"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([sportsSchema, breadcrumbSchema, screeningEventSchema]) }}
            />

                        <HeroWrapper
              route="/live-sport"
              title="Live Sport at The Anchor"
              description="Terrestrial Channels Only (BBC/ITV/Channel 4). Multiple Screens. Great Food. The best atmosphere outside the stadium."
              variant="default"
              enableSmartCtas={true}
              showContextStrip={true}
            />

            <Container className="py-8">
                <PageTitle as="h2" className="text-center mb-6" seo={{ structured: true }}>
                    Live Sport Pub Near Heathrow — Big Screens &amp; Great Atmosphere
                </PageTitle>
            </Container>

            <section className="bg-anchor-bg py-6">
                <Container>
                    <p className="text-center text-sm text-anchor-cream-text/55"><strong>Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
                </Container>
            </section>

            <section className="py-8 bg-anchor-bg">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-gold-vivid mb-4">
                            Never Miss a Moment
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Whether it's the Six Nations crunch match, the F1 season finale, or major tournaments, we show it all. With multiple HD screens positioned throughout the pub, you won't have to crane your neck to see the action.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised">
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
                                    icon: "",
                                    title: "Terrestrial Sport Only",
                                    description: "We show major events on free-to-air channels (BBC, ITV, Channel 4). Please note we do NOT have Sky Sports or TNT Sports.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Full Match Audio",
                                    description: "For big games, we turn the commentary up so you get the full stadium atmosphere.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Great Atmosphere",
                                    description: "Enjoy a cold pint and great food in a proper pub atmosphere. No booking required, just turn up and enjoy.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg" id="schedule">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader title="What We Show" />
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="border border-anchor-gold/15 rounded-xl p-6 hover:shadow-md transition-shadow bg-anchor-bg-card">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4 border-b pb-2 border-anchor-gold/15">Football</h3>
                                <ul className="space-y-2">
                                    <li>• International Tournaments (Euros / World Cup)</li>
                                    <li>• FA Cup (Select Games)</li>
                                    <li>• Women's Super League (BBC games)</li>
                                </ul>
                            </div>
                            <div className="border border-anchor-gold/15 rounded-xl p-6 hover:shadow-md transition-shadow bg-anchor-bg-card">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4 border-b pb-2 border-anchor-gold/15">Rugby</h3>
                                <ul className="space-y-2">
                                    <li>• Six Nations</li>
                                    <li>• Autumn Internationals</li>
                                    <li>• Premiership Rugby</li>
                                    <li>• World Cups</li>
                                </ul>
                            </div>
                            <div className="border border-anchor-gold/15 rounded-xl p-6 hover:shadow-md transition-shadow bg-anchor-bg-card">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4 border-b pb-2 border-anchor-gold/15">Formula 1</h3>
                                <ul className="space-y-2">
                                    <li>• Live Race Weekends</li>
                                    <li>• Qualifying Sessions</li>
                                </ul>
                            </div>
                            <div className="border border-anchor-gold/15 rounded-xl p-6 hover:shadow-md transition-shadow bg-anchor-bg-card">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4 border-b pb-2 border-anchor-gold/15">Other Sport</h3>
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
                    },
                    {
                        question: "Do you show Six Nations rugby?",
                        answer: "Yes — every Six Nations match is shown live on our big screens with full audio. Book early for England and Wales matches as we fill up quickly."
                    },
                    {
                        question: "Can I watch Formula 1 at The Anchor?",
                        answer: "Yes, we show all F1 qualifying sessions and races live on our big screens."
                    },
                    {
                        question: "Do you have Sky Sports or TNT?",
                        answer: "No — we show terrestrial channels only (BBC, ITV, Channel 4). This covers Six Nations, F1, international football, cricket, golf, and horse racing."
                    },
                    {
                        question: "Can I request a specific match or event?",
                        answer: "If it is on a terrestrial channel, yes. Let us know in advance and we will make sure it is on with full audio."
                    },
                    {
                        question: "Is there food available during live sport?",
                        answer: "Yes — our full kitchen menu is available including stone-baked pizza, burgers, fish and chips, and pub classics. Book a table to guarantee your spot for big matches."
                    }
                ]}
                className="bg-white"
            />

            <section className="section-spacing bg-anchor-bg">
                <Container>
                    <SectionHeader title="What We're Showing" subtitle="Terrestrial sport on our big screens" />
                    <div className="prose prose-invert max-w-3xl mx-auto">
                        <p>We show every major sporting event available on BBC, ITV, and Channel 4. Current highlights include Six Nations rugby, Formula 1, international football qualifiers, and cricket. All matches are shown with full audio on multiple HD screens.</p>
                        <p>Want to watch something specific? Let us know and we will make sure it is on. We can also reserve seating for big matches — just call ahead or book online.</p>
                    </div>
                </Container>
            </section>

            <CTASection
                title="Secure Your Spot for the Big Game"
                description="Don't leave it to chance. Book a table with a view of the screen."
                buttons={[
                    {
                        text: "Book a Table",
                        href: "/book-table",
                        variant: "secondary"
                    },
                    {
                        text: "Call: 01753 682707",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "sport_cta",
                        variant: "primary"
                    },
                    {
                        text: "Get Directions",
                        href: "https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ",
                        variant: "white"
                    }
                ]}
                variant="green"
            />
        </>
    )
}
