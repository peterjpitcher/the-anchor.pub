# Spec: Heathrow Parking — Availability Fix & Booking Wizard Priority

**Date:** 2026-04-20
**Author:** Claude (Opus 4.6)
**Status:** Revised (post-QA)
**Complexity:** S (2) — 1 code file + 1 data fix across 2 projects, no schema changes
**QA Review:** `tasks/codex-qa-review/2026-04-20-heathrow-parking-fix-adversarial-review.md`

---

## Problem Statement

Two issues on the `/heathrow-parking` page:

1. **Availability check returns FORBIDDEN error.** When a customer checks parking availability, they see: _"Parking availability is currently restricted. Please try again shortly."_ This blocks all bookings.

2. **Booking wizard is buried too low on the page.** The `ParkingBookingWizard` sits in the 6th `<Section>` — below four SEO content sections and a transfer guide. Customers must scroll past ~5 screens of content before reaching the booking form. The business wants the wizard to be the first interactive element after the hero.

---

## Root Cause Analysis

### Issue 1: FORBIDDEN error

**Flow:**
1. Pub website (`OJ-The-Anchor.pub`) calls its own `/api/parking/availability` route
2. That route calls `anchorAPI.getParkingAvailability()` which hits the management tools API (`OJ-AnchorManagementTools`) at `/api/parking/availability`
3. Management tools endpoint wraps its handler with `withApiAuth(handler, ['parking:availability'], request)` — requiring the `parking:availability` permission
4. The API key used by the pub website (env var `ANCHOR_API_KEY`) is validated against the `api_keys` table in Supabase
5. If the key's `permissions` JSONB array doesn't include `parking:availability` (or `*`), `withApiAuth` returns HTTP 403 with code `FORBIDDEN`
6. The pub's availability route maps `FORBIDDEN` to the user-facing message

**Evidence:**
- `OJ-AnchorManagementTools/src/app/api/parking/availability/route.ts:37` — requires `['parking:availability']`
- `OJ-AnchorManagementTools/src/lib/api/auth.ts:279-284` — permission check returns 403
- `OJ-The-Anchor.pub/lib/api/client.ts:755-756` — maps HTTP 403 to `code: 'FORBIDDEN'`
- `OJ-The-Anchor.pub/app/api/parking/availability/route.ts:29-31` — maps FORBIDDEN code to user-facing error message

**Other possible causes (ruled out by code analysis):**
- Invalid/missing key → would return 401 `UNAUTHORIZED`, not 403
- Expired key → would return 401 `UNAUTHORIZED`
- Rate limit exceeded → would return 429 `RATE_LIMIT_EXCEEDED`
- Rate limit service unavailable → would return 503 `RATE_LIMIT_UNAVAILABLE`

The `withApiAuth` function only returns 403 FORBIDDEN for the specific case of a valid, active, unexpired key that lacks the required permission.

### Full Parking Permission Audit

The `ParkingBookingWizard` calls multiple management API endpoints throughout the booking flow. All permissions required:

| Endpoint | Permission | Wizard Step |
|----------|-----------|-------------|
| `GET /api/parking/availability` | `parking:availability` | Step 1 (date selection) |
| `GET /api/parking/rates` | `parking:view` | Step 1 (price display) |
| `POST /api/parking/bookings` | `parking:create` | Step 4 (booking creation) |
| `POST /api/parking/payment/capture` | `parking:create` | Step 4 (PayPal capture) |
| `GET /api/parking/bookings/[id]` | `parking:view` | Confirmation |

**All three permissions must be present on the pub API key:** `parking:availability`, `parking:view`, `parking:create`

### Issue 2: Wizard placement

**Current page structure** (`OJ-The-Anchor.pub/app/heathrow-parking/page.tsx`):
1. Hero (with CTA linking to `#book-parking`)
2. Section: "Cheap Heathrow Parking Without Hidden Fees" (lines 325-368)
3. Section: PageTitle + intro paragraph (lines 370-379)
4. Section: "Heathrow Airport Car Parking for Every Terminal" (lines 381-407)
5. Section: "How you get from The Anchor to Heathrow" (lines 409-432)
6. **Section: Booking wizard `#book-parking`** (lines 434-446) ← too low
7. Section: Feature highlights (lines 448-462)
8. Section: Price comparison table (lines 464-493)
9. Section: Terminal directions + landing page links (lines 495-519)
10. Section: Long term parking perks (lines 522-551)
11. FAQ accordion
12. Review section
13. CTA section

**Terminal pages** (`/heathrow-parking/[terminal]`) — confirmed NOT affected. They do not import `ParkingBookingWizard` or call the availability API.

**Fix:** Move the booking wizard section (lines 434-446) to position 2, immediately after the hero.

---

## Pre-Fix Verification

Before applying any changes, confirm the root cause:

```sql
-- Run in OJ-AnchorManagementTools Supabase (production)
-- Find all active API keys and their permissions
SELECT id, name, permissions, is_active, expires_at, last_used_at
FROM api_keys
WHERE is_active = true
ORDER BY last_used_at DESC NULLS LAST;
```

**Expected finding:** The key named for the pub website integration should be active, unexpired, and its `permissions` array should be missing one or more of: `parking:availability`, `parking:view`, `parking:create`.

**If the key has all three permissions already:** The root cause is different — escalate and investigate auth logs.

---

## Proposed Changes

### Change 1: API key permissions (data fix — OJ-AnchorManagementTools Supabase)

**Identification:** Use the key's `name` column (not the raw secret) to identify the correct row. Never expose `ANCHOR_API_KEY` in queries, logs, or terminal history.

```sql
-- Step 1: Preflight — confirm target key and current permissions
-- Replace 'the-anchor-pub' with the actual key name from the pre-fix verification
SELECT id, name, permissions
FROM api_keys
WHERE name = 'the-anchor-pub'
  AND is_active = true;
-- ASSERT: exactly 1 row returned. If 0 or >1, STOP and investigate.

-- Step 2: Idempotent append — adds missing permissions without duplicating existing ones
UPDATE api_keys
SET permissions = (
  SELECT jsonb_agg(DISTINCT val)
  FROM jsonb_array_elements(
    permissions || '["parking:availability", "parking:view", "parking:create"]'::jsonb
  ) AS val
)
WHERE name = 'the-anchor-pub'
  AND is_active = true;
-- ASSERT: 1 row affected

-- Step 3: Verify result
SELECT id, name, permissions
FROM api_keys
WHERE name = 'the-anchor-pub'
  AND is_active = true;
-- ASSERT: permissions array contains parking:availability, parking:view, parking:create
-- plus all previously-existing permissions preserved
```

**Rollback** (if needed — remove only the permissions we added):
```sql
UPDATE api_keys
SET permissions = (
  SELECT jsonb_agg(val)
  FROM jsonb_array_elements(permissions) AS val
  WHERE val::text NOT IN ('"parking:availability"', '"parking:view"', '"parking:create"')
)
WHERE name = 'the-anchor-pub'
  AND is_active = true;
```

### Change 2: Move booking wizard section (OJ-The-Anchor.pub)

**File:** `app/heathrow-parking/page.tsx`

Move the entire `<Section background="dark" spacing="lg" id="book-parking">...</Section>` block (lines 434-446) to immediately after the `<HeroWrapper>` closing tag (after line 323).

No other changes needed — the `#book-parking` anchor links throughout the page will continue to work because the `id` attribute moves with the section.

---

## What Is NOT Changing

- No schema migrations
- No new environment variables
- No changes to the booking wizard component itself (`ParkingBookingWizard`)
- No changes to the management tools availability endpoint code
- No changes to the pub website's API client or availability route
- Terminal-specific pages (`/heathrow-parking/[terminal]`) are not affected (confirmed: they don't use the wizard)
- SEO structured data (JSON-LD schemas) is not affected
- No changes to the booking creation or payment flow logic

---

## Cache Behaviour

The management tools API sets `Cache-Control: public, max-age=60, stale-while-revalidate=120` on successful GET responses (see `auth.ts:150-151`). After the permission fix:

- A previously-cached 403 error response may persist at Vercel's edge for up to 60 seconds
- If the error response was cached with the same headers, wait 2-3 minutes after the data fix before testing
- No Vercel cache purge or redeployment is required — the TTL is short enough to self-heal
- The pub website's availability route does not add its own caching layer

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Wrong API key updated | Low | High — could give wrong key parking access | Preflight SELECT with name-based WHERE; assert exactly 1 row |
| Existing permissions lost | Low | High — breaks other integrations | Idempotent JSONB append preserves existing array entries |
| Moving wizard breaks page layout | Low | Medium — visual regression | Preview locally, check responsive breakpoints |
| SEO impact from content reorder | Very Low | Low — Google cares about content presence, not order | No content removed, all sections preserved |
| Hero CTA anchor breaks | None | N/A | `id="book-parking"` moves with the section |
| Cached 403 persists briefly | Medium | Low — self-resolves in <3 min | Document expected delay; don't panic-escalate |

---

## Verification Plan

### After data fix (Change 1):

1. **Wait 2-3 minutes** for cache TTL to expire
2. **Test deployed pub site:** Load `https://www.the-anchor.pub/api/parking/availability?start=<future-date>` (no API key in request — the proxy supplies it server-side) → expect JSON with `success: true`
3. **Test management API directly** (using env var, never raw key): `curl -H "X-API-Key: $ANCHOR_API_KEY" https://<management-domain>/api/parking/availability` → expect HTTP 200

### After code change (Change 2):

4. **Wizard position:** Load `/heathrow-parking` → booking wizard visible immediately after hero
5. **Anchor links:** Click "Book Heathrow parking now" in hero → scrolls to wizard smoothly
6. **Responsive:** Check wizard placement on mobile (375px), tablet (768px), desktop (1280px)

### End-to-end (both changes):

7. **Full booking flow:** On the deployed pub site, complete a test booking start-to-finish (availability check → customer details → vehicle details → PayPal payment)
8. **Other sections:** All SEO content sections still render correctly below the wizard
9. **Terminal pages:** Spot-check one terminal page loads without errors (regression guard)

---

## Success Criteria

- Customers can check parking availability without seeing the "restricted" error
- The booking wizard is the first interactive section after the hero
- All existing anchor links to `#book-parking` work correctly
- No visual regressions on any breakpoint
- Full booking flow works end-to-end (availability → booking → payment)
- Existing API key permissions preserved (no regression to other integrations)
