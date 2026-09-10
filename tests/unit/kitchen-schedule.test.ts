import {
  buildKitchenSchedule,
  getSharedKitchenWindows,
  nextIsoDateForWeekday,
  type UpcomingHoursVersion
} from '@/lib/hours-utils'
import { getWeekdayServiceTimes } from '@/lib/lunch-and-dinner'

const WEEKDAY = {
  opens: '12:00:00',
  closes: '22:00:00',
  kitchen: { opens: '12:00:00', closes: '21:00:00' },
  is_kitchen_closed: false,
  schedule_config: [
    { name: 'Lunch', starts_at: '12:00', ends_at: '15:00', booking_type: 'regular' },
    { name: 'Dinner', starts_at: '16:00', ends_at: '21:00', booking_type: 'regular' }
  ]
}

// /business/hours as served on 10 September 2026.
const REGULAR_HOURS = {
  monday: { opens: '16:00:00', closes: '22:00:00', kitchen: null, is_kitchen_closed: true },
  tuesday: WEEKDAY,
  wednesday: WEEKDAY,
  thursday: WEEKDAY,
  friday: WEEKDAY,
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
}

// Monday 14 September 2026, 10:00 BST.
const MONDAY_MORNING = new Date('2026-09-14T09:00:00Z')

describe('nextIsoDateForWeekday', () => {
  it('counts today when today is the weekday asked for', () => {
    expect(nextIsoDateForWeekday('monday', MONDAY_MORNING)).toBe('2026-09-14')
    expect(nextIsoDateForWeekday('tuesday', MONDAY_MORNING)).toBe('2026-09-15')
    expect(nextIsoDateForWeekday('sunday', MONDAY_MORNING)).toBe('2026-09-20')
  })

  it('works from the London date, not the server clock, either side of midnight', () => {
    // 23:30 UTC on Tuesday 30 June is already Wednesday 1 July in London (BST).
    const lateUtc = new Date('2026-06-30T23:30:00Z')
    expect(nextIsoDateForWeekday('wednesday', lateUtc)).toBe('2026-07-01')
    expect(nextIsoDateForWeekday('tuesday', lateUtc)).toBe('2026-07-07')
  })

  it('does not slip a day across the October clock change', () => {
    // 00:30 UTC on Sunday 25 October 2026 is 01:30 BST, before the clocks go back.
    const clockChange = new Date('2026-10-25T00:30:00Z')
    expect(nextIsoDateForWeekday('sunday', clockChange)).toBe('2026-10-25')
    expect(nextIsoDateForWeekday('monday', clockChange)).toBe('2026-10-26')
  })
})

describe('buildKitchenSchedule', () => {
  it('reads the week as sittings, grouping Tuesday to Friday when they match', () => {
    expect(buildKitchenSchedule({ regularHours: REGULAR_HOURS }, MONDAY_MORNING)).toBe(
      'Tuesday to Friday 12pm-3pm & 4pm-9pm, Saturday 12pm-7pm, Sunday 1pm-6pm'
    )
  })

  it('lists weekdays one by one when they differ, reading each on its next occurrence', () => {
    // A new schedule from Thursday 17 September moves dinner to 5pm. On Monday
    // 14 September, the coming Tuesday and Wednesday are still on the old one.
    const upcomingVersions: UpcomingHoursVersion[] = [
      {
        effectiveFrom: '2026-09-17',
        hours: {
          ...REGULAR_HOURS,
          thursday: {
            ...WEEKDAY,
            schedule_config: [
              { starts_at: '12:00', ends_at: '15:00' },
              { starts_at: '17:00', ends_at: '21:00' }
            ]
          },
          friday: {
            ...WEEKDAY,
            schedule_config: [
              { starts_at: '12:00', ends_at: '15:00' },
              { starts_at: '17:00', ends_at: '21:00' }
            ]
          }
        }
      }
    ]

    expect(buildKitchenSchedule({ regularHours: REGULAR_HOURS, upcomingVersions }, MONDAY_MORNING)).toBe(
      'Tuesday 12pm-3pm & 4pm-9pm, Wednesday 12pm-3pm & 4pm-9pm, Thursday 12pm-3pm & 5pm-9pm, Friday 12pm-3pm & 5pm-9pm, Saturday 12pm-7pm, Sunday 1pm-6pm'
    )
  })

  it('leaves out a day with no kitchen', () => {
    const hours = { regularHours: { ...REGULAR_HOURS, saturday: { ...REGULAR_HOURS.saturday, kitchen: null, is_kitchen_closed: true } } }
    expect(buildKitchenSchedule(hours, MONDAY_MORNING)).toBe('Tuesday to Friday 12pm-3pm & 4pm-9pm, Sunday 1pm-6pm')
  })
})

describe('getSharedKitchenWindows', () => {
  it('returns the sittings the days share', () => {
    expect(
      getSharedKitchenWindows({ regularHours: REGULAR_HOURS }, ['tuesday', 'friday'], MONDAY_MORNING)
    ).toEqual([
      { opens: '12:00', closes: '15:00' },
      { opens: '16:00', closes: '21:00' }
    ])
  })

  it('returns null when any day has no kitchen, or the days differ', () => {
    const hours = { regularHours: REGULAR_HOURS }
    expect(getSharedKitchenWindows(hours, ['monday', 'tuesday'], MONDAY_MORNING)).toBeNull()
    expect(getSharedKitchenWindows(hours, ['friday', 'saturday'], MONDAY_MORNING)).toBeNull()
    expect(getSharedKitchenWindows(hours, [], MONDAY_MORNING)).toBeNull()
  })
})

describe('getWeekdayServiceTimes', () => {
  it('reads lunch and dinner from the Tuesday to Friday sittings', () => {
    expect(getWeekdayServiceTimes({ regularHours: REGULAR_HOURS }, MONDAY_MORNING)).toEqual({
      lunch: '12pm to 3pm',
      dinner: '4pm to 9pm'
    })
  })

  it('says nothing when a weekday has a single sitting', () => {
    const hours = {
      regularHours: {
        ...REGULAR_HOURS,
        wednesday: { ...WEEKDAY, schedule_config: [{ starts_at: '16:00', ends_at: '21:00' }] }
      }
    }
    expect(getWeekdayServiceTimes(hours, MONDAY_MORNING)).toBeNull()
  })
})
