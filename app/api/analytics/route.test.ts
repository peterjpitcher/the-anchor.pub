if (typeof Response !== 'undefined' && !('json' in Response)) {
  Object.assign(Response, {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
      })
  })
}

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { POST } from './route'

/**
 * These tests lock in the fix for the August 2026 attribution defect, where
 * every GA4 key event landed on a "(not set)" landing page because the
 * Measurement Protocol forward carried no session_id, and where a randomUUID()
 * fallback minted a phantom GA4 user for every batch that arrived without a
 * _ga cookie.
 */

const originalEnv = { ...process.env }
let fetchMock: jest.Mock

function makeRequest(body: object, cookie?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookie) headers.cookie = cookie

  return new Request('http://localhost/api/analytics', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
}

// The route deliberately does not await the GA4 fetch, so give the microtask
// queue a turn before asserting on it.
async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

function lastGa4Body() {
  const call = fetchMock.mock.calls.at(-1)
  if (!call) return null
  return JSON.parse((call[1] as { body: string }).body)
}

describe('POST /api/analytics GA4 forwarding', () => {
  beforeEach(() => {
    process.env.GA4_MEASUREMENT_ID = 'G-TESTSTREAM'
    process.env.GA4_API_SECRET = 'test-secret'
    fetchMock = jest.fn(async () => new Response('', { status: 204 })) as unknown as jest.Mock
    global.fetch = fetchMock as unknown as typeof fetch
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.restoreAllMocks()
  })

  it('sanitises old-client URL context before GA4 while retaining separate campaign fields', async () => {
    await POST(makeRequest({ events: [{
      event: 'private_hire_enquiry_submitted', client_id: '111.222',
      page_location: 'https://www.the-anchor.pub/private-hire?email=fixture@example.invalid#phone=07700900000',
      page_referrer: 'https://example.invalid/start?name=Fixture',
      referrer: 'https://example.invalid/start#private',
      source_url: 'https://www.the-anchor.pub/private-hire?utm_source=newsletter&email=fixture@example.invalid',
      landing_path: '/private-hire?email=fixture@example.invalid',
      utm_source: 'newsletter', utm_campaign: 'autumn', gclid: 'approved-click-id',
    }] }) as never)
    const body = lastGa4Body()
    expect(body.events[0].params).toMatchObject({
      page_location: 'https://www.the-anchor.pub/private-hire',
      page_referrer: 'https://example.invalid/start', referrer: 'https://example.invalid/start',
      source_url: 'https://www.the-anchor.pub/private-hire', landing_path: '/private-hire',
      utm_source: 'newsletter', utm_campaign: 'autumn', gclid: 'approved-click-id',
    })
    expect(JSON.stringify(body)).not.toContain('fixture@example.invalid')
    expect(JSON.stringify(body)).not.toContain('07700900000')
  })

  it('sends session_id so the event joins the browser session', async () => {
    const response = await POST(
      makeRequest(
        { events: [{ event: 'table_booking_completed', client_id: '111.222', session_id: '1723334455' }] } as object
      ) as never
    )
    await flush()

    expect(response.status).toBe(200)
    const body = lastGa4Body()
    expect(body.client_id).toBe('111.222')
    expect(body.events[0].params.session_id).toBe('1723334455')
    expect(body.events[0].params.engagement_time_msec).toBe(1)
  })

  it('falls back to parsing the GA4 cookies from the request', async () => {
    await POST(
      makeRequest(
        { events: [{ event: 'call_click' }] } as object,
        '_ga=GA1.1.987654321.1699999999; _ga_TESTSTREAM=GS1.1.1723334455.3.1.1723334460.60.0.0'
      ) as never
    )
    await flush()

    const body = lastGa4Body()
    expect(body.client_id).toBe('987654321.1699999999')
    expect(body.events[0].params.session_id).toBe('1723334455')
  })

  it('parses the newer GS2 session cookie format', async () => {
    await POST(
      makeRequest(
        { events: [{ event: 'call_click' }] } as object,
        '_ga=GA1.1.5.6; _ga_TESTSTREAM=GS2.1.s1723999999$o3$g1$t1723999999$j60$l0$h0'
      ) as never
    )
    await flush()

    expect(lastGa4Body().events[0].params.session_id).toBe('1723999999')
  })

  it('does NOT invent a client id when no identity is available', async () => {
    const response = await POST(
      makeRequest({ events: [{ event: 'table_booking_completed' }] } as object) as never
    )
    await flush()

    // Dropping the event is correct. A fabricated id creates a phantom GA4 user
    // with no session, which is what produced 1,241 users against 149 sessions.
    expect(fetchMock).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
  })

  it('does not leak client_id into the event params', async () => {
    await POST(
      makeRequest({ events: [{ event: 'call_click', client_id: '111.222' }] } as object) as never
    )
    await flush()

    const body = lastGa4Body()
    expect(body.client_id).toBe('111.222')
    expect(body.events[0].params.client_id).toBeUndefined()
  })

  it('denies ads consent unless the visitor granted marketing consent', async () => {
    await POST(
      makeRequest({ events: [{ event: 'call_click', client_id: '1.2' }] } as object) as never
    )
    await flush()

    let body = lastGa4Body()
    expect(body.non_personalized_ads).toBe(true)
    expect(body.consent.ad_user_data).toBe('DENIED')
    expect(body.consent.ad_personalization).toBe('DENIED')

    await POST(
      makeRequest(
        { events: [{ event: 'call_click', client_id: '1.2' }] } as object,
        `anchor-cookie-consent=${encodeURIComponent(JSON.stringify({ analytics: true, marketing: true }))}`
      ) as never
    )
    await flush()

    body = lastGa4Body()
    expect(body.non_personalized_ads).toBe(false)
    expect(body.consent.ad_user_data).toBe('GRANTED')
  })

  it('stamps events at occurrence time and ignores stale timestamps', async () => {
    const recent = new Date(Date.now() - 60_000).toISOString()
    await POST(
      makeRequest(
        { events: [{ event: 'call_click', client_id: '1.2', event_timestamp: recent }] } as object
      ) as never
    )
    await flush()
    expect(lastGa4Body().events[0].timestamp_micros).toBe(Date.parse(recent) * 1000)

    const stale = new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString()
    await POST(
      makeRequest(
        { events: [{ event: 'call_click', client_id: '1.2', event_timestamp: stale }] } as object
      ) as never
    )
    await flush()
    // Beyond GA4's 72 hour window, so it must be omitted rather than rejected.
    expect(lastGa4Body().events[0].timestamp_micros).toBeUndefined()
  })

  it('never fails the request when GA4 forwarding throws', async () => {
    fetchMock.mockImplementation(() => {
      throw new Error('network down')
    })

    const response = await POST(
      makeRequest({ events: [{ event: 'call_click', client_id: '1.2' }] } as object) as never
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ success: true })
  })
})
