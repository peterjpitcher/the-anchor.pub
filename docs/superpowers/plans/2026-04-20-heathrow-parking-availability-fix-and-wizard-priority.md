# Heathrow Parking — Availability Fix & Wizard Priority

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unblock parking bookings on the pub website by fixing API key permissions, and move the booking wizard to the top of the page for conversion priority.

**Architecture:** Two independent changes: (1) a Supabase data fix adding missing parking permissions to the pub website's API key in the OJ-AnchorManagementTools project, and (2) a page layout reorder in OJ-The-Anchor.pub moving the booking wizard section immediately after the hero.

**Tech Stack:** Supabase (PostgreSQL JSONB), Next.js 15 App Router (React 19, TypeScript)

**Spec:** `docs/superpowers/specs/2026-04-20-heathrow-parking-availability-fix-and-wizard-priority.md`

---

### Task 1: Verify Root Cause — Query API Key Permissions

**Files:**
- None (database query only)

- [ ] **Step 1: Query active API keys in Supabase**

Open the Supabase SQL Editor for the OJ-AnchorManagementTools project (production) and run:

```sql
SELECT id, name, permissions, is_active, expires_at, last_used_at
FROM api_keys
WHERE is_active = true
ORDER BY last_used_at DESC NULLS LAST;
```

- [ ] **Step 2: Identify the pub website key and confirm missing permissions**

Find the key used by the pub website (likely named something like `the-anchor-pub` or `pub-website`). Confirm:
- `is_active = true`
- `expires_at` is NULL or in the future
- `permissions` array is **missing** one or more of: `parking:availability`, `parking:view`, `parking:create`

**If the key already has all three permissions:** STOP. The root cause is different — investigate further.

**If the key is missing permissions:** Note the exact `name` value and proceed to Task 2.

---

### Task 2: Apply Permission Fix — Idempotent JSONB Update

**Files:**
- None (database update only)

- [ ] **Step 1: Preflight check — confirm exactly one target row**

Replace `'the-anchor-pub'` below with the actual key name from Task 1:

```sql
SELECT id, name, permissions
FROM api_keys
WHERE name = 'the-anchor-pub'
  AND is_active = true;
```

**Expected:** Exactly 1 row. If 0 or >1 rows, STOP and investigate.

- [ ] **Step 2: Apply idempotent permission append**

```sql
UPDATE api_keys
SET permissions = (
  SELECT jsonb_agg(DISTINCT val)
  FROM jsonb_array_elements(
    permissions || '["parking:availability", "parking:view", "parking:create"]'::jsonb
  ) AS val
)
WHERE name = 'the-anchor-pub'
  AND is_active = true;
```

**Expected:** `UPDATE 1` (exactly 1 row affected).

- [ ] **Step 3: Verify result — all permissions present and existing ones preserved**

```sql
SELECT id, name, permissions
FROM api_keys
WHERE name = 'the-anchor-pub'
  AND is_active = true;
```

**Expected:** `permissions` array contains `parking:availability`, `parking:view`, `parking:create` PLUS all previously-existing permissions (e.g. `read:events`, etc.) — nothing lost.

- [ ] **Step 4: Wait for cache expiry**

Wait 2-3 minutes. The management API caches responses with `max-age=60, stale-while-revalidate=120`.

---

### Task 3: Verify Availability Fix End-to-End

**Files:**
- None (verification only)

- [ ] **Step 1: Test management API directly**

Using a terminal with the env var loaded (never paste the raw key):

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "X-API-Key: $ANCHOR_API_KEY" \
  "https://<management-tools-domain>/api/parking/availability?start=$(date -u -v+1d +%Y-%m-%dT00:00:00Z)&end=$(date -u -v+2d +%Y-%m-%dT00:00:00Z)"
```

**Expected:** HTTP 200 (was 403 before fix).

- [ ] **Step 2: Test pub website proxy**

```bash
curl -s "https://www.the-anchor.pub/api/parking/availability?start=$(date -u -v+1d +%Y-%m-%dT00:00:00Z)&end=$(date -u -v+2d +%Y-%m-%dT00:00:00Z)" | jq '.success'
```

**Expected:** `true` (was returning `false` with FORBIDDEN error).

- [ ] **Step 3: Test in browser**

Load `https://www.the-anchor.pub/heathrow-parking`, scroll to the booking wizard, select dates, click "Check availability".

**Expected:** Availability slots display without error. No "currently restricted" message.

---

### Task 4: Move Booking Wizard to Top of Page

**Files:**
- Modify: `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/heathrow-parking/page.tsx:323-446`

- [ ] **Step 1: Cut the wizard section from its current position**

In `app/heathrow-parking/page.tsx`, cut lines 434-446 (the entire `<Section>` with `id="book-parking"`):

```tsx
      <Section background="dark" spacing="lg" id="book-parking">
        <Container>
          <div className="mx-auto max-w-5xl space-y-6">
            <h2 className="text-3xl font-bold text-anchor-cream-text text-center">
              Reserve & Pay for Heathrow Parking in Four Steps
            </h2>
            <p className="text-center text-anchor-cream-text/70">
              Check live availability, lock in the best long stay parking price and pay securely with PayPal – perfect for airport drop-offs, contractors and extended holidays.
            </p>
            <ParkingBookingWizard initialRates={rateCard} />
          </div>
        </Container>
      </Section>
```

- [ ] **Step 2: Paste immediately after the HeroWrapper closing tag**

Insert the section right after the `/>` that closes `<HeroWrapper` (currently line 323), before the "Cheap Heathrow Parking Without Hidden Fees" section:

```tsx
      <HeroWrapper
        route="/heathrow-parking"
        {/* ... existing props ... */}
      />

      <Section background="dark" spacing="lg" id="book-parking">
        <Container>
          <div className="mx-auto max-w-5xl space-y-6">
            <h2 className="text-3xl font-bold text-anchor-cream-text text-center">
              Reserve & Pay for Heathrow Parking in Four Steps
            </h2>
            <p className="text-center text-anchor-cream-text/70">
              Check live availability, lock in the best long stay parking price and pay securely with PayPal – perfect for airport drop-offs, contractors and extended holidays.
            </p>
            <ParkingBookingWizard initialRates={rateCard} />
          </div>
        </Container>
      </Section>

      <Section background="dark" spacing="lg">
        {/* "Cheap Heathrow Parking Without Hidden Fees" section continues here */}
```

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npm run build
```

**Expected:** Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
git add app/heathrow-parking/page.tsx
git commit -m "feat(parking): move booking wizard to top of heathrow-parking page

Relocate the ParkingBookingWizard section from the 6th position to
immediately after the hero for conversion priority. The #book-parking
anchor ID moves with the section — no link updates needed."
```

---

### Task 5: Visual Regression & End-to-End Verification

**Files:**
- None (testing only)

- [ ] **Step 1: Local dev check**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && npm run dev
```

Open `http://localhost:3000/heathrow-parking` and verify:
- Booking wizard appears immediately after the hero
- Hero CTA "Book Heathrow parking now" scrolls to the wizard
- All SEO content sections render below the wizard in correct order
- No layout breakage

- [ ] **Step 2: Responsive check**

Using browser DevTools, check at:
- **Mobile (375px):** Wizard is full-width, no overflow, usable
- **Tablet (768px):** Wizard and hero stack correctly
- **Desktop (1280px):** Wizard centred within max-w-5xl container

- [ ] **Step 3: Anchor link check**

On the page, click every "Book Heathrow parking" link/button. Each should scroll to the `#book-parking` section (now near the top).

Check links in:
- Hero primary CTA
- "Cheap Heathrow Parking" section CTA
- Bottom CTA section

- [ ] **Step 4: Full booking flow (after deployment)**

On the deployed pub site, complete the booking wizard end-to-end:
1. Select dates → availability loads (no FORBIDDEN error)
2. Enter customer details → form validates
3. Enter vehicle details → form validates
4. PayPal payment → order created and captured
5. Confirmation page loads with booking details

- [ ] **Step 5: Terminal page spot-check**

Load one terminal page (e.g. `/heathrow-parking/terminal-5`) and confirm it still renders without errors. These pages don't use the wizard but should be unaffected.

---

## Rollback

**Data fix rollback** (only if something breaks):
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

**Code change rollback:** Revert the commit — `git revert <commit-hash>`.
