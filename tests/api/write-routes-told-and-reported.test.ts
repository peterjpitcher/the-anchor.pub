import { captureFailureLog, expectNoPersonalData, type CapturedFailureLog } from '@/tests/helpers/failure-log'

/**
 * "With the booking system switched off in a test, each form shows the phone
 * number and one alert is recorded." (site review 7 October 2026, P04)
 *
 * One file for every public write route, so the rule is checked the same way
 * for all of them. For each route there is a happy path and a failing
 * dependency, and the failing one asserts three things:
 *
 *   1. the guest gets an error status and 01753 682707, and never the booking
 *      system's own wording;
 *   2. the shared reporter writes its line and sends ONE alert email;
 *   3. neither the line nor the email carries the guest's name, phone number,
 *      email address, number plate, booking id or booking reference.
 *
 * The reporter itself is not mocked: what is read is the line it really wrote.
 * The only things mocked are the outside world (fetch, the mail sender, the
 * API client) so that nothing here can book, charge or email anybody.
 */

// ── The outside world ───────────────────────────────────────────────────────

const mockSendAlertEmail = jest.fn()
jest.mock('@/lib/microsoft-graph-mail', () => ({
  sendMicrosoftGraphEmail: (...args: unknown[]) => mockSendAlertEmail(...args),
  escapeHtml: (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}))

const mockSendEnquiryFallbackEmail = jest.fn()
jest.mock('@/lib/enquiry-fallback-email', () => ({
  sendEnquiryFallbackEmail: (...args: unknown[]) => mockSendEnquiryFallbackEmail(...args),
  escapeHtml: (text: string) => text
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn(async () => ({ blocked: false }))
}))

jest.mock('@/lib/booking-conversion-forwarding', () => ({
  forwardBookingConversionToCheersAI: jest.fn(async () => undefined)
}))

const mockGetBusinessHours = jest.fn()
const mockCreateParkingBooking = jest.fn()
const mockCreateParkingPaymentOrder = jest.fn()
const mockCaptureParkingPayment = jest.fn()
jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    createParkingBooking: (...args: unknown[]) => mockCreateParkingBooking(...args),
    createParkingPaymentOrder: (...args: unknown[]) => mockCreateParkingPaymentOrder(...args),
    captureParkingPayment: (...args: unknown[]) => mockCaptureParkingPayment(...args)
  }
}))

if (typeof (Response as any).json !== 'function') {
  ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...((init?.headers as Record<string, string>) || {}) }
    })
}

// ── Fixtures ────────────────────────────────────────────────────────────────

const PHONE_NUMBER = '01753 682707'

const GUEST = {
  first: 'Alice',
  last: 'Booker',
  phone: '07700900123',
  email: 'alice.booker@example.com',
  plate: 'AB12 CDE',
  reference: 'TB-2026-0042'
}
const BOOKING_ID = '550e8400-e29b-41d4-a716-446655440000'
const PAYPAL_ORDER_ID = 'PAYPAL-ORDER-9X7'
const EVENT_ID = '0b6f1c1e-6f6a-4c58-9a57-0d6d0c5d7f11'

/** Nothing in this list may appear in a log line or an alert email. */
const PERSONAL = [
  GUEST.first,
  GUEST.last,
  GUEST.phone,
  '+447700900123',
  GUEST.email,
  GUEST.plate,
  GUEST.reference,
  BOOKING_ID,
  PAYPAL_ORDER_ID
]

/** The booking system's own wording. None of it may reach the guest. */
const DEVELOPER_WORDING = [
  'Invalid or missing API key',
  'Insufficient permissions',
  'Rate limit exceeded',
  'Internal server error',
  'Database error',
  'upstream exploded',
  'Bad gateway',
  'customer_conflict',
  'hold_expired',
  'Microsoft',
  'fetch failed'
]

/** A 500 that repeats everything the guest typed, as a real fault well might. */
const ECHOING_500 = () =>
  json(
    {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: `Database error saving ${GUEST.first} ${GUEST.last} ${GUEST.phone} ${GUEST.email} ${GUEST.plate} ${GUEST.reference} ${BOOKING_ID}`
      }
    },
    500
  )

const UNAUTHORISED = () => json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }, 401)
const GATEWAY_PAGE = (status: number) =>
  new Response('<!doctype html><html><body>Bad gateway</body></html>', { status, headers: { 'Content-Type': 'text/html' } })

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const REFERER = `https://www.the-anchor.pub/book-table?fbclid=click-123&phone=${GUEST.phone}`

function jsonRequest(body: unknown, headers: Record<string, string> = {}) {
  return {
    json: async () => body,
    headers: new Headers({ 'content-type': 'application/json', referer: REFERER, ...headers }),
    url: 'http://localhost/api/test'
  } as never
}

function formRequest(form: FormData) {
  return {
    formData: async () => form,
    headers: new Headers({ referer: 'https://www.the-anchor.pub/join-our-team' }),
    url: 'http://localhost/api/test'
  } as never
}

const OPEN_HOURS = {
  regularHours: {
    tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } }
  },
  specialHours: []
}

// ── Harness ─────────────────────────────────────────────────────────────────

type Management = (url: string, init: RequestInit) => Response | Promise<Response>

/** What the management app answers. Graph calls are answered separately. */
let management: Management
/** Whether the enquiry routes' own fallback email (sent through fetch) works. */
let graphWorks = true
let managementCalls: Array<{ url: string; init: RequestInit }>

const ORIGINAL_ENV = process.env
let log: CapturedFailureLog

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
  process.env = {
    ...ORIGINAL_ENV,
    // Alerts go out from the live site only, so the tests stand in for it.
    VERCEL_ENV: 'production',
    ANCHOR_API_KEY: 'test-key',
    ANCHOR_API_BASE_URL: 'https://management.example.test/api',
    MICROSOFT_TENANT_ID: 'tenant',
    MICROSOFT_CLIENT_ID: 'client',
    MICROSOFT_CLIENT_SECRET: 'secret',
    MICROSOFT_USER_EMAIL: 'bot@the-anchor.pub',
    RECRUITMENT_PROXY_RETRY_DELAY_MS: '0'
  }
  graphWorks = true
  managementCalls = []
  management = () => json({ success: true })
  mockSendAlertEmail.mockResolvedValue(undefined)
  mockSendEnquiryFallbackEmail.mockResolvedValue({ sent: true })
  mockGetBusinessHours.mockResolvedValue(OPEN_HOURS)

  ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('login.microsoftonline.com')) {
      return graphWorks ? json({ access_token: 'graph-token' }) : json({ error: 'invalid_client', error_description: 'Microsoft says no' }, 401)
    }
    if (url.includes('graph.microsoft.com')) {
      return graphWorks ? new Response(null, { status: 202 }) : json({ error: { code: 'ErrorAccessDenied' } }, 403)
    }
    managementCalls.push({ url, init: init ?? {} })
    return management(url, init ?? {})
  })

  log = captureFailureLog()
})

afterEach(() => {
  log.restore()
  process.env = ORIGINAL_ENV
  jest.useRealTimers()
})

async function read(response: Response): Promise<{ status: number; text: string; body: any }> {
  const text = await response.text()
  let body: any = null
  try {
    body = JSON.parse(text)
  } catch {
    body = null
  }
  return { status: response.status, text, body }
}

function expectGuestTold(answer: { status: number; text: string }) {
  expect(answer.status).toBeGreaterThanOrEqual(400)
  expect(answer.text).toContain(PHONE_NUMBER)
  for (const wording of DEVELOPER_WORDING) expect(answer.text).not.toContain(wording)
  // Whatever shape `error` takes, the thing a form prints is a string.
  expect(answer.text).not.toContain('[object Object]')
}

function expectReported(route: string, options: { payment?: boolean } = {}) {
  const failed = log.lines().filter((line) => line.kind === 'failed')
  expect(failed.length).toBeGreaterThanOrEqual(1)
  for (const line of failed) expect(line.route).toBe(route)
  expect(failed[0].payment).toBe(options.payment === true)

  // No personal data in anything that was logged, whoever logged it.
  expectNoPersonalData(log.everything(), PERSONAL)
  expect(log.everything()).not.toContain('click-123')

  // One alert, to the manager, with no personal data either.
  expect(mockSendAlertEmail).toHaveBeenCalledTimes(1)
  const email = mockSendAlertEmail.mock.calls[0][0]
  expect(email.to).toBe('manager@the-anchor.pub')
  expect(email.subject).toContain('ACTION NEEDED')
  if (options.payment) expect(email.subject).toContain('a payment failed')
  expectNoPersonalData(JSON.stringify(email), PERSONAL)
  expect(JSON.stringify(email)).not.toMatch(/undefined|Invalid Date|NaN/)
}

function expectNothingReported() {
  expect(log.lines()).toHaveLength(0)
  expect(mockSendAlertEmail).not.toHaveBeenCalled()
}

// ── Table bookings ──────────────────────────────────────────────────────────

describe('POST /api/table-bookings', () => {
  // 2026-08-04 is a Tuesday, inside both bar and kitchen hours.
  const BODY = {
    phone: GUEST.phone,
    first_name: GUEST.first,
    last_name: GUEST.last,
    email: GUEST.email,
    date: '2026-08-04',
    time: '19:00',
    party_size: 2,
    purpose: 'food',
    notes: `Call ${GUEST.first} on ${GUEST.phone}`
  }

  async function post() {
    const { POST } = await import('@/app/api/table-bookings/route')
    return read(await POST(jsonRequest(BODY)))
  }

  it('books a table and reports nothing', async () => {
    management = () => json({ success: true, data: { state: 'confirmed', booking_reference: GUEST.reference } }, 201)

    const answer = await post()

    expect(answer.status).toBe(201)
    expect(answer.body.data.state).toBe('confirmed')
    expectNothingReported()
  })

  it.each<[string, () => Response | Promise<Response>, number]>([
    ['never answers', () => Promise.reject(new TypeError('fetch failed')), 503],
    ['answers 500 with JSON', ECHOING_500, 500],
    ['answers 500 with a gateway page', () => GATEWAY_PAGE(500), 500],
    ['answers 502 with a gateway page', () => GATEWAY_PAGE(502), 502],
    ['rejects the website key (401)', UNAUTHORISED, 401],
    ['lacks permission (403)', () => json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, 403), 403],
    ['runs out of allowance on our key (429)', () => json({ success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded' } }, 429), 429],
    ['answers 200 with a body nobody can read', () => GATEWAY_PAGE(200), 502],
    ['answers 200 with success false', () => json({ success: false, error: 'Database error' }), 502],
    ['answers 200 with no booking state', () => json({ success: true, data: { booking_reference: GUEST.reference } }), 502]
  ])('tells the guest and reports it when the booking system %s', async (_label, upstream, status) => {
    management = upstream

    const answer = await post()

    expect(answer.status).toBe(status)
    expect(answer.body.success).not.toBe(true)
    expectGuestTold(answer)
    expectReported('api/table-bookings')
  })

  it('tells the guest and reports it when the service hours cannot be read', async () => {
    mockGetBusinessHours.mockRejectedValue(Object.assign(new Error(`Hours failed for ${GUEST.email}`), { status: 503, code: 'SERVICE_UNAVAILABLE' }))

    const answer = await post()

    expect(answer.status).toBe(503)
    expectGuestTold(answer)
    expect(managementCalls).toHaveLength(0)
    expectReported('api/table-bookings')
    expect(log.lines()[0]).toMatchObject({ reason: 'SERVICE_HOURS_CHECK_FAILED', status: 503 })
  })

  it('tells the guest and reports it when the key is missing, without calling anything', async () => {
    delete process.env.ANCHOR_API_KEY

    const answer = await post()

    expect(answer.status).toBe(503)
    expectGuestTold(answer)
    expect(global.fetch).not.toHaveBeenCalled()
    expectReported('api/table-bookings')
    expect(log.lines()[0]).toMatchObject({ reason: 'API_KEY_MISSING', status: null })
  })

  it('logs a refusal the guest can see (200, blocked) and alerts nobody', async () => {
    management = () =>
      json({ success: true, data: { state: 'blocked', blocked_reason: 'no_table', reason: `No table for ${GUEST.first} ${GUEST.last}` } })

    const answer = await post()

    // The body goes back as it is: the form has wording for each reason.
    expect(answer.status).toBe(200)
    expect(answer.body.data.blocked_reason).toBe('no_table')
    expect(log.lines()).toEqual([
      expect.objectContaining({ route: 'api/table-bookings', kind: 'refused', state: 'blocked', upstreamCode: 'no_table', alert: 'none' })
    ])
    expect(mockSendAlertEmail).not.toHaveBeenCalled()
    expectNoPersonalData(log.everything(), PERSONAL)
  })

  it('keeps a sentence the management app wrote for the guest (the per-phone limit)', async () => {
    const sentence = 'Too many booking attempts for this phone number. Please try again later or call us on 01753 682707.'
    management = () => json({ success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: sentence } }, 429)

    const answer = await post()

    expect(answer.status).toBe(429)
    expect(answer.body.error.message).toBe(sentence)
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', alert: 'none' })
    expect(mockSendAlertEmail).not.toHaveBeenCalled()
  })

  it('sends one alert for a run of failures, and logs every one', async () => {
    management = ECHOING_500
    const { POST } = await import('@/app/api/table-bookings/route')

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await POST(jsonRequest(BODY))
    }

    expect(log.lines()).toHaveLength(5)
    expect(mockSendAlertEmail).toHaveBeenCalledTimes(1)
  })

  it('still answers the guest properly when the alert email itself cannot be sent', async () => {
    management = ECHOING_500
    mockSendAlertEmail.mockRejectedValue(new Error('Microsoft Graph is down'))

    const answer = await post()

    expect(answer.status).toBe(500)
    expectGuestTold(answer)
    expect(log.lines()).toHaveLength(1)
    expect(log.alertLines()).toEqual([expect.objectContaining({ route: 'api/table-bookings', emailed: false })])
  })

  describe('recovering an earlier attempt (replay only)', () => {
    const FIXTURE_ID = '3c9d1f0a-52b7-4e1c-8a54-2f1e7f1a9b10'

    async function replay() {
      const { POST } = await import('@/app/api/table-bookings/route')
      return read(
        await POST(jsonRequest({ ...BODY, fixture_id: FIXTURE_ID }, { 'X-Booking-Replay-Only': 'true', 'Idempotency-Key': 'key-1' }))
      )
    }

    it('keeps the "no previous attempt" code the form relies on, and alerts nobody', async () => {
      management = () => json({ success: false, error: { code: 'IDEMPOTENCY_KEY_NOT_FOUND', message: 'No previous booking attempt found' } }, 404)

      const answer = await replay()

      expect(answer.status).toBe(404)
      expect(answer.body.code).toBe('IDEMPOTENCY_KEY_NOT_FOUND')
      expect(answer.text).not.toContain('No previous booking attempt found')
      expect(answer.text).toContain(PHONE_NUMBER)
      expect(log.lines()[0]).toMatchObject({ kind: 'refused', alert: 'none' })
      expect(mockSendAlertEmail).not.toHaveBeenCalled()
    })

    it('tells the guest and reports it when the booking system fails', async () => {
      management = ECHOING_500

      const answer = await replay()

      expect(answer.status).toBe(500)
      expectGuestTold(answer)
      expectReported('api/table-bookings')
    })
  })
})

// ── Event bookings and the waitlist ─────────────────────────────────────────

describe('POST /api/event-bookings', () => {
  const BODY = { event_id: EVENT_ID, phone: GUEST.phone, first_name: GUEST.first, last_name: GUEST.last, email: GUEST.email, seats: 2 }

  async function post() {
    const { POST } = await import('@/app/api/event-bookings/route')
    return read(await POST(jsonRequest(BODY)))
  }

  it('books the seats and reports nothing', async () => {
    management = () => json({ success: true, data: { state: 'confirmed', booking_id: BOOKING_ID } }, 201)

    const answer = await post()

    expect(answer.status).toBe(201)
    expectNothingReported()
  })

  it.each<[string, () => Response | Promise<Response>, number]>([
    ['never answers', () => Promise.reject(new TypeError('fetch failed')), 503],
    ['answers 500', ECHOING_500, 500],
    ['rejects the website key (401)', UNAUTHORISED, 401],
    ['answers with a gateway page', () => GATEWAY_PAGE(502), 502]
  ])('tells the guest and reports it when the booking system %s', async (_label, upstream, status) => {
    management = upstream

    const answer = await post()

    expect(answer.status).toBe(status)
    expectGuestTold(answer)
    expectReported('api/event-bookings')
  })

  it('answers "you already have seats" in words, logged as a refusal', async () => {
    management = () => json({ success: true, data: { state: 'blocked', reason: 'customer_conflict', booking_id: null } })

    const answer = await post()

    // Passed through for the form, which maps the reason (see the mapper tests).
    expect(answer.status).toBe(200)
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', upstreamCode: 'customer_conflict', alert: 'none' })
    expect(mockSendAlertEmail).not.toHaveBeenCalled()
  })
})

describe('POST /api/event-waitlist', () => {
  const BODY = { event_id: EVENT_ID, phone: GUEST.phone, requested_seats: 2, first_name: GUEST.first, last_name: GUEST.last }

  async function post() {
    const { POST } = await import('@/app/api/event-waitlist/route')
    return read(await POST(jsonRequest(BODY)))
  }

  it('joins the waitlist and reports nothing', async () => {
    management = () => json({ success: true, data: { state: 'queued', position: 3 } })

    const answer = await post()

    expect(answer.status).toBe(200)
    expect(answer.body.data.state).toBe('queued')
    expectNothingReported()
  })

  it.each<[string, () => Response | Promise<Response>, number]>([
    ['never answers', () => Promise.reject(new TypeError('fetch failed')), 503],
    ['answers 500 with JSON', ECHOING_500, 500],
    ['answers 500 with plain text', () => new Response('upstream exploded', { status: 500 }), 500],
    ['rejects the website key (401)', UNAUTHORISED, 401],
    ['answers 200 with a gateway page', () => GATEWAY_PAGE(200), 502]
  ])('tells the guest and reports it when the booking system %s', async (_label, upstream, status) => {
    management = upstream

    const answer = await post()

    expect(answer.status).toBe(status)
    expectGuestTold(answer)
    expectReported('api/event-waitlist')
  })

  it('tells the guest and reports it when the key is missing', async () => {
    delete process.env.ANCHOR_API_KEY

    const answer = await post()

    expect(answer.status).toBe(503)
    expectGuestTold(answer)
    expectReported('api/event-waitlist')
  })

  it('turns a waitlist refusal code into a sentence', async () => {
    management = () => json({ success: false, error: { code: 'IDEMPOTENCY_KEY_IN_PROGRESS', message: 'This request is already being processed. Please retry shortly.' } }, 409)

    const answer = await post()

    expect(answer.status).toBe(409)
    expect(answer.body.error.message).toContain('still working on your first attempt')
    expect(answer.body.error.message).toContain(PHONE_NUMBER)
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', alert: 'none' })
  })
})

// ── Payments ────────────────────────────────────────────────────────────────

describe.each([
  {
    name: 'POST /api/table-bookings/paypal/create-order',
    route: 'api/table-bookings/paypal/create-order',
    load: () => import('@/app/api/table-bookings/paypal/create-order/route'),
    body: { bookingId: BOOKING_ID },
    happy: () => json({ orderId: PAYPAL_ORDER_ID }),
    happyCheck: (body: any) => expect(body.orderId).toBe(PAYPAL_ORDER_ID),
    incompleteOk: () => json({ success: true }),
    capture: false
  },
  {
    name: 'POST /api/table-bookings/paypal/capture-order',
    route: 'api/table-bookings/paypal/capture-order',
    load: () => import('@/app/api/table-bookings/paypal/capture-order/route'),
    body: { bookingId: BOOKING_ID, orderId: PAYPAL_ORDER_ID, bookingReference: GUEST.reference, email: GUEST.email, phone: GUEST.phone },
    happy: () => json({ success: true }),
    happyCheck: (body: any) => expect(body.success).toBe(true),
    incompleteOk: () => json({ success: false }),
    capture: true
  },
  {
    name: 'POST /api/event-bookings/paypal/create-order',
    route: 'api/event-bookings/paypal/create-order',
    load: () => import('@/app/api/event-bookings/paypal/create-order/route'),
    body: { bookingId: BOOKING_ID },
    happy: () => json({ orderId: PAYPAL_ORDER_ID }),
    happyCheck: (body: any) => expect(body.orderId).toBe(PAYPAL_ORDER_ID),
    incompleteOk: () => json({ success: true }),
    capture: false
  },
  {
    name: 'POST /api/event-bookings/paypal/capture-order',
    route: 'api/event-bookings/paypal/capture-order',
    load: () => import('@/app/api/event-bookings/paypal/capture-order/route'),
    body: { bookingId: BOOKING_ID, orderId: PAYPAL_ORDER_ID, email: GUEST.email, phone: GUEST.phone },
    happy: () => json({ success: true }),
    happyCheck: (body: any) => expect(body.success).toBe(true),
    incompleteOk: null,
    capture: true
  }
])('$name', ({ route, load, body, happy, happyCheck, incompleteOk, capture }) => {
  async function post() {
    const { POST } = await load()
    return read(await POST(jsonRequest(body)))
  }

  it('takes the payment step and reports nothing', async () => {
    management = happy

    const answer = await post()

    expect(answer.status).toBe(200)
    happyCheck(answer.body)
    expectNothingReported()
  })

  it.each<[string, () => Response | Promise<Response>]>([
    ['never answers', () => Promise.reject(new TypeError('fetch failed'))],
    ['answers 500', ECHOING_500],
    ['rejects the website key (401), with an object-shaped error', UNAUTHORISED],
    ['answers with a gateway page', () => GATEWAY_PAGE(502)],
    ['answers 200 with a gateway page', () => GATEWAY_PAGE(200)]
  ])('tells the guest and reports a payment failure when the booking system %s', async (_label, upstream) => {
    management = upstream

    const answer = await post()

    expectGuestTold(answer)
    // The forms render `error` directly, so it must be a string, never an object.
    expect(typeof answer.body.error).toBe('string')
    if (capture) expect(answer.body.error).toContain('before paying again')
    expectReported(route, { payment: true })
    expect(log.lines()[0]).toMatchObject({ payment: true })
    // The pub is texted through the management app: one request, two codes, no
    // guest details. The stand-in answers it the same way it answered the
    // payment, so in every case here the text fails too (a 200 that is only a gateway page
    // is not taken as a sent text), and the guest's answer
    // and the email above are unchanged by that.
    const textCalls = managementCalls.filter((call) => call.url.endsWith('/website/payment-failure-alert'))
    expect(textCalls).toHaveLength(1)
    expect(textCalls[0].init.method).toBe('POST')
    expect(Object.keys(JSON.parse(String(textCalls[0].init.body))).sort()).toEqual(['area', 'reason'])
    expectNoPersonalData(`${textCalls[0].url} ${String(textCalls[0].init.body)}`, PERSONAL)
    expect(log.alertLines()).toEqual([expect.objectContaining({ route, texted: false })])
    expect(log.lines()[0].refHash).toMatch(/^[0-9a-f]{12}$/)
  })

  it('tells the guest and reports it when the key is missing, without calling anything', async () => {
    delete process.env.ANCHOR_API_KEY

    const answer = await post()

    expect(answer.status).toBe(503)
    expectGuestTold(answer)
    expect(global.fetch).not.toHaveBeenCalled()
    expectReported(route, { payment: true })
  })

  if (incompleteOk) {
    it('does not pass a 200 that is not a payment on as one', async () => {
      management = incompleteOk

      const answer = await post()

      expect(answer.status).toBe(502)
      expectGuestTold(answer)
      expectReported(route, { payment: true })
    })
  }
})

// ── Private hire ────────────────────────────────────────────────────────────

describe.each([
  ['POST /api/public/private-booking', () => import('@/app/api/public/private-booking/route')],
  ['POST /api/private-booking-enquiry (the same handler)', () => import('@/app/api/private-booking-enquiry/route')]
])('%s', (_name, load) => {
  const BODY = {
    customer_first_name: GUEST.first,
    customer_last_name: GUEST.last,
    contact_phone: GUEST.phone,
    contact_email: GUEST.email,
    event_type: 'Milestone Birthday',
    event_date: '2026-11-14',
    start_time: '19:00',
    guest_count: 60,
    internal_notes: `Ring ${GUEST.first} on ${GUEST.phone}`
  }

  async function post() {
    const { POST } = await load()
    return read(await POST(jsonRequest(BODY)))
  }

  it('records the enquiry and reports nothing', async () => {
    management = () => json({ success: true, booking_id: 'pb-1', reference: 'PB-1', state: 'enquiry_created' }, 201)

    const answer = await post()

    expect(answer.status).toBe(200)
    expect(answer.body).toMatchObject({ success: true, state: 'enquiry_created' })
    expect(mockSendEnquiryFallbackEmail).not.toHaveBeenCalled()
    expectNothingReported()
  })

  it('emails the enquiry to the manager and reports the outage when the booking system rejects the key', async () => {
    management = UNAUTHORISED

    const answer = await post()

    // The lead reached a person, so the guest is told it arrived.
    expect(answer.status).toBe(200)
    expect(answer.body).toMatchObject({ success: true, state: 'enquiry_emailed' })
    expect(mockSendEnquiryFallbackEmail).toHaveBeenCalledTimes(1)
    expectReported('api/public/private-booking')
  })

  it('tells the guest and reports it when the booking system and the fallback email both fail', async () => {
    management = UNAUTHORISED
    mockSendEnquiryFallbackEmail.mockResolvedValue({ sent: false, error: `Microsoft rejected ${GUEST.email}` })

    const answer = await post()

    expect(answer.status).toBe(401)
    expect(answer.body.success).toBe(false)
    expectGuestTold(answer)
    expectReported('api/public/private-booking')
    expect(log.lines().map((line) => line.reason)).toEqual(['UPSTREAM_NOT_OK', 'ENQUIRY_LOST_FALLBACK_EMAIL_FAILED'])
  })

  it('emails the enquiry rather than dropping it when the key is missing', async () => {
    delete process.env.ANCHOR_API_KEY

    const answer = await post()

    expect(managementCalls).toHaveLength(0)
    expect(mockSendEnquiryFallbackEmail).toHaveBeenCalledTimes(1)
    expect(answer.body).toMatchObject({ success: true, state: 'enquiry_emailed' })
    expectReported('api/public/private-booking')
    expect(log.lines()[0]).toMatchObject({ reason: 'API_KEY_MISSING' })
  })

  it('shows the guest a detail they can correct (400), as a sentence with the number', async () => {
    management = () => json({ success: false, error: 'Please enter a valid email address' }, 400)

    const answer = await post()

    expect(answer.status).toBe(400)
    expect(answer.body.error.message).toBe('Please enter a valid email address. Call 01753 682707 if you need help.')
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', alert: 'none' })
    expect(mockSendAlertEmail).not.toHaveBeenCalled()
  })
})

// ── Job applications ────────────────────────────────────────────────────────

describe('POST /api/enquiry/recruitment', () => {
  function application() {
    const form = new FormData()
    form.set('name', `${GUEST.first} ${GUEST.last}`)
    form.set('email', GUEST.email)
    form.set('phone', GUEST.phone)
    form.set('role', 'Bartender')
    form.set('job_posting_id', 'posting-1')
    form.set('job_slug', 'bartender')
    form.set('experience', 'Two years behind a pub bar.')
    form.set('fit', 'Reliable and friendly.')
    form.append('availability', 'Weekends')
    form.set('travel', 'I can drive.')
    form.set('relevantExperience', 'Yes')
    form.set('startDate', 'Immediately')
    form.set('consent', 'yes')
    form.set('sms_consent', 'yes')
    form.set('future_recruitment_consent', 'yes')
    form.set('idempotency_key', 'idem-1')
    form.set('turnstile_token', 'turnstile-1')
    form.set('_t', '5')
    return form
  }

  async function post() {
    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    return read(await POST(formRequest(application())))
  }

  function graphCalls() {
    return (global.fetch as jest.Mock).mock.calls.filter(([url]) => String(url).includes('graph.microsoft.com'))
  }

  it('saves the application and reports nothing', async () => {
    management = () => json({ success: true, data: { application_id: 'application-1' } })

    const answer = await post()

    expect(answer.status).toBe(200)
    expect(answer.body).toMatchObject({ success: true, source: 'management' })
    expectNothingReported()
  })

  it.each([
    [401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }],
    [403, { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }],
    [404, { error: 'Not found' }],
    [405, { error: 'Method not allowed' }],
    [413, { error: 'Payload too large' }]
  ])('sends a %s to the email fallback, reports it, and gives the applicant the standard answer', async (status, body) => {
    management = () => json(body, status)

    const answer = await post()

    // Not the applicant's to correct: one attempt, then the email with the CV.
    expect(managementCalls).toHaveLength(1)
    expect(graphCalls()).toHaveLength(1)
    expect(answer.status).toBe(200)
    expect(answer.body).toMatchObject({ success: true, source: 'email_fallback' })
    for (const wording of DEVELOPER_WORDING) expect(answer.text).not.toContain(wording)
    expectReported('api/enquiry/recruitment')
    expect(log.lines()[0]).toMatchObject({ status, reason: 'UPSTREAM_NOT_OK' })
  })

  it.each([400, 422])('gives a %s back to the applicant to correct, with no fallback email and no alert', async (status) => {
    management = () => json({ success: false, error: { message: 'Please upload a PDF, DOC or DOCX CV.' } }, status)

    const answer = await post()

    expect(answer.status).toBe(status)
    expect(answer.body.error).toBe('Please upload a PDF, DOC or DOCX CV. Call 01753 682707 if you need help.')
    expect(graphCalls()).toHaveLength(0)
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', alert: 'none' })
    expect(mockSendAlertEmail).not.toHaveBeenCalled()
  })

  it('tells the applicant and reports it when the booking system and the fallback email both fail', async () => {
    management = UNAUTHORISED
    graphWorks = false

    const answer = await post()

    expect(answer.status).toBe(500)
    expect(answer.body.success).toBe(false)
    expectGuestTold(answer)
    expectReported('api/enquiry/recruitment')
  })

  it('tells the applicant and reports it when no sender is configured for the fallback', async () => {
    management = ECHOING_500
    delete process.env.MICROSOFT_USER_EMAIL

    const answer = await post()

    expect(answer.status).toBe(500)
    expect(answer.text).toContain(PHONE_NUMBER)
    expect(answer.text).not.toContain('site administrator')
    expect(log.lines().map((line) => line.reason)).toContain('APPLICATION_LOST_EMAIL_NOT_CONFIGURED')
    expectNoPersonalData(log.everything(), PERSONAL)
  })
})

// ── Christmas enquiries ─────────────────────────────────────────────────────

describe('POST /api/enquiry/christmas', () => {
  const BODY = {
    mode: 'meal',
    service: 'lunch',
    source: 'hero_meal',
    name: `${GUEST.first} ${GUEST.last}`,
    email: GUEST.email,
    phone: GUEST.phone,
    partySize: '12',
    preferredDate: '2026-12-10',
    preferredTime: '12:30 pm',
    extras: [],
    perks: [],
    notes: `Ring ${GUEST.first} on ${GUEST.phone}`
  }

  beforeEach(() => {
    // Inside the Christmas booking window, so the date rules pass.
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
    jest.setSystemTime(new Date('2026-11-20T09:00:00Z'))
  })

  async function post() {
    const { POST } = await import('@/app/api/enquiry/christmas/route')
    return read(await POST(jsonRequest(BODY)))
  }

  it('records the enquiry and reports nothing', async () => {
    management = () => json({ success: true }, 201)

    const answer = await post()

    expect(answer.status).toBe(200)
    expect(answer.body).toMatchObject({ success: true, delivery: 'management' })
    expectNothingReported()
  })

  it('emails the enquiry to the manager and reports the outage when the booking system rejects the key', async () => {
    management = UNAUTHORISED

    const answer = await post()

    expect(answer.status).toBe(200)
    expect(answer.body).toMatchObject({ success: true, delivery: 'email_fallback' })
    expectReported('api/enquiry/christmas')
    expect(log.lines()[0]).toMatchObject({ status: 401, reason: 'UPSTREAM_NOT_OK' })
  })

  it('tells the guest and reports it when the booking system and the fallback email both fail', async () => {
    management = UNAUTHORISED
    graphWorks = false

    const answer = await post()

    expect(answer.status).toBeGreaterThanOrEqual(500)
    expect(answer.body.success).toBe(false)
    expectGuestTold(answer)
    expect(answer.text).not.toContain('Graph')
    expectReported('api/enquiry/christmas')
    expect(log.lines().map((line) => line.reason)).toEqual(['UPSTREAM_NOT_OK', 'ENQUIRY_LOST_FALLBACK_EMAIL_FAILED'])
  })

  it('reports a missing key and still gets the enquiry to a person', async () => {
    delete process.env.ANCHOR_API_KEY

    const answer = await post()

    expect(managementCalls).toHaveLength(0)
    expect(answer.body).toMatchObject({ success: true, delivery: 'email_fallback' })
    expectReported('api/enquiry/christmas')
    expect(log.lines()[0]).toMatchObject({ reason: 'API_KEY_MISSING', status: null })
  })
})

// ── Parking ─────────────────────────────────────────────────────────────────

describe('parking', () => {
  const BOOKING = {
    customer: { first_name: GUEST.first, last_name: GUEST.last, email: GUEST.email, mobile_number: GUEST.phone },
    vehicle: { registration: GUEST.plate },
    start_at: '2026-11-01T08:00:00.000Z',
    end_at: '2026-11-05T08:00:00.000Z'
  }

  /** What the API client throws: it repeats what the guest typed in its message. */
  const CLIENT_FAULT = () =>
    Object.assign(new Error(`Database error for ${GUEST.first} ${GUEST.last} ${GUEST.plate} ${GUEST.phone}`), {
      status: 500,
      code: 'INTERNAL_ERROR'
    })

  describe('POST /api/parking/bookings', () => {
    async function post() {
      const { POST } = await import('@/app/api/parking/bookings/route')
      return read(await POST(jsonRequest(BOOKING)))
    }

    it('books the space and reports nothing', async () => {
      mockCreateParkingBooking.mockResolvedValue({ id: BOOKING_ID, reference: GUEST.reference })

      const answer = await post()

      expect(answer.status).toBe(201)
      expect(answer.body.success).toBe(true)
      expectNothingReported()
    })

    it('tells the guest and reports it, with no name and no number plate, when the booking system fails', async () => {
      mockCreateParkingBooking.mockRejectedValue(CLIENT_FAULT())

      const answer = await post()

      expect(answer.status).toBe(500)
      expect(answer.body.success).toBe(false)
      expectGuestTold(answer)
      expectReported('api/parking/bookings')
    })

    it('logs full dates as a refusal and alerts nobody', async () => {
      mockCreateParkingBooking.mockRejectedValue({ status: 409, code: 'CAPACITY_UNAVAILABLE', message: 'No capacity' })

      const answer = await post()

      expect(answer.status).toBe(409)
      expect(answer.body.error.message).toContain(PHONE_NUMBER)
      expect(log.lines()[0]).toMatchObject({ kind: 'refused', upstreamCode: 'CAPACITY_UNAVAILABLE', alert: 'none' })
      expect(mockSendAlertEmail).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/parking/payment/create-order', () => {
    const ORDER = { ...BOOKING, start_at: '2026-11-01T08:00:00+00:00', end_at: '2026-11-05T08:00:00+00:00' }

    async function post() {
      const { POST } = await import('@/app/api/parking/payment/create-order/route')
      return read(await POST(jsonRequest(ORDER)))
    }

    it('starts the payment and reports nothing', async () => {
      mockCreateParkingPaymentOrder.mockResolvedValue({ paypal_order_id: PAYPAL_ORDER_ID, booking_id: BOOKING_ID })

      const answer = await post()

      expect(answer.status).toBe(201)
      expect(answer.body.paypal_order_id).toBe(PAYPAL_ORDER_ID)
      expectNothingReported()
    })

    it.each<[string, () => void]>([
      ['fails', () => mockCreateParkingPaymentOrder.mockRejectedValue(CLIENT_FAULT())],
      ['answers without a PayPal order', () => mockCreateParkingPaymentOrder.mockResolvedValue({ booking_id: BOOKING_ID })]
    ])('tells the guest and reports a payment failure when the booking system %s', async (_label, arrange) => {
      arrange()

      const answer = await post()

      expect(answer.status).toBe(502)
      expectGuestTold(answer)
      expectReported('api/parking/payment/create-order', { payment: true })
    })
  })

  describe('POST /api/parking/payment/capture', () => {
    async function post() {
      const { POST } = await import('@/app/api/parking/payment/capture/route')
      return read(await POST(jsonRequest({ orderID: PAYPAL_ORDER_ID, bookingId: BOOKING_ID })))
    }

    it('confirms the payment and reports nothing', async () => {
      mockCaptureParkingPayment.mockResolvedValue({ booking_id: BOOKING_ID, status: 'confirmed' })

      const answer = await post()

      expect(answer.status).toBe(200)
      expect(answer.body.booking_id).toBe(BOOKING_ID)
      expectNothingReported()
    })

    it.each<[string, () => void]>([
      ['fails', () => mockCaptureParkingPayment.mockRejectedValue(CLIENT_FAULT())],
      ['answers without a booking', () => mockCaptureParkingPayment.mockResolvedValue({})]
    ])('tells the guest to ring before paying again, and reports it, when the booking system %s', async (_label, arrange) => {
      arrange()

      const answer = await post()

      expect(answer.status).toBe(502)
      expectGuestTold(answer)
      expect(answer.body.error).toContain('before paying again')
      expectReported('api/parking/payment/capture', { payment: true })
    })
  })
})

// ── The security check every form shares ────────────────────────────────────

describe('a missing security-check secret', () => {
  it('still refuses the form, but now says who to call and reports it', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    const { verifyTurnstileToken } = await import('@/lib/turnstile')

    const result = await verifyTurnstileToken('any-token')

    expect(result.success).toBe(false)
    expect(result.error).toContain(PHONE_NUMBER)
    expect(result.error).not.toContain('not configured')
    expect(log.lines()[0]).toMatchObject({ route: 'lib/turnstile', kind: 'failed', reason: 'TURNSTILE_SECRET_MISSING' })
    expect(mockSendAlertEmail).toHaveBeenCalledTimes(1)
  })
})
