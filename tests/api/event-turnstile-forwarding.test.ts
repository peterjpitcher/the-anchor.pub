function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
}

describe('event booking Turnstile forwarding', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.ANCHOR_API_KEY = 'test-api-key'
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
    ;(global as any).fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        data: {
          state: 'confirmed',
          booking_id: 'booking-123'
        }
      })
    )
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.clearAllMocks()
  })

  it('forwards event booking Turnstile token as a header only', async () => {
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

    const [, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(init.headers['x-turnstile-token']).toBe('event-token-123')

    const upstreamBody = JSON.parse(String(init.body))
    expect(upstreamBody.turnstile_token).toBeUndefined()
    expect(upstreamBody).toMatchObject({
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      phone: '07700900000',
      seats: 2
    })
  })

  it('forwards event waitlist Turnstile token as a header only', async () => {
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

    const [, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(init.headers['x-turnstile-token']).toBe('waitlist-token-123')

    const upstreamBody = JSON.parse(String(init.body))
    expect(upstreamBody.turnstile_token).toBeUndefined()
    expect(upstreamBody).toMatchObject({
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      phone: '07700900000',
      requested_seats: 4
    })
  })
})
