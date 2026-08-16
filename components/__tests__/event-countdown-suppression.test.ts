import { shouldSuppressPath } from '../EventCountdownBanner'

/**
 * The banner is fixed at bottom-28. On the game night pages, whose heroes are tall,
 * that lands it directly on top of the page's primary CTA and swallows the click.
 * It was caught in production on /quiz-night: the element at the centre of "Book
 * your table for Wed 19 Aug" was the banner's own link, not the button.
 */

describe('the countdown banner stays off pages that already do its job', () => {
  it.each([
    ['/events', 'an event page is the countdown'],
    ['/quiz-night', 'leads with its own dated CTA and booking form'],
    ['/cash-bingo', 'leads with its own dated CTA and booking form'],
    ['/music-bingo', 'leads with its own dated CTA and booking form'],
    ['/karaoke', 'leads with its own dated CTA and booking form'],
  ])('is suppressed on %s (%s)', (path) => {
    expect(shouldSuppressPath(path)).toBe(true)
  })

  it.each([
    '/events/pub-quiz-quiz-night-2026-08-19',
    '/quiz-night/',
  ])('is suppressed on the sub-path %s', (path) => {
    expect(shouldSuppressPath(path)).toBe(true)
  })
})

describe('it still shows everywhere else', () => {
  it.each([
    '/',
    '/whats-on',
    '/sunday-roast',
    '/food-menu',
    '/beer-garden',
  ])('is allowed on %s', (path) => {
    expect(shouldSuppressPath(path)).toBe(false)
  })

  it('does not swallow a route that merely shares a prefix', () => {
    // A bare startsWith would have hidden the banner here too. This page has no
    // booking CTA of its own, so there is nothing to collide with and no reason
    // to suppress it.
    expect(shouldSuppressPath('/quiz-night-competition-terms')).toBe(false)
  })

  it('handles a null pathname without throwing', () => {
    expect(shouldSuppressPath(null)).toBe(false)
  })
})
