import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { readBookingPrefill, readFixtureId, FIXTURE_UNCONFIRMED_MESSAGE } from '@/lib/table-booking/prefill'
import { nationsFeed, nationsFixture } from '../fixtures/nations-championship'
import { fixtureBookingContext } from '@/lib/nations-championship/booking-context-shared'

/**
 * Review BK-200. /book-table read its address on the server (date, time,
 * party size, drinks, a Nations Championship game), which made Next.js build
 * it afresh for every visitor. The page now reads nothing from the request,
 * and the form reads the same values in the browser, the game included. These
 * tests drive the real form with the address set and the network mocked.
 */

let mockSearch = ''

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mockSearch),
  usePathname: () => '/book-table',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() })
}))

jest.mock('@/lib/gtm-events', () => new Proxy({}, { get: (_target, name) => (name === '__esModule' ? false : jest.fn()) }))

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function setupFetch(feed: () => Promise<Response>): jest.Mock {
  const mock = jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url === '/api/nations-championship') return feed()
    if (url.startsWith('/api/events?')) return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
    if (url.startsWith('/api/table-bookings/availability')) {
      return Promise.resolve(
        jsonResponse({
          success: true,
          data: {
            date: new URL(url, 'https://www.the-anchor.pub').searchParams.get('date'),
            available: true,
            time_slots: [{ time: '22:00', available: true, available_capacity: 8, bookable_purpose: 'drinks_only' }]
          }
        })
      )
    }
    return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
  })
  ;(global as any).fetch = mock
  return mock
}

const FROZEN_NOW = new Date('2026-07-06T09:00:00.000Z')

beforeAll(() => {
  if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
    ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
  }
})

beforeEach(() => {
  jest.useFakeTimers({
    now: FROZEN_NOW,
    doNotFake: [
      'clearInterval', 'clearTimeout', 'nextTick', 'queueMicrotask', 'requestAnimationFrame',
      'cancelAnimationFrame', 'setImmediate', 'clearImmediate', 'setInterval', 'setTimeout',
      'hrtime', 'performance', 'requestIdleCallback', 'cancelIdleCallback'
    ]
  })
  mockSearch = ''
})

afterEach(() => {
  jest.useRealTimers()
})

describe('reading a booking link', () => {
  it('reads the values the page used to, by the same rules', () => {
    expect(readBookingPrefill(new URLSearchParams('date=2026-07-07&time=19:00&party_size=40&purpose=drinks'))).toEqual({
      date: '2026-07-07',
      time: '19:00',
      partySize: 20,
      drinksOnly: true
    })
    // Only the explicit drinks value opts into bar seating.
    expect(readBookingPrefill(new URLSearchParams('purpose=food&party_size=zero')).drinksOnly).toBe(false)
    expect(readBookingPrefill(new URLSearchParams('party_size=zero')).partySize).toBeUndefined()
    expect(readBookingPrefill(null)).toEqual({})
  })

  it('takes a game only when it is shaped like one', () => {
    expect(readFixtureId(new URLSearchParams('fixture_id=10000000-0000-4000-8000-000000000001'))).toBe(
      '10000000-0000-4000-8000-000000000001'
    )
    expect(readFixtureId(new URLSearchParams('fixture_id=../../admin'))).toBeNull()
    expect(readFixtureId(new URLSearchParams(''))).toBeNull()
  })
})

describe('the form fills itself in from the address', () => {
  it('starts on the date and party size in the link, and searches for drinks when it says so', async () => {
    mockSearch = 'date=2026-07-07&party_size=6&purpose=drinks'
    const fetchMock = setupFetch(() => Promise.reject(new Error('not asked')))
    render(<ManagementTableBookingForm />)

    expect(screen.getByLabelText('Date')).toHaveValue('2026-07-07')
    expect(screen.getByLabelText('Party size')).toHaveValue(6)

    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
    expect(await screen.findByRole('checkbox', { name: /^Just drinks/ })).toBeChecked()
    const searched = fetchMock.mock.calls.map(([url]) => String(url)).find((url) => url.includes('/availability'))
    expect(searched).toMatch(/party_size=6/)
    expect(searched).toMatch(/purpose=drinks/)
  })

  it('looks the game up in the browser and books for it', async () => {
    const fixture = nationsFixture()
    const context = fixtureBookingContext(fixture)!
    mockSearch = `fixture_id=${fixture.id}`
    setupFetch(() => Promise.resolve(jsonResponse(nationsFeed([fixture]))))
    render(<ManagementTableBookingForm />)

    // A word while it checks, from a region that was there from the start.
    expect(screen.getByText('Checking the game details...')).toHaveAttribute('role', 'status')

    expect(await screen.findByText(`Book a table for ${context.label}`)).toBeInTheDocument()
    // Moved to the game's date, as the server used to set it.
    expect(screen.getByLabelText('Date')).toHaveValue(context.date)
    expect(screen.queryByText('Checking the game details...')).not.toBeInTheDocument()
  })

  it('stays a normal booking, and says so, when the game cannot be confirmed', async () => {
    mockSearch = `fixture_id=${nationsFixture().id}`
    setupFetch(() => Promise.resolve(jsonResponse(nationsFeed([]))))
    render(<ManagementTableBookingForm />)

    expect(await screen.findByText(FIXTURE_UNCONFIRMED_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByLabelText('Your rugby booking')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Find a table' })).toBeEnabled()
  })

  it('stays a normal booking when the feed does not answer', async () => {
    mockSearch = `fixture_id=${nationsFixture().id}`
    setupFetch(() => Promise.resolve(jsonResponse({ error: 'unavailable' }, 503)))
    render(<ManagementTableBookingForm />)

    expect(await screen.findByText(FIXTURE_UNCONFIRMED_MESSAGE)).toBeInTheDocument()
  })

  it('never asks about a game that is not shaped like one', async () => {
    mockSearch = 'fixture_id=not-a-game'
    const fetchMock = setupFetch(() => Promise.resolve(jsonResponse(nationsFeed())))
    render(<ManagementTableBookingForm />)
    await act(async () => {})

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock.mock.calls.map(([url]) => String(url))).not.toContain('/api/nations-championship')
    expect(screen.queryByText('Checking the game details...')).not.toBeInTheDocument()
  })
})
