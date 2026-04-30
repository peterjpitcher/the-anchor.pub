# GSC Indexing — Third-Party Review Pack

**Prepared:** 2026-04-30
**Repo:** `OJ-The-Anchor.pub` (Next.js 14 marketing/booking site for The Anchor pub, Stanwell Moor)
**Last code change for this work:** commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) on `main`
**GSC export consumed:** `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/` — exported 2026-04-29

This pack is for an external reviewer. Everything here is intended to stand alone — links to source files, line numbers, dates, and confidence levels are included so the reviewer can independently verify each claim.

The Anchor's website indexing problems are not new. Prior attempts (see §2) have made progress but left some categories stuck. This document covers the full picture, what just shipped, what's still open, and where I'm uncertain.

---

## 1. Executive summary (plain English)

Google Search Console exported 596 URLs across 8 indexing-status categories on 2026-04-29.

Of those 596:

- **≈ 277** are Google reporting redirects, canonical tags, or stale historical state working correctly. No code change needed.
- **4 real, actionable issues** in code were fixed today and pushed to `main` ([`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6)). They will resolve once the deploy lands and Google re-crawls.
- **3 items are not fully resolved.** One needs investigation after the next re-crawl, one is an external/legacy reference that can't be fixed in code (confirmed by prior reviews), and one cohort of ~116 URLs is "Google chose not to index" — a content-quality issue, not a code bug.

Honest assessment of confidence: I am **highly confident** in the four shipped fixes (verified against built output). I am **moderately confident** that they will resolve the categories I claim. I am **low confidence** that the 7 "Redirect error" cohort will clear without further work — I deferred that and would welcome a reviewer's view on whether to dig in now or wait.

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

**Key historical finding (from the 2026-04-12 Codex review):** the broken image URL `/images/page-headers/drinks/optimized/drinks-1920w` was confirmed not to exist anywhere in the codebase. Codex concluded it's a legacy Wix reference Google still has cached, not a fixable code issue. I'm treating that conclusion as authoritative — see §6.

---

## 3. The full set of problems

596 URLs reported by GSC on 2026-04-29, broken down by category and pattern. All counts are derived directly from the Table.csv in each export folder.

### 3.1 Page with redirect — 221 URLs

URLs that returned a redirect when crawled. The `Last crawled` column shows when Google last hit them.

| Pattern | Count | Source | Status |
|---|---|---|---|
| `/blog/tag/*` redirects | 120 | `config/redirects/tag-redirects.json` consolidates synonym tags | **Working as designed.** GSC will drop these as it re-crawls. |
| `/post/*` (Wix legacy) | 28 | `config/redirects/blog-redirects.json` | **Working as designed.** |
| `/blog/page/*` paginated | 8 | `config/redirects/additional-redirects.json` | **Working as designed.** |
| `/event-details/*` (legacy) | 6 | `config/redirects/legacy-redirects.json` + wix | **Working as designed.** |
| Various dated `/events/*` | 12 | `config/redirects/additional-redirects.json` | **Working as designed.** |
| `/drinks/*` retired SKUs | 9 | `config/redirects/drinks-redirects.json` | **Working as designed.** |
| HTTP→HTTPS / apex→www | 4 | `middleware.ts` lines 16–25 | **Working as designed.** |
| Other one-offs | 34 | various | **Working as designed.** |

### 3.2 Blocked by robots.txt — 137 URLs

| Pattern | Count | Status |
|---|---|---|
| `/_next/static/css/HASH.css?dpl=DEPLOY_ID` | 106 | **Was blocked by `/*?dpl=*` rule. Fixed in [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6).** |
| `/api/calendar/event/...` | 21 | **Correctly blocked by `/api/` rule. No fix needed.** |
| `/test-*`, `/debug-*`, `/components`, `/gtm-debug`, `/demo-header`, `/p5-demo` | 11 | **Stale GSC report.** None match any current `disallow` rule in `app/robots.ts`. The pages don't exist — they likely return 404 today. Will drop on re-crawl. |

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
| `/images/page-headers/drinks/optimized/drinks-1920w` | 1 | **Cannot fix from code.** Confirmed non-existent in repo by prior Codex review (`tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-assumption-breaker-report.md` §2). Legacy Wix image URL Google still has cached. |

### 3.5 Crawled — currently not indexed — 116 URLs

These were crawled successfully and Google chose not to index. This is a **content-quality signal**, not a technical error.

| Pattern | Count | Likely cause |
|---|---|---|
| `/blog/tag/*` (consolidated thin tags) | 22 | Tag pages with 1–2 posts |
| `/post/*` (Wix legacy) | 16 | Old URLs, redirected, Google slow to drop |
| `/event-details/*` (legacy) | 11 | Same |
| `/events/*` past dates | ~25 | Past events; expected to fall out |
| Individual `/blog/*` posts | ~30 | Older posts with low engagement |
| `/drinks/*` retired SKUs | 5 | Same as drinks-redirects |
| Misc one-offs | ~7 | Mostly UTM/query variants |

**Status:** unaddressed in this session beyond the redirect fixes. Most will resolve naturally as the redirected ones drop out and past events expire from the API. Anything left after that is a content quality task — out of scope for a redirect/config audit.

### 3.6 Alternative page with proper canonical tag — 11 URLs

UTM-tagged or query-string variants where the canonical correctly points at the parent URL. Working as designed; no action.

### 3.7 Redirect error — 7 URLs

| URL | Redirect destination | Redirect added | Last crawled |
|---|---|---|---|
| `https://www.the-anchor.pub/blog/tag/premier-league` | `/blog/tag/sports` | 2025-12-28 (`tag-redirects.json`) | 2026-01-23 |
| `https://www.the-anchor.pub/blog/tag/rugby` | `/blog/tag/sports` | 2025-12-28 | 2026-01-20 |
| `https://www.the-anchor.pub/blog/tag/dog-friendly` | `/blog/tag/community` | 2025-12-28 | 2026-01-07 |
| `https://www.the-anchor.pub/blog/tag/pet-friendly` | `/blog/tag/community` | 2025-07-16 | 2026-01-18 |
| Apex variants of `pet-friendly`, `premier-league`, `rugby` | (same) | (same) | 2026-01-05 to 2026-01-23 |

All four destinations (`community`, `sports`) are live tag pages with posts. Redirects existed at crawl time. **Root cause unknown.**

Hypotheses (in order of plausibility):
1. Apex variants double-hop: `the-anchor.pub` → `www.the-anchor.pub` (middleware) → `/blog/tag/<destination>` (next.config redirect). Google sometimes flags 2-hop chains.
2. Transient response failure / timeout at crawl time on the destination page.
3. Cache-related issue at Vercel edge.

**Status: deferred.** I want to see if these clear after the next re-crawl following [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6). If they don't, options are (a) flatten the apex variants to single-hop edge redirects, (b) instrument the destination pages for timeout monitoring.

### 3.8 Discovered — currently not indexed — 17 URLs

Found via sitemap, not yet crawled. Mostly recent additions: 5× `/private-hire/near/*` programmatic landmark pages, 6× recent blog posts, and 6 individual one-offs. **Normal for new content.** Re-check in 30 days.

---

## 4. Evidence cross-reference table — verifying which "404" reports are stale

This table is the single most important evidence in this document. It shows, for the 17 tag-URLs marked "Not found (404)", that the redirect was added *after* Google's last crawl — i.e. the live site is no longer 404'ing them.

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

**Risk:** very low. The X-Robots-Tag header is the correct tool for "don't index this asset URL"; robots.txt is the wrong tool because Googlebot needs to *fetch* the asset to render the page. That's exactly what the dpl rule was preventing.

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
- I have **not** end-to-end tested a missing-event request against the deployed build because we haven't deployed yet. The compiled output has the right code; the runtime behaviour will need to be confirmed once deployed.

**A failed earlier attempt during this session (transparency):** I first tried adding `app/events/[id]/not-found.tsx` calling `permanentRedirect('/whats-on')`. It compiled clean but Next.js silently dropped the file from the build output (I confirmed `EventNotFound` doesn't appear in any `.next/server/**/*.js`). My hypothesis is that Next.js requires `not-found.tsx` to render UI for the 404 status code — a pure-redirect implementation gets tree-shaken or rejected. I then deleted the file and used the page.tsx approach instead, which the build does compile. I'm flagging this in case the reviewer has direct experience with Next.js 14 not-found behaviour.

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

**Resolves:** 1 URL.

---

## 6. What's still open

### 6.1 The 7 "Redirect error" tag URLs (§3.7)

**Status:** deferred. Redirects exist in code; root cause unknown.

**My recommendation:** wait for the next Google re-crawl after [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) deploys. If they clear, no action. If they don't, investigate by:
1. Manually testing the apex→consolidated redirect chain for each affected slug (e.g. `curl -I https://the-anchor.pub/blog/tag/premier-league` and follow redirects, check status codes).
2. Looking at Vercel function logs around the GSC crawl times for any 5xx or timeout responses on those URLs.
3. Considering whether to flatten the 2-hop redirects.

**Reviewer question:** Is there value in pre-emptively investigating now, or is "wait and see" the right call?

### 6.2 The broken image URL `/images/page-headers/drinks/optimized/drinks-1920w` (§3.4)

**Status:** confirmed unfixable from code by a prior Codex review (`tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-assumption-breaker-report.md` §2). I verified independently:
- `grep -rn "drinks-1920w"` across `app/`, `components/`, `lib/`, `content/`, `public/` — no matches except in prior review docs.
- `public/images/page-headers/drinks/` exists; `public/images/page-headers/drinks/optimized/` does not.

This is an external/legacy URL Google cached. It will drop from GSC once Google stops re-crawling it.

**No action available.**

### 6.3 The 116 "Crawled — currently not indexed" URLs (§3.5)

**Status:** unaddressed in this session.

**Analysis:** these aren't a code bug. Google fetched the pages, parsed them, and decided not to index. The most common causes for this status are:
- Thin content (tag pages with 1–2 posts)
- Duplicate content (similar to other indexed pages)
- Stale or low-engagement pages
- Past events / time-bound content

**Likely path forward:**
- ~50 URLs are past events / Wix legacy → will drop naturally as the redirects ([5.2](#52-appeventsidpagetsx--drafts-and-missing-events-redirect-to-whats-on) above) take effect.
- ~22 thin tag pages → would need content consolidation (write more posts under those tags, or noindex the thin ones).
- ~30 individual blog posts → case-by-case content review.

**Reviewer question:** is this worth expanding into a content-quality task, or is "let the redirects do their work and revisit in 60 days" the right call?

### 6.4 Out-of-scope clean-ups noticed during discovery

These weren't part of the original GSC categories but I noticed them during the audit. Surfaced for the reviewer's awareness; not actioned.

- `next.config.js` loads 6 redirect JSON files merging to **647 rules** (after my +1 / −1). At some scale this becomes a maintenance and cold-start concern. Vercel's documented soft limit is around 1,024 redirects before edge-function performance starts to degrade.
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
| `tasks/gsc-indexing-fix/SPEC.md` | The discovery spec produced earlier in this session (now superseded by this review pack but useful for audit trail). |
| `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/` | Source data — Table.csv per category. |
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

## 8. Where I might be wrong (explicit list of risks)

1. **The events page change might not actually fix the 7 dated-event 404s.** Those events were last crawled between Feb 19 and Apr 16, after the Feb 18 catch-block redirect was added. The catch block already redirects on API errors, so my added `if (!event)` and `if (status === 'draft')` redirects are belt-and-braces. The actual reason Google saw 404 is still unknown — could be SSG-prerendered stale HTML for events that existed at build time but were deleted from the API. I want a reviewer's view on whether to also clean the SSG cache for missing events.

2. **The robots.txt fix relies on Google re-fetching `robots.txt`.** Google caches it for ~24 hours. The 106 URLs won't update in GSC until a re-crawl after the re-fetch.

3. **My "stale GSC report" claim depends on Google re-crawling.** If for some reason these URLs aren't re-crawled (low-priority pages), the GSC report won't update even though the live site behaves correctly. Validation in GSC's "Validate fix" UI nudges Google to re-prioritise.

4. **I have not deployed yet.** All verification above is against the local build (`.next/`). Actual production behaviour will need to be re-verified once Vercel deploys [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6).

5. **The not-found.tsx misadventure (5.2) is unresolved as a question.** I worked around it by editing `page.tsx` instead, but I don't fully understand why my `not-found.tsx` was dropped from the build. If the reviewer has Next.js 14 expertise, an explanation would be welcome.

---

## 9. Verification plan after deploy

Once [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) is live (typically 2–5 min from push):

1. Fetch live `https://www.the-anchor.pub/robots.txt` and confirm no `Disallow: /*?dpl=*` line.
2. Fetch `https://www.the-anchor.pub/_next/static/css/<HASH>.css?dpl=<DEPLOY_ID>` for any current CSS hash and confirm it returns 200 (not 403/blocked).
3. Fetch `https://www.the-anchor.pub/events/quiz-night-2026-12-02` (or any of the §3.4 missing-event URLs) and confirm a 308 to `/whats-on`.
4. Fetch `https://www.the-anchor.pub/drinks/baby-guinness` and confirm 200 with the actual page content.
5. Fetch `https://www.the-anchor.pub/hr` and confirm 308 to `/`.
6. In GSC → Page indexing, click "Validate fix" on these four reports:
   - Page with redirect
   - Blocked by robots.txt
   - Not found (404)
   - Excluded by 'noindex' tag
7. Wait 14 days for Google to re-crawl, then re-export GSC drilldowns and rerun the discovery script in `tasks/gsc-indexing-fix/SPEC.md` to see the new shape.

---

## 10. Open questions for the reviewer

1. The deferred 7 "Redirect error" URLs (§6.1) — investigate now or wait?
2. The 116 "Crawled — currently not indexed" (§6.3) — content task or accept?
3. The Next.js 14 `not-found.tsx` behaviour (§5.2 / §8.5) — any insight on why a redirect-only `not-found.tsx` was silently dropped?
4. Anything in the prior third-party reviews (`tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-*`) that's still relevant and not addressed by what's been done since?
5. Anything missing from this audit that you'd expect to see?
