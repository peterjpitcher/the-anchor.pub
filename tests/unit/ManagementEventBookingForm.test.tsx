import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { trackEventBookingComplete } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn(),
  trackEventBookingComplete: jest.fn(),
  trackEventBookingFunnelStep: jest.fn()
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

  it('shows a compact single-step booking form', () => {
    render(
      <ManagementEventBookingForm
        event={{
          id: 'evt-quiz',
          name: 'Pub Quiz Night',
          startDate: '2026-05-06T19:00:00+00:00',
          time: '19:00',
          price_per_seat: 3,
          seats_remaining: 18
        }}
      />
    )

    expect(screen.getByLabelText('Seats')).toBeInTheDocument()
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(screen.getByLabelText('Mobile number')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Planning to eat before the event/i })).toBeChecked()
    expect(screen.getByText('Not a food pre-order.')).toBeInTheDocument()
    expect(screen.getByText('No payment now. Reserve seats online and pay £3 per person on arrival.')).toBeInTheDocument()
    expect(screen.getByText('18 seats currently available.')).toBeInTheDocument()
    expect(screen.queryByText('How many seats should we hold?')).not.toBeInTheDocument()
    expect(screen.queryByText('Want to eat before the event?')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
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

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))

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
          slug: 'music-bingo',
          startDate: '2026-05-08T20:00:00+01:00',
          time: '20:00',
          price_per_seat: 6,
          category: {
            id: 'cat-bingo',
            name: 'Bingo',
            slug: 'bingo',
            color: '#f2c94c'
          }
        }}
        foodPrompt="Arrive from 6:30pm for food. Music Bingo starts at 8pm."
      />
    )

    fireEvent.change(screen.getByLabelText('Seats'), { target: { value: '6' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /Planning to eat before the event/i }))
    expect(screen.queryByLabelText('Food notes (optional)')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))

    await waitFor(() => expect(screen.getByText('Your seats are confirmed for Music Bingo.')).toBeInTheDocument())

    const bookingCall = (global.fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/event-bookings')
    expect(bookingCall).toBeDefined()
    const payload = JSON.parse(String((bookingCall?.[1] as RequestInit).body))

    expect(payload.seats).toBe(6)
    expect(payload.first_name).toBe('Jane')
    expect(payload.last_name).toBe('Guest')
    expect(payload.notes).toBe('Event dining intent: Event or drinks only')
    expect(payload.food_intent).toBe('event_only')
    expect(payload.event_slug).toBe('music-bingo')
    expect(payload.event_name).toBe('Music Bingo')
    expect(payload.event_category_name).toBe('Bingo')
    expect(payload.event_price).toBe(6)
    expect(payload.event_value).toBe(36)
    expect(trackEventBookingComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        eventName: 'Music Bingo',
        eventSlug: 'music-bingo',
        eventCategoryName: 'Bingo',
        eventCategorySlug: 'bingo',
        eventDate: '2026-05-08T20:00:00+01:00',
        tickets: 6,
        totalValue: 36,
        foodIntent: 'event_only',
        bookingId: 'booking-123'
      })
    )
  })

  it('sends first and last name directly when joining the waitlist', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url === '/api/event-bookings') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                state: 'full_with_waitlist_option',
                booking_id: null,
                reason: 'sold_out',
                seats_remaining: 0,
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

      if (url === '/api/event-waitlist') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                queued: true,
                state: 'queued',
                waitlist_entry_id: 'waitlist-123',
                reason: null,
                seats_remaining: 0
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
          slug: 'music-bingo',
          startDate: '2026-05-08T20:00:00+01:00',
          time: '20:00',
          price_per_seat: 6
        }}
      />
    )

    fireEvent.change(screen.getByLabelText('Seats'), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Join Waitlist' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Join Waitlist' }))

    await waitFor(() => expect(screen.getByText('You’re on the waitlist. We’ll text you if seats open up.')).toBeInTheDocument())

    const waitlistCall = (global.fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/event-waitlist')
    expect(waitlistCall).toBeDefined()
    const payload = JSON.parse(String((waitlistCall?.[1] as RequestInit).body))

    expect(payload.first_name).toBe('Jane')
    expect(payload.last_name).toBe('Guest')
    expect(payload.requested_seats).toBe(4)
  })
})
