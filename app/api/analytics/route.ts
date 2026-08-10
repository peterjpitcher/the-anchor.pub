import { NextRequest, NextResponse } from 'next/server'

const GA4_COLLECT_URL = 'https://www.google-analytics.com/mp/collect'

// Params that carry meaning at the top level of the Measurement Protocol body
// rather than inside an event's params object. Leaving them in params would
// duplicate them as custom parameters and, in client_id's case, be ignored.
const RESERVED_TOP_LEVEL_PARAMS = new Set(['client_id', 'ga_client_id'])

// GA4 rejects events stamped more than 72 hours in the past.
const MAX_TIMESTAMP_AGE_MS = 72 * 60 * 60 * 1000

// GA4 event names must be <= 40 chars, alphanumeric + underscore, and not start
// with a digit. Anything that doesn't qualify is coerced to a safe name.
function toGa4EventName(raw: unknown): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return 'website_event'
  const sanitized = value
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .slice(0, 40)
  return sanitized || 'website_event'
}

// GA4 MP params must be primitives (string/number/boolean). Objects/arrays are
// dropped, keys are sanitized, and the param set is capped to keep payloads sane.
function toGa4Params(event: Record<string, unknown>): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  let count = 0
  for (const [rawKey, value] of Object.entries(event)) {
    if (count >= 25) break
    if (rawKey === 'event') continue
    if (value === undefined || value === null) continue
    if (typeof value === 'number' && Number.isNaN(value)) continue

    if (RESERVED_TOP_LEVEL_PARAMS.has(rawKey)) continue

    const key = rawKey.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^([0-9])/, '_$1').slice(0, 40)
    if (!key) continue

    if (typeof value === 'string') {
      const trimmed = value.slice(0, 500)
      if (trimmed) {
        params[key] = trimmed
        count += 1
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      params[key] = value
      count += 1
    }
    // Objects/arrays are intentionally skipped: GA4 MP only accepts primitives.
  }
  return params
}

/**
 * Resolves the GA4 client id for a batch, preferring an id the browser read
 * from its own `_ga` cookie and falling back to parsing that cookie here.
 *
 * Returns null when no real identity exists. This used to return randomUUID(),
 * which minted a brand-new GA4 user on every batch that arrived without a `_ga`
 * cookie. That single line was responsible for 1,241 phantom "active users"
 * against 149 sessions, and it destroyed the landing page report. A missing
 * event is a small undercount; a fabricated user actively corrupts reporting.
 */
function resolveClientId(
  events: Record<string, unknown>[],
  cookieHeader: string | null
): string | null {
  for (const event of events) {
    const explicit = event.client_id ?? event.ga_client_id
    if (typeof explicit === 'string' && explicit.trim()) return explicit.trim()
  }

  if (cookieHeader) {
    const match = cookieHeader.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/)
    if (match?.[1]) return match[1]
  }

  return null
}

/**
 * GA4 cannot attach a Measurement Protocol event to a session without this.
 * Prefer the id the browser read from `_ga_<stream>`; otherwise parse the same
 * cookie from the request. Both cookie formats are handled.
 */
function resolveSessionId(
  events: Record<string, unknown>[],
  cookieHeader: string | null
): string | null {
  for (const event of events) {
    const explicit = event.session_id
    if (typeof explicit === 'string' && explicit.trim()) return explicit.trim()
    if (typeof explicit === 'number' && Number.isFinite(explicit)) return String(explicit)
  }

  if (cookieHeader) {
    const v2 = cookieHeader.match(/_ga_[A-Z0-9]+=GS2\.\d+\.s(\d+)/)
    if (v2?.[1]) return v2[1]

    const v1 = cookieHeader.match(/_ga_[A-Z0-9]+=GS1\.\d+\.(\d+)\./)
    if (v1?.[1]) return v1[1]
  }

  return null
}

/**
 * Reads the visitor's marketing choice from the site's own consent cookie so we
 * do not assert consent the visitor never gave. Defaults to the
 * privacy-preserving answer when the cookie is absent or unparseable.
 */
function resolveMarketingConsent(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false

  const match = cookieHeader.match(/anchor-cookie-consent=([^;]+)/)
  if (!match?.[1]) return false

  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]))
    return parsed?.marketing === true
  } catch {
    return false
  }
}

function resolveTimestampMicros(event: Record<string, unknown>): number | undefined {
  const raw = event.event_timestamp ?? event.timestamp
  if (typeof raw !== 'string') return undefined

  const parsed = Date.parse(raw)
  if (Number.isNaN(parsed)) return undefined
  if (Math.abs(Date.now() - parsed) > MAX_TIMESTAMP_AGE_MS) return undefined

  return parsed * 1000
}

async function forwardToGa4(
  events: Record<string, unknown>[],
  measurementId: string,
  apiSecret: string,
  cookieHeader: string | null
): Promise<void> {
  // GA4 MP allows up to 25 events per request.
  const trimmed = events.slice(0, 25)
  const clientId = resolveClientId(trimmed, cookieHeader)

  // No real identity means no send. See resolveClientId for why inventing one
  // is worse than dropping the event.
  if (!clientId) return

  const sessionId = resolveSessionId(trimmed, cookieHeader)
  const marketingConsent = resolveMarketingConsent(cookieHeader)

  const body = {
    client_id: clientId,
    non_personalized_ads: !marketingConsent,
    consent: {
      ad_user_data: marketingConsent ? 'GRANTED' : 'DENIED',
      ad_personalization: marketingConsent ? 'GRANTED' : 'DENIED',
    },
    events: trimmed.map((event) => {
      const params: Record<string, string | number | boolean> = toGa4Params(event)

      // Without session_id the event belongs to no session and every
      // session-scoped dimension reports "(not set)".
      if (sessionId) params.session_id = sessionId

      // GA4 discards engagement for events that do not declare any, which
      // collapses average engagement time across the whole property.
      if (params.engagement_time_msec === undefined) params.engagement_time_msec = 1

      const timestampMicros = resolveTimestampMicros(event)

      return timestampMicros
        ? { name: toGa4EventName(event.event), params, timestamp_micros: timestampMicros }
        : { name: toGa4EventName(event.event), params }
    }),
  }

  const url = `${GA4_COLLECT_URL}?measurement_id=${encodeURIComponent(
    measurementId
  )}&api_secret=${encodeURIComponent(apiSecret)}`

  // Awaited on purpose. On Vercel the function is frozen once the response is
  // returned, so a fire-and-forget fetch is not guaranteed to reach Google and
  // would silently drop the very events this route exists to deliver. The
  // client sends this batch by sendBeacon or a keepalive fetch and never reads
  // the response, so waiting here costs the visitor nothing. Errors are
  // swallowed so a Google outage can never fail the request.
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  }).catch(() => {
    // Swallow GA4 forwarding errors; never surface them to the client.
  })
}

export async function POST(request: NextRequest) {
  const verboseLogging = process.env.API_DEBUG_LOGS === 'true'

  try {
    const data = await request.json()
    const events: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.events)
        ? data.events
        : [data]

    if (process.env.NODE_ENV === 'development' && verboseLogging) {
      console.log('[Analytics API]', {
        count: events.length,
        sample: events[0]
      })
    }

    const measurementId = process.env.GA4_MEASUREMENT_ID
    const apiSecret = process.env.GA4_API_SECRET

    // Forward to GA4 Measurement Protocol when configured. If either secret is
    // missing we no-op gracefully: analytics must never crash the request.
    if (measurementId && apiSecret && events.length > 0) {
      try {
        await forwardToGa4(events, measurementId, apiSecret, request.headers.get('cookie'))
      } catch (forwardError) {
        // Swallow GA4 forwarding errors, do not surface them to the client and
        // do not log payloads (avoid PII). A bare flag is enough for debugging.
        if (process.env.NODE_ENV === 'development' && verboseLogging) {
          console.warn('[Analytics API] GA4 forward failed')
        }
      }
    }

    return NextResponse.json({ success: true, count: events.length })
  } catch (error) {
    // Don't return errors for analytics - it should fail silently
    return NextResponse.json({ success: false })
  }
}

// GET endpoint for analytics dashboard (future feature)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Analytics endpoint - POST events here',
    example: {
      action: 'click',
      category: 'cta',
      label: 'Book a Table',
      value: 1,
      timestamp: new Date().toISOString()
    }
  })
}
