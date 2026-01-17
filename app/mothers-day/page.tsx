import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { cache } from 'react'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { EventSchema } from '@/components/seo/EventSchema'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { EventPageTracker } from '@/components/tracking/EventPageTracker'
import { EventBookingButton } from '@/components/EventBookingButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { Badge, Button, Card, CardBody, Container, Section } from '@/components/ui'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { anchorAPI, formatDoorTime, formatEventDate, formatEventDuration, formatEventTime, type Event } from '@/lib/api'
import { DEFAULT_EVENT_IMAGE, DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

export const dynamic = 'force-dynamic'

const MOTHERS_DAY_MATCHER = /mother'?s day|mothering sunday/i

function normaliseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
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

function formatClockTime(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '')
    .replace(/:00(?=[ap]m$)/i, '')
    .toLowerCase()
}

function extractTimes(value: string): string[] {
  const matches = value.match(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi) || []
  const seen = new Set<string>()
  const ordered: string[] = []

  for (const raw of matches) {
    const formatted = formatClockTime(raw)
    if (!seen.has(formatted)) {
      seen.add(formatted)
      ordered.push(formatted)
    }
  }

  return ordered
}

function extractSentence(source: string, pattern: RegExp): string | null {
  const cleaned = normaliseWhitespace(source)
  const flags = pattern.flags.replace(/g/g, '')
  const sentencePattern = new RegExp(`[^.!?]*${pattern.source}[^.!?]*[.!?]`, flags)
  const match = cleaned.match(sentencePattern)
  return match?.[0]?.trim() || null
}

function isMothersDayEvent(event: Event) {
  const haystack = [
    event.name,
    event.description,
    event.about,
    event.slug,
    event.identifier,
    event.keywords
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return MOTHERS_DAY_MATCHER.test(haystack)
}

const getNextMothersDayEvent = cache(async (): Promise<Event | null> => {
  try {
    const now = new Date()
    const fromDate = now.toISOString().split('T')[0]
    const response = await anchorAPI.getEvents({
      from_date: fromDate,
      limit: 200,
      status: 'scheduled'
    })
    const nowMs = Date.now()

    const candidates = (response?.events || [])
      .filter((event) => {
        const startMs = Date.parse(event.startDate)
        return Number.isFinite(startMs) && startMs > nowMs
      })
      .filter(isMothersDayEvent)
      .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))

    return candidates[0] ?? null
  } catch {
    return null
  }
})

export async function generateMetadata(): Promise<Metadata> {
  const event = await getNextMothersDayEvent()

  const eventDateLabel = event
    ? new Date(event.startDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/London'
      })
    : 'Mothering Sunday'

  const title = event?.metaTitle
    ? event.metaTitle
    : event?.name
    ? `${event.name} | Mother's Day at The Anchor`
    : "Mother's Day at The Anchor | Lunch Near Heathrow"

  const description = event?.metaDescription
    ? event.metaDescription
    : event?.description
    ? [
        `Mother’s Day lunch near Heathrow at The Anchor in Stanwell Moor (TW19).`,
        event.description,
        `Date: ${eventDateLabel}.`
      ].join(' ')
    : `Treat Mum to a special Mother’s Day lunch near Heathrow at The Anchor in Stanwell Moor (TW19). Book online to secure your table for ${eventDateLabel}.`

  const keywords = event?.keywords
    ? event.keywords
    : "Mother's Day lunch near Heathrow, Sunday lunch Stanwell Moor, Mother's Day booking, family dining Surrey"

  const socialImages = [
    DEFAULT_PAGE_HEADER_IMAGE,
    event?.image?.[0]
  ].filter((value): value is string => typeof value === 'string' && value.length > 0)

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: '/mothers-day'
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

export default async function MothersDayPage() {
  const event = await getNextMothersDayEvent()

  if (!event) {
    return (
      <>
        <BreadcrumbJsonLd
          items={[
            { name: 'Home', url: '/' },
            { name: "Mother's Day", url: '/mothers-day' }
          ]}
        />

        <HeroWrapper
          route="/mothers-day"
          title="Mother's Day at The Anchor"
          description="Treat Mum to a special lunch near Heathrow. Check back soon for this year’s booking link."
          variant="promo"
          primaryCta={
            <BookTableButton
              source="mothers_day_hero_fallback"
              variant="primary"
              size="lg"
              fullWidth
              className="w-full sm:w-auto"
            >
              📅 Book a Table
            </BookTableButton>
          }
          secondaryCta={
            <Link href="/whats-on" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                🎉 View Events
              </Button>
            </Link>
          }
          secondaryInfo="Prefer to book by phone? Call 01753 682707."
        />

        <Section background="white" spacing="md">
          <Container>
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-green">Mother’s Day bookings</h2>
              <p className="text-gray-700">
                Our Mother’s Day dining is usually published as a dedicated event. As soon as it’s live, this page will show the latest details and booking link.
              </p>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  const eventDate = formatEventDate(event.startDate)
  const eventTime = formatEventTime(event.startDate)
  const doorTime = formatDoorTime(event.doorTime)
  const duration = formatEventDuration(event.duration)
  const eventImage = event.image?.[0] || DEFAULT_EVENT_IMAGE
  const eventPageUrl = `/events/${event.slug || event.id}`
  const heroDescription = event.description || event.shortDescription || undefined
  const aboutText = event.about ? normaliseWhitespace(event.about) : ''

  const sittingSource =
    event.highlights?.find((highlight) => /sitting|sittings/i.test(highlight)) ||
    event.highlights?.join(' ') ||
    aboutText
  const sittingTimes = sittingSource ? extractTimes(sittingSource) : []

  const preorderNote = aboutText ? extractSentence(aboutText, /pre-?orders?/i) : null
  const depositNote = aboutText ? extractSentence(aboutText, /deposit/i) : null
  const dietaryNote = aboutText ? extractSentence(aboutText, /vegetarian|vegan/i) : null

  const hasCookedFromScratchHighlight = Boolean(
    event.highlights?.some((highlight) => /cooked[- ]from[- ]scratch/i.test(highlight))
  )

  const address = event.location?.address
  const addressLine = address
    ? `${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion}, ${address.postalCode}`
    : 'Horton Road, Stanwell Moor, Surrey, TW19 6AQ'
  const mapQuery = address
    ? `${event.location?.name || 'The Anchor Pub'}, ${address.streetAddress}, ${address.postalCode}`
    : 'The Anchor Stanwell Moor TW19 6AQ'

  const faqs = [
    {
      question: 'When is Mother’s Day Lunch at The Anchor?',
      answer: `${event.name} is on ${eventDate}. ${sittingTimes.length ? `Choose from sittings at ${sittingTimes.join(', ')} when booking.` : 'Choose your preferred sitting time when booking.'}`
    },
    {
      question: 'How do I book?',
      answer: 'Use the “Book Mother’s Day Lunch” button on this page to book online via OpenTable (opens in a new tab). Prefer to talk? Call 01753 682707.'
    },
    ...(preorderNote
      ? [
          {
            question: 'Do I need to pre-order?',
            answer: preorderNote
          }
        ]
      : []),
    ...(depositNote
      ? [
          {
            question: 'Is there a deposit?',
            answer: depositNote
          }
        ]
      : []),
    ...(dietaryNote
      ? [
          {
            question: 'Do you have vegetarian or vegan options?',
            answer: dietaryNote
          }
        ]
      : [
          {
            question: 'Do you have vegetarian or vegan options?',
            answer: 'Yes — vegetarian and vegan options are available. Please mention dietary requirements when booking.'
          }
        ]),
    {
      question: 'Where is The Anchor?',
      answer: `You’ll find us at ${addressLine}. See directions and parking on our Find Us page.`
    }
  ]

  const heroLeadParts = [
    hasCookedFromScratchHighlight ? 'Cooked-from-scratch Sunday lunch' : null,
    event.highlights?.some((highlight) => /vegan|vegetarian/i.test(highlight))
      ? 'Vegan & vegetarian options'
      : null,
    sittingTimes.length ? `Sittings: ${sittingTimes.join(' • ')}` : null
  ].filter(Boolean) as string[]
  const heroLeadText = heroLeadParts.join(' • ')

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: "Mother's Day", url: '/mothers-day' }
        ]}
      />

      <EventSchema event={event} />
      <EventPageTracker
        eventId={event.id}
        eventName={event.name}
        eventDate={event.startDate}
        eventPrice={event.offers?.price ? Number.parseFloat(event.offers.price) : undefined}
      />

      <HeroWrapper
        route="/mothers-day"
        title={event.name}
        description={heroDescription}
        eyebrow={eventDate}
        lead={
          heroLeadText ? (
            <p className="text-white/90 text-base sm:text-lg">
              {heroLeadText}
            </p>
          ) : undefined
        }
        variant="promo"
        tags={[
          { label: `⏰ First sitting: ${eventTime}`, variant: 'default' },
          ...(sittingTimes.length
            ? [{ label: `🕒 ${sittingTimes.join(' • ')}`, variant: 'default' as const }]
            : []),
          ...(event.highlights?.some((highlight) => /vegan|vegetarian/i.test(highlight))
            ? [{ label: '🥕 Vegan & vegetarian options', variant: 'success' as const }]
            : []),
          { label: '🍽️ Book via OpenTable', variant: 'success' }
        ]}
        primaryCta={
          <EventBookingButton
            event={event}
            size="xl"
            className="w-full sm:min-w-[260px]"
            label="Book Mother's Day Lunch"
            source="mothers_day_hero"
          />
        }
        secondaryCta={
          <>
            <Link href={eventPageUrl} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                View Full Details
              </Button>
            </Link>
            <PhoneButton
              phone="01753 682707"
              source="mothers_day_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              📞 Call to Book
            </PhoneButton>
          </>
        }
        secondaryInfo="Booking opens in a new tab (OpenTable)."
      />

      <Section background="white" spacing="md">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <Card variant="elevated" className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-anchor-green/10 via-white to-anchor-green/5">
                <Image
                  src={eventImage}
                  alt={`${event.name} promotional poster`}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 80vw, 360px"
                  priority
                />
              </div>
              <CardBody className="space-y-4 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">Date</p>
                  <p className="text-lg font-bold text-anchor-green">{eventDate}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">Sittings</p>
                  <p className="text-lg font-bold text-anchor-green">
                    {sittingTimes.length ? sittingTimes.join(' • ') : `First sitting: ${eventTime}`}
                  </p>
                  {doorTime ? <p className="text-sm text-gray-700">{doorTime}</p> : null}
                  {duration ? <p className="text-sm text-gray-700">{duration}</p> : null}
                </div>

                {event.highlights?.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">Highlights</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {event.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2">
                          <span className="text-anchor-gold">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="pt-2">
                  <EventBookingButton
                    event={event}
                    size="lg"
                    className="w-full"
                    label="Book Mother's Day Lunch"
                    source="mothers_day_card"
                  />
                </div>
              </CardBody>
            </Card>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-anchor-green">
                  Mother’s Day lunch near Heathrow
                </h2>
                <p className="mt-4 text-gray-700 text-lg leading-relaxed">
                  Looking for a Mother&apos;s Day lunch near Heathrow? {event.name} is on {eventDate} at The Anchor in Stanwell Moor
                  (TW19) — a short drive from{' '}
                  <Link
                    href="/near-heathrow/terminal-5"
                    className="font-semibold text-anchor-green hover:text-anchor-green-dark underline decoration-dotted"
                  >
                    Heathrow Terminal 5
                  </Link>
                  , and perfect for family dining in Surrey.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  {event.description}{' '}
                  {sittingTimes.length ? `Choose your preferred sitting (${sittingTimes.join(', ')}) when you book.` : 'Choose your preferred sitting time when you book.'}
                </p>

                {event.about ? (
                  <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h3 className="text-lg font-semibold text-anchor-green">What to expect</h3>
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                      {getTextExcerpt(event.about, 560)}
                    </p>
                    <Link
                      href={eventPageUrl}
                      className="mt-3 inline-flex items-center text-sm font-semibold text-anchor-gold hover:text-anchor-gold-light"
                    >
                      Read the full event details<span className="ml-1">→</span>
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-anchor-green/20 bg-anchor-green/5 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success" size="sm">
                    Bookings recommended
                  </Badge>
                  {hasCookedFromScratchHighlight ? (
                    <Badge variant="default" size="sm">
                      Cooked-from-scratch lunch
                    </Badge>
                  ) : null}
                  {event.highlights?.some((highlight) => /vegan|vegetarian/i.test(highlight)) ? (
                    <Badge variant="default" size="sm">
                      Vegan & vegetarian options
                    </Badge>
                  ) : null}
                </div>

                {(preorderNote || depositNote) && (
                  <div className="mt-5 rounded-2xl bg-white/70 p-5 ring-1 ring-white/60">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-anchor-green">
                      Booking notes
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      {preorderNote ? (
                        <li className="flex gap-2">
                          <span className="text-anchor-gold">•</span>
                          <span>{preorderNote}</span>
                        </li>
                      ) : null}
                      {depositNote ? (
                        <li className="flex gap-2">
                          <span className="text-anchor-gold">•</span>
                          <span>{depositNote}</span>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <EventBookingButton
                    event={event}
                    size="lg"
                    className="w-full sm:w-auto sm:min-w-[240px]"
                    label="Book Mother's Day Lunch"
                    source="mothers_day_body"
                  />
                  <Link href="/find-us" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                      📍 Find Us
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-sm text-gray-700">
                  Booking opens in a new tab (OpenTable).
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card variant="default" className="bg-white">
                  <CardBody className="space-y-2 p-6">
                    <h3 className="text-lg font-semibold text-anchor-green">Getting here</h3>
                    <p className="text-sm text-gray-700">
                      {addressLine}. Near Heathrow and easy to reach from Staines-upon-Thames, Ashford and Windsor.
                    </p>
                    <Link
                      href="/near-heathrow/terminal-5"
                      className="inline-flex items-center text-sm font-semibold text-anchor-green hover:text-anchor-green-dark underline decoration-dotted"
                    >
                      Near Heathrow Terminal 5
                      <span className="ml-1">→</span>
                    </Link>
                    <Link href="/find-us" className="inline-flex items-center text-sm font-semibold text-anchor-gold hover:text-anchor-gold-light">
                      Get directions
                      <span className="ml-1">→</span>
                    </Link>
                  </CardBody>
                </Card>

                <Card variant="default" className="bg-white">
                  <CardBody className="space-y-2 p-6">
                    <h3 className="text-lg font-semibold text-anchor-green">Prefer to talk?</h3>
                    <p className="text-sm text-gray-700">
                      Questions about your booking or special requests? Give us a call and we’ll help.
                    </p>
                    <PhoneButton
                      phone="01753 682707"
                      source="mothers_day_body"
                      variant="outline"
                      size="md"
                      className="w-full"
                    >
                      📞 Call 01753 682707
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
            <h2 className="text-2xl md:text-3xl font-bold text-anchor-green">Book your Mother’s Day lunch</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {event.name} is on {eventDate} at The Anchor in Stanwell Moor (TW19).
              {sittingTimes.length ? ` Choose from sittings at ${sittingTimes.join(', ')} when you book.` : ''}
              {hasCookedFromScratchHighlight ? ' Expect a cooked-from-scratch Sunday lunch, plus a warm family-friendly atmosphere.' : ''}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <EventBookingButton
                event={event}
                size="lg"
                className="w-full sm:w-auto sm:min-w-[240px]"
                label="Book Mother's Day Lunch"
                source="mothers_day_cta"
              />
              <PhoneButton
                phone="01753 682707"
                source="mothers_day_cta"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                📞 Call 01753 682707
              </PhoneButton>
            </div>
            <p className="text-sm text-gray-600">Booking opens in a new tab (OpenTable).</p>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="lg">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-anchor-green">Where we are</h2>
              <p className="text-gray-700 leading-relaxed">
                The Anchor is in Stanwell Moor, Surrey (TW19 6AQ) — close to Heathrow and easy to reach from Staines-upon-Thames,
                Ashford and Windsor. If you’re searching for a Mother&apos;s Day lunch near Heathrow, this is the easy option.
              </p>
              <p className="text-gray-700">
                Address: <span className="font-semibold text-anchor-green">{addressLine}</span>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/find-us" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" fullWidth className="w-full sm:w-auto">
                    📍 Directions & parking
                  </Button>
                </Link>
                <PhoneButton
                  phone="01753 682707"
                  source="mothers_day_location"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  📞 Call 01753 682707
                </PhoneButton>
              </div>
            </div>
            <GoogleMapEmbed query={mapQuery} height={360} />
          </div>
        </Container>
      </Section>

      <FAQAccordionWithSchema title="Mother’s Day FAQs" faqs={faqs} className="bg-gray-50" />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: '/book-table', title: 'Book a Table', description: 'Reserve online in minutes' },
          { href: eventPageUrl, title: "Mother's Day event details", description: 'Full listing and updates' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
