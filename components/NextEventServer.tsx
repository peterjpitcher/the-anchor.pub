import Link from 'next/link'
import Image from 'next/image'
import { getUpcomingEvents, formatEventTime } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { getEventPriceLabel } from '@/lib/event-pricing'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { Button } from '@/components/ui'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { EventSecondaryActions } from '@/components/events/EventSecondaryActions'

const MAX_URGENCY_DAYS = 3
const LONDON_TIME_ZONE = 'Europe/London'

function getLondonDateKey(value: Date): string {
  return value.toLocaleDateString('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export async function NextEventServer() {
  try {
    const events = await getUpcomingEvents(3)
    const [nextEvent, ...otherEvents] = events || []
    
    if (!nextEvent) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-anchor-green to-anchor-green-dark p-6">
              <h2 className="text-2xl font-bold text-white text-center">Coming Soon</h2>
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-700">Check back soon for our next exciting event!</p>
              <Link href="/whats-on" className="inline-block mt-4">
                <Button variant="primary">
                  View All Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    const now = new Date()
    const eventStart = getEventDateRangeUtc(nextEvent).start
    const diffMs = eventStart.getTime() - now.getTime()
    const hoursUntil = diffMs / (1000 * 60 * 60)
    const totalDaysUntil = diffMs / (1000 * 60 * 60 * 24)
    const daysUntil = Math.floor(totalDaysUntil)
    const todayKey = getLondonDateKey(now)
    const tomorrowKey = getLondonDateKey(new Date(now.getTime() + 86400000))
    const eventKey = getLondonDateKey(eventStart)
    const isToday = todayKey === eventKey
    const isTomorrow = tomorrowKey === eventKey
    const relativeLabel =
      diffMs <= 0
        ? 'Happening now'
        : isToday
        ? 'Today'
        : isTomorrow
        ? 'Tomorrow'
        : eventStart.toLocaleDateString('en-GB', { weekday: 'long', timeZone: LONDON_TIME_ZONE })
    const longDateLabel = eventStart.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: LONDON_TIME_ZONE
    })
    const timeLabel = formatEventTime(nextEvent.startDate)
    const priceLabel = getEventPriceLabel(nextEvent)

    let urgency: {
      label: string
      message: string
      badgeClassName: string
      panelClassName: string
    } | null = null

    if (diffMs > 0 && totalDaysUntil <= MAX_URGENCY_DAYS) {
      if (hoursUntil <= 24) {
	        urgency = {
	          label: hoursUntil <= 12 ? 'Starts tonight' : 'Starts tomorrow',
	          message: `We kick off at ${eventStart.toLocaleTimeString('en-GB', {
	            hour: '2-digit',
	            minute: '2-digit',
	            timeZone: LONDON_TIME_ZONE
	          })}. Book early to get your preferred time.`,
	          badgeClassName: 'bg-red-600 text-white',
	          panelClassName: 'bg-red-50 border border-red-200 text-red-700'
	        }
      } else if (daysUntil <= 2) {
	        urgency = {
	          label: 'Almost here',
	          message: `Join us this ${eventStart.toLocaleDateString('en-GB', {
	            weekday: 'long',
	            timeZone: LONDON_TIME_ZONE
	          })}. Book early to get your preferred time.`,
	          badgeClassName: 'bg-anchor-gold text-anchor-charcoal',
	          panelClassName: 'bg-anchor-gold/20 border border-anchor-gold/40 text-anchor-charcoal'
	        }
      } else if (daysUntil <= MAX_URGENCY_DAYS) {
        const urgencyDayCount = Math.max(1, Math.round(totalDaysUntil))
        urgency = {
          label: `Only ${urgencyDayCount} day${urgencyDayCount === 1 ? '' : 's'} to go`,
          message: 'Book early to get your preferred time.',
          badgeClassName: 'bg-anchor-green text-white',
          panelClassName: 'bg-anchor-green/10 border border-anchor-green/30 text-anchor-green'
        }
      }
    }
    
    // Get event image
    const eventImage = nextEvent.image?.[0] || nextEvent.heroImageUrl || DEFAULT_EVENT_IMAGE
    
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <EventSchema event={nextEvent} />
          
          <div className="grid gap-0 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <div className="relative flex items-center justify-center bg-gradient-to-br from-anchor-green/10 via-white to-anchor-green/5 p-8 lg:p-10">
              <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4]">
                <Image
                  src={eventImage}
                  alt={`${nextEvent.name} event promotional poster - ${nextEvent.category?.name || 'upcoming event'} at The Anchor`}
                  fill
                  className="object-contain drop-shadow-xl"
                  sizes="(max-width: 1024px) 70vw, 360px"
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-anchor-green">
                <span className="inline-flex items-center gap-2 rounded-full bg-anchor-green/10 px-3 py-1 text-anchor-green">
                  {relativeLabel}
                </span>
                {nextEvent.category && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1"
                    style={{
                      backgroundColor: `${nextEvent.category.color}15`,
                      color: nextEvent.category.color
                    }}
                  >
                    {nextEvent.category.icon && <span>{nextEvent.category.icon}</span>}
                    {nextEvent.category.name}
                  </span>
                )}
                {urgency && (
                  <span className={`inline-flex items-center rounded-full px-3 py-1 shadow-sm ${urgency.badgeClassName}`}>
                    {urgency.label}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl lg:text-4xl font-bold text-anchor-green leading-tight">
                  {nextEvent.name}
                </h2>
                <p className="text-lg text-anchor-gold font-semibold">
                  {nextEvent.shortDescription || 'Special Event'}
                </p>
              </div>

              {urgency && (
                <div className={`rounded-3xl p-4 text-sm leading-relaxed shadow-sm ${urgency.panelClassName}`}>
                  <p className="font-semibold uppercase tracking-wide">
                    {urgency.label}
                  </p>
                  <p className="mt-2">
                    {urgency.message}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-anchor-green/20 bg-white/80 p-5 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wide text-anchor-green/70">
                    Date & Time
                  </p>
                  <p className="mt-2 text-xl font-bold text-anchor-green">
                    {longDateLabel}
                  </p>
                  <p className="text-lg font-semibold text-anchor-green">
                    {timeLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-anchor-green/20 bg-white/80 p-5 shadow-sm backdrop-blur">
                  {priceLabel ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-anchor-green/70">
                        Price
                      </p>
                      <p className="mt-2 text-xl font-bold text-anchor-green">
                        {priceLabel}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-anchor-green/70">
                        Booking
                      </p>
                      <p className="mt-2 text-xl font-bold text-anchor-green">
                        Book online in seconds
                      </p>
                    </>
                  )}
                </div>
              </div>

              {nextEvent.description && (
                <p className="text-gray-700 leading-relaxed">
                  {nextEvent.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <div className="w-full sm:w-auto">
                  <EventBookingButton
                    event={nextEvent}
                    size="lg"
                    className="sm:min-w-[220px]"
                    source="homepage_next_event"
                  />
                </div>
                <Link href={`/events/${nextEvent.slug || nextEvent.id}`} className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" fullWidth className="sm:min-w-[200px]">
                    View Details
                  </Button>
                </Link>
              </div>

              <EventSecondaryActions
                event={nextEvent}
                source="homepage_next_event_actions"
                className="justify-start"
                size="sm"
              />
            </div>
          </div>
        </div>

        {otherEvents.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {otherEvents.map((event) => {
              const previewStart = getEventDateRangeUtc(event).start
              const previewDateLabel = previewStart.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                timeZone: LONDON_TIME_ZONE
              })
              const previewTimeLabel = formatEventTime(event.startDate)
              const previewImage = event.image?.[0] || event.heroImageUrl || DEFAULT_EVENT_IMAGE

              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <EventSchema event={event} />
                  <div className="grid grid-cols-[96px_1fr] gap-4 p-5">
                    <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-gray-50">
                      <Image
                        src={previewImage}
                        alt={`${event.name} event promotional poster`}
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-anchor-green/70">
                        {previewDateLabel} • {previewTimeLabel}
                      </p>
                      <Link href={`/events/${event.slug || event.id}`}>
                        <h3 className="mt-1 text-lg font-bold text-anchor-green hover:text-anchor-gold transition-colors">
                          {event.name}
                        </h3>
                      </Link>
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {event.shortDescription || event.description || 'Special Event'}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <div className="w-full sm:w-auto">
                          <EventBookingButton
                            event={event}
                            size="md"
                            className="sm:min-w-[140px]"
                            source="homepage_next_event_list"
                            label="Book"
                          />
                        </div>
                        <Link href={`/events/${event.slug || event.id}`} className="w-full sm:w-auto">
                          <Button variant="secondary" size="md" fullWidth className="sm:min-w-[140px]">
                            Details
                          </Button>
                        </Link>
                      </div>

                      <EventSecondaryActions
                        event={event}
                        source="homepage_next_event_list_actions"
                        className="mt-3 justify-start"
                        size="xs"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  } catch (error) {
    // Error: Failed to fetch next event
    return null
  }
}
