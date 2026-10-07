# The page speed endpoint recorded nothing, and ignored the cookie choice, 7 October 2026

Branch `feat/web-vitals-recording`, from main at a492f407 (PR #200). Local only until the owner
says yes. The privacy notice paragraph is a draft he has not approved.

`app/web-vitals.tsx` posted all six Core Web Vitals to `/api/web-vitals` for every visitor, whatever
their cookie choice. The route wrote them with `console.log`, which `next.config.js` strips from the
production build, so about 1,770 calls a day recorded nothing.

- [x] Record only CLS, LCP and INP. One line per request, written with `console.warn`, which the
      build keeps: `[web-vital] {"metric":"LCP","value":2480,"rating":"good","path":"/","size":"desktop"}`
- [x] The line holds the page path, the size class, the metric, value and rating, and for CLS the
      element that moved and how far across and down. Nothing from the request's headers
- [x] `hasSwitchedAnalyticsOff` in `lib/cookies.ts`: no choice yet is recorded, analytics refused
      is not, and for a refusal nothing is sent
- [x] The route turns away anything else with a 400 or 413 and logs nothing: unknown metric,
      unknown key, a number that is not finite, a string too long, a body over 1 KB
- [x] A booking reference in the path is replaced with `[id]` in the browser, and a path that is
      not a plain site path is not sent
- [x] Privacy notice, section 5, draft paragraph under Analytics Cookies; date and fingerprint
      moved in `lib/legal-pages.ts`
- [x] Tests: `tests/unit/web-vitals-reporting.test.tsx`, `tests/api/web-vitals-route.test.ts`,
      `tests/unit/privacy-policy-page-speed.test.tsx`. Taking out the consent check failed four
      tests; putting `console.log` back failed three
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20
- [x] Production build, `next start`, headless Chromium in three consent states: five POSTs and
      five log lines with no choice, five with analytics accepted, none with analytics refused
- [ ] Owner's yes to the notice paragraph, then to the push
- [ ] On a preview deployment, confirm the line shows in `vercel logs`. Not provable locally

Found on the way, and what was done about it:
- `useReportWebVitals` never says what moved. The `webVitalsAttribution` setting in
  `next.config.js` only works when Next's own analytics id is set, which it is not. So CLS is read
  from the attribution build Next already ships (`next/dist/compiled/web-vitals-attribution`),
  typed in `types/web-vitals-attribution.d.ts`. The setting itself is left as it was.
- The request had no `keepalive`, so a reading sent as the page was left (CLS, INP) could be
  cancelled. It has it now.

Left alone on purpose: `removeConsole` in `next.config.js`, the GA4 exclusion in
`lib/tracking/dispatcher.ts`, Tag Manager, and the `trackWebVitals` push to the data layer, which
still gets all six metrics and has its own consent check.

Assumptions:
- Size class is the window's width against Tailwind's md and lg: under 768px phone, under 1024px
  tablet, otherwise desktop. The width itself is not sent.
- LCP is recorded against the page the visit loaded first; CLS and INP against the page the
  visitor is on when the browser reports them, which after moving between pages may not be the
  page where it happened.
- A stored cookie choice that cannot be read counts as analytics off.
- "About 30 days" in the notice is how far back Vercel's logs went on 6 October 2026 (29 days).

# Accessibility audit's reflow check could not see content cut off by the page, 6 October 2026

Branch `fix/a11y-audit-reflow-blind-spot`, from main at 1baf0238 (PR #196). Local only until the
owner says yes.

`scripts/audit-a11y.js` set the viewport to 320px and failed a page when the root element's scroll
width was more than 2px over its client width. `app/globals.css` sets
`html, body { max-width: 100vw; overflow-x: hidden; }`, so anything too wide is clipped by `<body>`
and never adds to the root's scroll width. The check read 0 on every page.

- [x] Prove the blind spot on main with a production build, both season skins. The unchanged
      audit: exit 0, "no reflow problems", on both. The old measurement read 0 on all 17 pages
      while Chromium's own answer with the root clip lifted was 22px to 552px on eight of them
- [x] Survey what sits past the right edge at 320px and 390px on every page in PAGES, both skins,
      and sort it into what is cut off and what is meant to be there
- [x] Replace the measurement (`lookForCutOff`, `checkReflow`): every box and every run of text
      against the edge of the viewport
- [x] Unit tests: 28. Nineteen deliberate breakages each failed a test, the old measurement put
      back among them
- [x] List every page the new check flags, with screenshots. Not fixed in this change
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20, then `npm run audit:a11y` against the production build of each skin: exit 1 on
      both, 16 pages, the same list each time and nothing else failing
- [ ] Owner's yes before any push

What is left out, and why. Each is a kind of thing found past the edge on these pages:
- Not painted: no box, or `visibility: hidden`.
- Inside a box that scrolls sideways (`overflow-x: auto` or `scroll`): the rest can be reached. The
  price table on /private-hire, the facts strip on an event page.
- Inside a box that clips it and shows none of it: the reviews carousel's waiting slides (5 on
  /heathrow-parking, 11 on /beer-garden), screen-reader-only text in a one-pixel box.
- Shortened with an ellipsis by its own box. None was past the edge, but the event banner on 14
  pages does this to the event name, so the next long name would have been a false alarm.
- Parked beside the screen: `fixed` or `absolute` and starting at or past the edge, with all that
  is in it. The closed cost estimator drawer on /private-hire.

Decisions:
- A box that clips is not an excuse by itself. 90 components have `overflow-hidden`, the hero
  among them, so excusing everything inside one would move the blind spot one level down. Part
  showing and part clipped is cut off. This is what finds the pill in the hero on
  /private-hire/near/slough-crematorium, which `<body>` never touches.
- No rule for `aria-hidden`, `inert` or `opacity`. The sticky bar is `aria-hidden` and waiting
  below the screen when the check runs, but it is laid out as it will be shown: scrolled into its
  shown state at 320px and 390px, its buttons sat at the same left and right edges to the pixel.
- Moving things are put at rest first (`document.getAnimations()`, `finish()`). The carousel
  slides for half a second in every five. Caught mid-slide it was reported 18 times in 20
  without this and 0 in 20 with it.
- Text is measured as well as boxes. Nothing on these pages needed it; a long address in a
  narrow paragraph would, and its paragraph's box would say nothing.
- The report lists every page, not the first twelve: one component puts a line on 16 of them.
- Cross-check: wherever Chromium's own measurement shows overflow, the new check reports the same
  pixel count (17 pages, two skins, 320px and 390px). It reports two things that measurement
  cannot: the sticky bar, which is `fixed`, and the hero pill, cut by its own section.

Not covered: the left edge; a drawer once opened; a `fixed` or `absolute` box laid out against a
transformed ancestor (the error there reports something hidden, it never hides something cut off).

What it flags at 320px, the same in both skins (not fixed here):
- The sticky bar's WhatsApp button on every page but /book-table, and its Call button too on
  /quiz-night/themed, /private-hire/venue-tour, /private-hire/near/slough-crematorium,
  /private-hire and /whats-on. On those five WhatsApp is still off the screen at 390px.
- One-line buttons that cannot wrap: /halloween (42px, 7px at 390px), /heathrow-parking (two, 41px,
  6px at 390px), /private-hire/near/slough-crematorium (165px, 95px at 390px), /sunday-roast and
  /whats-on (40px), /blog/best-sunday-roast-surrey Share on Facebook (39px).
- The enquiry form and the block under it on /private-hire and the Slough page (46px), and all
  three columns of /events/quiz-night-2026-10-07 (22px). Traced to the Turnstile widget, which is
  300px at its narrowest: the one-column grid around it grows to fit and takes its neighbours
  with it. That one is bot protection, so the fix needs the management app checked too.
- The hero pill on the Slough page (8px).
- The blog comparison table (552px), already being fixed on `fix/blog-table-mobile-overflow`.

Found on the way, not fixed: the "Blog content specific styles" block in `app/globals.css` uses
native CSS nesting and the built stylesheet ships it as written (`.prose{&>:first-child{...}`), so
a browser without CSS nesting ignores those rules.

Assumptions:
- 320px stays the width checked, as before. A page loaded at 320px or 390px gives the same list
  as one loaded at 1280px and narrowed, so narrowing is a fair stand-in for a phone.
- The audit is not part of CI (`.github/workflows/ci.yml` runs lint, tests and the build), so a
  failing audit blocks nothing until the pages are fixed.

Audit tooling only. Nothing here touches hours, availability, bookings or bot protection, so the
management app needs no counterpart change.

# Desktop header no longer moves the page as it loads, 6 October 2026

Branch `fix/header-strip-layout-shift` (worktree `fervent-chebyshev-fe468d`), on main at 1baf0238
(PR #196). Local only: not pushed, waiting for the owner's yes.

Field data first. Search Console, Core Web Vitals, source Chrome UX Report, last updated 4 October
2026: desktop has 123 URLs "need improvement" and none good, one issue, "CLS issue: more than 0.1
(desktop)", group CLS 0.19, on the chart since about 12 September. Mobile has 123 good URLs. So real
desktop visitors are affected and the lab figure matches the field figure.

Cause. The promo links in the utility strip were chosen in a Navigation effect, so the server sent
the strip without them. After hydration they appeared, the strip grew from 37px to 49px and the page
moved down 12px. The link group's left edge moved 316px in the same frame, and a shift is scored on
the furthest any element moves, which is what made a 12px nudge score 0.19. One short link keeps it
under 0.1; the second link went up on 5 September.

- [x] Measure on a production build before touching anything, every desktop width, both skins
- [x] The root layout works out the open promos and passes them to Navigation, so the links are in
      the HTML. Navigation still re-checks on the visitor's clock (pages are built once per deploy)
- [x] The strip is a fixed height, 48px with promos and 36px without, the two heights it already
      settled at. Status text gets two lines (one without promos); the link group never shrinks
- [x] Header wordmark declared 168x42, file is 400x200: now 104x52, so the menu no longer slides
- [x] Hero wordmark declared 300x300, same file shape: now 300x150, so the hero no longer jumps
      150px when the image lands late (seen 1 run in 3 on the live site, phones included)
- [x] Test that renders Navigation the way the server does. Taking the fix out fails it
- [x] Node 20: `npm run lint:next`, `npx tsc --noEmit`, `npm test` and `npm run test:utc` (253
      suites, 3,087 tests each), `npm run build`. Full `npm run lint` chain passes on Node 26
- [ ] Push, PR, merge on green checks, check the live site, then "Validate fix" in Search Console.
      The field figure is a 28 day average, so it takes about four weeks to clear

CLS on load, three runs a page, analytics blocked, event banner showing. Before is main; after is
this branch, the same in the light, dark and festive skins.

| Width | Before | After |
| --- | --- | --- |
| 1024 | 0.31 to 0.32 | 0.006 to 0.007 |
| 1280 | 0.21 | 0.004 |
| 1440 | 0.19 (0.24 when the hero also jumps) | 0.003 |
| 1920 | 0.15 | 0.002 |
| 390 (phone) | 0.005 (0.077 when the hero jumps) | 0.005 |

After the change the page content and the strip sit at one position from first paint (126px and
49px) on every run, including with the hours request held back 1.5 seconds and with it failing.

What still moves, left alone on purpose:
- The booking bar at the bottom slides up when the cookie banner appears, about a second in. It is
  the whole of the 0.002 to 0.007 that remains on a first visit. Different component, well inside
  the 0.1 limit.
- If the hours request fails, the longer "live status unavailable" text reflows the homepage hero
  pill: up to 0.024 at 1024px. The strip and the page still do not move.

Assumptions:
- Under about 1,064px wide, with today's two promo links and the longest status text, the third
  status line (Planes) is cut off rather than making the strip taller. That case used to be a
  three-line strip. From 1,064px up the longest text fits in two lines and nothing is cut.
- No change in OJ-AnchorManagementTools: layout only, no hours or booking logic touched.
- Before figures for the light skin come from main at e5952736, one merge earlier than the base
  (self-hosted fonts landed in between; the live site, measured after it, gives the same numbers).

Found on the way, not touched: `/api/web-vitals` receives every visitor's measurements and records
none of them, because `removeConsole` strips its only `console.log` in production.

# Blog tables cut off on a phone, 6 October 2026

Branch `fix/blog-table-mobile-overflow`, from main at 1baf0238 (PR #196). Local only: waiting for
the owner's yes before any push.

On a 390px screen the comparison table on `/blog/best-sunday-roast-surrey` is 856px wide. `<body>`
hides sideways overflow, so the page cannot be scrolled and four of its seven columns could not be
reached at all.

- [x] Reproduced on a production build of main before changing anything, in both season skins:
      19 of the 26 blog pages that have a table had one cut off (three more post folders redirect
      to one of those 26)
- [x] `wrapTablesForScrolling` (`lib/markdown-tables.ts`) puts each table in a named, focusable
      region; the blog template calls it at render time, so `post.htmlContent` and the structured
      data built from it are untouched; the scroll and the spacing are `.prose .table-scroll` in
      `app/globals.css`
- [x] After, same builds: 0 of 38 tables cut off in either skin; arrow keys scroll the region and
      the focus ring shows; no table moved and no page changed height at 390px or 1280px across 118
      pages; the 1280px screenshots are pixel-identical before and after in both skins
- [x] JSON-LD on five posts is byte-identical to the live site
- [x] Eight unit tests. Seven fail with their part of the fix switched off; the eighth checks that
      a post with no table is left exactly as it was
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20; `npm run lint` on the default Node; `npm run audit:a11y` against the production
      build: no violations, no keyboard problems, no reflow problems, 35 items for a human
- [ ] Owner's yes, then push and open the PR

Not done here, by design:

- The other pages with a table (`/sunday-roast`, `/restaurants-near-heathrow`,
  `/heathrow-layover-dining`, `/private-hire`) already scroll theirs and were not touched.
  `/quiz-night-competition-terms` renders markdown through its own pipeline and has no table.
- The audit's 320px reflow check measures the page's own scroll width, which `<body>` keeps at
  zero. It passed this page while the table was cut off, and would pass anything else cut off the
  same way.

# Accessibility audit checks a pop-up that opens on a timer, 6 October 2026

Branch `fix/a11y-audit-timed-popup`, from main at e5952736 (PR #195). Owner said yes on 6 October.

`scripts/audit-a11y.js` checks a page in about three seconds and closes it. The Christmas lightbox
opens ten seconds after it mounts, so the audit never saw it, and on 5 October it passed every page
while the lightbox's close button had no accessible name (fixed in PR #193).

- [x] Unit tests for the rule that decides a pop-up has opened, for the wait, for the order the
      pass does things in, and one that renders the real lightbox: 28 in all. Fifteen deliberate
      breakages each failed a test
- [x] `auditTimedPopup`: open `/heathrow-parking` in a browser that has never seen the site, look
      at it at once, wait for it to hydrate, then wait up to 14 seconds for a new layer fixed over
      the whole viewport that takes clicks, and point axe at it
- [x] Report line under the page count saying whether a pop-up was checked or none opened
- [x] Proof in a real browser against deployed builds:
      - yesterday's production build (293e22fd, before PR #193): exit 1, "timed pop-up on
        /heathrow-parking: checked ("Christmas 2026")" and `[critical] button-name` on 1 node
      - the live site (main e5952736): exit 0, pop-up checked, no violations, 35 items for a human
      - `/book-table` on the live site, where the lightbox is kept off: the wait ended with nothing
        after 14.2 seconds and nothing was marked
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20
- [x] Review follow-up (PR #196): the first look was taken after the page had settled, so on a
      page slow enough for the lightbox to open first, the open pop-up was taken for part of the
      page and the run said none had opened. The pass now looks the moment the page loads and no
      longer waits for it to settle. A test plays that slow page; it failed with the old order
- [ ] Merge on green checks

Run time against the live site went from 70 seconds to between 79 and 87.

Decisions:
- A pop-up is found by what it does (a new fixed layer covering the viewport that takes clicks),
  not by a selector for the Christmas lightbox, so the next campaign's pop-up is found too.
- "Takes clicks" is there because the booking drawer keeps a full-screen backdrop on every page
  with `pointer-events: none` until it is opened. Seen on the live site on 6 October.
- An overlay that is always on the page and only fades in is not found. Both campaign lightboxes
  mount when they open, and a unit test holds the Christmas one to it.
- No pop-up is reported, not failed. A campaign has an end date (15 December 2026 for this one),
  so for part of the year none is the right answer.
- axe looks at the pop-up alone; the page under it was already checked in the page loop.
- Not checked on the pop-up: where focus goes, and whether Escape closes it.

# Self-hosted fonts, so a build never waits on Google, 6 October 2026

Branch `fix/self-host-fonts` (worktree `goofy-banach-abb1cb`), cut from main at 47a64427, with main
merged in at e5952736 once PR #195 (Six Nations pop-up) landed. The only conflict was the top of this
file; both sections are kept.

Two Vercel preview builds failed on 6 October inside `next/font` with `TypeError: Cannot read
properties of null (reading '1')` at `google/loader.js:112` (PR #192 at 59ede763 and PR #191 at
2b9e145b). A redeploy of each built clean. A production build could fail the same way, and the site
would then stay on the previous deployment with a merged fix not live.

- [x] Confirm the cause before changing anything
- [x] Self-host the same eight font files with `next/font/local`; keep families, weights, subsets,
      `display: swap`, preloads, fallback sizing and the three CSS variable names
- [x] Check the licences and record where each file came from (`app/fonts/README.md`)
- [x] Block `next/font/google` in ESLint so the build-time download cannot come back
- [x] Prove no visual change and no layout shift change, both season skins, production builds
- [x] Prove a build no longer needs Google Fonts
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20.19.5, again on the merged tree (180386aa): lint and types clean, 251 suites with
      3,050 passed and 1 skipped in both time zones, build exit 0
- [x] Commit. Pushed only after the owner said yes on 6 October

Cause:
- Line 112 is `/\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1]`. It takes the file type
  from the end of each font address in Google's stylesheet and assumes there is one.
- Google sometimes answers the same stylesheet request with addresses of the form
  `https://fonts.gstatic.com/l/font?kit=...`, which have no file extension. The file behind them is
  a valid woff2; only the address parsing fails. This is vercel/next.js#99114, opened 23 September
  2026 and still open; the same line is in Next's canary, so upgrading Next does not fix it. The
  reporter saw about 1 response in 60 in that shape.
- Not reproduced from this machine: 81 fetches of the site's three stylesheet requests all came back
  with `.woff2` addresses. The shape of the failure, the upstream report and the clean redeploys
  agree, but the bad response itself was never captured.
- Vercel history: 240 deployments back to 17 August, three failed, two with this error, both on
  6 October (14 builds that day). The third (10 September, production) was an unrelated sitemap
  error.
- The same download flaked during the baseline build for this work: `getaddrinfo ENOTFOUND
  fonts.googleapis.com`, which Next's retry happened to survive.

What changed:
- `app/fonts/`: the eight woff2 files, the three licence texts, `README.md` (source address and
  SHA-256 of every file) and `index.ts` (six `next/font/local` calls).
- `app/layout.tsx` takes `fontVariables` from `app/fonts`; the three Google font calls are gone.
- `app/globals.css` joins each latin and latin-ext pair into `--font-display`, `--font-body` and
  `--font-script`, and holds the three fallback faces with the numbers Next generated before.
- `.eslintrc.json` rejects any import of `next/font/google`. Checked with a throwaway file: the
  rule fires.
- Left alone on purpose: `tailwind.config.ts` and every component, because the three variable names
  did not change; `docs/redesign-spec.md`, which still describes `next/font/google` as the design
  history it is.

Why six calls and not three: Google serves each family as a latin file and a latin-ext file, told
apart by `unicode-range`, and `next/font/google` emitted both. `next/font/local` can attach one
`unicode-range` per call. Dropping latin-ext would have been simpler, but a name such as "Żywiec"
on a menu or an event would then fall back to a system font where today it does not.

Proof (production builds of 47a64427 and of this branch, both skins, Playwright Chromium 1.60; logs
and screenshots in the session scratchpad):

| Check | Result |
| --- | --- |
| Font files in the build | 8 before, 8 after, byte for byte the same (SHA-256) |
| `@font-face` rules for the web fonts | 18 before, 18 after, identical as a set on file, weight, style, display, format, preload and unicode-range |
| Fallback faces | 3 before, 3 after, same four numbers each |
| Preloaded fonts in `<head>` | the same 4 files |
| Screenshots, homepage, `/food-menu`, `/blog/best-sunday-roast-surrey`, 1440px and 390px, top of page and full page, dark skin | 0 differing pixels of 82.0 million |
| The same in the light skin (`NEXT_PUBLIC_FORCE_WINTER_SKIN=off`) | 0 differing pixels of 80.9 million |
| Position and size of every element on those pages | identical, 12 of 12 |
| Font Chrome actually drew each text element with (CDP `getPlatformFontsForNode`) | identical, 12 of 12 |
| Same pages with the web fonts blocked, so only the fallback shows | 0 differing pixels, boxes identical, 12 of 12 |
| Probe injected into both builds: Outfit at 14 weights from 100 to 900, both subsets of all three families, characters in neither file | 0 differing pixels, same fonts drawn, same widths, both skins |
| Layout shift, fonts as normal / held back 2.5s / blocked | equal before and after in all 36 measurements, to within 0.0002 |
| `npm run build` with Google Fonts made unreachable, main at 47a64427 | fails: `Failed to fetch` for all three families, 12 lookups of Google's font hosts |
| The same build on this branch | passes, 0 lookups of Google's font hosts |

The last two rows preload a small script into every Node process of the build (`NODE_OPTIONS=--require`)
that logs each host name looked up and refuses `fonts.googleapis.com` and `fonts.gstatic.com`.

Two things differ and neither is visible: the font file names lose a `-s` marker (so a returning
visitor fetches the four files once more), and `<meta name="next-size-adjust">` is no longer in the
head. Nothing in Next reads that tag. The generated family and class names differ too, as they do
on any rebuild that changes the font declaration.

Things that looked like differences and were not, so the next person does not chase them:
- The build skips the events and menu feeds and bakes pages without them; each fills in on its
  first revalidation. Two servers started minutes apart show different homepages. The harness waits
  until both serve the same words.
- The site scrolls smoothly, so `scrollTo(0, 0)` is still travelling when a capture is taken. Use
  `behavior: 'instant'` and wait until no element has moved for 1.5 seconds.
- Fixed overlays (cookie banner, booking drawer) land a pixel or two apart in a full-page capture.
  They are captured in a viewport shot and hidden for the full-page one.
- The Christmas pop-up arrives on a timer. Every capture was repeated on the same build to measure
  noise: 22 of 24 repeats matched their first capture exactly, and the other two are the same page
  (blog, mobile, light) on each build, with the pop-up on screen at a different moment.
- On desktop the homepage fetches two or three extra woff2 files from `fonts.gstatic.com`. They
  belong to the embedded Google map, vary run to run in both builds, and are not the site's fonts.

Assumptions:
- SIL OFL 1.1 lets these files be bundled and redistributed as long as the licence travels with
  them. All three families are listed as OFL in google/fonts and the licence texts are copied from
  there unchanged. Not legal advice.
- The fallback numbers are copied from what Next generated for the Google versions, not
  recalculated. They only need to change if a family changes.

Found on the way and parked (both confirmed on the live site, neither caused by this change):
- Desktop pages shift on load: the header's top strip grows from 20px to 54px after first paint and
  pushes the page down. Chrome scores it 0.19 to 0.24 on the live homepage, lab data only.
- The comparison table in `/blog/best-sunday-roast-surrey` is 856px wide on a 390px phone and is
  cut off by `overflow-x: hidden` on `body`, with no way to scroll to the rest.

# Six Nations pop-up switched off, 6 October 2026

Branch `fix/six-nations-popup-off`, from main at 47a64427 (PR #191).

`/live-sport/six-nations` mounted `SixNationsLightbox`, which opened on exit intent or after 40
seconds with "Six Nations 2026, Live at The Anchor, Don't Miss Kick Off!". It was seen opening on
the live site on 6 October 2026. `docs/SSOT.md` has an entry for the Nations Championship and none
for the Six Nations, and the repo rule is no seasonal content the SSOT does not confirm. The owner
said yes to switching the pop-up off the same day.

- [x] Test first: render the page, fire exit intent and run the 40 second timer, expect no pop-up.
      Two of three cases failed before the change
- [x] Stop mounting the pop-up on the page; drop the now unused `next/dynamic` import
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20
- [x] Push, PR, merge on green checks, check on the live site that nothing opens. PR #195, merge
      e5952736, deployment dpl_DrSihTWGnA3HtQSF1PpoGeM7MM2P. On the live site with the "seen" key
      cleared: no pop-up on exit intent, none after 44 seconds, and the key was never written

Left as it is, on purpose:
- `components/features/six-nations/SixNationsLightbox.tsx` and its close-button test stay. The
  owner asked for the pop-up to be switched off, not for code to be deleted.
- The page itself still says "Watch Six Nations 2026 Live" in its title and hero. That is page
  content, outside what was approved; reported to the owner.

# Accessibility audit waits for client-loaded content, 5 October 2026

Branch `fix/a11y-audit-waits-for-client-content` (worktree `recursing-kapitsa-e9dffa`), PR #191 since
6 October; the review follow-up at the end of this section was added that day.
Cut from main at 23152e77, rebased onto 293e22fd once PRs #189 (carousel dots) and #190 (privacy
notice row in PAGES) landed. The only conflict was the end of the PAGES table; both rows are kept.

`scripts/audit-a11y.js` ran axe as soon as a page hydrated. Content a client component fetches after
mount was not there yet, so on 5 October a run against the live site passed `/heathrow-parking` while
its six carousel dots failed WCAG 2.2 AA target-size.

- [x] Measure what every audited page loads after hydration, on a production build
- [x] Wait for each page to settle before axe: named content present, none of the page's own
      content requests in flight, and 500ms with no request activity and no DOM change. Fail closed
- [x] Name the reviews carousel on `/heathrow-parking`; add `/beer-garden` (12 dots, widest case)
- [x] Unit tests for the settle rule; break each part of the rule and confirm a test fails
- [x] Prove it in a browser: unchanged audit misses the 8px dots, changed audit always catches them,
      and passes once the dots are fixed
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20.19.5
- [x] Commit. No push

What was measured (production build of 23152e77 on port 3100, Playwright Chromium):
- `networkidle` never arrives on any of the 16 pages, not only the homepage. Every page sends a
  POST to `/api/web-vitals` whose reply it never reads, so the browser never reports it finished.
  The route itself answers in 2ms. Tag Manager and Turnstile also keep talking.
- After hydration every page fetches `/api/business/hours`; most also `/api/events?limit=5`; the
  carousel pages `/api/reviews`; the private hire pages `/api/public/private-booking/config`;
  `/book-table` its sittings and events. Locally they finish within 1.7s. About 28 router link
  prefetches a page (header `next-router-prefetch: 1`) are left out: they only warm a cache.
- Against localhost `/api/reviews` answers in about 20ms, which is why the unchanged audit caught
  the dots locally 3 times out of 3 and still missed them on the live site.
- The cookie banner is put on the page by a one-second timer (`components/CookieBanner.tsx`). With
  nothing in flight during that second, a network-only wait saw it on 13 pages and missed it on 3.
  It is now named content, so every page is checked with the banner up, as a first-time visitor
  sees it. That one-second timer is most of the extra run time.
- Waiting does not make axe less able to judge a page: colour-contrast "needs a human" counts were
  unchanged on 14 of 16 pages and rose by one on two, while checked-and-passed nodes rose by 34 to
  66 a page.

Proof (all logs in the session scratchpad; delay means a local proxy holding back every GET to
`/api/*` by 1.5s, the way the live network does):

| Build | Audit | Runs | Result |
| --- | --- | --- | --- |
| 23152e77, 8px dots | unchanged, 1.5s delay | 5 | exit 0 every time, "No violations": the miss reproduced |
| 23152e77, 8px dots | changed, 1.5s delay | 5 | exit 1 every time: `/heathrow-parking` 6 nodes, `/beer-garden` 12 nodes |
| 23152e77, 8px dots | changed, no delay | 5 | exit 1 every time, same 6 and 12 nodes |
| 23152e77, reviews held 20s | changed | 1 | exit 1: both carousel pages "expected content never appeared within 15s" |
| 23152e77 + 4d23752e dots | changed, no delay | 5 | exit 0 every time, no settle problems |
| 23152e77 + 4d23752e dots | changed, 1.5s delay | 5 | exit 0 every time, no settle problems |
| 293e22fd current main + branch | changed, no delay | 3 | exit 0 every time, 17 pages |
| 293e22fd current main + branch | changed, 1.5s delay | 2 | exit 0 every time |

Run time on the same build of current main: unchanged audit 31s for 16 pages; changed audit 58s to
60s for 17 pages (68s to 69s with the 1.5s delay). Settling costs about 1.55s a page: the banner's
one-second timer plus the 500ms quiet period. Hydration, keyboard and reflow checks are unchanged.

Unit tests (`tests/unit/a11y-audit-settle.test.tsx`, 21): each part of the rule was removed in turn
(in-flight wait, request quiet, DOM quiet, named content, GET only, prefetch exclusion, own origin
only, lazy code) and every one of the eight made at least two tests fail. The last two tests render
the real `CookieBanner` and `GoogleReviews`, so renaming the labels the audit waits for fails CI.

Assumptions:
- The cookie banner is audited on every page rather than on none. Leaving it out would save about
  18s a run, but the banner would then never be checked by axe at all.
- 500ms quiet and a 15s cap. The quiet period matches Playwright's own idea of idle; the cap matches
  the existing hydration timeout.
- Content that loads only when scrolled into view, and the Christmas lightbox on its 10 second
  timer, are still not covered. Said so in the script.

Found while proving this, not changed here:
- The Christmas lightbox close button has no accessible name (axe `button-name`, critical). It opens
  after 10 seconds on pages it is not suppressed on, until 15 December. The Six Nations lightbox on
  `/live-sport/six-nations` has the same unnamed button. The audit cannot see either because it never
  waits 10 seconds.
- `components/layout/StatusBar.tsx` puts the plane-spotting caveat in an `aria-label` on a plain
  `<span>`, which screen readers may ignore. axe lists it under "needs a human" on every page now
  that the status bar has loaded before it looks.

## Review follow-up, 6 October 2026

A review comment on PR #191 said a content request answered with a 4xx or 5xx is counted as done, so
a page with content missing still settles and passes. It was right, and a dropped connection had the
same hole.

- [x] Check the claim in a browser: a 500 shows `response:500` then `requestfinished`; a dropped
      connection shows `requestfailed net::ERR_EMPTY_RESPONSE`. The audit as pushed (716710af) passed
      with `/api/events` answering 500, exit 0
- [x] Measure normal operation before changing anything
- [x] Tests first, red: an errored reply, a dropped request, a cancelled one, an untracked one, both
      problems on one line, and a reload
- [x] Report a failed content request under NOT SETTLED with its path and status or reason
- [x] Call the event banner's coin toss for the audit (found while measuring, below)
- [x] Break each new rule in turn (ten ways); a test failed every time
- [x] Proof with a proxy, then `lint:next`, `tsc`, `npm test`, `npm run test:utc`, `npm run build`
- [x] Two commits. No push

Measured on a production build of the branch: 4,169 tracked requests over 17 pages and five passes
(three direct, two with replies held back 1.5s). Every one answered 200; none failed, none was
aborted. So a failed-request check cannot fire on a healthy site.

Found while measuring: `components/EventCountdownBanner.tsx` shows the banner to half of all
sessions, on a coin toss kept in sessionStorage. Each audited page is a new session, so over three
passes the banner was on 5, 9 and 10 of the 17 pages, a different set each time. The audit now sets
the toss to "show" before each page loads: 14 of 17 on all three passes (it is switched off on
`/quiz-night/themed`, `/events/...` and `/book-table`).

| Site | Audit | Result |
| --- | --- | --- |
| `/api/events` answers 500 | as pushed, 716710af | exit 0, "No violations": the hole |
| `/api/events` answers 500 | fixed | exit 1: 15 pages name the request with status 500 |
| `/api/events` connection dropped | fixed | exit 1: 15 pages, `net::ERR_EMPTY_RESPONSE` |
| `/api/reviews` answers 500 | fixed | exit 1: both carousel pages report the missing carousel and the failed request |
| healthy | fixed, 3 runs | exit 0 every time, 58s |
| healthy, 1.5s delay | fixed, 2 runs | exit 0 every time, 68s to 70s |

Assumptions:
- 400 and above is an error for a content read.
- `net::ERR_ABORTED` is not a failure: it is a request the page cancelled, and what the audit's own
  retry does to requests in flight. None occurs in normal use.
- The audit takes the side of the toss with more on the page. The banner is not named as required
  content, because it is switched off on some paths and has nothing to show when no event is
  coming up.

# Plane-spotting caveat readable by screen readers, 6 October 2026

Branch `fix/status-bar-plane-caveat-sr-text` (worktree `elegant-driscoll-86f51b`), cut from main at
293e22fd.

The header status bar says "Planes: expected until 3pm" and carried the caveat ("Weather and
Heathrow operations dependent, not guaranteed.") in an `aria-label` on a plain `span`. A span with
no role is not allowed a name, so a screen reader may ignore the label and the caveat with it. axe
lists it as `aria-prohibited-attr` (needs a human) on every page once the status bar has loaded.

- [x] Confirm the fault on the live site with axe, and measure the row
- [x] Check every caller of the `ariaLabel` prop
- [x] Jest test that the row's text carries the caveat; watch it fail
- [x] Fix: caveat as screen-reader-only text inside the row, `ariaLabel` prop removed
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20
- [x] Production build: axe no longer lists the element, the row measures the same
- [x] Commit. No push

Callers: the plane-spotting row was the only one that passed `ariaLabel`. The bar, kitchen and
fallback rows never did, so nothing else changes. The prop is gone, so the mistake cannot come back
through it. The hover tooltip (`title`) stays. The caveat wording is untouched and still comes from
`PLANE_SPOTTING_COMPACT_CAVEAT` in `lib/heathrow-runway-alternation.ts`.

Results:
- Jest: `tests/unit/StatusBar.plane-caveat.test.tsx`, 4 tests, all failed before the fix and pass
  after. It reads the row's text, not its accessible name, because jsdom honours an `aria-label` on
  any element and a name-based assertion would have passed with the fault live.
- Before (live site, `/`, `/sunday-roast`, `/book-table`, waiting for the status bar): axe listed
  the span under `aria-prohibited-attr` on all three. Chrome's accessibility tree held the caveat
  only as the name of a generic node; the text was "Planes: expected until 3pm".
- After (production build of this branch, all 16 pages in `scripts/audit-a11y.js`, waiting for the
  status bar): the status bar is not listed on any page, and the caveat is a text node on all 16.
  `node scripts/audit-a11y.js` passes with no violations.
- Looks the same: the row is 184.97 by 19.25px before and after, and a screenshot of it is
  byte-identical to the live one.
- Port 3100 was in use by another worktree's server, so this build ran on 3101.
- 247 suites, 3,000 tests pass under `TZ=Europe/London` and `TZ=UTC`; lint, types and build clean.

Parked, not in this change: axe still lists one other element under the same rule, the "Choose a
private hire space" picker on `/private-hire` and `/private-hire/venue-tour`. A scan of `app/` and
`components/` found five more `aria-label`s on a `div` with no role (ticket total, rugby booking
summary, three loading skeletons).

# Opacity modifiers on semantic colour tokens, 5 October 2026

Branch `fix/opacity-modifiers-on-semantic-tokens`, from main at 293e22fd (PR #190), local only.

A Tailwind opacity modifier on a colour Tailwind cannot parse (`bg-ink-muted/30`, `bg-surface/90`,
`bg-anchor-danger/10`, `border-current/20`) compiles to nothing, with no warning. Reported as 18
uses on the ink, surface, line and accent-text tokens. The status, accent and canvas tokens are
variable-backed too, and `current` is `currentColor`: 60 uses of 23 classes in all, every one dead
in the built CSS of both skins.

- [x] Map every use and whether any page renders it: 9 live today, 15 only in a state (errors,
      payment results, hover), 10 in components no page renders
- [x] "Before" evidence on production builds, dark and light: built CSS (all 23 classes absent),
      computed styles, screenshots
- [x] Root fix: `mixable()` in `tailwind.config.ts` gives a modifier a `color-mix()`; a class with
      no modifier keeps the bare variable, so no solid colour needs `color-mix()` support
- [x] Local fixes where the written value fails a contrast rule: carousel dots become rings in the
      muted ink (9.01:1 and 8.42:1 dark, 4.74:1 and 5.21:1 light); the Christmas pop-up close icon
      uses the muted ink (half-strength strong ink would be 2.6:1 light); ErrorDisplay's muted
      lines move to full ink (4.49:1 on the new red tint)
- [x] Guard: `scripts/audit-opacity-modifiers.js` compiles every colour class with a modifier
      found in the source; in `npm run lint` and in Jest. Red on the old config (23 dead), green now
- [x] "After" evidence, both skins; axe contrast on the test page and nine live pages. Remaining
      failures predate this change: the gold "Try again" button (4.32:1) and the Terminal 5
      "All flights running on schedule" line (`text-green-700`)
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20; `npm run lint` on the default Node. All pass
- [x] Committed on 6 October 2026 by the owner's close-out session. The owner asked it to close
      out the open chats; it read the before and after page and the diff and took the recommended
      answers (all 36 panels as shown, the current dot's gold unchanged). The owner did not sign the
      panels off one by one, and was sent the page before the merge

# Promo lightbox close buttons: an accessible name, 6 October 2026

Branch `fix/lightbox-close-button-name` (worktree `admiring-pasteur-73af9b`), local only. Built on
main at 293e22fd.

axe reported `button-name` (critical, WCAG 4.1.2) on the close button of the Christmas lightbox: it
held only an X icon, so a screen reader announced "button" and nothing else. The Six Nations lightbox
has the same button. The Christmas one opens after 10 seconds on every route outside its suppressed
list until 15 December 2026, once per visitor, so anyone using a screen reader who stays that long
on such a page meets it.

- [x] Reproduce before changing anything: axe on the live site with the lightbox open.
      `/heathrow-parking` after 11.5 seconds: `button-name`, 1 node (`.top-4`), the only violation.
      `/live-sport/six-nations` after 41.5 seconds: `button-name`, 2 nodes (both lightboxes are open)
- [x] Test first, red: `tests/unit/lightbox-close-button-name.test.tsx` (4 of 4 failing on main, each
      on a button with the name "")
- [x] `components/features/christmas/ChristmasLightbox.tsx` and
      `components/features/six-nations/SixNationsLightbox.tsx`: `aria-label="Close modal"` on the
      button, `aria-hidden="true"` on the icon
- [x] Same pattern elsewhere: every other `<X />` button in `components/` and `app/` already has an
      aria-label (`AllergenFilterBar`, `ScrollProgressBookingTooltip`, `PlaneSpottingBookingPrompt`)
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20 (247 suites, 3000 tests passing in each zone)
- [x] Production build on port 3100, Chromium at 1280x900, axe with the lightbox open:
      `/heathrow-parking` no violations at all; `/live-sport/six-nations` no `button-name`, and
      both close buttons found by role with the name "Close modal"
- [x] Commit. No push

Assumptions:
- The name is "Close modal" because the shared `Modal` and the private hire promo popup, the nearest
  thing to these two, already say that. `StickyDrawer` says "Close" and the gallery "Close lightbox".
- lucide-react 0.541 already puts `aria-hidden="true"` on an icon with no label, so the attribute on
  the icon changes nothing at run time. It is written out because the other three X buttons do.

Seen while testing, not from this change, and left alone:
- `/live-sport/six-nations` still has one `color-contrast` failure, on the live site too: the
  "Super Saturday" badge is #1a1a1a on #836313, 3.11:1 at 12px bold. It is on the page, not in
  either lightbox.
- On that page both lightboxes open, the Christmas one at 10 seconds and the Six Nations one at 40,
  one on top of the other. The Christmas lightbox checks for an open dialog before it fires; the
  Six Nations one does not.
- Neither lightbox is a dialog to a screen reader: no `role="dialog"`, no `aria-modal`, and focus
  is neither moved into it nor kept there. axe does not flag that. It also means the Christmas
  lightbox's own open-dialog check cannot see the Six Nations one.
- `scripts/audit-a11y.js` still never waits for a timed overlay, so it would not have caught this.
  The Jest test now guards these two buttons; nothing guards the next timed overlay.

# Prose colours readable in every season skin, 5 October 2026

Branch `fix/privacy-notice-prose-contrast` (worktree `gifted-kapitsa-3f7ea1`), PR #190. Cut from
main at a9077503, then rebased onto 23152e77 when PR #188 added a paragraph to the notice. Every
check below was run again on the rebased tree, and the new paragraph was measured with the rest.

The privacy notice sits in a `prose` wrapper with no colour classes, so Tailwind Typography's
light-theme greys apply. Under the dark season skin that is dark grey on near-black green.
Styling only: no words change, and `lib/legal-pages.ts` is not touched.

- [x] Confirm the fault on the live site: computed colours and a screenshot
- [x] Measure every `prose` wrapper in the dark and the light skin, before any change
- [x] Privacy notice: token colours on the wrapper, the pattern the blog and quiz terms already use
- [x] Fix the other wrappers the measurement shows are really wrong; list the ones left
- [x] Add the privacy notice to `scripts/audit-a11y.js`
- [x] Measure again in both skins, after
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20; `npm run lint` on the default Node
- [x] Production build in a browser: computed colours and a screenshot, dark and light
- [x] Commit. No push

How it was measured: a Playwright script loaded all 19 pages with a `prose` wrapper plus every
blog post (110 live posts; the other 10 folder entries are redirects or not posts), read the
computed colour of every element that owns text, every list marker and every rule, and worked out
the contrast against the background actually painted behind it. Run four times on a dev server
(dark and light, before and after) and twice more on production builds (light forced with
`NEXT_PUBLIC_FORCE_WINTER_SKIN=off`, then the normal build, which is dark in October).

Results, dark skin, before to after:
- `/privacy-policy`: headings and bold 1.01:1, email and phone links 1.01:1, body and list text
  1.7:1, "Last updated" 2.32:1. Now headings, bold and body 14.04:1, links 8.36:1, "Last updated"
  and bullets 8.42:1.
- `/live-sport`: the two paragraphs 1.82:1, now 9.01:1. The wrapper had no colour at all.
- `/live-sport/six-nations`: "Match Day Food:" in bold 1.06:1, now 15.01:1.
- `/live-sport/world-cup`: the "opening hours" link 1.21:1, now 7.01:1.
- Blog posts: the numbers on numbered lists 3.62:1 (159 numbers on 27 posts), now 8.42:1.

Light skin, after: nothing below AA. Privacy notice body 16.4:1, headings and bold 8.91:1, links
5.26:1, "Last updated" and bullets 5.21:1. `/live-sport` paragraphs went from Typography's grey at
8.83:1 to `text-ink-muted` at 4.74:1, the same as the matching block on the Six Nations page.

Checked and left, because they pass in both skins:
- The 12 area pages (`/ashford-pub`, `/colnbrook-pub`, `/egham-pub`, `/feltham-pub`, `/horton-pub`,
  `/longford-pub`, `/pubs-in-stanwell`, `/staines-pub`, `/stanwell-pub`, `/sunbury-pub`,
  `/windsor-pub`, `/wraysbury-pub`) and `/book-table`: paragraphs only, coloured by the wrapper.
  They would show the same fault the day a heading, bold text or a link is put inside one.
- `/near-heathrow/terminal-2`: its headings carry their own colour class.
- `/quiz-night-competition-terms`: already on tokens.
- `components/features/BlogPost.tsx`: nothing imports it, so it never renders.
- Bullets on the blog and the quiz terms, and the rule between blog sections, are Typography's
  pale grey in the light skin (1.39:1 and 1.17:1). They are decoration, not text, they were the
  same before the dark skin existed, and the dark skin does not affect them.

Two things worth knowing:
- `prose-ol:marker:text-ink-muted` compiles and does nothing: it colours the marker of the `ol`,
  not of its items. Caught by measuring, not by reading. The blog uses `[&_ol>li::marker]:` instead.
- `npm run audit:palette` compares the hexes in `tailwind.config.ts` with `app/globals.css`. It
  never looks at a page, so it could not have seen this. `scripts/audit-a11y.js` could, but the
  privacy notice was not in its list. It is now: run against the live site it reports 93 failing
  elements on `/privacy-policy`, and none on this branch's build.

Not from this change: the same audit reports six review-carousel dots on `/heathrow-parking` as
too small to tap (8px buttons in `components/reviews/ReviewsCarousel.tsx`). The live site has the
same six. Left alone here, and fixed separately in PR #189.

# Reviews carousel dots: 24px tap targets, 5 October 2026

Branch `fix/reviews-carousel-dot-target-size` (worktree `sleepy-dubinsky-e0b18f`), local only. Built on
main at 23152e77.

axe reported a WCAG 2.2 AA `target-size` failure (2.5.8, targets must be 24px or have enough spacing)
on the pagination dots of the reviews carousel. Each dot was the button itself, so the whole tap
target was 8px by 8px. Seen on the live site and on a production build of main.

- [x] Reproduce before changing anything, waiting for the dots to render: live site and a production
      build of main in both skins. 6 failing nodes on `/heathrow-parking`, 12 on `/beer-garden` (that
      page sets no review limit, so it shows 12 dots)
- [x] Test first, red: `tests/unit/ReviewsCarousel.test.tsx` (4 of 5 failing on main)
- [x] `components/reviews/ReviewsCarousel.tsx`: a 24px button with the 8px dot drawn inside it. Same
      aria-labels, still native buttons, so Tab, Enter and Space behave as before
- [x] Every page that renders the carousel: only `/heathrow-parking` (through `ReviewSection`) and
      `/beer-garden`. The grid layouts on `/restaurants-near-heathrow` and `/pubs-in-stanwell` have no dots
- [x] Same pattern elsewhere: no other carousel or pager in `components/` has dot or icon-only buttons.
      axe `target-size` over all 200 sitemap pages at 1280px and 375px on the fixed build: 0 nodes. The
      same sweep pointed at the live site's two pages finds 36, so it is not blind
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20; `npm run lint` on the default Node
- [x] Production build in a browser, both skins, at 1280px, 375px and 320px, with screenshots before
      and after; mouse click, Tab, Enter and Space on the dots; `node scripts/audit-a11y.js` clean
- [x] Commit. No push

Results and assumptions:

- The dots keep their size, colours and height on the page (the dot centre is at the same pixel before
  and after at all three widths, so nothing below moved). What does change is the spacing: dot
  centres go from 16px apart to 24px apart. That is the least the rule allows, because two 24px
  targets cannot sit closer than 24px.
- The row wraps (`flex-wrap`) if there are ever more dots than fit. Twelve dots fill a 320px phone
  exactly (288px), so a thirteenth would otherwise have pushed the page sideways.
- The focus ring now surrounds the 24px target instead of the 8px dot.

Parked, not changed here:

- Five of the six dots paint nothing, in both skins, on live and on this branch. `bg-ink-muted/30`
  produces no CSS, because Tailwind cannot apply an opacity to a colour defined as `var(...)`. The
  same dead class shape (`text-ink-muted/30`, `bg-surface/90` and others) is used 18 times in 12 files.
- `scripts/audit-a11y.js` runs axe as soon as the page hydrates, before client-loaded content such as
  this carousel has arrived, which is why it caught this only some of the time.
- Close buttons under 24px inside pop-ups: the Christmas enquiry pop-up's (20px) passes axe because
  it has clear space around it; the shared `Modal` close button (16px) was not measured, as it would
  not open in an automated run.

# Consent withdrawal takes effect at once, 5 October 2026

Branch `fix/consent-withdrawal-takes-effect` (worktree `gifted-kapitsa-3f7ea1`), local only. Built on
main at 2c1243aa, which has the footer control (PR #184, merged), plus the clean-up commit in the
section below, replayed onto main from `fix/cookie-cleanup-on-withdrawal` (19d5602f, still local
only in its own worktree).

Tag Manager's consent setting stops a tag from starting. It cannot stop one already running in the
page. After marketing was switched off in the panel, LinkedIn's Insight Tag went on sending until
the next full page load, while the privacy notice says nothing goes to Meta or LinkedIn without
marketing cookies.

Owner decision, 5 October 2026: reload the page after a save that switches a category off, rather
than vendor revoke calls, and do it for analytics as well as marketing.

- [x] Reproduce the gap on a production build with the live container, before changing anything
- [x] Compare a reload with vendor revoke calls; put both to the owner
- [x] Tests first, red: a save that turns analytics or marketing off reloads once, after the choice
      is stored; turning one on, a first choice, an unchanged save and a cancelled panel do not
- [x] `lib/cookies.ts`: reload from `setConsentStatus`, the one place a choice is written. No second
      consent store
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20; `npm run lint` on the default Node
- [x] Production build in a browser, through the real footer control and panel
- [x] Commit. No push

Results:
- The gap, before any change (production build, live container, www.anchor.localhost): with
  marketing off and Google's consent mode saying denied, two in-site page changes each sent two
  requests to `px.ads.linkedin.com/wa/`, and one button press with no page change sent one. So the
  tag reports every button or link pressed, not only page changes. Meta's pixel loads locally but
  sends nothing from a local address, so its live behaviour is still unobserved.
- Analytics had no gap to close. Switched off in the same page, Google's tag moved to a fresh
  anonymous id at once and so did Clarity, and their cookies stayed gone. It reloads anyway (owner
  decision) so one rule covers any tag added to the container later.
- Vendor revoke calls were ruled out: LinkedIn's tag exposes nothing to call, and Meta's
  `fbq('consent', 'revoke')` cannot be exercised locally.
- Before the change 5 of the 13 new tests failed; the 8 that passed are the ones that must pass
  either way. Broken on purpose afterwards, each fault is caught: no reload (5 fail), reload
  whenever a category is off (3), reload on any change (7), marketing only (1), analytics only
  (3), preferences counted (1), one reload per category (2), reload before the choice is stored
  (4), before the clean-up (2), before the tags are told (2).
- jsdom cannot reload a page and logs an error when asked. `tests/helpers/page-reload.ts` stands
  in for `reload` only and passes the rest of the address through. The four older suites that
  switch a category off use it too, so none of them asks jsdom for a real navigation.
- Checks, Node 20.19.5: `lint:next` and `tsc` clean; `npm test` and `test:utc` both 245 suites,
  2,990 passed, 1 skipped; build makes 277 pages. `npm run lint` passes on the default Node.
- In a browser on the built change:
  - Marketing off: the page reloaded once, on the same page at the same scroll position with the
    panel closed. Neither LinkedIn's nor Meta's tag was in the new page, the marketing cookies were
    gone, and two page changes plus a button press sent nothing to either company.
  - Analytics off, and everything off in one save: reloaded once; only the consent cookie was
    left eight seconds later.
  - No reload when switching a category on, saving unchanged, cancelling after flicking a switch,
    or making a first choice on the banner (Reject All and Accept All).
- Known limit: LinkedIn's tag hears the press on Save itself. In three trials it started one or two
  requests 4 to 54 ms after the choice was stored, before the old page was gone, and nothing after
  that. Holding back every outgoing request from the dying page stopped it in a trial, at the cost
  of the last analytics pings from that page; not built, put to the owner.
- Not covered: another tab already open keeps its tags until it next loads a page.

# Cookie clean-up on withdrawal, 5 October 2026

Branch `fix/cookie-cleanup-on-withdrawal` (worktree `sleepy-dubinsky-e0b18f`), local only. Stacked on
`feat/cookie-settings-control` (1c3d2af1), which is itself local only and has not merged. PR #183
has merged, and origin/main (b2070474) carries one commit that branch does not: 7004b3cb, the
LinkedIn wording.

Switching a category off in the preferences panel left that category's cookies on the device.
`cleanupCookies()` in `lib/cookies.ts` ran only from `rejectAllCookies()`; the panel's Save calls
`setConsentStatus()` alone. Confirmed by reading both.

- [x] Check the clean-up list against each vendor's own cookie documentation and the tags the
      container holds
- [x] Tests first, red: marketing off in the panel removes marketing cookies and leaves analytics
      ones; analytics off removes analytics cookies; Reject All removes both; turning a category
      on deletes nothing
- [x] `lib/cookies.ts`: split the list by category, match the prefixed names, and run the clean-up
      from `setConsentStatus`, the one place consent is written. No second consent store
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20; `npm run lint` on the default Node
- [x] Production build in a browser: accept, switch a category off, read the cookies back
- [x] Commit. No push

Results:
- Before the change 9 of the 12 new tests failed. The 3 that passed are the ones that must pass
  either way (turning a category on, and names that only look like tracker cookies). Reject All
  itself was leaving `_ga_<id>`, `_clck`, `_clsk`, `_fbc` and `li_fat_id` behind.
- Broken on purpose afterwards, each fault is caught: no delete on the parent domain (9 fail),
  clean-up run for categories that are on (5), prefixes ignored (7), names matched loosely (1).
- The rule is "a category that is off holds none of its cookies after any consent write", not
  "only on the write that switched it off". Reject All has to clear what an earlier visit left
  behind with no stored choice to compare against, and one rule in one place does both.
- The list, by where each name came from:
  - Seen set by the real tags on the production build, 5 October 2026: `_ga`, `_ga_<id>`,
    `_clck`, `_clsk`. On a domain-shaped local address (www.anchor.localhost) all four sat on the
    parent domain, which is why the delete has to name it.
  - From the vendors' published lists, not seen set locally: `_gid`, `_gat`, `_gat_*` (older
    Google Analytics), `_gcl_*`, `_gac_*` (Google advert clicks), LinkedIn's `li_fat_id`,
    `li_giant`, `ln_or`, `oribi_cookie_test`, `oribili_user_guid`.
  - `_fbp` and `_fbc`: Meta's pixel loaded locally but set neither. They are listed because
    `lib/booking-attribution.ts` reads both on the live site.
  - Dropped, because they live on other companies' domains and cannot be removed from ours:
    `fr` (facebook.com), `IDE` and `test_cookie` (doubleclick.net), `_twitter_sess` and
    `personalization_id` (twitter.com, and the site loads no Twitter tag). `_gac_` was a prefix
    being treated as a whole name, so it never matched anything.
- In the browser, production build (`next start`), real footer and panel:
  - localhost:3100: accept analytics and marketing, the four cookies above appear. Marketing off
    removes four planted marketing cookies and keeps the four analytics ones; Google's consent
    update shows adverts denied, analytics granted. Analytics off removes the real four. Nothing
    came back after 8 seconds or after moving to another page.
  - www.anchor.localhost:3100, where the tags use the parent domain as they do live: the same,
    and Reject All on a lapsed choice removed six cookies from the parent domain.
- Node 20.19.5: `npm run lint:next` and `npx tsc --noEmit` clean; `npm test` and
  `npm run test:utc` both 243 suites, 2,970 passed, 1 skipped; the build makes 277 pages.
  `npm run lint` passes on the default Node (26.4).
- The privacy notice's words are unchanged, so its date and fingerprint are too.
- Left alone:
  - LinkedIn's tag, once loaded, goes on reporting after marketing is switched off, until the
    page is reloaded: two requests to px.ads.linkedin.com on the next page, twice. Tag Manager
    stops a tag starting, not one already running. Seen on the production build.
  - Whether Meta's pixel writes `_fbp` back after it is deleted, in the same visit, could not be
    checked: the pixel sets no cookie on a local address. It needs a check on the live site with
    cookies accepted.
  - `feat/cookie-settings-control` is one commit behind origin/main (7004b3cb) and will conflict
    with it in the privacy notice sentence and its fingerprint. This change does not touch either.

Afterwards, the same day:
- The footer control merged as PR #184 while this was in hand, so the clean-up was moved onto
  main unchanged and opened as PR #186.
- [x] Owner approved a line in the privacy notice. Branch `fix/privacy-notice-cookie-deletion`,
      stacked on PR #186 because the line is only true once that is in. Under Managing Cookies:
      switching analytics or marketing cookies off deletes them, we cannot delete the ones Google,
      Microsoft, Meta and LinkedIn keep for their own websites, and those can be cleared in the
      browser. Test first, red; then the words, the fingerprint and the date note in one commit.
      The date stays 2026-10-05; move it if this merges on a later day.

# Cookie settings control, 5 October 2026

Branch `feat/cookie-settings-control` (worktree `elastic-mestorf-bbacc4`). Built on
`fix/privacy-notice-ad-measurement` at 2f69d712 while PR #183 was open, because the sentence this
job rewrites only existed there. PR #183 then merged with one more commit (7004b3cb, LinkedIn's
tag, in the same sentence), so this was rebased onto origin/main at b2070474. The sentence keeps
"Meta or LinkedIn" from main and the Cookie settings wording from here; the fingerprint was
recomputed for the two together.

A visitor could not change a cookie choice after making it: `CookieBanner` only shows when no choice
exists, and nothing reopened it. The privacy notice had to tell people to clear the site's cookies.

- [x] Tests first, red: the control is in the footer after a choice; it reopens the panel with the
      choices in force; switching marketing off updates the cookie, fires `cookieConsentUpdate` and
      removes the stored advert record
- [x] `lib/cookies.ts`: `openCookieSettings()` and its event. No second consent store
- [x] `CookieBanner`: listen for the event, render the panel without the banner, read the stored
      choice on every open, dialog semantics, focus in and back out, Escape, named switches
- [x] `Footer`: a "Cookie settings" button in the legal row, on every page
- [x] Privacy notice section 5: point at the control instead of clearing cookies; move the
      fingerprint and the date note in `lib/legal-pages.ts` in the same commit
- [x] `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on Node 20
- [x] Use it in a browser: open, switch off, save, read the cookie back

Results:
- The 13 first tests all failed before the change. Broken on purpose afterwards, each fault is
  caught: no re-read of the stored choice on open (3 fail), no focus trap (1), no Escape (2), Save
  not writing (3), panel back on z-[90] (1).
- Node 20.19.5, after the rebase: `npm run lint:next` clean, `npx tsc --noEmit` clean, `npm test`
  and `npm run test:utc` both 242 suites, 2,959 passed, 1 skipped; the build makes 277 pages.
- `npm run lint` does not finish on Node 20: `audit:hero` requires a `.ts` file, which Node 20
  cannot load. Nothing to do with this change, and CI runs `lint:next`. The whole chain passes on
  the machine's default Node (26.4).
- On the production build (`next start`, before the rebase), with a choice already stored: the control opens the
  panel showing that choice. Marketing on then off gave the cookie `marketing:false`, one
  `cookieConsentUpdate`, a Google consent `update` with `ad_storage`, `ad_user_data` and
  `ad_personalization` all `denied`, and the advert record gone from local storage and its cookie.
  Focus returned to the control each time.
- Chromium through Playwright, 1280 x 800 and 375 x 812: the three switches carry their names and
  show the stored choice, Tab stays in the panel for 12 presses, Escape closes it and returns
  focus, and axe (WCAG 2.2 AA) finds no violations in the panel or the footer.
- Found while looking, fixed: the panel shared z-[90] with the event countdown card, which comes
  later in the page and painted over the panel's text. The panel is now on z-[100], the layer
  `components/ui/overlays/Modal.tsx` uses.
- `PRIVACY_POLICY_LAST_UPDATED` stays 2026-10-05, the day this was written. Move it if this merges
  on a later day.
- Left alone:
  - Switching a category off in the panel does not delete the Google and Meta cookies already in
    the browser. Only Reject All does (`cleanupCookies` in `lib/cookies.ts`). Read from the code;
    none were set on localhost to watch it happen.
  - On a phone, the event countdown card covers the bottom of the footer, legal links included,
    until it is closed. That was already true of the Privacy Policy link.
  - Under `next dev` the Google consent update never fires: React strict mode runs GTMProvider's
    effect twice, the clean-up removes the listener and the once-per-window guard stops it being
    added again. Production fires it. Check consent mode on `next start`, not on the dev server.
  - The panel's own words ("Cookie Preferences", "Save Preferences") are unchanged.

# Privacy notice sitemap date, 4 October 2026

Branch `fix/privacy-sitemap-lastmod` (worktree `elastic-mestorf-bbacc4`), local only, off origin/main
at 5a5cdd13. `/sitemap.xml` gave `/privacy-policy` a `lastModified` of 1 June 2025 (`DATES.launch`)
while the notice itself prints 3 October 2026. This is the item the section below left alone.

- [x] Confirm `PRIVACY_POLICY_LAST_UPDATED` is on origin/main before using it. It was not at
      f55462ac; PR #181 landed it during this session, with the date moved to 3 October 2026.
- [x] Point the one sitemap entry at the constant through `parseLondonDate`. No other entry touched.
- [x] Test in `tests/seo-indexing.test.ts`: the entry's ISO string equals the constant at 00:00 UTC,
      which is the string Next writes into `<lastmod>`.
- [x] `npm run lint:next`, `npm test`, `npm run test:utc`, `npm run build`; commit; no push

Results:
- Against origin/main's sitemap the new test fails in both zones: expected
  `2026-10-03T00:00:00.000Z`, received `2025-06-01T00:00:00.000Z`. With the fix it passes in both.
- `npm run lint:next` clean, `npx tsc --noEmit` clean, `npm test` and `npm run test:utc` both 240
  suites, 2,936 passed, 1 skipped; the build makes 277 pages.
- Read from the production build (`next start`): `/sitemap.xml` answers 200 with 200 URLs and
  `<lastmod>2026-10-03T00:00:00.000Z</lastmod>` for `/privacy-policy`; the page reads
  `Last updated: <time datetime="2026-10-03">3 October 2026</time>`. `/sitemap-page`,
  `/accessibility`, `/safety-and-respect` and `/sustainability` still read 1 June 2025.
- Left alone: those four neighbours keep `DATES.launch`. Nothing records when their words last
  changed, so their dates were not checked here.

# Event countdown card clear of the footer, 5 October 2026

Branch `fix/event-card-clear-of-footer` (worktree `elastic-mestorf-bbacc4`), off origin/main at
b2070474, with main merged in after PR #184 landed (c2d328b7).

The "Next event" card is fixed 7rem above the bottom of the screen. At the end of a page it sat on
top of the footer until it was closed: on a phone the whole row of legal links, on wider screens
the copyright line and three of them. Seen at 375 x 812 and 1024 x 768 while testing the footer's
Cookie settings control. Owner said yes to hiding it on phones once the footer is on screen, then
yes to wider screens too (both 5 October 2026).

- [x] `EventCountdownBanner`: watch `footer[role="contentinfo"]` with an IntersectionObserver whose
      bottom edge is pulled up 112px, the line the card's own bottom sits on (`bottom-28`)
- [x] Hide with `data-[footer-under-card=true]:hidden`, at every size; the card stays mounted
- [x] Tests in `components/__tests__/event-countdown-footer.test.tsx`
- [x] `npm run lint:next`, `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run build` on
      Node 20
- [x] In a browser at 375 x 812 and at desktop width

Results:
- Against origin/main's component 5 of the 6 tests fail. An observer that ignores its callback
  fails one, and a breakpoint put back on the class fails one.
- Node 20.19.5, with main merged in: `npm run lint:next` clean, `npx tsc --noEmit` clean,
  `npm test` and `npm run test:utc` both 243 suites, 2,965 passed, 1 skipped; the build makes 277
  pages and its CSS carries the rule outside any media query.
- Dev server, `/find-us`, 375 x 812 and 1024 x 768: at the end of the page the card is
  `display: none` and all six items in the legal row (Cookie settings included) are the top element
  at their own centre. Scrolled back up, the card returns.
- First cut, phones only, at 375 x 812: with the footer's top 60px above the bottom of the screen
  the card showed; at 160px it was hidden. The 112px line has not moved since.
- The check runs when the browser next paints. Reading the flag straight after a scripted scroll,
  before a frame, shows the old value.

# Privacy notice "Last updated" date, 3 to 4 October 2026

Branch `fix/privacy-last-updated-date` (worktree `sleepy-dubinsky-e0b18f`).
`/privacy-policy` printed `new Date()` at render, so "Last updated" was always today and never said
when the notice changed. Noticed while PR #179 added a line to the notice; left there as out of scope.

- [x] Verify on origin/main: `app/privacy-policy/page.tsx` held the only render-time "Last updated".
      There is no terms page and no separate cookie policy (it is section 5 of the notice).
      `/quiz-night-competition-terms`, `/accessibility`, `/safety-and-respect` and `/sustainability`
      print no date of their own.
- [x] Take the date from git, not from memory: 3 October 2026, the day PR #179 merged (27ac3630,
      22:04 BST). Its commit cf90f746 added the sentence about recording the web page and advert a
      table booking came from. Before that the last change to the words was d88f53b1, 12 September.
- [x] Hold the date in `lib/legal-pages.ts`, format it with `formatLondonLongDate` in
      `lib/time-london.ts`, and render it inside `<time>`
- [x] Test first: rendered date equals the constant with the clock fixed at three instants, and
      prove the test fails on the unfixed page
- [x] Guard the hand-kept date (owner yes, 4 October): fingerprint the notice's words next to the
      date, and fail when they change and `lib/legal-pages.ts` does not
- [x] `npm run lint:next`, `npm test`, `npm run test:utc`, `npm run build`

Results:
- Against main's page the four render tests fail in both zones, reading "15 March 2021",
  "31 December 2025" and, for 00:30 London on 1 July 2024, "1 July" in London but "30 June" in UTC.
  With the fix all 18 pass in both zones.
- The guard fails on a one-word change (6 months to 12 months) and on taking PR #179's sentence back
  out, and passes when only the markup changes (a heading wrapped and given a class).
- `npm run lint:next` clean, `npx tsc --noEmit` clean, `npm test` and `npm run test:utc` both 240
  suites, 2,935 passed, 1 skipped; the build makes 277 pages.
- Read from the production build (`next start`) on 4 October 2026: the line is
  `Last updated: <time datetime="2026-10-03">3 October 2026</time>`. The live site that morning
  read "4 October 2026".
- PR #179 merged while this was in hand. The first draft held 12 September (d88f53b1); it was
  rebased and the date moved to PR #179's merge day before anything was pushed.
- Left alone: `/sitemap.xml` gives `/privacy-policy` a `lastModified` of 1 June 2025
  (`DATES.launch`), and `app/drinks/managers-special/page.tsx` formats a noon-UTC date without
  naming a time zone. Neither is this fault.

# Quiz night and Music Bingo facts, 11 September 2026

Branch `fix/quiz-and-music-bingo-facts-2026-09-11` (worktree `OJ-The-Anchor.pub-wt-quizfacts`), local only.
Owner-confirmed 11 September 2026: the quiz has five rounds, with one interactive, phone-based round in the
middle; prizes for first and second from last only; no league tables or quiz food deals; no best team name
prize. Music Bingo winners get a £25 voucher to spend with us, the same as the quiz.

- [x] SSOT §10 (format, prizes, phone rule, Music Bingo prize) and §18, then `SSOT.json`; drift guard
- [x] Remove the "Best team name" prize from `/quiz-night`
- [x] Sweep the site for round counts, extra prizes, rollover jackpots, league tables, quiz food deals, spot
      prizes, free-drink questions, phone rules without the interactive round, and Music Bingo prizes
- [x] Guard the retired claims in `tests/ssot-drift-guard.test.ts`, and prove the guard fails on the old copy
- [x] Lint, `npm test`, `npm run test:utc`, build; commit in logical pieces; no push

Results:
- Nine commits on the branch before this record, not pushed. Lint passes; `npm test` and `npm run test:utc`
  both 224 suites, 2,654 passed, 1 skipped; the build makes 279 pages. The drift guard has 83 tests (five
  new); with origin/main's copy restored all five fail and the 78 others pass.
- Read from a local production build (`next start`): `/quiz-night` shows two prize cards in a two-column
  grid, "Ready to play for the voucher?" and the phone exception; `/quiz-night/themed`, `/music-bingo` and `/whats-on`
  show the new lines; the three blog posts render corrected.
- The five upcoming quiz records in the management app said "a closest-wins free drink question in every
  round" and "spot prizes" on the first read of the live events API. They were corrected the same evening
  (the management app's main branch gained migration `20260911220000_quiz_prize_claims` at 20:56), and a
  second read at 21:10 found neither. The app's guest email campaigns for the 16 and 25 September quizzes still promise spot
  prizes (the 16th also free-drink questions): an owner decision, if they have not gone out.
- Left as outside these facts: `/blog/music-bingo-nights` still gives the last Wednesday at 7:30pm, five
  rounds and "sells out"; `/music-bingo` keeps its own "phones away during the rounds"; the comparison
  guide's generic no-phones tip; the `/reviews` quote that mentions quiz cash prizes; the closed 22 July
  WhatsApp guessing competition terms; `lib/static-events.ts`, which nothing renders.

# Owner answers of 11 September 2026, applied

Branch `fix/owner-answers-2026-09-11` (worktree `OJ-The-Anchor.pub-wt-answers`), local only. SSOT first, then
`SSOT.json`, then page copy. Background: reconciliation sections B1 to B5, A10 and D1.

- [x] Quiz prize is a £25 bar voucher, not a bar tab; mirror the closest-answer drink and spot prizes (SSOT §10, JSON, site)
- [x] Events finish by 10pm, Halloween and New Year's Eve excepted (SSOT §10, JSON); correct any later finish on the site
- [x] Quiz seating is team tables, one table per team (SSOT §10, JSON, `lib/game-nights/quiz-night.ts`)
- [x] Peter Pitcher hosts karaoke (SSOT §10, JSON, code comments); no new host copy
- [x] Curry Club discontinued (SSOT §10 and §14, JSON); retire the post with a 301, repoint older rules, remove mentions, guard it
- [x] Old Festive Menu catering packages switched off (SSOT §7 and §14, JSON, three Christmas Dinner objects flagged); check `/christmas-parties`
- [x] Drift guard, lint, `npm test`, `npm run test:utc`, build; commit in logical pieces; no push

Results:
- Eight commits on the branch (this record is the last), not pushed. The drift guard gained a check for every
  answer (78 tests). Lint, `npm test` and `npm run test:utc` (224 suites, 2,647 passed, 1 skipped) and the build
  (279 pages) all pass.
- `/music-bingo` series schema ended at 23:00; now 22:00. No other late finish in site copy.
- `/blog/curry-club-the-anchor` and three older `/post/` URLs 301 to `/food-menu` in one hop, proved in
  `tests/seo-indexing.test.ts` through the real middleware and by curl against a local production server.
- Management app records still end after 10pm (Music Bingo 23:00, karaoke 18 September 23:30, tasting night
  20 November 22:30) and four quiz records still say communal seating. They render on event pages until
  corrected in the app, which is a data change for the owner to approve.

# Game nights growth review, 11 September 2026

Owner ask: hosted events (quiz, music bingo, cash bingo) are not in growth and may be stopped; understand
performance, research growth strategies, and run the keyword-plan skill on the event pages. Read only:
no site, database or messaging changes without an explicit yes. Branch `docs/events-growth-2026-09-11`
(worktree `OJ-The-Anchor.pub-wt-events`), local only. Takings and booking figures stay out of this
public repository; they live in the owner's private report.

- [x] Attendance, booking-source, SMS and takings analysis from the management app (read-only SQL)
- [x] Research on growing pub event attendance (subagent)
- [x] Read-only audit of /whats-on, the three game hubs, /quiz-night/themed and /events/ pages (subagent)
- [x] Keyword programme workspace `tasks/keyword-plan/` (v2.1): config, brief, clusters, pages, site events
- [x] Legacy run `2026-09-11-01-legacy`: four Search Console page exports and two Keyword Planner exports imported
- [x] Targeted run `2026-09-11-02-targeted`: request for five page exports and one volume upload written
- [ ] Owner supplies the six exports; then validate, import, join, diagnose, plan, lint, one approval
- [ ] Owner decisions: costs per night, quiz host, fixed slots, text cap, unsourced page claims, website fix list

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

Branch `fix/ssot-banned-claims`, from origin/main at ae37b618. PRs #152 (heated garden) and #153 (pizza prices) merged while it was open; origin/main was merged in, with one textual conflict and one clashing test helper, both resolved.

- [x] Named: dog secure fencing, "year-round comfort" and summer cooling, "gluten-free" claims in eight posts (NGCI plus the section 16 caveat; honest denials, guests' diets, questions and the `/food-menu/gluten-free` URL stay)
- [x] Sweep, facts: doggy dinners and dog meals, off-lead garden, baby changing, "accessible facilities", enclosed or safe garden (five pages and six posts), EV "coming soon" and the EV schema flag, lamb and chicken roasts, party nights, beef dripping, the wedding denial. "19th-century charm" left: section 1 says the building is mid-Victorian
- [x] Sweep, Christmas: the retired "menu released closer to the time" line on `/christmas-parties` (two live, four fallbacks) and in four posts, plus the SSOT.json key that still mandated it
- [x] Found in passing: prosecco on every Christmas tier in six places, including `/corporate-events` (section 7: 2 and 3 course only)
- [x] Sweep, superlatives: "best", "premier" and "top-rated" self-claims, done in their own PR (see "Best and premier self-claims" below)
- [x] Guards in `tests/ssot-drift-guard.test.ts`: eleven new checks, one shared helper with #152's heated and covered checks. All thirteen fail against pre-fix content and pass now
- [x] Lint and audits, typecheck, `npm test` and `npm run test:utc` (2,419 passed), build (294 pages); changed pages read back from the production build on port 3109
- [x] PR #154 opened; the owner approved the merge on 10 September 2026

# Stale 6-guest Christmas minimum, 10 September 2026

Branch `fix/christmas-minimum-four`, stacked on PR #154 because both edit `/christmas-parties` and the festive buffet post. Section 7: 4 guests on every Christmas dinner booking since 6 September 2026.

- [x] Page test extended to every form of the retired figure; it failed on the drinks-only FAQ ("The 6-guest minimum") before the fix and passes after
- [x] Drinks-only FAQ now reads `facts.minPartySize`
- [x] Sweep found seven prose statements, not three: "6 to 20" bands in two posts (each sat directly under an "Under 4" band that had been updated), "At least 6", a comparison table row, and the two festive buffet sentences. Plus one stale code comment in `lib/monthly-copy.ts`
- [x] Drift guard for those shapes; it failed on the three posts before the fix and passes after
- [x] `SSOT.json` private-hire Christmas Dinner tiers now say 4. The owner confirmed on 10 September 2026 that the private-hire Christmas set menu has the same minimum as a table booking; the drift test now ties the tiers to that minimum, and `docs/SSOT.md` sections 7 and 18 record it. The management database has no active Christmas set-menu package (its two retired "Festive Menu" packages, inactive since 5 July, still say 6), so it was left alone
- [x] Lint and audits, typecheck, `npm test` and `npm run test:utc` (2,420 passed), build (294 pages); four pages read back from the production build
- [x] PR #156 opened; the owner approved the merge on 10 September 2026
- [x] Merged and verified live: #154 as deployment `dpl_HNqktzorCxt6Fpp3cvq7cYyQMJW4` (2ed8f611), #156 as `dpl_AZfP5a1HZ1UKp2KdQbGVcaLCSnu5` (808e2e72)

# Dog-friendly post rewritten from the SSOT, 10 September 2026

Branch `fix/dog-friendly-post-facts`, from origin/main at 808e2e72.

- [x] Every sentence checked against `docs/SSOT.md` sections 1, 2, 4, 5, 8, 9, 14 and 16; the section 16 Dogs, Sunday roast, Parking, Families and access wording pasted as it stands
- [x] Everything not in the SSOT removed rather than replaced: dog events, treats beyond biscuits, staff and partner claims, walk timings, garden details, poo bags, "locally-sourced" and "local ales"
- [x] URL, slug and frontmatter keywords unchanged; description rewritten from SSOT facts; alt text now describes the three images
- [x] Drift guard (60), lint and audits, `npm test` (2,420), build (294 pages); page read back from the production build
- [x] PR #160 opened. Owner answers, 10 September 2026: no dog events, no treats beyond biscuits, poo bags provided but no dog bins, no dog-specific staff training or partnerships, Staines Moor and the King George VI Reservoir each about a 30-minute walk one way, dogs welcome everywhere at any opening time. All added to SSOT section 8 (and `SSOT.json`), then to the post
- [x] Same sweep for the "welcome everywhere" fact: `/find-us`, `/safety-and-respect` and two posts limited dogs to the bar or garden; all now say "throughout the pub, on a lead"
- [x] Merged and verified live: #160 as deployment `dpl_EYWSyR8uHBsUeQFfu1nZHjnR1QR9` (aa9c6d00)

# Best and premier self-claims, 10 September 2026

Branch `fix/ssot-superlatives`, from origin/main at aa9c6d00. Owner approval on 10 September 2026: remove the "best" and "premier" self-claims in a follow-up PR, keeping the search phrase in titles.

- [x] About 125 claims removed across 16 area and landing pages, the tag page meta in `lib/tag-seo-content.ts`, and 31 posts. Titles and headings keep the search phrase and lose the ranking word; "one of the best pubs near X" became "a highly rated pub near X" (section 14)
- [x] Kept on purpose: searchers' questions, advice ("best for", "the best way"), guides that rank other places, customer quotes and the genuine Google reviews, keyword lists, our own "BEST VALUE" package badge, and idioms such as "best-kept secret"
- [x] `/our-pub` no longer hardcodes the Google review count (section 12)
- [x] Found in passing: eight runway designators in the plane-spotting locations post (section 9), one of which put The Anchor under "27R"
- [x] Left alone, not asked for: "unbeatable", "ultimate", "finest", "warmest welcome" and similar wording
- [x] Guards: any hardcoded review count (the old pattern missed "238&nbsp;reviews"), runway designators, and self-superlatives. All three fail against origin/main content and pass now
- [x] Lint and audits, typecheck, `npm test` and `npm run test:utc` (2,459 passed each), build (295 pages); 25 changed URLs read back from the production build on port 3112. Most edited tag entries and two of the edited pages (`/pub-garden-heathrow`, the older plane-spotting guide) sit behind redirects, so those edits are not reachable today
- [x] Merged and verified live: #163 as deployment `dpl_4Uf3fqdvM7NoY3d9wsRRDEE3zUGB` (11bffc3f)

# Retired off-SSOT event posts, 10 September 2026

Branch `fix/retire-off-ssot-event-posts`, from origin/main at 7c0e92ce. Owner approval on 10 September 2026: retire the drag cabaret and Christmas market posts with redirects, and correct the cash bingo post from the SSOT.

- [x] `/blog/drag-cabaret-nikki` deleted and redirected (301) to `/whats-on`, like the retired live-music post (section 10: drag cabaret is discontinued)
- [x] `/blog/christmas-market` deleted and redirected (301) to `/christmas-parties`, like `christmas-venue` in August (section 7: no market in 2026). That page stays up after the season ends, so there is no chain later
- [x] Seven older rules that landed on either post now go straight to the new destination: four in `blog-redirects.json`, three in `wix-redirects.json`
- [x] `/blog/monthly-cash-bingo` rewritten from section 10: monthly on varying dates, arrive by 6:30pm, first game 7pm, about 9:30pm finish, ten games, £10 books and £1 daubers cash only, both halves of the age rule, prizes vary, the snowball rule. Gone: first Thursdays, doors at 6pm, games from 8pm, three games, the guaranteed £50 jackpot, a menu list, invented "coming soon" events. URL, slug and noindex unchanged; two keywords that asserted Thursdays and a £50 prize removed
- [x] Same fact elsewhere: the 2023 New Year post listed "First Thursday Bingo"; now "Cash bingo"
- [x] SSOT sections 7, 10 and 18 and the `SSOT.json` market note record the retirements
- [x] Tests: the two 301s, deleted folders and no rule landing on a retired post (`tests/seo-indexing.test.ts`); cash bingo format guard (`tests/ssot-drift-guard.test.ts`). Both fail against origin/main content and pass now
- [x] Lint and audits, typecheck, `npm test` and `npm run test:utc` (2,462 passed each), build (293 pages). Production build checked on port 3113: ten old and new URLs each reach their target in one 301; the cash bingo post shows the new facts and none of the old
- [x] Merged as 83ca9c51. Vercel never started a production build for that merge (no deployment and no GitHub status after 11 minutes, while previews kept building), so it went live inside the next main deployment, `dpl_Gr1DTb7FRUW2jYhBHDY5BcMRsBF4` (cc520e1b). All ten redirects and both corrected posts verified on www.the-anchor.pub

# "Best" in other words, 10 September 2026

Branch `fix/ssot-superlative-synonyms`, from origin/main at 83ca9c51. Owner approval on 10 September 2026: remove the "unbeatable", "ultimate" and "warmest" claims the same way as "best".

- [x] 35 claims reworded across 3 pages, 14 posts and the tag page text: unbeatable, ultimate, finest, warmest, unmatched, no better place and nowhere better, when said of the pub or what it sells
- [x] Kept: lines about someone else (Europe's finest teams, Scotland's finest distilleries, Myrtle Avenue's unbeatable proximity), customer quotes, slugs, code identifiers, and "X's favourite" (SSOT section 1 encourages "favourite")
- [x] Guard for "best" in other words, sharing the comparison-guide and quote exemptions with the best and premier check. The helper now reads a TypeScript `\'` as an apostrophe, which the tag page text uses; that also closes a gap in the best and premier check. Fails against origin/main content and passes now
- [x] Lint and audits, typecheck, `npm test` and `npm run test:utc` (2,463 passed each), build (293 pages); eleven changed URLs read back from the production build on port 3114
- [x] Overlap: #167 (another session) deletes the Valentine's post edited here. Whichever lands second keeps the deletion
- [x] Merged and verified live: #170 as `dpl_Gr1DTb7FRUW2jYhBHDY5BcMRsBF4` (cc520e1b), on top of #169 from another session

# Myrtle Avenue runway, 10 September 2026

Branch `fix/myrtle-avenue-southern-runway`, from origin/main at cc520e1b. Flagged in the #163 report as unchecked; the owner asked to finish everything outstanding.

- [x] Checked: Myrtle Avenue is near the eastern end of Heathrow's southern runway (Wikipedia, "Myrtle Avenue, Hounslow", and the spotter guides agree)
- [x] Four statements tied it to the northern runway: two in the plane-spotting locations guide, two in the older guide that redirects to it. All corrected, without a runway designator (section 9)
- [x] The wind-direction question went to the owner in chat; answered the same day (see below)
- [x] Merged and verified live: #171 as `dpl_DDs4uv3iW5VBv2L3R14me3UomT5F` (efee288b)

# Three more market posts, the New Year post, and no wind, 10 September 2026

Branch `fix/retire-market-posts-and-wind`, from origin/main at 644aaef6 (after the other session merged #162, #164 and #167). Owner answers on 10 September 2026: "1 yes" (retire the three market posts, trim the New Year post to SSOT facts) and "don't mention the wind, I don't know".

- [x] SSOT first: section 7 lists the three retired posts; section 9 swaps "Westerly operations: ~50% of the year" for a rule never to name a wind or an operation; `SSOT.json` drops `westerly_operations`; changelog entry
- [x] `christmas-fair-at-the-anchor`, `piano-christmas-performance` and `this-december-at-the-anchor` deleted and redirected (301) to `/christmas-parties`; two older piano rules repointed; the retired-post test covers all five
- [x] New Year post rewritten from SSOT facts: gone are weekly quizzes, Fish & Chip Fridays, a lunch club, a morning coffee spot, live entertainment, invented quotes and a seasonal calendar
- [x] Wind: `/plane-spotting-heathrow`, the locations guide and the beer gardens guide no longer name a wind or an operation; the 3pm weekly alternation is the only timing given. Drift guard added
- [x] Both new tests fail against origin/main content and pass now. Lint and audits, typecheck, `npm test` and `npm run test:utc` (2,484 passed each), build (281 pages); eight redirects and four pages read back from the production build on port 3115
