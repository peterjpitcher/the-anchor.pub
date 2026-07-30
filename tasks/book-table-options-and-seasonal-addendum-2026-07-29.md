# /book-table addendum: table options, accessibility wording, events and seasonal periods

Date: 2026-07-29
Repos: OJ-The-Anchor.pub (primary), OJ-AnchorManagementTools (companion)
Parent spec: `tasks/book-table-flow-simplification-spec-2026-07-29.md`
Status: spec only, no code written
Primary file: `components/features/TableBooking/ManagementTableBookingForm.tsx`

This addendum covers four owner requests raised after the parent spec was written. It does not
replace the parent spec. Where the two disagree, this document wins, and section 0 says why.

---

## 0. Corrections to the parent spec, verified against production

Four things in the parent spec are now known to be wrong or out of date. They matter because two of
them change what request 3 can honestly recommend.

**C1. The event-versus-table block is not where the parent spec says it is.**
Parent spec Change 3 states that `create_table_booking_v05` blocks a table booking when an
overlapping event booking exists. On the live v06 path that is no longer true.
`create_table_booking_core_v06` does not reference events at all. The block moved into
`find_table_allocation_candidates`, as the hard reason `table_communal`
(`OJ-AnchorManagementTools/supabase/migrations/20260801000700_allocation_candidates.sql:276-283`),
and it only covers **communal** events, via `event_communal_seat_allocations`. Verified on prod with
`pg_get_functiondef`: `create_table_booking_core_v06` matches `%event%` = false;
`create_event_booking_v05` matches `%table_bookings%` = false. The asymmetry the parent spec
described still exists, but it is narrower and it lives somewhere else.

**C2. Table bookings and event bookings are already linked in the database.**
`public.table_bookings` carries `event_id uuid` and `event_booking_id uuid`, both added by
`supabase/migrations/20260420000022_event_modes_table_reservations_and_private_buffers.sql:27-29`.
On prod, 85 of 626 table bookings carry both. The parent spec reasons as if the two record types are
unrelated. They are related, in one direction: booking a `booking_mode = 'table'` event creates an
event booking in `public.bookings` **and** a linked row in `table_bookings`. This materially changes
the answer to request 3.

**C3. The high-chair figure the guest sees is the trustworthy one.**
`app/api/table-bookings/availability/route.ts:211` resolves
`high_chairs_remaining: real.high_chairs_remaining ?? slot.high_chairs_remaining`, so the
authoritative SQL figure from `check_table_availability_v06` wins and the optimistic 15-minute-box
figure from `kitchen-pacing.ts` is only a fallback. The parent spec's fail-open note (D7) still
stands, but the number on screen is not misleading when the management API answers.

**C4. The events panel is close to dead today.**
Of 19 upcoming events on prod, 18 are `event_status = 'draft'` and 1 is `scheduled`, plus 1 scheduled
communal event tonight. `app/api/events/route.ts:26` requests `status: 'scheduled'` only. So on
almost every date a guest picks, the panel renders nothing. Any decision about events must account
for the fact that the feed is empty because of an operational backlog, not because there are no
events.

---

## 1. Request 1: all four table options on page 1, including a high-chair number

### 1.1 What changes

Today the form has four controls that are genuine availability inputs. All four already appear in
`availabilityInputsKey` (`ManagementTableBookingForm.tsx:754`):

| Control | State | Lives today on | Sent to availability |
|---|---|---|---|
| Just drinks | `drinksOnly` | Page 1 (find) | `purpose` (`:1113`) |
| I need an accessible table | `requiresAccessibleTable` | Page 1 (find) | `requires_accessible_table` (`:1114`) |
| High chair number | `highChairCount` | Page 2 (details), `:2543-2586` | `high_chair_count` (`:1115`) |
| Outside table | `isOutsideSeating` | Page 2 (details), `:2588-2596` | `outside` (`:1113`) |

Two of the four sit **after** the slot has been chosen. That is precisely the dead end the parent
spec documents as problem 1: changing either wipes `availability` and `selectedTime`, and the guest
is bounced to an empty slot list.

**The change:** move the high-chair stepper and the outside-table checkbox onto page 1, alongside
the other two, so all four availability inputs are settled before the slot grid renders. Page 2 then
holds only mobile, name, email, notes, consent, the summary and the confirm button.

This is more than a tidy-up. Once all four inputs precede the grid, `availabilityInputsKey` cannot
change after a slot is selected during normal use, so the refetch machinery added by parent-spec
Change 1 becomes a safety net for edge cases rather than a path guests routinely walk.

### 1.2 The high-chair number: the cap the owner asked for is already the live rule

The owner asked for "up to 2 per booking, no more than 2 allocated at any one time". Both halves are
already enforced in production. Nothing needs building on the cap itself.

- **Per booking, hard 2.** `OJ-AnchorManagementTools/src/app/api/table-bookings/route.ts:73`:
  `high_chair_count: z.coerce.number().int().min(0).max(2).optional()`. The database `CHECK` of 0 to
  20 (`supabase/migrations/20260728000000_highchair_outside.sql:21-22`) is a sanity bound and is
  explicitly commented as "NOT the business cap".
- **Venue-wide, 2 at any one time.** `system_settings` key `high_chair_inventory`, live value
  `{"value": 2}`, read by `count_high_chairs_in_window` over a true span overlap
  (`start_datetime < p_end AND end_datetime > p_start`), not a fixed bucket. Grants are serialised on
  a single advisory lock, `pg_advisory_xact_lock(hashtext('high_chair_reservation'))`, so two
  simultaneous requests cannot both take the last chair.

The gap is not the cap. It is three things about how the cap is communicated.

**Gap A: the picker's ceiling needs a selected slot, but the stepper is moving to before the grid.**
`highChairMax` (`ManagementTableBookingForm.tsx:908-914`) derives from
`selectedSlot?.high_chairs_remaining` and defaults to 2 when there is no slot. On page 1 phase A
there is no selected slot, so the stepper simply offers 0 to 2. That is correct and fail-open, and it
matches the per-booking cap.

**Gap B: the clamp is silent.** The effect at `:916-921` reduces `highChairCount` to `highChairMax`
with no message. A guest who asks for 2 and picks a slot with 1 free has their request quietly
halved. They find out on the confirmation screen (`:2014-2025`), which for a party of 10 or more is
after they have paid a deposit.

**Gap C: the server never refuses, and the shortfall signal is thrown away.**
`create_table_booking_core_v06:444-452` clamps the grant and completes the booking, and stores the
**granted** count, not the requested one. The RPC returns `high_chairs_short`
(`:578-580`) but `OJ-AnchorManagementTools/src/app/api/table-bookings/route.ts:598-604` maps only
`high_chairs_granted`, so the website has to infer the shortfall by comparison.

### 1.3 Exact edits

**Website (`components/features/TableBooking/ManagementTableBookingForm.tsx`):**

1. Move the block currently at `:2543-2596` (high-chair stepper plus outside-table checkbox) out of
   the `detailsUnlocked` branch and into page 1, rendered under the party size and date fields in
   phase A. Keep the existing markup, labels and `aria-live` on the count.
2. Debounce the stepper. Each availability search runs eight parallel database queries plus an
   allocation check, with no caching and no rate limiting on the AMS side
   (`OJ-AnchorManagementTools/src/app/api/table-bookings/load/route.ts:111-129`). A refetch must not
   fire per tap. This is the same constraint parent-spec Change 1 records.
3. Replace the silent clamp at `:916-921` with an explicit inline message when the selected slot
   reduces the request. Recommended copy, verbatim:
   > "Only 1 high chair is free at 7:00pm. We have kept 1 for you. If you need 2, try another time or
   > give us a ring on 01753 682707."
   Render it with `aria-live="polite"` next to the stepper. Keep the existing zero-available copy at
   `:2549-2552`, which is already honest and non-blocking.
4. In phase B, annotate any slot whose `high_chairs_remaining` is below the requested number, so the
   guest can choose a different time before committing. Do not disable the slot: the inventory cap
   never makes a slot unavailable, and the booking will still succeed.
5. Keep the confirmation-screen line at `:2014-2025` unchanged. It is the last honest backstop.

**AMS companion (`OJ-AnchorManagementTools`):**

6. Add `high_chairs_short` to the mapping at `src/app/api/table-bookings/route.ts:598-604` and to
   `TableBookingResponseData` at `:107-110`. Purely additive. The database already computes it.

### 1.4 Tables touched

No schema change. Reads and writes:

- `public.system_settings`, key `high_chair_inventory` (read only).
- `public.table_bookings`, columns `high_chair_count`, `is_outside_seating`,
  `requires_accessible_table` (existing writes, unchanged).
- Functions `count_high_chairs_in_window`, `reserve_high_chairs`, `check_table_availability_v06`,
  `create_table_booking_core_v06`, `find_table_allocation_candidates` (all read only, unchanged).

### 1.5 Risks

- **Page 1 gets heavier.** The parent spec's goal was fewer steps and less furniture. Adding two
  controls to page 1 cuts against that. Mitigation: the required fields stay at two (party size,
  date), the chair stepper defaults to 0, and both controls render as a single compact row. Net page
  count still drops from four to two.
- **More availability calls.** Four inputs on one page means more chances to trigger a refetch.
  Mitigation: keep the explicit "Find a table" button (parent-spec open question 5) and debounce.
- **A guest could now request chairs for a date they later change.** `handleDateChange` currently
  calls `setAvailability(null)`. Parent-spec Change 6 already replaces that with an inline "Date
  changed, tap Find a table" state. This work depends on that.
- **Requested chair counts are still unrecorded.** After this change we will show the shortfall, but
  the database still stores only the granted number, so unmet demand stays unmeasurable. See open
  question 1.
- **Almost no production evidence exists.** Two bookings in the entire history have ever carried a
  high chair (one with 1, one with 2, out of 626). The clamp has very likely never fired for a real
  guest, so all of this is designed against code, not against observed behaviour.

### 1.6 Effort

**M.** The move itself is S. It depends on parent-spec Changes 1 and 6, which are L. The AMS
shortfall passthrough is XS and can ship independently, first.

---

## 2. Request 2: explain what "accessible table" means, honestly

### 2.1 What the tick actually does, exactly

Ticking the box sets `requires_accessible_table`, which is sent on the availability GET (`:1114`) and
the booking POST (`:1768`), and lands in
`find_table_allocation_candidates` as the hard reason `not_accessible`
(`OJ-AnchorManagementTools/supabase/migrations/20260801000700_allocation_candidates.sql:258-260`):

```
WHEN p_requires_accessible_table AND NOT v_ignore_access
     AND (t.step_free = false OR t.standard_height = false)
  THEN 'not_accessible'
```

Live table data (12 rows, 10 with `is_bookable = true`):

| Table | Bookable | Step free | Standard height | Removed by the tick |
|---|---|---|---|---|
| Small Bay | yes | **false** | true | yes |
| High 4 | yes | true | **false** | yes |
| Big Bay, Dining Room 4a/4b/6a/6b/6c, Low 4a/4b | yes | true | true | no |
| Electric Cupbard, High 2 | no | true | true | not offered anyway |

So the tick removes exactly two tables: Small Bay (a step up to it) and High 4 (bar height with
stools). For a party of 4 or more, 8 of the 10 bookable tables remain. For a party of 1 to 3, the
four `min_party_size = 4` tables were never on offer, so the candidate set is 6 and the tick leaves
4.

Two further facts that constrain honest copy:

- The filter is **hard and never lapses**. It sits in `hard_reason`, which is evaluated
  unconditionally, unlike the minimum-party-size rules which are gated by `v_minimums_live` and lapse
  24 hours before the sitting. So the promise holds at any notice.
- It is a **filter, not a reservation and not a note to anybody**. A grep across all of AMS `src/app`
  and `src/components` for any staff-facing display of the flag returns zero hits (parent spec,
  Change 8). No SMS or email template references it. Copy must not imply a human has read it.

### 2.2 Recommended wording, verbatim

Replace the current label and sub-line (`ManagementTableBookingForm.tsx:2172-2176`) with the
following. Ship all of it, including the expander.

**Checkbox label:**

> I need a step-free table with standard chairs

**Sub-line, always visible, directly beneath the label:**

> We'll only offer you tables you can reach without a step, with ordinary chairs rather than bar
> stools.

**Expander link, closed by default, beneath the sub-line:**

> What we can and can't do

**Expander body:**

> **Getting in and around.** Our car park, bar and dining area are step-free. The beer garden is not,
> though we can put a ramp out between the garden and the bar if you ask us.
>
> **Toilets.** We don't have an accessible toilet. We're sorry, and we'd much rather tell you now
> than when you arrive.
>
> **Assistance dogs.** Always welcome, and so is every other dog.
>
> **Anything else.** Ring us on 01753 682707 before you book and we'll tell you honestly what we can
> and can't manage.

### 2.3 What makes this accurate

Every clause is traceable, and nothing promises more than the code delivers.

| Clause | Why it is true |
|---|---|
| "a step-free table with standard chairs" | Names the two attributes the filter actually tests, `step_free` and `standard_height`, in plain words. |
| "We'll only offer you tables" | The filter removes non-matching tables from the candidate set entirely, and it never lapses. "Only offer" is exactly what a hard filter does. |
| "without a step" | Exactly one bookable table, Small Bay, has `step_free = false`. |
| "ordinary chairs rather than bar stools" | Exactly one bookable table, High 4, has `standard_height = false`, and the column comment describes it as "bar-height tables with stools". |
| car park, bar and dining area step-free; garden not | `SSOT.json:249-252` and `:256`. |
| ramp on request | `SSOT.json:256`, verbatim brand fact. |
| no accessible toilet | `SSOT.json:245` lists "Accessible toilet" under `does_NOT_have`, and `:253` sets `accessible_toilet: false`. |
| assistance dogs welcome | `SSOT.json:254`. |
| phone number | `SSOT.json:52-53`. |

Equally important is what the copy deliberately **does not** say:

- It does not say "accessible", full stop. The data supports a claim about the table, not about the
  building. With no accessible toilet, calling the venue accessible would be false.
- It does not say "wheelchair accessible", "we'll reserve you a table", or "we'll let the team know".
  None of those is true today. The flag reaches no human.
- It does not mention high chairs. High 4 is both the bar-height table and the only table that cannot
  take a high chair, so the two rules overlap in the data. They must stay separate in the copy: a
  parent asking for a high chair is not asking for step-free access, and conflating them would push
  families into a narrower table set for no reason.

### 2.4 Files and tables

- `components/features/TableBooking/ManagementTableBookingForm.tsx` (copy at `:2168-2178`, plus a new
  expander).
- `tests/unit/ManagementTableBookingForm.test.tsx` (assert the new label renders, and add a negative
  assertion that the form never renders the bare word "accessible" as a venue claim).
- No schema change. `public.tables` columns `step_free`, `standard_height` are read only.

### 2.5 Risks

- **It may cost bookings.** Saying plainly that there is no accessible toilet will turn some guests
  away. That is the correct outcome: the alternative is a guest arriving and finding out.
- **It is a promise about allocation, not about the day.** The filter is applied at booking time. If
  staff move a booking to a different table on the day, nothing re-checks the flag, and no staff
  screen shows it. See open question 3. Parent-spec Change 8 should ship **before or with** this copy,
  so the promise has a human backstop.
- **Two existing bookings prove the current control is being missed.** Of 212 bookings with non-empty
  `special_requirements`, two mention access needs ("Wheelchair friendly space", "Need space to a
  walker") and both have `requires_accessible_table = false`. Clearer copy should reduce that, but
  free text is never parsed and never will be (parent spec, out of scope item 2).
- **The control is one day old.** It shipped 2026-07-28. There is no usage data. Do not read early
  low numbers as low demand.

### 2.6 Effort

**S.** Copy plus a small expander plus tests. XS if the expander is dropped, but the expander is
where the honesty lives, so it should not be dropped.

---

## 3. Request 3: how events on the chosen date are handled

### 3.1 The plain answer on "join the event"

**"Join the event" is coherent, and it already exists, but not in the shape the question implies.**

Two different things are being conflated, and the data model treats them very differently.

**Coherent, and already built: switching to an event booking.** Most events are
`booking_mode = 'table'` (18 of 19 upcoming). For those, booking the event **is** a table booking:
`public.bookings` gets the event booking, and `public.table_bookings` gets a linked row carrying
`event_id` and `event_booking_id`. That is not theoretical, 85 of 626 table bookings on prod already
carry both. The website already does this: `handleBookSuggestedEvent` (`:1295-1310`) swaps the table
form for `ManagementEventBookingForm` (`:1959`).

**Incoherent, and should not be built: adding an event to a table booking.** There is no operation
that takes an existing or in-progress table booking and attaches an event to it. `event_id` on
`table_bookings` is written by the **event** path, not the table path. The public table-booking POST
(`OJ-AnchorManagementTools/src/app/api/table-bookings/route.ts`) has no event field, and
`create_table_booking_core_v06` does not reference events at all. Building "add the event to my
booking" would mean a new write path, a new payment reconciliation, and a decision about which record
owns the table. That is a feature, not a wording change, and this addendum will not invent it.

So the honest framing for a guest is: on an event night you either book a table for the event, or you
book a table for dinner. You do not book a table and then add the event to it.

### 3.2 Recommendation

**Do two things, and explicitly do not do a third.**

**Do (a): show a quiet, non-actionable notice on any date with a scheduled event.** One line, in
phase B next to the slot grid, when `selectedDateEvents` is non-empty and there is availability:

> "Heads up: it's Quiz Night here from 7:00pm. The pub will be busy and lively that evening."

No button. A guest booking a quiet dinner at 7pm on quiz night deserves to know before they confirm,
not after. This replaces the current "Also happening on this date" panel with its "Book this event"
buttons, which answers parent-spec open question 7 more decisively than "collapse to one line": on a
date where tables **are** available, the pub's interest is the table booking, and the honest service
is the warning, not the cross-sell.

**Do (b): keep the existing highlighted panel exactly as it is for the no-availability case.** When
`availableSlots.length === 0`, the panel at `:2344-2358` with `highlight: true` is the only recovery
path for a guest the grid has just turned away, and switching to an event is a genuine alternative.
Keep `handleBookSuggestedEvent`, keep `ManagementEventBookingForm`, keep the analytics context
`choose_step_no_availability`. Nothing changes here.

**Do not (c): build any post-confirmation event cross-sell.** Three reasons, all verified:

1. `handleBookSuggestedEvent` calls `setResult(null)` (`:1303`), and the confirmed screen is an early
   return gated on `result?.state === 'confirmed'` (`:1901`). One tap would wipe the guest's booking
   reference off the screen permanently, with no URL state and no refetch.
2. The reverse guard is still missing. `create_event_booking_v05` does not reference `table_bookings`
   at all (verified on prod). A guest with a confirmed table booking could take an event booking on
   top of it and hold two tables.
3. The feed is empty. 18 of 19 upcoming events are `draft`, and `app/api/events/route.ts:26` requests
   `scheduled` only. Building a cross-sell against a feed that renders nothing on almost every date is
   effort spent on nothing.

**The highest-value action on events is not code.** Get the 18 draft events published. Until that
happens, every option in this section renders the same thing: nothing.

### 3.3 Exact edits

`components/features/TableBooking/ManagementTableBookingForm.tsx`:

1. Delete the find-step call site (`:2211-2216`, `context: 'find_step'`), as parent-spec Change 3
   already requires.
2. Split `renderDateEventSuggestions` in two. Keep the current panel for the
   `availableSlots.length === 0` case verbatim. Add a new `renderDateEventNotice` that renders the
   single advisory line for the with-availability case, using `formatEventTimeLabel(event.startDate)`
   and `event.name`, with no button and no `handleBookSuggestedEvent` call.
3. Keep the per-date dismissal (`:1287-1299`, `dismissEventSuggestionsForDate`) working on both.
4. Keep the `/api/events` prefetch effect (`:961-1033`) in place. It feeds both variants.
5. Mirror the notice into the page-2 confirm summary next to the existing "Worth knowing before you
   confirm" advisory, where the time is final. Same treatment as the aircraft note in parent-spec
   Change 7.

### 3.4 Tables touched

No schema change in this request. Read only: `public.events` (`event_status`, `booking_mode`,
`booking_open`, `date`, `time`, `price`), `public.bookings`, `public.event_communal_seat_allocations`.

If and only if the owner later wants a post-confirmation cross-sell, a prod migration adding the
reverse guard to `create_event_booking_v05` is a hard prerequisite, with explicit sign-off. That is
not in this piece of work.

### 3.5 Risks

- **Analytics discontinuity.** `booking_context: 'find_step'` drops to zero, and
  `choose_step_with_availability` changes meaning from a click surface to an impression surface.
  Annotate GA4 on the release date. Keep `choose_step_no_availability` byte-identical so the one
  funnel that matters stays comparable.
- **The warning could deter a booking.** A guest told the pub will be lively might not book. That is
  the right trade: an unhappy guest on quiz night costs more than a lost cover.
- **Communal events behave differently and the copy must not overreach.** For a communal event the
  tables are held by `event_communal_seat_allocations` and the allocator returns `table_communal`, so
  those slots will already be missing from the grid. The advisory line will therefore mostly appear
  for `booking_mode = 'table'` events. Do not write copy that assumes seats can be joined.
- **Draft events are invisible to this work entirely.** If the owner publishes the backlog, this
  feature suddenly starts firing on many dates at once. Ship the advisory line in its quiet form so
  that is a pleasant surprise rather than a wall of panels.

### 3.6 Effort

**S.** One render function split, one call site deleted, one summary mirror, plus tests. The
prerequisite operational work (publishing draft events) is not a code cost.

---

## 4. Request 4: seasonal booking periods, configurable, with a deposit per booking or per head

### 4.1 Two premises to correct first

- **Sunday lunch does not trigger a deposit.**
  `create_table_booking_core_v06:458` reads
  `v_deposit_required := (p_party_size >= 10 OR v_is_christmas) AND NOT COALESCE(p_deposit_waived, false)`.
  Sunday lunch only sets duration and the pre-order cutoff (`:319`, `:471`). There is no Sunday
  deposit rule to reconcile with.
- **Christmas already exists, hard-coded and half-finished.** `booking_purpose = 'christmas'` stamps
  `booking_type = 'christmas'`, forces a deposit at any party size, and enforces 6 to 20 guests and
  24 hours notice in SQL. The date window of 10 Nov to 20 Dec 2026 is **enforced nowhere**, stated
  plainly in the module comment at
  `OJ-AnchorManagementTools/src/lib/table-bookings/christmas.ts:16-21`. Nothing stops a Christmas
  booking being taken for June.

So this is "finish and generalise Christmas", not a new subsystem. Production has **zero**
`booking_type = 'christmas'` rows (verified), so there is no data migration and no backfill risk.

One live regular booking already sits inside the intended window (19 Dec 2026, party of 2). It is
unaffected, because the period is opt-in. See open question 6.

### 4.2 Data model, as a migration sketch

```sql
-- Migration 1 of 3: periods table, seed, booking columns, resolver.
-- Note: no CREATE EXTENSION btree_gist is required. btree_gist is NOT installed
-- on this project (verified). It is not needed: the exclusion constraint below
-- uses only the && operator on a single daterange expression, which the built-in
-- gist range_ops class handles. Do not add an equality column to the constraint
-- without installing btree_gist first.

CREATE TABLE public.table_booking_periods (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text        NOT NULL UNIQUE,        -- 'christmas-2026'
  name                text        NOT NULL,               -- 'Christmas dinner 2026'
  starts_on           date        NOT NULL,
  ends_on             date        NOT NULL,               -- inclusive
  deposit_basis       text        NOT NULL DEFAULT 'per_head'
                        CHECK (deposit_basis IN ('per_head','per_booking','none')),
  deposit_amount      numeric(10,2) NOT NULL DEFAULT 0
                        CHECK (deposit_amount >= 0 AND deposit_amount <= 1000),
  refund_cutoff_days  integer     CHECK (refund_cutoff_days BETWEEN 0 AND 90),
  min_party_size      integer     CHECK (min_party_size BETWEEN 1 AND 20),
  max_party_size      integer     CHECK (max_party_size BETWEEN 1 AND 20),
  min_notice_hours    integer     NOT NULL DEFAULT 0 CHECK (min_notice_hours BETWEEN 0 AND 720),
  is_optional         boolean     NOT NULL DEFAULT true,  -- see open question 6
  guest_prompt        text        NOT NULL,
  guest_blurb         text,
  legacy_booking_type public.table_booking_type,          -- 'christmas' on the seed row only
  is_active           boolean     NOT NULL DEFAULT true,
  archived_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid,
  updated_by          uuid,
  CONSTRAINT tbp_dates_ck CHECK (ends_on >= starts_on),
  CONSTRAINT tbp_party_ck CHECK (min_party_size IS NULL OR max_party_size IS NULL
                                 OR max_party_size >= min_party_size),
  CONSTRAINT tbp_no_overlap EXCLUDE USING gist (daterange(starts_on, ends_on, '[]') WITH &&)
    WHERE (archived_at IS NULL AND is_active)
);

ALTER TABLE public.table_booking_periods ENABLE ROW LEVEL SECURITY;
-- Service-role-only policy, mirroring settings_revisions in
-- supabase/migrations/20260801000500_table_booking_settings_rpc.sql:33-37.

ALTER TABLE public.table_bookings
  ADD COLUMN booking_period_id   uuid REFERENCES public.table_booking_periods(id) ON DELETE RESTRICT,
  ADD COLUMN booking_period_name text,      -- snapshot, survives a later rename
  ADD COLUMN deposit_rule        text CHECK (deposit_rule IN ('none','group','period','manual')),
  ADD COLUMN deposit_basis       text CHECK (deposit_basis IN ('per_head','per_booking')),
  ADD COLUMN deposit_rate        numeric(10,2);

CREATE INDEX table_bookings_period_idx ON public.table_bookings (booking_period_id)
  WHERE booking_period_id IS NOT NULL;

-- Seed row reproduces today's Christmas behaviour exactly, so nothing changes on day one
-- EXCEPT that the 10 Nov to 20 Dec window finally becomes enforced.
INSERT INTO public.table_booking_periods
  (slug, name, starts_on, ends_on, deposit_basis, deposit_amount,
   min_party_size, max_party_size, min_notice_hours, legacy_booking_type, guest_prompt, guest_blurb)
VALUES
  ('christmas-2026', 'Christmas dinner 2026', '2026-11-10', '2026-12-20',
   'per_head', 10.00, 6, 20, 24, 'christmas',
   'Is this a Christmas dinner booking?',
   'Our festive set menu, 10 November to 20 December.');

-- One resolver, called by SQL and by TypeScript. Replaces the duplicated rule in
-- src/lib/table-bookings/deposit.ts.
CREATE FUNCTION public.resolve_table_booking_deposit(
  p_party_size integer, p_period_id uuid, p_deposit_waived boolean
) RETURNS jsonb  -- {required, amount, rule, basis, rate, period_id, period_name}
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$ ... $$;

CREATE FUNCTION public.find_table_booking_period(p_date date)
RETURNS public.table_booking_periods
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.table_booking_periods
  WHERE is_active AND archived_at IS NULL
    AND p_date BETWEEN starts_on AND ends_on
  LIMIT 1;
$$;
```

The exclusion constraint is the load-bearing part: at most one live period can contain any date, so
the guest is never asked to choose between two offers and `find_table_booking_period` can safely
return a single row.

Grants must mirror `supabase/migrations/20260801001300_lock_down_new_function_grants.sql`. New public
functions get EXECUTE to `anon` and `authenticated` by default on this project, and `REVOKE FROM
PUBLIC` alone will not lock them to service role.

**Why the new deposit columns are necessary.** `table_bookings.deposit_amount` already exists but is
written on only 6 of 626 rows, and creation never writes it: the v06 RPC writes the `payments` row
only. Every reader recomputes `party_size * 10`, which is exactly why a flat per-booking deposit is
impossible today. From now on, creation stores the priced outcome.

### 4.3 Precedence against the existing deposit rules

Evaluated inside `resolve_table_booking_deposit`, in this order:

1. **`deposit_waived = true` wins outright.** No deposit, any party size, any period. Unchanged
   manager waiver semantics.
2. **Group amount** = `party_size >= threshold ? party_size * rate : 0`. The two hard-coded constants
   in `src/lib/table-bookings/deposit.ts:23-24` (`LARGE_GROUP_DEPOSIT_THRESHOLD` 10,
   `LARGE_GROUP_DEPOSIT_PER_PERSON_GBP` 10) become settings keys in a new `deposits` section of the
   existing registry, so the group rule is configurable on the same screen.
3. **Period amount** = `per_head ? party_size * amount : amount`, and 0 when the basis is `none` or no
   period applies.
4. **Take the greater of the two.** `deposit_rule` records which won, with `period` winning a tie so
   the guest-facing wording matches the period name.

**Why greater-of rather than "period replaces group".** A manager setting Mother's Day to £5 a head
must not accidentally weaken cover on a party of 14. It is also one sentence to explain to staff.
Checked against today's behaviour: Christmas is £10 per head at any size and the group rule is £10 per
head from 10 guests, so greater-of returns an identical number for every Christmas booking. The seed
row therefore reproduces current behaviour exactly.

Sunday lunch is untouched. It sets duration and the pre-order cutoff, never a deposit. A Mother's Day
period landing on a Sunday simply layers a deposit on top.

**Deposits are priced once, at creation, and stored.** Period edits never re-price an existing
booking. This is the governing rule for section 4.6.

### 4.4 Booking creation and the guest flow

`create_table_booking_core_v06` gains `p_booking_period_id uuid DEFAULT NULL` as a new overload; the
existing signature delegates with NULL so no caller breaks. Inside, in order:

1. If `p_booking_purpose = 'christmas'` (legacy alias), resolve the seeded period for the date and
   block with `invalid_period` when the date falls outside it. This closes the June-Christmas hole.
2. If `p_booking_period_id` is supplied, re-read the row server-side and reject unless it is active,
   not archived, and `booking_date BETWEEN starts_on AND ends_on`. Never trust the client's copy of
   the deposit.
3. Enforce `min_party_size`, `max_party_size` and `min_notice_hours` from the row, reusing the
   customer-safe `RAISE EXCEPTION` messages the Christmas rules already use, so
   `extractChristmasRuleErrorMessage` generalises to `extractPeriodRuleErrorMessage` and the API keeps
   returning a 400 with readable text.
4. `booking_type := COALESCE(period.legacy_booking_type, existing logic)`. Christmas still stamps
   `christmas`; Mother's Day stays `regular` with `booking_period_id` set. No enum change, so no
   `ALTER TYPE ADD VALUE` sequencing problem.
5. Call the resolver, then write `deposit_amount`, `deposit_basis`, `deposit_rate`, `deposit_rule`,
   `booking_period_id` and `booking_period_name` on the insert. `payments.metadata` gains
   `deposit_basis`, `deposit_rate`, `deposit_rule` and `period_slug`.

Hold logic, advisory locks, high chairs and allocation are all untouched.

**Availability carries the period**, so the website needs no new endpoint.
`check_table_availability_v06` gains two additive keys next to `high_chairs_remaining`:

```json
"period": { "id": "...", "slug": "christmas-2026", "name": "Christmas dinner 2026",
            "prompt": "Is this a Christmas dinner booking?",
            "blurb": "Our festive set menu, 10 November to 20 December.",
            "deposit_basis": "per_head", "deposit_amount": 10,
            "min_party_size": 6, "max_party_size": 20, "min_notice_hours": 24 },
"deposit_preview": { "with_period": 60, "without_period": 0 }
```

`period` is `null` outside a period. `deposit_preview` is computed by the same resolver for the party
size already in the request, so the website never does deposit arithmetic.
`/api/table-bookings/load` passes the RPC payload through verbatim under `table_availability`, and the
response is `no-store`. The site's availability route already merges unknown keys per slot
(`app/api/table-bookings/availability/route.ts:195-216`) but the top-level `period` and
`deposit_preview` keys need explicitly adding to the passthrough there. That is the one place this
could silently fall on the floor.

On the form, once date and party size are chosen and `period` is present, render one checkbox using
`period.prompt`, with `guest_blurb` and one deposit line ("A £60 deposit is taken to hold the
table"). Ticking it posts `booking_period_id`, shows the deposit on the summary, and when the party
size sits outside `min/max_party_size` the checkbox is disabled with the reason in plain words
("Christmas bookings are 6 to 20 guests, please give us a ring on 01753 682707"). Not ticking it books
an ordinary table with ordinary rules.

### 4.5 Manager UI

New page `/settings/table-bookings/periods` in AMS, permission `settings.manage`, reusing
`requireSettingsManagePermission`. All writes go through a `set_table_booking_period` RPC so
validation and the audit row live in the database, exactly as `set_table_booking_settings` does.

- **List:** name, date range, deposit as a sentence ("£10 per head"), status, and a live count of
  bookings taken in that period.
- **Editor:** name, start and end date, deposit basis radio (per head / per booking / no deposit) plus
  amount, optional min and max party size, notice hours, optional refund cutoff days, the guest
  question and blurb, active toggle.
- **Live preview under the deposit fields:** "A party of 6 pays £60. A party of 12 pays £120, because
  the 10-plus group deposit is larger." This is the only place the greater-of rule needs explaining.
- **Overlap** is refused by the database and surfaced as "Easter 2027 already covers 2 April".
- The group deposit threshold and rate appear on the same page as a `deposits` settings section,
  replacing the dead `deposit_amount` and `min_group_size_deposit` fields at
  `src/app/(authenticated)/settings/_components/SettingsClient.tsx:275-285`, which are saved to
  `site_settings` and read by nothing in the booking path.
- FOH: the hard-coded "Christmas" option in `FohCreateBookingModal.tsx` becomes a data-driven tickbox
  that appears when the chosen date falls in a period.

### 4.6 Editing or deleting a period that already has bookings

| Manager action | Effect on existing bookings |
|---|---|
| Rename | None. The booking keeps its `booking_period_name` snapshot; the FK still resolves for reporting. |
| Change deposit basis or amount | None. Future bookings only. Pending payment links stay valid because the stored amount now wins in `getCanonicalDeposit`. |
| Shrink the date range | None. Bookings now outside the range keep their stamp and their deposit. The editor lists the affected booking references before saving and says plainly that they are unchanged. |
| Change min/max party size or notice | None. New bookings only. |
| Deactivate or archive | Stops being offered immediately: availability returns `period: null` and create refuses with `invalid_period`. Existing bookings keep everything, and FOH/BOH still show the period name. |
| Hard delete | Not offered. The FK is `ON DELETE RESTRICT` and the UI exposes Archive only. |

To change one booking's deposit, use the existing per-booking paths: change the party size, waive the
deposit, or refund. `applyPartySizeDepositTransition` in
`src/lib/table-bookings/staff-deposit-transitions.ts` **must** call the SQL resolver rather than the
TypeScript `requiresDeposit`, or a flat per-booking deposit will silently be re-priced per head on the
first party-size edit.

### 4.7 Files and tables

**Migrations, three, in order, under `OJ-AnchorManagementTools/supabase/migrations/`:**
1. Periods table, seed, `table_bookings` columns, `resolve_table_booking_deposit`,
   `find_table_booking_period`, grants.
2. `create_table_booking_core_v06` overload plus the additive availability keys.
3. Periods CRUD RPC and the `deposits` settings section.

**TypeScript (AMS):** `src/lib/table-bookings/deposit.ts` (precedence becomes `deposit_amount_locked`
> stored `deposit_amount` whenever `deposit_rule` is set > existing payment-state branch > legacy
compute; old rows have a null `deposit_rule` so they are unchanged), `christmas.ts` (thin legacy
alias), `staff-deposit-transitions.ts`, `src/app/api/table-bookings/route.ts`,
`src/app/api/foh/bookings/route.ts`, `src/app/api/table-bookings/load/route.ts`,
`FohCreateBookingModal.tsx` and `hooks/useFohCreateBooking.ts`, plus the new
`src/app/(authenticated)/settings/table-bookings/periods/`.

**Website:** `components/features/TableBooking/ManagementTableBookingForm.tsx` and
`app/api/table-bookings/availability/route.ts` (add `period` and `deposit_preview` to the
passthrough).

**Tables:** new `public.table_booking_periods`; altered `public.table_bookings`; read/written
`public.system_settings` (new `deposits` keys), `public.payments` (metadata only),
`public.settings_revisions` (audit).

### 4.8 Risks

- **Deposit arithmetic is money.** Any drift between the SQL resolver and the TypeScript readers means
  a guest is charged the wrong amount. Mitigation: one resolver, called by both, and the TypeScript
  helper reduced to a reader of the stored figure. This is the single most important design decision
  in the request.
- **The seed row changes behaviour on day one, deliberately.** Today a Christmas booking can be taken
  for June. After migration 2 it cannot. Zero prod rows means no data risk, but tell staff.
- **The exclusion constraint forbids two live periods on one date.** That is intentional, and it is a
  decision the owner should confirm rather than discover. See open question 5.
- **A per-booking deposit changes the conversation at the table.** Is a £25 flat deposit taken off the
  bill, or is it a no-show fee? The code can do either. The policy is an owner decision, and the guest
  copy is wrong until it is made. See open question 4.
- **Rollout risk.** Gate everything behind a `booking_periods_enabled` setting defaulting to false,
  matching the `table_allocation_v06_enabled` pattern, so the availability key stays null and create
  ignores the parameter until the owner switches it on.
- **Scope.** This is the largest of the four requests by a wide margin, and it touches money, so it
  should not ship as one change.

### 4.9 Effort

**XL as specified.** Recommend splitting into three independently deployable phases:

- **Phase 1 (M):** migrations 1 and 2, resolver, seed, enforce the Christmas window, stored deposit
  columns. No UI. Behaviour identical except the window is now enforced.
- **Phase 2 (M):** manager UI plus the `deposits` settings section. The owner can create Mother's Day,
  Easter and Father's Day, but nothing is offered to guests yet.
- **Phase 3 (M):** availability keys, the guest tickbox, FOH tickbox, flag switched on.

---

## 5. Open questions

Each has a recommendation. If there is no reply, the recommendation is what will be built.

1. **Should we record the chair count a guest asked for, before it is clamped?**
   Recommendation: **yes, and it is cheap.** Today `table_bookings.high_chair_count` stores the
   granted number, so unmet demand is unmeasurable. Add `high_chair_count_requested integer` in the
   same migration as anything else touching that table. Without it, we will never know whether two
   chairs is enough.

2. **Should the high-chair stepper appear on page 1 for every booking, or only when the guest opens a
   "anything else?" row?** Recommendation: **always visible, defaulting to 0.** Two bookings in the
   entire history have used it, which is far more likely to be a discoverability problem than a demand
   problem. Hiding it now guarantees the signal never appears.

3. **Does the accessible-table promise survive a table move on the day?** Recommendation: **treat this
   as unverified and ship parent-spec Change 8 first.** The filter is applied at booking time. I have
   not traced whether `move_table_booking_time_v05` or the FOH move-table feature (shipped 2026-07-29)
   re-applies `requires_accessible_table`. Until staff can see the flag, a mis-set or overridden flag
   is uncatchable.

4. **Is a per-booking seasonal deposit money off the bill, or a no-show fee?** Recommendation: **money
   off the bill**, same as the existing group deposit, because it is what guests already expect from
   you and it needs no new refund handling. Tell me if you want it to be a forfeit and I will add
   `refund_cutoff_days` handling to the guest copy and the cancellation path.

5. **Should two seasonal offers ever be live on the same date?** Recommendation: **no.** The
   exclusion constraint enforces one, the guest is never asked to choose, and every real case (Christmas,
   Mother's Day, Easter, Father's Day) is naturally exclusive. Say so now if you disagree, because
   relaxing it later means dropping a constraint and redesigning the guest question.

6. **From 10 Nov to 20 Dec, can guests still book an ordinary meal?** Recommendation: **yes, keep the
   period opt-in.** You already have a regular booking on 19 December 2026 and turning the window
   compulsory would cancel or re-price it. The `is_optional` column exists so you can change your
   mind per period later.

7. **Should the events advisory line appear for every scheduled event, or only for loud ones?**
   Recommendation: **every scheduled event, with neutral wording.** You do not have an event-noise
   attribute in the data, and inventing one is a bigger change than it is worth. Neutral wording
   ("busy and lively") is honest for all of them.

8. **Will you publish the 18 draft events?** Recommendation: **yes, and this is the highest-value
   action in section 3.** Everything in that section renders nothing until you do. This is an
   operational task, not a code change.

9. **Should the seasonal work ship as three phases?** Recommendation: **yes.** It touches deposits,
   which is money, and a single XL change to the payment path on the run-up to Christmas is the wrong
   risk to take. Phase 1 alone already fixes the June-Christmas hole.

---

## 6. Evidence gaps, stated honestly

- **High chairs have almost no production history.** Two bookings in 626 have ever carried one. The
  clamp behaviour has very likely never fired for a real guest, so every design decision in section 1
  is reasoning about code, not about observed behaviour.
- **I did not audit the analytics payload.** `recordTableBookingAnalyticsSafe`
  (`OJ-AnchorManagementTools/src/app/api/table-bookings/route.ts:115-135`) may or may not carry the
  requested chair count. I confirmed it is not on the booking row and did not trace further, so open
  question 1 may already be partly answered somewhere I have not looked.
- **I did not trace whether the confirmation SMS or email states the granted chair count.**
  `src/lib/table-bookings/bookings.ts` computes `grantedHighChairs` in four places (`:542`, `:962`,
  `:1182`, `:1583`) but I did not follow it into the message templates. If it is absent, the guest's
  only notice of a shortfall is the on-screen confirmation.
- **I did not verify whether a table move re-applies the accessibility filter.** This is open
  question 3 and it is the weakest link in the section 2 promise.
- **`Electric Cupbard` and `High 2` have `is_bookable = false`.** I have not established whether that
  is deliberate or a default left unset. It changes the "8 of 10 tables" figure if it is wrong. The
  same applies to `High 4`'s `high_chair_capable = false`, which is the only setting that can turn a
  chair request into a `no_table` slot.
- **The accessible-table control is one day old.** Any early usage number proves nothing.
- **No conversion baseline exists for any of this.** The parent spec's PR0 must capture it, and
  everything here inherits that gap.
- **The seasonal design has not been reviewed by anyone other than me.** It touches money. It should
  get an independent read before Phase 1 is written.
