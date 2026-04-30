# Breadcrumb Auditor — Handoff

## Outputs
- tasks/gsc-indexing-fix/evidence/breadcrumb-matrix.csv
- tasks/gsc-indexing-fix/evidence/breadcrumb-duplicates-baseline.txt

## Matrix summary
- Total pages: 118 (`find app -name "page.tsx" -not -path "*backup*" | wc -l` -> 118; CSV has header + 118 data rows)
- Classification breakdown:
  - safe-to-edit-remove-bjld: 32
  - safe-to-edit-remove-inline: 62
  - keep-as-is-no-hero: 1
  - keep-as-is-hero-only: 14
  - keep-as-is-no-breadcrumb: 9
- No pages had ALL three sources (HeroWrapper + BreadcrumbJsonLd + inline). The `notes` column is empty for every row.

## Duplicate baseline
- Pages with > 1 BreadcrumbList in built HTML: **231** (out of 275 built HTML files). Every duplicate page emits exactly 2x.
- Sample listing (first 10):
  ```
  2x about.html
  2x accessibility.html
  2x ashford-pub.html
  2x bank-holiday-weekends.html
  2x bedfont-pub.html
  2x blog/25-off-kraken-rum-this-june-manager-s-special.html
  2x blog/30th-birthday-party-ideas-venues.html
  2x blog/40th-birthday-party-ideas-venues.html
  2x blog/5-star-food-rating.html
  2x blog/50th-birthday-party-ideas-venues.html
  ```
- The duplicates baseline file count (231) > the total `safe-to-edit-*` source pages (94) because `app/blog/[slug]/page.tsx` is a single source file that compiles to ~140 static blog posts (each duplicated). Same for `app/heathrow-parking/[terminal]/page.tsx`. This matches expectations.

## Cross-validation results

### safe-to-edit-* spot-checks (should appear in duplicates baseline)
- app/about/page.tsx -> about.html: **confirmed**
- app/accessibility/page.tsx -> accessibility.html: **confirmed**
- app/bank-holiday-weekends/page.tsx -> bank-holiday-weekends.html: **confirmed**
- app/ashford-pub/page.tsx -> ashford-pub.html: **confirmed**
- app/bedfont-pub/page.tsx -> bedfont-pub.html: **confirmed**
- app/burger-menu/page.tsx -> burger-menu.html: **confirmed**
- (Bonus) app/blog/[slug]/page.tsx -> blog/best-sunday-roast-surrey.html: **confirmed**

### keep-as-is-no-breadcrumb spot-checks (should NOT appear)
- app/book-event/page.tsx -> book-event.html: **confirmed (absent)**
- app/booking-confirmation/page.tsx -> booking-confirmation.html: **confirmed (absent)**
- app/free-parking/page.tsx -> free-parking.html: **confirmed (absent)**

### keep-as-is-hero-only sanity check (should have exactly 1 BreadcrumbList)
All keep-as-is-hero-only pages with built static HTML show exactly count=1:
- blog/tags.html, heathrow-parking.html, live-music.html, near-heathrow/terminal-2.html,
  privacy-policy.html, sitemap-page.html — all count=1
- 4 pages had no compiled HTML (book-table, plane-spotting-heathrow, pubs-in-stanwell, restaurants-near-heathrow) — these likely render at request time rather than statically.

## Issues encountered
- **The simple `breadcrumbSchema` substring grep over-matched**: 58 pages reference `breadcrumbSchema` as a variable but the matrix needed to confirm the variable was actually emitted into the page's HTML. The final detector handles three emission patterns:
  1. `<JsonLd data={[..., breadcrumbSchema]} />` — used by every "*-pub" location page (e.g. ashford-pub) and "private-hire/*" sub-pages.
  2. `dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}` and the array form `JSON.stringify([..., breadcrumbSchema])`.
  3. `jsonLdSafeStringify(generateBreadcrumbSchema([...]))` and `jsonLdSafeStringify(breadcrumbJsonLd)` (variant variable name in `app/sunday-lunch/page.tsx`).
  The fix engineer should expect to encounter all three patterns when removing inline schema.
- **`app/page.tsx` (homepage) was correctly classified `keep-as-is-hero-only`**: it never breadcrumbs at the homepage level — the HeroWrapper produces no breadcrumb trail for `/` (its `generateBreadcrumbsFromRoute` returns `[]` for the root). Verified manually: zero `<BreadcrumbJsonLd>`, zero `generateBreadcrumbSchema(`. The HeroWrapper's `Breadcrumbs` component still renders, but with `breadcrumbItems.length === 0` it short-circuits — not a duplicate concern.
- **`app/reviews/page.tsx`** is the sole `keep-as-is-no-hero` row: it imports `BreadcrumbJsonLd` directly without a HeroWrapper. The Fix Engineer must NOT touch this page; deleting the BJLD usage would leave it with zero breadcrumb schema.
- **Blog index `app/blog/page.tsx`** (classified `safe-to-edit-remove-inline`) had no built HTML so it could not be cross-validated against the rendered baseline. Source confirms the emission via `jsonLdSafeStringify(generateBreadcrumbSchema([...]))` inline inside a `<script>` tag, plus a HeroWrapper — so the duplication does exist in production, just not in the build artifact.

## Notes for the Breadcrumb Fix Engineer (downstream agent)

### Workflow per row
1. **`safe-to-edit-remove-bjld` (32 pages)** — Remove the `<BreadcrumbJsonLd items={...} />` JSX element. Then check whether the `BreadcrumbJsonLd` import is still used; if not, remove the import line. Do **not** touch HeroWrapper or any other schema. Ensure no other JSX expects `BreadcrumbJsonLd`.

2. **`safe-to-edit-remove-inline` (62 pages)** — Patterns vary:
   - **`<JsonLd data={[..., breadcrumbSchema, ...]} />` pattern** (most location/private-hire pages): remove `breadcrumbSchema` from the data array. If the array becomes a single element, leave it as a single-element array (the `JsonLd` component handles either). Then delete the `const breadcrumbSchema = generateBreadcrumbSchema(...)` declaration. Remove `generateBreadcrumbSchema` from the import line if it's no longer used.
   - **`JSON.stringify(breadcrumbSchema)` or `JSON.stringify([..., breadcrumbSchema])` pattern** (e.g. `app/find-us/page.tsx`, `app/corporate-events/page.tsx`): remove the entire `<script>` if it only stringifies `breadcrumbSchema`; otherwise drop `breadcrumbSchema` from the array.
   - **`jsonLdSafeStringify(generateBreadcrumbSchema([...]))` inline pattern** (e.g. `app/blog/page.tsx`): remove the entire `<script type="application/ld+json" dangerouslySetInnerHTML={{...}}/>` JSX block.
   - **`app/sunday-lunch/page.tsx` special case**: the variable is named `breadcrumbJsonLd` (and built by a `buildBreadcrumbJsonLd()` helper). Remove the `<script>` emission, the `const breadcrumbJsonLd = ...` line, and the `buildBreadcrumbJsonLd()` helper.
   - **`app/blog/[slug]/page.tsx` and `app/heathrow-parking/[terminal]/page.tsx`** — these have a literal `"@type": "BreadcrumbList"` object in their schema arrays. Remove the literal entry from the schema array(s).
   - After every edit, confirm the import line for `generateBreadcrumbSchema` is still needed; remove if orphaned.

3. **`keep-as-is-*` rows (24 pages)** — DO NOT modify. Skipping these is the safety guarantee.

### Trailing-slash fix in `components/hero/Breadcrumbs.tsx`
- Lines 30-39 build the schema. The home `item.href = '/'` produces id `https://www.the-anchor.pub/` (with trailing slash). The blog inline schemas use `https://www.the-anchor.pub` (no slash). After the inline schemas are removed, the only remaining HeroWrapper-emitted home id is `https://www.the-anchor.pub/`.
- The consultant's preference: home id should equal the canonical homepage URL with NO trailing slash (Google's canonical). Suggested patch: in the `itemListElement` map, special-case the home item:
  ```ts
  "item": item.href === '/'
    ? 'https://www.the-anchor.pub'
    : item.href ? `https://www.the-anchor.pub${item.href}` : undefined
  ```
- Apply this trailing-slash fix in the same Fix Engineer wave so the surviving HeroWrapper-emitted schemas are consistent with the rest of the JSON-LD across the site.

### Verification after edits
- After all edits, run a fresh `rm -rf .next && npm run build` and re-scan the rendered HTML. Every page in the matrix marked `safe-to-edit-*` should drop from count=2 to count=1. Every `keep-as-is-*` page should retain its previous count. The `breadcrumb-duplicates-baseline.txt` file should become empty (or only contain rows you intentionally chose to leave as legitimate duplicates — there shouldn't be any).
