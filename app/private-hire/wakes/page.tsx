import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, Section, SectionHeader, FeatureGrid, InfoBoxGrid, Button, AlertBox } from '@/components/ui'
import { PhoneButton } from '@/components/PhoneButton'
import { PhoneLink } from '@/components/PhoneLink'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getCateringData, getLowestFoodPrice } from '@/lib/api/catering-packages'
import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

const WAKE_PACKAGE_NAMES = ['Sandwich Buffet', 'Finger Buffet', 'Premium Buffet', 'Afternoon Tea']

export async function generateMetadata(): Promise<Metadata> {
    const { foodPackages } = await getCateringData()
    const wakePackages = foodPackages.filter((p) => WAKE_PACKAGE_NAMES.includes(p.name))
    const fromPrice = getLowestFoodPrice(wakePackages) || '£12' // fallback only if API returns no wake packages

    return {
        title: 'Wake Venue Near Staines & Heathrow | Private Room',
        description: `Private room for wakes, funeral teas & celebrations of life near Staines & Heathrow. Up to 50 guests, buffet packages from ${fromPrice}pp, free parking. Compassionate staff.`,
        openGraph: {
            title: 'Wake Venue Near Staines & Heathrow | The Anchor Stanwell Moor',
            description: `Respectful, private spaces for wakes, funeral teas and celebrations of life. Buffet packages from ${fromPrice}pp. Minutes from local crematoriums.`,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title: 'Wake Venue Near Staines & Heathrow | The Anchor Stanwell Moor',
            description: `Wakes, funeral teas and celebrations of life. Buffet packages from ${fromPrice}pp, free parking, minutes from local crematoriums.`,
            images: [DEFAULT_CORPORATE_IMAGE]
        }),
        alternates: {
            canonical: '/private-hire/wakes'
        }
    }
}

const nearbyCrematoriums = landmarks.filter(l => l.type === 'crematorium');

export default async function WakesPage() {
    const { foodPackages } = await getCateringData()
    const wakePackages = foodPackages.filter((p) => WAKE_PACKAGE_NAMES.includes(p.name))
    const fromPrice = getLowestFoodPrice(wakePackages) || '£12' // fallback only if API returns no wake packages

    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/wakes#venue",
        "name": `${BRAND.name} Private Dining Room`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/wakes",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "A peaceful, private venue for wakes, funeral receptions and celebrations of life near South West Middlesex Crematorium.",
        "maximumAttendeeCapacity": 50,
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Private Dining Room", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Ground Floor Access", "value": true }
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
            <BreadcrumbJsonLd
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Private Hire', url: '/private-hire' },
                    { name: 'Wake Venue', url: '/private-hire/wakes' }
                ]}
            />

            <HeroWrapper
                showContextStrip={true}
                route="/private-hire/wakes"
                variant="feature"
                title="Wakes, Funeral Receptions & Celebrations of Life"
                description="A peaceful, respectful venue for gathering with family and friends"

                tags={[
                    { label: "Near SW Middlesex Crematorium", variant: "default" },
                    { label: "Compassionate Team", variant: "success" },
                    { label: `Funeral Tea from ${fromPrice}pp`, variant: "default" },
                    { label: "Free Parking", variant: "success" }
                ]}
                primaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="wakes_hero_primary"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Call to Discuss Arrangements
                    </PhoneButton>
                }
                secondaryCta={
                    <Link href="#enquiry" className="w-full sm:w-auto">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            Enquire Online
                        </Button>
                    </Link>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Up to 50 guests</span>
                    </div>
                }
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container size="md">
                    <PageTitle className="text-center mb-6" as="h2" seo={{ structured: true, speakable: true }}>
                        Wake Venue & Funeral Receptions Near Heathrow
                    </PageTitle>
                    <p className="text-lg text-anchor-cream-text/70 text-center mb-8">
                        We understand that organising a wake can be a difficult time. Our experienced team is here to handle the arrangements with sensitivity and care, ensuring a peaceful environment for you to remember your loved one.
                    </p>

                    <AlertBox
                        variant="info"
                        title="Convenient Location"
                        content={
                            <ul className="grid sm:grid-cols-2 gap-2 mt-2">
                                {nearbyCrematoriums.map(l => (
                                    <li key={l.slug} className="flex items-center gap-2">
                                        <span className="text-anchor-gold"></span>
                                        <Link href={`/private-hire/near/${l.slug}`} className="hover:underline text-anchor-gold font-medium">
                                            {l.name} ({l.distance})
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        }
                    />
                </Container>
            </section>

            <PrivateBookingSection id="enquiry" eventType="Wake / Memorial" />

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Private Spaces"
                        subtitle="Choose the right space for your gathering"
                    />
                    <FeatureGrid
                        columns={1}
                        features={[
                            {
                                icon: "",
                                title: "The Dining Room",
                                description: "A private, enclosed space suitable for 20-60 guests. Quiet and self-contained with direct access to facilities.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <Section className="bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Wake Reception Packages"
                        subtitle="Flexible catering for any gathering size"
                    />
                    <div className="prose prose-invert max-w-3xl mx-auto mb-8">
                        <p>We offer a range of buffet and tea &amp; coffee packages to suit your needs and budget. Use our calculator below to get an instant indication of costs for your gathering, or call us to discuss your requirements.</p>
                        <p>All packages include use of our private dining room, dedicated staff, free parking, and setup and cleardown. We can also arrange flowers, photos, and order of service display.</p>
                        <p>Guests who choose to stay on after the reception are welcome to order from <Link href="/food-menu" className="text-anchor-gold hover:underline">our full food menu</Link> at their leisure.</p>
                    </div>
                </Container>
            </Section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Facilities & Accessibility"
                        subtitle="A comfortable and accessible venue for all your guests"
                    />
                    <FeatureGrid
                        columns={2}
                        features={[
                            {
                                icon: "",
                                title: "Private Dining Room",
                                description: "Our self-contained private dining room accommodates 20 to 60 seated guests comfortably. For larger standing gatherings the venue can be arranged to suit a wider group. The room is quiet, enclosed, and separate from the main bar area."
                            },
                            {
                                icon: "",
                                title: "Accessibility for All Guests",
                                description: "The venue is entirely on the ground floor, making it easy for elderly guests and those with mobility difficulties. Accessible toilets are available on site, and our car park is directly adjacent to the entrance with no steps to navigate."
                            },
                            {
                                icon: "",
                                title: "Flexible Timing",
                                description: "We are available any day of the week, including at short notice for same-week bookings. We work around funeral service times and can open early or stay later to suit your schedule. Simply call us and we will accommodate your needs."
                            },
                            {
                                icon: "",
                                title: "Everything Included",
                                description: "Room hire, dedicated staff, setup, and cleardown are all included in our packages. There are no hidden charges. We handle the practical arrangements so you and your family can focus on being together."
                            },
                            {
                                icon: "",
                                title: "Dietary Accommodation",
                                description: "We regularly cater for large mixed groups with a range of dietary requirements including vegetarian, vegan, gluten-free, and nut-free options. Please let us know your requirements when booking and we will ensure everyone is catered for."
                            },
                            {
                                icon: "",
                                title: "Free Parking",
                                description: "Our car park provides 20 free spaces with room for funeral cars and larger vehicles. There is also ample unrestricted street parking nearby. We are just five minutes from South West Middlesex Crematorium and easily reached from the surrounding area."
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="What to Expect on the Day"
                        subtitle="We take care of the details so you can focus on being together"
                    />
                    <div className="prose prose-invert max-w-3xl mx-auto">
                        <p className="text-anchor-cream-text/70 mb-4">
                            Organising a wake reception can feel overwhelming, especially during such a difficult time. At The Anchor, we have hosted hundreds of funeral receptions and wakes over the years, and our experienced team knows exactly how to make the day run smoothly. Here is what you can expect when you choose us as your wake venue.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            Before the day, we will agree on all the details with you or your funeral director by phone. We are happy to liaise directly with the funeral home if that is easier for you. We will confirm the catering, room layout, arrival time, and any personal touches you would like.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            On the morning of your wake reception, our team will prepare the private dining room to your requirements. If you have provided photographs, an order of service, or flower arrangements, we will set these up on a dedicated display table. The room will be clean, warm, and ready before any guests arrive.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            When guests begin to arrive, our staff will be on hand to welcome everyone and direct them to the private space. Tea, coffee, and soft drinks can be ready on arrival, or we can serve drinks from the bar as guests settle in. If you have ordered a buffet, we will lay it out at a time that suits your schedule, many families prefer to allow 30 to 45 minutes of mingling before food is served.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            Throughout the afternoon, we maintain a discreet presence. Our team is always nearby if you need anything, extra drinks, more napkins, a quiet word about timings, but we will never intrude on your gathering. Many families tell us they appreciated the balance between attentive service and respectful distance.
                        </p>
                        <p className="text-anchor-cream-text/70">
                            There is no strict time limit on your wake. We understand that some gatherings naturally wind down after a couple of hours, while others continue into the early evening. We will never rush you. When you are ready to leave, we take care of all the cleardown and cleaning.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Celebration of Life"
                        subtitle="A modern, uplifting alternative to the traditional wake"
                    />
                    <div className="prose prose-invert max-w-3xl mx-auto mb-8">
                        <p className="text-anchor-cream-text/70 mb-4">
                            More and more families are choosing to hold a celebration of life rather than a traditional wake. A celebration of life venue focuses on remembering the person you loved through happy memories, shared laughter, and personal tributes, rather than a sombre, formal gathering.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            At The Anchor, we are perfectly set up for celebration of life events. Our private dining room can be decorated with photos, memory boards, and personal items that reflect the life of your loved one. You are welcome to play their favourite music through our sound system, set up a slideshow, or create a memory table where guests can leave notes and share stories.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            Many families choose to serve their loved one&apos;s favourite foods or drinks as part of the celebration. If they had a favourite beer, a go-to cocktail, or a dish they always ordered, let us know and we will do our best to include it. These small personal touches often mean the most.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            A celebration of life venue does not need to follow any particular format. Some families arrange informal speeches or toasts. Others prefer a purely social gathering where people can talk, eat, and remember at their own pace. We are flexible and will support whatever approach feels right for you. The important thing is that the day reflects the person being remembered, and that everyone leaves feeling they have honoured them properly.
                        </p>
                        <p className="text-anchor-cream-text/70">
                            Whether you call it a wake, a funeral reception, a memorial, or a celebration of life, the venue and the care behind it are what matter. We provide both.
                        </p>
                    </div>
                </Container>
            </section>

            <Section className="bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <CateringPackagesTable
                            packages={foodPackages}
                            title="Funeral Tea Packages"
                            subtitle="Simple, honest pricing with no hidden charges"
                            showDescription={true}
                            filterNames={WAKE_PACKAGE_NAMES}
                        />

                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6 text-center mt-8">
                            <p className="text-anchor-cream-text/70 text-sm">
                                All funeral tea packages include use of the private dining room, dedicated staff, setup, cleardown, and free parking. Prices are indicative and may vary based on guest numbers and specific requirements. Call us on <strong className="text-anchor-gold-vivid">01753 682707</strong> for a bespoke quote tailored to your needs.
                            </p>
                        </div>
                    </div>
                </Container>
            </Section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="What Families Say About Us"
                        subtitle="Words from families who have trusted us with their arrangements"
                    />
                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;The team at The Anchor made a difficult day so much easier. The room was set up beautifully, the food was lovely, and the staff were incredibly kind and discreet. We could not have asked for more.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">Sarah, Staines</p>
                        </div>
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;We held a celebration of life for my father here and it was exactly what he would have wanted. Relaxed, warm, and full of laughter. The staff even arranged his favourite beer on each table. That meant the world to us.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">James, Ashford</p>
                        </div>
                        <div className="bg-anchor-bg-raised border border-anchor-gold/15 rounded-xl p-6">
                            <p className="text-anchor-cream-text/70 italic mb-4">&ldquo;Everything was arranged at very short notice and the team handled it all with great care. The funeral director recommended The Anchor and we are so glad they did. A peaceful venue with genuinely compassionate staff.&rdquo;</p>
                            <p className="text-sm text-anchor-gold-vivid font-semibold">Priya, Feltham</p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Planning a Wake, Step by Step"
                        subtitle="A simple guide to arranging a funeral reception at The Anchor"
                    />
                    <div className="max-w-3xl mx-auto">
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">1</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Call us or ask your funeral director to call</h3>
                                    <p className="text-anchor-cream-text/70">You can call us directly on 01753 682707, or your funeral director can make the arrangements on your behalf. We are available seven days a week and can often accommodate bookings within 24 to 48 hours.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">2</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Choose your catering package</h3>
                                    <p className="text-anchor-cream-text/70">Select from our classic finger buffet, enhanced buffet, or afternoon tea. We can also create a bespoke menu if you have something specific in mind. Let us know about any dietary requirements and we will cater for everyone.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">3</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Share any personal touches</h3>
                                    <p className="text-anchor-cream-text/70">Let us know if you would like to display photographs, an order of service, or flowers. Tell us about any music you would like played or any other details that would make the day feel personal and meaningful.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-vivid text-anchor-dark font-bold flex items-center justify-center text-sm">4</span>
                                <div>
                                    <h3 className="font-bold text-anchor-cream-text mb-1">Leave the rest to us</h3>
                                    <p className="text-anchor-cream-text/70">On the day, everything will be ready before your guests arrive. We handle the setup, the catering, and the cleardown. You and your family can focus entirely on being together and remembering your loved one.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-anchor-gold-vivid mb-4">Near Slough Crematorium</h2>
                        <p className="text-anchor-cream-text/70 mb-4">
                            Slough Cemetery and Crematorium on Stoke Road is around 12 minutes&rsquo; drive from The Anchor. Many families use the A412 or B470 for a straightforward journey between the two, and our free car park means guests can arrive without worrying about parking charges after an already difficult day.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            We can have the private dining room set and ready before you arrive from the service. Whether you need space for a small, intimate gathering or up to 50 guests, we will prepare the room accordingly. Our staff understand that timings after a cremation can be unpredictable, and we will always accommodate a slightly later start without fuss.
                        </p>
                        <p className="text-anchor-cream-text/70">
                            If you are travelling from the Slough or Langley area, we are easily reached via the M25 junction 14. There is no need to navigate central Staines or Heathrow traffic, the approach from the north is straightforward and signposted. Call us on <PhoneLink phone={CONTACT.phone} source="wakes_slough" className="text-anchor-gold hover:underline" showIcon={false} /> to discuss arrangements, and we will take care of the rest.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-anchor-gold-vivid mb-4">Near Staines Cemetery</h2>
                        <p className="text-anchor-cream-text/70 mb-4">
                            Staines Cemetery on London Road is approximately 8 minutes from The Anchor, making it one of the most convenient wake venues for families gathering after a burial or committal service in Staines-upon-Thames. The route along the B378 is direct and avoids the busiest parts of the town centre.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            Families travelling from Staines will find our location in Stanwell Moor easy to reach by car or taxi. For guests using public transport, there are bus services connecting Staines town centre to Stanwell Moor. Our 20-space car park is free for all guests, and there is additional unrestricted street parking nearby for larger gatherings.
                        </p>
                        <p className="text-anchor-cream-text/70">
                            We welcome families from Staines, Ashford, Laleham, and Shepperton who are looking for a quiet, private venue after a service at Staines Cemetery. Our team is accustomed to arranging wakes at short notice, and we will do everything we can to support you. Please call us on <PhoneLink phone={CONTACT.phone} source="wakes_staines" className="text-anchor-gold hover:underline" showIcon={false} />, there is always someone here to help.
                        </p>
                    </div>
                </Container>
            </section>

            <OrganicSearchClusterLinks
                cluster="privateRooms"
                currentPath="/private-hire/wakes"
                title="Private rooms for wakes near Staines and Heathrow"
                intro="Compare private room, function room and party venue options before you call or enquire."
            />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "How quickly can I book a wake?",
                        answer: "We understand that wakes often need to be arranged at short notice. Call us on 01753 682707 and we will do our best to accommodate you, often within 24-48 hours."
                    },
                    {
                        question: "How quickly can you arrange a wake?",
                        answer: "We understand that funeral arrangements often happen at short notice. We can accommodate wake bookings within 24-48 hours. Call us on 01753 682707 to discuss."
                    },
                    {
                        question: "How much does a wake reception cost?",
                        answer: "Our buffet packages start from a competitive per-head rate. Use our pricing calculator on this page for an instant estimate, or call us for a bespoke quote. There are no hidden charges, the price includes room hire, staff, and parking."
                    },
                    {
                        question: "Can we bring our own flowers or photos?",
                        answer: "Absolutely. Many families bring order of service cards, photos, and flower arrangements. We'll set up a display table and ensure everything is arranged respectfully before your guests arrive."
                    },
                    {
                        question: "Is there parking for funeral cars?",
                        answer: "Yes, we have 20 free parking spaces including space for funeral cars and larger vehicles. We're just 5 minutes from South West Middlesex Crematorium."
                    },
                    {
                        question: "Do you cater for large groups?",
                        answer: "Yes, we can accommodate up to 60 seated guests in our private dining room, or larger standing gatherings across the venue. For bigger groups, we can arrange a tailored setup."
                    },
                    {
                        question: "Is there parking for guests?",
                        answer: "Yes, we have a large, free car park with 20 spaces. There is also ample street parking nearby with no restrictions."
                    },
                    {
                        question: "Can we play our own music?",
                        answer: "Yes, we have a sound system in the private dining room where you can play a playlist of your choice quietly in the background."
                    },
                    {
                        question: "Do you cater for allergies?",
                        answer: "Absolutely. Please let us know of any dietary requirements when booking, and we will ensure suitable options are provided separately."
                    }
                ]}
            />

            <section className="bg-anchor-bg-raised py-12 border-t border-anchor-gold/15">
                <Container size="sm" className="text-center">
                    <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Contact Our Team</h2>
                    <p className="mb-8 text-anchor-cream-text/70">We are here to help make this day as stress-free as possible.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <PhoneButton phone="01753 682707" size="lg" variant="primary" source="wakes_cta_bottom">Call 01753 682707</PhoneButton>
                        <Link href="mailto:manager@the-anchor.pub?subject=Wake Enquiry" className="inline-block">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">Email Us</Button>
                        </Link>
                    </div>
                </Container>
            </section>
        </>
    )
}
