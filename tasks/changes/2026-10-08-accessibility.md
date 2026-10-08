# Accessibility (P18)

Date: 8 October 2026. Branch: `fix/accessibility-p18`, from main at 9e014677 (PR #220). Website only. Local only: not pushed, no PR, not deployed.

Source: the site review of 7 October 2026, package P18 (findings AX-001 to AX-021, with the checkers' corrections). AX-005 and AX-006 (text over hero photos, the festive frost) shipped in PR #220 and the bot check's failure state in PR #217; neither is touched here. AX-004 and AX-014 (fixed layers covering focused controls and each other) belong to package P17 and are left for it.

No customer-facing wording changed. Two screen-reader-only lines are new: "Pause reviews" / "Play reviews" on the carousel button, and "N times available on <date>." after a table search.

## What changed

### 1. The 'Another date' box in the quick booking sheet (AX-003)

`components/features/TableBooking/QuickBookSheet.tsx`: the date input had the theme's text colour and no background, so on the dark skin it was cream on the browser's white field. It now has `bg-surface`. `app/globals.css` asks for the dark date picker under `.theme-dark` only, so the calendar icon shows on the dark skin and the light months keep the light control.

| | Before | After |
|---|---|---|
| Dark skin | #f0e6c6 on #ffffff, 1.25:1 | #f0e6c6 on #172d1e, 11.77:1 |
| Light skin | #1a1a1a on #ffffff, 17.4:1 | unchanged |

Measured in the browser on the production build with the sheet open, 375px and 1280px: text rgb(240,230,198) on rgb(23,45,30), colour scheme `dark`.

### 2. The Tab key in the phone menu (AX-001)

`hooks/useFocusTrap.tsx` built its list of controls from a selector alone, so it included links inside a collapsed section. It now leaves out anything inside `[hidden]` or `[inert]`, anything with `visibility: hidden`, and anything with `display: none` on it or on a parent up to the container. Read from styles, not from boxes, so jsdom gives the same answer.

In the browser at 375px, menu opened with Enter, ten presses of Tab: Private Hire, What's On, Find Us, Airport parking, Christmas, Nations Championship, Book a table, Food, Private Hire, What's On. Before: 'Food' every time. The cookie preferences panel is the hook's only other user; its own keyboard test still passes.

### 3. The Christmas pop-up is a dialog (AX-002)

`components/features/christmas/ChristmasLightbox.tsx` is rebuilt on `components/ui/overlays/Modal.tsx`. It now has `role="dialog"`, `aria-modal`, the name "Christmas 2026", takes focus when it opens, keeps Tab inside, closes on Escape and hands focus back. Its suppression rules, its timer, its fade and its own analytics events are unchanged.

Modal gained what that needed:

- `onClose` is told why (`escape_key`, `backdrop_click`, `close_button`), so the pop-up still records the reason.
- `analytics={false}` for a caller that records its own events, so the pop-up is not counted twice.
- `overlayClassName`.
- A fault found on the way: a Modal first rendered already open never set its Tab trap, because the trap was set on the pass before the panel existed. Fixed by adding `mounted` to that effect.
- Tab pressed with focus behind the dialog now brings focus in.

The wash over the pop-up's photo goes from 40% to 60% black and "Bookings Now Open" from pale red to white: white on 60% black over a pure white photo is #ffffff on #666666, 5.74:1, the worst case. It measured 4.26:1 before.

### 4. Dialog names (AX-015)

`ModalTitle` and `ModalDescription` take their ids from the Modal around them, and tell it they are there. A dialog is named by its title when one is rendered and by its `title` prop when not, and never points at an id that is missing. That fixes the exit-intent and timed prompts on the Sunday roast page, which pointed at `exit_intent_modal-title` while their titles were `modal-title`.

### 5. Colours that follow the skin (AX-007)

| Item | Change | Light skin | Dark skin |
|---|---|---|---|
| 'Drinks only' on a tinted time button (`SlotPickerGrid.tsx`) | `text-anchor-gold-dark` to `text-accent-text` | 4.97:1 | 6.31:1 (was 2.36) |
| Busy caption, high chair flag (`SlotPickerGrid.tsx`, `ManagementTableBookingForm.tsx`) | same | 5.59:1 | 7.01:1 |
| Selected seat count (`ManagementEventBookingForm.tsx`) | `text-white` to `text-canvas` on `bg-accent` | 8.91:1 | 8.36:1 (was 2.09) |
| 'Get directions' on /cash-bingo, /music-bingo, /karaoke | brand green to `accent` | 8.1:1 | 8.95:1 (was 1.98) |
| Contact links (`ContactLink.tsx`), not-found page links, `DirectionsLink`, `PhoneLinksSection` | `text-anchor-gold-dark` to `text-accent-text` | 5.26:1 | 8.36:1 on the page, 7.01:1 on a card (was 2.62 to 3.13) |
| Flight notice (`FlightStatus.tsx`), free event price (`EventMetadata.tsx`) | Tailwind green to `text-anchor-success` | 5.64:1 | 10.87:1 (was 3.73) |
| Step numbers on /sunday-roast and in the parking wizard, the 'Get Instant Quote' button, `PricingCard` flag, blog tag pill, `ErrorDisplay` button, `Tooltip` warning, `Tabs` pill | mid gold fill to dark gold with white | 5.59:1 | 5.59:1 (was 4.02 with white, 4.33 with charcoal) |
| Event category chip (`event-display.ts`) | text in the page's ink, on the same 12% tint | 4.5:1 or better for any colour | same (purple was 2.58) |
| Game night fact labels (`GameNightFacts.tsx`) | 70% opacity removed | | 6.41:1 measured |
| Parking confirmation amount | brand green to `text-ink-strong` | | |
| Reviews carousel current dot | `bg-anchor-gold-dark` to `bg-accent-text` | | |

Browser readings on the dark production build: not-found link 8.36:1, /find-us directions link 7.01:1, 'Get directions' 8.95:1, Sunday roast step number 5.59:1, 'Get Instant Quote' 5.59:1, category chip 10.20:1.

The mid gold (#a57626) takes neither white nor charcoal at 4.5:1, so a test now fails on any resting mid-gold fill with text on it.

### 6. Focus rings (AX-008)

- `app/globals.css`: the rule that gives a control with `focus:outline-none` the theme's ring was losing. There is no `@tailwind variants` line, so Tailwind writes every `focus:` utility at the end of the stylesheet, after it. The selector is now doubled so it wins. Adding `@tailwind variants` would have moved every hover, focus and breakpoint utility ahead of the hand-written CSS, which is a far wider change.
- `--anchor-focus-ring-color` is declared again inside `.theme-dark`. Declared at `:root` only, a dark section on a light page (the footer, a hero) kept the light skin's dark gold.
- 109 fixed dark-gold focus classes in 18 files became `accent-text`, which is the same colour on the light skin and bright gold on the dark one. `components/CookieBanner.tsx` is left alone (it is being rewritten); the stylesheet rule covers it.

Ring colour against what is behind it: 8.36:1 on the dark page, 7.01:1 on a dark card, 4.52:1 on the green header (was 1.69), 5.26:1 on the light page, 5.59:1 on a light card. Browser readings: booking form field 7.01:1, job form field 7.01:1, header strip link 4.52:1, phone menu link `3px solid rgb(217, 174, 38)`. A Tab walk of six pages (/, /book-table, /join-our-team, /private-hire, /whats-on, /sunday-roast) found 150 different controls, every one with a solid 3px outline.

### 7. Skip link (AX-009)

`app/layout.tsx`: `focus:z-50` to `focus:z-[70]`, above the sticky header's 60. Seen at 375px and 1280px: the whole link shows, and the audit's five sample points on it are all the link.

### 8. Labels and autofill (AX-010, AX-016)

- `components/PrivateBookingInquiryForm.tsx`: all nine fields are tied to their labels with `useId`. Mobile, first name, last name and email carry `autoComplete`.
- `components/PrivateBookingCalculator.tsx`: the date box is named by its heading, guests and hours by their labels. The catering quantity boxes and remove buttons, which had no name either, are named after their package.
- `components/features/ParkingBookingWizard/index.tsx`: `autoComplete` on first name, last name, email and mobile; mobile is `type="tel"`.

### 9. Announcements (AX-011)

- `components/ui/primitives/Button.tsx`: a loading button is no longer `disabled`. It is `aria-disabled` and `aria-busy`, keeps keyboard focus, and cancels the click before the handler or the form sees it. Tests cover a press, Enter in a field of the same form, and that it works again afterwards.
- `ManagementTableBookingForm.tsx`: a screen-reader status line says how many times were found. In the three-screen flow focus moves to the 'Choose your time' heading.
- `role="alert"` on the parking wizard's rate, availability and payment failures and on the quick booking sheet's field error; `role="status"` on the parking wizard's progress lines.

### 10. Reviews carousel (AX-012)

A small pause button at the start of the row of dots, first in the tab order. Pressed, the carousel stays still until Play is pressed; hover and focus no longer restart it. The current dot has `aria-current`. In the browser on /beer-garden: paused, the slide had not moved after 6.5 seconds. The button is 24px by 24px, the size of a dot.

### 11. Sideways scrollers (AX-013)

`role="region"`, `tabIndex={0}` and a label on the event facts strip, the venue spaces table, the catering table, the compact testimonial strip and the tables on /heathrow-layover-dining, /restaurants-near-heathrow and /sunday-roast. The event facts strip gains one tab stop from 640px up, where it is a grid and does not scroll.

### 12. Structure (AX-019)

- `app/layout.tsx`: the outer `<footer>` around `Footer` is a `<div>`, so there is one footer landmark.
- Footer column titles are `h2`, same styling.
- `Alert` takes `titleAs="p"`; the event page's status notice uses it, so 'This event has ended' is no longer a heading ahead of the h1.
- `role="group"` on the venue tour's labelled row of buttons.
- The second navigation on a blog post is labelled 'Blog breadcrumb'.
- Heading levels on /beer-garden, /coach-parking-heathrow, /private-hire/baby-showers and /private-hire/gender-reveal no longer skip a level. Tags only; classes and looks unchanged.

axe's structure rules on 24 pages at 1280px and 390px, after: no duplicate or nested footer landmark, no unnamed dialog, no unlabelled field, no unfocusable scroller. Left: `region` on 24 pages (the cookie banner, below) and `heading-order` on the four terminal pages (the flight box's h4, below).

### 13. Tap targets in the footer (AX-020)

Below 768px every footer link is 44px tall (they were 18 to 20px) and the three round icon links are 44px. Padding, with the lists' own gaps removed at that width. Measured at 375px with every accordion open: 60 targets, 59 at 44px or more, none overlapping. The one left is the 'Orange Jelly' credit, a link inside a sentence. From 768px up nothing changes.

### 14. The audit (AX-021)

`scripts/audit-a11y.js` now also:

1. runs axe on every page a second time, loaded at 390px;
2. runs axe on the not-found page;
3. presses Tab once at 390px and 1280px and fails unless the skip link takes focus and is on top;
4. opens the phone menu from the keyboard, presses Tab ten times and fails unless focus moves to five or more controls and stays in the menu, then runs axe on the open menu;
5. opens the quick booking sheet and the cost estimator and runs axe on each;
6. on the timed pop-up: focus must be inside it, ten presses of Tab must stay inside, it must be a named modal dialog, Escape must close it and focus must go back.

It loads pages and opens things. It never sends a form.

## Left, and why

- **AX-004, AX-014**: fixed layers covering focused controls and the quick booking sheet. Package P17.
- **AX-017**: the brochure PDFs. No change, by the finding's own instruction.
- **AX-018**: event poster descriptions come from the management app; the five blog photo descriptions are in `content/blog`, which another change owns.
- **AX-019, part**: the cookie banner outside any landmark (`components/CookieBanner.tsx` is being rewritten); the empty first header cell in five blog tables (`content/blog`); the h4 in the flight box on the four terminal pages (P19 recommends removing the box).
- **AX-011, part**: the audit does not press 'Find a table', because that sends a form on a build that talks to the live booking system. The button and the status line are covered by unit tests only.
- **AX-021, part**: the audit is not in CI. CI has no browser and no `ANCHOR_API_KEY`, and without the key the event page in the audit's list answers 404. Not added: the Tab walk for covered controls (P17's subject), pixel sampling over photos, a focus-ring measurement per component, `pdfinfo` on the downloads.
- **Header strip links** (AX-020): the strip is only shown from 1024px up, so there is no small-screen case to fix.

## Assumptions

- A loading button that cancels its own click is as safe against a double booking as a disabled one. Unit tests hold it for a press and for Enter in a field.
- The pop-up now stops the page behind it scrolling while it is open, as every other Modal does.
- Writing category chips in the page's ink, not the category colour, is acceptable: it is the only choice that reads for every colour the management app can hold.
- Dark gold with white is acceptable wherever the mid gold carried text, as it is already the primary button's fill.

## Gates

Run on 8 October 2026 with Node 20.19.5.

| Gate | Result |
|---|---|
| `npm run lint:next` | no warnings or errors |
| `npx tsc --noEmit` | clean |
| `npm test` (London) | 298 suites, 5,037 passed, 1 skipped |
| `npm run test:utc` | 298 suites, 5,037 passed, 1 skipped |
| `npm run build` | exit 0 |
| `npm run audit:a11y` on the production build | 0 violations, 0 contrast failures, 0 keyboard problems, 0 unsettled, on 16 templates at 1280px and 390px, the not-found page, the phone menu, the quick booking sheet, the cost estimator and the Christmas pop-up. Exit 1 for 2 reflow rows, below. 60 rows left for a person (text over photos and the breadcrumb link, as before, now counted at two widths). |

The two reflow rows are not from this branch: /private-hire and /private-hire/near/slough-crematorium, 22px at 320px. The audit narrows a page it loaded at 1280px, so the bot check widget was sized for a desktop. `2026-10-08-bot-check.md` records the same 22px and why it was left. The same pages loaded at 320px have nothing cut off.

The audit is not part of CI (`.github/workflows/ci.yml` runs lint, Jest and the build).

Tests added: `tests/unit/useFocusTrap.test.tsx`, `tests/unit/christmas-lightbox-dialog.test.tsx`, `tests/unit/accessibility-p18.test.tsx`, `tests/unit/a11y-audit-popup-keyboard.test.ts`, and new cases in the Modal and Button suites.
