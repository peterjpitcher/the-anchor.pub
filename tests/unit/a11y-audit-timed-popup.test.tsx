import { act, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { ChristmasLightbox, isLightboxSuppressedRoute } from '@/components/features/christmas/ChristmasLightbox'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const audit = require('../../scripts/audit-a11y.js')

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/lib/gtm-events', () => ({
  trackFormStart: jest.fn(),
  trackModalOpen: jest.fn(),
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn(),
}))

/**
 * The accessibility audit has to look at a pop-up that opens on a timer.
 *
 * The Christmas lightbox opens ten seconds after it mounts. `scripts/audit-a11y.js`
 * checks a page in about three and closes it, so it never saw the lightbox, and on
 * 5 October 2026 it passed every page while the lightbox's close button had no
 * accessible name (axe `button-name`, critical).
 *
 * The audit now opens one page again, waits for a pop-up to cover it, and points
 * axe at the pop-up. That needs a real browser and CI has none, so the measuring is
 * done by hand against deployed builds. What CI can hold on to is the rule that
 * decides a pop-up has opened. The first block plays a document to that rule; the
 * second plays a page to the wait on a clock; the last renders the real lightbox, so
 * what the rule looks for cannot be changed out from under it.
 */

const { PAGES, POPUP_PAGE, POPUP_WAIT_MS, POPUP_MARK, lookForPopup, waitForPopup } = audit as {
  PAGES: Array<[string, string, string?]>
  POPUP_PAGE: string
  POPUP_WAIT_MS: number
  POPUP_MARK: string
  lookForPopup: (mark: string) => Popup | null
  waitForPopup: (page: FakePage) => Promise<Popup | null>
}

type Popup = { heading: string; shown: boolean }
type FakePage = ReturnType<typeof fakePage>
type Layer = { position?: string; covers?: boolean; display?: string; opacity?: string; html?: string }

const VIEWPORT = { width: 1024, height: 768 }
const CORNER = { width: 320, height: 180 }

/** jsdom has no layout, so each element is told its own size. */
function add({ position = 'fixed', covers = true, display = 'block', opacity = '1', html = '' }: Layer = {}): HTMLElement {
  const el = document.createElement('div')
  el.style.position = position
  el.style.display = display
  el.style.opacity = opacity
  el.innerHTML = html
  const size = covers ? VIEWPORT : CORNER
  el.getBoundingClientRect = () => ({ ...size, x: 0, y: 0, top: 0, left: 0, right: size.width, bottom: size.height, toJSON: () => ({}) })
  document.body.appendChild(el)
  return el
}

const reset = () => {
  document.body.innerHTML = ''
  delete (window as unknown as Record<string, unknown>).__a11yAuditFixed
}

describe('what the audit takes for a pop-up', () => {
  beforeEach(reset)

  it('finds a layer fixed over the whole page that was not there when the page settled', () => {
    expect(lookForPopup(POPUP_MARK)).toBeNull()

    const popup = add({ html: '<h2>Christmas 2026</h2>' })

    expect(lookForPopup(POPUP_MARK)).toEqual({ heading: 'Christmas 2026', shown: true })
    expect(popup.hasAttribute(POPUP_MARK)).toBe(true)
  })

  it('finds nothing on a page where nothing has opened', () => {
    add({ position: 'static' })
    lookForPopup(POPUP_MARK)

    expect(lookForPopup(POPUP_MARK)).toBeNull()
    expect(document.querySelector(`[${POPUP_MARK}]`)).toBeNull()
  })

  it('ignores a covering layer that was already there, such as a decorative background', () => {
    const background = add()
    lookForPopup(POPUP_MARK)

    expect(lookForPopup(POPUP_MARK)).toBeNull()
    expect(background.hasAttribute(POPUP_MARK)).toBe(false)
  })

  it('does not take a small fixed card for a pop-up: the event banner and the cookie banner are that', () => {
    lookForPopup(POPUP_MARK)
    add({ covers: false })

    expect(lookForPopup(POPUP_MARK)).toBeNull()
  })

  it('does not take a covering layer that is not displayed for a pop-up', () => {
    lookForPopup(POPUP_MARK)
    add({ display: 'none' })

    expect(lookForPopup(POPUP_MARK)).toBeNull()
  })

  it('does not take a layer that scrolls with the page for a pop-up', () => {
    lookForPopup(POPUP_MARK)
    add({ position: 'absolute' })

    expect(lookForPopup(POPUP_MARK)).toBeNull()
  })

  it('says a pop-up is not shown yet while it is still fading in', () => {
    lookForPopup(POPUP_MARK)
    const popup = add({ opacity: '0' })

    expect(lookForPopup(POPUP_MARK)).toEqual({ heading: '', shown: false })

    popup.style.opacity = '1'
    expect(lookForPopup(POPUP_MARK)).toEqual({ heading: '', shown: true })
  })

  it('marks a panel fixed beside the backdrop, so axe is pointed at both', () => {
    const banner = add({ covers: false })
    lookForPopup(POPUP_MARK)

    const backdrop = add()
    const panel = add({ covers: false, html: '<h2>Offer</h2>' })

    expect(lookForPopup(POPUP_MARK)).toEqual({ heading: 'Offer', shown: true })
    expect(backdrop.hasAttribute(POPUP_MARK)).toBe(true)
    expect(panel.hasAttribute(POPUP_MARK)).toBe(true)
    expect(banner.hasAttribute(POPUP_MARK)).toBe(false)
  })
})

/**
 * A stand-in for the browser page. The spec says when a pop-up opens and when it
 * has finished fading in; `waitForTimeout` moves the clock.
 */
function fakePage() {
  let popup: Popup | null = null
  let looks = 0
  return {
    evaluate: async () => {
      looks += 1
      // The first look only notes what is already on the page.
      return looks === 1 ? null : popup
    },
    waitForTimeout: async (ms: number) => {
      jest.advanceTimersByTime(ms)
    },
    opens: (heading: string, shown: boolean) => {
      popup = { heading, shown }
    },
  }
}

const at = (ms: number, happens: () => void) => setTimeout(happens, ms)

async function runWait(page: FakePage) {
  const started = Date.now()
  const popup = await waitForPopup(page)
  return { popup, took: Date.now() - started }
}

describe('how long the audit waits for a pop-up', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('waits for one that opens ten seconds in, and no longer', async () => {
    const page = fakePage()
    at(10_000, () => page.opens('Christmas 2026', true))

    const { popup, took } = await runWait(page)

    expect(popup).toEqual({ heading: 'Christmas 2026', shown: true })
    expect(took).toBeGreaterThanOrEqual(10_000)
    expect(took).toBeLessThan(10_500)
  })

  it('waits for the fade-in to finish before letting axe look', async () => {
    const page = fakePage()
    at(10_000, () => page.opens('Christmas 2026', false))
    at(10_300, () => page.opens('Christmas 2026', true))

    const { popup, took } = await runWait(page)

    expect(popup).toEqual({ heading: 'Christmas 2026', shown: true })
    expect(took).toBeGreaterThanOrEqual(10_300)
  })

  it('gives up when none has opened, and says so with null rather than a pop-up', async () => {
    const page = fakePage()

    const { popup, took } = await runWait(page)

    expect(popup).toBeNull()
    expect(took).toBeGreaterThanOrEqual(POPUP_WAIT_MS)
    expect(took).toBeLessThan(POPUP_WAIT_MS + 500)
  })

  it('still hands over a pop-up that never finished fading in, so it is checked and not skipped', async () => {
    const page = fakePage()
    at(10_000, () => page.opens('Stuck', false))

    const { popup } = await runWait(page)

    expect(popup).toEqual({ heading: 'Stuck', shown: false })
  })
})

describe('the pop-up the audit waits for today', () => {
  const mockUsePathname = usePathname as jest.Mock
  const CHRISTMAS_TIMER_MS = 10_000
  // components/DeferredRender.tsx can hold the lightbox back this long before it mounts.
  const DEFERRED_RENDER_MS = 2_000

  beforeEach(() => {
    jest.useFakeTimers()
    // Inside the Christmas campaign window (1 August to 15 December 2026) in both
    // London and UTC, so the test does not start failing when the real date leaves it.
    jest.setSystemTime(new Date('2026-10-05T12:00:00Z'))
    window.localStorage.clear()
    mockUsePathname.mockReturnValue(POPUP_PAGE)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('is looked for on a page the audit already checks, and one the lightbox is not kept off', () => {
    expect(PAGES.map(([pathname]) => pathname)).toContain(POPUP_PAGE)
    expect(isLightboxSuppressedRoute(POPUP_PAGE)).toBe(false)
  })

  it('is given longer than the lightbox takes to open', () => {
    expect(POPUP_WAIT_MS).toBeGreaterThan(CHRISTMAS_TIMER_MS + DEFERRED_RENDER_MS)
  })

  it('opens the real Christmas lightbox as a layer fixed over the whole page', () => {
    render(<ChristmasLightbox />)
    act(() => {
      jest.advanceTimersByTime(CHRISTMAS_TIMER_MS)
    })

    // `fixed inset-0` is Tailwind for position: fixed with every edge at 0, which is
    // what lookForPopup finds in a browser. jsdom has no stylesheet to work it out from.
    const layer = screen.getByRole('heading', { name: 'Christmas 2026' }).closest('.fixed')
    expect(layer).not.toBeNull()
    expect(layer).toHaveClass('fixed', 'inset-0')
  })
})
