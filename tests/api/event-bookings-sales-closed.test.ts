describe('Event Bookings API - sales cutoff handling', () => {
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

  it('maps an upstream 409 SALES_CLOSED to a 409 with the closed message', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'SALES_CLOSED',
            message: 'Sales are over'
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
        seats: 2,
        first_name: 'Jane',
        last_name: 'Guest',
        _t: 4
      }),
      headers: new Headers()
    } as any

    const response = await createEventBooking(request)

    expect(response.status).toBe(409)
    const payload = await response.json()

    expect(payload.success).toBe(false)
    expect(payload.error?.code).toBe('SALES_CLOSED')
    expect(payload.error?.message).toBe(
      'Online ticket sales for this event have closed.'
    )

    // Must NOT include any redirect or fallback booking fields
    expect(payload.redirect_to).toBeUndefined()
    expect(payload.fallback_booking_flow).toBeUndefined()
  })

  it('does not treat a successful booking as SALES_CLOSED', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { state: 'confirmed', booking_id: 'booking-123' }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const request = {
      json: async () => ({
        event_id: '550e8400-e29b-41d4-a716-446655440000',
        phone: '07700900000',
        seats: 2,
        _t: 4
      }),
      headers: new Headers()
    } as any

    const response = await createEventBooking(request)

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.error?.code).toBeUndefined()
  })
})
