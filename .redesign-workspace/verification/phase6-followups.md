# Phase 6 follow-ups (copy / voice / cleanup)

Items flagged during Phases 1–5 to resolve in the Phase 6 copy/voice pass (§10) or cleanup (§11).

## Copy / voice
- **`app/book-table/page.tsx` metadata + JSON-LD say "instant confirmation"** — contradicts the new "Quick confirmation" hero badge (10+ parties need the PayPal deposit step). Update the metadata/description/JSON-LD wording to "Quick confirmation" (or remove the claim). Source: 4.5 restyle flag.
- **PRE-EXISTING SSOT violations surfaced during Phase 5 (A4 left them verbatim — fix in §10 copy pass):**
  - `app/horton-pub/page.tsx` — "Sky & TNT Sports" (BANNED — no Sky/TNT; terrestrial only).
  - "Sunday roast from £16" appears on several hotel/restaurant/town pages — SSOT copy rule is "from £19".
  - `app/heathrow-family-dining/page.tsx` — JSON-LD claims accessible toilet / baby changing (SSOT §8: NO).
  - `app/private-hire/christenings/page.tsx` — claims on-site baby changing (SSOT §8: NO). A background task was already spawned for this one.
  - Sweep the whole site for these banned claims and the £16 roast price during the §10 pass.

## Test-debt (see test-debt.md)
- `hero-template-regressions` — rewrite to assert InteriorHero, preserve intent checks.
- `TestimonialSection` — update for SectionHeading markup/testid.

## Structural cleanup (Phase 6 §11)
- The legacy `Section` component still maps `cream`/`white` tints to DARK backgrounds (not migrated). Template pages used plain `<section>` + Phase-0 tokens to get true cream/white. Phase 6 should migrate or retire the `Section` component and audit any remaining users.
- Retire (after zero-usage check): HeroWrapper, HeroSection(Server), heroVariants, HeroTag, SmartCTAs, PageHeader, ManagersSpecialHero, SectionHeader (re-export), HeroBadge, FloatingActions, StickyMobileBookingCTA, FoodStickyCtaBar, EventStickyBookingCTA, forms/Input re-export, Breadcrumbs (if unused), FilteredUpcomingEvents (replaced on whats-on), DietaryMenuNav/FilteredMenuRenderer (removed from food-menu body), and the legacy `.card-dark`/`.card-warm`/`.section-spacing*`/`.tag`/`.inner-frame`/`.btn-friendly` CSS once raw usages reach zero.
- Duplicated hours-resolution logic between `BusinessHours.tsx` and `WeekHours.tsx` — consider extracting `lib/week-hours-data.ts`.
