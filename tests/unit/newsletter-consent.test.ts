import {
  GUEST_COMMS_CONSENT_TEXT_VERSION,
  GUEST_MARKETING_EMAIL_LABEL,
  GUEST_NEWSLETTER_CONSENT_TEXT_VERSION,
  GUEST_NEWSLETTER_LABEL,
  GUEST_NEWSLETTER_SCOPE_NOTICE,
} from '@/lib/communication-consent'

/**
 * The newsletter is explicit consent taken on the website, which makes it a different
 * legal animal from the soft opt-in taken during a booking. These tests pin the three
 * things that are easy to break later and expensive to discover: the separate version
 * lineage, the scope the owner actually confirmed, and the absence of claims the SSOT
 * does not support.
 *
 * Scope confirmed by the owner on 2026-08-19: offers and deals, new menu releases,
 * events, and early booking for paid events.
 */

describe('the newsletter has its own consent version lineage', () => {
  it('does not share the booking-time consent version', () => {
    // Sharing it would mean a newsletter reword silently reassigned every booking consent
    // already stored, and vice versa.
    expect(GUEST_NEWSLETTER_CONSENT_TEXT_VERSION).not.toBe(GUEST_COMMS_CONSENT_TEXT_VERSION)
  })

  it('is namespaced so the two lineages cannot be confused in the ledger', () => {
    expect(GUEST_NEWSLETTER_CONSENT_TEXT_VERSION).toMatch(/^guest-newsletter-consent-v\d+$/)
  })
})

describe('the newsletter label covers the scope the owner confirmed', () => {
  it.each([
    ['events', /quiz nights and bingo/i],
    ['new menus', /new menus/i],
    ['offers', /offers/i],
    ['early booking', /first chance to book/i],
  ])('names %s', (_scope, pattern) => {
    expect(GUEST_NEWSLETTER_LABEL).toMatch(pattern)
  })

  it('stays concrete rather than reverting to a generic mailing-list phrase', () => {
    // Measured: the old generic "events and offers" wording was ticked by 1 of 71 guests.
    // Naming the actual nights is what made the booking-time label work, so the newsletter
    // label must not regress to the generic form.
    expect(GUEST_NEWSLETTER_LABEL).not.toMatch(/^Email me events and offers/i)
  })
})

describe('the newsletter promises nothing the SSOT cannot back', () => {
  it.each([
    ['live music, discontinued in full', /live music/i],
    ['karaoke, occasional and not guaranteed', /karaoke/i],
    ['DJ nights, occasional and not guaranteed', /\bDJ\b/i],
  ])('never mentions %s', (_thing, pattern) => {
    expect(GUEST_NEWSLETTER_LABEL).not.toMatch(pattern)
    expect(GUEST_NEWSLETTER_SCOPE_NOTICE).not.toMatch(pattern)
  })

  it.each([
    ['weekly', /\bweekly\b/i],
    ['monthly', /\bmonthly\b/i],
    ['daily', /\bdaily\b/i],
    ['once a week', /once a (week|month)/i],
  ])('makes no %s frequency promise', (_cadence, pattern) => {
    // A cadence commitment is not in the SSOT, and breaking one is a leading cause of
    // unsubscribes. The notice says "when there is something worth knowing" instead.
    expect(GUEST_NEWSLETTER_LABEL).not.toMatch(pattern)
    expect(GUEST_NEWSLETTER_SCOPE_NOTICE).not.toMatch(pattern)
  })
})

describe('the notice makes the consent valid, not merely obtained', () => {
  it('names the way out', () => {
    expect(GUEST_NEWSLETTER_SCOPE_NOTICE).toMatch(/unsubscribe/i)
  })

  it('says the address is not passed on', () => {
    expect(GUEST_NEWSLETTER_SCOPE_NOTICE).toMatch(/never pass your address/i)
  })
})

describe('the newsletter offers one thing the booking-time label does not', () => {
  it('promises early booking, which soft opt-in does not', () => {
    // v4 widened the booking notices to name menus and offers too, so the two now describe
    // almost the same content. Early booking for paid events is the remaining difference:
    // a genuine benefit rather than a wider category of message.
    expect(GUEST_MARKETING_EMAIL_LABEL).not.toMatch(/first chance to book/i)
    expect(GUEST_NEWSLETTER_LABEL).toMatch(/first chance to book/i)
  })

  it('still overlaps on menus and offers, which both now name', () => {
    // Pinned so a later narrowing of the booking notices is a deliberate act, not a drift
    // that quietly puts them back to under-describing what is sent.
    expect(GUEST_MARKETING_EMAIL_LABEL).toMatch(/new menus/i)
    expect(GUEST_MARKETING_EMAIL_LABEL).toMatch(/offers/i)
  })
})
