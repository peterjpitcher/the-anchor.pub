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
    title: 'Pubs in Horton | Your Closest Village Pub',
    description: `Looking for pubs in Horton? ${BRAND.name} in Stanwell Moor is just 2 mins away. Free parking, Sunday roasts, draught beers, and a warm village welcome.`,
    openGraph: {
        title: 'Pubs in Horton | The Anchor Stanwell Moor',
        description: 'Your local village pub, just a 2-minute drive from Horton. Authentic British food, draught beers, and a warm welcome.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Horton | The Anchor Stanwell Moor',
        description: 'Your local village pub, just a 2-minute drive from Horton. Authentic British food, draught beers, and a warm welcome.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/horton-pub'
    }
}

export default function HortonPubPage() {
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["Restaurant", "BarOrPub"],
        "@id": "https://www.the-anchor.pub/horton-pub#business",
        "name": `${BRAND.name} - Near Horton`,
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
                "name": "Horton"
            },
            {
                "@type": "City",
                "name": "Stanwell Moor"
            }
        ],
        "priceRange": "££",
        "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/horton-pub"
    }

    const directionsSchema = generateHowToDirectionsSchema(
        'Horton',
        'The Anchor - Heathrow Pub & Dining',
        [
            'Head east on Horton Road',
            'Continue straight for approximately 1 mile',
            'Cross the M25 bridge',
            'The Anchor will be on your left in Stanwell Moor village',
            'Park for free in our large car park'
        ]
    )

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
            />

            <HeroWrapper
                route="/horton-pub"
                title="Your Local Village Pub Near Horton"
                description="Just a 2-minute drive or short walk from Horton village"
                variant="default"
                primaryCta={
                    <BookTableButton source="horton_pub_hero" context="local_pub" variant="primary" size="lg">
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
                            Pubs in Horton, Traditional British Pub Just 1 Mile Away
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            The Anchor in Stanwell Moor is practically in Horton! We are your closest traditional pub with food, offering a warm welcome to our neighbours.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="A Proper Village Pub for Horton Residents"
                            subtitle="Whether you're walking over for a pint or driving over for Sunday roast, we are Horton's local choice for great food and entertainment."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Walking Distance",
                                    description: "A pleasant 20-minute walk or 2-minute drive from Horton village",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Sunday Roasts",
                                    description: "The best roast in the area - worth the short hop over the motorway",
                                    variant: "colored",
                                    color: "bg-anchor-green-card",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Draught Beers",
                                    description: "Properly kept ales and a great wine selection",
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
                            title="Why Horton Locals Choose The Anchor"
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="card-dark rounded-none p-6">
                                <h3 className="text-xl font-bold text-anchor-cream-text mb-4">Community Connections</h3>
                                <ul className="space-y-2 text-anchor-cream-text/70">
                                    <li>• Many Horton residents are already regulars</li>
                                    <li>• We support local events and charities</li>
                                    <li>• A true village atmosphere, just like home</li>
                                    <li>• Dog friendly - perfect for walkers</li>
                                </ul>
                            </div>

                            <div className="card-dark rounded-none p-6">
                                <h3 className="text-xl font-bold text-anchor-cream-text mb-4">Entertainment Nearby</h3>
                                <ul className="space-y-2 text-anchor-cream-text/70">
                                    <li>• Monthly Quiz Nights (Short taxi ride home!)</li>
                                    <li>• Music Bingo with Nikki Manfadge & live music (see /whats-on)</li>
                                    <li>• Cash Bingo Nights</li>
                                    <li>• Sky & TNT Sports on big screens</li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-lg text-anchor-cream-text/70 mb-6">
                                Looking for a change of scenery without the travel? We're right on your doorstep.
                            </p>
                            <DirectionsButton
                                href="https://maps.google.com/maps?saddr=Horton+Berkshire&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                                source="horton_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Horton"
                            >
                                Get Directions from Horton (2 mins)
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
                            title="Next Village Over, Practically Your Local"
                        />
                        <div className="prose prose-invert max-w-none space-y-4 text-anchor-cream-text/80">
                            <p>
                                Horton and Stanwell Moor are connected by the same road, Horton Road, and we&rsquo;re barely a mile apart. If you live in Horton, The Anchor is genuinely your closest pub. Head east out of the village, cross over the M25 bridge, and we&rsquo;re right there on your left. Two minutes in the car. On a nice evening, it&rsquo;s a pleasant twenty-minute walk along the pavement, and some of our Horton regulars do exactly that when the weather&rsquo;s good.
                            </p>
                            <p>
                                Horton is a quiet, beautiful village, but it doesn&rsquo;t have its own pub any more. That makes us your de facto local, and we take that seriously. We know a lot of Horton residents by name, they&rsquo;re some of our most loyal regulars. Whether it&rsquo;s a midweek pint after work, a family Sunday roast, or a big birthday celebration, Horton folk treat The Anchor like their own, and we love that.
                            </p>
                            <p>
                                If you walk the Horton Country Park trails or the footpaths around the Berkshire countryside, we&rsquo;re the natural place to finish up. Muddy boots and muddy dogs are both welcome, we&rsquo;re a country pub, not a wine bar. And because we&rsquo;re so close, you can pop in for a quick one without it turning into a whole evening out (unless you want it to, of course).
                            </p>
                            <p>
                                The short distance means quiz nights, Music Bingo, and our other events are all on your doorstep. A few Horton teams are regulars at the monthly quiz, the taxi home is barely a fiver, which makes it very easy to say yes to &ldquo;one more round.&rdquo;
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
                        question: "How close is The Anchor to Horton?",
                        answer: "We are extremely close! It is just a 2-minute drive (approx. 1 mile) along Horton Road. Many locals also enjoy the walk between the villages in good weather."
                    },
                    {
                        question: "Is The Anchor dog friendly?",
                        answer: "Yes, we are very dog friendly! We love welcoming dogs from Horton, whether you've driven over or enjoyed a dog walk to get here. Water bowls and biscuits are usually available."
                    },
                    {
                        question: "Do you serve Sunday Roast?",
                        answer: "Yes, our Sunday Roasts are famous in the area. We serve them every Sunday from 1pm. Booking is highly recommended as we often fill up with locals from Stanwell Moor and Horton."
                    },
                    {
                        question: "Is there parking?",
                        answer: "Yes, we have a large free car park with 20 spaces, making it very easy to pop over from Horton for dinner without worrying about parking."
                    }
                ]}
                className="bg-anchor-green-card"
            />

            <CTASection
                title="Your Neighbouring Village Pub"
                description="Great food, cold drinks, and good company - just 1 mile away."
                buttons={[
                    {
                        text: "Book a Table",
                        href: `${CONTACT.phoneHref}`,
                        isPhone: true,
                        phoneSource: "horton_pub_cta",
                        variant: "secondary"
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
                footer="Free Parking • Dog Friendly • 2 Minutes from Horton"
            />
        </>
    )
}
