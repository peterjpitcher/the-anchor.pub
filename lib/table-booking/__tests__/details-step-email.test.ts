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
 * It became REQUIRED on 2026-08-19. Measured cause: the field was labelled "(optional)"
 * and only 46% of new guests left an address, so about half of every month's bookers
 * could never be emailed at all. The confirmation is a real reason to ask.
 *
 * The balance these tests pin: demand an address, reject the obviously broken, and accept
 * anything that might be real. A guest told their own working address is invalid abandons
 * the booking, which costs far more than letting an odd-looking address through.
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

describe('email is required', () => {
  it('refuses an empty box', () => {
    const refusal = findDetailsStepRefusal(state({ email: '' }))
    expect(refusal?.code).toBe('email_missing')
  })

  it('treats whitespace as empty rather than as a typed address', () => {
    // Otherwise a space would satisfy the required check and then fail the shape check,
    // which tells the guest their address looks wrong when they never gave one.
    const refusal = findDetailsStepRefusal(state({ email: '   ' }))
    expect(refusal?.code).toBe('email_missing')
  })

  it('says why it is being asked for', () => {
    // A required field with no stated reason reads as data harvesting, which is exactly
    // when a guest abandons. The confirmation is the reason, so it goes in the message.
    const refusal = findDetailsStepRefusal(state({ email: '' }))
    expect(refusal?.message).toMatch(/confirmation/i)
  })

  it('exempts a known customer, who never sees the box', () => {
    // The management app already holds their address and the form submits nothing for
    // them, so demanding one would block a returning guest over an off-screen field.
    expect(findDetailsStepRefusal(state({ isKnownCustomer: true, email: '' }))).toBeNull()
  })

  it('still checks a known customer address if one was somehow typed', () => {
    const refusal = findDetailsStepRefusal(state({ isKnownCustomer: true, email: 'nope' }))
    expect(refusal?.code).toBe('email_invalid')
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

  it('asks the guest to check it, rather than just saying no', () => {
    // No longer offers "or clear the box": clearing it is now a refusal in its own right,
    // so suggesting it would send the guest round in a circle.
    const refusal = findDetailsStepRefusal(state({ email: 'nope' }))
    expect(refusal?.message).toContain('check it')
    expect(refusal?.message).not.toContain('clear the box')
  })
})

describe('email is checked after the earlier fields on the form', () => {
  it('reports the missing phone first, not the bad email', () => {
    // Order matters for the guest: both are required now, so the refusal should follow
    // reading order down the form rather than jumping to the last field they touched.
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
    // Moved to v5 on 2026-08-20, when the venue confirmed the scope is the latest from The
    // Anchor generally, including changes as they happen, not only events, menus and offers.
    // Bump this pin deliberately whenever the notices change.
    expect(GUEST_COMMS_CONSENT_TEXT_VERSION).toBe('guest-comms-consent-v5')
  })

  it('describes the menus and offers that are actually sent, not just the game nights', () => {
    // The v3 wording named the three game nights only, while the "Lunch from September
    // 2026" campaign had already gone to this same list. A notice that under-describes what
    // is sent is not the clear information the soft opt-in basis depends on.
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).toMatch(/new menus/i)
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).toMatch(/offers/i)
  })

  it('covers changes, which the venue also sends', () => {
    // v5. Menu launches and altered hours are things guests are told about, and a notice
    // that lists only events, menus and offers under-describes that.
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).toMatch(/any changes/i)
  })

  it('no longer offers a guest texts about live music', () => {
    // Live music is discontinued in full, so naming it in a standing consent label was
    // promising a guest updates about a night that will never happen again.
    expect(GUEST_TABLE_COMPACT_CONSENT_NOTICE).not.toMatch(/live music/i)
  })
})
