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
    description: `The Anchor is a traditional pub near Heathrow Airport, 7 minutes from Terminal 5. Free parking, freshly made pub food, ${sundayPhrase}, and a dog-friendly beer garden under the flight path. Outside the ULEZ zone.`,
    openGraph: {
      title,
      description: 'The closest traditional pub to Heathrow Terminal 5. Free customer parking, freshly made pub food, a dog-friendly beer garden under the flight path, and easy access from the M25 and every terminal.',
      images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
      title,
      description: `The closest traditional pub to Heathrow Terminal 5. Free parking, freshly made pub food, a dog-friendly beer garden under the flight path, and ${sundayPhrase}.`,
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

      {/* Hero: keyword-focused H1 retained (stronger for SEO than the prototype title). */}
      <InteriorHero
        image="/images/page-headers/near-heathrow/heathrow-airport-view.jpg"
        crumb="Near Heathrow"
        kicker="Stanwell Moor Village"
        title="The Anchor: Your Pub Near Heathrow Airport"
        lead="The closest proper pub to Heathrow Terminal 5, just 7 minutes by car. Free parking, freshly made pub food, and a beer garden right under the flight path. Outside the ULEZ zone, with easy access from the M25 and every terminal."
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

      {/* Why stop: feature split: reasons list (left) + dark journey-times card (right). */}
      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="grid items-center gap-x-[clamp(2rem,5vw,4rem)] gap-y-10 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <SectionHeading
                align="left"
                kicker="Why stop with us"
                title="One of the easiest places to eat near Heathrow"
                lead="Skip the terminal queues and the terminal prices. The Anchor is a traditional village pub minutes from every Heathrow terminal, with free parking and room to relax before you fly or while you wait for arrivals. We are a highly rated independent pub near Heathrow, around 7 minutes from Terminal 5, traffic dependent."
                className="mb-0"
              />
              <WhyStopList />
            </div>
            <JourneyTimesCard />
          </div>
        </div>
      </section>

      {/* Beer garden feature: flipped split: text left, image right. Mobile: image first. */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="grid items-center gap-x-[clamp(2rem,5vw,4rem)] gap-y-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1 flex flex-col gap-6">
              <SectionHeading
                align="left"
                kicker="The beer garden"
                title="Plane spotting under the flight path"
                lead="Our beer garden sits directly under Heathrow's southern approach path, which makes it one of the best things to do near Heathrow if you love watching aircraft. Planes pass roughly every 90 seconds at peak times, from 500 to 800 feet up. Pull up a chair with a drink or a plate of food, served the whole time the kitchen is open."
                className="mb-0"
              />
              <div className="flex flex-wrap gap-2">
                <Badge variant="sand">64 seats</Badge>
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
        title="Find your terminal"
        intro="Flying from a particular terminal? These pages give you door-to-door directions, taxi notes and Heathrow hotel alternatives for each one."
      />

      {/* FAQ Section */}
      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <FAQAccordionWithSchema
              title="Pub near Heathrow: your questions answered"
              faqs={[
                {
                  question: "How far is The Anchor from Heathrow Airport?",
                  answer: "The Anchor is the closest proper pub to Heathrow Terminal 5, about 7 minutes by car. Terminals 2 and 3 are roughly 11 minutes away and Terminal 4 about 12 minutes. We are 2 minutes from M25 Junction 14, so most terminals are 7 to 12 minutes door to door. Our address is Horton Road, Stanwell Moor, Surrey TW19 6AQ."
                },
                {
                  question: "What is the closest terminal to The Anchor pub?",
                  answer: "Terminal 5 is closest, about 7 minutes and 3.8 miles by car. Terminal 3 is around 11 minutes and 5.3 miles, Terminal 2 is about 11 minutes, and Terminal 4 is about 12 minutes. The Anchor is the nearest traditional village pub to Heathrow."
                },
                {
                  question: "Is there free parking at The Anchor near Heathrow?",
                  answer: "Yes. The Anchor has 20 free parking spaces for guests, with no fees and no time limit while you are eating or drinking with us. The car park is level and close to the entrance. If you need somewhere to leave the car while you fly, we also run separate pre-bookable airport parking, with rates and booking on our Heathrow parking page."
                },
                {
                  question: "How do I get from Heathrow Terminal 5 to The Anchor?",
                  answer: "From Terminal 5, head out onto the A3044 towards Stanwell Moor and Staines, then turn into Horton Road. The Anchor is on the left. It is a short 7-minute drive by car or taxi, and free parking is waiting when you arrive."
                },
                {
                  question: "Where can I eat near Heathrow before a flight?",
                  answer: "The Anchor is one of the easiest places to eat near Heathrow, just 7 minutes from Terminal 5. We serve freshly made pub food cooked to order, from stone-baked pizzas and burgers to fish and chips, with a vegan Wellington and a kids menu too. You will find everything, including live prices, on our food menu. With free parking and a relaxed dining room, you can have a proper meal and still make your flight with time to spare."
                },
                {
                  question: "Where is the best pub for plane spotting near Heathrow?",
                  answer: "Our beer garden sits directly under Heathrow's southern approach path, so aircraft pass overhead roughly every 90 seconds at peak times, from 500 to 800 feet up. You can sit with a drink or a plate of food and watch everything from A380s to Dreamliners come in to land. It is one of the best free things to do near Heathrow on a clear day."
                },
                {
                  question: "Is The Anchor dog friendly?",
                  answer: "Yes, The Anchor is dog friendly. Dogs are welcome in the beer garden, and well-behaved dogs on leads are welcome in the bar area. We keep water bowls and a few dog biscuits behind the bar for our four-legged guests."
                },
                {
                  question: "Can I bring luggage to The Anchor?",
                  answer: "Yes. We have room for bags and suitcases, and we offer luggage storage while you eat or drink, so you can relax before or after a flight without minding your cases."
                },
                {
                  question: "Is The Anchor family friendly?",
                  answer: "Yes, The Anchor is family friendly. There is a dedicated kids menu, plenty of space in the beer garden, and children are welcome throughout the day with no age cut-off. Buggies are no problem."
                },
                {
                  question: "Do you serve Sunday roast near Heathrow?",
                  answer: sunday.isLive
                    ? "Yes. Our Sunday roast is served every Sunday from 1pm to 6pm, just 7 minutes from Terminal 5. Walk-ins are welcome the whole way through, with the last seating at 5:30pm, and you can see the full line-up and live prices on our Sunday roast page. For groups of 10 or more we ask for a small deposit per person, which comes off your bill."
                    : `Yes. Our Sunday roast is served every Sunday from 1pm to 6pm, just 7 minutes from Terminal 5. ${sunday.availabilityLong} You can see the full line-up and live prices on our Sunday roast page.`
                },
                {
                  question: "Can I book a table at The Anchor?",
                  answer: sunday.isLive
                    ? "Yes, you can book a table online or by calling us on 01753 682707. Walk-ins are always welcome, and Sunday roast needs no booking at all. We recommend booking ahead for groups, and groups of 10 or more are arranged over the phone."
                    : `Yes, you can book a table online or by calling us on 01753 682707. ${sunday.availabilityLong} Booking is recommended for larger groups.`
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Closing CTA band */}
      <CtaBand
        title="Flying soon? Pull in first."
        copy="Free parking, freshly made pub food and a beer garden under the flight path, all minutes from every Heathrow terminal. Book a table or take a look at the menu."
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
          { href: '/private-hire', title: 'Function Room Hire', description: 'Private hire for 10+ to 150 guests, free parking' },
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
