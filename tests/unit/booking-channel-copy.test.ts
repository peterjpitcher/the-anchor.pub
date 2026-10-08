import {
  confirmationDeliveryCopy,
  paymentLinkDestination,
  paymentLinkReminderCopy,
} from '@/lib/table-booking/submission'
import {
  confirmationChannel,
  confirmationNoticeCopy,
  confirmationSentCopy,
  wasConfirmationSent,
} from '@/lib/confirmation-notice'
import { CONFIRMED_BY_A_PERSON_WORDING } from '@/lib/guest-error-messages'

// The management app sends booking messages by email first when the guest has
// a usable address (owner decision, 11 September 2026), and since 8 October
// 2026 it says in so many words whether a message went: `notification_sent`.
// A screen says "we've sent" only for `notification_sent: true`, names the
// channel the API reports, and never reads a missing field as "sent".

const NOT_SENT = 'Your table is booked. If you\'d like it confirmed by a person, call 01753 682707.'

// Every way an answer can fail to say "a message went".
const NOT_SENT_NOTICES: Array<[string, unknown]> = [
  ['no answer at all', undefined],
  ['null', null],
  ['an empty answer', {}],
  ['notification_sent false', { notification_sent: false, notification_channel: null }],
  ['notification_sent false with a channel', { notification_sent: false, notification_channel: 'email' }],
  ['a channel but no notification_sent (an older answer)', { notification_channel: 'sms' }],
  ['notification_sent null', { notification_sent: null, notification_channel: 'email' }],
  ['notification_sent as the string "true"', { notification_sent: 'true', notification_channel: 'email' }],
  ['notification_sent as 1', { notification_sent: 1, notification_channel: 'sms' }],
]

describe('a confirmation message is claimed only when the booking system says one went', () => {
  test('the shared sentence carries the phone number', () => {
    expect(CONFIRMED_BY_A_PERSON_WORDING).toBe("If you'd like it confirmed by a person, call 01753 682707.")
  })

  test.each([
    ['email', "We've sent confirmation details by email."],
    ['sms', "We've sent confirmation details by SMS."],
    ['whatsapp', "We've sent confirmation details by WhatsApp."],
  ] as const)('sent by %s names the channel', (channel, expected) => {
    const notice = { notification_sent: true, notification_channel: channel }
    expect(wasConfirmationSent(notice)).toBe(true)
    expect(confirmationChannel(notice)).toBe(channel)
    expect(confirmationSentCopy(notice)).toBe(expected)
    expect(confirmationDeliveryCopy(notice)).toBe(expected)
    expect(confirmationNoticeCopy(notice)).toBe(expected)
  })

  test.each([[null], [undefined], ['carrier-pigeon']])(
    'sent with channel %s says sent, and guesses no channel',
    (channel) => {
      const notice = { notification_sent: true, notification_channel: channel }
      expect(confirmationChannel(notice)).toBeNull()
      expect(confirmationDeliveryCopy(notice)).toBe("We've sent you confirmation details.")
      expect(confirmationDeliveryCopy(notice)).not.toMatch(/email|SMS|text|WhatsApp|pigeon/i)
    }
  )

  test.each(NOT_SENT_NOTICES)('%s is not sent', (_label, notice) => {
    const value = notice as Parameters<typeof wasConfirmationSent>[0]
    expect(wasConfirmationSent(value)).toBe(false)
    expect(confirmationChannel(value)).toBeNull()
    expect(confirmationSentCopy(value)).toBeNull()

    // The table screens: booked, and the number for a person. No message claimed.
    expect(confirmationDeliveryCopy(value)).toBe(NOT_SENT)
    // The event screen: the same sentence without the table line.
    expect(confirmationNoticeCopy(value)).toBe(CONFIRMED_BY_A_PERSON_WORDING)

    for (const sentence of [confirmationDeliveryCopy(value), confirmationNoticeCopy(value)]) {
      expect(sentence).not.toMatch(/sent|on its way|email|text|SMS|WhatsApp/i)
      expect(sentence).toContain('01753 682707')
    }
  })
})

describe('the deposit screen points at a payment link message only when one went', () => {
  test.each([
    ['email', 'to your email'],
    ['sms', 'to your phone'],
    ['whatsapp', 'on WhatsApp'],
    [null, 'you'],
  ] as const)('payment link destination for %s', (channel, expected) => {
    expect(paymentLinkDestination({ notification_sent: true, notification_channel: channel })).toBe(expected)
  })

  test('the payment link reminder never promises a text for an emailed link', () => {
    const sent = (channel: string | null) => ({ notification_sent: true, notification_channel: channel })
    expect(paymentLinkReminderCopy(sent('email'))).toBe("Or check your email, we've sent you a secure payment link.")
    expect(paymentLinkReminderCopy(sent('email'))).not.toMatch(/SMS|text|phone/i)
    expect(paymentLinkReminderCopy(sent('sms'))).toBe("Or check your phone, we've sent you a secure payment link by SMS.")
    expect(paymentLinkReminderCopy(sent(null))).toBe("Or check your phone or email for the secure payment link we've sent you.")
  })

  test.each(NOT_SENT_NOTICES)('%s: no payment link message is mentioned', (_label, notice) => {
    const value = notice as Parameters<typeof wasConfirmationSent>[0]
    expect(paymentLinkDestination(value)).toBeNull()
    expect(paymentLinkReminderCopy(value)).toBeNull()
  })
})
