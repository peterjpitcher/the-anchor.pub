# Test Matrix: Book Table Form

## Legend
- **Status**: PASS / FAIL / BLOCKED / WARN
- **Priority**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)

---

## Category 1: Mobile Input (Party Size)

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-MOBILE-01 | Clear party size field completely on mobile (select all + delete), then type new number | Field clears to empty, user types new value, state updates | `onChange` handler at line 1647-1654 returns early when `raw === ''` -- the controlled input snaps the value back to the previous `partySize` state, preventing the field from ever being empty | **FAIL** | P0 |
| T-MOBILE-02 | Use backspace to delete party size digits one by one (e.g. "12" -> "1" -> "") | Each intermediate value accepted; when field empties, user can continue typing | Deleting down to single digit works (e.g. "12" to "1"), but deleting the final digit triggers the `raw === ''` guard and snaps back | **FAIL** | P0 |
| T-MOBILE-03 | Party size field shows correct value after editing from 8 to 3 | Field shows "3", partySize state = 3 | Only works if user types "3" without first clearing -- if they select-all-and-type on mobile, the field fights them | **FAIL** | P0 |
| T-MOBILE-04 | Party size of 0 entered | Rejected, clamped to 1 | `Math.max(parsed, 1)` on line 1652 clamps to 1 | PASS | P1 |
| T-MOBILE-05 | Negative party size entered (e.g. "-5") | Rejected, clamped to 1 | `Math.max(parsed, 1)` clamps negatives to 1 | PASS | P1 |
| T-MOBILE-06 | Non-numeric input in party size (e.g. "abc") | Rejected | `Number.isNaN(parsed)` guard on line 1651 returns early | PASS | P2 |

---

## Category 2: Boundary Tests (Party Size & Deposits)

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-BOUND-01 | Party size exactly 7 (non-Sunday-lunch, food) | Triggers group deposit of 70 (7 x 10) | `requiresGroupDeposit` = `!requiresSundayLunchDeposit && partySize >= 7` (line 600). Deposit = `7 * 10 = 70`. Review step shows "Deposit due now" and deduction note. | PASS | P1 |
| T-BOUND-02 | Party size exactly 6 (non-Sunday-lunch, food) | No deposit required | `partySize >= 7` is false; `requiresGroupDeposit` = false. No deposit UI shown. | PASS | P1 |
| T-BOUND-03 | Party size 50 (frontend max) | Accepted, clamped to 50 | `Math.min(Math.max(parsed, 1), 50)` on line 1652 accepts 50 | PASS | P2 |
| T-BOUND-04 | Party size 51 (should be rejected) | Clamped to 50 | `Math.min(..., 50)` clamps to 50; input `max={50}` attribute provides browser hint | PASS | P2 |
| T-BOUND-05 | Party size 1 (minimum) | Accepted | `Math.max(parsed, 1)` accepts 1 | PASS | P2 |
| T-BOUND-06 | Sunday lunch with 1 guest | Requires deposit of 10 | `requiresSundayLunchDeposit` = true when `sundayLunch` is true on a Sunday. Deposit = `getSundayLunchDepositAmount(1)` = 10. | PASS | P1 |
| T-BOUND-07 | Sunday lunch with 7 guests | Sunday lunch deposit (70), NOT group deposit | `requiresSundayLunchDeposit` = true (takes precedence). `requiresGroupDeposit` = `!requiresSundayLunchDeposit && ...` = false. Deposit = 70. Mutually exclusive logic correct. | PASS | P1 |
| T-BOUND-08 | Frontend max 50 vs backend max 20 | Frontend accepts up to 50; backend may reject >20 | Frontend clamps to 50 on line 1652. The backend API (management tools) enforces max 20. The `book-table/submit` route does not enforce a max. Mismatch exists but is handled by blocked_reason `too_large_party` from API. | **WARN** | P2 |

---

## Category 3: Deposit Logic

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-DEP-01 | Sunday lunch + 4 guests: deposit shown | Deposit = 40, label "Deposit due now" | `requiresSundayLunchDeposit` = true, `sundayLunchDepositAmount` = 40. Review shows dt "Deposit due now" dd "40.00". | PASS | P1 |
| T-DEP-02 | Sunday lunch deposit is mutually exclusive with group deposit | Only one deposit line shown | `requiresGroupDeposit = !requiresSundayLunchDeposit && partySize >= 7` -- Sunday lunch deposit suppresses group deposit. Code correct. | PASS | P1 |
| T-DEP-03 | Group of 8, weekday food (no Sunday lunch) | Group deposit = 80 | `requiresGroupDeposit` = true, `groupDepositAmount` = 80. Correct. | PASS | P1 |
| T-DEP-04 | Group of 8, drinks only | Group deposit = 80 | `requiresGroupDeposit` applies regardless of purpose (line 600 only checks `!requiresSundayLunchDeposit && partySize >= 7`). Deposit shown. | PASS | P2 |
| T-DEP-05 | Deposit deducted from final bill messaging | Clear messaging shown | "This deposit is deducted from your final bill." shown for both Sunday lunch (line 2222) and group deposits (line 2227). | PASS | P2 |
| T-DEP-06 | Confirm button text changes when deposit required | "Confirm and pay deposit" | Line 2308: ternary checks `requiresSundayLunchDeposit || requiresGroupDeposit` and shows correct label. | PASS | P2 |

---

## Category 4: Sunday Lunch Flow

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-SUN-01 | Selecting a Sunday date with food purpose | Sunday lunch toggle auto-enabled | Effect on lines 686-724: if `selectedDateIsSunday && !sundayLunchCutoffPassed && !sundayPlanManuallySelected`, sets `sundayLunch` to true. | PASS | P1 |
| T-SUN-02 | Sunday lunch cutoff: 1pm Saturday London time | After cutoff, Sunday lunch option disabled | `hasSundayLunchCutoffPassed` uses Saturday (day - 1) at 13:00:00 London time. Button disabled via `sundayLunchCutoffPassed`. | PASS | P1 |
| T-SUN-03 | Pre-order requires main for each guest | Validation blocks submission without selections | `buildSundayMenuSelections()` checks `guestOrders.find(o => !o.menuItemId)` and returns error "Please select a Sunday lunch main for each guest." | PASS | P1 |
| T-SUN-04 | Sunday lunch menu loaded from API | Menu items populate selects | Effect at lines 726-768 fetches `/api/table-bookings/menu/sunday-lunch?date=...` when `sundayLunch && selectedDateIsSunday && detailsUnlocked && step === 'details'`. | PASS | P1 |
| T-SUN-05 | Sunday lunch menu unavailable | Error shown, submission blocked | If `menuData.length === 0` or `!response.ok`, error thrown and `sundayMenuError` set. `buildSundayMenuSelections` returns `{ ok: false }`. | PASS | P1 |
| T-SUN-06 | Switching to drinks clears Sunday lunch | Sunday lunch state reset | Effect at line 855-859: `if (purpose === 'drinks' && sundayLunch) setSundayLunch(false)`. Also `handlePurposeSelection` at line 1126. | PASS | P2 |
| T-SUN-07 | Guest orders array resizes with party size | Array matches party size, preserving existing selections | Effect at lines 620-627: `Array.from({ length: partySize }, ...)` preserves previous entries by index. | PASS | P2 |
| T-SUN-08 | Sunday lunch on non-Sunday date | Sunday lunch option not shown | Guard at line 2005: `selectedDateIsSunday && purpose !== 'drinks' && availability?.sunday_lunch_available !== false`. | PASS | P2 |

---

## Category 5: Customer Lookup

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-CUST-01 | Known customer phone lookup | Name/email populated, personal details skipped | `setLookupState('known')`, sets firstName/lastName/email from response. UI at line 1932 shows welcome back message. Details form hidden at line 1947 (`!isKnownCustomer`). | PASS | P1 |
| T-CUST-02 | Unknown customer phone lookup | Name fields shown, must enter first + last name | `setLookupState('unknown')`. Guard at line 1354: `!isKnownCustomer && (!firstName.trim() || !lastName.trim())` blocks submission. | PASS | P1 |
| T-CUST-03 | Degraded lookup | Treated as unknown with different message | `lookupDegraded` set to true. Message at line 1940-1941 differs: "We could not verify this number right now." | PASS | P1 |
| T-CUST-04 | Empty phone number lookup | Error shown | Line 1229: `if (!phone.trim())` shows "Please enter your mobile number first." | PASS | P2 |
| T-CUST-05 | Reset phone lookup allows re-entry | Phone field re-enabled, all fields cleared | `resetPhoneLookup()` at line 1274 resets all lookup and name state. Button "Use Different Number" at line 1922 triggers it. | PASS | P2 |
| T-CUST-06 | Phone lookup API error | Graceful fallback, error message shown | Catch at line 1267: sets `lookupState('idle')`, shows error message. | PASS | P2 |

---

## Category 6: Booking Submission

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-SUB-01 | Policy checkbox required | Submission blocked without acceptance | Line 1391: `if (!policyAccepted)` returns error. | PASS | P1 |
| T-SUB-02 | Known customer uses stored details | Submission uses known customer email | Line 1405: `resolvedEmail = isKnownCustomer ? knownCustomer?.email : email.trim()`. But firstName/lastName come from local state which was populated from lookup. | PASS | P1 |
| T-SUB-03 | Idempotency key generated per submission | Unique key sent in header | Line 1409: `createClientIdempotencyKey('tbl_web')` generates UUID. Sent as `Idempotency-Key` header. | PASS | P1 |
| T-SUB-04 | Blocked booking returns to choose step | Error shown, step changes to 'choose' | Line 1463-1467: if `state === 'blocked'`, sets error from `BLOCKED_REASON_COPY` and calls `setStep('choose')`. | PASS | P1 |
| T-SUB-05 | Pending payment without PayPal order | Error shown to user | Result sets `state: 'pending_payment'`. Effect at line 657 creates PayPal order. If order creation fails, `paymentState` = 'error' and error alert shown at line 2241-2244. | PASS | P1 |
| T-SUB-06 | Submission sends `sunday_lunch: true` flag for Sunday lunch | Flag included in payload | Line 1431: `...(effectiveSundayLunch ? { sunday_lunch: true } : {})`. | PASS | P2 |
| T-SUB-07 | Submission sends `menu_selections` for Sunday lunch | Selections array included | Line 1432: `...(sundaySelections.selections ? { menu_selections: sundaySelections.selections } : {})`. | PASS | P2 |
| T-SUB-08 | API error during submission | Error displayed, not silently swallowed | Catch at line 1468: `setError(submitError?.message || ...)`. | PASS | P2 |

---

## Category 7: Payment Flow

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-PAY-01 | Pending payment triggers PayPal order creation | PayPal order ID fetched, buttons shown | Effect at line 657-684 calls `/api/table-bookings/paypal/create-order`. On success, `paypalOrderId` set, `PayPalDepositSection` rendered. | PASS | P1 |
| T-PAY-02 | PayPal approval triggers capture | Capture endpoint called, success updates state | `PayPalDepositSection.handleApprove` calls `/api/table-bookings/paypal/capture-order`. On success, `onSuccess()` -> `setPaymentState('confirmed')`. | PASS | P1 |
| T-PAY-03 | PayPal order creation fails | Error shown, user can start new booking | Catch at line 680: sets `paymentError` and `paymentState('error')`. Alert at line 2241-2244 shows error. "Start a new booking" button at line 2278. | PASS | P1 |
| T-PAY-04 | PayPal capture fails | Error shown but PayPal buttons remain | `onError` callback sets `paymentError` and `paymentState('error')`. Error alert at line 2252-2256 rendered alongside PayPal buttons. User can retry. | PASS | P2 |
| T-PAY-05 | Hold expiry displayed to user | Formatted London time shown | `holdExpiry` computed at line 588 via `formatHoldExpiry`. Displayed at line 2248-2250. | PASS | P2 |
| T-PAY-06 | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` missing | PayPal script fails to load | `PayPalDepositSection` uses `process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!` with non-null assertion at line 48. If undefined, PayPal SDK will fail. No graceful fallback. | **WARN** | P2 |

---

## Category 8: Flow Tests (Happy Paths)

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-FLOW-01 | Happy path: food booking, 2 guests, weekday | find -> choose -> details -> review -> confirmed | Steps flow correctly. No deposit required. Confirm button says "Confirm booking". | PASS | P1 |
| T-FLOW-02 | Happy path: drinks booking | find -> choose -> details -> review -> confirmed | Purpose set to 'drinks'. Sunday lunch auto-disabled. No deposit (unless >= 7). | PASS | P1 |
| T-FLOW-03 | Sunday lunch with pre-order | find -> choose -> details (menu selection) -> review -> pending_payment -> PayPal -> confirmed | Sunday lunch enabled, menu loaded at details step, deposit shown at review, PayPal flow triggered on pending_payment. | PASS | P1 |
| T-FLOW-04 | Group of 8 with deposit | find -> choose -> details -> review (deposit shown) -> pending_payment -> PayPal | Group deposit = 80. Button says "Confirm and pay deposit". | PASS | P1 |
| T-FLOW-05 | Known customer shortcut | Phone lookup returns known=true, skips name/email fields | Name fields hidden, "Welcome back" shown, continues to review. | PASS | P1 |
| T-FLOW-06 | No availability -> alternatives shown | "Nearest alternatives" panel with up to 6 slots from next 3 days | `loadNearestAlternatives` fetches +1/+2/+3 days, up to 6 slots shown. Waitlist CTA present. | PASS | P1 |
| T-FLOW-07 | Mother's Day booking (before cutoff) | Date locked to 2026-03-15, purpose locked to food, Sunday lunch auto-enabled | Effects at lines 629-643 enforce date/purpose/sundayLunch. Date input replaced with static display. | PASS | P1 |
| T-FLOW-08 | Mother's Day after cutoff | Warning shown, user can still book weekday menu | Alert at lines 1616-1627 shows cutoff message. Form still functions for regular Sunday booking. | PASS | P1 |
| T-FLOW-09 | Event suggestion -> event booking switch | Event booking form replaces table booking form | `selectedSuggestedEvent` set, `ManagementEventBookingForm` rendered at line 1539. "Back to table booking" button available. | PASS | P2 |

---

## Category 9: Error / Edge Cases

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-ERR-01 | No availability at all (no alternatives found) | "No nearby online alternatives were found." + waitlist CTA | Lines 1833-1834: fallback message shown. Waitlist block at lines 1837-1845. | PASS | P1 |
| T-ERR-02 | API error during availability check | Error alert shown | Catch at line 1022: `setAvailabilityError(...)`. Alert at line 1717-1720. | PASS | P1 |
| T-ERR-03 | Phone lookup fails | Error shown, lookup state reset to idle | Catch at line 1267: `setLookupState('idle')`, error shown. | PASS | P1 |
| T-ERR-04 | Booking submission fails | Error alert with phone number | Catch at line 1468. Error displayed with "Call 01753 682707 if you need help." | PASS | P1 |
| T-ERR-05 | PayPal order creation fails | Error alert shown, new booking option | See T-PAY-03 above. | PASS | P1 |
| T-ERR-06 | PayPal capture fails | Error shown, retry possible | See T-PAY-04 above. | PASS | P2 |
| T-ERR-07 | Sunday lunch menu unavailable | Error alert, submission blocked | See T-SUN-05 above. | PASS | P1 |
| T-ERR-08 | Missing required fields at review step | Validation catches, error shown | `validateDetailsStep()` checks selectedTime, phone, detailsUnlocked, name fields, and Sunday menu selections. | PASS | P1 |
| T-ERR-09 | Past date selected | Error shown before API call | `handleFindTable` at line 991-998 compares to today. Also `handleDateChange` at lines 1092-1107 sets `dateError`. | PASS | P1 |
| T-ERR-10 | User closes browser during PayPal flow | Booking stays in pending_payment state | No client-side handling for this. Booking remains "pending_payment" on the server. Hold expiry should eventually release the table. This is acceptable behavior -- not a defect. | PASS | P3 |

---

## Category 10: State Management

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-STATE-01 | Changing date resets availability and alternatives | Previous availability cleared | `handleDateChange` does NOT reset availability or alternatives. Only `handleFindTable` resets them (lines 1006-1011). The date change alone doesn't clear stale availability data. | **WARN** | P2 |
| T-STATE-02 | Switching purpose (food -> drinks) clears Sunday lunch | Sunday lunch disabled, availability/alternatives reset | `handlePurposeSelection` (line 1118-1134): clears sundayLunch, selectedTime, availability, alternatives. Correct. | PASS | P2 |
| T-STATE-03 | Going back to step 1 preserves party size | Party size retained | `handleBackToFind` only sets `step` and clears `error`. Party size preserved. | PASS | P2 |
| T-STATE-04 | Phone lookup reset allows re-entering phone | All customer state cleared | `resetPhoneLookup` clears lookupState, knownCustomer, firstName, lastName, email. Phone field re-enabled. | PASS | P2 |
| T-STATE-05 | "Book another table" resets all state | Full reset to initial state | `resetJourney` (line 1475-1509) resets all state variables comprehensively. | PASS | P2 |
| T-STATE-06 | Changing party size updates guest orders array | Guest orders resized, existing selections preserved | Effect at lines 620-627 preserves previous entries by index. If partySize shrinks, excess entries dropped. If grows, new entries added with empty menuItemId. | PASS | P2 |

---

## Category 11: AI Agent Endpoint

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-AGENT-01 | Legacy language: "card hold" in specialInstructions | No legacy "credit card hold" language | Line 155 in agent route: "Bookings of 7+ require a card hold to secure the booking (no charge)." -- This uses LEGACY language "card hold" which is explicitly called out as always a bug in CLAUDE.md. Should say "deposit". | **FAIL** | P1 |
| T-AGENT-02 | Agent email required vs public form optional | Agent requires email; public form makes it optional | Agent validation at line 39 requires `customer.email`. Public form allows empty email. Different contract is intentional but undocumented. | **WARN** | P3 |
| T-AGENT-03 | Agent Sunday auto-detection | Sunday dates auto-resolve to sunday_lunch type | Line 67: `bookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')`. Could over-aggressively default to sunday_lunch for drinks bookings on Sundays. | **WARN** | P2 |

---

## Category 12: Legacy BFF Endpoint (booking/submit)

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-BFF-01 | Party size not validated for max | Backend should enforce max 20 | `bookingData.partySize` passed directly from client with no max clamp. The downstream API handles this via `too_large_party` blocked reason. | **WARN** | P2 |
| T-BFF-02 | Service window enforcement | Times outside service windows rejected | Lines 100-139: service window check with proper error codes. Defense-in-depth guard working. | PASS | P1 |
| T-BFF-03 | Idempotency key generation | Unique UUID per request | Line 171: `crypto.randomUUID()` -- but this is per-request, not per-user-session. If user double-clicks, two different UUIDs are generated, defeating the purpose. | **FAIL** | P1 |

---

## Summary

| Status | Count |
|--------|-------|
| PASS   | 46    |
| FAIL   | 5     |
| WARN   | 6     |
| BLOCKED| 0     |
| **Total** | **57** |
