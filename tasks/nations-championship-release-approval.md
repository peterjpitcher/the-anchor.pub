# Nations Championship release approval packet

Status: local only on `codex/nations-championship` in three isolated worktrees. Nothing pushed, merged, deployed or imported. No live bookings, social posts, opening hours or kitchen hours changed.

## What the release delivers

- Management: current date-specific opening/kitchen information and read-only recovery of an existing fixture booking attempt.
- Cheers: rugby fixtures, channel/screening decisions, screen allocation, verified food wording, a separate tournament feed and stale-content guards in both publishers.
- Website: search-focused tournament page, every eligible game's table-booking button, warnings when screening starts at current opening time, food service times, calendar downloads and completed-booking attribution by fixture.

The purpose is completed table bookings and covers per game. Clicking a booking button is measured separately. No current service hours change.

## Proposed approval scope

One release approval covers the following concrete list:

1. Recheck remote branch and deployment state, push the isolated implementation commits, create reviewable PRs, complete required CI, merge in dependency order and tidy only the feature branches after verification. Preserve unrelated work and changes made since this packet.
2. Apply the two exact Cheers migrations in the linked SQL packet to `cheersai2.0` (`nbkjciurhvkfpcpatbnt`) through the verified Supabase migration tool. This explicitly includes the listed constraints, index, trigger and privilege statements and the named local RLS-test limitation. Recheck live schema immediately before applying and stop if the evidence has materially changed.
3. Deploy Management first, including both strict hours and read-only booking replay. Deploy both guarded Cheers publishers before enabling rugby generation, then the Cheers application/editor/feed, then the website. Record actual deployment IDs; none exists for this release yet.
4. Create a rugby tournament with slug `nations-championship-2026` and import the exact committed 24-row CSV. Keep all screenings unconfirmed, with no invented end times, channels or screen assignments. Verify the real tournament identity and import results.
5. Configure the separate tournament-scoped website key `CHEERSAI_NATIONS_FEED_API_KEY`; preserve the existing football key. Activate public tournament data only after confirming the returned inventory contains the approved fixture facts and honest unconfirmed states.
6. Verify live read paths, page HTML, links, strict hours, feed, calendar eligibility, availability and deployment logs. Prepare any necessary follow-up from observed results. Do not create a real booking, take a payment or send a post as an implicit test.

## Exact commits and artefacts

| Platform | Local commits |
| --- | --- |
| Management | `1ba4fdaa` strict hours, `86f03a57` booking replay |
| Cheers | `ac36208` schema/policy, `1478eb3` editor/feed/publishers |
| Website | `8938a7b7` feed/calendar, `75fa89cd` booking/recovery, `e96544f9` page/food/SEO |

Import: `/Users/peterpitcher/Cursor/.worktrees/nations-cheers/docs/imports/nations-championship-2026.csv`. It contains 18 named November fixtures and six finals placeholders. Source checking does not confirm the pub's broadcasting arrangements. Revalidate official fixture changes immediately before importing.

Exact SQL, checksums, live preflight, lock risks and rollback: [migration packet](./nations-championship-migration-packet.md).

Unapplied migrations:

- `20260905071016_nations_championship_screenings.sql`, SHA-256 `880f7786aa5080d420ae4ee9c0cea9bc3286ce5100bdccc2d631cdca0fbe53d1`.
- `20260905072213_tournament_screening_revision_guard.sql`, SHA-256 `0be080e2533f7513914d8f66b95c58337b8b4902368fba14020c0e46d00a9f6a`.

Management receives no migration.

## Verification and limits

[Release evidence](./nations-championship-release-evidence.md) contains test counts, observed browser results, logs and limitations. [File manifest](./nations-championship-changed-files.md) lists changed files and deliberate exclusions. [Operating checklist](./nations-championship-operations.md) explains screening review, food wording, stale posts and rollback.

Local suites: Management 6,166 passed; Cheers 2,060 passed; website 1,939 passed in each of London and UTC. Repository lint/typecheck/build gates are recorded in the evidence. The website's isolated browser journey reached a synthetic confirmation and recovered a lost response after cancellation without an extra booking. It also rejected a new cancelled-game booking, displayed food and partial-screening warnings without JavaScript, and handled a feed outage. No browser runtime errors or main-content axe violations were observed.

The isolated PostgreSQL checks did not recreate the full Supabase auth/RLS environment. Existing production policies were inspected read-only. Role/access checks are mandatory after approved application. Local provider doubles, mocked availability and synthetic bookings do not prove a deployed integration. No live PayPal capture, GA4 DebugView, provider send, production editor write or real booking completion has been tested.

## Excluded operational decisions

Screenings cannot become bookable until actual channels, screen assignments, commentary decisions and planned end times are confirmed. None is inferred from the brief or fixture CSV. Recheck the 13 November event clash identified in the brief against the live event diary before assigning screens and commentary. This implementation makes no event changes. Follow the operating checklist against current live hours/events before confirming any game.

Social content generation, scheduling and sending are excluded from this release approval. Present the actual screening and content list for explicit approval once the operational facts are confirmed. A real booking/payment test likewise needs a designated record, communication suppression and cleanup plan approved first.

## Rollback

Pause rugby jobs and prevent old unguarded publishers from processing them. Retain additive schema/data, and disable the new rugby feed/promotion if needed. The website should show its honest unavailable state rather than invented screening facts. Retain Management replay support while the new website is deployed. An older Management handler rejects the mandatory replay envelope without creating a booking, but it cannot provide the new journey. Do not drop production columns or alter opening/kitchen records to roll back.
