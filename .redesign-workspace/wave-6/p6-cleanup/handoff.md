# Phase 6.1 — Delete retired components & legacy CSS (handoff)

Branch: `codex/redesign-build`. PR 6.1 (final cleanup). The iron rule was applied:
every file/class was deleted ONLY after `git grep` proved zero remaining **live**
(non-test, non-barrel, non-other-dying-component) references.

## Deleted — components (zero live usage verified)

### Hero cluster (`components/hero/`)
Only referrers were each other + the barrel + assertion/comment-only test references.
- `HeroWrapper.tsx` (+ test `tests/unit/HeroWrapper.smart.test.tsx`)
- `HeroSection.tsx` (the `components/hero/` one — NOT the `ui/layout/Section.tsx` `HeroSection`, which survives)
- `HeroSectionServer.tsx`
- `heroVariants.ts`
- `HeroTag.tsx`
- `SmartCTAs.tsx`
- `Breadcrumbs.tsx` (only used by HeroSection/HeroWrapper, both deleted)
Barrel `components/hero/index.ts` reduced to a single line: `export { InteriorHero, type InteriorHeroProps }`.

### Standalone components (zero importers)
- `components/ui/PageHeader.tsx`
- `components/ManagersSpecialHero.tsx`
- `components/SectionHeader.tsx` (deprecated re-export of SectionHeading)
- `components/conversion/StickyMobileBookingCTA.tsx` (+ test `components/conversion/__tests__/StickyMobileBookingCTA.test.tsx`)
- `components/food/FoodStickyCtaBar.tsx` (only referrer was a comment in the now-deleted FloatingActions)
- `components/events/EventStickyBookingCTA.tsx` (+ test `tests/unit/EventStickyBookingCTA.test.tsx`)
- `components/layout/FloatingActions.tsx` (+ test `tests/unit/FloatingActions.test.tsx`; no live layout usage)
- `components/ui/forms/Input.tsx` (deprecated re-export of primitives/Input; zero importers)
- `components/MenuRenderer.tsx` (only consumer was FilteredMenuRenderer, also deleted)
- `components/FilteredMenuRenderer.tsx` (zero importers)
- `components/EventsToday.tsx`
- `components/EventCategories.tsx` (component; the `getEventCategories` API fn in lib/api is unrelated and kept)
- `components/CategoryFilter.tsx`
- `components/NextEvent.tsx`
- `components/NextEventServer.tsx`
- `components/EventAvailability.tsx` (the React component; `EventAvailability` *type* in lib/api is unrelated and kept)
- `components/ProductDetails.tsx`
- `components/FilteredUpcomingEvents.tsx` (+ test `tests/unit/filteredUpcomingEvents.test.ts`)
- `components/FilteredUpcomingEventsClient.tsx` (+ test `tests/unit/FilteredUpcomingEventsClient.test.tsx`)
- `components/ManagersSpecialSchedule.tsx` (only consumer of BotanicalsGrid)
- `components/BotanicalsGrid.tsx` (only used by ManagersSpecialSchedule, also deleted)
- `components/features/CareersForm.tsx` (+ test `components/features/__tests__/CareersForm.test.tsx`; only referrer was its own test)
- `components/LazySection.tsx`
- `components/EventBookingErrorBoundary.tsx`
- `components/reviews/HeaderReviewBadge.tsx` (re-export removed from `components/reviews/index.ts`)

## Barrels cleaned
- `components/hero/index.ts` — removed HeroSection/Breadcrumbs/HeroTag/HeroWrapper/SmartCTAs/heroVariants re-exports; kept InteriorHero.
- `components/reviews/index.ts` — removed HeaderReviewBadge re-export.
- `components/ui/forms/index.ts` — removed the (now-dangling) `Input`/`InputProps` re-exports of the deleted `./Input`. Barrel had zero importers of Input.

## CSS removed from `app/globals.css` (zero markup usage confirmed)
- `.inner-frame` (+ `::after`)
- `.btn-friendly` (+ `:hover`, `:active`, and the `prefers-contrast: high` override)
- `.card-warm` (+ `:hover`) and the dead `.card-link:focus` / `.card-link:focus-visible .card-warm` rules (`.card-link` itself not in markup)
- `.tag` (the `\btag\b` grep hits were all JS variables / `[tag]` route segments / `.tags` props — no `.tag` className in markup)
- `--font-merriweather` and `luxury`/`luxury-lg` shadow defs: already absent (nothing to remove).

## Kept — still referenced (NOT deleted)
- **`components/HeroBadge.tsx`** — live `<HeroBadge>` import/usage on 11 `app/*` pages; also exports `ItemBadge`, used by live `components/ManagersSpecial.tsx` (on /drinks pages). KEEP.
- **`components/hero/InteriorHero.tsx`** — the successor hero, imported by ~110 `app/*` pages via the hero barrel.
- **`components/ui/layout/Section.tsx` `HeroSection` export** — a DIFFERENT component from the deleted hero/HeroSection; re-exported via `components/ui/index.ts`. Untouched.
- **CSS `.card-dark`** — still in live markup: book-table, DirectionsCard, ManagersSpecial, PrivateBookingCalculator, PrivateBookingInquiryForm, UpcomingEvents, ChristmasLightbox, BookTableUpcomingEventsPanel. KEEP.
- **CSS `.section-spacing` + `-sm`** — still used by `app/corporate-christmas-parties` (`-sm`) and `components/DailySpecials` (base). Left the whole `.section-spacing*` family intact (cohesive utility; base + `-sm` are live).
- **lib/api `getEventCategories` fn + `EventAvailability` / `EventCategoriesResponse` types** — used by pages and the API client; unrelated to the deleted components of the same name.

## Verification (verbatim)

1. `npx tsc --noEmit` → **clean (exit 0)** on the final restored tree.
2. `npm run lint`:
   - `lint:next` (ESLint) → **"✔ No ESLint warnings or errors"**.
   - `audit:hero` → **FAILS, PRE-EXISTING**: `app/page.tsx:1 Missing HeroWrapper on non-exempt content page.`
     Confirmed identical with all my changes stashed (committed HEAD). The homepage uses `HomeHero`
     (a Phase-4 component the audit script does not recognise alongside HeroWrapper/InteriorHero).
     `app/page.tsx` and `scripts/audit-hero.js` were NOT touched by this PR. Out of scope for 6.1.
   - `audit:menu-pages` → **FAILS, PRE-EXISTING**: hard-coded price literals in `app/food-menu/page.tsx`
     (lines 198–199) and `app/pizza-menu/page.tsx` (line 116). Confirmed identical on committed HEAD;
     those files were NOT touched by this PR.
3. `npm run build` → **succeeds (exit 0)**, all routes compiled.
4. `npm test` → **Test Suites: 2 failed, 78 passed, 80 total; Tests: 32 failed, 1 skipped, 677 passed**.
   Both failing suites are **PRE-EXISTING baseline failures** — verified by running them against
   committed HEAD (changes stashed): identical `2 failed / 32 failed` result.
   - `tests/seo-indexing.test.ts` — failing assertion `orphan-page internal linking guards › wires the orphan repair link sets into crawlable hubs` (unrelated to deletions; the file references HeroWrapper only in a comment).
   - `tests/unit/ManagementTableBookingForm.test.tsx` — the booking suite flagged pre-existing in the brief.
   - **Required-to-pass suites both PASS**: `tests/unit/hero-template-regressions.test.ts` → PASS;
     `tests/unit/TestimonialSection.test.tsx` → PASS.
5. Final retired-symbol/class audit:
   - `git grep -l "HeroWrapper|heroVariants|HeroTag|SmartCTAs|PageHeader|ManagersSpecialHero|FloatingActions|StickyMobileBookingCTA|FoodStickyCtaBar|EventStickyBookingCTA" -- app components` → **0**.
   - `git grep "card-warm|inner-frame|btn-friendly|font-merriweather" -- app components lib` → **0**.
   - No surviving source/test file imports any deleted module (verified).

## Notes for follow-up (NOT addressed here — out of scope)
- `audit:hero` baseline failure on `app/page.tsx`: either add HomeHero to the audit's recognised hero
  tags, or exempt the homepage. Pre-existing; unrelated to this cleanup.
- `audit:menu-pages` baseline price-literal failures on food-menu/pizza-menu pages. Pre-existing.
