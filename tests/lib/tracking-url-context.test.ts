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

test('drops unsupported URL context and strips embedded credentials', () => {
  expect(sanitizeTrackingUrlContext({
    page_location: 'https://fixture:secret@example.invalid/path?email=private#token',
    referrer: 'javascript:private', page_source: 'not a URL', utm_source: 'newsletter',
  })).toEqual({ page_location: 'https://example.invalid/path', utm_source: 'newsletter' })
})
