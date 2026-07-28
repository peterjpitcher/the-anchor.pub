import Link from 'next/link'
import { Metadata } from 'next'
import { InteriorHero } from '@/components/hero'
import { Container, SectionHeading, Card, CardBody, Badge } from '@/components/ui'
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
import { CateringPackagesCard } from '@/app/private-hire/_components/CateringPackagesCard'
import { TestimonialSection } from '@/components/TestimonialSection'

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

export default function BabyShowersPage() {
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
            { "@type": "LocationFeatureSpecification", "name": "Step-free access to most areas", "value": true },
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

            <InteriorHero
                image="/images/page-headers/private-hire/private-hire.jpg"
                crumb="Baby Showers"
                title="Baby Showers"
                lead="Welcoming new arrivals in style"
                badges={
                    <>
                        <Badge variant="sand">Afternoon Tea</Badge>
                        <Badge variant="sand">Mocktails</Badge>
                        <Badge variant="sand">Space for Games</Badge>
                        <Badge variant="sand">Easy Parking</Badge>
                    </>
                }
                actions={
                    <>
                        <BookTableButton
                            source="baby_shower_hero"
                            variant="primary"
                            size="lg"
                            context="baby_shower"
                            fullWidth
                        >
                            Enquire Now
                        </BookTableButton>
                        <PhoneButton
                            phone="01753 682707"
                            source="baby_shower_hero"
                            variant="outline"
                            size="lg"
                        >
                            Call 01753 682707
                        </PhoneButton>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container>
                    <PageTitle className="text-center mb-6" as="h2" seo={{ structured: true, speakable: true }}>
                        Baby Shower Venue Near Ashford Hospital & Heathrow
                    </PageTitle>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-ink-muted mb-8">
                            Treat the mum-to-be to a relaxing afternoon of good food and laughter. Our bright and airy spaces are perfect for afternoon tea, games, and opening gifts.
                        </p>
                        {nearbyHospitals.length > 0 && (
                            <div className="inline-block rounded-md border border-line bg-surface p-4 text-center shadow-sm">
                                <span className="mr-2 font-semibold text-accent-text">Ideally located near:</span>
                                {nearbyHospitals.map(l => (
                                    <Link key={l.slug} href={`/private-hire/near/${l.slug}`} className="font-medium text-ink-muted hover:underline">
                                        {l.name} ({l.distance})
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Food & Drink"
                        lead="Our most popular baby shower options"
                    />
                    <div className="max-w-4xl mx-auto">
                        <p className="text-ink-muted text-center mb-6">
                            From classic afternoon tea to relaxed buffets, we have a range of catering packages to suit your baby shower. Our bar team can also prepare a selection of alcohol-free cocktails so the mum-to-be never feels left out.
                        </p>
                        <p className="text-ink-muted text-center text-sm">
                            See our full catering packages and pricing below, or ask us about seasonal mocktail options when you enquire.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="Games & Activities"
                        lead="Make the afternoon one to remember"
                    />
                    <div className="max-w-3xl mx-auto">
                        <p className="text-ink-muted text-center mb-6">
                            We have plenty of space to accommodate all the baby shower classics. Bring your own game kits or improvise, our team will make sure you have room to set everything up.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Card><CardBody>
                                <h4 className="font-display text-h4 text-ink-strong mb-2">Popular games we host</h4>
                                <ul className="text-sm text-ink-muted space-y-1">
                                    <li>Guess the baby weight</li>
                                    <li>Baby bingo</li>
                                    <li>Nappy-changing relay</li>
                                    <li>Guess the baby food flavour</li>
                                    <li>Baby photo quiz</li>
                                </ul>
                            </CardBody></Card>
                            <Card><CardBody>
                                <h4 className="font-display text-h4 text-ink-strong mb-2">Photo area and backdrop</h4>
                                <p className="text-sm text-ink-muted">
                                    We can help you set up a dedicated photo area or backdrop in your reserved space. Bring your props, banners, and balloon arrangements, we'll give you room to create something special.
                                </p>
                            </CardBody></Card>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="All The Little Extras"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: "Mocktail Menu", description: "Delicious alcohol-free cocktails so the mum-to-be doesn't feel left out." },
                            { title: "Gift Area", description: "We'll set up a dedicated table for gifts and party favours." },
                            { title: "Gender Reveals", description: "Planning a reveal alongside the shower? We can help coordinate the big surprise with balloons or cakes." },
                        ].map(feature => (
                            <Card key={feature.title} accent className="h-full text-center">
                                <CardBody className="flex h-full flex-col gap-2">
                                    <h3 className="font-display text-h4 text-ink-strong">{feature.title}</h3>
                                    <p className="text-ink-muted">{feature.description}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="Baby Shower Catering Packages"
                        lead="Treat the mum-to-be to something special"
                    />
                    <div className="max-w-2xl mx-auto space-y-8">
                        <CateringPackagesCard />

                        <Card><CardBody className="text-center">
                            <p className="text-ink-muted text-sm">
                                All baby shower packages include use of a reserved area, dedicated staff, and free parking. Room hire applies and varies by day and group size, with pricing discussed on enquiry. Call us on <strong className="text-accent-text">01753 682707</strong> for a bespoke quote based on your guest numbers and preferences.
                            </p>
                        </CardBody></Card>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Decorations & Styling"
                        lead="Make the space your own"
                    />
                    <div className="max-w-3xl mx-auto mb-8 space-y-4 text-ink-muted">
                        <p>
                            Whether you are going for an Instagram-worthy baby shower venue or something more understated, we provide a blank canvas for you to decorate as you wish. Our reserved area has plenty of wall space for banners and backdrops, and we can arrange tables to create a dedicated gift area, game zone, and photo corner.
                        </p>
                        <p>
                            Many of our baby shower guests bring balloon arches, flower arrangements, custom tablecloths, and themed tableware. You are welcome to arrive up to an hour early on the day to set everything up at your leisure. Our team will be on hand to help carry things in, rearrange furniture, and make sure the space looks exactly how you imagined it.
                        </p>
                        <p>
                            We only ask that you avoid loose confetti and glitter, which can be very difficult to remove from our upholstery. Biodegradable confetti, paper pom-poms, and fabric bunting are all great alternatives that look just as lovely in photos.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { title: "Balloon Arches", description: "Plenty of space for freestanding balloon arches, garlands, and helium arrangements." },
                            { title: "Photo Backdrops", description: "Set up a dedicated photo area with your own backdrop, props, and lighting." },
                            { title: "Gift Table", description: "We will set up a dedicated table for gifts, nappy cakes, and party favours." },
                            { title: "Themed Tableware", description: "Bring your own tablecloths, plates, and napkins to match your colour scheme." },
                        ].map(feature => (
                            <Card key={feature.title} accent className="h-full text-center">
                                <CardBody className="flex h-full flex-col gap-2">
                                    <h3 className="font-display text-h4 text-ink-strong">{feature.title}</h3>
                                    <p className="text-ink-muted">{feature.description}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            <TestimonialSection
                variant="compact"
                className="py-section-y bg-surface-sunk px-4"
                reviews={[
                    { quote: "We hosted my sister's baby shower here and it was absolutely perfect. The afternoon tea was delicious, the mocktails were a lovely touch, and the staff helped us set up all the decorations beforehand. Such a relaxed and happy afternoon.", author: "Emma, Staines", source: "Google Review", rating: 5 },
                    { quote: "The baby shower venue was ideal, the private space meant we could play games and open gifts without feeling self-conscious. Free parking was a huge bonus with all the presents and decorations we had to carry in. Highly recommend.", author: "Jasmine, Ashford", source: "Google Review", rating: 5 },
                ]}
            />

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-display text-h3 text-ink-strong mb-4">Planning a Christening or Gender Reveal Too?</h2>
                        <p className="text-ink-muted mb-6">
                            The Anchor hosts the full range of family celebrations. If you are also planning a christening reception or a gender reveal party, take a look at our dedicated pages.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/private-hire/christenings"
                                className="inline-block rounded-md border border-line bg-surface px-6 py-3 font-semibold text-accent-text transition-colors hover:border-accent"
                            >
                                Christening Venue
                            </Link>
                            <Link
                                href="/private-hire/gender-reveal"
                                className="inline-block rounded-md border border-line bg-surface px-6 py-3 font-semibold text-accent-text transition-colors hover:border-accent"
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
                        answer: "Yes, a room hire fee applies for baby showers. The fee varies depending on the day, time, and group size. There is pricing discussed on enquiry. Contact us for specific details based on your guest numbers."
                    }
                ]}
            />
        </>
    )
}
