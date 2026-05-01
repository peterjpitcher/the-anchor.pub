import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { StatusBar } from '@/components/layout/StatusBar'
import { NextEventServer } from '@/components/NextEventServer'
import { Suspense, type CSSProperties } from 'react'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { LazySection } from '@/components/LazySection'
import { HeroWrapper } from '@/components/hero'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'

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
import { getSundayRoastContent, SUNDAY_ROAST } from '@/lib/sunday-roast'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { getCurrentPromotion as getCurrentManagersSpecial, getPromotionImage } from '@/lib/managers-special'
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

// Revalidate every 1 hour for the walk-in launch fortnight (10–22 May 2026)
// so the LaunchAnnouncement banner flips reliably at the cutover even on
// cached pages. See spec §8.5.
// TODO(post-launch): revert to 60 * 60 * 24 (24 hours) after 22 May 2026.
export const revalidate = 60 * 60 // 1 hour during launch fortnight

export const metadata: Metadata = {
  title: 'Pub Near Heathrow T5 | Food, Sunday Roast & Events',
  description: 'Traditional pub 7 minutes from Heathrow Terminal 5 with free parking, pub food, Sunday roast, hosted events and private hire. Book a table at The Anchor.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'The Anchor Stanwell Moor | Pub Near Heathrow With Parking',
    description: 'Traditional pub 7 minutes from Heathrow Terminal 5 with free parking, pub food, Sunday roast, hosted events and private hire.',
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
    title: 'Pub Near Heathrow T5 | Food, Sunday Roast & Events',
    description: 'Free parking, pub food, Sunday roast, hosted events and private hire 7 minutes from Heathrow Terminal 5.',
    images: [DEFAULT_OG_IMAGE]
  })
}

// Lazy load non-critical components
const BusinessHours = dynamic(() => import('@/components/BusinessHours').then(mod => ({ default: mod.BusinessHours })), {
  loading: () => <div className="h-64 bg-anchor-bg-raised animate-pulse rounded-lg" />,
  ssr: true
})

const GalleryImage = dynamic(() => import('@/components/GalleryImage').then(mod => ({ default: mod.GalleryImage })), {
  loading: () => <div className="aspect-square bg-anchor-bg-raised animate-pulse rounded-lg" />,
  ssr: true
})

// Loading skeleton for NextEvent
function NextEventSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-anchor-bg-raised rounded-2xl shadow-xl overflow-hidden h-[300px] animate-pulse"></div>
    </div>
  )
}


export default function HomePage() {
  // Get seasonal image configuration
  const seasonalImage = getSeasonalHomepageImage()
  const seasonalGreeting = getSeasonalGreeting(seasonalImage.season)
  const seasonalAltText = getSeasonalAltText(seasonalImage.season)
  const focal = getSeasonalFocal(seasonalImage.season)
  const sunday = getSundayRoastContent()
  const managersSpecial = getCurrentManagersSpecial()
  const managersSpecialImage = managersSpecial ? getPromotionImage(managersSpecial.imageFolder) : null



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
            Proper pub food, Sunday roasts and events near Heathrow
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
        eyebrow={
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
        }
        lead={
          <div className="flex flex-col items-center gap-4">
            <p className="text-2xl sm:text-3xl text-white font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              The Anchor, Stanwell Moor
            </p>
            <p className="text-base sm:text-lg text-white/90 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] max-w-xl mx-auto text-center px-4">
              Seven minutes from Terminal 5 with free parking, traditional pub food, hosted nights and private hire.
            </p>

            <div className="flex justify-center px-2 sm:px-0 w-full">
              <StatusBar
                variant="hero"
                className="self-center"
              />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
              Rated 4.6/5 on Google · Highest-rated non-airport pub near Heathrow
            </span>
          </div>
        }
        showContextStrip={true}
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
          <Link href={SUNDAY_ROAST.bookingHref} className="w-full">
            <Button variant="secondary" size="lg" fullWidth>
              Book Sunday Roast
            </Button>
          </Link>
        }
        showStatusBar={false}
        showBreadcrumbs={false}
      />

      {/* Walk-in launch announcement (auto-hides at 18:00 BST on 17 May 2026) */}
      <div className="bg-anchor-bg-raised">
        <Container>
          <div className="py-3">
            <LaunchAnnouncement variant="hero" />
          </div>
        </Container>
      </div>

      <section className="bg-anchor-bg-card py-8 border-b border-anchor-gold/15">
        <Container>
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-anchor-cream-text">What are you here for?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Food today',
                  copy: 'Pub classics, pizza and drinks minutes from Heathrow.',
                  href: '/book-table?source=homepage_path_food&bookingType=food',
                  cta: 'Book a Table'
                },
                {
                  title: 'Sunday roast',
                  copy: sunday.isLive ? 'Served Sundays, 1pm to 6pm.' : 'Starts Sunday 17 May 2026.',
                  href: SUNDAY_ROAST.bookingHref,
                  cta: 'Book Sunday Roast'
                },
                {
                  title: 'What’s On',
                  copy: 'Quiz nights, music bingo, cash bingo and more.',
                  href: '/whats-on?source=homepage_path_events',
                  cta: 'Reserve Event Table'
                },
                {
                  title: 'Private hire',
                  copy: 'Parties, wakes, christenings and work events near Heathrow.',
                  href: '/private-hire?source=homepage_path_private_hire',
                  cta: 'Get Event Quote'
                }
              ].map((item) => (
                <Link key={item.title} href={item.href} className="block rounded-lg border border-anchor-gold/15 bg-anchor-bg-raised p-5 transition hover:border-anchor-gold/40">
                  <h3 className="text-lg font-bold text-anchor-cream-text">{item.title}</h3>
                  <p className="mt-2 min-h-[44px] text-sm text-anchor-cream-text/70">{item.copy}</p>
                  <p className="mt-4 text-sm font-semibold text-anchor-gold-vivid">{item.cta} →</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Main Page Title for SEO */}
      <div className="bg-anchor-bg-raised pt-12 pb-8 border-b border-anchor-gold/15">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            The Anchor -- Your Local Pub Near Heathrow in Stanwell Moor
          </PageTitle>
          <p className="text-center text-lg text-anchor-cream-text/70 mt-4">
            The Anchor is the closest traditional British pub to Heathrow Airport, located 7 minutes from Terminal 5 at Horton Road, Stanwell Moor, Surrey TW19 6AQ. With 20 free parking spaces, a dog-friendly beer garden under the flight path, and food served Tuesday to Sunday, it is the highest-rated independent pub near Heathrow.
          </p>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-anchor-cream-text/55">
            <span className="flex items-center gap-1">Top-rated non-airport pub near Heathrow (Google Reviews)</span>
            <span className="flex items-center gap-1">Free on-site parking (20 spaces)</span>
            <span className="flex items-center gap-1">Pub classics £10–£20 – fair village prices near Heathrow</span>
            <span className="flex items-center gap-1">Independent village pub minutes from Heathrow – no terminal access needed</span>
            <span className="flex items-center gap-1">Horton Road plane-spotting area – fuel up before or after your flight</span>
            <span className="flex items-center gap-1">Outside ULEZ Zone - save £12.50 daily</span>
          </div>

          <div className="mt-8">
            <div className="card-dark rounded-none p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-anchor-cream-text mb-3 text-center">Quick Reasons Guests Visit The Anchor</h2>
              <div className="grid gap-3 md:grid-cols-2 text-anchor-cream-text/70">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-anchor-gold-vivid"></span>
                  <span>7 minutes from Terminal 5, 11 minutes from Terminals 2 &amp; 3</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-anchor-gold-vivid"></span>
                  <span>Free parking and easy taxi pick-up points for travellers</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-anchor-gold-vivid"></span>
                  <span>Stone-baked pizzas, {sunday.isLive ? 'Sunday roasts' : 'Sunday roast from 17 May'} and daily pub classics</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-anchor-gold-vivid"></span>
                  <span>Hosted nights like Music Bingo with Nikki Manfadge, plus one-off events (see /whats-on)</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* What's Coming Up */}
      <div id="whats-coming-up" className="bg-anchor-bg section-spacing-md scroll-mt-24 border-b border-anchor-gold/15">
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
          </div>

          {/* Regular Events */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <Link href="/quiz-night" className="block p-4 bg-anchor-bg-raised rounded-lg text-center hover:bg-anchor-bg-raised/80 transition-colors">
              <span className="block text-lg font-bold text-anchor-cream-text">Quiz Night</span>
              <span className="text-sm text-anchor-body-text">Monthly &middot; Cash prizes</span>
            </Link>
            <Link href="/music-bingo" className="block p-4 bg-anchor-bg-raised rounded-lg text-center hover:bg-anchor-bg-raised/80 transition-colors">
              <span className="block text-lg font-bold text-anchor-cream-text">Music Bingo</span>
              <span className="text-sm text-anchor-body-text">Monthly &middot; With Nikki</span>
            </Link>
            <Link href="/karaoke" className="block p-4 bg-anchor-bg-raised rounded-lg text-center hover:bg-anchor-bg-raised/80 transition-colors">
              <span className="block text-lg font-bold text-anchor-cream-text">Karaoke</span>
              <span className="text-sm text-anchor-body-text">Monthly &middot; Free entry</span>
            </Link>
            <Link href="/sunday-lunch" className="block p-4 bg-anchor-green rounded-lg text-center hover:bg-anchor-green/90 transition-colors">
              <span className="block text-lg font-bold text-white">Sunday Lunch</span>
              <span className="text-sm text-white/80">{sunday.isLive ? 'From £19 · Walk in or book ahead' : 'Starts 17 May · Book ahead'}</span>
            </Link>
          </div>
        </Container>
      </div>


      {/* What Makes Us Special */}
      <div className="bg-anchor-bg-raised section-spacing-md border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="What Makes Us Special"
            subtitle="More than just a pub - we're the heart of the community"
          />

          <FeatureGrid
            columns={3}
            features={[
              {
                icon: "",
                title: "Eat Well, Spend Less",
                description: "Airport food costs twice as much. Enjoy a proper British pub meal from £10 — 7 minutes from the terminals, no terminal markup.",
                variant: "colored",
                color: "bg-anchor-sand/30",
                className: "card-warm p-8 text-center"
              },
              {
                icon: "",
                title: "Perfect for Heathrow Trips",
                description: "Pre-flight meal, meeting arrivals, or killing layover time. Free parking, luggage welcome, and just 7 minutes from Terminal 5.",
                variant: "colored",
                color: "bg-anchor-sand/30",
                className: "card-warm p-8 text-center"
              },
              {
                icon: "",
                title: "Bring the Whole Family",
                description: "Dog-friendly beer garden under the Heathrow flight path. Watch planes every 90 seconds. Kids and dogs both welcome.",
                variant: "colored",
                color: "bg-anchor-sand/30",
                className: "card-warm p-8 text-center"
              }
            ]}
            className="max-w-6xl mx-auto"
          />
          <div className="mt-10 text-center">
            <BookTableButton
              source="homepage_features_cta"
              variant="primary"
              size="lg"
            />
          </div>
        </Container>
      </div>

      {/* Key Information */}
      <div className="bg-anchor-bg-card section-spacing-md border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Everything You Need to Know"
            />

            <QuickInfoGrid
              columns={4}
              items={[
                {
                  icon: "",
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
                  icon: "",
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
                  icon: "",
                  title: "Get in Touch",
                  subtitle: <PhoneLinksSection source="homepage_quickinfo" />
                },
                {
                  icon: "",
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

            <div className="mt-8 p-6 card-dark">
              <p className="text-center text-anchor-cream-text/70">
                <strong className="text-anchor-gold-vivid">Sunday roast:</strong> {sunday.availabilityLong} Free parking for all guests.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Mid-page booking CTA */}
      <div className="bg-anchor-green py-8 text-center border-b border-anchor-green-dark">
        <Container>
          <div className="max-w-2xl mx-auto">
            <p className="text-white text-lg font-semibold mb-2">Ready to visit?</p>
            <p className="text-white/80 text-sm mb-5">Book your table online or call us — walk-ins welcome but booking guarantees your spot.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <BookTableButton
                source="homepage_mid_cta"
                variant="secondary"
                size="lg"
                className="bg-anchor-gold text-anchor-green hover:bg-anchor-gold-light"
              >
                Book a Table
              </BookTableButton>
              <Link href="/sunday-lunch">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border border-white/25">
                  {sunday.isLive ? 'Sunday Lunch — from £19' : 'Sunday Roast — starts 17 May'}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Heathrow Travellers Section */}
      <div id="heathrow-travellers" className="bg-anchor-bg-raised section-spacing-md scroll-mt-24 border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Perfect for Heathrow Travellers"
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
                        <span className="text-2xl"></span>
                        <div>
                          <strong>Save Money:</strong> Airport food costs 2x more. Enjoy a proper meal for less.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-2xl"></span>
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
                        <span className="text-2xl"></span>
                        <div>
                          <strong>Real Experience:</strong> Authentic British pub, not an airport chain.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-2xl"></span>
                        <div>
                          <strong>Kill Time Comfortably:</strong> Much nicer than terminal seating.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-2xl"></span>
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
                        <div className="flex justify-between items-center p-3 bg-anchor-bg rounded-lg border border-anchor-gold/15">
                          <span className="font-semibold">Terminal 2 & 3</span>
                          <span className="text-anchor-gold font-bold">11 minutes</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-anchor-bg rounded-lg border border-anchor-gold/15">
                          <span className="font-semibold">Terminal 4</span>
                          <span className="text-anchor-gold font-bold">12 minutes</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-anchor-bg rounded-lg border border-anchor-gold/15">
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
      <div id="life-at-anchor" className="bg-anchor-bg section-spacing-md border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Life at The Anchor"
          />

          <div className={`grid grid-cols-1 md:grid-cols-2 ${managersSpecialImage ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 max-w-6xl mx-auto`}>
            {/* Food Photo - Now First */}
            <Link href="/sunday-roast">
              <GalleryImage
                src="/images/food/sunday-roast/the-anchor-sunday-roast-hero.jpg"
                alt="Traditional Sunday roast at The Anchor"
                caption={sunday.isLive ? 'Famous Sunday Roasts — served 1pm–6pm, walk in or book ahead' : 'Sunday Roast — starts Sunday 17 May 2026'}
                width={600}
                height={600}
              />
            </Link>

            {managersSpecialImage && managersSpecial && (
              <Link href="/drinks/managers-special">
                <GalleryImage
                  src={managersSpecialImage}
                  alt={managersSpecial.promotion.heroAlt || `${managersSpecial.spirit.name} Manager's Special at The Anchor`}
                  caption={`${managersSpecial.promotion.headline} — ${managersSpecial.spirit.discount} ${managersSpecial.spirit.name}`}
                  width={600}
                  height={600}
                  priority={false}
                />
              </Link>
            )}

            {/* Event Photo - Now Second */}
            <Link href="/private-hire">
              <GalleryImage
                src="/images/page-headers/private-hire/private-hire.jpg"
                alt="Private hire event at The Anchor"
                caption="Private Hire - Birthdays, Celebrations & Corporate"
                width={600}
                height={600}
                priority={false}
              />
            </Link>

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

          {/* Food & Drink CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/our-pub">
              <Button variant="secondary" size="lg">
                Take a Look Around
              </Button>
            </Link>
            <Link href="/sunday-lunch">
              <Button variant="secondary" size="lg">
                {sunday.isLive ? 'Book Sunday Lunch — from £19' : 'Book Sunday Roast — starts 17 May'}
              </Button>
            </Link>
            <Link href="/drinks">
              <Button variant="secondary" size="lg">
                View Drinks Menu
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* Private Events Section */}
      <div className="bg-anchor-bg-raised section-spacing-md border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Host Your Event at The Anchor"
              subtitle="From intimate gatherings to grand celebrations"
            />

            <Grid cols={3} gap="lg" className="mb-12">
              <Link href="/corporate-events" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4"></div>
                    <h2 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">Corporate Events</h2>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Professional venue for meetings, team building, and conferences.
                      7 minutes from Heathrow with free parking.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">Learn more →</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/christmas-parties" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4"></div>
                    <h2 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">Christmas Parties</h2>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Book your festive celebration now! Traditional menus,
                      festive atmosphere, and memorable celebrations.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">Check availability →</p>
                  </CardBody>
                </Card>
              </Link>

              <Link href="/private-party-venue" className="group">
                <Card variant="default" className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <CardBody className="text-center">
                    <div className="text-4xl mb-4"></div>
                    <h2 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">Private Parties</h2>
                    <p className="text-anchor-cream-text/70 mb-4">
                      Birthdays, anniversaries, and celebrations.
                      Flexible spaces, custom menus, your music.
                    </p>
                    <p className="text-anchor-gold-vivid font-semibold">Plan your party →</p>
                  </CardBody>
                </Card>
              </Link>
            </Grid>

            <Card variant="default" className="bg-anchor-bg-card">
              <CardBody>
                <Grid cols={2} gap="lg" align="center">
                  <div>
                    <h2 className="text-2xl font-bold text-anchor-cream-text mb-4">Why Choose The Anchor?</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Flexible venue hire pricing</strong> - tailored to your event</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Free parking</strong> for all your guests</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Flexible spaces</strong> for {PRIVATE_HIRE_CAPACITY.recommendedRange}; larger events by enquiry</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Custom catering</strong> to suit all budgets</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span className="text-anchor-cream-text/70"><strong className="text-anchor-cream-text">Experienced team</strong> to handle every detail</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-anchor-cream-text/70 mb-6">
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
                      <p className="text-sm text-anchor-cream-text/55">
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

      <FAQAccordionWithSchema
        className="bg-anchor-bg"
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
            answer: `We serve traditional British pub food including stone-baked pizzas, fish & chips, burgers, and Sunday roast. ${sunday.availabilityShort} Prices range from approximately £10–£20 for mains; Sunday roast from £19.`
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
            answer: `Yes, you can book a table online via our booking system or by calling 01753 682707. Booking is recommended for groups of 6 or more and on Sunday afternoons. ${sunday.availabilityLong}`
          },
          {
            question: 'Does The Anchor have any special offers?',
            answer: `We host regular events including Music Bingo, quiz nights, and karaoke. We also serve stone-baked pizzas, classic pub dishes, and Sunday roast. ${sunday.availabilityShort} See the What's On page for the latest details.`
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
      <div id="visit-us" className="bg-anchor-bg-card section-spacing-lg border-t border-anchor-gold/25">
        <Container>
          <div className="max-w-6xl mx-auto flex flex-col justify-center">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-12 bg-anchor-gold/55" aria-hidden="true" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-anchor-gold-vivid">Visit Us</span>
                <span className="h-px w-12 bg-anchor-gold/55" aria-hidden="true" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-anchor-cream-text mb-4">
                Ready for a proper pub near Heathrow?
              </h2>
            </div>

            <Grid cols={2} gap="lg" align="center">
              <div>
                <div className="card-dark p-5 mb-4">
                  <h3 className="text-xl font-bold mb-3 text-anchor-gold-vivid">Find Us Here</h3>
                  <address className="not-italic text-base leading-relaxed text-anchor-cream-text/70">
                    The Anchor<br />
                    Horton Road<br />
                    Stanwell Moor<br />
                    Surrey TW19 6AQ
                  </address>
                </div>

                <div className="card-dark p-5 mb-5">
                  <h3 className="text-xl font-bold mb-3 text-anchor-gold-vivid">Getting Here</h3>
                  <ul className="space-y-1.5 text-base text-anchor-cream-text/70">
                    <li>Just 7 minutes from Heathrow Terminal 5</li>
                    <li>Bus routes 441 &amp; 442 stop nearby</li>
                    <li>Free parking for all guests</li>
                    <li>Step-free access to most areas</li>
                  </ul>
                </div>

                <DirectionsButton
                  href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
                  source="home_footer_cta"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Get Directions on Google Maps
                </DirectionsButton>
              </div>

              <div className="card-dark p-4">
                <h3 className="text-lg font-bold mb-3 text-anchor-gold-vivid">Opening Hours</h3>
                <BusinessHours />
              </div>
            </Grid>
          </div>
        </Container>
      </div>

      {/* LocalBusiness Schema for SEO */}


    </>
  )
}
