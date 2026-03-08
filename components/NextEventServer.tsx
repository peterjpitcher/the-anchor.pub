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
          <div className="card-dark">
            <div className="border-b border-anchor-gold/25 p-6">
              <h2 className="text-2xl font-bold text-anchor-cream-text text-center">Coming Soon</h2>
            </div>
            <div className="p-8 text-center">
              <p className="text-anchor-cream-text/70">Check back soon for our next exciting event!</p>
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
          panelClassName: 'bg-red-900/30 border border-red-500/40 text-red-300'
        }
      } else if (daysUntil <= 2) {
        urgency = {
          label: 'Almost here',
          message: `Join us this ${eventStart.toLocaleDateString('en-GB', {
            weekday: 'long',
            timeZone: LONDON_TIME_ZONE
          })}. Book early to get your preferred time.`,
          badgeClassName: 'bg-anchor-gold-vivid text-anchor-bg',
          panelClassName: 'bg-anchor-gold-vivid/15 border border-anchor-gold/40 text-anchor-cream-text'
        }
      } else if (daysUntil <= MAX_URGENCY_DAYS) {
        const urgencyDayCount = Math.max(1, Math.round(totalDaysUntil))
        urgency = {
          label: `Only ${urgencyDayCount} day${urgencyDayCount === 1 ? '' : 's'} to go`,
          message: 'Book early to get your preferred time.',
          badgeClassName: 'bg-anchor-bg-raised border border-anchor-gold/40 text-anchor-gold-vivid',
          panelClassName: 'bg-anchor-bg-raised border border-anchor-gold/25 text-anchor-cream-text'
        }
      }
    }
    
    // Get event image
    const eventImage = nextEvent.image?.[0] || nextEvent.heroImageUrl || DEFAULT_EVENT_IMAGE
    
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="card-dark">
          <EventSchema event={nextEvent} />

          <div className="grid gap-0 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
            <div className="relative flex items-center justify-center bg-anchor-bg border-r border-anchor-gold/15 p-5 lg:p-6">
              <div className="relative w-full max-w-[200px] sm:max-w-[220px] lg:max-w-full aspect-[3/4]">
                <Image
                  src={eventImage}
                  alt={`${nextEvent.name} event promotional poster - ${nextEvent.category?.name || 'upcoming event'} at The Anchor`}
                  fill
                  className="object-contain drop-shadow-xl"
                  sizes="(max-width: 1024px) 60vw, 280px"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5 lg:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                <span className="inline-flex items-center gap-2 rounded-full bg-anchor-gold-vivid/15 border border-anchor-gold/30 px-3 py-1 text-anchor-gold-vivid">
                  {relativeLabel}
                </span>
                {nextEvent.category && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1"
                    style={{
                      backgroundColor: `${nextEvent.category.color}20`,
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

              <div className="space-y-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-anchor-cream-text leading-tight">
                  {nextEvent.name}
                </h2>
                <p className="text-base text-anchor-gold-vivid font-semibold">
                  {nextEvent.shortDescription || 'Special Event'}
                </p>
              </div>

              {urgency && (
                <div className={`p-3 text-sm leading-relaxed ${urgency.panelClassName}`}>
                  <p className="font-semibold uppercase tracking-wide">
                    {urgency.label}
                  </p>
                  <p className="mt-1">
                    {urgency.message}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm border-t border-anchor-gold/15 pt-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-anchor-cream-text/50">Date &amp; Time</span>
                  <p className="font-bold text-anchor-cream-text">{longDateLabel} · {timeLabel}</p>
                </div>
                {priceLabel && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-anchor-cream-text/50">Price</span>
                    <p className="font-bold text-anchor-gold-vivid">{priceLabel}</p>
                  </div>
                )}
              </div>

              {nextEvent.description && (
                <p className="text-sm text-anchor-cream-text/70 leading-relaxed">
                  {nextEvent.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <div className="w-full sm:w-auto">
                  <EventBookingButton
                    event={nextEvent}
                    size="lg"
                    className="sm:min-w-[200px]"
                    source="homepage_next_event"
                  />
                </div>
                <Link href={`/events/${nextEvent.slug || nextEvent.id}`} className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" fullWidth className="sm:min-w-[160px]">
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
          <div className="grid gap-3 md:grid-cols-2">
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
                <div key={event.id} className="card-dark">
                  <EventSchema event={event} />
                  <div className="grid grid-cols-[80px_1fr] gap-3 p-4">
                    <div className="relative w-20 h-28 overflow-hidden bg-anchor-bg flex-shrink-0 border border-anchor-gold/15">
                      <Image
                        src={previewImage}
                        alt={`${event.name} event promotional poster`}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-anchor-cream-text/50">
                        {previewDateLabel} · {previewTimeLabel}
                      </p>
                      <Link href={`/events/${event.slug || event.id}`}>
                        <h3 className="mt-0.5 text-base font-bold text-anchor-cream-text hover:text-anchor-gold-vivid transition-colors leading-snug">
                          {event.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-sm text-anchor-cream-text/70 line-clamp-2">
                        {event.shortDescription || event.description || 'Special Event'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="w-full sm:w-auto">
                          <EventBookingButton
                            event={event}
                            size="sm"
                            className="sm:min-w-[120px]"
                            source="homepage_next_event_list"
                            label="Book"
                          />
                        </div>
                        <Link href={`/events/${event.slug || event.id}`} className="w-full sm:w-auto">
                          <Button variant="secondary" size="sm" fullWidth className="sm:min-w-[100px]">
                            Details
                          </Button>
                        </Link>
                      </div>

                      <EventSecondaryActions
                        event={event}
                        source="homepage_next_event_list_actions"
                        className="mt-2 justify-start"
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
