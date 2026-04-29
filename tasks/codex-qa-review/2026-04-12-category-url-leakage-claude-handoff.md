# Claude Hand-Off Brief: Category URL Leakage Fix

**Generated:** 2026-04-12
**Review mode:** Spec Compliance (Mode C)
**Overall risk assessment:** Medium (spec is directionally correct but has gaps)

## DO NOT REWRITE

- Root cause analysis (RC1-RC5) — all verified accurate
- The "fix at source" principle — correct approach
- Booking button analysis — already fixed, no changes needed
- Category page enumeration — all 6 verified
- Out-of-scope boundaries — correctly drawn

## SPEC REVISION REQUIRED

- [ ] **SPEC-REV-1: Replace blocklist with allowlist in Change 1.** The spec currently proposes checking against `CATEGORY_PAGE_PATHS`. Instead, check whether the resolved path starts with `/events/`. If not, reject it. This catches category pages, `/whats-on`, external URLs turned into internal paths, and bare strings — all in one rule. This also eliminates the need to import `CATEGORY_ROUTES` into `event-url.ts`, resolving the dependency inversion concern.

  **Before:**
  ```typescript
  if (!categoryPaths.has(normalisedResolved)) { return resolved }
  ```
  **After:**
  ```typescript
  if (resolved.startsWith('/events/') && resolved.length > '/events/'.length) { return resolved }
  ```

- [ ] **SPEC-REV-2: Add `mainEntityOfPage` sanitisation to Change 3.** If `event.mainEntityOfPage['@id']` resolves to a non-event path, override it with the computed `eventUrl`. Same class of bug as `potentialAction`.

- [ ] **SPEC-REV-3: Add `lib/event-calendar.ts` to RC1 affected consumers list.** Three call sites at lines 143, 160, 198. Automatically protected by Change 1 but should be documented for completeness and testing.

- [ ] **SPEC-REV-4: Document `offers.url` gap in schema as known inconsistency.** Either add `offers.url` to the schema booking URL resolution chain (matching `EventBookingButton`'s behaviour), or add an explicit "Out of scope" note explaining the inconsistency. Recommendation: add it, with the same sanitisation applied.

- [ ] **SPEC-REV-5: Revise complexity score from 2 (S) to 3 (M).** Zero existing tests for `getEventWebsitePath` or `buildEventSchema` means test scaffolding from scratch.

- [ ] **SPEC-REV-6: Hoist Set construction to module scope.** In `event-schema.ts` (Changes 2 and 3), construct `CATEGORY_PAGE_PATHS` once at module scope, not per function call. Match the existing pattern in `EventBookingButton.tsx:15`. (Only needed if the blocklist approach is retained for schema; allowlist in `event-url.ts` removes the need there.)

- [ ] **SPEC-REV-7: Update hardcoded-template inventory in Change 4.** Add: `EventsToday.tsx:15`, `WizardStep1Date.tsx:298`, `app/events/[id]/page.tsx:162`.

## IMPLEMENTATION CHANGES REQUIRED

- [ ] **IMPL-1: `lib/event-url.ts`** — Replace the `event.url` fallback in `getEventWebsitePath()` with an allowlist check: only use the resolved path if it starts with `/events/` and has a segment after the prefix. No import of `CATEGORY_ROUTES` needed.

- [ ] **IMPL-2: `lib/structured-data/event-schema.ts`** — Sanitise `bookingUrl` (and optionally `offers.url`) against category page paths. Add `mainEntityOfPage['@id']` sanitisation. Sanitise `potentialAction.target.urlTemplate`. Hoist `CATEGORY_PAGE_PATHS` to module scope.

## ASSUMPTIONS TO RESOLVE

- [ ] **ASM-1: Does the management API actually return events with empty slug/id?** → Check a few live API responses. If slug/id are always populated, the `event.url` fallback in `getEventWebsitePath` never fires. The fix is still valuable as defence-in-depth but the urgency changes.

- [ ] **ASM-2: Does the management API set `event.url` to category page URLs?** → Same check. If `event.url` is always an event detail URL, the root cause is elsewhere (perhaps in how booking buttons resolve URLs in other contexts).

## REPO CONVENTIONS TO PRESERVE

- Module-scope `Set` construction for constant sets (established in `EventBookingButton.tsx:15`)
- Type-only imports from barrel files where possible (`import type { Event } from '@/lib/api'`)
- `snake_case` for DB columns, `camelCase` for TypeScript (conversion via `fromDb`)
- CVA for component variants, not ad-hoc Tailwind conditionals
- Server Components by default; `'use client'` only for interactivity

## RE-REVIEW REQUIRED AFTER FIXES

- [ ] **RISK-001**: Re-review `getEventWebsitePath` guard after allowlist implementation — confirm it handles all edge cases (external URLs, bare strings, `/whats-on`, empty paths)
- [ ] **SPEC-002**: Re-review `event-schema.ts` after `mainEntityOfPage` fix — verify JSON-LD output
- [ ] **AB-003**: Re-review schema `offers.url` after decision on in-scope vs out-of-scope

## REVISION PROMPT

```
You are revising the category URL leakage fix spec based on an adversarial review.

Apply these changes in order:

1. Change 1: Replace blocklist with allowlist — resolved path must start with
   `/events/` and have content after the prefix. Remove CATEGORY_ROUTES import
   from event-url.ts.

2. Change 3: Add mainEntityOfPage['@id'] sanitisation alongside potentialAction.
   If @id is not an event detail URL, override with computed eventUrl.

3. Add lib/event-calendar.ts (lines 143, 160, 198) to RC1 consumer list.

4. Either add offers.url to schema booking URL resolution (matching
   EventBookingButton behaviour) or document as known inconsistency.

5. Revise complexity to 3 (M).

6. Hoist Set construction to module scope in event-schema.ts.

7. Update Change 4 template inventory: add EventsToday.tsx:15,
   WizardStep1Date.tsx:298, app/events/[id]/page.tsx:162.

Preserve these decisions:
- Fix at source (getEventWebsitePath) — correct
- Root causes RC1-RC5 — all verified
- Booking button not modified — correct
- Out-of-scope boundaries — correct

Verify these assumptions before proceeding:
- Check live API for event.url, slug, id values
- Confirm event-calendar.ts is transitively protected after Change 1
```
