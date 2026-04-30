# Orchestration Plan

## Plan Summary
Remove the customer-facing "Booking for" chooser from `/book-table`. Replace with per-slot kitchen-state captions. Derive the submit-time `purpose` from the chosen slot's `kitchen_open` flag. See [tasks/book-table-remove-purpose-chooser/spec.md](../spec.md) and [tasks/book-table-remove-purpose-chooser/plan.md](../plan.md) for full context.

## Work Streams

| # | Role | Wave | Depends On | Outputs |
|---|---|---|---|---|
| A | Types + Service-Window Helpers (T1+T2) | 1 | none | `lib/api/bookings.ts`, `lib/table-booking-service-windows.ts`, tests added in `tests/api/table-bookings-service-window.test.ts`, commits |
| B | Submit-Route Copy (T5) | 1 | none | `app/api/table-bookings/route.ts`, tests in `app/api/table-bookings/__tests__/route.test.ts` and/or `tests/api/table-bookings.test.ts`, commits |
| C | Availability Route + Combined Tests (T3) | 2 | A | `app/api/table-bookings/availability/route.ts`, renamed/rewritten `tests/api/table-bookings-availability-combined.test.ts`, commits |
| D | API Client Fallback Alignment (T4) | 2 | A | `lib/api/client.ts`, possibly small test additions, commits |
| E | Booking-Agent Route Update (T6) | 2 | A | `app/api/booking/agent/route.ts`, tests in `app/api/booking/agent/__tests__/route.test.ts` + `tests/api/booking-agent-service-window.test.ts`, commits |
| F | Page + Wizard Refactor (T7+T8) | 3 | A, C, D | `app/book-table/page.tsx`, `components/features/TableBooking/ManagementTableBookingForm.tsx`, `tests/unit/ManagementTableBookingForm.test.tsx`, commits |

Total agents: 6 across 3 waves. Within the 7-agent / 4-wave limit.

## Wave Structure
- **Wave 1 (sequential):** Agent A then Agent B. Independent file scopes; sequential keeps git state clean.
- **Wave 2 (sequential):** Agent C, then D, then E. All depend on A's exports.
- **Wave 3:** Agent F (single, atomic).
- **Wave 4 — Verification (orchestrator-driven):** Stage 1 lint/tsc/build/test, then Stage 2 codex-qa-review.

## Workspace
```
tasks/book-table-remove-purpose-chooser/
├── spec.md                     # Reviewed and revised by user
├── plan.md                     # Implementation plan
├── orchestration/
│   ├── plan.md                 # This file
│   ├── wave-1/
│   │   ├── A-types-helpers/handoff.md
│   │   └── B-submit-copy/handoff.md
│   ├── wave-2/
│   │   ├── C-availability-route/handoff.md
│   │   ├── D-client-fallback/handoff.md
│   │   └── E-agent-route/handoff.md
│   ├── wave-3/
│   │   └── F-page-wizard/handoff.md
│   └── verification/
│       ├── stage-1-orchestrator.md
│       └── stage-2-codex-qa-review.md
```
