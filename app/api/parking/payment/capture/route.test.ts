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

// jest.mock is hoisted, use global jest.fn() (not @jest/globals) so the factory works
jest.mock('@/lib/api', () => ({
  anchorAPI: {
    captureParkingPayment: jest.fn(),
  },
}))

import { describe, it, expect, beforeEach } from '@jest/globals'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { anchorAPI } from '@/lib/api'

const mockCapture = jest.mocked(anchorAPI.captureParkingPayment)

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/parking/payment/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => { jest.clearAllMocks() })

describe('POST /api/parking/payment/capture', () => {
  it('returns booking details on success', async () => {
    mockCapture.mockResolvedValue({
      booking_id: 'booking-abc',
      reference: 'PAR-20260401-0001',
      status: 'confirmed',
    })

    const res = await POST(makeRequest({ orderID: 'PAYPAL-123', bookingId: '550e8400-e29b-41d4-a716-446655440000' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.booking_id).toBe('booking-abc')
  })

  it('returns 400 for missing fields', async () => {
    const res = await POST(makeRequest({ orderID: 'PAYPAL-123' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-UUID bookingId', async () => {
    const res = await POST(makeRequest({ orderID: 'PAYPAL-123', bookingId: 'not-a-uuid' }))
    expect(res.status).toBe(400)
  })

  it('returns 502 on capture failure', async () => {
    mockCapture.mockRejectedValue(new Error('Capture failed'))
    const res = await POST(makeRequest({ orderID: 'PAYPAL-123', bookingId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(502)
  })
})
