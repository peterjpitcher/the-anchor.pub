// Bumped to v2 on 2026-08-09, when the table booking form moved to the compact notice
// and that notice began covering EMAIL as well as SMS. The version is the record of what
// a guest was actually shown, so it has to move whenever the words do, or a later dispute
// is settled against wording that guest never saw.
//
// Both the client payload and the server sanitiser read this same constant
// (lib/communication-consent-server.ts pins it with z.literal), so there is exactly one
// place to change and no way for the two to drift.
export const GUEST_COMMS_CONSENT_TEXT_VERSION = 'guest-comms-consent-v2'

export const GUEST_SERVICE_CONTACT_NOTICE =
  'We will use your phone and email to manage this booking, including confirmations, reminders, payment links, waitlist updates, and changes.'

// Naming the actual nights ("quiz, bingo and live music") rather than the generic
// "events and offers" gives the guest something concrete to say yes to. The old
// wording read as a mailing list and was ticked by 1 of 71 guests, which left the
// venue with almost nobody it was allowed to invite to its own events.
export const GUEST_MARKETING_EMAIL_LABEL =
  'Email me when quiz nights, bingo and live music are coming up.'
export const GUEST_MARKETING_SMS_LABEL =
  'Text me when quiz nights, bingo and live music are coming up.'
export const GUEST_WHATSAPP_SERVICE_LABEL = 'Send booking updates by WhatsApp.'
export const GUEST_MARKETING_WHATSAPP_LABEL = 'Send me WhatsApp event and offer updates.'

// Compact notice for the event booking form. Four tick boxes on a £5 bingo
// booking cost more conversions than the explicit consent was worth, and the
// venue does not need that consent to invite a past guest to its next event:
// UK PECR soft opt-in covers marketing your own similar services to someone whose
// details you took during a booking, provided they are given a simple way to
// refuse. This notice is that simple way, and `marketing_sms_opted_out_at`
// (set by the NOEVENTS keyword in the management app) is what honours it.
//
// Deliberately no WhatsApp here. WhatsApp business messaging needs explicit
// opt-in under Meta's own platform rules, which soft opt-in does not satisfy, so
// it is simply not offered at booking time rather than quietly assumed.
export const GUEST_COMPACT_CONSENT_NOTICE =
  'We will use your phone and email to manage this booking, and to text you about upcoming quiz nights, bingo and live music. Reply NOEVENTS to any message to stop event texts.'

// The table-booking version of the same notice, which also covers EMAIL.
//
// A sibling constant rather than an edit to the one above, because that one is the record
// of what event bookers were shown and changing it would rewrite history for consents
// already stored against it.
//
// Two refusal routes are named because there are genuinely two, and a notice that offers
// only one is not the "simple way to refuse" that soft opt-in requires. NOEVENTS stops
// texts and is honoured by `marketing_sms_opted_out_at`; the unsubscribe link stops email
// and is honoured by `marketing_email_opted_out_at`, via /api/unsubscribe in the
// management app. Neither touches booking confirmations, and the notice says so, because
// the commonest reason a guest will not give an email address is fear of losing the
// confirmation for the table they are in the middle of booking.
//
// Still deliberately no WhatsApp. Meta's platform rules require explicit opt-in, which
// soft opt-in does not satisfy, so it is not offered at booking time rather than assumed.
export const GUEST_TABLE_COMPACT_CONSENT_NOTICE =
  'We will use your phone and email to manage this booking, and to let you know about upcoming quiz nights, bingo and live music. Reply NOEVENTS to stop texts, or use the unsubscribe link in any email. Booking confirmations and reminders carry on either way.'

export type CommunicationConsentPayload = {
  service_contact_notice_shown: boolean
  marketing_email_opt_in: boolean
  marketing_sms_opt_in: boolean
  whatsapp_opt_in: boolean
  marketing_whatsapp_opt_in: boolean
  consent_text_version: string
}

export type CommunicationConsentState = Omit<
  CommunicationConsentPayload,
  'service_contact_notice_shown' | 'consent_text_version'
>

export const DEFAULT_COMMUNICATION_CONSENT_STATE: CommunicationConsentState = {
  marketing_email_opt_in: false,
  marketing_sms_opt_in: false,
  whatsapp_opt_in: false,
  marketing_whatsapp_opt_in: false,
}

export function buildCommunicationConsentPayload(
  state: CommunicationConsentState
): CommunicationConsentPayload {
  return {
    service_contact_notice_shown: true,
    marketing_email_opt_in: state.marketing_email_opt_in === true,
    marketing_sms_opt_in: state.marketing_sms_opt_in === true,
    whatsapp_opt_in: state.whatsapp_opt_in === true,
    marketing_whatsapp_opt_in: state.marketing_whatsapp_opt_in === true,
    consent_text_version: GUEST_COMMS_CONSENT_TEXT_VERSION,
  }
}
