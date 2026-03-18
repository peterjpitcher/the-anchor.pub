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
- **Fix:** Align website validation to 1–20.

#### C2 — `currentStatus.services` type mismatch (Sunday lunch service data silently dropped)
- **Management API returns:** `currentStatus.services.sundayLunch` with fields `enabled`, `startsAt`, `endsAt`, `capacity`, `message`
- **Website `BusinessHours` type defines:** `services?: { venue, kitchen, bookings }` — `sundayLunch` is absent, `bookings` does not exist on the API
- **Effect:** Sunday lunch service window data from the management API is silently ignored. The website falls back to its own local computation, which does not account for per-date kitchen closures.
- **Fix:** Update `BusinessHours` type to match actual API response. Remove the phantom `bookings` field. Consume `sundayLunch` service data in `resolveServiceRanges()`.

#### C3 — Deprecated private booking endpoint (hard sunset: 30 Sep 2026)
- **Website calls:** `POST /api/private-booking-enquiry`
- **Management API response headers:** `Deprecation: true`, `Sunset: Wed, 30 Sep 2026 00:00:00 GMT`
- **Effect:** Website will break on or after 30 September 2026 with no warning.
- **Fix:** Migrate to the successor endpoint before sunset.

#### C4 — Incomplete `blocked_reason` handling
- **Management API returns** 8 possible `blocked_reason` values: `outside_hours | cut_off | no_table | private_booking_blocked | too_large_party | customer_conflict | in_past | blocked`
- **Effect:** Unhandled reasons produce a generic error message rather than a contextually useful one (e.g. "the party is too large" vs "we're closed at that time").
- **Fix:** Map all 8 values to specific user-facing messages in the booking flow.

#### C5 — Sunday lunch bookable on kitchen-closed dates (live bug)
- **Symptom:** Sunday 22 March 2026 has `is_kitchen_closed: true` in the management app, but the book-table wizard still offered Sunday lunch slots.
- **Root cause:** C2. Because `currentStatus.services.sundayLunch` is not typed or consumed, the website's local `resolveServiceRanges()` computation ignores the management API's per-date kitchen closure signal. It falls back to regular Sunday hours, which show kitchen as open.
- **Fix:** Fix C2 first (type + consumption), then verify `resolveServiceRanges()` correctly gates Sunday lunch on kitchen open status for the requested date. The special hours `is_kitchen_closed` flag and `kitchen: null` signal must both be respected (use `??` not `||` — see March 2026 bug history in CLAUDE.md).

#### C6 — Business hours caching audit
- **Website proxy:** `force-dynamic`, `Cache-Control: no-store` — correct, always fetches fresh.
- **Risk:** Individual page components or `lib/api.ts` callers may cache or memoize business hours independently (e.g. via `next: { revalidate }` on `fetch()` calls), meaning a kitchen closure entered in the management app could take minutes to surface on the website.
- **Fix:** Audit all callers of `anchorAPI.getBusinessHours()` and any `fetch('/api/business/hours')` calls. Ensure none add a revalidation window. Booking-critical paths must always read fresh data.

---

### Medium

#### M1 — Availability endpoint proxied but unused
- `app/api/table-bookings/availability/route.ts` proxies the management API's availability endpoint.
- The booking wizard never calls it — it fetches business hours and computes slots locally via `resolveServiceRanges()`.
- **Risk:** The two availability computations may diverge silently over time.
- **Decision required:** Either delete the unused proxy, or migrate the booking wizard to use the management API's availability endpoint directly. Recommend: migrate, so availability logic lives in one place.

#### M2 — `hold_expires_at` not surfaced to customers
- When `state: 'pending_payment'`, the management API returns `hold_expires_at` (ISO 8601).
- The website does not display this countdown.
- **Effect:** Customers don't know how long they have to complete payment; slots lapse silently.
- **Fix:** Display `hold_expires_at` as a countdown in the PayPal payment step.

#### M3 — Event booking POLICY_VIOLATION redirect hardcoded
- When an event booking returns `409 Conflict`, the website redirects to a hardcoded Mothers Day booking URL.
- **Effect:** Any future policy violation on a different event silently redirects customers to the wrong place.
- **Fix:** Remove the hardcoded redirect. Return a descriptive error message from the 409 response body and display it inline.

---

### Improvements

#### I1 — `lib/api.ts` is 2,858 lines
- A single file covering events, menus, table bookings, parking, and business hours.
- **Fix:** Split into domain modules: `lib/api/events.ts`, `lib/api/menu.ts`, `lib/api/bookings.ts`, `lib/api/parking.ts`, `lib/api/hours.ts`. Re-export from `lib/api/index.ts` to avoid breaking imports.

#### I2 — No shared TypeScript contract
- Both apps define their own interfaces for the same data shapes independently.
- C2 is a direct consequence of this.
- **Fix:** Extract a `types/management-api.ts` file in the website repo that accurately mirrors the management API's response shapes. These types become the single source of truth for all API consumers in this repo.

#### I3 — Legacy payload normalization
- The table booking and private booking proxy routes contain normalization logic for old payload shapes.
- **Fix:** Confirm whether old clients still exist. If not, remove the normalization code.

#### I4 — Inconsistent error response shapes across proxy routes
- Some routes return `{ error: string }`, others `{ success: false, error: { code, message } }`.
- **Fix:** Standardise all proxy routes to `{ success: false, error: { code: string, message: string } }` matching the management API's error format.

---

## Architecture: No Changes Required

The proxy pattern is correct and well-suited to this use case. The management API auth model (server-side `ANCHOR_API_KEY`, never exposed to client) is sound. No structural changes are proposed — all fixes are within the existing pattern.

---

## Phasing

### Phase 1 — Critical fixes

| Priority | Finding | Description |
|----------|---------|-------------|
| 1 | C5 + C2 | Fix Sunday lunch booking on kitchen-closed dates — highest priority live bug |
| 2 | C6 | Audit all business hours callers for caching; ensure booking paths always read fresh |
| 3 | C1 | Align party size validation to 1–20 |
| 4 | C3 | Migrate private booking to successor endpoint (deadline: Sep 2026) |
| 5 | C4 | Map all `blocked_reason` values to user-facing messages |

### Phase 2 — Medium + improvements

| Priority | Finding | Description |
|----------|---------|-------------|
| 1 | I1 | Split `lib/api.ts` into domain modules (prerequisite for I2) |
| 2 | I2 | Extract `types/management-api.ts` — single contract for all API shapes |
| 3 | M2 | Display `hold_expires_at` countdown in payment step |
| 4 | M3 | Remove hardcoded POLICY_VIOLATION redirect |
| 5 | M1 | Decide: delete unused availability proxy or migrate booking wizard to use it |
| 6 | I3 | Remove legacy payload normalization (after confirming no old clients) |
| 7 | I4 | Standardise error response shapes across proxy routes |

---

## Success Criteria

- Sunday lunch cannot be booked on any date where `is_kitchen_closed: true` or `kitchen: null` in the management app
- Party sizes above 20 produce a clear, user-facing validation message before hitting the management API
- Private booking enquiry uses the non-deprecated endpoint
- All 8 `blocked_reason` values produce specific, helpful user-facing messages
- No component or API caller caches business hours on booking-critical paths
- `lib/api.ts` split into domain modules with no broken imports
- A single `types/management-api.ts` contract replaces all ad-hoc inline interfaces

---

## Key Constraints

- `kitchen: null` is a deliberate closure signal — always use `??` not `||` (see March 2026 bug history)
- `is_kitchen_closed: true` is the primary flag; `kitchen: null` is defence-in-depth — check both
- Sunday lunch requires kitchen open AND the `sundayLunch.enabled` service flag from the management API
- The booking wizard must always fetch fresh business hours — no revalidation window on booking paths
- `ANCHOR_API_KEY` must never be exposed to client components
