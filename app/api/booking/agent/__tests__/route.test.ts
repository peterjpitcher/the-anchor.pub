/**
 * Walk-in-launch behaviour tests for the AI agent booking endpoint.
 *
 * Spec §6, §8.1: the agent endpoint must:
 *   - Always create regular bookings (no Sunday-lunch booking_type),
 *     even when the date falls on a Sunday.
 *   - Surface the £10-per-person deposit messaging only at party_size >= 10.
 *   - NOT include any Sunday-specific copy in the deposit notice.
 *   - Pass purpose through verbatim to the management API.
 */

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

const ALWAYS_OPEN_HOURS = {
  regularHours: {
    monday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    wednesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    thursday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    friday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    saturday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    sunday: { opens: '12:00', closes: '18:00', is_closed: false, kitchen: { opens: '13:00', closes: '17:30' } }
  },
  specialHours: []
} as any

describe('Booking Agent API - walk-in launch behaviour', () => {
  let createAgentBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(ALWAYS_OPEN_HOURS)
    mockCreateTableBooking.mockReset()

    jest.resetModules()
    ;({ POST: createAgentBooking } = await import('@/app/api/booking/agent/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('forwards bookingType=regular even for a Sunday date', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-SUN',
      status: 'confirmed',
      confirmation_details: {
        date: '2026-05-24',
        time: '13:00',
        party_size: 2
      }
    })

    const request = {
      json: async () => ({
        date: '2026-05-24', // Sunday
        time: '13:00',
        partySize: 2,
        type: 'sunday_lunch', // hostile/legacy input — must be ignored
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

    expect(response.status).toBe(200)
    expect(mockCreateTableBooking).toHaveBeenCalledTimes(1)

    const [forwardedPayload] = mockCreateTableBooking.mock.calls[0]
    expect(forwardedPayload.booking_type).toBe('regular')
    expect(forwardedPayload.purpose).toBe('food')

    const body = await response.json()
    expect(body.booking.type).toBe('regular')
  })

  it('omits deposit messaging at party size 9 (just below threshold)', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-9',
      status: 'confirmed',
      confirmation_details: { date: '2026-05-24', time: '13:00', party_size: 9 }
    })

    const request = {
      json: async () => ({
        date: '2026-05-24',
        time: '13:00',
        partySize: 9,
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000'
        }
      })
    } as any

    const response = await createAgentBooking(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.booking.specialInstructions).toBeNull()
  })

  it('emits deposit messaging at party size 10 (boundary)', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-10',
      status: 'confirmed',
      confirmation_details: { date: '2026-05-24', time: '13:00', party_size: 10 }
    })

    const request = {
      json: async () => ({
        date: '2026-05-24',
        time: '13:00',
        partySize: 10,
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000'
        }
      })
    } as any

    const response = await createAgentBooking(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(typeof body.booking.specialInstructions).toBe('string')
    expect(body.booking.specialInstructions).toContain('10 or more')
    expect(body.booking.specialInstructions).toContain('£10 per person')
    // Crucially: no Sunday-lunch-specific copy
    expect(body.booking.specialInstructions).not.toMatch(/sunday lunch/i)
    expect(body.booking.specialInstructions).not.toMatch(/saturday/i)
    expect(body.booking.specialInstructions).not.toMatch(/cutoff/i)
  })

  it('emits deposit messaging at party size 11 (above threshold)', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-AGENT-11',
      status: 'confirmed',
      confirmation_details: { date: '2026-05-22', time: '19:00', party_size: 11 }
    })

    const request = {
      json: async () => ({
        date: '2026-05-22',
        time: '19:00',
        partySize: 11,
        purpose: 'food',
        customer: {
          firstName: 'Pat',
          lastName: 'Guest',
          phone: '07700900000'
        }
      })
    } as any

    const response = await createAgentBooking(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(typeof body.booking.specialInstructions).toBe('string')
    expect(body.booking.specialInstructions).toContain('£10 per person')
  })
})
