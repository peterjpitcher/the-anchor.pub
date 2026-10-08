import { act, render, screen, within } from '@testing-library/react'

/**
 * A security check that never loads must not leave a dead button
 * (site review 7 October 2026, P05, finding WP-008).
 *
 * Every form disables its submit button until Cloudflare hands over a token.
 * When Cloudflare's script is blocked by an extension or a works network it
 * calls nothing back, and seven of the eight forms then showed a greyed-out
 * button with nothing on screen to explain it. The explanation now lives in the
 * shared widget, so a form gets it by mounting the widget.
 *
 * These render two REAL forms with the REAL shared widget. Only Cloudflare's
 * own component is replaced, with one that does what a blocked script does:
 * nothing at all. Nothing here can send an enquiry or an application: the
 * button never becomes pressable, and fetch throws if anything calls it.
 */

jest.mock('@marsidev/react-turnstile', () => {
  const React = require('react')
  return {
    Turnstile: React.forwardRef(function BlockedTurnstile() {
      return null
    })
  }
})

jest.mock('@/lib/gtm-events', () => ({
  trackPrivateHireEnquiryStarted: jest.fn(),
  trackPrivateHireEnquirySubmitted: jest.fn(),
  trackFormStart: jest.fn(),
  trackFormComplete: jest.fn(),
  trackRecruitmentApplicationSubmitted: jest.fn(),
  trackPhoneCallClick: jest.fn(),
  trackError: jest.fn()
}))

const PHONE = '01753 682707'
const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
// The forms read the site key once, when their module loads. They are required
// inside each case below, which runs after this line. Not jest.resetModules:
// that would load a second copy of React beside the one the renderer holds.
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
const originalFetch = global.fetch

type FormCase = {
  label: string
  submitName: RegExp
  load: () => JSX.Element
}

const cases: FormCase[] = [
  {
    label: 'the short private hire enquiry',
    submitName: /send enquiry/i,
    load: () => {
      const { PrivateHireQuickEnquiry } = require('@/components/PrivateHireQuickEnquiry')
      return <PrivateHireQuickEnquiry eventType="Birthday Party" />
    }
  },
  {
    label: 'the job application',
    submitName: /send|apply|submit/i,
    load: () => {
      const { RecruitmentApplicationForm } = require('@/app/join-our-team/_components/RecruitmentApplicationForm')
      return <RecruitmentApplicationForm />
    }
  }
]

beforeEach(() => {
  jest.useFakeTimers()
  global.fetch = jest.fn(() => {
    throw new Error('Nothing may be sent from this test')
  }) as unknown as typeof fetch
})

afterEach(() => {
  jest.useRealTimers()
  global.fetch = originalFetch
})

afterAll(() => {
  if (originalSiteKey === undefined) delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey
})

describe.each(cases)('$label, when the security check never loads', ({ load, submitName }) => {
  function submitButton(): HTMLElement {
    const buttons = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('type') === 'submit' && submitName.test(button.textContent || ''))
    expect(buttons).toHaveLength(1)
    return buttons[0]
  }

  // The form may have live regions of its own; the widget's is the one that
  // ends up holding the heading.
  function recoveryPanel(): HTMLElement | undefined {
    return screen.queryAllByRole('status').find((region) => /Security check not completed/.test(region.textContent || ''))
  }

  it('keeps the button disabled and, for the first ten seconds, says nothing', () => {
    render(load())

    act(() => {
      jest.advanceTimersByTime(9_999)
    })

    expect(submitButton()).toBeDisabled()
    expect(recoveryPanel()).toBeUndefined()
  })

  it('after ten seconds tells the guest why, with the phone number to ring and a way to try again', () => {
    render(load())

    act(() => {
      jest.advanceTimersByTime(10_000)
    })

    const panel = recoveryPanel()
    expect(panel).toBeDefined()
    if (!panel) return
    expect(panel).toHaveTextContent('Everything you have typed is still here.')
    expect(panel).toHaveTextContent(`Call ${PHONE} and we will help.`)
    expect(within(panel).getByRole('link', { name: PHONE })).toHaveAttribute('href', 'tel:+441753682707')
    expect(within(panel).getByRole('button', { name: 'Try the security check again' })).toBeEnabled()

    // Still no way to send without a token, and nothing was sent.
    expect(submitButton()).toBeDisabled()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
