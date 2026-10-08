# Platform, dependencies and automatic checks, and shipping faster, 8 October 2026

Branch `chore/platform-and-checks-p21`. Website only. Source: work packages P21 and P22 of the 7 October 2026 site review (findings DT-015, DT-017, DT-021, FD-010, PL-006, PL-009, PL-010, PL-011, PL-013, PL-014, PL-015, PL-018, PL-019, PY-009, PY-023, SM-016, SM-020 and WP-015), finding DT-010 from P13 (it is an entry in the date register DT-017 asks for), and owner decisions 20 and 21.

Nothing here changes what a visitor reads. One commit per item.

## 1. `npm run lint` finishes again (PL-010)

- [x] `scripts/audit-hero.js` required a TypeScript file directly. Node 20 cannot read TypeScript, so the script stopped on line 6 before checking anything, and because it runs first in `npm run lint` the eight audits after it never ran. It now compiles the module in memory with the `typescript` package it already used.
- [x] `npm run lint` passes on Node 20.19.5 and Node 22.20.0: ESLint and all nine audits (hero, menu pages, page width, redirects, JSON-LD, dated content, palette, opacity, links).

## 2. What a pull request is checked against (PL-010, PL-011, PL-014)

`.github/workflows/ci.yml`, with the shared set-up in `.github/actions/setup/action.yml`.

| Job | What it runs | New |
|---|---|---|
| Lint, audits and types | `npm run lint` (ESLint and the nine audits), `npx tsc --noEmit`, and a dependency advisory report | The audits, the type check over the tests, the advisory report |
| Tests (Europe/London) | `npm test`, then `npm run test:zones` when that script exists | The Sydney and Los Angeles run (arrives with the P20 branch) |
| Tests (UTC) | `npm run test:utc` | Whole job |
| Production build | `npm run build` | Keeps the Next.js build cache |
| Accessibility | A production build served locally, then `npm run audit:a11y` in Chromium | Whole job |

- [x] **The accessibility job needs one repository secret, `ANCHOR_API_KEY`.** Without it every step is skipped and the job passes with a notice, so a missing secret cannot block a merge. GitHub never gives secrets to a pull request from a fork, so those skip too.
- [x] Dependencies are installed once per lockfile and restored from the cache in each job. Each job used to run `npm ci` itself, 65 to 79 seconds each.
- [x] Jest uses every core. It ran in one process (`--runInBand`).
- [x] The three SEO suites no longer run twice: they are part of the full suite.
- [x] A run on `main` is never cancelled by the next merge. A new commit on a pull request still replaces the run before it.
- [x] Node is pinned: `.nvmrc` says 22, `package.json` has `"engines": { "node": ">=22 <23" }`, and the workflows read `.nvmrc`. CI was on Node 20, end of life since April 2026; Vercel builds with 22.
- [x] `actions/checkout` and `actions/setup-node` move from v4 to v7, their current major versions.
- [x] The dependency advisory step reports and does not fail: Next.js 14 carries the one critical advisory until the upgrade (PL-009). The step says to make it enforcing when that lands.
- [x] Two stale comments in the old workflow are gone with it.

**What this does to the three minutes.** Not measured on GitHub: nothing was pushed. Worked out from the steps:

- Jobs run side by side, so a run takes as long as its slowest job.
- Without the accessibility job the slowest is the build: about 2 minutes, down from a median of 3 minutes 16 seconds, because the install is restored from the cache.
- With the secret set, the accessibility job is the slowest, at about 5 minutes: it builds the site and then drives a browser over it. See "Proof" below for the timings here.
- The first run after `package-lock.json` changes installs from scratch in every job, about a minute longer.

## 3. One register of typed dates (DT-017, DT-010)

- [x] `config/date-register.json` lists each date typed into the repository that changes what a visitor or Google sees: what it is, where it lives, what happens when it passes, how many days of warning it needs, and whether the site handles it by itself.
- [x] `scripts/audit-freshness.js` reads it. It lists anything inside its warning period and exits 0: a date coming due is a prompt, not a reason to block a release. It exits 1 only when an entry no longer matches the code (the file is gone, or the text that carries the date is no longer in it), so the register cannot drift.
- [x] It runs in `npm run lint`, so in CI, and weekly from `.github/workflows/dated-content.yml` (Mondays, 07:00 UTC), which opens an issue called "Dated content needs a look", or adds a comment to the one already open.
- [x] `--today YYYY-MM-DD` pins the clock. The five files that carry `verifiedAt` stamps moved into the same register.
- [x] Test: `tests/unit/date-register.test.ts`, 31 cases, the clock pinned, passing in London and UTC.

Seeded with eight entries, each checked against the code today:

| Entry | Date | Warning | When it passes |
|---|---|---|---|
| Job adverts' expiry (DT-010) | 12 May 2027 | 30 days | Google treats both adverts as closed. Stays listed until someone acts. |
| Brochure year | 31 December 2026 | 45 days | Brochure links still say 2026. Stays listed. |
| Christmas for next year (a reminder) | 30 June 2027 | 30 days | Nothing Christmas shows for 2027. Stays listed. |
| Runway alternation start week (a reminder) | 4 January 2027 | 21 days | The plane-spotting note may be a week out. Stays listed. |
| Halloween party end | 1 November 2026 | 14 days | The page switches by itself. |
| Nations Championship window | 29 November 2026 | 7 days | The link and strips go by themselves. |
| Christmas pop-up end | 15 December 2026 | 7 days | It stops by itself. |
| Last Christmas sitting | 20 December 2026 | 7 days | The page closes enquiries by itself. |

## 4. The banner that ended on 17 May (DT-021, part of DT-015)

- [x] `LaunchAnnouncement` and `LaunchAnnouncementClient` are deleted with their three mounts (every page's footer, `/sunday-roast`, `/book-table`). The banner had shown nothing since 6pm on 17 May 2026 but still ran a 60 second timer and sent a "banner viewed" record to analytics on every page load.
- [x] `/sunday-roast` keeps the same spacing where the banner's empty wrapper was.
- [x] `SpecialOfferNotifications` is deleted with its one mount. Its only offer had no section and its only mount always asked for one, so it never rendered.

## 5. Booking addresses nothing uses (PY-009, part of WP-015, owner decision 20)

- [x] Deleted: `POST /api/parking/bookings`, `DELETE /api/table-bookings/[reference]`, `/api/table-bookings/create` and `/api/booking/payment-return`, with `createParkingBooking()`, `cancelTableBooking()` and the unused browser branch of `createTableBooking()`. Each address now answers 404.
- [x] Why the parking one mattered: it sent no source, so the management app treated a booking made through it as made by staff, with a seven day payment window and a payment request text.
- [x] Checked first: nothing in `app`, `components`, `lib` or `hooks` called any of them, and the management app export has no reference to any of the four.
- [x] `/api/bookings/initiate` stays as a 410. It no longer says bookings are "handled via external booking links", which stopped being true.
- [x] Tests that served only the deleted code are removed (`parking-write-resilience`, `write-routes-told-and-reported`, `rate-limits-on-routes`, `table-bookings`). `tests/api/table-bookings.test.ts` now asserts the four files stay gone.

## 6. Smaller items

- [x] **Dead redirect rules (part of SM-020).** Removed `/whats-new/`, `/favicon.ico`, `/cdn-cgi/:path*` and the two Peroni rules in `vercel.json`: none could ever fire. `scripts/audit-redirects.js` now fails on a source that cannot be reached. `/whats-new` without the slash still redirects. Test: `tests/unit/audit-redirects-unreachable.test.ts`.
- [x] **Blog text rules (PL-018).** The six rules nested inside `.prose` in `app/globals.css` are written flat. Nothing in the build flattens CSS nesting, so a browser without it dropped some or all of them.
- [x] **Build settings (PL-019).** `INP` replaces the retired `FID` in the page speed attribution list; `example.com` is no longer an allowed image host; the unused preconnect to the management app is gone; one ungated debug line is removed; `scripts/cta-growth-smoke.cjs` says it needs the development server.
- [x] **Page speed record (FD-010, part 1).** A reading the browser reports twice (same metric, same id, same value) is sent once. The id is used in the browser only and is still never sent. Seven new cases in `tests/unit/web-vitals-reporting.test.tsx`.
- [x] **sharp 0.34.3 to 0.35.5 (PL-009).** Clears three high advisories. 0.35 renamed `failOnError` to `failOn`, so the share image route and the image script change one option each.
- [x] **Stale notes (PY-023, part of PL-015).** The README's Node version, structure, commands and deployment line; two lines in `docs/image-brief.md` naming a deleted photo; the retired booking agent described as live; rows for deleted routes in `docs/architecture/routes.md` and `relationships.md`; two code comments ("Next.js 15", deposits at "10+"). `tasks/lessons.md` was listed in `.gitignore` although it is tracked.
- [x] **Shipping (PL-014, owner decision 21).** Three lessons recorded in `tasks/lessons.md`: one notes file per change, approved fixes in batches, and a check nothing runs is not a check.

## Proof

Node 22.20.0, on the final tree, rebased on `main` at `51eecd14` (PR #227).

| Gate | Result |
|---|---|
| `npm run lint` (ESLint and nine audits) | Passed: no ESLint warnings, all nine audits pass (757 redirect rules, no problems) |
| `npx tsc --noEmit` | Clean |
| `npm test` (London) | 310 suites, 5,322 passed, 1 skipped |
| `npm run test:utc` | 310 suites, 5,322 passed, 1 skipped |
| `npm run build` | Passed, 240 pages |

The accessibility job was rehearsed here the way CI will run it: a production build and server given `ANCHOR_API_KEY` and nothing else, then the audit.

- First run: the build took 106 seconds and the audit 177 seconds, and the audit failed on one real fault already on `main`: at 320px a line of the privacy notice ran 39px past the right edge, because the browser storage key names in it are long unbroken strings. So the job would have been red on its first run.
- Fixed here: that paragraph may now break a line inside a key name (`app/privacy-policy/page.tsx`).
- Second run: build 85 seconds, audit 120 seconds, exit 0. 16 templates at 1280px and 390px, the timed pop-up, the not-found page, the skip link, the phone menu, the quick booking sheet and the cost estimator. 62 results are listed for a human to judge (contrast over images), which the audit reports and does not fail on.
- So with the secret set, expect this job to take about 5 minutes on GitHub (install the browser's libraries, build, audit), which makes a full run about 5 minutes where it was about 3. Without the secret a run is about 2 minutes.

sharp 0.35.5: the event share image route answered `200 image/jpeg`, 328 KB, for a live event poster on the local production build.

## Not done here, and why

- **The move to Next.js 16 and React 19 (PL-009).** Its own project with a full regression pass, as the recorded default says. `npm audit --omit=dev` still reports 1 critical (Next.js) and build-tool advisories.
- **Other advisories.** `npm audit fix` would move about a dozen build tools (postcss, picomatch, minimatch and others). No finding names them, so they are left for one reviewed change.
- **The private hire promotion that ended on 1 March (rest of DT-015).** Not removed: the privacy notice names its two browser storage keys and a test holds the notice to the code, so removing it means editing the notice. Best done with the floating layers work, which is already changing that list. It can never show and sends nothing.
- **Other leftovers in DT-015.** The pre-launch branch in `lib/sunday-roast.ts` (its copy module and tests would change), `lib/static-events.ts` (a schema test reads it), `components/features/BlogPost.tsx` (the blog work has that area open). `getFathersDay` and the two fallback event builders are in use now.
- **Rest of SM-020.** The two page files that a redirect always beats (`app/free-parking/page.tsx`, `app/pub-garden-heathrow/page.tsx`): page files are open on other branches today, and removing a page means regenerating the sitemap dates. The three robots rules that block addresses which also have a 301 (`/_api/`, `/_serverless/`, `/_partials/`) are left as they are, so the audit does not yet fail on that third case.
- **Rest of WP-015.** `/api/calendar/upcoming`, `/api/reviews/status`, `/api/health` and the POST on `/api/events/[id]/availability` are left until the request logs show nobody calls them. `/api/careers` stays by the owner's September decision.
- **FD-010, part 2.** No "automated browser" flag: the recorded default is not to add it without a yes, because it changes the privacy notice.
- **Rest of PL-015.** `docs/architecture/*.md` are generated by the session-setup skill and say manual edits are overwritten, so only rows for deleted routes were corrected; they need regenerating, and `server-actions.md` deleting. `tasks/todo.md` is not touched. The October lessons in the owner's private notes are not copied into this public repository.
- **PL-013.** Moving claim checks from source text to the rendered audit: the finding says after the fix batch, not during it.
- **PL-018, the browser list.** No `browserslist` entry added: it changes what the build targets and is a decision about which browsers to support.
- **PL-019.** Six debug lines are kept: each is behind a development-only flag. `lib/flights.ts` goes with the flight boxes.
- **SM-016.** The title rule in `CLAUDE.md` is not edited: builders may not change that file.
- **Security headers.** Not tightened. A report-only policy needs somewhere to send reports and none exists: no `report-uri`, `report-to` or reporting endpoint anywhere in the repository.
- **`audit:rendered` in CI.** Not added. It needs a running site and has not been run against a build that knows only the one key.
- **Diary check (DT-020).** The register does not warn when the events diary is about to run out: that needs a call to the events feed from the weekly job.

## Assumptions

1. Owner decision 20's "unused booking addresses" means the booking routes named in PY-009 and WP-015, not the four non-booking endpoints in WP-015.
2. The two reminder dates in the register (30 June 2027, 4 January 2027) come from the review's wording: "a warning in June" and "in January".
3. CI job names change. Nothing depends on the old names: `main` has no required checks.
4. `engines` only warns on a different Node version; it does not stop an install.
