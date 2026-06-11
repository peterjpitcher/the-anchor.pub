import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getLandmarkBySlug, landmarks } from '@/lib/local-seo-data'
import { InteriorHero } from '@/components/hero'
import { Container, SectionHeading, Card, CardBody, Button, Badge } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { CtaBand } from '@/components/CtaBand'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'

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
        : landmark.type === 'registry_office' ? 'Private Event'
            : landmark.type === 'hospital' ? 'Baby Shower & Event'
                : 'Private Hire'

    return {
        title: `${eventType} Venue Near ${landmark.name}`,
        description: `${eventType} venue just ${landmark.distance} from ${landmark.name}. Free parking, private rooms, and flexible catering options.`,
        openGraph: {
            title: `${eventType} Venue Near ${landmark.name}`,
            description: `The perfect venue for your gathering after attending ${landmark.name}. Just ${landmark.distance} away.`,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title: `${eventType} Venue Near ${landmark.name}`,
            description: `The perfect venue for your gathering after attending ${landmark.name}. Just ${landmark.distance} away.`,
            images: [DEFAULT_CORPORATE_IMAGE]
        }),
        alternates: {
            canonical: `/private-hire/near/${landmark.slug}`
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
    const isBaby = landmark.type === 'hospital'

    const title = isWake ? 'Wakes & Memorials' : isBaby ? 'Baby Showers & Events' : 'Private Hire & Events'
    const context = isWake ? 'wakes' : isBaby ? 'baby_shower' : 'private_party'
    const eventType = isWake
        ? 'Wake / Memorial'
        : isBaby
            ? 'Christening / Baby Shower'
            : 'Other'

    // Cross-link to other nearby venues (same type first) so each page carries a
    // distinct internal-link set and the /private-hire/near/* cluster is densely
    // interlinked — strengthens crawl signals and reduces the near-duplicate
    // template footprint without inventing per-landmark facts.
    const relatedLandmarks = [
        ...landmarks.filter((l) => l.slug !== landmark.slug && l.type === landmark.type),
        ...landmarks.filter((l) => l.slug !== landmark.slug && l.type !== landmark.type),
    ].slice(0, 6)

    return (
        <>
            <InteriorHero
                image="/images/page-headers/private-hire/private-hire.jpg"
                crumb={`Near ${landmark.name}`}
                title={`${title} Near ${landmark.name}`}
                lead={`The perfect venue just ${landmark.distance} away`}
                badges={
                    <>
                        <Badge variant="sand">{landmark.distance}</Badge>
                        <Badge variant="sand">Free Parking</Badge>
                        <Badge variant="sand">Private Catering</Badge>
                        <Badge variant="sand">Experienced Team</Badge>
                    </>
                }
                actions={
                    <>
                        <BookTableButton
                            source={`near_${landmark.slug}_hero`}
                            variant="primary"
                            size="lg"
                            context={context}
                            fullWidth
                        >
                            Check Availability
                        </BookTableButton>
                        <PhoneButton
                            phone="01753 682707"
                            source={`near_${landmark.slug}_hero`}
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
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="font-display text-h2 text-ink-strong mb-6">
                            Why Choose The Anchor?
                        </h2>
                        <p className="text-lg text-ink-muted mb-8">
                            {landmark.description} We are located just a short drive from <strong>{landmark.name}</strong>, offering a convenient and welcoming space for your guests to gather.
                        </p>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
                            {[
                                { title: "Stress-Free Logistics", content: `After attending ${landmark.name}, the last thing you want is parking stress. We have a large private car park with 20 spaces, completely free for your guests.` },
                                { title: "Flexible Spaces", content: "Whether it's a small family gathering or a larger group, we have private and semi-private areas to suit your needs." },
                            ].map(box => (
                                <Card key={box.title} className="h-full">
                                    <CardBody className="flex h-full flex-col gap-2">
                                        <h3 className="font-display text-h4 text-ink-strong">{box.title}</h3>
                                        <p className="text-ink-muted">{box.content}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Map Section */}
            <section className="py-section-y bg-surface">
                <Container>
                    <SectionHeading
                        title={`Technically Just ${landmark.distance} Away`}
                        script="Easy to find, easy to park"
                    />
                    <div className="max-w-5xl mx-auto h-[400px] rounded-md overflow-hidden shadow-md">
                        <GoogleMapEmbed query={`The Anchor Stanwell Moor near ${landmark.name}`} />
                    </div>
                    <div className="text-center mt-6">
                        <Link href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(landmark.address)}&destination=The+Anchor+Stanwell+Moor+TW19+6AQ`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                Get Directions from {landmark.name}
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            <section className="py-section-y bg-surface-sunk">
                <Container>
                    <SectionHeading
                        title="Complete Packages"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: "Catering", description: "Buffets, afternoon teas, or sit-down meals tailored to your requirements." },
                            { title: "Refreshments", description: "Unlimited tea & coffee stations, plus a full bar service." },
                            { title: "Planning", description: "Our team will handle the setup and coordination so you don't have to." },
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

            <InternalLinkingSection
                title="Other venues near you"
                links={relatedLandmarks.map((l) => ({
                    href: `/private-hire/near/${l.slug}`,
                    title: l.name,
                    description: `${l.distance} from The Anchor`,
                }))}
            />

            <PrivateBookingSection eventType={eventType} />

            <CtaBand
                title="Book Your Event"
                copy={`Secure the date for your gathering near ${landmark.name}`}
                primary={
                    <BookTableButton
                        source={`near_${landmark.slug}_cta`}
                        variant="primary"
                        size="lg"
                        context={context}
                    >
                        Enquire Now
                    </BookTableButton>
                }
                secondary={
                    <PhoneButton
                        phone="01753 682707"
                        source={`near_${landmark.slug}_cta`}
                        variant="outline"
                        size="lg"
                    >
                        Call 01753 682707
                    </PhoneButton>
                }
            />
        </>
    )
}
