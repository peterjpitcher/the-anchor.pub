# Adversarial Review: SEO Phase 2 (code)

**Date:** 2026-06-14
**Mode:** B (Code Review)
**Scope:** Phase-2 code on `feat/seo-master-implementation` (a9d1fa1b..HEAD): A11 seasonal dynamic-field system, `SeasonalDynamicDetails`, `ssot-drift-guard.test.ts`, `app/easter-sunday`, SSOT.json structural edits, `audit-hero.js` HERO_PROVIDING_COMPONENTS.
**Pack:** tasks/codex-qa-review/2026-06-14-seo-phase2-review-pack.md (code-only, 48 KB)
**Reviewers:** Assumption Breaker, Integration & Architecture, Workflow & Failure-Path (Codex CLI 0.125.0)

## Executive summary
Three reviewers independently confirmed the core is sound: the A11 resolver normalises/drops blank fields, `SeasonalDynamicDetails` returns `null` on empty state (no orphan card), the drift-guard assertions are meaningful (negative checks for the old "20 guests" copy + banned claims), and no SSOT consumer reads a removed key. One real customer-facing defect found and fixed (gravy wording). Remaining items are advisory or verified-safe.

## What appears solid (do not rewrite)
- `lib/seasonal-utils.ts` resolver: trims blank/whitespace fields before render.
- `components/seasonal/SeasonalDynamicDetails.tsx`: renders `null` when no rows resolve.
- `components/HeroBadge.tsx` still reads `ratings.google.rating`/`review_count` (not removed).
- Drift-guard negative assertions (old booking copy, banned claims) are material.
- `audit-hero.js` HERO_PROVIDING_COMPONENTS still fails a page that omits the hero.

## Implementation defects
- **AB-001 (Medium, blocking) — FIXED.** `app/easter-sunday` + `app/mothers-day` referenced a non-existent "vegetarian gravy" and implied the vegan Wellington came with the meat-stock signature gravy. Corrected to SSOT gravy rules (signature = meat default; regular vegan = Wellington default / on request). Commit `eed162b9`.

## Verified-safe (no action)
- **AB-002** — `history.dining_room_history` (contains "wedding reception" as George Best history) has NO customer-facing consumer; the drift-guard's exclusion of that field is safe.
- **AB-004** — no consumer reads the `christmas_menus_*_gbp` / `catering_*_gbp` keys now set to `LIVE_FROM_DB`.
- **AB-005** — `scripts/audit-menu-pages.js` does not read the removed strategy keys.

## Advisory (non-blocking)
- **ARCH-002 / WF-002 (Low)** — the A11 contract exposes `ctaLabel`/`ctaDestination`, but no seasonal page wires them into its CTA, so an owner setting a CTA override would get a silent no-op. Default CTAs work. Wire when a real seasonal CTA override is needed.
- **AB-003 / ARCH-001 / WF-001 (Low)** — `app/easter-sunday` JSON-LD uses a hardcoded next-occurrence date (2027-04-04), consistent with the existing seasonal pages. After that date the Event schema is stale. Consider a shared auto-roll date helper for all seasonal pages (future enhancement).

## Out-of-scope finds (flagged separately)
- `app/christmas-parties/client-components.tsx:755,759` — same "vegetarian gravy" term + vegan Wellington shown with signature gravy, on the festive menu. NOT edited (no SSOT gravy rule for the Christmas menu; needs owner confirmation).
- `content/blog/sunday-lunch-at-the-anchor-is-back-pre-order-now` — stale post promoting pre-order (discontinued 17 May 2026) and using the SSOT-banned "red wine gravy". Needs redirect/rewrite, not a one-line patch.

## Recommended fix order
1. AB-001 — done.
2. Owner: confirm Christmas-menu gravy → fix christmas-parties wording.
3. Owner: decide redirect/rewrite for the stale pre-order blog post.
4. Optional: wire A11 CTA overrides; add seasonal auto-roll date helper.
