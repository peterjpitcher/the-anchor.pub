# Commit audit, 60 days to 4 Sep 2026

Scope: 18 repos under /Users/peterpitcher/Cursor, all refs, merges excluded. Totals: 1,379 commits, 518 fixes (38%), 27 non-conventional subjects, 13 em-dash subjects (all 7-14 Jul, before the 17 Jul hook), 5 reverts, 54 incident-worded subjects. 261 fixes (half) touched code fixed in the prior 7 days, mostly deliberate review waves.

## Per repo

|Repo|Commits|Fix|Non-conv|Em dash|Reverts|Incident|Most notable chain|
|---|---|---|---|---|---|---|---|
|AnchorManagementTools (AMS)|472|37%|14|8|1|14|26 fixes, 3-18 Aug; 61 re-fixes|
|The-Anchor.pub (Anchor)|242|52%|0|2|1|6|95 fixes, 28 Jul-1 Sep, one booking-form file|
|OrangeJelly.co.uk (OJ)|193|26%|0|0|1|7|18 fixes, 28-31 Aug, rebrand|
|Planner2.0|98|44%|5|0|0|6|21 fixes, 9-11 Jul|
|CheersAI2.0|66|22%|0|3|0|7|3 fixes, 7-8 Jul|
|CareerHub|65|15%|0|0|0|1|8 fixes, 10-22 Jul|
|Baronspubs.com|56|48%|5|0|0|2|22 fixes, 14-30 Jul, copy rounds|
|CashBingo|56|50%|1|0|0|7|14 fixes on 25 Aug|
|QuizNight3.0|48|35%|0|0|1|3|11 fixes, 22-23 Jul|
|BaronsHub|40|35%|1|0|1|0|7 fixes, 17-23 Jul|
|MusicBingo|10|50%|0|0|0|1|2 fixes, 8-15 Aug|
|Seven small repos (MindMapper 16 to Planner 0)|33|15%|1|0|0|0|none|

Real incidents: AMS df47a5ca enquiry endpoint dead 11-27 Aug, 3eae5047 anon data leak; Anchor 5ce5ea25 CMS outage shown as retirement; CheersAI 6d8e5c3 domain outage; CareerHub 9255148 CV upload hijacked another candidate's email; Planner 4d0792b dead sync; QuizNight d5841fa live start blocked.

## Themes, ranked by likely cost

1. Silent failure and fail-open on customer write paths (9 repos, 44 commits): Anchor c5cf95a1 27 Aug lost enquiries, dacd5f9c quick-book never booked, 17d7d12b availability fail-open; AMS df47a5ca, 6e755fe9 campaign silently emptied; CareerHub 9255148; Planner fab89a0; CashBingo ba83d5d. Bookings and leads lost for days, unnoticed.
2. Anon grants, RLS and default privileges (9 repos, 34): AMS 3eae5047 27 Aug leak of takings and cost prices, bbb1621c, 78490ebc default grants; CashBingo 50b03e7, 5f4755d 30 Jul host RPCs anon-callable on every build; MusicBingo ce19128; BaronsHub aaff12b. Cause: inherited default grants.
3. Timezone, date and hours-by-date (6 repos, 63): Anchor dc8275de hour "24"; Planner 3f9e340 BST cron wipe; AMS f6e9c3f9 DST business date; Anchor 55c9fa35 15 Aug and AMS 52f43569 16 Aug hours by date not weekday. No dateUtils in Anchor, CashBingo, CheersAI, BaronsHub, Baronspubs, MusicBingo.
4. Copy accuracy, overclaims and SSOT drift (7 repos, 51): Baronspubs 22-fix chain incl. 707ad37 dog-access overclaim; Anchor c94526d5 air-con claim, a71983d8 step-free promises, 2f1607cb stale prices in 12 posts; AMS 53a5e7b5, f766808f promises the venue cannot keep.
5. Migrations and generated types drifting from production (5 repos, 20): CashBingo c0cfbf3 three migrations missing from the repo, adcce5d replay suite; AMS 29ce4e99, 812ef1dc timestamp clashes, 976a7ce4 stale types; Planner 1a34a27 missing security migration, search_path drift.
6. Paired-system duplication, Anchor against AMS, the same defect fixed twice days apart: clock fixture b868fd2b/350959c8 (7 Aug); hours by date 55c9fa35/52f43569; kitchen sittings 5ae8bc9b, 14dac695/90b3a554 (31 Aug-1 Sep); Turnstile split brain 28a2f09c/78553a9d (16 Aug).
7. URLs, env fallbacks and redirects (8 repos, 26): QuizNight 05ae66a QR pointing at localhost; AMS 35e22a60 dead NEXT_PUBLIC_APP_URL fallbacks; CheersAI 6d8e5c3 DNS detachment outage; MusicBingo c560b93 retired domain on printed cards; OJ 87c5350f canonical to a 404; Anchor 6eb94344 172 Wix URLs on the blog index.
8. Email and SMS sending (6 repos, 34): AMS 0b7083b8 SMS said "undefined" and "Invalid Date", 4e74d754 stale amount emailed; BaronsHub 4b18121 duplicate emails; CareerHub 0a95dbc; CheersAI ce73693.
9. Em dashes still enter repos after the hook: about 3,900 added lines in Aug-Sep, mostly docs and data written by Bash, scripts and imports the Write hook never sees: OJ 1,586 docs, 142 code; AMS 389 docs, 49 code (d9acfee); Planner 312 docs (c0822e7); Baronspubs 1,082 scraped data (legitimate).
10. Commit scope accidents (3 repos): AMS f376de24 backed day-boundary work out of a marketing commit; OJ 7ef527ef five blog files committed by accident; Anchor same-subject re-commits 2ff93a54/e44793b4 and 9ea6a375/dbae794a. parallel-git-guard blocks destructive checkouts only.

## Preventions

1. Fail closed (theme 1). Workspace rule: public write paths never fail open; every catch returns an error the user sees and a failed dependency raises an alert. Per-handler test injecting a dependency failure; post-deploy synthetic enquiry asserting the row.
2. Anon allowlist (themes 2, 5). Per Supabase repo: a default-privileges migration revoking anon; a SQL test that anon-executable functions equal a committed allowlist; CI replays migrations on fresh Postgres and diffs the remote list and generated types. supabase.md: every CREATE FUNCTION carries explicit REVOKE and GRANT lines.
3. Dates (theme 3). Copy AMS dateUtils.ts and test into the six repos; CI runs twice, TZ=UTC and TZ=Europe/London; ESLint bans getDay, getHours, toISOString().slice and toLocale* without timeZone outside dateUtils.
4. Paired system (theme 6). Both CLAUDE.md files: AMS owns hours, availability, deposits and Turnstile; the website consumes resolved data; a fix on one side names the counterpart change in the PR. Retire the website slot fallback in lib/api.ts.
5. Copy gate (theme 4). Port Anchor's ssot-drift-guard test to Baronspubs, OJ and CheersAI; shared copy-check CI script (British spelling, U+2014, banned claims, price literals outside SSOT).
6. Env and redirects (theme 7). lib/env.ts zod schema validated at build; grep test for localhost, retired domains and hardcoded app URLs; shared check-redirects script asserting destination and 200 for every rule.
7. Messaging (theme 8). Render every template with fixture data and fail on "undefined", "Invalid Date", "NaN" or "£0"; one send chokepoint with an idempotency key.
8. Em dash and commit scope (themes 9, 10). CI grep for U+2014 in src, app, lib, components, docs and tasks, excluding archive and scrapes; a PreToolUse Bash hook blocking heredoc writes containing U+2014 and denying git add -A, git add . and git commit -a; one worktree per parallel session.
