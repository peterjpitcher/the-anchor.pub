import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getLandmarkBySlug, landmarks } from '@/lib/local-seo-data'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, Button, InfoBoxGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

// Generate static params for all landmarks at build time
export async function generateStaticParams() {
    return landmarks.map((landmark) => ({
        slug: landmark.slug,
    }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const landmark = getLandmarkBySlug(params.slug)
    if (!landmark) return {}

    const eventType = landmark.type === 'crematorium' ? 'Wake & Funeral Reception'
        : landmark.type === 'registry_office' ? 'Wedding Reception'
            : landmark.type === 'hospital' ? 'Baby Shower & Event'
                : 'Private Hire'

    return {
        title: `${eventType} Venue Near ${landmark.name} | The Anchor`,
        description: `${eventType} venue just ${landmark.distance} from ${landmark.name}. Free parking, private rooms, and flexible catering options.`,
        openGraph: {
            title: `${eventType} Venue Near ${landmark.name}`,
            description: `The perfect venue for your gathering after attending ${landmark.name}. Just ${landmark.distance} away.`,
            images: [DEFAULT_CORPORATE_IMAGE],
        }
    }
}

export default function NearLandmarkPage({ params }: { params: { slug: string } }) {
    const landmark = getLandmarkBySlug(params.slug)

    if (!landmark) {
        notFound()
    }

    // Determine context based on landmark type
    const isWake = landmark.type === 'crematorium'
    const isWedding = landmark.type === 'registry_office'
    const isBaby = landmark.type === 'hospital'

    const title = isWake ? 'Wakes & Memorials' : isWedding ? 'Wedding Celebrations' : isBaby ? 'Baby Showers & Events' : 'Private Hire & Events'
    const context = isWake ? 'wakes' : isWedding ? 'wedding' : isBaby ? 'baby_shower' : 'private_party'
    const eventType = isWake
        ? 'Wake / Memorial'
        : isWedding
            ? 'Wedding Reception'
            : isBaby
                ? 'Christening / Baby Shower'
                : 'Other'

    return (
        <>
            <HeroWrapper
                route={`/private-hire/near/${landmark.slug}`}
                title={`${title} Near ${landmark.name}`}
                description={`The perfect venue just ${landmark.distance} away`}
                variant="promo"
                tags={[
                    { label: `📍 ${landmark.distance}`, variant: "success" },
                    { label: "🚗 Free Parking", variant: "default" },
                    { label: "🍽️ Private Catering", variant: "default" },
                    { label: "🤝 Experienced Team", variant: "success" }
                ]}
                primaryCta={
                    <BookTableButton
                        source={`near_${landmark.slug}_hero`}
                        variant="primary"
                        size="lg"
                        context={context}
                    >
                        Check Availability
                    </BookTableButton>
                }
                secondaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source={`near_${landmark.slug}_hero`}
                        variant="secondary"
                        size="lg"
                    >
                        Call 01753 682707
                    </PhoneButton>
                }
            />

            <section className="py-12 bg-white">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-anchor-green mb-6">
                            Why Choose The Anchor?
                        </h2>
                        <p className="text-lg text-gray-700 mb-8">
                            {landmark.description} We are located just a short drive from <strong>{landmark.name}</strong>, offering a convenient and welcoming space for your guests to gather.
                        </p>

                        <InfoBoxGrid
                            columns={2}
                            boxes={[
                                {
                                    title: "Stress-Free Logistics",
                                    content: `After attending ${landmark.name}, the last thing you want is parking stress. We have a large private car park with 20 spaces, completely free for your guests.`,
                                    variant: "default"
                                },
                                {
                                    title: "Flexible Spaces",
                                    content: "Whether it's a small family gathering or a larger group, we have private and semi-private areas to suit your needs.",
                                    variant: "default"
                                }
                            ]}
                        />
                    </div>
                </Container>
            </section>

            {/* Map Section */}
            <section className="section-spacing bg-gray-50">
                <Container>
                    <SectionHeader
                        title={`Technically Just ${landmark.distance} Away`}
                        subtitle="Easy to find, easy to park"
                    />
                    <div className="max-w-5xl mx-auto h-[400px] rounded-xl overflow-hidden shadow-md">
                        <GoogleMapEmbed query={`The Anchor Stanwell Moor near ${landmark.name}`} />
                    </div>
                    <div className="text-center mt-6">
                        <Link href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(landmark.address)}&destination=The+Anchor+Stanwell+Moor+TW19+6AQ`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                📍 Get Directions from {landmark.name}
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-white">
                <Container>
                    <SectionHeader
                        title="Complete Packages"
                    />
                    <FeatureGrid
                        columns={3}
                        features={[
                            {
                                icon: "🍽️",
                                title: "Catering",
                                description: "Buffets, afternoon teas, or sit-down meals tailored to your requirements.",
                                className: "text-center"
                            },
                            {
                                icon: "☕",
                                title: "Refreshments",
                                description: "Unlimited tea & coffee stations, plus a full bar service.",
                                className: "text-center"
                            },
                            {
                                icon: "📋",
                                title: "Planning",
                                description: "Our team will handle the setup and coordination so you don't have to.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <PrivateBookingSection eventType={eventType} />

            <section className="bg-anchor-green py-16 text-white text-center">
                <Container>
                    <h2 className="text-3xl font-bold mb-4">Book Your Event</h2>
                    <p className="text-xl mb-8 opacity-90">Secure the date for your gathering near {landmark.name}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <BookTableButton
                            source={`near_${landmark.slug}_cta`}
                            variant="primary"
                            size="lg"
                            context={context}
                            className="bg-white text-anchor-green hover:bg-gray-100"
                        >
                            Enquire Now
                        </BookTableButton>
                        <PhoneButton
                            phone="01753 682707"
                            source={`near_${landmark.slug}_cta`}
                            variant="secondary"
                            size="lg"
                            className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                        >
                            Call 01753 682707
                        </PhoneButton>
                    </div>
                </Container>
            </section>
        </>
    )
}
