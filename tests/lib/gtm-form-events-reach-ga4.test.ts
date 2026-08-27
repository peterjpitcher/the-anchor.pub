export {}

// Form events must reach GA4, and must not collide with Google's own.
//
// Until 27 August 2026 GA4 recorded ZERO form_complete in 28 days, even though
// the recruitment form fires it one line before trackRecruitmentApplicationSubmitted,
// which did arrive. The difference was sendToApi: events that only reach the
// dataLayer depend on GTM forwarding them, and the published container has no
// triggers for our custom events. A July 2026 audit found the same thing and it
// was never fixed.
//
// Separately, GA4 Enhanced Measurement has "Form interactions" switched on and
// emits its own form_start, so our event had to be renamed to stay comparable
// with our own completions rather than merging with Google's.

const dispatchTrackingEvent = jest.fn()

jest.mock('@/lib/tracking/dispatcher', () => ({
  dispatchTrackingEvent: (...args: unknown[]) => dispatchTrackingEvent(...args),
}))

import { trackFormStart, trackFormComplete } from '@/lib/gtm-events'

beforeEach(() => jest.clearAllMocks())

function lastCall() {
  return dispatchTrackingEvent.mock.calls[dispatchTrackingEvent.mock.calls.length - 1]
}

describe('form events are delivered through the Measurement Protocol', () => {
  it('sends form_completed with sendToApi', () => {
    trackFormComplete({ formName: 'quick_book_sheet' })

    const [payload, options] = lastCall()
    expect(payload.event).toBe('form_completed')
    expect(payload.form_name).toBe('quick_book_sheet')
    // Without this the event reaches the dataLayer and stops there.
    expect(options).toEqual(expect.objectContaining({ sendToApi: true }))
  })

  it('sends form_started with sendToApi', () => {
    trackFormStart({ formName: 'quick_book_sheet' })

    const [payload, options] = lastCall()
    expect(payload.event).toBe('form_started')
    expect(options).toEqual(expect.objectContaining({ sendToApi: true }))
  })
})

describe('our form events do not collide with GA4 Enhanced Measurement', () => {
  it.each([
    ['trackFormStart', trackFormStart],
    ['trackFormComplete', trackFormComplete],
  ])('%s does not emit a name Google already uses', (_label, fn) => {
    fn({ formName: 'any_form' })
    const [payload] = lastCall()
    // form_start and form_submit are emitted automatically by Enhanced
    // Measurement, so reusing either name mixes two different populations.
    expect(['form_start', 'form_submit']).not.toContain(payload.event)
  })

  it('follows the started/completed convention the rest of the funnel uses', () => {
    trackFormStart({ formName: 'f' })
    const startEvent = lastCall()[0].event
    trackFormComplete({ formName: 'f' })
    const completeEvent = lastCall()[0].event

    expect(startEvent).toMatch(/_started$/)
    expect(completeEvent).toMatch(/_completed$/)
  })
})
