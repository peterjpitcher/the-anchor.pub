describe('Event Bookings API - Mother’s Day policy fallback', () => {
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

  it('returns a direct /book-table Mother’s Day redirect on POLICY_VIOLATION', async () => {
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

    expect(payload.fallback_booking_flow).toBe('mothers_day_table_booking')
    expect(String(payload.redirect_to)).toContain('/book-table?')
    expect(String(payload.redirect_to)).toContain('date=2026-03-15')
    expect(String(payload.redirect_to)).toContain('purpose=food')
    expect(String(payload.redirect_to)).toContain('sunday_lunch=true')
    expect(String(payload.redirect_to)).toContain('mothers_day=true')
    expect(String(payload.redirect_to)).toContain('party_size=4')
    expect(response.headers.get('X-Fallback-Redirect')).toBe(payload.redirect_to)
  })
})
