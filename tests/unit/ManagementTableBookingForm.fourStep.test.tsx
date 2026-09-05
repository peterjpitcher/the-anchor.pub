import { fixtureBookingContext } from '@/lib/nations-championship/booking-context-shared'
import { nationsFixture } from '../fixtures/nations-championship'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { clearBookingAttributionForTest } from '@/lib/booking-attribution'

/**
 * The four-step journey, which is what production serves: the two-screen flag
 * fails closed to off.
 *
 * The big four-step suite lives in ManagementTableBookingForm.test.tsx. This
 * file covers the shared machinery that the two-screen work reaches into, where
 * a change made for the new flow can regress the live one. Every test here runs
 * with the flag OFF, deliberately.
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
  high_chairs_remaining?: number
}

function toWireSlot(slot: TimeSlot) {
  return { ...slot, bookable_purpose: slot.kitchen_open === false ? 'drinks_only' : 'food_or_drinks' }
}

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
}

function setupFetchMock(availability: (url: URL) => { date?: string; time_slots: TimeSlot[] }): jest.Mock {
  const fetchMock = jest.fn((input: RequestInfo | URL) => {
    const raw = typeof input === 'string' ? input : input.toString()

    if (raw.startsWith('/api/events?')) {
      return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
    }

    if (raw.startsWith('/api/table-bookings/availability')) {
      const url = new URL(raw, 'https://www.the-anchor.pub')
      const result = availability(url)
      return Promise.resolve(
        jsonResponse({
          success: true,
          data: {
            date: result.date ?? url.searchParams.get('date') ?? '',
            available: result.time_slots.some((slot) => slot.available),
            time_slots: result.time_slots.map(toWireSlot)
          }
        })
      )
    }

    if (raw.startsWith('/api/customers/lookup?')) {
      return Promise.resolve(
        jsonResponse({ success: true, data: { known: false, lookup_degraded: false } })
      )
    }

    return Promise.reject(new Error(`Unexpected fetch call: ${raw}`))
  })

  ;(global as any).fetch = fetchMock
  return fetchMock
}

beforeAll(() => {
  if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
    ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
  }
})

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

describe('ManagementTableBookingForm: the live four-step path', () => {
  beforeEach(() => {
    jest.useFakeTimers(FAKE_DATE_ONLY)
  })

  afterEach(() => {
    jest.useRealTimers()
    clearBookingAttributionForTest()
    window.localStorage.clear()
    jest.clearAllMocks()
  })

  it('shows match, partial-screening and food information in the four-step flow', async () => {
    setupFetchMock(() => ({ time_slots: [] }))
    const context = fixtureBookingContext(nationsFixture())!
    render(<ManagementTableBookingForm prefill={{ date: context.date }} fixtureContext={context} />)
    expect(screen.getByText('Book a table for Italy v South Africa')).toBeInTheDocument()
    expect(screen.getByText(/The start of the game will be missed/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View the food menu' })).toHaveAttribute('href', '/food-menu')
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-08' } })
    expect(screen.getByText(/normal table booking without a game attached/)).toBeInTheDocument()
    await act(async () => {})
  })

  async function searchAndOpenDetails() {
    fireEvent.change(screen.getByLabelText('Preferred Time'), { target: { value: '20:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
    await screen.findByText('Choose your time')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByLabelText('Mobile Number')
  }

  async function verifyPhone() {
    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByLabelText('First Name')
  }

  function askForTwoHighChairs() {
    fireEvent.click(screen.getByRole('button', { name: 'More high chairs' }))
    fireEvent.click(screen.getByRole('button', { name: 'More high chairs' }))
  }

  describe('agreeing to a high-chair shortfall', () => {
    it('does not carry the agreement over to another date', async () => {
      // Consent is a record of what was agreed to. A different day is a
      // different thing, however alike the times look.
      setupFetchMock(() => ({
        time_slots: [
          { time: '20:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 1 }
        ]
      }))
      render(<ManagementTableBookingForm prefill={{ date: '2026-07-07' }} />)

      await searchAndOpenDetails()
      await verifyPhone()
      askForTwoHighChairs()

      const agree = await screen.findByRole('button', { name: 'Yes, book with 1' })
      fireEvent.click(agree)
      expect(await screen.findByText(/that&apos;s noted|that's noted/)).toBeInTheDocument()

      // Same time, different day.
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      await screen.findByText('Choose your time')
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
      await screen.findByLabelText('Date')
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-08' } })
      fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
      await screen.findByText('Choose your time')
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByRole('button', { name: 'Yes, book with 1' })).toBeInTheDocument()
    })
  })

  describe('the nearest-alternatives panel', () => {
    it('still offers times that are short on chairs, as this flow always has', async () => {
      // This flow's own details step offers "no high chairs are free at this
      // time, book anyway?", so it is plainly willing to book a time with none
      // free. A panel that will not even show such a time contradicts the very
      // screen it sends the guest to next.
      setupFetchMock((url) => {
        const date = url.searchParams.get('date')
        const chairs = Number.parseInt(url.searchParams.get('high_chair_count') || '0', 10)
        if (date === '2026-07-07') {
          return chairs > 0
            ? { time_slots: [] }
            : {
                time_slots: [
                  { time: '20:00', available: true, available_capacity: 20, kitchen_open: true, high_chairs_remaining: 2 }
                ]
              }
        }
        // Each of the three days that follow: one time with a chair free, one
        // with none.
        return {
          time_slots: [
            { time: '18:00', available: true, available_capacity: 20, kitchen_open: true, high_chairs_remaining: 1 },
            { time: '19:00', available: true, available_capacity: 20, kitchen_open: true, high_chairs_remaining: 0 }
          ]
        }
      })
      render(<ManagementTableBookingForm prefill={{ date: '2026-07-07' }} />)

      await searchAndOpenDetails()
      await verifyPhone()
      askForTwoHighChairs()

      // The re-read empties 7 July, which sends them back to the times with the
      // alternatives panel.
      const heading = await screen.findByText('Nearest alternatives')
      const panel = heading.parentElement as HTMLElement

      await waitFor(() => {
        expect(within(panel).getAllByRole('button', { name: /pm$/ })).toHaveLength(6)
      })
      const offered = within(panel)
        .getAllByRole('button', { name: /pm$/ })
        .map((button) => button.textContent ?? '')
      expect(offered.filter((label) => label.includes('6pm'))).toHaveLength(3)
      expect(offered.filter((label) => label.includes('7pm'))).toHaveLength(3)
      expect(screen.queryByText('No nearby online alternatives were found.')).not.toBeInTheDocument()
    })
  })

})
