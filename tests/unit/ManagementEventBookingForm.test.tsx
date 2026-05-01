import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn(),
  trackEventBookingComplete: jest.fn()
}))

describe('ManagementEventBookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/customers/lookup')) {
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

      if (url === '/api/event-bookings') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'POLICY_VIOLATION',
                message: 'Sunday lunch only'
              }
            }),
            {
              status: 409,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })
  })

  it('shows event context and party size before mobile lookup', () => {
    render(
      <ManagementEventBookingForm
        event={{
          id: 'evt-quiz',
          name: 'Pub Quiz Night',
          startDate: '2026-05-06T19:00:00+00:00',
          time: '19:00'
        }}
      />
    )

    expect(screen.getByText('Pub Quiz Night')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Wed 6 May') && content.includes('7pm'))).toBeInTheDocument()
    expect(screen.getByLabelText('Number of Seats')).toBeInTheDocument()
    expect(screen.getByText('Want to eat before the event?')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Planning to eat before the event/i })).toBeChecked()
    expect(screen.getByText('This is not a food pre-order. Please order with the bar team on arrival.')).toBeInTheDocument()
    expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument()
  })

  it('displays an inline error message on POLICY_VIOLATION instead of redirecting', async () => {
    render(
      <ManagementEventBookingForm
        event={{
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: "Mother's Day Sunday Lunch",
          startDate: '2026-03-15T13:00:00+00:00',
          time: '13:00'
        }}
      />
    )

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Guest' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book Event' }))

    // Error message from the API should appear inline in the form
    await waitFor(() => expect(screen.getByText('Sunday lunch only')).toBeInTheDocument())
  })

  it('submits event dining intent without collecting pre-order notes', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/customers/lookup')) {
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

      if (url === '/api/event-bookings') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                state: 'confirmed',
                booking_id: 'booking-123',
                reason: null,
                seats_remaining: 12,
                next_step_url: null,
                manage_booking_url: null
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

    render(
      <ManagementEventBookingForm
        event={{
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Music Bingo',
          startDate: '2026-05-08T20:00:00+01:00',
          time: '20:00'
        }}
        foodPrompt="Arrive from 6:30pm for food. Music Bingo starts at 8pm."
      />
    )

    fireEvent.change(screen.getByLabelText('Number of Seats'), { target: { value: '6' } })
    fireEvent.click(screen.getByRole('radio', { name: /Event or drinks only/i }))
    expect(screen.queryByLabelText('Food notes (optional)')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Guest' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book Event' }))

    await waitFor(() => expect(screen.getByText('Your seats are confirmed for Music Bingo.')).toBeInTheDocument())

    const bookingCall = (global.fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/event-bookings')
    expect(bookingCall).toBeDefined()
    const payload = JSON.parse(String((bookingCall?.[1] as RequestInit).body))

    expect(payload.seats).toBe(6)
    expect(payload.notes).toBe('Event dining intent: Event or drinks only')
  })
})
