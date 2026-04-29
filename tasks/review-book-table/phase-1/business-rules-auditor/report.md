# Business Rules Auditor Report — Book Table Form

**Date**: 2026-03-21
**Target**: `/book-table` page, `ManagementTableBookingForm`, submission APIs
**Verdict summary**: 2 incorrect, 3 partially correct, 1 contradicted, multiple policy drift items

---

## 1. Rules Inventory

### R1: Deposit — groups of 7+
- **Rule**: £10 deposit per person for groups of 7 or more
- **Source**: CLAUDE.md domain rules, `lib/constants.ts` line 54
- **Code location**: `ManagementTableBookingForm.tsx` line 600 (`requiresGroupDeposit = !requiresSundayLunchDeposit && partySize >= 7`)
- **Verdict**: **Correct** — threshold is 7, rate is £10/person, deposit text is accurate

### R2: Deposit — all Sunday lunch bookings
- **Rule**: £10 deposit per person for ALL Sunday lunch bookings regardless of party size
- **Source**: CLAUDE.md domain rules, `lib/constants.ts` line 62-63
- **Code location**: `ManagementTableBookingForm.tsx` line 599 (`requiresSundayLunchDeposit = mothersDayMode || (selectedDateIsSunday && sundayLunch)`)
- **Verdict**: **Correct** — applies to all Sunday lunch regardless of size

### R3: Deposits deducted from final bill
- **Rule**: Deposits are deducted from the final bill
- **Source**: CLAUDE.md domain rules
- **Code locations**:
  - `page.tsx` line 210: "This is deducted from your final bill" (sidebar, groups)
  - `page.tsx` line 211: Sunday lunch constant includes "deducted from your final bill"
  - Form line 2223: "This deposit is deducted from your final bill" (Sunday lunch review)
  - Form line 2227: "This is deducted from your final bill" (group deposit review)
  - `PayPalDepositSection.tsx` line 54: shows "(£10 per person)" but does NOT say deducted
- **Verdict**: **Partially correct** — PayPalDepositSection (the actual payment screen) omits "deducted from your final bill" messaging, which is the most critical place to reassure the customer

### R4: No "credit card hold" / "card hold" language
- **Rule**: Legacy "credit card hold" language anywhere is ALWAYS a bug
- **Source**: CLAUDE.md domain rules
- **Code location**: `app/api/booking/agent/route.ts` line 154
- **Verdict**: **INCORRECT — BUG FOUND**
  - Line 154: `'Sunday lunch roasts must be pre-ordered by 1pm Saturday. Bookings of 7+ require a card hold to secure the booking (no charge).'`
  - This says "card hold" and "(no charge)" — both are factually wrong. It IS a deposit. It IS a charge (£10/person). This text is returned to AI agents who relay it to customers.

### R5: Party size limits — frontend max 50, backend max 20
- **Rule**: Frontend allows 1-50, backend API rejects >20
- **Source**: Brief, `lib/booking-config.ts` line 17, `app/api/table-bookings/route.ts` line 269
- **Code locations**:
  - Form line 529: `Math.min(Math.max(..., 1), 50)` — frontend cap is 50
  - Form line 1643-1644: `min={1} max={50}` — HTML input allows 1-50
  - API route line 269: `payload.party_size > 20` — backend rejects >20
  - `booking-config.ts` line 17: `maxOnlinePartySize: 20`
- **Verdict**: **INCORRECT — SILENT FAILURE**
  - Customer can select party size 21-50 in the form. They go through all 4 steps, enter personal details, agree to policy, hit confirm — then get a generic error. The form never warns them that online booking maxes at 20.
  - The `too_large_party` blocked reason copy (line 123) says "For larger groups, please call us" but this requires the backend to return `too_large_party` as blocked_reason — the 400 validation error may not use this code path.

### R6: Kitchen hours enforcement
- **Rule**: Tue-Fri 6pm-9pm, Sat 1pm-7pm, Sun 1pm-6pm, Mon CLOSED
- **Source**: CLAUDE.md, `page-old.tsx` lines 207-215
- **Code location**: `lib/table-booking-service-windows.ts` — dynamically resolved from `businessHours` API data, not hardcoded
- **Verdict**: **Correct approach** — hours come from a live API (`anchorAPI.getBusinessHours()`), validated server-side in both submission routes. The form checks availability before showing slots, so out-of-hours bookings are prevented at the slot selection stage.

### R7: Sunday lunch pre-order cutoff — 1pm Saturday (London time)
- **Rule**: Sunday lunch pre-orders close at 1pm Saturday
- **Source**: CLAUDE.md domain rules
- **Code location**: `lib/sunday-lunch-cutoff.ts` lines 3-5 (`SUNDAY_LUNCH_CUTOFF_HOUR = 13`), line 35 (`addDaysIsoDate(isoSundayDate, -1)` = Saturday)
- **Verdict**: **Correct** — cutoff is 13:00 London time on the Saturday before. The form disables Sunday lunch selection after cutoff, shows clear messaging.

### R8: Phone lookup — returning customers skip name/email
- **Rule**: Known customer: pre-fill first name, last name, email. New customer: must provide first name, last name, mobile. Email optional for new customers.
- **Code location**: Form lines 1247-1266 (lookup handler), lines 1947-1975 (conditional fields)
- **Verdict**: **Correct** — known customers get name/email pre-filled and the name fields are hidden. Unknown customers see first name, last name (required) and email (labeled "optional"). Email is not required in validation (line 1354 checks only firstName and lastName).

### R9: SMS confirmation after booking
- **Rule**: SMS confirmation sent after booking
- **Code location**: Not visible in frontend code — handled server-side by the management API
- **Verdict**: **Cannot verify from frontend** — the confirmation screen (line 1561) says "We've sent confirmation details by SMS", which is correct customer-facing language. Actual SMS sending is backend responsibility.

### R10: PayPal for deposit payments
- **Rule**: PayPal for deposit payments
- **Code location**: `PayPalDepositSection.tsx`, form line 2257-2271
- **Verdict**: **Correct** — PayPal integration used for all deposit payments

### R11: Payment hold with expiry
- **Rule**: Payment creates a hold with expiry. Customer must complete within window.
- **Code location**: Form lines 2247-2250 (hold expiry display), `formatHoldExpiry()` function
- **Verdict**: **Correct** — hold expiry is shown during payment. If payment link is unavailable, error with phone fallback is shown (submit/route.ts lines 188-196).

### R12: Mother's Day date
- **Rule**: Fixed date March 15, 2026
- **Source**: `lib/mothers-day-booking.ts` line 3
- **Verdict**: **Partially correct / Potentially stale** — `MOTHERS_DAY_SERVICE_DATE = '2026-03-15'`. Mother's Day 2026 is indeed March 15, 2026 (Mothering Sunday in UK). However, today is 2026-03-21 — this date has already passed. The form still accepts `mothers_day=true` prefill but the cutoff logic would block it since the cutoff has passed. No harm, but the hardcoded date needs updating for 2027 eventually.

### R13: Booking duration 120 minutes
- **Rule**: Default booking duration is 120 minutes
- **Code location**: `submit/route.ts` line 157 (`duration_minutes: 120`), `agent/route.ts` line 124 (`duration_minutes: body.duration || 120`)
- **Verdict**: **Correct** — both routes default to 120 minutes. Agent route allows override.

### R14: Walk-ins always welcome
- **Rule**: Walk-ins always welcome
- **Code location**: `page-old.tsx` line 83-86 (old page has explicit walk-in messaging)
- **Verdict**: **Missing from new page** — the new `page.tsx` does not mention walk-ins anywhere. The old page had a prominent "Walk-ins always welcome!" alert.

### R15: Tables held for 15 minutes
- **Rule**: Tables held for 15 minutes
- **Code location**: `page-old.tsx` line 146: "Tables are held for 15 minutes"
- **Verdict**: **Missing from new page** — present in old page but not in the new `page.tsx` sidebar copy

### R16: AI agent email requirement
- **Rule**: Email should be optional for new customers
- **Code location**: `agent/route.ts` line 39: email is required (`!body.customer.email`)
- **Verdict**: **Contradicted** — the AI agent endpoint requires email, but the business rule says email is optional. This means AI agents will reject bookings where the customer doesn't provide an email.

---

## 2. Value Audit

| Value | In Code | Should Be | Status |
|-------|---------|-----------|--------|
| Deposit per person | £10 | £10 | Correct |
| Group deposit threshold | 7+ guests | 7+ guests | Correct |
| Frontend max party size | 50 | 20 (to match backend) | **WRONG** |
| Backend max party size | 20 | 20 | Correct |
| Sunday cutoff hour | 13 (1pm) | 13 (1pm) | Correct |
| Sunday cutoff day | Saturday (Sunday - 1) | Saturday | Correct |
| Mother's Day date | 2026-03-15 | 2026-03-15 (past) | Stale |
| Default booking duration | 120 min | 120 min | Correct |
| Default party size | 2 (regular), 4 (Mother's Day) | Reasonable | OK |
| Phone number | 01753 682707 | 01753 682707 | Correct |

---

## 3. Customer-Facing Language Audit

### Sidebar copy (page.tsx)

| Location | Text | Issue |
|----------|------|-------|
| Line 209 | "For larger groups, please call us." | **Vague** — doesn't say what size threshold. Should say "groups of 20+" to match backend limit. |
| Line 210 | "A £10 per person deposit is required for groups of 7 or more. This is deducted from your final bill." | **Correct** |
| Line 211 | SUNDAY_LUNCH_DEPOSIT_POLICY_COPY constant | **Correct** — "A £10 per person deposit is required for every Sunday lunch booking and is deducted from your final bill." |
| Line 220 | "Our team can help with tables of 8+" | **Inconsistent** — suggests call for 8+, but online booking works up to 20. Should align with actual limit. |

### Blocked reason copy (form)

| Key | Text | Issue |
|-----|------|-------|
| too_large_party | "For larger groups, please call us so we can arrange your booking." | **Vague** — doesn't say max is 20 |
| outside_hours | Correct | OK |
| cut_off | Correct | OK |
| no_table | Correct, includes phone number | OK |

### PayPal payment screen

| Location | Text | Issue |
|----------|------|-------|
| PayPalDepositSection line 53-55 | "Deposit: £{amount} (£10 per person)" | **Missing** "deducted from your final bill" reassurance |
| PayPalDepositSection line 69 | "Your card details are never shared with us. Powered by PayPal." | Correct |

### Booking confirmation screen

| Location | Text | Issue |
|----------|------|-------|
| Form line 1556 | "You're all booked in — see you soon!" | OK |
| Form line 1561 | "We've sent confirmation details by SMS." | OK |
| Form line 1566-1568 | Arrival instructions (free parking, no check-in needed) | OK |

### Mother's Day copy

| Location | Text | Issue |
|----------|------|-------|
| Form line 1635 | "Mother's Day Sunday Lunch is fixed to Sunday, 15 March 2026" | Date has passed — stale but harmless since cutoff blocks it |
| Form line 1659 | "Date: Sunday, 15 March 2026" | Same |

---

## 4. Admin/Staff-Facing Language Audit

Not applicable — this is a public customer-facing form. No admin UI reviewed.

---

## 5. Policy Drift Findings

### CRITICAL

1. **AI Agent "card hold" language** (`agent/route.ts` line 154)
   - Says: "require a card hold to secure the booking (no charge)"
   - Should say: "require a £10 per person deposit, deducted from your final bill"
   - Impact: AI agents (GPT, etc.) give customers wrong information about the payment policy. Customers may be surprised by an actual charge.

2. **Frontend/backend party size mismatch** (form max=50, API max=20)
   - Customer selects 25 guests, fills out entire form, hits confirm, gets cryptic error
   - Impact: Poor UX, potential lost bookings, wasted customer time

### HIGH

3. **Sidebar copy inconsistency** — "tables of 8+" (line 220) vs actual limit of 20 online
   - "Our team can help with tables of 8+" suggests you need to call for 8 people, but online booking handles up to 20. This discourages online bookings unnecessarily.

4. **PayPal deposit screen missing "deducted from bill"** reassurance
   - At the moment of payment, customer doesn't see that the deposit counts toward their bill. This is the highest-anxiety moment and the most important place for this message.

### MEDIUM

5. **Walk-ins messaging removed** — old page had "Walk-ins always welcome!" prominently. New page has no walk-in messaging anywhere. This was a deliberate customer-friendly policy that's now invisible.

6. **"Tables held for 15 minutes"** — present in old page, absent from new page. Customers have no expectation-setting about hold duration.

7. **AI agent requires email** — contradicts "email is optional for new customers" rule. AI agents reject bookings without email.

8. **"For larger groups" without size threshold** — sidebar (line 209) and blocked reason copy both say "for larger groups" without specifying the maximum. Customer doesn't know what counts as "larger."

### LOW

9. **Mother's Day date is stale** — `2026-03-15` has passed (today is 2026-03-21). The cutoff logic correctly blocks it, so no functional impact, but the hardcoded date will need updating for 2027.

10. **Old page (`page-old.tsx`) email address wrong** — line 239 references `info@theanchorpub.co.uk` but `lib/constants.ts` says the official email is `manager@the-anchor.pub`. The old page is presumably not served, but the file exists in the repo.

11. **AI agent sms_opt_in hardcoded to true** — `agent/route.ts` line 123 sets `sms_opt_in: true` without asking the customer. The web form at least has a `marketingOptIn` field.

---

## Summary of Required Fixes (Priority Order)

| # | Severity | Fix |
|---|----------|-----|
| 1 | CRITICAL | Remove "card hold (no charge)" from `agent/route.ts` line 154 — replace with "£10 per person deposit, deducted from your final bill" |
| 2 | CRITICAL | Cap frontend party size input to 20 (matching backend) OR show clear error before step 4 when >20 |
| 3 | HIGH | Fix sidebar "tables of 8+" to align with actual 20-person online limit |
| 4 | HIGH | Add "deducted from your final bill" to PayPalDepositSection |
| 5 | MEDIUM | Make email optional in AI agent endpoint (line 39) |
| 6 | MEDIUM | Add walk-in welcome messaging to new page |
| 7 | MEDIUM | Add "tables held for 15 minutes" to new page |
| 8 | MEDIUM | Specify party size threshold in "larger groups" copy |
| 9 | LOW | Plan Mother's Day date update mechanism for future years |
| 10 | LOW | Fix old page email to `manager@the-anchor.pub` or delete old page |
| 11 | LOW | Don't hardcode `sms_opt_in: true` in agent endpoint |
