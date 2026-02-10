import Link from 'next/link'
import { getUpcomingEvents, type Event } from '@/lib/api'
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
  const upcomingEvents = (await getUpcomingEvents(6, 90)).slice(0, 6)

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-xl font-semibold text-anchor-green">Upcoming events</h3>
      <p className="mt-2 text-sm text-gray-700">
        If your date matches one of these, you can switch to event booking straight away.
      </p>

      {upcomingEvents.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">No upcoming events are listed right now.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {upcomingEvents.map((event) => {
            const priceLabel = getEventPriceLabel(event)
            const seatsRemaining =
              typeof event.remainingAttendeeCapacity === 'number'
                ? event.remainingAttendeeCapacity
                : null

            return (
              <div key={event.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                <p className="mt-1 text-xs text-gray-700">
                  {formatEventDateShort(event.startDate)} at {formatEventTimeShort(event.startDate)}
                  {priceLabel ? ` • ${priceLabel}` : ' • Free entry'}
                  {typeof seatsRemaining === 'number'
                    ? ` • ${seatsRemaining} seat${seatsRemaining === 1 ? '' : 's'} left`
                    : ''}
                </p>

                <div className="mt-2">
                  <Link
                    href={getEventBookingHref(event)}
                    className="text-sm font-medium text-anchor-green underline hover:text-anchor-gold"
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
        <Link href="/whats-on" className="text-sm font-medium text-anchor-green underline hover:text-anchor-gold">
          View all events
        </Link>
      </div>
    </div>
  )
}
