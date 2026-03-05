'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { trackWebVitals } from '@/lib/gtm-events'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Push to GTM dataLayer (consent-gated via dispatchTrackingEvent)
    trackWebVitals({
      metricName: metric.name,
      metricValue: metric.value,
      metricRating: metric.rating,
      metricDelta: metric.delta,
      metricId: metric.id,
    })

    // Also send to server-side web vitals endpoint (always)
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    })

    fetch('/api/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  })

  return null
}
