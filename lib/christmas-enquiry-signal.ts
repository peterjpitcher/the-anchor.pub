/**
 * A no-personal-data signal from the Christmas enquiry forms (BK-190).
 *
 * No website Christmas enquiry reached the management app between 18 September and the review on
 * 24 October 2026. That may just be the season (last year's first came on 26 November), but a dead
 * form would look exactly the same, because its button stayed disabled until the security check
 * passed and a button nobody can press sends nothing. These signals make the difference visible in
 * the server logs: "opened 40 times, submit pressed 0" is a broken form; "opened 40, pressed 3,
 * sent 3" is a quiet month.
 *
 * Only the stage, which form, the journey and a reason from a fixed list are sent. Never a name, a
 * number, a date or anything typed, and no cookie or storage is read or written, so it runs whatever
 * the visitor chose about analytics. Never throws: a signal must not break the form.
 */

export type ChristmasEnquirySignalStage = 'opened' | 'submit_pressed' | 'blocked' | 'sent'
export type ChristmasEnquirySignalForm = 'main' | 'quick'
export type ChristmasEnquirySignalReason =
  | 'missing_fields'
  | 'date'
  | 'courses'
  | 'consent'
  | 'no_security_token'
  | 'server_refused'
  | 'network'

export const CHRISTMAS_ENQUIRY_SIGNAL_PATH = '/api/enquiry/christmas/signal'

export function sendChristmasEnquirySignal(
  stage: ChristmasEnquirySignalStage,
  details: { form: ChristmasEnquirySignalForm; mode?: 'meal' | 'party'; reason?: ChristmasEnquirySignalReason }
): void {
  try {
    const body = JSON.stringify({ stage, form: details.form, mode: details.mode, reason: details.reason })
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(CHRISTMAS_ENQUIRY_SIGNAL_PATH, new Blob([body], { type: 'application/json' }))
      return
    }
    if (typeof fetch !== 'function') return
    void fetch(CHRISTMAS_ENQUIRY_SIGNAL_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {
      // A dropped signal is not worth telling the visitor about.
    })
  } catch {
    // Never let a signal break the form.
  }
}
