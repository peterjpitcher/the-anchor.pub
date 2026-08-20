// Bumped to v2 on 2026-08-09, when the table booking form moved to the compact notice
// and that notice began covering EMAIL as well as SMS. The version is the record of what
// a guest was actually shown, so it has to move whenever the words do, or a later dispute
// is settled against wording that guest never saw.
//
// Bumped to v3 on 2026-08-11, when live music was dropped from every notice below.
// Live music is discontinued in full (docs/SSOT.md §"Live Music, DISCONTINUED"), so
// naming it was promising a guest texts about a night that will never happen again.
// Narrowing what we name does not invalidate a v2 consent, quiz and bingo were already
// covered by it, so nobody needs re-consenting. The bump exists purely so the stored
// version still points at the words that guest actually read.
//
// Bumped to v4 on 2026-08-19, because every notice below under-described what is actually
// sent. They named the three game nights only, but the "Lunch from September 2026" campaign
// had already gone to this same list, and the venue confirmed the real scope as: what is on,
// new menu releases, and offers and deals.
//
// This is a widening of the description, not of the legal basis. Food and drink offers to
// someone who booked a table are squarely "our own similar services" under the PECR soft
// opt-in, so nothing sent so far was outside it. The defect was that a guest reading the
// notice would not have expected a menu email, and a notice that under-describes is not the
// clear information the basis depends on. Concrete wording is kept, because the generic
// "events and offers" phrasing this replaced was ticked by 1 of 71 guests.
//
// Bumped to v5 on 2026-08-20. The venue confirmed the scope is wider again than v4
// described: not only what is on, new menus and offers, but the latest from The Anchor
// generally, including changes as they happen (a menu launch, altered hours, a new offer).
// v4 named three categories and the venue sends four, so the notice was under-describing
// again, in the same way and for the same reason it did before v4.
//
// Still a widening of the DESCRIPTION, not of the legal basis. Soft opt-in reaches "our own
// similar services", and news about the pub's own offering sits inside that. It would not
// stretch to anything about a third party, and nothing here should ever name one.
//
// Both the client payload and the server sanitiser read this same constant
// (lib/communication-consent-server.ts pins it with z.literal), so there is exactly one
// place to change and no way for the two to drift.
export const GUEST_COMMS_CONSENT_TEXT_VERSION = 'guest-comms-consent-v5'

export const GUEST_SERVICE_CONTACT_NOTICE =
  'We will use your phone and email to manage this booking, including confirmations, reminders, payment links, waitlist updates, and changes.'

// Naming the actual nights ("quiz nights, music bingo and cash bingo") rather than the
// generic "events and offers" gives the guest something concrete to say yes to. The old
// wording read as a mailing list and was ticked by 1 of 71 guests, which left the
// venue with almost nobody it was allowed to invite to its own events.
//
// Only formats that actually still run may be named here. Live music was removed on
// 2026-08-11 because it is discontinued in full (docs/SSOT.md §"Live Music,
// DISCONTINUED"). Karaoke and the occasional DJ are deliberately not named either:
// both are occasional and only promotable where a specific event record lists them,
// which a standing consent label cannot guarantee.
//
// Widened at v4 to name menus and offers alongside the game nights. Anyone who ticks these
// becomes eligible for exactly the same campaigns as a past booker, so a label naming only
// the game nights was describing a narrower list than the one they were joining.
export const GUEST_MARKETING_EMAIL_LABEL =
  'Email me the latest from The Anchor: quiz nights and bingo, new menus, offers, and any changes.'
export const GUEST_MARKETING_SMS_LABEL =
  'Text me the latest from The Anchor: quiz nights and bingo, new menus, offers, and any changes.'
export const GUEST_WHATSAPP_SERVICE_LABEL = 'Send booking updates by WhatsApp.'
export const GUEST_MARKETING_WHATSAPP_LABEL =
  'Send me WhatsApp updates on what is on, new menus, offers, and any changes.'

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
  'We will use your phone and email to manage this booking, and to text you the latest from The Anchor: what is on, new menus, offers, and any changes. Reply NOEVENTS to any message to stop those texts.'

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
  'We will use your phone and email to manage this booking, and to send you the latest from The Anchor: what is on, new menus, offers, and any changes. Reply NOEVENTS to stop texts, or use the unsubscribe link in any email. Booking confirmations and reminders carry on either way.'

// ── Newsletter, the website sign-up ─────────────────────────────────────────
//
// A separate consent surface from everything above, with its own version lineage, because
// it is a different legal animal. Everything above is soft opt-in taken during a booking,
// so its reach is capped at "our own similar services" no matter how it is worded. The
// newsletter is EXPLICIT consent, freely given by someone who came looking for it.
//
// Since v4 widened the booking notices to name menus and offers too, the two now describe
// almost the same content. The one thing only this label promises is EARLY BOOKING for paid
// events ("first chance to book"), which is a genuine benefit rather than a wider category
// of message, and which the venue confirmed on 2026-08-19 that it offers.
//
// Versioned independently as `guest-newsletter-consent-v*` so that changing the newsletter
// wording never touches GUEST_COMMS_CONSENT_TEXT_VERSION, and vice versa. Bumping the
// booking version for a newsletter edit would rewrite history for every booking consent
// already stored against it.
export const GUEST_NEWSLETTER_CONSENT_TEXT_VERSION = 'guest-newsletter-consent-v1'

// Named concretely for the same measured reason as GUEST_MARKETING_EMAIL_LABEL: the old
// generic "events and offers" wording read as a mailing list and was ticked by 1 of 71
// guests. "Quiz nights and bingo" is concrete; "new menus" and "first chance to book" are
// the two things a regular actually wants and cannot get anywhere else.
//
// Still no karaoke and no DJ nights, matching the labels above: both are occasional and
// only promotable where a specific event record lists them, which a standing label cannot
// guarantee. Still no live music, which is discontinued in full.
export const GUEST_NEWSLETTER_LABEL =
  'Email me the latest from The Anchor: quiz nights and bingo, new menus, offers, any changes, and first chance to book.'

// Sits under the sign-up field. States the scope again in sentence form, and names the way
// out, which is what makes the consent valid rather than merely obtained.
//
// Deliberately promises NO frequency. Nothing in docs/SSOT.md supports a cadence
// commitment, and a broken "weekly" promise is a leading cause of unsubscribes.
export const GUEST_NEWSLETTER_SCOPE_NOTICE =
  'We will email you the latest from The Anchor: upcoming events, new menus, offers and deals, anything that is changing, and early booking for paid events. Every email has an unsubscribe link, and we never pass your address to anyone else.'

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
