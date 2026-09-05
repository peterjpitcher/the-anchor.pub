export {}

const mockCheckSpamProtection = jest.fn(async () => ({ blocked: false, response: null }))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: mockCheckSpamProtection,
}))

if (typeof (Response as any).json !== 'function') {
  ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Owner-confirmed 21 July 2026: the window is 10 November to 20 December 2026,
// the 20th inclusive. Time is frozen inside the window so the 24 hour notice
// rule can be tested against a known "today" rather than the clock.
const FROZEN_TODAY = '2026-11-20'
const TOMORROW = '2026-11-21'

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    mode: 'meal',
    service: 'lunch',
    source: 'hero_meal',
    name: 'Test Guest',
    email: 'test@example.com',
    phone: '07700900000',
    partySize: '12',
    preferredDate: '2026-12-10',
    preferredTime: '12:30 pm',
    extras: [],
    perks: [],
    notes: 'Window seat if possible',
    ...overrides,
  }
}

async function post(payload: Record<string, unknown>) {
  const { POST } = await import('@/app/api/enquiry/christmas/route')
  return POST({ json: async () => payload } as any)
}

describe('POST /api/enquiry/christmas', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
    jest.setSystemTime(new Date(`${FROZEN_TODAY}T09:00:00Z`))
    process.env = {
      ...originalEnv,
      ANCHOR_API_BASE_URL: 'https://management.example.test/api',
      ANCHOR_API_KEY: 'management-key',
      MICROSOFT_TENANT_ID: 'tenant-id',
      MICROSOFT_CLIENT_ID: 'client-id',
      MICROSOFT_CLIENT_SECRET: 'client-secret',
      MICROSOFT_USER_EMAIL: 'bot@the-anchor.pub',
    }
    ;(global as any).fetch = jest.fn()
    mockCheckSpamProtection.mockClear()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('creates one management record with a normalised time and no duplicate Graph email', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ success: true }, 201))

    const response = await post(validPayload())
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true, delivery: 'management' })
    expect(global.fetch).toHaveBeenCalledTimes(1)

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('https://management.example.test/api/external/create-booking')
    expect(init.headers['X-API-Key']).toBe('management-key')
    const forwarded = JSON.parse(String(init.body))
    expect(forwarded.preferredTime).toBe('12:30')
    expect(forwarded.notes).toContain('Sit-down Christmas lunch')
    expect(forwarded.notes).toContain('Website CTA source: hero_meal')
    // Owner-confirmed 2026-08-04: courses are per person, so every sit-down
    // booking pre-orders and the answer no longer depends on a table-wide tier.
    expect(forwarded.notes).not.toMatch(/pre-order only/i)
    expect(forwarded.notes).toContain('Pre-order required: One course needs no pre-order. Two or three courses need a pre-order, chosen per person.')
    expect(forwarded.enquiryMode).toBe('meal')
    expect(forwarded.mealService).toBe('lunch')
    expect(forwarded.courseTier).toBe('undecided')
  })

  // The expected count is a guide; the staff summary retains the per-person exemption.
  it.each([
    ['one_course', 'Sit-down Christmas lunch (Mostly 1 course per guest)'],
    ['two_course', 'Sit-down Christmas lunch (Mostly 2 courses per guest)'],
    ['three_course', 'Sit-down Christmas lunch (Mostly 3 courses per guest)'],
  ])('describes %s as a per-guest expectation, and states the per-person pre-order rule', async (courseTier, label) => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ success: true }, 201))

    const response = await post(validPayload({ courseTier }))

    expect(response.status).toBe(200)
    const forwarded = JSON.parse(String((global.fetch as jest.Mock).mock.calls[0][1].body))
    expect(forwarded.courseTier).toBe(courseTier)
    expect(forwarded.notes).toContain(label)
    expect(forwarded.notes).toContain('Pre-order required: One course needs no pre-order. Two or three courses need a pre-order, chosen per person.')
    // Avoid the retired blanket wording.
    expect(forwarded.notes).not.toMatch(/pre-book only/i)
  })

  it('retries a transient management failure under one idempotency key, then succeeds without email', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ error: 'blip' }, 500))
      .mockResolvedValueOnce(jsonResponse({ success: true }, 201))

    const responsePromise = post(validPayload({ mode: 'party', service: undefined, partyFormat: 'buffet_party', partySize: '35' }))
    await jest.runAllTimersAsync()
    const response = await responsePromise
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true, delivery: 'management' })
    // Two management calls, no Graph token, no email.
    expect(global.fetch).toHaveBeenCalledTimes(2)

    const calls = (global.fetch as jest.Mock).mock.calls
    expect(calls[0][0]).toBe('https://management.example.test/api/external/create-booking')
    expect(calls[1][0]).toBe('https://management.example.test/api/external/create-booking')
    // The whole point of the key: both attempts carry the SAME one, so the
    // management side can never create two bookings from one submission.
    const keyA = calls[0][1].headers['Idempotency-Key']
    const keyB = calls[1][1].headers['Idempotency-Key']
    expect(keyA).toBeTruthy()
    expect(keyA).toBe(keyB)

    const forwarded = JSON.parse(String(calls[1][1].body))
    expect(forwarded.notes).toContain('Standing party with festive buffet (30+)')
  })

  it('does not retry a validation rejection from the management API', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ error: 'bad payload' }, 400))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))

    const responsePromise = post(validPayload())
    await jest.runAllTimersAsync()
    const response = await responsePromise
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true, delivery: 'email_fallback' })
    // One management call only: a 400 cannot heal on retry.
    const managementCalls = (global.fetch as jest.Mock).mock.calls
      .filter(([url]) => String(url).includes('/external/create-booking'))
    expect(managementCalls).toHaveLength(1)
  })

  it('falls back to an unmissable ACTION NEEDED email when every retry fails', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ error: 'down' }, 500))
      .mockResolvedValueOnce(jsonResponse({ error: 'down' }, 500))
      .mockResolvedValueOnce(jsonResponse({ error: 'down' }, 500))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))

    const responsePromise = post(validPayload({ mode: 'party', service: undefined, partyFormat: 'private_space' }))
    await jest.runAllTimersAsync()
    const response = await responsePromise
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true, delivery: 'email_fallback' })
    // Three management attempts, then token, then send.
    expect(global.fetch).toHaveBeenCalledTimes(5)

    const managementCalls = (global.fetch as jest.Mock).mock.calls.slice(0, 3)
    const keys = new Set(managementCalls.map(([, init]) => init.headers['Idempotency-Key']))
    expect(keys.size).toBe(1)

    const [sendUrl, sendInit] = (global.fetch as jest.Mock).mock.calls[4]
    expect(sendUrl).toContain('/sendMail')
    const email = JSON.parse(String(sendInit.body))
    // The email must say plainly that it is the only record of the enquiry.
    expect(email.message.subject).toContain('ACTION NEEDED')
    expect(email.message.subject).toContain('Christmas party enquiry')
    expect(email.message.body.content).toMatch(/not in the management system/i)
    expect(email.message.body.content).toContain('HTTP 500')
    // Legacy party format from a cached bundle still labels correctly.
    expect(email.message.body.content).toContain('Private space')
  })

  it.each([
    ['invalid meal service', { service: 'brunch' }],
    ['invalid party style', { mode: 'party', service: undefined, partyFormat: 'anything' }],
    ['a discontinued shared party night', { mode: 'party', service: undefined, partyFormat: 'shared_party' }],
    ['an invalid course tier', { courseTier: 'four_course' }],
    ['meal over capacity', { partySize: '61' }],
    ['a meal below the 6 guest minimum', { partySize: '5' }],
    ['a buffet below the 30 guest minimum', { mode: 'party', service: undefined, partyFormat: 'buffet_party', partySize: '29' }],
    ['a legacy-valued buffet below the 30 guest minimum', { mode: 'party', service: undefined, partyFormat: 'festive_buffet', partySize: '29' }],
    ['a party-style sit-down dinner above the 60 seat capacity', { mode: 'party', service: undefined, partyFormat: 'sit_down_dinner', partySize: '61' }],
    ['a date after the window closes', { preferredDate: '2026-12-21' }],
    ['a date before the window opens', { preferredDate: '2026-11-09' }],
    ['today, which breaks the 24 hour notice rule', { preferredDate: FROZEN_TODAY }],
    ['invalid time', { preferredTime: 'lunchtime' }],
  ])('rejects %s before delivery', async (_label, overrides) => {
    const response = await post(validPayload(overrides))

    expect(response.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it.each([
    ['the 6 guest minimum exactly', { partySize: '6' }],
    ['the 30 guest buffet minimum exactly', { mode: 'party', service: undefined, partyFormat: 'buffet_party', partySize: '30' }],
    ['a drinks-only party at the 6 guest minimum', { mode: 'party', service: undefined, partyFormat: 'drinks_party', partySize: '6' }],
    ['a party-style sit-down dinner at the 60 seat capacity', { mode: 'party', service: undefined, partyFormat: 'sit_down_dinner', partySize: '60' }],
    ['a party with no style chosen yet', { mode: 'party', service: undefined, partyFormat: undefined }],
    ['tomorrow, the earliest date with 24 hours notice', { preferredDate: TOMORROW }],
    ['20 December, the last day of the window', { preferredDate: '2026-12-20' }],
  ])('accepts %s', async (_label, overrides) => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ success: true }, 201))

    const response = await post(validPayload(overrides))

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('explains the 24 hour notice rule when a same-day date is sent', async () => {
    const response = await post(validPayload({ preferredDate: FROZEN_TODAY }))
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toContain('at least 24 hours notice')
    expect(result.error).toContain(TOMORROW)
  })

  it('keeps legacy dinner submissions compatible during rollout', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ success: true }, 201))

    const response = await post(validPayload({ mode: 'dinner', service: undefined, preferredTime: '6:30 pm' }))

    expect(response.status).toBe(200)
    const forwarded = JSON.parse(String((global.fetch as jest.Mock).mock.calls[0][1].body))
    expect(forwarded.preferredTime).toBe('18:30')
    expect(forwarded.notes).toContain('Sit-down Christmas dinner')
    expect(forwarded.notes).not.toMatch(/pre-order only/i)
    expect(forwarded.enquiryMode).toBe('meal')
    expect(forwarded.mealService).toBe('dinner')
  })
})
