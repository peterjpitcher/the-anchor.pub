import Link from 'next/link'
import Image from 'next/image'
import { getUpcomingEvents, formatEventTime, formatPrice } from '@/lib/api'
import { EventSchema } from '@/components/seo/EventSchema'
import { Button } from '@/components/ui'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'

const MAX_URGENCY_DAYS = 3

function getTicketAvailabilityText(remaining: number | null | undefined) {
  if (typeof remaining !== 'number') return 'Tickets available now'
  if (remaining <= 0) return 'Almost fully booked'
  if (remaining === 1) return 'Only 1 ticket left'
  if (remaining <= 5) return `Only ${remaining} tickets left`
  if (remaining <= 12) return `${remaining} tickets remaining`
  return 'Plenty of tickets available'
}

export async function NextEventServer() {
  try {
    const events = await getUpcomingEvents(1)
    const nextEvent = events?.[0]
    
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

    const eventDate = new Date(nextEvent.startDate)
    const now = new Date()
    const diffMs = eventDate.getTime() - now.getTime()
    const hoursUntil = diffMs / (1000 * 60 * 60)
    const totalDaysUntil = diffMs / (1000 * 60 * 60 * 24)
    const daysUntil = Math.floor(totalDaysUntil)
    const isToday = now.toDateString() === eventDate.toDateString()
    const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === eventDate.toDateString()
    const relativeLabel =
      diffMs <= 0
        ? 'Happening now'
        : isToday
        ? 'Today'
        : isTomorrow
        ? 'Tomorrow'
        : eventDate.toLocaleDateString('en-GB', { weekday: 'long' })
    const longDateLabel = eventDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    const timeLabel = formatEventTime(nextEvent.startDate)
    const availabilityCopy = getTicketAvailabilityText(nextEvent.remainingAttendeeCapacity)

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
          message: `${availabilityCopy}. We kick off at ${eventDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
          })}.`,
          badgeClassName: 'bg-red-600 text-white',
          panelClassName: 'bg-red-50 border border-red-200 text-red-700'
        }
      } else if (daysUntil <= 2) {
        urgency = {
          label: 'Almost here',
          message: `${availabilityCopy}. Join us this ${eventDate.toLocaleDateString('en-GB', {
            weekday: 'long'
          })}.`,
          badgeClassName: 'bg-anchor-gold text-anchor-charcoal',
          panelClassName: 'bg-anchor-gold/20 border border-anchor-gold/40 text-anchor-charcoal'
        }
      } else if (daysUntil <= MAX_URGENCY_DAYS) {
        const urgencyDayCount = Math.max(1, Math.round(totalDaysUntil))
        urgency = {
          label: `Only ${urgencyDayCount} day${urgencyDayCount === 1 ? '' : 's'} to go`,
          message: `${availabilityCopy}. Secure your spot while the best tables are available.`,
          badgeClassName: 'bg-anchor-green text-white',
          panelClassName: 'bg-anchor-green/10 border border-anchor-green/30 text-anchor-green'
        }
      }
    }
    
    // Get event image
    const eventImage = nextEvent.image?.[0] || nextEvent.heroImageUrl || DEFAULT_EVENT_IMAGE
    
    return (
      <div className="max-w-4xl mx-auto">
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-anchor-green/70">
                    Tickets
                  </p>
                  <p className="mt-2 text-xl font-bold text-anchor-green">
                    {nextEvent.offers
                      ? nextEvent.offers.price === '0'
                        ? 'Free entry – reserve seats'
                        : formatPrice(nextEvent.offers.price, nextEvent.offers.priceCurrency)
                      : 'Check availability'}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {availabilityCopy}
                  </p>
                </div>
              </div>

              {nextEvent.description && (
                <p className="text-gray-700 leading-relaxed">
                  {nextEvent.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Link href={`/events/${nextEvent.slug || nextEvent.id}`} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" fullWidth className="sm:min-w-[220px]">
                    View Details & Book
                  </Button>
                </Link>
                <Link href="/whats-on" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" fullWidth className="sm:min-w-[200px]">
                    Browse All Events
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    // Error: Failed to fetch next event
    return null
  }
}
