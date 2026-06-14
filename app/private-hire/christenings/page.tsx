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
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'

export const metadata: Metadata = {
    title: 'Christening Venue Near Heathrow & Staines',
    description: 'Private room for christening parties & baptism receptions at The Anchor, Stanwell Moor. Up to 50 guests, buffet options, family-friendly, free parking. Near Heathrow.',
    openGraph: {
        title: 'Christening Party Venue | The Anchor Stanwell Moor',
        description: 'Celebrate your little one\'s special day. Family-friendly venue with private rooms.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
        title: 'Christening Party Venue | The Anchor Stanwell Moor',
        description: 'Celebrate your little one\'s special day. Family-friendly venue with private rooms.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/christenings'
    }
}

const nearbyChurches = landmarks.filter(l => l.type === 'church');

export default function ChristeningsPage() {

    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/christenings#venue",
        "name": `${BRAND.name} Christening Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/christenings",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "Family-friendly venue for christening parties and baptism receptions near local churches in Stanwell Moor.",
        "maximumAttendeeCapacity": 50,
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Step-free access", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "High Chairs", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Baby Changing Facilities", "value": false },
            { "@type": "LocationFeatureSpecification", "name": "Enclosed Beer Garden", "value": true }
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
                crumb="Christenings"
                title="Christenings & Naming Ceremonies"
                lead="Celebrate with family and friends in a relaxed, child-friendly setting"
                badges={
                    <>
                        <Badge variant="sand">Family Friendly</Badge>
                        <Badge variant="sand">Buffet & Roast Options</Badge>
                        <Badge variant="sand">Near Local Churches</Badge>
                        <Badge variant="sand">Easy Parking</Badge>
                    </>
                }
                actions={
                    <>
                        <BookTableButton
                            source="christening_hero"
                            variant="primary"
                            size="lg"
                            context="christening"
                            fullWidth
                        >
                            Check Availability
                        </BookTableButton>
                        <PhoneButton
                            phone="01753 682707"
                            source="christening_hero"
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
                        Christening & Naming Ceremony Venue Near Heathrow
                    </PageTitle>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-ink-muted mb-8">
                            After the service, gather everyone together for a relaxed celebration at The Anchor. We offer flexible spaces where the adults can relax and the children have room to be themselves.
                        </p>
                        <Card className="w-full text-left">
                            <CardBody>
                                <h3 className="font-display text-h4 text-ink-strong mb-3 text-center">Nearby Churches</h3>
                                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                                    {nearbyChurches.map(l => (
                                        <li key={l.slug} className="flex items-center gap-2">
                                            <Link href={`/private-hire/near/${l.slug}`} className="font-medium text-ink-muted hover:underline">
                                                {l.name} ({l.distance})
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </CardBody>
                        </Card>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Menu Options"
                        lead="From Sunday Roasts to Finger Buffets"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
                        {[
                            { title: "Relaxed Buffet", content: "Our most popular option for christenings. A spread of hot and cold favourites that allows guests to mingle and eat at their own pace. Catering packages available upon request." },
                            { title: "Sunday Roast", content: "If your christening is on a Sunday, why not book a large area for our famous Sunday Roast? Walk in or book ahead, and call us for large groups so we can keep service smooth." },
                        ].map(box => (
                            <Card key={box.title} className="h-full">
                                <CardBody className="flex h-full flex-col gap-2">
                                    <h3 className="font-display text-h4 text-ink-strong">{box.title}</h3>
                                    <p className="text-ink-muted">{box.content}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="Children's Facilities"
                        lead="We make every child feel welcome"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { title: "High Chairs", description: "High chairs are available for babies and toddlers, just let us know when you book how many you need." },
                            { title: "Children's Menu", description: "A dedicated kids' menu with all their favourites, including smaller portions of our Sunday Roast." },
                            { title: "Safe Enclosed Garden", description: "Our beer garden is enclosed and safe for little ones to explore while the adults relax." },
                            { title: "Step-Free Access", description: "The bar and dining area are step-free, with free parking right by the entrance to make arrivals easy with a pushchair." },
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

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Why Families Love Us"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: "Child Friendly", description: "We welcome children of all ages. High chairs available." },
                            { title: "Bring Your Cake", description: "You are welcome to bring a celebration cake. We'll provide the knife and napkins." },
                            { title: "Photo Opportunities", description: "Our garden area and traditional pub backdrop provide a lovely setting for family photos (weather permitting)." },
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
                        title="Planning Your Christening Reception"
                        lead="A simple step-by-step guide"
                    />
                    <div className="max-w-3xl mx-auto">
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-dark text-white font-semibold flex items-center justify-center text-sm">1</span>
                                <div>
                                    <h3 className="font-semibold text-ink-strong mb-1">Book the venue early</h3>
                                    <p className="text-ink-muted">We recommend securing your date 2–4 weeks ahead of the ceremony, particularly for Sundays when our roast is popular. Call us on 01753 682707 or use the enquiry form below.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-dark text-white font-semibold flex items-center justify-center text-sm">2</span>
                                <div>
                                    <h3 className="font-semibold text-ink-strong mb-1">Choose your catering</h3>
                                    <p className="text-ink-muted">Decide between a relaxed buffet, afternoon tea, or a Sunday Roast if your service is on a Sunday. We will walk you through the options and pricing when you enquire.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-dark text-white font-semibold flex items-center justify-center text-sm">3</span>
                                <div>
                                    <h3 className="font-semibold text-ink-strong mb-1">Decorations and cake</h3>
                                    <p className="text-ink-muted">You are welcome to bring balloons, table decorations, and a celebration cake. We'll provide the knife and napkins. Please avoid loose confetti and glitter, which are difficult to clean up.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-dark text-white font-semibold flex items-center justify-center text-sm">4</span>
                                <div>
                                    <h3 className="font-semibold text-ink-strong mb-1">Photo opportunities</h3>
                                    <p className="text-ink-muted">Our enclosed beer garden and warm pub interior provide a lovely backdrop for family photographs. You are welcome to arrive a little early on the day to set up and capture those first moments.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-display text-h3 text-ink-strong mb-4">Also Planning a Baby Shower or Gender Reveal?</h2>
                        <p className="text-ink-muted mb-6">
                            The Anchor is equally well suited for baby showers and gender reveals. Explore our dedicated pages for more details on packages and ideas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/private-hire/baby-showers"
                                className="inline-block rounded-md border border-line bg-surface px-6 py-3 font-semibold text-accent-text transition-colors hover:border-accent"
                            >
                                Baby Shower Venue
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

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="After the Service"
                        lead="From church to celebration in minutes"
                    />
                    <div className="max-w-3xl mx-auto space-y-4 text-ink-muted">
                        <p>
                            One of the biggest advantages of choosing The Anchor as your christening venue is our proximity to local churches. Whether your ceremony is at St Mary the Virgin in Stanwell, St Mary&apos;s in Staines, or any of the churches across the Spelthorne area, we are just a short drive away. Most families arrive at The Anchor within 10 to 15 minutes of the service finishing.
                        </p>
                        <p>
                            We recommend allowing about 30 minutes of buffer time between the end of the service and your reception start. This gives everyone time to take photos outside the church, say hello to fellow guests, and travel over without feeling rushed. We will have the room set up and drinks ready to serve the moment you arrive.
                        </p>
                        <p>
                            If some guests are heading directly to The Anchor while others stay behind at the church, that is no problem at all. We will welcome early arrivals with drinks in the bar area and direct them to your reserved space once everyone has gathered. Our team is experienced at managing the staggered arrival that christening parties often involve.
                        </p>
                        <p>
                            For naming ceremonies and non-religious celebrations, the same applies. Whatever the format of your ceremony, we are ready to host the party that follows. Our christening venue in Surrey is designed to make the transition from service to celebration as smooth and relaxed as possible.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Christening Party Packages"
                        lead="Flexible catering to suit every family and budget"
                    />
                    <div className="max-w-2xl mx-auto space-y-6">
                        <CateringPackagesCard />

                        <p className="text-ink-muted text-sm">
                            Sunday roasts are also available for Sunday christenings, priced &agrave; la carte from our menu.
                        </p>

                        <Card><CardBody className="text-center">
                            <p className="text-ink-muted text-sm">
                                All christening party pub packages include use of a reserved area, dedicated staff, and free parking. Room hire applies and varies by day and group size, with pricing discussed on enquiry. Call us on <strong className="text-accent-text">01753 682707</strong> for a quote tailored to your guest numbers.
                            </p>
                        </CardBody></Card>
                    </div>
                </Container>
            </section>

            <TestimonialSection
                variant="compact"
                className="py-section-y bg-surface-sunk px-4"
                reviews={[
                    { quote: "We held our daughter's christening reception here after the service at St Mary's. The buffet was generous, the staff were brilliant with all the children, and having free parking right outside made life so much easier with all the grandparents. Lovely afternoon.", author: "Rachel, Staines", source: "Google Review", rating: 5 },
                    { quote: "The enclosed garden was perfect for the children to run around while we enjoyed drinks and food inside. The team set up a beautiful table for gifts and our christening cake. Could not recommend this christening venue enough.", author: "David, Ashford", source: "Google Review", rating: 5 },
                ]}
            />

            <PrivateBookingSection eventType="Christening / Baby Shower" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can we bring a celebration cake?",
                        answer: "Yes, absolutely. You are very welcome to bring your own cake. We will provide a knife, plates, and napkins. Just let us know in advance so we can keep it safe in our kitchen until it's needed."
                    },
                    {
                        question: "What are the decoration rules?",
                        answer: "Balloons, banners, and table centrepieces are all welcome. We ask that you avoid loose confetti and glitter as these are very difficult to clean from our carpets and upholstery."
                    },
                    {
                        question: "How long after the church service should we book the reception to start?",
                        answer: "Most ceremonies run between 30 and 60 minutes. We recommend allowing at least 30 minutes of buffer time between the service and your reception start, so guests aren't waiting around. We'll have the space ready from your agreed arrival time."
                    },
                    {
                        question: "Do you have high chairs?",
                        answer: "Yes, we have high chairs available. Please let us know how many you need when you make your booking so we can have them ready."
                    },
                    {
                        question: "Do you have a children's menu?",
                        answer: "Yes, we have a dedicated kids' menu with all their favourites, including smaller portions of our Sunday Roast on Sundays."
                    },
                    {
                        question: "Is the venue accessible for elderly guests and grandparents?",
                        answer: "Yes. The venue is on the ground floor with step-free access and ample parking directly outside. If any guests have specific accessibility requirements, please let us know when you book and we will do our best to accommodate them."
                    },
                    {
                        question: "Can we take photographs in the garden?",
                        answer: "Of course. Our enclosed beer garden and traditional pub exterior make a lovely backdrop for group photographs. The garden is also safely enclosed, which is reassuring when there are young children about."
                    },
                    {
                        question: "Is there parking for guests?",
                        answer: "Yes, we have free on-site parking for approximately 20 vehicles. For larger parties, there is also roadside parking nearby. Please mention parking requirements when you enquire and we can advise."
                    },
                    {
                        question: "Is there a room hire fee?",
                        answer: "Yes, a room hire fee applies for christening parties. The fee varies depending on the day, time, and group size. There is pricing discussed on enquiry. Contact us for specific details based on your guest numbers."
                    }
                ]}
            />

            <InternalLinkingSection
                title="Planning a christening or family celebration?"
                links={[
                    { href: '/blog/christening-party-ideas-venues', title: 'Christening Party Ideas & Venues', description: 'Ideas and tips for planning a christening celebration' },
                    { href: '/blog/leaving-party-ideas', title: 'Leaving Party Ideas', description: 'How to plan a memorable send-off' },
                    { href: '/private-hire', title: 'Private Hire & Events', description: 'Rooms, catering and availability' },
                ]}
            />
        </>
    )
}
