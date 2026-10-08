import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { BookingConfirmedCard } from '@/components/features/TableBooking/BookingConfirmedCard'
import type { ManagementTableBookingResult } from '@/lib/table-booking/submission'

/**
 * "We've sent you a message" is said only when the booking system says one went.
 *
 * The management app answers a table booking and an event booking with
 * `notification_sent` (its PR #199). These tests render the two confirmation
 * screens against every answer that does not say `true` and assert that no
 * message is claimed and the phone number is given instead.
 *
 * Nothing here reaches the network: fetch is replaced, an unexpected address
 * throws, and the PayPal and Turnstile widgets are stand-ins.
 */

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn(),
  trackEventBookingComplete: jest.fn(),
  trackEventBookingFunnelStep: jest.fn(),
  trackDirectionsClick: jest.fn(),
  trackAddToCalendarClick: jest.fn(),
}))

jest.mock('@marsidev/react-turnstile', () => {
  const React = require('react')
  return {
    Turnstile: React.forwardRef(function MockTurnstile(_props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({ reset: jest.fn() }))
      return <div data-testid="turnstile-widget" />
    }),
  }
})

// A PayPal button a test can press: it stands for the guest approving payment.
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: (props: any) => <div>{props.children}</div>,
  PayPalButtons: (props: any) => (
    <button type="button" onClick={() => props.onApprove({ orderID: 'ORDER-TEST-1' })}>
      Approve test payment
    </button>
  ),
}))

const PHONE_LINE = "If you'd like it confirmed by a person, call 01753 682707."

// Every way an answer can fail to say "a message went".
const NOT_SENT: Array<[string, Record<string, unknown>]> = [
  ['notification_sent false', { notification_sent: false, notification_channel: null }],
  ['notification_sent false beside a channel', { notification_sent: false, notification_channel: 'email' }],
  ['a channel but no notification_sent', { notification_channel: 'sms' }],
  ['neither field', {}],
  ['notification_sent null', { notification_sent: null }],
  ['notification_sent as the string "true"', { notification_sent: 'true', notification_channel: 'email' }],
]

function expectNoMessageClaimed(): void {
  expect(screen.queryByText(/We've sent/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/on its way/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/by (email|SMS|WhatsApp)\./i)).not.toBeInTheDocument()
}

describe('event booking confirmation', () => {
  const originalFetch = global.fetch
  const EVENT = {
    id: 'evt-notice',
    name: 'Quiz Night',
    slug: 'quiz-night-2999-01-01',
    startDate: '2999-01-01T19:00:00Z',
  }

  function respondWith(bookingData: Record<string, unknown>, capture?: { status: number; body: unknown }): jest.Mock {
    const mock = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : String(input)
      if (url.startsWith('/api/customers/lookup')) {
        return new Response(JSON.stringify({ success: true, data: { known: false, lookup_degraded: false } }), { status: 200 })
      }
      if (url === '/api/event-bookings') {
        return new Response(JSON.stringify({ success: true, data: bookingData }), { status: 200 })
      }
      if (url === '/api/event-bookings/paypal/capture-order' && capture) {
        return new Response(JSON.stringify(capture.body), { status: capture.status })
      }
      throw new Error(`Unexpected fetch call: ${url}`)
    })
    ;(global as any).fetch = mock
    return mock
  }

  function submitBooking(eventOverrides: Record<string, unknown> = {}): void {
    render(<ManagementEventBookingForm event={{ ...EVENT, ...eventOverrides }} />)
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    screen
      .queryAllByLabelText(/ticket \d+ full name/i)
      .forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
  }

  const confirmed = (notice: Record<string, unknown>) => ({
    state: 'confirmed',
    booking_id: 'booking-notice',
    reason: null,
    seats_remaining: 4,
    next_step_url: null,
    manage_booking_url: null,
    ...notice,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  afterEach(() => {
    global.fetch = originalFetch
    delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  })

  it.each([
    ['email', "We've sent confirmation details by email."],
    ['sms', "We've sent confirmation details by SMS."],
  ])('names the channel when the booking system says a message went by %s', async (channel, sentence) => {
    respondWith(confirmed({ notification_sent: true, notification_channel: channel }))

    submitBooking()
    await screen.findByText('Event booking confirmed')

    expect(screen.getByText(sentence)).toBeInTheDocument()
    expect(screen.queryByText(PHONE_LINE)).not.toBeInTheDocument()
  })

  it.each(NOT_SENT)('with %s it confirms the booking, gives the number and claims no message', async (_label, notice) => {
    respondWith(confirmed(notice))

    submitBooking()
    await screen.findByText('Event booking confirmed')

    // The booking itself is still confirmed, in so many words.
    expect(screen.getByText(/are confirmed for Quiz Night\./)).toBeInTheDocument()
    expect(screen.getByText(PHONE_LINE)).toBeInTheDocument()
    expectNoMessageClaimed()
  })

  it('does not carry "sent" from the held booking over to the paid one', async () => {
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-paypal-client-id'
    // The held booking's answer says a message went (the payment link). The
    // payment answer says nothing about a confirmation, so nor may the screen.
    respondWith(
      {
        state: 'pending_payment',
        booking_id: '11111111-1111-4111-8111-111111111111',
        reason: null,
        seats_remaining: 4,
        next_step_url: 'https://management.orangejelly.co.uk/pay/booking-notice',
        manage_booking_url: null,
        notification_sent: true,
        notification_channel: 'email',
      },
      { status: 200, body: { success: true, state: 'confirmed' } }
    )

    submitBooking({ payment_mode: 'prepaid', price_per_seat: 6 })
    await screen.findByText('Your seats are currently on hold.')
    // On hold is not confirmed: nothing about a confirmation message yet.
    expectNoMessageClaimed()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Approve test payment' }))
    })

    await waitFor(() => expect(screen.getByText('Event booking confirmed')).toBeInTheDocument())
    expect(screen.getByText(PHONE_LINE)).toBeInTheDocument()
    expectNoMessageClaimed()
  })
})

describe('table booking confirmation card', () => {
  const base: ManagementTableBookingResult = {
    state: 'confirmed',
    table_booking_id: 'tb-1',
    booking_reference: 'TB-NOTICE',
    reason: null,
    blocked_reason: null,
    next_step_url: null,
    hold_expires_at: null,
    table_name: null,
  }

  function renderCard(notice: Record<string, unknown>): void {
    render(
      <BookingConfirmedCard
        result={{ ...base, ...notice } as ManagementTableBookingResult}
        partySize={2}
        date="2999-01-01"
        time="19:00"
        onBookAnother={jest.fn()}
      />
    )
  }

  it.each([
    ['email', /We've sent confirmation details by email\./],
    ['sms', /We've sent confirmation details by SMS\./],
    ['whatsapp', /We've sent confirmation details by WhatsApp\./],
  ])('names the channel when a message went by %s', (channel, sentence) => {
    renderCard({ notification_sent: true, notification_channel: channel })

    expect(screen.getByText(sentence)).toBeInTheDocument()
    expect(screen.getByText('TB-NOTICE')).toBeInTheDocument()
  })

  it.each(NOT_SENT)('with %s it says the table is booked, gives the number and claims no message', (_label, notice) => {
    renderCard(notice)

    expect(screen.getByText("You're all booked in, see you soon!")).toBeInTheDocument()
    expect(
      screen.getByText(/Your table is booked\. If you'd like it confirmed by a person, call 01753 682707\./)
    ).toBeInTheDocument()
    expectNoMessageClaimed()
  })
})
