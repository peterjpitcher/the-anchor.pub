# /book-table flow simplification: implementation spec

Date: 2026-07-29
Repo: OJ-The-Anchor.pub (with one companion item in OJ-AnchorManagementTools)
Primary file: `components/features/TableBooking/ManagementTableBookingForm.tsx` (2,814 lines)
Status: spec only, no code written

---

## 1. Problem statement and measurable goal

### 1.1 Problem

The public table-booking journey at `/book-table` is a fixed four-step wizard driven by a single
state variable (`ManagementTableBookingForm.tsx:57`, `:162`, `:682`). It has four problems, in
descending order of proven harm:

1. **A confirmed dead end that strands guests.** `availabilityInputsKey`
   (`ManagementTableBookingForm.tsx:748`) includes `highChairCount` and `isOutsideSeating`, and the
   effect at `:750-757` calls `setAvailability(null)` and `setSelectedTime('')` when they change.
   Both controls render on the **details** step (`:2471-2527`), which is *after* availability has
   been fetched. A guest who picks 7pm and then ticks "I'd like an outside table" has their
   availability silently wiped. `validateDetailsStep` (`:1481-1486`) then bounces them back to step
   2, which now shows "No online times available" (`:2261-2269`) and "No nearby online alternatives
   were found" (`:2286-2320`) with zero slot buttons. A throwaway probe against the real component
   reproduced this exactly: summary still showed 7pm, review never reached, bounced to choose, zero
   slot buttons remaining.
2. **The on-screen summary can lie.** Steps 3 and 4 render
   `formatTimeForDisplay(selectedTime || requestedTime)` (`:2361`, `:2583`). Because
   `handleSlotSelect` sets both (`:1247-1254`), the `|| requestedTime` fallback masks a wiped
   `selectedTime` and shows a time the guest no longer holds, immediately above a payment decision.
3. **A required field the server never acts on.** "Preferred Time" (`:2121-2128`) is required, is
   never in the booking POST body (`:1681-1704`, only `time: selectedTime` at `:1688`), and is not
   used by the availability API to shape or filter slots (`app/api/table-bookings/availability/route.ts:114`
   reads it, `:139-141` validates it, `:100` echoes it, `:78-85` never passes it to
   `buildSlotsWithKitchenState`). Its default is "London now + 1 hour rounded up, clamped to 23:30"
   (`:190-207`), so anyone opening the form after roughly 20:30 anchors the slot grid on 23:30 when
   the last real slot is 21:30.
4. **Too many steps and too much furniture.** Four steps, and the fourth ("review", `:2570-2616`)
   collects nothing at all. Step 1 alone carries party size, "just drinks", "accessible table",
   date, preferred time, an opening-hours panel (`:2018-2028`), a deposit badge (`:2064-2068`), a
   Heathrow aircraft note (`:2131-2137`), an events panel (`:2139-2145`) and up to two separate
   error surfaces (`:1994` and `:2151-2155`).

### 1.2 Measurable goal

Primary metric: `table_booking_funnel` `funnel_step=success` divided by `funnel_step=view` for
`source_component` values originating in the form (`lib/gtm-events.ts:393-425`). Target: **+10%
relative** over matched 14-day windows.

Honest caveat on baselines: **we do not have one yet.** Several controls in this form are days old
(the accessible-table checkbox shipped 2026-07-28 in commit `8e3460ed`), and
`funnel_step` values `availability_check` and `details_entered` exist in the type union
(`lib/gtm-events.ts:394`) but have **never been emitted by the code**. Baseline capture is therefore
step zero of this work (see §7 and §9). Do not claim a lift against a number we have not recorded.

Secondary metrics:

- Dead-end rate: count of guests who reach the details fields and end on a zero-slot grid. Target
  **zero**. Currently reproducible 100% of the time via the outside-seating toggle.
- Details-step completion (`details_entered` to `submit`). Expect a modest single-digit lift from
  making Last Name optional.
- Steps to book: four page transitions down to two.

Guardrails (must not regress):

- Rate of bookings with `requires_accessible_table = true` must not fall.
- Event-suggestion click-through from the **no-availability** variant
  (`booking_context: 'choose_step_no_availability'`) must not fall.
- Bookings with a blank or placeholder first name must not rise (AMS falls back to the literal
  string `'Unknown'` at `src/lib/sms/customers.ts:276`, which then pollutes every SMS greeting).

---

## 2. Current flow, documented exactly as it is today

### 2.0 Mechanics

- One state variable: `const [step, setStep] = useState<BookingStep>('find')` (`:682`), order fixed
  by `STEP_ORDER` (`:162`). There is **no URL state**, so a reload or browser Back drops the guest to
  step 1 with everything reset.
- Progress bar: `BookingProgressBar` at `:1992`, labels from `STEP_LABELS` (`:164`), aria value text
  at `:560`.

### 2.1 Step 1, "find"

Inputs:

| Field | Required | Default | Line |
|---|---|---|---|
| Party size | Yes | 2, clamped 1..20 | `:680`, `:2030-2062` |
| "Just drinks" | No | false | `:738`, `:2076-2089` |
| "I need an accessible table" | No | false | `:742`, `:2091-2106` |
| Date | Yes | prefill or London today, `min` = today | `:677-678`, `:2110-2119` |
| Preferred Time | Yes | London now +1h rounded to 30, clamped 23:30 | `:190-207`, `:679`, `:2121-2128` |

Non-input content on step 1: opening-hours panel (`:874-922`, `:2018-2028`; says "We're closed all
day on this date." at `:885` but does **not** disable the button), £10pp deposit badge for 10+
(`:811`, `:2064-2068`), Heathrow aircraft-overhead note rendered unconditionally with
`aria-live="polite"` (`:777-780`, `:2131-2137`), events panel (`:2139-2145`), availability-error
Alert (`:2151-2155`) which is separate from the global error Alert (`:1994`).

Validation: past-date check only (`:1187-1190`), plus native HTML constraints via the real form
submit (`:2004-2009`). There is no opening-hours check and no upper bound on how far ahead a guest
can book.

Transition: `handleFindTable` (`:1175`) calls `runAvailabilitySearch` (`:1128`), which throws
"Please choose a date and time first." if either is falsy (`:1136-1138`), fetches availability
(`:1146-1168`), auto-selects the closest slot via `pickClosestSlot` (`:334-348`, `:1152-1165`), pins
the slot window anchor (`:1160-1162`) and only then calls `setStep('choose')` (`:1168`).

### 2.2 Step 2, "choose"

No form inputs. A 7-slot window (`lib/table-booking-slot-window.ts:4`) centred on the search-time
anchor (`:829-835`), a "See more times" expander (`:2225-2234`), a busyness advisory that rewrites
the primary button to "Book HH:MM anyway" (`:866`, `:2236-2259`, `:2347-2349`), a second events
panel with different wording and a highlight when there is no availability (`:2271-2284`), and the
zero-availability alert plus nearest alternatives and phone waitlist (`:2261-2320`).

The guest arrives with a slot **already selected**, so Continue can be pressed without choosing
anything. With zero slots, the Continue button is not rendered at all (`:2334-2351`), so there is no
forward action.

`handleChooseAlternative` (`:1261-1275`) jumps straight to step 3 for a **different date** than the
loaded availability, which is exactly why `deriveSubmitPurpose` (`:1528-1543`) has to fall back to
`selectedSlotService`.

### 2.3 Step 3, "details"

Two-phase. Only the mobile number field renders until a lookup runs (`:2366-2393`). After
`handlePhoneLookup` (`:1420`) succeeds, `detailsUnlocked` (`:813`) reveals: First Name and Last Name
(new customers only, `:2424-2445`), Email (optional, `:2448`), Notes (optional, `:2461-2470`), High
chair stepper and "I'd like an outside table" (`:2471-2527`), and communication consent
(`:2528-2535`). The phone field becomes `disabled` once unlocked (`:2374`); correcting it requires
"Use Different Number" (`:2395-2403`), which wipes first/last name and email via `resetPhoneLookup`
(`:1470-1479`).

Gate: `handleContinueToReview` (`:1506-1519`) then `validateDetailsStep` (`:1481-1504`).

### 2.4 Step 4, "review"

Collects **nothing**. A summary list (party size, date, time, mobile, guest name, deposit due),
`LARGE_GROUP_DEPOSIT_POLICY_COPY` for 10+, a "Worth knowing before you confirm" advisory
(`:2611-2616`), a change-of-plans phone line, the PayPal deposit section when
`result.state === 'pending_payment'` (`:2626-2703`), a Back button (`:2787`) and the confirm button
labelled "Confirm and pay deposit" or "Confirm booking" (`:2803`).

### 2.5 Backward bounces that exist today

- `:1482-1486` missing `selectedTime` during validation, jumps to step 2.
- `:1610-1615` underivable purpose at confirm, jumps to step 2.
- `:1743-1746` API returns `state === 'blocked'`, jumps to step 2 **after** a real POST.

---

## 3. Proposed flow

### 3.1 Target: two pages

**Page 1, "Find your table"**

Phase A (search): Party size, Date, "Just drinks", "I need an accessible table", opening-hours line,
deposit badge for 10+, primary button "Find a table".
Phase B (choose, revealed in place after the fetch returns): the slot grid as a proper labelled
group, a live count of times found, "See more times", the busyness advisory, the aircraft note
re-keyed to the selected slot, the events panel **only** when there is no availability, and the
nearest-alternatives and waitlist blocks.

**No** Preferred Time field. **No** pre-selected slot when the guest expressed no preference.

**Page 2, "Your details and confirm"**

Mobile number and lookup, then First Name (required), Last Name (optional), Email (optional), Notes,
High chair, Outside table, consent, an inline summary block, the deposit copy for 10+, and the
single confirm button. On `pending_payment` the whole form locks read-only and the PayPal section
renders.

### 3.2 Before and after

| | Today | Proposed |
|---|---|---|
| Steps | 4 (`find`, `choose`, `details`, `review`) | 2 |
| Page transitions to book | 4 | 2 |
| Required fields on page 1 | 3 (party size, date, preferred time) | 2 (party size, date) |
| Required fields for a new customer on later pages | 3 (mobile, first name, last name) | 2 (mobile, first name) |
| Slot pre-selected on arrival | Yes, always | Only when a `?time=` deep link supplied one |
| Default slot window | 7 slots centred on preferred time | Evening-first, see Change 4 |
| Events panel | Find step and choose step | No-availability case only |
| Aircraft note | Step 1, keyed to Preferred Time | Page 1 phase B, keyed to selected slot, plus the confirm summary |
| Step that collects nothing | "review" | Removed |
| Changing outside/high chair after choosing a time | Wipes availability, strands the guest | Re-runs availability in place, keeps the guest on the page |
| Summary time source | `selectedTime \|\| requestedTime` (can lie) | `selectedTime` only |

---

## 4. Change list, ordered by value for effort

Sequencing note: Change 1 is a hard prerequisite for Changes 5 and 6. Everything else is
independent.

---

### Change 1: Fix the availability-wipe dead end and the lying summary

**What.** Stop wiping the chosen slot when an availability input changes on a later step. Re-run
availability in place instead, and delete the `|| requestedTime` display fallback.

**Why.** This is the only *confirmed, reproducible* customer-losing bug in the journey. It fires on
the outside-table toggle and the high-chair stepper, both of which are genuine availability inputs
(`fetchAvailabilityForDate` sends `outside` and `high_chair_count` at `:1048-1050`; AMS consumes them
at `src/app/api/table-bookings/load/route.ts:173-181`). The `|| requestedTime` fallback then shows
the guest a time they no longer hold. Merging steps without fixing this first would put the toggle
inches from the Confirm button.

**Files touched.**
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `tests/unit/ManagementTableBookingForm.test.tsx`

**Exact edits.**
1. Replace the wipe effect at `:748-757`. Keep `availabilityInputsKey` as the change detector, but on
   change: if `availability` is currently loaded **and** a date is set, call `runAvailabilitySearch`
   again with the current inputs rather than `setAvailability(null)`. Debounce by 400ms so the
   high-chair stepper does not fire per tap.
2. While that refetch is in flight, keep the previously chosen `selectedTime` and show an inline
   "Rechecking availability with your new options..." line next to the summary.
3. On refetch success: if the chosen `selectedTime` is still available, keep it silently. If it is
   not, clear `selectedTime`, keep the guest on the page, and show an inline message: "Outside tables
   are not free at 7pm. Pick another time below." followed by the slot grid inline, not a step jump.
4. Delete the `|| requestedTime` fallback at `:2361` and `:2583`. Render `selectedTime` only, and if
   it is empty render nothing rather than a stale time.
5. Replace the three backward bounces with in-page recovery: `:1482-1486`, `:1610-1615` and
   `:1743-1746` must scroll to the slot grid and set an inline error, not call `setStep('choose')`.
   The `blocked` path at `:1743-1746` is the most important because it fires **after** a POST.

**Risk.** Medium. Extra availability calls. Each one fans out to 8 parallel Supabase queries plus the
`check_table_availability_v06` RPC, served `Cache-Control: no-store`
(`OJ-AnchorManagementTools/src/app/api/table-bookings/load/route.ts:111-129`, `:227`), and there is
**no rate limit on that route**. The 400ms debounce and the "only when availability is already
loaded" guard are what keep this safe. Do not add per-keystroke refetching.

**Effort.** M.

---

### Change 2: Make Last Name optional

**What.** Last Name becomes optional for new customers. First Name stays required.

**Why.** One fewer required field on the highest-friction part of the journey, which produces 61% of
table bookings (brand_site = 190 of 313 in the last 90 days). The pub already operates without
surnames: 79 walk-ins in 90 days have none, and 356 of 997 production customers (36%) have no usable
surname (148 blank, 208 placeholder such as "Unknown" or "Guest").

**Files touched.**
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `tests/unit/ManagementTableBookingForm.test.tsx`

**Exact edits.**
1. Remove `required` from the Last Name `Input` at `:2437-2445`. It is passed straight through to the
   native input by `components/ui/primitives/Input.tsx`, which sets `aria-required=true`, so leaving
   it would lie to screen readers.
2. Relabel to "Last Name (optional)" to match the existing "Email (optional)" convention at `:2448`.
   The `Input` component renders no asterisk, so the label is the only affordance.
3. `:1498`: change `if (!isKnownCustomer && (!firstName.trim() || !lastName.trim()))` to check first
   name only. Change the message at `:1499` to "Please enter your first name."
4. Close the permanent-loss hole: `:2424` hides the name fields entirely when `isKnownCustomer` is
   true, and AMS `src/lib/sms/customers.ts:93` only backfills a blank or placeholder surname when one
   is supplied. So a guest who books once without a surname is never asked again, ever. Fix: when the
   lookup returns a known customer whose `last_name` is blank or a placeholder, still render the
   optional Last Name field. The lookup response already carries `last_name` (`:1452`).

**Risk.** Low, with one operational note. 23.1% of table bookings in the last 120 days (74 of 321)
share a first name with another booking the same day, and surname is the current tiebreaker on the
door. BOH search and sort key on `guest_name`
(`OJ-AnchorManagementTools/.../BohBookingsClient.tsx:260`, `:560`) and degrade gracefully. The one
flow where a surname has evidential value is the no-show charge approval
(`src/app/m/[token]/charge-request/page.tsx:156`), which addresses the guest by first name with a
"Guest" fallback. Low volume, but see Open Question 2.

**Effort.** XS.

---

### Change 3: Remove the events panel from the find step only

**What.** Delete the `renderDateEventSuggestions` call site at `:2139-2145` (find step). Keep the
choose-step call site at `:2271-2284` exactly as it is.

**Why.** The find-step panel fires before the guest has even searched, on a date they may still
change. The choose-step panel is different: when `availableSlots.length === 0` it renders highlighted
(`:2283`) directly above the alternatives block, and it is the **only recovery path** for a guest the
availability grid has just turned away. On event nights availability is exactly what is scarce,
because event bookings consume the same tables.

**Explicitly rejected.** Moving the panel to the confirmation screen. `handleBookSuggestedEvent`
(`:1230-1245`) calls `setResult(null)`, and the confirmed screen is an early return gated on
`result?.state === 'confirmed'` (`:1901`). One tap would wipe the booking reference off the screen
permanently, with no URL state and no refetch. It would also open an unguarded double-allocation
route: `create_table_booking_v05` blocks a table booking when an overlapping event booking exists
(`supabase/migrations/20260611000000_communal_event_seating.sql:674-744`), but
`create_event_booking_v05` has **no reverse check**
(`supabase/migrations/20260420000025_event_booking_rebook_after_cancel.sql:93-111`). Do not build
this without a prod migration adding the reverse guard and explicit sign-off.

**Files touched.** `components/features/TableBooking/ManagementTableBookingForm.tsx`.

**Exact edits.**
1. Delete `:2139-2145`.
2. Leave the `/api/events` prefetch effect (`:961-1033`) in place. It is keyed on date and still
   feeds the choose-step panel, so nothing becomes wasted work.
3. If the with-availability choose-step variant ("Also happening on this date") is judged too noisy,
   demote it to a single collapsed line. Do **not** delete it.

**Risk.** Very low. `booking_context: 'find_step'` (`:2144`) drops to zero; annotate GA4 on the
release date so the drop is not read as a bug. Keep `source_component` and `booking_context` values
stable for the placements that survive.

**Effort.** XS.

---

### Change 4: Remove the Preferred Time field, and redesign the default slot window

**What.** Delete the Preferred Time input. Keep `requestedTime` as internal state seeded only from
`prefill.time`. Redesign the default slot window so evening trade is visible.

**Why.** It is required, the server never acts on it, and the guest has to state a time twice. Its
late-evening default of 23:30 (`:190-207`) anchors the grid on a time no slot matches.

**Files touched.**
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `lib/table-booking-slot-window.ts`
- `tests/unit/ManagementTableBookingForm.test.tsx`
- `tests/unit/table-booking-slot-window.test.ts`

**Exact edits.**
1. Delete the `Input` at `:2121-2128` and `handleRequestedTimeChange` (`:1301-1312`).
2. Keep `requestedTime` state (`:679`) but seed it from `toTimeInputValue(prefill?.time)` only, with
   no `getDefaultTimeValue()` fallback. **Do not delete the state.** Live `?time=` deep links exist in
   `components/features/world-cup/WorldCup2026Fixtures.tsx:233` (kick-off minus 30),
   `components/features/six-nations/SixNationsFixtures.tsx` (`buildTableBookingUrl`) and
   `lib/mothers-day-booking.ts`. Removing it kills "book for kick-off" intent with no build error.
3. Relax the guard at `:1136-1138` so a missing time is legal. Missing **date** must still throw.
4. Never send `time=undefined`. Verified live: omitting the param or sending an empty value returns
   200 with the full slot list; the literal string `"undefined"` returns 400 "Time must use HH:mm or
   HH:mm:ss format". Either drop the param from the `URLSearchParams` at `:1041-1051` or keep sending
   a validated HH:mm.
5. **Do not pre-select a slot when no preference was given.** `pickClosestSlot` (`:334-348`) falls
   back to `availableSlots[0]`, and the Continue button renders as soon as `selectedTime` is truthy
   (`:2342`). Without this guard a Saturday would arrive pre-selected at 12:00 and a distracted guest
   could complete a noon booking in three taps. Leave `selectedTime` empty; the existing render
   already handles that.
6. Redesign the window in `lib/table-booking-slot-window.ts`. Today, with no valid anchor, it returns
   `sortedSlots.slice(0, size)` (lines 29-31). Live production returns 20 available slots from 12:00
   to 21:30 on Sat 2026-08-01 and Sun 2026-08-02, so the default grid would show 12:00 to 15:00 and
   hide every evening slot behind "See more times". Evening is the pub's main trade. New behaviour
   when there is no anchor: show **all** slots grouped under "Lunch" and "Evening" headings, or if a
   window is still wanted, anchor it on the first evening slot. Recommendation: show all slots with
   the two headings. A 20-button grid is not a usability problem on a phone; a hidden evening is.
7. Move the aircraft note off the search phase. `getAircraftOverheadNotePartsForDateTime(date, requestedTime)`
   (`:777-780`, `lib/heathrow-runway-alternation.ts:131-162`) degrades to the generic "follows runway
   alternation" line when the time cannot be parsed. Re-key it to `selectedTime` and render it in
   phase B. Keep `aria-live="polite"` (currently `:2131`).

**Risk.** Medium. The window redesign is the real risk, not the field removal. Screen-reader users
can currently type a time and continue on the auto-selection; after this change the grid is
mandatory, so give it proper group semantics: a `role="group"` or `fieldset` with a legend, an
`aria-live` announcement of how many times were found, and "See more times" inside the same group.
Buttons already carry `aria-label` and `aria-pressed`.

**Not permitted here.** No change to the availability API, the booking POST payload, or the AMS
`/table-bookings/load` contract. All three are time-agnostic today and must stay that way.

**Effort.** M.

---

### Change 5: Delete the "review" step and fold its summary into the details page

**What.** `STEP_ORDER` becomes `['find', 'choose', 'details']`. The summary block (`:2570-2616`), the
deposit copy, the advisory panel and the confirm button move to the bottom of the details page. The
PayPal `pending_payment` block moves with them.

**Why.** This is the single biggest structural win. The review step collects nothing and costs a full
page transition plus a scroll-to-top between a guest deciding to book and being able to book.

**Files touched.**
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `tests/unit/ManagementTableBookingForm.test.tsx`

**Exact edits.**
1. `:57` and `:162`: drop `'review'`. Update `STEP_LABELS` (`:164`) and the progress bar at `:1992`.
2. Move `:2570-2616` (summary, deposit copy, advisory) to render below the consent fields on the
   details page, above the confirm button.
3. Replace `handleContinueToReview` (`:1506-1519`) with a direct submit. Keep the
   `trackTableBookingClick` call at `:1513-1516` but move it to fire when the details fields unlock
   (see §7).
4. Move the PayPal block (`:2626-2703`) and the confirm button (`:2803`) onto the details page.
5. **Lock the form read-only once `result.state === 'pending_payment'.`** The PayPal block reads live
   state for `conversionPayload` and `bookingSummary` (`:2683-2703`: `bookingTime: selectedTime`,
   party size, high chairs, outside seating, email, phone). If a 10+ guest can still tick "outside
   table" while the PayPal buttons are up, `selectedTime` is wiped and both the on-screen summary and
   the CAPI/GA4 conversion payload lose the time, for a booking that is already created and
   unchangeable. Disable every input and hide the "Use Different Number" button (`:2395-2403`) on
   `pending_payment`.
6. Preserve the deposit badge on page 1 (`:811`, `:2064-2068`). It is the guest's first signal that
   this journey ends in PayPal rather than instant confirmation. Losing it is a trust regression.

**Risk.** Medium. The read-only lock in edit 5 is the load-bearing part. Depends on Change 1.

**Effort.** M.

---

### Change 6: Merge "find" and "choose" into one page

**What.** One page with two visual phases, as described in §3.1.

**Why.** Two page transitions become one. Be honest about the size of the win: the availability
round-trip is a hard sequencing boundary, the grid cannot appear before the fetch returns, so page 1
still has two visual phases. The larger benefit is that it forces the ordering fix in Change 1.

**Files touched.** `components/features/TableBooking/ManagementTableBookingForm.tsx`,
`tests/unit/ManagementTableBookingForm.test.tsx`.

**Exact edits.**
1. Render the search fields and the grid on one page, with the grid section mounted only once
   `availability` is non-null.
2. **Keep an explicit "Find a table" action.** Do not auto-refetch on every keystroke (see the rate
   limit note in Change 1).
3. **Keep "I need an accessible table" on page 1 next to the slot grid.** It is a real allocator
   filter, not a note: sent on the availability GET (`:1049`) and the booking POST (`:1696`), and it
   produces the hard reason `not_accessible` in
   `OJ-AnchorManagementTools/supabase/migrations/20260801000700_allocation_candidates.sql:258-260`.
   Moving it next to the details fields would drop it into the same wipe trap.
4. Resolve two decisions the merge invalidates:
   (a) `handleDateChange` (`:1314-1322`) calls `setAvailability(null)`, so on a merged page changing
   the date makes the grid vanish with no explanation. Replace with an explicit inline state: "Date
   changed. Tap Find a table to see times for Sat 2 August."
   (b) `handleRequestedTimeChange` deliberately did not move `slotWindowAnchorTime` (codex ARCH-002).
   That decision dies with the field in Change 4, so the anchor is now set once per search only.
5. Preserve prefill and deep links: `app/book-table/page.tsx:65-68`, `:83`, `:93-97` read `date`,
   `time` and `party_size`, and live links exist from quiz-night, whats-on, world-cup, six-nations,
   plane-spotting, mothers-day, sunday-roast and the exit-intent modal.

**Risk.** Medium-high, mostly regression surface. Depends on Changes 1 and 5.

**Effort.** L.

---

### Change 7: Condition the aircraft note's visual weight, do not move it

**What.** Keep the note in the form, but give it less weight when aircraft are **not** expected at
the chosen time, and mirror it into the confirm summary.

**Why, and what was rejected.** The proposal to move it to the sidebar or the confirmation screen is
**dropped**. Three reasons, all verified:

- It is not a noise warning. `lib/heathrow-runway-alternation.ts:131-162` returns positive copy
  ("Aircraft overhead are expected around this time.") with the caveat "Weather and Heathrow
  operations dependent, not guaranteed." A grep for noise across `app`, `components`, `lib` and
  `content` returns only blog and About prose. It is a plane-spotting attraction signal.
- The sidebar is technically impossible as a move and invisible where it matters. `app/book-table/page.tsx`
  is an async server component and the `aside` at `:202` is a **sibling** of the form at `:187`;
  `date` and `requestedTime` are `useState` inside the client form (`:677-679`). A reactive sidebar
  note needs state lifted out of a 2,814-line client component. And the aside is `order-2` inside
  `lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]` (`:181`, `:202`), so on mobile it stacks below the
  entire wizard. On mobile, "move to sidebar" equals "delete".
- The confirmation screen is after the money for 10+ groups (`:2667-2690`, `:2803`).
- It is the landing-side half of an acquisition funnel: `PlaneSpottingBookingPrompt` (used on
  `/beer-garden:95`, `/blog/[slug]:355`, `/plane-spotting-heathrow:85`) links to `/book-table` with
  `date` but **not** `time`. `docs/seo-keyword-reference.md:58` puts `/plane-spotting-heathrow` at
  roughly 5,000 searches a month.

**Files touched.** `components/features/TableBooking/ManagementTableBookingForm.tsx`,
`tests/unit/ManagementTableBookingForm.test.tsx`.

**Exact edits.**
1. When aircraft **are** expected at the selected slot, keep the two-line panel.
2. When they are not, collapse to a single quiet muted line.
3. Keep `aria-live="polite"` on whatever container survives (currently `:2131`).
4. Mirror the note into the confirm summary next to the existing "Worth knowing before you confirm"
   advisory (currently `:2611-2616`), where `selectedTime` is final and no money has moved.
5. Keep the negative assertion at `tests/unit/ManagementTableBookingForm.test.tsx:243` that the form
   must **not** say "Plane spotting". The neutral "Aircraft overhead" wording is deliberate so it
   reads as useful to a noise-averse diner and as a feature to a spotter.

**Risk.** Low. Effort S.

---

### Change 8 (companion, AMS repo): surface `requires_accessible_table` to staff

**What.** Show the accessible-table flag on the BOH day sheet and the FOH booking view in
OJ-AnchorManagementTools.

**Why.** A grep across all of AMS `src/app` and `src/components` for any staff-facing display of the
flag, or of "accessible table" / "step-free", returns **zero hits**. No SMS or email template
references it either. It is written to the DB and read only by the allocator RPCs
(`src/app/api/table-bookings/route.ts:278`, `/load/route.ts:178`, `/api/foh/bookings/route.ts:1235`).
The allocator hard filter is the entire mitigation, and no human at the pub can see the flag, so a
mis-set flag is uncatchable. Production evidence that this matters: of 212 bookings with non-empty
`special_requirements`, two mention access needs, both from `brand_site`, and both have
`requires_accessible_table = false` ("Wheelchair friendly space", party of 3, 2026-07-16; "...Need
space to a walker", party of 2, 2026-06-19). Neither received any accessibility filtering.

**Files touched.** AMS BOH bookings client and FOH booking view. Site repo untouched.

**Risk.** Very low. Effort S.

---

## 5. Explicitly out of scope

1. **Any change to the availability API, the booking POST payload, or the AMS
   `/table-bookings/load` contract.** All three are time-agnostic today and stay that way.
2. **Folding "I need an accessible table" into the free-text Notes field, in any form**, including
   keyword matching. Free text is never parsed: the site posts `notes` to `p_notes` to
   `special_requirements`, while `p_requires_accessible_table` falls back to `false`
   (`AMS src/app/api/table-bookings/route.ts:278`). This variant is dropped permanently.
3. **Hiding the accessible-table checkbox behind a disclosure.** Not before at least 4 to 6 weeks of
   live traffic. It shipped on 2026-07-28; the "0 of 382 bookings used it" figure covers a period
   that almost entirely predates the control. That is an absence of data, not an absence of demand.
4. **Moving the aircraft note to the sidebar or the confirmation screen.**
5. **Any post-confirmation event cross-sell**, until `create_event_booking_v05` gains the missing
   reverse guard against overlapping table bookings. That needs a prod migration and explicit
   sign-off.
6. **Reviving Sunday roast as a separate booking type, the Saturday 1pm cutoff, the Mother's Day
   mode, or the Sunday menu pre-order flow.** All four are already retired on the website with the
   walk-in launch, recorded in the comment at `ManagementTableBookingForm.tsx:807-809`. Sundays are
   ordinary food bookings.
7. **Adding an upper bound to how far ahead a guest can book.** There is none today
   (`:2110-2119` sets `min` only). Noted, not changed, see Open Question 8.
8. **Rate limiting the availability route.** Real gap
   (`AMS load/route.ts:111-129`), but a separate piece of work.
9. **URL/router state for the wizard steps.** Would fix the reload-resets-everything problem, but it
   is a separate change and interacts with the prefill contract.
10. **Any change to SMS or email confirmation templates.** The booking POST payload (`:1681-1704`)
    carries no event fields and no aircraft fields, so confirmations, BOH print sheets and staff
    operations are untouched by everything in this spec.

---

## 6. Edge cases that must keep working

Each of these needs an explicit pass in QA, on a real phone, before sign-off.

1. **Deposits for 10 or more.** `requiresDeposit(partySize)` at `:811`, badge at `:2064-2068`, deposit
   line and policy copy in the summary at `:2597-2608`, PayPal section at `:2626-2703`, button label
   at `:2803`. The badge must survive on page 1. The form must lock read-only on `pending_payment`.
   The hold expiry line and the `fallback_payment_url` SMS path must both still render. Note that the
   accessible filter applies to every table in a combination (`usable` filters `hard_reason IS NULL`
   and both `valid_for_single` and `valid_for_combination` derive from it,
   `allocation_candidates.sql:299-311`), so a 12-person group with a wheelchair user has materially
   fewer valid combinations **and** has already paid. Getting that wrong is a refund plus a complaint.
2. **Sunday lunch pre-orders.** These are **retired** on the website (`:807-809`). The requirement is
   negative: a Sunday booking must behave as an ordinary food booking with deposit gating purely on
   party size. Verify a Sunday at 13:00 and a Sunday at 18:00 for a party of 4 and a party of 12.
3. **Event switching.** The choose-phase panel with `highlight: availableSlots.length === 0`
   (`:2271-2284`) must survive verbatim and still hand over to `ManagementEventBookingForm` via the
   takeover at `:1859-1899`, with "Back to table booking" (`:1880`) returning the guest to a populated
   page 1, not a blank one. Per-date dismissal (`:818-819`, `:1287-1299`) must still work.
4. **High chairs.** Stepper at `:2482-2517`, cap from `highChairMax` (`:843-856`), the zero-available
   copy at `:2477`. Changing the count must now re-run availability in place (Change 1), never strand.
   The clamp at `:1624` must still apply on submit.
5. **Outside seating.** Checkbox at `:2519-2527`, sent as `is_outside_seating` at `:1695`, echoed back
   and defaulted at `:1733-1740`, and it changes the wording on the confirmation
   ("Your booking is held" versus "Your table is held", `:2660`, `:1931`). This is the toggle that
   reproduces the dead end today: it must be the first thing tested after Change 1.
6. **Drinks only.** Checkbox at `:2076-2089`, sent as `purpose=drinks` on the availability GET
   (`:1047`), short-circuits `deriveSubmitPurpose` at `:1533`. Note the comment there: inferring
   purpose from kitchen state was wrong for 76 of 101 drinks bookings in six months. Do not "simplify"
   that logic. Verify a drinks booking at a time when the kitchen is closed.
7. **Accessible tables.** Checkbox stays on page 1 next to the grid, still sent on both the GET
   (`:1049`) and the POST (`:1696`), still inside `availabilityInputsKey` so it re-runs availability.
   Verify that ticking it changes the returned slot set, and that a booking made with it set arrives
   in AMS with `requires_accessible_table = true`.
8. **Deep links.** `?date=`, `?time=`, `?party_size=` (`app/book-table/page.tsx:93-97`). A world-cup
   kick-off link (`WorldCup2026Fixtures.tsx:233`) must still land with the right slot pre-selected
   even though the Preferred Time field is gone.
9. **Known-customer path.** `isKnownCustomer` hides the name fields (`:2424`). Verify a repeat booker
   still skips the name fields, and that a repeat booker with a blank surname now gets asked once
   (Change 2, edit 4).
10. **Zero availability.** No slots at all: the alert (`:2261-2269`), the nearest alternatives
    (fetched for the next 3 days only, max 2 per day, capped at 6, `:1081-1118`), the phone waitlist,
    and `handleChooseAlternative` (`:1261-1275`) picking a slot on a **different date** than the
    loaded availability. `deriveSubmitPurpose` must still resolve via `selectedSlotService`.
11. **Closed day.** The hours panel says "We're closed all day on this date." (`:885`) but does not
    disable the button (`:2018-2028`). Behaviour unchanged by this spec, but confirm it still shows.

---

## 7. Analytics

### 7.1 Fix the documentation gap first

`docs/analytics/validation-checklist.md` and `docs/analytics/custom-dimensions.md` document
`funnel_step` values `availability_check` and `details_entered` that **the code has never emitted**.
Only `view`, `start`, `submit`, `success` and `error` fire today. Real step drop-off is currently
inferred from `trackTableBookingClick` context strings: `find_step` (`:2144`), `availability_step`
(`:1257`), `details_step` (`:1515`) and source `book_table_details_complete` (`:1514`).

### 7.2 Emit the steps that already exist in the type

No type change needed, these are already in the union at `lib/gtm-events.ts:394`:

| Step | Fire when | Call site after the change |
|---|---|---|
| `availability_check` | availability fetch returns 200 | in `runAvailabilitySearch`, after `:1164` |
| `details_entered` | `detailsUnlocked` flips true after a successful phone lookup | in `handlePhoneLookup`, `:1420-1468` |

### 7.3 Add three new steps

Extend the union at `lib/gtm-events.ts:394` with:

- `slot_selected`, fired in `handleSlotSelect` (`:1247`) and `handleChooseAlternative` (`:1261`),
  carrying `bookingTime`.
- `no_availability`, fired once per search when `availableSlots.length === 0`, carrying
  `bookingDate` and `partySize`. This is the number that tells us whether the events panel and the
  alternatives block are earning their place.
- `recovered_in_page`, fired when Change 1's in-place refetch clears a chosen slot and the guest
  picks another without leaving the page. Target: this replaces every dead end.

Also add `errorType: 'availability_wiped'` to the existing `error` step so the old failure mode is
countable if it ever returns.

### 7.4 Keep the funnel continuous across the redesign

Do **not** rename `booking_context` strings when the visual step changes. Keep `find_step`,
`availability_step` and `details_step` exactly as they are, so before-and-after comparison is
possible. Instead, tag the flow version. `trackTableBookingClick` already supports `variant`, mapped
to `booking_variant` (`lib/gtm-events.ts:337`, `:348`). Pass `variant: 'flow_v1'` or `'flow_v2'` on
every call from this form, driven by the same flag as the rollout (§9).

For `trackTableBookingFunnel`, which has no `variant` field, add `flowVersion?: string` to the input
type and map it to a `flow_version` data-layer key.

`booking_method` is a documented custom dimension on `table_booking_click`
(`docs/analytics/custom-dimensions.md:14`) and must stay `internal_management_platform`.

### 7.5 Annotations and docs

- Annotate GA4 on each release date, especially the day `booking_context: 'find_step'` drops to zero
  (Change 3).
- Update `docs/analytics/validation-checklist.md` and `docs/analytics/custom-dimensions.md` in the
  final PR so they describe what the code actually emits.

### 7.6 Baseline capture, before any code ships

Record, for the 14 days ending the day before PR1 merges: `view`, `start`, `submit`, `success` and
`error` counts; `book_table_details_complete` count; event-suggestion clicks split by
`booking_context`. Store the numbers in this file as an appendix. Without this, no lift claim is
provable.

---

## 8. Test plan

### 8.1 Unit tests

`tests/unit/ManagementTableBookingForm.test.tsx` is 2,009 lines and 52 tests, and it is the **only**
test file covering this form. Rewrite it, do not delete it. 86 assertions key off the strings "Find a
table", "Choose your time", "Continue to review" and "Review your booking"; 12 references use the
label "Preferred Time" (`:172`, `:245`, `:974`, `:1132`, `:1155`, `:1183-1187`, `:1447-1461`,
`:1738-1754`); 13 call sites fill `getByLabelText('Last Name')`.

**Tests whose intent must survive verbatim** (they encode real past incidents):

- `:1738-1754` AB-002 / WF-003, the midnight clamp. The field is gone, so re-express as: opening the
  form at 00:30 London must not produce a broken or empty grid, and must not anchor on 23:30.
- ARCH-002, anchor ownership. Re-express as: the slot window anchor is set once per search and is not
  moved by any later interaction.
- `:236-256`, the aircraft note updates with date and time. Re-express against `selectedTime` in the
  new placement, in the same commit as Change 7.
- `:243`, the negative assertion that the form does not say "Plane spotting". Keep as is.
- `:1183-1187`, the London-now default. Delete the field-specific part, keep any London-timezone
  coverage in `tests/unit/londonNowParts.test.ts`.

**New tests to add:**

1. **The dead end, as a regression test.** Search, pick 7pm, tick "outside table", assert: the guest
   stays on the same page, availability is refetched, and either 7pm is retained or an inline
   "pick another time" message plus a populated grid is shown. Assert the guest is never shown "No
   online times available" as a result of their own toggle.
2. **The lying summary.** Force `selectedTime` empty with `requestedTime` set, assert the summary
   renders no time rather than the stale one.
3. **No pre-selection without a preference.** Search with no `?time=`, assert the Continue/Confirm
   affordance is not present until a slot is tapped.
4. **Deep link still pre-selects.** Render with `prefill.time = '19:30'`, assert 19:30 is selected and
   the window is centred on it.
5. **`time` param hygiene.** Assert the availability GET never contains `time=undefined` and never
   contains an empty `time` value.
6. **Evening visibility.** Given 20 slots from 12:00 to 21:30 and no anchor, assert evening slots are
   visible without tapping "See more times". Add the matching case to
   `tests/unit/table-booking-slot-window.test.ts`.
7. **Last name optional.** Submit with first name only, assert no validation error and that the POST
   body is well formed. Assert first name alone still blocks when empty, with the message "Please
   enter your first name."
8. **Known customer with a blank surname** is shown the optional Last Name field.
9. **Read-only on `pending_payment`.** Assert every input is disabled and "Use Different Number" is
   absent once `result.state === 'pending_payment'`.
10. **Blocked recovery.** Mock a `blocked` API result, assert the guest stays on the details page with
    an inline error and a visible grid, and that all entered details survive.
11. **Accessible checkbox is still on page 1** and still appears in the availability GET and the
    booking POST.
12. **Events panel: absent in the search phase, present when `availableSlots.length === 0`.**
13. **Analytics.** Assert `availability_check`, `details_entered`, `slot_selected` and
    `no_availability` fire once each in a happy path, and that `flow_version` is attached.

Run `npm test` and `npx tsc --noEmit` and `npm run lint` (zero warnings) before each merge.

### 8.2 Manual script, on a real phone

Do this on an actual iPhone or Android over mobile data, not a desktop emulator. Use a real mobile
number that can receive SMS. Book against a genuinely quiet slot and cancel afterwards by phone.

1. Open `https://the-anchor.pub/book-table` on the phone. Confirm two fields only above the button:
   party size and date.
2. Party of 2, tomorrow. Tap "Find a table". Confirm evening times are visible **without** tapping
   "See more times".
3. Confirm no slot is pre-selected and no forward button is showing.
4. Tap 19:00. Confirm the button appears, the aircraft note updates, and the summary shows 19:00.
5. Enter the mobile number, tap Continue, confirm the lookup unlocks the rest.
6. Tick "I'd like an outside table". **This is the critical step.** Confirm you stay on the page, see
   a brief rechecking state, and either keep 19:00 or get an inline prompt with a live grid. You must
   never see "No online times available" or be thrown back to a search box.
7. Add a high chair, then remove it. Same expectation.
8. Enter first name only, leave last name blank. Confirm no error.
9. Confirm the booking. Check the SMS arrives, and that the booking appears correctly in AMS BOH with
   the outside flag.
10. Repeat with a party of 12. Confirm the £10pp badge appears on page 1, the deposit line and policy
    copy appear in the summary, PayPal loads, and that **all form fields are locked** while PayPal is
    up. Do not complete the payment; let the hold expire, then confirm the hold expiry copy was shown.
11. Repeat with "Just drinks" ticked at a time the kitchen is closed. Confirm the booking is accepted
    and lands in AMS as a drinks booking.
12. Repeat with "I need an accessible table" ticked. Confirm the slot set changes and the flag lands
    in AMS.
13. Pick a date with a sold-out or event-heavy evening. Confirm the events panel appears with the
    highlighted no-availability wording, the alternatives block appears, and tapping an event opens
    the event form and "Back to table booking" returns to a populated page.
14. Open a world-cup fixture link with `?time=`. Confirm the slot is pre-selected at kick-off minus 30.
15. Rotate the phone, background the app for two minutes, come back. Note what survives (today,
    nothing survives a reload; that is unchanged and expected).

---

## 9. Rollout and rollback

### 9.1 Sequence

Ship as separate PRs. Do not batch. Workspace rules require the breakdown at complexity 4 or above.

| PR | Contents | Gate before the next PR |
|---|---|---|
| PR0 | Analytics baseline capture (§7.6), no code | Numbers recorded in this file |
| PR1 | Change 1 (dead end plus lying summary) | Manual step 6 passes on a phone, 48h in prod with no new errors |
| PR2 | Change 2 (last name) plus Change 3 (find-step events panel) | 48h, no rise in blank first names |
| PR3 | Change 4 (preferred time plus slot window) | Manual steps 2, 3, 14 pass, 1 week in prod |
| PR4 | Change 5 (drop the review step) | Manual step 10 passes, 1 week |
| PR5 | Change 6 (merge find and choose) | Full manual script |
| PR6 | Change 7 (aircraft note weight) plus analytics and docs updates | Done |
| PR7 | Change 8 in the AMS repo (staff-visible accessible flag) | Independent, can run in parallel from the start |

### 9.2 Flag

Put PR4 and PR5 behind `NEXT_PUBLIC_BOOK_TABLE_FLOW_V2`, read once at module scope, with a
`?flow=v2` query-param override for testing. Because it is a `NEXT_PUBLIC_` build-time variable,
flipping it needs a Vercel redeploy, not just an env change; that is acceptable at this cadence and
avoids a code revert under pressure. PR1, PR2, PR3 and PR6 are small enough to ship unflagged.

### 9.3 Verification after each deploy

A push is not a deploy. For each PR: confirm the Vercel deployment reaches Ready **and** the
production alias has moved to the new commit (`vercel ls`), then probe the live `/book-table` route
and complete one real booking on a phone.

### 9.4 Rollback

- Flagged PRs: set `NEXT_PUBLIC_BOOK_TABLE_FLOW_V2=false` and redeploy. Under 10 minutes.
- Unflagged PRs: `git revert` the single PR commit on `main` and let auto-deploy run. Each PR is
  independently revertable because none of them change the API contract, the POST payload or the
  database.
- No database migration is involved in any change in this spec except Change 8's companion work,
  which is read-only UI in AMS. There is nothing to roll back on the data side.

### 9.5 Triggers to roll back

Roll back immediately if any of these appear within 48 hours of a deploy:

- `table_booking_funnel` `success` count falls more than 20% against the same weekday.
- `error` step count rises above the baseline.
- Any report from staff of a booking arriving without a time, or with the wrong time.
- Any report of a guest unable to reach the confirm button.

---

## 10. Open questions for the owner

Each has a recommendation. If you do not reply, the recommendation is what will be built.

1. **Is the aircraft note an attraction or a caveat?** Recommendation: **attraction**. Everything in
   the codebase says so (`SSOT.json:299` records the alternating overhead schedule as a canonical
   brand fact, `docs/redesign-spec.md:678` makes "Planes overhead every 90 seconds" the headline
   beer-garden proposition). We will keep it prominent when aircraft are expected and quiet when they
   are not, and will not move it. The one fair point against: on a "from 3pm" week a Sunday roast
   booker at 13:00 currently reads "Aircraft overhead is usually expected from 3pm on this date" in
   the middle of the highest-value service, which reads mildly negative. Conditioning the weight
   fixes that without losing the funnel.

2. **On the door, is booking reference plus the last four digits of the mobile enough to identify a
   guest without a surname?** Recommendation: **yes**. 36% of your customers already have no usable
   surname and 79 walk-ins in 90 days have none. The only flow where a surname carries evidential
   weight is chasing a disputed no-show charge, which is low volume.

3. **Leave the accessible-table checkbox visible for 4 to 6 weeks before deciding whether it is
   clutter?** Recommendation: **yes**. It is one day old, so there is no usage data to judge it on,
   and hiding it now guarantees the demand signal never appears.

4. **Ship the two structural PRs behind a flag?** Recommendation: **yes**. It turns a bad Saturday
   into a 10-minute redeploy instead of an emergency revert.

5. **Keep an explicit "Find a table" button on the merged page, rather than searching as you type?**
   Recommendation: **yes**. Each search hits 8 parallel database queries plus an allocation check with
   no caching and no rate limit. Search-as-you-type would multiply that by every keystroke.

6. **Default slot grid: show all times with "Lunch" and "Evening" headings, or keep a 7-slot window
   anchored on the first evening slot?** Recommendation: **show all with headings**. Evening is your
   main trade and a hidden evening costs more than a longer list.

7. **Should the "Also happening on this date" events panel stay on the choose phase when there IS
   availability, or collapse to one line?** Recommendation: **collapse to one line**. Keep the
   highlighted version for the no-availability case, which is the one that recovers a lost booking.

8. **Should we cap how far ahead a guest can book?** There is no upper bound today, so someone can
   book for 2029. Recommendation: **no change in this piece of work**, but tell me if you want a cap
   and I will add it as a one-line change (a `max` attribute plus a server-side check).

---

## Appendix A: evidence gaps, stated honestly

- **No conversion baseline exists yet.** PR0 must capture it. Every percentage target in §1.2 is a
  target, not a measured gap.
- **`availability_check` and `details_entered` have never fired**, despite being documented. Any
  historical funnel analysis using them is empty, not low.
- **The accessible-table checkbox has one day of traffic.** The "0 of 382 bookings" figure covers a
  period that mostly predates the control and proves nothing about demand.
- **No mobile session recording is in place**, so the "too many steps" claim rests on the code
  structure and the confirmed dead end, not on observed abandonment at a specific step.
- **The dead end was reproduced with a throwaway probe against the real component**, not observed in
  a production session. It is confirmed to exist in code and in test; we do not know how many real
  guests have hit it, because the current analytics do not emit a step where it would show.
