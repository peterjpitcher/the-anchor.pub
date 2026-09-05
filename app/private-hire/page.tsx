import Link from 'next/link'
import { Metadata } from 'next'
import { Briefcase, PartyPopper, Cake, Flower, Check, Phone, Baby, Church, Heart, Gift } from 'lucide-react'
import { InteriorHero } from '@/components/hero'
import { Container, SectionHeading, Button, Badge } from '@/components/ui'
import { AmenityStrip } from '@/components/AmenityStrip'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { PhoneLink } from '@/components/PhoneLink'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BrochureDownload } from '@/components/features/PrivateHire/BrochureDownload'
import { TestimonialSection } from '@/components/TestimonialSection'
import { getReviewsByTopic } from '@/lib/google-reviews'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { getCateringData, getLowestFoodPrice } from '@/lib/api/catering-packages'
import { VenueSpacesTable } from '@/components/features/VenueSpacesTable'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { landmarks, type LandmarkType } from '@/lib/local-seo-data'
import { PRIVATE_HIRE_CAPACITY, PRIVATE_HIRE_CAPACITY_SUMMARY } from '@/lib/private-hire-capacity'
import { OccasionCard } from './_components/OccasionCard'
import { CateringPackagesCard } from './_components/CateringPackagesCard'
import {
    InteractiveVenueFloorPlan,
    isVenueTourEventType,
    isVenueTourSpaceId,
} from '@/components/private-hire/venue-tour'

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
        title: 'Christenings and ceremonies',
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
        href: '/private-hire/milestone-birthdays',
        icon: Cake,
        title: 'Birthdays and private parties',
        description: 'Milestone birthdays, anniversaries and reunions with food, drinks and space to celebrate.',
    },
    {
        href: '/private-hire/wakes',
        icon: Flower,
        title: 'Wakes and memorials',
        description: 'A quiet, private room near local crematoriums, with respectful service and full catering.',
    },
    // The five below were missing from this list, so each occasion page sat on
    // a single inbound link while the hub they belong to had over a hundred.
    // Engagement parties and christenings both have measured search demand.
    {
        href: '/private-hire/engagement-parties',
        icon: Heart,
        title: 'Engagement parties',
        description: 'Celebrate the news with the people who matter, in a room that is yours for the evening.',
    },
    {
        href: '/private-hire/christenings',
        icon: Church,
        title: 'Christenings and naming days',
        description: 'A short drive from local churches, with space for the whole family after the service.',
    },
    {
        href: '/private-hire/baby-showers',
        icon: Baby,
        title: 'Baby showers',
        description: 'A relaxed private room for an afternoon of food, games and family.',
    },
    {
        href: '/private-hire/gender-reveal',
        icon: Gift,
        title: 'Gender reveals',
        description: 'Somewhere to gather everyone for the moment, with food and drinks sorted.',
    },
    {
        href: '/private-hire/retirement-parties',
        icon: Cake,
        title: 'Retirement parties',
        description: 'Send someone off properly, with a buffet and a room that fits the whole team.',
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

const roomSetups = [
    { title: 'Banquet', capacity: 'Dining room seats 26', desc: 'A seated dining set-up for meals and celebrations' },
    { title: 'Boardroom', capacity: 'Dining room seats 26', desc: 'A meeting-table layout for discussions and presentations' },
    { title: 'Cocktail reception', capacity: 'Main area up to 150 standing', desc: 'A standing reception for larger gatherings' },
    { title: 'Theatre', capacity: 'Confirmed on enquiry', desc: 'Forward-facing seating for presentations' },
    { title: 'Classroom', capacity: 'Confirmed on enquiry', desc: 'Tables and chairs for training or workshops' },
    { title: 'Cabaret', capacity: 'Confirmed on enquiry', desc: 'Social seating arranged around a presentation area' },
]

const privateHireFaqs = [
    {
        question: 'How much does it cost to hire a function room at The Anchor?',
        answer: 'Room hire is discussed on enquiry and depends on your date, space and catering. A £250 deposit secures a private hire booking, and buffet prices are confirmed from the live menu when you enquire.',
    },
    {
        question: 'Do you have a private room for hire near Heathrow?',
        answer: 'Yes. Our dining room seats 26 or holds up to 50 standing, with French doors onto the beer garden. The main area suits bigger groups, and exclusive hire of the whole pub covers up to 119 seated or 300 standing.',
    },
    {
        question: 'How many guests can you host?',
        answer: 'Private hire works from 10 guests up to 150, with full-venue exclusive hire for larger events by enquiry. Tell us your numbers and we will suggest the right space.',
    },
    {
        question: 'Can you host corporate events and meetings?',
        answer: 'Yes. We host meetings, training days and team meals with AV equipment, free WiFi and VAT invoicing, around 7 minutes from Heathrow Terminal 5 and 2 minutes from M25 Junction 14.',
    },
    {
        question: 'Is there parking for private hire guests?',
        answer: 'Around 20 free spaces on site, with no charge while you visit. Ask in advance if anyone needs to leave a car overnight.',
    },
    {
        question: 'Can you arrange a wake at short notice?',
        answer: 'Yes. We accept wake bookings at 24 to 48 hours’ notice where we can, with a private entrance area and a quiet, self-contained room.',
    },
    {
        question: 'What kinds of events do you host?',
        answer: 'Wakes and memorials, christenings, engagement parties, baby showers, gender reveals, retirement parties, milestone birthdays, summer garden parties, corporate events, Christmas parties and private parties.',
    },
]

export async function generateMetadata(): Promise<Metadata> {
    const { foodPackages } = await getCateringData()
    const fromPrice = getLowestFoodPrice(foodPackages)
    // Kept under 160 characters so the whole line survives in the search result.
    const buffetPhrase = fromPrice ? ` Buffets from ${fromPrice}pp.` : ''
    const desc = `Function room hire near Heathrow and Staines for ${PRIVATE_HIRE_CAPACITY.recommendedRange}. Wakes, parties, meetings and family events, with free parking.${buffetPhrase}`

    const title = 'Function Room Hire Near Heathrow & Staines'

    return {
        title,
        description: desc,
        openGraph: {
            title,
            description: desc,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title,
            description: desc,
            images: [DEFAULT_CORPORATE_IMAGE]
        }),
        alternates: {
            canonical: '/private-hire'
        }
    }
}

interface PrivateHirePageProps {
    searchParams?: {
        space?: string | string[]
        event?: string | string[]
    }
}

export default async function PrivateHirePage({ searchParams }: PrivateHirePageProps) {
    const requestedSpace = Array.isArray(searchParams?.space)
        ? searchParams?.space[0]
        : searchParams?.space
    const initialSpaceId = isVenueTourSpaceId(requestedSpace) ? requestedSpace : undefined
    const requestedEvent = Array.isArray(searchParams?.event)
        ? searchParams?.event[0]
        : searchParams?.event
    const eventType = isVenueTourEventType(requestedEvent) ? requestedEvent : 'Other'

    // Capacities come from the management app, which is the only true source for
    // them. Never hardcode a capacity here.
    const { spaces: venueSpaces } = await getCateringData()

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
                title="Function Room Hire Near Heathrow & Staines"
                lead="Private hire for 10+ to 150 guests in Stanwell Moor, near Staines and Heathrow. Free parking, custom catering, and a team that plans it with you."
                badges={
                    <>
                        <Badge variant="sand">10+ to 150 guests</Badge>
                        <Badge variant="sand">Free parking</Badge>
                        <Badge variant="sand">Custom catering</Badge>
                    </>
                }
                actions={
                    <>
                        <Button asChild variant="primary" size="lg" fullWidth>
                            <Link href="/private-hire#enquiry">
                                Get an event quote
                            </Link>
                        </Button>
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

            <AmenityStrip/>

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
                                <Button asChild variant="primary" size="lg">
                                    <Link href="/private-hire#enquiry">
                                        Start your enquiry
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <CateringPackagesCard/>
                    </div>
                </Container>
            </section>

            <section className="bg-canvas py-section-y">
                <Container>
                    <SectionHeading
                        kicker="Explore the venue"
                        script="Take a look around"
                        title="Find the right space for your event"
                        lead="Use the floor plan to compare our private spaces and open real photos from around the pub."
                    />
                    <InteractiveVenueFloorPlan
                        source="private_hire_page"
                        initialSpaceId={initialSpaceId}
                        eventType={eventType}
                    />
                </Container>
            </section>

            {/* Room set-ups */}
            <section className="bg-surface py-section-y">
                <Container>
                    <SectionHeading
                        kicker="Layouts"
                        title="Configure the space your way"
                        lead="Six ways to set the room, from a seated dinner to a standing reception. We arrange the layout before you arrive."
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {roomSetups.map(setup => (
                            <div key={setup.title} className="rounded-md border border-line bg-canvas p-5">
                                <h3 className="font-semibold text-ink-strong">{setup.title}</h3>
                                <p className="mt-1 text-sm font-semibold text-accent-text">{setup.capacity}</p>
                                <p className="mt-2 text-sm text-ink-muted">{setup.desc}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {venueSpaces.length > 0 && (
                <section className="bg-canvas py-section-y">
                    <Container>
                        <SectionHeading
                            kicker="Spaces"
                            title="What each space holds"
                            lead="Live capacities and hire rates, straight from our booking system, so what you read here is what we actually have."
                        />
                        <VenueSpacesTable spaces={venueSpaces} />
                    </Container>
                </section>
            )}

            <CtaBand
                title="Let's plan your event"
                copy="Tell us your date, guest count and the kind of day you have in mind, and we'll build a quote for you."
                primary={
                    <Button asChild variant="primary" size="lg">
                        <Link href="/private-hire#enquiry">
                            Get a quote
                        </Link>
                    </Button>
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

            <BrochureDownload brochure="general" source="private_hire_hub" />

            {/* Existing enquiry form (logic preserved) */}
            <PrivateBookingSection
                id="enquiry"
                eventType={eventType}
                initialSpaceId={initialSpaceId}
                showVenueTourLink={false}
                title="Build a quote, then enquire about your date"
                subtitle="Choose your event type, preferred date, guest count, timing and food options. We confirm whether the date is free when we reply."
            />

            {/* Real Google reviews from lib/google-reviews.ts. Replaced four
                fabricated quotes on 15 August 2026, one of which was attributed
                to an author literally named "Google Review". */}
            <TestimonialSection
                variant="full"
                title="What our guests say"
                subtitle="From our Google reviews"
                className="bg-canvas py-section-y"
                reviews={getReviewsByTopic('private-hire', 4)}
            />

            {/* Private hire near local venues */}
            <section className="bg-surface py-section-y">
                <Container>
                    <SectionHeading
                        title="Private hire near local venues and landmarks"
                        lead="Find the most relevant private-hire page for your ceremony, workplace, sports club or family gathering."
                    />

                    <div className="mx-auto space-y-10">
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
                    { href: '/private-hire/brochures', title: 'All 2026 Event Brochures', description: 'Nine brochures by occasion, with every space, menu and package' },
                    { href: '/our-pub', title: 'See Inside The Anchor', description: 'Photos of the bar, dining room, garden and games area' },
                    { href: '/private-hire/wakes', title: 'Wakes & Memorials', description: 'A quiet private room with a private entrance and short-notice bookings' },
                    { href: '/private-hire/anniversary-parties', title: 'Anniversary Parties', description: 'Milestone celebrations with food, drinks and free parking' },
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

            {/* FAQs */}
            <section className="bg-surface py-section-y">
                <Container>
                    <div className="mx-auto">
                        <SectionHeading
                            kicker="Questions"
                            title="Private hire FAQs"
                        />
                        <FAQAccordionWithSchema faqs={privateHireFaqs} />
                    </div>
                </Container>
            </section>

            {/* Accessibility */}
            <section className="bg-canvas py-section-y">
                <Container>
                    <div className="mx-auto">
                        <h2 className="mb-4 font-display text-h3 text-ink-strong">Accessibility</h2>
                        <p className="mb-3 text-ink-muted">
                            The bar and dining area are step-free. The beer garden has steps from the bar, with a ramp available on request.
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
