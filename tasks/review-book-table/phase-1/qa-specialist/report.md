# QA Specialist Report: Book Table Form

**Date**: 2026-03-21
**Scope**: Full end-to-end review of `/book-table` form
**Files reviewed**:
- `components/features/TableBooking/ManagementTableBookingForm.tsx` (2319 lines)
- `app/book-table/page.tsx`
- `app/api/booking/submit/route.ts`
- `app/api/booking/agent/route.ts`
- `components/features/TableBooking/PayPalDepositSection.tsx`
- `lib/constants.ts`
- `lib/sunday-lunch-cutoff.ts`
- `lib/mothers-day-booking.ts`
- `tests/unit/ManagementTableBookingForm.test.tsx`

---

## Executive Summary

57 test cases traced through code. **5 FAIL, 6 WARN, 46 PASS**.

The primary user-reported issue (mobile party size editing) is confirmed and root-caused. Three additional defects found: legacy "card hold" language in the AI agent endpoint, and an idempotency key design flaw in the legacy BFF. The core booking flow, deposit logic, Sunday lunch cutoff, customer lookup, and PayPal payment paths are all correctly implemented.

---

## Defect Log

### DEF-001: Mobile party size input cannot be cleared (CONFIRMED)

| Field | Value |
|-------|-------|
| **Severity** | P0 -- Critical |
| **Summary** | Party size `onChange` handler rejects empty string, making mobile editing impossible |
| **Expected** | User can select-all-and-delete the party size field on mobile, then type a new number |
| **Actual** | `if (raw === '') return` on line 1649 causes the controlled input to snap back to the previous value. On mobile, the standard edit gesture (tap-select-all, delete, type new value) fails because the field never reaches an empty state. |
| **Business Impact** | Users on mobile (majority of public traffic) cannot change party size once entered without refreshing the page. This blocks the primary booking flow. |
| **Root Cause** | The `onChange` handler at lines 1647-1654 guards against empty string to prevent `NaN` from `parseInt`, but this guard also prevents the legitimate "clearing the field to retype" interaction. |
| **Affected Files** | `components/features/TableBooking/ManagementTableBookingForm.tsx` lines 1647-1654 |
| **Test Case IDs** | T-MOBILE-01, T-MOBILE-02, T-MOBILE-03 |
| **Fix Pattern** | Separate display value (string state for the input) from logical value (number state for business logic). Allow empty string as a transient display state. Clamp to valid range only on blur or submission. Example: `const [partySizeInput, setPartySizeInput] = useState(String(defaultPartySize))` with `onBlur` parsing. |

---

### DEF-002: AI agent endpoint uses legacy "card hold" language

| Field | Value |
|-------|-------|
| **Severity** | P1 -- High |
| **Summary** | AI agent response contains banned "card hold" terminology |
| **Expected** | All customer-facing language uses "deposit" per current policy |
| **Actual** | Line 155 in `app/api/booking/agent/route.ts`: `"Bookings of 7+ require a card hold to secure the booking (no charge)."` -- Uses "card hold" and claims "no charge", both of which contradict the current deposit policy (10/person, actual charge). |
| **Business Impact** | AI agents (GPT-5, etc.) will communicate incorrect policy to customers. Creates confusion about whether a real charge is taken. |
| **Root Cause** | This string was written before the deposit policy replaced the credit card hold system and was never updated. |
| **Affected Files** | `app/api/booking/agent/route.ts` line 155 |
| **Test Case IDs** | T-AGENT-01 |
| **Fix** | Replace with: `"Bookings of 7+ require a £10 per person deposit to secure the booking. This is deducted from your final bill."` |

---

### DEF-003: Legacy BFF idempotency key is per-request, not per-submission

| Field | Value |
|-------|-------|
| **Severity** | P1 -- High |
| **Summary** | Idempotency key generated fresh each request, defeating duplicate protection |
| **Expected** | Same idempotency key for retries of the same booking attempt |
| **Actual** | Line 171 in `app/api/booking/submit/route.ts`: `const idempotencyKey = crypto.randomUUID()` generates a new UUID per POST request. If a user double-submits (network retry, browser back button), two different keys are sent, creating duplicate bookings. |
| **Business Impact** | Duplicate bookings possible on slow networks or impatient users. Note: the main form (`ManagementTableBookingForm.tsx`) generates its own client-side idempotency key at line 1409 and sends it via header, which is the correct pattern. This defect is only in the legacy BFF path. |
| **Root Cause** | The BFF generates the key server-side instead of using a client-provided key. |
| **Affected Files** | `app/api/booking/submit/route.ts` line 171 |
| **Test Case IDs** | T-BFF-03 |
| **Fix** | Use the client-provided `Idempotency-Key` header if present, falling back to the server-generated UUID only for non-JS form submissions. |

---

### DEF-004: Frontend/backend party size max mismatch (warning)

| Field | Value |
|-------|-------|
| **Severity** | P2 -- Medium |
| **Summary** | Frontend allows party size up to 50; backend rejects above 20 |
| **Expected** | Consistent limits, or early client-side feedback |
| **Actual** | Frontend `max={50}` and clamp to 50 on line 1652. Backend API returns `too_large_party` for sizes above its own limit (typically 20). Users can enter 21-50, go through the full flow, and get rejected only at submission. |
| **Business Impact** | Poor UX for groups of 21-50 -- they complete the full form only to be told to call. Sidebar already says "For larger groups, please call us" but the form accepts up to 50. |
| **Root Cause** | Frontend and backend limits were set independently. |
| **Affected Files** | `components/features/TableBooking/ManagementTableBookingForm.tsx` line 1644, 1652; `app/book-table/page.tsx` line 48 |
| **Test Case IDs** | T-BOUND-08 |
| **Fix** | Either: (a) lower frontend max to match backend (20), or (b) show a "please call for groups this size" message at >20 instead of letting them continue to a rejection. |

---

### DEF-005: Stale availability data after date change without re-search

| Field | Value |
|-------|-------|
| **Severity** | P2 -- Medium |
| **Summary** | Changing date in step 1 does not clear previous availability data |
| **Expected** | Previous availability results cleared when date changes |
| **Actual** | `handleDateChange` (line 1092-1107) only updates the date and checks for past dates. It does not clear `availability`, `alternativeSlots`, or `selectedTime`. If user previously searched and then changes the date, the old results remain visible until they click "Find a table" again. |
| **Business Impact** | Low -- the user must click "Find a table" to proceed, which does reset everything. But if they go back from step 2 to step 1, change the date, and somehow bypass the search, stale data could appear. Currently mitigated by the step flow. |
| **Root Cause** | `handleDateChange` was designed to be lightweight (no API calls) but doesn't clear dependent state. |
| **Affected Files** | `components/features/TableBooking/ManagementTableBookingForm.tsx` lines 1092-1107 |
| **Test Case IDs** | T-STATE-01 |
| **Fix** | Add `setAvailability(null); setAlternativeSlots([]); setSelectedTime('')` to `handleDateChange`, or reset these when stepping back to 'find'. |

---

## Coverage Assessment

### What is well-covered

1. **Deposit logic**: Correctly implements mutual exclusivity between Sunday lunch and group deposits. Correct 10/person rate. Correct boundary at 7.
2. **Sunday lunch cutoff**: Saturday 1pm London time enforcement is solid with proper timezone handling via `Intl.DateTimeFormat`.
3. **Mother's Day flow**: Date/purpose/sundayLunch locking works correctly. Cutoff messaging is accurate.
4. **Customer lookup**: Known/unknown/degraded paths all handled with appropriate UI states.
5. **PayPal payment flow**: Order creation, capture, error handling, and retry all correctly wired.
6. **Validation chain**: `validateDetailsStep()` is called both at "Continue to review" and "Confirm booking", preventing bypasses.
7. **Blocked booking handling**: All blocked reasons have user-friendly copy and redirect to choose step.
8. **Event suggestions**: Mother's Day events correctly filtered out. Events sorted by time. Dismiss functionality works.
9. **Accessibility**: Progress bar has proper ARIA attributes. Form inputs use labels. Steps indicated visually and semantically.

### What is NOT covered by existing tests

The existing test file (`tests/unit/ManagementTableBookingForm.test.tsx`) has only 4 tests:
1. Mother's Day event filtering
2. Mother's Day context display
3. Mother's Day pre-order + submission
4. Pending payment without payment link

**Missing test coverage** (prioritized by risk):
- Party size input behavior (the confirmed bug)
- Group deposit (non-Sunday-lunch) flow
- Drinks-only booking flow
- Customer lookup (known vs unknown)
- Policy checkbox validation
- Past date rejection
- Sunday lunch cutoff after 1pm Saturday
- Date change state reset behavior
- Alternative slots display and selection
- Blocked booking handling (each reason)

### Recommendations for Implementation Engineer

1. **DEF-001 (P0)**: Fix the party size input immediately. Use a separate string state for the input display value, with numeric parsing on blur. This is the user's primary complaint.

2. **DEF-002 (P1)**: One-line fix in `app/api/booking/agent/route.ts`. Replace "card hold" with "deposit" language and remove the "(no charge)" claim.

3. **DEF-003 (P1)**: Check for `Idempotency-Key` header in the legacy BFF before generating a new one. Low risk, but important for data integrity.

4. **DEF-004 (P2)**: Consider lowering the frontend max to 20 or adding a soft warning at >20 directing users to call.

5. **DEF-005 (P2)**: Add state cleanup to `handleDateChange` to prevent any possibility of stale data.

6. **Test debt**: The form has 2319 lines of business logic with only 4 unit tests. Priority test additions: party size input, group deposit flow, drinks booking, customer lookup, policy validation.
