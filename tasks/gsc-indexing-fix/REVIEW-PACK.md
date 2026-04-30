# GSC Indexing — Third-Party Review Pack

**Prepared:** 2026-04-30
**Critical review added:** 2026-04-30
**Repo:** `OJ-The-Anchor.pub` (Next.js 14 marketing/booking site for The Anchor pub, Stanwell Moor)
**Last code change for this work:** commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) on `main`
**GSC export consumed:** eight sibling folders under `temp/GSC Errors/`, from `the-anchor.pub-Coverage-Drilldown-2026-04-30/` through `the-anchor.pub-Coverage-Drilldown-2026-04-30 (7)/` — exported 2026-04-29

This pack is for an external reviewer. Everything here is intended to stand alone — links to source files, line numbers, dates, and confidence levels are included so the reviewer can independently verify each claim.

The Anchor's website indexing problems are not new. Prior attempts (see §2) have made progress but left some categories stuck. This document covers the full picture, what just shipped, what's still open, and where I'm uncertain.

---

## 0. Critical reviewer verdict

This review pack is useful as an audit trail, but the approach is still too optimistic for a problem that has already survived multiple fix attempts. The developer should **not** treat commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) as "done" until the recommendations in this section are implemented and verified against production.

The main weaknesses are:

- It relies too heavily on "wait for Google to re-crawl" where the data already points to actionable redirect-chain and lifecycle problems.
- It proves local build output, but not production. A live spot check on 2026-04-30 still showed `Disallow: /*?dpl=*` in `https://www.the-anchor.pub/robots.txt`, so the robots fix must be verified after the actual deployment/cache state is correct before any GSC validation is started.
- It collapses materially different cohorts into "content quality". The 116 "Crawled - currently not indexed" URLs include content pages, legacy URLs, generated `opengraph-image` PNG routes, `/events/*/book` redirect sources, UTM variants, and two `_next/static` CSS URLs. Those need different handling.
- It uses some manual/counting logic that is easy to get wrong. The raw GSC CSVs contain quoted URL fields with embedded line breaks, so scripts must parse CSV properly rather than splitting on newlines.
- It says the legacy image URL "cannot fix from code". That is too strong. It is not referenced in the repo, so it may be safe to leave as a 404, but the site owner still controls the URL and could return a 301/410 if evidence shows Google or users keep hitting it.

### 0.1 Required changes before this work is accepted

| Priority | Required change | Why this is non-negotiable |
|---|---|---|
| P0 | **Prove production first.** Fetch live `robots.txt`, representative CSS with `?dpl=`, `/hr`, `/drinks/baby-guinness`, every 404 sample pattern, and all 7 redirect-error URLs with redirects followed manually. Paste the evidence into this pack. | GSC will validate the live site, not `.next/`. Local build verification is insufficient. |
| P0 | **Investigate the 7 "Redirect error" URLs now, not after another re-crawl.** Flatten apex/tag redirects to a single hop where possible and add a redirect-chain regression test. | Google defines "Redirect error" as a redirect chain that is too long, a loop, a URL that exceeds max length, or a bad/empty redirect URL. This is not the same as "Page with redirect" and should not be parked as stale. |
| P0 | **Replace blanket "redirect to `/` or `/whats-on`" decisions with a URL lifecycle policy.** Redirect only when there is a close replacement; otherwise return a real 404/410 with a useful page. | Google recommends 404/410 when removed content has no similar replacement. Irrelevant redirects can create soft-404 style outcomes and hide bad URL hygiene. |
| P1 | **Add an audit script that parses the GSC CSVs correctly and classifies URLs deterministically.** Commit the script or add it under `tasks/gsc-indexing-fix/`. | This job has too many moving parts for manual counting. The current pack is correct on total rows only if the CSV is parsed properly. |
| P1 | **Add CI/regression checks for sitemap, redirects, robots, and headers.** At minimum: sitemap URLs must not be redirect sources, `robots.txt` must allow `/_next/static/` and not disallow `?dpl=`, generated static assets must keep `X-Robots-Tag`, and redirect chains must end in one hop where practical. | The same classes of mistakes have recurred across several commits. They need automated guards. |
| P1 | **Reclassify "Crawled - currently not indexed" before assigning content work.** Separate non-page assets, redirects, legacy URLs, UTM variants, thin tag pages, and real content candidates. | Only the last two are content-quality tasks. Treating the whole cohort as content quality wastes effort and misses technical cleanup. |
| P1 | **Do not robots-block `opengraph-image` routes.** Keep them crawlable and controlled by `X-Robots-Tag: noindex, nofollow, noimageindex`. | Prior reviews correctly warned that blocking these in robots can break social previews. Google also needs to crawl a URL to see `X-Robots-Tag`. |

### 0.2 Concrete implementation checklist

The developer should add or update the following before asking for sign-off:

1. `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs`: parse every `Table.csv` with a real CSV parser, output issue counts, cohort counts, and URL lists for redirect errors, static assets, OG images, legacy URLs, and true content candidates.
2. `tests/api/seo-indexing.test.ts` or equivalent: assert generated `robots.txt` does not block `/_next/static/*?dpl=*`, sitemap URLs are canonical 200 URLs, and sitemap URLs are not redirect sources.
3. A redirect-chain test fixture using the 7-row Redirect error CSV and the 30-row 404 CSV. The test should fail on loops, empty `Location`, non-200 final targets, and avoidable multi-hop chains.
4. A production-verification log in this document with timestamped results for live `robots.txt`, sample CSS, 404 samples, redirect-error samples, `/drinks/baby-guinness`, `/hr`, and one `opengraph-image` URL.
5. A short event lifecycle policy in `tasks/gsc-indexing-fix/` explaining when an event URL redirects, returns 404/410, stays indexable, or becomes `noindex`.

### 0.3 External guidance checked

Recommendations above were cross-checked against official Google documentation:

- Google's robots parser uses the most specific matching rule, and conflicting rules are resolved by specificity/least-restrictive behavior: <https://developers.google.com/search/reference/robots_txt>.
- Important CSS/JS/image resources should be crawlable so Google can render pages correctly: <https://developers.google.com/search/docs/fundamentals/get-started>.
- `noindex` and `X-Robots-Tag` only work when Google can crawl the URL; `X-Robots-Tag` is appropriate for non-HTML resources: <https://developers.google.com/search/docs/crawling-indexing/block-indexing>.
- Google describes "Redirect error" as long chains, loops, too-long URLs, or bad/empty redirect URLs: <https://support.google.com/webmasters/answer/7440203?hl=en-GB>.
- Sitemaps should contain the canonical URLs you want shown in search; sitemap inclusion is a canonical signal, not a guarantee of indexing: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=en>.
- If removed content has no similar replacement, return 404 or 410 rather than redirecting to an unrelated page: <https://developers.google.com/search/docs/advanced/crawling/http-network-errors>.

---

## 1. Executive summary (plain English)

Google Search Console exported 596 URLs across 8 indexing-status categories on 2026-04-29.

Of those 596:

- **A large share** are Google reporting redirects, canonical tags, intentional `noindex`, or stale historical state. They still need live spot checks and sitemap/internal-link checks before being closed as "no code change needed."
- **4 real, actionable issues** in code were addressed today and pushed to `main` ([`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6)). They should not be called resolved until production responses match the intended behavior and Google re-crawls.
- **3 items are not fully resolved, and the previous action plan was too passive.** The 7 "Redirect error" URLs should be investigated now, the legacy image URL should be verified with referring-link/log evidence before being dismissed, and the 116 "Crawled - currently not indexed" URLs must be split into technical/non-page/content cohorts before anyone writes more copy.

Honest assessment of confidence after review: I am **highly confident** that removing `/*?dpl=*` is directionally correct, because Google needs crawlable resources to render pages and `X-Robots-Tag` is the right control for non-HTML assets. I am **not satisfied** with build-only verification, with deferring redirect errors, or with treating the full "Crawled - currently not indexed" export as content quality.

---

## 2. Prior fix attempts (context for the reviewer)

The Anchor has had ongoing GSC indexing issues for at least a year. There are **147 SEO/redirect/robots/sitemap-tagged commits** in the git log since 2025-05-01. The most recent and most relevant:

| Date | Commit | Summary |
|---|---|---|
| 2026-04-30 | [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) | **This session.** Four GSC fixes: robots `/*?dpl=*` removed, events redirect to `/whats-on`, drinks/baby-guinness conflict resolved, `/hr` redirect added. |
| 2026-04-30 | `c28d298` | Eliminated duplicate `@id: /#business` JSON-LD declarations across 23 files (separate problem, also from this session). |
| 2026-04-30 | `d56cfaf` | Sunday-lunch FAQPage duplicate fix (separate, this session). |
| 2026-04-21 | `6181bbd` | **Prior robots.txt attempt.** Added `/_next/static/` to allow list. Did **not** remove `/*?dpl=*` — that's the gap I closed today. |
| 2026-04-21 | `1079fb5` | Removed test pages, fixed redirect chains, cleaned duplicate redirects. |
| 2026-04-12 | `2084315` | Consolidated thin blog tag pages via 301 redirects (added many of the redirects I confirmed are working today). |
| 2026-03-02 | `689589e` | Resolved earlier GSC 404s and meta description issues. |
| 2026-02-23 | `a9acca3` | Hardened redirects, unified hero templates. |
| 2026-02-18 | `bf1959b1` | Added the catch-block redirect on `/events/[id]` for missing events; also added `/*?dpl=*` to robots disallow (the rule I just removed). |
| 2026-01-27 | `5017e9c` | Earlier GSC indexing fix sweep. |

Prior third-party (Codex) reviews on the same problem space, located in `tasks/codex-qa-review/`:

- `2026-04-12-gsc-coverage-fix-*` — five reports investigating an earlier GSC spec
- `2026-04-21-seo-growth-plan-implementation-review-pack.md` — full SEO growth plan review
- `2026-04-11-event-redirect-*` — reviews of the events redirect work

**Key historical finding (from the 2026-04-12 Codex review):** the broken image URL `/images/page-headers/drinks/optimized/drinks-1920w` was confirmed not to exist anywhere in the codebase. That supports the "legacy/stale" theory, but it should not be treated as proof that nothing can be done. The developer must verify whether any internal page, sitemap, image metadata, or server logs still reference it. If not, leaving it as a 404 is acceptable; if it is still requested materially, add a deliberate 301 to `/images/page-headers/drinks/drinks.jpg` or return 410.

---

## 3. The full set of problems

596 URLs reported by GSC on 2026-04-29, broken down by category and pattern. All counts below were revalidated against the raw `Table.csv` files in `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/temp/GSC Errors`.

Important validation note: do not count these CSVs by splitting on newlines. Several GSC exports contain quoted URL fields with embedded line breaks, so a real CSV parser is required.

| Export folder | Issue | Parsed rows |
|---|---|---:|
| `the-anchor.pub-Coverage-Drilldown-2026-04-30/` | Page with redirect | 221 |
| `the-anchor.pub-Coverage-Drilldown-2026-04-30 (1)/` | Blocked by robots.txt | 137 |
| `the-anchor.pub-Coverage-Drilldown-2026-04-30 (2)/` | Excluded by 'noindex' tag | 57 |
| `the-anchor.pub-Coverage-Drilldown-2026-04-30 (3)/` | Not found (404) | 30 |
| `the-anchor.pub-Coverage-Drilldown-2026-04-30 (4)/` | Crawled - currently not indexed | 116 |
| `the-anchor.pub-Coverage-Drilldown-2026-04-30 (5)/` | Alternative page with proper canonical tag | 11 |
| `the-anchor.pub-Coverage-Drilldown-2026-04-30 (6)/` | Redirect error | 7 |
| `the-anchor.pub-Coverage-Drilldown-2026-04-30 (7)/` | Discovered - currently not indexed | 17 |

### 3.1 Page with redirect — 221 URLs

URLs that returned a redirect when crawled. The `Last crawled` column shows when Google last hit them.

| Pattern | Count | Source | Status |
|---|---|---|---|
| `/blog/tag/*` redirects | 120 | `config/redirects/tag-redirects.json` consolidates synonym tags | **Working as designed.** GSC will drop these as it re-crawls. |
| `/post/*` (Wix legacy) | 28 | `config/redirects/blog-redirects.json` | **Working as designed.** |
| `/blog/page/*` paginated | 8 | `config/redirects/additional-redirects.json` | **Working as designed.** |
| `/event-details/*` (legacy) | 6 | `config/redirects/legacy-redirects.json` + wix | **Working as designed.** |
| Various dated `/events/*` | 17 | `config/redirects/additional-redirects.json` and event lifecycle redirects | **Working as designed if the final target is relevant and returns 200. Add a redirect-chain test.** |
| `/drinks/*` retired SKUs | 11 | `config/redirects/drinks-redirects.json` | **Working as designed if these are not in the sitemap. Add a sitemap-vs-redirect guard.** |
| HTTP→HTTPS / apex→www | 3 | `middleware.ts` lines 16–25 | **Expected, but apex variants can compound other redirect chains.** |
| Other one-offs | 28 | various | **Mostly expected. Verify no redirect source is submitted in sitemap.** |

### 3.2 Blocked by robots.txt — 137 URLs

| Pattern | Count | Status |
|---|---|---|
| `/_next/static/css/HASH.css?dpl=DEPLOY_ID` | 106 | **Was blocked by `/*?dpl=*` rule. Fixed in [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6).** |
| `/api/calendar/event/...` | 21 | **Correctly blocked by `/api/` rule. No fix needed.** |
| `/test-*`, `/debug-*`, `/components`, `/gtm-debug`, `/demo-header` | 10 | **Stale or intentional cleanup, but verify live.** None of these should be important indexable pages. Keep them out of sitemap and confirm they return 404/410 or a deliberate redirect. |

### 3.3 Excluded by 'noindex' tag — 57 URLs

| Pattern | Count | Status |
|---|---|---|
| `/blog/<slug>` posts with `noindex: true` frontmatter | 52 | **By design.** Spot-checked 5 (`unique-events`, `day-of-the-dead-halloween-party-costumes-dance-and`, `national-burger-day`, `british-pie-week-2024`, `calling-all-pool-players`) — all confirmed `noindex: true` in their frontmatter. Author opt-in is the documented mechanism at `app/blog/[slug]/page.tsx:140`. |
| `/post/*` (Wix legacy) | 2 | Stale — these now redirect. |
| `/booking-confirmation` | 1 | Stale — page now does `redirect('/book-table')` (file `app/booking-confirmation/page.tsx`). |
| `/event-details/*` | 1 | Stale — redirected. |
| `/events/st-patricks-day-2026` | 1 | Past event. |

### 3.4 Not found (404) — 30 URLs

| Pattern | Count | Status |
|---|---|---|
| `/blog/tag/*` | 17 | **Stale.** All 17 have redirects in code today. Last crawl of each was *before* the redirect was added. Confirmed by cross-referencing `Last crawled` against `git blame` on `tag-redirects.json` and `additional-redirects.json` (see §4 for evidence). Will resolve on re-crawl + GSC "Validate fix". |
| `/events/*` (dated 2026-XX-XX + slugless `karaoke`/`drag-shows`/`quiz-night`) | 10 | **Now redirects.** [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) modified `app/events/[id]/page.tsx` to `permanentRedirect('/whats-on')` on draft/missing events. Verified compiled `page.js` contains 3× `permanentRedirect("/whats-on")` calls. |
| `/hr` | 1 | **Now redirects to `/`** via [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6). |
| `/post/<slug>` | 1 | Stale (covered by Wix redirects). |
| `/images/page-headers/drinks/optimized/drinks-1920w` | 1 | **Do not call this unfixable.** It is not referenced in the repo and currently returns 404, which is acceptable if no internal/referring source exists. If logs show meaningful requests, add a deliberate 301 to `/images/page-headers/drinks/drinks.jpg` or return 410. |

### 3.5 Crawled — currently not indexed — 116 URLs

These were crawled successfully and Google chose not to index. The previous conclusion that this is simply a **content-quality signal** is too broad.

| Pattern | Count | Required interpretation |
|---|---:|---|
| `/blog/tag/*` | 22 | Likely thin/consolidated tag pages. Decide whether each tag is a real landing page, a redirect, or `noindex`. |
| Individual `/blog/*` posts plus `/blog?page=*` | 24 | Mixed content-quality and pagination/canonicalization task. Do not rewrite until technical candidates are removed. |
| `/post/*` Wix legacy | 16 | Legacy URLs. Confirm they now 301 to canonical blog URLs and are not linked internally. |
| `/event-details/*` legacy | 11 | Legacy event URLs. Confirm final targets and remove internal references. |
| `*/opengraph-image` | 19 | Expected non-page image routes. Keep crawlable and controlled with `X-Robots-Tag`; do **not** block in robots.txt. |
| `/events/*` live event pages | 3 | Real event pages. Inspect individually in GSC URL Inspection before assuming quality. |
| `/events/*/book` | 3 | Redirect-source cleanup. They currently redirect to the parent event; ensure no internal links point to `/book`. |
| `/_next/static/*?dpl=*` | 2 | Same robots/resource issue as §3.2, not content quality. Should fall out only after live robots is fixed and re-crawled. |
| `/drinks/*` retired SKUs | 4 | Legacy product URLs. Confirm final redirect target and sitemap exclusion. |
| Booking/menu/UTM/misc pages | 12 | Mostly canonical/parameter handling. Validate canonical tags and internal links. |

**Status:** this needs a triage pass before content work. Only the thin tag pages and selected blog posts should become a content-quality task. The OG images, static assets, redirects, and UTM variants should be closed as technical/non-page cleanup.

### 3.6 Alternative page with proper canonical tag — 11 URLs

UTM-tagged or query-string variants where the canonical correctly points at the parent URL. Working as designed if the canonical is correct in live URL Inspection; no content work needed.

### 3.7 Redirect error — 7 URLs

| URL | Redirect destination | Redirect added | Last crawled |
|---|---|---|---|
| `https://www.the-anchor.pub/blog/tag/premier-league` | `/blog/tag/sports` | 2025-12-28 (`tag-redirects.json`) | 2026-01-23 |
| `https://www.the-anchor.pub/blog/tag/rugby` | `/blog/tag/sports` | 2025-12-28 | 2026-01-20 |
| `https://www.the-anchor.pub/blog/tag/dog-friendly` | `/blog/tag/community` | 2025-12-28 | 2026-01-07 |
| `https://www.the-anchor.pub/blog/tag/pet-friendly` | `/blog/tag/community` | 2025-07-16 | 2026-01-18 |
| Apex variants of `pet-friendly`, `premier-league`, `rugby` | (same) | (same) | 2026-01-05 to 2026-01-23 |

All four destinations (`community`, `sports`) are live tag pages with posts. Redirects existed at crawl time. **Root cause still needs immediate investigation.**

Hypotheses (in order of plausibility):
1. Apex variants double-hop: `the-anchor.pub` → `www.the-anchor.pub` (middleware) → `/blog/tag/<destination>` (next.config redirect). Google sometimes flags 2-hop chains.
2. Transient response failure / timeout at crawl time on the destination page.
3. Cache-related issue at Vercel edge.

**Status: do not defer.** A live spot check on 2026-04-30 showed `https://www.the-anchor.pub/blog/tag/premier-league` returning `301 -> /blog/tag/sports -> 200`, while the apex variant returned `307 -> https://www.the-anchor.pub/blog/tag/premier-league -> 301 -> /blog/tag/sports -> 200`. That may be tolerable for browsers, but it is exactly the kind of chain that should be flattened for URLs already reported as redirect errors. Add explicit single-hop redirects for apex variants where the platform allows it, and add a regression test that every URL in this 7-row export reaches a 200 target without loops, bad locations, or unnecessary hops.

### 3.8 Discovered — currently not indexed — 17 URLs

Found via sitemap, not yet crawled. All 17 rows have `Last crawled` as `1970-01-01`, so they have not been crawled. Mostly recent additions: 5× `/private-hire/near/*` programmatic landmark pages, 6× recent blog posts, and 6 individual one-offs, including `/drinks/baby-guinness`. This can be normal for new content, but priority pages should be inspected/requested individually in GSC after production verification.

---

## 4. Evidence cross-reference table — verifying which "404" reports are stale

This table is useful evidence for the 17 tag URLs marked "Not found (404)": the redirect was added *after* Google's last crawl. Reviewer live checks on 2026-04-30 also confirmed these tag URLs now return `301 -> canonical tag page -> 200`.

| Slug | Redirect destination | Redirect added (commit) | Last crawled | Stale? |
|---|---|---|---|---|
| mental-health | community | 2026-03-02 (`689589e3`) | 2026-02-17 | YES |
| cider | food-and-drink | 2026-03-02 | 2026-02-17 | YES |
| feedback | community | 2026-03-02 | 2026-02-17 | YES |
| children | community | 2026-03-02 | 2026-02-03 | YES |
| private-dining | events | 2026-03-02 | 2026-01-26 | YES |
| live-matches | sports | 2026-03-02 | 2026-01-22 | YES |
| terrestrial-sport | sports | 2026-03-02 | 2026-01-22 | YES |
| cash-prizes | events | 2026-03-02 | 2026-01-20 | YES |
| traditional | community | 2026-03-02 | 2026-01-20 | YES |
| family | community | 2026-03-02 | 2026-01-20 | YES |
| british-history | community | 2026-03-02 | 2026-01-19 | YES |
| pub-menu | food-and-drink | 2026-03-02 | 2026-01-19 | YES |
| annual-celebrations | seasonal | 2026-03-02 | 2026-01-19 | YES |
| mexican-culture | food-and-drink | 2026-03-02 | 2026-01-19 | YES |
| local-area | community | 2026-03-02 | 2026-01-18 | YES |
| lunch | food-and-drink | 2026-03-02 | 2026-01-06 | YES |
| craft-beer | food-and-drink | 2025-12-29 (in `additional-redirects.json`) | 2025-11-15 | YES |

**How to verify:** for any row, run

```
git blame --date=short config/redirects/tag-redirects.json | grep -B2 -A2 '"<slug>"'
```

against the slug, and compare the committer date to the `Last crawled` value in the GSC export at `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (3)/Table.csv`.

---

## 5. What I shipped this session

Four code changes, one PR, pushed as commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) on `main`.

### 5.1 `app/robots.ts` — removed `/*?dpl=*` from disallow list

**Before:** `disallow: ['/api/', '/_next/data/', '/*?dpl=*', '/_serverless/', ...]`
**After:** `disallow: ['/api/', '/_next/data/', '/_serverless/', ...]`

**Why:** the wildcard matched any URL containing `?dpl=`, including the static CSS/JS assets Vercel auto-tags with `?dpl=<deployment-id>` for cache busting. The `allow: /_next/static/` rule on line 8 was being overridden by this more-specific disallow. 106 stylesheet URLs were being marked "Blocked by robots.txt".

**Why this wasn't caught in commit `6181bbd` on 2026-04-21:** that fix added `_next/static/` to the allow list but didn't remove the more-specific dpl wildcard. In Google's robots.txt parser the more-specific match wins.

**Verification (high confidence):**
- `cat .next/server/app/robots.txt.body` after build shows the dpl line is gone.
- The static assets remain `noindex,nofollow` via the `X-Robots-Tag` header set in `next.config.js:130-141` — so they won't suddenly appear in search.
- The canonical tags on every HTML page handle deployment-pinned URL dedup independently.
- **Reviewer production check:** on 2026-04-30, live `https://www.the-anchor.pub/robots.txt` still included `Disallow: /*?dpl=*`. That means this fix was either not deployed, not cached through, or not serving from the expected build at the time of review. Do not start GSC validation until the live file is clean.

**Risk:** very low. The X-Robots-Tag header is the correct tool for "don't index this asset URL"; robots.txt is the wrong tool because Googlebot needs to *fetch* the asset to render the page. That's exactly what the dpl rule was preventing.

**Required regression test:** parse the generated robots file and assert that `/_next/static/` is allowed and no disallow rule can match `/_next/static/css/example.css?dpl=deployment`. This failed once already because `allow` was changed without removing the more-specific `dpl` disallow.

**Resolves:** 106 URLs in §3.2.

### 5.2 `app/events/[id]/page.tsx` — drafts and missing events redirect to `/whats-on`

**Before:**
```ts
const status = normalizeEventStatus(event)
if (status === 'draft') {
  notFound()  // returns 404
}
```

**After:**
```ts
if (!event) {
  permanentRedirect('/whats-on')
}

const status = normalizeEventStatus(event)
if (status === 'draft') {
  permanentRedirect('/whats-on')  // returns 308
}
```

Also removed unused `notFound` import.

**Why:** the existing catch block at lines 234–236 already redirects when `anchorAPI.getEvent()` throws, but two failure modes weren't covered:
- `anchorAPI.getEvent()` returning a falsy value without throwing (defensive — TypeScript types say it never does, but the call path is non-trivial).
- Events that exist in the API but have `status === 'draft'`. Those returned 404; now they redirect.

**Verification (medium-high confidence):**
- Compiled `.next/server/app/events/[id]/page.js` contains 3× `permanentRedirect("/whats-on")` (catch block + draft + safety net).
- Reviewer live checks on 2026-04-30 showed representative missing-event URLs now returning `308 -> /whats-on -> 200`, including `/events/quiz-night-2026-12-02`, `/events/bingo-2026-11-18`, `/events/bingo-2026-07-29`, `/events/bingo-2026-09-30`, `/events/bingo-2026-05-20`, `/events/bingo-2026-09-02`, `/events/quiz-night-2026-09-16`, `/events/karaoke`, and `/events/quiz-night`.

**Reviewer concern:** the implementation uses `/whats-on` as the default target for missing/draft events. That may be acceptable for recurring event types, but it should not be the default lifecycle rule for every deleted/draft event. If there is no close replacement, Google recommends a real 404/410. The developer should define explicit event lifecycle handling: exact future replacement, category page, event archive, or 404/410.

**A failed earlier attempt during this session (transparency):** I first tried adding `app/events/[id]/not-found.tsx` calling `permanentRedirect('/whats-on')`. It compiled clean but Next.js silently dropped the file from the build output (I confirmed `EventNotFound` doesn't appear in any `.next/server/**/*.js`). Official Next.js docs describe `not-found.tsx` as the UI rendered after `notFound()` is thrown; they do not document it as a redirect hook. I then deleted the file and used the page.tsx approach instead, which is the right pattern for data-dependent redirects in this route.

**Resolves:** up to 10 URLs in §3.4.

### 5.3 `config/redirects/drinks-redirects.json` — removed `/drinks/baby-guinness` rule

**Before:**
```json
{ "source": "/drinks/baby-guinness", "destination": "/drinks", "permanent": true }
```

**After:** entry deleted.

**Why:** `app/sitemap.ts:110` declares `/drinks/baby-guinness` as a canonical URL **and** the page exists at `app/drinks/baby-guinness/page.tsx`. The redirect rule was contradicting the sitemap and the page. GSC reported the URL as "Discovered — currently not indexed" (i.e. found via sitemap, not yet crawled), so Google had not yet observed the contradiction — but it would have on next crawl.

**Audit follow-on completed:** I scanned all 76 entries in `drinks-redirects.json` against the 2 drinks paths declared in `app/sitemap.ts`. Only `/drinks/baby-guinness` was a contradiction. `/drinks/managers-special` is in the sitemap and not in drinks-redirects, so no conflict. No other entries needed changing.

**Verification (high confidence):**
- `routes-manifest.json` after rebuild shows zero redirect entries with source `/drinks/baby-guinness`.
- Static page exists at `.next/server/app/drinks/baby-guinness.html`.

**Resolves:** 1 URL.

### 5.4 `config/redirects/additional-redirects.json` — added `/hr → /`

```json
{ "source": "/hr", "destination": "/", "permanent": true }
```

**Why:** `/hr` was returning 404 (no page in `app/hr/`, no redirect rule). Following the convention used by other retired URLs (`/join-the-team`, `/honey-bee-mine`, etc.) which all redirect to `/`, I added the same.

**Verification (high confidence):** `routes-manifest.json` after rebuild contains `{ "source": "/hr", "destination": "/", "statusCode": 301, ... }`.

**Reviewer concern:** `/hr -> /` may be user-hostile and can hide the fact that the job/HR page is gone. If there is no current jobs/careers page, prefer a useful 410/404 or create a lightweight jobs page. Redirect to `/` only if the business deliberately wants all old recruitment links to land on the homepage.

**Resolves:** 1 URL.

---

## 6. What's still open

### 6.1 The 7 "Redirect error" tag URLs (§3.7)

**Status:** open and should be worked now. Redirects exist in code, but GSC's "Redirect error" classification is specifically about redirect-chain problems, loops, bad/empty redirect URLs, or URL length issues. It should not be treated as a normal "Page with redirect" state.

**Required action:**
1. Manually test all 7 rows with redirects disabled/followed step by step and store status/location evidence in this pack.
2. Flatten apex variants where possible so `https://the-anchor.pub/blog/tag/premier-league` goes directly to `https://www.the-anchor.pub/blog/tag/sports`, not apex → www source → consolidated tag.
3. Add a regression test that every row in the Redirect error CSV reaches a 200 target, with no loops, empty `Location`, or avoidable multi-hop chains.
4. Check Vercel/access logs around the reported crawl dates for 5xx/timeouts, but do not use lack of log evidence as a reason to skip the redirect-chain fix.

**Reviewer decision:** do not wait and see. This category survived long enough to be in the 2026-04-29 export, and the current live apex flow still demonstrates a multi-hop chain.

### 6.2 The broken image URL `/images/page-headers/drinks/optimized/drinks-1920w` (§3.4)

**Status:** likely stale, but not "unfixable." Prior review confirmed no matching source reference, and I verified independently:
- `grep -rn "drinks-1920w"` across `app/`, `components/`, `lib/`, `content/`, `public/` — no matches except in prior review docs.
- `public/images/page-headers/drinks/` exists; `public/images/page-headers/drinks/optimized/` does not.

The current live URL returns 404. That is acceptable if the URL is genuinely removed and not internally linked. It is not acceptable to declare "no action available" without checking source/referrer evidence.

**Required action:** inspect internal links, sitemap output, image metadata, and access/referrer logs. If no source exists, leave the 404 and document it. If there is meaningful traffic or an external backlink worth preserving, add a deliberate 301 to `/images/page-headers/drinks/drinks.jpg`. If the asset is intentionally gone and should disappear faster, return 410.

### 6.3 The 116 "Crawled — currently not indexed" URLs (§3.5)

**Status:** unaddressed and misclassified.

**Analysis:** these are not all a content problem. The raw CSV includes:
- 19 generated `opengraph-image` URLs that are image resources with `X-Robots-Tag`.
- 2 `_next/static/*?dpl=*` CSS URLs tied to the robots/resource issue.
- 3 `/events/*/book` URLs that redirect to event pages.
- 27 legacy `/post/*` and `/event-details/*` URLs.
- 22 tag pages and roughly two dozen blog/pagination URLs that may actually need content/canonical decisions.

**Required action:** split the 116 rows into technical, non-page, legacy, parameter/canonical, and true content candidates. Only after that split should anyone write or rewrite content. This should be produced by a script, not by manual sorting.

**Reviewer decision:** create a small technical cleanup task first, then a separate content-quality task for the remaining tag/blog URLs.

### 6.4 Out-of-scope clean-ups noticed during discovery

These weren't part of the original GSC categories but I noticed them during the audit. Surfaced for the reviewer's awareness; not actioned.

- `next.config.js` loads 6 redirect JSON files merging to **646 rules**. At this scale the operational problem is not only platform limits; it is lack of ownership and tests. Add duplicate-source detection, sitemap conflict detection, and redirect-chain tests before adding more one-off rules.
- `app/blog/tag/[tag]/page.tsx:73-75` calls `permanentRedirect('/blog/tags')` if a tag has no posts. This relies on `dynamicParams` defaulting to true and the page reaching the redirect at runtime. It works in theory; a small refactor to put unknown tags in the explicit redirect file would make the behaviour more deterministic.

---

## 7. Files for the reviewer to inspect

To independently verify everything in this document:

| File | Why |
|---|---|
| `app/robots.ts` | Confirm `/*?dpl=*` is gone; allow list contains `/_next/static/`. |
| `app/events/[id]/page.tsx` lines 232–250 | Confirm catch-block redirect, falsy-event redirect, and draft redirect. |
| `config/redirects/drinks-redirects.json` | Confirm no `/drinks/baby-guinness` entry. |
| `config/redirects/additional-redirects.json` last 5 lines | Confirm `/hr → /` rule. |
| `app/sitemap.ts:110` | Confirm `/drinks/baby-guinness` declared canonical. |
| `app/blog/[slug]/page.tsx:140` | Confirm `noindex` mechanism for blog posts. |
| `app/blog/tag/[tag]/page.tsx:73-75` | Confirm tag-with-no-posts behaviour. |
| `middleware.ts:16-25` | Confirm apex→www redirect. |
| `next.config.js:130-141` | Confirm `X-Robots-Tag: noindex,nofollow` on `/_next/static/*`. |
| `app/events/[id]/opengraph-image.tsx:146-148` | Confirm generated OG images use `X-Robots-Tag` and remain crawlable. |
| `tasks/gsc-indexing-fix/SPEC.md` | The discovery spec produced earlier in this session (now superseded by this review pack but useful for audit trail). |
| `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30*/` | Source data — one `Table.csv` per category in eight sibling folders. |
| `tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-*.md` | Prior third-party review of the same problem space. |

To verify the 17 stale tag 404s:
```
python3 -c "
import csv
from urllib.parse import urlparse
p = 'temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (3)/Table.csv'
with open(p) as f:
    rdr = csv.reader(f); next(rdr, None)
    for r in rdr:
        path = urlparse(r[0]).path
        if path.startswith('/blog/tag/'):
            print(r[1], path)
"
```

…and cross-reference each with `git blame --date=short config/redirects/tag-redirects.json`.

---

## 8. Remaining risks

1. **Production is not fully proven.** Live checks on 2026-04-30 showed `/hr`, `/drinks/baby-guinness`, and representative missing event URLs behaving as intended, but live `robots.txt` still contained `Disallow: /*?dpl=*`. That can be deployment lag, CDN caching, or serving a stale build. It must be resolved before claiming the robots issue fixed.

2. **The event redirect policy may create poor replacement signals.** The implementation appears to fix the immediate 404 samples, but redirecting every missing/draft event to `/whats-on` is not automatically correct. If there is no close replacement, 404/410 is cleaner than a broad redirect.

3. **The 7 redirect errors are not explained by the four shipped fixes.** They predate this work and are not fixed by removing `?dpl` from robots or by changing event handling. They need their own redirect-chain fix.

4. **The "Crawled - currently not indexed" cohort can be mishandled if treated as copywriting.** It includes image resources, static assets, redirect sources, and legacy URLs. Content work before technical triage will waste time.

5. **The not-found.tsx misadventure (5.2) should be treated as a rejected pattern.** Keep `not-found.tsx` for segment-specific 404 UI only. Put data-dependent event redirects in `app/events/[id]/page.tsx`, and put known path redirects in `next.config.js` or Middleware.

---

## 9. Verification plan before GSC validation

Do this in order. Do not click "Validate fix" until live evidence is captured.

1. Fetch live `https://www.the-anchor.pub/robots.txt` and confirm there is no `Disallow: /*?dpl=*` line. On 2026-04-30 this still failed.
2. Fetch a current live CSS URL with `?dpl=<DEPLOY_ID>` and confirm it is crawlable. Then confirm the response still has `X-Robots-Tag: noindex, nofollow`.
3. Fetch every URL in the 30-row 404 export and classify the live result as `301/308 -> 200`, intentional `404/410`, or still broken. Current live checks showed all tag/event/post samples resolving except the legacy drinks image, which still returns 404.
4. Fetch all 7 redirect-error URLs and record the full chain. Fix avoidable multi-hop apex chains before validation.
5. Fetch `https://www.the-anchor.pub/drinks/baby-guinness` and confirm 200, canonical self-reference, and sitemap inclusion.
6. Decide `/hr` lifecycle deliberately: homepage redirect, new jobs page, or 410/404. Do not leave it as a convention-only redirect without owner sign-off.
7. Run a sitemap audit: every sitemap URL should be canonical, indexable, return 200, and not appear as a redirect source or `noindex` page.
8. In GSC, validate only issues that were genuinely fixed and are source=`Website`. Priorities: `Blocked by robots.txt`, `Not found (404)` after lifecycle decisions, and `Redirect error` after chain fixes. Do not validate "Page with redirect" or intentional `noindex` just because they appear in the report.
9. Wait 14 days, then re-export all eight drilldowns and rerun the CSV parser/classifier. Compare counts by issue and by URL cohort, not just the headline total.

---

## 10. Decisions for the developer

1. **Investigate redirect errors now.** Do not wait for another crawl.
2. **Split the 116 "Crawled - currently not indexed" URLs before content work.** Treat only the remaining tag/blog URLs as content candidates.
3. **Keep `opengraph-image` crawlable.** Do not add robots disallows for social/OG image routes.
4. **Add automated checks.** This work has failed before because fixes were manually reasoned and not guarded.
5. **Capture production evidence.** The owner needs proof from the live site, not local build output.
