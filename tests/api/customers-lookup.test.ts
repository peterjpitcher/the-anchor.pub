export {}

// The public phone lookup is pre-verification: typing a number is not proof of
// possession, so the response must never identify anyone (review F10). These
// tests pin the response shape to { known } (+ lookup_degraded on fallback).
describe('POST /api/customers/lookup: response never identifies anyone', () => {
  const originalFetch = global.fetch
  const originalApiKey = process.env.ANCHOR_API_KEY

  let getLookup: (request: any) => Promise<Response>

  beforeAll(() => {
    // jsdom's Response lacks the static json() that NextResponse.json delegates
    // to; polyfill it so the route can build its responses under jest.
    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: { 'Content-Type': 'application/json', ...((init as any)?.headers || {}) }
        })
    }
  })

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    jest.resetModules()
    ;({ POST: getLookup } = await import('@/app/api/customers/lookup/route'))
  })

  afterEach(() => {
    global.fetch = originalFetch
    if (originalApiKey === undefined) {
      delete process.env.ANCHOR_API_KEY
    } else {
      process.env.ANCHOR_API_KEY = originalApiKey
    }
    jest.clearAllMocks()
  })

  // The number travels in the body. The address carries nothing personal.
  function makeRequest(phone: unknown, ip: string, extra: Record<string, unknown> = {}) {
    return {
      nextUrl: new URL('https://www.the-anchor.pub/api/customers/lookup'),
      headers: new Headers({ 'x-forwarded-for': ip }),
      json: async () => ({ phone, default_country_code: '44', ...extra })
    } as any
  }

  function mockUpstream(body: unknown, status = 200) {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
      })
    ) as any
  }

  it('returns exactly { known: true } for a recognised number, never the customer record', async () => {
    mockUpstream({
      success: true,
      data: {
        known: true,
        normalized_phone: '+447700900123',
        customer: {
          id: 'cus-1',
          first_name: 'Jane',
          last_name: 'Doe',
          full_name: 'Jane Doe',
          email: 'jane.doe@example.com',
          mobile_e164: '+447700900123',
          mobile_number: '07700 900123'
        }
      }
    })

    const response = await getLookup(makeRequest('07700900123', '203.0.113.1'))
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.data).toEqual({ known: true })

    const serialised = JSON.stringify(body)
    for (const leaked of [
      'Jane',
      'Doe',
      'jane.doe@example.com',
      'cus-1',
      '+447700900123',
      '07700 900123',
      'customer',
      'normalized_phone',
      'first_name',
      'last_name',
      'full_name',
      'email'
    ]) {
      expect(serialised).not.toContain(leaked)
    }
  })

  it('returns { known: false } for an unrecognised number', async () => {
    mockUpstream({ success: true, data: { known: false } })

    const response = await getLookup(makeRequest('07700900999', '203.0.113.2'))
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data).toEqual({ known: false })
  })

  it('degrades to { known: false, lookup_degraded: true } when the upstream fails', async () => {
    mockUpstream({ error: 'boom' }, 500)

    const response = await getLookup(makeRequest('07700900123', '203.0.113.3'))
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data).toEqual({ known: false, lookup_degraded: true })
  })

  it('sends no reason code or source label back to the caller', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockUpstream({ error: 'boom' }, 429)

    const degraded = await getLookup(makeRequest('07700900123', '203.0.113.4'))
    const degradedBody = await degraded.json()
    expect(degradedBody).toEqual({ success: true, data: { known: false, lookup_degraded: true } })
    expect(JSON.stringify(degradedBody)).not.toMatch(/meta|reason|upstream|429/)
    // The reason still reaches our own logs, without the number.
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('upstream_429'))
    expect(JSON.stringify(warn.mock.calls)).not.toContain('07700900123')

    mockUpstream({ success: true, data: { known: true } })
    const known = await getLookup(makeRequest('07700900123', '203.0.113.5'))
    expect(await known.json()).toEqual({ success: true, data: { known: true } })
    warn.mockRestore()
  })

  it('answers the seventh try in a minute from one address without asking the management app', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    // A fresh answer each time: a Response body can be read only once.
    global.fetch = jest.fn().mockImplementation(async () =>
      new Response(JSON.stringify({ success: true, data: { known: true } }), { status: 200 })
    ) as any

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const allowed = await getLookup(makeRequest('07700900123', '203.0.113.6'))
      expect((await allowed.json()).data).toEqual({ known: true })
    }
    const limited = await getLookup(makeRequest('07700900123', '203.0.113.6'))
    expect(await limited.json()).toEqual({ success: true, data: { known: false, lookup_degraded: true } })
    expect(global.fetch).toHaveBeenCalledTimes(6)
    warn.mockRestore()
  })

  it('refuses a body with no usable number before any upstream call', async () => {
    mockUpstream({ success: true, data: { known: true } })

    for (const [index, phone] of [undefined, '', '123', 42, { number: '07700900123' }, '0'.repeat(33)].entries()) {
      const response = await getLookup(makeRequest(phone, `203.0.113.${20 + index}`))
      expect(response.status).toBe(400)
    }
    const badCountry = await getLookup(makeRequest('07700900123', '203.0.113.30', { default_country_code: '44&x=1' }))
    expect(badCountry.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('a GET from a page left open across the deploy is told "could not check", and the number goes nowhere', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockUpstream({ success: true, data: { known: true } })
    const { GET } = await import('@/app/api/customers/lookup/route')

    // The handler takes no request at all, so it cannot read the address.
    expect(GET.length).toBe(0)
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ success: true, data: { known: false, lookup_degraded: true } })
    expect(global.fetch).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
