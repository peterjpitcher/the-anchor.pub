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
