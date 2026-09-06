import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { GUEST_COMMS_CONSENT_TEXT_VERSION } from '@/lib/communication-consent'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { trackEventBookingComplete } from '@/lib/gtm-events'
import {
  captureBookingAttributionFromLocation,
  clearBookingAttributionForTest,
} from '@/lib/booking-attribution'

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn(),
  trackEventBookingComplete: jest.fn(),
  trackEventBookingFunnelStep: jest.fn()
}))

const TEST_TURNSTILE_SITE_KEY = 'test-turnstile-site-key'

const mockTurnstileReset = jest.fn()

/** Last props Cloudflare's widget was rendered with, so a test can drive it. */
const mockTurnstileProps: { current: any } = { current: null }

/**
 * Stands in for Cloudflare's widget.
 *
 * It renders a placeholder and fires nothing of its own accord, which is exactly
 * what a blocked, proxied or never-loaded widget does in the wild. It also loads
 * no script and opens no connection, so nothing in this file can reach the live
 * management API.
 */
jest.mock('@marsidev/react-turnstile', () => {
  const React = require('react')

  return {
    Turnstile: React.forwardRef(function MockTurnstile(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({ reset: mockTurnstileReset }))
      mockTurnstileProps.current = props
      return <div data-testid="turnstile-widget" />
    })
  }
})

/** PayPal's SDK fetches a remote script, so it is replaced with inert markup. */
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: (props: any) => <div data-testid="paypal-provider">{props.children}</div>,
  PayPalButtons: () => <div data-testid="paypal-buttons" />
}))

/**
 * Attribution capture time, held five days back from whenever the suite runs.
 *
 * This was previously the literal '2026-05-08T18:30:00.000Z'. Attribution has a
 * 90 day TTL (ATTRIBUTION_TTL_DAYS in lib/booking-attribution.ts), so on
 * 2026-08-06 that fixture aged out and the test started failing: the UTM fields
 * were dropped on read and utm_source came back undefined. Keeping the fixture
 * relative to now means the test exercises live attribution forever, instead of
 * silently becoming an expiry test and then a failure.
 */
const CAPTURED_AT = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)

describe('ManagementEventBookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearBookingAttributionForTest()
    window.localStorage.clear()

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

  afterEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
  })

  it.each([true, false])('books without food or early-arrival requests regardless of legacy response flag %s', async (recorded) => {
    const previousFetch = global.fetch
    const sent: Record<string, unknown>[] = []
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (input === '/api/event-bookings') {
        sent.push(JSON.parse(String(init?.body)))
        return new Response(JSON.stringify({ success: true, data: { state: 'confirmed', booking_id: 'booking-fixture', requests_recorded: recorded } }), { status: 201 })
      }
      return previousFetch(input, init)
    })
    render(<ManagementEventBookingForm event={{ id: 'event-fixture', name: 'Test event', startDate: '2999-01-01T19:00:00Z', payment_mode: 'free' }} />)
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    expect(screen.queryByLabelText('Would you like to discuss food?')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('I would like to discuss arriving early')).not.toBeInTheDocument()
    expect(screen.queryByText('Early arrival (optional)')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))
    await screen.findByText('Event booking confirmed')
    expect(sent[0].early_arrival_request).toBeUndefined()
    expect(sent[0].dining_request).toBeUndefined()
    expect(sent[0].food_intent).toBeUndefined()
    expect(screen.queryByText(/request has been recorded for the team/)).not.toBeInTheDocument()
    expect(screen.queryByText(/early.arrival|arriving early|discuss food/i)).not.toBeInTheDocument()

  })

  it('submits mixed ticket quantities without collecting guest names', async () => {
    const sent: Record<string, unknown>[] = []
    global.fetch = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      sent.push(JSON.parse(String(init?.body)))
      return new Response(JSON.stringify({ success: true, data: { state: 'confirmed', booking_id: 'mixed-fixture' } }), { status: 201 })
    })
    render(<ManagementEventBookingForm event={{
      id: 'mixed-event', name: 'Mixed ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid',
      ticket_types: [
        { id: 'adult', name: 'Adult', price: 12, sort_order: 0, remaining: 10 },
        { id: 'child', name: 'Child', price: 6, sort_order: 1, remaining: 10 },
      ],
    }} />)
    expect(screen.getByRole('button', { name: 'Reserve my seats' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Add one Adult ticket' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add one Adult ticket' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add one Child ticket' }))
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    expect(screen.queryByText('Who are the tickets for?')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/ticket .* name/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))
    await screen.findByText('Event booking confirmed')
    expect(sent[0]).toMatchObject({
      seats: 3, first_name: 'Jane', last_name: 'Guest',
      ticket_selections: [{ ticket_type_id: 'adult', quantity: 2 }, { ticket_type_id: 'child', quantity: 1 }],
    })
    expect(sent[0].attendee_names).toBeUndefined()
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

    expect(screen.queryByLabelText('Seats')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Choose number of seats' })).toBeInTheDocument()
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(screen.getByLabelText('Mobile number')).toBeInTheDocument()
    // The 'Planning to eat before the event' tickbox has been removed
    expect(screen.queryByRole('checkbox', { name: /Planning to eat/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Not a food pre-order.')).not.toBeInTheDocument()
    // Pay-on-the-night events must not ask for a name per ticket. This is a £3
    // quiz paid at the door, so the booker's own details are all we need.
    expect(screen.queryByText('Who are the tickets for?')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Ticket 2 name')).not.toBeInTheDocument()
    // The photo ID warning belongs to prepaid ticketing and was never intended
    // for a village pub quiz night. It must not appear anywhere.
    expect(screen.queryByText(/photo ID/i)).not.toBeInTheDocument()
    expect(screen.getByText('No payment now. Reserve seats online and pay £3 per person on arrival.')).toBeInTheDocument()
    expect(screen.queryByText('18 seats currently available.')).not.toBeInTheDocument()
    expect(screen.queryByText('How many seats should we hold?')).not.toBeInTheDocument()
    expect(screen.queryByText('Want to eat before the event?')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })

  it('keeps the submit button enabled on a cash_only event without any guest names', async () => {
    render(
      <ManagementEventBookingForm
        event={{
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Cash Bingo',
          slug: 'cash-bingo',
          startDate: '2026-09-02T19:00:00+01:00',
          time: '19:00',
          price_per_seat: 5,
          payment_mode: 'cash_only'
        }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })

    expect(screen.queryByLabelText('Ticket 2 name')).not.toBeInTheDocument()
    expect(screen.queryByText(/photo ID/i)).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Reserve my seats' })).not.toBeDisabled()
    )
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
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))

    // Error message from the API should appear inline in the form
    await waitFor(() => expect(screen.getByText('Sunday lunch only')).toBeInTheDocument())
  })

  it('shows the closed panel (not a generic error) on a SALES_CLOSED 409 at submit', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url === '/api/event-bookings') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'SALES_CLOSED',
                message: 'Online ticket sales for this event have closed.'
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

    render(
      <ManagementEventBookingForm
        event={{
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Pub Quiz Night',
          startDate: '2026-05-06T19:00:00+00:00',
          time: '19:00'
        }}
      />
    )

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))

    // The friendly closed panel replaces the form; the generic error is not shown.
    await waitFor(() => expect(screen.getByText('Online ticket sales have closed')).toBeInTheDocument())
    expect(
      screen.getByText('Online ticket sales for this event have closed. Please contact us if you need help.')
    ).toBeInTheDocument()
    expect(screen.queryByText('Booking not completed')).not.toBeInTheDocument()
    // Form fields are gone once the closed panel renders.
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
  })

  it('submits a prepaid group booking with only lead booker details and quantity', async () => {
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

    window.history.pushState(
      {},
      '',
      '/events/music-bingo?utm_source=facebook&utm_medium=paid_social&utm_campaign=music-bingo&gclid=g-123&short_code=ma-bingo&email=jane@example.com',
    )
    captureBookingAttributionFromLocation(CAPTURED_AT)
    window.history.pushState({}, '', '/events/music-bingo')

    render(
      <ManagementEventBookingForm
        event={{
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Music Bingo',
          slug: 'music-bingo',
          startDate: '2026-05-08T20:00:00+01:00',
          time: '20:00',
          price_per_seat: 6,
          payment_mode: 'prepaid',
          category: {
            id: 'cat-bingo',
            name: 'Bingo',
            slug: 'bingo',
            color: '#f2c94c'
          }
        }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '6' }))
    expect(screen.queryByText('Who are the tickets for?')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
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
    expect(payload.attendee_names).toBeUndefined()
    expect(payload.notes).toBeUndefined()
    expect(payload.food_intent).toBeUndefined()
    expect(payload.event_slug).toBe('music-bingo')
    expect(payload.event_name).toBe('Music Bingo')
    expect(payload.event_category_name).toBe('Bingo')
    expect(payload.event_price).toBe(6)
    expect(payload.event_value).toBe(36)
    expect(payload.utm_source).toBe('facebook')
    expect(payload.utm_medium).toBe('paid_social')
    expect(payload.utm_campaign).toBe('music-bingo')
    expect(payload.gclid).toBe('g-123')
    expect(payload.short_code).toBe('ma-bingo')
    expect(payload.attribution_captured_at).toBe(CAPTURED_AT.toISOString())
    // Email became required on 2026-08-19, so it is now always carried. This previously
    // asserted the opposite, pinning the "blank email is omitted from the payload"
    // behaviour, which is no longer reachable from the form.
    expect(payload.email).toBe('jane@example.com')
    expect(payload.communication_consent).toEqual(
      expect.objectContaining({
        service_contact_notice_shown: true,
        marketing_email_opt_in: false,
        marketing_sms_opt_in: false,
        whatsapp_opt_in: false,
        marketing_whatsapp_opt_in: false,
        consent_text_version: GUEST_COMMS_CONSENT_TEXT_VERSION
      })
    )
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
        bookingId: 'booking-123'
      })
    )
  })

  it('limits mixed ticket types to six people altogether', () => {
    render(<ManagementEventBookingForm event={{
      id: 'mixed-event', name: 'Mixed ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid',
      ticket_types: [
        { id: 'adult', name: 'Adult', price: 12, sort_order: 0, remaining: 10 },
        { id: 'child', name: 'Child', price: 6, sort_order: 1, remaining: 10 },
      ],
    }} />)
    for (let count = 0; count < 5; count++) fireEvent.click(screen.getByRole('button', { name: 'Add one Adult ticket' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add one Child ticket' }))
    expect(screen.getByRole('button', { name: 'Add one Adult ticket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Add one Child ticket' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Remove one Adult ticket' }))
    expect(screen.getByRole('button', { name: 'Add one Child ticket' })).toBeEnabled()
  })

  it.each([43, 1, null])('does not offer standing while seated capacity is %s', (remaining) => {
    render(<ManagementEventBookingForm event={{ id: 'event-fixture', name: 'Music Bingo', startDate: '2999-01-01T19:00:00Z', booking_mode: 'communal', seated_remaining: remaining, standing_remaining: 11 }} />)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Book standing tickets' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Seats')).not.toBeInTheDocument()
    expect(screen.getByText(/More than 6 people/)).toBeInTheDocument()
    if (remaining === 1) {
      expect(screen.getByRole('button', { name: '2' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '1' })).toBeEnabled()
    }
  })

  it('requires review and a new click when seats sell out during booking', async () => {
    const sent: Record<string, unknown>[] = []
    global.fetch = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      sent.push(JSON.parse(String(init?.body)))
      return new Response(JSON.stringify({ success: true, data: sent.length === 1
        ? { state: 'blocked', reason: 'seated_capacity_changed', seated_remaining: 0, standing_remaining: 11, booking_id: null }
        : { state: 'confirmed', event_seating_type: 'standing', booking_id: 'standing-retry' }
      }), { status: 200 })
    })
    render(<ManagementEventBookingForm event={{ id: 'event-fixture', name: 'Music Bingo', startDate: '2999-01-01T19:00:00Z', booking_mode: 'communal', seated_remaining: 2, standing_remaining: 11 }} />)
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))
    await screen.findByText(/No booking has been made/)
    expect(sent).toHaveLength(1)
    expect(sent[0].seating_preference).toBe('seated')
    expect(screen.getByLabelText('First name')).toHaveValue('Jane')
    fireEvent.click(screen.getByRole('button', { name: 'Book standing tickets' }))
    await screen.findByText('Your standing tickets are confirmed for Music Bingo.')
    expect(sent[1].seating_preference).toBe('standing')
  })

  it('offers standing tickets for communal events when seated places are full', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url === '/api/event-bookings') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                state: 'confirmed',
                booking_id: 'booking-standing-123',
                reason: null,
                seats_remaining: 9,
                seated_remaining: 0,
                standing_remaining: 9,
                total_remaining: 9,
                event_seating_type: 'standing',
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
          name: 'Cabaret Night',
          slug: 'cabaret-night',
          startDate: '2026-06-12T20:00:00+01:00',
          time: '20:00',
          booking_mode: 'communal',
          price_per_seat: 10,
          seated_remaining: 0,
          standing_remaining: 9,
          total_remaining: 9
        }}
      />
    )

    // Seated is full and standing is not, so there is no choice left to offer.
    // The form says so in a sentence instead of rendering a radio group with one
    // permanently disabled option, which is what it used to do.
    expect(screen.queryByText('Seated places are full. 9 standing tickets available.')).not.toBeInTheDocument()
    expect(
      screen.getByText(/Seated places are full, so this booking will be for standing tickets/i)
    ).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /Seated/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /Standing/i })).not.toBeInTheDocument()
    // The preference really did switch to standing: the submit label proves it.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Book standing tickets' })).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: '3' }))
    // No per-ticket names here: this is a pay-on-the-night event, so the booker's
    // own details are the whole form.
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book standing tickets' }))

    await waitFor(() => expect(screen.getByText('Your standing tickets are confirmed for Cabaret Night.')).toBeInTheDocument())

    const bookingCall = (global.fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/event-bookings')
    expect(bookingCall).toBeDefined()
    const payload = JSON.parse(String((bookingCall?.[1] as RequestInit).body))

    expect(payload.seats).toBe(3)
    expect(payload.seating_preference).toBe('standing')
    // Pay-on-the-night, so no per-guest names are collected and the field is
    // omitted from the payload rather than sent empty.
    expect(payload.attendee_names).toBeUndefined()
    expect(payload.event_price).toBe(10)
    expect(payload.event_value).toBe(30)
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

    fireEvent.click(screen.getByRole('button', { name: '4' }))
    // No per-ticket names here: this is a pay-on-the-night event, so the booker's
    // own details are the whole form.
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
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

  // /karaoke is free entry, and the email field still promised "any payment
  // follow-up". There is no payment on a free event, so there is no follow-up.
  it('promises a payment follow-up only when the event can actually charge', () => {
    const { unmount } = render(
      <ManagementEventBookingForm
        event={{
          id: 'karaoke-fixture',
          name: 'Karaoke Night',
          startDate: '2999-01-01T20:00:00Z',
          payment_mode: 'free'
        }}
      />
    )

    expect(screen.getByText('So we can send your confirmation.')).toBeInTheDocument()
    expect(screen.queryByText(/payment follow-up/)).not.toBeInTheDocument()

    unmount()

    render(
      <ManagementEventBookingForm
        event={{
          id: 'quiz-fixture',
          name: 'Quiz Night',
          startDate: '2999-01-01T19:00:00Z',
          price_per_seat: 3
        }}
      />
    )

    expect(
      screen.getByText('So we can send your confirmation and any payment follow-up.')
    ).toBeInTheDocument()
    expect(screen.queryByText('So we can send your confirmation.')).not.toBeInTheDocument()
  })

  // Both of these point at real customer URLs on the management domain and must
  // keep working. A change that quietly drops either one strands a paid booking.
  it('keeps the Manage Booking link and the PayPal section on a pending payment', async () => {
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-paypal-client-id'

    try {
      ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL) => {
        if (input === '/api/event-bookings') {
          return new Response(
            JSON.stringify({
              success: true,
              data: {
                state: 'pending_payment',
                booking_id: 'booking-pending-1',
                reason: null,
                seats_remaining: 4,
                next_step_url: 'https://management.orangejelly.co.uk/pay/booking-pending-1',
                manage_booking_url: 'https://management.orangejelly.co.uk/manage/booking-pending-1'
              }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        }
        throw new Error(`Unexpected fetch call: ${String(input)}`)
      })

      render(
        <ManagementEventBookingForm
          event={{
            id: 'prepaid-fixture',
            name: 'Music Bingo',
            startDate: '2999-01-01T20:00:00Z',
            price_per_seat: 6,
            payment_mode: 'prepaid'
          }}
        />
      )

      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
      fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Reserve my seats' }))

      await screen.findByText('Your seats are currently on hold.')

      expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument()
      expect(screen.getByText('Pay with PayPal to confirm your booking.')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Open Payment Link' })).toHaveAttribute(
        'href',
        'https://management.orangejelly.co.uk/pay/booking-pending-1'
      )
      expect(screen.getByRole('link', { name: 'Manage Booking' })).toHaveAttribute(
        'href',
        'https://management.orangejelly.co.uk/manage/booking-pending-1'
      )
    } finally {
      delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    }
  })
})

/**
 * The security check is the one part of this form that could fail with nothing
 * on screen. The submit button is disabled until Cloudflare hands over a token,
 * so a widget that was blocked, dead or merely slow left the guest clicking a
 * button that would never answer and offered no way out. Every path below is
 * driven through the mock widget, so none of it touches the network.
 */
describe('ManagementEventBookingForm security check recovery', () => {
  const RECOVERY_TITLE = 'Security check not completed'
  const RECOVERY_MESSAGE =
    'Our security check has not finished, so we cannot take this booking online yet. Everything you have typed is still here.'
  const UNSUPPORTED_MESSAGE =
    'This browser cannot complete our security check. Everything you have typed is still here, but we cannot take this booking online.'
  const RETRY_LABEL = 'Try the security check again'

  beforeEach(() => {
    jest.clearAllMocks()
    mockTurnstileProps.current = null
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = TEST_TURNSTILE_SITE_KEY
    jest.useFakeTimers()

    // Any test that needs a booking response replaces this. Everything else must
    // fail loudly rather than quietly hitting the live management API.
    ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL) => {
      throw new Error(`Unexpected fetch call: ${String(input)}`)
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  })

  function renderForm() {
    return render(
      <ManagementEventBookingForm
        event={{
          id: 'turnstile-fixture',
          name: 'Quiz Night',
          startDate: '2999-01-01T19:00:00Z',
          price_per_seat: 3
        }}
      />
    )
  }

  function fillBookerDetails() {
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
  }

  /** Nothing the guest typed may be lost by a failure they did not cause. */
  function expectDetailsSurvived() {
    expect(screen.getByLabelText('First name')).toHaveValue('Jane')
    expect(screen.getByLabelText('Last name')).toHaveValue('Guest')
    expect(screen.getByLabelText('Email address')).toHaveValue('jane@example.com')
    expect(screen.getByLabelText('Mobile number')).toHaveValue('07700900000')
  }

  function advanceBy(ms: number) {
    act(() => {
      jest.advanceTimersByTime(ms)
    })
  }

  function emitTurnstile(handler: 'onSuccess' | 'onError' | 'onExpire' | 'onUnsupported', arg?: string) {
    act(() => {
      mockTurnstileProps.current?.[handler]?.(arg)
    })
  }

  /** The always-present live region the recovery message is announced through. */
  function recoveryRegion(): HTMLElement {
    return screen.getByRole('status')
  }

  function submitButton(): HTMLElement {
    return screen.getByRole('button', { name: 'Reserve my seats' })
  }

  function expectRecoveryPanel(message: string) {
    const region = recoveryRegion()
    expect(region).toHaveTextContent(RECOVERY_TITLE)
    expect(region).toHaveTextContent(message)
    expect(within(region).getByRole('link', { name: '01753 682707' })).toHaveAttribute(
      'href',
      'tel:+441753682707'
    )
  }

  it('announces the failure through a live region that is present from the start', () => {
    renderForm()

    const region = recoveryRegion()
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveAttribute('aria-atomic', 'true')
    // Empty until there is something to say: a live region added at the same
    // moment as its text is routinely missed by screen readers.
    expect(region).toBeEmptyDOMElement()
  })

  it('explains the dead submit button when the widget never loads at all', () => {
    renderForm()
    fillBookerDetails()

    expect(submitButton()).toBeDisabled()
    // Nothing yet: a slow phone on a weak signal is given room to finish.
    advanceBy(9_000)
    expect(recoveryRegion()).toBeEmptyDOMElement()

    advanceBy(1_000)

    expectRecoveryPanel(RECOVERY_MESSAGE)
    expectDetailsSurvived()
    // Still no way past verification: the button is explained, not unlocked.
    expect(submitButton()).toBeDisabled()
    expect(submitButton()).toHaveAttribute('aria-describedby', 'event-booking-turnstile-recovery')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('offers a keyboard reachable retry that resets the widget and restarts the clock', () => {
    renderForm()
    fillBookerDetails()
    advanceBy(10_000)

    const retry = screen.getByRole('button', { name: RETRY_LABEL })
    expect(retry.tagName).toBe('BUTTON')
    expect(retry).toBeEnabled()
    retry.focus()
    expect(retry).toHaveFocus()

    fireEvent.click(retry)

    expect(mockTurnstileReset).toHaveBeenCalledTimes(1)
    expect(recoveryRegion()).toBeEmptyDOMElement()
    expectDetailsSurvived()

    // The clock really did restart rather than staying spent.
    advanceBy(10_000)
    expectRecoveryPanel(RECOVERY_MESSAGE)
  })

  it('clears the message and enables submit when the token turns up late', () => {
    renderForm()
    fillBookerDetails()
    advanceBy(10_000)
    expectRecoveryPanel(RECOVERY_MESSAGE)

    emitTurnstile('onSuccess', 'late-token')

    expect(recoveryRegion()).toBeEmptyDOMElement()
    expect(submitButton()).toBeEnabled()
    expect(submitButton()).not.toHaveAttribute('aria-describedby')
    expectDetailsSurvived()
  })

  it('skips the wait when the widget reports a hard error', () => {
    renderForm()
    fillBookerDetails()

    emitTurnstile('onError', '600010')

    expectRecoveryPanel(RECOVERY_MESSAGE)
    expect(screen.getByRole('button', { name: RETRY_LABEL })).toBeInTheDocument()
    expectDetailsSurvived()
  })

  it('sends an unsupported browser straight to the phone with no retry to click', () => {
    renderForm()
    fillBookerDetails()

    emitTurnstile('onUnsupported')

    expectRecoveryPanel(UNSUPPORTED_MESSAGE)
    // Nothing retries a browser that cannot run the challenge at all.
    expect(screen.queryByRole('button', { name: RETRY_LABEL })).not.toBeInTheDocument()
    expectDetailsSurvived()
  })

  it('says nothing about an expiry Cloudflare replaces on its own', () => {
    renderForm()
    fillBookerDetails()
    emitTurnstile('onSuccess', 'first-token')

    emitTurnstile('onExpire', 'first-token')
    advanceBy(2_000)
    // A guest who simply took their time must not be shown a failure.
    expect(recoveryRegion()).toBeEmptyDOMElement()

    emitTurnstile('onSuccess', 'replacement-token')
    advanceBy(30_000)

    expect(recoveryRegion()).toBeEmptyDOMElement()
    expect(submitButton()).toBeEnabled()
  })

  it('recovers a token that expires just before submit and books on the retry', async () => {
    const sent: Record<string, unknown>[] = []
    ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (input === '/api/event-bookings') {
        sent.push(JSON.parse(String(init?.body)))
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              state: 'confirmed',
              booking_id: 'booking-after-retry',
              reason: null,
              seats_remaining: 4,
              next_step_url: null,
              manage_booking_url: 'https://management.orangejelly.co.uk/manage/booking-after-retry'
            }
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected fetch call: ${String(input)}`)
    })

    renderForm()
    fillBookerDetails()
    emitTurnstile('onSuccess', 'about-to-expire')
    expect(submitButton()).toBeEnabled()

    // The token dies on the doorstep and no replacement arrives.
    emitTurnstile('onExpire', 'about-to-expire')
    expect(submitButton()).toBeDisabled()
    advanceBy(10_000)
    expectRecoveryPanel(RECOVERY_MESSAGE)
    expectDetailsSurvived()

    fireEvent.click(screen.getByRole('button', { name: RETRY_LABEL }))
    expect(mockTurnstileReset).toHaveBeenCalledTimes(1)
    emitTurnstile('onSuccess', 'fresh-token')

    expect(recoveryRegion()).toBeEmptyDOMElement()
    fireEvent.click(submitButton())

    await waitFor(() => expect(screen.getByText('Event booking confirmed')).toBeInTheDocument())
    expect(sent).toHaveLength(1)
    // The server still verifies: it is handed the replacement, never the dead one.
    expect(sent[0].turnstile_token).toBe('fresh-token')
    expect(screen.getByRole('link', { name: 'Manage Booking' })).toHaveAttribute(
      'href',
      'https://management.orangejelly.co.uk/manage/booking-after-retry'
    )
  })

  it('shows the outage, the phone number and the details when verification is rejected', async () => {
    ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (input === '/api/event-bookings') {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'TURNSTILE_VERIFICATION_FAILED',
              message: 'We could not complete the security check. Please try again.'
            }
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected fetch call: ${String(input)}`)
    })

    renderForm()
    fillBookerDetails()
    emitTurnstile('onSuccess', 'doomed-token')
    fireEvent.click(submitButton())

    await waitFor(() => expect(screen.getByText('Booking not completed')).toBeInTheDocument())
    expect(
      screen.getByText('We could not complete the security check. Please try again.')
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '01753 682707' }).length).toBeGreaterThan(0)
    expectDetailsSurvived()

    // The widget was reset by the submit, so the clock is running again: if no
    // fresh token arrives, the guest is told rather than left with a dead button.
    expect(mockTurnstileReset).toHaveBeenCalled()
    advanceBy(10_000)
    expectRecoveryPanel(RECOVERY_MESSAGE)
  })
})
