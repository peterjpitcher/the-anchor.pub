jest.mock('@/lib/cookies', () => ({ canUseCookieCategory: jest.fn(() => true) }))
jest.mock('@/lib/booking-attribution', () => ({ getBookingAttributionPayload: () => ({}) }))
jest.mock('@/lib/tracking/ga4-identity', () => ({ getGa4Identity: () => ({}) }))
import { canUseCookieCategory } from '@/lib/cookies'
import { trackNationsEvent } from '@/lib/nations-championship/tracking'
const originalFetch = global.fetch
beforeEach(() => { jest.useFakeTimers(); global.fetch = jest.fn().mockResolvedValue(new Response('{}')); window.dataLayer = []; (canUseCookieCategory as jest.Mock).mockReturnValue(true) })
afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); global.fetch = originalFetch })
it('records a booking click once without claiming a completed booking', () => {
  trackNationsEvent('book_rugby_click', { fixture_id: 'fixture-1', cta_location: 'fixture_card' })
  expect(window.dataLayer).toHaveLength(1)
  expect(window.dataLayer![0]).toEqual(expect.objectContaining({ event: 'book_rugby_click', fixture_id: 'fixture-1' }))
  expect(window.dataLayer![0]).not.toHaveProperty('email')
  expect(window.dataLayer![0]).not.toHaveProperty('notes')
})
it('does not record tournament interactions when analytics consent is refused', () => {
  ;(canUseCookieCategory as jest.Mock).mockReturnValue(false)
  trackNationsEvent('add_to_calendar', { fixture_id: 'fixture-1' })
  jest.advanceTimersByTime(3000)
  expect(window.dataLayer).toHaveLength(0)
  expect(global.fetch).not.toHaveBeenCalled()
})
