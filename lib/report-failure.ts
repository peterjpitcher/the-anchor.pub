import { createHash } from 'node:crypto'
import { escapeHtml, sendMicrosoftGraphEmail } from '@/lib/microsoft-graph-mail'

/**
 * The one place a public write route says "this did not complete".
 *
 * Workspace rule: a booking, enquiry, application or payment that cannot
 * complete must show the guest an error and a fallback, and must raise
 * something visible on our side. The routes each handled the second half in
 * their own way, and most of them not at all: the table booking and waitlist
 * routes passed refusals on and wrote nothing, the two table deposit routes had
 * no log call, and nothing anywhere told a person. Private hire enquiries were
 * dead from 11 to 27 August 2026 before a guest's complaint revealed it.
 *
 * reportFailure does three things, in this order:
 *
 *   1. writes ONE structured log line with console.error (the production build
 *      strips console.log), naming the route, the upstream status and a short
 *      reason;
 *   2. for a `failed` outcome, emails manager@the-anchor.pub, at most once per
 *      route every ten minutes;
 *   3. for a failed payment, calls the text hook as well.
 *
 * It never throws and never changes what the guest is told. If the email
 * cannot be sent the log line has already been written.
 *
 * No personal data, ever. The log line and the email carry no name, phone
 * number, email address, number plate or booking reference in clear. Callers
 * cannot pass free text: every field is either checked against a strict shape
 * or scrubbed here, and a booking id or reference is logged only as a short
 * hash so two lines about the same booking can be matched without naming it.
 *
 * The ten minute limit is per server. Owner decision 13 (7 October 2026) is
 * that the site has no shared store, and Vercel runs several copies of each
 * function, so an outage can send one email per copy rather than one in all.
 * The limit stops a flood; it does not promise a single message.
 */

export const FAILURE_ALERT_RECIPIENT = 'manager@the-anchor.pub'
export const FAILURE_ALERT_WINDOW_MS = 10 * 60 * 1000
export const FAILURE_LOG_PREFIX = '[write-failure]'
export const FAILURE_ALERT_LOG_PREFIX = '[write-failure-alert]'

export const FAILURE_ALERT_RETRY_MS = 60 * 1000
const ALERT_SEND_TIMEOUT_MS = 5000
const GUEST_PHONE = '01753 682707'

export type FailureKind = 'failed' | 'refused'

export interface FailureReport {
  /** The route, as a path under the site: `api/table-bookings`. */
  route: string
  /**
   * `failed` (the default) is something broken on our side: it is logged and a
   * person is alerted. `refused` is a deliberate no the guest can act on (a
   * full night, a detail to correct): it is logged and nobody is alerted.
   */
  kind?: FailureKind
  /** The upstream HTTP status, or null when the upstream never answered. */
  status?: number | null
  /** A short machine-readable reason: `UPSTREAM_ERROR`, `API_KEY_MISSING`. */
  reason: string
  /** True on the payment routes. A failed payment also triggers the text hook. */
  payment?: boolean
  /** The code the upstream answered with, when it gave one. */
  upstreamCode?: string | null
  /** The booking state the upstream answered with, when it gave one. */
  state?: string | null
  /**
   * An event's id. Kept only when it is a UUID, which is what the management
   * app issues: the field arrives from the browser, so anything else is dropped
   * rather than trusted not to be something a guest typed.
   */
  eventId?: string | null
  /** The page the guest was on. The path only: no query string, no ids. */
  page?: string | null
  /** A booking id or reference. Logged as a short hash, never in clear. */
  reference?: string | null
  /** Whatever was thrown. Its name is logged; its message is scrubbed first. */
  error?: unknown
}

export type FailureLogLine = {
  route: string
  kind: FailureKind
  status: number | null
  reason: string
  payment: boolean
  upstreamCode?: string
  state?: string
  eventId?: string
  page?: string
  refHash?: string
  errorName?: string
  errorMessage?: string
  alert: 'email' | 'throttled' | 'not_production' | 'none'
  text?: 'no_sender'
  at: string
}

const ROUTE_LABELS: Record<string, string> = {
  'api/table-bookings': 'Table bookings',
  'api/table-bookings/paypal/create-order': 'Table deposit: starting a payment',
  'api/table-bookings/paypal/capture-order': 'Table deposit: taking a payment',
  'api/event-bookings': 'Event bookings',
  'api/event-bookings/paypal/create-order': 'Event tickets: starting a payment',
  'api/event-bookings/paypal/capture-order': 'Event tickets: taking a payment',
  'api/event-waitlist': 'Event waitlist',
  'api/public/private-booking': 'Private hire enquiries',
  'api/enquiry/christmas': 'Christmas enquiries',
  'api/enquiry/recruitment': 'Job applications',
  'api/careers': 'Job applications (careers form)',
  'api/parking/bookings': 'Parking bookings',
  'api/parking/payment/create-order': 'Parking: starting a payment',
  'api/parking/payment/capture': 'Parking: taking a payment',
  'lib/turnstile': 'The security check on every form'
}

type ThrottleEntry = { lastSentAt: number; suppressed: number }

// Per server, in memory. See the note at the top of this file.
const alertThrottle = new Map<string, ThrottleEntry>()

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
const UUID_ONLY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** A token with no spaces and nothing a guest could have typed as prose. */
function safeToken(value: unknown, maxLength = 64): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > maxLength) return undefined
  return /^[A-Za-z][A-Za-z0-9_.:-]*$/.test(trimmed) ? trimmed : undefined
}

function safeRoute(value: unknown): string {
  if (typeof value !== 'string') return 'unknown'
  const trimmed = value.trim().replace(/^\/+/, '')
  return /^[A-Za-z0-9/_.[\]-]{1,80}$/.test(trimmed) ? trimmed : 'unknown'
}

/**
 * A page path with anything that could identify a guest or a booking removed:
 * the query string, the fragment, and any segment that is an id, carries a
 * long run of digits (a phone number) or is shaped like a reference or a
 * number plate (a digit and no lower-case letter). An ordinary slug, lower
 * case and with a date in it, is kept: `/events/quiz-night-2026-09-16`.
 */
function safePage(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const path = value.trim().split(/[?#]/)[0]
  if (!path.startsWith('/')) return undefined
  const cleaned = path
    .split('/')
    .map((segment) => {
      if (segment.length === 0) return segment
      if (!/^[A-Za-z0-9._~-]+$/.test(segment)) return ':x'
      if (UUID_ONLY.test(segment) || /\d{6,}/.test(segment)) return ':id'
      if (/\d/.test(segment) && !/[a-z]/.test(segment)) return ':id'
      return segment
    })
    .join('/')
  return cleaned.slice(0, 120)
}

function hashReference(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined
  return createHash('sha256').update(value.trim()).digest('hex').slice(0, 12)
}

/**
 * Removes anything shaped like personal data from text we did not write: email
 * addresses, ids, UK number plates and any run of digits long enough to be a
 * phone number or a reference. What is left is cut short.
 */
export function scrubForLog(value: string): string {
  return value
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(UUID_PATTERN, '[id]')
    .replace(/\b[A-Z]{2}\d{2}\s?[A-Z]{3}\b/gi, '[plate]')
    .replace(/\+?\d[\d\s().-]{4,}\d/g, '[number]')
    .replace(/\b[A-Z]{1,4}-?[A-Z0-9]*\d[A-Z0-9-]{3,}\b/g, '[ref]')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 120)
}

function describeError(error: unknown): { errorName?: string; errorMessage?: string } {
  if (error === undefined || error === null) return {}
  if (error instanceof Error) {
    const message = scrubForLog(error.message || '')
    return {
      errorName: safeToken(error.name) ?? 'Error',
      ...(message ? { errorMessage: message } : {})
    }
  }
  if (typeof error === 'string') {
    const message = scrubForLog(error)
    return { errorName: 'Thrown', ...(message ? { errorMessage: message } : {}) }
  }
  // An object that is not an Error (the API client throws `{ status, code }`).
  // Only its code is kept: its message can echo what the guest typed.
  const code = safeToken((error as { code?: unknown }).code)
  return { errorName: code ? `Thrown:${code}` : 'Thrown' }
}

function isProductionDeployment(): boolean {
  // Alerts go out from the live site only. A preview or a laptop that cannot
  // reach the booking system must not email the pub.
  return process.env.VERCEL_ENV === 'production'
}

function decideAlert(route: string, now: number): { send: boolean; suppressedBefore: number } {
  const entry = alertThrottle.get(route)
  if (entry && now - entry.lastSentAt < FAILURE_ALERT_WINDOW_MS) {
    entry.suppressed += 1
    return { send: false, suppressedBefore: 0 }
  }
  alertThrottle.set(route, { lastSentAt: now, suppressed: 0 })
  return { send: true, suppressedBefore: entry?.suppressed ?? 0 }
}

/**
 * The time in the pub's own zone, whatever zone the server runs in (it runs in
 * UTC). Assembled from the parts, because the joining words and commas that
 * Intl adds differ between Node versions.
 */
function londonTimestamp(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short'
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes): string => parts.find((entry) => entry.type === type)?.value ?? ''
  return `${part('weekday')} ${part('day')} ${part('month')} ${part('year')} at ${part('hour')}:${part('minute')} ${part('timeZoneName')}`
}

export type FailureAlertEmail = { subject: string; textContent: string; htmlContent: string }

/**
 * The alert email. Exported so a test can render it with fixture data and fail
 * on `undefined`, `Invalid Date` or `NaN`, as the workspace rule asks.
 */
export function buildFailureAlertEmail(
  line: FailureLogLine,
  options: { now: Date; suppressedBefore: number }
): FailureAlertEmail {
  const label = ROUTE_LABELS[line.route] ?? line.route
  const subject = line.payment
    ? `ACTION NEEDED: a payment failed on the website (${label})`
    : `ACTION NEEDED: the website could not complete a request (${label})`

  const statusText = line.status === null ? 'no answer from the booking system' : `HTTP ${line.status}`

  const lines: string[] = [
    `What failed: ${label}`,
    `When: ${londonTimestamp(options.now)}`,
    `Booking system answered: ${statusText}`,
    `Reason: ${line.reason}`
  ]
  if (line.upstreamCode) lines.push(`Code from the booking system: ${line.upstreamCode}`)
  if (line.state) lines.push(`Booking state: ${line.state}`)
  if (line.page) lines.push(`Page the guest was on: ${line.page}`)
  if (line.refHash) lines.push(`Log match key: ${line.refHash}`)

  const guidance: string[] = [
    `The guest was shown an error and asked to call ${GUEST_PHONE}, unless this was an enquiry or a job application that reached you in a separate email.`
  ]
  if (line.payment) {
    guidance.push(
      'This was a payment step, so money may have been taken without a booking being confirmed. Please check PayPal and the management app before the guest pays again.'
    )
  }
  guidance.push(
    'No guest details are in this email on purpose. If a guest rings, take the booking by phone.',
    `To see every failure, search the website logs in Vercel for ${FAILURE_LOG_PREFIX} and this route: ${line.route}`
  )

  const footer: string[] = []
  if (options.suppressedBefore > 0) {
    footer.push(
      `${options.suppressedBefore} more failure${options.suppressedBefore === 1 ? '' : 's'} on this route followed the last alert from this server and were not emailed.`
    )
  }
  footer.push(
    'You get at most one of these per part of the site every ten minutes from each server. The site runs on several servers, so one outage can send a few emails, and one email can stand for many failed attempts.'
  )

  const textContent = [...lines, '', ...guidance, '', ...footer].join('\n')
  const htmlContent = [
    `<h2>${escapeHtml(subject)}</h2>`,
    '<ul>',
    ...lines.map((entry) => `<li>${escapeHtml(entry)}</li>`),
    '</ul>',
    ...guidance.map((entry) => `<p>${escapeHtml(entry)}</p>`),
    ...footer.map((entry) => `<p style="color:#555">${escapeHtml(entry)}</p>`)
  ].join('')

  return { subject, textContent, htmlContent }
}

export type PaymentFailureText = { route: string; status: number | null; reason: string }
export type PaymentFailureTextResult = { sent: boolean; reason: string }

/**
 * HOOK: the text message for a failed payment (owner decision 10).
 *
 * The website cannot send a text. It has no SMS provider, no credentials and
 * no sender: every text the pub sends goes out from the management app, which
 * owns Twilio. So this does nothing yet and says so. To finish the job the
 * management app needs an authenticated endpoint that sends an alert text to
 * the owner's number, and this function then becomes one POST to it. Keep the
 * payload exactly as it is here: a route, a status and a reason, and no guest
 * details.
 */
export async function sendPaymentFailureText(_alert: PaymentFailureText): Promise<PaymentFailureTextResult> {
  return { sent: false, reason: 'no_sms_sender_on_website' }
}

async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Alert email timed out')), ms)
  })
  try {
    return await Promise.race([work, timeout])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function writeLine(prefix: string, payload: Record<string, unknown>): void {
  try {
    console.error(`${prefix} ${JSON.stringify(payload)}`)
  } catch {
    // Nothing more can be done from here, and the guest's answer must not change.
  }
}

/**
 * Report that a public write did not complete. Await it: on Vercel a promise
 * left running after the response is not guaranteed to finish. It adds no
 * delay for a refusal, and at most one short email send per route per window.
 */
export async function reportFailure(report: FailureReport): Promise<void> {
  try {
    const now = new Date()
    const kind: FailureKind = report.kind === 'refused' ? 'refused' : 'failed'
    const route = safeRoute(report.route)
    const payment = report.payment === true
    const status = typeof report.status === 'number' && Number.isFinite(report.status) ? report.status : null

    let alert: FailureLogLine['alert'] = 'none'
    let suppressedBefore = 0
    if (kind === 'failed') {
      if (!isProductionDeployment()) {
        alert = 'not_production'
      } else {
        const decision = decideAlert(route, now.getTime())
        alert = decision.send ? 'email' : 'throttled'
        suppressedBefore = decision.suppressedBefore
      }
    }

    const upstreamCode = safeToken(report.upstreamCode)
    const state = safeToken(report.state)
    const eventId = typeof report.eventId === 'string' && UUID_ONLY.test(report.eventId.trim()) ? report.eventId.trim() : undefined
    const page = safePage(report.page)
    const refHash = hashReference(report.reference)

    const line: FailureLogLine = {
      route,
      kind,
      status,
      reason: safeToken(report.reason) ?? 'UNSPECIFIED',
      payment,
      ...(upstreamCode ? { upstreamCode } : {}),
      ...(state ? { state } : {}),
      ...(eventId ? { eventId } : {}),
      ...(page ? { page } : {}),
      ...(refHash ? { refHash } : {}),
      ...describeError(report.error),
      alert,
      ...(payment && alert === 'email' ? { text: 'no_sender' as const } : {}),
      at: now.toISOString()
    }

    // The log line first, so it exists whatever happens to the email.
    writeLine(FAILURE_LOG_PREFIX, line)

    if (alert !== 'email') return

    try {
      const fromUser = process.env.MICROSOFT_USER_EMAIL
      if (!fromUser) throw new Error('MICROSOFT_USER_EMAIL is not configured')
      const email = buildFailureAlertEmail(line, { now, suppressedBefore })
      await withTimeout(
        sendMicrosoftGraphEmail({
          to: FAILURE_ALERT_RECIPIENT,
          fromUser,
          subject: email.subject,
          htmlContent: email.htmlContent,
          textContent: email.textContent
        }),
        ALERT_SEND_TIMEOUT_MS
      )
    } catch (emailError) {
      // The alert did not go. Try again after a minute rather than staying
      // quiet for ten on the strength of an email nobody received, but not on
      // every request: a guest should not wait on a mail service that is down.
      alertThrottle.set(route, {
        lastSentAt: now.getTime() - FAILURE_ALERT_WINDOW_MS + FAILURE_ALERT_RETRY_MS,
        suppressed: 0
      })
      writeLine(FAILURE_ALERT_LOG_PREFIX, {
        route,
        emailed: false,
        ...describeError(emailError),
        at: now.toISOString()
      })
    }

    if (payment) {
      try {
        const text = await sendPaymentFailureText({ route, status, reason: line.reason })
        if (!text.sent && text.reason !== 'no_sms_sender_on_website') {
          writeLine(FAILURE_ALERT_LOG_PREFIX, { route, texted: false, reason: safeToken(text.reason) ?? 'unknown', at: now.toISOString() })
        }
      } catch (textError) {
        writeLine(FAILURE_ALERT_LOG_PREFIX, { route, texted: false, ...describeError(textError), at: now.toISOString() })
      }
    }
  } catch {
    // Reporting must never be the reason a guest sees a different answer.
    try {
      console.error(`${FAILURE_LOG_PREFIX} {"route":"unknown","kind":"failed","reason":"REPORT_FAILURE_THREW"}`)
    } catch {
      // Nothing left to try.
    }
  }
}

/** Tests only: forget which routes have alerted. */
export function resetFailureAlertsForTests(): void {
  alertThrottle.clear()
}

/**
 * The path of the page a request came from, for the `page` field. The Referer
 * header is the page the form was on. Only its path is used: a query string
 * can carry click ids, and reportFailure strips ids from the path as well.
 */
export function pageFromRequest(request: unknown): string | null {
  // Defensive on purpose: this runs before a route's own try block, and working
  // out which page a guest was on must never be what breaks their request.
  try {
    const headers = (request as { headers?: { get?: (name: string) => string | null } } | null)?.headers
    const referer = typeof headers?.get === 'function' ? headers.get('referer')?.trim() : null
    return referer ? new URL(referer).pathname : null
  } catch {
    return null
  }
}
