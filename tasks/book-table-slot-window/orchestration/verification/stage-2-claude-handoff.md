# Claude Hand-Off Brief — /book-table Slot Window PR

**Generated:** 2026-04-30
**Review mode:** B (Code Review)
**Overall risk:** Low (after Wave R repair commit)
**HEAD:** 716fcf2

## DO NOT REWRITE

These decisions are sound and should be preserved on follow-up:

- The two-helper architecture: `pickSlotWindow` (presentation-layer windowing, pure) and `londonIsoDate` (timezone formatting, pure). Both centralise their concern; do not duplicate inline.
- `slotWindowAnchorTime` as a separate state from `requestedTime`. Setting it ONLY in `runAvailabilitySearch` and `resetJourney` is correct; do not re-introduce mutation from input handlers or slot selection.
- Submit-intent fingerprint pattern with `useRef` (not React state) — the value never renders.
- Fingerprint excludes `_t`, `turnstile_token`, `website` (volatile fields). Don't add them.
- Default Preferred Time clamp to `'23:30'` on midnight wrap. Don't try to auto-advance the date — that requires UI flicker work.
- The submit-time purpose derivation strict rule remains unchanged.
- Mobile tap-target sizes (`min-h-14` for slot buttons, `min-h-12` everywhere else, `size="lg"` on inputs) match spec §11.

## SPEC REVISION REQUIRED

None. Spec §1.1 / §5–§13 still describe the implementation correctly after the repair commit.

## IMPLEMENTATION CHANGES REQUIRED

### Already applied in commit `716fcf2`
- [x] **CODEX-AB-001:** `addDays()` rewritten to pure UTC arithmetic.
- [x] **CODEX-AB-002 / WF-003:** Default Preferred Time clamped to `'23:30'` on midnight wrap.
- [x] **CODEX-AB-003:** `clearSubmitIntentIdempotencyKey()` invoked on `state === 'confirmed'`.
- [x] **CODEX-ARCH-002:** `setSlotWindowAnchorTime(value)` removed from `handleRequestedTimeChange`.
- [x] **CODEX-WF-004:** Review-step Back button gets `disabled={loading}`.

### Out of scope (separate commit owners)
- [ ] **CODEX-AB-004 / AB-005 / ARCH-001 / ARCH-003 / WF-001:** All concerned with `app/events/[id]/page.tsx` redirect behaviour from external commit `b319ee6`. Not part of this PR. Track separately if the user wants the SEO redirect work re-reviewed.
- [ ] **CODEX-AB-007:** docs claim in `tasks/gsc-indexing-fix/REVIEW-PACK.md` from external commit `7f6a99d`. Not in this PR.

### Follow-up PRs (advisory, not blocking)
- [ ] **CODEX-AB-006 / ARCH-004:** Add a defensive sort or assertion in `pickSlotWindow` to make the "sorted-by-time input" contract explicit. The availability route already sorts; this is belt-and-braces.
- [ ] **CODEX-WF-002:** Add a request-token or `AbortController` to `loadNearestAlternatives` so stale responses cannot repopulate `alternativeSlots` after the user has moved on. Carried over from the prior PR's review.

## ASSUMPTIONS TO RESOLVE

None blocking. The following were validated during review:
- Management API dedupe semantics (verified by reading `OJ-AnchorManagementTools/src/app/api/table-bookings/route.ts`): Idempotency-Key + payload hash. Client-side fingerprint is correct.
- UK is always UTC+0 or UTC+1; UTC midnight always lands in same UK calendar day. `addDays()` was correct under both BST and GMT, and is now defensively rewritten anyway.
- `pickSlotWindow` requires sorted-by-time input (by convention; advisory fix tracked above).

## REPO CONVENTIONS TO PRESERVE

- All date/time computations in the booking wizard use `londonNowParts()` / `londonIsoDate()` / `toTimeString()` from `lib/table-booking-service-windows.ts`. Don't reintroduce `toISOString().slice(0, 10)` or `new Date(value + 'T00:00:00')` for booking validation.
- The booking payload sent to `/api/table-bookings` carries `date: 'YYYY-MM-DD'` and `time: 'HH:mm'` interpreted as Europe/London — never an offset, never `Z`, never a full ISO datetime.
- The wizard's submit-intent key reuses the same `Idempotency-Key` for retries of the same booking payload; new keys for changed payloads.
- Slot-window logic operates on `availableSlots` (filtered by `isSlotAvailable`), not raw `availability.time_slots`.
- `slotWindowAnchorTime` is set ONLY in `runAvailabilitySearch` and `resetJourney`. Anywhere else is a bug.

## RE-REVIEW REQUIRED AFTER FIXES

None. The five blocking codex findings have been addressed and verified by the post-fix pipeline run (typecheck/test/build).

## REVISION PROMPT (if you want to address the advisories later)

> Apply CODEX-AB-006 and CODEX-WF-002 from `tasks/book-table-slot-window/orchestration/verification/stage-2-claude-handoff.md`. In `lib/table-booking-slot-window.ts:pickSlotWindow`, add a defensive sort by `toMinutes(slot.time)` at the top so the helper is robust against an unsorted input array. Update the helper test to cover an unsorted input case. In `components/features/TableBooking/ManagementTableBookingForm.tsx:loadNearestAlternatives`, capture an `AbortController` (or per-search request id), and discard the response if it doesn't match the current `date/requestedTime/partySize`. Add a component test that exercises a stale-response race. One commit, neutral copy preserved, no API contract change.
