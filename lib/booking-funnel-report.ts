import { getManagementApiBaseUrl } from '@/lib/management-api-base'

/**
 * Sends a turned-away booking, or a booking form signal, to the management app so it can be
 * counted (BK-101, BK-191; customer bookings review of 24 October 2026).
 *
 * The website has no database. Its refusals and failures used to reach one log line in Vercel
 * and stop there, so nobody could count them or see a fault between the two systems. Each one
 * now also goes to the management app as a row it keeps (booking_funnel_events), which feeds one
 * daily summary to the manager inbox (owner decision D17) and the weekly funnel on the table
 * bookings reports page.
 *
 * What is sent is codes and nothing else: the route, refused or failed, the HTTP status, a
 * reason code, the booking system's own code, and the page path the reporter has already
 * stripped of ids. No name, phone number, email address, reference or anything a guest typed.
 * The management app checks every field against a fixed shape as well.
 *
 * Live site only, like the alert email: a preview, a test run or a laptop must not count as
 * real guests. It never throws and gives up after a short wait, so a guest is never held up
 * by it for long; what happened is returned for the caller's log line.
 */

export const BOOKING_FUNNEL_ENDPOINT = '/website/booking-funnel'
export const BOOKING_FUNNEL_TIMEOUT_MS = 1500

export type TurnedAwayRecord = {
  route: string
  kind: 'refused' | 'failed'
  status: number | null
  reason: string
  upstreamCode?: string
  page?: string
}

export type BookingFormSignalRecord = {
  form: 'event_booking'
  step: 'opened' | 'submit_pressed' | 'blocked' | 'sent'
  reason?: 'missing_fields' | 'no_security_token' | 'server_refused' | 'network' | null
  page?: string | null
}

export type BookingFunnelSendResult = { recorded: boolean; reason: string }

function isProductionDeployment(): boolean {
  return process.env.VERCEL_ENV === 'production'
}

async function post(body: Record<string, unknown>): Promise<BookingFunnelSendResult> {
  try {
    if (!isProductionDeployment()) return { recorded: false, reason: 'not_production' }
    const apiKey = process.env.ANCHOR_API_KEY
    if (!apiKey) return { recorded: false, reason: 'api_key_missing' }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), BOOKING_FUNNEL_TIMEOUT_MS)
    try {
      const response = await fetch(`${getManagementApiBaseUrl()}${BOOKING_FUNNEL_ENDPOINT}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: controller.signal
      })
      return response.ok ? { recorded: true, reason: 'recorded' } : { recorded: false, reason: `http_${response.status}` }
    } finally {
      clearTimeout(timer)
    }
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    return { recorded: false, reason: name === 'AbortError' ? 'timed_out' : 'request_failed' }
  }
}

/** A refusal or failure, as the reporter wrote it to its log line. */
export function recordTurnedAway(record: TurnedAwayRecord): Promise<BookingFunnelSendResult> {
  return post({
    type: 'refusal',
    route: record.route,
    kind: record.kind,
    status: record.status,
    reason: record.reason,
    upstream_code: record.upstreamCode ?? null,
    page: record.page ?? null
  })
}

/** A booking form opening, being submitted, being blocked before it sent, or sending. */
export function recordBookingFormSignal(signal: BookingFormSignalRecord): Promise<BookingFunnelSendResult> {
  return post({
    type: 'form',
    form: signal.form,
    step: signal.step,
    reason: signal.step === 'blocked' ? signal.reason ?? null : null,
    page: signal.page ?? null
  })
}
