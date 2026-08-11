import Link from 'next/link'
import { getEventRemainingCapacity, getUpcomingEvents, type Event } from '@/lib/api'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { isMothersDayEvent } from '@/lib/mothers-day-booking'
import { getEventPriceLabel } from '@/lib/event-pricing'
import { formatEventLocalDate, formatEventLocalTime } from '@/lib/event-calendar'

function formatEventDateShort(dateValue: string): string {
  return formatEventLocalDate(dateValue, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

function formatEventTimeShort(dateValue: string): string {
  return formatEventLocalTime(dateValue)
}

function getEventBookingHref(event: Pick<Event, 'id' | 'slug'>): string {
  const key = (event.slug || event.id || '').trim()
  if (!key) return '/whats-on'
  return `/events/${encodeURIComponent(key)}`
}

export async function BookTableUpcomingEventsPanel() {
  const upcomingEvents = (await getUpcomingEvents(12, 90))
    .filter((event) => !isMothersDayEvent(event))
    .slice(0, 6)

  return (
    <Card accent>
      <CardBody className="p-4 sm:p-6">
        <h3 className="text-lg text-ink-strong sm:text-xl">Upcoming events</h3>
        <p className="mt-2 text-sm text-ink-muted">
          If your date matches one of these, you can switch to event booking straight away.
        </p>

        {upcomingEvents.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">No upcoming events are listed right now.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {upcomingEvents.map((event, index) => {
              const priceLabel = getEventPriceLabel(event)
              // Whatever spelling the management API used for the count. Reading
              // remainingAttendeeCapacity alone dropped the "n seats left" line
              // from every event in this panel.
              const seatsRemaining = getEventRemainingCapacity(event)

              return (
                <div
                  key={event.id}
                  className={`rounded-md border border-line bg-surface-sunk p-3 ${
                    index >= 3 ? 'hidden sm:block' : ''
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">{event.name}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatEventDateShort(event.startDate)} at {formatEventTimeShort(event.startDate)}
                    {priceLabel ? ` • ${priceLabel}` : ' • Free entry'}
                    {typeof seatsRemaining === 'number'
                      ? ` • ${seatsRemaining} seat${seatsRemaining === 1 ? '' : 's'} left`
                      : ''}
                  </p>

                  <div className="mt-2">
                    <Link
                      href={getEventBookingHref(event)}
                      className="text-sm font-medium text-accent-text underline hover:text-anchor-gold"
                    >
                      Book event
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4">
          <Link href="/whats-on" className="text-sm font-medium text-accent-text underline hover:text-anchor-gold">
            View all events
          </Link>
        </div>
      </CardBody>
    </Card>
  )
}
