# Remediation Plan — Book Table Form

## Priority Order (dependency-aware)

### Batch 1: Critical + High (sequential — DEFECT-001 must go first)

**DEFECT-001**: Fix mobile party size input
- Add `partySizeDisplay` string state for the raw input value
- Keep `partySize` number state for business logic
- Allow empty string as transient display state
- Parse and clamp (1-20) on blur and on "Find a table" click
- Cap max to 20 (combines with DEFECT-003)
- Files: `ManagementTableBookingForm.tsx`

**DEFECT-003**: Cap frontend party size to 20 (merged into DEFECT-001 fix)
- Change `max={50}` to `max={20}` on Input
- Change clamp from 50 to 20 in onChange
- Change `parsePartySize` in `page.tsx` from 50 to 20
- Files: `ManagementTableBookingForm.tsx`, `app/book-table/page.tsx`

### Batch 2: Independent fixes (can run in parallel)

**DEFECT-002**: Fix AI agent "card hold" language
- Replace line 154-155 specialInstructions text
- Remove "(no charge)" claim
- Files: `app/api/booking/agent/route.ts`

**DEFECT-004**: Add deposit reassurance to PayPal section
- Add "This deposit is deducted from your final bill." line near deposit amount
- Files: `components/features/TableBooking/PayPalDepositSection.tsx`

**DEFECT-005**: Fix legacy BFF idempotency key
- Check for `Idempotency-Key` header before generating
- Files: `app/api/booking/submit/route.ts`

**DEFECT-006**: Fix sidebar copy
- "tables of 8+" → "tables of 20+"
- "For larger groups" → "For groups of 20+"
- Files: `app/book-table/page.tsx`

**DEFECT-007**: Clear stale state on date change
- Add `setAvailability(null); setAlternativeSlots([]); setSelectedTime('')` to handleDateChange
- Files: `ManagementTableBookingForm.tsx`

**DEFECT-008**: Make email optional in AI agent
- Remove email from required validation
- Files: `app/api/booking/agent/route.ts`

**DEFECT-009**: Default sms_opt_in to false in AI agent
- Change `sms_opt_in: true` to `sms_opt_in: body.customer.smsOptIn ?? false`
- Files: `app/api/booking/agent/route.ts`

## Estimated Scope

- **Files modified**: 5
- **Approximate lines changed**: ~60
- **Breaking changes**: None
- **Complexity score**: S (2)
