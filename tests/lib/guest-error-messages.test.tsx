import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  GUEST_FALLBACK,
  GUEST_PHONE,
  guestMessageForBlockedReason,
  guestMessageForCode,
  isBareCode,
  kindForUpstreamCode,
  listMappedCodes,
  mapUpstreamFailure,
  toGuestMessage,
  withGuestPhone,
  type GuestErrorContext
} from '@/lib/guest-error-messages'
import { BLOCKED_REASON_COPY } from '@/lib/table-booking/submission'

/**
 * A guest is never shown an internal code or the management app's own wording,
 * and every failure sentence carries 01753 682707.
 */

function expectGuestSentence(sentence: string, rawCode?: string) {
  expect(typeof sentence).toBe('string')
  expect(sentence).toContain(GUEST_PHONE)
  // A sentence: more than one word, starts with a capital, ends with a stop.
  expect(sentence.trim().split(/\s+/).length).toBeGreaterThan(3)
  expect(sentence).toMatch(/^[A-Z]/)
  expect(sentence).toMatch(/[.!?]$/)
  // Not a code, not JSON, not a placeholder.
  expect(sentence).not.toMatch(/[a-z]_[a-z]/i)
  expect(sentence).not.toMatch(/[{}\\]|undefined|\[object Object\]|NaN/)
  expect(sentence).not.toContain(String.fromCharCode(8212))
  if (rawCode) expect(sentence).not.toContain(rawCode)
}

describe('every mapped code renders as a sentence with the phone number', () => {
  const cases = listMappedCodes()

  it('covers the codes the review found being shown raw', () => {
    const covered = new Set(cases.map((entry) => `${entry.context}:${entry.code}`))
    for (const expected of [
      'event_booking:customer_conflict',
      'event_booking:event_started',
      'event_payment:hold_expired',
      'event_payment_capture:hold_expired',
      'event_payment_capture:capture_amount_mismatch',
      'event_waitlist:capacity_available',
      'table_booking:customer_conflict',
      'table_booking:UNAUTHORIZED',
      'table_booking:RATE_LIMIT_EXCEEDED',
      'customer_lookup:VALIDATION_ERROR'
    ]) {
      expect(covered).toContain(expected)
    }
    expect(cases.length).toBeGreaterThan(200)
  })

  it.each(cases)('$context: $code', ({ context, code }) => {
    const sentence = guestMessageForCode(code, context)
    expect(sentence).not.toBeNull()

    // Rendered the way a form renders it. An object here would throw.
    const { unmount } = render(<p role="alert">{toGuestMessage(code, context)}</p>)
    const shown = screen.getByRole('alert').textContent ?? ''
    expectGuestSentence(shown, code.includes('_') ? code : undefined)
    expect(shown).toBe(sentence)
    unmount()
  })

  it.each(cases)('$context: $code, arriving as an error object', ({ context, code }) => {
    const { unmount } = render(<p role="alert">{toGuestMessage({ code, message: code }, context)}</p>)
    expectGuestSentence(screen.getByRole('alert').textContent ?? '', code.includes('_') ? code : undefined)
    unmount()
  })
})

describe('the table booking wording is the wording the form already used', () => {
  it.each(Object.entries(BLOCKED_REASON_COPY))('%s', (reason, copy) => {
    expect(guestMessageForBlockedReason(reason, 'table_booking', { phone: false })).toBe(copy)
    expect(guestMessageForBlockedReason(reason, 'table_booking')).toContain(copy.replace(/\.$/, ''))
    expectGuestSentence(guestMessageForBlockedReason(reason, 'table_booking'))
  })
})

describe('a reason nobody has written wording for', () => {
  it.each<['table_booking' | 'event_booking' | 'event_waitlist', string]>([
    ['table_booking', 'outside_full'],
    ['event_booking', 'some_new_reason'],
    ['event_waitlist', 'some_new_reason']
  ])('%s: %s gets the general line, never the code', (context, reason) => {
    const sentence = guestMessageForBlockedReason(reason, context)
    expectGuestSentence(sentence, reason)
  })

  it('is null from the code lookup, so callers fall back rather than print it', () => {
    expect(guestMessageForCode('some_new_reason', 'event_booking')).toBeNull()
    expect(guestMessageForCode('This is a sentence', 'event_booking')).toBeNull()
    expect(guestMessageForCode(null, 'event_booking')).toBeNull()
  })
})

describe('toGuestMessage, for whatever a form is handed', () => {
  const contexts = Object.keys(GUEST_FALLBACK) as GuestErrorContext[]

  it.each(contexts)('%s: an object error becomes a string, so a form cannot crash rendering it', (context) => {
    const message = toGuestMessage({ code: 'UPSTREAM_ERROR', message: `We could not do that. Please call ${GUEST_PHONE}.` }, context)
    expect(message).toBe(`We could not do that. Please call ${GUEST_PHONE}.`)
  })

  it.each(contexts)('%s: nothing at all gets the line for that form', (context) => {
    for (const nothing of [undefined, null, '', {}, { message: '' }, 42, []]) {
      expectGuestSentence(toGuestMessage(nothing, context))
    }
  })

  it.each([
    'Invalid or missing API key',
    'Insufficient permissions',
    'Rate limit exceeded',
    'Rate limiting is temporarily unavailable',
    'Authentication is temporarily unavailable',
    'Internal server error',
    'Idempotency key already used with a different request payload',
    'Failed to resolve customer',
    'Failed to create table booking',
    'Failed to create booking via proxy',
    'Failed to fetch',
    'Load failed',
    'NetworkError when attempting to fetch resource.',
    'Unexpected token < in JSON at position 0',
    'The string did not match the expected pattern.',
    'Failed to send enquiry email via Microsoft Graph: {"error":{"code":"ErrorAccessDenied"}}',
    '{"success":false,"error":{"code":"VALIDATION_ERROR","message":"Please enter a valid phone number"}}',
    'Expected number, received string',
    'String must contain at least 1 character(s)',
    'customer_conflict',
    'hold_expired',
    'SOME_UNKNOWN_CODE'
  ])('never shows "%s"', (technical) => {
    for (const shape of [technical, { message: technical }, new Error(technical), { code: 'X', message: technical }]) {
      const message = toGuestMessage(shape, 'table_booking')
      expectGuestSentence(message)
      expect(message).not.toContain(technical)
    }
  })

  it('keeps a sentence written for a guest and adds the number when it has none', () => {
    expect(toGuestMessage('Please choose the game again from the tournament page.', 'table_booking')).toBe(
      `Please choose the game again from the tournament page. Call ${GUEST_PHONE} if you need help.`
    )
  })

  it('leaves the number off for a form that prints its own phone line', () => {
    expect(toGuestMessage('This event is sold out.', 'event_booking', { phone: false })).toBe('This event is sold out.')
    expect(guestMessageForBlockedReason('sold_out', 'event_booking', { phone: false })).toBe('This event is sold out.')
  })

  it('uses the form\'s own fallback when it is given one', () => {
    expect(toGuestMessage(new TypeError('Failed to fetch'), 'table_booking', { phone: false, fallback: 'We could not process your booking right now.' })).toBe(
      'We could not process your booking right now.'
    )
  })
})

describe('mapUpstreamFailure, for the routes', () => {
  it.each([
    [401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }, 'UNAUTHORIZED'],
    [403, { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, 'FORBIDDEN'],
    [404, { error: 'Not found' }, 'UPSTREAM_ERROR'],
    [429, { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded' } }, 'RATE_LIMIT_EXCEEDED'],
    [500, { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create table booking' } }, 'DATABASE_ERROR'],
    [503, { success: false, error: { code: 'AUTH_UNAVAILABLE', message: 'Authentication is temporarily unavailable' } }, 'AUTH_UNAVAILABLE']
  ])('a %s is a failure on our side, with our sentence', (status, body, code) => {
    const mapped = mapUpstreamFailure({ status, body, context: 'table_booking' })

    expect(mapped.kind).toBe('failed')
    expect(mapped.code).toBe(code)
    expectGuestSentence(mapped.message)
    expect(mapped.message).not.toMatch(/API key|permissions|Rate limit exceeded|Failed to|temporarily unavailable|Not found/)
  })

  it('treats an answer it cannot read as a failure', () => {
    for (const body of [null, undefined, 'a string', 42, []]) {
      const mapped = mapUpstreamFailure({ status: 200, body, context: 'event_waitlist' })
      expect(mapped).toMatchObject({ kind: 'failed', code: 'UNREADABLE_RESPONSE' })
      expectGuestSentence(mapped.message)
    }
  })

  it('keeps the per-phone limit, which the management app writes for the guest', () => {
    const sentence = 'Too many booking attempts for this phone number. Please try again later or call us on 01753 682707.'
    const mapped = mapUpstreamFailure({
      status: 429,
      body: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: sentence } },
      context: 'table_booking'
    })

    expect(mapped).toEqual({ kind: 'refused', code: 'RATE_LIMIT_EXCEEDED', message: sentence })
  })

  it('keeps a Christmas rule message, which carries the phone number', () => {
    const sentence = 'Christmas bookings of 20 or more need a call first. Please ring 01753 682707.'
    const mapped = mapUpstreamFailure({
      status: 400,
      body: { success: false, error: { code: 'VALIDATION_ERROR', message: sentence } },
      context: 'table_booking'
    })

    expect(mapped).toEqual({ kind: 'refused', code: 'VALIDATION_ERROR', message: sentence })
  })

  it('turns an invalid phone number into the one sentence, not a line of JSON', () => {
    const mapped = mapUpstreamFailure({
      status: 400,
      body: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid phone number' } },
      context: 'customer_lookup'
    })

    expect(mapped.kind).toBe('refused')
    expect(mapped.message).toBe(`Please enter a valid phone number. Call ${GUEST_PHONE} if you need help.`)
    expect(mapped.message).not.toMatch(/[{}\\]/)
  })

  it('does not trust a booking route\'s raw validation text', () => {
    const mapped = mapUpstreamFailure({
      status: 400,
      body: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Fixture notes do not match fixture ID' } },
      context: 'table_booking'
    })

    expect(mapped.kind).toBe('refused')
    expect(mapped.message).not.toContain('Fixture notes')
    expectGuestSentence(mapped.message)
  })

  it('keeps a written validation sentence where the route says they can be trusted', () => {
    const mapped = mapUpstreamFailure({
      status: 422,
      body: { success: false, error: 'Please enter a valid email address' },
      context: 'private_hire',
      trustValidationSentences: true
    })

    expect(mapped.message).toBe(`Please enter a valid email address. Call ${GUEST_PHONE} if you need help.`)
  })

  it('still drops a schema message on a trusted route', () => {
    const mapped = mapUpstreamFailure({
      status: 400,
      body: { success: false, error: 'String must contain at most 120 character(s)' },
      context: 'private_hire',
      trustValidationSentences: true
    })

    expect(mapped.message).not.toContain('character(s)')
    expectGuestSentence(mapped.message)
  })

  it.each([
    ['hold_expired', 'The time to pay for these places has run out'],
    ['capture_amount_mismatch', 'before paying again'],
    ['capture_reference_mismatch', 'before paying again'],
    ['amount_or_reference_mismatch', 'before paying again'],
    ['order_mismatch', 'before paying again'],
    ['payment_order_not_found', 'before paying again'],
    ['confirmation_blocked', 'before paying again']
  ])('event payment reason %s becomes a sentence', (reason, expected) => {
    const mapped = mapUpstreamFailure({ status: 409, body: { success: false, error: reason }, context: 'event_payment_capture' })

    expect(mapped.code).toBe(reason)
    expect(mapped.message).toContain(expected)
    expectGuestSentence(mapped.message, reason)
  })

  it('never says "check your details" at a payment step', () => {
    for (const context of ['table_deposit', 'table_deposit_capture', 'event_payment', 'event_payment_capture'] as const) {
      const mapped = mapUpstreamFailure({ status: 400, body: { error: 'Order ID mismatch' }, context })
      expect(mapped.message).toBe(GUEST_FALLBACK[context])
    }
  })

  it('tells a guest whose capture failed to ring before paying again, whatever the status', () => {
    for (const status of [400, 404, 409, 500, 502]) {
      const mapped = mapUpstreamFailure({
        status,
        body: { error: 'Payment captured but booking update failed. Our team has been notified.' },
        context: 'table_deposit_capture'
      })
      expect(mapped.message).toContain('before paying again')
      expect(mapped.message).toContain(GUEST_PHONE)
    }
  })

  it('warns against booking twice when the booking exists but its payment link failed', () => {
    const mapped = mapUpstreamFailure({
      status: 500,
      body: { success: false, error: { code: 'PAYMENT_LINK_FAILED', message: 'Booking created but payment link generation failed. Please contact us.' } },
      context: 'table_booking'
    })

    expect(mapped.kind).toBe('failed')
    expect(mapped.message).toContain('not booked twice')
    expectGuestSentence(mapped.message)
  })
})

/**
 * The management app sends a stable `code` beside its sentence (its PR #198).
 * The code decides first. An answer with no code, or a code we do not know, is
 * judged by its status exactly as it was before.
 */
describe('mapUpstreamFailure reads the code before the status and the sentence', () => {
  it('an expired event payment hold (410) is a refusal with its own sentence, not an outage', () => {
    // The shape the management app's event payment routes now answer with.
    const mapped = mapUpstreamFailure({
      status: 410,
      body: {
        success: false,
        error: 'hold_expired',
        code: 'hold_expired',
        message: 'The time to pay for these places has run out. Please start your booking again, or call 01753 682707.'
      },
      context: 'event_payment'
    })

    expect(mapped.kind).toBe('refused')
    expect(mapped.code).toBe('hold_expired')
    expect(mapped.message).toBe(
      'The time to pay for these places has run out. Please start your booking again. Call 01753 682707 if you need help.'
    )
  })

  it('the same 410 with no code is still judged by its status, as before', () => {
    const mapped = mapUpstreamFailure({ status: 410, body: { success: false }, context: 'event_payment' })
    expect(mapped.kind).toBe('failed')
    expect(mapped.code).toBe('UPSTREAM_ERROR')
    expect(mapped.message).toBe(GUEST_FALLBACK.event_payment)
  })

  it.each([
    ['DEPOSIT_ALREADY_PAID', 409, 'Deposit has already been paid for this booking.', 'The deposit for this booking has already been paid.'],
    ['DEPOSIT_NOT_REQUIRED', 400, 'This booking does not require a deposit payment', 'This booking does not need a deposit.'],
    ['BOOKING_NOT_PAYABLE', 409, 'This booking is no longer payable.', 'This booking is no longer open for payment.'],
    ['PAYMENT_HOLD_EXPIRED', 409, 'This payment link has expired.', 'The time to pay this deposit has run out. Please start your booking again.'],
    ['PAYMENT_HOLD_MISSING', 409, 'This booking is missing a valid payment hold.', 'This booking is not waiting for a deposit.'],
    ['BOOKING_NOT_PENDING_PAYMENT', 409, 'This booking is not awaiting deposit payment.', 'This booking is not waiting for a deposit.']
  ])('table deposit %s is a refusal answered in our words, not the management app\'s', (code, status, upstream, ours) => {
    const mapped = mapUpstreamFailure({
      status,
      body: { success: false, error: upstream, code },
      context: 'table_deposit'
    })

    expect(mapped.kind).toBe('refused')
    expect(mapped.code).toBe(code)
    expect(mapped.message).toBe(`${ours} Call 01753 682707 if you need help.`)
    if (upstream !== ours) expect(mapped.message).not.toContain(upstream.replace(/\.$/, ''))
    expectGuestSentence(mapped.message)
  })

  it.each([
    ['PAYPAL_ORDER_FAILED', 502, 'Failed to create PayPal order. Please try again.'],
    ['PAYPAL_ORDER_NOT_SAVED', 502, 'Order created but could not be saved. Please try again.']
  ])('table deposit %s is a failure, and the guest may try again because nothing was charged', (code, status, upstream) => {
    const mapped = mapUpstreamFailure({ status, body: { success: false, error: upstream, code }, context: 'table_deposit' })
    expect(mapped.kind).toBe('failed')
    expect(mapped.code).toBe(code)
    expect(mapped.message).toBe(GUEST_FALLBACK.table_deposit)
  })

  it.each([
    ['CAPTURE_FAILED', 502, 'Failed to capture PayPal payment. Please try again.'],
    ['CAPTURED_AMOUNT_UNVERIFIED', 502, 'Payment captured but amount could not be verified. Please contact support; do not retry.'],
    ['CAPTURED_AMOUNT_MISMATCH', 502, 'Payment captured but amount did not match the booking. Please contact support; do not retry.'],
    ['CAPTURED_BOOKING_UPDATE_FAILED', 502, 'Payment captured but booking update failed. Our team has been notified.'],
    ['PAYPAL_ORDER_LOOKUP_FAILED', 502, 'Failed to verify PayPal order amount. Please try again.'],
    ['AMOUNT_MISMATCH', 409, 'Payment amount no longer matches this booking. Please refresh and try again.'],
    ['ORDER_MISMATCH', 400, 'Order ID mismatch']
  ])('a deposit capture answered %s tells the guest to ring before paying again, never "try again"', (code, status, upstream) => {
    const mapped = mapUpstreamFailure({ status, body: { success: false, error: upstream, code }, context: 'table_deposit_capture' })

    expect(mapped.code).toBe(code)
    expect(mapped.message).toBe(GUEST_FALLBACK.table_deposit_capture)
    expect(mapped.message).toContain('before paying again')
    expect(mapped.message).not.toMatch(/try again/i)
    expect(mapped.message).not.toContain('support')
  })

  it('a 400 that is about our request, not the guest\'s details, is a failure and never "check your details"', () => {
    const mapped = mapUpstreamFailure({
      status: 400,
      body: { success: false, error: 'Missing Idempotency-Key header', code: 'IDEMPOTENCY_KEY_REQUIRED' },
      context: 'private_hire',
      trustValidationSentences: true
    })

    expect(mapped.kind).toBe('failed')
    expect(mapped.code).toBe('IDEMPOTENCY_KEY_REQUIRED')
    expect(mapped.message).toBe(GUEST_FALLBACK.private_hire)
    expect(mapped.message).not.toMatch(/Idempotency|check them/i)
  })

  it('reads the flat shape the enquiry and create-booking routes answer with', () => {
    const mapped = mapUpstreamFailure({
      status: 400,
      body: { success: false, error: 'Please enter the number of guests', code: 'VALIDATION_ERROR' },
      context: 'private_hire',
      trustValidationSentences: true
    })

    expect(mapped.kind).toBe('refused')
    expect(mapped.code).toBe('VALIDATION_ERROR')
    expect(mapped.message).toBe('Please enter the number of guests. Call 01753 682707 if you need help.')
  })

  it('a retired route is a failure with our sentence, though its own sentence carries the number', () => {
    const mapped = mapUpstreamFailure({
      status: 410,
      body: {
        success: false,
        error: {
          code: 'ENDPOINT_RETIRED',
          message: 'This enquiry form has been replaced, so we could not take your enquiry here. Please call 01753 682707 or email manager@the-anchor.pub and we will help.'
        }
      },
      context: 'private_hire'
    })

    expect(mapped.kind).toBe('failed')
    expect(mapped.code).toBe('ENDPOINT_RETIRED')
    expect(mapped.message).toBe(GUEST_FALLBACK.private_hire)
  })

  it('the limiter\'s RATE_LIMIT_EXCEEDED is our fault and gets the "very busy" sentence, never its own', () => {
    // The shape src/lib/rate-limit.ts answers with in the management app.
    const mapped = mapUpstreamFailure({
      status: 429,
      body: { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
      context: 'private_hire'
    })

    expect(mapped.kind).toBe('failed')
    expect(mapped.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(mapped.message).toBe('Our booking system is very busy just now. Please try again in a few minutes, or call 01753 682707.')
    expect(mapped.message).not.toContain('Too many requests')
  })

  it('RATE_LIMIT_EXCEEDED with a sentence written for the guest is still theirs, and the sentence is kept', () => {
    const mapped = mapUpstreamFailure({
      status: 429,
      body: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many booking attempts for this phone number. Please try again later or call us on 01753 682707.'
        }
      },
      context: 'table_booking'
    })

    expect(mapped.kind).toBe('refused')
    expect(mapped.message).toBe('Too many booking attempts for this phone number. Please try again later or call us on 01753 682707.')
  })

  it('a code nobody has listed changes nothing: the status decides and the code is never shown', () => {
    const refused = mapUpstreamFailure({ status: 409, body: { success: false, error: 'Nope', code: 'SOMETHING_NEW' }, context: 'table_deposit' })
    expect(refused.kind).toBe('refused')
    expect(refused.message).toBe(GUEST_FALLBACK.table_deposit)

    const failed = mapUpstreamFailure({ status: 500, body: { success: false, error: 'Nope', code: 'SOMETHING_NEW' }, context: 'table_deposit' })
    expect(failed.kind).toBe('failed')
    expect(failed.message).toBe(GUEST_FALLBACK.table_deposit)

    for (const mapped of [refused, failed]) {
      expect(mapped.code).toBe('SOMETHING_NEW')
      expect(mapped.message).not.toMatch(/SOMETHING_NEW|Nope/)
    }
  })

  it('exposes what a code means on its own, and says nothing for one it does not know', () => {
    expect(kindForUpstreamCode('INTERNAL_ERROR')).toBe('failed')
    expect(kindForUpstreamCode('VALIDATION_ERROR')).toBe('refused')
    expect(kindForUpstreamCode('hold_expired')).toBe('refused')
    for (const unknown of ['RATE_LIMIT_EXCEEDED', 'REFUSED', 'UPSTREAM_ERROR', 'SOMETHING_NEW', '', null, undefined]) {
      expect(kindForUpstreamCode(unknown)).toBeNull()
    }
  })
})

describe('the small helpers', () => {
  it('adds the phone number once, and only when it is missing', () => {
    expect(withGuestPhone('No tables left')).toBe(`No tables left. Call ${GUEST_PHONE} if you need help.`)
    expect(withGuestPhone(`Ring ${GUEST_PHONE}.`)).toBe(`Ring ${GUEST_PHONE}.`)
    expect(withGuestPhone('Ring 01753682707.')).toBe('Ring 01753682707.')
  })

  it('tells a code from a sentence', () => {
    for (const code of ['customer_conflict', 'RATE_LIMIT_EXCEEDED', 'blocked', 'hold_expired']) expect(isBareCode(code)).toBe(true)
    for (const sentence of ['This event is sold out.', 'Not today', '']) expect(isBareCode(sentence)).toBe(false)
  })
})
