# Technical SEO Audit: the-anchor.pub

**Date:** 20 March 2026
**Auditor:** Technical SEO Specialist (AI-assisted)
**Stack:** Next.js 14 App Router, Vercel, Cloudflare DNS
**Canonical domain:** https://www.the-anchor.pub

---

## Executive Summary

The site has seen strong YoY growth (clicks up 124% on mobile, 60% on desktop; average position improved from 23.85 to 13.07 mobile), indicating the existing SEO foundation is working. However, several high-impact technical issues remain that, if resolved, could accelerate growth further. The most critical gaps are around structured data coverage (only drinks pages and the global layout carry schema beyond the site-wide LocalBusiness), the keyword-stuffed default title tag, and missing canonical tags on some page types.

**Overall Health Score: 7/10** -- solid foundations with clear opportunities.

---

## 1. Crawlability & Indexation

### 1.1 Robots.txt

**Rating: Good**

The robots.txt is dynamically generated via Next.js `app/robots.ts` and is well-configured:

- Correctly blocks `/api/`, `/_next/data/`, `/_next/static/media/`, Vercel deploy URLs (`/*?dpl=*`), and internal debug/test routes
- Correctly references the sitemap at `https://www.the-anchor.pub/sitemap.xml`
- Test/debug pages (`/debug-hours`, `/demo-header`, `/gtm-debug`, `/test-*`, `/components`, `/p5-demo`) are all blocked

**Issue: Cache-Control on robots.txt is overly aggressive** | Impact: **Low**

The `next.config.js` sets `Cache-Control: public, max-age=31536000, immutable` on `/robots.txt`. This means changes to robots.txt (e.g., unblocking a new section) will not propagate for up to 1 year through CDN caches. Recommendation: reduce to `max-age=86400` (1 day) or `max-age=3600` (1 hour).

**3 URLs blocked by robots.txt (per Screaming Frog)**

These are expected -- the blocked routes are almost certainly `/api/*`, `/_next/*`, or test routes. No action needed unless GSC reports indexation issues from these blocks.

### 1.2 Sitemap

**Rating: Good with minor issues**

The sitemap is dynamically generated from `app/sitemap.ts` and includes:

- 171 static routes (manually listed)
- Blog posts (dynamically from markdown, with 2 excluded slugs)
- Blog tag pages (excluding redirected tags)
- Landmark-based private hire pages (dynamic from `local-seo-data`)
- Events (fetched from management API, paginated, filtered for non-draft)

**Positive patterns:**
- Proper `changeFrequency` and `priority` values differentiated by content type
- Future events get `daily` change frequency; past events get `monthly`
- Draft and fallback events excluded
- Revalidates hourly (`revalidate = 60 * 60`)

**Issue: Sitemap uses `force-dynamic` rendering** | Impact: **Low**

`export const dynamic = 'force-dynamic'` means the sitemap is regenerated on every request, even though it revalidates hourly. This wastes compute but does not affect SEO directly. Consider using ISR-only (`revalidate`) without `force-dynamic`.

**Issue: `lastModified` is `new Date()` for all static routes** | Impact: **Low**

Every static route claims it was last modified "right now", which dilutes the signal to search engines. Google largely ignores `lastmod` when it's unreliable, but providing accurate dates (e.g., from git commit timestamps or a content CMS) would improve crawl prioritisation.

### 1.3 Crawl Budget

**Rating: Acceptable -- monitor as site grows**

With approximately 195 indexable pages and a well-structured robots.txt, crawl budget is not currently a concern. However:

- The site has 100+ static pages plus dynamic events, blog posts, tags, and landmarks
- The large number of location/hotel-proximity pages (12 hotel pages, 12 town pages, 4 terminal pages) creates a programmatic SEO footprint that Google may evaluate for thin content
- Recommendation: monitor GSC's "Crawl Stats" report for any drop in crawl rate

### 1.4 Catch-All Route & Soft 404s

**Issue: `[...unmatched]` catch-all redirects to homepage** | Impact: **Medium**

The file `app/[...unmatched]/page.tsx` redirects all unmatched URLs to the homepage (via `buildFallbackHomeRedirect`). This means:

- There is no true 404 page -- every invalid URL becomes a redirect to `/`
- Google may flag these as soft 404s in GSC
- Googlebot crawling old/broken URLs will follow the redirect instead of getting a clean 404

**Recommendation:** Return a proper 404 response with a helpful "page not found" page. Use `notFound()` as the default behaviour, keeping the redirect only for the specific `?dpl=` Vercel preview parameter case.

---

## 2. Technical Foundations

### 2.1 URL Structure

**Rating: Good**

- Clean, keyword-rich URL slugs (`/pub-near-sofitel-heathrow`, `/near-heathrow/terminal-5`, `/private-hire/wakes`)
- Logical hierarchy for location pages, private hire sub-pages, live sport categories
- Blog uses `/blog/[slug]` and tag pages use `/blog/tag/[tag]`
- Events use `/events/[id]` (slug-based)

**Issue: Some URL overlap / cannibalisation risk** | Impact: **Medium**

Several pages target closely related queries and could compete with each other:

| Page A | Page B | Overlap Risk |
|--------|--------|-------------|
| `/beer-garden` | `/pub-garden-heathrow` | Both target "pub garden heathrow" |
| `/pubs-in-stanwell` | `/stanwell-pub` | Both target "stanwell pub" |
| `/private-hire` | `/private-party-venue` | Both target "private party venue" |
| `/private-hire` | `/function-room-hire` | Both target "function room hire" |
| `/heathrow-parking` | `/free-parking` (redirects) | Redirect in place, but watch for residual indexation |

**Recommendation:** Review GSC query data for these page pairs. Consider consolidating where one page consistently outperforms the other, or strengthening internal link differentiation.

### 2.2 Canonical Tags

**Rating: Good -- 96 pages have canonical tags set**

All 96 audited page files contain `alternates: { canonical: '/path' }` in their metadata exports. The root layout correctly sets `metadataBase: new URL('https://www.the-anchor.pub')` without a root-level canonical (avoiding the past bug where all pages claimed to be the homepage).

**Issue: Canonical tags use relative paths, not `./`** | Impact: **Low**

The CLAUDE.md recommends using `canonical: './'` (relative to page), but actual pages use absolute paths like `canonical: '/drinks'`. Both work correctly with `metadataBase` set. The absolute path approach is actually clearer and prevents any ambiguity with nested routes, so this is fine in practice.

**Issue: Dynamic routes (blog tags, events, landmarks) need verification** | Impact: **Medium**

The `events/[id]/page.tsx` generates canonical from `event.slug || params.id`, which is correct. Blog tag pages and landmark pages should be verified to ensure their canonical URLs resolve correctly and don't create duplicates.

### 2.3 Redirect Handling

**Rating: Good -- well-organised**

Redirects are managed across 6 JSON configuration files (3,384 total lines):

| File | Purpose | Entries (approx) |
|------|---------|-----------------|
| `wix-redirects.json` | Legacy Wix site URLs | ~130 |
| `blog-redirects.json` | Old blog URL patterns | ~160 |
| `tag-redirects.json` | Consolidated blog tags | ~115 |
| `legacy-redirects.json` | Old feature URLs | 6 |
| `drinks-redirects.json` | Old drinks menu paths | ~60 |
| `additional-redirects.json` | Miscellaneous | ~80 |

The `normaliseRedirect` function in `next.config.js` correctly converts `permanent: true` to `statusCode: 301` and `permanent: false` to `statusCode: 302`.

**Screaming Frog findings: 18 x 301, 4 x 308**

The 308s likely come from Vercel/Next.js trailing slash handling (Next.js uses 308 for permanent redirects when `trailingSlash` config is involved). This is standard behaviour and not a concern.

**Issue: No 308 redirects are explicitly configured in code** | Impact: **Low**

No redirect config file contains `statusCode: 308`. The 4 x 308 redirects are therefore generated by Vercel/Next.js infrastructure (likely trailing slash normalisation or `www` enforcement). These are clean and expected.

**Issue: Verify no redirect chains exist** | Impact: **Medium**

With 550+ redirect rules across 6 files, there is a risk of chains (A -> B -> C). Example concern: `/free-parking` -> `/heathrow-parking` is configured, but if any Wix redirect also targets `/free-parking`, a chain would form.

**Recommendation:** Run a redirect chain audit in Screaming Frog. Use "Redirect Chains" report. Any chain of 2+ hops should be flattened.

### 2.4 HTTPS & Security Headers

**Rating: Good**

| Header | Value | Assessment |
|--------|-------|-----------|
| X-Content-Type-Options | nosniff | Correct |
| X-Frame-Options | DENY | Correct (upgraded from SAMEORIGIN noted in brief) |
| X-XSS-Protection | 1; mode=block | Present (deprecated but harmless) |
| X-DNS-Prefetch-Control | on | Correct |
| Referrer-Policy | Not set in code | Relies on browser default; consider adding `strict-origin-when-cross-origin` |
| Content-Security-Policy | Intentionally absent | Documented reason (breaks GTM/Next.js) -- acceptable |
| Strict-Transport-Security | Not set in code | **Missing** |
| Permissions-Policy | Not set | Optional but recommended |

**Issue: Missing HSTS header** | Impact: **Medium**

`Strict-Transport-Security` is not configured in `next.config.js` headers. While Cloudflare likely handles HSTS at the edge, adding it at the application level provides defence-in-depth:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Issue: Missing Referrer-Policy header** | Impact: **Low**

No `Referrer-Policy` header is set in code. Browser defaults vary. Adding `strict-origin-when-cross-origin` would standardise behaviour across browsers and protect referrer data.

### 2.5 `poweredByHeader: false`

**Rating: Good** -- the `X-Powered-By: Next.js` header is suppressed, which is a security best practice.

---

## 3. Schema Markup Coverage

### 3.1 Current State

**Global (all pages via `DynamicSchema` in root layout):**
- Organization schema (with social profiles)
- LocalBusiness/Restaurant/BarOrPub schema (with aggregateRating, openingHours, amenities, ReserveAction)
- WebSite schema

**Page-specific schemas (via `JsonLd` component -- 80 pages):**

80 out of ~96 content pages include page-specific JSON-LD via the `<JsonLd>` component. This is good coverage. However, the specific schema types used on each page were not individually audited.

**Defined but potentially underused schemas in `lib/schema.ts` and `lib/enhanced-schemas.ts`:**
- `quizNightEventSeries` -- defined but not found on `/quiz-night` page
- `bingoEventSeries` -- defined but not found on `/cash-bingo` or `/music-bingo` pages
- `parkingFacilitySchema` -- used on homepage
- `homepageFAQSchema` -- available in `enhanced-schemas.ts`
- `findUsPlaceSchema` -- available but usage unverified
- `eventBookingServiceSchema` -- available for private hire pages
- `speakableSchema` -- available
- `over65sOfferSchema` -- available

### 3.2 Missing Schema Opportunities

**Issue: Event pages lack Event schema in page metadata** | Impact: **High**

The `events/[id]/page.tsx` imports `EventSchema` component, which is good. However, individual event pages should include full `Event` schema with:
- `startDate`, `endDate`, `location`, `offers`, `performer`, `eventStatus`, `eventAttendanceMode`
- This is the highest-value schema opportunity -- Google surfaces Event rich results prominently

Verify the `EventSchema` component outputs valid, complete schema by testing with Google's Rich Results Test.

**Issue: Quiz Night, Music Bingo, Cash Bingo pages lack EventSeries schema** | Impact: **High**

The schemas `quizNightEventSeries` and `bingoEventSeries` are defined in `lib/schema.ts` but grep shows they are NOT imported in `/quiz-night/page.tsx` or `/music-bingo/page.tsx`. These recurring event pages are prime candidates for `EventSeries` rich results.

**Issue: No FAQPage schema on most pages** | Impact: **Medium**

`homepageFAQSchema` is defined but many pages with FAQ content (private hire, parking, Sunday lunch, food menu) would benefit from `FAQPage` schema. The homepage uses `FAQAccordionWithSchema` component, which likely handles it -- but other pages may not.

**Issue: No Menu schema on food-menu page** | Impact: **Medium**

The `/food-menu` page is a core conversion page but does not appear to use `Menu` schema markup. The `drinksMenuSchema` exists for drinks but there is no equivalent for the food menu. Adding `Menu` schema with `MenuSection` and `MenuItem` would help Google understand the food offering.

**Issue: No BreadcrumbList schema across site** | Impact: **Medium**

`generateBreadcrumbSchema` utility exists in `lib/enhanced-schemas.ts` but was only found used on drinks sub-pages. Breadcrumb schema should be present on all hierarchical pages (private hire sub-pages, near-heathrow terminals, live sport sub-pages, blog posts).

**Issue: No Article/BlogPosting schema on blog posts** | Impact: **Medium**

Blog pages at `/blog/[slug]` should include `Article` or `BlogPosting` schema with `author`, `datePublished`, `dateModified`, `headline`, and `image`. This enables Google's article rich results.

**Issue: Private hire pages lack Service schema** | Impact: **Low**

`eventBookingServiceSchema` is defined but not verified as used on private hire sub-pages (`/private-hire/wakes`, `/private-hire/christenings`, etc.).

### 3.3 Schema Quality Issues

**Issue: `over65sOfferSchema` has expired `validThrough` date** | Impact: **Low**

The offer schema in `enhanced-schemas.ts` has `"validThrough": "2025-12-31"` -- this date has passed. If this schema is rendered on any page, Google will flag it as an expired offer. Update to `2026-12-31` or remove the date constraint.

**Issue: Duplicate LocalBusiness schemas** | Impact: **Low**

Both `lib/schema.ts` (exported as `localBusinessSchema`) and `lib/schema-with-reviews.ts` (exported as `localBusinessSchemaWithReviews`) define LocalBusiness schemas. The `DynamicSchema` component uses the reviews-enhanced version, which is correct. But if any page accidentally imports from `lib/schema.ts` directly, there could be conflicting schema on the same page.

---

## 4. Site Speed & Performance Signals

### 4.1 Architecture Assessment

**Rating: Good -- well-optimised architecture**

**Positive signals from codebase analysis:**

| Feature | Implementation | Assessment |
|---------|---------------|-----------|
| Font loading | `display: 'swap'` on both Outfit and Merriweather | Prevents FOIT, good for LCP |
| Font subsetting | `subsets: ['latin']` | Reduces font file size |
| Image optimisation | Next.js `<Image>` with AVIF/WebP formats | Modern format support |
| Image caching | `minimumCacheTTL: 365 days` | Aggressive, appropriate for static images |
| Device sizes | Custom `deviceSizes` array matching common breakpoints | Prevents oversized images |
| Static asset caching | `immutable` + 1 year max-age on `/_next/static/`, images, fonts | Correct |
| Compression | `compress: true` | gzip/brotli enabled |
| Source maps | `productionBrowserSourceMaps: false` | No source maps in production |
| SWC minification | `swcMinify: true` | Faster builds, smaller bundles |
| Resource hints | `preconnect` to management API, `dns-prefetch` for GTM/GA | Reduces connection latency |
| Code splitting | Dynamic imports for `EventCountdownBanner`, `ChristmasLightbox`, `PrivateHire2026PromoGate` | Non-critical JS deferred |
| `DeferredRender` wrapper | Delays rendering of non-essential overlays | Reduces initial hydration cost |
| `poweredByHeader: false` | Removes unnecessary header | Marginal perf benefit |

**Issue: GTM loaded render-blocking in `<head>`** | Impact: **Medium**

GTM is injected as an inline `<script>` in `<head>` (lines 163-173 of root layout). While the script itself is `async`, GTM's container can load substantial third-party scripts that affect TBT and INP. Consider:

1. Loading GTM after user interaction or after `DOMContentLoaded`
2. Using `requestIdleCallback` or `setTimeout` to defer GTM initialisation
3. At minimum, audit GTM container for unnecessary tags

**Issue: Two Google Fonts loaded (Outfit + Merriweather)** | Impact: **Low**

Loading two font families (Outfit for sans-serif, Merriweather with 4 weights for serif) adds to initial payload. Next.js optimises Google Fonts well (self-hosted, preloaded), but 4 Merriweather weights (300, 400, 700, 900) is generous. Consider whether weight 300 and 900 are actually used.

**Issue: `removeConsole` is disabled in production** | Impact: **Low**

The `next.config.js` comments indicate `removeConsole` is "temporarily disabled for debugging". Console.log statements in production add minor overhead and leak implementation details. Re-enable when debugging is complete.

### 4.2 Core Web Vitals (Field Data)

PageSpeed Insights API quota was exceeded during this audit. The following is inferred from architecture analysis:

**Likely LCP performance:** Good to Needs Improvement
- Server-side rendering (SSR) with Next.js should deliver fast initial HTML
- Font swap and image optimisation help LCP
- Risk factor: hero images and GTM could delay LCP if the largest element is an image loaded via management API

**Likely CLS performance:** Likely Good
- SSR reduces layout shifts
- Font `display: 'swap'` can cause minor CLS if fallback/web font metrics differ significantly
- Dynamic content (status bars, countdown banners) loaded after initial render could cause shifts

**Likely INP performance:** Monitor
- `DeferredRender` and dynamic imports help
- GTM and third-party scripts are the main risk

**Recommendation:** Run PageSpeed Insights manually and record baseline scores. Set up CrUX monitoring via GSC or web-vitals.js (already present via `WebVitals` component).

---

## 5. Mobile Readiness

### 5.1 Architecture Assessment

**Rating: Good**

| Feature | Evidence |
|---------|---------|
| Viewport meta tag | `<meta name="viewport" content="width=device-width, initial-scale=1" />` |
| Responsive images | Next.js Image component with `deviceSizes` configured |
| `lang="en"` on `<html>` | Correctly set |
| Skip navigation link | Present (`.sr-only` + focus styles) |
| Mobile-first CSS | Tailwind CSS (mobile-first by default) |
| Touch targets | Not audited (requires visual inspection) |
| theme-color | `#005131` set in meta tag |
| Web app manifest | `manifest.json` linked |
| Apple touch icon | Present |
| Format detection disabled | `telephone: false, email: false, address: false` -- prevents unwanted auto-linking |

**GSC data confirms mobile dominance:** 466 clicks vs 147 desktop (76% mobile). The site is primarily consumed on mobile devices, likely from travellers near Heathrow.

---

## 6. Title Tag Analysis

### 6.1 Default Title Tag

**Issue: Root layout default title is keyword-stuffed** | Impact: **High**

```
Traditional Bar Near Me | The Anchor - Heathrow Pub & Dining | Surrey Bar Near Heathrow
```

Problems:
1. **86 characters** -- exceeds the ~60 character display limit in SERPs; Google will truncate
2. **Keyword stuffing** -- "Bar Near Me", "Heathrow Pub & Dining", "Surrey Bar Near Heathrow" is three keyword phrases crammed together
3. **"Near Me" in title** -- Google handles proximity queries algorithmically; putting "Near Me" in a title tag does not help ranking for "bar near me" queries and looks spammy
4. **Brand inconsistency** -- CLAUDE.md says brand is "The Anchor" (not "The Anchor Pub"), but the title uses "The Anchor - Heathrow Pub & Dining"
5. **Falls back on any page missing its own title** -- if any page omits `title` in its metadata, this keyword-stuffed string becomes its title

**Recommendation:** Simplify to something like:
```
The Anchor | Traditional Pub Near Heathrow Airport
```

This is 50 characters, includes brand name, primary keyword, and geographic qualifier without stuffing.

### 6.2 Template Title

The template `%s | The Anchor - Heathrow Pub & Dining` is 40 characters of suffix alone. When combined with a page title, the total can easily exceed 60 characters.

**Recommendation:** Shorten to `%s | The Anchor Stanwell Moor` (30 chars) or `%s | The Anchor` (16 chars) to give more room for page-specific keywords.

### 6.3 Meta Keywords

**Issue: 84 pages include `keywords` meta tag** | Impact: **Low (informational)**

Google has officially ignored the `keywords` meta tag since 2009. Including it does not help rankings and can reveal your SEO strategy to competitors. Not harmful, but consider removing to simplify code.

---

## 7. Redirect Assessment

### 7.1 301 Redirects (18 found by Screaming Frog)

These are expected from the 550+ redirect rules configured across the 6 JSON files. The redirects serve legitimate purposes:

- **Wix migration** -- old Wix site URLs redirected to new Next.js equivalents
- **Content consolidation** -- old blog posts, deprecated pages redirected to current versions
- **URL structure changes** -- e.g., `/contact` -> `/find-us`, `/free-parking` -> `/heathrow-parking`

### 7.2 308 Redirects (4 found)

These are generated by Next.js/Vercel infrastructure (trailing slash normalisation or `www` enforcement). Not configured in application code. This is normal and clean.

### 7.3 Status 0 (3 found)

Three URLs returned status 0 (connection failure) in Screaming Frog. These are likely:
- External links that were unreachable at crawl time
- Blocked by firewall/CDN during crawl
- Or timeout on API-dependent pages during build

**Recommendation:** Identify these 3 URLs from the Screaming Frog report and verify they resolve correctly.

---

## 8. Additional Findings

### 8.1 Google Search Appearance

From web search results for `site:the-anchor.pub`:

- Homepage is indexed with title: "The Anchor - Heathrow Pub & Dining's Premier Entertainment Venue" (Google is rewriting the stuffed title)
- Key pages indexed: `/find-us`, `/beer-garden`, `/drinks`, location pages
- An old URL `/our-events` appeared in search results -- this should redirect to `/whats-on` if it does not already
- Product snippets showing in GSC (1 click, 1,463 impressions) -- likely from drinks menu schema

**Issue: `/our-events` appears indexed but may not exist** | Impact: **Medium**

The search results show `https://www.the-anchor.pub/our-events` as an indexed page with title "Events at The Anchor". However, this URL does not appear in the sitemap or route structure. It may be:
- An old Wix URL that is redirected (check redirect configs)
- A catch-all route that silently redirects to homepage
- An actually indexed page from a previous site version

**Recommendation:** Verify `/our-events` is properly redirected to `/whats-on` with a 301. If not, add the redirect.

### 8.2 OpenGraph & Social

**Rating: Good**

- Root layout sets comprehensive OpenGraph metadata (title, description, image, locale, type)
- Twitter card metadata (`summary_large_image`) is configured
- Individual pages override OG metadata appropriately
- `getTwitterMetadata` utility standardises Twitter card generation

### 8.3 Internationalisation

**Not applicable** -- single-language (English), single-market (UK) site. `locale: 'en_GB'` correctly set in OpenGraph. `lang="en"` on HTML element. No hreflang needed.

### 8.4 Accessibility-SEO Overlap

- Skip navigation link present
- Semantic HTML structure (`<header>`, `<main>`, `<footer>` with ARIA roles)
- `alt` text handling depends on individual page implementation (not audited per-page)
- `format-detection: telephone=no` prevents unwanted phone number auto-linking on iOS

---

## 9. Prioritised Action Items

### Critical (Fix within 1 week)

| # | Issue | Section | Expected Impact |
|---|-------|---------|----------------|
| 1 | Replace keyword-stuffed default title tag | 6.1 | Prevents Google title rewriting; improves CTR |
| 2 | Shorten title template suffix | 6.2 | Allows page titles to display fully in SERPs |

### High (Fix within 2 weeks)

| # | Issue | Section | Expected Impact |
|---|-------|---------|----------------|
| 3 | Add EventSeries schema to quiz-night, music-bingo, cash-bingo pages | 3.2 | Enables Event rich results for recurring events |
| 4 | Verify EventSchema component outputs valid Event schema | 3.2 | Ensures event rich results eligibility |
| 5 | Add FAQPage schema to key pages (parking, Sunday lunch, private hire) | 3.2 | FAQ rich results increase SERP real estate |
| 6 | Implement proper 404 page instead of catch-all redirect | 1.4 | Prevents soft 404 issues in GSC |
| 7 | Verify `/our-events` redirects to `/whats-on` | 8.1 | Prevents orphaned indexed page |

### Medium (Fix within 1 month)

| # | Issue | Section | Expected Impact |
|---|-------|---------|----------------|
| 8 | Add Menu schema to food-menu page | 3.2 | Menu rich results for food queries |
| 9 | Add BreadcrumbList schema site-wide | 3.2 | Breadcrumb display in SERPs |
| 10 | Add Article/BlogPosting schema to blog posts | 3.2 | Article rich results |
| 11 | Audit redirect chains across 550+ rules | 2.3 | Eliminate multi-hop redirects |
| 12 | Add HSTS header | 2.4 | Security and minor ranking signal |
| 13 | Defer GTM loading | 4.1 | Improve TBT/INP scores |
| 14 | Review URL overlap/cannibalisation risks | 2.1 | Prevent internal competition |
| 15 | Fix expired `validThrough` date in over65s offer schema | 3.3 | Prevent expired offer warning |

### Low (Fix when convenient)

| # | Issue | Section | Expected Impact |
|---|-------|---------|----------------|
| 16 | Reduce robots.txt cache TTL from 1 year | 1.1 | Faster propagation of robots changes |
| 17 | Use accurate `lastModified` dates in sitemap | 1.2 | Better crawl prioritisation signal |
| 18 | Remove `keywords` meta tags | 6.3 | Code simplification (no SEO impact) |
| 19 | Add Referrer-Policy header | 2.4 | Standardise referrer behaviour |
| 20 | Audit Merriweather font weight usage | 4.1 | Minor payload reduction |
| 21 | Re-enable `removeConsole` in production | 4.1 | Minor cleanup |
| 22 | Remove `force-dynamic` from sitemap.ts | 1.2 | Reduce unnecessary recomputation |

---

## 10. Monitoring Recommendations

1. **Google Search Console** -- check weekly for:
   - Coverage issues (soft 404s from catch-all route)
   - Manual actions
   - Core Web Vitals report
   - "Page with redirect" issues in sitemap

2. **Rich Results Test** -- validate schema for:
   - Homepage (LocalBusiness, Organization, WebSite)
   - An event page (Event schema)
   - Drinks pages (Menu, Product schema)
   - Blog posts (once Article schema is added)

3. **Screaming Frog** -- monthly crawl to catch:
   - Redirect chains
   - Broken internal links
   - Missing canonicals on new pages
   - Title tag length issues

4. **Core Web Vitals** -- monitor via:
   - `WebVitals` component already in root layout
   - CrUX dashboard in GSC
   - Monthly PageSpeed Insights spot checks

---

## Appendix A: Schema Coverage Matrix

| Page Type | LocalBusiness | Event/Series | FAQ | Menu | Breadcrumb | Article | Service |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Homepage | Global | -- | Via component | -- | -- | -- | -- |
| Food Menu | Global | -- | Missing | **Missing** | Missing | -- | -- |
| Drinks | Global | -- | -- | Present | Present | -- | -- |
| Event pages | Global | Present (verify) | -- | -- | -- | -- | -- |
| Quiz Night | Global | **Missing** | Missing | -- | Missing | -- | -- |
| Music Bingo | Global | **Missing** | Missing | -- | Missing | -- | -- |
| Blog posts | Global | -- | -- | -- | Missing | **Missing** | -- |
| Private hire | Global | -- | Missing | -- | Missing | -- | Missing |
| Location pages | Global | -- | Missing | -- | Missing | -- | -- |
| Find Us | Global | -- | -- | -- | Missing | -- | -- |
| Sunday Lunch | Global | -- | Missing | -- | Missing | -- | -- |
| Parking | Global | -- | Missing | -- | Missing | -- | -- |

("Global" = inherited from root layout `DynamicSchema` component)

---

## Appendix B: GSC Performance Summary (28-day comparison)

| Metric | Current Period | Same Period Last Year | Change |
|--------|---------------|----------------------|--------|
| Mobile Clicks | 466 | 208 | +124% |
| Mobile Impressions | 23,260 | 13,578 | +71% |
| Mobile Avg Position | 13.07 | 23.85 | +10.78 positions |
| Desktop Clicks | 147 | 92 | +60% |
| Desktop Impressions | 15,190 | 17,266 | -12% |
| Desktop Avg Position | 22.35 | 43.37 | +21.02 positions |
| Mobile CTR | 2.0% | 1.5% | +0.5pp |
| Desktop CTR | 0.97% | 0.53% | +0.44pp |

**Key observation:** Desktop impressions dropped 12% while position improved dramatically. This likely means the site is now ranking for more specific (lower volume) queries on desktop as broader queries have been captured on mobile.
