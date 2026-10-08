import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { Metadata } from 'next'
import { CONTACT, BRAND, PRICE_RANGE, DIRECTIONS_URL } from '@/lib/constants'
import { DOGS_WORDING, PARKING_WORDING } from '@/lib/approved-wording'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Pubs in Horton | Your Closest Village Pub',
    description: `Looking for pubs in Horton? ${BRAND.name} in Stanwell Moor is a short drive away. Free parking, Sunday roasts, draught beers, and a warm village welcome.`,
    openGraph: {
        title: 'Pubs in Horton | The Anchor Stanwell Moor',
        description: 'Your local village pub, just a short drive from Horton. Authentic British food, draught beers, and a warm welcome.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Horton | The Anchor Stanwell Moor',
        description: 'Your local village pub, just a short drive from Horton. Authentic British food, draught beers, and a warm welcome.',
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
        "name": BRAND.name,
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
        "priceRange": PRICE_RANGE,
        "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/horton-pub"
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
            />

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Horton"
        title="Your Local Village Pub Near Horton"
        lead="Just a short drive from Horton village"
        actions={
          <BookTableButton source="horton_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <PageTitle
                            seo={{
                                structured: true,
                                speakable: true
                            }}
                            className="mb-4"
                        >
                            Pubs in Horton, Traditional British Pub a Short Drive Away
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            The Anchor in Stanwell Moor is practically in Horton! We are your closest traditional pub with food, offering a warm welcome to our neighbours.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading
                            title="A Proper Village Pub for Horton Residents"
                            lead="Whether you're popping over for a pint or driving over for Sunday roast, we are Horton's local choice for great food and entertainment."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { title: "Close By", description: "A short drive from Horton village" },
                                { title: "Sunday Roasts", description: "Famous Sunday roasts, worth the short hop over the motorway" },
                                { title: "Draught Beers", description: "Properly kept ales and a great wine selection" },
                            ].map((item) => (
                                <Card key={item.title} accent>
                                    <CardBody className="p-6 text-center">
                                        <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                                        <p className="text-sm text-ink-muted">{item.description}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Why Horton Locals Choose The Anchor"
                        />

                        <div className="grid md:grid-cols-2 gap-5 mb-8">
                            <Card accent>
                                <CardBody className="p-6">
                                    <h3 className="font-display text-h4 text-ink-strong mb-4">Community Connections</h3>
                                    <ul className="space-y-2 text-ink-muted">
                                        <li>• Many Horton residents are already regulars</li>
                                        <li>• We support local events and charities</li>
                                        <li>• A true village atmosphere, just like home</li>
                                        <li>• Dog friendly, on a lead</li>
                                    </ul>
                                </CardBody>
                            </Card>

                            <Card accent>
                                <CardBody className="p-6">
                                    <h3 className="font-display text-h4 text-ink-strong mb-4">Entertainment Nearby</h3>
                                    <ul className="space-y-2 text-ink-muted">
                                        <li>• Monthly Quiz Nights (Short taxi ride home!)</li>
                                        <li>• Music Bingo with Nikki Manfadge (<Link href="/whats-on" className="underline">see what&apos;s on</Link>)</li>
                                        <li>• Cash Bingo Nights</li>
                                        <li>• Free-to-air sport on our 4 TVs</li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </div>

                        <div className="text-center">
                            <p className="text-lg text-ink-muted mb-6">
                                Looking for a change of scenery without the travel? We're right on your doorstep.
                            </p>
                            <p className="text-ink-muted mb-6">
                                Find us at {CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}.
                            </p>
                            <DirectionsButton
                                href={DIRECTIONS_URL}
                                source="horton_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Horton"
                                wrap
                            >
                                Get Directions
                            </DirectionsButton>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Local Knowledge Section */}
            <section className="py-section-y bg-surface">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            title="Next Village Over, Practically Your Local"
                        />
                        <div className="prose max-w-none space-y-4 text-ink-muted">
                            <p>
                                Horton and Stanwell Moor are connected by the same road, Horton Road. If you live in Horton, The Anchor is genuinely your closest pub, and it&rsquo;s a short drive.
                            </p>
                            <p>
                                Horton is a quiet, beautiful village, but it doesn&rsquo;t have its own pub any more. That makes us your de facto local, and we take that seriously. We know a lot of Horton residents by name, they&rsquo;re some of our most loyal regulars. Whether it&rsquo;s a midweek pint after work, a family Sunday roast, or a big birthday celebration, Horton folk treat The Anchor like their own, and we love that.
                            </p>
                            <p>
                                {DOGS_WORDING} Muddy boots are welcome too, we&rsquo;re a country pub, not a wine bar. And because we&rsquo;re so close, you can pop in for a quick one without it turning into a whole evening out (unless you want it to, of course).
                            </p>
                            <p>
                                The short distance means quiz nights, Music Bingo, and our other events are all on your doorstep. A few Horton teams are regulars at the monthly quiz, the taxi home is a short ride, which makes it very easy to say yes to &ldquo;one more round.&rdquo;
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="mx-auto text-center">
                        <SectionHeading
                            title="Opening Hours"
                        />
                        <BusinessHours/>
                        <p className="mt-4 text-ink-muted">
                            Kitchen closes earlier - check times for food service
                        </p>
                    </div>
                </Container>
            </section>

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How close is The Anchor to Horton?",
                        answer: `We are very close. It is just a short drive along Horton Road. Our address is ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}.`
                    },
                    {
                        question: "Is The Anchor dog friendly?",
                        answer: DOGS_WORDING
                    },
                    {
                        question: "Do you serve Sunday Roast?",
                        answer: "Yes, our Sunday Roasts are famous in the area. We serve them on Sundays from 1pm to 6pm, and walk-ins are welcome with no pre-order needed. Booking is still worth it at peak times or for a bigger group, and groups of more than 20 need to book by phone on 01753 682707."
                    },
                    {
                        question: "Is there parking?",
                        answer: PARKING_WORDING
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Your Neighbouring Village Pub"
                copy="Great food, cold drinks, and good company - just a short drive away."
            >
                <Button asChild variant="primary" size="lg">
                    <Link href={CONTACT.phoneHref}>Book a Table</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/private-hire#enquiry">Book an Event</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/food-menu">View Menu</Link>
                </Button>
            </CtaBand>
        </>
    )
}
