import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'

/**
 * BK-191 (customer bookings review of 24 October 2026): the only paid event on sale had no
 * bookings and nobody reached the payment step, and nothing could say whether people opened the
 * form and gave up or could not submit it. The form now signals opened, submit pressed, blocked
 * (and why) and sent. Codes only.
 */

const mockSignal = jest.fn()
jest.mock('@/lib/booking-form-signal', () => ({
  sendEventBookingFormSignal: (...args: unknown[]) => mockSignal(...args)
}))

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn(),
  trackEventBookingComplete: jest.fn(),
  trackEventBookingFunnelStep: jest.fn(),
  trackDirectionsClick: jest.fn(),
  trackAddToCalendarClick: jest.fn()
}))

jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: (props: { children?: unknown }) => <div data-testid="paypal-provider">{props.children as never}</div>,
  PayPalButtons: () => <div data-testid="paypal-buttons" />
}))

const EVENT = { id: 'event-fixture', name: 'Test event', startDate: '2999-01-01T19:00:00Z', payment_mode: 'free' } as const

function fillGuest() {
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
  screen.queryAllByLabelText(/ticket \d+ full name/i).forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
  fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900000' } })
}

function answerBooking(status: number, body: unknown) {
  ;(global as unknown as { fetch: jest.Mock }).fetch = jest.fn(async (input: RequestInfo | URL) => {
    if (String(input) === '/api/event-bookings') {
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    }
    throw new Error(`Unexpected fetch call: ${String(input)}`)
  })
}

function signals(): unknown[][] {
  return mockSignal.mock.calls
}

beforeEach(() => {
  mockSignal.mockClear()
})

describe('event booking form signals', () => {
  it('says once that the form was opened', () => {
    const { rerender } = render(<ManagementEventBookingForm event={EVENT} />)
    rerender(<ManagementEventBookingForm event={EVENT} />)

    expect(signals()).toEqual([['opened']])
  })

  it('says nothing when online sales are closed', () => {
    render(<ManagementEventBookingForm event={EVENT} bookingClosed />)
    expect(signals()).toEqual([])
  })

  it('a booking that goes through: pressed, then sent', async () => {
    answerBooking(201, { success: true, data: { state: 'confirmed', booking_id: 'b-1' } })
    render(<ManagementEventBookingForm event={EVENT} />)
    fillGuest()
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
    await screen.findByText('Event booking confirmed')

    await waitFor(() => expect(signals()).toEqual([['opened'], ['submit_pressed'], ['sent']]))
  })

  it('a booking the booking system refuses: pressed, then blocked as server_refused', async () => {
    answerBooking(409, { success: false, error: { code: 'POLICY_VIOLATION', message: 'Sunday lunch only' } })
    render(<ManagementEventBookingForm event={EVENT} />)
    fillGuest()
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))
    await screen.findByText('Sunday lunch only')

    await waitFor(() => expect(signals()).toEqual([['opened'], ['submit_pressed'], ['blocked', 'server_refused']]))
  })

  it('a booking lost on the way: blocked as network', async () => {
    ;(global as unknown as { fetch: jest.Mock }).fetch = jest.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    render(<ManagementEventBookingForm event={EVENT} />)
    fillGuest()
    fireEvent.click(screen.getByRole('button', { name: 'Book a table' }))

    await waitFor(() => expect(signals()).toEqual([['opened'], ['submit_pressed'], ['blocked', 'network']]))
  })

  it('a form stopped here before sending: blocked as missing_fields, and nothing sent', async () => {
    answerBooking(201, { success: true, data: { state: 'confirmed', booking_id: 'b-1' } })
    render(<ManagementEventBookingForm event={EVENT} />)
    fireEvent.submit(screen.getByRole('button', { name: 'Book a table' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(signals()).toEqual([['opened'], ['submit_pressed'], ['blocked', 'missing_fields']]))
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
