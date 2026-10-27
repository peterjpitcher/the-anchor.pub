export {}

/**
 * BK-101 (customer bookings review of 24 October 2026): "no tables" and "could not check" both
 * reach the guest as a normal availability answer, so nothing could tell them apart from fewer
 * visitors. Each answer now writes one line with its outcome and no personal data.
 */

const mockGetBusinessHours = jest.fn()
const mockGetTableBookingLoadSafe = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    getTableBookingLoadSafe: (...args: unknown[]) => mockGetTableBookingLoadSafe(...args)
  }
}))

const DAY = { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' }, schedule_config: [] }
const HOURS = {
  regularHours: { monday: DAY, tuesday: DAY, wednesday: DAY, thursday: DAY, friday: DAY, saturday: DAY, sunday: DAY },
  specialHours: []
}

function load(tableAvailability: unknown) {
  return { date: '2026-11-07', window_minutes: 60, busy_threshold_covers: 30, filling_threshold_covers: 20, bookings: [], table_availability: tableAvailability }
}

let warn: jest.SpyInstance

function answerLines(): Array<Record<string, unknown>> {
  return warn.mock.calls
    .map((call) => String(call[0]))
    .filter((line) => line.startsWith('[availability-answer] '))
    .map((line) => JSON.parse(line.slice('[availability-answer] '.length)))
}

async function ask(query: string): Promise<Response> {
  const { GET } = await import('@/app/api/table-bookings/availability/route')
  return GET(new Request(`http://localhost/api/table-bookings/availability?${query}`))
}

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] })
  jest.setSystemTime(new Date('2026-10-26T12:00:00.000Z'))
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  mockGetBusinessHours.mockResolvedValue(HOURS)
})

afterEach(() => {
  warn.mockRestore()
  jest.useRealTimers()
  jest.clearAllMocks()
})

describe('availability answers are logged, one line each', () => {
  it('counts the times offered, with the party size and how far ahead', async () => {
    const slots = [
      { time: '18:00', state: 'available' },
      { time: '18:30', state: 'available' },
      { time: '19:00', state: 'unavailable', public_reason: 'slot_full' }
    ]
    mockGetTableBookingLoadSafe.mockResolvedValue(load({ calculation_state: 'complete', slots }))

    const response = await ask('date=2026-11-07&party_size=4&time=19:00')

    expect(response.status).toBe(200)
    expect(answerLines()).toEqual([{ state: 'complete', slots: 2, party: 4, daysAhead: 12, drinksOnly: false }])
  })

  it('says why when no times were offered', async () => {
    mockGetTableBookingLoadSafe.mockResolvedValue(load({ calculation_state: 'complete', slots: [], public_reason: 'closed' }))

    await ask('date=2026-10-27&party_size=2&purpose=drinks')

    expect(answerLines()).toEqual([{ state: 'complete', slots: 0, party: 2, daysAhead: 1, drinksOnly: true, reason: 'closed' }])
  })

  it('records a check that could not be made', async () => {
    mockGetTableBookingLoadSafe.mockResolvedValue(null)

    const response = await ask('date=2026-11-07&party_size=6')
    const body = await response.json()

    expect(body.data.calculation_state).toBe('unknown')
    expect(answerLines()).toEqual([{ state: 'unknown', slots: 0, party: 6, daysAhead: 12, drinksOnly: false, reason: 'no_answer' }])
  })
})
