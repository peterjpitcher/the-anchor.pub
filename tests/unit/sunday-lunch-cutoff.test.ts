import { getSundayLunchCutoffDate, hasSundayLunchCutoffPassed, isSundayIsoDate } from '@/lib/sunday-lunch-cutoff'

describe('Sunday Lunch Cutoff', () => {
  it('detects Sundays from ISO dates', () => {
    expect(isSundayIsoDate('2026-03-15')).toBe(true) // Sunday
    expect(isSundayIsoDate('2026-03-14')).toBe(false) // Saturday
    expect(isSundayIsoDate('invalid')).toBe(false)
  })

  it('returns the Saturday before a Sunday', () => {
    expect(getSundayLunchCutoffDate('2026-03-15')).toBe('2026-03-14')
    expect(getSundayLunchCutoffDate('2026-03-14')).toBeNull()
  })

  it('allows bookings up to 1pm Saturday (GMT)', () => {
    const sunday = '2026-03-15'

    expect(hasSundayLunchCutoffPassed(sunday, new Date('2026-03-14T12:59:59.000Z'))).toBe(false)
    expect(hasSundayLunchCutoffPassed(sunday, new Date('2026-03-14T13:00:00.000Z'))).toBe(false)
    expect(hasSundayLunchCutoffPassed(sunday, new Date('2026-03-14T13:00:01.000Z'))).toBe(true)
  })

  it('handles BST correctly (1pm London is 12:00Z)', () => {
    const sunday = '2026-06-07'

    expect(hasSundayLunchCutoffPassed(sunday, new Date('2026-06-06T11:59:59.000Z'))).toBe(false)
    expect(hasSundayLunchCutoffPassed(sunday, new Date('2026-06-06T12:00:00.000Z'))).toBe(false)
    expect(hasSundayLunchCutoffPassed(sunday, new Date('2026-06-06T12:00:01.000Z'))).toBe(true)
  })
})

