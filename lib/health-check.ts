import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { missingRequiredEnv } from '@/lib/required-env'

/**
 * A health check that checks something.
 *
 * This used to return `{ status: 'ok' }` from a handler that never touched the
 * request, so Next.js built it once as a static file: it answered "ok" with
 * the build's own timestamp for as long as the deployment lived, with the API
 * key deleted and every booking failing. It also printed the management API's
 * address.
 *
 * It now runs on request and answers two questions:
 *
 *   1. are the settings the forms need present?
 *   2. can this site reach the booking system's hours endpoint with its key?
 *
 * 200 when both hold, 503 with a short reason when either does not. Nothing
 * secret is returned: no address, no key, not even the names of the settings
 * (those go to the log, where the people who can fix them will look).
 *
 * The answer is remembered for a few seconds per server. The check spends one
 * call from the hourly allowance on the website's shared key, and this address
 * is public, so without that anyone refreshing it could use up the allowance
 * that real bookings need. There is no shared store (owner decision 13), so
 * "per server" is the honest description.
 */
const UPSTREAM_TIMEOUT_MS = 4000
const REMEMBER_FOR_MS = 15 * 1000

type CheckResult = 'ok' | 'failed'

export type HealthAnswer = {
  status: 'ok' | 'unavailable'
  reason?: HealthReason
  checks: { settings: CheckResult; bookingSystem: CheckResult | 'not_checked' }
}

export type HealthReason =
  | 'settings_missing'
  | 'booking_system_unreachable'
  | 'booking_system_timed_out'
  | 'booking_system_rejected_key'
  | 'booking_system_error'
  | 'booking_system_unreadable'

let remembered: { at: number; answer: HealthAnswer } | null = null

async function checkBookingSystem(apiKey: string): Promise<HealthReason | null> {
  let response: Response
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    response = await fetch(`${getManagementApiBaseUrl()}/business/hours`, {
      method: 'GET',
      headers: { 'X-API-Key': apiKey },
      cache: 'no-store',
      signal: controller.signal
    })
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    return name === 'TimeoutError' || name === 'AbortError' ? 'booking_system_timed_out' : 'booking_system_unreachable'
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 401 || response.status === 403) return 'booking_system_rejected_key'
  if (!response.ok) return 'booking_system_error'

  // An OK status around a body we cannot read is not the hours endpoint
  // working: a gateway page answers 200 too.
  const body = await response.json().catch(() => null)
  if (!body || typeof body !== 'object') return 'booking_system_unreadable'

  return null
}

async function runChecks(): Promise<HealthAnswer> {
  const missing = missingRequiredEnv()
  if (missing.length > 0) {
    // Names only, and only in the log.
    console.error(`[health] settings missing: ${missing.join(', ')}`)
  }

  const apiKey = process.env.ANCHOR_API_KEY?.trim()
  if (!apiKey) {
    return { status: 'unavailable', reason: 'settings_missing', checks: { settings: 'failed', bookingSystem: 'not_checked' } }
  }

  const bookingSystemFault = await checkBookingSystem(apiKey)
  if (bookingSystemFault) {
    console.error(`[health] ${bookingSystemFault}`)
    return {
      status: 'unavailable',
      reason: bookingSystemFault,
      checks: { settings: missing.length > 0 ? 'failed' : 'ok', bookingSystem: 'failed' }
    }
  }

  if (missing.length > 0) {
    return { status: 'unavailable', reason: 'settings_missing', checks: { settings: 'failed', bookingSystem: 'ok' } }
  }

  return { status: 'ok', checks: { settings: 'ok', bookingSystem: 'ok' } }
}

/** The remembered answer, or a fresh one when it is more than a few seconds old. */
export async function getHealth(): Promise<{ answer: HealthAnswer; checkedAt: string }> {
  const now = Date.now()
  if (!remembered || now - remembered.at >= REMEMBER_FOR_MS) {
    remembered = { at: now, answer: await runChecks() }
  }
  return { answer: remembered.answer, checkedAt: new Date(remembered.at).toISOString() }
}

/** Tests only: forget the remembered answer. */
export function resetHealthCheckForTests(): void {
  remembered = null
}
