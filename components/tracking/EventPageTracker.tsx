'use client'

import { useEffect } from 'react'
import { trackEventDetailImpression, trackEventView, trackViewItem } from '@/lib/gtm-events'

interface EventPageTrackerProps {
  eventId: string
  eventName: string
  eventDate: string
  eventCategory?: string
  eventPrice?: number
  /** True once the night has happened. Suppresses the ecommerce signals. */
  hasEnded?: boolean
}

export function EventPageTracker({
  eventId,
  eventName,
  eventDate,
  eventCategory,
  eventPrice,
  hasEnded = false
}: EventPageTrackerProps) {
  useEffect(() => {
    // Past event pages stay live and indexed, so they now take real traffic.
    // Firing view_item with a price on a night nobody can book pollutes the
    // ecommerce funnel and feeds junk into remarketing audiences: the visitor
    // showed no purchase intent, because there is nothing to purchase.
    if (hasEnded) {
      trackEventDetailImpression({
        eventId,
        eventName,
        eventDate,
        eventCategory,
        source: 'event_detail_page_archived'
      })
      return
    }

    // Track event view for remarketing and analytics
    trackEventView({
      eventId,
      eventName,
      eventDate,
      eventCategory,
      eventPrice
    })

    trackViewItem({ category: 'event', name: eventName, id: eventId })
    trackEventDetailImpression({
      eventId,
      eventName,
      eventDate,
      eventCategory,
      eventPrice,
      source: 'event_detail_page'
    })
  }, [eventId, eventName, eventDate, eventCategory, eventPrice, hasEnded])

  return null
}
