'use client'

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import { formatEventDate, formatEventTime, getEventShortDescription, formatDoorTime } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { EventBookingButton } from '@/components/EventBookingButton'
import { Button } from '@/components/ui'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventPriceLabel } from '@/lib/event-pricing'
import type { DisplayEvent } from '@/types/display-event'

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

type EventUrgency = {
  label: string
  message: string
  badgeClassName: string
  panelClassName: string
}

interface EventTimingInfo {
  relativeLabel: string
  urgency: EventUrgency | null
}

function getEventTimingInfo(event: DisplayEvent): EventTimingInfo | null {
  const eventStart = getEventDateRangeUtc(event).start
  if (Number.isNaN(eventStart.getTime())) {
    return null
  }

  const now = new Date()
  const diffMs = eventStart.getTime() - now.getTime()
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

  let urgency: EventUrgency | null = null

  if (diffMs > 0) {
    const hoursUntil = diffMs / (1000 * 60 * 60)
    const totalDaysUntil = diffMs / (1000 * 60 * 60 * 24)
    const daysUntil = Math.floor(totalDaysUntil)

    if (totalDaysUntil <= MAX_URGENCY_DAYS) {
      if (hoursUntil <= 24) {
        urgency = {
          label: hoursUntil <= 12 ? 'Starts tonight' : 'Starts tomorrow',
          message: `We kick off at ${formatEventTime(event.startDate)}.`,
          badgeClassName: 'bg-red-600 text-white',
          panelClassName: 'bg-red-900/20 border border-red-500/30 text-red-400'
        }
      } else if (daysUntil <= 2) {
        urgency = {
          label: 'Almost here',
          message: `Join us this ${eventStart.toLocaleDateString('en-GB', { weekday: 'long', timeZone: LONDON_TIME_ZONE })}.`,
          badgeClassName: 'bg-anchor-gold text-anchor-charcoal',
          panelClassName: 'bg-anchor-gold/20 border border-anchor-gold/40 text-anchor-gold-vivid'
        }
      } else {
        const urgencyDayCount = Math.max(1, Math.round(totalDaysUntil))
        urgency = {
          label: `Only ${urgencyDayCount} day${urgencyDayCount === 1 ? '' : 's'} to go`,
          message: 'Book early to get your preferred time.',
          badgeClassName: 'bg-anchor-green text-white',
          panelClassName: 'bg-anchor-green/10 border border-anchor-green/30 text-anchor-gold-vivid'
        }
      }
    }
  }

  return {
    relativeLabel,
    urgency
  }
}

function formatTimeChangeDate(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return 'Date TBC'
  const start = new Date(`${startDate}T00:00:00Z`)
  if (!endDate || endDate === startDate) {
    return start.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const end = new Date(`${endDate}T00:00:00Z`)
  const sameMonthYear =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth()

  const startLabel = start.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })

  const endLabel = end.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: sameMonthYear ? 'short' : 'short',
    year: sameMonthYear ? undefined : 'numeric'
  })

  return `${startLabel} – ${endLabel}`
}

function formatSimpleTime(time?: string | null): string | null {
  if (!time) return null
  const [rawHours, rawMinutes] = time.split(':')
  const hours = Number(rawHours)
  if (Number.isNaN(hours)) return null
  const minutes = Number(rawMinutes ?? '0')
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHour = hours % 12 || 12
  const minutePart = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`
  return `${displayHour}${minutePart}${period}`
}

/** Build a /book-table link pre-filled with the event date (YYYY-MM-DD in Europe/London). */
function getTableBookingHref(event: DisplayEvent): string | null {
  if (!event.startDate) return null
  const start = getEventDateRangeUtc(event).start
  if (Number.isNaN(start.getTime())) return null
  // Only offer table booking for future events
  if (start.getTime() < Date.now()) return null
  // Use Europe/London to match the displayed event date (avoids UTC midnight edge cases in BST)
  const parts = start.toLocaleDateString('en-CA', { timeZone: LONDON_TIME_ZONE })
  // en-CA locale outputs YYYY-MM-DD format
  return `/book-table?date=${parts}`
}

interface EventCardProps {
  event: DisplayEvent
  index: number
}

const EventCard = memo(function EventCard({ event, index }: EventCardProps) {
  const isTimeChange = !!event.isTimeChange
  const eventImage = event.image?.[0] || event.heroImageUrl || DEFAULT_EVENT_IMAGE
  const timingInfo = isTimeChange ? null : getEventTimingInfo(event)
  const priceLabel = isTimeChange ? null : getEventPriceLabel(event)

  const startTime = isTimeChange
    ? event.timeChangeStatus === 'closed'
      ? 'Closed'
      : formatSimpleTime(event.timeChangeOpens) || 'TBC'
    : formatEventTime(event.startDate)

  const endTime = isTimeChange
    ? event.timeChangeStatus === 'closed'
      ? null
      : formatSimpleTime(event.timeChangeCloses)
    : null

  const eventDate = isTimeChange
    ? formatTimeChangeDate(event.timeChangeDate, event.timeChangeRangeEnd)
    : formatEventDate(event.startDate)

  const timeChangeMessage =
    event.timeChangeNote ||
    (event.timeChangeStatus === 'closed'
      ? 'The venue is closed on this date.'
      : 'Opening hours have been adjusted for this date.')

  if (isTimeChange) {
    const isClosed = event.timeChangeStatus === 'closed'
    const kitchenClosed = event.timeChangeIsKitchenClosed

    // Build a compact hours summary
    const hoursParts: string[] = []
    if (isClosed) {
      hoursParts.push('Closed')
    } else {
      hoursParts.push(`Bar ${event.timeChangeOpens || 'TBC'}–${event.timeChangeCloses || 'TBC'}`)
      if (kitchenClosed) {
        hoursParts.push('Kitchen closed')
      } else if (event.timeChangeKitchenOpens && event.timeChangeKitchenCloses) {
        hoursParts.push(`Kitchen ${event.timeChangeKitchenOpens}–${event.timeChangeKitchenCloses}`)
      }
      if (event.timeChangeHasSundayLunch) {
        hoursParts.push('Sunday lunch available')
      }
    }

    return (
      <div className="border-l-2 border-anchor-gold/40 bg-anchor-bg-raised/30 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-base">
          <span className="font-semibold text-anchor-cream-text whitespace-nowrap">{eventDate}</span>
          <span className="text-anchor-cream-text/50 hidden sm:inline">·</span>
          <span className="text-anchor-cream-text/70">{hoursParts.join(' · ')}</span>
          {timeChangeMessage && timeChangeMessage !== 'Opening hours have been adjusted for this date.' && (
            <>
              <span className="text-anchor-cream-text/50 hidden sm:inline">·</span>
              <span className="text-anchor-gold-vivid text-sm font-medium">{timeChangeMessage}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card-dark rounded-none overflow-hidden">
      <>
          {/* Mobile Layout, image on top, content below */}
          <div className="sm:hidden">
            {!isTimeChange && (
              <Link href={`/events/${event.slug || event.id}`} className="block">
                <div className="relative aspect-square w-full overflow-hidden bg-anchor-bg">
                  <Image
                    src={eventImage}
                    alt={`${event.name} event promotional image - ${event.category?.name || 'entertainment'} at The Anchor`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                  {event.category && (
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: `${event.category.color}cc`,
                        color: '#ffffff'
                      }}
                    >
                      {event.category.name}
                    </span>
                  )}
                </div>
              </Link>
            )}

            <div className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-anchor-cream-text/50">
                  {eventDate} · {startTime}
                  {endTime ? ` → ${endTime}` : ''}
                </p>
                {priceLabel && (
                  <span className="text-sm font-semibold text-anchor-gold">{priceLabel}</span>
                )}
              </div>

              <Link href={`/events/${event.slug || event.id}`}>
                <h3 className="text-lg font-bold text-anchor-cream-text hover:text-anchor-gold-vivid transition-colors leading-snug">
                  {event.name}
                </h3>
              </Link>

              <p className="mt-1 text-sm text-anchor-cream-text/70 line-clamp-2">
                {isTimeChange ? timeChangeMessage : getEventShortDescription(event)}
              </p>

              {timingInfo?.urgency && (
                <div className={`mt-3 p-3 text-xs leading-relaxed ${timingInfo.urgency.panelClassName}`}>
                  <p className="font-semibold uppercase tracking-wide">{timingInfo.urgency.label}</p>
                  <p className="mt-1">{timingInfo.urgency.message}</p>
                </div>
              )}

              {!isTimeChange && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <EventBookingButton event={event} size="sm" source="whats_on_event_card_mobile" />
                  <Button asChild size="sm" className="bg-anchor-green text-white hover:bg-anchor-green/80">
                    <Link href={`/events/${event.slug || event.id}`}>
                      Details
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout, large square image left, content right */}
          <div className="hidden sm:grid sm:grid-cols-[200px_1fr]">
            {!isTimeChange ? (
              <Link href={`/events/${event.slug || event.id}`} className="relative aspect-square overflow-hidden bg-anchor-bg block">
                <Image
                  src={eventImage}
                  alt={`${event.name} event promotional image - ${event.category?.name || 'entertainment'} at The Anchor`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="200px"
                  loading={index < 3 ? "eager" : "lazy"}
                />
                {event.category && (
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: `${event.category.color}cc`,
                      color: '#ffffff'
                    }}
                  >
                    {event.category.name}
                  </span>
                )}
              </Link>
            ) : (
              <div className="bg-anchor-bg-raised" />
            )}

            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-anchor-cream-text/50">
                    {eventDate} · {startTime}
                    {endTime ? ` → ${endTime}` : ''}
                    {!isTimeChange && formatDoorTime(event.doorTime) ? ` · Doors ${formatDoorTime(event.doorTime)}` : ''}
                  </p>
                  {priceLabel && (
                    <span className="text-sm font-semibold text-anchor-gold">{priceLabel}</span>
                  )}
                </div>

                <Link href={`/events/${event.slug || event.id}`}>
                  <h3 className="text-xl font-bold text-anchor-cream-text hover:text-anchor-gold-vivid transition-colors leading-snug">
                    {event.name}
                  </h3>
                </Link>

                <p className="mt-1 text-sm text-anchor-cream-text/70 line-clamp-2">
                  {isTimeChange ? timeChangeMessage : getEventShortDescription(event)}
                </p>

                {timingInfo?.urgency && (
                  <div className={`mt-3 p-3 text-sm leading-relaxed ${timingInfo.urgency.panelClassName}`}>
                    <p className="font-semibold uppercase tracking-wide">{timingInfo.urgency.label}</p>
                    <p className="mt-1">{timingInfo.urgency.message}</p>
                  </div>
                )}
              </div>

              {!isTimeChange && (
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <EventBookingButton
                    event={event}
                    className="sm:min-w-[180px]"
                    fullWidth={false}
                    size="md"
                    source="whats_on_event_card_desktop"
                  />
                  <Button asChild size="md" className="bg-anchor-green text-white hover:bg-anchor-green/80">
                    <Link href={`/events/${event.slug || event.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
      </>
    </div>
  )
})

// Virtual scrolling configuration
const INITIAL_LOAD = 10
const BATCH_SIZE = 10
const OVERSCAN = 3 // Render this many items above/below viewport

interface FilteredUpcomingEventsClientProps {
  events: DisplayEvent[]
}

export function FilteredUpcomingEventsClient({ events }: FilteredUpcomingEventsClientProps) {
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: INITIAL_LOAD })

  // Calculate which events should be rendered based on scroll position
  const virtualizedEvents = useMemo(() => {
    const start = Math.max(0, visibleRange.start - OVERSCAN)
    const end = Math.min(displayCount, visibleRange.end + OVERSCAN)
    return events.slice(start, end).map((event, idx) => ({
      event,
      originalIndex: start + idx
    }))
  }, [events, visibleRange, displayCount])

  const hasMore = displayCount < events.length

  const loadMore = useCallback(() => {
    setIsLoadingMore(true)
    // Use requestAnimationFrame for smoother loading
    requestAnimationFrame(() => {
      setDisplayCount(prev => Math.min(prev + BATCH_SIZE, events.length))
      setIsLoadingMore(false)
    })
  }, [events.length])

  // Update visible range based on scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const items = container.querySelectorAll('[data-event-index]')
      
      let newStart = 0
      let newEnd = displayCount

      items.forEach((item) => {
        const rect = item.getBoundingClientRect()
        const index = parseInt(item.getAttribute('data-event-index') || '0')
        
        if (rect.top < windowHeight && rect.bottom > 0) {
          newStart = Math.min(newStart, index)
          newEnd = Math.max(newEnd, index + 1)
        }
      })

      setVisibleRange({ start: newStart, end: newEnd })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [displayCount])

  // Auto-load more when scrolling near bottom
  const { ref: loadMoreRef } = useInView({
    threshold: 0.1,
    rootMargin: '200px',
    onChange: (inView) => {
      if (inView && hasMore && !isLoadingMore) {
        loadMore()
      }
    }
  })

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-anchor-bg-raised rounded-none">
        <p className="text-anchor-cream-text/70 text-lg">
          No upcoming events scheduled at the moment.
        </p>
        <p className="text-anchor-cream-text/70 mt-2">Check back soon or follow us on social media for updates!</p>
      </div>
    )
  }

  return (
    <div id="events-list" ref={containerRef} className="space-y-6" role="feed" aria-busy={isLoadingMore}>
      {/* Spacer for items above viewport */}
      {visibleRange.start > 0 && (
        <div 
          style={{ height: `${visibleRange.start * 400}px` }} 
          aria-hidden="true"
        />
      )}
      
      {virtualizedEvents.map(({ event, originalIndex }) => (
        <div key={event.id} data-event-index={originalIndex}>
          <EventCard event={event} index={originalIndex} />
        </div>
      ))}
      
      {/* Spacer for items below viewport */}
      {visibleRange.end < displayCount && (
        <div 
          style={{ height: `${(displayCount - visibleRange.end) * 400}px` }} 
          aria-hidden="true"
        />
      )}
      
      {hasMore && (
        <div ref={loadMoreRef} className="text-center py-8">
          {isLoadingMore ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-anchor-gold rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-4 h-4 bg-anchor-gold rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-4 h-4 bg-anchor-gold rounded-full animate-bounce"></div>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-anchor-gold text-white rounded-full font-semibold hover:bg-anchor-gold-light transition-colors"
              aria-label={`Load more events. ${events.length - displayCount} remaining`}
            >
              Load More Events ({events.length - displayCount} remaining)
            </button>
          )}
        </div>
      )}
      
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isLoadingMore ? 'Loading more events' : `Showing ${displayCount} of ${events.length} events`}
      </div>
    </div>
  )
}
