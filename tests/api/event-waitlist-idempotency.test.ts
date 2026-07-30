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

// A realistic event id: the live site sends UUIDs, which is what pushes the
// later fields past the old truncation cutoff.
const EVENT_ID = '3f5b8f4e-1234-4a5b-8c9d-0123456789ab'

const VALID_BASE = {
  event_id: EVENT_ID,
  phone: '+447700900000',
  requested_seats: 2
}

// Reproduces the key this route used to build: base64url(JSON) cut to 120
// characters, which preserves only the first 90 bytes of the payload. Used
// below to prove the differing field really did sit beyond the cutoff.
function legacyTruncatedKey(payload: unknown): string {
  return `wlt_${Buffer.from(JSON.stringify(payload)).toString('base64url').slice(0, 120)}`
}

function keyPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    event_id: EVENT_ID,
    phone: VALID_BASE.phone,
    requested_seats: VALID_BASE.requested_seats,
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
// sends no header of its own. The key used to be base64url(JSON) truncated to
// 120 characters, which encodes only the first 90 bytes: for a UUID event id
// that cutoff falls inside `requested_seats`, so the seat count itself never
// reached the key and the same person asking for a different number of seats
// was replayed away as a duplicate.
describe('POST /api/event-waitlist: fallback Idempotency-Key', () => {
  let joinWaitlist: (request: any) => Promise<Response>
  let calls: Array<{ url: string; init: RequestInit }>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-key'
    calls = []
    ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: typeof input === 'string' ? input : input.toString(), init: init ?? {} })
      return new Response(
        JSON.stringify({ success: true, data: { state: 'waitlisted' } }),
        { status: 201, headers: { 'content-type': 'application/json' } }
      )
    })

    jest.resetModules()
    ;({ POST: joinWaitlist } = await import('@/app/api/event-waitlist/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  async function keyFor(
    overrides: Record<string, unknown> = {},
    headers: Record<string, string> = {}
  ): Promise<string> {
    calls.length = 0

    const request = new Request('http://localhost/api/event-waitlist', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ ...VALID_BASE, ...overrides })
    })

    await joinWaitlist(request as any)
    expect(calls).toHaveLength(1)

    return (calls[0].init.headers as Record<string, string>)['Idempotency-Key']
  }

  it('reuses the caller Idempotency-Key when one is supplied', async () => {
    const key = await keyFor({}, { 'Idempotency-Key': 'wlt_web_caller-supplied' })

    expect(key).toBe('wlt_web_caller-supplied')
  })

  it('an identical retry produces the same key, so the request is deduped', async () => {
    expect(await keyFor()).toBe(await keyFor())
  })

  // The seat count sits at byte 93 of the hashed payload, past the old 90-byte
  // cutoff: asking for four seats instead of two used to produce the same key.
  it('varies with the requested seats, which the old truncation discarded', async () => {
    expect(await keyFor({ requested_seats: 4 })).not.toBe(await keyFor())

    // The same two payloads under the old scheme, to show what was broken.
    expect(legacyTruncatedKey(keyPayload({ requested_seats: 4 }))).toBe(
      legacyTruncatedKey(keyPayload())
    )
  })

  it('varies with the marketing consent, which the old truncation discarded', async () => {
    const noConsent = await keyFor()
    const withConsent = await keyFor({
      communication_consent: { marketing_sms_opt_in: true }
    })

    expect(withConsent).not.toBe(noConsent)
  })

  it('varies with the fields it always varied with', async () => {
    const base = await keyFor()

    expect(await keyFor({ phone: '+447700900111' })).not.toBe(base)
    expect(await keyFor({ event_id: '9a9a9a9a-1234-4a5b-8c9d-0123456789ab' })).not.toBe(base)
  })
})
