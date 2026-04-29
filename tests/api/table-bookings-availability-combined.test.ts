export {}

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
}))

// ---------------------------------------------------------------------------
// Local fixture helper — mirrors the `makeBusinessHours` factory used in
// `tests/api/table-bookings-service-window.test.ts`. Ported inline so this
// test file is self-contained.
// ---------------------------------------------------------------------------

type RegularDayInput = {
  opens?: string
  closes?: string
  is_closed?: boolean
  kitchen?: { opens?: string; closes?: string; is_closed?: boolean } | null
  schedule_config?: Array<{ starts_at: string; ends_at: string; capacity?: number; booking_type: string }>
}

type SpecialDayInput = {
  date: string
  opens?: string | null
  closes?: string | null
  is_closed?: boolean
  status?: 'closed' | 'modified'
  kitchen?: { opens?: string; closes?: string; is_closed?: boolean } | null
  is_kitchen_closed?: boolean
  schedule_config?: Array<{ starts_at: string; ends_at: string; capacity?: number; booking_type: string }>
}

function makeBusinessHours(
  regularDays: Partial<Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', RegularDayInput>>,
  specialDays: SpecialDayInput[] = []
): any {
  const regularHours: Record<string, any> = {}
  for (const [day, config] of Object.entries(regularDays)) {
    if (!config) continue
    regularHours[day] = {
      opens: config.opens ?? '12:00',
      closes: config.closes ?? '23:00',
      is_closed: config.is_closed ?? false,
      kitchen: config.kitchen === undefined ? null : config.kitchen,
      schedule_config: config.schedule_config ?? []
    }
  }
  return {
    regularHours,
    specialHours: specialDays.map((entry) => ({
      ...entry,
      is_closed: entry.is_closed ?? false
    }))
  }
}

describe('GET /api/table-bookings/availability — combined contract', () => {
  let getAvailability: (request: Request) => Promise<Response>

  beforeEach(async () => {
    // 2026-05-05 is a Tuesday. Open 12:00–23:00 with kitchen 12:00–21:00.
    mockGetBusinessHours.mockResolvedValue(
      makeBusinessHours({
        tuesday: {
          opens: '12:00:00',
          closes: '23:00:00',
          kitchen: { opens: '12:00:00', closes: '21:00:00' }
        }
      })
    )

    jest.resetModules()
    ;({ GET: getAvailability } = await import('@/app/api/table-bookings/availability/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  async function fetchSlots(query: string) {
    const url = `https://www.the-anchor.pub/api/table-bookings/availability?${query}`
    const response = await getAvailability(new Request(url))
    expect(response.status).toBe(200)
    return response.json()
  }

  it('returns combined slots whether or not purpose is supplied', async () => {
    const omitted = await fetchSlots('date=2026-05-05&party_size=2')
    const food = await fetchSlots('date=2026-05-05&party_size=2&purpose=food')
    const drinks = await fetchSlots('date=2026-05-05&party_size=2&purpose=drinks')

    expect(omitted.data.time_slots).toEqual(food.data.time_slots)
    expect(omitted.data.time_slots).toEqual(drinks.data.time_slots)
  })

  it('ignores legacy booking_type query param and still returns combined slots', async () => {
    const baseline = await fetchSlots('date=2026-05-05&party_size=2')
    const withBookingType = await fetchSlots(
      'date=2026-05-05&party_size=2&booking_type=sunday_lunch'
    )

    expect(withBookingType.data.time_slots).toEqual(baseline.data.time_slots)
  })

  it('stamps kitchen_open: true on slots before kitchen close and false after', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const slots = body.data.time_slots as Array<{ time: string; kitchen_open?: boolean }>

    const earlyEvening = slots.find((s) => s.time === '20:00')
    const lateEvening = slots.find((s) => s.time === '22:00')

    expect(earlyEvening?.kitchen_open).toBe(true)
    expect(lateEvening?.kitchen_open).toBe(false)
  })

  it('does not include meta.purpose in the response', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')

    expect(body.meta?.purpose).toBeUndefined()
    expect(body.meta).toMatchObject({
      source: 'schedule_fallback',
      service_model: 'combined_food_drinks'
    })
  })

  it('uses neutral copy for messages and special_notes', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const message: string = body.data.message ?? ''
    const notes: string = body.data.special_notes ?? ''

    expect(message.toLowerCase()).not.toContain('food')
    expect(message.toLowerCase()).not.toContain('drinks-only')
    expect(notes.toLowerCase()).not.toContain('food bookings')
    expect(notes.toLowerCase()).not.toContain('switch to drinks')
  })
})
