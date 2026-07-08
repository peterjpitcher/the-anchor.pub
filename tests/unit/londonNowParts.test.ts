import { londonNowParts } from '@/lib/table-booking-service-windows'

/**
 * Regression guard for the `hour12: false` / `hourCycle: 'h23'` trap.
 *
 * Some ICU builds (Node 20, older Safari) resolve `hour12: false` to the `h24`
 * hour cycle, where midnight formats as "24" rather than "00". That made
 * `londonNowParts().minutes` return 1470 instead of 30 at 00:30, which clamped
 * the booking form's default Preferred Time to 23:30 for anyone loading the
 * page after midnight.
 *
 * These assertions fail on an h24 runtime unless the formatter pins `hourCycle`.
 */
describe('londonNowParts', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  function freeze(iso: string) {
    jest.useFakeTimers().setSystemTime(new Date(iso))
  }

  it('returns minutes past midnight, not 24*60, during the midnight hour (BST)', () => {
    // 23:30Z on 29 Apr is 00:30 BST on 30 Apr.
    freeze('2026-04-29T23:30:00Z')
    expect(londonNowParts()).toEqual({ isoDate: '2026-04-30', minutes: 30 })
  })

  it('returns minutes past midnight during the midnight hour (GMT)', () => {
    // No BST offset in January, so 00:05Z is 00:05 London.
    freeze('2026-01-15T00:05:00Z')
    expect(londonNowParts()).toEqual({ isoDate: '2026-01-15', minutes: 5 })
  })

  it('applies the BST offset outside the midnight hour', () => {
    // 09:00Z on 6 Jul is 10:00 BST.
    freeze('2026-07-06T09:00:00Z')
    expect(londonNowParts()).toEqual({ isoDate: '2026-07-06', minutes: 10 * 60 })
  })

  it('handles the last minute of the London day', () => {
    // 22:59Z on 6 Jul is 23:59 BST.
    freeze('2026-07-06T22:59:00Z')
    expect(londonNowParts()).toEqual({ isoDate: '2026-07-06', minutes: 23 * 60 + 59 })
  })
})
