import { render, screen } from '@testing-library/react'
import type { Event } from '@/lib/api'
import { EventListItem } from '@/components/events/EventListItem'
import { FeaturedEvent } from '@/components/events/FeaturedEvent'
import { getEventImage } from '@/components/events/event-display'

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
    shortDescription: 'A short description.',
    startDate: '2026-09-16T19:00:00Z',
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
  } as Event
}

const POSTER = 'https://example.com/poster.png'

describe('getEventImage', () => {
  it('returns null rather than a stock photo when the event has no artwork', () => {
    expect(getEventImage(makeEvent())).toBeNull()
  })

  it('ignores blank strings in the image array', () => {
    expect(getEventImage(makeEvent({ image: ['', '   '] }))).toBeNull()
  })

  it('returns the artwork when the event has some', () => {
    expect(getEventImage(makeEvent({ heroImageUrl: POSTER }))).toBe(POSTER)
  })
})

describe('EventListItem image slot', () => {
  it('renders no image at all when the event has no artwork', () => {
    render(<EventListItem event={makeEvent()} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // The rest of the row still renders.
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('renders the artwork when the event has some', () => {
    render(<EventListItem event={makeEvent({ heroImageUrl: POSTER })} />)

    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

describe('FeaturedEvent image slot', () => {
  it('renders no image at all when the event has no artwork', () => {
    render(<FeaturedEvent event={makeEvent()} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('renders the artwork when the event has some', () => {
    render(<FeaturedEvent event={makeEvent({ heroImageUrl: POSTER })} />)

    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
