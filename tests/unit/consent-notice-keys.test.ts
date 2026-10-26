import {
  COMMUNICATION_CONSENT_NOTICE_KEYS,
  DEFAULT_COMMUNICATION_CONSENT_STATE,
  GUEST_COMMS_CONSENT_TEXT_VERSION,
  GUEST_EVENT_COMPACT_CONSENT_NOTICE,
  GUEST_QUICK_BOOK_CONSENT_NOTICE,
  GUEST_SERVICE_CONTACT_NOTICE,
  GUEST_TABLE_COMPACT_CONSENT_NOTICE,
  buildCommunicationConsentPayload,
} from '@/lib/communication-consent'
import {
  communicationConsentIdempotencyPart,
  sanitizeCommunicationConsent,
} from '@/lib/communication-consent-server'
import { buildQuickBookPayload, defaultQuickBookState } from '@/lib/table-booking/quick-book'

/**
 * Review BK-080: the management app recorded the generic service wording for every
 * website consent, whatever notice the guest had read. The website now says which
 * notice it showed, by a key the management app holds the words under. The keys
 * and the words they stand for are a contract with the management app (release 20),
 * so they are pinned here word for word.
 */

const CONSENT = {
  service_contact_notice_shown: true,
  marketing_email_opt_in: false,
  marketing_sms_opt_in: true,
  whatsapp_opt_in: false,
  marketing_whatsapp_opt_in: false,
  consent_text_version: 'guest-comms-consent-v6',
}

describe('the notice keys', () => {
  it('are the four agreed with the management app', () => {
    expect([...COMMUNICATION_CONSENT_NOTICE_KEYS]).toEqual([
      'table_compact_v6',
      'event_compact_v6',
      'table_quick_book_v1',
      'service_notice_v6',
    ])
  })

  it('stand for words that have not moved, because the management app holds a copy of each', () => {
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).toBe(
      'We will use your phone and email to manage this booking, and to send you the latest from The Anchor: what is on, new menus, offers, and any changes. Reply NOEVENTS to stop texts, or use the unsubscribe link in any email. Booking confirmations and reminders carry on either way.'
    )
    expect(GUEST_EVENT_COMPACT_CONSENT_NOTICE).toBe(GUEST_TABLE_COMPACT_CONSENT_NOTICE)
    expect(GUEST_SERVICE_CONTACT_NOTICE).toBe(
      'We will use your phone and email to manage this booking, including confirmations, reminders, payment links, waitlist updates, and changes.'
    )
    expect(GUEST_QUICK_BOOK_CONSENT_NOTICE).toBe(
      'We will use your phone to manage this booking, and to text you the latest from The Anchor: what is on, new menus, offers, and any changes. Reply NOEVENTS to stop those texts. Booking confirmations and reminders carry on either way.'
    )
  })

  it('leave the consent wording version where it was', () => {
    expect(GUEST_COMMS_CONSENT_TEXT_VERSION).toBe('guest-comms-consent-v6')
  })

  it('give the quick-book sheet a notice with no email in it, since the sheet asks for none (BK-079)', () => {
    expect(GUEST_QUICK_BOOK_CONSENT_NOTICE).not.toMatch(/email|unsubscribe/i)
    expect(GUEST_QUICK_BOOK_CONSENT_NOTICE).toContain('Reply NOEVENTS')
  })
})

describe('buildCommunicationConsentPayload', () => {
  it.each(COMMUNICATION_CONSENT_NOTICE_KEYS)('carries the notice key %s', (key) => {
    expect(buildCommunicationConsentPayload(DEFAULT_COMMUNICATION_CONSENT_STATE, key)).toEqual({
      service_contact_notice_shown: true,
      marketing_email_opt_in: false,
      marketing_sms_opt_in: false,
      whatsapp_opt_in: false,
      marketing_whatsapp_opt_in: false,
      consent_text_version: GUEST_COMMS_CONSENT_TEXT_VERSION,
      notice_key: key,
    })
  })
})

describe('sanitizeCommunicationConsent and the notice key', () => {
  it.each(COMMUNICATION_CONSENT_NOTICE_KEYS)('passes %s on to the management app', (key) => {
    expect(sanitizeCommunicationConsent({ ...CONSENT, notice_key: key })).toEqual({ ...CONSENT, notice_key: key })
  })

  it.each([
    ['an old key', 'table_compact_v5'],
    ['a made-up key', 'anything'],
    ['an empty string', ''],
    ['a number', 6],
    ['an object', { key: 'table_compact_v6' }],
  ])('drops %s but keeps the rest of the record', (_label, noticeKey) => {
    const sanitized = sanitizeCommunicationConsent({ ...CONSENT, notice_key: noticeKey })
    expect(sanitized).toEqual(CONSENT)
    expect(sanitized).not.toHaveProperty('notice_key')
  })

  it('leaves a record that came with no key exactly as it was', () => {
    expect(sanitizeCommunicationConsent(CONSENT)).toEqual(CONSENT)
    expect(sanitizeCommunicationConsent(CONSENT)).not.toHaveProperty('notice_key')
  })
})

describe('communicationConsentIdempotencyPart', () => {
  // The string the route made for this consent before notice keys existed, written out
  // so a change to it cannot pass unnoticed: a changed part changes every fallback key.
  const BEFORE =
    '{"service_contact_notice_shown":true,"marketing_email_opt_in":false,"marketing_sms_opt_in":true,"whatsapp_opt_in":false,"marketing_whatsapp_opt_in":false,"consent_text_version":"guest-comms-consent-v6"}'

  it('is the string it always was for a record with no key', () => {
    expect(communicationConsentIdempotencyPart(CONSENT)).toBe(BEFORE)
  })

  it.each(COMMUNICATION_CONSENT_NOTICE_KEYS)('is the same string when the record carries %s', (key) => {
    expect(communicationConsentIdempotencyPart({ ...CONSENT, notice_key: key })).toBe(BEFORE)
  })

  it('is still "null" when there is no record', () => {
    expect(communicationConsentIdempotencyPart(undefined)).toBe('null')
    expect(communicationConsentIdempotencyPart(null)).toBe('null')
  })
})

describe('the quick-book payload (BK-079)', () => {
  it('records that the quick-book notice was shown, with every marketing choice left at the default', () => {
    const payload = buildQuickBookPayload({
      state: { ...defaultQuickBookState(), date: '2026-11-04' },
      time: '19:00',
      slotPurpose: 'food_or_drinks',
      phone: ' 07700 900000 ',
      firstName: ' Jane ',
    })

    expect(payload.communication_consent).toEqual({
      service_contact_notice_shown: true,
      marketing_email_opt_in: false,
      marketing_sms_opt_in: false,
      whatsapp_opt_in: false,
      marketing_whatsapp_opt_in: false,
      consent_text_version: GUEST_COMMS_CONSENT_TEXT_VERSION,
      notice_key: 'table_quick_book_v1',
    })
    // And the website's own route passes it on as it is.
    expect(sanitizeCommunicationConsent(payload.communication_consent)).toEqual(payload.communication_consent)
  })
})
