/**
 * Per-ticket attendee-name behaviour for the website /api/event-bookings proxy.
 *
 * - Paid events (event_price > 0) require a name for every ticket and forward
 *   the `attendee_names` array to the management API.
 * - Free events do not require names and forward none.
 * - A name count that does not match `seats`, or any blank name, is rejected 400.
 */

export {}

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://example.invalid/api'
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

jest.mock('@/lib/upstream-json', () => ({
  getSafeUpstreamErrorMessage: () => 'upstream error',
  safeJsonParse: (text: string) => {
    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  }
}))

jest.mock('@/lib/error-handling', () => ({
  createApiErrorResponse: (message: string, status: number) =>
    new Response(JSON.stringify({ success: false, error: message }), {
      status,
      headers: { 'content-type': 'application/json' }
    }),
  logError: jest.fn()
}))

jest.mock('@/lib/booking-conversion-forwarding', () => ({
  forwardBookingConversionToCheersAI: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('@/lib/communication-consent-server', () => ({
  sanitizeCommunicationConsent: () => undefined,
  communicationConsentIdempotencyPart: () => ''
}))

const VALID_BASE = {
  event_id: 'evt-12345678',
  phone: '07700900000',
  first_name: 'Alice',
  last_name: 'Booker',
  seats: 2
}

function buildRequest(body: unknown): Request {
  return new Request('http://localhost/api/event-bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function getPostHandler() {
  const mod = await import('@/app/api/event-bookings/route')
  return mod.POST
}

function installUpstreamFetch() {
  const calls: Array<{ url: string; init: RequestInit }> = []
  ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    calls.push({ url, init: init ?? {} })
    return new Response(
      JSON.stringify({ success: true, data: { state: 'confirmed', booking_id: 'bk-1' } }),
      { status: 201, headers: { 'content-type': 'application/json' } }
    )
  })
  return calls
}

const ORIGINAL_ENV = process.env

beforeAll(() => {
  process.env = { ...ORIGINAL_ENV, ANCHOR_API_KEY: 'test-key' }
  // jsdom's Response lacks the static json() helper that NextResponse.json delegates to.
  const ResponseCtor = global.Response as unknown as {
    json?: (data: unknown, init?: ResponseInit) => Response
  }
  if (typeof ResponseCtor.json !== 'function') {
    ResponseCtor.json = (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'content-type': 'application/json', ...(init?.headers as Record<string, string> | undefined) }
      })
  }
})

afterAll(() => {
  process.env = ORIGINAL_ENV
})

beforeEach(() => {
  process.env.ANCHOR_API_KEY = 'test-key'
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('website /api/event-bookings proxy, per-ticket attendee names', () => {
  it('rejects a paid booking that is missing attendee names', async () => {
    installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(buildRequest({ ...VALID_BASE, event_price: 5 }) as any)

    expect(res.status).toBe(400)
  })

  it('forwards attendee_names for a paid booking with a name per ticket', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        ...VALID_BASE,
        event_price: 5,
        attendee_names: ['Alice Booker', 'Bob Guest']
      }) as any
    )

    expect(res.status).toBe(201)
    expect(calls).toHaveLength(1)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.attendee_names).toEqual(['Alice Booker', 'Bob Guest'])
  })

  it('rejects when the attendee name count does not match seats', async () => {
    installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        ...VALID_BASE,
        seats: 3,
        event_price: 5,
        attendee_names: ['Alice Booker', 'Bob Guest']
      }) as any
    )

    expect(res.status).toBe(400)
  })

  it('rejects when any attendee name is blank', async () => {
    installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        ...VALID_BASE,
        event_price: 5,
        attendee_names: ['Alice Booker', '   ']
      }) as any
    )

    expect(res.status).toBe(400)
  })

  it('does not require names for a free event and forwards none', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(buildRequest({ ...VALID_BASE }) as any)

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.attendee_names).toBeUndefined()
    const expectedLegacyKey = `evt_${Buffer.from(JSON.stringify({
      event_id: VALID_BASE.event_id,
      phone: VALID_BASE.phone,
      seats: VALID_BASE.seats,
      communication_consent: ''
    })).toString('base64url').slice(0, 120)}`
    expect((calls[0].init.headers as Record<string, string>)['Idempotency-Key']).toBe(expectedLegacyKey)
  })
})

describe('website /api/event-bookings proxy, ticket_selections passthrough', () => {
  it('forwards a valid ticket_selections basket to the management API', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        ...VALID_BASE,
        seats: 3,
        event_price: 5,
        attendee_names: ['Alice Booker', 'Bob Guest', 'Cara Guest'],
        ticket_selections: [
          { ticket_type_id: 'type-adult', quantity: 2, attendee_names: ['Alice Booker', 'Bob Guest'] },
          { ticket_type_id: 'type-child', quantity: 1, attendee_names: ['Cara Guest'] }
        ]
      }) as any
    )

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.ticket_selections).toEqual([
      { ticket_type_id: 'type-adult', quantity: 2, attendee_names: ['Alice Booker', 'Bob Guest'] },
      { ticket_type_id: 'type-child', quantity: 1, attendee_names: ['Cara Guest'] }
    ])
    expect(forwarded.seats).toBe(3)
  })

  it('rejects when the selection seat total does not match seats', async () => {
    installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        ...VALID_BASE,
        seats: 3,
        event_price: 5,
        attendee_names: ['Alice Booker', 'Bob Guest'],
        ticket_selections: [
          { ticket_type_id: 'type-adult', quantity: 2, attendee_names: ['Alice Booker', 'Bob Guest'] }
        ]
      }) as any
    )

    expect(res.status).toBe(400)
  })

  it('rejects when a selection line has a name-count mismatch', async () => {
    installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        ...VALID_BASE,
        seats: 2,
        event_price: 5,
        attendee_names: ['Alice Booker', 'Bob Guest'],
        ticket_selections: [
          { ticket_type_id: 'type-adult', quantity: 2, attendee_names: ['Alice Booker'] }
        ]
      }) as any
    )

    expect(res.status).toBe(400)
  })

  it('rejects when a selection line is missing its ticket_type_id', async () => {
    installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        ...VALID_BASE,
        seats: 1,
        event_price: 5,
        attendee_names: ['Alice Booker'],
        ticket_selections: [
          { ticket_type_id: '', quantity: 1, attendee_names: ['Alice Booker'] }
        ]
      }) as any
    )

    expect(res.status).toBe(400)
  })

  it('does not add a ticket_selections key to single-type bookings', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(buildRequest({ ...VALID_BASE }) as any)

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect('ticket_selections' in forwarded).toBe(false)
  })
})
