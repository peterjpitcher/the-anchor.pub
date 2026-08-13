/**
 * The seasonal pre-order: what counts as complete, and what counts as the same
 * booking.
 *
 * The fingerprint tests matter most. AMS hashes the pre-order, so if this side
 * does not, a guest who corrects a dish and resubmits sends the old
 * Idempotency-Key with a changed payload and is answered 409.
 */

import {
  emptyPreorderChoice,
  isPreorderComplete,
  preorderGuestsMissingMain,
  resizePreorderChoices,
  type PreorderChoice
} from '@/components/features/TableBooking/SeasonalPreorderPicker'
import {
  buildSubmitIntentFingerprint,
  type TableBookingSubmitIntentFields
} from '@/lib/table-booking-idempotency'
import { buildTableBookingPayload } from '@/lib/table-booking/submission'

function choice(guestIndex: number, overrides: Partial<PreorderChoice> = {}): PreorderChoice {
  return { ...emptyPreorderChoice(guestIndex), ...overrides }
}

describe('resizePreorderChoices', () => {
  it('keeps existing answers when the party grows', () => {
    const before = [choice(0, { mainId: 'turkey' })]
    const after = resizePreorderChoices(before, 3)

    expect(after).toHaveLength(3)
    expect(after[0].mainId).toBe('turkey')
    expect(after[1].mainId).toBeNull()
    expect(after[2].mainId).toBeNull()
  })

  it('drops the trailing seats when the party shrinks', () => {
    const before = [choice(0, { mainId: 'turkey' }), choice(1, { mainId: 'beef' })]
    expect(resizePreorderChoices(before, 1)).toHaveLength(1)
    expect(resizePreorderChoices(before, 1)[0].mainId).toBe('turkey')
  })
})

describe('isPreorderComplete', () => {
  it('needs a main for every guest, and nothing else', () => {
    const choices = [choice(0, { mainId: 'turkey' }), choice(1, { mainId: 'wellington' })]
    expect(isPreorderComplete(choices, 2)).toBe(true)
  })

  it('is incomplete while any guest has no main', () => {
    const choices = [choice(0, { mainId: 'turkey' }), choice(1)]
    expect(isPreorderComplete(choices, 2)).toBe(false)
    expect(preorderGuestsMissingMain(choices, 2)).toEqual([2])
  })

  it('goes incomplete when the party grows past the answers', () => {
    const choices = [choice(0, { mainId: 'turkey' })]
    expect(isPreorderComplete(choices, 1)).toBe(true)
    expect(isPreorderComplete(choices, 2)).toBe(false)
    expect(preorderGuestsMissingMain(choices, 2)).toEqual([2])
  })

  it('does not treat a starter or dessert as a substitute for a main', () => {
    const choices = [choice(0, { starterId: 'soup', dessertId: 'pudding' })]
    expect(isPreorderComplete(choices, 1)).toBe(false)
  })
})

describe('buildTableBookingPayload with a pre-order', () => {
  const base = {
    phone: '+447700900123',
    firstName: 'Jo',
    lastName: 'Bloggs',
    date: '2026-12-05',
    time: '19:00',
    partySize: 2,
    purpose: 'food' as const,
    notes: '',
    highChairCount: 0,
    isOutsideSeating: false,
    requiresAccessibleTable: false,
    communicationConsent: {} as never,
    seasonalAnswer: { periodId: 'period-1', accepted: true },
    attribution: {} as never,
    turnstileToken: null,
    website: '',
    secondsOnForm: 12
  }

  it('sends the pre-order in seat order', () => {
    const payload = buildTableBookingPayload({
      ...base,
      preorder: [{ main_menu_item_id: 'turkey' }, { main_menu_item_id: 'wellington' }]
    })

    expect(payload.preorder).toEqual([
      { main_menu_item_id: 'turkey' },
      { main_menu_item_id: 'wellington' }
    ])
  })

  it('omits the field entirely when there is no pre-order', () => {
    expect(buildTableBookingPayload(base)).not.toHaveProperty('preorder')
    expect(buildTableBookingPayload({ ...base, preorder: [] })).not.toHaveProperty('preorder')
  })
})

describe('buildSubmitIntentFingerprint with a pre-order', () => {
  const base: TableBookingSubmitIntentFields = {
    phone: '+447700900123',
    date: '2026-12-05',
    time: '19:00',
    partySize: 2,
    purpose: 'food',
    highChairCount: 0,
    isOutsideSeating: false,
    communicationConsent: {} as never,
    bookingPeriodId: 'period-1',
    bookingPeriodAnswer: true
  }

  it('mints a new key when a dish changes', () => {
    const before = buildSubmitIntentFingerprint({ ...base, preorder: [{ main_menu_item_id: 'turkey' }] })
    const after = buildSubmitIntentFingerprint({ ...base, preorder: [{ main_menu_item_id: 'beef' }] })
    expect(after).not.toBe(before)
  })

  it('mints a new key when the same dishes move between seats', () => {
    const original = buildSubmitIntentFingerprint({
      ...base,
      preorder: [{ main_menu_item_id: 'turkey' }, { main_menu_item_id: 'wellington' }]
    })
    const swapped = buildSubmitIntentFingerprint({
      ...base,
      preorder: [{ main_menu_item_id: 'wellington' }, { main_menu_item_id: 'turkey' }]
    })
    expect(swapped).not.toBe(original)
  })

  it('mints a new key when a course is added or an add-on is ticked', () => {
    const mainOnly = buildSubmitIntentFingerprint({ ...base, preorder: [{ main_menu_item_id: 'turkey' }] })

    expect(
      buildSubmitIntentFingerprint({
        ...base,
        preorder: [{ main_menu_item_id: 'turkey', dessert_menu_item_id: 'pudding' }]
      })
    ).not.toBe(mainOnly)

    expect(
      buildSubmitIntentFingerprint({
        ...base,
        preorder: [{ main_menu_item_id: 'turkey', addon_menu_item_ids: ['cheese'] }]
      })
    ).not.toBe(mainOnly)
  })

  it('reuses the key when only the add-on tick order differs', () => {
    const oneWay = buildSubmitIntentFingerprint({
      ...base,
      preorder: [{ main_menu_item_id: 'turkey', addon_menu_item_ids: ['a', 'b'] }]
    })
    const otherWay = buildSubmitIntentFingerprint({
      ...base,
      preorder: [{ main_menu_item_id: 'turkey', addon_menu_item_ids: ['b', 'a'] }]
    })
    expect(otherWay).toBe(oneWay)
  })

  it('reuses the key for an identical retry', () => {
    const fields = { ...base, preorder: [{ main_menu_item_id: 'turkey' }] }
    expect(buildSubmitIntentFingerprint(fields)).toBe(buildSubmitIntentFingerprint(fields))
  })

  it('fingerprints exactly as before when no pre-order is collected', () => {
    // Eleven months of the year, and any guest mid-journey across the deploy.
    const without = buildSubmitIntentFingerprint(base)
    expect(buildSubmitIntentFingerprint({ ...base, preorder: undefined })).toBe(without)
    expect(buildSubmitIntentFingerprint({ ...base, preorder: [] })).toBe(without)
  })
})
