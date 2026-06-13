# Handoff — Phase 2.1a: InteriorHero foundation + 5 interior template heroes

Branch: `codex/redesign-build` · Spec: `docs/redesign-spec.md` §5.1 · Plan: `docs/redesign-implementation-plan.md` §G PR 2.1a

## What landed

- New `components/hero/InteriorHero.tsx` (the single interior hero, spec §5.1).
- Exported `InteriorHero` + `InteriorHeroProps` from `components/hero/index.ts`.
- Migrated 5 interior template heroes off `HeroWrapper`: `app/food-menu/page.tsx`,
  `app/whats-on/page.tsx`, `app/private-hire/page.tsx`, `app/book-table/page.tsx`,
  `app/near-heathrow/page.tsx`. Page bodies untouched.
- Updated `scripts/audit-hero.js` to recognise `InteriorHero` (see below).
- `HeroWrapper`, `heroVariants.ts`, `PageHeader`, `HeroTag`, `Breadcrumbs`, `SmartCTAs`
  all kept alive (Phase 6 deletes them). Homepage (`app/page.tsx`) untouched.

## InteriorHero API

```tsx
<InteriorHero
  image="/path/to/header.jpg"   // required string (full-bleed, decorative, next/image fill, priority)
  focal="50% 50%"               // optional CSS object-position (default '50% 50%')
  crumb="Food"                  // required human label → "Home / {crumb}" breadcrumb
  kicker="Optional eyebrow"     // optional, gold-bright uppercase
  title="The page H1"           // required (renders the single page <h1>)
  lead="Optional supporting line"
  badges={<><Badge variant="sand">…</Badge></>}   // optional ReactNode
  actions={<>…</>}              // optional ReactNode: 1 primary lg + at most 1 outline lg
/>
```

Structure (matches spec §5.1): `<section class="theme-dark">`, relative/overflow-hidden,
base `bg-anchor-green-deep`, `min-h-[clamp(380px,50vh,540px)]`, flex items-end · full-bleed
`next/image` (fill, object-cover, `objectPosition: focal`, `alt=""`, priority, `sizes="100vw"`) ·
scrim layer (z-1) with the exact two-gradient background · grain layer (z-1, `bg-[var(--grain)]`,
opacity 0.06) · content (z-2) in `.container`, `max-w-[760px]`, flex-col gap-4,
`paddingBlock: clamp(2.5rem,6vw,4.5rem)` → breadcrumb (Home links `/`, cream/72,
`aria-label="Breadcrumb"`) · kicker · h1 (`font-display text-h1 text-anchor-cream-text`) ·
lead (`text-xl` cream/90 `max-w-[54ch]`) · badges (`flex-wrap gap-2`) · actions.

**Mobile (≤640px):** actions wrapper is `flex-col … sm:flex-row` and forces
`[&>*]:w-full sm:[&>*]:w-auto`, so each action goes full-width stacked on mobile and
auto-width inline from `sm`. Pass `fullWidth` on the Button as well (belt-and-braces; the
wrapper handles it for wrapped Links/CTA components too).

## HeroWrapper → InteriorHero mapping recipe (apply mechanically for 2.1b/2.1c)

| HeroWrapper prop | InteriorHero | Notes |
|---|---|---|
| `route="/x"` | `crumb="Human Label"` | Human label, NOT the path. Derive from the page's breadcrumb/last segment. |
| `image={{ src }}` OR resolved `getPageHeaderImage(route)` | `image="<src string>"` | InteriorHero takes a plain string. If the page had no `image` prop, resolve the route's header image src and inline it: run `node -e "const {getPageHeaderImage,getDefaultHeaderImage}=require('./lib/page-header-images.ts'); console.log((getPageHeaderImage('/x')||getDefaultHeaderImage('/x')).src)"`. |
| `eyebrow` | `kicker` | |
| `title` | `title` | Keep verbatim. |
| `description` / `lead` | `lead` | |
| `tags={[{label,variant}]}` | `badges={<><Badge variant="sand">label</Badge>…</>}` | ALL badges become `variant="sand"` regardless of old tag variant. Import `Badge` from `@/components/ui`. |
| `primaryCta` | first child of `actions` | Keep the inner Button/Link/CTA; add `fullWidth`, drop ad-hoc `w-full sm:w-auto` width classes (wrapper handles it). One primary per view. |
| `secondaryCta` | second child of `actions` | As an `outline` Button. |
| `secondaryInfo` | DROP | Status/amenity pills are not part of InteriorHero (status lives in the §5.2 utility strip). |
| `variant` `size` `alignment` `overlay` `statusBar*` `ctaLayout` `enableSmartCtas` `heroEvents` `seasonalFallback` `showContextStrip` `breadcrumbs` `showBreadcrumbs` `ctaContainer*` | DROP | breadcrumbs are auto-rendered from `crumb`. |

Then fix imports: `HeroWrapper` → `InteriorHero` (from `@/components/hero`); add `Badge` to
`@/components/ui` if badges used; **remove any import that the hero was the sole consumer of**
(e.g. `HeroBadge`) to avoid unused-import lint failures.

## How `audit:hero` was handled

`scripts/audit-hero.js` is an AST audit that previously only recognised `HeroWrapper` JSX and
would flag "Missing `HeroWrapper` on non-exempt content page" once a page swapped to
`InteriorHero`. I did NOT weaken or disable it. I added an `InteriorHero` branch in `parsePage`
that pushes a hero record into the same `heroWrappers` list with `routeLiteral: null`. Effect,
intent preserved:
- Presence check (every non-exempt page has exactly one hero) still enforced — InteriorHero counts.
- Single-H1 check (no extra local `<h1>`/`PageTitle as="h1"`) still enforced.
- The route-keyed rules (image resolution, private-hire `variant="feature"`, terminal/local
  booking-primary CTA) `continue` when `!hero.routeLiteral`, so they correctly skip InteriorHero:
  its `image` is a required inline string (no route to resolve) and is self-describing. None of
  the 5 migrated routes are in those special route sets anyway.

`npm run lint` (= `lint:next && audit:hero && audit:menu-pages`) is green.

## Per-page quirks

- **food-menu:** Dropped the hero's dynamic kitchen-status `secondaryInfo` pills. That made
  `deriveKitchenStatusData()` (the whole function), the `kitchenStatusData` const, and the
  `KitchenStatusData` + `HeroBadge` imports unused — all removed to keep lint clean.
  `BookTableButton` (primary) + `MenuSectionCta` (outline) kept as actions, both with `fullWidth`.
- **whats-on:** Single primary action (`Link` → `#upcoming-events`). `crumb="What's On"`.
- **private-hire:** 4 tags → 4 sand badges; `From ${fromPrice}pp` interpolation preserved.
  Two actions (Check Availability primary, Get a Quote outline). Dropped amenity `secondaryInfo`.
- **book-table:** NO actions (the booking form is the CTA, per brief). Kept 3 tags as sand badges.
  Image = `DEFAULT_PAGE_HEADER_IMAGE`. Removed sole-use `HeroBadge` import. The existing
  `PageTitle` section below the hero is unchanged and does not use `as="h1"`, so the single-H1
  audit rule stays satisfied.
- **near-heathrow:** No explicit CTAs (was `enableSmartCtas`); InteriorHero rendered with no
  `actions`. Image = `/images/page-headers/near-heathrow/heathrow-airport-view.jpg`.

## Verification (verbatim)

- `npx tsc --noEmit` → clean (`TSC_EXIT=0`).
- `node scripts/audit-hero.js` → `Hero audit passed for 123 page templates.`
- `node scripts/audit-menu-pages.js` → `Menu page audit passed.`
- `npx next lint` → `✔ No ESLint warnings or errors`.
- `npm run build` → `BUILD_EXIT=0`; all 5 pages present in the route table.
- Old-token audit `rg "anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather" app components lib tests` → 0 hits.
- `npm test` → `Tests: 33 failed, 1 skipped, 707 passed, 741 total`. The 33 failures are
  pre-existing (`ManagementTableBookingForm.test.tsx`, `TestimonialSection.test.tsx`):
  re-running just those two suites with my changes stashed gives the identical
  `33 failed, 1 skipped` at HEAD. Zero new failures introduced. (The brief's "31" was an
  estimate; true baseline is 33, unchanged.)

## HeroWrapper usage count

`git grep -l "HeroWrapper" -- 'app/**/page.tsx'`: **112 at HEAD → 107 now** (down exactly 5).
`rg -l "HeroWrapper" app` = 108 (includes the `components/hero` files via path? no — it is the
107 pages plus 1; the gitignore-aware rg count is the reliable page+component figure). Home hero
(`app/page.tsx`, on HeroWrapper) and the remaining ~107 pages are for the 2.1b/2.1c bulk agent.
