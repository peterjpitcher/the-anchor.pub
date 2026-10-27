import {
  BOOKING_FUNNEL_TIMEOUT_MS,
  recordBookingFormSignal,
  recordTurnedAway
} from '@/lib/booking-funnel-report'

/**
 * BK-101 and BK-191 (customer bookings review of 24 October 2026): every refusal, failure and
 * booking form signal is sent to the management app to be counted. Codes only, from the live
 * site only, and never a reason for a guest to wait long or see a different answer.
 */

const URL_RECORD = 'https://management.orangejelly.co.uk/api/website/booking-funnel'
const ORIGINAL_ENV = process.env
const ORIGINAL_FETCH = global.fetch
const mockFetch = jest.fn()

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, VERCEL_ENV: 'production', ANCHOR_API_KEY: 'anch_test_key' }
  delete process.env.ANCHOR_API_BASE_URL
  mockFetch.mockReset()
  mockFetch.mockResolvedValue({ ok: true, status: 202 } as Response)
  global.fetch = mockFetch as unknown as typeof fetch
})

afterEach(() => {
  process.env = ORIGINAL_ENV
  global.fetch = ORIGINAL_FETCH
  jest.useRealTimers()
})

describe('recordTurnedAway', () => {
  it('sends one POST with the API key and the codes, and nothing else', async () => {
    await expect(
      recordTurnedAway({ route: 'api/table-bookings', kind: 'refused', status: 400, reason: 'OUTSIDE_HOURS', page: '/book-table' })
    ).resolves.toEqual({ recorded: true, reason: 'recorded' })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(URL_RECORD)
    expect(init.method).toBe('POST')
    expect(init.cache).toBe('no-store')
    expect(init.headers).toEqual({ Authorization: 'Bearer anch_test_key', 'Content-Type': 'application/json' })
    expect(JSON.parse(String(init.body))).toEqual({
      type: 'refusal',
      route: 'api/table-bookings',
      kind: 'refused',
      status: 400,
      reason: 'OUTSIDE_HOURS',
      upstream_code: null,
      page: '/book-table'
    })
  })

  it('is not sent from a preview, a test run or a laptop', async () => {
    for (const env of [undefined, 'preview', 'development']) {
      if (env === undefined) delete process.env.VERCEL_ENV
      else process.env.VERCEL_ENV = env
      await expect(recordTurnedAway({ route: 'api/table-bookings', kind: 'failed', status: 500, reason: 'X' })).resolves.toEqual({
        recorded: false,
        reason: 'not_production'
      })
    }
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('says so, without a request, when the API key is missing', async () => {
    delete process.env.ANCHOR_API_KEY
    await expect(recordTurnedAway({ route: 'api/table-bookings', kind: 'failed', status: 500, reason: 'X' })).resolves.toEqual({
      recorded: false,
      reason: 'api_key_missing'
    })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('reports a refused or broken answer as a short reason, never throwing', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 } as Response)
    await expect(recordTurnedAway({ route: 'api/x', kind: 'refused', status: 400, reason: 'X' })).resolves.toEqual({
      recorded: false,
      reason: 'http_503'
    })
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'))
    await expect(recordTurnedAway({ route: 'api/x', kind: 'refused', status: 400, reason: 'X' })).resolves.toEqual({
      recorded: false,
      reason: 'request_failed'
    })
  })

  it('gives up after a short wait, so a guest is not held up', async () => {
    jest.useFakeTimers()
    mockFetch.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
        })
    )

    const pending = recordTurnedAway({ route: 'api/x', kind: 'refused', status: 400, reason: 'X' })
    await jest.advanceTimersByTimeAsync(BOOKING_FUNNEL_TIMEOUT_MS)

    await expect(pending).resolves.toEqual({ recorded: false, reason: 'timed_out' })
  })
})

describe('recordBookingFormSignal', () => {
  it('sends the form, the step and, for a blocked form only, why', async () => {
    await recordBookingFormSignal({ form: 'event_booking', step: 'blocked', reason: 'no_security_token', page: '/events/a' })
    await recordBookingFormSignal({ form: 'event_booking', step: 'opened', reason: 'network', page: '/events/a' })

    expect(mockFetch.mock.calls.map(([, init]) => JSON.parse(String((init as RequestInit).body)))).toEqual([
      { type: 'form', form: 'event_booking', step: 'blocked', reason: 'no_security_token', page: '/events/a' },
      { type: 'form', form: 'event_booking', step: 'opened', reason: null, page: '/events/a' }
    ])
  })
})
