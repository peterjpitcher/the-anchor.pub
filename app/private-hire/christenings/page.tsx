import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, InfoBoxGrid, Button } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

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
    return (
        <>
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
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <PageTitle className="text-center mb-6" seo={{ structured: true, speakable: true }}>
                        The Perfect Post-Church Celebration
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

            <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
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
                                description: "Our garden area provides a lovely backdrop for family photos (weather permitting!).",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <PrivateBookingSection eventType="Christening / Baby Shower" />

            <FAQAccordionWithSchema
                faqs={[
                    {
                        question: "Can we decorate the area?",
                        answer: "Yes, you are welcome to bring balloons and table decorations for your dedicated area."
                    },
                    {
                        question: "Is there a room hire fee?",
                        answer: "For most christening parties booking a buffet or meal, there is no separate room hire fee, just a minimum spend on food/drink."
                    },
                    {
                        question: "Do you have a children's menu?",
                        answer: "Yes, we have a dedicated kids' menu with all their favourites, including smaller portions of our roast on Sundays."
                    }
                ]}
            />
        </>
    )
}
