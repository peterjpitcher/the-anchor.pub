# SEO Blueprint Audit — The Anchor Website

**Date:** 2026-04-24
**Audited against:** `docs/superpowers/specs/2026-04-24-seo-blueprint-pub-hospitality-design.md`
**Method:** Automated codebase scan (Layers 1–6) + production crawl (218 routes, 211 rendered pages) + live checks
**Build:** passes. **Lint:** fails (audit-hero script). **Tests:** 15 suites / 44 tests failing.

---

## Priority Issues

### P1 — Critical (fix immediately)

| # | Issue | Detail | File(s) |
|---|-------|--------|---------|
| P1.1 | **Sitemap omits 11 indexable pages** | Hardcoded `staticRoutes` misses: `/bedfont-pub`, `/egham-pub`, `/horton-pub`, `/longford-pub`, `/sunbury-pub`, `/windsor-pub`, `/wraysbury-pub`, `/pubs-in-stanwell`, `/pub-near-holiday-inn-heathrow`, `/pub-near-novotel-heathrow`, `/pub-near-radisson-blu-heathrow`. All self-canonical, no noindex. (`/pub-garden-heathrow` redirects to `/beer-garden` — not missing.) | `app/sitemap.ts:77-175` |
| P1.2 | **Robots blocks render-critical media** | Allows `/_next/static/` but then disallows `/_next/static/media/`. This path serves Next.js font files (woff2) and other media needed for accurate page rendering. Googlebot cannot fetch fonts to render pages correctly. | `app/robots.ts:13` |
| P1.3 | **Auto breadcrumbs create broken parent URLs** | `generateBreadcrumbsFromRoute()` splits URLs by `/` and creates links for every intermediate segment. `/private-hire/near/[slug]` generates a link to `/private-hire/near` which is 404. Crawl found this broken link from 17 pages. | `components/hero/HeroWrapper.tsx:327-347` |
| P1.4 | **Event fallback leaks a fake broken event** | When the events API fails, `getUpcomingEvents` returns `the-anchor-showcase` as a fallback event. The homepage renders it with calendar links, but `/api/calendar/event/the-anchor-showcase` returns 404 and server logs repeated `API_EVENT_ERROR` entries. | `lib/api/events.ts:350-359` |

### P2 — High (fix soon)

| # | Issue | Detail | File(s) |
|---|-------|--------|---------|
| P2.1 | **Title template creates overlong duplicate-brand titles** | 206 of 211 rendered pages have titles over 65 characters. Pages already include "The Anchor" then layout appends "\| The Anchor Stanwell Moor" again. | `app/layout.tsx:52-57` + all `*-pub/page.tsx` |
| P2.2 | **15 pages render multiple H1s** | HeroSectionServer always renders H1. 15 crawl-confirmed pages also render a second H1: `/sunday-lunch`, `/live-sport`, `/live-music`, `/heathrow-family-dining`, `/food-menu/vegetarian`, `/food-menu/vegan`, `/blog/dog-friendly-walks-near-heathrow`, `/blog/support-your-local-pub-stanwell-moor`, and 7 private-hire sub-pages (milestone-birthdays, wakes, retirement-parties, christenings, gender-reveal, baby-showers, engagement-parties). | `components/hero/HeroSectionServer.tsx:141-143` |
| P2.3 | **AggregateRating emitted sitewide on LocalBusiness** | Global schema includes `aggregateRating` on `["Restaurant", "BarOrPub"]` entity, rendered on all 211 crawled pages. Self-serving LocalBusiness ratings won't produce Google review rich results. Google explicitly warns against this. | `lib/schema-with-reviews.ts:42-75` |
| P2.4 | **Internal blog link points to 404** | Leaving-party article links to `/best-beer-gardens-near-heathrow` (404). The real path is `/blog/best-beer-gardens-near-heathrow`. No redirect exists. | `content/blog/leaving-party-ideas/index.md:148` |
| P2.5 | **Page OG overrides drop og:image** | Pages defining `openGraph` without `images` render with no `og:image`. Crawl confirmed on `/about`, `/food-menu/vegetarian`, `/privacy-policy`, `/sustainability`. | `app/about/page.tsx:25-33` and others |
| P2.6 | **Navigation preloads competing logo images** | Both desktop and mobile logo `<Image>` use `priority`, so every page preloads 2 logo images in addition to the hero. Three `priority` images compete for LCP preload slots. | `components/layout/Navigation.tsx:633-643` |
| P2.7 | **Markdown-injected blog images lack dimensions** | `addImagesToContent` inserts raw `<img>` tags without `width` and `height`. Crawl found dimensionless images on 23 blog pages, weakening CLS guarantees. | `lib/markdown.ts:261-269` |
| P2.8 | **Noindex blog posts leak into tag archives** | `getPostsByTag` uses `getAllBlogPosts` without filtering `post.noindex`, so stale/noindex posts appear on indexable tag pages. One noindex post with empty title produced empty image alt text on `/blog/tag/events` and `/blog/tag/news`. | `lib/markdown.ts:287-290` |
| P2.9 | **Duplicate viewport meta rendered globally** | Root layout manually emits a `<meta name="viewport">` tag, and Next.js also emits one. Every rendered page has two identical viewport tags. | `app/layout.tsx:174-176` |

### P3 — Medium

| # | Issue | Detail | File(s) |
|---|-------|--------|---------|
| P3.1 | **Dynamic canonical uses relative './'** | Blueprint warns against `'./'` canonicals — fragile across metadata merging. Should generate absolute canonical from slug. | `app/private-hire/near/[slug]/page.tsx:44-46` |
| P3.2 | **WebPage/page-type schema coverage is inconsistent** | `/about` has `AboutPage` schema and blog posts emit `BlogPosting`, but most page templates lack a WebPage subtype. Key templates (events listing, menu, contact/find-us, FAQ-heavy pages) should be audited and standardised. | Multiple pages |
| P3.3 | **Schema entity fragmentation** | Hotel pages redeclare pub as page-specific `@id` (e.g. `/pub-near-holiday-inn-heathrow#business`) instead of referencing global `https://www.the-anchor.pub/#business`. Event location inlines Place instead of `@id` ref. `findUsPlaceSchema` creates standalone Restaurant without `@id`. `drinksMenuSchema` uses invalid `unitCode: "175ml glass"`. | `app/pub-near-holiday-inn-heathrow/page.tsx:33-56`, `lib/enhanced-schemas.ts`, `lib/structured-data/event-schema.ts` |
| P3.4 | **Heathrow cluster cannibalisation risk** | 5+ pages target "pub/restaurant near Heathrow" variants: `heathrow-hotels-pub`, `restaurants-near-heathrow`, `heathrow-layover-dining`, `heathrow-family-dining`, plus `pub-near-*` hotel pages. Review GSC data for query overlap. | Multiple pages |
| P3.5 | **Sitemap lastModified is static for many routes** | Many unrelated static routes share the same `2026-04-21` lastModified date. Weakens sitemap freshness signals. | `app/sitemap.ts:191-196` |
| P3.6 | **Custom 404 page too sparse** | Only links to homepage and find-us. Blueprint asks for links to key pages: menu, booking, events. | `app/not-found.tsx:16-28` |
| P3.7 | **3 redirect chains** | Old post URLs → noindexed blog URLs → `/live-sport`. Should go directly to final destination. | `config/redirects/blog-redirects.json:288-289` |

### P4 — Low (clean up)

| # | Issue | Detail | File(s) |
|---|-------|--------|---------|
| P4.1 | **Sitemap includes changeFrequency and priority** | Google ignores both fields. Remove to reduce noise. | `app/sitemap.ts` |
| P4.2 | **Redirected/exempt route files lack explicit canonicals** | `drinks/[slug]`, `whats-on/drag-shows`, `free-parking` are redirect or exempt routes in the rendered crawl, not indexable pages. They lack `alternates.canonical` but this is cosmetic since they don't render as indexable pages. | Those page files |
| P4.3 | **trailingSlash not explicit** | Middleware strips trailing slashes but `next.config.js` doesn't set `trailingSlash: false` explicitly. | `next.config.js` |
| P4.4 | **Poor image filenames** | `July 2025 Manager's Special (Instagram Post) (1).jpg` (spaces + parens), `Food.jpeg` (generic), `Heathrow.jpg` (used 11 times), `.DS_Store` in public. | `public/` |
| P4.5 | **11 pages missing explicit page-level OG metadata** | `accessibility`, `bank-holiday-weekends`, `bonfire-night`, `book-event`, `booking-confirmation`, `free-parking`, `leave-review`, `reviews`, `safety-and-respect`, `sitemap-page`, `[...unmatched]`. Most inherit root OG (including og:image) which is acceptable. Separate from P2.5, where pages that *partially* override OG lose the inherited image. | Those page files |

---

## Other Findings (not directly blueprint items)

| Issue | Detail |
|-------|--------|
| **Meta descriptions materially outside audit band** | 53 of 211 pages have descriptions outside broad thresholds (<120 or >170 chars): 13 short, 40 long. Not all would fail a strict 150–160 check — this is a directional signal, not a precise count. |
| **Live apex redirect is 307, not 301** | `http://the-anchor.pub/` takes two hops: HTTP apex → HTTPS apex (307) → HTTPS www. Blueprint requires 301. Likely a Cloudflare/Vercel config issue. |
| **AI crawler blocks undocumented** | Production robots.txt (Cloudflare-managed) blocks GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, Bytespider, CCBot. Not in codebase `robots.ts`. No documented policy on whether this is intentional. |
| **llms.txt is static** | `public/llms.txt` exists but contains hardcoded hours/menu/event data that can drift from live business data. No `llms-full.txt`. |
| **3 broken internal link targets** | `/api/calendar/event/the-anchor-showcase` (fake fallback event), `/best-beer-gardens-near-heathrow` (wrong path), `/private-hire/near` (auto-breadcrumb 404) |
| **44 tests failing** | 15 test suites failing. Some are stale UI assertions; booking/API tests returning 500/503 instead of expected validation responses are application-health issues. |
| **Lint fails** | `scripts/audit-hero.js` reports hero/H1/default-image issues after ESLint passes |

---

## Layer-by-Layer Verdicts

### Layer 1: Technical Foundation

| # | Item | Verdict | Notes |
|---|------|---------|-------|
| 1.1 | Canonical domain redirect | PARTIAL | Middleware does 301, but **live apex → www hop is 307** not 301 |
| 1.2 | HTTPS enforcement | PASS | Middleware + HSTS + Cloudflare/Vercel |
| 1.3 | metadataBase in root layout | PASS | Correct, no canonical in root layout |
| 1.4 | Per-page canonical URLs | PARTIAL | Most use absolute paths. 1 uses `'./'` (private-hire/near/[slug]). Redirected/exempt routes lack canonicals but are not indexable. |
| 1.5 | Dynamic XML sitemap | FAIL | **11 indexable pages missing.** Also includes changeFrequency/priority and static lastModified |
| 1.6 | Robots.txt | FAIL | **Blocks `/_next/static/media/` — render-critical fonts** |
| 1.7 | Page-level index control | PARTIAL | Correct noindex usage, but **noindex posts leak into tag archives** |
| 1.8 | Renderability | FAIL | Blocked by robots issue (1.6) |
| 1.9 | Clean URL pagination | PASS | Strips `?page=1` with 301 |
| 1.10 | Security headers | PASS | Comprehensive headers in middleware + config |
| 1.11 | Trailing slash consistency | PARTIAL | Works via middleware, not explicit in config |
| 1.12 | Custom 404 page | PARTIAL | Exists, minimal navigation |
| 1.13 | Redirect management | PARTIAL | 645 redirects, **3 chains**, no tracking doc |

### Layer 2: On-Page SEO

| # | Item | Verdict | Notes |
|---|------|---------|-------|
| 2.1 | Title template | PASS | Short suffix, good default |
| 2.2 | Unique title per page | FAIL | **206/211 pages over 65 chars due to double-branding** |
| 2.3 | Meta description per page | PARTIAL | All pages have descriptions, but **53 outside 150–160 char target** |
| 2.4 | Intent-matched content | PASS | Substantial, relevant content on all pages |
| 2.5 | Heading structure | FAIL | **15 crawl-confirmed pages with dual H1** (includes 2 blog posts) |
| 2.6 | Open Graph metadata | FAIL | **OG overrides confirmed to drop og:image** on 4 pages (crawl-verified). 11 additional pages lack explicit page-level OG but inherit root OG acceptably. |
| 2.7 | Internal linking | PARTIAL | Strong contextual linking, **but 3 confirmed broken internal links** |
| 2.8 | Breadcrumbs | FAIL | **Inconsistent coverage + broken parent URLs + auto-breadcrumbs create 404s** |

### Layer 3: URL & Keyword Map

| # | Item | Verdict | Notes |
|---|------|---------|-------|
| 3.1 | One intent per URL | PARTIAL | Heathrow cluster cannibalisation risk |
| 3.2 | Keyword-to-URL mapping | PASS | Documentation exists |
| 3.3 | Intent grouping for location pages | PASS | Location pages target distinct geo + intent combos with unique local content |
| 3.4 | Doorway page prevention | PASS | Location pages have genuinely unique content |
| 3.5 | Cannibalisation audit | NOT DONE | Requires GSC Performance data — check for queries where multiple site pages appear |

### Layer 4: Structured Data Governance

| # | Item | Verdict | Notes |
|---|------|---------|-------|
| 4.1 | Stable @id references | PARTIAL | Global entities good, but **hotel pages fragment with page-specific @id** |
| 4.2 | Most specific subtype | PASS | `["Restaurant", "BarOrPub"]` |
| 4.3 | WebPage type schema | PARTIAL | `/about` has `AboutPage`, blog posts emit `BlogPosting`, but **most templates lack a WebPage subtype** — coverage is inconsistent |
| 4.4 | BreadcrumbList coverage | PARTIAL | Production crawl found `missingBreadcrumbJsonLd: 0`. **The real breadcrumb issue is broken `/private-hire/near` parent URL** (P1.3), not missing schema. Earlier "33/117" figure is stale/unverified. |
| 4.5 | Menu schema | PASS | Dynamic Menu → MenuSection → MenuItem → Offer |
| 4.6 | Event schema | PARTIAL | Comprehensive, but **fallback event emits schema for non-existent event** |
| 4.7 | FAQ schema | PASS | Matches visible accordion content |
| 4.8 | Review schema caution | FAIL | **Self-serving AggregateRating on all 211 pages** |
| 4.9 | Schema validation | PARTIAL | Entity fragmentation, invalid unitCode |

### Layer 5: Image SEO

| # | Item | Verdict | Notes |
|---|------|---------|-------|
| 5.1 | Descriptive filenames | PARTIAL | Mostly good, several poor names + `.DS_Store` |
| 5.2 | Meaningful alt text | PARTIAL | Good on component images, **but noindex post leaks empty alt on tag pages** |
| 5.3 | Explicit dimensions | FAIL | Component images sized correctly, **but 23 blog pages have dimensionless markdown images** |
| 5.4 | Correct sizes attribute | PASS | Responsive breakpoints on component images |
| 5.5 | LCP hero handling | PARTIAL | Hero has priority, **but 2 logo images also have priority — 3 competing** |
| 5.6 | Consistent crawlable image URLs | PASS | No query-string cache busters found; content-hashed filenames via Next.js |
| 5.7 | OG image aspect ratios | PASS | Consistent 1200x630 |
| 5.8 | Image sitemap | N/A | Not implemented. Optional — could help with food/venue photography discovery. |

### Layer 6: Performance & Core Web Vitals

| # | Item | Verdict | Notes |
|---|------|---------|-------|
| 6.1 | LCP ≤ 2.5s | PARTIAL | Font preload + hero priority good, **but 3 competing priority images**. CrUX field data not verified (PageSpeed quota exceeded). |
| 6.2 | INP ≤ 200ms | NOT VERIFIED | CrUX field data unavailable (PageSpeed quota exceeded). No obvious main-thread blocking found in code review. |
| 6.3 | CLS prevention | PARTIAL | Blur placeholders + skeletons good, **but 23 dimensionless blog images** |
| 6.4 | Static generation | PASS | No force-dynamic, ISR on homepage, SSG on marketing pages |
| 6.5 | Font optimisation | PASS | next/font, display: swap, latin subset, 2 families |
| 6.6 | Static asset caching | PASS | Immutable headers on all static paths |
| 6.7 | Non-blocking scripts | PASS | GTM afterInteractive, dynamic imports for non-critical |
| — | Duplicate viewport meta | FAIL | **Two identical viewport tags rendered sitewide** |

### Layers 7–10: Manual Review Required

#### Layer 7: Local SEO Operations
- [ ] GBP claimed and fully populated
- [ ] GBP categories correct
- [ ] GBP hours synced with website
- [ ] GBP special hours for bank holidays
- [ ] GBP photos current
- [ ] GBP Posts being used
- [ ] GBP Q&A monitored
- [ ] Review management
- [ ] NAP consistency across directories
- [ ] Local citations
- [ ] Local backlinks
- [ ] UTM tagging on GBP link

#### Layer 8: Content Lifecycle
- [ ] Expired events handled
- [ ] Seasonal pages using permanent URLs
- [ ] No stale offers or pricing
- [ ] Blog refresh/prune — audit blog posts for stale/thin content, update or noindex
- [ ] Opening hours accurate everywhere

#### Layer 9: Measurement & Governance
- [ ] GSC verified and coverage reviewed
- [ ] Bing Webmaster Tools
- [ ] GA4 conversion tracking
- [ ] GBP UTM tagging — distinguish GBP traffic from organic in GA4
- [ ] Monthly KPI review process
- [ ] Crawl and indexation checks — separate from GSC coverage; check "Discovered but not indexed" specifically
- [ ] Schema validation schedule
- [ ] Broken link checking
- [ ] CWV monitoring
- [ ] SEO change log

#### Layer 10: AI & Future Search
- [ ] AI crawler policy decided and documented (currently blocked by Cloudflare but not documented in codebase)
- [ ] Content structured for AEO
- [ ] Conversational content — natural-language Q&A patterns that match voice/AI search queries
- [ ] Structured data as AI signal — comprehensive schema helps AI engines understand entity relationships
- [ ] llms.txt kept in sync with live data (currently static)
- [ ] Multi-platform visibility

---

## Scoring Summary (code/render-verifiable subset)

This table covers the items verifiable through code analysis and production crawl. The full blueprint has ~80 checklist items; Layers 7–10 require account access and manual verification.

| Layer | Name | Pass | Partial | Fail | Not verified / N/A | Total |
|-------|------|------|---------|------|--------------------|-------|
| 1 | Technical Foundation | 4 | 6 | 3 | 0 | 13 |
| 2 | On-Page SEO | 2 | 2 | 4 | 0 | 8 |
| 3 | URL & Keyword Map | 3 | 1 | 0 | 1 | 5 |
| 4 | Structured Data | 3 | 5 | 1 | 0 | 9 |
| 5 | Image SEO | 3 | 3 | 1 | 1 | 8 |
| 6 | Performance & CWV | 4 | 2 | 1 | 1 | 8 |
| **Total** | | **19** | **19** | **10** | **3** | **51** |

---

## Remediation Plan

### Immediate (P1 — do now)
1. Add 11 missing pages to sitemap `staticRoutes` array (`/pub-garden-heathrow` excluded — redirects to `/beer-garden`)
2. Remove `/_next/static/media/` disallow from `robots.ts`
3. Add breadcrumb override for `/private-hire/near/*` route family (or create a landing page)
4. Fix event fallback to not emit a fake event with broken calendar links

### This week (P2)
5. Remove "| The Anchor" from individual page titles (template adds brand) — fixes 206 pages
6. Fix dual H1 on 15 pages: change `PageTitle as="h1"` to `as="h2"` on component pages, fix blog post H1 duplication on 2 blog pages
7. Remove `aggregateRating` from LocalBusiness schema
8. Fix blog link: `/best-beer-gardens-near-heathrow` → `/blog/best-beer-gardens-near-heathrow`
9. Add explicit `images` to OG overrides on `/about`, `/food-menu/vegetarian`, `/privacy-policy`, `/sustainability`
10. Remove `priority` from logo images in Navigation
11. Add `width`/`height` to markdown-injected blog images in `addImagesToContent`
12. Filter `post.noindex` in `getPostsByTag`
13. Remove duplicate viewport meta tag from root layout

### Next sprint (P3)
14. Generate absolute canonical path in `private-hire/near/[slug]`
15. Audit and standardise WebPage-typed schema across key templates (P3.2)
16. Consolidate schema entity references to use global `#business` @id (P3.3)
17. Review Heathrow cluster in GSC for query cannibalisation
18. Make sitemap lastModified dates per-page rather than one static date
19. Enrich 404 page with menu/booking/events links
20. Collapse 3 redirect chains to point directly to final destinations
21. Tighten meta descriptions materially outside audit band (53 flagged)

### Backlog (P4)
22. Remove changeFrequency/priority from sitemap
23. Add trailingSlash: false to next.config
24. Rename poor image files, remove `.DS_Store` from public
25. Investigate live 307 vs 301 on apex redirect (Cloudflare/Vercel config)
26. Document AI crawler policy (GPTBot, ClaudeBot etc. blocked by Cloudflare)
27. Make llms.txt dynamic or add sync process
28. Fix failing tests (44 failures across 15 suites)
29. Run cannibalisation audit in GSC Performance report
30. Verify CWV field data (LCP, INP, CLS) when PageSpeed quota available
