# Phase 5, PR 5.6 — Private Hire family light re-skin — Handoff

Branch: `codex/redesign-build`. **Uncommitted. No build run.** Re-skin only; no metadata/JSON-LD/H1/copy/route changes.

## Pages re-skinned (16 routes, all owned `/page.tsx` + page-local components)

Occasion subpages: `private-hire/baby-showers`, `christenings`, `engagement-parties`, `gender-reveal`, `milestone-birthdays`, `retirement-parties`, `wakes`, and `private-hire/near/[slug]`.
Top-level: `function-room-hire`, `corporate-events`, `private-party-venue`, `christmas-parties` (body in `client-components.tsx`; hero CTAs in `christmas-hero-ctas.tsx` already valid, untouched logic), `corporate-christmas-parties`.

`christmas-parties/page.tsx` needed no edits (hero + body delegation already migrated in batch 1); only its `client-components.tsx` body was converted.

## Conversion applied (per RECIPE.md)
- Legacy dark `Section`/`<section bg-anchor-green-*>` → `<section className="py-section-y bg-canvas|bg-surface|bg-surface-sunk">` alternating; `border-anchor-gold-dark/15` dividers dropped. `section-spacing*` → `py-section-y`.
- Dark text → `text-ink-strong`/`text-ink-muted`; small gold text/links → `text-accent-text`; raw boxes/`card-dark` → light `<Card>`/`<Card accent>` + `<CardBody>`.
- Shared dark-themed components removed from these light pages and rebuilt with light primitives: `FeatureGrid`, `InfoBoxGrid`, `QuickInfoGrid`, `AlertBox`, `CateringPackagesTable`, `CTASection`. (Not edited — they remain for other families.)
- Closing CTAs → `<CtaBand>` (multi-button CTAs use CtaBand `children`; the trailing info note kept as a cream line in the dark band).
- Inline pills → `<Badge>`; `HeroBadge` retained on function-room-hire (it already wraps the light Badge primitive — theme-agnostic).
- Step-number circles: `bg-anchor-gold-bright text-anchor-dark` → `bg-anchor-gold-dark text-white` (AA).
- gender-reveal boy/girl accents `text-pink-400`/`text-blue-400` → `text-pink-600`/`text-blue-600` (contrast on light).

## Catering source
All catering-package blocks now render `CateringPackagesCard` from `app/private-hire/_components/CateringPackagesCard` (verified SSOT §11 list). The page-local subset `filterNames` props (engagement/baby-shower/christening/wakes) were dropped in favour of the full SSOT list. **christmas-parties & corporate-christmas-parties keep their page-specific FESTIVE prices** (£36.95 Tue–Thu / £39.95 Fri–Sat / kids £12.95–£15.95 / buffet £10.95pp 26+) verbatim — these are NOT SSOT §11 buffet packages and were preserved as-is. Capacity wording "10 to 50 guests"; no "10 to 80" anywhere. Deposit copy unchanged.

## near/[slug] handling
Generic interior recipe driven by existing `lib/local-seo-data` (`getLandmarkBySlug`/`landmarks`). Hero/data logic untouched; why-choose + packages rebuilt as light Cards; map section kept (`GoogleMapEmbed`); closing CTA → `CtaBand` (removed the `bg-white/10`/`bg-anchor-gold-dark` button colour overrides — variants own colours now).

## christmas-parties/client-components.tsx (1987 lines, interactive)
Global className token-flip (270+ occurrences) + 16 `<Section background="white|gray">` switched to `background="transparent"` with explicit `bg-surface`/`bg-surface-sunk` (the shared `Section` component still maps white→dark, so transparent+explicit light class was required without editing the shared component). Enquiry-form, sticky-bar and lightbox raw `<input>/<select>/<textarea>` restyled to the §4.4 field look (`border-line-strong`, `rounded-sm`, gold-dark focus ring) — **no form logic, state, tracking ids, or event wiring changed**. Festive red accents (red-600 icons, red-700/red-100 badges, red mode-toggles, red promo bar) kept as intentional Christmas styling on the new light surfaces.

## Verification
1. `npx tsc --noEmit` → **clean for all owned files.** 2 pre-existing SIBLING errors only: `app/near-heathrow/terminal-3/page.tsx` and `terminal-4/page.tsx` ("Cannot find name 'CtaBand'") — Find Us family, not in this batch.
2. Old-token / legacy-class audit on all 16 owned files → **0 hits** (`section-spacing|card-dark|card-warm|inner-frame|btn-friendly|text-anchor-cream-text|text-anchor-gold-bright|text-anchor-gold-light|bg-anchor-green-*|font-serif|prose-invert|CateringPackagesTable|FeatureGrid|InfoBoxGrid|QuickInfoGrid|AlertBox|CTASection|Section background=`).
3. `git diff` shows **no** changes to metadata, canonical, JSON-LD literals, faqs arrays, InteriorHero `title`, or internal-link hrefs/titles. Any catering prices shown = SSOT §11 (via CateringPackagesCard) or page-specific festive prices preserved verbatim.

## Flagged for owner (not fixed — out of re-skin scope, A4)
- `private-hire/christenings`: existing copy states "Baby changing facilities are available on site" / a "Baby Changing" feature card. This **contradicts SSOT §8 (baby changing: verified NO)**. Preserved verbatim per A4 (re-skin only); recommend a separate copy-fix task.

## Shared components flagged
- `components/ui/layout/Section.tsx` still maps `background="white"`→`bg-anchor-green-card` (dark). Phase 6 candidate. Worked around (transparent + explicit light class) rather than edited (used by other families).
- `FeatureGrid`/`InfoBoxGrid`/`QuickInfoGrid`/`CateringPackagesTable`/`AlertBox`/`CTASection` still render dark; no longer used by this family but live elsewhere — leave for their owning families / Phase 6.
