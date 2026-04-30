# Sitemap "Temporary processing error" — Investigation Findings

**Date:** 2026-04-30
**Investigator:** Sitemap Investigator agent
**Subject URL:** `https://www.the-anchor.pub/sitemap.xml`
**Source file:** `app/sitemap.ts` (Next.js 14 App Router dynamic sitemap)

## 1. Test matrix results

| Test | Result | Notes |
|---|---|---|
| Fetch www Mozilla | **200** | `Cache-Control: public, max-age=0, must-revalidate`; `application/xml`; **26 222 bytes**; `x-vercel-cache: MISS`; `cf-cache-status: DYNAMIC`; ~270 ms response time |
| Fetch www Googlebot | **200** | Identical headers and identical body to Mozilla. **No UA-based content variation.** |
| Fetch apex Mozilla | **307** | `Location: https://www.the-anchor.pub/sitemap.xml` — correct, matches `next.config.js` host redirect rule |
| Fetch apex Googlebot | **307** | Same — correct |
| Fetch www with trailing slash (`/sitemap.xml/`) | **308 → 200** | First hop returns `308 Permanent Redirect` to `/sitemap.xml` (Next.js trailing-slash normalisation), then `200`. **Adds one redirect hop** — Google generally tolerates this but it is one extra round-trip per fetch. |
| XML validity (Mozilla body) | **VALID** | Parsed cleanly by `xml.etree.ElementTree`. Well-formed sitemap with 215 `<loc>` URLs. |
| XML validity (Googlebot body) | **VALID** | Same. Identical bytes to Mozilla body. |
| Repeat-fetch byte sizes (10 trials, ~500 ms apart) | **All identical** | Every trial: 26 222 bytes, SHA-256 `0fef62bdc3f30545…`. **Content is fully stable — no drift.** |
| Sequential fetches (5 trials, ~1 s apart) | **5/5 MISS** | Every fetch: `x-vercel-cache: MISS`, `age: 0`, `cf-cache-status: DYNAMIC`. **No edge cache is ever populated** — every request hits the origin function. |
| Response timing | **~260–290 ms p50** | No timeouts observed in 23 successive fetches across three UAs (Mozilla, Googlebot, Bingbot). |

## 2. URL inventory check

- **Total `<loc>` URLs in sitemap:** 215
- **URLs that are also redirect sources:** **0** (checked against all 6 redirect JSON files: `additional-redirects.json`, `blog-redirects.json`, `drinks-redirects.json`, `legacy-redirects.json`, `tag-redirects.json`, `wix-redirects.json` — 606 exact + 24 glob/dynamic patterns scanned)
- **Sample of 20 URLs (first 5, last 5, 10 spread across) — live HEAD fetch result:** **20/20 returned `200`**, no redirects, no 404s, no 5xx. Sample saved to `evidence/sitemap-tests/url-sample-fetch.txt`.
- **Tag pages — exclusion logic:** `app/sitemap.ts` lines 240-253 already filter out any tag whose slug matches a `/blog/tag/...` redirect source. Working as intended.
- **Past-event filtering:** Lines 262-277 strip events older than `PAST_EVENT_REDIRECT_DAYS` (30 days) and cancelled events older than `CANCELLED_INDEX_DAYS` (7 days). The 5 event URLs in the sitemap are all 2026-05-xx (future) and all returned 200.

## 3. Hypothesis evaluation

| Hypothesis | Status | Evidence |
|---|---|---|
| Sitemap occasionally 5xx / times out | **inconclusive (rejected for the snapshot tested)** | 23/23 fetches in this session returned 200 within ~300 ms. **However**, the route is `dynamic = 'force-dynamic'` and on every request it makes up to 20 paginated calls to `management.orangejelly.co.uk`'s `/events` endpoint (lines 39-69). If that upstream is slow or unreachable when Googlebot fetches, the function could exceed Vercel's serverless timeout. The `try/catch` swallows errors and returns `[]` for events (line 64-66) — so a partial failure produces a valid-but-shorter sitemap rather than a 5xx, but a *full* timeout would yield a 504 from Vercel. **Likely the GSC "Temporary processing error" cause when it triggers.** |
| Sitemap content varies between requests | **rejected** | 10 sequential fetches over 5 s produced byte-identical responses (single SHA-256 hash). The static + blog + tag + landmark sections are deterministic; only the events section depends on a remote API and would vary if events were added/removed/expired between fetches — but during the test window, no drift was seen. |
| Some sitemap URLs are themselves redirects | **rejected** | 0 collisions between the 215 `<loc>` URLs and the 606 exact / 24 dynamic redirect sources across all 6 redirect JSON files. Sample fetch of 20 URLs all returned 200, no 3xx. |
| Sitemap cache header is too long / mismatched | **rejected (header is correct)** but with caveat | `Cache-Control: public, max-age=0, must-revalidate` is appropriate for a dynamic sitemap. **Observed effect:** every request is `x-vercel-cache: MISS` / `cf-cache-status: DYNAMIC`. This means the file declared `revalidate = 60 * 60` (1 hour ISR — line 9) **is overridden** by `dynamic = 'force-dynamic'` (line 10). The `revalidate` is dead code. Each Googlebot fetch pays the full origin-function cost. |

Additional observations not in the original hypothesis list:

- **`vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch`** is emitted on the sitemap response. This is a Next.js App Router default applied to all routes, not specific to sitemap. It does not break sitemap consumption (Google ignores `vary` for sitemap fetches) but it is unusual to vary on Next-internal headers for a public XML feed. Low risk; cosmetic.
- **Apex → www redirect:** `307 Temporary` rather than `308 Permanent`. Google handles both, but `308` is the canonical choice for permanent host redirects. Not a regression that would cause a "Temporary processing error", but worth flagging if a host-redirect-rule change is on the table.

## 4. Likely root cause(s)

**Primary candidate (highest confidence):** the sitemap is fully dynamic and on every request issues up to 20 sequential paginated calls to `management.orangejelly.co.uk` via `anchorAPI.getEvents`. When that upstream is slow or briefly unavailable, the Vercel serverless function exceeds its timeout and Google receives a 504/timeout. GSC URL Inspection surfaces this as `Temporary processing error` — the same kind of "couldn't reach the sitemap right now" message it gives for any transient origin failure.

Two reinforcing facts:
1. **No edge caching** (`x-vercel-cache: MISS` on every request) means *every* Googlebot request triggers the upstream API. There is no cushion against a single bad minute on the management API.
2. **`revalidate = 60 * 60` is overridden by `dynamic = 'force-dynamic'`** — the developer presumably *intended* to ISR-cache the sitemap for an hour, but `force-dynamic` defeats the cache and makes each request a fresh build.

**Secondary candidate (lower confidence):** the trailing-slash 308 hop. If GSC is fed `https://www.the-anchor.pub/sitemap.xml/` (with trailing slash) anywhere — e.g. an old GSC submission — it pays one extra redirect every fetch. This won't itself produce "Temporary processing error" but slows discovery. No evidence yet that this is the URL submitted to GSC.

## 5. Recommended fixes (if any)

### Fix 1 — Restore intended ISR caching on the sitemap (high impact, low risk)

- **Fix description:** Remove `export const dynamic = 'force-dynamic'` from `app/sitemap.ts` so that `export const revalidate = 60 * 60` actually takes effect. Vercel will then serve the sitemap from its edge cache for 1 hour, regenerating in the background. Googlebot fetches will hit the cache the vast majority of the time; the management-API timeout window only matters once per hour rather than once per crawl. If a stale-while-revalidate window is preferred during partial outages, also set `export const fetchCache = 'force-cache'` and add `next: { revalidate: 3600 }` to the `getEvents` calls.
- **File(s):** `app/sitemap.ts` lines 9-10
- **Why:** The current configuration makes `revalidate` dead code. Each Googlebot fetch causes up to 20 round-trips to a third-party API, which is the most plausible source of intermittent "Temporary processing error" reports. Caching the rendered sitemap for an hour is the standard pattern for dynamic sitemaps and is precisely what the developer originally signalled with `revalidate = 3600`.
- **Risk:** **Low.** Worst case: a newly-published event would not appear in the sitemap for up to 1 hour. For a pub with a 215-URL sitemap dominated by static pages, that delay is acceptable. (Compare: many dynamic sitemaps cache for 24 h.)
- **Verification:** After deploy, fetch `https://www.the-anchor.pub/sitemap.xml` twice in quick succession — the second should report `x-vercel-cache: HIT` and `Age: <number>`. Run the 10-fetch consistency check again — sizes should remain identical and timing should drop to <100 ms after the first MISS. Re-submit the sitemap in GSC and watch the `Sitemaps` report for the next 7 days; "Temporary processing error" rate should drop.

### Fix 2 — Add a hard timeout + parallel paging to the events fetch (medium impact, low risk)

- **Fix description:** In `getSitemapEvents` (lines 39-69 of `app/sitemap.ts`), wrap each `anchorAPI.getEvents` call in a per-call timeout (e.g. `AbortController` with a 3-second deadline) and run the 20 pages in parallel rather than sequentially. Currently a slow upstream that takes 1.5 s/page would consume 30 s — enough to exhaust Vercel's default 10 s function timeout.
- **File(s):** `app/sitemap.ts` lines 39-69; `lib/api.ts` (the `anchorAPI.getEvents` implementation may need an optional `signal` parameter)
- **Why:** Defence-in-depth on top of Fix 1 — even with caching, a build that takes 30 s is brittle. Parallelism + a short per-request timeout caps the worst case.
- **Risk:** **Low**, but parallelising 20 calls increases peak load on the management API for ~1 s during cache regeneration. The management API serves the booking flow at much higher volume, so 20 parallel reads is unlikely to be a problem; however, this should be verified with the management-app owner.
- **Verification:** Time the sitemap regeneration before and after by hitting `?ts=<random>` to bypass the cache. Should drop from ≤10 s worst case to ≤3 s.

### Fix 3 — (Cosmetic, optional) Promote apex → www redirect from 307 to 308

- **Fix description:** In `next.config.js` host-redirect rule, set `permanent: true` so the apex → www redirect is `308` not `307`.
- **File(s):** `next.config.js`
- **Why:** Signals to Google that the host change is permanent and helps consolidate signals. Minor SEO hygiene; not the cause of "Temporary processing error".
- **Risk:** **Low.** A permanent redirect is harder to reverse if you ever wanted to flip the canonical host, but the canonical host is locked in by Cloudflare DNS and `metadataBase`, so this is unlikely to be reversed.
- **Verification:** Re-run the apex fetch tests; expect status 308.

## 6. Items the next round should still investigate

- **Direct reproduction of GSC's error:** None of the 23 fetches in this snapshot reproduced the error. To strengthen confidence in Fix 1, capture Vercel function logs for the next 24-48 h filtered by `path == /sitemap.xml` — look for any 504/timeout events, especially correlated with management-API latency spikes. If there are zero 504s but GSC still reports the error, the cause may be upstream of Vercel (Cloudflare timeout? GSC's own crawler infrastructure?).
- **`x-matched-path: /sitemap.xml`** appears correctly in headers — confirms the route is matching as expected. No change needed.
- **`vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch`** on the sitemap response: investigate whether this can be stripped at the route level (a `headers()` override in the App Router) for cleaner edge-cache keys. Not blocking, but a nice-to-have for cache hit ratio.
- **Trailing-slash usage:** confirm with the GSC owner which exact URL is submitted to GSC. If it is `https://www.the-anchor.pub/sitemap.xml/` (with trailing slash), update the GSC submission to drop the slash so Google fetches the canonical URL directly without the 308 hop.
- **`fallback` event-category exclusion** (line 263): worth verifying with the management API owner that no real events ever have `category.id === 'fallback'` — otherwise this filter would silently drop valid events.
