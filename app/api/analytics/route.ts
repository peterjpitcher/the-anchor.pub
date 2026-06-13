import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const GA4_COLLECT_URL = 'https://www.google-analytics.com/mp/collect'

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
    // Objects/arrays are intentionally skipped — GA4 MP only accepts primitives.
  }
  return params
}

// Derive a stable-ish GA4 client_id from the GA cookie value if present
// (cookie format: GA1.1.<client>.<timestamp>), otherwise fall back to a random
// id so the MP call is still well-formed. No PII is involved.
function resolveClientId(event: Record<string, unknown>, cookieHeader: string | null): string {
  const explicit = event.client_id ?? event.ga_client_id
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim()

  if (cookieHeader) {
    const match = cookieHeader.match(/_ga=GA\d\.\d\.(\d+\.\d+)/)
    if (match?.[1]) return match[1]
  }

  return randomUUID()
}

async function forwardToGa4(
  events: Record<string, unknown>[],
  measurementId: string,
  apiSecret: string,
  cookieHeader: string | null
): Promise<void> {
  // GA4 MP allows up to 25 events per request.
  const trimmed = events.slice(0, 25)
  const clientId = resolveClientId(trimmed[0] ?? {}, cookieHeader)

  const body = {
    client_id: clientId,
    non_personalized_ads: false,
    events: trimmed.map((event) => ({
      name: toGa4EventName(event.event),
      params: toGa4Params(event),
    })),
  }

  const url = `${GA4_COLLECT_URL}?measurement_id=${encodeURIComponent(
    measurementId
  )}&api_secret=${encodeURIComponent(apiSecret)}`

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // Keep this off the critical path; never block the response on GA4.
    cache: 'no-store',
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
    // missing we no-op gracefully — analytics must never crash the request.
    if (measurementId && apiSecret && events.length > 0) {
      try {
        await forwardToGa4(events, measurementId, apiSecret, request.headers.get('cookie'))
      } catch (forwardError) {
        // Swallow GA4 forwarding errors — do not surface them to the client and
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
