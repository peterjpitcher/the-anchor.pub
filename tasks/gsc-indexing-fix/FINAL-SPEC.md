# GSC Indexing Fix - Completion Spec

**Site:** https://www.the-anchor.pub
**Repo:** `OJ-The-Anchor.pub`
**Updated:** 2026-04-30 (round 7 — final verification + tag lifecycle classification applied; P0 + P1 + P2 pre-deploy complete)
**Purpose:** single execution and verification spec for finishing the Google Search Console indexing work.

---

## Current status (this session)

All P0, P1, and P2 pre-deploy items below are now implemented in branch `fix/gsc-indexing-final`.
The four review findings from the previous attempted completion have been fixed:

- middleware redirect flattening now preserves external destinations instead of forcing them into same-site paths;
- sitemap event fetching is bounded by a two-phase, per-page timeout strategy instead of a 20-page sequential wait;
- CI runs the deliberately scoped `lint:next` command instead of the currently failing, unrelated hero audit;
- the P2 triage CSV now includes current status, canonical, robots, rendered incoming-link count, sample referrers, action, and recommendation;
- noindex blog posts are no longer surfaced through indexable blog archives/tag pages, and three stale dated posts have been moved to the noindex lifecycle;
- broad blog tag archive pages (`events`, `food-and-drink`, `news`, `sports`) now render `noindex, follow` and are excluded from the sitemap, so search equity can concentrate on the stronger topical landing pages.

Production verification is **pending deploy** — see §11 below. Pre-deploy verification:

- `node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` → counts unchanged (596 URLs, 7 redirect-error, 116 crawled-not-indexed) ✓
- `npm test -- --runInBand seo-indexing event-seo-strategy sitemap-events` → 38 tests pass ✓
- `npm run lint:next` → clean (`audit:hero` failures are pre-existing tech debt, not GSC-related) ✓
- `npm run build` → clean (middleware bundle 36.2 kB) ✓
- `node tasks/gsc-indexing-fix/triage-not-indexed.mjs` → 116 enriched rows emitted; manual-review cohort reduced to 5 URLs ✓

Code/policy/test changes:

| File | Change |
|---|---|
| `lib/middleware-redirects.ts` | New. Concrete redirect lookup map (~3,200 rules pre-filtered to non-pattern sources), with URL resolver that preserves external destinations and same-site query strings. |
| `middleware.ts` | Looks up `pathname` against the map; emits a single redirect combining host change and path change for same-site destinations without breaking external redirects. Fixes apex 2-hop chains. |
| `next.config.js` | Removed misleading `X-Robots-Tag: noindex, nofollow` from `/_next/static/*`, `*.js`, `*.css`, `*.woff2`, `/_next/image`, `/fonts/*` (Cloudflare overrides them anyway). Documented robots.txt cache policy with Cloudflare-extended browser TTL. |
| `app/sitemap.ts` | Two-phase bounded event fetching: page 0 first, then remaining pages in parallel only if page 0 is full; per-page abort timeout + partial fallback. Function now exported for direct testing. |
| `lib/markdown.ts` | Added `getIndexableBlogPosts()` so archive-style surfaces can intentionally exclude `noindex` posts. |
| `lib/blog-tag-policy.ts` | New. Shared policy for broad blog tag archives that should remain browseable but not indexable (`events`, `food-and-drink`, `news`, `sports`). |
| `app/blog/page.tsx`, `app/blog/tags/page.tsx`, `app/blog/tag/[tag]/page.tsx` | Blog archive and tag archive pages now surface only indexable posts; broad archive tag pages emit `noindex, follow`. |
| `app/blog/[slug]/page.tsx` | Previous/next navigation on indexable posts no longer links into intentionally noindexed archive posts. |
| `content/blog/winter-hours-cosy-times-at-the-anchor/index.md`, `content/blog/what-is-the-history-of-april-fools-day/index.md`, `content/blog/womens-day-2024/index.md` | Stale/outdated dated posts moved to `noindex: true` lifecycle. |
| `content/blog/family-friendly-sunday-lunch-heathrow/index.md`, `content/blog/cosy-pub-stanwell/index.md` | Added practical internal links from evergreen support content to the main commercial/local pages it supports. |
| `tests/seo-indexing.test.ts` | Added: OG-image robots.txt allow-check; redirect-error URL coverage (4 URLs × `it.each`); external redirect resolver guard; same-site query preservation guard; pattern-source guard; map-size sanity; destinations-not-sources guard; noindex archive-surface guards; broad tag noindex/sitemap guards. |
| `tests/event-seo-strategy.test.ts` | New. 11 tests covering all 5 lifecycle stages. |
| `tests/sitemap-events.test.ts` | New. 5 tests covering happy path, draft skip, full failure, partial failure, empty-batch break. |
| `.github/workflows/ci.yml` | New. Two jobs: `seo-and-lint` (fast scoped SEO tests + `lint:next`) and `build` (full). Triggers on PR + push to main. |
| `tasks/gsc-indexing-fix/url-lifecycle-policy.md` | New. Decision matrix + per-content-type policy. |
| `tasks/gsc-indexing-fix/triage-not-indexed.mjs` | New. Generates enriched per-URL triage CSV from audit output, local rendered HTML, and live fetch evidence for real page candidates. |
| `tasks/gsc-indexing-fix/evidence/crawled-not-indexed-triage.csv` | New. 116 URLs classified by action with status, canonical, robots, incoming-link evidence, sample referrers, and recommendation. |

This document supersedes the older working docs in this folder for implementation purposes:

- `tasks/gsc-indexing-fix/SPEC.md`
- `tasks/gsc-indexing-fix/REVIEW-PACK.md`
- `tasks/gsc-indexing-fix/IMPLEMENTATION-PLAN.md`
- `tasks/gsc-indexing-fix/orchestration/**`

Keep those files as audit history, but implement from this file.

## 1. Current verdict

The work is salvageable, and the local pre-deploy implementation is now in a much stronger state. The previous work was not complete because it downgraded reviewer P0/P1 issues and overstated the P2 triage. This version fixes those gaps: redirect flattening, sitemap resilience, scoped CI, lifecycle policy, enriched triage, and archive/noindex cleanup are implemented and covered by local checks. Production verification and GSC validation remain pending deploy.

Do not start a broad content-linking or copy rewrite project as part of the indexing fix. The technical guardrails are now in place; use the enriched triage CSV to keep content-growth work limited to the 5 `manual-review-page` candidates.

This is not a cosmetic GSC cleanup project. The goal is to remove the underlying technical and lifecycle causes that stop Google crawling, rendering, trusting, and indexing the site, then use the cleaned-up data to support organic search growth. Do not accept fixes that merely hide URLs from a report, redirect everything to generic pages, or wait for re-crawl without proving the root cause has been addressed.

For every remaining issue, the developer must identify the durable owner of the behaviour:

- code/config,
- Cloudflare/Vercel/platform headers,
- Google stale data,
- intentionally retired content,
- content quality or internal-linking weakness.

Only code/config/platform/content-quality issues should become implementation work. Stale Google data should be documented with evidence and monitored after validation.

## 2. Sources reviewed

- Original GSC exports: `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30*/`
- Existing task docs: `SPEC.md`, `REVIEW-PACK.md`, `IMPLEMENTATION-PLAN.md`, orchestration notes, evidence files.
- Commits reviewed:
  - `d56cfaf` duplicate FAQPage and Restaurant schema cleanup on `/sunday-lunch`
  - `c28d298` duplicate `@id: /#business` schema cleanup
  - `b319ee6` robots, events, baby-guinness, `/hr` fixes
  - `29cf4cd` robots/sitemap cache and sitemap ISR fix
  - `af2d28e` BreadcrumbList deduplication
  - `e52cd0b` SEO regression tests and GSC CSV audit script
  - `49cca59` sitemap function file-tracing fix for blog markdown
  - `e98d29b` previous final spec
- Live production checks run on 2026-04-30 at about 18:27 Europe/London.

## 3. Baseline GSC data

The original export contains 596 URLs across 8 GSC categories.

Run:

```bash
node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs
```

Current correct pivot from the committed script:

| Issue | Total | page | redirect_source | static_asset | legacy_wix | parameter_variant | og_image |
|---|---:|---:|---:|---:|---:|---:|---:|
| Page with redirect | 221 | 83 | 102 | 0 | 34 | 2 | 0 |
| Blocked by robots.txt | 137 | 31 | 0 | 106 | 0 | 0 | 0 |
| Excluded by noindex tag | 57 | 54 | 0 | 0 | 3 | 0 | 0 |
| Not found (404) | 30 | 10 | 19 | 0 | 1 | 0 | 0 |
| Crawled - currently not indexed | 116 | 34 | 25 | 2 | 27 | 9 | 19 |
| Alternative page with proper canonical tag | 11 | 0 | 0 | 0 | 0 | 11 | 0 |
| Redirect error | 7 | 0 | 7 | 0 | 0 | 0 | 0 |
| Discovered - currently not indexed | 17 | 17 | 0 | 0 | 0 | 0 | 0 |

Important correction: the previous `FINAL-SPEC.md` appendix had outdated `url_type` counts, including an incorrect OG-image total. Use the audit script output above as the source of truth.

## 4. What appears properly fixed

These are accepted unless future GSC exports or production checks contradict them.

### 4.1 `robots.txt` no longer blocks deploy-tagged static assets

Problem: `app/robots.ts` used to disallow `/*?dpl=*`, which blocked Vercel deploy-tagged CSS under `/_next/static/*.css?dpl=...`.

Current state:

- `app/robots.ts` no longer contains `/*?dpl=*`.
- Production `robots.txt` body no longer contains `Disallow: /*?dpl=*`.
- A live deploy-tagged CSS URL returns `200`.
- `tests/seo-indexing.test.ts` now guards against reintroducing the `dpl` block.

Do not re-add any robots rule that blocks `?dpl=` globally.

### 4.2 Sitemap is back to cached, complete output

Problem: `app/sitemap.ts` had `dynamic = 'force-dynamic'`, which defeated the declared `revalidate = 60 * 60` and made each sitemap request call the management API.

Current state:

- `dynamic = 'force-dynamic'` has been removed.
- Live sitemap returns `200`.
- Live sitemap now shows `Cache-Control: public, max-age=300, s-maxage=300, must-revalidate`.
- A second immediate fetch returned `x-vercel-cache: HIT`.
- `next.config.js` now includes `content/blog/**/*` in file tracing for the sitemap and blog routes, fixing the temporary 215 -> 134 URL regression.
- `tests/seo-indexing.test.ts` guards sitemap URLs against redirect-source conflicts and noindex blog-post inclusion.

### 4.3 `/drinks/baby-guinness` contradiction is fixed

Problem: `/drinks/baby-guinness` was both listed in the sitemap and configured as a redirect source.

Current state:

- The redirect has been removed from `config/redirects/drinks-redirects.json`.
- Live `/drinks/baby-guinness` returns `200`.
- The sitemap-vs-redirect regression test would catch this if it returned.

### 4.4 `/hr` no longer 404s

Problem: `/hr` appeared in the 404 cohort and had no route or redirect.

Current state:

- `/hr` redirects to `/`.
- Live `/hr` returns `301 Location: /`.

Rework still needed: this destination must be documented in the URL lifecycle policy and confirmed as intentional. If the owner wants a jobs/careers destination or a 410 instead, change it there.

### 4.5 Duplicate schema cleanup appears sound

Shipped cleanup:

- Duplicate `FAQPage` on `/sunday-lunch`: fixed in `d56cfaf`.
- Duplicate `@id: https://www.the-anchor.pub/#business`: fixed in `c28d298`.
- Duplicate `BreadcrumbList`: fixed in `af2d28e`.

Evidence:

- Post-fix scans in `tasks/gsc-indexing-fix/evidence/`.
- Production spot checks in the previous review pack.
- No new evidence found that these need rework.

## 5. Rework completed and remaining verification

The earlier review findings have been reworked below. The only remaining indexing work is deploy-time verification and GSC validation; the separate content-growth review is deliberately scoped to the 5 `manual-review-page` URLs from the triage CSV.

### P0. Flatten and test the 7 redirect-error URLs ✅ Implemented (verification pending deploy)

GSC export:

| Last crawled | URL |
|---|---|
| 2026-01-23 | `https://www.the-anchor.pub/blog/tag/premier-league` |
| 2026-01-20 | `https://www.the-anchor.pub/blog/tag/rugby` |
| 2026-01-18 | `https://the-anchor.pub/blog/tag/pet-friendly` |
| 2026-01-09 | `https://the-anchor.pub/blog/tag/premier-league` |
| 2026-01-07 | `https://www.the-anchor.pub/blog/tag/pet-friendly` |
| 2026-01-07 | `https://www.the-anchor.pub/blog/tag/dog-friendly` |
| 2026-01-05 | `https://the-anchor.pub/blog/tag/rugby` |

**Root cause:** middleware emitted apex → www host redirect, then Next.js
`redirects()` in `next.config.js` emitted a second redirect for the path
consolidation. Each lap was a separate 301; apex URLs spent two hops landing
on `/blog/tag/sports` or `/blog/tag/community`. GSC reported the longer apex
chains as "Redirect error" while the www single-hop variants (also flagged) are
likely stale entries that never re-crawled after the consolidation rules
shipped.

**Durable fix (code/config):**

- New `lib/middleware-redirects.ts` builds a `Map<source, RedirectRule>` at
  module load, eagerly importing every concrete (non-pattern) redirect from
  all six JSON files. Pattern-based sources (`:slug`, `:path*`, `(.*)`) are
  intentionally skipped — they remain in the framework redirects pipeline.
- `middleware.ts` runs the lookup after host normalisation. If the path
  matches, middleware applies BOTH the host change and the path change in a
  single 301 response. The Next.js redirects() pipeline is therefore a no-op
  for these URLs because middleware has already redirected.
- External concrete redirects are explicitly resolved with `new URL(destination)`;
  they are not written into `url.pathname`. Same-site concrete redirects
  preserve the request query string when the destination has no explicit query.
- The framework redirects() entries stay in `next.config.js` as a safety net
  for any path that bypasses middleware (e.g. `/_next/*`, `/favicon.ico`).

**Tests:**

- `tests/seo-indexing.test.ts` adds:
  - `it.each` over the four offending source paths, asserting `lookupRedirect`
    returns the expected destination and a 301.
  - Map-size sanity bounds.
  - Destinations-not-sources guard preventing accidental chain reintroduction.
  - Pattern-source negative tests.
  - External redirect and same-site query preservation guards.

**Production verification (run after deploy):**

```bash
# Each command should land on /blog/tag/sports or /blog/tag/community in one
# 301 hop. Watch for `Location:` and the count of `HTTP/` lines under -L.
curl -sI https://www.the-anchor.pub/blog/tag/rugby | grep -E '^(HTTP|Location|location)'
curl -sI https://www.the-anchor.pub/blog/tag/premier-league | grep -E '^(HTTP|Location|location)'
curl -sI https://www.the-anchor.pub/blog/tag/pet-friendly | grep -E '^(HTTP|Location|location)'
curl -sI https://www.the-anchor.pub/blog/tag/dog-friendly | grep -E '^(HTTP|Location|location)'
# Apex variants — should now go directly to https://www.the-anchor.pub/<dest>:
curl -sI https://the-anchor.pub/blog/tag/rugby | grep -E '^(HTTP|Location|location)'
curl -sI https://the-anchor.pub/blog/tag/premier-league | grep -E '^(HTTP|Location|location)'
curl -sI https://the-anchor.pub/blog/tag/pet-friendly | grep -E '^(HTTP|Location|location)'
```

**Expected after deploy:**

- Single `301` with `Location: https://www.the-anchor.pub/blog/tag/<sports|community>` for each of the seven URLs.
- A subsequent `curl -L` on the destination should return `200` with the consolidated tag page.
- No `Location: https://www.the-anchor.pub/blog/tag/<source>` intermediate hop on apex variants.

**GSC validation:** click "Validate fix" on the Redirect-error report only after the production verification commands above all show single-hop redirects.

### P0. Create a URL lifecycle policy and align event handling to it ✅ Implemented

**Root cause:** team had no codified policy on retirement (301 vs 410 vs
404 vs noindex vs leave-indexable), so each missing event / retired drink /
old tag had ad-hoc decisions, several of which produced GSC churn.

**Durable fix (policy + tests):**

- New `tasks/gsc-indexing-fix/url-lifecycle-policy.md` — decision matrix
  (cases A–E), per-content-type rules covering events, blog tags, legacy Wix,
  drinks, one-off pages, and stale posts. Operating rules forbid blanket
  redirects to `/`, robots-block workarounds, and chain reintroduction.
- Broad blog tag archives that are useful for visitors but weak as search
  landing pages (`events`, `food-and-drink`, `news`, `sports`) are documented
  as case E: render for browsing with `noindex, follow`, stay out of the sitemap,
  and pass equity toward stronger topical pages.
- The current event behaviour (blanket 301 → `/whats-on` for missing/draft
  events) is **kept** with an explicit rationale recorded in §1 of the
  policy: `/whats-on` is the closest topical replacement for an event that no
  longer exists, and it is itself a strong indexable hub. Documented as case
  B (parent-level redirect).

**Tests:**

- `tests/event-seo-strategy.test.ts` — 11 tests covering:
  - Active future event (indexable, no banner).
  - Active future sold_out event (indexable).
  - Recently past event (indexable + ended banner).
  - Boundary at `PAST_EVENT_REDIRECT_DAYS = 30` (still recent).
  - Stale past with next event (301 to next event slug).
  - Stale past with id-only next event (301 to id).
  - Stale past without next event (noindex, no redirect).
  - Cancelled within 7 days (indexable, no redirect).
  - Cancelled past 7 days (noindex, no redirect).
  - Cancelled with future date (still indexable in cancelled-window).

`getEventSeoStrategy()` in `lib/event-seo-strategy.ts` is unchanged —
behaviour was already correct, the gap was the absence of tests.

**No code change to `app/events/[id]/page.tsx`** — its `permanentRedirect('/whats-on')` for missing/draft events is intentional and now policy-backed.

### P1. Wire SEO regression tests into CI ✅ Implemented

**Durable fix (code/config):** new `.github/workflows/ci.yml` with two jobs:

- `seo-and-lint` — Node 20, runs `npm test -- --runInBand seo-indexing event-seo-strategy sitemap-events` then `npm run lint:next`. Fast (< 8 minutes timeout). Fail-fast guardrail.
- `build` — full `npm run build` separately so build failures don't mask test failures, with a 15-minute cap.

Both run on `pull_request` and `push: main`. Concurrency group cancels in-flight runs when a new commit lands.

**Note on `npm run lint`:** the script chains `lint:next` (ESLint, clean) and `audit:hero` (custom hero-image policy script). The hero script currently fails on 24 pre-existing page/CTA/image findings and is not GSC-related. CI therefore runs `npm run lint:next` deliberately; adding the full `npm run lint` back to CI must wait until the separate hero audit debt is fixed, otherwise every PR will fail for known unrelated work.

### P1. Decide and fix the static asset `X-Robots-Tag` mismatch ✅ Implemented (relax + document)

**Root cause (platform):** Cloudflare's edge transforms or Workers replace
`X-Robots-Tag` with `all` on cached responses for static assets. Vercel emits
the configured `noindex, nofollow`, but it never reaches the user-agent.

**Decision:** option B from the spec — remove the misleading directive from
code. Static CSS/JS being theoretically indexable is not an SEO risk
(no useful query content, hashed filenames change on every deploy). What
matters is that crawlability is intact, which it already is.

**Durable fix (code):** removed `X-Robots-Tag: noindex, nofollow` from the
following routes in `next.config.js` (kept `Cache-Control` everywhere):

- `/_next/static/:path*`
- `/(.*).js`, `/(.*).css`, `/(.*).woff2`
- `/_next/image(.*)`
- `/fonts/(.*)`

`/favicon.ico` and `/manifest.json` retain their headers — those routes are
served by Next.js itself and the directives may be honoured in some
environments.

**Production verification (after deploy):**

```bash
curl -sI 'https://www.the-anchor.pub/_next/static/css/<hash>.css?dpl=<id>' \
  | grep -iE 'x-robots-tag|cache-control'
```

Expected: `Cache-Control: public, max-age=31536000, immutable`. `X-Robots-Tag` may be absent or `all` — either is acceptable.

### P1. Confirm OG-image routes stay crawlable and noindexable ✅ Implemented

**Durable fix:** new test in `tests/seo-indexing.test.ts` `robots.txt`
describe block:

```ts
it('does not disallow event opengraph-image routes', () => {
  const offending = disallow.filter((rule) => rule.includes('opengraph-image'))
  expect(offending).toEqual([])
})
```

This ensures `app/robots.ts` will never silently regress to blocking OG-image
routes. The test runs in CI on every PR.

**Production smoke check (run after deploy):**

```bash
curl -sI https://www.the-anchor.pub/events/<some-event-slug>/opengraph-image \
  | grep -iE 'content-type|x-robots-tag'
```

Expected: `Content-Type: image/png`, `X-Robots-Tag: noindex, nofollow, noimageindex`. The route handler in Next.js sets these directly; Cloudflare typically does not strip them on dynamic OG routes.

**Triage outcome:** the 19 OG-image URLs in the "Crawled - currently not indexed" cohort have action `no-action-non-page` in `evidence/crawled-not-indexed-triage.csv`. They will drop out of the GSC report once Google reclassifies them as image resources rather than pages.

### P1. Investigate the robots.txt cache header mismatch ✅ Implemented (documented)

**Root cause (platform):** Cloudflare's "Browser Cache TTL" page rule
extends `max-age` for `robots.txt` from the origin's 300 to 14400 (4 hours).
Shared-cache `s-maxage=300` is preserved, so the CDN refreshes every 5
minutes. Net effect: hot-fixes propagate to crawlers within 5 minutes; user
browsers may cache for up to 4 hours (irrelevant for crawlers).

**Decision:** keep the 4-hour browser TTL as Cloudflare's default and accept
shared-cache 5-minute as the operative refresh. The previous spec's "5 minute
TTL" claim was inaccurate — corrected here.

**Durable fix (code):** added a comment block in `next.config.js` documenting
the policy and stating that hot-fix propagation is via Cloudflare URL purge,
not by lowering `max-age`. No header value change — code intent matches
operational reality (`s-maxage=300` is what matters for crawlers).

**Hot-fix purge procedure for `robots.txt`:**

1. Edit `app/robots.ts`, deploy.
2. In Cloudflare dashboard: Caching → Configuration → Purge by URL:
   `https://www.the-anchor.pub/robots.txt` (and `https://the-anchor.pub/robots.txt`).
3. Verify with `curl -sI https://www.the-anchor.pub/robots.txt` — expect `cf-cache-status: MISS` then `HIT` on next call.

**Production verification (after deploy):**

```bash
curl -sI https://www.the-anchor.pub/robots.txt | grep -iE 'cache-control|cf-cache'
```

Expected (current): `Cache-Control: public, max-age=14400, s-maxage=300, must-revalidate` (Cloudflare-extended). `cf-cache-status: HIT` after the second request.

### P1. Harden sitemap event fetching ✅ Implemented

**Root cause (code):** the previous `getSitemapEvents()` wrapped the entire
20-page loop in a single try/catch with no timeout. A slow or unresponsive
management API page could hang the whole sitemap regeneration, surfacing as
a "Temporary processing error" in GSC.

**Durable fix (code):** rewrote `getSitemapEvents()` in `app/sitemap.ts`:

- Page 0 is fetched first with a 3 s `AbortController` timeout.
- If page 0 is empty or fails, the sitemap returns the static/blog/tag corpus
  rather than throwing a 500.
- If page 0 is short, the function returns immediately; no unnecessary event
  pages are requested.
- If page 0 is full, pages 1..19 are fetched in parallel with the same 3 s
  timeout, then processed in page order until the first failed, empty, or short
  batch. Worst case is roughly two timeout windows, not 20 sequential waits.
- `lib/api/client.ts` now lets `getEvents()` accept `RequestInit` options so
  the sitemap can pass an abort signal into the underlying fetch.
- Function exported so it can be unit-tested directly.

**Tests (`tests/sitemap-events.test.ts`):**

- Happy path returns events.
- Draft events skipped.
- First-page failure returns `[]`.
- Later-page failure returns the partial set already collected.
- Empty first batch avoids further calls; later empty batches stop processing
  the already fetched page results.

The existing `sitemap-vs-redirects` and `sitemap-vs-noindex` guards in
`tests/seo-indexing.test.ts` continue to enforce that no sitemap URL is a
redirect source or noindex blog post.

### P2. Triage "Crawled - currently not indexed" before content edits ✅ Enriched CSV produced

**Triage CSV:** `tasks/gsc-indexing-fix/evidence/crawled-not-indexed-triage.csv`
(produced by `tasks/gsc-indexing-fix/triage-not-indexed.mjs`).

**Evidence included per URL:**

- `current_status` — live HTTP status for real page candidates, local/rendered status, redirect status, or canonical variant status.
- `canonical` — live/rendered canonical where available, redirect destination, or expected clean URL for variants.
- `robots` — live/rendered robots meta where available, expected X-Robots policy for OG images, or fetch status.
- `incoming_rendered_links` — count of rendered internal links in `.next/server/app/**/*.html`.
- `sample_referrers` — up to five rendered internal routes linking to the URL.
- `action` and `recommendation` — next owner and concrete next step.

**Per-action counts (all 116 URLs):**

| Action | Count | Owner | Notes |
|---|---:|---|---|
| `manual-review-page` | 5 | content/internal-linking | True evergreen page candidates with live/local status, canonical, robots, and rendered link evidence now attached. **This is the only cohort that should turn into content-growth work.** |
| `monitor-event-lifecycle` | 3 | lifecycle monitoring | Live event pages are indexable under the event lifecycle policy. Do not rewrite them as content fixes; monitor until they redirect or noindex after the lifecycle threshold. |
| `validate-redirect-chain` | 32 | code/config | 25 original redirect sources plus 7 page candidates that now redirect live. Confirm one-hop chain after deploy/recrawl. No content work. |
| `wait-for-recrawl` | 27 | Google stale data | Legacy Wix paths with active 301s. Will drop as Google re-crawls. |
| `wait-for-recrawl-noindex` | 19 | content lifecycle | Stale blog posts and broad tag archives that now render `noindex, follow` and are excluded from sitemap/indexable archive surfaces. Wait for deploy/recrawl. |
| `no-action-non-page` | 30 | n/a | OG images (19), static assets (2), parameter variants (9). Non-page resources. |

**Crucially:** the 116 cohort is **not 116 content problems**. After excluding
non-pages, redirect sources/live redirects, event lifecycle pages,
lifecycle-noindexed posts/tag archives, and legacy-Wix entries, only **5 URLs
(4% of the cohort)** could plausibly need content-growth work, and even those need a
manual review before any rewrite is justified. The rendered link graph now
tells the reviewer whether the problem is likely discovery/internal linking or
whether the page has links and instead needs search-intent/content-quality
review.

**Content lifecycle cleanup completed in this round:**

- Public blog archives and tag archives now use `getIndexableBlogPosts()` so
  intentionally noindexed legacy/promotional posts no longer dilute indexable
  archive pages.
- Indexable blog posts no longer link through previous/next navigation into
  noindexed legacy posts.
- `winter-hours-cosy-times-at-the-anchor`, `what-is-the-history-of-april-fools-day`,
  and `womens-day-2024` now have `noindex: true` because they are stale,
  dated, or generic pages that should not compete for search.
- Broad tag archive pages `events`, `food-and-drink`, `news`, and `sports`
  now render `noindex, follow` and are excluded from the sitemap. These are
  navigation archives, not the pages the site should try to rank for event,
  food, news, or sport search intent.
- `family-friendly-sunday-lunch-heathrow` and `cosy-pub-stanwell` now link
  into stronger commercial/local pages (`/sunday-lunch`, `/family-friendly-pub-heathrow`,
  `/food-menu`, `/whats-on`, `/find-us`, etc.).

**Remaining content-growth task (not a technical indexing blocker):**

- For each of the 5 `manual-review-page` rows, use the live/local canonical/robots
  evidence already in the CSV, then capture rendered H1/title and current copy depth
  to classify as: (a) technical/canonical, (b) thin/low-value, (c) stale
  lifecycle/content, or (d) acceptable but awaiting Google.
- Only after that classification should any content edits be proposed, and
  they must be tied to a search outcome (keyword intent, topical cluster,
  internal discovery, conversion path) — not token additions.
- The 5 current candidates are:
  `christening-party-ideas-venues`, `leaving-party-ideas`,
  `family-friendly-sunday-lunch-heathrow`,
  `function-room-hire-heathrow-pricing`, and `cosy-pub-stanwell`.

### P2. Resolve the legacy image 404 ✅ Decision documented

**URL:** `https://www.the-anchor.pub/images/page-headers/drinks/optimized/drinks-1920w`

**Investigation:**

- Repo grep across `app/`, `components/`, `lib/`, `content/`, `public/`, `*.json`, `*.md`: zero matches outside prior audit/spec files.
- The path `/public/images/page-headers/drinks/optimized/` does not exist in the repo.
- The URL has no file extension (`drinks-1920w` rather than `drinks-1920w.webp`), which strongly suggests a stale Wix `<picture srcset>` reference Google indexed before migration.
- This finding is corroborated by `tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-assumption-breaker-report.md` §2.

**Decision:** **leave as 404** (case D in the URL lifecycle policy). The URL
was never served by the current site and there are no internal references.
A 301 would invent a destination; a 410 would require us to assert ownership
of a path we never had. The 404 is correct. It will drop from GSC as Google
stops re-crawling.

**Action: do NOT include this URL when validating "Not found (404)" in GSC.**
If we don't validate it, the validation status doesn't fail on a URL we
intentionally left as 404.

## 6. GSC validation guidance

Do not click "Validate fix" for every report just because it appears in GSC.

Validate now or after current production evidence:

- **Blocked by robots.txt:** yes, the `?dpl=` static-asset block is fixed.
- **Not found (404):** yes after confirming the event and `/hr` lifecycle decisions are accepted.

Validate after more work:

- **Redirect error:** only after the seven redirect-error chains are flattened or explicitly accepted and verified.

Do not validate as "fixed" without a specific fix:

- **Crawled - currently not indexed:** triage exists, but this report is not
  fixed by bulk validation. Use the CSV actions: validate redirect chains,
  wait for legacy/noindex recrawl, ignore non-page resources, and manually
  review only the 5 real content-growth candidates.
- **Excluded by noindex tag:** intentional unless a specific page was wrongly noindexed.
- **Alternative page with proper canonical tag:** working as designed.
- **Page with redirect:** mostly expected cleanup redirects; monitor, but do not treat as a defect category by itself.
- **Discovered - currently not indexed:** mostly new URLs with `Last crawled = 1970-01-01`; request indexing for priority URLs if needed.

## 7. Required execution workflow

1. Create a new branch from current `main`.
2. Read this file first and write a short implementation plan before editing code. The plan must name the root cause, fix, tests, and production verification for every item.
3. Run `node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` and save the output in the PR notes.
4. Implement P0 tasks first.
5. Run:

```bash
node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs
npm test -- --runInBand seo-indexing event-seo-strategy sitemap-events
npm run lint:next
npm run build
node tasks/gsc-indexing-fix/triage-not-indexed.mjs
```

6. Do not use the full `npm run lint` as a GSC acceptance gate until the separate hero audit debt is fixed; it currently fails outside this workstream.
7. Capture live production verification after deploy for any task that changes redirects, robots, headers, sitemap, or event lifecycle.
8. Update this file with completed task status and new evidence paths before closing the work.

## 8. Local verification already run

The targeted SEO/indexing verification passes locally when the shell path is normalised:

```bash
PATH="/bin:/usr/bin:/usr/local/bin:/opt/homebrew/bin:$PATH" \
  npm test -- --runInBand seo-indexing event-seo-strategy sitemap-events
```

Result:

- 3 test suites passed.
- 38 tests passed.

Also run for this workstream:

```bash
node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs
npm run lint:next
npm run build
node tasks/gsc-indexing-fix/triage-not-indexed.mjs
```

The full `npm run lint` currently fails because `audit:hero` reports 24
pre-existing hero/CTA/image findings unrelated to GSC indexing. That must be
fixed separately before using full lint as a PR gate.

## 9. Files changed and remaining likely touchpoints

Code and guardrail files changed by this workstream:

- `middleware.ts` and `lib/middleware-redirects.ts` — redirect-chain flattening.
- `lib/api/client.ts` and `app/sitemap.ts` — bounded sitemap event fetching.
- `lib/markdown.ts`, `lib/blog-tag-policy.ts`, `app/blog/page.tsx`, `app/blog/tags/page.tsx`,
  `app/blog/tag/[tag]/page.tsx`, and `app/blog/[slug]/page.tsx` — indexable
  archive surfaces now exclude noindex posts, and broad tag archives are
  browseable but not indexable.
- `content/blog/winter-hours-cosy-times-at-the-anchor/index.md`,
  `content/blog/what-is-the-history-of-april-fools-day/index.md`,
  `content/blog/womens-day-2024/index.md`,
  `content/blog/family-friendly-sunday-lunch-heathrow/index.md`, and
  `content/blog/cosy-pub-stanwell/index.md` — content lifecycle and internal
  link cleanup.
- `next.config.js` — static asset robots/header policy and cache-policy comments.
- `.github/workflows/ci.yml` — SEO regression tests, scoped lint, production build.
- `tests/seo-indexing.test.ts`, `tests/event-seo-strategy.test.ts`, `tests/sitemap-events.test.ts` — regression coverage.
- `tasks/gsc-indexing-fix/url-lifecycle-policy.md`, `tasks/gsc-indexing-fix/triage-not-indexed.mjs`, and `tasks/gsc-indexing-fix/evidence/crawled-not-indexed-triage.csv` — policy and evidence.

Remaining likely touchpoints are operational/content, not broad technical fixes:

- Production verification after deploy (§11).
- GSC validation after production verification (§11).
- Manual content-growth review of the 5 `manual-review-page` rows in the triage CSV.

## 10. Definition of done

This work is done when:

1. ✅ P0 redirect-error chains are fixed (middleware-level flattening; tests guard regression).
2. ✅ URL lifecycle policy exists and matches event/page redirect behaviour (`url-lifecycle-policy.md` + 11 event tests).
3. ✅ SEO guardrail tests run in CI (`.github/workflows/ci.yml`).
4. ✅ Static asset and OG-image header policy is accurate (X-Robots-Tag relaxed; OG-image robots.txt allow-check tested).
5. ✅ Sitemap generation is cached and resilient to management API slowness (two-phase bounded fetch, per-page abort timeout, tested partial fallback).
6. ✅ Audit script re-run; counts unchanged.
7. ✅ The 116 "Crawled - currently not indexed" URLs have been triaged with status, canonical, robots, rendered incoming links, action, and recommendation. Content work is scoped only to the 5 `manual-review-page` rows.
8. ⏳ GSC validation — pending production verification after deploy. See §11.
9. ✅ Each implemented fix states the root cause, fix rationale, and regression prevention (this document).
10. ✅ Content-growth opportunities are clearly separated from technical indexing defects (triage CSV `action` column).

## 11. Production verification checklist (pending deploy)

After merging `fix/gsc-indexing-final` and deploying to production:

```bash
# P0.1 — flatten redirect-error chains. Each command must show a single 301
# whose Location matches the consolidated tag URL. Apex variants must rewrite
# host AND path in one hop.
for u in \
  https://www.the-anchor.pub/blog/tag/rugby \
  https://www.the-anchor.pub/blog/tag/premier-league \
  https://www.the-anchor.pub/blog/tag/pet-friendly \
  https://www.the-anchor.pub/blog/tag/dog-friendly \
  https://the-anchor.pub/blog/tag/rugby \
  https://the-anchor.pub/blog/tag/premier-league \
  https://the-anchor.pub/blog/tag/pet-friendly; do
  echo "=== $u ==="
  curl -sI "$u" | grep -iE '^(http|location)'
done

# P1.1 — robots.txt cache header (Cloudflare-extended browser TTL acceptable).
curl -sI https://www.the-anchor.pub/robots.txt | grep -iE 'cache-control|cf-cache'

# P1.2 — static asset still crawlable (X-Robots-Tag may be 'all' or absent).
# Substitute a real <hash> from the latest deploy.
curl -sI 'https://www.the-anchor.pub/_next/static/chunks/main-<hash>.js?dpl=<dpl>' \
  | grep -iE 'cache-control|x-robots-tag|^http'

# P1.3 — OG-image still emits noindex.
curl -sI https://www.the-anchor.pub/events/<some-event-slug>/opengraph-image \
  | grep -iE 'content-type|x-robots-tag'

# P1.5 — sitemap still cached + complete.
curl -sI https://www.the-anchor.pub/sitemap.xml | grep -iE 'cache-control|x-vercel-cache'
curl -s https://www.the-anchor.pub/sitemap.xml | grep -c '<url>'
```

Expected outcomes:

- P0.1: every URL ends in a single `301 → https://www.the-anchor.pub/blog/tag/<sports|community>`.
- P1.1: `Cache-Control: public, max-age=14400, s-maxage=300, must-revalidate`, `cf-cache-status: HIT`.
- P1.2: `Cache-Control: public, max-age=31536000, immutable`. `X-Robots-Tag` may be absent or `all` — both acceptable.
- P1.3: `Content-Type: image/png`, `X-Robots-Tag: noindex, nofollow, noimageindex`.
- P1.5: 5-minute shared-cache TTL; URL count > 200 (full corpus).

Once those all pass, in GSC:

- Click "Validate fix" on the **Redirect error** report (covers all 7 URLs).
- Click "Validate fix" on the **Blocked by robots.txt** report (already validated previously; re-running is safe).
- Click "Validate fix" on the **Not found (404)** report ONLY for URLs we have actually fixed (e.g. `/hr` redirect). Do NOT validate `/images/page-headers/drinks/optimized/drinks-1920w` — it is intentionally left as 404 (see §P2).

Do NOT bulk validate:

- "Crawled - currently not indexed" — use the per-URL triage in `evidence/crawled-not-indexed-triage.csv`; this is a mixed report, not one fix.
- "Excluded by noindex tag" — intentional in every case in the export.
- "Page with redirect" — mostly expected cleanup redirects.

After validation begins, monitor the GSC report weekly for:

- Redirect-error count drops to 0.
- Crawled-not-indexed count drops materially as the redirect-source, legacy-Wix,
  and lifecycle-noindex cohorts recrawl. Do not expect the 5 content-growth
  candidates to clear without separate content/search-intent work.
- No new entries in the Redirect-error report.

## 12. Plain-English remaining work

The local code and documentation work is done. The remaining work is operational:

1. Commit and push this branch.
2. Deploy it to production.
3. Run the production `curl` checks in §11 to prove redirects, robots headers, static assets, OG images, and sitemap behaviour are correct on the live site.
4. Only after those checks pass, validate the specific GSC reports listed in §11.
5. Monitor GSC weekly. Redirect and stale/noindex cohorts should fall as Google recrawls.
6. Treat the 5 `manual-review-page` rows as a separate organic-growth content task, not as part of the technical indexing fix.
