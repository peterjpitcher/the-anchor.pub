import type { AvailabilitySlot } from '@/lib/table-booking/availability'
import {
  EVENING_START_MINUTES,
  groupSlotsForDisplay,
  highChairFlagLabel
} from '@/lib/table-booking/slot-groups'

function slot(overrides: Partial<AvailabilitySlot> & { time: string }): AvailabilitySlot {
  return {
    available: true,
    available_capacity: 8,
    bookable_purpose: 'food_or_drinks',
    ...overrides
  }
}

// Every context below carries `hideWhenNoHighChairFree: true`, the two-screen
// flow's policy, because these tests describe the grid the guest actually sees.
// The rule itself, including the four-step flow's policy, is covered in
// tests/unit/slot-selection.test.ts.
describe('groupSlotsForDisplay', () => {
  it('splits the day at 5pm, so every time lands in exactly one heading', () => {
    expect(EVENING_START_MINUTES).toBe(17 * 60)

    const grouped = groupSlotsForDisplay(
      [slot({ time: '12:00' }), slot({ time: '16:30' }), slot({ time: '17:00' }), slot({ time: '21:00' })],
      { partySize: 2, highChairCount: 0, hideWhenNoHighChairFree: true, requiresFoodService: false }
    )

    expect(grouped.lunch.map((entry) => entry.slot.time)).toEqual(['12:00', '16:30'])
    expect(grouped.evening.map((entry) => entry.slot.time)).toEqual(['17:00', '21:00'])
  })

  it('greys out a time the route did not affirm rather than dropping it', () => {
    // The guest has to be able to see that their refinement did something. A
    // grid that silently shrinks reads as a broken page.
    const grouped = groupSlotsForDisplay(
      [slot({ time: '13:00' }), slot({ time: '13:30', available: false, available_capacity: 0 })],
      { partySize: 2, highChairCount: 0, hideWhenNoHighChairFree: true, requiresFoodService: false }
    )

    expect(grouped.lunch.map((entry) => entry.state)).toEqual(['available', 'unavailable'])
    expect(grouped.selectableTimes).toEqual(['13:00'])
  })

  it('never lets a party-size shortfall read as bookable', () => {
    const grouped = groupSlotsForDisplay([slot({ time: '13:00', available_capacity: 2 })], {
      partySize: 6,
      highChairCount: 0,
      hideWhenNoHighChairFree: true, requiresFoodService: false
    })

    expect(grouped.lunch[0].state).toBe('unavailable')
    expect(grouped.selectableTimes).toEqual([])
  })

  describe('high chairs (owner decision D4)', () => {
    it('flags a shortfall and keeps the time tappable', () => {
      const grouped = groupSlotsForDisplay([slot({ time: '13:00', high_chairs_remaining: 1 })], {
        partySize: 2,
        highChairCount: 2,
        hideWhenNoHighChairFree: true, requiresFoodService: false
      })

      expect(grouped.lunch[0].state).toBe('available')
      expect(grouped.lunch[0].highChairsFree).toBe(1)
      expect(grouped.selectableTimes).toEqual(['13:00'])
      expect(grouped.hiddenForHighChairs).toBe(0)
    })

    it('hides a time only when no chair is free and chairs were asked for', () => {
      const grouped = groupSlotsForDisplay(
        [slot({ time: '13:00', high_chairs_remaining: 0 }), slot({ time: '14:00', high_chairs_remaining: 2 })],
        { partySize: 2, highChairCount: 1, hideWhenNoHighChairFree: true, requiresFoodService: false }
      )

      expect(grouped.lunch.map((entry) => entry.slot.time)).toEqual(['14:00'])
      expect(grouped.hiddenForHighChairs).toBe(1)
    })

    it('keeps every time when no chairs were asked for', () => {
      const grouped = groupSlotsForDisplay(
        [slot({ time: '13:00', high_chairs_remaining: 0 }), slot({ time: '14:00', high_chairs_remaining: 2 })],
        { partySize: 2, highChairCount: 0, hideWhenNoHighChairFree: true, requiresFoodService: false }
      )

      expect(grouped.lunch).toHaveLength(2)
      expect(grouped.lunch.every((entry) => entry.highChairsFree === undefined)).toBe(true)
      expect(grouped.hiddenForHighChairs).toBe(0)
    })

    it('does not flag a time that covers the request', () => {
      const grouped = groupSlotsForDisplay([slot({ time: '13:00', high_chairs_remaining: 2 })], {
        partySize: 2,
        highChairCount: 2,
        hideWhenNoHighChairFree: true, requiresFoodService: false
      })

      expect(grouped.lunch[0].highChairsFree).toBeUndefined()
    })

    it('leaves an unreported chair count alone rather than guessing at it', () => {
      // Absent means unknown, not zero. Hiding a time on a missing field would
      // take away a table the pub can actually seat.
      const grouped = groupSlotsForDisplay([slot({ time: '13:00' })], {
        partySize: 2,
        highChairCount: 2,
        hideWhenNoHighChairFree: true, requiresFoodService: false
      })

      expect(grouped.lunch[0].state).toBe('available')
      expect(grouped.lunch[0].highChairsFree).toBeUndefined()
      expect(grouped.hiddenForHighChairs).toBe(0)
    })

    it('does not count an already-unavailable time as hidden by the chair rule', () => {
      // Otherwise the "no chairs anywhere" message blames the chairs for a date
      // that has no tables free at all.
      const grouped = groupSlotsForDisplay(
        [slot({ time: '13:00', available: false, available_capacity: 0, high_chairs_remaining: 0 })],
        { partySize: 2, highChairCount: 1, hideWhenNoHighChairFree: true, requiresFoodService: false }
      )

      expect(grouped.hiddenForHighChairs).toBe(0)
      expect(grouped.lunch[0].state).toBe('unavailable')
    })
  })
})

describe('highChairFlagLabel', () => {
  it('gets the plural right', () => {
    expect(highChairFlagLabel(1)).toBe('1 high chair free')
    expect(highChairFlagLabel(2)).toBe('2 high chairs free')
  })
})
