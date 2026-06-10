import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BookTableButton } from '@/components/BookTableButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
    title: 'Pubs in Longford | Your Nearest Village Local',
    description: `Staying in Longford or Bath Road hotels? Escape to ${BRAND.name} for authentic British food and better prices. Just a short walk or taxi ride away.`,
    openGraph: {
        title: 'Pubs in Longford, The Anchor, Stanwell Moor',
        description: 'Escape the hotel prices! Authentic British pub food and drinks just minutes from Longford.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Longford, The Anchor, Stanwell Moor',
        description: 'Escape the hotel prices! Authentic British pub food and drinks just minutes from Longford.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/longford-pub'
    }
}

export default function LongfordPubPage() {
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["Restaurant", "BarOrPub"],
        "@id": "https://www.the-anchor.pub/longford-pub#business",
        "name": `${BRAND.name} - Near Longford`,
        "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": CONTACT.coordinates.lat,
            "longitude": CONTACT.coordinates.lng
        },
        "areaServed": [
            {
                "@type": "City",
                "name": "Longford"
            },
            {
                "@type": "Place",
                "name": "Heathrow Bath Road"
            }
        ],
        "priceRange": "££",
        "servesCuisine": ["British", "Traditional English", "Fish and Chips", "Burger"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/longford-pub"
    }

    const directionsSchema = generateHowToDirectionsSchema(
        'Longford',
        'The Anchor - Heathrow Pub & Dining',
        [
            'From Longford village, head towards the A3044',
            'Follow signs for Stanwell Moor',
            'Enter the village on Horton Road',
            'The Anchor is on your right'
        ]
    )

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
            />

            <HeroWrapper
                route="/longford-pub"
                title="Authentic British Pub Near Longford"
                description="Escape the hotel strip for real food, draught beer, and real prices"
                variant="default"
                primaryCta={
                    <BookTableButton source="longford_pub_hero" context="local_pub" variant="primary" size="lg">
                        Book a Table
                    </BookTableButton>
                }
                enableSmartCtas={true}
                showContextStrip={true}
            />

            <section className="section-spacing-sm bg-anchor-green-deep">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle
                            seo={{
                                structured: true,
                                speakable: true
                            }}
                            className="text-anchor-cream-text mb-4"
                        >
                            Pubs in Longford, Minutes from Hotels & Bath Road
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Don't settle for overpriced hotel food. The Anchor is your nearest traditional village pub, offering a genuine British experience just a stone's throw from Longford.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Why Travellers Choose The Anchor"
                            subtitle="We're the favourite choice for guests at the Thistle, Premier Inn, and other Longford hotels."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Better Value",
                                    description: "Significantly cheaper than hotel restaurants for better quality food",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Real Atmosphere",
                                    description: "Experience a proper British pub with locals, not a sterile hotel bar",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Beer Garden",
                                    description: "Relax outside with a drink - perfect for summer evenings",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}
                            className="mb-8"
                        />
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-card border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Getting Here is Easy"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6">
                                <h3 className="text-xl font-bold mb-4">Walking</h3>
                                <p className="text-anchor-cream-text/70">
                                    For energetic travellers, it's a walk from some parts of Longford. However, we recommend a taxi if you are unsure of the route or it's dark.
                                </p>
                            </div>
                            <div className="bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none p-6">
                                <h3 className="text-xl font-bold mb-4">Taxi / Uber</h3>
                                <p className="text-anchor-cream-text/70">
                                    A very short and cheap ride. Ask your hotel reception to book one for "The Anchor in Stanwell Moor" (Postcode TW19 6AQ).
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <DirectionsButton
                                href="https://maps.google.com/maps?saddr=Longford+Heathrow&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                                source="longford_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Longford"
                            >
                                Get Directions from Longford
                            </DirectionsButton>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Local Knowledge Section */}
            <section className="section-spacing bg-anchor-green-deep border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Longford Neighbours, You Know the Planes, Now Enjoy Them with a Pint"
                        />
                        <div className="prose prose-invert max-w-none space-y-4 text-anchor-cream-text/80">
                            <p>
                                If you live in Longford, you don&rsquo;t need anyone to explain the Heathrow flight path to you, it&rsquo;s the soundtrack to your life. We&rsquo;re on the same flight path over here in Stanwell Moor, so we understand completely. The difference is, we&rsquo;ve turned it into a feature. Our beer garden is one of the best plane-spotting spots in the area, and there&rsquo;s something oddly relaxing about watching an A380 glide overhead while you nurse a cold pint.
                            </p>
                            <p>
                                Getting here from Longford takes about five minutes. The simplest route is along the Colnbrook bypass, pick up the A3044 heading south and turn onto Horton Road into Stanwell Moor. If you&rsquo;re coming from the Bath Road end near the hotels, it&rsquo;s barely any further. You can also walk along the Longford River path if you fancy stretching your legs, it&rsquo;s a pleasant stroll through proper countryside, and you end up practically on our doorstep.
                            </p>
                            <p>
                                Longford&rsquo;s lost a lot of its village character over the years with all the hotel development along Bath Road, and Colnbrook High Street isn&rsquo;t what it was either. That&rsquo;s why a few Longford and Colnbrook residents have adopted The Anchor as their regular. We&rsquo;re a proper village pub with real character, not a hotel bar, not a chain, just an honest local where you can get a decent meal, a well-kept pint, and a genuine welcome.
                            </p>
                            <p>
                                Whether you&rsquo;re a Longford resident looking for a local with some life to it, a hotel worker finishing a shift, or a traveller who&rsquo;s had enough of overpriced airport grub, we&rsquo;re right next door. Come and see what a real pub looks like.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-2xl mx-auto text-center">
                        <SectionHeader
                            title="Opening Hours"
                        />
                        <BusinessHours />
                        <p className="mt-4 text-anchor-cream-text/70">
                            Kitchen closes earlier - check times for food service
                        </p>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How far is The Anchor from Longford hotels?",
                        answer: "We are very close, typically a 5-minute drive. We are the neighbouring village to Longford."
                    },
                    {
                        question: "Is the food better than the hotel?",
                        answer: "We certainly think so! Everything is cooked fresh, and we offer pub classics like Fish & Chips, Burgers, and Pies at honest prices."
                    },
                    {
                        question: "Do you have WiFi?",
                        answer: "Yes, free WiFi is available throughout the pub, so you can check emails or your flight status."
                    },
                    {
                        question: "Can I bring my luggage?",
                        answer: "Yes, if you're stopping by on your way to/from the airport, we can find a safe spot for your bags while you eat."
                    }
                ]}
                className="bg-anchor-green-card"
            />

            <CTASection
                title="Escape the Hotel Bubble"
                description="Real food, draught beer, right next door."
                buttons={[
                    {
                        text: "Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "longford_pub_cta",
                        variant: "white"
                    },
                    {
                        text: "Book an Event",
                        href: "/private-hire#enquiry",
                        variant: "white"
                    },
                    {
                        text: "View Menu",
                        href: "/food-menu",
                        variant: "white"
                    }
                ]}
                variant="green"
                footer="Free WiFi • Luggage Friendly • Authentic Pub"
            />
        </>
    )
}
