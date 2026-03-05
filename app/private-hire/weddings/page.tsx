import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, Button, InfoBoxGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

export const metadata: Metadata = {
    title: 'Wedding Reception & Engagement Party Venue | The Anchor',
    description: 'The perfect venue near Staines Registry Office an Great Fosters for engagement parties, rehearsal dinners, and relaxed wedding receptions. Free parking.',
    openGraph: {
        title: 'Wedding & Engagement Venue | The Anchor Stanwell Moor',
        description: 'Relaxed wedding celebrations, engagement parties, and day-after brunches.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
        title: 'Wedding & Engagement Venue | The Anchor Stanwell Moor',
        description: 'Relaxed wedding celebrations, engagement parties, and day-after brunches.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/weddings'
    }
}

const nearbyWeddingVenues = landmarks.filter(l => l.type === 'registry_office');

export default function WeddingsPage() {
    return (
        <>
            <HeroWrapper
                route="/private-hire/weddings"
                variant="feature"
                title="Weddings & Engagements"
                description="Relaxed celebrations for the modern couple"
               
                tags={[
                    { label: "💍 Engagement Parties", variant: "default" },
                    { label: "🥂 Rehearsal Dinners", variant: "success" },
                    { label: "📍 Near Registry Office", variant: "default" },
                    { label: "🎉 Day-After Brunch", variant: "success" }
                ]}
                primaryCta={
                    <BookTableButton
                        source="weddings_hero"
                        variant="primary"
                        size="lg"
                        context="wedding"
                    >
                        Enquire Now
                    </BookTableButton>
                }
                secondaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="weddings_hero"
                        variant="secondary"
                        size="lg"
                    >
                        Call 01753 682707
                    </PhoneButton>
                }
            />

            <section className="py-12 bg-white">
                <Container>
                    <PageTitle className="text-center mb-6" seo={{ structured: true, speakable: true }}>
                        Not Just Another Wedding Venue
                    </PageTitle>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-gray-700 mb-8">
                            We specialise in the celebrations <strong>around</strong> the big day. Whether it's a lively engagement party, a relaxed dinner after a registry office ceremony, or a 'day-after' brunch to say goodbye to out-of-town guests.
                        </p>

                        <div className="bg-pink-50 p-6 rounded-xl inline-block text-left w-full border border-pink-100">
                            <h3 className="font-bold text-anchor-green mb-3 text-center">Perfectly Located Near</h3>
                            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                                {nearbyWeddingVenues.map(l => (
                                    <li key={l.slug} className="flex items-center gap-2">
                                        <span className="text-anchor-gold">🏛️</span>
                                        <Link href={`/private-hire/near/${l.slug}`} className="hover:underline text-gray-700 font-medium">
                                            {l.name} ({l.distance})
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <SectionHeader
                        title="Celebration Options"
                    />
                    <FeatureGrid
                        columns={2}
                        features={[
                            {
                                icon: "💍",
                                title: "Engagement Parties",
                                description: "Kick off your journey with a bang. DJ, dancing, buffet, and a private bar for up to 80 guests.",
                                className: "text-center"
                            },
                            {
                                icon: "🍽️",
                                title: "Rehearsal Dinners",
                                description: "Get the families together before the big day. A relaxed 3-course meal to break the ice.",
                                className: "text-center"
                            },
                            {
                                icon: "🥂",
                                title: "Post-Registry Lunch",
                                description: "After the 'I dos' at Staines Registry Office, head over for a celebratory lunch without the formality of a reception.",
                                className: "text-center"
                            },
                            {
                                icon: "🍳",
                                title: "Day-After Brunch",
                                description: "The perfect debrief. Bloody Marys, full English breakfasts, and swapping stories from the night before.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-white">
                <Container>
                    <SectionHeader
                        title="Make It Yours"
                        subtitle="Flexible packages to suit your style"
                    />
                    <InfoBoxGrid
                        columns={3}
                        boxes={[
                            {
                                title: "Drinks Packages",
                                content: "Arrival Prosecco, beer buckets on tables, or a full open bar tab. We can tailor the drink options to your budget.",
                                variant: "default"
                            },
                            {
                                title: "Decorations",
                                content: "Bring your own balloons, photo walls, and table centers. We just provide the blank canvas for your theme.",
                                variant: "default"
                            },
                            {
                                title: "Entertainment",
                                content: "Connect your Spotify playlist to our sound system or bring your favourite DJ to get the party started.",
                                variant: "default"
                            }
                        ]}
                    />
                </Container>
            </section>

            <PrivateBookingSection eventType="Wedding Reception" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How many guests can you accommodate?",
                        answer: "We can host intimate dinners for 10 up to parties of 80 in our private room, or up to 200 for exclusive venue hire."
                    },
                    {
                        question: "Do you have a late license?",
                        answer: "Our standard license runs until 11pm (11:30pm Fri/Sat), but extensions can be arranged for private parties upon request."
                    },
                    {
                        question: "Is there anywhere for guests to stay?",
                        answer: "Yes, being near Heathrow means there are dozens of hotels within a 5-minute drive, catering to all budgets."
                    }
                ]}
            />
        </>
    )
}
