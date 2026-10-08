import { OccasionMenuNotice, occasionMenuLine } from '@/components/seasonal/OccasionMenuNotice'
import { getFathersDay, nextOccurrence, formatOccasionLabel } from '@/lib/recurring-dates'
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
import { CONTACT, HEATHROW_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import type { SeasonalDynamicFields } from '@/lib/seasonal-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'

// The date is worked out, never typed (UK Father's Day is the third Sunday in
// June). Father's Day is a special day, not a normal Sunday: the menu, and how
// the day works, are confirmed nearer the time (docs/SSOT.md sections 4 and
// 10, owner ruling 7 and 8 October 2026). So the page names no dish, no
// serving times and no walk-in promise.
const FATHERS_DAY_DATE = nextOccurrence(getFathersDay)
const FATHERS_DAY_LABEL = formatOccasionLabel(FATHERS_DAY_DATE)

const FATHERS_DAY_BOOKING_URL = '/book-table'

// A11 dynamic fields. Use this only for an owner-confirmed detail for a given
// year. Empty by default. Never invent a free pint, dad discount, steak
// special or ticketed event, the brief rules those out unless confirmed.
const FATHERS_DAY_DYNAMIC: SeasonalDynamicFields = {}

const FATHERS_DAY_DESCRIPTION =
  "Father's Day at The Anchor near Heathrow. The menu is confirmed nearer the time. Beer garden, free parking, booking recommended."

export const metadata: Metadata = {
  title: "Father's Day Pub Lunch Near Heathrow",
  description: FATHERS_DAY_DESCRIPTION,
  alternates: { canonical: '/fathers-day' },
  openGraph: {
    title: "Father's Day Pub Lunch Near Heathrow | The Anchor",
    description: FATHERS_DAY_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: "Father's Day Pub Lunch Near Heathrow | The Anchor",
    description: FATHERS_DAY_DESCRIPTION,
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  })
}

export default function FathersDayPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: "What's on the Father's Day menu?",
      answer: occasionMenuLine("Father's Day")
    },
    {
      question: "Do I need to book for Father's Day?",
      answer:
        "Booking is recommended, especially for groups, since it's one of our busiest Sundays. " +
        "Groups of 15 or more take a £10 per person deposit on booking, fully deducted from the bill on the day."
    },
    {
      question: "Where to take Dad on Father's Day near Heathrow?",
      answer:
        "The Anchor in Stanwell Moor, 7 minutes from Heathrow Terminal 5 by car, with 20 free parking spaces, a dog-friendly beer garden and planes passing overhead every 90 seconds. " +
        "It's a proper local pub, not a chain."
    },
    {
      question: 'Is there a set menu or special pricing?',
      answer: occasionMenuLine("Father's Day")
    },
    {
      question: 'Is there parking?',
      answer:
        `Yes, we have 20 free parking spaces on site. No meters, no charges. ` +
        `We're about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.`
    }
  ]

  return (
    <>
      {/* No Event structured data. What runs on the day is confirmed nearer the
          time (owner, 7 October 2026), so there is no event to describe yet. */}

            <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="Father's Day"
        kicker={FATHERS_DAY_LABEL}
        title="Father’s Day at The Anchor"
        lead="A cold pint, planes coming in low overhead, and the family all in one place. That's Father's Day sorted."
      />

      <OccasionMenuNotice occasion="Father's Day" />

      {/* Treat Dad, Father's Day pub lunch */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Treat Dad to a Proper Father&rsquo;s Day Pub Lunch
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Father&apos;s Day lands on a Sunday, so get the family together and book Dad a table.
              Deposits only apply to groups of 15 or more.
            </p>

            <SeasonalDynamicDetails
              fields={FATHERS_DAY_DYNAMIC}
              heading="This year's Father's Day"
              intro="The latest confirmed details for this year's Father's Day at The Anchor."
            />
          </div>
        </Container>
      </section>

      {/* Where to take Dad */}
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Where to Take Dad Near Heathrow
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              The short answer: a proper Father&apos;s Day pub near me, not a chain restaurant, not a hotel buffet.
              The Anchor in Stanwell Moor is 7 minutes from Heathrow Terminal 5, with 20 free parking spaces, a dog-friendly
              beer garden, and a plane every 90 seconds that gives Dad a perfectly valid reason to sit outside as long as he likes.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Drinks from the bar, the family all in one place,
              and nobody&apos;s rushing to feed a meter. With free parking on site and only {HEATHROW_TIMES.terminal5} minutes
              from Heathrow T5, it&apos;s easy to get to from anywhere nearby.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="green">Planes every 90 seconds</Badge>
              <Badge variant="success">Free parking</Badge>
              <Badge variant="green">Dog-friendly</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* The Beer Garden */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto space-y-6">
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
        <Container>
          <div className="mx-auto space-y-6">
            <h2 className="text-h3 text-ink-strong">
              Not Sure What to Get?
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Book the table and tell Dad you&apos;re taking him to the pub. He&apos;ll love it.
            </p>
            <p className="text-ink-muted leading-relaxed">
              A lunch he doesn&apos;t have to cook, a beer he doesn&apos;t have to pour,
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
        copy={`Father's Day is on ${FATHERS_DAY_LABEL}. Book ahead, deposits only apply to groups of 15 or more.`}
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
            wrap
          >
            Call or WhatsApp us on {CONTACT.phone}
          </PhoneButton>
        }
      />

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
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
