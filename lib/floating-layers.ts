/**
 * One place decides which floating layer is on screen.
 *
 * Until 8 October 2026 every layer decided for itself, on its own timer, with
 * its own z-index. The 7 October site review found the result: the event card
 * and the cookie banner drawn on top of the quick booking sheet and the phone
 * menu, the booking bar pushed up into the event card, and two pop-ups open at
 * once on the Sunday roast page. The owner's decision (number 12) is one
 * floating layer at a time.
 *
 * THE ORDER, highest first. Only the highest one that wants to show is shown.
 *
 *   1. dialog         Anything open that takes the whole screen: the cookie
 *                     preferences panel, the quick booking sheet, the enquiry
 *                     drawers, the phone menu, the photo gallery, and any
 *                     pop-up once it has opened. The visitor opened it (or is
 *                     reading it), so nothing else may sit on it.
 *   2. cookie-banner  A choice the visitor has not made yet. Everything that
 *                     only advertises waits for it.
 *   3. timed-popup    The Christmas pop-up, the Sunday roast prompt and its
 *                     exit prompt. One may open only when nothing above it
 *                     wants to show, and at most one opens per page view. Once
 *                     open it is a dialog.
 *   4. event-banner   The "Next Event" card.
 *   5. page-prompt    A prompt that belongs to one page: the plane spotting
 *                     prompt.
 *
 * THE BOOKING BAR is not in that order, because it is the way to book and not
 * an advert for something. It is a dock at the bottom of the screen: it shows
 * with the cookie banner, the event card or a page prompt (each sits clear of
 * it, never over it) and it gives way only to a dialog or an open pop-up,
 * which cover the whole screen anyway. Hiding it behind the cookie banner was
 * tried before and cost first-time visitors the only obvious way to book.
 *
 * A layer never works out for itself whether another layer is up. It says
 * whether it wants to show (`request`) and reads whether it may (`isShowing`).
 *
 * No React in this file, so the rules can be tested without rendering
 * anything. `hooks/useFloatingLayer.ts` is the React side.
 */

export const FLOATING_LAYER_PRIORITY = [
  'dialog',
  'cookie-banner',
  'timed-popup',
  'event-banner',
  'page-prompt',
] as const

export type ExclusiveFloatingLayerId = (typeof FLOATING_LAYER_PRIORITY)[number]

export const BOOKING_BAR_LAYER = 'booking-bar'

export type FloatingLayerId = ExclusiveFloatingLayerId | typeof BOOKING_BAR_LAYER

/** Layers that cover the whole screen. The booking bar gives way to these only. */
const TAKEOVER_LAYERS: ReadonlySet<ExclusiveFloatingLayerId> = new Set(['dialog', 'timed-popup'])

export interface FloatingLayerState {
  /** The one layer from the order that is on screen, or null. */
  active: ExclusiveFloatingLayerId | null
  /** Whether the booking bar is on screen. */
  bookingBar: boolean
}

/** The whole rule, as a pure function of which layers want to show. */
export function resolveFloatingLayers(wanted: Iterable<FloatingLayerId>): FloatingLayerState {
  const set = new Set(wanted)
  const active = FLOATING_LAYER_PRIORITY.find((id) => set.has(id)) ?? null
  const bookingBar = set.has(BOOKING_BAR_LAYER) && (active === null || !TAKEOVER_LAYERS.has(active))
  return { active, bookingBar }
}

export interface TimedPopupSchedule {
  /** How long the page must have been open before the first try. */
  delayMs: number
  /**
   * How long to leave the visitor alone after a higher layer goes away (they
   * have just answered the cookie banner, or closed the booking sheet) before
   * trying again. A pop-up on the same tap would look like a punishment.
   */
  settleMs?: number
  /**
   * Called when nothing above a timed pop-up wants to show. The pop-up runs its
   * own checks here (already seen, wrong page) and calls `claimTimedPopup`.
   */
  attempt: () => void
}

export const TIMED_POPUP_SETTLE_MS = 3000

export interface FloatingLayerStore {
  /** Say a layer wants to show. Returns the function that takes it back. */
  request: (id: FloatingLayerId) => () => void
  subscribe: (listener: () => void) => () => void
  getState: () => FloatingLayerState
  /** Whether this layer is the one on screen (or, for the bar, docked). */
  isShowing: (id: FloatingLayerId) => boolean
  /** True when a timed pop-up could open now on this page address. */
  canOpenTimedPopup: (path: string) => boolean
  /**
   * Take the one timed pop-up this page view allows. Null means no: something
   * higher is showing, or this page view has had its pop-up. Otherwise the
   * function to call when the pop-up closes.
   */
  claimTimedPopup: (path: string) => (() => void) | null
  /** Run `attempt` after the delay, waiting out anything higher. Returns cancel. */
  scheduleTimedPopup: (schedule: TimedPopupSchedule) => () => void
  /**
   * Forget which page has had its timed pop-up: a new page load. The browser
   * does this by loading the script again; a test suite, where one copy of this
   * file serves many renders of the same address, has to ask (jest.setup.js
   * does, before every test).
   */
  reset: () => void
}

export function createFloatingLayerStore(): FloatingLayerStore {
  const wanted = new Map<symbol, FloatingLayerId>()
  const listeners = new Set<() => void>()
  let state = resolveFloatingLayers([])
  // The address that has already had its timed pop-up. One per page view: a
  // second pop-up queued behind the first is still two pop-ups.
  let timedPopupPath: string | null = null

  const recompute = () => {
    const next = resolveFloatingLayers(wanted.values())
    if (next.active === state.active && next.bookingBar === state.bookingBar) return
    state = next
    // Copied first: a listener may subscribe or unsubscribe as it runs.
    Array.from(listeners).forEach((listener) => listener())
  }

  const request = (id: FloatingLayerId) => {
    const token = Symbol(id)
    wanted.set(token, id)
    recompute()
    return () => {
      if (!wanted.delete(token)) return
      recompute()
    }
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const rankOf = (id: ExclusiveFloatingLayerId) => FLOATING_LAYER_PRIORITY.indexOf(id)

  /** Something at or above a timed pop-up's place in the order wants to show. */
  const timedPopupBlocked = () =>
    state.active !== null && rankOf(state.active) <= rankOf('timed-popup')

  const canOpenTimedPopup = (path: string) => !timedPopupBlocked() && timedPopupPath !== path

  const claimTimedPopup = (path: string) => {
    if (!canOpenTimedPopup(path)) return null
    timedPopupPath = path
    return request('timed-popup')
  }

  const scheduleTimedPopup = ({ delayMs, settleMs = TIMED_POPUP_SETTLE_MS, attempt }: TimedPopupSchedule) => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopWaiting: (() => void) | undefined

    const tryNow = () => {
      if (cancelled) return
      if (!timedPopupBlocked()) {
        attempt()
        return
      }
      stopWaiting = subscribe(() => {
        if (timedPopupBlocked()) return
        stopWaiting?.()
        stopWaiting = undefined
        timer = setTimeout(tryNow, settleMs)
      })
    }

    timer = setTimeout(tryNow, delayMs)

    return () => {
      cancelled = true
      if (timer !== undefined) clearTimeout(timer)
      stopWaiting?.()
    }
  }

  return {
    request,
    subscribe,
    getState: () => state,
    isShowing: (id) => (id === BOOKING_BAR_LAYER ? state.bookingBar : state.active === id),
    canOpenTimedPopup,
    claimTimedPopup,
    scheduleTimedPopup,
    // What each layer wants is left alone: a layer takes its own request back
    // when it unmounts.
    reset: () => {
      timedPopupPath = null
    },
  }
}

/** The page's one coordinator. */
export const floatingLayers = createFloatingLayerStore()

/**
 * An open dialog, as the page itself says it. Every dialog on the site puts
 * `aria-modal="true"` on its panel while it is open: the shared Modal and
 * StickyDrawer, the phone menu, the cookie preferences panel, the photo
 * gallery, the allergen filter and the Christmas enquiry pop-up. The two
 * panels that stay mounted when shut (StickyDrawer, the allergen filter) drop
 * the attribute and say `data-state="closed"`.
 */
export const OPEN_DIALOG_SELECTOR = '[aria-modal="true"]:not([data-state="closed"])'

/**
 * Keep the store's `dialog` layer in step with the page. Read from the markup
 * rather than reported by each dialog, so a dialog written tomorrow is covered
 * without knowing this file exists. Returns the function that stops watching.
 */
export function watchOpenDialogs(store: FloatingLayerStore, doc: Document): () => void {
  let release: (() => void) | null = null

  const sync = () => {
    const open = doc.querySelector(OPEN_DIALOG_SELECTOR) !== null
    if (open && !release) {
      release = store.request('dialog')
    } else if (!open && release) {
      release()
      release = null
    }
  }

  sync()
  const observer = new MutationObserver(sync)
  observer.observe(doc.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-modal', 'data-state'],
  })

  return () => {
    observer.disconnect()
    release?.()
    release = null
  }
}

/** The page address a timed pop-up counts against: no query string, no hash. */
export function currentPagePath(): string {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
}
