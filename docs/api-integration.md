# API Integration Guide

This document records decisions and patterns for integrating with the management app API (`management.orangejelly.co.uk`).

---

## M1: Availability Computation — Decision Record

**Date:** 2026-03-18
**Status:** Accepted divergence

### Finding

The website computes table booking availability locally by:
1. Fetching business hours from `GET /business/hours` (management API)
2. Running `resolveServiceRanges()` locally to generate available time slots

The management API has its own `GET /table-bookings/availability` endpoint that the website never calls. This creates two independent availability computations that can diverge silently.

### Options Considered

- **(a)** Delete the management API's availability endpoint if unused
- **(b)** Migrate website to call the management API's endpoint (eliminating duplication) — recommended in original review
- **(c)** Accept local computation as canonical and document the divergence risk

### Decision

**Accept local computation (option c) for now.**

### Rationale

- The website's local availability logic is well-tested (`tests/api/table-bookings-service-window.test.ts`)
- Both computations share the same source of truth: the `GET /business/hours` endpoint
- Migrating to the management API endpoint would require significant rework of `app/api/table-bookings/availability/route.ts` with limited immediate benefit
- The management API's availability endpoint has no known consumers beyond local use in the management app itself
- The risk of divergence is low because the management API feeds the same `business_hours` data that the website's local logic consumes

### Accepted Risk

**If the management app changes its availability logic** (e.g. adds new booking constraints, time-window rules, capacity limits, or payment requirements), **the website will not automatically pick up those changes**. The website's local computation would continue to generate availability based only on business hours and service window rules.

### Coordination Requirement

**Any change to availability business logic in `OJ-AnchorManagementTools` that affects booking time windows or capacity must be coordinated and applied to both applications simultaneously.**

Changes must be reflected in:
- **Website:** `lib/table-booking-service-windows.ts` (`resolveServiceRanges()`)
- **Website:** `app/api/table-bookings/availability/route.ts`

### Implementation Details

**Website availability computation:**
- Route: `app/api/table-bookings/availability/route.ts`
- Fetches: `GET /business/hours` (includes special hours overrides per date)
- Logic: `resolveServiceRanges()` converts business hours into bookable time slots
- Respects: kitchen closure (blocks food/sunday_lunch), booking types, duration constraints

**Management app availability endpoint (unused by website):**
- Route: `GET /table-bookings/availability`
- Consumer: management app internal UI only (for now)
- Status: May need verification that this is still true if management app changes

---

## References

- Management API base: `https://management.orangejelly.co.uk`
- Website API client: `lib/api.ts`
- Availability logic: `lib/table-booking-service-windows.ts`
- Hours utilities: `lib/hours-utils.ts`
- Tests: `tests/api/table-bookings-service-window.test.ts`
