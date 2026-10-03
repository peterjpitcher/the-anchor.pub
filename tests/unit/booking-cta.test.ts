import {
  LUNCH_DINNER_BOOKING_HREF,
  LUNCH_DINNER_BOOKING_SOURCE,
  resolveBookingCta,
  resolveEventBookingCta,
} from '@/lib/booking-cta'

describe('page booking actions', () => {
  test.each([
    ['/sunday-roast', { kind: 'table', label: 'Book a table' }],
    ['/private-hire', { kind: 'link', label: 'Enquire about your date', href: '#enquiry' }],
    ['/private-hire/birthdays', { kind: 'link', label: 'Enquire about your date', href: '/private-hire#enquiry' }],
    ['/events/example', { kind: 'link', label: 'View upcoming dates', href: '/whats-on' }],
    ['/cash-bingo', { kind: 'link', label: 'View upcoming dates', href: '#book' }],
    ['/quiz-night/', { kind: 'link', label: 'View upcoming dates', href: '#book' }],
    ['/music-bingo', { kind: 'link', label: 'View upcoming dates', href: '#book' }],
    ['/karaoke', { kind: 'link', label: 'View upcoming dates', href: '#book' }],
    ['/whats-on', { kind: 'link', label: 'View upcoming dates', href: '#upcoming-events' }],
    ['/whats-on/', { kind: 'link', label: 'View upcoming dates', href: '#upcoming-events' }],
    ['/quiz-night/themed', { kind: 'link', label: 'View themed quiz dates', href: '#themed-dates' }],
    ['/christmas-parties', { kind: 'christmas', label: 'Christmas enquiry' }],
    ['/live-sport/nations-championship', { kind: 'link', label: 'Choose a game', href: '#fixtures' }],
  ])('%s chooses its own journey', (pathname, expected) => {
    expect(resolveBookingCta(pathname)).toEqual(expected)
  })

  // Every game night page carries its own booking form at #book. Karaoke was
  // missing from the route list, so its sticky bar fell through to the generic
  // "Book a table" and sent mobile visitors to /book-table instead of the form
  // 300px below. It is the highest-traffic of the four hubs, so it was the one
  // that leaked. Asserted as a set rather than a row so a fifth game page
  // cannot be added without deciding this.
  test.each(['/quiz-night', '/cash-bingo', '/music-bingo', '/karaoke'])(
    'game night page %s keeps its visitor on the page',
    (pathname) => {
      expect(resolveBookingCta(pathname)).toEqual({
        kind: 'link',
        label: 'View upcoming dates',
        href: '#book',
      })
    }
  )

  // The paid-ads landing page. Its sticky "Book a table" used to open the
  // generic quick-book sheet, whose bookings carried no landing page source.
  test.each(['/lunch-and-dinner', '/lunch-and-dinner/'])(
    '%s sends its sticky Book a table to the same link as the page buttons',
    (pathname) => {
      expect(resolveBookingCta(pathname)).toEqual({
        kind: 'link',
        label: 'Book a table',
        href: '/book-table?source=lunch_dinner_lp#booking-form',
        carryAttribution: true,
      })
    }
  )

  test('the landing page booking link has its query before the fragment and lands on the form', () => {
    expect(LUNCH_DINNER_BOOKING_HREF).toBe('/book-table?source=lunch_dinner_lp#booking-form')

    const target = new URL(LUNCH_DINNER_BOOKING_HREF, 'https://www.the-anchor.pub')
    expect(target.pathname).toBe('/book-table')
    expect(target.searchParams.get('source')).toBe(LUNCH_DINNER_BOOKING_SOURCE)
    expect(target.hash).toBe('#booking-form')
    // The booking form reads any source containing "sunday" as a roast booking.
    expect(LUNCH_DINNER_BOOKING_SOURCE).not.toMatch(/sunday/i)
  })

  test('no other page asks the sticky bar to carry ad tags', () => {
    const others = [
      '/', '/sunday-roast', '/food-menu', '/private-hire', '/private-hire/birthdays', '/events/example',
      '/cash-bingo', '/quiz-night', '/quiz-night/themed', '/music-bingo', '/karaoke', '/whats-on',
      '/christmas-parties', '/live-sport/nations-championship', '/lunch-and-dinner-menu', '/lunch',
    ]
    for (const pathname of others) {
      expect(resolveBookingCta(pathname)).not.toHaveProperty('carryAttribution')
    }
  })

  const now = Date.parse('2026-09-05T12:00:00Z')
  const event = { startDate: '2026-10-01T19:00:00Z', event_status: 'scheduled', eventStatus: 'https://schema.org/EventScheduled', bookings_enabled: true }
  test('open events reach the event form', () => {
    expect(resolveEventBookingCta(event, now)).toEqual({ kind: 'link', label: 'Reserve seats', href: '#event-booking' })
  })
  test.each([
    { event_status: 'cancelled' },
    { event_status: 'sold_out' },
    { total_remaining: 0 },
    { is_full: true },
    { seats_remaining: 0 },
    { offers: { '@type': 'Offer' as const, validFrom: '2026-08-01T12:00:00Z', availability: 'https://schema.org/SoldOut', price: '5', priceCurrency: 'GBP' } },
    { event_status: 'draft' },
    { bookings_enabled: false },
    { startDate: '2026-09-01T19:00:00Z' },
    { booking_cutoff_at: '2026-09-05T11:00:00Z' },
  ])('blocked event %j never offers a reservation', (change) => {
    expect(resolveEventBookingCta({ ...event, ...change }, now)).toEqual({ kind: 'link', label: 'View upcoming dates', href: '/whats-on' })
  })
})
