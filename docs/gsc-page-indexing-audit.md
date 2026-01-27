# GSC Page Indexing Audit (CSV-Driven)

Source of truth: `temp/the_anchor_pub_indexing_errors.csv` (732 rows).

## Category Counts (descending)

- 273 `Crawled - currently not indexed`
- 168 `Page with redirect`
- 159 `Not found (404)`
- 74 `Blocked by robots.txt`
- 31 `Discovered – currently not indexed`
- 12 `Alternative page with proper canonical tag`
- 11 `Redirect error`
- 3 `Excluded by noindex tag`
- 1 `Duplicate, Google chose different canonical than user`

## High-Level Patterns (by priority)

### 1) Redirect error (11)

Dominant pattern: legacy tag URLs (e.g. `/blog/tag/premier-league`) redirect into **self-redirect loops** on canonical tag hubs (`/blog/tag/events`, `/blog/tag/sports`, `/blog/tag/community`, etc.).

Also present: apex host + trailing slash variants (e.g. `https://the-anchor.pub/drinks/`) creating multi-hop redirects.

### 2) Not found (404) (159)

Main patterns:

- Legacy blog hashtag URLs: `/blog/hashtags/*` (Wix-era).
- Legacy event hub URLs: `/events/quiz-night`, `/events/bingo-night`, etc.
- Legacy post URLs: `/post/*` where the destination `/blog/*` slug no longer exists (redirect-to-404).

### 3) Page with redirect (168)

Main patterns:

- `/post/*` → `/blog/*` (legacy URL namespace).
- `/blog/page/*` → `/blog` (legacy pagination paths).
- Legacy food/event/drinks paths (`/drink`, `/food/pizza`, `/event-details/*`, etc.).

The key fix here is to ensure redirectors are **not linked internally** and **not present in sitemaps**.

## Lower Priority Patterns (still worth keeping clean)

- `Crawled - currently not indexed`: mostly `/_next/static/*` (often with `?dpl=`), plus legacy `event-details` and `drinks/*` URLs.
- `Blocked by robots.txt`: mostly `/_next/*` + `/api/*` (expected), plus a handful of internal debug/test routes.
- `Alternative page with proper canonical tag`: mostly parameterised variants (expected).

