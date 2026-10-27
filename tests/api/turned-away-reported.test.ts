import { captureFailureLog, expectNoPersonalData, type CapturedFailureLog } from '@/tests/helpers/failure-log'

/**
 * Turned-away guests leave a trace (BK-101, customer bookings review of 24 October 2026).
 *
 * The website's own refusals (a detail to correct, outside online hours, a spam or security
 * check) used to answer the guest and write nothing, and a refusal from the booking system that
 * the website had already passed was treated as the guest's mistake. Now every one is written
 * by the shared reporter and sent to the management app to be counted, and a booking system
 * refusal of details the website accepted is reported as a failure, because the two disagree.
 *
 * The reporter runs for real; the management app's count, the outside world, is stood in for so
 * what it was asked to record can be read.
 */

const mockRecordTurnedAway = jest.fn(async (_record: Record<string, unknown>) => ({ recorded: true, reason: 'recorded' }))
jest.mock('@/lib/booking-funnel-report', () => ({
  recordTurnedAway: (record: Record<string, unknown>) => mockRecordTurnedAway(record)
}))

const mockSendAlertEmail = jest.fn(async () => undefined)
jest.mock('@/lib/microsoft-graph-mail', () => ({
  sendMicrosoftGraphEmail: (...args: unknown[]) => (mockSendAlertEmail as jest.Mock)(...args),
  escapeHtml: (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}))

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://example.invalid/api'
}))

const mockGetBusinessHours = jest.fn()
jest.mock('@/lib/api', () => ({
  anchorAPI: { getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args) }
}))

const mockVerifyTurnstileToken = jest.fn()
jest.mock('@/lib/turnstile', () => ({
  verifyTurnstileToken: (...args: unknown[]) => mockVerifyTurnstileToken(...args)
}))

jest.mock('@/lib/booking-conversion-forwarding', () => ({
  forwardBookingConversionToCheersAI: jest.fn(async () => undefined)
}))

if (typeof (Response as unknown as { json?: unknown }).json !== 'function') {
  ;(Response as unknown as { json: (body: unknown, init?: ResponseInit) => Response }).json = (body, init) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...((init?.headers as Record<string, string>) || {}) }
    })
}

const OPEN_DAY = { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } }
const HOURS = {
  regularHours: {
    monday: OPEN_DAY,
    tuesday: OPEN_DAY,
    wednesday: OPEN_DAY,
    thursday: OPEN_DAY,
    friday: OPEN_DAY,
    saturday: OPEN_DAY,
    sunday: OPEN_DAY
  },
  specialHours: []
}

const GUEST = { first_name: 'Alice', last_name: 'Booker', phone: '07700900123', email: 'alice.booker@example.com' }
const PERSONAL = ['Alice', 'Booker', '07700900123', '07700 900123', 'alice.booker@example.com']

// Passes the website's own checks: a person's timing, a token and a time inside opening hours,
// three weeks ahead (the pub is open every day in these hours).
const BOOKING = {
  ...GUEST,
  date: new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10),
  time: '19:00',
  party_size: 4,
  purpose: 'food',
  _t: 40,
  turnstile_token: 'token'
}

const ORIGINAL_ENV = process.env
let log: CapturedFailureLog

function post(path: string, body: unknown, referer = 'https://www.the-anchor.pub/book-table'): Request {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', referer, 'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250)}` },
    body: JSON.stringify(body)
  })
}

function upstreamAnswers(status: number, body: unknown): void {
  ;(global as unknown as { fetch: jest.Mock }).fetch = jest.fn(async () =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
  )
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, ANCHOR_API_KEY: 'test-key', VERCEL_ENV: 'production', MICROSOFT_USER_EMAIL: 'bot@the-anchor.pub' }
  mockGetBusinessHours.mockResolvedValue(HOURS)
  mockVerifyTurnstileToken.mockResolvedValue({ success: true })
  mockRecordTurnedAway.mockClear()
  mockSendAlertEmail.mockClear()
  log = captureFailureLog()
})

afterEach(() => {
  log.restore()
  process.env = ORIGINAL_ENV
})

async function tableBookingPost() {
  const { resetFailureAlertsForTests } = await import('@/lib/report-failure')
  resetFailureAlertsForTests()
  return (await import('@/app/api/table-bookings/route')).POST
}

describe('the table booking route counts its own refusals', () => {
  it('a detail to correct', async () => {
    const POST = await tableBookingPost()
    const response = await POST(post('/api/table-bookings', { ...BOOKING, purpose: undefined }) as never)

    expect(response.status).toBe(400)
    expect(log.lines()).toEqual([
      expect.objectContaining({ route: 'api/table-bookings', kind: 'refused', status: 400, reason: 'VALIDATION_FAILED', page: '/book-table', alert: 'none' })
    ])
    expect(mockRecordTurnedAway).toHaveBeenCalledWith(
      expect.objectContaining({ route: 'api/table-bookings', kind: 'refused', status: 400, reason: 'VALIDATION_FAILED', page: '/book-table' })
    )
    expect(mockSendAlertEmail).not.toHaveBeenCalled()
    expectNoPersonalData(log.everything() + JSON.stringify(mockRecordTurnedAway.mock.calls), PERSONAL)
  })

  it('a time outside online booking hours', async () => {
    const POST = await tableBookingPost()
    const response = await POST(post('/api/table-bookings', { ...BOOKING, time: '23:30' }) as never)

    expect(response.status).toBe(400)
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', reason: 'OUTSIDE_HOURS' })
    expect(mockRecordTurnedAway).toHaveBeenCalledWith(expect.objectContaining({ reason: 'OUTSIDE_HOURS' }))
  })

  it('a no the guest can act on from the booking system stays a refusal', async () => {
    upstreamAnswers(409, { success: false, error: { code: 'CAPACITY_UNAVAILABLE', message: 'Those dates are now fully booked.' } })
    const POST = await tableBookingPost()
    const response = await POST(post('/api/table-bookings', BOOKING) as never)

    expect(response.status).toBe(409)
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', reason: 'UPSTREAM_NOT_OK', upstreamCode: 'CAPACITY_UNAVAILABLE' })
    expect(log.lines()[0]).not.toHaveProperty('drift')
    expect(mockSendAlertEmail).not.toHaveBeenCalled()
  })

  it('the booking system refusing details the website accepted is a failure: the two disagree', async () => {
    upstreamAnswers(400, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid phone number' } })
    const POST = await tableBookingPost()
    const response = await POST(post('/api/table-bookings', BOOKING) as never)

    // The guest is answered exactly as before.
    expect(response.status).toBe(400)
    expect(log.lines()[0]).toMatchObject({
      route: 'api/table-bookings',
      kind: 'failed',
      reason: 'CONTRACT_DRIFT',
      upstreamCode: 'VALIDATION_ERROR',
      drift: true,
      alert: 'email'
    })
    expect(mockRecordTurnedAway).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'failed', reason: 'CONTRACT_DRIFT', upstreamCode: 'VALIDATION_ERROR' })
    )
    expect(mockSendAlertEmail).toHaveBeenCalledTimes(1)
    const [email] = mockSendAlertEmail.mock.calls[0] as unknown as [{ subject: string; textContent: string }]
    expect(email.subject).toBe('ACTION NEEDED: the website and the booking system disagree (Table bookings)')
    expect(email.textContent).toContain('The booking system turned down details the website had already checked and accepted')
    expect(email.textContent).not.toMatch(/undefined|NaN|Invalid Date/)
    expectNoPersonalData(log.everything() + email.textContent, PERSONAL)
  })
})

describe('the spam and security checks count what they turn away, with the page', () => {
  async function spamCheck() {
    const { resetFailureAlertsForTests } = await import('@/lib/report-failure')
    resetFailureAlertsForTests()
    return (await import('@/lib/spam-protection')).checkSpamProtection
  }

  it.each([
    ['the hidden field filled in', { ...BOOKING, website: 'x' }, 'SPAM_HONEYPOT', 400],
    ['no timing', { ...BOOKING, _t: undefined }, 'SPAM_TIMING_MISSING', 400],
    ['sent too fast', { ...BOOKING, _t: 1 }, 'SPAM_TIMING_TOO_FAST', 400]
  ])('%s', async (_label, body, reason, status) => {
    const checkSpamProtection = await spamCheck()
    const result = await checkSpamProtection(post('/api/event-bookings', body, 'https://www.the-anchor.pub/events/tasting-night-2026-11-20'), body)

    expect(result.blocked).toBe(true)
    expect(log.lines()).toEqual([
      expect.objectContaining({ route: 'api/event-bookings', kind: 'refused', status, reason, page: '/events/tasting-night-2026-11-20' })
    ])
    expect(mockRecordTurnedAway).toHaveBeenCalledWith(expect.objectContaining({ route: 'api/event-bookings', reason }))
  })

  it('a missing security token, with the page it happened on (BK-191)', async () => {
    mockVerifyTurnstileToken.mockResolvedValue({ success: false, reason: 'SECURITY_CHECK_MISSING', error: 'Please complete the check.' })
    const checkSpamProtection = await spamCheck()
    const result = await checkSpamProtection(
      post('/api/event-bookings', BOOKING, 'https://www.the-anchor.pub/events/tasting-night-2026-11-20'),
      BOOKING
    )

    expect(result.blocked).toBe(true)
    expect(log.lines()).toEqual([
      expect.objectContaining({ kind: 'refused', status: 403, reason: 'SECURITY_CHECK_MISSING', page: '/events/tasting-night-2026-11-20' })
    ])
  })

  it('nothing for a submission that passes', async () => {
    const checkSpamProtection = await spamCheck()
    const result = await checkSpamProtection(post('/api/event-bookings', BOOKING), BOOKING)

    expect(result.blocked).toBe(false)
    expect(log.lines()).toEqual([])
    expect(mockRecordTurnedAway).not.toHaveBeenCalled()
  })
})
