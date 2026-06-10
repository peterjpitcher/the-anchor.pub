'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getTodaysEvents, formatEventTime, formatDoorTime, hasLimitedAvailability, formatPrice, type Event } from '@/lib/api'
import { EventsErrorDisplay } from '@/components/ui/ErrorDisplay'
import { LoadingState } from '@/components/ui/LoadingState'
import { useEventsError } from '@/hooks/useErrorHandler'

// Map API event data to our display format
function mapEventToDisplay(event: Event) {
  const startTime = formatEventTime(event.startDate)
  
  // Link to individual event page
  const link = `/events/${event.slug || event.id}`
  
  return {
    id: event.id,
    name: event.name,
    time: startTime,
    description: event.shortDescription || event.description || 'Join us for a great time!',
    link,
    price: event.offers?.price,
    priceCurrency: event.offers?.priceCurrency,
    soldOut: event.remainingAttendeeCapacity === 0,
    remainingTickets: event.remainingAttendeeCapacity,
    limitedAvailability: hasLimitedAvailability(event),
    doorTime: formatDoorTime(event.doorTime),
    performer: event.performer?.name,
    category: event.category
  }
}

// Fallback data for when API is unavailable
const fallbackEvents = [
  {
    id: 'fallback-1',
    name: 'Check Our Events',
    time: 'Various Times',
    description: 'Call us for today\'s events schedule',
    link: '/whats-on'
  }
]

export function EventsToday() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { error, handleError, retry, retryCount } = useEventsError()

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const apiEvents = await getTodaysEvents()
        
        if (apiEvents.length > 0) {
          const mappedEvents = apiEvents.map(mapEventToDisplay)
          setEvents(mappedEvents)
        } else {
          // No events today, use day-specific message
          const day = new Date().getDay()
          const dayEvents = getDaySpecificEvents(day)
          setEvents(dayEvents)
        }
      } catch (err) {
        // Error: Failed to fetch events
        handleError(err)
        // Use fallback events on error
        setEvents(fallbackEvents)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [retryCount, handleError])

  // Day-specific events when no API events are available
  function getDaySpecificEvents(day: number) {
    const dayEvents: Record<number, any[]> = {
      0: [ // Sunday
        {
          id: 'sunday-roast',
          name: 'Sunday Roast',
          time: 'See today\'s kitchen hours',
          description: 'Traditional British roast dinner with all the trimmings',
          link: '/sunday-roast'
        }
      ],
      1: [ // Monday
        {
          id: 'pub-open',
          name: 'Bar Open',
          time: 'See today\'s opening hours',
          description: 'Relax with a drink (kitchen closed Mondays)',
          link: '/drinks'
        }
      ],
      2: [ // Tuesday
        {
          id: 'quiz-night',
          name: 'Quiz Night',
          time: '8:00 PM',
          description: 'Test your knowledge and win prizes!',
          link: '/quiz-night'
        }
      ],
      3: [ // Wednesday
        {
          id: 'midweek-specials',
          name: 'Midweek Specials',
          time: '6:00 PM - 9:00 PM',
          description: 'Great deals on food and drinks',
          link: '/food-menu'
        }
      ],
      4: [ // Thursday
        {
          id: 'thursday-specials',
          name: 'Thursday Specials',
          time: '6:00 PM - 9:00 PM',
          description: 'Great deals on drinks and food',
          link: '/whats-on'
        }
      ],
      5: [ // Friday
        // No regular events on Friday
      ],
      6: [ // Saturday
        {
          id: 'hosted-night',
          name: 'Hosted Night (Nikki Manfadge)',
          time: 'See /whats-on',
          description: 'Music Bingo and one-off hosted events',
          link: '/whats-on'
        },
        {
          id: 'cash-bingo',
          name: 'Cash Bingo',
          time: '3:00 PM',
          description: 'Win cash prizes in our monthly bingo',
          link: '/cash-bingo'
        }
      ]
    }

    return dayEvents[day] || []
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingState variant="dots" text="Loading today's events..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <EventsErrorDisplay onRetry={retry} />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <>
        <div className="text-center py-8">
          <div className="bg-anchor-green-raised rounded-none p-8 max-w-md mx-auto">
            <p className="text-anchor-cream-text/70 text-lg mb-4">No special events today, but we&apos;re open as usual!</p>
            <Link href="/whats-on" className="text-anchor-gold-dark hover:text-anchor-gold font-semibold inline-flex items-center gap-2">
              View all upcoming events
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="sr-only" aria-live="polite">
          No special events today, but we're open as usual
        </div>
      </>
    )
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {events.map((event) => (
        <div key={event.id} className="card-dark rounded-none p-6 group">
          <div className="mb-4">
            {event.category && (
              <span
                className="inline-block px-3 py-1 text-sm sm:text-xs font-semibold rounded-full mb-2"
                style={{
                  backgroundColor: `${event.category.color}20`,
                  color: event.category.color
                }}
              >
                {event.category.name}
              </span>
            )}
            <h3 className="font-bold text-2xl text-anchor-gold-bright mb-2">{event.name}</h3>
            <div className="space-y-1">
              <p className="text-anchor-gold-dark font-medium text-sm">{event.time}</p>
              {event.doorTime && (
                <p className="text-anchor-cream-text/70 text-sm">{event.doorTime}</p>
              )}
              {event.performer && (
                <p className="text-anchor-cream-text/70 text-sm">Featuring: {event.performer}</p>
              )}
              {event.price && (
                <p className={`text-sm mt-1 ${event.price === "0" ? "text-green-400 font-semibold" : "text-anchor-cream-text/70"}`}>
                  {event.price === "0"
                    ? "FREE TICKETS - Book while they\'re available"
                    : `From ${formatPrice(event.price, event.priceCurrency || 'GBP')}`}
                </p>
              )}
            </div>
          </div>
          <p className="text-anchor-cream-text/70 mb-6 leading-relaxed">{event.description}</p>
          <div className="space-y-2">
            {event.soldOut && (
              <p className="text-sm text-red-400 font-semibold">SOLD OUT</p>
            )}
            {event.limitedAvailability && !event.soldOut && (
              <p className="text-sm text-amber-400 font-semibold animate-pulse">LIMITED AVAILABILITY</p>
            )}
            {event.remainingTickets && event.remainingTickets > 0 && !event.limitedAvailability && (
              <p className="text-sm text-anchor-cream-text/70">Tickets available</p>
            )}
          </div>
          <Link 
            href={event.link}
            className="inline-flex items-center text-anchor-gold-dark font-semibold hover:text-anchor-gold transition-colors gap-2 mt-4"
          >
            <span>View details for {event.name}</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      ))}
      </div>
      {/* Screen reader announcement for loaded events */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {events.length} {events.length === 1 ? 'event' : 'events'} happening today
      </div>
    </>
  )
}
