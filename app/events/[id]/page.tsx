import { Metadata } from 'next'
import { getEventHeroImage, getEventSquareImage, getEventImage } from '@/lib/event-image'
import { EventArtworkHero } from '@/components/events/EventArtworkHero'
import Image from 'next/image'
import Link from 'next/link'
import { permanentRedirect } from 'next/navigation'
import { Button, Container, Card, CardBody, Alert, Badge } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { InteriorHero } from '@/components/hero'
import { anchorAPI, formatEventDate, formatEventTime, formatDoorTime, formatEventDuration } from '@/lib/api'
import { EventPageTracker } from '@/components/tracking/EventPageTracker'
import { PhoneButton } from '@/components/PhoneButton'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { getEventWebsitePath } from '@/lib/event-url'
import { EventSecondaryActions } from '@/components/events/EventSecondaryActions'
import { EventBookingFactsStrip } from '@/components/events/EventBookingFactsStrip'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import {
  formatClockTime,
  getEventBookingBlockReason,
  getEventBookingModeLabel,
  getEventCanonicalSegment,
  getEventStatusLabel,
  isEventBookingClosed,
  isEventInPast,
  normalizeEventStatus
} from '@/lib/event-lifecycle'
import {
  buildMothersDayBookingUrl,
  isMothersDayEvent,
  MOTHERS_DAY_BOOKING_CTA_LABEL
} from '@/lib/mothers-day-booking'
import { getEventPriceLabel } from '@/lib/event-pricing'
import { getEventBookingCopy } from '@/lib/event-booking-copy'
import { getEventBookingHeroStatement } from '@/lib/event-booking-experience'
import { getEventSeoStrategy, getCategoryPageUrl, isDiscontinuedFormatEvent, getDiscontinuedFormatReplacement, getSafeAccessibilityNotes, CANCELLED_INDEX_DAYS } from '@/lib/event-seo-strategy'
import { getEventPresentation } from '@/lib/event-presentation'
import { getEventMetaDescription, getDisplayableFaqs, getEventHeroLead } from '@/lib/event-copy'
import { getEventSocialCopy } from '@/lib/event-social-copy'
import { getUpcomingEventsByCategory, isRetiredEvent } from '@/lib/api/events'
import type { Event } from '@/lib/api'
import RelatedEvents from '@/components/events/RelatedEvents'
import LiteYouTube from '@/components/events/LiteYouTube'

type Props = {
  params: { id: string }
}

function getStatusNotice(
  status: ReturnType<typeof normalizeEventStatus>,
  pastEvent: boolean,
  eventDate?: string
): {
  variant: 'info' | 'warning'
  title: string
  message: string
} | null {
  if (status === 'cancelled') {
    return {
      variant: 'warning',
      title: 'This event has been cancelled',
      message: 'Please see our upcoming events below or call us if you need help.'
    }
  }

  if (status === 'postponed') {
    return {
      variant: 'warning',
      title: 'This event has been postponed',
      message: 'Please check the latest details below before making plans.'
    }
  }

  // Asked before rescheduled and sold_out: a night that sold out and has since
  // happened is over, and "call us to check cancellations" would be nonsense.
  // Cancelled and postponed stay above this, because those nights never took
  // place, so "It took place on <date>" would be false for them.
  if (pastEvent) {
    return {
      variant: 'info',
      title: 'This event has ended',
      message: eventDate
        ? `It took place on ${eventDate}. See below for the next dates.`
        : 'See below for the next dates.'
    }
  }

  if (status === 'rescheduled') {
    return {
      variant: 'info',
      title: 'This event has been rescheduled',
      message: 'Please review the updated date and time before booking.'
    }
  }

  if (status === 'sold_out') {
    return {
      variant: 'info',
      title: 'This event is currently sold out',
      message: 'Call us to check cancellations or alternative options.'
    }
  }

  return null
}

const SALES_CLOSED_COPY = {
  title: 'Online ticket sales have closed',
  message: 'Online ticket sales for this event have closed. Please contact us if you need help.'
} as const

function getBookingDisabledCopy(reason: ReturnType<typeof getEventBookingBlockReason>): {
  title: string
  message: string
} {
  if (reason === 'cancelled') {
    return {
      title: 'Booking unavailable',
      message: 'This event has been cancelled.'
    }
  }

  if (reason === 'sold_out') {
    return {
      title: 'Booking unavailable',
      message: 'This event is sold out right now. Call us to ask about cancellations.'
    }
  }

  if (reason === 'bookings_disabled') {
    return {
      title: 'No booking required',
      message: 'No booking is needed for this event, just turn up!'
    }
  }

  if (reason === 'past') {
    return {
      title: 'Booking unavailable',
      message: 'This event has already taken place.'
    }
  }

  return {
    title: 'Booking unavailable',
    message: 'This event is not available to book online.'
  }
}

function EventHighlights({
  highlights,
  className = '',
  compact = false
}: {
  highlights?: string[] | null
  className?: string
  compact?: boolean
}) {
  if (!Array.isArray(highlights) || highlights.length === 0) {
    return null
  }

  return (
    <Card
      accent className={className}
    >
      <CardBody className={compact ? 'p-3' : 'p-4 md:p-6'}>
        <h3 className={compact ? 'mb-2 text-lg font-semibold leading-tight text-accent-text' : 'text-xl md:text-2xl text-accent-text mb-3 md:mb-4'}>
          Event Highlights
        </h3>
        <ul className={compact ? 'space-y-1' : 'space-y-2'}>
          {highlights.map((highlight, index) => (
            <li key={`${highlight}-${index}`} className={compact ? 'flex items-start gap-2' : 'flex items-start gap-3'}>
              <svg className={compact ? 'mt-0.5 h-4 w-4 flex-shrink-0 text-accent-text' : 'w-5 h-5 text-accent-text flex-shrink-0 mt-0.5'} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className={compact ? 'text-ink-muted text-sm' : 'text-ink-muted text-base'}>
                {highlight.replace(/(\d+,\d+\+?\s+)/g, (match) => match.replace(/\s+/g, '\u00A0'))}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

type EventInformationItem = {
  label: string
  value?: string | null
}

function EventInformationList({ items }: { items: EventInformationItem[] }) {
  const visibleItems = items.filter((item) => item.value)

  return (
    <dl className="grid gap-x-4 gap-y-3 text-sm text-ink-muted sm:grid-cols-2">
      {visibleItems.map((item) => (
        <div key={item.label}>
          <dt className="font-semibold text-accent-text">{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const event = await anchorAPI.getEvent(params.id)
    if (isRetiredEvent(event)) {
      return {
        title: "What's On at The Anchor",
        description: 'See the latest events at The Anchor.',
        alternates: {
          canonical: '/whats-on',
        },
        robots: {
          index: false,
          follow: true,
        },
      }
    }

    const canonical = `/events/${event.slug || params.id}`
    const eventImage = getEventImage(event)
    const imageVersion = event.updated_at
      ? `2-${encodeURIComponent(event.updated_at)}`
      : '2'
    const ogImage = eventImage
      ? `${canonical}/social-image?v=${imageVersion}`
      : `${canonical}/opengraph-image`
    const imageAlt = `${event.name} at The Anchor`
    // Past events never inherit their sales copy. That text was written to sell
    // tickets and is future tense, so on a night that has passed it produces a
    // search result inviting people to book a date months gone.
    const description = getEventMetaDescription(
      event,
      `Join us for ${event.name} at The Anchor in Stanwell Moor. ${formatEventDate(event.startDate)} at ${formatEventTime(event.startDate)}.`,
    )
    const socialCopy = getEventSocialCopy(event)
    const socialTitle = socialCopy?.title || event.metaTitle || event.name
    const socialDescription = socialCopy?.description || getEventMetaDescription(
      event,
      `Event at The Anchor, ${formatEventDate(event.startDate)}`,
    )

    // Indexability comes from getEventSeoStrategy, the same function the page
    // body and app/sitemap.ts use. It previously lived here as its own copy of
    // the rule, which is how the head and the sitemap were free to disagree.
    const shouldNoindex = !getEventSeoStrategy(event).index

    // Merge keyword arrays
    const keywords = [
      ...(event.primary_keywords || []),
      ...(event.secondary_keywords || []),
      ...(event.local_seo_keywords || [])
    ].join(', ') || undefined

    return {
      title: event.metaTitle || event.name,
      description,
      keywords,
      ...(shouldNoindex ? { robots: { index: false, follow: true } } : {}),
      alternates: {
        canonical,
      },
      openGraph: {
        title: socialTitle,
        description: socialDescription,
        url: canonical,
        siteName: 'The Anchor',
        images: [{
          url: ogImage,
          width: 1200,
          height: eventImage ? 1200 : 630,
          alt: imageAlt,
          type: eventImage ? 'image/jpeg' : 'image/png'
        }],
        type: 'website',
      },
      twitter: getTwitterMetadata({
        title: socialTitle,
        description: socialDescription,
        images: [ogImage]
      })
    }
  } catch {
    return {
      title: 'Event Not Found',
      description: 'This event could not be found.',
    }
  }
}

export default async function EventPage({ params }: Props) {
  let event

  try {
    event = await anchorAPI.getEvent(params.id)
  } catch {
    permanentRedirect('/whats-on')
  }

  if (isRetiredEvent(event)) {
    permanentRedirect('/whats-on')
  }

  const canonicalSegment = getEventCanonicalSegment(event)
  if (canonicalSegment && canonicalSegment !== params.id) {
    permanentRedirect(`/events/${encodeURIComponent(canonicalSegment)}`)
  }

  if (!event) {
    permanentRedirect('/whats-on')
  }

  const status = normalizeEventStatus(event)
  if (status === 'draft') {
    permanentRedirect('/whats-on')
  }

  // Past events are never redirected. The page stays live and indexed so its
  // content keeps accumulating; the route into the next date is the on-page
  // link built below, not a 301.
  const isPastEvent = isEventInPast(event)
  const seoStrategy = getEventSeoStrategy(event)

  // The next date in this category, used to point visitors (and link equity)
  // at the live event. Display only, it never changes what URL is served.
  let nextInCategory: Event | null = null
  if (isPastEvent && event.category?.id && status !== 'cancelled') {
    try {
      const upcoming = await getUpcomingEventsByCategory(event.category.id, 1)
      nextInCategory = upcoming.find((e) => e.id !== event.id) || null
    } catch {
      nextInCategory = null
    }
  }

  // Single source of truth for which booking surfaces render. Also drives the
  // JSON-LD via buildEventSchema, so the page and the schema cannot disagree
  // about whether this event is over.
  const presentation = getEventPresentation(event)

  const bookingBlockReason = getEventBookingBlockReason(event)
  // Online ticket sales cutoff: distinct, friendly "sales closed" panel. Only
  // surfaced when nothing more specific (cancelled / sold out / past) applies.
  const bookingClosedByCutoff = !bookingBlockReason && isEventBookingClosed(event)
  const bookingDisabledCopy = bookingBlockReason
    ? getBookingDisabledCopy(bookingBlockReason)
    : bookingClosedByCutoff
      ? SALES_CLOSED_COPY
      : null
  const bookingFormSuppressed = !presentation.showBookingForm
  // A discontinued format has no category page worth sending people to, so it
  // points at the format that replaced it rather than a generic listing.
  const discontinuedReplacement = getDiscontinuedFormatReplacement(event)
  const categoryPageUrl = discontinuedReplacement?.href ?? getCategoryPageUrl(event.category?.slug)
  const categoryPageLabel =
    discontinuedReplacement?.label ?? `All ${event.category?.name} dates`
  const safeAccessibilityNotes = getSafeAccessibilityNotes(event)
  const displayedFaqs = getDisplayableFaqs(
    event.faq || event.faqPage?.mainEntity || [],
    presentation.hasEnded,
  )
  const nextEventHref = nextInCategory ? getEventWebsitePath(nextInCategory) : null
  const nextEventDate = nextInCategory ? formatEventDate(nextInCategory.startDate) : null

  const eventDate = formatEventDate(event.startDate)
  const statusNotice = getStatusNotice(status, isPastEvent, eventDate)
  const eventTime = formatEventTime(event.startDate)
  const headerDoorTime = formatDoorTime(event.doorTime)
  const eventBookingCopy = getEventBookingCopy(event)
  const bookingModeLabel = eventBookingCopy.label || getEventBookingModeLabel(event.booking_mode)
  const isCommunalEvent = typeof event.booking_mode === 'string' && event.booking_mode.trim().toLowerCase() === 'communal'
  const bookingCtaLabel = isCommunalEvent ? 'Book tickets' : 'Reserve table'
  const bookingFormTitle = isCommunalEvent ? 'Book tickets' : 'Reserve table'
  const statusLabel = getEventStatusLabel(status)
  const endTime = formatClockTime(event.end_time)
  const doorsTime = formatClockTime(event.doors_time)
  const lastEntryTime = formatClockTime(event.last_entry_time)
  const durationLabel =
    formatEventDuration(event.duration) ||
    (typeof event.duration_minutes === 'number' && event.duration_minutes > 0
      ? `${event.duration_minutes} minutes`
      : null)
  const priceLabel = getEventPriceLabel(event)
  const locationQuery = [
    event.location?.name,
    event.location?.address?.streetAddress,
    event.location?.address?.addressLocality,
    event.location?.address?.postalCode
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(', ')
  const mothersDayBookingFlow =
    isMothersDayEvent(event) &&
    status !== 'cancelled' &&
    !isPastEvent
  const mothersDayBookingUrl = buildMothersDayBookingUrl()
  const mothersDayBookingCopy =
    'Reserve your Mother’s Day table online. Booking ahead is recommended because this Sunday fills quickly.'
  // The event's own artwork for the hero, landscape first. Null when the event
  // has none, which is what decides between the artwork hero and InteriorHero.
  const eventImageSrc = getEventHeroImage(event)
  const hasOwnArtwork = Boolean(eventImageSrc)
  // Drives the hero's shape, so a square-only event is not letterboxed into a
  // 16:9 frame it was never drawn for.
  const heroArtworkIsWide = Boolean(event.landscapeImageUrl?.trim())
  // The square card in the left column further down. It is an aspect-square
  // container with object-cover, so handing it the landscape crops the sides
  // straight back off again.
  const eventSquareSrc = getEventSquareImage(event)
  const imageAlt = event.image_alt_text || `${event.name} - ${event.category?.name || 'Event'} at The Anchor, Stanwell Moor`
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect fill="${event.category?.color || '#1a1a2e'}" width="1" height="1"/></svg>`
  ).toString('base64')}`
  const heroRoute = `/events/${encodeURIComponent(canonicalSegment || params.id)}`
  // The lead is the largest text after the title, so it is the worst place for
  // the wrong tense. An ended event used to fall straight back to its stored
  // summary, which is sales copy: "Join us for Music Bingo on June 12th! Get
  // ready for big tunes" sat directly under a banner saying it had ended.
  const heroDescription = bookingFormSuppressed
    ? getEventHeroLead(event, getEventBookingHeroStatement(event))
    : getEventBookingHeroStatement(event)
  const heroTags = [
    ...(event.category?.name ? [{ label: event.category.name, variant: 'primary' as const }] : []),
    // Designed artwork already carries the date and start time as part of the
    // design, and the facts strip immediately below repeats both again. Saying
    // it three times makes all three look cheap, so the badges stand down.
    // Doors is kept either way: it is in neither the artwork nor the strip.
    ...(hasOwnArtwork
      ? []
      : [
          { label: eventDate, variant: 'default' as const },
          { label: eventTime, variant: 'default' as const }
        ]),
    ...(headerDoorTime ? [{ label: headerDoorTime, variant: 'default' as const }] : []),
    // Gated on the same flag as the status row in the details list, so the hero
    // cannot say "Status: Sold Out" on a night the rest of the page treats as
    // finished.
    ...(presentation.showStatusRow && status !== 'scheduled'
      ? [{ label: `Status: ${statusLabel}`, variant: 'warning' as const }]
      : [])
  ]

  const heroPrimaryCta = mothersDayBookingFlow ? (
    <Button asChild size="lg" className="w-full sm:w-auto">
      <Link href={mothersDayBookingUrl}>{MOTHERS_DAY_BOOKING_CTA_LABEL}</Link>
    </Button>
  ) : bookingFormSuppressed ? undefined : (
    <EventBookingButton
      event={event}
      className="w-full sm:w-auto"
      fullWidth={false}
      size="lg"
      label={bookingCtaLabel}
      customHref="#event-booking"
      source={`event_page_hero_${params.id}`}
    />
  )

  const heroSecondaryCta = (
    <>
      <PhoneButton
        phone="01753682707"
        source={`event_page_hero_${params.id}`}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
      >
         Call: 01753 682707
      </PhoneButton>
    </>
  )
  const eventInformationItems: EventInformationItem[] = [
    { label: 'Date', value: eventDate },
    { label: 'Start time', value: eventTime },
    { label: 'End time', value: endTime },
    { label: 'Doors open', value: doorsTime },
    { label: 'Last entry', value: lastEntryTime },
    { label: 'Duration', value: durationLabel },
    // "Scheduled" on a night that has already happened reads as though it is
    // still going ahead. "Cancelled" is still worth showing.
    ...(presentation.showStatusRow ? [{ label: 'Status', value: statusLabel }] : []),
    { label: 'Booking type', value: bookingModeLabel },
    { label: 'Event type', value: event.event_type },
    { label: 'Category', value: event.category?.name },
    { label: 'Performer', value: event.performer?.name || event.performer_name },
    { label: 'Price', value: priceLabel }
  ]

  return (
    <>
      <EventSchema event={event} />
      <EventPageTracker
        eventId={event.id}
        eventName={event.name}
        eventDate={event.startDate}
        eventCategory={event.category?.name}
        eventPrice={event.offers?.price ? parseFloat(event.offers.price) : undefined}
        hasEnded={presentation.hasEnded}
      />

      {statusNotice ? (
        // Symmetric vertical padding. This was pt-4 with no bottom padding, which
        // left the notice flush against the hero below it with nothing to separate
        // the two. The scale matches the main content section further down.
        <section className="bg-canvas py-4 sm:py-6">
          <Container>
            <div className="mx-auto">
              <Alert variant={statusNotice.variant} title={statusNotice.title}>
                <p>{statusNotice.message}</p>
                {nextEventHref && (
                  <p className="mt-2">
                    <Link href={nextEventHref} className="font-semibold underline">
                      Next {event.category?.name || 'event'}: {nextEventDate}
                    </Link>
                  </p>
                )}
              </Alert>
            </div>
          </Container>
        </section>
      ) : null}
      {/* Designed artwork is shown clean and unscrimmed; events without their own
          artwork keep the standard photographic interior hero. */}
      {hasOwnArtwork && eventImageSrc ? (
        <EventArtworkHero
          image={eventImageSrc}
          imageAlt={imageAlt}
          wide={heroArtworkIsWide}
          crumb={event.category?.name ?? "What's On"}
          title={event.name}
          lead={heroDescription}
          badges={
            <>
              {heroTags.map((tag) => (
                <Badge key={tag.label} variant="sand">
                  {tag.label}
                </Badge>
              ))}
            </>
          }
          actions={
            <>
              {heroPrimaryCta}
              {heroSecondaryCta}
            </>
          }
        />
      ) : (
        <InteriorHero
          image={DEFAULT_PAGE_HEADER_IMAGE}
          focal="center"
          crumb={event.category?.name ?? "What's On"}
          title={event.name}
          lead={heroDescription}
          badges={
            <>
              {heroTags.map((tag) => (
                <Badge key={tag.label} variant="sand">
                  {tag.label}
                </Badge>
              ))}
            </>
          }
          actions={
            <>
              {heroPrimaryCta}
              {heroSecondaryCta}
            </>
          }
        />
      )}

      <section className="bg-canvas">
        <Container>
          <div className="mx-auto">
            <EventBookingFactsStrip
              event={event}
              eventDate={eventDate}
              eventTime={eventTime}
              variant={presentation.factsVariant}
            />
          </div>
        </Container>
      </section>

      {/* Event Details - Mobile First */}
      <section className="bg-canvas py-4 pb-28 sm:py-6 md:py-8 lg:pb-8">
        <Container>
          <div className="mx-auto">
            {/* Main Content Grid */}
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),minmax(340px,420px)] lg:gap-10">
              {/* Left Column - Event Image and Details */}
              <div className="order-2 lg:order-1">
                {eventSquareSrc && (
                  <div className="relative mx-auto mb-6 hidden aspect-square max-w-md overflow-hidden rounded-2xl shadow-lg lg:block lg:max-w-none">
                    <Image
                      src={eventSquareSrc}
                      alt={imageAlt}
                      fill
                      className="object-cover"
                      sizes="420px"
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                    />
                  </div>
                )}

                <EventHighlights highlights={event.highlights} compact />

                <details className="mb-3 rounded-xl border border-line bg-surface-sunk lg:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-lg font-semibold text-accent-text [&::-webkit-details-marker]:hidden">
                    <span>More event details</span>
                    <span className="text-xl leading-none text-ink-muted" aria-hidden="true">+</span>
                  </summary>
                  <div className="border-t border-line p-3">
                    <EventInformationList items={eventInformationItems} />
                  </div>
                </details>

                <Card accent className="mb-6 mt-6 hidden lg:mb-8 lg:block">
                  <CardBody className="p-4">
                    <h2 className="text-lg font-semibold text-accent-text md:text-xl">Event information</h2>
                    <div className="mt-4">
                      <EventInformationList items={eventInformationItems} />
                    </div>
                  </CardBody>
                </Card>

                {presentation.showBookingPolicy && (
                  <Card accent className="mb-6 hidden lg:mb-8 lg:block">
                    <CardBody className="p-4">
                      <h2 className="text-lg font-semibold text-accent-text md:text-xl">Booking and payment</h2>
                      <div className="mt-3 space-y-2 text-sm text-ink-muted">
                        <p>{eventBookingCopy.policy}</p>
                        <p>{eventBookingCopy.foodPrompt}</p>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Description */}
                {(event.longDescription || event.about || event.description) && (
                  <div className="mb-6 lg:mb-8">
                    <h2 className="text-xl md:text-2xl text-accent-text mb-3 md:mb-4">About This Event</h2>
                    <p className="text-ink-muted whitespace-pre-wrap text-base md:text-lg leading-relaxed">{event.longDescription || event.about || event.description}</p>
                  </div>
                )}

                {/* Category Link */}
                {event.category && (
                  <Link
                    href={getCategoryPageUrl(event.category.slug)}
                    className="inline-flex items-center text-sm text-accent-text hover:text-accent-text hover:underline mb-6"
                  >
                    View all {event.category.name} events &rarr;
                  </Link>
                )}

                {/* Cancellation Policy */}
                {event.cancellation_policy && !eventBookingCopy.suppressRawCancellationPolicy && (
                  <div className="mt-4 mb-6 p-3 rounded-md bg-surface-sunk border border-line">
                    <p className="text-xs font-medium text-accent-text mb-1">Cancellation Policy</p>
                    <p className="text-sm text-ink-muted">{event.cancellation_policy}</p>
                  </div>
                )}

              </div>

              {/* Right Column - Reservation */}
              <div className="order-1 lg:order-2">
                <div className="lg:sticky lg:top-24">
                  {(event.previous_event_summary || event.attendance_note) && (
                    <div className="mb-4 rounded-lg border border-anchor-gold-dark/10 bg-surface-sunk p-4">
                      {event.previous_event_summary && (
                        <p className="text-sm text-ink-muted">
                          <span className="font-medium text-accent-text">Last time:</span> {event.previous_event_summary}
                        </p>
                      )}
                      {event.attendance_note && (
                        <p className="mt-1 text-sm text-ink-muted">
                          {event.attendance_note}
                        </p>
                      )}
                    </div>
                  )}

                  <div id="event-booking" className="mb-3 scroll-mt-24 lg:mb-6">
                    {mothersDayBookingFlow ? (
                      <Card accent>
                        <CardBody className="space-y-3 p-4">
                          <h2 className="text-xl text-accent-text">{MOTHERS_DAY_BOOKING_CTA_LABEL}</h2>
                          <p className="text-sm text-ink-muted">{mothersDayBookingCopy}</p>
                          <Button asChild fullWidth size="lg">
                            <Link href={mothersDayBookingUrl}>
                              {MOTHERS_DAY_BOOKING_CTA_LABEL}
                            </Link>
                          </Button>
                        </CardBody>
                      </Card>
                    ) : bookingFormSuppressed ? (
                      <Alert variant="info" title={bookingDisabledCopy?.title}>
                        <p>{bookingDisabledCopy?.message}</p>
                      </Alert>
                    ) : (
                      <ManagementEventBookingForm
                        event={event}
                        title={bookingFormTitle}
                        compact
                      />
                    )}
                  </div>

                  {presentation.showShareButton && (
                    <div className="mb-6 hidden lg:block">
                      <EventSecondaryActions
                        event={event}
                        source="event_page_sidebar_actions"
                        className="justify-start"
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Width Sections */}
            <div className="mt-6 space-y-5 md:mt-8 md:space-y-8">
              {/* Location */}
              <Card accent>
                <CardBody className="p-4 md:p-8">
                  <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,320px),minmax(0,1fr)] lg:items-start">
                    <div>
                      <h2 className="text-xl md:text-2xl text-accent-text mb-3 md:mb-4">Location</h2>
                      <address className="not-italic text-ink-muted text-base">
                        <p className="font-semibold">{event.location.name}</p>
                        <p>{event.location.address.streetAddress}</p>
                        <p>{event.location.address.addressLocality}, {event.location.address.addressRegion}</p>
                        <p>{event.location.address.postalCode}</p>
                      </address>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href="/find-us"
                          className="inline-flex items-center text-accent-text hover:text-accent-text font-semibold text-base"
                        >
                          Get directions
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <PhoneButton
                          phone="01753682707"
                          source={`event_page_location_${params.id}`}
                          variant="outline"
                          size="sm"
                        >
                           01753 682707
                        </PhoneButton>
                      </div>
                    </div>
                    <GoogleMapEmbed
                      query={locationQuery || 'The Anchor, Stanwell Moor'}
                      className="rounded-xl shadow-sm"
                      height={300}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Accessibility. Withheld entirely when the stored notes carry a
                  claim the SSOT verifies as false, because a wrong accessibility
                  statement is worse than none: someone could plan a visit on it. */}
              {safeAccessibilityNotes && (
                <div className="p-3 rounded-md bg-surface-sunk border border-line">
                  <p className="text-xs font-medium text-accent-text mb-1">Accessibility</p>
                  <p className="text-sm text-ink-muted">{safeAccessibilityNotes}</p>
                </div>
              )}

              {/* FAQs. On an ended event the booking questions go, but the rest
                  stay: they are often the only unique prose on the page, and
                  past pages are kept precisely so that content can accumulate. */}
              {displayedFaqs.length > 0 && (
                <div>
                  <h2 className="text-xl md:text-2xl text-accent-text mb-4 md:mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3 md:space-y-4">
                    {displayedFaqs.map((faq, index) => (
                      <Card key={index} accent>
                        <CardBody className="p-4 md:p-6">
                          <h3 className="font-semibold text-base md:text-lg text-accent-text mb-2">{faq.name}</h3>
                          <p className="text-ink-muted text-sm md:text-base">{faq.acceptedAnswer.text}</p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {event.video && event.video.length > 0 && (
                <div>
                  <h2 className="text-xl md:text-2xl text-accent-text mb-4 md:mb-6">Event Videos</h2>
                  <div className="grid gap-4">
                    {event.video.map((videoUrl, index) => (
                      <div key={index} className="relative aspect-video rounded-none overflow-hidden bg-surface-sunk">
                        {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                          <LiteYouTube url={videoUrl} title={`${event.name} - Video ${index + 1}`} />
                        ) : (
                          <video
                            src={videoUrl}
                            controls
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Related Events */}
          <div className="mx-auto mt-8">
            <RelatedEvents
              currentEventId={event.id}
              categoryId={event.category?.id}
              categoryName={event.category?.name}
            />
          </div>
        </Container>
      </section>

      {/* CTA Section. Once the event is over the booking band is replaced with a
          route into the next one rather than an invitation to book a date that
          has already passed. */}
      {presentation.showBookingCtaBand ? (
        <CtaBand
          title={isCommunalEvent ? 'Ready to book your event tickets?' : 'Ready to reserve your event table?'}
          copy={mothersDayBookingFlow ? mothersDayBookingCopy : getEventBookingHeroStatement(event)}
        >
          {mothersDayBookingFlow ? (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={mothersDayBookingUrl}>{MOTHERS_DAY_BOOKING_CTA_LABEL}</Link>
            </Button>
          ) : bookingFormSuppressed ? null : (
            <EventBookingButton
              event={event}
              className="w-full sm:w-auto"
              fullWidth={false}
              size="lg"
              label={bookingCtaLabel}
              customHref="#event-booking"
              source={`event_page_cta_${params.id}`}
            />
          )}
          <PhoneButton
            phone="01753682707"
            source={`event_page_${params.id}`}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Call: 01753 682707
          </PhoneButton>
        </CtaBand>
      ) : (
        <CtaBand
          title="Looking for the next one?"
          copy={
            discontinuedReplacement
              ? discontinuedReplacement.copy
              : nextEventDate && event.category?.name
                ? `This night has finished. The next ${event.category.name} is ${nextEventDate}.`
                : event.category?.name
                  ? `This night has finished. See when ${event.category.name} is on next, or browse everything coming up at The Anchor.`
                  : 'This night has finished. Browse everything coming up at The Anchor.'
          }
        >
          {nextEventHref ? (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={nextEventHref}>Book the next one</Link>
            </Button>
          ) : null}
          {categoryPageUrl !== '/whats-on' && (
            <Button
              asChild
              variant={nextEventHref ? 'outline' : 'primary'}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href={categoryPageUrl}>{categoryPageLabel}</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/whats-on">See what&rsquo;s on</Link>
          </Button>
        </CtaBand>
      )}
    </>
  )
}

// Generate static params for known events (optional)
export async function generateStaticParams() {
  // For now, return empty array to generate pages on-demand
  // In production, you might want to pre-generate popular events
  return []
}
