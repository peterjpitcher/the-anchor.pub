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

import { createHash } from 'crypto'
import { POST } from '../route'
import { NextRequest } from 'next/server'

const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

describe('POST /api/table-bookings/paypal/capture-order', () => {
  beforeEach(() => jest.clearAllMocks())

  afterEach(() => {
    delete process.env.CHEERSAI_BOOKING_CONVERSIONS_SECRET
    delete process.env.CHEERSAI_BOOKING_CONVERSIONS_URL
  })

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
    expect(res.headers.get('Cache-Control')).toBe('no-store, max-age=0')
    expect(body.success).toBe(true)
  })

  it('forwards successful captures as paid table booking conversions', async () => {
    process.env.CHEERSAI_BOOKING_CONVERSIONS_SECRET = 'cheers-secret'
    process.env.CHEERSAI_BOOKING_CONVERSIONS_URL = 'https://cheers.example.com/api/booking-conversions'
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true }), { status: 202 }))

    const req = new NextRequest('http://localhost/api/table-bookings/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
        orderId: 'ORDER-123',
        bookingReference: 'TB-PAID-123',
        depositAmount: 100,
        bookingDate: '2026-05-23',
        bookingTime: '19:30',
        partySize: 10,
        purpose: 'food',
        source_url: 'https://www.the-anchor.pub/book-table?utm_campaign=party-booking&short_code=ma-party',
        landing_path: '/book-table',
        utm_source: 'facebook',
        utm_medium: 'paid_social',
        utm_campaign: 'party-booking',
        gclid: 'g-123',
        short_code: 'ma-party',
        attribution_captured_at: '2026-05-23T18:00:00.000Z',
        attribution_updated_at: '2026-05-23T18:20:00.000Z',
      }),
      headers: { 'content-type': 'application/json' },
    })

    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://cheers.example.com/api/booking-conversions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer cheers-secret',
          'Content-Type': 'application/json',
        }),
      }),
    )
    const conversion = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body))
    expect(conversion).toMatchObject({
      bookingId: 'TB-PAID-123',
      metaEventId: 'TB-PAID-123',
      bookingType: 'table',
      tickets: 10,
      // Estimated covers revenue (10 × £25), NOT the £100 deposit.
      value: 250,
      currency: 'GBP',
      foodIntent: 'food',
      landingPath: '/book-table',
      utmSource: 'facebook',
      utmMedium: 'paid_social',
      utmCampaign: 'party-booking',
      gclid: 'g-123',
      shortCode: 'ma-party',
      attributionCapturedAt: '2026-05-23T18:00:00.000Z',
      attributionUpdatedAt: '2026-05-23T18:20:00.000Z',
    })
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

  describe('advanced matching (email/phone)', () => {
    const CONTACT = { email: 'Test@Example.COM', phone: '07700 900123' }
    // Computed independently of lib/booking-conversion-signals so the test cannot
    // pass by agreeing with a broken implementation.
    const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex')
    const EXPECTED_EMAIL_HASH = sha256('test@example.com')
    const EXPECTED_PHONE_HASH = sha256('447700900123')

    function buildRequest(extra: Record<string, unknown>) {
      return new NextRequest('http://localhost/api/table-bookings/paypal/capture-order', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: '550e8400-e29b-41d4-a716-446655440000',
          orderId: 'ORDER-123',
          bookingReference: 'TB-PAID-123',
          partySize: 4,
          ...extra,
        }),
        headers: { 'content-type': 'application/json' },
      })
    }

    function primeFetch() {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
        .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true }), { status: 202 }))
    }

    beforeEach(() => {
      process.env.CHEERSAI_BOOKING_CONVERSIONS_SECRET = 'cheers-secret'
      process.env.CHEERSAI_BOOKING_CONVERSIONS_URL = 'https://cheers.example.com/api/booking-conversions'
    })

    it('should forward hashed email and phone when marketing consent is granted', async () => {
      primeFetch()
      const res = await POST(buildRequest({
        meta_consent_granted: true,
        default_country_code: '44',
        ...CONTACT,
      }))

      expect(res.status).toBe(200)
      const conversion = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body))
      expect(conversion.emailSha256).toBe(EXPECTED_EMAIL_HASH)
      expect(conversion.phoneSha256).toBe(EXPECTED_PHONE_HASH)
      expect(conversion.value).toBe(100) // 4 covers × £25
    })

    it('should never forward raw email or phone, only digests', async () => {
      primeFetch()
      await POST(buildRequest({ meta_consent_granted: true, ...CONTACT }))

      const conversion = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body))
      expect(conversion.email).toBeUndefined()
      expect(conversion.phone).toBeUndefined()
      expect(JSON.stringify(conversion)).not.toContain('Test@Example.COM')
      expect(JSON.stringify(conversion)).not.toContain('900123')
    })

    it('should null the hashes when marketing consent is absent', async () => {
      primeFetch()
      await POST(buildRequest({ meta_consent_granted: false, ...CONTACT }))

      const conversion = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body))
      expect(conversion.emailSha256).toBeNull()
      expect(conversion.phoneSha256).toBeNull()
    })
  })
})
