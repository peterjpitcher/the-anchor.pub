import { shouldSuppressAdBookingArrival, shouldSuppressPath } from '../EventCountdownBanner'

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
    ['/lunch-and-dinner', 'the food ads land here and it leads with Book a table'],
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

/**
 * The food ads' landing page sends "Book a table" straight to the form on
 * /book-table. At 375 x 812 the banner covered the party size and date fields the
 * visitor had just been sent to. Only that arrival is suppressed.
 */
describe('the countdown banner stays off the booking form for a food-ad arrival', () => {
  it.each([
    '?source=lunch_dinner_lp',
    '?source=lunch_dinner_lp&utm_campaign=weekday_dinner_b_beef_and_ale_pie&short_code=z75yyn',
    '?utm_source=facebook&source=lunch_dinner_lp',
  ])('is suppressed on /book-table%s', (search) => {
    expect(shouldSuppressAdBookingArrival('/book-table', search)).toBe(true)
  })

  it.each([
    ['/book-table', ''],
    ['/book-table', null],
    ['/book-table', undefined],
    ['/book-table', '?source=direct'],
    ['/book-table', '?source=sunday_roast_page'],
    ['/book-table', '?utm_source=lunch_dinner_lp'],
    ['/', '?source=lunch_dinner_lp'],
    ['/food-menu', '?source=lunch_dinner_lp'],
    [null, '?source=lunch_dinner_lp'],
  ])('still shows on %s with %s', (path, search) => {
    expect(shouldSuppressAdBookingArrival(path, search)).toBe(false)
  })

  it('leaves the booking page itself off the hidden list, so other visitors still see it', () => {
    expect(shouldSuppressPath('/book-table')).toBe(false)
  })
})
