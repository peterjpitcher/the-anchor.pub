# Nations Championship release evidence

Status: locally implemented and verified, awaiting release approval. Nothing pushed, merged or deployed. No production fixtures, bookings, messages or hours records changed.

## Scope and ownership

- Management owns effective venue and kitchen hours, booking availability, deposits and bookings.
- Cheers owns tournament fixtures, channel/screen decisions, promotion and delivery guards.
- The website owns the tournament page and carries a verified fixture into the existing table booking journey.
- Existing opening, closing and kitchen times stay unchanged. An approved early screening starts at the existing opening time with a missed-start warning.

## Isolated work

All repositories use branch `codex/nations-championship` in these worktrees:

- `/Users/peterpitcher/Cursor/.worktrees/nations-management`
- `/Users/peterpitcher/Cursor/.worktrees/nations-cheers`
- `/Users/peterpitcher/Cursor/.worktrees/nations-website`

Original checkouts and unrelated changes have been preserved.

## Evidence recorded

### Management

Commit `1ba4fdaa`: strict date-specific screening-hours endpoint. Exact handler returned the documented 200 envelope; a failed special-hours read returned 503 and no-store.

Node 20: lint and typecheck passed; 719 test files, 6,166 tests passed, two skipped; cold production build passed with an 8GB local heap. Focused resolver/handler tests: 20 passed in Europe/London and 20 in UTC. No management migration for this hours endpoint.

Commit `86f03a57` adds authenticated read-only booking replay and stable fixture request identity. The exact replay handler returns an existing outcome or a non-creating error; 33 focused tests passed. An independent reviewer ran the saved old handler with the new replay envelope and observed HTTP 400 with zero admin-client, idempotency-claim or customer-write calls. No management migration is needed.

Final logs: `/tmp/nations-management-tests-replay.log`, `/tmp/nations-management-build-replay.log`, `/tmp/nations-management-lint-replay.log`, `/tmp/nations-management-types-replay.log`. All passed with Node 20 and an 8GB heap. The default 4GB typecheck exhausted local memory; it passed unchanged with 8GB.

### Cheers

Commit `ac36208`: additive rugby model, strict hours client and screening policy. Commit `1478eb3` adds the editor, import, feed and both publishing guards, including independent review repairs.

The official import file `docs/imports/nations-championship-2026.csv` contains 24 November fixtures, 18 named matches and six finals placeholders. The actual parser and validation accepted the file. Stable import keys use the official match IDs. Source: https://nationschampionshiprugby.com/en/match-centre/fixtures, fetched on 5 September 2026. Kick-offs are stored in UTC and rendered in Europe/London. Planned end times are deliberately blank because no approved estimates were supplied.

The real fixture editor was exercised in Chromium with isolated server-action doubles: fields, London timestamps, read-only hours/food preview and rejected-save feedback. No page errors. Screenshot: `/tmp/nations-cheers-editor.png`.

The final Cheers pipeline passed 229 test files (two files skipped) and 2,060 tests (three skipped), followed by a successful webpack build. Focused UTC coverage passed 92 tests in nine suites. The actual story renderer produced `/tmp/nations-rugby-story.png`; opening warnings and split kitchen intervals were visually checked. Final log: `/tmp/nations-cheers-review-final.log`.

### Website

Final Node 22 tests: 180 suites and 1,939 tests passed in London and UTC, one pre-existing skipped. Final full lint, typecheck and production build passed. A final singular/plural count correction passed its five focused UI tests, then the production build was repeated successfully. Website commits: `8938a7b7` feed/calendar, `75fa89cd` booking/recovery, `e96544f9` page/food/SEO/browser harness. Logs: `/tmp/nations-website-tests-london-final.log`, `/tmp/nations-website-tests-utc-final.log`, `/tmp/nations-website-lint-final.log`, `/tmp/nations-website-types-final.log`, `/tmp/nations-website-build-final.log`, `/tmp/nations-website-copy-final.log`.

The website's existing audit scripts load TypeScript directly and run on Node 22.20; they fail on Node 20 before reaching the feature. No audit workaround was added.

The isolated browser harness starts Next with server-side outbound fetch interception and dummy keys. It never delegates external requests to the network. Only synthetic contact values and a mock booking service are used. The real website page, availability handler, booking form and POST handler are exercised.

Observed Chromium results:

- Correct rendered title, self-canonical and valid JSON-LD.
- No horizontal overflow at 320, 375, 768 and 1,440 pixels.
- No browser runtime errors or main-content axe violations.
- Team filter and reset work.
- A fixture card opens the booking form on 7 November 2026.
- The form offers the noon arrival and excludes arrivals after the planned screening end.
- The real form/POST path displays mock confirmation `ISOLATED-TEST-1`.
- The captured upstream payload contains trusted fixture UUID, game label and separate customer notes, and the correct date/time.
- A cancelled fixture returns 409 with no additional upstream booking write.
- After a successful simulated write and deliberately lost browser response, cancellation followed by the explicit recovery action returns the existing confirmation. Exactly one write belongs to that attempt; the original customer notes survive.
- Fixture information, warning, food and booking link are readable without JavaScript.
- An unavailable feed removes fixture booking promises and shows normal booking/phone fallback.

Reproduce locally using Node 22.20: `node scripts/nations-smoke-server.cjs`, then in another terminal `node scripts/nations-smoke.cjs`. These scripts bind to 127.0.0.1:3137 and accept no remote target. Stop only the server started for this test. Evidence is written to `/tmp/nations-smoke/evidence.json`; screenshots are in the same directory. The test guard blocks remote font retrieval, so this isolated run may use existing font fallbacks.

Independent review repaired uncertain-booking recovery when fixture labels or eligibility change. Stable fixture identity, a read-only replay envelope and frozen attempt data prevent a changed game label from creating another booking. A shared completion handler records recovered confirmations once, using the original covers. Both cancelled new attempts and recovery after cancellation were exercised through the real website browser/POST path. The harness was corrected to wait for the first simulated write before cancelling; cancelling before that correctly rejected the new booking.

Recovery retains the existing Management idempotency lifetime (24 hours). The frozen request exists in the current form memory and does not survive a page reload. No new persistent browser storage of personal information was added. PayPal and analytics completion/consent paths were exercised in component/API tests, not with a live payment or GA4 account.

## Production boundary

No release action has been taken. The exact migration packet, code deployment order, fixture import and screening decisions must be approved together before live changes. Live generation and scheduling remain separately excluded unless explicitly approved. No opening-hours or kitchen-hours change is part of this release.

No GA4 DebugView, live completed booking, live deposit capture, authenticated production editor mutation or live publisher send has been used as a test. Local mocks prove the paths described above, not a deployed integration.

## Changed files and deliberate exclusions

See [exact file manifest](./nations-championship-changed-files.md). Existing weekly/special opening and kitchen data, deposit rules, football consumer configuration and unrelated original-checkout edits are deliberately untouched. No dependency was added.
