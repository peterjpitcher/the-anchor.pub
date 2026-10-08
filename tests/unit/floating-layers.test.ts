/**
 * The floating layer coordinator (lib/floating-layers.ts).
 *
 * Owner decision 12 of 7 October 2026: one floating layer at a time. These are
 * the rules themselves, with nothing rendered. What each component does with
 * the answer is in tests/unit/floating-layers-components.test.tsx.
 */

import {
  BOOKING_BAR_LAYER,
  FLOATING_LAYER_PRIORITY,
  OPEN_DIALOG_SELECTOR,
  TIMED_POPUP_SETTLE_MS,
  createFloatingLayerStore,
  resolveFloatingLayers,
  watchOpenDialogs,
  type ExclusiveFloatingLayerId,
  type FloatingLayerId
} from '@/lib/floating-layers'

describe('the written order', () => {
  it('is dialog, cookie banner, timed pop-up, event card, page prompt', () => {
    expect(FLOATING_LAYER_PRIORITY).toEqual([
      'dialog',
      'cookie-banner',
      'timed-popup',
      'event-banner',
      'page-prompt'
    ])
  })

  it('shows nothing when nothing wants to show', () => {
    expect(resolveFloatingLayers([])).toEqual({ active: null, bookingBar: false })
  })

  it.each(FLOATING_LAYER_PRIORITY.map((id, rank) => [id, rank] as const))(
    '%s beats everything below it and loses to everything above it',
    (id, rank) => {
      const below = FLOATING_LAYER_PRIORITY.slice(rank + 1)
      const above = FLOATING_LAYER_PRIORITY.slice(0, rank)

      expect(resolveFloatingLayers([...below, id]).active).toBe(id)
      for (const higher of above) {
        expect(resolveFloatingLayers([id, higher, ...below]).active).toBe(higher)
      }
    }
  )

  it('never shows two of them, whatever combination asks', () => {
    const ids = [...FLOATING_LAYER_PRIORITY]
    for (let mask = 0; mask < 1 << ids.length; mask += 1) {
      const wanted = ids.filter((_, index) => mask & (1 << index))
      const { active } = resolveFloatingLayers(wanted)
      // One answer, and it is the highest of those that asked.
      expect(active).toBe(wanted.length ? wanted[0] : null)
    }
  })
})

describe('the booking bar is a dock, not one of the prompts', () => {
  const prompts: ExclusiveFloatingLayerId[] = ['cookie-banner', 'event-banner', 'page-prompt']
  const takeovers: ExclusiveFloatingLayerId[] = ['dialog', 'timed-popup']

  it('shows by itself', () => {
    expect(resolveFloatingLayers([BOOKING_BAR_LAYER])).toEqual({ active: null, bookingBar: true })
  })

  it.each(prompts)('stays up with %s, which sits clear of it', (id) => {
    expect(resolveFloatingLayers([BOOKING_BAR_LAYER, id])).toEqual({ active: id, bookingBar: true })
  })

  it.each(takeovers)('gives way to %s, which covers the whole screen', (id) => {
    expect(resolveFloatingLayers([BOOKING_BAR_LAYER, id])).toEqual({ active: id, bookingBar: false })
  })

  it('does not take the place of a prompt, or stop one showing', () => {
    expect(resolveFloatingLayers([BOOKING_BAR_LAYER, 'event-banner', 'page-prompt']).active).toBe('event-banner')
  })

  it('is not shown unless it asks', () => {
    expect(resolveFloatingLayers(['cookie-banner']).bookingBar).toBe(false)
  })
})

describe('the store', () => {
  it('shows a layer when it asks and hides it when it stops asking', () => {
    const store = createFloatingLayerStore()
    expect(store.isShowing('event-banner')).toBe(false)

    const release = store.request('event-banner')
    expect(store.isShowing('event-banner')).toBe(true)

    release()
    expect(store.isShowing('event-banner')).toBe(false)
  })

  it('makes the event card wait for the cookie banner and brings it in when the banner is answered', () => {
    const store = createFloatingLayerStore()
    const answerBanner = store.request('cookie-banner')
    store.request('event-banner')

    expect(store.isShowing('cookie-banner')).toBe(true)
    expect(store.isShowing('event-banner')).toBe(false)

    answerBanner()
    expect(store.isShowing('event-banner')).toBe(true)
  })

  it('takes everything else off the screen while a dialog is open, and puts it back after', () => {
    const store = createFloatingLayerStore()
    const ids: FloatingLayerId[] = ['cookie-banner', 'event-banner', 'page-prompt', BOOKING_BAR_LAYER]
    ids.forEach((id) => store.request(id))
    expect(store.isShowing('cookie-banner')).toBe(true)
    expect(store.isShowing(BOOKING_BAR_LAYER)).toBe(true)

    const closeDialog = store.request('dialog')
    for (const id of ids) expect(store.isShowing(id)).toBe(false)
    expect(store.isShowing('dialog')).toBe(true)

    closeDialog()
    expect(store.isShowing('cookie-banner')).toBe(true)
    expect(store.isShowing(BOOKING_BAR_LAYER)).toBe(true)
  })

  it('keeps a layer up while any one of two requests for it is still open', () => {
    // Two dialogs can be open at once: an enquiry drawer and the pop-up it opened.
    const store = createFloatingLayerStore()
    const first = store.request('dialog')
    const second = store.request('dialog')

    first()
    expect(store.isShowing('dialog')).toBe(true)
    second()
    expect(store.isShowing('dialog')).toBe(false)
  })

  it('ignores a release that is called twice', () => {
    const store = createFloatingLayerStore()
    const release = store.request('event-banner')
    store.request('event-banner')

    release()
    release()
    expect(store.isShowing('event-banner')).toBe(true)
  })

  it('tells subscribers when the answer changes, and only then', () => {
    const store = createFloatingLayerStore()
    const listener = jest.fn()
    const unsubscribe = store.subscribe(listener)

    const releaseCard = store.request('event-banner')
    expect(listener).toHaveBeenCalledTimes(1)

    // A lower layer asking changes nothing on screen.
    store.request('page-prompt')
    expect(listener).toHaveBeenCalledTimes(1)

    releaseCard()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    store.request('dialog')
    expect(listener).toHaveBeenCalledTimes(2)
  })
})

describe('timed pop-ups', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('may open when nothing above them wants to show', () => {
    const store = createFloatingLayerStore()
    store.request('event-banner')
    store.request(BOOKING_BAR_LAYER)

    expect(store.canOpenTimedPopup('/')).toBe(true)
    expect(store.claimTimedPopup('/')).toEqual(expect.any(Function))
  })

  it.each(['dialog', 'cookie-banner'] as const)('may not open while %s is up', (id) => {
    const store = createFloatingLayerStore()
    store.request(id)

    expect(store.canOpenTimedPopup('/')).toBe(false)
    expect(store.claimTimedPopup('/')).toBeNull()
  })

  it('never open two at once: the second is refused while the first is up', () => {
    // Fifteen seconds into the Sunday roast page two were open, one on the other.
    const store = createFloatingLayerStore()
    expect(store.claimTimedPopup('/sunday-roast')).not.toBeNull()
    expect(store.claimTimedPopup('/sunday-roast')).toBeNull()
  })

  it('open at most once per page view, even after the first has closed', () => {
    const store = createFloatingLayerStore()
    const close = store.claimTimedPopup('/sunday-roast')
    close?.()

    expect(store.claimTimedPopup('/sunday-roast')).toBeNull()
    // Another page is another page view.
    expect(store.claimTimedPopup('/food-menu')).not.toBeNull()
  })

  it('do not use up the page view when they are refused', () => {
    const store = createFloatingLayerStore()
    const answerBanner = store.request('cookie-banner')
    expect(store.claimTimedPopup('/')).toBeNull()

    answerBanner()
    expect(store.claimTimedPopup('/')).not.toBeNull()
  })

  it('take the event card and the booking bar off the screen while open', () => {
    const store = createFloatingLayerStore()
    store.request('event-banner')
    store.request(BOOKING_BAR_LAYER)

    const close = store.claimTimedPopup('/')
    expect(store.isShowing('event-banner')).toBe(false)
    expect(store.isShowing(BOOKING_BAR_LAYER)).toBe(false)

    close?.()
    expect(store.isShowing('event-banner')).toBe(true)
    expect(store.isShowing(BOOKING_BAR_LAYER)).toBe(true)
  })

  it('reset starts a new page view', () => {
    const store = createFloatingLayerStore()
    store.claimTimedPopup('/')?.()
    expect(store.canOpenTimedPopup('/')).toBe(false)

    store.reset()
    expect(store.canOpenTimedPopup('/')).toBe(true)
  })

  describe('on a timer', () => {
    it('try after the delay when the way is clear', () => {
      const store = createFloatingLayerStore()
      const attempt = jest.fn()
      store.scheduleTimedPopup({ delayMs: 10_000, attempt })

      jest.advanceTimersByTime(9_999)
      expect(attempt).not.toHaveBeenCalled()
      jest.advanceTimersByTime(1)
      expect(attempt).toHaveBeenCalledTimes(1)
    })

    it('wait for the cookie banner to be answered, then a little longer', () => {
      const store = createFloatingLayerStore()
      const attempt = jest.fn()
      const answerBanner = store.request('cookie-banner')
      store.scheduleTimedPopup({ delayMs: 10_000, attempt })

      jest.advanceTimersByTime(60_000)
      expect(attempt).not.toHaveBeenCalled()

      answerBanner()
      // Not on the same tap that answered the banner.
      expect(attempt).not.toHaveBeenCalled()
      jest.advanceTimersByTime(TIMED_POPUP_SETTLE_MS - 1)
      expect(attempt).not.toHaveBeenCalled()
      jest.advanceTimersByTime(1)
      expect(attempt).toHaveBeenCalledTimes(1)
    })

    it('wait again if a dialog opens during that pause', () => {
      const store = createFloatingLayerStore()
      const attempt = jest.fn()
      const answerBanner = store.request('cookie-banner')
      store.scheduleTimedPopup({ delayMs: 1_000, attempt })
      jest.advanceTimersByTime(1_000)

      answerBanner()
      const closeSheet = store.request('dialog')
      jest.advanceTimersByTime(TIMED_POPUP_SETTLE_MS)
      expect(attempt).not.toHaveBeenCalled()

      closeSheet()
      jest.advanceTimersByTime(TIMED_POPUP_SETTLE_MS)
      expect(attempt).toHaveBeenCalledTimes(1)
    })

    it('are not held back by the event card or the booking bar', () => {
      const store = createFloatingLayerStore()
      const attempt = jest.fn()
      store.request('event-banner')
      store.request(BOOKING_BAR_LAYER)
      store.scheduleTimedPopup({ delayMs: 500, attempt })

      jest.advanceTimersByTime(500)
      expect(attempt).toHaveBeenCalledTimes(1)
    })

    it('try once and no more', () => {
      const store = createFloatingLayerStore()
      const attempt = jest.fn()
      store.scheduleTimedPopup({ delayMs: 500, attempt })

      jest.advanceTimersByTime(120_000)
      store.request('dialog')()
      jest.advanceTimersByTime(120_000)
      expect(attempt).toHaveBeenCalledTimes(1)
    })

    it('stop when cancelled, before the delay or while waiting', () => {
      const store = createFloatingLayerStore()
      const early = jest.fn()
      store.scheduleTimedPopup({ delayMs: 500, attempt: early })()
      jest.advanceTimersByTime(5_000)
      expect(early).not.toHaveBeenCalled()

      const waiting = jest.fn()
      const answerBanner = store.request('cookie-banner')
      const cancel = store.scheduleTimedPopup({ delayMs: 500, attempt: waiting })
      jest.advanceTimersByTime(500)
      cancel()
      answerBanner()
      jest.advanceTimersByTime(60_000)
      expect(waiting).not.toHaveBeenCalled()
    })
  })
})

describe('open dialogs are read from the page', () => {
  const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('names the attribute every dialog on the site sets while it is open', () => {
    expect(OPEN_DIALOG_SELECTOR).toBe('[aria-modal="true"]:not([data-state="closed"])')
  })

  it('sees a dialog that is already open when watching starts', () => {
    document.body.innerHTML = '<div role="dialog" aria-modal="true"></div>'
    const store = createFloatingLayerStore()
    const stop = watchOpenDialogs(store, document)

    expect(store.isShowing('dialog')).toBe(true)
    stop()
  })

  it('sees a dialog added to the page, and sees it go', async () => {
    const store = createFloatingLayerStore()
    store.request(BOOKING_BAR_LAYER)
    const stop = watchOpenDialogs(store, document)
    expect(store.isShowing(BOOKING_BAR_LAYER)).toBe(true)

    const dialog = document.createElement('div')
    dialog.setAttribute('aria-modal', 'true')
    document.body.appendChild(dialog)
    await flush()
    expect(store.isShowing('dialog')).toBe(true)
    expect(store.isShowing(BOOKING_BAR_LAYER)).toBe(false)

    dialog.remove()
    await flush()
    expect(store.isShowing('dialog')).toBe(false)
    expect(store.isShowing(BOOKING_BAR_LAYER)).toBe(true)
    stop()
  })

  it('follows a drawer that stays mounted and only changes its attributes', async () => {
    // StickyDrawer (the quick booking sheet, the estimator) is always on the page.
    document.body.innerHTML = '<div id="sheet" data-state="closed"></div>'
    const sheet = document.getElementById('sheet') as HTMLElement
    const store = createFloatingLayerStore()
    const stop = watchOpenDialogs(store, document)
    expect(store.isShowing('dialog')).toBe(false)

    sheet.setAttribute('aria-modal', 'true')
    sheet.setAttribute('data-state', 'open')
    await flush()
    expect(store.isShowing('dialog')).toBe(true)

    sheet.removeAttribute('aria-modal')
    sheet.setAttribute('data-state', 'closed')
    await flush()
    expect(store.isShowing('dialog')).toBe(false)
    stop()
  })

  it('does not read a closed panel that kept aria-modal as open', async () => {
    document.body.innerHTML = '<div aria-modal="true" data-state="closed"></div>'
    const store = createFloatingLayerStore()
    const stop = watchOpenDialogs(store, document)

    expect(store.isShowing('dialog')).toBe(false)
    stop()
  })

  it('lets go of the dialog layer when it stops watching', () => {
    document.body.innerHTML = '<div aria-modal="true"></div>'
    const store = createFloatingLayerStore()
    watchOpenDialogs(store, document)()

    expect(store.isShowing('dialog')).toBe(false)
  })
})
