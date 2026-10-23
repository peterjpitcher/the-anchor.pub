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
    createParkingPaymentOrder: jest.fn(),
  },
}))

import { describe, it, expect, beforeEach } from '@jest/globals'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { anchorAPI } from '@/lib/api'

const mockCreateOrder = jest.mocked(anchorAPI.createParkingPaymentOrder)

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/parking/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  customer: { first_name: 'Jane', last_name: 'Smith', mobile_number: '+447700900001' },
  vehicle: { registration: 'AB12CDE' },
  start_at: '2026-04-01T08:00:00+01:00',
  end_at: '2026-04-08T18:00:00+01:00',
}

beforeEach(() => { jest.clearAllMocks() })

describe('POST /api/parking/payment/create-order', () => {
  it('returns paypal_order_id and booking_id on success', async () => {
    mockCreateOrder.mockResolvedValue({
      paypal_order_id: 'PAYPAL-123',
      booking_id: 'booking-abc',
      reference: 'PAR-20260401-0001',
      amount: 105,
      currency: 'GBP',
    })

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.paypal_order_id).toBe('PAYPAL-123')
    expect(data.booking_id).toBe('booking-abc')
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ vehicle: expect.objectContaining({ registration: 'AB12CDE' }) }),
      // end_at is part of the key now: AMS's request hash includes it, so leaving
      // it out meant changing only the departure time reused the key with a
      // different payload and 409'd the guest out for 24 hours.
      Buffer.from('+447700900001|AB12CDE|2026-04-01T08:00:00+01:00|2026-04-08T18:00:00+01:00|null').toString('base64')
    )
  })

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({ customer: { first_name: 'Jane' } }))
    expect(res.status).toBe(400)
  })

  it('returns 409 with user-friendly message on capacity conflict', async () => {
    const err = Object.assign(new Error('Capacity unavailable'), { status: 409, code: 'CAPACITY_UNAVAILABLE' })
    mockCreateOrder.mockRejectedValue(err)

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data.error).toMatch(/fully booked/i)
  })

  it('returns 502 on management API failure', async () => {
    mockCreateOrder.mockRejectedValue(new Error('Network error'))
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(502)
  })
})

// What the API client throws when the management app answers with an error.
function upstreamError(status: number, code: string, message: string) {
  return { status, code, message, details: {} }
}

describe('POST /api/parking/payment/create-order: details the guest can put right', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => jest.restoreAllMocks())

  function failureLogLines(): Array<Record<string, unknown>> {
    const calls = [...jest.mocked(console.error).mock.calls, ...jest.mocked(console.warn).mock.calls]
    return calls
      .map(([line]) => String(line))
      .filter((line) => line.startsWith('[write-failure]'))
      .map((line) => JSON.parse(line.slice('[write-failure]'.length).trim()))
  }

  it.each([
    'Please enter a valid phone number',
    'Parking must be booked for at least 30 minutes',
    'Please enter your surname'
  ])('shows "%s" with our number, as a refusal nobody is alerted about', async (sentence) => {
    mockCreateOrder.mockRejectedValue(upstreamError(400, 'VALIDATION_ERROR', sentence))

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({ error: `${sentence}. Call 01753 682707 if you need help.`, code: 'VALIDATION_ERROR' })
    expect(failureLogLines()).toEqual([
      expect.objectContaining({ kind: 'refused', status: 400, reason: 'GUEST_DETAILS_REFUSED', alert: 'none' })
    ])
  })

  it('keeps any other refusal a fault, with the general line and an alert', async () => {
    mockCreateOrder.mockRejectedValue(upstreamError(400, 'VALIDATION_ERROR', 'Invalid booking payload'))

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(502)
    expect(data.code).toBeUndefined()
    expect(data.error).toContain('01753 682707')
    expect(failureLogLines()).toEqual([
      expect.objectContaining({ kind: 'failed', reason: 'CREATE_ORDER_FAILED', upstreamCode: 'VALIDATION_ERROR' })
    ])
  })

  it('does not pass an allowed sentence through on a status other than 400', async () => {
    mockCreateOrder.mockRejectedValue(upstreamError(500, 'INTERNAL_ERROR', 'Please enter your surname'))

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(502)
    expect(failureLogLines()).toEqual([expect.objectContaining({ kind: 'failed' })])
  })
})
