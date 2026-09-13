import {
  confirmationDeliveryCopy,
  paymentLinkDestination,
  paymentLinkReminderCopy,
} from '@/lib/table-booking/submission'

// The management app sends booking messages by email first when the guest has
// a usable address (owner decision, 11 September 2026). The quick booking sheet
// used to say "We've sent a confirmation by text." whatever went, and the
// deposit screen always pointed at a text. Every screen now names the channel
// the management API reports, and claims no channel when it reports none.
describe('booking screens name the channel the message went by', () => {
  test.each([
    ['email', "We've sent confirmation details by email."],
    ['sms', "We've sent confirmation details by SMS."],
    ['whatsapp', "We've sent confirmation details by WhatsApp."],
    [null, "We've sent confirmation details."],
    [undefined, "We've sent confirmation details."],
  ] as const)('confirmation for %s', (channel, expected) => {
    expect(confirmationDeliveryCopy(channel)).toBe(expected)
  })

  test.each([
    ['email', 'to your email'],
    ['sms', 'to your phone'],
    ['whatsapp', 'on WhatsApp'],
    [null, 'you'],
  ] as const)('payment link destination for %s', (channel, expected) => {
    expect(paymentLinkDestination(channel)).toBe(expected)
  })

  test('the payment link reminder never promises a text for an emailed link', () => {
    expect(paymentLinkReminderCopy('email')).toBe("Or check your email, we've sent you a secure payment link.")
    expect(paymentLinkReminderCopy('email')).not.toMatch(/SMS|text|phone/i)
    expect(paymentLinkReminderCopy('sms')).toBe("Or check your phone, we've sent you a secure payment link by SMS.")
    expect(paymentLinkReminderCopy(null)).toBe("Or check your phone or email for the secure payment link we've sent you.")
  })
})
