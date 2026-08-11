import { render, screen } from '@testing-library/react'
import RelatedEvents from '@/components/events/RelatedEvents'
import type { Event } from '@/lib/api'
import { getUpcomingEventsByCategory, getUpcomingEvents } from '@/lib/api'

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api')
  return {
    ...actual,
    getUpcomingEventsByCategory: jest.fn(),
    getUpcomingEvents: jest.fn(),
  }
})

const mockByCategory = getUpcomingEventsByCategory as jest.MockedFunction<
  typeof getUpcomingEventsByCategory
>
const mockUpcoming = getUpcomingEvents as jest.MockedFunction<typeof getUpcomingEvents>

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'event_1',
    slug: 'quiz-night',
    name: 'Autumn Kick-Off Quiz Night',
    description: 'A quiz',
    startDate: '2026-09-16T18:00:00Z',
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
        addressCountry: 'GB',
      },
    },
    ...overrides,
  } as Event
}

async function renderRelated(events: Event[]) {
  mockByCategory.mockResolvedValue(events)
  mockUpcoming.mockResolvedValue(events)
  const ui = await RelatedEvents({ currentEventId: 'other', categoryId: 'cat_1' })
  render(ui as React.ReactElement)
}

describe('RelatedEvents date panel', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows a date panel instead of an image when the event has no artwork', async () => {
    await renderRelated([makeEvent()])

    // No image, and no stock photo standing in for one.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    // The square is filled with the date instead, so the tile keeps its height.
    expect(screen.getByText('Wednesday')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
    expect(screen.getByText('September')).toBeInTheDocument()
  })

  it('shows the artwork and no date panel when the event has an image', async () => {
    await renderRelated([makeEvent({ heroImageUrl: 'https://example.com/poster.png' })])

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.queryByText('Wednesday')).not.toBeInTheDocument()
  })

  it('renders the date in London time, not UTC', async () => {
    // 23:30 UTC on 16 September is already the 17th in London during BST.
    await renderRelated([makeEvent({ startDate: '2026-09-16T23:30:00Z' })])

    expect(screen.getByText('17')).toBeInTheDocument()
    expect(screen.getByText('Thursday')).toBeInTheDocument()
  })
})
