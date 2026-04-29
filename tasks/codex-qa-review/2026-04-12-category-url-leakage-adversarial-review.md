# Adversarial Review: Category URL Leakage Fix

**Date:** 2026-04-12
**Mode:** Spec Compliance (Mode C)
**Engines:** Claude (3 agents) + Codex (Repo Reality Mapper)
**Scope:** `lib/event-url.ts`, `lib/structured-data/event-schema.ts`, and all consumers
**Spec:** `docs/superpowers/specs/2026-04-12-category-url-leakage-fix-design.md`

> Note: Codex Assumption Breaker did not produce output (likely token budget exhausted). Replaced with Claude agent. All other reviewers completed.

## Inspection Inventory

### Inspected
- `lib/event-url.ts` — full file, all functions
- `lib/structured-data/event-schema.ts` — full file
- `lib/event-seo-strategy.ts` — `CATEGORY_ROUTES`, `getCategoryPageUrl`, exports
- `components/EventBookingButton.tsx` — full file, normalisation pattern
- `components/events/RelatedEvents.tsx` — consumer of `getEventWebsitePath`
- `components/events/EventSecondaryActions.tsx` — consumer of `getEventWebsiteUrl`
- `app/quiz-night/page.tsx` — category page event links
- `app/sitemap.ts` — sitemap event URL generation
- `lib/api/events.ts` — `Event` interface definition
- `lib/event-calendar.ts` — missed consumer (Google Calendar, ICS)
- `lib/event-lifecycle.ts` — dependency of `event-seo-strategy.ts`
- `lib/api/index.ts` — barrel export verification
- `tests/unit/EventBookingButton.test.tsx` — existing test coverage
- `tests/unit/event-schema.test.ts` — existing test coverage
- `components/FilteredUpcomingEventsClient.tsx` — hardcoded template patterns
- `components/UpcomingEvents.tsx` — hardcoded template + inline Schema.org
- `components/NextEventServer.tsx` — hardcoded template patterns
- `components/features/BookingWizard/WizardStepPlanVisit.tsx` — hardcoded template
- `components/features/BookingWizard/WizardStep1Date.tsx` — hardcoded template (missed by spec)
- `components/EventsToday.tsx` — hardcoded template (missed by spec)
- `app/events/[id]/page.tsx` — canonical URL template (missed by spec)
- The spec document itself

### Not Inspected
- Management API source code (separate repo `OJ-AnchorManagementTools`)
- Live API response data (would require running dev server)
- `app/cash-bingo/page.tsx`, `app/live-music/page.tsx`, `app/music-bingo/page.tsx`, `app/open-mic/page.tsx`, `app/karaoke/page.tsx` — assumed same pattern as `quiz-night/page.tsx`

### Limited Visibility Warnings
- Cannot verify what the management API actually returns for `event.url`, `bookingUrl`, `mainEntityOfPage`, and `potentialAction`. All findings about API data are inferred from the code's handling patterns.

---

## Executive Summary

The spec correctly identifies the root causes and the "fix at source" principle is sound. However, four issues warrant spec revision before implementation:

1. **The blocklist approach is too narrow** — `resolvePathFromUrl()` turns ANY URL into an internal path, not just category pages. An allowlist (`/events/` prefix) is fundamentally safer.
2. **Three consumers/fields are missed** — `event-calendar.ts`, `mainEntityOfPage`, and `offers.url` in structured data.
3. **Architectural coupling** — importing `CATEGORY_ROUTES` into the low-level `event-url.ts` inverts dependency direction; extracting to a shared module is cleaner.
4. **Complexity underestimated** — zero existing test coverage for `getEventWebsitePath` or `buildEventSchema` means more scaffolding than a score-2 suggests.

---

## What Appears Solid

- **Root cause identification** — All five root causes (RC1-RC5) are accurate. Line numbers match reality.
- **Fix-at-source principle** — Guarding `getEventWebsitePath()` to protect all 10+ consumers is the right approach vs. patching each individually.
- **Category page enumeration** — All 6 category pages verified as consumers.
- **Booking button analysis** — Correctly identified as already fixed and not needing changes.
- **Schema.org `potentialAction` passthrough** — Real vulnerability correctly identified.
- **Out-of-scope boundaries** — Correctly excludes management API changes and category page layouts.

---

## Critical Risks

### RISK-001: Blocklist guard is too narrow (HIGH)

**Flagged by:** Codex Repo Reality Mapper, Claude Assumption Breaker (AB-001, AB-006)  
**Evidence:** `resolvePathFromUrl()` at `lib/event-url.ts:13-29` uses `new URL(urlValue, WEBSITE_ORIGIN)` which succeeds for ANY string, then returns just `.pathname`. Examples:
- `https://tickets.example.com/event/123` → `/event/123` (external URL becomes bogus internal path)
- `https://www.the-anchor.pub/whats-on` → `/whats-on` (not in CATEGORY_ROUTES, passes guard)
- `summer-quiz` (bare string) → `/summer-quiz` (treated as root-level path)

The spec's guard only rejects 6 known category paths. Any other non-event path passes through silently.

**Recommendation:** Replace the blocklist with a positive check: if the resolved path does not start with `/events/`, reject it. This eliminates the entire class of problem — category pages, `/whats-on`, external URLs, and bare strings all get caught in one rule.

---

## Spec Defects

### SPEC-001: `event-calendar.ts` omitted from consumer audit (MEDIUM)

**Flagged by:** Codex Repo Reality Mapper, Claude Assumption Breaker (AB-002), Spec Trace Auditor  
`lib/event-calendar.ts` calls `getEventWebsiteUrl()` at lines 143, 160, and 198 for Google Calendar links, ICS `URL:` fields, and "More info" descriptions. Change 1 transitively fixes it, but the spec's RC1 consumer list is incomplete.

### SPEC-002: `mainEntityOfPage` unaddressed in schema changes (MEDIUM)

**Flagged by:** Claude Assumption Breaker (AB-004), Spec Trace Auditor  
Line 122 of `event-schema.ts` passes `event.mainEntityOfPage` unchanged into JSON-LD. The `@id` field could contain a category page URL. The spec fixes `bookingUrl` (Change 2) and `potentialAction` (Change 3) but not `mainEntityOfPage`.

### SPEC-003: `offers.url` not resolved in schema builder (MEDIUM)

**Flagged by:** Claude Assumption Breaker (AB-003), Codex Repo Reality Mapper  
`EventBookingButton` checks both `event.bookingUrl` AND `event.offers?.url`. The schema builder only uses `event.bookingUrl || eventUrl`, ignoring `offers.url` entirely. If the API provides a legitimate external booking URL only in `offers.url`, the schema won't reflect it.

### SPEC-004: Hardcoded-template inventory incomplete (LOW)

**Flagged by:** Spec Trace Auditor  
Change 4 lists 5 files using hardcoded templates. Missing: `EventsToday.tsx:15`, `WizardStep1Date.tsx:298`, `app/events/[id]/page.tsx:162`.

### SPEC-005: Complexity score underestimated (LOW)

**Flagged by:** Claude Assumption Breaker (AB-005)  
Zero existing tests for `getEventWebsitePath` or `buildEventSchema`. Creating test scaffolding, fixtures, and 9+ test cases from scratch is closer to complexity 3 (M).

---

## Architecture & Integration Defects

### ARCH-001: Dependency direction inversion (MEDIUM)

**Flagged by:** Integration Reviewer (Finding 1), Codex Repo Reality Mapper  
Importing `CATEGORY_ROUTES` from `event-seo-strategy.ts` into `event-url.ts` pulls a low-level utility into the domain layer. Every consumer of `event-url.ts` (13+ files) now transitively depends on `event-seo-strategy.ts` → `event-lifecycle.ts`.

**Recommendation:** If using the blocklist approach: extract `CATEGORY_ROUTES` to `lib/category-routes.ts`. If using the allowlist approach (RISK-001): no import needed at all — just check for `/events/` prefix.

### ARCH-002: Duplicated category filtering in 3 locations (MEDIUM)

**Flagged by:** Integration Reviewer (Finding 2)  
After the fix, category filtering would exist in `event-url.ts` (new), `event-schema.ts` (new), and `EventBookingButton.tsx` (existing) — three independent implementations.

### ARCH-003: `Set` construction per call, not module scope (LOW)

**Flagged by:** Integration Reviewer (Finding 3), Spec Trace Auditor  
The spec creates `new Set(Object.values(CATEGORY_ROUTES))` inside each function call. `EventBookingButton.tsx` already demonstrates the correct pattern: hoist to module scope.

---

## Workflow & Failure-Path Defects

### FLOW-001: Fallback to `/events` is a listing page, not an event page (LOW)

When `getEventWebsitePath` rejects a bad path, it falls through to `/events` — the events listing page. This is acceptable (user sees all events) but not ideal (they lose the specific event context). This is the existing fallback behaviour and the spec doesn't change it.

---

## Unproven Assumptions

| Assumption | What would confirm it | Risk if wrong |
|---|---|---|
| The management API returns events with empty slug/id | Check live API responses | If slug/id are always populated, the `event.url` fallback never fires and the bug is theoretical |
| The management API sets `event.url` to category page URLs | Check live API responses or management app code | If it doesn't, RC1 is not a real-world trigger |
| `CATEGORY_ROUTES` is kept in sync with actual category pages | Check if any page exists under a route not in the map | Silent filter failure for unmapped routes |

---

## Recommended Fix Order

1. **Decide: allowlist vs blocklist** (RISK-001) — this changes the implementation of Change 1 fundamentally
2. **Update Change 1** in `event-url.ts` based on decision
3. **Add `mainEntityOfPage` sanitisation** to Change 3 scope (SPEC-002)
4. **Decide on `offers.url`** for schema — in scope or documented out-of-scope (SPEC-003)
5. **Implement Changes 2-3** in `event-schema.ts`
6. **Write tests** — budget for scaffolding from scratch
7. **Update consumer list** and template inventory (SPEC-001, SPEC-004)

---

## Follow-Up Review Required

- After allowlist/blocklist decision: re-review `getEventWebsitePath` guard logic
- After `mainEntityOfPage` fix: verify Schema.org JSON-LD output in page source
- After tests written: verify empty-string edge cases explicitly covered
