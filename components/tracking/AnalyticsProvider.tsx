'use client'

import { useEffect } from 'react'

import { captureBookingAttributionFromLocation, syncBookingAttributionWithConsent } from '@/lib/booking-attribution'
import { useAnalytics } from '@/lib/use-analytics'
import { useClarity } from '@/lib/use-clarity'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // useAnalytics was previously responsible for tracking page views on route
  // changes, but GA4 enhanced measurement now handles this automatically.
  // The hook is kept as a no-op to preserve the API without removing the call.
  useAnalytics()
  useClarity()

  useEffect(() => {
    captureBookingAttributionFromLocation()

    // Accepting saves what this visit captured; refusing or withdrawing deletes it.
    const onConsentUpdate = () => syncBookingAttributionWithConsent()
    window.addEventListener('cookieConsentUpdate', onConsentUpdate)
    return () => window.removeEventListener('cookieConsentUpdate', onConsentUpdate)
  }, [])
  
  return <>{children}</>
}
