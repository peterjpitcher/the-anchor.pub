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

describe('Table Availability API - Purpose-Aware Slots', () => {
  let getAvailability: (request: any) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)

    jest.resetModules()
    ;({ GET: getAvailability } = await import('@/app/api/table-bookings/availability/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns food slots only within kitchen hours', async () => {
    const response = await getAvailability({
      url: 'http://localhost:3000/api/table-bookings/availability?date=2026-03-01&time=21:30&party_size=2&purpose=food'
    } as any)

    expect(response.status).toBe(200)
    const body = await response.json()
    const slotTimes = (body.data.time_slots || []).map((slot: any) => slot.time)

    expect(slotTimes).toContain('20:30')
    expect(slotTimes).not.toContain('21:30')
  })

  it('returns drinks slots across bar hours', async () => {
    const response = await getAvailability({
      url: 'http://localhost:3000/api/table-bookings/availability?date=2026-03-01&time=21:30&party_size=2&purpose=drinks'
    } as any)

    expect(response.status).toBe(200)
    const body = await response.json()
    const slotTimes = (body.data.time_slots || []).map((slot: any) => slot.time)

    expect(slotTimes).toContain('21:30')
  })

  it('defaults to food slots when purpose is omitted', async () => {
    const response = await getAvailability({
      url: 'http://localhost:3000/api/table-bookings/availability?date=2026-03-01&time=21:30&party_size=2'
    } as any)

    expect(response.status).toBe(200)
    const body = await response.json()
    const slotTimes = (body.data.time_slots || []).map((slot: any) => slot.time)

    expect(slotTimes).not.toContain('21:30')
  })
})
