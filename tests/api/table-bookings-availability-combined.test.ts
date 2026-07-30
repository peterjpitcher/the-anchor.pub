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

// Build an authoritative read-out spanning a real service window. The picker
// answers separately for drinks and food and the two windows genuinely differ:
// in production the drinks answer runs to the bar close while the food answer
// stops one to three hours earlier, and on a kitchen-closed day the food answer
// is empty with reason `closed` while drinks is full of slots. A fixture that
// marked every half-hour available for both is not a shape the picker ever
// produces, and it hid exactly that difference.
function makeSlots(fromMinutes: number, toMinutes: number): Array<{ time: string; state: string }> {
  const slots: Array<{ time: string; state: string }> = []
  for (let minutes = fromMinutes; minutes <= toMinutes; minutes += 30) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
    const mm = String(minutes % 60).padStart(2, '0')
    slots.push({ time: `${hh}:${mm}`, state: 'available' })
  }
  return slots
}

function makeLoad(tableAvailability: unknown, overrides: Record<string, unknown> = {}): any {
  return {
    date: '2026-05-05',
    window_minutes: 60,
    busy_threshold_covers: 30,
    filling_threshold_covers: 20,
    bookings: [],
    table_availability: tableAvailability,
    ...overrides
  }
}

// Bar open 12:00 to 23:00, so drinks slots run to 22:30.
const DRINKS_COMPLETE = { calculation_state: 'complete', slots: makeSlots(12 * 60, 22 * 60 + 30) }
// Kitchen open 12:00 to 21:00, so food slots stop at 20:30.
const FOOD_COMPLETE = { calculation_state: 'complete', slots: makeSlots(12 * 60, 20 * 60 + 30) }

// Route the mock by the purpose the route asked about, which is the whole point
// of the two-call model. `null` stands for "that call came back with nothing".
function respondByPurpose(answers: { drinks?: unknown; food?: unknown }) {
  mockGetTableBookingLoadSafe.mockImplementation(
    (_date: string, query?: { purpose?: string }) => {
      const answer = query?.purpose === 'drinks' ? answers.drinks : answers.food
      return Promise.resolve(answer === undefined || answer === null ? null : makeLoad(answer))
    }
  )
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
    respondByPurpose({ drinks: DRINKS_COMPLETE, food: FOOD_COMPLETE })

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

  it('asks the picker about drinks and food, not just the guest intent', async () => {
    await fetchSlots('date=2026-05-05&party_size=2')

    const purposes = mockGetTableBookingLoadSafe.mock.calls.map((call) => call[1]?.purpose)
    expect(purposes).toEqual(expect.arrayContaining(['drinks', 'food']))
    expect(mockGetTableBookingLoadSafe).toHaveBeenCalledTimes(2)
  })

  it('asks only about drinks when the guest has ticked "Just drinks"', async () => {
    await fetchSlots('date=2026-05-05&party_size=2&purpose=drinks')

    expect(mockGetTableBookingLoadSafe).toHaveBeenCalledTimes(1)
    expect(mockGetTableBookingLoadSafe.mock.calls[0][1]?.purpose).toBe('drinks')
  })

  it('shows every time the bar can take, not only the times the kitchen can', async () => {
    // The food answer stops at 20:30, the drinks answer runs to 22:30. Asking
    // only about food would have hidden the last two hours of every evening.
    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const slots = body.data.time_slots as Array<{ time: string; available?: boolean }>

    expect(slots.find((s) => s.time === '21:00')?.available).toBe(true)
    expect(slots.find((s) => s.time === '22:00')?.available).toBe(true)
    expect(slots.find((s) => s.time === '13:00')?.available).toBe(true)
  })

  it('ignores legacy booking_type query param and still returns combined slots', async () => {
    const baseline = await fetchSlots('date=2026-05-05&party_size=2')
    const withBookingType = await fetchSlots(
      'date=2026-05-05&party_size=2&booking_type=sunday_lunch'
    )

    expect(withBookingType.data.time_slots).toEqual(baseline.data.time_slots)
  })

  it('sets bookable_purpose from the food answer: food while it serves, drinks after', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const slots = body.data.time_slots as Array<{
      time: string
      bookable_purpose?: string
      available?: boolean
    }>

    expect(slots.find((s) => s.time === '20:00')?.bookable_purpose).toBe('food_or_drinks')
    // Past the kitchen's last food slot the time is still bookable, for drinks.
    expect(slots.find((s) => s.time === '22:00')?.bookable_purpose).toBe('drinks_only')
    expect(slots.find((s) => s.time === '22:00')?.available).toBe(true)
  })

  it('marks a slot drinks-only when the kitchen is at capacity for it', async () => {
    // Inside kitchen hours, so the published window says food is on; only the
    // food answer knows the pacing ceiling has been hit. This is the case an
    // inferred flag could never get right.
    respondByPurpose({
      drinks: DRINKS_COMPLETE,
      food: {
        calculation_state: 'complete',
        slots: FOOD_COMPLETE.slots.map((slot) =>
          slot.time === '19:00'
            ? { ...slot, state: 'unavailable', public_reason: 'kitchen_full' }
            : slot
        )
      }
    })

    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const slots = body.data.time_slots as Array<{
      time: string
      available?: boolean
      bookable_purpose?: string
      kitchen_open?: boolean
    }>

    expect(slots.find((s) => s.time === '19:00')?.available).toBe(true)
    expect(slots.find((s) => s.time === '19:00')?.bookable_purpose).toBe('drinks_only')
    expect(slots.find((s) => s.time === '19:30')?.bookable_purpose).toBe('food_or_drinks')
    // The published kitchen window still says open at 19:00, which is precisely
    // why nothing downstream may infer food from it.
    expect(slots.find((s) => s.time === '19:00')?.kitchen_open).toBe(true)
  })

  it('fails closed to drinks when the food answer is unusable, keeping the slots', async () => {
    // Losing the food call must cost the food label, never the slots and never
    // a doomed booking: a food booking nothing affirmed would be refused with
    // slot_full once the pacing ceiling was reached, after the guest had filled
    // in every step.
    respondByPurpose({ drinks: DRINKS_COMPLETE, food: null })

    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const slots = body.data.time_slots as Array<{
      time: string
      available?: boolean
      bookable_purpose?: string
      kitchen_open?: boolean
    }>

    // Every drinks-affirmed time is still bookable.
    expect(slots.find((s) => s.time === '20:00')?.available).toBe(true)
    expect(slots.find((s) => s.time === '22:00')?.available).toBe(true)

    // But nothing claims food, including deep inside kitchen hours where the
    // published window says the kitchen is serving.
    expect(slots.find((s) => s.time === '13:00')?.bookable_purpose).toBe('drinks_only')
    expect(slots.find((s) => s.time === '20:00')?.bookable_purpose).toBe('drinks_only')
    expect(slots.find((s) => s.time === '20:00')?.kitchen_open).toBe(true)
    expect(
      slots.filter((s) => s.available).every((s) => s.bookable_purpose === 'drinks_only')
    ).toBe(true)
  })

  // The guest must be able to tell "we could not check food" apart from "the
  // kitchen is shut". Both produce drinks-only slots; only the first is missing
  // information, and only the first is worth telling them about.
  describe('food_check_unavailable', () => {
    it('is set when the food answer is unusable and the guest wants food', async () => {
      respondByPurpose({ drinks: DRINKS_COMPLETE, food: null })

      const body = await fetchSlots('date=2026-05-05&party_size=2')

      expect(body.data.food_check_unavailable).toBe(true)
    })

    it('is set when the food answer comes back unknown', async () => {
      respondByPurpose({ drinks: DRINKS_COMPLETE, food: { calculation_state: 'unknown' } })

      const body = await fetchSlots('date=2026-05-05&party_size=2')

      expect(body.data.food_check_unavailable).toBe(true)
    })

    it('is set when the food answer has a malformed slots field', async () => {
      respondByPurpose({
        drinks: DRINKS_COMPLETE,
        food: { calculation_state: 'complete', slots: 'not an array' }
      })

      const body = await fetchSlots('date=2026-05-05&party_size=2')

      expect(body.data.food_check_unavailable).toBe(true)
    })

    it('is NOT set on a kitchen-closed day, where drinks only is simply the truth', async () => {
      // The Monday shape. The picker was asked and it answered: complete, with
      // an empty slots array. Nothing failed, so there is nothing to explain.
      respondByPurpose({
        drinks: DRINKS_COMPLETE,
        food: { calculation_state: 'complete', slots: [], public_reason: 'closed' }
      })

      const body = await fetchSlots('date=2026-05-05&party_size=2')
      const slots = body.data.time_slots as Array<{
        available?: boolean
        bookable_purpose?: string
      }>

      expect(body.data.food_check_unavailable).toBeUndefined()
      // Still drinks-only, just without an apology attached.
      expect(
        slots.filter((s) => s.available).every((s) => s.bookable_purpose === 'drinks_only')
      ).toBe(true)
    })

    it('is NOT set for a drinks-only search', async () => {
      respondByPurpose({ drinks: DRINKS_COMPLETE })

      const body = await fetchSlots('date=2026-05-05&party_size=2&purpose=drinks')

      expect(body.data.food_check_unavailable).toBeUndefined()
    })

    it('always pairs with drinks-only slots, so the notice and the grid agree', async () => {
      respondByPurpose({ drinks: DRINKS_COMPLETE, food: null })

      const body = await fetchSlots('date=2026-05-05&party_size=2')
      const slots = body.data.time_slots as Array<{ bookable_purpose?: string }>

      expect(body.data.food_check_unavailable).toBe(true)
      expect(slots.every((s) => s.bookable_purpose === 'drinks_only')).toBe(true)
    })

    it('is NOT set when both calls answer normally', async () => {
      const body = await fetchSlots('date=2026-05-05&party_size=2')

      expect(body.data.food_check_unavailable).toBeUndefined()
    })
  })

  it('marks every slot drinks-only for a guest who asked for drinks only', async () => {
    // No food call is made for them and they are booking drinks, so nothing is
    // labelled or submitted as food. The published kitchen window still rides
    // along as information, which is all it has ever been entitled to be.
    respondByPurpose({ drinks: DRINKS_COMPLETE })

    const body = await fetchSlots('date=2026-05-05&party_size=2&purpose=drinks')
    const slots = body.data.time_slots as Array<{
      time: string
      bookable_purpose?: string
      kitchen_open?: boolean
    }>

    expect(slots.every((s) => s.bookable_purpose === 'drinks_only')).toBe(true)
    expect(slots.find((s) => s.time === '20:00')?.kitchen_open).toBe(true)
    expect(slots.find((s) => s.time === '22:00')?.kitchen_open).toBe(false)
  })

  it('stamps busyness labels when load data is available', async () => {
    mockGetTableBookingLoadSafe.mockImplementation((_date: string, query?: { purpose?: string }) =>
      Promise.resolve(
        makeLoad(query?.purpose === 'drinks' ? DRINKS_COMPLETE : FOOD_COMPLETE, {
          bookings: [{ time: '13:00', covers: 30 }]
        })
      )
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

  it('answers availability_unknown with zero slots when the drinks load times out or fails', async () => {
    // getTableBookingLoadSafe resolves null after its bounded retries, the
    // exact shape a timeout produces. The route must never substitute locally
    // calculated slots (the fail-open path review F04 killed).
    respondByPurpose({ drinks: null, food: FOOD_COMPLETE })

    const body = await fetchSlots('date=2026-05-05&party_size=2&time=13:00')

    expect(body.data.calculation_state).toBe('unknown')
    expect(body.data.time_slots).toEqual([])
    expect(body.data.available).toBe(false)
    expect(body.data.message).toContain('01753 682707')
    expect(body.meta.source).toBe('availability_unknown')
  })

  it('answers availability_unknown when the drinks load has no table read-out', async () => {
    mockGetTableBookingLoadSafe.mockImplementation((_date: string, query?: { purpose?: string }) => {
      if (query?.purpose === 'drinks') {
        const load = makeLoad(DRINKS_COMPLETE)
        delete load.table_availability
        return Promise.resolve(load)
      }
      return Promise.resolve(makeLoad(FOOD_COMPLETE))
    })

    const body = await fetchSlots('date=2026-05-05&party_size=2')

    expect(body.data.calculation_state).toBe('unknown')
    expect(body.data.time_slots).toEqual([])
  })

  it('passes through an explicit unknown from the management API', async () => {
    respondByPurpose({
      drinks: {
        calculation_state: 'unknown',
        message: 'We cannot check availability right now. Please give us a ring on 01753 682707.'
      },
      food: FOOD_COMPLETE
    })

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

  // The shape that made this a blocking defect, taken from live production:
  // on a Monday the pub opens 16:00 to 22:00 with the kitchen closed all day,
  // so check_table_availability_v06 answers `complete` with 0 slots and reason
  // `closed` for food, and `complete` with 23 available slots for drinks.
  describe('a day the kitchen is shut but the pub is open', () => {
    const MONDAY_HOURS = makeBusinessHours({
      monday: {
        opens: '16:00:00',
        closes: '22:00:00',
        kitchen: { is_closed: true }
      }
    })

    // 2026-05-04 is a Monday.
    const MONDAY = 'date=2026-05-04&party_size=2&time=19:00'

    beforeEach(() => {
      mockGetBusinessHours.mockResolvedValue(MONDAY_HOURS)
    })

    it('shows the drinks slots instead of claiming the pub is closed', async () => {
      respondByPurpose({
        drinks: { calculation_state: 'complete', slots: makeSlots(16 * 60, 21 * 60 + 30) },
        food: { calculation_state: 'complete', slots: [], public_reason: 'closed', message: 'We are closed then.' }
      })

      const body = await fetchSlots(MONDAY)
      const slots = body.data.time_slots as Array<{ time: string; available?: boolean; kitchen_open?: boolean }>

      expect(body.data.calculation_state).toBe('complete')
      expect(slots.some((slot) => slot.available === true)).toBe(true)
      expect(slots.find((s) => s.time === '19:00')?.available).toBe(true)
      expect(body.data.available).toBe(true)

      // Every one of them is drinks-only, and the false closed message from the
      // food answer is nowhere near the response.
      expect(slots.filter((s) => s.available).every((s) => s.kitchen_open === false)).toBe(true)
      expect(body.data.public_reason).toBeUndefined()
      expect(String(body.data.message ?? '')).not.toContain('closed then')
    })

    it('still shows the closed state when the pub really is shut', async () => {
      respondByPurpose({
        drinks: {
          calculation_state: 'complete',
          slots: [],
          public_reason: 'closed',
          message: 'We are closed on that date.'
        },
        food: { calculation_state: 'complete', slots: [], public_reason: 'closed' }
      })

      const body = await fetchSlots(MONDAY)

      expect(body.data.calculation_state).toBe('complete')
      expect(body.data.time_slots).toEqual([])
      expect(body.data.available).toBe(false)
      expect(body.data.public_reason).toBe('closed')
      expect(body.data.message).toBe('We are closed on that date.')
    })
  })
})
