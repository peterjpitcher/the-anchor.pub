// Polyfill Response.json (static method) missing from the node-fetch polyfill used in jest.setup.js
if (typeof Response !== 'undefined' && !('json' in Response)) {
  Object.assign(Response, {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      }),
  })
}

// Failures on this route go through the shared reporter (lib/report-failure.ts),
// which writes the log line and alerts a person.
const mockReportFailure = jest.fn(async (..._args: unknown[]) => undefined)
jest.mock('@/lib/report-failure', () => ({
  reportFailure: (...args: unknown[]) => mockReportFailure(...args),
  pageFromRequest: () => null,
}))

import { POST } from '../route'
import { NextRequest } from 'next/server'

const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

const BOOKING_ID = '550e8400-e29b-41d4-a716-446655440000'
const PHONE = '01753 682707'

function request() {
  return new NextRequest('http://localhost/api/event-bookings/paypal/create-order', {
    method: 'POST',
    body: JSON.stringify({ bookingId: BOOKING_ID }),
    headers: { 'content-type': 'application/json' },
  })
}

describe('POST /api/event-bookings/paypal/create-order', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ANCHOR_API_KEY = 'test-key'
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
  })

  it('proxies a valid request and returns the order id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ orderId: 'PAYPAL-ORDER-123' }),
    })

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.orderId).toBe('PAYPAL-ORDER-123')
    expect(mockReportFailure).not.toHaveBeenCalled()
  })

  it('returns 400 for a missing bookingId', async () => {
    const res = await POST(
      new NextRequest('http://localhost/api/event-bookings/paypal/create-order', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'content-type': 'application/json' },
      }),
    )

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fails closed with the phone number when the management API is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed'))

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toContain(PHONE)
    expect(body.orderId).toBeUndefined()
    expect(mockReportFailure).toHaveBeenCalled()
  })

  it('does not pass off an unreadable 200 as a created order', async () => {
    // A gateway that answers 200 with an HTML error page used to be turned into
    // our own error object and returned under that same 200, so the caller was
    // handed a success for an order that was never created.
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON')
      },
    })

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toContain(PHONE)
    expect(mockReportFailure).toHaveBeenCalled()
  })

  it('does not pass off a 200 with no order id as a created order', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    })

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.orderId).toBeUndefined()
    expect(body.error).toContain(PHONE)
  })

  it('keeps the upstream status on a rejection, and turns its reason code into a sentence', async () => {
    // The management app answers this route with a bare reason code. It used
    // to be shown to the guest exactly as it arrived.
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ success: false, error: 'hold_expired' }),
    })

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.error).not.toContain('hold_expired')
    expect(body.error).toContain('The time to pay for these places has run out')
    expect(body.error).toContain(PHONE)
    expect(mockReportFailure).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'refused', payment: true, status: 409, upstreamCode: 'hold_expired' })
    )
  })

  it('never shows the guest a sentence the management app wrote for a developer', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }),
    })

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(typeof body.error).toBe('string')
    expect(body.error).not.toContain('API key')
    expect(body.error).toContain(PHONE)
    expect(mockReportFailure).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'failed', payment: true, status: 401, upstreamCode: 'UNAUTHORIZED' })
    )
  })

  it('does not call the management API at all when the key is missing', async () => {
    delete process.env.ANCHOR_API_KEY

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.error).toContain(PHONE)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockReportFailure).toHaveBeenCalled()
  })
})
