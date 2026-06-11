import { Metadata } from 'next'
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
import { getEventSeoStrategy, getCategoryPageUrl, isFallbackEvent, PAST_EVENT_REDIRECT_DAYS, CANCELLED_INDEX_DAYS } from '@/lib/event-seo-strategy'
import { getUpcomingEventsByCategory, isRetiredEvent } from '@/lib/api/events'
import RelatedEvents from '@/components/events/RelatedEvents'
import LiteYouTube from '@/components/events/LiteYouTube'

type Props = {
  params: { id: string }
}

function getStatusNotice(status: ReturnType<typeof normalizeEventStatus>, pastEvent: boolean): {
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

  if (pastEvent) {
    return {
      variant: 'info',
      title: 'This event has ended',
      message: 'Browse our upcoming events for the latest listings.'
    }
  }

  return null
}

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
        title: 'Live Music at The Anchor',
        description: 'See the latest live music events at The Anchor.',
        alternates: {
          canonical: '/live-music',
        },
        robots: {
          index: false,
          follow: true,
        },
      }
    }

    const canonical = `/events/${event.slug || params.id}`
    const ogImage = `${canonical}/opengraph-image`
    const description =
      event.metaDescription ||
      event.shortDescription ||
      event.description ||
      `Join us for ${event.name} at The Anchor in Stanwell Moor. ${formatEventDate(event.startDate)} at ${formatEventTime(event.startDate)}.`
    
    // Determine if event should be noindexed
    const eventDate = Date.parse(event.startDate)
    const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)
    const eventStatus = normalizeEventStatus(event)
    const shouldNoindex =
      (daysSinceEvent > PAST_EVENT_REDIRECT_DAYS) ||
      (eventStatus === 'cancelled' && daysSinceEvent > CANCELLED_INDEX_DAYS)

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
        title: event.metaTitle || event.name,
        description: event.shortDescription || event.description || `Event at The Anchor - ${formatEventDate(event.startDate)}`,
        url: canonical,
        siteName: 'The Anchor',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${event.name} at The Anchor`
          }
        ],
        type: 'website',
      },
      twitter: getTwitterMetadata({
        title: event.metaTitle || event.name,
        description,
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
    permanentRedirect('/live-music')
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

  // Event lifecycle SEO strategy, redirect stale past events to next upcoming event
  const isPastEvent = isEventInPast(event)
  if (isPastEvent) {
    // Only look up the next event for past (non-cancelled) events.
    // Cancelled events never redirect, they render with a cancelled banner.
    let nextEvent = null
    if (event.category?.id && normalizeEventStatus(event) !== 'cancelled') {
      try {
        const upcoming = await getUpcomingEventsByCategory(event.category.id, 1)
        const validUpcoming = upcoming.filter(e => !isFallbackEvent(e) && e.id !== params.id)
        nextEvent = validUpcoming[0] || null
      } catch {
        nextEvent = null
      }
    }

    const seoStrategy = getEventSeoStrategy(event, nextEvent)

    if (seoStrategy.redirect) {
      permanentRedirect(seoStrategy.redirect)
    }
  }

  const bookingBlockReason = getEventBookingBlockReason(event)
  const bookingDisabledCopy = bookingBlockReason ? getBookingDisabledCopy(bookingBlockReason) : null
  const statusNotice = getStatusNotice(status, isPastEvent)

  const eventDate = formatEventDate(event.startDate)
  const eventTime = formatEventTime(event.startDate)
  const headerDoorTime = formatDoorTime(event.doorTime)
  const eventBookingCopy = getEventBookingCopy(event)
  const bookingModeLabel = eventBookingCopy.label || getEventBookingModeLabel(event.booking_mode)
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
  const eventImageSrc = event.heroImageUrl || event.image?.[0] || null
  const imageAlt = event.image_alt_text || `${event.name} - ${event.category?.name || 'Event'} at The Anchor, Stanwell Moor`
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect fill="${event.category?.color || '#1a1a2e'}" width="1" height="1"/></svg>`
  ).toString('base64')}`
  const heroRoute = `/events/${encodeURIComponent(canonicalSegment || params.id)}`
  const rawHeroDescription = event.shortDescription || event.brief || null
  const eventSummary = rawHeroDescription
    ? rawHeroDescription.length > 160
      ? rawHeroDescription.substring(0, 157).trimEnd() + '…'
      : rawHeroDescription
    : undefined
  const heroDescription = bookingBlockReason
    ? eventSummary
    : getEventBookingHeroStatement(event)
  const heroTags = [
    ...(event.category?.name ? [{ label: event.category.name, variant: 'primary' as const }] : []),
    { label: eventDate, variant: 'default' as const },
    { label: eventTime, variant: 'default' as const },
    ...(headerDoorTime ? [{ label: headerDoorTime, variant: 'default' as const }] : []),
    ...(status !== 'scheduled'
      ? [{ label: `Status: ${statusLabel}`, variant: 'warning' as const }]
      : [])
  ]

  const heroPrimaryCta = mothersDayBookingFlow ? (
    <Button asChild size="lg" className="w-full sm:w-auto">
      <Link href={mothersDayBookingUrl}>{MOTHERS_DAY_BOOKING_CTA_LABEL}</Link>
    </Button>
  ) : bookingBlockReason ? undefined : (
    <EventBookingButton
      event={event}
      className="w-full sm:w-auto"
      fullWidth={false}
      size="lg"
      label="Reserve table"
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
    { label: 'Status', value: statusLabel },
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
      />

      {statusNotice ? (
        <section className="pt-4 bg-canvas">
          <Container>
            <div className="mx-auto max-w-6xl">
              <Alert variant={statusNotice.variant} title={statusNotice.title}>
                <p>{statusNotice.message}</p>
              </Alert>
            </div>
          </Container>
        </section>
      ) : null}
      <InteriorHero
        image={eventImageSrc || DEFAULT_PAGE_HEADER_IMAGE}
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

      <section className="bg-canvas">
        <Container>
          <div className="mx-auto max-w-6xl">
            <EventBookingFactsStrip
              event={event}
              eventDate={eventDate}
              eventTime={eventTime}
              foodPrompt={eventBookingCopy.foodPrompt}
            />
          </div>
        </Container>
      </section>

      {/* Event Details - Mobile First */}
      <section className="bg-canvas py-4 pb-28 sm:py-6 md:py-8 lg:pb-8">
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Main Content Grid */}
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),minmax(340px,420px)] lg:gap-10">
              {/* Left Column - Event Image and Details */}
              <div className="order-2 lg:order-1">
                {eventImageSrc && (
                  <div className="relative mx-auto mb-6 hidden aspect-square max-w-md overflow-hidden rounded-2xl shadow-lg lg:block lg:max-w-none">
                    <Image
                      src={eventImageSrc}
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

                <Card accent className="mb-6 hidden lg:mb-8 lg:block">
                  <CardBody className="p-4">
                    <h2 className="text-lg font-semibold text-accent-text md:text-xl">Booking and payment</h2>
                    <div className="mt-3 space-y-2 text-sm text-ink-muted">
                      <p>{eventBookingCopy.policy}</p>
                      <p>{eventBookingCopy.foodPrompt}</p>
                    </div>
                  </CardBody>
                </Card>

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
                    ) : bookingBlockReason ? (
                      <Alert variant="info" title={bookingDisabledCopy?.title}>
                        <p>{bookingDisabledCopy?.message}</p>
                      </Alert>
                    ) : (
                      <ManagementEventBookingForm
                        event={event}
                        title="Reserve table"
                        compact
                        foodPrompt={eventBookingCopy.foodPrompt}
                      />
                    )}
                  </div>

                  <div className="mb-6 hidden lg:block">
                    <EventSecondaryActions
                      event={event}
                      source="event_page_sidebar_actions"
                      className="justify-start"
                      size="sm"
                    />
                  </div>
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

              {/* Accessibility */}
              {event.accessibility_notes && (
                <div className="p-3 rounded-md bg-surface-sunk border border-line">
                  <p className="text-xs font-medium text-accent-text mb-1">Accessibility</p>
                  <p className="text-sm text-ink-muted">{event.accessibility_notes}</p>
                </div>
              )}

              {/* FAQs */}
              {((event.faq && event.faq.length > 0) || (event.faqPage && event.faqPage.mainEntity.length > 0)) && (
                <div>
                  <h2 className="text-xl md:text-2xl text-accent-text mb-4 md:mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3 md:space-y-4">
                    {(event.faq || event.faqPage?.mainEntity || []).map((faq, index) => (
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
          <div className="max-w-6xl mx-auto mt-8">
            <RelatedEvents
              currentEventId={event.id}
              categoryId={event.category?.id}
              categoryName={event.category?.name}
            />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CtaBand
        title="Ready to reserve your event table?"
        copy={mothersDayBookingFlow ? mothersDayBookingCopy : getEventBookingHeroStatement(event)}
      >
        {mothersDayBookingFlow ? (
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={mothersDayBookingUrl}>{MOTHERS_DAY_BOOKING_CTA_LABEL}</Link>
          </Button>
        ) : bookingBlockReason ? null : (
          <EventBookingButton
            event={event}
            className="w-full sm:w-auto"
            fullWidth={false}
            size="lg"
            label="Reserve table"
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
    </>
  )
}

// Generate static params for known events (optional)
export async function generateStaticParams() {
  // For now, return empty array to generate pages on-demand
  // In production, you might want to pre-generate popular events
  return []
}
