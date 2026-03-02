import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { StatusBar } from '@/components/layout/StatusBar'
import { NextEventServer } from '@/components/NextEventServer'
import { Suspense, type CSSProperties } from 'react'
import { homepageFAQSchema } from '@/lib/enhanced-schemas'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { LazySection } from '@/components/LazySection'
import { HeroWrapper } from '@/components/hero'
import { ReviewSection } from '@/components/reviews'
import { PhoneLinksSection, QuickEnquiryLinks } from '@/components/homepage/PhoneLinksSection'
import { PhoneLink } from '@/components/PhoneLink'
import { BookTableButton } from '@/components/BookTableButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { DeferredHomepageTrackers } from '@/components/tracking/DeferredHomepageTrackers'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { getSeasonalHomepageImage, getSeasonalGreeting, getSeasonalAltText, getSeasonalFocal } from '@/lib/seasonal-utils'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { JsonLd } from '@/components/JsonLd'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_OG_IMAGE } from '@/lib/image-fallbacks'
import {
  Button,
  Card,
  CardBody,
  Container,
  Grid,
  GridItem,
  Alert,
  CTASection,
  SectionHeader,
  FeatureGrid,
  QuickInfoGrid,
  InfoBoxGrid,
  Section
} from '@/components/ui'

// Revalidate every 24 hours to ensure seasonal images update
export const revalidate = 60 * 60 * 24 // 24 hours

export const metadata: Metadata = {
  title: 'The Anchor | Pub Near Heathrow Airport | Free Parking & Dog Friendly | Stanwell Moor',
  description: 'Traditional British pub 7 minutes from Heathrow Terminal 5. Free parking for 20 cars, dog-friendly beer garden, Sunday roasts & stone-baked pizza. Highest-rated non-airport pub near Heathrow. Book a table today.',
  keywords: 'pub near heathrow, the anchor pub, stanwell moor pub, heathrow pub with free parking, dog friendly pub near heathrow, sunday roast near heathrow, staines pub',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'The Anchor | Pub Near Heathrow Airport | Free Parking & Dog Friendly',
    description: 'Traditional British pub 7 minutes from Heathrow Terminal 5. Free parking for 20 cars, dog-friendly beer garden, Sunday roasts & stone-baked pizza. Highest-rated non-airport pub near Heathrow.',
    url: '/',
    siteName: 'The Anchor',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'The Anchor pub in Stanwell Moor near Heathrow'
      }
    ],
    locale: 'en_GB',
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: 'The Anchor Pub | Stanwell Moor Near Heathrow & Staines',
    description: 'Free parking, Sunday roasts, stone-baked pizzas, and hosted events like Music Bingo with Nikki Manfadge. See /whats-on for the latest.',
    images: [DEFAULT_OG_IMAGE]
  })
}

// Lazy load non-critical components
const BusinessHours = dynamic(() => import('@/components/BusinessHours').then(mod => ({ default: mod.BusinessHours })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true
})

const GalleryImage = dynamic(() => import('@/components/GalleryImage').then(mod => ({ default: mod.GalleryImage })), {
  loading: () => <div className="aspect-square bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true
})

// Loading skeleton for NextEvent
function NextEventSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-100 rounded-2xl shadow-xl overflow-hidden h-[300px] animate-pulse"></div>
    </div>
  )
}


export default function HomePage() {
  // Get seasonal image configuration
  const seasonalImage = getSeasonalHomepageImage()
  const seasonalGreeting = getSeasonalGreeting(seasonalImage.season)
  const seasonalAltText = getSeasonalAltText(seasonalImage.season)
  const focal = getSeasonalFocal(seasonalImage.season)



  return (
    <>
      <DeferredHomepageTrackers />
      <SpeakableSchema />
      <JsonLd data={[parkingFacilitySchema]} />
      {/* Custom Hero Section with Seasonal Image */}
      <HeroWrapper
        route="/"
        variant="dark"
        titleClassName="text-5xl sm:text-5xl md:text-6xl lg:text-7xl"
        title={
          <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]">
            {seasonalGreeting}
          </span>
        }
        className="hero-focal"
        style={{
          '--hero-ox': `${focal.x}%`,
          '--hero-oy-mobile': `${focal.yMobile}%`,
          '--hero-oy-desktop': `${focal.yDesktop}%`
        } as CSSProperties}
        image={{
          src: seasonalImage.src,
          alt: seasonalAltText,
          priority: true,
          fallbackSrc: seasonalImage.fallback,
          blurDataURL: "data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQF/8QAGhAAAgMBAQAAAAAAAAAAAAAAAQIAAwQRIf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAZEQACAwEAAAAAAAAAAAAAAAACAwABMQT/2gAMAwEAAhEDEQA/ANOxLaMjPcVcr70CTruylQTmPeREIvZWFCfOotGp/9k="
        }}
        lead={
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/images/branding/the-anchor-pub-logo-white-transparent.png"
              alt="The Anchor logo - elegant anchor symbol with traditional British pub typography in white"
              width={320}
              height={320}
              sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
              className="mx-auto w-48 sm:w-64 lg:w-80 h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzAwNTEzMSIvPjwvc3ZnPg=="
            />

            <p className="text-2xl sm:text-3xl text-white font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Where Everyone&apos;s Welcome
            </p>

            <div className="flex justify-center px-2 sm:px-0 w-full">
              <StatusBar
                variant="hero"
                className="self-center"
              />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
              ⭐ Highest-rated non-airport pub in the Heathrow area
            </span>
          </div>
        }
        tags={[
          { label: 'Free Parking', icon: '🚗', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' },
          { label: 'Dog Friendly', icon: '🐕', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' },
          { label: 'Family Welcome', icon: '👨‍👩‍👧‍👦', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' },
          { label: 'Step-Free Access', icon: '♿', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' },
          { label: '7 mins from Heathrow', icon: '✈️', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' }
        ]}
        ctaContainerClassName="px-2 sm:px-0 max-w-md mx-auto"
        primaryCta={
          <BookTableButton
            source="homepage_hero"
            variant="primary"
            size="lg"
            fullWidth
            className="w-full"
          />
        }
        secondaryCta={
          <>
            <Link href="/food-menu" className="w-full">
              <Button variant="secondary" size="lg" fullWidth>
                🍽️ View Menu
              </Button>
            </Link>
            <Link href="#whats-coming-up" className="w-full">
              <Button variant="secondary" size="lg" fullWidth>
                🎟️ What&apos;s Coming Up
              </Button>
            </Link>
            <Link href="#heathrow-travellers" className="w-full">
              <Button variant="secondary" size="lg" fullWidth>
                ✈️ Heathrow Travellers
              </Button>
            </Link>
          </>
        }
        showStatusBar={false}
        showBreadcrumbs={false}
      />

      {/* Main Page Title for SEO */}
      <div className="bg-white pt-12 pb-8">
        <Container>
          <PageTitle
            className="text-center text-anchor-green"
            seo={{ structured: true, speakable: true }}
          >
            The Anchor - Stanwell Moor's Favourite Local Pub
          </PageTitle>
          <p className="text-center text-lg text-gray-700 mt-4">
            The closest traditional British pub to Heathrow Airport - just 7 minutes from Terminal 5
          </p>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">⭐ Top-rated non-airport pub near Heathrow (Google Reviews)</span>
            <span className="flex items-center gap-1">🚗 Free on-site parking (20 spaces)</span>
            <span className="flex items-center gap-1">💷 Pub classics £10–£20 – fair village prices near Heathrow</span>
            <span className="flex items-center gap-1">🏡 Independent village pub minutes from Heathrow – no terminal access needed</span>
            <span className="flex items-center gap-1">✈️ Horton Road plane-spotting area – fuel up before or after your flight</span>
            <span className="flex items-center gap-1">📍 Outside ULEZ Zone - save £12.50 daily</span>
          </div>

          <div className="mt-8">
            <div className="bg-anchor-cream/40 border border-anchor-cream rounded-2xl p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-anchor-green mb-3 text-center">Quick Reasons Guests Visit The Anchor</h2>
              <div className="grid gap-3 md:grid-cols-2 text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-anchor-gold">⏱️</span>
                  <span>7 minutes from Terminal 5, 11 minutes from Terminals 2 & 3</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-anchor-gold">🅿️</span>
                  <span>Free parking and easy taxi pick-up points for travellers</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-anchor-gold">🍽️</span>
                  <span>Stone-baked pizzas, Sunday roasts and daily pub classics</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-anchor-gold">🎉</span>
                  <span>Hosted nights like Music Bingo with Nikki Manfadge, plus one-off events (see /whats-on)</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* What's Coming Up */}
      <div id="whats-coming-up" className="bg-gray-50 section-spacing-md scroll-mt-24">
        <Container>
          <SectionHeader
            title="What&apos;s Coming Up at The Anchor"
            subtitle="Live updates from our events calendar"
          />
          <Suspense fallback={<NextEventSkeleton />}>
            <NextEventServer />
          </Suspense>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href="/whats-on">
              <Button variant="primary" size="lg">
                View All Events
              </Button>
            </Link>
            <Button asChild variant="ghost" size="sm">
              <a href="/api/calendar/upcoming">
                Add upcoming events to your calendar (.ics)
              </a>
            </Button>
          </div>
        </Container>
      </div>


      {/* What Makes Us Special */}
      <div className="bg-white section-spacing-md">
        <Container>
          <SectionHeader
            title="What Makes Us Special"
            subtitle="More than just a pub - we're the heart of the community"
          />

          <FeatureGrid
            columns={3}
            features={[
              {
                icon: "🤝",
                title: "Community Hub",
                description: "A gathering place for locals and visitors alike. From quiz nights to celebrations, we're where memories are made.",
                variant: "colored",
                color: "bg-anchor-sand/30",
                className: "card-warm p-8 text-center"
              },
              {
                icon: "🍽️",
                title: "Honest Food",
                description: "Traditional British pub classics. Famous Sunday roasts (pre-order required), fish & chips, burgers, and proper pub grub.",
                variant: "colored",
                color: "bg-anchor-sand/30",
                className: "card-warm p-8 text-center"
              },
              {
                icon: "🎉",
                title: "Events & Entertainment",
                description: (
                  <>
                    <Link href="/whats-on" className="text-anchor-gold hover:text-anchor-gold-light underline font-semibold">
                      Hosted nights like Music Bingo with Nikki Manfadge
                    </Link>{" "}
                    plus quiz nights and one-off events. See <span className="font-semibold">/whats-on</span> for the latest details.
                  </>
                ),
                variant: "colored",
                color: "bg-anchor-sand/30",
                className: "card-warm p-8 text-center"
              }
            ]}
            className="max-w-6xl mx-auto"
          />
        </Container>
      </div>

      {/* Key Information */}
      <div className="bg-anchor-cream section-spacing-md">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Everything You Need to Know"
            />

            <QuickInfoGrid
              columns={4}
              items={[
                {
                  icon: "📍",
                  title: "Location",
                  subtitle: (
                    <SpeakableContent selector="contact-info" priority="high">
                      Horton Road, Stanwell Moor<br />
                      Surrey TW19 6AQ<br />
                      <span className="text-anchor-gold font-semibold">7 mins from Heathrow T5</span>
                    </SpeakableContent>
                  )
                },
                {
                  icon: "🕐",
                  title: "Opening Hours",
                  subtitle: (
                    <SpeakableContent selector="opening-hours" priority="high">
                      Live hours shown above<br />
                      Including kitchen times<br />
                      <span className="text-sm sm:text-xs">May vary on holidays</span>
                    </SpeakableContent>
                  )
                },
                {
                  icon: "📞",
                  title: "Get in Touch",
                  subtitle: <PhoneLinksSection source="homepage_quickinfo" />
                },
                {
                  icon: "⭐",
                  title: "Key Features",
                  subtitle: (
                    <>
                      Free Parking<br />
                      Dog Friendly<br />
                      <span className="text-anchor-gold font-semibold">Great Events</span>
                    </>
                  )
                }
              ]}
            />

            <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
              <p className="text-center text-gray-700">
                <strong className="text-anchor-green">Important:</strong> Sunday roasts require pre-order by 1pm Saturday.
                Sunday lunch bookings require a £10 per person deposit. Regular menu available on Sundays without pre-order. Free parking for all guests.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Heathrow Travelers Section */}
      <div id="heathrow-travellers" className="bg-white section-spacing-md scroll-mt-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="✈️ Perfect for Heathrow Travelers"
              subtitle="Just 7-12 minutes from all terminals • Free parking • Real British experience"
            />

            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Why Stop at The Anchor?",
                  content: (
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <strong>Save Money:</strong> Airport food costs 2x more. Enjoy a proper meal for less.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-2xl">🚗</span>
                        <div>
                          <strong>Free Parking:</strong> No hourly charges, no stress. Stay as long as you like. Need longer term parking?{' '}
                          <Link href="/heathrow-parking" className="text-anchor-gold hover:text-anchor-gold-light underline">
                            Book our cheap Heathrow parking
                          </Link>{' '}
                          or{' '}
                          <Link href="/blog/cheap-heathrow-parking-alternatives" className="text-anchor-gold hover:text-anchor-gold-light underline">
                            read the savings guide
                          </Link>
                          .
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-2xl">🇬🇧</span>
                        <div>
                          <strong>Real Experience:</strong> Authentic British pub, not an airport chain.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-2xl">⏰</span>
                        <div>
                          <strong>Kill Time Comfortably:</strong> Much nicer than terminal seating.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-2xl">✈️</span>
                        <div>
                          <strong>Plane Spotting:</strong> <Link href="/beer-garden" className="text-anchor-gold hover:text-anchor-gold-light underline">Beer garden</Link> with aircraft every 90 seconds.
                        </div>
                      </li>
                    </ul>
                  ),
                  variant: "default"
                },
                {
                  title: "Journey Times by Car",
                  content: (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-semibold">Terminal 2 & 3</span>
                          <span className="text-anchor-gold font-bold">11 minutes</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-semibold">Terminal 4</span>
                          <span className="text-anchor-gold font-bold">12 minutes</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-semibold">Terminal 5</span>
                          <span className="text-anchor-gold font-bold">7 minutes</span>
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <Link href="/near-heathrow" className="block">
                          <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            <span className="hidden sm:inline">Get Directions From Your Terminal</span>
                            <span className="sm:hidden">Get Directions</span>
                          </Button>
                        </Link>
                      </div>
                    </>
                  ),
                  variant: "default"
                }
              ]}
              className="mb-12"
            />
          </div>
        </Container>
      </div>

      {/* Photo Gallery */}
      <div className="bg-gray-50 section-spacing-md">
        <Container>
          <SectionHeader
            title="Life at The Anchor"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Food Photo - Now First */}
            <GalleryImage
              src="/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg"
              alt="Traditional Sunday roast at The Anchor"
              caption="Famous Sunday Roasts - pre-order by 1pm Saturday (Sunday lunch bookings require a £10 per person deposit)"
              width={600}
              height={600}
            />

            {/* Event Photo - Now Second */}
            <GalleryImage
              src="/images/page-headers/private-hire/private-hire.jpg"
              alt="Private hire event at The Anchor"
              caption="Private Hire - Birthdays, Celebrations & Corporate"
              width={600}
              height={600}
              priority={false}
            />

            {/* Garden Photo */}
            <Link href="/beer-garden">
              <GalleryImage
                src="/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg"
                alt="Beer garden at The Anchor - plane spotting paradise"
                caption="Beer Garden & Plane Spotting"
                width={600}
                height={600}
                priority={false}
              />
            </Link>
          </div>
        </Container>
      </div>

      {/* Private Events Section */}
      <div className="bg-white section-spacing-md">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Host Your Event at The Anchor"
              subtitle="From intimate gatherings to grand celebrations"
            />

            <Grid cols={3} gap="lg" className="mb-12">
              <Link href="/corporate-events" className="group">
                <Card variant="default" className="h-full transition-all hover:shadow-lg hover:scale-105">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4">💼</div>
                    <h2 className="text-xl font-bold text-anchor-green mb-2 group-hover:text-anchor-gold">Corporate Events</h2>
                    <p className="text-gray-700 mb-4">
                      Professional venue for meetings, team building, and conferences.
                      7 minutes from Heathrow with free parking.
                    </p>
                    <p className="text-anchor-gold font-semibold">Learn more →</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/christmas-parties" className="group">
                <Card variant="default" className="h-full transition-all hover:shadow-lg hover:scale-105 bg-red-50">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4">🎄</div>
                    <h2 className="text-xl font-bold text-anchor-green mb-2 group-hover:text-anchor-gold">Christmas Parties</h2>
                    <p className="text-gray-700 mb-4">
                      Book your festive celebration now! Traditional menus,
                      festive atmosphere, and memorable celebrations.
                    </p>
                    <p className="text-anchor-gold font-semibold">Check availability →</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/private-party-venue" className="group">
                <Card variant="default" className="h-full transition-all hover:shadow-lg hover:scale-105 bg-pink-50">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4">🎉</div>
                    <h2 className="text-xl font-bold text-anchor-green mb-2 group-hover:text-anchor-gold">Private Parties</h2>
                    <p className="text-gray-700 mb-4">
                      Birthdays, anniversaries, and celebrations.
                      Flexible spaces, custom menus, your music.
                    </p>
                    <p className="text-anchor-gold font-semibold">Plan your party →</p>
                  </CardBody>
                </Card>
              </Link>
            </Grid>

            <Card variant="default" className="bg-anchor-cream">
              <CardBody>
                <Grid cols={2} gap="lg" align="center">
                  <div>
                    <h2 className="text-2xl font-bold text-anchor-green mb-4">Why Choose The Anchor?</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span><strong>Flexible venue hire pricing</strong> - tailored to your event</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span><strong>Free parking</strong> for all your guests</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span><strong>Flexible spaces</strong> for 10-200 guests</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span><strong>Custom catering</strong> to suit all budgets</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span><strong>Experienced team</strong> to handle every detail</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-gray-700 mb-6">
                      From business meetings to birthday parties,
                      we make your event special.
                    </p>
                    <Link href="/private-hire">
                      <Button
                        variant="primary"
                        size="lg"
                      >
                        Explore All Event Options
                      </Button>
                    </Link>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Quick enquiry?</strong>
                      </p>
                      <QuickEnquiryLinks />
                    </div>
                  </div>
                </Grid>
              </CardBody>
            </Card>
          </div>
        </Container>
      </div>

      {/* Customer Reviews */}
      <ReviewSection
        title="What Our Customers Say"
        subtitle="Real reviews from our guests"
        background="white"
        layout="carousel"
      />

      <FAQAccordionWithSchema
        className="bg-gray-50"
        title="Frequently Asked Questions"
        faqs={[
          {
            question: 'How far is The Anchor from Heathrow Airport?',
            answer: 'The Anchor is 7 minutes from Terminal 5 and approximately 11 minutes from Terminals 2, 3, and 4 by car or taxi. We are the closest traditional British pub to all Heathrow terminals. Our address is Horton Road, Stanwell Moor, Surrey TW19 6AQ.'
          },
          {
            question: 'Is there free parking at The Anchor?',
            answer: 'Yes — we have 20 free parking spaces for patrons with no time limit while you are dining or drinking with us. This saves you the high cost of airport parking. For longer-stay parking, we also offer pre-bookable Heathrow parking from £15/day.'
          },
          {
            question: 'Is The Anchor dog friendly?',
            answer: 'Absolutely. Dogs are welcome throughout The Anchor including our bar area and beer garden. We provide water bowls and your four-legged companions are always welcome.'
          },
          {
            question: 'What food does The Anchor serve?',
            answer: 'We serve traditional British pub food including stone-baked pizzas, fish & chips, burgers, and Sunday roasts. Sunday lunch must be pre-ordered by 1pm Saturday and requires a £10 per person deposit. Prices range from approximately £10–£20 for mains.'
          },
          {
            question: 'When is the kitchen open?',
            answer: 'Kitchen hours are updated live on our website. We serve food Tuesday to Friday evenings, Saturday and Sunday lunchtimes. Please check the opening hours section or call 01753 682707 for today\'s kitchen times. Note: the kitchen is closed on Mondays.'
          },
          {
            question: 'Can I watch planes from The Anchor?',
            answer: 'Yes — our beer garden sits directly under the Heathrow flight path. You can watch aircraft passing overhead every 90 seconds during peak times. It\'s a unique experience for aviation enthusiasts and families alike.'
          },
          {
            question: 'Is The Anchor family friendly?',
            answer: 'Yes, The Anchor is family friendly with a children\'s menu, spacious beer garden, and a welcoming atmosphere for families with young children. We have space for buggies and a relaxed daytime environment.'
          },
          {
            question: 'Can I book a table at The Anchor?',
            answer: 'Yes, you can book a table online via our booking system or by calling 01753 682707. Booking is strongly recommended for Sunday lunch (must be pre-ordered by Saturday 1pm) and for groups of 6 or more.'
          },
          {
            question: 'Does The Anchor have any special offers?',
            answer: 'We have Buy One Get One Free pizza every Tuesday and Wednesday, and 50% off fish & chips for over 65s on Fridays. We also host regular events including Music Bingo, quiz nights, and karaoke. See the What\'s On page for the latest details.'
          },
          {
            question: 'How do I get from Heathrow Terminal 5 to The Anchor?',
            answer: 'From Terminal 5, take a taxi (approximately £20-25, around 7 minutes) or drive via the A3044 towards Staines/Stanwell Moor and turn onto Horton Road. The 442 bus also runs from Heathrow Central Bus Station to Stanwell Moor.'
          }
        ]}
      />

      {/* Internal Links for SEO */}
      <InternalLinkingSection
        title="Explore More"
        links={commonLinkGroups.mainPages}
        className="section-spacing-md"
      />

      {/* Find Us Section */}
      <div id="visit-us" className="bg-anchor-green text-white section-spacing-lg">
        <Container>
          <div className="max-w-6xl mx-auto flex flex-col justify-center">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Come Visit Us!
              </h2>
            </div>

            <Grid cols={2} gap="lg" align="center">
              <div>
                <div className="bg-white/10 rounded-lg p-5 mb-4">
                  <h3 className="text-xl font-bold mb-3 text-white">📍 Find Us Here</h3>
                  <address className="not-italic text-base leading-relaxed">
                    The Anchor<br />
                    Horton Road<br />
                    Stanwell Moor<br />
                    Surrey TW19 6AQ
                  </address>
                </div>

                <div className="bg-white/10 rounded-lg p-5 mb-5">
                  <h3 className="text-xl font-bold mb-3 text-white">🚗 Getting Here</h3>
                  <ul className="space-y-1.5 text-base">
                    <li>✈️ Just 7 minutes from Heathrow Terminal 5</li>
                    <li>🚌 Bus routes 441 & 442 stop nearby</li>
                    <li>🚗 Free parking for all guests</li>
                    <li>♿ Step-free access to most areas</li>
                  </ul>
                </div>

                <DirectionsButton
                  href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
                  source="home_footer_cta"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
                >
                  Get Directions on Google Maps
                </DirectionsButton>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-3 text-white">🕐 Opening Hours</h3>
                <BusinessHours variant="condensed" showKitchen={true} />
              </div>
            </Grid>
          </div>
        </Container>
      </div>

      {/* LocalBusiness Schema for SEO */}


    </>
  )
}
