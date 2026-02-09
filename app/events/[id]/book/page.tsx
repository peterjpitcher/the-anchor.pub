import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { Alert, Button, Container, Section } from '@/components/ui'
import { anchorAPI, formatEventDate, formatEventTime, formatPrice } from '@/lib/api'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import {
  formatClockTime,
  getEventBookingBlockReason,
  getEventBookingModeLabel,
  getEventCanonicalSegment,
  getEventStatusLabel,
  normalizeEventStatus
} from '@/lib/event-lifecycle'

type Props = {
  params: {
    id: string
  }
}

function getBookingBlockMessage(reason: ReturnType<typeof getEventBookingBlockReason>) {
  if (reason === 'cancelled') {
    return 'This event has been cancelled, so online booking is closed.'
  }

  if (reason === 'sold_out') {
    return 'This event is sold out right now. Please call us if you want to check cancellations.'
  }

  if (reason === 'past') {
    return 'This event has already taken place, so booking is no longer available.'
  }

  return 'Online booking is unavailable for this event right now.'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const event = await anchorAPI.getEvent(params.id)
    return {
      title: `Book ${event.name} | The Anchor`,
      description: `Reserve your seats for ${event.name} at The Anchor.`,
      alternates: {
        canonical: `/events/${event.slug || event.id}/book`
      }
    }
  } catch {
    return {
      title: 'Book Event | The Anchor',
      description: 'Reserve seats for events at The Anchor.'
    }
  }
}

export default async function EventBookingPage({ params }: Props) {
  let event

  try {
    event = await anchorAPI.getEvent(params.id)
  } catch {
    notFound()
  }

  const canonicalSegment = getEventCanonicalSegment(event)
  if (canonicalSegment && canonicalSegment !== params.id) {
    permanentRedirect(`/events/${encodeURIComponent(canonicalSegment)}/book`)
  }

  const status = normalizeEventStatus(event)
  if (status === 'draft') {
    notFound()
  }

  const bookingBlockReason = getEventBookingBlockReason(event)
  const bookingBlocked = bookingBlockReason !== null

  const eventDate = formatEventDate(event.startDate)
  const eventTime = formatEventTime(event.startDate)
  const eventPath = `/events/${encodeURIComponent(canonicalSegment || event.id)}`
  const eventImage = event.heroImageUrl || event.image?.[0] || DEFAULT_EVENT_IMAGE
  const bookingModeLabel = getEventBookingModeLabel(event.booking_mode)
  const statusLabel = getEventStatusLabel(status)
  const doorsOpenTime = formatClockTime(event.doors_time)
  const endTime = formatClockTime(event.end_time)
  const lastEntryTime = formatClockTime(event.last_entry_time)
  const durationLabel =
    typeof event.duration_minutes === 'number' && event.duration_minutes > 0
      ? `${event.duration_minutes} minutes`
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
  const detailParagraphs = [event.brief, event.shortDescription, event.description, event.longDescription, event.about]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .filter((value, index, array) => array.findIndex((entry) => entry.trim() === value.trim()) === index)

  return (
    <>
      <HeroWrapper
        route={`${eventPath}/book`}
        title={`Book ${event.name}`}
        description="Reserve your seats using your mobile number. We’ll confirm by SMS."
        variant="default"
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Events', href: '/whats-on' },
          { name: event.name, href: eventPath },
          { name: 'Book' }
        ]}
        tags={[
          { label: eventDate, size: 'small' },
          { label: eventTime, size: 'small' }
        ]}
      />

      <Section background="white" spacing="lg">
        <Container>
          <div
            className={`mx-auto grid max-w-5xl gap-8 ${
              bookingBlocked ? '' : 'lg:max-w-6xl lg:grid-cols-[minmax(0,1.2fr),minmax(0,400px)]'
            }`}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-anchor-green">Event details</h2>
              <div className="relative mx-auto mt-4 aspect-square w-full max-w-md overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={eventImage}
                  alt={event.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 420px"
                />
              </div>

              {detailParagraphs.length > 0 ? (
                <div className="mt-4 space-y-3 text-gray-700">
                  {detailParagraphs.map((paragraph) => (
                    <p key={paragraph} className="whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}

              <dl className="mt-5 grid gap-x-4 gap-y-3 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-anchor-green">Date</dt>
                  <dd>{eventDate}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-anchor-green">Start time</dt>
                  <dd>{eventTime}</dd>
                </div>
                {endTime ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">End time</dt>
                    <dd>{endTime}</dd>
                  </div>
                ) : null}
                {doorsOpenTime ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Doors open</dt>
                    <dd>{doorsOpenTime}</dd>
                  </div>
                ) : null}
                {lastEntryTime ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Last entry</dt>
                    <dd>{lastEntryTime}</dd>
                  </div>
                ) : null}
                {durationLabel ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Duration</dt>
                    <dd>{durationLabel}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="font-semibold text-anchor-green">Status</dt>
                  <dd>{statusLabel}</dd>
                </div>
                {bookingModeLabel ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Booking type</dt>
                    <dd>{bookingModeLabel}</dd>
                  </div>
                ) : null}
                {event.event_type ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Event type</dt>
                    <dd>{event.event_type}</dd>
                  </div>
                ) : null}
                {event.category?.name ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Category</dt>
                    <dd>{event.category.name}</dd>
                  </div>
                ) : null}
                {(event.performer?.name || event.performer_name) ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Performer</dt>
                    <dd>{event.performer?.name || event.performer_name}</dd>
                  </div>
                ) : null}
                {priceLabel ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Price</dt>
                    <dd>{priceLabel}</dd>
                  </div>
                ) : null}
                {typeof capacity === 'number' ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Capacity</dt>
                    <dd>{capacity}</dd>
                  </div>
                ) : null}
                {typeof seatsRemaining === 'number' ? (
                  <div>
                    <dt className="font-semibold text-anchor-green">Seats remaining</dt>
                    <dd>{Math.max(seatsRemaining, 0)}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-6">
                <Link href={eventPath}>
                  <Button variant="outline" size="sm">
                    Back to Event Page
                  </Button>
                </Link>
              </div>
            </div>

            {bookingBlocked ? (
              <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                <Alert variant="info" title="Booking unavailable">
                  <p>{getBookingBlockMessage(bookingBlockReason)}</p>
                </Alert>
                <p className="text-sm text-gray-700">
                  Call <a href="tel:+441753682707" className="font-semibold underline">01753 682707</a> for help, or view upcoming events.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/whats-on">
                    <Button variant="primary" size="sm">
                      View Upcoming Events
                    </Button>
                  </Link>
                  <Link href={eventPath}>
                    <Button variant="outline" size="sm">
                      Back to Event
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-anchor-green">Book your seats</h2>
                <p className="text-sm text-gray-600">
                  If online booking is unavailable, call <a href="tel:+441753682707" className="font-semibold underline">01753 682707</a>.
                </p>
                <ManagementEventBookingForm event={event} />
                {event.highlights && event.highlights.length > 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-anchor-green">Highlights</h3>
                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      {event.highlights.map((highlight, index) => (
                        <li key={`${highlight}-${index}`} className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 block h-1.5 w-1.5 rounded-full bg-anchor-gold" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}
