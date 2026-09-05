# Fixes from the independent booking feedback, 5 September 2026

Owner decisions taken on 5 September 2026:

1. Christmas deposit is **refundable up to seven days before the booking**. The live
   management setting wins; the site and the SSOT were wrong.
2. Event seating is **per event**, chosen in the management app as table, communal,
   ticketed or standing. No single site-wide claim is correct.
3. Approved: make the small website fixes.

Out of scope here (management app, not this repo): the one-course Christmas pre-order
configuration, menu description quality including Broccoli Cheese, and setting sellable
capacity on dated event records.

## Wave 0, keep the tree clean

- [ ] Commit the pre-existing `SSOT.json` whatpub to camra.org.uk URL change on its own,
      so it is not swept into the deposit work.

## Wave 1, Christmas deposit refundability

The rule changes from "non-refundable" to "refundable up to seven days before".

- [ ] `SSOT.json`: `christmas_2026.deposit.refundable` false to a refund-window rule
- [ ] `docs/SSOT.md` line 258
- [ ] `app/christmas-parties/client-components.tsx` lines 415, 812, 875
- [ ] `content/blog/work-christmas-party-ideas-near-heathrow/index.md` lines 84, 128
- [ ] `content/blog/festive-buffet-ideas-for-large-groups-near-heathrow/index.md` line 79
- [ ] `content/blog/christmas-dinner-or-party-night-which-suits-your-group/index.md` lines 78, 109
- [ ] `content/blog/christmas-party-planning-checklist-for-organisers/index.md` lines 82, 93
- [ ] `content/copy-decks/*christmas*.md`: dated superseded notes, these are internal
      records and are not rendered, but they state the old rule as current guidance
- [ ] `npx jest tests/ssot-drift-guard.test.ts`

## Wave 2, event versus table booking contradiction

The three game night pages are already accurate and seating-specific. Only the
book-table page tells people to make two bookings.

- [ ] `app/book-table/page.tsx` lines 378 to 381: stop instructing a separate food
      booking before an event, point at the event page instead

## Wave 3, promotion over an open booking sheet

`ChristmasLightbox` suppresses by route only. `StickyCtas` mounts the quick-book sheet
on every page, so on the homepage or `/private-hire` the lightbox can fire over an open
booking sheet.

- [ ] Suppress the lightbox while any booking or enquiry dialog is open, by state
      rather than by adding more route prefixes
- [ ] Test covering the open-sheet case

## Wave 4, mislabelled private hire action

- [ ] `components/layout/Navigation.tsx` line 92 and `components/layout/Footer.tsx`
      line 60: "Check Availability" points at the estimator, not a live calendar

## Wave 5, verification

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test` and `npm run test:utc`
- [ ] `npm run build`

## Results

(filled in as waves complete)
