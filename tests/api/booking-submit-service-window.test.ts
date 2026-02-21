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

describe('Booking Submit API - Service Window Enforcement', () => {
  let submitBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)
    mockCreateTableBooking.mockReset()

    jest.resetModules()
    ;({ POST: submitBooking } = await import('@/app/api/booking/submit/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('rejects food bookings outside kitchen hours', async () => {
    const request = {
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        date: '2026-03-01',
        time: '21:30',
        partySize: 2,
        bookingType: 'regular',
        purpose: 'food',
        firstName: 'Pat',
        lastName: 'Guest',
        phone: '07700900000',
        email: 'pat@example.com'
      })
    } as any

    const response = await submitBooking(request)

    expect(response.status).toBe(400)
    const payload = await response.json()
    const message = String(payload?.error?.message || payload?.error || '')
    expect(message).toContain('Food bookings')
    expect(mockCreateTableBooking).not.toHaveBeenCalled()
  })

  it('allows drinks bookings in late bar-only slots', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-DRINKS-1',
      status: 'confirmed',
      confirmation_details: {
        date: '2026-03-01',
        time: '21:30',
        party_size: 2
      }
    })

    const request = {
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        date: '2026-03-01',
        time: '21:30',
        partySize: 2,
        bookingType: 'regular',
        purpose: 'drinks',
        firstName: 'Pat',
        lastName: 'Guest',
        phone: '07700900000',
        email: 'pat@example.com'
      })
    } as any

    const response = await submitBooking(request)

    expect(response.status).toBe(200)
    expect(mockCreateTableBooking).toHaveBeenCalledTimes(1)

    const [payload] = mockCreateTableBooking.mock.calls[0]
    expect(payload.purpose).toBe('drinks')
    expect(payload.booking_type).toBe('regular')
  })
})
