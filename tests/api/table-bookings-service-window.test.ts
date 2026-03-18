const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
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

describe('Table Bookings API - Service Window Enforcement', () => {
  let createTableBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)
    ;(global as any).fetch = jest.fn()

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

  it('rejects sunday_lunch payloads that are not food bookings', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-15T10:00:00.000Z'))

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-22',
        time: '13:00',
        party_size: 2,
        purpose: 'drinks',
        sunday_lunch: true
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toContain('food bookings')
  })

  describe('Sunday lunch - kitchen: null special hours', () => {
    const SUNDAY_WITH_NULL_KITCHEN = {
      regularHours: {
        sunday: {
          opens: '12:00',
          closes: '23:00',
          is_closed: false,
          kitchen: { opens: '12:00', closes: '21:00' }
        }
      },
      specialHours: [
        {
          date: '2026-03-22',
          is_closed: false,
          is_kitchen_closed: false,
          kitchen: null,         // deliberate closure signal
          schedule_config: [
            // schedule_config has sunday_lunch — this is the bypass scenario
            { booking_type: 'sunday_lunch', starts_at: '12:00', ends_at: '16:00', capacity: 30 }
          ]
        }
      ]
    } as any

    // Note: do NOT call jest.resetModules() here — the outer beforeEach handles module setup.
    // Only override the mock return value for these tests.
    beforeEach(() => {
      mockGetBusinessHours.mockResolvedValue(SUNDAY_WITH_NULL_KITCHEN)
    })

    it('rejects sunday lunch booking when special day has kitchen: null (even with schedule_config)', async () => {
      const request = {
        json: async () => ({
          phone: '07700900000',
          date: '2026-03-22',
          time: '13:00',
          party_size: 2,
          purpose: 'food',
          sunday_lunch: true    // use the boolean field, not booking_type string
        }),
        headers: new Headers()
      } as any

      const response = await createTableBooking(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(String(data.error)).toMatch(/sunday lunch|unavailable|kitchen/i)
      expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
    })

    it('rejects sunday lunch when special day has is_kitchen_closed: true', async () => {
      const hoursWithFlag = {
        ...SUNDAY_WITH_NULL_KITCHEN,
        specialHours: [
          {
            ...SUNDAY_WITH_NULL_KITCHEN.specialHours[0],
            kitchen: null,
            is_kitchen_closed: true
          }
        ]
      }
      mockGetBusinessHours.mockResolvedValue(hoursWithFlag)

      const request = {
        json: async () => ({
          phone: '07700900000',
          date: '2026-03-22',
          time: '13:00',
          party_size: 2,
          purpose: 'food',
          sunday_lunch: true    // use the boolean field, not booking_type string
        }),
        headers: new Headers()
      } as any

      const response = await createTableBooking(request)

      expect(response.status).toBe(400)
      expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
    })

    it('still allows sunday lunch when special day has kitchen open (not null)', async () => {
      const hoursWithOpenKitchen = {
        ...SUNDAY_WITH_NULL_KITCHEN,
        specialHours: [
          {
            ...SUNDAY_WITH_NULL_KITCHEN.specialHours[0],
            kitchen: { opens: '12:00', closes: '16:00' },
            schedule_config: [
              { booking_type: 'sunday_lunch', starts_at: '12:00', ends_at: '16:00', capacity: 30 }
            ]
          }
        ]
      }
      mockGetBusinessHours.mockResolvedValue(hoursWithOpenKitchen)
      // Use new Response(...) pattern consistent with the rest of this test file
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'REF123' } }),
          { status: 201 }
        )
      )

      const request = {
        json: async () => ({
          phone: '07700900000',
          date: '2026-03-22',
          time: '13:00',
          party_size: 2,
          purpose: 'food',
          sunday_lunch: true    // use the boolean field, not booking_type string
        }),
        headers: new Headers()
      } as any

      const response = await createTableBooking(request)

      // Should reach the management API (not blocked at validation)
      expect((global.fetch as jest.Mock)).toHaveBeenCalled()
    })
  })
})
