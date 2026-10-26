import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { clearBookingAttributionForTest } from '@/lib/booking-attribution'

/**
 * Review BK-099: booking an event from the "events on this date" panel on
 * /book-table.
 *
 * The panel used to open the event form with only the event's id, name, slug
 * and date. So a paid night with questions showed no price, asked no names or
 * answers, and AMS refused the first submit with BOOKING_QUESTIONS_CHANGED.
 * These tests drive the real panel and the real event form against a mocked
 * network, and check the form gets the whole event before it is shown.
 */

jest.mock('@/lib/gtm-events', () => ({
  trackTableBookingClick: jest.fn(),
  trackTableBookingFunnel: jest.fn(),
  pushToDataLayer: jest.fn(),
  trackBookingStepViewed: jest.fn(),
  trackOptionToggled: jest.fn(),
  trackSlotFlagShown: jest.fn(),
  trackSlotInvalidated: jest.fn(),
  trackBookingErrorShown: jest.fn(),
  trackEventBookingStart: jest.fn(),
  trackEventBookingComplete: jest.fn(),
  trackEventBookingFunnelStep: jest.fn(),
  trackDirectionsClick: jest.fn(),
  trackAddToCalendarClick: jest.fn()
}))

// PayPal's SDK fetches a remote script; the hold-for-payment screen is enough.
jest.mock('@/components/features/EventBooking/PayPalEventPaymentSection', () => ({
  PayPalEventPaymentSection: () => <p>Mock PayPal payment</p>
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/book-table',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() })
}))

const BOOKING_DATE = '2026-07-07'
const EVENT_ID = 'evt-tasting'

// The card the panel lists: no payment mode, no questions, no booking mode.
const LISTED_EVENT = {
  id: EVENT_ID,
  slug: 'tasting-night',
  name: 'Tasting Night',
  startDate: '2026-07-07T18:00:00.000Z',
  offers: { price: '25', priceCurrency: 'GBP' }
}

// The event as /api/events/{id} returns it: what the form actually needs.
const FULL_EVENT = {
  ...LISTED_EVENT,
  payment_mode: 'prepaid',
  booking_mode: 'general',
  price: 25,
  booking_questions: [
    { id: 'dietary', label: 'Any dietary needs?', type: 'text', required: true }
  ]
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

type Mocks = {
  eventDetails: () => Promise<Response>
  bookings: Array<Record<string, unknown>>
}

function setupFetch(eventDetails: () => Promise<Response>): Mocks {
  const mocks: Mocks = { eventDetails, bookings: [] }
  ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.startsWith('/api/events?')) {
      return Promise.resolve(jsonResponse({ success: true, data: { events: [LISTED_EVENT] } }))
    }
    if (url.startsWith(`/api/events/${EVENT_ID}`)) {
      return mocks.eventDetails()
    }
    if (url.startsWith('/api/table-bookings/availability')) {
      return Promise.resolve(
        jsonResponse({
          success: true,
          data: {
            date: BOOKING_DATE,
            available: true,
            time_slots: [
              { time: '13:00', available: true, available_capacity: 8, bookable_purpose: 'food_or_drinks' }
            ]
          }
        })
      )
    }
    if (url === '/api/event-bookings') {
      mocks.bookings.push(JSON.parse(String(init?.body || '{}')))
      return Promise.resolve(
        jsonResponse(
          {
            success: true,
            data: {
              state: 'pending_payment',
              booking_id: 'evb-1',
              reason: null,
              seats_remaining: null,
              next_step_url: null,
              manage_booking_url: null
            }
          },
          201
        )
      )
    }
    return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
  })
  return mocks
}

const FROZEN_NOW = new Date('2026-07-06T09:00:00.000Z')

async function openSuggestedEvent() {
  render(<ManagementTableBookingForm prefill={{ date: BOOKING_DATE }} twoScreenFlow />)
  fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Book this event' }))
}

describe('booking an event suggested on the table page (BK-099)', () => {
  beforeAll(() => {
    if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
      ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
    }
  })

  beforeEach(() => {
    jest.useFakeTimers({
      now: FROZEN_NOW,
      doNotFake: [
        'clearInterval',
        'clearTimeout',
        'nextTick',
        'queueMicrotask',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'setTimeout',
        'hrtime',
        'performance',
        'requestIdleCallback',
        'cancelIdleCallback'
      ]
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    clearBookingAttributionForTest()
    window.localStorage.clear()
  })

  it('loads the whole event before showing its form', async () => {
    let release: (response: Response) => void = () => undefined
    setupFetch(() => new Promise<Response>((resolve) => { release = resolve }))
    await openSuggestedEvent()

    // Nothing to fill in until the event is here, and the wait is said out loud.
    expect(screen.getByText('Getting the latest details for this event...')).toHaveAttribute('role', 'status')
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()

    release(jsonResponse({ success: true, data: FULL_EVENT }))
    expect(await screen.findByLabelText('First name')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/events/${EVENT_ID}`,
      expect.objectContaining({ cache: 'no-store' })
    )
  })

  it('shows the price, asks for names and answers, and submits once', async () => {
    const mocks = setupFetch(() => Promise.resolve(jsonResponse({ success: true, data: FULL_EVENT })))
    await openSuggestedEvent()

    // Named for how this night books, never the old 'Reserve event table'.
    expect(await screen.findByRole('heading', { name: 'Book your places' })).toBeInTheDocument()
    expect(screen.queryByText('Reserve event table')).not.toBeInTheDocument()

    // The price and the total, for the default two tickets.
    expect(screen.getByLabelText('Ticket total')).toHaveTextContent('£50')

    // A name and an answer for each ticket.
    const names = screen.getAllByLabelText(/Ticket \d+ full name/)
    const answers = screen.getAllByLabelText('Any dietary needs? (required)')
    expect(names).toHaveLength(2)
    expect(answers).toHaveLength(2)
    names.forEach((input, index) => fireEvent.change(input, { target: { value: `Guest ${index + 1}` } }))
    answers.forEach((input, index) => fireEvent.change(input, { target: { value: index === 0 ? 'Vegan' : 'None' } }))

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Guest' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700900123' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } })

    fireEvent.click(screen.getByRole('button', { name: 'Book your places' }))

    expect(await screen.findByText('Mock PayPal payment')).toBeInTheDocument()
    expect(mocks.bookings).toHaveLength(1)
    expect(mocks.bookings[0]).toMatchObject({
      event_id: EVENT_ID,
      seats: 2,
      expected_total: 50,
      attendees: [
        expect.objectContaining({ name: 'Guest 1', answers: { dietary: 'Vegan' } }),
        expect.objectContaining({ name: 'Guest 2', answers: { dietary: 'None' } })
      ]
    })
  })

  it('sends the guest to the event page when the event cannot be loaded', async () => {
    setupFetch(() => Promise.resolve(jsonResponse({ success: false, error: 'unavailable' }, 503)))
    await openSuggestedEvent()

    expect(await screen.findByText('We could not load this event just now')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Book on the event page' })).toHaveAttribute(
      'href',
      '/events/tasting-night#event-booking'
    )
    // No form that might say the wrong thing.
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
  })

  it('takes the guest back to the table booking', async () => {
    setupFetch(() => Promise.resolve(jsonResponse({ success: true, data: FULL_EVENT })))
    await openSuggestedEvent()
    await screen.findByLabelText('First name')

    fireEvent.click(screen.getByRole('button', { name: 'Back to table booking' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Find a table' })).toBeInTheDocument())
    // Back on the times they searched, with focus on their heading (BK-103).
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Choose your time' })).toHaveFocus())
  })

  it('puts focus on the event screen as it opens, not on the page body (BK-103)', async () => {
    setupFetch(() => Promise.resolve(jsonResponse({ success: true, data: FULL_EVENT })))
    await openSuggestedEvent()

    expect(screen.getByRole('heading', { name: 'Event booking' })).toHaveFocus()
    await screen.findByLabelText('First name')
  })
})
