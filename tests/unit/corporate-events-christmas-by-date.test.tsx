/**
 * /corporate-events stops quoting the Christmas window once Christmas bookings
 * have closed (site review P13, DT-004).
 *
 * It was the one page that printed formatChristmasWindowLabel() with no season
 * check, so from 21 December it would have kept saying "Festive service runs
 * 10 November to 20 December 2026" with a "See Christmas Booking Dates" button.
 *
 * The last bookable date is 19 December (24 hours' notice before the 20th).
 * Instants are in UTC; these dates are in GMT, so they mean the same under
 * `npm test` and `npm run test:utc`.
 */

import { render, cleanup } from '@testing-library/react'
import CorporateEventsPage from '@/app/corporate-events/page'
import { CHRISTMAS_LAST_BOOKABLE_DATE, formatChristmasWindowLabel } from '@/lib/christmas-season'

jest.mock('next/navigation', () => ({
  usePathname: () => '/corporate-events'
}))

// The enquiry form and estimator fetch on mount. They are not what this tests.
jest.mock('@/components/PrivateBookingSection', () => ({
  PrivateBookingSection: () => null
}))

function at(instant: string): string {
  jest.useFakeTimers().setSystemTime(new Date(instant))
  const { container } = render(<CorporateEventsPage />)
  // innerHTML includes the FAQPage structured data.
  const html = container.innerHTML
  cleanup()
  return html
}

afterEach(() => {
  jest.useRealTimers()
})

describe('/corporate-events and the Christmas window', () => {
  it('assumes the last bookable date this test pins the clock around', () => {
    expect(CHRISTMAS_LAST_BOOKABLE_DATE).toBe('2026-12-19')
  })

  it.each(['2026-10-08T12:00:00Z', '2026-12-19T23:59:00Z'])('quotes the window while a date can still be booked, at %s', (instant) => {
    const html = at(instant)
    expect(html).toContain(`Festive service runs ${formatChristmasWindowLabel()}`)
    expect(html).toContain('See Christmas Booking Dates')
    expect(html).not.toContain('Christmas sittings have finished')
  })

  it.each(['2026-12-20T00:00:00Z', '2026-12-21T12:00:00Z', '2027-02-01T12:00:00Z'])(
    'drops the window, the dated answer and the button once bookings have closed, at %s',
    (instant) => {
      const html = at(instant)
      expect(html).not.toContain(formatChristmasWindowLabel())
      expect(html).not.toContain('10 November')
      expect(html).not.toContain('See Christmas Booking Dates')
      expect(html).not.toContain('How Christmas bookings work')
      expect(html).toContain("This year's Christmas sittings have finished.")
    }
  )

  it('promises nothing about next year beyond "once they\'re confirmed"', () => {
    const html = at('2026-12-21T12:00:00Z')
    expect(html).not.toMatch(/\b2027\b/)
    expect(html).toContain("once they're confirmed")
  })
})
