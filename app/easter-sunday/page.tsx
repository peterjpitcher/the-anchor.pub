import { OccasionMenuNotice, occasionMenuLine } from '@/components/seasonal/OccasionMenuNotice'
import { getEasterSunday, nextOccurrence, formatOccasionLabel } from '@/lib/recurring-dates'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { SeasonalDynamicDetails } from '@/components/seasonal/SeasonalDynamicDetails'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import type { SeasonalDynamicFields } from '@/lib/seasonal-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

// Evergreen Easter Sunday page. Easter Sunday is a special day, not a normal
// Sunday: the menu, and how the day works, are confirmed nearer the time
// (docs/SSOT.md sections 4 and 10, owner ruling 7 and 8 October 2026). So the
// page names no dish, no serving times and no walk-in promise. When the owner
// confirms a year's details, populate EASTER_SUNDAY_DYNAMIC below.
//
// Easter Sunday 2027 falls on Sunday 28 March 2027. Easter is set by the
// ecclesiastical calendar, not by us, so this date is fixed, not a choice.
// Worked out, not typed, so the morning after Easter the page moves on to next
// year's date by itself (lib/recurring-dates.ts).
const EASTER_SUNDAY_DATE = nextOccurrence(getEasterSunday)
const EASTER_SUNDAY_LABEL = formatOccasionLabel(EASTER_SUNDAY_DATE)
const EASTER_BOOKING_URL = '/book-table'

// A11 dynamic fields. Empty by design, the page is evergreen. Fill in only
// what the owner or the management API confirms for a given year. Never invent.
const EASTER_SUNDAY_DYNAMIC: SeasonalDynamicFields = {}

const EASTER_SUNDAY_DESCRIPTION =
  'A family-friendly Easter Sunday at The Anchor in Stanwell Moor, near Heathrow Terminal 5. The menu is confirmed nearer the time. Book a table, free parking.'

export const metadata: Metadata = {
  title: 'Easter Sunday in Stanwell Moor',
  description: EASTER_SUNDAY_DESCRIPTION,
  keywords:
    'easter sunday stanwell moor, easter sunday pub near heathrow, family-friendly easter sunday pub, easter sunday near terminal 5',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Easter Sunday in Stanwell Moor | The Anchor',
    description: EASTER_SUNDAY_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: 'Easter Sunday in Stanwell Moor | The Anchor',
    description: EASTER_SUNDAY_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function EasterSundayPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: 'What is on the Easter Sunday menu?',
      answer: occasionMenuLine('Easter Sunday')
    },
    {
      question: 'Do I need to book for Easter Sunday?',
      answer:
        'Booking is recommended, as Easter Sunday is a busy one. Groups of 15 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.'
    },
    {
      question: 'Is The Anchor family-friendly at Easter?',
      answer:
        'Yes. Children are very welcome, and the dog-friendly beer garden gives little ones room to run around. It is a relaxed, family Easter Sunday, not a fussy one.'
    },
    {
      question: 'Are you open over the Easter weekend and on Easter Monday?',
      answer:
        'Yes. We are open right across the Easter bank holiday weekend. The menu for Easter Sunday is confirmed nearer the time. On Easter Monday we are open for drinks only, as our kitchen is closed every Monday, including bank holidays.'
    },
    {
      question: 'Is there parking?',
      answer: `Yes, we have ${PARKING.capacity} free parking spaces on site. No meters, no charges. We are about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car, and you will find us at ${addressLine}.`
    }
  ]

  return (
    <>
      {/* No Event structured data. What runs on the day is confirmed nearer the
          time (owner, 7 October 2026), so there is no event to describe yet. */}

      <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="Easter Sunday"
        kicker="Easter Sunday"
        title="Easter Sunday at The Anchor"
        lead="Gather the family for Easter Sunday in the heart of Stanwell Moor, near Heathrow Terminal 5. Book ahead, with free parking and a dog-friendly beer garden."
      />

      <OccasionMenuNotice occasion="Easter Sunday" />

      {/* Easter Sunday */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto space-y-6">
            <h2 className="text-h3 text-ink-strong">
              A proper table for Easter Sunday
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Easter Sunday is one of those days that deserves a proper table and someone else doing the cooking.
              Bring the family to The Anchor in Stanwell Moor and get everyone in one place.
            </p>

            <Card accent>
              <CardBody>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-text">Booking for Easter Sunday</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Booking is recommended for groups, especially parties of six or more.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Groups of 15 or more take a &pound;10 per person deposit on booking, fully deducted from the bill on the day.</span>
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
                eventName="Easter Sunday"
                customHref={EASTER_BOOKING_URL}
              >
                Book your Easter Sunday table
              </BookTableButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Family Easter near Heathrow */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto space-y-6">
            <h2 className="text-h3 text-ink-strong">
              A family Easter Sunday near Heathrow Terminal 5
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              The Anchor is a proper village pub, not a chain or a hotel buffet. We are rooted in the Stanwell Moor
              community, about {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, with free parking right outside.
              That makes Easter Sunday easy: turn up, settle in, and let us do the work.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Children are very welcome, dogs are welcome throughout the pub, on a lead, and there is space for everyone
              to relax. A plane passes overhead every 90 seconds or so, which, as it turns out, keeps the little ones
              (and a few of the grown-ups) entertained between courses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">Family-friendly</Badge>
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
        copy="A family Easter Sunday at The Anchor in Stanwell Moor. Booking is recommended, as Easter Sunday gets busy."
        primary={
          <BookTableButton
            source="easter_sunday_cta"
            context="easter_sunday"
            variant="primary"
            size="lg"
            wrap
            trackingLabel="Book your Easter Sunday table"
            eventName="Easter Sunday"
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
            wrap
          >
            Call or WhatsApp us on {CONTACT.phone}
          </PhoneButton>
        }
      />

      {/* Easter weekend opening hours (migrated from the former /easter weekend page) */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto space-y-6">
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
                    Open as normal. Our regular evening menu is available Friday and Saturday.
                    The menu for Easter Sunday is confirmed nearer the time.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="success">Open as normal</Badge>
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
        <Container>
          <div className="mx-auto grid gap-10 lg:grid-cols-2 lg:items-start">
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
                <Button asChild variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                  <Link href="/find-us" className="w-full sm:w-auto">
                    Directions &amp; parking
                  </Link>
                </Button>
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
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
