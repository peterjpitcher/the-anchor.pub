/**
 * When this year's Halloween party stops being upcoming.
 *
 * The page previously stated "Saturday 31 October, 8pm till midnight, free
 * entry" as flat fact, with no date logic anywhere. On 1 November it would have
 * carried on inviting people to a party that had already happened, in the page
 * body AND in the search result, until somebody remembered to edit it.
 * Seasonal pages get most of their traffic exactly when the date is closest,
 * which is also when being wrong costs the most.
 *
 * Keyed to the END of the night, not the start: someone checking at 10pm on the
 * 31st is still coming, and half an hour past midnight covers the stragglers.
 *
 * Lives here rather than in the page because Next only permits a fixed set of
 * exports from a route file, and because both `generateMetadata` and the body
 * must read the same value: a search result and the page it points at should
 * never disagree about whether the night has happened.
 *
 * ANNUAL ROLLOVER. Owner: Peter Pitcher. Update this and HALLOWEEN_DYNAMIC in
 * app/halloween/page.tsx once next year's date and theme are confirmed. Until
 * then the page correctly says the theme is not yet announced rather than
 * inventing one.
 */
export const HALLOWEEN_PARTY_ENDS = new Date('2026-11-01T00:30:00')

export function isHalloweenPartyOver(now: Date = new Date()): boolean {
  return now.getTime() > HALLOWEEN_PARTY_ENDS.getTime()
}
