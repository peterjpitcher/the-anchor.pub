# Phase 5, PR 5.3 — Seasonal Family Sweep (handoff)

Branch: `codex/redesign-build`. **Uncommitted, no build run** (per brief).

## Scope
Re-skinned the 11 seasonal/occasion pages to the light design system (spec §8 Seasonal row → generic interior recipe; feature splits for the hero dish/offer; CtaBand close). Heroes were already `InteriorHero` and were left untouched. Body only.

## Pages re-skinned (11)
- app/bank-holiday-weekends/page.tsx
- app/bonfire-night/page.tsx
- app/boxing-day/page.tsx
- app/easter/page.tsx
- app/halloween/page.tsx
- app/new-years-eve/page.tsx
- app/st-patricks-day/page.tsx
- app/valentines-day/page.tsx
- app/mothers-day/page.tsx
- app/fathers-day/page.tsx
- app/summer-garden-parties/page.tsx

No page-local `_components` directories exist for these pages.

## Body-conversion recipe applied (per page)
- Legacy dark `<Section background spacing>` → plain `<section className="py-section-y bg-surface | bg-surface-sunk">` + existing `<Container>`. Sections alternate surface tints (white → sunk) per §7 general rules.
- `.section-spacing*` (summer-garden) → `py-section-y`.
- Dark text tokens → ink tokens: `text-anchor-cream-text` → `text-ink-strong` (headings) / `text-ink-muted` (body); inline `font-semibold` highlights → `text-ink`; gold links `text-anchor-gold-dark` → `text-accent-text`; small uppercase labels/bullets → `text-accent-text`.
- Headings: `text-2xl/3xl font-bold` → `text-h3`/`text-h4`/`text-xl` (display face, no bold — single-weight rule).
- Raw dark info boxes (`rounded-2xl bg-anchor-green-raised border ...`) → `<Card accent>` light with `<CardBody>`. Nested dark sub-boxes (`bg-anchor-green-card`) → `bg-surface-sunk` panels inside the light Card.
- `<Card>` light defaults adopted; removed per-CardBody `p-6` (CardBody is already `p-6`).
- Closing CTA `<Section background="gray">` / `<CTASection>` → `<CtaBand title copy primary secondary>` (one per page; `Button asChild`/`BookTableButton`/`PhoneButton` as the lg actions). `fullWidth` dropped on CtaBand actions (band centres them).
- Feature splits: valentines-day & mothers-day poster cards (image + event details) converted to light `<Card accent>` with `bg-surface-sunk` image backdrop; image `object-contain` retained.
- summer-garden: shared dark components `FeatureGrid`/`FeatureCard`/`AlertBox`/`CTASection`/`BusinessHours`/`BookTableButton`/`BRAND` imports removed (were dark-only or unused); package grid + weather policy rebuilt as light `<Card accent>`; "Perfect for…" tiles → light `<Card>`. No content invented.

## Constraints honoured (A4 + SEO)
- Every page H1 (`InteriorHero title`), body copy, `metadata`, `canonical`/`alternates`, JSON-LD and internal links preserved. British English; no em dashes introduced (en dashes in time ranges left as-was; CtaBand `copy` uses "to"/plain text to avoid em dashes).
- JSON-LD `Event` schemas on fathers-day & mothers-day: **zero changes** (verified via `git diff` filtered on schema keys → empty).
- No seasonal content invented; re-skin only.
- `docs/architecture/*` not touched.

## FAQ note (intentional, not legacy)
Each page still passes `className="bg-anchor-green-deep"` (summer-garden: `bg-anchor-green-card`) to the shared `FAQAccordionWithSchema`. That component is dark and owned by another family/phase (it still uses `card-dark`/`section-spacing` internally) — left as the standard dark FAQ band, consistent across all seasonal pages. Not re-themed here.

## Verification
1. `npx tsc --noEmit` → **0 errors across the whole project** (clean; no sibling errors observed).
2. Old-token / legacy-class audit on the 11 files → **0** hits for `card-dark` / `card-warm` / `section-spacing` / `inner-frame` / `btn-friendly`, no legacy `<Section>` usage (only `<SectionHeading>`), and no `anchor-cream-text` / `text-anchor-gold-bright` / `bg-anchor-green-*` in body content (the only `bg-anchor-green-*` remaining are the FAQ-component props noted above).
3. `git diff` shows no metadata/JSON-LD content changes; all H1s unchanged; exactly one `<CtaBand>` per page.

## Not done (per brief)
- No `git add` / commit. No `npm run build`. No lint run (tsc only, per Verify step).
