export {}

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://example.invalid/api'
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

jest.mock('@/lib/error-handling', () => ({
  logError: jest.fn()
}))

const VALID_BASE = {
  customer_first_name: 'Alice',
  customer_last_name: 'Booker',
  contact_phone: '+447700900000',
  event_date: '2026-09-01',
  start_time: '19:00',
  guest_count: 20
}

// Reproduces the key this route used to build: base64url(JSON) cut to 120
// characters, which preserves only the first 90 bytes of the payload. Used
// below to prove the differing field really did sit beyond the cutoff.
function legacyTruncatedKey(payload: unknown): string {
  return `prv_${Buffer.from(JSON.stringify(payload)).toString('base64url').slice(0, 120)}`
}

// The payload the route maps and hashes, rebuilt in its declared key order.
// Key order matters: the old truncation cut the serialised JSON at a byte
// offset, so where a field sits decides whether it survived.
function keyPayload(
  overrides: { defaultCountryCode?: string; time?: string; groupSize?: number } = {}
): Record<string, unknown> {
  return {
    phone: VALID_BASE.contact_phone,
    ...(overrides.defaultCountryCode ? { default_country_code: overrides.defaultCountryCode } : {}),
    name: 'Alice Booker',
    date: VALID_BASE.event_date,
    time: overrides.time ?? VALID_BASE.start_time,
    group_size: overrides.groupSize ?? VALID_BASE.guest_count
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
// 120 characters, which encodes only the first 90 bytes: that cutoff falls
// inside `date`, so the event date, start time, guest count and notes never
// reached the key. Two completely different enquiries from the same person
// collapsed onto one key and the second was replayed away.
describe('POST /api/public/private-booking: fallback Idempotency-Key', () => {
  let createPrivateBookingEnquiry: (request: any) => Promise<Response>
  let calls: Array<{ url: string; init: RequestInit }>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-key'
    calls = []
    ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: typeof input === 'string' ? input : input.toString(), init: init ?? {} })
      return new Response(
        JSON.stringify({ booking_id: 'pb-1', reference: 'PB-TEST', state: 'enquiry_created' }),
        { status: 201, headers: { 'content-type': 'application/json' } }
      )
    })

    jest.resetModules()
    ;({ POST: createPrivateBookingEnquiry } = await import('@/app/api/public/private-booking/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  async function keyFor(
    overrides: Record<string, unknown> = {},
    headers: Record<string, string> = {}
  ): Promise<string> {
    calls.length = 0

    const request = new Request('http://localhost/api/public/private-booking', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ ...VALID_BASE, ...overrides })
    })

    await createPrivateBookingEnquiry(request as any)
    expect(calls).toHaveLength(1)

    return (calls[0].init.headers as Record<string, string>)['Idempotency-Key']
  }

  it('reuses the caller Idempotency-Key when one is supplied', async () => {
    const key = await keyFor({}, { 'Idempotency-Key': 'prv_web_caller-supplied' })

    expect(key).toBe('prv_web_caller-supplied')
  })

  it('an identical retry produces the same key, so the enquiry is deduped', async () => {
    expect(await keyFor()).toBe(await keyFor())
  })

  // The guest count sits at byte 96 of the hashed payload, past the old 90-byte
  // cutoff: an enquiry for 60 guests used to share a key with one for 20.
  it('varies with the guest count, which the old truncation discarded', async () => {
    expect(await keyFor({ guest_count: 60 })).not.toBe(await keyFor())

    // The same two payloads under the old scheme, to show what was broken.
    expect(legacyTruncatedKey(keyPayload({ groupSize: 60 }))).toBe(
      legacyTruncatedKey(keyPayload())
    )
  })

  // How far the old cutoff reached depended on the payload: once a country code
  // is present (the booking form sends one) it fell before the date and time
  // too, so two enquiries months apart shared a key.
  it('varies with the start time once a country code pushes it past the old cutoff', async () => {
    const evening = await keyFor({ default_country_code: '44' })
    const lunch = await keyFor({ default_country_code: '44', start_time: '12:00' })

    expect(lunch).not.toBe(evening)

    // The same two payloads under the old scheme, to show what was broken.
    expect(legacyTruncatedKey(keyPayload({ defaultCountryCode: '44', time: '12:00' }))).toBe(
      legacyTruncatedKey(keyPayload({ defaultCountryCode: '44' }))
    )
  })

  it('varies with the notes, which the old truncation discarded', async () => {
    const plain = await keyFor()
    const withNotes = await keyFor({ internal_notes: 'Buffet for the upstairs room' })

    expect(withNotes).not.toBe(plain)
  })

  it('varies with the event type, which lands in the notes the old key dropped', async () => {
    expect(await keyFor({ event_type: 'Wake' })).not.toBe(await keyFor({ event_type: 'Birthday' }))
  })

  it('varies with the fields it always varied with', async () => {
    const base = await keyFor()

    expect(await keyFor({ contact_phone: '+447700900111' })).not.toBe(base)
    expect(await keyFor({ customer_first_name: 'Cara' })).not.toBe(base)
  })
  it('preserves every estimator item instead of silently dropping items after twelve', async () => {
    await keyFor({ items: Array.from({ length: 13 }, (_, index) => ({ description: `Choice ${index + 1}`, quantity: 1 })) })
    const mapped = JSON.parse(calls[0].init.body as string)
    expect(mapped.notes).toContain('Choice 13 x1')
  })

  it('rejects overlong context without posting or truncating it', async () => {
    const request = new Request('http://localhost/api/public/private-booking', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...VALID_BASE, internal_notes: 'x'.repeat(2001) })
    })
    const response = await createPrivateBookingEnquiry(request)
    expect(response.status).toBe(400)
    expect(calls).toHaveLength(0)
    expect(await response.json()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } })
  })

})
