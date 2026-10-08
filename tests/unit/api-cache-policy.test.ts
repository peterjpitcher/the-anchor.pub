import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'
import { CACHEABLE_API_PATHS } from '@/lib/api-cache-policy'

/**
 * Nothing under /api is stored unless it is named.
 *
 * Until October 2026 the middleware gave every GET under /api
 * `public, s-maxage=60, stale-while-revalidate=300` unless the route set a
 * header of its own. Most did not, so live table availability, parking
 * availability, one customer's parking booking and the phone lookup were kept
 * at the edge and replayed to the next visitor for up to six minutes.
 *
 * These assert what the MIDDLEWARE sends. A route that sets its own
 * Cache-Control replaces it; those are asserted against the routes themselves
 * further down.
 */
function headersFor(path: string, method = 'GET'): Headers {
  const request = new NextRequest(`https://www.the-anchor.pub${path}`, {
    method,
    headers: { host: 'www.the-anchor.pub', 'x-forwarded-proto': 'https' },
  })
  return middleware(request).headers
}

const PUBLIC_RULE = 'public, s-maxage=60, stale-while-revalidate=300'

describe('middleware: /api reads are not stored by default', () => {
  test.each([
    // Live availability.
    '/api/table-bookings/availability?date=2026-10-21&party_size=2&time=19:00',
    '/api/parking/availability?start=2026-10-21&end=2026-10-28',
    '/api/events/abc/availability',
    // Personal, or keyed by something personal.
    '/api/parking/bookings/00000000-0000-4000-8000-000000000000',
    '/api/table-bookings/ABC123?customer_email=guest%40example.com',
    '/api/customers/lookup?phone=07700900000',
    '/api/booking/payment-return?PayerID=abc',
    // One event, with its live seat count, read by the booking form.
    '/api/events/abc',
    // Everything else that used to inherit the public rule.
    '/api/table-bookings/periods?date=2026-12-20&party_size=2',
    '/api/reviews/status',
    '/api/public/private-booking/config',
    '/api/health',
    '/api/analytics',
    // A route nobody has written yet starts out not stored.
    '/api/something-new',
  ])('%s is no-store', (path) => {
    const cacheControl = headersFor(path).get('cache-control') ?? ''
    expect(cacheControl).toBe('no-store, max-age=0')
    expect(cacheControl).not.toContain('public')
    expect(cacheControl).not.toContain('s-maxage')
  })

  test.each([
    ['/api/events', PUBLIC_RULE],
    ['/api/events?limit=5', PUBLIC_RULE],
    ['/api/event-categories', PUBLIC_RULE],
    ['/api/parking/rates', PUBLIC_RULE],
  ])('%s opts in to short caching', (path, expected) => {
    expect(headersFor(path).get('cache-control')).toBe(expected)
  })

  it('names exactly three routes, so adding a fourth is a decision someone reads', () => {
    expect([...CACHEABLE_API_PATHS]).toEqual(['/api/events', '/api/event-categories', '/api/parking/rates'])
  })

  it('matches the named routes exactly, never by prefix', () => {
    // /api/events is on the list; one event and its availability are not.
    expect(headersFor('/api/events/abc').get('cache-control')).toBe('no-store, max-age=0')
    expect(headersFor('/api/parking/rates/anything').get('cache-control')).toBe('no-store, max-age=0')
    expect(headersFor('/api/events-export').get('cache-control')).toBe('no-store, max-age=0')
  })

  it('does not set CDN-Cache-Control on an ordinary read', () => {
    // CDN-Cache-Control outranks Cache-Control at the edge. A route that sets
    // its own public header (reviews, the calendar files) replaces the
    // middleware's Cache-Control but would be left carrying this one, which
    // would silently switch its caching off.
    for (const path of ['/api/reviews', '/api/calendar/upcoming', '/api/customers/lookup?phone=1']) {
      expect(headersFor(path).get('cdn-cache-control')).toBeNull()
    }
  })

  it('leaves business hours exactly as it was', () => {
    const headers = headersFor('/api/business/hours')
    expect(headers.get('cache-control')).toBe('no-store, max-age=0')
    expect(headers.get('cdn-cache-control')).toBe('no-store')
    expect(headers.get('pragma')).toBe('no-cache')
    expect(headers.get('expires')).toBe('0')
  })

  test.each([
    ['POST', '/api/table-bookings'],
    ['POST', '/api/events'],
    ['POST', '/api/parking/rates'],
    ['DELETE', '/api/table-bookings/ABC123'],
  ])('%s %s is never stored, even on a route whose reads are', (method, path) => {
    const headers = headersFor(path, method)
    expect(headers.get('cache-control')).toBe('no-store, max-age=0')
    expect(headers.get('cdn-cache-control')).toBe('no-store')
  })

  it('sets no API rule on a page', () => {
    expect(headersFor('/book-table').get('cache-control')).toBeNull()
  })
})

describe('routes that say private, no-store themselves', () => {
  const originalFetch = global.fetch
  const originalApiKey = process.env.ANCHOR_API_KEY

  beforeAll(() => {
    // jsdom's Response lacks the static json() that NextResponse.json delegates to.
    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: { 'Content-Type': 'application/json', ...((init as any)?.headers || {}) },
        })
    }
  })

  beforeEach(() => {
    jest.resetModules()
    process.env.ANCHOR_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env.ANCHOR_API_KEY = originalApiKey
    jest.restoreAllMocks()
  })

  function mockAnchorApi(methods: Record<string, jest.Mock>) {
    jest.doMock('@/lib/api', () => ({ anchorAPI: methods }))
    jest.doMock('@/lib/error-handling', () => ({
      ...jest.requireActual('@/lib/error-handling'),
      logError: jest.fn(),
    }))
  }

  it('parking availability: the answer and the failure', async () => {
    const getParkingAvailability = jest.fn().mockResolvedValueOnce([])
    mockAnchorApi({ getParkingAvailability })
    const { GET } = await import('@/app/api/parking/availability/route')

    const ok = await GET(new Request('https://www.the-anchor.pub/api/parking/availability'))
    expect(ok.status).toBe(200)
    expect(ok.headers.get('cache-control')).toBe('private, no-store')

    getParkingAvailability.mockRejectedValueOnce(Object.assign(new Error('down'), { status: 503 }))
    const failed = await GET(new Request('https://www.the-anchor.pub/api/parking/availability'))
    expect(failed.status).toBe(503)
    expect(failed.headers.get('cache-control')).toBe('private, no-store')
  })

  it("a parking booking: one customer's details, found or not", async () => {
    const getParkingBooking = jest.fn().mockResolvedValueOnce({ id: 'b1', customer_mobile: '07700900000' })
    mockAnchorApi({ getParkingBooking })
    const { GET } = await import('@/app/api/parking/bookings/[id]/route')
    const request = new Request('https://www.the-anchor.pub/api/parking/bookings/b1')

    const found = await GET(request, { params: { id: 'b1' } })
    expect(found.status).toBe(200)
    expect(found.headers.get('cache-control')).toBe('private, no-store')

    getParkingBooking.mockRejectedValueOnce(Object.assign(new Error('nope'), { status: 404 }))
    const missing = await GET(request, { params: { id: 'b1' } })
    expect(missing.status).toBe(404)
    expect(missing.headers.get('cache-control')).toBe('private, no-store')

    const noId = await GET(request, { params: { id: '' } })
    expect(noId.status).toBe(400)
    expect(noId.headers.get('cache-control')).toBe('private, no-store')
  })

  it('a table booking by reference: the booking and every refusal', async () => {
    const getTableBooking = jest.fn().mockResolvedValueOnce({ booking_reference: 'ABC123' })
    mockAnchorApi({ getTableBooking })
    const { GET } = await import('@/app/api/table-bookings/[reference]/route')
    const withEmail = new Request('https://www.the-anchor.pub/api/table-bookings/ABC123', {
      headers: { 'x-customer-email': 'guest@example.com' },
    })

    const found = await GET(withEmail, { params: { reference: 'ABC123' } })
    expect(found.status).toBe(200)
    expect(found.headers.get('cache-control')).toBe('private, no-store')

    getTableBooking.mockRejectedValueOnce(Object.assign(new Error('nope'), { status: 404 }))
    const missing = await GET(withEmail, { params: { reference: 'ABC123' } })
    expect(missing.status).toBe(404)
    expect(missing.headers.get('cache-control')).toBe('private, no-store')

    const noEmail = await GET(new Request('https://www.the-anchor.pub/api/table-bookings/ABC123'), {
      params: { reference: 'ABC123' },
    })
    expect(noEmail.status).toBe(400)
    expect(noEmail.headers.get('cache-control')).toBe('private, no-store')

    // An email address in the query string is not read: an address is what
    // request logs record, so the route takes it from the header or not at all.
    const emailInAddress = await GET(
      new Request('https://www.the-anchor.pub/api/table-bookings/ABC123?customer_email=guest%40example.com'),
      { params: { reference: 'ABC123' } }
    )
    expect(emailInAddress.status).toBe(400)
    expect(getTableBooking).toHaveBeenCalledTimes(2)
  })

  it('the phone lookup: known, degraded and refused', async () => {
    const { POST } = await import('@/app/api/customers/lookup/route')
    const request = (body: Record<string, unknown>, lastOctet = Math.floor(Math.random() * 200) + 1) =>
      new NextRequest('https://www.the-anchor.pub/api/customers/lookup', {
        method: 'POST',
        headers: { 'x-forwarded-for': `203.0.113.${lastOctet}`, 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })

    global.fetch = jest.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { known: true } }), { status: 200 })
    ) as any
    const known = await POST(request({ phone: '07700900000' }))
    expect(known.status).toBe(200)
    expect(known.headers.get('cache-control')).toBe('private, no-store')

    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network')) as any
    const degraded = await POST(request({ phone: '07700900001' }))
    expect(degraded.headers.get('cache-control')).toBe('private, no-store')

    const missing = await POST(request({}, 250))
    expect(missing.status).toBe(400)
    expect(missing.headers.get('cache-control')).toBe('private, no-store')
  })
})

describe('a route that may be stored never has its failure stored', () => {
  beforeAll(() => {
    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: { 'Content-Type': 'application/json', ...((init as any)?.headers || {}) },
        })
    }
  })

  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  function mockAnchorApi(methods: Record<string, jest.Mock>) {
    jest.doMock('@/lib/api', () => ({ anchorAPI: methods }))
    jest.doMock('@/lib/error-handling', () => ({
      ...jest.requireActual('@/lib/error-handling'),
      logError: jest.fn(),
    }))
  }

  it('events: a good list carries no header of its own, a failure says no-store', async () => {
    const getEvents = jest.fn().mockResolvedValueOnce({ events: [] })
    mockAnchorApi({ getEvents })
    const { GET } = await import('@/app/api/events/route')

    const ok = await GET(new Request('https://www.the-anchor.pub/api/events?limit=5'))
    expect(ok.status).toBe(200)
    // Left to the middleware, which is what opts it in.
    expect(ok.headers.get('cache-control')).toBeNull()

    getEvents.mockRejectedValueOnce(Object.assign(new Error('down'), { status: 503 }))
    const failed = await GET(new Request('https://www.the-anchor.pub/api/events?limit=5'))
    expect(failed.status).toBe(503)
    expect(failed.headers.get('cache-control')).toContain('no-store')
  })

  it('event categories: the empty list that stands in for a failure says no-store', async () => {
    const getEventCategories = jest.fn().mockResolvedValueOnce({ categories: [{ id: 'c1' }] })
    mockAnchorApi({ getEventCategories })
    const { GET } = await import('@/app/api/event-categories/route')

    const ok = await GET()
    expect(ok.headers.get('cache-control')).toBeNull()

    getEventCategories.mockRejectedValueOnce(new Error('down'))
    const failed = await GET()
    expect(failed.status).toBe(200)
    expect(failed.headers.get('cache-control')).toBe('no-store')
  })

  it('parking rates: a failure says no-store', async () => {
    const getParkingRates = jest.fn().mockResolvedValueOnce([{ id: 'r1' }])
    mockAnchorApi({ getParkingRates })
    const { GET } = await import('@/app/api/parking/rates/route')

    const ok = await GET()
    expect(ok.headers.get('cache-control')).toBeNull()

    getParkingRates.mockRejectedValueOnce(new Error('down'))
    const failed = await GET()
    expect(failed.status).toBe(503)
    expect(failed.headers.get('cache-control')).toBe('no-store')
  })
})
