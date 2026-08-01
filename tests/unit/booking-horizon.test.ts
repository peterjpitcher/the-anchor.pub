import {
  BOOKING_HORIZON_MESSAGE,
  BOOKING_HORIZON_MONTHS,
  isBeyondBookingHorizon,
  maxBookingIsoDate
} from '@/lib/table-booking/horizon'

describe('booking horizon (owner decision 4: twelve months)', () => {
  it('is twelve months', () => {
    expect(BOOKING_HORIZON_MONTHS).toBe(12)
  })

  it('puts the last bookable date exactly one year out', () => {
    expect(maxBookingIsoDate('2026-07-06')).toBe('2027-07-06')
    expect(maxBookingIsoDate('2026-12-31')).toBe('2027-12-31')
    expect(maxBookingIsoDate('2026-01-01')).toBe('2027-01-01')
  })

  it('pulls 29 February back to the 28th rather than spilling into March', () => {
    // 2028 is a leap year, 2029 is not. Rolling over to 1 March would quietly
    // hand out a day beyond the cap.
    expect(maxBookingIsoDate('2028-02-29')).toBe('2029-02-28')
  })

  it('leaves the input unbounded rather than bounding it to nonsense', () => {
    expect(maxBookingIsoDate('')).toBe('')
    expect(maxBookingIsoDate('next tuesday')).toBe('')
  })

  it('allows the last day inside the horizon and refuses the first day past it', () => {
    expect(isBeyondBookingHorizon('2027-07-06', '2026-07-06')).toBe(false)
    expect(isBeyondBookingHorizon('2027-07-07', '2026-07-06')).toBe(true)
  })

  it('says nothing about today, past dates, or a malformed value', () => {
    // Those are somebody else's rules; a bad format has its own, clearer error.
    expect(isBeyondBookingHorizon('2026-07-06', '2026-07-06')).toBe(false)
    expect(isBeyondBookingHorizon('2020-01-01', '2026-07-06')).toBe(false)
    expect(isBeyondBookingHorizon('06/07/2026', '2026-07-06')).toBe(false)
    expect(isBeyondBookingHorizon('2027-07-07', 'not a date')).toBe(false)
  })

  it('tells the guest what to do instead, in the house punctuation', () => {
    expect(BOOKING_HORIZON_MESSAGE).toContain('12 months')
    expect(BOOKING_HORIZON_MESSAGE).toContain('01753 682707')
    // U+2014 is banned house-wide in guest copy.
    expect(BOOKING_HORIZON_MESSAGE).not.toContain(String.fromCharCode(0x2014))
  })
})
