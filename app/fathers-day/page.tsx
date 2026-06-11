import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_SUNDAY_LUNCH_IMAGE, DEFAULT_FOOD_IMAGE, DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

// Father's Day 2026 (Sunday 21 June 2026) is the next live seasonal event after
// the 17 May walk-in launch, the page ships in the post-launch walk-in state
// from launch onward. Keyword cluster layered: 'fathers day pub lunch',
// 'fathers day sunday roast', 'fathers day pub near me', 'where to take dad
// for sunday roast'. (Spec §8.6, keyword plan delivered in conversation.)
const FATHERS_DAY_DATE = '2026-06-21'
const FATHERS_DAY_LABEL = 'Sunday 21 June 2026'
const FATHERS_DAY_SERVICE_WINDOW = '1pm–6pm'
const FATHERS_DAY_LAST_BOOKING = '5:30pm'
const FATHERS_DAY_ROAST_PRICE_FROM = 19

const FATHERS_DAY_BOOKING_URL = '/book-table'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

export const metadata: Metadata = {
  title: "Father's Day Pub Lunch Near Heathrow | Sunday Roast",
  description:
    "Father's Day pub lunch at The Anchor near Heathrow, Sunday roast served 1pm–6pm, walk-ins welcome. From £19. Beer garden, free parking, planes overhead.",
  alternates: { canonical: '/fathers-day' },
  openGraph: {
    title: "Father's Day Pub Lunch & Sunday Roast Near Heathrow | The Anchor",
    description:
      "Father's Day pub lunch at The Anchor near Heathrow, Sunday roast served 1pm–6pm, walk-ins welcome. From £19. Beer garden, free parking, planes overhead.",
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: "Father's Day Pub Lunch & Sunday Roast Near Heathrow | The Anchor",
    description:
      "Father's Day pub lunch at The Anchor near Heathrow, Sunday roast served 1pm–6pm, walk-ins welcome. From £19. Beer garden, free parking, planes overhead.",
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function FathersDayPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: "What's on the Father's Day menu?",
      answer:
        "Father's Day falls on a Sunday, so the full Sunday roast menu is on, with roast turkey, roast pork, roast beef, pies, or a vegan wellington. " +
        "Mains start from £19. All served with roast potatoes, seasonal vegetables and gravy, with Yorkshire pudding on sliced roasts."
    },
    {
      question: "Do I need to book for Father's Day?",
      answer:
        "Walk-ins are welcome on Father's Day Sunday between 1pm and 6pm, no pre-order needed. Booking is still recommended, especially for groups, since it's one of our busiest Sundays. " +
        "Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day."
    },
    {
      question: "Where to take dad for Sunday roast near Heathrow?",
      answer:
        "The Anchor in Stanwell Moor, 7 minutes from Heathrow Terminal 5 by car, with 20 free parking spaces, a dog-friendly beer garden and planes passing overhead every 90 seconds. " +
        "It's a proper local pub, not a chain, Sunday roasts cooked from scratch, mains from £19."
    },
    {
      question: 'Is there a set menu or special pricing?',
      answer:
        "There's no separate set menu, it's our regular Sunday roast menu, which is what makes it special. " +
        "Proper food, cooked from scratch. Mains from £19."
    },
    {
      question: "What time is Father's Day lunch served?",
      answer:
        "We serve Sunday roast from 1pm to 6pm, with the last table booking at 5:30pm. " +
        "No set sittings, book a time that suits you, or just walk in."
    },
    {
      question: 'Is there parking?',
      answer:
        `Yes, we have 20 free parking spaces on site. No meters, no charges. ` +
        `We're about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.`
    }
  ]

  const fathersDayEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/fathers-day#event`,
    name: "Father's Day Lunch at The Anchor",
    description:
      `Treat Dad to Father's Day pub lunch at The Anchor in Stanwell Moor (TW19), near Heathrow. ` +
      `Sunday roast from £${String(FATHERS_DAY_ROAST_PRICE_FROM)}. Serving ${FATHERS_DAY_SERVICE_WINDOW}. ` +
      `Walk in or book ahead. Beer garden with plane spotting, free parking.`,
    startDate: `${FATHERS_DAY_DATE}T13:00:00+01:00`,
    endDate: `${FATHERS_DAY_DATE}T18:00:00+01:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        addressRegion: CONTACT.address.county,
        postalCode: CONTACT.address.postcode,
        addressCountry: CONTACT.address.country
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,
        longitude: CONTACT.coordinates.lng
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'The Anchor',
      url: WEBSITE_ORIGIN,
      telephone: CONTACT.phoneIntl,
      email: CONTACT.email
    },
    offers: {
      '@type': 'Offer',
      url: `${WEBSITE_ORIGIN}${FATHERS_DAY_BOOKING_URL}`,
      priceCurrency: 'GBP',
      price: String(FATHERS_DAY_ROAST_PRICE_FROM),
      availability: 'https://schema.org/InStock'
    },
    image: [
      `${WEBSITE_ORIGIN}${DEFAULT_SUNDAY_LUNCH_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_FOOD_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_DRINKS_IMAGE}`
    ],
    url: `${WEBSITE_ORIGIN}/fathers-day`
  }

  return (
    <>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(fathersDayEventSchema)
        }}
      />

            <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="Father's Day"
        kicker={FATHERS_DAY_LABEL}
        title="Father’s Day at The Anchor"
        lead={`A proper Sunday roast, a cold pint, planes coming in low overhead, and the family all in one place. That's Father's Day sorted. Sunday roast from £${String(FATHERS_DAY_ROAST_PRICE_FROM)} • Walk in or book ahead • Served ${FATHERS_DAY_SERVICE_WINDOW}`}
      />

      {/* Treat Dad, Father's Day pub lunch */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <LaunchAnnouncement variant="banner" />
            <h2 className="text-h3 text-ink-strong">
              Treat Dad to a Proper Father&rsquo;s Day Pub Lunch
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Father&apos;s Day pub lunch lands on a Sunday, which means the full Father&apos;s Day Sunday roast menu is on. Roast turkey,
              roast pork, roast beef, pies or a vegan wellington, all cooked from scratch, served with golden roast potatoes,
              seasonal vegetables and proper gravy. Yorkshire puddings come with the sliced roasts.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Mains start from <span className="font-semibold text-ink">&pound;{String(FATHERS_DAY_ROAST_PRICE_FROM)}</span>.
              We serve from <span className="font-semibold text-ink">1pm</span> to <span className="font-semibold text-ink">6pm</span>,
              last table at <span className="font-semibold text-ink">{FATHERS_DAY_LAST_BOOKING}</span>.
              Walk in or book ahead, deposits only apply to groups of 10 or more.
            </p>

            <Card accent>
              <CardBody>
                <h3 className="text-lg font-semibold text-ink-strong">Browse menus</h3>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  Planning the day? Take a look at our{' '}
                  <Link
                    href="/sunday-roast"
                    className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                  >
                    Sunday roast menu
                  </Link>
                  ,{' '}
                  <Link
                    href="/drinks"
                    className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                  >
                    drinks menu
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/pizza-menu"
                    className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                  >
                    pizza menu
                  </Link>
                  .
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Where to take dad for Sunday roast */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Where to Take Dad for Sunday Roast Near Heathrow
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              The short answer: a proper Father&apos;s Day pub near me, not a chain restaurant, not a hotel buffet.
              The Anchor in Stanwell Moor is 7 minutes from Heathrow Terminal 5, with 20 free parking spaces, a dog-friendly
              beer garden, and a plane every 90 seconds that gives Dad a perfectly valid reason to sit outside as long as he likes.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Father&apos;s Day Sunday roast cooked from scratch, drinks from the bar, the family all in one place,
              and nobody&apos;s rushing to feed a meter. With free parking on site and only {HEATHROW_TIMES.terminal5} minutes
              from Heathrow T5, it&apos;s easy to get to from anywhere nearby.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="green">Father&apos;s Day Sunday roast</Badge>
              <Badge variant="green">Walk-ins welcome</Badge>
              <Badge variant="green">Planes every 90 seconds</Badge>
              <Badge variant="success">Free parking</Badge>
              <Badge variant="green">Dog-friendly</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* The Beer Garden */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              The Beer Garden
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              June weather. Low-flying planes. Dogs pottering about. Kids running around.
              A pint that&apos;s actually cold. Our beer garden on a summer Sunday afternoon
              is Dad&apos;s idea of a perfect Father&apos;s Day, even if he won&apos;t admit it.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Dogs are welcome inside and out. The garden has plenty of space for families,
              and there&apos;s always something to watch in the sky. It&apos;s the kind of afternoon
              where nobody checks the time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">Dog-friendly</Badge>
              <Badge variant="green">Kids welcome</Badge>
              <Badge variant="green">Plane spotting</Badge>
              <Badge variant="green">Summer beer garden</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* Gift Idea */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Not Sure What to Get?
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Book the table and tell Dad you&apos;re taking him to the pub. He&apos;ll love it.
            </p>
            <p className="text-ink-muted leading-relaxed">
              A Sunday roast he doesn&apos;t have to cook, a beer he doesn&apos;t have to pour,
              and an afternoon with the family in a garden where planes skim the rooftops.
              It&apos;s not complicated. It&apos;s just good.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <BookTableButton
                source="fathers_day_gift"
                context="fathers_day"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book Father's Day Lunch"
                eventName="Father's Day Lunch"
                customHref={FATHERS_DAY_BOOKING_URL}
              >
                Book Father&apos;s Day Lunch
              </BookTableButton>
              <PhoneButton
                phone={CONTACT.phone}
                source="fathers_day_gift"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call {CONTACT.phone}
              </PhoneButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Booking CTA */}
      <CtaBand
        title="Book Dad's table"
        copy={`Father's Day lunch is on ${FATHERS_DAY_LABEL}. Serving ${FATHERS_DAY_SERVICE_WINDOW} (last booking ${FATHERS_DAY_LAST_BOOKING}). Walk in or book ahead, deposits only apply to groups of 10 or more.`}
        primary={
          <BookTableButton
            source="fathers_day_cta"
            context="fathers_day"
            variant="primary"
            size="lg"
            trackingLabel="Book Father's Day Lunch"
            eventName="Father's Day Lunch"
            customHref={FATHERS_DAY_BOOKING_URL}
          >
            Book Father&apos;s Day Lunch
          </BookTableButton>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="fathers_day_cta"
            variant="outline"
            size="lg"
          >
            Call {CONTACT.phone}
          </PhoneButton>
        }
      />

      {/* Where we are */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">Where we are</h2>
              <p className="text-ink-muted leading-relaxed">
                The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), close to Heathrow and easy to reach from{' '}
                <Link href="/staines-pub" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                  Staines-upon-Thames
                </Link>
                , with free parking on site.
              </p>
              <p className="text-ink-muted">
                Address: <span className="font-semibold text-ink-strong">{addressLine}</span>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/find-us" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                    Directions &amp; parking
                  </Button>
                </Link>
                <PhoneButton
                  phone={CONTACT.phone}
                  source="fathers_day_location"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Call {CONTACT.phone}
                </PhoneButton>
              </div>
            </div>
            <GoogleMapEmbed query={mapQuery} height={360} />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema title="Father&rsquo;s Day FAQs" faqs={faqs} />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: FATHERS_DAY_BOOKING_URL, title: "Book Father's Day lunch", description: 'Reserve online in minutes' },
          { href: '/sunday-roast', title: 'Sunday roast menu', description: 'Full menu and prices' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
