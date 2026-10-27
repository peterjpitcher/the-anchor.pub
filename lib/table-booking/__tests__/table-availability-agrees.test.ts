import { BLOCKED_REASON_COPY } from '@/lib/table-booking/submission'
import { normalizeAvailabilityResponse, normalizeDepositQuote } from '@/lib/table-booking/availability'

// Release 24 of the customer bookings review of 24 October 2026 (BK-144, BK-186).

describe('BK-144: a refusal for drinks or outside tables says what happened', () => {
  it('has its own words for drinks_full and outside_full, with the phone number', () => {
    expect(BLOCKED_REASON_COPY.drinks_full).toBe(
      "We've got lots of guests arriving for drinks around then. Please try a slightly earlier or later time, or give us a ring on 01753 682707."
    )
    expect(BLOCKED_REASON_COPY.outside_full).toBe(
      'Our outside tables are all taken at that time. Please try another time or a table inside, or give us a ring on 01753 682707.'
    )
    expect(BLOCKED_REASON_COPY.drinks_full).not.toBe(BLOCKED_REASON_COPY.blocked)
  })
})

describe("BK-186: the browser keeps AMS's deposit quote with the reading", () => {
  it('keeps a well-formed quote', () => {
    expect(normalizeDepositQuote({ party_size: 15, required: true, amount: 150, rule: 'group', reason: null })).toEqual({
      required: true,
      amount: 150,
      rule: 'group'
    })
  })

  it('drops anything malformed, so a bad answer never prices a booking', () => {
    expect(normalizeDepositQuote(null)).toBeNull()
    expect(normalizeDepositQuote({ required: 'yes', amount: 150 })).toBeNull()
    expect(normalizeDepositQuote({ required: true, amount: '150' })).toBeNull()
    expect(normalizeDepositQuote({ required: true, amount: -1 })).toBeNull()
  })

  it('reads it from the availability answer, and null when an older answer has none', () => {
    expect(normalizeAvailabilityResponse({ success: true, data: { date: '2026-11-07', time_slots: [], deposit: { required: true, amount: 160, rule: 'group' } } }).deposit)
      .toEqual({ required: true, amount: 160, rule: 'group' })
    expect(normalizeAvailabilityResponse({ success: true, data: { date: '2026-11-07', time_slots: [] } }).deposit).toBeNull()
  })
})
