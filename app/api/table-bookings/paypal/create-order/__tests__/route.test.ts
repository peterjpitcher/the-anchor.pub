import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock fetch (the proxy makes an upstream fetch call)
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('POST /api/table-bookings/paypal/create-order', () => {
  beforeEach(() => vi.clearAllMocks())

  it('proxies valid request and returns orderId', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orderId: 'PAYPAL-ORDER-123' }),
    })

    const req = new NextRequest('http://localhost/api/table-bookings/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId: '550e8400-e29b-41d4-a716-446655440000' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.orderId).toBe('PAYPAL-ORDER-123')
  })

  it('returns 400 for missing bookingId', async () => {
    const req = new NextRequest('http://localhost/api/table-bookings/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns 502 when upstream is unavailable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const req = new NextRequest('http://localhost/api/table-bookings/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId: '550e8400-e29b-41d4-a716-446655440000' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)

    expect(res.status).toBe(502)
  })
})
