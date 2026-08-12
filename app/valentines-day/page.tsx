import type { Metadata } from 'next'
import { getEventHeroImage, getEventSocialImage } from '@/lib/event-image'
import Image from 'next/image'
import Link from 'next/link'
import { cache } from 'react'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { PhoneButton } from '@/components/PhoneButton'
import { EventSchema } from '@/components/seo/EventSchema'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { SeasonalDynamicDetails } from '@/components/seasonal/SeasonalDynamicDetails'
import { anchorAPI, formatEventDate, formatEventTime, type Event } from '@/lib/api'
import { DEFAULT_EVENT_IMAGE, DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import type { SeasonalDynamicFields } from '@/lib/seasonal-utils'

export const dynamic = 'force-dynamic'

const VALENTINES_DAY_BOOKING_URL =
  '/book-table?purpose=food'

// A11 dynamic fields. Valentine's & Galentine's specials are driven primarily
// by the management API (this page reads live events). Use this manual block
// only for owner-confirmed extras the API does not carry, and it stays empty by
// default so the page reads completely with nothing set. Never invent a set
// menu, prosecco offer, performer or theme, the brief is explicit that those
// must be API-confirmed.
const VALENTINES_DYNAMIC: SeasonalDynamicFields = {}

type ValentinesEventResult = {
  targetYear: number
  event: Event | null
  allMatches: Event[]
}

type TimeRange = {
  start: string
  end: string
}

function normaliseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function formatClockTime(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '')
    .replace(/:00(?=[ap]m$)/i, '')
    .toLowerCase()
}

function formatTimeRange(value: TimeRange): string {
  return `${formatClockTime(value.start)}–${formatClockTime(value.end)}`
}

function extractTimeRange(source: string, pattern: RegExp): TimeRange | null {
  const match = source.match(pattern)
  if (!match?.[1] || !match?.[2]) return null
  return { start: match[1], end: match[2] }
}

function getTextExcerpt(value: string, maxLength: number): string {
  const cleaned = normaliseWhitespace(value)
  if (cleaned.length <= maxLength) return cleaned

  const truncated = cleaned.slice(0, maxLength)
  const lastStop = truncated.lastIndexOf('. ')
  if (lastStop > 160) {
    return truncated.slice(0, lastStop + 1)
  }

  return `${truncated}…`
}

function getNextValentinesYear(now: Date): number {
  const valentinesEnd = new Date(Date.UTC(now.getUTCFullYear(), 1, 14, 23, 59, 59))
  return now.getTime() > valentinesEnd.getTime() ? now.getUTCFullYear() + 1 : now.getUTCFullYear()
}

function isValentinesCandidate(event: Event): boolean {
  const haystack = [
    event.name,
    event.shortDescription,
    event.description,
    event.about,
    event.slug,
    event.identifier,
    event.keywords
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes('valentin')
}

function getFebruaryDateRange(year: number): { fromDate: string; toDate: string } {
  return {
    fromDate: `${year}-02-01`,
    toDate: `${year}-02-28`
  }
}

const getValentinesEvent = cache(async (): Promise<ValentinesEventResult> => {
  const now = new Date()
  const targetYear = getNextValentinesYear(now)
  const { fromDate, toDate } = getFebruaryDateRange(targetYear)

  try {
    const response = await anchorAPI.getEvents({
      from_date: fromDate,
      to_date: toDate,
      limit: 200,
      status: 'scheduled'
    })

    const events = response.events || []
    const matches = events.filter(isValentinesCandidate)

    const valentinesTarget = new Date(Date.UTC(targetYear, 1, 14, 12, 0, 0)).getTime()
    const sorted = [...matches].sort((a, b) => {
      const aMs = Date.parse(a.startDate)
      const bMs = Date.parse(b.startDate)
      const aScore = Number.isFinite(aMs) ? Math.abs(aMs - valentinesTarget) : Number.POSITIVE_INFINITY
      const bScore = Number.isFinite(bMs) ? Math.abs(bMs - valentinesTarget) : Number.POSITIVE_INFINITY
      return aScore - bScore
    })

    return {
      targetYear,
      event: sorted[0] ?? null,
      allMatches: sorted
    }
  } catch {
    return {
      targetYear,
      event: null,
      allMatches: []
    }
  }
})

export async function generateMetadata(): Promise<Metadata> {
  const { event, targetYear } = await getValentinesEvent()
  const eventDateLabel = event
    ? new Date(event.startDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/London'
      })
    : `14 February ${targetYear}`
  const performerName = event?.performer?.name
  const proseccoOffer = event?.highlights?.find((highlight) => /prosecco/i.test(highlight))

  const title = event?.metaTitle
    ? event.metaTitle
    : event?.name
    ? `${event.name} | Valentine's & Galentine's at The Anchor`
    : "Valentine's & Galentine's Near Heathrow | The Anchor Stanwell Moor"

  const description = event?.metaDescription
    ? event.metaDescription
    : event
    ? [
        `Valentine's and Galentine's near Heathrow at The Anchor in Stanwell Moor (TW19).`,
        performerName ? `Live music from ${performerName}.` : 'Good food, proper drinks and a warm welcome.',
        proseccoOffer ? `${proseccoOffer}.` : 'Book early to secure your preferred time.',
        `Date: ${eventDateLabel}.`
      ].join(' ')
    : `Valentine's and Galentine's near Heathrow at The Anchor in Stanwell Moor (TW19). A relaxed night out for couples, friends and small groups, with good food and proper drinks. Book online for ${eventDateLabel}.`

  const keywords = event?.keywords
    ? event.keywords
    : "valentine's day pub near heathrow, galentine's night near heathrow, valentine's dinner stanwell moor, galentine's drinks stanwell moor, relaxed date night pub near heathrow"

  const socialImages = [
    DEFAULT_PAGE_HEADER_IMAGE,
    event ? getEventSocialImage(event) : null
  ].filter((value): value is string => typeof value === 'string' && value.length > 0)

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: '/valentines-day'
    },
    openGraph: {
      title,
      description,
      images: socialImages,
      type: 'website'
    },
    twitter: getTwitterMetadata({
      title,
      description,
      images: socialImages
    })
  }
}

export default async function ValentinesDayPage() {
  const { event, targetYear } = await getValentinesEvent()

  const heroImage = (event ? getEventHeroImage(event) : null) || DEFAULT_EVENT_IMAGE
  const eventDate = event ? formatEventDate(event.startDate) : `14 February ${targetYear}`
  const eventTime = event ? formatEventTime(event.startDate) : 'Evening'
  const eventPageUrl = event ? `/events/${event.slug || event.id}` : '/whats-on'
  const performerName = event?.performer?.name
  const proseccoOffer = event?.highlights?.find((highlight) => /prosecco/i.test(highlight)) || null

  const aboutText = event?.about ? normaliseWhitespace(event.about) : ''
  const dinnerRange = aboutText
    ? extractTimeRange(aboutText, /full menu available from\s+(\d{1,2}:\d{2}\s*(?:AM|PM))\s+to\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i)
    : null
  const lateMenuRange = aboutText
    ? extractTimeRange(aboutText, /late menu[\s\S]*?available from\s+(\d{1,2}:\d{2}\s*(?:AM|PM))\s+to\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i)
    : null
  const musicRange = aboutText
    ? extractTimeRange(aboutText, /music kicks off at\s+(\d{1,2}:\d{2}\s*(?:AM|PM))[\s\S]*?runs until\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i)
    : null
  const partyUntilMidnight = aboutText ? /until midnight/i.test(aboutText) : false

  const isFreeEntry = Boolean(
    event &&
      (event.isAccessibleForFree ||
        (typeof event.offers?.price === 'string' && Number.parseFloat(event.offers.price) === 0) ||
        event.highlights?.some((highlight) => /free entry|no tickets/i.test(highlight)))
  )

  const address = event?.location?.address
  const addressLine = address
    ? `${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion}, ${address.postalCode}`
    : 'Horton Road, Stanwell Moor, Surrey, TW19 6AQ'
  const mapQuery = address
    ? `${event?.location?.name || 'The Anchor'}, ${address.streetAddress}, ${address.postalCode}`
    : 'The Anchor Stanwell Moor TW19 6AQ'

  const faqs = event
    ? [
        {
          question: "When is Valentine's Day at The Anchor?",
          answer: `${event.name} is on ${eventDate}. The event starts at around ${eventTime}.`
        },
        {
          question: 'Can I come for Galentine’s with friends?',
          answer:
            'Absolutely. Valentine’s and Galentine’s are both welcome here, and so are couples, friends and small groups. There’s no couples-only rule, just book a table for your group and enjoy the night.'
        },
        {
          question: 'Is it free entry?',
          answer: isFreeEntry
            ? 'Yes, entry is free (no tickets needed). We recommend booking a table to guarantee your spot.'
            : 'Please use the booking link on this page for the latest entry and booking details.'
        },
        {
          question: 'What time is food served?',
          answer: dinnerRange
            ? `Our full menu is available ${formatTimeRange(dinnerRange)}. ${lateMenuRange ? `A late menu runs ${formatTimeRange(lateMenuRange)}.` : ''}`.trim()
            : 'Our full menu is served earlier in the evening. Book your table to dine.'
        },
        {
          question: 'What time does the live music start?',
          answer: musicRange
            ? `Live music runs ${formatTimeRange(musicRange)}${partyUntilMidnight ? ', followed by party tunes until midnight.' : '.'}`
            : `The event is listed for ${eventTime}. Check the event details for the latest running order.`
        },
        {
          question: 'How do I book?',
          answer:
            "Book online via our table booking page, or call 01753 682707 if you're booking for 8+ guests or need help with a special request."
        },
        {
          question: 'Where is The Anchor?',
          answer: `You'll find us at ${addressLine}. We're seven minutes from Heathrow Terminal 5 with free on-site parking.`
        }
      ]
    : [
        {
          question: "When is Valentine's Day at The Anchor?",
          answer: `Valentine's Day is 14 February ${targetYear}, and Galentine's lands around the same time. We'll publish this year's details here as soon as they're confirmed.`
        },
        {
          question: 'Can I come for Galentine’s with friends?',
          answer:
            'Yes. Valentine’s and Galentine’s are both welcome, and so are couples, friends and small groups. There’s no couples-only rule, just book a table for your group.'
        },
        {
          question: 'How do I book?',
          answer:
            "Book online via our table booking page, or call 01753 682707 if you're booking for 8+ guests or need help with a special request."
        }
      ]

  return (
    <>

      {event && <EventSchema event={event} />}

            <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Valentine's & Galentine's"
        kicker={eventDate}
        title="Valentine's and Galentine's at The Anchor"
        lead={`${event?.description || "Good food, proper drinks and a relaxed night out with the people you love spending time with. Valentine's and Galentine's near Heathrow at The Anchor in Stanwell Moor (TW19)."} ${performerName ? `Live music from ${performerName}. ` : ''}Free parking • Seven minutes from Heathrow Terminal 5`}
      />

      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <Card accent className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-surface-sunk">
                <Image
                  src={heroImage}
                  alt={event ? `${event.name} promotional poster` : "Valentine's Day event poster"}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 80vw, 360px"
                  priority
                />
              </div>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Date</p>
                  <p className="text-lg font-bold text-accent-text">{eventDate}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Time</p>
                  <p className="text-lg font-bold text-accent-text">{eventTime}</p>
                </div>
                {event?.highlights?.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Highlights</p>
                    <ul className="space-y-2 text-sm text-ink-muted">
                      {event.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2">
                          <span className="text-accent-text">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardBody>
            </Card>

            <div className="space-y-6">
              <div>
                <h2 className="text-h3 text-ink-strong">
                  Valentine's and Galentine's near Heathrow
                </h2>
                <p className="mt-4 text-ink-muted text-lg leading-relaxed">
                  Spend Valentine's or Galentine's at The Anchor in Stanwell Moor, a relaxed village pub with free
                  parking, seven minutes from{' '}
                  <Link href="/near-heathrow/terminal-5" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                    Heathrow Terminal 5
                  </Link>
                  . Couples, friends and small groups all welcome, this is a good food, proper drinks kind of night,
                  not a stuffy romantic restaurant.
                </p>
                <p className="mt-3 text-ink-muted leading-relaxed">
                  Galentine's is just as much a part of it as Valentine's. Round up your favourite people, book a
                  table, and settle in for an easy evening with no fuss and no pressure.
                </p>
                <p className="mt-3 text-ink-muted leading-relaxed">
                  {event
                    ? `This year's event is ${event.name} on ${eventDate}. ${isFreeEntry ? 'Entry is free, book your table and enjoy the night.' : 'Book early to secure your place.'}`
                    : "We'll publish this year's Valentine's and Galentine's details here as soon as they're confirmed. In the meantime, you can still book a table below."}
                </p>

                {!event && (
                  <div className="mt-6">
                    <SeasonalDynamicDetails
                      fields={VALENTINES_DYNAMIC}
                      heading="This year's Valentine's & Galentine's"
                      intro="What we can confirm so far for this year at The Anchor."
                    />
                  </div>
                )}

                {event?.about && (
                  <Card accent className="mt-6">
                    <CardBody>
                      <h3 className="text-lg font-semibold text-ink-strong">What to expect</h3>
                      <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                        {getTextExcerpt(event.about, 520)}
                      </p>
                      <Link
                        href={eventPageUrl}
                        className="mt-3 inline-flex items-center text-sm font-semibold text-accent-text hover:text-anchor-gold"
                      >
                        Read the full event details<span className="ml-1">→</span>
                      </Link>
                    </CardBody>
                  </Card>
                )}
              </div>

              {event ? (
                <Card accent>
                  <CardBody>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="success">
                        {isFreeEntry ? 'Free entry' : 'Booking recommended'}
                      </Badge>
                      {performerName ? (
                        <Badge variant="green">
                          {`Live music: ${performerName}`}
                        </Badge>
                      ) : null}
                      <Badge variant="green">
                        Dinner bookings recommended
                      </Badge>
                      {proseccoOffer ? (
                        <Badge variant="green">
                          {proseccoOffer}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <div className="w-full sm:w-auto">
                        <Button
                          asChild
                          variant="primary"
                          size="lg"
                          fullWidth
                          className="w-full sm:w-auto sm:min-w-[220px]"
                        >
                          <a href={VALENTINES_DAY_BOOKING_URL}>
                            Book a Table
                          </a>
                        </Button>
                      </div>
                      <Link href={`/events/${event.slug || event.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" fullWidth className="sm:min-w-[200px]">
                          View full event details
                        </Button>
                      </Link>
                    </div>

                    {(dinnerRange || musicRange || lateMenuRange || partyUntilMidnight) && (
                      <div className="mt-6 rounded-md bg-surface-sunk p-5 border border-line">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                          Timings at a glance
                        </h3>
                        <dl className="mt-3 space-y-2 text-sm text-ink-muted">
                          {dinnerRange && (
                            <div className="flex items-start justify-between gap-6">
                              <dt className="font-semibold text-ink-strong">Full menu</dt>
                              <dd className="text-right">{formatTimeRange(dinnerRange)}</dd>
                            </div>
                          )}
                          {musicRange && (
                            <div className="flex items-start justify-between gap-6">
                              <dt className="font-semibold text-ink-strong">Live music</dt>
                              <dd className="text-right">{formatTimeRange(musicRange)}</dd>
                            </div>
                          )}
                          {lateMenuRange && (
                            <div className="flex items-start justify-between gap-6">
                              <dt className="font-semibold text-ink-strong">Late menu</dt>
                              <dd className="text-right">{formatTimeRange(lateMenuRange)}</dd>
                            </div>
                          )}
                          {partyUntilMidnight && (
                            <div className="flex items-start justify-between gap-6">
                              <dt className="font-semibold text-ink-strong">Party tunes</dt>
                              <dd className="text-right">until midnight</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ) : (
                <Card accent>
                  <CardBody>
                    <p className="font-semibold text-ink-strong">We're updating our Valentine's and Galentine's listings.</p>
                    <p className="mt-2 text-sm text-ink-muted">
                      In the meantime, book online via our table booking page or call us to reserve your table, for two
                      or for the whole group.
                    </p>
                  </CardBody>
                </Card>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardBody className="space-y-2">
                    <h2 className="text-lg font-semibold text-ink-strong">Getting here</h2>
                    <p className="text-sm text-ink-muted">
                      {addressLine}. Free parking on site, seven minutes from Heathrow Terminal 5, and outside the ULEZ.
                    </p>
                    <Link href="/find-us" className="inline-flex items-center text-sm font-semibold text-accent-text hover:text-anchor-gold">
                      Get directions
                      <span className="ml-1">→</span>
                    </Link>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="space-y-2">
                    <h2 className="text-lg font-semibold text-ink-strong">Prefer to talk?</h2>
                    <p className="text-sm text-ink-muted">
                      Booking for 8+ or need a special request? Give us a call and we'll sort it.
                    </p>
                    <PhoneButton
                      phone="01753 682707"
                      source="valentines_body"
                      variant="outline"
                      size="md"
                      className="w-full"
                    >
                      Call 01753 682707
                    </PhoneButton>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Book your Valentine's or Galentine's table"
        copy="We take online bookings on our table booking page. Choose your date, time and party size, whether it's a table for two or the whole group, and book early to get your preferred slot."
        primary={
          <Button asChild variant="primary" size="lg">
            <a href={VALENTINES_DAY_BOOKING_URL}>Book a Table Online</a>
          </Button>
        }
        secondary={
          <PhoneButton
            phone="01753 682707"
            source="valentines_cta"
            variant="outline"
            size="lg"
          >
            Call 01753 682707
          </PhoneButton>
        }
      />

      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <h2 className="text-h3 text-ink-strong">Where we are</h2>
                <p className="text-ink-muted leading-relaxed">
                  The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), a quick drive from Heathrow and easy to reach
                  from Staines-upon-Thames, Ashford and Windsor. If you're after a relaxed Valentine's or Galentine's
                  night out near Heathrow, this is the easy, stress-free option with free parking.
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
                    phone="01753 682707"
                    source="valentines_location"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Call 01753 682707
                  </PhoneButton>
                </div>
              </div>
              <GoogleMapEmbed query={mapQuery} height={360} />
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema title="Valentine's Day FAQs" faqs={faqs} />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: VALENTINES_DAY_BOOKING_URL, title: 'Book a Table', description: 'Reserve online in minutes' },
          ...(event
            ? [{ href: eventPageUrl, title: "Valentine's event details", description: 'Full listing and updates' }]
            : [{ href: '/whats-on', title: "What's On", description: 'Upcoming events and entertainment' }]),
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
