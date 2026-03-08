import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Button, Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { anchorAPI, formatEventDate, formatEventTime, formatDoorTime, formatEventDuration, formatPrice } from '@/lib/api'
import { EventPageTracker } from '@/components/tracking/EventPageTracker'
import { PhoneButton } from '@/components/PhoneButton'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { EventSecondaryActions } from '@/components/events/EventSecondaryActions'
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
      variant="default"
      padding={compact ? 'none' : undefined}
      className={`border border-anchor-gold/15 bg-anchor-bg-card rounded-none ${className}`.trim()}
    >
      <CardBody className={compact ? 'p-4' : 'p-4 md:p-6'}>
        <h3 className={compact ? 'text-xl font-bold text-anchor-gold-vivid mb-2' : 'text-xl md:text-2xl font-bold text-anchor-gold-vivid mb-3 md:mb-4'}>
          Event Highlights
        </h3>
        <ul className={compact ? 'space-y-1.5' : 'space-y-2'}>
          {highlights.map((highlight, index) => (
            <li key={`${highlight}-${index}`} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-anchor-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className={compact ? 'text-anchor-cream-text/70 text-sm' : 'text-anchor-cream-text/70 text-base'}>
                {highlight.replace(/(\d+,\d+\+?\s+)/g, (match) => match.replace(/\s+/g, '\u00A0'))}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const event = await anchorAPI.getEvent(params.id)
    const canonical = `/events/${event.slug || params.id}`
    const ogImage = `${canonical}/opengraph-image`
    const description =
      event.metaDescription ||
      event.shortDescription ||
      event.description ||
      `Join us for ${event.name} at The Anchor in Stanwell Moor. ${formatEventDate(event.startDate)} at ${formatEventTime(event.startDate)}.`
    
    return {
      title: event.metaTitle || `${event.name} | The Anchor - Heathrow Pub & Dining`,
      description,
      keywords: Array.isArray(event.keywords) ? event.keywords.join(', ') : event.keywords,
      alternates: {
        canonical
      },
      openGraph: {
        title: event.name,
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
        title: event.name,
        description,
        images: [ogImage]
      })
    }
  } catch {
    return {
      title: 'Event Not Found | The Anchor - Heathrow Pub & Dining',
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

  const canonicalSegment = getEventCanonicalSegment(event)
  if (canonicalSegment && canonicalSegment !== params.id) {
    permanentRedirect(`/events/${encodeURIComponent(canonicalSegment)}`)
  }

  const status = normalizeEventStatus(event)
  if (status === 'draft') {
    notFound()
  }

  const isPastEvent = isEventInPast(event)
  const bookingBlockReason = getEventBookingBlockReason(event)
  const bookingDisabledCopy = bookingBlockReason ? getBookingDisabledCopy(bookingBlockReason) : null
  const statusNotice = getStatusNotice(status, isPastEvent)

  const eventDate = formatEventDate(event.startDate)
  const eventTime = formatEventTime(event.startDate)
  const headerDoorTime = formatDoorTime(event.doorTime)
  const bookingModeLabel = getEventBookingModeLabel(event.booking_mode)
  const statusLabel = getEventStatusLabel(status)
  const endTime = formatClockTime(event.end_time)
  const doorsTime = formatClockTime(event.doors_time)
  const lastEntryTime = formatClockTime(event.last_entry_time)
  const durationLabel =
    formatEventDuration(event.duration) ||
    (typeof event.duration_minutes === 'number' && event.duration_minutes > 0
      ? `${event.duration_minutes} minutes`
      : null)
  const capacity =
    typeof event.capacity === 'number'
      ? event.capacity
      : typeof event.maximumAttendeeCapacity === 'number'
        ? event.maximumAttendeeCapacity
        : null
  const seatsRemaining =
    typeof event.seats_remaining === 'number'
      ? event.seats_remaining
      : typeof event.remainingAttendeeCapacity === 'number'
        ? event.remainingAttendeeCapacity
        : null
  const priceValue =
    typeof event.price === 'number'
      ? event.price
      : typeof event.price_per_seat === 'number'
        ? event.price_per_seat
        : null
  const priceLabel =
    event.is_free === true || priceValue === 0
      ? 'Free'
      : typeof priceValue === 'number'
        ? formatPrice(priceValue)
        : null
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
    'Choose each guest’s Sunday lunch main in the booking flow, then pay the £10 per person deposit to secure your table.'
  const heroRoute = `/events/${encodeURIComponent(canonicalSegment || params.id)}`
  const rawHeroDescription = event.shortDescription || event.brief || null
  const heroDescription = rawHeroDescription
    ? rawHeroDescription.length > 160
      ? rawHeroDescription.substring(0, 157).trimEnd() + '…'
      : rawHeroDescription
    : undefined
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
      source={`event_page_hero_${params.id}`}
    />
  )

  const heroSecondaryCta = (
    <>
      <PhoneButton
        phone="01753682707"
        source={`event_page_hero_${params.id}`}
        variant="secondary"
        size="lg"
        className="w-full sm:w-auto"
      >
         Call: 01753 682707
      </PhoneButton>
      <Link href="/whats-on" className="w-full sm:w-auto">
        <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
          View All Events
        </Button>
      </Link>
    </>
  )
  
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
        <Section background="white" spacing="none" className="pt-4 bg-anchor-bg">
          <Container>
            <div className="mx-auto max-w-6xl">
              <Alert variant={statusNotice.variant} title={statusNotice.title}>
                <p>{statusNotice.message}</p>
              </Alert>
            </div>
          </Container>
        </Section>
      ) : null}
      <HeroWrapper
        route={heroRoute}
       
        seasonalFallback="always"
        title={event.name}
        description={heroDescription}
        breadcrumbs={[
          { name: "What's On", href: '/whats-on' },
          { name: event.name }
        ]}
        tags={heroTags}
        primaryCta={heroPrimaryCta}
        secondaryCta={heroSecondaryCta}
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      {/* Event Details - Mobile First */}
      <Section background="white" spacing="md" className="py-4 sm:py-6 md:py-8 bg-anchor-bg">
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Mobile: Image First, Desktop: Grid Layout */}
            {/* Event image - mobile */}
            {(event.heroImageUrl || event.image?.[0]) && (
              <div className="lg:hidden mb-6">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg max-w-md mx-auto">
                  <Image
                    src={event.heroImageUrl || event.image![0]}
                    alt={event.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 420px"
                    priority
                  />
                </div>
              </div>
            )}
            
            {/* Mobile: Booking + highlights (aligned with desktop component set) */}
            <div className="lg:hidden mb-6 max-w-md mx-auto space-y-4">
              {mothersDayBookingFlow ? (
                <Card variant="elevated" padding="none" className="bg-anchor-bg-card rounded-none border border-anchor-gold/15">
                  <CardBody className="space-y-3 p-4">
                    <h2 className="text-xl font-bold text-anchor-gold-vivid">{MOTHERS_DAY_BOOKING_CTA_LABEL}</h2>
                    <p className="text-sm text-anchor-cream-text/70">{mothersDayBookingCopy}</p>
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
                <ManagementEventBookingForm event={event} title="Book now" compact />
              )}
              <EventSecondaryActions event={event} source="event_page_mobile_actions" className="justify-start" size="sm" />
              <EventHighlights highlights={event.highlights} compact />
            </div>
            
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-[minmax(0,420px),minmax(0,1fr)] gap-6 lg:gap-10">
              {/* Left Column - Event Image and Info */}
              <div className="order-2 lg:order-1">
                {/* Event image - desktop */}
                {(event.heroImageUrl || event.image?.[0]) && (
                  <div className="hidden lg:block relative aspect-square rounded-2xl overflow-hidden mb-6 shadow-lg">
                    <Image
                      src={event.heroImageUrl || event.image![0]}
                      alt={event.name}
                      fill
                      className="object-cover"
                      sizes="420px"
                      priority
                    />
                  </div>
                )}

                <div className="hidden lg:block space-y-4">
                  {mothersDayBookingFlow ? (
                    <Card variant="elevated" padding="none" className="bg-anchor-bg-card rounded-none border border-anchor-gold/15">
                      <CardBody className="space-y-3 p-4">
                        <h2 className="text-xl font-bold text-anchor-gold-vivid">{MOTHERS_DAY_BOOKING_CTA_LABEL}</h2>
                        <p className="text-sm text-anchor-cream-text/70">{mothersDayBookingCopy}</p>
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
                    <ManagementEventBookingForm event={event} title="Book now" compact />
                  )}

                  <EventSecondaryActions
                    event={event}
                    source="event_page_desktop_sidebar_actions"
                    className="justify-start"
                    size="sm"
                  />
                </div>

                <EventHighlights highlights={event.highlights} className="hidden lg:block mt-6" compact />
              </div>
              
              {/* Right Column - Details and Booking */}
              <div className="order-1 lg:order-2">
                <Card variant="default" padding="none" className="mb-6 border border-anchor-gold/15 bg-anchor-bg-card rounded-none lg:mb-8">
                  <CardBody className="p-4">
                    <h2 className="text-lg font-bold text-anchor-gold-vivid md:text-xl">Event information</h2>
                    <dl className="mt-4 grid gap-x-4 gap-y-3 text-sm text-anchor-cream-text/70 sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-anchor-gold-vivid">Date</dt>
                        <dd>{eventDate}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-anchor-gold-vivid">Start time</dt>
                        <dd>{eventTime}</dd>
                      </div>
                      {endTime ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">End time</dt>
                          <dd>{endTime}</dd>
                        </div>
                      ) : null}
                      {doorsTime ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Doors open</dt>
                          <dd>{doorsTime}</dd>
                        </div>
                      ) : null}
                      {lastEntryTime ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Last entry</dt>
                          <dd>{lastEntryTime}</dd>
                        </div>
                      ) : null}
                      {durationLabel ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Duration</dt>
                          <dd>{durationLabel}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="font-semibold text-anchor-gold-vivid">Status</dt>
                        <dd>{statusLabel}</dd>
                      </div>
                      {bookingModeLabel ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Booking type</dt>
                          <dd>{bookingModeLabel}</dd>
                        </div>
                      ) : null}
                      {event.event_type ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Event type</dt>
                          <dd>{event.event_type}</dd>
                        </div>
                      ) : null}
                      {event.category?.name ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Category</dt>
                          <dd>{event.category.name}</dd>
                        </div>
                      ) : null}
                      {(event.performer?.name || event.performer_name) ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Performer</dt>
                          <dd>{event.performer?.name || event.performer_name}</dd>
                        </div>
                      ) : null}
                      {priceLabel ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Price</dt>
                          <dd>{priceLabel}</dd>
                        </div>
                      ) : null}
                      {typeof capacity === 'number' ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Capacity</dt>
                          <dd>{capacity}</dd>
                        </div>
                      ) : null}
                      {typeof seatsRemaining === 'number' ? (
                        <div>
                          <dt className="font-semibold text-anchor-gold-vivid">Seats remaining</dt>
                          <dd>{Math.max(seatsRemaining, 0)}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </CardBody>
                </Card>

                {/* Description */}
                {(event.longDescription || event.about || event.description) && (
                  <div className="mb-6 lg:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-anchor-gold-vivid mb-3 md:mb-4">About This Event</h2>
                    <p className="text-anchor-cream-text/70 whitespace-pre-wrap text-base md:text-lg leading-relaxed">{event.longDescription || event.about || event.description}</p>
                  </div>
                )}

              </div>
            </div>
            
            {/* Full Width Sections */}
            <div className="mt-6 space-y-5 md:mt-8 md:space-y-8">
              {/* Location */}
              <Card variant="elevated" className="bg-anchor-bg-card rounded-none border border-anchor-gold/15">
                <CardBody className="p-4 md:p-8">
                  <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,320px),minmax(0,1fr)] lg:items-start">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-anchor-gold-vivid mb-3 md:mb-4">Location</h2>
                      <address className="not-italic text-anchor-cream-text/70 text-base">
                        <p className="font-semibold">{event.location.name}</p>
                        <p>{event.location.address.streetAddress}</p>
                        <p>{event.location.address.addressLocality}, {event.location.address.addressRegion}</p>
                        <p>{event.location.address.postalCode}</p>
                      </address>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href="/find-us"
                          className="inline-flex items-center text-anchor-gold hover:text-anchor-gold-light font-semibold text-base"
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
            
              {/* FAQs */}
              {((event.faq && event.faq.length > 0) || (event.faqPage && event.faqPage.mainEntity.length > 0)) && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-anchor-gold-vivid mb-4 md:mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3 md:space-y-4">
                    {(event.faq || event.faqPage?.mainEntity || []).map((faq, index) => (
                      <Card key={index} variant="default" className="bg-anchor-bg-card rounded-none border border-anchor-gold/15">
                        <CardBody className="p-4 md:p-6">
                          <h3 className="font-semibold text-base md:text-lg text-anchor-gold-vivid mb-2">{faq.name}</h3>
                          <p className="text-anchor-cream-text/70 text-sm md:text-base">{faq.acceptedAnswer.text}</p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Videos */}
              {event.video && event.video.length > 0 && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-anchor-gold-vivid mb-4 md:mb-6">Event Videos</h2>
                  <div className="grid gap-4">
                    {event.video.map((videoUrl, index) => (
                      <div key={index} className="relative aspect-video rounded-none overflow-hidden bg-anchor-bg-raised">
                        {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
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
        </Container>
      </Section>

      {/* CTA Section - Mobile First */}
      <Section className="bg-anchor-green" spacing="md">
        <Container className="text-center text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Reserve Your Spot
          </h2>
          <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            {mothersDayBookingFlow
              ? 'Choose each guest’s Sunday lunch main in the booking flow, then pay the £10 per person deposit to secure your table.'
              : 'Choose your preferred time and booking option using the button below.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            {mothersDayBookingFlow ? (
              <div className="w-full sm:w-auto">
                <Button asChild size="xl" className="w-full sm:w-auto">
                  <Link href={mothersDayBookingUrl}>{MOTHERS_DAY_BOOKING_CTA_LABEL}</Link>
                </Button>
              </div>
            ) : bookingBlockReason ? null : (
              <div className="w-full sm:w-auto">
                <EventBookingButton
                  event={event}
                  className="w-full sm:w-auto"
                  fullWidth={false}
                  size="xl"
                  source={`event_page_cta_${params.id}`}
                />
              </div>
            )}
            <div className="w-full sm:w-auto">
              <PhoneButton 
                phone="01753682707" 
                source={`event_page_${params.id}`}
                variant="secondary"
                size="lg"
                className="bg-white text-anchor-green hover:bg-gray-100 w-full sm:w-auto"
              >
                 Call: 01753 682707
              </PhoneButton>
            </div>
            
            <Link href="/whats-on" className="w-full sm:w-auto">
              <Button 
                variant="secondary"
                size="lg"
                fullWidth
                className="bg-white text-anchor-green hover:bg-gray-100 sm:w-auto"
              >
                View All Events
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
      
    </>
  )
}

// Generate static params for known events (optional)
export async function generateStaticParams() {
  // For now, return empty array to generate pages on-demand
  // In production, you might want to pre-generate popular events
  return []
}
