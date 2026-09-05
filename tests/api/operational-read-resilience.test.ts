import { GET as getRates } from '@/app/api/parking/rates/route'
import { GET as getEvents } from '@/app/api/events/route'
import { anchorAPI } from '@/lib/api/client'

jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: jest.fn() }
})

if (typeof Response.json !== 'function') {
  Response.json = (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), {
    ...init, headers: { 'Content-Type': 'application/json', ...init?.headers }
  })
}

const rates = {
  id: 'test-rate-card', effective_from: '2026-09-01', created_at: '2026-09-01',
  hourly_rate: 6, daily_rate: 18, weekly_rate: 90, monthly_rate: 300
}
const originalFetch = global.fetch
const mockFetch = jest.fn()

beforeEach(() => {
  global.fetch = mockFetch
  mockFetch.mockReset()
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  global.fetch = originalFetch
  jest.restoreAllMocks()
})

function upstream(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('parking rates through the real API client and proxy', () => {
  it('returns the management rate card without replacing its prices', async () => {
    mockFetch.mockResolvedValue(upstream({ success: true, data: rates }))
    const response = await getRates()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true, data: rates })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/parking/rates'), expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it.each([401, 403, 429, 500])('returns unavailable on upstream HTTP %s, never fallback prices', async status => {
    mockFetch.mockResolvedValue(upstream({ success: false, error: { message: 'Upstream unavailable' } }, status))
    const response = await getRates()
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ success: false, error: { message: expect.any(String) } })
  })

  it('returns unavailable on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('fetch failed'))
    const response = await getRates()
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ success: false })
  })

  it.each([
    {}, { ...rates, daily_rate: null }, { ...rates, monthly_rate: '300' },
    { ...rates, hourly_rate: -1 }, { ...rates, weekly_rate: undefined }
  ])('rejects incomplete or invalid pricing: %j', async data => {
    mockFetch.mockResolvedValue(upstream({ success: true, data }))
    const response = await getRates()
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ success: false, error: { code: 'INVALID_RESPONSE' } })
  })

  it('bounds an unresponsive upstream without returning prices', async () => {
    jest.useFakeTimers()
    mockFetch.mockImplementation((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new Error('aborted')))
    }))
    const result = getRates()
    await jest.advanceTimersByTimeAsync(8000)
    expect((await result).status).toBe(503)
    jest.useRealTimers()
  })
})

describe('runtime event reads', () => {
  it.each(['', '?today=true'])('reports an outage instead of publishing a made-up event: %s', async query => {
    mockFetch.mockRejectedValue(new Error('fetch failed'))
    const response = await getEvents(new Request(`https://website.example.test/api/events${query}`))
    expect(response.status).toBe(503)
    expect(await response.json()).not.toHaveProperty('data.events')
  })

  it('preserves real future events', async () => {
    const event = { id: 'real-event', startDate: new Date(Date.now() + 86400000).toISOString() }
    mockFetch.mockResolvedValue(upstream({ success: true, data: { events: [event] } }))
    const response = await getEvents(new Request('https://website.example.test/api/events'))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ data: { events: [event] } })
  })

  it('does not invent event availability when the browser proxy fails', async () => {
    mockFetch.mockRejectedValue(new Error('fetch failed'))
    await expect(anchorAPI.checkEventAvailability('real-event', 2)).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })
})

it('uses empty build data rather than publishing an invented event', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(global, 'window')!
  const originalPhase = process.env.NEXT_PHASE
  const originalBuildFetch = process.env.ENABLE_BUILD_TIME_EXTERNAL_API
  Object.defineProperty(global, 'window', { value: undefined, configurable: true })
  process.env.NEXT_PHASE = 'phase-production-build'
  delete process.env.ENABLE_BUILD_TIME_EXTERNAL_API
  try {
    await expect(anchorAPI.getEvents()).resolves.toMatchObject({ events: [], pagination: { total: 0 } })
    await expect(anchorAPI.getTodaysEvents()).resolves.toMatchObject({ events: [] })
    expect(mockFetch).not.toHaveBeenCalled()
  } finally {
    Object.defineProperty(global, 'window', descriptor)
    if (originalPhase === undefined) delete process.env.NEXT_PHASE
    else process.env.NEXT_PHASE = originalPhase
    if (originalBuildFetch === undefined) delete process.env.ENABLE_BUILD_TIME_EXTERNAL_API
    else process.env.ENABLE_BUILD_TIME_EXTERNAL_API = originalBuildFetch
  }
})
