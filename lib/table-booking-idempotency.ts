import type { CommunicationConsentState } from '@/lib/communication-consent'
import type { TableBookingPreorderEntry } from '@/lib/table-booking/submission'

/**
 * The booking fields that define a distinct submit intent on the website.
 * Mirrors the AMS field set in `src/lib/table-bookings/booking-idempotency.ts`
 * so the two sides agree on what makes a booking "the same booking".
 *
 * Volatile anti-bot / telemetry fields (`_t`, `turnstile_token`, `website`) are
 * deliberately excluded: they change between retries of the same intent.
 */
export type TableBookingSubmitIntentFields = {
  christmas_course_counts?: Array<number | null | undefined>
  phone: string
  firstName?: string
  lastName?: string
  email?: string
  date: string
  time: string
  partySize: number
  purpose: 'food' | 'drinks'
  notes?: string
  fixtureId?: string
  highChairCount: number
  isOutsideSeating: boolean
  requiresAccessibleTable?: boolean
  /**
   * The seasonal period the guest was shown and what they answered, or absent when no
   * period applied. Sent as a pair or not at all, matching the payload builder.
   */
  bookingPeriodId?: string
  bookingPeriodAnswer?: boolean
  /** What each guest is eating, in seat order. Absent when none was collected. */
  preorder?: TableBookingPreorderEntry[]
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
    fixtureId: input.fixtureId || undefined,
    highChairCount: input.highChairCount,
    isOutsideSeating: input.isOutsideSeating,
    communicationConsent: input.communicationConsent,
    // Accessibility varies the fingerprint ONLY when requested, matching the
    // AMS request hash exactly. JSON.stringify drops undefined entries, so an
    // absent-or-false flag produces byte-for-byte the fingerprint this form
    // produced before the field existed: a guest mid-journey across a deploy
    // keeps their key and replays cleanly instead of minting a second booking.
    requiresAccessibleTable: input.requiresAccessibleTable === true ? true : undefined,
    // The seasonal answer changes the menu, the deposit and the refund terms, so AMS
    // hashes it and a guest who flips their Christmas answer and resubmits would send
    // the same key with a different hash and be answered 409. Same
    // undefined-when-absent handling as accessibility above, so the eleven months of
    // the year with no live period keep the pre-change fingerprint byte for byte.
    // `false` is a real answer ("no thanks, the normal menu"), so this tests the TYPE
    // and never the truthiness.
    bookingPeriodId: input.bookingPeriodId?.trim() || undefined,
    bookingPeriodAnswer:
      typeof input.bookingPeriodAnswer === 'boolean' ? input.bookingPeriodAnswer : undefined,
    // AMS hashes the pre-order for the same reason it hashes the seasonal
    // answer, so this has to match or a guest who corrects a dish and resubmits
    // sends the old key with a new payload and is answered 409. Seat ORDER is
    // preserved because position is the seat; add-on tick order is not
    // meaningful and is sorted, exactly as AMS does it. Absent and empty both
    // produce the pre-change fingerprint byte for byte.
    christmas_course_counts: input.christmas_course_counts ?? undefined,
    preorder: input.preorder?.length
      ? input.preorder.map((entry) => ({
          starter: entry.starter_menu_item_id || null,
          main: entry.main_menu_item_id || null,
          dessert: entry.dessert_menu_item_id || null,
          addons: [...new Set(entry.addon_menu_item_ids ?? [])].sort()
        }))
      : undefined
  })
}
