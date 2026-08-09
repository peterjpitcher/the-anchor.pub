import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { SeasonalDynamicDetails } from '@/components/seasonal/SeasonalDynamicDetails'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_SUNDAY_LUNCH_IMAGE, DEFAULT_FOOD_IMAGE, DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import type { SeasonalDynamicFields } from '@/lib/seasonal-utils'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

// Evergreen Easter Sunday roast page (owner brief §1). Built on the A11 dynamic
// system: the body reads completely with no annual fields set. To refresh a
// year's specifics (confirmed date, a special menu, a one-off offer), populate
// EASTER_SUNDAY_DYNAMIC below, nothing else needs to change.
//
// Easter Sunday 2027 falls on 4 April 2027 (owner-confirmed rolling target).
const EASTER_SUNDAY_LABEL = 'Sunday 4 April 2027'
const EASTER_SUNDAY_DATE = '2027-04-04'
const EASTER_SUNDAY_SERVICE_WINDOW = '1pm to 6pm'
const EASTER_SUNDAY_LAST_BOOKING = '5:30pm'
const EASTER_BOOKING_URL = '/book-table'

// A11 dynamic fields. Empty by design, the page is evergreen. Fill in only
// what the owner or the management API confirms for a given year. Never invent.
const EASTER_SUNDAY_DYNAMIC: SeasonalDynamicFields = {}

export const metadata: Metadata = {
  title: 'Easter Sunday Roast in Stanwell Moor',
  description:
    'Easter Sunday roast at The Anchor in Stanwell Moor, near Heathrow Terminal 5. A family-friendly Sunday roast served 1pm to 6pm, cooked from scratch. Walk in or book ahead, free parking.',
  keywords:
    'easter sunday roast stanwell moor, easter sunday pub near heathrow, easter sunday lunch near heathrow, family-friendly easter sunday roast, easter roast near terminal 5',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Easter Sunday Roast in Stanwell Moor | The Anchor',
    description:
      'Family-friendly Easter Sunday roast at The Anchor in Stanwell Moor, near Heathrow Terminal 5. Served 1pm to 6pm, cooked from scratch. Walk in or book ahead.',
    images: [DEFAULT_SUNDAY_LUNCH_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: 'Easter Sunday Roast in Stanwell Moor | The Anchor',
    description:
      'Family-friendly Easter Sunday roast at The Anchor in Stanwell Moor, near Heathrow Terminal 5. Served 1pm to 6pm, cooked from scratch. Walk in or book ahead.',
    images: [DEFAULT_SUNDAY_LUNCH_IMAGE]
  })
}

export default function EasterSundayPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: 'Where can I find an Easter Sunday roast near me?',
      answer: `The Anchor in Stanwell Moor (TW19), about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car. We serve a family-friendly Easter Sunday roast cooked from scratch, with roast beef, pork, turkey, two pies or a vegan wellington. Walk in or book ahead, free parking on site.`
    },
    {
      question: 'What time is the Easter Sunday roast served?',
      answer: `We serve the Easter Sunday roast from 1pm to 6pm, with the last table booking at ${EASTER_SUNDAY_LAST_BOOKING}. There are no set sittings, so book a time that suits you, or simply walk in.`
    },
    {
      question: 'Do I need to book for Easter Sunday?',
      answer:
        'Walk-ins are welcome the whole way through, from 1pm to 6pm, with no pre-order needed. Booking is recommended for groups, as Easter Sunday is a busy one. Groups of 15 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.'
    },
    {
      question: 'Is The Anchor family-friendly at Easter?',
      answer:
        'Yes. Children are very welcome, and the dog-friendly beer garden gives little ones room to run around while you finish your roast. It is a relaxed, family Easter Sunday, not a fussy one.'
    },
    {
      question: 'What is on the Easter Sunday menu?',
      answer:
        'Our Easter Sunday menu is our regular Sunday roast: roast beef, roast pork, roast turkey, a beef and ale pie, a chicken and wild mushroom pie, or a vegan wellington, all cooked from scratch. Current dishes and prices are live on our Sunday roast menu.'
    },
    {
      question: 'Are you open over the Easter weekend and on Easter Monday?',
      answer:
        'Yes. We are open as normal right across the Easter bank holiday weekend. Good Friday through Easter Sunday we are open with full kitchen service, including the Sunday roast on Easter Sunday. On Easter Monday we are open for drinks only, as our kitchen is closed every Monday, including bank holidays.'
    },
    {
      question: 'Is there parking?',
      answer: `Yes, we have ${PARKING.capacity} free parking spaces on site. No meters, no charges. We are about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car, and you will find us at ${addressLine}.`
    }
  ]

  const easterEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/easter-sunday#event`,
    name: 'Easter Sunday Roast at The Anchor',
    description:
      'Family-friendly Easter Sunday roast at The Anchor in Stanwell Moor (TW19), near Heathrow Terminal 5. Sunday roast from the current menu, cooked from scratch and served ' + EASTER_SUNDAY_SERVICE_WINDOW + '. Walk in or book ahead. Dog-friendly beer garden, free parking.',
    startDate: `${EASTER_SUNDAY_DATE}T13:00:00+01:00`,
    endDate: `${EASTER_SUNDAY_DATE}T18:00:00+01:00`,
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
      url: `${WEBSITE_ORIGIN}${EASTER_BOOKING_URL}`,
      availability: 'https://schema.org/InStock'
    },
    image: [
      `${WEBSITE_ORIGIN}${DEFAULT_SUNDAY_LUNCH_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_FOOD_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_DRINKS_IMAGE}`
    ],
    url: `${WEBSITE_ORIGIN}/easter-sunday`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(easterEventSchema)
        }}
      />

      <InteriorHero
        image={DEFAULT_SUNDAY_LUNCH_IMAGE}
        crumb="Easter Sunday"
        kicker="Easter Sunday"
        title="Easter Sunday Roast at The Anchor"
        lead={`Gather the family for a proper Easter Sunday roast in the heart of Stanwell Moor. Cooked from scratch, served ${EASTER_SUNDAY_SERVICE_WINDOW}, near Heathrow Terminal 5. Walk in or book ahead, with free parking and a dog-friendly beer garden.`}
      />

      {/* Easter Sunday roast */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <LaunchAnnouncement variant="banner" />
            <h2 className="text-h3 text-ink-strong">
              A proper Easter Sunday roast
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Easter Sunday is one of those days that deserves a proper table and someone else doing the cooking.
              Bring the family to The Anchor in Stanwell Moor for a traditional Sunday roast, the kind of relaxed
              lunch that marks the start of spring and gets everyone in one place.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Choose from roast beef, roast pork, roast turkey, a beef and ale pie, a chicken and wild mushroom pie,
              or a vegan wellington, all cooked from scratch and served with triple-cooked roast potatoes and seasonal
              vegetables. The sliced roasts come with Yorkshire puddings and our signature gravy; the vegan wellington
              is served with our regular vegan gravy. Current dishes and
              prices are live on our{' '}
              <Link href="/sunday-roast" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                Sunday roast menu
              </Link>
              .
            </p>
            <p className="text-ink-muted leading-relaxed">
              We serve from <span className="font-semibold text-ink">1pm</span> to <span className="font-semibold text-ink">6pm</span>,
              with the last table booking at <span className="font-semibold text-ink">{EASTER_SUNDAY_LAST_BOOKING}</span>.
              There are no set sittings, so book a time that suits you and enjoy your meal at a comfortable pace.
            </p>

            <Card accent>
              <CardBody>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-text">How Easter Sunday works</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Walk-ins are welcome between <span className="font-semibold text-ink">1pm and 6pm</span>, no pre-order needed.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Booking is recommended for groups, especially parties of six or more.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Groups of 15 or more take a &pound;10 per person deposit on booking, fully deducted from the bill on the day.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>The vegan wellington comes with our regular vegan gravy, which we can serve with any dish, just add a note when you book.</span>
                  </li>
                </ul>
              </CardBody>
            </Card>

            <SeasonalDynamicDetails
              fields={EASTER_SUNDAY_DYNAMIC}
              heading="This year's Easter Sunday"
              intro="The latest confirmed details for this year's Easter Sunday at The Anchor."
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <BookTableButton
                source="easter_sunday_section"
                context="easter_sunday"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book your Easter Sunday table"
                eventName="Easter Sunday Roast"
                customHref={EASTER_BOOKING_URL}
              >
                Book your Easter Sunday table
              </BookTableButton>
              <Link href="/sunday-roast" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                  View Sunday roast menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Family Easter near Heathrow */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              A family Easter Sunday near Heathrow Terminal 5
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              The Anchor is a proper village pub, not a chain or a hotel buffet. We are rooted in the Stanwell Moor
              community, about {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, with free parking right outside.
              That makes Easter Sunday easy: turn up, settle in, and let us do the work.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Children are very welcome, dogs are welcome inside and in the garden, and there is space for everyone
              to relax. A plane passes overhead every 90 seconds or so, which, as it turns out, keeps the little ones
              (and a few of the grown-ups) entertained between courses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">Family-friendly</Badge>
              <Badge variant="green">Walk-ins welcome</Badge>
              <Badge variant="green">Dog-friendly beer garden</Badge>
              <Badge variant="green">Free parking &bull; {PARKING.capacity} spaces</Badge>
              <Badge variant="green">Near Heathrow Terminal 5</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* Booking CTA */}
      <CtaBand
        title="Book your Easter Sunday table"
        copy={`A family Easter Sunday roast at The Anchor in Stanwell Moor, served ${EASTER_SUNDAY_SERVICE_WINDOW} (last table booking ${EASTER_SUNDAY_LAST_BOOKING}). Walk in or book ahead, booking is recommended as Easter Sunday gets busy.`}
        primary={
          <BookTableButton
            source="easter_sunday_cta"
            context="easter_sunday"
            variant="primary"
            size="lg"
            trackingLabel="Book your Easter Sunday table"
            eventName="Easter Sunday Roast"
            customHref={EASTER_BOOKING_URL}
          >
            Book your Easter Sunday table
          </BookTableButton>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="easter_sunday_cta"
            variant="outline"
            size="lg"
          >
            Call or WhatsApp us on {CONTACT.phone}
          </PhoneButton>
        }
      />

      {/* Easter weekend opening hours (migrated from the former /easter weekend page) */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Easter weekend opening hours
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Planning the whole long weekend, not just Sunday? Here is what to expect across the Easter bank holiday.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Good Friday &ndash; Easter Sunday</h3>
                  <p className="text-sm text-ink-muted">
                    Open as normal with full kitchen service. Our regular evening menu is available Friday and Saturday,
                    and our Sunday roast menu on Easter Sunday.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="success">Kitchen open</Badge>
                    <Badge variant="green">Full menu</Badge>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink-strong">Easter Monday</h3>
                  <p className="text-sm text-ink-muted">
                    Open for drinks only. Our kitchen is closed every Monday, including bank holidays.
                    Pop in for a pint, enjoy the beer garden, and wind down the long weekend.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="green">Drinks only</Badge>
                    <Badge variant="green">Kitchen closed</Badge>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

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
                  source="easter_sunday_location"
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

      <FAQAccordionWithSchema title="Easter Sunday FAQs" faqs={faqs} />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: EASTER_BOOKING_URL, title: 'Book your Easter Sunday table', description: 'Reserve online in minutes' },
          { href: '/sunday-roast', title: 'Sunday roast near Heathrow', description: 'Full menu, prices and walk-in info' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
