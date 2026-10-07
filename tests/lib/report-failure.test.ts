import { captureFailureLog, expectNoPersonalData, type CapturedFailureLog } from '@/tests/helpers/failure-log'

const mockSendEmail = jest.fn()

jest.mock('@/lib/microsoft-graph-mail', () => ({
  sendMicrosoftGraphEmail: (...args: unknown[]) => mockSendEmail(...args),
  escapeHtml: (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}))

import {
  FAILURE_ALERT_RECIPIENT,
  FAILURE_ALERT_RETRY_MS,
  FAILURE_ALERT_WINDOW_MS,
  buildFailureAlertEmail,
  pageFromRequest,
  reportFailure,
  resetFailureAlertsForTests,
  scrubForLog,
  sendPaymentFailureText,
  type FailureLogLine
} from '@/lib/report-failure'

// Fixture personal data. None of it may reach a log line or an alert email.
const NAME = 'Alice Booker'
const PHONE = '07700 900123'
const PHONE_INTL = '+447700900123'
const EMAIL = 'alice.booker@example.com'
const PLATE = 'AB12 CDE'
const REFERENCE = 'TB-2026-0042'
const BOOKING_ID = '550e8400-e29b-41d4-a716-446655440000'
const PERSONAL = [NAME, 'Alice', 'Booker', PHONE, PHONE_INTL, EMAIL, PLATE, REFERENCE, BOOKING_ID]

// The long dash this project bans from everything it writes, built from its
// code so that this file does not contain one either.
const LONG_DASH = String.fromCharCode(8212)

const ORIGINAL_ENV = process.env

let log: CapturedFailureLog

beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2026-10-07T18:30:00Z'))
  process.env = { ...ORIGINAL_ENV, VERCEL_ENV: 'production', MICROSOFT_USER_EMAIL: 'bot@the-anchor.pub' }
  mockSendEmail.mockReset()
  mockSendEmail.mockResolvedValue(undefined)
  resetFailureAlertsForTests()
  log = captureFailureLog()
})

afterEach(() => {
  log.restore()
  process.env = ORIGINAL_ENV
  jest.useRealTimers()
})

describe('the log line', () => {
  it('is one structured line naming the route, the upstream status and a short reason', async () => {
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK', upstreamCode: 'DATABASE_ERROR' })

    expect(log.lines()).toEqual([
      {
        route: 'api/table-bookings',
        kind: 'failed',
        status: 502,
        reason: 'UPSTREAM_NOT_OK',
        payment: false,
        upstreamCode: 'DATABASE_ERROR',
        alert: 'email',
        at: '2026-10-07T18:30:00.000Z'
      }
    ])
    // One line, on one line.
    expect(log.everything().split('\n')).toHaveLength(1)
  })

  it('records a missing answer as a null status', async () => {
    await reportFailure({ route: 'api/event-waitlist', status: null, reason: 'UNEXPECTED_ERROR', error: new TypeError('fetch failed') })

    expect(log.lines()[0]).toMatchObject({ status: null, errorName: 'TypeError', errorMessage: 'fetch failed' })
  })

  it('carries no personal data even when every field is handed some', async () => {
    await reportFailure({
      route: 'api/table-bookings',
      status: 500,
      // None of these is a code, so none of them survives.
      reason: `Booking failed for ${NAME}`,
      upstreamCode: PHONE,
      state: EMAIL,
      eventId: PLATE,
      page: `/parking/bookings/${BOOKING_ID}/${REFERENCE}/${PLATE.replace(' ', '')}/${PHONE.replace(' ', '')}?email=${EMAIL}&fbclid=abc`,
      reference: REFERENCE,
      error: new Error(`Could not save ${EMAIL} on ${PHONE} / ${PHONE_INTL}, car ${PLATE}, booking ${BOOKING_ID} ref ${REFERENCE}`)
    })

    const line = log.lines()[0]
    expectNoPersonalData(log.everything(), PERSONAL)
    expect(line.reason).toBe('UNSPECIFIED')
    expect(line).not.toHaveProperty('upstreamCode')
    expect(line).not.toHaveProperty('state')
    expect(line).not.toHaveProperty('eventId')
    expect(line.page).toBe('/parking/bookings/:id/:id/:id/:id')
    expect(line.refHash).toMatch(/^[0-9a-f]{12}$/)
    expect(line.errorMessage).toContain('[email]')
    expect(line.errorMessage).toContain('[number]')
  })

  it('never logs a name passed as a reason, a code or a state', async () => {
    await reportFailure({ route: 'api/table-bookings', status: 500, reason: NAME, upstreamCode: NAME, state: NAME })

    expectNoPersonalData(log.everything(), ['Alice', 'Booker'])
  })

  it('keeps only the code of a thrown object, never its message', async () => {
    await reportFailure({
      route: 'api/parking/bookings',
      status: 500,
      reason: 'CREATE_BOOKING_FAILED',
      error: { code: 'DATABASE_ERROR', message: `Duplicate booking for ${NAME} ${PLATE}` }
    })

    expect(log.lines()[0]).toMatchObject({ errorName: 'Thrown:DATABASE_ERROR' })
    expect(log.lines()[0]).not.toHaveProperty('errorMessage')
    expectNoPersonalData(log.everything(), PERSONAL)
  })

  it('logs the same hash for the same reference, so two lines can be matched', async () => {
    await reportFailure({ route: 'api/table-bookings/paypal/create-order', payment: true, status: 502, reason: 'A', reference: BOOKING_ID })
    await reportFailure({ route: 'api/table-bookings/paypal/capture-order', payment: true, status: 502, reason: 'B', reference: BOOKING_ID })

    expect(log.lines()[0].refHash).toBe(log.lines()[1].refHash)
    expectNoPersonalData(log.everything(), [BOOKING_ID])
  })

  it('keeps an ordinary page slug, with its date', async () => {
    await reportFailure({ route: 'api/event-bookings', status: 500, reason: 'X', page: '/events/quiz-night-2026-09-16?utm_source=facebook' })

    expect(log.lines()[0].page).toBe('/events/quiz-night-2026-09-16')
  })
})

describe('scrubForLog', () => {
  it.each([
    [`mail ${EMAIL} bounced`, 'mail [email] bounced'],
    [`call ${PHONE} now`, 'call [number] now'],
    [`call ${PHONE_INTL} now`, 'call [number] now'],
    [`car ${PLATE} parked`, 'car [plate] parked'],
    [`car AB12CDE parked`, 'car [plate] parked'],
    [`booking ${BOOKING_ID} missing`, 'booking [id] missing']
  ])('scrubs %s', (input, expected) => {
    expect(scrubForLog(input)).toBe(expected)
  })

  it('cuts long text short and keeps it on one line', () => {
    const scrubbed = scrubForLog(`first line\nsecond line ${'x'.repeat(400)}`)
    expect(scrubbed.length).toBeLessThanOrEqual(120)
    expect(scrubbed).not.toContain('\n')
  })
})

describe('the alert email', () => {
  it('goes to the manager for a failure, from the sender the site already has', async () => {
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK', page: '/book-table' })

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const email = mockSendEmail.mock.calls[0][0]
    expect(email.to).toBe(FAILURE_ALERT_RECIPIENT)
    expect(email.to).toBe('manager@the-anchor.pub')
    expect(email.fromUser).toBe('bot@the-anchor.pub')
    expect(email.subject).toBe('ACTION NEEDED: the website could not complete a request (Table bookings)')
    expect(email.textContent).toContain('Booking system answered: HTTP 502')
    expect(email.textContent).toContain('01753 682707')
  })

  it('is not sent for a refusal: a full night is not a fault', async () => {
    await reportFailure({ route: 'api/table-bookings', kind: 'refused', status: 200, reason: 'BLOCKED', state: 'blocked', upstreamCode: 'no_table' })

    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(log.lines()[0]).toMatchObject({ kind: 'refused', alert: 'none' })
  })

  it('is sent at most once per route every ten minutes, and says how many were held back', async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK' })
    }

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(log.lines().map((line) => line.alert)).toEqual(['email', 'throttled', 'throttled', 'throttled'])
    // Every failure is still logged, alert or not.
    expect(log.lines()).toHaveLength(4)

    jest.advanceTimersByTime(FAILURE_ALERT_WINDOW_MS - 1000)
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK' })
    expect(mockSendEmail).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000)
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK' })
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockSendEmail.mock.calls[1][0].textContent).toContain('4 more failures on this route')
  })

  it('limits each route on its own', async () => {
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'X' })
    await reportFailure({ route: 'api/event-bookings', status: 502, reason: 'X' })
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'X' })

    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  it('is not sent from a preview or a laptop, and the line says why', async () => {
    for (const environment of ['preview', 'development', undefined]) {
      if (environment) process.env.VERCEL_ENV = environment
      else delete process.env.VERCEL_ENV
      await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK' })
    }

    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(log.lines().map((line) => line.alert)).toEqual(['not_production', 'not_production', 'not_production'])
  })

  it('carries no personal data', async () => {
    await reportFailure({
      route: 'api/parking/payment/capture',
      payment: true,
      status: 500,
      reason: 'CAPTURE_FAILED',
      page: `/heathrow-parking/confirmation/${BOOKING_ID}`,
      reference: BOOKING_ID,
      error: new Error(`${EMAIL} ${PHONE} ${PLATE}`)
    })

    expectNoPersonalData(JSON.stringify(mockSendEmail.mock.calls), PERSONAL)
  })

  it('renders with fixture data and no undefined, Invalid Date or NaN', () => {
    const line: FailureLogLine = {
      route: 'api/table-bookings/paypal/capture-order',
      kind: 'failed',
      status: 502,
      reason: 'UPSTREAM_NOT_OK',
      payment: true,
      upstreamCode: 'INTERNAL_ERROR',
      page: '/book-table',
      refHash: '3f1c9a7be204',
      alert: 'email',
      text: 'no_sender',
      at: '2026-10-07T18:30:00.000Z'
    }

    const email = buildFailureAlertEmail(line, { now: new Date('2026-10-07T18:30:00Z'), suppressedBefore: 3 })

    expect(email.subject).toBe('ACTION NEEDED: a payment failed on the website (Table deposit: taking a payment)')
    // 18:30 UTC on 7 October 2026 is 19:30 in London (British Summer Time).
    expect(email.textContent).toContain('When: Wednesday 7 October 2026 at 19:30 BST')
    expect(email.textContent).toContain('money may have been taken')
    expect(email.textContent).toContain('3 more failures on this route')
    for (const rendered of [email.subject, email.textContent, email.htmlContent]) {
      expect(rendered).not.toMatch(/undefined|Invalid Date|NaN|\[object Object\]/)
      expect(rendered).not.toContain(LONG_DASH)
    }
    expect(email).toMatchSnapshot()
  })

  it('says "no answer" when the booking system never replied, and uses GMT in winter', () => {
    const email = buildFailureAlertEmail(
      { route: 'api/event-waitlist', kind: 'failed', status: null, reason: 'UNEXPECTED_ERROR', payment: false, alert: 'email', at: '2026-12-01T12:00:00.000Z' },
      { now: new Date('2026-12-01T12:00:00Z'), suppressedBefore: 0 }
    )

    expect(email.textContent).toContain('Booking system answered: no answer from the booking system')
    expect(email.textContent).toContain('When: Tuesday 1 December 2026 at 12:00 GMT')
    expect(email.textContent).not.toContain('more failure')
  })
})

describe('when the alert cannot be sent', () => {
  it('has already written the log line, writes a second one about the alert, and does not throw', async () => {
    mockSendEmail.mockRejectedValue(new Error(`Failed to send email via Microsoft Graph: mailbox ${EMAIL} is full`))

    await expect(reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK' })).resolves.toBeUndefined()

    expect(log.lines()).toHaveLength(1)
    expect(log.lines()[0]).toMatchObject({ route: 'api/table-bookings', reason: 'UPSTREAM_NOT_OK' })
    expect(log.alertLines()).toEqual([
      expect.objectContaining({ route: 'api/table-bookings', emailed: false, errorName: 'Error' })
    ])
    expectNoPersonalData(log.everything(), [EMAIL])
  })

  it('tries again after a minute rather than staying quiet for ten', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Graph is down'))

    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'X' })
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'X' })
    expect(mockSendEmail).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(FAILURE_ALERT_RETRY_MS)
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'X' })
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  it('writes the log line when the sender is not configured', async () => {
    delete process.env.MICROSOFT_USER_EMAIL

    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK' })

    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(log.lines()).toHaveLength(1)
    expect(log.alertLines()[0]).toMatchObject({ emailed: false })
  })

  it('gives up on an email that hangs, so the guest is not left waiting', async () => {
    mockSendEmail.mockReturnValue(new Promise(() => undefined))

    const pending = reportFailure({ route: 'api/table-bookings', status: 502, reason: 'UPSTREAM_NOT_OK' })
    await jest.advanceTimersByTimeAsync(5000)
    await expect(pending).resolves.toBeUndefined()

    expect(log.alertLines()[0]).toMatchObject({ emailed: false })
  })

  it('never throws, whatever it is handed', async () => {
    await expect(reportFailure(undefined as never)).resolves.toBeUndefined()
    await expect(reportFailure({ route: 42, reason: {}, status: 'x' } as never)).resolves.toBeUndefined()
  })
})

describe('the text for a failed payment', () => {
  it('is a named hook that says the website has no way to send one', async () => {
    await expect(sendPaymentFailureText({ route: 'api/parking/payment/capture', status: 502, reason: 'CAPTURE_FAILED' })).resolves.toEqual({
      sent: false,
      reason: 'no_sms_sender_on_website'
    })
  })

  it('is recorded on the log line of a failed payment, and the email is still sent', async () => {
    await reportFailure({ route: 'api/parking/payment/capture', payment: true, status: 502, reason: 'CAPTURE_FAILED' })

    expect(log.lines()[0]).toMatchObject({ payment: true, alert: 'email', text: 'no_sender' })
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail.mock.calls[0][0].subject).toContain('a payment failed on the website')
  })

  it('is not mentioned for a failure that is not a payment', async () => {
    await reportFailure({ route: 'api/table-bookings', status: 502, reason: 'X' })

    expect(log.lines()[0]).not.toHaveProperty('text')
  })
})

describe('pageFromRequest', () => {
  it('returns the path of the referring page, without its query string', () => {
    const request = { headers: new Headers({ referer: 'https://www.the-anchor.pub/book-table?fbclid=abc' }) }
    expect(pageFromRequest(request)).toBe('/book-table')
  })

  it.each([[undefined], [null], [{}], [{ headers: {} }], [{ headers: new Headers({ referer: 'not a url' }) }]])(
    'returns null rather than throwing for %p',
    (request) => {
      expect(pageFromRequest(request)).toBeNull()
    }
  )
})
