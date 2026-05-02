import { render, screen, fireEvent } from '@testing-library/react'
import type { Event } from '@/lib/api'
import { EventBookingButton } from '@/components/EventBookingButton'
import { trackEventBookClick } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookClick: jest.fn()
}))

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'event_123',
    slug: 'test-event',
    name: 'Test Event',
    description: 'Test description',
    startDate: '2025-01-01T19:00:00Z',
    eventStatus: 'EventScheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1 High Street',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    },
    ...overrides
  }
}

describe('EventBookingButton', () => {
  const mockTrackEventBookClick = trackEventBookClick as jest.MockedFunction<
    typeof trackEventBookClick
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('falls back to the internal event page when date parsing fails', () => {
    const event = makeEvent({ startDate: 'invalid-date', bookingUrl: null, offers: undefined })

    render(<EventBookingButton event={event} />)

    const link = screen.getByRole('link', { name: 'Reserve event table for Test Event' })
    expect(link).toHaveAttribute('href', '/events/test-event')
  })

  it('prefers an explicit booking URL and tracks clicks', () => {
    const event = makeEvent({
      bookingUrl: 'https://tickets.example.com/the-anchor/test-event',
      offers: {
        '@type': 'Offer',
        price: '10',
        priceCurrency: 'GBP',
        availability: 'InStock',
        validFrom: '2024-01-01T00:00:00Z'
      }
    })
    const onClick = jest.fn()

    render(<EventBookingButton event={event} onClick={onClick} />)

    const link = screen.getByRole('link', { name: 'Reserve event table for Test Event' })
    expect(link).toHaveAttribute(
      'href',
      'https://tickets.example.com/the-anchor/test-event'
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')

    fireEvent.click(link)

    expect(onClick).toHaveBeenCalled()
    expect(mockTrackEventBookClick).toHaveBeenCalledWith({
      eventId: 'event_123',
      eventName: 'Test Event',
      eventDate: '2025-01-01T19:00:00Z',
      eventPrice: 10,
      source: undefined,
      ctaLabel: 'Reserve event table'
    })
  })

  it('falls back to the offer URL when booking URL is missing', () => {
    const event = makeEvent({
      bookingUrl: null,
      offers: {
        '@type': 'Offer',
        price: '10',
        priceCurrency: 'GBP',
        availability: 'InStock',
        validFrom: '2024-01-01T00:00:00Z',
        url: 'https://tickets.example.com/the-anchor/offer-booking'
      }
    })

    render(<EventBookingButton event={event} />)

    const link = screen.getByRole('link', { name: 'Reserve event table for Test Event' })
    expect(link).toHaveAttribute(
      'href',
      'https://tickets.example.com/the-anchor/offer-booking'
    )
  })

  it('falls back to the internal event page when no booking URL is available', () => {
    const event = makeEvent({
      bookingUrl: null,
      offers: undefined
    })

    render(<EventBookingButton event={event} />)

    const link = screen.getByRole('link', { name: 'Reserve event table for Test Event' })
    expect(link).toHaveAttribute('href', '/events/test-event')
    expect(link).not.toHaveAttribute('target', '_blank')
  })

  it('keeps long dynamic event labels wrap-safe', () => {
    const event = makeEvent({
      name: 'Quiz Night',
      slug: 'quiz-night',
      bookingUrl: null,
      offers: undefined
    })

    render(<EventBookingButton event={event} />)

    expect(
      screen.getByRole('link', {
        name: 'Reserve a table, pay quiz entry on arrival for Quiz Night'
      })
    ).toHaveClass('min-w-0', 'max-w-full', 'whitespace-normal', 'break-words')
  })

  it('treats event page URLs as non-bookable and falls back to the internal event page', () => {
    const event = makeEvent({
      startDate: 'invalid-date',
      bookingUrl: null,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'GBP',
        availability: 'InStock',
        validFrom: '2024-01-01T00:00:00Z',
        url: 'https://www.the-anchor.pub/events/test-event'
      }
    })

    render(<EventBookingButton event={event} />)

    const link = screen.getByRole('link', { name: 'Free entry, reserve table for Test Event' })
    expect(link).toHaveAttribute('href', '/events/test-event')
  })

  it('forces mothers day events to use the shared table-booking flow', () => {
    const event = makeEvent({
      name: "Mother's Day Sunday Lunch",
      startDate: '2026-03-15T13:00:00+00:00',
      bookingUrl: 'https://thirdparty.example.com/book/mothers-day'
    })

    render(<EventBookingButton event={event} />)

    const link = screen.getByRole('link', { name: /Book Mother/i })
    expect(link.getAttribute('href')).toContain('/book-table?')
    expect(link.getAttribute('href')).toContain('date=2026-03-15')
    expect(link.getAttribute('href')).toContain('purpose=food')
    expect(link.getAttribute('href')).toContain('sunday_lunch=true')
    expect(link.getAttribute('href')).toContain('mothers_day=true')
    expect(link).not.toHaveAttribute('target')
  })
})
