import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
    title: 'Baby Shower Venue Near Ashford Hospital | The Anchor',
    description: 'Host the perfect baby shower at The Anchor. Afternoon tea packages, mocktails, and private spaces near Ashford Hospital. Free parking.',
    openGraph: {
        title: 'Baby Shower Venue | The Anchor Stanwell Moor',
        description: 'Afternoon tea, mocktails, and games. The perfect daytime celebration.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
        title: 'Baby Shower Venue | The Anchor Stanwell Moor',
        description: 'Afternoon tea, mocktails, and games. The perfect daytime celebration.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/baby-showers'
    }
}

const nearbyHospitals = landmarks.filter(l => l.type === 'hospital');

export default function BabyShowersPage() {
    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: 'Home', url: '/' },
                { name: 'Private Hire', url: '/private-hire' },
                { name: 'Baby Showers', url: '/private-hire/baby-showers' }
            ]} />

            <HeroWrapper
                route="/private-hire/baby-showers"
                variant="feature"
                title="Baby Showers"
                description="Welcoming new arrivals in style"

                tags={[
                    { label: "Afternoon Tea", variant: "success" },
                    { label: "Mocktails", variant: "default" },
                    { label: "Space for Games", variant: "default" },
                    { label: "Easy Parking", variant: "success" }
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
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10–200 guests</span>
                    </div>
                }
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <PageTitle className="text-center mb-6" as="h1" seo={{ structured: true, speakable: true }}>
                        Baby Shower Venue Near Ashford Hospital & Heathrow
                    </PageTitle>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-anchor-cream-text/70 mb-8">
                            Treat the mum-to-be to a relaxing afternoon of good food and laughter. Our bright and airy spaces are perfect for afternoon tea, games, and opening gifts.
                        </p>
                        {nearbyHospitals.length > 0 && (
                            <div className="bg-anchor-bg-raised p-4 rounded-xl inline-block text-center border border-anchor-gold/15">
                                <span className="font-bold text-anchor-gold-vivid mr-2">Ideally located near:</span>
                                {nearbyHospitals.map(l => (
                                    <Link key={l.slug} href={`/private-hire/near/${l.slug}`} className="hover:underline text-anchor-cream-text/70 font-medium">
                                        {l.name} ({l.distance})
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Afternoon Tea Package"
                        subtitle="Our most popular baby shower option"
                    />
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="card-dark rounded-none p-8 text-center">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">Afternoon Tea</h3>
                                <p className="text-anchor-cream-text/55 mb-4 italic">Catering packages available upon request</p>
                                <p className="text-anchor-cream-text/70 mb-4">Classic finger sandwiches, homemade scones with clotted cream, and a selection of delicate cakes — all served on tiered stands for that special touch.</p>
                                <ul className="text-sm text-anchor-cream-text/55 space-y-1">
                                    <li>+ Add Prosecco on arrival for those who are celebrating</li>
                                </ul>
                            </div>

                            <div className="card-dark rounded-none p-8 text-center">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">Light Lunch Buffet</h3>
                                <p className="text-anchor-cream-text/55 mb-4 italic">Catering packages available upon request</p>
                                <p className="text-anchor-cream-text/70 mb-4">A spread of wraps, quiches, fresh salads, and fruit platters. A lighter option that works well for a midday celebration.</p>
                            </div>
                        </div>

                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <h3 className="font-bold text-anchor-gold-vivid mb-3 text-center">Our Mocktail Highlights</h3>
                            <p className="text-anchor-cream-text/70 text-center mb-4">
                                The mum-to-be should never feel left out. Our bar team can prepare a selection of alcohol-free cocktails so everyone can raise a proper glass.
                            </p>
                            <ul className="grid sm:grid-cols-3 gap-3 text-center text-sm text-anchor-cream-text/70">
                                <li className="bg-anchor-bg p-3 rounded-lg">Virgin Mojito</li>
                                <li className="bg-anchor-bg p-3 rounded-lg">Sparkling Elderflower Fizz</li>
                                <li className="bg-anchor-bg p-3 rounded-lg">Strawberry Lemonade Spritz</li>
                            </ul>
                            <p className="text-center text-xs text-anchor-cream-text/50 mt-3">Ask us about seasonal mocktail options when you enquire.</p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Games & Activities"
                        subtitle="Make the afternoon one to remember"
                    />
                    <div className="max-w-3xl mx-auto">
                        <p className="text-anchor-cream-text/70 text-center mb-6">
                            We have plenty of space to accommodate all the baby shower classics. Bring your own game kits or improvise — our team will make sure you have room to set everything up.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-4">
                                <h4 className="font-semibold text-anchor-cream-text mb-2">Popular games we host</h4>
                                <ul className="text-sm text-anchor-cream-text/70 space-y-1">
                                    <li>Guess the baby weight</li>
                                    <li>Baby bingo</li>
                                    <li>Nappy-changing relay</li>
                                    <li>Guess the baby food flavour</li>
                                    <li>Baby photo quiz</li>
                                </ul>
                            </div>
                            <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-4">
                                <h4 className="font-semibold text-anchor-cream-text mb-2">Photo area and backdrop</h4>
                                <p className="text-sm text-anchor-cream-text/70">
                                    We can help you set up a dedicated photo area or backdrop in your reserved space. Bring your props, banners, and balloon arrangements — we'll give you room to create something special.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="All The Little Extras"
                    />
                    <FeatureGrid
                        columns={3}
                        features={[
                            {
                                icon: "",
                                title: "Mocktail Menu",
                                description: "Delicious alcohol-free cocktails so the mum-to-be doesn't feel left out.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Gift Area",
                                description: "We'll set up a dedicated table for gifts and party favours.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Gender Reveals",
                                description: "Planning a reveal alongside the shower? We can help coordinate the big surprise with balloons or cakes.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-anchor-cream-text mb-4">Planning a Christening or Gender Reveal Too?</h2>
                        <p className="text-anchor-cream-text/70 mb-6">
                            The Anchor hosts the full range of family celebrations. If you are also planning a christening reception or a gender reveal party, take a look at our dedicated pages.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/private-hire/christenings"
                                className="inline-block bg-anchor-bg-raised border border-anchor-gold/30 rounded-lg px-6 py-3 text-anchor-gold-vivid font-semibold hover:bg-anchor-gold/10 transition-colors"
                            >
                                Christening Venue
                            </Link>
                            <Link
                                href="/private-hire/gender-reveal"
                                className="inline-block bg-anchor-bg-raised border border-anchor-gold/30 rounded-lg px-6 py-3 text-anchor-gold-vivid font-semibold hover:bg-anchor-gold/10 transition-colors"
                            >
                                Gender Reveal Venue
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            <PrivateBookingSection eventType="Christening / Baby Shower" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can we play games at the baby shower?",
                        answer: "Yes! Baby bingo, 'guess the weight', and other shower games are very welcome. We have plenty of space and can move furniture to accommodate your setup."
                    },
                    {
                        question: "Can we decorate the area?",
                        answer: "Absolutely. Feel free to bring banners, balloons, sashes, and table decorations to make the space your own. We ask that you avoid loose confetti and glitter."
                    },
                    {
                        question: "Is there a time limit for the booking?",
                        answer: "Afternoon bookings typically have the space for 3–4 hours, which is plenty of time for tea, games, and opening gifts. We can discuss timing when you enquire."
                    },
                    {
                        question: "Do you have mocktails for the mum-to-be?",
                        answer: "Yes. Our bar team can prepare a selection of alcohol-free cocktails and mocktails so the guest of honour can join in the celebrations without feeling left out."
                    },
                    {
                        question: "Can we bring a cake?",
                        answer: "Yes, you are welcome to bring your own cake. We'll keep it safe in the kitchen until you are ready, and provide plates, a knife, and napkins."
                    },
                    {
                        question: "Is the venue suitable for a gender reveal during the shower?",
                        answer: "Yes. If you would like to incorporate a gender reveal moment into your baby shower, we can help with timing and logistics. Please discuss your plans with us when you book."
                    },
                    {
                        question: "Can we set up a photo area or backdrop?",
                        answer: "Absolutely. Bring your backdrops, balloon garlands, and props — we will make sure your reserved area has space for a dedicated photo spot."
                    },
                    {
                        question: "Is there a room hire fee?",
                        answer: "We generally do not charge a room hire fee for baby showers that include a catering package. A minimum spend on food and drink applies. Contact us for specific details based on your guest numbers."
                    }
                ]}
            />
        </>
    )
}
