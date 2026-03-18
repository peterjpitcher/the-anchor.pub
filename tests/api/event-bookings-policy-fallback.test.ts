describe('Event Bookings API - policy violation handling', () => {
  let createEventBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    ;(global as any).fetch = jest.fn()
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

    jest.resetModules()
    ;({ POST: createEventBooking } = await import('@/app/api/event-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.clearAllMocks()
  })

  it('returns 409 with inline error message on POLICY_VIOLATION — no redirect URL', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'POLICY_VIOLATION',
            message: 'Sunday lunch only'
          }
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const request = {
      json: async () => ({
        event_id: '550e8400-e29b-41d4-a716-446655440000',
        phone: '07700900000',
        seats: 4,
        first_name: 'Jane',
        last_name: 'Guest'
      }),
      headers: new Headers()
    } as any

    const response = await createEventBooking(request)

    expect(response.status).toBe(409)
    const payload = await response.json()

    expect(payload.success).toBe(false)
    expect(payload.error?.code).toBe('POLICY_VIOLATION')
    expect(typeof payload.error?.message).toBe('string')
    expect(payload.error?.message.length).toBeGreaterThan(0)

    // Must NOT include any redirect or fallback booking fields
    expect(payload.redirect_to).toBeUndefined()
    expect(payload.fallback_booking_flow).toBeUndefined()
    expect(response.headers.get('X-Fallback-Redirect')).toBeNull()
  })

  it('returns a fallback message when the upstream 409 body has no message', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, code: 'POLICY_VIOLATION' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const request = {
      json: async () => ({
        event_id: '550e8400-e29b-41d4-a716-446655440000',
        phone: '07700900000',
        seats: 2
      }),
      headers: new Headers()
    } as any

    const response = await createEventBooking(request)

    expect(response.status).toBe(409)
    const payload = await response.json()

    expect(payload.success).toBe(false)
    expect(payload.error?.code).toBe('POLICY_VIOLATION')
    expect(typeof payload.error?.message).toBe('string')
    expect(payload.error?.message.length).toBeGreaterThan(0)
    expect(payload.redirect_to).toBeUndefined()
  })
})
