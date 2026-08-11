import { findDetailsStepRefusal, type DetailsStepState } from '../journey'
import {
  GUEST_COMMS_CONSENT_TEXT_VERSION,
  GUEST_TABLE_COMPACT_CONSENT_NOTICE,
} from '@/lib/communication-consent'

/**
 * Email became worth validating on 2026-08-09, when the booking form started collecting
 * it on a soft opt-in basis. Before that a typo was just a dead field on one booking.
 * Now it is a permanently undeliverable address on a marketing list, discovered months
 * later when a campaign bounces.
 *
 * The balance these tests pin: reject the obviously broken, accept anything that might be
 * real. A guest told their own working address is invalid abandons the booking, which
 * costs far more than letting an odd-looking address through.
 */

function state(overrides: Partial<DetailsStepState> = {}): DetailsStepState {
  return {
    revalidatingAvailability: false,
    selectedTime: '19:00',
    phone: '07700900000',
    detailsUnlocked: true,
    isKnownCustomer: false,
    firstName: 'Jane',
    email: '',
    highChairShortfall: null,
    highChairShortfallAcknowledged: false,
    selectionRefusedByReading: false,
    ...overrides,
  }
}

describe('email stays optional', () => {
  it('lets a guest through with no email at all', () => {
    expect(findDetailsStepRefusal(state({ email: '' }))).toBeNull()
  })

  it('treats whitespace as empty rather than as a typo', () => {
    expect(findDetailsStepRefusal(state({ email: '   ' }))).toBeNull()
  })
})

describe('a typed email is checked', () => {
  it.each([
    ['jane@gmail', 'no dot in the domain'],
    ['jane.gmail.com', 'no @ at all'],
    ['@gmail.com', 'nothing before the @'],
    ['jane@', 'nothing after the @'],
    ['jane doe@gmail.com', 'a space in the local part'],
    ['jane@gmail.c', 'a one-character TLD'],
  ])('refuses %j (%s)', (email) => {
    const refusal = findDetailsStepRefusal(state({ email }))
    expect(refusal?.code).toBe('email_invalid')
  })

  it.each([
    'jane@gmail.com',
    'jane.doe@gmail.com',
    'jane+roast@gmail.com',
    'jane_doe@sub.domain.co.uk',
    "o'brien@example.com",
    'JANE@EXAMPLE.COM',
  ])('accepts %j', (email) => {
    expect(findDetailsStepRefusal(state({ email }))).toBeNull()
  })

  it('asks the guest to fix it or clear it, rather than just saying no', () => {
    const refusal = findDetailsStepRefusal(state({ email: 'nope' }))
    expect(refusal?.message).toContain('clear the box')
  })
})

describe('email is checked after the things that actually block a booking', () => {
  it('reports the missing phone first, not the bad email', () => {
    // Order matters for the guest: the phone is required and the email is not, so
    // leading with the optional field would read as though the email were the problem.
    const refusal = findDetailsStepRefusal(state({ phone: '', email: 'nope' }))
    expect(refusal?.code).toBe('phone_missing')
  })

  it('reports the missing name before the bad email', () => {
    const refusal = findDetailsStepRefusal(state({ firstName: '', email: 'nope' }))
    expect(refusal?.code).toBe('name_missing')
  })

  it('still refuses a high-chair shortfall that has not been acknowledged', () => {
    const refusal = findDetailsStepRefusal(
      state({ email: 'jane@gmail.com', highChairShortfall: { requested: 2, free: 0 } })
    )
    expect(refusal?.code).toBe('high_chair_shortfall_unacknowledged')
  })
})

describe('the consent notice tells the guest both ways out', () => {
  it('names the email opt-out as well as the text one', () => {
    // Soft opt-in requires a simple way to refuse. A notice that mentions only NOEVENTS
    // covers texts and leaves email with no stated route out at all.
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).toContain('NOEVENTS')
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).toContain('unsubscribe')
  })

  it('promises that booking confirmations keep coming', () => {
    // The commonest reason a guest withholds an email is fear of losing the confirmation
    // for the table they are booking right now.
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).toMatch(/confirmations and reminders carry on/i)
  })

  it('moved the consent text version, because the wording moved', () => {
    // The version is the record of what a guest was shown. Leaving it at an old value
    // while the words change settles a later dispute against wording that guest never saw.
    // Moved to v3 on 2026-08-11, when live music was dropped from every notice because it
    // is discontinued in full. Bump this pin deliberately whenever the notices change.
    expect(GUEST_COMMS_CONSENT_TEXT_VERSION).toBe('guest-comms-consent-v3')
  })

  it('no longer offers a guest texts about live music', () => {
    // Live music is discontinued in full, so naming it in a standing consent label was
    // promising a guest updates about a night that will never happen again.
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).not.toMatch(/live music/i)
  })
})
