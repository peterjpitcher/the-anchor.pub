/**
 * Estimated gross revenue for a table booking, used as the Meta Purchase value.
 *
 * Table bookings take no payment up front, so we previously forwarded the deposit
 * (almost always £0). Meta received Purchase events worth £0 and therefore had no
 * revenue signal to optimise against, and ROAS could never be computed. The venue
 * values a booked cover at approximately £25, so we forward an estimate derived
 * from party size instead.
 *
 * A deposit, where one is taken, is a prepayment against the same bill — it is not
 * additional revenue — so it is deliberately NOT added on top of this estimate.
 */
export const TABLE_BOOKING_VALUE_PER_COVER_GBP = 25

/**
 * Estimated value of a table booking in GBP. Returns 0 for a missing or
 * non-positive party size so a bad input can never produce a negative or NaN
 * Purchase value on the conversion payload.
 */
export function estimateTableBookingValue(partySize: number | null | undefined): number {
  if (typeof partySize !== 'number' || !Number.isFinite(partySize) || partySize <= 0) {
    return 0
  }
  // Round to pennies so a fractional party size can never emit a long float.
  return Math.round(partySize * TABLE_BOOKING_VALUE_PER_COVER_GBP * 100) / 100
}
