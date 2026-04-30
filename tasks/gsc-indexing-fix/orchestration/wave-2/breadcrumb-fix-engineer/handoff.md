# Breadcrumb Fix Engineer — Handoff

## Files modified
- `components/hero/Breadcrumbs.tsx` (trailing-slash fix)
- 32 `safe-to-edit-remove-bjld` pages (BreadcrumbJsonLd removal + import cleanup)
- 62 `safe-to-edit-remove-inline` pages (inline breadcrumb schema removal + import cleanup)

Total: 95 files modified.

### safe-to-edit-remove-bjld (32 pages)
app/about/page.tsx, app/accessibility/page.tsx, app/bank-holiday-weekends/page.tsx,
app/beer-garden/page.tsx, app/bonfire-night/page.tsx, app/boxing-day/page.tsx,
app/cash-bingo/page.tsx, app/christmas-parties/page.tsx, app/easter/page.tsx,
app/fathers-day/page.tsx, app/food-menu/gluten-free/page.tsx, app/food-menu/page.tsx,
app/food-menu/vegan/page.tsx, app/food-menu/vegetarian/page.tsx, app/halloween/page.tsx,
app/karaoke/page.tsx, app/mothers-day/page.tsx, app/music-bingo/page.tsx,
app/near-heathrow/page.tsx, app/new-years-eve/page.tsx, app/open-mic/page.tsx,
app/our-pub/page.tsx, app/private-hire/baby-showers/page.tsx,
app/private-hire/christenings/page.tsx, app/private-hire/page.tsx,
app/private-hire/wakes/page.tsx, app/quiz-night/page.tsx, app/safety-and-respect/page.tsx,
app/st-patricks-day/page.tsx, app/sustainability/page.tsx, app/valentines-day/page.tsx,
app/whats-on/page.tsx

### safe-to-edit-remove-inline (62 pages, by sub-pattern)

**Pattern A — `<script>` with `JSON.stringify(...)` / `jsonLdSafeStringify(...)` containing `breadcrumbSchema` (57 pages):**
ashford-pub, bedfont-pub, burger-menu, coach-parking-heathrow, colnbrook-pub,
corporate-christmas-parties, corporate-events, dog-friendly-pub-heathrow,
drinks/baby-guinness, drinks/managers-special, drinks/page, egham-pub,
family-friendly-pub-heathrow, feltham-pub, find-us, fish-and-chips-heathrow,
heathrow-family-dining, heathrow-hotels-pub, heathrow-layover-dining, horton-pub,
live-sport/boxing, live-sport/f1, live-sport/page, live-sport/six-nations,
live-sport/world-cup, longford-pub, luggage-storage-heathrow, m25-junction-14-pub,
near-heathrow/terminal-3, near-heathrow/terminal-4, near-heathrow/terminal-5,
pizza-menu, pool-darts-pub, pre-flight-meal, private-hire/engagement-parties,
private-hire/gender-reveal, private-hire/milestone-birthdays,
private-hire/retirement-parties, private-party-venue, pub-garden-heathrow,
pub-near-crowne-plaza-heathrow, pub-near-hilton-heathrow, pub-near-holiday-inn-heathrow,
pub-near-ibis-heathrow, pub-near-marriott-heathrow, pub-near-novotel-heathrow,
pub-near-premier-inn-heathrow, pub-near-radisson-blu-heathrow,
pub-near-renaissance-heathrow, pub-near-sofitel-heathrow, pub-near-travelodge-heathrow,
staines-pub, stanwell-pub, summer-garden-parties, sunbury-pub, windsor-pub, wraysbury-pub

**Pattern B — Object-literal `BreadcrumbList` schema (2 pages):**
app/blog/[slug]/page.tsx, app/heathrow-parking/[terminal]/page.tsx

**Pattern C — Inline `jsonLdSafeStringify(generateBreadcrumbSchema(...))` (1 page):**
app/blog/page.tsx

**Pattern D — `<JsonLd data={[..., breadcrumbSchema]} />` (1 page):**
app/function-room-hire/page.tsx

**Pattern E — `breadcrumbJsonLd` variable + `buildBreadcrumbJsonLd()` helper (1 page):**
app/sunday-lunch/page.tsx

## Edit counts
- safe-to-edit-remove-bjld processed: **32/32**
- safe-to-edit-remove-inline processed: **62/62**
- Pages skipped or deviated from plan: **0**

## Verification results
- `npm run lint` (next lint): **PASS** — no ESLint warnings or errors
- `npm run lint` (audit:hero): **PRE-EXISTING FAILURES** — 24 findings about CTA buttons / image allow-listing. Confirmed by `git stash + audit + git stash pop` that all findings exist on `main` before any breadcrumb edits. The only difference between before/after is line numbers (because we removed lines). **No breadcrumb-related regression.** These hero-audit findings are out of scope for this task.
- `npx tsc --noEmit`: **PASS** — clean
- `rm -rf .next && npm run build`: **PASS** — `Compiled successfully`, 315/315 static pages generated (275 HTML files written to `.next/server/app/`)
- Post-fix duplicate scan: **0 of 275 pages have >1 BreadcrumbList** (saved to `tasks/gsc-indexing-fix/evidence/breadcrumb-duplicates-post-fix.txt`)
  - 268 pages now have exactly 1 BreadcrumbList (the HeroWrapper-emitted one).
  - 7 pages have 0 BreadcrumbLists, all expected: `_not-found.html`, `book-event.html`, `booking-confirmation.html`, `free-parking.html`, `index.html` (homepage), `leave-review.html`, `whats-on/drag-shows.html`. These are either the homepage (no breadcrumb by design) or pages classified `keep-as-is-no-breadcrumb` in the matrix.

## Surprises / deviations
- **None on the matrix's main classifications.** The 5 patterns catalogued by the Breadcrumb Auditor matched exactly what was on disk. The only nuance: 13 pages used `JSON.stringify(breadcrumbSchema)` / `jsonLdSafeStringify(breadcrumbSchema)` as solo arguments (not arrays), and 1 page (`app/drinks/managers-special/page.tsx`) had **two** branches each declaring its own `const breadcrumbSchema`. The edit pipeline detected and removed all decls and references via balanced-bracket parsing.
- All edits were performed via a Python pipeline that walked balanced delimiters (parens / braces / strings) rather than a brittle regex pass. Each file was post-validated by counting remaining `breadcrumbSchema` / `breadcrumbJsonLd` / `BreadcrumbList` / `generateBreadcrumbSchema(...)` / `buildBreadcrumbJsonLd` references and only written when the count was 0. Zero files failed the post-edit assertion.
- `app/reviews/page.tsx` (the sole `keep-as-is-no-hero` row) was left untouched. `git diff app/reviews/page.tsx` is empty.
- `git diff --name-only` shows 98 modified files: the 95 files I edited plus 3 pre-existing modifications on the workspace (`next.config.js`, `tasks/gsc-indexing-fix/REVIEW-PACK.md`, `tasks/gsc-indexing-fix/SPEC.md`). I did not modify those — they were already dirty when I started (visible in the initial git status).

## Trailing-slash fix detail
**File:** `components/hero/Breadcrumbs.tsx` (lines 30-39, around the `breadcrumbSchema` `itemListElement` map).

**Before:**
```ts
"item": item.href ? `https://www.the-anchor.pub${item.href}` : undefined
```
This produced `https://www.the-anchor.pub/` for the home item (with trailing slash), inconsistent with the canonical homepage URL.

**After:**
```ts
"item": item.href === '/'
  ? 'https://www.the-anchor.pub'
  : item.href ? `https://www.the-anchor.pub${item.href}` : undefined
```
Now the home item resolves to `https://www.the-anchor.pub` with no trailing slash, matching the canonical and consistent with how the (now-removed) inline schemas had been emitting it.

## Notes for the orchestrator
- The fix achieves the stated Workstream B3+B4 goal: HeroWrapper-emitted `BreadcrumbList` is now the single source per page across the entire site.
- Post-fix scan confirms 0 duplicates across all 275 built HTML pages — a clean drop from the 231-page baseline.
- The 24 hero-audit findings flagged by `npm run lint` are out of scope here. They predate this task and surface from `scripts/audit-hero.js` as warnings about CTA composition and image allow-listing — not breadcrumbs. The `npm run build` step still completes successfully, so the audit script is non-fatal in CI.
- All `keep-as-is-*` rows were preserved (verified by cross-referencing the matrix with `git diff --name-only`).
- The `breadcrumb-duplicates-post-fix.txt` evidence file is at `tasks/gsc-indexing-fix/evidence/breadcrumb-duplicates-post-fix.txt`.
- Next obvious follow-up: address the 24 hero-audit findings in a separate workstream (out of scope for B3/B4).
