'use client'

import { useAnalytics } from '@/lib/use-analytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics tracking for page views
  useAnalytics()
  
  return <>{children}</>
}