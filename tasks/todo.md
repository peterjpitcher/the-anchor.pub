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

# Event pages implementation, 6 September 2026

Spec: `tasks/spec-2026-09-06-event-pages.md` (35 tickets, reconciled against the independent developer review).
Branch: `fix/event-pages-wave-1`.
Standing rules: capacities always from the management app; no em dashes in customer-facing text; no live booking, SMS, payment, migration or deployment; London and UTC test zones both green at every gate.

**Not mine to commit:** `tasks/fix-function/2026-09-06-event-booking/discovery.md` and `todo.md` are another session's release records. Exclude by path at every commit.

## Package 1: close out Wave 1

- [ ] P1.1 Rename `REGULAR_NIGHTS` to `HUB_NIGHTS` in `app/whats-on/page.tsx`. The constant now holds a night that is explicitly not regular, which contradicts the SSOT. Resolves review finding R21.
- [ ] P1.2 Add the Jest case EV-001 promised: all four game routes resolve their sticky CTA to `#book`.
- [ ] P1.3 Verify the four-card "Our nights" grid at a real desktop width. The earlier check returned `innerWidth: 0` from a hidden pane and proved nothing.
- [ ] P1.4 Gate: lint, typecheck, both zones, build. Commit Package 1.

## Package 2: booking and feed reliability

- [ ] P2.1 EV-003. Add a result type to the events API helpers that preserves `ok` / `not-found` / `unavailable` / `partial`. Change `getUpcomingEvents`, `getRecentEvents` and `getUpcomingEventsByCategory` to stop collapsing failures into `[]`. Keep every existing caller working.
- [ ] P2.2 EV-003. `/whats-on` renders the four outcomes distinctly. Unavailable shows a "could not load the dates" state carrying 01753 682707. Genuine empty keeps its current wording.
- [ ] P2.3 EV-003. Test injects the failure **beneath the API helper**, not at the page import, and asserts the user sees the failure and the phone number. Second test asserts genuine-empty still reads as an empty diary.
- [ ] P2.4 EV-016. Implement the Turnstile recovery contract in spec §7.5: 10s timeout, accessible message plus phone number, input retained, retry that resets the widget, late token clears the message. Never bypass server validation.
- [ ] P2.5 EV-016. Tests: script blocked, delayed token, expiry then retry success, verification outage.
- [ ] P2.6 EV-009 (partial). Delete `lib/static-events.ts` after confirming no dynamic import. Leave the availability route alone: its deletion needs owner sign-off.
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
