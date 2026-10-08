/**
 * Booking references and booking ids never go into an analytics payload.
 *
 * A reference is how the pub finds a named booking, so sending it to Google
 * next to a visitor's session made that session joinable to a person. The rule
 * at the top of lib/gtm-events.ts already said so; six events broke it, and the
 * purchase event used the reference as its transaction id (site review,
 * 7 October 2026).
 *
 * Two things live here, and both run in the browser dispatcher and again in
 * app/api/analytics/route.ts, so a browser still running an older bundle is
 * covered as well:
 *
 *   1. `analyticsSaleId` turns a booking id or reference into the id a sale is
 *      counted under. Google only needs it to be the same every time the same
 *      booking is reported, so that one sale is counted once.
 *   2. `stripBookingIdentifiers` removes the fields that carried a reference
 *      or id, and makes sure `transaction_id` is a sale id.
 *
 * What a sale id is and is not: it is a one-way digest, so it cannot be turned
 * back into a reference and it matches nothing in the booking system as it
 * stands. It is not a secret. Somebody holding the pub's full list of
 * references could work out which digest belongs to which. That is the price
 * of counting each sale once without storing anything new.
 */

const SALE_ID = /^sale_[0-9a-f]{16}$/

/** Mixed into every digest so it matches nobody else's hash of the same text. */
const NAMESPACE = 'the-anchor.pub/analytics-sale-id/v1:'

/**
 * A 64-bit, non-reversible digest (the widely used cyrb53 mixing steps, kept
 * at two full 32-bit halves). Synchronous on purpose: tracking helpers are
 * called from event handlers and cannot wait for the browser's async crypto.
 * Wide enough that two bookings sharing a sale id is not a practical concern.
 */
function digest(text: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const hex = (value: number) => (value >>> 0).toString(16).padStart(8, '0')
  return `${hex(h2)}${hex(h1)}`
}

export function isAnalyticsSaleId(value: unknown): value is string {
  return typeof value === 'string' && SALE_ID.test(value)
}

/**
 * The id a sale is reported under. The same booking always gives the same id.
 * Something that is already a sale id is returned as it is, so applying this
 * twice (browser, then server) changes nothing. Nothing usable gives undefined.
 */
export function analyticsSaleId(bookingKey: unknown): string | undefined {
  if (typeof bookingKey !== 'string' && typeof bookingKey !== 'number') return undefined
  const key = String(bookingKey).trim()
  if (!key) return undefined
  if (isAnalyticsSaleId(key)) return key
  return `sale_${digest(`${NAMESPACE}${key}`)}`
}

/**
 * Fields that carried a booking reference or id. The camelCase forms are here
 * because a payload built by spreading a component's own object would use them.
 */
export const BOOKING_IDENTIFIER_FIELDS: readonly string[] = [
  'booking_reference',
  'booking_id',
  'table_booking_id',
  'bookingReference',
  'bookingId',
  'tableBookingId',
]

/**
 * The last line of defence, applied to every payload on its way out: the
 * identifier fields are removed and `transaction_id` is made a sale id. A new
 * event that forgets the rule is therefore corrected rather than sent.
 */
export function stripBookingIdentifiers(payload: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(payload)) {
    if (BOOKING_IDENTIFIER_FIELDS.includes(key)) continue
    if (key === 'transaction_id') {
      const saleId = analyticsSaleId(value)
      if (saleId !== undefined) cleaned[key] = saleId
      continue
    }
    cleaned[key] = value
  }
  return cleaned
}
