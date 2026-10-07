export {}

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://management.example.test/api'
}))

if (typeof (Response as any).json !== 'function') {
  ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...((init?.headers as Record<string, string>) || {}) }
    })
}

/**
 * /api/health used to be a file written at build time: it said "ok" with the
 * build's own timestamp for the life of the deployment, with the key deleted
 * and every booking failing, and it printed the management API's address.
 */

const REQUIRED = {
  ANCHOR_API_KEY: 'live-key-that-must-never-be-printed',
  TURNSTILE_SECRET_KEY: 'turnstile-secret',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'turnstile-site',
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'paypal-client',
  MICROSOFT_TENANT_ID: 'tenant',
  MICROSOFT_CLIENT_ID: 'client',
  MICROSOFT_CLIENT_SECRET: 'graph-secret',
  MICROSOFT_USER_EMAIL: 'bot@the-anchor.pub'
}

const ORIGINAL_ENV = process.env
let consoleError: jest.SpyInstance

async function callHealth() {
  const { GET } = await import('@/app/api/health/route')
  const response = await GET()
  const text = await response.text()
  return { response, text, body: JSON.parse(text) as Record<string, any> }
}

function hoursAnswer(status = 200, body: unknown = { success: true, data: { regularHours: {} } }) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

beforeEach(() => {
  jest.resetModules()
  process.env = { ...ORIGINAL_ENV, ...REQUIRED }
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  ;(global as any).fetch = jest.fn(async () => hoursAnswer())
})

afterEach(() => {
  consoleError.mockRestore()
  process.env = ORIGINAL_ENV
  jest.useRealTimers()
})

describe('GET /api/health', () => {
  it('is dynamic, so it can never be built as a static file again', async () => {
    const route = await import('@/app/api/health/route')
    expect(route.dynamic).toBe('force-dynamic')
    expect(route.revalidate).toBe(0)
  })

  it('answers 200 when the settings are present and the hours endpoint answers', async () => {
    const { response, body } = await callHealth()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({ status: 'ok', checks: { settings: 'ok', bookingSystem: 'ok' } })
    expect(body).not.toHaveProperty('reason')
    expect(response.headers.get('Cache-Control')).toBe('private, no-store, max-age=0')
  })

  it('really asks the booking system, with the key, on request', async () => {
    await callHealth()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('https://management.example.test/api/business/hours')
    expect(init.headers['X-API-Key']).toBe(REQUIRED.ANCHOR_API_KEY)
    expect(init.cache).toBe('no-store')
  })

  it('gives a fresh time on each check rather than the build time', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
    jest.setSystemTime(new Date('2026-10-07T12:00:00Z'))
    const first = await callHealth()

    jest.setSystemTime(new Date('2026-10-07T12:01:00Z'))
    const second = await callHealth()

    expect(first.body.checkedAt).toBe('2026-10-07T12:00:00.000Z')
    expect(second.body.checkedAt).toBe('2026-10-07T12:01:00.000Z')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('remembers its answer for a few seconds, so refreshing it cannot use up the booking key', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
    jest.setSystemTime(new Date('2026-10-07T12:00:00Z'))

    await callHealth()
    jest.setSystemTime(new Date('2026-10-07T12:00:10Z'))
    await callHealth()
    await callHealth()
    expect(global.fetch).toHaveBeenCalledTimes(1)

    jest.setSystemTime(new Date('2026-10-07T12:00:15Z'))
    await callHealth()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['the booking system cannot be reached', () => Promise.reject(new TypeError('fetch failed')), 'booking_system_unreachable'],
    [
      'the booking system does not answer in time',
      () => Promise.reject(Object.assign(new Error('The operation timed out'), { name: 'TimeoutError' })),
      'booking_system_timed_out'
    ],
    ['the key is rejected', () => Promise.resolve(hoursAnswer(401, { error: { code: 'UNAUTHORIZED' } })), 'booking_system_rejected_key'],
    ['the key lacks permission', () => Promise.resolve(hoursAnswer(403, { error: { code: 'FORBIDDEN' } })), 'booking_system_rejected_key'],
    ['the booking system answers with an error', () => Promise.resolve(hoursAnswer(500, { error: 'boom' })), 'booking_system_error'],
    [
      'a gateway page answers 200',
      () => Promise.resolve(hoursAnswer(200, '<!doctype html><html><body>ok</body></html>')),
      'booking_system_unreadable'
    ]
  ])('answers 503 with a short reason when %s', async (_label, answer, reason) => {
    ;(global as any).fetch = jest.fn(answer)

    const { response, body } = await callHealth()

    expect(response.status).toBe(503)
    expect(body).toMatchObject({ status: 'unavailable', reason, checks: { bookingSystem: 'failed' } })
  })

  it('answers 503 without calling anything when the booking key is missing', async () => {
    delete process.env.ANCHOR_API_KEY

    const { response, body } = await callHealth()

    expect(response.status).toBe(503)
    expect(body).toMatchObject({ status: 'unavailable', reason: 'settings_missing', checks: { settings: 'failed', bookingSystem: 'not_checked' } })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it.each(Object.keys(REQUIRED).filter((name) => name !== 'ANCHOR_API_KEY'))(
    'answers 503 when %s is missing, even though the booking system is fine',
    async (name) => {
      delete process.env[name]

      const { response, body, text } = await callHealth()

      expect(response.status).toBe(503)
      expect(body).toMatchObject({ status: 'unavailable', reason: 'settings_missing', checks: { settings: 'failed', bookingSystem: 'ok' } })
      // The name goes to the log for whoever fixes it, not into a public answer.
      expect(text).not.toContain(name)
      expect(consoleError.mock.calls.map((call) => String(call[0])).join('\n')).toContain(name)
    }
  )

  it('never puts a secret, a setting name or the booking system address in the answer', async () => {
    const healthy = await callHealth()

    jest.resetModules()
    ;(global as any).fetch = jest.fn(async () => hoursAnswer(401, { error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }))
    delete process.env.MICROSOFT_CLIENT_SECRET
    const broken = await callHealth()

    for (const text of [healthy.text, broken.text]) {
      for (const secret of Object.values(REQUIRED)) expect(text).not.toContain(secret)
      for (const name of Object.keys(REQUIRED)) expect(text).not.toContain(name)
      expect(text).not.toContain('management.example.test')
      expect(text).not.toContain('apiBaseUrl')
      expect(text).not.toContain('Invalid or missing API key')
    }
    expect(Object.keys(healthy.body).sort()).toEqual(['checkedAt', 'checks', 'status'])
    expect(Object.keys(broken.body).sort()).toEqual(['checkedAt', 'checks', 'reason', 'status'])
  })
})
