import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, InfoBoxGrid, Button, AlertBox } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

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
            <HeroWrapper
                route="/private-hire/wakes"
                variant="feature"
                title="Wakes & Funeral Receptions"
                description="A peaceful, respectful venue for gathering with family and friends"
               
                tags={[
                    { label: "📍 Near SW Middlesex Crematorium", variant: "default" },
                    { label: "🤝 Compassionate Team", variant: "success" },
                    { label: "☕ Buffet & Tea Packages", variant: "default" },
                    { label: "🚗 Free Parking", variant: "success" }
                ]}
                primaryCta={
                    <BookTableButton
                        source="wakes_hero"
                        variant="primary"
                        size="lg"
                        context="wakes"
                    >
                        Check Availability
                    </BookTableButton>
                }
                secondaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="wakes_hero"
                        variant="secondary"
                        size="lg"
                    >
                        Call 01753 682707
                    </PhoneButton>
                }
            />

            <section className="py-12 bg-white">
                <Container size="md">
                    <PageTitle className="text-center mb-6" seo={{ structured: true, speakable: true }}>
                        Compassionate & Professional Service
                    </PageTitle>
                    <p className="text-lg text-gray-700 text-center mb-8">
                        We understand that organising a wake can be a difficult time. Our experienced team is here to handle the arrangements with sensitivity and care, ensuring a peaceful environment for you to remember your loved one.
                    </p>

                    <AlertBox
                        variant="info"
                        title="Convenient Location"
                        content={
                            <ul className="grid sm:grid-cols-2 gap-2 mt-2">
                                {nearbyCrematoriums.map(l => (
                                    <li key={l.slug} className="flex items-center gap-2">
                                        <span className="text-anchor-gold">📍</span>
                                        <Link href={`/private-hire/near/${l.slug}`} className="hover:underline text-anchor-green font-medium">
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



            <section className="section-spacing bg-white">
                <Container>
                    <SectionHeader
                        title="Private Spaces"
                        subtitle="Choose the right space for your gathering"
                    />
                    <FeatureGrid
                        columns={1}
                        features={[
                            {
                                icon: "🏠",
                                title: "The Dining Room",
                                description: "A private, enclosed space suitable for 20-60 guests. Quiet and self-contained with direct access to facilities.",
                                className: "text-center"
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

            <section className="bg-gray-100 py-12">
                <Container size="sm" className="text-center">
                    <h2 className="text-2xl font-bold text-anchor-green mb-4">Contact Our Team</h2>
                    <p className="mb-8 text-gray-600">We are here to help make this day as stress-free as possible.</p>
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
