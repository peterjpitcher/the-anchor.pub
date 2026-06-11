import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cache } from 'react'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { PhoneButton } from '@/components/PhoneButton'
import { EventSchema } from '@/components/seo/EventSchema'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { anchorAPI, formatEventDate, formatEventTime, type Event } from '@/lib/api'
import { DEFAULT_EVENT_IMAGE, DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'

export const dynamic = 'force-dynamic'

const VALENTINES_DAY_BOOKING_URL =
  '/book-table?purpose=food'

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
    ? `${event.name} | Valentine's Day at The Anchor`
    : "Valentine's Day Dinner Near Heathrow | The Anchor Stanwell Moor"

  const description = event?.metaDescription
    ? event.metaDescription
    : event
    ? [
        `Celebrate Valentine's Day near Heathrow at The Anchor in Stanwell Moor (TW19).`,
        performerName ? `Live music from ${performerName}.` : 'Live music, great food and a brilliant atmosphere.',
        proseccoOffer ? `${proseccoOffer}.` : 'Book early to secure your preferred time.',
        `Date: ${eventDateLabel}.`
      ].join(' ')
    : `Celebrate Valentine's Day near Heathrow at The Anchor in Stanwell Moor (TW19). Romantic dining, great atmosphere, and online table bookings for ${eventDateLabel}.`

  const keywords = event?.keywords
    ? event.keywords
    : 'valentines day stanwell moor, valentines near heathrow, romantic dinner TW19, live music valentines'

  const socialImages = [
    DEFAULT_PAGE_HEADER_IMAGE,
    event?.image?.[0]
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

  const heroImage = event?.image?.[0] || DEFAULT_EVENT_IMAGE
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
          question: 'Is it free entry?',
          answer: isFreeEntry
            ? 'Yes, entry is free (no tickets needed). We recommend booking a table for dinner to guarantee your spot.'
            : 'Please use the booking link on this page for the latest entry and booking details.'
        },
        {
          question: 'What time is food served?',
          answer: dinnerRange
            ? `Our full menu is available ${formatTimeRange(dinnerRange)}. ${lateMenuRange ? `A late menu runs ${formatTimeRange(lateMenuRange)}.` : ''}`.trim()
            : 'Our full menu is served earlier in the evening. Book your table to dine before the music.'
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
          answer: `Valentine's Day is 14 February ${targetYear}. We'll publish this year's details here as soon as they're confirmed.`
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
        crumb="Valentine's Day"
        kicker={eventDate}
        title="Valentine's Day Dinner at The Anchor"
        lead={`${event?.description || "Book early for Valentine's Day near Heathrow at The Anchor in Stanwell Moor (TW19)."} ${performerName ? `Live music from ${performerName}. ` : 'Live music, great food and a brilliant atmosphere. '}Free parking • Seven minutes from Heathrow Terminal 5`}
      />

      <Section spacing="md" background="white">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <Card className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-anchor-green-raised">
                <Image
                  src={heroImage}
                  alt={event ? `${event.name} promotional poster` : "Valentine's Day event poster"}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 80vw, 360px"
                  priority
                />
              </div>
              <CardBody className="space-y-4 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-anchor-cream-text/70">Date</p>
                  <p className="text-lg font-bold text-anchor-gold-bright">{eventDate}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-anchor-cream-text/70">Time</p>
                  <p className="text-lg font-bold text-anchor-gold-bright">{eventTime}</p>
                </div>
                {event?.highlights?.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-anchor-cream-text/70">Highlights</p>
                    <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                      {event.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2">
                          <span className="text-anchor-gold-dark">•</span>
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
                <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">
                  Valentine's Day dinner near Heathrow
                </h2>
                <p className="mt-4 text-anchor-cream-text/70 text-lg leading-relaxed">
                  Celebrate Valentine's Day in Stanwell Moor at The Anchor, a cosy village pub with free parking,
                  seven minutes from{' '}
                  <Link href="/near-heathrow/terminal-5" className="font-semibold text-anchor-gold-dark hover:text-anchor-gold underline decoration-dotted">
                    Heathrow Terminal 5
                  </Link>
                  .
                </p>
                <p className="mt-3 text-anchor-cream-text/70 leading-relaxed">
                  {event
                    ? `This year's Valentine's event is ${event.name} on ${eventDate}. ${isFreeEntry ? 'Entry is free, book your table for dinner and enjoy the night.' : 'Book early to secure your place.'}`
                    : "We'll publish this year's Valentine's details here as soon as they're confirmed. In the meantime, you can still book a regular table below."}
                </p>

                {event?.about && (
                  <div className="mt-6 rounded-2xl bg-anchor-green-raised p-6 border border-anchor-gold-dark/15">
                    <h3 className="text-lg font-semibold text-anchor-gold-bright">What to expect</h3>
                    <p className="mt-3 text-sm text-anchor-cream-text/70 leading-relaxed">
                      {getTextExcerpt(event.about, 520)}
                    </p>
                    <Link
                      href={eventPageUrl}
                      className="mt-3 inline-flex items-center text-sm font-semibold text-anchor-gold-dark hover:text-anchor-gold"
                    >
                      Read the full event details<span className="ml-1">→</span>
                    </Link>
                  </div>
                )}
              </div>

              {event ? (
                <div className="rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="success">
                      {isFreeEntry ? 'Free entry' : 'Booking recommended'}
                    </Badge>
                    <Badge variant="green">
                      {performerName ? `Live music: ${performerName}` : 'Live music'}
                    </Badge>
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
                    <div className="mt-6 rounded-2xl bg-anchor-green-card p-5 border border-anchor-gold-dark/15">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-anchor-gold-bright">
                        Timings at a glance
                      </h3>
                      <dl className="mt-3 space-y-2 text-sm text-anchor-cream-text/70">
                        {dinnerRange && (
                          <div className="flex items-start justify-between gap-6">
                            <dt className="font-semibold text-anchor-gold-bright">Full menu</dt>
                            <dd className="text-right">{formatTimeRange(dinnerRange)}</dd>
                          </div>
                        )}
                        {musicRange && (
                          <div className="flex items-start justify-between gap-6">
                            <dt className="font-semibold text-anchor-gold-bright">Live music</dt>
                            <dd className="text-right">{formatTimeRange(musicRange)}</dd>
                          </div>
                        )}
                        {lateMenuRange && (
                          <div className="flex items-start justify-between gap-6">
                            <dt className="font-semibold text-anchor-gold-bright">Late menu</dt>
                            <dd className="text-right">{formatTimeRange(lateMenuRange)}</dd>
                          </div>
                        )}
                        {partyUntilMidnight && (
                          <div className="flex items-start justify-between gap-6">
                            <dt className="font-semibold text-anchor-gold-bright">Party tunes</dt>
                            <dd className="text-right">until midnight</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-6 text-anchor-cream-text/70">
                  <p className="font-semibold text-anchor-cream-text">We're updating our Valentine's listings.</p>
                  <p className="mt-2 text-sm">
                    In the meantime, book online via our table booking page or call us to reserve your table.
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardBody className="space-y-2 p-6">
                    <h2 className="text-lg font-semibold text-anchor-gold-bright">Getting here</h2>
                    <p className="text-sm text-anchor-cream-text/70">
                      {addressLine}. Free parking on site, seven minutes from Heathrow Terminal 5, and outside the ULEZ.
                    </p>
                    <Link href="/find-us" className="inline-flex items-center text-sm font-semibold text-anchor-gold-dark hover:text-anchor-gold">
                      Get directions
                      <span className="ml-1">→</span>
                    </Link>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="space-y-2 p-6">
                    <h2 className="text-lg font-semibold text-anchor-gold-bright">Prefer to talk?</h2>
                    <p className="text-sm text-anchor-cream-text/70">
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
      </Section>

      <Section background="gray" spacing="lg">
        <Container size="lg">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">Book your Valentine's table</h2>
            <p className="text-anchor-cream-text/70 text-lg">
              We take online bookings on our table booking page. Choose your date, time, and party size, and book early to get your preferred slot.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="primary" size="lg" fullWidth className="w-full sm:w-auto">
                <a href={VALENTINES_DAY_BOOKING_URL}>
                  Book a Table Online
                </a>
              </Button>
              <PhoneButton
                phone="01753 682707"
                source="valentines_cta"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call 01753 682707
              </PhoneButton>
            </div>
            <p className="text-sm text-anchor-cream-text/70">Tables for 8+ guests, please call.</p>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container size="lg">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-anchor-cream-text">Where we are</h2>
                <p className="text-anchor-cream-text/70 leading-relaxed">
                  The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), a quick drive from Heathrow and easy to reach
                  from Staines-upon-Thames, Ashford and Windsor. If you're searching for a Valentine's Day restaurant
                  near Heathrow, this is the easy, stress-free option with free parking.
                </p>
                <p className="text-anchor-cream-text/70">
                  Address: <span className="font-semibold text-anchor-gold-bright">{addressLine}</span>
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
      </Section>

      <FAQAccordionWithSchema title="Valentine's Day FAQs" faqs={faqs} className="bg-anchor-green-deep" />

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
