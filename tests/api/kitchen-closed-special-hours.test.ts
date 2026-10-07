export {}

/**
 * The special-hours record alone decides whether the kitchen is open on its date.
 *
 * Two failures, one rule.
 *
 * 1. Food times on a kitchen-closed day. Over Christmas 2026 eight dates carry
 *    `kitchen: null` and `is_kitchen_closed: true` but still list `regular`
 *    service entries, because a `regular` service gates drinks as well as food.
 *    The resolver read those entries before it looked at the kitchen flag and
 *    returned food times for all eight.
 *
 * 2. The obvious fix would have broken something else. The resolver's flag also
 *    took in the REGULAR day's, and the regular Monday is flagged closed. Simply
 *    returning no food when that flag was set would have refused food on any
 *    Monday the pub had specially opened the kitchen for.
 *
 * So the special record replaces the regular day, and is read before the
 * services. The fixture below is the shape the management API sends.
 */

const LUNCH_AND_DINNER = [
  { name: 'Lunch', starts_at: '12:00:00', ends_at: '15:00:00', capacity: 50, booking_type: 'regular' },
  { name: 'Dinner', starts_at: '16:00:00', ends_at: '21:00:00', capacity: 50, booking_type: 'regular' },
]

const openDay = {
  opens: '12:00:00',
  closes: '22:00:00',
  is_closed: false,
  is_kitchen_closed: false,
  kitchen: { opens: '12:00:00', closes: '21:00:00' },
  schedule_config: LUNCH_AND_DINNER,
}

const REGULAR_HOURS = {
  // The kitchen never opens on an ordinary Monday.
  monday: {
    opens: '16:00:00',
    closes: '22:00:00',
    is_closed: false,
    is_kitchen_closed: true,
    kitchen: null,
    schedule_config: [],
  },
  tuesday: openDay,
  wednesday: openDay,
  thursday: openDay,
  friday: openDay,
  saturday: openDay,
  sunday: openDay,
}

function kitchenClosedDay(date: string, services = LUNCH_AND_DINNER) {
  return {
    date,
    opens: '12:00:00',
    closes: '22:00:00',
    status: 'modified',
    is_closed: false,
    is_kitchen_closed: true,
    kitchen: null,
    // Left in place by the management app: they still gate drinks.
    schedule_config: services,
  }
}

// The eight dates from the live payload of 7 October 2026.
const KITCHEN_CLOSED_DATES = [
  '2026-12-22',
  '2026-12-23',
  '2026-12-24',
  '2026-12-29',
  '2026-12-30',
  '2026-12-31',
  '2027-01-02',
  '2027-01-05',
]

const SPECIALLY_OPENED_MONDAY = '2026-12-28'

function hoursWith(specialHours: unknown[]): any {
  return { regularHours: REGULAR_HOURS, specialHours }
}

const CHRISTMAS_HOURS = hoursWith([
  ...KITCHEN_CLOSED_DATES.map((date) =>
    date === '2027-01-02'
      ? kitchenClosedDay(date, [
          { name: 'Service', starts_at: '12:00:00', ends_at: '19:00:00', capacity: 50, booking_type: 'regular' },
        ])
      : kitchenClosedDay(date)
  ),
  {
    date: SPECIALLY_OPENED_MONDAY,
    opens: '12:00:00',
    closes: '22:00:00',
    status: 'modified',
    is_closed: false,
    is_kitchen_closed: false,
    kitchen: { opens: '12:00:00', closes: '18:00:00' },
    schedule_config: [
      { name: 'Service', starts_at: '12:00:00', ends_at: '18:00:00', capacity: 50, booking_type: 'regular' },
    ],
  },
])

describe('resolveServiceRanges: no food on a date whose special record closes the kitchen', () => {
  it.each(KITCHEN_CLOSED_DATES)('%s returns no food times', async (date) => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')

    const food = resolveServiceRanges(CHRISTMAS_HOURS, date, { bookingType: 'regular', purpose: 'food' })

    expect(food.ranges).toEqual([])
    expect(food.closed).toBe(false)
    expect(food.message).toMatch(/Food is unavailable for that date/)
  })

  it.each(KITCHEN_CLOSED_DATES)('%s still seats drinks for the whole of opening hours', async (date) => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')

    const drinks = resolveServiceRanges(CHRISTMAS_HOURS, date, { bookingType: 'regular', purpose: 'drinks' })

    expect(drinks.closed).toBe(false)
    expect(drinks.ranges).toEqual([{ startsAt: '12:00', endsAt: '22:00', capacity: 50 }])
  })

  it.each(KITCHEN_CLOSED_DATES)('%s: the combined answer has an empty kitchen overlay', async (date) => {
    const { resolveCombinedServiceRanges, buildSlotsWithKitchenState } = await import(
      '@/lib/table-booking-service-windows'
    )

    const combined = resolveCombinedServiceRanges(CHRISTMAS_HOURS, date)

    expect(combined.closed).toBe(false)
    expect(combined.kitchenRanges).toEqual([])
    expect(combined.ranges.length).toBeGreaterThan(0)
    // Which is what makes `kitchen_open` false on every slot of the availability answer.
    const slots = buildSlotsWithKitchenState(combined.ranges, combined.kitchenRanges, 2)
    expect(slots.length).toBeGreaterThan(0)
    expect(slots.every((slot) => slot.kitchen_open === false)).toBe(true)
  })

  it('no Sunday roast either, on a Sunday whose special record closes the kitchen', async () => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')
    const hours = hoursWith([
      kitchenClosedDay('2026-12-27', [
        { name: 'Roast', starts_at: '13:00:00', ends_at: '18:00:00', capacity: 50, booking_type: 'sunday_lunch' },
        ...LUNCH_AND_DINNER,
      ]),
    ])

    const roast = resolveServiceRanges(hours, '2026-12-27', { bookingType: 'sunday_lunch', purpose: 'food' })
    const food = resolveServiceRanges(hours, '2026-12-27', { bookingType: 'regular', purpose: 'food' })

    expect(roast.ranges).toEqual([])
    expect(food.ranges).toEqual([])
  })

  it('reads either signal on its own: the flag without the null, and the null without the flag', async () => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')
    const flagOnly = hoursWith([
      { ...kitchenClosedDay('2026-12-22'), kitchen: { opens: '12:00:00', closes: '21:00:00' } },
    ])
    const { is_kitchen_closed: _dropped, ...nullOnlyDay } = kitchenClosedDay('2026-12-22')
    const nullOnly = hoursWith([nullOnlyDay])

    for (const hours of [flagOnly, nullOnly]) {
      expect(
        resolveServiceRanges(hours, '2026-12-22', { bookingType: 'regular', purpose: 'food' }).ranges
      ).toEqual([])
    }
  })

  it('leaves an ordinary day alone', async () => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')

    // A Tuesday with no special record: the regular sittings.
    const food = resolveServiceRanges(CHRISTMAS_HOURS, '2026-12-15', { bookingType: 'regular', purpose: 'food' })

    expect(food.ranges.map((range) => `${range.startsAt}-${range.endsAt}`)).toEqual(['12:00-15:00', '16:00-21:00'])
  })

  it('an ordinary Monday still has no food', async () => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')

    const food = resolveServiceRanges(CHRISTMAS_HOURS, '2026-12-14', { bookingType: 'regular', purpose: 'food' })

    expect(food.ranges).toEqual([])
  })
})

describe('resolveServiceRanges: a Monday opened by a special record still resolves', () => {
  it('returns the special record sittings, although the regular Monday is flagged kitchen-closed', async () => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')

    // The regular day really is closed: this is the flag that must not leak in.
    expect(REGULAR_HOURS.monday.is_kitchen_closed).toBe(true)

    const food = resolveServiceRanges(CHRISTMAS_HOURS, SPECIALLY_OPENED_MONDAY, {
      bookingType: 'regular',
      purpose: 'food',
    })

    expect(food.closed).toBe(false)
    expect(food.ranges).toEqual([{ startsAt: '12:00', endsAt: '18:00', capacity: 50 }])
  })

  it('resolves from the kitchen window when the special record lists no sittings', async () => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')
    const hours = hoursWith([
      {
        date: SPECIALLY_OPENED_MONDAY,
        opens: '12:00:00',
        closes: '22:00:00',
        is_closed: false,
        is_kitchen_closed: false,
        kitchen: { opens: '12:00:00', closes: '18:00:00' },
        schedule_config: [],
      },
    ])

    const food = resolveServiceRanges(hours, SPECIALLY_OPENED_MONDAY, { bookingType: 'regular', purpose: 'food' })

    expect(food.ranges).toEqual([{ startsAt: '12:00', endsAt: '18:00', capacity: 50 }])
  })

  it('resolves when the special record carries kitchen times and no flag at all', async () => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')
    const hours = hoursWith([
      {
        date: SPECIALLY_OPENED_MONDAY,
        opens: '12:00:00',
        closes: '22:00:00',
        kitchen: { opens: '12:00:00', closes: '18:00:00' },
        schedule_config: [
          { starts_at: '12:00:00', ends_at: '18:00:00', capacity: 50, booking_type: 'regular' },
        ],
      },
    ])

    const food = resolveServiceRanges(hours, SPECIALLY_OPENED_MONDAY, { bookingType: 'regular', purpose: 'food' })

    expect(food.ranges).toEqual([{ startsAt: '12:00', endsAt: '18:00', capacity: 50 }])
  })

  it('the combined answer marks its food slots kitchen-open', async () => {
    const { resolveCombinedServiceRanges, buildSlotsWithKitchenState } = await import(
      '@/lib/table-booking-service-windows'
    )

    const combined = resolveCombinedServiceRanges(CHRISTMAS_HOURS, SPECIALLY_OPENED_MONDAY)
    const slots = buildSlotsWithKitchenState(combined.ranges, combined.kitchenRanges, 2)

    expect(slots.find((slot) => slot.time === '13:00')?.kitchen_open).toBe(true)
    expect(slots.find((slot) => slot.time === '20:00')?.kitchen_open).toBe(false)
  })

  it('a special Monday that closes the kitchen itself is still closed', async () => {
    const { resolveServiceRanges } = await import('@/lib/table-booking-service-windows')
    const hours = hoursWith([kitchenClosedDay(SPECIALLY_OPENED_MONDAY)])

    const food = resolveServiceRanges(hours, SPECIALLY_OPENED_MONDAY, { bookingType: 'regular', purpose: 'food' })

    expect(food.ranges).toEqual([])
  })
})

// The check the website makes before a booking is sent on uses the same
// function, so it must agree: refuse food on the closed dates without troubling
// the management app, and let a specially opened Monday through to it.
describe('POST /api/table-bookings: the pre-send check follows the special record', () => {
  const mockGetBusinessHours = jest.fn()
  let createTableBooking: (request: any) => Promise<Response>

  const bookingRequest = (body: Record<string, unknown>) =>
    ({ json: async () => body, headers: new Headers() }) as any

  beforeEach(async () => {
    // Only the clock is frozen, so the dates above are always in the future and
    // inside the booking horizon whenever this runs.
    jest.useFakeTimers({
      now: new Date('2026-10-07T12:00:00Z'),
      doNotFake: [
        'setTimeout',
        'setInterval',
        'setImmediate',
        'clearTimeout',
        'clearInterval',
        'clearImmediate',
        'nextTick',
        'queueMicrotask',
        'performance',
      ],
    })
    process.env.ANCHOR_API_KEY = 'test-api-key'
    mockGetBusinessHours.mockResolvedValue(CHRISTMAS_HOURS)
    ;(global as any).fetch = jest.fn()

    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
        })
    }

    jest.resetModules()
    jest.doMock('@/lib/api', () => ({
      anchorAPI: { getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args) },
    }))
    jest.doMock('@/lib/spam-protection', () => ({
      checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false }),
    }))
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it.each(KITCHEN_CLOSED_DATES)('refuses a food booking on %s and never calls the management app', async (date) => {
    const response = await createTableBooking(
      bookingRequest({ phone: '07700900000', date, time: '13:00', party_size: 2, purpose: 'food' })
    )

    expect(response.status).toBe(400)
    expect(String((await response.json()).error)).toMatch(/Food is unavailable for that date/)
    expect(global.fetch as jest.Mock).not.toHaveBeenCalled()
  })

  it('sends a food booking on a specially opened Monday on to the management app', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'TB-MON' } }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const response = await createTableBooking(
      bookingRequest({
        phone: '07700900000',
        date: SPECIALLY_OPENED_MONDAY,
        time: '13:00',
        party_size: 2,
        purpose: 'food',
      })
    )

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [, upstreamOptions] = (global.fetch as jest.Mock).mock.calls[0]
    expect(JSON.parse(String((upstreamOptions as RequestInit).body)).purpose).toBe('food')
  })
})
