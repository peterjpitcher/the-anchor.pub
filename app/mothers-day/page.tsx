import { MOTHERS_DAY_SERVICE_DATE } from '@/lib/mothers-day-booking'
import { OccasionMenuNotice, occasionMenuLine } from '@/components/seasonal/OccasionMenuNotice'
import type { Metadata } from 'next'
import Image from 'next/image'
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
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_EVENT_IMAGE, DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import type { SeasonalDynamicFields } from '@/lib/seasonal-utils'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

// A11 dynamic fields. Use this only to surface an owner-confirmed detail for a
// given year (the menu, a one-off offer). Empty by default. Never invent a
// "Mum gets..." offer, free fizz, gift or set menu, the brief rules those out
// unless confirmed.
const MOTHERS_DAY_DYNAMIC: SeasonalDynamicFields = {}

// Mother's Day is a special day, not a normal Sunday: the menu, and how the
// day works, are confirmed nearer the time (docs/SSOT.md sections 4 and 10,
// owner ruling 7 and 8 October 2026). So the page names no dish, no serving
// times and no walk-in promise. It gives the date, the booking button and the
// "confirmed nearer the time" line.
const MOTHERS_DAY_DATE = MOTHERS_DAY_SERVICE_DATE // one source: lib/mothers-day-booking.ts
// Midday UTC, only so the date formats as the same calendar day in London.
const MOTHERS_DAY_MIDDAY_ISO = `${MOTHERS_DAY_DATE}T12:00:00Z`

const MOTHERS_DAY_BOOKING_URL = '/book-table'
const MOTHERS_DAY_BOOKING_CTA_LABEL = 'Book Mother’s Day Lunch'

const eventDateLabelStatic = new Date(MOTHERS_DAY_MIDDAY_ISO).toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London'
})

const eventDateShortStatic = new Date(MOTHERS_DAY_MIDDAY_ISO).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London'
})

const titleStatic = `Mother’s Day Near Staines | Book a Table`
const descriptionStatic =
  `Mother's Day at The Anchor in Stanwell Moor, near Staines. ` +
  `The menu is confirmed nearer the time. Booking ahead is recommended.`
const keywordsStatic =
  "mothers day lunch near me, mothers day pub lunch, mother's day lunch near staines, stanwell moor TW19"

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
    `Make Mother’s Day easy at The Anchor in Stanwell Moor (TW19), ` +
    `near Staines-upon-Thames and Heathrow Terminal 5. Book ahead and let Mum switch off.`

  const faqs = [
    {
      question: 'When is Mother’s Day?',
      answer: `Mother’s Day is on ${eventDateText}.`
    },
    {
      question: 'What is on the Mother’s Day menu?',
      answer: occasionMenuLine("Mother's Day")
    },
    {
      question: 'Do I need to book for Mother’s Day?',
      answer:
        `Booking is recommended, especially for groups, since Mother’s Day always books up quickly. ` +
        `Groups of 15 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.`
    },
    {
      question: 'Where is The Anchor and is there parking?',
      answer:
        `You’ll find us at ${addressLine}. Free on-site parking is available for guests, ` +
        `and we’re easy to reach from Staines-upon-Thames and Heathrow Terminal 5.`
    }
  ]

  return (
    <>
      {/* No Event structured data. What runs on the day is confirmed nearer the
          time (owner, 7 October 2026), so there is no event to describe yet. */}

            <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="Mother's Day"
        kicker={eventDateLabelStatic}
        title="Mother’s Day Near Staines"
        lead={heroDescription}
      />

      <OccasionMenuNotice occasion="Mother's Day" />

      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto grid items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
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
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Menu</p>
                  <p className="text-sm text-ink-muted">{occasionMenuLine("Mother's Day")}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Booking</p>
                  <p className="text-sm text-ink-muted">
                    Mother’s Day always books up quickly, so booking ahead is recommended.
                  </p>
                </div>

                <div className="pt-2">
                  <BookTableButton
                    source="mothers_day_card"
                    context="mothers_day"
                    variant="primary"
                    size="lg"
                    fullWidth
                    wrap
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
              <div>
                <h2 className="text-h3 text-ink-strong">
                  Mother&rsquo;s Day at The Anchor
                </h2>
                <p className="mt-4 text-ink-muted text-lg leading-relaxed">
                  Make Mother&apos;s Day easy. Join us at The Anchor in Stanwell Moor (TW19),
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
              </div>

              <Card accent>
                <CardBody>
                  <div className="rounded-md bg-surface-sunk p-5 border border-line">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                      Booking notes
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                      <li className="flex gap-2">
                        <span className="text-accent-text">•</span>
                        <span>Mother’s Day always books up quickly, so booking ahead is recommended.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent-text">•</span>
                        <span>Groups of 15 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.</span>
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
                      wrap
                      className="w-full sm:w-auto sm:min-w-[240px]"
                      trackingLabel={MOTHERS_DAY_BOOKING_CTA_LABEL}
                      eventName="Mother's Day Lunch"
                      customHref={MOTHERS_DAY_BOOKING_URL}
                    >
                      {MOTHERS_DAY_BOOKING_CTA_LABEL}
                    </BookTableButton>
                    <Button asChild variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                      <Link href="/find-us" className="w-full sm:w-auto">
                        Find Us
                      </Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <SeasonalDynamicDetails
                fields={MOTHERS_DAY_DYNAMIC}
                heading="This year's Mother's Day"
                intro="The latest confirmed details for this year's Mother's Day at The Anchor."
              />

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
        title="Book your Mother's Day table"
        copy={`Mother's Day is on ${eventDateText} at The Anchor in Stanwell Moor (TW19), near Staines-upon-Thames. Mother's Day always books up quickly, so booking ahead is recommended.`}
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
            wrap
          >
            Call or WhatsApp us on {CONTACT.phone}
          </PhoneButton>
        }
      />

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
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
                <Button asChild variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                  <Link href="/find-us" className="w-full sm:w-auto">
                    Directions & parking
                  </Link>
                </Button>
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

      <FAQAccordionWithSchema title="Mother’s Day FAQs" faqs={faqs} />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: MOTHERS_DAY_BOOKING_URL, title: 'Book your Mother’s Day table', description: 'Reserve online in minutes' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
