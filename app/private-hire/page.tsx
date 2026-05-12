import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, Button } from '@/components/ui'
import { PhoneButton } from '@/components/PhoneButton'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { getCateringData, getLowestFoodPrice } from '@/lib/api/catering-packages'
import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'
import { VenueSpacesTable } from '@/components/features/VenueSpacesTable'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { landmarks, type LandmarkType } from '@/lib/local-seo-data'
import { PRIVATE_HIRE_CAPACITY, PRIVATE_HIRE_CAPACITY_SUMMARY } from '@/lib/private-hire-capacity'

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

export async function generateMetadata(): Promise<Metadata> {
    const { foodPackages } = await getCateringData()
    const fromPrice = getLowestFoodPrice(foodPackages) || '£11' // fallback only if API returns no per-head food packages
    const desc = `Book private rooms near Staines and Heathrow for wakes, parties, meetings and family events. ${PRIVATE_HIRE_CAPACITY.summary} Buffets from ${fromPrice}pp, free parking, and a dedicated events team.`

    return {
        title: 'Private Rooms Near Staines & Heathrow | Event Venue',
        description: `${desc} The Anchor, Stanwell Moor.`,
        openGraph: {
            title: 'Private Rooms Near Staines & Heathrow | The Anchor',
            description: desc,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title: 'Private Rooms Near Staines & Heathrow | The Anchor',
            description: desc,
            images: [DEFAULT_CORPORATE_IMAGE]
        }),
        alternates: {
            canonical: '/private-hire'
        }
    }
}

export default async function PrivateHirePage() {
    const { foodPackages, drinkPackages, addonPackages, spaces } = await getCateringData()
    const fromPrice = getLowestFoodPrice(foodPackages) || '£11' // fallback only if API returns no per-head food packages

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
            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
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
            <HeroWrapper
                showContextStrip={true}
                route="/private-hire"
                title="Private Rooms and Party Venue Near Heathrow"
                description={`Room bookings for 10–50 guests · Larger events by enquiry · Free parking · Buffet packages from ${fromPrice}pp · 7 mins from Heathrow`}

                tags={[
                    { label: "7 Mins from Heathrow", variant: "success" },
                    { label: "Free Parking", variant: "default" },
                    { label: "10-50 Room Bookings", variant: "default" },
                    { label: `From ${fromPrice}pp`, variant: "success" }
                ]}
                primaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="private_hire_hero_primary"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Call to Discuss Your Event
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
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10–50 room bookings</span>
                    </div>
                }
            />

            <PrivateBookingSection id="enquiry" eventType="Other" />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <PageTitle className="text-center mb-8" seo={{ structured: true, speakable: true }}>
                        Private Rooms Near Staines and Heathrow, Function Room and Party Venue
                    </PageTitle>

                    <p className="text-center text-lg text-anchor-cream-text/70 mb-8 max-w-4xl mx-auto">
                        The Anchor is an independent function room and party venue in Stanwell Moor, 7 minutes from Heathrow Terminal 5. Whether you need a function room for a christening or a party venue for a milestone birthday, we host room bookings for 10 to 50 guests with {`buffet packages from ${fromPrice} per person`}, free parking for all, and a personal touch you won&apos;t get from a hotel. Larger events and full-venue hire are available by enquiry. Looking for venue hire near Staines? We&apos;re just a short drive away.
                    </p>

                    <div className="flex justify-center mb-10">
                        <p className="text-sm text-anchor-cream-text/70">⭐⭐⭐⭐⭐ <strong>Rated 4.6/5 on Google</strong> · Trusted for private events near Heathrow</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {/* Wakes */}
                        <Link href="/private-hire/wakes" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/wakes.jpg"
                                        alt="Wake venue at The Anchor near Heathrow"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition-colors">Wakes & Memorials</h3>
                                    <p className="text-anchor-cream-text/70 mb-4">Respectful, private reception spaces near local crematoriums. Fully catered with compassionate service.</p>
                                    <span className="text-anchor-gold font-semibold text-sm flex items-center gap-1">
                                        View Wake Packages <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Christenings */}
                        <Link href="/private-hire/christenings" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/christenings.jpg"
                                        alt="Christening venue at The Anchor near Heathrow"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition-colors">Christenings</h3>
                                    <p className="text-anchor-cream-text/70 mb-4">Celebrate your little one's special day with family. Relaxed buffet options and space for the kids.</p>
                                    <span className="text-anchor-gold font-semibold text-sm flex items-center gap-1">
                                        View Christening Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>


                        {/* Parties */}
                        <Link href="/private-party-venue" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/parties.jpg"
                                        alt="Private party venue at The Anchor near Heathrow"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition-colors">Private Parties</h3>
                                    <p className="text-anchor-cream-text/70 mb-4">Milestone birthdays, anniversaries, and family reunions. Dance floors, DJs, and great food.</p>
                                    <span className="text-anchor-gold font-semibold text-sm flex items-center gap-1">
                                        View Party Venue <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Baby Showers */}
                        <Link href="/private-hire/baby-showers" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/baby-showers.jpg"
                                        alt="Baby shower venue at The Anchor near Heathrow"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition-colors">Baby Showers</h3>
                                    <p className="text-anchor-cream-text/70 mb-4">Afternoon tea, mocktails, and plenty of space for games. The perfect daytime celebration.</p>
                                    <span className="text-anchor-gold font-semibold text-sm flex items-center gap-1">
                                        View Baby Showers <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Corporate (Linking to existing) */}
                        <Link href="/corporate-events" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/corporate.jpg"
                                        alt="Corporate event venue at The Anchor near Heathrow"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition-colors">Corporate Events</h3>
                                    <p className="text-anchor-cream-text/70 mb-4">Meetings, training days, and team lunches. AV equipment and fast WiFi included.</p>
                                    <span className="text-anchor-gold font-semibold text-sm flex items-center gap-1">
                                        View Corporate <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Private Hire Near Local Venues and Landmarks"
                        subtitle="Find the most relevant private-hire page for your ceremony, workplace, sports club or family gathering."
                    />

                    <div className="space-y-10 max-w-6xl mx-auto">
                        {landmarkGroups.map((group) => {
                            const groupLandmarks = landmarks.filter((landmark) => group.types.includes(landmark.type))

                            return (
                                <div key={group.title}>
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-bold text-anchor-gold-vivid">{group.title}</h3>
                                        <p className="mt-2 text-anchor-cream-text/70">{group.description}</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupLandmarks.map((landmark) => (
                                            <Link
                                                key={landmark.slug}
                                                href={`/private-hire/near/${landmark.slug}`}
                                                className="group block h-full"
                                            >
                                                <div className="h-full border border-anchor-gold/15 bg-anchor-bg-card p-5 transition-colors group-hover:border-anchor-gold/45">
                                                    <h4 className="font-bold text-anchor-gold-vivid group-hover:text-anchor-gold">
                                                        {landmark.name}
                                                    </h4>
                                                    <p className="mt-2 text-sm text-anchor-cream-text/70">
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

            {/* Pricing Bands */}
            <section id="pricing" className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Our Packages"
                            subtitle="Catering, drinks and venue hire to suit every occasion"
                        />

                        <div className="space-y-10">
                            <CateringPackagesTable
                                packages={foodPackages}
                                title="Food Packages"
                                subtitle="All prices per person unless stated"
                            />

                            <CateringPackagesTable
                                packages={drinkPackages}
                                title="Drink Packages"
                            />

                            <CateringPackagesTable
                                packages={addonPackages}
                                title="Extras"
                            />

                            {spaces.length > 0 && (
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-anchor-gold-vivid">Venue Hire</h3>
                                        <p className="text-sm text-anchor-cream-text/60 mt-1">Hourly rates, no minimum spend required</p>
                                    </div>
                                    <VenueSpacesTable spaces={spaces} />
                                </div>
                            )}
                        </div>

                        <p className="mt-8 text-sm text-anchor-cream-text/60 italic">
                            Sit-down meals and Sunday lunches are priced à la carte from our menu. Bespoke packages available, get in touch to discuss your requirements.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/private-hire#enquiry" className="w-full sm:w-auto">
                                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                    Get a Personalised Quote
                                </Button>
                            </Link>
                            <PhoneButton
                                phone="01753 682707"
                                source="private_hire_pricing_cta"
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto border-anchor-gold/30 text-anchor-cream-text hover:bg-anchor-bg-raised"
                            >
                                Call: 01753 682707
                            </PhoneButton>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Our Spaces */}
            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="Our Function Rooms"
                            subtitle="Flexible party venue spaces for 10 to 50 guests"
                        />
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-none">
                                <Image
                                    src="/images/dining-room/conservatory.jpg"
                                    alt="The Anchor private dining room set up for a function with views over the beer garden"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            <div className="relative aspect-[4/3] overflow-hidden rounded-none">
                                <Image
                                    src="/images/dining-room/dining-room.jpg"
                                    alt="The Anchor private dining room from the bar end, showing the full space set for a function"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                        <p className="text-center text-sm text-anchor-cream-text/50 mt-4">
                            Our main function room, seating for up to 26 guests with standing room for more, and French doors opening onto the beer garden.{' '}
                            <Link href="/our-pub" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid hover:underline">
                                View all venue photos &rarr;
                            </Link>
                        </p>
                    </div>
                </Container>
            </section>

            {/* How We Compare */}
            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="How We Compare"
                            subtitle="The Anchor vs a typical hotel venue"
                        />

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-anchor-gold/30">
                                        <th scope="col" className="py-3 pr-4 text-sm font-semibold text-anchor-gold-vivid">Feature</th>
                                        <th scope="col" className="py-3 pr-4 text-sm font-semibold text-anchor-gold-vivid">The Anchor</th>
                                        <th scope="col" className="py-3 text-sm font-semibold text-anchor-cream-text/50">Hotel Venue (typical)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-anchor-gold/10">
                                    <tr>
                                        <td className="py-3 pr-4 text-anchor-cream-text font-medium">Room hire</td>
                                        <td className="py-3 pr-4 text-anchor-cream-text">From &pound;25/hr</td>
                                        <td className="py-3 text-anchor-cream-text/50">&pound;500–&pound;2,000</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-anchor-cream-text font-medium">Catering per head</td>
                                        <td className="py-3 pr-4 text-anchor-cream-text">From {fromPrice}pp</td>
                                        <td className="py-3 text-anchor-cream-text/50">From &pound;35–&pound;55pp</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-anchor-cream-text font-medium">Parking</td>
                                        <td className="py-3 pr-4 text-anchor-cream-text">Free (20+ spaces)</td>
                                        <td className="py-3 text-anchor-cream-text/50">&pound;15–&pound;25/car</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-anchor-cream-text font-medium">Minimum guests</td>
                                        <td className="py-3 pr-4 text-anchor-cream-text">10</td>
                                        <td className="py-3 text-anchor-cream-text/50">50–80</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-anchor-cream-text font-medium">Late bar</td>
                                        <td className="py-3 pr-4 text-anchor-cream-text">Available</td>
                                        <td className="py-3 text-anchor-cream-text/50">Usually 11pm cutoff</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-anchor-cream-text font-medium">Bring your own decorations</td>
                                        <td className="py-3 pr-4 text-anchor-cream-text">Yes</td>
                                        <td className="py-3 text-anchor-cream-text/50">Restrictions apply</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-anchor-cream-text font-medium">Personalised service</td>
                                        <td className="py-3 pr-4 text-anchor-cream-text">Direct with manager</td>
                                        <td className="py-3 text-anchor-cream-text/50">Via events team</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Small Parties Welcome */}
            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="Small Parties Welcome"
                            subtitle="No minimum of 50 guests here, we love intimate gatherings"
                        />

                        <p className="text-lg text-anchor-cream-text/70 mb-8 max-w-3xl mx-auto">
                            Most hotel venues require 50 or more guests before they&apos;ll even take your call. At The Anchor, we welcome groups from just 10. Whether it&apos;s an intimate birthday dinner, a retirement lunch, a christening tea, or a small work gathering, we&apos;ll give your event the same care and attention as a larger celebration.
                        </p>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5 text-center">
                                <p className="text-2xl font-bold text-anchor-gold-vivid mb-1">10+</p>
                                <p className="text-sm text-anchor-cream-text/70">Birthday dinners</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5 text-center">
                                <p className="text-2xl font-bold text-anchor-gold-vivid mb-1">15+</p>
                                <p className="text-sm text-anchor-cream-text/70">Retirement lunches</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5 text-center">
                                <p className="text-2xl font-bold text-anchor-gold-vivid mb-1">20+</p>
                                <p className="text-sm text-anchor-cream-text/70">Christening teas</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5 text-center">
                                <p className="text-2xl font-bold text-anchor-gold-vivid mb-1">10+</p>
                                <p className="text-sm text-anchor-cream-text/70">Work gatherings</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Testimonials */}
            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title="What Our Guests Say"
                            subtitle="From Google Reviews"
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg p-6">
                                <p className="text-sm text-anchor-cream-text/55 mb-3">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
                                <p className="text-anchor-cream-text/80 italic mb-4">
                                    &ldquo;We had our baby&apos;s Baptism party at The Anchor. Billy and Peter made the whole event run so smoothly. The new conservatory room is amazing for any event. The buffet food was delicious, family and friends all commented on how lovely it was. Will definitely return for future family events.&rdquo;
                                </p>
                                <p className="text-sm text-anchor-cream-text/50">Rachel, TripAdvisor</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg p-6">
                                <p className="text-sm text-anchor-cream-text/55 mb-3">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
                                <p className="text-anchor-cream-text/80 italic mb-4">
                                    &ldquo;Hired the function room for my 50th. Staff sorted everything, the buffet was spot on and everyone had a great night. Could not have asked for more.&rdquo;
                                </p>
                                <p className="text-sm text-anchor-cream-text/50">Dave, Google Review</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg p-6">
                                <p className="text-sm text-anchor-cream-text/55 mb-3">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
                                <p className="text-anchor-cream-text/80 italic mb-4">
                                    &ldquo;Had our daughter&apos;s christening party here. They went above and beyond with the setup and the food was really impressive for the price. Everyone commented on how good the venue was.&rdquo;
                                </p>
                                <p className="text-sm text-anchor-cream-text/50">Priya, Google Review</p>
                            </div>
                            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg p-6">
                                <p className="text-sm text-anchor-cream-text/55 mb-3">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
                                <p className="text-anchor-cream-text/80 italic mb-4">
                                    &ldquo;Used The Anchor for our team Christmas lunch. Free parking was a huge bonus with 15 of us driving. Will definitely book again.&rdquo;
                                </p>
                                <p className="text-sm text-anchor-cream-text/50">Google Review</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* WhatsApp & Contact CTA */}
            <section className="section-spacing bg-anchor-green text-white border-b border-anchor-gold/15">
                <Container>
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Plan Your Event?</h2>
                        <p className="text-lg mb-8">
                            Get in touch to discuss your requirements. We&apos;ll put together a bespoke package that works for you.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20private%20hire%20at%20The%20Anchor"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto"
                            >
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-anchor-gold text-anchor-green hover:bg-anchor-gold-light border-anchor-gold">
                                    WhatsApp Us
                                </Button>
                            </Link>
                            <Link href="/private-hire#enquiry" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto border-anchor-gold text-anchor-gold hover:bg-anchor-gold hover:text-anchor-green">
                                    Enquire Online
                                </Button>
                            </Link>
                            <PhoneButton
                                phone="01753 682707"
                                source="private_hire_green_cta"
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto border-anchor-gold text-anchor-gold hover:bg-anchor-gold hover:text-anchor-green"
                            >
                                Call: 01753 682707
                            </PhoneButton>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Why Choose The Anchor?"
                        subtitle="We make event planning simple and stress-free"
                    />
                    <FeatureGrid
                        columns={3}
                        features={[
                            {
                                icon: "",
                                title: "Prime Location",
                                description: "Just minutes from the M25 and Heathrow, making it easy for all your guests to reach us.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Free Parking",
                                description: "Large on-site car park (20 spaces) completely free for your guests.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Accessible",
                                description: "Step-free access to the bar, dining area and beer garden.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Flexible Catering",
                                description: "From finger buffets to 3-course sit-down meals, tailored to your budget.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Private Bar",
                                description: "Exclusive bar options available with your function room hire.",
                                className: "text-center"
                            },
                            {
                                icon: "",
                                title: "Dedicated Team",
                                description: "Our event coordinators will handle every detail from start to finish.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <InternalLinkingSection
                title="Also Explore"
                links={[
                    { href: '/our-pub', title: 'See Inside The Anchor', description: 'Photos of the bar, dining room, garden and games area' },
                    { href: '/function-room-hire', title: 'Function Room Hire', description: 'Room bookings for 10-50 guests; larger events by enquiry' },
                    { href: '/corporate-events', title: 'Corporate Events', description: 'Professional meeting rooms and business event packages' },
                    { href: '/join-our-team', title: 'Work at The Anchor', description: 'Bar and kitchen jobs near Heathrow' },
                ]}
                className="section-spacing-md"
            />

            <OrganicSearchClusterLinks
                cluster="privateRooms"
                currentPath="/private-hire"
                title="Plan a private room booking near Heathrow"
                intro="Compare room sizes, catering, meeting options and routes from Staines, Stanwell Moor and Heathrow before you enquire."
            />

            <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-anchor-gold-vivid mb-4">Accessibility</h2>
                        <p className="text-anchor-cream-text/70 mb-3">
                            Step-free access to the bar, dining area and beer garden.
                        </p>
                        <p className="text-anchor-cream-text/70 mb-4">
                            We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
                            <a href="tel:+441753682707" className="text-anchor-gold font-semibold hover:underline">+44 1753 682707</a> and we&apos;ll help.
                        </p>
                        <Link href="/accessibility" className="text-anchor-gold font-semibold hover:underline">
                            Full accessibility information &rarr;
                        </Link>
                    </div>
                </Container>
            </section>
        </>
    )
}
