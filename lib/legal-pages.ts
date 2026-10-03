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

// The day PR #179 merged (27ac3630), which added the sentence about recording
// the web page and advert a table booking came from (cf90f746).
export const PRIVACY_POLICY_LAST_UPDATED = '2026-10-03'
