import { buildSubmitIntentFingerprint } from '@/lib/table-booking-idempotency'
import { DEFAULT_COMMUNICATION_CONSENT_STATE } from '@/lib/communication-consent'

// The website fingerprint mirrors the AMS request hash in
// src/lib/table-bookings/booking-idempotency.ts: every field that changes what
// is booked must vary it, and accessibility is include-only-when-true so an
// absent-or-false flag stays byte-identical to the pre-field fingerprint.
const baseIntent = {
  phone: '07700900000',
  firstName: 'Sam',
  lastName: 'Walker',
  email: '',
  date: '2026-07-07',
  time: '19:00',
  partySize: 2,
  purpose: 'food' as const,
  notes: '',
  highChairCount: 0,
  isOutsideSeating: false,
  communicationConsent: DEFAULT_COMMUNICATION_CONSENT_STATE
}

// Captured from the fingerprint builder BEFORE requires_accessible_table
// existed. Absent-or-false must still produce exactly this string.
const PRE_ACCESSIBILITY_FINGERPRINT = JSON.stringify({
  phone: '07700900000',
  firstName: 'Sam',
  lastName: 'Walker',
  email: '',
  date: '2026-07-07',
  time: '19:00',
  partySize: 2,
  purpose: 'food',
  notes: '',
  highChairCount: 0,
  isOutsideSeating: false,
  communicationConsent: DEFAULT_COMMUNICATION_CONSENT_STATE
})

describe('buildSubmitIntentFingerprint', () => {
  it('is stable for an unchanged intent, so a retry reuses the same key', () => {
    expect(buildSubmitIntentFingerprint(baseIntent)).toBe(
      buildSubmitIntentFingerprint({ ...baseIntent })
    )
  })

  it('changes when accessibility is requested, so that retry does not dedupe', () => {
    const without = buildSubmitIntentFingerprint(baseIntent)
    const withAccessible = buildSubmitIntentFingerprint({
      ...baseIntent,
      requiresAccessibleTable: true
    })

    expect(withAccessible).not.toBe(without)
    expect(withAccessible).toContain('requiresAccessibleTable')
  })

  it('is byte-identical to the pre-change fingerprint when the flag is false or absent', () => {
    expect(buildSubmitIntentFingerprint(baseIntent)).toBe(PRE_ACCESSIBILITY_FINGERPRINT)
    expect(
      buildSubmitIntentFingerprint({ ...baseIntent, requiresAccessibleTable: false })
    ).toBe(PRE_ACCESSIBILITY_FINGERPRINT)
    expect(
      buildSubmitIntentFingerprint({ ...baseIntent, requiresAccessibleTable: undefined })
    ).toBe(PRE_ACCESSIBILITY_FINGERPRINT)
  })

  it('false and absent are the same intent as each other', () => {
    expect(buildSubmitIntentFingerprint({ ...baseIntent, requiresAccessibleTable: false })).toBe(
      buildSubmitIntentFingerprint(baseIntent)
    )
  })

  it('still varies with every other booking-changing field', () => {
    const base = buildSubmitIntentFingerprint(baseIntent)

    expect(buildSubmitIntentFingerprint({ ...baseIntent, partySize: 3 })).not.toBe(base)
    expect(buildSubmitIntentFingerprint({ ...baseIntent, date: '2026-07-08' })).not.toBe(base)
    expect(buildSubmitIntentFingerprint({ ...baseIntent, time: '19:30' })).not.toBe(base)
    expect(buildSubmitIntentFingerprint({ ...baseIntent, purpose: 'drinks' })).not.toBe(base)
    expect(buildSubmitIntentFingerprint({ ...baseIntent, highChairCount: 1 })).not.toBe(base)
    expect(buildSubmitIntentFingerprint({ ...baseIntent, isOutsideSeating: true })).not.toBe(base)
    expect(buildSubmitIntentFingerprint({ ...baseIntent, notes: 'Window seat' })).not.toBe(base)
  })

  it('trims the free-text fields so whitespace alone is not a new intent', () => {
    expect(
      buildSubmitIntentFingerprint({
        ...baseIntent,
        phone: '  07700900000  ',
        firstName: ' Sam ',
        notes: '  '
      })
    ).toBe(buildSubmitIntentFingerprint(baseIntent))
  })
})
