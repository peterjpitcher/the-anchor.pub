import Link from 'next/link'
import { getUpcomingEvents, type Event } from '@/lib/api'
import { isMothersDayEvent } from '@/lib/mothers-day-booking'
import { getEventPriceLabel } from '@/lib/event-pricing'

function formatEventDateShort(dateValue: string): string {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return 'Date TBC'

  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/London'
  })
}

function formatEventTimeShort(dateValue: string): string {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return 'Time TBC'

  return parsed.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Europe/London'
  })
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
    <div className="card-dark p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-anchor-cream-text sm:text-xl">Upcoming events</h3>
      <p className="mt-2 text-sm text-anchor-cream-text/70">
        If your date matches one of these, you can switch to event booking straight away.
      </p>

      {upcomingEvents.length === 0 ? (
        <p className="mt-4 text-sm text-anchor-cream-text/60">No upcoming events are listed right now.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {upcomingEvents.map((event, index) => {
            const priceLabel = getEventPriceLabel(event)
            const seatsRemaining =
              typeof event.remainingAttendeeCapacity === 'number'
                ? event.remainingAttendeeCapacity
                : null

            return (
              <div
                key={event.id}
                className={`card-dark p-3 ${
                  index >= 3 ? 'hidden sm:block' : ''
                }`}
              >
                <p className="text-sm font-semibold text-anchor-cream-text">{event.name}</p>
                <p className="mt-1 text-xs text-anchor-cream-text/70">
                  {formatEventDateShort(event.startDate)} at {formatEventTimeShort(event.startDate)}
                  {priceLabel ? ` • ${priceLabel}` : ' • Free entry'}
                  {typeof seatsRemaining === 'number'
                    ? ` • ${seatsRemaining} seat${seatsRemaining === 1 ? '' : 's'} left`
                    : ''}
                </p>

                <div className="mt-2">
                  <Link
                    href={getEventBookingHref(event)}
                    className="text-sm font-medium text-anchor-gold underline hover:text-anchor-gold-vivid"
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
        <Link href="/whats-on" className="text-sm font-medium text-anchor-gold underline hover:text-anchor-gold-vivid">
          View all events
        </Link>
      </div>
    </div>
  )
}
