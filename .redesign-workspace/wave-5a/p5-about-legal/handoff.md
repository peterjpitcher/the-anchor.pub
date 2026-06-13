# Phase 5, PR 5.2 — About / Careers / Legal Family Sweep — Handoff

Branch: `codex/redesign-build`. Uncommitted, no build run (per brief).

## Scope completed
Re-skinned 13 pages + 3 page-local `_components` from the legacy dark theme to the
Phase-0 light design system. Heroes were already `InteriorHero` (left untouched).
Bodies converted: legacy dark `Section`/`section-spacing*` → plain
`<section className="py-section-y">` on alternating `bg-canvas`/`bg-surface`
(`bg-surface-sunk` for inset panels); dark inner cards → light `<Card>`/`<Card accent>`;
dark text → `text-ink`/`text-ink-muted`/`text-ink-strong`; small gold text & links →
`text-accent-text` (AA-safe `#8b6914`); ad-hoc gradient CTAs → `<CtaBand>`;
ad-hoc buttons/anchors → `<Button>` (incl. `asChild`); `rounded-lg/2xl` → spec radii
`rounded-md`/`rounded-sm`; `FeatureGrid`/`FeatureCard` (shared dark) usages replaced
inline with light `<Card accent hover>` grids (shared component not in ownership).

## Pages re-skinned (13)
- `app/about/page.tsx` — content page: story prose, "what makes us different" (was FeatureGrid → light cards), "what we do" link-card grid, awards cards, hiring callout, closing `CtaBand`.
- `app/about/the-anchor-facts/page.tsx` — facts page: 3 dark Sections → light; fact dl cards → `bg-surface-sunk`; gold links → accent.
- `app/our-pub/page.tsx` — 5 photo+prose sections alternating cream/surface; image radii `rounded-md`; closing `CtaBand`.
- `app/history/page.tsx` — 9 dark Sections → light; timeline, captioned images (`border-line`), Lal's Prayer `<details>`, "Email Your Stories" anchor → `<Button asChild>`. Closing CTA kept as shared `<CTASection>` (green band).
- `app/reviews/page.tsx` — rating summary → `Card accent`; review highlight grid → light `Card hover`; star empty colour → `text-ink-muted/40`. Closing `<CTASection>` kept.
- `app/sustainability/page.tsx` — content page: BII/tech/community/notice sections → light Cards; 2× FeatureGrid → light card grids; closing `CtaBand`.
- `app/accessibility/page.tsx` — legal/info: step-free cards, toilet/getting-here/call-ahead → light `Card`; closing `CtaBand`.
- `app/safety-and-respect/page.tsx` — prose sections → light alternating; closing `CtaBand` (with preserved `/near-heathrow` footnote link).
- `app/sitemap-page/page.tsx` — directory: section cards → `Card accent`; contact panel → `Card accent`; gold links → accent.
- `app/privacy-policy/page.tsx` — legal = hero + light prose only (`Container size="md"`); title → `text-ink-strong`; ICO link → accent. No AmenityStrip/CtaBand.
- `app/join-our-team/page.tsx` — body sections → light; Billy's-note card → `Card accent`-style; apply/location sections → light. Dark facts band (Phase-2.1 island) left intact.
- `app/join-our-team/bar-staff/page.tsx` & `kitchen-team/page.tsx` — bodies come from `RecruitmentRoleBody` (converted below); hero + dark facts band (Phase-2.1) untouched. No direct edits needed beyond the shared body.

## Page-local `_components` re-skinned (3)
- `_components/RecruitmentSections.tsx` — QuickFactsBox, PayNotice, RoleCards (now light `border-t` accent + hover-lift), BulletListSection, StandardsPledge, LocationTransportSection, RecruitmentImageStrip → all light.
- `_components/RecruitmentRolePage.tsx` — 8 dark body sections → light alternating; "what you can expect" card → light accent. `buildJobPostingSchema` untouched. `RoleHeroFact` left dark (renders in hero).
- `_components/RecruitmentApplicationForm.tsx` — form container → light `Card`-style accent; all inputs/selects/textareas → §4.4 light fields (`border-line-strong`, `bg-surface`, 48px min-height, gold focus ring); checkboxes, file upload, security-check, FormField label/helper, required asterisk → `text-anchor-danger`. Turnstile/honeypot/submit logic untouched.

## Metadata / SEO preserved
`git diff -U0` on all owned files shows **no** changes to `metadata`, `alternates`/canonical,
`openGraph`, JSON-LD (`@type`/`@context`/schema objects), `datePosted`/`dateModified`,
H1s (hero titles), `alt` text, or body copy. Every internal `href` is byte-identical;
only `className` values and element wrappers changed (presentational). The FeatureGrid→Card
swaps moved the same `title`/`description` strings into light Cards verbatim.

## Legacy-class / token audit (owned files) → 0
- `section-spacing*`, `card-dark`, `card-warm`, `inner-frame`, `btn-friendly`: 0 hits.
- Legacy `<Section>` component import/usage: 0 (remaining grep hits are comments and `*Section` identifiers like `BulletListSection`/`sitemapSections`).
- Retired Tailwind tokens (`anchor-gold-light/vivid`, `anchor-bg*`, `shadow-luxury`, `font-merriweather`, `bg-gradient-to-br from-anchor-green`): 0 hits.
- Non-spec radii: 0 (`file:rounded-full` on the CV upload button is a pill = spec `--radius-pill`, allowed).

## Intentional remaining dark classes (NOT errors)
- `CtaBand` footnote `<p className="text-anchor-cream-text/70">` lines — cream text on the green CtaBand (correct).
- `join-our-team` + `bar-staff` + `kitchen-team` `theme-dark bg-anchor-green-deep py-8` facts bands and their `RecruitmentFact`/`RoleFact` helpers — explicitly out of scope (handled in Phase 2.1).
- `RoleHeroFact` gold-bright/cream text — renders inside the dark `InteriorHero`.

## tsc result
`npx tsc --noEmit`: **0 errors in any of the 16 owned files.**
Sibling errors (NOT mine, not touched by this PR): `app/mothers-day/page.tsx` has 8
`Cannot find name 'Section'` errors — that file belongs to the seasonal family (a
separate in-progress workstream); it was already modified in the working tree before this sweep.

## Not done (per brief)
No commit, no `npm run build`, no changes to `docs/architecture/*` or shared components
(`FAQAccordionWithSchema`, `CTASection`, `FeatureGrid`, `Card`, `Button`, etc.).
Note: shared `FAQAccordionWithSchema` and `CTASection` remain internally dark (their own
sweeps); I removed page-level dark `className` overrides passed to `FAQAccordionWithSchema`
so they fall back to the component default rather than forcing extra dark — full light
conversion of those shared components is their own workstream.
