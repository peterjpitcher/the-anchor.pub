# Consolidated Defect Log — Book Table Form

**Date**: 2026-03-21
**Section**: /book-table (ManagementTableBookingForm + APIs)
**Sources**: Structural Mapper, Business Rules Auditor, Technical Architect, QA Specialist
**Test Coverage**: 57 test cases — 46 PASS, 5 FAIL, 6 WARN

---

## DEFECT-001: Mobile party size input cannot be cleared to retype
- **Severity**: CRITICAL
- **Business Impact**: Mobile users (majority of public traffic) cannot change party size once entered without refreshing the page. Blocks the primary booking flow — this is the user's reported issue.
- **Root Cause Area**: `ManagementTableBookingForm.tsx` lines 1647-1654
- **Source**: All 4 agents, user report
- **Affected Files**: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- **Test Case IDs**: T-MOBILE-01, T-MOBILE-02, T-MOBILE-03
- **Acceptance Criteria**: User can select-all-delete on mobile, field shows empty, then type new number. Value clamped 1-20 on blur.
- **Root Cause**: `if (raw === '') return` rejects empty string in controlled input onChange, snapping back to previous value.

## DEFECT-002: AI agent endpoint uses banned "card hold" language
- **Severity**: HIGH
- **Business Impact**: AI agents (GPT-5 etc.) relay incorrect policy to customers — says "card hold (no charge)" when it's actually a £10/person deposit that IS charged.
- **Root Cause Area**: `app/api/booking/agent/route.ts` line 154-155
- **Source**: Business Rules Auditor, QA Specialist, Structural Mapper
- **Affected Files**: `app/api/booking/agent/route.ts`
- **Test Case IDs**: T-AGENT-01
- **Acceptance Criteria**: No "card hold" or "(no charge)" language. Must say "£10 per person deposit, deducted from your final bill".

## DEFECT-003: Frontend party size max (50) mismatches backend max (20)
- **Severity**: HIGH
- **Business Impact**: Customers can enter 21-50 guests, complete all 4 steps including personal details and policy acceptance, then get a cryptic rejection. Wasted time, lost bookings.
- **Root Cause Area**: `ManagementTableBookingForm.tsx` lines 1643-1644, 529, 1652; `app/book-table/page.tsx` line 48
- **Source**: Business Rules Auditor, Technical Architect, QA Specialist, Structural Mapper
- **Affected Files**: `ManagementTableBookingForm.tsx`, `app/book-table/page.tsx`
- **Test Case IDs**: T-BOUND-08
- **Acceptance Criteria**: Frontend max capped to 20. Input max={20}, clamp to 20, parsePartySize caps at 20. Sidebar copy updated to match.

## DEFECT-004: PayPal deposit screen missing "deducted from bill" reassurance
- **Severity**: HIGH
- **Business Impact**: At the highest-anxiety payment moment, customer doesn't know the deposit counts toward their bill. May abandon payment or feel misled.
- **Root Cause Area**: `PayPalDepositSection.tsx` line 53-55
- **Source**: Business Rules Auditor
- **Affected Files**: `components/features/TableBooking/PayPalDepositSection.tsx`
- **Test Case IDs**: T-DEP-05
- **Acceptance Criteria**: PayPal section shows "This deposit is deducted from your final bill" near the amount.

## DEFECT-005: Legacy BFF idempotency key generated per-request
- **Severity**: MEDIUM
- **Business Impact**: Double-click or network retry on legacy form path creates duplicate bookings. Low traffic path but data integrity risk.
- **Root Cause Area**: `app/api/booking/submit/route.ts` line 171
- **Source**: QA Specialist, Technical Architect
- **Affected Files**: `app/api/booking/submit/route.ts`
- **Test Case IDs**: T-BFF-03
- **Acceptance Criteria**: Use client-provided `Idempotency-Key` header if present; fall back to server-generated UUID only for non-JS form submissions.

## DEFECT-006: Sidebar copy inconsistencies
- **Severity**: MEDIUM
- **Business Impact**: "Tables of 8+" suggests calling for 8+ people, discouraging online bookings that work up to 20. "For larger groups" doesn't specify the threshold.
- **Root Cause Area**: `app/book-table/page.tsx` lines 209, 220
- **Source**: Business Rules Auditor
- **Affected Files**: `app/book-table/page.tsx`
- **Test Case IDs**: N/A
- **Acceptance Criteria**: Sidebar says "For groups of 20+, please call us" and "Our team can help with tables of 20+".

## DEFECT-007: Date change doesn't clear stale availability state
- **Severity**: LOW
- **Business Impact**: Minor — mitigated by "Find a table" button which resets all state. But if user goes back from step 2, changes date, old slots could briefly appear.
- **Root Cause Area**: `ManagementTableBookingForm.tsx` lines 1092-1107
- **Source**: QA Specialist
- **Affected Files**: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- **Test Case IDs**: T-STATE-01
- **Acceptance Criteria**: `handleDateChange` clears availability, alternativeSlots, selectedTime.

## DEFECT-008: AI agent requires email (contradicts optional email rule)
- **Severity**: LOW
- **Business Impact**: AI agents reject bookings without email. Low traffic path.
- **Root Cause Area**: `app/api/booking/agent/route.ts` line 39
- **Source**: Business Rules Auditor
- **Affected Files**: `app/api/booking/agent/route.ts`
- **Test Case IDs**: T-AGENT-02
- **Acceptance Criteria**: Email validation removed from required fields; email sent as optional.

## DEFECT-009: AI agent hardcodes sms_opt_in: true
- **Severity**: LOW
- **Business Impact**: Opts customers into SMS marketing without consent when booked via AI agent.
- **Root Cause Area**: `app/api/booking/agent/route.ts` line 123
- **Source**: Business Rules Auditor
- **Affected Files**: `app/api/booking/agent/route.ts`
- **Test Case IDs**: N/A
- **Acceptance Criteria**: Default `sms_opt_in` to false unless explicitly provided by the agent.

---

## OUT OF SCOPE — Backend/Infrastructure Items

These were identified by the Technical Architect as critical but require changes in OJ-AnchorManagementTools or infrastructure, not this codebase:

- **C1**: Orphaned `pending_payment` bookings — needs server-side cron to expire after `hold_expires_at`
- **C2**: No PayPal create-order retry — needs "Retry payment" button (minor frontend change possible)
- **C3**: PayPal capture failure reconciliation — needs backend webhook/reconciliation
- **C4**: Payment confirmation is client-only state — needs post-capture server state refresh

## OUT OF SCOPE — Enhancement Items

- Walk-in messaging removed from new page (was on old page)
- "Tables held for 15 minutes" messaging removed from new page
- Mother's Day date hardcoded as 2026-03-15 (already passed, needs yearly update mechanism)
- Component decomposition (2319 lines → step components + custom hooks)
- Test coverage (4 tests for 2319 lines of business logic)
