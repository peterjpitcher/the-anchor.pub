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

#### C2 — `currentStatus.services` type mismatch (type correction only)
There are **two distinct `services` locations** in the website's `BusinessHours` type (`lib/api.ts`):

**Location 1 — `currentStatus.services` (lines 541–554) — wrong shape:**
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

**Location 2 — top-level `services` (lines 589–619) — already has `sundayLunch`** but with a different shape (slots array, lastOrderTime) and is not consumed by availability logic.

**Important:** `currentStatus.services.sundayLunch.enabled` is a **real-time snapshot** of the current moment — it does not reflect a future date's kitchen state. It must **not** be used to gate future-date availability in `resolveServiceRanges()`. The actual availability fix for C5 is in `resolveServiceRanges()` itself (see C5 below).

- **Effect of the type mismatch:** TypeScript provides no compile-time safety for consumers of `currentStatus.services`, and the phantom `bookings` field misleads maintainers.
- **Fix:** Correct the `currentStatus.services` type in `lib/api.ts` (Location 1) to match the actual API shape. This is a type-only change — no runtime behaviour change.

#### C5 — Sunday lunch bookable on kitchen-closed dates (live bug)
- **Symptom:** Sunday 22 March 2026 has `is_kitchen_closed: true` in the management app. The book-table wizard still offered Sunday lunch slots.
- **Root cause — `resolveServiceRanges()` does not treat `kitchen: null` on a special day as closed:**

  In `lib/table-booking-service-windows.ts` lines 240–243:
  ```typescript
  const kitchenClosed =
    specialDay?.is_kitchen_closed === true ||
    regularDay?.is_kitchen_closed === true ||
    kitchenData?.is_closed === true
  // ← MISSING: (specialDay !== undefined && kitchenData === null)
  ```
  When a special hours record has `kitchen: null` (the deliberate closure signal), `kitchenData` is `null` and `kitchenData?.is_closed` is `undefined`, so `kitchenClosed` is `false`. If that same special day has a `schedule_config` with a `sunday_lunch` entry, lines 256–259 return those ranges without ever checking whether the kitchen is closed — the closure is bypassed entirely.

- **Secondary cause (C6-b):** `BookingDatePicker` fetches business hours once on mount and holds them in `useState`. A kitchen closure entered after page load won't be seen until the page is hard-refreshed.

- **Fix — two changes:**

  **Fix 1 — `lib/table-booking-service-windows.ts`:** Add the missing `kitchen: null` check to `kitchenClosed`:
  ```typescript
  const kitchenClosed =
    specialDay?.is_kitchen_closed === true ||
    regularDay?.is_kitchen_closed === true ||
    kitchenData?.is_closed === true ||
    (specialDay !== undefined && kitchenData === null)  // ← ADD: null = deliberate closure
  ```
  This ensures that any special hours record with `kitchen: null` always results in `kitchenClosed = true`, regardless of what `schedule_config` contains.

  **Fix 2 — `BookingDatePicker.tsx`:** Add `selectedDate` as a dependency to the hours-fetch `useEffect` so hours are re-fetched each time the user picks a different date. `getBusinessHours()` calls `anchorAPI.getBusinessHours()` which uses `next: { revalidate: 0 }` — no fetch cache — and the management API's `/business/hours` endpoint is public (no API key required), so client-side re-fetching per date is safe and correct. The management API itself applies a 60-second `max-age` cache at the CDN level, meaning the practical freshness window is ≤60 seconds — acceptable for this use case.

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

- Sunday lunch cannot be booked on any date where `is_kitchen_closed: true` or `kitchen: null` in the management app — verified by unit tests for `resolveServiceRanges()` covering all three cases:
  - `specialDay.is_kitchen_closed: true` → returns empty sunday_lunch ranges
  - `specialDay.kitchen: null` → returns empty sunday_lunch ranges (the `schedule_config` bypass bug)
  - `specialDay.kitchen: null` with a `schedule_config` containing a `sunday_lunch` entry → still returns empty ranges
- `BookingDatePicker` re-fetches business hours when the selected date changes, not only on mount
- `currentStatus.services` type in `lib/api.ts` matches the management API shape (no phantom `bookings` field; `sundayLunch` present with correct fields)
- Party sizes above 20 produce a clear, user-facing validation message before the request reaches the management API
- `lib/api.ts` split into domain modules with no broken imports
- A single `types/management-api.ts` contract replaces all ad-hoc inline interfaces for management API shapes
- `hold_expires_at` countdown is visible to customers during the payment step
- POLICY_VIOLATION (409) on event bookings surfaces the API error message inline instead of redirecting
- M1 decision documented: either migration to management API availability endpoint complete, or divergence accepted and recorded

---

## Key Constraints

- `kitchen: null` is a deliberate closure signal — always use `??` not `||` (see March 2026 bug history in CLAUDE.md)
- `is_kitchen_closed: true` is the primary closure flag; `kitchen: null` is defence-in-depth — **both must be checked** in `kitchenClosed`, and the `kitchen: null` check requires `specialDay !== undefined` to distinguish "special day, kitchen explicitly null" from "no special day, regular hours"
- `currentStatus.services.sundayLunch.enabled` is a real-time snapshot — it must **not** be used to gate future-date slot availability; availability logic must derive closure state from `specialDay`/`regularDay` fields directly
- The `currentStatus.services` type fix targets **Location 1** (inside `currentStatus`, lines 541–554 of `lib/api.ts`) — not the top-level `services` field at lines 589–619
- `getBusinessHours()` when called from client components hits the management API directly (public endpoint, `next: { revalidate: 0 }`) — client-side re-fetching per date is safe
- Client components in the booking flow must not hold business hours in React state across date selection changes; re-fetch per date
- `ANCHOR_API_KEY` must never be exposed to client components
