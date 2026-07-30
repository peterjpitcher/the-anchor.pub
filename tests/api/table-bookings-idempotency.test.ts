export {}

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

const OPEN_HOURS = {
  regularHours: {
    tuesday: {
      opens: '12:00',
      closes: '23:00',
      is_closed: false,
      kitchen: { opens: '12:00', closes: '21:00' }
    }
  },
  specialHours: []
} as any

// The fallback Idempotency-Key is what AMS sees when a caller sends no header
// of its own. Every field that changes what is booked must change it, and
// accessibility is include-only-when-true so absent-or-false leaves the hashed
// payload byte-identical to a request that predates the field (review F18).
describe('POST /api/table-bookings: fallback Idempotency-Key', () => {
  let createTableBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    mockGetBusinessHours.mockResolvedValue(OPEN_HOURS)
    // A fresh Response per call: a body can only be read once, and several
    // tests below post twice to compare the two keys.
    ;(global as any).fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'TB-TEST' } }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: { 'Content-Type': 'application/json', ...((init as any)?.headers || {}) }
        })
    }

    jest.resetModules()
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.clearAllMocks()
  })

  // 2026-08-04 is a Tuesday, inside both bar and kitchen hours.
  async function keyFor(overrides: Record<string, unknown> = {}): Promise<string> {
    ;(global.fetch as jest.Mock).mockClear()

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-08-04',
        time: '19:00',
        party_size: 2,
        purpose: 'food',
        ...overrides
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)
    expect(response.status).toBe(201)

    const [, upstreamOptions] = (global.fetch as jest.Mock).mock.calls[0]
    const headers = (upstreamOptions as RequestInit).headers as Record<string, string>
    return headers['Idempotency-Key']
  }

  it('reuses the caller Idempotency-Key when one is supplied', async () => {
    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-08-04',
        time: '19:00',
        party_size: 2,
        purpose: 'food'
      }),
      headers: new Headers({ 'Idempotency-Key': 'tbl_web_caller-supplied' })
    } as any

    await createTableBooking(request)

    const [, upstreamOptions] = (global.fetch as jest.Mock).mock.calls[0]
    const headers = (upstreamOptions as RequestInit).headers as Record<string, string>
    expect(headers['Idempotency-Key']).toBe('tbl_web_caller-supplied')
  })

  it('an identical retry produces the same key, so AMS dedupes it', async () => {
    expect(await keyFor()).toBe(await keyFor())
  })

  it('a retry that adds an accessibility requirement produces a different key', async () => {
    const plain = await keyFor()
    const accessible = await keyFor({ requires_accessible_table: true })

    expect(accessible).not.toBe(plain)
  })

  it('the flag false or absent produces the same key as before the field existed', async () => {
    const absent = await keyFor()
    const explicitlyFalse = await keyFor({ requires_accessible_table: false })

    expect(explicitlyFalse).toBe(absent)
  })

  // The old key was base64url(JSON) truncated to 120 characters, which encodes
  // only the first 90 bytes: everything after `purpose` was discarded, so two
  // different bookings collapsed onto one key. These pin the fix.
  it('varies with the high-chair request', async () => {
    expect(await keyFor({ high_chair_count: 1 })).not.toBe(await keyFor())
  })

  it('varies with outside seating', async () => {
    expect(await keyFor({ is_outside_seating: true })).not.toBe(await keyFor())
  })

  it('varies with the fields it always varied with', async () => {
    const base = await keyFor()

    expect(await keyFor({ party_size: 4 })).not.toBe(base)
    expect(await keyFor({ time: '19:30' })).not.toBe(base)
    expect(await keyFor({ phone: '07700900111' })).not.toBe(base)
  })
})
