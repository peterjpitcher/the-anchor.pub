import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, Section, SectionHeader, FeatureGrid, InfoBoxGrid, Button, AlertBox } from '@/components/ui'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
    title: 'Wake Venue Near South West Middlesex Crematorium | The Anchor',
    description: 'A peaceful and respectful venue for wakes and funeral receptions near South West Middlesex Crematorium and Staines Cemetery. Private rooms, buffet packages, and compassionate staff.',
    openGraph: {
        title: 'Wake & Funeral Reception Venue | The Anchor Stanwell Moor',
        description: 'Respectful, private spaces for post-service gatherings. Just minutes from local crematoriums.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
        title: 'Wake & Funeral Reception Venue | The Anchor Stanwell Moor',
        description: 'Respectful, private spaces for post-service gatherings. Just minutes from local crematoriums.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/wakes'
    }
}

const nearbyCrematoriums = landmarks.filter(l => l.type === 'crematorium');

export default function WakesPage() {
    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: 'Home', url: '/' },
                { name: 'Private Hire', url: '/private-hire' },
                { name: 'Wakes', url: '/private-hire/wakes' }
            ]} />

            <HeroWrapper
                route="/private-hire/wakes"
                variant="feature"
                title="Wakes & Funeral Receptions"
                description="A peaceful, respectful venue for gathering with family and friends"

                tags={[
                    { label: "Near SW Middlesex Crematorium", variant: "default" },
                    { label: "Compassionate Team", variant: "success" },
                    { label: "Buffet & Tea Packages", variant: "default" },
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
                    <Link href="/private-hire#enquiry" className="w-full sm:w-auto">
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
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10–200 guests</span>
                    </div>
                }
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container size="md">
                    <PageTitle className="text-center mb-6" as="h1" seo={{ structured: true, speakable: true }}>
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

            <PrivateBookingSection eventType="Wake / Memorial" />

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
                        answer: "Our buffet packages start from a competitive per-head rate. Use our pricing calculator on this page for an instant estimate, or call us for a bespoke quote. There are no hidden charges — the price includes room hire, staff, and parking."
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
