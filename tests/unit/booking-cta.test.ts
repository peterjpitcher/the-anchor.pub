import { resolveBookingCta, resolveEventBookingCta } from '@/lib/booking-cta'

describe('page booking actions', () => {
  test.each([
    ['/sunday-roast', { kind: 'table', label: 'Book a table' }],
    ['/private-hire', { kind: 'link', label: 'Enquire about your date', href: '#enquiry' }],
    ['/private-hire/birthdays', { kind: 'link', label: 'Enquire about your date', href: '/private-hire#enquiry' }],
    ['/events/example', { kind: 'link', label: 'View upcoming dates', href: '/whats-on' }],
    ['/cash-bingo', { kind: 'link', label: 'View upcoming dates', href: '#book' }],
    ['/quiz-night/', { kind: 'link', label: 'View upcoming dates', href: '#book' }],
    ['/music-bingo', { kind: 'link', label: 'View upcoming dates', href: '#book' }],
    ['/christmas-parties', { kind: 'christmas', label: 'Christmas enquiry' }],
    ['/live-sport/nations-championship', { kind: 'link', label: 'Choose a game', href: '#fixtures' }],
  ])('%s chooses its own journey', (pathname, expected) => {
    expect(resolveBookingCta(pathname)).toEqual(expected)
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
