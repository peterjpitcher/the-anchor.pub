import { isEventBookingClosed } from '@/lib/event-lifecycle'

const ev = (cutoff: string | null) => ({ booking_cutoff_at: cutoff }) as const

describe('isEventBookingClosed', () => {
  it('is false when no cutoff is set', () => {
    expect(isEventBookingClosed(ev(null))).toBe(false)
    expect(isEventBookingClosed({})).toBe(false)
  })

  it('is false when the cutoff is in the future', () => {
    expect(isEventBookingClosed(ev(new Date(Date.now() + 3_600_000).toISOString()))).toBe(false)
  })

  it('is true when the cutoff is in the past', () => {
    expect(isEventBookingClosed(ev(new Date(Date.now() - 3_600_000).toISOString()))).toBe(true)
  })

  it('is false when the cutoff is not a valid date', () => {
    expect(isEventBookingClosed(ev('not-a-date'))).toBe(false)
  })
})
