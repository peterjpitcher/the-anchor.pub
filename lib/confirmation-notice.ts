import { CONFIRMED_BY_A_PERSON_WORDING } from '@/lib/guest-error-messages'

/**
 * Was the guest sent a confirmation? Only the booking system knows.
 *
 * The management app answers a table booking and an event booking with
 * `notification_sent`, and with `notification_channel` naming how the message
 * went. A confirmation screen may say "we've sent you a message" only when
 * `notification_sent` is exactly `true`.
 *
 * Everything else reads as not sent: `false`, a missing field, `null`, the
 * string "true", and a channel that arrives without the flag. A guest told a
 * message is coming waits for it; a guest told nothing and given the phone
 * number loses nothing. So a missing field must never read as "sent".
 *
 * No server-only imports: the forms use this directly.
 */

export type ConfirmationChannel = 'email' | 'whatsapp' | 'sms'

export type ConfirmationNotice = {
  notification_sent?: unknown
  notification_channel?: unknown
}

export function wasConfirmationSent(notice: ConfirmationNotice | null | undefined): boolean {
  return notice?.notification_sent === true
}

/** The channel a message went by, or null when none went or it is not one we name. */
export function confirmationChannel(notice: ConfirmationNotice | null | undefined): ConfirmationChannel | null {
  if (!wasConfirmationSent(notice)) return null
  const channel = notice?.notification_channel
  return channel === 'email' || channel === 'whatsapp' || channel === 'sms' ? channel : null
}

/**
 * The sentence about the confirmation message, or null when none is known to
 * have gone. Never guesses a channel: a sent message with no channel named is
 * "sent", not "sent by text".
 */
export function confirmationSentCopy(notice: ConfirmationNotice | null | undefined): string | null {
  if (!wasConfirmationSent(notice)) return null
  const channel = confirmationChannel(notice)
  if (channel === 'email') return "We've sent confirmation details by email."
  if (channel === 'whatsapp') return "We've sent confirmation details by WhatsApp."
  if (channel === 'sms') return "We've sent confirmation details by SMS."
  return "We've sent you confirmation details."
}

/**
 * One line for a confirmation screen: the message that went, or, when none is
 * known to have gone, the way to have the booking confirmed by a person.
 */
export function confirmationNoticeCopy(notice: ConfirmationNotice | null | undefined): string {
  return confirmationSentCopy(notice) ?? CONFIRMED_BY_A_PERSON_WORDING
}
