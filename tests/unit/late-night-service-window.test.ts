import {
  buildSlotsWithKitchenState,
  isTimeWithinRanges,
  resolveCombinedServiceRanges,
} from '@/lib/table-booking-service-windows'

/**
 * A close at or before the open means the night runs past midnight. Halloween is
 * advertised as "pub open 12pm to midnight", and storing that as a 00:00 close
 * used to produce a day with NO bookable times at all: three separate guards
 * treated the window as negative and discarded it, and because the slot grid is
 * built from the pub window, food disappeared with the drinks.
 */
function hours(closes: string, kitchenCloses = '18:00:00') {
  return {
    regularHours: {
      saturday: {
        opens: '12:00:00',
        closes: '22:00:00',
        kitchen: { opens: '12:00:00', closes: '19:00:00' },
        is_closed: false,
        is_kitchen_closed: false,
        schedule_config: [],
      },
    },
    specialHours: [
      {
        date: '2026-10-31',
        opens: '12:00:00',
        closes,
        kitchen: { opens: '12:00:00', closes: kitchenCloses },
        is_closed: false,
        is_kitchen_closed: false,
        schedule_config: [
          { name: 'food service', starts_at: '12:00', ends_at: '18:00', capacity: 50, booking_type: 'regular' },
        ],
      },
    ],
  } as never
}

function slotsFor(closes: string) {
  const r = resolveCombinedServiceRanges(hours(closes), '2026-10-31', { bookingType: 'regular' })
  return buildSlotsWithKitchenState(r.ranges, r.kitchenRanges, 2, 30)
}

describe('a venue that closes at or after midnight', () => {
  it('offers times when the close is midnight', () => {
    const slots = slotsFor('00:00:00')
    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0].time).toBe('12:00')
    expect(slots[slots.length - 1].time).toBe('23:30')
  })

  it('treats a midnight close the same as 23:59', () => {
    expect(slotsFor('00:00:00').map(s => s.time)).toEqual(slotsFor('23:59:00').map(s => s.time))
  })

  it('still separates food from drinks across the evening', () => {
    const slots = slotsFor('00:00:00')
    const food = slots.filter(s => s.kitchen_open).map(s => s.time)
    const drinks = slots.filter(s => !s.kitchen_open).map(s => s.time)
    expect(food[0]).toBe('12:00')
    expect(food[food.length - 1]).toBe('17:30')
    expect(drinks[0]).toBe('18:00')
    expect(drinks[drinks.length - 1]).toBe('23:30')
  })

  it('carries on past midnight when the close is later still', () => {
    const times = slotsFor('01:00:00').map(s => s.time)
    expect(times).toContain('00:00')
    expect(times).toContain('00:30')
    // Ordered by position in the trading night, not by the clock: the small
    // hours belong at the end of the grid, not before lunch.
    expect(times[0]).toBe('12:00')
    expect(times[times.length - 1]).toBe('00:30')
  })

  it('counts a late hour as inside the pub window', () => {
    const { ranges } = resolveCombinedServiceRanges(hours('00:00:00'), '2026-10-31', { bookingType: 'regular' })
    expect(isTimeWithinRanges('23:30', ranges)).toBe(true)
    expect(isTimeWithinRanges('11:00', ranges)).toBe(false)
  })

  it('leaves an ordinary evening exactly as it was', () => {
    const times = slotsFor('22:00:00').map(s => s.time)
    expect(times[0]).toBe('12:00')
    expect(times[times.length - 1]).toBe('21:30')
    expect(times).toHaveLength(20)
  })

  it('still rejects a window of zero length', () => {
    expect(slotsFor('12:00:00')).toHaveLength(0)
  })
})
