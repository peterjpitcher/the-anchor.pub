import { canUseCookieCategory } from '../cookies'

export interface TrackingEventPayload {
  event: string
  event_category?: string
  event_action?: string
  event_label?: string
  value?: number
  [key: string]: unknown
}

export interface TrackingDispatchOptions {
  /**
   * When true (default) we only dispatch if analytics cookies are permitted.
   */
  requireConsent?: boolean
  /**
   * When true we also POST the payload to /api/analytics.
   */
  sendToApi?: boolean
  /**
   * Override the event name sent to gtag (defaults to payload.event).
   */
  gtagEventName?: string
  /**
   * Adds page context (path/location) automatically. Defaults to true.
   */
  includePageContext?: boolean
}

const API_BATCH_SIZE = 8
const API_FLUSH_DELAY = 2000

let apiQueue: Record<string, unknown>[] = []
let apiFlushTimer: number | null = null
let flushListenersAttached = false

function attachFlushListeners() {
  if (flushListenersAttached || typeof window === 'undefined') return
  flushListenersAttached = true

  const flush = () => flushApiQueue('pagehide')

  window.addEventListener('pagehide', flush)
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushApiQueue('visibility')
    }
  })
}

function scheduleApiFlush() {
  if (apiFlushTimer || typeof window === 'undefined') return
  apiFlushTimer = window.setTimeout(() => flushApiQueue('timer'), API_FLUSH_DELAY)
}

function flushApiQueue(reason: string) {
  if (!apiQueue.length) return

  const batch = apiQueue
  apiQueue = []

  if (apiFlushTimer) {
    window.clearTimeout(apiFlushTimer)
    apiFlushTimer = null
  }

  sendApiBatch(batch, reason)
}

function sendApiBatch(events: Record<string, unknown>[], reason: string) {
  try {
    const body = JSON.stringify({ events, reason })

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics', blob)
      return
    }

    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    })
  } catch (error) {
    // Analytics should never block the UX; swallow errors silently
  }
}

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue
    if (typeof value === 'number' && Number.isNaN(value)) continue
    cleaned[key] = value
  }
  return cleaned
}

export function dispatchTrackingEvent(
  eventData: TrackingEventPayload,
  options?: TrackingDispatchOptions
) {
  if (typeof window === 'undefined') {
    return
  }

  const {
    requireConsent = true,
    sendToApi = false,
    gtagEventName,
    includePageContext = true
  } = options ?? {}

  if (requireConsent && !canUseCookieCategory('analytics')) {
    return
  }

  const timestamp = new Date().toISOString()
  const pagePath = includePageContext ? window.location?.pathname : undefined
  const pageLocation = includePageContext ? window.location?.href : undefined

  const payload: Record<string, unknown> = {
    ...eventData,
    event_timestamp: (eventData as Record<string, unknown>).event_timestamp ?? timestamp
  }

  if (includePageContext) {
    if (payload.page_path === undefined && pagePath) {
      payload.page_path = pagePath
    }
    if (payload.page_location === undefined && pageLocation) {
      payload.page_location = pageLocation
    }
  }

  const dataLayerPayload = sanitizePayload(payload)

  // Ensure dataLayer exists before pushing
  if (!('dataLayer' in window) || !Array.isArray(window.dataLayer)) {
    window.dataLayer = []
  }

  window.dataLayer.push(dataLayerPayload)

  // Mirror event to gtag if available
  if ('gtag' in window && typeof (window as any).gtag === 'function') {
    const { event, ...rest } = dataLayerPayload
    ;(window as any).gtag('event', gtagEventName ?? (event as string), sanitizePayload(rest))
  }

  if (sendToApi) {
    attachFlushListeners()
    apiQueue.push({
      ...dataLayerPayload,
      event: gtagEventName ?? dataLayerPayload.event,
      timestamp,
      userAgent: navigator.userAgent
    })

    if (apiQueue.length >= API_BATCH_SIZE) {
      flushApiQueue('batch')
    } else {
      scheduleApiFlush()
    }
  }
}

export function trackWithMetadata(
  event: string,
  extra: Record<string, unknown> = {},
  options?: TrackingDispatchOptions
) {
  dispatchTrackingEvent({ event, ...extra }, options)
}
