# Book a Table: implementation plan

Date: 2026-07-30
Drives: `tasks/book-table-full-spec-2026-07-30.md` as amended by `tasks/book-table-full-spec-developer-review-2026-07-30.md`.
The review found 41 issues (many P0). This plan builds ONLY what the review leaves unblocked, fixes the defects it confirmed, and parks everything needing an owner decision or contract design. Phase numbering here supersedes the spec's ship order.

## Ground rules for every task

- Website work happens in the primary checkout (`/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`, on `main`). Stage EXPLICIT files only, never `git add -A`. Diff every file before committing (a parallel session leaves untracked docs in `tasks/`; never sweep them in).
- AMS work MUST NOT touch the primary checkout (`/Users/peterpitcher/Cursor/OJ-AnchorManagementTools` is on another session's `feat/voucher-system` branch with live uncommitted work). All AMS tasks run in a fresh git worktree created from `origin/main`, and push `main` from that worktree. Never checkout, stash or branch-switch in the primary tree.
- Node 20 (`nvm use 20`) for all installs, tests and builds in both repos.
- Verification per repo before any push: lint (zero warnings), `tsc --noEmit`, full test suite, production build.
- No em dashes in any file or message. Conventional commits. One concern per commit.
- Cross-repo contract changes deploy AMS first, then website (review F37). Task T4 depends on this.
- Nothing in Phase 1 flips any user-visible flag or applies any production DB migration.

## Phase 1: unblocked now (this plan executes exactly these)

### T1. Analytics baseline (spec W1, review F21/F22)
Repo: website. Files: `lib/gtm-events.ts`, `components/features/TableBooking/ManagementTableBookingForm.tsx`, `tests/unit/`.
- Make the documented-but-never-fired funnel steps actually emit (`availability_check`, `details_entered`).
- Add events with explicit schemas: `booking_step_viewed {step}`, `option_toggled {option, value, step}`, `slot_flag_shown {chairs_free, chairs_requested}`, `slot_invalidated {reason}`, `booking_error_shown {code}`.
- NO personal data in any event payload: no names, phone numbers, notes or booking references (F22).
- Acceptance: events fire in unit tests via the mocked `trackTableBookingFunnel`/`pushToDataLayer`; no UI change; snapshot of event names documented at the top of `lib/gtm-events.ts`.

### T2. Remove the availability fail-open (review F04, P0)
Repo: website. Files: `app/api/table-bookings/availability/route.ts`, the `getTableBookingLoadFailOpen` helper in `lib/`, form, tests.
- Today an AMS load timeout (1.5s) returns `null` and the route serves locally calculated schedule slots that know nothing about tables, private bookings or events. That can resurrect the exact false-availability defect v06 killed.
- Change: when authoritative availability is missing or times out, return an explicit `availability_unknown` state. The form shows "We could not check live availability, try again" with a retry button and the phone number. NEVER render locally guessed slots as bookable. Raise the timeout to a sensible budget (3s) with one retry.
- Acceptance: unit test proves a timed-out AMS load produces the unknown state and zero bookable slots; a normal load is unchanged.

### T3. Close the phone-lookup data exposure (review F10, P0 security)
Repo: website (and AMS only if the leak is server-side there). Discovery first: find the lookup route the form calls with a bare phone number.
- Today it returns customer ID, full name and email to anyone who types a phone number. Stop that: the pre-verification response must contain nothing identifying (at most `{ known: true }` if the flow needs it; prefer nothing).
- Adjust the form so nothing depends on the removed fields (greeting/prefill falls back to empty inputs).
- Acceptance: grep proves no identity fields in the response type; unit test on the route asserts the response shape; form suite green.

### T4. Idempotency covers accessibility (review F18, P0)
Repos: BOTH. AMS ships first.
- Add `requires_accessible_table` to the AMS request hash, the website proxy fingerprint and the client fingerprint, so a retry with changed accessibility intent is a new booking intent, not a replay.
- Compatibility note (F37): AMS accepting the new field in its hash must tolerate old-website requests that omit it (treat absent as false, which matches today's hash). Deploy AMS, verify, then website.
- Acceptance: unit tests both sides: identical retry dedupes; changed-accessibility retry does not.

### T5. Last name optional on the form (spec W2 as corrected by review F09)
Repo: website only. AMS already accepts an optional surname (verified in review §3); A1 is a verification, not a build.
- Form: "Last name (optional)", drop the required validation, omit blank surname from the payload (the proxy already does).
- Verify and record in the PR description: SMS/email templates, confirmation screen and summary render cleanly with no surname.
- Acceptance: form suite extended: booking completes with first name only; validation message no longer mentions last name.

### T6. High-chair honesty (review F06, within owner decision D4)
Repo: website. Depends on T5 landing first (same file).
- Stop silently clamping the submitted request to the advisory remaining count.
- When the guest picks a slot flagged with a shortfall, require a tap on an explicit acknowledgement before Continue: "Only 1 high chair is free at this time. Book with 1?"
- Submit the ORIGINAL request; the existing confirmation copy ("X of Y reserved") remains the safety net for a race at create.
- Acceptance: unit tests: shortfall slot requires acknowledgement; non-shortfall slot does not; payload carries the requested number, not the clamped one.

### T7. Staff can see what the guest asked for (spec A2, review line "A2 may proceed")
Repo: AMS (worktree). Files: `src/app/(authenticated)/table-bookings/foh/components/FohBookingDetailModal.tsx`, BOH booking detail, BOH print sheets.
- Badges: "Step-free table" when `requires_accessible_table`; high chairs as "High chair x2 (asked 2)" using granted (and requested when they differ, if the field exists; do not add columns).
- Display only, no schema change. Follow the existing Badge components and 44px touch rules.
- Acceptance: targeted component tests; lint/typecheck/build; screenshots in the commit message description.

### T8. Pin the real availability contract (review F03, discovery half of A3)
Repos: BOTH, tests and types only, no behaviour change.
- Type `table_availability` properly in `lib/api/client.ts` (today it is read through `any`): the real two-collection shape (`slots` with pacing and high chairs; `table_availability.slots` with `state`, public reason, message, `high_chairs_remaining`).
- Shared fixture: one JSON captured from production shape, checked into both repos; a contract test in each repo asserts its own side against it (AMS: the load route serialiser; website: the parser).
- Document in the fixture file header which fields each side may rely on. This is the foundation W3 was missing; no merging logic changes now.
- Acceptance: both contract tests green; `any` access to `table_availability` removed.

### T9. Runtime kill-switch mechanism (review F19)
Repos: BOTH, mechanism only, nothing uses it yet.
- A `NEXT_PUBLIC_*` build-time flag cannot be an instant rollback. Replace the plan with: AMS holds `website_ui_flags` in `system_settings` (managed via the existing settings RPC pattern, service-role only, grants locked per the standing rule); the website reads it server-side through the existing authenticated proxy channel with a 60-second cache and a safe default of OFF when unreachable.
- Acceptance: AMS: setting exists, RPC validates it, grant test extended. Website: `lib/flags.ts` returns the flag server-side with cache and default-off; unit tests for unreachable/malformed cases.

### T10. Spec status honesty (review F01)
Repo: website, docs.
- Edit the spec header to: "Status: ready for contract discovery and non-payment preparation. The main flow, seasonal migration and payment release are blocked by the decisions and findings in the developer review." Add a normative-reference note (F40) pointing at the review and this plan.

## Sequencing

Website file `ManagementTableBookingForm.tsx` is the hot zone: T1, T2(part), T3(part), T5, T6 touch it and run SEQUENTIALLY in that order. T4-website follows T2. Parallel to all of that: AMS stream T7 → T4-AMS → T8-AMS → T9-AMS in one worktree. T8-website and T9-website close out after both streams. T10 any time.

Commits push to `main` per completed task after the full verification pipeline; website pushes auto-deploy production, which is safe because Phase 1 changes are defect fixes and additive mechanisms, with no flag flipped. Deploy order for T4: AMS push first, verify live, then website push.

## Phase 2: design work, needs no owner but blocked behind Phase 1

Not executed by this plan. Produce as documents for review: the PayPal screen-2 state machine (F11), the refinement latest-request-wins policy with latency budget (F23), the create-error response-to-UI matrix (F24), the versioned single-contract design for mixed food-and-drinks grids (F03/F05), monitoring counters and alerts (F35).

## Phase 3: owner-gated (do not start)

W3-W6 structural flow, W4 preferred-time removal (blocked by F05 contract), S1-S3 seasonal, OTP verification (F10 full fix), W7-W9. Gated on the decisions below plus Phase 2 designs.

## Owner decisions: ANSWERED 2026-07-30. These are now binding, do not re-ask.

| # | Question | Owner's answer |
|---|---|---|
| A | Break up the booking form before the redesign? | **Yes**, provided the end result is the approved prototype design. Refactor is a means, not a change of design. |
| B | Wire the runtime rollback flag? | **Yes**, build the recommendation. |
| 1 | Bring back Sunday lunch pre-orders? | **Not now.** Sundays are regular food bookings. BUT see 6: pre-orders ARE needed for Christmas, so the retired mechanism is revivable groundwork, not dead code. Do not delete it. |
| 2 | High chairs at outside tables? | **Yes, and make it solid.** Guests must be able to reserve a high chair outside. The current half-state (AMS reserves chairs but the outside path allocates no physical table) must be properly modelled. |
| 3 | Step-free plus outside? | **Allow it.** All outside tables are normal height and the garden is step free. The pub never promises a specific table; the flag exists mainly so the kitchen knows its pacing. |
| 4 | Booking horizon cap? | **12 months.** |
| 5 | Ship the flow change all at once or staged? | **All at once**, behind one runtime flag, AND delete the old path once it is proven. Explicit instruction: clean up code that is no longer needed, to avoid future problems. |
| 6 | What does a guest get who says "not a Christmas dinner" in December? | **The normal menu at normal terms.** Only the Christmas dinners are pre-book, pre-order and deposit bound. This means the seasonal period model MUST support a per-period pre-order requirement. |
| 7 | Seasonal deposit lifecycle | **Off the bill.** Refundable until 7 days before; inside 7 days, no refund. A manager may waive, with an audit record. |

**Refund window CONFIRMED by the owner 2026-07-30:** "it's available for full refund 7 days out". So: **full refund up to 7 days before the booking date; inside 7 days, no refund.** A manager may still waive, with an audit record. Guest-facing copy must state the 7-day line plainly at the point the deposit is taken.

**Consequence of 1 + 6 combined, which changes the seasonal scope:** `booking_periods` needs `requires_preorder`, and Christmas needs a menu-selection step, a pre-order cutoff and fulfilment rules. That is the retired Sunday pre-order flow's shape. Scope it from that code rather than designing fresh.

---

## Superseded: the original decision list, with recommendations (kept for history)

1. Sunday lunch pre-order: the code has RETIRED the public flow; the spec assumed it still exists (F02). Is it meant to return? Recommendation: no for this project; treat Sundays as regular food bookings and strike it from the spec.
2. High chairs on outside tables: currently reserved even for outside bookings; the spec said no interaction (F07). Recommendation: allow chairs outside (the code already does), and drop the "no interaction" line.
3. Step-free + outside together: nothing enforces a step-free outside table (F08). Recommendation: allow the combination but soften the promise to "the garden is step free" without guaranteeing a specific table height until outside tables are modelled.
4. Booking horizon: cap online bookings at 12 months (F29)? Recommendation: yes.
5. W3-W6: ship as ONE tested package behind the T9 runtime flag, rather than four separately flagged stages (F20). Recommendation: one package.
6. Seasonal "No" answer: what does a guest get who says no during a Christmas period (F25)? Recommendation: normal menu at normal terms, and if the kitchen will not run a normal menu on those dates, "No" is not offered on those dates.
7. Deposit lifecycle for seasonal periods (F41 + spec §10): off the bill or no-show fee, refund window, who may waive, party-size edits. Recommendation: off the bill, refundable to 7 days out, manager waiver allowed with audit.

## Definition of done for this plan (Phase 1)

Every T1-T10 task: code merged to `main` in its repo, full pipeline green (lint, typecheck, tests, build), pushed, production deploy verified via the `?dpl=` asset check, and a one-line entry appended under "Results" below by the executor.

## Results

(appended as tasks complete)
