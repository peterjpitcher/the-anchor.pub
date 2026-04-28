export {}

const mockGetBusinessHours = jest.fn()
const mockCreateTableBooking = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    createTableBooking: (...args: unknown[]) => mockCreateTableBooking(...args)
  }
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

  it('rejects food bookings outside kitchen hours', async () => {
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
    expect(String(payload?.error?.message || payload?.error || '')).toContain('Food bookings')
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

  it('passes purpose through when checking availability', async () => {
    ;(global as any).fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            available: true,
            time_slots: [
              {
                time: '21:30',
                available: true,
                available_capacity: 6
              }
            ],
            message: 'Slots available'
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
    expect(calledUrl).toContain('purpose=drinks')

    const payload = await response.json()
    expect(payload.purpose).toBe('drinks')
    expect(payload.times).toEqual([{ time: '21:30', available: true }])
  })
})
