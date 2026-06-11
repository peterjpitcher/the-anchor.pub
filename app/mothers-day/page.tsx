import type { Metadata } from 'next'
import Image from 'next/image'
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
import {
  DEFAULT_DRINKS_IMAGE,
  DEFAULT_EVENT_IMAGE,
  DEFAULT_FOOD_IMAGE,
  DEFAULT_PAGE_HEADER_IMAGE,
  DEFAULT_SUNDAY_LUNCH_IMAGE
} from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

// Mother's Day 2026 (15 March) is past at time of authoring. The page persists
// for rolling SEO and Mother's Day 2027 (Sunday 14 March 2027). Copy describes
// the post-launch walk-in model unconditionally, no date-aware switch needed
// because no claim references a date before 17 May 2026. Keyword cluster
// layered (per spec §8.6 + keyword plan): mothers day lunch near me,
// mothers day sunday roast near me, mothers day sunday roast, mothers day pub
// lunch, mothers day sunday roast.
const MOTHERS_DAY_DATE = '2027-03-07' // Mothering Sunday 2027 (owner-confirmed)
const MOTHERS_DAY_SERVICE_START_ISO = `${MOTHERS_DAY_DATE}T13:00:00+00:00`
const MOTHERS_DAY_SERVICE_END_ISO = `${MOTHERS_DAY_DATE}T18:00:00+00:00`
const MOTHERS_DAY_SERVICE_WINDOW_LABEL = '1pm–6pm'
const MOTHERS_DAY_LAST_BOOKING_LABEL = '5:30pm'
const MOTHERS_DAY_ADULT_PRICE_LOW = 16
const MOTHERS_DAY_ADULT_PRICE_HIGH = 22
const MOTHERS_DAY_KIDS_ROAST_PRICE = 14
// Offer validity start for the 2027 service. Walk-in/booking model — no
// pre-order or cut-off; validFrom only satisfies Google's Event offer schema.
const MOTHERS_DAY_OFFER_VALID_FROM = '2027-01-01'

const MOTHERS_DAY_BOOKING_URL = '/book-table'
const MOTHERS_DAY_BOOKING_CTA_LABEL = 'Book Mother’s Day Lunch'

const MOTHERS_DAY_PHOTOS = [
  {
    src: DEFAULT_SUNDAY_LUNCH_IMAGE,
    alt: "Sunday roast at The Anchor near Staines",
    caption: 'Roasts cooked fresh to order'
  },
  {
    src: '/images/food/sunday-roast/sunday-roast-the-anchor.jpeg',
    alt: "Cooked-from-scratch food at The Anchor near Staines",
    caption: 'Cooked-from-scratch favourites'
  },
  {
    src: '/images/mothers-day/drinks.jpg',
    alt: "Refreshing Mother's Day drinks in the sunshine at The Anchor",
    caption: 'Drinks for the whole table'
  }
] as const

function toAbsoluteUrl(value: string): string {
  if (!value) return value
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/')) return `${WEBSITE_ORIGIN}${value}`
  return `${WEBSITE_ORIGIN}/${value}`
}

const eventDateLabelStatic = new Date(MOTHERS_DAY_SERVICE_START_ISO).toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London'
})

const eventDateShortStatic = new Date(MOTHERS_DAY_SERVICE_START_ISO).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London'
})

const titleStatic = `Mother’s Day Lunch & Sunday Roast Near Staines | The Anchor`
const descriptionStatic =
  `Mother's Day lunch near me, Mother's Day Sunday roast at The Anchor near Staines. ` +
  `Served ${MOTHERS_DAY_SERVICE_WINDOW_LABEL} (last booking ${MOTHERS_DAY_LAST_BOOKING_LABEL}). ` +
  `Walk-ins welcome, booking recommended. From £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}.`
const keywordsStatic =
  "mothers day lunch near me, mothers day sunday roast near me, mothers day sunday roast, mothers day pub lunch, mothers day sunday roast, mother's day lunch near staines, stanwell moor TW19"

export const metadata: Metadata = {
  title: titleStatic,
  description: descriptionStatic,
  keywords: keywordsStatic,
  alternates: {
    canonical: '/mothers-day'
  },
  openGraph: {
    title: titleStatic,
    description: descriptionStatic,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: titleStatic,
    description: descriptionStatic,
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function MothersDayPage() {
  const eventDateText = eventDateShortStatic
  const eventImage = DEFAULT_EVENT_IMAGE

  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const heroDescription =
    `Make Mother’s Day easy with a relaxed, cooked-from-scratch Sunday roast at The Anchor in Stanwell Moor (TW19), ` +
    `near Staines-upon-Thames and Heathrow Terminal 5. Serving ${MOTHERS_DAY_SERVICE_WINDOW_LABEL} ` +
    `(last table ${MOTHERS_DAY_LAST_BOOKING_LABEL}). Walk in or book ahead. No set sittings.`

  const heroLeadText =
    `Adults £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}–£${String(MOTHERS_DAY_ADULT_PRICE_HIGH)} • ` +
    `Kids roast £${String(MOTHERS_DAY_KIDS_ROAST_PRICE)} • ` +
    'Walk in or book ahead'

  const faqs = [
    {
      question: 'When is Mother’s Day Lunch at The Anchor?',
      answer: `Mother’s Day Lunch is on ${eventDateText}. We serve from 1pm–6pm, with the last table booking at 5:30pm.`
    },
    {
      question: 'Where can I find a Mother’s Day Sunday roast near me?',
      answer:
        `The Anchor in Stanwell Moor (TW19), close to Staines-upon-Thames and Heathrow Terminal 5. ` +
        `Mother’s Day Sunday roast cooked from scratch, with roast turkey, roast pork, roast beef, pies and a vegan wellington, mains from £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}. ` +
        `Walk-ins welcome 1pm–6pm, booking recommended.`
    },
    {
      question: 'Do I need to book for Mother’s Day?',
      answer:
        `Walk-ins are welcome on Mother’s Day Sunday between 1pm and 6pm, no pre-order needed. Booking is still recommended, especially for groups, since Mother’s Day always books up quickly. ` +
        `Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.`
    },
    {
      question: 'Are there set sittings?',
      answer:
        `There are no set sittings. Book a time that suits you within the service window ` +
        `(last table booking ${MOTHERS_DAY_LAST_BOOKING_LABEL}) and enjoy your meal at a comfortable pace.`
    },
    {
      question: 'How much is Mother’s Day pub lunch?',
      answer: `Adult mains are £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}–£${String(MOTHERS_DAY_ADULT_PRICE_HIGH)}. Kids roast is available from £${String(MOTHERS_DAY_KIDS_ROAST_PRICE)}.`
    },
    {
      question: 'Do you have vegetarian or vegan options?',
      answer:
        'Yes, vegetarian and vegan options are available, including a dedicated vegan main. Vegetarian and vegan dishes are served with vegetarian gravy. Please mention dietary requirements when booking.'
    },
    {
      question: 'Where is The Anchor and is there parking?',
      answer:
        `You’ll find us at ${addressLine}. Free on-site parking is available for guests, ` +
        `and we’re easy to reach from Staines-upon-Thames and Heathrow Terminal 5.`
    }
  ]

  const mothersDayEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/mothers-day#event`,
    name: 'Mother’s Day Sunday Roast near Staines at The Anchor',
    description:
      `Mother’s Day Sunday roast near Staines at The Anchor in Stanwell Moor (TW19), close to Heathrow Terminal 5. ` +
      `Serving ${MOTHERS_DAY_SERVICE_WINDOW_LABEL} (last table booking ${MOTHERS_DAY_LAST_BOOKING_LABEL}). ` +
      `No set sittings, walk in or book ahead. ` +
      `Adults mains £${String(MOTHERS_DAY_ADULT_PRICE_LOW)}–£${String(MOTHERS_DAY_ADULT_PRICE_HIGH)}; ` +
      `kids roast from £${String(MOTHERS_DAY_KIDS_ROAST_PRICE)}. Vegetarian and vegan options available, ` +
      `served with vegetarian gravy.`,
    startDate: MOTHERS_DAY_SERVICE_START_ISO,
    endDate: MOTHERS_DAY_SERVICE_END_ISO,
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
      '@type': 'AggregateOffer',
      url: toAbsoluteUrl(MOTHERS_DAY_BOOKING_URL),
      priceCurrency: 'GBP',
      lowPrice: String(MOTHERS_DAY_KIDS_ROAST_PRICE),
      highPrice: String(MOTHERS_DAY_ADULT_PRICE_HIGH),
      availability: 'https://schema.org/InStock',
      validFrom: MOTHERS_DAY_OFFER_VALID_FROM
    },
    image: [
      toAbsoluteUrl(eventImage),
      toAbsoluteUrl(DEFAULT_SUNDAY_LUNCH_IMAGE),
      toAbsoluteUrl(DEFAULT_FOOD_IMAGE),
      toAbsoluteUrl(DEFAULT_DRINKS_IMAGE)
    ],
    url: `${WEBSITE_ORIGIN}/mothers-day`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${WEBSITE_ORIGIN}/mothers-day`
    }
  }

  return (
    <>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify(mothersDayEventSchema)
        }}
      />

            <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="Mother's Day"
        kicker={eventDateLabelStatic}
        title="Mother’s Day Sunday Roast Near Staines"
        lead={`${heroDescription} ${heroLeadText}`}
      />

      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <Card accent className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-surface-sunk">
                <Image
                  src={eventImage}
                  alt="Mother’s Day lunch at The Anchor near Staines (promotional image)"
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 80vw, 360px"
                  priority
                />
              </div>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Date</p>
                  <p className="text-lg font-bold text-accent-text">{eventDateText}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Serving times</p>
                  <p className="text-lg font-bold text-accent-text">{MOTHERS_DAY_SERVICE_WINDOW_LABEL}</p>
                  <p className="text-sm text-ink-muted">
                    Last table booking: {MOTHERS_DAY_LAST_BOOKING_LABEL}. No set sittings, book the time that suits you, or just walk in.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Prices</p>
                  <ul className="space-y-2 text-sm text-ink-muted">
                    <li className="flex gap-2">
                      <span className="text-accent-text">•</span>
                      <span>
                        Adults: £{String(MOTHERS_DAY_ADULT_PRICE_LOW)}–£{String(MOTHERS_DAY_ADULT_PRICE_HIGH)}
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent-text">•</span>
                      <span>Kids roast: from £{String(MOTHERS_DAY_KIDS_ROAST_PRICE)}</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Booking</p>
                  <p className="text-sm text-ink-muted">
                    Mother’s Day always books up quickly, so booking ahead is recommended. Walk-ins are welcome, no pre-order needed.
                  </p>
                </div>

                <div className="pt-2">
                  <BookTableButton
                    source="mothers_day_card"
                    context="mothers_day"
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="w-full"
                    trackingLabel={MOTHERS_DAY_BOOKING_CTA_LABEL}
                    eventName="Mother's Day Lunch"
                    customHref={MOTHERS_DAY_BOOKING_URL}
                  >
                    {MOTHERS_DAY_BOOKING_CTA_LABEL}
                  </BookTableButton>
                </div>
              </CardBody>
            </Card>

            <div className="space-y-6">
              <LaunchAnnouncement variant="banner" />
              <div>
                <h2 className="text-h3 text-ink-strong">
                  Mother&rsquo;s Day Pub Lunch, What to Expect
                </h2>
                <p className="mt-4 text-ink-muted text-lg leading-relaxed">
                  Make Mother&apos;s Day easy. Join us at The Anchor in Stanwell Moor (TW19) for a relaxed, cooked-from-scratch Mother&apos;s Day Sunday roast
                  where Mum can properly switch off and enjoy being looked after, near{' '}
                  <Link
                    href="/staines-pub"
                    className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                  >
                    Staines-upon-Thames
                  </Link>
                  , with free parking and easy access from{' '}
                  <Link
                    href="/near-heathrow/terminal-5"
                    className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                  >
                    Heathrow Terminal 5
                  </Link>
                  .
                </p>
                <p className="mt-4 text-ink-muted leading-relaxed">
                  Expect a proper Mother&apos;s Day Sunday roast, cooked from scratch and served fresh to order, with everything you&apos;d want from a
                  traditional Sunday roast: golden roast potatoes, seasonal vegetables, a generous Yorkshire pudding, and our signature gravy.
                </p>
                <p className="mt-3 text-ink-muted leading-relaxed">
                  We also offer vegetarian and vegan options, including a dedicated vegan main. Vegetarian and vegan dishes are served with
                  vegetarian gravy.
                </p>
                <p className="mt-3 text-ink-muted leading-relaxed">
                  We&apos;re serving from <span className="font-semibold text-ink">1pm</span> to <span className="font-semibold text-ink">6pm</span>, with the{' '}
                  <span className="font-semibold text-ink">last table booking at {MOTHERS_DAY_LAST_BOOKING_LABEL}</span>. Adults mains are{' '}
                  <span className="font-semibold text-ink">£{String(MOTHERS_DAY_ADULT_PRICE_LOW)}–£{String(MOTHERS_DAY_ADULT_PRICE_HIGH)}</span>,
                  and kids roast is available from <span className="font-semibold text-ink">£{String(MOTHERS_DAY_KIDS_ROAST_PRICE)}</span>.
                </p>
                <p className="mt-3 text-ink-muted leading-relaxed">
                  There are no set sittings. Walk in or book a time that suits you within the service window, either way, enjoy your meal at a comfortable pace.
                </p>

                <Card accent className="mt-6">
                  <CardBody>
                    <h3 className="text-lg font-semibold text-ink-strong">Browse menus</h3>
                    <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                      Planning your visit? Take a look at our{' '}
                      <Link
                        href="/sunday-roast"
                        className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                      >
                        Sunday roast menu
                      </Link>
                      ,{' '}
                      <Link
                        href="/pizza-menu"
                        className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                      >
                        pizza menu
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/drinks"
                        className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                      >
                        drinks menu
                      </Link>
                      .
                    </p>
                  </CardBody>
                </Card>
              </div>

              <Card accent>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="success">
                      Walk-ins welcome
                    </Badge>
                    <Badge variant="green">
                      Cooked-from-scratch lunch
                    </Badge>
                    <Badge variant="green">
                      Vegan & vegetarian options
                    </Badge>
                    <Badge variant="green">
                      No set sittings
                    </Badge>
                  </div>

                  <div className="mt-5 rounded-md bg-surface-sunk p-5 border border-line">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                      Booking notes
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                      <li className="flex gap-2">
                        <span className="text-accent-text">•</span>
                        <span>Serving {MOTHERS_DAY_SERVICE_WINDOW_LABEL} (last table booking {MOTHERS_DAY_LAST_BOOKING_LABEL}).</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent-text">•</span>
                        <span>Walk-ins welcome, no pre-order needed.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent-text">•</span>
                        <span>Mother’s Day always books up quickly, so booking ahead is recommended.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent-text">•</span>
                        <span>Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent-text">•</span>
                        <span>Vegetarian and vegan dishes are served with vegetarian gravy. Add dietary notes when booking.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <BookTableButton
                      source="mothers_day_body"
                      context="mothers_day"
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="w-full sm:w-auto sm:min-w-[240px]"
                      trackingLabel={MOTHERS_DAY_BOOKING_CTA_LABEL}
                      eventName="Mother's Day Lunch"
                      customHref={MOTHERS_DAY_BOOKING_URL}
                    >
                      {MOTHERS_DAY_BOOKING_CTA_LABEL}
                    </BookTableButton>
                    <Link href="/find-us" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                        Find Us
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardBody className="space-y-2">
                    <h3 className="text-lg font-semibold text-ink-strong">Getting here</h3>
                    <p className="text-sm text-ink-muted">
                      {addressLine}. Free parking available, near Staines-upon-Thames and around {HEATHROW_TIMES.terminal5} minutes from
                      Heathrow Terminal 5 by car.
                    </p>
                    <Link
                      href="/near-heathrow/terminal-5"
                      className="inline-flex items-center text-sm font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted"
                    >
                      Near Heathrow Terminal 5
                      <span className="ml-1">→</span>
                    </Link>
                    <Link
                      href="/find-us"
                      className="inline-flex items-center text-sm font-semibold text-accent-text hover:text-anchor-gold"
                    >
                      Get directions
                      <span className="ml-1">→</span>
                    </Link>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="space-y-2">
                    <h3 className="text-lg font-semibold text-ink-strong">Prefer to talk?</h3>
                    <p className="text-sm text-ink-muted">
                      Questions about your booking or special requests? Give us a call and we&rsquo;ll help.
                    </p>
                    <PhoneButton
                      phone={CONTACT.phone}
                      source="mothers_day_body"
                      variant="outline"
                      size="md"
                      className="w-full"
                    >
                      Call {CONTACT.phone}
                    </PhoneButton>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Book your Mother's Day lunch"
        copy={`Mother's Day Lunch is on ${eventDateText} at The Anchor in Stanwell Moor (TW19), near Staines-upon-Thames. Serving ${MOTHERS_DAY_SERVICE_WINDOW_LABEL} (last table booking ${MOTHERS_DAY_LAST_BOOKING_LABEL}). Walk in or book ahead, Mother's Day always books up quickly, so booking is recommended.`}
        primary={
          <BookTableButton
            source="mothers_day_cta"
            context="mothers_day"
            variant="primary"
            size="lg"
            trackingLabel={MOTHERS_DAY_BOOKING_CTA_LABEL}
            eventName="Mother's Day Lunch"
            customHref={MOTHERS_DAY_BOOKING_URL}
          >
            {MOTHERS_DAY_BOOKING_CTA_LABEL}
          </BookTableButton>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="mothers_day_cta"
            variant="outline"
            size="lg"
          >
            Call {CONTACT.phone}
          </PhoneButton>
        }
      />

      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-h3 text-ink-strong">Photos</h2>
              <p className="text-ink-muted">
                A few highlights from the kitchen and bar at The Anchor.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {MOTHERS_DAY_PHOTOS.map((photo) => (
                <figure key={photo.src} className="overflow-hidden rounded-md bg-surface border border-line shadow-sm">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <figcaption className="p-4 text-sm text-ink-muted">{photo.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">Where we are</h2>
              <p className="text-ink-muted leading-relaxed">
                The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), close to Heathrow and easy to reach from Staines-upon-Thames,
                with free parking available on site. If you&rsquo;re searching for a Mother&apos;s Day lunch near me, this is the easy option.
              </p>
              <p className="text-ink-muted">
                Address: <span className="font-semibold text-ink-strong">{addressLine}</span>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/find-us" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                    Directions & parking
                  </Button>
                </Link>
                <PhoneButton
                  phone={CONTACT.phone}
                  source="mothers_day_location"
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

      <FAQAccordionWithSchema title="Mother’s Day FAQs" faqs={faqs} className="bg-anchor-green-deep" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: MOTHERS_DAY_BOOKING_URL, title: 'Book Mother’s Day Sunday roast', description: 'Reserve online in minutes' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
