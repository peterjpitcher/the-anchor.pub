import type { ComponentProps } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { GUEST_COMMS_CONSENT_TEXT_VERSION } from '@/lib/communication-consent'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import {
  trackDirectionsClick,
  trackEventBookingComplete,
  trackEventBookingFunnelStep,
  trackEventBookingStart
} from '@/lib/gtm-events'
import {
  captureBookingAttributionFromLocation,
  clearBookingAttributionForTest,
} from '@/lib/booking-attribution'
import { setConsentStatus } from '@/lib/cookies'

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn(),
  trackEventBookingComplete: jest.fn(),
  trackEventBookingFunnelStep: jest.fn(),
  trackDirectionsClick: jest.fn(),
  trackAddToCalendarClick: jest.fn()
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

// BK-017: a booking that asks for each guest's details needs the booker's confirmation.
function confirmGuestDetails(): void {
  const box = screen.queryByLabelText("Everyone I've added is happy to share these details.")
  if (box && !(box as HTMLInputElement).checked) fireEvent.click(box)
}

describe('ManagementEventBookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearBookingAttributionForTest()
    window.localStorage.clear()

    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

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
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
  })

  it('sends no ad tags, click IDs or full URL with a booking made without marketing consent', async () => {
    const previousFetch = global.fetch
    const sent: Record<string, unknown>[] = []
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (input === '/api/event-bookings') {
        sent.push(JSON.parse(String(init?.body)))
        return new Response(JSON.stringify({ success: true, data: { state: 'confirmed', booking_id: 'booking-fixture' } }), { status: 201 })
      }
      return previousFetch(input, init)
    })
    window.history.pushState({}, '', '/events/music-bingo?utm_source=facebook&utm_medium=paid_social&utm_campaign=music-bingo&fbclid=fb-ad-click&gclid=g-123&short_code=ma-bingo')
    captureBookingAttributionFromLocation(CAPTURED_AT)

    render(<ManagementEventBookingForm event={{ id: 'event-fixture', name: 'Test event', startDate: '2999-01-01T19:00:00Z', payment_mode: 'free' }} />)
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
    await screen.findByText('Event booking confirmed')

    const payload = sent[0]
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'short_code', 'source_url', 'attribution_captured_at', 'fbp', 'fbc']) {
      expect(payload[key]).toBeUndefined()
    }
    expect(payload.landing_path).toBe('/events/music-bingo')
    expect(payload.meta_consent_granted).toBe(false)
    expect(window.localStorage.getItem('anchor-booking-attribution')).toBeNull()
    expect(document.cookie).not.toContain('anchor-booking-attribution=')
    window.history.pushState({}, '', '/')
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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    expect(screen.queryByLabelText('Would you like to discuss food?')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('I would like to discuss arriving early')).not.toBeInTheDocument()
    expect(screen.queryByText('Early arrival (optional)')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
    await screen.findByText('Event booking confirmed')
    expect(sent[0].early_arrival_request).toBeUndefined()
    expect(sent[0].dining_request).toBeUndefined()
    expect(sent[0].food_intent).toBeUndefined()
    expect(screen.queryByText(/request has been recorded for the team/)).not.toBeInTheDocument()
    expect(screen.queryByText(/early.arrival|arriving early|discuss food/i)).not.toBeInTheDocument()

  })

  /**
   * `event_booking_started` fired at submit, beside `event_booking_submit`, so
   * "started" always equalled "submitted" and abandonment was invisible. It now
   * fires once, on the guest's first real move, and submit stays at submit.
   */
  describe('booking start', () => {
    const START_EVENT = { id: 'start-fixture', name: 'Quiz Night', startDate: '2999-01-01T19:00:00Z', payment_mode: 'free' }

    it('fires once on the first field a guest changes, and not again at submit', async () => {
      global.fetch = jest.fn(async () =>
        new Response(JSON.stringify({ success: true, data: { state: 'confirmed', booking_id: 'start-booking' } }), { status: 201 })
      ) as unknown as typeof fetch
      render(<ManagementEventBookingForm event={START_EVENT} />)

      // Seeing the form is form_view, not a start.
      expect(trackEventBookingStart).not.toHaveBeenCalled()

      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
      expect(trackEventBookingStart).toHaveBeenCalledTimes(1)
      expect(trackEventBookingStart).toHaveBeenCalledWith({
        eventId: 'start-fixture',
        eventName: 'Quiz Night',
        eventDate: '2999-01-01T19:00:00Z',
        source: 'event_booking_form'
      })

      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
      fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
      await screen.findByText('Event booking confirmed')

      expect(trackEventBookingStart).toHaveBeenCalledTimes(1)
      expect(trackEventBookingFunnelStep).toHaveBeenCalledWith(expect.objectContaining({ step: 'submit' }))
    })

    it('counts choosing how many people as a start', () => {
      render(<ManagementEventBookingForm event={START_EVENT} />)

      fireEvent.click(screen.getByRole('button', { name: '3' }))
      fireEvent.click(screen.getByRole('button', { name: '4' }))

      expect(trackEventBookingStart).toHaveBeenCalledTimes(1)
    })

    it('does not count the hidden field only a bot fills', () => {
      const { container } = render(<ManagementEventBookingForm event={START_EVENT} />)

      fireEvent.change(container.querySelector('#evt-website') as HTMLInputElement, { target: { value: 'spam' } })

      expect(trackEventBookingStart).not.toHaveBeenCalled()
    })
  })

  it('submits mixed tickets with a separate name for every guest', async () => {
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
    expect(screen.getByRole('button', { name: 'Book a table' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Add one Adult ticket' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add one Adult ticket' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add one Child ticket' }))
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    expect(screen.queryByText('Who are the tickets for?')).not.toBeInTheDocument()
    expect(screen.getAllByLabelText(/ticket .* name/i)).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
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

  it('lets the submit button fit the booking card on a narrow phone', () => {
    // 'Book your places' at the large size needs 237px on one line. Inside the
    // game-night booking card a 320px phone leaves it 212px, and the button
    // held the whole column 25px too wide on /cash-bingo and /music-bingo.
    render(
      <ManagementEventBookingForm
        event={{
          id: 'evt-bingo',
          name: 'Cash Bingo',
          startDate: '2026-11-18T19:00:00+00:00',
          time: '19:00',
          booking_mode: 'communal',
          seats_remaining: 49
        }}
        compact
      />
    )

    expect(screen.getByRole('button', { name: 'Book your places' })).toHaveClass(
      'max-sm:whitespace-normal',
      'max-sm:px-4'
    )
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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })

    expect(screen.queryByLabelText('Ticket 2 name')).not.toBeInTheDocument()
    expect(screen.queryByText(/photo ID/i)).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Book a table' })).not.toBeDisabled()
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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

    // The friendly closed panel replaces the form; the generic error is not shown.
    await waitFor(() => expect(screen.getByText('Online ticket sales have closed')).toBeInTheDocument())
    expect(
      screen.getByText('Online ticket sales for this event have closed. Please contact us if you need help.')
    ).toBeInTheDocument()
    expect(screen.queryByText('Booking not completed')).not.toBeInTheDocument()
    // Form fields are gone once the closed panel renders.
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
  })

  it('submits a prepaid group booking with purchaser and attendee details', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()

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
    // Ad tags reach the booking only with marketing consent (see the no-consent case above).
    setConsentStatus({ marketing: true })
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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

    await waitFor(() => expect(screen.getByText('Your seats are confirmed for Music Bingo.')).toBeInTheDocument())

    const bookingCall = (global.fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/event-bookings')
    expect(bookingCall).toBeDefined()
    const payload = JSON.parse(String((bookingCall?.[1] as RequestInit).body))

    expect(payload.seats).toBe(6)
    expect(payload.attendees).toHaveLength(6)
    expect(payload.attendees[0]).toMatchObject({ name: 'Guest 1', answers: {} })
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
    expect(payload.expected_total).toBe(36)
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
        consent_text_version: GUEST_COMMS_CONSENT_TEXT_VERSION,
        // Which notice the guest was shown, so the management app stores those words (BK-080).
        notice_key: 'event_compact_v6'
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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book your places' }))
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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
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

  // BK-168: the confirmation comes by email first (owner decision D14), so the mobile field no
  // longer promises a text.
  it.each(['free', 'cash_only', 'prepaid'])('says why we ask for a mobile on a %s night, without promising a text', (paymentMode) => {
    render(<ManagementEventBookingForm event={{ id: 'helper-fixture', name: 'Quiz Night', startDate: '2999-01-01T19:00:00Z', payment_mode: paymentMode, price_per_seat: paymentMode === 'free' ? 0 : 5 }} />)
    expect(screen.getByText('So we can reach you about your booking.')).toBeInTheDocument()
    expect(screen.queryByText('For your confirmation text.')).not.toBeInTheDocument()
  })

  // BK-138, owner decision D11: the waiting list was removed. A night that filled up while the
  // guest was booking says so and gives the pub's number; nothing is sent to a waitlist.
  it('tells a guest whose night filled up while booking to call, and offers no waitlist', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === '/api/event-bookings') {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: { state: 'full_with_waitlist_option', booking_id: null, reason: 'sold_out', seats_remaining: 0, next_step_url: null, manage_booking_url: null },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      }
      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    render(
      <ManagementEventBookingForm
        event={{ id: '550e8400-e29b-41d4-a716-446655440000', name: 'Music Bingo', slug: 'music-bingo', startDate: '2026-05-08T20:00:00+01:00', time: '20:00', price_per_seat: 6 }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

    await screen.findByText('This event is now full')
    expect(screen.getByText(/The last places went while you were booking/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '01753 682707' })).toHaveAttribute('href', 'tel:+441753682707')
    expect(screen.queryByRole('button', { name: 'Join Waitlist' })).not.toBeInTheDocument()
    expect((global.fetch as jest.Mock).mock.calls.map(([url]) => String(url))).toEqual(['/api/event-bookings'])
  })

  /**
   * A night the page shows as full is stopped before anything is sent. The
   * waiting list was removed (BK-138), so there is nothing to offer but a call.
   * Mocked end to end: nothing here reaches the live API.
   */
  describe('a night the page shows as full', () => {
    const FULL_EVENT = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Autumn Kick-Off Quiz Night',
      slug: 'autumn-kick-off-quiz-night-2999-01-01',
      startDate: '2999-01-01T19:00:00Z',
      payment_mode: 'cash_only',
      price_per_seat: 3
    }

    function fillDetails() {
      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
      fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    }

    function answerBookingWith(bookingData: Record<string, unknown>) {
      const sent: { booking: Record<string, unknown>[]; waitlist: Record<string, unknown>[] } = { booking: [], waitlist: [] }
      ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url === '/api/event-bookings') {
          sent.booking.push(JSON.parse(String(init?.body)))
          return new Response(JSON.stringify({ success: true, data: bookingData }), { status: 200 })
        }
        if (url === '/api/event-waitlist') {
          sent.waitlist.push(JSON.parse(String(init?.body)))
          return new Response(
            JSON.stringify({ success: true, data: { queued: true, state: 'queued', waitlist_entry_id: 'waitlist-1', reason: null, seats_remaining: 0 } }),
            { status: 201 }
          )
        }
        throw new Error(`Unexpected fetch call: ${url}`)
      })
      return sent
    }

    const FULL_ANSWER = {
      state: 'full_with_waitlist_option',
      booking_id: null,
      reason: 'insufficient_capacity',
      seats_remaining: 0,
      next_step_url: null,
      manage_booking_url: null
    }

    it('stops a full night before sending anything, even when an older API still says waitlist_enabled', async () => {
      const sent = answerBookingWith(FULL_ANSWER)
      render(<ManagementEventBookingForm event={{ ...FULL_EVENT, booking_mode: 'table', seats_remaining: 0, waitlist_enabled: true }} />)

      expect(screen.getByText('No tickets are available. Please call us for help.')).toBeInTheDocument()
      expect(screen.queryByText(/join the waitlist/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '1' })).toBeDisabled()

      fillDetails()
      fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

      await screen.findByText('That many tickets are no longer available. Please choose fewer tickets or call us.')
      expect(sent.booking).toHaveLength(0)
      expect(sent.waitlist).toHaveLength(0)
    })

    it('still stops a full night with no waitlist before sending anything', async () => {
      ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL) => {
        throw new Error(`Unexpected fetch call: ${String(input)}`)
      })
      render(<ManagementEventBookingForm event={{ ...FULL_EVENT, booking_mode: 'table', seats_remaining: 0 }} />)

      expect(screen.getByText('No tickets are available. Please call us for help.')).toBeInTheDocument()
      expect(screen.queryByText(/This night is showing as full/)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '1' })).toBeDisabled()

      fillDetails()
      fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

      await screen.findByText('That many tickets are no longer available. Please choose fewer tickets or call us.')
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  // /karaoke is free entry, and the email field still promised "any payment
  // follow-up". The same promise sat on every cash-on-arrival quiz and bingo
  // night, where nothing is ever charged online either: the management app only
  // holds a booking for payment when the record is prepaid.
  it.each([
    ['a free night', { payment_mode: 'free' }],
    ['a cash-on-arrival night', { payment_mode: 'cash_only', price_per_seat: 3 }],
    ['a priced night with no payment mode', { price_per_seat: 3 }]
  ])('promises no payment follow-up on %s', (_label, payment) => {
    render(
      <ManagementEventBookingForm
        event={{ id: 'no-charge-fixture', name: 'Quiz Night', startDate: '2999-01-01T19:00:00Z', ...payment }}
      />
    )

    expect(screen.getByText('So we can send your confirmation.')).toBeInTheDocument()
    expect(screen.queryByText(/payment follow-up/)).not.toBeInTheDocument()
  })

  it('promises a payment follow-up only on a prepaid night, which is charged online', () => {
    render(
      <ManagementEventBookingForm
        event={{
          id: 'prepaid-fixture',
          name: 'Tasting Night',
          startDate: '2999-01-01T19:00:00Z',
          payment_mode: 'prepaid',
          price_per_seat: 45
        }}
      />
    )

    expect(
      screen.getByText('So we can send your confirmation and any payment follow-up.')
    ).toBeInTheDocument()
  })

  // One action used to carry four labels: "Reserve table" or "Book tickets" on
  // the page, "Reserve my seats" here, "Book your places" on the hubs.
  it.each([
    ['a communal night', { booking_mode: 'communal', seated_remaining: 40, standing_remaining: 11 }, 'Book your places'],
    ['a table night', { booking_mode: 'table', seats_remaining: 40 }, 'Book a table'],
    ['a night with no booking mode, which the management app books as a table', {}, 'Book a table']
  ])('names the submit button by the booking mode on %s', (_label, mode, expected) => {
    render(
      <ManagementEventBookingForm
        event={{ id: 'label-fixture', name: 'Music Bingo', startDate: '2999-01-01T19:00:00Z', ...mode }}
      />
    )

    expect(screen.getByRole('button', { name: expected })).toHaveAttribute('type', 'submit')
    expect(screen.queryByRole('button', { name: 'Reserve my seats' })).not.toBeInTheDocument()
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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
      fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

      await screen.findByText('Your seats are on hold. Pay now to confirm your booking.')

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

  /**
   * The two things a guest actually does next: put the night in a diary, and
   * work out how to get here.
   *
   * The rule worth pinning is the negative one. A hold awaiting payment, a
   * waitlist offer and a blocked attempt are all "not booked", so neither
   * action may appear on any of them. The calendar control also refuses a
   * cancelled or finished night on its own, and that refusal has to survive
   * being mounted inside a confirmation.
   */
  describe('confirmation next actions', () => {
    // Built from CONTACT.coordinates, the same destination the Find Us section
    // uses. Written out in full here so a silent change to either one shows up.
    const DIRECTIONS_HREF = 'https://www.google.com/maps/dir/?api=1&destination=51.462509,-0.502067'

    const UPCOMING_EVENT = {
      id: 'evt-next-actions',
      name: 'Quiz Night',
      slug: 'quiz-night-2999-01-01',
      startDate: '2999-01-01T19:00:00Z'
    }

    /**
     * Answers the booking POST, and nothing else.
     *
     * Local dev and this suite both point at the live management API, so an
     * unexpected URL is a real booking waiting to happen: it throws rather than
     * being quietly allowed through.
     */
    function respondWith(bookingData: Record<string, unknown>): void {
      ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : String(input)

        if (url === '/api/event-bookings') {
          return new Response(JSON.stringify({ success: true, data: bookingData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        throw new Error(`Unexpected fetch call: ${url}`)
      })
    }

    function submitBooking(
      eventOverrides: Partial<ComponentProps<typeof ManagementEventBookingForm>['event']> = {}
    ): void {
      render(<ManagementEventBookingForm event={{ ...UPCOMING_EVENT, ...eventOverrides }} />)
      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
      fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
    }

    function queryCalendarLinks(): HTMLElement[] {
      return [
        ...screen.queryAllByRole('link', { name: /Google Calendar/i }),
        ...screen.queryAllByRole('link', { name: /calendar file/i })
      ]
    }

    function queryDirectionsLink(): HTMLElement | null {
      return screen.queryByRole('link', { name: 'Get directions' })
    }

    it('offers the calendar and directions once the booking is confirmed', async () => {
      respondWith({
        state: 'confirmed',
        booking_id: 'booking-next-actions',
        reason: null,
        seats_remaining: 4,
        next_step_url: null,
        manage_booking_url: 'https://management.orangejelly.co.uk/manage/booking-next-actions'
      })

      submitBooking()
      await screen.findByText('Event booking confirmed')

      expect(screen.getByRole('link', { name: /Google Calendar/i })).toHaveAttribute(
        'href',
        expect.stringContaining('calendar.google.com')
      )
      expect(screen.getByRole('link', { name: /calendar file/i })).toHaveAttribute(
        'href',
        '/api/calendar/event/quiz-night-2999-01-01'
      )

      const directions = screen.getByRole('link', { name: 'Get directions' })
      expect(directions).toHaveAttribute('href', DIRECTIONS_HREF)
      expect(directions).toHaveAttribute('target', '_blank')
      expect(directions).toHaveAttribute('rel', 'noopener noreferrer')

      // The recovery panel must stay away: the result is set, so the security
      // clock is suppressed and nothing appears ten seconds later.
      expect(screen.queryByText('Security check not completed')).not.toBeInTheDocument()

      // Manage Booking is a real customer URL and has to survive alongside them.
      expect(screen.getByRole('link', { name: 'Manage Booking' })).toHaveAttribute(
        'href',
        'https://management.orangejelly.co.uk/manage/booking-next-actions'
      )
    })

    it('reports the directions click the way the rest of the site does', async () => {
      respondWith({
        state: 'confirmed',
        booking_id: 'booking-directions',
        reason: null,
        seats_remaining: 4,
        next_step_url: null,
        manage_booking_url: null
      })

      submitBooking()
      await screen.findByText('Event booking confirmed')

      fireEvent.click(screen.getByRole('link', { name: 'Get directions' }))

      expect(trackDirectionsClick).toHaveBeenCalledWith(
        'event_booking_confirmed',
        expect.objectContaining({ mapPlatform: 'google_maps' })
      )
    })

    it('offers neither on a booking that is only on hold for payment', async () => {
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-paypal-client-id'

      try {
        respondWith({
          state: 'pending_payment',
          booking_id: 'booking-on-hold',
          reason: null,
          seats_remaining: 4,
          next_step_url: 'https://management.orangejelly.co.uk/pay/booking-on-hold',
          manage_booking_url: 'https://management.orangejelly.co.uk/manage/booking-on-hold'
        })

        submitBooking({ payment_mode: 'prepaid', price_per_seat: 6 })
        await screen.findByText('Your seats are on hold. Pay now to confirm your booking.')

        // Payment has not cleared, so there is no night to diarise yet.
        expect(queryCalendarLinks()).toHaveLength(0)
        expect(queryDirectionsLink()).not.toBeInTheDocument()

        // The paths that get the guest paid must be untouched by all of this.
        expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Open Payment Link' })).toHaveAttribute(
          'href',
          'https://management.orangejelly.co.uk/pay/booking-on-hold'
        )
        expect(screen.getByRole('link', { name: 'Manage Booking' })).toHaveAttribute(
          'href',
          'https://management.orangejelly.co.uk/manage/booking-on-hold'
        )
      } finally {
        delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      }
    })

    // Review BK-100: the hold deadline and total, and a way back when the hold has run out.
    it('says how long the seats are held and what is owed', async () => {
      respondWith({
        state: 'pending_payment',
        booking_id: 'booking-held',
        reason: null,
        seats_remaining: 4,
        next_step_url: 'https://management.orangejelly.co.uk/pay/booking-held',
        manage_booking_url: null,
        hold_expires_at: '2099-07-03T18:42:00Z',
        amount_due: 12,
        currency: 'GBP'
      })

      submitBooking({ payment_mode: 'prepaid', price_per_seat: 6 })

      expect(await screen.findByText("We're holding your seats until 7:42pm. Pay before then to confirm your booking.")).toBeInTheDocument()
      expect(screen.getByText('Total to pay: £12.')).toBeInTheDocument()
    })

    it('holds the seats again under a fresh key once the hold has run out', async () => {
      const bodies: Array<{ headers: Record<string, string> }> = []
      ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : String(input)
        if (url !== '/api/event-bookings') throw new Error(`Unexpected fetch call: ${url}`)
        bodies.push({ headers: (init?.headers ?? {}) as Record<string, string> })
        return new Response(JSON.stringify({
          success: true,
          data: {
            state: 'pending_payment',
            booking_id: `booking-${bodies.length}`,
            reason: null,
            seats_remaining: 4,
            next_step_url: 'https://management.orangejelly.co.uk/pay/x',
            manage_booking_url: null,
            // The first hold has already ended; the second runs on.
            hold_expires_at: bodies.length === 1 ? '2000-01-01T00:00:00Z' : '2099-07-03T18:42:00Z'
          }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      })

      submitBooking({ payment_mode: 'prepaid', price_per_seat: 6 })
      fireEvent.click(await screen.findByRole('button', { name: 'Hold them again' }))

      await screen.findByText(/We're holding your seats until 7:42pm/)
      expect(bodies).toHaveLength(2)
      expect(bodies[0].headers['Idempotency-Key']).toBeUndefined()
      expect(bodies[1].headers['Idempotency-Key']).toMatch(/^evt_rehold_/)
    })

    it('offers neither when the event filled up while the guest was booking', async () => {
      respondWith({
        state: 'full_with_waitlist_option',
        booking_id: null,
        reason: 'sold_out',
        seats_remaining: 0,
        next_step_url: null,
        manage_booking_url: null
      })

      submitBooking()
      await screen.findByText('This event is now full')

      expect(queryCalendarLinks()).toHaveLength(0)
      expect(queryDirectionsLink()).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Join Waitlist' })).not.toBeInTheDocument()
    })

    it('offers neither when the booking is blocked', async () => {
      respondWith({
        state: 'blocked',
        booking_id: null,
        reason: 'sold_out',
        seats_remaining: 0,
        next_step_url: null,
        manage_booking_url: null
      })

      submitBooking()
      await screen.findByText('This event is sold out.')

      expect(queryCalendarLinks()).toHaveLength(0)
      expect(queryDirectionsLink()).not.toBeInTheDocument()
    })

    // A guest who already had seats and tried again was shown the word
    // `customer_conflict`, twice, on 14 September 2026. Every reason the
    // booking system can answer with now has a sentence, and one it adds
    // later gets the general line, never the code.
    it.each([
      ['customer_conflict', /It looks like you already have a booking for this event/],
      ['event_started', /This event has already started/],
      ['booking_closed', /Online booking for this event has closed/],
      ['insufficient_capacity', /There are not enough places left for that many people/],
      ['a_reason_added_next_year', /This event is not bookable online right now/]
    ])('shows a sentence, and the phone number, for the blocked reason %s', async (reason, sentence) => {
      respondWith({
        state: 'blocked',
        booking_id: null,
        reason,
        seats_remaining: 0,
        next_step_url: null,
        manage_booking_url: null
      })

      submitBooking()

      expect(await screen.findByText(sentence)).toBeInTheDocument()
      expect(screen.queryByText(new RegExp(reason))).not.toBeInTheDocument()
      // The alert's own phone line, since these sentences do not carry it.
      expect(screen.getByText(/if you need help/)).toHaveTextContent('01753 682707')
    })

    // Directions to the pub are true whatever happened to the event, so they
    // stay. A diary entry for a night that is not happening is not.
    it.each([
      ['cancelled', { event_status: 'cancelled' }],
      ['finished', { startDate: '2020-01-01T19:00:00Z' }]
    ])('offers no calendar entry for a %s event, even on a confirmed booking', async (_label, overrides) => {
      respondWith({
        state: 'confirmed',
        booking_id: 'booking-no-calendar',
        reason: null,
        seats_remaining: 4,
        next_step_url: null,
        manage_booking_url: null
      })

      submitBooking(overrides)
      await screen.findByText('Event booking confirmed')

      expect(queryCalendarLinks()).toHaveLength(0)
      expect(queryDirectionsLink()).toBeInTheDocument()
    })
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
    screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    confirmGuestDetails()
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
    // By id: the "waiting for the security check" line is a status region too.
    return document.getElementById('event-booking-turnstile-recovery') as HTMLElement
  }

  function submitButton(): HTMLElement {
    return screen.getByRole('button', { name: 'Book a table' })
  }

  /**
   * Waiting for a token: still in the Tab order and announced as unavailable,
   * with the reason it is waiting as its description, and pressing it sends
   * nothing (review BK-198). It used to be disabled outright, which took it
   * out of the Tab order with nothing said.
   */
  function expectWaitingForSecurityCheck() {
    const button = submitButton()
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAccessibleDescription(expect.stringContaining('Waiting for the security check.'))
    fireEvent.click(button)
    expect(global.fetch).not.toHaveBeenCalled()
  }

  /** A token is in hand: the button is a plain, usable button again. */
  function expectReadyToBook() {
    expect(submitButton()).toBeEnabled()
    expect(submitButton()).not.toHaveAttribute('aria-disabled')
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

    expectWaitingForSecurityCheck()
    // Nothing yet: a slow phone on a weak signal is given room to finish.
    advanceBy(9_000)
    expect(recoveryRegion()).toBeEmptyDOMElement()

    advanceBy(1_000)

    expectRecoveryPanel(RECOVERY_MESSAGE)
    expectDetailsSurvived()
    // Still no way past verification: the button is explained, not unlocked.
    expectWaitingForSecurityCheck()
    expect(submitButton()).toHaveAttribute(
      'aria-describedby',
      'event-booking-security-note event-booking-turnstile-recovery'
    )
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
    expectReadyToBook()
    // Only the waiting line, now empty, which describes nothing.
    expect(submitButton()).toHaveAttribute('aria-describedby', 'event-booking-security-note')
    expect(submitButton()).toHaveAccessibleDescription('')
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
    expectReadyToBook()
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
    expectReadyToBook()

    // The token dies on the doorstep and no replacement arrives.
    emitTurnstile('onExpire', 'about-to-expire')
    expect(submitButton()).toHaveAttribute('aria-disabled', 'true')
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

it('keeps per-person answers separate and requires an explicit yes or no', () => {
  render(<ManagementEventBookingForm event={{
    id: 'questions-fixture', name: 'Ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid', price: 10,
    booking_questions: [{ id: 'requirements', label: 'Any requirements?', type: 'yes_no', required: true }],
  }} />)
  const answers = screen.getAllByLabelText('Any requirements? (required)')
  expect(answers).toHaveLength(2)
  expect(answers[0]).toBeRequired()
  expect(answers[0]).toHaveValue('')
  fireEvent.change(answers[0], { target: { value: 'no' } })
  expect(answers[0]).toHaveValue('no')
  expect(answers[1]).toHaveValue('')
})

// BK-017: the booker is sharing other people's details, and an answer can be an allergy.
it('tells the booker, beside the guest details, to add only people happy to share them and when answers are deleted', () => {
  render(<ManagementEventBookingForm event={{
    id: 'privacy-fixture', name: 'Ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid', price: 10,
    booking_questions: [{ id: 'allergies', label: 'Any allergies?', type: 'text', required: true }],
  }} />)
  const section = screen.getByRole('region', { name: 'Ticket holder details' })
  expect(section).toHaveTextContent('Only add people who are happy to share these details with us.')
  expect(section).toHaveTextContent('We use their answers and mobile numbers for this event only, and delete them 90 days after it.')
})

it('shows no guest details notice where no guest details are asked for', () => {
  render(<ManagementEventBookingForm event={{ id: 'arrival-notice-fixture', name: 'Quiz fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'cash_only', price: 3 }} />)
  expect(screen.queryByText(/Only add people who are happy to share/)).not.toBeInTheDocument()
})

// BK-014: the management app says whether to ask, from the event's own setting.
it('asks for each guest on a pay-on-arrival event the management app says needs them', () => {
  render(<ManagementEventBookingForm event={{
    id: 'arrival-on-fixture', name: 'Quiz fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'cash_only', price: 3,
    guest_details_required: true,
  }} />)
  expect(screen.getByText('Who is coming?')).toBeInTheDocument()
  expect(screen.getAllByLabelText(/ticket \d+ full name/i).length).toBeGreaterThan(0)
})

it('asks for no guest details on a prepaid event the management app has switched off', async () => {
  const sent: Record<string, unknown>[] = []
  global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).startsWith('/api/customers/lookup')) return new Response(JSON.stringify({ success: true, data: { known: false, lookup_degraded: false } }), { status: 200 })
    sent.push(JSON.parse(String(init?.body)))
    return new Response(JSON.stringify({ success: true, data: { state: 'pending_payment', booking_id: 'off-fixture' } }), { status: 201 })
  })
  render(<ManagementEventBookingForm event={{
    id: 'prepaid-off-fixture', name: 'Ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid', price: 10,
    guest_details_required: false,
  }} />)
  expect(screen.queryByText('Who is coming?')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Buyer' } })
  fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Example' } })
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'buyer@example.com' } })
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
  fireEvent.submit(screen.getByLabelText('First name').closest('form')!)
  await waitFor(() => expect(sent).toHaveLength(1))
  expect(sent[0].attendees).toBeUndefined()
})

// BK-017: the booker confirms everyone they added is happy to share their details.
it('will not send guest details until the booker confirms everyone is happy to share them', async () => {
  const sent: Record<string, unknown>[] = []
  global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).startsWith('/api/customers/lookup')) return new Response(JSON.stringify({ success: true, data: { known: false, lookup_degraded: false } }), { status: 200 })
    sent.push(JSON.parse(String(init?.body)))
    return new Response(JSON.stringify({ success: true, data: { state: 'pending_payment', booking_id: 'confirm-fixture' } }), { status: 201 })
  })
  render(<ManagementEventBookingForm event={{
    id: 'confirm-fixture', name: 'Ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid', price: 10,
    guest_details_required: true,
  }} />)
  screen.getAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Person ${index + 1}` } }))
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Buyer' } })
  fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Example' } })
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'buyer@example.com' } })
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
  fireEvent.submit(screen.getByLabelText('First name').closest('form')!)
  expect(await screen.findByText("Please confirm everyone you've added is happy to share these details.")).toBeInTheDocument()
  expect(sent).toHaveLength(0)

  fireEvent.click(screen.getByLabelText("Everyone I've added is happy to share these details."))
  fireEvent.submit(screen.getByLabelText('First name').closest('form')!)
  await waitFor(() => expect(sent).toHaveLength(1))
  const people = sent[0].attendees as Array<Record<string, unknown>>
  expect(people.length).toBeGreaterThan(0)
  expect(people.every((person) => person.details_confirmed === true)).toBe(true)
})

it('keeps free event booking free of attendee questions', () => {
  render(<ManagementEventBookingForm event={{
    id: 'free-fixture', name: 'Free fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'free', is_free: true, price: 0,
    booking_questions: [{ id: 'requirements', label: 'Any requirements?', type: 'yes_no', required: true }],
  }} />)
  expect(screen.queryByText('Who is coming?')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Any requirements? (required)')).not.toBeInTheDocument()
})

it('refreshes a changed quote without losing attendee details', async () => {
  const event = { id: 'quote-fixture', name: 'Ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid', price: 10 }
  global.fetch = jest.fn(async (url) => String(url).startsWith('/api/events/')
    ? new Response(JSON.stringify({ success: true, data: { ...event, price: 12 } }), { status: 200 })
    : new Response(JSON.stringify({ success: false, error: { code: 'PRICE_CHANGED' } }), { status: 409 }))
  render(<ManagementEventBookingForm event={event} />)
  screen.getAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Person ${index + 1}` } }))
  confirmGuestDetails()
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Buyer' } })
  fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Example' } })
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'buyer@example.com' } })
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
  fireEvent.submit(screen.getByLabelText('First name').closest('form')!)
  await screen.findByText(/Please review the updated tickets, questions and total/)
  expect(screen.getByLabelText('Ticket 1 full name')).toHaveValue('Person 1')
  expect(screen.getByLabelText('Ticket 2 full name')).toHaveValue('Person 2')
  expect(global.fetch).toHaveBeenCalledWith('/api/events/quote-fixture', { cache: 'no-store' })
})

it('keeps ordinary pay-on-arrival reservations simple', () => {
  render(<ManagementEventBookingForm event={{ id: 'arrival-fixture', name: 'Quiz fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'cash_only', price: 3 }} />)
  expect(screen.queryByText('Who is coming?')).not.toBeInTheDocument()
  expect(screen.getByLabelText('First name')).toBeInTheDocument()
})

it('drops removed questions from the next submission without losing remaining guest details', async () => {
  const question = { id: 'old-question', label: 'Old question', type: 'text' as const, required: false }
  const event = { id: 'question-refresh', name: 'Ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid', price: 10, booking_questions: [question] }
  const sent: any[] = []
  global.fetch = jest.fn(async (url, options) => {
    if (String(url).startsWith('/api/events/')) return new Response(JSON.stringify({ success: true, data: { ...event, booking_questions: [] } }), { status: 200 })
    sent.push(JSON.parse(String(options?.body)))
    return new Response(JSON.stringify({ success: false, error: { code: 'BOOKING_QUESTIONS_CHANGED' } }), { status: 409 })
  })
  render(<ManagementEventBookingForm event={event} />)
  screen.getAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Person ${index + 1}` } }))
  confirmGuestDetails()
  fireEvent.change(screen.getAllByLabelText('Old question (optional)')[0], { target: { value: 'An answer' } })
  for (const [label, value] of [['First name', 'Buyer'], ['Last name', 'Example'], ['Email address', 'buyer@example.com'], ['Mobile number', '07700900123']]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.submit(screen.getByLabelText('First name').closest('form')!)
  await screen.findByText(/Please review the updated tickets, questions and total/)
  fireEvent.submit(screen.getByLabelText('First name').closest('form')!)
  await waitFor(() => expect(sent).toHaveLength(2))
  expect(sent[1].attendees[0]).toEqual(expect.objectContaining({ name: 'Person 1', answers: {} }))
})

// BK-013, owner decision D5: an optional mobile per ticket, and "this ticket is for me".
it('sends each guest mobile, and fills a ticket marked "for me" from the booker', async () => {
  const event = { id: 'phone-fixture', name: 'Ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid', price: 10 }
  const sent: any[] = []
  global.fetch = jest.fn(async (url, options) => {
    if (String(url).startsWith('/api/events/')) return new Response(JSON.stringify({ success: true, data: event }), { status: 200 })
    sent.push(JSON.parse(String(options?.body)))
    return new Response(JSON.stringify({ success: false, error: { code: 'PRICE_CHANGED' } }), { status: 409 })
  })
  render(<ManagementEventBookingForm event={event} />)
  fireEvent.click(screen.getAllByLabelText('This ticket is for me')[0])
  expect(screen.queryByLabelText('Ticket 1 full name')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Ticket 2 full name'), { target: { value: 'Sam Guest' } })
  fireEvent.change(screen.getByLabelText('Ticket 2 mobile number (optional)'), { target: { value: '07700 900456' } })
  confirmGuestDetails()
  for (const [label, value] of [['First name', 'Buyer'], ['Last name', 'Example'], ['Email address', 'buyer@example.com'], ['Mobile number', '07700900123']]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.submit(screen.getByLabelText('First name').closest('form')!)
  await waitFor(() => expect(sent).toHaveLength(1))
  expect(sent[0].attendees[0]).toEqual(expect.objectContaining({ name: 'Buyer Example', phone: '07700900123' }))
  expect(sent[0].attendees[0]).not.toHaveProperty('for_me')
  expect(sent[0].attendees[1]).toEqual(expect.objectContaining({ name: 'Sam Guest', phone: '07700 900456' }))
})

it('shows separately selectable ticket types even when their prices match', () => {
  render(<ManagementEventBookingForm event={{ id: 'equal-prices', name: 'Ticket fixture', startDate: '2999-01-01T19:00:00Z', payment_mode: 'prepaid', price: 10,
    ticket_types: [{ id: 'one', name: 'With alcohol', price: 10, remaining: 10, sort_order: 0 }, { id: 'two', name: 'Without alcohol', price: 10, remaining: 10, sort_order: 1 }],
  }} />)
  expect(screen.getByText('With alcohol')).toBeInTheDocument()
  expect(screen.getByText('Without alcohol')).toBeInTheDocument()
})

// Review BK-162. The management app can only text UK mobiles, so a guest booking
// with a landline or an overseas number and no email would get no confirmation.
// The email box was already required here; what changed is that such a number is
// told why, beside the email box, and so is the management app's own refusal.
describe('ManagementEventBookingForm and a number that cannot take texts', () => {
  const NON_MOBILE_MESSAGE = 'We can only text UK mobile numbers, so please add an email for your confirmation.'
  const EVENT = { id: 'event-fixture', name: 'Test event', startDate: '2999-01-01T19:00:00Z', payment_mode: 'free' as const }
  let previousFetch: typeof global.fetch

  beforeEach(() => {
    previousFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = previousFetch
  })

  function fillWithout(phone: string, email: string) {
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: phone } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: email } })
  }

  it('asks for an email beside the email box for a landline, and sends nothing', async () => {
    const post = jest.fn()
    global.fetch = post as unknown as typeof fetch
    render(<ManagementEventBookingForm event={EVENT} />)
    fillWithout('01753 682707', '')

    // Past the browser's own check on the required box, to reach the form's.
    fireEvent.submit(screen.getByLabelText('First name').closest('form')!)

    const emailBox = screen.getByLabelText('Email address')
    await waitFor(() => expect(emailBox).toHaveAccessibleDescription(NON_MOBILE_MESSAGE))
    expect(emailBox).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(emailBox).toHaveFocus())
    expect(post).not.toHaveBeenCalled()
    expect(screen.queryByText('Booking not completed')).not.toBeInTheDocument()

    // Typing an address clears it.
    fireEvent.change(emailBox, { target: { value: 'jane@example.com' } })
    expect(emailBox).not.toHaveAttribute('aria-invalid')
  })

  it('keeps its usual words for a UK mobile with no email', async () => {
    global.fetch = jest.fn() as unknown as typeof fetch
    render(<ManagementEventBookingForm event={EVENT} />)
    fillWithout('07700900000', '')

    fireEvent.submit(screen.getByLabelText('First name').closest('form')!)

    expect(await screen.findByText('Please enter your email address so we can send your confirmation.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).not.toHaveAttribute('aria-invalid')
  })

  it("shows the management app's refusal of such a number beside the email box", async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (String(input) === '/api/event-bookings') {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'EMAIL_REQUIRED_FOR_NON_MOBILE',
              message: `${NON_MOBILE_MESSAGE} Call 01753 682707 if you need help.`
            }
          }),
          { status: 400 }
        )
      }
      throw new Error(`Unexpected fetch call: ${String(input)}`)
    }) as unknown as typeof fetch
    render(<ManagementEventBookingForm event={EVENT} />)
    fillWithout('07700900000', 'jane@example.com')

    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

    const emailBox = screen.getByLabelText('Email address')
    await waitFor(() => expect(emailBox).toHaveAccessibleDescription(NON_MOBILE_MESSAGE))
    expect(screen.queryByText('Booking not completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Event booking confirmed')).not.toBeInTheDocument()
  })
})
