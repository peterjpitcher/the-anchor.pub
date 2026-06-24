# Claude Hand-Off Brief: SEO Phase 2

**Generated:** 2026-06-14
**Review mode:** B (Code Review)
**Overall risk:** Low (one blocking defect, fixed; remainder advisory/verified-safe)

## DO NOT REWRITE
- The A11 resolver (`lib/seasonal-utils.ts`) and `SeasonalDynamicDetails` empty-state handling.
- The drift-guard test assertions.
- The SSOT structural edits (strategy extraction, LIVE_FROM_DB scalars) — consumers verified safe.
- `audit-hero.js` HERO_PROVIDING_COMPONENTS guard.

## IMPLEMENTATION CHANGES REQUIRED
- [x] AB-001: `app/easter-sunday/page.tsx`, `app/mothers-day/page.tsx` — replace non-existent "vegetarian gravy" and the vegan-Wellington-with-meat-gravy implication with SSOT gravy rules. **DONE (commit eed162b9).**

## ASSUMPTIONS TO RESOLVE (owner)
- [ ] Christmas-menu gravy: confirm whether the festive VG Wellington gets vegan gravy and whether "vegetarian gravy" exists for that menu, then fix `app/christmas-parties/client-components.tsx:755,759`.
- [ ] Stale blog `sunday-lunch-at-the-anchor-is-back-pre-order-now`: redirect or rewrite (pre-order discontinued; also remove banned "red wine gravy").
- [ ] Booking cap 10 vs 20 (already flagged): reconcile SSOT (10) with `lib/booking-config.ts` (20).

## REPO CONVENTIONS TO PRESERVE
- Prices live from DB (no hardcoded food/drink prices in copy).
- Banned claims out; Wellington = vegan; "The Anchor" in body; no em dashes.
- SSOT.json is imported at build time — never null a key a build-time consumer reads.

## RE-REVIEW REQUIRED AFTER FIXES
- None blocking. Optional re-review if A11 CTA overrides get wired.
