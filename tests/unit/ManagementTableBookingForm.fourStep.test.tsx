import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    it('offers a time that can cover the chairs and withholds one that cannot', async () => {
      // A slot with one chair free covers a request for one. A slot with none
      // free covers nothing. The panel has no room to print a count, so a time
      // that cannot cover the request is simply not offered.
      setupFetchMock((url) => {
        const date = url.searchParams.get('date')
        const chairs = Number.parseInt(url.searchParams.get('high_chair_count') || '0', 10)
        if (date === '2026-07-07') {
          return chairs > 0
            ? { time_slots: [] }
            : {
                time_slots: [
                  { time: '20:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 2 }
                ]
              }
        }
        if (date === '2026-07-08') {
          return {
            time_slots: [
              { time: '18:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 0 },
              { time: '19:00', available: true, available_capacity: 8, kitchen_open: true, high_chairs_remaining: 2 }
            ]
          }
        }
        return { time_slots: [] }
      })
      render(<ManagementTableBookingForm prefill={{ date: '2026-07-07' }} />)

      await searchAndOpenDetails()
      await verifyPhone()
      askForTwoHighChairs()

      // The re-read empties 7 July, which sends them back to the times with the
      // alternatives panel.
      await screen.findByText('Nearest alternatives')
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /7pm/ })).toBeInTheDocument()
      })
      expect(screen.queryByRole('button', { name: /6pm/ })).not.toBeInTheDocument()
    })
  })

})
