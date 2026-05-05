import { render } from '@testing-library/react'
import { EventPageTracker } from '@/components/tracking/EventPageTracker'
import { trackEventDetailImpression, trackEventView, trackViewItem } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackEventDetailImpression: jest.fn(),
  trackEventView: jest.fn(),
  trackViewItem: jest.fn()
}))

describe('EventPageTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('tracks event detail impressions separately from generic event views', () => {
    render(
      <EventPageTracker
        eventId="event_123"
        eventName="Music Bingo"
        eventDate="2030-05-08T20:00:00+01:00"
        eventCategory="Bingo"
        eventPrice={3}
      />
    )

    expect(trackEventView).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'event_123',
        eventName: 'Music Bingo'
      })
    )
    expect(trackViewItem).toHaveBeenCalledWith({
      category: 'event',
      name: 'Music Bingo',
      id: 'event_123'
    })
    expect(trackEventDetailImpression).toHaveBeenCalledWith({
      eventId: 'event_123',
      eventName: 'Music Bingo',
      eventDate: '2030-05-08T20:00:00+01:00',
      eventCategory: 'Bingo',
      eventPrice: 3,
      source: 'event_detail_page'
    })
  })
})
