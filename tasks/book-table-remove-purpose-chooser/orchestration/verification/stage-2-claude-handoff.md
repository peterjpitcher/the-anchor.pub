# Claude Hand-Off Brief — /book-table Purpose-Chooser Removal

**Generated:** 2026-04-29
**Review mode:** B (Code Review)
**Overall risk:** Low (after Wave 4G corrections)
**HEAD:** 5516b15

## DO NOT REWRITE

These decisions are sound and should be preserved on follow-up:

- The combined-slot helper architecture in `lib/table-booking-service-windows.ts` (`resolveCombinedServiceRanges`, `buildSlotsWithKitchenState`). Both the availability route and the API client fallback consume it; do not duplicate.
- The strict submit-time `purpose` derivation in `ManagementTableBookingForm.tsx:1200` (`deriveSubmitPurpose`). Block-on-no-match is correct; do not relax it.
- `selectedSlotService` carrying `kitchen_open` through `handleSlotSelect` and `handleAlternativeSelect`. Don't simplify the alternative path back to date-and-time alone.
- The neutral copy in `/api/table-bookings/route.ts` and `/api/booking/agent/route.ts` rejection paths. Don't reintroduce purpose-specific wording.
- The `meta.service_model: 'combined_food_drinks'` marker on the availability response. Useful for downstream consumers and observability.

## SPEC REVISION REQUIRED

None. Spec §6/§7/§8 still describe the implementation correctly. Spec §10 already covers all the edge cases.

## IMPLEMENTATION CHANGES REQUIRED

### Already applied in commit `5516b15`
- [x] **AB-001:** `app/api/table-bookings/route.ts` — require explicit `purpose`; reject missing/invalid with HTTP 400.
- [x] **AB-002:** `app/api/booking/agent/route.ts` — same requirement on the agent POST path.
- [x] **AB-003:** `app/api/booking/agent/route.ts` — neutralise outside-window error copy.
- [x] **USER-REPORTED:** `lib/table-booking-service-windows.ts:resolveServiceRanges` — drinks ranges now ignore `schedule_config` `drinks`/`regular` entries and always return the venue/pub opens-closes window. Wizard slot grid spans full pub hours.

### Defer to user decision (not a code fix)
- [ ] **ARCH-001:** `app/book-table/page.tsx:22-23,82` — page metadata + `FoodEstablishmentReservation` JSON-LD mention "Pub food", "Sunday roast", and use the food-establishment schema. **Recommendation: keep.** Per the spec the customer-copy rule covers booking-flow communications; page meta and structured data are general SEO/marketing content. Removing the schema would harm SEO without serving the user's intent. Flag in PR description; defer to user to override if disagreed.

### Follow-up PRs (advisory, not blocking)
- [ ] **WF-001:** Add a current-request token (counter or `AbortController`) to `loadNearestAlternatives` so a stale response cannot repopulate `alternativeSlots` after the user has moved on. **File:** `components/features/TableBooking/ManagementTableBookingForm.tsx:793`.
- [ ] **WF-002:** When `handleAlternativeSelect` fires, either refetch availability for the new date before entering details, or invalidate `availability` so a back-to-choose triggers a refetch. **File:** `components/features/TableBooking/ManagementTableBookingForm.tsx:955`.
- [ ] **SEC-001:** Mirror the party-size validation from the public route into the agent route. **File:** `app/api/booking/agent/route.ts:35`.
- [ ] **SEC-002:** Replace raw exception reflection with a static neutral message; log details server-side via `logError`. **File:** `app/api/booking/agent/route.ts:154`.

## ASSUMPTIONS TO RESOLVE

- [ ] **WF-003:** Confirm The Anchor never configures cross-midnight booking windows. If it ever does (e.g., NYE), `buildSlotsFromRanges` will silently drop those ranges. Currently not exercised — confirm with the operator and add a regression test if/when overnight hours become real.
- [ ] **AB-005:** If `schedule_config` food capacity is ever lower than the venue capacity (50), the wizard could over-state availability for kitchen-open slots. The management API's actual table-booking enforcement is the safety net. Worth verifying in production data when convenient.

## REPO CONVENTIONS TO PRESERVE

- All customer-facing strings in the booking flow remain neutral — no food/drinks/booking-type/booking-purpose/kitchen-hours/bar-hours wording outside the per-slot caption.
- Direct API callers (`/api/table-bookings`, `/api/booking/agent`) MUST send an explicit `purpose: 'food' | 'drinks'`. The website's wizard derives this from `kitchen_open`; agents must do the same.
- `purpose` is hidden from customers, but server-side `logError` calls may continue to log it for diagnostics.
- The "drinks" time window is **always** full pub-open hours, regardless of `schedule_config` content. Don't reintroduce `schedule_config` short-circuiting for drinks/regular booking_types.
- The wizard's submit must block (not silently default) when no slot can be matched for purpose derivation. The neutral message is `"Please choose a time again before confirming."`

## RE-REVIEW REQUIRED AFTER FIXES

None. The blocking findings have been addressed and verified by the post-fix pipeline run (lint/typecheck/test/build). Deferred items are advisory and can be addressed in follow-up PRs at the user's discretion.

## REVISION PROMPT

Not needed — Wave 4G already executed all blocking corrections. If/when the user decides to follow up on the advisory items, a focused prompt could be:

> Apply the WF-001 and WF-002 advisories from `tasks/book-table-remove-purpose-chooser/orchestration/verification/stage-2-claude-handoff.md`. Add an `AbortController`/request-id to `loadNearestAlternatives` so stale responses are dropped. Update `handleAlternativeSelect` to invalidate or refetch `availability` so back-navigation from details shows the alternative date's slots. Add component tests for both behaviours. One commit, neutral copy maintained.

Plus separately:

> Apply SEC-001 and SEC-002 from the same handoff brief. Mirror the public route's party-size validation in `app/api/booking/agent/route.ts`. Replace the raw exception-message reflection in the agent POST catch handler with a static neutral message; log details via `logError`. Update agent route tests. One commit.
