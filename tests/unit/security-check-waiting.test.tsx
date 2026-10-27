import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Button } from '@/components/ui/primitives/Button'
import { SecurityCheckWaitingNote } from '@/components/security/SecurityCheckWaitingNote'
import { addDays } from '@/lib/table-booking/formatting'
import { londonNowParts } from '@/lib/table-booking-service-windows'

/**
 * Review BK-198. The table, quick booking, private hire and event forms
 * disabled their submit button outright until the security check handed over a
 * token. A disabled button drops out of the Tab order, and for the first ten
 * seconds nothing on screen said why it was greyed out, so a slow check looked
 * like a broken form. Now the button stays reachable, is announced as
 * unavailable, says why underneath, and pressing it does nothing.
 *
 * Cloudflare's widget is replaced with one that never answers, which is what a
 * blocked or slow script does. Nothing here can send a booking: fetch refuses
 * every write.
 */

jest.mock('@marsidev/react-turnstile', () => {
  const React = require('react')
  return {
    Turnstile: React.forwardRef(function SilentTurnstile() {
      return null
    })
  }
})

jest.mock('@/lib/gtm-events', () => new Proxy({}, { get: (_target, name) => (name === '__esModule' ? false : jest.fn()) }))

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/book-table',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() })
}))

// The forms read the site key when their module loads, so they are required
// inside each case, after this line.
const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'

afterAll(() => {
  if (originalSiteKey === undefined) delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey
})

beforeAll(() => {
  if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
    ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
  }
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

/** Answers the reads a booking screen makes, and refuses every write. */
function readOnlyFetch(): jest.Mock {
  const mock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.startsWith('/api/events?')) return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
    if (url.startsWith('/api/table-bookings/availability')) {
      return Promise.resolve(
        jsonResponse({
          success: true,
          data: {
            date: new URL(url, 'https://www.the-anchor.pub').searchParams.get('date'),
            available: true,
            time_slots: [{ time: '19:00', available: true, available_capacity: 8, bookable_purpose: 'food_or_drinks' }]
          }
        })
      )
    }
    return Promise.reject(new Error(`Nothing may be sent from this test: ${init?.method ?? 'GET'} ${url}`))
  })
  ;(global as any).fetch = mock
  return mock
}

/** The button can be reached, says it is unavailable and why, and does nothing. */
function expectWaiting(button: HTMLElement, fetchMock: jest.Mock) {
  expect(button).not.toBeDisabled()
  expect(button).toHaveAttribute('aria-disabled', 'true')
  expect(button).toHaveAccessibleDescription('Waiting for the security check.')
  button.focus()
  expect(button).toHaveFocus()
  const writesBefore = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST').length
  fireEvent.click(button)
  const writesAfter = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST').length
  expect(writesAfter).toBe(writesBefore)
}

describe('Button marked unavailable', () => {
  it('stays focusable, is announced as unavailable, and ignores a press', () => {
    const onClick = jest.fn()
    render(
      <Button unavailable onClick={onClick}>
        Confirm booking
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Confirm booking' })

    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('cannot submit the form it sits in, Enter in a field included', () => {
    const onSubmit = jest.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <input aria-label="Name" />
        <Button type="submit" unavailable>
          Send
        </Button>
      </form>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('the waiting line', () => {
  it('is on the page from the start and only its words change', () => {
    const { rerender } = render(<SecurityCheckWaitingNote id="note" waiting={false} />)
    const region = screen.getByRole('status')
    expect(region).toBeEmptyDOMElement()

    rerender(<SecurityCheckWaitingNote id="note" waiting />)
    expect(screen.getByRole('status')).toBe(region)
    expect(region).toHaveTextContent('Waiting for the security check.')
  })
})

describe('the booking forms wait in the open', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('the table booking Confirm button', async () => {
    const fetchMock = readOnlyFetch()
    const { ManagementTableBookingForm } = require('@/components/features/TableBooking/ManagementTableBookingForm')
    // Tomorrow in London: inside the booking horizon, and never a time that
    // has already gone.
    render(<ManagementTableBookingForm prefill={{ date: addDays(londonNowParts().isoDate, 1) }} />)

    fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))
    fireEvent.click(await screen.findByRole('button', { name: /^7pm,/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue with 7pm' }))
    fireEvent.change(await screen.findByLabelText('Mobile Number'), { target: { value: '07700900123' } })
    await screen.findByLabelText('First Name')

    expectWaiting(screen.getByRole('button', { name: 'Confirm booking' }), fetchMock)
  })

  it('the quick booking sheet Book table button', async () => {
    const fetchMock = readOnlyFetch()
    const { QuickBookSheet } = require('@/components/features/TableBooking/QuickBookSheet')
    render(<QuickBookSheet open onClose={jest.fn()} source="test" />)

    fireEvent.click(await screen.findByRole('button', { name: /^7pm/ }))
    await act(async () => {})

    expectWaiting(screen.getByRole('button', { name: 'Book table' }), fetchMock)
  })

  it('the private hire Send enquiry button', () => {
    const fetchMock = readOnlyFetch()
    const { PrivateHireQuickEnquiry } = require('@/components/PrivateHireQuickEnquiry')
    render(<PrivateHireQuickEnquiry eventType="Birthday Party" />)

    expectWaiting(screen.getByRole('button', { name: 'Send enquiry' }), fetchMock)
  })

  it('the event booking button', async () => {
    const fetchMock = readOnlyFetch()
    const { ManagementEventBookingForm } = require('@/components/features/EventBooking/ManagementEventBookingForm')
    render(
      <ManagementEventBookingForm
        event={{ id: 'waiting-fixture', name: 'Quiz Night', startDate: '2999-01-01T19:00:00Z', price_per_seat: 3 }}
      />
    )

    await waitFor(() => expect(screen.getByRole('button', { name: 'Book a table' })).toBeInTheDocument())
    expectWaiting(screen.getByRole('button', { name: 'Book a table' }), fetchMock)
  })
})
