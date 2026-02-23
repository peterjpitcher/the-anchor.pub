# Hero Consistency Specification

## Purpose
This document defines the canonical hero contract for user-facing templates in The Anchor site.

## Canonical Hero System
1. User-facing content routes must use `HeroWrapper` as the hero entrypoint.
2. `HeroSection` may be used only inside `HeroWrapper` internals.
3. Custom hero/header implementations are not allowed on user-facing routes unless explicitly exempted.

## Exempt Route Categories
The following route categories are exempt from canonical hero requirements:
1. Redirect-only routes.
2. Test/debug routes (for example, `/test-*`, `/debug-*`, `/components` showcase pages).
3. Transactional/status utility routes (for example booking/payment status pages).

## Hero Content Contract
1. `HeroWrapper` owns the page-level `h1`.
2. Sections after hero must not introduce another `h1`.
3. `PageTitle` defaults to `h2`; use `as="h1"` only on routes without a hero.
4. Hero CTAs should follow category policy:
   - Local/location pages: booking-intent primary CTA.
   - Terminal pages: consistent booking-intent primary CTA.
   - Private-hire children: consistent variant and CTA layout within the family.

## Hero Image Resolution Contract
1. Route image lookup order:
   - exact route folder
   - configured alias folder
   - nearest parent route image
   - explicit default image
2. Seasonal fallback is opt-in behavior:
   - never automatic for non-home routes
   - home-only in `auto` mode
   - `seasonalFallback="always"` when intentionally desired
3. Legacy folder naming mismatches must be modeled via aliases in `lib/page-header-images.ts`.

## Automated Enforcement
`npm run audit:hero` must fail when non-exempt pages violate:
1. canonical hero component usage (`HeroWrapper` required),
2. heading hierarchy (single `h1` when hero exists),
3. resolvable route image policy for literal-route `HeroWrapper` usage.
