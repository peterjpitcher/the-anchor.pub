# API Integration Review — Design Spec
**Date:** 2026-03-18
**Project:** OJ-The-Anchor.pub
**Scope:** Audit of API usage between the website (OJ-The-Anchor.pub) and the management app (OJ-AnchorManagementTools), plus implementation plan for all findings.

---

## Background

The Anchor website is a stateless marketing and booking site. It has no database of its own. All data — opening hours, bookings, events, menus — lives in the management app (Supabase) and is accessed via a REST API at `management.orangejelly.co.uk`.

The website uses a proxy pattern: all API calls go through Next.js API routes (`app/api/*`) to keep `ANCHOR_API_KEY` server-side. Client components never call the management API directly.

This review was triggered by a live bug: Sunday lunch could be booked on 22 March 2026 even though the kitchen was closed in the management app for that date.

---

## Audit Findings

### Critical

#### C1 — Party size mismatch (silent 400s)
- **Website proxy** (`app/api/table-bookings/route.ts`): validates `party_size` as 1–50
- **Management API**: validates `party_size` as 1–20
- **Effect:** Bookings with party_size 21–50 pass website validation, get forwarded, and return a raw unhandled 400 from the management API. Customers see a generic error with no useful message.
- **Fix:** Align website validation to 1–20 in the proxy route.

#### C2 — `currentStatus.services` type mismatch (Sunday lunch data silently dropped)
There are **two distinct `services` locations** in the website's `BusinessHours` type (`lib/api.ts`):

**Location 1 — `currentStatus.services` (lines 541–554) — this is the broken one:**
```typescript
// CURRENT (wrong)
services?: {
  venue: { open: boolean; closesIn: string | null }
  kitchen: { open: boolean; closesIn: string | null }
  bookings: { accepting: boolean; availableSlots: string[] }  // ← does not exist on API
}
// `sundayLunch` is absent here
```
The management API actually returns:
```typescript
// ACTUAL API RESPONSE
services?: {
  venue: { open: boolean; closesIn: string | null }
  kitchen: { open: boolean; closesIn: string | null }
  sundayLunch: {           // ← missing from website type
    enabled: boolean
    startsAt: string | null
    endsAt: string | null
    capacity: number | null
    message: string | null
  }
}
```

**Location 2 — top-level `services` (lines 589–619) — this one has `sundayLunch`** but with a different shape (slots array, lastOrderTime etc.) and is not the field consumed by availability logic.

The fix targets **Location 1** (`currentStatus.services`): remove the phantom `bookings` field, add `sundayLunch` with the correct shape from the management API. This is the field consumed by `resolveServiceRanges()` to determine whether Sunday lunch is available.

- **Effect:** Sunday lunch service window data is silently ignored. The website falls back to local hours computation which does not account for per-date kitchen closures.
- **Fix:** Correct `currentStatus.services` type in `lib/api.ts`. Update `resolveServiceRanges()` in `lib/table-booking-service-windows.ts` to gate Sunday lunch on `sundayLunch.enabled` from the API response.

#### C5 — Sunday lunch bookable on kitchen-closed dates (live bug)
- **Symptom:** Sunday 22 March 2026 has `is_kitchen_closed: true` in the management app. The book-table wizard still offered Sunday lunch slots.
- **Root cause:** C2. Because `currentStatus.services.sundayLunch` is not typed or consumed, `resolveServiceRanges()` ignores the management API's per-date kitchen closure signal and falls back to regular Sunday hours, which show kitchen as open.
- **Secondary cause (C6-b):** `BookingDatePicker` fetches business hours once on component mount (`useEffect` → `getBusinessHours()`, stored in `useState`). If a kitchen closure is entered after the page loads, the component never re-fetches and continues showing Sunday lunch slots for the stale hours data.
- **Fix (two parts):**
  1. Fix C2 — correct the type and consume `sundayLunch.enabled` in availability logic
  2. Fix `BookingDatePicker` to re-fetch hours when the selected date changes (not only on mount), so per-date special hours are always fresh

#### C6 — Business hours caching: two concrete offenders in the booking path
The proxy route is correctly `force-dynamic` with `Cache-Control: no-store`. However, two callers in the website introduce stale windows:

**C6-a — `lib/schema-with-reviews.ts` (low risk):**
- Uses `unstable_cache` with `revalidate: 3600` around `anchorAPI.getBusinessHours()` (lines 8–25 and 31–113)
- Used only for Schema.org markup, not booking decisions
- Low risk but still means SEO-facing hours can lag by up to 1 hour

**C6-b — `BookingDatePicker.tsx` (high risk — in the live booking flow):**
- Fetches business hours once on mount via `getBusinessHours()`, stores in `useState`
- Hours are never re-fetched during the component's lifetime
- A kitchen closure entered after the page loads is invisible to the component until hard refresh
- This is a direct contributing cause of the C5 bug

**Fix:**
- C6-a: Accept as low risk or increase revalidation frequency (e.g. 300s for schema data)
- C6-b: Add `selectedDate` as a dependency to the hours-fetch `useEffect`, so hours re-fetch whenever the user changes their date selection

---

### Medium

#### M1 — Availability computation duplicated between website and management API
- The website's `app/api/table-bookings/availability/route.ts` is the **website's own** availability endpoint, consumed by `AvailabilityChecker` via `anchorAPI.checkTableAvailability()`. It computes slots locally by fetching business hours and running `resolveServiceRanges()`.
- The management API has its own `GET /table-bookings/availability` endpoint that the website **never calls**. The website's availability proxy does not pass through to this endpoint.
- **Risk:** Two independent availability computations can diverge silently. A capacity rule or time window change in the management API's logic would not be reflected on the website.
- **Decision:** Either (a) delete the management API's availability endpoint (if it's not used elsewhere), or (b) migrate the website's availability computation to call the management API's endpoint, eliminating the duplication. Option (b) is recommended — availability logic should live in one place.

#### M2 — `hold_expires_at` not surfaced to customers
- When `state: 'pending_payment'`, the management API returns `hold_expires_at` (ISO 8601).
- The website does not display this countdown to customers.
- **Effect:** Customers don't know how long they have to complete payment; slots lapse silently, causing customer frustration.
- **Fix:** Display `hold_expires_at` as a countdown timer in the PayPal payment step of the booking wizard.

#### M3 — Event booking POLICY_VIOLATION redirect hardcoded
- When an event booking returns `409 Conflict`, the website catches it and redirects to a hardcoded Mothers Day booking URL.
- **Effect:** Any future policy violation on a different event silently redirects customers to the wrong place.
- **Fix:** Remove the hardcoded redirect. Surface the descriptive error message from the 409 response body inline in the booking form.

---

### Improvements

#### I1 — `lib/api.ts` is 2,858 lines
- A single file covering events, menus, table bookings, parking, and business hours.
- **Fix:** Split into domain modules: `lib/api/events.ts`, `lib/api/menu.ts`, `lib/api/bookings.ts`, `lib/api/parking.ts`, `lib/api/hours.ts`. Re-export from `lib/api/index.ts` to preserve all existing imports without changes at call sites.

#### I2 — No shared TypeScript contract
- Both apps define their own interfaces for the same data shapes independently.
- C2 is a direct consequence: the website's type drifted from the management API's actual response.
- **Fix:** Extract `types/management-api.ts` in the website repo that accurately mirrors the management API response shapes. All proxy routes and `lib/api.ts` consumers reference this file. Future API changes require updating this one file.

#### I3 — Legacy payload normalization
- The table booking and private booking proxy routes contain normalization for old payload shapes.
- **Fix:** Confirm whether any old clients still send the old shapes. If not, remove the normalization code.

#### I4 — Inconsistent error response shapes across proxy routes
- Some routes return `{ error: string }`, others `{ success: false, error: { code, message } }`.
- **Fix:** Standardise all proxy routes to `{ success: false, error: { code: string, message: string } }` to match the management API's error format.

---

## Architecture: No Changes Required

The proxy pattern is correct and well-suited to this use case. The management API auth model (server-side `ANCHOR_API_KEY`, never exposed to client) is sound. No structural changes are proposed — all fixes are within the existing pattern.

---

## Phasing

### Phase 1 — Critical fixes

| Priority | Finding | Description |
|----------|---------|-------------|
| 1 | C5 + C2 | Fix Sunday lunch booking on kitchen-closed dates — highest priority live bug |
| 2 | C6-b | Fix `BookingDatePicker` to re-fetch hours on date change |
| 3 | C1 | Align party size validation to 1–20 in the proxy route |
| 4 | C6-a | Assess schema-with-reviews.ts revalidation window |

### Phase 2 — Medium + improvements

| Priority | Finding | Description |
|----------|---------|-------------|
| 1 | I1 | Split `lib/api.ts` into domain modules (prerequisite for I2) |
| 2 | I2 | Extract `types/management-api.ts` — single contract for all API shapes |
| 3 | M2 | Display `hold_expires_at` countdown in payment step |
| 4 | M3 | Remove hardcoded POLICY_VIOLATION redirect |
| 5 | M1 | Decide: migrate availability to management API endpoint or document divergence as accepted risk |
| 6 | I3 | Remove legacy payload normalization (confirm no old clients first) |
| 7 | I4 | Standardise error response shapes across proxy routes |

---

## Success Criteria

- Sunday lunch cannot be booked on any date where `is_kitchen_closed: true` or `kitchen: null` in the management app
- `BookingDatePicker` re-fetches business hours when the selected date changes, not only on mount
- Party sizes above 20 produce a clear, user-facing validation message before the request reaches the management API
- No booking-path component holds business hours in stale React state across date changes
- `lib/api.ts` split into domain modules with no broken imports
- A single `types/management-api.ts` contract replaces all ad-hoc inline interfaces for management API shapes
- `hold_expires_at` countdown is visible to customers during the payment step
- POLICY_VIOLATION (409) on event bookings surfaces the API error message inline instead of redirecting
- M1 decision documented: either migration complete or divergence accepted and recorded

---

## Key Constraints

- `kitchen: null` is a deliberate closure signal — always use `??` not `||` (see March 2026 bug history in CLAUDE.md)
- `is_kitchen_closed: true` is the primary closure flag; `kitchen: null` is defence-in-depth — check both
- Sunday lunch requires kitchen open AND `sundayLunch.enabled === true` from `currentStatus.services`
- The `currentStatus.services` type fix targets **Location 1** (inside `currentStatus`, lines 541–554 of `lib/api.ts`) — not the top-level `services` field at lines 589–619
- The booking wizard must always read fresh business hours — no revalidation window on booking-critical paths
- Client components in the booking flow must not hold business hours in React state across date selection changes; re-fetch per date
- `ANCHOR_API_KEY` must never be exposed to client components
