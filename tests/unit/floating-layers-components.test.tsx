/**
 * What each floating layer does with the coordinator's answer.
 *
 * The rules are tested by themselves in tests/unit/floating-layers.test.ts.
 * This file renders the real layers together and checks what the 7 October
 * 2026 site review found broken: the event card over the first screen, over
 * the cookie banner's booking bar and over an open dialog (LS-001, LS-002,
 * LS-021); the cookie banner over an open dialog (LS-001, AX-014); two pop-ups
 * at once on the Sunday roast page (LS-007); and that every layer still sends
 * the same analytics events, once, when it is really on screen.
 *
 * jsdom has no layout, so nothing here is about pixels. Those were looked at on
 * a production build: see tasks/changes/2026-10-08-floating-layers.md.
 *
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import CookieBanner from '@/components/CookieBanner'
import { EventCountdownBanner } from '@/components/EventCountdownBanner'
import { StickyCtas } from '@/components/layout/StickyCtas'
import { TimedBookingPrompt } from '@/components/sunday-lunch/TimedBookingPrompt'
import { ExitIntentBookingModal } from '@/components/conversion/ExitIntentBookingModal'
import { ChristmasLightbox } from '@/components/features/christmas/ChristmasLightbox'
import { PlaneSpottingBookingPrompt } from '@/components/plane-spotting/PlaneSpottingBookingPrompt'
import { Modal } from '@/components/ui/overlays/Modal'
import { floatingLayers, TIMED_POPUP_SETTLE_MS } from '@/lib/floating-layers'
import {
  pushToDataLayer,
  trackBannerEvent,
  trackCookieConsent,
  trackModalOpen,
  trackStickyCtaShown
} from '@/lib/gtm-events'

let mockPathname = '/find-us'
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: jest.fn() })
}))

jest.mock('@/lib/gtm-events', () => ({
  pushToDataLayer: jest.fn(),
  trackBannerEvent: jest.fn(),
  trackCookieConsent: jest.fn(),
  trackCtaClick: jest.fn(),
  trackFormStart: jest.fn(),
  trackMenuView: jest.fn(),
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn(),
  trackModalOpen: jest.fn(),
  trackPhoneCallClick: jest.fn(),
  trackStickyCtaShown: jest.fn(),
  trackTableBookingClick: jest.fn(),
  trackWhatsAppClick: jest.fn()
}))

jest.mock('@/components/EventBookingButton', () => ({
  EventBookingButton: () => <a href="/events/test-quiz">Book your places</a>
}))

jest.mock('@/components/BookTableButton', () => ({
  BookTableButton: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>
}))

jest.mock('@/components/features/TableBooking/QuickBookSheet', () => ({
  QuickBookSheet: () => null
}))

const realFetch = global.fetch

function clearEveryCookie() {
  document.cookie
    .split('; ')
    .filter(Boolean)
    .forEach((pair) => {
      document.cookie = `${pair.split('=')[0]}=; path=/; max-age=0`
    })
}

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

/** A dialog the way every dialog on the site announces itself. */
async function openADialog(): Promise<HTMLElement> {
  const dialog = document.createElement('div')
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', 'Book a table')
  await act(async () => {
    document.body.appendChild(dialog)
    await Promise.resolve()
  })
  return dialog
}

async function close(dialog: HTMLElement) {
  await act(async () => {
    dialog.remove()
    await Promise.resolve()
  })
}

// Whatever a test asks the coordinator for directly is taken back after it, so
// one test's unanswered cookie banner is not still up in the next.
let heldByThisTest: Array<() => void> = []

function hold(id: 'cookie-banner' | 'event-banner'): () => void {
  let release: () => void = () => {}
  act(() => {
    release = floatingLayers.request(id)
  })
  heldByThisTest.push(release)
  return () => act(() => release())
}

/** A first-time visitor has made no cookie choice, so the banner is waiting. */
const hasNotAnsweredTheCookieBanner = () => hold('cookie-banner')

const card = () => (screen.queryByText('Next Event')?.closest('[data-layer-showing]') ?? null) as HTMLElement | null

const cardViews = () =>
  (trackBannerEvent as jest.Mock).mock.calls.filter(([event]) => event.action === 'view')

beforeEach(() => {
  mockPathname = '/find-us'
  jest.clearAllMocks()
  clearEveryCookie()
  window.localStorage.clear()
  window.sessionStorage.clear()
  // Half of sessions are shown the event card. This one is.
  window.sessionStorage.setItem('event_banner_session_show', 'true')
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 })
  const twoDaysOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ events: [{ id: 'evt-1', name: 'Test Quiz Night', slug: 'test-quiz', startDate: twoDaysOut }] })
  }) as unknown as typeof fetch
})

afterEach(() => {
  act(() => heldByThisTest.forEach((release) => release()))
  heldByThisTest = []
  jest.useRealTimers()
  global.fetch = realFetch
  document.body.querySelectorAll('[aria-modal]').forEach((node) => {
    if (!node.closest('[data-testid]')) node.remove()
  })
})

describe('the event card', () => {
  async function renderCard() {
    render(<EventCountdownBanner />)
    // The event is fetched after mount.
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    await act(async () => {
      await Promise.resolve()
    })
  }

  it('is not on the first screen: it waits until the page has scrolled past the hero', async () => {
    await renderCard()

    expect(card()).toHaveAttribute('data-layer-showing', 'false')
    expect(card()).toHaveClass('data-[layer-showing=false]:hidden')
    expect(cardViews()).toHaveLength(0)

    scrollTo(2000)
    expect(card()).toHaveAttribute('data-layer-showing', 'true')
  })

  it('goes away again at the top of the page', async () => {
    await renderCard()
    scrollTo(2000)
    scrollTo(0)

    expect(card()).toHaveAttribute('data-layer-showing', 'false')
  })

  it('waits for the cookie banner to be answered', async () => {
    const answer = hasNotAnsweredTheCookieBanner()
    await renderCard()
    scrollTo(2000)

    expect(card()).toHaveAttribute('data-layer-showing', 'false')
    expect(card()).toHaveClass('data-[layer-showing=false]:hidden')
    expect(cardViews()).toHaveLength(0)

    answer()
    expect(card()).toHaveAttribute('data-layer-showing', 'true')
  })

  it('steps out while a dialog is open and comes back when it closes', async () => {
    await renderCard()
    scrollTo(2000)
    expect(card()).toHaveAttribute('data-layer-showing', 'true')

    const sheet = await openADialog()
    expect(card()).toHaveAttribute('data-layer-showing', 'false')
    // Still mounted: whatever its own button opened is not torn down with it.
    expect(screen.getByRole('button', { name: 'Dismiss event reminder', hidden: true })).toBeInTheDocument()

    await close(sheet)
    expect(card()).toHaveAttribute('data-layer-showing', 'true')
  })

  it('counts one view, when it is first on screen, and not again when it comes back', async () => {
    await renderCard()
    expect(cardViews()).toHaveLength(0)

    scrollTo(2000)
    expect(cardViews()).toEqual([[
      { id: 'event_countdown_banner', action: 'view', label: 'Test Quiz Night', campaign: 'test-quiz' }
    ]])

    const sheet = await openADialog()
    await close(sheet)
    scrollTo(0)
    scrollTo(2000)
    expect(cardViews()).toHaveLength(1)
  })

  it('still counts the dismiss, and stays gone', async () => {
    await renderCard()
    scrollTo(2000)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss event reminder' }))

    expect(trackBannerEvent).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'event_countdown_banner', action: 'dismiss' })
    )
    expect(card()).toBeNull()
    expect(floatingLayers.isShowing('event-banner')).toBe(false)
  })

  it('hides for a focused control with visibility, so its box can still be measured', async () => {
    await renderCard()
    scrollTo(2000)

    expect(card()).toHaveClass('data-[focus-under-card=true]:invisible')
    expect(card()).toHaveAttribute('data-focus-under-card', 'false')
  })
})

describe('the cookie banner', () => {
  function renderBanner() {
    jest.useFakeTimers()
    const view = render(<CookieBanner />)
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    jest.useRealTimers()
    return view
  }

  it('holds its place in the order from the moment the page knows no choice was made', () => {
    jest.useFakeTimers()
    render(<CookieBanner />)

    // Not drawn for another second, but the event card must not slip in first.
    expect(screen.queryByRole('button', { name: 'Accept all cookies' })).not.toBeInTheDocument()
    expect(floatingLayers.isShowing('cookie-banner')).toBe(true)
  })

  it('steps out while a dialog is open and comes back unanswered', async () => {
    renderBanner()
    expect(screen.getByRole('button', { name: 'Accept all cookies' })).toBeInTheDocument()

    const sheet = await openADialog()
    expect(screen.queryByRole('button', { name: 'Accept all cookies' })).not.toBeInTheDocument()
    // No choice was made for the visitor while it was away.
    expect(document.cookie).not.toContain('anchor-cookie-consent')
    expect(trackCookieConsent).not.toHaveBeenCalled()
    expect(document.documentElement.style.getPropertyValue('--cookie-banner-height')).toBe('0px')

    await close(sheet)
    expect(screen.getByRole('button', { name: 'Accept all cookies' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject all cookies' })).toBeInTheDocument()
    expect(document.cookie).not.toContain('anchor-cookie-consent')
  })

  it('stays under its own preferences panel, so the link that opened it can take focus back', async () => {
    renderBanner()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'choose which cookies' }))
      await Promise.resolve()
    })

    expect(screen.getByRole('dialog', { name: 'Cookie Preferences' })).toBeInTheDocument()
    expect(floatingLayers.isShowing('dialog')).toBe(true)
    expect(screen.getByRole('button', { name: 'choose which cookies', hidden: true })).toBeInTheDocument()
  })

  it.each([
    ['Reject all cookies', 'reject_all'],
    ['Accept all cookies', 'accept_all']
  ])('%s still records the answer and gives up its place in the order', async (name, action) => {
    renderBanner()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name }))
      await Promise.resolve()
    })

    expect(trackCookieConsent).toHaveBeenCalledWith(expect.objectContaining({ action }))
    expect(document.cookie).toContain('anchor-cookie-consent')
    expect(floatingLayers.isShowing('cookie-banner')).toBe(false)
    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
  })

  it('takes no place in the order for a visitor who has already answered', () => {
    document.cookie = `anchor-cookie-consent=${encodeURIComponent(JSON.stringify({ analytics: false, marketing: false, timestamp: Date.now(), version: 1 }))}; path=/`
    jest.useFakeTimers()
    render(<CookieBanner />)
    act(() => {
      jest.advanceTimersByTime(1500)
    })

    // Whatever the stored value's exact shape, a visitor with no banner on
    // screen must not be holding the event card back.
    const bannerDrawn = screen.queryByRole('button', { name: 'Accept all cookies' }) !== null
    expect(floatingLayers.isShowing('cookie-banner')).toBe(bannerDrawn)
  })
})

describe('the booking bar', () => {
  const bar = () => screen.getByTestId('sticky-ctas')

  it('is on screen once the page has scrolled past the hero', () => {
    render(<StickyCtas />)
    expect(bar().style.transform).toBe('translateY(125%)')

    scrollTo(2000)
    expect(bar().style.transform).toBe('translateY(calc(-1 * var(--cookie-banner-height, 0px)))')
    expect(bar()).toHaveAttribute('aria-hidden', 'false')
  })

  it('stays on screen with the cookie banner unanswered, and never moves by its bottom edge', () => {
    hasNotAnsweredTheCookieBanner()
    render(<StickyCtas />)
    scrollTo(2000)

    expect(bar().style.transform).toBe('translateY(calc(-1 * var(--cookie-banner-height, 0px)))')
    expect(bar().style.bottom).toBe('')
    expect(bar()).toHaveClass('bottom-0')
  })

  it('slides away while a dialog is open and comes back when it closes', async () => {
    render(<StickyCtas />)
    scrollTo(2000)

    const book = screen.getByRole('button', { name: 'Book a table' })
    expect(book).not.toHaveAttribute('tabindex')

    const sheet = await openADialog()
    expect(bar().style.transform).toBe('translateY(125%)')
    expect(document.documentElement.style.getPropertyValue('--booking-bar-height')).toBe('0px')
    // Off the screen, so out of the tab order: not every dialog traps focus.
    expect(book).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('link', { name: 'Call The Anchor' })).toHaveAttribute('tabindex', '-1')

    await close(sheet)
    expect(bar().style.transform).toBe('translateY(calc(-1 * var(--cookie-banner-height, 0px)))')
    expect(book).not.toHaveAttribute('tabindex')
  })

  it('does not count a dialog opening as the bar being hidden, so "seconds shown" means what it did', async () => {
    jest.useFakeTimers()
    render(<StickyCtas />)
    scrollTo(2000)

    jest.advanceTimersByTime(4000)
    const sheet = await openADialog()
    expect(trackStickyCtaShown).not.toHaveBeenCalled()
    await close(sheet)

    jest.advanceTimersByTime(3000)
    scrollTo(0)
    expect(trackStickyCtaShown).toHaveBeenCalledTimes(1)
    expect(trackStickyCtaShown).toHaveBeenCalledWith(expect.objectContaining({ secondsVisible: 7 }))
  })
})

describe('timed pop-ups', () => {
  const promptOpens = () =>
    (pushToDataLayer as jest.Mock).mock.calls.filter(([event]) => event.event === 'booking_prompt_open')

  it('the Sunday roast prompt waits for the cookie banner, then a little longer, and counts one open', () => {
    jest.useFakeTimers()
    const answer = hasNotAnsweredTheCookieBanner()
    render(<TimedBookingPrompt delayMs={500} />)

    act(() => {
      jest.advanceTimersByTime(30_000)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(promptOpens()).toHaveLength(0)

    answer()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(TIMED_POPUP_SETTLE_MS)
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(promptOpens()).toEqual([[{ event: 'booking_prompt_open', prompt_id: 'sunday_lunch_timed' }]])
  })

  it('never opens two on one page view: the Christmas pop-up at 10 seconds, no Sunday roast prompt at 15', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-10-08T12:00:00Z'))
    mockPathname = '/sunday-roast'
    render(
      <>
        <ChristmasLightbox />
        <TimedBookingPrompt />
      </>
    )

    act(() => {
      jest.advanceTimersByTime(10_050)
    })
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.getByRole('dialog', { name: 'Christmas 2026' })).toBeInTheDocument()
    expect(trackModalOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'christmas_2026_lightbox' }))

    act(() => {
      jest.advanceTimersByTime(20_000)
    })
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(promptOpens()).toHaveLength(0)
    // Not shown, so not marked as dismissed: it is free to show on a later visit.
    expect(window.sessionStorage.getItem('sunday_lunch_booking_prompt_dismissed')).toBeNull()
  })

  it('the Christmas pop-up does not open over the cookie banner, and keeps its one showing', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-10-08T12:00:00Z'))
    hasNotAnsweredTheCookieBanner()
    render(<ChristmasLightbox />)

    act(() => {
      jest.advanceTimersByTime(60_000)
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trackModalOpen).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('christmas_2026_lightbox_seen')).toBeNull()
  })

  it('the exit prompt is refused while a dialog is open, marks nothing, and opens on a later try', async () => {
    render(<ExitIntentBookingModal />)
    const sheet = await openADialog()

    act(() => {
      fireEvent.mouseLeave(document, { clientY: 0 })
    })
    expect(pushToDataLayer).not.toHaveBeenCalled()
    expect(window.sessionStorage.getItem('sunday_lunch_exit_intent_shown')).toBeNull()

    await close(sheet)
    act(() => {
      fireEvent.mouseLeave(document, { clientY: 0 })
    })
    expect(pushToDataLayer).toHaveBeenCalledWith({ event: 'exit_intent_modal_shown' })
    expect(screen.getByRole('dialog', { name: 'Before you go' })).toBeInTheDocument()
  })
})

describe('a pop-up taller than the screen', () => {
  it('is centred by its own margins, so its top can always be scrolled to', () => {
    // Centred by the layer (`items-center`), a panel taller than the screen
    // hangs off the top and that part cannot be scrolled to. On a phone held
    // sideways the Christmas pop-up's close button was gone (site review LS-008).
    render(
      <Modal open onClose={() => {}} title="A tall pop-up" testId="tall-popup">
        <p>Content</p>
      </Modal>
    )

    const layer = screen.getByTestId('tall-popup')
    const panel = screen.getByRole('dialog', { name: 'A tall pop-up' })
    expect(layer).toHaveClass('flex', 'justify-center', 'overflow-y-auto', 'py-8')
    expect(layer).not.toHaveClass('items-center')
    expect(panel).toHaveClass('my-auto')
    expect(panel.parentElement).toBe(layer)
  })
})

describe('the plane spotting prompt', () => {
  const shown = () =>
    (pushToDataLayer as jest.Mock).mock.calls.filter(([event]) => event.event === 'plane_spotting_prompt_shown')

  function scrollMostOfTheWayDown() {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 4000 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    scrollTo(2400)
  }

  it('waits for the event card, and records "shown" when it is really on screen', async () => {
    const closeCard = hold('event-banner')
    render(<PlaneSpottingBookingPrompt source="plane_spotting_page_prompt" />)
    scrollMostOfTheWayDown()

    expect(screen.queryByTestId('plane-spotting-booking-prompt')).not.toBeInTheDocument()
    expect(shown()).toHaveLength(0)
    expect(window.sessionStorage.getItem('plane_spotting_booking_prompt_shown')).toBeNull()

    closeCard()

    expect(screen.getByTestId('plane-spotting-booking-prompt')).toBeInTheDocument()
    expect(shown()).toHaveLength(1)
    expect(shown()[0][0]).toEqual(expect.objectContaining({ trigger: 'scroll' }))
    expect(window.sessionStorage.getItem('plane_spotting_booking_prompt_shown')).toBe('true')
  })

  it('sits above the booking bar by the height the bar publishes, moved with transform', () => {
    render(<PlaneSpottingBookingPrompt />)
    scrollMostOfTheWayDown()

    const prompt = screen.getByTestId('plane-spotting-booking-prompt')
    expect(prompt.style.transform).toBe('translateY(calc(-1 * var(--booking-bar-height, 0px)))')
    expect(prompt).toHaveClass('bottom-4')
  })

  it('records "shown" once, however often a dialog covers it', async () => {
    render(<PlaneSpottingBookingPrompt />)
    scrollMostOfTheWayDown()
    expect(shown()).toHaveLength(1)

    const sheet = await openADialog()
    expect(screen.queryByTestId('plane-spotting-booking-prompt')).not.toBeInTheDocument()
    await close(sheet)

    expect(screen.getByTestId('plane-spotting-booking-prompt')).toBeInTheDocument()
    expect(shown()).toHaveLength(1)
  })
})
