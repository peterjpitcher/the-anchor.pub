export {}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
}

/**
 * Routes the Turnstile siteverify call and the management API call separately,
 * so a test can say whether the token was accepted and, independently, what was
 * sent upstream.
 */
function mockFetch({ turnstileOk }: { turnstileOk: boolean }) {
  return jest.fn().mockImplementation((url: string) => {
    if (String(url) === TURNSTILE_VERIFY_URL) {
      return Promise.resolve(
        jsonResponse({
          success: turnstileOk,
          ...(turnstileOk ? {} : { 'error-codes': ['invalid-input-response'] })
        })
      )
    }

    return Promise.resolve(
      jsonResponse({
        success: true,
        data: { state: 'confirmed', booking_id: 'booking-123' }
      })
    )
  })
}

function upstreamCall() {
  return (global.fetch as jest.Mock).mock.calls.find(
    ([url]) => String(url) !== TURNSTILE_VERIFY_URL
  )
}

// The website verifies its own Turnstile token, because it is the only party
// holding the secret that pairs with the widget the guest solved. The
// management API holds a different widget's secret, so the token is
// deliberately NOT forwarded to it.
describe('event booking Turnstile verification', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.ANCHOR_API_KEY = 'test-api-key'
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {})
          }
        })
    }
    ;(global as any).fetch = mockFetch({ turnstileOk: true })
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    delete process.env.TURNSTILE_SECRET_KEY
    jest.clearAllMocks()
  })

  it('verifies the event booking token here and does not forward it', async () => {
    const { POST } = await import('@/app/api/event-bookings/route')
    const response = await POST({
      json: async () => ({
        event_id: '550e8400-e29b-41d4-a716-446655440000',
        phone: '07700900000',
        seats: 2,
        turnstile_token: 'event-token-123',
        _t: 4
      }),
      headers: new Headers({ 'x-forwarded-for': '203.0.113.10' })
    } as any)

    expect(response.status).toBe(200)

    const [verifyUrl, verifyInit] = (global.fetch as jest.Mock).mock.calls[0]
    expect(String(verifyUrl)).toBe(TURNSTILE_VERIFY_URL)
    expect(String(verifyInit.body)).toContain('event-token-123')

    const [, init] = upstreamCall()
    expect(init.headers['x-turnstile-token']).toBeUndefined()

    const upstreamBody = JSON.parse(String(init.body))
    expect(upstreamBody.turnstile_token).toBeUndefined()
    expect(upstreamBody).toMatchObject({
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      phone: '07700900000',
      seats: 2
    })
  })

  it('verifies the event waitlist token here and does not forward it', async () => {
    const { POST } = await import('@/app/api/event-waitlist/route')
    const response = await POST({
      json: async () => ({
        event_id: '550e8400-e29b-41d4-a716-446655440000',
        phone: '07700900000',
        requested_seats: 4,
        turnstile_token: 'waitlist-token-123',
        _t: 4
      }),
      headers: new Headers({ 'x-forwarded-for': '203.0.113.11' })
    } as any)

    expect(response.status).toBe(200)

    const [, init] = upstreamCall()
    expect(init.headers['x-turnstile-token']).toBeUndefined()

    const upstreamBody = JSON.parse(String(init.body))
    expect(upstreamBody.turnstile_token).toBeUndefined()
    expect(upstreamBody).toMatchObject({
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      phone: '07700900000',
      requested_seats: 4
    })
  })

  it('rejects a booking whose token Cloudflare refuses, and books nothing', async () => {
    ;(global as any).fetch = mockFetch({ turnstileOk: false })

    const { POST } = await import('@/app/api/event-bookings/route')
    const response = await POST({
      json: async () => ({
        event_id: '550e8400-e29b-41d4-a716-446655440000',
        phone: '07700900000',
        seats: 2,
        turnstile_token: 'forged-token',
        _t: 4
      }),
      headers: new Headers({ 'x-forwarded-for': '203.0.113.12' })
    } as any)

    expect(response.status).toBe(403)
    expect(upstreamCall()).toBeUndefined()
  })
})
