# Layers that cover each other, and layout, 8 October 2026

Branch `fix/floating-layers-p17`. Website only. Source: work package P17 of the 7 October 2026 site review (25 findings, with the checkers' corrections), the two accessibility findings handed over from P18 (AX-004, AX-014), and owner decision 12: one floating layer at a time, and remove the two the booking bar replaced.

Everything about what is on screen was checked on a production build served locally, at 320, 375 and 1280px, by asking the browser which element is on top at the middle of each control. Screenshots were looked at. No form was sent.

## 1. One coordinator decides which layer shows

Until now each layer decided for itself, on its own timer, with its own stacking number. `lib/floating-layers.ts` is now the one place that decides. A layer says whether it wants to show and is told whether it may. It never looks for other layers itself.

**The order, highest first. Only the highest one that wants to show is shown.**

| # | Layer | What it is |
|---|---|---|
| 1 | dialog | Anything open that takes the whole screen: the cookie preferences panel, the quick booking sheet, the enquiry drawers, the phone menu, the photo gallery, the allergen filter, and any pop-up once it has opened |
| 2 | cookie banner | A choice the visitor has not made yet |
| 3 | timed pop-up | The Christmas pop-up, the Christmas page's own enquiry pop-up, the Sunday roast prompt and its exit prompt. One may open only when nothing above it is showing, and at most one opens per page view |
| 4 | event card | The "Next Event" card |
| 5 | page prompt | The plane spotting prompt |

**The booking bar is a dock, not one of the five.** It is the way to book, not an advert. It shows together with the cookie banner, the event card or the plane spotting prompt, each of which now sits clear of it. It gives way only to a dialog or an open pop-up, which cover the whole screen anyway. There is no separate phone bar: Call and WhatsApp are buttons on the booking bar.

**How a dialog is known to be open.** The coordinator reads it from the page: every dialog on the site sets `aria-modal="true"` on its panel while open. So a dialog added later is covered without knowing the coordinator exists.

What each layer now does:

- [x] **Cookie banner** (`components/CookieBanner.tsx`). Steps out while a dialog is open and comes back unanswered when it closes. It stays under its own preferences panel. Nothing about consent changed: no choice is made, stored or assumed while it is away, the three answers write the same cookie and send the same event. A test holds that.
- [x] **Booking bar** (`components/layout/StickyCtas.tsx`). Slides away while a dialog or pop-up is open; its buttons leave the tab order while it is off the screen. It no longer reads the consent cookie for itself.
- [x] **Event card** (`components/EventCountdownBanner.tsx`). Three new rules: not on the first screen (it waits until the page has scrolled past the hero, the booking bar's own trigger); after the cookie banner, never with it; never over a dialog. The list of pages where it is switched off stays.
- [x] **Timed pop-ups.** Each asks the coordinator before opening. If the cookie banner is unanswered or a dialog is open when its timer fires, it waits for that to go and then three seconds more, so it never lands on the tap that closed something else. A pop-up that is refused marks nothing as seen.
- [x] **Plane spotting prompt** (`components/plane-spotting/PlaneSpottingBookingPrompt.tsx`). Kept, and lifted 16px above the booking bar. It waits for everything above it in the order, and steps aside for the footer.

Findings this closes: LS-001, LS-002, LS-007, LS-021, AX-014.

## 2. The two layers the booking bar replaced are removed

- [x] **"Get Instant Quote"**, the floating button on the 27 private hire pages. It sat behind the booking bar, which already says "Enquire about your date" there. The cost estimator still opens from "Open Cost Estimator" in the page. `StickyDrawerTrigger` is deleted.
- [x] **"Ready to book?"**, the tip on the Sunday roast page (`ScrollProgressBookingTooltip`). Deleted with its test. The privacy notice no longer lists `sunday_lunch_scroll_tooltip_shown`, so the fingerprint in `lib/legal-pages.ts` moved; the date was already 8 October 2026.
- [x] The third prompt named in LS-006, the plane spotting prompt, is kept and lifted, as the review recommended: it says when the planes are overhead, which the bar does not.

`data-sticky-cta-guard` is still on seven sections. Nothing reads it now. They are other packages' pages, so the attribute is left.

## 3. Nothing moves when a layer arrives

- [x] **The bar no longer shifts the layout (LS-003, FD-007).** It moved up by changing `bottom` when the cookie banner arrived a second after the page, which the browser counts as a layout shift. It now moves with `transform`, which is not counted. Measured on `/private-hire#enquiry` at all three widths: the bar is no longer named in any layout shift entry, total 0.
- [x] The plane spotting prompt is lifted over the bar with `transform` for the same reason.
- [x] The footer's bottom padding grows by the cookie banner's height while the banner is up, so "Cookie settings" at the end of the page is not under the bar on a first visit. The padding is below every line of the footer, so nothing moves.

## 4. A focused control is not hidden behind a layer (AX-004)

- [x] `scroll-padding-bottom` on the page is the booking bar's height plus the cookie banner's. Each publishes its height while on screen and 0px otherwise. A control reached with the Tab key is scrolled clear of both.
- [x] The event card and the plane spotting prompt float higher, where scroll padding cannot help. Each steps aside while the focused control is underneath it (`hooks/useLayerStepAside.ts`).
- [x] Measured: 44 Tab stops at 320px, 44 at 375px and 45 at 1280px, all with the bar on screen. None was wholly hidden. One, an event card taller than the screen, was partly behind the bar at the two phone widths.

## 5. Layout

- [x] **Bot check widget, page narrowed after it loaded.** `/private-hire` and `/private-hire/near/slough-crematorium` showed 22px cut off at 320px in the house audit, which loads a page at 1280px and then narrows it. The wide widget is never narrower than 300px and cannot be swapped for the compact one without losing the visitor's token. It is now laid over its slot instead of in it, so its 300px cannot push the form wider, and it is drawn smaller when the slot is under 300px. Same widget, same token. Fresh loads look as they did.
- [x] **Christmas pop-up on a phone held sideways (LS-008).** A pop-up taller than the screen was centred by its layer, so its top, with the close button, was off the screen and could not be scrolled to. The shared `Modal` now centres the panel with its own margins: in the middle when it fits, from the top when it does not. At 844 by 390 the close button is on screen at once and the last link is reached by scrolling. At 375 and 1280px it is still centred.
- [x] **Parking page buttons on a tablet (LS-010).** The pair wraps to two rows when it does not fit. Nothing is past either edge at 768 or 800px.
- [x] **Cost estimator button at 320px (LS-012).** "Enquire About Your Date" may shrink and wrap below 360px.
- [x] **Pictures whose stated size was not the file's (LS-015, part).** The Sunday roast photo (1920 by 1072), the footer logo (96 by 48 as drawn) and the Lal's Prayer scan (1198 by 2048).
- [x] **Long web addresses in blog posts (LS-011).** A link in a post may break anywhere.
- [x] **Festive lights between 640 and 767px (LS-022).** The larger artwork starts at 768px.
- [x] **Tap size (LS-016, part).** The close buttons on the drawers and on the event card keep their look and take a 44px tap. The footer was done in P18.
- [x] **Privacy notice at 320px.** The list of storage key names ran 39px past the edge (found by the house audit on this branch; the notice was rewritten earlier the same day). The names may now break. Markup only.

## 6. Hours that said "loading" for ever (HT-005, C3-024, LS-014)

- [x] `/book-table`: the box beside the form is the live week, rendered on the server from the same cached read the homepage uses.
- [x] `/about/the-anchor-facts`: the two rows that said the hours "are loading from the management system" are gone. The page renders the live week and a kitchen hours line built by `buildKitchenSchedule`, or the phone number if the management app cannot be reached.
- [x] `components/StaticHoursSummary.tsx` is deleted. Both pages, as served, hold all seven days and no "loading" text.

The wording in `lib/business-hours-fallback.ts` is unchanged. It is still what `WeekHours`, `BusinessHours` and the header show for the moment before live hours arrive, and those are the hours package's files (P20).

## 7. Analytics

Every layer sends the same events as before. Two are now sent at a different moment, because the layer can be asked for before it is on screen:

- The event card's `view` is counted when the card is first on screen, once for each event. It used to be counted when the event was fetched, which was the same moment while the card appeared as the page opened.
- The plane spotting prompt's `plane_spotting_prompt_shown` is sent when the prompt is first on screen.

Unchanged: the bar's "seconds shown" (a dialog opening does not stop the clock, as it never did), the cookie banner's three answers, every pop-up's open, dismiss and click events.

Gone with the two removed layers: `estimator_*_open` from the floating quote button, and the tip's `sunday_lunch_scroll_tooltip_*` events.

## 8. What was found and not changed

- **The quick booking sheet grows when its times load**, and the browser counts that as a layout shift of the sheet: 0.28 at 320px, 0.22 at 375px, 0.06 at 1280px on this build. It is the sheet's own loading, not a layer arriving, and the page behind does not move. Not checked against main.
- **The house audit no longer sees the event card.** It checks each page at the top with the cookie banner unanswered, where the card now does not show. Its timed pop-up pass was given an answered cookie banner so that it still finds the Christmas pop-up.
- LS-009 (the header scrolls away): left as it is, the recorded default.
- LS-015, blog pictures with no size: not done. It needs each picture read at build time in `lib/markdown.ts`.
- LS-016, the rest: breadcrumb links, enquiry fields, the booking sheet's date field, the cookie banner's privacy link.
- LS-017, LS-018, LS-019, LS-020, FD-008: not done. See the report for why.

## Tests

`tests/unit/floating-layers.test.ts` (the rules, with nothing rendered: the order, every combination, the dock, timed pop-ups on a clock, dialogs read from the page). `tests/unit/floating-layers-components.test.tsx` (the real layers together). `tests/unit/sticky-ctas-cookie-banner.test.ts` rewritten for the new mechanism. New cases in `tests/unit/TurnstileField.test.tsx`. `jest.setup.js` starts a new page view before each test and stands in for `ResizeObserver`.

## Assumptions

- "One floating layer at a time" is about what asks for attention. The booking bar stays on screen with the cookie banner, as the owner asked for before, and with the event card.
- "The two the booking bar replaced" are the two the review recommended removing.
- On the Sunday roast page the Christmas pop-up opens at 10 seconds and the page's own prompt is then not shown on that visit. One pop-up per page view was the rule that could be applied without a new decision.
- The privacy notice date stays at 8 October 2026 because this goes out with the same day's rewrite.
