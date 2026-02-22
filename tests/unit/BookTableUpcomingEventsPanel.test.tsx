import { render, screen, waitFor } from '@testing-library/react'
import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
import { getUpcomingEvents } from '@/lib/api'

jest.mock('@/lib/api', () => ({
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
        startDate: '2026-03-15T13:00:00+00:00'
      },
      {
        id: 'evt-quiz',
        slug: 'quiz-night',
        name: 'Quiz Night',
        startDate: '2026-03-22T20:00:00+00:00'
      }
    ])

    render(await BookTableUpcomingEventsPanel())

    await waitFor(() => expect(screen.getByText('Quiz Night')).toBeInTheDocument())
    expect(screen.queryByText("Mother's Day Lunch")).not.toBeInTheDocument()
  })
})
