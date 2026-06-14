import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
    title: 'Pubs in Wraysbury | Dining & Free Parking',
    description: `${BRAND.name} is a top-rated pub just 5 mins from Wraysbury. Famous Sunday Roasts, stone-baked pizzas, and live entertainment. Free parking & family friendly.`,
    openGraph: {
        title: 'Pubs in Wraysbury | Dining, Entertainment & Free Parking | The Anchor',
        description: 'Looking for a change from the local? We are just 5 minutes from Wraysbury with great food and entertainment.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Pubs in Wraysbury | Dining, Entertainment & Free Parking | The Anchor',
        description: 'Looking for a change from the local? We are just 5 minutes from Wraysbury with great food and entertainment.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/wraysbury-pub'
    }
}

export default function WraysburyPubPage() {
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": ["Restaurant", "BarOrPub"],
        "@id": "https://www.the-anchor.pub/wraysbury-pub#business",
        "name": `${BRAND.name} - Near Wraysbury`,
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
                "name": "Wraysbury"
            },
            {
                "@type": "City",
                "name": "Horton"
            }
        ],
        "priceRange": "££",
        "servesCuisine": ["British", "Traditional English", "Sunday Roast", "Pizza"],
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/wraysbury-pub"
    }

    const directionsSchema = generateHowToDirectionsSchema(
        'Wraysbury',
        'The Anchor - Heathrow Pub & Dining',
        [
            'From Wraysbury, head towards Horton',
            'Continue on Horton Road past the village',
            'Cross the M25 bridge into Stanwell Moor',
            'The Anchor is on your left with a large free car park'
        ]
    )

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Pub Near Wraysbury', url: '/wraysbury-pub' }
                ]}
            />

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Wraysbury"
        title="The Perfect Alternative to Your Wraysbury Local"
        lead="Just a short 5-minute drive from Wraysbury Village"
        actions={
          <BookTableButton source="wraysbury_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle
                            seo={{
                                structured: true,
                                speakable: true
                            }}
                            className="mb-4"
                        >
                            Wraysbury Pub & Dining - Worth the Short Drive
                        </PageTitle>
                        <p className="text-lg text-ink-muted">
                            Love Wraysbury living but fancy a change of scenery? The Anchor offers a vibrant atmosphere, unique entertainment, and fantastic food just minutes away.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeading
                            title="Why Wraysbury Residents Visit The Anchor"
                            lead="We're a popular choice for Wraysbury locals looking for great value and something different."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { title: "Stone-Baked Pizza", description: "Authentic stone-baked pizzas served Tuesday-Saturday from the live menu" },
                                { title: "Live Entertainment", description: "Music Bingo with Nikki Manfadge, quiz nights, and bingo - lively events you won't find everywhere (see /whats-on)" },
                                { title: "Sunday Roast", description: "A proper home-cooked roast with all the trimmings" },
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
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Events & Private Hire near Wraysbury"
                        />

                        <div className="grid md:grid-cols-2 gap-5 mb-8">
                            <Card accent>
                                <CardBody className="p-6">
                                    <h3 className="font-display text-h4 text-ink-strong mb-4">Celebrations</h3>
                                    <p className="text-ink-muted mb-4">
                                        Planning a party? We frequently host birthdays and celebrations for Wraysbury residents. Our private hire options are flexible and affordable.
                                    </p>
                                    <Link href="/private-hire" className="text-accent-text font-bold hover:underline">
                                        View Private Hire Options →
                                    </Link>
                                </CardBody>
                            </Card>

                            <Card accent>
                                <CardBody className="p-6">
                                    <h3 className="font-display text-h4 text-ink-strong mb-4">What's On</h3>
                                    <p className="text-ink-muted mb-4">
                                        Join us for Music Bingo hosted by Nikki Manfadge or test your knowledge at our quiz nights. See /whats-on for the latest listings.
                                    </p>
                                    <Link href="/whats-on" className="text-accent-text font-bold hover:underline">
                                        Check Event Calendar →
                                    </Link>
                                </CardBody>
                            </Card>
                        </div>

                        <div className="text-center">
                            <DirectionsButton
                                href="https://maps.google.com/maps?saddr=Wraysbury&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                                source="wraysbury_directions"
                                variant="primary"
                                size="lg"
                                fromLocation="Wraysbury"
                            >
                                Get Directions from Wraysbury (5 mins)
                            </DirectionsButton>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Local Knowledge Section */}
            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading
                            title="Your Local Beyond the Village"
                        />
                        <div className="prose max-w-none space-y-4 text-ink-muted">
                            <p>
                                Wraysbury is a lovely village, but let&rsquo;s be honest, pubs in Wraysbury are limited. When you fancy a change of scene without a major expedition, The Anchor is right there. Head along the B376 through Hythe End, past the sailing club, and keep going on Horton Road. You&rsquo;ll cross the M25 bridge and we&rsquo;re immediately on your left. Five minutes, tops. If you&rsquo;re coming from the other end of the village near the station, you can also cut across via the M25 at Junction 13, it&rsquo;s just as quick.
                            </p>
                            <p>
                                We think of ourselves as Wraysbury&rsquo;s second local. Plenty of your neighbours are already regulars here, some walk over on sunny evenings along Horton Road, others drive across after a day at the reservoir. If you&rsquo;re into the Wraysbury reservoir walks or you&rsquo;ve been birdwatching around the gravel pits, we&rsquo;re the natural finishing point: a cold pint, a stone-baked pizza, and a seat in the garden watching the planes come in low overhead.
                            </p>
                            <p>
                                The Wraysbury Dive Centre crowd know us well too. After a few hours in cold water, there&rsquo;s nothing better than warming up with a proper meal in a proper pub. We&rsquo;re dog-friendly throughout, so if the Labrador came along for the reservoir walk, bring them in, water bowls are always out.
                            </p>
                            <p>
                                Non-drivers aren&rsquo;t left out either. Wraysbury station is on the Windsor &amp; Eton line, and a taxi from there to us is barely five pounds. A few of our regulars do exactly that on quiz nights, taxi over, have a couple of drinks, taxi home. Easy.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-canvas">
                <Container>
                    <div className="max-w-2xl mx-auto text-center">
                        <SectionHeading
                            title="Opening Hours"
                        />
                        <BusinessHours />
                    </div>
                </Container>
            </section>

            <OrganicSearchClusterLinks
                cluster="localPub"
                currentPath="/wraysbury-pub"
                title="Compare local pub pages"
                intro="Use these local pages for nearby pub, food and directions searches before you visit."
            />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How far is The Anchor from Wraysbury?",
                        answer: "We are approximately 2 miles away, which is a quick 5-minute drive via Horton Road. It's an easy journey with no major traffic lights."
                    },
                    {
                        question: "Do you have parking?",
                        answer: "Yes, we have 20 free parking spaces on-site. It's stress-free parking, unlike some village centres."
                    },
                    {
                        question: "Is the pub family friendly?",
                        answer: "Absolutely. We welcome families from Wraysbury for lunch and dinner. We have a children's menu and a large beer garden for the warmer months."
                    },
                    {
                        question: "Do you serve food all day?",
                        answer: "Our kitchen times vary by date. Please check the opening hours section or call us for the latest service times."
                    }
                ]}
                className="bg-surface"
            />

            <CtaBand
                title="Worth the 5 Minute Drive"
                copy="Experience the best hospitality in the area at The Anchor."
            >
                <Link href={CONTACT.phoneHref}>
                    <Button variant="primary" size="lg">Book a Table</Button>
                </Link>
                <Link href="/private-hire#enquiry">
                    <Button variant="outline" size="lg">Book an Event</Button>
                </Link>
                <Link href="https://maps.google.com/maps?saddr=Wraysbury&daddr=The+Anchor+Stanwell+Moor+TW19+6AQ">
                    <Button variant="outline" size="lg">Get Directions</Button>
                </Link>
            </CtaBand>
        </>
    )
}
