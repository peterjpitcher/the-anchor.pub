/**
 * A1 regression: verify the website's /api/table-bookings proxy:
 *   1. Forwards customer name + email as top-level structured fields
 *      (not buried in a notes blob) for BOTH form shapes.
 *   2. Forwards dietary_requirements and allergies as arrays.
 *   3. Transforms menu_selections into aggregated sunday_preorder_items keyed
 *      by menu_dish_id.
 *   4. Leaves `notes` as just the user's free-text (plus a kitchen-side
 *      fallback summary so the kitchen isn't blind if the structured path
 *      fails downstream).
 */

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://example.invalid/api',
}))

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: jest.fn().mockResolvedValue({}),
  },
}))

jest.mock('@/lib/table-booking-service-windows', () => ({
  resolveServiceRanges: () => ({ closed: false, ranges: [{ start: '12:00', end: '17:00' }] }),
  isTimeWithinRanges: () => true,
  normalizeTime: (t: string) => (t.length === 5 ? `${t}:00` : t),
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false }),
}))

jest.mock('@/lib/sunday-lunch-cutoff', () => ({
  getSundayLunchCutoffDate: () => '2099-01-01',
  hasSundayLunchCutoffPassed: () => false,
  isSundayIsoDate: () => true,
}))

jest.mock('@/lib/upstream-json', () => ({
  getSafeUpstreamErrorMessage: () => 'upstream error',
  safeJsonParse: (t: string) => {
    try {
      return JSON.parse(t)
    } catch {
      return null
    }
  },
}))

jest.mock('@/lib/error-handling', () => ({
  createApiErrorResponse: (message: string, status: number) =>
    new Response(JSON.stringify({ success: false, error: message }), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  logError: jest.fn(),
}))

const originalEnv = process.env

beforeAll(() => {
  process.env = { ...originalEnv, ANCHOR_API_KEY: 'test-key' }
})

afterAll(() => {
  process.env = originalEnv
})

function buildRequest(body: unknown): Request {
  return new Request('http://localhost/api/table-bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
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
      JSON.stringify({ success: true, data: { state: 'pending_payment' } }),
      { status: 201, headers: { 'content-type': 'application/json' } },
    )
  })
  return calls
}

describe('website /api/table-bookings proxy — structured field forwarding', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('forwards structured fields from the legacy SundayLunchBookingForm shape (nested customer{})', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const body = {
      booking_type: 'sunday_lunch',
      date: '2026-04-26',
      time: '13:00',
      party_size: 2,
      customer: {
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@example.com',
        mobile_number: '+447000000000',
      },
      special_requirements: 'Anniversary',
      dietary_requirements: ['vegetarian'],
      allergies: ['nuts'],
      menu_selections: [
        {
          menu_dish_id: '11111111-1111-4111-8111-111111111111',
          custom_item_name: 'Roasted Chicken',
          item_type: 'main',
          quantity: 1,
          guest_name: 'Guest 1',
          price_at_booking: 19,
        },
        {
          menu_dish_id: '11111111-1111-4111-8111-111111111111',
          custom_item_name: 'Roasted Chicken',
          item_type: 'main',
          quantity: 1,
          guest_name: 'Guest 2',
          price_at_booking: 19,
        },
        {
          menu_dish_id: '22222222-2222-4222-8222-222222222222',
          custom_item_name: 'Cauliflower Cheese',
          item_type: 'side',
          quantity: 2,
          guest_name: 'Table',
          price_at_booking: 4,
        },
      ],
      source: 'website',
    }

    const res = await POST(buildRequest(body) as any)
    expect(res.status).toBe(201)

    expect(calls).toHaveLength(1)
    const forwarded = JSON.parse(String(calls[0].init.body))

    expect(forwarded.phone).toBe('+447000000000')
    expect(forwarded.first_name).toBe('Alice')
    expect(forwarded.last_name).toBe('Smith')
    expect(forwarded.email).toBe('alice@example.com')
    expect(forwarded.sunday_lunch).toBe(true)
    expect(forwarded.purpose).toBe('food')
    expect(forwarded.dietary_requirements).toEqual(['vegetarian'])
    expect(forwarded.allergies).toEqual(['nuts'])

    // Pre-order items aggregated by menu_dish_id
    expect(forwarded.sunday_preorder_items).toEqual(
      expect.arrayContaining([
        { menu_dish_id: '11111111-1111-4111-8111-111111111111', quantity: 2 },
        { menu_dish_id: '22222222-2222-4222-8222-222222222222', quantity: 2 },
      ]),
    )

    // Notes holds the user's typed text, not a big blob
    expect(forwarded.notes).toContain('Anniversary')
    expect(forwarded.notes).not.toContain('Name:')
    expect(forwarded.notes).not.toContain('Email:')
    expect(forwarded.notes).not.toContain('Dietary requirements:')
  })

  it('forwards structured fields from the management form shape (top-level fields)', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const body = {
      phone: '+447000000000',
      first_name: 'Bob',
      last_name: 'Jones',
      email: 'bob@example.com',
      date: '2026-04-26',
      time: '13:00',
      party_size: 3,
      purpose: 'food',
      sunday_lunch: true,
      notes: 'High chair please',
      menu_selections: [
        {
          menu_dish_id: '33333333-3333-4333-8333-333333333333',
          custom_item_name: 'Pork Belly',
          item_type: 'main',
          quantity: 1,
          guest_name: 'Guest 1',
          price_at_booking: 19,
        },
      ],
    }

    const res = await POST(buildRequest(body) as any)
    expect(res.status).toBe(201)

    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.first_name).toBe('Bob')
    expect(forwarded.last_name).toBe('Jones')
    expect(forwarded.email).toBe('bob@example.com')
    expect(forwarded.sunday_preorder_items).toEqual([
      { menu_dish_id: '33333333-3333-4333-8333-333333333333', quantity: 1 },
    ])
    expect(forwarded.notes).toContain('High chair please')
  })

  it('omits sunday_preorder_items when menu_selections have no menu_dish_id', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const body = {
      booking_type: 'sunday_lunch',
      date: '2026-04-26',
      time: '13:00',
      party_size: 2,
      customer: { mobile_number: '+447000000000' },
      menu_selections: [
        {
          custom_item_name: 'Roasted Chicken',
          item_type: 'main',
          quantity: 1,
          guest_name: 'Guest 1',
          price_at_booking: 19,
        },
      ],
    }

    const res = await POST(buildRequest(body) as any)
    expect(res.status).toBe(201)

    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.sunday_preorder_items).toBeUndefined()
    // Still a kitchen-side fallback in notes so service isn't blind
    expect(forwarded.notes ?? '').toContain('Roasted Chicken')
  })
})
