# Phase 1.2 — Badge + Card — Handoff

Branch: `codex/redesign-build`

## Summary
- **Badge** reduced to exactly 6 variants (`green | gold | sand | outline | success | danger`), single size (size prop removed), optional `dot` kept. Spec §4.2 styling: pill, Outfit 600, `text-xs`, padding `0.4em 0.85em`, line-height 1, no-wrap. Dark-theme `success` override via `[.theme-dark_&]:` arbitrary variant.
- **Card** rewritten to `variant: 'light' | 'dark'` (default light) + `accent?` (gold top rule) + `hover?` (lift). Old `variant` (default/outlined/elevated) and `padding` props removed. `CardBody` padding is now `p-6` (spec §4.3). CardHeader/CardTitle/CardBody/CardFooter kept; their hardcoded `anchor-gold-dark` borders re-tokenised to `border-line`. CardTitle uses `text-xl text-ink-strong` (see note below).

## Files changed
**Components**
- `components/ui/primitives/Badge.tsx` — rewritten (6 variants, no size).
- `components/ui/layout/Card.tsx` — rewritten (light/dark/accent/hover, CardBody p-6, tokenised sub-component borders).
- `components/HeroBadge.tsx` — trust badges `primary→green`, `outline` kept, size removed; ItemBadge variant map remapped (`new→danger`, `featured→gold`, `special→success`, `limited→green`).
- `components/TestimonialSection.tsx` — `padding={compact?'sm':'md'}` → `className={compact?'p-4':'p-6'}` (no CardBody, direct children).
- `components/GalleryImage.tsx` — `.card-warm` class → equivalent Tailwind (`rounded-md` + hover lift).
- `components/features/MenuDisplay.tsx` — dynamic `variant={isFocused?'outlined':'elevated'}` removed (focus ring className already provided the cue).
- `components/features/EventBooking/ManagementEventBookingForm.tsx` — `variant="elevated" padding={compact?'none':undefined}` dropped (CardBody controls padding).
- `components/features/Gallery.tsx`, `components/features/BlogPost.tsx`, `components/features/CareersForm.tsx`, `components/features/TableBooking/{AvailabilityChecker,BookingConfirmation,CustomerDetails,TableBookingForm,ManagementTableBookingForm}.tsx` — old Card `variant`/`padding` props stripped (now light cards; existing className overrides preserve dark-on-dark surfaces).
- `components/seo/InternalLinkingSection.tsx` — (no Card variant change required; listed for awareness).

**Pages** (Badge/Card codemod)
- `app/page.tsx` — 5 inline amenity pills (`border-white/25 bg-white/10` spans) → `<Badge variant="sand">`; 3 FeatureGrid `card-warm` className strings → Card-accent-hover Tailwind utilities; Card `variant="default"` stripped; `Badge` added to `@/components/ui` import.
- `app/about/page.tsx`, `app/whats-on/page.tsx`, `app/blog/page.tsx`, `app/events/[id]/page.tsx`, `app/reviews/page.tsx`, and the seasonal pages (`bank-holiday-weekends`, `bonfire-night`, `boxing-day`, `easter`, `fathers-day`, `halloween`, `mothers-day`, `new-years-eve`, `st-patricks-day`, `valentines-day`), `app/drinks/baby-guinness/page.tsx` — Badge variant codemod + Card `variant`/`padding` strip.

**Tests**
- `components/ui/layout/__tests__/Card.test.tsx` — rewritten to new API (light default, dark, accent light/dark, hover, p-6 body, tokenised borders).
- `components/ui/primitives/__tests__/Badge.test.tsx` — NEW: 6 variants, default green, pill/Outfit/xs, dot before label, custom className.

## Codemod counts
- **Badge variant codemod:** 43 `default|primary` → `green`; `secondary`/`warning`/`error` → none present as Badge variants in tree (0); `sand`/`outline`/`success` unchanged. All `size=` props removed from Badge (was ~50 occurrences). HeroBadge ItemBadge map remapped (4 keys). `secondary→sand` codemod rule applied but 0 hits.
- **Inline pills replaced:** 5 (all in `app/page.tsx`).
- **HeroTag replaced:** 0 — no `<HeroTag>` JSX usages exist in app/components (only the component file + hero index/variants/wrapper, all Phase-6 deletions, left untouched).
- **HeroBadge:** component retained; its internal Badge usages migrated (trust badges + ItemBadge map). No standalone `<HeroBadge>`-to-Badge swap was in scope (HeroBadge stays until Phase 6).
- **`.tag` class:** 0 usages in app/components (CSS def kept in globals.css for Phase 6).
- **Card old `variant`/`padding` props removed:** all `<Card>` call sites (44 files). No `<Card>` retains `variant="default|outlined|elevated"` or `padding=`.
- **`.card-warm` replaced:** 4 sites (3 FeatureGrid features in `app/page.tsx`, 1 `GalleryImage.tsx`) → Card-equivalent utilities. globals.css `.card-warm` definition KEPT (Phase 6 deletes).
- **`.card-dark` left for Phase 5:** 220 raw class usages across the tree (unchanged, per brief).

## Verification (verbatim)
```
# Old-token audit (expect 0):
$ rg "anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather" app components lib tests
0 hits

# Card old API (expect 0):
$ rg 'padding="(none|sm|md|lg)"' app components   # (excluding Container/Section/tests) -> 0 on <Card>
$ rg '<Card ... variant="(default|outlined|elevated)"' app components -> 0

$ npx tsc --noEmit
(clean)

$ npm run lint:next
✔ No ESLint warnings or errors

$ npx jest Badge Card
Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total

$ npx jest   (full suite)
Test Suites: 1 failed, 84 passed, 85 total
Tests:       31 failed, 1 skipped, 697 passed, 729 total
# Only failing suite: tests/unit/ManagementTableBookingForm.test.tsx — pre-existing,
# booking-availability waitFor failures, unrelated to Badge/Card (brief notes ~30 on main).
```

## Notes for 1.3 (Input + SectionHeading)
- **twMerge gotcha:** the project's `cn()` uses vanilla `tailwind-merge` with no custom config. Custom font-size utilities (`text-h1`..`text-h4`, `text-display`, `text-script`) are NOT registered, so twMerge treats them as text-color/size and DROPS them when combined with another `text-*` class via `cn()`. CardTitle therefore uses `text-xl` (a stock size) rather than `text-h4`. 1.3 (SectionHeading) must either avoid passing `text-h2`/`text-script` through `cn()` alongside other `text-*` utilities, apply them via a non-merged className path, or extend tailwind-merge config. This will bite SectionHeading hard (it stacks kicker/script/title/lead sizes).
- Badge `success`/`danger` use arbitrary-opacity bg (`bg-anchor-success/[0.12]`) which survives `cn()` fine.
- `app/page.tsx` and `components/HeroBadge.tsx` also contain pre-existing (uncommitted) Phase 1.1 Button call-site codemod changes that were in the working tree before this task — see commit note.

## Self-check
- [x] Badge = 6 variants, no size prop; Alert/AlertBox untouched (no `<Alert>`/`<AlertBox>` edited).
- [x] Card = light/dark + accent + hover; no `padding`/`default|outlined|elevated` on any `<Card>`.
- [x] `.card-warm` → Card-equivalent; raw `.card-dark` left for Phase 5; globals.css classes kept.
- [x] audits 0; tsc clean; lint clean; Badge/Card tests green.
