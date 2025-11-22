'use client'

import { useEffect } from 'react'
import { trackEventView } from '@/lib/gtm-events'
import { analytics } from '@/lib/analytics'

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
    
    // Also track in analytics
    analytics.viewItem('event', eventName, eventId)
  }, [eventId, eventName, eventDate, eventCategory, eventPrice])
  
  return null
}