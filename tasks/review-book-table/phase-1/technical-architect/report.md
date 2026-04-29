# Technical Architect Report: Book Table Form

**Reviewer**: Technical Architect Agent
**Date**: 2026-03-21
**Scope**: `/components/features/TableBooking/ManagementTableBookingForm.tsx` (2319 lines), supporting API routes, and PayPal payment integration
**Verdict**: Several **Critical** partial-failure scenarios in the payment flow; significant maintainability debt from monolithic component design

---

## 1. Failure-at-Step-N Analysis

### FLOW 1: Complete Booking Submission (handleConfirmBooking)

**Steps in order:**
1. `validateDetailsStep()` -- client-side validation
2. `buildSundayMenuSelections()` -- client-side data assembly
3. `createClientIdempotencyKey('tbl_web')` -- generate idempotency key
4. POST `/api/table-bookings` with payload + `Idempotency-Key` header
5. Parse response, check `state` field
6. If `state === 'pending_payment'`: store result, trigger PayPal useEffect
7. useEffect fires: POST `/api/table-bookings/paypal/create-order`
8. PayPal SDK renders buttons; user clicks "Pay"
9. `handleApprove()`: POST `/api/table-bookings/paypal/capture-order`
10. On success: `setPaymentState('confirmed')` (client-only state change)

#### CRITICAL: Booking created but user abandons before payment (Steps 4-6)

- **Scenario**: Step 4 succeeds and the upstream management API creates a booking in `pending_payment` state. The user then closes their browser, loses internet, or navigates away before completing PayPal payment.
- **Consequence**: An orphaned booking exists in `pending_payment` state with no mechanism visible in this codebase to expire or cancel it. The `hold_expires_at` field is displayed to the user but **there is no client-side or server-side timer that cancels the booking when the hold expires**.
- **Mitigation needed**: A server-side cron or background job must expire `pending_payment` bookings after `hold_expires_at`. If one exists in the management API, it is not documented or verifiable from this codebase. **Severity: Critical**.

#### CRITICAL: PayPal create-order fails after booking created (Steps 4-7)

- **Scenario**: Booking is created successfully (step 4) with `state: 'pending_payment'`, but the subsequent `create-order` call (step 7) fails (network error, PayPal outage, management API error).
- **Consequence**: The booking exists in `pending_payment` state but the user sees "Unable to set up payment" with no recovery path except "Start a new booking" (which abandons the existing booking). The user's table hold is consumed but payment cannot be completed.
- **Current handling**: `setPaymentError(...)` and `setPaymentState('error')` -- display only. No retry mechanism. No way to re-attempt create-order for the same booking.
- **Mitigation needed**: Add a "Retry payment" button that re-calls `/api/table-bookings/paypal/create-order` with the same `bookingId`. **Severity: Critical**.

#### CRITICAL: PayPal capture fails after user approved payment (Steps 8-9)

- **Scenario**: User approves payment in PayPal, but the capture call fails (network error, timeout, upstream 5xx).
- **Consequence**: PayPal has authorized (or even captured) the funds on PayPal's side, but the management API never records the capture. The booking remains in `pending_payment`, and the user sees a payment error. Money may have been deducted from the user's account.
- **Current handling**: `onError` callback shows error message. No reconciliation.
- **Mitigation needed**: The management API should have a webhook or reconciliation job that matches PayPal capture events to bookings. The client should show a clear message: "Your payment may have been processed. Please call us." with the booking reference. **Severity: Critical**.

#### HIGH: Payment success is client-only state (Step 10)

- **Scenario**: `setPaymentState('confirmed')` is a purely client-side state change. If the user refreshes the page immediately after payment succeeds, there is no mechanism to restore the "confirmed" state. The booking would show as `pending_payment` from the original `result` (which came from step 4).
- **Consequence**: User sees stale state. May attempt to pay again, or be confused.
- **Mitigation**: After successful capture, re-fetch booking status from the server, or redirect to a confirmation page with the booking reference.

#### OK: Idempotency key handling

- The client generates `tbl_web_<uuid>` and sends it in the `Idempotency-Key` header.
- The BFF (`/api/table-bookings/route.ts`) passes it through to the upstream API: good.
- If the BFF generates its own key when the header is missing (line 368-369), this means retry after a network error would generate a *new* idempotency key and could create a duplicate booking. The client-side key is the correct approach, but **there is no retry logic** in `handleConfirmBooking` -- a network failure just shows an error. This is acceptable for now.

### FLOW 2: Phone Lookup + Customer Detection

**Steps**: Enter phone -> GET `/api/customers/lookup` -> parse response -> auto-fill

- **Failure mode**: API returns error -- handled correctly, sets `lookupState: 'idle'` and shows error.
- **Degraded mode**: `lookup_degraded: true` -- handled correctly, allows user to proceed with manual entry.
- **Race condition risk**: None significant. Only one lookup in flight at a time (no debounce needed since it's button-triggered).
- **Assessment**: Sound. No partial-failure risk.

### FLOW 3: Availability Check (handleFindTable -> runAvailabilitySearch)

**Steps**: Abort previous request -> GET availability -> parse -> pick closest slot -> if no slots, fetch alternatives in parallel

- **AbortController**: Correctly used. Previous controller is aborted before creating a new one. AbortError is caught and ignored. The controller ref is properly managed.
- **Parallel alternative fetching**: `loadNearestAlternatives` fires 3 parallel requests. Individual failures are caught and return `null`. No partial-failure risk.
- **Drinks fallback**: Fires after alternatives load. Failure caught, sets `null`. Safe.
- **Assessment**: Sound. Well-structured with proper cancellation.

### FLOW 4: Legacy BFF Submit (app/api/booking/submit/route.ts)

**Steps**: Parse body -> validate -> check service windows -> build request -> generate idempotency key -> POST to upstream

- **Idempotency key**: Generated server-side per request (`crypto.randomUUID()`). Not passed from client. This means if the client retries (e.g., network timeout), a new idempotency key is generated and a duplicate booking could be created. However, this is the legacy path and appears to be superseded by the management form's direct POST to `/api/table-bookings`.
- **Service window check failure**: Returns 503 with helpful message. Good.
- **Assessment**: The legacy BFF generates its own idempotency key per request, which does not protect against client retries. Low risk since this path appears deprecated.

---

## 2. Architecture Assessment

### Component Monolith: ManagementTableBookingForm.tsx (2319 lines)

**Severity: High (maintainability/correctness risk)**

This single component contains:
- ~40 `useState` hooks (counted: 34 explicit `useState` calls plus several derived values)
- 11 `useEffect` hooks with overlapping dependencies
- All 4 booking steps (find, choose, details, review)
- Payment flow UI
- Event suggestion system
- Sunday lunch pre-order system
- Mother's Day special logic
- Phone lookup flow

**Specific risks from this structure:**

1. **useEffect dependency overlap**: Multiple effects depend on `sundayLunch`, `purpose`, `selectedDateIsSunday`, `mothersDayMode`. The effects at lines 629-643, 686-724, 848-853, and 855-859 all toggle `sundayLunch` or `purpose` in response to each other. While React batches these state updates, the logical flow is very difficult to reason about. A change to one effect could create a cascading update cycle that is hard to test.

2. **Stale closure risk**: Functions like `handleConfirmBooking` close over many state values (`date`, `partySize`, `phone`, `firstName`, `lastName`, `email`, `purpose`, `sundayLunch`, etc.). Since this is a regular function (not wrapped in `useCallback`), it always captures current state via the render closure. This is correct but fragile -- any refactoring that introduces `useCallback` without proper deps would introduce stale closures.

3. **No form library**: The form does not use React Hook Form or any form state manager. All validation is manual and imperative. This makes it easy to miss validation paths (e.g., the `validateDetailsStep` function is called from both `handleContinueToReview` and `handleConfirmBooking`).

**Recommended decomposition:**
- Extract each step into a sub-component (`FindTableStep`, `ChooseTimeStep`, `DetailsStep`, `ReviewStep`)
- Extract booking state into a `useBookingForm` custom hook or `useReducer`
- Extract payment flow into a `usePaymentFlow` custom hook
- Extract availability fetching into a `useAvailability` custom hook

### Two Active Booking Paths

There are **three** API routes that can create bookings:
1. `/api/table-bookings` (POST) -- used by `ManagementTableBookingForm`
2. `/api/booking/submit` (POST) -- legacy BFF, used by older form/non-JS fallback
3. `/api/booking/agent` (POST) -- AI agent endpoint

All three ultimately call the upstream management API, but with different payload shapes, validation logic, and idempotency handling. This is a maintenance burden but not a correctness issue since they all converge on the same upstream.

**Risk**: The legacy BFF at `/api/booking/submit` has `any` typed `bookingData` and `bookingRequest` (lines 28, 144). Type safety is absent for this path.

---

## 3. Data Model Assessment

### Party Size Validation Mismatch

- **Client**: `min={1} max={50}` on the input, clamped via `Math.min(Math.max(parsed, 1), 50)` (line 1652)
- **BFF `/api/table-bookings`**: Validates `party_size` between 1 and 20 (line 269)
- **Consequence**: A user can select party size 21-50 on the form, submit, and get a validation error from the BFF. The error message is generic ("Party size must be between 1 and 20").
- **Severity**: Medium. Confusing UX. The client should enforce `max={20}` to match the server.

### Deposit Amount Calculation

- `SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP = 10` used for both Sunday lunch deposits AND group deposits (7+ people).
- The `groupDepositAmount` is calculated as `partySize * SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP` (line 602). This reuses the Sunday lunch constant for a conceptually different deposit. If the rates ever diverge, this will be a bug.
- **Severity**: Low. Works correctly today. Add a named constant for group deposits.

### Date Handling

- `today` is memoized with `useMemo(() => new Date().toISOString().slice(0, 10), [])` (line 525). The empty dependency array means it never updates if the user keeps the tab open past midnight. However, the `now` state updates every 30 seconds (line 517), so cutoff-sensitive logic is fine. The `today` minimum on the date picker could be stale after midnight.
- **Severity**: Low. Edge case.

---

## 4. Integration Robustness

### PayPal SDK Initialization

```tsx
<PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: 'GBP' }}>
```

- **Non-null assertion** (`!`) on `NEXT_PUBLIC_PAYPAL_CLIENT_ID`. If the env var is undefined, the PayPal SDK will receive `undefined` as the client ID. The SDK will likely fail to load, but the error may be unclear.
- **Severity**: Medium. Add a runtime guard: if the env var is missing, show a user-friendly error instead of rendering PayPal buttons.

### PayPal `createOrder` callback

```tsx
createOrder={() => Promise.resolve(orderId)}
```

- This returns the pre-created `orderId` from the management API. The PayPal SDK expects this to return an order ID. This is correct -- the order was already created server-side. But if `orderId` is null or invalid, PayPal will fail silently or show a generic error.
- **Severity**: Low. The `orderId` is only set when the create-order response contains it.

### Upstream API Key

- `ANCHOR_API_KEY` is checked for existence in the `/api/table-bookings` POST handler (line 298). Good.
- The PayPal routes use `process.env.ANCHOR_API_KEY` directly in the `Authorization` header without a null check. If the key is missing, the upstream will receive `Bearer undefined`.
- **Severity**: Medium. Add a guard in the PayPal routes.

---

## 5. Error Handling Audit

### Confirmed Bug: Mobile Party Size Input (Lines 1647-1654)

```tsx
onChange={(event) => {
  const raw = event.target.value
  if (raw === '') return    // <-- BUG: rejects empty string
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return
  setPartySize(Math.min(Math.max(parsed, 1), 50))
}}
```

- **Problem**: On mobile browsers, users typically clear the input field before typing a new number. When `raw === ''`, the handler returns without updating state. Since `value={partySize}` is a controlled number, React re-renders with the old value, making it impossible to clear and retype.
- **Fix**: Allow empty string by storing `partySize` as `number | ''`, or use a separate `partySizeInput` string state for the raw input value while keeping `partySize` as the validated number.
- **Severity**: Medium (confirmed UX bug, affects mobile users).

### Error Display

- Errors are shown via a global `{error && <Alert>}` at the top of the form (line 1607). This means errors from any step are shown regardless of which step is active. If a user navigates back and forward, stale errors could persist.
- The `setError(null)` calls are scattered across handlers (`handleBackToFind`, `handleBackToChoose`, `handleConfirmBooking`, etc.) but are not systematically cleared on step transitions.
- **Severity**: Low. Could show confusing stale errors in edge cases.

### Missing Error Boundaries

- No React Error Boundary wraps the component or the PayPal section. If the PayPal SDK throws during render, the entire form crashes.
- **Severity**: Medium. Add an error boundary around `PayPalDepositSection`.

---

## 6. Technical Debt

| Item | Severity | Effort |
|------|----------|--------|
| Monolithic 2319-line component with 34+ useState hooks | High | L |
| No form library (React Hook Form + Zod) for validation | Medium | M |
| Party size max mismatch (client: 50, server: 20) | Medium | XS |
| `any` types in legacy BFF (`/api/booking/submit`) | Medium | S |
| No error boundary around PayPal section | Medium | XS |
| No retry mechanism for failed PayPal create-order | Critical | S |
| No server-side booking expiry verification visible | Critical | M |
| No post-capture booking state refresh | High | S |
| PayPal env var non-null assertion without guard | Medium | XS |
| Duplicate `toMinutes` function (component + service-windows lib) | Low | XS |
| Mother's Day date hardcoded as "15 March 2026" in UI copy | Low | XS |
| Legacy BFF idempotency key not client-supplied | Low | S |

---

## 7. Summary of Critical Issues

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| C1 | Orphaned `pending_payment` bookings when user abandons before PayPal completion | Table holds consumed, no visible expiry mechanism | `handleConfirmBooking` + useEffect (line 657-684) |
| C2 | No retry for failed PayPal order creation after booking created | User stuck with unpayable booking, only option is "Start new booking" | useEffect (line 657-684) |
| C3 | PayPal capture failure after user approval -- no reconciliation | Money potentially captured by PayPal but booking not confirmed | `PayPalDepositSection.handleApprove` |
| C4 | Payment confirmation is client-only state, lost on refresh | User sees stale `pending_payment` after successful payment + refresh | `onSuccess` callback (line 2266) |

---

## 8. Recommendations (Priority Order)

1. **Verify upstream booking expiry** -- Confirm the management API has a cron/job that cancels `pending_payment` bookings after `hold_expires_at`. If not, build one. (Addresses C1)

2. **Add payment retry** -- When `create-order` fails, show a "Retry payment setup" button that re-calls the endpoint with the same `bookingId`. (Addresses C2)

3. **Add PayPal webhook reconciliation** -- Ensure the management API listens for PayPal IPN/webhooks and auto-confirms bookings where capture succeeded but the client-side callback failed. (Addresses C3)

4. **Post-payment state refresh** -- After successful capture, fetch `GET /api/table-bookings/{reference}` to get the server-confirmed state before showing the success screen. Or redirect to `/book-table?ref=XYZ&confirmed=true` which loads state from the server. (Addresses C4)

5. **Fix mobile party size input** -- Allow empty intermediate value in the controlled input. (Addresses confirmed bug)

6. **Align party size limits** -- Change client max from 50 to 20 to match server validation.

7. **Add error boundary** around `PayPalDepositSection` to prevent full form crash on PayPal SDK errors.

8. **Plan component decomposition** -- Break the monolith into step components + custom hooks. This is the single most impactful change for long-term maintainability but is a large effort.
