export {}

/**
 * Rate limits on the public routes (site review 7 October 2026, P05).
 *
 * For each route: the request one past the limit is answered 429 with a
 * Retry-After header, the guest-facing ones carry 01753 682707, and nothing is
 * sent to the booking system, PayPal, Google or CheersAI for a refused request.
 *
 * The limiter is the real one. The only things mocked are the outside world
 * (the API client, fetch, the alert email) so that nothing here can book,
 * charge or email anybody.
 */

jest.mock('@/lib/microsoft-graph-mail', () => ({
  sendMicrosoftGraphEmail: jest.fn(async () => ({ success: true })),
  escapeHtml: (text: string) => text
}))

const mockForwardConversion = jest.fn()
jest.mock('@/lib/booking-conversion-forwarding', () => ({
  forwardBookingConversionToCheersAI: (...args: unknown[]) => mockForwardConversion(...args)
}))

const mockVerifyTurnstileToken = jest.fn()
jest.mock('@/lib/turnstile', () => ({
  verifyTurnstileToken: (...args: unknown[]) => mockVerifyTurnstileToken(...args)
}))

const mockApi = {
  createParkingPaymentOrder: jest.fn(),
  getParkingAvailability: jest.fn(),
  getParkingBooking: jest.fn(),
  getEvent: jest.fn(),
  checkEventAvailability: jest.fn(),
  getTableBooking: jest.fn(),
  cancelTableBooking: jest.fn(),
  getBookingPeriodSafe: jest.fn()
}
jest.mock('@/lib/api', () => ({ anchorAPI: mockApi }))

if (typeof (Response as any).json !== 'function') {
  ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...((init?.headers as Record<string, string>) || {}) }
    })
}

import { resetRateLimitsForTests } from '@/lib/rate-limit'

const PHONE_NUMBER = '01753 682707'
const BOOKING_ID = '5f0c2f0e-7f4b-4c59-9d0e-3b9f6a3d2c11'
const VISITOR = '198.51.100.7'
const OTHER_VISITOR = '198.51.100.8'

const originalFetch = global.fetch
const originalApiKey = process.env.ANCHOR_API_KEY

function jsonRequest(path: string, body: unknown, address: string | null = VISITOR): any {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (address) headers.set('cf-connecting-ip', address)
  const url = `https://www.the-anchor.pub${path}`
  return {
    url,
    nextUrl: new URL(url),
    method: 'POST',
    headers,
    json: async () => body,
    text: async () => JSON.stringify(body)
  }
}

function getRequest(path: string, address: string | null = VISITOR, extraHeaders: Record<string, string> = {}): any {
  const headers = new Headers(extraHeaders)
  if (address) headers.set('cf-connecting-ip', address)
  const url = `https://www.the-anchor.pub${path}`
  return { url, nextUrl: new URL(url), method: 'GET', headers }
}

function upstreamAnswers(body: unknown, status = 200): jest.Mock {
  const fetchMock = jest.fn(
    async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  )
  global.fetch = fetchMock as any
  return fetchMock
}

async function expectRefused(response: Response, options: { guestFacing: boolean }): Promise<any> {
  expect(response.status).toBe(429)
  expect(Number(response.headers.get('Retry-After'))).toBeGreaterThan(0)
  expect(response.headers.get('Cache-Control')).toContain('no-store')
  const body = await response.json()
  if (options.guestFacing) {
    const sentence = typeof body.error === 'string' ? body.error : body.error?.message
    expect(sentence).toContain(PHONE_NUMBER)
  }
  return body
}

beforeEach(() => {
  jest.clearAllMocks()
  resetRateLimitsForTests()
  process.env.ANCHOR_API_KEY = 'test-api-key'
  mockVerifyTurnstileToken.mockResolvedValue({ success: true })
  mockForwardConversion.mockResolvedValue({ forwarded: true })
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
  global.fetch = originalFetch
  if (originalApiKey === undefined) delete process.env.ANCHOR_API_KEY
  else process.env.ANCHOR_API_KEY = originalApiKey
})

describe('form submissions (checkSpamProtection)', () => {
  const body = { _t: 45, turnstile_token: 'good-token' }

  it('refuses the sixth in a minute from one visitor with Retry-After and the phone number, before the security check is spent', async () => {
    const { checkSpamProtection } = await import('@/lib/spam-protection')
    for (let i = 0; i < 5; i += 1) {
      expect((await checkSpamProtection(jsonRequest('/api/public/private-booking', body), body)).blocked).toBe(false)
    }

    const sixth = await checkSpamProtection(jsonRequest('/api/public/private-booking', body), body)

    expect(sixth.blocked).toBe(true)
    if (!sixth.blocked) throw new Error('expected a refusal')
    const payload = await expectRefused(sixth.response, { guestFacing: true })
    expect(payload.success).toBe(false)
    // A refused submission must not burn the guest's single-use token.
    expect(mockVerifyTurnstileToken).toHaveBeenCalledTimes(5)
  })

  it('counts by the visitor, so a second visitor behind the same forwarded address is not refused', async () => {
    const { checkSpamProtection } = await import('@/lib/spam-protection')
    const from = (visitor: string) => {
      const request = jsonRequest('/api/public/private-booking', body, visitor)
      request.headers.set('x-forwarded-for', '203.0.113.1')
      return request
    }
    for (let i = 0; i < 5; i += 1) await checkSpamProtection(from(VISITOR), body)

    expect((await checkSpamProtection(from(VISITOR), body)).blocked).toBe(true)
    expect((await checkSpamProtection(from(OTHER_VISITOR), body)).blocked).toBe(false)
  })

  it('lets a submission through when no address can be read, rather than refuse a real guest', async () => {
    const { checkSpamProtection } = await import('@/lib/spam-protection')

    for (let i = 0; i < 8; i += 1) {
      const result = await checkSpamProtection(jsonRequest('/api/public/private-booking', body, null), body)
      expect(result.blocked).toBe(false)
    }
  })
})

describe('starting a payment', () => {
  const parkingOrder = {
    customer: { first_name: 'Alice', last_name: 'Booker', mobile_number: '07700 900123' },
    vehicle: { registration: 'AB12 CDE' },
    start_at: '2026-11-02T09:00:00+00:00',
    end_at: '2026-11-05T09:00:00+00:00'
  }

  it('parking: the eleventh order in an hour from one address is refused and no booking or PayPal order is made', async () => {
    mockApi.createParkingPaymentOrder.mockResolvedValue({ paypal_order_id: 'ORDER-1', booking_id: BOOKING_ID })
    const { POST } = await import('@/app/api/parking/payment/create-order/route')
    for (let i = 0; i < 10; i += 1) {
      // A different number each time, so only the address limit is in play.
      const order = { ...parkingOrder, customer: { ...parkingOrder.customer, mobile_number: `0770090${1000 + i}` } }
      expect((await POST(jsonRequest('/api/parking/payment/create-order', order))).status).toBe(201)
    }

    const refused = await POST(jsonRequest('/api/parking/payment/create-order', parkingOrder))

    await expectRefused(refused, { guestFacing: true })
    expect(mockApi.createParkingPaymentOrder).toHaveBeenCalledTimes(10)
  })

  it('parking: the eleventh order in an hour for one mobile number is refused whichever address it comes from', async () => {
    mockApi.createParkingPaymentOrder.mockResolvedValue({ paypal_order_id: 'ORDER-1', booking_id: BOOKING_ID })
    const { POST } = await import('@/app/api/parking/payment/create-order/route')
    for (let i = 0; i < 10; i += 1) {
      const response = await POST(jsonRequest('/api/parking/payment/create-order', parkingOrder, `198.51.100.${20 + i}`))
      expect(response.status).toBe(201)
    }

    // The same number typed with different spacing is the same number.
    const respaced = { ...parkingOrder, customer: { ...parkingOrder.customer, mobile_number: '07700900123' } }
    const refused = await POST(jsonRequest('/api/parking/payment/create-order', respaced, '198.51.100.99'))

    await expectRefused(refused, { guestFacing: true })
    expect(mockApi.createParkingPaymentOrder).toHaveBeenCalledTimes(10)
  })

  it('parking: with the booking system down the guest is still told, with the phone number, and is not counted out', async () => {
    mockApi.createParkingPaymentOrder.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }))
    const { POST } = await import('@/app/api/parking/payment/create-order/route')

    const response = await POST(jsonRequest('/api/parking/payment/create-order', parkingOrder))

    expect(response.status).toBe(502)
    expect((await response.json()).error).toContain(PHONE_NUMBER)
  })

  it.each([
    ['table deposit', '@/app/api/table-bookings/paypal/create-order/route', '/api/table-bookings/paypal/create-order', { orderId: 'ORDER-1' }],
    ['event tickets', '@/app/api/event-bookings/paypal/create-order/route', '/api/event-bookings/paypal/create-order', { orderId: 'ORDER-1' }]
  ])('%s: the eleventh order in an hour from one address is refused and nothing is sent upstream', async (_label, modulePath, path, okBody) => {
    const fetchMock = upstreamAnswers(okBody)
    const { POST } = await import(modulePath)
    for (let i = 0; i < 10; i += 1) {
      expect((await POST(jsonRequest(path, { bookingId: BOOKING_ID }))).status).toBe(200)
    }

    const refused = await POST(jsonRequest(path, { bookingId: BOOKING_ID }))

    const payload = await expectRefused(refused, { guestFacing: true })
    expect(payload.code).toBe('RATE_LIMITED')
    expect(fetchMock).toHaveBeenCalledTimes(10)

    // Somebody else can still pay.
    expect((await POST(jsonRequest(path, { bookingId: BOOKING_ID }, OTHER_VISITOR))).status).toBe(200)
  })

  it.each([
    ['table deposit', '@/app/api/table-bookings/paypal/create-order/route', '/api/table-bookings/paypal/create-order'],
    ['event tickets', '@/app/api/event-bookings/paypal/create-order/route', '/api/event-bookings/paypal/create-order']
  ])('%s: with the booking system down the guest is told, with the phone number', async (_label, modulePath, path) => {
    global.fetch = jest.fn(async () => {
      throw new Error('connect ECONNREFUSED')
    }) as any
    const { POST } = await import(modulePath)

    const response = await POST(jsonRequest(path, { bookingId: BOOKING_ID }))

    expect(response.status).toBeGreaterThanOrEqual(500)
    expect((await response.json()).error).toContain(PHONE_NUMBER)
  })
})

describe('reads that spend the booking system key', () => {
  it('customer lookup: the seventh in a minute gets the degraded answer and the booking system is not asked', async () => {
    const fetchMock = upstreamAnswers({ success: true, data: { known: true } })
    const { POST } = await import('@/app/api/customers/lookup/route')
    const lookup = () => POST(jsonRequest('/api/customers/lookup', { phone: '07700900123' }))
    for (let i = 0; i < 6; i += 1) {
      expect((await (await lookup()).json()).data).toEqual({ known: true })
    }

    const seventh = await lookup()

    // Not a 429: the booking form carries on without the lookup.
    expect(seventh.status).toBe(200)
    const payload = await seventh.json()
    expect(payload.data).toEqual({ known: false, lookup_degraded: true })
    // The reason stays in our logs; it is not sent back.
    expect(payload.meta).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(6)
  })

  type ReadCase = {
    label: string
    call: (address?: string) => Promise<Response>
    upstream: jest.Mock
  }

  const readCases = (): ReadCase[] => [
    {
      label: 'parking availability',
      upstream: mockApi.getParkingAvailability,
      call: async (address = VISITOR) => {
        const { GET } = await import('@/app/api/parking/availability/route')
        return GET(getRequest('/api/parking/availability?start=2026-11-02T09:00:00Z&end=2026-11-05T09:00:00Z', address))
      }
    },
    {
      label: 'parking booking',
      upstream: mockApi.getParkingBooking,
      call: async (address = VISITOR) => {
        const { GET } = await import('@/app/api/parking/bookings/[id]/route')
        return GET(getRequest(`/api/parking/bookings/${BOOKING_ID}`, address), { params: { id: BOOKING_ID } })
      }
    },
    {
      label: 'event availability',
      upstream: mockApi.checkEventAvailability,
      call: async (address = VISITOR) => {
        const { POST } = await import('@/app/api/events/[id]/availability/route')
        return POST(jsonRequest('/api/events/evt-1/availability', { seats: 2 }, address), { params: { id: 'evt-1' } })
      }
    },
    {
      label: 'table booking periods',
      upstream: mockApi.getBookingPeriodSafe,
      call: async (address = VISITOR) => {
        const { GET } = await import('@/app/api/table-bookings/periods/route')
        return GET(getRequest('/api/table-bookings/periods?date=2026-11-02&party_size=4', address))
      }
    },
    {
      label: 'table booking read',
      upstream: mockApi.getTableBooking,
      call: async (address = VISITOR) => {
        const { GET } = await import('@/app/api/table-bookings/[reference]/route')
        return GET(
          getRequest('/api/table-bookings/TB-1', address, { 'x-customer-email': 'guest@example.com' }),
          { params: { reference: 'TB-1' } }
        )
      }
    },
    {
      label: 'table booking cancel',
      upstream: mockApi.cancelTableBooking,
      call: async (address = VISITOR) => {
        const { DELETE } = await import('@/app/api/table-bookings/[reference]/route')
        const request = getRequest('/api/table-bookings/TB-1', address, { 'x-customer-email': 'guest@example.com' })
        request.method = 'DELETE'
        request.json = async () => ({})
        return DELETE(request, { params: { reference: 'TB-1' } })
      }
    }
  ]

  it.each(readCases().map((testCase) => [testCase.label, testCase] as const))(
    '%s: the twenty-first in a minute from one address is refused and the booking system is not asked',
    async (_label, testCase) => {
      mockApi.getParkingAvailability.mockResolvedValue([{ remaining: 3 }])
      mockApi.getParkingBooking.mockResolvedValue({ id: BOOKING_ID })
      mockApi.getEvent.mockResolvedValue({ bookings_enabled: true })
      mockApi.checkEventAvailability.mockResolvedValue({ available: true, remaining_capacity: 20 })
      mockApi.getBookingPeriodSafe.mockResolvedValue({ ok: true, data: null })
      mockApi.getTableBooking.mockResolvedValue({ reference: 'TB-1' })
      mockApi.cancelTableBooking.mockResolvedValue({ success: true })

      for (let i = 0; i < 20; i += 1) {
        expect((await testCase.call()).status).not.toBe(429)
      }
      const askedBefore = testCase.upstream.mock.calls.length
      // Proof the twenty really reached the booking system, so the count that
      // follows is a real comparison.
      expect(askedBefore).toBe(20)

      const refused = await testCase.call()

      await expectRefused(refused, { guestFacing: true })
      expect(testCase.upstream.mock.calls.length).toBe(askedBefore)

      // Another visitor is not affected.
      expect((await testCase.call(OTHER_VISITOR)).status).not.toBe(429)
    }
  )
})

describe('tracking routes that forward with a server secret', () => {
  it('booking conversion: the twenty-first in a minute is refused and nothing is forwarded to CheersAI', async () => {
    const { POST } = await import('@/app/api/tracking/booking-conversion/route')
    const payload = { sourceSite: 'www.the-anchor.pub', bookingId: 'EVT-123', bookingType: 'event', value: 12, currency: 'GBP' }
    const statuses: number[] = []
    for (let i = 0; i < 20; i += 1) {
      statuses.push((await POST(jsonRequest('/api/tracking/booking-conversion', payload))).status)
    }
    const counted = mockForwardConversion.mock.calls.length
    expect(counted).toBe(20)

    const refused = await POST(jsonRequest('/api/tracking/booking-conversion', payload))

    expect(statuses).not.toContain(429)
    await expectRefused(refused, { guestFacing: false })
    expect(mockForwardConversion.mock.calls.length).toBe(counted)
  })

  it('analytics: the sixty-first batch in a minute is refused and nothing is forwarded to Google', async () => {
    const originalGa4 = { id: process.env.GA4_MEASUREMENT_ID, secret: process.env.GA4_API_SECRET }
    process.env.GA4_MEASUREMENT_ID = 'G-TESTSTREAM'
    process.env.GA4_API_SECRET = 'test-secret'
    const fetchMock = upstreamAnswers({})
    const { POST } = await import('@/app/api/analytics/route')
    const batch = { events: [{ event: 'table_booking_completed', client_id: '111.222', session_id: '1723334455' }] }
    // A visitor who has accepted analytics cookies: without that the route
    // forwards nothing at all, and the limit would have nothing to stop.
    const accepted = () => {
      const request = jsonRequest('/api/analytics', batch)
      request.headers.set(
        'cookie',
        'anchor-cookie-consent=' + encodeURIComponent(JSON.stringify({ necessary: true, analytics: true, marketing: false }))
      )
      return request
    }
    const statuses: number[] = []
    for (let i = 0; i < 60; i += 1) {
      statuses.push((await POST(accepted())).status)
    }
    const forwarded = fetchMock.mock.calls.length
    expect(forwarded).toBe(60)

    const refused = await POST(accepted())

    expect(statuses).not.toContain(429)
    await expectRefused(refused, { guestFacing: false })
    expect(fetchMock.mock.calls.length).toBe(forwarded)

    if (originalGa4.id === undefined) delete process.env.GA4_MEASUREMENT_ID
    else process.env.GA4_MEASUREMENT_ID = originalGa4.id
    if (originalGa4.secret === undefined) delete process.env.GA4_API_SECRET
    else process.env.GA4_API_SECRET = originalGa4.secret
  })
})
