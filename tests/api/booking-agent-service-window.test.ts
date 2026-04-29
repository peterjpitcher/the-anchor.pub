export {}

const mockGetBusinessHours = jest.fn()
const mockCreateTableBooking = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    createTableBooking: (...args: unknown[]) => mockCreateTableBooking(...args)
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

describe('Booking Agent API - Service Window Enforcement', () => {
  let createAgentBooking: (request: any) => Promise<Response>
  let getAvailability: (request: any) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)
    mockCreateTableBooking.mockReset()

    jest.resetModules()
    ;({ POST: createAgentBooking, GET: getAvailability } = await import('@/app/api/booking/agent/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete (global as any).fetch
  })

  it('rejects food bookings outside kitchen hours with neutral copy (AB-003)', async () => {
    const request = {
      json: async () => ({
        date: '2026-03-01',
        time: '21:30',
        partySize: 2,
        type: 'regular',
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000',
          email: 'pat@example.com'
        }
      })
    } as any

    const response = await createAgentBooking(request)

    expect(response.status).toBe(400)
    const payload = await response.json()
    const errorText = String(payload?.error?.message || payload?.error || '')
    expect(errorText).toMatch(/outside online booking hours/i)
    const lower = errorText.toLowerCase()
    expect(lower).not.toContain('food booking')
    expect(lower).not.toContain('switch to drinks')
    expect(lower).not.toContain('kitchen service')
    expect(lower).not.toContain('kitchen hours')
    expect(mockCreateTableBooking).not.toHaveBeenCalled()
  })

  it('allows drinks bookings in late bar-only slots', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-DRINKS',
      status: 'confirmed',
      confirmation_details: {
        date: '2026-03-01',
        time: '21:30',
        party_size: 2
      }
    })

    const request = {
      json: async () => ({
        date: '2026-03-01',
        time: '21:30',
        partySize: 2,
        type: 'regular',
        purpose: 'drinks',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000',
          email: 'pat@example.com'
        }
      })
    } as any

    const response = await createAgentBooking(request)

    expect(response.status).toBe(200)
    expect(mockCreateTableBooking).toHaveBeenCalledTimes(1)

    const [payload] = mockCreateTableBooking.mock.calls[0]
    expect(payload.purpose).toBe('drinks')
    expect(payload.booking_type).toBe('regular')
  })

  it('returns combined slots without filtering by purpose for agent GET', async () => {
    ;(global as any).fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            available: true,
            time_slots: [
              {
                time: '20:00',
                available: true,
                available_capacity: 6,
                kitchen_open: true
              },
              {
                time: '21:30',
                available: true,
                available_capacity: 6,
                kitchen_open: false
              }
            ],
            message: 'These times are based on current service windows and will be confirmed instantly when you continue.'
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const response = await getAvailability({
      url: 'http://localhost:3000/api/booking/agent?date=2026-03-01&partySize=2&type=regular&purpose=drinks'
    } as any)

    expect(response.status).toBe(200)

    const calledUrl = String((global.fetch as jest.Mock).mock.calls[0][0])
    expect(calledUrl).toContain('/api/table-bookings/availability?')
    // Agent GET no longer claims purpose-filtered availability — combined contract.
    expect(calledUrl).not.toContain('purpose=')

    const payload = await response.json()
    expect(payload.success).toBe(true)
    // Purpose filter is gone from the response; service is exposed via per-slot kitchen_open.
    expect(payload).not.toHaveProperty('purpose')
    expect(Array.isArray(payload.times)).toBe(true)
    expect(payload.times.length).toBe(2)
    expect(payload.times.every((t: { kitchen_open?: boolean }) => typeof t.kitchen_open === 'boolean')).toBe(true)
    expect(payload.times[0]).toMatchObject({ time: '20:00', available: true, kitchen_open: true })
    expect(payload.times[1]).toMatchObject({ time: '21:30', available: true, kitchen_open: false })
  })
})
