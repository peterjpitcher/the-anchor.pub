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
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getCateringData } from '@/lib/api/catering-packages'
import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'

export const metadata: Metadata = {
    title: 'Baby Shower Venue Near Ashford Hospital',
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

export default async function BabyShowersPage() {
    const { foodPackages } = await getCateringData()
    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/baby-showers#venue",
        "name": `${BRAND.name} Baby Shower Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/baby-showers",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "Bright and airy venue for baby showers with afternoon tea packages, mocktails, and private spaces near Ashford Hospital.",
        "maximumAttendeeCapacity": 50,
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Afternoon Tea Packages", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Mocktail Menu", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Space for Games", "value": true }
        ],
        "potentialAction": {
            "@type": "CommunicateAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
                "actionPlatform": [
                    "https://schema.org/DesktopWebPlatform",
                    "https://schema.org/MobileWebPlatform"
                ]
            }
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(eventVenueSchema) }}
            />

            <HeroWrapper
                showContextStrip={true}
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
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10-50 room bookings</span>
                    </div>
                }
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <PageTitle className="text-center mb-6" as="h2" seo={{ structured: true, speakable: true }}>
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
                        title="Food & Drink"
                        subtitle="Our most popular baby shower options"
                    />
                    <div className="max-w-4xl mx-auto">
                        <p className="text-anchor-cream-text/70 text-center mb-6">
                            From classic afternoon tea to relaxed buffets, we have a range of catering packages to suit your baby shower. Our bar team can also prepare a selection of alcohol-free cocktails so the mum-to-be never feels left out.
                        </p>
                        <p className="text-anchor-cream-text/70 text-center text-sm">
                            See our full catering packages and pricing below, or ask us about seasonal mocktail options when you enquire.
                        </p>
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
                            We have plenty of space to accommodate all the baby shower classics. Bring your own game kits or improvise, our team will make sure you have room to set everything up.
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
                                    We can help you set up a dedicated photo area or backdrop in your reserved space. Bring your props, banners, and balloon arrangements, we'll give you room to create something special.
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
                    <SectionHeader
                        title="Baby Shower Catering Packages"
                        subtitle="Treat the mum-to-be to something special"
                    />
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6 mb-8">
                            <CateringPackagesTable
                                packages={foodPackages}
                                showDescription={true}
                                filterNames={['Afternoon Tea', 'Prosecco Afternoon Tea', 'Finger Buffet', 'Sandwich Buffet']}
                            />
                        </div>

                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6 text-center">
                            <p className="text-anchor-cream-text/70 text-sm">
                                All baby shower packages include use of a reserved area, dedicated staff, and free parking. Room hire applies and varies by day and group size, with no minimum spend required. Call us on <strong className="text-anchor-gold-vivid">01753 682707</strong> for a bespoke quote based on your guest numbers and preferences.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Decorations & Styling"
                        subtitle="Make the space your own"
                    />
                    <div className="prose prose-invert max-w-3xl mx-auto mb-8">
                        <p className="text-anchor-cream-text/70 mb-4">
                            Whether you are going for an Instagram-worthy baby shower venue or something more understated, we provide a blank canvas for you to decorate as you wish. Our reserved area has plenty of wall space for banners and backdrops, and we can arrange tables to create a dedicated gift area, game zone, and photo corner.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            Many of our baby shower guests bring balloon arches, flower arrangements, custom tablecloths, and themed tableware. You are welcome to arrive up to an hour early on the day to set everything up at your leisure. Our team will be on hand to help carry things in, rearrange furniture, and make sure the space looks exactly how you imagined it.
                        </p>
                        <p className="text-anchor-cream-text/70">
                            We only ask that you avoid loose confetti and glitter, which can be very difficult to remove from our upholstery. Biodegradable confetti, paper pom-poms, and fabric bunting are all great alternatives that look just as lovely in photos.
                        </p>
                    </div>
                    <FeatureGrid
                        columns={4}
                        features={[
                            {
                                icon: "",
                                title: "Balloon Arches",
                                description: "Plenty of space for freestanding balloon arches, garlands, and helium arrangements.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Photo Backdrops",
                                description: "Set up a dedicated photo area with your own backdrop, props, and lighting.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Gift Table",
                                description: "We will set up a dedicated table for gifts, nappy cakes, and party favours.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Themed Tableware",
                                description: "Bring your own tablecloths, plates, and napkins to match your colour scheme.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="What Our Guests Say"
                        subtitle="From recent baby showers at The Anchor"
                    />
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;We hosted my sister&apos;s baby shower here and it was absolutely perfect. The afternoon tea was delicious, the mocktails were a lovely touch, and the staff helped us set up all the decorations beforehand. Such a relaxed and happy afternoon.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">Emma, Staines</p>
                        </div>
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;The baby shower venue was ideal, the private space meant we could play games and open gifts without feeling self-conscious. Free parking was a huge bonus with all the presents and decorations we had to carry in. Highly recommend.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">Jasmine, Ashford</p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
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
                        answer: "Absolutely. Bring your backdrops, balloon garlands, and props, we will make sure your reserved area has space for a dedicated photo spot."
                    },
                    {
                        question: "Is there a room hire fee?",
                        answer: "Yes, a room hire fee applies for baby showers. The fee varies depending on the day, time, and group size. There is no minimum spend required. Contact us for specific details based on your guest numbers."
                    }
                ]}
            />
        </>
    )
}
