# Phase 6, PR 6.2 — QA + Test Updates + Copy/Voice Pass — Handoff

Branch: `codex/redesign-build`. **Nothing committed / nothing staged** (per brief; orchestrator commits).

---

## Part 1 — Test-debt suites (both now PASS)

### `tests/unit/hero-template-regressions.test.ts`
Rewrote every assertion from the OLD hero system (`<HeroWrapper`, `route=`,
`variant="feature"`, `primaryCta={<BookTableButton…}`) to the NEW `InteriorHero`,
**preserving the original intent**:

| Test | Old assertion | New assertion (intent preserved) |
|---|---|---|
| christmas-parties | `<HeroWrapper` in page; no `<HeroSection` in client | `<InteriorHero` + `crumb="Christmas Parties"` in page; client has neither `<HeroSection` nor `<InteriorHero` |
| events/[id] | `<HeroWrapper` | `<InteriorHero` + `crumb={event.category?.name ?? "What's On"}` |
| private-hire children | `route="…"[\s\S]*?variant="feature"` | `<InteriorHero…crumb="…"` (engagement / milestone / gender-reveal / retirement) — these pages use enquiry-intent CTAs (Link→`/private-hire#enquiry`), not BookTableButton, so the intent check is "one InteriorHero with the right crumb", matching the old presence check |
| terminal 2/3/5 | `route="…"[\s\S]*?primaryCta=\{…<BookTableButton` | `<InteriorHero…crumb="Near Heathrow"…actions={…<BookTableButton` (booking-intent CTA preserved) |
| local pubs (bedfont/egham/feltham/staines/heathrow-hotels) | `route="…"[\s\S]*?primaryCta=\{…<BookTableButton` | `<InteriorHero…crumb="<page crumb>"…actions={…<BookTableButton` (booking-intent CTA preserved) |

### `tests/unit/TestimonialSection.test.tsx`
- Mock changed from `@/components/SectionHeader` (testid `section-header`) to
  `@/components/ui/SectionHeading` (testid `section-heading`). The component now
  imports `SectionHeading` via the `@/components/ui` barrel, which re-exports
  `./SectionHeading`, so mocking the concrete module is picked up by the barrel.
- All three `section-header` testid queries updated to `section-heading`.
- The mock still renders `<h2>{title}</h2>` + a `<p>{subtitle}</p>`, and exposes
  `data-title` / `data-subtitle`. `TestimonialSection` (full variant) passes
  `title`/`subtitle` straight through, so the existing default-copy assertions
  ("What Our Guests Say" / "From Google Reviews") still hold.

Verification: `npx jest hero-template-regressions TestimonialSection` →
**2 suites / 21 tests PASS**.

---

## Part 2 — Copy / voice fixes (§10 + SSOT)

### 1. book-table "instant confirmation" → "quick confirmation"
- `app/book-table/page.tsx:43` metadata description: `instant confirmation` → `quick confirmation`.
- `app/book-table/page.tsx:109` JSON-LD WebPage description: `Instant confirmation.` → `Quick confirmation.`

### 2. Sky / TNT Sports (banned — terrestrial/free-to-air only)
- `app/horton-pub/page.tsx:175`: `• Sky & TNT Sports on big screens` → `• Free-to-air sport on the big screens`.
- `app/live-sport/page.tsx` (lines 143/252/267): **left unchanged** — these are
  correct disclaimers explicitly stating we do NOT have Sky/TNT. Not violations.

### 3. Sunday roast "from £16" → "from £19" (SSOT §4: turkey cheapest at £19)
Corrected on:
- `app/pub-near-novotel-heathrow/page.tsx` — `From £16` → `From £19`
- `app/pub-near-holiday-inn-heathrow/page.tsx` — `From £16` → `From £19`
- `app/pub-near-premier-inn-heathrow/page.tsx` — `From £16` → `From £19`
- `app/heathrow-hotels-pub/page.tsx` — `From £16` → `From £19`
- `app/pub-near-sofitel-heathrow/page.tsx` — `roast from £16` → `from £19`
- `app/pub-near-renaissance-heathrow/page.tsx` — `British roast from £16` → `£19`
- `app/pub-near-crowne-plaza-heathrow/page.tsx` — `roast from £16` → `£19`
- `app/pub-near-radisson-blu-heathrow/page.tsx` — `roast from £16` → `£19`
- `app/pub-near-travelodge-heathrow/page.tsx` — `Sunday roast from £16` → `£19`
- `app/restaurants-near-heathrow/page.tsx` (2 hits) — `roast … From £16` and `roasts from £16` → `£19`
- `app/stanwell-pub/page.tsx:273` — `Roast Turkey with Stuffing Ball - £16` → `- £19` (SSOT turkey = £19)
- `app/easter/page.tsx` — const `EASTER_ROAST_PRICE_FROM = 16 → 19`, plus 3 metadata strings + 1 body string `from £16` → `from £19`
- `app/fathers-day/page.tsx` — const `FATHERS_DAY_ROAST_PRICE_FROM = 16 → 19`, plus metadata/body `from £16` / `mains from £16` → `£19`

**Left alone (not Sunday-roast prices):** christmas buffet tiers (`£16pp`,
`£16.95`), food-menu mains range (`Mains £11 to £16`), taxi/Uber fares
(`£16-20`, `£16–22`).

### 4. Baby changing / accessible toilet (SSOT §8: NEITHER exists)
Removed/corrected false-positive claims:
- `app/heathrow-family-dining/page.tsx:63` JSON-LD `Baby Changing Facilities … value: true` → `false`.
- `app/private-hire/christenings/page.tsx:64` JSON-LD `Baby Changing Facilities … value: true` → `false`.
- `app/private-hire/christenings/page.tsx:183` feature card "Baby Changing / Baby changing facilities are available on site" → replaced with a verified "Step-Free Access" card (SSOT §8: step-free to bar/dining is verified, free parking by the entrance).
- `app/private-hire/wakes/page.tsx:205` "Accessible toilets are available on site" → rewritten to verified step-free wording + explicit "we do not currently have an accessible toilet, call ahead".

All other accessible-toilet hits (book-table, beer-garden, accessibility,
find-us, private-hire, about-facts) already correctly state we do NOT have one —
left unchanged.

### 5. Em dashes in redesign copy
- Redesign templates (`InteriorHero.tsx`, `SectionHeading.tsx`,
  `TestimonialSection.tsx`): em dashes present **only in code comments / JSDoc**,
  not customer-facing strings — out of scope for the voice rule.
- Files edited this pass contain no em dashes in the new/changed copy.

---

## FLAGGED FOR OWNER REVIEW (ambiguous — left unchanged)

Three InteriorHero **H1 `title` props** carry an em dash:
- `app/christmas-parties/page.tsx:187` — "Christmas party near Heathrow — pub dinners, party nights & festive lunch 2026"
- `app/private-hire/engagement-parties/page.tsx:74` — "Engagement Party Venue Near Heathrow — celebrate at The Anchor"
- `app/private-hire/milestone-birthdays/page.tsx:74` — "Birthday Party Venue Near Heathrow — 21st to 50th Celebrations"

These are long-standing **SEO H1s** (the "X near Heathrow — Y" pattern predates
the redesign; Phase 2.1 only moved them into InteriorHero — it did not author the
copy). The brief scopes em-dash fixes to copy *introduced* by the redesign and
says to leave pre-existing em dashes that are out of scope. Given the SEO/ranking
sensitivity of changing an indexed H1, I left these as-is for owner decision
rather than rewrite them. Recommended swap if approved: em dash → colon or full
stop (e.g. "Christmas party near Heathrow: pub dinners, party nights & festive
lunch 2026").

---

## Verification (verbatim)

1. `npx jest hero-template-regressions TestimonialSection` → `Test Suites: 2 passed, 2 total / Tests: 21 passed, 21 total`.
2. `npx tsc --noEmit` → exit 0 (clean).
3. `ManagementTableBookingForm` → `31 failed, 1 skipped, 12 passed` — **same pre-existing flaky baseline** (documented 31–33). Only booking file touched is `app/book-table/page.tsx` (metadata copy only; not imported by this suite, no booking logic changed).
4. §10 re-greps: `instant confirmation` CLEAR · positive baby-changing/accessible-toilet claims CLEAR · roast `£16` CLEAR · Sky/TNT only the correct "we do NOT have" disclaimers remain.

## Files modified (all uncommitted)
Tests: `tests/unit/hero-template-regressions.test.ts`, `tests/unit/TestimonialSection.test.tsx`.
Copy/JSON-LD: book-table, horton-pub, heathrow-family-dining, private-hire/christenings, private-hire/wakes, stanwell-pub, restaurants-near-heathrow, heathrow-hotels-pub, easter, fathers-day, and pub-near-{novotel,holiday-inn,premier-inn,sofitel,renaissance,crowne-plaza,radisson-blu,travelodge}-heathrow.

`docs/architecture/*` were already modified before this task (pre-existing) and were NOT touched.
