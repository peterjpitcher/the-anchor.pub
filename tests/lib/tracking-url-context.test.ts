jest.mock('@/lib/cookies', () => ({ canUseCookieCategory: jest.fn(() => true) }))
jest.mock('@/lib/booking-attribution', () => ({ getBookingAttributionPayload: () => ({
  source_url: 'https://www.the-anchor.pub/private-hire?email=fixture@example.invalid&utm_source=newsletter',
  landing_path: '/private-hire?email=fixture@example.invalid',
  utm_source: 'newsletter', utm_campaign: 'autumn', gclid: 'approved-click-id',
}) }))
jest.mock('@/lib/tracking/ga4-identity', () => ({ getGa4Identity: () => ({}) }))

import { dispatchTrackingEvent } from '@/lib/tracking/dispatcher'
import { canUseCookieCategory } from '@/lib/cookies'
import { sanitizeTrackingUrlContext } from '@/lib/tracking/url-context'

beforeEach(() => {
  window.dataLayer = []
  jest.mocked(canUseCookieCategory).mockReturnValue(true)
  window.history.replaceState({}, '', '/private-hire?email=fixture@example.invalid#phone=07700900000')
  Object.defineProperty(document, 'referrer', { configurable: true, value: 'https://example.invalid/start?name=Fixture#private' })
})

afterEach(() => {
  window.history.replaceState({}, '', '/')
  Object.defineProperty(document, 'referrer', { configurable: true, value: '' })
})

test('browser context and explicit URL overrides contain no query or fragment, preserving attribution separately', () => {
  dispatchTrackingEvent({ event: 'table_booking_completed', page_source: '/private-hire?email=fixture@example.invalid' }, { sendToApi: false })
  expect(window.dataLayer?.[0]).toMatchObject({
    page_location: `${window.location.origin}/private-hire`,
    page_source: '/private-hire',
    referrer: 'https://example.invalid/start', page_referrer: 'https://example.invalid/start',
    source_url: 'https://www.the-anchor.pub/private-hire', landing_path: '/private-hire',
    utm_source: 'newsletter', utm_campaign: 'autumn', gclid: 'approved-click-id',
  })
  expect(JSON.stringify(window.dataLayer)).not.toContain('fixture@example.invalid')
  expect(JSON.stringify(window.dataLayer)).not.toContain('07700900000')
})

test('declining consent prevents the private-hire event from being dispatched', () => {
  jest.mocked(canUseCookieCategory).mockReturnValue(false)
  dispatchTrackingEvent({ event: 'private_hire_enquiry_submitted' })
  expect(window.dataLayer).toEqual([])
})

test('a booking id in a path is replaced with [id], as page speed records already do', () => {
  const id = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
  const cleaned = sanitizeTrackingUrlContext({
    page_path: `/heathrow-parking/confirmation/${id}`,
    page_location: `https://www.the-anchor.pub/heathrow-parking/confirmation/${id}?payment=success`,
    page_source: `/parking/bookings/${id}`,
    landing_path: '/parking/bookings/PK-ANYTHING-AT-ALL',
    referrer: `https://www.the-anchor.pub/heathrow-parking/confirmation/${id}`,
    page_referrer: 'https://www.google.com/search',
    source_url: 'https://www.the-anchor.pub/whats-on/quiz-night',
  })

  expect(cleaned).toEqual({
    page_path: '/heathrow-parking/confirmation/[id]',
    page_location: 'https://www.the-anchor.pub/heathrow-parking/confirmation/[id]',
    page_source: '/parking/bookings/[id]',
    landing_path: '/parking/bookings/[id]',
    referrer: 'https://www.the-anchor.pub/heathrow-parking/confirmation/[id]',
    // Ordinary pages and other sites are untouched.
    page_referrer: 'https://www.google.com/search',
    source_url: 'https://www.the-anchor.pub/whats-on/quiz-night',
  })
  expect(JSON.stringify(cleaned)).not.toContain(id)
})

test('a path that is not a plain site path is dropped: the field for our own path, the page for a full address', () => {
  expect(sanitizeTrackingUrlContext({
    page_path: '/book-table/guest@example.invalid',
    page_location: 'https://www.the-anchor.pub/book-table/guest@example.invalid',
    referrer: 'https://example.invalid/a%20page/with spaces',
    utm_source: 'newsletter',
  })).toEqual({
    page_location: 'https://www.the-anchor.pub',
    referrer: 'https://example.invalid',
    utm_source: 'newsletter',
  })
})

test('the dispatcher sends the parking confirmation page as [id], never the booking id', () => {
  const id = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
  window.history.replaceState({}, '', `/heathrow-parking/confirmation/${id}`)
  dispatchTrackingEvent({ event: 'directions_click' }, { sendToApi: false })

  expect(window.dataLayer?.[0]).toMatchObject({
    page_path: '/heathrow-parking/confirmation/[id]',
    page_location: `${window.location.origin}/heathrow-parking/confirmation/[id]`,
  })
  expect(JSON.stringify(window.dataLayer)).not.toContain(id)
})

test('drops unsupported URL context and strips embedded credentials', () => {
  expect(sanitizeTrackingUrlContext({
    page_location: 'https://fixture:secret@example.invalid/path?email=private#token',
    referrer: 'javascript:private', page_source: 'not a URL', utm_source: 'newsletter',
  })).toEqual({ page_location: 'https://example.invalid/path', utm_source: 'newsletter' })
})
