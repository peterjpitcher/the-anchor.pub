/**
 * Single source of truth for the CheersAI app's origin.
 *
 * Both integrations with CheersAI (booking-conversion ingest and the tournament
 * fixture feed) previously carried their own hardcoded `https://www.cheersai.uk`
 * fallback. That made the dependency invisible: production never set an override,
 * so a domain change would have broken both silently. Everything now derives from
 * one required variable.
 *
 * `CHEERSAI_BASE_URL` is an origin only, with no path and no trailing slash, for
 * example `https://cheers.orangejelly.co.uk`.
 */

/**
 * Used outside production so local development and tests work without extra
 * setup. Deliberately not used in production: see `getCheersAiBaseUrl`.
 */
const NON_PRODUCTION_FALLBACK = 'https://cheers.orangejelly.co.uk'

/**
 * Resolve the CheersAI origin.
 *
 * Throws in production when unset rather than falling back, because a silent
 * fallback to a hostname that may no longer resolve is the failure mode this
 * module exists to prevent.
 */
export function getCheersAiBaseUrl(): string {
  const configured = process.env.CHEERSAI_BASE_URL?.trim()

  if (configured) {
    return configured.replace(/\/+$/, '')
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('CHEERSAI_BASE_URL environment variable is not set')
  }

  return NON_PRODUCTION_FALLBACK
}

/** Booking-conversion ingest endpoint. Requires a bearer secret. */
export function bookingConversionsUrl(): string {
  return `${getCheersAiBaseUrl()}/api/booking-conversions`
}

/** Tournament fixture feed endpoint. Requires an `x-api-key` header. */
export function tournamentFeedUrl(tournamentId: string): string {
  return `${getCheersAiBaseUrl()}/api/feed/${tournamentId}`
}
