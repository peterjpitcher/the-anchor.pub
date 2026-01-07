'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatEventDate, formatEventTime, formatPrice, type Event } from '@/lib/api'
import { LoadingState } from '@/components/ui/LoadingState'
import { buildEventSchema } from '@/lib/structured-data/event-schema'

export function NextEvent() {
  const [nextEvent, setNextEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNextEvent() {
      try {
        const response = await fetch('/api/events?limit=1')
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const data = await response.json()
        
        // Handle wrapped response format
        if (data.success === false) {
          throw new Error(data.error?.message || 'Failed to fetch events')
        }
        
        // Extract events from response
        const eventsData = data.data || data
        const events = eventsData.events || eventsData || []
        
        if (events.length > 0) {
          setNextEvent(events[0])
        } else {
          setError('No upcoming events scheduled')
        }
      } catch (err) {
        // Error: Failed to fetch next event
        setError('Unable to load the next event. Please check our events page for the latest information.')
      } finally {
        setLoading(false)
      }
    }

    fetchNextEvent()
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <LoadingState variant="skeleton" className="h-64 w-full" />
        </div>
        {/* Screen reader announcement */}
        <div className="sr-only" aria-live="polite">
          Loading next event information...
        </div>
      </div>
    )
  }

  if (error || !nextEvent) {
    return (
      <div className="text-center py-8">
        <div className="bg-anchor-sand/30 rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-gray-700 text-lg mb-4">
            {error || 'No upcoming events at the moment'}
          </p>
          <Link href="/whats-on" className="text-anchor-gold hover:text-anchor-gold-light font-semibold inline-flex items-center gap-2">
            Check our events calendar
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  const eventDate = formatEventDate(nextEvent.startDate)
  const eventTime = formatEventTime(nextEvent.startDate)
  const isToday = new Date(nextEvent.startDate).toDateString() === new Date().toDateString()
  const isTomorrow = new Date(nextEvent.startDate).toDateString() === 
    new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()

  // Link to individual event page
  const link = `/events/${nextEvent.slug || nextEvent.id}`

  const schema = buildEventSchema(nextEvent)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-anchor-green text-white p-6">
          <p className="text-lg font-semibold">
            {isToday ? 'TODAY' : isTomorrow ? 'TOMORROW' : eventDate}
          </p>
        </div>
        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-3xl font-bold text-anchor-green mb-2">{nextEvent.name}</h3>
              <p className="text-xl text-anchor-gold font-medium">{eventTime}</p>
            </div>
            {nextEvent.offers && (
              <div className="text-right">
	                <p className={`text-xl font-bold ${nextEvent.offers.price === "0" ? "text-green-600" : "text-anchor-gold"}`}>
	                  {nextEvent.offers.price === "0"
	                    ? "FREE TICKETS - Book while they're available"
	                    : formatPrice(nextEvent.offers.price, nextEvent.offers.priceCurrency)}
	                </p>
                {nextEvent.remainingAttendeeCapacity === 0 && (
                  <p className="text-red-600 font-semibold text-sm mt-1">SOLD OUT</p>
                )}
              </div>
            )}
          </div>
          
          {nextEvent.description && (
            <p className="text-gray-700 text-lg mb-6">{nextEvent.description}</p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href={link}
              className="inline-flex items-center justify-center px-6 py-3 bg-anchor-gold text-white font-semibold rounded-full hover:bg-anchor-gold-light transition-colors gap-2"
            >
              View {nextEvent.name} Details
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <Link 
              href="/whats-on"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-anchor-green font-semibold rounded-full border-2 border-anchor-green hover:bg-anchor-green hover:text-white transition-colours"
            >
              View All Events
            </Link>
          </div>
        </div>
      </div>
      </div>
      {/* Screen reader announcement for loaded event */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Next event: {nextEvent.name} on {eventDate} at {eventTime}
      </div>
    </>
  )
}
