# Book Table Form Remediation — Changes Log

## DEFECT-001 + DEFECT-003: Mobile party size input + cap to 20
**Status**: FIXED
**Files changed**:
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `app/book-table/page.tsx`

**Changes**:
1. Added `partySizeDisplay` (string) state alongside existing `partySize` (number) state.
2. Input `value` now binds to `partySizeDisplay` instead of `partySize`.
3. `onChange` updates `partySizeDisplay` freely (including empty string), only syncing to `partySize` when valid.
4. Added `onBlur` handler that clamps 1-20 and syncs both states.
5. `handleFindTable` also syncs partySizeDisplay -> partySize before proceeding.
6. Changed `max={50}` to `max={20}` on the Input element.
7. Changed clamp ceiling from 50 to 20 in onChange handler.
8. Changed `defaultPartySize` clamp from 50 to 20.
9. `resetJourney` now resets `partySizeDisplay` alongside `partySize`.
10. `parsePartySize` in `app/book-table/page.tsx` now caps at 20 instead of 50.

**Test cases covered**: T-MOBILE-01, T-MOBILE-02, T-MOBILE-03, T-BOUND-08

---

## DEFECT-002: AI agent "card hold" language
**Status**: FIXED
**Files changed**: `app/api/booking/agent/route.ts`

**Changes**:
- Replaced "card hold" language with correct deposit policy language.
- partySize >= 7: mentions £10 per person deposit, deducted from final bill.
- partySize < 7: mentions £10 per person deposit, deducted from final bill.

**Test cases covered**: T-AGENT-01

---

## DEFECT-004: PayPal deposit screen missing "deducted from bill"
**Status**: FIXED
**Files changed**: `components/features/TableBooking/PayPalDepositSection.tsx`

**Changes**:
- Added reassurance text below deposit amount: "This deposit is deducted from your final bill."

**Test cases covered**: T-DEP-05

---

## DEFECT-005: Legacy BFF idempotency key
**Status**: FIXED
**Files changed**: `app/api/booking/submit/route.ts`

**Changes**:
- Now checks for client-provided `Idempotency-Key` header before generating a random UUID.

**Test cases covered**: T-BFF-03

---

## DEFECT-006: Sidebar copy inconsistencies
**Status**: FIXED
**Files changed**: `app/book-table/page.tsx`

**Changes**:
- "For larger groups, please call us." -> "For groups of 20+, please call us."
- "tables of 8+" -> "tables of 20+"

**Test cases covered**: N/A (copy fix)

---

## DEFECT-007: Date change doesn't clear stale state
**Status**: FIXED
**Files changed**: `components/features/TableBooking/ManagementTableBookingForm.tsx`

**Changes**:
- `handleDateChange` now clears `availability`, `alternativeSlots`, and `selectedTime` when the date changes.

**Test cases covered**: T-STATE-01

---

## DEFECT-008: AI agent requires email
**Status**: FIXED
**Files changed**: `app/api/booking/agent/route.ts`

**Changes**:
- Removed `!body.customer.email` from the required-field validation check.
- Email remains in the payload but is now optional.

**Test cases covered**: T-AGENT-02

---

## DEFECT-009: AI agent hardcodes sms_opt_in
**Status**: FIXED
**Files changed**: `app/api/booking/agent/route.ts`

**Changes**:
- Changed `sms_opt_in: true` to `sms_opt_in: body.customer.smsOptIn ?? false`.

**Test cases covered**: N/A
