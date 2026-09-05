# Nations Championship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the implement-plan skill to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drive completed table bookings for each confirmed game from the-anchor.pub tournament page, using Cheers-managed fixtures and existing pub/kitchen hours without changing them.

**Architecture:** Management supplies a strict, date-specific public operating-hours projection. Cheers combines that projection with fixture and screening decisions for both a versioned website feed and social eligibility checks. The website server-renders that feed, preserves fixture context into existing management bookings and measures genuine booking outcomes.

**Tech Stack:** Existing management Next.js 15/React 19/Vitest/Supabase; Cheers Next.js 16.2/React 19.2/Vitest/Supabase/QStash; website Next.js 14/React 18/Jest/Luxon. Retain existing Tailwind, Zod, GTM, booking and publishing libraries.

**Spec:** [Delivery specification](./spec-2026-09-05-nations-championship.md), including the 24-fixture inventory, research, accepted scope, source references and operational rules.

## Implementation record, 5 September 2026

Local code for increments A-F is implemented. Independent reviews repaired stale social-content checks and uncertain booking recovery. See [release evidence](./nations-championship-release-evidence.md) for observed results and [release packet](./nations-championship-release-approval.md) for remaining live actions.

The checklists below retain mixed implementation and live verification requirements. An unchecked mixed item does not mean its code is absent. Production application, authenticated live editor mutations, real booking/deposit completion, live GA4 verification and provider sends have not been performed. Those outcomes must not be inferred from local tests.

Implementation decisions confirmed during code review:

- Use a separate tournament-scoped feed key and exact slug, preserving the existing football key.
- Deploy Management's additive read-only booking-replay support before the website. Its mandatory envelope makes an older Management deployment reject the request without creating a booking.
- Retry identity uses the stable fixture ID and customer notes. Recover an existing attempt before checking changed screening facts; new cancelled-game attempts remain blocked.
- Keep the uncertain request in the current form's memory, with an explicit recovery action. No new browser storage of personal information was added.
- Do not import invented planned end times, channels or screen assignments. The verified CSV keeps those decisions unconfirmed.

## Global Constraints

- Implementation authorised by the user on 5 September 2026. Production migration, import, deployment and social sending still require the concrete release approval in Task 9. Opening-hours changes are excluded.
- Domain: https://www.the-anchor.pub; URL: /live-sport/nations-championship; timezone: Europe/London.
- Management owns hours, kitchen sittings, availability, bookings and deposits. Cheers owns fixtures and screening decisions. No duplicated manually editable operating hours.
- Preserve World Cup feed compatibility and existing football tournaments. Existing bookings retain deposit/consent/anti-bot/idempotency behaviour.
- Opening and kitchen times stay unchanged. Do not propose or create early opening, late closing or extra service exceptions. Confirmed games starting before opening are shown from current opening time, with a clear start-missed warning and a prominent fixture booking button.
- Never promise every match, full screening, commentary, food or available tables without evidence.
- Never send real messages or create real bookings as an unapproved test. Providers must be mocked or isolated in the test environment.
- Follow /Users/peterpitcher/Cursor/CLAUDE.md and each repository's CLAUDE.md. Read tasks/lessons.md where present.
- Use prod-migrate and Supabase skills for schema work; deploy-verify for any deployment claims; e2e-test for browser/flow verification; editorial-team and frontend-design before page copy and UI implementation.
- No em dash characters; no new package, key or broad unrelated refactor by default.
- New database objects, privileges, indexes and constraints remain proposals until live schema/dependencies are verified. Do not execute example code from this document against production.

## Delivery structure and dependencies

Complexity: 5, cross-repository feature with schema and publishing changes. Split reviewable work into the following increments, aiming at 300-500 meaningful changed lines per PR; split a row further if needed. Do not combine the entire feature into one PR.

| Increment | Deliverable | Depends on | Deployment condition |
| --- | --- | --- | --- |
| A | Management strict screening-hours API | Readiness gate | Additive endpoint; existing hours routes unchanged |
| B | Cheers additive schema and pure screening policy | Readiness gate | Exact migration approval; tournament remains inactive |
| C | Cheers stale-post guards in both publishers | A, B | Guards deployed before enabling new rugby generation |
| D | Cheers editor/import/versioned feed | A, B, C | New tournament remains inactive until reviewed |
| E | Website data reader, fixture-aware booking context | D | Backward compatible; new page not linked yet |
| F | Website page, calendar, SEO, analytics | E | Staged preview only until content and operating decisions reviewed |
| G | Approved configuration, release and operational verification | A-F | Migration, configuration, deployment and scheduling scopes explicitly authorised |

Parallel implementation can work on A and B, then website mock-fed presentation alongside C/D. Integration and releases follow dependencies. Do not grant a task access to mutate another agent's files. An implement-plan executor must preserve unrelated work in all repos.

## Repository roots and file ownership

All paths in task lists below are relative to these explicit roots:

- **W:** /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
- **C:** /Users/peterpitcher/Cursor/OJ-CheersAI2.0
- **M:** /Users/peterpitcher/Cursor/OJ-AnchorManagementTools

An unmarked task file is new only when labelled Create; existing files are labelled Modify or Read. Verify exact imports again before editing. Do not modify stale duplicate components.

Original planning deliverables are retained. Implementation is isolated in three worktrees. The release evidence records the exact changed-file inventory and verification limits.

## Shared contracts

### Public operating-hours contract (M produces; C consumes)

Create M/src/lib/business-hours/screening-contract.ts and use the same JSON shape in C/src/lib/management-app/screening-hours.ts. The API returns only public operational fields; no event/customer/private-booking details.

```ts
export type ServiceWindow = { startAt: string; endAt: string }
export type ScreeningDayHours = {
  date: string
  state: 'open' | 'closed' | 'unknown'
  regularOpensAt: string | null
  bar: ServiceWindow | null
  kitchen: ServiceWindow[]
  kitchenState: 'known' | 'unknown'
  hasSpecialHours: boolean
  fingerprint: string
}
export type ScreeningHoursResponse = {
  schemaVersion: 1
  timezone: 'Europe/London'
  days: ScreeningDayHours[]
}
```

GET /api/business/screening-hours?dates=2026-11-07,2026-11-14 returns the existing success/data response envelope. Validate real ISO dates, deduplicate and limit to 31 dates within the existing online planning horizon (one year, verified during implementation). Reject invalid requests with 400 and excessive requests with the existing rate-limit response. Missing rows or dependency failures return a non-success response, never an empty success interpreted as regular opening. Use no-store. Fingerprints hash a deterministic ordered projection of operational fields, excluding request time. Unknown kitchen means food cannot be promised, not that the pub is closed.

### Screening contract (C produces; W consumes)

Create C/src/lib/tournament/screening.ts. Extend C/src/types/tournament.ts and mirror the curated public contract in W/lib/nations-championship/types.ts. No database row should be exposed by spreading it into a response.

```ts
export type ScreeningDecision = 'unconfirmed' | 'confirmed' | 'not_showing'
export type BroadcastDecision = 'unconfirmed' | 'confirmed' | 'not_linear'
export type Commentary = 'unconfirmed' | 'on' | 'off'
export type Coverage = 'full' | 'from_opening'
export type ScreeningFacts = {
  id: string
  importKey: string
  sport: 'football' | 'rugby_union'
  round: string
  roundNumber: number | null
  finalPosition: number | null
  teamA: string
  teamB: string
  teamsConfirmed: boolean
  kickOffAt: string
  plannedEndAt: string | null
  matchState: 'scheduled' | 'in_progress' | 'finished' | 'cancelled'
  screeningDecision: ScreeningDecision
  broadcastDecision: BroadcastDecision
  linearChannel: string | null
  screenLabel: string | null
  commentary: Commentary
  coverage: Coverage // Derived from existing opening hours, not a separate approval
  sourceUrl: string | null
  sourceCheckedAt: string | null
  broadcastCheckedAt: string | null
  screeningConfirmedAt: string | null
  contentRevision: number
  bookingUrl: string | null
}
export type ScreeningProjection = {
  status: 'awaiting_channel' | 'awaiting_decision' | 'hours_unknown' |
    'opening_conflict' | 'confirmed_full' | 'confirmed_partial' |
    'not_showing' | 'finished' | 'cancelled'
  screeningStartAt: string | null
  screeningEndAt: string | null
  openingLabel: string
  kitchenLabel: string
  foodPromotion: {
    kind: 'during_screening' | 'before_match' | 'none' | 'unknown'
    serviceWindows: ServiceWindow[]
    overlapWindows: ServiceWindow[]
    message: string | null
  }
  canBookForScreening: boolean
  canGenerateTeamPromotion: boolean
  hoursFingerprint: string
}
export function resolveScreening(
  fixture: ScreeningFacts,
  hours: ScreeningDayHours,
  now: Date
): ScreeningProjection
```

The function is pure. Channel, screen and hours checks are authoritative; `showing` is only the existing compatibility field. Old football fixtures retain legacy semantics until explicitly migrated. For rugby, derive `showing` from a valid confirmed projection, never accept an independent contradictory toggle. `contentRevision` increments for every publish-relevant fixture or screening change.

GET C/api/feed/[tournamentId]?showing=all&schema=2 returns:

```ts
export type ScreeningFeed = {
  schemaVersion: 2
  tournament: { id: string; name: string; slug: string; status: string }
  fixtures: Array<ScreeningFacts & {
    hours: ScreeningDayHours
    screening: ScreeningProjection
  }>
  meta: { fetchedAt: string; contentUpdatedAt: string | null }
}
```

Existing schema/default requests retain their existing shape and cache policy. Schema 2 reads current hours and uses no-store; never present fetchedAt as verified facts. Unknown hours can still produce a useful fixture list with all dependent confirmations/CTAs disabled. Use server-only API keys and account scoping.

### Truth table

| Input | Public result | Promotion / booking |
| --- | --- | --- |
| Unconfirmed broadcast | Awaiting ITV channel confirmation | No fixture-specific booking or promotion |
| Confirmed channel, unconfirmed decision | Screening decision pending | No confirmed-screening CTA |
| Explicit not showing | Not showing | No screening CTA |
| Confirmed full, opening covers interval | Main screens with commentary, or allocated screen/audio detail | Booking enabled; team promotion only with known teams |
| Confirmed screening; opening after kick-off but before end, closing covers end | Showing from current opening; start missed | Booking enabled for real slots from opening |
| Same screening in website and social content | Same opening time and start-missed wording | Per-game booking remains the primary CTA |
| Closing before planned end or pub closed | Opening conflict / not showing | Disabled |
| Hours missing or request failure | Opening times unavailable; check before travelling | Disabled |
| Kitchen closed | Kitchen closed | Drinks screening remains eligible |
| Planned end passed, not marked finished | Not eligible as next upcoming match | Do not invent result or final whistle |
| Unknown finalists | Named placement placeholders | No team-specific generation |
| Cancelled or finished | Cancelled or finished | No future booking CTA |

### Food promotion contract

The projection's foodPromotion is shared by all website and Cheers surfaces. serviceWindows contains actual eligible kitchen sittings clipped to confirmed bar opening; overlapWindows is their positive-duration intersection with the screened match interval. For during_screening, use max(kickOffAt, screeningStartAt) through plannedEndAt. Keep original service times for honest opening/closing messages. Do not present clipped overlap times as actual kitchen opening/closing times.

If no during-screening overlap exists, before_match requires a confirmed kitchen interval on the same local date ending at or before kick-off, within bar hours. Show the exact interval and call it pre-match food. No confirmed screening means kind=none; unavailable kitchen facts mean kind=unknown. Neither permits food claims. A pure overlap helper in C/src/lib/tournament/screening.ts can use:

```ts
export function intersectServiceWindows(
  first: ServiceWindow, second: ServiceWindow
): ServiceWindow | null {
  const start = Math.max(Date.parse(first.startAt), Date.parse(second.startAt))
  const end = Math.min(Date.parse(first.endAt), Date.parse(second.endAt))
  return Number.isFinite(start) && Number.isFinite(end) && start < end
    ? { startAt: new Date(start).toISOString(), endAt: new Date(end).toISOString() }
    : null
}
```

Input dates are already validated instants; output is transport UTC, not customer-facing formatting. Test full overlap, service ending mid-game, opening mid-game, split sittings, pre-match only, touching endpoints, kitchen closure, unknown hours and partial screening from opening. Display/promote the service times rather than promise an uninterrupted meal service until the actual final whistle.

## Task 0: Readiness and evidence gate

**Files:** Read W/C/M CLAUDE.md; W/docs/SSOT.md and SSOT.json; C/supabase/config.toml and migration history; M/src/lib/business-hours/effective.ts, resolve.ts and kitchen-windows.ts; W/lib/api/client.ts and booking flow; C publishing paths. Create C/tasks/SPEC-nations-championship.md and C/tasks/PLAN-nations-championship.md as short pointers to the canonical W spec/plan during implementation, not competing copies.

**Interfaces:** Consumes the specification. Produces a verified schema impact record and release dependency checklist in the PR.

- [x] Run git status -sb in all three repos, identify existing changes and use isolated codex/nations-championship branches/worktrees when implementation is authorised. Do not include unrelated management invoice changes.
- [x] Run nvm use in each repository shell, then inspect package scripts and existing test runners. Record missing runtime/tool access as a precise blocker.
- [x] Verify Cheers Supabase identity from repository configuration and connected project URL. Query live tournament/fixture/content/job schema, constraints, indexes, RLS, grants, dependent views, triggers, row counts and migration history. Read only.
- [x] Verify management live opening-hours/special-hours schema and dependent views before adding the new query path. Check existing auth/rate-limit helpers; reuse existing public-hours access pattern and expose only the curated fields.
- [x] Trace the exact request through website booking page, active form, website POST and management notes storage. Confirm the 500-character management notes limit.
- [ ] Recheck official fixtures and current management date-specific hours/events. Verify the 13 November clash without changing the event. Treat the 24 supplied fixture rows as candidates until verified.
- [x] Review existing imagery, four-screen evidence and children policy against SSOT. Keep unavailable claims out of draft copy rather than inventing them.

**Acceptance:** Evidence records identify real project refs and exact objects without secrets. No SQL is drafted against an assumed schema. No pending operational decision blocks scaffolding: defaults remain unconfirmed and existing hours remain in force.

## Task 1: Strict management operating-hours projection (increment A)

**Files:** Create M/src/lib/business-hours/screening-contract.ts, screening-hours.ts, M/src/app/api/business/screening-hours/route.ts, M/tests/lib/business-hours/screening-hours.test.ts, M/tests/api/business/screening-hours.test.ts. Read existing effective.ts, resolve.ts, kitchen-windows.ts and src/lib/api/auth.ts. Leave existing /business/hours response unchanged.

**Interfaces:** `getScreeningHours(dates: string[]): Promise<ScreeningHoursResponse>` consumes published weekly versions and exact-date overrides; API produces the public contract above. Pure `projectScreeningDay` maps resolved rows to timezone-qualified windows.

- [x] Write tests for reading existing date-specific overrides without modifying them, closed kitchen, split sittings, full-day closure, future weekly version, overnight closing and missing special-hours query results. Use repository DB mocks and synthetic dates, never real mutation calls.
- [x] Assert the strict failure case first:

```ts
it('does not invent regular opening when exceptions cannot be read', async () => {
  specialHoursQuery.mockRejectedValue(new Error('database unavailable'))
  await expect(getScreeningHours(['2026-11-07'])).rejects.toThrow()
})
```

Here `specialHoursQuery` is the test mock for the adapter's exact special_hours read, not a new production global. Define it with vi.fn in the test and inject through the repository's existing database mock.

- [x] Load published versions once, call resolveForDates for requested dates, and read special_hours for precisely those dates. Apply complete override semantics and existing resolveKitchenWindows, including null kitchen and empty sittings.
- [x] Produce ISO instants in Europe/London, deterministic fingerprints using node:crypto and stable field ordering, and no personal data. Do not echo unrelated legacy service text.
- [x] Add request validation, bounds, rate limiting and no-store response. On data failure return a non-success 503; on valid closure return state=closed. Log the failed dependency without credentials.
- [x] Run focused tests in Europe/London and UTC, then management lint, tsc, tests and build. Commit only this additive endpoint and tests after gates pass.

**Acceptance:** The exact GET path returns the documented envelope and real intervals. One request uses bounded queries, not a query per fixture. A forced exception read failure yields 503, not a false promise of ordinary opening.

## Task 2: Additive Cheers rugby model and policy (increment B)

**Files:** Modify C/src/types/tournament.ts, C/src/lib/tournament/validation.ts, queries.ts, placeholder.ts and their existing tests. Create screening.ts, screening.test.ts, C/src/lib/management-app/screening-hours.ts and its test. Generate the new migration with `supabase migration new nations_championship_screenings` after Task 0; do not invent its timestamp. Add a safe fixture import key scoped to tournament.

**Interfaces:** Types and resolveScreening above; client `fetchScreeningHours(dates: string[]): Promise<ScreeningHoursResponse>` uses the verified management base URL and existing server integration configuration.

- [x] Add failure tests for unknown finals, unsupported broadcast, absent end time, opening after kick-off and closing before planned end.
- [x] Draft an additive migration after checking live state: sport default football; keep existing round values and add league_round/placement_final; add nullable roundNumber/finalPosition, screening fields and timestamps; preserve existing football rows and privileges. Include fixture contentRevision and importKey support. Use text/check constraints rather than destructive enum changes where the real schema allows.
- [x] Do not backfill historical screening confirmations. New rugby fixtures default unconfirmed. A historical `showing=true` is not evidence of a verified channel.
- [x] Add explicit teamsConfirmed handling in CSV/editor/import paths. Europe Nth/Rest of World Nth and unknown labels are placeholders; do not infer a confirmed team from an unfamiliar string.
- [x] Implement the pure truth table. Derive coverage from current hours: screeningStartAt=max(kickOffAt, bar.startAt). A confirmed screening beginning after kick-off is confirmed_partial automatically, provided opening is before planned end and closing covers it. Do not accept a submitted coverage override as authority. Synthetic acceptance example:

```ts
expect(resolveScreening(verifiedFixture, noonHours, now)
  .canBookForScreening).toBe(true)
expect(resolveScreening(verifiedFixture, noonHours, now)
  .status).toBe('confirmed_partial')
```

Define verifiedFixture with kickOffAt 2026-11-07T11:40:00Z, plannedEndAt 2026-11-07T13:40:00Z, confirmed ITV1 and screening, known teams, screenLabel Main, commentary on; noonHours opens 12:00 and closes 22:00. These are synthetic tests, not confirmed broadcasting or opening changes.

- [x] Reject contradictory states on server validation and require explicit confirmation audit timestamps. Preserve checked-at timestamps only for facts actually checked.
- [ ] Validate migration on isolated database with representative football rows, account scoping and grants. Test concurrent duplicate imports and stale revision updates.
- [x] Prepare prod-migrate approval packet with exact target, SQL, checksum, locks, validation and rollback. Production application waits for that approval. Retain additive columns on rollback; do not drop data.

**Acceptance:** Old football round/feed fixtures still validate. Unknown rugby and partial/late screenings cannot become full confirmed screenings. Migration remains unapplied until explicitly authorised.

## Task 3: Guard generated and queued social content (increment C)

**Files:** Create C/src/lib/tournament/content-freshness.ts and tests. Modify C/src/lib/tournament/generate.ts, template.ts, C/src/lib/publishing/preflight.ts, handler.ts and tests; C/supabase/functions/publish-queue/worker.ts; C/tests/publish-queue.test.ts. Read overlay.ts and adjust sport-specific labels only where needed.

**Interfaces:** `checkTournamentContentFreshness(context, currentFacts, currentHours): { allowed: boolean; reason: string | null }`. Define context as `{ fixtureId: string; fixtureRevision: number; hoursFingerprint: string; templateFingerprint: string; bookingUrl: string }` stored in existing content prompt_context. Scope all record lookups by account.

- [x] Write tests showing that stale revision, changed hours, unknown broadcast, unconfirmed teams, cancelled screening or management failure produces zero Meta calls through each publisher.
- [x] Replace the fixed tournament destination with the fixture's approved tournament-page anchor, /live-sport/nations-championship#fixture-<id>. That card's primary action opens the fixture-aware booking journey. Keep booking_url as the validated fixture booking destination where the template explicitly offers a direct booking link. Use the canonical website origin, preserve existing campaign attribution, and reject javascript/off-site destinations.
- [x] Feed templates approved public screening facts, explicit partial coverage and actual opening/kitchen intervals. Supply foodPromotion to Facebook/Instagram feed and story templates. Eligible games must include a food invitation and exact service-time qualification in previewed copy, with the existing approved menu/booking destination. Pre-match-only service must be labelled pre-match; closed/unknown service must produce no food claim. Validate generated outputs for this requirement, not just prompt inputs. Draft copy must not upgrade an unknown fact to a claim. Include template version/fingerprint in generation context.
- [x] Check eligibility at generation, scheduling/immediate publish and immediately before both QStash and legacy edge publishers contact Meta. Do not import Node-only code into the Deno worker; share runtime-neutral logic where supported or enforce identical test vectors in both wrappers.
- [x] Store stale items in the existing review/blocked workflow with a clear reason and no automatic publish retry. Preserve published items and expose review warnings. Ensure legacy football content follows its current path.
- [x] Make every relevant fixture mutation invalidate unpublished associated content. Use optimistic contentRevision checks to detect concurrent edits; queued jobs still independently recheck the database and fresh hours.
- [x] Test edit-after-dispatch: enqueue, alter hours/fixture, invoke worker, assert review block and zero provider calls. Test a valid unchanged approved item publishes exactly once under existing idempotency rules.

```ts
expect(result.allowed).toBe(false)
expect(metaPublish).not.toHaveBeenCalled()
expect(savedItem.status).not.toBe('scheduled')
```

`metaPublish` and `savedItem` are test spies/results from each existing publisher harness. Do not invent a new provider adapter to satisfy the assertion.

- [x] Document the irreducible race: a provider request already in flight may finish after an edit. Alert staff and do not claim the post was recalled. Do not delete a published post automatically.
- [ ] Run C/npm run ci:verify and the legacy worker test harness. Deploy guarded publishers before enabling rugby generation, subject to release approval.

**Acceptance:** Both real dispatch code paths are exercised with mocked providers. A state or hours change makes previously approved content non-publishable without fresh review.

## Task 4: Cheers editor, import and versioned feed (increment D)

**Files:** Modify C/src/app/actions/tournament.ts; C/src/app/(app)/tournaments/[id]/page.tsx; C/src/features/tournament/components/{CreateTournamentModal,TournamentSettingsModal,TournamentHeader,FixtureModal,FixtureTable,FixtureRow,ImportFixturesModal,StatusBadge}.tsx; C/src/app/api/feed/[tournamentId]/route.ts. Tests: existing validation/generation/queries suites, C/tests/feed-route.test.ts, C/tests/app/tournament-preview.test.ts; create C/tests/app/tournament-screening-actions.test.ts.

**Interfaces:** Exposes schema 2 contract; mutations consume validated ScreeningFacts fields plus expected contentRevision. Shared action helper performs write, revision increment and stale-content invalidation for create/edit/import/toggle/save-and-generate paths.

- [x] Write feed tests proving schema=2&showing=all includes unconfirmed/not-showing fixtures, while old requests retain their existing keys and semantics.
- [x] Add sport and round controls, explicit finalists confirmation, channel verification, screen/audio allocation, planned end controls and automatically derived coverage. Show current management operating times as read-only; do not add an opening-hours edit action to the tournament workflow.
- [x] Require actual channel and a usable screening interval within existing hours before confirming. Automatically classify games starting before opening as partial; this must not block booking an otherwise confirmed screening. Display actionable validation failures next to the fields. Warn on simultaneous screen collisions and reject multiple overlapping main-commentary allocations.
- [x] Use a transaction or verified existing atomic mutation mechanism for revision/invalidation. A content invalidation failure must not leave a newly changed fixture silently paired with scheduled content. Add tests for failure between database update and queue cancellation; delivery guards remain the final protection.
- [x] Extend CSV validation for the spec inventory, row-specific errors and idempotent import keys. Preview inserts/updates before mutation; no generation or publish action attached to import.
- [x] Join strict management hours once for distinct dates when building schema 2; derive screening projections. On hours failure, retain fixtures but mark their dependent states unknown and disable promotion/booking.
- [x] Preserve canonical stable IDs when finals teams change. Render country names and placement labels separately. Distinguish cancelled from not showing and finished.
- [x] Set schema 2 no-store headers, account scoping and API-key validation. Return only curated public fields. Inactive tournaments must not become published pages by guessable identifier.
- [ ] Browser-test create, CSV preview, edit, confirmation rejection and successful synthetic confirmation, with providers disabled. Run C/npm run ci:verify and commit.

**Acceptance:** Staff can manage every required screening fact without a deployment; changing a fact invalidates pending content; no import sends anything; old World Cup consumer remains compatible.

## Task 5: Website feed reader and screening refresh (increment E1)

**Files:** Create W/lib/nations-championship/{types,feed,config}.ts; W/app/api/nations-championship/route.ts; W/tests/lib/nations-championship-feed.test.ts; W/tests/api/nations-championship.test.ts. Read W/lib/cheersai.ts and lib/world-cup-2026.ts. Leave world-cup-2026.ts unchanged.

**Interfaces:** `getNationsChampionshipFeed(): Promise<ScreeningFeed>` uses schema 2 and the separate tournament-scoped CHEERSAI_NATIONS_FEED_API_KEY. Verified code inspection found keys are scoped per tournament, so the football key cannot be reused. `config.ts` selects the exact nations-championship-2026 slug; until configured the page shows unavailable, with no invented production ID.

- [x] Write malformed feed, missing key, non-200, inactive tournament and unknown-hours tests before adding the adapter.
- [x] Fetch server-side with cache:no-store. Validate the response with Zod, including timezone-qualified dates and IDs; never cast unchecked JSON into the contract.
- [x] Add a public website route returning only the validated public projection, with no credentials. Use no-store and bounded upstream timeouts. Feed outages yield a clear 503 without invented fixtures/statuses.
- [x] Server page calls the reader directly, not its own HTTP proxy. Mounted client fixtures refresh at most once per minute and on visibility return. On refresh failure keep factual labels marked stale and disable confirmed-screening CTAs; never imply freshness.
- [x] Test that keys do not appear in rendered HTML, client bundles or the proxy response. Run focused Jest tests in both timezones.

**Acceptance:** Page and refresh route use identical projections; operational changes appear on a fresh request immediately, and an open visible tab refreshes within a minute subject to network availability.

## Task 6: Fixture-aware booking journey (increment E2)

**Files:** Create W/lib/nations-championship/booking-context.ts and W/tests/unit/nations-booking-context.test.ts. Modify W/app/book-table/page.tsx, W/components/features/TableBooking/ManagementTableBookingForm.tsx, W/app/api/table-bookings/route.ts and its tests; W/lib/table-booking-idempotency.ts only if the current payload identity omits the resulting notes/context. Extend existing ManagementTableBookingForm.twoScreen/fourStep tests. Read M/src/app/api/table-bookings/route.ts; no management booking schema change is planned.

**Interfaces:** `resolveFixtureBookingContext(fixtureId: string): Promise<{ fixtureId: string; label: string; date: string; kickoff: string } | null>` resolves the trusted active feed. `composeFixtureNotes(context, customerNotes): string` yields a bounded combined note. Booking URLs contain a stable fixture_id, date and optional requested time, not trusted team labels.

- [x] Add tests for forged fixture labels, removed/cancelled fixture, invalid ID, changed date, edited customer notes, maximum note length and preserved context on retry/deposit completion.
- [x] Resolve fixture_id server-side on /book-table and show a visible match summary above the form. Unknown/cancelled context produces an explicit message and normal booking choice, never a silent confirmed screening.
- [x] Keep the existing availability request authoritative. Do not force purpose=drinks or reintroduce retired booking types. Select only returned available slots; never subtract 30 minutes and assume that time is bookable.
- [x] Show the shared foodPromotion message and menu link alongside the fixture summary in both active form layouts. Refresh/revalidate eligibility with the fixture context; do not force a food booking purpose or override the returned availability.
- [x] Preserve context in both active form layouts. If date changes away from the fixture date, visibly remove the association or ask the user to choose the match date; do not silently attach the wrong match.
- [x] Re-resolve fixture context at POST, enforce screening eligibility and matching booking date, then compose trusted match label/ID plus user notes. Respect the management 500-character limit by setting the displayed remaining customer allowance, not silently truncating notes.

```ts
const fixed = `Nations Championship: ${context.label} [${context.fixtureId}]`
const combined = customerNotes.trim() ? `${fixed}\n${customerNotes.trim()}` : fixed
if (combined.length > 500) throw new Error('Booking notes are too long')
```

- [x] When a match becomes unavailable between page load and submission, return a clear error and normal booking fallback without creating a booking. On feed failure, do not claim the screening reservation succeeded.
- [ ] Verify stored notes through the management request mock and an isolated database/test environment. Confirm first-party fixture_id analytics persists through normal and PayPal-deposit completion, without sending notes/PII to GA4.
- [x] Run booking unit/API tests, both timezone suites and existing deposit/consent/idempotency regressions. Commit this journey change separately from page presentation.

**Acceptance:** A visitor clicks a real fixture card, selects a genuinely available arrival slot, submits, and staff see the exact fixture context in the resulting test booking. A green page build alone does not pass this task.

## Task 7: Server-rendered page, filters and calendar (increment F1)

**Files:** Create W/app/live-sport/nations-championship/page.tsx; W/content/nations-championship.ts; W/components/features/nations-championship/{NationsChampionshipFixtures,FixtureCard,NextScreening}.tsx; W/lib/nations-championship/calendar.ts; W/app/api/nations-championship/calendar/[fixtureId]/route.ts. Create W/tests/unit/NationsChampionshipFixtures.test.tsx, W/tests/lib/nations-championship-calendar.test.ts and W/tests/api/nations-championship-calendar.test.ts.

**Interfaces:** Page passes validated ScreeningFeed to fixtures. Client filters operate on already-rendered content. `buildScreeningCalendar(fixture, projection): string` emits a single VCALENDAR with stable UID based on fixture ID.

- [x] Draft final copy through editorial-team against the spec/SSOT. Use frontend-design for a restrained venue-led mobile layout. Place detailed verification/source information below the primary match facts.
- [x] Render teams, kick-off, actual opening, coverage warning, screen/audio, kitchen intervals and honest booking state in initial HTML. Do not require JavaScript to obtain fixtures.
- [x] Add All, confirmed, team (all 12 teams) and round/finals filters with aria-pressed, focus styles and a live count. All fixtures visible by default. Filters do not generate indexable parameter URLs.
- [x] Implement stable #fixture-<id> anchors and ensure direct anchor navigation reveals the fixture if a filter would hide it. Use descriptive booking labels.
- [x] Choose the next eligible future screening by screeningStartAt; show live matches separately only with explicit in_progress state. No next match means a useful empty state, not a CTA to a finished fixture.
- [x] On every eligible fixture card, next-screening feature, England/finals highlight and fixture-specific hero/sticky CTA, prominently promote food with the exact kitchen service times, a menu link and a booking invitation. Use the shared foodPromotion rather than recomputing eligibility in components. Keep these facts in initial HTML. No food badge for closed/unknown kitchens or an unconfirmed screening.
- [x] Give every confirmed game a prominent 'Book a table for [fixture]' action, including partial screenings from current opening. The hero/sticky action should lead visitors to eligible games and booking. Food/menu details support this primary action.
- [x] Show partial-screening warning beside opening time and booking button. Main cards show essential facts first; expandable details remain available in HTML. Never use colour alone.
- [x] Implement calendar download only for confirmed screenings; DTSTART is pub screening start, description includes actual kick-off and missed start where relevant, location is The Anchor rather than the stadium. Use stable UID, escaped/folded text, CRLF and UTC dates. Label DTEND as planned in the description. Include the shared foodPromotion message and approved menu URL in the calendar description when eligible. Re-download reflects current revision; downloaded files are not automatically updated.
- [x] Use existing licensed responsive venue photo, explicit dimensions, meaningful alt text and no invented match scene. No new map embed/autoplay/font dependency.
- [x] Handle unavailable feed with an honest explanation, phone/menu links and generic booking route. Never substitute a hardcoded confirmed schedule.

```ts
expect(screen.getByText(/start missed/i)).toBeVisible()
expect(screen.getByRole('link', { name: /book for italy v south africa/i }))
  .toHaveAttribute('href', expect.stringContaining('fixture_id='))
```

Use a fully confirmed synthetic partial fixture for this assertion. Separately render the unknown-hours case and assert the fixture-specific booking link is absent.

- [ ] Test SSR response body with JavaScript disabled, keyboard filters, 320px/375px/768px/desktop layouts, long team names, finals placeholders, empty data and API outage. Verify no horizontal scroll or sticky CTA overlap with cookie controls.

**Acceptance:** Full fixture content is readable without JavaScript; every early fixture says when the pub opens; a partial screening cannot be mistaken for full coverage.

## Task 8: SEO, internal links and measured conversions (increment F2)

**Files:** Modify W/app/sitemap.ts, W/app/sitemap-page/page.tsx, W/app/live-sport/page.tsx, W/app/live-sport/six-nations/page.tsx, W/app/whats-on/page.tsx, W/app/staines-pub/page.tsx and W/app/page.tsx only at their active content entry points. Modify W/lib/gtm-events.ts and existing booking completion tracking surfaces identified in Task 6. Create W/tests/unit/nations-seo.test.ts and W/tests/unit/nations-tracking.test.ts. Read active homepage rails before changing them; do not edit unused content.

**Interfaces:** Use existing GTM helpers and consent gating. Add typed event payload `{ fixture_id, fixture_name, kickoff, screening_status, cta_location }` for relevant interactions, with no personal data. Completion uses the existing confirmed-booking event with fixture_id; click is not completion.

- [x] Apply the spec keyword map to metadata/headings without repeating every location. Self canonical follows existing relative canonical conventions. Verify the rendered title has one brand suffix.
- [x] Add CollectionPage, BreadcrumbList and ItemList with the site's actual business entity ID. Do not emit one giant Event or fixture Event eligibility claims on the hub. Schema must match visible statuses.
- [x] Any fixture-specific homepage, What’s On or other internal promotional card must carry the shared food message and times when eligible. Generic tournament links may invite visitors to check food service per fixture, but must not imply all games overlap service.
- [x] Add sitemap entries with content-derived lastModified, not render time. Feed retrieval time is not factual verification time. Link from the six named site locations plus HTML sitemap.
- [x] Track select_fixture, filter_fixtures, book_rugby_click, add_to_calendar and existing phone/directions/menu events. Avoid a second duplicate page_view; register only needed non-PII custom dimensions.
- [x] Preserve fixture context through existing booking confirmation/deposit paths so completed bookings can be compared by fixture. GA4 receives no booking notes, email or phone; do not alter existing consent semantics.
- [x] Test duplicate prevention on rerender/refresh, cookie refusal and deposit retries. Do not put internal UTMs on website navigation.
- [ ] Validate rendered JSON-LD, canonical, robots, sitemap and crawlable anchors. Run Rich Results Test for applicable markup, without claiming visibility is guaranteed.
- [ ] In preview, inspect network/event payloads through the exact booking journey using isolated mocks. After authorised launch verify GA4 DebugView with consent and a designated test booking only if separately approved.

**Acceptance:** Clean canonical, indexable hub, coherent internal links and a measurable distinction between booking clicks and completed bookings. No promised query-level conversion attribution.

## Task 9: Release, operating checklist and handover (increment G)

**Files:** Create W/tasks/nations-championship-release-evidence.md and W/tasks/nations-championship-operations.md during implementation. Record decisions already made and evidence only; put unresolved owner questions in chat. Update W/docs/SSOT.md only after the owner confirms new venue/event facts. Reference rather than duplicate configuration in Cheers and management.

**Interfaces:** Consumes all prior passing tasks and approval packets. Produces a verified deployment ID for each changed service, migration mapping, fixture inventory, and operating checklist.

- [x] Run exact repository quality gates below; retain logs. Stop on relevant failures. Unrelated failures must be identified and resolved or explicitly accepted, not hidden by narrowed commands.
- [ ] Complete end-to-end test matrix below through actual editor, feed, page and booking paths in isolated test environments. Record observed outputs and browser screenshots.
- [x] Prepare one concrete release packet covering code deployments, exact fixture import, and the exclusions for unconfirmed screenings and social generation/scheduling. Explicitly exclude opening-hours or kitchen-hours changes. Distinguish which actions are approved. Include the separate prod-migrate exact-SQL packet; approval to implement is not approval to apply a migration.
- [ ] Apply the approved additive migration through the verified Supabase migration tool, re-query objects and history, and record checksum/version mapping. No production CLI db push.
- [ ] Deploy A, guarded publishers C, then editor/feed D, then website E/F in dependency order. Do not let an old publisher process rugby jobs after rollback or during mixed-version rollout.
- [ ] Create/import the verified 24 fixtures only after import approval. Keep every unsupported screening unconfirmed. Set the website tournament selection to the real returned ID; verify no invented IDs remain.
- [ ] Re-read the existing published date-specific hours from the strict API and website before screening confirmation. Do not write opening, closing or kitchen changes. Verify games starting before opening are correctly shown and bookable from opening.
- [ ] Review each approved screening and shared social preview as one list: fixtures, channels, opening/closing, commentary, kitchen and links. Do not generate/schedule live content until explicitly authorised.
- [ ] Verify live page HTML, feed/strict-hours path, booking availability GET, canonical, links and logs. Run authorised mutations only with dedicated test records and confirmed cleanup/provider suppression. Record exact observed output and deployment IDs; do not call the whole feature working if booking completion was not exercised.
- [ ] Confirm cache/refresh behaviour with an approved change or isolated environment. Re-run cancelled/stale-post zero-send tests. Review both publishing queues for blocked rugby items and unexpected jobs.
- [ ] After successful release, merge/push/tidy only within the user's authorised release scope. Never delete unrelated branches or production data.

### Quality gate commands

Run from the relevant repo after nvm use; do not interpolate secrets in shell commands.

```bash
# Management
npm run lint
npx tsc --noEmit
npm test
npm run build

# Cheers
npm run ci:verify

# Website
npm run lint
npx tsc --noEmit
npm test -- --runInBand
npm run test:utc -- --runInBand
npm run build
```

For Cheers and management, inspect whether test:utc exists and actually controls timezone; do not assume an environment prefix overrides a config-pinned TZ. Add/adjust the focused timezone runner if necessary and prove the resolver vectors run under UTC and Europe/London. Migration checks use isolated database reset/lint and RLS tests, never a production-linked reset. Run the management anon-surface assertion if management database objects are added; this plan expects no management migration. Run equivalent Cheers exposure tests after its additive migration.

### Required end-to-end matrix

| Scenario | Exact expected result |
| --- | --- |
| 11:40 kick-off, noon opening, channel/screening not confirmed | Actual opening shown; no early-opening claim or confirmed screening promise |
| Same fixture, channel/screening confirmed | Automatically show from noon with start-missed warning and prominent fixture booking; no separate opening approval |
| Tournament setup and launch | Zero writes to opening, closing or kitchen hours; existing hours govern every screening |
| Late match planned past closing | No extension of hours and no full-screening promise; remains unconfirmed/not showing |
| Saturday evening kitchen closed | No food-during-match promise; drinks screening can remain valid |
| Split kitchen sitting | Exact service windows and gap preserved; food promotion qualifies both sittings |
| Game overlaps confirmed food service | Food invitation, exact times and menu link visible on all fixture surfaces; feed/story previews promote food too |
| Kitchen closes or opens mid-game | Promotional wording states actual closing/opening time without promising full-match food |
| Pre-match-only service / touching endpoints | Explicit pre-match invitation where appropriate; no during-game food claim |
| Food hours change after social scheduling | Revised website projection; both publishers block stale food promises pending review |
| Special-hours dependency failure | Unknown status and blocked promotion, never regular-hours fallback |
| 13 November event conflict | No unsupported main commentary confirmation |
| Simultaneous 21 November fixtures | Independent screen/channel assignments; no multiple main-commentary overlaps |
| Unknown finalists become known | Same IDs/anchors; revised content needs review |
| Queued post then fixture/hours change | Both publishers make zero provider calls and expose review reason |
| Correct fixture booking, ordinary party | Confirmed test record contains trusted fixture label/ID and user notes |
| Deposit-required fixture booking | Existing deposit path completes in sandbox and retains fixture context |
| Date changed / forged URL / long notes | Visible validation; no wrong fixture association or silent truncation |
| Cancelled fixture after page load | Submit rejects stale screening context without a false booking success |
| JS disabled / mobile keyboard | Fixtures readable, links valid, filters progressively enhance |
| Tracking without consent / retry | No unauthorised analytics and no duplicate completion |
| Feed error | Clear unavailable state, no invented schedule or confirmations |
| Existing World Cup / general booking | Existing contract and user journey unchanged |

### Rollback

Before launch, keep the tournament inactive and new route unlinked until its readiness gate passes. If live content is inaccurate, first set the affected screening unconfirmed/not_showing through an authorised action and verify the feed and delivery guard. If source data is unavailable, dependent confirmation fails closed. For a wider rollback, stop new rugby scheduling and revoke eligibility before reverting website/editor code. Keep guarded publishing workers deployed while any rugby jobs exist. Preserve published posts and flag them for review; do not assume an in-flight provider send can be recalled. Retain additive database columns and records; use forward fixes rather than destructive rollback. There are no tournament opening-hours or kitchen-hours changes to roll back; do not modify those records during release or rollback.

### Operating handover

Before November: verify official fixtures/channel allocations weekly and record actual checks. During November: review twice weekly and on screening mornings, checking management hours, events, screens, audio and pending social content. These are manual operating instructions, not an automation created by this plan. A fetch timestamp is never a substitute for a real verification timestamp.

After the final: manually confirm completion/results, remove future booking CTAs, retain the useful hub and archive verified 2026 facts. No automatic deletion/redirect. Keep future tournament creation separate from the 2026 record.

### Plan self-review

- [x] Source brief reconciled with accepted one-page scope and deferred child pages.
- [x] All 24 candidate fixtures listed in the specification with verification required.
- [x] Unchanged opening hours, automatic viewing from opening, closing coverage, kitchen gaps and event clashes covered.
- [x] Completed table bookings per game are the primary goal; every confirmed partial screening keeps a prominent booking action.
- [x] Food promotion and exact service times required across every eligible website fixture surface, booking summary, calendar and Cheers feed/story preview.
- [x] Cheers editing, import, feed, both social publishers and stale-content handling covered.
- [x] Actual booking entry point, notes limit, deposit completion and analytics covered.
- [x] SSR, filters, calendar, SEO, links, accessibility and error states covered.
- [x] Live schema readiness, migration approval, deployment order, rollback and operating ownership covered.
- [x] Existing/unrelated files distinguished; no application implementation claimed.
