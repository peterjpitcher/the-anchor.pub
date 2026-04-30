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

---

## 11. Round 2 — production verification and URL Inspection findings (2026-04-30, evening)

After the critical reviewer's verdict in §0, we ran the production checks they required. New findings below — these are the ground truth and override anything in earlier sections that conflicts.

**Critical reviewer note:** this section is valuable, but it does not replace the P0/P1 items in §0.1. In particular, redirect-error chain investigation, URL lifecycle policy, and automated sitemap/robots/redirect checks should not be pushed indefinitely behind content-linking work. If the developer only ships Round 2 content/schema work and leaves §0.1 for "later", this will repeat the same pattern of partial fixes.

### 11.1 The robots.txt fix is correct in code but invisible in production (cache problem)

**What we observed:** the live `https://www.the-anchor.pub/robots.txt` (fetched by the site owner on 2026-04-30 after the deploy went live) still contains the line `Disallow: /*?dpl=*` at line 73 of the response. Local source `app/robots.ts` does **not** contain that rule (verified — `grep -n "dpl" app/robots.ts` returns no matches). Commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) is on `main` and (per the owner) deployed.

**Root cause:** `next.config.js:121-128` sets `Cache-Control: public, max-age=86400` on `/robots.txt`. Cloudflare and/or the Vercel edge are still serving the response cached before the deploy. The TTL is 24 hours.

**Reviewer caveat:** prove this with response headers before closing it as cache-only. Capture `Cache-Control`, `Age`, `CF-Cache-Status`, `Via`, `x-vercel-cache`, and response body before and after purge. If the stale body remains after a Cloudflare custom purge, the problem is not just Cloudflare cache.

**The reviewer's P0 "prove production first" was correct.** The B1 fix in §5.1 was code-correct but I should not have closed it as "done" without confirming the live response.

**Proposed fix:**
- (a) **Immediate:** owner purges Cloudflare cache for `https://www.the-anchor.pub/robots.txt` via dashboard → Caching → Purge Cache → Custom Purge.
- (b) **Permanent:** shorten the cache header in `next.config.js` to `public, max-age=300, s-maxage=300, must-revalidate` so future deploys propagate within ~5 minutes instead of 24 hours.

### 11.2 The 3 spot-check URLs are "Crawled — currently not indexed" because they're orphan pages

**URL Inspection results (2026-04-30, fresh tests):**

| URL | Page indexing status | Sitemaps | Referring page | Last crawl | Internal links from rest of site |
|---|---|---|---|---|---|
| `/blog/function-room-hire-heathrow-pricing` | Crawled — currently not indexed | Temporary processing error | None detected | 22 Mar 2026 | 2 (both other blog posts) |
| `/blog/family-friendly-sunday-lunch-heathrow` | Crawled — currently not indexed | `https://www.the-anchor.pub/sitemap.xml` | `https://the-anchor.pub/sitemap.xml` (apex) | 2 Apr 2026 | **0** |
| `/blog/christening-party-ideas-venues` | Crawled — currently not indexed | Temporary processing error | None detected | 16 Apr 2026 | **0** |

All three pass technical checks: crawl allowed, page fetch successful, indexing allowed, user-declared canonical correct, Google-selected canonical matches.

**Diagnosis:** orphan pages. Two of three have **zero internal links** from non-blog pages. The third has two links, both from sibling blog posts (themselves likely low-authority). Google's signal is "this page exists, but nothing on the site treats it as important." Combined with thin-ish content, the result is "Crawled — currently not indexed."

This pattern likely explains a substantial share of the 116 "Crawled — currently not indexed" cohort — but we should verify by spot-checking 5 more URLs before extrapolating, per the reviewer's P1 "reclassify before content work" requirement.

**Reviewer caveat:** three samples are enough to justify investigation, not enough to justify a site-wide linking campaign. The link graph must be built from rendered output or Next route metadata, not only `rg` string matches, because many links are generated through components, arrays, nav data, or CMS/content helpers. The audit also needs to separate true content pages from non-page assets, redirect sources, UTM variants, and legacy URLs before classifying "orphan" status.

**Proposed fix (for the 3 sample pages):**
- Add contextual link from `/sunday-lunch` → `/blog/family-friendly-sunday-lunch-heathrow`
- Add contextual link from `/private-hire` → `/blog/function-room-hire-heathrow-pricing`
- Add contextual link from `/private-hire/christenings` → `/blog/christening-party-ideas-venues`

These are not random — they're parent→child topical relationships where the link is genuinely useful for the visitor.

### 11.3 Duplicate `BreadcrumbList` schema on every blog post page

**Evidence (URL Inspection: "2 valid items detected" of type `BreadcrumbList`):**

| Source | File | Behaviour |
|---|---|---|
| Inline in page | `app/blog/[slug]/page.tsx:275-298` | Declares `breadcrumbSchema` with home id `https://www.the-anchor.pub` (no trailing slash), emits via `<script type="application/ld+json">` |
| HeroWrapper → Breadcrumbs | `components/hero/Breadcrumbs.tsx:30-52` | Generates a `BreadcrumbList` from breadcrumb items, home id resolves to `https://www.the-anchor.pub/` (with trailing slash because `${baseUrl}${item.href}` where `item.href = '/'`), emits via its own `<script>` |

Both render on blog post pages. The trailing-slash inconsistency makes it a real conflict, not just a duplicate. Same class of problem we fixed for `Restaurant`/`@id: /#business` in commit `c28d298`.

**Scope to verify:** the duplicate likely affects every page that combines HeroWrapper-with-breadcrumbs **and** an explicit page-level breadcrumb schema. Not yet enumerated.

**Reviewer caveat:** do not commit to Option A until the exact affected URL list is enumerated. Putting schema ownership in `HeroWrapper` may be convenient, but it couples SEO data to a visual component and risks removing breadcrumbs from pages that do not use HeroWrapper. The safer final design may be a single shared `BreadcrumbJsonLd` helper used by HeroWrapper and non-HeroWrapper pages, with HeroWrapper not silently becoming the only schema source.

**Proposed fix options:**

- **Option A (recommended): keep HeroWrapper as the single source.** Remove the inline `breadcrumbSchema` from `app/blog/[slug]/page.tsx` and any sibling pages with the same pattern. Simplest. HeroWrapper-using pages all keep a breadcrumb schema; pages that don't use HeroWrapper would need `BreadcrumbJsonLd` if they want one.
- **Option B: keep page-level inline schemas as the single source.** Remove the JSON-LD `<script>` from `components/hero/Breadcrumbs.tsx` (visual only). Pages that previously got their breadcrumb schema only from HeroWrapper would lose it unless explicitly added.

### 11.4 Sitemap "Temporary processing error" on 2 of 3 URLs

Two of the three URL Inspections show `Sitemaps: Temporary processing error` in the Discovery section. Could be transient at Google's end, or could be a real intermittent fetch failure on `sitemap.xml`.

**Proposed action:** investigation task — fetch `sitemap.xml` from a few different angles (apex, www, with/without trailing slash) and look for any non-200 response or formatting issue. Not blocking round-2 fixes.

**Reviewer caveat:** this should not be treated as optional if URL Inspection keeps reporting sitemap processing errors. A sitemap that intermittently errors weakens the whole recovery effort. At minimum, the investigation must verify response consistency, XML validity, sitemap cache headers, and whether `app/sitemap.ts` depends on slow or fragile dynamic API calls.

### 11.5 Sitemap discovery via apex domain

`family-friendly-sunday-lunch-heathrow` shows "Referring page: `https://the-anchor.pub/sitemap.xml`" — Google found it via the **apex** sitemap, which then redirects to www via `middleware.ts:16-25`. Means Google follows a redirect every time it fetches the sitemap.

Not a bug — apex→www redirect is correct. Slightly inefficient. Out of scope for round 2.

**Reviewer caveat:** if Google discovered the sitemap through `https://the-anchor.pub/sitemap.xml`, confirm that both `robots.txt` variants advertise the canonical www sitemap and that Cloudflare/Vercel return a clean single-hop redirect from apex sitemap to www sitemap.

---

## 12. Round 2 — proposed fixes (for review before implementation)

| # | Fix | Change | Resolves | Cost | Risk |
|---|---|---|---|---|---|
| R2.1 | Shorten robots.txt cache header | `next.config.js`: change `max-age=86400` to `max-age=300, s-maxage=300, must-revalidate` | Future deploys of `robots.txt` propagate in ~5 min instead of 24h | 1 line | very low |
| R2.2 | Owner purges Cloudflare cache for `/robots.txt` | Manual action in Cloudflare dashboard | Live `robots.txt` immediately reflects [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) (no `/*?dpl=*`) | manual | very low |
| R2.3 | Resolve duplicate `BreadcrumbList` site-wide (Option A) | Remove inline `breadcrumbSchema` from `app/blog/[slug]/page.tsx` and any sibling pages that also use HeroWrapper | All blog posts (and likely others) emit a single, consistent `BreadcrumbList` | 30 min | low — needs enumeration first |
| R2.4 | Add internal links from parent pages to the 3 sample blog posts | `/sunday-lunch`, `/private-hire`, `/private-hire/christenings` get one contextual link each | Gives the 3 sample pages a clearer internal signal; indexing is not guaranteed | 15 min | low (copy review wanted) |
| R2.5 | Verify orphan-page hypothesis on 5 more URLs from the 116 cohort | Internal-link grep on 5 randomly-chosen URLs from the 116 list | Confirms or refutes whether the orphan pattern is the root cause for the cohort | 15 min | none (research only) |
| R2.6 | (Conditional on R2.5) bulk internal-linking sweep | New PR after R2.5 results | Up to ~50 of the 116 URLs | TBD | low–medium depending on scope |
| R2.7 | Sitemap "Temporary processing error" investigation | Manual fetch checks against sitemap.xml | Possibly resolves transient sitemap errors | 15 min | low |

**Reviewer correction:** the P0/P1 items in §0.1 are not optional backlog. They are the control layer that prevents this work failing again. At minimum, redirect-error chain investigation, URL lifecycle policy, and the robots/sitemap/redirect regression checks should be pulled forward alongside Round 2, not left until after all content work.

---

## 13. Owner decisions — approved 2026-04-30

All seven decisions signed off by the site owner on 2026-04-30:

| # | Question | Decision |
|---|---|---|
| 1 | Shorten the robots.txt cache from 24 hours to 5 minutes? Also do `sitemap.xml`? | **Approved.** Both. |
| 2 | Will the owner purge the Cloudflare cache for `/robots.txt`? | **Yes.** Instructions in §15. |
| 3 | Duplicate breadcrumb fix — Option A (HeroWrapper as single source) or Option B (page-level only)? | **Option A.** |
| 4 | Add internal links from `/sunday-lunch`, `/private-hire`, `/private-hire/christenings` to the three orphan blog posts? | **Approved — and expand to a full site-wide orphan audit and link sweep, not just the 3 samples.** |
| 5 | Spot-check 5 more URLs from the 116 cohort to confirm the orphan pattern? | **Approved.** |
| 6 | If the pattern holds, proceed straight to the bulk internal-linking sweep, or pause for review? | **Proceed. The problem needs fixing.** |
| 7 | Investigate the "Temporary processing error" Google reported on the sitemap? | **Approved — and apply any fixes possible.** |

**Implications of decisions 4 and 6 combined:** R2.4, R2.5, and R2.6 collapse into one larger workstream — a site-wide orphan-page audit followed by a complete linking sweep. The detailed plan is in §14.4.

---

## 14. Round 2 — detailed implementation plan

This section gives the third-party consultant everything needed to assess the proposed work before it ships. Each item has: scope, files affected with line numbers, before/after where useful, methodology for investigations, risks, verification, rollback.

### 14.1 R2.1 — Shorten cache headers on `/robots.txt` and `/sitemap.xml`

**Goal:** when we deploy a change to `robots.txt` or `sitemap.xml`, the live response should reflect it within ~5 minutes instead of 24 hours.

**Reviewer feedback:** this is directionally right, but the implementation must verify the actual CDN behaviour, not just the configured header. Cloudflare can have page rules/cache rules that override origin headers. Capture headers before and after deploy/purge, and document whether Cloudflare honors `s-maxage=300` on these paths.

**Files affected:**

- `next.config.js` lines 121–128 (existing `/robots.txt` rule)
- `next.config.js` (no existing rule for `/sitemap.xml` — needs to be **added**; verified by `grep -n "sitemap" next.config.js` returning no matches)

**Change details:**

```js
// BEFORE — next.config.js:121-128
{
  source: '/robots.txt',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=86400' },
  ],
},

// AFTER
{
  source: '/robots.txt',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=300, must-revalidate' },
  ],
},
{
  source: '/sitemap.xml',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=300, must-revalidate' },
  ],
},
```

**Why this header value:**
- `max-age=300` — browser cache 5 minutes
- `s-maxage=300` — CDN/shared cache 5 minutes (Cloudflare honors this)
- `must-revalidate` — caches must check freshness once stale, not serve indefinitely

**Risk analysis:**
- Robots.txt and sitemap.xml are both small files (<10 KB). Re-fetching every 5 minutes is negligible bandwidth.
- Googlebot already requests `robots.txt` on roughly its own schedule (typically 24h), so the new header doesn't pressure crawl budget.
- No behavioural change for users.

**Verification plan:**
1. Build locally (`npm run build`) and confirm no errors.
2. Deploy to production.
3. Owner runs Cloudflare cache purge per §15 (R2.2) for the immediate fix.
4. Curl `https://www.the-anchor.pub/robots.txt -I` and confirm `Cache-Control: public, max-age=300, s-maxage=300, must-revalidate`. Also record `Age`, `CF-Cache-Status`, `x-vercel-cache`, and `Via` if present.
5. Repeat for `https://www.the-anchor.pub/sitemap.xml`.

**Rollback:** revert `next.config.js`. No data state to undo.

---

### 14.2 R2.2 — Cloudflare cache purge instructions for the owner

**Goal:** make the [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) `robots.txt` change visible on the live site immediately, without waiting for the 24-hour cache to expire.

**Reviewer feedback:** the owner walkthrough is useful, but after purge the developer must run a non-browser verification too. Browser/incognito checks can still hide proxy/cache details.

This is a **manual action by the site owner** in the Cloudflare dashboard. Step by step:

1. Sign in to Cloudflare at <https://dash.cloudflare.com/>.
2. From the Account home, select the **`the-anchor.pub`** site.
3. In the left navigation, open **Caching → Configuration**.
4. Scroll to the **Purge Cache** section.
5. Click **Custom Purge**.
6. Select the option **URL** (default).
7. In the URL list field, paste:
   ```
   https://www.the-anchor.pub/robots.txt
   https://the-anchor.pub/robots.txt
   ```
   (Both apex and www variants — Cloudflare caches them separately.)
8. Click **Purge**.
9. Wait ~30 seconds.
10. Open `https://www.the-anchor.pub/robots.txt` in a fresh browser tab (or in incognito/private mode to avoid the local browser cache). Confirm the line `Disallow: /*?dpl=*` is **no longer present**.

**Alternative path** if "Custom Purge" doesn't appear: the owner can use **"Purge Everything"** — this clears the entire site's CDN cache and is heavier (next page loads will be slower until the cache warms back up) but is a known-good fallback.

**Who to contact if the owner doesn't have direct Cloudflare access:** whoever administers the Cloudflare account for `the-anchor.pub` (often the developer or hosting team).

**Verification:** the live `robots.txt` no longer contains `Disallow: /*?dpl=*`. Same check used in 14.1 step 4, using command-line fetch with response headers captured.

---

### 14.3 R2.3 — Resolve duplicate `BreadcrumbList` schema site-wide (Option A)

**Goal:** every page on the site emits exactly one `BreadcrumbList` JSON-LD block, with consistent home id (`https://www.the-anchor.pub` — no trailing slash, matching the canonical entity).

**Approach (Option A):** keep `components/hero/Breadcrumbs.tsx` (rendered by HeroWrapper) as the single source of breadcrumb JSON-LD. Remove all other emissions on pages that use HeroWrapper.

**Reviewer feedback:** Option A is acceptable only if the implementation first produces an exact page-by-page matrix of breadcrumb sources. The current text says "likely" and "substantial subset"; that is not enough for a schema change across 17+ pages. The developer must not remove any `BreadcrumbJsonLd` instance until they prove the page has an alternate BreadcrumbList source.

**Scope discovery (grep performed on 2026-04-30):**

| Source of breadcrumb JSON-LD | File / Component | Pages affected |
|---|---|---|
| HeroWrapper → Breadcrumbs.tsx | `components/hero/Breadcrumbs.tsx:30-52` | All pages using `<HeroWrapper>` (~25+ pages) |
| Inline `breadcrumbSchema` | `app/blog/[slug]/page.tsx:275-298`, `app/heathrow-parking/[terminal]/page.tsx` | 2 pages |
| `BreadcrumbJsonLd` component | `components/seo/BreadcrumbJsonLd.tsx` | 20 pages: `private-hire/page`, `private-hire/wakes`, `private-hire/christenings`, `private-hire/baby-showers`, `karaoke`, `easter`, `halloween`, `our-pub`, `open-mic`, `christmas-parties`, `whats-on`, `fathers-day`, `sunday-lunch`, `new-years-eve`, `food-menu`, `food-menu/gluten-free`, `food-menu/vegetarian`, `food-menu/vegan`, `quiz-night`, `st-patricks-day` |

**Pages with confirmed duplicate (HeroWrapper + something else):**

- HeroWrapper + inline schema → **2 pages** (blog `[slug]`, heathrow-parking `[terminal]`)
- HeroWrapper + `BreadcrumbJsonLd` → **substantial subset** of the 20 BreadcrumbJsonLd users — needs precise per-page enumeration during implementation. Likely 15+ pages.

**Concrete edits planned:**

1. `app/blog/[slug]/page.tsx`:
   - Remove the `breadcrumbSchema` declaration at lines 275–298.
   - Remove `breadcrumbSchema` from the JSON-LD array at line 306 (`[blogPostingSchema, blogSchema, breadcrumbSchema, faqSchema].filter(Boolean)` → `[blogPostingSchema, blogSchema, faqSchema].filter(Boolean)`).
2. `app/heathrow-parking/[terminal]/page.tsx`:
   - Same pattern — remove inline schema, remove from JSON-LD array.
3. **For each of the 20 `BreadcrumbJsonLd`-using pages**, check whether the page also uses `<HeroWrapper>`:
   - If yes → remove the `<BreadcrumbJsonLd items={...} />` element (HeroWrapper handles it). Also remove the `BreadcrumbJsonLd` import if it becomes unused.
   - If no → keep `BreadcrumbJsonLd`. The page has no other breadcrumb schema source.
4. `components/hero/Breadcrumbs.tsx:30-39`:
    - Optionally fix the trailing-slash inconsistency. Currently the home id resolves to `https://www.the-anchor.pub/` (with `/`). Change to `https://www.the-anchor.pub` (no slash) so the `@id` aligns with the canonical Restaurant entity emitted by the layout. This is a 1-line tweak inside the schema generation.

**Reviewer requirement:** make the trailing-slash fix non-optional if HeroWrapper remains the schema source. Otherwise the single-source schema still emits a different home id from the canonical business entity.

**Risk analysis:**

- For each page edited, the visible breadcrumb stays unchanged (`<HeroWrapper>` continues rendering it).
- Only the JSON-LD output changes — from 2 BreadcrumbList blocks to 1.
- The fix is verifiable via the same URL Inspection method we used today: any inspected page should now show "1 valid item detected" of type `BreadcrumbList`.
- Risk: if a page uses `BreadcrumbJsonLd` but **not** `HeroWrapper`, removing `BreadcrumbJsonLd` would lose its breadcrumb schema. The per-page enumeration step (3 above) prevents this.

**Verification plan:**

1. After edits, build locally and confirm no errors.
2. Run a site-wide HTML scan (similar to the @id duplicate scan in commit `c28d298`):
   ```python
   # Count BreadcrumbList declarations per built HTML page
   for path in glob('.next/server/app/**/*.html', recursive=True):
       html = open(path).read()
       blocks = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
       count = sum(1 for b in blocks if '"@type":"BreadcrumbList"' in b or '"@type": "BreadcrumbList"' in b)
       if count > 1:
           print(f"{path}: {count} BreadcrumbList")
   ```
3. Expect: zero pages with > 1 BreadcrumbList.
4. Spot-check the previously-affected URLs (`/blog/family-friendly-sunday-lunch-heathrow`, `/sunday-lunch`, `/private-hire/christenings`) via Google's Rich Results Test: <https://search.google.com/test/rich-results>.

**Rollback:** revert the affected files. No external state to undo.

---

### 14.4 R2.4 + R2.5 + R2.6 (combined) — Site-wide orphan-page audit and bulk internal-linking sweep

**Goal:** identify every page on the site with insufficient internal links, classify by topical parent, and add contextual links from logical parent pages so Google has stronger signal that these pages matter.

**Scope (per owner decision 4):** the entire site, not just the 116 GSC-flagged "Crawled — currently not indexed" cohort.

**Reviewer feedback:** broadening to the whole site is sensible, but this should be implemented as an audit-first workflow. Do not start adding links in bulk until the link graph, URL classification, and noindex/redirect candidates are reviewed. Some pages should be removed from the index or redirected, not force-linked.

**Methodology:**

**Phase 1 — Build the link graph.**

1. Extract every canonical URL from `app/sitemap.ts` output. Run the dev sitemap or programmatically import the function.
2. For each URL, count incoming internal links by:
    - Searching `app/**/*.{ts,tsx}` and `components/**/*.{ts,tsx}` for the URL string in `<Link href=...>`, `<a href=...>`, `Button href=...` etc.
    - Searching `content/**/*.md` for `[text](url)` Markdown references.
    - Excluding self-references (page linking to itself, navigation breadcrumbs etc.).
3. Build a CSV: `url, incoming_link_count, sample_referrers`.

**Reviewer requirement:** supplement static searching with a rendered crawl or built-output scan. Static `rg` misses generated links and overcounts dead code. The CSV should include `url_type` (`indexable page`, `redirect source`, `noindex`, `asset`, `parameter variant`, `legacy`) so the sweep does not add links to pages that should not be promoted.

**Phase 2 — Classify.**

| Category | Definition | Action |
|---|---|---|
| **Orphan** | 0 incoming links | Highest priority — needs at least 1 contextual link |
| **Weak** | 1 or 2 incoming links, all from sibling/peer pages (e.g. blog → blog) | Add 1+ link from a "parent" or hub page |
| **Adequate** | 3+ incoming links from non-self pages | No action |

**Phase 3 — Map orphans/weak pages to topical parents.**

For each orphan/weak page, identify the natural parent page by URL hierarchy and topic. Examples (from samples already verified):

| Orphan | Topical parent | Proposed anchor text |
|---|---|---|
| `/blog/family-friendly-sunday-lunch-heathrow` | `/sunday-lunch` | "Read our family-friendly Sunday lunch guide near Heathrow" |
| `/blog/function-room-hire-heathrow-pricing` | `/private-hire` | "Function room hire pricing — see our breakdown" |
| `/blog/christening-party-ideas-venues` | `/private-hire/christenings` | "Browse christening party ideas and venues" |

For pages without an obvious topical parent, the rule is: link from the most-trafficked page where the link is genuinely useful for visitors. Pages that don't fit anywhere should be considered for noindex (see §14.4 caveats).

**Phase 4 — Implement.**

1. Order orphans by SEO value: transactional intent > informational > legacy.
2. For each orphan, edit the parent page once to add a contextual link (sentence + link, not a bare anchor).
3. Each link goes through copy review (style: matches the page's existing tone, plain English, descriptive anchor text).
4. Commit in batches of 5–10 page edits per PR — keeps reviews manageable.
5. After all edits land, rebuild and run the Phase 1 link-counter again. Confirm orphans dropped.

**Reviewer requirement:** each batched PR should include a before/after link-count table and the exact anchor text added. That gives the owner a practical way to reject awkward copy or links that feel engineered.

**Caveats and edge cases:**

- **Pages that genuinely shouldn't be linked anywhere prominent** (e.g. very old blog posts that we're keeping for archival). Decision: add `noindex` frontmatter rather than force a link.
- **Past-event detail pages** that we redirect after they expire: not orphans by definition because the redirect handles them. Skip.
- **Drinks pages with redirects:** if any are still in the sitemap (per the audit in 14.5), confirm whether they should be active pages or redirects. (Already handled for `/drinks/baby-guinness` in [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6).)

**The 5-URL spot check (R2.5 portion):**

Before the bulk sweep, run Phase 1 on a stratified sample of 5 URLs from the 116 "Crawled — currently not indexed" list:

| Sample slot | Cohort | Why this slot |
|---|---|---|
| 1 | Recent blog post | Confirms the orphan pattern on fresh content |
| 2 | Older blog post | Confirms it on older content |
| 3 | Tag page | Different page type |
| 4 | Drinks page | Confirms whether retired SKUs match the pattern |
| 5 | Event page (past or removed) | Confirms whether legacy event URLs match |

If 4+ of 5 confirm the orphan pattern, proceed with the bulk sweep (per decision 6).
If fewer, document the alternative root causes and update the spec before proceeding.

**Risk analysis:**

- Adding internal links is a near-zero technical risk change.
- The actual risk is **link spam** — over-linking degrades user experience and can be flagged by Google. Mitigation: limit to one contextual link per parent page per orphan, and only where the link is genuinely useful for the reader.
- The bulk sweep should not be one mega-PR. Batched PRs of 5–10 page edits keep reviews tractable.

**Verification plan:**

1. After each batched PR, rerun the Phase 1 link-counter for the URLs touched.
2. After all batches land, rerun the full audit. The orphan count should drop substantially.
3. After ~14 days from the final batch, re-export the GSC drilldowns and check whether the "Crawled — currently not indexed" count has dropped.

**Rollback:** each PR is a pure content change. Revert the PR; no external state.

---

### 14.5 R2.7 — Sitemap "Temporary processing error" investigation

**Goal:** identify why Google reports `Sitemaps: Temporary processing error` for some URLs, and fix any underlying intermittent issue with `sitemap.xml`.

**Reviewer feedback:** this is a high-value investigation and should be run in parallel with R2.1. If the sitemap is intermittently stale or failing, internal-linking work may not move the GSC state as expected.

**Methodology:**

1. **Direct fetch tests** — fetch `sitemap.xml` from multiple angles and compare:
   - `https://www.the-anchor.pub/sitemap.xml`
   - `https://the-anchor.pub/sitemap.xml` (apex)
   - `https://www.the-anchor.pub/sitemap.xml/` (trailing slash)
   - With `User-Agent: Googlebot/2.1`
   - With `User-Agent: Mozilla/5.0`
   - With and without `Accept-Encoding: gzip`
   Record each response status, headers (`Cache-Control`, `Content-Type`, `Vary`), body size, and content.

2. **XML validation** — pipe the response through an XML linter (e.g. `xmllint --noout sitemap.xml`). Confirm well-formed.

3. **URL-by-URL validation** — for every URL in the sitemap:
   - Confirm 200 response.
   - Confirm the response is **not** a redirect (sitemap URLs should be canonical 200s).
   - Confirm the response is **not** `noindex`.
   - Confirm the URL appears at most once (no duplicates).
   - Flag any URL that fails any check.

4. **Size check** — Google's sitemap limits are 50,000 URLs and 50 MB uncompressed. Verify our sitemap is well within limits.

5. **Cache header check** — confirm response has the new short cache header (after R2.1 deploys). A long cache here may have contributed to historical "stale sitemap" issues.

6. **Cross-reference with GSC URL Inspection** — for each of the 116 "Crawled — currently not indexed" URLs, check whether `Sitemaps: Temporary processing error` appears. If the error correlates with specific URL patterns, that's a clue.

**Possible root causes (hypotheses to test):**

- Sitemap occasionally returns 5xx or times out (Vercel cold start, API call failure inside `app/sitemap.ts`).
- Sitemap content varies between requests due to dynamic event filtering.
- A handful of URLs in the sitemap are themselves redirects or 404s.
- A `Cache-Control` mismatch between the sitemap and its referenced URLs.

**Fixes (depending on findings):**

- If we find non-200 sitemap URLs: remove them from `app/sitemap.ts` filter logic.
- If we find redirect-source URLs in sitemap: remove (e.g. like the `/drinks/baby-guinness` audit done in [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6)).
- If we find sitemap occasionally times out: investigate the dynamic data fetches inside `app/sitemap.ts` (events API, etc.) and add timeouts/fallbacks.
- If we find content type or encoding issue: fix the response headers.

**Verification plan:**

1. After any fix, fetch sitemap.xml repeatedly (10+ times) and confirm consistent 200 + content.
2. After the next Google re-crawl, re-check URL Inspection for one of the previously-flagged URLs and confirm `Sitemaps: <url>` instead of `Temporary processing error`.

**Rollback:** any code change is to `app/sitemap.ts` or `next.config.js`. Both are revertible without external state effects.

---

### 14.6 R2.5 spot-check results — orphan-pattern verification

**Date:** 2026-04-30
**Sample size:** 5 URLs (stratified) drawn from the 116 "Crawled — currently not indexed" cohort produced by `tasks/gsc-indexing-fix/orchestration/wave-1/gsc-audit-script/sample-output.csv`.
**Methods:**

- **Method A** — static `grep` over `app/`, `components/`, `content/` for the URL path (excluding the page's own source file).
- **Method B** — rendered-output scan: `rm -rf .next && npm run build` (clean prod build, exit 0, 275 generated HTML files), then regex `href="<path>"` and `href="https://www.the-anchor.pub<path>"` across every `.next/server/app/**/*.html` (excluding self-page).

Method B is the gold standard per the consultant's caveat: static grep cannot see links generated at runtime (e.g. tag-page back-links from blog post frontmatter, related-post cards, generated tag indexes).

#### Stratum substitutions

- **Older blog post**: the cohort's first older `cohort=post` URL was `/post/introducing-new-dining-room-the-anchor?utm_source=...` — a `legacy_wix` redirect-source URL with UTM noise (would never have a live page; not a meaningful linking target). Substituted with `https://www.the-anchor.pub/blog/this-december-at-the-anchor` (clean `/blog/` path, last_crawled 2025-12-26, also in the not-indexed cohort).
- **Drink page**: the cohort contains only 4 drink URLs and all 4 are `url_type=redirect_source`. Kept `https://www.the-anchor.pub/drinks/bells` but flagged in the notes — by definition a redirect-source has no live page on the live site so a "0 internal links" finding is uninformative for this stratum.

#### Sampled URLs and link counts

| Stratum | URL | Method A count (static grep) | Method B count (rendered HTML) | Classification |
|---|---|---|---|---|
| Recent blog post | `/blog/christening-party-ideas-venues` | 0 | 4 | ADEQUATE |
| Older blog post | `/blog/this-december-at-the-anchor` | 0 | 5 | ADEQUATE |
| Tag page | `/blog/tag/news` | 1 | 14 | ADEQUATE |
| Drink page | `/drinks/bells` (redirect source) | 0 | 0 | ORPHAN |
| Event page | `/events/music-bingo-2026-05-08` | 0 | 0 | ORPHAN |

#### Aggregate

- ORPHAN or WEAK: **2/5**
- ADEQUATE: **3/5**

#### Method A vs Method B observations

The static grep dramatically under-counted on every URL with rendered links — exactly the problem the consultant warned about:

- Recent blog post: A=0 vs B=4 (referrers: a peer blog post `gender-reveal-party-ideas-venues`, `leaving-party-ideas`, plus tag pages `tag/private-hire`, `tag/guides`).
- Older blog post: A=0 vs B=5 (referrers: peer posts `valentines-day-meal-offer-for-two`, `winter-hours-cosy-times-at-the-anchor`, plus tag pages `tag/community`, `tag/seasonal`, `tag/news`).
- Tag page `/blog/tag/news`: A=1 (a single frontmatter mention in a content markdown file) vs B=14 (the tag index `blog/tags.html`, every blog post tagged "news", and cross-links from sibling tag pages).

Method A only finds links that are literally typed into source. The actual link graph is generated at build time from MDX/markdown frontmatter, the tag index component, the related-posts component, and tag-page sibling rails. Anyone running R2.4-style audits against `rg`/`grep` alone will badly over-count orphans.

Method B was a clean local production build (no `next.config` overrides). It scanned **275** generated HTML files. Self-page references were excluded.

#### Recommendation

**Investigate alternative root causes before any bulk linking sweep.** The threshold for proceeding ("4+/5 ORPHAN or WEAK") was not met. Only 2/5 sampled URLs lack incoming internal links, and the two ORPHAN cases are explicable without a "site-wide orphan" theory:

- `/drinks/bells` is a `url_type=redirect_source` — by design it has no live target page on the production build, so 0 internal links is correct, not a bug.
- `/events/music-bingo-2026-05-08` is a date-stamped event in the very near future (8 May 2026); event pages typically only get linked from `whats-on` while the event is upcoming, then drop off the active feed afterwards. Whether a single specific date-stamped event has zero rendered links is a function of event-list component cutoff, not a generalised orphan problem.

The /blog/ posts and /blog/tag/ pages — which together account for the largest cohort slice (37 posts + 22 tags = 51/116 = 44%) — actually have **healthy internal linking** when measured properly. The "orphan" hypothesis is, on this evidence, false for those URL classes.

#### Notes for the orchestrator and wave gate review

1. **Re-run Method B against the full 116 cohort before approving R2.6.** The 3-URL pre-flight that prompted the orphan hypothesis very likely used static grep only, which dramatically under-reports rendered links. A full Method B sweep is the only way to know how big the actual orphan problem is.
2. **The consultant's caveat (B is mandatory) is now empirically validated.** Static grep missed 4–14 incoming links per page. Any future link-graph work in Workstreams E2/E3/E4 must use rendered-HTML scanning, not source-tree grep.
3. **The "investigate alternative root causes" path** for the not-indexed cohort should consider:
   - **Content quality / thin pages.** Some `/blog/` posts in the cohort look like very short reposts of social copy — Google may simply judge them low-value.
   - **Date-stamped event pages aging out.** A page that was indexed during its event window and then quietly demoted to "not indexed" after the event passed isn't an orphan problem.
   - **Legacy `/post/` Wix URL handling.** A meaningful share of the cohort are `legacy_wix` redirect sources; if they are still showing up in GSC as pages-not-indexed it could be that the redirects are returning 200 instead of 301, or there's a redirect loop. Worth a separate redirect-chain check (which §0.1 reviewer items already flag as a P0).
   - **Sitemap issues.** Already being investigated in §14.5 (R2.7).
4. **If the orchestrator still wants targeted linking work**, scope it narrowly to URLs that the rendered-scan confirms are 0/0 — not a blanket "all 116" sweep. Doing 116 link additions when ~70+ already have adequate incoming links risks Google flagging engineered linking, exactly the §17 reviewer concern.

#### Raw evidence

`tasks/gsc-indexing-fix/evidence/orphan-spot-check.json` contains the full machine-readable record (URLs, both counts, sample referrers, classifications, and the aggregate decision).

---

## 15. Cloudflare cache purge — owner walkthrough (R2.2)

Repeating §14.2's instructions in one place for the owner's convenience:

**Reviewer feedback:** this walkthrough is clear enough for the owner, but the developer should not rely on the browser-only confirmation in step 9. After the owner purges, the developer should capture a command-line response showing the body and cache headers from both apex and www.

1. Open <https://dash.cloudflare.com/> and sign in.
2. Select **`the-anchor.pub`**.
3. Go to **Caching → Configuration**.
4. Click **Custom Purge**.
5. Choose **URL**.
6. Paste:
   ```
   https://www.the-anchor.pub/robots.txt
   https://the-anchor.pub/robots.txt
   ```
7. Click **Purge**.
8. Wait ~30 seconds.
9. Open `https://www.the-anchor.pub/robots.txt` in incognito/private mode and confirm `Disallow: /*?dpl=*` is gone.

Fallback if Custom Purge isn't available: **Purge Everything** (heavier but works). The site will be slightly slower for the next few minutes while the CDN cache warms back up.

---

## 16. Implementation sequencing

Owner approved the following sequence (decision 6):

**Reviewer correction:** the sequencing below still defers the §0.1 P0/P1 items too far. The redirect-error chain investigation, URL lifecycle policy, and regression checks are not "nice to have"; they are the guardrails for the next implementation round. Pull them into PR 1 or PR 2 before the bulk internal-linking sweep begins.

1. **PR 1 — R2.1 + R2.3** (mechanical, low risk).
   - Files: `next.config.js`, `app/blog/[slug]/page.tsx`, `app/heathrow-parking/[terminal]/page.tsx`, `components/hero/Breadcrumbs.tsx`, the ~15+ pages identified in 14.3 step 3.
   - Verification: build clean, scanner confirms 0 duplicate `BreadcrumbList` site-wide, cache headers correct.

2. **R2.2 — Cloudflare purge** (manual; owner does this any time after PR 1 deploys).

3. **R2.5 — Orphan-pattern spot check** (research task, no PR).
   - 5-URL stratified sample per 14.4 Phase 1 + 2.
   - Findings appended to this spec.

4. **R2.4 + R2.6 — Site-wide orphan audit + bulk linking sweep** (multiple batched PRs, 5–10 page edits each).
   - PR 2: orphan audit results CSV + first 5–10 link additions (highest-priority transactional URLs first).
   - PR 3+: subsequent batches.
   - Each PR includes copy diffs for review.

5. **R2.7 — Sitemap investigation** (parallel research task; small fix PR if needed).

6. **Reviewer P0/P1 guardrails** — audit script, CI checks, redirect-error chain investigation, URL lifecycle policy. These should start before or alongside PR 2, not after the full round 2 sweep ships.

---

## 17. What the third-party consultant should focus their review on

If you have limited time, here are the highest-leverage areas to scrutinise:

1. **§14.3 Option A scope**: the duplicate breadcrumb fix touches potentially 17+ pages. Is Option A still the right choice given that scope, or should we revisit Option B (visual-only Breadcrumbs.tsx + add BreadcrumbJsonLd to the ~14 pages that would lose schema)?
2. **§14.4 orphan classification rules**: 0 incoming = orphan, 1–2 from peers = weak, 3+ = adequate. Reasonable thresholds, or should they be tighter/looser?
3. **§14.4 link-spam mitigation**: one contextual link per parent per orphan, only where genuinely useful. Strict enough to avoid Google flagging this as engineered linking, or do we need stricter rules?
4. **§14.5 sitemap investigation methodology**: anything missing from the test matrix? Particularly anything Google might do that we wouldn't catch with our own fetches.
5. **§13 decision 6**: owner explicitly approved "proceed straight to bulk sweep" if the pattern holds. Anything risky about that approach we should reconsider?
6. **General**: anything from the prior reviews (`tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-*`) that's still relevant and not addressed by either the round 1 fixes ([b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6)) or the round 2 plan above?
7. **Reviewer P0/P1 items in §0.1**: still being deferred to a later round. Is that ordering right, or should any of them be pulled forward into round 2?

**Reviewer answer to item 7:** pull forward the redirect-error chain investigation, URL lifecycle policy, and regression checks. The full audit script can be smaller at first, but there must be some automated protection before another large batch of SEO edits ships.
