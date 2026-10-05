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
// when it is deleted, and LinkedIn's tag.
export const PRIVACY_POLICY_LAST_UPDATED = '2026-10-05'

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
  'f4a5cc15095659daa6541160e1ba7487a5e5b7865e5d5f89d24acdd2e0db6ad4'
