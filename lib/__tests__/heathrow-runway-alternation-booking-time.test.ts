export {}

// The plane-spotting pages are the biggest audience on the site, roughly 227
// users in 28 days, and they converted nothing measurable. Part of that was
// instrumentation (the prompt's events never reached GA4), and part was that a
// reader who clicked through landed on an empty booking form and had to work
// out for themselves when the aircraft would be overhead.

import {
  getPlaneSpottingBookingTime,
  getPlaneSpottingWindowForDate,
} from '@/lib/heathrow-runway-alternation'

describe('the booking time offered to a plane spotter', () => {
  it('offers the start of the window on a from_3pm week', () => {
    expect(getPlaneSpottingBookingTime('from_3pm')).toBe('15:00')
  })

  it('offers a time inside the window on an until_3pm week', () => {
    // Deliberately not 14:59: the reader needs time to sit down and order
    // before the window closes.
    expect(getPlaneSpottingBookingTime('until_3pm')).toBe('13:00')
  })

  it('offers nothing when the window is unknown, rather than inventing a time', () => {
    expect(getPlaneSpottingBookingTime('unknown')).toBeUndefined()
  })

  it('returns a time the booking form can parse for every real week', () => {
    // Walk a fortnight so both alternation phases are covered.
    for (let day = 0; day < 14; day++) {
      const date = new Date(Date.UTC(2026, 8, 1 + day))
      const iso = date.toISOString().slice(0, 10)
      const info = getPlaneSpottingWindowForDate(iso)
      const time = getPlaneSpottingBookingTime(info.window)

      expect(time).toBeDefined()
      expect(time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/)
    }
  })
})
