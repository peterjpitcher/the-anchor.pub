# SEO Evidence — Audit Summary

- Site crawled: http://localhost:3000/christmas-parties
- Collection date/time: 2026-07-10 20:07:06 UTC
- Collector: seo-powerhouse collect-site-evidence.py (read-only crawl)
- Pages collected: 1 (cap 1, max depth 0)
- robots.txt: 1 user-agent group(s), 11 Disallow rule(s), 2 Allow rule(s), 1 Sitemap line(s).
- Sitemap URLs discovered: 189
- ⚠️ Crawl TRUNCATED below the sitemap total: 188 sitemap URL(s) were not crawled (max-pages=1 < 189 sitemap URLs). Raise --max-pages to at least 189 for full coverage; findings below are based on the crawled subset only.

This file is a plain-English summary of repeatable evidence collected directly from the live site. All counts below come from the crawl; nothing is inferred or invented. Cite the companion CSV/JSON files for per-URL detail.

## Status-code distribution

| Status | Count |
|---|---|
| 200  | 1 |

## Templates found (URL-pattern heuristic)

| Template guess | URLs |
|---|---|
| top-level:christmas-parties | 1 |

## Top issues

| Issue | Count | Notes |
|---|---|---|
| Network/fetch errors | 0 | URLs that could not be retrieved (see `error` column). |
| Missing <title> | 0 | HTML pages with no title tag. |
| Missing meta description | 0 | HTML pages with no meta description. |
| Missing canonical | 0 | HTML pages with no rel=canonical. |
| Canonical points elsewhere | 1 | Canonical genuinely targets a different URL (trailing-slash/scheme-case differences ignored). |
| No H1 | 0 | HTML pages with no H1 heading. |
| Multiple H1s | 0 | HTML pages with more than one H1. |
| Thin content (<300 words) | 0 | May need consolidation or expansion. |
| Noindex pages | 0 | Via robots meta or X-Robots-Tag header. |
| Pages behind redirects | 0 | Internal/sitemap URLs that redirect (see chain). |
| No structured data | 0 | HTML pages with no JSON-LD @type detected. |
| Images missing alt text | 0 | Total across all crawled pages. |
| Pages with oversized images | 0 | Image > 200 KB via HEAD. |
| HTML pages not in sitemap | 1 | Crawled but absent from XML sitemap. |
| Soft-404 candidates | 0 | 200 OK pages with near-empty/error-phrase main content (heuristic — see `soft_404_candidate` in url-inventory.csv). |
| JS-dependent pages | 0 | Rendered DOM materially exceeds raw HTML (heuristic — see `render-diff.csv`). |

## Raw vs rendered (JavaScript dependency)

- Rendered crawl was disabled (`--no-render`); only raw HTML was parsed, so JavaScript dependency could not be assessed.

## Coverage diff (sitemap vs crawl vs indexed)

- In sitemap but not crawled: 189
- Crawled but not in sitemap (possible orphans): 1
- Indexed comparison skipped: no `indexation-urls.csv`/`search-queries.csv` found in the output directory (run an import to enable the three-way diff).

Sample of crawled-but-not-in-sitemap URLs (first 10):
  - http://localhost:3000/christmas-parties

## Output files

- `url-inventory.csv` — one row per URL (status, final URL, template, counts; plus `soft_404_candidate`, `js_dependent`).
- `page-metadata.csv` — title, meta description, canonical, Open Graph, headings.
- `technical-signals.csv` — status, canonicals (+ `canonical_status`: self/points-elsewhere/none/n/a), robots, redirects, sitemap inclusion.
- `schema.json` — JSON-LD blocks grouped by URL, plus @types found.
- `internal-links.csv` — source URL, target URL, anchor text.
- `render-diff.csv` — raw-vs-rendered per-URL comparison (only pages crawled in rendered mode).
- `broken-internal-links.csv` — internal link targets that 4xx/5xx or redirect.
- `audit-summary.md` — this file.

_Read-only crawl. robots.txt respected. Google SERPs never scraped._
