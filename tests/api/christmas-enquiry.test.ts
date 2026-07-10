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
    expect(forwarded.notes).toContain('Sit-down Christmas lunch (pre-order only)')
    expect(forwarded.notes).toContain('Website CTA source: hero_meal')
  })

  it('uses Graph email only when the management API fails', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ error: 'unavailable' }, 500))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))

    const response = await post(validPayload({ mode: 'party', service: undefined, partyFormat: 'private_space' }))
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true, delivery: 'email_fallback' })
    expect(global.fetch).toHaveBeenCalledTimes(3)

    const [sendUrl, sendInit] = (global.fetch as jest.Mock).mock.calls[2]
    expect(sendUrl).toContain('/sendMail')
    const email = JSON.parse(String(sendInit.body))
    expect(email.message.subject).toContain('Christmas party enquiry')
    expect(email.message.body.content).toContain('Private space')
  })

  it.each([
    ['invalid meal service', { service: 'brunch' }],
    ['invalid party style', { mode: 'party', service: undefined, partyFormat: 'anything' }],
    ['meal over capacity', { partySize: '61' }],
    ['buffet below minimum', { mode: 'party', service: undefined, partyFormat: 'festive_buffet', partySize: '25' }],
    ['date outside season', { preferredDate: '2026-12-24' }],
    ['invalid time', { preferredTime: 'lunchtime' }],
  ])('rejects %s before delivery', async (_label, overrides) => {
    const response = await post(validPayload(overrides))

    expect(response.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('keeps legacy dinner submissions compatible during rollout', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ success: true }, 201))

    const response = await post(validPayload({ mode: 'dinner', service: undefined, preferredTime: '6:30 pm' }))

    expect(response.status).toBe(200)
    const forwarded = JSON.parse(String((global.fetch as jest.Mock).mock.calls[0][1].body))
    expect(forwarded.preferredTime).toBe('18:30')
    expect(forwarded.notes).toContain('Sit-down Christmas dinner (pre-order only)')
  })
})
