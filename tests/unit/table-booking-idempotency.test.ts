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

  it('changes when the seasonal answer changes, so a flipped Christmas answer is not a 409', () => {
    // The seasonal answer changes the menu, the deposit and the refund terms, so AMS
    // hashes it. Leaving it out of the fingerprint meant a guest who answered yes, went
    // back and answered no resubmitted on the same key with a different hash.
    const accepted = buildSubmitIntentFingerprint({
      ...baseIntent,
      bookingPeriodId: 'christmas-2026',
      bookingPeriodAnswer: true
    })
    const declined = buildSubmitIntentFingerprint({
      ...baseIntent,
      bookingPeriodId: 'christmas-2026',
      bookingPeriodAnswer: false
    })

    expect(accepted).not.toBe(declined)
    expect(accepted).not.toBe(buildSubmitIntentFingerprint(baseIntent))
    expect(declined).not.toBe(buildSubmitIntentFingerprint(baseIntent))
  })

  it('is byte-identical to the pre-seasonal fingerprint when no period applies', () => {
    // Eleven months of the year there is no live period, and a booking already in flight
    // when this deploys must keep its key and replay rather than mint a second booking.
    expect(buildSubmitIntentFingerprint(baseIntent)).toBe(PRE_ACCESSIBILITY_FINGERPRINT)
    expect(
      buildSubmitIntentFingerprint({
        ...baseIntent,
        bookingPeriodId: undefined,
        bookingPeriodAnswer: undefined
      })
    ).toBe(PRE_ACCESSIBILITY_FINGERPRINT)
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

it('distinguishes game selection and edited notes while keeping retries stable', () => {
  const intent = { ...baseIntent, fixtureId: '10000000-0000-4000-8000-000000000001', notes: 'Near the screen' }
  expect(buildSubmitIntentFingerprint(intent)).toBe(buildSubmitIntentFingerprint({ ...intent }))
  expect(buildSubmitIntentFingerprint(intent)).not.toBe(buildSubmitIntentFingerprint({ ...intent, fixtureId: undefined }))
  expect(buildSubmitIntentFingerprint(intent)).not.toBe(buildSubmitIntentFingerprint({ ...intent, notes: 'Different notes' }))
})
