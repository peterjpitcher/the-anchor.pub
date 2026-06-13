# Handoff — Phase 2.1b: Bulk Hero Migration (Batch 2)

Branch: `codex/redesign-build` · Recipe: `.redesign-workspace/wave-2/p2-interiorhero-foundation/handoff.md` · Spec §5.1
**No commit, no `npm run build` run** (per brief). All edits left unstaged in the working tree.

## Result

- **59 of 62 owned pages migrated** `HeroWrapper` → `InteriorHero`.
- **3 owned pages intentionally left on `HeroWrapper`** (flagged below — need a shared-component decision).
- `npx tsc --noEmit`: clean for all my files. Only remaining errors trace to the **sibling batch** file `app/sunday-lunch/page.tsx` (not mine) — see "Sibling-batch note".
- `npx next lint`: my files produce **zero** errors/warnings. The single lint error is again `app/sunday-lunch/page.tsx` (sibling).
- `node scripts/audit-hero.js`: **passed** (123 templates) — presence + single-H1 rules hold.
- Old-token audit (`anchor-gold-light|gold-vivid|warm-white|text-on-*|bg|bg-raised|bg-card|shadow-luxury*|font-serif|font-merriweather`) on my files: **0 hits**.

## Pages migrated (59)

Find Us / Heathrow audience (17): find-us, near-heathrow/terminal-2..5, plane-spotting-heathrow, dog-friendly-pub-heathrow, family-friendly-pub-heathrow, heathrow-family-dining, heathrow-hotels-pub, heathrow-layover-dining, luggage-storage-heathrow, pre-flight-meal, restaurants-near-heathrow, pub-garden-heathrow, beer-garden, pool-darts-pub, m25-junction-14-pub
Town (13): ashford, bedfont, colnbrook, egham, feltham, horton, longford, staines, stanwell, sunbury, windsor, wraysbury -pub, pubs-in-stanwell
Hotel (11): pub-near-{crowne-plaza,hilton,holiday-inn,ibis,marriott,novotel,premier-inn,radisson-blu,renaissance,sofitel,travelodge}-heathrow
Parking (3): heathrow-parking, heathrow-parking/[terminal], coach-parking-heathrow
Blog (4): blog, blog/[slug], blog/tag/[tag], blog/tags
About/legal (11): about, about/the-anchor-facts, our-pub, history, reviews, sustainability, accessibility, safety-and-respect, sitemap-page, privacy-policy  (+ find-us counted above)

## Left on HeroWrapper — needs shared-component decision (3)

- `app/join-our-team/page.tsx`
- `app/join-our-team/bar-staff/page.tsx`
- `app/join-our-team/kitchen-team/page.tsx`

**Why:** these use `variant="feature" size="large"` heroes whose `lead` prop embeds a structured **HeroFact / RoleHeroFact label→value facts grid** (Pay, Hours, Location, Parking, etc.) plus the two action buttons, all inside one `lead` JSX block. `InteriorHero.lead` is a plain string and `badges` are simple `<Badge variant="sand">` pills — neither maps the label/value facts grid without losing it or introducing a shared-component change (e.g. a `facts`/`meta` slot on InteriorHero, or a §5.2-style utility strip). Per the brief ("if a page needs a shared-component change, DO NOT make it — flag it and leave that page on HeroWrapper") these three are deferred. Recommend either adding a small facts/meta slot to InteriorHero or relocating the facts grid into the page body, then migrating.

## Recipe application notes / per-page quirks

- **`enableSmartCtas` pages → no `actions`.** The majority of audience/hotel/legal pages used `enableSmartCtas` with no explicit CTA; per recipe `enableSmartCtas` is dropped, so they render with image+crumb+title+lead only.
- **Crumbs (human labels):** single-segment pages use their own label (e.g. "Find Us", "Beer Garden", "Reviews"); near-heathrow/terminal-* and heathrow-layover-dining use `crumb="Near Heathrow"`; blog/[slug], blog/tag/[tag], blog/tags use `crumb="Blog"`; heathrow-parking/[terminal] uses `crumb="Heathrow Parking"`.
- **Images:** resolved per route via the same logic as `lib/page-header-images.ts` (exact → alias → inherited → default) and inlined as a plain string. Dynamic pages: `blog/[slug]` uses `image={heroUrl}`; `blog/tag/[tag]` & `blog/tags` reuse the resolved `/blog` image string; `heathrow-parking/[terminal]` reuses the resolved `/heathrow-parking` image string.
- **Town pages (13 minus pubs-in-stanwell) + 4 terminals + heathrow-hotels-pub + m25-junction-14-pub:** kept the `BookTableButton` primary as the sole `actions` child, added `fullWidth`, dropped ad-hoc width classes.
- **about / history:** 3 tags → 3 `<Badge variant="sand">`; `actions` = `BookTableButton` (primary, `fullWidth`) + `DirectionsButton` (outline). Note: **`DirectionsButton` and `PhoneButton` do NOT accept `fullWidth`** — removed it from those (the InteriorHero actions wrapper already forces `[&>*]:w-full sm:[&>*]:w-auto`). `Badge` added to the `@/components/ui` import.
- **about/the-anchor-facts:** `actions` = Link/Button "Book a Table" (primary) + Link/Button "View Food Menu" (outline), both `fullWidth`.
- **reviews / blog index / blog/tags:** lead kept as the original string/template literal; dropped `secondaryInfo` (page/post counts) and the "Back to Blog" `secondaryCta` link (blog/tags) per recipe.
- **blog/[slug]:** `lead={post.description}` (the byline/date line from the old `description` JSX is dropped — hero chrome InteriorHero doesn't carry). Tags → `post.tags.map(... <Badge key variant="sand">)`. The hero's `BlogShareButtons` (was `secondaryCta`, not a Button) was dropped from the hero — **no functionality lost**: `BlogShareButtons` is rendered again in the article body (line ~459). `Badge` added to `@/components/ui` import.
- **beer-garden:** the decorative child banner "DIRECTLY UNDER THE FLIGHT PATH" was a HeroWrapper child → dropped per recipe.
- **heathrow-parking & heathrow-parking/[terminal]:** 4 tags → 4 sand badges; `actions` = Link/Button primary + `PhoneButton` outline (no `fullWidth`). Dropped the amenity-pill `secondaryInfo`. On the static page this orphaned `import { HeroBadge }` (sole consumer was the dropped `secondaryInfo`) — **removed** that import. `Badge` added to `@/components/ui` import on both.
- **terminal-2:** import was `{ HeroWrapper, Breadcrumbs }`; `Breadcrumbs` had no other use → import replaced with `{ InteriorHero }`.

## Pre-existing unused imports (NOT touched — not caused by this batch)

These named imports were already unused at HEAD and the project ESLint config does not flag them; left as-is to stay in scope: `find-us` (Card, CardBody, Grid, Alert, InfoBoxGrid), `about` (Button), `reviews` (Section), `blog` (CardBody, GridItem), `near-heathrow/terminal-2` (Button). Verified each = 1 occurrence at `git show HEAD:<file>`.

## Sibling-batch note (for the orchestrator)

`app/sunday-lunch/page.tsx` (owned by the parallel 2.1c batch, NOT this batch) currently has two tsc/lint errors:
1. `InteriorHero is not defined` (missing `import { InteriorHero } from '@/components/hero'`).
2. `PhoneButton` used with `fullWidth` — `PhoneButton` (and `DirectionsButton`) do not accept `fullWidth`; it must be removed (the InteriorHero `actions` wrapper handles full-width). The sibling should apply the same fix I applied to my heathrow-parking/about/history pages.
