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

// A realistic event id: the live site sends UUIDs, which is what pushes the
// later fields past the old truncation cutoff.
const EVENT_ID = '3f5b8f4e-1234-4a5b-8c9d-0123456789ab'

const VALID_BASE = {
  event_id: EVENT_ID,
  phone: '+447700900000',
  seats: 2
}

// Reproduces the key this route used to build: base64url(JSON) cut to 120
// characters, which preserves only the first 90 bytes of the payload. Used
// below to prove the differing field really did sit beyond the cutoff, so the
// two requests really did collapse onto one key before this fix.
function legacyTruncatedKey(payload: unknown): string {
  return `evt_${Buffer.from(JSON.stringify(payload)).toString('base64url').slice(0, 120)}`
}

function keyPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    event_id: EVENT_ID,
    phone: VALID_BASE.phone,
    seats: VALID_BASE.seats,
    communication_consent: 'null',
    ...overrides
  }
}

const ORIGINAL_ENV = process.env

beforeAll(() => {
  process.env = { ...ORIGINAL_ENV, ANCHOR_API_KEY: 'test-key' }
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

// The fallback Idempotency-Key is what the management API sees when a caller
// sends no header of its own. Every field that changes what is booked must
// change it. The key used to be base64url(JSON) truncated to 120 characters,
// which encodes only the first 90 bytes: for a UUID event id that cutoff falls
// inside `attendee_names`, so the names and the consent state were discarded
// and two different bookings collapsed onto one key.
describe('POST /api/event-bookings: fallback Idempotency-Key', () => {
  let createEventBooking: (request: any) => Promise<Response>
  let calls: Array<{ url: string; init: RequestInit }>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-key'
    calls = []
    ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: typeof input === 'string' ? input : input.toString(), init: init ?? {} })
      return new Response(
        JSON.stringify({ success: true, data: { state: 'confirmed', booking_id: 'bk-1' } }),
        { status: 201, headers: { 'content-type': 'application/json' } }
      )
    })

    jest.resetModules()
    ;({ POST: createEventBooking } = await import('@/app/api/event-bookings/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  async function keyFor(
    overrides: Record<string, unknown> = {},
    headers: Record<string, string> = {}
  ): Promise<string> {
    calls.length = 0

    const request = new Request('http://localhost/api/event-bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ ...VALID_BASE, ...overrides })
    })

    const response = await createEventBooking(request as any)
    expect(response.status).toBe(201)

    return (calls[0].init.headers as Record<string, string>)['Idempotency-Key']
  }

  it('forwards food and arrival requests and includes them in retry keys', async () => {
    const noRequest = await keyFor()
    const food = await keyFor({ dining_request: 'before_event' })
    expect(food).not.toBe(noRequest)
    expect(await keyFor({ dining_request: 'before_event' })).toBe(food)
    const early = await keyFor({ dining_request: 'before_event', early_arrival_request: true })
    expect(early).not.toBe(food)
    expect(JSON.parse(String(calls[calls.length - 1].init.body))).toMatchObject({ dining_request: 'before_event', early_arrival_request: true })
  })

  it.each([{ dining_request: 'guaranteed_meal' }, { dining_request: ['before_event'] }, { early_arrival_request: 'true' }])('rejects invalid requests before forwarding %j', async (overrides) => {
    const response = await createEventBooking(new Request('https://example.com/api/event-bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...VALID_BASE, ...overrides }) }))
    expect(response.status).toBe(400)
    expect(calls).toHaveLength(0)
  })

  it('reuses the caller Idempotency-Key when one is supplied', async () => {
    const key = await keyFor({}, { 'Idempotency-Key': 'evt_web_caller-supplied' })

    expect(key).toBe('evt_web_caller-supplied')
  })

  it('an identical retry produces the same key, so the booking is deduped', async () => {
    expect(await keyFor()).toBe(await keyFor())
  })

  // Attendee names begin at byte 103 of the hashed payload, well past the old
  // 90-byte cutoff: two parties of two with completely different guests used to
  // share a key and the second booking was replayed away.
  it('varies with the attendee names, which the old truncation discarded', async () => {
    const alice = await keyFor({ attendee_names: ['Alice Booker', 'Bob Guest'] })
    const cara = await keyFor({ attendee_names: ['Cara Booker', 'Dan Guest'] })

    expect(alice).not.toBe(cara)

    // The same two payloads under the old scheme, to show what was broken.
    expect(legacyTruncatedKey(keyPayload({ attendee_names: ['Alice Booker', 'Bob Guest'] }))).toBe(
      legacyTruncatedKey(keyPayload({ attendee_names: ['Cara Booker', 'Dan Guest'] }))
    )
  })

  it('varies with the ticket selection, which the old truncation discarded', async () => {
    const adultOnly = await keyFor({
      event_price: 5,
      attendee_names: ['Alice Booker', 'Bob Guest'],
      ticket_selections: [
        { ticket_type_id: 'type-adult', quantity: 2, attendee_names: ['Alice Booker', 'Bob Guest'] }
      ]
    })
    const mixed = await keyFor({
      event_price: 5,
      attendee_names: ['Alice Booker', 'Bob Guest'],
      ticket_selections: [
        { ticket_type_id: 'type-adult', quantity: 1, attendee_names: ['Alice Booker'] },
        { ticket_type_id: 'type-child', quantity: 1, attendee_names: ['Bob Guest'] }
      ]
    })

    expect(adultOnly).not.toBe(mixed)
  })

  it('varies with the fields it always varied with', async () => {
    const base = await keyFor()

    expect(await keyFor({ seats: 4 })).not.toBe(base)
    expect(await keyFor({ phone: '+447700900111' })).not.toBe(base)
    expect(await keyFor({ event_id: '9a9a9a9a-1234-4a5b-8c9d-0123456789ab' })).not.toBe(base)
  })
})
