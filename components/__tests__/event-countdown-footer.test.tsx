/**
 * The countdown card and the page footer, on a phone.
 *
 * The card is fixed 7rem above the bottom of the screen and, on a phone, as wide
 * as the screen. At the bottom of a page it sat on top of the footer's links
 * (Privacy Policy and the rest of that row) until it was closed. Seen at
 * 375 x 812 on 5 October 2026. It now hides on a phone while the footer is
 * underneath it, and comes back when the visitor scrolls up.
 *
 * jsdom has no layout and no media queries, so two things are checked here and
 * the rest in a browser: that the card watches the real footer landmark from
 * the line its own bottom edge sits on, and that what it switches is a
 * phone-only class, never a plain `hidden` that would take the card off wider
 * screens too.
 */

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventCountdownBanner } from '../EventCountdownBanner'

jest.mock('next/navigation', () => ({
  usePathname: () => '/find-us'
}))

// The booking button needs a whole event record and is not what this is about.
jest.mock('@/components/EventBookingButton', () => ({
  EventBookingButton: () => <a href="/events/test-quiz">Book your places</a>
}))

interface WatchedObserver {
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit
  targets: Element[]
  disconnected: boolean
}

let observers: WatchedObserver[]
const realIntersectionObserver = global.IntersectionObserver
const realFetch = global.fetch

class ControlledIntersectionObserver {
  private readonly record: WatchedObserver

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.record = { callback, options, targets: [], disconnected: false }
    observers.push(this.record)
  }

  observe(target: Element) {
    this.record.targets.push(target)
  }

  unobserve() {}

  disconnect() {
    this.record.disconnected = true
  }
}

/** Says where the footer is, the way the browser would. */
function footerIsUnderTheCard(isIntersecting: boolean) {
  const observer = observers[observers.length - 1]
  act(() => {
    observer.callback(
      [{ isIntersecting, target: observer.targets[0] } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver
    )
  })
}

function renderPage() {
  return render(
    <>
      <main>A page</main>
      <footer role="contentinfo">
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
      <EventCountdownBanner />
    </>
  )
}

async function card(): Promise<HTMLElement> {
  const label = await screen.findByText('Next Event')
  return label.closest('[data-footer-under-card]') as HTMLElement
}

describe('the countdown card steps aside for the footer on a phone', () => {
  beforeEach(() => {
    observers = []
    global.IntersectionObserver = ControlledIntersectionObserver as unknown as typeof IntersectionObserver
    window.localStorage.clear()
    window.sessionStorage.clear()
    // Half of sessions are shown the card. This one is.
    window.sessionStorage.setItem('event_banner_session_show', 'true')
    const twoDaysOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ events: [{ id: 'evt-1', name: 'Test Quiz Night', slug: 'test-quiz', startDate: twoDaysOut }] })
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    global.IntersectionObserver = realIntersectionObserver
    global.fetch = realFetch
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('watches the page footer from the line the bottom of the card sits on', async () => {
    renderPage()
    const wrapper = await card()

    await waitFor(() => expect(observers).toHaveLength(1))
    expect(observers[0].targets).toEqual([screen.getByRole('contentinfo')])
    // bottom-28 is 7rem, 112px. The footer counts as under the card once it
    // rises past that line, not when its first pixel enters the screen.
    expect(wrapper).toHaveClass('bottom-28')
    expect(observers[0].options?.rootMargin).toBe('0px 0px -112px 0px')
  })

  it('shows while the footer is below it', async () => {
    renderPage()
    const wrapper = await card()

    expect(wrapper).toHaveAttribute('data-footer-under-card', 'false')
  })

  it('hides on a phone only while the footer is under it, and comes back', async () => {
    renderPage()
    const wrapper = await card()
    await waitFor(() => expect(observers).toHaveLength(1))

    footerIsUnderTheCard(true)
    expect(wrapper).toHaveAttribute('data-footer-under-card', 'true')

    footerIsUnderTheCard(false)
    expect(wrapper).toHaveAttribute('data-footer-under-card', 'false')
  })

  it('hides with a phone-only class, so wider screens keep the card', async () => {
    renderPage()
    const wrapper = await card()

    // Below the sm breakpoint and only when the flag is set. Tailwind reads this
    // class from the source as written, so it must be this exact string.
    expect(wrapper).toHaveClass('max-sm:data-[footer-under-card=true]:hidden')
    expect(wrapper).not.toHaveClass('hidden')
    // It stays mounted either way: closing it still works and nothing re-counts a view.
    footerIsUnderTheCard(true)
    expect(screen.getByRole('button', { name: 'Dismiss event reminder' })).toBeInTheDocument()
  })

  it('stops watching once the card is closed', async () => {
    const user = userEvent.setup()
    renderPage()
    await card()
    await waitFor(() => expect(observers).toHaveLength(1))

    await user.click(screen.getByRole('button', { name: 'Dismiss event reminder' }))

    expect(screen.queryByText('Next Event')).not.toBeInTheDocument()
    expect(observers[0].disconnected).toBe(true)
  })

  it('does not watch anything when there is no card to move', async () => {
    window.sessionStorage.setItem('event_banner_session_show', 'false')
    renderPage()

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.queryByText('Next Event')).not.toBeInTheDocument()
    expect(observers).toHaveLength(0)
  })
})
