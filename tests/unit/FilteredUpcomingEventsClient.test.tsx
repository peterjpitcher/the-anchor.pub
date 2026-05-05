import { fireEvent, render, screen } from '@testing-library/react'
import { FilteredUpcomingEventsClient } from '@/components/FilteredUpcomingEventsClient'
import { trackEventBookClick } from '@/lib/gtm-events'
import type { DisplayEvent } from '@/types/display-event'

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookClick: jest.fn()
}))

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: false })
}))

function makeEvent(overrides: Partial<DisplayEvent> = {}): DisplayEvent {
  return {
    '@type': 'Event',
    id: 'event_123',
    slug: 'music-bingo',
    name: 'Music Bingo',
    description: 'Song clips, prizes and a pub night out.',
    shortDescription: 'Song clips, prizes and a pub night out.',
    startDate: '2030-05-08T20:00:00+01:00',
    eventStatus: 'EventScheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    payment_mode: 'cash_only',
    price_per_seat: 3,
    seats_remaining: 8,
    offers: {
      '@type': 'Offer',
      price: '3',
      priceCurrency: 'GBP',
      availability: 'InStock',
      validFrom: '2030-01-01T00:00:00Z'
    },
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    },
    ...overrides
  }
}

describe('FilteredUpcomingEventsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('links reserve CTAs to the event-specific booking section', () => {
    render(<FilteredUpcomingEventsClient events={[makeEvent()]} />)

    expect(screen.getAllByText('No payment now, pay £3 on arrival')).toHaveLength(2)
    expect(screen.getAllByText('Only 8 seats left')).toHaveLength(2)

    const reserveLinks = screen.getAllByRole('link', { name: /reserve for music bingo/i })
    expect(reserveLinks).toHaveLength(2)
    for (const link of reserveLinks) {
      expect(link).toHaveAttribute('href', '/events/music-bingo#event-booking')
    }

    fireEvent.click(reserveLinks[0])

    expect(trackEventBookClick).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'event_123',
        eventName: 'Music Bingo',
        source: 'whats_on_event_card_mobile',
        ctaLabel: 'Reserve'
      })
    )
  })

  it('does not show a reserve link for sold-out events', () => {
    render(
      <FilteredUpcomingEventsClient
        events={[
          makeEvent({
            seats_remaining: 0,
            is_full: true,
            offers: {
              '@type': 'Offer',
              price: '3',
              priceCurrency: 'GBP',
              availability: 'https://schema.org/SoldOut',
              validFrom: '2030-01-01T00:00:00Z'
            }
          })
        ]}
      />
    )

    expect(screen.getAllByRole('button', { name: 'Sold out' })).toHaveLength(2)
    expect(screen.queryByRole('link', { name: /reserve for music bingo/i })).not.toBeInTheDocument()
  })
})
