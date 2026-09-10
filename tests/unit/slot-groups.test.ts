import type { AvailabilitySlot } from '@/lib/table-booking/availability'
import type { PublishedHours } from '@/lib/table-booking/hours-note'
import {
  FALLBACK_EVENING_START_MINUTES,
  groupSlotsForDisplay,
  highChairFlagLabel,
  resolveEveningStartMinutes
} from '@/lib/table-booking/slot-groups'

function slot(overrides: Partial<AvailabilitySlot> & { time: string }): AvailabilitySlot {
  return {
    available: true,
    available_capacity: 8,
    bookable_purpose: 'food_or_drinks',
    ...overrides
  }
}

const NO_CHAIRS_CONTEXT = {
  partySize: 2,
  highChairCount: 0,
  hideWhenNoHighChairFree: true,
  requiresFoodService: false
}

const WEEKDAY_SITTINGS = {
  opens: '12:00:00',
  closes: '22:00:00',
  kitchen: { opens: '12:00:00', closes: '21:00:00' },
  is_kitchen_closed: false,
  schedule_config: [
    { name: 'Lunch', starts_at: '12:00', ends_at: '15:00', booking_type: 'regular' },
    { name: 'Dinner', starts_at: '16:00', ends_at: '21:00', booking_type: 'regular' }
  ]
}

// The shape /business/hours served on 10 September 2026: bar from 4pm on
// Mondays with the kitchen closed, lunch and dinner sittings Tuesday to
// Friday, one sitting on Saturday and on Sunday.
const PUBLISHED_HOURS: PublishedHours = {
  regularHours: {
    monday: { opens: '16:00:00', closes: '22:00:00', kitchen: null, is_kitchen_closed: true },
    tuesday: WEEKDAY_SITTINGS,
    wednesday: WEEKDAY_SITTINGS,
    thursday: WEEKDAY_SITTINGS,
    friday: WEEKDAY_SITTINGS,
    saturday: {
      opens: '12:00:00',
      closes: '22:00:00',
      kitchen: { opens: '12:00:00', closes: '19:00:00' },
      is_kitchen_closed: false,
      schedule_config: [{ name: 'food service', starts_at: '12:00', ends_at: '19:00', booking_type: 'regular' }]
    },
    sunday: {
      opens: '12:00:00',
      closes: '22:00:00',
      kitchen: { opens: '13:00:00', closes: '18:00:00' },
      is_kitchen_closed: false,
      schedule_config: [{ starts_at: '13:00', ends_at: '18:00', booking_type: 'sunday_lunch' }]
    }
  },
  specialHours: []
}

// Every context below carries `hideWhenNoHighChairFree: true`, the two-screen
// flow's policy, because these tests describe the grid the guest actually sees.
// The rule itself, including the four-step flow's policy, is covered in
// tests/unit/slot-selection.test.ts.
describe('groupSlotsForDisplay', () => {
  it('splits the day at the boundary it is given, so every time lands in exactly one heading', () => {
    const grouped = groupSlotsForDisplay(
      [slot({ time: '12:00' }), slot({ time: '16:30' }), slot({ time: '17:00' }), slot({ time: '21:00' })],
      NO_CHAIRS_CONTEXT,
      17 * 60
    )

    expect(grouped.lunch.map((entry) => entry.slot.time)).toEqual(['12:00', '16:30'])
    expect(grouped.evening.map((entry) => entry.slot.time)).toEqual(['17:00', '21:00'])
  })

  it('puts 4pm and 4:30pm under Evening when dinner starts at 4pm', () => {
    const grouped = groupSlotsForDisplay(
      [slot({ time: '12:00' }), slot({ time: '14:30' }), slot({ time: '16:00' }), slot({ time: '16:30' }), slot({ time: '20:30' })],
      NO_CHAIRS_CONTEXT,
      resolveEveningStartMinutes('2026-09-15', PUBLISHED_HOURS)
    )

    expect(grouped.lunch.map((entry) => entry.slot.time)).toEqual(['12:00', '14:30'])
    expect(grouped.evening.map((entry) => entry.slot.time)).toEqual(['16:00', '16:30', '20:30'])
  })

  it('falls back to 4pm when no boundary is given', () => {
    expect(FALLBACK_EVENING_START_MINUTES).toBe(16 * 60)

    const grouped = groupSlotsForDisplay([slot({ time: '15:30' }), slot({ time: '16:00' })], NO_CHAIRS_CONTEXT)

    expect(grouped.lunch.map((entry) => entry.slot.time)).toEqual(['15:30'])
    expect(grouped.evening.map((entry) => entry.slot.time)).toEqual(['16:00'])
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

describe('resolveEveningStartMinutes', () => {
  it('starts Evening at the second kitchen sitting, 4pm on Tuesday to Friday', () => {
    // Tuesday 15 to Friday 18 September 2026.
    for (const date of ['2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18']) {
      expect({ date, minutes: resolveEveningStartMinutes(date, PUBLISHED_HOURS) }).toEqual({
        date,
        minutes: 16 * 60
      })
    }
  })

  it('falls back to 4pm on a Monday, when the kitchen is closed and the bar opens at 4pm', () => {
    expect(resolveEveningStartMinutes('2026-09-14', PUBLISHED_HOURS)).toBe(16 * 60)

    const grouped = groupSlotsForDisplay(
      [slot({ time: '16:00', bookable_purpose: 'drinks_only' }), slot({ time: '16:30', bookable_purpose: 'drinks_only' })],
      NO_CHAIRS_CONTEXT,
      resolveEveningStartMinutes('2026-09-14', PUBLISHED_HOURS)
    )
    expect(grouped.lunch).toEqual([])
    expect(grouped.evening.map((entry) => entry.slot.time)).toEqual(['16:00', '16:30'])
  })

  it('falls back to 4pm on a day with one sitting', () => {
    expect(resolveEveningStartMinutes('2026-09-19', PUBLISHED_HOURS)).toBe(16 * 60) // Saturday
    expect(resolveEveningStartMinutes('2026-09-20', PUBLISHED_HOURS)).toBe(16 * 60) // Sunday
  })

  it('follows a special-hours date that moves dinner', () => {
    const hours: PublishedHours = {
      ...PUBLISHED_HOURS,
      specialHours: [
        {
          date: '2026-09-15',
          opens: '12:00:00',
          closes: '22:00:00',
          kitchen: { opens: '12:00:00', closes: '21:00:00' },
          is_closed: false,
          is_kitchen_closed: false,
          schedule_config: [
            { starts_at: '12:00', ends_at: '14:30' },
            { starts_at: '17:30', ends_at: '21:00' }
          ]
        }
      ]
    }

    expect(resolveEveningStartMinutes('2026-09-15', hours)).toBe(17 * 60 + 30)
    // The next Tuesday has no override and keeps its regular sittings.
    expect(resolveEveningStartMinutes('2026-09-22', hours)).toBe(16 * 60)
  })

  it('falls back to 4pm on a special-hours date with the kitchen closed', () => {
    const hours: PublishedHours = {
      ...PUBLISHED_HOURS,
      specialHours: [
        { date: '2026-09-16', opens: '12:00:00', closes: '22:00:00', kitchen: null, is_closed: false, is_kitchen_closed: true }
      ]
    }

    expect(resolveEveningStartMinutes('2026-09-16', hours)).toBe(16 * 60)
  })

  it('reads the weekly schedule in force on the date, not this week’s', () => {
    const hours: PublishedHours = {
      ...PUBLISHED_HOURS,
      upcomingVersions: [
        {
          effectiveFrom: '2026-10-01',
          hours: {
            ...PUBLISHED_HOURS.regularHours,
            thursday: {
              ...WEEKDAY_SITTINGS,
              schedule_config: [
                { starts_at: '12:00', ends_at: '15:00' },
                { starts_at: '17:00', ends_at: '21:00' }
              ]
            }
          }
        }
      ]
    }

    expect(resolveEveningStartMinutes('2026-09-24', hours)).toBe(16 * 60) // before the change
    expect(resolveEveningStartMinutes('2026-10-01', hours)).toBe(17 * 60) // Thursday it starts
  })

  it('falls back to 4pm while hours are loading or the date is not a date', () => {
    expect(resolveEveningStartMinutes('2026-09-15', null)).toBe(16 * 60)
    expect(resolveEveningStartMinutes('', PUBLISHED_HOURS)).toBe(16 * 60)
  })
})

describe('highChairFlagLabel', () => {
  it('gets the plural right', () => {
    expect(highChairFlagLabel(1)).toBe('1 high chair free')
    expect(highChairFlagLabel(2)).toBe('2 high chairs free')
  })
})
