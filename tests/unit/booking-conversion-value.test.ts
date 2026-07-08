import {
  TABLE_BOOKING_VALUE_PER_COVER_GBP,
  estimateTableBookingValue,
} from '@/lib/booking-conversion-value'

describe('estimateTableBookingValue', () => {
  it('should value a booking at £25 per cover when party size is positive', () => {
    expect(estimateTableBookingValue(1)).toBe(25)
    expect(estimateTableBookingValue(6)).toBe(150)
    expect(estimateTableBookingValue(10)).toBe(250)
  })

  it('should track the exported per-cover constant', () => {
    expect(TABLE_BOOKING_VALUE_PER_COVER_GBP).toBe(25)
    expect(estimateTableBookingValue(4)).toBe(4 * TABLE_BOOKING_VALUE_PER_COVER_GBP)
  })

  it('should return 0 when party size is missing', () => {
    expect(estimateTableBookingValue(null)).toBe(0)
    expect(estimateTableBookingValue(undefined)).toBe(0)
  })

  it('should return 0 rather than a negative or NaN value for bad input', () => {
    expect(estimateTableBookingValue(0)).toBe(0)
    expect(estimateTableBookingValue(-3)).toBe(0)
    expect(estimateTableBookingValue(Number.NaN)).toBe(0)
    expect(estimateTableBookingValue(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('should round to pennies so a fractional party size cannot emit a long float', () => {
    // 2.5 covers would otherwise be fine, but guard the rounding contract explicitly.
    expect(estimateTableBookingValue(2.5)).toBe(62.5)
    expect(Number.isInteger(estimateTableBookingValue(3) * 100)).toBe(true)
  })
})
