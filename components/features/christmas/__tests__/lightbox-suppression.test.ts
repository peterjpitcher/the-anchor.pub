import { isLightboxSuppressedRoute } from '../ChristmasLightbox'

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

  it('handles a null pathname without throwing', () => {
    expect(isLightboxSuppressedRoute(null)).toBe(false)
  })
})
