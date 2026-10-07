import { BLOCKED_REASON_COPY } from '@/lib/table-booking/submission'

/**
 * One place that turns an answer from the booking system into a sentence a
 * guest can read.
 *
 * The proxy routes used to hand the management app's own wording to the guest,
 * so people were shown `customer_conflict`, `hold_expired`, "Invalid or missing
 * API key", "Rate limit exceeded" and, for a mistyped phone number, a line of
 * JSON. Every route and form now goes through here instead, and two rules hold
 * for whatever comes out:
 *
 *   1. it is a sentence written for a guest, never a code or a parser message;
 *   2. it carries the pub's phone number, so there is always a way forward.
 *
 * An upstream sentence is shown only when it is plainly written for a guest:
 * it carries the phone number itself, or it is on the short list below.
 * Anything else is replaced with our own wording. This file has no server-only
 * imports, so the routes and the forms share it.
 */

export const GUEST_PHONE = '01753 682707'

export type GuestErrorContext =
  | 'table_booking'
  | 'table_deposit'
  | 'table_deposit_capture'
  | 'event_booking'
  | 'event_waitlist'
  | 'event_payment'
  | 'event_payment_capture'
  | 'parking_booking'
  | 'parking_payment'
  | 'parking_payment_capture'
  | 'private_hire'
  | 'christmas_enquiry'
  | 'job_application'
  | 'customer_lookup'
  | 'spam_check'

/** What the guest is told when nothing more specific is known. */
export const GUEST_FALLBACK: Record<GuestErrorContext, string> = {
  table_booking: 'We could not process your booking right now. Please call 01753 682707.',
  table_deposit:
    'We could not start your deposit payment. Please try again, or call us on 01753 682707 and we will sort it out over the phone.',
  table_deposit_capture:
    'We could not confirm your payment. Please call us on 01753 682707 before paying again, and we will check whether it went through.',
  event_booking: 'We could not process this event booking right now. Please call 01753 682707.',
  event_waitlist: 'We could not join the waitlist right now. Please call 01753 682707.',
  event_payment:
    'We could not start your payment. Please try again, or call us on 01753 682707 and we will take the booking over the phone.',
  event_payment_capture:
    'We could not confirm your payment. Please call us on 01753 682707 before paying again, and we will check whether it went through.',
  parking_booking: 'We could not create your parking booking right now. Please try again or call 01753 682707.',
  parking_payment:
    'We could not start your parking payment. Please try again, or call 01753 682707 and we will book your space.',
  parking_payment_capture:
    'We could not confirm your parking payment. Please call 01753 682707 before paying again, and we will check whether payment was taken.',
  private_hire: 'We could not submit that enquiry. Please call 01753 682707 and we will take your details.',
  christmas_enquiry: 'We could not send your enquiry. Please call us on 01753 682707 and we will take your details.',
  job_application: 'Sorry, we could not send your application. Please call us on 01753 682707.',
  customer_lookup: 'We could not check that number right now. Please try again, or call 01753 682707.',
  spam_check:
    'We could not accept that submission. Please try again, or call us on 01753 682707 and we will take your details.'
}

const VALIDATION_FALLBACK =
  'Some of those details were not accepted. Please check them and try again, or call 01753 682707.'

const CAPTURE_CONTEXTS: ReadonlySet<GuestErrorContext> = new Set([
  'table_deposit_capture',
  'event_payment_capture',
  'parking_payment_capture'
])

const PAYMENT_CONTEXTS: ReadonlySet<GuestErrorContext> = new Set([
  ...CAPTURE_CONTEXTS,
  'table_deposit',
  'event_payment',
  'parking_payment'
])

/**
 * Codes the management app's API layer can answer on any route. Matched in
 * upper case. `null` means "use the fallback for the form the guest is on":
 * these are faults on our side that no guest can act on.
 */
const API_CODE_COPY: Record<string, string | null> = {
  UNAUTHORIZED: null,
  FORBIDDEN: null,
  AUTH_UNAVAILABLE: null,
  RATE_LIMIT_UNAVAILABLE: null,
  INTERNAL_ERROR: null,
  DATABASE_ERROR: null,
  CUSTOMER_RESOLUTION_FAILED: null,
  TURNSTILE_FAILED: null,
  IDEMPOTENCY_KEY_REQUIRED: null,
  IDEMPOTENCY_KEY_CONFLICT: null,
  SERVICE_UNAVAILABLE: null,
  UPSTREAM_ERROR: null,
  PROXY_ERROR: null,
  NETWORK_ERROR: null,
  API_KEY_MISSING: null,
  UNREADABLE_RESPONSE: null,
  RATE_LIMIT_EXCEEDED:
    'Our booking system is very busy just now. Please try again in a few minutes, or call 01753 682707.',
  IDEMPOTENCY_KEY_IN_PROGRESS:
    'We are still working on your first attempt. Please wait a moment before trying again, or call 01753 682707.',
  IDEMPOTENCY_KEY_NOT_FOUND:
    'We could not find a previous attempt. Please check your details and try again, or call 01753 682707.',
  PAYMENT_LINK_FAILED:
    'We received your booking, but we could not set up the deposit payment. Please call 01753 682707 before trying again, so you are not booked twice.',
  VALIDATION_ERROR: VALIDATION_FALLBACK,
  CAPACITY_UNAVAILABLE: 'Those dates are now fully booked. Please choose different dates, or call 01753 682707.'
}

/** Reasons the event booking functions answer with `state: 'blocked'`. */
const EVENT_BLOCKED_COPY: Record<string, string> = {
  blocked: 'This event is not bookable online right now.',
  not_eligible: 'This booking is currently blocked. Please contact the pub for help.',
  sold_out: 'This event is sold out.',
  payment_required: 'Payment is required to secure this booking.',
  seated_capacity_changed:
    'There are no longer enough seats for your group. Please review the available tickets before booking again. No booking has been made.',
  standing_not_available_until_seated_full:
    'Standing tickets are only available once seats sell out. Please review current availability before booking again. No booking has been made.',
  invalid_seats: 'Please check the number of places and try again.',
  event_not_found: 'We could not find this event. Please refresh the page and try again.',
  event_datetime_missing: 'This event is not ready for online booking yet.',
  standing_capacity_not_configured: 'This event is not ready for online booking yet.',
  event_started: 'This event has already started, so online booking has closed.',
  booking_closed: 'Online booking for this event has closed.',
  not_bookable: 'This event cannot be booked online.',
  customer_conflict: 'It looks like you already have a booking for this event. No new booking has been made.',
  insufficient_capacity: 'There are not enough places left for that many people. Please try fewer places.',
  insufficient_seated_capacity: 'There are not enough seats left for that many people. Please try fewer seats.',
  no_table: 'We could not find a table for your group at this event.',
  too_large_party: 'Your group is too large to book online for this event.',
  event_general_entry_only: 'We could not complete this booking online.'
}

/**
 * Error codes the event booking route answers with (upper case), as distinct
 * from the blocked reasons above. Each is something the guest can act on.
 */
const EVENT_BOOKING_CODE_COPY: Record<string, string> = {
  TICKET_TYPE_SOLD_OUT: 'One of the ticket options you chose has sold out. Please choose again.',
  TICKET_TYPE_INVALID: 'One of the ticket options you chose is no longer available for this event. Please choose again.',
  PRICE_CHANGED: 'The ticket price has changed. Please check the updated total before booking.',
  BOOKING_QUESTIONS_CHANGED: 'The guest questions have changed. Please check the details for each guest.',
  EVENT_DATE_MISMATCH: 'The details of this event have changed. Please refresh the page and check them before booking.',
  SALES_CLOSED: 'Online ticket sales for this event have closed.',
  BOOKINGS_DISABLED: 'Bookings are not available for this event. No booking is needed, just turn up!'
}

/** Reasons the waitlist function answers with. */
const WAITLIST_REASON_COPY: Record<string, string> = {
  invalid_requested_seats: 'Please check the number of places and try again.',
  event_not_found: 'We could not find this event. Please refresh the page and try again.',
  event_started: 'This event has already started, so the waitlist has closed.',
  booking_closed: 'Online booking for this event has closed, so the waitlist has closed too.',
  not_bookable: 'This event has no online waitlist.',
  capacity_available: 'Places have come free for this event, so you can book now instead of joining the waitlist.'
}

const PAY_AGAIN_WARNING = GUEST_FALLBACK.event_payment_capture

/** Reasons the event payment routes answer with as a bare code. */
const EVENT_PAYMENT_REASON_COPY: Record<string, string> = {
  hold_expired: 'The time to pay for these places has run out. Please start your booking again.',
  token_expired: 'The time to pay for these places has run out. Please start your booking again.',
  invalid_token: 'That payment link is no longer valid. Please start your booking again.',
  token_used: 'That payment link has already been used.',
  token_customer_mismatch: 'That payment link is no longer valid. Please start your booking again.',
  booking_not_found: 'We could not find that booking.',
  booking_not_pending_payment: 'This booking is not waiting for a payment.',
  event_not_found: 'We could not find this event.',
  invalid_amount: 'We could not work out the amount to pay for this booking.',
  // Money may already have moved for every one of these, so the guest is told
  // to ring before paying a second time.
  payment_order_not_found: PAY_AGAIN_WARNING,
  order_mismatch: PAY_AGAIN_WARNING,
  amount_or_reference_mismatch: PAY_AGAIN_WARNING,
  capture_amount_mismatch: PAY_AGAIN_WARNING,
  capture_reference_mismatch: PAY_AGAIN_WARNING,
  confirmation_blocked: PAY_AGAIN_WARNING,
  capture_already_captured_pending_confirmation: PAY_AGAIN_WARNING
}

function reasonTableFor(context: GuestErrorContext): Record<string, string> | null {
  switch (context) {
    case 'table_booking':
      // The wording the table booking form has always used.
      return BLOCKED_REASON_COPY
    case 'event_booking':
      return EVENT_BLOCKED_COPY
    case 'event_waitlist':
      return WAITLIST_REASON_COPY
    case 'event_payment':
    case 'event_payment_capture':
      return EVENT_PAYMENT_REASON_COPY
    default:
      return null
  }
}

/**
 * Upstream sentences that are safe to show although they do not carry the
 * phone number. Compared without case or a closing full stop.
 */
const UPSTREAM_SENTENCE_ALLOW_LIST: ReadonlySet<string> = new Set([
  'please enter a valid phone number',
  // The management app's answers when a table deposit cannot be started.
  'deposit has already been paid for this booking',
  'this payment link has expired',
  'this booking is no longer payable'
])

/** Text that was written for a developer or produced by a browser or parser. */
const TECHNICAL_TEXT = [
  /api key/i,
  /permission/i,
  /rate limit/i,
  /internal server error/i,
  /temporarily unavailable$/i,
  /idempotency/i,
  /^failed to /i,
  /\bproxy\b/i,
  /\bupstream\b/i,
  /microsoft|graph\b/i,
  /not configured/i,
  /load failed/i,
  /networkerror/i,
  /unexpected (token|end)/i,
  /not valid json/i,
  /did not match the expected pattern/i,
  /^\s*[{[<]/,
  /[{}\\]/,
  /\b(undefined|null|NaN)\b/,
  // The shapes a schema library's own messages take ("Invalid uuid",
  // "Expected number, received string", "String must contain at least 1
  // character(s)"), and wording about the request rather than the booking.
  /^(invalid|expected|required|unrecognized|unrecognised)\b/i,
  /character\(s\)/i,
  /\breceived\b/i,
  /\b(payload|json|header|uuid|schema)\b/i
]

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

/** `hold_expired`, `RATE_LIMIT_EXCEEDED`, `blocked`: one token, no spaces. */
export function isBareCode(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9]*([_.-][A-Za-z0-9]+)*$/.test(value.trim()) && !/\s/.test(value.trim())
}

function isTechnicalText(value: string): boolean {
  return isBareCode(value) || TECHNICAL_TEXT.some((pattern) => pattern.test(value))
}

function carriesPhone(value: string): boolean {
  return value.replace(/\s+/g, '').includes(GUEST_PHONE.replace(/\s+/g, ''))
}

/** Every sentence a guest is shown on a failure ends up with the number in it. */
export function withGuestPhone(sentence: string): string {
  const trimmed = sentence.trim()
  if (carriesPhone(trimmed)) return trimmed
  const closed = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
  return `${closed} Call ${GUEST_PHONE} if you need help.`
}

export type GuestMessageOptions = {
  /**
   * False for a form that prints its own "Call 01753 682707" line under every
   * error: the sentence is returned as written, and the form adds that line
   * only when the sentence does not already carry the number. Everything else
   * leaves this alone and always gets the number in the sentence.
   */
  phone?: boolean
  /** Used in place of the general line for this form when nothing better is known. */
  fallback?: string
}

function finish(sentence: string, options?: GuestMessageOptions): string {
  return options?.phone === false ? sentence.trim() : withGuestPhone(sentence)
}

/**
 * The sentence for a reason or error code, or null when the code is unknown.
 * The form's own table is tried first, then the codes every route shares.
 */
export function guestMessageForCode(
  code: string | null | undefined,
  context: GuestErrorContext,
  options?: GuestMessageOptions
): string | null {
  const text = asText(code)
  if (!text || !isBareCode(text)) return null

  const table = reasonTableFor(context)
  const reason = table?.[text.toLowerCase()]
  if (reason) return finish(reason, options)

  const upper = text.toUpperCase()
  if ((context === 'event_booking' || context === 'event_waitlist') && upper in EVENT_BOOKING_CODE_COPY) {
    return finish(EVENT_BOOKING_CODE_COPY[upper], options)
  }
  if (upper in API_CODE_COPY) {
    // Once a guest has approved a payment there is one right thing to say,
    // whatever the code: ring before paying again. "Try again in a few
    // minutes" is the wrong advice at that point.
    const copy = CAPTURE_CONTEXTS.has(context) ? null : API_CODE_COPY[upper]
    return finish(copy ?? options?.fallback ?? GUEST_FALLBACK[context], options)
  }

  return null
}

/**
 * The sentence for a booking the system answered with `state: 'blocked'`. An
 * unknown reason gets the general line for that form, never the code itself.
 */
export function guestMessageForBlockedReason(
  reason: string | null | undefined,
  context: Extract<GuestErrorContext, 'table_booking' | 'event_booking' | 'event_waitlist'>,
  options?: GuestMessageOptions
): string {
  const table = reasonTableFor(context)
  const key = asText(reason)?.toLowerCase()
  const sentence =
    (key && table?.[key]) ||
    (context === 'event_waitlist' ? GUEST_FALLBACK.event_waitlist : table?.blocked) ||
    GUEST_FALLBACK[context]
  return finish(sentence, options)
}

/**
 * For the forms: whatever arrived in an `error` field, or was thrown, becomes
 * one sentence. Accepts a string, an `{ code, message }` object, an Error or
 * nothing at all, so a form can never render an object, a bare code or a
 * browser's own message ("Failed to fetch").
 */
export function toGuestMessage(error: unknown, context: GuestErrorContext, options?: GuestMessageOptions): string {
  const fallback = finish(options?.fallback ?? GUEST_FALLBACK[context], options)
  const record = asRecord(error)

  const code = asText(record?.code) ?? (typeof error === 'string' && isBareCode(error) ? error : null)
  const fromCode = guestMessageForCode(code, context, options)

  const message =
    asText(record?.message) ??
    (typeof error === 'string' ? asText(error) : null)

  if (message) {
    const fromReason = guestMessageForCode(message, context, options)
    if (fromReason) return fromReason
    if (!isTechnicalText(message)) return finish(message, options)
  }

  return fromCode ?? fallback
}

/**
 * Every code this file has wording for, with the form it belongs to. For the
 * test that renders each one: a code added to a table above is covered by that
 * test without anyone remembering to add it there too.
 */
export function listMappedCodes(): Array<{ context: GuestErrorContext; code: string }> {
  const fromTable = (context: GuestErrorContext, table: Record<string, unknown>) =>
    Object.keys(table).map((code) => ({ context, code }))

  return [
    ...fromTable('table_booking', BLOCKED_REASON_COPY),
    ...fromTable('event_booking', EVENT_BLOCKED_COPY),
    ...fromTable('event_booking', EVENT_BOOKING_CODE_COPY),
    ...fromTable('event_waitlist', WAITLIST_REASON_COPY),
    ...fromTable('event_payment', EVENT_PAYMENT_REASON_COPY),
    ...fromTable('event_payment_capture', EVENT_PAYMENT_REASON_COPY),
    ...(Object.keys(GUEST_FALLBACK) as GuestErrorContext[]).flatMap((context) => fromTable(context, API_CODE_COPY))
  ]
}

export type UpstreamFailureKind = 'failed' | 'refused'

export type MappedUpstreamFailure = {
  /**
   * `refused` is a deliberate no the guest can act on (a full night, a detail
   * to correct). `failed` is something broken on our side, which is reported.
   */
  kind: UpstreamFailureKind
  /** A machine-readable code for the log and for the forms. Never guest text. */
  code: string
  /** The only thing the guest is shown. */
  message: string
}

function pickUpstreamCode(body: Record<string, unknown> | null): string | null {
  if (!body) return null
  const error = asRecord(body.error)
  const data = asRecord(body.data)
  const candidates = [error?.code, body.code, data?.code, typeof body.error === 'string' ? body.error : null, body.reason]
  for (const candidate of candidates) {
    const text = asText(candidate)
    if (text && isBareCode(text) && text.length <= 64) return text
  }
  return null
}

function pickUpstreamSentence(body: Record<string, unknown> | null): string | null {
  if (!body) return null
  const error = asRecord(body.error)
  return asText(error?.message) ?? asText(typeof body.error === 'string' ? body.error : null) ?? asText(body.message)
}

function isAllowListed(sentence: string): boolean {
  return UPSTREAM_SENTENCE_ALLOW_LIST.has(sentence.trim().replace(/\.$/, '').toLowerCase())
}

/**
 * For the routes: an answer from the management app that was not a success
 * becomes a kind, a code and a guest sentence.
 *
 * `body` is the parsed JSON, or null when it could not be read.
 * `trustValidationSentences` is for the enquiry and application routes, whose
 * 400 and 422 answers are written sentences the guest can act on; the booking
 * routes answer those statuses with a raw schema message, so they do not set it.
 */
export function mapUpstreamFailure(input: {
  status: number
  body: unknown
  context: GuestErrorContext
  trustValidationSentences?: boolean
}): MappedUpstreamFailure {
  const { status, context } = input
  const body = asRecord(input.body)
  const fallback = withGuestPhone(GUEST_FALLBACK[context])

  if (!body) {
    return { kind: 'failed', code: 'UNREADABLE_RESPONSE', message: fallback }
  }

  const code = pickUpstreamCode(body)
  const sentence = pickUpstreamSentence(body)
  const sentenceIsForGuests = Boolean(sentence && !isBareCode(sentence) && (carriesPhone(sentence) || isAllowListed(sentence)))

  // Only a 400 or a 422 is the guest's to correct, and a 409 is a deliberate
  // no (a clash, a full night). A 429 is the guest's only when the management
  // app says so in a sentence written for them (its limit for one phone
  // number); its other 429 is the allowance on our shared key running out.
  const guestCanAct = status === 400 || status === 422 || status === 409 || (status === 429 && sentenceIsForGuests)
  const kind: UpstreamFailureKind = guestCanAct ? 'refused' : 'failed'
  const resolvedCode = code ?? (kind === 'failed' ? 'UPSTREAM_ERROR' : 'REFUSED')

  if (kind === 'failed') {
    // Money may have moved, or a booking may exist without its payment: the
    // specific sentence matters more than the general one for these.
    const specific = code && (CAPTURE_CONTEXTS.has(context) || code.toUpperCase() === 'PAYMENT_LINK_FAILED' || code.toUpperCase() === 'RATE_LIMIT_EXCEEDED')
      ? guestMessageForCode(code, context)
      : null
    return { kind, code: resolvedCode, message: specific ?? fallback }
  }

  if (sentenceIsForGuests && sentence) {
    return { kind, code: resolvedCode, message: withGuestPhone(sentence) }
  }

  const fromCode = guestMessageForCode(code, context)
  // VALIDATION_ERROR has a general line; a written sentence beats it where the
  // route says its validation answers can be trusted.
  if (fromCode && code?.toUpperCase() !== 'VALIDATION_ERROR') {
    return { kind, code: resolvedCode, message: fromCode }
  }

  if (input.trustValidationSentences && sentence && !isTechnicalText(sentence)) {
    return { kind, code: resolvedCode, message: withGuestPhone(sentence) }
  }

  // "Check your details" is the wrong thing to say at a payment step, where the
  // guest typed nothing: those keep the line for the step they are on.
  if ((status === 400 || status === 422) && !PAYMENT_CONTEXTS.has(context)) {
    return { kind, code: resolvedCode, message: withGuestPhone(VALIDATION_FALLBACK) }
  }

  return { kind, code: resolvedCode, message: fromCode ?? fallback }
}
