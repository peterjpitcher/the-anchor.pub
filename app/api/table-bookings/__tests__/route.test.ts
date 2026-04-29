/**
 * Walk-in-launch behaviour tests for the website /api/table-bookings proxy.
 *
 * Spec §6, §8.1: the public proxy must:
 *   1. Silently strip inbound `sunday_lunch` and `booking_type` regardless
 *      of value (defence in depth — hostile or stale clients can't sneak
 *      Sunday-lunch behaviour back in).
 *   2. Always forward booking_type='regular' to the management API.
 *   3. NOT enforce any Saturday-1pm cutoff (Sunday-lunch cutoff retired).
 *   4. Forward `purpose` through unchanged when valid; default to 'food'
 *      when the inbound payload omits it.
 */

export {}

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://example.invalid/api'
}))

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
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

const ALWAYS_OPEN_HOURS = {
  regularHours: {
    monday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    wednesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    thursday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    friday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    saturday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } },
    sunday: { opens: '12:00', closes: '18:00', is_closed: false, kitchen: { opens: '13:00', closes: '17:30' } }
  },
  specialHours: []
} as any

function buildRequest(body: unknown): Request {
  return new Request('http://localhost/api/table-bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function getPostHandler() {
  const mod = await import('@/app/api/table-bookings/route')
  return mod.POST
}

function installUpstreamFetch() {
  const calls: Array<{ url: string; init: RequestInit }> = []
  ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    calls.push({ url, init: init ?? {} })
    return new Response(
      JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'TB-OK' } }),
      { status: 201, headers: { 'content-type': 'application/json' } }
    )
  })
  return calls
}

const ORIGINAL_ENV = process.env

beforeAll(() => {
  process.env = { ...ORIGINAL_ENV, ANCHOR_API_KEY: 'test-key' }
})

afterAll(() => {
  process.env = ORIGINAL_ENV
})

beforeEach(() => {
  mockGetBusinessHours.mockResolvedValue(ALWAYS_OPEN_HOURS)
})

afterEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})

describe('website /api/table-bookings proxy — walk-in launch sanitisation', () => {
  it('silently strips inbound sunday_lunch=true (does not error, does not forward)', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        first_name: 'Hostile',
        last_name: 'Client',
        date: '2026-05-24',
        time: '13:00',
        party_size: 4,
        purpose: 'food',
        sunday_lunch: true
      }) as any
    )

    expect(res.status).toBe(201)
    expect(calls).toHaveLength(1)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.sunday_lunch).toBeUndefined()
    expect(forwarded.booking_type).toBe('regular')
    expect(forwarded.purpose).toBe('food')
  })

  it('silently strips inbound booking_type=sunday_lunch and forwards regular', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-24',
        time: '13:00',
        party_size: 2,
        purpose: 'food',
        booking_type: 'sunday_lunch'
      }) as any
    )

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.booking_type).toBe('regular')
    expect(forwarded.sunday_lunch).toBeUndefined()
  })

  it('silently strips both fields when both are present (defence in depth)', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-24',
        time: '13:00',
        party_size: 6,
        purpose: 'food',
        booking_type: 'sunday_lunch',
        sunday_lunch: true,
        menu_selections: [{ menu_dish_id: 'roast', quantity: 1 }]
      }) as any
    )

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.booking_type).toBe('regular')
    expect(forwarded.sunday_lunch).toBeUndefined()
    expect(forwarded.menu_selections).toBeUndefined()
    expect(forwarded.sunday_preorder_items).toBeUndefined()
  })

  it('always forwards booking_type=regular, even when inbound payload omits booking_type', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-24',
        time: '13:00',
        party_size: 2,
        purpose: 'food'
      }) as any
    )

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.booking_type).toBe('regular')
  })

  it('does NOT enforce a Sunday-lunch Saturday-1pm cutoff (cutoff retired)', async () => {
    // Pretend it's Saturday 14:00 — the legacy cutoff would have rejected
    // a Sunday booking made after 13:00. Walk-in launch removes that gate.
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-05-23T14:00:00.000+01:00'))

    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-24', // Sunday
        time: '13:00',
        party_size: 2,
        purpose: 'food'
      }) as any
    )

    expect(res.status).toBe(201)
    expect(calls).toHaveLength(1)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.booking_type).toBe('regular')
  })

  it('forwards purpose=drinks unchanged', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-22',
        time: '20:30',
        party_size: 2,
        purpose: 'drinks'
      }) as any
    )

    expect(res.status).toBe(201)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.purpose).toBe('drinks')
    expect(forwarded.booking_type).toBe('regular')
  })

  it('rejects a food booking outside kitchen hours with neutral customer-facing copy', async () => {
    // Direct API submission for purpose=food at 22:30, after kitchen close (21:00).
    // Validation must still block — copy must not mention food/drinks/kitchen/bar.
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(
      buildRequest({
        phone: '07700900000',
        date: '2026-05-22',
        time: '22:30',
        party_size: 2,
        purpose: 'food'
      }) as any
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    const errorText: string = String(body.error)
    expect(errorText).toMatch(/outside online booking hours/i)
    const lowerError = errorText.toLowerCase()
    expect(lowerError).not.toContain('food booking')
    expect(lowerError).not.toContain('switch to drinks')
    expect(lowerError).not.toContain('drinks-only')
    expect(lowerError).not.toContain('kitchen hours')
    expect(lowerError).not.toContain('bar hours')
    // Must not have reached the management API
    expect(calls).toHaveLength(0)
  })
})
