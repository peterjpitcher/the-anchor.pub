import Link from 'next/link'
import { Metadata } from 'next'
import { InteriorHero } from '@/components/hero'
import { Container, SectionHeading, Card, CardBody, Button, Badge } from '@/components/ui'
import { PhoneButton } from '@/components/PhoneButton'
import { PhoneLink } from '@/components/PhoneLink'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { CtaBand } from '@/components/CtaBand'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getCateringData, getLowestFoodPrice } from '@/lib/api/catering-packages'
import { CateringPackagesCard } from '@/app/private-hire/_components/CateringPackagesCard'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TestimonialSection } from '@/components/TestimonialSection'

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

            <InteriorHero
                image="/images/page-headers/private-hire/private-hire.jpg"
                crumb="Wakes"
                title="Wakes, Funeral Receptions & Celebrations of Life"
                lead="A peaceful, respectful venue for gathering with family and friends"
                badges={
                    <>
                        <Badge variant="sand">Near SW Middlesex Crematorium</Badge>
                        <Badge variant="sand">Compassionate Team</Badge>
                        <Badge variant="sand">Funeral Tea from {fromPrice}pp</Badge>
                        <Badge variant="sand">Free Parking</Badge>
                    </>
                }
                actions={
                    <>
                        <PhoneButton
                            phone="01753 682707"
                            source="wakes_hero_primary"
                            variant="primary"
                            size="lg"
                        >
                            Call to Discuss Arrangements
                        </PhoneButton>
                        <Link href="#enquiry">
                            <Button variant="outline" size="lg" fullWidth>
                                Enquire Online
                            </Button>
                        </Link>
                    </>
                }
            />

            <section className="py-section-y bg-canvas">
                <Container size="md">
                    <PageTitle className="text-center mb-6" as="h2" seo={{ structured: true, speakable: true }}>
                        Wake Venue & Funeral Receptions Near Heathrow
                    </PageTitle>
                    <p className="text-lg text-ink-muted text-center mb-8">
                        We understand that organising a wake can be a difficult time. Our experienced team is here to handle the arrangements with sensitivity and care, ensuring a peaceful environment for you to remember your loved one.
                    </p>

                    <Card accent>
                        <CardBody>
                            <h3 className="font-display text-h4 text-ink-strong mb-3">Convenient Location</h3>
                            <ul className="grid sm:grid-cols-2 gap-2">
                                {nearbyCrematoriums.map(l => (
                                    <li key={l.slug} className="flex items-center gap-2">
                                        <Link href={`/private-hire/near/${l.slug}`} className="hover:underline text-accent-text font-medium">
                                            {l.name} ({l.distance})
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardBody>
                    </Card>
                </Container>
            </section>

            <PrivateBookingSection id="enquiry" eventType="Wake / Memorial" />

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Private Spaces"
                        lead="Choose the right space for your gathering"
                    />
                    <Card accent className="max-w-2xl mx-auto text-center">
                        <CardBody>
                            <h3 className="font-display text-h4 text-ink-strong mb-2">The Dining Room</h3>
                            <p className="text-ink-muted">A private, enclosed space suitable for 20-60 guests. Quiet and self-contained with direct access to facilities.</p>
                        </CardBody>
                    </Card>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="Wake Reception Packages"
                        lead="Flexible catering for any gathering size"
                    />
                    <div className="max-w-3xl mx-auto mb-8 space-y-4 text-ink-muted">
                        <p>We offer a range of buffet and tea &amp; coffee packages to suit your needs and budget. Use our calculator below to get an instant indication of costs for your gathering, or call us to discuss your requirements.</p>
                        <p>All packages include use of our private dining room, dedicated staff, free parking, and setup and cleardown. We can also arrange flowers, photos, and order of service display.</p>
                        <p>Guests who choose to stay on after the reception are welcome to order from <Link href="/food-menu" className="text-accent-text hover:underline">our full food menu</Link> at their leisure.</p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Facilities & Accessibility"
                        lead="A comfortable and accessible venue for all your guests"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {[
                            { title: "Private Dining Room", description: "Our self-contained private dining room accommodates 20 to 60 seated guests comfortably. For larger standing gatherings the venue can be arranged to suit a wider group. The room is quiet, enclosed, and separate from the main bar area." },
                            { title: "Accessibility for All Guests", description: "The venue is entirely on the ground floor with step-free access to the bar and dining area, making it easy for elderly guests and those with mobility difficulties. Our car park is directly adjacent to the entrance with no steps to navigate. Please note we do not currently have an accessible toilet, so call ahead if you would like to talk through your visit." },
                            { title: "Flexible Timing", description: "We are available any day of the week, including at short notice for same-week bookings. We work around funeral service times and can open early or stay later to suit your schedule. Simply call us and we will accommodate your needs." },
                            { title: "Everything Included", description: "Room hire, dedicated staff, setup, and cleardown are all included in our packages. There are no hidden charges. We handle the practical arrangements so you and your family can focus on being together." },
                            { title: "Dietary Accommodation", description: "We regularly cater for large mixed groups with a range of dietary requirements including vegetarian, vegan, gluten-free, and nut-free options. Please let us know your requirements when booking and we will ensure everyone is catered for." },
                            { title: "Free Parking", description: "Our car park provides 20 free spaces with room for funeral cars and larger vehicles. There is also ample unrestricted street parking nearby. We are just five minutes from South West Middlesex Crematorium and easily reached from the surrounding area." },
                        ].map(feature => (
                            <Card key={feature.title} className="h-full">
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
                        title="What to Expect on the Day"
                        lead="We take care of the details so you can focus on being together"
                    />
                    <div className="max-w-3xl mx-auto space-y-4 text-ink-muted">
                        <p>
                            Organising a wake reception can feel overwhelming, especially during such a difficult time. At The Anchor, we have hosted hundreds of funeral receptions and wakes over the years, and our experienced team knows exactly how to make the day run smoothly. Here is what you can expect when you choose us as your wake venue.
                        </p>
                        <p>
                            Before the day, we will agree on all the details with you or your funeral director by phone. We are happy to liaise directly with the funeral home if that is easier for you. We will confirm the catering, room layout, arrival time, and any personal touches you would like.
                        </p>
                        <p>
                            On the morning of your wake reception, our team will prepare the private dining room to your requirements. If you have provided photographs, an order of service, or flower arrangements, we will set these up on a dedicated display table. The room will be clean, warm, and ready before any guests arrive.
                        </p>
                        <p>
                            When guests begin to arrive, our staff will be on hand to welcome everyone and direct them to the private space. Tea, coffee, and soft drinks can be ready on arrival, or we can serve drinks from the bar as guests settle in. If you have ordered a buffet, we will lay it out at a time that suits your schedule, many families prefer to allow 30 to 45 minutes of mingling before food is served.
                        </p>
                        <p>
                            Throughout the afternoon, we maintain a discreet presence. Our team is always nearby if you need anything, extra drinks, more napkins, a quiet word about timings, but we will never intrude on your gathering. Many families tell us they appreciated the balance between attentive service and respectful distance.
                        </p>
                        <p>
                            There is no strict time limit on your wake. We understand that some gatherings naturally wind down after a couple of hours, while others continue into the early evening. We will never rush you. When you are ready to leave, we take care of all the cleardown and cleaning.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title="Celebration of Life"
                        lead="A modern, uplifting alternative to the traditional wake"
                    />
                    <div className="max-w-3xl mx-auto mb-8 space-y-4 text-ink-muted">
                        <p>
                            More and more families are choosing to hold a celebration of life rather than a traditional wake. A celebration of life venue focuses on remembering the person you loved through happy memories, shared laughter, and personal tributes, rather than a sombre, formal gathering.
                        </p>
                        <p>
                            At The Anchor, we are perfectly set up for celebration of life events. Our private dining room can be decorated with photos, memory boards, and personal items that reflect the life of your loved one. You are welcome to play their favourite music through our sound system, set up a slideshow, or create a memory table where guests can leave notes and share stories.
                        </p>
                        <p>
                            Many families choose to serve their loved one&apos;s favourite foods or drinks as part of the celebration. If they had a favourite beer, a go-to cocktail, or a dish they always ordered, let us know and we will do our best to include it. These small personal touches often mean the most.
                        </p>
                        <p>
                            A celebration of life venue does not need to follow any particular format. Some families arrange informal speeches or toasts. Others prefer a purely social gathering where people can talk, eat, and remember at their own pace. We are flexible and will support whatever approach feels right for you. The important thing is that the day reflects the person being remembered, and that everyone leaves feeling they have honoured them properly.
                        </p>
                        <p>
                            Whether you call it a wake, a funeral reception, a memorial, or a celebration of life, the venue and the care behind it are what matter. We provide both.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="Funeral Tea Packages"
                        lead="Simple, honest pricing with no hidden charges"
                    />
                    <div className="max-w-2xl mx-auto space-y-8">
                        <CateringPackagesCard />

                        <Card><CardBody className="text-center">
                            <p className="text-ink-muted text-sm">
                                All funeral tea packages include use of the private dining room, dedicated staff, setup, cleardown, and free parking. Prices are indicative and may vary based on guest numbers and specific requirements. Call us on <strong className="text-accent-text">01753 682707</strong> for a bespoke quote tailored to your needs.
                            </p>
                        </CardBody></Card>
                    </div>
                </Container>
            </section>

            <TestimonialSection
                variant="full"
                title="What Families Say About Us"
                subtitle="Words from families who have trusted us with their arrangements"
                className="py-section-y bg-surface"
                reviews={[
                    { quote: "The team at The Anchor made a difficult day so much easier. The room was set up beautifully, the food was lovely, and the staff were incredibly kind and discreet. We could not have asked for more.", author: "Sarah, Staines", source: "Google Review", rating: 5 },
                    { quote: "We held a celebration of life for my father here and it was exactly what he would have wanted. Relaxed, warm, and full of laughter. The staff even arranged his favourite beer on each table. That meant the world to us.", author: "James, Ashford", source: "Google Review", rating: 5 },
                    { quote: "Everything was arranged at very short notice and the team handled it all with great care. The funeral director recommended The Anchor and we are so glad they did. A peaceful venue with genuinely compassionate staff.", author: "Priya, Feltham", source: "Google Review", rating: 5 },
                ]}
            />

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="Planning a Wake, Step by Step"
                        lead="A simple guide to arranging a funeral reception at The Anchor"
                    />
                    <div className="max-w-3xl mx-auto">
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-dark text-white font-semibold flex items-center justify-center text-sm">1</span>
                                <div>
                                    <h3 className="font-semibold text-ink-strong mb-1">Call us or ask your funeral director to call</h3>
                                    <p className="text-ink-muted">You can call us directly on 01753 682707, or your funeral director can make the arrangements on your behalf. We are available seven days a week and can often accommodate bookings within 24 to 48 hours.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-dark text-white font-semibold flex items-center justify-center text-sm">2</span>
                                <div>
                                    <h3 className="font-semibold text-ink-strong mb-1">Choose your catering package</h3>
                                    <p className="text-ink-muted">Select from our classic finger buffet, enhanced buffet, or afternoon tea. We can also create a bespoke menu if you have something specific in mind. Let us know about any dietary requirements and we will cater for everyone.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-dark text-white font-semibold flex items-center justify-center text-sm">3</span>
                                <div>
                                    <h3 className="font-semibold text-ink-strong mb-1">Share any personal touches</h3>
                                    <p className="text-ink-muted">Let us know if you would like to display photographs, an order of service, or flowers. Tell us about any music you would like played or any other details that would make the day feel personal and meaningful.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-anchor-gold-dark text-white font-semibold flex items-center justify-center text-sm">4</span>
                                <div>
                                    <h3 className="font-semibold text-ink-strong mb-1">Leave the rest to us</h3>
                                    <p className="text-ink-muted">On the day, everything will be ready before your guests arrive. We handle the setup, the catering, and the cleardown. You and your family can focus entirely on being together and remembering your loved one.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-display text-h2 text-ink-strong mb-4">Near Slough Crematorium</h2>
                        <p className="text-ink-muted mb-4">
                            Slough Cemetery and Crematorium on Stoke Road is around 12 minutes&rsquo; drive from The Anchor. Many families use the A412 or B470 for a straightforward journey between the two, and our free car park means guests can arrive without worrying about parking charges after an already difficult day.
                        </p>
                        <p className="text-ink-muted mb-4">
                            We can have the private dining room set and ready before you arrive from the service. Whether you need space for a small, intimate gathering or up to 50 guests, we will prepare the room accordingly. Our staff understand that timings after a cremation can be unpredictable, and we will always accommodate a slightly later start without fuss.
                        </p>
                        <p className="text-ink-muted">
                            If you are travelling from the Slough or Langley area, we are easily reached via the M25 junction 14. There is no need to navigate central Staines or Heathrow traffic, the approach from the north is straightforward and signposted. Call us on <PhoneLink phone={CONTACT.phone} source="wakes_slough" className="text-accent-text hover:underline" showIcon={false} /> to discuss arrangements, and we will take care of the rest.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-display text-h2 text-ink-strong mb-4">Near Staines Cemetery</h2>
                        <p className="text-ink-muted mb-4">
                            Staines Cemetery on London Road is approximately 8 minutes from The Anchor, making it one of the most convenient wake venues for families gathering after a burial or committal service in Staines-upon-Thames. The route along the B378 is direct and avoids the busiest parts of the town centre.
                        </p>
                        <p className="text-ink-muted mb-4">
                            Families travelling from Staines will find our location in Stanwell Moor easy to reach by car or taxi. For guests using public transport, there are bus services connecting Staines town centre to Stanwell Moor. Our 20-space car park is free for all guests, and there is additional unrestricted street parking nearby for larger gatherings.
                        </p>
                        <p className="text-ink-muted">
                            We welcome families from Staines, Ashford, Laleham, and Shepperton who are looking for a quiet, private venue after a service at Staines Cemetery. Our team is accustomed to arranging wakes at short notice, and we will do everything we can to support you. Please call us on <PhoneLink phone={CONTACT.phone} source="wakes_staines" className="text-accent-text hover:underline" showIcon={false} />, there is always someone here to help.
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

            <CtaBand
                title="Contact Our Team"
                copy="We are here to help make this day as stress-free as possible."
                primary={
                    <PhoneButton phone="01753 682707" size="lg" variant="primary" source="wakes_cta_bottom">Call 01753 682707</PhoneButton>
                }
                secondary={
                    <Link href="mailto:manager@the-anchor.pub?subject=Wake Enquiry" className="inline-block">
                        <Button variant="outline" size="lg">Email Us</Button>
                    </Link>
                }
            />
        </>
    )
}
