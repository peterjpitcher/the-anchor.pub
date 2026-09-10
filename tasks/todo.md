# Workspace standards, security and context work, 4 to 5 September 2026

Owner decisions on the record: unlink the never-used marketing skills; standardise CLAUDE.md and AGENTS.md across every project; fix everything found, excluding the Barons projects.

## Done, 4 September
- [x] Slimmed the CLAUDE.md chain, path-scoped the Supabase rule, moved on-demand rules to .claude/docs
- [x] Codex parity: AGENTS.md symlinks, global contract symlink, project_doc_fallback_filenames
- [x] Audited 209 conversations, 1,379 commits across 18 repos, and every skill
- [x] Parked 26 unused skills, reinstalled brainstorming, writing-plans and systematic-debugging
- [x] Added the no-em-dash Bash hook, closing the shell-write gap
- [x] Hardened six public write paths on this site to fail closed
- [x] Pinned the business timezone with a UTC counter-run in seven repos
- [x] Anon-access allowlists with drift tests in eight repos

## Done, 5 September
- [x] Applied to production: profiles read closed (management app); rate-limit function and analytics policies closed, secret-table grants removed (CheersAI); orphan booking function dropped (CashBingo); trigger functions closed (Planner 2.0, OrangeJelly); table grants narrowed (Dukes Head)
- [x] Root cause fixed: default privileges no longer grant anon on new objects, in six databases
- [x] Corrected my own regression: revoking EXECUTE on two RLS predicate helpers made anon queries error instead of returning no rows. Restored and verified by querying as the anon role
- [x] Repo and database migration histories reconciled, so supabase db push will not re-apply
- [x] Em dashes removed from the AI prompts and stripped from generated social copy (CheersAI)
- [x] QuizNight stopped gitignoring its own instruction files
- [x] All 18 repos now have a tracked CLAUDE.md and an AGENTS.md symlink

## Deliberately not done
- Barons projects untouched, as instructed. The BaronsHub migration drafted on 4 September is still unapplied: three SECURITY DEFINER functions there are callable by anyone with the publishable key.
- QuizNight session_state is readable by any anon key by design, because the TV display carries the token in the URL where a policy cannot see it. It holds no question or answer text today.
- Supabase's own platform default still grants anon on objects created by supabase_admin. It cannot be changed without membership of that role.
- OJ-Planner looks superseded by OJ-PlanneriPhoneApp. Its instruction file says to check before investing.

# Terrestrial rugby bookings

- [x] Record the owner decision and preserve live hours rules.
- [x] Accept approved booking windows in the feed consumer and booking checks.
- [x] Explain start and closing limits accurately on cards, booking forms and calendars.
- [x] Verify focused browser flow and full London/UTC gates.

Website consumer change is independently deployable before the Cheers producer. No database change.

Validation: lint, types, build, 183 suites and 1979 passing tests in both London and UTC after merging the API-outage changes from main. Isolated owner-approved browser booking, cancellation and response recovery passed with no external writes, console errors or accessibility violations.

## API connections, 5 September 2026

- [x] Complete parking and runtime API fallback remediation. Evidence and checks: tasks/fix-function/2026-09-05-api-connections/. Verified branch changes; root coordinates merge and deployment.

## 5 September 2026: Anchor booking growth

- [x] Add short private-hire enquiry, page-specific booking actions, Sunday copy, Christmas course selection and durable event requests.
- [x] Prevent active enquiry promotion interruptions and redact analytics URL context.
- [x] Reproduce and fix quick-book failure loading; verify the full-form purpose handoff.
- [x] Finish browser evidence and final gates after the latest source changes.
- [x] Release after exact owner approval and management migration verification. Website commit `443959e552029a30ba391f46ccf28eb58491a86f` is live as `dpl_G6x2MEyHZ7rx88zSp8bDyqJ8CR7y`; the production alias, short enquiry, event request controls and Christmas course journey were checked. No real customer submission was made.

Full evidence and exact production approval package are in the paired management repository at `tasks/anchor-booking-growth/`.

## 5 September 2026: Conditional late rugby viewing

Complexity 4, website consumer release coordinated with a separate Cheers producer release. The optional feed field permits either release order without changing admission hours.

- [x] Record the owner policy in SSOT before customer copy.
- [x] Consume the optional policy in cards, booking summaries and calendars.
- [x] Update editorial and verify unchanged opening, kitchen and arrival limits.
- [x] Run focused browser checks, London/UTC tests, lint, types and build.
- [ ] Release and verify the exact production deployment.

Validation: 190 suites, 2056 passed and 1 skipped in both zones; 53 final focused checks in each zone after copy review. Final lint, types and production build passed. Isolated browser verified conditional card, booking summary, Find a table and calendar with zero booking writes and no browser errors. Deployment evidence is maintained outside the repository.


# Event booking quantities, 6 September 2026

- [x] Trace the website form and both API validation paths.
- [x] Remove per-guest name collection for all event ticket types.
- [x] Verify quantity-only bookings, failures, lint, types and build.

Scope: website only, lead booker details retained. Management API already accepts omitted names. No migration. Local only until deployment approval.

Verification: Node 20 lint, standalone typecheck, all 191 test suites (2,083 passed, one skipped) and production build passed. Combined form/API suite has 26 passing tests in UTC. Browser verification passed with the actual component in an isolated Next app: four prepaid seats and mixed quantities of two Adult plus one Child submitted only lead details and quantities. Intercepted 503 responses showed Booking not completed and the phone fallback. Screenshots: output/playwright/event-booking-quantity/. No live bookings, messages or payments. The production event page wrapper and real payment flow were not exercised. Local only, deployment awaits approval.

Files changed: components/features/EventBooking/ManagementEventBookingForm.tsx, app/api/event-bookings/route.ts, their two existing test files and tasks/todo.md. Deliberately unchanged: management application, database, staff booking forms, historical attendee-name records, shared legacy name helpers, payment processing and event page wrapper. Supplied legacy names remain supported.

Owner approved website production deployment on 6 September 2026. All five changed files belong to this approved change.

Owner added removal of the food discussion question during the approved deployment. Removed that question, food payload fields and related confirmation copy. Early-arrival request retained. Form and its tests are the only additional application files changed.

Food-question follow-up verified: Node 20 full lint, typecheck, 191 suites (2,083 passed, one skipped) and production build passed. No migration or management changes.


# Remove event early-arrival option, 6 September 2026

- [x] Remove the whole early-arrival box, outgoing flag and confirmation wording.
- [ ] Run verification, publish the follow-up and check the live form.

Owner requested removal as a follow-up to the approved event form simplification. Scope: website form and its tests; API compatibility, historical requests, staff forms and database remain unchanged. No migration.

Verification: Node 20 full lint, standalone typecheck, 191 test suites (2,083 passed, one skipped), production build and diff checks passed. Browser smoke follows deployment.


# Event page and booking checks, 6 September 2026

Plan and results: tasks/fix-function/2026-09-06-event-booking/. Website page and form changes plus reviewed capacity retry handling. Management standing-policy and SMS fixes are prepared separately; garden blocking remains a read-only finding. Website lint, types, 191 suites (2,089 passed, one skipped) in London and UTC, production build and isolated browser flows passed. Local only; deployment and migration approval pending.

# Anchor wrapping Button, accessibility fix rollout, 6 September 2026

An `<a>` may not contain interactive content. `<Link><Button>...</Button></Link>` renders
`<a><button>...</button></a>`: invalid HTML, two tab stops for one action, and an odd
screen reader announcement. Fixed with the design system's `asChild`, already the house
pattern in `app/join-our-team/page.tsx` and 20-odd other places.

146 instances across 55 .tsx files, cleared to zero. Five separately deployable commits.

- [x] Wave 0: cherry-picked `1ecf129b` (DirectionsButton fix and its guard test) from
      `claude/upbeat-hugle-ee1882`, so this branch is correct on its own. It is the same
      change on both branches, so a later merge of that branch is a no-op.
- [x] Wave 1: `components/PhoneButton.tsx` plus `tests/unit/PhoneButton.test.tsx`
- [x] Wave 2: the Colnbrook, Sunbury and Wraysbury CtaBand maps links routed through
      DirectionsButton, which also restores their missing `directions_click` event
- [x] Wave 3: 56 CTAs on the 18 area and near-Heathrow pages
- [x] Wave 4: 43 CTAs on the blog, what's on, live sport, drinks and menu pages
- [x] Wave 5: 49 CTAs on the home, private hire, seasonal, parking and brochure pages
      and the two lightboxes, plus `tests/unit/no-anchor-wrapped-buttons.test.ts`

## How it was done

137 sites were rewritten by a scripted tag swap (the nesting depth does not change, so
indentation is untouched), and 14 by hand: multi-line Button attribute lists, the blog
pagination `key`, the two brochure anchors that also wrap a visually hidden span, and the
two lightboxes that carried a redundant `asChild={false}`.

Three wrapper `className="block"` / `"inline-block"` values were dropped. `cn` uses
tailwind-merge and the child's classes win, so leaving them would have beaten the
button's own `inline-flex` and broken its centring.

## Verification

Gates green on every wave: `npx tsc --noEmit`, eslint zero warnings on app, components
and lib, all seven audit scripts, 194 Jest suites (2,104 passed, 1 skipped) in both
Europe/London and UTC, and `npm run build`.

Browser evidence on the dev server: 51 routes fetched and parsed, including every static
route this branch touched and four dynamic ones. Zero `a button`, `button a` or `a a`
anywhere; 348 anchors carry the button styling. React props confirm the `onClick`
handlers survived the `asChild` clone on both DirectionsButton and PhoneButton, so
analytics wiring is intact. `scripts/audit-a11y.js` reports zero axe violations.

## Deliberately not done

- `/parking/bookings/[id]` and `/heathrow-parking/confirmation/[bookingId]` were changed
  but not fetched in the browser: both need a real booking id. Build, types and the
  repo-wide guard test cover them.
- `scripts/audit-a11y.js` reports three keyboard failures on `/quiz-night/themed`: the
  NavBar dropdown triggers are anchors with `aria-expanded` that navigate on Enter
  instead of expanding. `components/ui/navigation/NavBar.tsx` is untouched by this
  branch, so it is a separate defect, not a regression here.
- `/parking/bookings/[id]` and `/heathrow-parking/confirmation/[bookingId]` browser
  checks, as above.

## Follow-up, worktree gate configuration

`npm run lint` and `npm test` could not run verbatim from a worktree under
`.claude/worktrees/`: eslint walked up and found the parent checkout's `.eslintrc.json`,
giving a plugin conflict and exit 1, and Jest's `testPathIgnorePatterns` matched the
worktree's own absolute path, so every test in it was ignored and Jest reported "No tests
found". The waves above were verified with equivalent commands.

- [x] `.eslintrc.json` sets `"root": true`. Nothing above the project supplies eslint
      config, so this loses nothing and stops the upward walk.
- [x] `jest.config.js` anchors the ignore pattern with `<rootDir>/`. Checked in both
      directions: the main checkout still ignores nested worktrees, and a worktree runs
      its own tests while still ignoring worktrees nested inside it.

Both gates then ran verbatim from this worktree: `npm run lint` exit 0 with zero
warnings, `npm test` and `npm run test:utc` 194 suites each, 2,104 passed, 1 skipped.

# Event pages implementation, 6 September 2026

Spec: `tasks/spec-2026-09-06-event-pages.md` (35 tickets, reconciled against the independent developer review).
Branch: `fix/event-pages-wave-1`.
Standing rules: capacities always from the management app; no em dashes in customer-facing text; no live booking, SMS, payment, migration or deployment; London and UTC test zones both green at every gate.

**Not mine to commit:** `tasks/fix-function/2026-09-06-event-booking/discovery.md` and `todo.md` are another session's release records. Exclude by path at every commit.

## Package 1: close out Wave 1

- [x] P1.1 Rename `REGULAR_NIGHTS` to `HUB_NIGHTS` in `app/whats-on/page.tsx`. The constant now holds a night that is explicitly not regular, which contradicts the SSOT. Resolves review finding R21.
- [x] P1.2 Add the Jest case EV-001 promised: all four game routes resolve their sticky CTA to `#book`.
- [ ] P1.3 Verify the four-card "Our nights" grid at a real desktop width. The earlier check returned `innerWidth: 0` from a hidden pane and proved nothing. **Still outstanding.**
- [x] P1.4 Gate: lint, typecheck, both zones, build. Commit Package 1. Committed as `fix(events): stop the Christmas overlay covering event booking CTAs`, 12 files, the other session's two files correctly excluded.

## Package 2: booking and feed reliability

- [ ] P2.1 EV-003. Add a result type to the events API helpers that preserves `ok` / `not-found` / `unavailable` / `partial`. Change `getUpcomingEvents`, `getRecentEvents` and `getUpcomingEventsByCategory` to stop collapsing failures into `[]`. Keep every existing caller working.
- [ ] P2.2 EV-003. `/whats-on` renders the four outcomes distinctly. Unavailable shows a "could not load the dates" state carrying 01753 682707. Genuine empty keeps its current wording.
- [ ] P2.3 EV-003. Test injects the failure **beneath the API helper**, not at the page import, and asserts the user sees the failure and the phone number. Second test asserts genuine-empty still reads as an empty diary.
- [ ] P2.4 EV-016. Implement the Turnstile recovery contract in spec §7.5: 10s timeout, accessible message plus phone number, input retained, retry that resets the widget, late token clears the message. Never bypass server validation.
- [ ] P2.5 EV-016. Tests: script blocked, delayed token, expiry then retry success, verification outage.
- [~] P2.6 EV-009. **Not done, deliberately.** `lib/static-events.ts` has no importer, but the owner declined an equivalent dead-code cleanup in September 2026 (`careers dead code kept`), and `SSOT.json` `meta.sources` still cites the file as a provenance record. Deleting it would leave a dangling reference in the SSOT. Flagged for the owner rather than removed. The availability route deletion already needed owner sign-off and is untouched.
- [ ] P2.7 Gate and commit Package 2.

## Package 3: factual presentation

- [ ] P3.1 EV-004. Route `organizer.url` through `isManagementUrl()` and substitute the public site. Test both with and without an organizer URL.
- [ ] P3.2 EV-005. Absolutise every URL in the Event JSON-LD. Do not add `doorTime`: that half of the ticket is withdrawn.
- [ ] P3.3 EV-007a. Category fallback image map with an unknown-category branch and a failed-load branch. Only quiz-night, cash-bingo and music-bingo have assets; karaoke, tasting and parties fall back to a truthful neutral image.
- [ ] P3.4 EV-031. Render `category.name`, not the raw slug, in the event information table. Drop the duplicated row.
- [ ] P3.5 EV-032. One tested adapter normalising em dashes out of named prose fields only: description, longDescription, about, highlights, faq text, image_alt_text, derived meta description. Never touch serialised JSON, URLs, slugs or identifiers.
- [ ] P3.6 EV-033. Retitle "This month's headline nights" to something the card list does not contradict.
- [ ] P3.7 EV-002. Set `/whats-on` route revalidate to 300 for consistency. Claim no freshness improvement.
- [ ] P3.8 EV-020. Emit `BreadcrumbList` JSON-LD on the four game pages using the existing component.
- [ ] P3.9 EV-024. Align `/whats-on` and `/live-sport` canonicals to `'./'`. Set `og:type` deliberately per route. Give `/karaoke` its own `og:image`. Serve the landscape variant to Twitter.
- [ ] P3.10 EV-035. Karaoke email helper wording on a free event; `og:description` relative date; Google Maps iframe `title`; H3-before-H2 outline on the event page; remove the unused karaoke poster preload.
- [ ] P3.11 Gate and commit Package 3.

## Package 4: bounded conversion additions, decision-free parts only

- [ ] P4.1 EV-011. Add `showAddToCalendar` to `EventPresentation` per spec §7.1, false for cancelled and ended. Never compute the state inline.
- [ ] P4.2 EV-011. Surface add-to-calendar on the event detail page, the confirmed booking state and the category date cards. Stable UID, public canonical URL, event start not arrival time, omit DTEND when unknown, escaped text.
- [ ] P4.3 EV-011. Tests in both zones: midnight-crossing event, clock-change event, unknown end time, re-download producing one entry.
- [ ] P4.4 EV-013. Extend the confirmed state with calendar and directions. Preserve Manage Booking and the PayPal path, asserted by test. No post-confirmation content on hold, pending, manual review or waitlist. Food cross-sell deferred: wording needs the owner.
- [ ] P4.5 EV-014. Share control at all breakpoints, still gated by `showShareButton`. Add unsupported, permission-denied and clipboard fallback states.
- [ ] P4.6 EV-017. Show the existing rating near the CTA on the event template and the four category pages, labelled venue-wide with its source. No `aggregateRating` markup.
- [ ] P4.7 EV-018. Editorial floor: theme, day, date, start time, price and payment method as text where the record holds them. Omit what it does not hold. Never fill a gap from the poster.
- [ ] P4.8 Gate and commit Package 4.

## Blocked, not started

Owner decision required: EV-012 scarcity threshold and wording; EV-010 desktop fold visual; EV-015 mobile DOM order (reverses a prior decision); EV-021 template ordering (do now or defer); EV-023 `/live-sport` scope; EV-034 imagery.
Deferred: EV-022 subscription capture, until a service exists to fulfil the promise.
Owner or management repo: EV-006 performer records, EV-007b artwork, EV-026 GBP posts, EV-027 slug authoring, SMS nudge, `sundayLunch.message`.
Needs the analytics operator and the published GTM container: EV-029.
Needs owner sign-off on external callers: EV-009 availability route deletion.

## Definition of done for every package

Lint zero warnings, typecheck, Jest in Europe/London and UTC, production build, plus the acceptance rows in spec §19 that the package touches. Browser verification with a negative control where the change is a suppression or a conditional. No deployment.

## Progress log

**Package 1 committed.** Lint clean, typecheck clean, 191 suites and 2,097 tests in both zones, production build clean. Typecheck caught an incomplete rename that the whole Jest suite missed, which is a reminder that tests alone are not the gate here.

Both new tests were negative-tested: the fix was reverted, the test was confirmed to fail, then restored. A test that passes without the fix present would prove nothing.

**Wave 1 launched**, five agents on strictly disjoint library files so none can collide:
- A1 `lib/api/events.ts`, read-failure contract. Reuses the existing `lib/api/error-kind.ts` rather than inventing a second taxonomy.
- A2 `lib/structured-data/event-schema.ts` and `lib/event-image.ts`, organiser URL, absolute URLs, category image fallback.
- A3 new `lib/text/` adapter, bounded em dash normalisation on named prose fields only.
- A4 `lib/event-presentation.ts`, `lib/event-calendar.ts`, new AddToCalendar component behind a lifecycle flag.
- A5 `ManagementEventBookingForm.tsx`, Turnstile recovery and the free-event email helper.

Wave 2 will mount these on the pages, one agent per page file, because `app/events/[id]/page.tsx`, `app/whats-on/page.tsx` and the booking form are each touched by more than one package and cannot be worked in parallel.

### Wave 1 gate, running record

- **A3 prose adapter: accepted.** `lib/text/normalise-api-prose.ts`, 28 tests, negative test failed 14 of 28 when stubbed. Correctly declined to touch en dashes, which carry ranges elsewhere in the codebase. Added `shortDescription` beyond the brief because the JSON-LD `disambiguatingDescription` derives from it.
- **A1 read-failure contract: accepted.** `EventsReadResult` with `ok` / `partial` / `unavailable` plus a `failure` reason. Existing helpers kept as backwards-compatible wrappers, all 10 callers checked. Negative test failed 19 of 32 when reverted. Two things beyond the brief: it found `invalid-payload`, a 200 whose body is not an events list, which `error-kind` structurally cannot see because nothing throws; and it fixed a real date bug where `from_date` used `toISOString().split('T')[0]` and so asked from yesterday between midnight and 1am BST.
- **A2 schema and images: accepted.** Organiser guarded, every schema URL absolutised, category image fallback map. Found an adjacent defect its own tests exposed: `sanitiseMainEntityOfPage` checked category paths but never the management host. Verified on the rendered page: no management URL anywhere in the graph, organiser is the public site, image absolute and category-appropriate, `doorTime` still absent.
- **EV-006 website half, done by the orchestrator** once `event-schema.ts` was free. The schema asserted an invented Organization called "The Anchor Entertainment" whenever a record carried no performer. Now omitted. Deliberately no heuristic for a performer that is present but wrong: quiz nights take guest hosts and karaoke has no fixed host, so a guess would overwrite legitimate values. Four tests added, negative-tested.
- **Pre-existing em dash** removed from a comment in `lib/api/events.ts`.

Noted for EV-034, not a blocker: every category fallback photo is 640x480 or smaller. All clear Google's 50,000 pixel minimum for Event images, none reaches the recommended 1920px width. The neutral fallback is the only 1920x1080 asset.

Still outstanding at this gate: A4 presentation flags and calendar, A5 Turnstile recovery.

- **A4 presentation and calendar: accepted.** `showAddToCalendar` flag plus a self-gating `AddToCalendar` component. Found three real defects beyond the brief: `getEventDateRangeUtc` invented a two-hour end time when an event had neither `endDate` nor `duration`; an unparseable `endDate` threw a RangeError instead of being treated as unknown; `escapeIcsText` missed a lone carriage return. Distinguished postponed (no calendar, the listed date is the night not happening) from rescheduled (calendar, `startDate` already carries the new date). Orchestrator added the draft exclusion on its recommendation, with a test.
- **A5 Turnstile recovery: accepted.** 10 second timeout, accessible live region rendered empty from first paint, retained input, retry, late token clears the message, unsupported browser gets no retry. Both new `TurnstileField` props are optional and `showInlineError` defaults true, so all seven other forms are behaviourally identical. Free events no longer promise a payment follow-up. Negative tests failed 5, 1 and 2 across three separate reverts.

**Wave 1 gate: PASS.** Lint zero warnings, typecheck clean, 197 suites and 2,246 tests in both Europe/London and UTC, production build compiled.

The 500s two agents reported on `/api/calendar/event/[id]` were a stale `.next` cache, not their code: the untouched `/api/events/[id]` failed identically and `vendor-chunks/cookie.js` was genuinely absent. Cleared `.next`, restarted the dev server, and all three routes now return 200. Generated ICS verified live: stable domain-scoped UID, `DTSTART` 18:00Z for a 7pm BST event, `DTEND` 20:30Z matching the SSOT quiz finish, canonical `www.the-anchor.pub` URL, escaped comma, no management URL.

Two pre-existing em dashes removed from comments, in `lib/api/events.ts` and `lib/event-calendar.ts`.

## Wave 2 gate: PASS, and browser-verified

Four agents, one page file each. All four accepted.

- **B1 `/whats-on` and `/live-sport`.** Outage state, heading, revalidate, canonicals. Declined to branch the copy on event count, correctly, because a single read can only return ok or unavailable so the branch would have been unreachable. Passes the empty-state prop as null during an outage so the empty-diary claim cannot render at all. Negative test: 5 of 8 failed on the old code.
- **B2 event detail page.** Raw slug, prose normalisation, calendar, share at all breakpoints, editorial floor, four small fixes. Eleven separate mutations, every one failed as expected. Found three live SSOT contradictions in booking copy.
- **B3 four game night pages.** Breadcrumb markup, per-page link previews, calendar on date cards, venue-wide rating. Built shared components rather than editing four pages. Fixed a real SSOT violation: `/cash-bingo` published "18+ to play" without the half that welcomes supervised under-18s. Fourteen mutations, all failed as expected.
- **B4 confirmation state.** Calendar and directions on confirmed only. Widened props with `event_status`, which is load-bearing: without it the calendar gate cannot see a cancelled event. Declined to use the shared `DirectionsButton` because it nests a button inside a link, a real defect across 21 files, now spun off as its own task.

**Three live SSOT contradictions fixed by the orchestrator** in `lib/event-booking-copy.ts`, found by B2 and verified against §10: Music Bingo "starts at 8pm" (SSOT says 7pm and that anything saying 8pm is wrong), cash bingo and quiz "arrive from 6pm" (SSOT says 6:30pm for both and explicitly supersedes the 6pm line). These rendered on desktop event pages. Four guard tests added so copy stating a time is pinned to the SSOT.

**Flake investigation.** B3 reported `tests/unit/event-detail-page.test.tsx` failing about one run in five. Not reproduced in thirteen consecutive runs: five full London, three full UTC, five isolated. Most likely B3 was reading a tree three other agents were editing. Cannot prove a negative; recorded rather than dismissed.

**Seven pre-existing em dashes** removed from comments in `tests/seo-indexing.test.ts`, plus one each earlier in `lib/api/events.ts` and `lib/event-calendar.ts`.

### Browser verification, after clearing the wedged dev server

The shared dev server had seized under four agents; every route except `/` hung past five minutes. Cleared `.next`, killed strays, restarted. All four routes now return 200 in under two seconds, which confirms contention rather than a defect.

| Check | Result |
|---|---|
| Em dashes in served event HTML | 16 before, **0** after |
| Raw `Event type` slug | gone |
| Calendar controls on the event page | 2, visible at 375px |
| Share control at 375px | present and visible |
| Map iframe title | meaningful, event-specific |
| `og:type` on the event page | `article` |
| `og:description` | absolute date, no "next Friday" |
| H3 before first H2 | fixed |
| `/quiz-night` BreadcrumbList | present |
| `/quiz-night` aggregateRating | absent, correct |
| `/quiz-night` calendar links | 10, five dates times two destinations |
| `/quiz-night` og:image | quiz-specific, was generic |
| `/karaoke` EventSeries | absent, correct per SSOT |
| `/whats-on` month claim | gone, now "What's coming up" |
| `/whats-on` karaoke links | 4 |

One false positive worth recording: a cadence regex flagged `/karaoke`, but the matched copy reads "We run it occasionally rather than every week", which is the SSOT rule being satisfied. That is the same negate-check trap the repo already records for `getBannedClaims()`.

## Final round, 7 September 2026

Owner instruction: work through everything outstanding. Silence on the 18-item decision list was taken as agreement with the recommendations.

**Built and pushed**
- EV-010 desktop fold. Poster capped by viewport height above `lg`, measured from the real fixed chrome. Poster 890x501 to 548x308, H1 no longer sliced, Book button clears the fold by 26px. Mobile byte-for-byte unchanged at 343x193.
- EV-015 mobile order. A real DOM restructure into three grid children, not a CSS `order` swap, because CSS order does not change reading or keyboard order. Desktop rebuilt from explicit grid placement so the sticky sidebar keeps a containing block taller than itself.
- EV-012 scarcity. `getEventSeatAvailabilityLabel` was written, tested, exported and called from nowhere. Now called on the detail page. Both resolvers were run side by side over eight payload shapes; they never contradict, only differ in wording and in when they stay silent.
- EV-023 `/live-sport` hero CTA plus the scroll tracking it was missing.
- EV-009 partial. The availability route's local fallback removed. It invented a capacity of 100 and treated unknown remaining as 0, so an event nobody had booked reported "100 booked of 100, 100% full", and it ran on 404, 405 and 500, which is precisely during an outage. Route kept, since zero imports does not prove no external caller for an HTTP endpoint.
- `DIRECTIONS_URL` moved to `lib/constants.ts`. `FindUsSection.tsx` keeps its copy deliberately: it imports `DirectionsButton`, which a concurrent session is editing.
- Two SSOT alignments: "bottle of house wine" in all three places, and payment method recorded as coming from the event record's `payment_mode`.

**Resolved without the owner**
Two of the five claims flagged as unsourced were sourced after all. All fifteen upcoming records carry `payment_mode: cash_only` for quiz, cash bingo and music bingo, and `free` for karaoke, parties and tasting nights. The audit looked in the SSOT; the fact lives in the API.

**Checked, then deliberately not changed**
`getBannedClaims()` still lacks the negation check its sibling `getSafeAccessibilityNotes()` has, so in principle it deindexes an event whose copy honestly denies a facility. All 15 live events were scanned against it: none trips it. Latent trap, not active harm, so it stays flagged rather than becoming unplanned scope.

**Two negation traps caught in this round alone.** A cadence regex flagged `/karaoke` where the copy reads "we run it occasionally rather than every week", and a banned-term grep flagged `/live-sport` three times where all three were honest denials of Sky and TNT. Both were the same shape as the `getBannedClaims()` defect above.

**Coordination note.** Port 3000 is serving the `DirectionsButton` task's worktree, not this checkout, so agents verifying there would have seen the wrong tree. C2 caught it and ran its own server; C1 reported it too. Final verification was done on a separate port from this checkout. `SendMessage` is not available in this session, so mid-flight agents could not be warned.

**Still outstanding, and why**
- Needs a fact only the owner has: the quiz "Seasonal Prop" third prize, and whether the music bingo `EventSeries` monthly cadence is real (§10 says "dates vary").
- Needs an asset: a karaoke photograph. Nothing in `public/` shows a karaoke night.
- Needs another repository: performer records, event artwork, GBP posts, slug authoring, the SMS nudge, and the `sundayLunch.message` contradiction.
- Needs the analytics operator and the published GTM container: EV-029.
- Needs request logs: deleting the availability route itself.
- Deferred by recommendation: EV-021 template ordering, EV-022 subscription capture.
- Blocked on a performance baseline and new photography: EV-034.

# SSOT section 14 banned claims still live, 10 September 2026

Branch `fix/ssot-banned-claims`, from origin/main at ae37b618. Open PRs #152 (heated garden) and #153 (pizza prices) touch some of the same files; check merge-tree against both before opening the PR.

- [ ] Named: dog secure fencing, "year-round comfort" and summer cooling, "gluten-free" claims in blog posts (NGCI plus the section 16 caveat; honest denials, guests' diets, questions and the `/food-menu/gluten-free` URL stay)
- [ ] Sweep, facts: doggy dinners and dog meals, off-lead garden, baby changing, "accessible facilities", enclosed or safe garden, EV "coming soon" and the EV schema flag, lamb and chicken roasts, party nights, beef dripping, 19th-century origin, the wedding denial
- [ ] Sweep, Christmas: the retired "menu released closer to the time" line on `/christmas-parties` and in four posts, plus the SSOT.json key that still mandates it
- [ ] Found in passing: prosecco on all three Christmas tiers in two posts (section 7: 2 and 3 course only)
- [ ] Sweep, superlatives: "best", "premier" and "top-rated" self-claims (questions, listicle topics, customer quotes and keyword lists stay)
- [ ] Guards in `tests/ssot-drift-guard.test.ts`, negation-aware and one sentence at a time
- [ ] Lint, typecheck, `npm test`, `npm run test:utc`, build; check changed pages in the browser
- [ ] Push, open the PR, ask the owner before merging
