import { resolveServiceRanges } from '@/lib/table-booking-service-windows'
import type { BusinessHours } from '@/lib/api'

// Minimal BusinessHours shape required by resolveServiceRanges
function makeHours(overrides: Partial<BusinessHours> = {}): BusinessHours {
  return {
    regularHours: {
      sunday: {
        is_closed: false,
        opens: '12:00',
        closes: '22:00',
        is_kitchen_closed: false,
        kitchen: { opens: '13:00', closes: '18:00' },
        schedule_config: []
      }
    },
    specialHours: [],
    ...overrides
  } as unknown as BusinessHours
}

describe('resolveServiceRanges — sunday_lunch', () => {
  const DATE = '2026-03-22' // A Sunday

  it('returns slots when schedule_config has a sunday_lunch entry', () => {
    const hours = makeHours({
      specialHours: [
        {
          date: DATE,
          is_closed: false,
          is_kitchen_closed: false,
          kitchen: { opens: '13:00', closes: '18:00' },
          schedule_config: [
            { booking_type: 'sunday_lunch', starts_at: '12:00', ends_at: '16:00', capacity: 30 }
          ]
        }
      ] as any
    })
    const result = resolveServiceRanges(hours, DATE, { bookingType: 'sunday_lunch', purpose: 'food' })
    expect(result.closed).toBe(false)
    expect(result.ranges.length).toBeGreaterThan(0)
    expect(result.ranges[0].startsAt).toBe('12:00')
  })

  it('returns unavailable when schedule_config is empty — even when kitchen is open', () => {
    // This is the exact scenario from the March 2026 live bug:
    // Special hours record has is_kitchen_closed: false, kitchen present, but schedule_config: []
    const hours = makeHours({
      specialHours: [
        {
          date: DATE,
          is_closed: false,
          is_kitchen_closed: false,
          kitchen: { opens: '13:00', closes: '18:00' },
          schedule_config: []
        }
      ] as any
    })
    const result = resolveServiceRanges(hours, DATE, { bookingType: 'sunday_lunch', purpose: 'food' })
    expect(result.closed).toBe(false)
    expect(result.ranges).toHaveLength(0)
    expect(result.message).toMatch(/unavailable/i)
  })

  it('returns unavailable when is_kitchen_closed is true', () => {
    const hours = makeHours({
      specialHours: [
        {
          date: DATE,
          is_closed: false,
          is_kitchen_closed: true,
          kitchen: { opens: '13:00', closes: '18:00' },
          schedule_config: [
            { booking_type: 'sunday_lunch', starts_at: '12:00', ends_at: '16:00', capacity: 30 }
          ]
        }
      ] as any
    })
    const result = resolveServiceRanges(hours, DATE, { bookingType: 'sunday_lunch', purpose: 'food' })
    expect(result.ranges).toHaveLength(0)
    expect(result.message).toMatch(/unavailable/i)
  })

  it('returns unavailable when kitchen is null (deliberate closure signal)', () => {
    const hours = makeHours({
      specialHours: [
        {
          date: DATE,
          is_closed: false,
          is_kitchen_closed: false,
          kitchen: null,
          schedule_config: [
            { booking_type: 'sunday_lunch', starts_at: '12:00', ends_at: '16:00', capacity: 30 }
          ]
        }
      ] as any
    })
    const result = resolveServiceRanges(hours, DATE, { bookingType: 'sunday_lunch', purpose: 'food' })
    expect(result.ranges).toHaveLength(0)
    expect(result.message).toMatch(/unavailable/i)
  })

  it('returns unavailable when no special day exists and regular sunday has no schedule_config entries', () => {
    const hours = makeHours() // regular sunday has schedule_config: []
    const result = resolveServiceRanges(hours, DATE, { bookingType: 'sunday_lunch', purpose: 'food' })
    expect(result.ranges).toHaveLength(0)
    expect(result.message).toMatch(/unavailable/i)
  })
})
