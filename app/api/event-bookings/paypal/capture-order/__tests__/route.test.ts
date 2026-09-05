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

const mockLogError = jest.fn()
jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: (...args: unknown[]) => mockLogError(...args) }
})

const mockForwardConversion = jest.fn().mockResolvedValue(undefined)
jest.mock('@/lib/booking-conversion-forwarding', () => ({
  forwardBookingConversionToCheersAI: (...args: unknown[]) => mockForwardConversion(...args),
}))

import { POST } from '../route'
import { NextRequest } from 'next/server'

const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

const BOOKING_ID = '550e8400-e29b-41d4-a716-446655440000'
const PHONE = '01753 682707'

function request() {
  return new NextRequest('http://localhost/api/event-bookings/paypal/capture-order', {
    method: 'POST',
    body: JSON.stringify({ bookingId: BOOKING_ID, orderId: 'ORDER-123' }),
    headers: { 'content-type': 'application/json' },
  })
}

// The guest has already paid PayPal before this route runs, so every case below
// is about money that may already have moved.
describe('POST /api/event-bookings/paypal/capture-order', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ANCHOR_API_KEY = 'test-key'
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
  })

  it('confirms a genuine capture and forwards the conversion', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockForwardConversion).toHaveBeenCalledTimes(1)
    expect(mockLogError).not.toHaveBeenCalled()
  })

  it('fails closed with the phone number when the management API never answers', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed'))

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.success).toBeUndefined()
    expect(body.error).toContain(PHONE)
    expect(mockForwardConversion).not.toHaveBeenCalled()
    expect(mockLogError).toHaveBeenCalled()
  })

  it('does not dress an unreadable 200 up as a confirmed payment', async () => {
    // This is the expensive direction. The body used to be replaced with our own
    // error object and returned under the upstream's 200, so a guest whose
    // payment was never confirmed could be shown a confirmation.
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
    expect(body.success).toBeUndefined()
    expect(body.error).toContain(PHONE)
    expect(mockForwardConversion).not.toHaveBeenCalled()
    expect(mockLogError).toHaveBeenCalled()
  })

  it('never forwards a conversion for a capture the management API rejected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'Capture failed' }),
    })

    const res = await POST(request())

    expect(res.status).toBe(500)
    expect(mockForwardConversion).not.toHaveBeenCalled()
    expect(mockLogError).toHaveBeenCalled()
  })

  it('keeps the upstream manual-review signal intact', async () => {
    // 202 plus state manual_review is how the management API says "held, a human
    // will look at it". Failing that closed would tell the guest their payment
    // broke when it did not.
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 202,
      json: async () => ({ success: false, state: 'manual_review' }),
    })

    const res = await POST(request())
    const body = await res.json()

    expect(res.status).toBe(202)
    expect(body.state).toBe('manual_review')
    expect(mockForwardConversion).not.toHaveBeenCalled()
  })

  it('returns 400 without touching the management API when the payload is incomplete', async () => {
    const res = await POST(
      new NextRequest('http://localhost/api/event-bookings/paypal/capture-order', {
        method: 'POST',
        body: JSON.stringify({ bookingId: BOOKING_ID }),
        headers: { 'content-type': 'application/json' },
      }),
    )

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
