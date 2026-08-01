import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { AvailabilitySlot } from '@/lib/table-booking/availability'
import {
  judgeSlot,
  judgeTime,
  pickClosestSelectableSlot,
  selectableSlots,
  type SlotSelectionContext
} from '@/lib/table-booking/selection'

function slot(overrides: Partial<AvailabilitySlot> & { time: string }): AvailabilitySlot {
  return {
    available: true,
    available_capacity: 8,
    bookable_purpose: 'food_or_drinks',
    ...overrides
  }
}

function context(overrides: Partial<SlotSelectionContext> = {}): SlotSelectionContext {
  return { partySize: 2, highChairCount: 0, hideWhenNoHighChairFree: true, ...overrides }
}

describe('judgeSlot: the one rule', () => {
  it('refuses what the availability route refused', () => {
    expect(judgeSlot(slot({ time: '13:00', available: false, available_capacity: 0 }), context())).toEqual({
      selectable: false,
      display: 'grey',
      coversHighChairRequest: true
    })
  })

  it('refuses a slot too small for the party', () => {
    expect(judgeSlot(slot({ time: '13:00', available_capacity: 2 }), context({ partySize: 6 }))).toEqual({
      selectable: false,
      display: 'grey',
      coversHighChairRequest: true
    })
  })

  it('offers an affirmed slot when no chairs are in play', () => {
    expect(judgeSlot(slot({ time: '13:00', high_chairs_remaining: 0 }), context())).toEqual({
      selectable: true,
      display: 'offer',
      coversHighChairRequest: true
    })
  })

  describe('high chairs', () => {
    it('offers a short slot with the count on it, never hides it (D4)', () => {
      expect(
        judgeSlot(slot({ time: '13:00', high_chairs_remaining: 1 }), context({ highChairCount: 2 }))
      ).toEqual({ selectable: true, display: 'offer', coversHighChairRequest: false, highChairsFree: 1 })
    })

    it('does not flag a slot that covers the request', () => {
      expect(
        judgeSlot(slot({ time: '13:00', high_chairs_remaining: 2 }), context({ highChairCount: 2 }))
      ).toEqual({ selectable: true, display: 'offer', coversHighChairRequest: true })
    })

    it('treats a missing count as unknown, not as zero', () => {
      // Refusing on an absent field would take away a table the pub can seat.
      expect(judgeSlot(slot({ time: '13:00' }), context({ highChairCount: 2 }))).toEqual({
        selectable: true,
        display: 'offer',
        coversHighChairRequest: true
      })
    })

    it('hides a chairless slot for the two-screen flow, which can offer 0 chairs instead', () => {
      expect(
        judgeSlot(slot({ time: '13:00', high_chairs_remaining: 0 }), context({ highChairCount: 1 }))
      ).toEqual({ selectable: false, display: 'hide', coversHighChairRequest: false })
    })

    it('keeps it for the four-step flow, which asks "book anyway?" instead', () => {
      expect(
        judgeSlot(
          slot({ time: '13:00', high_chairs_remaining: 0 }),
          context({ highChairCount: 1, hideWhenNoHighChairFree: false })
        )
      ).toEqual({
        selectable: true,
        display: 'offer',
        // The live four-step policy: a time with no chair free is still
        // offered there, but it plainly does not cover the request, and
        // anything that needs a time which CAN cover it must ask this field.
        coversHighChairRequest: false
      })
    })
  })
})

describe('judgeTime', () => {
  const slots = [slot({ time: '13:00' }), slot({ time: '18:00' })]

  it('refuses a time the reading never mentioned', () => {
    // A complete answer is exhaustive, so silence about a time refuses it.
    expect(judgeTime(slots, '14:00', context())).toEqual({
      selectable: false,
      display: 'hide',
      // Refused, but not over chairs: nothing may read a chair verdict from a
      // time the reading never mentioned.
      coversHighChairRequest: true
    })
  })

  it('refuses an empty time', () => {
    expect(judgeTime(slots, '', context()).selectable).toBe(false)
  })

  it('gives the same verdict as judgeSlot for a time it does have', () => {
    expect(judgeTime(slots, '13:00', context())).toEqual(judgeSlot(slots[0], context()))
  })
})

describe('selectableSlots and pickClosestSelectableSlot', () => {
  const slots = [
    slot({ time: '12:00', high_chairs_remaining: 0 }),
    slot({ time: '18:00', high_chairs_remaining: 2 }),
    slot({ time: '21:00', available: false, available_capacity: 0 })
  ]

  it('lists only what the rule allows', () => {
    expect(selectableSlots(slots, context({ highChairCount: 1 })).map((s) => s.time)).toEqual(['18:00'])
  })

  it('never picks a time the rule refuses', () => {
    // The nearest time is 12:00, but it has no chair free.
    expect(pickClosestSelectableSlot(slots, '12:00', context({ highChairCount: 1 }))).toBe('18:00')
    expect(pickClosestSelectableSlot(slots, '12:00', context())).toBe('12:00')
  })

  it('answers null when nothing is selectable, which is the "date is empty" signal', () => {
    expect(pickClosestSelectableSlot([], '12:00', context())).toBeNull()
    expect(
      pickClosestSelectableSlot(
        [slot({ time: '12:00', available: false, available_capacity: 0 })],
        '12:00',
        context()
      )
    ).toBeNull()
  })
})

/**
 * The regression that matters most. Three separate answers to "is this slot
 * valid?" is what produced the release-gate defects: the grid hid a time the
 * re-validation kept, and the party-size handler asked nothing at all.
 *
 * This reads the source rather than the behaviour on purpose. A behavioural
 * test can only catch the disagreements someone thought to write down; this
 * catches a second definition being introduced at all.
 */
describe('there is exactly one selection rule', () => {
  const root = join(__dirname, '..', '..')
  const read = (path: string) => readFileSync(join(root, path), 'utf8')

  const SELECTION_SURFACE = [
    'components/features/TableBooking/ManagementTableBookingForm.tsx',
    'components/features/TableBooking/SlotPickerGrid.tsx',
    'lib/table-booking/slot-groups.ts'
  ]

  it('keeps isSlotAvailable out of every consumer', () => {
    for (const path of SELECTION_SURFACE) {
      expect({ path, uses: read(path).includes('isSlotAvailable') }).toEqual({ path, uses: false })
    }
  })

  it('consults isSlotAvailable in one module only', () => {
    expect(read('lib/table-booking/selection.ts')).toContain('isSlotAvailable(slot, context.partySize)')
  })

  it('lets no consumer re-derive the high-chair rule for itself', () => {
    // `high_chairs_remaining` and the house cap comparison belong to the rule.
    // A consumer reading either is a second definition in the making.
    for (const path of SELECTION_SURFACE) {
      expect({ path, uses: read(path).includes('high_chairs_remaining') }).toEqual({
        path,
        uses: false
      })
    }
  })

  it('routes the grid, re-validation, Continue gate and submit guard through the rule', () => {
    const form = read('components/features/TableBooking/ManagementTableBookingForm.tsx')

    // The grid and the alternatives builder.
    expect(form).toContain(
      'groupSlotsForDisplay(currentReading?.time_slots || [], slotSelectionContext)'
    )
    expect(form).toContain('judgeSlot(slot, probeContext)')
    // Which asks the rule about chairs outright rather than inferring it from a
    // missing field, an inference that read backwards.
    expect(form).toContain('verdict.selectable && verdict.coversHighChairRequest')
    // The re-validation after an options or party-size change.
    expect(form).toContain('judgeTime(data.time_slots, timeAtChange, slotSelectionContext)')
    // The Continue gate and the submit guard both read the same verdict.
    expect(form).toContain('const selectionRefusedByReading = readingCoversSelection')
    expect(form).toContain('hasUsableSelection')
    expect(form).toContain('selectionRefusedByReading\n    })')
  })

  it('checks a reading against the date on screen in one place', () => {
    // A reading answers for one date and carries it. Choosing a nearest
    // alternative moves the guest to another day while this reading still holds
    // the old one, and a slot from it got booked under the new date.
    const form = read('components/features/TableBooking/ManagementTableBookingForm.tsx')
    expect(form).toContain('const currentReading = useMemo(')
    expect(form).toContain('(availability.date || date) === date')
    // And nothing reads the raw slots around it.
    expect(form).not.toContain('availability?.time_slots')
  })

  it('keeps party size in the key that invalidates a reading', () => {
    // Leaving it out is what let a guest change from two to eight under an
    // answer that was never re-checked.
    const form = read('components/features/TableBooking/ManagementTableBookingForm.tsx')
    expect(form).toContain('function buildAvailabilityInputsKey')
    expect(form).toMatch(/buildAvailabilityInputsKey\(\{\s*\n\s*partySize,/)
  })
})
