# SEO Blueprint for Pub/Hospitality Websites (Next.js)

A reusable, layered checklist for setting up and auditing SEO on a pub or hospitality website built with Next.js App Router. Each item is a verifiable requirement with implementation guidance and an authoritative source.

This blueprint is stack-specific (Next.js) but business-generic — it can be applied to any pub, bar, or restaurant site.

---

## How to use this document

1. **New site setup** — work through layers 1–10 in order. Layers 1–2 are prerequisites; later layers build on them.
2. **Existing site audit** — run through each checklist item and mark pass/fail. The items that fail form your remediation backlog.
3. **Ongoing governance** — layers 8–10 are operational, not one-off. Review them monthly.

Each item follows this format:

```
- [ ] **Requirement**
  Detail: implementation guidance
  Source: authoritative reference
```

---

## Layer 1: Technical Foundation

Crawlability, indexability, and site architecture. Nothing else matters if search engines can't find and render your pages.

- [ ] **Canonical domain with www/non-www redirect**
  Detail: Middleware issues a 301 redirect from the non-canonical origin (e.g. `the-anchor.pub` → `www.the-anchor.pub`). Pick one and enforce it everywhere — website, GBP, citations, social profiles.
  Source: [Google — Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

- [ ] **HTTPS enforcement**
  Detail: Middleware issues a 301 redirect from HTTP to HTTPS. If using Cloudflare, TLS mode must be "Full" or "Full (strict)" — "Flexible" causes redirect loops.

- [ ] **metadataBase in root layout**
  Detail: Set `metadataBase: new URL('https://www.example.pub')` in the root `layout.tsx`. This resolves all relative Open Graph image URLs. Do NOT set `alternates.canonical` in the root layout — doing so makes every page claim to be the homepage.

- [ ] **Explicit per-page canonical URLs**
  Detail: Every indexable `page.tsx` exports `alternates: { canonical: '/explicit-path' }` using the full route path. Do not use `'./'` — in Next.js this resolves against `metadataBase`, not the current route, and can canonicalise pages to the homepage. For sites with many pages, create a shared canonical helper that derives the path from the route segment.
  Source: [Next.js — generateMetadata](https://nextjs.org/docs/14/app/api-reference/functions/generate-metadata)

- [ ] **Dynamic XML sitemap**
  Detail: `app/sitemap.ts` generates absolute canonical URLs for all indexable pages. Include accurate `lastModified` dates. Filter out noindex pages, redirect sources, and stale content (e.g. past events beyond a staleness threshold). Do not rely on `priority` or `changeFrequency` — Google ignores both fields.
  Source: [Google — Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

- [ ] **Robots.txt controls crawling only**
  Detail: `app/robots.ts` allows `/` and blocks paths that waste crawl budget (`/api/`, `/_next/data/`, utility pages). Include the sitemap URL. Understand that `robots.txt` prevents crawling but cannot deindex pages — Googlebot must be able to crawl a page to see a noindex directive on it.

- [ ] **Page-level index control**
  Detail: For pages that should not appear in search results, use per-page `robots` metadata or `X-Robots-Tag` response headers. Default to `noindex, follow` — this prevents indexing while still allowing Googlebot to discover links on the page. Only use `noindex, nofollow` when you deliberately do not want link discovery from that page. Do not block these pages in `robots.txt` — Googlebot needs to crawl them to see the noindex directive. Verify with GSC URL Inspection.
  Source: [Google — Robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)

- [ ] **Renderability**
  Detail: Do not block render-critical JavaScript, CSS, images, or fonts via `robots.txt` or other means. Google renders pages in a second pass after initial crawl; blocked resources can degrade indexing quality. Specifically ensure `/_next/static/` is allowed. Verify rendered output with GSC URL Inspection → "View Rendered Page".
  Source: [Google — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

- [ ] **Clean URL pagination**
  Detail: If using `?page=` query parameters, middleware strips `?page=1` to the canonical (unpaginated) URL via 301.

- [ ] **Security headers**
  Detail: Set `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` via middleware. Security headers are a trust and safety baseline — they protect against clickjacking and MIME-sniffing.

- [ ] **Trailing slash consistency**
  Detail: Pick one pattern (no trailing slash is the Next.js default) and enforce via `trailingSlash` in `next.config`. Mixed patterns create duplicate URL issues.

- [ ] **Custom 404 page**
  Detail: `app/not-found.tsx` with helpful navigation back to key pages (homepage, menu, booking, events). A good 404 retains users who hit dead links.

- [ ] **Redirect management**
  Detail: Centralise redirects in `next.config.ts` `redirects()` for moved/renamed URLs. Use 301 for permanent moves. Audit regularly for redirect chains (A → B → C should be A → C). Log redirects in a tracking document.

---

## Layer 2: On-Page SEO

Metadata, headings, and content structure that help search engines understand each page's purpose.

- [ ] **Title template**
  Detail: Root layout sets `title: { template: '%s | Brand Location', default: 'Brand — Tagline' }` for consistent SERP branding. Keep the brand suffix short to leave room for the page-specific keyword.

- [ ] **Unique title per page**
  Detail: Every `page.tsx` exports a specific, keyword-targeted title. Aim for under 60 characters as a guideline to reduce truncation risk, but note that Google truncates by pixel width and device, and may rewrite title links entirely. Focus on clarity and intent over hitting an exact character count.
  Source: [Google — Title links](https://developers.google.com/search/docs/appearance/title-link)

- [ ] **Meta description per page**
  Detail: Unique, compelling, roughly 150–160 characters as a guideline. Include a call to action where appropriate ("Book your table", "See this week's events"). Descriptions don't directly affect ranking but influence click-through rate. Google may rewrite snippets regardless of what you provide, but a well-written description increases the chance Google uses yours.
  Source: [Google — Snippets](https://developers.google.com/search/docs/appearance/snippet)

- [ ] **Clear, intent-matched main content**
  Detail: Each page has crawlable content that clearly addresses its primary search intent. The page should answer the query a user would type to find it. Use a single H1 as an accessibility and content-structure best practice.

- [ ] **Logical heading structure**
  Detail: Use H1 → H2 → H3 for content organisation and accessibility. Skipped heading levels are a content-structure concern rather than an SEO penalty, but a clean hierarchy helps screen readers and signals content depth to search engines.

- [ ] **Open Graph metadata**
  Detail: Per-page `openGraph` with title, description, image (1200×630 with correct aspect ratio), and type. Use a shared helper for Twitter/X card metadata to avoid repetition. OG images should be visually relevant to the page content.

- [ ] **Internal linking**
  Detail: Contextual links between related pages using `next/link`. Anchor text should describe the destination ("See our Sunday lunch menu") not be generic ("click here"). Every important page should be reachable within 3 clicks from the homepage.

- [ ] **Breadcrumbs**
  Detail: Visible breadcrumb navigation on all pages below the homepage, matching the URL hierarchy. Breadcrumbs improve both UX and search appearance (Google can display breadcrumb trails in SERPs).

---

## Layer 3: URL & Keyword Map

Ensures every indexable URL has a clear purpose and no two pages cannibalise each other.

- [ ] **One primary search intent per indexable URL**
  Detail: No two pages should target the same keyword cluster. If two pages compete for the same query, consolidate or differentiate them. Document the primary keyword for each URL.

- [ ] **Keyword-to-URL mapping document**
  Detail: Maintain a spreadsheet or structured document mapping each indexable page to: canonical path, primary keyword/intent, title, H1, schema type, sitemap inclusion status, and noindex/redirect status. This is the single source of truth for content planning.

- [ ] **Intent grouping for location pages**
  Detail: For pubs targeting geo-modified queries ("pub near Heathrow", "restaurant near Staines", "private dining near me"), each page should target a distinct location + intent combination. Avoid creating thin pages that differ only by location name with no unique content.

- [ ] **Doorway page prevention**
  Detail: Location pages must have unique, useful local content and must not be near-duplicate pages created only to rank for similar geo queries. Each page should offer genuine value beyond keyword substitution — e.g. specific directions, local context, or content relevant to that location's audience. Pages that exist solely to funnel users to the same destination violate Google's spam policies.
  Source: [Google — Spam policies](https://developers.google.com/search/docs/essentials/spam-policies)

- [ ] **Cannibalisation audit**
  Detail: Periodically check GSC Performance report for queries where multiple pages from your site appear. If two pages split clicks for the same query, decide which is the canonical target and redirect, noindex, or differentiate the other.

---

## Layer 4: Structured Data Governance

Schema markup that helps search engines understand your business entity, content, and offerings.

- [ ] **Stable `@id` references across global and page-level JSON-LD**
  Detail: Define global entities (`WebSite`, `Organization`, and the primary `Restaurant` or `BarOrPub`) in the root layout with stable `@id` URIs (e.g. `https://www.example.pub/#restaurant`). Page-specific schema (`BreadcrumbList`, `Menu`, `Event`, `FAQPage`, `WebPage` types) should be emitted per page or per template — a root layout cannot know every page's specific entities. Page-level schema references global entities via `@id` rather than redeclaring them. Both global and page-level graphs should use consistent, stable `@id` patterns.

- [ ] **Most specific LocalBusiness subtype**
  Detail: Use `Restaurant`, `BarOrPub`, or both via `@type: ["Restaurant", "BarOrPub"]` rather than generic `LocalBusiness`. Google recommends the most specific applicable type.
  Source: [Google — LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)

- [ ] **WebPage and page type schema**
  Detail: Use the appropriate `WebPage` subtype for each page: `AboutPage`, `ContactPage`, `CollectionPage`, `FAQPage`, or `BlogPosting` where applicable. Connect page entities to the global business entity using `isPartOf`, `about`, or `mainEntity` as appropriate. This helps search engines understand both what each page is and how it relates to the business.

- [ ] **BreadcrumbList on all sub-pages**
  Detail: JSON-LD `BreadcrumbList` matching the visible breadcrumb UI and referencing each page's canonical URL. Every page below the homepage should have this. Emitted per page, not from the root layout.

- [ ] **Menu schema**
  Detail: `Menu` → `MenuSection` → `MenuItem` with `Offer` for prices and currency. Keep schema in sync with the actual menu content displayed on the page. If menus are API-driven, generate schema from the same data source.
  Source: [Schema.org — Menu](https://schema.org/Menu)

- [ ] **Event schema**
  Detail: `Event` for individual events; `EventSeries` for recurring nights (quiz night, karaoke, open mic). Include `startDate`, `location` referencing the venue `@id`, `eventStatus`, `eventAttendanceMode`, and `offers` if ticketed. Keep schema truthful: update `eventStatus` to `EventCancelled` or `EventRescheduled` for cancelled or rescheduled events rather than removing schema entirely. Past and cancelled pages may still need truthful schema while they remain crawlable.
  Source: [Google — Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)

- [ ] **FAQ schema — limited visibility, visible content only**
  Detail: `FAQPage` schema must correspond to Q&A content that is actually visible on the page. Do not generate FAQ schema for content that isn't displayed as questions and answers. Note that Google does not guarantee FAQ rich results, and eligibility is narrower than it used to be. FAQ schema is still useful for content structure and AI discoverability, but do not build a strategy around FAQ rich result snippets.
  Source: [Google — FAQ structured data](https://developers.google.com/search/docs/appearance/structured-data/faqpage)

- [ ] **Review schema caution**
  Detail: Self-serving `AggregateRating` on `LocalBusiness`, `Organization`, or `Restaurant` types will not produce review rich results in Google Search. This includes third-party review widgets embedded on your own site. Third-party platforms (Google Reviews, TripAdvisor) are the reliable path to visible review proof in local and search surfaces. Use visible testimonials for user trust, but do not expect star snippets from your own markup.
  Source: [Google — Making review rich results more helpful](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful)

- [ ] **Schema validation**
  Detail: Test all key page templates with [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/). Require zero errors. Warnings should be reviewed and either fixed or documented as intentionally omitted optional fields — they often indicate recommended but non-required properties. Revalidate after any template or significant content changes.

---

## Layer 5: Image SEO

Images are a significant discovery, conversion, and page-experience asset for hospitality businesses — food photography, venue shots, and event images drive user engagement and appear in Google Images, Maps, and AI surfaces.

- [ ] **Descriptive filenames**
  Detail: `sunday-roast-the-anchor.jpg` not `IMG_4532.jpg`. Filenames are a relevance signal for Google Images. Use lowercase, hyphens, and include the subject and optionally the brand.

- [ ] **Meaningful alt text**
  Detail: Describes the image content with keyword relevance where natural. "Roast beef Sunday lunch with Yorkshire pudding at The Anchor" not "food image" or "photo1".

- [ ] **Explicit dimensions**
  Detail: Every `next/image` component has `width` and `height` props (or uses `fill` with a sized parent container). This prevents Cumulative Layout Shift.

- [ ] **Correct `sizes` attribute**
  Detail: Responsive images serve appropriate file sizes per viewport. Without `sizes`, the browser may download oversized images on mobile, hurting performance.

- [ ] **LCP hero handling**
  Detail: Above-the-fold hero images must be preloaded to avoid LCP penalties. The implementation varies by Next.js version: in Next.js 14/15, use the `priority` prop on `next/image`. In Next.js 16+, `priority` is deprecated — use `preload`, `loading="eager"`, or `fetchPriority="high"` as appropriate.
  Source: [Next.js — Image component](https://nextjs.org/docs/app/api-reference/components/image)

- [ ] **Consistent crawlable image URLs**
  Detail: Avoid query-string cache busters (e.g. `?v=123`) that create duplicate image URLs for Googlebot. Use content-based hashes in filenames instead.

- [ ] **OG/schema image aspect ratios**
  Detail: Open Graph images at 1200×630 (1.91:1 ratio). Schema `image` properties should use high-quality, relevant photographs at appropriate dimensions.

- [ ] **Optional: image sitemap**
  Detail: For sites with significant image content (food photography galleries, venue tours), an image sitemap helps Google discover images that may not be found through normal crawling.
  Source: [Google — Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)

---

## Layer 6: Performance & Core Web Vitals

Google uses Core Web Vitals as a ranking signal. Hospitality sites with heavy imagery need particular attention here.

- [ ] **LCP ≤ 2.5 seconds at 75th percentile (field data)**
  Detail: Preload hero images (see Layer 5 for version-specific guidance). Inline critical CSS. Preload fonts with `display: swap`. Use SSG/ISR for static content. Avoid large unoptimised images above the fold.

- [ ] **INP ≤ 200 milliseconds at 75th percentile**
  Detail: Minimise main-thread blocking. Defer non-critical JavaScript. Avoid long hydration tasks in client components. Keep interactive elements responsive.

- [ ] **CLS ≤ 0.1 at 75th percentile**
  Detail: Explicit image/video dimensions. Reserve space for dynamic content (booking widgets, map embeds). Avoid layout-shifting font loading or late-injecting elements.
  Source: [web.dev — Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)

- [ ] **Static generation where possible**
  Detail: Pub pages with infrequent changes (about, menu, private hire) should use SSG with ISR, not SSR on every request. Dynamic pages (availability, events) can use SSR or client-side fetching as appropriate.

- [ ] **Font optimisation**
  Detail: Use `next/font` with `display: swap` and subset to Latin characters. Limit to 2 font families maximum to reduce download size.

- [ ] **Static asset caching**
  Detail: `Cache-Control: max-age=31536000, immutable` for `/_next/static/`, images, and fonts. Set via middleware or `next.config` headers.

- [ ] **Non-blocking third-party scripts**
  Detail: GTM, analytics, chat widgets, and social embeds loaded via `next/script` with `strategy="afterInteractive"` or `"lazyOnload"`. Never render-block on third-party resources.

---

## Layer 7: Local SEO Operations

For pubs and restaurants, local SEO is often the highest-impact channel. Most searches are non-branded and location-modified. Google says local ranking depends primarily on relevance, distance, and prominence.

- [ ] **Google Business Profile — claimed and verified**
  Detail: Fully populated with: business name, address, phone, website URL, hours, special hours for bank holidays/closures, booking link, menu link, and all relevant attributes (outdoor seating, family-friendly, wheelchair accessible, Wi-Fi, etc.).

- [ ] **GBP categories**
  Detail: Primary category set to the most specific match (e.g. "Pub" or "Restaurant"). Add relevant secondary categories (e.g. "Event venue", "Bar"). Categories directly affect which searches your listing appears in.

- [ ] **GBP hours and special hours**
  Detail: Regular hours synced with the website. Special hours set for every bank holiday, seasonal closure, or one-off change. Discrepancies between GBP and website hours damage trust and ranking.

- [ ] **GBP photos and videos**
  Detail: Regularly updated with high-quality venue, food, drink, and event imagery. Photos improve profile completeness, engagement, and conversion. Include interior, exterior, menu items, and team shots.

- [ ] **GBP Posts**
  Detail: Short content updates about events, offers, and seasonal menus. Posts improve profile completeness, engagement, and conversion. Most pubs underutilise this — it's a competitive advantage for visibility.

- [ ] **GBP Q&A**
  Detail: Monitor and answer questions from the public. Proactively seed with common questions and clear answers (parking, dog-friendly, dress code, booking policy).

- [ ] **Review management**
  Detail: Reply to all reviews — positive and negative — promptly and professionally. Do not incentivise reviews in ways that violate Google policy. Focus on generating genuine reviews through great service.

- [ ] **NAP consistency**
  Detail: Name, address, and phone number must be identical across the website, GBP, all directories, and social profiles. Inconsistency confuses search engines and erodes local ranking signals.

- [ ] **Local citations**
  Detail: Listed on relevant directories — Yell, TripAdvisor, Facebook, Yelp, DesignMyNight, Foursquare, and any industry-specific platforms. Ensure NAP matches everywhere.

- [ ] **Local backlinks**
  Detail: Pursue links from hotel partner pages, airport/travel guides, local community sites, event listing platforms, tourism boards, and local press. These are high-value local ranking signals.

- [ ] **UTM tagging on GBP links**
  Detail: Tag the website URL in GBP with UTM parameters (e.g. `?utm_source=google&utm_medium=gbp`) to distinguish GBP-driven traffic from organic search in GA4.
  Source: [Google — Improve local ranking](https://support.google.com/business/answer/7091)

---

## Layer 8: Content Lifecycle

Hospitality content decays fast. Menus change, events pass, offers expire. Stale content erodes trust with both users and search engines.

- [ ] **Expired events**
  Detail: Remove past events from the sitemap after a staleness threshold (e.g. 30 days). For one-off events, either noindex, redirect to the parent events page, or retain the page if it has accumulated SEO value and will recur. For recurring events (weekly quiz night), keep the page and update the next occurrence date. Keep schema truthful on crawlable pages (see Layer 4: Event schema).

- [ ] **Seasonal/annual pages**
  Detail: If a page recurs annually (Christmas menu, Valentine's dinner, New Year's Eve), keep the URL permanent (e.g. `/christmas-menu`, not `/christmas-menu-2026`) and update the content each year. This preserves link equity and avoids creating thin dated pages.

- [ ] **Stale offers and menus**
  Detail: Outdated pricing, discontinued menu items, or expired promotions must be updated or removed promptly. Stale content misleads users and search engines. If menus are API-driven, ensure the API data is current.

- [ ] **Blog refresh/prune**
  Detail: Audit blog posts annually. Update evergreen posts with current information and update `dateModified` to reflect the meaningful change. Only change the publication date when the post has been materially rewritten — Google explicitly warns against changing dates to make content appear fresh when it hasn't substantially changed. Noindex or redirect thin/outdated posts that attract no traffic and add no value. A small library of high-quality posts outperforms a large library of stale ones.
  Source: [Google — Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

- [ ] **Opening hours accuracy**
  Detail: Website hours must reflect reality at all times. Any change to opening hours must be updated simultaneously on the website, GBP, and all directories. Discrepancies damage local ranking and user trust.

---

## Layer 9: Measurement & Governance

SEO without measurement is guesswork. These tools and processes make performance visible and regressions catchable.

- [ ] **Google Search Console**
  Detail: Property verified (domain-level preferred). Sitemap submitted. Coverage report reviewed monthly for excluded pages, crawl anomalies, and indexing issues. Monitor for manual actions.

- [ ] **Bing Webmaster Tools**
  Detail: Property verified, sitemap submitted. Bing represents a non-trivial share of desktop search. Setup is minimal.

- [ ] **GA4 with conversion tracking**
  Detail: Key events tracked as conversions: booking started, booking completed, phone number click, email click, direction/map click, menu download. Attribute conversions to traffic sources.

- [ ] **GBP UTM tagging**
  Detail: Distinguish GBP-driven traffic from organic in GA4 using UTM parameters on the GBP website link.

- [ ] **Monthly KPI review**
  Detail: Review at minimum: impressions, clicks, CTR, average position by query and page (GSC); organic sessions, conversions, bounce rate (GA4); GBP views, actions, direction requests, phone calls.

- [ ] **Crawl and indexation checks**
  Detail: Monthly review of GSC Coverage report. Watch for: pages excluded by noindex that should be indexed, pages excluded by crawl anomaly, and "Discovered but not indexed" — which may indicate quality or crawl budget issues.

- [ ] **Schema validation schedule**
  Detail: Test key page templates quarterly with Rich Results Test, and immediately after any template or significant content change. Zero errors; warnings reviewed and either fixed or documented.

- [ ] **Broken link checks**
  Detail: Run automated or periodic scans (e.g. Screaming Frog, Ahrefs, or a CI-integrated link checker) for internal 404s and broken outbound links. Fix or redirect promptly.

- [ ] **Core Web Vitals monitoring**
  Detail: Track field data via CrUX dashboard or PageSpeed Insights. Set up alerts (e.g. via Vercel Analytics or a monitoring tool) for regressions in LCP, INP, or CLS.

- [ ] **SEO change log / release annotations**
  Detail: Maintain a log of SEO-significant changes: title rewrites, redirect additions/changes, schema modifications, template changes, menu updates, and new page launches. When GSC data shifts weeks later, this log is invaluable for correlating cause and effect. Format: date, change description, affected URLs, and who made the change.

---

## Layer 10: AI & Future Search

Search is evolving beyond the traditional 10 blue links. AI-powered answers, voice search, and multi-platform discovery are reshaping how users find hospitality businesses.

- [ ] **Answer Engine Optimisation (AEO)**
  Detail: Structure content to directly answer common questions: hours, location, booking process, menu highlights, parking, accessibility. Use clear, concise copy that AI models can extract and cite. FAQ sections with visible Q&A format are particularly effective.

- [ ] **Conversational content**
  Detail: Write in natural language patterns that match voice and AI search queries: "Where can I eat near Heathrow?", "Is there a pub in Staines with a beer garden?", "Can I book a private room for 20 people?". These queries increasingly drive traffic via voice assistants and AI search.

- [ ] **Structured data as AI signal**
  Detail: Comprehensive, accurate schema markup helps AI search engines understand entity relationships (this business → this location → these offerings → these hours). Well-structured data increases the likelihood of being surfaced in AI-generated answers and knowledge panels.

- [ ] **AI crawler policy**
  Detail: Decide which AI and search crawlers are allowed to access your content and document the tradeoff. This is a business decision, not a universal "allow all" default. Some sites benefit from AI training exposure; others prefer to restrict it. Review `robots.txt` AI crawler rules quarterly as new crawlers emerge. Common AI crawlers to evaluate: GPTBot, Google-Extended, ClaudeBot, Bytespider, CCBot. Document your policy and rationale.

- [ ] **Multi-platform visibility**
  Detail: Diners and drinkers search on Google, Maps, TripAdvisor, Instagram, and AI chatbots. Ensure your business information is consistent and discoverable across all platforms where potential customers search.

---

## Sources

### Official Google Documentation
- [Google — Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google — Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google — Robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google — LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google — Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Google — FAQ structured data](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [Google — Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)
- [Google — Improve local ranking on Google](https://support.google.com/business/answer/7091)
- [Google — Title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google — Snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Google — Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google — Spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google — Making review rich results more helpful](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful)

### Next.js Documentation
- [Next.js — generateMetadata API](https://nextjs.org/docs/14/app/api-reference/functions/generate-metadata)
- [Next.js — Image component](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js — SEO module](https://nextjs.org/learn/seo)

### Schema.org
- [Schema.org — Restaurant](https://schema.org/Restaurant)
- [Schema.org — Menu](https://schema.org/Menu)
- [Schema.org — Event](https://schema.org/Event)

### Performance
- [web.dev — Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Vercel — Optimizing Core Web Vitals](https://vercel.com/kb/guide/optimizing-core-web-vitals-in-2024)

### Industry Guides
- [Restaurant SEO Checklist 2026 — The Digital Restaurant](https://thedigitalrestaurant.com/restaurant-seo-checklist/)
- [Local SEO for Restaurants 2026 — Malou](https://www.malou.io/en-us/blog/local-seo-for-restaurants)
- [Next.js SEO Complete Guide — Adeel Imran](https://adeelhere.com/blog/2025-12-09-complete-nextjs-seo-guide-from-zero-to-hero)
