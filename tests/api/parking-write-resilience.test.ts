export {}

// The three parking write paths, under outage.
//
// Two of them move money. Until now none of them had a single test, and the
// two payment routes swallowed every failure with a bare `catch {}`: a guest
// could be charged by PayPal, the capture could fail, and nothing anywhere
// recorded it. The rule these tests hold is the same one the private-hire
// enquiry route learned in August: a write that did not happen must never come
// back as a success, the guest must be told, and we must be able to see it.

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false }),
}))

const mockLogError = jest.fn()
jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: (...args: unknown[]) => mockLogError(...args) }
})

const mockCreateParkingBooking = jest.fn()
const mockCreateParkingPaymentOrder = jest.fn()
const mockCaptureParkingPayment = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    createParkingBooking: (...args: unknown[]) => mockCreateParkingBooking(...args),
    createParkingPaymentOrder: (...args: unknown[]) => mockCreateParkingPaymentOrder(...args),
    captureParkingPayment: (...args: unknown[]) => mockCaptureParkingPayment(...args),
  },
}))

if (typeof (Response as unknown as { json?: unknown }).json !== 'function') {
  ;(Response as unknown as Record<string, unknown>).json = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
}

const PHONE = '01753 682707'

function post(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const VALID_BOOKING = {
  customer: {
    first_name: 'Alice',
    last_name: 'Traveller',
    email: 'alice@example.com',
    mobile_number: '07700900000',
  },
  vehicle: { registration: 'AB12 CDE' },
  start_at: '2026-10-01T08:00:00.000Z',
  end_at: '2026-10-05T08:00:00.000Z',
}

const UPSTREAM_DOWN = Object.assign(new Error('fetch failed'), {
  code: 'NETWORK_ERROR',
  status: 0,
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/parking/bookings under outage', () => {
  it('never reports success when the management API refuses the write', async () => {
    mockCreateParkingBooking.mockRejectedValue(UPSTREAM_DOWN)

    const { POST } = await import('@/app/api/parking/bookings/route')
    const response = await POST(post('http://localhost/api/parking/bookings', VALID_BOOKING) as never)
    const body = await response.json()

    expect(response.status).toBeGreaterThanOrEqual(500)
    expect(body.success).toBe(false)
    expect(body.data).toBeUndefined()
  })

  it('gives the guest the phone number rather than a dead end', async () => {
    mockCreateParkingBooking.mockRejectedValue(UPSTREAM_DOWN)

    const { POST } = await import('@/app/api/parking/bookings/route')
    const response = await POST(post('http://localhost/api/parking/bookings', VALID_BOOKING) as never)
    const body = await response.json()

    expect(body.error.message).toContain(PHONE)
  })

  it('logs the failure so the outage is visible to us', async () => {
    mockCreateParkingBooking.mockRejectedValue(UPSTREAM_DOWN)

    const { POST } = await import('@/app/api/parking/bookings/route')
    await POST(post('http://localhost/api/parking/bookings', VALID_BOOKING) as never)

    expect(mockLogError).toHaveBeenCalledWith('api/parking/bookings', UPSTREAM_DOWN, expect.any(Object))
  })

  it('still points a locked-out guest at the phone when the API key is rejected', async () => {
    mockCreateParkingBooking.mockRejectedValue({ code: 'UNAUTHORIZED', status: 401 })

    const { POST } = await import('@/app/api/parking/bookings/route')
    const response = await POST(post('http://localhost/api/parking/bookings', VALID_BOOKING) as never)
    const body = await response.json()

    expect(body.success).toBe(false)
    expect(body.error.message).toContain(PHONE)
  })
})

describe('POST /api/parking/payment/create-order under outage', () => {
  const VALID_ORDER = {
    customer: VALID_BOOKING.customer,
    vehicle: VALID_BOOKING.vehicle,
    start_at: '2026-10-01T08:00:00+00:00',
    end_at: '2026-10-05T08:00:00+00:00',
  }

  it('fails closed with the phone number when the order cannot be created', async () => {
    mockCreateParkingPaymentOrder.mockRejectedValue(UPSTREAM_DOWN)

    const { POST } = await import('@/app/api/parking/payment/create-order/route')
    const response = await POST(post('http://localhost/api/parking/payment/create-order', VALID_ORDER) as never)
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.error).toContain(PHONE)
    expect(mockLogError).toHaveBeenCalledWith(
      'api/parking/payment/create-order',
      UPSTREAM_DOWN,
      expect.any(Object),
    )
  })

  it('refuses an order with no PayPal id rather than opening PayPal on nothing', async () => {
    // A 2xx that carries no paypal_order_id is not an order. Returning it as a
    // 201 sent the wizard into PayPal with `undefined`.
    mockCreateParkingPaymentOrder.mockResolvedValue({ booking_id: 'bk_1' })

    const { POST } = await import('@/app/api/parking/payment/create-order/route')
    const response = await POST(post('http://localhost/api/parking/payment/create-order', VALID_ORDER) as never)
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.error).toContain(PHONE)
    expect(mockLogError).toHaveBeenCalled()
  })

  it('still passes a genuine capacity rejection through, so the guest can pick new dates', async () => {
    mockCreateParkingPaymentOrder.mockRejectedValue({ status: 409, code: 'CAPACITY_UNAVAILABLE' })

    const { POST } = await import('@/app/api/parking/payment/create-order/route')
    const response = await POST(post('http://localhost/api/parking/payment/create-order', VALID_ORDER) as never)
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.code).toBe('CAPACITY_UNAVAILABLE')
    expect(body.error).toMatch(/fully booked/i)
  })

  it('creates the order when the management API answers properly', async () => {
    mockCreateParkingPaymentOrder.mockResolvedValue({
      booking_id: 'bk_1',
      paypal_order_id: 'PAYPAL-1',
    })

    const { POST } = await import('@/app/api/parking/payment/create-order/route')
    const response = await POST(post('http://localhost/api/parking/payment/create-order', VALID_ORDER) as never)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.paypal_order_id).toBe('PAYPAL-1')
  })
})

describe('POST /api/parking/payment/capture under outage', () => {
  const VALID_CAPTURE = {
    orderID: 'PAYPAL-1',
    bookingId: '550e8400-e29b-41d4-a716-446655440000',
  }

  it('tells a guest whose money may already have moved to call us', async () => {
    mockCaptureParkingPayment.mockRejectedValue(UPSTREAM_DOWN)

    const { POST } = await import('@/app/api/parking/payment/capture/route')
    const response = await POST(post('http://localhost/api/parking/payment/capture', VALID_CAPTURE) as never)
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.error).toContain(PHONE)
  })

  it('logs the capture failure, which a bare catch used to hide completely', async () => {
    mockCaptureParkingPayment.mockRejectedValue(UPSTREAM_DOWN)

    const { POST } = await import('@/app/api/parking/payment/capture/route')
    await POST(post('http://localhost/api/parking/payment/capture', VALID_CAPTURE) as never)

    expect(mockLogError).toHaveBeenCalledWith(
      'api/parking/payment/capture',
      UPSTREAM_DOWN,
      expect.any(Object),
    )
  })

  it('refuses a capture with no booking reference instead of confirming one', async () => {
    // The wizard routes to /heathrow-parking/confirmation/<booking_id> on a 2xx.
    // An empty answer would have sent the guest to a confirmation page for a
    // booking that may not exist.
    mockCaptureParkingPayment.mockResolvedValue({})

    const { POST } = await import('@/app/api/parking/payment/capture/route')
    const response = await POST(post('http://localhost/api/parking/payment/capture', VALID_CAPTURE) as never)
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.error).toContain(PHONE)
    expect(body.booking_id).toBeUndefined()
    expect(mockLogError).toHaveBeenCalled()
  })

  it('confirms a real capture', async () => {
    mockCaptureParkingPayment.mockResolvedValue({ booking_id: 'bk_1', status: 'confirmed' })

    const { POST } = await import('@/app/api/parking/payment/capture/route')
    const response = await POST(post('http://localhost/api/parking/payment/capture', VALID_CAPTURE) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.booking_id).toBe('bk_1')
    expect(mockLogError).not.toHaveBeenCalled()
  })
})
