import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { GUEST_COMMS_CONSENT_TEXT_VERSION } from '@/lib/communication-consent'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import {
  captureBookingAttributionFromLocation,
  clearBookingAttributionForTest,
} from '@/lib/booking-attribution'
import { setConsentStatus } from '@/lib/cookies'

/**
 * The booking form's behaviour: purposes, payments, funnel events, time zones,
 * idempotency, availability failures and analytics. Written for the four-step
 * journey and rewritten for the two-screen one when the four-step path was
 * deleted (review BK-199, website W4): the tests that described only the old
 * path (the seven-slot window, Preferred Time, the review screen, the details
 * step's high-chair stepper) went with it. The journey's own shape is covered
 * in ManagementTableBookingForm.twoScreen.test.tsx.
 */

/**
 * Capture time for the attribution assertions below.
 *
 * Unlike ManagementEventBookingForm.test.tsx and booking-attribution.test.ts,
 * this suite already freezes Date at FROZEN_NOW, so the 90 day
 * ATTRIBUTION_TTL_DAYS check is measured against that fixed point rather than
 * the wall clock. The previous literal '2026-07-10T11:30:00.000Z' was never
 * going to expire here. Kept relative only so the value stops reading like a
 * date somebody has to maintain.
 */
const ATTRIBUTION_CAPTURED_AT = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)

const trackTableBookingFunnel = jest.fn()
const pushToDataLayer = jest.fn()
const trackTableBookingClick = jest.fn()
const trackBookingStepViewed = jest.fn()
const trackOptionToggled = jest.fn()
const trackSlotFlagShown = jest.fn()
const trackSlotInvalidated = jest.fn()
const trackBookingErrorShown = jest.fn()

import { analyticsSaleId } from '@/lib/tracking/booking-identifiers'

jest.mock('@/lib/gtm-events', () => ({
  trackTableBookingClick: (...args: unknown[]) => trackTableBookingClick(...args),
  trackTableBookingFunnel: (...args: unknown[]) => trackTableBookingFunnel(...args),
  pushToDataLayer: (...args: unknown[]) => pushToDataLayer(...args),
  trackBookingStepViewed: (...args: unknown[]) => trackBookingStepViewed(...args),
  trackOptionToggled: (...args: unknown[]) => trackOptionToggled(...args),
  trackSlotFlagShown: (...args: unknown[]) => trackSlotFlagShown(...args),
  trackSlotInvalidated: (...args: unknown[]) => trackSlotInvalidated(...args),
  trackBookingErrorShown: (...args: unknown[]) => trackBookingErrorShown(...args),
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
  // What the route decided this slot may be booked for. Most fixtures express
  // intent through `kitchen_open`, so the harness derives this from it unless a
  // test sets it explicitly, which is how the anti-inference tests make the two
  // disagree deliberately.
  bookable_purpose?: 'food_or_drinks' | 'drinks_only'
  busyness?: 'quiet' | 'filling' | 'busy'
  high_chairs_remaining?: number
}

// The wire shape the availability route actually emits: `bookable_purpose` is
// authoritative, `kitchen_open` rides along as informational only.
function toWireSlot(slot: TimeSlot) {
  return {
    ...slot,
    bookable_purpose:
      slot.bookable_purpose ?? (slot.kitchen_open === false ? 'drinks_only' : 'food_or_drinks')
  }
}

type AvailabilityHandler = (url: string) => {
  date?: string
  time_slots: TimeSlot[]
  calculation_state?: 'complete' | 'unknown'
  message?: string
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
      let result: ReturnType<AvailabilityHandler>
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
            time_slots: result.time_slots.map(toWireSlot),
            ...(result.calculation_state ? { calculation_state: result.calculation_state } : {}),
            ...(result.message ? { message: result.message } : {})
          }
        })
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

/**
 * Choose a time on the grid and carry it to the details screen. The grid
 * offers nothing pre-chosen, so the time is tapped, then its Continue button,
 * which names it ("Continue with 7pm", or "Book 1pm anyway" at a busy time).
 */
async function chooseTime(slot: RegExp | string) {
  const name = typeof slot === 'string' ? new RegExp(`^${slot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) : slot
  fireEvent.click(screen.getAllByRole('button', { name })[0])
  fireEvent.click(screen.getByRole('button', { name: /^(Continue with |Book .+ anyway$)/ }))
  await screen.findByLabelText('Mobile Number')
}

// jsdom does not implement scrollIntoView natively. The wizard mount-guarded
// effect calls it on step transitions, so install a no-op for every test.
beforeAll(() => {
  if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
    ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
  }
})

// The wizard rejects past dates before it will fetch availability
// (`isPastLondonDate`), which is read from the wall clock, so the hardcoded
// booking dates used below (2026-07-07 and later) would silently rot into the
// past. Pin "now" to the day before the earliest booking date so the suite is
// deterministic in perpetuity.
// Nested describes may override this with their own setSystemTime.
const FROZEN_NOW = new Date('2026-07-06T09:00:00.000Z') // 10:00 BST, Europe/London

// Fake `Date` only — the wall clock is the problem, the event loop is not.
// Faking setTimeout/setImmediate too makes React Testing Library drive its own
// timer-advancing `waitFor` loop, which triples the "not wrapped in act(...)"
// warnings this file emits. Nested describes that genuinely need the timers
// frozen opt in with their own `jest.useFakeTimers()`.
const FAKE_DATE_ONLY: Parameters<typeof jest.useFakeTimers>[0] = {
  now: FROZEN_NOW,
  doNotFake: [
    'cancelAnimationFrame',
    'cancelIdleCallback',
    'clearImmediate',
    'clearInterval',
    'clearTimeout',
    'hrtime',
    'nextTick',
    'performance',
    'queueMicrotask',
    'requestAnimationFrame',
    'requestIdleCallback',
    'setImmediate',
    'setInterval',
    'setTimeout',
  ],
}

describe('ManagementTableBookingForm', () => {
  beforeEach(() => {
    jest.useFakeTimers(FAKE_DATE_ONLY)
  })

  afterEach(() => {
    jest.useRealTimers()
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    jest.clearAllMocks()
  })

  it('prefills an explicit drinks choice in the full form', async () => {
    const captureUrl = { ref: { current: null as string | null } }
    setupFetchMock({
      availability: [{ time: '22:00', available: true, available_capacity: 4, kitchen_open: false }],
      captureUrl
    })
    render(<ManagementTableBookingForm prefill={{ date: '2026-07-07', drinksOnly: true }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    // Asked about as drinks from the first search, and shown ticked beside the times.
    await waitFor(() => expect(captureUrl.ref.current).toMatch(/purpose=drinks/))
    expect(await screen.findByRole('checkbox', { name: /^Just drinks/ })).toBeChecked()
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
    render(<ManagementTableBookingForm prefill={{ date: '2026-07-07' }} />)
    expect(
      screen.queryByText(/any time during bar hours/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Tables booked here are for dining/i)
    ).not.toBeInTheDocument()
  })

  it('updates the aircraft overhead note when the booking date and time change', async () => {
    setupFetchMock({
      availability: [{ time: '16:00', available: true, available_capacity: 4, kitchen_open: true }]
    })
    // The day before, so the date can be searched.
    jest.setSystemTime(new Date('2026-05-17T10:00:00Z'))
    // The time the page was opened for, until the guest picks one.
    render(<ManagementTableBookingForm prefill={{ date: '2026-05-18', time: '14:00' }} />)

    expect(
      screen.getByText(/Aircraft overhead are expected around this time/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/Plane spotting/i)).not.toBeInTheDocument()

    // Then the time they pick.
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
    fireEvent.click(await screen.findByRole('button', { name: /^4pm,/ }))

    expect(
      screen.getByText(/Aircraft overhead is usually expected until 3pm on this date/i)
    ).toBeInTheDocument()
  })

  it('updates the aircraft overhead note when the date changes', async () => {
    setupFetchMock({ availability: [] })
    render(<ManagementTableBookingForm prefill={{ date: '2026-05-18', time: '16:00' }} />)

    expect(
      screen.getByText(/Aircraft overhead is usually expected until 3pm on this date/i)
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-05-25' } })

    expect(
      screen.getByText(/Aircraft overhead are expected around this time/i)
    ).toBeInTheDocument()
  })

  // Reversed deliberately. This used to assert that purpose was NOT sent, which was fine while
  // every booking was allocated the same way. It stopped being fine when food and drinks began
  // filling opposite ends of the pub: availability cannot answer without knowing which.
  it('sends everything that decides which tables qualify, not just the date and party size', async () => {
    const captureUrl = { ref: { current: null as string | null } }
    setupFetchMock({
      availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
      captureUrl
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(captureUrl.ref.current).not.toBeNull())
    expect(captureUrl.ref.current).toMatch(/purpose=food/)
    expect(captureUrl.ref.current).toMatch(/party_size=2/)
    expect(captureUrl.ref.current).toMatch(/requires_accessible_table=/)
    expect(captureUrl.ref.current).toMatch(/high_chair_count=/)
    expect(captureUrl.ref.current).toMatch(/outside=/)
  })

  it('asks for drinks availability once the guest says it is just drinks', async () => {
    const captureUrl = { ref: { current: null as string | null } }
    setupFetchMock({
      availability: [{ time: '22:00', available: true, available_capacity: 4, kitchen_open: false }],
      captureUrl
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
    await waitFor(() => expect(captureUrl.ref.current).toMatch(/purpose=food/))

    // Ticked beside the times, it asks again, for drinks.
    fireEvent.click(await screen.findByLabelText(/Just drinks, no food/))
    await waitFor(() => expect(captureUrl.ref.current).toMatch(/purpose=drinks/))
  })

  it('asks for an accessible table when the guest needs one', async () => {
    const captureUrl = { ref: { current: null as string | null } }
    setupFetchMock({
      availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
      captureUrl
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
    await waitFor(() => expect(captureUrl.ref.current).toMatch(/requires_accessible_table=false/))

    fireEvent.click(await screen.findByLabelText(/Step-free, standard-height table/))
    await waitFor(() => expect(captureUrl.ref.current).toMatch(/requires_accessible_table=true/))
  })

  it('renders "Drinks & food" caption on kitchen-open slots and "Drinks only" on others', async () => {
    setupFetchMock({
      availability: [
        { time: '19:00', available: true, available_capacity: 4, kitchen_open: true },
        { time: '22:00', available: true, available_capacity: 4, kitchen_open: false }
      ]
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

    const earlyButton = screen.getByRole('button', { name: /7pm/ })
    const lateButton = screen.getByRole('button', { name: /10pm/ })
    expect(within(earlyButton).getByText(/drinks & food/i)).toBeInTheDocument()
    expect(within(lateButton).getByText(/drinks only/i)).toBeInTheDocument()
  })

  it('shows busy labels, calmer alternatives, and a book-anyway path', async () => {
    setupFetchMock({
      availability: [
        { time: '12:30', available: true, available_capacity: 4, kitchen_open: true, busyness: 'quiet' },
        { time: '13:00', available: true, available_capacity: 4, kitchen_open: true, busyness: 'busy' },
        { time: '13:30', available: true, available_capacity: 4, kitchen_open: true, busyness: 'quiet' },
        { time: '14:00', available: true, available_capacity: 4, kitchen_open: true, busyness: 'filling' }
      ]
    })

    render(<ManagementTableBookingForm prefill={{ date: '2026-07-07', time: '13:00' }} />)
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

    const busyButton = screen.getByRole('button', { name: /1pm.+busiest time/i })
    const fillingButton = screen.getByRole('button', { name: /2pm.+getting busy/i })
    expect(within(busyButton).getByText('Busiest time')).toBeInTheDocument()
    expect(within(fillingButton).getByText('Getting busy')).toBeInTheDocument()
    expect(screen.getAllByText('Plenty of space')).toHaveLength(2)

    fireEvent.click(busyButton)

    expect(screen.getByText(/food and drinks may take a little longer/i)).toBeInTheDocument()
    expect(screen.getByText(/slightly earlier or later table may mean a smoother visit/i)).toBeInTheDocument()
    expect(screen.getByText(/12:30pm and 1:30pm may be a smoother option/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '12:30pm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1:30pm' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Book 1pm anyway' }))

    await waitFor(() => expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument())
  })

  it('repeats busy service expectations on the review page', async () => {
    setupFetchMock({
      availability: [
        { time: '13:00', available: true, available_capacity: 4, kitchen_open: true, busyness: 'busy' }
      ]
    })

    render(<ManagementTableBookingForm prefill={{ date: '2026-07-07', time: '13:00' }} />)
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /1pm.+busiest time/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Book 1pm anyway' }))

    await waitFor(() => expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
    expect(screen.getByText('Worth knowing before you confirm')).toBeInTheDocument()
    expect(screen.getByText(/food and drinks may take a little longer/i)).toBeInTheDocument()
    expect(screen.getByText(/slightly earlier or later table may mean a smoother visit/i)).toBeInTheDocument()
  })

  it('does not render the "Showing X slots" purpose-flavoured caption', async () => {
    setupFetchMock({
      availability: [
        { time: '19:00', available: true, available_capacity: 4, kitchen_open: true }
      ]
    })

    render(<ManagementTableBookingForm />)
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
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
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    await chooseTime(/7pm/)

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
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
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    await chooseTime(/10pm/)

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
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
        if (date === '2026-07-07') {
          return { date: '2026-07-07', time_slots: [] }
        }
        if (date === '2026-07-08') {
          return {
            date: '2026-07-08',
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
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    // Wait for nearest alternatives to surface
    const alternativeButton = await screen.findByRole('button', { name: /10:30pm/i })
    fireEvent.click(alternativeButton)

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
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
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    await chooseTime(/7pm/)

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
    expect(screen.queryByText(/booking for/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/food booking/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/drinks booking/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/switch between food and drinks/i)).not.toBeInTheDocument()
  })

  it('filters Mother’s Day events out of booking-context suggestions', async () => {
    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/table-bookings/availability')) {
        return Promise.resolve(
          jsonResponse({
            success: true,
            data: {
              date: '2026-03-15',
              available: true,
              time_slots: [{ time: '13:00', available: true, available_capacity: 4, bookable_purpose: 'food_or_drinks' }]
            }
          })
        )
      }

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

    jest.setSystemTime(new Date('2026-03-14T10:00:00Z'))
    render(<ManagementTableBookingForm prefill={{ date: '2026-03-15' }} />)
    // The events on a date are offered beside its times, after a search.
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

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
                date: '2026-07-10',
                available: true,
                time_slots: [
                  {
                    time: '13:00',
                    available: true,
                    available_capacity: 20,
                    kitchen_open: true,
                    bookable_purpose: 'food_or_drinks'
                  }
                ],
                // AMS's quote for this party (BK-186); the form no longer works it out.
                deposit: { party_size: 15, required: true, amount: 150, rule: 'group', reason: null }
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
        // Simulate a 15+ booking where the management API set up the booking
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
                deposit_amount: 150,
                payment_required: true,
                fallback_payment_url: 'https://pay.example.com/secure-link',
                blocked_reason: null,
                next_step_url: null,
                hold_expires_at: null,
                table_name: null,
                reason: null,
                // BK-059: the food choices failed to save. The deposit screen is where every
                // Christmas booking lands first, so it must say so.
                preorder: { requested_covers: 15, saved_covers: 2, saved: false, error: 'x', reason: 'save_failed' }
              }
            }),
            {
              status: 201,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      // Inline PayPal create-order returns an error to drive the recovery branch.
      // The error is an OBJECT, the shape the management app answers with when
      // the shared key runs out of allowance. The form used to put it into
      // state and render it, which threw and took the whole page down at the
      // moment a booking existed and a deposit was owed.
      if (url === '/api/table-bookings/paypal/create-order') {
        return Promise.resolve(
          new Response(
            JSON.stringify({ success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded' } }),
            {
              status: 429,
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
      '/book-table?utm_source=facebook&utm_medium=paid_social&utm_campaign=deposit-table&fbclid=fb-123&gclid=g-123&short_code=ma-table&email=jane@example.com',
    )
    // The payload carries ad tags only with marketing consent (lib/booking-attribution.ts).
    setConsentStatus({ marketing: true })
    captureBookingAttributionFromLocation(ATTRIBUTION_CAPTURED_AT)
    window.history.pushState({}, '', '/book-table')

    render(<ManagementTableBookingForm />)

    // Fifteen, because that is where the deposit starts since 2026-08-09. A party of ten
    // no longer reaches the PayPal step at all, so testing the PayPal recovery state with
    // ten would silently stop testing anything.
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '15' } })
    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-10' } })

    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    await chooseTime(/1pm/)

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Guest' } })

    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm and pay deposit/i }))

    // Expect the "couldn't open PayPal" recovery state with the fallback link rendered
    await waitFor(() =>
      expect(
        screen.getByText("We couldn't open the PayPal payment automatically", { exact: false })
      ).toBeInTheDocument()
    )

    // BK-059: told on the deposit screen that the food choices did not save.
    expect(screen.getByText(/some or all of your food choices didn't save/)).toBeInTheDocument()

    const fallbackLink = await screen.findByRole('link', {
      name: /click here to complete your deposit/i
    })
    expect(fallbackLink).toHaveAttribute('href', 'https://pay.example.com/secure-link')

    // The answer above does not say a message went (no `notification_sent`),
    // so the screen offers the link itself and does not send the guest off to
    // look for a payment link "we've sent".
    expect(screen.getByText('Two ways to finish your booking:')).toBeInTheDocument()
    expect(screen.queryByText(/we've sent/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/check your (phone|email)/i)).not.toBeInTheDocument()

    // A sentence with the phone number, not the upstream wording and not a crash.
    expect(screen.queryByText(/Rate limit exceeded/)).not.toBeInTheDocument()
    expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument()
    expect(screen.getByText(/Our booking system is very busy just now\. Please try again in a few minutes, or call 01753 682707\./)).toBeInTheDocument()

    // Verify the public payload no longer carries sunday_lunch or menu_selections
    expect(submittedPayload).not.toBeNull()
    const payload = submittedPayload as unknown as Record<string, unknown>
    expect(payload.sunday_lunch).toBeUndefined()
    expect(payload.menu_selections).toBeUndefined()
    expect(payload.booking_type).toBeUndefined()
    expect(payload.purpose).toBe('food')
    expect(payload.utm_source).toBe('facebook')
    expect(payload.utm_medium).toBe('paid_social')
    expect(payload.utm_campaign).toBe('deposit-table')
    expect(payload.fbclid).toBe('fb-123')
    expect(payload.gclid).toBe('g-123')
    expect(payload.short_code).toBe('ma-table')
    expect(payload.attribution_captured_at).toBe(ATTRIBUTION_CAPTURED_AT.toISOString())
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
        notice_key: 'table_compact_v6'
      })
    )
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
                date: '2026-07-07',
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
                notification_sent: true,
                notification_channel: 'email',
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
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '4' } })
    expect(trackTableBookingFunnel).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'start', source: 'direct' })
    )

    fireEvent.blur(screen.getByLabelText('Party size'))
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

    await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    await chooseTime(/1pm/)

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900111' } })

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
    fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

    // submit + success fire as the booking flow completes.
    await waitFor(() =>
      expect(trackTableBookingFunnel).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'submit', partySize: 4, bookingDate: '2026-07-07' })
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
    // The success funnel event and the confirmation render are two separate
    // effects of the same POST. The waitFor above resolves on the mock call, so
    // the React commit that swaps review → confirmation may not have flushed
    // yet — assert the DOM asynchronously, as every other step assertion does.
    await waitFor(() =>
      expect(screen.getByText(/We've sent confirmation details by email/i)).toBeInTheDocument()
    )

    // GA4 purchase event should fire with a sale id made from the booking
    // reference as transaction_id (never the reference itself), carry an
    // estimated booking value rather than the (always £0) deposit, and go
    // through the Measurement Protocol as well as the dataLayer.
    expect(analyticsSaleId('TB-CONF-1')).toMatch(/^sale_[0-9a-f]{16}$/)
    for (const [pushed] of jest.mocked(pushToDataLayer).mock.calls) {
      expect(JSON.stringify(pushed)).not.toContain('TB-CONF-1')
    }
    expect(pushToDataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'purchase',
        transaction_id: analyticsSaleId('TB-CONF-1'),
        // 4 covers at the £25 per-cover figure the site already sends Meta.
        // Sending the deposit here is what made GA4 Total revenue read £0.00.
        value: 100,
        currency: 'GBP',
        booking_source: 'direct',
      }),
      expect.objectContaining({ sendToApi: true })
    )

    // Sequence assertion: view → start → submit → success in order.
    const steps = trackTableBookingFunnel.mock.calls.map((call) => (call[0] as any).step)
    const indexOf = (s: string) => steps.indexOf(s)
    expect(indexOf('view')).toBeGreaterThanOrEqual(0)
    expect(indexOf('start')).toBeGreaterThan(indexOf('view'))
    expect(indexOf('submit')).toBeGreaterThan(indexOf('start'))
    expect(indexOf('success')).toBeGreaterThan(indexOf('submit'))
  })

  // The seven-slot window and its "See more times" expander belonged to the
  // four-step journey and went with it (review BK-199). Every time is shown
  // now; the two-screen suite covers the grid.
  describe('party-size threading', () => {
    it('uses the freshly-typed party size in the availability URL even without onBlur', async () => {
      const captureUrl = { ref: { current: null as string | null } }
      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 12, kitchen_open: true }],
        captureUrl
      })

      render(<ManagementTableBookingForm />)
      // Type 10 but DO NOT blur: a stale-closure path would still ask about 2.
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '10' } })
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
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
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/1pm/i)

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
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

      const partySize = screen.getByLabelText('Party size') as HTMLInputElement
      expect(partySize.inputMode).toBe('numeric')
      expect(partySize.pattern).toBe('[0-9]*')
    })

    it('Mobile Number input has inputMode="tel" and autoComplete="tel"', async () => {
      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/7pm/)

      const phone = screen.getByLabelText('Mobile Number') as HTMLInputElement
      expect(phone.inputMode).toBe('tel')
      expect(phone.getAttribute('autocomplete')).toBe('tel')
    })

    it('First Name, Last Name, Email carry correct autoComplete and inputMode hints', async () => {
      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/7pm/)

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())

      const firstName = screen.getByLabelText('First Name') as HTMLInputElement
      const lastName = screen.getByLabelText('Last name (optional)') as HTMLInputElement
      const email = screen.getByLabelText('Email address') as HTMLInputElement

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
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

      const foodSlot = screen.getByRole('button', { name: /7pm, drinks and food/i })
      const drinksSlot = screen.getByRole('button', { name: /10pm, drinks only/i })
      expect(foodSlot).toBeInTheDocument()
      expect(drinksSlot).toBeInTheDocument()
    })

    it('alternative button class includes min-h-12', async () => {
      // Primary date returns no available slots; alternative date returns a late slot.
      setupFetchMock({
        availability: (url) => {
          const params = new URL(url, 'https://t.test').searchParams
          const date = params.get('date')
          if (date === '2026-07-07') {
            return { date: '2026-07-07', time_slots: [] }
          }
          if (date === '2026-07-08') {
            return {
              date: '2026-07-08',
              time_slots: [
                { time: '22:30', available: true, available_capacity: 6, kitchen_open: false }
              ]
            }
          }
          return { date: date || '', time_slots: [] }
        }
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

      // The alternative button (10:30pm on 2026-07-08) should be present and at least 48px tall.
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
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/7pm/)

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })

      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })

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

      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      // The times arrive on the same screen, which is not a step change.

      // Advancing to the details screen is, and scrolls it to its top.
      const beforeAdvance = scrollSpy.mock.calls.length
      await chooseTime(/7pm/)
      await waitFor(() => expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument())
      const advanceCalls = scrollSpy.mock.calls.slice(beforeAdvance)
      expect(advanceCalls).toContainEqual([expect.objectContaining({ block: 'start' })])

      scrollSpy.mockRestore()
    })

    it('pressing Enter in the Date box submits the find form', async () => {
      const captureUrl = { ref: { current: null as string | null } }
      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        captureUrl
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })

      // Submitting the surrounding <form> from the date box must run the search.
      const dateInput = screen.getByLabelText('Date') as HTMLInputElement
      const form = dateInput.closest('form') as HTMLFormElement
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
      email?: string
      notes?: string
    } = {}) {
      const partySize = options.partySize ?? '2'
      const date = options.date ?? '2026-07-07'
      const slotName = options.slotName ?? /1pm/i
      const firstName = options.firstName ?? 'Sam'
      const lastName = options.lastName ?? 'Walker'
      const phone = options.phone ?? '07700900000'
      const email = options.email ?? 'sam@example.com'

      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: partySize } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: date } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(slotName)

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: phone } })

      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: firstName } })
      fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: lastName } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: email } })
      if (options.notes) {
        fireEvent.change(screen.getByLabelText(/Notes \(optional\)/i), { target: { value: options.notes } })
      }
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
        // The upstream wording is not shown; the guest gets our sentence.
        expect(screen.getByText(/We could not process your booking right now/i)).toBeInTheDocument()
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
      await fillFindAndProceedToReview({ date: '2026-07-07' })
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(1))
      await waitFor(() => expect(screen.getByText(/all booked in/i)).toBeInTheDocument())

      // Book another → resetJourney must clear the cached key. Then run a brand
      // new search on a different date and confirm again.
      fireEvent.click(screen.getByRole('button', { name: /Book another table/i }))
      await waitFor(() => expect(screen.getByLabelText('Date')).toBeInTheDocument())
      await fillFindAndProceedToReview({ date: '2026-07-08' })
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(2))

      const firstKey = history.ref.current[0].headers['idempotency-key']
      const secondKey = history.ref.current[1].headers['idempotency-key']
      expect(firstKey).toBeTruthy()
      expect(secondKey).toBeTruthy()
      expect(secondKey).not.toBe(firstKey)
    })

    it('reuses Idempotency-Key across Back to the times and forward again when nothing changes', async () => {
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
        // The upstream wording is not shown; the guest gets our sentence.
        expect(screen.getByText(/We could not process your booking right now/i)).toBeInTheDocument()
      )

      // Back to the times, and straight on again with the same time (no field
      // changes). The details typed in are kept.
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      fireEvent.click(await screen.findByRole('button', { name: 'Continue with 1pm' }))
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      // Policy checkbox state is preserved on back-and-forward, do not toggle it.
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(2))

      const firstKey = history.ref.current[0].headers['idempotency-key']
      const secondKey = history.ref.current[1].headers['idempotency-key']
      expect(firstKey).toBeTruthy()
      expect(secondKey).toBe(firstKey)
    })

    it('issues a new Idempotency-Key when the customer changes notes after going back', async () => {
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
        // The upstream wording is not shown; the guest gets our sentence.
        expect(screen.getByText(/We could not process your booking right now/i)).toBeInTheDocument()
      )

      // Back to the times, on again, change the notes, Confirm.
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      fireEvent.click(await screen.findByRole('button', { name: 'Continue with 1pm' }))
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText(/Notes \(optional\)/i), {
        target: { value: 'Window seat please' }
      })
      // Policy checkbox state is preserved on back-and-forward, do not toggle it.
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(history.ref.current.length).toBe(2))

      const firstKey = history.ref.current[0].headers['idempotency-key']
      const secondKey = history.ref.current[1].headers['idempotency-key']
      expect(firstKey).toBeTruthy()
      expect(secondKey).not.toBe(firstKey)
    })
  })

  describe('Codex review fixes', () => {
    it('addDays advances 2027-03-28 (next BST transition) to 2027-03-29 in alternative search URLs (AB-001)', async () => {
      // No slots available on the primary date — wizard then searches the
      // next three calendar dates via addDays. The BST transition (last Sunday
      // of March) is the canonical risk for any date arithmetic that round-
      // trips through a London formatter. Verifying 2027-03-29 surfaces in
      // the alternate URL set proves addDays produces the correct calendar
      // date across the DST boundary in pure UTC arithmetic.
      const altUrls: string[] = []
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
        if (url.startsWith('/api/table-bookings/availability')) {
          const params = new URL(url, 'https://t.test').searchParams
          const date = params.get('date') || ''
          if (date !== '2027-03-28') {
            altUrls.push(url)
          }
          return Promise.resolve(
            new Response(
              JSON.stringify({ success: true, data: { date, available: false, time_slots: [] } }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
          )
        }
        return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2027-03-28' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      // Wait for nearest-alternative searches to fire (3 dates).
      await waitFor(() => expect(altUrls.length).toBeGreaterThanOrEqual(3))

      const dates = altUrls.map((u) => new URL(u, 'https://t.test').searchParams.get('date'))
      expect(dates).toEqual(expect.arrayContaining(['2027-03-29', '2027-03-30', '2027-03-31']))
    })

    it('clears the cached submit-intent key on confirmed booking so a re-attempt with the same payload mints a fresh key (AB-003)', async () => {
      // Confirm one booking. Without resetJourney intervening, "Book another"
      // re-renders the wizard from scratch — but `resetJourney` also clears
      // the cache. The defensive clear-on-confirmed fires *before* the user
      // can do anything; this test verifies the resulting end state: any
      // subsequent same-fingerprint Confirm produces a fresh idempotency key.
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

      // First booking: same date, same details → fingerprint A → key K1.
      const fillBookingFlow = async () => {
        fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
        fireEvent.blur(screen.getByLabelText('Party size'))
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
        fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
        await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
        await chooseTime(/1pm/i)
        await waitFor(() => expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
        await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
        fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
        fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
        fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
        fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      }

      await fillBookingFlow()
      await waitFor(() => expect(history.ref.current.length).toBe(1))
      await waitFor(() => expect(screen.getByText(/all booked in/i)).toBeInTheDocument())

      // Book another with identical inputs → fingerprint A → must mint K2 ≠ K1.
      // (Both the confirmed-state clear and resetJourney's clear contribute;
      // either alone is sufficient for this expectation.)
      fireEvent.click(screen.getByRole('button', { name: /Book another table/i }))
      await waitFor(() => expect(screen.getByLabelText('Date')).toBeInTheDocument())
      await fillBookingFlow()
      await waitFor(() => expect(history.ref.current.length).toBe(2))

      const firstKey = history.ref.current[0].headers['idempotency-key']
      const secondKey = history.ref.current[1].headers['idempotency-key']
      expect(firstKey).toBeTruthy()
      expect(secondKey).toBeTruthy()
      expect(secondKey).not.toBe(firstKey)
    })

    it('disables the details-screen Back button while Confirm is in flight (WF-004)', async () => {
      // Hold the booking POST in a deferred promise; assert the Back button
      // is disabled while loading. This prevents the customer from leaving
      // the details screen mid-submission with the request still pending.
      // TS narrows the closed-over `null` initialiser, so use a `{ fn? }`
      // wrapper that the test mutates without confusing the inference.
      const release: { fn?: (value: Response) => void } = {}
      const bookingPromise = new Promise<Response>((resolve) => {
        release.fn = resolve
      })

      setupFetchMock({
        availability: [{ time: '13:00', available: true, available_capacity: 4, kitchen_open: true }],
        bookingHandler: () => bookingPromise as unknown as Response
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/1pm/i)
      await waitFor(() => expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))

      // Before Confirm: Back is enabled.
      const backBefore = screen.getByRole('button', { name: 'Back' }) as HTMLButtonElement
      expect(backBefore.disabled).toBe(false)

      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      // While the booking POST is pending, Back must be disabled.
      await waitFor(() => {
        const backDuring = screen.getByRole('button', { name: 'Back' }) as HTMLButtonElement
        expect(backDuring.disabled).toBe(true)
      })

      // Release the deferred POST so the test can settle cleanly.
      release.fn?.(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              state: 'confirmed',
              table_booking_id: 'tb-1',
              booking_reference: 'TB-1',
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
      await waitFor(() => expect(screen.getByText(/all booked in/i)).toBeInTheDocument())
    })
  })

  // Stale-search guard for nearest alternatives. The end-to-end version below
  // was attempted and abandoned: the deferred-promise scaffolding fights jsdom's
  // async render order. The guard itself is no longer covered by code inspection
  // alone. It now lives in useAvailabilityRequests (beginAlternativesRequest,
  // isCurrentAlternativesRequest, supersedeAlternatives) and is asserted
  // directly in tests/unit/useAvailabilityRequests.test.ts; the form wires every
  // search-input change to supersedeAlternatives().
  describe.skip('Stale-search guard for nearest alternatives (manual QA only)', () => {
    function deferred<T>() {
      let resolveFn!: (value: T) => void
      const promise = new Promise<T>((resolve) => {
        resolveFn = resolve
      })
      return { promise, resolve: resolveFn }
    }

    beforeEach(() => {
      cleanup()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('drops alternatives from a stale search when a newer search has started', async () => {
      // The first search returns no primary slots and its loadNearestAlternatives
      // is held open via deferred promises. Before they resolve, we change the
      // date — handleDateChange must bump the request ref so when the deferred
      // responses finally resolve, the guard inside loadNearestAlternatives
      // drops them on the floor. The stale 9:00pm slot must never appear.
      const staleAltDeferreds = [
        deferred<{ date: string; time_slots: TimeSlot[] }>(),
        deferred<{ date: string; time_slots: TimeSlot[] }>(),
        deferred<{ date: string; time_slots: TimeSlot[] }>()
      ]
      let staleAltCallIndex = 0

      setupFetchMock({
        availability: (url) => {
          const params = new URL(url, 'https://t.test').searchParams
          const date = params.get('date') || ''
          // The wizard's primary search hits 2026-07-07 first; we want it to
          // return no slots so loadNearestAlternatives fires. Secondary
          // candidate calls land on 2026-07-08/09/10 and must be deferred.
          if (date === '2026-07-07') {
            return { date, time_slots: [] }
          }
          if (date === '2026-07-08' || date === '2026-07-09' || date === '2026-07-10') {
            // Mark the call so the test can resolve it later. Returning a
            // pending promise from a synchronous handler isn't possible here,
            // so we approximate by returning an empty placeholder and using a
            // separate hook below: see fetchSpy override.
            staleAltCallIndex++
            return { date, time_slots: [] }
          }
          return { date, time_slots: [] }
        }
      })

      // Override fetch with a wrapper that defers the FIRST alternative dates
      // independently of setupFetchMock's synchronous handler. This lets us
      // hold the first search's alternatives while a later date change bumps
      // the request ref.
      const baseFetch = (global as unknown as { fetch: jest.Mock }).fetch
      const wrappedFetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.startsWith('/api/table-bookings/availability')) {
          const params = new URL(url, 'https://t.test').searchParams
          const date = params.get('date') || ''
          if (date === '2026-07-08' || date === '2026-07-09' || date === '2026-07-10') {
            const slot = staleAltCallIndex++
            const d = staleAltDeferreds[Math.min(slot, staleAltDeferreds.length - 1)]
            return d.promise.then((payload) =>
              jsonResponse({
                success: true,
                data: { date: payload.date, available: true, time_slots: payload.time_slots }
              })
            )
          }
        }
        return baseFetch(input, init)
      })
      ;(global as unknown as { fetch: jest.Mock }).fetch = wrappedFetch

      cleanup() // belt-and-braces — make sure no prior render is still mounted
      render(<ManagementTableBookingForm />)

      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      // Step 2 reached; alternatives panel shows loading because deferreds
      // for 2026-07-08/09/10 are still pending.
      await waitFor(() =>
        expect(screen.getByText(/Finding nearby options/i)).toBeInTheDocument()
      )

      // Customer changes the date — handleDateChange bumps the request ref so
      // the still-pending alternative responses are now stale.
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-06-14' } })

      // Resolve the (now-stale) responses with a distinctive 9:00pm slot.
      staleAltDeferreds.forEach((d, i) =>
        d.resolve({
          date: ['2026-07-08', '2026-07-09', '2026-07-10'][i],
          time_slots: [
            { time: '21:00', available: true, available_capacity: 8, kitchen_open: false }
          ]
        })
      )

      // Flush microtasks twice to allow setState to propagate (or be skipped).
      await new Promise((resolve) => setTimeout(resolve, 0))
      await new Promise((resolve) => setTimeout(resolve, 0))

      // The stale 9:00pm alternative must never have been rendered. The guard
      // inside loadNearestAlternatives dropped the response.
      expect(screen.queryByRole('button', { name: /9:00pm/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /9pm/i })).not.toBeInTheDocument()
    })
  })

  // High chairs and outside seating live on the DETAILS step, after the time has been chosen.
  // Changing either invalidates the availability reading. The first version of that invalidation
  // just cleared the slot, which stranded the guest: the summary kept showing the old time, then
  // Continue bounced them to a slot list reading "No online times available" with nothing to pick
  // and no way to search again short of starting over.
  // The refinements sit above the times on the first screen, so they change
  // under a chosen time, and a second search can overlap a re-read. The
  // two-screen suite covers a refinement killing the chosen time, a time
  // tapped from a grid already replaced, and a settled but superseded
  // answer. These are the cases it does not: a re-read that never settles,
  // one superseded by another, and searches and re-reads overtaking each
  // other in either direction, including when the loser fails.
  describe('changing table options after a time has been chosen', () => {
    function deferred() {
      let release: ((value: Response) => void) | undefined
      let fail: ((reason: unknown) => void) | undefined
      const promise = new Promise<Response>((resolve, reject) => {
        release = resolve
        fail = reject
      })
      // Swallow the unhandled rejection when a test rejects a promise the
      // component has already stopped awaiting; the assertions cover it.
      promise.catch(() => undefined)
      return {
        promise,
        release: release as (value: Response) => void,
        reject: fail as (reason: unknown) => void
      }
    }

    function slotsResponseFor(
      date: string,
      times: string[],
      purpose: 'food_or_drinks' | 'drinks_only' = 'food_or_drinks'
    ) {
      return jsonResponse({
        success: true,
        data: {
          date,
          available: true,
          calculation_state: 'complete',
          time_slots: times.map((time) => ({
            time,
            available: true,
            available_capacity: 8,
            kitchen_open: purpose === 'food_or_drinks',
            bookable_purpose: purpose
          }))
        }
      })
    }

    /** Answers every read but availability, which `availability` decides. */
    function routeFetch(availability: (url: string) => Promise<Response>) {
      ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.startsWith('/api/events?')) {
          return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
        }
        if (url.startsWith('/api/table-bookings/availability')) return availability(url)
        return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
      })
    }

    async function search(date = '2026-07-07') {
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: date } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    }

    // C2: the pending flag used to be cleared only in an async `finally`
    // guarded by `if (!cancelled)`. A re-run set cancelled true so that clear
    // was skipped, and the flag stuck true for the life of the component, so
    // every Continue was refused with nothing on screen to explain it.
    it('does not block Continue forever when one options change supersedes another', async () => {
      const neverSettles = new Promise<Response>(() => {})
      let stallUsed = false
      routeFetch((url) => {
        if (url.includes('outside=true') && !stallUsed) {
          stallUsed = true
          return neverSettles
        }
        return Promise.resolve(slotsResponseFor('2026-07-07', ['19:00']))
      })

      render(<ManagementTableBookingForm />)
      await search()
      fireEvent.click(screen.getByRole('button', { name: /^7pm,/ }))

      // Options change 1: a re-read that never settles, and the guest can see
      // that something is happening.
      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      await waitFor(() =>
        expect(screen.getByText(/Checking which times still work/i)).toBeInTheDocument()
      )

      // Options change 2 supersedes the hanging read.
      fireEvent.click(screen.getByLabelText(/Just drinks, no food/))
      await waitFor(() =>
        expect(screen.queryByText(/Checking which times still work/i)).not.toBeInTheDocument()
      )

      // The real consequence: Continue works.
      const carryOn = await screen.findByRole('button', { name: 'Continue with 7pm' })
      expect(carryOn).toBeEnabled()
      fireEvent.click(carryOn)
      await screen.findByLabelText('Mobile Number')
      expect(
        screen.queryByText('Just checking that time is still free. One moment.')
      ).not.toBeInTheDocument()
    })

    it('lets go of the times when a re-read never settles, rather than hanging on it', async () => {
      // All timers fake here, so the form's own request budget can run out.
      jest.useFakeTimers({ now: FROZEN_NOW })
      try {
        let availabilityCalls = 0
        ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
          const url = typeof input === 'string' ? input : input.toString()
          if (url.startsWith('/api/events?')) {
            return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
          }
          if (url.startsWith('/api/table-bookings/availability')) {
            availabilityCalls += 1
            if (availabilityCalls === 1) return Promise.resolve(slotsResponseFor('2026-07-07', ['19:00']))
            // Stalled socket: settles only when the request is aborted.
            return new Promise<Response>((_resolve, reject) => {
              init?.signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError'))
              )
            })
          }
          return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
        })

        render(<ManagementTableBookingForm />)
        await search()
        fireEvent.click(screen.getByRole('button', { name: /^7pm,/ }))

        fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
        await waitFor(() =>
          expect(screen.getByText(/Checking which times still work/i)).toBeInTheDocument()
        )

        // Past the request budget the stalled read is abandoned.
        await act(async () => {
          jest.advanceTimersByTime(13_000)
        })

        await waitFor(() =>
          expect(screen.queryByText(/Checking which times still work/i)).not.toBeInTheDocument()
        )
        // Not a confident "full": the guest gets the retry and the number.
        expect(screen.getByText('We could not check live availability')).toBeInTheDocument()
      } finally {
        jest.useRealTimers()
      }
    })

    // C3: a search still in flight when the guest changed an option used to
    // resolve anyway and write its answer, so times checked without the
    // step-free requirement appeared with the box ticked.
    it('discards a search that no longer matches the step-free requirement', async () => {
      const heldSearch = deferred()
      let calls = 0
      routeFetch((url) => {
        calls += 1
        if (calls === 2) return heldSearch.promise
        return Promise.resolve(
          slotsResponseFor('2026-07-07', url.includes('requires_accessible_table=true') ? ['20:00'] : ['19:00'])
        )
      })

      render(<ManagementTableBookingForm />)
      await search()
      // A second search, held mid-flight, then the guest asks for step-free.
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(calls).toBe(2))
      fireEvent.click(screen.getByLabelText(/Step-free, standard-height table/))
      await waitFor(() => expect(screen.getByRole('button', { name: /^8pm,/ })).toBeInTheDocument())

      // The original answer, computed without that requirement, now lands.
      heldSearch.release(slotsResponseFor('2026-07-07', ['19:00', '19:30']))
      await act(async () => {
        await Promise.resolve()
      })

      expect(screen.getByLabelText(/Step-free, standard-height table/)).toBeChecked()
      expect(screen.getByRole('button', { name: /^8pm,/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^7:30pm,/ })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Find a table' })).toBeEnabled()
    })

    // F1, the other direction: a re-read must lose to a newer search, or it
    // overwrites it with an answer for a different date and options.
    it('discards an options re-read that a newer search has superseded', async () => {
      const staleReRead = deferred()
      let reReadHeld = false
      routeFetch((url) => {
        if (url.includes('outside=true') && !reReadHeld) {
          reReadHeld = true
          return staleReRead.promise
        }
        const date = new URL(url, 'https://t.test').searchParams.get('date') || ''
        return Promise.resolve(slotsResponseFor(date, date === '2026-07-09' ? ['20:00'] : ['19:00']))
      })

      render(<ManagementTableBookingForm />)
      await search()
      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      await waitFor(() =>
        expect(screen.getByText(/Checking which times still work/i)).toBeInTheDocument()
      )

      // The guest searches a different date entirely.
      await search('2026-07-09')
      await waitFor(() => expect(screen.getByRole('button', { name: /^8pm,/ })).toBeInTheDocument())

      // Now the abandoned re-read answers, for the OLD date.
      staleReRead.release(slotsResponseFor('2026-07-07', ['19:00']))
      await act(async () => {
        await Promise.resolve()
      })

      expect(screen.getByRole('button', { name: /^8pm,/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^7pm,/ })).not.toBeInTheDocument()
      expect(screen.queryByText(/Checking which times still work/i)).not.toBeInTheDocument()
    })

    // G2: abort() on an already-settled fetch is a no-op, so a superseded
    // FAILURE arrives as a plain Error and must not overwrite a newer answer.
    it('discards a re-read that FAILS after a newer search has taken over', async () => {
      const staleReRead = deferred()
      let reReadHeld = false
      routeFetch((url) => {
        if (url.includes('outside=true') && !reReadHeld) {
          reReadHeld = true
          return staleReRead.promise
        }
        const date = new URL(url, 'https://t.test').searchParams.get('date') || ''
        return Promise.resolve(slotsResponseFor(date, date === '2026-07-09' ? ['20:00'] : ['19:00']))
      })

      render(<ManagementTableBookingForm />)
      await search()
      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      await waitFor(() =>
        expect(screen.getByText(/Checking which times still work/i)).toBeInTheDocument()
      )
      await search('2026-07-09')
      await waitFor(() => expect(screen.getByRole('button', { name: /^8pm,/ })).toBeInTheDocument())

      staleReRead.reject(new Error('Network request failed'))
      await act(async () => {
        await Promise.resolve()
      })

      expect(screen.getByRole('button', { name: /^8pm,/ })).toBeInTheDocument()
      expect(screen.queryByText(/We could not check that time with those options/i)).not.toBeInTheDocument()
      expect(screen.queryByText('We could not check live availability')).not.toBeInTheDocument()
    })

    it('discards a search that FAILS after an options change has taken over', async () => {
      const heldSearch = deferred()
      let calls = 0
      routeFetch(() => {
        calls += 1
        if (calls === 2) return heldSearch.promise
        return Promise.resolve(slotsResponseFor('2026-07-07', ['19:00']))
      })

      render(<ManagementTableBookingForm />)
      await search()
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(calls).toBe(2))

      // Mid-flight the guest changes an option, which supersedes the search,
      // and the superseded search then fails.
      fireEvent.click(screen.getByLabelText(/Step-free, standard-height table/))
      heldSearch.reject(new Error('Network request failed'))
      await act(async () => {
        await Promise.resolve()
      })

      await waitFor(() => expect(screen.getByRole('button', { name: /^7pm,/ })).toBeInTheDocument())
      expect(screen.getByLabelText(/Step-free, standard-height table/)).toBeChecked()
      expect(screen.queryByText(/Network request failed/)).not.toBeInTheDocument()
      expect(screen.queryByText('We could not check live availability')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Find a table' })).toBeEnabled()
    })

    it('discards a food-scoped search when the guest switches to drinks mid-flight', async () => {
      // The Monday shape: the in-flight food search comes back closed. If it
      // were applied, a guest who has just ticked "Just drinks" would be told
      // there are no times on a night with drinks slots all evening.
      const heldSearch = deferred()
      let calls = 0
      routeFetch((url) => {
        calls += 1
        if (calls === 2) return heldSearch.promise
        return Promise.resolve(
          url.includes('purpose=drinks')
            ? slotsResponseFor('2026-07-07', ['22:00'], 'drinks_only')
            : slotsResponseFor('2026-07-07', ['19:00'])
        )
      })

      render(<ManagementTableBookingForm />)
      await search()
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(calls).toBe(2))
      fireEvent.click(screen.getByLabelText(/Just drinks, no food/))
      await waitFor(() => expect(screen.getByRole('button', { name: /^10pm,/ })).toBeInTheDocument())

      heldSearch.release(
        jsonResponse({
          success: true,
          data: {
            date: '2026-07-07',
            available: false,
            calculation_state: 'complete',
            time_slots: [],
            public_reason: 'closed',
            message: 'We are closed then.'
          }
        })
      )
      await act(async () => {
        await Promise.resolve()
      })

      expect(screen.getByLabelText(/Just drinks, no food/)).toBeChecked()
      expect(screen.getByRole('button', { name: /^10pm,/ })).toBeInTheDocument()
      expect(screen.queryByText('No online times available')).not.toBeInTheDocument()
      expect(screen.queryByText(/We are closed then/)).not.toBeInTheDocument()
    })

    // E2: keeping the time but not its purpose left a bookable_purpose from
    // the OLD options in the cache, which beat the fresh answer, so a guest
    // could be booked for food the fresh answer had withdrawn.
    it('takes the purpose from the fresh answer when options change under a chosen time', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      setupFetchMock({
        availability: (url) => ({
          date: '2026-07-07',
          time_slots: [
            {
              time: '19:00',
              available: true,
              available_capacity: 4,
              // Food until the guest asks for an outside table; the fresh
              // answer withdraws food but keeps the time bookable for drinks.
              bookable_purpose: url.includes('outside=true') ? 'drinks_only' : 'food_or_drinks'
            }
          ]
        }),
        capturePayload
      })

      render(<ManagementTableBookingForm />)
      await search()
      expect(
        within(screen.getByRole('button', { name: /^7pm,/ })).getByText(/drinks & food/i)
      ).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /^7pm,/ }))

      // Now ask for an outside table. The time survives, the food does not.
      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      await waitFor(() =>
        expect(screen.queryByText(/Checking which times still work/i)).not.toBeInTheDocument()
      )
      fireEvent.click(await screen.findByRole('button', { name: 'Continue with 7pm' }))
      await screen.findByLabelText('Mobile Number')

      // The summary already tells the truth.
      expect(screen.getByText('Drinks only')).toBeInTheDocument()
      expect(screen.queryByText('Table for food')).not.toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
      expect(capturePayload.ref.current).toMatchObject({ purpose: 'drinks', is_outside_seating: true })
    })
  })

  // T2: availability never fails open. When the authoritative check cannot run,
  // the route answers calculation_state 'unknown' and the form must show a
  // retry state with the phone number, never locally guessed bookable slots.
  describe('availability unknown state (T2)', () => {
    async function searchOn(date = '2026-07-07') {
      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: date } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    }

    it('shows the retry state with the phone number and zero bookable slots', async () => {
      setupFetchMock({
        availability: () => ({ time_slots: [], calculation_state: 'unknown' })
      })

      await searchOn()

      expect(screen.getByText('We could not check live availability')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
      expect(screen.getAllByText(/01753 682707/).length).toBeGreaterThan(0)
      // Never the checked-and-full journey: no waitlist, no alternatives probes.
      expect(screen.queryByText('No online times available')).not.toBeInTheDocument()
      expect(screen.queryByText('Nearest alternatives')).not.toBeInTheDocument()
      expect(screen.queryByText(/Finding nearby options/i)).not.toBeInTheDocument()
    })

    it('never renders locally guessed slots as bookable when the check is unknown', async () => {
      // A malfunctioning upstream could return slots alongside the unknown
      // marker; the form must trust the marker and drop the slots.
      setupFetchMock({
        availability: () => ({
          calculation_state: 'unknown',
          time_slots: [
            { time: '19:00', available: true, available_capacity: 4, kitchen_open: true }
          ]
        })
      })

      await searchOn()

      expect(screen.getByText('We could not check live availability')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /7pm/ })).not.toBeInTheDocument()
    })

    it('Try again re-runs the search and recovers once the checker answers', async () => {
      let call = 0
      setupFetchMock({
        availability: () => {
          call += 1
          if (call === 1) {
            return { time_slots: [], calculation_state: 'unknown' }
          }
          return {
            calculation_state: 'complete',
            time_slots: [
              { time: '19:00', available: true, available_capacity: 4, kitchen_open: true }
            ]
          }
        }
      })

      await searchOn()
      expect(screen.getByText('We could not check live availability')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

      await waitFor(() => expect(screen.getByRole('button', { name: /7pm/ })).toBeInTheDocument())
      expect(screen.queryByText('We could not check live availability')).not.toBeInTheDocument()
    })

    // The retry used to destroy itself: a throwing retry set availability to
    // null, which dropped the choose step out of the unknown state, removed the
    // retry button and the phone number, and fell through to "No online times
    // available". One tap turned "we could not check" into a confident, wrong
    // "the pub is full", with no way back and the real reason never shown.
    it('survives a retry that throws, keeping the retry button and the phone number', async () => {
      let call = 0
      setupFetchMock({
        availability: () => {
          call += 1
          if (call === 1) return { time_slots: [], calculation_state: 'unknown' }
          throw new Error('Network request failed')
        }
      })

      await searchOn()
      expect(screen.getByText('We could not check live availability')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

      await waitFor(() => expect(call).toBe(2))
      // The unknown state and both recovery routes survive.
      await waitFor(() =>
        expect(screen.getByText('We could not check live availability')).toBeInTheDocument()
      )
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
      expect(screen.getAllByText(/01753 682707/).length).toBeGreaterThan(0)
      // The reason is surfaced rather than swallowed (by the search form and
      // by the retry panel, which sit on the same screen).
      expect(screen.getAllByText(/Network request failed/).length).toBeGreaterThan(0)
      // And it never claims the pub is full.
      expect(screen.queryByText('No online times available')).not.toBeInTheDocument()
      expect(screen.queryByText(/couldn't find an online slot/i)).not.toBeInTheDocument()
    })

    it('survives a retry that 503s, without claiming there is no availability', async () => {
      let call = 0
      ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.startsWith('/api/events?')) {
          return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
        }
        if (url.startsWith('/api/table-bookings/availability')) {
          call += 1
          if (call === 1) {
            return Promise.resolve(
              jsonResponse({
                success: true,
                data: { date: '', available: false, time_slots: [], calculation_state: 'unknown' }
              })
            )
          }
          // The availability route's own outer catch.
          return Promise.resolve(
            jsonResponse(
              { success: false, error: "We couldn't check table availability right now." },
              { status: 503 }
            )
          )
        }
        return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
      })

      await searchOn()
      expect(screen.getByText('We could not check live availability')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

      await waitFor(() => expect(call).toBe(2))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
      )
      expect(screen.getByText('We could not check live availability')).toBeInTheDocument()
      expect(screen.queryByText('No online times available')).not.toBeInTheDocument()
    })

    // C1: when the food call is unusable the route fails closed to drinks by
    // sending kitchen_open false. The form must then submit a DRINKS booking,
    // because that is all the drinks answer affirmed. Submitting food would be
    // refused at create with slot_full once the kitchen's pacing ceiling was
    // reached, after the guest had completed every step.
    it('submits a drinks booking for a slot the route could not affirm for food', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      setupFetchMock({
        // Deep inside kitchen hours, so the local kitchen window would have
        // claimed food. Only the authoritative food answer can say that, and in
        // this scenario it never arrived.
        availability: [
          { time: '19:00', available: true, available_capacity: 4, kitchen_open: false }
        ],
        capturePayload
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '4' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

      // The guest sees the honest label rather than "Drinks & food".
      expect(
        within(screen.getByRole('button', { name: /7pm/ })).getByText(/drinks only/i)
      ).toBeInTheDocument()

      await chooseTime(/7pm/)
      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
      expect(capturePayload.ref.current).toMatchObject({ purpose: 'drinks' })
    })

    // D1: the submitted purpose is READ from the slot's authoritative
    // bookable_purpose, never inferred. These make kitchen_open and
    // bookable_purpose disagree on purpose: if any inference path survived
    // anywhere in the form, the proxy would win one of these.
    describe('the submitted purpose comes from the explicit field only', () => {
      async function bookFirstSlot(slot: TimeSlot) {
        const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
        setupFetchMock({ availability: [slot], capturePayload })

        render(<ManagementTableBookingForm />)
        fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
        fireEvent.blur(screen.getByLabelText('Party size'))
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
        fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
        await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
        await chooseTime(/7pm/)
        fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
        await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
        fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
        fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
        fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
        await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
        return capturePayload.ref.current as Record<string, unknown>
      }

      it('books drinks when the field says drinks even though the kitchen is open', async () => {
        // The exact shape a pacing ceiling produces: published hours say the
        // kitchen is serving, the authoritative answer says it cannot take this
        // booking. The old inference read kitchen_open true and submitted food.
        const payload = await bookFirstSlot({
          time: '19:00',
          available: true,
          available_capacity: 4,
          kitchen_open: true,
          bookable_purpose: 'drinks_only'
        })

        expect(payload.purpose).toBe('drinks')
      })

      it('labels that same slot drinks-only, so the guest sees what is booked', async () => {
        setupFetchMock({
          availability: [
            {
              time: '19:00',
              available: true,
              available_capacity: 4,
              kitchen_open: true,
              bookable_purpose: 'drinks_only'
            }
          ]
        })

        render(<ManagementTableBookingForm />)
        fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
        fireEvent.blur(screen.getByLabelText('Party size'))
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
        fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
        await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

        const slotButton = screen.getByRole('button', { name: /7pm/ })
        expect(within(slotButton).getByText(/drinks only/i)).toBeInTheDocument()
        expect(within(slotButton).queryByText(/drinks & food/i)).not.toBeInTheDocument()
        // The label and the submitted purpose read the same field, so the
        // screen-reader phrase agrees too.
        expect(slotButton.getAttribute('aria-label')).toMatch(/drinks only/i)
      })

      it('books food when the field says food even though the kitchen window is shut', async () => {
        const payload = await bookFirstSlot({
          time: '19:00',
          available: true,
          available_capacity: 4,
          kitchen_open: false,
          bookable_purpose: 'food_or_drinks'
        })

        expect(payload.purpose).toBe('food')
      })

      it('fails closed to drinks when the field is missing entirely', async () => {
        // An older cached response, or a future rename. Absent must never be
        // read as food.
        ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
          const url = typeof input === 'string' ? input : input.toString()
          if (url.startsWith('/api/events?')) {
            return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
          }
          if (url.startsWith('/api/table-bookings/availability')) {
            return Promise.resolve(
              jsonResponse({
                success: true,
                data: {
                  date: '2026-07-07',
                  available: true,
                  calculation_state: 'complete',
                  // No bookable_purpose anywhere, and kitchen_open says food.
                  time_slots: [
                    { time: '19:00', available: true, available_capacity: 4, kitchen_open: true }
                  ]
                }
              })
            )
          }
          if (url === '/api/table-bookings') {
            capturedPurpose.value = JSON.parse(String(init?.body || '{}')).purpose
            return Promise.resolve(
              jsonResponse(
                {
                  success: true,
                  data: {
                    state: 'confirmed',
                    table_booking_id: 'tb-1',
                    booking_reference: 'TB-1',
                    blocked_reason: null,
                    next_step_url: null,
                    hold_expires_at: null,
                    table_name: 'Window 4',
                    reason: null
                  }
                },
                { status: 201 }
              )
            )
          }
          return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
        })
        const capturedPurpose: { value?: unknown } = {}

        render(<ManagementTableBookingForm />)
        fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
        fireEvent.blur(screen.getByLabelText('Party size'))
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
        fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
        await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

        // Labelled honestly on the strength of what is actually known.
        expect(
          within(screen.getByRole('button', { name: /7pm/ })).getByText(/drinks only/i)
        ).toBeInTheDocument()

        await chooseTime(/7pm/)
        fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
        await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
        fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
        fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
        fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

        await waitFor(() => expect(capturedPurpose.value).toBeDefined())
        expect(capturedPurpose.value).toBe('drinks')
      })

      it('carries the explicit field through a nearest-alternative choice', async () => {
        const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
        setupFetchMock({
          availability: (url) => {
            const params = new URL(url, 'https://t.test').searchParams
            const date = params.get('date')
            if (date === '2026-07-07') return { date, time_slots: [] }
            return {
              date: date || '',
              time_slots: [
                {
                  time: '20:00',
                  available: true,
                  available_capacity: 6,
                  kitchen_open: true,
                  bookable_purpose: 'drinks_only' as const
                }
              ]
            }
          },
          capturePayload
        })

        render(<ManagementTableBookingForm />)
        fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
        fireEvent.blur(screen.getByLabelText('Party size'))
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
        fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
        await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

        // All three probed dates offer 8pm; take the first.
        const alternatives = await screen.findAllByRole('button', { name: /8pm/i })
        fireEvent.click(alternatives[0])
        fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
        await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
        fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
        fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
        fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

        await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
        expect(capturePayload.ref.current).toMatchObject({ purpose: 'drinks' })
      })
    })

    // A silent downgrade is its own failure: someone booking Sunday lunch who
    // sees "Drinks only" at 1pm may book anyway and arrive expecting a roast.
    // The slots stay bookable, but the guest is told why they read drinks-only.
    describe('the food-check notice', () => {
      const NOTICE = /We could not check food service just now/i

      async function searchWith(data: Record<string, unknown>, drinksOnly = false) {
        ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
          const url = typeof input === 'string' ? input : input.toString()
          if (url.startsWith('/api/events?')) {
            return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
          }
          if (url.startsWith('/api/table-bookings/availability')) {
            return Promise.resolve(jsonResponse({ success: true, data }))
          }
          if (url === '/api/table-bookings') {
            return Promise.resolve(
              jsonResponse(
                {
                  success: true,
                  data: {
                    state: 'confirmed',
                    table_booking_id: 'tb-1',
                    booking_reference: 'TB-1',
                    blocked_reason: null,
                    next_step_url: null,
                    hold_expires_at: null,
                    table_name: 'Window 4',
                    reason: null
                  }
                },
                { status: 201 }
              )
            )
          }
          return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
        })

        // The drinks choice is asked beside the times, after a search, so a
        // guest who wants drinks from the start arrives with it in the link.
        render(<ManagementTableBookingForm prefill={drinksOnly ? { drinksOnly: true } : undefined} />)
        fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
        fireEvent.blur(screen.getByLabelText('Party size'))
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
        fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
        await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      }

      const drinksOnlyGrid = {
        date: '2026-07-07',
        available: true,
        calculation_state: 'complete',
        time_slots: [
          { time: '13:00', available: true, available_capacity: 4, kitchen_open: false },
          { time: '19:00', available: true, available_capacity: 4, kitchen_open: false }
        ]
      }

      it('appears with the grid when the food answer was unusable', async () => {
        await searchWith({ ...drinksOnlyGrid, food_check_unavailable: true })

        expect(screen.getByText(NOTICE)).toBeInTheDocument()
        expect(screen.getAllByText(/01753 682707/).length).toBeGreaterThan(0)
        // The times are still there to book.
        expect(screen.getByRole('button', { name: /1pm/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /7pm/ })).toBeInTheDocument()
      })

      it('does not appear on a kitchen-closed day', async () => {
        // The same drinks-only grid without the flag: the kitchen is genuinely
        // shut and the pub has nothing to apologise for.
        await searchWith(drinksOnlyGrid)

        expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: /7pm/ })).toBeInTheDocument()
      })

      it('does not appear for a drinks-only search', async () => {
        await searchWith({ ...drinksOnlyGrid, food_check_unavailable: true }, true)

        expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
      })

      it('does not appear when both calls answered normally', async () => {
        await searchWith({
          date: '2026-07-07',
          available: true,
          calculation_state: 'complete',
          time_slots: [
            {
              time: '19:00',
              available: true,
              available_capacity: 4,
              kitchen_open: true,
              bookable_purpose: 'food_or_drinks'
            }
          ]
        })

        expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
      })

      // Review is where the guest commits, so the warning has to survive to it.
      async function reachReview() {
        await chooseTime(/1pm/)
        fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
        await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
        fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      }

      it('follows the guest through to the details screen they confirm from', async () => {
        await searchWith({ ...drinksOnlyGrid, food_check_unavailable: true })
        await reachReview()

        expect(
          screen.getByText(/We could not check food service just now, so this booking is for drinks only/i)
        ).toBeInTheDocument()
        expect(screen.getAllByText(/01753 682707/).length).toBeGreaterThan(0)
      })

      it('does not follow through to review when nothing failed', async () => {
        await searchWith(drinksOnlyGrid)
        await reachReview()

        expect(screen.queryByText(/We could not check food service/i)).not.toBeInTheDocument()
      })

      // G1: the notice read the current reading without the date gate that
      // resolveSlotBookablePurpose has, so after choosing a nearest alternative
      // the two described different readings. Worst case the guest saw "we
      // could not check food, ring us if you want to eat" directly above
      // "Booking: Table for food", at the moment of commitment, having seen no
      // notice at all on the choose step.
      describe('after choosing a nearest alternative', () => {
        function mockAlternativeJourney(options: {
          searchedFoodCheckFailed: boolean
          alternativeFoodCheckFailed: boolean
        }) {
          ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
            const url = typeof input === 'string' ? input : input.toString()
            if (url.startsWith('/api/events?')) {
              return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
            }
            if (url.startsWith('/api/table-bookings/availability')) {
              const date = new URL(url, 'https://t.test').searchParams.get('date') || ''
              // The searched date has nothing; the probed dates offer 8pm.
              if (date === '2026-07-07') {
                return Promise.resolve(
                  jsonResponse({
                    success: true,
                    data: {
                      date,
                      available: false,
                      calculation_state: 'complete',
                      time_slots: [],
                      ...(options.searchedFoodCheckFailed ? { food_check_unavailable: true } : {})
                    }
                  })
                )
              }
              return Promise.resolve(
                jsonResponse({
                  success: true,
                  data: {
                    date,
                    available: true,
                    calculation_state: 'complete',
                    time_slots: [
                      {
                        time: '20:00',
                        available: true,
                        available_capacity: 6,
                        bookable_purpose: options.alternativeFoodCheckFailed
                          ? 'drinks_only'
                          : 'food_or_drinks'
                      }
                    ],
                    ...(options.alternativeFoodCheckFailed
                      ? { food_check_unavailable: true }
                      : {})
                  }
                })
              )
            }
            return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
          })
        }

        async function bookTheAlternative() {
          render(<ManagementTableBookingForm />)
          fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
          fireEvent.blur(screen.getByLabelText('Party size'))
          fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
          fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
          await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())

          const alternatives = await screen.findAllByRole('button', { name: /8pm/i })
          fireEvent.click(alternatives[0])
          fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
          await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
          fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
          fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
        }

        it('does not warn about a food check that failed on the date they left', async () => {
          mockAlternativeJourney({
            searchedFoodCheckFailed: true,
            alternativeFoodCheckFailed: false
          })
          await bookTheAlternative()

          // The alternative's own reading checked food fine, so review says food
          // and must not contradict itself with the notice.
          expect(screen.getByText('Table for food')).toBeInTheDocument()
          expect(screen.queryByText(/We could not check food service/i)).not.toBeInTheDocument()
        })

        it('does warn when the alternative is the date whose food check failed', async () => {
          mockAlternativeJourney({
            searchedFoodCheckFailed: false,
            alternativeFoodCheckFailed: true
          })
          await bookTheAlternative()

          // The mirror case: drinks-only for a reason the guest is entitled to
          // know, with a way to put it right.
          expect(screen.getByText('Drinks only')).toBeInTheDocument()
          expect(
            screen.getByText(
              /We could not check food service just now, so this booking is for drinks only/i
            )
          ).toBeInTheDocument()
          expect(screen.getAllByText(/01753 682707/).length).toBeGreaterThan(0)
        })
      })
    })

    // The guest could previously reach Confirm without ever seeing what they
    // were actually booking, so a drinks-only slot could be paid for by someone
    // expecting a roast.
    describe('the review summary states what is being booked', () => {
      async function reviewWith(slot: TimeSlot, drinksOnly = false) {
        setupFetchMock({ availability: [slot] })

        // The drinks choice is asked beside the times, after a search, so a
        // guest who wants drinks from the start arrives with it in the link.
        render(<ManagementTableBookingForm prefill={drinksOnly ? { drinksOnly: true } : undefined} />)
        fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
        fireEvent.blur(screen.getByLabelText('Party size'))
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
        fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
        await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
        await chooseTime(/7pm/)
        fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
        await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
        fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      }

      it('says "Table for food" when food was affirmed', async () => {
        await reviewWith({
          time: '19:00',
          available: true,
          available_capacity: 4,
          bookable_purpose: 'food_or_drinks'
        })

        expect(screen.getByText('Table for food')).toBeInTheDocument()
        expect(screen.queryByText('Drinks only')).not.toBeInTheDocument()
      })

      it('says "Drinks only" when it was not, even inside kitchen hours', async () => {
        await reviewWith({
          time: '19:00',
          available: true,
          available_capacity: 4,
          kitchen_open: true,
          bookable_purpose: 'drinks_only'
        })

        expect(screen.getByText('Drinks only')).toBeInTheDocument()
        expect(screen.queryByText('Table for food')).not.toBeInTheDocument()
      })

      it('says "Drinks only" for a guest who asked for drinks only', async () => {
        await reviewWith(
          {
            time: '19:00',
            available: true,
            available_capacity: 4,
            bookable_purpose: 'food_or_drinks'
          },
          true
        )

        expect(screen.getByText('Drinks only')).toBeInTheDocument()
      })
    })

    it('explains a kitchen pacing refusal instead of the generic blocked line', async () => {
      // slot_full is a real management API answer the website never mapped, so
      // a genuine pacing refusal used to read "This slot is not available for
      // online booking right now", which tells the guest nothing to act on.
      setupFetchMock({
        availability: [
          { time: '19:00', available: true, available_capacity: 4, kitchen_open: true }
        ],
        bookingResponse: {
          state: 'blocked',
          table_booking_id: null,
          booking_reference: null,
          blocked_reason: 'slot_full',
          next_step_url: null,
          hold_expires_at: null,
          table_name: null,
          reason: null
        }
      })

      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '4' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/7pm/)
      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      await waitFor(() =>
        expect(screen.getByText(/kitchen is fully booked around that time/i)).toBeInTheDocument()
      )
      expect(
        screen.queryByText('This slot is not available for online booking right now.')
      ).not.toBeInTheDocument()
      expect(trackBookingErrorShown).toHaveBeenCalledWith({ code: 'slot_full' })
    })

    it('a normal load is unchanged: slots render and the journey continues', async () => {
      setupFetchMock({
        availability: [
          { time: '19:00', available: true, available_capacity: 4, kitchen_open: true }
        ]
      })

      await searchOn()

      expect(screen.getByRole('button', { name: /7pm/ })).toBeInTheDocument()
      expect(screen.queryByText('We could not check live availability')).not.toBeInTheDocument()
    })
  })

  // T5: the surname is optional on the form. AMS already accepts and stores an
  // empty surname and the proxy already omits a blank one from the payload, so
  // the website form rule was the only blocker (spec W2 / review F09).
  describe('optional last name (T5)', () => {
    async function reachDetailsAt7pm(capturePayload?: {
      ref: { current: Record<string, unknown> | null }
    }) {
      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }],
        ...(capturePayload ? { capturePayload } : {})
      })
      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/7pm/)
      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    }

    it('labels the surname optional and does not mark it required', async () => {
      await reachDetailsAt7pm()

      const lastName = screen.getByLabelText('Last name (optional)') as HTMLInputElement
      expect(lastName.required).toBe(false)
      const firstName = screen.getByLabelText('First Name') as HTMLInputElement
      expect(firstName.required).toBe(true)
    })

    it('completes a booking with a first name only and omits last_name from the payload', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      await reachDetailsAt7pm(capturePayload)

      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })

      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
      const payload = capturePayload.ref.current as Record<string, unknown>
      expect(payload.first_name).toBe('Sam')
      expect(payload.last_name).toBeUndefined()

      // Confirmation renders cleanly without a surname.
      await waitFor(() => expect(screen.getByText(/all booked in/i)).toBeInTheDocument())
    })

    it('asks for the first name only when no name is entered', async () => {
      await reachDetailsAt7pm()
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() =>
        expect(screen.getByText('Please enter your first name.')).toBeInTheDocument()
      )
      expect(
        screen.queryByText('Please enter your first name and last name.')
      ).not.toBeInTheDocument()
    })
  })

  // T6, high-chair honesty: the shortfall acknowledgement on the old details
  // step went with the four-step journey. The rule now lives on the slot (D4:
  // a short time carries its count and tapping it is the consent), and the
  // two-screen suite's "high-chair shortfall (owner decision D4)" block
  // covers it, including that the original request is what gets submitted.

  // Review BK-107 (owner decision D31): the form no longer says whether a number
  // belongs to a customer. It used to look the number up before showing the name
  // and email boxes, greet a known one ("Welcome back") and hide those boxes,
  // which told anyone typing a number whether it was a customer's, and threw
  // away a returning guest's new email (BK-078). Every box is now on screen from
  // the start and the typed email always goes with the booking. A number the
  // management app cannot text needs an email for the confirmation (BK-162).
  describe('customer records: no number check, and the typed email always sent', () => {
    const NON_MOBILE_MESSAGE = 'We can only text UK mobile numbers, so please add an email for your confirmation.'

    async function reachDetails(options: Parameters<typeof setupFetchMock>[0]) {
      setupFetchMock(options)
      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/7pm/)
    }

    function bookingRequests() {
      return ((global.fetch as jest.Mock).mock.calls as Array<[RequestInfo | URL, RequestInit | undefined]>)
        .filter(([input]) => String(input) === '/api/table-bookings')
    }

    it('shows the name and email boxes at once, never checks the number, and sends the typed email', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      await reachDetails({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }],
        capturePayload
      })

      // Nothing to press first: every box is there with the number.
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Use Different Number' })).not.toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'new-address@example.com' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
      const payload = capturePayload.ref.current as Record<string, unknown>
      expect(payload.phone).toBe('07700900000')
      expect(payload.first_name).toBe('Sam')
      // Sent whoever the number belongs to; the management app keeps it for this booking.
      expect(payload.email).toBe('new-address@example.com')
      await waitFor(() => expect(screen.getByText(/all booked in/i)).toBeInTheDocument())

      expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/New customer detected/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/recognise this number/i)).not.toBeInTheDocument()
      const requests = (global.fetch as jest.Mock).mock.calls as Array<[RequestInfo | URL, RequestInit | undefined]>
      expect(requests.some(([input]) => String(input).includes('/api/customers/lookup'))).toBe(false)
      // No address the form requests ever carries the number.
      for (const [input] of requests) expect(String(input)).not.toContain('07700900000')
    })

    it.each([
      ['01753 682707', 'a landline'],
      ['+1 202 555 0123', 'an overseas number']
    ])('asks for an email beside the email box for %s (%s), and sends nothing', async (phone) => {
      await reachDetails({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
      })

      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: phone } })
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      const emailBox = screen.getByLabelText('Email address')
      await waitFor(() => expect(emailBox).toHaveAttribute('aria-invalid', 'true'))
      expect(emailBox).toHaveAccessibleDescription(NON_MOBILE_MESSAGE)
      await waitFor(() => expect(emailBox).toHaveFocus())
      expect(bookingRequests()).toHaveLength(0)

      // The same number books once an email is given: overseas guests are still welcome.
      fireEvent.change(emailBox, { target: { value: 'sam@example.com' } })
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      await waitFor(() => expect(bookingRequests()).toHaveLength(1))
      const sent = JSON.parse(String(bookingRequests()[0][1]?.body)) as Record<string, unknown>
      expect(sent).toMatchObject({ phone, email: 'sam@example.com' })
    })

    it('shows the management app refusing a number it cannot text beside the email box', async () => {
      await reachDetails({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }],
        bookingHandler: () =>
          jsonResponse(
            {
              success: false,
              code: 'EMAIL_REQUIRED_FOR_NON_MOBILE',
              error: {
                code: 'EMAIL_REQUIRED_FOR_NON_MOBILE',
                message: `${NON_MOBILE_MESSAGE} Call 01753 682707 if you need help.`
              }
            },
            { status: 400 }
          )
      })

      // The website's own checks pass here (a UK mobile and an email), so this is the
      // management app judging the number differently. The guest is still pointed at
      // the email box, the one place they can put it right.
      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      const emailBox = screen.getByLabelText('Email address')
      await waitFor(() => expect(emailBox).toHaveAccessibleDescription(NON_MOBILE_MESSAGE))
      expect(emailBox).toHaveAttribute('aria-invalid', 'true')
      // Beside the box, not in the alert at the top of the card.
      expect(screen.queryByText('Booking not completed')).not.toBeInTheDocument()
      expect(screen.queryByText(/all booked in/i)).not.toBeInTheDocument()
    })
  })

  // T1 analytics baseline: the documented-but-never-fired funnel steps now emit,
  // and the new schema events fire with no personal data in their payloads.
  describe('analytics baseline (T1)', () => {
    async function searchTo7pmChoose(slots?: TimeSlot[]) {
      setupFetchMock({
        availability:
          slots ?? [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }]
      })
      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
    }

    async function advanceTo7pmDetails() {
      await chooseTime(/7pm/)
      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
    }

    it('fires the availability_check funnel step once a search returns', async () => {
      await searchTo7pmChoose()

      expect(trackTableBookingFunnel).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'availability_check',
          partySize: 2,
          bookingDate: '2026-07-07',
          source: 'direct'
        })
      )
    })

    it('fires the details_entered funnel step when guest details pass validation', async () => {
      await searchTo7pmChoose()
      await advanceTo7pmDetails()
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
      // There is no review screen: the details pass inside Confirm.
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))
      expect(trackTableBookingFunnel).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'details_entered',
          partySize: 2,
          bookingDate: '2026-07-07',
          bookingTime: '19:00'
        })
      )
    })

    it('fires booking_step_viewed for each wizard step, starting with find on mount', async () => {
      await searchTo7pmChoose()

      expect(trackBookingStepViewed).toHaveBeenCalledWith({ step: 'find' })
      // The times arrive on the find screen: there is no separate step.
      expect(trackBookingStepViewed).not.toHaveBeenCalledWith({ step: 'choose' })

      await advanceTo7pmDetails()
      expect(trackBookingStepViewed).toHaveBeenCalledWith({ step: 'details' })
    })

    it('fires option_toggled for the find-step drinks toggle with the new value and step', async () => {
      await searchTo7pmChoose()

      fireEvent.click(screen.getByLabelText(/Just drinks, no food/))

      expect(trackOptionToggled).toHaveBeenCalledWith({
        option: 'drinks_only',
        value: true,
        step: 'find'
      })
    })

    // A step-free seating request infers a mobility impairment: special-category
    // data under UK GDPR Article 9. Analytics-cookie consent is not Article 9
    // explicit consent, and these events land in GA4 alongside a session id and
    // a booking reference, so the attribute would be joinable to a named
    // booking. It must never be tracked, by any event, on any step.
    it('never sends the accessible-table request to analytics', async () => {
      await searchTo7pmChoose()
      trackOptionToggled.mockClear()

      fireEvent.click(screen.getByLabelText(/Step-free, standard-height table/))
      fireEvent.click(screen.getByLabelText(/Step-free, standard-height table/))
      await act(async () => {})

      expect(trackOptionToggled).not.toHaveBeenCalled()

      const everyAnalyticsCall = [
        ...trackOptionToggled.mock.calls,
        ...pushToDataLayer.mock.calls,
        ...trackBookingStepViewed.mock.calls,
        ...trackTableBookingFunnel.mock.calls,
        ...trackTableBookingClick.mock.calls,
        ...trackSlotFlagShown.mock.calls,
        ...trackSlotInvalidated.mock.calls,
        ...trackBookingErrorShown.mock.calls
      ]
      for (const call of everyAnalyticsCall) {
        expect(JSON.stringify(call)).not.toMatch(/accessible/i)
      }
    })

    it('fires option_toggled for the high chairs and outside table, from the find screen they sit on', async () => {
      await searchTo7pmChoose()

      fireEvent.click(screen.getByRole('radio', { name: '1 high chair' }))
      expect(trackOptionToggled).toHaveBeenCalledWith({
        option: 'high_chair_count',
        value: 1,
        step: 'find'
      })

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      expect(trackOptionToggled).toHaveBeenCalledWith({
        option: 'outside_seating',
        value: true,
        step: 'find'
      })
      await act(async () => {})
    })

    it('fires slot_flag_shown when a newly chosen slot cannot cover the requested chairs', async () => {
      await searchTo7pmChoose([
        { time: '19:00', available: true, available_capacity: 4, kitchen_open: true, high_chairs_remaining: 2 },
        { time: '20:00', available: true, available_capacity: 4, kitchen_open: true, high_chairs_remaining: 1 }
      ])

      // Ask for two chairs, then pick the 8pm slot, which only has one left.
      fireEvent.click(screen.getByRole('radio', { name: '2 high chairs' }))
      fireEvent.click(await screen.findByRole('button', { name: /^8pm,.*1 high chair free/ }))

      await waitFor(() =>
        expect(trackSlotFlagShown).toHaveBeenCalledWith({ chairsFree: 1, chairsRequested: 2 })
      )
    })

    it('fires slot_invalidated and a machine error code when options change kill the chosen time', async () => {
      setupFetchMock({
        availability: (url: string) =>
          url.includes('outside=true')
            ? { time_slots: [{ time: '20:00', available: true, available_capacity: 4, kitchen_open: true }] }
            : { time_slots: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }] }
      })
      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: /^7pm,/ }))

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))

      await waitFor(() =>
        expect(screen.getByText(/is not available with those options/i)).toBeInTheDocument()
      )
      expect(trackSlotInvalidated).toHaveBeenCalledWith({ reason: 'options_changed' })
      expect(trackBookingErrorShown).toHaveBeenCalledWith({ code: 'slot_options_changed' })
    })

    it('fires booking_error_shown with the blocked reason when the server blocks the booking', async () => {
      setupFetchMock({
        availability: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }],
        bookingResponse: {
          state: 'blocked',
          table_booking_id: null,
          booking_reference: null,
          blocked_reason: 'no_table',
          next_step_url: null,
          hold_expires_at: null,
          table_name: null,
          reason: null
        }
      })
      render(<ManagementTableBookingForm />)
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '2' } })
      fireEvent.blur(screen.getByLabelText('Party size'))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
      await chooseTime(/7pm/)
      fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
      await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
      fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
      fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
      fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

      await waitFor(() =>
        expect(trackBookingErrorShown).toHaveBeenCalledWith({ code: 'no_table' })
      )
    })

    it('keeps personal data out of every new event payload', async () => {
      await searchTo7pmChoose()
      await advanceTo7pmDetails()

      const personal = /07700900000|Sam|Walker/
      const newEventCalls = [
        ...trackBookingStepViewed.mock.calls,
        ...trackOptionToggled.mock.calls,
        ...trackSlotFlagShown.mock.calls,
        ...trackSlotInvalidated.mock.calls,
        ...trackBookingErrorShown.mock.calls
      ]
      expect(newEventCalls.length).toBeGreaterThan(0)
      for (const call of newEventCalls) {
        expect(JSON.stringify(call)).not.toMatch(personal)
      }
    })
  })
})
