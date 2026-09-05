export {}

// Joining the waitlist is a write, and the only record of it lives in the
// management app. When that call breaks, the guest must be told and we must be
// able to see it. The subtle case is the last one: an OK status whose body we
// could not read used to come back as that same OK status carrying
// `success: false`, which is a 2xx for a join that never happened.
//
// Idempotency-key behaviour is covered separately in
// tests/api/event-waitlist-idempotency.test.ts, and Turnstile in
// tests/api/event-turnstile-forwarding.test.ts.

// NextResponse.json delegates to the static Response.json, which the node-fetch
// polyfill in jest.setup.js does not provide.
if (typeof (Response as unknown as { json?: unknown }).json !== 'function') {
  ;(Response as unknown as Record<string, unknown>).json = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
}

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://example.invalid/api',
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false }),
}))

const mockLogError = jest.fn()
jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: (...args: unknown[]) => mockLogError(...args) }
})

const PHONE = '01753 682707'

const VALID_BODY = {
  event_id: '550e8400-e29b-41d4-a716-446655440000',
  phone: '07700900000',
  requested_seats: 2,
  first_name: 'Alice',
  last_name: 'Waiting',
}

const ORIGINAL_ENV = process.env

function request(): Request {
  return new Request('http://localhost/api/event-waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(VALID_BODY),
  })
}

async function loadRoute() {
  jest.resetModules()
  return import('@/app/api/event-waitlist/route')
}

beforeAll(() => {
  process.env = { ...ORIGINAL_ENV, ANCHOR_API_KEY: 'test-key' }
})

afterAll(() => {
  process.env = ORIGINAL_ENV
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/event-waitlist under outage', () => {
  it('tells the guest to call us when the management API never answers', async () => {
    ;(global as unknown as { fetch: jest.Mock }).fetch = jest
      .fn()
      .mockRejectedValue(new Error('fetch failed'))

    const { POST } = await loadRoute()
    const response = await POST(request() as never)
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.error).toContain(PHONE)
    expect(mockLogError).toHaveBeenCalledWith('api/event-waitlist', expect.anything())
  })

  it('does not turn a 500 into a place on the waitlist', async () => {
    ;(global as unknown as { fetch: jest.Mock }).fetch = jest
      .fn()
      .mockResolvedValue(new Response('upstream exploded', { status: 500 }))

    const { POST } = await loadRoute()
    const response = await POST(request() as never)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).not.toBe(true)
  })

  it('refuses an OK status whose body it could not read, rather than passing the 2xx on', async () => {
    // A gateway HTML page served with a 200 is the shape that produced this.
    ;(global as unknown as { fetch: jest.Mock }).fetch = jest
      .fn()
      .mockResolvedValue(new Response('<!doctype html><html><body>502</body></html>', { status: 200 }))

    const { POST } = await loadRoute()
    const response = await POST(request() as never)
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.error).toContain(PHONE)
    expect(mockLogError).toHaveBeenCalled()
  })

  it('still passes a real join straight through', async () => {
    ;(global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { state: 'waiting', position: 3 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const { POST } = await loadRoute()
    const response = await POST(request() as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.state).toBe('waiting')
    expect(mockLogError).not.toHaveBeenCalled()
  })
})
