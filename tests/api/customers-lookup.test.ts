export {}

// The public phone lookup is pre-verification: typing a number is not proof of
// possession, so the response must never identify anyone (review F10). These
// tests pin the response shape to { known } (+ lookup_degraded on fallback).
describe('GET /api/customers/lookup: response never identifies anyone', () => {
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
    ;({ GET: getLookup } = await import('@/app/api/customers/lookup/route'))
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

  function makeRequest(phone: string, ip: string) {
    const url = new URL(
      `https://www.the-anchor.pub/api/customers/lookup?phone=${encodeURIComponent(phone)}&default_country_code=44`
    )
    return {
      nextUrl: url,
      headers: new Headers({ 'x-forwarded-for': ip })
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
})
