# Wave 8 — P8 Dark-surface cleanup — Handoff

Branch: `codex/redesign-build`. Styling + dead-code removal only; no behaviour/logic/copy changes.

## Task 1 — FAQ dark-background overrides (10 pages fixed)

`components/FAQAccordionWithSchema.tsx` is light. Removed the `className="bg-anchor-green-deep"`
prop from every FAQ usage that passed it (each was the sole class, so the prop was dropped entirely).
The FAQ now renders light on each page's light section.

Pages fixed (10):
- app/bank-holiday-weekends/page.tsx
- app/bonfire-night/page.tsx
- app/boxing-day/page.tsx
- app/easter/page.tsx
- app/fathers-day/page.tsx
- app/halloween/page.tsx
- app/mothers-day/page.tsx
- app/new-years-eve/page.tsx
- app/st-patricks-day/page.tsx
- app/valentines-day/page.tsx

Note: the brief also named `summer-garden-parties` (`bg-anchor-green-card`) and `corporate-christmas-parties`
as FAQ examples, but inspection showed neither FAQ usage carries a dark bg class — no change needed there
for Task 1. No FAQ anywhere passes a dark bg after this work (verify #1 = 0).

## Task 2 — Replace legacy CTASection with CtaBand (2 pages)

CtaBand API: `title`, optional `copy`, `primary`/`secondary` ReactNode actions, or full-control `children`.

### app/reviews/page.tsx (was line 264)
- title "Ready to Visit?" -> `title`
- description -> `copy`
- "Book a Table" (CTASection routed booking hrefs to BookTableButton -> /book-table) -> `primary` = `<BookTableButton source="cta_section" context="reviews" variant="primary" size="lg" trackingLabel="Book a Table">`
- "Call Us" (tel +441753682707, phoneSource reviews_cta) -> `secondary` = `<PhoneButton phone="01753 682707" source="reviews_cta" variant="outline" size="lg">`
- Removed `CTASection` from the `@/components/ui` barrel import; added direct imports for CtaBand, BookTableButton, PhoneButton.

### app/history/page.tsx (was line 696)
- title -> `title`; description -> `copy`
- Used `children` (3 buttons + footer line) because of the third action + footer:
  - BookTableButton (source/context history_cta -> /book-table, matches original href `/book-table`)
  - DirectionsButton (same maps URL, source history_cta)
  - PhoneButton (CONTACT.phone, source history_cta, label `Call {phone}`)
  - footer address line preserved as `<p class="text-sm text-anchor-cream-text/80">` inside the band.
- Swapped `CTASection` import for `CtaBand`; BookTableButton/DirectionsButton/PhoneButton were already imported.

Destinations/labels/GTM sources preserved. Original buttons used `variant: 'white'`, which CTASection mapped to
the `outline` button variant — preserved (primary action promoted to `primary` variant per CtaBand's standard pattern).

## Task 3 — Stale dark components (all zero-usage -> deleted)

Checked live importers via `git grep`. None had any component importer or barrel re-export:
- components/UpcomingEvents.tsx (legacy) — DELETED. Live one is `components/events/UpcomingEvents.tsx` (untouched). The test `tests/unit/BookTableUpcomingEventsPanel.test.tsx` targets `features/TableBooking/BookTableUpcomingEventsPanel`, unrelated — left in place.
- components/ManagersSpecial.tsx — DELETED. (The `ManagersSpecial` matches elsewhere are the *type* `@/types/managers-special` and `lib/managers-special*`, not this component.)
- components/DailySpecials.tsx — DELETED.
- components/ui/GreenSection.tsx — DELETED (zero importers; per brief, delete-if-unused).

Also deleted: components/CTASection.tsx (legacy dark CTA band, now zero-usage after Task 2) and removed its
re-export from `components/ui/index.ts` (the "Legacy exports" block, line 67). The separate layout primitive
`components/ui/layout/Section.tsx` `CTASection` is a different export and was NOT in the barrel — untouched.

No stale components were kept.

## Task 4 — section-spacing cleanup

app/corporate-christmas-parties/page.tsx (line 58): `<section className="section-spacing-sm bg-canvas py-section-y">`
-> `<section className="bg-canvas py-section-y">` (py-section-y was already present; removed the legacy class).

## Verification (verbatim)

1. `rg -n "FAQAccordionWithSchema[\s\S]{0,200}bg-anchor-green" app -g '*.tsx'` -> 0
2. `rg -n "CTASection" app` -> 0
3. `rg -n "section-spacing" app/corporate-christmas-parties/page.tsx` -> 0
4. Each deleted component `git grep` across app/components/lib/tests -> 0
5. `npx tsc --noEmit` -> clean (exit 0). `npm run lint` (lint:next + audit:hero [123 templates] + audit:menu-pages) -> all pass. `npm run build` -> succeeds.
6. `npm test` -> 2 suites fail, both PRE-EXISTING and unrelated to this work:
   - `tests/unit/ManagementTableBookingForm.test.tsx` (known baseline failure)
   - `tests/unit/TurnstileField.test.tsx` — confirmed failing on baseline by stashing the only two edited
     pages that could touch it (reviews/history) and re-running; still fails. Not introduced here.
   No NEW failures.

## Staged files (19)
13 modified pages, `components/ui/index.ts`, 5 deletions (CTASection, DailySpecials, ManagersSpecial, UpcomingEvents, ui/GreenSection). Excluded docs/architecture and .redesign-workspace from staging.
