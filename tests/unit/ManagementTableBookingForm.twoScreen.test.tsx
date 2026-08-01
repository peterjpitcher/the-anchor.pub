import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { STEP_FREE_TABLE_EXPLANATION } from '@/components/features/TableBooking/TableRefinements'
import { clearBookingAttributionForTest } from '@/lib/booking-attribution'

/**
 * The approved two-screen journey (spec D1), which renders only when the
 * runtime `booking_options_step1` flag is on.
 *
 * The four-step path has its own suite in ManagementTableBookingForm.test.tsx
 * and is untouched by this one: both flows are live at once while the new one
 * is proven, so both need their own coverage.
 */

const trackTableBookingFunnel = jest.fn()
const pushToDataLayer = jest.fn()
const trackTableBookingClick = jest.fn()
const trackBookingStepViewed = jest.fn()
const trackOptionToggled = jest.fn()
const trackSlotFlagShown = jest.fn()
const trackSlotInvalidated = jest.fn()
const trackBookingErrorShown = jest.fn()

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
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

type TimeSlot = {
  time: string
  available: boolean
  available_capacity: number
  kitchen_open?: boolean
  bookable_purpose?: 'food_or_drinks' | 'drinks_only'
  busyness?: 'quiet' | 'filling' | 'busy'
  high_chairs_remaining?: number
}

function toWireSlot(slot: TimeSlot) {
  return {
    ...slot,
    bookable_purpose:
      slot.bookable_purpose ?? (slot.kitchen_open === false ? 'drinks_only' : 'food_or_drinks')
  }
}

type AvailabilityResult = {
  date?: string
  time_slots: TimeSlot[]
  calculation_state?: 'complete' | 'unknown'
  message?: string
}

type AvailabilityHandler = (url: string) => AvailabilityResult | null

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
}

function setupFetchMock(options: {
  availability: AvailabilityHandler | TimeSlot[]
  bookingResponse?: { state: string; [k: string]: unknown }
  lookupResponse?: Record<string, unknown>
  capturePayload?: { ref: { current: Record<string, unknown> | null } }
  captureUrls?: { ref: { current: string[] } }
}): jest.Mock {
  const fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.startsWith('/api/events?')) {
      return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
    }

    if (url.startsWith('/api/table-bookings/availability')) {
      if (options.captureUrls) options.captureUrls.ref.current.push(url)
      const result =
        typeof options.availability === 'function'
          ? options.availability(url)
          : { time_slots: options.availability }

      if (!result) {
        return Promise.resolve(
          jsonResponse({ success: true, data: { date: '', available: false, time_slots: [] } })
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

    if (url.startsWith('/api/customers/lookup?')) {
      return Promise.resolve(
        jsonResponse({
          success: true,
          data: options.lookupResponse ?? { known: false, lookup_degraded: false }
        })
      )
    }

    if (url === '/api/table-bookings') {
      if (options.capturePayload) {
        options.capturePayload.ref.current = JSON.parse(String(init?.body || '{}'))
      }
      return Promise.resolve(
        jsonResponse(
          {
            success: true,
            data: options.bookingResponse || {
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

    if (url === '/api/table-bookings/paypal/create-order') {
      return Promise.resolve(jsonResponse({ success: false, error: 'Not used' }, { status: 502 }))
    }

    return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
  })

  ;(global as any).fetch = fetchMock
  return fetchMock
}

beforeAll(() => {
  if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
    ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
  }
})

// Same frozen clock as the four-step suite: the form rejects past dates against
// Europe/London, so hardcoded booking dates would otherwise rot into the past.
const FROZEN_NOW = new Date('2026-07-06T09:00:00.000Z') // 10:00 BST
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

const BOOKING_DATE = '2026-07-07'

// Lunch and evening either side of the 5pm boundary, plus a kitchen-closed late
// slot, which is the shape the route really produces.
const DAY_SLOTS: TimeSlot[] = [
  { time: '12:30', available: true, available_capacity: 8, kitchen_open: true },
  { time: '13:00', available: true, available_capacity: 8, kitchen_open: true },
  { time: '18:00', available: true, available_capacity: 8, kitchen_open: true },
  { time: '22:00', available: true, available_capacity: 8, kitchen_open: false }
]

function renderTwoScreen(prefill: { date?: string; partySize?: number } = { date: BOOKING_DATE }) {
  return render(<ManagementTableBookingForm prefill={prefill} twoScreenFlow />)
}

async function findATable() {
  fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
  await screen.findByRole('button', { name: /^1pm,/ })
}

async function verifyPhoneAndFillName() {
  fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByLabelText('First Name')
  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
  fireEvent.click(screen.getByLabelText(/booking and no-show policy/i))
}

describe('ManagementTableBookingForm: two-screen flow', () => {
  beforeEach(() => {
    jest.useFakeTimers(FAKE_DATE_ONLY)
  })

  afterEach(() => {
    jest.useRealTimers()
    clearBookingAttributionForTest()
    window.localStorage.clear()
    jest.clearAllMocks()
  })

  // Party size sits on the same screen as the grid now, which is what makes
  // this reachable at all: in the four-step flow they were never on screen
  // together, so a change could not leave a stale answer on display.
  describe('changing party size after the search', () => {
    it('re-reads with the new size instead of re-labelling the old answer', async () => {
      const captureUrls = { ref: { current: [] as string[] } }
      setupFetchMock({ availability: DAY_SLOTS, captureUrls })
      renderTwoScreen()
      await findATable()

      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '8' } })
      fireEvent.blur(screen.getByLabelText('Party size'))

      await waitFor(() => expect(captureUrls.ref.current).toHaveLength(2))
      const reread = new URL(captureUrls.ref.current[1], 'https://www.the-anchor.pub')
      expect(reread.searchParams.get('party_size')).toBe('8')
    })

    it('does not fire a search per keystroke', async () => {
      const captureUrls = { ref: { current: [] as string[] } }
      setupFetchMock({ availability: DAY_SLOTS, captureUrls })
      renderTwoScreen()
      await findATable()

      const input = screen.getByLabelText('Party size')
      fireEvent.change(input, { target: { value: '1' } })
      fireEvent.change(input, { target: { value: '12' } })
      fireEvent.change(input, { target: { value: '2' } })

      // Nothing is settled until they leave the field.
      expect(captureUrls.ref.current).toHaveLength(1)
    })

    it('never carries a time affirmed for the old size over to the new one', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      setupFetchMock({
        availability: (url) =>
          url.includes('party_size=8')
            ? { time_slots: [{ time: '18:00', available: true, available_capacity: 8, kitchen_open: true }] }
            : { time_slots: DAY_SLOTS },
        capturePayload
      })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      expect(screen.getByRole('button', { name: 'Continue with 1pm' })).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '8' } })
      fireEvent.blur(screen.getByLabelText('Party size'))

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^Continue with/ })).not.toBeInTheDocument()
      })
      expect(screen.queryByRole('button', { name: /^1pm,/ })).not.toBeInTheDocument()
      expect(capturePayload.ref.current).toBeNull()
    })

    it('keeps the time when the new size still fits it', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '4' } })
      fireEvent.blur(screen.getByLabelText('Party size'))

      await waitFor(() => {
        expect(screen.getByText(/for 4 guests/)).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Continue with 1pm' })).toBeInTheDocument()
    })
  })

  describe('screen 1: find a table', () => {
    it('asks for party size and date only, and no preferred time', () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()

      expect(screen.getByLabelText('Party size')).toBeInTheDocument()
      expect(screen.getByLabelText('Date')).toBeInTheDocument()
      expect(screen.queryByLabelText('Preferred Time')).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/preferred time/i)).not.toBeInTheDocument()
    })

    it('shows nothing to refine until a search has actually run', () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()

      expect(screen.queryByText('Anything that changes the table?')).not.toBeInTheDocument()
    })

    it('puts the times on the same page, grouped Lunch and Evening', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      // Still screen 1: the search fields are on the page beside the grid.
      expect(screen.getByLabelText('Party size')).toBeInTheDocument()

      const lunch = screen.getByRole('heading', { name: 'Lunch' }).parentElement as HTMLElement
      const evening = screen.getByRole('heading', { name: 'Evening' }).parentElement as HTMLElement

      expect(within(lunch).getByRole('button', { name: /^12:30pm,/ })).toBeInTheDocument()
      expect(within(lunch).getByRole('button', { name: /^1pm,/ })).toBeInTheDocument()
      expect(within(evening).getByRole('button', { name: /^6pm,/ })).toBeInTheDocument()
      expect(within(evening).getByRole('button', { name: /^10pm,/ })).toBeInTheDocument()
    })

    it('shows every time, with no seven-slot window to expand', async () => {
      setupFetchMock({
        availability: Array.from({ length: 12 }, (_, index) => ({
          time: `${String(12 + index).padStart(2, '0')}:00`,
          available: true,
          available_capacity: 8,
          kitchen_open: true
        }))
      })
      renderTwoScreen()

      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await screen.findByRole('button', { name: /^11pm,/ })

      expect(screen.queryByRole('button', { name: /see more times/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^12pm,/ })).toBeInTheDocument()
    })

    it('labels each time from its bookable purpose, never from the clock', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      expect(screen.getByRole('button', { name: '1pm, drinks and food' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '10pm, drinks only' })).toBeInTheDocument()
    })

    it('asks about the day, not a time the guest never chose', async () => {
      const captureUrls = { ref: { current: [] as string[] } }
      setupFetchMock({ availability: DAY_SLOTS, captureUrls })
      renderTwoScreen()
      await findATable()

      const url = new URL(captureUrls.ref.current[0], 'https://www.the-anchor.pub')
      expect(url.searchParams.get('date')).toBe(BOOKING_DATE)
      expect(url.searchParams.get('time')).toBe('12:00')
    })

    it('picks nothing for the guest: they choose the time themselves', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      expect(screen.getByRole('button', { name: /^1pm,/ })).toHaveAttribute('aria-pressed', 'false')
      expect(screen.queryByRole('button', { name: /^Continue with/ })).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))

      expect(screen.getByRole('button', { name: /^1pm,/ })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: 'Continue with 1pm' })).toBeInTheDocument()
    })
  })

  describe('the refinements, all four of them, on screen 1', () => {
    it('renders the group above the grid with every option in it', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      expect(screen.getByText('Anything that changes the table?')).toBeInTheDocument()
      expect(screen.getByLabelText(/Just drinks, no food/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Outside table, weather permitting/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Step-free, standard-height table/)).toBeInTheDocument()
      expect(screen.getByRole('radiogroup', { name: 'High chairs' })).toBeInTheDocument()
    })

    it('offers high chairs as 0, 1 or 2, not a checkbox', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      const group = screen.getByRole('radiogroup', { name: 'High chairs' })
      const options = within(group).getAllByRole('radio')

      expect(options.map((option) => option.textContent)).toEqual(['0', '1', '2'])
      expect(within(group).getByRole('radio', { name: 'No high chairs' })).toHaveAttribute(
        'aria-checked',
        'true'
      )
    })

    it('reveals the owner-approved step-free copy, word for word', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      expect(screen.queryByTestId('step-free-explanation')).not.toBeInTheDocument()

      fireEvent.click(screen.getByLabelText(/Step-free, standard-height table/))

      expect(screen.getByTestId('step-free-explanation')).toHaveTextContent(
        STEP_FREE_TABLE_EXPLANATION
      )
      // The facts the owner confirmed, and the claim the copy must never make.
      expect(STEP_FREE_TABLE_EXPLANATION).toContain('We do not have an accessible toilet.')
      expect(STEP_FREE_TABLE_EXPLANATION).toContain('The garden is step free.')
      expect(STEP_FREE_TABLE_EXPLANATION.toLowerCase()).not.toContain('accessible pub')
      expect(STEP_FREE_TABLE_EXPLANATION.toLowerCase()).not.toContain('wheelchair')
    })

    it('re-reads availability in place when a refinement changes', async () => {
      const captureUrls = { ref: { current: [] as string[] } }
      setupFetchMock({
        availability: (url) =>
          url.includes('purpose=drinks')
            ? { time_slots: [{ time: '22:00', available: true, available_capacity: 8, kitchen_open: false }] }
            : { time_slots: DAY_SLOTS },
        captureUrls
      })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByLabelText(/Just drinks, no food/))

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^1pm,/ })).not.toBeInTheDocument()
      })

      // The grid is still on screen 1, answering the new question.
      expect(screen.getByRole('button', { name: /^10pm,/ })).toBeInTheDocument()
      expect(screen.getByText('Anything that changes the table?')).toBeInTheDocument()
      expect(captureUrls.ref.current[1]).toContain('purpose=drinks')
    })

    it('sends every refinement to the availability route, not just the date and size', async () => {
      const captureUrls = { ref: { current: [] as string[] } }
      setupFetchMock({ availability: DAY_SLOTS, captureUrls })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      await waitFor(() => expect(captureUrls.ref.current.length).toBeGreaterThan(1))

      fireEvent.click(screen.getByLabelText(/Step-free, standard-height table/))
      await waitFor(() => expect(captureUrls.ref.current.length).toBeGreaterThan(2))

      const latest = new URL(captureUrls.ref.current.at(-1) as string, 'https://www.the-anchor.pub')
      expect(latest.searchParams.get('outside')).toBe('true')
      expect(latest.searchParams.get('requires_accessible_table')).toBe('true')
      expect(latest.searchParams.get('high_chair_count')).toBe('0')
    })

    it('greys a time out when it stops qualifying, rather than letting it be tapped', async () => {
      setupFetchMock({
        availability: (url) =>
          url.includes('outside=true')
            ? {
                time_slots: [
                  { time: '13:00', available: false, available_capacity: 0, kitchen_open: true },
                  { time: '18:00', available: true, available_capacity: 8, kitchen_open: true }
                ]
              }
            : { time_slots: DAY_SLOTS }
      })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^1pm,.*not available with your options/ })).toBeDisabled()
      })
      expect(screen.getByRole('button', { name: /^6pm,/ })).toBeEnabled()
    })
  })

  describe('high-chair shortfall (owner decision D4)', () => {
    const SHORTFALL_SLOTS: TimeSlot[] = [
      { time: '13:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 1 },
      { time: '18:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 2 }
    ]

    it('flags a short time and leaves it tappable', async () => {
      setupFetchMock({ availability: SHORTFALL_SLOTS })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('radio', { name: '2 high chairs' }))

      const flagged = await screen.findByRole('button', { name: /^1pm,.*1 high chair free/ })
      expect(flagged).toBeEnabled()
      expect(flagged).toHaveTextContent('1 high chair free')
      expect(screen.getByRole('button', { name: /^6pm,/ })).not.toHaveTextContent('high chair free')
    })

    it('hides a time only when no chair is free at all', async () => {
      setupFetchMock({
        availability: [
          { time: '13:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 0 },
          { time: '18:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 2 }
        ]
      })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('radio', { name: '1 high chair' }))

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^1pm,/ })).not.toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /^6pm,/ })).toBeInTheDocument()
      expect(screen.getByText(/Set high chairs to 0 to see them/)).toBeInTheDocument()
    })

    it('takes the selection and the Continue button with the time it hides', async () => {
      // The grid hides a time with no chair free, so the re-validation has to
      // agree with it. A rule that only checks capacity leaves the guest on a
      // time that is not on screen, with Continue still lit.
      setupFetchMock({
        availability: [
          { time: '13:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 0 },
          { time: '18:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 2 }
        ]
      })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      expect(screen.getByRole('button', { name: 'Continue with 1pm' })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('radio', { name: '1 high chair' }))

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^1pm,/ })).not.toBeInTheDocument()
      })
      expect(screen.queryByRole('button', { name: /^Continue with/ })).not.toBeInTheDocument()
    })

    it('does not read a shortfall that appeared afterwards as consent to it', async () => {
      // They tapped 1pm when no chairs were in play. The shortfall arrived
      // underneath them, so they have consented to nothing: the time goes back
      // and they choose again with the flag in front of them.
      setupFetchMock({ availability: SHORTFALL_SLOTS })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      fireEvent.click(screen.getByRole('radio', { name: '2 high chairs' }))

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^Continue with/ })).not.toBeInTheDocument()
      })
      expect(
        screen.getByText(/1pm now has only 1 high chair free/)
      ).toBeInTheDocument()

      // The time is still offered, flagged, and tapping it is the consent.
      const flagged = screen.getByRole('button', { name: /^1pm,.*1 high chair free/ })
      fireEvent.click(flagged)
      expect(screen.getByRole('button', { name: 'Continue with 1pm' })).toBeInTheDocument()
    })

    it('never strands a guest whose chairs have taken every time away', async () => {
      setupFetchMock({
        availability: [
          { time: '13:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 0 }
        ]
      })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('radio', { name: '2 high chairs' }))

      expect(await screen.findByText('No high chairs left on this date')).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'No high chairs' })).toBeEnabled()
    })

    it('books the number the guest asked for, not the number that was free', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      setupFetchMock({ availability: SHORTFALL_SLOTS, capturePayload })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('radio', { name: '2 high chairs' }))
      const flagged = await screen.findByRole('button', { name: /^1pm,.*1 high chair free/ })
      fireEvent.click(flagged)
      fireEvent.click(screen.getByRole('button', { name: 'Continue with 1pm' }))

      await verifyPhoneAndFillName()
      // The shortfall is restated where they confirm, so tapping the flagged
      // time was an informed choice rather than a surprise.
      expect(screen.getByText(/2 high chairs requested, 1 high chair free at this time/)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Confirm booking' }))

      await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
      expect(capturePayload.ref.current?.high_chair_count).toBe(2)
    })
  })

  describe('when a refinement kills the time already chosen', () => {
    it('drops it with an inline message naming the time and why', async () => {
      setupFetchMock({
        availability: (url) =>
          url.includes('outside=true')
            ? { time_slots: [{ time: '18:00', available: true, available_capacity: 8, kitchen_open: true }] }
            : { time_slots: DAY_SLOTS }
      })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))

      expect(
        await screen.findByText('1pm is not available with those options. Please choose another time.')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^6pm,/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^Continue with/ })).not.toBeInTheDocument()
      expect(trackSlotInvalidated).toHaveBeenCalledWith({ reason: 'options_changed' })
    })

    it('keeps the time, and its purpose, when the fresh answer still affirms it', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      setupFetchMock({
        availability: (url) =>
          url.includes('outside=true')
            ? {
                time_slots: [
                  { time: '13:00', available: true, available_capacity: 8, bookable_purpose: 'drinks_only' }
                ]
              }
            : { time_slots: DAY_SLOTS },
        capturePayload
      })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '1pm, drinks only' })).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('button', { name: 'Continue with 1pm' }))
      await verifyPhoneAndFillName()

      // The fresh answer said drinks, so drinks is what gets booked. The purpose
      // captured before the refinement must not survive it.
      expect(screen.getByText('Drinks only')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Confirm booking' }))

      await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
      expect(capturePayload.ref.current?.purpose).toBe('drinks')
      // The form's wire key; the proxy renames it to `outside_seating` for AMS.
      expect(capturePayload.ref.current?.is_outside_seating).toBe(true)
    })

    it('drops a time tapped from the grid that a re-read has already replaced', async () => {
      let releaseRefinement: (() => void) | null = null
      setupFetchMock({
        availability: (url) =>
          url.includes('outside=true')
            ? { time_slots: [{ time: '18:00', available: true, available_capacity: 8, kitchen_open: true }] }
            : { time_slots: DAY_SLOTS }
      })

      const realFetch = (global as any).fetch as jest.Mock
      ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('outside=true')) {
          return new Promise<Response>((resolve) => {
            releaseRefinement = () => resolve(realFetch(input, init) as unknown as Response)
          })
        }
        return realFetch(input, init)
      })

      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      // Tapped against the grid that answered the PREVIOUS question.
      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      expect(screen.getByRole('button', { name: 'Continue with 1pm' })).toBeInTheDocument()

      await act(async () => {
        releaseRefinement?.()
        await Promise.resolve()
      })

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^Continue with/ })).not.toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /^6pm,/ })).toBeInTheDocument()
    })

    it('never lets a settled but superseded answer write to the grid', async () => {
      let releaseFirst: (() => void) | null = null
      setupFetchMock({
        availability: (url) => {
          if (url.includes('requires_accessible_table=true')) {
            return { time_slots: [{ time: '18:00', available: true, available_capacity: 8, kitchen_open: true }] }
          }
          return { time_slots: DAY_SLOTS }
        }
      })

      // Hold the first refinement's response open, start a second refinement,
      // then let the first land. The stale answer must be discarded.
      const realFetch = (global as any).fetch as jest.Mock
      ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('outside=true') && !url.includes('requires_accessible_table=true')) {
          return new Promise<Response>((resolve) => {
            releaseFirst = () => resolve(realFetch(input, init) as unknown as Response)
          })
        }
        return realFetch(input, init)
      })

      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      fireEvent.click(screen.getByLabelText(/Step-free, standard-height table/))

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^1pm,/ })).not.toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /^6pm,/ })).toBeInTheDocument()

      await act(async () => {
        releaseFirst?.()
        await Promise.resolve()
      })

      // Still the accessible answer, not the outside-only one that landed late.
      expect(screen.queryByRole('button', { name: /^1pm,/ })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^6pm,/ })).toBeInTheDocument()
    })
  })

  describe('the nearest-alternatives panel', () => {
    it('discards a probe that a refinement has already outdated', async () => {
      // The probes went out asking about INSIDE tables. By the time they land
      // the guest has asked for an outside one, so their answers were affirmed
      // for a question nobody is asking any more.
      const releases: Array<() => void> = []
      setupFetchMock({ availability: [] })
      const realFetch = (global as any).fetch as jest.Mock
      ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        const isProbe =
          url.startsWith('/api/table-bookings/availability') && !url.includes(`date=${BOOKING_DATE}`)
        if (isProbe && !url.includes('outside=true')) {
          return new Promise<Response>((resolve) => {
            releases.push(() =>
              resolve(
                jsonResponse({
                  success: true,
                  data: {
                    date: '2026-07-08',
                    available: true,
                    time_slots: [
                      toWireSlot({ time: '19:00', available: true, available_capacity: 8, kitchen_open: true })
                    ]
                  }
                })
              )
            )
          })
        }
        return realFetch(input, init)
      })

      renderTwoScreen()
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await screen.findByText('No online times available')
      await waitFor(() => expect(releases.length).toBeGreaterThan(0))

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))

      await act(async () => {
        releases.forEach((release) => release())
        await Promise.resolve()
      })

      await waitFor(() => {
        expect(screen.getByText('No nearby online alternatives were found.')).toBeInTheDocument()
      })
      expect(screen.queryByRole('button', { name: /7pm/ })).not.toBeInTheDocument()
    })

    it('cannot be taken while a re-read is about to replace it', async () => {
      // Tapping one moves the guest to the details step. Doing that under an
      // answer already being superseded lets the re-read void their time while
      // they sit on a screen that still shows it.
      let releaseReread: (() => void) | null = null
      setupFetchMock({
        availability: (url) =>
          url.includes('date=2026-07-08')
            ? {
                date: '2026-07-08',
                time_slots: [
                  { time: '19:00', available: true, available_capacity: 8, kitchen_open: true }
                ]
              }
            : { date: BOOKING_DATE, time_slots: [] }
      })
      const realFetch = (global as any).fetch as jest.Mock
      ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('outside=true') && url.includes(`date=${BOOKING_DATE}`)) {
          return new Promise<Response>((resolve) => {
            releaseReread = () => resolve(realFetch(input, init) as unknown as Response)
          })
        }
        return realFetch(input, init)
      })

      renderTwoScreen()
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      const alternative = await screen.findByRole('button', { name: /7pm/ })

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      await waitFor(() => expect(releaseReread).not.toBeNull())

      expect(alternative).toBeDisabled()
    })
  })

  describe('two availability requests overtaking each other', () => {
    it('leaves Find a table usable when a re-read supersedes a search', async () => {
      // Only the superseded request could clear its own pending flag, and it is
      // no longer allowed to, so whichever request takes over has to clear it.
      let releaseSecondSearch: (() => void) | null = null
      setupFetchMock({ availability: DAY_SLOTS })
      const realFetch = (global as any).fetch as jest.Mock
      let searchCount = 0
      ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.startsWith('/api/table-bookings/availability')) {
          searchCount += 1
          if (searchCount === 2) {
            return new Promise<Response>((resolve) => {
              releaseSecondSearch = () => resolve(realFetch(input, init) as unknown as Response)
            })
          }
        }
        return realFetch(input, init)
      })

      renderTwoScreen()
      await findATable()

      // A second search, held in flight, then a refinement overtakes it.
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await waitFor(() => expect(releaseSecondSearch).not.toBeNull())
      fireEvent.click(screen.getByLabelText(/Just drinks, no food/))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Find a table' })).toBeEnabled()
      })
    })
  })

  describe('a reading belongs to one date', () => {
    function setupAlternativeSearch(capturePayload?: {
      ref: { current: Record<string, unknown> | null }
    }) {
      setupFetchMock({
        availability: (url) =>
          url.includes('date=2026-07-08')
            ? {
                date: '2026-07-08',
                time_slots: [
                  { time: '19:00', available: true, available_capacity: 8, kitchen_open: true }
                ]
              }
            : { date: BOOKING_DATE, time_slots: [] },
        ...(capturePayload ? { capturePayload } : {})
      })
    }

    it('never presents one date’s reading under another date', async () => {
      setupAlternativeSearch()
      renderTwoScreen()
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await screen.findByText('No online times available')
      fireEvent.click(await screen.findByRole('button', { name: /7pm/ }))
      await screen.findByRole('heading', { name: 'Your details' })

      // Back to the times. The reading in hand is 7 July's; the date on screen
      // is now 8 July, and it has no standing to say anything about that day.
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      await screen.findByRole('heading', { name: 'Find a table' })

      expect(screen.queryByRole('heading', { name: 'Choose your time' })).not.toBeInTheDocument()
      expect(screen.queryByText('No online times available')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^7pm,/ })).not.toBeInTheDocument()
    })

    it('still books the alternative it was chosen for', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      setupAlternativeSearch(capturePayload)
      renderTwoScreen()
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await screen.findByText('No online times available')
      fireEvent.click(await screen.findByRole('button', { name: /7pm/ }))
      await screen.findByRole('heading', { name: 'Your details' })

      await verifyPhoneAndFillName()
      fireEvent.click(screen.getByRole('button', { name: 'Confirm booking' }))

      await waitFor(() => expect(capturePayload.ref.current).not.toBeNull())
      expect(capturePayload.ref.current).toMatchObject({ date: '2026-07-08', time: '19:00' })
    })
  })

  describe('screen 2: your details', () => {
    async function reachDetails() {
      renderTwoScreen()
      await findATable()
      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue with 1pm' }))
      await screen.findByRole('heading', { name: 'Your details' })
    }

    it('carries no table options at all', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      await reachDetails()

      expect(screen.queryByText('Anything that changes the table?')).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/outside table/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/high chair/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('radiogroup', { name: 'High chairs' })).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/step-free/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/just drinks/i)).not.toBeInTheDocument()
    })

    it('states what is being booked inline, with no separate review screen', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      await reachDetails()

      expect(screen.getByText('Your table')).toBeInTheDocument()
      expect(screen.getByText(/Tuesday, July 7, 2026 at 1pm/)).toBeInTheDocument()
      expect(screen.getByText('2 guests')).toBeInTheDocument()
      expect(screen.getByText('Table for food')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /continue to review/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /review your booking/i })).not.toBeInTheDocument()
    })

    it('names the table options they chose on screen 1', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByLabelText(/Outside table, weather permitting/))
      await waitFor(() => expect(screen.getByLabelText(/Outside table, weather permitting/)).toBeChecked())
      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue with 1pm' }))
      await screen.findByRole('heading', { name: 'Your details' })

      expect(screen.getByText('Outside table, weather permitting')).toBeInTheDocument()
    })

    it('confirms straight from here, in one action', async () => {
      const capturePayload = { ref: { current: null as Record<string, unknown> | null } }
      setupFetchMock({ availability: DAY_SLOTS, capturePayload })
      await reachDetails()
      await verifyPhoneAndFillName()

      fireEvent.click(screen.getByRole('button', { name: 'Confirm booking' }))

      expect(await screen.findByText(/all booked in/i)).toBeInTheDocument()
      expect(capturePayload.ref.current).toMatchObject({
        date: BOOKING_DATE,
        time: '13:00',
        party_size: 2,
        purpose: 'food',
        first_name: 'Sam'
      })
    })

    it('sends the guest back to the times, not to a step that no longer exists', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      await reachDetails()

      fireEvent.click(screen.getByRole('button', { name: 'Back' }))

      expect(await screen.findByRole('heading', { name: 'Choose your time' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^1pm,/ })).toHaveAttribute('aria-pressed', 'true')
    })

    it('shows two steps in the progress bar, not four', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()

      const bar = screen.getByRole('progressbar', { name: 'Booking progress' })
      expect(bar).toHaveAttribute('aria-valuemax', '2')
      expect(bar).toHaveAttribute('aria-valuetext', 'Step 1 of 2: Find a table')
      expect(screen.queryByText('Review & book')).not.toBeInTheDocument()
    })
  })

  describe('never stranded', () => {
    it('offers a retry and the phone number when the check could not run', async () => {
      setupFetchMock({ availability: { time_slots: [], calculation_state: 'unknown' } as any })
      renderTwoScreen()

      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      expect(await screen.findByText('We could not check live availability')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: /01753 682707/ }).length).toBeGreaterThan(0)
      // And nothing guessed is offered as bookable.
      expect(screen.queryByRole('heading', { name: 'Lunch' })).not.toBeInTheDocument()
    })

    it('points a food search at the drinks option when the kitchen has nothing', async () => {
      setupFetchMock({ availability: [] })
      renderTwoScreen()

      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      expect(await screen.findByText('No online times available')).toBeInTheDocument()
      expect(screen.getByText(/If you only want drinks, tick/)).toBeInTheDocument()
      // The refinements are on screen so they can act on that advice.
      expect(screen.getByLabelText(/Just drinks, no food/)).toBeInTheDocument()
    })

    it('refuses a date more than twelve months out, and caps the picker at it', async () => {
      const captureUrls = { ref: { current: [] as string[] } }
      setupFetchMock({ availability: DAY_SLOTS, captureUrls })
      renderTwoScreen()

      expect(screen.getByLabelText('Date')).toHaveAttribute('max', '2027-07-06')

      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2027-07-07' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

      expect(await screen.findByText(/We take bookings up to 12 months ahead/)).toBeInTheDocument()
      expect(captureUrls.ref.current).toHaveLength(0)
    })
  })

  describe('analytics', () => {
    it('never sends the step-free request anywhere', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByLabelText(/Step-free, standard-height table/))
      await waitFor(() => expect(screen.getByLabelText(/Step-free, standard-height table/)).toBeChecked())

      // Special-category data under UK GDPR Article 9. Analytics-cookie consent
      // is not Article 9 explicit consent, so this option is never tracked.
      const everyPayload = JSON.stringify([
        ...trackOptionToggled.mock.calls,
        ...trackTableBookingFunnel.mock.calls,
        ...trackTableBookingClick.mock.calls,
        ...pushToDataLayer.mock.calls,
        ...trackBookingStepViewed.mock.calls
      ])
      expect(everyPayload).not.toContain('accessible')
      expect(everyPayload).not.toContain('step_free')
      expect(everyPayload).not.toContain('step-free')
    })

    it('records the other three refinements with the screen they were set on', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      fireEvent.click(screen.getByLabelText(/Just drinks, no food/))
      expect(trackOptionToggled).toHaveBeenCalledWith({
        option: 'drinks_only',
        value: true,
        step: 'find'
      })

      await waitFor(() => expect(screen.getByLabelText(/Just drinks, no food/)).toBeChecked())
      fireEvent.click(screen.getByRole('radio', { name: '2 high chairs' }))
      expect(trackOptionToggled).toHaveBeenCalledWith({
        option: 'high_chair_count',
        value: 2,
        step: 'find'
      })
    })

    it('fires the funnel steps the two-screen journey actually has', async () => {
      setupFetchMock({ availability: DAY_SLOTS })
      renderTwoScreen()
      await findATable()

      expect(trackTableBookingFunnel).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'availability_check' })
      )

      fireEvent.click(screen.getByRole('button', { name: /^1pm,/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue with 1pm' }))
      await screen.findByRole('heading', { name: 'Your details' })
      await verifyPhoneAndFillName()
      fireEvent.click(screen.getByRole('button', { name: 'Confirm booking' }))

      await waitFor(() => {
        expect(trackTableBookingFunnel).toHaveBeenCalledWith(
          expect.objectContaining({ step: 'details_entered' })
        )
      })
      expect(trackBookingStepViewed.mock.calls.map((call) => call[0].step)).toEqual([
        'find',
        'details'
      ])
    })
  })
})
