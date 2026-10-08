'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useReportWebVitals } from 'next/web-vitals'
import { onCLS } from 'next/dist/compiled/web-vitals-attribution'
import { trackWebVitals } from '@/lib/gtm-events'
import { hasSwitchedAnalyticsOff } from '@/lib/cookies'
import { buildWebVitalReport, readingKey, type ReportedMetric } from '@/lib/web-vitals-record'

/** The path this visit loaded first, which is the page LCP was measured on. */
function landingPathname(): string {
  try {
    const [navigation] = performance.getEntriesByType('navigation')
    if (navigation?.name) return new URL(navigation.name).pathname
  } catch {
    // No navigation timing in this browser: the current page is the best answer.
  }
  return window.location.pathname
}

/**
 * Our own record of page speed (privacy notice, section 5). It sets no cookie
 * and carries nothing about the visitor, so it runs until analytics is switched
 * off: a visitor who has not chosen yet is recorded, one who has refused is not,
 * and for them nothing is sent at all.
 */
function recordWebVital(metric: ReportedMetric): boolean {
  if (hasSwitchedAnalyticsOff()) return false

  // Null for the metrics we do not record (FCP, TTFB, FID).
  const report = buildWebVitalReport(metric, {
    pathname: window.location.pathname,
    landingPathname: landingPathname(),
    width: window.innerWidth,
  })
  if (!report) return false

  // keepalive because CLS and INP are reported as the page is being left, when
  // an ordinary request is cancelled. A reading that fails to send is lost,
  // which is fine: it must never surface as an error on the page.
  fetch('/api/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
    keepalive: true,
  }).catch(() => {})
  return true
}

export function WebVitals() {
  // Readings already sent from this page. The browser can report the same
  // reading twice as the page is left, which counted it twice in the record.
  const sentReadings = useRef(new Set<string>())

  const recordOnce = useCallback((metric: ReportedMetric) => {
    const key = readingKey(metric)
    if (key !== null && sentReadings.current.has(key)) return
    if (recordWebVital(metric) && key !== null) sentReadings.current.add(key)
  }, [])

  useReportWebVitals((metric) => {
    // Push to GTM dataLayer (consent-gated via dispatchTrackingEvent)
    trackWebVitals({
      metricName: metric.name,
      metricValue: metric.value,
      metricRating: metric.rating,
      metricDelta: metric.delta,
      metricId: metric.id,
    })

    // CLS is recorded below instead, from the build that says what moved.
    if (metric.name !== 'CLS') recordOnce(metric)
  })

  // The hook above reports CLS as a number only. To fix a page that jumps we
  // need the element that moved, and only the library's attribution build gives
  // it (see types/web-vitals-attribution.d.ts for why the hook cannot).
  useEffect(() => {
    onCLS(recordOnce)
  }, [recordOnce])

  return null
}
