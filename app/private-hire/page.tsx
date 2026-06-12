import Link from 'next/link'
import { Metadata } from 'next'
import { Briefcase, PartyPopper, Cake, Flower, Check, Phone } from 'lucide-react'
import { InteriorHero } from '@/components/hero'
import { Container, SectionHeading, Button, Badge } from '@/components/ui'
import { AmenityStrip } from '@/components/AmenityStrip'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { PhoneLink } from '@/components/PhoneLink'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { TestimonialSection } from '@/components/TestimonialSection'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { getCateringData, getLowestFoodPrice } from '@/lib/api/catering-packages'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { landmarks, type LandmarkType } from '@/lib/local-seo-data'
import { PRIVATE_HIRE_CAPACITY, PRIVATE_HIRE_CAPACITY_SUMMARY } from '@/lib/private-hire-capacity'
import { OccasionCard } from './_components/OccasionCard'
import { CateringPackagesCard } from './_components/CateringPackagesCard'

type LandmarkGroup = {
    title: string
    description: string
    types: LandmarkType[]
}

const landmarkGroups: LandmarkGroup[] = [
    {
        title: 'Wakes and memorial receptions',
        description: 'Nearby crematoriums and cemeteries where families often need a quiet private room afterwards.',
        types: ['crematorium'],
    },
    {
        title: 'Christenings, weddings and ceremonies',
        description: 'Churches, registry offices and ceremony venues within a practical drive of The Anchor.',
        types: ['church', 'registry_office'],
    },
    {
        title: 'Work, travel and team gatherings',
        description: 'Business parks, Heathrow and local venues for meetings, team meals and private celebrations.',
        types: ['hospital', 'business_park', 'sports_venue', 'other'],
    },
]

const occasions = [
    {
        href: '/corporate-events',
        icon: Briefcase,
        title: 'Corporate events',
        description: 'Meetings, training days and team lunches with AV equipment and free WiFi.',
    },
    {
        href: '/christmas-parties',
        icon: PartyPopper,
        title: 'Christmas parties',
        description: 'Festive get-togethers for work teams, friends and family, with buffet packages to match.',
    },
    {
        href: '/private-party-venue',
        icon: Cake,
        title: 'Private parties',
        description: 'Milestone birthdays, anniversaries and reunions with food, drinks and space to celebrate.',
    },
    {
        href: '/private-hire/wakes',
        icon: Flower,
        title: 'Wakes and memorials',
        description: 'A quiet, private room near local crematoriums, with respectful service and full catering.',
    },
]

const whyPoints = [
    {
        lead: 'Small groups welcome.',
        text: 'We host room bookings from just 10 guests, with no minimum-numbers headache. Larger events and full-venue hire are available by enquiry.',
    },
    {
        lead: 'Free parking for everyone.',
        text: 'A large on-site car park with around 20 spaces, free for you and your guests, with no fees while you visit.',
    },
    {
        lead: 'Catering to suit your budget.',
        text: 'From sandwich and finger buffets to an indoor BBQ, or à la carte from our menu for sit-down meals.',
    },
    {
        lead: 'A personal touch.',
        text: 'You plan your event directly with the team, not a faceless events desk, and bring your own decorations.',
    },
    {
        lead: 'Easy to reach.',
        text: 'Stanwell Moor, 7 minutes from Heathrow Terminal 5 and a short drive from Staines, just off the M25.',
    },
]

export async function generateMetadata(): Promise<Metadata> {
    const { foodPackages } = await getCateringData()
    const fromPrice = getLowestFoodPrice(foodPackages)
    const buffetPhrase = fromPrice ? `Buffets from ${fromPrice}pp` : 'Current buffet packages'
    const desc = `Book private rooms near Staines and Heathrow for wakes, parties, meetings and family events. ${PRIVATE_HIRE_CAPACITY.summary} ${buffetPhrase}, free parking, and a dedicated events team.`

    return {
        title: 'Private Hire Pub Near Heathrow & Staines | Event Venue',
        description: `${desc} The Anchor, Stanwell Moor.`,
        openGraph: {
            title: 'Private Hire Pub Near Heathrow & Staines | The Anchor',
            description: desc,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title: 'Private Hire Pub Near Heathrow & Staines | The Anchor',
            description: desc,
            images: [DEFAULT_CORPORATE_IMAGE]
        }),
        alternates: {
            canonical: '/private-hire'
        }
    }
}

export default async function PrivateHirePage() {
    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire#venue",
        "name": `${BRAND.name} Private Hire Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire",
        "description": `Private hire venue near Heathrow for wakes, parties, christenings, corporate events and celebrations. ${PRIVATE_HIRE_CAPACITY_SUMMARY} Buffet packages available, free parking.`,
        "maximumAttendeeCapacity": PRIVATE_HIRE_CAPACITY.spaces.entirePub.standing,
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Step-free access to most areas", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Accessible toilet", "value": false },
            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Private Dining Room", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "AV Equipment", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Private Bar", "value": true }
        ],
        "potentialAction": {
            "@type": "ReserveAction",
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
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([
                    {
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Private Rooms Near Staines and Heathrow",
                        "description": `Book private rooms near Staines and Heathrow for wakes, parties, meetings and family events. ${PRIVATE_HIRE_CAPACITY.summary} Free parking and a dedicated events team.`,
                        "url": "https://www.the-anchor.pub/private-hire",
                        "about": { "@id": "https://www.the-anchor.pub/#business" }
                    },
                    eventVenueSchema
                ]) }}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: 'Home', url: 'https://www.the-anchor.pub' },
                    { name: 'Private Hire', url: 'https://www.the-anchor.pub/private-hire' }
                ]}
            />

            <InteriorHero
                image="/images/page-headers/private-hire/private-hire.jpg"
                crumb="Private Hire"
                kicker="Private hire"
                title="Host your event at The Anchor"
                lead="Room bookings for 10 to 50 guests in Stanwell Moor, near Staines and Heathrow. Free parking, custom catering, and a team that plans it with you."
                badges={
                    <>
                        <Badge variant="sand">10 to 50 guests</Badge>
                        <Badge variant="sand">Free parking</Badge>
                        <Badge variant="sand">Custom catering</Badge>
                    </>
                }
                actions={
                    <>
                        <Link href="/private-hire#enquiry">
                            <Button variant="primary" size="lg" fullWidth>
                                Get an event quote
                            </Button>
                        </Link>
                        <PhoneButton
                            phone="01753 682707"
                            source="private_hire_hero"
                            variant="outline"
                            size="lg"
                        >
                            <Phone className="h-5 w-5" aria-hidden />
                            01753 682707
                        </PhoneButton>
                    </>
                }
            />

            <AmenityStrip />

            {/* Occasions */}
            <section className="bg-canvas py-section-y">
                <Container>
                    <SectionHeading
                        kicker="Occasions"
                        script="However you celebrate"
                        title="Every kind of get-together"
                    />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {occasions.map(occasion => (
                            <OccasionCard
                                key={occasion.href}
                                href={occasion.href}
                                icon={occasion.icon}
                                title={occasion.title}
                                description={occasion.description}
                            />
                        ))}
                    </div>
                </Container>
            </section>

            {/* Why choose us */}
            <section className="bg-surface py-section-y">
                <Container>
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <SectionHeading
                                align="left"
                                kicker="Why choose us"
                                title="A pub that feels like yours for the day"
                            />
                            <ul className="flex flex-col gap-5">
                                {whyPoints.map(point => (
                                    <li key={point.lead} className="flex items-start gap-3">
                                        <Check className="mt-1 h-5 w-5 shrink-0 text-accent-text" strokeWidth={2.5} aria-hidden />
                                        <p className="text-base text-ink-muted">
                                            <span className="font-semibold text-ink-strong">{point.lead}</span>{' '}
                                            {point.text}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <Link href="/private-hire#enquiry">
                                    <Button variant="primary" size="lg">
                                        Start your enquiry
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <CateringPackagesCard />
                    </div>
                </Container>
            </section>

            <CtaBand
                title="Let's plan your event"
                copy="Tell us your date, guest count and the kind of day you have in mind, and we'll build a quote for you."
                primary={
                    <Link href="/private-hire#enquiry">
                        <Button variant="primary" size="lg">
                            Get a quote
                        </Button>
                    </Link>
                }
                secondary={
                    <PhoneButton
                        phone="01753 682707"
                        source="private_hire_ctaband"
                        variant="outline"
                        size="lg"
                    >
                        <Phone className="h-5 w-5" aria-hidden />
                        01753 682707
                    </PhoneButton>
                }
            />

            {/* Existing enquiry form (logic preserved) */}
            <PrivateBookingSection
                id="enquiry"
                eventType="Other"
                title="Check availability and build a quote"
                subtitle="Choose your event type, preferred date, guest count, timing and food options."
            />

            {/* Testimonials */}
            <TestimonialSection
                variant="full"
                title="What our guests say"
                subtitle="From Google Reviews"
                className="bg-canvas py-section-y"
                reviews={[
                    { quote: "We had our baby's Baptism party at The Anchor. Billy and Peter made the whole event run so smoothly. The new conservatory room is amazing for any event. The buffet food was delicious, family and friends all commented on how lovely it was. Will definitely return for future family events.", author: "Rachel", source: "TripAdvisor", rating: 5 },
                    { quote: "Hired the function room for my 50th. Staff sorted everything, the buffet was spot on and everyone had a great night. Could not have asked for more.", author: "Dave", source: "Google Review", rating: 5 },
                    { quote: "Had our daughter's christening party here. They went above and beyond with the setup and the food was really impressive for the price. Everyone commented on how good the venue was.", author: "Priya", source: "Google Review", rating: 5 },
                    { quote: "Used The Anchor for our team Christmas lunch. Free parking was a huge bonus with 15 of us driving. Will definitely book again.", author: "Google Review", source: "Google Review", rating: 5 },
                ]}
            />

            {/* Private hire near local venues */}
            <section className="bg-surface py-section-y">
                <Container>
                    <SectionHeading
                        title="Private hire near local venues and landmarks"
                        lead="Find the most relevant private-hire page for your ceremony, workplace, sports club or family gathering."
                    />

                    <div className="mx-auto max-w-6xl space-y-10">
                        {landmarkGroups.map((group) => {
                            const groupLandmarks = landmarks.filter((landmark) => group.types.includes(landmark.type))

                            return (
                                <div key={group.title}>
                                    <div className="mb-4">
                                        <h3 className="font-display text-h4 text-ink-strong">{group.title}</h3>
                                        <p className="mt-2 text-ink-muted">{group.description}</p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {groupLandmarks.map((landmark) => (
                                            <Link
                                                key={landmark.slug}
                                                href={`/private-hire/near/${landmark.slug}`}
                                                className="group block h-full"
                                            >
                                                <div className="h-full rounded-md border border-line bg-surface p-5 transition-colors group-hover:border-accent">
                                                    <h4 className="font-semibold text-ink-strong">
                                                        {landmark.name}
                                                    </h4>
                                                    <p className="mt-2 text-sm text-ink-muted">
                                                        {landmark.distance} from The Anchor. {landmark.description}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Container>
            </section>

            <InternalLinkingSection
                title="Also explore"
                links={[
                    { href: '/our-pub', title: 'See Inside The Anchor', description: 'Photos of the bar, dining room, garden and games area' },
                    { href: '/function-room-hire', title: 'Function Room Hire', description: 'Room bookings for 10-50 guests; larger events by enquiry' },
                    { href: '/corporate-events', title: 'Corporate Events', description: 'Professional meeting rooms and business event packages' },
                    { href: '/join-our-team', title: 'Work at The Anchor', description: 'Bar and kitchen jobs near Heathrow' },
                ]}
                className="py-section-y"
            />

            <OrganicSearchClusterLinks
                cluster="privateRooms"
                currentPath="/private-hire"
                title="Plan a private room booking near Heathrow"
                intro="Compare room sizes, catering, meeting options and routes from Staines, Stanwell Moor and Heathrow before you enquire."
            />

            {/* Accessibility */}
            <section className="bg-canvas py-section-y">
                <Container>
                    <div className="mx-auto max-w-4xl">
                        <h2 className="mb-4 font-display text-h3 text-ink-strong">Accessibility</h2>
                        <p className="mb-3 text-ink-muted">
                            Step-free access to the bar, dining area and beer garden.
                        </p>
                        <p className="mb-4 text-ink-muted">
                            We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
                            <PhoneLink phone={CONTACT.phone} source="private-hire_accessibility" className="font-semibold text-accent-text hover:underline" showIcon={false} /> and we&apos;ll help.
                        </p>
                        <Link href="/accessibility" className="font-semibold text-accent-text hover:underline">
                            Full accessibility information &rarr;
                        </Link>
                    </div>
                </Container>
            </section>
        </>
    )
}
