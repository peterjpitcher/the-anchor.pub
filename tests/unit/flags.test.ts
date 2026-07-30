import {
  clearWebsiteUiFlagsCacheForTest,
  getWebsiteUiFlags,
  isWebsiteUiFlagEnabled
} from '@/lib/flags'

// The flag reader is a kill switch, so its only hard requirement is that OFF
// never depends on AMS being healthy: unreachable, slow, non-200, malformed or
// simply missing all read as off (review F19).
describe('website UI flags', () => {
  const originalFetch = global.fetch
  const originalApiKey = process.env.ANCHOR_API_KEY

  beforeEach(() => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    clearWebsiteUiFlagsCacheForTest()
    jest.useFakeTimers({ doNotFake: ['setTimeout', 'clearTimeout', 'setImmediate', 'queueMicrotask'] })
  })

  afterEach(() => {
    jest.useRealTimers()
    global.fetch = originalFetch
    if (originalApiKey === undefined) {
      delete process.env.ANCHOR_API_KEY
    } else {
      process.env.ANCHOR_API_KEY = originalApiKey
    }
    jest.clearAllMocks()
  })

  function mockJsonResponse(body: unknown, status = 200) {
    const fetchMock = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    )
    global.fetch = fetchMock as any
    return fetchMock
  }

  it('reads flags from the AMS endpoint with the API key header', async () => {
    const fetchMock = mockJsonResponse({
      success: true,
      data: { flags: { booking_options_step1: true } }
    })

    await expect(isWebsiteUiFlagEnabled('booking_options_step1')).resolves.toBe(true)

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/website\/ui-flags$/)
    expect((init as RequestInit).method).toBe('GET')
    expect((init as RequestInit).headers).toMatchObject({ 'X-API-Key': 'test-api-key' })
    // A kill switch a cache keeps serving stale is not a kill switch.
    expect((init as any).cache).toBe('no-store')
  })

  it('a flag that is absent from the response is off', async () => {
    mockJsonResponse({ success: true, data: { flags: { something_else: true } } })

    await expect(isWebsiteUiFlagEnabled('booking_options_step1')).resolves.toBe(false)
  })

  it('only an explicit boolean true counts as on', async () => {
    mockJsonResponse({
      success: true,
      data: { flags: { as_string: 'true', as_number: 1, as_false: false } }
    })

    await expect(isWebsiteUiFlagEnabled('as_string')).resolves.toBe(false)
    await expect(isWebsiteUiFlagEnabled('as_number')).resolves.toBe(false)
    await expect(isWebsiteUiFlagEnabled('as_false')).resolves.toBe(false)
  })

  it('an unreachable AMS is off', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED')) as any

    await expect(getWebsiteUiFlags()).resolves.toEqual({})
    await expect(isWebsiteUiFlagEnabled('booking_options_step1')).resolves.toBe(false)
  })

  it('a timeout is off', async () => {
    // The reader aborts after its own budget; surface that as the AbortError a
    // real timeout produces.
    global.fetch = jest.fn().mockImplementation((_url: unknown, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal
        if (signal?.aborted) {
          reject(new DOMException('Aborted', 'AbortError'))
          return
        }
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    }) as any

    await expect(getWebsiteUiFlags()).resolves.toEqual({})
  })

  it('a malformed body is off', async () => {
    for (const body of [
      null,
      'not an object',
      [],
      { success: true },
      { success: true, data: null },
      { success: true, data: { flags: null } },
      { success: true, data: { flags: 'nope' } },
      { success: true, data: { flags: [] } }
    ]) {
      clearWebsiteUiFlagsCacheForTest()
      mockJsonResponse(body)
      await expect(getWebsiteUiFlags()).resolves.toEqual({})
    }
  })

  it('a non-200 response is off', async () => {
    mockJsonResponse({ error: 'unauthorised' }, 401)

    await expect(getWebsiteUiFlags()).resolves.toEqual({})
  })

  it('a missing API key is off and never calls out', async () => {
    delete process.env.ANCHOR_API_KEY
    const fetchMock = mockJsonResponse({ success: true, data: { flags: { on: true } } })

    await expect(getWebsiteUiFlags()).resolves.toEqual({})
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('serves from cache within 60 seconds, then re-reads', async () => {
    const fetchMock = mockJsonResponse({ success: true, data: { flags: { on: true } } })

    await expect(isWebsiteUiFlagEnabled('on')).resolves.toBe(true)
    await expect(isWebsiteUiFlagEnabled('on')).resolves.toBe(true)
    await expect(getWebsiteUiFlags()).resolves.toEqual({ on: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(59_000)
    await expect(isWebsiteUiFlagEnabled('on')).resolves.toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Past the TTL the switch is read again, so turning it off in AMS takes
    // effect inside a minute with no deploy.
    jest.advanceTimersByTime(2_000)
    mockJsonResponse({ success: true, data: { flags: {} } })
    await expect(isWebsiteUiFlagEnabled('on')).resolves.toBe(false)
  })

  it('caches a failure too, so a flapping AMS is not hammered', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('boom'))
    global.fetch = fetchMock as any

    await expect(getWebsiteUiFlags()).resolves.toEqual({})
    await expect(getWebsiteUiFlags()).resolves.toEqual({})
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('collapses concurrent misses onto one request', async () => {
    const fetchMock = mockJsonResponse({ success: true, data: { flags: { on: true } } })

    const results = await Promise.all([
      getWebsiteUiFlags(),
      getWebsiteUiFlags(),
      getWebsiteUiFlags()
    ])

    expect(results).toEqual([{ on: true }, { on: true }, { on: true }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
