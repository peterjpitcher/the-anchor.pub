# Book a Table: full implementation spec, both applications

Date: 2026-07-30
Status: ready to build. All owner decisions taken, see the decision log.
Repos: `OJ-The-Anchor.pub` (the website, guest-facing) and `OJ-AnchorManagementTools` (AMS, the management system that owns availability, bookings, settings and staff screens).

Sources, superseded by this document where they disagree:
- `tasks/book-table-flow-simplification-spec-2026-07-29.md` (the parent spec)
- `tasks/book-table-options-and-seasonal-addendum-2026-07-29.md` (the addendum)
- The clickable prototype approved by the owner on 2026-07-30 ("It's beautifully simple")

---

## 0. Decision log

Every decision below was taken by the owner in conversation on 29 and 30 July 2026. Build to these without re-asking.

| # | Decision |
|---|----------|
| D1 | The flow becomes **two screens**: (1) find a table and time, (2) details and confirm. |
| D2 | **All four table options live on screen 1**, next to the times they filter: just drinks, outside table, step-free table, high chairs. |
| D3 | **High chairs are a number, 0 / 1 / 2**, not a checkbox. Max 2 per booking, max 2 allocated across overlapping bookings (both rules already enforced in AMS). |
| D4 | When fewer high chairs are free than requested at a time, **offer the time anyway, flagged** (for example "1 high chair free"). Never hide a time over a high chair shortfall; only hide it when zero are free and chairs were requested. |
| D5 | The accessible option is labelled **"Step-free, standard-height table"** with the explanation in §4.5, using the owner-confirmed facts: the garden IS step free; there is NO accessible toilet. The copy never calls the pub "accessible". |
| D6 | **Last name becomes optional** end to end. Booking reference plus last four digits of the mobile identifies a guest on the door. |
| D7 | The **Preferred Time field is removed**. The slot grid shows **all times with Lunch and Evening headings** (no 7-slot window). |
| D8 | The **review screen is deleted**; its summary appears inline on the details screen. |
| D9 | Events on the chosen date: a **quiet warning line** on the slot grid (for example "Quiz night runs from 8pm, it will be lively"). The full "switch to this event" panel appears **only when no tables are free**. No post-booking event offer. |
| D10 | The owner publishes events close to each date deliberately; the site must degrade gracefully when few events are published. |
| D11 | **Seasonal booking periods** (Christmas dinner, Mother's Day, Easter, Father's Day) are built: manager-configurable dates, a guest question, and a deposit per booking or per head. |
| D12 | The aircraft note stays in the flow, treated as an attraction, with its visual weight conditioned on whether aircraft are expected (parent spec Change 7). |
| D13 | The dead-end bug (changing seating options on the details step wiped the chosen time) is fixed first. **Shipped 2026-07-29, commit `cf721088`.** |

Open items the owner has not yet decided are in §10. Where a default is needed to keep building, the stated recommendation applies.

---

## 1. Goal and measurable outcomes

**Goal:** a guest on a phone books the right table in under a minute, is never stranded, and every question that changes which tables qualify is asked before the time is chosen, never after.

Measured outcomes (baseline captured by W1 before the structural changes ship):
1. Completion rate from availability search to confirmed booking rises.
2. Median time from landing to confirmation falls.
3. Zero occurrences of the details-step dead end (now instrumented).
4. High-chair shortfall surprises at confirmation fall to zero (the shortfall is now shown on screen 1).

---

## 2. Who owns what

| Concern | Owner | Notes |
|---|---|---|
| Slot truth, table allocation, pacing, high-chair inventory | AMS | `create_table_booking_public_v06`, `check_table_availability_v06`, `/api/table-bookings/load` already return per-slot data including `high_chairs_remaining`. |
| Guest UX, form, copy, analytics | Website | `components/features/TableBooking/ManagementTableBookingForm.tsx` (2,800 lines; the ONLY live form, see the dead-component trap in the website spec §0). |
| Website→AMS proxy | Website | `app/api/table-bookings/route.ts` (create), `app/api/table-bookings/availability/route.ts` (availability). Auth via `ANCHOR_API_KEY`, server-to-server. |
| Deposits and payments | Both | PayPal flow on the website; deposit rules decided in AMS. |
| Seasonal period configuration | AMS | New settings section at `/settings/table-bookings`. |
| Staff visibility of options | AMS | FOH schedule modal, BOH booking detail. |

---

## 3. The guest experience (target)

### Screen 1: find a table and time

1. Party size and date. Nothing else is required to search.
2. "Find a table" fetches real availability (button-triggered, never search-as-you-type; each search costs parallel DB queries in AMS).
3. The slot grid appears on the same page: all times, grouped **Lunch** and **Evening**, each slot showing "Drinks & food" or "Drinks only" (from `kitchen_open`).
4. Above the grid, the four refinements, phrased as one group ("Anything that changes the table?"):
   - Just drinks, no food (checkbox)
   - Outside table, weather permitting (checkbox)
   - Step-free, standard-height table (checkbox, reveals the §4.5 explanation when ticked)
   - High chairs: 0 / 1 / 2 segmented control
5. Ticking any refinement re-filters the grid **in place**:
   - a slot that no longer qualifies greys out;
   - a slot with a high-chair shortfall stays tappable, flagged "1 high chair free" (D4);
   - if the guest's already-picked time no longer qualifies, it is dropped with an inline message naming the time and why, and the grid shows what is available (this mirrors the shipped dead-end fix behaviour, D13).
6. If the date has a published event, the quiet event line renders under the grid heading (D9). If no slots are free at all, the existing "switch to this event" panel renders instead.
7. If the date falls inside an active seasonal period, the period question renders above the grid (§7).

### Screen 2: details and confirm

1. Mobile number (with existing verification), first name, last name **(optional)**, notes.
2. No table options here. Anything that changes which tables qualify lives on screen 1 only. (The shipped D13 fix remains as a safety net for any residual path that mutates options late.)
3. Inline summary card: when, party, table type (outside / step free / high chairs / drinks only), and any deposit due.
4. Deposit flows (groups of 10+, Sunday lunch, seasonal periods) render here, before Confirm, exactly as the rules in §7 dictate.
5. One button: **Confirm booking**. Confirmation shows reference, everything reserved (including high chairs granted), and the SMS/email goes out as today.

---

## 4. Website changes (`OJ-The-Anchor.pub`)

All changes touch `ManagementTableBookingForm.tsx` unless stated. Each PR is independently shippable and reversible. Ship order = listed order. W0 is done.

### W0. Dead-end fix. SHIPPED (`cf721088`, 2026-07-29)

Changing high chairs or outside seating after choosing a time now re-reads availability with the new inputs, keeps the time if it survives, and otherwise explains and re-offers real alternatives. Regression tests in `tests/unit/ManagementTableBookingForm.test.tsx` ("changing seating options after a time has been chosen"). Kept as the safety net behind W3.

### W1. Analytics baseline. Effort: S. Ship BEFORE any structural change.

- Fix the documented-but-never-fired funnel steps (`availability_check`, `details_entered` in `lib/gtm-events.ts` types) so they actually emit.
- Add events: `option_toggled` (which option, value, step), `slot_flag_shown` (high-chair shortfall flag rendered), `slot_invalidated` (picked time dropped by a refinement), `booking_step_viewed` (with the new step names).
- Capture two weeks of baseline before W4-W6 ship. No UI change.
- Risk: none. Rollback: revert.

### W2. Last name optional. Effort: XS website + XS AMS (A1). Ship together.

- Form: label "Last name (optional)", remove the required validation, submit `last_name: ''` as absent.
- Depends on A1 (AMS accepts a missing last name). Verify at build: the zod schema in the website proxy and the AMS route both treat `last_name` as optional; SMS and email templates fall back to first name only; FOH/BOH screens render a missing surname cleanly (they already do for 36% of customers).
- Risk: low. Rollback: restore validation.

### W3. Four options onto screen 1, high chairs as a number. Effort: M.

- Move `isOutsideSeating` and `highChairCount` controls from the details step into a refinement group on the find/choose surface, joining `drinksOnly` and `requiresAccessibleTable` (which are already there).
- High chairs become a 0 / 1 / 2 segmented control (44px+ touch targets).
- The availability request already carries all four parameters (`purpose`, `outside`, `requires_accessible_table`, `high_chair_count`), added in the table-prioritisation work. Verify at build: the **website availability proxy** (`app/api/table-bookings/availability/route.ts`) forwards them AND returns AMS's real per-slot data. The proxy historically built slots locally from opening hours; if any of that remains, W3 replaces it with a pass-through of the AMS `/api/table-bookings/load` `table_availability` payload, which includes `high_chairs_remaining` per slot (already live in production).
- Render logic per slot, with chairs requested = N:
  - `high_chairs_remaining >= N`: normal.
  - `0 < high_chairs_remaining < N`: offered, flagged "`{high_chairs_remaining}` high chair free" (D4).
  - `high_chairs_remaining = 0`: greyed out.
- On any refinement change with a time already picked: keep W0's revalidate-in-place behaviour, now running on screen 1 where it is cheap and visible.
- Confirmation keeps the existing "X of Y high chairs reserved" copy as a belt-and-braces, but with D4 the shortfall is known before booking, so this should become rare and eventually unreachable.
- Risk: medium (touches the primary revenue form). Rollback: feature flag `NEXT_PUBLIC_BOOKING_OPTIONS_STEP1` (see §9).

### W4. Remove Preferred Time, show all slots grouped. Effort: S.

- Delete the Preferred Time input (required today, never used by the booking; defaults to 11:30pm late in the day, parent spec §2.1). Availability is anchored to the day, not a time: pass a neutral anchor (kitchen-open time) to the AMS call; verify at build whether `time` remains mandatory on the availability API, and if so anchor it server-side in the proxy rather than asking the guest.
- Replace the 7-slot anchored window (`slotWindowAnchorTime`, `showAllTimes`) with the full grid grouped Lunch / Evening (D7).
- Risk: low-medium. Rollback: flag with W3's.

### W5. Merge find and choose into one screen. Effort: M.

- The `find` and `choose` steps become one surface: search form on top, grid appears below on the same page with a scroll-into-view (already prototyped). Step state machine shrinks: `find+choose` → `details` → `confirmed`.
- Back-compat: deep links or resumes that land on `choose` map to the merged step.
- Risk: medium. Rollback: same flag.

### W6. Delete the review step. Effort: S-M.

- Fold the summary into the details screen as an inline card (D8). The policy checkbox ("I understand The Anchor...") moves onto details above Confirm. The deposit/PayPal section, which today renders on review for deposit-taking bookings, moves with it, unchanged in behaviour.
- Verify at build: PayPal button mount/unmount inside the merged screen (it is sensitive to re-renders; test a 10+ party booking end to end in the PayPal sandbox).
- Risk: medium (payment adjacency). Rollback: same flag.

### W7. Event awareness on the grid. Effort: S.

- With a published event on the chosen date: one line under the grid heading, factual tone, name and start time ("Quiz Night from 8pm, the bar will be lively"). Data already fetched for the events panel.
- The full events panel renders ONLY in the no-availability state (it recovers an otherwise lost booking).
- No post-booking event upsell (D9): it would clear the confirmation reference and invite double-booking.
- Risk: low. Rollback: revert.

### W8. Accessible option copy. Effort: XS.

See §4.5 for the exact copy. Renders only when the box is ticked. Risk: none.

### 4.5 The accessible copy, verbatim (owner-approved facts)

Label: **Step-free, standard-height table**

Explanation (revealed when ticked):

> You will get a table with step-free access and standard-height seating. That rules out two of our ten tables: the Small Bay, which has a step, and the High 4, which is bar stools. The garden is step free. We do not have an accessible toilet. If you would like to talk it through first, call us on 01753 682707.

Grounding, verified against production `tables` on 2026-07-29: Small Bay is the only non-step-free table; High 4 is the only non-standard-height table (and the only one that cannot take a high chair); all ten bookable tables are heated. The copy must never say "accessible pub" or "wheelchair accessible": with no accessible toilet that claim would be false. If the physical facts change, the copy and the `tables` flags change together.

### W9 (with the parent spec, unchanged): aircraft note conditioning. Effort: S. Optional, last.

Prominent when aircraft are expected in the booking window, one quiet line otherwise (D12).

---

## 5. AMS changes (`OJ-AnchorManagementTools`)

### A1. Accept bookings without a last name. Effort: XS. Pairs with W2.

- `src/app/api/table-bookings/route.ts`: make `last_name` optional in the request schema; pass empty/null through to `create_table_booking_public_v06` (verify at build how the RPC stores the name; customer records already tolerate missing surnames).
- Check SMS/email confirmation templates use first name and never render a bare template hole.

### A2. Staff can see what the guest asked for. Effort: S.

Today `requires_accessible_table` reaches the database and no staff screen shows it. High chairs show inconsistently.
- FOH booking detail modal (`src/app/(authenticated)/table-bookings/foh/components/FohBookingDetailModal.tsx`): add badges alongside the existing Outside / High chair badges: "Step-free table" when the flag is set.
- BOH booking detail and the BOH print sheets: same two facts.
- No new data, display only.

### A3. Availability contract check. Effort: XS (verification, not code, unless it fails).

Confirm `/api/table-bookings/load` returns, per slot: `available`, `available_capacity`, `kitchen_open`, `high_chairs_remaining`, under all four refinement parameters. This is believed true (verified live at v06 activation); A3 is the pinned contract test in `tests/` so W3 cannot be broken silently from the AMS side.

---

## 6. Seasonal booking periods (both applications)

The owner's requirement: named periods (Christmas dinner, Mother's Day, Easter, Father's Day) with manager-set dates, a guest question, and a deposit per booking or per head, configured inside AMS.

**Found during research, fix in S1:** the `table_booking_type` enum already contains `christmas`, unused and unguarded, so a `christmas` booking could be created for a date in June. S1 closes this.

### S1. AMS: data model, admin UI, guard. Effort: M.

Migration sketch (final SQL to be validated against live schema at build, per the prod-migration workflow):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE public.booking_periods (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,                -- "Christmas dinner 2026"
  guest_question  text NOT NULL,                -- "Is this a Christmas dinner booking?"
  starts_on       date NOT NULL,
  ends_on         date NOT NULL,
  deposit_basis   text NOT NULL CHECK (deposit_basis IN ('per_booking','per_head')),
  deposit_amount  numeric(10,2) NOT NULL CHECK (deposit_amount >= 0),
  min_party_size  integer,
  max_party_size  integer,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_on >= starts_on),
  -- Two active periods must never overlap: which question would the guest see?
  EXCLUDE USING gist (daterange(starts_on, ends_on, '[]') WITH &&) WHERE (active)
);
```

- `table_bookings` gains `booking_period_id uuid NULL REFERENCES booking_periods(id)`. `booking_type` stays for back-compat; a period booking sets both (`christmas` type when the period is a Christmas one, else `regular` plus the period id).
- **Guard:** reject any create where `booking_type = 'christmas'` (or a `booking_period_id` is supplied) and the booking date is outside an active period's range. Closes the June hole.
- Admin UI: new "Seasonal periods" section on `/settings/table-bookings` (alongside the existing allocation sections): list, create, edit, deactivate. Editing dates or deposit affects **future bookings only**; existing bookings keep the terms they were taken on (store the amount on the booking at creation). Deactivating a period stops the question appearing; it never touches existing bookings.
- Permissions: `table-bookings` module, `manage` action, same as the other settings sections.
- Function grants: follow the hard rule from the table-prioritisation work, REVOKE from `anon, authenticated` explicitly on anything new, and assert with the pinned grant test.

### S2. Contract and guest flow. Effort: M. Website + AMS.

- Availability/load response gains, when the date is in an active period: `booking_period: { id, name, guest_question, deposit_basis, deposit_amount, min_party_size, max_party_size }`.
- Screen 1: when present, the question renders above the grid as a yes/no chip. "No" is always allowed: a regular dinner on 15 December is still a regular dinner (guard against nagging; ask once, remember the answer for the session).
- "Yes": the booking carries `booking_period_id`; party-size limits from the period apply; the deposit line appears in the screen 2 summary before Confirm.
- Create path: website proxy passes `booking_period_id`; AMS validates it against the date (the S1 guard) and stores the computed deposit on the booking.

### S3. Money. Effort: L. Ship last, behind its own flag.

- Deposit precedence when more than one rule matches the same booking: **the largest single deposit applies, they never stack.** (Example: party of 12 in a Christmas period at £10 per head period deposit = £120 period deposit vs £120 group deposit, one £120 charge.) Sunday lunch pre-order payment is a different thing (payment for food, not a deposit) and is unaffected.
- Reuse the existing PayPal deposit flow (groups of 10+) with the period amount. Two-phase as today: booking pending until payment completes, hold expiry unchanged (`is_booking_live` already handles pending-payment holds correctly, verified 2026-07-29).
- Refund/cancellation policy for period deposits and whether the deposit is deducted from the bill or held as a no-show fee: owner decision, §10 Q1. Build blocks on that answer for S3 only; S1 and S2 do not block.

---

## 7. Deposit rules after this work (single reference table)

| Rule | Trigger | Amount | Precedence |
|---|---|---|---|
| Group deposit | Party of 10+ | £10 per head | Largest single deposit wins, never stacked |
| Seasonal period | Date in active period AND guest answered yes | Period's per-booking or per-head amount | Largest single deposit wins, never stacked |
| Sunday lunch pre-order | Sunday lunch booking | Payment for the food order, not a deposit | Independent, unchanged |
| Venue-hosted events | Existing exception | No deposit | Unchanged |

---

## 8. Edge cases that must keep working (regression checklist)

1. Party of 10+ deposit flow, including PayPal capture and webhook.
2. Sunday lunch pre-order end to end.
3. Drinks-only bookings (20% of volume) landing on Low tables under v06 allocation.
4. Outside bookings: never allocated an indoor table, `outside_reservations` row created, no high-chair interaction.
5. Event on the same date: communal event tables never shared with food bookings (DB trigger); the no-availability events panel still renders and books.
6. High chair rules: max 2 per booking, max 2 across overlapping bookings, atomic grant (`reserve_high_chairs`), flag shown per D4.
7. Accessible flag excludes exactly Small Bay and High 4, nothing else.
8. Walk-in holds (Low 4a, High 4) and pinned tables unaffected by any website change.
9. The details-step revalidation (W0) still recovers any residual late option change.
10. Seasonal guard: no `christmas`/period booking outside an active period; period edits never mutate existing bookings.

---

## 9. Rollout, flags, rollback

- One website flag for the structural changes (W3-W6): `NEXT_PUBLIC_BOOKING_OPTIONS_STEP1`. Off = today's four-step flow. On = target flow. Both paths kept until two clean weeks pass, then the old path is deleted in a cleanup PR.
- S3 (money) gets its own flag in AMS settings, consistent with how `table_allocation_v06_enabled` was done, with old-value capture into `audit_logs` before activation.
- Ship order: W1 → W2+A1 → A2 → W3 (flag on for a quiet weekday first) → W4 → W5 → W6 → W7 → W8 → S1 → S2 → S3 → W9.
- Every release: lint, typecheck, full test suite, build, then push; verify the deploy by comparing the `?dpl=` asset id on the live domain against the new deployment, per the established workflow.
- Rollback for any website release: flag off (instant) or revert commit (minutes). For S1: migration is additive, rollback = deactivate periods. For S3: flag off returns to today's deposit rules.

---

## 10. Remaining owner decisions

Only these remain. Recommendations apply if unanswered; none blocks work before S3.

1. **Period deposits: deducted from the bill, or held as a no-show fee?** Recommendation: deducted from the bill, matching the existing group-deposit promise ("fully deducted from your bill on the day"). Blocks S3 only.
2. **Refund policy for period deposits on cancellation.** Recommendation: refundable to 7 days before, then held. Blocks S3 only.
3. **Booking horizon cap** (today a guest can book for 2029). Recommendation: cap at 12 months, one `max` attribute plus a server check. XS, any time.
4. **Christmas pre-orders:** does Christmas dinner need a menu pre-order like Sunday lunch? Recommendation: yes eventually, out of scope here; the period model leaves room (`requires_preorder` can be added to `booking_periods` later without migration pain).

---

## 11. Test plan

- **Unit (website):** every W-PR extends `tests/unit/ManagementTableBookingForm.test.tsx`. The W0 regression suite stays green throughout. New suites: option filtering per D4 (flag / grey / normal per `high_chairs_remaining`), period question rendering, merged-step navigation, PayPal section mount on the merged details screen.
- **Unit (AMS):** grant assertions extended to every new function; S1 guard tests (christmas outside period rejected, inside accepted); deposit precedence table tested as pure function.
- **Contract:** A3's pinned availability-shape test in AMS; a matching fixture test on the website proxy.
- **API journey:** extend `scripts/api-journey-test.ts` (website spec §6a) with: high-chair shortfall booking, step-free booking, period yes/no bookings, 10+ deposit in a period (precedence).
- **Manual, on a phone, before each flag-on:** the full script in the parent spec §8, plus: request 2 chairs at a 1-chair time and confirm the flag reads correctly; tick step-free and confirm the copy; book a period date answering no, then yes.

---

## 12. Effort summary

| Release | Effort | Risk |
|---|---|---|
| W0 | done | shipped |
| W1 | S | none |
| W2 + A1 | XS + XS | low |
| A2 | S | none |
| W3 | M | medium (flagged) |
| W4 | S | low-medium (flagged) |
| W5 | M | medium (flagged) |
| W6 | S-M | medium, payment adjacency (flagged) |
| W7 | S | low |
| W8 | XS | none |
| S1 | M | low (additive migration) |
| S2 | M | medium |
| S3 | L | high, money (flagged, blocks on Q1/Q2) |
| W9 | S | low |

Total: roughly four to six working days of build plus the two-week baseline window (W1) and the two-week dual-path window (W3-W6 flag).
