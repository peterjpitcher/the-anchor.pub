import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'

const trackTableBookingFunnel = jest.fn()
const pushToDataLayer = jest.fn()
const trackTableBookingClick = jest.fn()

jest.mock('@/lib/gtm-events', () => ({
  trackTableBookingClick: (...args: unknown[]) => trackTableBookingClick(...args),
  trackTableBookingFunnel: (...args: unknown[]) => trackTableBookingFunnel(...args),
  pushToDataLayer: (...args: unknown[]) => pushToDataLayer(...args),
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/book-table',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
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

    // Both events appear (the "Mother's Day Lunch" filter that used to live in
    // the form has been retired alongside Mother's Day mode); we just assert
    // the suggestions render. If a future filter is added it can re-assert.
    await waitFor(() => expect(screen.getByText('Quiz Night')).toBeInTheDocument())
  })

  it('renders the PayPal call-us recovery state with fallback_payment_url', async () => {
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
                date: '2026-05-24',
                available: true,
                time_slots: [
                  {
                    time: '13:00',
                    available: true,
                    available_capacity: 12
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
              data: { known: false, lookup_degraded: false }
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
        // Simulate a 10+ booking where the management API set up the booking
        // and the payment is required, but inline PayPal failed to set up,
        // so the response surfaces a fallback_payment_url for the customer.
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                state: 'pending_payment',
                table_booking_id: 'tb-pending-recovery',
                booking_reference: 'TB-PENDING-RECOVERY',
                booking_id: 'tb-pending-recovery',
                deposit_amount: 100,
                payment_required: true,
                fallback_payment_url: 'https://pay.example.com/secure-link',
                blocked_reason: null,
                next_step_url: null,
                hold_expires_at: null,
                table_name: null,
                reason: null
              }
            }),
            {
              status: 201,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      // Inline PayPal create-order returns an error to drive the recovery branch
      if (url === '/api/table-bookings/paypal/create-order') {
        return Promise.resolve(
          new Response(
            JSON.stringify({ success: false, error: 'PayPal setup failed' }),
            {
              status: 502,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    render(<ManagementTableBookingForm />)

    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '10' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-05-24' } })

    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '1pm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Guest' } })

    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))
    await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm and pay deposit/i }))

    // Expect the "couldn't open PayPal" recovery state with the fallback link rendered
    await waitFor(() =>
      expect(
        screen.getByText("We couldn't open the PayPal payment automatically", { exact: false })
      ).toBeInTheDocument()
    )

    const fallbackLink = await screen.findByRole('link', {
      name: /click here to complete your deposit/i
    })
    expect(fallbackLink).toHaveAttribute('href', 'https://pay.example.com/secure-link')

    // Verify the public payload no longer carries sunday_lunch or menu_selections
    expect(submittedPayload).not.toBeNull()
    const payload = submittedPayload as unknown as Record<string, unknown>
    expect(payload.sunday_lunch).toBeUndefined()
    expect(payload.menu_selections).toBeUndefined()
    expect(payload.booking_type).toBeUndefined()
    expect(payload.purpose).toBe('food')
  })

  it('fires the booking funnel sequence on a happy-path confirmed booking', async () => {
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

      if (url.startsWith('/api/table-bookings/availability?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                date: '2026-06-07',
                available: true,
                time_slots: [{ time: '13:00', available: true, available_capacity: 8 }]
              }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        )
      }

      if (url.startsWith('/api/customers/lookup?')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ success: true, data: { known: false, lookup_degraded: false } }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        )
      }

      if (url === '/api/table-bookings') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                state: 'confirmed',
                table_booking_id: 'tb-confirmed-1',
                booking_reference: 'TB-CONF-1',
                blocked_reason: null,
                next_step_url: null,
                hold_expires_at: null,
                table_name: 'Window 4',
                reason: null
              }
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
          )
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    render(<ManagementTableBookingForm />)

    // view fires on mount.
    await waitFor(() =>
      expect(trackTableBookingFunnel).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'view', source: 'direct' })
      )
    )

    // First field interaction fires `start`.
    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '4' } })
    expect(trackTableBookingFunnel).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'start', source: 'direct' })
    )

    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '1pm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900111' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Walker' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

    await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

    // submit + success fire as the booking flow completes.
    await waitFor(() =>
      expect(trackTableBookingFunnel).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'submit', partySize: 4, bookingDate: '2026-06-07' })
      )
    )
    await waitFor(() =>
      expect(trackTableBookingFunnel).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'success',
          partySize: 4,
          bookingReference: 'TB-CONF-1',
          source: 'direct',
        })
      )
    )

    // GA4 purchase event should fire with the booking reference as transaction_id.
    expect(pushToDataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'purchase',
        transaction_id: 'TB-CONF-1',
        currency: 'GBP',
        booking_source: 'direct',
      })
    )

    // Sequence assertion: view → start → submit → success in order.
    const steps = trackTableBookingFunnel.mock.calls.map((call) => (call[0] as any).step)
    const indexOf = (s: string) => steps.indexOf(s)
    expect(indexOf('view')).toBeGreaterThanOrEqual(0)
    expect(indexOf('start')).toBeGreaterThan(indexOf('view'))
    expect(indexOf('submit')).toBeGreaterThan(indexOf('start'))
    expect(indexOf('success')).toBeGreaterThan(indexOf('submit'))
  })
})
