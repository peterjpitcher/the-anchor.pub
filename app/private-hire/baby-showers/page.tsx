import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, Button } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

export const metadata: Metadata = {
    title: 'Baby Shower Venue Near Ashford Hospital | The Anchor',
    description: 'Host the perfect baby shower at The Anchor. Afternoon tea packages, mocktails, and private spaces near Ashford Hospital. Free parking.',
    openGraph: {
        title: 'Baby Shower Venue | The Anchor Stanwell Moor',
        description: 'Afternoon tea, mocktails, and games. The perfect daytime celebration.',
        images: [DEFAULT_CORPORATE_IMAGE],
    }
}

const nearbyHospitals = landmarks.filter(l => l.type === 'hospital');

export default function BabyShowersPage() {
    return (
        <>
            <HeroWrapper
                route="/private-hire/baby-showers"
                title="Baby Showers"
                description="Welcoming new arrivals in style"
                variant="promo"
                tags={[
                    { label: "🧁 Afternoon Tea", variant: "success" },
                    { label: "🍹 Mocktails", variant: "default" },
                    { label: "🎲 Space for Games", variant: "default" },
                    { label: "🅿️ Easy Parking", variant: "success" }
                ]}
                primaryCta={
                    <BookTableButton
                        source="baby_shower_hero"
                        variant="primary"
                        size="lg"
                        context="baby_shower"
                    >
                        Enquire Now
                    </BookTableButton>
                }
                secondaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="baby_shower_hero"
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
                        The Perfect Daytime Celebration
                    </PageTitle>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-gray-700 mb-8">
                            Treat the mum-to-be to a relaxing afternoon of good food and laughter. Our bright and airy spaces are perfect for afternoon tea, games, and opening gifts.
                        </p>
                        {nearbyHospitals.length > 0 && (
                            <div className="bg-yellow-50 p-4 rounded-xl inline-block text-center border border-yellow-100">
                                <span className="font-bold text-anchor-green mr-2">📍 Ideally located near:</span>
                                {nearbyHospitals.map(l => (
                                    <Link key={l.slug} href={`/private-hire/near/${l.slug}`} className="hover:underline text-gray-700 font-medium">
                                        {l.name} ({l.distance})
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-gray-50">
                <Container>
                    <SectionHeader
                        title="Shower Packages"
                    />
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                            <span className="text-4xl mb-4 block">🧁</span>
                            <h3 className="text-xl font-bold text-anchor-green mb-2">Afternoon Tea</h3>
                            <p className="text-gray-600 mb-4 italic">Catering packages available upon request</p>
                            <p className="text-gray-600 mb-4">Classic finger sandwiches, homemade scones with clotted cream, and a selection of delicate cakes.</p>
                            <ul className="text-sm text-gray-500 space-y-1">
                                <li>+ Add Prosecco on arrival</li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                            <span className="text-4xl mb-4 block">🥙</span>
                            <h3 className="text-xl font-bold text-anchor-green mb-2">Light Lunch Buffet</h3>
                            <p className="text-gray-600 mb-4 italic">Catering packages available upon request</p>
                            <p className="text-gray-600 mb-4">A spread of wraps, quiches, fresh salads, and fruit platters. A healthier option for a daytime treat.</p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-white">
                <Container>
                    <SectionHeader
                        title="All The Little Extras"
                    />
                    <FeatureGrid
                        columns={3}
                        features={[
                            {
                                icon: "🍹",
                                title: "Mocktail Menu",
                                description: "Delicious alcohol-free cocktails so the mum-to-be doesn't feel left out.",
                                className: "text-center"
                            },
                            {
                                icon: "🎁",
                                title: "Gift Area",
                                description: "We'll set up a dedicated table for gifts and party favours.",
                                className: "text-center"
                            },
                            {
                                icon: "Gender Reveal",
                                title: "Gender Reveals",
                                description: "Planning a reveal? We can help coordinate the big surprise with balloons or cakes.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <PrivateBookingSection eventType="Christening / Baby Shower" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can we play games?",
                        answer: "Yes! 'Guess the weight', baby bingo, and other games are very welcome. We have plenty of space."
                    },
                    {
                        question: "Can we decorate?",
                        answer: "Absolutely. Feel free to bring banners, balloons, and sashes to make the space your own."
                    },
                    {
                        question: "Is there a time limit?",
                        answer: "Afternoon bookings typically have the space for 3-4 hours, which is plenty of time for tea, games, and gifts."
                    }
                ]}
            />
        </>
    )
}
