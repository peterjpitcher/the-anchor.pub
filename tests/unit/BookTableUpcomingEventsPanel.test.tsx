import { render, screen, waitFor } from '@testing-library/react'
import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
import { getUpcomingEvents } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  // Keep the real helpers (getEventTicketTypes, hasMultipleTicketPrices, etc.)
  // that the price label depends on; only stub the network fetch.
  ...jest.requireActual('@/lib/api'),
  getUpcomingEvents: jest.fn()
}))

describe('BookTableUpcomingEventsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('hides Mother’s Day events in booking-context upcoming events', async () => {
    ;(getUpcomingEvents as jest.Mock).mockResolvedValue([
      {
        id: 'evt-md',
        slug: 'mothers-day-lunch',
        name: "Mother's Day Lunch",
        startDate: '2027-03-07T13:00:00+00:00'
      },
      {
        id: 'evt-quiz',
        slug: 'quiz-night',
        name: 'Quiz Night',
        // A real UTC instant, as the management API sends it: a 7pm event in May is 18:00Z,
        // because May is BST. This previously read 19:00+00:00 and expected 7pm, which only
        // held while the offset was being stripped instead of applied.
        startDate: '2026-05-06T18:00:00.000Z'
      }
    ])

    render(await BookTableUpcomingEventsPanel())

    await waitFor(() => expect(screen.getByText('Quiz Night')).toBeInTheDocument())
    expect(screen.getByText((content) => content.includes('Wed 6 May') && content.includes('7pm'))).toBeInTheDocument()
    expect(screen.queryByText("Mother's Day Lunch")).not.toBeInTheDocument()
  })
})
