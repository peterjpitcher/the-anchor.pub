# GSC Coverage Issues Fix Spec

**Date:** 2026-04-12
**Source:** 6 Google Search Console Coverage Drilldown exports (all known pages)
**Scope:** the-anchor.pub — code changes only (no content rewrites)

---

## Executive Summary

GSC reports 6 issue categories across ~483 URLs. After cross-referencing with the codebase and adversarial review by 5 Codex specialist agents, most are expected behaviour (legacy Wix redirects, correct canonical handling, deliberate noindex). **1 critical rendering issue**, **2 high-priority fixes**, and **several items requiring manual review** need attention.

---

## Issue 1 — CRITICAL: CSS Files Blocked by robots.txt

**GSC Category:** Blocked by robots.txt (133 URLs)
**Impact:** Google cannot render pages properly — may degrade indexing quality, mobile-friendliness scores, and rich result eligibility.

### Root Cause

`app/robots.ts` includes the rule:

```
Disallow: /*?dpl=*
```

Vercel injects `?dpl=dpl_XXXXX` deployment parameters onto `/_next/static/css/*.css` URLs in page source. Google discovers these parameterised CSS URLs and robots.txt blocks them. This means **Googlebot cannot fetch CSS to render any page**.

~99 of the 133 blocked URLs are CSS files with `?dpl=` suffixes.

### Fix

Update `app/robots.ts` to allow static assets even with `?dpl=` parameters. The `allow` field must be changed from a single string to an array:

```typescript
// Change allow from string to array:
allow: ['/', '/_next/static/'],

// Keep existing disallow array unchanged:
disallow: [
  '/api/',
  '/_next/data/',
  '/_next/static/media/',
  '/*?dpl=*',
  // ... rest unchanged
]
```

**Why this works:** Google resolves robots.txt conflicts by **path specificity** (longest matching path wins), not by line order. `Allow: /_next/static/` is more specific than `Disallow: /*?dpl=*` for CSS URLs like `/_next/static/css/abc.css?dpl=...`, so the allow rule wins. The `/_next/static/media/` disallow is even more specific and continues to block media assets as intended.

**Note:** `MetadataRoute.Robots` in Next.js serialises all Allow lines first, then all Disallow lines. This is cosmetic — Google uses specificity, not position.

### Verification
- Deploy, then verify live `/robots.txt` output includes `Allow: /_next/static/`
- Use GSC's **robots.txt report** "Request a recrawl" action (not URL Inspection re-indexing — that is for page URLs, not robots.txt refresh)
- After recrawl, use URL Inspection "Test Live URL" on homepage — check "Page resources" tab
- Monitor GSC "Blocked by robots.txt" count over 2-4 weeks (expect drop from ~133 to ~12)

---

## Issue 2 — HIGH: Test/Debug Pages in Production

**GSC Category:** Blocked by robots.txt (10 URLs)
**Impact:** Crawl budget waste, unprofessional if discovered, potential information leakage.

### Current State

10 test/debug page directories exist in production (20 files total — each contains `page.tsx` + `head.tsx`). They are blocked only by robots.txt:

| Directory | Files |
|-----------|-------|
| `app/test-simple/` | page.tsx, head.tsx |
| `app/test-tracking/` | page.tsx, head.tsx |
| `app/test-reviews/` | page.tsx, head.tsx |
| `app/test-gtm/` | page.tsx, head.tsx |
| `app/test-navigation-tracking/` | page.tsx, head.tsx |
| `app/test-hours/` | page.tsx, head.tsx |
| `app/gtm-debug/` | page.tsx, head.tsx |
| `app/debug-hours/` | page.tsx, head.tsx |
| `app/demo-header/` | page.tsx, head.tsx |
| `app/components/` | page.tsx, head.tsx |

No production code imports these routes (confirmed by Codex codebase search). However, two files reference them:
- `app/sitemap-page/page.tsx` — links to test pages (must update)
- `scripts/audit-hero.js` — references test pages (must update)

### Fix

Delete all 10 directories (20 files). In the same changeset:
1. Update `app/sitemap-page/page.tsx` to remove links to deleted pages
2. Update `scripts/audit-hero.js` to remove references to deleted pages
3. Optionally remove the 10 corresponding disallow entries in `app/robots.ts` (cosmetic cleanup)

### Verification
- `npm run build` succeeds after deletion
- Visit each URL on production — should return 404
- `app/sitemap-page/` renders without broken links

---

## ~~Issue 3 — REMOVED after adversarial review~~

> **Original proposal:** Add `*/opengraph-image` to robots.txt disallow to save crawl budget.
>
> **Why removed:** Codex adversarial review confirmed that Twitter/X (`Twitterbot`), Facebook (`FacebookExternalHit`), and LinkedIn crawlers **all respect robots.txt**. Blocking opengraph-image routes would break social media preview images for all event pages. The existing `X-Robots-Tag: noindex, nofollow, noimageindex` header on the OG route is the correct approach and is already working. The original claim that social crawlers "typically ignore robots.txt" was false.
>
> Additionally, `*/opengraph-image` is syntactically invalid — robots.txt paths must start with `/`.

---

## ~~Issue 4 — REMOVED after adversarial review~~

> **Original proposal:** Fix broken image path `/images/page-headers/drinks/optimized/drinks-1920w`.
>
> **Why removed:** Codex codebase-wide search confirmed `drinks-1920w` does not exist anywhere in the codebase. The `/public/images/page-headers/drinks/optimized/` directory doesn't exist either. This is an external or legacy Wix reference that cannot be fixed with a code change. It will naturally drop from GSC as Google stops re-crawling it.

---

## Issue 5 — HIGH: Cloudflare Email Protection 404

**GSC Category:** Not found (404)
**URL:** `/cdn-cgi/l/email-protection`
**Last crawled:** 2025-10-19

### Fix

Add robots.txt disallow for Cloudflare internal paths:

```typescript
// In app/robots.ts:
{ disallow: '/cdn-cgi/' },
```

### Verification
- Check robots.txt includes the rule

---

## Issue 6 — MEDIUM: Booking Wizard State Leaking as URLs

**GSC Category:** Alternative page with proper canonical tag (7 URLs)
**Impact:** Minor crawl budget waste. Canonical tags are working correctly (Google respects them), but wizard state parameters create unnecessary URL variants.

### URLs Affected

- `/book-table?purpose=drinks`
- `/book-table?purpose=food`
- `/book-table?purpose=sunday_lunch`
- `/book-table?tab=sunday`
- `/book-table?step=1&type=regular`
- `/book-table?date=2026-03-15&purpose=food&sunday_lunch=true&mothers_day=true`

### Current State

Canonical tag is correctly set to `/book-table` (confirmed in codebase). Google respects this. The parameters are used for prefilling form state and are legitimately useful for social media campaign links.

### Fix — Do Not Implement

> **Original proposal:** Add `Disallow: /book-table?*` to robots.txt.
>
> **Why rejected (adversarial review):** GSC already reports these as "Alternative page with proper canonical tag" — meaning canonical resolution is working correctly. Adding a robots.txt block would **prevent Google from recrawling the variants**, meaning it can no longer verify the canonical. Google explicitly warns against using robots.txt for canonicalisation.
>
> The deeper issue is that the site itself generates parameterised URLs from campaign pages (`app/halloween/page.tsx`, `app/sunday-lunch/page.tsx`, `app/fathers-day/page.tsx`) and the booking wizard. The correct long-term fix is normalising these internal links, not blocking the symptom.
>
> **Note:** `?purpose=sunday_lunch` is not even a valid parameter — `parsePurpose()` only accepts `food` or `drinks`.

---

## Issue 7 — MEDIUM: Future Event URLs Returning 404

**GSC Category:** Not found (404) — 6 URLs
**URLs:** `/events/bingo-2026-07-29`, `/events/bingo-2026-11-18`, `/events/bingo-2026-05-20`, etc.

### Root Cause

These event URLs were previously in the sitemap (before commit `eaa92a7` excluded stale/cancelled events). The events either don't exist yet in the management API or were removed. Google remembers the URLs and keeps re-crawling.

### Fix

No code change needed — the sitemap fix is already deployed. These will naturally drop from GSC as Google re-crawls and consistently gets 404s.

**Optional acceleration:** Return 410 (Gone) instead of 404 for event URLs where the event ID doesn't match any known event. This tells Google to remove the URL faster.

In `app/events/[id]/page.tsx`, when the API returns no event for a slug that looks like a valid event ID pattern (e.g., matches `slug-YYYY-MM-DD`):

```typescript
// Instead of notFound() which returns 404:
// Return 410 Gone for events that look like valid slugs but don't exist
```

This requires a custom 410 response, which Next.js doesn't natively support via `notFound()`. Could be handled via `redirect()` to a 410 API route or by returning a Response object.

### Verification
- Monitor 404 count in GSC — should decline over 4-8 weeks

---

## Issue 8 — MEDIUM: Blog Tag Pages — Thin Content Risk

**GSC Category:** Crawled - currently not indexed (16 tag URLs)
**Impact:** Google is crawling tag pages but refusing to index many of them, wasting crawl budget.

### Current State

- 143 blog posts across ~21 published tags
- `app/blog/tag/[tag]/page.tsx` does NOT set `noindex` — all tag pages are treated as indexable
- Tags with 0 posts already redirect to `/blog/tags` (line 66-67)
- 8 tags currently have only 1 post

### Fix — Deferred: Requires Manual Tag Review

> **Original proposal:** Add conditional `noindex` for tags with <3 posts.
>
> **Why deferred (adversarial review):** Post count alone is not a valid thin-content proxy in this codebase. `lib/tag-seo-content.ts` contains bespoke SEO copy and strategic intent for curated tag pages — including some single-post tags like `food`, `parking`, and `entertainment` that are deliberate SEO landing pages.
>
> Additionally, `generateMetadata()` doesn't have access to post count without duplicating the filesystem read from the page component. The original code snippet referenced `getPostsByTag(tag)` which doesn't exist.
>
> **Recommended approach:** Manually review the 8 single-post tags against `lib/tag-seo-content.ts` to determine which are curated SEO pages (keep indexed) vs auto-generated thin content (noindex). Consider adding a `noindex: true` flag to the tag SEO content config rather than using a count threshold.

---

## Issue 9 — LOW: Non-www Domain Variants in GSC

**GSC Category:** Multiple (404, crawled not indexed)
**URLs:** ~5 non-www variants (e.g., `https://the-anchor.pub/events/drag-shows`)

### Current State

Middleware correctly redirects non-www to www. These are likely cached from before the redirect was implemented, or from external links using the non-www URL.

### Fix

No code change needed. Verify in Cloudflare that the apex domain (`the-anchor.pub`) has a 301 redirect rule to `www.the-anchor.pub`. The middleware handles this at the application level, but a Cloudflare page rule is more efficient (handles it at CDN edge before hitting the application).

### Verification
- `curl -I https://the-anchor.pub/food` should return 301 to `https://www.the-anchor.pub/food`

---

## No Action Required

These GSC categories are working correctly and need no changes:

| Category | Count | Why It's Fine |
|----------|-------|---------------|
| Page with redirect | 219 | Expected — legacy Wix URLs, HTTP/non-www canonicalisation |
| Alternative page with proper canonical | 20 | UTM parameters correctly resolving to clean canonicals |
| Excluded by noindex tag | 35 | Deliberate — old blog posts, booking confirmation, past events |
| Legacy /post/* redirects | 42 | Handled by blog-redirects.json (198 entries) |
| Legacy /event-details/* redirects | 8 | Handled by wix-redirects.json catch-all |
| Legacy /drinks/* redirects | 14 | Handled by drinks-redirects.json (77 entries) |
| Legacy /blog/tag/* redirects | 88 | Handled by tag-redirects.json |
| Legacy /blog/page/* redirects | 9 | Handled by wix-redirects.json |

---

## Implementation Plan

### Phase 1 — Critical (Deploy ASAP)
1. Fix `app/robots.ts`: change `allow` to array `['/', '/_next/static/']` (Issue 1)
2. Add `/cdn-cgi/` to disallow array (Issue 5)

### Phase 2 — High Priority (Same Sprint)
3. Delete 10 test/debug page directories (20 files) (Issue 2)
4. Update `app/sitemap-page/page.tsx` — remove links to deleted pages
5. Update `scripts/audit-hero.js` — remove references to deleted pages
6. Optionally clean up 10 test page disallow entries in `app/robots.ts`

### Phase 3 — Manual Review Required
7. Review 8 single-post blog tags against `lib/tag-seo-content.ts` to decide noindex per-tag (Issue 8)
8. Optionally return 410 for non-existent event URLs (Issue 7)

### Phase 4 — Manual/External Verification
9. Verify Cloudflare non-www redirect (Issue 9)
10. Use GSC robots.txt report "Request a recrawl" after Phase 1 deploys
11. Verify live CSS `X-Robots-Tag` headers with `curl -I` (may differ from next.config.js)
12. Compare live `/robots.txt` with `app/robots.ts` output (check for Cloudflare modification)

---

## Files to Modify

| File | Changes |
|------|---------|
| `app/robots.ts` | Change `allow` to array `['/', '/_next/static/']`, add `/cdn-cgi/` to disallow, optionally remove 10 test page disallows |
| `app/test-simple/` | Delete entire directory (page.tsx + head.tsx) |
| `app/test-tracking/` | Delete entire directory (page.tsx + head.tsx) |
| `app/test-reviews/` | Delete entire directory (page.tsx + head.tsx) |
| `app/test-gtm/` | Delete entire directory (page.tsx + head.tsx) |
| `app/test-navigation-tracking/` | Delete entire directory (page.tsx + head.tsx) |
| `app/test-hours/` | Delete entire directory (page.tsx + head.tsx) |
| `app/gtm-debug/` | Delete entire directory (page.tsx + head.tsx) |
| `app/debug-hours/` | Delete entire directory (page.tsx + head.tsx) |
| `app/demo-header/` | Delete entire directory (page.tsx + head.tsx) |
| `app/components/` | Delete entire directory (page.tsx + head.tsx) |
| `app/sitemap-page/page.tsx` | Remove links to deleted test/debug pages |
| `scripts/audit-hero.js` | Remove references to deleted test pages |

---

## Expected Outcomes

| Metric | Before | After (4-8 weeks) |
|--------|--------|-------------------|
| Blocked by robots.txt | 133 | ~12 (API routes only) |
| Not found (404) | 33 | ~25 (legacy URLs naturally fading) |
| Crawled not indexed | 62 | ~45 (OG images still appear but are handled by X-Robots-Tag) |
| Page rendering in GSC | Degraded (no CSS) | Full rendering restored |

---

## Adversarial Review Notes

This spec was reviewed by 5 Codex specialist agents on 2026-04-12 (Mode C: Spec Compliance). Key corrections applied:

1. **Issue 3 removed** — OG image robots.txt block would break social media previews (Twitter, Facebook, LinkedIn all respect robots.txt)
2. **Issue 4 removed** — phantom image reference not found in codebase
3. **Issue 1 fix syntax corrected** — `allow` must be an array, precedence is by path specificity not line order
4. **Issue 6 changed to "do not implement"** — canonical resolution already working, robots.txt would be counterproductive
5. **Issue 8 deferred** — single-post tags may be curated SEO pages, needs manual review
6. **Verification workflow corrected** — use GSC robots.txt report recrawl, not URL Inspection re-indexing

Full review: `tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-adversarial-review.md`
Hand-off brief: `tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-claude-handoff.md`
