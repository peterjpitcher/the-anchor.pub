'use client'

import { useAnalytics } from '@/lib/use-analytics'
import { useClarity } from '@/lib/use-clarity'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics tracking for page views
  useAnalytics()
  useClarity()
  
  return <>{children}</>
}
