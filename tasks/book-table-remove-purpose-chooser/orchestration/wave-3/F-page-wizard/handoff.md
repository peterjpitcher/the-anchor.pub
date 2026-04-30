# Wave 3F — Page + Wizard Refactor — Handoff

**Owner:** Wave 3F agent
**Status:** Complete
**Commit SHA:** `27f74c0`

---

## Files modified (3)

- `app/book-table/page.tsx` — removed `parsePurpose`, `purpose` field on `BookTablePageProps.searchParams`, and `prefill.purpose`.
- `components/features/TableBooking/ManagementTableBookingForm.tsx` — full refactor per plan T8.
- `tests/unit/ManagementTableBookingForm.test.tsx` — replaced obsolete chooser-related assertions with seven new test cases covering the combined-slot UX and submit-purpose derivation; preserved the Mother's Day filter, PayPal fallback, and funnel-sequence regression tests.

---

## Customer-facing strings removed (verified)

Each grep run against `components/features/TableBooking/ManagementTableBookingForm.tsx` returns zero matches (or only a developer comment, as noted):

| Search | Result |
|---|---|
| `"Booking for"` | gone |
| `"drinks-only"` | gone |
| `"kitchen hours"` | gone |
| `"bar hours"` | gone |
| `"switch to drinks"` | gone |
| `"any time during bar hours"` | gone |
| `"Tables booked here are for dining"` | gone |
| `"Food (kitchen"` (chooser option) | gone |
| `"Drinks (bar"` (chooser option) | gone |
| `"Showing .* slots"` | gone |
| `"switch between food and drinks"` | gone |
| `"Food bookings"` (helper text) | gone |
| `"Drinks-only bookings"` (helper text) | gone |
| `"booking type"` (step-1 intro) | gone |
| `purpose=` (URL construction) | gone |
| `BookingPurpose` type alias | gone (the local one) |
| `drinksAlternative` state | gone |
| `handlePurposeSelection` | gone |

Only one match remains: a developer-facing JSDoc comment around the `hoursNote` `useMemo` describing the rendered "Bar open … · Kitchen open …" summary. That summary is informational and uses ASCII bullet, not the removed dining footer.

---

## Tests — added/updated

Added (TDD-first; failed before refactor, pass after):

1. `does not render the "Booking for" chooser`
2. `does not render the dining disclaimer footer`
3. `does not include purpose in the availability fetch URL`
4. `renders "Drinks & food" caption on kitchen-open slots and "Drinks only" on others`
5. `does not render the "Showing X slots" purpose-flavoured caption`
6. `submits purpose: food when a kitchen-open slot is chosen`
7. `submits purpose: drinks when a kitchen-closed slot is chosen`
8. `preserves kitchen_open through nearest-alternative selection`
9. `does not show booking-purpose wording on review or confirmation`

Preserved (with minimal updates):

- `filters Mother’s Day events out of booking-context suggestions` — dropped `purpose: 'drinks'` from prefill since prefill no longer accepts it.
- `renders the PayPal call-us recovery state with fallback_payment_url` — slot button name regex changed to `/1pm/` (caption now lives inside button).
- `fires the booking funnel sequence on a happy-path confirmed booking` — slot button regex updated similarly; availability fixture now includes `kitchen_open: true`.

---

## Verification

- `npx jest tests/unit/ManagementTableBookingForm.test.tsx` → **12 passed, 12 total**.
- `npx tsc --noEmit` → **clean**.
- Targeted booking-related tests (`ManagementTableBookingForm.test.tsx` + `tests/api/table-bookings-availability-combined.test.ts` + `tests/api/table-bookings-service-window.test.ts` + `tests/api/table-bookings.test.ts` + `tests/api/booking-agent-service-window.test.ts`) → **35 passed, 35 total**.
- The 2 pre-existing failures in `tests/api/event-bookings-policy-fallback.test.ts` (noted in the brief) and the unrelated UI-primitive test failures in `components/ui/primitives/__tests__/{Button,Input}.test.tsx` are NOT introduced by this PR.

---

## Implementation notes / judgement calls

1. **Atomic commit (T7+T8 squashed).** As recommended in the plan, T7 was not committed separately. The page refactor would have left `prefill.purpose` typecheck failures in main, so both files land in the same commit alongside the test rewrite.

2. **`hoursNote.footer` typed as `string | null`.** The venue-closed branch still has a meaningful footer (`'Please pick another date when we’re open.'`), so the field stays. Open-day branches now return `footer: null` and the JSX renders the paragraph only when non-null. This avoids a brittle conditional union.

3. **`handleSlotSelect` now receives the full `AvailabilitySlot`** rather than just the time string. The slot's `kitchen_open` is captured into a new `selectedSlotService` state at click time, which the submit step reads via `deriveSubmitPurpose()`.

4. **`handleChooseAlternative` carries `kitchen_open`.** `loadNearestAlternatives` was updated to map each candidate slot's `kitchen_open` into the `AlternativeSlot` shape, and `handleChooseAlternative` writes it into `selectedSlotService` before transitioning to the details step. The new test `preserves kitchen_open through nearest-alternative selection` exercises a scenario where the chosen alternative is on a different date than the current `availability` would cover, proving the lookup-fallback can't be relied on.

5. **Strict submit-purpose derivation.** `deriveSubmitPurpose()` returns `null` when no matching slot is found. `handleConfirmBooking` short-circuits with neutral copy `'Please choose a time again before confirming.'` and bumps the user back to the choose step. No silent default to `food`.

6. **Analytics context simplified.** `availability_first_${purpose}` → `'availability_first'`. No food/drinks suffix anywhere.

7. **Slot button structure.** Used the recommended structure verbatim — `<span class="block text-base font-semibold">{time}</span>` plus an optional `<span class="mt-1 block text-xs font-normal text-anchor-cream-text/60">{caption}</span>`. Wrapper class adjusted from `text-sm font-semibold transition-colors` to `text-center transition-colors` to allow the two-line layout to centre cleanly. Selected and disabled styles are still tied to `isSelected` only — kitchen state never affects the visual treatment of the button itself.

8. **`AvailabilitySlot` local type extended.** Added `kitchen_open?: boolean` and updated `normalizeAvailabilityResponse` to copy `kitchen_open` through. The optional shape is consistent with the response contract noted in `lib/api/bookings.ts`.

9. **`AlternativeSlot` aliased to `SelectedSlotService`.** The two structures are the same now (date + time + optional `kitchen_open`), so a single named type is used to make the intent clear.

10. **No deletion of the booking-availability `purpose=` URL params on inbound (e.g. `/book-table?purpose=food`).** Per spec §12 these are silently ignored as backwards-compat no-ops; the page-level prefill is gone but nothing breaks.

---

## Out of scope

- Management-app SMS/email templates (separate repo; tracked as out-of-repo follow-up).
- Wave 3 final verification pipeline (Task 9): lint + full test suite + production build. The brief defines this wave as the page+wizard atomic commit only; full pipeline runs in a later orchestration step.
- Pre-existing test failures in unrelated files (UI primitives, event-bookings-policy-fallback).
