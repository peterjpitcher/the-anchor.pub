export {}

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

const SUNDAY_HOURS = {
  regularHours: {
    sunday: {
      opens: '12:00',
      closes: '23:00',
      is_closed: false,
      kitchen: {
        opens: '12:00',
        closes: '21:00'
      }
    }
  },
  specialHours: []
} as any

describe('Table Bookings API - Service Window Enforcement', () => {
  let createTableBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)
    ;(global as any).fetch = jest.fn()

    // Polyfill the static Response.json helper that NextResponse.json relies on
    // (Jest's node-fetch Response doesn't include it).
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
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('rejects food bookings outside kitchen hours', async () => {
    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-01',
        time: '21:30',
        party_size: 2,
        purpose: 'food'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toContain('Food bookings')
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
  })

  it('allows drinks bookings in late bar-only slots', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            state: 'confirmed',
            booking_reference: 'TB-TEST'
          }
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-01',
        time: '21:30',
        party_size: 2,
        purpose: 'drinks'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledTimes(1)

    const [, upstreamOptions] = (global.fetch as jest.Mock).mock.calls[0]
    const upstreamPayload = JSON.parse(String((upstreamOptions as RequestInit).body))
    expect(upstreamPayload.purpose).toBe('drinks')
  })
})
