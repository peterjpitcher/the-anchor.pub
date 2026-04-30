# GSC Indexing Fix — Discovery & Spec

**Source data:** eight sibling GSC export folders under `temp/GSC Errors/`, from `the-anchor.pub-Coverage-Drilldown-2026-04-30/` through `the-anchor.pub-Coverage-Drilldown-2026-04-30 (7)/`
**Pages flagged:** 596 across 8 GSC categories
**Date of GSC export:** 2026-04-29
**Last revised:** 2026-04-30 (critical review added; `not-found.tsx` redirect proposal rejected)

This spec is for review. It started as a pre-implementation spec; some work has since shipped in commit `b319ee6`. The critical review below supersedes the original proposal where they conflict.

---

## Critical correction: do not redirect from `not-found.tsx`

The earlier version of this spec proposed adding:

```ts
// app/events/[id]/not-found.tsx
import { permanentRedirect } from 'next/navigation'

export default function EventNotFound() {
  permanentRedirect('/whats-on')
}
```

That proposal is rejected.

Observed behaviour in this repo: the file compiled without warnings, but `EventNotFound` did not appear in `.next/server/**/*.js` after a clean `npm run build`. The sibling `app/events/[id]/page.tsx` compiled normally and its own `permanentRedirect('/whats-on')` calls were present.

Next.js documentation does **not** document `not-found.tsx` as a supported place to perform redirects. The documented purpose of `not-found.js` is to render UI when `notFound()` is thrown within a route segment. The documented purpose of `notFound()` is to throw a `NEXT_HTTP_ERROR_FALLBACK;404`, render the `not-found` file, and inject a `noindex` robots meta tag. Separately, `permanentRedirect()` is documented for Server Components, Client Components, Route Handlers, and Server Functions, and the redirecting guide recommends `next.config.js` redirects or Middleware when redirecting before render.

Recommended patterns for this project:

1. **Known URL mappings:** use `next.config.js` redirect entries or Middleware. This is appropriate for old slugs and legacy paths.
2. **Data-dependent event redirects:** perform the decision inside `app/events/[id]/page.tsx` before calling `notFound()`. If the event has a close replacement, call `permanentRedirect()` from the page component.
3. **Truly removed content:** use `notFound()` plus a normal `not-found.tsx` UI, or another deliberate 404/410 strategy. Do not redirect everything to `/whats-on` by default.
4. **Segment-specific 404 UI:** keep `not-found.tsx` as UI only. It should not be used as a hidden redirect hook.

Official references checked:

- Next.js `not-found.js`: <https://nextjs.org/docs/14/app/api-reference/file-conventions/not-found>
- Next.js `notFound()`: <https://nextjs.org/docs/app/api-reference/functions/not-found>
- Next.js `permanentRedirect()`: <https://nextjs.org/docs/app/api-reference/functions/permanentRedirect>
- Next.js redirecting guide: <https://nextjs.org/docs/14/app/building-your-application/routing/redirecting>

---

## Verification log (2026-04-30)

Before recommending any fix, I cross-referenced each cohort's "Last crawled" date in GSC with `git log` / `git blame` on the relevant config files. This caught one wrong recommendation in the original draft:

- **B3 (17 tag URLs marked 404):** all 17 are *already* redirected in `config/redirects/tag-redirects.json` (16) or `config/redirects/additional-redirects.json` (1). They were last crawled by Google **before** those redirect entries were added. The "404" status is stale GSC data — the live site no longer 404s these tags. **No code change needed.** B3 is moved from Group B to Group A4.
- **B4 (7 tag URLs marked "Redirect error"):** redirects existed at crawl time, so this *is* a real bug — kept in Group B for investigation.
- **B1, B2, B5:** rules / dates / page state are current. Recommendations stand.
- **C6 (11 test/debug pages):** none are actually disallowed in `app/robots.ts`. Status reflects an older robots.txt — also stale GSC data. Moved from Group C to Group A4.

---

## Bottom line (revised)

- **≈ 277 URLs (Group A)** are GSC reporting redirects, canonicals, or stale historical state. No code change needed.
- **≈ 124 URLs (Group B)** are real issues caused by 4 root-cause buckets.
- **≈ 195 URLs (Group C)** are "Crawled — currently not indexed" + "Discovered — currently not indexed". Quality signals from Google. Most resolve themselves; a few need targeted edits.

The high-leverage code changes are now **3 surgical fixes plus 1 investigation**. Everything else is data hygiene or already shipped.

---

## Group A — Status reports / stale data, no fix needed

### A1. Page with redirect — 221 URLs
GSC reporting "this URL was hit, it returned a redirect, OK". Correct outcome of the cleanup redirects in `next.config.js`.

| Pattern | Count | Source |
|---|---|---|
| `/blog/tag/*` redirects | 120 | `config/redirects/tag-redirects.json` |
| `/post/*` (Wix legacy) | 28 | `config/redirects/blog-redirects.json` |
| `/blog/page/*` paginated | 8 | `config/redirects/additional-redirects.json` |
| `/event-details/*` (legacy) | 6 | `config/redirects/legacy-redirects.json` + wix |
| Various `/events/*` past dates | 12 | `config/redirects/additional-redirects.json` |
| `/drinks/*` retired SKUs | 9 | `config/redirects/drinks-redirects.json` |
| 4 protocol/host redirects | 4 | `middleware.ts` (apex→www, http→https) |
| Other one-offs | 34 | various |

**Action:** none. These will fade over months as Google forgets the source URLs.

### A2. Alternative page with proper canonical tag — 11 URLs
UTM-tagged or query-parameter variants where the canonical tag correctly points at the parent URL.

**Action:** none. Working as designed.

### A3. Discovered — currently not indexed — 17 URLs
Google found via sitemap or links but hasn't crawled yet (mostly recent additions).

**Action:** none. Re-check in 30 days.

### A4. Stale GSC data — already-fixed pages reported under their old status (≈ 28 URLs)

**A4a. 17 tag URLs marked "Not found (404)"** — all 17 have redirects in place today. Last crawl of each was before the redirect was added.

| Slug | Redirect destination | Redirect added | Last crawled |
|---|---|---|---|
| mental-health, cider, feedback, children, private-dining, live-matches, terrestrial-sport, cash-prizes, traditional, family, british-history, pub-menu, annual-celebrations, mexican-culture, local-area, lunch | various (community / food-and-drink / sports / events / seasonal) — see `tag-redirects.json` lines 676–795 | 2026-03-02 (most) | 2026-01-06 to 2026-02-17 |
| craft-beer | /blog/tag/food-and-drink (in `additional-redirects.json:79–82`) | 2025-12-29 | 2025-11-15 |

**Action:** click "Validate fix" in GSC for the "Not found (404)" report. Wait for Google to re-crawl. No code change.

**A4b. 11 test/debug pages marked "Blocked by robots.txt"** — none of these match any `disallow` rule in current `app/robots.ts`. They were last crawled Jan–Mar 2026; the actual response today is most likely 404 because the routes don't exist in `app/`.

URLs: `/test-simple`, `/test-tracking`, `/test-reviews`, `/test-gtm`, `/test-navigation-tracking`, `/test-hours`, `/gtm-debug`, `/debug-hours`, `/components`, `/demo-header`, `/p5-demo`-adjacent.

**Action:** none. Will drop out of GSC reports as Google re-crawls.

---

## Group B — Real fixes

### B1. `robots.txt` `/*?dpl=*` rule blocks Vercel deploy-tagged static assets

**Evidence:**
- `app/robots.ts:13` declares `disallow: ['/*?dpl=*', ...]` — added 2026-02-18 (commit `bf1959b1`)
- `app/robots.ts:8` declares `allow: ['/', '/_next/static/']`
- 106 URLs flagged "Blocked by robots.txt" all match `/_next/static/css/HASH.css?dpl=DEPLOY_ID`
- Vercel auto-appends `?dpl=<deployment-id>` to static assets
- Latest `_next/static/` URL was crawled 2026-04-21, after the rule was added — so the rule is actively blocking, not stale

**Why it's an issue:** `/*?dpl=*` matches any URL containing `?dpl=`, including the static CSS/JS assets that Googlebot needs to fetch when rendering pages. The `allow: /_next/static/` rule is more general; Google's parser uses the more specific match (the dpl wildcard). We end up telling Googlebot it can't load our stylesheet during render.

The rule was presumably added to stop Google indexing the *HTML* version of `?dpl=` URLs. That's better solved with canonical tags (already in place) than with robots.txt.

**Proposed fix:** remove the line `'/*?dpl=*',` from the disallow list in `app/robots.ts`. Keep the rest. The `X-Robots-Tag: noindex, nofollow` header already on `_next/static/*` (set in `next.config.js:130-141`) prevents asset URLs appearing in search.

**Risk:** very low. Canonical tags already handle dedup.

**Files touched:** `app/robots.ts` (1 line removed).

**Resolves:** 106 URLs in "Blocked by robots.txt".

---

### B2. Past/removed `/events/*` URLs return 404 instead of redirecting

**Evidence:**
- 10 URLs in "Not found (404)" matching `/events/quiz-night-2026-XX-XX`, `/events/bingo-2026-XX-XX`, slugless `/events/karaoke`, `/events/drag-shows`, `/events/quiz-night`
- `app/sitemap.ts:268-274` excludes events older than `PAST_EVENT_REDIRECT_DAYS` from the sitemap, but no catch-all picks them up after that
- The 404'd events are ones the management API no longer returns

**Rejected fix:** do **not** add `app/events/[id]/not-found.tsx` that calls `permanentRedirect('/whats-on')`. That pattern compiled silently but was not present in the server build output, and it is not documented as a supported use of `not-found.tsx`.

**Implemented workaround:** put the redirect decisions directly in `app/events/[id]/page.tsx`, where `permanentRedirect()` is documented and the compiled output includes the redirect calls. The current implementation redirects missing/falsy events and draft events to `/whats-on`.

**Critical follow-up:** this should become an explicit event lifecycle policy, not a blanket redirect. Redirect to `/whats-on` only when it is a useful replacement. If an event is genuinely removed and has no close replacement, prefer `notFound()` with a real 404 UI or a deliberate 410/404 strategy.

**Risk:** medium if left as a blanket redirect. Live events route normally, but broad redirects can send stale event URLs to a weak replacement and may be interpreted poorly by users and search engines.

**Files touched:** `app/events/[id]/page.tsx`. Do not add `app/events/[id]/not-found.tsx` for redirects.

**Resolves:** 10 URLs in "Not found (404)" + future drift.

---

### B4. 7 `/blog/tag/*` URLs hit "Redirect error"

**Evidence:**
- 7 URLs (3 apex + 4 www): `premier-league` (2×), `rugby` (2×), `pet-friendly` (2×), `dog-friendly` (1×)
- All four source tags have redirects in `tag-redirects.json` that were added on or before 2025-12-28 — *before* the GSC crawls (2026-01-05 to 2026-01-23)
- All four destinations (`community`, `sports`) are live tag pages with posts
- Apex variants double-hop: `the-anchor.pub` → `www.the-anchor.pub` (middleware) → `www.the-anchor.pub/blog/tag/<dest>` (next.config redirect)

**Hypothesis:** either Google's tooling flagged the 2-hop chain, or there was a transient response failure (timeout / cache miss) at crawl time.

**Proposed fix:** investigation only in v1. Once B1 and B2 ship and the site is re-crawled, click "Validate fix" in GSC for these 7 and see if the error clears. If it persists, we'll need to either:
- shorten the chain (rare — middleware host-canonicalisation is working correctly); or
- look at whether the destination pages had a transient render failure at crawl time.

**Risk:** none in v1 (no code change).

**Resolves:** to be determined.

---

### B5. Sitemap/redirect contradiction on `/drinks/baby-guinness`

**Evidence:**
- `app/sitemap.ts:110` declares `/drinks/baby-guinness` as a canonical URL
- `config/redirects/drinks-redirects.json` declares `/drinks/baby-guinness` → `/drinks` as a permanent redirect
- The page exists in `app/drinks/[slug]/...` (build output confirms it renders)
- GSC shows `/drinks/baby-guinness` in "Discovered — currently not indexed" — consistent with sitemap discovery, no redirect observed yet

**Proposed fix:** remove the entry `{ source: "/drinks/baby-guinness", destination: "/drinks", permanent: true }` from `config/redirects/drinks-redirects.json`. The page is live and listed in the sitemap.

**Audit follow-on:** scan all 76 entries in `drinks-redirects.json` against live drinks routes (`app/drinks/[slug]/...`) and remove any other contradictions. I will produce that diff once you approve B5.

**Risk:** low.

**Resolves:** 1 URL plus drift prevention.

---

## Group C — Quality / data hygiene

### C1. 116 URLs in "Crawled — currently not indexed"
Google crawled and chose not to index. Causes are content quality, duplication, or staleness — not technical errors.

| Pattern | Count | Likely cause |
|---|---|---|
| `/blog/tag/*` (consolidated thin tags) | 22 | Tag pages with 1–2 posts |
| `/post/*` (Wix legacy) | 16 | Old URLs, redirected, slow to drop out |
| `/event-details/*` (legacy) | 11 | Same |
| `/events/*` past dates | ~25 | Past events; expected to fall out |
| Individual `/blog/*` posts | ~30 | Older posts with low engagement |
| `/drinks/*` retired SKUs | 5 | Same as drinks-redirects |
| Misc one-offs | ~7 | Mostly UTM/query variants |

**Action:** most resolve once B1/B2/B5 ship. Thin tag consolidation and old-post review are out of scope here — flag as a follow-on SEO content task.

### C2. 52 blog posts marked "Excluded by 'noindex' tag"
Mechanism: `post.noindex` frontmatter, consumed at `app/blog/[slug]/page.tsx:140`. By design — author opt-in.

**Action:** spot-check 5 of the 52 to confirm intentional. If any should be indexable, remove the frontmatter on those posts.

### C3. 1 URL `/booking-confirmation` in "Excluded by 'noindex' tag"
Page now does `redirect('/book-table')`. The noindex flag is from a prior version. GSC report is stale.

**Action:** none.

### C4. `/hr` returns 404
No page at `app/hr/`, no redirect rule.

**Action:** add a redirect to whichever recruitment page is canonical. Destination needs your input.

### C5. `/images/page-headers/drinks/optimized/drinks-1920w` returns 404
Broken image URL.

**Action:** grep for the URL across the codebase, fix the source reference, or accept the 404.

---

## Proposed work sequence (revised)

| # | Task | Files | Resolves | Risk |
|---|---|---|---|---|
| 1 | Remove `/*?dpl=*` from `app/robots.ts` disallow | `app/robots.ts` (1 line) | 106 URLs | very low |
| 2 | Keep event redirect logic in `app/events/[id]/page.tsx`; do **not** use `not-found.tsx` as a redirect hook | `app/events/[id]/page.tsx` | 10 URLs + future drift | medium until lifecycle policy is explicit |
| 3 | Audit & remove `drinks-redirects.json` entries that contradict the sitemap | `config/redirects/drinks-redirects.json` | 1 URL + drift prevention | low |
| 4 | Add `/hr` redirect (destination TBC) | `config/redirects/additional-redirects.json` | 1 URL | very low |
| 5 | Spot-check 5 of 52 noindexed blog posts | n/a | verification only | none |
| 6 | Investigate the 7 `/blog/tag/*` "Redirect error" cohort — defer until 1–4 ship and Google re-crawls | n/a | up to 7 URLs | none |
| 7 | Investigate `/images/page-headers/...` 404 source | grep + fix referrer | 1 URL | low |
| 8 | Click "Validate fix" in GSC for "Not found (404)" once 1–4 ship — covers the 17 stale tag 404s plus the new B2 redirects | n/a (GSC console) | 17 + 10 URLs | none |

**Bundle suggestion:** ship 1+2+3+4 as one PR (mechanical fixes, all evidence-backed). 5 is a verification pass, 6+7 are investigations, 8 is a GSC click after the PR is live.

---

## Open questions (revised — original Q1 about tag destinations is resolved)

1. **Q1 (was Q2) — accept 2-hop redirects on the apex variants?** If we leave middleware (apex→www) and `next.config` (tag→consolidated) as-is, the apex URLs of redirected tags will always be 2 hops. Is that acceptable, or do you want me to flatten them into single-hop edge redirects?
2. **Q2 (was Q3) — list the 52 noindexed blog post slugs for spot-check?** Do you want me to print them so you can scan for any that should be indexable?
3. **Q3 (was Q4) — `/hr` destination?** What page should `/hr` redirect to? `/join-the-team`, the careers section, somewhere else, or just leave it 404?
4. **Q4 (was Q5) — bundle order?** Happy with 1+2+3+4 as a single PR, or do you want a different cadence?
5. **Q5 (was Q6) — `/drinks/baby-guinness` direction?** I proposed keeping the page (in sitemap) and removing the redirect. Confirm that's right, or you'd rather we kill the page and keep the redirect?

---

## Files referenced

- `app/robots.ts`
- `app/sitemap.ts`
- `app/blog/tag/[tag]/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/booking-confirmation/page.tsx`
- `app/private-hire/near/[slug]/page.tsx`
- `middleware.ts`
- `next.config.js`
- `config/redirects/blog-redirects.json` (159 rules)
- `config/redirects/tag-redirects.json` (150 rules)
- `config/redirects/wix-redirects.json` (158 rules)
- `config/redirects/legacy-redirects.json` (6 rules)
- `config/redirects/drinks-redirects.json` (76 rules)
- `config/redirects/additional-redirects.json` (97 rules)
- `lib/structured-data/event-schema.ts` (already fixed in earlier commit)
- `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/Table.csv`
