export {}

const mockGetBusinessHours = jest.fn()
const mockGetTableBookingLoadSafe = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    getTableBookingLoadSafe: (...args: unknown[]) => mockGetTableBookingLoadSafe(...args)
  }
}))

// ---------------------------------------------------------------------------
// Local fixture helper: mirrors the `makeBusinessHours` factory used in
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

// Authoritative load fixture: the management API answered and its table
// read-out marks every half-hour slot available, so the overlay confirms the
// whole local grid. Individual tests override pieces via `overrides`.
function makeAuthorisedLoad(overrides: Record<string, unknown> = {}): any {
  const slots: Array<{ time: string; state: string }> = []
  for (let minutes = 12 * 60; minutes <= 22 * 60 + 30; minutes += 30) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
    const mm = String(minutes % 60).padStart(2, '0')
    slots.push({ time: `${hh}:${mm}`, state: 'available' })
  }
  return {
    date: '2026-05-05',
    window_minutes: 60,
    busy_threshold_covers: 30,
    filling_threshold_covers: 20,
    bookings: [],
    table_availability: {
      calculation_state: 'complete',
      slots
    },
    ...overrides
  }
}

describe('GET /api/table-bookings/availability: combined contract', () => {
  let getAvailability: (request: Request) => Promise<Response>

  beforeEach(async () => {
    // 2026-05-05 is a Tuesday. Open 12:00-23:00 with kitchen 12:00-21:00.
    mockGetBusinessHours.mockResolvedValue(
      makeBusinessHours({
        tuesday: {
          opens: '12:00:00',
          closes: '23:00:00',
          kitchen: { opens: '12:00:00', closes: '21:00:00' }
        }
      })
    )
    mockGetTableBookingLoadSafe.mockResolvedValue(makeAuthorisedLoad())

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

  it('stamps busyness labels when load data is available', async () => {
    mockGetTableBookingLoadSafe.mockResolvedValue(
      makeAuthorisedLoad({ bookings: [{ time: '13:00', covers: 30 }] })
    )

    const body = await fetchSlots('date=2026-05-05&party_size=2&time=13:00')
    const slots = body.data.time_slots as Array<{ time: string; busyness?: string }>

    expect(slots.find((s) => s.time === '13:00')?.busyness).toBe('busy')
    expect(slots.find((s) => s.time === '14:00')?.busyness).toBe('quiet')
  })

  it('a normal load still returns bookable slots (unchanged behaviour)', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const slots = body.data.time_slots as Array<{ available?: boolean }>

    expect(slots.length).toBeGreaterThan(0)
    expect(slots.some((slot) => slot.available === true)).toBe(true)
    expect(body.data.calculation_state).toBe('complete')
  })

  it('answers availability_unknown with zero slots when the load times out or fails', async () => {
    // getTableBookingLoadSafe resolves null after its bounded retries, the
    // exact shape a timeout produces. The route must never substitute locally
    // calculated slots (the fail-open path review F04 killed).
    mockGetTableBookingLoadSafe.mockResolvedValue(null)

    const body = await fetchSlots('date=2026-05-05&party_size=2&time=13:00')

    expect(body.data.calculation_state).toBe('unknown')
    expect(body.data.time_slots).toEqual([])
    expect(body.data.available).toBe(false)
    expect(body.data.message).toContain('01753 682707')
    expect(body.meta.source).toBe('availability_unknown')
  })

  it('answers availability_unknown when the load answers without a table read-out', async () => {
    const load = makeAuthorisedLoad()
    delete load.table_availability
    mockGetTableBookingLoadSafe.mockResolvedValue(load)

    const body = await fetchSlots('date=2026-05-05&party_size=2')

    expect(body.data.calculation_state).toBe('unknown')
    expect(body.data.time_slots).toEqual([])
  })

  it('passes through an explicit unknown from the management API', async () => {
    mockGetTableBookingLoadSafe.mockResolvedValue(
      makeAuthorisedLoad({
        table_availability: {
          calculation_state: 'unknown',
          message: 'We cannot check availability right now. Please give us a ring on 01753 682707.'
        }
      })
    )

    const body = await fetchSlots('date=2026-05-05&party_size=2')

    expect(body.data.calculation_state).toBe('unknown')
    expect(body.data.time_slots).toEqual([])
    expect(body.data.message).toContain('01753 682707')
    expect(body.meta.source).toBe('management_api')
  })

  it('does not include meta.purpose in the response', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')

    expect(body.meta?.purpose).toBeUndefined()
    expect(body.meta).toMatchObject({
      source: 'management_api',
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
