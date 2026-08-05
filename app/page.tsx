import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Utensils, Beef, Users, PartyPopper, PiggyBank, Plane, Heart, MapPin, Bus, SquareParking } from 'lucide-react'

import { Button, Card, CardBody, SectionHeading, Badge } from '@/components/ui'
import { AmenityStrip } from '@/components/AmenityStrip'
import { CtaBand } from '@/components/CtaBand'
import { WeekHours } from '@/components/WeekHours'
import { UpcomingEvents } from '@/components/events/UpcomingEvents'
import { EventSchema } from '@/components/seo/EventSchema'
import { getBusinessHoursSnapshot, getUpcomingEvents } from '@/lib/api'

import { HomeHero } from './_components/HomeHero'
import { HomeFaq } from './_components/HomeFaq'

import { BookTableButton } from '@/components/BookTableButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { DeferredHomepageTrackers } from '@/components/tracking/DeferredHomepageTrackers'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { JsonLd } from '@/components/JsonLd'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_OG_IMAGE } from '@/lib/image-fallbacks'
import { getSeasonalHomepageImage, getSeasonalAltText, getSeasonalFocal } from '@/lib/seasonal-utils'

// Revalidate every hour so live status, hours and events stay fresh.
export const revalidate = 60 * 60

export const metadata: Metadata = {
  title: 'Pub Food in Stanwell Moor | 7 Mins from Heathrow T5',
  description:
    'Proper pub food in Stanwell Moor, 7 minutes from Heathrow Terminal 5. Book a table for pub classics, pizzas, Sunday roasts and free customer parking.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'The Anchor Stanwell Moor | Pub Food Near Heathrow T5',
    description:
      'Proper pub food in Stanwell Moor, 7 minutes from Heathrow Terminal 5 with free parking, Sunday roast, events and private hire.',
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
    title: 'Pub Food in Stanwell Moor | 7 Mins from Heathrow T5',
    description:
      'Book a table for pub classics, stone-baked pizzas, Sunday roasts and relaxed local dining. Parking is free for guests while visiting us.',
    images: [DEFAULT_OG_IMAGE]
  })
}

const GOOGLE_MAPS_URL = 'https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ'

const PATH_CARDS = [
  {
    icon: Utensils,
    title: 'Eat with us',
    copy: 'Pub classics, stone-baked pizzas and fresh plates, minutes from Heathrow.',
    cta: 'View the menu',
    href: '/food-menu'
  },
  {
    icon: Beef,
    title: 'Sunday roast',
    copy: 'Roasts served every Sunday, 1pm to 6pm. Walk in or book ahead.',
    cta: 'See the roast',
    href: '/sunday-roast'
  },
  {
    icon: Users,
    title: 'Private hire',
    copy: 'Parties, wakes, christenings and work events in our flexible spaces.',
    cta: 'Plan your event',
    href: '/private-hire'
  },
  {
    icon: PartyPopper,
    title: "What's on",
    copy: 'Quiz nights, music bingo, karaoke and one-off events through the year.',
    cta: 'See the diary',
    href: '/whats-on'
  }
] as const

const SPECIAL_CARDS = [
  {
    icon: PiggyBank,
    title: 'Eat well, spend less',
    copy: 'Airport food costs twice as much. Enjoy a proper pub meal at fair village prices, 7 minutes from the terminals.'
  },
  {
    icon: Plane,
    title: 'Made for Heathrow trips',
    copy: 'A pre-flight meal, meeting arrivals or filling a layover. Free parking, luggage welcome, just 7 minutes from Terminal 5.'
  },
  {
    icon: Heart,
    title: 'Everyone is welcome',
    copy: 'A dog-friendly beer garden under the flight path, a children’s menu and a relaxed local welcome for the whole family.'
  }
] as const

const GALLERY = [
  {
    href: '/sunday-roast',
    src: '/images/food/sunday-roast/the-anchor-sunday-roast-hero.jpg',
    alt: 'Traditional Sunday roast at The Anchor',
    caption: 'Proper Sunday roasts'
  },
  {
    href: '/near-heathrow',
    src: '/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg',
    alt: 'Beer garden at The Anchor under the Heathrow flight path',
    caption: 'Beer garden and plane spotting'
  },
  {
    href: '/private-hire',
    src: '/images/page-headers/private-hire/private-hire.jpg',
    alt: 'Private hire event space at The Anchor',
    caption: 'Private hire and celebrations'
  }
] as const

// Server component: fetches the next three events, emits per-event schema (the
// presentational UpcomingEvents component does not), and renders the DS layout.
async function HomeUpcomingEvents() {
  let events: Awaited<ReturnType<typeof getUpcomingEvents>> = []
  try {
    events = (await getUpcomingEvents(3)) || []
  } catch {
    events = []
  }

  return (
    <>
      {events.map((event) => (
        <EventSchema key={event.id} event={event} />
      ))}
      <UpcomingEvents
        events={events}
        emptyState={
          <Card accent className="mx-auto max-w-[720px]">
            <CardBody className="text-center">
              <h3 className="font-display text-h4 text-ink-strong">More events coming soon</h3>
              <p className="mt-2 text-ink-muted">
                Check back shortly, or see the full diary for everything we have planned.
              </p>
            </CardBody>
          </Card>
        }
      />
    </>
  )
}

function UpcomingEventsSkeleton() {
  return (
    <div className="mx-auto h-[280px] max-w-[920px] animate-pulse rounded-md border border-line bg-surface-sunk" />
  )
}

export default async function HomePage() {
  const seasonalImage = getSeasonalHomepageImage()
  const seasonalAltText = getSeasonalAltText(seasonalImage.season)
  const focal = getSeasonalFocal(seasonalImage.season)
  // Fetched on the server so the seven-day table ships in the initial HTML rather
  // than the "loading" fallback. The cached snapshot keeps this page on ISR;
  // returns null on failure, which WeekHours handles.
  const businessHours = await getBusinessHoursSnapshot()

  return (
    <>
      <DeferredHomepageTrackers />
      <SpeakableSchema />
      <JsonLd data={[parkingFacilitySchema]} />

      {/* 1 — Home hero (the only special hero, spec §7.1) */}
      <HomeHero
        image={seasonalImage.src}
        imageAlt={seasonalAltText}
        focal={`${focal.x}% ${focal.yDesktop}%`}
      />

      {/* 2 — Amenity strip */}
      <AmenityStrip />

      {/* 3 — Path cards */}
      <section className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            kicker="Stanwell Moor Village"
            title="What are you here for?"
            lead="Whatever brings you in, we will make you feel at home. Pick a starting point."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PATH_CARDS.map(({ icon: Icon, title, copy, cta, href }) => (
              <Link key={title} href={href} className="group block h-full">
                <Card accent hover className="flex h-full flex-col">
                  <CardBody className="flex flex-1 flex-col">
                    <span
                      aria-hidden
                      className="flex h-[52px] w-[52px] items-center justify-center rounded-pill bg-anchor-sand text-anchor-green"
                    >
                      <Icon size={26} strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-4 font-display text-h4 text-ink-strong">{title}</h3>
                    <p className="mt-2 flex-1 text-ink-muted">{copy}</p>
                    <span className="mt-4 font-semibold text-accent group-hover:underline">
                      {cta} →
                    </span>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Coming up */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            kicker="What's on"
            script="Always something happening"
            title="Coming up at The Anchor"
            lead="Live from our events calendar, here is what is next at the pub."
          />
          <Suspense fallback={<UpcomingEventsSkeleton />}>
            <HomeUpcomingEvents />
          </Suspense>
          <div className="mt-10 flex justify-center">
            <Link href="/whats-on">
              <Button variant="primary" size="lg">
                View all events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5 — What makes us special */}
      <section className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            kicker="More than a pub"
            title="What makes us special"
            lead="A proper local with a few things you will not find at the airport."
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {SPECIAL_CARDS.map(({ icon: Icon, title, copy }) => (
              <Card key={title} accent hover className="h-full">
                <CardBody className="flex h-full flex-col text-center">
                  <span
                    aria-hidden
                    className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-pill bg-anchor-sand text-anchor-green"
                  >
                    <Icon size={26} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-display text-h4 text-ink-strong">{title}</h3>
                  <p className="mt-2 text-ink-muted">{copy}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — CTA band */}
      <CtaBand
        title="Ready to visit?"
        copy="Walk-ins are always welcome, but booking guarantees your spot."
        primary={<BookTableButton source="homepage_cta_band" variant="primary" size="lg">Book a table</BookTableButton>}
        secondary={
          <Link href="/food-menu">
            <Button variant="outline" size="lg">
              See the menu
            </Button>
          </Link>
        }
      />

      {/* 7 — Gallery */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            kicker="Life at The Anchor"
            title="Take a look around"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {GALLERY.map(({ href, src, alt, caption }) => (
              <Link key={href} href={href} className="group block">
                <Card hover className="h-full">
                  <div className="relative h-[240px] w-full overflow-hidden">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardBody className="py-4">
                    <p className="font-display text-h4 text-ink-strong group-hover:text-accent">
                      {caption}
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8 — FAQ */}
      <section className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            kicker="Good to know"
            title="Frequently asked questions"
          />
          <HomeFaq />
        </div>
      </section>

      {/* 9 — Find us */}
      <section id="visit-us" className="scroll-mt-24 bg-surface-sunk py-section-y">
        <div className="container">
          <SectionHeading
            kicker="Visit Us"
            script="Pop in and say hello"
            title="Ready for a proper pub near Heathrow?"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
            {/* Address + getting here */}
            <Card accent className="h-full">
              <CardBody className="flex h-full flex-col">
                <h3 className="font-display text-h4 text-ink-strong">Find us here</h3>
                <address className="mt-3 not-italic leading-relaxed text-ink-muted">
                  The Anchor<br />
                  Horton Road<br />
                  Stanwell Moor<br />
                  Surrey TW19 6AQ
                </address>

                <ul className="mt-6 space-y-3 text-ink-muted">
                  <li className="flex items-start gap-3">
                    <Plane size={20} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden />
                    <span>7 minutes from Heathrow Terminal 5</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Bus size={20} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden />
                    <span>Bus routes 441, 442 &amp; 555 stop nearby</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <SquareParking size={20} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden />
                    <span>20 free customer parking spaces</span>
                  </li>
                </ul>

                <div className="mt-auto pt-6">
                  <DirectionsButton
                    href={GOOGLE_MAPS_URL}
                    source="home_find_us"
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={18} strokeWidth={1.75} aria-hidden />
                      Get directions on Google Maps
                    </span>
                  </DirectionsButton>
                </div>
              </CardBody>
            </Card>

            {/* Map panel */}
            <div className="overflow-hidden rounded-md border border-line shadow-sm" style={{ minHeight: '360px' }}>
              <iframe
                title="Map showing The Anchor, Horton Road, Stanwell Moor, Surrey TW19 6AQ"
                src="https://www.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ&output=embed"
                className="h-full min-h-[360px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          {/* Opening hours + flight path */}
          <Card accent className="mt-6">
            <CardBody>
              <h3 className="font-display text-h4 text-ink-strong">Opening hours &amp; flight path</h3>
              <div className="mt-4">
                <WeekHours initialHours={businessHours} />
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </>
  )
}
