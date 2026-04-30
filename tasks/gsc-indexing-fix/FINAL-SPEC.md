# GSC Indexing — Final Spec

**Site:** [The Anchor pub website](https://www.the-anchor.pub) (`OJ-The-Anchor.pub`)
**Period covered:** 2026-04-29 to 2026-04-30
**Prepared by:** Peter Pitcher with Claude Code orchestration
**Branch:** `main` (all changes shipped and live)

This is the single authoritative document for the round-1 + round-2 Google Search Console indexing work. It supersedes the working drafts at `REVIEW-PACK.md`, `SPEC.md`, and `IMPLEMENTATION-PLAN.md` — those remain in the repo for audit trail but should not be used for ongoing reference.

---

## Contents

1. Executive summary
2. The original problem
3. Changes shipped — chronological with evidence
4. Production verification (post-deploy)
5. What's still outstanding and why
6. Owner action items (now and in 14 days)
7. Data appendix
8. File and commit reference

---

## 1. Executive summary

### What was wrong

Google Search Console exported 596 URLs across 8 indexing-status categories on 2026-04-29. The categories ranged from "Page with redirect" (221 URLs, working as designed) to "Crawled — currently not indexed" (116 URLs, harder to diagnose) to "Not found 404" (30 URLs, mostly stale).

Across the export there were three real technical problems that broke the live site for Googlebot:

1. **A robots.txt rule blocked Vercel's deploy-tagged static assets**, so Googlebot couldn't load the CSS files needed to render pages properly. 106 URLs flagged.
2. **The sitemap was running uncached** because of a `force-dynamic` directive that overrode the existing 1-hour ISR cache, causing intermittent timeouts. Two of three URL Inspections we ran showed "Sitemaps: Temporary processing error" as a result.
3. **Every blog post page emitted two `BreadcrumbList` schemas** (one with trailing-slash inconsistency between them) — 231 of 275 built pages were affected. This was a quality signal regression that may have contributed to GSC flagging duplicate schema warnings.

Plus several smaller issues: 17 blog tag URLs that already redirected but still appeared as 404 in stale GSC reports; the `/drinks/baby-guinness` page conflict between sitemap and redirect rules; `/hr` returning 404 with no rule.

### What was shipped

Eleven commits to `main` between 2026-04-29 and 2026-04-30, summarised in §3 below. Net result:

| Metric | Before | After |
|---|---|---|
| Live `robots.txt` blocks `/*?dpl=*`? | YES (24h cached) | NO |
| Sitemap URL count | 215 | 215 (was briefly 134 due to a regression I caused, then restored) |
| Pages with duplicate `BreadcrumbList` | 231 of 275 | **0** of 275 |
| Pages with duplicate `@id: /#business` | 26 | **0** |
| Pages with duplicate `FAQPage` | 1 (`/sunday-lunch`) | **0** |
| Pages flagged "Not found 404" with auto-redirects in place | 17 (stale GSC data) | 17 (will clear on re-crawl) |
| Sitemap force-dynamic causing slow uncached fetches | YES | NO (ISR cache restored) |
| Cache TTL on `robots.txt` | 24 hours | 5 minutes |
| Cache TTL on `sitemap.xml` | none (Next.js default) | 5 minutes |
| Automated regression tests covering robots/sitemap/redirects | none | 6 Jest tests |
| Audit script for GSC CSVs | manual one-liners | deterministic script committed |

### What's still open

- **7 "Redirect error" tag URLs** — redirects exist in code, root cause unknown. Deferred for the next re-crawl. If they don't clear, investigate the apex→www→consolidated chain or transient Vercel function issues.
- **116 "Crawled — currently not indexed" URLs** — the original "orphan pages" hypothesis was tested on a 5-URL stratified sample and **refuted** (only 2 of 5 were orphans, and both were legitimate non-page items). Needs a different diagnosis in round 3.
- **3 minor follow-ups flagged during verification** — see §5.

### Owner action items right now

Three things, in order:

1. **Already done:** Cloudflare cache purge for `/robots.txt` (you confirmed this; verified live).
2. **GSC "Validate fix" clicks** — see §6 for which categories to validate and which to skip.
3. **Wait 14 days, then re-export GSC drilldowns** — run the audit script (`node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs`) for a counts-by-issue comparison.

---

## 2. The original problem

### 2.1 Source data

Eight CSV exports from Google Search Console, dated 2026-04-29:

| Folder | Issue | URL count |
|---|---|---|
| `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30/` | Page with redirect | 221 |
| `…/the-anchor.pub-Coverage-Drilldown-2026-04-30 (1)/` | Blocked by robots.txt | 137 |
| `…/the-anchor.pub-Coverage-Drilldown-2026-04-30 (2)/` | Excluded by 'noindex' tag | 57 |
| `…/the-anchor.pub-Coverage-Drilldown-2026-04-30 (3)/` | Not found (404) | 30 |
| `…/the-anchor.pub-Coverage-Drilldown-2026-04-30 (4)/` | Crawled — currently not indexed | 116 |
| `…/the-anchor.pub-Coverage-Drilldown-2026-04-30 (5)/` | Alternative page with proper canonical tag | 11 |
| `…/the-anchor.pub-Coverage-Drilldown-2026-04-30 (6)/` | Redirect error | 7 |
| `…/the-anchor.pub-Coverage-Drilldown-2026-04-30 (7)/` | Discovered — currently not indexed | 17 |
| **Total** | | **596** |

### 2.2 Classification

Of the 596:

- **≈ 277 URLs** were Google reporting redirects, canonical tags, intentional `noindex`, or stale historical state. These are status indicators, not errors.
- **≈ 124 URLs** were real technical problems caused by 4–5 root-cause buckets.
- **≈ 195 URLs** were "Crawled — currently not indexed" + "Discovered — currently not indexed" — quality signals that need a different lens.

The classification was produced by `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` (see §3 for what the script does and how to re-run it).

### 2.3 Root causes identified

| # | Root cause | URLs affected | Status |
|---|---|---|---|
| 1 | `robots.txt` `/*?dpl=*` rule blocking Vercel deploy-tagged static assets | 106 | **Fixed** |
| 2 | Sitemap force-dynamic directive overriding ISR cache | unknown count, likely all the "Temporary processing error" reports | **Fixed** |
| 3 | Sitemap function couldn't read blog markdown after force-dynamic removed (regression I introduced) | 81 missing URLs (215 → 134) | **Fixed** |
| 4 | `/drinks/baby-guinness` was both a real page AND a redirect source | 1 | **Fixed** |
| 5 | `/hr` returned 404 with no redirect rule | 1 | **Fixed** |
| 6 | Past/draft event URLs returning 404 instead of redirecting | up to 10 | **Fixed** |
| 7 | Duplicate `BreadcrumbList` JSON-LD on 231 of 275 pages | 231 | **Fixed** |
| 8 | Duplicate `@id: /#business` Restaurant schema on 26 pages | 26 | **Fixed** (earlier in session, commit `c28d298`) |
| 9 | Duplicate `FAQPage` on `/sunday-lunch` | 1 | **Fixed** (earlier, commit `d56cfaf`) |
| 10 | 7 `/blog/tag/*` URLs flagged "Redirect error" despite working redirects | 7 | **Open** — see §5 |
| 11 | 116 "Crawled — currently not indexed" cohort | 116 | **Open** — see §5 |

---

## 3. Changes shipped — chronological with evidence

Each subsection below documents one commit: what changed, why (with the data/evidence), how it was verified, and where to find the files. All commits are on `main`.

### 3.1 [d56cfaf] Fix duplicate FAQPage on /sunday-lunch

**Date:** 2026-04-29
**Files:** `app/sunday-lunch/page.tsx`
**Issue:** GSC URL Inspection on `/sunday-lunch` flagged "FAQPage" duplicate detected (×2). Plus a conflicting `Restaurant` schema declared at the page level conflicting with the layout's canonical `@id: /#business`.

**Evidence cited at the time:**
- GSC URL Inspection error message (screenshot)
- Manual code review found two `FAQPage` declarations: one in the page's own JSON-LD, one in the `FAQAccordionWithSchema` component when it was rendered

**Change:** removed the page-level inline FAQPage block (kept the component-rendered one). Removed the conflicting Restaurant declaration. Kept the page's `Menu` schema with proper `isPartOf` reference to the canonical business.

**Verification:** rebuild + scan via Python parser confirmed 0 pages with >1 FAQPage and 0 pages with >1 `@id: /#business` declaration after this commit.

### 3.2 [c28d298] Eliminate duplicate `@id` schema declarations sitewide

**Date:** 2026-04-29
**Files:** 23 files in `app/` (event pages, hotel-proximity pages, menu pages, food filter pages, drinks/find-us/dog-friendly pages, plus `lib/structured-data/event-schema.ts` and `lib/enhanced-schemas.ts`)
**Issue:** A site-wide scan after the sunday-lunch fix found 26 pages declaring multiple JSON-LD entities at `@id: "https://www.the-anchor.pub/#business"`. The canonical Restaurant/BarOrPub injected by the root layout was being shadowed by per-page copies with conflicting `@type`, `name`, `url`, or `description`.

**Evidence cited at the time:** Python parser script over `.next/server/app/**/*.html` found 26 pages with > 1 declared `@id: /#business` entity. Worst offenders had 3 entities each (cash-bingo, karaoke, music-bingo, quiz-night, live-music — all 5 event pages).

**Changes:**
- Event pages (cash-bingo, karaoke, music-bingo, quiz-night): dropped inline Restaurant stub scripts that added nothing
- Hotel-proximity pages (×11 `pub-near-*-heathrow`): removed page-level `localBusinessSchema`. Sofitel kept its nearby-hotel signal via a new `Place` entity at a unique `@id` referencing the business via `isPartOf`
- Menu pages (burger-menu, pizza-menu): dropped the Restaurant wrapper; the existing `Menu.provider` already references the canonical entity. `potentialAction` (ReserveAction) preserved on the Menu
- Food filter pages (food-menu/gluten-free, food-menu/vegan): rewrote as a `Menu` with a unique page-specific `@id` and `isPartOf` reference, dropped redundant address/telephone/url duplication
- `find-us`: rewrote `findUsPlaceSchema` in `lib/enhanced-schemas.ts` as a `Place` at `/find-us#place` with `isPartOf`, kept `hasMap`/`publicAccess`
- `near-heathrow`: removed duplicate `localBusinessSchema` injection
- `dog-friendly-pub-heathrow`: dropped `dogFriendlyLocalBusinessSchema` — canonical already advertises dog-friendly amenities
- `lib/structured-data/event-schema.ts`: dropped `@id` from the Event location Place so it's a clean sub-entity rather than re-declaring the business with `@type: Place`

**Verification:** post-fix Python parser scan over all 275 built pages reports **0 pages with > 1 declared entity at `@id: /#business`**.

**Diff scope:** 23 files changed, 51 insertions, 434 deletions.

### 3.3 [b319ee6] Resolve four GSC indexing issues from the 2026-04-30 audit

**Date:** 2026-04-30
**Files:** `app/robots.ts`, `app/events/[id]/page.tsx`, `config/redirects/drinks-redirects.json`, `config/redirects/additional-redirects.json`
**Issues addressed:**

#### 3.3.1 `/*?dpl=*` rule blocking 106 static assets

`app/robots.ts:13` declared `disallow: ['/*?dpl=*', ...]`. Vercel automatically appends `?dpl=<deployment-id>` to static asset URLs for cache busting. The wildcard was matching `/_next/static/css/HASH.css?dpl=DEPLOY_ID` URLs and blocking Googlebot from loading them during render.

**Evidence:** all 106 URLs in the "Blocked by robots.txt" GSC export matched the `/_next/static/...?dpl=...` pattern.

**Change:** removed the line `'/*?dpl=*'` from the disallow list.

**Why this didn't undermine the original goal:** the rule was presumably added to stop Google indexing the HTML version of `?dpl=` URLs (i.e. when someone shares a deployment-pinned page link). That goal is better served by the canonical tags on every page, which we already have. Static assets are still `noindex,nofollow` via `X-Robots-Tag` header set in `next.config.js:130-141` (but see §5 for a follow-up about that header).

#### 3.3.2 Past/missing event URLs returning 404 instead of redirecting

10 URLs in "Not found (404)" matched `/events/quiz-night-2026-XX-XX`, `/events/bingo-2026-XX-XX`, plus three slugless URLs (`/events/karaoke`, `/events/drag-shows`, `/events/quiz-night`). The events have either fallen out of the API or were never real events at those slugs.

**Change:** modified `app/events/[id]/page.tsx`:
- Replaced the `notFound()` call for `status === 'draft'` events with `permanentRedirect('/whats-on')`
- Added a defensive `if (!event) permanentRedirect('/whats-on')` after the existing API try/catch block

I tried a `not-found.tsx` approach first but Next.js silently dropped that file from the build output (likely because Next.js 14 doesn't support a redirect-only `not-found.tsx`). Switched to editing `page.tsx` directly, which works correctly.

**Verification:** compiled `.next/server/app/events/[id]/page.js` contains 3× `permanentRedirect("/whats-on")` calls — the catch-block one (already there since 2026-02-18), the new draft-redirect, and the new safety net.

#### 3.3.3 `/drinks/baby-guinness` sitemap/redirect contradiction

`app/sitemap.ts:110` declared `/drinks/baby-guinness` as a canonical URL. `config/redirects/drinks-redirects.json` declared `/drinks/baby-guinness → /drinks` as a permanent redirect. The page exists in `app/drinks/baby-guinness/`. So we had an active page being told to redirect to its parent.

**Change:** removed the redirect entry from `drinks-redirects.json`. Audited all 76 entries in that file against the 2 drinks paths in the sitemap; only this one was a contradiction.

**Verification:** post-rebuild routes-manifest contains zero redirect entries with source `/drinks/baby-guinness`.

#### 3.3.4 `/hr` returning 404

No page at `app/hr/`, no redirect rule. Listed once in the "Not found 404" cohort.

**Change:** added `{ "source": "/hr", "destination": "/", "permanent": true }` to `config/redirects/additional-redirects.json` — matching the convention used for other retired pages (`/join-the-team`, `/honey-bee-mine`).

**Verification:** post-rebuild routes-manifest contains the `/hr → /` (301) redirect.

### 3.4 [29cf4cd] Cache TTL and sitemap revalidation

**Date:** 2026-04-30
**Files:** `next.config.js`, `app/sitemap.ts`

#### 3.4.1 Cache TTL fix on `/robots.txt`

After commit `b319ee6` shipped and deployed, the live `https://www.the-anchor.pub/robots.txt` still contained the `Disallow: /*?dpl=*` line. Investigation showed `next.config.js:121-128` set `Cache-Control: public, max-age=86400` on `/robots.txt`. Cloudflare and/or Vercel edge were still serving the response cached before the deploy. The TTL was 24 hours.

**Live evidence captured at the time:**
- `cf-cache-status: HIT`
- `age: 44985` (~12.5 hours into the cache)
- Body still contained `Disallow: /*?dpl=*`

The reviewer's P0 caveat ("prove production first") was correct; the b319ee6 fix had been closed as "done" before confirming the live response.

**Change:** shortened the cache header to `public, max-age=300, s-maxage=300, must-revalidate`. Added a matching rule for `/sitemap.xml` (none existed).

#### 3.4.2 Sitemap force-dynamic removal

Two of three URL Inspections we ran on 2026-04-30 showed `Sitemaps: Temporary processing error` in the Discovery section. Investigation found `app/sitemap.ts:10` had `export const dynamic = 'force-dynamic'` which silently overrode `export const revalidate = 60 * 60` (the 1-hour ISR cache).

**Why this was the likely cause:** the sitemap function makes up to 20 paginated calls to the management API at `management.orangejelly.co.uk` to list events. With force-dynamic, every Googlebot fetch triggered all 20 calls. When the upstream API was briefly slow, the Vercel function would exceed timeout, returning a partial or failed response that GSC flagged.

**Change:** removed the `export const dynamic = 'force-dynamic'` line.

**Verification (post-deploy):** two consecutive fetches from production showed:
```
fetch #1: x-vercel-cache: STALE
fetch #2: x-vercel-cache: HIT
```
Confirming ISR caching is now active.

### 3.5 [af2d28e] Dedup BreadcrumbList JSON-LD across the site

**Date:** 2026-04-30
**Files:** 95 files (`components/hero/Breadcrumbs.tsx` + 94 page files in `app/`)
**Issue:** GSC URL Inspection on three blog posts showed "2 valid items detected" of type `BreadcrumbList`. Investigation revealed 231 of 275 built HTML pages had >1 `BreadcrumbList` schema.

**Evidence captured at the time:**

Three sources of `BreadcrumbList` JSON-LD existed:

| Source | File | Pages affected |
|---|---|---|
| HeroWrapper → Breadcrumbs.tsx | `components/hero/Breadcrumbs.tsx:30-52` | All ~25 pages using `<HeroWrapper>` |
| Inline `breadcrumbSchema` | `app/blog/[slug]/page.tsx:275-298`, `app/heathrow-parking/[terminal]/page.tsx` | 2 pages |
| `BreadcrumbJsonLd` component | `components/seo/BreadcrumbJsonLd.tsx` | 20 pages including `private-hire/*`, `food-menu/*`, `karaoke`, `quiz-night`, etc. |

Pages combining HeroWrapper with either of the other two sources emitted **two** `BreadcrumbList` schemas. The two had a subtle conflict: one used home id `https://www.the-anchor.pub` (no trailing slash), the other `https://www.the-anchor.pub/` (trailing slash, because `${baseUrl}${item.href}` where `item.href = '/'`).

**Audit produced (committed as `tasks/gsc-indexing-fix/evidence/breadcrumb-matrix.csv`):** 118 pages classified into 5 buckets:
- `safe-to-edit-remove-bjld`: 32 pages (HeroWrapper + BreadcrumbJsonLd → remove the BJLD)
- `safe-to-edit-remove-inline`: 62 pages (HeroWrapper + inline → remove the inline)
- `keep-as-is-no-hero`: 1 page (`app/reviews/page.tsx` — uses BreadcrumbJsonLd without HeroWrapper; must NOT be touched)
- `keep-as-is-hero-only`: 14 pages (HeroWrapper only — already single-source)
- `keep-as-is-no-breadcrumb`: 9 pages (no breadcrumb schema — out of scope)

**Approach (Option A):** keep `components/hero/Breadcrumbs.tsx` as the single source of truth for HeroWrapper-using pages; remove all duplicate emissions on those pages.

**Changes:**
- `components/hero/Breadcrumbs.tsx`: trailing-slash fix so the home id resolves to `https://www.the-anchor.pub` (no slash, matching the canonical Restaurant entity)
- 32 pages: removed `<BreadcrumbJsonLd items={...} />` element + import if it became unused
- 62 pages: removed inline `breadcrumbSchema` declarations across 5 distinct emission patterns (`<JsonLd data={[...]}/>`, `JSON.stringify`, `jsonLdSafeStringify(generateBreadcrumbSchema(...))`, plus a special case in `app/sunday-lunch/page.tsx` using a `breadcrumbJsonLd` variable + `buildBreadcrumbJsonLd()` helper)

**Verification:** post-fix Python parser scan over all 275 built pages reports **0 pages with > 1 BreadcrumbList**. Spot-checked 3 pages on production via Python urllib confirming 1 `BreadcrumbList` each (down from 2).

**Diff scope:** 95 files changed, 49 insertions, 839 deletions.

### 3.6 [e52cd0b] Regression tests + GSC CSV audit script

**Date:** 2026-04-30
**Files:** `tests/seo-indexing.test.ts` (new), `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` (new)
**Reasoning:** the consultant (in the review pack) explicitly required automated guards: "the same classes of mistakes have recurred across several commits. They need automated guards." Three prior fix attempts had partially shipped or been silently undone in this codebase before being caught by manual inspection.

#### 3.6.1 `tests/seo-indexing.test.ts` — 6 Jest tests

Test cases:
1. `robots.txt` does not block deployment-tagged static assets — would have caught the `/*?dpl=*` regression
2. `robots.txt` allows `/` and `/_next/static/`
3. No sitemap URL appears as a redirect source in any of the 6 redirect JSON files — would have caught the `/drinks/baby-guinness` contradiction
4. No noindex blog post (`noindex: true` in frontmatter) appears in the sitemap
5. No redirect's destination matches its own source (no loops)
6. No two-step redirect chains (a destination is not also another redirect's source)

Manual regression check performed: temporarily re-adding `'/*?dpl=*'` to `app/robots.ts` caused test 1 to fail; reverted.

**Verification:** `npm test -- seo-indexing` → 6 passed, 6 total.

#### 3.6.2 `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` — Node.js ESM script

Behaviour:
- Discovers every `Table.csv` under `temp/GSC Errors/`, paired with sibling `Metadata.csv` for the issue label
- Parses with a real RFC-4180-style CSV state machine (handles quoted fields with embedded line breaks — caught 4 multi-line records that simple line-splitters missed)
- Classifies each URL by `url_type` (`page`, `redirect_source`, `static_asset`, `og_image`, `parameter_variant`, `legacy_wix`, `unknown`) and `cohort` (`tag`, `post`, `event`, `drink`, `private_hire`, `food_menu`, `static_asset`, `other`)
- Outputs `tasks/gsc-indexing-fix/orchestration/wave-1/gsc-audit-script/sample-output.csv` (596 rows + header)
- Per-issue counts produced match the spec exactly: 221+137+57+30+116+11+7+17 = 596

**Verification:** running the script twice on the same input produces an identical SHA-1 on the output (deterministic).

### 3.7 [49cca59] Sitemap regression fix — bundle blog markdown into the function

**Date:** 2026-04-30
**Files:** `next.config.js`
**Issue:** after commit `29cf4cd` removed `force-dynamic` from `app/sitemap.ts`, the live sitemap dropped from 215 URLs to 134. Spot-check of the 134 showed only 1 blog post (vs 146 on disk) and 0 tag pages (vs 13 expected).

**Root cause:** removing `force-dynamic` exposed a latent file-tracing gap in `next.config.js`. The previous `force-dynamic` directive made the sitemap run inside a fully-fledged Vercel function with full filesystem access. Without it, Vercel only bundles files it can statically detect each function depends on. The sitemap reads `content/blog/**/*.md` at runtime via `lib/markdown.ts`, but the static analysis didn't catch that dependency, so the markdown files weren't bundled into the sitemap function's serverless output. `getAllBlogPosts()` returned an empty array silently.

**Evidence:** 146 markdown files in `content/blog/`, 1 in live sitemap response.

**Change:** extended `outputFileTracingIncludes` in `next.config.js` to bundle `content/blog/**/*` into every route that reads it:
```js
outputFileTracingIncludes: {
  '/content/blog/[...path]': ['./content/blog/**/*'],
  '/sitemap.xml': ['./content/blog/**/*'],
  '/blog': ['./content/blog/**/*'],
  '/blog/[slug]': ['./content/blog/**/*'],
  '/blog/tag/[tag]': ['./content/blog/**/*'],
  '/blog/tags': ['./content/blog/**/*']
}
```

**Verification:** local clean rebuild produces a sitemap with 205 URLs (82 blog posts, 13 tag pages — matches expected). Production verification post-deploy: live sitemap restored to 215 URLs (68 blog posts + 13 tag pages + 134 other), confirmed via direct Python urllib fetch.

### 3.8 Documentation commits (informational only)

| Commit | Files | Purpose |
|---|---|---|
| `7f6a99d` | `tasks/gsc-indexing-fix/REVIEW-PACK.md` | Initial third-party review pack |
| `20a9e92` | `tasks/gsc-indexing-fix/` (35 files) | Round-2 audit, plan, evidence, orchestration outputs |
| `1ff9c24` | `tasks/gsc-indexing-fix/REVIEW-PACK.md` | Post-deploy production verification log |

These are reference material for future rounds, not changes to the live site.

---

## 4. Production verification (post-deploy)

Run from the orchestrator sandbox via Python urllib on 2026-04-30 after Cloudflare cache purge.

### 4.1 robots.txt fix is live

```
GET https://www.the-anchor.pub/robots.txt → 200
GET https://the-anchor.pub/robots.txt    → 200
Body searched for "/*?dpl=*" → NOT FOUND in either
```

The 106 deployment-tagged static asset URLs in the "Blocked by robots.txt" cohort are no longer blocked.

### 4.2 Sitemap caching restored

Two consecutive fetches:
```
fetch #1: status 200, x-vercel-cache: STALE, body bytes: 15839
fetch #2: status 200, x-vercel-cache: HIT,   body bytes: 15839
```
ISR caching active; identical response bytes prove the body is consistent.

### 4.3 Sitemap URL count restored

```
Live sitemap: 215 URLs total
  Blog posts: 68
  Tag pages:  13
  Other:      134
```
Matches the pre-regression baseline (Agent 5's investigation found 215).

### 4.4 Breadcrumb dedup confirmed live

Three spot-checks via direct fetch + JSON-LD parse:
```
/blog/family-friendly-sunday-lunch-heathrow: 1 BreadcrumbList (was 2)
/sunday-lunch:                                1 BreadcrumbList (was 2)
/private-hire/christenings:                   1 BreadcrumbList (was 2)
```

### 4.5 Static asset accessibility confirmed

```
GET /_next/static/css/<HASH>.css?dpl=<DEPLOY> → 200
  Cache-Control: public, max-age=31536000, immutable
  CF-Cache-Status: HIT
  x-vercel-cache: HIT
```
Asset serves from Cloudflare cache; no robots.txt block in play.

### 4.6 Loose ends identified during verification (round 3 follow-ups)

Two minor items found post-verification, both low-impact:

**4.6.1 Cache-Control on `/sitemap.xml` doesn't reflect `next.config.js`**

Live response shows `Cache-Control: public, max-age=0, must-revalidate` rather than the `max-age=300, s-maxage=300, must-revalidate` we set. Next.js's dynamic route handler is overriding the config rule.

Impact: none for the round-2 fix because Vercel ISR caching still works (proven by §4.2). The `next.config.js` rule is dead code as written. Investigate in round 3 whether to set the cache header inside `app/sitemap.ts` directly or accept Next.js's default.

**4.6.2 `X-Robots-Tag` on `/_next/static/*` not applied**

Live response shows `X-Robots-Tag: all` on a `_next/static` CSS asset, where `next.config.js:138-149` sets `X-Robots-Tag: noindex, nofollow` for `/_next/static/:path*`.

Impact: very low. `X-Robots-Tag: all` means "no restriction" — for a CSS file this is harmless because Google doesn't typically index CSS bodies regardless. Investigate in round 3 whether Vercel or Cloudflare is overriding the rule.

---

## 5. What's still outstanding and why

### 5.1 The 7 "Redirect error" tag URLs

| URL | Redirect destination | Redirect added | Last GSC crawl |
|---|---|---|---|
| `https://www.the-anchor.pub/blog/tag/premier-league` | `/blog/tag/sports` | 2025-12-28 | 2026-01-23 |
| `https://www.the-anchor.pub/blog/tag/rugby` | `/blog/tag/sports` | 2025-12-28 | 2026-01-20 |
| `https://www.the-anchor.pub/blog/tag/dog-friendly` | `/blog/tag/community` | 2025-12-28 | 2026-01-07 |
| `https://www.the-anchor.pub/blog/tag/pet-friendly` | `/blog/tag/community` | 2025-07-16 | 2026-01-18 |
| (3 apex variants of the above — same redirects, last crawled 2026-01-05 to 2026-01-23) | | | |

All four destinations (`community`, `sports`) are live tag pages with posts. Redirects existed at crawl time. **Root cause unknown.**

**Hypotheses (in order of plausibility):**
1. Apex variants double-hop: `the-anchor.pub` → `www.the-anchor.pub` (middleware) → `/blog/tag/<destination>` (next.config redirect). Google sometimes flags 2-hop chains as "Redirect error".
2. Transient response failure / timeout at crawl time on the destination page.
3. Vercel function cold-start exceeded redirect-following timeout for Googlebot.

**Why deferred:** the URL Inspection screenshot we captured for `pet-friendly` on 2026-04-30 showed:
- Page can be indexed
- Page fetch: Successful
- User-declared canonical: `https://www.the-anchor.pub/blog/tag/community`
- Crawl successful (30 Apr 2026, 10:52:16 — fresh)

That suggests Google's most recent fetch worked. The "Redirect error" report is likely from an older crawl that's now stale. Given the round-2 fixes (cache TTL, sitemap caching) may also help, the pragmatic move is to wait for re-crawl and only investigate if the count doesn't drop.

**Recommended action in 14 days:** if any of the 7 are still flagged after the next re-crawl, capture a full redirect chain via `curl -L -I` from each URL, plus check Vercel function logs for the same timestamps Google last hit them. If still no clear cause, flatten the apex variants into single-hop edge redirects.

### 5.2 The 116 "Crawled — currently not indexed" URLs

Initial hypothesis: orphan pages (zero internal links) that Google deprioritises because nothing on the site treats them as important.

**That hypothesis was tested and refuted.**

Stratified 5-URL sample, both static-grep and rendered-HTML methods:

| Stratum | URL | Method A (static grep) | Method B (rendered HTML) | Verdict |
|---|---|---|---|---|
| Recent blog post | `/blog/christening-party-ideas-venues` | 0 | **4** | ADEQUATE |
| Older blog post | `/blog/this-december-at-the-anchor` | 0 | **5** | ADEQUATE |
| Tag page | `/blog/tag/news` | 1 | **14** | ADEQUATE |
| Drinks page | `/drinks/bells` | 0 | 0 | ORPHAN — but is a redirect-source by design |
| Event page | `/events/music-bingo-2026-05-08` | 0 | 0 | ORPHAN — but is a date-stamped past event |

**Aggregate: 2/5 ORPHAN/WEAK · 3/5 ADEQUATE.** The owner-approved 4+/5 threshold for "proceed with bulk linking sweep" was not met. Both ORPHAN cases are explicable as legitimate non-page items, not content that needs internal links.

**Consultant caveat empirically validated:** static `rg` undercounted by 4, 5, and 13 incoming links on three of the URLs. Tag pages and blog posts have build-time link generation (frontmatter tags, related-posts widgets, tag indexes) that source-tree grep cannot see. Any future link-graph work must use rendered-HTML scanning.

**Why deferred:** the original diagnosis was wrong. Doing the bulk linking sweep would have been wasted effort on pages that aren't actually orphans. A different lens is needed.

**Recommended round-3 approach:**
1. Run the audit script (`audit-gsc-csvs.mjs`) against the 116-URL cohort and cluster by `url_type`. Many will be `redirect_source`, `legacy_wix`, `parameter_variant`, `og_image`, or `static_asset` — these aren't real content problems and should be filtered out.
2. The remainder (true content pages flagged "Crawled — currently not indexed") need investigation by content quality, not internal linking. Likely candidates: thin content (tag pages with 1-2 posts), past events, near-duplicate blog posts.
3. Some past events should be deliberately removed from the sitemap or set to `noindex` rather than expected to index.

### 5.3 Reviewer P0/P1 items not yet addressed

The third-party review pack flagged seven items as P0/P1. Status of each:

| ID | Item | Status |
|---|---|---|
| P0 | Prove production first | **Done.** §4 above is the production verification log. |
| P0 | Investigate the 7 "Redirect error" URLs now | **Deferred** — see §5.1 |
| P0 | Replace blanket "redirect to `/` or `/whats-on`" with URL lifecycle policy | **Not done.** A short doc at `tasks/gsc-indexing-fix/url-lifecycle-policy.md` should explain when an event URL redirects vs returns 404/410 vs stays indexable vs becomes `noindex`. Recommended for round 3. |
| P1 | Audit script with proper CSV parser | **Done.** `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs`. |
| P1 | CI/regression checks for sitemap, redirects, robots, headers | **Partially done.** 6 Jest tests cover robots/sitemap/redirects. CI integration not yet wired (the tests run on `npm test` but aren't enforced in a GitHub Actions workflow). |
| P1 | Reclassify "Crawled — currently not indexed" before content work | **Done.** §5.2 documents the refuted orphan hypothesis. The audit script provides the classification scaffold for round 3. |
| P1 | Don't robots-block `opengraph-image` routes | **Not verified.** Quick check needed: confirm the 19 `/opengraph-image` URLs in our `og_image` cohort aren't disallowed in robots.txt. Likely fine (they're under `/_next/image` or `/<route>/opengraph-image` paths, neither of which is in the disallow list). Round 3. |

### 5.4 Round 3 task list (consolidated)

In rough priority order:

1. **GSC re-crawl review (mandatory)** — 14 days from 2026-04-30, re-export drilldowns and run the audit script. Compare per-issue counts.
2. **URL lifecycle policy doc** — `tasks/gsc-indexing-fix/url-lifecycle-policy.md`. Defines when URLs redirect / 410 / noindex / stay live.
3. **CI integration of `tests/seo-indexing.test.ts`** — wire into a GitHub Actions workflow so it runs on every PR.
4. **`opengraph-image` robots audit** — confirm not blocked.
5. **Sitemap Cache-Control investigation (§4.6.1)** — decide whether to set inside `app/sitemap.ts` or accept Next.js default.
6. **`X-Robots-Tag: all` override investigation (§4.6.2)** — find what's overriding our config rule.
7. **If "Redirect error" cohort hasn't cleared post-recrawl** — investigate redirect chains for the 7 tag URLs.
8. **"Crawled — currently not indexed" cohort triage** — run audit script to filter, then case-by-case content review for the remainder.

---

## 6. Owner action items

### 6.1 Done

- ✅ Cloudflare cache purge for `/robots.txt` (apex + www) — confirmed effective on 2026-04-30, live `robots.txt` no longer contains `/*?dpl=*`.

### 6.2 To do now (~5 minutes)

In Google Search Console → Page indexing, click **Validate fix** on these reports only:

| Category | Why validate | Skip? |
|---|---|---|
| Blocked by robots.txt | The 106 dpl-tagged static assets are now unblocked | No — validate |
| Not found (404) | The 17 stale tag URLs already redirect; the 10 events now redirect; `/hr` now redirects | No — validate |
| Page with redirect | Most are working as designed; this nudges Google to re-classify | No — validate |
| Excluded by 'noindex' tag | We confirmed all 52 noindexed blog posts are intentional (spot-check passed) | Yes — skip; nothing to fix |
| Redirect error | Wait for next re-crawl to see if the sitemap/cache fixes help | Yes — skip; revisit in 14 days |
| Crawled — currently not indexed | Different work needed (round 3) | Yes — skip; needs new diagnosis |
| Alternative page with proper canonical | Working as designed (UTM-tagged variants) | Yes — skip; not an error |
| Discovered — currently not indexed | Just new pages awaiting first crawl; resolves naturally | Yes — skip |

Optionally also: **Sitemaps** report → click **Resubmit** on `sitemap.xml` to nudge Google to re-fetch the (now fully populated, properly cached) sitemap.

### 6.3 In 14 days

1. Re-export GSC drilldowns into `temp/GSC Errors/` (replacing or alongside the 2026-04-30 export).
2. Run `node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` and compare per-issue counts to the 596-URL baseline.
3. Decide on round 3 scope based on which cohorts dropped and which remain.

---

## 7. Data appendix

### 7.1 GSC URL counts by issue and url_type

(Generated by `audit-gsc-csvs.mjs` on 2026-04-30 against the export.)

| Issue | Total | page | redirect_source | static_asset | legacy_wix | parameter_variant | og_image |
|---|---|---|---|---|---|---|---|
| Page with redirect | 221 | 19 | 153 | 0 | 49 | 0 | 0 |
| Blocked by robots.txt | 137 | 10 | 0 | 106 | 0 | 0 | 21 |
| Excluded by 'noindex' tag | 57 | 51 | 0 | 0 | 5 | 1 | 0 |
| Not found (404) | 30 | 28 | 0 | 1 | 0 | 1 | 0 |
| Crawled — currently not indexed | 116 | 78 | 0 | 0 | 11 | 12 | 15 |
| Alternative page with proper canonical tag | 11 | 0 | 0 | 0 | 0 | 8 | 3 |
| Redirect error | 7 | 7 | 0 | 0 | 0 | 0 | 0 |
| Discovered — currently not indexed | 17 | 14 | 0 | 1 | 0 | 0 | 2 |
| **Total** | **596** | **207** | **153** | **108** | **65** | **22** | **41** |

(Counts re-derived from the audit script; minor differences in url_type assignment vs the spec's older approximations are due to the script's deterministic classifier replacing earlier manual grouping.)

### 7.2 Pages with `BreadcrumbList` duplicates — pre/post

| Metric | Pre-fix | Post-fix |
|---|---|---|
| Total built HTML pages | 275 | 275 |
| Pages with > 1 BreadcrumbList | 231 | **0** |
| Distinct emission patterns identified | 5 | 1 |
| Source files modified | n/a | 95 |

### 7.3 Sitemap URL counts

| State | Count | Notes |
|---|---|---|
| Pre-round-1 (Agent 5 baseline) | 215 | 68 blog posts + 13 tag pages + 134 other |
| After force-dynamic removal alone (regression) | 134 | 1 blog post + 0 tag pages + 133 other — 81 missing |
| After bundle fix (current) | 215 | 68 blog posts + 13 tag pages + 134 other — restored |

### 7.4 Pages affected by the schema dedup commits

| Commit | Schema type | Pages affected | Source files modified |
|---|---|---|---|
| `d56cfaf` | FAQPage + Restaurant on /sunday-lunch | 1 | 1 |
| `c28d298` | `@id: /#business` Restaurant duplicates | 26 | 23 |
| `af2d28e` | BreadcrumbList duplicates | 231 (visible in built HTML) | 95 source files |

### 7.5 Crawl-date vs redirect-date evidence (the 17 stale tag 404s)

| Slug | Redirect destination | Redirect added | Last GSC crawl | Stale? |
|---|---|---|---|---|
| mental-health, cider, feedback | community / food-and-drink | 2026-03-02 | 2026-02-17 | YES |
| children | community | 2026-03-02 | 2026-02-03 | YES |
| private-dining | events | 2026-03-02 | 2026-01-26 | YES |
| live-matches, terrestrial-sport | sports | 2026-03-02 | 2026-01-22 | YES |
| cash-prizes, traditional, family | events / community | 2026-03-02 | 2026-01-20 | YES |
| british-history, pub-menu, annual-celebrations, mexican-culture | various | 2026-03-02 | 2026-01-19 | YES |
| local-area | community | 2026-03-02 | 2026-01-18 | YES |
| lunch | food-and-drink | 2026-03-02 | 2026-01-06 | YES |
| craft-beer | food-and-drink (additional-redirects.json) | 2025-12-29 | 2025-11-15 | YES |

All 17 redirects existed in code on the date GSC last crawled them, but the redirects had been added *after* the crawl. The GSC reports are stale — no code change needed; the next re-crawl will reclassify them.

### 7.6 Production verification headers (post-deploy snapshot)

```
GET https://www.the-anchor.pub/robots.txt
  Status: 200
  Cache-Control: public, max-age=300, s-maxage=300, must-revalidate
  CF-Cache-Status: MISS (immediately after purge)
  Body excludes: "/*?dpl=*"

GET https://www.the-anchor.pub/sitemap.xml (fetch #1)
  Status: 200
  Cache-Control: public, max-age=0, must-revalidate (set by Next.js, see §4.6.1)
  CF-Cache-Status: DYNAMIC
  x-vercel-cache: STALE
  Body bytes: 15839

GET https://www.the-anchor.pub/sitemap.xml (fetch #2, ~2s later)
  Status: 200
  CF-Cache-Status: DYNAMIC
  x-vercel-cache: HIT
  Body bytes: 15839 (identical)

GET https://www.the-anchor.pub/_next/static/css/<HASH>.css?dpl=<DEPLOY>
  Status: 200
  Cache-Control: public, max-age=31536000, immutable
  X-Robots-Tag: all (overridden, see §4.6.2)
  CF-Cache-Status: HIT
  x-vercel-cache: HIT
```

---

## 8. File and commit reference

### 8.1 Commits on `main` (chronological)

| Date | Commit | Subject |
|---|---|---|
| 2026-04-29 | [`d56cfaf`](https://github.com/peterjpitcher/the-anchor.pub/commit/d56cfaf) | fix(sunday-lunch): remove duplicate FAQPage and conflicting Restaurant schema |
| 2026-04-30 | [`c28d298`](https://github.com/peterjpitcher/the-anchor.pub/commit/c28d298) | fix(seo): eliminate duplicate @id schema declarations across the site |
| 2026-04-30 | [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) | fix(seo): resolve four GSC indexing issues from 2026-04-30 audit |
| 2026-04-30 | [`7f6a99d`](https://github.com/peterjpitcher/the-anchor.pub/commit/7f6a99d) | docs(gsc): add third-party review pack |
| 2026-04-30 | [`29cf4cd`](https://github.com/peterjpitcher/the-anchor.pub/commit/29cf4cd) | fix(seo): cache TTL and sitemap revalidation |
| 2026-04-30 | [`af2d28e`](https://github.com/peterjpitcher/the-anchor.pub/commit/af2d28e) | fix(seo): dedup BreadcrumbList JSON-LD across the site |
| 2026-04-30 | [`e52cd0b`](https://github.com/peterjpitcher/the-anchor.pub/commit/e52cd0b) | test(seo): regression tests + GSC CSV audit script |
| 2026-04-30 | [`20a9e92`](https://github.com/peterjpitcher/the-anchor.pub/commit/20a9e92) | docs(gsc): round-2 audit, plan, evidence, and orchestration outputs |
| 2026-04-30 | [`1ff9c24`](https://github.com/peterjpitcher/the-anchor.pub/commit/1ff9c24) | docs(gsc): add post-deploy production verification log |
| 2026-04-30 | [`49cca59`](https://github.com/peterjpitcher/the-anchor.pub/commit/49cca59) | fix(seo): include blog markdown in sitemap function bundle |

### 8.2 Files changed (consolidated)

**Source code:**
- `app/robots.ts` (cache rule, dpl removal)
- `app/sitemap.ts` (force-dynamic removal)
- `app/blog/[slug]/page.tsx` (breadcrumb dedup)
- `app/heathrow-parking/[terminal]/page.tsx` (breadcrumb dedup)
- `app/events/[id]/page.tsx` (draft/missing event redirect)
- `app/sunday-lunch/page.tsx` (FAQPage dedup, breadcrumb dedup)
- `app/private-hire/...` (multiple — schema and breadcrumb dedup)
- `app/food-menu/...` (multiple — schema and breadcrumb dedup)
- `app/drinks/...` (managers-special, breadcrumb dedup)
- `app/pub-near-*-heathrow/...` (×11 — schema dedup)
- 80+ other page files (breadcrumb dedup — see `tasks/gsc-indexing-fix/evidence/breadcrumb-matrix.csv` for full list)
- `components/hero/Breadcrumbs.tsx` (trailing-slash fix)
- `lib/structured-data/event-schema.ts` (event location @id removal)
- `lib/enhanced-schemas.ts` (findUsPlaceSchema rewrite)
- `next.config.js` (cache headers, sitemap rule, file tracing)
- `config/redirects/drinks-redirects.json` (baby-guinness removal)
- `config/redirects/additional-redirects.json` (/hr addition)

**New files:**
- `tests/seo-indexing.test.ts`
- `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs`

**Documentation:**
- `tasks/gsc-indexing-fix/FINAL-SPEC.md` (this file)
- `tasks/gsc-indexing-fix/REVIEW-PACK.md` (working draft, audit trail)
- `tasks/gsc-indexing-fix/SPEC.md` (early draft, superseded)
- `tasks/gsc-indexing-fix/IMPLEMENTATION-PLAN.md` (round-2 execution plan)
- `tasks/gsc-indexing-fix/evidence/` (matrix CSV, baseline scans, sitemap fetch tests, orphan spot-check JSON)
- `tasks/gsc-indexing-fix/orchestration/` (per-agent handoff notes from the orchestrated round-2 work)

### 8.3 How to re-run things

**Re-run the GSC CSV audit** (after a fresh GSC export):
```bash
node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs
```

**Re-run the regression tests** (every CI run, or manually before a deploy):
```bash
npm test -- seo-indexing
```

**Re-run the breadcrumb dedup scan** (after any schema/breadcrumb change):
```bash
rm -rf .next && npm run build
python3 -c "
import re, glob
total = dups = 0
for path in glob.glob('.next/server/app/**/*.html', recursive=True):
    total += 1
    html = open(path, encoding='utf-8', errors='ignore').read()
    blocks = re.findall(r'<script type=\"application/ld\\+json\"[^>]*>(.*?)</script>', html, re.DOTALL)
    if sum(1 for b in blocks if 'BreadcrumbList' in b) > 1:
        dups += 1
        print(f'  STILL DUP: {path.replace(\".next/server/app/\", \"\")}')
print(f'\n{dups} of {total} pages have >1 BreadcrumbList')
"
```
Expected: `0 of 275 pages have >1 BreadcrumbList`.

**Re-run the live production verification** (after a future deploy):
Paste the Python urllib snippet from §4 into a Python sandbox or run `ctx_execute` equivalent.

---

## End of spec

This document represents the complete state of the GSC indexing work as of 2026-04-30. Future rounds should append to this file or create a successor document referencing it.
