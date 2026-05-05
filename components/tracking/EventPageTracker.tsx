'use client'

import { useEffect } from 'react'
import { trackEventDetailImpression, trackEventView, trackViewItem } from '@/lib/gtm-events'

interface EventPageTrackerProps {
  eventId: string
  eventName: string
  eventDate: string
  eventCategory?: string
  eventPrice?: number
}

export function EventPageTracker({ 
  eventId, 
  eventName, 
  eventDate, 
  eventCategory,
  eventPrice 
}: EventPageTrackerProps) {
  useEffect(() => {
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
  }, [eventId, eventName, eventDate, eventCategory, eventPrice])
  
  return null
}
