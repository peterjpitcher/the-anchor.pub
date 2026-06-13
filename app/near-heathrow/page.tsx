import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { Button, Badge, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { AmenityStrip } from '@/components/AmenityStrip'
import { CtaBand } from '@/components/CtaBand'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { SUNDAY_ROAST, getSundayRoastContent } from '@/lib/sunday-roast'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { JourneyTimesCard } from './_components/JourneyTimesCard'
import { WhyStopList } from './_components/WhyStopList'

const GOOGLE_MAPS_URL = 'https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ'

export function generateMetadata(): Metadata {
  const sunday = getSundayRoastContent()
  const sundayPhrase = sunday.isLive
    ? `Sunday roasts ${SUNDAY_ROAST.fromPriceLabel}`
    : `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}`

  const title = 'Pub Near Heathrow Airport | The Anchor, 7 Mins from T5'

  return {
    title,
    description: `The Anchor is a traditional pub near Heathrow Airport, 7 minutes from Terminal 5 with free parking, freshly made food, a dog-friendly beer garden, ${sundayPhrase} and table booking.`,
    openGraph: {
      title,
      description: 'The closest traditional pub to Heathrow Terminal 5, with pub food, WiFi, free customer parking, events and a dog-friendly beer garden.',
      images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
      title,
      description: `The closest traditional pub to Heathrow Terminal 5, with pub food, WiFi, free customer parking, events and ${sundayPhrase}.`,
      images: [DEFAULT_NEAR_HEATHROW_IMAGE]
    }),
    alternates: {
      canonical: '/near-heathrow'
    }
  }
}

export default function NearHeathrowPage() {
  const sunday = getSundayRoastContent()

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Near Heathrow', url: '/near-heathrow' }
        ]}
      />
      <SpeakableSchema />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parkingFacilitySchema) }}
      />

      {/* Hero — keyword-focused H1 retained (stronger for SEO than the prototype title). */}
      <InteriorHero
        image="/images/page-headers/near-heathrow/heathrow-airport-view.jpg"
        crumb="Near Heathrow"
        kicker="Stanwell Moor Village"
        title="The Anchor: Your Pub Near Heathrow Airport"
        lead="The closest Heathrow pub to Terminal 5, just 7 minutes away with free parking, freshly made food and a beer garden under the flight path."
        badges={
          <>
            <Badge variant="sand">7 mins from T5</Badge>
            <Badge variant="sand">20 free spaces</Badge>
            <Badge variant="sand">Outside ULEZ</Badge>
          </>
        }
        actions={
          <>
            <BookTableButton source="near_heathrow_hero" variant="primary" size="lg">
              Book a table
            </BookTableButton>
            <Link href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" icon={<MapPin className="h-5 w-5" strokeWidth={2} />}>
                Get directions
              </Button>
            </Link>
          </>
        }
      />

      <AmenityStrip />

      {/* Why stop — feature split: reasons list (left) + dark journey-times card (right). */}
      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="grid items-center gap-x-[clamp(2rem,5vw,4rem)] gap-y-10 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <SectionHeading
                align="left"
                kicker="Why stop with us"
                title="A better stop than the terminal"
                lead="Skip the airport queues and prices. We are minutes from every terminal, with room to relax before you fly or while you wait for arrivals."
                className="mb-0"
              />
              <WhyStopList />
            </div>
            <JourneyTimesCard />
          </div>
        </div>
      </section>

      {/* Beer garden feature — flipped split: text left, image right. Mobile: image first. */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="grid items-center gap-x-[clamp(2rem,5vw,4rem)] gap-y-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1 flex flex-col gap-6">
              <SectionHeading
                align="left"
                kicker="The beer garden"
                title="Planes overhead every 90 seconds"
                lead="Our beer garden sits directly under Heathrow's flight path. Aircraft pass roughly every 90 seconds at peak times, from 500 to 800 feet up. Full food and drink service runs during kitchen hours."
                className="mb-0"
              />
              <div className="flex flex-wrap gap-2">
                <Badge variant="sand">64 seats</Badge>
                <Badge variant="sand">Heated areas</Badge>
                <Badge variant="sand">Plane spotting</Badge>
              </div>
              <div>
                <BookTableButton source="near_heathrow_garden" variant="primary" size="lg">
                  Book a table
                </BookTableButton>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative h-[clamp(320px,42vw,480px)] w-full overflow-hidden rounded-md shadow-lg">
                <Image
                  src="/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg"
                  alt="The Anchor's beer garden under the Heathrow flight path, with an aircraft passing overhead"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <OrganicSearchClusterLinks
        cluster="pubsNearHeathrow"
        currentPath="/near-heathrow"
        title="Choose the right Heathrow pub page"
        intro="Use these pages for terminal-specific directions, Heathrow hotel alternatives and route planning."
      />

      {/* FAQ Section */}
      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <FAQAccordionWithSchema
              title="Frequently Asked Questions, Pub Near Heathrow"
              faqs={[
                {
                  question: "How far is The Anchor from Heathrow Airport?",
                  answer: "The Anchor is 7 minutes from Heathrow Terminal 5, approximately 11 minutes from Terminals 2 and 3, and 12 minutes from Terminal 4 by car. Our address is Horton Road, Stanwell Moor, Surrey TW19 6AQ."
                },
                {
                  question: "Is there free parking at The Anchor near Heathrow?",
                  answer: "Yes, The Anchor has 20 free parking spaces for patrons while you're visiting us. There are no time limits or fees while you're eating or drinking with us. For longer-stay airport parking, we also offer affordable pre-bookable parking from £15/day."
                },
                {
                  question: "How do I get from Heathrow Terminal 5 to The Anchor?",
                  answer: "From Terminal 5: Exit onto the A3044 and head towards Staines/Stanwell Moor. Turn into Horton Road, The Anchor is on the left. The journey takes approximately 7 minutes by taxi (around £20-25) or car."
                },
                {
                  question: "Can I eat at The Anchor before my flight?",
                  answer: "Absolutely. We serve a full British pub menu including stone-baked pizzas, burgers, fish & chips, and Sunday roasts. Walk-ins are welcome for Sunday roast, with booking recommended for larger groups. We're just minutes from Terminal 5, so you can enjoy a proper meal and still make your flight with time to spare."
                },
                {
                  question: "Is The Anchor dog friendly?",
                  answer: "Yes, The Anchor is dog friendly. Dogs are welcome in our beer garden, and well-behaved dogs on leads are welcome in the bar area. We provide water bowls for four-legged travellers too."
                },
                {
                  question: "Can I bring luggage to The Anchor?",
                  answer: "Yes, we have plenty of space for bags and suitcases. We offer safe luggage storage while you dine, so you can relax without worrying about your bags."
                },
                {
                  question: "How much does a taxi from Heathrow to The Anchor cost?",
                  answer: "A taxi from any Heathrow terminal to The Anchor typically costs £20-30 depending on the terminal and time of day. Tell your driver: The Anchor, Horton Road, Stanwell Moor, TW19 6AQ."
                },
                {
                  question: "Is The Anchor family friendly?",
                  answer: "Yes, The Anchor is family friendly with a dedicated children's menu, a spacious beer garden, and a relaxed atmosphere. Families with young children are welcome throughout the day."
                },
                {
                  question: "Can I book a table at The Anchor?",
                  answer: sunday.isLive
                    ? "Yes, you can book a table online or by calling us on 01753 682707. Walk-ins are welcome for Sunday roast (1pm-6pm); booking is recommended for larger groups."
                    : `Yes, you can book a table online or by calling us on 01753 682707. ${sunday.availabilityLong} Booking is recommended for launch Sundays and larger groups.`
                },
                {
                  question: "What terminal is closest to The Anchor pub?",
                  answer: "Terminal 5 is closest to The Anchor, just 7 minutes away by car or taxi. Terminals 2 and 3 are approximately 11 minutes away, and Terminal 4 is about 12 minutes. We're the nearest traditional village pub to all Heathrow terminals."
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Closing CTA band */}
      <CtaBand
        title="Flying soon? Pull in first."
        copy="Free parking, freshly made food and a beer garden minutes from every terminal. Book a table or take a look at the menu."
        primary={
          <BookTableButton source="near_heathrow_cta" variant="primary" size="lg">
            Book a table
          </BookTableButton>
        }
        secondary={
          <Link href="/food-menu">
            <Button variant="outline" size="lg">
              See the menu
            </Button>
          </Link>
        }
      />

      <InternalLinkingSection
        title="More for Heathrow visitors"
        links={[
          { href: '/restaurants-near-heathrow', title: 'Restaurants Near Heathrow', description: 'Proper pub food 7 minutes from Terminal 5, with free parking' },
          { href: '/sunday-roast', title: 'Sunday Roast Near Heathrow', description: 'Walk in for a freshly plated roast, served Sundays 1pm to 6pm' },
          { href: '/private-hire', title: 'Function Room Hire', description: 'Room bookings for 10 to 50 guests, no room-hire fee, free parking' },
          { href: '/blog/tag/heathrow', title: 'Heathrow Guides', description: 'Our guides for visitors and workers near Heathrow' },
          { href: '/heathrow-parking', title: 'Heathrow Parking', description: 'Parking options near Heathrow' },
          { href: '/find-us', title: 'Find Us', description: 'Directions and free parking' },
        ]}
      />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(parkingFacilitySchema)
        }}
      />
    </>
  )
}
