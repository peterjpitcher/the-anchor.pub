# Phase 5 · PR 5.10b — Shared Reviews / SEO / FAQ / Testimonial light re-theme

Branch: `codex/redesign-build`. No commit, no build run (per brief). Classes/markup only — no behaviour, schema, prop, or logic changes.

## Per-component status

| Component | Status | Notes |
|---|---|---|
| `components/reviews/ReviewSection.tsx` | **re-themed** | `section-spacing`→`py-section-y`; bg map → `bg-surface`/`bg-surface-sunk`/`bg-canvas`; title→`text-h2 text-ink-strong`; subtitle→`text-ink-muted`. Removed now-redundant `titleClasses`/`subtitleClasses` maps (all values were identical). |
| `components/reviews/GoogleReviews.tsx` | **re-themed** | Loading skeleton → `bg-surface-sunk border-line rounded-md`; titles → `text-h3 text-ink-strong`; "Read all reviews" link → `text-accent-text`. Fetch logic untouched. |
| `components/reviews/ReviewsCarousel.tsx` | **re-themed** | Prev/next buttons → `bg-surface/90 hover:bg-surface-sunk border-line rounded-md shadow-md text-ink`; active dot keeps `bg-anchor-gold-dark`, inactive → `bg-ink-muted/30`. Autoplay/reduced-motion logic untouched. |
| `components/reviews/ReviewCard.tsx` | **re-themed** | Both variants → `bg-surface border-line shadow-sm`; text → `text-ink`/`text-ink-strong`/`text-ink-muted`; star fill `text-yellow-400`→`text-anchor-gold` (gold retained), empty star→`text-ink-muted/30`; "View on Google" → `text-accent-text`. `font-bold`→`font-semibold` on avatar initial. NOTE: pre-existing empty `<span>` star glyphs left as-is (no behaviour change in remit). |
| `components/reviews/ReviewsBadge.tsx` | **re-themed** | Card → `bg-surface border-line rounded-md shadow-md`; rating number `text-anchor-gold-bright`→`text-accent-text` (gold-dark, correct on light); stars→`text-anchor-gold`; labels→ink tokens; link→`text-accent-text`. `font-bold`→`font-semibold`. |
| `components/TestimonialSection.tsx` | **re-themed** | Already used DS `Card` + `SectionHeading`. Swapped `text-anchor-cream-text/*`→`text-ink`/`text-ink-muted`; stars `text-yellow-400`→`text-anchor-gold`. No structural change. |
| `components/seo/InternalLinkingSection.tsx` | **re-themed** | Section → `bg-surface-sunk border-line`; heading→`text-h3 text-ink-strong`; `<Card>`→`<Card accent hover>` (light, replaces bespoke hover-shadow/translate classes with DS hover); link title→`text-accent-text`; desc→`text-ink-muted`. `commonLinkGroups` data untouched. |
| `components/seo/OrganicSearchClusterLinks.tsx` | **re-themed** (in scope — was dark) | Section→`bg-surface-sunk border-line`; kicker label→`text-accent-text`; heading→`text-h3 text-ink-strong`; intro→`text-ink-muted`; link tiles→`bg-surface border-line rounded-md shadow-sm hover:border-line-strong`; tile heading→`text-accent-text`; desc→`text-ink-muted`. |
| `components/FAQAccordionWithSchema.tsx` | **re-themed per §7.1 step 8** | `section-spacing bg-anchor-green-card`→`py-section-y bg-canvas`; `card-dark` rows replaced with `divide-y divide-line border-y border-line` separator list; question→`font-display text-h4 text-ink-strong` (no bold — DM Serif single-weight); chevron(rotate-180) → **gold `plus` icon (`M12 5v14M5 12h14`) rotating 45°** in `text-anchor-gold-dark`; answer→`text-lg text-ink-muted`. **FAQPage JSON-LD, `trackFaqItemOpened`, `toggleQuestion`/`openIndex` single-open behaviour, `aria-expanded`/`aria-controls`/`aria-hidden`, `renderSchema` prop all unchanged.** |

### Unused — flagged, NOT edited (Phase 6 candidates)
- `components/reviews/HeaderReviewBadge.tsx` — zero real importers. Only re-exported by `components/reviews/index.ts`; no page or component consumes it. Left untouched (still dark: `bg-white/10`). Flag for Phase 6 deletion or re-theme-if-revived.

## TestimonialSection test note (Phase 6 follow-up required)
`tests/unit/TestimonialSection.test.tsx` is **already stale** — it `jest.mock('@/components/SectionHeader', …)` and asserts `data-testid="section-header"`, but `TestimonialSection` was migrated in a prior phase to import `SectionHeading` from `@/components/ui` (which emits no `section-header` testid). This break **pre-dates** my change; I did not alter rendered output to satisfy the old mock (per brief). Phase 6 must update the test to mock `@/components/ui`'s `SectionHeading` and drop the `section-header` assertions. My re-theme touched only colour classes in this file and does not affect the test outcome either way.

## Verification
1. `npx tsc --noEmit` → **clean, 0 errors** (whole project; no Group A/C errors present on this branch state).
2. Residual-dark + old-token audit on the 9 owned files (`anchor-green-deep/raised/card`, `anchor-bg*`, `cream-text`, `prose-invert`, `yellow-400`, `bg-white/1`, `border-white/`, `section-spacing`, `card-dark/warm`, `font-serif`, `font-merriweather`, `anchor-gold-light/vivid/bright`) → **0 hits**. (`HeaderReviewBadge` intentionally excluded — unused, untouched.)
3. FAQ FAQPage JSON-LD output + accordion behaviour confirmed **byte-identical** in logic (schema builder, tracking, state, ARIA all unchanged). Review/Testimonial components emit no JSON-LD (display-only) — nothing to preserve there.

No staging, no commit, no build (per brief).
