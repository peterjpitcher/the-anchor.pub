# GSC indexing investigation, 23 September 2026

Triggered by an external agent's report of an "indexing crisis": 666 not indexed
against 192 indexed, blamed for a -16.7% decline.

**Conclusion: there is no indexing crisis.** The counts are real, the
interpretation is wrong. One genuine defect was found and fixed. The traffic
question is still open and needs different data.

## The test that settles it

The sitemap is what the site asks Google to index. Every one of its 200 URLs was
fetched live as Googlebot on 23 September 2026:

| Check | Result |
| --- | --- |
| Sitemap URLs | 200 |
| Returned HTTP 200 | 200 |
| Indexable (no noindex, no x-robots noindex) | 200 |
| Self-canonical (canonical matches the URL) | 200 |
| Problem URLs | **0** |

GSC reports **192 indexed**. That is roughly 96% coverage of what the site
actually wants indexed. The remaining gap is normal crawl lag.

## The 666 reconciled

"Not indexed" counts every URL Google has ever heard of that is not in the index,
including every URL the site deliberately keeps out. It is not a defect count.

| Bucket | Count | What it actually is | Defect |
| --- | --- | --- | --- |
| Crawled, currently not indexed | 281 | See breakdown below | No |
| Page with redirect | 157 | Legacy Wix `/post/*` and `/event-details/*`, consolidated blog tags, past events pointing at hubs | No, by design |
| Excluded by noindex | 99 | 63 of 116 blog posts carry `noindex: true` in frontmatter; plus noindexed tag archives and discontinued events | No, deliberate |
| Blocked by robots.txt | 59 | `/api/`, `/_next/data/`, `/cdn-cgi/` and similar | No |
| Alternative page with proper canonical | 34 | This is the *correct* state for a canonicalised duplicate, not a fault | No |
| Not found (404) | 26 | Removed and cancelled event pages | No |
| Discovered, currently not indexed | 9 | Normal crawl queue | No |
| Duplicate, Google chose different canonical | 1 | Not yet identified, URL not in the supplied export | Unknown |
| **Indexed, though blocked by robots.txt** | **1** | **`/leave-review`** | **Yes, fixed** |

### Inside the 281 "crawled, currently not indexed"

Every URL was classified, and the 64 real pages were fetched live:

| Type | Count | Note |
| --- | --- | --- |
| `_next/static/css/*.css?dpl=...` | 189 | Build artefacts. `robots.txt` deliberately says `Allow: /_next/static/` so Google can render pages. Stylesheets are never indexable, so they land here permanently. Each deploy adds more. Correct behaviour. |
| `opengraph-image` / `social-image` routes | 25 | Serve `image/png`. Never indexable. Must stay crawlable or social previews break. |
| favicon / manifest / icon | 3 | Noise |
| 301 redirects | 26 | All resolve correctly to sensible targets |
| 200, deliberately noindexed blog posts | 16 | `noindex: true` in frontmatter |
| 200, query-string variants | 14 | `/book-table?...`, `/food-menu?utm_...` etc, all self-canonicalising to the clean URL |
| 308 redirects to `/blog/tags` | 5 | Retired tag archives |
| 404 | 3 | Cancelled or past events, serving noindex |

83% of the bucket is infrastructure that can never be indexed and should not be.
Of the 64 real pages, 60 were last crawled in **March or April 2026**, five to six
months before this export. They are stale records, not live problems.

## The direction of travel

The trend contradicts the "crisis" framing outright:

| Metric | 30 Jun 2026 | 18 Sep 2026 | Direction |
| --- | --- | --- | --- |
| Not indexed | 711 | 666 | Down 45 |
| Indexed | 184 | 192 | Up 8 |
| Crawled, not indexed | 308 (peaked 342 in July) | 281 | Down |

Indexing has improved over the period the decline is attributed to. It cannot be
the cause.

## The one real defect, fixed

`/leave-review` was:

- disallowed in `robots.txt`
- serving a 301 to the Google review page
- linked **sitewide from the footer** (`components/layout/Footer.tsx:124`) and
  from `/sitemap-page`
- carrying `robots: 'noindex, follow'` in `app/leave-review/page.tsx`

The robots.txt block stops Googlebot fetching the URL, so it never sees the
noindex and never follows the 301. Because the footer links it from every page,
Google indexed the bare URL with no content. That is the single
"Indexed, though blocked by robots.txt" entry.

`/subscribe`, `/subscribe-for-digital-flyers` (both 301 to `/`) and `/p5-demo`
(404 with noindex) had the same conflict, and were parked in the robots-blocked
bucket indefinitely for the same reason.

**Fix:** all four removed from the disallow list in `app/robots.ts`. Disallow now
covers infrastructure only. Google can fetch them, follow the redirect, and
reclassify them as "Page with redirect", which is the correct permanent state.

Two regression tests added to `tests/seo-indexing.test.ts`, matching the existing
guards in that file:

- every disallow entry must be an infrastructure prefix (`/api/`, `/_`, `/cdn-cgi/`)
- these four paths specifically must never be disallowed again

Verified: lint clean, `tsc --noEmit` clean, 230 suites / 2,707 tests pass under
both `TZ=Europe/London` and UTC, production build succeeds, and the built
`robots.txt` emits the intended output.

## The traffic question is still open

Impressions in the supplied export:

| Window | Impressions | Change |
| --- | --- | --- |
| Last 28 days vs prior 28 | 91,435 vs 96,296 | -5.0% |
| Last 14 days vs prior 14 | 43,706 vs 47,729 | -8.4% |

There is mild softening, but nothing resembling a -16.7% collapse, and the
coverage export contains no click data at all. The -16.7% cannot be sourced,
reproduced or diagnosed from these two files.

The late-July peak (30,045 impressions in the week of 23 to 29 July) against
21,464 in the week of 10 to 16 September is consistent with summer seasonality
for a pub with a beer garden, but that cannot be confirmed without a
year-on-year comparison.

## What is needed to close the traffic question

From Search Console, Performance report, Search results:

1. **16-month export, no filters.** Gives clicks and the year-on-year comparison
   that separates a real decline from summer seasonality.
2. **Last 3 months vs previous 3 months, compare mode, Pages tab.** Shows which
   pages lost clicks, which is the only way to find the cause.
3. **The URL behind "Duplicate, Google chose different canonical"** (1 page),
   which was not in the supplied drilldown.

Quote clicks from the Pages or Chart tab only. See
`reference_gsc_export_dimension_trap` for why the Queries tab understates.

## Open item for the owner

`/leave-review` redirects live to `https://g.page/r/CQz1W5fqSTqPEAI/review`, but
`app/leave-review/page.tsx` specifies `https://g.page/theanchorpubsm/review?share`.
The repo is in sync with `origin/main`, so something outside the Next.js app is
serving that redirect. Worth confirming which destination is correct and whether
a stray Cloudflare rule exists.

---

## Incident: /sitemap.xml returned 500 after the deploy

Deploying the robots fix cold-started the sitemap's ISR cache and exposed a
latent bug that had been masked since 30 April 2026.

**Symptom.** `/sitemap.xml` returned HTTP 500 consistently, in 200 to 300ms, so
not a timeout. Every other route was fine.

**Cause.** Vercel's runtime log:

```
Invariant: invalid Cache-Control duration provided: 0 < 1
page: '/sitemap.xml'
```

`app/sitemap.ts` exports `revalidate = 3600`, so Next owns that route's caching.
`next.config.js` also set a `Cache-Control` header on the same path. The two
merged into one header, reproduced locally against `next start`:

```
public, max-age=300, s-maxage=300, must-revalidate, public, max-age=0, must-revalidate
```

Vercel parses a revalidate duration out of that, reads the trailing `max-age=0`
and throws. Every regeneration failed, so the route served 500 the moment the
ISR cache went cold. A deploy is exactly what empties that cache. The warm cache
had been serving the last good sitemap for nearly five months, which is why it
had never surfaced. The same masking is recorded in the 5 September triage,
where the sitemap sat stale for 15 hours and only a redeploy cleared it.

**This was pre-existing on `main`, not introduced by the robots change.** The
diff that triggered it touched only `app/robots.ts`, a test file and a markdown
document, none of which can affect sitemap caching. Any deploy would have done
the same.

**Fix.** The `/sitemap.xml` Cache-Control override was removed from
`next.config.js`, leaving Next's own `public, max-age=0, must-revalidate`.
Commit `db542d1e`.

The `/robots.txt` override was deliberately left in place. `app/robots.ts`
exports no `revalidate`, so nothing parses a duration from it, and it serves 200
both locally and in production. Its header is documented as load-bearing for the
Cloudflare Browser Cache TTL interaction.

**Guard.** A test in `tests/seo-indexing.test.ts` asserts `next.config.js` sets
no `Cache-Control` on a route that exports its own `revalidate`. It forces
`NODE_ENV=production`, because `headers()` returns only the base set otherwise
and the first version of the test passed vacuously. Confirmed failing against
the old config and passing against the new.

**Recovery took about eight minutes after the fix went live.** The clean header
was being served while the route still returned 500, so the error state
persisted in the cache layer for several revalidation cycles before clearing.

**Verified live, 23 September 2026:**

| Check | Result |
| --- | --- |
| `/sitemap.xml` status | 200, stable across repeated fetches |
| Sitemap URL count | 200 (42 events, 50 blog, 108 other) |
| Cache-Control | `public, max-age=0, must-revalidate`, single, unmerged |
| All sitemap URLs 200 and indexable | 200 of 200 |
| `robots.txt` | 200, none of the four paths still blocked |
| The four formerly-blocked URLs | resolving correctly (three 301, one 404) |

## Second open item for the owner

`/leave-review` returned three different destinations during this session:
`g.page/r/CQz1W5fqSTqPEAI/review`, then `l.the-anchor.pub/feedback`, against
`g.page/theanchorpubsm/review?share` in `app/leave-review/page.tsx`. Something
outside the Next.js app is serving that redirect and it is not stable. Worth
confirming which destination is intended.
