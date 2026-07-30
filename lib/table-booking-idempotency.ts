import type { CommunicationConsentState } from '@/lib/communication-consent'

/**
 * The booking fields that define a distinct submit intent on the website.
 * Mirrors the AMS field set in `src/lib/table-bookings/booking-idempotency.ts`
 * so the two sides agree on what makes a booking "the same booking".
 *
 * Volatile anti-bot / telemetry fields (`_t`, `turnstile_token`, `website`) are
 * deliberately excluded: they change between retries of the same intent.
 */
export type TableBookingSubmitIntentFields = {
  phone: string
  firstName?: string
  lastName?: string
  email?: string
  date: string
  time: string
  partySize: number
  purpose: 'food' | 'drinks'
  notes?: string
  highChairCount: number
  isOutsideSeating: boolean
  requiresAccessibleTable?: boolean
  communicationConsent: CommunicationConsentState
}

/**
 * A fresh Idempotency-Key. Prefers a real UUID; the timestamp-plus-random
 * fallback covers browsers where crypto.randomUUID is unavailable, including
 * any insecure origin.
 */
export function createClientIdempotencyKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

/**
 * Stable JSON fingerprint of a submit intent. The form reuses its cached
 * Idempotency-Key while this string is unchanged, and mints a fresh one the
 * moment any field that changes what is booked changes.
 */
export function buildSubmitIntentFingerprint(input: TableBookingSubmitIntentFields): string {
  return JSON.stringify({
    phone: input.phone.trim(),
    firstName: input.firstName?.trim() || '',
    lastName: input.lastName?.trim() || '',
    email: input.email?.trim() || '',
    date: input.date,
    time: input.time,
    partySize: input.partySize,
    purpose: input.purpose,
    notes: input.notes?.trim() || '',
    highChairCount: input.highChairCount,
    isOutsideSeating: input.isOutsideSeating,
    communicationConsent: input.communicationConsent,
    // Accessibility varies the fingerprint ONLY when requested, matching the
    // AMS request hash exactly. JSON.stringify drops undefined entries, so an
    // absent-or-false flag produces byte-for-byte the fingerprint this form
    // produced before the field existed: a guest mid-journey across a deploy
    // keeps their key and replays cleanly instead of minting a second booking.
    requiresAccessibleTable: input.requiresAccessibleTable === true ? true : undefined
  })
}
