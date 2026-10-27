/**
 * A no-personal-data signal from the event booking form (BK-191, customer bookings review of
 * 24 October 2026).
 *
 * The 20 November tasting night had no bookings and nobody reached the payment step, and the
 * page counts were mostly crawlers, so there was no way to tell a form people open and give up
 * on from one that is broken. The form now says when it is opened, when booking is pressed,
 * when it was blocked before sending (and why, from a fixed list) and when a booking went
 * through. The management app counts them and the daily summary of turned-away bookings shows
 * them: "opened 40, pressed 0" is a broken form; "opened 40, pressed 3, sent 3" is a quiet month.
 *
 * Only the step and a reason from a fixed list are sent. Never a name, a number, a date, a
 * ticket count or anything typed, and no cookie or storage is read or written, so it runs
 * whatever the visitor chose about analytics. Never throws: a signal must not break the form.
 */

export type BookingFormSignalStep = 'opened' | 'submit_pressed' | 'blocked' | 'sent'
export type BookingFormSignalReason = 'missing_fields' | 'no_security_token' | 'server_refused' | 'network'

export const BOOKING_FORM_SIGNAL_PATH = '/api/booking-form-signal'

export function sendEventBookingFormSignal(step: BookingFormSignalStep, reason?: BookingFormSignalReason): void {
  try {
    const body = JSON.stringify({ form: 'event_booking', step, ...(step === 'blocked' && reason ? { reason } : {}) })
    // A beacon only: every browser the site supports has one, it survives the
    // page changing to the payment step, and it never competes with the form's
    // own requests. Where there is none, the signal is simply not sent.
    if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return
    navigator.sendBeacon(BOOKING_FORM_SIGNAL_PATH, new Blob([body], { type: 'application/json' }))
  } catch {
    // Never let a signal break the form.
  }
}
