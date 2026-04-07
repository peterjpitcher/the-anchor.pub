import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, InfoBoxGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Christening Venue Near Staines & Stanwell | The Anchor',
    description: 'The perfect venue for christening parties and baptism receptions in Stanwell Moor. Family-friendly, buffet options, and free parking for all guests.',
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
            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "High Chairs", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Baby Changing Facilities", "value": true },
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
            <BreadcrumbJsonLd items={[
                { name: 'Home', url: '/' },
                { name: 'Private Hire', url: '/private-hire' },
                { name: 'Christenings', url: '/private-hire/christenings' }
            ]} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(eventVenueSchema) }}
            />

            <HeroWrapper
                route="/private-hire/christenings"
                variant="feature"
                title="Christenings & Naming Ceremonies"
                description="Celebrate with family and friends in a relaxed, child-friendly setting"

                tags={[
                    { label: "Family Friendly", variant: "success" },
                    { label: "Buffet & Roast Options", variant: "default" },
                    { label: "Near Local Churches", variant: "success" },
                    { label: "Easy Parking", variant: "default" }
                ]}
                primaryCta={
                    <BookTableButton
                        source="christening_hero"
                        variant="primary"
                        size="lg"
                        context="christening"
                    >
                        Check Availability
                    </BookTableButton>
                }
                secondaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="christening_hero"
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
                        Christening & Naming Ceremony Venue Near Heathrow
                    </PageTitle>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-anchor-cream-text/70 mb-8">
                            After the service, gather everyone together for a relaxed celebration at The Anchor. We offer flexible spaces where the adults can relax and the children have room to be themselves.
                        </p>
                        <div className="bg-anchor-bg-raised p-6 rounded-xl inline-block text-left w-full border border-anchor-gold/15">
                            <h3 className="font-bold text-anchor-gold-vivid mb-3 text-center">Nearby Churches</h3>
                            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                                {nearbyChurches.map(l => (
                                    <li key={l.slug} className="flex items-center gap-2">
                                        <Link href={`/private-hire/near/${l.slug}`} className="hover:underline text-anchor-cream-text/70 font-medium">
                                            {l.name} ({l.distance})
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Menu Options"
                        subtitle="From Sunday Roasts to Finger Buffets"
                    />
                    <InfoBoxGrid
                        columns={2}
                        boxes={[
                            {
                                title: "Relaxed Buffet",
                                content: "Our most popular option for christenings. A spread of hot and cold favourites that allows guests to mingle and eat at their own pace. Catering packages available upon request.",
                                variant: "default"
                            },
                            {
                                title: "Sunday Roast",
                                content: "If your christening is on a Sunday, why not book a large area for our famous Sunday Roast? Pre-orders available for large groups to ensure smooth service.",
                                variant: "default"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15 border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Children's Facilities"
                        subtitle="We make every child feel welcome"
                    />
                    <FeatureGrid
                        columns={4}
                        features={[
                            {
                                icon: "",
                                title: "High Chairs",
                                description: "High chairs are available for babies and toddlers — just let us know when you book how many you need.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Children's Menu",
                                description: "A dedicated kids' menu with all their favourites, including smaller portions of our Sunday Roast.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Safe Enclosed Garden",
                                description: "Our beer garden is enclosed and safe for little ones to explore while the adults relax.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Baby Changing",
                                description: "Baby changing facilities are available on site for your convenience.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Why Families Love Us"
                    />
                    <FeatureGrid
                        columns={3}
                        features={[
                            {
                                icon: "",
                                title: "Child Friendly",
                                description: "We welcome children of all ages. High chairs available.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Bring Your Cake",
                                description: "You are welcome to bring a celebration cake. We'll provide the knife and napkins.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Photo Opportunities",
                                description: "Our garden area and traditional pub backdrop provide a lovely setting for family photos (weather permitting).",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Planning Your Christening Reception"
                        subtitle="A simple step-by-step guide"
                    />
                    <div className="max-w-3xl mx-auto">
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">1</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Book the venue early</h3>
                                    <p className="text-anchor-cream-text/70">We recommend securing your date 2–4 weeks ahead of the ceremony, particularly for Sundays when our roast is popular. Call us on 01753 682707 or use the enquiry form below.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">2</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Choose your catering</h3>
                                    <p className="text-anchor-cream-text/70">Decide between a relaxed buffet, afternoon tea, or a Sunday Roast if your service is on a Sunday. We will walk you through the options and pricing when you enquire.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">3</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Decorations and cake</h3>
                                    <p className="text-anchor-cream-text/70">You are welcome to bring balloons, table decorations, and a celebration cake. We'll provide the knife and napkins. Please avoid loose confetti and glitter, which are difficult to clean up.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">4</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Photo opportunities</h3>
                                    <p className="text-anchor-cream-text/70">Our enclosed beer garden and warm pub interior provide a lovely backdrop for family photographs. You are welcome to arrive a little early on the day to set up and capture those first moments.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-anchor-cream-text mb-4">Also Planning a Baby Shower or Gender Reveal?</h2>
                        <p className="text-anchor-cream-text/70 mb-6">
                            The Anchor is equally well suited for baby showers and gender reveals. Explore our dedicated pages for more details on packages and ideas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/private-hire/baby-showers"
                                className="inline-block bg-anchor-bg-raised border border-anchor-gold/30 rounded-lg px-6 py-3 text-anchor-gold-vivid font-semibold hover:bg-anchor-gold/10 transition-colors"
                            >
                                Baby Shower Venue
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

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="After the Service"
                        subtitle="From church to celebration in minutes"
                    />
                    <div className="prose prose-invert max-w-3xl mx-auto">
                        <p className="text-anchor-cream-text/70 mb-4">
                            One of the biggest advantages of choosing The Anchor as your christening venue is our proximity to local churches. Whether your ceremony is at St Mary the Virgin in Stanwell, St Mary&apos;s in Staines, or any of the churches across the Spelthorne area, we are just a short drive away. Most families arrive at The Anchor within 10 to 15 minutes of the service finishing.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            We recommend allowing about 30 minutes of buffer time between the end of the service and your reception start. This gives everyone time to take photos outside the church, say hello to fellow guests, and travel over without feeling rushed. We will have the room set up and drinks ready to serve the moment you arrive.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            If some guests are heading directly to The Anchor while others stay behind at the church, that is no problem at all. We will welcome early arrivals with drinks in the bar area and direct them to your reserved space once everyone has gathered. Our team is experienced at managing the staggered arrival that christening parties often involve.
                        </p>
                        <p className="text-anchor-cream-text/70">
                            For naming ceremonies and non-religious celebrations, the same applies. Whatever the format of your ceremony, we are ready to host the party that follows. Our christening venue in Surrey is designed to make the transition from service to celebration as smooth and relaxed as possible.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Christening Party Packages"
                        subtitle="Flexible catering to suit every family and budget"
                    />
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="card-dark rounded-none p-8 text-center">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">Finger Buffet</h3>
                                <p className="text-2xl font-bold text-anchor-cream-text mb-1">From £9.95<span className="text-sm font-normal text-anchor-cream-text/55">/person</span></p>
                                <p className="text-anchor-cream-text/55 mb-4 italic">Minimum 20 guests</p>
                                <p className="text-anchor-cream-text/70 mb-4">A classic spread of sandwiches, sausage rolls, quiche, and savoury bites. Perfect for a relaxed christening party where guests can mingle and eat at their own pace.</p>
                                <ul className="text-sm text-anchor-cream-text/55 space-y-1 text-left">
                                    <li>Assorted sandwiches</li>
                                    <li>Sausage rolls &amp; mini quiches</li>
                                    <li>Crisps, nuts &amp; nibbles</li>
                                    <li>Tea &amp; coffee included</li>
                                </ul>
                            </div>

                            <div className="card-dark rounded-none p-8 text-center border-2 border-anchor-gold/30">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">Enhanced Buffet</h3>
                                <p className="text-2xl font-bold text-anchor-cream-text mb-1">From £14.95<span className="text-sm font-normal text-anchor-cream-text/55">/person</span></p>
                                <p className="text-anchor-cream-text/55 mb-4 italic">Most popular for christenings</p>
                                <p className="text-anchor-cream-text/70 mb-4">A more generous spread with hot options, homemade cakes, and fresh fruit. Ideal for christening parties with guests of all ages, including children.</p>
                                <ul className="text-sm text-anchor-cream-text/55 space-y-1 text-left">
                                    <li>All classic buffet items</li>
                                    <li>Hot chicken goujons or sausage rolls</li>
                                    <li>Homemade cakes &amp; pastries</li>
                                    <li>Fresh fruit platter</li>
                                </ul>
                            </div>

                            <div className="card-dark rounded-none p-8 text-center">
                                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2">Sunday Roast</h3>
                                <p className="text-2xl font-bold text-anchor-cream-text mb-1">Menu prices</p>
                                <p className="text-anchor-cream-text/55 mb-4 italic">Sunday christenings only</p>
                                <p className="text-anchor-cream-text/70 mb-4">If your christening is on a Sunday, why not treat your guests to our famous Sunday Roast? We can reserve a large area and take pre-orders for the whole party.</p>
                                <ul className="text-sm text-anchor-cream-text/55 space-y-1 text-left">
                                    <li>Choice of roast meats</li>
                                    <li>All the trimmings</li>
                                    <li>Children&apos;s portions available</li>
                                    <li>Pre-orders for smooth service</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6 text-center">
                            <p className="text-anchor-cream-text/70 text-sm">
                                All christening party pub packages include use of a reserved area, dedicated staff, and free parking. No separate room hire fee when booking a catering package. Call us on <strong className="text-anchor-gold-vivid">01753 682707</strong> for a quote tailored to your guest numbers.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="What Families Say"
                        subtitle="From recent christening celebrations at The Anchor"
                    />
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;We held our daughter&apos;s christening reception here after the service at St Mary&apos;s. The buffet was generous, the staff were brilliant with all the children, and having free parking right outside made life so much easier with all the grandparents. Lovely afternoon.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">— Rachel, Staines</p>
                        </div>
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;The enclosed garden was perfect for the children to run around while we enjoyed drinks and food inside. The team set up a beautiful table for gifts and our christening cake. Could not recommend this christening venue enough.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">— David, Ashford</p>
                        </div>
                    </div>
                </Container>
            </section>

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
                        answer: "For most christening parties booking a buffet or meal, there is no separate room hire fee — just a minimum spend on food and drink. Contact us for specific details based on your guest numbers."
                    }
                ]}
            />
        </>
    )
}
