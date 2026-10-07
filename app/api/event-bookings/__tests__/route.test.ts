/**
 * Per-ticket attendee-name behaviour for the website /api/event-bookings proxy.
 *
 * - Paid and free events accept ticket quantities without attendee names.
 * - Optional attendee names are validated and forwarded for existing callers.
 * - A name count that does not match `seats`, or any blank name, is rejected 400.
 */

export {}

import { createHash } from 'node:crypto'

import { captureFailureLog, expectNoPersonalData, type CapturedFailureLog } from '@/tests/helpers/failure-log'

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
  it.each([undefined, []])('accepts a paid booking with optional names %p', async (attendeeNames) => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(buildRequest({ ...VALID_BASE, event_price: 5, attendee_names: attendeeNames }) as any)

    expect(res.status).toBe(201)
    expect(calls).toHaveLength(1)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.seats).toBe(2)
    expect(forwarded.attendee_names).toBeUndefined()
  })

  it('returns a visible failure when a quantity-only booking cannot reach management', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Management unavailable'))
    const POST = await getPostHandler()

    const res = await POST(buildRequest({ ...VALID_BASE, event_price: 5 }) as any)

    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({
      success: false,
      error: 'We could not process this event booking right now. Please call 01753 682707.'
    })
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
    // The fallback key hashes the whole payload. It used to be base64url(JSON)
    // truncated to 120 characters, which kept only the first 90 bytes.
    const expectedKey = `evt_${createHash('sha256').update(JSON.stringify({
      event_id: VALID_BASE.event_id,
      phone: VALID_BASE.phone,
      seats: VALID_BASE.seats,
      communication_consent: ''
    })).digest('hex')}`
    expect((calls[0].init.headers as Record<string, string>)['Idempotency-Key']).toBe(expectedKey)
  })
})

describe('website /api/event-bookings proxy, ticket_selections passthrough', () => {
  it.each([undefined, []])('forwards a quantity-only basket with optional names %p', async (attendeeNames) => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()
    const selections = [
      { ticket_type_id: 'type-adult', quantity: 2, ...(attendeeNames ? { attendee_names: attendeeNames } : {}) },
      { ticket_type_id: 'type-child', quantity: 1, ...(attendeeNames ? { attendee_names: attendeeNames } : {}) }
    ]

    const res = await POST(buildRequest({
      ...VALID_BASE,
      seats: 3,
      event_price: 5,
      ticket_selections: selections
    }) as any)

    expect(res.status).toBe(201)
    expect(calls).toHaveLength(1)
    const forwarded = JSON.parse(String(calls[0].init.body))
    expect(forwarded.ticket_selections).toEqual([
      { ticket_type_id: 'type-adult', quantity: 2 },
      { ticket_type_id: 'type-child', quantity: 1 }
    ])
    expect(forwarded.seats).toBe(3)
    expect(forwarded.attendee_names).toBeUndefined()
  })

  it.each([['Alice Booker', '   '], ['Alice Booker', 'B'.repeat(121)]])(
    'rejects invalid supplied selection names %p', async (...attendeeNames) => {
      const calls = installUpstreamFetch()
      const POST = await getPostHandler()
      const res = await POST(buildRequest({
        ...VALID_BASE,
        event_price: 5,
        ticket_selections: [{ ticket_type_id: 'type-adult', quantity: 2, attendee_names: attendeeNames }]
      }) as any)

      expect(res.status).toBe(400)
      expect(calls).toHaveLength(0)
    }
  )

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

describe('structured ticket holder details', () => {
  const attendees = [
    { id: '11111111-1111-4111-8111-111111111111', name: 'Alice', answers: { '33333333-3333-4333-8333-333333333333': 'no' } },
    { id: '22222222-2222-4222-8222-222222222222', name: 'Bob', answers: {} },
  ]
  it('forwards each named person and answers intact', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()
    const response = await POST(buildRequest({ ...VALID_BASE, attendees }) as any)
    expect(response.status).toBe(201)
    expect(JSON.parse(String(calls[0].init.body)).attendees).toEqual(attendees)
  })
  it('rejects missing people and duplicate identities without calling management', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()
    expect((await POST(buildRequest({ ...VALID_BASE, attendees: attendees.slice(0, 1) }) as any)).status).toBe(400)
    expect((await POST(buildRequest({ ...VALID_BASE, attendees: [attendees[0], attendees[0]] }) as any)).status).toBe(400)
    expect(calls).toHaveLength(0)
  })
})

/**
 * Upstream refusals were passed straight through to the guest with their
 * message and logged nowhere, so a refusal the guest could see was invisible
 * to us. Every booking that does not complete now leaves a log line with the
 * status, a code, the event id and the page it came from, and nothing the
 * guest typed.
 */
describe('refused and failed bookings are logged without personal data', () => {
  // The shared reporter is not mocked: these tests read the line it wrote.
  const EVENT_ID = '0b6f1c1e-6f6a-4c58-9a57-0d6d0c5d7f11'

  const GUEST = {
    ...VALID_BASE,
    event_id: EVENT_ID,
    email: 'alice.booker@example.com',
    event_slug: 'autumn-kick-off-quiz-night-2026-09-16',
    landing_path: '/whats-on'
  }

  /** The page the form was on, with the click ids a paid visit carries. */
  const REFERER = 'https://www.the-anchor.pub/events/autumn-kick-off-quiz-night-2026-09-16?utm_source=facebook&fbclid=fb-click-123'

  let log: CapturedFailureLog

  beforeEach(() => {
    log = captureFailureLog()
  })

  afterEach(() => {
    log.restore()
  })

  function buildRequestFromPage(body: unknown): Request {
    return new Request('http://localhost/api/event-bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json', referer: REFERER },
      body: JSON.stringify(body)
    })
  }

  function answerWith(status: number, body: unknown, contentType = 'application/json') {
    global.fetch = jest.fn(async () =>
      new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        status,
        headers: { 'content-type': contentType }
      })
    ) as unknown as typeof fetch
  }

  it.each([
    [
      'a 409 sales closed refusal',
      409,
      { success: false, error: { code: 'SALES_CLOSED', message: 'Online ticket sales for this event have closed.' } },
      { kind: 'refused', status: 409, upstreamCode: 'SALES_CLOSED' }
    ],
    [
      'a 409 for a ticket option that sold out',
      409,
      { success: false, error: { code: 'TICKET_TYPE_SOLD_OUT', message: 'One of the selected ticket options has sold out' } },
      { kind: 'refused', status: 409, upstreamCode: 'TICKET_TYPE_SOLD_OUT' }
    ],
    [
      'a blocked answer that arrives as a 200',
      200,
      { success: true, data: { state: 'blocked', reason: 'sold_out', booking_id: null } },
      { kind: 'refused', status: 200, upstreamCode: 'sold_out', state: 'blocked' }
    ],
    [
      'a full night offered the waitlist',
      200,
      { success: true, data: { state: 'full_with_waitlist_option', reason: 'insufficient_capacity', booking_id: null } },
      { kind: 'refused', status: 200, upstreamCode: 'insufficient_capacity', state: 'full_with_waitlist_option' }
    ],
    [
      'a management side 500',
      500,
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create event booking' } },
      { kind: 'failed', status: 500, upstreamCode: 'DATABASE_ERROR' }
    ]
  ])('logs %s with its status, code, event id and source', async (_label, status, body, expected) => {
    answerWith(status, body)
    const POST = await getPostHandler()

    const res = await POST(buildRequestFromPage(GUEST) as any)

    expect(res.status).toBe(status)
    expect(log.lines()).toHaveLength(1)
    expect(log.lines()[0]).toMatchObject({
      route: 'api/event-bookings',
      ...expected,
      eventId: EVENT_ID,
      page: '/events/autumn-kick-off-quiz-night-2026-09-16'
    })
  })

  it.each([
    [401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }, 'API key'],
    [403, { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, 'permissions'],
    [429, { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded' } }, 'Rate limit'],
    [500, { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 'Internal server error'],
    [503, { success: false, error: { code: 'AUTH_UNAVAILABLE', message: 'Authentication is temporarily unavailable' } }, 'Authentication']
  ])('answers a management %s with our sentence and the phone number, never its wording', async (status, body, upstreamWording) => {
    answerWith(status, body)
    const POST = await getPostHandler()

    const res = await POST(buildRequestFromPage(GUEST) as any)
    const answer = await res.json()

    expect(res.status).toBe(status)
    expect(answer.success).toBe(false)
    expect(JSON.stringify(answer)).not.toContain(upstreamWording)
    expect(answer.error.message).toContain('01753 682707')
    expect(log.lines()[0]).toMatchObject({ kind: 'failed', status })
  })

  it('keeps a sentence the management app wrote for the guest, and adds the phone number', async () => {
    answerWith(400, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Please enter a name for each ticket' } })
    const POST = await getPostHandler()

    const res = await POST(buildRequestFromPage(GUEST) as any)
    const answer = await res.json()

    expect(res.status).toBe(400)
    expect(answer.error.message).toBe('Please enter a name for each ticket. Call 01753 682707 if you need help.')
  })

  it('replaces a schema message with a sentence a guest can act on', async () => {
    answerWith(400, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Expected number, received string' } })
    const POST = await getPostHandler()

    const res = await POST(buildRequestFromPage(GUEST) as any)
    const answer = await res.json()

    expect(answer.error.message).not.toContain('Expected number')
    expect(answer.error.message).toContain('01753 682707')
  })

  it('logs an answer it cannot read as a failure', async () => {
    answerWith(502, '<!doctype html><html><body>Bad gateway</body></html>', 'text/html')
    const POST = await getPostHandler()

    const res = await POST(buildRequestFromPage(GUEST) as any)
    const answer = await res.json()

    expect(res.status).toBe(502)
    expect(answer.error.message).toContain('01753 682707')
    expect(log.lines()[0]).toMatchObject({ kind: 'failed', status: 502, reason: 'UNREADABLE_RESPONSE', eventId: EVENT_ID })
  })

  it('does not pass an unreadable 200 on as a booking', async () => {
    answerWith(200, '<!doctype html><html><body>ok</body></html>', 'text/html')
    const POST = await getPostHandler()

    const res = await POST(buildRequestFromPage(GUEST) as any)

    expect(res.status).toBe(502)
    expect(log.lines()[0]).toMatchObject({ kind: 'failed', status: 200, reason: 'UNREADABLE_RESPONSE' })
  })

  it('logs its own validation refusal by code, without the wording it gave the guest', async () => {
    const calls = installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(buildRequestFromPage({ ...GUEST, seats: 21 }) as any)

    expect(res.status).toBe(400)
    expect(calls).toHaveLength(0)
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', status: 400, reason: 'VALIDATION_ERROR', eventId: EVENT_ID })
  })

  it('falls back to the landing path when the request carries no referer', async () => {
    answerWith(409, { success: false, error: { code: 'SALES_CLOSED' } })
    const POST = await getPostHandler()

    await POST(buildRequest(GUEST) as any)

    expect(log.lines()[0]).toMatchObject({ page: '/whats-on' })
  })

  it('drops an event id that is not an id', async () => {
    answerWith(409, { success: false, error: { code: 'SALES_CLOSED' } })
    const POST = await getPostHandler()

    await POST(buildRequestFromPage({ ...GUEST, event_id: VALID_BASE.event_id }) as any)

    expect(log.lines()[0]).not.toHaveProperty('eventId')
  })

  it('never logs the phone number, the name, the email, the message or the click ids', async () => {
    const POST = await getPostHandler()
    const answers: Array<[number, unknown]> = [
      [409, { success: false, error: { code: 'POLICY_VIOLATION', message: 'Customer 07700900000 is blocked' } }],
      [409, { success: false, error: { code: 'SALES_CLOSED' } }],
      [200, { success: true, data: { state: 'blocked', reason: 'Alice Booker already holds a booking' } }],
      [422, { success: false, error: { code: 'VALIDATION_ERROR', message: 'alice.booker@example.com is not valid' } }],
      [500, { success: false, error: 'Database error for 07700900000' }]
    ]

    for (const [status, body] of answers) {
      answerWith(status, body)
      await POST(buildRequestFromPage(GUEST) as any)
    }

    expect(log.lines()).toHaveLength(answers.length)
    expectNoPersonalData(log.everything(), [
      '07700900000', 'Alice', 'Booker', 'alice.booker@example.com', 'fbclid', 'fb-click-123', 'utm_source'
    ])
    // A free-text reason is dropped rather than logged.
    expect(log.lines()[2]).toMatchObject({ state: 'blocked' })
    expect(log.lines()[2]).not.toHaveProperty('upstreamCode')
  })

  it('logs nothing for a confirmed booking', async () => {
    installUpstreamFetch()
    const POST = await getPostHandler()

    const res = await POST(buildRequestFromPage(GUEST) as any)

    expect(res.status).toBe(201)
    expect(log.lines()).toHaveLength(0)
  })

  it('reports a missing key and gives the guest the phone number', async () => {
    const previous = process.env.ANCHOR_API_KEY
    delete process.env.ANCHOR_API_KEY
    try {
      let POST: (request: Request) => Promise<Response>
      await jest.isolateModulesAsync(async () => {
        POST = (await import('@/app/api/event-bookings/route')).POST as never
      })

      const res = await POST!(buildRequestFromPage(GUEST))
      const answer = await res.json()

      expect(res.status).toBe(503)
      expect(answer.error).toContain('01753 682707')
      expect(log.lines()[0]).toMatchObject({ kind: 'failed', reason: 'API_KEY_MISSING' })
    } finally {
      process.env.ANCHOR_API_KEY = previous
    }
  })
})
