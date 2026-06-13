# Phase 5, PR 5.4 — Town + Hotel Family Sweep (handoff)

Branch: `codex/redesign-build`. **Uncommitted. No build run.** (per brief)

## Scope completed: 24 pages re-skinned to the light design system

### Town (13)
ashford-pub, bedfont-pub, colnbrook-pub, egham-pub, feltham-pub, horton-pub,
longford-pub, staines-pub, stanwell-pub, sunbury-pub, windsor-pub, wraysbury-pub,
pubs-in-stanwell — all `app/<route>/page.tsx`.

### Hotel (11)
pub-near-{crowne-plaza, hilton, holiday-inn, ibis, marriott, novotel, premier-inn,
radisson-blu, renaissance, sofitel, travelodge}-heathrow — all `app/<route>/page.tsx`.

No page-local `_components` exist for this family (all single-file pages).

## Conversion applied (Phase-5 recipe)
- Heroes already `InteriorHero` — left untouched.
- Legacy dark `<section className="section-spacing* bg-anchor-green-deep|raised|card">`
  → `<section className="py-section-y bg-canvas | bg-surface">` (alternating cream/white).
- `.card-dark` / inline `bg-anchor-green-card border border-anchor-gold-dark/15 rounded-none`
  divs → light `<Card accent>` + `<CardBody className="p-6|p-8">`.
- Shared legacy components replaced inline with light primitives (NOT edited — see flags):
  `<FeatureGrid>` → light `<Card accent>` grids; `<InfoBoxGrid>` → light `<Card accent>` pairs;
  `<AlertBox>` → light `<Card accent>`; `<CTASection variant="green">` → `<CtaBand>`.
- Text: `text-anchor-cream-text[/70]` → `text-ink` / `text-ink-muted`; small gold text & links
  (`text-anchor-gold-bright`, `text-anchor-gold-dark`) → `text-accent-text`; `prose prose-invert`
  → light `prose`; coloured status pills (`bg-purple-500`/`bg-pink-500`) on staines → `<Badge>`.
- Headings → `font-display text-h3/h4 text-ink-strong`. Radii normalised to `rounded-md` (Cards).
- `FAQAccordionWithSchema className="bg-anchor-green-deep"` → `bg-canvas`/`bg-surface`.
- Section headings: `subtitle=` prop folded into `lead=` on `SectionHeading`.
- Journey/area data shown as light cards using existing copy + SSOT values (no invented facts).

## Intentional dark surface kept
- `app/pub-near-hilton-heathrow/page.tsx` "Client Dinner at The Anchor" panel kept as
  `<Card variant="dark" accent className="theme-dark">` (a deliberate dark band on a light
  page, per spec §4.3). This is the only remaining `anchor-gold-bright` / `bg-anchor-green-card`
  usage in the 24 files, and it is correct (dark-card treatment).

## Shared components reused as-is (already migrated upstream)
`InteriorHero`, `CtaBand`, `Card`/`CardBody`, `Badge`, `Button`, `SectionHeading`, `BusinessHours`,
`HeroBadge` (now wraps the new Badge primitive), `BookTableButton`, `DirectionsButton`,
`PhoneButton`, `GoogleReviews`, `OrganicSearchClusterLinks`, `InternalLinkingSection`,
`BreadcrumbJsonLd`, `FAQAccordionWithSchema`. None edited.

## Components FLAGGED for the shared-components sweep (NOT edited — used by other families)
- `components/FeatureCard.tsx` (`FeatureGrid`/`FeatureCard`) — hardcodes
  `text-anchor-gold-bright` + `text-anchor-cream-text/70`; dark-only. Replaced at call sites here.
- `components/AlertBox.tsx` — hardcodes dark container/title/content colours. Replaced at call sites.
- `components/InfoBox.tsx` (`InfoBoxGrid`) — assumed dark-themed; replaced at call sites.
- `components/CTASection.tsx` — superseded by `CtaBand` for closing CTAs.
These remain dark and will mis-render on any not-yet-swept light page; the shared sweep should
re-skin or retire them.

## SEO / A4 preservation (verified)
- `git diff` shows ZERO changes to: `alternates.canonical`, JSON-LD (`@type`/`@context`/`@id`,
  areaServed, servesCuisine, openingHoursSpecification, amenityFeature, nearbyAttractions),
  `generateHowToDirectionsSchema(...)`, `getTwitterMetadata(...)`, openGraph, page titles/descriptions.
- All keyword H1s (InteriorHero `title`), body copy, and internal links preserved (re-skin only).
- British English retained; no em dashes introduced.

## Verification results
1. `npx tsc --noEmit` → 0 errors in the 24 owned files.
   Sibling pre-existing errors (NOT mine, broken imports in private-hire family):
   `app/corporate-christmas-parties/page.tsx` (FeatureGrid/AlertBox/CTASection) — 3 errors.
   (Note: `app/private-hire/christenings/page.tsx` also has the same pre-existing pattern.)
2. Legacy-class audit over the 24 files → 0 hits for
   `section-spacing` / `card-dark` / `card-warm` / `CTASection` / `FeatureGrid` / `InfoBoxGrid` /
   `AlertBox` / `prose-invert` / `bg-anchor-green-deep|raised`.
3. `git diff` → no metadata/JSON-LD content changes.
4. No build run, nothing staged/committed (per brief).

## Notes for owner / follow-up (out of scope here, left as-is per A4)
- Pre-existing copy that conflicts with SSOT was NOT rewritten (re-skin only):
  e.g. `horton-pub` "Sky & TNT Sports" (SSOT = terrestrial only); several hotel/town pages say
  "Sunday roast from £16" (SSOT roast pricing differs). Flag for the §10 copy/voice pass.
- `staines-pub` closing CTA previously rendered an inline `<address>` under the buttons via
  `CTASection` children; `CtaBand` has no footer slot, so that visual address block was dropped
  (address remains in JSON-LD + FAQ). Same for a few hotel CtaBands that had a `footer` string.
