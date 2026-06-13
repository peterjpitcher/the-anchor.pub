# Handoff — Phase 2.1b completion: join-our-team heroes → InteriorHero (facts relocated)

Branch: `codex/redesign-build` · Recipe: `.redesign-workspace/wave-2/p2-interiorhero-foundation/handoff.md` · Spec §5.1
Deferred by 2.1b batch 2 (the 3 `variant="feature"` heroes whose `lead` embedded a label→value facts grid).

## What landed

Migrated the **last 3** `HeroWrapper` pages to `InteriorHero` and relocated every fact into a
compact section directly below each hero. No fact text changed (British English preserved).

- `app/join-our-team/page.tsx`
- `app/join-our-team/bar-staff/page.tsx`
- `app/join-our-team/kitchen-team/page.tsx`

InteriorHero was **not** modified (no facts slot added — kept minimal per spec §5.1).
`HeroFact`/`RoleHeroFact` component files were **not** deleted; `RoleHeroFact` is still exported
from `_components/RecruitmentRolePage.tsx` (now unused, but a named export — project ESLint does
not flag it; consistent with the sibling batch's pre-existing unused-export note).

## How each facts grid was relocated

All three sets of facts are **label→value pairs** (Pay, Hours, Location, Parking / Current roles),
so per the brief I used the **definition-grid-inside-a-Card** option, not badges (badges suit short
standalone tags; these are label/value).

Pattern (identical on all 3 pages), placed immediately below `<InteriorHero>`:

```tsx
<section className="theme-dark bg-anchor-green-deep border-b border-anchor-gold-dark/15 py-8">
  <Container>
    <Card variant="dark" accent className="max-w-4xl p-6">
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <RoleFact label="Pay" value="£12.71 per hour base rate" />
        … one per fact …
      </dl>
    </Card>
  </Container>
</section>
```

- `RoleFact`/`RecruitmentFact` is a tiny local helper rendering `<dt>` (label: `text-xs uppercase
  tracking-wide text-anchor-gold-bright`) + `<dd>` (value: `font-medium text-anchor-cream-text`).
  Replaced the old `HeroFact`/`RoleHeroFact` glass pills (which used `bg-black/25`, raw white).
- Section wrapped in `theme-dark` + `bg-anchor-green-deep` so it flows into the dark page body
  (the first body section on every one of these pages is already `bg-anchor-green-deep`).
- `<Card variant="dark" accent>` = green-card surface + gold-bright top rule (design tokens only).

### Facts preserved verbatim

- **index** (`page.tsx`): Current roles = "Bar Staff and Kitchen Team" · Location = "The Anchor,
  Stanwell Moor, TW19 6AQ" · Pay = "£12.71 per hour base rate" · Hours = "Part-time, mainly
  evenings and weekends".
- **bar-staff** & **kitchen-team**: Pay = "£12.71 per hour base rate" · Hours = "Part-time, mainly
  evenings and weekends" · Location = "The Anchor, Stanwell Moor, TW19 6AQ" · Parking = "Free
  on-site parking".

## Recipe application notes / quirks

- **Crumb:** index → `crumb="Join Our Team"`. Role pages → `crumb={role.title}` ("Bar Staff" /
  "Kitchen Team"), matching the role-as-title pattern the old hero used.
- **lead** = the prose intro only (the facts grid was pulled out). index lead is the single intro
  sentence; role pages keep `role.heroIntro[0]`.
- **actions:** kept both buttons per page (primary lg + outline lg). Dropped ad-hoc
  `className="w-full sm:w-auto"` on each Button — the InteriorHero `actions` wrapper forces
  `[&>*]:w-full sm:[&>*]:w-auto`. No `PhoneButton`/`DirectionsButton` used here, so the
  `fullWidth` caveat didn't apply.
- **Imports fixed:** `HeroWrapper`→`InteriorHero`; added `Card` (+ `Container` on the two role
  pages) to the `@/components/ui` import; dropped the `RoleHeroFact` import from both role pages
  (sole consumer was the removed hero); `HeroFact` (index) was a local helper, repurposed as
  `RecruitmentFact`.
- Page bodies otherwise unchanged.

## Verification (verbatim)

- `git grep -l "HeroWrapper" -- 'app/**/page.tsx' | wc -l` → **0** (these were the last 3).
- `npx tsc --noEmit` → clean (`TSC_EXIT` empty/0, no output).
- `npm run lint` (= `lint:next && audit:hero && audit:menu-pages`):
  - `next lint` → `✔ No ESLint warnings or errors`
  - `audit:hero` → `Hero audit passed for 123 page templates.`
  - `audit:menu-pages` → `Menu page audit passed.`
- Old-token audit
  `rg "anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather" app/join-our-team`
  → **0 hits** (rg exit 1).

## Staged / committed

Only these 3 files staged (NOT `docs/architecture/*`):
`app/join-our-team/page.tsx`, `app/join-our-team/bar-staff/page.tsx`,
`app/join-our-team/kitchen-team/page.tsx`. Committed on `codex/redesign-build`.
