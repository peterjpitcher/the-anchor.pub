# The Anchor — Redesign Implementation Plan

**Companion to:** [`docs/redesign-spec.md`](./redesign-spec.md) (the WHAT). This document is the HOW: an ordered, PR-by-PR build guide a junior developer can execute without further design decisions.
**Date:** 10 June 2026 · **Status:** ready to start once the pre-flight gate (§B) is clear.

> Rule of thumb: the spec defines every value and component. This plan tells you the order, the exact files, the acceptance criteria and the rollback for each step. When they appear to disagree, the spec wins on *values*, this plan wins on *sequence*. Cross-references like "spec §4.1" point at the spec.

---

## A. How to use this plan

1. Work top to bottom. Phases are gated: do not open a Phase N+1 PR until all Phase N PRs are merged to `main` and the site is verified green.
2. One PR = one row in the phase tables below. Each PR has: **Goal · Depends on · Files · Steps · Acceptance · Rollback.**
3. Branch naming for Codex work: `codex/redesign-p{phase}-{slug}` (e.g. `codex/redesign-p0-foundations`, `codex/redesign-p1-button`).
4. Every PR ends with the verification gate (§C) **and** updates the tracking checklist (§N).
5. Commit in small verified increments (3-change rule). Use `checkpoint:` commits within a PR branch if helpful.
6. Never invent customer-facing copy. SSOT (`docs/SSOT.md`) is canonical. Where the spec says VERIFY, stop and check before shipping.

---

## B. Pre-flight gate (do this before Phase 0)

These are blockers or near-blockers. Resolve, then start.

| # | Action | Why |
|---|---|---|
| B1 | Record the spec §15 defaults in the kickoff notes. Use the default for **O1 (flight-path wording)** if the owner does not answer. Use the default for **O2 (primary button gold)**: `#8b6914` with white text. | O1 has a safe default. O2 is not a blocker because the AA-safe colour is already the default. |
| B2 | Confirm brand assets exist in `public/` (white + black wordmark; home-hero, dining-room, bar, beer-garden, Christmas-table, sunday-roast photography) at adequate resolution. If any are missing, copy from the handover `assets/` into `public/images/brand/` and `public/images/redesign/` in the Phase 0 PR. | Heroes and the home page reference specific imagery (spec §7). |
| B3 | Snapshot a visual baseline: capture the current homepage, `/food-menu`, one `near/*` page and `/book-table` at 1280px and 390px (screenshots into a scratch folder, not committed). | Lets you confirm "no unintended change" on long-tail pages during Phase 5. |
| B4 | `git status` is clean and the redesign work starts from an up-to-date `main`. Note: `docs/redesign-spec.md` and this plan are currently untracked - commit them first on a `codex/docs-redesign-plan` branch so the team can review. | The repo currently has these docs untracked. |
| B5 | Confirm CI runs lint + typecheck + test + build on PRs (it should). If not, the §C gate is manual per PR. | The gate depends on it. |

---

## C. Verification gate (every PR, no exceptions)

Run locally, stop at first failure, fix before continuing:

```bash
npm run lint        # zero warnings
npx tsc --noEmit    # clean
npm test            # all pass
npm run build       # production build succeeds
```

Then the PR-specific acceptance checks, then the spec §14 DoD items relevant to the PR (one-primary-per-view, AA button text, radii 3/6/12/999, gold-on-light = `#8b6914`, no em dashes, no unverified claims, and the right audit for the current phase).

Audit rule:
- Phase 0: old token/font audit is clean.
- Phases 1-5: old token/font audit is clean, and retired layout classes are clean only in touched files.
- Phase 6: full retired symbol/class audit is clean site-wide.

For any visual PR, also: visual check at **1280px and 390px** against `Page Layouts.html`; **no horizontal overflow at 390px** (hard rule).

---

## D. Sequencing & dependency map

```
Phase 0 (foundations)
   └─> Phase 1 (primitives: Button → Badge+Card → Input+SectionHeading)
          └─> Phase 2 (shell: InteriorHero → Header → Footer → StickyCtas+strips)
                 ├─> Phase 3 (live data: WeekHours, Events, Promos)
                 └─> Phase 4 (6 templates)  ← needs Phase 2; 4.1/4.3 also need Phase 3
                        └─> Phase 5 (long-tail sweeps, 1 PR per family)
                               └─> Phase 6 (delete retired code, copy/voice pass, final QA)
```

Phase 4.2, 4.4, 4.5 and 4.6 can start after Phase 2 lands. Phase 4.1 and 4.3 wait for Phase 3 because they consume WeekHours/events. Do not start Phase 6 deletions until every sweep in Phase 5 is merged (deletion needs zero remaining usages).

**Critical risk to manage throughout:** the site flips from dark to light at Phase 0. Between Phase 0 and the end of Phase 5, pages are in a mixed state (new tokens, old per-page dark classes). This is expected. Split audits and per-phase visual checks keep it controlled. Do **not** attempt a big-bang rewrite.

---

## E. Phase 0 — Foundations (1 PR · M)

**PR 0.1 — `codex/redesign-p0-foundations`**

- **Goal:** Land fonts, tokens, Tailwind theme and the light-theme base so the rest of the work has the design system available app-wide. Some pages will be mixed-state after this - acceptable.
- **Depends on:** B-gate clear.
- **Files:** `app/layout.tsx` (fonts), `app/globals.css` (tokens + base + temporary legacy shims), `tailwind.config.ts` (theme), plus any file that still uses removed colour names.
- **Steps:**
  1. Fonts per spec §3.1: add DM Serif Display / Outfit / Clicker Script via `next/font/google`; apply the three CSS variables on `<html>`; remove Merriweather (import, variable, usage). Keep Outfit.
  2. Tokens per spec §3.2: replace the `:root` `--anchor-*` block and `.theme-dark` block with the canonical set exactly as listed. Do **not** add the three `--font-*` family vars to CSS — `next/font` owns them.
  3. Base element rules per spec §3.2: set `body { background: var(--bg) }` (cream), heading font-family = display at weight 400, global `:focus-visible`. Remove the global `body::before` grain overlay.
  4. Tailwind theme per spec §3.4: replace the colour palette (raw `anchor` scale + semantic `canvas/surface/ink/accent/line`), fonts, `fontSize`, `borderRadius`, `boxShadow`. Delete the old flat colour keys, `luxury` shadows, `serif` mapping.
  5. Keep legacy layout helper classes defined for now if they are still used: `.section-spacing*`, `.card-dark`, `.card-warm`, `.inner-frame`, `.tag`, `.btn-friendly`. Mark them as deprecated in comments and list them for Phase 6 deletion. Only remove a helper in Phase 0 if `rg` proves zero usages. Keep `.hero-focal`, `.loading-dots` and focus-ring vars.
  6. Run the Phase 0 token/font audit (appendix §M) and fix every old colour/font hit using the rename table. Expect many: this is the intended audit-driven migration of colour names.
  7. Manually audit all remaining `anchor-gold`, `anchor-gold-dark` and `anchor-gold-bright` usages. Small gold text on light must use `text-accent-text`; decorative fills can use raw `anchor-gold`; dark-surface accents can use raw `anchor-gold-bright`.
- **Acceptance:**
  - Homepage renders on a cream background with DM Serif headings and no Merriweather anywhere (`rg "merriweather|font-serif" app components` → 0 hits except intentional).
  - Phase 0 token/font audit is clean: `rg "anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather" app components lib tests` → 0 hits.
  - Existing dark pages are still legible after the light-theme flip: smoke-check `/food-menu`, `/book-table` and one long-tail `near/*` page at 1280px and 390px.
  - No TypeScript or build errors; no new ESLint warnings.
  - Tailwind classes `bg-canvas`, `bg-surface`, `text-ink-muted`, `text-accent-text`, `rounded-pill`, `shadow-gold` all resolve (spot-check with a throwaway element).
- **Rollback:** single revert restores the dark theme. No data or API touched.

---

## F. Phase 1 — Primitives (3 PRs · M each)

**PR 1.1 — Button — `codex/redesign-p1-button`**
- **Goal:** 3 variants × 3 sizes; AA-safe primary; codemod all call sites.
- **Depends on:** PR 0.1.
- **Files:** `components/ui/primitives/Button.tsx`; wrappers `BookTableButton.tsx`, `PhoneButton.tsx`, `EventBookingButton.tsx`, `DirectionsButton.tsx`, `ShareButton.tsx`; all call sites; Button tests.
- **Steps:**
  1. Rewrite `buttonVariants` (CVA) per spec §4.1: variants `primary|outline|ghost`, sizes `sm|md|lg`; keep `fullWidth`, `asChild`, icon/loading props. Primary = `bg-anchor-gold-dark` (#8b6914) text white, hover `bg-anchor-green` + `shadow-gold`. Do not ship the lighter `#a57626` primary fill with white normal-size text because it fails AA.
  2. Codemod call sites (spec §4.1 table): `secondary→outline`, `danger→outline`, `warning→outline`, `xs→sm`, `xl→lg`. Use `rg`/sed carefully; review each diff (some `secondary` may want `ghost`).
  3. Update wrappers to the new variants only (no behaviour change).
  4. One-primary-per-view sweep on heavily-buttoned pages.
  5. Update Button unit tests to the new API (remove `secondary/danger/warning/xs/xl` assertions).
- **Acceptance:** `rg 'variant="(secondary|danger|warning)"|size="(xs|xl)"' app components` → 0 hits. Buttons render pill-shaped, correct heights (44/48/56). Primary text passes AA (document the ratio in the PR). Tests green.
- **Rollback:** revert; wrappers and call sites move together so revert is clean.

**PR 1.2 — Badge + Card — `codex/redesign-p1-badge-card`**
- **Goal:** one Badge (6 variants), one Card (light/dark + accent + hover), retire corner brackets.
- **Depends on:** PR 0.1 (independent of 1.1; can run in parallel but merge after 1.1 to avoid call-site churn collisions).
- **Files:** `components/ui/primitives/Badge.tsx`, `components/ui/layout/Card.tsx`, call sites, `globals.css` (`.card-dark`/`.card-warm` removal happens here only if usages are gone — otherwise Phase 6), Badge/Card tests, `HeroTag.tsx`/`HeroBadge.tsx` call sites.
- **Steps:**
  1. Badge per spec §4.2: variants `green|gold|sand|outline|success|danger`, optional `dot`, single size. Codemod `default|primary→green`, `secondary→sand`, `warning→gold`, `error→danger` (~67 sites). Replace inline amenity/status pills (`border-white/25 bg-white/10`, 5 sites), `.tag` usages, `HeroTag`, `HeroBadge` with `<Badge>`.
  2. Card per spec §4.3: props `variant: 'light'|'dark'`, `accent?`, `hover?`. **Migrate the existing `padding` prop** (validated to exist: `none|sm|md|lg`): move padding to `CardBody` (`p-4/p-6/p-8`) or `className`; remove the `padding` and old `variant` (`default|outlined|elevated`) props. Update all Card call sites and tests to the new API.
  3. `.card-warm` (4 sites) → `<Card accent hover>`. For `.card-dark` (215 sites): **do not bulk-convert here** — those live mostly inside per-page dark markup that Phase 5 sweeps will handle. In this PR, only introduce the new Card API and convert `.card-warm` + any `<Card>`-component call sites. Leave raw `.card-dark` class usages for the page sweeps.
- **Acceptance:** Badge/Card render per spec; no `<Card>` call site uses `variant="default"`, `variant="outlined"` or `variant="elevated"` (run `rg 'variant="(default|outlined|elevated)"' components app` and confirm any remaining hits are not Card props); `padding=` prop gone from Card API (`rg 'padding="(none|sm|md|lg)"'` → 0); tests green.
- **Rollback:** revert; note 1.1 stays.

**PR 1.3 — Input + SectionHeading — `codex/redesign-p1-input-heading`**
- **Goal:** one field system; one section heading.
- **Depends on:** PR 0.1.
- **Files:** `components/ui/primitives/Input.tsx` (+ Textarea), `components/ui/forms/{Input,Select,DatePicker,Textarea,...}.tsx`, new `SectionHeading` (replace `components/SectionHeader.tsx`), call sites, tests.
- **Steps:**
  1. Consolidate inputs per spec §4.4: make `components/ui/primitives/Input.tsx` the canonical control; have `forms/Select.tsx`, `forms/DatePicker.tsx`, `forms/Textarea.tsx` reuse the same field/control classes. **Resolve the duplicate `components/ui/forms/Input.tsx`** (validated to exist with a different API): repoint its imports to the primitive and delete the duplicate, or make it a thin re-export — pick one, document in the PR. Keep `helperText→hint` / `error→invalid+hint` aliases during migration; preserve iOS date/time hardening attributes.
  2. SectionHeading per spec §4.5: `kicker|script|title|lead|align`. Codemod 347 `SectionHeader` call sites: `eyebrow→kicker`, `subtitle→script` (only when a warm aside, else fold into `lead`), `description→lead`. Remove the old gold-rule divider.
  3. Update tests for both.
- **Acceptance:** one Input visual system (`rg "from '@/components/ui/forms/Input'"` → 0 or only the re-export); `SectionHeader` no longer imported (`rg "SectionHeader" app components` → 0 except the soon-deleted file); forms still submit (booking/enquiry smoke). Tests green.
- **Rollback:** revert; large diff, so land this PR on a quiet day and keep it self-contained.

---

## G. Phase 2 — Shell (4 workstreams · M–L; InteriorHero is a PR series)

**PR 2.1a-c — InteriorHero PR series — `codex/redesign-p2-interiorhero-{family}`**
- **Goal:** the single interior hero; migrate all 113 `HeroWrapper` pages without one giant review.
- **Depends on:** Phase 1 complete (uses Badge for hero badges, Button for actions).
- **Files:** new `components/hero/InteriorHero.tsx`; 113 page files importing `HeroWrapper`; keep `HeroWrapper` et al. alive until Phase 6.
- **Required split:**
  - **2.1a foundation:** build `InteriorHero`, migrate the Phase 4 interior template routes that need it (`/food-menu`, `/whats-on`, `/private-hire`, `/book-table`, `/near-heathrow`), and migrate 1-2 simple low-risk interior examples.
  - **2.1b low/medium-risk families:** blog, about/legal, seasonal, town/hotel and find-us/Heathrow routes.
  - **2.1c conversion-heavy families:** private-hire, events, food and parking routes.
  - Keep each batch under roughly 500 changed lines unless the reviewer explicitly accepts a larger PR.
- **Steps:**
  1. Build `InteriorHero` per spec §5.1 (props, scrim gradient, grain, breadcrumb, kicker, H1, lead, badges, actions; `next/image fill`; mobile full-width stacked actions).
  2. Migrate pages by family, mapping `HeroWrapper` props → `InteriorHero` (spec §5.1 mapping). Drop `variant/size/overlay/statusBar*/ctaLayout/enableSmartCtas/heroEvents/seasonalFallback`.
  3. Where a page used `showStatusBar`, rely on the utility strip (2.2) — but 2.2 may land after; acceptable interim is no status in that hero.
  4. **Do not delete `HeroWrapper`/`heroVariants.ts`/`PageHeader` yet** (Phase 6).
- **Acceptance per batch:** every migrated page shows the standard hero at 1280/390; one H1 per page (the hero title); no overflow; breadcrumb present. `rg "HeroWrapper" app` shrinks in each batch. After the final 2.1 batch, `rg "HeroWrapper" app` → 0.
- **Rollback:** revert the batch; pages fall back to `HeroWrapper` (still present).

**PR 2.2 — Header + utility strip — `codex/redesign-p2-header`**
- **Goal:** cream sticky header, dropdown sub-nav, desktop utility strip, accessible mobile drawer.
- **Depends on:** 2.1a (shared Button/Badge and `InteriorHero` exist), and StatusBar (2.x/5.6) for the strip — render strip without status until StatusBar restyle lands, or include the StatusBar restyle in this PR.
- **Files:** `components/layout/Navigation.tsx` (rewrite), `components/layout/StatusBar.tsx` (restyle, spec §5.6 — fold in here), `app/layout.tsx` (nav props), mobile drawer.
- **Steps:**
  1. Build the two bars per spec §5.2: utility strip (`hidden lg:block`) with StatusBar nav variant + PromoCtas + "Book parking" + phone; main 76px sticky header with logo, 4-item dropdown nav (exact model + hrefs from spec §5.2 table), `Book a table` primary sm, burger.
  2. **Validate every sub-nav href (O3)** against the live route list; fix any that 404 or redirect-chain in this PR.
  3. Dropdown a11y: hover + focus/click open, Escape closes, keyboard-reachable items, active state.
  4. Mobile drawer per spec §5.2 + A2: accordion sub-nav, "Book parking", PromoCtas block + full-width Book a table; scroll-lock, focus-trap, Escape/backdrop close.
  5. StatusBar restyle (spec §5.6): two variants `nav|pill`, keep all data logic/fallback.
  6. Preserve GTM tracking on nav/CTA clicks.
- **Acceptance:** nav matches spec at desktop/mobile; keyboard-only operable; every sub-nav link resolves 200; status bar shows live data with fallback when `/api/business/hours` is blocked. No overflow at 390px.
- **Rollback:** revert restores current Navigation/StatusBar.

**PR 2.3 — Footer — `codex/redesign-p2-footer`**
- **Goal:** deep-green footer, restyled, full live link inventory.
- **Depends on:** 2.1a.
- **Files:** `components/layout/Footer.tsx`.
- **Steps:** rebuild per spec §5.3 + A3: brand column (white wordmark, script tagline, about paragraph — apply the O1 flight-path decision), keep the live six link groups restyled, base bar with legal + social. Keep `<details>` accordions on mobile, real social URLs.
- **Acceptance:** all current footer links still present and working; renders green with grain; bottom padding clears the sticky bar (76px). No overflow.
- **Rollback:** revert.

**PR 2.4 — StickyCtas + AmenityStrip + CtaBand — `codex/redesign-p2-shell-extras`**
- **Goal:** the global sticky bar and the two reusable bands.
- **Depends on:** 2.1a.
- **Files:** new `components/layout/StickyCtas.tsx`, new `components/AmenityStrip.tsx`, new `components/CtaBand.tsx`; `app/layout.tsx` (render StickyCtas globally); keep old sticky/floating components alive until Phase 6.
- **Steps:**
  1. StickyCtas per spec §5.4: reveal after hero scroll, Book/Menu/Call/WhatsApp, not on `/book-table`, safe-area padding. Reuse existing CTA-click events and `trackStickyCtaShown` (already exists, `lib/gtm-events.ts:837` — do not recreate).
  2. AmenityStrip per spec §5.5 (4 items, SSOT-confirmed claims, responsive 4→2→1).
  3. CtaBand per spec §5.7.
  4. Render StickyCtas in `app/layout.tsx`. Remove `FloatingActions` from `app/layout.tsx` in this PR. Disable the old page-level sticky CTA render paths on food/event/booking pages in this PR too; keep the component files (`StickyMobileBookingCTA`, `FoodStickyCtaBar`, `EventStickyBookingCTA`) for Phase 6 deletion only.
- **Acceptance:** sticky bar appears after the hero on desktop+mobile, hidden on `/book-table`, no duplicate floating CTA globally, and no duplicate sticky bars on `/food-menu`, `/sunday-roast` or a real `/events/[id]` page; AmenityStrip/CtaBand render per spec. Analytics events fire (check dataLayer).
- **Rollback:** revert; restore `FloatingActions` in layout.

---

## H. Phase 3 — Live-data components (2 PRs · M)

**PR 3.1 — WeekHours + StatusBar wiring — `codex/redesign-p3-weekhours`** (if StatusBar restyle landed in 2.2, this PR is WeekHours only)
- **Goal:** 7-day hours card.
- **Depends on:** Phase 2.
- **Files:** new `components/WeekHours.tsx` (reuse logic from `components/BusinessHours.tsx`).
- **Steps:** build per spec §6.1; reuse `BusinessHours.tsx` data logic (special-over-regular merge, property-presence kitchen handling so `kitchen: null` stays closed), plane window from `getPlaneSpottingWindowForDate`. Live API only, static fallback.
- **Acceptance:** renders next 7 days with today highlighted, kitchen/plane lines, fallback when API blocked; times in 12h. No hardcoded hours.
- **Rollback:** revert.

**PR 3.2 — Events components — `codex/redesign-p3-events`**
- **Goal:** FeaturedEvent, EventListItem, UpcomingEvents restyle.
- **Depends on:** Phase 2.
- **Files:** new/restyled event card components; reuse `lib/api/events.ts`, `getEventBookingCopy`, `EventBookingButton`, `isEventSoldOut`/`hasLimitedAvailability`, `DEFAULT_EVENT_IMAGE`.
- **Steps:** build per spec §6.2. **Do not duplicate booking-label strings** — call `getEventBookingCopy(event).label`; use `EventBookingButton` for URL normalisation + GTM; derive sold-out/low-capacity badges from the existing helpers. PromoCtas restyle (spec §6.3) — keep the `promoCtaButtons` mechanism in `app/layout.tsx` untouched, restyle the rendered pill only.
- **Acceptance:** featured + list render from `/api/events`; sold-out and no-booking states correct; labels come from the helper (no string drift); booking buttons wrap, full-width on mobile.
- **Rollback:** revert.

---

## I. Phase 4 — Templates (6 PRs · S–M, one per page)

Each PR builds the page per spec §7.x using the now-available shell + live-data components. Apply §10 fact corrections and check VERIFY items against SSOT.

| PR | Page | Spec | Key fact checks before merge |
|---|---|---|---|
| 4.1 | Homepage `/` | §7.1 | Rating from `review-utils` (not literal); FAQ answers vs SSOT; bus routes 441/442/555; flight-path per O1; menu/price chips not used here |
| 4.2 | Food `/food-menu` | §7.2 | Live menu data (not prototype fixtures); "Mains £11–£16", "Pizzas from £12" (SSOT §5); roast lineup/prices exact (SSOT §4), Wellington = vegan; no hardcoded kitchen days |
| 4.3 | What's On `/whats-on` | §7.3 | "The regulars" details unverified (O4) — show only SSOT/API-backed values; events live from API |
| 4.4 | Private Hire `/private-hire` | §7.4 | "10 to 50 guests" (SSOT §8/§11); real §11 catering packages (NOT prototype names); deposit copy (SSOT §7); enquiry CTA → `#enquiry` not `/book-table` |
| 4.5 | Book a Table `/book-table` | §7.5 + §9 | "Quick confirmation" not "Instant"; restyle only — no logic change; full booking smoke incl. 10+ PayPal |
| 4.6 | Near Heathrow `/near-heathrow` | §7.6 | Journey times + buses (SSOT §2); 64 seats (SSOT §9); flight-path per O1; keep keyword H1 if stronger |

- **Depends on:** Phase 2. PRs 4.1 and 4.3 also depend on Phase 3.
- **Acceptance (each):** matches `Page Layouts.html` for that template at 1280/390; no overflow; one primary per section; FAQ/JSON-LD aligned (4.1); booking smoke passes (4.5).
- **Rollback:** per-page revert.

---

## J. Phase 5 — Long-tail sweeps (~10 PRs · S–M)

Re-skin every remaining route per the spec §8 mapping. **Keep existing H1s, body copy, metadata, JSON-LD, internal links (A4).** Swap components/theme only. Convert remaining raw `.card-dark`/`.card-warm`/`.section-spacing*` usages to the new Card/`py-section-y` as you touch each page. Compare against the B3 baseline to confirm only the skin changed.

Sweep order (one PR each, lowest risk first):

| PR | Family | Spec §8 row | Notes |
|---|---|---|---|
| 5.1 | Blog (4 routes + 143 posts) | Blog | Index cards + post prose template; markdown pipeline untouched |
| 5.2 | About / careers / legal (16) | About/legal | Legal = hero + prose, no AmenityStrip/CtaBand |
| 5.3 | Seasonal (11) | Seasonal | Generic interior recipe |
| 5.4 | Town + hotel pages (24) | Town/Hotel | Near-Heathrow recipe; journey card per location |
| 5.5 | Find Us / Heathrow (18) | Find Us | `find-us` embeds the §7.1 Find Us block |
| 5.6 | Private hire family (15 + 17 landmark) | Private hire | Occasion cards; `near/[slug]` generic; redirects stay redirects |
| 5.7 | Events family (14) | What's On | `events/[id]` = hero + FeaturedEvent; sweepstake restyle only |
| 5.8 | Food family (12) | Food | Menu blocks; `sunday-lunch` gets roast split; `sunday-roast` re-export unchanged |
| 5.9 | Parking (6) | Parking | Restyle `ParkingBookingWizard` controls with §4 primitives + §9 step visual; **no logic/rates/PayPal change**; confirmation pages = light Card summary |

- **Depends on:** Phase 4.
- **Acceptance (each):** visual match vs baseline (skin only); metadata/canonical/JSON-LD unchanged (`git diff` shows no metadata edits unless intended); internal links intact; no overflow; retired layout-class audit clean for the touched files.
- **Rollback:** per-family revert.

---

## K. Phase 6 — Cleanup & final QA (2 PRs)

**PR 6.1 — Delete retired code — `codex/redesign-p6-cleanup`**
- **Depends on:** all Phase 5 merged.
- **Steps:** per spec §11, only after `rg` shows **zero** usages for each: delete `HeroWrapper`, `HeroSection`, `HeroSectionServer`, `heroVariants.ts`, `HeroTag`, `SmartCTAs`, `PageHeader`, `ManagersSpecialHero`, `SectionHeader`, `HeroBadge`, `StickyMobileBookingCTA`, `FoodStickyCtaBar`, `EventStickyBookingCTA`, `FloatingActions`, `components/ui/forms/Input.tsx` (if not already), `components/hero/Breadcrumbs.tsx` (if unused). Remove CSS: `.card-dark`, `.card-warm`, `.inner-frame`, `.tag`, `.btn-friendly`, `.section-spacing*`, residual `--font-merriweather`, old Tailwind colour names, `luxury` shadows. Update/remove tests referencing deleted code.
- **Acceptance:** `rg` for each deleted symbol/class → 0; build + tests green; bundle size not increased.
- **Rollback:** revert (low risk — only dead code removed).

**PR 6.2 — Copy/voice + final QA — `codex/redesign-p6-qa`**
- **Steps:** full §10 voice pass on any copy touched (British English, sentence case, no em dashes, no unverified claims, 1751); run the full §14 DoD across the site; resolve all open questions; final full audit.
- **Acceptance:** §14 checklist fully green site-wide; spec §15 open questions all resolved and reflected.

---

## L. Testing strategy

- **Unit (Jest + React Testing Library):** update/extend tests for Button (3×3 API), Badge (6 variants), Card (new API, no `padding` prop), Input/SectionHeading, StatusBar (variants + fallback), WeekHours (special-over-regular merge, `kitchen: null` stays closed), event card states (sold-out/no-booking/low-capacity). Mock `/api/business/hours` and `/api/events`; never hit real APIs (testing.md).
- **Fallback test:** block `/api/business/hours` and confirm static fallback renders (StatusBar + WeekHours).
- **Booking smoke (staging, after 4.5):** full find→choose→details→review, including a 10+ party reaching the PayPal deposit step and the failed-PayPal recovery path. Confirm Turnstile + honeypot still enforced.
- **Visual:** per visual PR, compare 1280/390 against `Page Layouts.html`; against B3 baseline for Phase 5 (skin-only).
- **A11y:** keyboard-only pass on header dropdowns, mobile drawer, FAQ, booking steps; focus visible (3px gold); icon-only buttons have `aria-label`; AA contrast on primary button text (document ratio).
- **SEO:** after each sweep, `git diff` confirms metadata/canonical/JSON-LD unchanged; FAQPage schema matches rendered FAQ (4.1); sitemap untouched.

---

## M. Codemod & audit appendix

```bash
# Button variant/size codemod (review each diff — some secondary → ghost)
rg -l 'variant="secondary"' app components   # then targeted replace
rg 'variant="(secondary|danger|warning)"|size="(xs|xl)"' app components   # must be 0 after PR 1.1

# Badge codemod targets
rg 'variant="(default|primary|secondary|warning|error)"' components app    # Badge call sites
rg 'border-white/25 bg-white/10' app components                            # inline pills → <Badge variant="sand">

# Card API migration
rg 'padding="(none|sm|md|lg)"' app components                         # 0 after PR 1.2
rg 'variant="(default|outlined|elevated)"' app components              # review hits; none may be <Card> props after PR 1.2

# SectionHeader removal
rg "SectionHeader" app components            # 0 after PR 1.3 (except the file itself pre-delete)

# Phase 0 token/font audit — must be 0 after PR 0.1 and stay 0
rg -n "anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather" app components lib tests

# Retired layout-class audit — touched files only during Phase 5 sweeps.
# First list touched files, then run rg against that list if it is non-empty.
git diff --name-only main...HEAD -- app components lib tests
rg -n "section-spacing|card-dark|card-warm|inner-frame|btn-friendly|className=.*\\btag\\b" <touched-files>

# Final full audit — must be 0 before Phase 6 cleanup finishes
rg -n "anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather|section-spacing|card-dark|card-warm|inner-frame|btn-friendly|className=.*\\btag\\b" app components lib tests

# Hero migration progress
rg -l "HeroWrapper" app                      # shrinks to 0 across the 2.1 batches

# Retired-symbol check (before Phase 6 deletes)
rg -l "FloatingActions|StickyMobileBookingCTA|FoodStickyCtaBar|EventStickyBookingCTA|PageHeader|heroVariants|HeroTag|HeroBadge"
```

---

## N. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Dark→light flip leaves mixed-state pages mid-migration | High | Medium | Expected; per-phase visual checks + split audits; sweep order keeps it bounded |
| Colour-name collision silently swaps golds (spec §3.3) | High | High | Delete old token names in Phase 0; mandatory token audit; manual gold review |
| Booking conversion regression from restyle | Low | High | D4 = restyle only; no logic change; staging smoke incl. PayPal before merge |
| Shipping prototype placeholder facts (menu, packages, regulars, rating) | Medium | High | §10 fact table + VERIFY gates + SSOT citations; O4 blocks unverified regulars |
| Sub-nav hrefs 404 / redirect-chain | Medium | Medium | O3: validate every href in PR 2.2 |
| Deleting still-used components in Phase 6 | Low | Medium | `rg` zero-usage gate before each delete |
| `.card-dark` (215 uses) mass-conversion churn | Medium | Medium | Convert per-page during Phase 5 sweeps, not in one PR |
| SEO drift (metadata/JSON-LD/internal links) | Low | High | A4/A6; per-sweep `git diff` check; SEO guardrails §13 |
| Duplicate global sticky bars (new + old page-level bars) | Medium | Low | Remove `FloatingActions` and disable old page-level sticky render paths in PR 2.4 |

---

## O. Tracking checklist (tick as PRs merge)

- [x] Pre-flight B1 (defaults recorded; O2=#8b6914) · B4 (docs committed) · B5 (jest+lint confirmed) — B2 logos present at `public/images/branding/`; **B3 visual baseline still outstanding (needed before Phase 5)**
- [x] PR 0.1 Foundations — committed `032618cc`; audit 0, tsc clean, build 322pp, 0 test regression vs main, tokens byte-exact, 0 AA-risk gold-text
- [ ] PR 1.1 Button · [ ] 1.2 Badge+Card · [ ] 1.3 Input+SectionHeading
- [ ] PR 2.1a InteriorHero foundation · [ ] 2.1b Hero low/medium families · [ ] 2.1c Hero conversion families · [ ] 2.2 Header · [ ] 2.3 Footer · [ ] 2.4 StickyCtas+strips
- [ ] PR 3.1 WeekHours · [ ] 3.2 Events
- [ ] PR 4.1 Home · [ ] 4.2 Food · [ ] 4.3 What's On · [ ] 4.4 Private Hire · [ ] 4.5 Book · [ ] 4.6 Near Heathrow
- [ ] PR 5.1 Blog · [ ] 5.2 About/legal · [ ] 5.3 Seasonal · [ ] 5.4 Town/Hotel · [ ] 5.5 Find Us · [ ] 5.6 Private hire family · [ ] 5.7 Events family · [ ] 5.8 Food family · [ ] 5.9 Parking
- [ ] PR 6.1 Delete retired code · [ ] 6.2 Copy/voice + final QA
- [ ] Open questions O1–O5 resolved
