export {}

/**
 * BK-108 (customer bookings review of 24 October 2026): the table availability read spends the
 * management app's key and had no limit of its own, so one visitor could use up the hour for every
 * guest. It now allows 20 a minute per address, like the booking periods read, and a refusal
 * carries the pub's number.
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

async function ask(address: string): Promise<Response> {
  const { GET } = await import('@/app/api/table-bookings/availability/route')
  return GET(new Request('http://localhost/api/table-bookings/availability?date=2026-11-07&party_size=2&time=18:00', {
    headers: { 'cf-connecting-ip': address }
  }))
}

beforeEach(async () => {
  const { resetRateLimitsForTests } = await import('@/lib/rate-limit')
  resetRateLimitsForTests()
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] })
  jest.setSystemTime(new Date('2026-10-26T12:00:00.000Z'))
  jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  mockGetBusinessHours.mockResolvedValue(HOURS)
  mockGetTableBookingLoadSafe.mockResolvedValue({ date: '2026-11-07', window_minutes: 60, busy_threshold_covers: 30, filling_threshold_covers: 20, bookings: [], table_availability: null })
})

afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
  jest.clearAllMocks()
})

describe('table availability flood limit', () => {
  it('answers 20 requests a minute from one address, then refuses with the pub number', async () => {
    for (let i = 0; i < 20; i += 1) {
      const response = await ask('203.0.113.70')
      expect(response.status).not.toBe(429)
    }

    const refused = await ask('203.0.113.70')
    expect(refused.status).toBe(429)
    expect(Number(refused.headers.get('Retry-After'))).toBeGreaterThan(0)
    const body = await refused.json()
    expect(body.code).toBe('RATE_LIMITED')
    expect(body.error).toContain('01753 682707')
  })

  it('does not call the management app once an address is refused', async () => {
    for (let i = 0; i < 20; i += 1) await ask('203.0.113.71')
    const callsBefore = mockGetBusinessHours.mock.calls.length + mockGetTableBookingLoadSafe.mock.calls.length

    await ask('203.0.113.71')

    expect(mockGetBusinessHours.mock.calls.length + mockGetTableBookingLoadSafe.mock.calls.length).toBe(callsBefore)
  })

  it('leaves other visitors alone', async () => {
    for (let i = 0; i < 21; i += 1) await ask('203.0.113.72')

    expect((await ask('203.0.113.73')).status).not.toBe(429)
  })
})
