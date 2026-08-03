import type { BookingAttributionPayload } from '@/lib/booking-attribution'
import {
  buildCommunicationConsentPayload,
  type CommunicationConsentState,
} from '@/lib/communication-consent'

/**
 * What is sent when a guest confirms, and what comes back.
 *
 * The one rule the payload builder exists to hold: the volatile fields (`_t`,
 * `turnstile_token`, `website`) go on LAST, after the idempotency key has
 * already been chosen, so they can never influence the submit-intent
 * fingerprint. A retry of the same booking has to look like the same booking.
 */

export type CustomerLookupState = 'idle' | 'loading' | 'known' | 'unknown'

// The pre-verification lookup deliberately identifies nobody (review F10):
// the route answers whether the number is known and nothing else. Known
// customers keep their skip-the-details flow; the management API resolves the
// customer record server-side from the phone number at booking time.
export type CustomerLookupResult = {
  known: boolean
  lookup_degraded?: boolean
}

export function parseLookupResponse(payload: any): CustomerLookupResult {
  const data = payload?.data || payload
  return {
    known: Boolean(data?.known),
    lookup_degraded: Boolean(data?.lookup_degraded)
  }
}

export type ManagementTableBookingResult = {
  state: 'confirmed' | 'pending_payment' | 'blocked'
  table_booking_id: string | null
  booking_reference: string | null
  reason: string | null
  blocked_reason:
    | 'outside_hours'
    | 'cut_off'
    | 'no_table'
    | 'private_booking_blocked'
    | 'too_large_party'
    | 'customer_conflict'
    | 'in_past'
    | 'slot_full'
    | 'blocked'
    | null
  next_step_url: string | null
  hold_expires_at: string | null
  table_name: string | null
  notification_channel?: 'email' | 'whatsapp' | 'sms' | null
  booking_id?: string
  deposit_amount?: number
  // Set by the management API when inline PayPal setup fails for a 10+ booking.
  // Surfaced to the customer as a recovery link alongside the call-us copy.
  // See spec §6 ("Failed-PayPal recovery") and §8.1 (PayPal failure recovery).
  fallback_payment_url?: string | null
  payment_required?: boolean
  // High chairs actually reserved by the server (may be < requested), the
  // requested count echoed back, and the outside-seating flag. Used on the
  // confirmation screen to reflect the granted result (spec §10).
  high_chairs_granted?: number
  high_chair_count?: number
  is_outside_seating?: boolean
}

export const BLOCKED_REASON_COPY: Record<string, string> = {
  outside_hours: 'That time is outside our booking hours. Please choose another time or call us.',
  cut_off: 'Online bookings for that slot are now closed. Please call us and we will try to help.',
  no_table: 'No tables available at that time. Try a different time or give us a call on 01753 682707.',
  private_booking_blocked: 'This slot is unavailable because of a private event.',
  too_large_party: 'For larger groups, please call us so we can arrange your booking.',
  customer_conflict: 'You already have a nearby booking. Please call us if you need help changing it.',
  in_past: 'That booking time is in the past. Please choose a future date and time.',
  // The kitchen's pacing ceiling for that arrival window, not the tables. The
  // management API has always been able to answer slot_full and the website had
  // no copy for it, so a genuine pacing refusal fell through to the generic
  // line below and told the guest nothing they could act on.
  slot_full: 'Our kitchen is fully booked around that time. Please try a slightly earlier or later slot, or give us a ring on 01753 682707.',
  blocked: 'This slot is not available for online booking right now.'
}

export function confirmationDeliveryCopy(
  channel?: ManagementTableBookingResult['notification_channel']
): string {
  if (channel === 'email') return "We've sent confirmation details by email."
  if (channel === 'whatsapp') return "We've sent confirmation details by WhatsApp."
  if (channel === 'sms') return "We've sent confirmation details by SMS."
  return "We've sent confirmation details."
}

export type TableBookingSubmitInput = {
  phone: string
  firstName: string
  lastName: string
  /** Known customers submit no email; the management API resolves their record. */
  email?: string
  date: string
  time: string
  partySize: number
  purpose: 'food' | 'drinks'
  notes: string
  highChairCount: number
  isOutsideSeating: boolean
  requiresAccessibleTable: boolean
  communicationConsent: CommunicationConsentState
  /**
   * The seasonal period the guest was shown and what they answered, or null when
   * no period applied. Never a deposit figure: AMS prices that.
   */
  seasonalAnswer: { periodId: string; accepted: boolean } | null
  attribution: BookingAttributionPayload & Record<string, unknown>
  /** Volatile: excluded from the submit-intent fingerprint by construction. */
  turnstileToken: string | null
  website: string
  secondsOnForm: number
}

/**
 * The create-booking request body.
 *
 * Public payload no longer carries sunday_lunch / menu_selections / booking_type.
 * The proxy at /api/table-bookings strips these defensively (spec §6, §8.1)
 * and always forwards booking_type='regular' to the management API.
 * `purpose` is read from the slot's authoritative `bookable_purpose`,
 * see deriveSubmitPurpose().
 */
export function buildTableBookingPayload(
  input: TableBookingSubmitInput
): Record<string, unknown> {
  return {
    phone: input.phone,
    default_country_code: '44',
    ...(input.firstName ? { first_name: input.firstName } : {}),
    ...(input.lastName ? { last_name: input.lastName } : {}),
    ...(input.email ? { email: input.email } : {}),
    date: input.date,
    time: input.time,
    party_size: input.partySize,
    purpose: input.purpose,
    ...(input.notes ? { notes: input.notes } : {}),
    // High-chair request (0 omitted) and outside-seating flag (false omitted).
    // Added before the idempotency key so it varies with them (spec §10).
    ...(input.highChairCount > 0 ? { high_chair_count: input.highChairCount } : {}),
    ...(input.isOutsideSeating ? { is_outside_seating: true } : {}),
    ...(input.requiresAccessibleTable ? { requires_accessible_table: true } : {}),
    // The seasonal answer sits ABOVE the volatile section on purpose, so it is
    // part of the submit-intent fingerprint. It changes what the guest is
    // charged, so a guest who answers yes, goes back, then answers no must not
    // reuse the idempotency key of the booking they already abandoned.
    ...(input.seasonalAnswer
      ? {
          booking_period_id: input.seasonalAnswer.periodId,
          booking_period_answer: input.seasonalAnswer.accepted
        }
      : {}),
    communication_consent: buildCommunicationConsentPayload(input.communicationConsent),
    ...input.attribution,
    // Volatile fields below, added after the idempotency key has already
    // been selected so they cannot influence the submit-intent fingerprint.
    ...(input.turnstileToken ? { turnstile_token: input.turnstileToken } : {}),
    ...(input.website ? { website: input.website } : {}),
    _t: input.secondsOnForm
  }
}

/**
 * Echo back what the guest asked for when the API build does not.
 *
 * The confirmation screen shows granted-of-requested for high chairs, so it
 * needs the request as well as the grant. Older API builds do not return either
 * field; falling back to the submitted values keeps the screen honest rather
 * than silently reporting nothing was asked for.
 */
export function applyRequestedExtras(
  result: ManagementTableBookingResult,
  requested: { highChairCount: number; isOutsideSeating: boolean }
): ManagementTableBookingResult {
  if (requested.highChairCount > 0 && result.high_chair_count === undefined) {
    result.high_chair_count = requested.highChairCount
  }
  if (result.is_outside_seating === undefined && requested.isOutsideSeating) {
    result.is_outside_seating = true
  }
  return result
}
