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

export const metadata: Metadata = {
    title: 'Private Hire Venue Near Heathrow | The Anchor Stanwell Moor',
    description: 'The Anchor is a premier private hire venue near Heathrow for wakes, christenings, weddings, and parties. Flexible spaces, free parking, and custom catering.',
    openGraph: {
        title: 'Private Hire Venue Near Heathrow | The Anchor',
        description: 'Flexible event spaces for all occasions. Free parking, custom menus, and dedicated planners.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
        title: 'Private Hire Venue Near Heathrow | The Anchor',
        description: 'Flexible event spaces for all occasions. Free parking, custom menus, and dedicated planners.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire'
    }
}

export default function PrivateHirePage() {
    return (
        <>
            <HeroWrapper
                route="/private-hire"
                title="Private Hire & Events"
                description="Private rooms for 10–200 guests · Free parking for all · Buffet packages available · 7 mins from Heathrow"
               
                tags={[
                    { label: "7 Mins from Heathrow", variant: "success" },
                    { label: "Free Parking", variant: "default" },
                    { label: "10-200 Guests", variant: "default" },
                    { label: "Private Catering", variant: "success" }
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
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <PageTitle className="text-center mb-8" seo={{ structured: true, speakable: true }}>
                        Your Event, Your Space — Private Hire at The Anchor
                    </PageTitle>

                    <div className="flex justify-center mb-10">
                        <p className="text-sm text-anchor-cream-text/70">⭐⭐⭐⭐⭐ <strong>Rated 4.6/5 on Google</strong> · Trusted for private events near Heathrow</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {/* Wakes */}
                        <Link href="/private-hire/wakes" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/wakes.png"
                                        alt="Respectful wake gathering"
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
                                        src="/images/private-hire/christenings.png"
                                        alt="Christening celebration"
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

                        {/* Weddings */}
                        <Link href="/private-hire/weddings" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/weddings.png"
                                        alt="Wedding reception toast"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition-colors">Weddings & Engagements</h3>
                                    <p className="text-anchor-cream-text/70 mb-4">From engagement parties to day-after brunches. The perfect spot for pre and post-wedding gatherings.</p>
                                    <span className="text-anchor-gold font-semibold text-sm flex items-center gap-1">
                                        View Wedding Events <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Parties */}
                        <Link href="/private-party-venue" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/parties.png"
                                        alt="Private party celebration"
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
                                        src="/images/private-hire/baby-showers.png"
                                        alt="Baby shower celebration"
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
                                        src="/images/private-hire/corporate.png"
                                        alt="Professional corporate meeting"
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

            <PrivateBookingSection id="enquiry" eventType="Other" />

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
                                description: "Exclusive bar options available for private function room hire.",
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
