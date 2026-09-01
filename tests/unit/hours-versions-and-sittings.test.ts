import {
  getEffectiveDayHours,
  getKitchenWindows,
  resolveRegularHoursForDate
} from '@/lib/hours-utils'

/**
 * Two defects are covered here, both found on 31 August 2026 when the owner's
 * new schedule (open from noon Tuesday to Friday, with a lunch and a dinner
 * sitting) was published in the management app and the site kept advertising
 * the old 4pm opening with one continuous kitchen window.
 *
 * 1. The weekly schedule is effective-dated. `regularHours` is only the version
 *    in force on the date the API resolved, so anything painting a future date
 *    has to consult `upcomingVersions` first.
 * 2. `kitchen` is a flattened span. A day with two sittings arrives as one
 *    12:00-21:00 window even though the kitchen shuts in between, and the
 *    booking availability route already refuses food bookings inside that gap.
 */

const OLD_TUESDAY = {
  opens: '16:00:00',
  closes: '22:00:00',
  kitchen: { opens: '16:00:00', closes: '21:00:00' },
  is_closed: false,
  is_kitchen_closed: false,
  schedule_config: [
    { name: 'food service', starts_at: '16:00', ends_at: '21:00', capacity: 50, booking_type: 'regular' }
  ]
}

const NEW_TUESDAY = {
  opens: '12:00:00',
  closes: '22:00:00',
  kitchen: { opens: '12:00:00', closes: '21:00:00' },
  is_closed: false,
  is_kitchen_closed: false,
  schedule_config: [
    { name: 'Lunch', starts_at: '12:00', ends_at: '15:00', capacity: 50, booking_type: 'regular' },
    { name: 'Dinner', starts_at: '16:00', ends_at: '21:00', capacity: 50, booking_type: 'regular' }
  ]
}

const regularHours = { tuesday: OLD_TUESDAY }

const upcomingVersions = [
  { effectiveFrom: '2026-09-01', label: null, hours: { tuesday: NEW_TUESDAY } }
]

describe('resolveRegularHoursForDate', () => {
  it('keeps the current schedule for dates before the change', () => {
    const resolved = resolveRegularHoursForDate('2026-08-31', regularHours, upcomingVersions)
    expect(resolved.tuesday.opens).toBe('16:00:00')
  })

  it('uses the new schedule from its start date', () => {
    const resolved = resolveRegularHoursForDate('2026-09-01', regularHours, upcomingVersions)
    expect(resolved.tuesday.opens).toBe('12:00:00')
  })

  it('keeps using the new schedule for later dates', () => {
    const resolved = resolveRegularHoursForDate('2027-03-04', regularHours, upcomingVersions)
    expect(resolved.tuesday.opens).toBe('12:00:00')
  })

  it('picks the latest version that has taken effect, not the first', () => {
    const later = {
      effectiveFrom: '2026-10-01',
      label: 'Autumn',
      hours: { tuesday: { ...NEW_TUESDAY, opens: '11:00:00' } }
    }
    // Deliberately out of order, because the API sorts but callers should not
    // have to rely on that.
    const resolved = resolveRegularHoursForDate('2026-10-05', regularHours, [later, ...upcomingVersions])
    expect(resolved.tuesday.opens).toBe('11:00:00')
  })

  it('falls back to the current schedule when no versions are published', () => {
    expect(resolveRegularHoursForDate('2026-09-01', regularHours, []).tuesday.opens).toBe('16:00:00')
    expect(resolveRegularHoursForDate('2026-09-01', regularHours, undefined).tuesday.opens).toBe('16:00:00')
  })
})

describe('getEffectiveDayHours with effective-dated schedules', () => {
  it('reads a future date off the schedule that governs it', () => {
    const effective = getEffectiveDayHours('2026-09-01', regularHours, [], upcomingVersions)
    expect(effective.opens).toBe('12:00:00')
  })

  it('still lets a special-hours entry override the version for its one date', () => {
    const specialHours = [
      {
        date: '2026-09-01',
        opens: '17:00:00',
        closes: '23:00:00',
        kitchen: null,
        is_closed: false,
        is_kitchen_closed: true,
        status: 'modified' as const
      }
    ]

    const effective = getEffectiveDayHours('2026-09-01', regularHours, specialHours, upcomingVersions)
    expect(effective.opens).toBe('17:00:00')
    expect(effective.is_kitchen_closed).toBe(true)
    expect(getKitchenWindows(effective)).toEqual([])
  })
})

describe('getKitchenWindows', () => {
  it('returns both sittings on a split day', () => {
    expect(getKitchenWindows(NEW_TUESDAY)).toEqual([
      { opens: '12:00', closes: '15:00' },
      { opens: '16:00', closes: '21:00' }
    ])
  })

  it('never reports the kitchen open through the gap between sittings', () => {
    const windows = getKitchenWindows(NEW_TUESDAY)
    const coversThreeThirty = windows.some(
      (window) => window.opens <= '15:30' && window.closes > '15:30'
    )
    expect(coversThreeThirty).toBe(false)
  })

  it('merges sittings that run straight into each other', () => {
    const continuous = {
      ...NEW_TUESDAY,
      schedule_config: [
        { name: 'Lunch', starts_at: '12:00', ends_at: '15:00', capacity: 50, booking_type: 'regular' },
        { name: 'Dinner', starts_at: '15:00', ends_at: '21:00', capacity: 50, booking_type: 'regular' }
      ]
    }
    expect(getKitchenWindows(continuous)).toEqual([{ opens: '12:00', closes: '21:00' }])
  })

  it('falls back to the flattened window when a day lists no sittings', () => {
    const saturday = {
      opens: '12:00:00',
      closes: '22:00:00',
      kitchen: { opens: '12:00:00', closes: '19:00:00' },
      is_closed: false,
      is_kitchen_closed: false,
      schedule_config: []
    }
    expect(getKitchenWindows(saturday)).toEqual([{ opens: '12:00:00', closes: '19:00:00' }])
  })

  it('reports nothing when the kitchen is shut', () => {
    const monday = {
      opens: '16:00:00',
      closes: '22:00:00',
      kitchen: null,
      is_closed: false,
      is_kitchen_closed: true,
      schedule_config: []
    }
    expect(getKitchenWindows(monday)).toEqual([])
  })

  it('reports nothing when the venue is shut all day', () => {
    const closed = {
      opens: null,
      closes: null,
      kitchen: { opens: '12:00:00', closes: '19:00:00' },
      is_closed: true,
      schedule_config: []
    }
    expect(getKitchenWindows(closed)).toEqual([])
  })

  it('ignores malformed sitting times rather than inventing a window', () => {
    const broken = {
      ...NEW_TUESDAY,
      schedule_config: [
        { name: 'Lunch', starts_at: '', ends_at: '', capacity: 50, booking_type: 'regular' },
        { name: 'Dinner', starts_at: '21:00', ends_at: '16:00', capacity: 50, booking_type: 'regular' }
      ]
    }
    // Nothing usable in schedule_config, so the flattened window stands in.
    expect(getKitchenWindows(broken)).toEqual([{ opens: '12:00:00', closes: '21:00:00' }])
  })
})

describe('getKitchenWindows across midnight', () => {
  it('keeps a sitting that ends at midnight instead of discarding it', () => {
    const halloween = {
      opens: '12:00:00',
      closes: '00:00:00',
      kitchen: { opens: '12:00:00', closes: '00:00:00' },
      is_closed: false,
      is_kitchen_closed: false,
      schedule_config: [
        { name: 'Full menu', starts_at: '12:00', ends_at: '18:00', capacity: 50, booking_type: 'regular' },
        { name: 'Pizza only', starts_at: '21:00', ends_at: '00:00', capacity: 50, booking_type: 'regular' }
      ]
    }
    expect(getKitchenWindows(halloween)).toEqual([
      { opens: '12:00', closes: '18:00' },
      { opens: '21:00', closes: '00:00' }
    ])
  })

  it('does not merge a late sitting into an earlier one just because it wraps', () => {
    const day = {
      opens: '12:00:00',
      closes: '00:30:00',
      kitchen: { opens: '12:00:00', closes: '00:30:00' },
      is_closed: false,
      is_kitchen_closed: false,
      schedule_config: [
        { name: 'Late', starts_at: '20:00', ends_at: '00:30', capacity: 50, booking_type: 'regular' },
        { name: 'Early', starts_at: '12:00', ends_at: '15:00', capacity: 50, booking_type: 'regular' }
      ]
    }
    expect(getKitchenWindows(day)).toEqual([
      { opens: '12:00', closes: '15:00' },
      { opens: '20:00', closes: '00:30' }
    ])
  })
})


describe('getKitchenWindows clips services to the kitchen hours', () => {
  /**
   * A `regular` service gates drinks as well as food, so the management app
   * deliberately lets one run past the kitchen close and live special-hours rows
   * already do. The booking engine bounds food by both the kitchen hours and the
   * service windows, so the published hours must intersect them too. Reading the
   * services alone advertised food outside kitchen hours.
   */
  it('truncates a service that overhangs the kitchen close', () => {
    const narrowedKitchen = {
      opens: '12:00:00',
      closes: '22:00:00',
      kitchen: { opens: '13:00:00', closes: '19:00:00' },
      is_closed: false,
      is_kitchen_closed: false,
      schedule_config: [
        { name: 'lunch', starts_at: '12:00', ends_at: '14:30', capacity: 50, booking_type: 'regular' },
        { name: 'dinner', starts_at: '17:00', ends_at: '21:00', capacity: 50, booking_type: 'regular' }
      ]
    }
    expect(getKitchenWindows(narrowedKitchen)).toEqual([
      { opens: '13:00', closes: '14:30' },
      { opens: '17:00', closes: '19:00' }
    ])
  })

  it('drops a service lying entirely outside the kitchen hours', () => {
    const drinksOnly = {
      opens: '12:00:00',
      closes: '23:00:00',
      kitchen: { opens: '13:00:00', closes: '15:00:00' },
      is_closed: false,
      is_kitchen_closed: false,
      schedule_config: [
        { name: 'late drinks', starts_at: '20:00', ends_at: '22:00', capacity: 50, booking_type: 'regular' }
      ]
    }
    expect(getKitchenWindows(drinksOnly)).toEqual([])
  })

  it('treats a missing kitchen window as closed even when a service remains', () => {
    const noKitchen = {
      opens: '12:00:00',
      closes: '22:00:00',
      kitchen: null,
      is_closed: false,
      is_kitchen_closed: false,
      schedule_config: [
        { name: 'dinner', starts_at: '17:00', ends_at: '21:00', capacity: 50, booking_type: 'regular' }
      ]
    }
    expect(getKitchenWindows(noKitchen)).toEqual([])
  })
})
