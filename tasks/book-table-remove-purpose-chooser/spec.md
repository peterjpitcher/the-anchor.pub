# Spec: Remove "Booking for" chooser from /book-table

**Status:** Revised after adversarial review  
**Owner:** Peter  
**Last updated:** 2026-04-29

---

## 1. Goal

Simplify the public `/book-table` journey by removing the customer-facing "Booking for" chooser. Customers choose party size, date, and time. The slot picker explains what each time supports:

- **Drinks & food** when the kitchen is open at that slot.
- **Drinks only** when the bar is open but the kitchen is closed.

The site still submits `purpose: 'food' | 'drinks'` to the management API because that contract is unchanged. The customer should not have to choose or understand that internal field.

---

## 2. Adversarial Corrections

These are the issues the original draft understated or got wrong:

1. **`app/api/table-bookings/route.ts` is in scope for copy and regression tests.** Its service-window validation is purpose-aware and can surface customer-visible "Food bookings..." errors. The validation should stay, but the copy must not reintroduce the removed chooser concept.
2. **Submit-time purpose cannot be derived from `selectedTime` alone.** The current nearest-alternatives path stores only `{ date, time }`. If a customer picks a late drinks-only alternative, a lookup against the old availability response would fail and default to food. The implementation must carry `kitchen_open` metadata with selected slots and alternatives.
3. **The availability contract affects shared code.** `lib/api/client.ts` has a server fallback availability builder, and `app/api/booking/agent/route.ts` proxies through `/api/table-bookings/availability`. They need test expectation updates or they will drift from the new combined-slot contract.
4. **`?purpose=` is not "dropped by Next.js."** It remains in the URL. We simply stop reading it. Existing links keep working as no-ops.
5. **Email copy is not controlled by this repo.** This PR can remove purpose language from the website UI, but management-app SMS/email templates are a separate follow-up.

---

## 3. Current Repo Facts

- `/book-table` renders `ManagementTableBookingForm` from `components/features/TableBooking/ManagementTableBookingForm.tsx`.
- The current form keeps `purpose` state, sends it to `/api/table-bookings/availability`, and forwards it to `/api/table-bookings`.
- `lib/table-booking-service-windows.ts` already resolves different windows for `purpose: 'food'` and `purpose: 'drinks'`.
- `/api/table-bookings` validates the submitted purpose against service windows before forwarding to the management API with `booking_type: 'regular'`.
- Sunday lunch as a separate public booking type is retired. Per `CLAUDE.md`, Sunday lunch is walk-in friendly 1pm-6pm, with no pre-order flow and no Sunday-specific deposit.
- Group deposit behavior is independent of purpose: groups of 10+ require the existing GBP10/head deposit.

---

## 4. Scope

### In Scope

- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `app/book-table/page.tsx`
- `app/api/table-bookings/availability/route.ts`
- `app/api/table-bookings/route.ts` for neutral customer-facing service-window copy and regression tests only.
- `lib/table-booking-service-windows.ts`
- `lib/api/bookings.ts`
- `lib/api/client.ts` availability fallback/type alignment.
- Test updates in `tests/unit`, `tests/api`, `app/api/table-bookings/__tests__`, and `app/api/booking/agent/__tests__` where the availability contract changes.

### Out of Scope

- Management API request/response contract. We still send `purpose` and `booking_type: 'regular'`.
- Management app staff UI.
- Management app SMS/email templates.
- Event booking, parking, private hire, and enquiry forms.
- A full rewrite of the legacy exported `TableBookingForm`, `BookingDatePicker`, and `AvailabilityChecker` components. They are not mounted by `/book-table` today. See risk section before reusing them.
- Changing real opening hours, kitchen hours, or capacity rules.
- Removing every existing marketing link that contains `?purpose=`. Those links become harmless no-ops, though new links should not add purpose params.

---

## 5. Customer-Facing Behaviour

### Before

1. Step "Find table": party size, date, preferred time, and "Booking for" select.
2. Step "Choose time": slots are filtered by purpose. The heading says "Showing food slots" or "Showing drinks-only slots."
3. If food has no slots and drinks does, the form offers a separate switch-to-drinks prompt.
4. Details/review shows "Booking for: Food (kitchen hours)" or "Booking for: Drinks (bar hours)."
5. Confirmation/review summary can expose Food/Drinks as the booking purpose.

### After

1. Step "Find table": party size, date, and preferred time only.
2. Step "Choose time": shows the combined bookable set for that date. In practice this is the bar/drinks window, with kitchen state stamped on each slot.
3. Each visible slot shows time plus a service caption:
   - `Drinks & food` for `kitchen_open === true`.
   - `Drinks only` for `kitchen_open === false`.
4. There is no switch-to-drinks prompt because both service states are already visible.
5. Details, review, payment, and confirmation screens do not mention booking purpose, food booking, drinks booking, kitchen-hours booking, or bar-hours booking.

General page marketing copy can still talk about food, drinks, Sunday roast, and menus. The removed concept is the customer choosing a hidden booking-purpose classification.

---

## 6. Availability Contract

`TableAvailabilitySlot` gains `kitchen_open?: boolean`:

```ts
export interface TableAvailabilitySlot {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  requires_prepayment?: boolean
  kitchen_open?: boolean
}
```

For responses generated by `/api/table-bookings/availability`, `kitchen_open` must be present on every slot. It is typed as optional only for compatibility with older callers and defensive parsing.

Frontend rendering rule:

- `true` => show `Drinks & food`.
- `false` => show `Drinks only`.
- `undefined` => show no caption and default submit derivation to `food`.

Do not render `undefined` as `Drinks & food`; that would hide missing data and can mislabel late bar-only slots.

---

## 7. Backend Design

### `lib/table-booking-service-windows.ts`

Add exported helpers alongside `resolveServiceRanges`:

```ts
export type CombinedServiceRangeResolution = {
  ranges: ServiceRange[]
  kitchenRanges: ServiceRange[]
  closed: boolean
  message?: string
}

export function resolveCombinedServiceRanges(
  businessHours: BusinessHours,
  isoDate: string,
  options?: { bookingType?: BookingType }
): CombinedServiceRangeResolution

export function buildSlotsWithKitchenState(
  ranges: ServiceRange[],
  kitchenRanges: ServiceRange[],
  partySize: number,
  slotIntervalMinutes?: number,
  minMinutesForToday?: number
): Array<{
  time: string
  available: boolean
  available_capacity: number
  reason?: string
  kitchen_open: boolean
}>
```

Implementation rules:

- Resolve drinks ranges with `resolveServiceRanges(..., { bookingType: 'regular', purpose: 'drinks' })`; this is the master public booking window.
- Resolve food ranges with `resolveServiceRanges(..., { bookingType: 'regular', purpose: 'food' })`; this is only the kitchen-open overlay.
- If the drinks/master result is closed, return `closed: true`, empty ranges, and the closed message.
- If food ranges are empty because the kitchen is closed, keep the master ranges and stamp all slots `kitchen_open: false`.
- Do not add food-only ranges that are outside the master bar/drinks window. That would mean the hours config is internally inconsistent; the public booking window must not exceed the venue/bar booking window.
- Determine `kitchen_open` with `isTimeWithinRanges(slot.time, kitchenRanges)`. End times are exclusive, matching current helper behavior.

Important precedence rule:

- Special-hours kitchen data must override regular kitchen data for that date. If a special-hours record explicitly opens the kitchen on a normal kitchen-closed day, the food overlay should be open. Add a regression test for this because the existing code is easy to get wrong by OR-ing regular `is_kitchen_closed` into special-day resolution.

### `app/api/table-bookings/availability/route.ts`

- Continue validating `date`, `party_size`, and `time`.
- Continue accepting `booking_type` and `purpose` query params for backwards compatibility, but ignore both for public combined availability.
- Call `resolveCombinedServiceRanges` and `buildSlotsWithKitchenState`.
- Return neutral messages:
  - Available: `These times are based on current service windows and will be confirmed instantly when you continue.`
  - Unavailable: `No online times are currently available for this request. Please choose another date or call 01753 682707.`
  - `special_notes`: `If your preferred time is unavailable, choose a nearby slot or call 01753 682707.`
- Remove `meta.purpose`. Use `meta: { source: 'schedule_fallback', service_model: 'combined_food_drinks' }` if metadata is needed.

### `app/api/table-bookings/route.ts`

Do not remove purpose handling here. This route remains the contract boundary to the management API.

Required changes:

- Keep accepting explicit `purpose: 'food' | 'drinks'`; stale clients that omit it may continue to default to `food`.
- Keep service-window validation by submitted purpose. This prevents direct POSTs from booking a food table outside kitchen hours.
- Replace purpose-specific customer-facing error copy. For example:
  - `That time is outside online booking hours. Please choose another time or call 01753 682707.`
- Keep logging `purpose` server-side for diagnostics.

### `lib/api/client.ts`

The private fallback `buildTableAvailabilityFromBusinessHours()` must not keep returning old food-only/default behavior. Either:

- refactor it to call the same combined helper functions, or
- remove the duplicated implementation and always use the internal route when available.

The response type must preserve `kitchen_open` when `anchorAPI.checkTableAvailability()` returns data.

---

## 8. Frontend Design

### State and Types

Update local types:

```ts
type AvailabilitySlot = {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  kitchen_open?: boolean
}

type SelectedSlotService = {
  date: string
  time: string
  kitchen_open?: boolean
}

type AlternativeSlot = SelectedSlotService
```

Keep `kitchen_open` through `normalizeAvailabilityResponse`.

Add state:

```ts
const [selectedSlotService, setSelectedSlotService] =
  useState<SelectedSlotService | null>(null)
```

Clear it whenever date, party size, requested time, availability, or journey reset invalidates the chosen slot.

### Remove Purpose State

Delete:

- `BookingPurpose` from the form.
- `prefill.purpose`.
- `purpose` state and `setPurpose`.
- `handlePurposeSelection`.
- `drinksAlternative` state and all switch-to-drinks logic.
- Purpose arguments in `fetchAvailabilityForDate`, `loadNearestAlternatives`, and `runAvailabilitySearch`.
- Purpose suffixes in analytics contexts such as `availability_first_food`.

Availability fetches should send only `date`, `party_size`, and `time` unless another existing non-purpose param is genuinely required.

### Slot Selection

Change slot selection to receive the full slot:

```ts
function handleSlotSelect(slot: AvailabilitySlot) {
  setSelectedTime(slot.time)
  setRequestedTime(slot.time)
  setSelectedSlotService({
    date,
    time: slot.time,
    kitchen_open: slot.kitchen_open
  })
}
```

Nearest alternatives must carry `kitchen_open` from the candidate response:

```ts
.map((slot) => ({
  date: response.date || targetDate,
  time: slot.time,
  kitchen_open: slot.kitchen_open
}))
```

`handleChooseAlternative()` must set `selectedSlotService` from the chosen alternative before moving to details. Do not jump to details with only date/time.

### Submit Purpose Derivation

At submit time:

1. Prefer `selectedSlotService` if it matches the current `date` and `selectedTime`.
2. Otherwise look up the slot in the current `availability.time_slots`.
3. If a matching slot exists and `kitchen_open === false`, submit `purpose: 'drinks'`.
4. If a matching slot exists and `kitchen_open` is `true` or `undefined`, submit `purpose: 'food'`.
5. If no matching slot can be found, block submit with a neutral error: `Please choose a time again before confirming.` Do not silently submit a guessed purpose.

This is stricter than the original draft and prevents the nearest-alternative bug.

### UI Copy

Required changes in `ManagementTableBookingForm.tsx`:

| Current copy/location | Required result |
|---|---|
| Step intro: `party size, date, booking type, and time` | `party size, date, and time` |
| `Booking for` select and helper | Removed |
| Hours-note footer: `Tables booked here are for dining...` | Removed |
| Slot heading: `Showing food slots` / `Showing drinks-only slots` | Remove or replace with neutral `Pick a time` |
| Slot buttons | Add service caption under time |
| Switch-to-drinks prompt | Removed |
| Details-step purpose card | Removed |
| Review `Booking for` row | Removed |
| Confirmation/payment summaries | No purpose row or purpose wording |

Recommended slot button structure:

```tsx
<span className="block">{formatTimeForDisplay(slot.time)}</span>
{typeof slot.kitchen_open === 'boolean' ? (
  <span className="mt-1 block text-xs font-normal text-anchor-cream-text/60">
    {slot.kitchen_open ? 'Drinks & food' : 'Drinks only'}
  </span>
) : null}
```

Selected and disabled styles should remain tied to availability/selection, not to kitchen state.

### `app/book-table/page.tsx`

- Remove `purpose` from `BookTablePageProps`.
- Delete `parsePurpose`.
- Stop passing `prefill.purpose`.
- Keep `date`, `time`, and `party_size` prefill unchanged.
- Existing URLs with `?purpose=food`, `?purpose=drinks`, `?sunday_lunch=true`, or `?mothers_day=true` remain valid no-ops unless another live path still uses them.

---

## 9. API Agent Impact

`app/api/booking/agent/route.ts` has two separate behaviours:

- **POST:** keep explicit `purpose` support. Agents can still book drinks-only late slots by sending `purpose: 'drinks'`.
- **GET availability:** because it proxies `/api/table-bookings/availability`, it should stop claiming purpose-filtered availability. Either remove the forwarded `purpose` param or accept it as a no-op and include `kitchen_open`/service labels in returned times.

Update tests that currently assert the agent GET "passes purpose through" to the availability URL. That assertion is no longer correct once public availability is combined.

---

## 10. Edge Cases

- **Normal kitchen-open slot:** slot shows `Drinks & food`; submit sends `purpose: 'food'`.
- **Late bar-only slot:** slot shows `Drinks only`; submit sends `purpose: 'drinks'`.
- **Monday or other kitchen-closed day:** master ranges come from bar/drinks; all slots show `Drinks only`.
- **Special day with `kitchen: null`:** treat as deliberate kitchen closure; all master slots show `Drinks only`.
- **Special day with `is_kitchen_closed: true`:** treat as kitchen closed even if a kitchen object is present.
- **Special day that explicitly opens kitchen on an otherwise kitchen-closed regular day:** show `Drinks & food` inside that special kitchen window.
- **Venue closed all day:** no slots; existing closed-day message remains neutral.
- **Split kitchen service:** slots inside either kitchen range show `Drinks & food`; gaps and late slots show `Drinks only`.
- **Current-day cutoff:** preserve the current "now + 60 minutes rounded to next 30" slot filtering.
- **Group of 10+ drinks-only booking:** existing deposit logic still applies because it is party-size based.
- **Missing `kitchen_open` from an old response:** show no caption; if submitted from a matching slot, default to `food`.

---

## 11. Tests

### Unit Helper Tests

Add or update tests for `lib/table-booking-service-windows.ts`:

- Combined ranges return bar/drinks slots with `kitchen_open: true` inside kitchen hours and `false` outside.
- Kitchen-closed date returns bar/drinks slots all stamped `false`.
- `kitchen: null` on special hours stamps all slots `false`.
- `is_kitchen_closed: true` stamps all slots `false`.
- Special-hours explicit kitchen-open data overrides a regular kitchen-closed day.
- Venue-closed date returns empty slots and closed message.

### Availability Route Tests

Replace `tests/api/table-bookings-availability-purpose.test.ts` with combined-contract assertions:

- Omitting `purpose` returns the combined slot set.
- `purpose=food` and `purpose=drinks` are accepted but return the same combined slot set.
- A slot before kitchen close has `kitchen_open: true`.
- A slot after kitchen close has `kitchen_open: false`.
- `meta.purpose` is absent.
- Messages and `special_notes` are neutral.

### Submit Route Tests

Keep direct service-window enforcement tests because they protect the API boundary:

- Direct `purpose: 'food'` outside kitchen hours still rejects and does not call upstream.
- Direct `purpose: 'drinks'` in a late bar slot still forwards upstream.
- Rejection copy no longer says "Food bookings", "switch to drinks", or similar customer-facing chooser language.

### Form Tests

Update `tests/unit/ManagementTableBookingForm.test.tsx`:

- The "Booking for" select is absent.
- The availability fetch URL does not contain `purpose=`.
- Slot captions render from `kitchen_open`.
- Choosing a kitchen-open slot submits `purpose: 'food'`.
- Choosing a kitchen-closed slot submits `purpose: 'drinks'`.
- Choosing a nearest alternative preserves its `kitchen_open` flag and submits the correct purpose.
- Details/review/confirmation screens do not show booking-purpose wording.

### Agent Tests

Update `tests/api/booking-agent-service-window.test.ts` and `app/api/booking/agent/__tests__/route.test.ts`:

- Agent POST purpose behaviour remains unchanged.
- Agent GET no longer asserts purpose-filtered availability or forwarded `purpose`.
- If agent GET returns service labels, assert they match `kitchen_open`.

### Commands

Run at minimum:

- `npm run lint`
- `npm run test -- --runTestsByPath tests/unit/ManagementTableBookingForm.test.tsx tests/api/table-bookings-availability-purpose.test.ts tests/api/table-bookings-service-window.test.ts tests/api/booking-agent-service-window.test.ts`
- `npm run build`

If the test file is renamed, use the new filename in the targeted Jest command.

---

## 12. Backwards Compatibility

- `/book-table?purpose=...` links keep loading; purpose is ignored.
- `/api/table-bookings/availability?purpose=...` keeps returning HTTP 200 for valid requests, but no longer filters by purpose.
- `/api/table-bookings` still accepts and forwards `purpose`.
- Management API contract is unchanged.
- `TableAvailabilitySlot.kitchen_open` is optional in TypeScript for older consumers, but present in new route responses.

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Late drinks-only alternatives submit as food | Carry `kitchen_open` in `AlternativeSlot` and block submit if selected-slot metadata cannot be recovered. |
| Kitchen flags wrong on special-hours days | Add explicit tests for `kitchen: null`, `is_kitchen_closed`, and special-day kitchen-open override. |
| Purpose language leaks through submit errors | Update `app/api/table-bookings/route.ts` error copy and tests. |
| Shared availability fallback drifts from route | Refactor `lib/api/client.ts` fallback to use the same helper or test it against the same contract. |
| Agent GET consumers expected purpose-filtered slots | Return combined slots with service metadata and update tests/documentation. Agent POST still supports explicit purpose. |
| Management emails still say food/drinks booking | Track as out-of-repo follow-up in `OJ-AnchorManagementTools`. |
| Legacy exported table booking components show combined slots but submit default food | They are not live on `/book-table`; document as a reuse risk or update them in a separate cleanup before reintroducing. |

Rollback is a normal code revert. There is no database migration and no management API contract change.

---

## 14. Acceptance Criteria

- [ ] `/book-table` step 1 has no "Booking for" chooser.
- [ ] `/book-table` step 1 has no dining disclaimer footer.
- [ ] Availability requests from the wizard do not include `purpose`.
- [ ] The time grid shows combined bookable slots with correct `Drinks & food` / `Drinks only` captions.
- [ ] Submit sends `purpose: 'food'` for kitchen-open selected slots.
- [ ] Submit sends `purpose: 'drinks'` for kitchen-closed selected slots, including nearest alternatives.
- [ ] Review, details, payment, confirmation, and inline error copy do not expose the hidden purpose classification.
- [ ] Direct API service-window enforcement still blocks invalid food/drinks combinations.
- [ ] Availability response types and `lib/api/client.ts` fallback preserve `kitchen_open`.
- [ ] Updated unit/API tests pass.
- [ ] `npm run lint` and `npm run build` pass.

