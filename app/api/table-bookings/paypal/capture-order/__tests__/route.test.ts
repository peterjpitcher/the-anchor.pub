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

import { POST } from '../route'
import { NextRequest } from 'next/server'

const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

describe('POST /api/table-bookings/paypal/capture-order', () => {
  beforeEach(() => jest.clearAllMocks())

  it('proxies valid request and returns success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    const req = new NextRequest('http://localhost/api/table-bookings/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
        orderId: 'ORDER-123',
      }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 400 for missing bookingId or orderId', async () => {
    const req = new NextRequest('http://localhost/api/table-bookings/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId: '550e8400-e29b-41d4-a716-446655440000' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })
})
