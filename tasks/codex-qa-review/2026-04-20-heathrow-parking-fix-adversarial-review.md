# Adversarial Review: Heathrow Parking Availability Fix & Wizard Priority

**Date:** 2026-04-20
**Mode:** A (Adversarial Challenge)
**Scope:** Spec review — `docs/superpowers/specs/2026-04-20-heathrow-parking-availability-fix-and-wizard-priority.md`
**Pack:** `tasks/codex-qa-review/2026-04-20-heathrow-parking-fix-review-pack.md`
**Reviewers:** Assumption Breaker, Integration & Architecture, Security & Data Risk

## Executive Summary

The spec correctly traces a plausible 403 path through the pub proxy to the management tools permission gate, and the wizard move is architecturally sound. However, the data-fix plan is dangerously underspecified for a production authorization change: it lacks exact key identification, doesn't verify the full permission set needed for the booking flow, and provides no idempotent SQL, rollback guidance, or safe verification procedure. The wizard move is low-risk.

## What Appears Solid

- The FORBIDDEN trace path is architecturally correct: pub proxy → API client → management `withApiAuth` → permission check → 403 → mapped message
- The wizard section move preserves the `#book-parking` anchor contract with hero CTAs — no link updates needed
- The fix correctly uses a narrow permission (`parking:availability`) rather than wildcard access
- The server-side API-key pattern is preserved — no client-side credential exposure from the UI change
- The verification plan includes responsive checks and full booking-flow smoke test

## Critical Risks

### 1. Root cause not yet confirmed (AB-001) — High severity

The spec treats missing `parking:availability` as the confirmed root cause based on code analysis alone. However, the 403 could also stem from: inactive key, expired key, wrong-environment key, or rate limit service failure. The code shows these would produce different error codes (UNAUTHORIZED, RATE_LIMIT_EXCEEDED), but this hasn't been verified against the live system.

**Resolution:** Query the live `api_keys` table to confirm the pub key is active, unexpired, and its permissions array specifically lacks `parking:availability`.

### 2. Full permission audit missing (AB-003, ARCH-001) — High severity

The spec fixes only `parking:availability` but claims full booking-flow success. The `ParkingBookingWizard` likely calls multiple management endpoints (rates, booking creation, payment). If those require separate permissions the key also lacks, users pass availability then fail later — worse UX than the current total block.

**Resolution:** Trace every API call the `ParkingBookingWizard` makes and verify each corresponding management endpoint's required permission exists on the pub key.

### 3. Data-fix SQL underspecified (AB-004, ARCH-002, SEC-001, SEC-002) — High severity

The spec provides no executable SQL, no target-row predicates beyond "the active key", no idempotent append logic, and no rollback. For a production auth-boundary change this is insufficient.

**Risks:**
- Operator updates wrong key → unintended permission grant
- Operator overwrites array → loses existing permissions
- No rollback path if something breaks

**Resolution:** Spec must include: preflight SELECT, idempotent JSONB append, exact WHERE clause using key name/fingerprint, expected row count assertion, and rollback SQL.

## Implementation Defects

### 4. Verification doesn't test the full integration path (ARCH-003) — Medium severity

Verification step 1 tests the management API directly with the key. This skips the pub website proxy layer where different ANCHOR_API_KEY values, stale env vars, or Vercel deployment state could still cause failures.

**Resolution:** Add explicit verification of the deployed pub website's `/api/parking/availability` endpoint (no API key sent — the proxy supplies it server-side).

### 5. Terminal pages not regression-tested (ARCH-004) — Low severity

The spec says terminal pages are unaffected but doesn't verify whether they use the `ParkingBookingWizard` component or availability API.

**Resolution:** Check `/heathrow-parking/[terminal]` pages for wizard/availability usage; include in smoke test if present.

## Architecture & Integration Defects

### 6. Caching may delay fix propagation (AB-005) — Medium severity

The management tools API response includes `Cache-Control: public, max-age=60, stale-while-revalidate=120`. A cached 403 response at the CDN or Vercel edge could persist for up to 3 minutes after the permission fix.

**Resolution:** Document expected cache TTL and whether a Vercel cache purge or redeployment is needed. Check if error responses are cached differently.

## Security & Data Risks

### 7. API key exposure during verification (SEC-003) — Medium severity

Verification step instructs calling the endpoint "with the pub's API key" without guidance on secret handling. Risk of key appearing in terminal history, screenshots, or PR notes.

**Resolution:** Verification should use environment variables (`$ANCHOR_API_KEY`), avoid echoing headers, and note that the key should not appear in any written artefact.

## Unproven Assumptions

| Assumption | What would confirm/deny |
|---|---|
| The pub key is active and valid (not expired/inactive) | `SELECT id, name, is_active, expires_at, permissions FROM api_keys WHERE key_hash = hash('$ANCHOR_API_KEY')` |
| Only `parking:availability` is missing (not other parking perms) | Compare wizard's API calls with key's current permissions |
| Cached 403 won't persist after fix | Check management API cache headers for error responses |
| Terminal pages don't use the wizard | Grep terminal page imports for ParkingBookingWizard |

## Recommended Fix Order

1. **Query live API key** — confirm root cause before any changes
2. **Audit full permission set** — identify ALL missing permissions in one pass
3. **Write idempotent SQL** — with exact predicates, preview, and rollback
4. **Apply data fix** — single transaction
5. **Verify management API** — direct call returns 200
6. **Verify deployed pub site** — public availability endpoint works
7. **Move wizard in page.tsx** — code change
8. **Responsive + anchor link check** — visual regression
9. **Full booking flow smoke test** — end-to-end

## Minor Observations

- The spec complexity score (S/2) is appropriate for the scope
- SEO content reordering risk is correctly assessed as negligible
- The "What Is NOT Changing" section effectively bounds scope
