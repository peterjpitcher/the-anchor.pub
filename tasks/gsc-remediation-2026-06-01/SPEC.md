# GSC Error Remediation — Re-spec (2026-06-01)

**Author:** Investigation for Peter Pitcher
**Date:** 2026-06-01
**Repo:** `OJ-The-Anchor.pub` (Next.js 14 marketing/booking site)
**Source data:** GSC exports dated 2026-06-01 — Page-indexing coverage (8 drill-downs), Sitemaps, Core Web Vitals, and Enhancement reports (Breadcrumbs, Events, Job Postings) — plus live production verification run 2026-06-01.
**Prior work this builds on:** [`tasks/gsc-indexing-fix/`](../gsc-indexing-fix/) — `FINAL-SPEC.md`, `url-lifecycle-policy.md`, `audit-gsc-csvs.mjs`, CI regression tests. **Do not duplicate that work; this is the re-measurement + the new issues it didn't cover.**

> **Status:** Recommendation only. No code changed. Decisions needed in §7 before any implementation.

---

## 0. Read this first — the headline

This is **not a fresh problem**. A substantial indexing-fix project shipped and was production-verified in April–May 2026 (redirect-chain flattening, `/_next/static` allow, sitemap resilience, blog-tag noindex policy, event SEO lifecycle, CI guardrails). Today's export is the re-measurement.

**What that means for the numbers you're seeing:**

| Bucket | Reality |
|---|---|
| **Most indexing-coverage rows** | Already fixed in code/live. GSC is showing **stale state awaiting re-crawl/validation**. Verified live today (see §8 appendix). |
| **The 7 "Redirect error" URLs** | **Already resolve correctly** — single 301 → 200, live, today. They're stuck at "Not Started" only because nobody clicked **Validate fix** in GSC. No code needed. |
| **Structured-data warnings (Breadcrumbs / Events / Job Postings)** | **Genuinely new.** They hit pages added *after* the April fix (recruitment, `/private-hire/near/*`, seasonal/venue pages). This is the real code work. |
| **5 "Couldn't fetch" sitemaps** | **Genuinely new/untouched** — old 2023–24 Wix-era submissions that no longer exist. GSC-side cleanup. |
| **Core Web Vitals** | **Healthy** (104 good mobile URLs, 0 poor). No action. |

So: a little GSC housekeeping, **one focused code PR for structured data**, and patience on the rest.

---

## 1. How to work through this — recommended sequence

Ordered by effort vs. impact, and by "is this even a code problem?".

**Phase 0 — GSC operational (today, ~15 min, no code)**
1. Click **Validate fix** on **Redirect error** (7 URLs) — code is already correct live.
2. Delete the **5 stale sitemap submissions** (§5.1) from the Sitemaps report.
3. Do **NOT** bulk-validate *Crawled - not indexed*, *Excluded by noindex*, or *Page with redirect* — these are mixed/intentional cohorts (see §3).

**Phase 1 — Structured-data completeness (one PR, ~M / score 3)**
Fix the Enhancement warnings together because they share root cause (hand-rolled, inconsistent schema): §4.1 Events, §4.2 Job Postings, §4.3 Breadcrumbs. Add a regression test alongside the existing `tests/seo-indexing.test.ts`.

**Phase 2 — Re-triage "Crawled - not indexed" (223, growing) (~S, mostly analysis)**
Re-run the existing `audit-gsc-csvs.mjs` against the 2026-06-01 export to classify the 223. Expect most to be noise (stale `_next/static`, `opengraph-image`, redirected tags). Only a genuine *content* sub-cohort warrants action — and that's content/internal-linking work, not a bug fix (§3.2).

**Phase 3 — Monitor**
Re-export GSC in ~2–4 weeks. Watch redirect-error → 0, crawled-not-indexed noise cohorts fall. Structured-data reports should clear within days of the Phase-1 deploy + re-validate.

---

## 2. Reconciliation — did the April fix work?

Page-indexing "why not indexed", baseline (2026-04-29, from prior spec §3) → now (2026-06-01):

| Reason | Apr-29 | **Jun-01** | Read |
|---|---:|---:|---|
| Page with redirect | 221 | **174** | ↓ improving — intentional tag/event consolidation |
| Blocked by robots.txt | 137 | **121** | ↓ — stale `?dpl=` assets clearing; rest intentional |
| Excluded by noindex | 57 | **77** | ↑ **expected** — the noindex policy taking effect |
| Not found (404) | 30 | **31** | flat — acceptable per lifecycle policy |
| Alternative page w/ canonical | 11 | **10** | flat — canonical working as designed |
| **Crawled - currently not indexed** | 116 | **223** | ↑ **watch** — mostly noise, but growing (§3.2) |
| **Redirect error** | 7 | **7** | flat — **but live-fixed; just needs Validate (§3.1)** |
| Discovered - not indexed | 17 | **6** | ↓ good |

Net: the technical guardrails held. The two things that didn't move (redirect-error, crawled-not-indexed) are a *validation* gap and a *re-crawl/segmentation* job, not new defects.

---

## 3. Issues — indexing coverage

### 3.1 Redirect error (7) — `Validation: Not Started`
- **GSC shows:** 7 URLs, all `/blog/tag/*` (`premier-league`, `rugby`, `pet-friendly`, `dog-friendly` + apex variants).
- **Live today:** every one is a **clean single 301 → 200** (e.g. `premier-league → /blog/tag/sports → 200`; apex `the-anchor.pub/...` rewrites host **and** path in one hop → 200). Verified — see §8.
- **Root cause / owner:** **Google stale data.** The April middleware redirect-flattening (`lib/middleware-redirects.ts`) already fixed the multi-hop chains that caused the error. Validation was never triggered.
- ✅ **Recommended:** In GSC, click **Validate fix** on this report. Monitor to 0. No code.
- **Option B:** Do nothing — Google will eventually re-classify on its own re-crawl (slower, no control).
- **Option C:** Force a re-crawl by re-submitting the 7 URLs via URL Inspection → Request indexing (faster signal, manual, 7×).

### 3.2 Crawled - currently not indexed (223) — biggest, growing
- **Composition (from drill-down patterns):** ~53 `/_next/static/*.css` (stale `?dpl=` asset URLs), ~36 `/blog/tag/*` (redirected/consolidated), `opengraph-image` routes (noindex by design), `/book-table` param variants, a handful of real content pages (`/food-menu`, `/private-hire/near/*`, blog posts).
- **Root cause / owner:** **mixed.** Most is **Google stale data + intentional-noindex/redirect noise** (not indexable by design). A small **content-quality / internal-linking** cohort is real.
- ✅ **Recommended:** Re-run `node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` against the new export to classify the 223 into buckets, then act **only** on the genuine-content rows (internal links + intent-matched copy). Treat asset/OG/redirect rows as monitor-only. (Matches prior `FINAL-SPEC` §1 directive: don't start a broad content rewrite.)
- **Option B:** Add internal links from high-authority pages (home, `/whats-on`, `/food-menu`) to the orphan content pages in this list to push crawl priority — narrower, faster, but doesn't fix thin content.
- **Option C:** Accept and monitor only — most of these are non-indexable noise; revisit after the asset/redirect cohorts clear on re-crawl.

### 3.3 Blocked by robots.txt (121)
- **Composition:** ~88 `/_next/static/*.css` (old `?dpl=` URLs), 22 `/api/calendar`, a few deleted `/test-*` & `/demo-header` pages.
- **Root cause / owner:** `/api/` is **intentionally** disallowed (correct). The `/_next/static` hits are **Google stale data** — the old `Disallow: /*?dpl=*` is gone live (confirmed §8); the current `app/robots.ts` *allows* `/_next/static/`. **Secondary finding:** the live `robots.txt` is now **merged by Cloudflare** — there are **two `User-agent: *` groups** (Cloudflare-managed AI-bot block + the app's). Functional for Googlebot today, but fragile ownership.
- ✅ **Recommended (decided — see §7.3):** Accept (no code) for the asset/API rows — they clear on re-crawl. **Consolidate `robots.txt` into `app/robots.ts`** as the single CI-tested source of truth: replicate the AI-bot `Disallow` groups in code and disable Cloudflare's managed robots.txt, removing the duplicate `User-agent: *` group. Trade-off: the AI-bot list becomes a manual maintenance item.
- **Option B:** Stop emitting crawlable links to `/api/calendar` (remove from any rendered markup) so Google stops discovering them — cosmetic, reduces report noise.
- **Option C:** Consolidate fully into `app/robots.ts` and disable Cloudflare's managed robots.txt, so the repo is the single source of truth (more control; loses Cloudflare's AI-bot block unless re-added in code).

### 3.4 Page with redirect (174)
- **Composition:** ~120 `/blog/tag/*` (consolidation 301s), events, old blog posts, `/food/pizza`.
- **Root cause / owner:** **intentional** — these are the consolidation/lifecycle redirects. "Page with redirect" is an *informational* status, not an error.
- ✅ **Recommended:** Accept. Just confirm none of these redirecting URLs are still listed in `sitemap.xml` or linked internally (the CI test already guards sitemap-vs-redirect).
- **Option B:** Audit internal links and swap any that point at a redirecting URL for the destination directly — removes the hop for users/crawlers (housekeeping).
- **Option C:** Leave entirely — zero risk, the redirects are doing their job.

### 3.5 Excluded by noindex (77)
- **Composition:** blog tag archives + past/retired events.
- **Root cause / owner:** **intentional** (the April noindex policy). Expected to rise.
- ✅ **Recommended:** Spot-check 5–10 to confirm none are pages you actually want indexed; otherwise accept. Do not validate.
- **Option B:** Tighten `isNoindexBlogTag()` if any *valuable* tag landing pages got caught — promote them back to indexable + add to sitemap.
- **Option C:** Accept wholesale — matches documented policy.

### 3.6 Not found 404 (31)
- **Composition:** `/5`, `/private-party-` (malformed trailing dash), stale `/blog/tag/*`, some events. Live: genuine 404s (`/5`, `/private-party-`), some now 308→`/whats-on`.
- **Root cause / owner:** mostly **legitimately-gone URLs** (acceptable per `url-lifecycle-policy.md` case D). `/5` and `/private-party-` smell like a **broken internal/external link source** worth finding.
- ✅ **Recommended:** Grep the codebase + check GSC "Links" for the source of `/5` and `/private-party-`; fix the link or 301 if there's a real destination. Leave the rest as 404 (correct).
- **Option B:** 410 Gone for the confirmed-dead ones to drop them faster (lifecycle case C).
- **Option C:** Accept all as 404 and monitor — lowest effort.

### 3.7 Alternative page with proper canonical tag (10)
- **Composition:** all tracking-param URLs (`/book-table?source=…`, `/whats-on?source=…`, `/blog?…`).
- **Root cause / owner:** **working as intended** — canonical is consolidating param variants correctly. Informational.
- ✅ **Recommended:** Accept. Optionally stop generating internal links that carry tracking params (use the clean URL + GTM dataLayer instead) to reduce variant discovery.
- **Option B:** Add `?source` etc. to GSC URL-parameter handling — deprecated tooling; not recommended.
- **Option C:** Leave — canonical already handles it.

### 3.8 Discovered - currently not indexed (6) — `Passed`
- Accept. Already passing; rolls into Phase-2 monitoring.

---

## 4. Issues — structured data (Enhancements) — **the real new work**

**Shared root cause:** Event/Breadcrumb/JobPosting JSON-LD is **hand-rolled per page with no single source of truth**, so different pages omit different recommended fields. Some use the shared `components/seo/EventSchema.tsx` + `lib/static-events.ts`; others inline their own object literal. The fix is consistency, not 12 one-off patches.

> **Guardrail (SSOT + brand):** do **not** fabricate dates, prices, or performers to satisfy a warning. Every value added must come from `SSOT.md`/`SSOT.json` or confirmed operational fact. Where a value genuinely doesn't exist, the correct fix is to **remove the wrong schema**, not invent data. These are **warnings** (pages stay indexed), not errors.

### 4.1 Events — missing `performer` (4), `validFrom` (3), `price` (2), `url` (1)
- **Affected:** `/mothers-day`, `/easter`, `/christmas-parties`, `/live-sport/world-cup`, `/corporate-events`, `/private-party-venue`. Field gaps differ per page (e.g. `world-cup` only lacks `performer`; `corporate-events`/`private-party-venue` lack offer `price`; `christmas-parties` lacks `performer`/`validFrom`/`url`).
- **Root cause (refined after reading the code):** the schemas are **more complete than the warning count implies** — the gaps are narrow per-field omissions, not missing schema:
  - `mothers-day`: already has dynamic `startDate`/`endDate` + a complete `AggregateOffer` (url, lowPrice, highPrice). **Only `validFrom` is missing** (plus `performer`, which we accept).
  - `christmas-parties`: already has `startDate`/`endDate` + 7 priced `Offer`s. **Missing `validFrom` on all; `url` on 5 of them** (plus `performer`).
  - `corporate-events`/`private-party-venue`: go via `EventSchema`/`staticEvents` — **type mismatch**, they're evergreen service pages, not dated events.
- **⚠ Two date errors found (higher priority than the warnings — they're live factual bugs):**
  - `mothers-day` `page.tsx:32` has `MOTHERS_DAY_DATE = '2027-03-14'`, but the confirmed date is **Sun 7 Mar 2027** (correct Mothering Sunday). Live page + schema show the wrong date → **correct to `2027-03-07`.**
  - `christmas-parties` Event `startDate` is `2026-11-24`, but the service runs **from 1 Nov 2026** → confirm + correct (§7.1).
- ✅ **Recommended (decided — §7.1/§7.2):**
  - `corporate-events`, `private-party-venue`: **drop `Event` schema** (evergreen services). Warnings clear, nothing fabricated.
  - `mothers-day`: fix date to `2027-03-07`; add `offers.validFrom` (date bookings open). `performer` left out.
  - `christmas-parties`: confirm `startDate`; add `validFrom` to every offer and `url` (`https://www.the-anchor.pub/christmas-parties` — the page itself; **no separate Christmas booking URL exists** — Christmas = private hire) to the 5 offers missing it. `performer` left out.
  - `easter`: **remove the Event block** until the 2027 plan is confirmed ("don't know yet").
  - `world-cup`: only the accepted `performer` warning — **no change required.**
- **Option B:** Go further — extract one shared `buildEventSchema()` + season-config module and migrate every event page to it (more upfront work; best defence against future drift).
- **Option C:** Keep `Event` everywhere and accept the residual `performer` warnings — pages stay indexed, just no richer event appearance. Zero effort.

### 4.2 Job Postings — missing `validThrough` (2)
- **Affected:** `/join-our-team/bar-staff`, `/join-our-team/kitchen-team`. `buildJobPostingSchema()` in `app/join-our-team/_components/RecruitmentRolePage.tsx` sets `datePosted` but no `validThrough` (Google recommends it; without it postings can be dropped from Jobs results after ~30 days).
- ✅ **Recommended:** Add a **rolling `validThrough`** computed via `dateUtils` (e.g. `datePosted` + 90 days, or a single config constant refreshed on each ISR rebuild) so it never goes stale. One-line-ish change in the shared builder → fixes both pages.
- **Option B:** Hard-code a fixed future `validThrough` date in `recruitmentContent.ts` and bump it manually each quarter (simple, but needs a recurring reminder or it expires).
- **Option C:** Accept the warning — roles still index as pages, just not as enhanced Job postings.

### 4.3 Breadcrumbs — missing `item` in `itemListElement` (2)
- **Affected:** `/private-hire/near/slough-crematorium`, `/private-hire/near/staines-rugby-club` (the `app/private-hire/near/[slug]/page.tsx` programmatic template).
- **Root cause:** the breadcrumb JSON-LD for the `near/[slug]` template emits a list item without an `item` (absolute URL) — almost certainly the **final/current crumb** (a pattern Google now flags).
- ✅ **Recommended:** Ensure **every** `itemListElement` (including the current page) has a `name` **and** an absolute `item` URL — fix in the shared breadcrumb builder (`components/seo/BreadcrumbJsonLd.tsx` / `lib/schema-helpers.ts`) so it covers all `near/[slug]` pages, not just these two.
- **Option B:** Patch only the `near/[slug]` template's breadcrumb call to pass the URL for the last crumb (narrow, but other templates using the same builder may have the same latent gap).
- **Option C:** Remove `BreadcrumbList` schema from these programmatic pages — clears the warning but loses the breadcrumb rich result.

---

## 5. Issues — Sitemaps

### 5.1 Five sitemaps "Couldn't fetch"
- **Affected:** `dynamic-drinks-sitemap.xml`, `blog-posts-sitemap.xml`, `blog-categories-sitemap.xml`, `dynamic-Events-sitemap.xml`, `pages-sitemap.xml` — all submitted **2023–24** (Wix-era), 0 discovered pages. No code references exist in this repo (grep-confirmed); the live site has no such routes. The current `sitemap.xml` (205 URLs) and `sitemap-priority.xml` (12) both return **Success**.
- **Root cause / owner:** **stale GSC submissions** for URLs that no longer exist. GSC keeps retrying anything ever submitted.
- ✅ **Recommended:** In GSC → Sitemaps, **delete the 5 submissions** (⋮ → Remove sitemap). No code change — they already 404. Keep only `sitemap.xml` (+ `sitemap-priority.xml` if you still want it).
- **Option B:** Additionally add explicit `410 Gone` responses for those 5 paths (defence-in-depth so any old external reference dies cleanly).
- **Option C:** Leave them — harmless "Couldn't fetch" noise, but it clutters the report and muddies monitoring.

---

## 6. Core Web Vitals — no action
Mobile: 104 good, 0 need-improvement, 0 poor. Desktop: effectively no data/all clear. Healthy; nothing to do.

---

## 7. Decisions — RESOLVED (2026-06-01)

1. **`/corporate-events`, `/private-party-venue`:** ✅ **Drop `Event` schema.** Evergreen service pages, not dated events.
2. **Seasonal pages (`/easter`, `/mothers-day`, `/christmas-parties`):** ✅ **Keep `Event`, driven by a per-page season config** updated at the annual renovation. Confirmed: `/christmas-parties` runs **2026-11-01 → 2026-12-23**. `/easter` + `/mothers-day` emit the Event block only with a real next-occurrence date + roast price (from SSOT) — **no fabricated dates/prices**; omit the block between renovations otherwise. `performer` left out for food-only roasts unless real entertainment is confirmed.
3. **`robots.txt` ownership:** ✅ **Consolidate into `app/robots.ts`** (single CI-tested source of truth); replicate AI-bot `Disallow` groups in code and disable Cloudflare's managed robots.txt. Own small PR. Trade-off: AI-bot list becomes manual maintenance.
4. **Scope:** ✅ **Do it all** — Phases 0, 1 and 2 (including the Crawled-not-indexed content cohort).

### 7.1 Data — resolved, plus one open confirmation
- ✅ `/christmas-parties` offer URL: **none exists separately.** Christmas = private hire (SSOT §11); schema correctly uses the page itself (`/christmas-parties`).
- ✅ `/mothers-day`: prices already wired from constants; date to be **corrected to `2027-03-07`** (code currently wrong at `2027-03-14`).
- ✅ `/easter`: Event block **removed** until the 2027 plan is confirmed.
- ✅ `performer`: omitted everywhere (no entertainment confirmed).
- ❓ **Open — please confirm:** `/christmas-parties` Event `startDate` — code says **24 Nov 2026**, you said **1 Nov 2026**. Which is correct? (Offers separately open for booking from 1 Sep 2026.)

---

## 8. Verification & monitoring

**Live evidence captured 2026-06-01 (production):**
- Redirect-error 7/7: clean single 301 → 200. Apex variants rewrite host+path in one hop. ✅
- Future "404" events (`/events/bingo-2026-07-29`, `/events/quiz-night-2026-12-02`): now 308 → `/whats-on` → 200 (not 404). ✅
- Deleted test pages (`/test-hours`, `/demo-header`): clean 404. ✅
- `/hr`: 301 → `/`. ✅
- `robots.txt`: 200; `Disallow: /*?dpl=*` **gone**; `/_next/static/` allowed; Cloudflare-managed block present (double `User-agent: *`).
- `sitemap.xml`: 200, 205 `<loc>`, healthy (no broad noindex tag archives).

**After Phase 0–1 ships, re-verify:** Rich Results Test on one of each fixed page (Event, JobPosting, Breadcrumb); GSC Validate fix on Redirect error + the three Enhancement reports; re-export coverage in 2–4 weeks.

---

## 9. Implementation plan (decisions locked — scope: all phases)

**Phase 0 — GSC operational (you, ~15 min, no code)**
- *Validate fix* → **Redirect error** (7 URLs).
- **Sitemaps** → remove the 5 stale submissions (`dynamic-drinks`, `blog-posts`, `blog-categories`, `dynamic-Events`, `pages`).

**Phase 1 — Structured-data PR** (`fix/structured-data-completeness`, score 3 / M)
1. **Events** (surgical — pages are mostly complete):
   - `mothers-day`: correct date `2027-03-14`→`2027-03-07`; add `offers.validFrom`.
   - `christmas-parties`: add `validFrom` to all offers + `url` to the 5 missing it; correct `startDate` once confirmed (§7.1).
   - `corporate-events`, `private-party-venue`: remove `Event` schema.
   - `easter`: remove `Event` block until 2027 confirmed.
   - `world-cup`: no change (only the accepted `performer` warning).
   - *Optional:* extract a shared `buildEventSchema()` to prevent future drift.
2. **JobPosting** — add rolling `validThrough` (`datePosted` + 90d via `dateUtils`) in `buildJobPostingSchema()`.
3. **Breadcrumbs** — ensure every `itemListElement` (incl. current page) has an absolute `item` URL in the shared builder; verify `private-hire/near/[slug]`.
4. **Tests** — extend `tests/seo-indexing.test.ts`: Event offer completeness, JobPosting `validThrough`, breadcrumb `item` presence.
5. **Verify** — Rich Results Test on one of each; then `npm run lint && npx tsc --noEmit && npm test && npm run build`.
6. **After deploy** — GSC *Validate fix* on Breadcrumbs, Events, Job Postings.

**Phase 1b — robots.txt consolidation** (small separate PR) — move AI-bot + crawl rules into `app/robots.ts`, disable Cloudflare managed robots.txt, keep the robots CI test green.

**Phase 2 — Crawled-not-indexed (223) — ✅ triaged 2026-06-01** via `triage-crawled-not-indexed.mjs` → `crawled-not-indexed-triage-2026-06-01.csv`. Result:
- **212/223 non-actionable** — monitor only, clears on recrawl: 53 static assets, 49 redirect sources, 40 legacy Wix (`/post/`, `/event-details/`), 26 OG-images, 17 param variants, 16 now-redirect-live, 11 intentional noindex.
- **1 broken** — `/private-hire/near` returned 404 (section parent of the `near/[slug]` pages). Fixed: 301 → `/private-hire` (`config/redirects/additional-redirects.json`).
- **10 genuine content pages** (live 200, indexable, not indexed) — owner-driven content/internal-linking task (editorial-team), **not auto-edited** per FINAL-SPEC: `/about/the-anchor-facts`, `/heathrow-parking/terminal-5`, `/blog/tag/heathrow`, `/private-hire/near/ashford-hospital`, `/private-hire/near/stockley-park`, `/events/cash-bingo-night-2026-07-01`, and blog posts `what-is-race-night`, `christening-party-ideas-venues`, `leaving-party-ideas`, `cosy-pub-stanwell`.

**Phase 3 — Monitor** — re-export GSC in 2–4 weeks; track each report toward target.

> **Implemented 2026-06-01** on branch `fix/gsc-structured-data`: Phase 1 (Events, JobPosting, breadcrumbs + tests) and Phase 2 (triage + `/private-hire/near` 301). lint/typecheck/build/SEO-tests pass. **Still outstanding (owner-side):** Phase 0 (GSC — validate Redirect-error [owner doing], remove 5 stale sitemaps), Phase 1b (robots.txt consolidation — blocked on the Cloudflare managed-robots toggle), and the 10 Phase-2 content pages (editorial via editorial-team). Not pushed; no PR opened.

---

## Appendix — issue → owner summary

| Issue | Count | Owner | Action | Code? |
|---|---:|---|---|:--:|
| Redirect error | 7 | Google stale | Validate fix | No |
| Crawled - not indexed | 223 | Mixed | Re-triage; content cohort only | Maybe |
| Blocked by robots.txt | 121 | Intentional + stale | Accept; decide robots ownership | No* |
| Page with redirect | 174 | Intentional | Accept | No |
| Excluded by noindex | 77 | Intentional | Spot-check; accept | No |
| Not found 404 | 31 | Mostly legit-gone | Find `/5` & `/private-party-` source | Maybe |
| Alt page w/ canonical | 10 | Working as intended | Accept | No |
| Event schema gaps | 4+3+2+1 | **New code defect** | Centralise builder / drop wrong type | **Yes** |
| JobPosting validThrough | 2 | **New code defect** | Add rolling validThrough | **Yes** |
| Breadcrumb item | 2 | **New code defect** | Always emit `item` URL | **Yes** |
| Stale sitemaps | 5 | Stale GSC submission | Delete in GSC | No |
| Core Web Vitals | — | Healthy | None | No |
