import { render, screen, fireEvent } from '@testing-library/react'
import type { Event } from '@/lib/api'
import { EventBookingButton } from '@/components/EventBookingButton'
import { trackEventBookingStart } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn()
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
  const mockTrackEventBookingStart = trackEventBookingStart as jest.MockedFunction<
    typeof trackEventBookingStart
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders a disabled button when no booking URL is available and the date is invalid', () => {
    const event = makeEvent({ startDate: 'invalid-date', bookingUrl: null, offers: undefined })

    render(<EventBookingButton event={event} />)

    expect(
      screen.getByRole('button', { name: 'Booking options available closer to the event' })
    ).toBeDisabled()
  })

  it('renders an OpenTable link with event time and tracks clicks', () => {
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

    const link = screen.getByRole('link', { name: 'Book Now for Test Event' })
    expect(link).toHaveAttribute(
      'href',
      'http://www.opentable.com/restaurant/profile/443973/reserve?restref=443973&datetime=2025-01-01T18:30&covers=2&searchdatetime=2025-01-01T18:30&partysize=2'
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')

    fireEvent.click(link)

    expect(onClick).toHaveBeenCalled()
    expect(mockTrackEventBookingStart).toHaveBeenCalledWith({
      eventId: 'event_123',
      eventName: 'Test Event',
      eventPrice: 10
    })
  })

  it('treats event page URLs as non-bookable and shows the unavailable state when date is invalid', () => {
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

    expect(
      screen.getByRole('button', { name: 'Booking options available closer to the event' })
    ).toBeDisabled()
  })
})
