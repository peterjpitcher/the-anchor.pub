import { canUseCookieCategory } from '../cookies'
import { getBookingAttributionPayload } from '../booking-attribution'
import { getGa4Identity } from './ga4-identity'

/**
 * Conversion events that should carry booking-attribution context
 * (landing_path, UTMs, etc.) so organic→booking conversions are measurable.
 */
const ATTRIBUTION_EVENTS = new Set([
  'purchase',
  'table_booking_completed',
  'event_booking_completed',
])

export interface TrackingEventPayload {
  event: string
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
   * Adds page context (path/location) automatically. Defaults to true.
   */
  includePageContext?: boolean
}

/**
 * Events deliberately kept out of GA4.
 *
 * Only for telemetry that already has its own pipeline or would drown the
 * useful signal. Everything else goes, because an event nobody can see is the
 * same as an event nobody sent.
 */
const API_EXCLUDED_EVENTS = new Set([
  // Has a dedicated endpoint at /api/web-vitals; sending it twice buys nothing.
  'web_vitals_reported',
])

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

    // The .catch is not optional. A try/catch cannot catch a rejected promise,
    // so until this was added a failed analytics POST became an unhandled
    // rejection: offline, blocked by an extension, or any non-2xx transport
    // error. It surfaced the moment GA4 delivery became the default and started
    // killing a whole test worker, which is a fair impression of what it does
    // to a page.
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {
      // Analytics must never break the page, and a dropped batch is not worth
      // telling the visitor about.
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

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'unknown'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
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
    // Defaults to TRUE, and that is the whole point.
    //
    // The published GTM container has no triggers for our custom events, so an
    // event that only reaches the dataLayer never reaches GA4. With this
    // defaulting to false, 36 event types were silently invisible, including
    // booking_error_shown, which would have exposed a completely broken
    // quick-book sheet months earlier. A July 2026 audit found the same fault
    // and fixing it event-by-event did not hold, because the next event anyone
    // added inherited the broken default again.
    //
    // Opting in per call site was the bug. Anything genuinely too noisy for GA4
    // opts OUT below, by name, with a reason.
    sendToApi = !API_EXCLUDED_EVENTS.has(eventData.event),
    includePageContext = true
  } = options ?? {}

  if (requireConsent && !canUseCookieCategory('analytics')) {
    return
  }

  const timestamp = new Date().toISOString()
  const pagePath = includePageContext ? window.location?.pathname : undefined
  const pageLocation = includePageContext ? window.location?.href : undefined
  const pageTitle = includePageContext ? document?.title : undefined
  const referrer = includePageContext ? document?.referrer : undefined
  const deviceType = getDeviceType()

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
    if (payload.page_title === undefined && pageTitle) {
      payload.page_title = pageTitle
    }
    // `page_referrer` is GA4's reserved parameter name. A plain `referrer` key
    // arrives as an ordinary custom parameter and GA4 ignores it for source
    // attribution, so send both: the reserved name for GA4, the original for
    // any GTM tag or downstream consumer still reading `referrer`.
    if (payload.referrer === undefined && referrer) {
      payload.referrer = referrer
    }
    if (payload.page_referrer === undefined && referrer) {
      payload.page_referrer = referrer
    }
  }

  if (payload.device_type === undefined) {
    payload.device_type = deviceType
  }

  // Attach booking-attribution context (landing_path, UTMs, click ids) to
  // conversion events so organic→booking conversions are measurable. Hot path:
  // keep it null-safe — the getter returns {} when unavailable. Existing keys
  // on the event win, so we never clobber explicit values.
  if (ATTRIBUTION_EVENTS.has(eventData.event)) {
    try {
      const attribution = getBookingAttributionPayload()
      if (attribution) {
        for (const [key, value] of Object.entries(attribution)) {
          if (value !== undefined && payload[key] === undefined) {
            payload[key] = value
          }
        }
      }
    } catch {
      // Attribution must never block analytics dispatch.
    }
  }

  const dataLayerPayload = sanitizePayload(payload)

  // Ensure dataLayer exists before pushing
  if (!('dataLayer' in window) || !Array.isArray(window.dataLayer)) {
    window.dataLayer = []
  }

  window.dataLayer.push(dataLayerPayload)

  if (sendToApi) {
    attachFlushListeners()

    // Attach the GA4 client and session ids read from the first-party cookies.
    // The server route forwards these to the Measurement Protocol so the event
    // joins the real browser session. Without session_id every session-scoped
    // dimension in GA4 (landing page, source, channel) resolves to "(not set)".
    // Either field may legitimately be missing, for example in the moment
    // between a visitor accepting cookies and the Google tag writing them; the
    // server decides what to do in that case and must never invent an identity.
    const ga4Identity = getGa4Identity()

    apiQueue.push({
      ...dataLayerPayload,
      ...ga4Identity,
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
