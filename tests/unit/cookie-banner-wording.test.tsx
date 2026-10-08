/**
 * What the cookie banner says, and how it offers the two answers.
 *
 * Three things were wrong with it on 7 October 2026. It said that carrying on
 * browsing meant you agreed, which was never how the site worked. Accept was a
 * filled gold button and Reject a faint one. And its settings panel described
 * things the site does not have: a "Preference Cookies" switch that controlled
 * nothing, "secure areas", a "language preference", and analytics that were
 * "anonymous" when both tools give the browser an identifier.
 *
 * @jest-environment jsdom
 */

import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CookieBanner from '@/components/CookieBanner'

function clearEveryCookie() {
  document.cookie
    .split('; ')
    .filter(Boolean)
    .forEach((pair) => {
      document.cookie = `${pair.split('=')[0]}=; path=/; max-age=0`
    })
}

function renderBanner() {
  jest.useFakeTimers()
  const view = render(<CookieBanner />)
  act(() => {
    jest.advanceTimersByTime(1000)
  })
  jest.useRealTimers()
  return view
}

beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

beforeEach(clearEveryCookie)
afterEach(() => jest.useRealTimers())

describe('the bar', () => {
  it('says what the cookies are for, that they are off until you accept, and links to the policy', () => {
    const { container } = renderBanner()
    const text = container.textContent ?? ''

    expect(text).toContain(
      "We'd like to use cookies to see how our website is used and which of our adverts work. They stay off unless you accept. You can choose which cookies or read our privacy policy."
    )
    expect(screen.getByRole('link', { name: 'read our privacy policy' })).toHaveAttribute('href', '/privacy-policy')
  })

  it('never says that carrying on means you agree', () => {
    const { container } = renderBanner()
    const text = (container.textContent ?? '').toLowerCase()

    expect(text).not.toContain('by continuing')
    expect(text).not.toContain('you agree')
    expect(text).not.toContain('enhance your experience')
  })

  it('has one message, not a shorter one for phones', () => {
    renderBanner()

    // Two layouts used to sit in the page at once, one hidden by CSS at each
    // width, and the phone one said only "We use cookies."
    expect(screen.getAllByRole('button', { name: 'Reject all cookies' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Accept all cookies' })).toHaveLength(1)
    expect(screen.queryByText('We use cookies.')).not.toBeInTheDocument()
  })

  it('gives Reject and Accept the same button: same variant, same size, same width rules', () => {
    renderBanner()
    const reject = screen.getByRole('button', { name: 'Reject all cookies' })
    const accept = screen.getByRole('button', { name: 'Accept all cookies' })

    // Variant and size are both expressed as classes, so identical classes
    // means identical looks at every width.
    expect(reject.className).toBe(accept.className)
    expect(reject.className).not.toBe('')
  })

  it('has only the two answers in its button row, so nothing sits beside them looking like a third', () => {
    renderBanner()
    const row = screen.getByRole('button', { name: 'Reject all cookies' }).parentElement as HTMLElement

    expect(within(row).getAllByRole('button').map((button) => button.textContent?.trim())).toEqual([
      'Reject all',
      'Accept all'
    ])
  })

  it('puts Reject first, so it is never the one further from the thumb or the eye', () => {
    renderBanner()
    const reject = screen.getByRole('button', { name: 'Reject all cookies' })
    const accept = screen.getByRole('button', { name: 'Accept all cookies' })

    expect(reject.compareDocumentPosition(accept) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe('the settings panel', () => {
  async function openPanel() {
    renderBanner()
    await userEvent.setup().click(screen.getByRole('button', { name: 'choose which cookies' }))
    return screen.getByRole('dialog', { name: 'Cookie Preferences' })
  }

  it('offers a switch for analytics and for marketing, both off, and nothing else', async () => {
    const panel = await openPanel()
    const switches = within(panel).getAllByRole('checkbox')

    expect(switches.map((input) => input.getAttribute('aria-labelledby'))).toEqual([
      'cookie-category-analytics',
      'cookie-category-marketing'
    ])
    switches.forEach((input) => expect(input).not.toBeChecked())
    expect(within(panel).queryByText('Preference Cookies')).not.toBeInTheDocument()
  })

  it('describes only what the site does', async () => {
    const panel = await openPanel()
    const text = (panel.textContent ?? '').toLowerCase()

    for (const untrue of ['secure areas', 'language preference', 'anonymously', 'anonymous', 'page navigation']) {
      expect(text).not.toContain(untrue)
    }
    // The companies are named, so the switch means something.
    expect(text).toContain('google analytics')
    expect(text).toContain('microsoft clarity')
    expect(text).toContain('meta')
    expect(text).toContain('linkedin')
  })
})
