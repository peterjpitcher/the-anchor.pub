/**
 * The day each legal page's wording last changed, as a London calendar date
 * (YYYY-MM-DD).
 *
 * Hand-maintained, on purpose. The privacy notice used to print `new Date()` at
 * render, so "Last updated" showed today's date on every view and never told a
 * reader when the notice had actually changed. Section 10 of the notice
 * promises that the date moves when the notice does.
 *
 * Change the words of a page, change its date here in the same commit. Use the
 * day the change goes live. Layout, styling and refactors that leave the words
 * alone do not move it.
 *
 * Format it with `formatLondonLongDate` from `lib/time-london.ts`. Never derive
 * it from the clock.
 */

// The day the notice gained its account of event bookings and of what accepting
// marketing cookies switches on: the 90-day advert record, what is sent to Meta,
// when it is deleted, and LinkedIn's tag (PR #183, merged that day). The
// footer's Cookie settings control was written the same day: the notice
// stopped telling people to clear the site's cookies to change their mind
// and points them at the control instead (PR #184, merged that day). The line
// under Managing Cookies, that switching a category off deletes its cookies
// and which ones we cannot reach, was also written that day. If that merges
// on a later day, move the date to that day before merging.
//
// 7 October 2026: the paragraph under Analytics Cookies on the site's own page
// speed record (app/api/web-vitals/route.ts), which sets no cookie and runs
// until analytics is switched off. A draft the owner had not approved when it
// was written. If it goes live on a later day, move the date to that day.
//
// 8 October 2026: the notice was rewritten from what the code does and from the
// owner's decisions of 7 October (site review package P07). It now names who is
// responsible for the data and every company that handles it, says what happens
// to a job application, lists every cookie and storage key, and gives only the
// retention periods a job enforces or the owner has decided. Written on a
// branch that had not shipped: if it goes live on a later day, move the date to
// that day.
//
// 8 October 2026, later: the Aviationstack line left the list of companies when
// the flight boxes were removed from the four terminal pages (owner decision
// 14, site review package P19). Nothing on the site contacts it any more. Also
// written on a branch: if it goes live on a later day, move the date to that
// day.
export const PRIVACY_POLICY_LAST_UPDATED = '2026-10-08'

/**
 * SHA-256 of the notice's words as they stood on the date above, with the
 * "Last updated" line left out.
 *
 * `tests/unit/privacy-policy-last-updated.test.tsx` renders the notice and
 * recomputes this. If the words have changed it fails and prints the new value,
 * which is the prompt to move the date above. It cannot tell whether the date
 * was moved: it stops the change being forgotten, not being skipped.
 *
 * Words that change with no edit to the page count too, such as the consent
 * wording version the notice quotes. If only the markup changed and the reader
 * sees the same notice, update this value and leave the date.
 */
export const PRIVACY_POLICY_WORDS_FINGERPRINT =
  '7501de852b08f3d13e4ffef653c343aed1daf8b2e6238cc5739dc477eca8985b'
