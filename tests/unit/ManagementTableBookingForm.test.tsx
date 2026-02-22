import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'

jest.mock('@/lib/gtm-events', () => ({
  trackTableBookingClick: jest.fn()
}))

describe('ManagementTableBookingForm', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('filters Mother’s Day events out of booking-context suggestions', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/events?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                events: [
                  {
                    id: 'evt-md',
                    slug: 'mothers-day-lunch',
                    name: "Mother's Day Lunch",
                    startDate: '2026-03-15T13:00:00+00:00',
                    eventStatus: 'EventScheduled'
                  },
                  {
                    id: 'evt-quiz',
                    slug: 'quiz-night',
                    name: 'Quiz Night',
                    startDate: '2026-03-15T20:00:00+00:00',
                    eventStatus: 'EventScheduled'
                  }
                ]
              }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    render(<ManagementTableBookingForm prefill={{ date: '2026-03-15', purpose: 'drinks' }} />)

    await waitFor(() => expect(screen.getByText('Quiz Night')).toBeInTheDocument())
    expect(screen.queryByText("Mother's Day Lunch")).not.toBeInTheDocument()
  })

  it('shows Mother’s Day context when selecting Sunday, March 15, 2026 for food from /book-table', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/events?')) {
        return Promise.resolve(
          new Response(JSON.stringify({ success: true, data: { events: [] } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    render(<ManagementTableBookingForm />)

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-15' } })

    await waitFor(() =>
      expect(
        screen.getByText(
          'Mother’s Day Sunday Lunch is fixed to Sunday, 15 March 2026. Choose party size and preferred time, then continue.'
        )
      ).toBeInTheDocument()
    )
    expect(screen.queryByLabelText('Date')).not.toBeInTheDocument()
  })

  it('requires Mother’s Day pre-order selections and submits menu_selections when complete', async () => {
    let submittedPayload: Record<string, unknown> | null = null

    ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/events?')) {
        return Promise.resolve(
          new Response(JSON.stringify({ success: true, data: { events: [] } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        )
      }

      if (url.startsWith('/api/table-bookings/availability?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                date: '2026-03-15',
                available: true,
                time_slots: [
                  {
                    time: '13:00',
                    available: true,
                    available_capacity: 10
                  }
                ]
              }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      if (url.startsWith('/api/customers/lookup?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                known: false,
                lookup_degraded: false
              }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      if (url.startsWith('/api/table-bookings/menu/sunday-lunch?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                mains: [
                  {
                    id: 'dish-1',
                    name: 'Roast Beef',
                    price: 19.99,
                    is_available: true
                  }
                ]
              }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      if (url === '/api/table-bookings') {
        submittedPayload = JSON.parse(String(init?.body || '{}'))
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                state: 'confirmed',
                table_booking_id: 'tb-123',
                booking_reference: 'TB-123',
                reason: null,
                blocked_reason: null,
                next_step_url: null,
                hold_expires_at: null,
                table_name: 'A1'
              }
            }),
            {
              status: 201,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    render(<ManagementTableBookingForm prefill={{ mothersDay: true }} />)

    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '1pm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Guest' } })

    await waitFor(() => expect(screen.getAllByRole('combobox')).toHaveLength(4))

    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))
    expect(await screen.findByText('Please select a Sunday lunch main for each guest.')).toBeInTheDocument()
    expect(screen.queryByText('Review your booking')).not.toBeInTheDocument()

    const menuSelects = screen.getAllByRole('combobox')
    for (const select of menuSelects) {
      fireEvent.change(select, { target: { value: 'dish-1' } })
    }

    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))
    await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm booking' }))

    await waitFor(() => expect(submittedPayload).not.toBeNull())
    expect(submittedPayload?.sunday_lunch).toBe(true)
    expect(submittedPayload?.purpose).toBe('food')
    expect(Array.isArray(submittedPayload?.menu_selections)).toBe(true)
    expect((submittedPayload?.menu_selections as Array<unknown>).length).toBe(4)
  })
})
