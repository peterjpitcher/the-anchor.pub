/**
 * BK-191: the event booking form's signals are checked against fixed lists, logged as one line
 * and counted by the management app. Nothing a visitor typed can get through, and the page is
 * stripped of ids and query strings. Always 204.
 */

const mockRecord = jest.fn(async (_signal: Record<string, unknown>) => ({ recorded: true, reason: 'recorded' }))
jest.mock('@/lib/booking-funnel-report', () => ({
  recordBookingFormSignal: (signal: Record<string, unknown>) => mockRecord(signal)
}))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/booking-form-signal/route'
import { BOOKING_FORM_SIGNAL_PATH, sendEventBookingFormSignal } from '@/lib/booking-form-signal'

let warn: jest.SpyInstance
let address = 0

function beacon(body: unknown, referer = 'https://www.the-anchor.pub/events/tasting-night-2026-11-20?utm_source=x'): NextRequest {
  address += 1
  return new NextRequest('http://localhost/api/booking-form-signal', {
    method: 'POST',
    headers: { 'content-type': 'application/json', referer, 'x-forwarded-for': `192.0.2.${address % 250}` },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  })
}

function lines(): Array<Record<string, unknown>> {
  return warn.mock.calls
    .map((call) => String(call[0]))
    .filter((line) => line.startsWith('[booking-form-signal] '))
    .map((line) => JSON.parse(line.slice('[booking-form-signal] '.length)))
}

beforeEach(() => {
  mockRecord.mockClear()
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => warn.mockRestore())

describe('POST /api/booking-form-signal', () => {
  it('logs and counts a blocked form with its reason and the page, without the query string', async () => {
    const response = await POST(beacon({ form: 'event_booking', step: 'blocked', reason: 'no_security_token' }))

    expect(response.status).toBe(204)
    const expected = { form: 'event_booking', step: 'blocked', reason: 'no_security_token', page: '/events/tasting-night-2026-11-20' }
    expect(lines()).toEqual([expected])
    expect(mockRecord).toHaveBeenCalledWith(expected)
  })

  it('drops a reason on any step but blocked', async () => {
    await POST(beacon({ form: 'event_booking', step: 'opened', reason: 'network' }))
    expect(mockRecord).toHaveBeenCalledWith(expect.objectContaining({ step: 'opened', reason: null }))
  })

  it.each([
    ['an unknown form', { form: 'christmas', step: 'opened' }],
    ['an unknown step', { form: 'event_booking', step: 'paid' }],
    ['typed text', { form: 'Alice Booker 07700900123', step: 'opened' }],
    ['not JSON', 'nonsense']
  ])('ignores %s, still answering 204', async (_label, body) => {
    const response = await POST(beacon(body))

    expect(response.status).toBe(204)
    expect(lines()).toEqual([])
    expect(mockRecord).not.toHaveBeenCalled()
  })

  it('strips an id or a number from the page', async () => {
    await POST(beacon({ form: 'event_booking', step: 'opened' }, 'https://www.the-anchor.pub/g/550e8400-e29b-41d4-a716-446655440000/event'))
    expect(lines()[0]).toMatchObject({ page: '/g/:id/event' })
  })
})

describe('sendEventBookingFormSignal', () => {
  it('sends a beacon with the form and the step, and a reason only when blocked', () => {
    const sendBeacon = jest.fn(() => true)
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true })
    try {
      sendEventBookingFormSignal('blocked', 'missing_fields')
      sendEventBookingFormSignal('sent', 'network')

      expect(sendBeacon).toHaveBeenCalledTimes(2)
      expect((sendBeacon.mock.calls as unknown as Array<[string, Blob]>).map(([path]) => path)).toEqual([BOOKING_FORM_SIGNAL_PATH, BOOKING_FORM_SIGNAL_PATH])
    } finally {
      delete (navigator as unknown as { sendBeacon?: unknown }).sendBeacon
    }
  })

  it('does nothing, and never throws, without a beacon', () => {
    expect(() => sendEventBookingFormSignal('opened')).not.toThrow()
  })
})
