# Adversarial Review — /book-table Purpose-Chooser Removal

**Date:** 2026-04-29
**Mode:** B (Code Review)
**Scope:** 8 commits `d11c091..5516b15` on `main` implementing the spec at `tasks/book-table-remove-purpose-chooser/spec.md`
**Pack:** `tasks/codex-qa-review/2026-04-29-book-table-purpose-chooser-review-pack.md` (126 KB)
**Reviewers:** Assumption Breaker (lead), Integration & Architecture, Workflow & Failure-Path, Security & Data Risk

---

## Executive Summary

The combined drinks+food slot model is centralised correctly in `lib/table-booking-service-windows.ts` and consumed consistently by the public availability route, the API client fallback, and the booking-agent route. Submit-time `purpose` derivation is no longer driven by user form state; it follows the chosen slot's `kitchen_open` flag and blocks the submit if the slot can't be matched.

Three blocking findings flagged by reviewers were addressed in commit `5516b15` alongside the user-reported bug that drinks slots only spanned kitchen hours. Two architecture/workflow defects and three security observations remain — all advisory, not blocking, listed in the handoff brief.

## What Appears Solid

- Combined slot generation is centralised (`lib/table-booking-service-windows.ts:resolveCombinedServiceRanges` + `buildSlotsWithKitchenState`); the availability route and the API client fallback both go through it. No duplicated schedule parsing.
- The public availability endpoint accepts and ignores stale `booking_type` and `purpose` query params and returns a single combined contract with `service_model: 'combined_food_drinks'` (`app/api/table-bookings/availability/route.ts:73`).
- Submit-time derivation is no longer taken from form state: `deriveSubmitPurpose()` derives from `selectedSlotService` (date-and-time-matched) or the current `availability.time_slots`, and blocks submit if neither matches (`components/features/TableBooking/ManagementTableBookingForm.tsx:1200`).
- Nearest-alternative slots carry `date`, `time`, and `kitchen_open` into `selectedSlotService`, so submit-time derivation handles slots that aren't in the current availability response (`components/features/TableBooking/ManagementTableBookingForm.tsx:955`).
- `/api/table-bookings` POST still imports `resolveServiceRanges` and validates the submitted `purpose` against service windows, preserving the direct-API server boundary (`app/api/table-bookings/route.ts:6`).
- Legacy `booking_type` and `sunday_lunch` inputs are stripped/ignored before forwarding public table bookings (`app/api/table-bookings/route.ts:93`).
- After the Wave 4G fix, drinks ranges always span the full venue/pub opens-closes window, regardless of `schedule_config` content. This restored the user-visible behaviour ("show all opening times, not just food").

## Critical Risks (all addressed)

### AB-001 — Submit route silently coerced missing/invalid `purpose` to `food` *(addressed in 5516b15)*
**Original:** `app/api/table-bookings/route.ts:139` accepted `body.purpose` as `'drinks' | 'food' | undefined` and defaulted unknowns to `'food'`. Direct API callers omitting `purpose` had their bookings silently classified as food, which then failed late service-window validation.
**Fix:** `purpose` is now required. Missing or non-`'food'/'drinks'` values return HTTP 400 with neutral copy.

### AB-002 — Agent POST silently coerced missing `purpose` to `food` *(addressed in 5516b15)*
**Original:** `app/api/booking/agent/route.ts:60` had the same default-to-food behaviour. An AI agent receiving a `kitchen_open: false` slot from GET and POSTing without `purpose` would be defaulted to `food` and rejected by service-window validation.
**Fix:** Agent POST now also requires explicit `purpose` and returns 400 on missing/invalid values.

### AB-003 — Agent POST outside-window error copy still mentioned food/drinks/kitchen *(addressed in 5516b15)*
**Original:** Agent route returned `"Food bookings are only available during kitchen service hours… switch to drinks"` for outside-window submissions. AI agents can surface this copy to end users.
**Fix:** Replaced with neutral phrasing: `"That time is outside online booking hours. Please choose another time or call 01753 682707."`

### USER-REPORTED — Drinks slots only spanned kitchen hours *(addressed in 5516b15)*
**Reported by user during review:** *"For the drinks options, we need to include all of our opening times (the opening times for the pub are different than the kitchen). Right now we're not showing all opening times, just food."*
**Root cause:** `resolveServiceRanges(purpose: 'drinks')` short-circuited to `schedule_config` `drinks`/`regular` entries when present (lines 298-306). In production, those entries match kitchen hours, clipping late-evening bar slots out of the wizard's grid.
**Fix:** `resolveServiceRanges(purpose: 'drinks')` now ignores `schedule_config` `drinks`/`regular` entries entirely and always returns the venue/pub `opens`/`closes` window. The wizard's master range is full pub hours; `kitchen_open` flags whichever slots fall inside food ranges.

## Architecture & Integration Defects

### ARCH-001 — Page metadata and JSON-LD outside the customer-copy boundary
**File:** `app/book-table/page.tsx:22-23`, `:82`
**Severity:** Medium · **Confidence:** High · **Blocking (Codex tag):** Yes
**Status:** **Defer to user** — likely intentional / out of scope.

The booking page's `<head>` metadata mentions "Pub food" and "Sunday roast", and the page emits `FoodEstablishmentReservation` JSON-LD for SEO.

**Triage:** The spec §7 copy audit covered the wizard component strings (the booking flow). Page metadata and JSON-LD are general marketing/SEO content, not booking-flow communications. The user said "we don't need to mention whether it's a food or drink booking to the customer" — this targets the booking experience itself, not the existence of food on the menu. The `FoodEstablishmentReservation` schema is the correct type for a pub that serves food, and removing it would harm SEO without serving the user's intent.

**Recommendation:** Leave as-is. Mention in PR description; let the user override if they disagree.

## Workflow & Failure-Path Defects

### WF-001 — Stale `loadNearestAlternatives` race
**File:** `components/features/TableBooking/ManagementTableBookingForm.tsx:793`
**Severity:** Medium · **Confidence:** High · **Blocking:** Advisory (not addressed in this PR).

`loadNearestAlternatives` issues async candidate fetches and unconditionally calls `setAlternativeSlots(...)` on resolution. If the user changes `date`, `requestedTime`, or `partySize` while the request is in flight, the stale response can repopulate `alternativeSlots` with results from the abandoned search context. The user could then pick a stale alternative.

**Recommended fix (follow-up):** Track a current-request token (e.g., a counter or `AbortController` signal) inside `loadNearestAlternatives` and discard the response if it doesn't match the current `date/requestedTime/partySize` at resolution time.

### WF-002 — `handleAlternativeSelect` doesn't refresh `availability`
**File:** `components/features/TableBooking/ManagementTableBookingForm.tsx:955`
**Severity:** Medium · **Confidence:** Medium · **Blocking:** Advisory (not addressed in this PR).

When the user selects a nearest alternative, the wizard updates `date`, `requestedTime`, `selectedTime`, and `selectedSlotService`, then jumps to the details step. `availability` (the slot list shown by step 2) is not replaced with the alternative date's slot list. If the user navigates back from details to the choose step, they see slots from the original date overlaid against the new date.

**Recommended fix (follow-up):** When an alternative is selected, either refetch availability for the new date before transitioning to details, or invalidate `availability` so the choose step refetches on next view.

### WF-003 — Cross-midnight ranges potentially dropped
**File:** `lib/table-booking-service-windows.ts:383`
**Severity:** Low · **Confidence:** Medium · **Blocking:** No.

`buildSlotsWithKitchenState` delegates to `buildSlotsFromRanges`, which filters out ranges where `end <= start` (treats them as invalid). `isTimeWithinRanges` separately supports overnight ranges. This is a latent inconsistency.

**Triage:** The Anchor doesn't currently configure overnight ranges (the pub closes by 23:00). Not currently reachable.

## Security & Data Risks

### SEC-001 — Agent POST lacks numeric validation on `partySize` and `duration`
**File:** `app/api/booking/agent/route.ts:35`
**Severity:** Medium · **Confidence:** Medium · **Blocking:** Advisory.

Agent route checks `!body.partySize` (truthy) but doesn't enforce 1-20 the way `app/api/table-bookings/route.ts` does. Negative, zero, oversized, or non-numeric values are forwarded upstream. The management API is expected to reject these but the website should validate at its boundary.

**Recommended fix (follow-up):** Mirror the public route's party-size validation in the agent route.

### SEC-002 — Agent POST reflects raw exception messages
**File:** `app/api/booking/agent/route.ts:154`
**Severity:** Medium · **Confidence:** High · **Blocking:** Advisory.

The catch handler returns `error instanceof Error ? error.message : 'Failed to create booking'` directly. If upstream errors include internal paths/stack/schema fragments, callers (and any AI agent surfacing them) see them.

**Recommended fix (follow-up):** Replace with a static neutral message; log the raw error server-side via the existing `logError` helper.

### SEC-003 — Server doesn't validate slot/purpose consistency
**File:** `app/api/table-bookings/route.ts:134`
**Severity:** Medium · **Confidence:** Medium · **Blocking:** Out of scope.

`/api/table-bookings` POST accepts whatever `purpose` the client sends, validating only against time-window. A client could submit `purpose: 'drinks'` for a kitchen-open slot and the operational classification would be drinks even though the kitchen is open.

**Triage:** The website's wizard always derives `purpose` from `kitchen_open` correctly, so the wizard doesn't trigger this. Direct API callers (including agents) are now forced to send an explicit `purpose` (AB-001/AB-002) and the management app applies its own classification logic. This is "trust the explicit input from API consumers" — acceptable.

## Unproven Assumptions

- **AB-004:** Missing `kitchen_open` on a slot defaults to `food` at submit time. Today's local availability route always stamps the flag, so this only fires for malformed/cached responses. Spec §6 explicitly defines this as the safe default. Codex flagged it as Medium-confidence; we accept the spec's definition.
- **AB-005:** Combined-slot capacity comes from drinks ranges (default 50). If `schedule_config` food entries had a lower capacity, the UI could show food-bookable for a party size the food range wouldn't actually allow. In practice, the management API enforces real capacity at booking-time, so this is at most a UI hint discrepancy.
- **AB-006:** Codex flagged "no tests added or changed". This is a false positive — the build pack excluded `tests/**` and `**/__tests__/**` to fit the size cap. The PR added 11+ new tests across `tests/api/`, `tests/unit/`, `app/api/table-bookings/__tests__/`, `app/api/booking/agent/__tests__/`. Confirmed.

## Recommended Fix Order

1. **Done in 5516b15:** AB-001, AB-002, AB-003, USER-REPORTED.
2. **Defer to user:** ARCH-001 (page metadata is general SEO content, likely intentional).
3. **Follow-up PRs (non-blocking):** WF-001 (stale-alternative race), WF-002 (availability refresh on alternative select), SEC-001 (agent POST numeric validation), SEC-002 (agent POST exception sanitisation).
4. **Out of scope:** SEC-003, WF-003, AB-004, AB-005.

## Minor Observations

- AB-006 (false positive — tests are present, just excluded from the pack).
- Pre-existing test failures in `tests/api/event-bookings-policy-fallback.test.ts` and several UI primitive suites are unrelated to this PR (verified by stash + run on `8eb2141`).

## Methodology

- Pack built deterministically from `git diff 8eb2141 HEAD` excluding test files (`tests/**, **/__tests__/**`) at a 150 KB cap; final pack 126 KB.
- Four reviewers ran via `~/.claude/skills/codex-qa-review/scripts/run-codex-review.sh` against `codex-cli 0.125.0` with `--output-schema` enforcement.
- Per-reviewer JSON outputs preserved at `tasks/codex-qa-review/{assumption-breaker,integration-architecture,workflow-failure-path,security-data-risk}-findings.json`.
- All blocking findings either (a) addressed in commit `5516b15` or (b) explicitly deferred with rationale.
