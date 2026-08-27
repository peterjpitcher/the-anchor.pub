export {}

// Two faults fixed on 27 August 2026, both of which had been live for months.

jest.mock('@/lib/cookies', () => ({ canUseCookieCategory: () => true }))
jest.mock('@/lib/booking-attribution', () => ({ getBookingAttributionPayload: () => ({}) }))
jest.mock('@/lib/tracking/ga4-identity', () => ({ getGa4Identity: () => ({}) }))

import { dispatchTrackingEvent } from '@/lib/tracking/dispatcher'

const ORIGINAL_FETCH = global.fetch

function analyticsCalls() {
  return (global.fetch as jest.Mock).mock.calls.filter(call =>
    String(call[0]).includes('/api/analytics')
  )
}

beforeEach(() => {
  jest.useFakeTimers()
  ;(global as any).fetch = jest.fn().mockResolvedValue(new Response('{}', { status: 202 }))
  // sendBeacon short-circuits before fetch, so remove it to exercise the path.
  delete (navigator as any).sendBeacon
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  global.fetch = ORIGINAL_FETCH
})

describe('every event reaches GA4 unless it opts out', () => {
  it('sends an ordinary event to the analytics API without being asked', () => {
    // This is the fix. 36 event types were invisible in GA4 because sendToApi
    // defaulted to false and the GTM container has no triggers for our custom
    // events. Opting in per call site meant every newly added event inherited
    // the broken default.
    dispatchTrackingEvent({ event: 'booking_error_shown', code: 'test' })
    jest.advanceTimersByTime(3000)

    expect(analyticsCalls().length).toBe(1)
    const body = JSON.parse(String(analyticsCalls()[0][1].body))
    expect(body.events[0].event).toBe('booking_error_shown')
  })

  it('still honours an explicit opt-out for telemetry with its own pipeline', () => {
    dispatchTrackingEvent({ event: 'web_vitals_reported', metric: 'LCP' })
    jest.advanceTimersByTime(3000)

    expect(analyticsCalls().length).toBe(0)
  })

  it('lets a caller force sendToApi off', () => {
    dispatchTrackingEvent({ event: 'anything' }, { sendToApi: false })
    jest.advanceTimersByTime(3000)

    expect(analyticsCalls().length).toBe(0)
  })

  it('never sends without analytics consent', () => {
    jest.resetModules()
    jest.doMock('@/lib/cookies', () => ({ canUseCookieCategory: () => false }))
    const { dispatchTrackingEvent: gated } = require('@/lib/tracking/dispatcher')

    gated({ event: 'booking_error_shown' })
    jest.advanceTimersByTime(3000)

    expect(analyticsCalls().length).toBe(0)
  })
})

describe('a failed analytics post cannot break the page', () => {
  it('swallows a rejected fetch instead of leaving an unhandled rejection', async () => {
    // A try/catch cannot catch a rejected promise. Before the .catch was added
    // an offline visitor, or one with a blocking extension, produced an
    // unhandled rejection on every flush. It was severe enough to kill a whole
    // Jest worker the moment these events started being sent.
    ;(global as any).fetch = jest.fn().mockRejectedValue(new Error('offline'))

    const unhandled: unknown[] = []
    const onUnhandled = (reason: unknown) => unhandled.push(reason)
    process.on('unhandledRejection', onUnhandled)

    expect(() => {
      dispatchTrackingEvent({ event: 'booking_error_shown' })
      jest.advanceTimersByTime(3000)
    }).not.toThrow()

    await Promise.resolve()
    await Promise.resolve()
    process.off('unhandledRejection', onUnhandled)

    expect(unhandled).toEqual([])
  })
})
