import { isDialogOpen, isLightboxSuppressedRoute } from '../ChristmasLightbox'

/**
 * The lightbox burns its once-per-season suppression key the moment it opens, so firing it
 * on a booking page costs twice: the booking in progress, and the one showing that guest
 * was ever going to get.
 */

describe('the lightbox never fires mid-booking', () => {
  it.each([
    '/book-table',
    '/book-event',
    '/booking-confirmation',
  ])('is suppressed on %s', (path) => {
    expect(isLightboxSuppressedRoute(path)).toBe(true)
  })

  it.each([
    ['/book-table/confirm', 'a booking sub-step'],
    ['/book-event/quiz-night', 'an event booking sub-step'],
    ['/booking-confirmation/abc123', 'a confirmation with a reference'],
  ])('is suppressed on %s (%s)', (path) => {
    // Exact matching would let the modal reappear one step into the flow, which is worse
    // than never suppressing it: the guest has invested more by then.
    expect(isLightboxSuppressedRoute(path)).toBe(true)
  })

  it('is suppressed on the page it advertises', () => {
    expect(isLightboxSuppressedRoute('/christmas-parties')).toBe(true)
  })

  it.each([
    '/quiz-night',
    '/cash-bingo',
    '/music-bingo',
    '/karaoke',
  ])('is suppressed on the game night page %s', (path) => {
    // These carry their own booking form for the next date, so they are booking
    // pages. They are also the paid campaign destination, where covering the
    // screen with a different offer wastes the click that was just paid for.
    expect(isLightboxSuppressedRoute(path)).toBe(true)
  })
})

describe('it still fires everywhere it should', () => {
  it.each([
    '/',
    '/sunday-roast',
    '/food-menu',
    '/whats-on',
    '/private-hire',
    '/beer-garden',
  ])('is allowed on %s', (path) => {
    expect(isLightboxSuppressedRoute(path)).toBe(false)
  })

  it('does not suppress a route that merely starts with the same letters', () => {
    // '/book-table-something' is not inside the booking journey. Guarding with a bare
    // startsWith and no boundary would have swallowed it.
    expect(isLightboxSuppressedRoute('/book-tables-guide')).toBe(false)
  })

  it('does not suppress the quiz competition terms page', () => {
    // '/quiz-night-competition-terms' is a real route that sits next to '/quiz-night'.
    // It is not a booking page, so the lightbox should still fire there.
    expect(isLightboxSuppressedRoute('/quiz-night-competition-terms')).toBe(false)
  })

  it('handles a null pathname without throwing', () => {
    expect(isLightboxSuppressedRoute(null)).toBe(false)
  })
})

/**
 * The route list cannot cover the quick-book sheet, because `StickyCtas` mounts it on
 * every page. A guest choosing a time on the homepage or on `/private-hire` is inside a
 * booking journey on a route the list deliberately allows.
 */
describe('the lightbox never fires over an open dialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('is not suppressed on a page with no dialogs', () => {
    expect(isDialogOpen()).toBe(false)
  })

  it('is suppressed while a Modal is open', () => {
    // `Modal` unmounts when closed, so its presence alone means open.
    document.body.innerHTML = '<div role="dialog" aria-modal="true">Booking</div>'
    expect(isDialogOpen()).toBe(true)
  })

  it('is suppressed while a StickyDrawer is open', () => {
    document.body.innerHTML =
      '<div role="dialog" aria-modal="true" data-state="open">Quick book</div>'
    expect(isDialogOpen()).toBe(true)
  })

  it('is NOT suppressed by a closed StickyDrawer', () => {
    // The regression that matters, and the shape a closed drawer actually has: it stays
    // mounted so it can animate, but drops `role` and `aria-modal` and goes `inert`.
    // `StickyDrawer.test.tsx` pins this markup from the other side.
    document.body.innerHTML =
      '<div data-state="closed" aria-hidden="true" inert>Quick book</div>'
    expect(isDialogOpen()).toBe(false)
  })

  it('is NOT suppressed by a closed panel that still carries aria-modal', () => {
    // Belt-and-braces, and worth keeping even though no component renders this shape any
    // more. One always-mounted overlay that forgot to drop `aria-modal` would suppress
    // the lightbox site-wide for the whole season, and the campaign would silently never
    // run. The `data-state` clause in the selector exists for exactly that.
    document.body.innerHTML =
      '<div role="dialog" aria-modal="true" data-state="closed">Quick book</div>'
    expect(isDialogOpen()).toBe(false)
  })

  it('is not suppressed by a non-modal popover', () => {
    document.body.innerHTML = '<div role="dialog" aria-modal="false">Popover</div>'
    expect(isDialogOpen()).toBe(false)
  })
})
