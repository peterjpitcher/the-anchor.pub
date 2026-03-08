'use client'

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import { formatEventDate, formatEventTime, getEventShortDescription, formatDoorTime } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { EventBookingButton } from '@/components/EventBookingButton'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventPriceLabel } from '@/lib/event-pricing'
import { EventSecondaryActions } from '@/components/events/EventSecondaryActions'
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

interface EventCardProps {
  event: DisplayEvent
  index: number
}

const EventCard = memo(function EventCard({ event, index }: EventCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px'
  })

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

  const timeChangeSchedule =
    event.timeChangeStatus === 'closed'
      ? 'Closed'
      : `Open ${event.timeChangeOpens || 'TBC'} - ${event.timeChangeCloses || 'TBC'}`

  const timeChangeMessage =
    event.timeChangeNote ||
    (event.timeChangeStatus === 'closed'
      ? 'The venue is closed on this date.'
      : 'Opening hours have been adjusted for this date.')

  if (isTimeChange) {
    return (
      <div ref={ref} className="card-dark rounded-none p-4">
        {inView ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
             <div className="flex items-center gap-3 sm:min-w-[160px]">
               <span className="text-xl">⏰</span>
               <span className="font-bold text-anchor-cream-text">{eventDate}</span>
             </div>

             <div className="flex-1 text-anchor-cream-text/70">
                {timeChangeMessage}
             </div>

             <div className="text-sm font-semibold text-anchor-gold-vivid whitespace-nowrap bg-anchor-gold/10 px-3 py-1 rounded-full">
                {timeChangeSchedule}
             </div>
          </div>
        ) : (
           <div className="h-12 bg-anchor-bg-raised animate-pulse rounded"></div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className="card-dark rounded-none overflow-hidden">
      {inView ? (
        <>
          {/* Event Header with Name and Time */}
          <div className="bg-anchor-green text-white px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold line-clamp-1 text-white">{event.name}</h3>
                <p className="text-sm sm:text-base opacity-90 text-white/90">{eventDate}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-lg sm:text-xl font-bold text-white">{startTime}</p>
                {endTime && (
                  <p className="text-lg sm:text-xl font-bold text-white/90">
                    → {endTime}
                  </p>
                )}
                {!isTimeChange && formatDoorTime(event.doorTime) && (
                  <p className="text-sm sm:text-xs opacity-75 text-white/75">{formatDoorTime(event.doorTime)}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Layout */}
          <div className="sm:hidden p-4">
            <div className="flex items-start gap-3">
              {/* Mobile Thumbnail */}
              {isTimeChange ? null : (
                <Link href={`/events/${event.slug || event.id}`} className="flex-shrink-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={eventImage}
                      alt={`${event.name} event promotional image - ${event.category?.name || 'entertainment'} at The Anchor`}
                      fill
                      className="object-contain"
                      sizes="80px"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  </div>
                </Link>
              )}
              
              {/* Mobile Content */}
              <div className="flex-1 min-w-0">
                {timingInfo && (
                  <div className="mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-anchor-green/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-anchor-green">
                        {timingInfo.relativeLabel}
                      </span>
                      {timingInfo.urgency && (
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${timingInfo.urgency.badgeClassName}`}>
                          {timingInfo.urgency.label}
                        </span>
                      )}
                    </div>
                    {timingInfo.urgency && (
                      <div className={`mt-2 rounded-xl p-3 text-xs leading-relaxed shadow-sm ${timingInfo.urgency.panelClassName}`}>
                        <p className="font-semibold uppercase tracking-wide">
                          {timingInfo.urgency.label}
                        </p>
                        <p className="mt-1">
                          {timingInfo.urgency.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm text-anchor-cream-text/70 line-clamp-2 mb-2">
                  {isTimeChange ? timeChangeMessage : getEventShortDescription(event)}
                </p>
                
                {/* Mobile Meta Info */}
                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-xs mb-3">
                  {priceLabel && (
                    <span className="text-anchor-gold font-semibold">{priceLabel}</span>
                  )}
                  {event.category && (
                    <span 
                      className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                      style={{
                        backgroundColor: `${event.category.color}20`,
                        color: event.category.color
                      }}
                    >
                      {event.category.name}
                    </span>
                  )}
                </div>
                
                {/* Mobile CTA */}
                {!isTimeChange && (
                  <div className="space-y-2">
                    <EventBookingButton event={event} size="lg" source="whats_on_event_card_mobile" />
                    <Link
                      href={`/events/${event.slug || event.id}`}
                      className="inline-flex items-center text-anchor-gold font-semibold text-sm"
                    >
                      View details
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <EventSecondaryActions
                      event={event}
                      source="whats_on_event_card_mobile_actions"
                      className="pt-2 justify-start"
                      size="xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:block p-6">
            <div className="flex items-start gap-4">
              {/* Event Image */}
              {isTimeChange ? null : (
                <Link href={`/events/${event.slug || event.id}`} className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                    <Image
                      src={eventImage}
                      alt={`${event.name} event promotional image - ${event.category?.name || 'entertainment'} at The Anchor`}
                      fill
                      className="object-contain hover:scale-105 transition-transform duration-300"
                      sizes="128px"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  </div>
                </Link>
              )}
              
              <div className="flex-1">
                {timingInfo && (
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-anchor-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-anchor-green">
                        {timingInfo.relativeLabel}
                      </span>
                      {timingInfo.urgency && (
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${timingInfo.urgency.badgeClassName}`}>
                          {timingInfo.urgency.label}
                        </span>
                      )}
                    </div>
                    {timingInfo.urgency && (
                      <div className={`mt-3 rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${timingInfo.urgency.panelClassName}`}>
                        <p className="font-semibold uppercase tracking-wide">
                          {timingInfo.urgency.label}
                        </p>
                        <p className="mt-2">
                          {timingInfo.urgency.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-anchor-cream-text/70 mb-3">
                  {isTimeChange ? timeChangeMessage : getEventShortDescription(event)}
                </p>
                
                {/* Event highlights if available */}
                {!isTimeChange && event.highlights && event.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.highlights.slice(0, 3).map((highlight, idx) => (
                      <span key={idx} className="text-sm sm:text-xs bg-anchor-bg-raised px-2 py-1 rounded-full text-anchor-cream-text/70 whitespace-nowrap">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {priceLabel && (
                    <span className="text-anchor-gold font-semibold">{priceLabel}</span>
                  )}
                  {!isTimeChange && event.performer && (
                    <span className="text-anchor-cream-text/70">
                      Featuring: {event.performer.name}
                    </span>
                  )}
                  
                  {!isTimeChange && event.duration && (
                    <span className="text-anchor-cream-text/70 text-sm sm:text-xs">
                      Duration: {event.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                    </span>
                  )}
                  {isTimeChange && (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-anchor-green">
                      ⏰ {timeChangeSchedule}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    {event.category && (
                      <span 
                        className="inline-block px-3 py-1 text-sm sm:text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: `${event.category.color}20`,
                          color: event.category.color
                        }}
                      >
                        {event.category.name}
                      </span>
                    )}
                    
                    {!isTimeChange && event.video && event.video.length > 0 && (
                      <span className="text-sm sm:text-xs text-anchor-cream-text/70">
                        📹 Video available
                      </span>
                    )}
                  </div>
                  
                  {!isTimeChange && (
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <EventBookingButton
                        event={event}
                        className="sm:min-w-[220px]"
                        fullWidth={false}
                        size="lg"
                        source="whats_on_event_card_desktop"
                      />
                      <Link
                        href={`/events/${event.slug || event.id}`}
                        className="inline-flex items-center justify-center text-anchor-gold hover:text-anchor-gold-light font-semibold text-sm"
                      >
                        View details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>

                {!isTimeChange && (
                  <EventSecondaryActions
                    event={event}
                    source="whats_on_event_card_desktop_actions"
                    className="mt-4 justify-end"
                    size="xs"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Loading skeleton
        <div className="animate-pulse">
          <div className="bg-anchor-bg-raised h-20 sm:h-24"></div>
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-anchor-bg-raised rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-anchor-bg-raised rounded w-3/4"></div>
                <div className="h-4 bg-anchor-bg-raised rounded w-1/2"></div>
                <div className="h-4 bg-anchor-bg-raised rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      )}
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
