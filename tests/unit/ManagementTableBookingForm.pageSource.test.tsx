/**
 * The booking form and the booking's page source.
 *
 * At submit the form builds a `page_source` object from the address of the
 * page it is on, and from nothing else: which page sent the guest
 * (`?source=`) and the ad tags beside it. No cookie and no browser storage is
 * read or written for it, so it is sent whatever the guest chose about
 * cookies. These tests drive the real form through a whole booking and read
 * the request it would send. The request itself is mocked: nothing is booked.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import {
  captureBookingAttributionFromLocation,
  clearBookingAttributionForTest,
  syncBookingAttributionWithConsent
} from '@/lib/booking-attribution'
import { rejectAllCookies, setConsentStatus } from '@/lib/cookies'
import { standInForPageReload } from '../helpers/page-reload'

const pushToDataLayer = jest.fn()

jest.mock('@/lib/gtm-events', () => ({
  trackTableBookingClick: jest.fn(),
  trackTableBookingFunnel: jest.fn(),
  pushToDataLayer: (...args: unknown[]) => pushToDataLayer(...args),
  trackBookingStepViewed: jest.fn(),
  trackOptionToggled: jest.fn(),
  trackSlotFlagShown: jest.fn(),
  trackSlotInvalidated: jest.fn(),
  trackBookingErrorShown: jest.fn()
}))

// The address the form is on, as `useSearchParams()` reports it.
let mockSearch = ''

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mockSearch),
  usePathname: () => '/book-table',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() })
}))

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

type SentRequest = { url: string; body: string }

/** Every request the form makes, with the booking request answered locally. */
function mockRequests(): { sent: SentRequest[]; bookingBodies: Array<Record<string, unknown>> } {
  const sent: SentRequest[] = []
  const bookingBodies: Array<Record<string, unknown>> = []

  ;(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    sent.push({ url, body: String(init?.body ?? '') })

    if (url.startsWith('/api/events?')) {
      return Promise.resolve(jsonResponse({ success: true, data: { events: [] } }))
    }
    if (url.startsWith('/api/table-bookings/availability')) {
      return Promise.resolve(
        jsonResponse({
          success: true,
          data: {
            date: '',
            available: true,
            time_slots: [
              { time: '19:00', available: true, available_capacity: 4, kitchen_open: true, bookable_purpose: 'food_or_drinks' }
            ]
          }
        })
      )
    }
    if (url.startsWith('/api/customers/lookup')) {
      return Promise.resolve(jsonResponse({ success: true, data: { known: false, lookup_degraded: false } }))
    }
    if (url === '/api/table-bookings') {
      bookingBodies.push(JSON.parse(String(init?.body || '{}')))
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
          201
        )
      )
    }
    return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
  })

  return { sent, bookingBodies }
}

/** Fill the form in and confirm, as a guest would. Returns the booking request body. */
async function bookATable(): Promise<{ payload: Record<string, unknown>; sent: SentRequest[] }> {
  const { sent, bookingBodies } = mockRequests()

  render(<ManagementTableBookingForm />)
  fireEvent.change(screen.getByLabelText('Party Size'), { target: { value: '2' } })
  fireEvent.blur(screen.getByLabelText('Party Size'))
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-07' } })
  fireEvent.click(screen.getByRole('button', { name: 'Find a table' }))

  await waitFor(() => expect(screen.getByText('Choose your time')).toBeInTheDocument())
  fireEvent.click(screen.getByRole('button', { name: /7pm/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sam' } })
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sam@example.com' } })
  fireEvent.change(screen.getByLabelText('Last name (optional)'), { target: { value: 'Walker' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }))

  await waitFor(() => expect(screen.getByText('Review your booking')).toBeInTheDocument())
  fireEvent.click(screen.getByRole('checkbox', { name: /I understand The Anchor/i }))
  fireEvent.click(screen.getByRole('button', { name: /Confirm booking/i }))

  await waitFor(() => expect(bookingBodies).toHaveLength(1))
  // Let the confirmation settle so its own tracking has run too.
  await waitFor(() => expect(pushToDataLayer).toHaveBeenCalled())

  return { payload: bookingBodies[0], sent }
}

// jsdom does not implement scrollIntoView, which the wizard calls between steps.
beforeAll(() => {
  if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
    ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => undefined
  }
})

// The form refuses past dates, so the clock is held the day before the booking
// date used above. Only the clock is faked: the form awaits its requests.
const FROZEN_NOW = new Date('2026-07-06T09:00:00.000Z') // 10:00 BST, Europe/London

beforeEach(() => {
  jest.useFakeTimers({
    now: FROZEN_NOW,
    doNotFake: [
      'cancelAnimationFrame', 'cancelIdleCallback', 'clearImmediate', 'clearInterval', 'clearTimeout',
      'hrtime', 'nextTick', 'performance', 'queueMicrotask', 'requestAnimationFrame',
      'requestIdleCallback', 'setImmediate', 'setInterval', 'setTimeout'
    ]
  })
  mockSearch = ''
})

afterEach(() => {
  cleanup()
  jest.useRealTimers()
  clearBookingAttributionForTest()
  window.localStorage.clear()
  window.sessionStorage.clear()
  document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
  window.history.pushState({}, '', '/')
  jest.clearAllMocks()
})

const LANDING_SEARCH =
  'source=lunch_dinner_lp&utm_campaign=weekday_lunch_a_cod_and_chips&short_code=jbozdk'

// Switching a category off reloads the page (tests/unit/cookie-withdrawal-reload.test.tsx).
// jsdom cannot, so the reload is stood in for here.
standInForPageReload()

describe('the booking form sends its page source', () => {
  it('carries the page and ad tags from the address, and nothing else on it', async () => {
    mockSearch = `${LANDING_SEARCH}&fbclid=fb-click-1&gclid=g-click-1&utm_term=pub+lunch&email=jane%40example.com&anything=else`

    const { payload } = await bookATable()

    // toEqual: exactly these keys. No fbclid, no gclid, no other parameter.
    expect(payload.page_source).toEqual({
      booking_source: 'lunch_dinner_lp',
      utm_campaign: 'weekday_lunch_a_cod_and_chips',
      short_code: 'jbozdk'
    })
    const pageSource = JSON.stringify(payload.page_source)
    for (const leftBehind of ['fb-click-1', 'g-click-1', 'pub lunch', 'jane', 'else']) {
      expect(pageSource).not.toContain(leftBehind)
    }
  })

  it('carries all five ad tags when the address has them', async () => {
    mockSearch =
      'source=lunch_dinner_lp&utm_source=facebook&utm_medium=paid_social&utm_campaign=weekday_dinner_a_pizza&utm_content=ad__var_2&short_code=jbozdk'

    const { payload } = await bookATable()

    expect(payload.page_source).toEqual({
      booking_source: 'lunch_dinner_lp',
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'weekday_dinner_a_pizza',
      utm_content: 'ad__var_2',
      short_code: 'jbozdk'
    })
  })

  it('says "direct" when the address names no source and has no tags', async () => {
    const { payload } = await bookATable()

    expect(payload.page_source).toEqual({ booking_source: 'direct' })
  })

  it('trims each label and cuts it to its limit', async () => {
    mockSearch = new URLSearchParams({
      source: `  ${'s'.repeat(120)}`,
      utm_source: 'a'.repeat(200),
      utm_medium: 'b'.repeat(200),
      utm_campaign: 'c'.repeat(300),
      utm_content: 'd'.repeat(500),
      short_code: `${'e'.repeat(100)}  `
    }).toString()

    const { payload } = await bookATable()

    expect(payload.page_source).toEqual({
      booking_source: 's'.repeat(80),
      utm_source: 'a'.repeat(80),
      utm_medium: 'b'.repeat(80),
      utm_campaign: 'c'.repeat(160),
      utm_content: 'd'.repeat(160),
      short_code: 'e'.repeat(32)
    })
  })

  it('leaves a blank tag out rather than sending an empty label', async () => {
    mockSearch = 'source=lunch_dinner_lp&utm_campaign=&utm_content=%20%20&short_code=jbozdk'

    const { payload } = await bookATable()

    expect(payload.page_source).toEqual({ booking_source: 'lunch_dinner_lp', short_code: 'jbozdk' })
  })

  it('does not change one detail of the booking', async () => {
    const plain = await bookATable()
    cleanup()

    mockSearch = `${LANDING_SEARCH}&utm_source=facebook&utm_medium=paid_social&utm_content=ad__var_1`
    const tagged = await bookATable()

    const withoutLabels = ({ page_source: _pageSource, _t: _secondsOnForm, ...booking }: Record<string, unknown>) => booking
    expect(withoutLabels(tagged.payload)).toEqual(withoutLabels(plain.payload))
    expect(tagged.payload).toMatchObject({
      phone: '07700900000',
      first_name: 'Sam',
      date: '2026-07-07',
      time: '19:00',
      party_size: 2,
      purpose: 'food'
    })
  })

  it('sends it in the booking request only: no other request and no analytics event carries it', async () => {
    mockSearch = `${LANDING_SEARCH}&utm_content=ad__var_1`

    const { sent } = await bookATable()

    const others = sent.filter((request) => request.url !== '/api/table-bookings')
    expect(others.length).toBeGreaterThan(0)
    for (const request of others) {
      expect(`${request.url} ${request.body}`).not.toContain('page_source')
      expect(`${request.url} ${request.body}`).not.toContain('weekday_lunch_a_cod_and_chips')
    }
    expect(JSON.stringify(pushToDataLayer.mock.calls)).not.toContain('page_source')
    expect(JSON.stringify(pushToDataLayer.mock.calls)).not.toContain('weekday_lunch_a_cod_and_chips')
  })
})

describe('the page source and cookie consent', () => {
  const EXPECTED_PAGE_SOURCE = {
    booking_source: 'lunch_dinner_lp',
    utm_campaign: 'weekday_lunch_a_cod_and_chips',
    short_code: 'jbozdk'
  }

  it.each([
    ['before any cookie choice', () => undefined],
    ['with cookies declined', () => rejectAllCookies()],
    [
      'after consent is withdrawn',
      () => {
        // An earlier visit accepted and was recorded; then the guest withdrew,
        // which deletes that record (lib/booking-attribution.ts).
        setConsentStatus({ marketing: true })
        window.history.pushState({}, '', '/book-table?utm_campaign=stored_campaign&short_code=stored1&fbclid=fb-stored')
        captureBookingAttributionFromLocation(new Date(FROZEN_NOW.getTime() - 60_000))
        window.history.pushState({}, '', '/book-table')
        rejectAllCookies()
        syncBookingAttributionWithConsent()
      }
    ]
  ])('is sent %s, with no consent-gated tags and nothing written to the device', async (_label, setConsent) => {
    setConsent()
    mockSearch = LANDING_SEARCH

    const setItem = jest.spyOn(Storage.prototype, 'setItem')
    const setCookie = jest.spyOn(Document.prototype, 'cookie', 'set')
    try {
      const { payload } = await bookATable()

      expect(payload.page_source).toEqual(EXPECTED_PAGE_SOURCE)
      // The consent-gated record, the one that goes on to CheersAI, stays empty.
      expect(payload.meta_consent_granted).toBe(false)
      for (const gated of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'short_code', 'fbclid', 'fbp', 'fbc']) {
        expect(payload).not.toHaveProperty(gated)
      }
      // Built from the address alone: no cookie and no browser storage written.
      expect(setItem).not.toHaveBeenCalled()
      expect(setCookie).not.toHaveBeenCalled()
    } finally {
      setItem.mockRestore()
      setCookie.mockRestore()
    }
  })

  it('is read from the address, not from the stored ad record, when cookies are accepted', async () => {
    // An earlier, consented visit stored a different campaign on the device.
    setConsentStatus({ marketing: true })
    window.history.pushState({}, '', '/book-table?utm_source=facebook&utm_campaign=stored_campaign&short_code=stored1&fbclid=fb-stored')
    captureBookingAttributionFromLocation(new Date(FROZEN_NOW.getTime() - 60_000))
    window.history.pushState({}, '', '/book-table')
    // Today's address says something else.
    mockSearch = LANDING_SEARCH

    const { payload } = await bookATable()

    expect(payload.page_source).toEqual(EXPECTED_PAGE_SOURCE)
    // The consented record is sent exactly as before, at the top level, and is
    // a different thing: it comes from the device, the page source does not.
    expect(payload).toMatchObject({
      meta_consent_granted: true,
      utm_source: 'facebook',
      utm_campaign: 'stored_campaign',
      short_code: 'stored1',
      fbclid: 'fb-stored'
    })
    expect(JSON.stringify(payload.page_source)).not.toContain('stored')
  })
})
