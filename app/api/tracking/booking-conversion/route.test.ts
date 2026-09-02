if (typeof Response !== 'undefined' && !('json' in Response)) {
  Object.assign(Response, {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
      })
  })
}

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { POST } from './route'

const originalEnv = { ...process.env }

function makeRequest(body: object) {
  return new Request('http://localhost/api/tracking/booking-conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

const validPayload = {
  sourceSite: 'www.the-anchor.pub',
  bookingId: 'EVT-123',
  metaEventId: 'EVT-123',
  bookingType: 'event',
  eventId: 'event-1',
  eventSlug: 'quiz-night',
  eventName: 'Quiz Night',
  eventCategoryName: 'Quiz',
  eventCategorySlug: 'quiz',
  eventDate: '2026-05-10T20:00:00+01:00',
  tickets: 2,
  value: 12,
  currency: 'GBP',
  foodIntent: 'planning_to_eat',
  sourceUrl: 'https://www.the-anchor.pub/whats-on/quiz-night?utm_campaign=quiz-night&fbclid=fb-123',
  landingPath: '/whats-on/quiz-night',
  utmSource: 'facebook',
  utmMedium: 'paid_social',
  utmCampaign: 'quiz-night',
  gclid: 'gclid-123',
  fbclid: 'fb-123',
  shortCode: 'ma-quiz',
  attributionCapturedAt: '2026-05-10T18:45:00.000Z',
  attributionUpdatedAt: '2026-05-10T18:55:00.000Z',
  metaConsentGranted: true,
  fbp: 'fb.1.1710000000.browser-123',
  fbc: 'fb.1.1710000000.fbclid-123',
  clientUserAgent: 'Mozilla/5.0 Test',
  occurredAt: '2026-05-10T19:01:00.000Z'
}

beforeEach(() => {
  process.env.CHEERSAI_BOOKING_CONVERSIONS_SECRET = 'secret-123'
  process.env.CHEERSAI_BASE_URL = 'https://cheers.example.com'
  ;(global as any).fetch = jest.fn().mockResolvedValue(new Response('{}', { status: 200 }))
})

afterEach(() => {
  process.env = { ...originalEnv }
  jest.clearAllMocks()
})

describe('POST /api/tracking/booking-conversion', () => {
  it('returns accepted false when forwarding is not configured', async () => {
    delete process.env.CHEERSAI_BOOKING_CONVERSIONS_SECRET

    const response = await POST(makeRequest(validPayload))
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body).toEqual({ accepted: false, reason: 'not_configured' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects invalid client payloads', async () => {
    const response = await POST(makeRequest({ bookingType: 'event' }))

    expect(response.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('forwards valid payloads to CheersAI with the server secret', async () => {
    const response = await POST(makeRequest(validPayload))
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0')
    expect(body).toEqual({ accepted: true })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://cheers.example.com/api/booking-conversions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer secret-123',
          'Content-Type': 'application/json'
        }),
        cache: 'no-store'
      })
    )
    expect(JSON.parse(String((global.fetch as jest.Mock).mock.calls[0]?.[1]?.body))).toEqual(validPayload)
  })

  it('does not fail the booking UX when CheersAI rejects the forward', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(new Response('nope', { status: 500 }))

    const response = await POST(makeRequest(validPayload))
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body).toEqual({ accepted: false, reason: 'upstream_rejected' })
  })
})
