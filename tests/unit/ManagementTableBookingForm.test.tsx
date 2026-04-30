import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

type TimeSlot = {
  time: string
  available: boolean
  available_capacity: number
  kitchen_open?: boolean
}

type AvailabilityHandler = (url: string) => {
  date?: string
  time_slots: TimeSlot[]
} | null

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
}

function setupFetchMock(options: {
  availability: AvailabilityHandler | TimeSlot[]
  bookingResponse?: { state: string; [k: string]: unknown }
  capturePayload?: { ref: { current: Record<string, unknown> | null } }
  captureUrl?: { ref: { current: string | null } }
  captureHeaders?: { ref: { current: Record<string, string> | null } }
  captureBookingHistory?: {
    ref: { current: Array<{ headers: Record<string, string>; body: Record<string, unknown> }> }
  }
  bookingHandler?: (
    init: RequestInit | undefined,
    callIndex: number
  ) => Promise<Response> | Response | null
}): jest.Mock {
  let bookingCallCount = 0
  const fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.startsWith('/api/events?')) {
      return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
    }

    if (url.startsWith('/api/table-bookings/availability')) {
      if (options.captureUrl) options.captureUrl.ref.current = url
      let result: { date?: string; time_slots: TimeSlot[] } | null
      if (typeof options.availability === 'function') {
        result = options.availability(url)
      } else {
        result = { time_slots: options.availability }
      }

      if (!result) {
        return Promise.resolve(
          jsonResponse({
            success: true,
            data: { date: '', available: false, time_slots: [] }
          })
        )
      }

      return Promise.resolve(
        jsonResponse({
          success: true,
          data: {
            date: result.date ?? '',
            available: result.time_slots.some((s) => s.available),
            time_slots: result.time_slots
          }
        })
      )
    }

    if (url.startsWith('/api/customers/lookup?')) {
      return Promise.resolve(
        jsonResponse({ success: true, data: { known: false, lookup_degraded: false } })
      )
    }

    if (url === '/api/table-bookings') {
      const headersIn: Record<string, string> = {}
      const rawHeaders = init?.headers
      if (rawHeaders) {
        if (rawHeaders instanceof Headers) {
          rawHeaders.forEach((value, key) => {
            headersIn[key.toLowerCase()] = value
          })
        } else if (Array.isArray(rawHeaders)) {
          for (const [key, value] of rawHeaders) {
            headersIn[key.toLowerCase()] = value
          }
        } else {
          for (const [key, value] of Object.entries(rawHeaders as Record<string, string>)) {
            headersIn[key.toLowerCase()] = value
          }
        }
      }
      const parsedBody = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>
      if (options.capturePayload) {
        options.capturePayload.ref.current = parsedBody
      }
      if (options.captureHeaders) {
        options.captureHeaders.ref.current = headersIn
      }
      if (options.captureBookingHistory) {
        options.captureBookingHistory.ref.current.push({ headers: headersIn, body: parsedBody })
      }
      const callIndex = bookingCallCount
      bookingCallCount += 1
      if (options.bookingHandler) {
        const handlerResult = options.bookingHandler(init, callIndex)
        if (handlerResult) return Promise.resolve(handlerResult)
      }
      const body = options.bookingResponse || {
        state: 'confirmed',
        table_booking_id: 'tb-1',
        booking_reference: 'TB-1',
        blocked_reason: null,
        next_step_url: null,
        hold_expires_at: null,
        table_name: 'Window 4',
        reason: null
      }
      return Promise.resolve(jsonResponse({ success: true, data: body }, { status: 201 }))
    }

    if (url === '/api/table-bookings/paypal/create-order') {
      return Promise.resolve(jsonResponse({ success: false, error: 'Not used' }, { status: 502 }))
    }

    return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
  })

  ;(global as any).fetch = fetchMock
  return fetchMock
}

// jsdom does not implement scrollIntoView natively. The wizard mount-guarded
// effect calls it on step transitions, so install a no-op for every test.
beforeAll(() => {
  if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
    ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
  }
})

describe('ManagementTableBookingForm', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not render the "Booking for" chooser', async () => {
    setupFetchMock({ availability: [] })
    render(<ManagementTableBookingForm />)
    expect(screen.queryByLabelText(/booking for/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Food \(kitchen hours\)/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Drinks \(bar hours\)/i)).not.toBeInTheDocument()
  })

  it('does not render the dining disclaimer footer', async () => {
    setupFetchMock({ availability: [] })
    render(<ManagementTableBookingForm prefill={{ date: '2026-06-07' }} />)
    expect(
      screen.queryByText(/any time during bar hours/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Tables booked here are for dining/i)
    ).not.toBeInTheDocument()
  })

  it('does not include purpose in the availability fetch URL', async () => {
    const captureUrl = { ref: { current: null as string | null } }
    setupFetchMock({
      availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
      captureUrl
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(captureUrl.ref.current).not.toBeNull())
    expect(captureUrl.ref.current).not.toMatch(/purpose=/)
  })

  it('renders "Drinks & food" caption on kitchen-open slots and "Drinks only" on others', async () => {
    setupFetchMock({
      availability: [
        { time: '19:00', available: true, available_capacity: 4, kitchen_open: true },
        { time: '22:00', available: true, available_capacity: 4, kitchen_open: false }
      ]
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

    const earlyButton = screen.getByRole('button', { name: /7pm/ })
    const lateButton = screen.getByRole('button', { name: /10pm/ })
    expect(within(earlyButton).getByText(/drinks & food/i)).toBeInTheDocument()
    expect(within(lateButton).getByText(/drinks only/i)).toBeInTheDocument()
  })

  it('does not render the "Showing X slots" purpose-flavoured caption', async () => {
    setupFetchMock({
      availability: [
        { time: '19:00', available: true, available_capacity: 4, kitchen_open: true }
      ]
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    expect(screen.queryByText(/Showing.+slots/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/drinks-only slots/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/food slots/i)).not.toBeInTheDocument()
  })

  it('submits purpose: food when a kitchen-open slot is chosen', async () => {
    const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
    setupFetchMock({
      availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }],
      capturePayload
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /7pm/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Walker' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

    await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

    await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
    expect(capturePayload.ref.current).toMatchObject({ purpose: 'food' })
  })

  it('submits purpose: drinks when a kitchen-closed slot is chosen', async () => {
    const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
    setupFetchMock({
      availability: [{ time: '22:00', available: true, available_capacity: 4, kitchen_open: false }],
      capturePayload
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /10pm/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Walker' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

    await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

    await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
    expect(capturePayload.ref.current).toMatchObject({ purpose: 'drinks' })
  })

  it('preserves kitchen_open through nearest-alternative selection', async () => {
    const capturePayload = { ref: { current: null as Record<string, unknown> | null } }

    // Primary date returns no available slots; alternative date returns a late
    // kitchen-closed slot. The wizard must carry kitchen_open through the
    // alternative and submit purpose: 'drinks'.
    setupFetchMock({
      availability: (url) => {
        const params = new URL(url, 'https://t.test').searchParams
        const date = params.get('date')
        if (date === '2026-06-07') {
          return { date: '2026-06-07', time_slots: [] }
        }
        if (date === '2026-06-08') {
          return {
            date: '2026-06-08',
            time_slots: [
              { time: '22:30', available: true, available_capacity: 6, kitchen_open: false }
            ]
          }
        }
        return { date: date || '', time_slots: [] }
      },
      capturePayload
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    // Wait for nearest alternatives to surface
    const alternativeButton = await screen.findByRole('button', { name: /10:30pm/i })
    fireEvent.click(alternativeButton)

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Walker' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

    await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

    await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
    expect(capturePayload.ref.current).toMatchObject({ purpose: 'drinks' })
  })

  it('does not show booking-purpose wording on review or confirmation', async () => {
    setupFetchMock({
      availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party Size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /7pm/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Walker' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

    await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
    expect(screen.queryByText(/booking for/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/food booking/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/drinks booking/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/switch between food and drinks/i)).not.toBeInTheDocument()
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

    render(<ManagementTableBookingForm prefill={{ date: '2026-03-15' }} />)

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
                    available_capacity: 12,
                    kitchen_open: true
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
    fireEvent.click(screen.getByRole('button', { name: /1pm/ }))
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
                time_slots: [
                  { time: '13:00', available: true, available_capacity: 8, kitchen_open: true }
                ]
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
    fireEvent.click(screen.getByRole('button', { name: /1pm/ }))
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

  describe('Step 2 slot window + party-size threading', () => {
    function makeAvailabilitySlots(
      start: string,
      count: number,
      options: { kitchenClosesAt?: string; capacity?: number } = {}
    ): TimeSlot[] {
      const { kitchenClosesAt, capacity = 10 } = options
      const [hh, mm] = start.split(':').map((part) => Number.parseInt(part, 10))
      const startMinutes = hh * 60 + mm
      const closeMinutes = kitchenClosesAt
        ? Number.parseInt(kitchenClosesAt.split(':')[0], 10) * 60 +
          Number.parseInt(kitchenClosesAt.split(':')[1], 10)
        : null
      return Array.from({ length: count }, (_, idx) => {
        const total = startMinutes + idx * 30
        const hours = String(Math.floor(total / 60)).padStart(2, '0')
        const minutes = String(total % 60).padStart(2, '0')
        const time = `${hours}:${minutes}`
        const kitchen_open = closeMinutes === null ? true : total < closeMinutes
        return { time, available: true, available_capacity: capacity, kitchen_open }
      })
    }

    async function searchForTable(
      overrides: { partySize?: string; date?: string; requestedTime?: string } = {}
    ) {
      const partySize = overrides.partySize ?? '2'
      const date = overrides.date ?? '2026-06-07'
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: partySize } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: date } })
      if (overrides.requestedTime) {
        fireEvent.change(screen.getByLabelText('Preferred Time'), {
          target: { value: overrides.requestedTime }
        })
      }
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    }

    function getSlotButtons(): HTMLElement[] {
      return screen.queryAllByRole('button', { name: /Drinks/i })
    }

    it('renders only 7 slots centred on the preferred time and shows "See more times"', async () => {
      setupFetchMock({ availability: makeAvailabilitySlots('12:00', 22) })

      render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      // Anchor 19:00 → window 17:30..20:30 = 5:30pm..8:30pm.
      expect(screen.getByRole('button', { name: /5:30pm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /6pm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /6:30pm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /7pm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /7:30pm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /8pm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /8:30pm/i })).toBeInTheDocument()

      // 12pm and 10:30pm are outside the window.
      expect(screen.queryByRole('button', { name: /^12pm/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /10:30pm/i })).not.toBeInTheDocument()

      expect(getSlotButtons()).toHaveLength(7)
      expect(screen.getByRole('button', { name: /See more times/i })).toBeInTheDocument()
    })

    it('expanding "See more times" reveals all available slots and hides the expander', async () => {
      setupFetchMock({ availability: makeAvailabilitySlots('12:00', 22) })

      render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      fireEvent.click(screen.getByRole('button', { name: /See more times/i }))

      expect(screen.getByRole('button', { name: /^12pm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /10:30pm/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /See more times/i })).not.toBeInTheDocument()
    })

    it('does not render the expander when 5 or 7 slots are available', async () => {
      // 5 slots
      setupFetchMock({ availability: makeAvailabilitySlots('19:00', 5) })
      const view = render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      expect(getSlotButtons()).toHaveLength(5)
      expect(screen.queryByRole('button', { name: /See more times/i })).not.toBeInTheDocument()

      view.unmount()
      jest.clearAllMocks()

      // 7 slots
      setupFetchMock({ availability: makeAvailabilitySlots('19:00', 7) })
      render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      expect(getSlotButtons()).toHaveLength(7)
      expect(screen.queryByRole('button', { name: /See more times/i })).not.toBeInTheDocument()
    })

    it('expanded grid stays expanded and does not re-centre when selecting a slot', async () => {
      setupFetchMock({ availability: makeAvailabilitySlots('12:00', 22) })

      render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      fireEvent.click(screen.getByRole('button', { name: /See more times/i }))
      expect(screen.getByRole('button', { name: /^12pm/i })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /10:30pm/i }))

      // 12pm still visible because expansion was not collapsed.
      expect(screen.getByRole('button', { name: /^12pm/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /See more times/i })).not.toBeInTheDocument()
      // Continue button surfaces once a slot is selected.
      expect(screen.getByRole('button', { name: /^Continue$/i })).toBeInTheDocument()
    })

    it('selecting an edge slot does not re-centre the collapsed window', async () => {
      setupFetchMock({ availability: makeAvailabilitySlots('12:00', 22) })

      render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      // Edge slot at 8:30pm (= 20:30, last in window).
      fireEvent.click(screen.getByRole('button', { name: /8:30pm/i }))

      // Window still anchored on 19:00 → 5:30pm visible, 9pm not visible.
      expect(screen.getByRole('button', { name: /5:30pm/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^9pm/i })).not.toBeInTheDocument()
      // Continue indicates the slot was selected without disturbing the window.
      expect(screen.getByRole('button', { name: /^Continue$/i })).toBeInTheDocument()
    })

    it('changing date collapses the expanded grid', async () => {
      setupFetchMock({
        availability: (url) => {
          const params = new URL(url, 'https://t.test').searchParams
          const date = params.get('date')
          return { date: date ?? '', time_slots: makeAvailabilitySlots('12:00', 22) }
        }
      })

      render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      fireEvent.click(screen.getByRole('button', { name: /See more times/i }))
      expect(screen.getByRole('button', { name: /^12pm/i })).toBeInTheDocument()

      // Back to find step
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      // Change the date and search again
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-08' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

      // Collapsed back to 7-slot window.
      expect(getSlotButtons()).toHaveLength(7)
      expect(screen.getByRole('button', { name: /See more times/i })).toBeInTheDocument()
    })

    it('changing party size collapses the expanded grid', async () => {
      setupFetchMock({ availability: makeAvailabilitySlots('12:00', 22) })

      render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      fireEvent.click(screen.getByRole('button', { name: /See more times/i }))
      expect(screen.getByRole('button', { name: /^12pm/i })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '4' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

      expect(getSlotButtons()).toHaveLength(7)
      expect(screen.getByRole('button', { name: /See more times/i })).toBeInTheDocument()
    })

    it('changing preferred time collapses and re-centres the window', async () => {
      setupFetchMock({ availability: makeAvailabilitySlots('12:00', 22) })

      render(<ManagementTableBookingForm />)
      await searchForTable({ requestedTime: '19:00' })

      fireEvent.click(screen.getByRole('button', { name: /See more times/i }))
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))

      fireEvent.change(screen.getByLabelText('Preferred Time'), { target: { value: '22:00' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

      // 22:00 → window 19:30..22:30 = 7:30pm..10:30pm.
      expect(screen.getByRole('button', { name: /7:30pm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /10:30pm/i })).toBeInTheDocument()
      // Earlier slots no longer visible.
      expect(screen.queryByRole('button', { name: /^12pm/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /5:30pm/i })).not.toBeInTheDocument()
    })

    it('uses the freshly-typed party size in the availability URL even without onBlur', async () => {
      const captureUrl = { ref: { current: null as string | null } }
      setupFetchMock({
        availability: makeAvailabilitySlots('12:00', 22, { capacity: 12 }),
        captureUrl
      })

      render(<ManagementTableBookingForm />)
      // Type 10 but DO NOT blur — onChange fires, but stale-closure paths would still see 2.
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '10' } })
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
      fireEvent.change(screen.getByLabelText('Preferred Time'), { target: { value: '19:00' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(captureUrl.ref.current).not.toBeNull())
      expect(captureUrl.ref.current).toMatch(/party_size=10/)
      expect(captureUrl.ref.current).not.toMatch(/party_size=2/)
    })
  })

  describe('London timezone correctness', () => {
    beforeEach(() => {
      // 2026-04-29T23:30:00Z = 2026-04-30 00:30 BST in London.
      jest.useFakeTimers().setSystemTime(new Date('2026-04-29T23:30:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('date input min and default are London today (2026-04-30), not UTC (2026-04-29)', async () => {
      setupFetchMock({ availability: [] })
      render(<ManagementTableBookingForm />)

      const dateInput = screen.getByLabelText('Date') as HTMLInputElement
      expect(dateInput.min).toBe('2026-04-30')
      expect(dateInput.value).toBe('2026-04-30')
    })

    it('Preferred Time default is computed from London now (00:30 + 60 → 01:30)', async () => {
      setupFetchMock({ availability: [] })
      render(<ManagementTableBookingForm />)

      const timeInput = screen.getByLabelText('Preferred Time') as HTMLInputElement
      expect(timeInput.value).toBe('01:30')
    })

    it('past-date validation uses London today: 2026-04-29 rejected, 2026-04-30 allowed', async () => {
      const captureUrl = { ref: { current: null as string | null } }
      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        captureUrl
      })

      render(<ManagementTableBookingForm />)

      const dateInput = screen.getByLabelText('Date') as HTMLInputElement
      // 2026-04-29 is yesterday in London — should be rejected with no fetch.
      fireEvent.change(dateInput, { target: { value: '2026-04-29' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() =>
        expect(screen.getByText(/please select a future date/i)).toBeInTheDocument()
      )
      expect(captureUrl.ref.current).toBeNull()

      // 2026-04-30 is today in London — should be allowed.
      fireEvent.change(dateInput, { target: { value: '2026-04-30' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(captureUrl.ref.current).not.toBeNull())
    })

    it('toIsoDateInputValue respects London for full date-time prefill values', async () => {
      setupFetchMock({ availability: [] })
      // Prefill with a UTC datetime equivalent to 2026-04-30 00:30 BST in London.
      render(<ManagementTableBookingForm prefill={{ date: '2026-04-29T23:30:00Z' }} />)

      const dateInput = screen.getByLabelText('Date') as HTMLInputElement
      expect(dateInput.value).toBe('2026-04-30')
    })

    it('submitted POST body date matches the London date input', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        capturePayload
      })

      render(<ManagementTableBookingForm />)

      // Default Date input is London today (2026-04-30); leave it as-is.
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: /1pm/i }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Walker' } })
      fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

      await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
      expect(capturePayload.ref.current).toMatchObject({ date: '2026-04-30' })
    })
  })

  describe('Mobile optimisation', () => {
    it('Party Size input has inputMode="numeric" and pattern="[0-9]*"', () => {
      setupFetchMock({ availability: [] })
      render(<ManagementTableBookingForm />)

      const partySize = screen.getByLabelText('Party Size') as HTMLInputElement
      expect(partySize.inputMode).toBe('numeric')
      expect(partySize.pattern).toBe('[0-9]*')
    })

    it('Mobile Number input has inputMode="tel" and autoComplete="tel"', async () => {
      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: /7pm/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      const phone = screen.getByLabelText('Mobile Number') as HTMLInputElement
      expect(phone.inputMode).toBe('tel')
      expect(phone.getAttribute('autocomplete')).toBe('tel')
    })

    it('First Name, Last Name, Email carry correct autoComplete and inputMode hints', async () => {
      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: /7pm/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())

      const firstName = screen.getByLabelText('First Name') as HTMLInputElement
      const lastName = screen.getByLabelText('Last Name') as HTMLInputElement
      const email = screen.getByLabelText('Email (optional)') as HTMLInputElement

      expect(firstName.getAttribute('autocomplete')).toBe('given-name')
      expect(lastName.getAttribute('autocomplete')).toBe('family-name')
      expect(email.inputMode).toBe('email')
      expect(email.getAttribute('autocomplete')).toBe('email')
    })

    it('slot button has aria-label combining time and service caption', async () => {
      setupFetchMock({
        availability: [
          { time: '19:00', available: true, available_capacity: 4, kitchen_open: true },
          { time: '22:00', available: true, available_capacity: 4, kitchen_open: false }
        ]
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

      const foodSlot = screen.getByRole('button', { name: /7pm, drinks and food/i })
      const drinksSlot = screen.getByRole('button', { name: /10pm, drinks only/i })
      expect(foodSlot).toBeInTheDocument()
      expect(drinksSlot).toBeInTheDocument()
    })

    it('slot button class includes min-h-14, alternative button class includes min-h-12', async () => {
      // Primary date returns no available slots; alternative date returns a late slot.
      setupFetchMock({
        availability: (url) => {
          const params = new URL(url, 'https://t.test').searchParams
          const date = params.get('date')
          if (date === '2026-06-07') {
            return { date: '2026-06-07', time_slots: [] }
          }
          if (date === '2026-06-08') {
            return {
              date: '2026-06-08',
              time_slots: [
                { time: '22:30', available: true, available_capacity: 6, kitchen_open: false }
              ]
            }
          }
          return { date: date || '', time_slots: [] }
        }
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

      // The alternative button (10:30pm on 2026-06-08) should be present and at least 48px tall.
      const altBtn = await screen.findByRole('button', { name: /10:30pm/i })
      expect(altBtn.className).toMatch(/min-h-12/)
      expect(altBtn.className).toMatch(/py-3/)
      expect(altBtn.className).toMatch(/text-base/)
    })

    it('booking-policy checkbox label is a 48 px tap target', async () => {
      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: /7pm/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Walker' } })
      fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

      await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())

      const checkbox = screen.getByRole('checkbox', { name: /I understand The Anchor/i })
      // Walk up to the wrapping <label> and assert min-h-12 is on it (or its inner row).
      const label = checkbox.closest('label') as HTMLLabelElement
      expect(label).not.toBeNull()
      expect(label.className).toMatch(/min-h-12/)
    })

    it('step transition triggers scrollIntoView with { block: "start" } and not on initial mount', async () => {
      // jsdom does not implement scrollIntoView; install a no-op so we can spy on it.
      if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
        ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
      }
      const scrollSpy = jest
        .spyOn(Element.prototype, 'scrollIntoView')
        .mockImplementation(() => undefined)

      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
      })

      render(<ManagementTableBookingForm />)
      // Initial mount must NOT trigger scrollIntoView.
      expect(scrollSpy).not.toHaveBeenCalled()

      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      // Entering step 'choose' should fire scrollIntoView once with { block: 'start' }.
      const calls = scrollSpy.mock.calls
      expect(calls.length).toBeGreaterThanOrEqual(1)
      expect(calls[0][0]).toEqual(expect.objectContaining({ block: 'start' }))

      // Advance to details — another scrollIntoView call.
      const beforeAdvance = scrollSpy.mock.calls.length
      fireEvent.click(screen.getByRole('button', { name: /7pm/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await waitFor(() => expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument())
      expect(scrollSpy.mock.calls.length).toBeGreaterThan(beforeAdvance)

      scrollSpy.mockRestore()
    })

    it('pressing Enter on Preferred Time submits the find-step form', async () => {
      const captureUrl = { ref: { current: null as string | null } }
      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        captureUrl
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-07' } })
      fireEvent.change(screen.getByLabelText('Preferred Time'), { target: { value: '13:00' } })

      // Submitting the surrounding <form> via the time input must trigger the search.
      const timeInput = screen.getByLabelText('Preferred Time') as HTMLInputElement
      const form = timeInput.closest('form') as HTMLFormElement
      expect(form).not.toBeNull()
      fireEvent.submit(form)

      await waitFor(() => expect(captureUrl.ref.current).not.toBeNull())
    })
  })

  describe('Submit-intent idempotency key', () => {
    async function fillFindAndProceedToReview(options: {
      partySize?: string
      date?: string
      slotName?: RegExp
      firstName?: string
      lastName?: string
      phone?: string
      notes?: string
    } = {}) {
      const partySize = options.partySize ?? '2'
      const date = options.date ?? '2026-06-07'
      const slotName = options.slotName ?? /1pm/i
      const firstName = options.firstName ?? 'Sam'
      const lastName = options.lastName ?? 'Walker'
      const phone = options.phone ?? '07700900000'

      fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: partySize } })
      fireEvent.blur(screen.getByLabelText('Party Size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: date } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: slotName }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: phone } })
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: firstName } })
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: lastName } })
      if (options.notes) {
        fireEvent.change(screen.getByLabelText(/Notes \(optional\)/i), { target: { value: options.notes } })
      }
      fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

      await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    }

    it('reuses Idempotency-Key across Confirm retries when the booking intent is unchanged', async () => {
      const history = {
        ref: {
          current: [] as Array<{ headers: Record<string, string>; body: Record<string, unknown> }>
        }
      }
      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        captureBookingHistory: history,
        bookingHandler: (_init, callIndex) => {
          if (callIndex === 0) {
            // First Confirm fails as if the network timed out.
            return jsonResponse(
              { success: false, error: 'Temporarily unavailable' },
              { status: 503 }
            )
          }
          return null
        }
      })

      render(<ManagementTableBookingForm />)
      await fillFindAndProceedToReview()

      // First Confirm: server fails, customer stays on review.
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(1))
      // Wait for the failure to propagate (loading clears, error surfaces).
      await waitFor(() =>
        expect(screen.getByText(/Temporarily unavailable/i)).toBeInTheDocument()
      )

      // Second Confirm: same intent, retried by customer.
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(2))

      const firstKey = history.ref.current[0].headers['idempotency-key']
      const secondKey = history.ref.current[1].headers['idempotency-key']
      expect(firstKey).toBeTruthy()
      expect(secondKey).toBeTruthy()
      expect(secondKey).toBe(firstKey)
    })

    it('issues a new Idempotency-Key after a fresh availability search (Book another)', async () => {
      const history = {
        ref: {
          current: [] as Array<{ headers: Record<string, string>; body: Record<string, unknown> }>
        }
      }
      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        captureBookingHistory: history
      })

      render(<ManagementTableBookingForm />)
      await fillFindAndProceedToReview({ date: '2026-06-07' })
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(1))
      await waitFor(() => expect(screen.getByText(/all booked in/i)).toBeInTheDocument())

      // Book another → resetJourney must clear the cached key. Then run a brand
      // new search on a different date and confirm again.
      fireEvent.click(screen.getByRole('button', { name: /Book another table/i }))
      await waitFor(() => expect(screen.getByLabelText('Date')).toBeInTheDocument())
      await fillFindAndProceedToReview({ date: '2026-06-08' })
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(2))

      const firstKey = history.ref.current[0].headers['idempotency-key']
      const secondKey = history.ref.current[1].headers['idempotency-key']
      expect(firstKey).toBeTruthy()
      expect(secondKey).toBeTruthy()
      expect(secondKey).not.toBe(firstKey)
    })

    it('reuses Idempotency-Key across Back-to-details and forward-to-review when nothing changes', async () => {
      const history = {
        ref: {
          current: [] as Array<{ headers: Record<string, string>; body: Record<string, unknown> }>
        }
      }
      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        captureBookingHistory: history,
        bookingHandler: (_init, callIndex) => {
          if (callIndex === 0) {
            return jsonResponse(
              { success: false, error: 'Temporarily unavailable' },
              { status: 503 }
            )
          }
          return null
        }
      })

      render(<ManagementTableBookingForm />)
      await fillFindAndProceedToReview()

      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(1))
      await waitFor(() =>
        expect(screen.getByText(/Temporarily unavailable/i)).toBeInTheDocument()
      )

      // Back to details, immediately Continue to review (no field changes).
      const backButtons = screen.getAllByRole('button', { name: 'Back' })
      fireEvent.click(backButtons[backButtons.length - 1])
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))
      await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
      // Policy checkbox state is preserved on back-and-forward, do not toggle it.
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(2))

      const firstKey = history.ref.current[0].headers['idempotency-key']
      const secondKey = history.ref.current[1].headers['idempotency-key']
      expect(firstKey).toBeTruthy()
      expect(secondKey).toBe(firstKey)
    })

    it('issues a new Idempotency-Key when the customer changes notes after backing out of review', async () => {
      const history = {
        ref: {
          current: [] as Array<{ headers: Record<string, string>; body: Record<string, unknown> }>
        }
      }
      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        captureBookingHistory: history,
        bookingHandler: (_init, callIndex) => {
          if (callIndex === 0) {
            return jsonResponse(
              { success: false, error: 'Temporarily unavailable' },
              { status: 503 }
            )
          }
          return null
        }
      })

      render(<ManagementTableBookingForm />)
      await fillFindAndProceedToReview()

      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(1))
      await waitFor(() =>
        expect(screen.getByText(/Temporarily unavailable/i)).toBeInTheDocument()
      )

      // Back to details, change notes, forward to review, Confirm.
      const backButtons = screen.getAllByRole('button', { name: 'Back' })
      fireEvent.click(backButtons[backButtons.length - 1])
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText(/Notes \(optional\)/i), {
        target: { value: 'Window seat please' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))
      await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
      // Policy checkbox state is preserved on back-and-forward, do not toggle it.
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(2))

      const firstKey = history.ref.current[0].headers['idempotency-key']
      const secondKey = history.ref.current[1].headers['idempotency-key']
      expect(firstKey).toBeTruthy()
      expect(secondKey).not.toBe(firstKey)
    })
  })
})
