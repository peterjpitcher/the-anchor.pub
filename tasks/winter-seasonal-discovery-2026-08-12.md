# Discovery: winter seasonal design + monthly imagery + dark season

Date: 12 August 2026
Status: discovery only, no code changed
Brief: `Winter seasonal design.zip` (design_handoff_winter_seasonal)

---

## 1. Monthly seasonal images: the mechanism works, the photos were flattened

**The code is alive and wired up.** `getSeasonalHomepageImage()` in `lib/seasonal-utils.ts` is
called from `app/page.tsx:188` and feeds `HomeHero`. It resolves in Europe/London via
`lib/time-london.ts`, so a UTC server cannot flip it early. There is a
`NEXT_PUBLIC_FORCE_SEASON` override for preview deploys. It is covered by
`tests/unit/seasonal-utils.test.ts`.

**It rotates on 7 buckets, not 12 months:**

| Season | Window | Asset |
|---|---|---|
| winter | 1 Jan to 28/29 Feb | `seasonal/winter/` |
| spring | 1 Mar to 31 May | `seasonal/spring/` |
| summer | 1 Jun to 31 Aug | `seasonal/summer/` |
| autumn | 1 Sep to 30 Sep | `seasonal/autumn/` |
| halloween | 1 Oct to 31 Oct | `seasonal/halloween/` |
| remembrance | 1 Nov to 11 Nov | reuses `seasonal/autumn/` |
| christmas | 12 Nov to 31 Dec | `seasonal/christmas/` |

**Root cause of "it stopped working".** Commit `1347118d` (20 March 2026,
*chore: optimise images*) overwrote spring, summer and winter with the same compressed file
as the default header. All three are byte-identical to
`public/images/page-headers/home/page-headers-homepage.jpg`:

```
default    61eefa79d6be359b7883defc9b935d8b  290042 bytes
spring     61eefa79d6be359b7883defc9b935d8b  290042 bytes   <- same photo
summer     61eefa79d6be359b7883defc9b935d8b  290042 bytes   <- same photo
winter     61eefa79d6be359b7883defc9b935d8b  290042 bytes   <- same photo
autumn     0dab584901b558b4b4f832344ac2effc  179511 bytes   (Oct 2025)
christmas  d379452b88e4bdd1cf8961ed5bba6b01  191301 bytes   (Oct 2025)
halloween  05130d20ea4684692f4efdd9c27467b3  164340 bytes   (Oct 2025)
```

The commit message records "homepage header from 3.3MB to 290KB", so the compression step
appears to have written one output over four inputs.

**Net effect:** from 1 January to 31 August the homepage photo never visibly changes.
Only September, October and 12 November onwards look different. Verified live: production
is serving `/images/page-headers/home/seasonal/summer/page-headers-homepage.jpg` today,
which is the same photo as the default.

**Scope.** This is homepage-only. The other 117 routes use `InteriorHero` with fixed
per-route photos resolved by `lib/page-header-images.ts`. Those have never rotated.

**Work required:** replace 3 dead photos (spring, summer, winter), optionally refresh the
3 from October 2025, optionally widen from 7 buckets to 12 months. No mechanism rebuild.

---

## 2. String lights + frost on every page, 1 November to 31 December

**Feasible with two component edits.** The site has exactly two heroes:

- `components/hero/InteriorHero.tsx`, used by 101 of 118 routes
- `app/_components/HomeHero.tsx`, the homepage only

Both already carry `.theme-dark` and a scrim/grain stack, so the frost layers drop in
above the scrim without touching per-page code.

**The icicle strand hangs from the header**, which lives in the root layout
(`app/layout.tsx` into `components/layout/Navigation.tsx`), so it becomes site-wide for free.

**20 routes have no hero** and would get lights but no frost:

```
/book-event                     /free-parking
/booking-confirmation           /leave-review
/drinks/[slug]                  /whats-on/drag-shows
/parking/bookings/[id]          /heathrow-parking/confirmation/[bookingId]
/[...unmatched]                 11x /pub-near-*-heathrow hotel pages
```

**New asset to commit:** `icicle-lights.png`, 1536x245 transparent PNG, warm-white bulbs on
gold wire, tiles seamlessly on repeat-x. Currently 489KB, should be compressed before
committing.

**Conflict with the brief.** The brief deliberately holds everything back for Remembrance
(1 to 11 November: no lights, no frost) and ramps in two stages: 0.55 lights / 0.4 frost from
12 November, full from 1 December. The existing image code already has the same holdback
(a `remembrance` season, 1 to 11 Nov). A 1 November start overrides both. See question 1.

---

## 3. Full dark variant, 1 September to 31 March

**The architecture is already built for this.** `app/globals.css:280` defines:

```css
.theme-dark,
[data-theme="dark"] { --bg / --surface / --text / --accent / --border / --link ... }
```

Every semantic token is overridden, and `tailwind.config.ts` maps the utility classes onto
those same variables (`bg-surface`, `bg-canvas`, `text-ink`, `border-line`, `text-accent`).

**The codebase is overwhelmingly token-driven**, so setting `data-theme="dark"` on `<html>`
flips most of the site correctly with no per-page work:

| Token class | Occurrences in app/ + components/ |
|---|---|
| `text-ink*` | 2939 |
| `bg-surface*` | 874 |
| `border-line*` | 582 |
| `bg-canvas` | 274 |

**Hardcoded light values are rare**, roughly 30 occurrences across 22 files. That is the
whole punch list:

```
app/_components/HomeFaq.tsx                    components/features/Gallery.tsx
app/christmas-parties/client-components.tsx    components/features/six-nations/SixNationsLightbox.tsx
app/page.tsx                                   components/layout/Footer.tsx
app/private-hire/_components/OccasionCard.tsx  components/PricingCard.tsx
app/quiz-night-competition-terms/…Notice.tsx   components/private-hire/…/InteractiveVenueFloorPlan.tsx
components/CookieBanner.tsx                    components/SpecialOfferNotifications.tsx
components/EventCountdownBanner.tsx            components/ui/forms/Switch.tsx
components/features/AllergenFilterBar.tsx      components/ui/FullWidthSection.tsx
components/features/BlogPost.tsx               components/ui/GoogleMapEmbed.tsx
components/features/christmas/ChristmasLightbox.tsx  components/ui/primitives/Badge.tsx
components/WeekHours.tsx                       components/ui/primitives/Button.tsx
```

**Two known specific fixes:**

1. `components/layout/Navigation.tsx:476`, the sticky header hardcodes
   `bg-[rgba(250,248,243,0.9)]`. It will stay cream on a dark page.
2. `components/layout/Navigation.tsx` loads the **black** wordmark. Needs the white one
   (`the-anchor-pub-logo-white-transparent.png`, already in the repo).

**The top utility bar is safe.** `Navigation.tsx:427` uses `bg-surface`, `border-line` and
`text-ink`, so it inherits the dark theme automatically and keeps its contents: the live
opening-hours status (`StatusBar`), the phone number, "Book parking", and the scheduled
seasonal promo CTAs (date-windowed via `parseLondonDate`). No content is lost. Note it is
`hidden lg:block`, desktop only today, unchanged by this work.

**Risks:**

- 7 months is more than half the year, so this stops being a "seasonal skin" and becomes
  the site's main appearance. Photography on menu, blog and private-hire pages was graded
  against cream.
- Contrast needs re-checking on all 22 punch-list files.
- `theme-color` meta and OG images are light-assumed.

---

## 4. Recommended shape

One `lib/winter-season.ts`, a pure function of the London date, returning three independent
switches so the three requests do not entangle:

```ts
{ darkTheme: boolean,     // 1 Sep to 31 Mar
  lights: number,         // 0 to 1, Nov and Dec
  frost: number,          // 0 to 1, Nov and Dec
  heroSeason: string }    // delegated to getSeasonalHomepageImage(), not duplicated
```

Applied as `data-theme` plus `--winter-*` custom properties on `<html>` in the root layout.
Server-rendered only. The homepage is already `revalidate = 3600`, which is enough for a
date flip. Keep a `NEXT_PUBLIC_FORCE_SEASON`-style override for preview deploys.
Unit tests mirroring `tests/unit/seasonal-utils.test.ts`, asserting boundaries in
Europe/London across a BST/GMT crossing.

Complexity: **4 (L)**. Recommend three separate PRs, in this order:
1. Restore the seasonal photos (small, ships immediately, no design risk)
2. Site-wide dark season plus the punch list
3. Lights and frost

**Housekeeping:** current branch is `fix/availability-cold-start-timeout` with uncommitted
changes to 7 event files plus a new `components/features/EventDateCards.tsx`. That should
land or be stashed before this work starts.

---

## 5. Decisions taken (owner, 12 August 2026)

1. Lights and frost start **1 November**. Remembrance handled separately, no hold-back.
2. **No ramp.** Full strength for the whole 1 Nov to 31 Dec window.
3. Dark theme covers **every page**, 1 September to 31 March.
4. **12 monthly photos**, not the 7 seasonal buckets. Photos to follow, switched in later.
5. All 12 to be newly shot.
6. Seasonal photos stay **homepage only**.
7. The **seasonal copy swap is in scope**.

Built against these: `lib/winter-season.ts` plus `tests/unit/winter-season.test.ts`
(34 tests, all boundaries in Europe/London including both DST crossings), and a monthly
rotation in `lib/seasonal-utils.ts` gated behind `AVAILABLE_MONTHLY_HEROES`. That list is
empty today, so behaviour is unchanged until photos land. Add a month to the list in the
same commit as its file: `validateSeasonalImage()` returns true unconditionally in
production, so a listed-but-missing file would 404 on the live site.

---

## 6. Page width audit

Measured on the running dev server at 1440px and 375px viewports, not inferred from CSS.

### Desktop: five competing width systems

| Wrapper | Max width | Side padding | Content width | Uses |
|---|---|---|---|---|
| Raw `className="container"` | 1280px | 16px (Tailwind config) | **1248px** | 99 |
| `<Container>` default (`size="lg"`) | 1280px (`max-w-7xl`) | 32px at `lg:` | **1216px** | 470 |
| `<Container size="md">` | 1024px (`max-w-5xl`) | 32px | 960px | 22 |
| `<Container size="xl">` | 1440px | 32px | 1376px | 3 |
| Inner caps `max-w-2xl` to `max-w-6xl` | 672 to 1152px | 0 | varies | 535 |

The header, footer and amenity strip use the raw `.container` (1248px). Almost every page
section uses the `<Container>` component (1216px). Same nominal 1280px cap, different
padding, so page content sits **32px narrower than the header** everywhere. That is the
misalignment visible on the homepage.

Inside that, five more caps are in play: `max-w-4xl` (235 uses), `max-w-3xl` (106),
`max-w-5xl` (81), `max-w-2xl` (59), `max-w-6xl` (54).

Measured live, `/whats-on` renders **seven** distinct content widths on one page:

```
1248px (x7)  1216px (x6)  1152px (x4)  1024px (x2)  768px (x1)  760px (x1)  720px (x1)
```

`/food-menu` renders six. The homepage happens to be internally consistent at 1248px,
which is why the header lines up there and nowhere else.

### Mobile: gutters vary on the same page

At 375px, `/whats-on` renders content at 343px (16px gutters), 311px (32px gutters) and
309px (33px gutters), all in the same scroll. Left edges do not line up between sections.

### Root cause

`tailwind.config.ts:12` sets `container: { padding: '1rem' }`, while `Container.tsx`
adds `px-4 sm:px-6 lg:px-8` on top of the same `.container` class. The utility wins at
`lg:`, so the two systems disagree by 32px at desktop and 16px at mobile. The
`--container-max` and `--container-pad` tokens in `globals.css:233` are declared but never
referenced by anything.

### Proposed fix

Make `--container-max` and `--container-pad` the single source of truth, drive both
`.container` and `<Container>` from them, delete the `size` variants in favour of two
named widths, and sweep the 535 inner caps:

- **Standard** 1248px content: every section wrapper, header, footer, card grids
- **Prose** roughly 720px: long-form body text only (blog articles, FAQ answers, legal)

Keeping a narrow prose measure is a readability requirement, not an inconsistency. Body
copy at 1248px is about 190 characters per line, roughly triple the comfortable maximum.

Complexity: **4 (L)**, around 500 call sites. Should land as its own PR, before the dark
theme, so the theme work goes onto a stable layout.

---

## 7. Header: black to green

Three separate things are currently black or near-black in the header:

| What | Where | Now | Note |
|---|---|---|---|
| Wordmark | `Navigation.tsx:128` | `logo-black-transparent.png` | Only black and white variants exist in `public/images/branding/`. No green asset. |
| Desktop nav items | `Navigation.tsx:257` | `text-ink` = `#1a1a1a` | Should be `text-ink-strong`, which is already `--anchor-green #005131` |
| Utility strip links | `Navigation.tsx:422` | `text-ink` = `#1a1a1a` | Same fix |

Already green and correct: dropdown items, mobile menu items and the hamburger icon all
use `text-ink-strong` / `bg-ink-strong`. So the header is currently inconsistent with
itself, charcoal at the top level and green one layer down.

The text fix is a two-class change. The wordmark needs a green asset produced, and only
applies April to August, since the dark season swaps it to white anyway.
